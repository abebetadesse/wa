export type SocialSafetyAnswers = {
  loneliness: "low" | "moderate" | "high" | "prefer_not";
  self_harm: "no" | "occasionally" | "frequently" | "prefer_not";
  immediateRisk: "no" | "yes" | "prefer_not";
  supportAvailable: "yes" | "limited" | "none" | "prefer_not";
};

export type SocialSafetyAction = "proceed" | "crisis_route" | "proceed_with_concern";

export type SocialSafetyResult = {
  action: SocialSafetyAction;
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

export function evaluateSocialSafetyScreen(
  answers: SocialSafetyAnswers
): SocialSafetyResult {
  const selfHarmRisk = answers.self_harm === "occasionally" || answers.self_harm === "frequently";
  const immediateRisk = answers.immediateRisk === "yes";
  const noSupport = answers.supportAvailable === "none";

  if (immediateRisk || selfHarmRisk) {
    return {
      action: "crisis_route",
      crisisContent: {
        title: "Your safety comes first",
        message:
          "If you are in immediate danger, or if isolation and hopelessness are severe, contact crisis support before continuing.",
        hotlines: [
          { name: "Mental Health & Crisis Support", number: "952" },
          { name: "Police Emergency", number: "911" },
          { name: "Ethiopian Red Cross Ambulance", number: "991" },
          { name: "Community crisis line", number: "+251-11-550-0800" },
        ],
        safetyPlanSteps: [
          "Move to a place where you feel safer if you can do so without risk.",
          "Call 952 or a trusted person you know well.",
          "Contact a local health professional or counselor if you are struggling to cope.",
          "Keep one safe person informed about your situation.",
        ],
      },
    };
  }

  if (answers.loneliness === "high" || noSupport) {
    return {
      action: "proceed_with_concern",
      expertFlag: {
        reason: "Isolation and limited support require a community-centered, trauma-aware review.",
        priority: "high",
      },
      supportContent: {
        title: "Support can be built step by step",
        message: "You do not need to handle loneliness or disconnection alone. We can help you identify supportive people and community resources.",
        hotlines: [
          { name: "Mental health support", number: "952" },
          { name: "Community support referral", number: "local_counselor" },
          { name: "Ethiopian Red Cross", number: "991" },
        ],
        resources: [
          "A trusted relative or elder",
          "A faith or community group",
          "A local counselor or social worker",
          "An Iddir/Equb or supportive community network",
        ],
      },
    };
  }

  if (answers.self_harm === "prefer_not" || answers.supportAvailable === "prefer_not") {
    return {
      action: "proceed_with_concern",
      expertFlag: {
        reason: "One or more social-support screening answers were not answered, so expert review should proceed carefully.",
        priority: "routine",
      },
    };
  }

  return { action: "proceed" };
}
