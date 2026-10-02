import { NextResponse } from "next/server";
import {
  FORMULATOR_INGREDIENTS,
  FORMULATOR_HEALTH_ISSUES,
  formulateDynamicPlatter,
  generateRandomDietCode,
  type DynamicFormulatorInput,
  type PlatterType,
} from "@/lib/nutrition/dynamicFormulatorEngine";
import type { EconomicTier, EnzymeReactionType } from "@/lib/nutrition/compositeDietFormulator";

export async function GET() {
  try {
    const ingredients = FORMULATOR_INGREDIENTS.map((ing) => ({
      id: ing.id,
      nameEn: ing.nameEn,
      nameAmharic: ing.nameAmharic,
      origin: ing.origin,
      category: ing.category,
      description: ing.description,
      culinaryRole: ing.culinaryRole,
      keyBenefits: ing.keyBenefits,
      defaultPortionGrams: ing.defaultPortionGrams,
      costPer100gETB: ing.costPer100gETB,
      per100g: {
        energyKcal: ing.per100g.energyKcal,
        protein_g: ing.per100g.protein_g,
        fat_g: ing.per100g.fat_g,
        carb_g: ing.per100g.carb_g,
        fiber_g: ing.per100g.fiber_g,
        iron_mg: ing.per100g.iron_mg,
        calcium_mg: ing.per100g.calcium_mg,
        limitingAmino: ing.per100g.limitingAmino,
        pdcaasScorePct: ing.per100g.pdcaasScorePct,
      },
    }));

    const healthIssues = FORMULATOR_HEALTH_ISSUES.map((issue) => ({
      id: issue.id,
      titleEn: issue.titleEn,
      titleAmharic: issue.titleAmharic,
      category: issue.category,
      description: issue.description,
      clinicalRationale: issue.clinicalRationale,
      culturalWisdom: issue.culturalWisdom,
      recommendedTargets: issue.recommendedTargets,
      recommendedIngredientIds: issue.recommendedIngredientIds,
      preferredEnzymeReaction: issue.preferredEnzymeReaction,
    }));

    const sampleRandom = generateRandomDietCode("type2_diabetes_glycemic", "multi_dish_platter");

    return NextResponse.json({
      ingredients,
      healthIssues,
      sampleRandom,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load dynamic formulator parameters", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const input: DynamicFormulatorInput = {
      dietCode: typeof body.dietCode === "string" && body.dietCode.trim() ? body.dietCode.trim() : undefined,
      customDietName: typeof body.customDietName === "string" && body.customDietName.trim() ? body.customDietName.trim() : undefined,
      platterType: ([
        "multi_dish_platter",
        "stew_flatbread",
        "ancient_grain_bowl",
        "functional_tonic",
        "firfir_shredded_skillet",
        "chilled_deli_platter",
        "sizzling_tibs_skillet",
        "artisan_flatbread_pocket",
      ].includes(body.platterType)
        ? body.platterType
        : "multi_dish_platter") as PlatterType,
      healthIssueId: typeof body.healthIssueId === "string" ? body.healthIssueId : "type2_diabetes_glycemic",
      economicTier: (["economy", "standard", "premium"].includes(body.economicTier)
        ? body.economicTier
        : "standard") as EconomicTier,
      enzymeReaction: (["ersho_phytase_96h", "sprouting_germination", "thermal_trypsin_inactivation", "ascorbic_acid_reduction", "standard_preparation"].includes(body.enzymeReaction)
        ? body.enzymeReaction
        : "ersho_phytase_96h") as EnzymeReactionType,
      servingsPerDay: typeof body.servingsPerDay === "number" && body.servingsPerDay > 0 ? body.servingsPerDay : 3,
      targetCaloriesPerServing: typeof body.targetCaloriesPerServing === "number" && body.targetCaloriesPerServing > 0
        ? body.targetCaloriesPerServing
        : 500,
      proteinPercent: typeof body.proteinPercent === "number" && body.proteinPercent > 0 ? body.proteinPercent : 25,
      fatPercent: typeof body.fatPercent === "number" && body.fatPercent > 0 ? body.fatPercent : 25,
      carbPercent: typeof body.carbPercent === "number" && body.carbPercent > 0 ? body.carbPercent : 50,
      minFiber_g: typeof body.minFiber_g === "number" && body.minFiber_g >= 0 ? body.minFiber_g : 12,
      targetMoisturePercent: typeof body.targetMoisturePercent === "number" ? body.targetMoisturePercent : undefined,
      targetAsh_g: typeof body.targetAsh_g === "number" ? body.targetAsh_g : undefined,
      targetLeucine_mg: typeof body.targetLeucine_mg === "number" ? body.targetLeucine_mg : undefined,
      targetLysine_mg: typeof body.targetLysine_mg === "number" ? body.targetLysine_mg : undefined,
      targetTotalEAA_mg: typeof body.targetTotalEAA_mg === "number" ? body.targetTotalEAA_mg : undefined,
      targetIron_mg: typeof body.targetIron_mg === "number" ? body.targetIron_mg : undefined,
      targetCalcium_mg: typeof body.targetCalcium_mg === "number" ? body.targetCalcium_mg : undefined,
      targetZinc_mg: typeof body.targetZinc_mg === "number" ? body.targetZinc_mg : undefined,
      targetVitaminC_mg: typeof body.targetVitaminC_mg === "number" ? body.targetVitaminC_mg : undefined,
      targetFolate_mcg: typeof body.targetFolate_mcg === "number" ? body.targetFolate_mcg : undefined,
      targetVitaminB12_mcg: typeof body.targetVitaminB12_mcg === "number" ? body.targetVitaminB12_mcg : undefined,
      selectedIngredientIds: Array.isArray(body.selectedIngredientIds) ? body.selectedIngredientIds : [],
    };

    const result = formulateDynamicPlatter(input);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to synthesize dynamic composite diet formulation", details: String(error) },
      { status: 500 }
    );
  }
}
