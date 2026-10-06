/**
 * Medicine & remedy safety matrix: seed integrity, engine rules, and the database-backed service
 * (skipped when the database is unreachable; test entries are removed).
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { PROPERTY_KEYS, buildMatrix, effectiveCautions, evaluatePair, pairKey, parseCautionCodes } from "../server/safety/rules.ts";
import { SEED_INTERACTIONS, SEED_SUBSTANCES } from "../server/safety/seed.ts";

const { db, dbClient } = await import("../lib/db/index.ts");
const schema = await import("../lib/db/schema/index.ts");
let available = true;
try {
  await dbClient`select 1`;
} catch {
  available = false;
}
const skip = () => !available && "database unavailable";
const safety = await import("../server/safety/index.ts");

const bySlug = new Map(SEED_SUBSTANCES.map((s) => [s.slug, { ...s, cautions: parseCautionCodes(s.cautionCodes) }]));
const curated = new Map(SEED_INTERACTIONS.map((i) => [pairKey(i.a, i.b), i]));
const pair = (a, b) => evaluatePair(bySlug.get(a), bySlug.get(b), curated);

test("seed: an extensive, consistent reference", () => {
  const modern = SEED_SUBSTANCES.filter((s) => s.kind === "modern").length;
  const traditional = SEED_SUBSTANCES.filter((s) => s.kind === "traditional").length;
  assert.ok(modern >= 120, `modern medicines: ${modern}`);
  assert.ok(traditional >= 55, `traditional remedies: ${traditional}`);
  assert.equal(bySlug.size, SEED_SUBSTANCES.length, "slugs are unique");
  for (const s of SEED_SUBSTANCES) for (const p of s.properties) assert.ok(PROPERTY_KEYS.includes(p), `${s.slug}: unknown property ${p}`);
  const seenPairs = new Set();
  for (const i of SEED_INTERACTIONS) {
    assert.ok(bySlug.has(i.a) && bySlug.has(i.b), `interaction refers to unknown item: ${i.a} / ${i.b}`);
    assert.notEqual(i.a, i.b);
    const key = pairKey(i.a, i.b);
    assert.ok(!seenPairs.has(key), `duplicate pair ${key}`);
    seenPairs.add(key);
  }
});

test("documented pairs take precedence and keep their source", () => {
  const result = pair("warfarin", "metronidazole");
  assert.equal(result.severity, "major");
  assert.equal(result.basis, "documented");
  assert.match(result.findings[0].source, /Stockley/);
  assert.equal(pair("sildenafil", "isosorbide-dinitrate").severity, "contraindicated");
  assert.equal(pair("khat", "ampicillin").basis, "documented");
});

test("predictions come from shared properties, in both directions", () => {
  const bleeding = pair("zinjibil", "aspirin");
  assert.equal(bleeding.basis, "predicted");
  assert.equal(bleeding.severity, "moderate");
  assert.deepEqual(pair("aspirin", "zinjibil").severity, bleeding.severity, "symmetric");
  assert.equal(pair("tella", "diazepam").severity, "major", "alcohol + sedative");
  assert.equal(pair("rifampicin", "artemether-lumefantrine").severity, "major");
  assert.equal(pair("azithromycin", "chloroquine").severity, "major", "two QT-prolonging medicines");
  assert.equal(pair("amoxicillin", "paracetamol").severity, null, "no finding for an unrelated pair");
});

test("matrix: counts, verdict and profile alerts", () => {
  const items = ["warfarin", "tena-adam", "paracetamol", "gomen"].map((slug) => bySlug.get(slug));
  const matrix = buildMatrix(items, curated, ["pregnancy"]);
  assert.equal(matrix.checkedPairs, 6);
  assert.equal(matrix.worst, "major");
  assert.equal(matrix.verdict.tone, "danger");
  assert.ok(matrix.items.find((i) => i.slug === "tena-adam").alerts.some((a) => a.condition === "pregnancy" && a.level === "avoid"), "womb-stimulating remedy flagged in pregnancy");
  assert.equal(effectiveCautions(bySlug.get("endod")).children.level, "avoid", "poisonous plants are avoided everywhere");
  assert.equal(buildMatrix([bySlug.get("amoxicillin"), bySlug.get("paracetamol")], curated).verdict.tone, "success");
});

test("cultural content: every Hexacore plant resolves to the right safety entry", async () => {
  const { findByLabel } = await import("../server/safety/match.ts");
  const { ETHIOPIAN_HERBAL_INTEGRATION, CREATION_DAY_MAPPINGS } = await import("../lib/cultural/hexacoreArcana.ts");
  const entries = SEED_SUBSTANCES.map((s) => ({ ...s, scientificName: s.scientificName ?? null, amharicName: s.amharicName ?? null }));
  const expect = (label, slug) => assert.equal(findByLabel(entries, label)?.slug ?? null, slug, label);
  expect("Damakese / Ocimum / ደማከሴ (Damakese)", "damakesse");
  expect("Tenadam / Rue / ጤና አዳም (Tena Adam)", "tena-adam");
  expect("Frankincense / Lubanj / ዕጣን (Itan)", "itan");
  expect("Myrrh / Karbe / ከርቤ (Karbe)", "karbe");
  expect("Withania somnifera (Gizawa / Ashwagandha) / Withania somnifera", "gizawa");
  expect("Something unknown / Planta ignota", null);
  {
    for (const herb of ETHIOPIAN_HERBAL_INTEGRATION) assert.ok(findByLabel(entries, `${herb.herb} / ${herb.scientificName}`), `${herb.herb} is in the safety reference`);
  }
  for (const day of CREATION_DAY_MAPPINGS) assert.ok(findByLabel(entries, day.herb), `${day.herb} is in the safety reference`);
});

// ── Database ─────────────────────────────────────────────────────────────────

const run = crypto.randomBytes(3).toString("hex");
const editor = { id: crypto.randomUUID(), email: `safety-${run}@example.test`, name: "Safety editor", role: "editor", permissions: [] };
const createdSlugs = [];

before(async () => {
  if (!available) return;
  await db.insert(schema.users).values({ id: editor.id, email: editor.email, name: editor.name, role: "editor" });
});

after(async () => {
  if (!available) return;
  if (createdSlugs.length) await db.delete(schema.safetySubstances).where(inArray(schema.safetySubstances.slug, createdSlugs));
  await db.delete(schema.users).where(eq(schema.users.id, editor.id));
  await dbClient.end({ timeout: 2 });
});

test("service: seeded reference, name resolution, matrix and details", { skip: skip() }, async () => {
  await safety.ensureSafetySynced(true);
  const list = await safety.listSubstances();
  assert.ok(list.counts.modern >= 120 && list.counts.traditional >= 55);
  const resolved = await safety.resolveNames(["Coumadin", "ጤና አዳም", "coffee", "zzz-unknown"]);
  assert.deepEqual(resolved.slugs.sort(), ["buna", "tena-adam", "warfarin"]);
  assert.deepEqual(resolved.unmatched, ["zzz-unknown"]);

  const matrix = await safety.computeMatrix({ items: ["metformin"], names: ["Areke", "Glibenclamide"], profile: ["kidney"] });
  assert.equal(matrix.items.length, 3);
  assert.ok(matrix.pairs.some((p) => p.severity === "moderate"));
  assert.ok(matrix.items.find((i) => i.slug === "metformin").alerts.some((a) => a.condition === "kidney"));

  const detail = await safety.substanceDetail("warfarin");
  assert.ok(detail.interactions.length > 20, "warfarin has many known and predicted interactions");
  assert.equal(detail.interactions[0].severity, "major");
  const map = await safety.overview();
  assert.ok(map.groups.includes("Blood thinners"));
  assert.ok(map.rows.find((r) => r.slug === "tena-adam").cells.find((c) => c.group === "Blood thinners").documented);
});

test("booking screen: client medicines against the business's remedies", { skip: skip() }, async () => {
  const screen = await safety.screenBookingSafety({ medicinesText: "Coumadin and metformin, xyzzy tablets", pregnant: true, remedyNames: ["Tena adam powder", "Feto"] });
  assert.ok(screen.flags.some((f) => /Warfarin \+ Tena Adam/.test(f) && /major/.test(f)), "warfarin with the rue remedy");
  assert.ok(screen.flags.some((f) => /avoid in pregnancy/.test(f)));
  assert.ok(screen.flags.some((f) => /xyzzy/.test(f)), "unrecognised medicines are listed for a manual check");
  assert.deepEqual((await safety.screenBookingSafety({ medicinesText: "", remedyNames: [] })).flags, []);
});

test("editors add remedies and documented pairs; changes apply immediately", { skip: skip() }, async () => {
  const remedy = await safety.createSubstance(editor, { name: `Test root ${run}`, kind: "traditional", category: "Medicinal plant", aliases: [`testroot${run}`], properties: ["hypoglycemic"], cautions: {}, status: "published" });
  createdSlugs.push(remedy.slug);
  let matrix = await safety.computeMatrix({ items: [remedy.slug, "insulin"], names: [], profile: [] });
  assert.equal(matrix.pairs[0].basis, "predicted");
  await safety.saveInteraction(editor, { a: "insulin", b: remedy.slug, severity: "major", mechanism: "Test mechanism.", effect: "Test effect.", management: "Test advice.", evidence: "Test", source: "Unit test", status: "published" });
  matrix = await safety.computeMatrix({ items: [remedy.slug, "insulin"], names: [], profile: [] });
  assert.equal(matrix.pairs[0].basis, "documented");
  assert.equal(matrix.pairs[0].severity, "major");
  await assert.rejects(safety.saveInteraction(editor, { a: "insulin", b: "no-such-thing", severity: "minor", mechanism: "x x x", effect: "x x x", management: "x x x", evidence: "x x", source: "x x", status: "published" }), (e) => e.status === 400);
});
