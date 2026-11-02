// The Moon must match a trusted public source, not just itself: these figures were read from
// timeanddate.com for Addis Ababa (see the fixture for the pages and the date retrieved).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as Astronomy from "astronomy-engine";

import { moonDay } from "../lib/spiritual-guidance/moon.ts";

const reference = JSON.parse(readFileSync(new URL("./fixtures/timeanddate-moon-addis-ababa.json", import.meta.url), "utf8"));
const minutes = (clock) => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3, 5));
const atLocal = (date, clock) => new Date(Date.parse(`${date}T${clock}:00+03:00`));

test("Moonrise and moonset match timeanddate.com within 2 minutes on 25 dates", () => {
  assert.ok(reference.days.length >= 20);
  for (const day of reference.days) {
    const moon = moonDay(day.date);
    for (const key of ["rise", "set"]) {
      const ours = key === "rise" ? moon.moonrise : moon.moonset;
      if (day[key] === null) {
        assert.equal(ours, null, `${day.date} moon${key}: none expected`);
      } else {
        assert.ok(ours, `${day.date} moon${key}: expected ${day[key]}`);
        assert.ok(Math.abs(minutes(ours.local) - minutes(day[key])) <= 2, `${day.date} moon${key}: ${ours.local} vs ${day[key]}`);
      }
    }
  }
});

test("Illumination matches timeanddate.com within 0.3 points at the same instant", () => {
  for (const day of reference.days.filter((d) => d.meridian)) {
    const lit = Astronomy.Illumination(Astronomy.Body.Moon, atLocal(day.date, day.meridian)).phase_fraction * 100;
    assert.ok(Math.abs(lit - day.illumination) <= 0.3, `${day.date}: ${lit.toFixed(2)}% vs ${day.illumination}%`);
  }
});

test("Every 2026 quarter falls on the same local day and within 2 minutes of timeanddate.com", () => {
  assert.equal(reference.quarters2026.length, 50);
  for (const [date, phase, clock] of reference.quarters2026) {
    const moon = moonDay(date);
    assert.equal(moon.phase, phase, date);
    assert.ok(Math.abs(minutes(moon.quarter.local) - minutes(clock)) <= 2, `${date} ${phase}: ${moon.quarter.local} vs ${clock}`);
  }
});

test("Days that are not quarter days get a crescent or gibbous name that agrees with the light", () => {
  const quarterDays = new Set(reference.quarters2026.map(([date]) => date));
  for (const day of reference.days.filter((d) => !quarterDays.has(d.date) && d.date < "2027-01-01")) {
    const moon = moonDay(day.date);
    assert.ok(moon.phase.endsWith("crescent") || moon.phase.endsWith("gibbous"), `${day.date}: ${moon.phase}`);
    assert.equal(moon.phase.endsWith("crescent"), moon.illumination < 0.5, `${day.date}: ${moon.phase} at ${(moon.illumination * 100).toFixed(1)}%`);
  }
});
