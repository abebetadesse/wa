import test from "node:test";
import assert from "node:assert/strict";

import {
  CalendarError,
  addDays,
  dateRange,
  describeDate,
  ethiopianToGregorian,
  gregorianToEthiopian,
  gregorianToHijri,
  hijriToGregorian,
  isEthiopianLeapYear,
  islamicObservancesFor,
} from "../lib/spiritual-guidance/calendar.ts";

test("Ethiopian leap years carry 6 Pagume, common years only 5", () => {
  assert.equal(isEthiopianLeapYear(2015), true);
  assert.equal(isEthiopianLeapYear(2019), true);
  assert.equal(isEthiopianLeapYear(2018), false);
  assert.equal(isEthiopianLeapYear(2020), false);
  assert.equal(ethiopianToGregorian(2015, 13, 6), "2023-09-11");
  assert.equal(ethiopianToGregorian(2016, 1, 1), "2023-09-12");
  assert.equal(ethiopianToGregorian(2018, 13, 5), "2026-09-10");
  assert.equal(ethiopianToGregorian(2019, 1, 1), "2026-09-11");
  assert.equal(ethiopianToGregorian(2019, 13, 6), "2027-09-11");
  assert.throws(() => ethiopianToGregorian(2018, 13, 6), CalendarError);
  assert.throws(() => ethiopianToGregorian(2019, 14, 1), CalendarError);
  assert.throws(() => ethiopianToGregorian(2019, 2, 31), CalendarError);
});

test("Gregorian to Ethiopian matches known dates, including the brief's example", () => {
  const today = gregorianToEthiopian("2026-11-02");
  assert.deepEqual([today.year, today.month, today.day], [2019, 2, 23]);
  const genna = gregorianToEthiopian("2027-01-07");
  assert.deepEqual([genna.year, genna.month, genna.day], [2019, 4, 29]);
  // Gregorian 29 February round-trips in both directions.
  for (const date of ["2024-02-29", "2028-02-29", "2100-03-01"]) {
    const e = gregorianToEthiopian(date);
    assert.equal(ethiopianToGregorian(e.year, e.month, e.day), date);
  }
  assert.throws(() => gregorianToEthiopian("2026-02-29"), CalendarError);
  assert.throws(() => gregorianToEthiopian("2/11/2026"), CalendarError);
});

test("Every day of a ten-year span round-trips through the Ethiopian calendar", () => {
  for (const date of dateRange("2022-01-01", "2031-12-31")) {
    const e = gregorianToEthiopian(date);
    assert.equal(ethiopianToGregorian(e.year, e.month, e.day), date);
  }
});

test("Hijri dates follow Umm al-Qura", () => {
  const h = gregorianToHijri("2026-11-02");
  assert.deepEqual([h.year, h.month, h.day, h.source], [1448, 5, 22, "calculated"]);
  assert.equal(hijriToGregorian(1447, 9, 1), "2026-02-18");
  assert.equal(hijriToGregorian(1447, 10, 1), "2026-03-20");
  assert.equal(hijriToGregorian(1448, 1, 1), "2026-06-16");
  for (const date of dateRange("2025-01-01", "2028-12-31")) {
    const x = gregorianToHijri(date);
    assert.equal(hijriToGregorian(x.year, x.month, x.day), date);
  }
});

test("An announced month start overrides the calculation for that month only", () => {
  // Suppose a month that follows a calculated 29-day month was announced a day after the calculated start.
  const month = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find(
    (m) => hijriToGregorian(1448, m, 1) === addDays(hijriToGregorian(1448, m - 1, 1), 29),
  );
  const calculatedStart = hijriToGregorian(1448, month, 1);
  const announcedStart = addDays(calculatedStart, 1);
  const announced = [{ year: 1448, month, start: announcedStart }];
  const eve = gregorianToHijri(calculatedStart, announced);
  assert.deepEqual([eve.month, eve.day, eve.source], [month - 1, 30, "announced"]);
  const first = gregorianToHijri(announcedStart, announced);
  assert.deepEqual([first.month, first.day, first.source], [month, 1, "announced"]);
  assert.equal(hijriToGregorian(1448, month, 10, announced), addDays(announcedStart, 9));
  // Two months later the calculation applies again.
  const laterDate = addDays(announcedStart, 65);
  const later = gregorianToHijri(laterDate, announced);
  assert.equal(later.source, "calculated");
  assert.deepEqual(later, gregorianToHijri(laterDate));
});

test("Islamic observances: Ramadan, the Eids and Mawlid", () => {
  assert.ok(islamicObservancesFor("2026-03-01").some((o) => o.key === "ramadan"));
  assert.ok(islamicObservancesFor("2026-03-20").some((o) => o.key === "eid-al-fitr"));
  assert.ok(islamicObservancesFor(hijriToGregorian(1447, 12, 10)).some((o) => o.key === "eid-al-adha"));
  assert.ok(islamicObservancesFor(hijriToGregorian(1448, 3, 12)).some((o) => o.key === "mawlid"));
  assert.deepEqual(islamicObservancesFor("2026-11-02"), []);
});

test("Result labels show the preferred calendar, then Gregorian, then the weekday", () => {
  assert.equal(describeDate("2026-11-02", "ethiopian", "am").label, "ጥቅምት 23, 2019 ዓ.ም. (ኖቬምበር 2, 2026), ሰኞ");
  assert.equal(describeDate("2026-11-02", "ethiopian", "en").label, "ጥቅምት 23, 2019 ዓ.ም. (November 2, 2026), Monday");
  assert.equal(describeDate("2026-11-02", "ethiopian", "om").label, "Onkoloolessa 23, 2019 ALI (Sadaasa 2, 2026 ALA), Wiixata");
  assert.equal(describeDate("2026-11-02", "hijri", "en").label, "22 Jumada al-Ula 1448 AH (November 2, 2026), Monday");
  assert.equal(describeDate("2026-11-02", "gregorian", "en").label, "November 2, 2026, Monday");
});

test("Search windows include both ends and reject a backwards window", () => {
  const days = dateRange("2026-11-02", "2027-01-30");
  assert.equal(days.length, 90);
  assert.equal(days[0], "2026-11-02");
  assert.equal(days.at(-1), "2027-01-30");
  assert.throws(() => dateRange("2026-11-02", "2026-11-01"), CalendarError);
});
