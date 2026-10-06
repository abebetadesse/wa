import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCaseAnalysis, caseStatements, detectFactors, groundFindings } from "../server/cases/analysis.ts";
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
