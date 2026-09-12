import { HumoralElement, NameSuggestionResult } from "../types";
import { ETHIOPIAN_NAMES_DATABASE } from "./nameDatabase";

export interface SuggestionCriteria {
  targetElement?: HumoralElement;
  targetDestinyNumber?: number;
  gender?: "female" | "male" | "unisex";
  languagePreference?: "Amharic" | "Ge'ez" | "Afaan Oromo" | "Tigrinya";
  fullName?: string;
  birthDate?: string;
  birthTime?: string;
  city?: string;
}

function buildProfileRecommendation(criteria: SuggestionCriteria, elem: HumoralElement, name: string): string {
  const profileBase = criteria.fullName || "this client";
  const date = criteria.birthDate || "your birth date";
  const city = criteria.city || "your Ethiopian location";

  const profileMap: Record<HumoralElement, string> = {
    may: "Use a cooling may-inspired rhythm with rest, hydration, and a moderating food strategy for gentle balance.",
    afere: "Use an earth-focused rhythm that strengthens grounded structure, repeated practice, and sustainable daily pacing.",
    esat: "Use an energizing fire discipline with focused activity, warm seasonal care, and gradual momentum.",
    nifas: "Use a breathable air rhythm with creative structure, verbal reflection, and balanced social rhythm.",
  };

  return `For ${profileBase}, born ${date} near ${city}, ${name} aligns with ${elem.toUpperCase()} harmony and is recommended to pair with ${profileMap[elem]} Share this choice with your profile health context.`;
}

export function suggestAlternativeNames(criteria: SuggestionCriteria): NameSuggestionResult[] {
  let pool = [...ETHIOPIAN_NAMES_DATABASE];

  if (criteria.gender && criteria.gender !== "unisex") {
    pool = pool.filter((item) => item.gender === criteria.gender || item.gender === "unisex");
  }

  if (criteria.languagePreference) {
    pool = pool.filter((item) => item.language === criteria.languagePreference);
  }

  // Map each name to its elemental archetype.
  const elementalAffinity: Record<string, HumoralElement> = {
    Abebe: "esat",
    Bona: "esat",
    Haile: "esat",
    Caala: "esat",
    Berhane: "esat",
    Bekele: "afere",
    Obsa: "afere",
    Taye: "afere",
    Semere: "afere",
    Gebre_Meskel: "afere",
    Chaltu: "nifas",
    Dawit: "nifas",
    Hawi: "nifas",
    Genet: "nifas",
    Tariku: "nifas",
    Tigist: "may",
    Mulugeta: "may",
    Selam: "may",
    Luwam: "may",
    Wolde_Mariam: "may",
    Almaz: "may",
    Tekle_Haymanot: "may",
  };

  const results: NameSuggestionResult[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 1000 && results.length < 1000; i += 1) {
    const item = pool[i % pool.length];
    const key = item.name.replace(/\s+/g, "_");
    const elem: HumoralElement = elementalAffinity[key] || (item.numerologicalValues.destiny % 2 === 0 ? "may" : "esat");

    let matchScore = 0;
    if (criteria.targetElement && elem === criteria.targetElement) matchScore += 3;
    if (criteria.targetDestinyNumber && item.numerologicalValues.destiny === criteria.targetDestinyNumber) matchScore += 4;
    if (!criteria.targetElement && !criteria.targetDestinyNumber) matchScore += 2;

    if (matchScore <= 0) {
      continue;
    }

    const generatedName = item.name;
    if (seen.has(generatedName)) {
      continue;
    }

    seen.add(generatedName);

    let benefit = "";
    if (elem === "may") {
      benefit = "Infuses cooling hydration, emotional peace, and mucosal soothing; ideal for calming excess metabolic heat or gastric burning.";
    } else if (elem === "afere") {
      benefit = "Provides structural grounding, skeletal bone stability, and circadian endurance; counteracts restless anxiety and scattered focus.";
    } else if (elem === "esat") {
      benefit = "Ignites metabolic fire, cardiovascular vitality, and decisive leadership; overcomes sluggish lethargy and low stamina.";
    } else {
      benefit = "Stimulates cognitive lightness, vocal eloquence, and respiratory freedom; overcomes heavy stagnation and emotional withholding.";
    }

    results.push({
      suggestedName: generatedName,
      geezFidel: item.geezFidel || "",
      language: item.language,
      meaning: item.meaning,
      primaryElement: elem,
      destinyNumber: item.numerologicalValues.destiny,
      alignmentReason: `Harmonizes with ${elem.toUpperCase()} humoral balancing, fostering a Destiny ${item.numerologicalValues.destiny} vibration of '${item.healthIdentityCorrelation.balancingVirtue}'.`,
      healthHarmonizationBenefit: benefit,
      recommendation: buildProfileRecommendation(criteria, elem, generatedName),
    });
  }

  return results;
}
