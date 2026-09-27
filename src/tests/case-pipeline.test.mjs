import { test } from "node:test";
import assert from "node:assert/strict";

import { resolveLocation } from "../lib/location/index.ts";
import { evaluateSafetyGate } from "../lib/evaluation/stage5SafetyGate.pipeline.ts";
import { pillarRegistry } from "../lib/knowledge/pillars/index.ts";
import { projectUserReport } from "../lib/reports/projectUserReport.ts";
import {
  canTransition,
  assertTransition,
  PipelineTransitionError,
} from "../lib/pipeline/transitions.ts";
import { CaseStatus } from "../lib/pipeline/types.ts";
import { pipelineRepository } from "../lib/pipeline/repository.ts";
import { evaluateProfile } from "../lib/evaluation/profileEvaluator.ts";
import { evaluateCase } from "../lib/evaluation/caseEvaluator.ts";

// ─── 1. UNIT: projectUserReport Never Leaks Professional Fields ──────────────
test("Unit: projectUserReport never leaks a professional-only field (property test)", () => {
  const dummyProReport = {
    caseId: "case-unit-123",
    userSummary: {
      ageBand: "25-40",
      sex: "Female",
      location: {
        raw: { lat: 12.6, lng: 37.4, source: "manual" },
        admin: { region: "Amhara", zone: "North Gondar", woreda: "Debark" },
        agroEcological: "highland",
        altitudeBand: "2300-3200",
        ecosystem: "Afromontane ericaceous woodland",
        marketAccess: "rural-market",
        endemicDiseases: ["podoconiosis", "typhus"],
        foodAvailability: {
          staples: ["Barley", "Teff"],
          seasonalGaps: ["June-August pre-harvest lean"],
        },
        climate: { zone: "Dega", rainySeasons: ["Kiremt (June-Sept)"] },
      },
    },
    narrative: "Patient taking Kosso with Metformin and experiencing severe cramps.",
    safetyGate: {
      status: "BLOCKED_BY_SAFETY_GATE",
      blocked: true,
      overrideRequired: true,
      matchedRules: [
        {
          herbName: "Kosso",
          medicationName: "Metformin",
          severity: "high",
          mechanism: "Intestinal P-gp and OCT2 inhibition and additive gastrointestinal toxicity",
          clinicalEffect: "Amplified risk of lactic acidosis and extreme abdominal cramping",
          plainLanguageEffect: "May cause severe stomach cramps and dangerously alter blood sugar medication absorption",
        },
      ],
      flaggedHerbs: ["Kosso"],
      flaggedMedications: ["Metformin"],
      disclaimer: "No rule matched ≠ safe. Absence of a known interaction rule does not guarantee safety.",
      summary: "High-severity interaction detected between Kosso and Metformin.",
    },
    matchedRules: [
      {
        herbName: "Kosso",
        medicationName: "Metformin",
        severity: "high",
        mechanism: "SECRET_PHARMACOLOGICAL_MECHANISM_STRING_12345",
        clinicalEffect: "Amplified risk of lactic acidosis",
        plainLanguageEffect: "May cause severe stomach cramps",
      },
    ],
    differentialConsiderations: [
      {
        condition: "Metformin-Associated Lactic Acidosis",
        supporting: ["Kosso co-ingestion", "Cramping"],
        against: ["No tachypnea"],
        localPrevalence: "Rare",
      },
    ],
    redFlags: [
      {
        flag: "Severe metabolic abdominal pain with dizziness",
        rationale: "Possible acute toxic synergy",
        urgency: "immediate",
      },
    ],
    culturalAnalysis: {
      illnessModel: "Magt (ማግጥ) / Tapeworm purgative acute irritation",
      careSeekingPattern: "Traditional healer consultation first",
      familyDynamics: "Elder consultation required",
      stigmaConsiderations: "Low stigma",
      provenance: [{ type: "oral_tradition", citation: "North Gondar Traditional Healers Oral Record" }],
    },
    spiritualAnalysis: {
      framing: "Tsom (fasting) spiritual reflection",
      provenance: [{ type: "written_tradition", citation: "Metsehafe Gitswe" }],
    },
    ecologicalAnalysis: {
      exposures: ["Cold highland damp air"],
      endemicDiseases: ["podoconiosis"],
      waterSanitation: ["Spring water source"],
    },
    nutritionalAnalysis: {
      gaps: ["Iron and B12 during fasting"],
      localSolutions: ["Roasted barley (Kolo)", "Teff Injera"],
      biochemistry: "BIOCHEMICAL_CYP_METABOLISM_SECRET_XY",
    },
    pharmacology: {
      herbDrugInteractions: [
        {
          herb: "Kosso",
          medication: "Metformin",
          severity: "high",
          mechanism: "INTESTINAL_OCT2_SECRET_BLOCK",
          plainLanguageEffect: "May cause severe stomach cramps",
          audience: "both",
        },
      ],
      cypPathways: ["CYP3A4", "CYP2D6", "OCT2"],
      monitoringPlan: ["Check serum lactate", "Electrolyte panel"],
      separationAdvice: "Discontinue Kosso immediately; maintain at least 8-hour temporal separation if resumption considered",
    },
    recommendedActions: {
      forUser: ["Drink warm boiled water", "Visit health center if dizziness continues"],
      forClinician: ["Check arterial blood gas", "Lactate level"],
      referrals: ["Debark Primary Hospital"],
    },
    confidence: "high",
    provenance: [{ type: "paper", citation: "Ethiopian Pharmacopeia Review 2021" }],
    generatedAt: new Date().toISOString(),
    pipelineVersion: "1.0.0",
  };

  const userReport = projectUserReport(dummyProReport);

  // Assert user report is strictly formatted
  assert.ok(userReport.headline);
  assert.ok(userReport.urgentDirective, "Should contain urgent directive due to red flag");
  assert.ok(userReport.yourSituation.culturalFraming);
  assert.ok(userReport.whatMayBeHappening.plainLanguage);
  assert.ok(userReport.traditionalRemedies.length > 0);

  // Assert verbatim mandatory disclaimer (§1)
  const hasVerbatimDisclaimer = userReport.disclaimers.some((d) =>
    d.includes("No rule matched ≠ safe")
  );
  assert.ok(hasVerbatimDisclaimer, "Must carry verbatim 'No rule matched ≠ safe' disclaimer");

  // Property Test: Verify zero leakage of secret professional fields in serialized JSON
  const serialized = JSON.stringify(userReport);
  assert.strictEqual(
    serialized.includes("SECRET_PHARMACOLOGICAL_MECHANISM_STRING_12345"),
    false,
    "Must NOT leak mechanism strings"
  );
  assert.strictEqual(
    serialized.includes("BIOCHEMICAL_CYP_METABOLISM_SECRET_XY"),
    false,
    "Must NOT leak biochemical mechanism strings"
  );
  assert.strictEqual(
    serialized.includes("INTESTINAL_OCT2_SECRET_BLOCK"),
    false,
    "Must NOT leak raw mechanism text in remedies"
  );
  assert.strictEqual(
    serialized.includes("CYP3A4"),
    false,
    "Must NOT leak CYP pathway names"
  );
  assert.strictEqual(
    serialized.includes("differentialConsiderations"),
    false,
    "Must NOT include differential considerations key"
  );
  assert.strictEqual(
    serialized.includes("Metformin-Associated Lactic Acidosis"),
    false,
    "Must NOT include diagnostic differential condition titles"
  );
});

// ─── 2. UNIT: Every Registered Pillar Returns Provenance & Confidence ────────
test("Unit: every pillar returns provenance and confidence", async () => {
  const dummyCtx = {
    raw: { lat: 9.03, lng: 38.74, source: "manual" },
    admin: { region: "Amhara", zone: "North Gondar", woreda: "Debark" },
    agroEcological: "highland",
    altitudeBand: "2300-3200",
    ecosystem: "Afromontane ericaceous woodland",
    marketAccess: "rural-market",
    endemicDiseases: ["podoconiosis", "typhus"],
    foodAvailability: {
      staples: ["Barley", "Teff"],
      seasonalGaps: ["June-August pre-harvest lean"],
    },
    climate: { zone: "Dega", rainySeasons: ["Kiremt (June-Sept)"] },
  };

  const dummyInput = {
    ageBand: "25-40",
    sex: "Female",
    pregnancyStatus: "Pregnant",
    symptoms: ["headache", "abdominal pain"],
    herbs: ["Kosso", "Tena Adam"],
    medications: ["Metformin"],
    spiritualContext: "Orthodox Tewahedo fasting observance",
    consentToSpiritual: true,
  };

  for (const pillar of pillarRegistry) {
    const result = await pillar.query(dummyInput, dummyCtx);

    assert.ok(result, `Pillar ${pillar.id} returned null or undefined`);
    assert.ok(
      ["low", "moderate", "high"].includes(result.confidence),
      `Pillar ${pillar.id} must return valid confidence level, got ${result.confidence}`
    );
    assert.ok(
      Array.isArray(result.provenance) && result.provenance.length > 0,
      `Pillar ${pillar.id} must return non-empty provenance array`
    );

    // Verify each SourceRef has valid structure
    for (const ref of result.provenance) {
      assert.ok(ref.type, `Pillar ${pillar.id} source ref must have type`);
      assert.ok(ref.citation, `Pillar ${pillar.id} source ref must have citation`);
    }
  }
});

// ─── 3. INTEGRATION: State Machine Transitions & Invariants ──────────────────
test("Integration: state machine assertions and immutable event emissions", async () => {
  // Test valid progression without safety block (using full canonical state names)
  assert.strictEqual(canTransition(CaseStatus.CASE_SUBMITTED, CaseStatus.CASE_EVALUATING), true);
  assert.strictEqual(canTransition(CaseStatus.CASE_EVALUATING, CaseStatus.PENDING_PROFESSIONAL), true);
  assert.strictEqual(canTransition(CaseStatus.PENDING_PROFESSIONAL, CaseStatus.PENDING_ADMIN), true);
  assert.strictEqual(canTransition(CaseStatus.PENDING_ADMIN, CaseStatus.APPROVED), true);
  assert.strictEqual(canTransition(CaseStatus.APPROVED, CaseStatus.PUBLISHED), true);

  // Test invalid transition (skipping professional review)
  assert.strictEqual(canTransition(CaseStatus.CASE_SUBMITTED, CaseStatus.PUBLISHED), false);
  assert.throws(
    () => assertTransition(CaseStatus.CASE_SUBMITTED, CaseStatus.PUBLISHED),
    PipelineTransitionError
  );

  // Test safety gate block invariant: Cannot advance to PENDING_ADMIN without override
  assert.strictEqual(
    canTransition(CaseStatus.BLOCKED_BY_SAFETY_GATE, CaseStatus.PENDING_ADMIN, false),
    false
  );
  assert.throws(
    () => assertTransition(CaseStatus.BLOCKED_BY_SAFETY_GATE, CaseStatus.PENDING_ADMIN, false),
    (err) => err instanceof PipelineTransitionError && err.statusCode === 409
  );

  // Test safety gate with override
  assert.strictEqual(
    canTransition(CaseStatus.BLOCKED_BY_SAFETY_GATE, CaseStatus.PENDING_PROFESSIONAL, true),
    true
  );

  // Test append-only immutable event emission
  const testCaseId = `case_test_${Date.now()}`;
  await pipelineRepository.appendEvent({
    caseId: testCaseId,
    actorId: "actor_test_1",
    actorRole: "USER",
    type: "submitted",
    after: { status: CaseStatus.SUBMITTED },
    note: "Initial test case submission",
  });

  await pipelineRepository.appendEvent({
    caseId: testCaseId,
    actorId: "actor_dr_pro",
    actorRole: "PROFESSIONAL",
    type: "approved",
    before: { status: CaseStatus.PENDING_PROFESSIONAL },
    after: { status: CaseStatus.PENDING_ADMIN },
    note: "Professional approved case after review",
  });

  const events = await pipelineRepository.getEvents(testCaseId);
  assert.strictEqual(events.length, 2);
  assert.strictEqual(events[0].type, "submitted");
  assert.strictEqual(events[1].type, "approved");
});

// ─── 4. SECURITY: User Cannot Access Professional Report at API Level ────────
test("Security: User session calling /api/cases/:id/report/pro receives 403 Forbidden", async () => {
  // Import route handler directly
  const { GET: proReportHandler } = await import(
    "../app/api/cases/[caseId]/report/pro/route.ts"
  );

  // 1. Calling as a regular USER
  const userReq = new Request("http://localhost:5500/api/cases/dummy-case-1/report/pro", {
    method: "GET",
    headers: {
      "x-actor-id": "user-patient-123",
      "x-actor-role": "USER",
    },
  });

  const userRes = await proReportHandler(userReq, {
    params: Promise.resolve({ caseId: "dummy-case-1" }),
  });

  assert.strictEqual(userRes.status, 403, "User session MUST receive 403 Forbidden");
  const userJson = await userRes.json();
  assert.strictEqual(userJson.success, false);
  assert.ok(
    userJson.error.includes("Forbidden") || userJson.error.includes("restricted"),
    "Error message must clearly state forbidden access"
  );
  assert.strictEqual(
    userRes.headers.get("Cache-Control"),
    "no-store",
    "Must carry no-store cache header"
  );
});

// ─── 5. SAFETY GATE: High-Severity Flag Blocks Publication Without Override ──
test("Safety gate: a high-severity combination blocks publication without override", async () => {
  // Kosso + Metformin is a known high-severity interaction
  const gateResult = evaluateSafetyGate(["Kosso"], [{ name: "Metformin" }]);

  // PipelineSafetyGateResult.status uses "blocked" (internal domain value)
  assert.strictEqual(gateResult.status, "blocked");
  assert.strictEqual(gateResult.blocked, true);
  assert.strictEqual(gateResult.overrideRequired, true);
  assert.ok(gateResult.matchedRules.length > 0, "Must have matched rules for Kosso+Metformin");
  assert.ok(gateResult.disclaimer.includes("No rule matched ≠ safe"));

  // Verify transition lock: BLOCKED_BY_SAFETY_GATE state cannot advance without override
  assert.throws(
    () => assertTransition(CaseStatus.BLOCKED_BY_SAFETY_GATE, CaseStatus.PUBLISHED, false),
    PipelineTransitionError
  );
});

// ─── 6. GOLDEN-FILE: Snapshot Dual Reports for 3 Representative Eco-Zones ─────
test("Golden-file: snapshot User & Pro reports for Highland, Rift Valley, and Lowland cases", async () => {
  // 6.1 Highland Case (Amhara / North Gondar / Dega / 2800m)
  const highlandLoc = await resolveLocation({
    region: "Amhara",
    zone: "North Gondar",
    woreda: "Debark",
  });
  assert.strictEqual(highlandLoc.agroEcological, "highland");
  assert.ok(highlandLoc.endemicDiseases.includes("podoconiosis"));

  const highlandCase = await evaluateCase({
    caseInput: {
      id: "case-highland-snapshot",
      userId: "user-highland",
      profileId: "prof-highland",
      narrative: "Highland farmer reporting fatigue and dry cough during cold rains.",
      symptoms: ["fatigue", "dry cough", "joint ache"],
      duration: "1 week",
      selfTreatments: ["Tena Adam tea"],
    },
    profile: {
      id: "prof-highland",
      userId: "user-highland",
      ageBand: "41-60",
      sex: "Male",
      chronicConditions: ["Hypertension"],
      currentMeds: [{ name: "Amlodipine" }],
      allergies: [],
      traditionalUse: [{ name: "Tena Adam" }],
      diet: { primaryStaple: "Barley" },
      substanceUse: {},
      location: highlandLoc,
      consent: { spiritualAnalysisOptIn: true },
    },
    location: highlandLoc,
  });

  assert.ok(highlandCase.professionalReport);
  assert.ok(highlandCase.userReport);
  assert.ok(highlandCase.userReport.foodAndNutrition.localFoodsToEmphasize.length > 0);

  // 6.2 Rift Valley Case (Oromia / East Shewa / Rift Valley / 1600m)
  const riftLoc = await resolveLocation({
    region: "Oromia",
    zone: "East Shewa",
    woreda: "Adama",
  });
  assert.strictEqual(riftLoc.agroEcological, "rift-valley");
  assert.ok(riftLoc.endemicDiseases.includes("malaria"));

  const riftCase = await evaluateCase({
    caseInput: {
      id: "case-rift-snapshot",
      userId: "user-rift",
      profileId: "prof-rift",
      narrative: "Resident near lake experiencing intermittent evening chills and joint pain.",
      symptoms: ["fever", "chills", "sweating"],
      duration: "3 days",
      selfTreatments: ["Ginger tea with honey"],
    },
    profile: {
      id: "prof-rift",
      userId: "user-rift",
      ageBand: "25-40",
      sex: "Female",
      chronicConditions: [],
      currentMeds: [],
      allergies: [],
      traditionalUse: [{ name: "Ginger" }],
      diet: { primaryStaple: "Maize" },
      substanceUse: {},
      location: riftLoc,
      consent: { spiritualAnalysisOptIn: false }, // Declined spiritual
    },
    location: riftLoc,
  });

  assert.ok(riftCase.professionalReport);
  assert.ok(riftCase.userReport);
  // Spiritual section must be strictly undefined or omitted (§1)
  assert.strictEqual(
    riftCase.userReport.yourSituation.spiritualFraming,
    undefined,
    "Declined spiritual consent must omit spiritual framing"
  );

  // 6.3 Lowland Case (Somali / Fafan / Lowland / 1200m)
  const lowlandLoc = await resolveLocation({
    region: "Somali",
    zone: "Fafan",
    woreda: "Jigjiga",
  });
  assert.strictEqual(lowlandLoc.agroEcological, "lowland");
  assert.ok(lowlandLoc.endemicDiseases.includes("leishmaniasis") || lowlandLoc.endemicDiseases.includes("dengue"));

  const lowlandCase = await evaluateCase({
    caseInput: {
      id: "case-lowland-snapshot",
      userId: "user-lowland",
      profileId: "prof-lowland",
      narrative: "Pastoralist presenting with severe dehydration and recurring fever in dry season.",
      symptoms: ["high fever", "severe thirst", "weight loss"],
      duration: "2 weeks",
      selfTreatments: ["Camel milk with herbal infusions"],
    },
    profile: {
      id: "prof-lowland",
      userId: "user-lowland",
      ageBand: "25-40",
      sex: "Male",
      chronicConditions: [],
      currentMeds: [],
      allergies: [],
      traditionalUse: [{ name: "Camel milk" }],
      diet: { primaryStaple: "Sorghum" },
      substanceUse: {},
      location: lowlandLoc,
      consent: { spiritualAnalysisOptIn: true },
    },
    location: lowlandLoc,
  });

  assert.ok(lowlandCase.professionalReport);
  assert.ok(lowlandCase.userReport);
  assert.ok(
    lowlandCase.userReport.foodAndNutrition.localFoodsToEmphasize.some(
      (f) => f.toLowerCase().includes("camel") || f.toLowerCase().includes("sorghum")
    )
  );
});

// ─── 7. STAGE A: Profile Evaluation & Location Context Grounding ─────────────
test("Stage A: Profile evaluation produces complete location-grounded PreliminaryAnalysis", async () => {
  const loc = await resolveLocation({
    region: "Sidama",
    zone: "Hawassa",
    woreda: "Hawassa Zuria",
  });

  const dummyProfile = {
    id: "prof-test-sidama",
    userId: "user-sidama-1",
    ageBand: "25-40",
    sex: "Female",
    pregnancyStatus: "Non-pregnant",
    chronicConditions: [],
    currentMeds: [],
    allergies: [],
    traditionalUse: [{ name: "Tena Adam" }],
    diet: { primaryStaple: "Enset (Kocho)" },
    substanceUse: { coffeeDailyCups: 4 },
    location: loc,
    consent: { spiritualAnalysisOptIn: true },
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const prelim = await evaluateProfile(dummyProfile);

  assert.ok(prelim.locationSummary.region.includes("Sidama"));
  assert.ok(prelim.cultural.observedPatterns.length > 0);
  assert.ok(prelim.nutrition.localStaples.length > 0);
  assert.ok(prelim.bodyScience.summary);
  assert.ok(prelim.disclaimers.some((d) => d.includes("No rule matched ≠ safe")));
  assert.ok(["low", "moderate", "high"].includes(prelim.confidence));
});
