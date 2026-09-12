/**
 * Enhancement 3: Habesha Equatorial 12-Hour Chrononutrition Engine
 *
 * In the Ethiopian timekeeping system (Ketat / ሰዓት), the day begins at sunrise (~6:00 AM standard time = 12:00 / 0:00 or 1:00 Ketat day).
 * Because Ethiopia is 9 degrees North of the equator, daylight is constant (~12h day / 12h night year-round).
 * This engine maps standard 24h clock to Ethiopian Ketat time and provides circadian-aligned nutrient partitioning recommendations.
 */

export interface HabeshaTimeInfo {
  standardHour24: number;
  standardMinute: number;
  ethiopianHour: number; // 1 to 12
  isDaytime: boolean; // Day (ቀን) vs Night (ማታ)
  ethiopianHourLabelAmharic: string;
  ethiopianPeriodAmharic: string;
  circadianPhase: "dawn_activation" | "peak_insulin_sensitivity" | "metabolic_plateau" | "evening_clearance" | "nocturnal_fast";
  macronutrientPartitioningPriority: {
    carbohydrateTolerance: "very_high" | "high" | "moderate" | "low";
    recommendedMealType: string;
    optimalFoods: string[];
    metabolicNote: string;
  };
}

/**
 * Converts a standard 24h hour and minute to Ethiopian time
 * Standard 06:00 = 12:00 daytime (or 1:00 by 07:00)
 * Standard 07:00 = 1:00 daytime (ጠዋት 1 ሰዓት)
 * Standard 12:00 = 6:00 daytime (ቀትር 6 ሰዓት)
 * Standard 18:00 = 12:00 daytime (ምሽት 12 ሰዓት)
 * Standard 19:00 = 1:00 nighttime (ምሽት 1 ሰዓት)
 * Standard 24:00 (00:00) = 6:00 nighttime (እኩለ ሌሊት 6 ሰዓት)
 */
export function convertToHabeshaTime(standardHour24: number, standardMinute: number = 0): HabeshaTimeInfo {
  const normHour = ((standardHour24 % 24) + 24) % 24;
  const isDaytime = normHour >= 6 && normHour < 18;

  let ethiopianHour: number;
  if (normHour >= 6) {
    ethiopianHour = (normHour - 6) % 12;
  } else {
    ethiopianHour = (normHour + 6) % 12;
  }
  if (ethiopianHour === 0) ethiopianHour = 12;

  let periodAmharic: string;
  let phase: HabeshaTimeInfo["circadianPhase"];
  let carbTolerance: HabeshaTimeInfo["macronutrientPartitioningPriority"]["carbohydrateTolerance"];
  let recommendedMealType: string;
  let optimalFoods: string[];
  let metabolicNote: string;

  if (normHour >= 6 && normHour < 9) {
    // 6am - 9am (12 - 3 daytime)
    periodAmharic = "ጠዋት (Dawn / Morning)";
    phase = "dawn_activation";
    carbTolerance = "high";
    recommendedMealType = "Metabolic Kickstart / High Mineral Breakfast";
    optimalFoods = ["Kinche (cracked whole wheat with spiced butter)", "Chechebsa (Kita firfir)", "Genfo (barley porridge)", "Tosign herbal tea"];
    metabolicNote = "Cortisol peak promotes mobilization of liver glycogen. Complex carbohydrates with high mineral content replenish reserves after the overnight fast.";
  } else if (normHour >= 9 && normHour < 14) {
    // 9am - 2pm (3 - 8 daytime)
    periodAmharic = "ቀትር / ረፋድ (Midday Peak)";
    phase = "peak_insulin_sensitivity";
    carbTolerance = "very_high";
    recommendedMealType = "Substantial Main Meal (Highest Glycemic Load Tolerated)";
    optimalFoods = ["Teff Injera with Shiro Alicha", "Misir Wot (lentils)", "Gomen (collard greens)", "Atkilt Wot (cabbage/carrots)"];
    metabolicNote = "Circadian GLUT4 translocation and peripheral insulin sensitivity reach maximum daily amplitude. Optimal window for teff injera complex starches.";
  } else if (normHour >= 14 && normHour < 18) {
    // 2pm - 6pm (8 - 12 daytime)
    periodAmharic = "ከሰዓት በኋላ (Late Afternoon)";
    phase = "metabolic_plateau";
    carbTolerance = "moderate";
    recommendedMealType = "Cognitive Sustenance & Mineral Hydration";
    optimalFoods = ["Kolo (roasted barley and chickpeas)", "Fresh brewed Buna (Coffee ceremony round 1)", "Sun-dried fruit or walnuts"];
    metabolicNote = "Post-prandial glucose baseline stabilises. Small protein/polyphenol snacks maintain mental alertness without triggering secondary insulin surges.";
  } else if (normHour >= 18 && normHour < 22) {
    // 6pm - 10pm (12 - 4 nighttime)
    periodAmharic = "ምሽት (Evening Sunset)";
    phase = "evening_clearance";
    carbTolerance = "low";
    recommendedMealType = "Light Reparative Dinner (High Protein / Low Glycemic)";
    optimalFoods = ["Defin Misir (whole brown lentils)", "Steamed Tikil Gomen", "Light Shiro with single teff roll", "Enset Bulla soup"];
    metabolicNote = "Melatonin onset reduces pancreatic beta-cell insulin secretion. Minimize high glycemic starches to prevent nocturnal hyperglycemia and lipid storage.";
  } else {
    // 10pm - 6am (4 - 12 nighttime)
    periodAmharic = "እኩለ ሌሊት / ሌሊት (Deep Night)";
    phase = "nocturnal_fast";
    carbTolerance = "low";
    recommendedMealType = "Fasting & Restorative Hydration Only";
    optimalFoods = ["Warm water with lemon", "Chamomile or Tena Adam leaf water"];
    metabolicNote = "Hepatic gluconeogenesis is minimal; cellular autophagy, growth hormone secretion, and gastrointestinal resting motility take precedence.";
  }

  const hourLabelAmharic = `${periodAmharic} ${ethiopianHour} ሰዓት (${ethiopianHour}:${standardMinute.toString().padStart(2, "0")})`;

  return {
    standardHour24: normHour,
    standardMinute,
    ethiopianHour,
    isDaytime,
    ethiopianHourLabelAmharic: hourLabelAmharic,
    ethiopianPeriodAmharic: periodAmharic,
    circadianPhase: phase,
    macronutrientPartitioningPriority: {
      carbohydrateTolerance: carbTolerance,
      recommendedMealType,
      optimalFoods,
      metabolicNote,
    },
  };
}
