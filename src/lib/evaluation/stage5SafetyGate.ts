import { Medication, SafetyCheckResult } from "./types";

export interface HerbInteractionRule {
  herbName: string;
  scientificName: string;
  targetDrugClass: string;
  interactionSeverity: "high" | "moderate" | "caution";
  mechanism: string;
  physiologicalEffect: string;
  plainLanguageEffect?: string;
  audience?: "user" | "professional" | "both";
  cypPathways?: string[];
  contraindicated: boolean;
  sourceRef: string;
}

// Certified scientific interaction database (ETM-DB)
export const KNOWN_HERB_DRUG_RULES: HerbInteractionRule[] = [
  {
    herbName: "Tena Adam",
    scientificName: "Ruta chalepensis",
    targetDrugClass: "Anticoagulants / Antiplatelets",
    interactionSeverity: "high",
    mechanism: "Furanocoumarins and rutin exert potent additive antiplatelet and antithrombotic effects, inhibiting CYP3A4-mediated drug metabolism.",
    physiologicalEffect: "Significant risk of gastrointestinal hemorrhage and uncontrollable bleeding.",
    plainLanguageEffect: "Tena Adam significantly increases bleeding risk when taken with blood thinners like Warfarin or Aspirin. Do not take together.",
    audience: "both",
    cypPathways: ["CYP3A4", "CYP2C9"],
    contraindicated: true,
    sourceRef: "ETM-SAFETY-WAR-01",
  },
  {
    herbName: "Kosso",
    scientificName: "Hagenia abyssinica",
    targetDrugClass: "Anticoagulants / Antiplatelets",
    interactionSeverity: "high",
    mechanism: "Kosotoxin causes mucosal gastrointestinal erosion and hepatotoxic stress, compounding anticoagulant-induced hemorrhage.",
    physiologicalEffect: "Life-threatening internal hemorrhage and hepatic decompensation.",
    plainLanguageEffect: "Kosso causes severe stomach lining irritation and compounding risk of internal bleeding when combined with blood-thinning medication.",
    audience: "both",
    cypPathways: ["CYP1A2", "CYP2E1"],
    contraindicated: true,
    sourceRef: "ETM-SAFETY-KOS-02",
  },
  {
    herbName: "Kosso",
    scientificName: "Hagenia abyssinica",
    targetDrugClass: "Hypoglycemics",
    interactionSeverity: "high",
    mechanism: "Disruption of systemic acid-base equilibrium and additive metabolic strain with biguanides.",
    physiologicalEffect: "Uncontrolled metabolic destabilization and lactic acidosis risk.",
    plainLanguageEffect: "Kosso interferes dangerously with diabetes medication, risking sudden metabolic instability.",
    audience: "both",
    cypPathways: ["Renal/Mitochondrial"],
    contraindicated: true,
    sourceRef: "ETM-SAFETY-KOS-03",
  },
  {
    herbName: "Tikur Azmud",
    scientificName: "Nigella sativa",
    targetDrugClass: "Hypoglycemics",
    interactionSeverity: "moderate",
    mechanism: "Thymoquinone enhances pancreatic insulin secretion and tissue glucose uptake additively with oral hypoglycemic agents.",
    physiologicalEffect: "Risk of symptomatic or nocturnal hypoglycemia.",
    plainLanguageEffect: "Tikur Azmud lowers blood sugar and can cause your blood sugar to drop too low when taking diabetes medicine. Monitor closely.",
    audience: "both",
    cypPathways: ["CYP2C19", "CYP3A4"],
    contraindicated: false,
    sourceRef: "ETM-SAFETY-GLU-03",
  },
  {
    herbName: "Damakesse",
    scientificName: "Ocimum lamiifolium",
    targetDrugClass: "Antihypertensives",
    interactionSeverity: "moderate",
    mechanism: "Synergistic vasodilatory effect potentiating systemic vascular resistance reduction.",
    physiologicalEffect: "Sudden orthostatic hypotension, syncope, and dizziness.",
    plainLanguageEffect: "Damakesse relaxes blood vessels and can cause dizzy spells or fainting if taken alongside blood pressure medicines.",
    audience: "both",
    cypPathways: ["Endothelial/NO pathway"],
    contraindicated: false,
    sourceRef: "ETM-SAFETY-HYP-04",
  },
  {
    herbName: "Feto",
    scientificName: "Lepidium sativum",
    targetDrugClass: "Diuretics",
    interactionSeverity: "moderate",
    mechanism: "Additive natriuresis and aqueous diuresis compounding fluid/potassium losses.",
    physiologicalEffect: "Electrolyte depletion, prerenal azotemia, and dehydration.",
    plainLanguageEffect: "Feto acts as a strong natural water-pill, and taking it with water pills (diuretics) can cause severe dehydration.",
    audience: "both",
    cypPathways: ["Renal tubular"],
    contraindicated: false,
    sourceRef: "ETM-SAFETY-DIU-05",
  },
];

/**
 * MANDATORY SAFETY GATE:
 * Evaluates candidate traditional herbal remedies against client's active prescription medications.
 * If ANY high-severity interaction or strict contraindication is found, or if flagged by scientific rules,
 * the remedy MUST be culled and NEVER surfaced to the user.
 */
export function checkHerbDrugSafety(
  herbName: string,
  clientMedications: Medication[],
  customRules: HerbInteractionRule[] = KNOWN_HERB_DRUG_RULES
): SafetyCheckResult {
  const normHerb = herbName.toLowerCase();

  for (const med of clientMedications) {
    const medClass = med.drugClass.toLowerCase();
    const medName = med.name.toLowerCase();

    for (const rule of customRules) {
      if (
        normHerb.includes(rule.herbName.toLowerCase()) ||
        normHerb.includes(rule.scientificName.toLowerCase())
      ) {
        const ruleClass = rule.targetDrugClass.toLowerCase();

        // Check drug class match or name keyword match
        const matchesClass = medClass.includes(ruleClass) || ruleClass.includes(medClass);
        const matchesName =
          (ruleClass.includes("anticoagulant") && (medName.includes("warfarin") || medName.includes("aspirin") || medName.includes("heparin") || medName.includes("clopidogrel"))) ||
          (ruleClass.includes("hypoglycemic") && (medName.includes("metformin") || medName.includes("insulin") || medName.includes("glimepiride"))) ||
          (ruleClass.includes("antihypertensive") && (medName.includes("lisinopril") || medName.includes("amlodipine") || medName.includes("losartan"))) ||
          (ruleClass.includes("diuretic") && (medName.includes("furosemide") || medName.includes("hydrochlorothiazide") || medName.includes("lasix")));

        if (matchesClass || matchesName) {
          // If marked high severity or contraindicated, FLAG IMMEDIATELY
          if (rule.interactionSeverity === "high" || rule.contraindicated) {
            return {
              herbName: rule.herbName,
              status: "flagged",
              flaggedDrugClass: rule.targetDrugClass,
              flaggedMedication: med.name,
              severity: rule.interactionSeverity,
              mechanism: rule.mechanism,
              physiologicalEffect: rule.physiologicalEffect,
              contraindicated: rule.contraindicated,
              sourceRef: rule.sourceRef,
            };
          }
        }
      }
    }
  }

  return {
    herbName,
    status: "pass",
    sourceRef: "ETM-SAFETY-CLEAR",
  };
}
