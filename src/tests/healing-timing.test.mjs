import test from "node:test";
import assert from "node:assert/strict";

import {
  ethiopianClock,
  ethiopianEaster,
  fromEthiopianDate,
  localClock,
  localMidnight,
  observancesFor,
  principalPhases,
  skyDay,
  skyDays,
  toEthiopianDate,
} from "../lib/cosmic/skyDay.ts";
import { bestWindows, intentByKey, scoreWindows } from "../lib/cosmic/healingTiming.ts";
import { weatherAt } from "../lib/cosmic/weather.ts";

const ADDIS = { name: "Addis Ababa", latitude: 9.03, longitude: 38.74, altitudeMeters: 2355, utcOffsetHours: 3 };
const HOUR = 3_600_000;

const observances = (date) => observancesFor(date, new Date(`${date}T00:00:00Z`).getUTCDay(), toEthiopianDate(date));

test("Ethiopian calendar conversions match known dates", () => {
  assert.equal(toEthiopianDate("2025-09-11").label, "መስከረም 1, 2018 ዓ.ም.");
  assert.equal(toEthiopianDate("2023-09-12").label, "መስከረም 1, 2016 ዓ.ም.");
  assert.equal(toEthiopianDate("2026-01-07").label, "ታኅሣሥ 29, 2018 ዓ.ም.");
  assert.equal(toEthiopianDate("2027-09-11").label, "ጳጉሜን 6, 2019 ዓ.ም.");
  assert.equal(toEthiopianDate("2026-10-14").label, "ጥቅምት 4, 2019 ዓ.ም.");
  assert.equal(fromEthiopianDate(2019, 1, 1), "2026-09-11");
  for (const date of ["2024-02-29", "2026-06-30", "2027-09-12", "2031-01-01"]) {
    const e = toEthiopianDate(date);
    assert.equal(fromEthiopianDate(e.year, e.month, e.day), date);
  }
});

test("Ethiopian Easter and the movable fasts", () => {
  assert.equal(ethiopianEaster(2025), "2025-04-20");
  assert.equal(ethiopianEaster(2026), "2026-04-12");
  assert.equal(ethiopianEaster(2027), "2027-05-02");
  assert.equal(observances("2026-02-02").fast?.key, "nineveh");
  assert.equal(observances("2026-02-16").fast?.key, "abiy-tsom");
  assert.equal(observances("2026-04-12").feasts[0]?.key, "fasika");
  // A Wednesday inside the fifty days after Easter is not a fast.
  assert.equal(observances("2026-04-15").fast, null);
  assert.equal(observances("2026-07-11").fast?.key, "apostles");
  assert.equal(observances("2026-07-12").fast, null);
  assert.equal(observances("2026-08-10").fast?.key, "filseta");
  assert.equal(observances("2026-12-01").fast?.key, "nebiyat");
  assert.equal(observances("2026-10-14").fast?.key, "wednesday");
  assert.equal(observances("2026-10-22").commemoration?.key, "michael");
});

test("Moon phases fall at the published times", () => {
  const start = localMidnight("2026-10-01", 3);
  const events = principalPhases(start, start + 40 * 24 * HOUR);
  const newMoon = events.find((e) => e.phase === "new");
  const fullMoon = events.find((e) => e.phase === "full");
  // 2026-10-10 15:50 UTC and 2026-10-26 04:12 UTC.
  assert.ok(Math.abs(newMoon.at - Date.UTC(2026, 9, 10, 15, 50)) < 10 * 60_000);
  assert.ok(Math.abs(fullMoon.at - Date.UTC(2026, 9, 26, 4, 12)) < 10 * 60_000);
});

test("Sun times, Ethiopian clock and planetary hours for Addis Ababa", () => {
  const day = skyDay("2026-10-14", ADDIS);
  const sunrise = localClock(day.sun.sunrise, 3);
  assert.ok(sunrise >= "06:05" && sunrise <= "06:18", sunrise);
  assert.ok(day.sun.dayLengthHours > 11.7 && day.sun.dayLengthHours < 12.1);
  assert.equal(day.planetaryHours.length, 24);
  // Wednesday: the first hour after sunrise is Mercury's.
  assert.equal(day.planetaryHours[0].ruler, "Mercury");
  for (let i = 1; i < 24; i++) assert.ok(Math.abs(day.planetaryHours[i].start - day.planetaryHours[i - 1].end) < 1);
  assert.equal(skyDay("2026-10-18", ADDIS).planetaryHours[0].ruler, "Sun");

  const at = (h, m = 0) => Date.UTC(2026, 9, 14, h - 3, m);
  assert.equal(ethiopianClock(at(9), 3).label, "ከጠዋቱ 3:00");
  assert.equal(ethiopianClock(at(6), 3).label, "ከጠዋቱ 12:00");
  assert.equal(ethiopianClock(at(13, 30), 3).label, "ከቀኑ 7:30");
  assert.equal(ethiopianClock(at(20), 3).label, "ከምሽቱ 2:00");
  assert.equal(ethiopianClock(at(2), 3).label, "ከሌሊቱ 8:00");
});

test("Windows follow the chosen moon, hours and weather", () => {
  const days = skyDays("2026-10-14", 30, ADDIS);
  const now = localMidnight("2026-10-14", 3);
  const roots = scoreWindows(days, intentByKey("harvest-roots").defaults, null, now, 3);
  const top = bestWindows(roots, 5);
  assert.equal(top.length, 5);
  for (const window of top) {
    assert.equal(window.moon.waxing, false, "roots are gathered on a waning moon");
    assert.ok(["Saturn", "Moon"].includes(window.ruler));
    assert.ok(["dawn", "evening"].includes(window.timeOfDay));
  }

  // A rainy forecast for every hour pushes dry-weather work down and says why.
  const first = days[0].planetaryHours[0].start - HOUR;
  const rainy = {
    source: "open-meteo", latitude: 9, longitude: 38.7, elevation: 2355, utcOffsetHours: 3, fetchedAt: now, daily: [],
    hourly: Array.from({ length: 24 * 3 }, (_, i) => ({ at: first + i * HOUR, temperature: 15, precipitationProbability: 90, precipitation: 4, weatherCode: 63, humidity: 90, windSpeed: 8, cloudCover: 100, uvIndex: 1 })),
  };
  assert.equal(weatherAt(rainy, first + 30 * 60_000)?.precipitationProbability, 90);
  const prefs = intentByKey("preparation").defaults;
  const dry = scoreWindows(days.slice(0, 2), prefs, null, now, 3);
  const wet = scoreWindows(days.slice(0, 2), prefs, rainy, now, 3);
  assert.ok(wet[2].score < dry[2].score);
  assert.ok(wet[2].reasons.some((r) => r.tone === "bad" && r.text.includes("chance of rain")));

  // Body region: no top window falls while the Moon is in the sign governing that region.
  const body = scoreWindows(days, { ...intentByKey("bodywork").defaults, bodyRegion: "head" }, null, now, 3);
  for (const window of bestWindows(body, 8)) assert.notEqual(window.moon.bodyRegion, "head");
});
