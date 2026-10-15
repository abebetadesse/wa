import { test } from "node:test";
import assert from "node:assert/strict";
import { buildFoodHerbReview, foodHerbWarnings, matchCatalogue, matchNames, resolveItems, splitTypedNames } from "../server/cases/foodHerb.ts";
import { readRecognition, recognisePhoto } from "../server/cases/photoRecognition.ts";
import { buildCaseAnalysis } from "../server/cases/analysis.ts";
import { buildEnhancedReportSections } from "../server/cases/reportEnhancer.ts";
import { createCaseService } from "../server/cases/service.ts";
import { createMemoryCaseStore } from "../server/cases/store.ts";
import { reviewerNotice } from "../server/cases/notices.ts";

const NOW = new Date("2026-10-15T08:00:00Z");
const owner = { id: "user-1", role: "user", permissions: [] };
const admin = { id: "admin-1", role: "admin", permissions: ["cases:review"] };
const NARRATIVE = "I have felt tired and weak for three weeks, and I get dizzy when I stand up. I am fasting and eat mostly injera with shiro.";

const note = (kind, ids, extra = {}) => ({ id: `note-${ids.join("-")}`, kind, items: resolveItems(kind, ids), source: "photo", at: NOW.toISOString(), ...extra });
const firstId = (kind, name) => matchCatalogue(kind, name)[0]?.id;

// ── Catalogue matching ───────────────────────────────────────────────────────

test("matching: dish and plant names find catalogue entries, in Latin or Ethiopic script and common spellings", () => {
  assert.match(matchCatalogue("meal", "shiro wat")[0].name, /^Shiro Wot/);
  assert.ok(matchCatalogue("meal", "injera").every((match) => /injera/i.test(match.name)), "injera finds injera variants");
  assert.ok(matchCatalogue("meal", "injera").length >= 2, "several injera variants are offered for the person to choose from");
  assert.equal(firstId("herb", "tena adam"), "ruta-chalepensis-tena-adam");
  assert.equal(firstId("herb", "ጤና አዳም"), "ruta-chalepensis-tena-adam");
  assert.equal(firstId("herb", "Ruta chalepensis"), "ruta-chalepensis-tena-adam");
  assert.deepEqual(matchCatalogue("herb", "pizza"), []);
  assert.deepEqual(matchCatalogue("meal", "x"), []);
});

test("matching: several names give one list without duplicates; typed lists split on commas and Ethiopic separators", () => {
  assert.deepEqual(splitTypedNames("injera, shiro wot;\nጤና አዳም፣ kosso"), ["injera", "shiro wot", "ጤና አዳም", "kosso"]);
  const matches = matchNames("meal", ["shiro", "shiro wot", "misir wot"]);
  assert.equal(new Set(matches.map((match) => match.id)).size, matches.length);
  assert.ok(matches.some((match) => /^Misir Wot/.test(match.name)));
});

test("matching: stored names come from the catalogue, never from the client", () => {
  const shiro = firstId("meal", "shiro wot");
  assert.deepEqual(resolveItems("meal", [shiro, shiro, "made-up-id", "<script>"]).map((item) => item.id), [shiro]);
  assert.deepEqual(resolveItems("herb", [shiro]), [], "a food id is not accepted as a plant");
});

// ── Photo recognition ────────────────────────────────────────────────────────

test("recognition: a photo showing a person is refused; replies are reduced to short, confident names", () => {
  assert.deepEqual(readRecognition({ showsPerson: true, items: [{ name: "injera" }] }), { status: "person" });
  assert.deepEqual(readRecognition("not json"), { status: "unclear" });
  assert.deepEqual(readRecognition({ showsPerson: false, items: [] }), { status: "unclear" });
  const read = readRecognition({ showsPerson: false, items: [{ name: " injera\n", confidence: 0.9 }, { name: "maybe a spoon", confidence: 0.1 }, { name: "x".repeat(200) }, { name: 5 }, { name: "injera" }] });
  assert.equal(read.status, "recognised");
  assert.deepEqual(read.names, ["injera", "x".repeat(60)]);
});

test("recognition: the photo goes to the vision model once, as an image, and only names come back", async () => {
  const calls = [];
  const photo = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3])], { type: "image/jpeg" });
  const result = await recognisePhoto(photo, "herb", {
    ask: async (prompt, imageUrl) => {
      calls.push({ prompt, imageUrl });
      return { showsPerson: false, items: [{ name: "Tena Adam", confidence: 0.8 }] };
    },
  });
  assert.equal(calls.length, 1);
  assert.match(calls[0].imageUrl, /^data:image\/jpeg;base64,/);
  assert.match(calls[0].prompt, /person, face or body part/);
  assert.match(calls[0].prompt, /Tena Adam/, "plant names from the reference are offered to the model");
  assert.deepEqual(result, { status: "recognised", names: ["Tena Adam"] });
  await assert.rejects(() => recognisePhoto(photo, "meal", { ask: async () => { throw new Error("down"); } }), /down/);
});

// ── What the reviewer reads ──────────────────────────────────────────────────

test("review: foods carry composition; plants carry safety and interactions, matched to the profile without naming medicines", () => {
  const tenaAdam = "ruta-chalepensis-tena-adam";
  const shiro = firstId("meal", "shiro wot");
  const profile = { medications: ["Warfarin 5mg"], pregnant: true, conditions: ["Type 2 diabetes"], wellbeing: { allergies: [] } };
  const review = buildFoodHerbReview([note("meal", [shiro], { note: "Every day for lunch" }), note("herb", [tenaAdam])], profile);

  assert.equal(review.meals.length, 1);
  assert.ok(review.meals[0].nutrients.length > 0 && /per 100 g/.test(review.meals[0].nutrients[0]));
  assert.match(review.meals[0].glycemic, /Glycaemic index \d+/);
  assert.deepEqual(review.notes, ["Every day for lunch"]);

  const herb = review.herbs[0];
  assert.equal(herb.name, "Tena Adam");
  assert.ok(herb.interactions.some((interaction) => interaction.onProfile && /Anticoagulants/.test(interaction.drugClass)), "the warfarin on the profile is matched to its class");
  assert.ok(review.cautions.some((line) => /pregnancy or breastfeeding/.test(line)));
  assert.ok(review.cautions.some((line) => /anticoagulants.*profile lists a medicine of that kind/.test(line)));
  assert.ok(!JSON.stringify(review.cautions).match(/warfarin 5mg|type 2 diabetes/i), "raw profile values are never repeated");

  assert.equal(buildFoodHerbReview([], profile), undefined);
  assert.equal(buildFoodHerbReview([note("herb", [])], {}), undefined);
  assert.deepEqual(buildFoodHerbReview([note("herb", [tenaAdam])], {}).cautions, [], "no profile, no profile cautions");
});

test("review: a strictly poisonous plant stops report generation until the reviewer has spoken to the person", () => {
  const review = buildFoodHerbReview([note("herb", ["datura-stramonium-astenagir"])], {});
  assert.equal(review.herbs[0].safety, "strictly_poisonous");
  assert.ok(review.cautions.some((line) => /Ask how it is being used/.test(line)));
  assert.equal(foodHerbWarnings(review).length, 1);
  assert.deepEqual(foodHerbWarnings(buildFoodHerbReview([note("herb", ["ruta-chalepensis-tena-adam"])], {})), []);
});

test("analysis: confirmed foods and plants become statements, themes and a reviewer section; the report never gives a dose", async () => {
  const { DOMAIN_CONFIGS } = await import("../server/cases/domains/index.ts");
  const { createCase } = await import("../server/cases/machine.ts");
  const config = DOMAIN_CONFIGS.biological;
  const record = {
    ...createCase({ id: "case-1", userId: "user-1", config, safetyAnswers: { urgentSymptoms: "no" }, answers: { urgentSymptoms: "no", caseNarrative: "I feel tired." } }),
    foodHerbNotes: [note("meal", [firstId("meal", "shiro wot")]), note("herb", ["ruta-chalepensis-tena-adam"], { note: "I drink it as tea for my stomach" })],
  };
  const analysis = await buildCaseAnalysis(record, config, { medications: ["warfarin"] }, { now: () => NOW });
  const factors = analysis.factors.map((factor) => factor.id);
  assert.ok(factors.includes("food"), "a meal photo raises the eating theme");
  assert.ok(factors.includes("medication"), "a remedy raises the medicines theme");
  assert.ok(analysis.foodAndHerbs.herbs[0].interactions.some((interaction) => interaction.onProfile));
  assert.match(analysis.narrative.excerpt, /tea for my stomach/);

  const sections = buildEnhancedReportSections({ ...analysis, safety: { ...analysis.safety, warnings: [] } }, true);
  const shared = sections.find((entry) => entry.id === "analysis-food-herbs");
  assert.ok(shared, "the report has a section for what the person shared");
  assert.match(shared.body, /photos were not kept/);
  assert.ok(shared.items.some((item) => /Tena Adam/.test(item) && /pharmacist|health provider/.test(item)));
  assert.ok(!JSON.stringify(shared).match(/cup|dose of|steeped|empty stomach/i), "no preparation or dose is suggested");

  const reflection = buildEnhancedReportSections({ ...analysis, publishScope: "reflection_only" }, true);
  assert.ok(!reflection.some((entry) => entry.id === "analysis-food-herbs"), "reflection-only reports have no food or plant section");
});

// ── The case owner's flow ────────────────────────────────────────────────────

function desk(vision = null) {
  const store = createMemoryCaseStore();
  const notices = [];
  let analyses = 0;
  const svc = createCaseService({
    store,
    billing: { pricing: async () => ({ reportEtb: 0, consultationEtb: 0 }), checkout: async () => ({ purchaseId: "p", checkoutUrl: "" }), submitManual: async () => ({ purchaseId: "p" }), verify: async () => ({ paid: false }), latest: async () => null },
    loadExpert: async (id) => ({ id, role: "admin" }),
    expertSummaries: async () => new Map(),
    bridge: { resolveBookingForCase: async () => ({}), linkBooking: async () => {}, onCaseEvent: async () => {}, canReviewForBusiness: async () => false },
    defaultRole: async () => "admin",
    analyse: async (record, config) => {
      analyses++;
      return buildCaseAnalysis(record, config, {}, { now: () => NOW });
    },
    notifyFoodHerb: async (record) => void notices.push(reviewerNotice(record, "Wellbeing", "food_herb")),
    vision: () => vision,
  });
  return { svc, store, notices, analyses: () => analyses };
}

async function biologicalCase(svc) {
  const started = await svc.start(owner, "biological", { safetyAnswers: { urgentSymptoms: "no" }, answers: { urgentSymptoms: "no", caseNarrative: NARRATIVE } });
  return started;
}

test("owner flow: identify suggests entries and saves nothing; confirmed names are kept and refresh the analysis", async () => {
  let asked = 0;
  const { svc, store, notices, analyses } = desk({ ask: async () => (asked++, { showsPerson: false, items: [{ name: "shiro wot", confidence: 0.9 }] }) });
  const started = await biologicalCase(svc);
  assert.equal(started.foodHerb.open, true);
  const before = JSON.stringify(await store.get(started.id));

  const photo = new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" });
  const identified = await svc.identifyFoodHerb(owner, started.id, { kind: "meal", photo });
  assert.equal(asked, 1);
  assert.equal(identified.status, "recognised");
  assert.match(identified.candidates[0].name, /^Shiro Wot/);
  assert.equal(JSON.stringify(await store.get(started.id)), before, "identifying changes nothing on the case");
  assert.ok(!JSON.stringify(identified).includes("base64"), "nothing of the photo comes back");

  const submitted = await svc.submit(owner, started.id);
  const runs = analyses();
  const view = await svc.addFoodHerb(owner, submitted.id, { kind: "meal", itemIds: [identified.candidates[0].id], source: "photo", note: "Most days" });
  assert.equal(analyses(), runs + 1, "the analysis is rebuilt with the new information");
  assert.equal(view.foodHerb.notes.length, 1);
  assert.deepEqual(view.foodHerb.notes[0].items.map((item) => item.id), [identified.candidates[0].id]);
  assert.ok(!("analysis" in view), "the owner still never sees the analysis");
  assert.equal(notices[0].title, "Foods or plants added to a Wellbeing request");

  const stored = await store.get(submitted.id);
  assert.deepEqual(Object.keys(stored.foodHerbNotes[0]).sort(), ["at", "id", "items", "kind", "note", "source"], "only names, the source and the note are stored");
  assert.ok(stored.analysis.foodAndHerbs.meals.length === 1);
  assert.equal(stored.auditTrail.at(-1).type, "food_herb_added");
  assert.ok(!JSON.stringify(stored.auditTrail).includes("Most days"), "the note is not copied into the audit trail");

  const expert = await svc.getForExpert(admin, submitted.id);
  assert.equal(expert.analysis.foodAndHerbs.meals.length, 1);

  const removed = await svc.removeFoodHerb(owner, submitted.id, view.foodHerb.notes[0].id);
  assert.deepEqual(removed.foodHerb.notes, []);
  assert.equal((await store.get(submitted.id)).analysis.foodAndHerbs, undefined);
});

test("owner flow: a person in the photo is refused; without a vision model only typed names work", async () => {
  const refusing = desk({ ask: async () => ({ showsPerson: true, items: [] }) });
  const started = await biologicalCase(refusing.svc);
  const photo = new Blob([new Uint8Array([1])], { type: "image/jpeg" });
  const refused = await refusing.svc.identifyFoodHerb(owner, started.id, { kind: "meal", photo });
  assert.deepEqual({ status: refused.status, candidates: refused.candidates }, { status: "person", candidates: [] });

  const plain = desk(null);
  const other = await biologicalCase(plain.svc);
  assert.equal(other.foodHerb.photo, false);
  await assert.rejects(() => plain.svc.identifyFoodHerb(owner, other.id, { kind: "meal", photo }), /not available/);
  const typed = await plain.svc.identifyFoodHerb(owner, other.id, { kind: "herb", names: "tena adam" });
  assert.equal(typed.status, "typed");
  assert.equal(typed.candidates[0].id, "ruta-chalepensis-tena-adam");
  await assert.rejects(() => plain.svc.identifyFoodHerb(owner, other.id, { kind: "herb" }), /Add a photo or type/);
});

test("owner flow: only the owner, only wellbeing cases, only while the case is open, only with real catalogue entries", async () => {
  const { svc } = desk(null);
  const started = await biologicalCase(svc);
  await assert.rejects(() => svc.identifyFoodHerb({ id: "user-9", role: "user", permissions: [] }, started.id, { kind: "meal", names: "injera" }), /not found/);
  await assert.rejects(() => svc.addFoodHerb(owner, started.id, { kind: "meal", itemIds: ["made-up"], source: "typed" }), /at least one/);

  const social = await svc.start(owner, "social", { safetyAnswers: { loneliness: "low", self_harm: "no", immediateRisk: "no", supportAvailable: "yes" }, answers: {} });
  assert.equal(social.foodHerb.open, false);
  await assert.rejects(() => svc.identifyFoodHerb(owner, social.id, { kind: "meal", names: "injera" }), /cannot be added/);
});
