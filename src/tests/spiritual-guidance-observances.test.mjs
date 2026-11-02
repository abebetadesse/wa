import test from "node:test";
import assert from "node:assert/strict";

import { observancesOn } from "../lib/spiritual-guidance/observances.ts";
import { CALENDAR_DAY_DEFAULTS, LETTER_VALUE_DEFAULTS, SERVICE_DEFAULTS, weightProblem } from "../lib/spiritual-guidance/defaults.ts";
import { dateRange, gregorianToEthiopian, hijriToGregorian, weekdayOf, westernEaster } from "../lib/spiritual-guidance/calendar.ts";
import { observancesFor, toEthiopianDate } from "../lib/cosmic/skyDay.ts";

const keys = (date, tradition) => observancesOn(date, CALENDAR_DAY_DEFAULTS.filter((r) => r.tradition === tradition)).map((r) => r.entryKey);

test("Western Easter matches known dates", () => {
  assert.equal(westernEaster(2024), "2024-03-31");
  assert.equal(westernEaster(2025), "2025-04-20");
  assert.equal(westernEaster(2026), "2026-04-05");
  assert.equal(westernEaster(2027), "2027-03-28");
  assert.equal(westernEaster(2038), "2038-04-25");
});

test("The default Orthodox rules give the same fasts, feasts and commemorations as the healing planner", () => {
  // Two Ethiopian years in which Genna is 29 Tahsas, so both calendars agree on it.
  for (const date of dateRange("2025-09-11", "2027-09-10")) {
    const expected = observancesFor(date, weekdayOf(date), toEthiopianDate(date));
    const found = observancesOn(date, CALENDAR_DAY_DEFAULTS.filter((r) => r.tradition === "orthodox"));
    const fasts = found.filter((r) => r.kind === "fast").map((r) => r.entryKey);
    if (expected.fast) assert.ok(fasts.includes(expected.fast.key), `${date}: expected ${expected.fast.key}, got ${fasts}`);
    else assert.deepEqual(fasts, [], `${date}: no fast expected`);
    for (const feast of expected.feasts) {
      const key = feast.key === "meskel-feast" ? "meskel" : feast.key;
      assert.ok(found.some((r) => r.entryKey === key), `${date}: expected ${key}`);
    }
    if (expected.commemoration) assert.ok(found.some((r) => r.entryKey === `monthly-${expected.commemoration.key}`), `${date}: ${expected.commemoration.key}`);
  }
});

test("Genna stays on 7 January, which is 28 Tahsas after an Ethiopian leap year", () => {
  const e = gregorianToEthiopian("2028-01-07");
  assert.deepEqual([e.month, e.day], [4, 28]);
  assert.ok(keys("2028-01-07", "orthodox").includes("genna"));
  // The Advent fast ends the day before.
  assert.ok(!keys("2028-01-07", "orthodox").includes("nebiyat"));
  assert.ok(keys("2028-01-06", "orthodox").includes("nebiyat"));
});

test("Muslim rules follow the Hijri calendar", () => {
  assert.ok(keys("2026-03-01", "muslim").includes("ramadan"));
  assert.ok(keys("2026-03-20", "muslim").includes("eid-al-fitr"));
  assert.ok(!keys("2026-03-20", "muslim").includes("ramadan"));
  assert.ok(keys(hijriToGregorian(1447, 12, 10), "muslim").includes("eid-al-adha"));
  assert.ok(keys("2026-11-06", "muslim").includes("friday"));
  // An announced Ramadan start moves the whole month.
  const announced = [{ year: 1448, month: 9, start: "2027-02-09" }];
  const rules = CALENDAR_DAY_DEFAULTS.filter((r) => r.tradition === "muslim");
  const before = observancesOn("2027-02-08", rules, announced).map((r) => r.entryKey);
  assert.ok(!before.includes("ramadan"));
  assert.ok(observancesOn("2027-02-09", rules, announced).some((r) => r.entryKey === "ramadan"));
});

test("Public holidays close offices", () => {
  for (const date of ["2026-09-11", "2027-01-07", "2027-03-02", "2027-05-01", "2026-03-20"]) {
    const found = observancesOn(date, CALENDAR_DAY_DEFAULTS.filter((r) => r.tradition === "public"));
    assert.ok(found.some((r) => r.effects.officesClosed), `${date} should be a public holiday`);
  }
  assert.deepEqual(keys("2026-11-02", "public"), []);
});

test("Catholic and Protestant defaults mark Sunday and Easter", () => {
  assert.ok(keys("2026-11-01", "catholic").includes("sunday"));
  assert.ok(keys("2026-04-12", "protestant").includes("easter"));
});

test("Default services have valid weights and every method name is known", () => {
  assert.equal(SERVICE_DEFAULTS.length, 10);
  for (const service of SERVICE_DEFAULTS) assert.equal(weightProblem(service.mode, service.weights), null, service.slug);
  assert.match(weightProblem("date", { moon: 50, numerology: 40 }), /add up to 90/);
  assert.match(weightProblem("date", { luck: 100 }), /Unknown method/);
  const shop = SERVICE_DEFAULTS.find((s) => s.slug === "shop_opening");
  assert.deepEqual(shop.weights, { awde_negest: 25, numerology: 20, moon: 20, astrology: 15, hexagram: 10, religion: 10 });
});

test("Letter defaults: unvalidated Awde Negest values, standard numerology values", () => {
  const awde = LETTER_VALUE_DEFAULTS.filter((r) => r.system === "awde_negest");
  assert.ok(awde.length > 200);
  assert.ok(awde.every((r) => !r.validated));
  const pyth = Object.fromEntries(LETTER_VALUE_DEFAULTS.filter((r) => r.system === "pythagorean").map((r) => [r.letter, r.value]));
  assert.deepEqual([pyth.A, pyth.I, pyth.J, pyth.S, pyth.Z], [1, 9, 1, 1, 8]);
  const unique = new Set(LETTER_VALUE_DEFAULTS.map((r) => `${r.system}:${r.letter}`));
  assert.equal(unique.size, LETTER_VALUE_DEFAULTS.length);
});
