import { test } from "node:test";
import assert from "node:assert/strict";
import { createCaseService } from "../server/cases/service.ts";
import { createMemoryCaseStore } from "../server/cases/store.ts";
import { DOMAIN_CONFIGS } from "../server/cases/domains/index.ts";
import { screenFreeText, CONTACTS } from "../server/cases/support.ts";
import { WORKFLOW_DOMAINS } from "../server/cases/types.ts";

const owner = { id: "user-1", role: "user", permissions: [] };
const stranger = { id: "user-2", role: "user", permissions: [] };
const expertUser = { id: "expert-1", role: "expert", permissions: [] };

const experts = {
  "expert-1": { id: "expert-1", role: "expert", practitionerCredentials: { verifiedAt: "2026-01-01", domains: ["career", "spiritual", "legal", "social", "relationship"] } },
  "unverified": { id: "unverified", role: "expert", practitionerCredentials: { domains: ["career"] } },
};

function service({ paid = true } = {}) {
  let verifications = 0;
  const svc = createCaseService({
    store: createMemoryCaseStore(),
    payments: () => ({
      name: "test",
      async createCheckout({ purchaseId }) {
        return { checkoutUrl: `/pay/${purchaseId}` };
      },
      async verify({ purchaseId }) {
        verifications++;
        return paid ? { paid: true, reference: `REF-${purchaseId}` } : { paid: false };
      },
    }),
    loadExpert: async (id) => experts[id] ?? { id, role: "user" },
    expertSummaries: async (ids) => new Map(ids.map((id) => [id, { id, name: "Test Expert", credential: "Debtera" }])),
  });
  return { svc, verifications: () => verifications };
}

const safe = {
  career: { basic_needs: "yes_comfortable", self_harm: "no", financial_pressure: "no" },
  legal: { immediateHarm: "no", criminalMatter: "no", evictionRisk: "no", childWelfare: "no_children" },
  relationship: { feelsSafe: "yes", domesticViolence: "no", childSafety: "no_children", immediateRisk: "no" },
  social: { loneliness: "low", self_harm: "no", immediateRisk: "no", supportAvailable: "yes" },
  spiritual: { self_harm: "no", immediateRisk: "no" },
};

function fillRequired(view) {
  return Object.fromEntries(
    view.questions
      .filter((question) => question.required)
      .map((question) => [question.id, question.options?.[0]?.value ?? "ሰላማዊት"]),
  );
}

async function runToApproval(svc, domain, answers = {}) {
  let view = await svc.start(owner, domain, { safetyAnswers: safe[domain], answers });
  for (let round = 0; round < 3 && view.stage === "intake"; round++) {
    const missing = fillRequired(view);
    view = await svc.answer(owner, view.id, missing);
  }
  view = await svc.submit(owner, view.id);
  assert.equal(view.stage, "awaiting_expert");
  await svc.claim(expertUser, view.id);
  const checklist = Object.fromEntries(DOMAIN_CONFIGS[domain].reviewChecklist.map((item) => [item.id, true]));
  await svc.approve(expertUser, view.id, { checklist, notes: "Reviewed." });
  return svc.get(owner, view.id);
}

test("every domain runs the full pipeline: intake → review → approval → payment → consultation", async () => {
  for (const domain of WORKFLOW_DOMAINS) {
    const { svc } = service();
    const answers = domain === "spiritual" ? { nameGeez: "ሰላማዊት", motherNameGeez: "ማርያም" } : {};
    const approved = await runToApproval(svc, domain, answers);
    assert.equal(approved.stage, "visible_to_user", domain);
    assert.equal(approved.review.expert.name, "Test Expert");
    assert.ok(approved.report, `${domain} report visible after approval`);
    assert.ok(approved.report.sections.every((section) => !section.locked || (!section.body && !section.items)), `${domain} locked content withheld`);

    const purchase = await svc.purchase(owner, approved.id, "telebirr");
    assert.equal(purchase.amountEtb, DOMAIN_CONFIGS[domain].pricing.reportEtb);
    const paid = await svc.confirmPurchase(owner, approved.id, purchase.purchaseId);
    assert.equal(paid.stage, "full_report_released");
    assert.equal(paid.report.unlocked, true);

    const format = DOMAIN_CONFIGS[domain].pricing.consultationFormats[0];
    const consult = await svc.requestConsultation(owner, approved.id, { format, preferredTimes: ["Monday morning"] });
    assert.equal(consult.stage, "consultation_requested");
    assert.equal(consult.consultation.status, "requested");
  }
});

test("drafts are never shown before an expert approves", async () => {
  const { svc } = service();
  let view = await svc.start(owner, "social", { safetyAnswers: safe.social, answers: {} });
  view = await svc.answer(owner, view.id, fillRequired(view));
  view = await svc.submit(owner, view.id);
  assert.equal(view.report, null);
  assert.equal(view.review.status, "queued");
  assert.equal(view.review.expert, null, "no expert is named before a real one claims the case");
  await svc.claim(expertUser, view.id);
  view = await svc.get(owner, view.id);
  assert.equal(view.report, null);
  assert.equal(view.review.status, "in_review");
});

test("payment is confirmed only by the provider, never by the client", async () => {
  const { svc } = service({ paid: false });
  const approved = await runToApproval(svc, "career");
  const purchase = await svc.purchase(owner, approved.id, "telebirr");
  await assert.rejects(svc.confirmPurchase(owner, approved.id, purchase.purchaseId, "TXN-FAKE"), (e) => e.status === 402);
  assert.equal((await svc.get(owner, approved.id)).stage, "visible_to_user");
  await assert.rejects(svc.confirmPurchase(owner, approved.id, "pur_other"), (e) => e.status === 402 || e.status === 400);
});

test("cannot pay before approval", async () => {
  const { svc } = service();
  const view = await svc.start(owner, "legal", { safetyAnswers: safe.legal, answers: {} });
  await assert.rejects(svc.purchase(owner, view.id, "telebirr"), (e) => e.status === 409);
});

test("cases are private to their owner", async () => {
  const { svc } = service();
  const view = await svc.start(owner, "career", { safetyAnswers: safe.career, answers: {} });
  await assert.rejects(svc.get(stranger, view.id), (e) => e.status === 404);
  await assert.rejects(svc.answer(stranger, view.id, { x: 1 }), (e) => e.status === 404);
  assert.equal((await svc.listMine(stranger)).length, 0);
});

test("only verified experts for the domain can review, and only the claimant can approve", async () => {
  const { svc } = service();
  let view = await svc.start(owner, "career", { safetyAnswers: safe.career, answers: {} });
  view = await svc.answer(owner, view.id, fillRequired(view));
  view = await svc.submit(owner, view.id);
  await assert.rejects(svc.claim({ id: "unverified", role: "expert" }, view.id), (e) => e.status === 404);
  await assert.rejects(svc.queue({ id: "unverified", role: "expert" }), (e) => e.status === 403);
  await svc.claim(expertUser, view.id);
  experts["expert-2"] = { id: "expert-2", role: "expert", practitionerCredentials: { verifiedAt: "2026-01-01", domains: ["career"] } };
  await assert.rejects(svc.approve({ id: "expert-2", role: "expert" }, view.id, { checklist: {} }), (e) => e.status === 403);
  await assert.rejects(svc.approve(expertUser, view.id, { checklist: {} }), (e) => e.status === 400, "checklist required");
});

test("safety screens route to crisis support, free and without review", async () => {
  const { svc } = service();
  const crisis = await svc.start(owner, "career", { safetyAnswers: { ...safe.career, self_harm: "frequently" }, answers: {} });
  assert.equal(crisis.stage, "crisis_routed");
  assert.ok(crisis.safety.support.hotlines.some((line) => line.number === CONTACTS.crisisLine.number));
  assert.equal(crisis.questions.length, 0);
  await assert.rejects(svc.submit(owner, crisis.id), (e) => e.status === 409);

  const referred = await svc.start(owner, "legal", { safetyAnswers: { ...safe.legal, criminalMatter: "yes" }, answers: {} });
  assert.equal(referred.stage, "referred");
  assert.ok(referred.questions.length > 0, "a referral still allows the intake");

  await assert.rejects(svc.start(owner, "social", { safetyAnswers: {}, answers: {} }), (e) => e.status === 400);
});

test("free-text answers can escalate an open case to crisis", async () => {
  const { svc } = service();
  const view = await svc.start(owner, "social", { safetyAnswers: safe.social, answers: {} });
  const escalated = await svc.answer(owner, view.id, { belonging_detail: "Some days I want to die" });
  assert.equal(escalated.stage, "crisis_routed");
  assert.equal(screenFreeText({ a: "I feel fine today" }), null);
});

test("no placeholder phone numbers in crisis support", () => {
  for (const contact of Object.values(CONTACTS)) assert.match(contact.number, /^\+?[\d\s-]{3,}$/, contact.name);
});

test("spiritual cases require a Ge'ez name and compute the gematria server-side", async () => {
  const { svc } = service();
  await assert.rejects(svc.start(owner, "spiritual", { safetyAnswers: safe.spiritual, answers: {} }), (e) => e.status === 400);
  const view = await svc.start(owner, "spiritual", { safetyAnswers: safe.spiritual, answers: { nameGeez: "ሰላማዊት" } });
  assert.ok(view.context.gematria.finalNumber > 0);
});

test("domain safety rules (ported from the per-domain screen tests)", () => {
  const { legal, relationship, social, career, spiritual } = DOMAIN_CONFIGS;
  const action = (config, answers) => config.evaluateSafety(answers).action;

  assert.equal(action(legal, { ...safe.legal, immediateHarm: "threats" }), "crisis_route");
  assert.equal(action(legal, { ...safe.legal, childWelfare: "concerned" }), "crisis_route");
  assert.equal(action(legal, { ...safe.legal, criminalMatter: "yes" }), "referral_route");
  assert.equal(legal.evaluateSafety({ ...safe.legal, evictionRisk: "within_7" }).priority, "urgent");
  assert.equal(legal.evaluateSafety({ ...safe.legal, criminalMatter: "unsure" }).priority, "high");
  assert.equal(action(legal, safe.legal), "proceed");

  assert.equal(action(relationship, { ...safe.relationship, feelsSafe: "unsafe" }), "crisis_route");
  assert.equal(action(relationship, { ...safe.relationship, domesticViolence: "active" }), "crisis_route");
  assert.equal(action(relationship, { ...safe.relationship, domesticViolence: "possible" }), "proceed_with_concern");

  assert.equal(action(social, { ...safe.social, self_harm: "occasionally" }), "crisis_route");
  assert.equal(social.evaluateSafety({ ...safe.social, loneliness: "high" }).priority, "high");
  assert.equal(action(social, { ...safe.social, supportAvailable: "prefer_not" }), "proceed_with_concern");

  assert.equal(action(career, { ...safe.career, basic_needs: "no" }), "proceed_with_concern");
  assert.equal(career.evaluateSafety({ ...safe.career, financial_pressure: "yes" }).priority, "high");

  assert.equal(action(spiritual, { ...safe.spiritual, immediateRisk: "yes" }), "crisis_route");
  assert.equal(spiritual.screenAnswers({ safety_screening: "unsafe" }).action, "crisis_route");
});
