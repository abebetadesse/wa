import { test } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateCaseWithProfile,
  fallbackMultiStrandEvaluation,
} from "../lib/case-workflow/caseEvaluationEngine.ts";
import {
  MULTI_STRAND_EVALUATION_SYSTEM_PROMPT,
} from "../lib/case-workflow/caseEvaluationPrompt.ts";

test("MULTI_STRAND_EVALUATION_SYSTEM_PROMPT contains all required analytical strands", () => {
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Highlands (Dega / Wurch"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Rift Valley"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Podoconiosis"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Road Density"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Neural Tube Defects"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Tsom & Ramadan"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Buna & Shai"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Phytic Acid"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Tena Adam"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Kosso"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Metformin"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Omeprazole"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Khat (Catha edulis"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("Areke / Katikala"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("AwudeNegest (ዓውደ ነገሥት)"));
  assert.ok(MULTI_STRAND_EVALUATION_SYSTEM_PROMPT.includes("MANDATORY FIREWALL RULE"));
});

test("evaluates complex multi-strand case: altitude, fasting, coffee polyphenol chelation, Metformin, and Tena Adam in pregnancy", async () => {
  const sampleInput = {
    userProfile: {
      personal: {
        fullName: "Tigist Haile",
        age: 30,
        gender: "female",
        pregnancyOrLactation: "pregnant_t2",
        preferredLanguage: "am",
      },
      geography_and_ecology: {
        country: "Ethiopia",
        region: "Amhara Highlands",
        altitudeMeters: 2800,
        setting: "Rural",
        roadDensity: "Low (gravel road, 40km to hospital)",
        soilType: "Volcanic red clay",
      },
      cultural_and_dietary: {
        religion: "Ethiopian Orthodox",
        fastingTradition: "Tsom (observes all fasting days strictly)",
        typicalStaples: "Teff injera, Shiro, Lentils, Gomen",
        beverageRituals: {
          bunaCeremony: "2-3 times daily, served directly with main meals",
        },
        grainPreparation: "Short 24h fermentation mixed with unfermented sorghum",
      },
      health_and_medications: {
        currentMedications: [
          { name: "Metformin", dose: "500mg BID", indication: "Impaired fasting glucose" },
          { name: "Omeprazole", dose: "20mg daily", indication: "Reflux" },
        ],
        activeHerbs: ["Tena Adam (Ruta chalepensis) tea", "Damakesse"],
        medicalHistory: ["Mild microcytic anemia"],
      },
      substance_use_and_social: {
        alcohol: "Tella once a month during holidays",
        khat: "Denies use",
        indoorSmoke: "Woodfire biomass cooking",
        socialNetwork: "Active in Iddir and Mahber",
      },
      astrological_and_numerology_data: {
        birthDate: "1994-07-20",
        sunSign: "Cancer",
        moonSign: "Capricorn",
        danMillmanLifePath: "29/11",
        awudeCircleNumber: 4,
        humoralConstitution: "Maye (Water)",
      },
    },
    submittedCase: {
      caseId: "case_tigist_001",
      caseType: "health",
      primaryChallenge: "Extreme fatigue, shortness of breath on slight inclines, and mild lower abdominal cramps",
      detailedNarrative: "I am 16 weeks pregnant. Feeling drained every afternoon. Drinking Tena Adam for stomach aches. Keeping the fast faithfully.",
      selectedInterest: "nutrition and recovery",
      includeDomainBReflection: true,
    },
  };

  const result = await evaluateCaseWithProfile(sampleInput);

  // 1. Safety Gate & Urgency
  assert.equal(result.safety_gate.passed, false, "Safety gate must flag Tena Adam use in pregnancy");
  assert.equal(result.urgency_level, "high");
  assert.ok(result.safety_gate.escalation_reason?.includes("Ruta chalepensis"));

  // 2. Causal Attribution Matrix checks
  const causeTypes = result.causal_attribution_matrix.map((c) => c.cause_type);
  assert.ok(causeTypes.includes("traditional_herb_toxicity"), "Must detect herbal toxicity in pregnancy");
  assert.ok(causeTypes.includes("physiological_altitude"), "Must detect highland erythropoietic demand");
  assert.ok(causeTypes.includes("fasting_depletion"), "Must detect plant-exclusive fasting depletion");
  assert.ok(causeTypes.includes("dietary_antinutritional"), "Must detect coffee polyphenol / phytate chelation");
  assert.ok(causeTypes.includes("medication_interaction"), "Must detect Metformin/PPI depletions");

  // 3. Environmental Triage
  assert.equal(result.epidemiological_and_environmental_triage.altitude_zone, "Highland (Dega/Wurch)");
  assert.equal(result.epidemiological_and_environmental_triage.altitude_meters, 2800);
  assert.ok(
    result.epidemiological_and_environmental_triage.local_endemic_risks.some((r) =>
      r.includes("Podoconiosis") || r.includes("Highland hypoxia")
    )
  );

  // 4. Domain B Cultural Reflection (Strict Firewalling)
  assert.equal(result.domain_b_cultural_reflection.is_requested, true);
  assert.equal(result.domain_b_cultural_reflection.status, "included_firewalled");
  assert.ok(result.domain_b_cultural_reflection.awude_negest_circle?.includes("Circle #4"));
  assert.ok(result.domain_b_cultural_reflection.numerology_life_path?.includes("29/11"));
  assert.ok(
    result.domain_b_cultural_reflection.firewall_disclaimer.includes("not empirical evidence")
  );

  // 5. Expert & Admin Summaries
  assert.ok(result.expert_case_summary.primary_impression.length > 0);
  assert.ok(
    result.expert_case_summary.pharmacological_and_herb_reconciliation.some((item) =>
      item.includes("Ruta chalepensis")
    )
  );
  assert.ok(
    result.expert_case_summary.substance_and_lifestyle_interactions.some((item) =>
      item.includes("Buna") || item.includes("coffee")
    )
  );
  assert.ok(result.admin_system_summary.recommended_expert_specialty.includes("Obstetrician"));
  assert.ok(result.admin_system_summary.profile_completeness_pct >= 80);
});

test("evaluates substance-driven case with Khat, Areke, and critical red-flag emergency screening", () => {
  const substanceInput = {
    userProfile: {
      personal: { age: 42, gender: "male" },
      geography_and_ecology: { altitudeMeters: 1600, setting: "Peri-urban", region: "Oromia" },
      cultural_and_dietary: { fastingTradition: "None" },
      substance_use_and_social: {
        khat: "Chews daily during long afternoon Bercha sessions",
        alcohol: "Drinks traditional Areke (distilled katikala) 3-4 evenings weekly",
        tobacco: "Smokes 10 cigarettes daily",
      },
      health_and_medications: {
        currentMedications: [{ name: "Hydrochlorothiazide", dose: "25mg", indication: "Hypertension" }],
      },
    },
    submittedCase: {
      caseId: "case_subst_002",
      caseType: "health",
      primaryChallenge: "Severe crushing chest pain radiating to left jaw, accompanied by heavy sweating and shortness of breath for the past 45 minutes",
      detailedNarrative: "I was chewing khat and drinking areke when sudden pressure hit my chest like an elephant sitting on me. Feeling dizzy and nauseous.",
      includeDomainBReflection: true,
    },
  };

  const result = fallbackMultiStrandEvaluation(substanceInput, {
    level: "critical",
    score: 1.0,
    action: "immediate_emergency",
    recommendation: "Suspected acute coronary syndrome. Immediate ambulance dispatch required.",
    matchedSignals: ["crushing chest pain", "radiating to jaw"],
    domainBAllowed: false,
  });

  // Critical safety check
  assert.equal(result.urgency_level, "critical");
  assert.equal(result.safety_gate.critical_flag, true);
  assert.equal(result.safety_gate.passed, false);

  // Domain B must be firewalled due to critical safety
  assert.equal(result.domain_b_cultural_reflection.status, "firewalled_due_to_critical_safety");

  // Substance causes identified
  const causes = result.causal_attribution_matrix.map((c) => c.cause_type);
  assert.ok(causes.includes("substance_related"), "Must identify khat/alcohol causes");
  assert.ok(causes.includes("medication_interaction"), "Must identify diuretic mineral depletion");
});
