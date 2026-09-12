export type RelationshipStage = "intake" | "pattern" | "family" | "review";

export interface RelationshipQuestion {
  id: string;
  text: string;
  textAmharic?: string;
  type: "text" | "textarea" | "select" | "radio" | "multi-select" | "scale";
  required: boolean;
  options?: Array<{ value: string; label: string; labelAmharic?: string }>;
  aiGenerated?: boolean;
  branchingReason?: string;
}

export function getRelationshipQuestions(stage: RelationshipStage = "intake"): RelationshipQuestion[] {
  switch (stage) {
    case "pattern":
      return [
        {
          id: "communication_pattern",
          text: "When conflict comes up, what is the pattern most of the time?",
          textAmharic: "ውዝግብ ሲከሰት በአብዛኛው ሰዓት የሚከሰተው ምንድን ነው?",
          type: "select",
          required: true,
          options: [
            { value: "talking_things_through", label: "We talk things through" },
            { value: "withdrawing", label: "One of us withdraws" },
            { value: "blaming", label: "There is blame or criticism" },
            { value: "avoiding", label: "We avoid the issue" },
          ],
          aiGenerated: false,
          branchingReason: "Relationship pattern detection",
        },
        {
          id: "power_balance",
          text: "How do decisions usually get made in the relationship?",
          textAmharic: "ውሳኔዎች በአብዛኛው እንዴት ይወሰናሉ?",
          type: "select",
          required: true,
          options: [
            { value: "shared", label: "Shared and collaborative" },
            { value: "one_sided", label: "Mostly one-sided" },
            { value: "unclear", label: "Not clear or inconsistent" },
          ],
          aiGenerated: false,
        },
      ];
    case "family":
      return [
        {
          id: "family_context",
          text: "Is family or parenting stress influencing this situation?",
          textAmharic: "የቤተሰብ ወይም የልጆች ጭንቀት አሁን ይከሰታል?",
          type: "select",
          required: false,
          options: [
            { value: "no", label: "No" },
            { value: "yes", label: "Yes" },
            { value: "unsure", label: "Not sure" },
          ],
          aiGenerated: false,
        },
        {
          id: "desired_outcome",
          text: "What outcome matters most right now?",
          textAmharic: "አሁን በጣም አስፈላጊው ውጤት ምንድን ነው?",
          type: "select",
          required: true,
          options: [
            { value: "communication", label: "Communication" },
            { value: "boundaries", label: "Boundaries" },
            { value: "family_harmony", label: "Family harmony" },
            { value: "safety_planning", label: "Safety planning" },
          ],
          aiGenerated: false,
        },
      ];
    case "review":
      return [
        {
          id: "next_step",
          text: "What might help you take the next practical step safely?",
          textAmharic: "ለሚቀጥለው የማስፈጸሚያ እርምጃ ምን ሊረዳዎት ይችላል?",
          type: "textarea",
          required: false,
          aiGenerated: true,
        },
      ];
    case "intake":
    default:
      return [
        {
          id: "relationship_status",
          text: "What best describes your current relationship status?",
          textAmharic: "የአሁኑ የግንኙነት ሁኔታዎ በተሻለ ሁኔታ ምን ይመስላል?",
          type: "select",
          required: true,
          options: [
            { value: "single", label: "Single" },
            { value: "dating", label: "Dating" },
            { value: "engaged", label: "Engaged" },
            { value: "married", label: "Married" },
            { value: "separated", label: "Separated" },
            { value: "complicated", label: "Complicated" },
          ],
          aiGenerated: false,
        },
        {
          id: "relationship_issue",
          text: "What is the main issue you want help with?",
          textAmharic: "ለመርዳት የሚፈልጉት ዋና ችግር ምንድን ነው?",
          type: "textarea",
          required: true,
          aiGenerated: false,
        },
        {
          id: "safety_context",
          text: "Do you currently feel physically safe to continue this conversation?",
          textAmharic: "አሁን ይህንን ውይይት ለመቀጠል አካላዊ ደህንነት ያለዎት ነው?",
          type: "select",
          required: true,
          options: [
            { value: "yes", label: "Yes, I feel safe" },
            { value: "unsafe", label: "I do not feel safe" },
            { value: "prefer_not", label: "Prefer not to say" },
          ],
          aiGenerated: false,
        },
      ];
  }
}

export function getRelationshipFollowUp(
  previousQuestionId: string,
  answerValue: string
): RelationshipQuestion | null {
  const normalized = String(answerValue).toLowerCase();

  if (previousQuestionId === "relationship_issue" && normalized.includes("money")) {
    return {
      id: "money_impact",
      text: "How does money or financial stress shape the conflict?",
      textAmharic: "ገንዘብ ወይም የገንዘብ ጭንቀት ውዝግብን በምን መልኩ ይነካል?",
      type: "textarea",
      required: false,
      aiGenerated: true,
      branchingReason: "Financial stress is a common driver in relationship conflict.",
    };
  }

  if (previousQuestionId === "relationship_issue" && normalized.includes("child")) {
    return {
      id: "child_impact",
      text: "How are the children or caregiving responsibilities affecting the situation?",
      textAmharic: "ልጆች ወይም የእንክብካቤ ኃላፊነቶች ሁኔታውን እንዴት እየነካ ነው?",
      type: "textarea",
      required: false,
      aiGenerated: true,
      branchingReason: "Child-related conflict needs a careful, trauma-aware response.",
    };
  }

  if (previousQuestionId === "safety_context" && normalized.includes("unsafe")) {
    return {
      id: "immediate_support",
      text: "Are you in immediate danger or do you need a safe plan right now?",
      textAmharic: "አሁን በአስቸኳይ አደጋ ላይ ነዎት ወይስ ደህንነት ያለው እቅድ ያስፈልገዎታል?",
      type: "select",
      required: false,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "prefer_not", label: "Prefer not to say" },
      ],
      aiGenerated: true,
      branchingReason: "Immediate safety should be prioritized over normal relationship guidance.",
    };
  }

  return null;
}

export function hasRelationshipSafetyTrigger(answers: Record<string, unknown>): boolean {
  const values = Object.values(answers).map((value) => String(value).toLowerCase());
  const dangerPhrases = ["unsafe", "threat", "afraid", "violence", "hit", "forced", "danger", "coercion"];
  return values.some((value) => dangerPhrases.some((phrase) => value.includes(phrase)));
}
