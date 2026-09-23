import type { HexacoreName } from "@/lib/cultural/hexacoreArcana";

export type NameOptimizationInput = {
  currentName: string;
  motherName?: string;
  birthDate?: string;
  birthLocation?: string;
  dominantCore?: HexacoreName;
};

export type NameOptimizationResult = {
  recommendation: "keep" | "consider_alternative";
  currentName: string;
  suggestedName?: string;
  meaning: string;
  justification: string[];
  confidence: "reflective";
  consentNotice: string;
};

const SUGGESTIONS = [
  { name: "Selam", meaning: "Peace, wholeness, and safety", core: "Peace" },
  { name: "Dawit", meaning: "Beloved; a name associated with song and leadership", core: "Power" },
  { name: "Liya", meaning: "Devotion and presence", core: "Humanity" },
  { name: "Abebe", meaning: "Blossoming and flourishing", core: "Creation" },
  { name: "Amanuel", meaning: "God is with us", core: "Spirit" },
  { name: "Tigist", meaning: "Patience and endurance", core: "Order" },
] as const;

function stableIndex(input: NameOptimizationInput): number {
  const source = `${input.currentName}|${input.motherName || ""}|${input.birthDate || ""}|${input.birthLocation || ""}`;
  return [...source].reduce((sum, character) => sum + character.charCodeAt(0), 0) % SUGGESTIONS.length;
}

/**
 * Offers an opt-in cultural naming reflection. It deliberately does not force
 * a name change or claim a 90% predictive probability: identity decisions
 * should remain with the person, not an algorithm.
 */
export function optimizeName(input: NameOptimizationInput): NameOptimizationResult {
  const currentName = input.currentName.trim();
  const suggestion = SUGGESTIONS[stableIndex(input)];
  const aligned = input.dominantCore === suggestion.core || currentName.toLowerCase() === suggestion.name.toLowerCase();

  return {
    recommendation: aligned ? "keep" : "consider_alternative",
    currentName,
    suggestedName: aligned ? undefined : suggestion.name,
    meaning: aligned ? `${currentName} is retained as the primary name.` : suggestion.meaning,
    justification: [
      `The reflection considers the birth location ${input.birthLocation || "provided location"} as a place-memory symbol.`,
      `The mother-name reference is treated as family context, not as a deterministic identity score.`,
      `The ${input.dominantCore || "selected"} core is used as a journaling lens rather than a prediction.`,
      aligned ? "The current name can remain and does not require alteration." : `If desired, ${suggestion.name} may be explored as an additional cultural name.`,
    ],
    confidence: "reflective",
    consentNotice: "Names are personal and cultural choices. No name change is required, and suggestions should be accepted only with the user's explicit consent.",
  };
}
