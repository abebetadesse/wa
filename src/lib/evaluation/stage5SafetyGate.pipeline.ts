import { Medication } from "./types";
import { HerbInteractionRule, KNOWN_HERB_DRUG_RULES } from "./stage5SafetyGate";

export interface PipelineSafetyGateResult {
  status: "pass" | "caution" | "blocked";
  blocked: boolean;
  overrideRequired: boolean;
  matchedRules: HerbInteractionRule[];
  flaggedHerbs: string[];
  flaggedMedications: string[];
  disclaimer: string;
  summary: string;
}

export const SAFETY_GATE_DISCLAIMER = "No rule matched ≠ safe. Absence of a known interaction rule in the database does not guarantee safety or absence of clinical risk.";

/**
 * Pipeline Safety Gate Wrapper (§13):
 * Evaluates candidate herbs or client-reported traditional remedies against active prescription medications.
 * - Any "high" severity or contraindicated interaction sets `blocked: true`, `overrideRequired: true`, status: "blocked".
 * - "moderate" or "caution" sets status: "caution", `blocked: false`, `overrideRequired: false`.
 * - If no rules matched, returns status: "pass" with the mandatory disclaimer verbatim.
 */
export function evaluateSafetyGate(
  herbNames: string[] = [],
  medications: (Medication | { name: string; dose?: string; drugClass?: string })[] = [],
  customRules: HerbInteractionRule[] = KNOWN_HERB_DRUG_RULES
): PipelineSafetyGateResult {
  const normalizedHerbs = herbNames.map((h) => (typeof h === "string" ? h.trim().toLowerCase() : "")).filter(Boolean);
  const normalizedMeds = medications.map((m) => {
    const name = (m.name || "").toLowerCase();
    const drugClass = (m.drugClass || "").toLowerCase();
    return { name, drugClass, raw: m };
  });

  const matchedRules: HerbInteractionRule[] = [];
  const flaggedHerbs = new Set<string>();
  const flaggedMedications = new Set<string>();
  let hasHighSeverity = false;

  for (const herb of normalizedHerbs) {
    for (const med of normalizedMeds) {
      for (const rule of customRules) {
        const ruleHerb = rule.herbName.toLowerCase();
        const ruleSci = rule.scientificName.toLowerCase();
        const matchesHerb = herb.includes(ruleHerb) || ruleHerb.includes(herb) || herb.includes(ruleSci);

        if (!matchesHerb) continue;

        const ruleClass = rule.targetDrugClass.toLowerCase();
        const matchesClass =
          med.drugClass.includes(ruleClass) ||
          ruleClass.includes(med.drugClass) ||
          (ruleClass.includes("anticoagulant") && (med.name.includes("warfarin") || med.name.includes("aspirin") || med.name.includes("heparin") || med.name.includes("clopidogrel"))) ||
          (ruleClass.includes("hypoglycemic") && (med.name.includes("metformin") || med.name.includes("insulin") || med.name.includes("glimepiride"))) ||
          (ruleClass.includes("antihypertensive") && (med.name.includes("lisinopril") || med.name.includes("amlodipine") || med.name.includes("losartan"))) ||
          (ruleClass.includes("diuretic") && (med.name.includes("furosemide") || med.name.includes("hydrochlorothiazide") || med.name.includes("lasix")));

        if (matchesClass) {
          if (!matchedRules.some((r) => r.sourceRef === rule.sourceRef && r.herbName === rule.herbName)) {
            matchedRules.push(rule);
          }
          flaggedHerbs.add(rule.herbName);
          flaggedMedications.add(med.name || rule.targetDrugClass);
          if (rule.interactionSeverity === "high" || rule.contraindicated) {
            hasHighSeverity = true;
          }
        }
      }
    }
  }

  if (hasHighSeverity) {
    return {
      status: "blocked",
      blocked: true,
      overrideRequired: true,
      matchedRules,
      flaggedHerbs: Array.from(flaggedHerbs),
      flaggedMedications: Array.from(flaggedMedications),
      disclaimer: SAFETY_GATE_DISCLAIMER,
      summary: `High-severity herb-drug contraindication detected: ${Array.from(flaggedHerbs).join(", ")} with ${Array.from(flaggedMedications).join(", ")}. User publication blocked until clinician override.`,
    };
  }

  if (matchedRules.length > 0) {
    return {
      status: "caution",
      blocked: false,
      overrideRequired: false,
      matchedRules,
      flaggedHerbs: Array.from(flaggedHerbs),
      flaggedMedications: Array.from(flaggedMedications),
      disclaimer: SAFETY_GATE_DISCLAIMER,
      summary: `Moderate interaction caution identified for ${Array.from(flaggedHerbs).join(", ")}. Clinical monitoring recommended.`,
    };
  }

  return {
    status: "pass",
    blocked: false,
    overrideRequired: false,
    matchedRules: [],
    flaggedHerbs: [],
    flaggedMedications: [],
    disclaimer: SAFETY_GATE_DISCLAIMER,
    summary: "No immediate herb-drug contraindications flagged in database.",
  };
}
