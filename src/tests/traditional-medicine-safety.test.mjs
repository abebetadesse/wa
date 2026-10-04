import { test } from "node:test";
import assert from "node:assert/strict";
import { checkRemedySafety } from "../lib/cultural/traditionalMedicine.ts";
import { POST as checkSafety } from "../app/api/cultural/traditional-medicine/safety/route.ts";

test("traditional medicine safety resolves catalog IDs and detects contraindications", () => {
  const rules = checkRemedySafety({
    medicineId: "kosso",
    pregnancy: true,
    ageYears: 8,
    conditions: ["chronic kidney disease"],
  });

  assert.ok(rules.some((rule) => rule.condition === "pregnancy"));
  assert.ok(rules.some((rule) => rule.condition === "child"));
  assert.ok(rules.some((rule) => rule.condition === "kidney_disease"));
  assert.ok(rules.every((rule) => rule.severity === "contraindicated"));
});

test("traditional medicine safety matches drug interactions against medication names and classes", () => {
  const warfarinRules = checkRemedySafety({
    medicineId: "kosso",
    medicationClasses: ["Warfarin"],
  });
  const anticoagulantRules = checkRemedySafety({
    medicineId: "kosso",
    medicationClasses: ["anticoagulant"],
  });

  assert.ok(warfarinRules.some((rule) => rule.ruleType === "drug_interaction"));
  assert.ok(anticoagulantRules.some((rule) => rule.ruleType === "drug_interaction"));
  assert.ok(warfarinRules.every((rule) => rule.interactingDrugClass && rule.message));
  assert.equal(checkRemedySafety({ medicineId: "kosso", medicationClasses: ["unrelated medicine"] }).length, 0);
});

test("traditional medicine safety preserves legacy plant UID checks", () => {
  const rules = checkRemedySafety({
    plantUid: "urn:med:et:ensete-ventricosum",
    pregnancy: true,
  });

  assert.ok(rules.some((rule) => rule.ruleUid === "safety:enset:pregnancy"));
});

test("traditional medicine safety API validates input and never reports self-administration as safe", async () => {
  const invalid = await checkSafety(new Request("http://localhost/api/cultural/traditional-medicine/safety", {
    method: "POST",
    body: JSON.stringify({ medicineId: "kosso", pregnancy: "yes" }),
  }));
  assert.equal(invalid.status, 400);

  const response = await checkSafety(new Request("http://localhost/api/cultural/traditional-medicine/safety", {
    method: "POST",
    body: JSON.stringify({ medicineId: "kosso", medicationClasses: ["warfarin"] }),
  }));
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.safeToSelfAdminister, false);
  assert.equal(result.requiresExpertReview, true);
  assert.ok(result.rules.some((rule) => rule.ruleType === "drug_interaction"));
});
