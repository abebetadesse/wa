/**
 * Financial Distress & Safety Pre-Screen for Case 3 (Career & Business)
 * MANDATORY — runs before any other workflow processing
 */

export type BasicNeedsAnswer = "yes_comfortable" | "yes_difficult" | "no" | "prefer_not";
export type SelfHarmAnswer = "no" | "occasionally" | "frequently" | "prefer_not";
export type FinancialPressureAnswer = "no" | "yes" | "prefer_not";

export interface CareerSafetyAnswers {
  basic_needs: BasicNeedsAnswer;
  self_harm: SelfHarmAnswer;
  financial_pressure: FinancialPressureAnswer;
}

export type CareerSafetyAction = "proceed" | "crisis_route" | "proceed_with_concern";

interface ContactEntry {
  name: string;
  number: string;
}

interface CrisisContent {
  title: string;
  message: string;
  hotlines: ContactEntry[];
  safetyPlanSteps: string[];
  resources?: string[];
}

export interface CareerSafetyResult {
  action: CareerSafetyAction;
  crisisContent?: CrisisContent;
  expertFlag?: {
    reason: string;
    priority: "urgent" | "high" | "routine";
  };
}

export function evaluateCareerSafetyScreen(
  answers: CareerSafetyAnswers
): CareerSafetyResult {
  // ═══════════════════════════════════════════════════════════════
  // CRITICAL: Self-harm → immediate crisis routing
  // ═══════════════════════════════════════════════════════════════
  if (
    answers.self_harm === "frequently" ||
    answers.self_harm === "occasionally"
  ) {
    return {
      action: "crisis_route",
      crisisContent: {
        title: "Your safety comes first",
        message:
          "Based on your answers, we are connecting you with immediate support. " +
          "Please reach out to one of these services now. This information is free " +
          "and always available — no payment, no registration required.",
        hotlines: [
          { name: "Mental wellbeing Crisis Line (GBV & All)", number: "952" },
          { name: "EPHI Hotline", number: "907" },
          { name: "Amanuel Mental wellbeing Hospital", number: "+251-11-275-1234" },
          { name: "Police Emergency", number: "911" },
          { name: "Ethiopian Red Cross Ambulance", number: "991" },
        ],
        safetyPlanSteps: [
          "If you are in immediate danger, call 911 now.",
          "Reach out to a trusted friend, family member, or elder.",
          "Consider going to the nearest health facility for in-person support.",
          "Call 952 — the confidential mental wellbeing and crisis support line.",
          "You are not alone. Support is available right now, for free.",
        ],
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Basic needs = no → social services + proceed with concern
  // ═══════════════════════════════════════════════════════════════
  if (answers.basic_needs === "no") {
    return {
      action: "proceed_with_concern",
      crisisContent: {
        title: "Immediate support available — for free",
        message:
          "If you are struggling to meet your basic needs, please contact one of " +
          "these services. This information is free and always available.",
        hotlines: [
          { name: "Ethiopian Red Cross Assistance", number: "991" },
          { name: "Social Services Hotline", number: "0800-000-0000" },
          { name: "Mental wellbeing Support", number: "952" },
        ],
        safetyPlanSteps: [
          "Contact a social worker at your local health center.",
          "Reach out to community elders or religious leaders for immediate support.",
          "The Productive Safety Net Programme (PSNP) may be able to provide food and income assistance.",
          "Ethiopian Red Cross can connect you with emergency food and shelter programs.",
        ],
        resources: [
          "Productive Safety Net Programme (PSNP)",
          "Local health center social worker",
          "Community elder / kebele committee",
          "Ethiopian Red Cross food assistance",
        ],
      },
      expertFlag: {
        reason: "User is currently unable to meet basic needs — immediate social support may be required",
        priority: "high",
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Financial pressure → proceed with expert flag
  // ═══════════════════════════════════════════════════════════════
  if (answers.financial_pressure === "yes") {
    return {
      action: "proceed_with_concern",
      expertFlag: {
        reason: "User reports being under external pressure to make financial decisions — coercion risk noted",
        priority: "high",
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // Prefer not → proceed with routine caution flag
  // ═══════════════════════════════════════════════════════════════
  if (
    answers.basic_needs === "prefer_not" ||
    answers.self_harm === "prefer_not" ||
    answers.financial_pressure === "prefer_not"
  ) {
    return {
      action: "proceed_with_concern",
      expertFlag: {
        reason: "User preferred not to answer one or more screening questions — expert should check in at start of review",
        priority: "routine",
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // All clear — proceed normally
  // ═══════════════════════════════════════════════════════════════
  return { action: "proceed" };
}
