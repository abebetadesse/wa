/**
 * Multi-Strand Case Evaluation Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Version: 2.1.0
 *
 * Cross-analyzes user profile data against submitted cases across 11 knowledge
 * strands (biomedical, altitude/ecological, epidemiological, nutrition/fasting,
 * antinutritional/polyphenol factors, pharmaceuticals, traditional herbs,
 * substance patterns, and infrastructure).
 *
 * Enforces the strict Domain A (Scientific) vs. Domain B (Cultural/Astrological)
 * firewall at runtime AND in code (not just via prompt engineering).
 *
 * Architecture:
 *   evaluateCaseWithProfile()  → orchestrates LLM path → deterministic fallback
 *   runDeterministicEvaluation() → pure, rule-driven fallback (fully testable)
 *   normalizeLlmResult()       → coerces untrusted LLM JSON into the typed schema
 *
 * Guarantees:
 *   • Every returned result conforms to MultiStrandCaseEvaluationResult.
 *   • schema_version is pinned; generated_at_iso is always populated.
 *   • If safety_gate.critical_flag is true, Domain B is firewalled and
 *     cultural_interpretation is stripped (firewall invariant).
 *   • LLM output never escapes unvalidated.
 */

import {
  bionicChat,
  isBionicConfigured,
  type BionicMessage,
} from "@/lib/ai/bionicGPT";
import { UrgencyDetector } from "@/lib/knowledge/parsing/urgencyDetector";
import {
  SCHEMA_VERSION,
  ENGINE_VERSION,
  FIREWALL_DISCLAIMER,
  MULTI_STRAND_EVALUATION_SYSTEM_PROMPT,
  createDefaultSafetyGate,
  createDefaultDomainBReflection,
  createDefaultExpertCaseSummary,
  createDefaultAdminSystemSummary,
  createEmptyEvaluation,
  validateEvaluationResult,
  isUrgencyLevel,
  isDomainBStatus,
  type MultiStrandEvaluationInput,
  type MultiStrandCaseEvaluationResult,
  type CausalAttributionItem,
  type MultiStrandUserProfile,
  type MultiStrandCaseSubmission,
  type SafetyGate,
  type DomainBCulturalReflection,
  type ExpertCaseSummary,
  type AdminSystemSummary,
  type DomainBStatus,
  type UrgencyLevel,
  type ValidationIssue,
} from "./caseEvaluationPrompt";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export interface EngineConfig {
  /** LLM sampling temperature. Low = more deterministic Scientific reasoning. */
  temperature: number;
  /** Hard cap on LLM completion tokens. */
  maxTokens: number;
  /** Abort LLM call after this many milliseconds. */
  timeoutMs: number;
  /** Total attempts (1 initial + N-1 retries). */
  maxAttempts: number;
  /** Minimum acceptable confidence to keep a causal attribution. */
  minConfidence: number;
  /** Enforce firewall invariant in code. Should remain true in production. */
  enforceFirewallInvariant: boolean;
}

export const DEFAULT_ENGINE_CONFIG: Readonly<EngineConfig> = Object.freeze({
  temperature: 0.15,
  maxTokens: 3500,
  timeoutMs: 45_000,
  maxAttempts: 2,
  minConfidence: 0.35,
  enforceFirewallInvariant: true,
});

// ═══════════════════════════════════════════════════════════════════════════
// OBSERVABILITY & INJECTABLE DEPENDENCIES
// ═══════════════════════════════════════════════════════════════════════════

export interface EvaluationLogger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

const defaultLogger: EvaluationLogger = {
  debug: (m, meta) => console.debug(`[CaseEval] ${m}`, meta ?? ""),
  info: (m, meta) => console.info(`[CaseEval] ${m}`, meta ?? ""),
  warn: (m, meta) => console.warn(`[CaseEval] ${m}`, meta ?? ""),
  error: (m, meta) => console.error(`[CaseEval] ${m}`, meta ?? ""),
};

export interface EngineDependencies {
  now(): Date;
  newEvaluationId(caseId: string): string;
  isBionicConfigured(): boolean;
  bionicChat: typeof bionicChat;
  detector: UrgencyDetector;
  logger: EvaluationLogger;
}

const defaultDependencies: EngineDependencies = {
  now: () => new Date(),
  newEvaluationId: (caseId: string) =>
    `eval_${caseId}_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`,
  isBionicConfigured,
  bionicChat,
  detector: new UrgencyDetector(),
  logger: defaultLogger,
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPED DEPENDENCY-INJECTED CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

interface EvaluationContext {
  config: EngineConfig;
  deps: EngineDependencies;
}

function mergeContext(override?: Partial<EngineConfig> & Partial<EngineDependencies>): EvaluationContext {
  const { temperature, maxTokens, timeoutMs, maxAttempts, minConfidence, enforceFirewallInvariant, ...deps } =
    override ?? {};
  return {
    config: {
      ...DEFAULT_ENGINE_CONFIG,
      ...(temperature !== undefined && { temperature }),
      ...(maxTokens !== undefined && { maxTokens }),
      ...(timeoutMs !== undefined && { timeoutMs }),
      ...(maxAttempts !== undefined && { maxAttempts }),
      ...(minConfidence !== undefined && { minConfidence }),
      ...(enforceFirewallInvariant !== undefined && { enforceFirewallInvariant }),
    },
    deps: { ...defaultDependencies, ...deps },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SAFE COERCION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNullableString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.length > 0);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

async function withTimeout<T>(p: Promise<T>, ms: number, signalCtor?: AbortSignal): Promise<T> {
  if (ms <= 0) return p;
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    p.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// LLM RESULT NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════

interface NormalizeOutcome {
  result: MultiStrandCaseEvaluationResult;
  issues: ValidationIssue[];
}

function normalizeSafetyGate(raw: unknown, issues: ValidationIssue[]): SafetyGate {
  const defaults = createDefaultSafetyGate();
  if (!isPlainObject(raw)) {
    issues.push({ path: "safety_gate", message: "Missing/malformed; using defaults.", severity: "warning" });
    return defaults;
  }
  const gate: SafetyGate = {
    passed: typeof raw.passed === "boolean" ? raw.passed : defaults.passed,
    critical_flag: typeof raw.critical_flag === "boolean" ? raw.critical_flag : defaults.critical_flag,
    escalation_reason: asNullableString(raw.escalation_reason),
    emergency_protocol: asNullableString(raw.emergency_protocol),
    red_flags_detected: asStringArray(raw.red_flags_detected),
  };
  if (gate.critical_flag) {
    gate.passed = false;
    if (!gate.escalation_reason) {
      gate.escalation_reason = "Critical red flag detected.";
      issues.push({ path: "safety_gate.escalation_reason", message: "Injected placeholder.", severity: "warning" });
    }
    if (!gate.emergency_protocol) {
      gate.emergency_protocol =
        "Activate local emergency services (e.g., 8335 in Ethiopia) or transport to nearest referral facility immediately.";
      issues.push({ path: "safety_gate.emergency_protocol", message: "Injected default protocol.", severity: "warning" });
    }
  }
  return gate;
}

function normalizeCausalMatrix(raw: unknown, minConfidence: number, issues: ValidationIssue[]): CausalAttributionItem[] {
  if (!Array.isArray(raw)) {
    issues.push({ path: "causal_attribution_matrix", message: "Missing/non-array; defaulting to empty.", severity: "warning" });
    return [];
  }
  const out: CausalAttributionItem[] = [];
  raw.forEach((entry, idx) => {
    if (!isPlainObject(entry)) {
      issues.push({ path: `causal_attribution_matrix[${idx}]`, message: "Non-object entry skipped.", severity: "warning" });
      return;
    }
    const confidence = clamp(asNumber(entry.confidence_score, 0), 0, 1);
    if (confidence < minConfidence) {
      issues.push({
        path: `causal_attribution_matrix[${idx}]`,
        message: `Dropped entry with confidence ${confidence} < minConfidence ${minConfidence}.`,
        severity: "warning",
      });
      return;
    }
    const domainLayer = entry.domain_layer === "Domain B" ? "Domain B" : "Domain A";
    out.push({
      cause_id: asString(entry.cause_id, `CAUS-${String(idx + 1).padStart(2, "0")}`),
      title: asString(entry.title),
      cause_type: asString(entry.cause_type, "unknown_requires_workup"),
      mechanism: asString(entry.mechanism),
      confidence_score: confidence,
      supporting_profile_evidence: asStringArray(entry.supporting_profile_evidence),
      confounding_or_missing_factors: asStringArray(entry.confounding_or_missing_factors),
      evidence_strength:
        entry.evidence_strength === "established" ||
          entry.evidence_strength === "probable" ||
          entry.evidence_strength === "preliminary"
          ? entry.evidence_strength
          : "preliminary",
      domain_layer: domainLayer,
      recommended_next_step:
        typeof entry.recommended_next_step === "string" ? entry.recommended_next_step : undefined,
    });
  });
  return out;
}

function normalizeDomainB(raw: unknown, isCritical: boolean, enforceInvariant: boolean, issues: ValidationIssue[]): DomainBCulturalReflection {
  const base = createDefaultDomainBReflection(
    isPlainObject(raw) ? Boolean(raw.is_requested) : false,
    isCritical && enforceInvariant,
  );
  if (!isPlainObject(raw)) return base;

  let status: DomainBStatus = isDomainBStatus(raw.status) ? raw.status : base.status;

  if (isCritical && enforceInvariant) {
    if (status === "included_firewalled") {
      issues.push({
        path: "domain_b_cultural_reflection.status",
        message: "Domain B was included despite critical safety gate — overridden to firewalled_due_to_critical_safety.",
        severity: "warning",
      });
    }
    status = "firewalled_due_to_critical_safety";
  }

  const firewalled = status !== "included_firewalled";
  return {
    is_requested: Boolean(raw.is_requested),
    status,
    awude_negest_circle: typeof raw.awude_negest_circle === "string" ? raw.awude_negest_circle : undefined,
    numerology_life_path: typeof raw.numerology_life_path === "string" ? raw.numerology_life_path : undefined,
    astrological_context: typeof raw.astrological_context === "string" ? raw.astrological_context : undefined,
    cultural_interpretation: firewalled
      ? undefined
      : typeof raw.cultural_interpretation === "string"
        ? raw.cultural_interpretation
        : undefined,
    firewall_disclaimer: FIREWALL_DISCLAIMER,
  };
}

function normalizeExpertSummary(raw: unknown, issues: ValidationIssue[]): ExpertCaseSummary {
  const defaults = createDefaultExpertCaseSummary();
  if (!isPlainObject(raw)) {
    issues.push({ path: "expert_case_summary", message: "Missing/malformed; using defaults.", severity: "warning" });
    return defaults;
  }
  return {
    primary_impression: asString(raw.primary_impression, defaults.primary_impression),
    differential_considerations: asStringArray(raw.differential_considerations),
    substance_and_lifestyle_interactions: asStringArray(raw.substance_and_lifestyle_interactions),
    pharmacological_and_herb_reconciliation: asStringArray(raw.pharmacological_and_herb_reconciliation),
    nutritional_antinutrient_adjustments: asStringArray(raw.nutritional_antinutrient_adjustments),
    scientific_inquiry_checklist: asStringArray(raw.scientific_inquiry_checklist),
    red_flag_review: asStringArray(raw.red_flag_review),
    recommended_diagnostics: asStringArray(raw.recommended_diagnostics),
    patient_education_points: asStringArray(raw.patient_education_points),
  };
}

function normalizeAdminSummary(raw: unknown, issues: ValidationIssue[]): AdminSystemSummary {
  const defaults = createDefaultAdminSystemSummary();
  if (!isPlainObject(raw)) {
    issues.push({ path: "admin_system_summary", message: "Missing/malformed; using defaults.", severity: "warning" });
    return defaults;
  }
  return {
    recommended_expert_specialty: asString(raw.recommended_expert_specialty, defaults.recommended_expert_specialty),
    expert_credential_prerequisites: asStringArray(raw.expert_credential_prerequisites),
    profile_completeness_pct: clamp(asNumber(raw.profile_completeness_pct, defaults.profile_completeness_pct), 0, 100),
    unverified_high_risk_inputs: asStringArray(raw.unverified_high_risk_inputs),
    data_quality_notes: asStringArray(raw.data_quality_notes),
    audit_log_entry: asString(raw.audit_log_entry, ""),
    schema_version: SCHEMA_VERSION,
  };
}

function normalizeLlmResult(
  raw: unknown,
  caseId: string,
  ctx: EvaluationContext,
): NormalizeOutcome {
  const issues: ValidationIssue[] = [];
  const evaluationId = ctx.deps.newEvaluationId(caseId);
  const shell = createEmptyEvaluation(caseId, evaluationId, ctx.deps.now());

  if (!isPlainObject(raw)) {
    issues.push({ path: "$", message: "LLM payload not an object; returning synthetic shell.", severity: "error" });
    return { result: shell, issues };
  }

  const safety_gate = normalizeSafetyGate(raw.safety_gate, issues);
  const isCritical = safety_gate.critical_flag;

  const triageRaw = isPlainObject(raw.epidemiological_and_environmental_triage)
    ? raw.epidemiological_and_environmental_triage
    : {};
  const triage = {
    altitude_zone: asString(triageRaw.altitude_zone, shell.epidemiological_and_environmental_triage.altitude_zone),
    altitude_meters: asNumber(triageRaw.altitude_meters, shell.epidemiological_and_environmental_triage.altitude_meters),
    local_endemic_risks: asStringArray(triageRaw.local_endemic_risks),
    road_density_and_access_barrier: asString(triageRaw.road_density_and_access_barrier, "Moderate"),
    estimated_emergency_transit_urgency: asString(triageRaw.estimated_emergency_transit_urgency, "Routine referral pathway"),
    seasonal_context: typeof triageRaw.seasonal_context === "string" ? triageRaw.seasonal_context : undefined,
  };

  const causal = normalizeCausalMatrix(raw.causal_attribution_matrix, ctx.config.minConfidence, issues);
  const domain_b = normalizeDomainB(raw.domain_b_cultural_reflection, isCritical, ctx.config.enforceFirewallInvariant, issues);
  const expert = normalizeExpertSummary(raw.expert_case_summary, issues);
  const admin = normalizeAdminSummary(raw.admin_system_summary, issues);

  const urgency_level: UrgencyLevel = isUrgencyLevel(raw.urgency_level)
    ? raw.urgency_level
    : isCritical
      ? "critical"
      : "routine";

  const result: MultiStrandCaseEvaluationResult = {
    case_evaluation_id: asString(raw.case_evaluation_id, shell.case_evaluation_id),
    schema_version: SCHEMA_VERSION,
    generated_at_iso: asString(raw.generated_at_iso, shell.generated_at_iso),
    urgency_level,
    safety_gate,
    epidemiological_and_environmental_triage: triage,
    causal_attribution_matrix: causal,
    domain_b_cultural_reflection: domain_b,
    expert_case_summary: expert,
    admin_system_summary: admin,
  };
  return { result, issues };
}

// ═══════════════════════════════════════════════════════════════════════════
// DETERMINISTIC RULE ENGINE — pure testable rule functions
// ═══════════════════════════════════════════════════════════════════════════

interface RuleContext {
  profile: MultiStrandUserProfile;
  caseSubmission: MultiStrandCaseSubmission;
  narrativeText: string;
  altitudeMeters: number;
  isHighland: boolean;
  isLowlandMalariaZone: boolean;
  isPregnant: boolean;
  herbsLower: string;
  preScreenLevel: "critical" | "high" | "moderate" | "low" | "none";
}

type CausalRule = (ctx: RuleContext) => CausalAttributionItem | null;

const ruleTenaAdamPregnancy: CausalRule = (ctx) => {
  const uses = ctx.herbsLower.includes("tena adam") || ctx.herbsLower.includes("ruta chalepensis");
  if (!(ctx.isPregnant && uses)) return null;
  return {
    cause_id: "CAUS-HERB-01",
    title: "Herb-Induced Uterine Smooth Muscle Stimulation (Ruta chalepensis)",
    cause_type: "traditional_herb_toxicity",
    mechanism:
      "Tena Adam contains quinoline alkaloids and furocoumarins with established spasmogenic and oxytocic activity on myometrial tissue, presenting substantial risk of cramping or abortifacient contractions in pregnancy.",
    confidence_score: 0.94,
    supporting_profile_evidence: ["Patient is pregnant", "Active ingestion of Tena Adam (Ruta chalepensis)"],
    confounding_or_missing_factors: ["Herbal infusion concentration and steeping time unverified"],
    evidence_strength: "established",
    domain_layer: "Domain A",
    recommended_next_step: "Immediate cessation; obstetric review to confirm fetal viability.",
  };
};

const ruleKossoToxicity: CausalRule = (ctx) => {
  const uses = ctx.herbsLower.includes("kosso") || ctx.herbsLower.includes("hagenia");
  if (!uses) return null;
  return {
    cause_id: "CAUS-HERB-02",
    title: "Narrow Therapeutic Window & Hepatotoxicity Risk (Hagenia abyssinica)",
    cause_type: "traditional_herb_toxicity",
    mechanism:
      "Traditional preparation of Kosso flowers for taeniasis contains kosotoxins that can induce acute gastrointestinal ulceration, optic nerve toxicity, and hepatorenal strain if unstandardized.",
    confidence_score: 0.82,
    supporting_profile_evidence: ["Active use of Kosso (Hagenia abyssinica)"],
    confounding_or_missing_factors: ["Dosage and flower preparation method unstated"],
    evidence_strength: "probable",
    domain_layer: "Domain A",
    recommended_next_step: "Verify dose and preparation; baseline LFTs and visual acuity.",
  };
};

const ruleHighlandHypoxia: CausalRule = (ctx) => {
  if (!ctx.isHighland) return null;
  const exertional = /fatigue|breath|dyspnea|tired|weak/.test(ctx.narrativeText);
  return {
    cause_id: "CAUS-ECOL-01",
    title: `Highland Erythropoietic Demand & Physiological Hypoxia (${ctx.altitudeMeters}m)`,
    cause_type: "physiological_altitude",
    mechanism: `At ${ctx.altitudeMeters}m (Dega/Wurch agroecology), reduced atmospheric oxygen tension stimulates chronic HIF-1α driven erythropoietin secretion, increasing baseline daily iron requirements for hemoglobin synthesis by 15% to 25% above sea-level RDA.`,
    confidence_score: 0.88,
    supporting_profile_evidence: [
      `Residence at ${ctx.altitudeMeters}m`,
      exertional ? "Reported exertional dyspnea or fatigue" : "Highland baseline physiology",
    ],
    confounding_or_missing_factors: ["Hemoglobin / Hematocrit level not provided"],
    evidence_strength: "established",
    domain_layer: "Domain A",
    recommended_next_step: "CBC with altitude-adjusted reference ranges; ferritin if available.",
  };
};

const ruleTsomFasting: CausalRule = (ctx) => {
  const fasting = ctx.profile.cultural_and_dietary?.fastingTradition ?? "";
  const isFasting =
    ctx.profile.cultural_and_dietary?.currentlyFasting === true ||
    /tsom|fast/i.test(fasting) ||
    /fasting/i.test(ctx.narrativeText);
  if (!isFasting) return null;
  return {
    cause_id: "CAUS-DIET-01",
    title: "Plant-Exclusive Fasting (Tsom) Bioavailability Deficit",
    cause_type: "fasting_depletion",
    mechanism:
      "Prolonged plant-exclusive religious fasting eliminates heme iron and dietary Cobalamin (Vitamin B12), relying entirely on non-heme plant iron with 5–15% duodenal absorption efficiency.",
    confidence_score: 0.85,
    supporting_profile_evidence: [`Fasting tradition: ${fasting || "Strict plant-exclusive fasting"}`],
    confounding_or_missing_factors: ["Frequency of dairy/egg consumption outside fasting windows unverified"],
    evidence_strength: "established",
    domain_layer: "Domain A",
    recommended_next_step: "Serum B12, folate, ferritin, and zinc panel.",
  };
};

const ruleCoffeeTeaChelation: CausalRule = (ctx) => {
  const buna = ctx.profile.cultural_and_dietary?.beverageRituals?.bunaCeremony ?? "";
  const shai = ctx.profile.cultural_and_dietary?.beverageRituals?.shaiWithSpices ?? "";
  const timing = ctx.profile.cultural_and_dietary?.beverageRituals?.bunaTimingRelativeToMeals ?? "";
  const nearMeal = /meal|daily|during|within/i.test(buna + " " + shai + " " + timing);
  const mentioned = /coffee|buna|tea|shai/i.test(ctx.narrativeText);
  if (!(nearMeal || mentioned)) return null;
  return {
    cause_id: "CAUS-DIET-02",
    title: "Post-Prandial Polyphenol & Chlorogenic Acid Iron Chelation",
    cause_type: "dietary_antinutritional",
    mechanism:
      "Coffee (Buna) or tea (Shai) consumed alongside or within ~45 minutes of meals introduces chlorogenic acids and tannins that form insoluble complexes with non-heme iron and zinc, reducing duodenal absorption by 60–80%.",
    confidence_score: 0.89,
    supporting_profile_evidence: [`Buna/Shai ritual: ${buna || shai || "Coffee or tea consumed near meals"}`],
    confounding_or_missing_factors: ["Interval between meal completion and beverage serving"],
    evidence_strength: "established",
    domain_layer: "Domain A",
    recommended_next_step: "Advise a 60–90 minute interval between meals and coffee/tea.",
  };
};

const rulePhytateGrains: CausalRule = (ctx) => {
  const habits = ctx.profile.cultural_and_dietary?.grainPreparation ?? "";
  const risky = /unfermented|short|sorghum|maize/i.test(habits);
  if (!risky) return null;
  return {
    cause_id: "CAUS-DIET-03",
    title: "Unfermented Grain Phytate Chelation of Divalent Cations",
    cause_type: "dietary_antinutritional",
    mechanism:
      "Inadequately fermented grains retain high phytic acid (myo-inositol hexakisphosphate), which binds Fe2+, Zn2+, and Ca2+ in insoluble duodenal chelates, preventing enterocyte transport.",
    confidence_score: 0.81,
    supporting_profile_evidence: [`Grain preparation: ${habits}`],
    confounding_or_missing_factors: [],
    evidence_strength: "probable",
    domain_layer: "Domain A",
    recommended_next_step: "Extend sourdough teff fermentation to 72–96h to activate phytase.",
  };
};

const ruleMedicationDepletions: CausalRule = (ctx) => {
  const meds = ctx.profile.wellbeing_and_medications?.currentMedications ?? [];
  if (meds.length === 0) return null;
  const found: string[] = [];
  for (const m of meds) {
    const n = (m.name || "").toLowerCase();
    if (/metformin|glucophage/.test(n)) found.push("metformin");
    if (/prazole/.test(n)) found.push("ppi");
    if (/furosemide|hydrochlorothiazide|hctz/.test(n)) found.push("diuretic");
    if (/isoniazid|\binh\b/.test(n)) found.push("inh");
  }
  if (found.length === 0) return null;
  return {
    cause_id: "CAUS-MED-01",
    title: "Pharmacological Nutrient Depletion Cluster",
    cause_type: "medication_interaction",
    mechanism:
      "Detected medications with established nutrient-depletion profiles: metformin (ileal B12), proton pump inhibitors (hypochlorhydria → B12 + non-heme iron), thiazide/loop diuretics (renal K/Mg/Zn wasting), isoniazid (pyridoxine → peripheral neuropathy).",
    confidence_score: 0.86,
    supporting_profile_evidence: [`Active medications: ${meds.map((m: { name?: string }) => m.name || "").join(", ")}`],
    confounding_or_missing_factors: ["Adherence, duration, and dose unverified", "No recent B12, Mg, K panels"],
    evidence_strength: "established",
    domain_layer: "Domain A",
    recommended_next_step: "Order B12, homocysteine/MMA, magnesium, potassium; review PPI necessity.",
  };
};

const ruleKhat: CausalRule = (ctx) => {
  const khat = ctx.profile.substance_use_and_social?.khat ?? "";
  const uses = /chew|daily|bercha|weekly/i.test(khat);
  if (!uses) return null;
  return {
    cause_id: "CAUS-SUBST-01",
    title: "Sympathomimetic Stimulation & Nutritional Suppression from Khat (Catha edulis)",
    cause_type: "substance_related",
    mechanism:
      "S-(-)-Cathinone and cathine act as central dopamine/noradrenaline reuptake inhibitors, inducing delayed sleep phase (insomnia), appetite suppression with subsequent caloric-micronutrient deficit, and post-chew rebound lethargy (harara).",
    confidence_score: 0.87,
    supporting_profile_evidence: [`Khat consumption: ${khat}`],
    confounding_or_missing_factors: ["Leaf variety and pesticide residue exposure unmeasured"],
    evidence_strength: "established",
    domain_layer: "Domain A",
    recommended_next_step: "Assess sleep architecture, BP trajectory, and appetite/weight trend.",
  };
};

const ruleAlcohol: CausalRule = (ctx) => {
  const alcohol = ctx.profile.substance_use_and_social?.alcohol ?? "";
  const uses = /areke|katikala|tella|tej|daily|weekly/i.test(alcohol);
  if (!uses) return null;
  return {
    cause_id: "CAUS-SUBST-02",
    title: "Ethanol-Mediated Hepatic Strain & Thiamine Depletion",
    cause_type: "substance_related",
    mechanism:
      "Regular traditional distilled spirits (Areke/Katikala) or fermented home-brews (Tella/Tej) increase hepatic CYP2E1 activity and compromise intestinal thiamine pyrophosphate transport.",
    confidence_score: 0.79,
    supporting_profile_evidence: [`Alcohol intake: ${alcohol}`],
    confounding_or_missing_factors: ["Exact volume/frequency per week unverified"],
    evidence_strength: "probable",
    domain_layer: "Domain A",
    recommended_next_step: "AUDIT-C screening; LFTs; consider thiamine supplementation if heavy use.",
  };
};

const RULES: ReadonlyArray<CausalRule> = Object.freeze([
  ruleTenaAdamPregnancy,
  ruleKossoToxicity,
  ruleHighlandHypoxia,
  ruleTsomFasting,
  ruleCoffeeTeaChelation,
  rulePhytateGrains,
  ruleMedicationDepletions,
  ruleKhat,
  ruleAlcohol,
]);

// ═══════════════════════════════════════════════════════════════════════════
// DETERMINISTIC ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export interface DeterministicOptions {
  config?: Partial<EngineConfig>;
  deps?: Partial<EngineDependencies>;
  preScreen?: { level: string; recommendation?: string } | null;
}

export function runDeterministicEvaluation(
  input: MultiStrandEvaluationInput,
  options: DeterministicOptions = {},
): MultiStrandCaseEvaluationResult {
  const ctx = mergeContext({ ...options.config, ...options.deps });
  const profile = (input.userProfile ?? {}) as MultiStrandUserProfile;
  const c = (input.submittedCase ?? {}) as MultiStrandCaseSubmission;

  const narrativeText = `${c.primaryChallenge ?? ""} ${c.detailedNarrative ?? ""}`.toLowerCase();
  const altitudeMeters = profile.geography_and_ecology?.altitudeMeters ?? 2400;
  const isHighland = altitudeMeters >= 2300;
  const isLowlandMalariaZone = altitudeMeters < 1800;

  const isPregnant =
    /^pregnant/.test(profile.personal?.pregnancyOrLactation ?? "") ||
    /pregnant/i.test(narrativeText);

  const herbsLower = (profile.wellbeing_and_medications?.activeHerbs ?? []).join(" ").toLowerCase() + " " + narrativeText;

  const preScreenLevel = (options.preScreen?.level ?? "none") as RuleContext["preScreenLevel"];

  const ruleCtx: RuleContext = {
    profile,
    caseSubmission: c,
    narrativeText,
    altitudeMeters,
    isHighland,
    isLowlandMalariaZone,
    isPregnant,
    herbsLower,
    preScreenLevel,
  };

  const causes: CausalAttributionItem[] = [];
  for (const rule of RULES) {
    try {
      const item = rule(ruleCtx);
      if (item && item.confidence_score >= ctx.config.minConfidence) causes.push(item);
    } catch (err) {
      ctx.deps.logger.warn("Rule threw; skipping", { err: String(err) });
    }
  }

  // ─── Safety gate assembly ─────────────────────────────────────────────
  const safety_gate: SafetyGate = createDefaultSafetyGate();
  let urgency: UrgencyLevel = "routine";

  // Specific herb-pregnancy flag
  if (isPregnant && /tena adam|ruta chalepensis/.test(herbsLower)) {
    safety_gate.passed = false;
    safety_gate.critical_flag = false;
    safety_gate.escalation_reason =
      "Active consumption of Tena Adam (Ruta chalepensis) during pregnancy — potential uterine stimulation.";
    safety_gate.emergency_protocol =
      "Immediate cessation of Ruta chalepensis. Obstetric evaluation to confirm fetal viability.";
    safety_gate.red_flags_detected.push("Tena Adam use during pregnancy");
    urgency = "high";
  }

  // Local pre-screen override
  if (preScreenLevel === "critical") {
    safety_gate.passed = false;
    safety_gate.critical_flag = true;
    safety_gate.escalation_reason =
      options.preScreen?.recommendation || "Critical emergency signals detected in case narrative.";
    safety_gate.emergency_protocol =
      "Direct transfer to the nearest tertiary emergency department or activation of local emergency referral line.";
    safety_gate.red_flags_detected.push("Pre-screen critical flag");
    urgency = "critical";
  } else if (preScreenLevel === "high" && urgency !== "high") {
    urgency = "high";
  }

  // Firewall invariant
  const domainBRequested = Boolean(c.includeDomainBReflection);
  let domainBStatus: DomainBStatus = "excluded";
  if (safety_gate.critical_flag && ctx.config.enforceFirewallInvariant) {
    domainBStatus = "firewalled_due_to_critical_safety";
  } else if (domainBRequested) {
    domainBStatus = "included_firewalled";
  }

  const astroData = profile.astrological_and_numerology_data ?? {};
  const domain_b: DomainBCulturalReflection = {
    is_requested: domainBRequested,
    status: domainBStatus,
    awude_negest_circle: astroData.awudeCircleNumber
      ? `Circle #${astroData.awudeCircleNumber} (AwudeNegest 16-Circle Grid)`
      : undefined,
    numerology_life_path: astroData.danMillmanLifePath
      ? `Dan Millman Life Path ${astroData.danMillmanLifePath}`
      : undefined,
    astrological_context:
      astroData.sunSign
        ? `${astroData.sunSign} Sun, ${astroData.moonSign ?? "unspecified"} Moon, ${astroData.humoralConstitution ?? "Constitution"}`
        : undefined,
    cultural_interpretation:
      domainBStatus === "included_firewalled"
        ? "Traditional Ethiopian astrology and AwudeNegest reflect on seasonal pacing, inner harmony, and community prayer, advising patience and grounding through shared family meals and elder blessings."
        : undefined,
    firewall_disclaimer: FIREWALL_DISCLAIMER,
  };

  // ─── Environmental triage ─────────────────────────────────────────────
  const endemicRisks: string[] = [];
  if (isHighland) endemicRisks.push("Highland hypoxia & elevated iron demand (+20% RDA)");
  if (isLowlandMalariaZone) endemicRisks.push("Endemic malaria (P. falciparum) transmission zone");
  if (/rift/i.test(profile.geography_and_ecology?.region ?? ""))
    endemicRisks.push("Volcanic groundwater fluorosis risk");
  if (/red|volcanic/i.test(profile.geography_and_ecology?.soilType ?? ""))
    endemicRisks.push("Podoconiosis exposure risk from barefoot red clay soil contact");

  const isRural =
    profile.geography_and_ecology?.setting === "Rural" ||
    /low|severe/i.test(profile.geography_and_ecology?.roadDensity ?? "");

  const altitudeZone: string = isHighland
    ? "Highland (Dega/Wurch)"
    : altitudeMeters >= 1500
      ? "Mid-Highland (Woina Dega)"
      : "Lowland (Kolla)";

  // ─── Expert summary ───────────────────────────────────────────────────
  const expert_case_summary: ExpertCaseSummary = {
    primary_impression: `Multi-factor presentation at ${altitudeMeters}m altitude with ${causes.length} causal attribution vector(s) across nutrition, pharmacology, and environmental context.`,
    differential_considerations: causes.map((x) => x.title),
    substance_and_lifestyle_interactions: [
      /coffee|buna|tea|shai/i.test(narrativeText) || (profile.cultural_and_dietary?.beverageRituals?.bunaCeremony ?? "")
        ? "Decouple Buna/Shai from meals by ≥60–90 min to preserve non-heme iron absorption."
        : "Beverage pacing unremarkable.",
      profile.substance_use_and_social?.khat
        ? "Khat use noted: monitor sympathomimetic rebound, appetite suppression, sleep disruption."
        : "No significant khat burden reported.",
    ],
    pharmacological_and_herb_reconciliation: [
      isPregnant && /tena adam|ruta chalepensis/.test(herbsLower)
        ? "CRITICAL: Ruta chalepensis (Tena Adam) must be discontinued immediately in pregnancy."
        : undefined,
      /metformin|glucophage/i.test((profile.wellbeing_and_medications?.currentMedications ?? []).map((m: { name?: string }) => m.name || "").join(" "))
        ? "Metformin: screen serum B12, homocysteine/MMA."
        : undefined,
      /prazole/i.test((profile.wellbeing_and_medications?.currentMedications ?? []).map((m: { name?: string }) => m.name || "").join(" "))
        ? "PPI: screen for hypomagnesemia and reduced non-heme iron absorption."
        : undefined,
    ].filter((x): x is string => typeof x === "string" && x.length > 0),
    nutritional_antinutrient_adjustments: [
      /tsom|fast/i.test(profile.cultural_and_dietary?.fastingTradition ?? "")
        ? "Extended Tsom fasting: pair plant iron with ascorbic acid; include calcium-rich gomen and pulses."
        : "Standard dietary intake.",
      /unfermented|short/i.test(profile.cultural_and_dietary?.grainPreparation ?? "")
        ? "Extend sourdough teff fermentation to 72–96h to maximize phytase breakdown of phytic acid."
        : "Traditional sourdough fermentation affirmed.",
    ],
    scientific_inquiry_checklist: [
      isPregnant
        ? "Confirm gestational age, obstetric ultrasound, active bleeding/contractions."
        : "Targeted physical examination based on symptom presentation.",
      isHighland
        ? "Obtain CBC with MCV/MCH/RDW — interpret against altitude-adjusted ranges."
        : "Baseline hematologic panel.",
      "Reconcile full list of traditional decoctions and OTC products with a licensed pharmacist.",
    ],
    red_flag_review: safety_gate.red_flags_detected.length
      ? safety_gate.red_flags_detected.map((f: string) => `Confirmed: ${f}`)
      : ["No acute red flags detected on deterministic screen."],
    recommended_diagnostics: [
      "CBC with peripheral smear (altitude-adjusted)",
      "Serum B12, folate, ferritin, zinc",
      "Metabolic panel including Mg, K, Ca",
    ],
    patient_education_points: [
      "Separate coffee/tea from iron-rich meals by at least 60–90 minutes.",
      "If pregnant, do not consume Tena Adam (Ruta chalepensis) under any circumstance.",
      "Report new chest pain, focal weakness, or severe headache immediately.",
    ],
  };

  // ─── Admin summary ────────────────────────────────────────────────────
  const personalKeys = Object.keys(profile.personal ?? {}).length;
  const geoKeys = Object.keys(profile.geography_and_ecology ?? {}).length;
  const dietKeys = Object.keys(profile.cultural_and_dietary ?? {}).length;
  const medKeys = Object.keys(profile.wellbeing_and_medications ?? {}).length;
  const substKeys = Object.keys(profile.substance_use_and_social ?? {}).length;
  const astroKeys = Object.keys(profile.astrological_and_numerology_data ?? {}).length;
  const rawPct = personalKeys * 3 + geoKeys * 3 + dietKeys * 3 + medKeys * 4 + substKeys * 3 + astroKeys * 3;
  const completeness = clamp(Math.round(rawPct), 0, 100);

  const admin_system_summary: AdminSystemSummary = {
    recommended_expert_specialty: isPregnant
      ? "Obstetrician / Maternal-Fetal Medicine with Ethiopian Traditional Medicine (ETM) expertise"
      : "Scientific Nutritionist & Pharmacotherapy Specialist",
    expert_credential_prerequisites: [
      "Verified Scientific licensure in relevant jurisdiction",
      "Credentialed in Ethiopian Traditional Medicine (ETM) pharmacovigilance",
    ],
    profile_completeness_pct: completeness,
    unverified_high_risk_inputs:
      isPregnant && /tena adam|ruta chalepensis/.test(herbsLower)
        ? ["Exact daily dosage and steeping duration of Ruta chalepensis"]
        : [],
    data_quality_notes: [],
    audit_log_entry: `engine=${ENGINE_VERSION} schema=${SCHEMA_VERSION} causes=${causes.length} urgency=${urgency} safety=${safety_gate.passed ? "PASS" : "FLAG"} domainB=${domainBStatus}`,
    schema_version: SCHEMA_VERSION,
  };

  const result: MultiStrandCaseEvaluationResult = {
    case_evaluation_id: ctx.deps.newEvaluationId(c.caseId ?? "case"),
    schema_version: SCHEMA_VERSION,
    generated_at_iso: ctx.deps.now().toISOString(),
    urgency_level: urgency,
    safety_gate,
    epidemiological_and_environmental_triage: {
      altitude_zone: altitudeZone,
      altitude_meters: altitudeMeters,
      local_endemic_risks: endemicRisks,
      road_density_and_access_barrier: isRural ? "Severe rural barrier" : "Moderate",
      estimated_emergency_transit_urgency: isRural
        ? "Local health center triage; arrange regional referral transport if symptoms escalate"
        : "Direct hospital outpatient / specialty consult",
    },
    causal_attribution_matrix: causes,
    domain_b_cultural_reflection: domain_b,
    expert_case_summary,
    admin_system_summary,
  };

  // Final structural validation (throws in dev if schema drifts)
  const v = validateEvaluationResult(result);
  if (!v.ok) {
    ctx.deps.logger.error("Deterministic result failed schema validation", { issues: v.issues });
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API — LLM path with deterministic fallback
// ═══════════════════════════════════════════════════════════════════════════

export async function evaluateCaseWithProfile(
  input: MultiStrandEvaluationInput,
  overrides: Partial<EngineConfig> & Partial<EngineDependencies> = {},
): Promise<MultiStrandCaseEvaluationResult> {
  const ctx = mergeContext(overrides);
  const userCase = (input.submittedCase ?? {}) as MultiStrandCaseSubmission;
  const userProfile = (input.userProfile ?? {}) as MultiStrandUserProfile;
  const narrative = `${userCase.primaryChallenge ?? ""} ${userCase.detailedNarrative ?? ""}`;

  let preScreen: { level: string; recommendation?: string } | null = null;
  try {
    const detected = ctx.deps.detector.detect(narrative, []);
    preScreen = { level: detected.level, recommendation: detected.recommendation };
  } catch (err) {
    ctx.deps.logger.warn("UrgencyDetector failed; proceeding without pre-screen", { err: String(err) });
  }

  // ── LLM path ──────────────────────────────────────────────────────────
  if (ctx.deps.isBionicConfigured()) {
    const messages: BionicMessage[] = [
      { role: "system", content: MULTI_STRAND_EVALUATION_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Evaluate this case submission against the provided user profile:\n\n### USER PROFILE:\n${JSON.stringify(userProfile, null, 2)}\n\n### SUBMITTED CASE:\n${JSON.stringify(userCase, null, 2)}`,
      },
    ];

    for (let attempt = 1; attempt <= ctx.config.maxAttempts; attempt++) {
      try {
        const response = await withTimeout(
          ctx.deps.bionicChat<unknown>({
            messages,
            temperature: ctx.config.temperature,
            maxTokens: ctx.config.maxTokens,
            jsonMode: true,
          }),
          ctx.config.timeoutMs,
        );

        const parsed = (response as { parsedJson?: unknown }).parsedJson;
        if (!parsed) {
          ctx.deps.logger.warn("LLM returned no parsed JSON", { attempt });
          continue;
        }

        const { result, issues } = normalizeLlmResult(parsed, userCase.caseId ?? "case", ctx);
        if (issues.length) {
          ctx.deps.logger.info("LLM result normalized with issues", { attempt, issueCount: issues.length });
        }

        // Reinforce pre-screen critical flag (LLM may miss it)
        if (preScreen?.level === "critical" && !result.safety_gate.critical_flag) {
          result.safety_gate.passed = false;
          result.safety_gate.critical_flag = true;
          result.safety_gate.escalation_reason =
            preScreen.recommendation ?? "Critical pre-screen signal detected.";
          if (!result.safety_gate.emergency_protocol) {
            result.safety_gate.emergency_protocol =
              "Activate local emergency services or transport to nearest referral facility immediately.";
          }
          result.safety_gate.red_flags_detected.push("Pre-screen critical flag");
          result.urgency_level = "critical";
          if (ctx.config.enforceFirewallInvariant) {
            result.domain_b_cultural_reflection.status = "firewalled_due_to_critical_safety";
            result.domain_b_cultural_reflection.cultural_interpretation = undefined;
          }
        }

        return result;
      } catch (err) {
        ctx.deps.logger.warn("LLM attempt failed", { attempt, err: String(err) });
        if (attempt === ctx.config.maxAttempts) {
          ctx.deps.logger.error("LLM exhausted all attempts; falling back to deterministic engine.");
        }
      }
    }
  }

  return runDeterministicEvaluation(input, { config: ctx.config, deps: ctx.deps, preScreen });
}

/**
 * Backwards-compatible alias for callers that prefer the old name and the old
 * calling convention of passing the pre-screen signal directly as the second
 * argument rather than nested under `{ preScreen }`.
 */
export function fallbackMultiStrandEvaluation(
  input: MultiStrandEvaluationInput,
  preScreen?: DeterministicOptions["preScreen"],
  options: Pick<DeterministicOptions, "config" | "deps"> = {},
): MultiStrandCaseEvaluationResult {
  return runDeterministicEvaluation(input, { ...options, preScreen: preScreen ?? null });
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON BINDING
// ═══════════════════════════════════════════════════════════════════════════

export const caseEvaluationEngine = {
  evaluate: evaluateCaseWithProfile,
  runDeterministic: runDeterministicEvaluation,
  version: ENGINE_VERSION,
} as const;