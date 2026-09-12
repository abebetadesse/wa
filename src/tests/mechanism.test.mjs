import { test } from "node:test";
import assert from "node:assert/strict";
import { compareMechanisms, searchMechanisms } from "../lib/discovery/mechanismEngine.ts";

test("mechanism discovery returns evidence-weighted Ethiopian context matches", () => {
  const result = searchMechanisms("metformin", "medication");
  assert.ok(result.matches.length >= 2);
  assert.ok(result.matches.some((match) => match.targetName.includes("Moringa")));
  assert.ok(result.matches.every((match) => match.confidenceScore >= 0 && match.confidenceScore <= 1));
  assert.match(result.disclaimer, /not safety assessments/i);
});

test("mechanism comparison preserves safety boundary", () => {
  const result = compareMechanisms("metformin", "moringa");
  assert.ok(result.matches.length >= 1);
  assert.match(result.disclaimer, /does not imply compatible combination/i);
});
