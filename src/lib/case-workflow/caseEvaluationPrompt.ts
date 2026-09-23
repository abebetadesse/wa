/**
 * Multi-Strand Case Evaluation — Prompt & Schema Contract
 * ─────────────────────────────────────────────────────────────────────────────
 * Version: 2.1.0
 *
 * This is the single source of truth for the multi-strand case evaluation
 * shape: the LLM system prompt, the typed result contract, default-value
 * factories, and structural validators. `caseEvaluationEngine.ts` imports
 * everything it needs from this file; it must never redefine the schema.
 */

// ═══════════════════════════════════════════════════════════════════════════
// VERSIONING
// ═══════════════════════════════════════════════════════════════════════════

export const SCHEMA_VERSION = "2.1.0";
export const ENGINE_VERSION = "2.1.0";

export const FIREWALL_DISCLAIMER =
  "Domain B (cultural, astrological, and traditional reflection) is offered for reflective and identity context only. " +
  "It is not empirical evidence, not a diagnosis, and it never overrides Domain A scientific, safety, or emergency guidance.";

// ═══════════════════════════════════════════════════════════════════════════
// PRIMITIVE / UNION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type UrgencyLevel = "critical" | "high" | "moderate" | "routine";

export type DomainBStatus =
  | "included_firewalled"
  | "firewalled_due_to_critical_safety"
  | "excluded";

export type EvidenceStrength = "established" | "probable" | "preliminary";

export type DomainLayer = "Domain A" | "Domain B";

export function isUrgencyLevel(value: unknown): value is UrgencyLevel {
  return value === "critical" || value === "high" || value === "moderate" || value === "routine";
}

export function isDomainBStatus(value: unknown): value is DomainBStatus {
  return value === "included_firewalled" || value === "firewalled_due_to_critical_safety" || value === "excluded";
}

// ═══════════════════════════════════════════════════════════════════════════
// INPUT CONTRACT
// ═══════════════════════════════════════════════════════════════════════════

export interface MultiStrandUserProfile {
  personal?: {
    fullName?: string;
    age?: number;
    gender?: string;
    pregnancyOrLactation?: string;
    preferredLanguage?: string;
    [key: string]: unknown;
  };
  geography_and_ecology?: {
    country?: string;
    region?: string;
    altitudeMeters?: number;
    setting?: string;
    roadDensity?: string;
    soilType?: string;
    [key: string]: unknown;
  };
  cultural_and_dietary?: {
    religion?: string;
    fastingTradition?: string;
    currentlyFasting?: boolean;
    typicalStaples?: string;
    beverageRituals?: {
      bunaCeremony?: string;
      shaiWithSpices?: string;
      bunaTimingRelativeToMeals?: string;
      [key: string]: unknown;
    };
    grainPreparation?: string;
    [key: string]: unknown;
  };
  wellbeing_and_medications?: {
    currentMedications?: Array<{ name?: string; dose?: string; indication?: string }>;
    activeHerbs?: string[];
    medicalHistory?: string[];
    [key: string]: unknown;
  };
  substance_use_and_social?: {
    alcohol?: string;
    khat?: string;
    tobacco?: string;
    indoorSmoke?: string;
    socialNetwork?: string;
    [key: string]: unknown;
  };
  astrological_and_numerology_data?: {
    birthDate?: string;
    sunSign?: string;
    moonSign?: string;
    danMillmanLifePath?: string;
    awudeCircleNumber?: number;
    humoralConstitution?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface MultiStrandCaseSubmission {
  caseId?: string;
  caseType?: string;
  primaryChallenge?: string;
  detailedNarrative?: string;
  selectedInterest?: string;
  includeDomainBReflection?: boolean;
  [key: string]: unknown;
}

export interface MultiStrandEvaluationInput {
  userProfile?: MultiStrandUserProfile;
  submittedCase?: MultiStrandCaseSubmission;
  evaluationContext?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESULT CONTRACT
// ═══════════════════════════════════════════════════════════════════════════

export interface SafetyGate {
  passed: boolean;
  critical_flag: boolean;
  escalation_reason: string | null;
  emergency_protocol: string | null;
  red_flags_detected: string[];
}

export interface EpidemiologicalAndEnvironmentalTriage {
  altitude_zone: string;
  altitude_meters: number;
  local_endemic_risks: string[];
  road_density_and_access_barrier: string;
  estimated_emergency_transit_urgency: string;
  seasonal_context?: string;
}

export interface CausalAttributionItem {
  cause_id: string;
  title: string;
  cause_type: string;
  mechanism: string;
  confidence_score: number;
  supporting_profile_evidence: string[];
  confounding_or_missing_factors: string[];
  evidence_strength: EvidenceStrength;
  domain_layer: DomainLayer;
  recommended_next_step?: string;
}

export interface DomainBCulturalReflection {
  is_requested: boolean;
  status: DomainBStatus;
  awude_negest_circle?: string;
  numerology_life_path?: string;
  astrological_context?: string;
  cultural_interpretation?: string;
  firewall_disclaimer: string;
}

export interface ExpertCaseSummary {
  primary_impression: string;
  differential_considerations: string[];
  substance_and_lifestyle_interactions: string[];
  pharmacological_and_herb_reconciliation: string[];
  nutritional_antinutrient_adjustments: string[];
  scientific_inquiry_checklist: string[];
  red_flag_review: string[];
  recommended_diagnostics: string[];
  patient_education_points: string[];
}

export interface AdminSystemSummary {
  recommended_expert_specialty: string;
  expert_credential_prerequisites: string[];
  profile_completeness_pct: number;
  unverified_high_risk_inputs: string[];
  data_quality_notes: string[];
  audit_log_entry: string;
  schema_version: string;
}

export interface MultiStrandCaseEvaluationResult {
  case_evaluation_id: string;
  schema_version: string;
  generated_at_iso: string;
  urgency_level: UrgencyLevel;
  safety_gate: SafetyGate;
  epidemiological_and_environmental_triage: EpidemiologicalAndEnvironmentalTriage;
  causal_attribution_matrix: CausalAttributionItem[];
  domain_b_cultural_reflection: DomainBCulturalReflection;
  expert_case_summary: ExpertCaseSummary;
  admin_system_summary: AdminSystemSummary;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export interface ValidationIssue {
  path: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult<T> {
  ok: boolean;
  value: T;
  issues: ValidationIssue[];
}

export function validateEvaluationResult(
  result: MultiStrandCaseEvaluationResult,
): ValidationResult<MultiStrandCaseEvaluationResult> {
  const issues: ValidationIssue[] = [];

  if (!result.case_evaluation_id) {
    issues.push({ path: "case_evaluation_id", message: "Missing case_evaluation_id.", severity: "error" });
  }
  if (result.schema_version !== SCHEMA_VERSION) {
    issues.push({
      path: "schema_version",
      message: `Expected ${SCHEMA_VERSION}, received ${result.schema_version}.`,
      severity: "error",
    });
  }
  if (!isUrgencyLevel(result.urgency_level)) {
    issues.push({ path: "urgency_level", message: "Invalid urgency_level.", severity: "error" });
  }
  if (result.safety_gate.critical_flag && result.safety_gate.passed) {
    issues.push({
      path: "safety_gate.passed",
      message: "Critical flag set but safety_gate.passed is true.",
      severity: "error",
    });
  }
  if (
    result.safety_gate.critical_flag &&
    result.domain_b_cultural_reflection.status !== "firewalled_due_to_critical_safety"
  ) {
    issues.push({
      path: "domain_b_cultural_reflection.status",
      message: "Critical safety gate must firewall Domain B.",
      severity: "error",
    });
  }
  if (
    result.domain_b_cultural_reflection.status !== "included_firewalled" &&
    result.domain_b_cultural_reflection.cultural_interpretation
  ) {
    issues.push({
      path: "domain_b_cultural_reflection.cultural_interpretation",
      message: "Cultural interpretation must be empty unless status is included_firewalled.",
      severity: "error",
    });
  }

  const ok = issues.every((issue) => issue.severity !== "error");
  return { ok, value: result, issues };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT FACTORIES
// ═══════════════════════════════════════════════════════════════════════════

export function createDefaultSafetyGate(): SafetyGate {
  return {
    passed: true,
    critical_flag: false,
    escalation_reason: null,
    emergency_protocol: null,
    red_flags_detected: [],
  };
}

export function createDefaultDomainBReflection(
  isRequested: boolean,
  isCriticalFirewalled: boolean,
): DomainBCulturalReflection {
  const status: DomainBStatus = isCriticalFirewalled
    ? "firewalled_due_to_critical_safety"
    : isRequested
      ? "included_firewalled"
      : "excluded";
  return {
    is_requested: isRequested,
    status,
    firewall_disclaimer: FIREWALL_DISCLAIMER,
  };
}

export function createDefaultExpertCaseSummary(): ExpertCaseSummary {
  return {
    primary_impression: "Insufficient data to generate a primary impression.",
    differential_considerations: [],
    substance_and_lifestyle_interactions: [],
    pharmacological_and_herb_reconciliation: [],
    nutritional_antinutrient_adjustments: [],
    scientific_inquiry_checklist: [],
    red_flag_review: [],
    recommended_diagnostics: [],
    patient_education_points: [],
  };
}

export function createDefaultAdminSystemSummary(): AdminSystemSummary {
  return {
    recommended_expert_specialty: "General Practitioner",
    expert_credential_prerequisites: ["Verified scientific licensure in relevant jurisdiction"],
    profile_completeness_pct: 0,
    unverified_high_risk_inputs: [],
    data_quality_notes: [],
    audit_log_entry: "",
    schema_version: SCHEMA_VERSION,
  };
}

export function createEmptyEvaluation(
  caseId: string,
  evaluationId: string,
  now: Date,
): MultiStrandCaseEvaluationResult {
  return {
    case_evaluation_id: evaluationId,
    schema_version: SCHEMA_VERSION,
    generated_at_iso: now.toISOString(),
    urgency_level: "routine",
    safety_gate: createDefaultSafetyGate(),
    epidemiological_and_environmental_triage: {
      altitude_zone: "Mid-Highland (Woina Dega)",
      altitude_meters: 0,
      local_endemic_risks: [],
      road_density_and_access_barrier: "Moderate",
      estimated_emergency_transit_urgency: "Routine referral pathway",
    },
    causal_attribution_matrix: [],
    domain_b_cultural_reflection: createDefaultDomainBReflection(false, false),
    expert_case_summary: createDefaultExpertCaseSummary(),
    admin_system_summary: createDefaultAdminSystemSummary(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LLM SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════════════════

export const MULTI_STRAND_EVALUATION_SYSTEM_PROMPT = `
You are the Multi-Strand Case Evaluation Engine for an Ethiopian wellness platform.
You cross-analyze a user profile against a submitted case across eleven analytical
strands and return ONLY a single JSON object matching the MultiStrandCaseEvaluationResult
schema (schema_version "${SCHEMA_VERSION}"). Never include prose outside the JSON object.

## MANDATORY FIREWALL RULE
Domain A (scientific, biochemical, pharmacological, epidemiological, and safety findings)
and Domain B (cultural, astrological, AwudeNegest, and numerological reflection) are
strictly separated. If safety_gate.critical_flag is true, domain_b_cultural_reflection.status
MUST be "firewalled_due_to_critical_safety" and cultural_interpretation MUST be omitted.
Domain B reflection never overrides, delays, or substitutes for emergency care, medication
safety, or scientific urgency.

## Analytical strands to evaluate
1. Environmental & Ecological Triage — classify altitude zone: Lowland (Kolla), Mid-Highland
   (Woina Dega), or Highlands (Dega / Wurch); note Rift Valley fluorosis and malaria zones.
2. Epidemiological Risk — endemic and regional risks including Podoconiosis, malaria, and
   Neural Tube Defects risk from folate-poor diets.
3. Infrastructure & Access — Road Density and access barriers to emergency transit.
4. Nutrition & Fasting — Tsom & Ramadan plant-exclusive fasting depletion patterns.
5. Beverage Rituals — Buna & Shai coffee/tea ceremony timing relative to meals.
6. Antinutritional Factors — Phytic Acid chelation from under-fermented grains.
7. Traditional Herbs — Tena Adam and Kosso toxicity and interaction screening.
8. Pharmacology — Metformin and Omeprazole nutrient-depletion interactions.
9. Substance Use — Khat (Catha edulis) and Areke / Katikala consumption patterns.
10. Domain B Reflection — AwudeNegest (ዓውደ ነገሥት) circles, numerology, and astrology, always
    subordinate to the mandatory firewall rule above.
11. Expert & Administrative Routing — recommended specialty, credential prerequisites, and
    profile completeness for triage.

## Output contract
Return every field declared on MultiStrandCaseEvaluationResult: case_evaluation_id,
schema_version, generated_at_iso, urgency_level, safety_gate, epidemiological_and_environmental_triage,
causal_attribution_matrix, domain_b_cultural_reflection, expert_case_summary, and admin_system_summary.
When evidence is insufficient, use conservative defaults rather than omitting a field.
`.trim();
