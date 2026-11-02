import test from "node:test";
import assert from "node:assert/strict";

import { moonDay, moonTheme } from "../lib/spiritual-guidance/moon.ts";
import { ascendantLongitude, dailyTransits, natalChart, voidOfCourseOn } from "../lib/spiritual-guidance/astrology.ts";
import { ADDIS_ABABA, longitude, signOf } from "../lib/spiritual-guidance/ephemeris.ts";
import { dateRange } from "../lib/spiritual-guidance/calendar.ts";

const MINUTE = 60_000;

function near(actualIso, expectedIso, toleranceMinutes, label) {
  const diff = Math.abs(Date.parse(actualIso) - Date.parse(expectedIso)) / MINUTE;
  assert.ok(diff <= toleranceMinutes, `${label}: ${actualIso} is ${diff.toFixed(1)} min from ${expectedIso}`);
}

test("Quarter phases land on the day and minute of the published times", () => {
  // Published UTC instants (NASA / US Naval Observatory) for late 2026.
  const quarters = [
    ["2026-11-09", "new", "2026-11-09T07:02:00Z"],
    ["2026-11-17", "first-quarter", "2026-11-17T11:48:00Z"],
    ["2026-11-24", "full", "2026-11-24T14:53:00Z"],
    ["2026-12-01", "last-quarter", "2026-12-01T06:08:00Z"],
  ];
  for (const [date, phase, instant] of quarters) {
    const moon = moonDay(date);
    assert.equal(moon.phase, phase, date);
    near(moon.quarter.time, instant, 2, `${phase} on ${date}`);
  }
});

test("Days between quarters are crescent or gibbous, with sensible light and age", () => {
  const before = moonDay("2026-11-23");
  assert.equal(before.phase, "waxing-gibbous");
  assert.ok(before.illumination > 0.9 && before.illumination < 1);
  assert.ok(before.ageDays > 13 && before.ageDays < 15);
  assert.equal(before.waxing, true);
  const after = moonDay("2026-11-02");
  assert.equal(after.phase, "waning-crescent");
  assert.equal(after.waxing, false);
  assert.ok(after.ageDays > 22 && after.ageDays < 24);
  assert.equal(moonDay("2026-11-09").illumination < 0.01, true);
});

test("Every day of a lunar year has exactly one phase name and a quarter about once a week", () => {
  const days = dateRange("2027-01-01", "2027-12-31").map((d) => moonDay(d));
  const quarterDays = days.filter((m) => m.quarter);
  // 12 or 13 of each principal phase in a year.
  assert.ok(quarterDays.length >= 48 && quarterDays.length <= 52, `${quarterDays.length} quarter days`);
  for (let i = 1; i < days.length; i++) {
    assert.ok(days[i].ageDays >= 0 && days[i].ageDays < 29.9);
    // Illumination changes smoothly: never more than ~13% between consecutive noons.
    assert.ok(Math.abs(days[i].illumination - days[i - 1].illumination) < 0.14);
  }
});

test("Moonrise and moonset are local times on the day, or absent when the Moon does not rise or set that day", () => {
  const full = moonDay("2026-11-24");
  // A full Moon rises around sunset.
  assert.ok(full.moonrise && full.moonrise.local >= "17:00" && full.moonrise.local <= "19:00", full.moonrise?.local);
  const days = dateRange("2026-11-01", "2026-11-30").map((d) => moonDay(d));
  assert.ok(days.some((m) => m.moonrise === null || m.moonset === null), "about once a month the Moon misses a rise or a set");
  for (const m of days) {
    if (m.moonrise) assert.equal(m.moonrise.time.slice(0, 10) <= m.date, true);
  }
});

test("Moon sign and sign changes", () => {
  const full = moonDay("2026-11-24");
  assert.equal(full.sign.sign, "Taurus");
  assert.equal(full.signChange?.to.sign, "Gemini");
  const signChanges = dateRange("2026-11-01", "2026-11-30").filter((d) => moonDay(d).signChange).length;
  // The Moon changes sign every 2–3 days.
  assert.ok(signChanges >= 11 && signChanges <= 14, `${signChanges} sign changes`);
});

test("Moon themes follow the cycle", () => {
  assert.equal(moonTheme("new"), "planning");
  assert.equal(moonTheme("waxing-gibbous"), "growth");
  assert.equal(moonTheme("full"), "completion");
  assert.equal(moonTheme("waning-crescent"), "release");
});

test("Mercury retrograde from 24 October to 13 November 2026", () => {
  assert.equal(dailyTransits("2026-10-22").mercuryRetrograde, false);
  assert.ok(dailyTransits("2026-10-24").stations.some((s) => s.planet === "Mercury" && s.turns === "retrograde"));
  assert.equal(dailyTransits("2026-11-02").mercuryRetrograde, true);
  assert.ok(dailyTransits("2026-11-13").stations.some((s) => s.planet === "Mercury" && s.turns === "direct"));
  assert.equal(dailyTransits("2026-11-16").mercuryRetrograde, false);
  // Venus turns direct on 14 November 2026.
  assert.ok(dailyTransits("2026-11-14").stations.some((s) => s.planet === "Venus" && s.turns === "direct"));
});

test("A void-of-course Moon ends when the Moon enters the next sign", () => {
  const days = dateRange("2026-11-01", "2026-11-30");
  let periods = 0;
  for (const date of days) {
    for (const v of voidOfCourseOn(date)) {
      periods++;
      assert.ok(Date.parse(v.end) > Date.parse(v.start));
      // The void ends at an ingress: the Moon is in the void's sign just before and in the next sign just after.
      assert.equal(signOf(longitude("Moon", Date.parse(v.end) - 2 * MINUTE)).sign, v.sign);
      assert.notEqual(signOf(longitude("Moon", Date.parse(v.end) + 2 * MINUTE)).sign, v.sign);
      assert.ok(v.hoursThisDay > 0 && v.hoursThisDay <= 24);
    }
  }
  // Roughly one void per sign: 12–14 in a month (some span two days and are counted twice).
  assert.ok(periods >= 12 && periods <= 30, `${periods} void periods`);
  // Fewer planets, never a later void start.
  const traditional = voidOfCourseOn("2026-10-23", ADDIS_ABABA, ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]);
  const modern = voidOfCourseOn("2026-10-23");
  assert.ok(Date.parse(traditional[0].start) <= Date.parse(modern[0].start));
});

test("Birth chart: Sun, Moon and rising sign; honest about an unknown birth time", () => {
  const timed = natalChart({ date: "1990-05-15", time: "08:30", place: ADDIS_ABABA });
  assert.equal(timed.sun.sign, "Taurus");
  assert.equal(timed.moon.sign, "Capricorn");
  assert.ok(timed.rising);
  const untimed = natalChart({ date: "1990-05-15" });
  assert.equal(untimed.rising, null);
  assert.equal(untimed.moon, null);
  assert.ok(untimed.notes.length >= 1);
  // On the day of an ingress the Sun sign is flagged as uncertain without a time.
  const cusp = natalChart({ date: "2026-12-21" });
  assert.equal(cusp.sun.certain, false);
  assert.throws(() => natalChart({ date: "1990-05-15", time: "25:00" }));
});

test("The ascendant at the equator with the equinox on the meridian is 0° Cancer", () => {
  // Find an instant when local sidereal time at 0° E is 0h: the ascendant should then be 90° at the equator.
  const ms = Date.parse("2026-09-22T00:00:00Z");
  let best = null;
  for (let minutes = 0; minutes < 24 * 60; minutes++) {
    const asc = ascendantLongitude(ms + minutes * MINUTE, 0, 0);
    if (best === null || Math.abs(asc - 90) < Math.abs(best - 90)) best = asc;
  }
  assert.ok(Math.abs(best - 90) < 0.3, String(best));
});

test("A 90-day search of Moon and transits is fast enough", () => {
  const start = performance.now();
  for (const date of dateRange("2028-01-01", "2028-03-30")) {
    moonDay(date);
    dailyTransits(date);
  }
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 2500, `${elapsed.toFixed(0)} ms`);
});
