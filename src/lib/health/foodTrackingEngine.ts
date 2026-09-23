/**
 * Food Scanning & Nutrition Tracking Engine
 * Inspired by FoodTrack - Ethiopian Food Composition & Meal Logging
 */

import { ScannedFoodItem, MealLog, DailyNutritionSummary } from "./WelbeingTypes";

// Ethiopian Food Composition Database (subset from EFCT 2025)
export const ETHIOPIAN_FOOD_DATABASE: ScannedFoodItem[] = [
  {
    id: "efct-001",
    name: "Injera (Teff-based)",
    nameAmharic: "ኢንጀራ (ጤፍ)",
    category: "fermented",
    servingSize: 100,
    servingLabel: "1 standard injera",
    macros: { calories: 218, protein: 7.2, carbohydrates: 42.1, fat: 2.1, fiber: 6.4 },
    micronutrients: { iron: 7.6, calcium: 180, zinc: 3.6, folate: 45 },
    bioavailabilityModifiers: {
      fermented: true,
      fermentationDays: 3,
      phytateReduction: 60,
      antinutrients: ["phytate", "tannin"],
      enhancers: ["lactic acid fermentation", "Lactobacillus"],
    },
    traditionalPreparation: "3-day lactic acid fermentation of teff flour. Fermentation degrades phytate by ~60%, dramatically increasing iron and zinc bioavailability.",
    sourceRef: "EFCT-2025",
    WelbeingFlags: ["high-fiber", "fermented-probiotic", "gluten-free-teff"],
  },
  {
    id: "efct-002",
    name: "Misir Wat (Red Lentil Stew)",
    nameAmharic: "ምስር ወጥ",
    category: "legume",
    servingSize: 200,
    servingLabel: "1 cup serving",
    macros: { calories: 180, protein: 14.2, carbohydrates: 28.4, fat: 3.1, fiber: 9.8 },
    micronutrients: { iron: 5.2, calcium: 80, zinc: 2.8, folate: 120, vitaminA: 45 },
    bioavailabilityModifiers: {
      fermented: false,
      antinutrients: ["phytate", "lectins"],
      enhancers: ["cooking reduces lectins", "berbere spices enhance absorption"],
    },
    traditionalPreparation: "Cooked red lentils spiced with berbere, nitter kibbeh (if not fasting), onions, and garlic.",
    sourceRef: "EFCT-2025",
    WelbeingFlags: ["high-protein", "high-fiber", "high-folate", "vegan-friendly"],
  },
  {
    id: "efct-003",
    name: "Gomen Besiga (Collard Greens with Meat)",
    nameAmharic: "ጎመን በስጋ",
    category: "vegetable",
    servingSize: 150,
    servingLabel: "1 cup serving",
    macros: { calories: 140, protein: 12, carbohydrates: 8.2, fat: 6.4, fiber: 4.2 },
    micronutrients: { iron: 3.8, calcium: 250, vitaminA: 680, vitaminC: 45, folate: 88 },
    bioavailabilityModifiers: {
      fermented: false,
      antinutrients: ["oxalate"],
      enhancers: ["vitamin C from cooking reduces oxalate impact", "nitter kibbeh aids fat-soluble vitamin absorption"],
    },
    traditionalPreparation: "Chopped collard greens cooked with beef, onions, garlic, and Ethiopian spiced butter.",
    sourceRef: "EFCT-2025",
    WelbeingFlags: ["high-calcium", "high-vitamin-a", "high-vitamin-c", "bone-Welbeing"],
  },
  {
    id: "efct-004",
    name: "Shiro Wat (Chickpea Flour Stew)",
    nameAmharic: "ሽሮ ወጥ",
    category: "legume",
    servingSize: 200,
    servingLabel: "1 cup serving",
    macros: { calories: 155, protein: 9.8, carbohydrates: 22.1, fat: 3.8, fiber: 6.2 },
    micronutrients: { iron: 3.4, calcium: 75, zinc: 2.1, folate: 85 },
    bioavailabilityModifiers: {
      fermented: false,
      antinutrients: ["phytate"],
      enhancers: ["spice blend may enhance mineral solubility"],
    },
    traditionalPreparation: "Ground roasted chickpea flour cooked with berbere, onion, and oil. Common fasting food.",
    sourceRef: "EFCT-2025",
    WelbeingFlags: ["fasting-approved", "high-fiber", "legume-protein"],
  },
  {
    id: "efct-005",
    name: "Tej (Honey Wine)",
    nameAmharic: "ጠጅ",
    category: "beverage",
    servingSize: 250,
    servingLabel: "1 birille (traditional cup)",
    macros: { calories: 175, protein: 0.4, carbohydrates: 22, fat: 0, fiber: 0 },
    micronutrients: { vitaminC: 2 },
    bioavailabilityModifiers: {
      fermented: true,
      fermentationDays: 14,
      antinutrients: [],
      enhancers: ["honey-based fermentation", "gesho (Rhamnus prinoides) bitterness"],
    },
    traditionalPreparation: "Fermented honey wine with gesho leaves. Consumed during celebrations and ceremonies.",
    sourceRef: "EFCT-2025",
    WelbeingFlags: ["fermented", "high-sugar", "ceremonial-beverage"],
  },
  {
    id: "efct-006",
    name: "Kitfo (Raw/Minced Beef)",
    nameAmharic: "ክትፎ",
    category: "meat",
    servingSize: 100,
    servingLabel: "1 serving",
    macros: { calories: 245, protein: 22.4, carbohydrates: 0, fat: 17.2, fiber: 0 },
    micronutrients: { iron: 3.1, zinc: 5.4, vitaminB12: 2.8 },
    bioavailabilityModifiers: {
      fermented: false,
      antinutrients: [],
      enhancers: ["mitmita spice mix", "nitter kibbeh"],
    },
    traditionalPreparation: "Minced raw beef seasoned with mitmita and spiced butter. Can be leb leb (lightly warmed) or fully cooked (fully cooked version recommended for safety).",
    sourceRef: "EFCT-2025",
    WelbeingFlags: ["high-protein", "high-b12", "high-zinc", "heme-iron", "food-safety-risk-raw"],
  },
  {
    id: "efct-007",
    name: "Enset Kocho (Fermented False Banana)",
    nameAmharic: "ኮቾ (ዕንሰት)",
    category: "fermented",
    servingSize: 100,
    servingLabel: "1 serving",
    macros: { calories: 152, protein: 2.1, carbohydrates: 36.4, fat: 0.6, fiber: 4.2 },
    micronutrients: { calcium: 65, iron: 1.8, zinc: 0.9 },
    bioavailabilityModifiers: {
      fermented: true,
      fermentationDays: 180,
      phytateReduction: 40,
      antinutrients: ["oxalate"],
      enhancers: ["long pit fermentation enhances digestibility"],
    },
    traditionalPreparation: "Fermented enset (false banana) corm and pseudostem. Fermented underground for 1-6 months. Cultural staple of Gurage and Sidama peoples.",
    sourceRef: "EFCT-2025",
    WelbeingFlags: ["famine-resistant-crop", "long-fermented", "cultural-significance"],
  },
  {
    id: "efct-008",
    name: "Moringa Leaf (Shiferaw)",
    nameAmharic: "ሽፈራው",
    category: "vegetable",
    servingSize: 50,
    servingLabel: "½ cup fresh leaves",
    macros: { calories: 35, protein: 4.2, carbohydrates: 4.8, fat: 0.8, fiber: 2.1 },
    micronutrients: { iron: 4.0, calcium: 185, vitaminA: 1800, vitaminC: 78, zinc: 0.6 },
    bioavailabilityModifiers: {
      fermented: false,
      antinutrients: ["oxalate", "tannin"],
      enhancers: ["cooking reduces oxalate", "vitamin C enhances iron uptake"],
    },
    traditionalPreparation: "Fresh or dried moringa leaves added to stews, or consumed as herbal tea. Increasingly recognized as a superfood.",
    sourceRef: "EFCT-2025",
    WelbeingFlags: ["superfood", "high-vitamin-a", "high-calcium", "anti-inflammatory"],
  },
  {
    id: "efct-009",
    name: "Ayib (Ethiopian Cottage Cheese)",
    nameAmharic: "አይብ",
    category: "dairy",
    servingSize: 100,
    servingLabel: "1 serving",
    macros: { calories: 98, protein: 11.4, carbohydrates: 3.2, fat: 4.8, fiber: 0 },
    micronutrients: { calcium: 240, vitaminB12: 0.9, zinc: 1.2 },
    bioavailabilityModifiers: {
      fermented: true,
      antinutrients: [],
      enhancers: ["whey protein", "live cultures", "high calcium bioavailability"],
    },
    traditionalPreparation: "Soured milk curd, strained and served fresh. Used with gomen or as a side dish. Not consumed during most fasting periods.",
    sourceRef: "EFCT-2025",
    WelbeingFlags: ["high-calcium", "fermented", "probiotic", "animal-protein"],
  },
  {
    id: "efct-010",
    name: "Telba (Flaxseed)",
    nameAmharic: "ተልባ",
    category: "other",
    servingSize: 30,
    servingLabel: "2 tablespoons",
    macros: { calories: 150, protein: 5.1, carbohydrates: 8.1, fat: 11.8, fiber: 7.6 },
    micronutrients: { iron: 1.8, calcium: 72, zinc: 1.1 },
    bioavailabilityModifiers: {
      fermented: false,
      antinutrients: ["phytate"],
      enhancers: ["grinding seeds increases bioavailability", "omega-3 rich ALA"],
    },
    traditionalPreparation: "Roasted and ground flaxseeds used in traditional porridge (genfo) or added to stews. Also used as herbal medicine.",
    sourceRef: "EFCT-2025",
    WelbeingFlags: ["omega-3", "high-fiber", "heart-Welbeing", "anti-inflammatory"],
  },
];

export function searchFoodDatabase(query: string): ScannedFoodItem[] {
  const q = query.toLowerCase();
  return ETHIOPIAN_FOOD_DATABASE.filter(
    (food) =>
      food.name.toLowerCase().includes(q) ||
      (food.nameAmharic && food.nameAmharic.includes(q)) ||
      food.category.includes(q) ||
      food.WelbeingFlags.some((flag) => flag.includes(q))
  );
}

export function getFoodById(id: string): ScannedFoodItem | undefined {
  return ETHIOPIAN_FOOD_DATABASE.find((f) => f.id === id);
}

export function calculateMealNutrition(log: MealLog): {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalIron: number;
  totalCalcium: number;
  totalVitaminA: number;
} {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalIron = 0;
  let totalCalcium = 0;
  let totalVitaminA = 0;

  for (const item of log.items) {
    const multiplier = (item.servings * item.food.servingSize) / 100;
    totalCalories += item.food.macros.calories * multiplier;
    totalProtein += item.food.macros.protein * multiplier;
    totalCarbs += item.food.macros.carbohydrates * multiplier;
    totalFat += item.food.macros.fat * multiplier;
    totalFiber += item.food.macros.fiber * multiplier;
    totalIron += (item.food.micronutrients.iron || 0) * multiplier;
    totalCalcium += (item.food.micronutrients.calcium || 0) * multiplier;
    totalVitaminA += (item.food.micronutrients.vitaminA || 0) * multiplier;
  }

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalFiber: Math.round(totalFiber * 10) / 10,
    totalIron: Math.round(totalIron * 10) / 10,
    totalCalcium: Math.round(totalCalcium),
    totalVitaminA: Math.round(totalVitaminA),
  };
}

// Ethiopian DRI (Dietary Reference Intake) targets based on WHO/FAO + altitude corrections
export const ETHIOPIAN_DRI_TARGETS = {
  calories: { male: 2400, female: 2000 },
  protein: { male: 65, female: 55 }, // grams
  carbs: { male: 310, female: 260 },
  fat: { male: 80, female: 65 },
  fiber: { male: 30, female: 25 },
  iron: {
    male: 14, // mg - vegetarian WHO reference
    female: 28, // mg - premenopausal vegetarian (Ethiopian vegan fasting adjustment)
    fermentedBonus: 0.6, // bioavailability factor for fermented foods
  },
  calcium: { male: 1000, female: 1200 }, // mg
  vitaminA: { male: 900, female: 700 }, // mcg RAE
  zinc: { male: 14, female: 10 }, // mg - vegetarian
  vitaminC: { male: 90, female: 75 }, // mg
  folate: { male: 400, female: 600 }, // mcg (higher for women)
};

export function generateDailySummary(
  date: string,
  meals: MealLog[],
  sex: "male" | "female" = "female"
): DailyNutritionSummary {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalIron = 0;
  let totalCalcium = 0;
  let totalZinc = 0;
  let totalVitaminA = 0;
  let totalVitaminC = 0;
  let totalFolate = 0;

  for (const meal of meals) {
    const nutrition = calculateMealNutrition(meal);
    totalCalories += nutrition.totalCalories;
    totalProtein += nutrition.totalProtein;
    totalCarbs += nutrition.totalCarbs;
    totalFat += nutrition.totalFat;
    totalFiber += nutrition.totalFiber;
    totalIron += nutrition.totalIron;
    totalCalcium += nutrition.totalCalcium;
    totalVitaminA += nutrition.totalVitaminA;
  }

  const dri = ETHIOPIAN_DRI_TARGETS;
  const gaps: DailyNutritionSummary["micronutrientGaps"] = [];

  const addGap = (nutrient: string, achieved: number, target: number) => {
    const pct = Math.round((achieved / target) * 100);
    gaps.push({
      nutrient,
      achieved: Math.round(achieved * 10) / 10,
      target,
      percentOfTarget: pct,
      severity:
        pct >= 90 ? "adequate" : pct >= 60 ? "mild_gap" : pct >= 30 ? "moderate_gap" : "severe_gap",
    });
  };

  addGap("Iron (mg)", totalIron, dri.iron[sex]);
  addGap("Calcium (mg)", totalCalcium, dri.calcium[sex]);
  addGap("Vitamin A (mcg)", totalVitaminA, dri.vitaminA[sex]);

  // Compute alignment score: how well diet matches Ethiopian holistic wisdom
  let alignmentScore = 50;
  if (meals.some((m) => m.items.some((i) => i.food.bioavailabilityModifiers.fermented))) alignmentScore += 15;
  if (totalFiber >= dri.fiber[sex]) alignmentScore += 10;
  if (totalProtein >= dri.protein[sex] * 0.8) alignmentScore += 10;
  if (meals.some((m) => m.mealType === "coffee_ceremony")) alignmentScore += 5;
  if (totalCalories > dri.calories[sex] * 1.3) alignmentScore -= 10;
  alignmentScore = Math.max(0, Math.min(100, alignmentScore));

  return {
    date,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    micronutrientGaps: gaps,
    mealCount: meals.length,
    fastingHours: 0,
    ethioAlignmentScore: alignmentScore,
  };
}
