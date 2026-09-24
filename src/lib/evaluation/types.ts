export type GapType = "deficiency" | "excess";
export type Severity = "low" | "moderate" | "high";
export type CauseType = "dietary" | "absorption_inhibitor" | "medication" | "age_related" | "lifestyle";
export type SolutionType = "dietary_change" | "traditional_remedy" | "lifestyle" | "referral";
export type EvidenceStrength = "established" | "probable" | "preliminary";
export type InteractionStatus = "pass" | "flagged" | "n_a" | "pending";

export interface Medication {
  name: string;
  dose?: string;
  drugClass: string; // e.g. "Anticoagulants / Antiplatelets", "Hypoglycemics", "Antihypertensives", "Diuretics"
}

export interface LifestyleHabits {
  teaWithMeals?: boolean; // Tannins inhibit non-heme iron absorption
  coffeeRitualTwiceDaily?: boolean; // High polyphenol intake with meals
  fastingDays?: string; // e.g. "Wednesdays and Fridays" (Tsom)
  sunExposureMinutesDaily?: number; // Vitamin D synthesis
  unfermentedGrainsHabit?: boolean; // Higher phytates
}

export interface NormalizedProfile {
  userId?: string;
  age: number;
  gender: "male" | "female" | "other";
  weightKg?: number;
  region: string; // e.g. "Addis Ababa", "Amhara", "Oromia", "Tigray", "Sidama", "Somali"
  altitudeMeters: number; // e.g. 2400 for Addis Ababa, 1800 for Hawassa
  activityLevel: "sedentary" | "moderate" | "active" | "very_active";
  pregnancyOrLactation: "none" | "pregnant_t1" | "pregnant_t2" | "pregnant_t3" | "lactating";
  medications: Medication[];
  medicalHistory: string[];
  allergies: string[];
  lifestyleHabits: LifestyleHabits;
}

export interface FoodEntry {
  foodId: string;
  foodName: string;
  gramsConsumed: number; // e.g. 250g of injera, 150g of shiro
}

export interface NutrientTarget {
  nutrientId: string;
  nutrientName: string;
  unit: string;
  baseRda: number;
  adjustedRda: number;
  adjustmentReasons: string[];
  tolerableUpperLimit?: number | null;
}

export interface FoodNutrientRow {
  foodId: string;
  nutrientId: string;
  amountPer100g: number;
  bioavailabilityFactor: number;
  fermentationImpactNote?: string;
}

export interface Gap {
  nutrientId: string;
  nutrientName: string;
  unit: string;
  gapType: GapType;
  severity: Severity;
  targetRda: number;
  calculatedDailyIntake: number;
  estimatedIntakePct: number; // percentage of target (e.g. 45.2%)
  sourceRef: string;
}

export interface Cause {
  gapNutrientId: string;
  causeType: CauseType;
  title: string;
  description: string;
  evidenceStrength: EvidenceStrength;
  sourceRef: string;
}

export interface Solution {
  id?: string;
  gapNutrientId: string;
  solutionType: SolutionType;
  title: string;
  description: string;
  herbId?: string;
  herbName?: string;
  interactionChecked: InteractionStatus;
  interactionNotes?: string;
  rankScore: number;
  sourceRef: string;
}

export interface SafetyCheckResult {
  herbName: string;
  status: "pass" | "flagged";
  flaggedDrugClass?: string;
  flaggedMedication?: string;
  severity?: "high" | "moderate" | "caution";
  mechanism?: string;
  physiologicalEffect?: string;
  contraindicated?: boolean;
  sourceRef: string;
}

export interface StatisticalSummary {
  overallRiskScore: number;
  weightedSeverity: number;
  confidence: number;
  evidenceCoverage: number;
  sourceTrustScore: number;
  topDrivers: string[];
}

export function computeStatisticalSummary(
  profile: Partial<NormalizedProfile> | NormalizedProfile,
  gaps: Gap[],
  causes: Cause[],
  solutions: Solution[] = []
): StatisticalSummary {
  const severityWeight: Record<Severity, number> = { low: 20, moderate: 45, high: 75 };
  const evidenceWeight: Record<EvidenceStrength, number> = { established: 1, probable: 0.7, preliminary: 0.45 };

  const weightedGapScore = gaps.length
    ? gaps.reduce((sum, gap) => {
        const gapShortfall = gap.gapType === "deficiency"
          ? Math.max(0, 1 - gap.estimatedIntakePct / 100)
          : Math.min(1, Math.max(0, gap.estimatedIntakePct - 100) / 200);
        const severityBias = severityWeight[gap.severity] ?? 20;
        return sum + ((severityBias * 0.7) + (gapShortfall * 100 * 0.3));
      }, 0) / gaps.length
    : 0;

  const weightedCauseScore = causes.length
    ? causes.reduce((sum, cause) => sum + (evidenceWeight[cause.evidenceStrength] ?? 0.45) * 100, 0) / causes.length
    : 0;

  const altitudeModifier = profile.altitudeMeters && profile.altitudeMeters >= 2000 ? 1.15 : 1;
  const demographicModifier = profile.pregnancyOrLactation !== "none" ? 1.1 : 1;
  const overallRiskScore = Math.min(
    100,
    Math.max(0, Math.round(((weightedGapScore * 0.75) + (weightedCauseScore * 0.25)) * altitudeModifier * demographicModifier))
  );

  const evidenceCoverage = causes.length
    ? Math.min(
        100,
        Math.round(
          (causes.reduce((sum, cause) => sum + (evidenceWeight[cause.evidenceStrength] ?? 0.45), 0) / causes.length) * 100
        )
      )
    : 100;

  const sourceTrustScore = causes.length
    ? Math.min(
        100,
        Math.round(
          (causes.reduce((sum, cause) => {
            const normalized = cause.sourceRef.toUpperCase();
            return sum + (/(EFCT|ETM|WHO|CLIN|GUIDE|NUTRITION|DIRECTIVE)/.test(normalized) ? 1 : 0.65);
          }, 0) / causes.length) * 100
        )
      )
    : 85;

  const confidence = Math.min(
    0.99,
    Number(
      (
        0.38 +
        (evidenceCoverage / 100) * 0.34 +
        (sourceTrustScore / 100) * 0.18 +
        (solutions.length > 0 ? 0.08 : 0) +
        Math.min(1, gaps.length / 4) * 0.08
      ).toFixed(2)
    )
  );

  const topDrivers = causes
    .map((cause) => ({
      title: cause.title,
      score: (evidenceWeight[cause.evidenceStrength] ?? 0.45) * 100 + ((severityWeight[(gaps.find((gap) => gap.nutrientId === cause.gapNutrientId)?.severity ?? "low")] ?? 20) * 0.35),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.title);

  return {
    overallRiskScore,
    weightedSeverity: Math.min(100, Math.round(weightedGapScore)),
    confidence,
    evidenceCoverage,
    sourceTrustScore,
    topDrivers,
  };
}

export interface EvaluationReportResult {
  profile: NormalizedProfile;
  targets: NutrientTarget[];
  gaps: Gap[];
  causes: Cause[];
  solutions: Solution[];
  culledUnsafeRemedies: SafetyCheckResult[];
  summaryNarrative: string;
  statistics?: StatisticalSummary;
  safetyGateVerified: boolean;
  generatedAt: string;
  modelVersion: string;
}
