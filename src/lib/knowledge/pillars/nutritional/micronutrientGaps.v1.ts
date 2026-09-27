import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";

export interface MicronutrientGapsOutput {
  vulnerableNutrients: string[];
  localFoodRemedies: Array<{
    nutrient: string;
    localSource: string;
    amharic: string;
    mechanism: string;
  }>;
  recommendations: string[];
}

const provenance: SourceRef[] = [
  {
    id: "ETH-NUTR-GAPS-01",
    title: "National Micronutrient Survey Report",
    type: "dataset",
    citation: "Ethiopian Public Health Institute (EPHI) & UNICEF Ethiopia National Micronutrient Survey.",
    year: 2016,
  },
  {
    id: "ETH-NUTR-ZINC-02",
    title: "Zinc Deficiency and Phytate:Zinc Molar Ratios in Cereal-Based Diets of Ethiopia",
    type: "paper",
    citation: "Gibson, R. S. et al. (2010). A review of phytate, zinc, and iron in complementary foods in developing countries. Food and Nutrition Bulletin.",
    year: 2010,
  },
];

export const micronutrientGapsPillar: Pillar<unknown, MicronutrientGapsOutput> = {
  id: "nutritional.micronutrientGaps",
  version: "1.0.0",
  domain: "nutritional",
  audience: "both",
  requires: ["location.agroEcological"],
  async query(_input: unknown, ctx: LocationContext): Promise<PillarResult<MicronutrientGapsOutput>> {
    const isHighland = ctx.agroEcological === "highland";
    const isLowland = ctx.agroEcological === "lowland" || ctx.agroEcological === "desert";

    const vulnerable = [
      "Zinc: Heavy phytate content in unfermented grains chelates zinc, reducing bioavailable absorption",
      "Vitamin A: Seasonal green/orange vegetable scarcity in dry months precipitates subclinical deficiency",
      "Iodine: Highland leached soils have depleted iodine levels, predisposing to thyroid enlargement (goiter)",
    ];

    if (isLowland) {
      vulnerable.push("Folate: Reduced green leafy vegetable access in arid zones");
    }

    const remedies = [
      {
        nutrient: "Bioavailable Zinc & Iron",
        localSource: "Sprouted and Fermented Teff & Fenugreek (Abish)",
        amharic: "የበቀለ አብሽ እና የተቦካ ጤፍ",
        mechanism: "Germination and fermentation activate phytase, reducing phytate-to-mineral ratio below critical 15:1 threshold",
      },
      {
        nutrient: "Pro-Vitamin A Carotenoids",
        localSource: "Ethiopian Pumpkin (Duba), Orange-fleshed Sweet Potato, and Gomen",
        amharic: "ዱባ እና ስኳር ድንች",
        mechanism: "Beta-carotene converted to retinol; absorption increased when cooked with a dash of healthy fat (niter kibbeh or oil)",
      },
      {
        nutrient: "Iodine & Trace Minerals",
        localSource: "Iodized Salt (Afdera salt lakes source) & Highland flaxseed (Telba)",
        amharic: "አዮዲዝድ ጨው እና ተልባ",
        mechanism: "Essential for thyroid hormone T3/T4 synthesis and metabolic rate regulation",
      },
    ];

    const recommendations = [
      "Incorporate freshly brewed flaxseed drink (የተልባ ውኃ) to provide omega-3 alpha-linolenic acid for cellular recovery",
      "Ensure all family table salt is iodized and stored in a closed dark container to prevent iodine sublimation",
      "Pair legume dishes with ascorbic acid (lemon or fresh chili/awaze) to double non-heme iron uptake",
    ];

    return {
      pillarId: "nutritional.micronutrientGaps",
      version: "1.0.0",
      domain: "nutritional",
      audience: "both",
      confidence: "high",
      data: {
        vulnerableNutrients: vulnerable,
        localFoodRemedies: remedies,
        recommendations,
      },
      provenance,
    };
  },
  provenance,
};
