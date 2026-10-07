import { NormalizedProfile, NutrientTarget } from "./types";

export interface NutrientReference {
  id: string;
  name: string;
  symbol?: string;
  unit: string;
  category: string;
  baseRda: number;
  tolerableUpperLimit?: number | null;
}

export function stage2ComputeTargets(
  profile: NormalizedProfile,
  nutrientList: NutrientReference[]
): NutrientTarget[] {
  return nutrientList.map((nutrient) => {
    let multiplier = 1.0;
    const reasons: string[] = [];

    // Gender & Age Adjustments
    if (nutrient.name === "Iron") {
      if (profile.gender === "female" && profile.age >= 14 && profile.age <= 50) {
        multiplier = 1.0; // Base RDA is calibrated for premenopausal females (18mg)
        reasons.push("Standard childbearing age baseline (menstrual turnover consideration)");
      } else if (profile.gender === "male" || profile.age > 50) {
        multiplier = 8.0 / 18.0; // Males and postmenopausal females require 8mg
        reasons.push("Adult male / postmenopausal baseline adjustment (8mg)");
      } else if (profile.gender === "other" && profile.age >= 14 && profile.age <= 50) {
        reasons.push("No sex-specific iron adjustment applied because relevant information was not provided.");
      }
    }

    if (nutrient.name === "Calcium") {
      if (profile.age > 50) {
        multiplier = 1.2; // 1200mg vs 1000mg
        reasons.push("Age > 50 bone density conservation requirement");
      }
    }

    // Altitude Adjustment for Ethiopian Highlands (Addis Ababa ~2,400m, Gondar ~2,600m)
    // WHO guidelines: Increased erythropoiesis at altitude requires higher iron availability
    if (nutrient.name === "Iron" && profile.altitudeMeters >= 1500) {
      if (profile.altitudeMeters >= 2500) {
        multiplier *= 1.25; // +25% at extreme highland elevations
        reasons.push(`Highland altitude elevation (${profile.altitudeMeters}m): +25% erythropoietic demand`);
      } else {
        multiplier *= 1.15; // +15% at mid-highlands
        reasons.push(`Highland elevation (${profile.altitudeMeters}m): +15% altitude hemoglobin adaptation`);
      }
    }

    // Pregnancy & Lactation Adjustments
    if (profile.pregnancyOrLactation.startsWith("pregnant")) {
      if (nutrient.name === "Iron") {
        multiplier = Math.max(multiplier, 1.5); // 27mg
        reasons.push("Pregnancy trimester fetal-placental blood volume expansion");
      }
      if (nutrient.name === "Folate") {
        multiplier *= 1.5; // 600mcg vs 400mcg
        reasons.push("Neural tube synthesis and maternal tissue growth");
      }
      if (nutrient.name === "Calcium") {
        multiplier *= 1.3;
        reasons.push("Fetal skeletal mineralization");
      }
      if (nutrient.name === "Protein") {
        multiplier *= 1.35;
        reasons.push("Maternal and fetal tissue synthesis");
      }
    } else if (profile.pregnancyOrLactation === "lactating") {
      if (nutrient.name === "Zinc") {
        multiplier *= 1.45;
        reasons.push("Breast milk secretion requirement");
      }
      if (nutrient.name === "Protein") {
        multiplier *= 1.4;
        reasons.push("Lactation macronutrient output");
      }
    }

    // Physical Activity Adjustments
    if (profile.activityLevel === "active" || profile.activityLevel === "very_active") {
      if (nutrient.name === "Protein") {
        multiplier *= profile.activityLevel === "very_active" ? 1.4 : 1.2;
        reasons.push("High physical activity metabolic turnover");
      }
      if (nutrient.name === "Magnesium" || nutrient.name === "Potassium") {
        multiplier *= 1.15;
        reasons.push("Active exertion electrolyte and muscular recovery");
      }
    }

    const adjustedRda = Number((nutrient.baseRda * multiplier).toFixed(2));

    return {
      nutrientId: nutrient.id,
      nutrientName: nutrient.name,
      unit: nutrient.unit,
      baseRda: nutrient.baseRda,
      adjustedRda,
      adjustmentReasons: reasons.length > 0 ? reasons : ["Standard physiological baseline"],
      tolerableUpperLimit: nutrient.tolerableUpperLimit,
    };
  });
}
