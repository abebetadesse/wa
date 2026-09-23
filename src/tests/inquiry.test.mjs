import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseWelbeingInquiry } from "../lib/inquiry/parser.ts";

describe("Welbeing inquiry parser", () => {
  test("routes breathing difficulty to critical care", () => {
    const result = parseWelbeingInquiry("I have difficulty breathing and chest pain");

    assert.equal(result.urgency.level, "critical");
    assert.equal(result.urgency.action, "EMERGENCY_CARE");
    assert.ok(result.symptoms.some((symptom) => symptom.value === "breathing_difficulty"));
  });

  test("extracts Amharic symptoms without creating a diagnosis", () => {
    const result = parseWelbeingInquiry("ራስ ምታት እና ድካም");

    assert.equal(result.language, "am");
    assert.ok(result.symptoms.some((symptom) => symptom.value === "headache"));
    assert.ok(result.symptoms.some((symptom) => symptom.value === "fatigue"));
    assert.match(result.disclaimer, /does not diagnose/);
  });

  test("routes persistent concerns to scheduled review", () => {
    const result = parseWelbeingInquiry("I have stomach pain for 3 months");

    assert.equal(result.urgency.level, "medium");
    assert.equal(result.duration?.value, "3 months");
  });
});
