/**
 * wellbeing Module Types
 * Integrating best practices from Huazhen TCM, FoodTrack, AyurAI, AyurGenie, NaraCare.AI, Thryval
 */

// ==========================================
// TCM VISUAL DIAGNOSIS TYPES (Huazhen TCM)
// ==========================================

export type TongueColor =
  | "pale" | "pink" | "red" | "deep_red" | "purple" | "bluish_purple";

export type TongueCoating =
  | "thin_white" | "thick_white" | "thin_yellow" | "thick_yellow"
  | "gray_black" | "none" | "greasy_white" | "greasy_yellow";

export type TongueShape =
  | "normal" | "swollen" | "thin_narrow" | "cracked" | "scalloped"
  | "deviated" | "short_contracted";

export type TongueMoisture = "dry" | "moist" | "wet" | "slippery";

export interface TongueDiagnosisResult {
  color: TongueColor;
  coating: TongueCoating;
  shape: TongueShape;
  moisture: TongueMoisture;
  tcmPattern: string;
  ethiopianHumoralCorrelation: string;
  organSystems: string[];
  scientificSignificance: string;
  dietaryRecommendations: string[];
  herbalRecommendations: {
    herb: string;
    ethiopianName: string;
    action: string;
  }[];
  urgencyFlag: "normal" | "monitor" | "consult";
  disclaimer: string;
}

export type PulseQuality =
  | "floating" | "sinking" | "slow" | "rapid" | "slippery" | "wiry"
  | "tight" | "weak" | "strong" | "hollow" | "choppy" | "moderate";

export type PulsePosition = "cun" | "guan" | "chi"; // 寸 關 尺

export interface PulseReading {
  position: PulsePosition;
  quality: PulseQuality[];
  depth: "superficial" | "middle" | "deep";
  associatedOrgan: string;
  ethiopianEquivalent: string;
}

export interface PulseDiagnosisResult {
  leftWrist: { cun: PulseReading; guan: PulseReading; chi: PulseReading };
  rightWrist: { cun: PulseReading; guan: PulseReading; chi: PulseReading };
  overallHrEstimate: number;
  tcmConstitution: string;
  ethiopianHumoralBalance: string;
  dominantImbalance: string;
  therapeuticPrinciple: string;
  disclaimer: string;
}

// ==========================================
// FOOD SCANNING & NUTRITION TYPES (FoodTrack)
// ==========================================

export interface ScannedFoodItem {
  id: string;
  name: string;
  nameAmharic?: string;
  category:
  | "cereal" | "legume" | "vegetable" | "fruit" | "dairy" | "meat"
  | "fermented" | "spice" | "beverage" | "oil" | "other";
  servingSize: number; // grams
  servingLabel: string; // e.g., "1 injera", "1 cup"
  macros: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  micronutrients: {
    iron?: number;
    calcium?: number;
    zinc?: number;
    vitaminA?: number;
    vitaminC?: number;
    vitaminB12?: number;
    folate?: number;
    iodine?: number;
  };
  bioavailabilityModifiers: {
    fermented: boolean;
    fermentationDays?: number;
    phytateReduction?: number; // percentage
    antinutrients: string[];
    enhancers: string[];
  };
  traditionalPreparation?: string;
  sourceRef: "EFCT-2025" | "USDA" | "user-entered" | "ai-estimated";
  wellbeingFlags: string[];
}

export interface MealLog {
  id: string;
  timestamp: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "coffee_ceremony";
  items: { food: ScannedFoodItem; servings: number }[];
  location?: string;
  fastingContext?: string; // e.g., "Tsome fasting day"
  mood?: number; // 1-5
  hungerBefore?: number; // 1-10
  satisfactionAfter?: number; // 1-10
  notes?: string;
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  micronutrientGaps: {
    nutrient: string;
    achieved: number;
    target: number;
    percentOfTarget: number;
    severity: "adequate" | "mild_gap" | "moderate_gap" | "severe_gap";
  }[];
  mealCount: number;
  fastingHours: number;
  waterIntakeMl?: number;
  ethioAlignmentScore: number; // 0-100, how well diet matches Ethiopian wellbeing wisdom
}

export interface FoodScanSession {
  mode: "camera" | "barcode" | "manual" | "voice";
  status: "idle" | "scanning" | "analyzing" | "complete" | "error";
  result?: ScannedFoodItem;
  confidence?: number;
  processingTimeMs?: number;
}

// ==========================================
// DOSHA & HUMORAL CONSTITUTION (AyurAI/AyurGenie)
// ==========================================

export type DoshaType = "Vata" | "Pitta" | "Kapha" | "Vata-Pitta" | "Pitta-Kapha" | "Vata-Kapha" | "Tridosha";
export type EthiopianHumor = "esat" | "afere" | "nifas" | "may"; // Fire, Earth, Air, Water

export interface DoshaPrakritiScore {
  vata: number; // 0-100
  pitta: number; // 0-100
  kapha: number; // 0-100
  primaryDosha: DoshaType;
  secondaryDosha?: DoshaType;
}

export interface EthiopianHumoralScore {
  esat: number; // Fire
  afere: number; // Earth
  nifas: number; // Air
  may: number; // Water
  dominantHumor: EthiopianHumor;
  secondaryHumor?: EthiopianHumor;
}

export interface ConstitutionQuizAnswer {
  questionId: string;
  category: "physical" | "mental" | "digestive" | "sleep" | "emotional" | "seasonal";
  selectedOption: string;
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
  esatScore: number;
  afereScore: number;
  nifasScore: number;
  mayScore: number;
}

export interface HolisticConstitutionProfile {
  profileId: string;
  assessedAt: string;
  dosha: DoshaPrakritiScore;
  humor: EthiopianHumoralScore;
  tcmConstitution: string;
  overallConstitutionNarrative: string;
  strengthsAndVulnerabilities: {
    physicalStrengths: string[];
    physicalVulnerabilities: string[];
    mentalStrengths: string[];
    mentalVulnerabilities: string[];
    digestiveNotes: string;
    immuneNotes: string;
  };
  seasonalGuidance: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
    kiremt: string; // Ethiopian rainy season
    bega: string; // Ethiopian dry season
  };
  dietaryProtocol: {
    favored: string[];
    reduce: string[];
    avoid: string[];
    cookingMethods: string[];
    spicesToEmphasize: string[];
    spicesToMinimize: string[];
  };
  lifestyleProtocol: {
    wakeUpTime: string;
    exerciseType: string;
    exerciseIntensity: string;
    meditationStyle: string;
    sleepSchedule: string;
    oilMassageFrequency: string;
    herbalTeas: string[];
  };
  ayurvedicHerbsForBalance: {
    herb: string;
    sanskritName: string;
    ethiopianEquivalent?: string;
    purpose: string;
    dosage: string;
    caution: string;
  }[];
}

// ==========================================
// PERSONALIZED CARE PLAN (NaraCare.AI)
// ==========================================

export type CarePlanPhase = "foundation" | "restore" | "optimize" | "maintain";

export interface CarePlanGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  priority: "critical" | "high" | "medium" | "low";
  category:
  | "nutrition" | "movement" | "sleep" | "stress" | "digestion"
  | "immunity" | "mental_clarity" | "longevity";
  metrics: {
    name: string;
    baseline: number;
    target: number;
    unit: string;
    currentValue?: number;
  }[];
  progress: number; // 0-100
}

export interface CarePlanIntervention {
  id: string;
  type:
  | "dietary" | "herbal" | "lifestyle" | "movement" | "breathwork"
  | "fasting" | "spiritual" | "scientific_referral";
  title: string;
  description: string;
  frequency: string;
  duration: string;
  timing: string;
  contraindications: string[];
  evidenceLevel: "traditional" | "preliminary" | "moderate" | "strong";
  ethiopianCulturalContext?: string;
}

export interface CarePlanWeek {
  weekNumber: number;
  phase: CarePlanPhase;
  focus: string;
  goals: string[];
  dailySchedule: {
    morning: string[];
    afternoon: string[];
    evening: string[];
    night: string[];
  };
  interventions: CarePlanIntervention[];
  checkInPrompts: string[];
}

export interface PersonalizedCarePlan {
  planId: string;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  duration: "4-weeks" | "8-weeks" | "12-weeks" | "6-months";
  currentPhase: CarePlanPhase;
  currentWeek: number;
  primarywellbeingGoals: string[];
  constitution: HolisticConstitutionProfile;
  weeklyPlans: CarePlanWeek[];
  overallProgress: number;
  aiInsight: string;
  nextMilestone: string;
  disclaimer: string;
}

// ==========================================
// HABIT & WELLBEING TRACKING (Thryval)
// ==========================================

export type HabitCategory =
  | "nutrition" | "hydration" | "movement" | "sleep" | "meditation"
  | "fasting" | "gratitude" | "herbal_medicine" | "social" | "prayer";

export interface HabitDefinition {
  id: string;
  name: string;
  nameAmharic?: string;
  category: HabitCategory;
  description: string;
  targetFrequency: "daily" | "weekly" | "x_per_week";
  targetCount: number; // per frequency period
  icon: string;
  color: string;
  reminderTime?: string;
  relatedConstitutionTypes: DoshaType[];
  relatedHumors: EthiopianHumor[];
}

export interface HabitEntry {
  habitId: string;
  date: string;
  completed: boolean;
  completedAt?: string;
  qualityRating?: number; // 1-5
  notes?: string;
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  lastCompletedDate?: string;
  weeklyConsistency: number; // 0-100
}

export interface MoodEntry {
  id: string;
  timestamp: string;
  overallMood: number; // 1-10
  energy: number; // 1-10
  anxiety: number; // 1-10
  digestion: number; // 1-10
  sleepQuality: number; // 1-10 (how well they slept the previous night)
  emotions: string[];
  physicalSymptoms: string[];
  notes?: string;
  contextTags: string[]; // e.g., "fasting", "coffee ceremony", "holiday"
}

export interface WellbeingJournal {
  userId: string;
  entries: {
    date: string;
    mood?: MoodEntry;
    meals: MealLog[];
    habits: HabitEntry[];
    sleepHours?: number;
    waterIntakeMl?: number;
    stepsCount?: number;
    notes?: string;
  }[];
  weeklyInsights: {
    weekStart: string;
    averageMood: number;
    averageEnergy: number;
    nutritionAdherence: number;
    habitConsistency: number;
    topPositivePattern: string;
    topImprovementArea: string;
    aiCoachMessage: string;
  }[];
}

// ==========================================
// INTEGRATED WELLNESS DASHBOARD
// ==========================================

export interface WellnessDashboardState {
  constitutionProfile?: HolisticConstitutionProfile;
  carePlan?: PersonalizedCarePlan;
  todaysMeals: MealLog[];
  todaysNutrition?: DailyNutritionSummary;
  habitDefinitions: HabitDefinition[];
  todaysHabits: HabitEntry[];
  habitStreaks: HabitStreak[];
  recentMoodEntries: MoodEntry[];
  tongueDiagnosisHistory: TongueDiagnosisResult[];
  weeklyInsight?: string;
}
