import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, computeSlots, localToUtc, todayIn, tzOffsetMinutes, weekdayOf } from "../server/marketplace/time.ts";
import { bookingReference, canTransition, paymentStatus } from "../server/marketplace/bookingRules.ts";
import { roleCan } from "../server/marketplace/access.ts";
import { slugify } from "../server/marketplace/businesses.ts";

test("Addis Ababa wall-clock times convert to UTC (UTC+3, no DST)", () => {
  assert.equal(tzOffsetMinutes(new Date("2026-07-01T00:00:00Z"), "Africa/Addis_Ababa"), 180);
  assert.equal(localToUtc("2026-10-01", 9 * 60, "Africa/Addis_Ababa").toISOString(), "2026-10-01T06:00:00.000Z");
  assert.equal(localToUtc("2026-10-01", 0, "Africa/Addis_Ababa").toISOString(), "2026-09-30T21:00:00.000Z");
  assert.equal(todayIn("Africa/Addis_Ababa", new Date("2026-09-30T22:30:00Z")), "2026-10-01", "local date rolls over at local midnight");
});

test("DST zones resolve correctly", () => {
  assert.equal(localToUtc("2026-07-01", 9 * 60, "Europe/London").toISOString(), "2026-07-01T08:00:00.000Z");
  assert.equal(localToUtc("2026-01-15", 9 * 60, "Europe/London").toISOString(), "2026-01-15T09:00:00.000Z");
});

test("calendar helpers", () => {
  assert.equal(weekdayOf("2026-09-28"), 1);
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});

test("slots respect windows, busy time, duration and lead time", () => {
  const minute = 60_000;
  const window = { start: 0, end: 4 * 60 * minute };
  const slots = computeSlots({ windows: [window], busy: [{ start: 60 * minute, end: 120 * minute }], duration: 60 * minute, step: 30 * minute, notBefore: 30 * minute });
  assert.deepEqual(slots.map((s) => s / minute), [120, 150, 180]);
  assert.deepEqual(computeSlots({ windows: [window], busy: [], duration: 5 * 60 * minute, step: 15 * minute, notBefore: 0 }), [], "a service longer than the window has no slots");
});

test("booking transitions", () => {
  const future = new Date(Date.now() + 86_400_000);
  const past = new Date(Date.now() - 3_600_000);
  assert.equal(canTransition({ from: "requested", to: "confirmed", actor: "business", startsAt: future }).ok, true);
  assert.equal(canTransition({ from: "requested", to: "confirmed", actor: "client", startsAt: future }).ok, false, "clients cannot confirm");
  assert.equal(canTransition({ from: "confirmed", to: "cancelled", actor: "client", startsAt: future }).ok, true);
  assert.equal(canTransition({ from: "confirmed", to: "cancelled", actor: "client", startsAt: past }).ok, false, "no client cancellation after start");
  assert.equal(canTransition({ from: "confirmed", to: "completed", actor: "business", startsAt: future }).ok, false, "cannot complete early");
  assert.equal(canTransition({ from: "confirmed", to: "completed", actor: "business", startsAt: past }).ok, true);
  assert.equal(canTransition({ from: "completed", to: "cancelled", actor: "business", startsAt: past }).ok, false, "completed is final");
  assert.equal(canTransition({ from: "declined", to: "confirmed", actor: "business", startsAt: future }).ok, false);
});

test("payment status and references", () => {
  assert.equal(paymentStatus(400, 0), "unpaid");
  assert.equal(paymentStatus(400, 150), "partial");
  assert.equal(paymentStatus(400, 400), "paid");
  assert.equal(paymentStatus(400, 399.999), "paid", "sub-cent rounding counts as paid");
  const refs = new Set(Array.from({ length: 500 }, bookingReference));
  assert.equal(refs.size, 500);
  for (const ref of refs) assert.match(ref, /^BK-[A-HJ-NP-Z2-9]{6}$/);
});

test("role capabilities", () => {
  assert.equal(roleCan("owner", "manageTeam"), true);
  assert.equal(roleCan("manager", "manageTeam"), false);
  assert.equal(roleCan("staff", "viewClientNotes"), false, "front-desk staff do not see practitioner notes");
  assert.equal(roleCan("staff", "recordPayments"), true);
  assert.equal(roleCan("practitioner", "voidPayments"), false);
});

test("slugs", () => {
  assert.equal(slugify("Tena Herbal & Sons"), "tena-herbal-sons");
  assert.equal(slugify("ጤና አዳም"), "business", "non-Latin names fall back to a safe slug");
});
