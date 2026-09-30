/**
 * Pure auto-response logic: does a rule's criteria match an intake, may it be sent without the
 * healer, and how its template renders. No I/O, shared by the server and tests.
 */
import type { TriggerCriteria } from "@/lib/db/schema/intake";

export interface IntakeSignals {
  dropdownValue: string | null;
  text: string;
  digitalRoot: number | null;
  humor: "esat" | "may" | "nifas" | "afere" | null;
  urgencyScore: number;
}

/** Instant sends are held for review at or above this urgency (danger signs need a person). */
export const INSTANT_SEND_MAX_URGENCY = 59;

const normalize = (value: string) => value.normalize("NFKC").toLowerCase();

/** Every criterion that is set must match; a rule without criteria matches every intake. */
export function ruleMatches(criteria: TriggerCriteria, signals: IntakeSignals): boolean {
  if (criteria.dropdownValues?.length && (!signals.dropdownValue || !criteria.dropdownValues.includes(signals.dropdownValue))) return false;
  if (criteria.keywords?.length) {
    const text = normalize(signals.text);
    if (!criteria.keywords.some((keyword) => keyword.trim() && text.includes(normalize(keyword.trim())))) return false;
  }
  if (criteria.digitalRoots?.length && (signals.digitalRoot == null || !criteria.digitalRoots.includes(signals.digitalRoot))) return false;
  if (criteria.humors?.length && (!signals.humor || !criteria.humors.includes(signals.humor))) return false;
  if (criteria.minUrgency != null && signals.urgencyScore < criteria.minUrgency) return false;
  if (criteria.maxUrgency != null && signals.urgencyScore > criteria.maxUrgency) return false;
  return true;
}

export interface SendDecision {
  send: boolean;
  heldReason: string | null;
}

/**
 * Whether a matched rule may go straight to the client. Only plain acknowledgements may: anything
 * with remedies or manuscript texts, or any intake with danger signs, waits for the healer.
 */
export function sendDecision(rule: { responseMode: string; attachedRemedies: unknown[]; includeFewusText: boolean }, urgencyScore: number): SendDecision {
  if (rule.responseMode !== "instant_auto_send") return { send: false, heldReason: null };
  if (rule.attachedRemedies.length || rule.includeFewusText) return { send: false, heldReason: "Contains remedies or manuscript text, so the healer reviews it first." };
  if (urgencyScore > INSTANT_SEND_MAX_URGENCY) return { send: false, heldReason: "The client described signs that need a person to respond, so this was held for review." };
  return { send: true, heldReason: null };
}

export const TEMPLATE_VARIABLES = ["client_name", "service_name", "business_name", "booking_reference", "booking_time", "selection", "digital_root", "circle", "humor"] as const;
export type TemplateVariables = Partial<Record<(typeof TEMPLATE_VARIABLES)[number], string>>;

/** Replaces {{variable}}; unknown or empty variables become an empty string, never raw braces. */
export function renderTemplate(template: string, variables: TemplateVariables) {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (_match, key: string) => (variables as Record<string, string | undefined>)[key] ?? "").replace(/[ \t]+\n/g, "\n").trim();
}
