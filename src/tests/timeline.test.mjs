/**
 * The personal health timeline: events from the person's own records, newest first, an outcome
 * trend from their check-in answers, and a summary that contains only what they entered or received.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  bookingEvents,
  caseEvents,
  checkInEvents,
  clinicianSummary,
  mergeTimeline,
  nutritionReportEvents,
  outcomeTrend,
  symptomCheckEvents,
} from "../server/timeline/timeline.ts";

const caseRecord = (overrides = {}) => ({
  id: "case-1",
  stage: "full_report_released",
  createdAt: "2026-01-01T08:00:00.000Z",
  auditTrail: [{ type: "submitted", actorId: "u", at: "2026-01-01T09:00:00.000Z" }],
  review: { expertId: "e", claimedAt: "2026-01-02T08:00:00.000Z", approvedAt: "2026-01-03T08:00:00.000Z" },
  foodHerbNotes: [{ id: "n1", kind: "herb", items: [{ id: "a", name: "Damakesse" }, { id: "b", name: "Tena adam" }], source: "typed", at: "2026-01-02T10:00:00.000Z" }],
  consultation: null,
  ...overrides,
});

const checkIn = (helped, answeredAt, extra = {}) => ({ id: `c-${answeredAt}`, caseId: "case-1", bookingId: null, label: "Career", dayOffset: 3, answeredAt, helped, sideEffects: null, comment: null, ...extra });

test("a request becomes started, sent, report-ready and shared-plants events", () => {
  const events = caseEvents(caseRecord(), "Career");
  assert.deepEqual(events.map((event) => [event.kind, event.title]), [
    ["request", "Started a Career request"],
    ["request", "Sent the Career request for review"],
    ["report", "Career report ready"],
    ["food_herb", "Shared plants or herbs"],
  ]);
  assert.equal(events[3].detail, "Damakesse, Tena adam");
  assert.ok(events.every((event) => event.href === "/case/workflows/case-1"));
  const crisis = caseEvents(caseRecord({ stage: "crisis_routed", review: null, auditTrail: [], foodHerbNotes: [] }), "Career");
  assert.equal(crisis.find((event) => event.tone === "danger").title, "Urgent support was shared");
});

test("check-ins, bookings, symptom checks and nutrition reports become events", () => {
  const [helped, worse] = checkInEvents([checkIn("yes", "2026-01-05T00:00:00.000Z"), checkIn("no", "2026-01-20T00:00:00.000Z", { sideEffects: "Stomach pain" })]);
  assert.equal(helped.title, "Career: it helped");
  assert.equal(helped.tone, "good");
  assert.equal(worse.tone, "warning");
  assert.match(worse.detail, /Side effects: Stomach pain/);

  const bookings = bookingEvents([
    { id: "b1", serviceName: "Herbal consultation", businessName: "Addis Herbs", startsAt: new Date("2026-01-04T10:00:00Z"), status: "completed" },
    { id: "b2", serviceName: "Massage", businessName: "Spa", startsAt: new Date("2026-01-06T10:00:00Z"), status: "cancelled" },
  ]);
  assert.deepEqual(bookings.map((event) => event.title), ["Session: Herbal consultation"]);

  const [symptom] = symptomCheckEvents([{ id: "s1", query: "Chest pain when climbing stairs ".repeat(10), urgencyLevel: "high", createdAt: new Date("2026-01-07T00:00:00Z") }]);
  assert.equal(symptom.tone, "danger");
  assert.ok(symptom.detail.length <= 120);
  assert.equal(nutritionReportEvents([{ id: "r1", generatedAt: new Date("2026-01-08T00:00:00Z") }])[0].href, "/report/r1");
});

test("the timeline is newest first", () => {
  const merged = mergeTimeline(caseEvents(caseRecord(), "Career"), checkInEvents([checkIn("yes", "2026-02-01T00:00:00.000Z")]));
  assert.equal(merged[0].kind, "check_in");
  assert.ok(merged.every((event, index) => index === 0 || merged[index - 1].at >= event.at));
});

test("the outcome trend compares the two latest answers with earlier ones", () => {
  assert.deepEqual(outcomeTrend([]), { answered: 0, helpedRate: null, direction: "unknown", sideEffects: 0 });
  const better = outcomeTrend([checkIn("no", "2026-01-01"), checkIn("partly", "2026-01-10"), checkIn("yes", "2026-01-20"), checkIn("yes", "2026-01-30")]);
  assert.equal(better.direction, "improving");
  assert.equal(better.helpedRate, 63);
  const worse = outcomeTrend([checkIn("yes", "2026-01-01"), checkIn("yes", "2026-01-10"), checkIn("no", "2026-01-20", { sideEffects: "Rash" }), checkIn("no", "2026-01-30")]);
  assert.equal(worse.direction, "worse");
  assert.equal(worse.sideEffects, 1);
  assert.equal(outcomeTrend([checkIn("yes", "2026-01-01"), checkIn("no", "2026-01-02")]).direction, "unknown", "two answers are not a trend");
});

test("the clinician summary holds only what the person entered or received", () => {
  const summary = clinicianSummary(
    [{ ...caseRecord(), label: "Career" }, { ...caseRecord({ id: "case-2", stage: "in_review", review: null, foodHerbNotes: [] }), label: "Belonging & Community" }],
    [checkIn("partly", "2026-01-05T00:00:00.000Z", { sideEffects: "Headache" })],
  );
  assert.deepEqual(summary.openRequests.map((item) => item.label), ["Belonging & Community"]);
  assert.deepEqual(summary.reports.map((item) => item.label), ["Career"]);
  assert.deepEqual(summary.sideEffects.map((item) => item.text), ["Headache"]);
  assert.deepEqual(summary.foodsAndPlants, ["Damakesse", "Tena adam"]);
  assert.equal(summary.outcome.answered, 1);
});

test("the timeline is only for the signed-in person", async () => {
  const { GET } = await import("../app/api/account/timeline/route.ts");
  const res = await GET(new NextRequest("http://localhost/api/account/timeline"), { params: Promise.resolve({}) });
  assert.equal(res.status, 401);
});
