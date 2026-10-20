import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";
import { EMERGENCY_GUIDANCE } from "@/lib/safety/emergencyContacts";
import { screenText, type UrgencyLevel } from "@/server/safety/urgency";

export interface RedFlagRule {
  id: string;
  flag: string;
  amharic: string;
  /** Examples of wording; matching is done by the shared screen through `signIds`. */
  triggerKeywords: string[];
  /** Signs of the shared screen (src/server/safety/urgency.ts) that raise this flag. */
  signIds: string[];
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
    signIds: ["bleeding", "blood_in_stool", "bleeding_other"],
    rationale: "Upper gastrointestinal hemorrhage or active systemic coagulopathy requiring emergent endoscopic or surgical intervention.",
    urgency: "immediate",
    emergencyDirective: "GO TO NEAREST EMERGENCY HOSPITAL IMMEDIATELY. Do not ingest oral herbs, solids, or liquids.",
  },
  {
    id: "RF-RESP-02",
    flag: "Severe Dyspnea / Stridor / Resting Cyanosis",
    amharic: "ከፍተኛ የአተነፋፈስ መቆራረጥ እና የትንፋሽ እጥረት",
    triggerKeywords: ["shortness of breath", "gasping", "cannot breathe", "stridor", "cyanosis", "ትንፋሽ ማጠር"],
    signIds: ["breathing", "breathless"],
    rationale: "Acute respiratory distress, decompensated pulmonary edema, or severe airway obstruction.",
    urgency: "immediate",
    emergencyDirective: `${EMERGENCY_GUIDANCE} Keep upright.`,
  },
  {
    id: "RF-NEURO-03",
    flag: "Altered Mental Status / Syncope / Sudden Focal Deficit",
    amharic: "ድንገተኛ ራስን መሳት፣ የመናገር መቆራረጥ ወይም የስሜት መጥፋት",
    triggerKeywords: ["fainted", "unconscious", "confusion", "slurred speech", "weakness on one side", "syncope", "ራስ መሳት"],
    signIds: ["unconscious", "stroke", "head_injury"],
    rationale: "Acute cerebrovascular accident (stroke), severe hypoglycemia, or central nervous system infection.",
    urgency: "immediate",
    emergencyDirective: "EMERGENCY TRANSPORT REQUIRED. Monitor airway and position client on side in recovery position.",
  },
  {
    id: "RF-PREG-04",
    flag: "Pregnancy Warning Signs (Vaginal Bleeding / Severe Headache with Scotoma)",
    amharic: "በእርግዝና ወቅት የሚታይ ደም መፍሰስ ወይም ከባድ የራስ ምታት",
    triggerKeywords: ["pregnant and bleeding", "severe headache pregnancy", "blurred vision pregnancy", "seizures pregnant", "እርጉዝ ሆና ደም"],
    signIds: ["pregnancy_danger"],
    rationale: "Threatened miscarriage, placental abruption, or severe preeclampsia / eclampsia risking maternal-fetal mortality.",
    urgency: "immediate",
    emergencyDirective: "REPORT TO MATERNAL OBSTETRIC EMERGENCY UNIT IMMEDIATELY.",
  },
  {
    id: "RF-FEVER-05",
    flag: "High Unremitting Fever with Rigors in Malaria/Endemic Zone",
    amharic: "ከፍተኛ ትኩሳት ከብርድ ብርድ ማለት ጋር",
    triggerKeywords: ["high fever", "shivering uncontrollably", "rigors", "convulsions", "ብርድ ብርድ እና ትኩሳት"],
    signIds: ["high_fever", "seizure"],
    rationale: "Potential complicated Plasmodium falciparum malaria or systemic bacteremia/sepsis.",
    urgency: "24h",
    emergencyDirective: "Obtain urgent malaria blood smear and clinical evaluation within 24 hours.",
  },
];

const URGENCY_FOR_LEVEL: Record<UrgencyLevel, RedFlagRule["urgency"]> = { emergency: "immediate", urgent: "24h", soon: "routine", routine: "routine" };

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
    const text = `${input?.narrative || ""} ${(input?.symptoms || []).join(" ")}`;
    // Thin adapter over the shared screen: flags come from its signs, the urgency from its level.
    const screen = screenText(text);
    const signIds = new Set(screen.signs.map((sign) => sign.id));
    const identified = KNOWN_RED_FLAG_RULES.filter((rule) => rule.signIds.some((id) => signIds.has(id)));
    const highestUrgency = identified.length > 0 || screen.level !== "routine" ? URGENCY_FOR_LEVEL[screen.level] : undefined;

    return {
      pillarId: "clinical.redFlags",
      version: "1.0.0",
      domain: "clinical",
      audience: "both",
      confidence: "high",
      data: {
        identifiedRedFlags: identified,
        highestUrgency,
        emergencyActionRequired: screen.level === "emergency",
        directives: identified.length > 0 ? identified.map((r) => r.emergencyDirective) : screen.level === "emergency" ? [EMERGENCY_GUIDANCE] : [],
      },
      provenance,
    };
  },
  provenance,
};
