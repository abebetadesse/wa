export type RelationshipSafetyAnswers = {
  feelsSafe: "yes" | "unsafe" | "prefer_not";
  domesticViolence: "no" | "possible" | "active" | "prefer_not";
  childSafety: "no_children" | "safe" | "concerned" | "prefer_not";
  immediateRisk: "no" | "yes" | "prefer_not";
};

export type RelationshipSafetyAction = "proceed" | "crisis_route" | "proceed_with_concern";

export type RelationshipSafetyResult = {
  action: RelationshipSafetyAction;
  expertFlag?: {
    reason: string;
    priority: "urgent" | "high" | "routine";
  };
  crisisContent?: {
    title: string;
    message: string;
    hotlines: Array<{ name: string; number: string }>;
    safetyPlanSteps: string[];
  };
  supportContent?: {
    title: string;
    message: string;
    hotlines: Array<{ name: string; number: string }>;
    resources: string[];
  };
};

export function evaluateRelationshipSafetyScreen(
  answers: RelationshipSafetyAnswers
): RelationshipSafetyResult {
  const immediateDanger = answers.immediateRisk === "yes";
  const unsafeDynamic = answers.feelsSafe === "unsafe";
  const activeViolence = answers.domesticViolence === "active";
  const childAtRisk = answers.childSafety === "concerned";

  if (immediateDanger || unsafeDynamic || activeViolence || childAtRisk) {
    return {
      action: "crisis_route",
      crisisContent: {
        title: "Your safety comes first",
        message:
          "If someone is in immediate danger or a child may be at risk, please contact emergency support before continuing with any relationship guidance.",
        hotlines: [
          { name: "Police Emergency", number: "911" },
          { name: "Ethiopian Red Cross Ambulance", number: "991" },
          { name: "Mental Health & Crisis Support", number: "952" },
          { name: "Domestic Violence Support", number: "+251-11-550-0800" },
        ],
        safetyPlanSteps: [
          "Move to a safer location if you can do so without increasing danger.",
          "Contact a trusted friend, elder, or supportive family member.",
          "Call 911 or 991 if there is immediate danger or an injury.",
          "Use a phone or safe place to seek support, medical care, and legal guidance.",
        ],
      },
    };
  }

  if (
    answers.domesticViolence === "possible" ||
    answers.feelsSafe === "prefer_not" ||
    answers.immediateRisk === "prefer_not" ||
    answers.childSafety === "prefer_not"
  ) {
    return {
      action: "proceed_with_concern",
      expertFlag: {
        reason: "The relationship has safety concerns that require a trauma-aware expert review.",
        priority: "high",
      },
      supportContent: {
        title: "Support is available",
        message:
          "You do not need to handle this alone. We can continue with a trauma-aware, safety-first review and offer support resources.",
        hotlines: [
          { name: "Mental Health & Crisis Support", number: "952" },
          { name: "Gender-based Violence Support", number: "+251-11-550-0800" },
          { name: "Ethiopian Red Cross", number: "991" },
        ],
        resources: [
          "A trained counselor or social worker",
          "A trusted friend, elder, or family member",
          "A local safe shelter or legal aid office",
        ],
      },
    };
  }

  return { action: "proceed" };
}
