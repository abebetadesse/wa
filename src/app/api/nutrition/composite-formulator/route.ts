import { NextResponse } from "next/server";
import {
  ETHIOPIAN_COMPOSITE_DIETS,
  PURPOSE_CONFIGS,
  ENZYME_REACTION_CONFIGS,
  formulateCompositeDiet,
  type UserPurpose,
  type EconomicTier,
  type EnzymeReactionType,
} from "@/lib/nutrition/compositeDietFormulator";

export async function GET() {
  try {
    const dietsSummary = ETHIOPIAN_COMPOSITE_DIETS.map((d) => ({
      id: d.id,
      nameEn: d.nameEn,
      nameAmharic: d.nameAmharic,
      category: d.category,
      tagline: d.tagline,
      description: d.description,
      baseServingGrams: d.baseServingGrams,
      isFasting: d.isFasting,
      ingredientCount: d.ingredients.length,
      estimatedCaloriesPerServing: d.nutrients.proximate.energyKcal,
      costRangeETB: d.costEstimatesPerServingETB,
    }));

    const purposeOptions = Object.values(PURPOSE_CONFIGS).map((p) => ({
      id: p.id,
      titleEn: p.titleEn,
      titleAmharic: p.titleAmharic,
      description: p.description,
      calorieTargetMultiplier: p.calorieTargetMultiplier,
      proteinMultiplier: p.proteinMultiplier,
      servingsPerDay: p.servingsPerDay,
    }));

    const enzymeReactionOptions = Object.values(ENZYME_REACTION_CONFIGS).map((e) => ({
      id: e.id,
      titleEn: e.titleEn,
      titleAmharic: e.titleAmharic,
      mechanism: e.mechanism,
      ironMultiplier: e.ironMultiplier,
      zincMultiplier: e.zincMultiplier,
      phytateReductionPct: e.phytateReductionPct,
    }));

    const economicTierOptions = [
      {
        id: "economy" as const,
        labelEn: "Economy / Budget Staples",
        labelAmharic: "ተመጣጣኝ / ቆጣቢ ደረጃ",
        description: "Focuses on brown teff, field peas, chickpeas (shiro), collard greens, and vegetable oil.",
      },
      {
        id: "standard" as const,
        labelEn: "Standard / Balanced Household",
        labelAmharic: "መካከለኛ የተመጣጠነ ደረጃ",
        description: "Balanced mix of white/mixed teff, split lentils, eggs, sunflower oil, and market vegetables.",
      },
      {
        id: "premium" as const,
        labelEn: "Premium Tier / Whole Organics",
        labelAmharic: "ከፍተኛ ጥራት / የተሟላ ደረጃ",
        description: "Magna white teff, organic pasture clarified butter (niter kibbeh), poultry/lean beef, ayib, and pure honey.",
      },
    ];

    return NextResponse.json({
      diets: dietsSummary,
      purposes: purposeOptions,
      economicTiers: economicTierOptions,
      enzymeReactions: enzymeReactionOptions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch composite diet catalog", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dietId, purpose, economicTier, enzymeReactionType } = body;

    const selectedDietId = typeof dietId === "string" ? dietId : "yetsom-beyayinetu";
    const selectedPurpose = (purpose in PURPOSE_CONFIGS ? purpose : "weight_loss") as UserPurpose;
    const selectedEconomicTier = (["economy", "standard", "premium"].includes(economicTier)
      ? economicTier
      : "standard") as EconomicTier;
    const selectedEnzyme = (enzymeReactionType in ENZYME_REACTION_CONFIGS
      ? enzymeReactionType
      : "ersho_phytase_96h") as EnzymeReactionType;

    const result = formulateCompositeDiet(
      selectedDietId,
      selectedPurpose,
      selectedEconomicTier,
      selectedEnzyme
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to formulate composite diet recipe", details: String(error) },
      { status: 400 }
    );
  }
}
