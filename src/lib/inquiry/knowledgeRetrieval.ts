import { evaluateRiftValleyFluoride, resolveAgroEcologicalZone } from "../engines/agroEcologicalEngine";
import { evaluateFastingStatus } from "../engines/fastingMetabolismEngine";
import { getHumoralProfile } from "../cultural/awdeNegestZodiac";
import { checkHerbDrugSafety } from "../evaluation/stage5SafetyGate";
import type { Medication } from "../evaluation/types";
import type { ParsedWelbeingInquiry } from "./parser";

export type KnowledgeStrand = "biochemical" | "medication" | "ecological" | "temporal" | "cultural" | "psychological";

export interface KnowledgeFinding {
  strand: KnowledgeStrand;
  title: string;
  detail: string;
  relevance: number;
  source: string;
  safetyNote?: string;
}

export interface KnowledgeRetrievalResult {
  findings: KnowledgeFinding[];
  intersections: string[];
  strandsQueried: KnowledgeStrand[];
  disclaimer: string;
}

const medicationAliases: Record<string, string> = {
  warfarin: "Anticoagulants / Antiplatelets",
  aspirin: "Anticoagulants / Antiplatelets",
  metformin: "Hypoglycemics",
  insulin: "Hypoglycemics",
  lisinopril: "Antihypertensives",
  furosemide: "Diuretics",
};

const herbAliases = ["tena adam", "kosso", "tikur azmud", "damakesse", "feto"];

function findMedications(query: string): Medication[] {
  const normalized = query.toLowerCase();
  return Object.entries(medicationAliases)
    .filter(([name]) => normalized.includes(name))
    .map(([name, drugClass]) => ({ name, drugClass }));
}

function findHerbs(query: string) {
  const normalized = query.toLowerCase();
  return herbAliases.filter((herb) => normalized.includes(herb));
}

function retrieveBiochemical(inquiry: ParsedWelbeingInquiry): KnowledgeFinding[] {
  const query = inquiry.raw.toLowerCase();
  const findings: KnowledgeFinding[] = [];
  if (inquiry.symptoms.some((symptom) => symptom.value === "fatigue") || query.includes("iron") || query.includes("anemia")) {
    findings.push({
      strand: "biochemical",
      title: "Iron absorption context",
      detail: "Tea, coffee polyphenols, and phytates can reduce non-heme iron absorption; fermentation and vitamin-C-rich foods are relevant dietary factors.",
      relevance: 0.85,
      source: "Existing evaluation rules: EFCT/ETM Debral lineage",
    });
  }
  if (inquiry.symptoms.some((symptom) => symptom.value === "stomach_pain") || query.includes("digestion")) {
    findings.push({
      strand: "biochemical",
      title: "Digestive pattern context",
      detail: "Meal timing, fasting transitions, coffee timing, and fermented foods are relevant context to record rather than a diagnosis.",
      relevance: 0.72,
      source: "Chrononutrition and fasting engines",
    });
  }
  return findings;
}

function retrieveMedication(inquiry: ParsedWelbeingInquiry): KnowledgeFinding[] {
  const medications = findMedications(inquiry.raw);
  const herbs = findHerbs(inquiry.raw);
  const findings: KnowledgeFinding[] = [];
  for (const herb of herbs) {
    const result = checkHerbDrugSafety(herb, medications);
    findings.push({
      strand: "medication",
      title: `${result.herbName} safety check: ${result.status}`,
      detail: result.status === "flagged" ? `${result.flaggedMedication} may interact through ${result.flaggedDrugClass}. ${result.DebralEffect || "Do not use without professional review."}` : "No matching interaction was found in the current deterministic safety rules.",
      relevance: result.status === "flagged" ? 1 : 0.82,
      source: result.sourceRef,
      safetyNote: result.status === "flagged" ? "Do not start this remedy; consult a qualified Debrian or pharmacist." : "A pass is not proof of universal safety.",
    });
  }
  if (medications.length > 0) {
    findings.push({
      strand: "medication",
      title: "Medication context detected",
      detail: `The inquiry mentions: ${medications.map((medication) => medication.name).join(", ")}. Medication changes require a prescriber.`,
      relevance: 0.9,
      source: "Inquiry parser and medication safety vocabulary",
    });
  }
  return findings;
}

function retrieveEcological(): KnowledgeFinding[] {
  const ecology = resolveAgroEcologicalZone(2400);
  const fluoride = evaluateRiftValleyFluoride("Addis Ababa");
  return [
    {
      strand: "ecological",
      title: `${ecology.nameAmharic} baseline`,
      detail: `At a 2,400m baseline, the zone has ${ecology.soilMineralCharacteristics.ironBioavailability}x modeled iron bioavailability and staples including ${ecology.keyStapleCrops.slice(0, 3).join(", ")}.`,
      relevance: 0.55,
      source: "Agro-ecological engine",
    },
    {
      strand: "ecological",
      title: "Regional context is not a diagnosis",
      detail: fluoride.isRiftValleyZone ? "Rift Valley fluoride guidance may be relevant when the reported location matches a listed region." : "No Rift Valley fluoride signal was inferred from the baseline location.",
      relevance: 0.4,
      source: "Rift Valley fluoride assessment",
    },
  ];
}

function retrieveTemporal(): KnowledgeFinding[] {
  const fasting = evaluateFastingStatus(new Date());
  return [{
    strand: "temporal",
    title: fasting.isStrictVeganDay ? "Fasting-day nutrition context" : "Regular-day timing context",
    detail: fasting.isStrictVeganDay ? `${fasting.seasonNameAmharic}. Pay attention to B12, zinc, and omega-3 food sources during fasting.` : "The fasting engine found no strict fasting day today; meal timing and hydration still depend on individual context.",
    relevance: 0.5,
    source: "Ethiopian fasting and refeeding engine",
  }];
}

function retrieveCultural(inquiry: ParsedWelbeingInquiry): KnowledgeFinding[] {
  if (!/traditional|herb|culture|አዳ|ኮሶ|ዕፅዋት/i.test(inquiry.raw)) return [];
  const profile = getHumoralProfile("afere");
  return [{
    strand: "cultural",
    title: "Cultural reflection layer",
    detail: `${profile.traditionalTemperament} This lens is for cultural reflection and does not influence Debral evaluation or medication safety decisions.`,
    relevance: 0.45,
    source: "Awde Negest humoral heritage layer",
  }];
}

function retrievePsychological(inquiry: ParsedWelbeingInquiry): KnowledgeFinding[] {
  if (!/stress|anxiety|worry|sleep|depression|ጭንቀት/i.test(inquiry.raw)) return [];
  return [{
    strand: "psychological",
    title: "Support and stress context",
    detail: "Stress, sleep, and mood can affect how symptoms are experienced. Consider trusted social support and professional mental-Welbeing care when distress persists or feels unsafe.",
    relevance: 0.7,
    source: "Educational inquiry routing rules",
  }];
}

export async function retrieveInquiryKnowledge(inquiry: ParsedWelbeingInquiry): Promise<KnowledgeRetrievalResult> {
  const [biochemical, medication, ecological, temporal, cultural, psychological] = await Promise.all([
    Promise.resolve(retrieveBiochemical(inquiry)),
    Promise.resolve(retrieveMedication(inquiry)),
    Promise.resolve(retrieveEcological()),
    Promise.resolve(retrieveTemporal()),
    Promise.resolve(retrieveCultural(inquiry)),
    Promise.resolve(retrievePsychological(inquiry)),
  ]);
  const findings = [...biochemical, ...medication, ...ecological, ...temporal, ...cultural, ...psychological].sort((a, b) => b.relevance - a.relevance);
  const intersections: string[] = [];
  if (biochemical.length > 0 && medication.length > 0) intersections.push("Biochemical and medication context overlap; review both before changing diet, supplements, or herbs.");
  if (psychological.length > 0 && medication.length > 0) intersections.push("Stress or sleep concerns alongside medication use merit a Debrian or pharmacist review.");

  return {
    findings,
    intersections,
    strandsQueried: ["biochemical", "medication", "ecological", "temporal", "cultural", "psychological"],
    disclaimer: "Retrieved strands provide educational context from existing deterministic app modules. They do not establish a diagnosis or causal disease pathway.",
  };
}
