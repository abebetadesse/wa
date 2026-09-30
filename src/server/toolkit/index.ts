/**
 * Healer toolkit service.
 *
 *   Tools           built-in engines (registry.ts), synced into `toolkit_tools` automatically; admins
 *                   can edit wording, audience and fit, hide them, or add their own.
 *   Knowledge sets  admin-curated bundles of tools and strands. Publishing a set bumps its version,
 *                   adds it to every business in its categories and tells subscribers it changed.
 *   Business        each business keeps the tools its sets provide plus ones it adds, can hide or
 *                   pin any, and gets recommendations from what it actually does (recommend.ts).
 *   Behaviour       every tool opened by a team member is recorded (from the toolkit or by simply
 *                   visiting the tool's page) and feeds the recommendations and strand connections.
 */
import { and, asc, desc, eq, gte, inArray, isNotNull, ne, notInArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  bookings,
  businessCategories,
  businessKnowledgeSets,
  businessMembers,
  businessTools,
  businesses,
  knowledgeSets,
  serviceKinds,
  services,
  toolkitTools,
  toolkitUsage,
  workflowCases,
} from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { KNOWLEDGE_STRANDS } from "@/lib/knowledge/catalog";
import { requireCapability, membershipsOf } from "@/server/marketplace/access";
import { notify } from "@/server/marketplace/notifications";
import { culturalVisibleTo } from "@/server/marketplace/businesses";
import { businessChannel, publish } from "@/server/realtime";
import { builtinTools, GROUP_LABELS, TOOL_AUDIENCES, TOOL_GROUPS, toolForPath, type ToolAudience } from "./registry";
import { recommendTools, strandAffinity, usageScore } from "./recommend";

export type ToolRow = typeof toolkitTools.$inferSelect;

const ADMIN_ROLES = ["admin", "super_admin"];
const EXPERT_ROLES = ["expert", "practitioner"];
const USAGE_WINDOW_DAYS = 60;
const USAGE_THROTTLE_MINUTES = 10;

// ── Sync (automatic updates from code) ───────────────────────────────────────

let syncing: Promise<void> | null = null;

/** Adds new built-in tools, refreshes untouched ones and retires removed ones. Runs once per process. */
export function ensureToolsSynced(force = false) {
  if (force || !syncing) {
    syncing = syncBuiltinTools().catch((error) => {
      syncing = null;
      throw error;
    });
  }
  return syncing;
}

async function syncBuiltinTools() {
  const tools = builtinTools();
  await db.transaction(async (tx) => {
    for (const tool of tools) {
      const values = { name: tool.name, description: tool.description, group: tool.group, href: tool.href, audience: tool.audience, strands: tool.strands, suggestedFor: tool.suggestedFor, sortOrder: tool.sortOrder };
      await tx.insert(toolkitTools).values({ key: tool.key, source: "builtin", ...values }).onConflictDoNothing();
      // Administrators' edits win; untouched built-ins follow the code.
      await tx.update(toolkitTools).set({ ...values, updatedAt: new Date() }).where(and(eq(toolkitTools.key, tool.key), eq(toolkitTools.customized, false)));
    }
    await tx
      .update(toolkitTools)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(toolkitTools.source, "builtin"), notInArray(toolkitTools.key, tools.map((tool) => tool.key))));
    const [{ count }] = await tx.select({ count: sql<number>`count(*)::int` }).from(knowledgeSets);
    if (count === 0) await seedStarterSets(tx);
  });
}

/** Ready-made sets for a fresh install; administrators edit or replace them like any other set. */
async function seedStarterSets(tx: Pick<typeof db, "insert">) {
  const now = new Date();
  const starter = [
    { slug: "herbalist-essentials", name: "Herbalist essentials", description: "Plants, preparation cautions and safety checks for remedy work.", toolKeys: ["herb-medicine-safety", "medicinal-plant-atlas", "food-knowledge", "fasting-rhythm", "ecology", "emergency-support"], strands: ["biological", "medication", "ecological", "dietary"], categorySlugs: ["herbalist"] },
    { slug: "debtera-reading", name: "Debtera & spiritual reading", description: "Manuscripts, Ge'ez letters and reflective reading pathways.", toolKeys: ["awde-negest", "geez-gematria-calendar", "sacred-library", "hatata-commentary", "telsem-archive", "pathway-spiritual", "pathway-career", "emergency-support"], strands: ["cultural", "astrological"], categorySlugs: ["debtera", "spiritual-guide"] },
    { slug: "bodywork-bone-setting", name: "Bodywork & bone-setting", description: "Body patterns and safety for hands-on sessions.", toolKeys: ["energy-pattern", "body-awareness", "herb-medicine-safety", "regional-atlas", "emergency-support"], strands: ["biological", "psychological"], categorySlugs: ["bodywork", "bone-setter"] },
    { slug: "ceremony-heritage", name: "Ceremony & heritage", description: "Ritual memory, food traditions and the festival calendar.", toolKeys: ["heritage-atlas", "fasting-rhythm", "food-knowledge", "sacred-library"], strands: ["cultural", "dietary"], categorySlugs: ["coffee-ceremony", "ceremony-events", "music-dance", "heritage-tours", "artisan", "language-manuscripts"] },
  ];
  await tx.insert(knowledgeSets).values(starter.map((set) => ({ ...set, status: "published", version: 1, publishedAt: now, guidance: null }))).onConflictDoNothing();
}

// ── Audiences ────────────────────────────────────────────────────────────────

export async function audiencesFor(user: AuthenticatedUser | null): Promise<ToolAudience[]> {
  if (!user) return ["public"];
  if (ADMIN_ROLES.includes(user.role)) return [...TOOL_AUDIENCES];
  if (EXPERT_ROLES.includes(user.role) || (await membershipsOf(user.id)).length > 0) return ["public", "practitioner"];
  return ["public"];
}

const publicTool = (tool: ToolRow) => ({ key: tool.key, name: tool.name, description: tool.description, group: tool.group, href: tool.href, audience: tool.audience, strands: tool.strands });

/** What the navigation (Explore, footer) shows this viewer. */
export async function exploreFor(user: AuthenticatedUser | null) {
  await ensureToolsSynced();
  const audiences = await audiencesFor(user);
  const rows = await db
    .select()
    .from(toolkitTools)
    .where(and(eq(toolkitTools.isActive, true), inArray(toolkitTools.audience, audiences)))
    .orderBy(asc(toolkitTools.sortOrder), asc(toolkitTools.name));
  return {
    groups: TOOL_GROUPS.map((group) => ({ group, label: GROUP_LABELS[group], tools: rows.filter((row) => row.group === group).map(publicTool) })).filter((entry) => entry.tools.length),
    culturalVisible: await culturalVisibleTo(user),
    isPractitioner: audiences.includes("practitioner"),
  };
}

// ── Administration: tools ────────────────────────────────────────────────────

const strand = z.enum(KNOWLEDGE_STRANDS as [string, ...string[]]);
const slugList = z.array(z.string().trim().min(1).max(80)).max(50);

export const toolInput = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).default(""),
  group: z.enum(TOOL_GROUPS),
  href: z.string().trim().max(500).refine((value) => /^\/[^/]/.test(value) || /^https:\/\//.test(value), "Use a page on this site (starting with /) or an https:// link."),
  audience: z.enum(TOOL_AUDIENCES),
  strands: z.array(strand).max(KNOWLEDGE_STRANDS.length).default([]),
  suggestedFor: z.object({ categories: slugList.default([]), serviceKinds: slugList.default([]) }).default({ categories: [], serviceKinds: [] }),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(100_000).default(1000),
});

export async function listAllTools() {
  await ensureToolsSynced();
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [tools, usage] = await Promise.all([
    db.select().from(toolkitTools).orderBy(asc(toolkitTools.sortOrder), asc(toolkitTools.name)),
    db
      .select({ toolKey: toolkitUsage.toolKey, opens: sql<number>`count(*)::int`, businesses: sql<number>`count(distinct ${toolkitUsage.businessId})::int` })
      .from(toolkitUsage)
      .where(gte(toolkitUsage.createdAt, since))
      .groupBy(toolkitUsage.toolKey),
  ]);
  const byKey = new Map(usage.map((row) => [row.toolKey, row]));
  return tools.map((tool) => ({ ...tool, opens30: byKey.get(tool.key)?.opens ?? 0, businesses30: byKey.get(tool.key)?.businesses ?? 0 }));
}

function toolKey(name: string) {
  return `custom-${name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "tool"}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function createTool(input: z.infer<typeof toolInput>) {
  const [row] = await db.insert(toolkitTools).values({ key: toolKey(input.name), source: "custom", customized: true, ...input }).returning();
  return row;
}

export async function updateTool(key: string, input: z.infer<typeof toolInput>) {
  const [row] = await db.update(toolkitTools).set({ ...input, customized: true, updatedAt: new Date() }).where(eq(toolkitTools.key, key)).returning();
  if (!row) throw ApiError.notFound("Tool");
  return row;
}

/** Built-in tools go back to the code's wording; custom tools are deleted. */
export async function resetOrDeleteTool(key: string) {
  const [row] = await db.select().from(toolkitTools).where(eq(toolkitTools.key, key)).limit(1);
  if (!row) throw ApiError.notFound("Tool");
  if (row.source === "custom") {
    await db.delete(toolkitTools).where(eq(toolkitTools.key, key));
    return { deleted: true };
  }
  await db.update(toolkitTools).set({ customized: false, isActive: true }).where(eq(toolkitTools.key, key));
  await ensureToolsSynced(true);
  return { deleted: false };
}

// ── Administration: knowledge sets ───────────────────────────────────────────

export const knowledgeSetInput = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).default(""),
  toolKeys: z.array(z.string().min(1).max(80)).max(60).default([]),
  strands: z.array(strand).max(KNOWLEDGE_STRANDS.length).default([]),
  categorySlugs: slugList.default([]),
  guidance: z.string().trim().max(4000).optional(),
});

function setSlug(name: string) {
  return `${name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "set"}-${Math.random().toString(36).slice(2, 6)}`;
}

async function assertToolsExist(keys: string[]) {
  if (!keys.length) return;
  const found = await db.select({ key: toolkitTools.key }).from(toolkitTools).where(inArray(toolkitTools.key, keys));
  const missing = keys.filter((key) => !found.some((row) => row.key === key));
  if (missing.length) throw ApiError.badRequest("Some tools no longer exist.", { missing });
}

export async function listKnowledgeSets() {
  await ensureToolsSynced();
  return db
    .select({
      set: knowledgeSets,
      subscribers: sql<number>`(select count(*)::int from ${businessKnowledgeSets} where ${businessKnowledgeSets.setId} = ${knowledgeSets.id} and ${businessKnowledgeSets.status} = 'active')`,
    })
    .from(knowledgeSets)
    .orderBy(asc(knowledgeSets.name))
    .then((rows) => rows.map((row) => ({ ...row.set, subscribers: row.subscribers })));
}

export async function createKnowledgeSet(admin: AuthenticatedUser, input: z.infer<typeof knowledgeSetInput>) {
  await assertToolsExist(input.toolKeys);
  const [row] = await db.insert(knowledgeSets).values({ ...input, slug: setSlug(input.name), createdBy: admin.id, updatedBy: admin.id }).returning();
  return row;
}

/** Edits are saved as a draft of the next version; subscribers see them once published. */
export async function updateKnowledgeSet(admin: AuthenticatedUser, id: string, input: z.infer<typeof knowledgeSetInput>) {
  await assertToolsExist(input.toolKeys);
  const [row] = await db.update(knowledgeSets).set({ ...input, updatedBy: admin.id, updatedAt: new Date() }).where(eq(knowledgeSets.id, id)).returning();
  if (!row) throw ApiError.notFound("Knowledge set");
  return row;
}

/**
 * Publishes the set's current content as a new version: businesses in its categories get it
 * automatically (unless they removed it), and every subscriber is told it was updated.
 */
export async function publishKnowledgeSet(admin: AuthenticatedUser, id: string, note?: string) {
  const { set, subscribers } = await db.transaction(async (tx) => {
    const [set] = await tx
      .update(knowledgeSets)
      .set({ status: "published", version: sql`${knowledgeSets.version} + 1`, publishedAt: new Date(), updatedBy: admin.id, updatedAt: new Date() })
      .where(eq(knowledgeSets.id, id))
      .returning();
    if (!set) throw ApiError.notFound("Knowledge set");
    if (set.categorySlugs.length) {
      const matching = await tx
        .select({ id: businesses.id })
        .from(businesses)
        .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
        .where(and(inArray(businessCategories.slug, set.categorySlugs), ne(businesses.status, "suspended")));
      if (matching.length) {
        await tx.insert(businessKnowledgeSets).values(matching.map((business) => ({ businessId: business.id, setId: set.id, origin: "auto" }))).onConflictDoNothing();
      }
    }
    const subscribers = await tx
      .select({ businessId: businessKnowledgeSets.businessId })
      .from(businessKnowledgeSets)
      .where(and(eq(businessKnowledgeSets.setId, set.id), eq(businessKnowledgeSets.status, "active")));
    if (subscribers.length) await publish(subscribers.map((row) => businessChannel(row.businessId)), "toolkit.updated", { setId: set.id, version: set.version }, tx);
    return { set, subscribers };
  });
  await notifyBusinessLeads(
    subscribers.map((row) => row.businessId),
    { type: "toolkit.set_updated", title: set.version === 1 ? `New knowledge set: ${set.name}` : `${set.name} was updated`, body: note || set.description || undefined },
  );
  return { ...set, subscribers: subscribers.length };
}

export async function archiveKnowledgeSet(id: string) {
  const [row] = await db.update(knowledgeSets).set({ status: "archived", updatedAt: new Date() }).where(eq(knowledgeSets.id, id)).returning();
  if (!row) throw ApiError.notFound("Knowledge set");
  return row;
}

async function notifyBusinessLeads(businessIds: string[], input: { type: string; title: string; body?: string }) {
  if (!businessIds.length) return;
  const leads = await db
    .select({ userId: businessMembers.userId, businessId: businessMembers.businessId })
    .from(businessMembers)
    .where(and(inArray(businessMembers.businessId, businessIds), inArray(businessMembers.role, ["owner", "manager", "practitioner"])));
  await Promise.all(leads.map((lead) => notify(lead.userId, { ...input, href: `/business/${lead.businessId}/toolkit` }).catch(() => null)));
}

// ── Business toolkit ─────────────────────────────────────────────────────────

/** Adds published sets meant for the business's category (new businesses, category changes). */
async function applyCategorySets(businessId: string, categorySlug: string) {
  const sets = await db
    .select({ id: knowledgeSets.id })
    .from(knowledgeSets)
    .where(and(eq(knowledgeSets.status, "published"), sql`${knowledgeSets.categorySlugs} @> ${JSON.stringify([categorySlug])}::jsonb`));
  if (sets.length) await db.insert(businessKnowledgeSets).values(sets.map((set) => ({ businessId, setId: set.id, origin: "auto" }))).onConflictDoNothing();
}

async function businessProfile(businessId: string) {
  const [row] = await db
    .select({ id: businesses.id, name: businesses.name, categorySlug: businessCategories.slug, categoryName: businessCategories.name, sector: businessCategories.sector })
    .from(businesses)
    .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
    .where(eq(businesses.id, businessId))
    .limit(1);
  if (!row) throw ApiError.notFound("Business");
  return row;
}

async function signalsFor(businessId: string, categorySlug: string) {
  const since90 = new Date(Date.now() - 90 * 86_400_000);
  const sinceUsage = new Date(Date.now() - USAGE_WINDOW_DAYS * 86_400_000);
  const [offered, booked, usage, cases] = await Promise.all([
    db
      .selectDistinct({ slug: serviceKinds.slug })
      .from(services)
      .innerJoin(serviceKinds, eq(serviceKinds.id, services.kindId))
      .where(and(eq(services.businessId, businessId), eq(services.isActive, true))),
    db
      .select({ slug: serviceKinds.slug, count: sql<number>`count(*)::int` })
      .from(bookings)
      .innerJoin(services, eq(services.id, bookings.serviceId))
      .innerJoin(serviceKinds, eq(serviceKinds.id, services.kindId))
      .where(and(eq(bookings.businessId, businessId), gte(bookings.createdAt, since90), notInArray(bookings.status, ["declined", "cancelled"])))
      .groupBy(serviceKinds.slug),
    db
      .select({ toolKey: toolkitUsage.toolKey, createdAt: toolkitUsage.createdAt })
      .from(toolkitUsage)
      .where(and(eq(toolkitUsage.businessId, businessId), gte(toolkitUsage.createdAt, sinceUsage)))
      .orderBy(desc(toolkitUsage.createdAt))
      .limit(2000),
    db
      .select({ domain: workflowCases.domain, count: sql<number>`count(*)::int` })
      .from(workflowCases)
      .where(and(eq(workflowCases.businessId, businessId), isNotNull(workflowCases.businessId)))
      .groupBy(workflowCases.domain),
  ]);
  const now = Date.now();
  return {
    categorySlug,
    serviceKinds: offered.map((row) => row.slug),
    bookingsByKind: Object.fromEntries(booked.map((row) => [row.slug, row.count])),
    usage: usage.map((row) => ({ toolKey: row.toolKey, ageDays: (now - row.createdAt.getTime()) / 86_400_000 })),
    caseDomains: Object.fromEntries(cases.map((row) => [row.domain, row.count])),
  };
}

export async function getBusinessToolkit(user: AuthenticatedUser, businessId: string) {
  await requireCapability(user, businessId, "view");
  await ensureToolsSynced();
  const business = await businessProfile(businessId);
  await applyCategorySets(businessId, business.categorySlug);

  const audiences = await audiencesFor(user);
  const [tools, choices, subscriptions, published] = await Promise.all([
    db.select().from(toolkitTools).where(and(eq(toolkitTools.isActive, true), inArray(toolkitTools.audience, audiences))).orderBy(asc(toolkitTools.sortOrder)),
    db.select().from(businessTools).where(eq(businessTools.businessId, businessId)),
    db
      .select({ link: businessKnowledgeSets, set: knowledgeSets })
      .from(businessKnowledgeSets)
      .innerJoin(knowledgeSets, eq(knowledgeSets.id, businessKnowledgeSets.setId))
      .where(and(eq(businessKnowledgeSets.businessId, businessId), eq(businessKnowledgeSets.status, "active"), eq(knowledgeSets.status, "published"))),
    db.select().from(knowledgeSets).where(eq(knowledgeSets.status, "published")).orderBy(asc(knowledgeSets.name)),
  ]);

  const byKey = new Map(tools.map((tool) => [tool.key, tool]));
  const hidden = new Set(choices.filter((choice) => choice.state === "hidden").map((choice) => choice.toolKey));
  const pinned = new Set(choices.filter((choice) => choice.pinned).map((choice) => choice.toolKey));
  const added = choices.filter((choice) => choice.state === "added").map((choice) => choice.toolKey);
  const fromSets = new Map<string, string[]>();
  for (const { set } of subscriptions) for (const key of set.toolKeys) fromSets.set(key, [...(fromSets.get(key) ?? []), set.name]);

  const signals = { ...(await signalsFor(businessId, business.categorySlug)), setTools: [...fromSets.keys()] };
  const mine = [...new Set([...fromSets.keys(), ...added])].filter((key) => byKey.has(key) && !hidden.has(key));
  const scoring = tools.map((tool) => ({ key: tool.key, strands: tool.strands, suggestedFor: tool.suggestedFor }));
  const ranked = new Map(recommendTools(scoring, signals).map((entry) => [entry.key, entry]));

  const myTools = mine
    .map((key) => {
      const tool = byKey.get(key)!;
      return {
        ...publicTool(tool),
        pinned: pinned.has(key),
        sets: fromSets.get(key) ?? [],
        added: added.includes(key),
        opens: signals.usage.filter((event) => event.toolKey === key).length,
        score: ranked.get(key)?.score ?? 0,
      };
    })
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.score - a.score || a.name.localeCompare(b.name));

  const recommendations = recommendTools(scoring, signals, { exclude: [...mine, ...hidden], limit: 6 }).map((entry) => ({ ...publicTool(byKey.get(entry.key)!), reasons: entry.reasons, score: entry.score }));

  // Knowledge strands connected to this business, with the tools that feed each one.
  const affinity = strandAffinity(scoring, signals);
  for (const { set } of subscriptions) for (const name of set.strands) affinity[name] = Math.max(affinity[name] ?? 0, 0.3);
  const strands = Object.entries(affinity)
    .sort((a, b) => b[1] - a[1])
    .map(([name, weight]) => ({ strand: name, weight, tools: myTools.filter((tool) => tool.strands.includes(name)).map((tool) => tool.key) }));

  const subscribedIds = new Set(subscriptions.map(({ set }) => set.id));
  return {
    business: { id: business.id, name: business.name, category: business.categoryName, categorySlug: business.categorySlug },
    tools: myTools,
    hidden: [...hidden].filter((key) => byKey.has(key)).map((key) => publicTool(byKey.get(key)!)),
    recommendations,
    strands,
    sets: {
      subscribed: subscriptions.map(({ set, link }) => ({ id: set.id, name: set.name, description: set.description, guidance: set.guidance, version: set.version, updated: set.version > link.seenVersion, origin: link.origin, toolKeys: set.toolKeys.filter((key) => byKey.has(key)), strands: set.strands })),
      available: published
        .filter((set) => !subscribedIds.has(set.id))
        .map((set) => ({ id: set.id, name: set.name, description: set.description, version: set.version, forYourCategory: set.categorySlugs.includes(business.categorySlug), toolKeys: set.toolKeys.filter((key) => byKey.has(key)), strands: set.strands }))
        .sort((a, b) => Number(b.forYourCategory) - Number(a.forYourCategory)),
    },
    catalogue: tools.map(publicTool),
    activity: { opens60: signals.usage.length, topTools: topTools(signals.usage, byKey) },
  };
}

function topTools(usage: { toolKey: string; ageDays: number }[], byKey: Map<string, ToolRow>) {
  return [...new Set(usage.map((event) => event.toolKey))]
    .filter((key) => byKey.has(key))
    .map((key) => ({ key, name: byKey.get(key)!.name, weight: Math.round(usageScore(usage, key) * 10) / 10 }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);
}

export const toolChoiceInput = z.object({ state: z.enum(["added", "hidden", "default"]).optional(), pinned: z.boolean().optional() });

export async function setBusinessTool(user: AuthenticatedUser, businessId: string, key: string, input: z.infer<typeof toolChoiceInput>) {
  await requireCapability(user, businessId, "manageToolkit");
  const [tool] = await db.select({ key: toolkitTools.key }).from(toolkitTools).where(eq(toolkitTools.key, key)).limit(1);
  if (!tool) throw ApiError.notFound("Tool");
  if (input.state === "default" && input.pinned === undefined) {
    await db.delete(businessTools).where(and(eq(businessTools.businessId, businessId), eq(businessTools.toolKey, key)));
  } else {
    const state = input.state && input.state !== "default" ? input.state : undefined;
    await db
      .insert(businessTools)
      .values({ businessId, toolKey: key, state: state ?? "added", pinned: input.pinned ?? false })
      .onConflictDoUpdate({
        target: [businessTools.businessId, businessTools.toolKey],
        set: { ...(state ? { state } : {}), ...(input.pinned !== undefined ? { pinned: input.pinned } : {}), updatedAt: new Date() },
      });
  }
  await publish(businessChannel(businessId), "toolkit.changed", { toolKey: key });
  return { ok: true };
}

export const setChoiceInput = z.object({ action: z.enum(["subscribe", "remove", "seen"]) });

export async function setBusinessKnowledgeSet(user: AuthenticatedUser, businessId: string, setId: string, action: z.infer<typeof setChoiceInput>["action"]) {
  await requireCapability(user, businessId, action === "seen" ? "view" : "manageToolkit");
  const [set] = await db.select().from(knowledgeSets).where(eq(knowledgeSets.id, setId)).limit(1);
  if (!set || set.status !== "published") throw ApiError.notFound("Knowledge set");
  if (action === "seen") {
    await db.update(businessKnowledgeSets).set({ seenVersion: set.version, updatedAt: new Date() }).where(and(eq(businessKnowledgeSets.businessId, businessId), eq(businessKnowledgeSets.setId, setId)));
  } else {
    const status = action === "subscribe" ? "active" : "removed";
    await db
      .insert(businessKnowledgeSets)
      .values({ businessId, setId, origin: "manual", status, seenVersion: set.version })
      .onConflictDoUpdate({ target: [businessKnowledgeSets.businessId, businessKnowledgeSets.setId], set: { status, seenVersion: set.version, updatedAt: new Date() } });
  }
  await publish(businessChannel(businessId), "toolkit.changed", { setId });
  return { ok: true };
}

// ── Behaviour ────────────────────────────────────────────────────────────────

async function recordUsage(userId: string, businessIds: string[], key: string) {
  if (!businessIds.length) return 0;
  const recent = await db
    .select({ businessId: toolkitUsage.businessId })
    .from(toolkitUsage)
    .where(
      and(
        eq(toolkitUsage.userId, userId),
        eq(toolkitUsage.toolKey, key),
        inArray(toolkitUsage.businessId, businessIds),
        gte(toolkitUsage.createdAt, new Date(Date.now() - USAGE_THROTTLE_MINUTES * 60_000)),
      ),
    );
  const fresh = businessIds.filter((id) => !recent.some((row) => row.businessId === id));
  if (fresh.length) await db.insert(toolkitUsage).values(fresh.map((businessId) => ({ businessId, userId, toolKey: key })));
  return fresh.length;
}

/** Records a visit to a tool page by someone who works in one or more businesses. */
export async function trackToolVisit(user: AuthenticatedUser, pathname: string, businessId?: string) {
  const memberships = await membershipsOf(user.id);
  if (!memberships.length) return { tracked: false };
  await ensureToolsSynced();
  const tools = await db.select({ key: toolkitTools.key, href: toolkitTools.href }).from(toolkitTools).where(eq(toolkitTools.isActive, true));
  const tool = toolForPath(tools, pathname);
  if (!tool) return { tracked: false };
  const targets = businessId ? memberships.filter((m) => m.businessId === businessId).map((m) => m.businessId) : memberships.map((m) => m.businessId);
  const recorded = await recordUsage(user.id, targets, tool.key);
  return { tracked: recorded > 0, toolKey: tool.key };
}

// ── Insights for administrators ──────────────────────────────────────────────

export async function toolkitInsights() {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [byCategory, activeBusinesses] = await Promise.all([
    db
      .select({ category: businessCategories.name, toolKey: toolkitUsage.toolKey, name: toolkitTools.name, opens: sql<number>`count(*)::int` })
      .from(toolkitUsage)
      .innerJoin(businesses, eq(businesses.id, toolkitUsage.businessId))
      .innerJoin(businessCategories, eq(businessCategories.id, businesses.categoryId))
      .innerJoin(toolkitTools, eq(toolkitTools.key, toolkitUsage.toolKey))
      .where(gte(toolkitUsage.createdAt, since))
      .groupBy(businessCategories.name, toolkitUsage.toolKey, toolkitTools.name)
      .orderBy(desc(sql`count(*)`)),
    db.select({ n: sql<number>`count(distinct ${toolkitUsage.businessId})::int` }).from(toolkitUsage).where(gte(toolkitUsage.createdAt, since)).then(([row]) => row.n),
  ]);
  const categories = new Map<string, { toolKey: string; name: string; opens: number }[]>();
  for (const row of byCategory) categories.set(row.category, [...(categories.get(row.category) ?? []), { toolKey: row.toolKey, name: row.name, opens: row.opens }].slice(0, 5));
  return { activeBusinesses, byCategory: [...categories].map(([category, tools]) => ({ category, tools })) };
}
