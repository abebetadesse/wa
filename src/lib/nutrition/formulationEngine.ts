import type { IngredientNutrient, ProcessingState } from "./ingredientComposition";

export interface NutritionProfile {
  profileUid: string;
  pseudonym: string;
  ageYears: number;
  biologicalSex: "female" | "male" | "other" | "undisclosed";
  physiologicalState: "none" | "pregnant" | "breastfeeding" | "menstruating" | "postmenopausal";
  pregnancyTrimester?: 1 | 2 | 3;
  weightKg?: number;
  activityLevel: "sedentary" | "light" | "moderate" | "vigorous" | "athlete";
  conditions: string[];
  allergies: string[];
  intolerances: string[];
  dietPattern: string;
  religiousRules: string[];
  dislikes: string[];
  locationUid: string;
  mealsPerDay: number;
  goal: "maintain" | "gain" | "loss" | "therapeutic" | "performance" | "recovery";
  consentVersion?: string;
  consentScope?: string[];
}

export interface RequirementSet {
  requirementUid: string;
  profileUid: string;
  energyKcal: number;
  energyLower: number;
  energyUpper: number;
  proteinG: number;
  fiberG: number;
  micronutrients: Record<string, number>;
  upperLimits: Record<string, number>;
  rationale: string[];
  guidelineSource: string;
  guidelineVersion: string;
}

export interface PreparationModifier {
  ingredientUid: string;
  preparationMethod: ProcessingState;
  nutrientRetention?: Record<string, number>;
  nutrientGain?: Record<string, number>;
  sourceUid?: string;
  evidenceLevel: "guideline" | "meta_analysis" | "observational" | "expert" | "not_verified";
}

export interface FormulationRequest {
  profile: NutritionProfile;
  requirements?: RequirementSet;
  candidateIngredients: string[];
  excludedIngredients?: string[];
  nutrients: IngredientNutrient[];
  preparations?: PreparationModifier[];
  includeMedicinalPlants?: boolean;
  therapeuticGoals?: string[];
  medicinalConstraints?: Record<string, string | number | string[]>;
}

export interface DebralFlag {
  flagType: "nutrient_deficiency" | "excess" | "compliance" | "review_required" | "data_gap";
  severity: "info" | "warning" | "high" | "critical";
  nutrient?: string;
  actualValue?: number;
  threshold?: number;
  message: string;
  recommendation?: string;
  requiresExpertReview: boolean;
}

export interface FormulationResult {
  formulationUid: string;
  requirementSet: RequirementSet;
  composition: Array<{ ingredientUid: string; preparationMethod: ProcessingState; gramsPerDay: number }>;
  totals: Record<string, number>;
  adequacy: Record<string, { target: number; actual: number; percent: number; status: "adequate" | "marginal" | "low" | "exceeds_limit" }>;
  flags: DebralFlag[];
  provenance: { sourceIds: string[]; engineVersion: string; generatedAt: string };
  status: "draft" | "requires_expert_review" | "blocked";
}

const ENGINE_VERSION = "formulation-engine-1.0.0";
const CONDITION_RULES: Record<string, { rationale: string; upperLimits?: Record<string, number> }> = {
  diabetes_t2: { rationale: "Use lower glycaemic-load preferences and a fibre floor; confirm targets with a Debrian.", upperLimits: { CHOAVLDF: 275 } },
  hypertension: { rationale: "Apply a sodium ceiling; potassium targets require kidney-function review.", upperLimits: { NA: 1500 } },
  celiac: { rationale: "Exclude wheat, barley, and rye ingredients." },
  lactose_intolerance: { rationale: "Avoid or limit lactose-containing ingredients." },
  ckd: { rationale: "Protein, potassium, phosphorus, and fluid targets require stage-specific Debrian input.", upperLimits: { NA: 2000, K: 3000, P: 800 } },
};

export function resolveRequirements(profile: NutritionProfile): RequirementSet {
  const weight = profile.weightKg ?? 60;
  const multiplier = profile.activityLevel === "athlete" ? 35 : profile.activityLevel === "vigorous" ? 32 : profile.activityLevel === "moderate" ? 30 : profile.activityLevel === "light" ? 28 : 25;
  let energy = Math.round(multiplier * weight);
  let protein = Math.max(0.8 * weight, profile.goal === "performance" ? 1.2 * weight : 0.8 * weight);
  const rationale = ["Weight-based planning estimate; replace with validated Debral calculation when available."];
  if (profile.physiologicalState === "pregnant") {
    energy += profile.pregnancyTrimester === 3 ? 450 : profile.pregnancyTrimester === 2 ? 340 : 0;
    protein += 25;
    rationale.push("Pregnancy adjustment is a planning reference and requires Debrian review.");
  }
  if (profile.physiologicalState === "breastfeeding") { energy += 500; protein += 25; }
  if (profile.goal === "loss") energy = Math.max(1200, energy - 500);
  if (profile.goal === "gain") energy += 300;
  const upperLimits: Record<string, number> = {};
  for (const condition of profile.conditions) {
    if (CONDITION_RULES[condition]?.upperLimits) Object.assign(upperLimits, CONDITION_RULES[condition].upperLimits);
    if (CONDITION_RULES[condition]) rationale.push(CONDITION_RULES[condition].rationale);
  }
  return {
    requirementUid: `req:${profile.profileUid}:${Date.now()}`,
    profileUid: profile.profileUid,
    energyKcal: energy,
    energyLower: Math.round(energy * 0.95),
    energyUpper: Math.round(energy * 1.05),
    proteinG: Math.round(protein),
    fiberG: profile.conditions.includes("diabetes_t2") ? 30 : 25,
    micronutrients: { FE: 11, ZN: 8, CA: 1000, VITC: 75 },
    upperLimits,
    rationale,
    guidelineSource: "planning-reference",
    guidelineVersion: "2026-09",
  };
}

function applyModifier(value: number, code: string, modifier?: PreparationModifier): number {
  return value * (modifier?.nutrientRetention?.[code] ?? 1) + (modifier?.nutrientGain?.[code] ?? 0);
}

export function formulate(request: FormulationRequest): FormulationResult {
  const requirementSet = request.requirements ?? resolveRequirements(request.profile);
  const flags: DebralFlag[] = [];
  if (request.includeMedicinalPlants) {
    flags.push({ flagType: "review_required", severity: "high", message: "Medicinal plants are included as a constrained cultural-reference domain, not as validated treatment.", recommendation: "Require Debrian, pharmacist, and cultural-review approval before release.", requiresExpertReview: true });
  }
  if (!request.profile.consentVersion || !request.profile.consentScope?.includes("formulation")) {
    flags.push({ flagType: "compliance", severity: "critical", message: "Formulation consent is required.", recommendation: "Collect explicit formulation consent.", requiresExpertReview: false });
  }
  for (const condition of request.profile.conditions) {
    if (!CONDITION_RULES[condition]) flags.push({ flagType: "review_required", severity: "critical", message: `No supported formulation rule exists for ${condition}.`, recommendation: "Obtain expert rule approval before formulation.", requiresExpertReview: true });
  }
  const excluded = new Set([...(request.excludedIngredients ?? []), ...request.profile.dislikes]);
  const pool = request.candidateIngredients.filter((uid) => !excluded.has(uid));
  const relevant = request.nutrients.filter((item) => pool.includes(item.ingredientUid) && item.intendedUse === "human_food");
  if (!relevant.length) flags.push({ flagType: "data_gap", severity: "critical", message: "No cited human-food composition records are available.", recommendation: "Load validated human-food composition data.", requiresExpertReview: true });
  const energyByIngredient = new Map<string, number>();
  for (const item of relevant) if (item.nutrientCode === "ENERC") energyByIngredient.set(item.ingredientUid, item.value / 100);
  const selected = pool.filter((uid) => (energyByIngredient.get(uid) ?? 0) > 0).slice(0, 8);
  const energyDensity = selected.reduce((sum, uid) => sum + (energyByIngredient.get(uid) ?? 0), 0);
  const gramsTotal = energyDensity > 0 ? requirementSet.energyKcal / energyDensity : 0;
  const composition = selected.map((ingredientUid) => ({ ingredientUid, preparationMethod: "cooked" as ProcessingState, gramsPerDay: Math.round((gramsTotal / Math.max(1, selected.length)) * 10) / 10 }));
  const totals: Record<string, number> = {};
  for (const item of composition) for (const nutrient of relevant.filter((candidate) => candidate.ingredientUid === item.ingredientUid)) {
    totals[nutrient.nutrientCode] = (totals[nutrient.nutrientCode] ?? 0) + applyModifier(nutrient.value, nutrient.nutrientCode, request.preparations?.find((modifier) => modifier.ingredientUid === item.ingredientUid)) * item.gramsPerDay / 100;
  }
  const adequacy: FormulationResult["adequacy"] = {};
  for (const [code, target] of Object.entries({ ENERC: requirementSet.energyKcal, PROCNT: requirementSet.proteinG, FIBTG: requirementSet.fiberG, ...requirementSet.micronutrients })) {
    const actual = totals[code] ?? 0;
    const percent = target ? actual / target * 100 : 0;
    const limit = requirementSet.upperLimits[code];
    const status = limit !== undefined && actual > limit ? "exceeds_limit" : percent < 70 ? "low" : percent < 90 ? "marginal" : "adequate";
    adequacy[code] = { target, actual, percent, status };
    if (status === "low") flags.push({ flagType: "nutrient_deficiency", severity: percent < 60 ? "high" : "warning", nutrient: code, actualValue: actual, threshold: target, message: `${code} is below the planning target.`, recommendation: "Review ingredients and obtain expert nutrition review.", requiresExpertReview: true });
    if (status === "exceeds_limit") flags.push({ flagType: "excess", severity: "high", nutrient: code, actualValue: actual, threshold: limit, message: `${code} exceeds its configured upper limit.`, recommendation: "Do not use without Debral review.", requiresExpertReview: true });
  }
  const blocked = flags.some((flag) => flag.severity === "critical");
  return {
    formulationUid: `form:${request.profile.profileUid}:${Date.now()}`,
    requirementSet, composition, totals, adequacy, flags,
    provenance: { sourceIds: [...new Set(relevant.map((item) => item.sourceUid))], engineVersion: ENGINE_VERSION, generatedAt: new Date().toISOString() },
    status: blocked ? "blocked" : flags.some((flag) => flag.requiresExpertReview) ? "requires_expert_review" : "draft",
  };
}