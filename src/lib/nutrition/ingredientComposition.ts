export type CompositionBasis = "as_fed" | "dry_matter";
export type ProcessingState = "raw" | "milled" | "fermented" | "roasted" | "boiled" | "cooked";
export type NutrientClass = "proximate" | "mineral" | "vitamin" | "amino_acid" | "fatty_acid" | "phenolic" | "antinutrient" | "other";

export interface Ingredient {
  ingredientUid: string;
  nameEn: string;
  nameAmharic?: string;
  nameLocal?: string;
  scientificName?: string;
  foodOnCode?: string;
  faostatCode?: string;
  feedipediaNode?: string;
  efctCode?: string;
  partUsed?: string;
  defaultBasis: CompositionBasis;
  defaultProcessing: ProcessingState;
  moistureDefaultPct?: number;
  ediblePortionPct?: number;
  notes?: string;
}

export interface IngredientNutrient {
  ingredientUid: string;
  nutrientCode: string;
  nutrientClass: NutrientClass;
  value: number;
  unit: string;
  basis: CompositionBasis;
  processingState: ProcessingState;
  cultivarOrLandrace?: string;
  originLocation?: string;
  valueLower?: number;
  valueUpper?: number;
  sampleCount?: number;
  analyticalMethod?: string;
  sourceUid: string;
  citationUid?: string;
  confidence: "high" | "medium" | "low" | "unknown";
  intendedUse: "human_food" | "animal_feed" | "research_only";
}

export interface Recipe {
  recipeUid: string;
  locationUid: string;
  nameEn: string;
  nameLocal?: string;
  yieldG?: number;
  servingG?: number;
  notes?: string;
}

export interface RecipeIngredient {
  recipeUid: string;
  ingredientUid: string;
  fractionDocumented?: number;
  fractionEstimated?: number;
  fractionLower?: number;
  fractionUpper?: number;
  fixed?: boolean;
  processingState: ProcessingState;
  basis: CompositionBasis;
}

export interface RecipeEstimate {
  recipeUid: string;
  ingredientUid: string;
  betaMean: number;
  betaSd: number;
  betaCiLower: number;
  betaCiUpper: number;
  nDraws: number;
  solver: "projected_gradient_nnls";
  engineVersion: string;
  estimatedAt: string;
}

export interface RecipeReconstruction {
  recipeUid: string;
  nutrientCodes: string[];
  ingredientUids: string[];
  fractions: Record<string, number>;
  predictedComposition: Record<string, number>;
  residuals: Record<string, number>;
  coveragePct: number;
  warnings: string[];
  solver: "projected_gradient_nnls";
  engineVersion: string;
  intendedUse: "human_food" | "animal_feed" | "research_only";
}

export const NUTRIENT_VOCABULARY: Array<{ code: string; name: string; unit: string; nutrientClass: NutrientClass }> = [
  { code: "WATER", name: "Moisture", unit: "g/100g", nutrientClass: "proximate" },
  { code: "PROCNT", name: "Crude protein", unit: "g/100g", nutrientClass: "proximate" },
  { code: "FAT", name: "Crude fat", unit: "g/100g", nutrientClass: "proximate" },
  { code: "CHOAVLDF", name: "Available carbohydrate", unit: "g/100g", nutrientClass: "proximate" },
  { code: "FIBTG", name: "Total dietary fibre", unit: "g/100g", nutrientClass: "proximate" },
  { code: "ASH", name: "Ash", unit: "g/100g", nutrientClass: "proximate" },
  { code: "ENERC", name: "Energy", unit: "kcal/100g", nutrientClass: "proximate" },
  { code: "CA", name: "Calcium", unit: "mg/100g", nutrientClass: "mineral" },
  { code: "FE", name: "Iron", unit: "mg/100g", nutrientClass: "mineral" },
  { code: "NA", name: "Sodium", unit: "mg/100g", nutrientClass: "mineral" },
  { code: "K", name: "Potassium", unit: "mg/100g", nutrientClass: "mineral" },
  { code: "ZN", name: "Zinc", unit: "mg/100g", nutrientClass: "mineral" },
  { code: "VITC", name: "Vitamin C", unit: "mg/100g", nutrientClass: "vitamin" },
  { code: "LYS", name: "Lysine", unit: "g/100g", nutrientClass: "amino_acid" },
  { code: "MET", name: "Methionine", unit: "g/100g", nutrientClass: "amino_acid" },
  { code: "F18:2n6", name: "Linoleic acid", unit: "g/100g", nutrientClass: "fatty_acid" },
  { code: "F18:3n3", name: "Alpha-linolenic acid", unit: "g/100g", nutrientClass: "fatty_acid" },
  { code: "TOTAL_PHENOLICS", name: "Total phenolics", unit: "mg/100g", nutrientClass: "phenolic" },
  { code: "PHYTATE_TOTAL", name: "Total phytate", unit: "mg/100g", nutrientClass: "antinutrient" },
  { code: "OXALATE_TOTAL", name: "Total oxalate", unit: "mg/100g", nutrientClass: "antinutrient" },
  { code: "TANNIN", name: "Tannin", unit: "mg/100g", nutrientClass: "antinutrient" },
];

function projectSimplex(values: number[], total = 1): number[] {
  const nonNegative = values.map((value) => Math.max(0, value));
  const valueTotal = nonNegative.reduce((sum, value) => sum + value, 0);
  return valueTotal === 0 ? nonNegative.map(() => total / nonNegative.length) : nonNegative.map((value) => (value / valueTotal) * total);
}

function solveProjectedGradient(matrix: number[][], target: number[], fixed: Array<number | undefined>, iterations = 4000): number[] {
  const ingredientCount = matrix[0]?.length ?? 0;
  const fixedTotal = fixed.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const freeIndexes = fixed.map((value, index) => value === undefined ? index : -1).filter((index) => index >= 0);
  let beta = fixed.map((value) => value ?? (1 - fixedTotal) / Math.max(1, freeIndexes.length));
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const gradient = beta.map((_, ingredientIndex) =>
      2 * matrix.reduce((sum, row, nutrientIndex) => {
        const prediction = row.reduce((rowSum, coefficient, index) => rowSum + coefficient * beta[index], 0);
        return sum + row[ingredientIndex] * (prediction - target[nutrientIndex]);
      }, 0),
    );
    const freeValues = projectSimplex(freeIndexes.map((index) => beta[index] - 0.01 * gradient[index]), 1 - fixedTotal);
    freeIndexes.forEach((index, freeIndex) => { beta[index] = freeValues[freeIndex]; });
  }
  return beta;
}

export function reconstructRecipe(
  recipe: Recipe,
  recipeIngredients: RecipeIngredient[],
  nutrients: IngredientNutrient[],
  measuredFinalComposition: Record<string, number>,
  intendedUse: "human_food" | "animal_feed" | "research_only" = "human_food",
): RecipeReconstruction {
  const ingredients = recipeIngredients.filter((item) => item.recipeUid === recipe.recipeUid);
  const usableNutrients = nutrients.filter((item) => item.intendedUse === intendedUse);
  const nutrientCodes = Object.keys(measuredFinalComposition).filter((code) =>
    ingredients.every((ingredient) => usableNutrients.some((item) =>
      item.ingredientUid === ingredient.ingredientUid &&
      item.nutrientCode === code &&
      item.basis === ingredient.basis &&
      item.processingState === ingredient.processingState,
    )) && usableNutrients.some((item) => item.nutrientCode === code),
  );
  const warnings: string[] = [];
  if (nutrientCodes.length === 0) {
    return { recipeUid: recipe.recipeUid, nutrientCodes: [], ingredientUids: ingredients.map((item) => item.ingredientUid), fractions: {}, predictedComposition: {}, residuals: {}, coveragePct: 0, warnings: ["No nutrient has complete ingredient coverage in the requested basis, processing state, and intended-use domain."], solver: "projected_gradient_nnls", engineVersion: "1.0.0", intendedUse };
  }
  const matrix = nutrientCodes.map((code) => ingredients.map((ingredient) =>
    usableNutrients.find((item) => item.ingredientUid === ingredient.ingredientUid && item.nutrientCode === code && item.basis === ingredient.basis && item.processingState === ingredient.processingState)?.value ?? 0,
  ));
  const target = nutrientCodes.map((code) => measuredFinalComposition[code]);
  const fixedFractions = ingredients.map((ingredient) => ingredient.fixed ? ingredient.fractionDocumented : undefined);
  const fractionsArray = solveProjectedGradient(matrix, target, fixedFractions);
  const fractions = Object.fromEntries(ingredients.map((ingredient, index) => [ingredient.ingredientUid, fractionsArray[index]]));
  const predictedComposition = Object.fromEntries(nutrientCodes.map((code, nutrientIndex) => [code, matrix[nutrientIndex].reduce((sum, value, index) => sum + value * fractionsArray[index], 0)]));
  const residuals = Object.fromEntries(nutrientCodes.map((code) => [code, predictedComposition[code] - measuredFinalComposition[code]]));
  const largestFraction = Math.max(...fractionsArray);
  if (largestFraction > 0.9) warnings.push("One ingredient exceeds 90% of the estimated mixture; verify recipe documentation for domination bias.");
  if (nutrientCodes.length < ingredients.length) warnings.push("The system is underdetermined by nutrient coverage; add nutrients or fix documented fractions.");
  if (ingredients.some((ingredient) => ingredient.fixed && ingredient.fractionDocumented === undefined)) warnings.push("A fixed ingredient is missing its documented fraction.");
  return { recipeUid: recipe.recipeUid, nutrientCodes, ingredientUids: ingredients.map((item) => item.ingredientUid), fractions, predictedComposition, residuals, coveragePct: (nutrientCodes.length / Object.keys(measuredFinalComposition).length) * 100, warnings, solver: "projected_gradient_nnls", engineVersion: "1.0.0", intendedUse };
}
