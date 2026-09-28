import { MotherLineageArchetype } from "./types";
import { extractGeezLetters } from "@/lib/cultural/spiritualDivinationEngine";

const MATRILINEAL_ARCHETYPES: MotherLineageArchetype[] = [
  {
    archetype: "The Hearth Guardian & Salt Weaver",
    archetypeAmharic: "እመቤት ወ ማዕድ ጠባቂት",
    lineageTheme: "Enduring communal hospitality, steadfast family anchoring, and protection of sacred domestic peace",
    culturalVirtue: "Preserving generational balance through communal sharing and quiet sanctuary",
    ancestralResiliencePattern: "Ability to absorb relational strain and weave unity across changing family seasons",
  },
  {
    archetype: "The Mountain Pillar of Quiet Strength",
    archetypeAmharic: "ጽኑ አምድ ወ መከታ",
    lineageTheme: "Highland perseverance, stoic moral clarity, and protective maternal shielding",
    culturalVirtue: "Dignified patience in adversity and intergenerational steadfastness",
    ancestralResiliencePattern: "Standing resilient in times of societal transition with unshakable ethical grounding",
  },
  {
    archetype: "The Living Spring & Renewal Weaver",
    archetypeAmharic: "ምንጭ ወ ሕዳሴ",
    lineageTheme: "Intuitive emotional nourishment, sacred spring restorative traditions, and gentle renewal",
    culturalVirtue: "Holistic empathy, herbal and nutritional attentiveness, and somatic healing",
    ancestralResiliencePattern: "Natural recovery from exhaustion through grounding with water, earth, and prayer",
  },
  {
    archetype: "The Dawn Keeper & Carrier of Blessing",
    archetypeAmharic: "አብሳሪት ወ በረከት",
    lineageTheme: "Spiritual discernment, dawn-light prayers, and intergenerational blessing (ምርቃት)",
    culturalVirtue: "Elevated spiritual sensitivity, devotion, and alignment with sacred cycles",
    ancestralResiliencePattern: "Inner serenity that transforms communal anxiety into confident purpose",
  },
  {
    archetype: "The Resilient Seed & Land Steward",
    archetypeAmharic: "ዘር ወ ተስፋ",
    lineageTheme: "Cushitic and highland agrarian stewardship, thrift, and fertile continuity",
    culturalVirtue: "Respect for ancestral land, natural rhythms, and mutual aid societies (Iddir / Equb)",
    ancestralResiliencePattern: "Resourcefulness and regenerative vitality even in challenging lean seasons",
  },
];

/**
 * Analyzes the matrilineal lineage archetype without disclosing or printing the
 * mother's sacred private name into user-facing narrative text.
 */
export function analyzeMotherNameLineage(
  motherName: string,
  birthLocation?: string
): MotherLineageArchetype {
  const clean = (motherName || "").trim();
  const locationClean = (birthLocation || "").toLowerCase();

  let weight = 0;
  const letters = extractGeezLetters(clean);
  if (letters.letters.length > 0) {
    weight = letters.subtotal;
  } else {
    for (let i = 0; i < clean.length; i++) {
      weight += clean.charCodeAt(i);
    }
  }

  // Factor location bias
  if (locationClean.includes("gondar") || locationClean.includes("lalibela") || locationClean.includes("mekelle")) {
    weight += 3;
  } else if (locationClean.includes("harar") || locationClean.includes("dire dawa") || locationClean.includes("afar")) {
    weight += 5;
  } else if (locationClean.includes("hawassa") || locationClean.includes("sidama") || locationClean.includes("jimma")) {
    weight += 7;
  }

  const index = Math.abs(weight) % MATRILINEAL_ARCHETYPES.length;
  return MATRILINEAL_ARCHETYPES[index];
}
