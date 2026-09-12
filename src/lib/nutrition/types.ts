export type FoodCategory =
  | "Grains & Cereals"
  | "Legumes & Pulses"
  | "Roots & Tubers"
  | "Vegetables & Greens"
  | "Seeds, Nuts & Oils"
  | "Meat, Poultry & Dairy"
  | "Spices & Nutrient Amplifiers";

export type FastingSuitability = "fasting_friendly" | "non_fasting" | "dual";

export interface AntinutrientProfile {
  phyticAcidMgPer100g: number;
  tanninsMgPer100g: number;
  oxalatesMgPer100g: number;
  trypsinInhibitorLevel: "negligible" | "low" | "moderate" | "high";
  traditionalDegradationMethod: string;
  fermentationReductionPct: number; // e.g. 75% reduction
  bioavailabilityUpliftDescription: string;
}

export interface FoodNutrientValue {
  name: string;
  symbol?: string;
  unit: string;
  amountPer100g: number;
  bioavailabilityFactor: number; // e.g. 1.45
  note?: string;
}

export interface MacroSummary {
  caloriesKcal: number;
  proteinG: number;
  carbohydratesG: number;
  fatsG: number;
  dietaryFiberG: number;
}

export interface EFCTFoodItem {
  id: string;
  name: string;
  nameAmharic: string;
  category: FoodCategory;
  sourceRef: string; // e.g. "EFCT2025-0101"
  traditionalPreparation: string;
  fastingSuitability: FastingSuitability;
  glycemicIndex: {
    value: number;
    rating: "low" | "medium" | "high";
  };
  antinutrients: AntinutrientProfile;
  macros: MacroSummary;
  nutrients: FoodNutrientValue[];
  clinicalhealthNotes: {
    primaryIndications: string[];
    bioactiveCompounds: string[];
    digestiveTolerance: string;
  };
}
