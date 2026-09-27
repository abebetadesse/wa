import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";

export interface FoodSystemsOutput {
  staples: string[];
  traditionalPreparations: Array<{
    food: string;
    amharic: string;
    nutritionalRole: string;
    bioavailabilityEnhancement: string;
  }>;
  dietaryStrengths: string[];
}

const provenance: SourceRef[] = [
  {
    id: "ETH-NUTR-FOODSYS-01",
    title: "Ethiopian Food Composition Table & Traditional Dietary Patterns",
    type: "dataset",
    citation: "Ethiopian Public Health Institute (EPHI), National Food Composition Tables, Addis Ababa.",
    year: 2020,
  },
  {
    id: "ETH-NUTR-FERMENT-02",
    title: "Fermentation Technology of Teff Injera, Kocho, and Ergo: Micronutrient Bioavailability and Gut Microbiome",
    type: "paper",
    citation: "Bayre, M. et al. (2014). Nutritional value of fermented teff and enset products. Journal of Cereal Science.",
    year: 2014,
  },
];

export const foodSystemsPillar: Pillar<unknown, FoodSystemsOutput> = {
  id: "nutritional.foodSystems",
  version: "1.0.0",
  domain: "nutritional",
  audience: "both",
  requires: ["location.foodAvailability"],
  async query(_input: unknown, ctx: LocationContext): Promise<PillarResult<FoodSystemsOutput>> {
    const isEnsetRegion = ctx.foodAvailability?.staples.some((s) => s.toLowerCase().includes("enset"));
    const isPastoral = ctx.agroEcological === "desert" || ctx.agroEcological === "lowland";

    const preparations = [
      {
        food: "Fermented Teff Injera",
        amharic: "የጤፍ እንጀራ",
        nutritionalRole: "Slow-release carbohydrate base rich in iron, zinc, prebiotics, and essential amino acids",
        bioavailabilityEnhancement: "72-hour natural sourdough fermentation activates endogenous phytase, liberating bound zinc and iron",
      },
      {
        food: "Shiro Wot (Roasted Faba & Chickpea Stew)",
        amharic: "ሽሮ ወጥ",
        nutritionalRole: "Primary plant protein source supplying lysine that complements cereal grains",
        bioavailabilityEnhancement: "Spicing with Mekelesha (ginger, garlic, cardamom) supports digestive enzyme secretion",
      },
      {
        food: "Ethiopian Collard Greens (Gomen)",
        amharic: "የሀበሻ ጎመን",
        nutritionalRole: "Source of folate, lutein, calcium, and dietary dietary fiber",
        bioavailabilityEnhancement: "Sauteing with small amounts of niter kibbeh or seed oil facilitates fat-soluble vitamin absorption",
      },
    ];

    if (isEnsetRegion) {
      preparations.push({
        food: "Enset Kocho & Bulla",
        amharic: "ቆጮ እና ቡላ",
        nutritionalRole: "High-density carbohydrate energy, highly soothing to gastrointestinal tract (low FODMAP)",
        bioavailabilityEnhancement: "Underground pit fermentation (3-6 months) hydrolyzes complex fibers into easily digestible resistant starch",
      });
    }

    if (isPastoral) {
      preparations.push({
        food: "Fresh & Fermented Camel Milk (Suusac)",
        amharic: "የግመል ወተት",
        nutritionalRole: "Triple the Vitamin C content of bovine milk, rich in antimicrobial lactoferrin and low in allergenic beta-lactoglobulin",
        bioavailabilityEnhancement: "Natural spontaneous fermentation preserves probiotic lactic acid bacteria in arid climates",
      });
    }

    const staples = ctx.foodAvailability?.staples || ["Teff", "Wheat", "Faba Bean", "Gomen"];

    return {
      pillarId: "nutritional.foodSystems",
      version: "1.0.0",
      domain: "nutritional",
      audience: "both",
      confidence: "high",
      data: {
        staples,
        traditionalPreparations: preparations,
        dietaryStrengths: [
          "High dietary fiber and prebiotic fermentation through daily injera consumption",
          "Naturally whole-grain and gluten-free cereal backbone (pure teff)",
          "Regular legume integration providing plant protein diversity",
        ],
      },
      provenance,
    };
  },
  provenance,
};
