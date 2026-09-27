import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";

export interface RedFlagRule {
  id: string;
  flag: string;
  amharic: string;
  triggerKeywords: string[];
  rationale: string;
  urgency: "immediate" | "24h" | "routine";
  emergencyDirective: string;
}

export interface RedFlagOutput {
  identifiedRedFlags: RedFlagRule[];
  highestUrgency?: "immediate" | "24h" | "routine";
  emergencyActionRequired: boolean;
  directives: string[];
}

export const KNOWN_RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: "RF-HEM-01",
    flag: "Active Hemorrhage / Hematemesis / Melena",
    amharic: "የደም ማስመለስ ወይም ጥቁር ሰገራ መታየት",
    triggerKeywords: ["blood in vomit", "black stool", "bleeding", "vomiting blood", "melena", "hemorrhage", "ደም ማስታወክ"],
    rationale: "Upper gastrointestinal hemorrhage or active systemic coagulopathy requiring emergent endoscopic or surgical intervention.",
    urgency: "immediate",
    emergencyDirective: "GO TO NEAREST EMERGENCY HOSPITAL IMMEDIATELY. Do not ingest oral herbs, solids, or liquids.",
  },
  {
    id: "RF-RESP-02",
    flag: "Severe Dyspnea / Stridor / Resting Cyanosis",
    amharic: "ከፍተኛ የአተነፋፈስ መቆራረጥ እና የትንፋሽ እጥረት",
    triggerKeywords: ["shortness of breath", "gasping", "cannot breathe", "stridor", "cyanosis", "ትንፋሽ ማጠር"],
    rationale: "Acute respiratory distress, decompensated pulmonary edema, or severe airway obstruction.",
    urgency: "immediate",
    emergencyDirective: "CALL EMERGENCY SERVICES (907/911 in Addis Ababa) OR REPORT TO EMERGENCY ROOM. Keep upright.",
  },
  {
    id: "RF-NEURO-03",
    flag: "Altered Mental Status / Syncope / Sudden Focal Deficit",
    amharic: "ድንገተኛ ራስን መሳት፣ የመናገር መቆራረጥ ወይም የስሜት መጥፋት",
    triggerKeywords: ["fainted", "unconscious", "confusion", "slurred speech", "weakness on one side", "syncope", "ራስ መሳት"],
    rationale: "Acute cerebrovascular accident (stroke), severe hypoglycemia, or central nervous system infection.",
    urgency: "immediate",
    emergencyDirective: "EMERGENCY TRANSPORT REQUIRED. Monitor airway and position client on side in recovery position.",
  },
  {
    id: "RF-PREG-04",
    flag: "Pregnancy Warning Signs (Vaginal Bleeding / Severe Headache with Scotoma)",
    amharic: "በእርግዝና ወቅት የሚታይ ደም መፍሰስ ወይም ከባድ የራስ ምታት",
    triggerKeywords: ["pregnant and bleeding", "severe headache pregnancy", "blurred vision pregnancy", "seizures pregnant", "እርጉዝ ሆና ደም"],
    rationale: "Threatened miscarriage, placental abruption, or severe preeclampsia / eclampsia risking maternal-fetal mortality.",
    urgency: "immediate",
    emergencyDirective: "REPORT TO MATERNAL OBSTETRIC EMERGENCY UNIT IMMEDIATELY.",
  },
  {
    id: "RF-FEVER-05",
    flag: "High Unremitting Fever with Rigors in Malaria/Endemic Zone",
    amharic: "ከፍተኛ ትኩሳት ከብርድ ብርድ ማለት ጋር",
    triggerKeywords: ["high fever", "shivering uncontrollably", "rigors", "convulsions", "ብርድ ብርድ እና ትኩሳት"],
    rationale: "Potential complicated Plasmodium falciparum malaria or systemic bacteremia/sepsis.",
    urgency: "24h",
    emergencyDirective: "Obtain urgent malaria blood smear and clinical evaluation within 24 hours.",
  },
];

const provenance: SourceRef[] = [
  {
    id: "ETH-CLIN-RED-01",
    title: "Ethiopian National Standard Treatment Guidelines for General Hospital",
    type: "paper",
    citation: "Food, Medicine and Health Care Administration and Control Authority (FMHACA) of Ethiopia, Addis Ababa.",
    year: 2014,
  },
];

export const redFlagsPillar: Pillar<{ narrative?: string; symptoms?: string[] }, RedFlagOutput> = {
  id: "clinical.redFlags",
  version: "1.0.0",
  domain: "clinical",
  audience: "both",
  requires: [],
  async query(input, _ctx: LocationContext): Promise<PillarResult<RedFlagOutput>> {
    const text = `${input?.narrative || ""} ${(input?.symptoms || []).join(" ")}`.toLowerCase();
    const identified: RedFlagRule[] = [];

    for (const rule of KNOWN_RED_FLAG_RULES) {
      const matched = rule.triggerKeywords.some((keyword) => text.includes(keyword.toLowerCase()));
      if (matched) {
        identified.push(rule);
      }
    }

    let highestUrgency: "immediate" | "24h" | "routine" | undefined = undefined;
    if (identified.some((r) => r.urgency === "immediate")) {
      highestUrgency = "immediate";
    } else if (identified.some((r) => r.urgency === "24h")) {
      highestUrgency = "24h";
    } else if (identified.length > 0) {
      highestUrgency = "routine";
    }

    return {
      pillarId: "clinical.redFlags",
      version: "1.0.0",
      domain: "clinical",
      audience: "both",
      confidence: "high",
      data: {
        identifiedRedFlags: identified,
        highestUrgency,
        emergencyActionRequired: highestUrgency === "immediate",
        directives: identified.map((r) => r.emergencyDirective),
      },
      provenance,
    };
  },
  provenance,
};
