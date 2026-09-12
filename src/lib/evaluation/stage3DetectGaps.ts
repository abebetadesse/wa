import { FoodEntry, FoodNutrientRow, NutrientTarget, Gap, Severity } from "./types";

export function stage3DetectGaps(
  dietLog: FoodEntry[],
  foodNutrientsLookup: Map<string, FoodNutrientRow[]>, // keyed by foodId
  targets: NutrientTarget[]
): { gaps: Gap[]; estimatedIntakeMap: Map<string, number> } {
  const estimatedIntakeMap = new Map<string, number>();

  // Aggregate daily nutrient intake
  for (const entry of dietLog) {
    const rows = foodNutrientsLookup.get(entry.foodId) || [];
    const portionFactor = entry.gramsConsumed / 100.0;

    for (const row of rows) {
      const bioFactor = row.bioavailabilityFactor || 1.0;
      const effectiveAmount = row.amountPer100g * portionFactor * bioFactor;
      const current = estimatedIntakeMap.get(row.nutrientId) || 0;
      estimatedIntakeMap.set(row.nutrientId, current + effectiveAmount);
    }
  }

  const gaps: Gap[] = [];

  for (const target of targets) {
    const dailyIntake = estimatedIntakeMap.get(target.nutrientId) || 0;
    const intakePct = target.adjustedRda > 0 ? (dailyIntake / target.adjustedRda) * 100 : 100;
    const roundedIntake = Number(dailyIntake.toFixed(2));
    const roundedPct = Number(intakePct.toFixed(1));

    // Deficiency Detection (< 70% of adjusted target)
    if (intakePct < 70) {
      let severity: Severity = "low";
      if (intakePct < 40) {
        severity = "high";
      } else if (intakePct < 55) {
        severity = "moderate";
      }

      gaps.push({
        nutrientId: target.nutrientId,
        nutrientName: target.nutrientName,
        unit: target.unit,
        gapType: "deficiency",
        severity,
        targetRda: target.adjustedRda,
        calculatedDailyIntake: roundedIntake,
        estimatedIntakePct: roundedPct,
        sourceRef: "EFCT2025-EVAL-DEF",
      });
    }
    // Excess Detection (> 200% or exceeds Tolerable Upper Limit)
    else if (intakePct > 200 || (target.tolerableUpperLimit && dailyIntake > target.tolerableUpperLimit)) {
      let severity: Severity = "moderate";
      if (intakePct > 300 || (target.tolerableUpperLimit && dailyIntake > target.tolerableUpperLimit * 1.25)) {
        severity = "high";
      }

      gaps.push({
        nutrientId: target.nutrientId,
        nutrientName: target.nutrientName,
        unit: target.unit,
        gapType: "excess",
        severity,
        targetRda: target.adjustedRda,
        calculatedDailyIntake: roundedIntake,
        estimatedIntakePct: roundedPct,
        sourceRef: "EFCT2025-EVAL-EXC",
      });
    }
  }

  return { gaps, estimatedIntakeMap };
}
