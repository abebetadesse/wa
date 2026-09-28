import crypto from "node:crypto";
import { and, asc, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { businessCategories, businessMembers, businesses, services, serviceKinds, users } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { requireCapability } from "./access";
import { businessChannel, publish, userChannel } from "@/server/realtime";
import { notify } from "./notifications";

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
    const [created] = await tx
      .insert(businesses)
      .values({ ...input, slug, ownerId: user.id, status: "draft", email: input.email ?? user.email })
      .returning();
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
  const [updated] = await db.update(businesses).set({ ...input, updatedAt: new Date() }).where(eq(businesses.id, businessId)).returning();
  await publish(businessChannel(businessId), "business.updated", { businessId });
  return updated;
}

export async function submitForVerification(user: AuthenticatedUser, businessId: string, input: z.infer<typeof verificationInput>) {
  await requireCapability(user, businessId, "manageProfile");
  const [current] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (!current) throw ApiError.notFound("Business");
  if (current.status === "verified") throw ApiError.conflict("This business is already verified.");
  if (current.status === "suspended") throw ApiError.forbidden("A suspended business cannot request verification.");
  const [activeServices] = await db.select({ n: sql<number>`count(*)::int` }).from(services).where(and(eq(services.businessId, businessId), eq(services.isActive, true)));
  if (!activeServices?.n) throw ApiError.badRequest("Add at least one service before requesting verification.");

  const [updated] = await db
    .update(businesses)
    .set({ status: "pending_verification", verification: { ...(current.verification ?? {}), credentials: input.credentials, submittedAt: new Date().toISOString() }, updatedAt: new Date() })
    .where(eq(businesses.id, businessId))
    .returning();
  return updated;
}

// ── Administration ───────────────────────────────────────────────────────────

export async function listForVerification(status: (typeof BUSINESS_STATUSES)[number] = "pending_verification") {
  return db
    .select({ business: businesses, category: businessCategories.name, ownerEmail: users.email, ownerName: users.name })
    .from(businesses)
    .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
    .innerJoin(users, eq(users.id, businesses.ownerId))
    .where(eq(businesses.status, status))
    .orderBy(asc(businesses.updatedAt));
}

export async function decideVerification(admin: AuthenticatedUser, businessId: string, decision: "verified" | "draft" | "suspended", notes?: string) {
  const [current] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (!current) throw ApiError.notFound("Business");
  const [updated] = await db
    .update(businesses)
    .set({
      status: decision,
      verification: { ...(current.verification ?? {}), reviewedAt: new Date().toISOString(), reviewedBy: admin.id, notes },
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, businessId))
    .returning();
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
  sort: z.enum(["rating", "name", "newest"]).default("rating"),
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
  categorySlug: businessCategories.slug,
  categoryName: businessCategories.name,
  categoryNameAm: businessCategories.nameAm,
  sector: businessCategories.sector,
};

export async function searchDirectory(query: z.infer<typeof directoryQuery>) {
  const conditions: SQL[] = [eq(businesses.status, "verified")];
  if (query.q) {
    const pattern = `%${query.q}%`;
    conditions.push(or(ilike(businesses.name, pattern), ilike(businesses.nameAm, pattern), ilike(businesses.tagline, pattern), ilike(businesses.description, pattern), ilike(businesses.city, pattern))!);
  }
  if (query.category) conditions.push(eq(businessCategories.slug, query.category));
  if (query.sector) conditions.push(eq(businessCategories.sector, query.sector));
  if (query.region) conditions.push(eq(businesses.region, query.region));
  if (query.mode) conditions.push(sql`${businesses.deliveryModes} @> ${JSON.stringify([query.mode])}::jsonb`);
  if (query.language) conditions.push(sql`${businesses.languages} @> ${JSON.stringify([query.language])}::jsonb`);
  const where = and(...conditions);

  const order =
    query.sort === "name" ? [asc(businesses.name)]
    : query.sort === "newest" ? [desc(businesses.createdAt)]
    : [sql`${businesses.ratingAverage} DESC NULLS LAST`, desc(businesses.ratingCount), asc(businesses.name)];

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
    db.select({ total: sql<number>`count(*)::int` }).from(businesses).innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId)).where(where),
  ]);

  return { businesses: rows, total, page: query.page, limit: query.limit, totalPages: Math.max(1, Math.ceil(total / query.limit)) };
}

/** Facets for the directory filters, computed from verified businesses (no hard-coded lists). */
export async function directoryFacets() {
  const [categories, regions, languages] = await Promise.all([
    db
      .select({
        slug: businessCategories.slug,
        name: businessCategories.name,
        nameAm: businessCategories.nameAm,
        sector: businessCategories.sector,
        icon: businessCategories.icon,
        count: sql<number>`count(${businesses.id}) filter (where ${businesses.status} = 'verified')::int`,
      })
      .from(businessCategories)
      .leftJoin(businesses, eq(businesses.categoryId, businessCategories.id))
      .where(eq(businessCategories.isActive, true))
      .groupBy(businessCategories.id)
      .orderBy(asc(businessCategories.sortOrder)),
    db
      .select({ region: businesses.region, count: sql<number>`count(*)::int` })
      .from(businesses)
      .where(and(eq(businesses.status, "verified"), sql`${businesses.region} is not null`))
      .groupBy(businesses.region)
      .orderBy(asc(businesses.region)),
    db.execute<{ language: string; count: number }>(
      sql`select value as language, count(*)::int as count from ${businesses}, jsonb_array_elements_text(${businesses.languages}) where ${businesses.status} = 'verified' group by value order by count desc`,
    ),
  ]);
  return { categories, regions, languages: [...languages] };
}

export async function getPublicBusiness(slug: string, viewer: AuthenticatedUser | null) {
  const [row] = await db
    .select({ business: businesses, category: businessCategories })
    .from(businesses)
    .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
    .where(eq(businesses.slug, slug))
    .limit(1);
  if (!row) throw ApiError.notFound("Business");

  // Unverified listings are visible only to their own team (as a preview).
  if (row.business.status !== "verified") {
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
    services: serviceRows,
    team,
    preview: row.business.status !== "verified",
  };
}

/** Resolves a public slug to a business id (verified businesses only). */
export async function resolvePublicBusinessId(slug: string) {
  const [row] = await db.select({ id: businesses.id }).from(businesses).where(and(eq(businesses.slug, slug), eq(businesses.status, "verified"))).limit(1);
  if (!row) throw ApiError.notFound("Business");
  return row.id;
}

export async function listBusinessesByIds(ids: string[]) {
  if (!ids.length) return [];
  return db.select({ id: businesses.id, name: businesses.name, slug: businesses.slug }).from(businesses).where(inArray(businesses.id, ids));
}
