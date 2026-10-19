/**
 * Outcome check-ins: scheduling after delivery, sending once, answering from the app or a chat
 * reply, alerting on side effects, and the hooks in the case workflow and the chat bot.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import {
  createFollowUpService,
  createMemoryFollowUpStore,
  followUpNotice,
  followUpPlan,
  parseFollowUpReply,
} from "../server/followUps/service.ts";
import { handleInbound } from "../server/messaging/inbound.ts";
import { createCaseService } from "../server/cases/service.ts";
import { createMemoryCaseStore } from "../server/cases/store.ts";
import { DOMAIN_CONFIGS } from "../server/cases/domains/index.ts";
import { migrationStatements } from "../../scripts/table-prefix.mjs";

const DAY = 24 * 60 * 60 * 1000;

function setup(start = Date.UTC(2026, 0, 1)) {
  let now = start;
  const store = createMemoryFollowUpStore();
  const sent = [];
  const alerts = [];
  const service = createFollowUpService({
    store,
    now: () => new Date(now),
    notify: async (userId, notice) => sent.push({ userId, ...notice }),
    alert: async (row) => alerts.push(row.id),
  });
  return { store, service, sent, alerts, advanceDays: (days) => (now += days * DAY) };
}

const caseRecord = (overrides = {}) => ({
  id: "case-1",
  userId: "user-1",
  domain: "career",
  stage: "full_report_released",
  safety: { action: "proceed", priority: "routine" },
  review: { expertId: "expert-1" },
  businessId: null,
  ...overrides,
});

test("a delivered report gets check-ins 3, 14 and 30 days later, scheduled once", async () => {
  const { store, service } = setup();
  assert.equal(await service.scheduleForCase(caseRecord(), "Career"), 3);
  await service.scheduleForCase(caseRecord(), "Career");
  assert.deepEqual(store.rows.map((row) => row.dayOffset), [3, 14, 30]);
  assert.equal(store.rows[0].dueAt.toISOString(), "2026-01-04T00:00:00.000Z");
  assert.equal(store.rows[0].reviewerId, "expert-1");
});

test("sensitive or undelivered requests get no automatic check-ins", async () => {
  const { store, service } = setup();
  for (const action of ["crisis_route", "referral_route", "proceed_with_concern"]) {
    assert.equal(await service.scheduleForCase(caseRecord({ safety: { action, priority: "urgent" } }), "Career"), 0, action);
  }
  assert.equal(await service.scheduleForCase(caseRecord({ stage: "in_review" }), "Career"), 0);
  assert.equal(store.rows.length, 0);
});

test("a completed booking gets check-ins unless its workflow case already has them", async () => {
  const { store, service } = setup();
  assert.equal(await service.scheduleForBooking({ bookingId: "b-1", userId: "user-1", businessId: "biz-1", label: "Herbal consultation", caseId: "case-9" }), 0);
  assert.equal(await service.scheduleForBooking({ bookingId: "b-1", userId: "user-1", businessId: "biz-1", label: "Herbal consultation" }), 3);
  assert.equal(store.rows[0].businessId, "biz-1");
  assert.match(followUpNotice(store.rows[0]).body, /Herbal consultation session/);
  assert.equal(followUpNotice(store.rows[0]).href, `/account/bookings/b-1?followUp=${store.rows[0].id}`);
});

test("due check-ins are sent once, and only the latest when several are overdue", async () => {
  const { service, sent, advanceDays } = setup();
  await service.scheduleForCase(caseRecord(), "Career");
  assert.equal(await service.sendDue(), 0);
  advanceDays(3);
  const [first, second] = await Promise.all([service.sendDue(), service.sendDue()]);
  assert.equal(first + second, 1, "two processes never send the same check-in");
  assert.equal(sent[0].userId, "user-1");
  assert.equal(sent[0].title, "How are things going?");

  advanceDays(40); // the task was down: day 14 and day 30 are both overdue
  assert.equal(await service.sendDue(), 1);
  assert.match(sent[1].body, /30 days/);
  assert.equal(await service.sendDue(), 0);
});

test("the check-in message never repeats what the request was about", () => {
  const [row] = followUpPlan({ userId: "u", caseId: "c", bookingId: null, domain: "relationship", label: "Relationship", reviewerId: null, businessId: null }, new Date(0));
  const notice = followUpNotice({ ...row, id: "fu-1" });
  assert.match(notice.body, /^It has been 3 days since your Relationship report\./);
  assert.match(notice.body, /Reply 1 for yes, 2 for partly or 3 for no/);
  assert.equal(notice.href, "/case/workflows/c?followUp=fu-1");
});

test("chat replies: numbers, words and Amharic are answers; sentences are not", () => {
  const cases = { "1": "yes", " 2 ": "partly", "3.": "no", YES: "yes", "Partly!": "partly", no: "no", "አዎ": "yes", "በከፊል": "partly", "አይ።": "no", "አልረዳኝም": "no" };
  for (const [text, expected] of Object.entries(cases)) assert.equal(parseFollowUpReply(text), expected, text);
  for (const text of ["1 more question", "yes I want to talk to my reviewer", "hello", "12", ""]) assert.equal(parseFollowUpReply(text), null, text);
});

test("only the owner can answer, and only after the check-in was sent", async () => {
  const { store, service, advanceDays } = setup();
  await service.scheduleForCase(caseRecord(), "Career");
  const id = store.rows[0].id;
  assert.equal(await service.answer("user-1", id, { helped: "yes" }), null, "not sent yet");
  advanceDays(3);
  await service.sendDue();
  assert.equal(await service.answer("someone-else", id, { helped: "yes" }), null);
  const saved = await service.answer("user-1", id, { helped: "yes", comment: "  Much better  " });
  assert.equal(saved.helped, "yes");
  assert.equal(saved.comment, "Much better");
  assert.equal(saved.answeredVia, "app");
  assert.equal(saved.needsAttention, false);
});

test("side effects or 'did not help' flag the check-in and alert the reviewer once", async () => {
  const { store, service, alerts, advanceDays } = setup();
  await service.scheduleForCase(caseRecord(), "Career");
  advanceDays(3);
  await service.sendDue();
  const id = store.rows[0].id;
  const saved = await service.answer("user-1", id, { helped: "partly", sideEffects: "Stomach cramps after the tea" });
  assert.equal(saved.needsAttention, true);
  await service.answer("user-1", id, { helped: "partly", sideEffects: "Stomach cramps, a little better now" });
  assert.deepEqual(alerts, [id], "an edited answer does not alert twice");

  const other = setup();
  await other.service.scheduleForCase(caseRecord(), "Career");
  other.advanceDays(3);
  await other.service.sendDue();
  await other.service.answerFromChat("user-1", "3", "telegram");
  assert.equal(other.alerts.length, 1);
});

test("a chat reply answers the latest open check-in within 7 days", async () => {
  const { store, service, advanceDays } = setup();
  await service.scheduleForCase(caseRecord(), "Career");
  assert.equal(await service.answerFromChat("user-1", "1", "telegram"), null, "nothing sent yet");
  advanceDays(3);
  await service.sendDue();
  assert.equal(await service.answerFromChat("user-1", "please call me", "telegram"), null);
  const answered = await service.answerFromChat("user-1", "1", "whatsapp");
  assert.equal(answered.helped, "yes");
  assert.equal(store.rows[0].answeredVia, "whatsapp");
  assert.equal(await service.answerFromChat("user-1", "1", "whatsapp"), null, "already answered");

  advanceDays(11);
  await service.sendDue();
  advanceDays(8);
  assert.equal(await service.answerFromChat("user-1", "2", "telegram"), null, "too long after it was sent");
});

// ─── Hooks ───────────────────────────────────────────────────────────────────

function inboundDeps(overrides = {}) {
  const replies = [];
  return {
    replies,
    deps: {
      appUrl: "https://app.example.et",
      findUser: async () => ({ id: "user-1" }),
      currentLink: async () => null,
      link: async () => true,
      setNotify: async () => undefined,
      cases: {
        replyFromChannel: async (_userId, body) => {
          replies.push(body);
          return { caseId: "case-1", label: "Career" };
        },
        statusFor: async () => [],
      },
      ...overrides,
    },
  };
}

test("the bot records a one-word reply as the check-in answer before treating it as a message", async () => {
  const { deps, replies } = inboundDeps({
    followUps: { answerFromChat: async (_userId, text) => (text === "1" ? { helped: "yes", label: "Career", href: "/case/workflows/case-1?followUp=fu-1" } : null) },
  });
  const reply = await handleInbound("telegram", "chat-1", "1", deps);
  assert.match(reply.text, /glad it helped/);
  assert.equal(reply.link.url, "https://app.example.et/case/workflows/case-1?followUp=fu-1");
  assert.deepEqual(replies, []);

  const other = await handleInbound("telegram", "chat-1", "I have a new question", deps);
  assert.match(other.text, /Your reply was added/);
  assert.deepEqual(replies, ["I have a new question"]);
});

test("a free report released on approval schedules check-ins through the case workflow", async () => {
  const delivered = [];
  const svc = createCaseService({
    store: createMemoryCaseStore(),
    billing: {
      pricing: async (_domain, defaults) => ({ ...defaults, reportEtb: 0 }),
      checkout: async () => ({ purchaseId: "p", checkoutUrl: "/pay" }),
      submitManual: async () => ({ purchaseId: "m" }),
      verify: async () => ({ paid: false }),
      latest: async () => null,
    },
    loadExpert: async (id) => ({ id, role: "expert", practitionerCredentials: { verifiedAt: "2026-01-01", domains: ["career"] } }),
    expertSummaries: async (ids) => new Map(ids.map((id) => [id, { id, name: "Expert", credential: "Debtera" }])),
    onDelivered: async (record) => delivered.push(record.stage),
  });
  const owner = { id: "user-1", role: "user", permissions: [] };
  const expert = { id: "expert-1", role: "expert", permissions: [] };
  let view = await svc.start(owner, "career", { safetyAnswers: { basic_needs: "yes_comfortable", self_harm: "no", financial_pressure: "no" }, answers: {} });
  for (let round = 0; round < 3 && view.stage === "intake"; round++) {
    view = await svc.answer(owner, view.id, Object.fromEntries(view.questions.filter((q) => q.required).map((q) => [q.id, q.options?.[0]?.value ?? "ሰላማዊት"])));
  }
  view = await svc.submit(owner, view.id);
  await svc.claim(expert, view.id);
  const checklist = Object.fromEntries(DOMAIN_CONFIGS.career.reviewChecklist.map((item) => [item.id, true]));
  await svc.approve(expert, view.id, { checklist, notes: "Reviewed." });
  assert.deepEqual(delivered, ["full_report_released"]);
});

test("answering a check-in requires sign-in", async () => {
  const { POST } = await import("../app/api/follow-ups/[id]/route.ts");
  const res = await POST(
    new NextRequest("http://localhost/api/follow-ups/fu-1", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ helped: "yes" }) }),
    { params: Promise.resolve({ id: "fu-1" }) },
  );
  assert.equal(res.status, 401);
});

test("the follow-ups migration is accepted by the table-prefix rewriter", () => {
  const source = fs.readFileSync(path.resolve(import.meta.dirname, "../../drizzle-mysql/0005_follow_ups.sql"), "utf8");
  const [statement] = migrationStatements(source, "wa_");
  assert.match(statement, /CREATE TABLE IF NOT EXISTS `wa_follow_ups`/);
  assert.match(statement, /REFERENCES `wa_workflow_cases`/);
  assert.match(statement, /CONSTRAINT `wa_follow_ups_case_fk`/);
});
