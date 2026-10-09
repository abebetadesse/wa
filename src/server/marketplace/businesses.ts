import crypto from "node:crypto";
import { and, asc, desc, eq, like, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { businessCategories, businessMembers, businesses, remedies, services, serviceKinds, users } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { requireCapability } from "./access";
import { businessChannel, publish, userChannel } from "@/server/realtime";
import { notify, notifyAdmins } from "./notifications";
import { getSettings } from "@/server/settings";
import { withPublicIntake } from "@/server/intake/settings";
import { insertReturning, updateReturning } from "@/lib/db/write";

const PLATFORM_ADMINS = ["admin", "super_admin"];

/** Cultural (non-healing) listings are shown to administrators only unless the platform opens them to everyone. */
export async function culturalVisibleTo(viewer: Pick<AuthenticatedUser, "role"> | null) {
  if (viewer && PLATFORM_ADMINS.includes(viewer.role)) return true;
  return (await getSettings("marketplace")).culturalVisibility === "everyone";
}

/** Search bar is shown to administrators only unless the platform opens it to everyone. */
export async function searchVisibleTo(viewer: Pick<AuthenticatedUser, "role"> | null) {
  if (viewer && PLATFORM_ADMINS.includes(viewer.role)) return true;
  return (await getSettings("marketplace")).searchVisibility === "everyone";
}

export const DELIVERY_MODES = ["in_person", "home_visit", "video", "voice", "chat"] as const;
export const BUSINESS_STATUSES = ["draft", "pending_verification", "verified", "suspended"] as const;

const text = (max: number) => z.string().trim().max(max);

export const businessInput = z.object({
  categoryId: z.string().uuid("Choose a category."),
  name: text(160).min(2, "Business name is required."),
  nameAm: text(160).optional(),
  tagline: text(240).optional(),
  description: text(5000).optional(),
  region: text(100).optional(),
  city: text(100).optional(),
  address: text(500).optional(),
  phone: text(30).optional(),
  email: z.string().trim().email().optional().or(z.literal("").transform(() => undefined)),
  languages: z.array(z.string().trim().min(2).max(10)).max(10).default([]),
  deliveryModes: z.array(z.enum(DELIVERY_MODES)).default(["in_person"]),
  logoUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  coverUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
});
export type BusinessInput = z.infer<typeof businessInput>;

const bankAccount = z.object({
  bank: text(80).min(2, "Enter the bank name."),
  accountName: text(120).min(2, "Enter the account holder's name."),
  accountNumber: z.string().trim().regex(/^[0-9 -]{6,30}$/, "Enter a valid account number."),
});

/** Where clients can pay the business directly. Shown to clients on their bookings. */
export const paymentAccountsInput = z.object({
  telebirr: z
    .object({ name: text(120).min(2, "Enter the telebirr account name."), phone: z.string().trim().regex(/^(\+?251|0)?[79]\d{8}$/, "Enter a valid telebirr number, e.g. 0911 234567.") })
    .nullable()
    .default(null),
  banks: z.array(bankAccount).max(6).default([]),
  acceptsCash: z.boolean().default(true),
  instructions: text(500).optional(),
});

export async function updatePaymentAccounts(user: AuthenticatedUser, businessId: string, input: z.infer<typeof paymentAccountsInput>) {
  await requireCapability(user, businessId, "manageProfile");
  const [updated] = await updateReturning(db, businesses, { paymentAccounts: input, updatedAt: new Date() }, eq(businesses.id, businessId), { paymentAccounts: businesses.paymentAccounts });
  if (!updated) throw ApiError.notFound("Business");
  await publish(businessChannel(businessId), "business.updated", { businessId });
  return updated.paymentAccounts;
}

export const verificationInput = z.object({
  credentials: z
    .array(z.object({ label: text(160).min(2), issuer: text(160).optional(), reference: text(120).optional() }))
    .min(1, "List at least one credential, license or community endorsement."),
});

export function slugify(name: string) {
  const base = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base && /[a-z0-9]/.test(base) ? base : "business";
}

async function uniqueSlug(name: string) {
  const base = slugify(name);
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${crypto.randomBytes(2).toString("hex")}`;
    const [taken] = await db.select({ id: businesses.id }).from(businesses).where(eq(businesses.slug, candidate)).limit(1);
    if (!taken) return candidate;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

async function requireCategory(categoryId: string) {
  const [category] = await db.select().from(businessCategories).where(and(eq(businessCategories.id, categoryId), eq(businessCategories.isActive, true))).limit(1);
  if (!category) throw ApiError.badRequest("Choose a valid category.");
  return category;
}

// ── Owner / workspace ────────────────────────────────────────────────────────

export async function createBusiness(user: AuthenticatedUser, input: BusinessInput) {
  await requireCategory(input.categoryId);
  const slug = await uniqueSlug(input.name);
  const business = await db.transaction(async (tx) => {
    const [created] = await insertReturning(tx, businesses, { ...input, slug, ownerId: user.id, status: "draft", email: input.email ?? user.email });
    await tx.insert(businessMembers).values({ businessId: created.id, userId: user.id, role: "owner", title: "Owner", isBookable: true });
    return created;
  });
  return business;
}

export async function myBusinesses(user: AuthenticatedUser) {
  return db
    .select({
      id: businesses.id,
      slug: businesses.slug,
      name: businesses.name,
      status: businesses.status,
      logoUrl: businesses.logoUrl,
      role: businessMembers.role,
      category: businessCategories.name,
    })
    .from(businessMembers)
    .innerJoin(businesses, eq(businesses.id, businessMembers.businessId))
    .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
    .where(eq(businessMembers.userId, user.id))
    .orderBy(asc(businesses.name));
}

export async function getWorkspaceBusiness(user: AuthenticatedUser, businessId: string) {
  const membership = await requireCapability(user, businessId, "view");
  const [row] = await db
    .select({ business: businesses, category: businessCategories })
    .from(businesses)
    .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
    .where(eq(businesses.id, businessId))
    .limit(1);
  if (!row) throw ApiError.notFound("Business");
  return { ...row.business, category: row.category, myRole: membership.role };
}

export async function updateBusiness(user: AuthenticatedUser, businessId: string, input: BusinessInput) {
  await requireCapability(user, businessId, "manageProfile");
  await requireCategory(input.categoryId);
  const [updated] = await updateReturning(db, businesses, { ...input, updatedAt: new Date() }, eq(businesses.id, businessId));
  await publish(businessChannel(businessId), "business.updated", { businessId });
  return updated;
}

export async function submitForVerification(user: AuthenticatedUser, businessId: string, input: z.infer<typeof verificationInput>) {
  await requireCapability(user, businessId, "manageProfile");
  const [current] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (!current) throw ApiError.notFound("Business");
  if (current.status === "verified") throw ApiError.conflict("This business is already verified.");
  if (current.status === "suspended") throw ApiError.forbidden("A suspended business cannot request verification.");
  const [activeServices] = await db.select({ n: sql<number>`count(*)` }).from(services).where(and(eq(services.businessId, businessId), eq(services.isActive, true)));
  if (!activeServices?.n) throw ApiError.badRequest("Add at least one service before requesting verification.");
  if ((await getSettings("registration")).telegram === "required_for_business") {
    const [owner] = await db.select({ verifiedAt: users.telegramVerifiedAt }).from(users).where(eq(users.id, current.ownerId)).limit(1);
    if (!owner?.verifiedAt) throw ApiError.badRequest("Connect the owner's Telegram account (Account → Telegram) before requesting verification.", { requires: "telegram" });
  }

  const [updated] = await updateReturning(db, businesses, { status: "pending_verification", verification: { ...(current.verification ?? {}), credentials: input.credentials, submittedAt: new Date().toISOString() }, updatedAt: new Date() }, eq(businesses.id, businessId));
  await notifyAdmins({ type: "business.verification", title: "Business to verify", body: `${current.name} asked to be listed.`, href: "/admin/marketplace" });
  return updated;
}

// ── Administration ───────────────────────────────────────────────────────────

export async function listForVerification(status: (typeof BUSINESS_STATUSES)[number] = "pending_verification") {
  return db
    .select({ business: businesses, category: businessCategories.name, ownerEmail: users.email, ownerName: users.name, ownerTelegramVerifiedAt: users.telegramVerifiedAt })
    .from(businesses)
    .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
    .innerJoin(users, eq(users.id, businesses.ownerId))
    .where(eq(businesses.status, status))
    .orderBy(asc(businesses.updatedAt));
}

export async function decideVerification(admin: AuthenticatedUser, businessId: string, decision: "verified" | "draft" | "suspended", notes?: string) {
  const [current] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (!current) throw ApiError.notFound("Business");
  const [updated] = await updateReturning(db, businesses, {
      status: decision,
      verification: { ...(current.verification ?? {}), reviewedAt: new Date().toISOString(), reviewedBy: admin.id, notes },
      updatedAt: new Date(),
    }, eq(businesses.id, businessId));
  const titles = { verified: "Your business is verified", draft: "Verification needs changes", suspended: "Your business was suspended" };
  await notify(current.ownerId, {
    type: `business.${decision}`,
    title: titles[decision],
    body: notes ?? (decision === "verified" ? `${current.name} is now listed in the marketplace.` : undefined),
    href: `/business/${businessId}/settings`,
  });
  await publish([businessChannel(businessId), userChannel(current.ownerId)], "business.status", { businessId, status: decision });
  return updated;
}

// ── Public directory ─────────────────────────────────────────────────────────

export const directoryQuery = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(80).optional(),
  sector: z.enum(["healing", "cultural"]).optional(),
  region: z.string().trim().max(100).optional(),
  mode: z.enum(DELIVERY_MODES).optional(),
  language: z.string().trim().max(10).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["rating", "name", "newest", "price_asc", "price_desc"]).default("rating"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

const publicColumns = {
  id: businesses.id,
  slug: businesses.slug,
  name: businesses.name,
  nameAm: businesses.nameAm,
  tagline: businesses.tagline,
  region: businesses.region,
  city: businesses.city,
  languages: businesses.languages,
  deliveryModes: businesses.deliveryModes,
  logoUrl: businesses.logoUrl,
  coverUrl: businesses.coverUrl,
  ratingAverage: businesses.ratingAverage,
  ratingCount: businesses.ratingCount,
  demoSample: sql<boolean>`${businesses.description} like '[DEMO SAMPLE]%'`,
  categorySlug: businessCategories.slug,
  categoryName: businessCategories.name,
  categoryNameAm: businessCategories.nameAm,
  sector: businessCategories.sector,
};

export async function searchDirectory(query: z.infer<typeof directoryQuery>, viewer: Pick<AuthenticatedUser, "role"> | null = null) {
  const conditions: SQL[] = [eq(businesses.status, "verified")];
  if (!(await culturalVisibleTo(viewer))) conditions.push(ne(businessCategories.sector, "cultural"));

  if (query.q) {
    const rawQ = query.q.trim();
    const terms = rawQ.split(/\s+/).filter(Boolean);

    for (const term of terms) {
      const termPattern = `%${term}%`;
      conditions.push(
        or(
          like(businesses.name, termPattern),
          like(businesses.nameAm, termPattern),
          like(businesses.tagline, termPattern),
          like(businesses.description, termPattern),
          like(businesses.city, termPattern),
          like(businesses.region, termPattern),
          like(businesses.address, termPattern),
          like(businessCategories.name, termPattern),
          like(businessCategories.nameAm, termPattern),
          like(businessCategories.slug, termPattern),
          sql`exists (
            select 1 from ${services}
            where ${services.businessId} = ${businesses.id}
              and ${services.isActive}
              and (${services.name} like ${termPattern} or ${services.nameAm} like ${termPattern} or ${services.description} like ${termPattern})
          )`,
          sql`exists (
            select 1 from ${services}
            inner join ${serviceKinds} on ${serviceKinds.id} = ${services.kindId}
            where ${services.businessId} = ${businesses.id}
              and ${services.isActive}
              and (${serviceKinds.name} like ${termPattern} or ${serviceKinds.nameAm} like ${termPattern} or ${serviceKinds.slug} like ${termPattern})
          )`,
          sql`exists (
            select 1 from ${remedies}
            where ${remedies.businessId} = ${businesses.id}
              and ${remedies.isActive}
              and (${remedies.name} like ${termPattern} or ${remedies.nameAm} like ${termPattern} or ${remedies.description} like ${termPattern} or ${remedies.form} like ${termPattern})
          )`
        )!
      );
    }
  }

  if (query.category) conditions.push(eq(businessCategories.slug, query.category));
  if (query.sector) conditions.push(eq(businessCategories.sector, query.sector));
  if (query.region) conditions.push(eq(businesses.region, query.region));
  if (query.mode) conditions.push(sql`json_contains(${businesses.deliveryModes}, ${JSON.stringify([query.mode])})`);
  if (query.language) conditions.push(sql`json_contains(${businesses.languages}, ${JSON.stringify([query.language])})`);
  if (query.minPrice !== undefined) {
    conditions.push(sql`(select min(${services.priceEtb}) from ${services} where ${services.businessId} = ${businesses.id} and ${services.isActive}) >= ${query.minPrice}`);
  }
  if (query.maxPrice !== undefined) {
    conditions.push(sql`(select min(${services.priceEtb}) from ${services} where ${services.businessId} = ${businesses.id} and ${services.isActive}) <= ${query.maxPrice}`);
  }

  const where = and(...conditions);

  let order: SQL[];
  if (query.sort === "name") {
    order = [asc(businesses.name)];
  } else if (query.sort === "newest") {
    order = [desc(businesses.createdAt)];
  } else if (query.sort === "price_asc") {
    // Businesses without a priced service go last (MySQL sorts NULL first when ascending).
    const lowest = sql`(select min(${services.priceEtb}) from ${services} where ${services.businessId} = ${businesses.id} and ${services.isActive})`;
    order = [sql`${lowest} is null`, sql`${lowest} asc`];
  } else if (query.sort === "price_desc") {
    order = [sql`(select min(${services.priceEtb}) from ${services} where ${services.businessId} = ${businesses.id} and ${services.isActive}) desc`];
  } else {
    if (query.q) {
      const rawQ = query.q.trim();
      const relevance = sql<number>`(
        case 
          when ${businesses.name} like ${`%${rawQ}%`} then 100
          when ${businesses.nameAm} like ${`%${rawQ}%`} then 90
          when ${businessCategories.name} like ${`%${rawQ}%`} then 80
          when ${businesses.tagline} like ${`%${rawQ}%`} then 70
          when exists (select 1 from ${services} where ${services.businessId} = ${businesses.id} and ${services.isActive} and ${services.name} like ${`%${rawQ}%`}) then 60
          when ${businesses.city} like ${`%${rawQ}%`} then 50
          else 30
        end
      )`;
      order = [desc(relevance), desc(businesses.ratingAverage), desc(businesses.ratingCount), asc(businesses.name)];
    } else {
      order = [desc(businesses.ratingAverage), desc(businesses.ratingCount), asc(businesses.name)];
    }
  }

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        ...publicColumns,
        fromPriceEtb: sql<string | null>`(select min(${services.priceEtb}) from ${services} where ${services.businessId} = ${businesses.id} and ${services.isActive})`,
      })
      .from(businesses)
      .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
      .where(where)
      .orderBy(...order)
      .limit(query.limit)
      .offset((query.page - 1) * query.limit),
    db.select({ total: sql<number>`count(*)` }).from(businesses).innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId)).where(where),
  ]);

  // Up to three service names per business, preferring those that match the search text.
  const matchingServices = new Map<string, string[]>();
  if (rows.length) {
    const text = query.q?.trim();
    const serviceRows = await db
      .select({ businessId: services.businessId, name: services.name })
      .from(services)
      .where(
        and(
          inArray(services.businessId, rows.map((row) => row.id)),
          eq(services.isActive, true),
          text ? or(like(services.name, `%${text}%`), like(services.description, `%${text}%`)) : undefined,
        ),
      )
      .orderBy(asc(services.sortOrder), asc(services.name));
    for (const service of serviceRows) {
      const names = matchingServices.get(service.businessId) ?? [];
      if (names.length < 3 && !names.includes(service.name)) names.push(service.name);
      matchingServices.set(service.businessId, names);
    }
  }

  return {
    businesses: rows.map((row) => ({ ...row, matchingServices: matchingServices.get(row.id) ?? [] })),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

/** Instant autocomplete search suggestions across verified businesses, services, and categories. */
export async function searchSuggestions(queryText: string, viewer: Pick<AuthenticatedUser, "role"> | null = null) {
  const q = queryText.trim();
  const cultural = await culturalVisibleTo(viewer);

  if (!q) {
    return {
      popular: [
        { label: "Awde Negest Astrology", category: "astrology", icon: "sparkles" },
        { label: "Traditional Herbal Remedies", category: "herbalist", icon: "leaf" },
        { label: "Bone Setting & Massage", category: "bone_setting", icon: "heart" },
        { label: "Debtera & Spiritual Guidance", category: "debtera", icon: "book" },
        { label: "Coffee Ceremony & Ritual", query: "Coffee ceremony", icon: "coffee" },
        { label: "Healers in Addis Ababa", query: "Addis Ababa", icon: "map-pin" },
      ],
      businesses: [],
      services: [],
      categories: [],
    };
  }

  const terms = q.split(/\s+/).filter(Boolean);
  const bizConditions: SQL[] = [
    eq(businesses.status, "verified"),
    cultural ? sql`true` : ne(businessCategories.sector, "cultural"),
  ];
  for (const t of terms) {
    const p = `%${t}%`;
    bizConditions.push(
      or(
        like(businesses.name, p),
        like(businesses.nameAm, p),
        like(businesses.city, p),
        like(businessCategories.name, p)
      )!
    );
  }

  const srvConditions: SQL[] = [
    eq(businesses.status, "verified"),
    eq(services.isActive, true),
    cultural ? sql`true` : ne(businessCategories.sector, "cultural"),
  ];
  for (const t of terms) {
    const p = `%${t}%`;
    srvConditions.push(
      or(
        like(services.name, p),
        like(services.nameAm, p),
        like(businesses.name, p)
      )!
    );
  }

  const pattern = `%${q}%`;

  const [matchedBusinesses, matchedServices, matchedCategories] = await Promise.all([
    db
      .select({
        id: businesses.id,
        slug: businesses.slug,
        name: businesses.name,
        nameAm: businesses.nameAm,
        city: businesses.city,
        categoryName: businessCategories.name,
        demoSample: sql<boolean>`${businesses.description} like '[DEMO SAMPLE]%'`,
      })
      .from(businesses)
      .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
      .where(and(...bizConditions))
      .limit(5),

    db
      .select({
        id: services.id,
        name: services.name,
        nameAm: services.nameAm,
        businessName: businesses.name,
        businessSlug: businesses.slug,
        priceEtb: services.priceEtb,
        demoSample: sql<boolean>`${businesses.description} like '[DEMO SAMPLE]%'`,
      })
      .from(services)
      .innerJoin(businesses, eq(businesses.id, services.businessId))
      .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
      .where(and(...srvConditions))
      .limit(5),

    db
      .select({
        slug: businessCategories.slug,
        name: businessCategories.name,
        nameAm: businessCategories.nameAm,
        sector: businessCategories.sector,
      })
      .from(businessCategories)
      .where(
        and(
          cultural ? sql`true` : ne(businessCategories.sector, "cultural"),
          or(
            like(businessCategories.name, pattern),
            like(businessCategories.nameAm, pattern),
            like(businessCategories.slug, pattern)
          )
        )
      )
      .limit(4),
  ]);

  return {
    popular: [],
    businesses: matchedBusinesses,
    services: matchedServices,
    categories: matchedCategories,
  };
}

/**
 * Verified businesses offering a service linked to a care pathway (e.g. readings → spiritual), so a
 * client can book a practitioner who will review their case personally.
 */
export async function practitionersForPathway(domain: string, viewer: Pick<AuthenticatedUser, "role"> | null = null, limit = 6) {
  const conditions: SQL[] = [eq(businesses.status, "verified"), eq(services.isActive, true), eq(serviceKinds.caseDomain, domain)];
  if (!(await culturalVisibleTo(viewer))) conditions.push(ne(businessCategories.sector, "cultural"));
  const rows = await db
    .select({
      ...publicColumns,
      serviceId: services.id,
      serviceName: services.name,
      priceEtb: services.priceEtb,
      durationMinutes: services.durationMinutes,
    })
    .from(services)
    .innerJoin(serviceKinds, eq(serviceKinds.id, services.kindId))
    .innerJoin(businesses, eq(businesses.id, services.businessId))
    .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
    .where(and(...conditions))
    .orderBy(desc(businesses.ratingAverage), desc(businesses.ratingCount), asc(services.priceEtb))
    .limit(limit * 3);
  // One entry per business: its best-matching (cheapest) service.
  const seen = new Set<string>();
  return rows.filter((row) => !seen.has(row.id) && seen.add(row.id)).slice(0, limit);
}

/** Facets for the directory filters, computed from verified businesses (no hard-coded lists). */
export async function directoryFacets(viewer: Pick<AuthenticatedUser, "role"> | null = null) {
  const cultural = await culturalVisibleTo(viewer);
  const [allCategories, regions, languageRows] = await Promise.all([
    db
      .select({
        slug: businessCategories.slug,
        name: businessCategories.name,
        nameAm: businessCategories.nameAm,
        sector: businessCategories.sector,
        icon: businessCategories.icon,
        count: sql<number>`count(case when ${businesses.status} = 'verified' then ${businesses.id} end)`,
      })
      .from(businessCategories)
      .leftJoin(businesses, eq(businesses.categoryId, businessCategories.id))
      .where(eq(businessCategories.isActive, true))
      .groupBy(businessCategories.id)
      .orderBy(asc(businessCategories.sortOrder)),
    db
      .select({ region: businesses.region, count: sql<number>`count(*)` })
      .from(businesses)
      .where(and(eq(businesses.status, "verified"), sql`${businesses.region} is not null`))
      .groupBy(businesses.region)
      .orderBy(asc(businesses.region)),
    db.select({ languages: businesses.languages }).from(businesses).where(eq(businesses.status, "verified")),
  ]);
  // Languages are a JSON list per business; they are counted here rather than unpacked in SQL.
  const languageCounts = new Map<string, number>();
  for (const row of languageRows) for (const language of row.languages ?? []) languageCounts.set(language, (languageCounts.get(language) ?? 0) + 1);
  const languages = [...languageCounts].map(([language, count]) => ({ language, count })).sort((a, b) => b.count - a.count || a.language.localeCompare(b.language));
  const categories = cultural ? allCategories : allCategories.filter((category) => category.sector !== "cultural");
  return { categories, regions, languages, culturalVisible: cultural, searchVisible: await searchVisibleTo(viewer) };
}

export async function getPublicBusiness(slug: string, viewer: AuthenticatedUser | null) {
  const [row] = await db
    .select({ business: businesses, category: businessCategories })
    .from(businesses)
    .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
    .where(eq(businesses.slug, slug))
    .limit(1);
  if (!row) throw ApiError.notFound("Business");

  // Unverified listings (and hidden cultural ones) are visible only to their own team, as a preview.
  const hidden = row.business.status !== "verified" || (row.category.sector === "cultural" && !(await culturalVisibleTo(viewer)));
  if (hidden) {
    const isMember = viewer
      ? (await db.select({ id: businessMembers.id }).from(businessMembers).where(and(eq(businessMembers.businessId, row.business.id), eq(businessMembers.userId, viewer.id))).limit(1)).length > 0
      : false;
    if (!isMember) throw ApiError.notFound("Business");
  }

  const [serviceRows, team] = await Promise.all([
    db
      .select({
        id: services.id,
        name: services.name,
        nameAm: services.nameAm,
        description: services.description,
        durationMinutes: services.durationMinutes,
        priceEtb: services.priceEtb,
        deliveryModes: services.deliveryModes,
        kind: serviceKinds.name,
        kindSlug: serviceKinds.slug,
        requiresSafetyScreen: serviceKinds.requiresSafetyScreen,
        caseDomain: serviceKinds.caseDomain,
      })
      .from(services)
      .innerJoin(serviceKinds, eq(serviceKinds.id, services.kindId))
      .where(and(eq(services.businessId, row.business.id), eq(services.isActive, true)))
      .orderBy(asc(services.sortOrder), asc(services.name)),
    db
      .select({ id: businessMembers.id, name: users.name, title: businessMembers.title, isBookable: businessMembers.isBookable })
      .from(businessMembers)
      .innerJoin(users, eq(users.id, businessMembers.userId))
      .where(and(eq(businessMembers.businessId, row.business.id), eq(businessMembers.isBookable, true))),
  ]);

  const { ownerId: _owner, verification, email: _email, ...business } = row.business;
  return {
    ...business,
    verifiedAt: verification?.reviewedAt ?? null,
    category: { slug: row.category.slug, name: row.category.name, nameAm: row.category.nameAm, sector: row.category.sector },
    services: await withPublicIntake(serviceRows),
    team,
    preview: row.business.status !== "verified",
  };
}

/** Resolves a public slug to a business id (verified businesses only). */
export async function resolvePublicBusinessId(slug: string, viewer: Pick<AuthenticatedUser, "role"> | null = null) {
  const [row] = await db
    .select({ id: businesses.id, sector: businessCategories.sector })
    .from(businesses)
    .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
    .where(and(eq(businesses.slug, slug), eq(businesses.status, "verified")))
    .limit(1);
  if (!row || (row.sector === "cultural" && !(await culturalVisibleTo(viewer)))) throw ApiError.notFound("Business");
  return row.id;
}

export async function listBusinessesByIds(ids: string[]) {
  if (!ids.length) return [];
  return db.select({ id: businesses.id, name: businesses.name, slug: businesses.slug }).from(businesses).where(inArray(businesses.id, ids));
}
