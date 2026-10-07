import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCaseAnalysis, caseStatements, detectFactors, groundFindings } from "../server/cases/analysis.ts";
import { buildEnhancedReportSections, reportStatistics } from "../server/cases/reportEnhancer.ts";
import { createCase } from "../server/cases/machine.ts";
import { DOMAIN_CONFIGS } from "../server/cases/domains/index.ts";
import { createCaseService } from "../server/cases/service.ts";
import { createMemoryCaseStore } from "../server/cases/store.ts";
import { isSensitive, ownerNotice } from "../server/cases/notices.ts";

const SAFE = { feelsSafe: "yes", domesticViolence: "no", childSafety: "no_children", immediateRisk: "no" };
const NOW = new Date("2026-10-06T08:00:00Z");

function relationshipCase(story, safetyAnswers = SAFE) {
  const config = DOMAIN_CONFIGS.relationship;
  const freeText = config.questions({}).find((question) => !question.options?.length);
  assert.ok(freeText, "the relationship intake has a free-text question");
  const record = createCase({ id: "case-1", userId: "user-1", config, safetyAnswers, answers: { [freeText.id]: story } });
  return { record, config };
}

const STORY =
  "My husband and I argue constantly about money since he lost his job. I can't sleep and I feel anxious and tired. " +
  "I drink more coffee and I chew khat sometimes.";

test("statements: options become their labels and only the person's own text is quoted", () => {
  const { record, config } = relationshipCase(STORY);
  const statements = caseStatements(record, config);
  const free = statements.filter((statement) => statement.free);
  assert.equal(free.length, 1);
  assert.equal(free[0].text, STORY);
  assert.ok(statements.some((statement) => !statement.free), "safety answers are included as picked options");
});

test("factors: found in the person's words, with the sentence that shows each one", () => {
  const { record, config } = relationshipCase(STORY);
  const detected = detectFactors(caseStatements(record, config));
  const ids = detected.map((entry) => entry.factor.id);
  for (const id of ["money", "conflict", "work", "sleep", "anxiety", "substance", "caffeine", "family", "fatigue"]) assert.ok(ids.includes(id), `${id} detected`);
  assert.ok(!ids.includes("violence") && !ids.includes("grief") && !ids.includes("legal"));
  assert.match(detected.find((entry) => entry.factor.id === "sleep").quotes[0], /can't sleep/);
  // Question wording must not create factors: nothing was said about faith.
  assert.ok(!ids.includes("spiritual"));
});

test("grounding: a strand's catalogue is reduced to what the request supports", () => {
  const detected = detectFactors([{ topic: "Story", text: "I feel anxious and I chew khat.", free: true }]);
  const catalogue = [
    { type: "psychological_condition", strand: "psychological", name: "GENERALIZED ANXIETY DISORDER", description: "Persistent worry.", relevanceScore: 0.98, recommendations: ["Seek counselling at a health centre."] },
    { type: "psychological_condition", strand: "psychological", name: "POST-TRAUMATIC STRESS DISORDER", description: "Follows trauma; anxiety can be present.", relevanceScore: 0.98 },
    { type: "psychological_condition", strand: "psychological", name: "SCHIZOPHRENIA", description: "A psychotic disorder.", relevanceScore: 0.98 },
  ];
  const kept = groundFindings("psychological", catalogue, detected, [], {});
  assert.deepEqual(kept.map((finding) => finding.name), ["GENERALIZED ANXIETY DISORDER"]);
  assert.match(kept[0].matchedOn[0], /Worry and stress: “I feel anxious/);
  assert.deepEqual(kept[0].steps, ["Seek counselling at a health centre."]);

  const entities = [{ category: "substance", value: "khat", label: "Substance: KHAT", confidence: 0.9 }];
  const addiction = groundFindings("addiction", [{ type: "substance", strand: "addiction", name: "KHAT (CATHA EDULIS)", description: "Stimulant leaf.", relevanceScore: 0.98 }, { type: "substance", strand: "addiction", name: "OPIOIDS", description: "Morphine, tramadol.", relevanceScore: 0.98 }], detected, entities, {});
  assert.deepEqual(addiction.map((finding) => finding.name), ["KHAT (CATHA EDULIS)"]);
});

test("analysis: every strand runs, causes are ranked hypotheses tied to the person's words", async () => {
  const { record, config } = relationshipCase(STORY);
  const analysis = await buildCaseAnalysis(record, config, { age: 34, demographics: { age: 34, gender: "female" }, location: { region: "Oromia", city: "Adama" } }, { now: () => NOW });

  assert.equal(analysis.strands.length, 11, "all eleven knowledge strands were queried");
  const considered = analysis.strands.reduce((sum, strand) => sum + strand.considered, 0);
  const kept = analysis.strands.reduce((sum, strand) => sum + strand.kept, 0);
  assert.ok(considered > 100 && kept > 0 && kept < considered / 4, `grounding kept ${kept} of ${considered}`);
  for (const strand of analysis.strands) for (const finding of strand.findings) assert.ok(finding.matchedOn.length > 0, `${finding.name} has a reason`);

  const titles = analysis.causes.map((cause) => cause.id);
  assert.ok(titles.includes("money_conflict") && titles.includes("work_money") && titles.includes("stress_sleep") && titles.includes("stimulant_sleep"));
  for (const cause of analysis.causes) assert.ok(cause.because.length > 0, `${cause.id} quotes the person`);
  assert.ok(!analysis.causes.some((cause) => /krebs|malaria|hiv/i.test(cause.title)), "catalogue entries are not presented as causes");
  assert.equal(analysis.causes[0].id, "money_conflict", "the heaviest factors lead");
  assert.equal(analysis.causes[0].confidence, "moderate", "one sentence of evidence is not called strong");

  assert.ok(analysis.solutions.some((solution) => solution.addresses.includes("money_conflict") && solution.steps.length > 0));
  assert.ok(analysis.solutions.filter((solution) => solution.id.startsWith("knowledge-")).every((solution) => solution.source));
  assert.equal(analysis.publishScope, "full");
  assert.equal(analysis.safety.domainBSuppressed, false);
  assert.ok(analysis.dataQuality.score > 50);
  assert.ok(analysis.dataQuality.used.includes("Profile: age"));
  assert.ok(analysis.dataQuality.followUps.length >= 2);
  assert.equal(analysis.generatedAt, NOW.toISOString());
});

test("analysis: a safety signal comes first and withholds Domain B reflection", async () => {
  const { record, config } = relationshipCase("My husband hit me last week and he threatens me when we argue about money. I pray every day.");
  const analysis = await buildCaseAnalysis(record, config, {}, { now: () => NOW });
  assert.equal(analysis.causes[0].id, "safety_first");
  assert.equal(analysis.solutions[0].id, "safety");
  assert.equal(analysis.safety.domainBSuppressed, true);
  assert.deepEqual(analysis.reflections, []);
  assert.ok(analysis.strands.filter((strand) => strand.layer === "B").every((strand) => strand.findings.length === 0));
  assert.ok(analysis.safety.warnings.some((warning) => /Safety and violence/.test(warning)));
});

test("analysis: thin requests are scored low and say what to ask", async () => {
  const { record, config } = relationshipCase("Please help.");
  const analysis = await buildCaseAnalysis(record, config, {}, { now: () => NOW });
  assert.ok(analysis.dataQuality.score < 30);
  assert.ok(analysis.dataQuality.gaps.some((gap) => /short/.test(gap)));
  assert.ok(analysis.dataQuality.followUps.some((question) => /what happened/.test(question)));
  assert.deepEqual(analysis.causes, []);
});

test("analysis: career and legal cases are marked reflection-only for publication", async () => {
  const config = DOMAIN_CONFIGS.legal;
  const record = createCase({ id: "case-2", userId: "user-1", config, safetyAnswers: { immediateHarm: "no", criminalMatter: "no", evictionRisk: "no", childWelfare: "no_children" }, answers: {} });
  const analysis = await buildCaseAnalysis({ ...record, messages: [{ id: "m1", from: "owner", authorId: "user-1", kind: "message", body: "My brothers and I dispute the land we inherited from our father.", via: "app", at: NOW.toISOString() }] }, config, {}, { now: () => NOW });
  assert.equal(analysis.publishScope, "reflection_only");
  assert.ok(analysis.causes.some((cause) => cause.id === "property_family"), "a follow-up reply is analysed like an answer");
});

test("report enhancement: builds editable, profile-aware detail without crossing reflection-only scope", async () => {
  const { record, config } = relationshipCase(STORY);
  const analysis = await buildCaseAnalysis(record, config, {
    age: 34,
    demographics: { age: 34, gender: "female" },
    location: { region: "Oromia", city: "Adama" },
  }, { now: () => NOW });

  const sections = buildEnhancedReportSections(analysis, true);
  assert.ok(sections.some((entry) => entry.title === "Your situation, summarized"));
  assert.ok(sections.some((entry) => entry.title === "Patterns to consider together"));
  assert.ok(sections.some((entry) => entry.title === "Possible next steps"));
  const profileSection = sections.find((entry) => entry.title === "Personal context and what to verify");
  assert.ok(profileSection?.body?.includes("age"));
  assert.ok(!JSON.stringify(profileSection).includes("Adama"), "sensitive profile values are not copied into the report");
  assert.ok(sections.every((entry) => !entry.locked), "generated content stays editable");

  const legalConfig = DOMAIN_CONFIGS.legal;
  const legalRecord = createCase({
    id: "case-legal-report",
    userId: "user-1",
    config: legalConfig,
    safetyAnswers: { immediateHarm: "no", criminalMatter: "no", evictionRisk: "no", childWelfare: "no_children" },
    answers: {},
  });
  const legalAnalysis = await buildCaseAnalysis({
    ...legalRecord,
    messages: [{ id: "m1", from: "owner", authorId: "user-1", kind: "message", body: "My brothers and I dispute land inherited from our father.", via: "app", at: NOW.toISOString() }],
  }, legalConfig, {}, { now: () => NOW });
  const reflectiveSections = buildEnhancedReportSections(legalAnalysis, false);
  assert.ok(reflectiveSections.every((entry) => !["Patterns to consider together", "Possible next steps", "How different areas may connect"].includes(entry.title)));
  assert.ok(reflectiveSections.filter((entry) => entry.cultural).every((entry) => entry.title === "Cultural and spiritual reflections"));
});

// ── Aligning the analysis and the report with the person ─────────────────────

const RICH_PROFILE = {
  age: 34,
  language: "am",
  demographics: { age: 34, gender: "female" },
  location: { region: "Oromia", city: "Adama", altitude: 1712 },
  medications: ["Metformin"],
  conditions: ["Diabetes"],
  wellbeing: { allergies: [] },
  cultural: { birthDate: "1992-03-10", birthTime: "06:40", birthLocation: "Adama" },
};

test("person context: carries bands and cautions, never the raw profile values", async () => {
  const { record, config } = relationshipCase(STORY);
  const analysis = await buildCaseAnalysis(record, config, RICH_PROFILE, { now: () => NOW });
  const person = analysis.person;
  assert.ok(person, "a consented profile produces a person context");
  assert.equal(person.lifeStage.band, "25–39");
  assert.ok(person.lifeStage.considerations.some((line) => /money pressure/.test(line)), "life-stage notes follow the themes of this case");
  assert.equal(person.place.region, "Oromia");
  assert.match(person.place.season, /Tsedey/);
  assert.deepEqual(person.care.map((entry) => entry.id), ["medicines", "conditions"]);

  const text = JSON.stringify(person);
  for (const secret of ["Adama", "Metformin", "Diabetes", "female", "1992", "06:40"]) assert.ok(!text.includes(secret), `${secret} is not copied into the context`);
  assert.ok(!/\b34\b/.test(text), "the exact age is not copied");

  // The reading is turned towards the kind of matter: partnership for a relationship case.
  assert.match(person.reading.signature, /Sun in Pisces/);
  assert.equal(person.reading.matter.house, 7);
  assert.ok(person.reading.timing.some((line) => /Life period \(Vimshottari\)/.test(line)));
  assert.ok(person.reading.timing.some((line) => /^Today \(6 Oct 2026\)/.test(line)), "timing is computed for the day of the analysis");
});

test("person context: no reading without birth details, without consent, or while a safety signal is active", async () => {
  const { record, config } = relationshipCase(STORY);
  const { cultural: _cultural, ...withoutBirth } = RICH_PROFILE;
  assert.equal((await buildCaseAnalysis(record, config, withoutBirth, { now: () => NOW })).person.reading, undefined);
  assert.equal((await buildCaseAnalysis(record, config, {}, { now: () => NOW })).person, undefined, "no profile, no context");

  const unsafe = relationshipCase("My husband hit me last week and he threatens me when we argue about money.");
  const analysis = await buildCaseAnalysis(unsafe.record, unsafe.config, RICH_PROFILE, { now: () => NOW });
  assert.equal(analysis.person.reading, undefined, "reflection is withheld");
  assert.ok(analysis.person.care.length > 0, "cautions are still shown to the reviewer");

  // Without a birth time nothing leans on the Ascendant or houses.
  const untimed = await buildCaseAnalysis(record, config, { ...RICH_PROFILE, cultural: { birthDate: "1992-03-10", birthLocation: "Adama" } }, { now: () => NOW });
  assert.equal(untimed.person.reading.matter, undefined);
  assert.ok(!/rising/.test(untimed.person.reading.signature));
  assert.ok(untimed.person.reading.timing.every((line) => !/in your \d+(st|nd|rd|th) house/.test(line)));
});

test("detailed report: elaborated, aligned to the person, and within what a draft may hold", async () => {
  const { draftInput } = await import("../server/cases/schemas.ts");
  const { record, config } = relationshipCase(STORY);
  const analysis = await buildCaseAnalysis(record, config, RICH_PROFILE, { now: () => NOW });
  const sections = buildEnhancedReportSections(analysis, true);
  const byTitle = Object.fromEntries(sections.map((entry) => [entry.title, entry]));

  for (const title of [
    "Your situation, summarized",
    "What stands out, theme by theme",
    "Patterns to consider together",
    "Possible next steps",
    "When to seek help sooner",
    "Personal context and what to verify",
    "Timing and temperament from your personal profile",
    "Questions that could make this more specific",
  ]) assert.ok(byTitle[title], `${title} is built`);

  // Each pattern says why it is suggested and what would confirm it.
  const pattern = byTitle["Patterns to consider together"].items[0];
  assert.match(pattern, /Money pressure is feeding the conflict \(moderate confidence\)/);
  assert.match(pattern, /What you shared that suggests it: “My husband and I argue/);
  assert.match(pattern, /What would confirm or rule it out:/);

  // The profile shapes the report without its raw values appearing in it.
  const context = byTitle["Personal context and what to verify"];
  assert.ok(context.items.some((item) => /^Life stage — Early adulthood \(25–39\)/.test(item)));
  assert.ok(context.items.some((item) => /^Where you live — Oromia/.test(item)));
  assert.ok(context.items.some((item) => /prefers Amharic/.test(item)));
  const all = JSON.stringify(sections);
  for (const secret of ["Adama", "Metformin", "Diabetes", "female"]) assert.ok(!all.includes(secret), `${secret} does not reach the report`);

  // Medicines on the profile: the caution is stated and catalogue advice needing a professional is left out.
  assert.match(byTitle["Possible next steps"].body, /lists medicines you take/);
  assert.ok(!byTitle["Possible next steps"].items.some((item) => /reference guidance under/.test(item) && /Confirm with a qualified professional/.test(item)));
  assert.ok(!byTitle["Timing and temperament from your personal profile"].items.some((item) => /Foods that tradition favours/.test(item)), "no food advice beside a medicines caution");
  assert.equal(byTitle["Timing and temperament from your personal profile"].cultural, true);

  // Reference entries are only those the person named or strongly supported.
  for (const item of byTitle["Reference knowledge behind this report"]?.items ?? []) assert.match(item, /Included because of —/);

  // The whole set can be saved as a draft.
  const parsed = draftInput.safeParse({ title: "Report", summary: "Summary", sections, disclaimer: "Disclaimer", generatedAt: NOW.toISOString(), aiAssisted: false });
  assert.ok(parsed.success, parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 2)));
  const stats = reportStatistics({ summary: "", sections });
  assert.ok(stats.words > 1500, `a detailed report, got ${stats.words} words`);

  // Building again replaces sections rather than piling up: ids are stable.
  assert.deepEqual(buildEnhancedReportSections(analysis, true).map((entry) => entry.id), sections.map((entry) => entry.id));

  // Without consent the person context is ignored even if an analysis carries one.
  const withheld = buildEnhancedReportSections(analysis, false);
  assert.ok(!withheld.some((entry) => entry.title === "Timing and temperament from your personal profile"));
  assert.match(withheld.find((entry) => entry.title === "Personal context and what to verify").body, /were not used/);
});

test("detailed report: reflection-only case types receive reflection and context, not evidence sections", async () => {
  const legalConfig = DOMAIN_CONFIGS.legal;
  const legalRecord = createCase({
    id: "case-legal-detail",
    userId: "user-1",
    config: legalConfig,
    safetyAnswers: { immediateHarm: "no", criminalMatter: "no", evictionRisk: "no", childWelfare: "no_children" },
    answers: {},
  });
  const analysis = await buildCaseAnalysis({
    ...legalRecord,
    messages: [{ id: "m1", from: "owner", authorId: "user-1", kind: "message", body: "My brothers and I dispute land inherited from our father.", via: "app", at: NOW.toISOString() }],
  }, legalConfig, RICH_PROFILE, { now: () => NOW });

  assert.equal(analysis.person.reading.matter.house, 9, "a legal matter is read from the ninth house");
  const sections = buildEnhancedReportSections(analysis, true);
  const titles = sections.map((entry) => entry.title);
  for (const evidence of ["What stands out, theme by theme", "Patterns to consider together", "Possible next steps", "When to seek help sooner", "Reference knowledge behind this report", "How different areas may connect"]) {
    assert.ok(!titles.includes(evidence), `${evidence} is not generated for a reflection-only case`);
  }
  assert.ok(titles.includes("Timing and temperament from your personal profile"));
});

// ── Review desk: dossier, editing, conversation ──────────────────────────────

const owner = { id: "user-1", role: "user", permissions: [] };
const admin = { id: "admin-1", role: "admin", permissions: ["cases:review"] };
const otherAdmin = { id: "admin-2", role: "admin", permissions: ["cases:review"] };
const CHECKLIST = Object.fromEntries(DOMAIN_CONFIGS.social.reviewChecklist.map((item) => [item.id, true]));
const SOCIAL_SAFE = { loneliness: "low", self_harm: "no", immediateRisk: "no", supportAvailable: "yes" };

function desk() {
  const ownerNotices = [];
  const replies = [];
  let analyses = 0;
  const store = createMemoryCaseStore();
  const svc = createCaseService({
    store,
    billing: { pricing: async () => ({ reportEtb: 0, consultationEtb: 0 }), checkout: async () => ({ purchaseId: "p", checkoutUrl: "" }), submitManual: async () => ({ purchaseId: "p" }), verify: async () => ({ paid: false }), latest: async () => null },
    loadExpert: async (id) => ({ id, role: "admin" }),
    expertSummaries: async () => new Map(),
    defaultRole: async () => "admin",
    analyse: async (record, config) => {
      analyses++;
      return buildCaseAnalysis(record, config, {}, { now: () => NOW });
    },
    notifyOwner: async (record, type, message) => void ownerNotices.push(ownerNotice(record, "Belonging & Community", type, message)),
    notifyReply: async (record) => void replies.push(record.id),
  });
  return { svc, store, ownerNotices, replies, analyses: () => analyses };
}

async function submitted(svc, story = "I feel lonely since I moved to Addis for work and I have no friends here.") {
  const started = await svc.start(owner, "social", { safetyAnswers: SOCIAL_SAFE, answers: {} });
  const answers = Object.fromEntries(started.questions.filter((question) => question.required).map((question) => [question.id, question.options?.[0]?.value ?? story]));
  await svc.answer(owner, started.id, answers);
  return svc.submit(owner, started.id);
}

test("review desk: the reviewer gets the dossier; the owner never does", async () => {
  const { svc, ownerNotices } = desk();
  const view = await submitted(svc);
  assert.equal(view.stage, "awaiting_expert");
  assert.ok(!("analysis" in view), "the owner view has no analysis");
  assert.ok(!JSON.stringify(view).includes("dataQuality"));
  assert.equal(ownerNotices[0].type, "case.received");

  const expertView = await svc.getForExpert(admin, view.id);
  assert.ok(expertView.analysis.factors.some((factor) => factor.id === "isolation"));
  assert.ok(expertView.analysis.causes.length > 0);
});

test("review desk: questions reach the owner, replies return and refresh the analysis", async () => {
  const { svc, ownerNotices, replies, analyses } = desk();
  const view = await submitted(svc);
  await assert.rejects(() => svc.message(admin, view.id, { body: "How long has this lasted?", kind: "question" }), /Claim the request/);
  await svc.claim(admin, view.id);
  await assert.rejects(() => svc.message(otherAdmin, view.id, { body: "Hello there", kind: "message" }), /another expert/);

  const asked = await svc.message(admin, view.id, { body: "How is your sleep at the moment?", kind: "question" });
  assert.equal(asked.messages.length, 1);
  const notice = ownerNotices.at(-1);
  assert.equal(notice.title, "Your reviewer has a question");
  assert.match(notice.body, /How is your sleep at the moment\?\n\nReply to this message to answer\./);
  assert.equal((await svc.get(owner, view.id)).awaitingReply, true);
  assert.deepEqual(await svc.statusFor(owner.id), [{ id: view.id, label: DOMAIN_CONFIGS.social.label, stage: "in_review", waitingForReply: true }]);

  const before = analyses();
  const target = await svc.replyFromChannel(owner.id, "I can't sleep and I worry about money every night.", "telegram");
  assert.deepEqual(target, { caseId: view.id, label: DOMAIN_CONFIGS.social.label });
  assert.equal(analyses(), before + 1, "the reply triggers a fresh analysis");
  assert.deepEqual(replies, [view.id]);

  const refreshed = await svc.getForExpert(admin, view.id);
  assert.equal(refreshed.messages.at(-1).via, "telegram");
  const factors = refreshed.analysis.factors.map((factor) => factor.id);
  assert.ok(factors.includes("sleep") && factors.includes("money"), "new information changes the factors");
  assert.equal((await svc.get(owner, view.id)).awaitingReply, false);

  assert.equal(await svc.replyFromChannel("someone-else", "hello", "whatsapp"), null, "no open request, nothing is recorded");
  await assert.rejects(() => svc.reply({ id: "user-9", role: "user", permissions: [] }, view.id, "hi"), /not found/);
});

test("review desk: the report is edited, saved and released with the reviewer's words", async () => {
  const { svc, ownerNotices } = desk();
  const view = await submitted(svc);
  const claimed = await svc.claim(admin, view.id);
  const edited = { ...claimed.draft, summary: "Edited by the reviewer.", sections: [...claimed.draft.sections, { id: "reviewer-1", title: "What I suggest", items: ["Join one iddir gathering this month."], locked: false }] };
  await assert.rejects(() => svc.saveDraft(otherAdmin, view.id, edited), /another expert/);
  const saved = await svc.saveDraft(admin, view.id, edited);
  assert.equal(saved.draft.summary, "Edited by the reviewer.");
  assert.ok(saved.auditTrail.some((event) => event.type === "draft_saved"));
  assert.equal((await svc.get(owner, view.id)).report, null, "an unreleased draft stays hidden from the owner");

  await svc.approve(admin, view.id, { checklist: CHECKLIST, notes: "Start with one small step." });
  const released = await svc.get(owner, view.id);
  assert.equal(released.report.summary, "Edited by the reviewer.");
  assert.ok(released.report.sections.some((section) => section.title === "What I suggest"));
  assert.equal(released.review.notes, "Start with one small step.");
  assert.ok(ownerNotices.some((notice) => notice.type === "case.claimed"));
});

// ── Awde Negest sections in full, and "AI" on a section ──────────────────────

test("spiritual report: the seal and the scroll are written in full for the bearer's Christian name", async () => {
  const { calculateFullDivination } = await import("../lib/cultural/spiritualDivinationEngine.ts");
  const { ETHIOPIAN_TELSEM_COLLECTION } = await import("../lib/cultural/telsemData.ts");
  const { buildSpiritualSections } = await import("../server/cases/domains/spiritualContent.ts");
  const gematria = calculateFullDivination("ሰላማዊት", "ፀሐይ");
  const byId = (sections) => Object.fromEntries(sections.map((entry) => [entry.id, entry]));

  const woman = byId(buildSpiritualSections(gematria, "family", { christianName: "ወለተ ማርያም", now: NOW }));
  assert.match(woman.healing_scroll.title, /ወለተ ማርያም \(ሰላማዊት\)/);
  const scroll = woman.healing_scroll.items.join("\n");
  assert.match(scroll, /በስመ አብ ወወልድ ወመንፈስ ቅዱስ/);
  assert.match(scroll, /ለአመትከ ወለተ ማርያም/, "a woman's baptismal name is addressed as handmaid");
  assert.match(scroll, /የእናት ስም፦ ፀሐይ/);
  assert.match(scroll, /ቤቷን እና ቤተሰቧን ባርክ/, "the petition follows the question and the bearer");
  assert.match(scroll, /ለዓለመ ዓለም አሜን/);
  assert.match(scroll, /ተጻፈ \(Written\): መስከረም/, "the scroll is dated in the Ethiopian calendar");
  assert.ok(woman.healing_scroll.items.length >= 8 && woman.healing_scroll.body.length > 600, "the scroll is complete, with its English rendering");
  assert.match(woman.sacred_telsem.body, /here it reads ለአመትከ ወለተ ማርያም, with the mother's name, ፀሐይ/);
  assert.ok(woman.sacred_telsem.items.length >= 9, "design, name band, prayer, meaning, reading, colours, day, materials, guardian");

  // The same reading for a man, and for someone who gave no baptismal name.
  const man = byId(buildSpiritualSections(gematria, "career", { christianName: "ገብረ ሚካኤል", now: NOW }));
  assert.match(man.healing_scroll.items.join("\n"), /ለገብርከ ገብረ ሚካኤል/);
  assert.match(man.healing_scroll.items.join("\n"), /ሥራውን ባርክ/);
  const unnamed = byId(buildSpiritualSections(gematria, "wellbeing", { now: NOW }));
  assert.match(unnamed.healing_scroll.items.join("\n"), /ለሰላማዊት የተዘጋጀ/);
  assert.match(unnamed.healing_scroll.items.join("\n"), /ሥጋቸውንና ነፍሳቸውን/, "the respectful plural is used when the name does not say");
  assert.match(unnamed.divination_summary.body, /No Christian \(baptismal\) name was given/);

  // The seal's own prayer carries the bearer's name where the manuscript leaves a place for one.
  const psalmSeal = ETHIOPIAN_TELSEM_COLLECTION.find((seal) => seal.id === "telsem-medfe-memelesha");
  const withPrayer = byId(buildSpiritualSections({ ...gematria, telsem: psalmSeal }, "life_direction", { christianName: "ወለተ ማርያም", now: NOW }));
  const prayer = withPrayer.sacred_telsem.items.find((item) => item.startsWith("የጸሎት ቃል"));
  assert.match(prayer, /ለአመትከ ወለተ ማርያም/);
  assert.ok(!prayer.includes("እገሌ"), "the placeholder is replaced");

  // A manuscript line that is a preparation (cut, mix, eat) is not reproduced.
  const procedural = ETHIOPIAN_TELSEM_COLLECTION.find((seal) => seal.id === "telsem-dirsan-mikael");
  const withProcedure = byId(buildSpiritualSections({ ...gematria, telsem: procedural }, "life_direction", { christianName: "ወለተ ማርያም", now: NOW }));
  assert.ok(![withProcedure.sacred_telsem.body, ...withProcedure.sacred_telsem.items].join(" ").includes("በማር ለውሰህ"));
  assert.ok(withProcedure.sacred_telsem.items.some((item) => /preparation at this point, which is not reproduced/.test(item)));

  // Everything fits in a draft.
  const { draftInput } = await import("../server/cases/schemas.ts");
  assert.ok(draftInput.safeParse({ title: "t", summary: "s", sections: Object.values(woman), disclaimer: "d", generatedAt: NOW.toISOString(), aiAssisted: false }).success);
});

test("AI on a section: rebuilt from the case, with the model kept inside its limits", async () => {
  const { enhanceReportSection } = await import("../server/cases/sectionEnhancer.ts");
  const config = DOMAIN_CONFIGS.spiritual;
  const answers = { nameGeez: "ሰላማዊት", motherNameGeez: "ፀሐይ", question_category: "family" };
  const record = { ...createCase({ id: "case-spirit", userId: "user-1", config, safetyAnswers: {}, answers }), answers, context: config.buildContext(answers), analysis: null };
  const draft = await config.buildDraft({ answers, context: record.context, safety: record.safety });
  const scroll = draft.sections.find((entry) => entry.id === "healing_scroll");
  assert.match(scroll.items.join("\n"), /ለሰላማዊት የተዘጋጀ/, "without a baptismal name the worldly name is used");

  // No language model: the section is rebuilt from the case with the name the reviewer supplies.
  const rebuilt = await enhanceReportSection(record, { section: { ...scroll, locked: false }, christianName: "ወለተ ማርያም" }, { model: undefined, now: () => NOW });
  assert.equal(rebuilt.source, "case_data");
  assert.equal(rebuilt.section.id, "healing_scroll");
  assert.equal(rebuilt.section.locked, false, "the reviewer's lock setting is kept");
  assert.match(rebuilt.section.items.join("\n"), /ለአመትከ ወለተ ማርያም/);

  // Asking again with nothing new changes nothing.
  const again = await enhanceReportSection(record, { section: rebuilt.section, christianName: "ወለተ ማርያም" }, { model: undefined, now: () => NOW });
  assert.equal(again.source, "unchanged");

  // With a model: names leave as tokens, sacred lines come back verbatim, commentary is the model's.
  let seen;
  const model = async (request) => {
    seen = request;
    return { body: `${request.body}\n\nExpanded for ⟦N1⟧.`, items: ["A new note about the blessing for ⟦N1⟧.", "በስመ አብ የተለወጠ መስመር"] };
  };
  const written = await enhanceReportSection(record, { section: scroll, christianName: "ወለተ ማርያም", instruction: "Explain the petition for ሰላማዊት" }, { model, now: () => NOW });
  assert.equal(written.source, "model");
  const sent = JSON.stringify(seen);
  for (const name of ["ወለተ ማርያም", "ሰላማዊት", "ፀሐይ"]) assert.ok(!sent.includes(name), `${name} is masked before it leaves the platform`);
  assert.match(seen.instruction, /⟦N\d⟧/);
  assert.equal(seen.kind, "cultural reflection");
  assert.match(written.section.body, /Expanded for ወለተ ማርያም\./, "names are restored");
  for (const line of rebuilt.section.items.filter((item) => /^(መክፈቻ|ስም|ልመና|ጥበቃ|ማኅተም)/.test(item))) assert.ok(written.section.items.includes(line), "the scroll's own lines are kept verbatim");
  assert.ok(!written.section.items.includes("በስመ አብ የተለወጠ መስመር"), "the model cannot add or alter sacred lines");
  assert.ok(written.section.items.includes("A new note about the blessing for ወለተ ማርያም."));

  // A model that mangles a name, or fails, falls back to the case data.
  const mangled = await enhanceReportSection(record, { section: scroll, christianName: "ወለተ ማርያም" }, { model: async () => ({ body: "For ⟦N9⟧.", items: [] }), now: () => NOW });
  assert.equal(mangled.source, "case_data");
  const failed = await enhanceReportSection(record, { section: scroll, christianName: "ወለተ ማርያም" }, { model: async () => { throw new Error("down"); }, now: () => NOW });
  assert.equal(failed.source, "case_data");
});

test("AI on a section: other sections are extended from the analysis, within the case's scope", async () => {
  const { enhanceReportSection } = await import("../server/cases/sectionEnhancer.ts");
  const { record, config } = relationshipCase(STORY);
  const analysis = await buildCaseAnalysis(record, config, RICH_PROFILE, { now: () => NOW });
  const withAnalysis = { ...record, analysis };

  const own = { id: "reviewer-note-1", title: "About the money worries", body: "A note written by the reviewer.", locked: false };
  const extended = await enhanceReportSection(withAnalysis, { section: own }, { model: undefined, now: () => NOW });
  assert.equal(extended.source, "case_data");
  assert.equal(extended.section.body, own.body, "the reviewer's own text is kept");
  assert.ok(extended.section.items.some((item) => /^In your words — Money pressure: “My husband and I argue/.test(item)));
  assert.ok(extended.section.items.some((item) => /^At your stage of life \(25–39\)/.test(item)));
  assert.ok(!JSON.stringify(extended.section).includes("Adama"));

  // A detailed-analysis section is rebuilt by its id.
  const patterns = await enhanceReportSection(withAnalysis, { section: { id: "analysis-patterns", title: "Patterns to consider together", body: "short", locked: true } }, { model: undefined, now: () => NOW });
  assert.equal(patterns.source, "case_data");
  assert.ok(patterns.section.items.length >= 3 && patterns.section.locked === true);

  // A reflection is extended only with reflection.
  const reflection = await enhanceReportSection(withAnalysis, { section: { id: "reviewer-reflection-1", title: "A blessing", body: "x", locked: false, cultural: true } }, { model: undefined, now: () => NOW });
  assert.ok(reflection.section.items.some((item) => /^Your personal profile: Sun in Pisces/.test(item)));
  assert.ok(!reflection.section.items.some((item) => /In your words/.test(item)));

  // Reflection-only case types never receive evidence material, and an open safety warning stops everything.
  const legal = { ...withAnalysis, domain: "legal", analysis: { ...analysis, publishScope: "reflection_only" } };
  assert.equal((await enhanceReportSection(legal, { section: own }, { model: undefined, now: () => NOW })).source, "unchanged");
  const unsafe = { ...withAnalysis, analysis: { ...analysis, safety: { ...analysis.safety, warnings: ["Safety screen: reported feeling unsafe"] } } };
  await assert.rejects(() => enhanceReportSection(unsafe, { section: own }, { model: undefined, now: () => NOW }), /safety review/);
});

test("AI on a section: only the reviewer who claimed the request may use it", async () => {
  const { svc } = desk();
  const view = await submitted(svc);
  const section = { id: "reviewer-note-1", title: "A note", body: "Text", locked: false };
  await assert.rejects(() => svc.enhanceSection(admin, view.id, { section }), /Claim the request/);
  await svc.claim(admin, view.id);
  await assert.rejects(() => svc.enhanceSection(otherAdmin, view.id, { section }));
  await assert.rejects(() => svc.enhanceSection(owner, view.id, { section }));
  const result = await svc.enhanceSection(admin, view.id, { section });
  assert.ok(["case_data", "unchanged", "model"].includes(result.source));
  // Nothing was saved: the stored draft does not contain the section.
  const stored = await svc.getForExpert(admin, view.id);
  assert.ok(!stored.draft.sections.some((entry) => entry.id === section.id));
});

test("notices: sensitive cases never carry content outside the app", () => {
  const { record } = relationshipCase(STORY, { ...SAFE, domesticViolence: "possible" });
  assert.equal(isSensitive(record), true);
  const question = { id: "m", from: "reviewer", authorId: "a", kind: "question", body: "Does he know you wrote to us?", via: "app", at: NOW.toISOString() };
  const discreet = ownerNotice(record, "Relationships & Family", "message", question);
  assert.equal(discreet.title, "You have a new message");
  assert.ok(!discreet.body.includes("Does he know"));
  const approved = ownerNotice({ ...record, review: { expertId: "a", claimedAt: "", notes: "Private advice." } }, "Relationships & Family", "approved");
  assert.ok(!`${approved.title} ${approved.body}`.includes("Private advice") && !/Relationships/.test(approved.body));

  const { record: routine } = relationshipCase(STORY);
  assert.equal(isSensitive(routine), false);
  const open = ownerNotice({ ...routine, review: { expertId: "a", claimedAt: "", notes: "Start with the budget." } }, "Relationships & Family", "approved");
  assert.match(open.body, /From your reviewer: Start with the budget\./);
  assert.equal(open.href, "/case/workflows/case-1");
});
