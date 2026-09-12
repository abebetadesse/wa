import { test } from "node:test";
import assert from "node:assert/strict";
import { assessMultimodalConstitution } from "../lib/cultural/multimodalConstitution.ts";

test("multimodal constitution assessment preserves provenance and safety flags", () => {
  const result = assessMultimodalConstitution({
    constitution: { energy: 2, digestion: 1, stress: 2, sleep: 2, temperature: 1, activity: 1 },
    pulse: { quality: "rapid" },
    tongue: { color: "red", coating: "yellow", shape: "cracked" },
    vitals: { heartRate: 128, bloodOxygen: 91, sleepHours: 4 },
  });

  assert.equal(result.modalityCoverage.tongueObservation, true);
  assert.equal(result.modalityCoverage.wearableVitals, true);
  assert.equal(result.observations.length >= 4, true);
  assert.equal(result.safetyFlags.length, 2);
  assert.match(result.disclaimer, /not medical diagnosis/i);
});
