export type LegalSafetyAnswers = {
  immediateHarm: "no" | "physical_danger" | "threats" | "prefer_not";
  criminalMatter: "no" | "yes" | "unsure" | "prefer_not";
  evictionRisk: "no" | "within_30" | "within_7" | "prefer_not";
  childWelfare: "no_children" | "safe" | "concerned" | "prefer_not";
};

export type LegalSafetyAction = "proceed" | "crisis_route" | "legal_aid_route" | "proceed_with_concern";

type Contact = { name: string; number: string };

export type LegalSafetyResult = {
  action: LegalSafetyAction;
  expertFlag?: { reason: string; priority: "urgent" | "high" | "routine" };
  crisisContent?: {
    title: string;
    message: string;
    hotlines: Contact[];
    safetyPlanSteps: string[];
  };
  legalAidContent?: {
    title: string;
    message: string;
    hotlines: Contact[];
    resources: string[];
  };
};

const emergencyContacts: Contact[] = [
  { name: "Police Emergency", number: "911" },
  { name: "Ethiopian Red Cross Ambulance", number: "991" },
  { name: "Legal Aid Hotline", number: "legal_aid" },
];

export function evaluateLegalSafetyScreen(answers: LegalSafetyAnswers): LegalSafetyResult {
  if (answers.immediateHarm === "physical_danger" || answers.immediateHarm === "threats") {
    return {
      action: "crisis_route",
      crisisContent: {
        title: "Your safety comes first",
        message: "If anyone is in immediate danger, contact emergency support now. This information is free and available before any case review.",
        hotlines: [
          ...emergencyContacts,
          { name: "Gender-Based Violence Hotline", number: "952" },
        ],
        safetyPlanSteps: [
          "Move to a safer location if possible.",
          "Call 911 if danger is immediate.",
          "Contact a trusted person who can support you.",
          "Keep evidence and important documents safe when doing so will not increase danger.",
        ],
      },
    };
  }

  if (answers.criminalMatter === "yes") {
    return {
      action: "legal_aid_route",
      legalAidContent: {
        title: "Criminal matters require a licensed attorney",
        message: "This platform does not provide criminal-case guidance. Contact a licensed attorney or legal-aid service as soon as possible.",
        hotlines: [
          { name: "Legal Aid Hotline", number: "legal_aid" },
          { name: "Ethiopian Federal Bar Association", number: "+251-11-155-2044" },
          { name: "Ethiopian Human Rights Commission", number: "+251-11-550-6900" },
        ],
        resources: [
          "Ethiopian Federal Bar Association pro bono services",
          "Local legal-aid centers",
          "A licensed attorney in the relevant jurisdiction",
        ],
      },
    };
  }

  if (answers.childWelfare === "concerned") {
    return {
      action: "crisis_route",
      crisisContent: {
        title: "Child welfare is the priority",
        message: "If a child may be at risk, contact child-protection or emergency services now. Do not wait for a cultural or legal reading.",
        hotlines: [
          { name: "Child Protection Hotline", number: "child_protection_hotline" },
          { name: "Police Emergency", number: "911" },
          { name: "Ethiopian Red Cross Ambulance", number: "991" },
        ],
        safetyPlanSteps: [
          "Keep the child in a safe location if possible.",
          "Contact child-protection services or police.",
          "Seek medical attention for any injury.",
          "Consult a licensed attorney about legal next steps.",
        ],
      },
    };
  }

  if (answers.evictionRisk === "within_7" || answers.evictionRisk === "within_30") {
    return {
      action: "proceed_with_concern",
      legalAidContent: {
        title: "Eviction support may be time-sensitive",
        message: "Contact legal aid promptly while your case is being reviewed. Do not rely on a cultural reading for housing or court deadlines.",
        hotlines: [
          { name: "Legal Aid Hotline", number: "legal_aid" },
          { name: "Ethiopian Women Lawyers Association", number: "+251-11-550-0000" },
        ],
        resources: [
          "Ethiopian Federal Bar Association pro bono services",
          "Local housing or kebele administrative office",
          "A licensed attorney familiar with the jurisdiction",
        ],
      },
      expertFlag: {
        reason: "User reports a time-sensitive eviction risk.",
        priority: "urgent",
      },
    };
  }

  if (answers.criminalMatter === "unsure" || Object.values(answers).includes("prefer_not")) {
    return {
      action: "proceed_with_concern",
      expertFlag: {
        reason: "Legal safety information is incomplete and requires expert screening.",
        priority: answers.criminalMatter === "unsure" ? "high" : "routine",
      },
    };
  }

  return { action: "proceed" };
}
