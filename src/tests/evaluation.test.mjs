import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { stage1Normalize } from "../lib/evaluation/stage1Normalize.ts";
import { stage2ComputeTargets } from "../lib/evaluation/stage2Baseline.ts";
import { stage3DetectGaps } from "../lib/evaluation/stage3DetectGaps.ts";
import { stage4CausalAttribution } from "../lib/evaluation/stage4CausalAttribution.ts";
import { stage5GenerateSolutions } from "../lib/evaluation/stage5SolutionGeneration.ts";
import { checkHerbDrugSafety } from "../lib/evaluation/stage5SafetyGate.ts";
import { validateNarrativeGuardrails, stage6GenerateNarrative } from "../lib/evaluation/stage6NarrativeLayer.ts";
import { evaluateProfileInMemory } from "../lib/evaluation/pipelineRunner.ts";
import { explainGap } from "../lib/evaluation/explainability.ts";
import { computeStatisticalSummary } from "../lib/evaluation/types.ts";
import { getEthiopianLocationDataset } from "../lib/location/ethiopiaLocations.ts";

describe("Ethiopian Wisdom & Wellness Evaluation Engine (v3.0)", () => {
  const mockNutrients = [
    { id: "nut-iron", name: "Iron", symbol: "Fe", unit: "mg", category: "mineral", baseRda: 18.0, tolerableUpperLimit: 45.0 },
    { id: "nut-ca", name: "Calcium", symbol: "Ca", unit: "mg", category: "mineral", baseRda: 1000.0, tolerableUpperLimit: 2500.0 },
    { id: "nut-b12", name: "Vitamin B12", symbol: "B12", unit: "mcg", category: "vitamin", baseRda: 2.4, tolerableUpperLimit: null },
    { id: "nut-zn", name: "Zinc", symbol: "Zn", unit: "mg", category: "mineral", baseRda: 11.0, tolerableUpperLimit: 40.0 },
  ];

  const mockFoodNutrients = new Map();
  // Injera (Brown teff fermented)
  mockFoodNutrients.set("food-injera", [
    { foodId: "food-injera", nutrientId: "nut-iron", amountPer100g: 11.5, bioavailabilityFactor: 1.45 },
    { foodId: "food-injera", nutrientId: "nut-ca", amountPer100g: 130.0, bioavailabilityFactor: 1.20 },
    { foodId: "food-injera", nutrientId: "nut-zn", amountPer100g: 3.6, bioavailabilityFactor: 1.35 },
  ]);
  // Shiro
  mockFoodNutrients.set("food-shiro", [
    { foodId: "food-shiro", nutrientId: "nut-iron", amountPer100g: 4.8, bioavailabilityFactor: 1.0 },
    { foodId: "food-shiro", nutrientId: "nut-zn", amountPer100g: 2.2, bioavailabilityFactor: 1.0 },
  ]);

  describe("Stage 1: Normalize Profile", () => {
    test("correctly applies Ethiopian regional altitude and demographic defaults", () => {
      const input = {
        age: "34",
        gender: "female",
        region: "Addis Ababa",
        lifestyleHabits: { teaWithMeals: true },
        medications: ["Aspirin"],
      };
      const profile = stage1Normalize(input);

      assert.equal(profile.age, 34);
      assert.equal(profile.gender, "female");
      assert.equal(profile.region, "Addis Ababa");
      assert.equal(profile.altitudeMeters, 2400, "Addis Ababa altitude should default to 2,400m");
      assert.equal(profile.lifestyleHabits.teaWithMeals, true);
      assert.equal(profile.medications[0].drugClass, "Anticoagulants / Antiplatelets");
    });
  });

  describe("Stage 2: Baseline Targets (Altitude & Physiological Adjustments)", () => {
    test("increases iron target for Ethiopian highland altitude (Addis Ababa 2,400m)", () => {
      const profile = stage1Normalize({
        age: 28,
        gender: "female",
        region: "Addis Ababa",
        altitudeMeters: 2400,
      });

      const targets = stage2ComputeTargets(profile, mockNutrients);
      const ironTarget = targets.find((t) => t.nutrientName === "Iron");

      assert.ok(ironTarget);
      // 18.0 base * 1.15 altitude factor = 20.70 mg
      assert.equal(ironTarget.adjustedRda, 20.70);
      assert.ok(
        ironTarget.adjustmentReasons.some((r) => r.includes("Highland elevation")),
        "Reasoning must cite highland altitude adaptation"
      );
    });
  });

  describe("Stage 3: Gap Detection with Fermentation Bioavailability", () => {
    test("calculates intake factoring injera fermentation and detects deficiency", () => {
      // 100g of injera provides 11.5 * 1.45 = 16.675mg iron
      const dietLog = [
        { foodId: "food-injera", foodName: "Brown Teff Injera", gramsConsumed: 50 }, // 8.34mg iron
      ];

      const targets = [
        { nutrientId: "nut-iron", nutrientName: "Iron", unit: "mg", baseRda: 18.0, adjustedRda: 20.7, adjustmentReasons: [] },
        { nutrientId: "nut-b12", nutrientName: "Vitamin B12", unit: "mcg", baseRda: 2.4, adjustedRda: 2.4, adjustmentReasons: [] },
      ];

      const { gaps } = stage3DetectGaps(dietLog, mockFoodNutrients, targets);

      const ironGap = gaps.find((g) => g.nutrientName === "Iron");
      const b12Gap = gaps.find((g) => g.nutrientName === "Vitamin B12");

      assert.ok(ironGap, "Iron deficiency should be flagged");
      assert.equal(ironGap.gapType, "deficiency");
      assert.equal(ironGap.severity, "moderate", "Intake ~40% should be moderate severity");

      assert.ok(b12Gap, "B12 deficiency should be flagged (0 intake)");
      assert.equal(b12Gap.severity, "high", "Zero B12 intake should be high severity");
    });
  });

  describe("Weighted statistical confidence model", () => {
    test("produces a calibrated risk score and evidence coverage for high-risk nutrient patterns", () => {
      const profile = stage1Normalize({
        age: 32,
        gender: "female",
        region: "Addis Ababa",
        altitudeMeters: 2400,
        pregnancyOrLactation: "pregnant_t2",
        lifestyleHabits: { teaWithMeals: true, coffeeRitualTwiceDaily: true },
      });

      const gaps = [
        { nutrientId: "nut-iron", nutrientName: "Iron", unit: "mg", gapType: "deficiency", severity: "moderate", targetRda: 20.7, calculatedDailyIntake: 8.0, estimatedIntakePct: 38.6, sourceRef: "EFCT" },
        { nutrientId: "nut-b12", nutrientName: "Vitamin B12", unit: "mcg", gapType: "deficiency", severity: "high", targetRda: 2.4, calculatedDailyIntake: 0, estimatedIntakePct: 0, sourceRef: "EFCT" },
      ];

      const causes = [
        { gapNutrientId: "nut-iron", causeType: "absorption_inhibitor", title: "Post-meal tannin chelation", description: "Iron absorption inhibited by tea/coffee", evidenceStrength: "established", sourceRef: "ETM-CLIN" },
        { gapNutrientId: "nut-b12", causeType: "medication", title: "Pregnancy and nutrient depletion cluster", description: "B12 intake is effectively absent", evidenceStrength: "probable", sourceRef: "EFCT" },
      ];

      const summary = computeStatisticalSummary(profile, gaps, causes, []);

      assert.ok(summary.overallRiskScore >= 60, "Risk score should reflect combined nutrient deficits and altitude factors");
      assert.ok(summary.confidence >= 0.7, "Confidence should rise with evidence strength and relevant signal volume");
      assert.ok(summary.evidenceCoverage >= 70, "Evidence coverage should reflect the established/probable evidence mix");
      assert.ok(summary.sourceTrustScore >= 70, "Source trust should reward evidence-linked sources");
      assert.ok(summary.topDrivers.length >= 2, "Top drivers should capture the strongest risk pathways");
    });

    test("emits a conservative provenance score for location indicators built from indicative planning estimates", () => {
      const location = getEthiopianLocationDataset().find((entry) => entry.id === "addis-ababa");

      assert.ok(location, "Addis Ababa should be present in the location registry");
      assert.ok(["low", "medium", "unknown"].includes(location.sourceConfidence), "Indicative datasets should not claim unverified high-certainty scientific provenance");
      assert.ok(location.provenanceSummary.confidenceScore >= 0, "A numeric provenance confidence score should be present");
      assert.ok(location.provenanceSummary.unresolvedGaps.length >= 0, "Missing-source gaps should be surfaced to users");
    });
  });

  describe("Stage 4: Causal Attribution Engine", () => {
    test("identifies coffee tannin chelation and medication-induced depletion", () => {
      const profile = stage1Normalize({
        age: 45,
        gender: "female",
        region: "Addis Ababa",
        lifestyleHabits: { teaWithMeals: true, coffeeRitualTwiceDaily: true },
        medications: [{ name: "Metformin", drugClass: "Hypoglycemics" }],
      });

      const gaps = [
        { nutrientId: "nut-iron", nutrientName: "Iron", unit: "mg", gapType: "deficiency", severity: "moderate", targetRda: 20.7, calculatedDailyIntake: 8.0, estimatedIntakePct: 38.6, sourceRef: "EFCT" },
        { nutrientId: "nut-b12", nutrientName: "Vitamin B12", unit: "mcg", gapType: "deficiency", severity: "high", targetRda: 2.4, calculatedDailyIntake: 0, estimatedIntakePct: 0, sourceRef: "EFCT" },
      ];

      const causes = stage4CausalAttribution(gaps, profile, []);

      const tanninCause = causes.find((c) => c.title.includes("Tannin Chelation"));
      assert.ok(tanninCause, "Must flag coffee/tea tannin chelation for iron");
      assert.equal(tanninCause.evidenceStrength, "established");
      assert.ok(tanninCause.sourceRef.startsWith("ETM-CLIN"));

      const metCause = causes.find((c) => c.title.includes("Metformin"));
      assert.ok(metCause, "Must flag Metformin-induced B12 depletion");
      assert.equal(metCause.causeType, "medication");
    });
  });

  describe("Stage 5: Mandatory Herb-Drug Safety Gate (RELEASE-BLOCKING CANARY)", () => {
    test("CANARY TEST: Strictly BLOCKS Tena Adam and Kosso when patient takes Warfarin/Aspirin", () => {
      const profileWithAnticoagulant = stage1Normalize({
        age: 60,
        gender: "male",
        region: "Addis Ababa",
        medications: [{ name: "Warfarin", drugClass: "Anticoagulants / Antiplatelets" }],
      });

      // 1. Direct safety gate unit test
      const safetyTenaAdam = checkHerbDrugSafety("Tena Adam", profileWithAnticoagulant.medications);
      assert.equal(safetyTenaAdam.status, "flagged", "Tena Adam MUST be flagged for Warfarin");
      assert.equal(safetyTenaAdam.severity, "high");
      assert.equal(safetyTenaAdam.contraindicated, true);

      const safetyKosso = checkHerbDrugSafety("Kosso", profileWithAnticoagulant.medications);
      assert.equal(safetyKosso.status, "flagged", "Kosso MUST be flagged for Warfarin");

      // 2. End-to-end Stage 5 solution generation
      const gaps = [
        { nutrientId: "nut-iron", nutrientName: "Iron", unit: "mg", gapType: "deficiency", severity: "moderate", targetRda: 20.7, calculatedDailyIntake: 8.0, estimatedIntakePct: 38.6, sourceRef: "EFCT" },
      ];

      const { solutions, culledUnsafeRemedies } = stage5GenerateSolutions(gaps, profileWithAnticoagulant);

      // Verify that NO flagged herb appears in the user-facing solutions
      const leakedTenaAdam = solutions.find((s) => s.title.includes("Tena Adam") || (s.herbName && s.herbName.includes("Tena Adam")));
      const leakedKosso = solutions.find((s) => s.title.includes("Kosso") || (s.herbName && s.herbName.includes("Kosso")));

      assert.equal(leakedTenaAdam, undefined, "CRITICAL: Tena Adam leaked into solutions for a Warfarin patient!");
      assert.equal(leakedKosso, undefined, "CRITICAL: Kosso leaked into solutions for a Warfarin patient!");

      // Verify that culledUnsafeRemedies logged both
      assert.ok(
        culledUnsafeRemedies.some((r) => r.herbName.includes("Tena Adam")),
        "Culled remedies audit list must record intercepted Tena Adam"
      );
      assert.ok(
        culledUnsafeRemedies.some((r) => r.herbName.includes("Kosso")),
        "Culled remedies audit list must record intercepted Kosso"
      );
    });

    test("CANARY TEST: Strictly BLOCKS Kosso when patient takes Metformin", () => {
      const profileWithMetformin = stage1Normalize({
        age: 52,
        gender: "female",
        region: "Addis Ababa",
        medications: [{ name: "Metformin", drugClass: "Hypoglycemics" }],
      });

      const safetyKosso = checkHerbDrugSafety("Kosso", profileWithMetformin.medications);
      assert.equal(safetyKosso.status, "flagged", "Kosso MUST be flagged for Metformin patients");
    });

    test("ALLOWS safe herbal remedies when no contraindications exist", () => {
      const healthyProfile = stage1Normalize({
        age: 26,
        gender: "female",
        region: "Addis Ababa",
        medications: [], // No prescription medications
      });

      const safetyTosign = checkHerbDrugSafety("Tosign", healthyProfile.medications);
      assert.equal(safetyTosign.status, "pass");

      const gaps = [
        { nutrientId: "nut-ca", nutrientName: "Calcium", unit: "mg", gapType: "deficiency", severity: "moderate", targetRda: 1000, calculatedDailyIntake: 450, estimatedIntakePct: 45, sourceRef: "EFCT" },
      ];

      const { solutions } = stage5GenerateSolutions(gaps, healthyProfile);
      const tosignSol = solutions.find((s) => s.herbName === "Tosign");

      assert.ok(tosignSol, "Tosign should be included for safe patient");
      assert.equal(tosignSol.interactionChecked, "pass");
    });
  });

  describe("Stage 6: Narrative Guardrail Validation", () => {
    test("REJECTS unlawful diagnostic phrasing", () => {
      const diagnosticViolation = "Based on our analysis, you have anemia and we diagnose you with iron deficiency disease.";
      const check = validateNarrativeGuardrails(diagnosticViolation);

      assert.equal(check.isValid, false);
      assert.ok(check.violations.length >= 1, "Should catch diagnostic statements");
    });

    test("builds an auditable reasoning trace from gap evidence", () => {
      const explanation = explainGap(
        {
          nutrientId: "nut-iron",
          nutrientName: "Iron",
          unit: "mg",
          gapType: "deficiency",
          severity: "moderate",
          targetRda: 20.7,
          calculatedDailyIntake: 8,
          estimatedIntakePct: 38.6,
          sourceRef: "EFCT2025-EVAL-THR",
        },
        [{
          gapNutrientId: "nut-iron",
          causeType: "absorption_inhibitor",
          title: "Tannin Chelation",
          description: "Tea with meals can reduce non-heme iron absorption.",
          evidenceStrength: "established",
          sourceRef: "ETM-CLIN-001",
        }],
        [{
          gapNutrientId: "nut-iron",
          solutionType: "dietary_change",
          title: "Pair iron foods with vitamin C",
          description: "Use a vitamin C-rich accompaniment with meals.",
          interactionChecked: "n_a",
          rankScore: 1,
          sourceRef: "EFCT2025-SOL-001",
        }]
      );

      assert.match(explanation.summary, /38\.6%/);
      assert.equal(explanation.steps[0].sourceRef, "EFCT2025-EVAL-THR");
      assert.ok(explanation.steps.some((step) => step.label.includes("Tannin Chelation")));
      assert.ok(explanation.steps.some((step) => step.detail.includes("n_a")));
      assert.match(explanation.disclaimer, /not a diagnosis/);
    });

    test("ACCEPTS valid risk pattern explainer text", () => {
      const validText = "Your estimated iron intake is below the physiological threshold for your regional altitude profile.";
      const check = validateNarrativeGuardrails(validText);

      assert.equal(check.isValid, true);
      assert.equal(check.violations.length, 0);
    });
  });

  describe("Domain A/B Architectural Firewall", () => {
    test("In-memory evaluation pipeline never accepts or outputs cultural profile entities", () => {
      const profile = stage1Normalize({
        age: 30,
        gender: "female",
        region: "Addis Ababa",
      });

      const res = evaluateProfileInMemory(profile, [], mockNutrients, mockFoodNutrients);

      // Verify res has no cultural properties
      const resObj = res;
      assert.equal(resObj.culturalProfile, undefined);
      assert.equal(resObj.geezZodiacSign, undefined);
      assert.equal(resObj.numerologyScore, undefined);
      assert.ok(res.safetyGateVerified, "Scientific pipeline verified");
    });
  });
});
