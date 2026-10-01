/**
 * Healer toolkit: pure recommendation rules, plus the full flow against PostgreSQL
 * (skipped when the database is unreachable; everything created is removed).
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { recommendTools, strandAffinity, usageScore } from "../server/toolkit/recommend.ts";
import { builtinTools, toolForPath } from "../server/toolkit/registry.ts";
import { DOMAIN_CONFIGS } from "../server/cases/domains/index.ts";

// ── Database flow ────────────────────────────────────────────────────────────

const { db, pgClient } = await import("../lib/db/index.ts");
const schema = await import("../lib/db/schema/index.ts");
let available = true;
try {
  await pgClient`select 1`;
} catch {
  available = false;
}
const skip = () => !available && "database unavailable";

const toolkit = await import("../server/toolkit/index.ts");
const settings = await import("../server/settings/index.ts");
const businessesSvc = await import("../server/marketplace/businesses.ts");
const catalogue = await import("../server/marketplace/catalogue.ts");
const notifications = await import("../server/marketplace/notifications.ts");

// ── Pure rules ───────────────────────────────────────────────────────────────

const tools = [
  { key: "plants", strands: ["biological", "ecological"], suggestedFor: { categories: ["herbalist"], serviceKinds: ["remedy-preparation"] } },
  { key: "safety", strands: ["medication"], suggestedFor: { categories: ["herbalist"], serviceKinds: ["consultation"] } },
  { key: "gematria", strands: ["cultural", "astrological"], suggestedFor: { categories: ["debtera"], serviceKinds: ["reading"] } },
  { key: "calendar", strands: ["cultural", "astrological"], suggestedFor: { categories: [], serviceKinds: [] } },
];
const base = { categorySlug: "herbalist", serviceKinds: [], bookingsByKind: {}, usage: [], setTools: [] };

test("recommendations follow what the business is and does", () => {
  const herbalist = recommendTools(tools, base).map((r) => r.key);
  assert.deepEqual(herbalist.slice(0, 2).sort(), ["plants", "safety"]);
  assert.ok(!herbalist.includes("gematria"), "no fit, no recommendation");

  const booked = recommendTools(tools, { ...base, serviceKinds: ["remedy-preparation", "consultation"], bookingsByKind: { "remedy-preparation": 12 } });
  assert.equal(booked[0].key, "plants", "services clients actually book weigh most");
  assert.match(booked[0].reasons.join(" "), /booked for \(12/);
});

test("behaviour: a debtera-leaning team gets connected cultural tools", () => {
  const usage = Array.from({ length: 6 }, (_, i) => ({ toolKey: "gematria", ageDays: i }));
  const recs = recommendTools(tools, { ...base, usage }, { exclude: ["gematria"] });
  assert.ok(recs.some((r) => r.key === "calendar" && r.reasons.includes("Close to the knowledge you rely on")), "strand affinity spreads to related tools");
  const affinity = strandAffinity(tools, { ...base, usage });
  assert.equal(affinity.cultural, 1);
  assert.ok(usageScore([{ toolKey: "x", ageDays: 0 }], "x") > usageScore([{ toolKey: "x", ageDays: 60 }], "x"), "recent use counts more");
});

test("registry: every case domain is a care pathway and paths resolve to the most specific tool", () => {
  const registry = builtinTools();
  for (const domain of Object.keys(DOMAIN_CONFIGS)) assert.ok(registry.some((tool) => tool.key === `pathway-${domain}` && tool.group === "care_pathway"), domain);
  assert.equal(new Set(registry.map((tool) => tool.key)).size, registry.length, "keys are unique");
  assert.equal(toolForPath(registry, "/library/hatata/chapter-2")?.key, "hatata-commentary");
  assert.equal(toolForPath(registry, "/library")?.key, "sacred-library");
  assert.equal(toolForPath(registry, "/marketplace"), null);
  assert.ok(registry.every((tool) => !/diagnos|patient|clinic/i.test(`${tool.name} ${tool.description}`)), "no clinical wording");
});

// ── Database tests ─────────────────────────────────────────────────────────────

const run = crypto.randomBytes(4).toString("hex");
const person = (role = "user") => ({ id: crypto.randomUUID(), email: `tk-${run}-${crypto.randomBytes(3).toString("hex")}@example.test`, name: `Toolkit ${role}`, role, permissions: [] });
const owner = person();
const visitor = person();
const admin = { ...person("admin"), role: "admin" };
const created = { businesses: [], sets: [] };
let savedMarketplace;

before(async () => {
  if (!available) return;
  [savedMarketplace] = await db.select().from(schema.platformSettings).where(eq(schema.platformSettings.key, "marketplace"));
  for (const user of [owner, visitor, admin]) await db.insert(schema.users).values({ id: user.id, email: user.email, name: user.name, role: user.role });
});

after(async () => {
  if (!available) return;
  const ids = [owner.id, visitor.id, admin.id];
  if (created.businesses.length) await db.delete(schema.businesses).where(inArray(schema.businesses.id, created.businesses));
  if (created.sets.length) await db.delete(schema.knowledgeSets).where(inArray(schema.knowledgeSets.id, created.sets));
  await db.delete(schema.toolkitTools).where(eq(schema.toolkitTools.source, "custom"));
  await db.delete(schema.platformSettings).where(eq(schema.platformSettings.key, "marketplace"));
  if (savedMarketplace) await db.insert(schema.platformSettings).values({ ...savedMarketplace, updatedBy: null });
  settings.clearSettingsCache();
  await db.delete(schema.notifications).where(inArray(schema.notifications.userId, ids));
  await db.delete(schema.realtimeEvents).where(inArray(schema.realtimeEvents.channel, [...ids.map((id) => `user:${id}`), ...created.businesses.map((id) => `business:${id}`)]));
  await db.delete(schema.users).where(inArray(schema.users.id, ids));
  await pgClient.end({ timeout: 2 });
});

test("tools sync from code and are shown by audience", { skip: skip() }, async () => {
  await toolkit.ensureToolsSynced(true);
  const guest = await toolkit.exploreFor(null);
  const guestTools = guest.groups.flatMap((g) => g.tools);
  assert.ok(guestTools.some((t) => t.key === "pathway-spiritual"), "care pathways are public");
  assert.ok(!guestTools.some((t) => t.audience !== "public"), "visitors see public tools only");
  const adminView = await toolkit.exploreFor(admin);
  assert.ok(adminView.groups.some((g) => g.group === "governance"));
});

test("a herbalist gets its starter set, picks tools, and behaviour shapes recommendations", { skip: skip() }, async () => {
  const categories = await catalogue.listCategories();
  const herbalist = categories.find((c) => c.slug === "herbalist");
  const business = await businessesSvc.createBusiness(owner, { categoryId: herbalist.id, name: `Toolkit Herbal ${run}`, languages: ["am"], deliveryModes: ["in_person"] });
  created.businesses.push(business.id);
  const remedyKind = (await catalogue.listServiceKinds()).find((k) => k.slug === "remedy-preparation");
  await catalogue.saveService(owner, business.id, null, { kindId: remedyKind.id, name: "Remedy", durationMinutes: 30, priceEtb: 200, deliveryModes: ["in_person"], bufferMinutes: 0, isActive: true, sortOrder: 0 });

  let kit = await toolkit.getBusinessToolkit(owner, business.id);
  assert.ok(kit.sets.subscribed.some((s) => s.toolKeys.includes("medicinal-plant-atlas")), "the herbalist set is applied automatically");
  assert.ok(kit.tools.some((t) => t.key === "herb-medicine-safety"));
  await assert.rejects(toolkit.getBusinessToolkit(visitor, business.id), (e) => e.status === 404, "outsiders cannot read a toolkit");

  // Hide one set tool, add and pin another.
  await toolkit.setBusinessTool(owner, business.id, "ecology", { state: "hidden" });
  await toolkit.setBusinessTool(owner, business.id, "energy-pattern", { state: "added", pinned: true });
  kit = await toolkit.getBusinessToolkit(owner, business.id);
  assert.ok(!kit.tools.some((t) => t.key === "ecology"), "hidden even though a set includes it");
  assert.equal(kit.tools[0].key, "energy-pattern", "pinned tools come first");

  // Behaviour: visiting tool pages is recorded (throttled) and shows up in activity and strands.
  assert.equal((await toolkit.trackToolVisit(visitor, "/hexacore")).tracked, false, "people outside businesses are not tracked");
  assert.equal((await toolkit.trackToolVisit(owner, "/hexacore")).toolKey, "hexacore-arcana");
  assert.equal((await toolkit.trackToolVisit(owner, "/hexacore")).tracked, false, "repeat visits within minutes count once");
  kit = await toolkit.getBusinessToolkit(owner, business.id);
  assert.equal(kit.activity.topTools[0].key, "hexacore-arcana");
  console.log("KIT SUBSCRIBED SETS:", kit.sets.subscribed.map(s => ({ name: s.name, toolKeys: s.toolKeys })));
  console.log("KIT TOOLS:", kit.tools.map(t => t.key));
  console.log("KIT RECOMMENDATIONS:", kit.recommendations.map(r => ({ key: r.key, score: r.score, reasons: r.reasons })));
  const hexacore = kit.recommendations.find((r) => r.key === "hexacore-arcana");
  assert.ok(hexacore?.reasons.includes("Your team uses this"), "tools the team uses are recommended");
  assert.ok(kit.strands.some((s) => s.strand === "biological"));
});

test("administrators curate knowledge sets; publishing reaches businesses and respects opt-outs", { skip: skip() }, async () => {
  const business = created.businesses[0];
  const custom = await toolkit.createTool({ name: `Seasonal harvest calendar ${run}`, description: "When to gather each plant.", group: "evidence", href: "/ecology", audience: "practitioner", strands: ["ecological"], suggestedFor: { categories: ["herbalist"], serviceKinds: [] }, isActive: true, sortOrder: 5 });
  await assert.rejects(toolkit.createKnowledgeSet(admin, { name: "Broken", toolKeys: ["no-such-tool"], strands: [], categorySlugs: [] }), (e) => e.status === 400);
  const set = await toolkit.createKnowledgeSet(admin, { name: `Rainy season herbal ${run}`, description: "Kiremt preparation", toolKeys: [custom.key, "fasting-rhythm"], strands: ["ecological"], categorySlugs: ["herbalist"] });
  created.sets.push(set.id);

  let kit = await toolkit.getBusinessToolkit(owner, business);
  assert.ok(!kit.sets.subscribed.some((s) => s.id === set.id), "drafts are not delivered");

  const published = await toolkit.publishKnowledgeSet(admin, set.id, "Added the harvest calendar");
  assert.equal(published.version, 1);
  kit = await toolkit.getBusinessToolkit(owner, business);
  const delivered = kit.sets.subscribed.find((s) => s.id === set.id);
  assert.ok(delivered?.updated, "new version is flagged");
  assert.ok(kit.tools.some((t) => t.key === custom.key), "set tools arrive in the business toolkit");
  assert.ok((await notifications.listNotifications(owner.id)).items.some((n) => n.type === "toolkit.set_updated"));

  await toolkit.setBusinessKnowledgeSet(owner, business, set.id, "remove");
  await toolkit.publishKnowledgeSet(admin, set.id);
  kit = await toolkit.getBusinessToolkit(owner, business);
  assert.ok(!kit.sets.subscribed.some((s) => s.id === set.id), "a removed set is not pushed back");
  assert.ok(kit.sets.available.some((s) => s.id === set.id && s.forYourCategory));

  const tools = await toolkit.listAllTools();
  assert.ok(tools.find((t) => t.key === "hexacore-arcana").opens30 >= 1, "admins see usage");
  await toolkit.updateTool("hexacore-arcana", { ...tools.find((t) => t.key === "hexacore-arcana"), name: "Hexacore reading", suggestedFor: { categories: [], serviceKinds: [] } });
  await toolkit.ensureToolsSynced(true);
  const [row] = await db.select().from(schema.toolkitTools).where(eq(schema.toolkitTools.key, "hexacore-arcana"));
  assert.equal(row.name, "Hexacore reading", "sync keeps administrator edits");
  await toolkit.resetOrDeleteTool("hexacore-arcana");
  const [reset] = await db.select().from(schema.toolkitTools).where(eq(schema.toolkitTools.key, "hexacore-arcana"));
  assert.equal(reset.customized, false);
});

test("cultural listings are hidden from everyone but administrators by default", { skip: skip() }, async () => {
  await settings.updateSettings("marketplace", { culturalVisibility: "admins" }, admin.id);
  const guestFacets = await businessesSvc.directoryFacets(null);
  assert.ok(!guestFacets.categories.some((c) => c.sector === "cultural"));
  assert.equal(guestFacets.culturalVisible, false);
  assert.ok((await businessesSvc.directoryFacets(admin)).categories.some((c) => c.sector === "cultural"));
  const guestSearch = await businessesSvc.searchDirectory({ sector: "cultural", sort: "rating", page: 1, limit: 12 }, null);
  assert.equal(guestSearch.total, 0);
  assert.equal((await toolkit.exploreFor(visitor)).culturalVisible, false);
  await settings.updateSettings("marketplace", { culturalVisibility: "everyone" }, admin.id);
  assert.equal((await businessesSvc.directoryFacets(null)).culturalVisible, true);
});
