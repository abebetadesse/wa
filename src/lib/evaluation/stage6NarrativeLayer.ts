import { NormalizedProfile, Gap, Cause, Solution, SafetyCheckResult } from "./types";

export interface GuardrailValidationResult {
  isValid: boolean;
  violations: string[];
}

const FORBIDDEN_DIAGNOSTIC_PATTERNS = [
  /\byou have (anemia|rickets|scurvy|osteoporosis|hypokalemia|a disease)\b/i,
  /\byou are suffering from\b/i,
  /\bwe diagnose (you|this)\b/i,
  /\bscientific diagnosis of\b/i,
  /\byou have been diagnosed\b/i,
  /\bprovides a medical diagnosis\b/i,
  /\byou have a scientific pathology\b/i,
];

/**
 * Validates post-generation text against forbidden diagnostic claims.
 */
export function validateNarrativeGuardrails(text: string): GuardrailValidationResult {
  const violations: string[] = [];
  for (const pattern of FORBIDDEN_DIAGNOSTIC_PATTERNS) {
    if (pattern.test(text)) {
      violations.push(`Detected prohibited diagnostic phrasing matching pattern: ${pattern.toString()}`);
    }
  }
  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Stage 6: Deterministic Explanatory Narrative Builder.
 * Generates an empathetic, educational summary based solely on pre-computed facts.
 * Adheres strictly to non-diagnostic risk communication guidelines.
 */
export function stage6GenerateNarrative(
  profile: NormalizedProfile,
  gaps: Gap[],
  causes: Cause[],
  solutions: Solution[],
  culledUnsafeRemedies: SafetyCheckResult[]
): string {
  if (gaps.length === 0) {
    return (
      `Based on your dietary log and Ethiopian Food Composition Table (EFCT 2025) baseline benchmarks, ` +
      `your estimated nutrient intake adequately aligns with physiological requirements for your demographic and regional elevation profile. ` +
      `Continue maintaining a balanced intake of fermented whole teff, diverse legumes, and fresh greens.`
    );
  }

  const paragraphs: string[] = [];

  // Opening summary
  const deficiencyList = gaps
    .filter((g) => g.gapType === "deficiency")
    .map((g) => `${g.nutrientName} (${g.severity} risk tier, estimated at ${g.estimatedIntakePct}% of recommended level)`)
    .join(", ");

  paragraphs.push(
    `Our biochemical nutritional evaluation for your profile in ${profile.region} (elevation ${profile.altitudeMeters}m) ` +
    `identified potential dietary intake gaps: ${deficiencyList || "none"}. ` +
    `These findings highlight nutritional patterns based on your reported intake and do not constitute a medical diagnosis. ` +
    `Reference standard: Ethiopian Food Composition Table (EFCT 2025).`
  );

  // Causal attribution narrative
  if (causes.length > 0) {
    const causeBullets = causes
      .slice(0, 4)
      .map((c) => `• **${c.title}**: ${c.description} [Source: ${c.sourceRef}]`)
      .join("\n");
    paragraphs.push(`### Identified Contributing Factors\n${causeBullets}`);
  }

  // Safety Gate & Solutions narrative
  const topDietary = solutions.filter((s) => s.solutionType === "dietary_change").slice(0, 3);
  const safeHerbal = solutions.filter((s) => s.solutionType === "traditional_remedy" && s.interactionChecked === "pass");

  let solText = `### Evidence-Ranked Guidance\n`;
  if (topDietary.length > 0) {
    solText += `**Nutritional Adjustments:**\n` + topDietary.map((s) => `• **${s.title}**: ${s.description} [Citation: ${s.sourceRef}]`).join("\n") + `\n\n`;
  }
  if (safeHerbal.length > 0) {
    solText += `**Verified Safe Traditional Remedies:**\n` + safeHerbal.map((s) => `• **${s.title}** (Safety Gate Passed): ${s.description} [Citation: ${s.sourceRef}]`).join("\n") + `\n\n`;
  }

  if (culledUnsafeRemedies.length > 0) {
    solText += `> [!NOTE]\n> **Safety Gate Active:** ${culledUnsafeRemedies.length} traditional remedies (${culledUnsafeRemedies.map((r) => r.herbName).join(", ")}) were evaluated and intentionally excluded from your recommendations due to contraindications with your active prescription medication (${culledUnsafeRemedies.map((r) => r.flaggedMedication).join(", ")}).\n\n`;
  }

  paragraphs.push(solText);

  // scientific Advisory
  const hasHigh = gaps.some((g) => g.severity === "high");
  if (hasHigh) {
    paragraphs.push(
      `> [!IMPORTANT]\n` +
      `> **scientific Follow-up Recommended:** Because one or more nutrient gaps fall into the high-severity tier (<40% of target), ` +
      `we strongly advise reviewing these results with a certified healthcare provider or scientific nutritionist for diagnostic blood analysis.`
    );
  }

  const fullNarrative = paragraphs.join("\n\n");

  // Run post-generation guardrail validation
  const guardrail = validateNarrativeGuardrails(fullNarrative);
  if (!guardrail.isValid) {
    throw new Error(`Guardrail violation in generated narrative: ${guardrail.violations.join("; ")}`);
  }

  return fullNarrative;
}
