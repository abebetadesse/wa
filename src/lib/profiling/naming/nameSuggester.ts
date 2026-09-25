import { HumoralElement, NameSuggestionResult } from "../types";
import { ETHIOPIAN_NAMES_DATABASE } from "./nameDatabase";
import { CHRISTIAN_NAME_CATALOG } from "@/lib/christian/christianNameCatalog";

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

type NameSource = "Ethiopian" | "Biblical" | "Biblical place" | "Global";

interface CuratedNameCandidate {
  name: string;
  meaning: string;
  gender: "female" | "male" | "unisex";
  language: string;
  sourceTradition: NameSource;
  destinyNumber: number;
  element: HumoralElement;
  geezFidel?: string;
}

// Curated from the supplied biblical-name references and common Ethiopian forms.
// Definitions are presented as cultural/name meanings, not predictions or wellbeing claims.
const CURATED_NAME_CANDIDATES: CuratedNameCandidate[] = [
  { name: "Abraham", meaning: "Father of many nations", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 3, element: "afere" },
  { name: "Sarah", meaning: "Princess; noblewoman", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 8, element: "may" },
  { name: "Isaac", meaning: "He laughs; joy", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 6, element: "nifas" },
  { name: "Jacob", meaning: "Heel-holder; one who perseveres", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 5, element: "esat" },
  { name: "Joseph", meaning: "He will add; increase", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 2, element: "afere" },
  { name: "Moses", meaning: "Drawn out; deliverer", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 7, element: "esat" },
  { name: "David", meaning: "Beloved", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 4, element: "nifas", geezFidel: "ዳዊት" },
  { name: "Esther", meaning: "Star; hidden or protected", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 3, element: "may" },
  { name: "Samuel", meaning: "Heard by God", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 5, element: "nifas" },
  { name: "Elijah", meaning: "My God is Yahweh", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 1, element: "esat" },
  { name: "Isaiah", meaning: "Salvation of the Lord", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 8, element: "may" },
  { name: "Ruth", meaning: "Compassionate friend", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 3, element: "may" },
  { name: "Hannah", meaning: "Grace and favor", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 2, element: "may" },
  { name: "Abigail", meaning: "Father's joy", gender: "female", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 7, element: "nifas" },
  { name: "John", meaning: "Yahweh is gracious", gender: "male", language: "Hebrew", sourceTradition: "Biblical", destinyNumber: 2, element: "may" },
  { name: "Peter", meaning: "Rock; steadfast foundation", gender: "male", language: "Greek", sourceTradition: "Biblical", destinyNumber: 7, element: "afere" },
  { name: "Eden", meaning: "Delight; paradise", gender: "unisex", language: "Hebrew", sourceTradition: "Biblical place", destinyNumber: 5, element: "may" },
  { name: "Shiloh", meaning: "Tranquility; place of rest", gender: "unisex", language: "Hebrew", sourceTradition: "Biblical place", destinyNumber: 6, element: "may" },
  { name: "Zion", meaning: "Highest point; sanctuary", gender: "unisex", language: "Hebrew", sourceTradition: "Biblical place", destinyNumber: 8, element: "esat" },
  { name: "Jordan", meaning: "Flowing down", gender: "unisex", language: "Hebrew", sourceTradition: "Biblical place", destinyNumber: 2, element: "nifas" },
  { name: "Salem", meaning: "Peace; wholeness", gender: "unisex", language: "Hebrew", sourceTradition: "Biblical place", destinyNumber: 1, element: "may" },
  { name: "Talitha", meaning: "Young girl", gender: "female", language: "Aramaic", sourceTradition: "Biblical", destinyNumber: 7, element: "nifas" },
  { name: "Dawit", meaning: "Beloved; victorious shepherd and musician king", gender: "male", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 3, element: "nifas", geezFidel: "ዳዊት" },
  { name: "Selam", meaning: "Peace, wholeness, and safety", gender: "female", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 6, element: "may", geezFidel: "ሰላም" },
  { name: "Tigist", meaning: "Patience and endurance", gender: "female", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 5, element: "may", geezFidel: "ትዕግሥት" },
  { name: "Abebe", meaning: "He has blossomed and flourished", gender: "male", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 1, element: "esat", geezFidel: "አበበ" },
  { name: "Liya", meaning: "I am with you; devoted", gender: "female", language: "Amharic", sourceTradition: "Ethiopian", destinyNumber: 3, element: "nifas", geezFidel: "ልያ" },
  { name: "Amanuel", meaning: "God is with us", gender: "male", language: "Ge'ez", sourceTradition: "Ethiopian", destinyNumber: 9, element: "nifas" },
];

function reduceNumber(value: number): number {
  let result = Math.abs(value);
  while (result > 9) result = String(result).split("").reduce((sum, digit) => sum + Number(digit), 0);
  return result || 9;
}

function destinyFromBirthDate(birthDate?: string): number | undefined {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return undefined;
  return reduceNumber(birthDate.replaceAll("-", "").split("").reduce((sum, digit) => sum + Number(digit), 0));
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

  return `For ${profileBase}, born ${date} near ${city}, ${name} aligns with ${elem.toUpperCase()} harmony and is recommended to pair with ${profileMap[elem]} Share this choice with your profile wellbeing context.`;
}

export function suggestAlternativeNames(criteria: SuggestionCriteria): NameSuggestionResult[] {
  const targetDestinyNumber = criteria.targetDestinyNumber ?? destinyFromBirthDate(criteria.birthDate);
  let pool = [...ETHIOPIAN_NAMES_DATABASE];

  if (criteria.gender && criteria.gender !== "unisex") {
    pool = pool.filter((item) => item.gender === criteria.gender || item.gender === "unisex");
  }

  if (criteria.languagePreference) {
    pool = pool.filter((item) => item.language === criteria.languagePreference);
  }

  const filteredPool = pool.length ? pool : [...ETHIOPIAN_NAMES_DATABASE];

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

  const results: Array<NameSuggestionResult & { score: number }> = [];
  const seen = new Set<string>();
  const maxSuggestions = 1000;

  // Seed the first pass from the canonical Ethiopian names database.
  for (const item of filteredPool) {
    const key = item.name.replace(/\s+/g, "_");
    const elem: HumoralElement = elementalAffinity[key] || (item.numerologicalValues.destiny % 2 === 0 ? "may" : "esat");

    const destinyMatch = targetDestinyNumber && item.numerologicalValues.destiny === targetDestinyNumber ? 30 : 0;
    const genderMatch = criteria.gender && (item.gender === criteria.gender || item.gender === "unisex") ? 15 : criteria.gender ? 0 : 8;
    const languageMatch = criteria.languagePreference && item.language === criteria.languagePreference ? 15 : criteria.languagePreference ? 0 : 8;
    const meaningAlignment = criteria.targetElement && elem === criteria.targetElement ? 25 : criteria.targetElement ? 5 : 15;
    const matchScore = destinyMatch + genderMatch + languageMatch + meaningAlignment;

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
      sourceTradition: "Ethiopian",
      score: matchScore,
      scoreBreakdown: { destinyMatch, genderMatch, languageMatch, meaningAlignment },
      primaryElement: elem,
      destinyNumber: item.numerologicalValues.destiny,
      alignmentReason: `Harmonizes with ${elem.toUpperCase()} humoral balancing, fostering a Destiny ${item.numerologicalValues.destiny} vibration of '${item.wellbeingIdentityCorrelation.balancingVirtue}'.`,
      wellbeingHarmonizationBenefit: benefit,
      recommendation: buildProfileRecommendation(criteria, elem, generatedName),
    });

    if (results.length >= maxSuggestions) {
      return results;
    }

    for (const candidate of CURATED_NAME_CANDIDATES) {
      if (criteria.gender && candidate.gender !== criteria.gender && candidate.gender !== "unisex") continue;
      if (criteria.languagePreference && candidate.language !== criteria.languagePreference) continue;
      const destinyMatch = targetDestinyNumber && candidate.destinyNumber === targetDestinyNumber ? 30 : 0;
      const genderMatch = criteria.gender ? (candidate.gender === criteria.gender || candidate.gender === "unisex" ? 15 : 0) : 8;
      const languageMatch = criteria.languagePreference ? (candidate.language === criteria.languagePreference ? 15 : 0) : 8;
      const meaningAlignment = criteria.targetElement && candidate.element === criteria.targetElement ? 25 : criteria.targetElement ? 5 : 15;
      const score = destinyMatch + genderMatch + languageMatch + meaningAlignment;
      results.push({
        suggestedName: candidate.name,
        geezFidel: candidate.geezFidel || "",
        language: candidate.language,
        meaning: candidate.meaning,
        sourceTradition: candidate.sourceTradition,
        score,
        scoreBreakdown: { destinyMatch, genderMatch, languageMatch, meaningAlignment },
        primaryElement: candidate.element,
        destinyNumber: candidate.destinyNumber,
        alignmentReason: `Cultural meaning aligns with ${candidate.sourceTradition} naming tradition and the selected reflection criteria.`,
        wellbeingHarmonizationBenefit: "Reflective identity alignment only; this name does not predict wellbeing or personality.",
        recommendation: buildProfileRecommendation(criteria, candidate.element, candidate.name),
      });
    }
  }

  // Add the user-provided biblical catalog as transparent cultural suggestions.
  // The catalog has no gender metadata, so these records remain unisex.
  if (!criteria.languagePreference) {
    for (const record of CHRISTIAN_NAME_CATALOG) {
      if (results.length >= maxSuggestions) break;
      const key = record.name.toLowerCase().replace(/\s+/g, "-");
      if (seen.has(key)) continue;

      const characterTotal = [...record.name.toLowerCase()].reduce(
        (sum, character) => sum + character.charCodeAt(0),
        0,
      );
      const destinyNumber = reduceNumber(characterTotal);
      const element: HumoralElement = ["may", "afere", "esat", "nifas"][destinyNumber % 4] as HumoralElement;
      const destinyMatch = targetDestinyNumber === destinyNumber ? 30 : 0;
      const meaningAlignment = criteria.targetElement === element ? 25 : criteria.targetElement ? 5 : 15;

      seen.add(key);
      results.push({
        suggestedName: record.name,
        geezFidel: "",
        language: "Biblical",
        meaning: record.meaning,
        sourceTradition: "Biblical",
        score: destinyMatch + 8 + meaningAlignment,
        scoreBreakdown: { destinyMatch, genderMatch: 8, languageMatch: 8, meaningAlignment },
        primaryElement: element,
        destinyNumber,
        alignmentReason: "Meaning sourced from the user-provided biblical name reference and matched only to the selected reflection criteria.",
        wellbeingHarmonizationBenefit: "Reflective identity alignment only; this name does not predict wellbeing or personality.",
        recommendation: buildProfileRecommendation(criteria, element, record.name),
      });
    }
  }

  // Fallback deterministic synthesis to reach the requested 1000-name pool size without dropping the UI.
  for (const left of filteredPool) {
    for (const right of filteredPool) {
      if (results.length >= maxSuggestions) {
        return results;
      }

      const combined = `${left.name} ${right.name}`;
      const key = combined.toLowerCase().replace(/\s+/g, "-");
      if (seen.has(key)) {
        continue;
      }

      const elem = elementalAffinity[left.name.replace(/\s+/g, "_")] || elementalAffinity[right.name.replace(/\s+/g, "_")] || "may";
      const row: NameSuggestionResult & { score: number } = {
        suggestedName: combined,
        geezFidel: left.geezFidel || right.geezFidel || "",
        language: right.language,
        meaning: `${left.meaning} • ${right.meaning}`,
        sourceTradition: "Ethiopian",
        score: 10,
        scoreBreakdown: { destinyMatch: 0, genderMatch: 0, languageMatch: 0, meaningAlignment: 10 },
        primaryElement: elem,
        destinyNumber: (left.numerologicalValues.destiny + right.numerologicalValues.destiny) % 9 || 1,
        alignmentReason: `Combined lineage resonance for ${elem.toUpperCase()} balance and profile continuity.`,
        wellbeingHarmonizationBenefit: `Balances ${left.wellbeingIdentityCorrelation.balancingVirtue} with ${right.wellbeingIdentityCorrelation.balancingVirtue}.`,
        recommendation: buildProfileRecommendation(criteria, elem, combined),
      };

      seen.add(key);
      results.push(row);
    }
  }

  return results.sort((left, right) => right.score - left.score || left.suggestedName.localeCompare(right.suggestedName)).slice(0, maxSuggestions);
}
