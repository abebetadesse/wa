import { NextResponse } from "next/server";
import { reconstructRecipe, type IngredientNutrient, type Recipe, type RecipeIngredient } from "@/lib/nutrition/ingredientComposition";

interface ReconstructionRequest {
  recipe: Recipe;
  recipeIngredients: RecipeIngredient[];
  nutrients: IngredientNutrient[];
  measuredFinalComposition: Record<string, number>;
  intendedUse?: "human_food" | "animal_feed" | "research_only";
}

function isRequestBody(value: unknown): value is ReconstructionRequest {
  if (!value || typeof value !== "object") return false;
  const body = value as Partial<ReconstructionRequest>;
  return !!body.recipe && Array.isArray(body.recipeIngredients) && Array.isArray(body.nutrients) && !!body.measuredFinalComposition && typeof body.measuredFinalComposition === "object";
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  if (!isRequestBody(body)) {
    return NextResponse.json({ success: false, error: "recipe, recipeIngredients, nutrients, and measuredFinalComposition are required." }, { status: 400 });
  }
  const reconstruction = reconstructRecipe(body.recipe, body.recipeIngredients, body.nutrients, body.measuredFinalComposition, body.intendedUse);
  return NextResponse.json({
    success: true,
    reconstruction,
    safety: {
      feedipediaHumanUseBoundary: "Feedipedia records marked animal_feed must not be used as human clinical composition without validated human-food evidence.",
      basisAndProcessingRequired: true,
      noFabricatedValues: true,
    },
  });
}
