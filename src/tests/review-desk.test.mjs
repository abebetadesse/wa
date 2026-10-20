/**
 * The review desk: response targets per priority, the order requests are picked up in, reviewer
 * workload, and the queue the desk shows (run through the real case workflow in memory).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { byTriage, deskStats, submittedAt, triage, workload, DEFAULT_REPLY_TEMPLATES, DEFAULT_REVIEW_TARGETS } from "../server/cases/reviewDesk.ts";
import { reviewDeskSettings, DEFAULT_SETTINGS } from "../server/settings/index.ts";
import { createCaseService } from "../server/cases/service.ts";
import { createMemoryCaseStore } from "../server/cases/store.ts";

const T0 = Date.UTC(2026, 0, 1, 8);
const at = (hours) => new Date(T0 + hours * 3600_000);
const record = (priority, submittedHoursAgo, now = at(100), extra = {}) => ({
  createdAt: at(0).toISOString(),
  auditTrail: [{ type: "submitted", actorId: "u", at: new Date(now.getTime() - submittedHoursAgo * 3600_000).toISOString() }],
  safety: { action: "proceed", priority },
  review: null,
  ...extra,
});

test("waiting time runs from the latest submission against the priority's target", () => {
  const now = at(100);
  assert.equal(triage(record("urgent", 1, now), now).status, "on_track");
  assert.equal(triage(record("urgent", 3, now), now).status, "due_soon");
  assert.equal(triage(record("urgent", 5, now), now).status, "overdue");
  const routine = triage(record("routine", 36, now), now);
  assert.deepEqual([routine.targetHours, routine.waitingHours, routine.used, routine.status], [72, 36, 0.5, "on_track"]);
  assert.equal(submittedAt({ createdAt: "2026-01-01T00:00:00.000Z", auditTrail: [] }), "2026-01-01T00:00:00.000Z");
  assert.equal(triage(record("high", 10, now), now, { urgent: 1, high: 8, routine: 48 }).status, "overdue", "admin targets apply");
});

test("urgent requests come first, then whichever has used more of its target", () => {
  const now = at(100);
  const items = [record("routine", 70, now), record("high", 2, now), record("urgent", 0.5, now), record("high", 20, now)];
  const sorted = [...items].sort(byTriage(now));
  assert.deepEqual(sorted.map((item) => `${item.safety.priority}:${triage(item, now).waitingHours}`), ["urgent:0.5", "high:20", "high:2", "routine:70"]);
});

test("desk totals and reviewer workload", () => {
  const now = at(100);
  const waiting = [record("urgent", 5, now), record("routine", 1, now)].map((item) => triage(item, now));
  const inReview = [record("high", 20, now)].map((item) => triage(item, now));
  assert.deepEqual(deskStats(waiting, inReview), { waiting: 2, inReview: 1, overdue: 1, dueSoon: 1, oldestWaitingHours: 5 });
  assert.deepEqual(deskStats([], []).oldestWaitingHours, null);

  const loads = workload([
    record("urgent", 9, now, { review: { expertId: "a" } }),
    record("routine", 1, now, { review: { expertId: "a" } }),
    record("high", 1, now, { review: { expertId: "b" } }),
    record("high", 1, now),
  ], now);
  assert.deepEqual(loads, [{ reviewerId: "a", inReview: 2, overdue: 1 }, { reviewerId: "b", inReview: 1, overdue: 0 }]);
});

test("the default desk settings are valid", () => {
  assert.deepEqual(reviewDeskSettings.parse(DEFAULT_SETTINGS.reviewDesk).targets, DEFAULT_REVIEW_TARGETS);
  assert.ok(DEFAULT_REPLY_TEMPLATES.length >= 3);
  assert.throws(() => reviewDeskSettings.parse({ targets: { urgent: 0, high: 24, routine: 72 }, templates: [] }));
});

test("the queue shows each request's target status, totals, workload and templates", async () => {
  let now = at(0);
  const svc = createCaseService({
    store: createMemoryCaseStore(),
    billing: {
      pricing: async (_domain, defaults) => defaults,
      checkout: async () => ({ purchaseId: "p", checkoutUrl: "/pay" }),
      submitManual: async () => ({ purchaseId: "m" }),
      verify: async () => ({ paid: false }),
      latest: async () => null,
    },
    loadExpert: async (id) => ({ id, role: "expert", practitionerCredentials: { verifiedAt: "2026-01-01", domains: ["career"] } }),
    expertSummaries: async (ids) => new Map(ids.map((id) => [id, { id, name: `Reviewer ${id}`, credential: "Debtera" }])),
    reviewDesk: async () => ({ targets: DEFAULT_REVIEW_TARGETS, templates: DEFAULT_REPLY_TEMPLATES }),
    now: () => now,
  });
  const owner = { id: "user-1", role: "user", permissions: [] };
  const admin = { id: "admin-1", role: "admin", permissions: [] };
  const safety = { basic_needs: "yes_comfortable", self_harm: "no", financial_pressure: "no" };
  const submitOne = async () => {
    let view = await svc.start(owner, "career", { safetyAnswers: safety, answers: {} });
    for (let round = 0; round < 3 && view.stage === "intake"; round++) {
      view = await svc.answer(owner, view.id, Object.fromEntries(view.questions.filter((q) => q.required).map((q) => [q.id, q.options?.[0]?.value ?? "ሰላማዊት"])));
    }
    return svc.submit(owner, view.id);
  };
  const first = await submitOne();
  const second = await submitOne();
  now = new Date(Date.now() + 80 * 3600_000); // both routine requests are past their 72-hour target

  await svc.claim({ id: "expert-1", role: "expert", permissions: [] }, second.id);
  const queue = await svc.queue(admin);
  assert.deepEqual(queue.waiting.map((item) => item.id), [first.id]);
  assert.equal(queue.waiting[0].triage.status, "overdue");
  assert.equal(queue.stats.overdue, 2);
  assert.deepEqual(queue.workload, [{ reviewerId: "expert-1", inReview: 1, overdue: 1, name: "Reviewer expert-1" }]);
  assert.equal(queue.templates.length, DEFAULT_REPLY_TEMPLATES.length);
});

test("reply templates are only for reviewers", async () => {
  const { GET } = await import("../app/api/expert/templates/route.ts");
  const { NextRequest } = await import("next/server");
  const res = await GET(new NextRequest("http://localhost/api/expert/templates"), { params: Promise.resolve({}) });
  assert.equal(res.status, 401);
});
