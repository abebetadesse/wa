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
  clinicalEffect?: string;
  contraindicated?: boolean;
  sourceRef: string;
}

export interface EvaluationReportResult {
  profile: NormalizedProfile;
  targets: NutrientTarget[];
  gaps: Gap[];
  causes: Cause[];
  solutions: Solution[];
  culledUnsafeRemedies: SafetyCheckResult[];
  summaryNarrative: string;
  safetyGateVerified: boolean;
  generatedAt: string;
  modelVersion: string;
}
