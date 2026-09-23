export type DiscoveryItemType = "drug" | "herb" | "nutrient" | "practice" | "cultural";
export type EvidenceLevel = "RCT" | "meta-analysis" | "systematic-review" | "observational" | "traditional" | "prescientific";

export interface MechanismMatch {
  id: string;
  sourceType: DiscoveryItemType;
  sourceName: string;
  targetType: DiscoveryItemType;
  targetName: string;
  mechanism: string;
  evidenceLevel: EvidenceLevel;
  confidenceScore: number;
  pubmedIds: string[];
  ethiopianContext?: string;
  safetyNotes: string[];
}

export interface DiscoveryResult {
  query: string;
  queryType: "medication" | "symptom" | "condition" | "all";
  matches: MechanismMatch[];
  disclaimer: string;
}

const evidenceWeights: Record<EvidenceLevel, number> = {
  "meta-analysis": 1,
  RCT: 0.95,
  "systematic-review": 0.9,
  observational: 0.6,
  traditional: 0.4,
  prescientific: 0.3,
};

const matches: MechanismMatch[] = [
  {
    id: "metformin-moringa-ampk", sourceType: "drug", sourceName: "Metformin", targetType: "herb", targetName: "Moringa (Moringa stenopetala)",
    mechanism: "AMPK pathway and glucose-uptake signaling", evidenceLevel: "prescientific", confidenceScore: 0.42, pubmedIds: [],
    ethiopianContext: "Moringa stenopetala is used as a food and botanical in Ethiopia.", safetyNotes: ["Mechanistic parallel is not evidence of equivalent effect or safety with metformin.", "Potential additive glucose-lowering effect requires practitioner review."],
  },
  {
    id: "aspirin-ginger-cox", sourceType: "drug", sourceName: "Aspirin", targetType: "herb", targetName: "Ginger (Zingiber officinale)",
    mechanism: "Cyclooxygenase and inflammatory mediator modulation", evidenceLevel: "observational", confidenceScore: 0.55, pubmedIds: [],
    ethiopianContext: "Zingibil is a common Ethiopian culinary and traditional botanical ingredient.", safetyNotes: ["Do not interpret this match as permission to combine concentrated ginger products with antiplatelet therapy.", "Bleeding risk depends on dose, preparation, and individual factors."],
  },
  {
    id: "statin-garlic-lipid", sourceType: "drug", sourceName: "Statins", targetType: "herb", targetName: "Garlic (Allium sativum)",
    mechanism: "Lipid metabolism and HMG-CoA-related pathway discussion", evidenceLevel: "observational", confidenceScore: 0.48, pubmedIds: [],
    ethiopianContext: "Garlic is a widely used Ethiopian culinary ingredient.", safetyNotes: ["Culinary use and concentrated extracts are not equivalent.", "Review supplements with a pharmacist before combining with prescription medicines."],
  },
  {
    id: "iron-teff-fermentation", sourceType: "nutrient", sourceName: "Iron", targetType: "practice", targetName: "Fermented teff injera", mechanism: "Phytate reduction and non-heme iron bioavailability", evidenceLevel: "observational", confidenceScore: 0.72, pubmedIds: [],
    ethiopianContext: "Ersho fermentation is a culturally established Ethiopian food practice.", safetyNotes: ["This is an educational food-composition parallel, not a diagnosis or iron-treatment plan."],
  },
  {
    id: "metformin-b12", sourceType: "drug", sourceName: "Metformin", targetType: "nutrient", targetName: "Vitamin B12", mechanism: "Long-term therapy can reduce cobalamin absorption", evidenceLevel: "systematic-review", confidenceScore: 0.88, pubmedIds: [],
    ethiopianContext: "Extended Orthodox fasting can also reduce dietary B12 exposure.", safetyNotes: ["Discuss laboratory monitoring with the prescribing practitioner; do not change medication independently."],
  },
  {
    id: "headache-ginger", sourceType: "practice", sourceName: "Headache", targetType: "herb", targetName: "Ginger (Zingiber officinale)", mechanism: "Traditional anti-inflammatory and nausea-support pathway", evidenceLevel: "observational", confidenceScore: 0.5, pubmedIds: [],
    ethiopianContext: "Zingibil is used in Ethiopian food and beverage traditions.", safetyNotes: ["A headache with emergency warning signs requires urgent care, not self-treatment."],
  },
  {
    id: "stress-coffee-community", sourceType: "practice", sourceName: "Stress and social isolation", targetType: "cultural", targetName: "Ethiopian coffee ceremony", mechanism: "Structured social connection, attention, and reflective ritual", evidenceLevel: "traditional", confidenceScore: 0.4, pubmedIds: [],
    ethiopianContext: "Buna ceremony can provide a culturally familiar setting for community support.", safetyNotes: ["Reflective cultural practice does not replace mental-wellbeing or emergency care."],
  },
];

const aliases: Record<string, string[]> = {
  metformin: ["metformin", "diabetes", "glucose"], aspirin: ["aspirin", "platelet", "inflammation"], statins: ["statin", "cholesterol", "lipid"],
  iron: ["iron", "anemia", "fatigue", "teff", "injera"], b12: ["b12", "cobalamin", "fasting", "metformin"], headache: ["headache", "migraine", "head pain"],
  stress: ["stress", "loneliness", "community", "coffee", "buna"],
};

function normalize(value: string) { return value.trim().toLowerCase(); }
function calculateConfidence(level: EvidenceLevel, ethiopianContext?: string) { return Math.min(evidenceWeights[level] + (ethiopianContext ? 0.05 : 0), 1); }
function matchesQuery(item: MechanismMatch, query: string, queryType: DiscoveryResult["queryType"]) {
  const text = `${item.sourceName} ${item.targetName} ${item.mechanism} ${item.ethiopianContext || ""}`.toLowerCase();
  const typeMatch = queryType === "all" || (queryType === "medication" && item.sourceType === "drug") || (queryType === "symptom" && item.sourceType === "practice") || (queryType === "condition" && text.includes(query));
  return typeMatch && (text.includes(query) || Object.values(aliases).some((terms) => terms.includes(query) && terms.some((term) => text.includes(term))));
}

export function searchMechanisms(query: string, queryType: DiscoveryResult["queryType"] = "all", limit = 20): DiscoveryResult {
  const normalized = normalize(query);
  const results = matches.filter((item) => matchesQuery(item, normalized, queryType)).map((item) => ({ ...item, confidenceScore: calculateConfidence(item.evidenceLevel, item.ethiopianContext) })).sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, limit);
  return { query, queryType, matches: results, disclaimer: "Mechanism matches describe pharmacological or cultural parallels. They are not safety assessments, diagnoses, or treatment recommendations." };
}

export function compareMechanisms(item1: string, item2: string) {
  const first = normalize(item1); const second = normalize(item2);
  const related = matches.filter((item) => `${item.sourceName} ${item.targetName}`.toLowerCase().includes(first) || `${item.sourceName} ${item.targetName}`.toLowerCase().includes(second));
  const shared = related.filter((item) => `${item.sourceName} ${item.targetName}`.toLowerCase().includes(first) && `${item.sourceName} ${item.targetName}`.toLowerCase().includes(second));
  const mechanisms = related.map((item) => item.mechanism);
  return { item1, item2, sharedMechanisms: shared.map((item) => item.mechanism), mechanisms, matches: related, disclaimer: "A shared mechanism does not imply compatible combination, equal scientific effect, or a recommendation to use either item." };
}

export function getMechanismCatalog() { return matches.map((item) => ({ ...item, confidenceScore: calculateConfidence(item.evidenceLevel, item.ethiopianContext) })); }
