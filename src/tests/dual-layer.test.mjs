import test from "node:test";
import assert from "node:assert/strict";
import { CulturalTranslator } from "../lib/dual-layer/CulturalTranslator.ts";
import { toUserCasePayload } from "../lib/dual-layer/contracts.ts";

test("cultural translation does not expose hidden scientific findings", () => {
  const report = new CulturalTranslator().translate({
    scientificFindings: { hydration: "low", vitaminB12: "deficient", pathogenExposure: "high" },
    scanType: "tongue",
    hexacoreCore: "Order",
    hexacoreState: "Awakening",
    landmark: "Entoto",
  });

  const serialized = JSON.stringify(report);
  assert.match(serialized, /Water rhythm/);
  assert.doesNotMatch(serialized, /vitaminB12|pathogenExposure|scientificFindings|hydration/);
});

test("user case serializer uses an explicit cultural allow-list", () => {
  const payload = toUserCasePayload({
    id: "case-1",
    status: "endorsed",
    caseType: "wellbeing",
    culturalReport: null,
    createdAt: "2026-09-22T00:00:00.000Z",
    updatedAt: "2026-09-22T00:00:00.000Z",
    domainAScientificData: { diagnosis: "must not appear" },
  });

  assert.deepEqual(Object.keys(payload).sort(), ["caseType", "createdAt", "culturalReport", "id", "status", "updatedAt"]);
  assert.doesNotMatch(JSON.stringify(payload), /diagnosis|domainAScientificData/);
});
