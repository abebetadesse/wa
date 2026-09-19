import { NextResponse } from "next/server";
import { MEDICINAL_PLANTS, MEDICINAL_USES, REMEDY_RECIPES, PHYTOCHEMICALS, PLANT_COMPOUNDS, COMPOUND_ACTIVITIES, REMEDY_PROCESSING_EFFECTS, MEDICINAL_FOODS, MANUSCRIPT_REMEDIES, BOTANICAL_COMPOSITION_PROFILES, ACTIVE_CONSTITUENT_REFERENCES } from "@/lib/cultural/traditionalMedicine";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const condition = url.searchParams.get("condition")?.toLowerCase();
  const locationId = url.searchParams.get("locationId");
  const plantUid = url.searchParams.get("plantUid");
  const uses = MEDICINAL_USES.filter((use) =>
    (!condition || use.diseaseOrCondition.toLowerCase().includes(condition)) &&
    (!locationId || use.locationUid === locationId) &&
    (!plantUid || use.plantUid === plantUid),
  );
  const plantIds = new Set(uses.map((use) => use.plantUid));
  const plants = MEDICINAL_PLANTS.filter((plant) => !plantUid && !condition && !locationId ? true : plantIds.has(plant.plantUid) || plant.plantUid === plantUid);
  const recipes = REMEDY_RECIPES.filter((recipe) => plants.some((plant) => plant.plantUid === recipe.plantUid));
  const compounds = PLANT_COMPOUNDS.filter((compound) => plants.some((plant) => plant.plantUid === compound.plantUid));
  const compositions = BOTANICAL_COMPOSITION_PROFILES.filter((profile) => plants.some((plant) => plant.plantUid === profile.plantUid));
  const activeConstituents = ACTIVE_CONSTITUENT_REFERENCES.filter((record) => plants.some((plant) => plant.plantUid === record.plantUid));
  return NextResponse.json({
    success: true,
    plants,
    uses,
    recipes,
    compounds,
    compositions,
    activeConstituents,
    phytochemicals: PHYTOCHEMICALS,
    compoundActivities: COMPOUND_ACTIVITIES.filter((activity) => compounds.some((compound) => compound.compoundUid === activity.compoundUid)),
    processingEffects: REMEDY_PROCESSING_EFFECTS.filter((effect) => recipes.some((recipe) => recipe.recipeUid === effect.recipeUid)),
    medicinalFoods: MEDICINAL_FOODS.filter((food) => !plantUid || food.plantUid === plantUid),
    manuscriptRemedies: MANUSCRIPT_REMEDIES,
    disclaimer: "Traditional-use and manuscript records are cultural references, not clinical evidence or prescriptions. Composition values are sample- and method-dependent; not_reported means the supplied references did not provide a measured value. Pregnancy, childhood, emergencies, medication use, toxicity, and chronic disease require qualified clinical review.",
  });
}
