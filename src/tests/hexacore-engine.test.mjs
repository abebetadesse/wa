import test from "node:test";
import assert from "node:assert/strict";
import { HexacoreEngine } from "../lib/hexacore/HexacoreEngine.ts";

test("Hexacore engine produces bounded temporal reading", () => {
  const reading = HexacoreEngine.compute({
    user: {
      dateOfBirth: "1990-12-25",
      frequencies: { P: 72, H: 60, C: 50, E: 48, S: 44, O: 66 },
    },
    recentJournal: [{
      entryDate: "2026-09-21T08:00:00.000Z",
      selectedCore: "O",
      practiceCompleted: ["o-routine"],
    }],
    now: new Date("2026-09-22T08:00:00.000Z"),
  });

  assert.equal(reading.temporal.season, "kiremt");
  assert.deepEqual(Object.keys(reading.frequencies).sort(), ["C", "E", "H", "O", "P", "S"]);
  assert.ok(Object.values(reading.frequencies).every((value) => value >= 0 && value <= 100));
  assert.ok(reading.todaysPractices.length > 0);
  assert.match(reading.journalPrompt.prompt, /today/i);
});
