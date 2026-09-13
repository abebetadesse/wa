export type SocialStage = "intake" | "pattern" | "review";

export interface SocialQuestion {
  id: string;
  text: string;
  textAmharic?: string;
  type: "text" | "textarea" | "select" | "radio" | "multi-select" | "scale";
  required: boolean;
  options?: Array<{ value: string; label: string; labelAmharic?: string }>;
  aiGenerated?: boolean;
  branchingReason?: string;
}

export function getSocialQuestions(stage: SocialStage = "intake"): SocialQuestion[] {
  switch (stage) {
    case "pattern":
      return [
        {
          id: "social_pattern",
          text: "What pattern best matches your social situation?",
          textAmharic: "የማህበራዊ ሁኔታዎ በተሻለ ሁኔታ ምን ይመስላል?",
          type: "select",
          required: true,
          options: [
            { value: "isolated", label: "I feel isolated" },
            { value: "conflicted", label: "There is tension or conflict" },
            { value: "uncertain", label: "I am not sure where I belong" },
            { value: "supported", label: "I am supported but want more connection" },
          ],
          aiGenerated: false,
        },
        {
          id: "support_network",
          text: "Who feels safe or supportive in your life right now?",
          textAmharic: "አሁን በህይወትዎ ውስጥ ደህንነት የሚሰማዎት ወይም የሚደግፉዎት ማን ነው?",
          type: "textarea",
          required: true,
          aiGenerated: false,
        },
      ];
    case "review":
      return [
        {
          id: "next_support_step",
          text: "What would make support feel more realistic in the next week?",
          textAmharic: "በሚቀጥለው ሳምንት ድጋፍ የበለጠ ሊሆን የሚችል ነገር ምን ነው?",
          type: "textarea",
          required: false,
          aiGenerated: true,
        },
      ];
    case "intake":
    default:
      return [
        {
          id: "belonging_need",
          text: "What feels missing most right now: belonging, friendship, family connection, or community support?",
          textAmharic: "አሁን በጣም የሚጎድለው ነገር መሆን ያለበት ነገር እምቢ ነው?",
          type: "select",
          required: true,
          options: [
            { value: "belonging", label: "Belonging" },
            { value: "friendship", label: "Friendship" },
            { value: "family_connection", label: "Family connection" },
            { value: "community_support", label: "Community support" },
          ],
          aiGenerated: false,
        },
        {
          id: "social_issue",
          text: "What is the main social or community challenge you want help with?",
          textAmharic: "ለመርዳት የሚፈልጉት ዋና ማህበራዊ ወይም ማህበረሰብ ችግር ምንድን ነው?",
          type: "textarea",
          required: true,
          aiGenerated: false,
        },
        {
          id: "social_safety",
          text: "Do you currently feel emotionally or physically safe to continue this conversation?",
          textAmharic: "አሁን ይህንን ውይይት ለመቀጠል ስሜታዊ ወይም አካላዊ ደህንነት ያለዎት ነው?",
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

export function getSocialFollowUp(previousQuestionId: string, answerValue: string): SocialQuestion | null {
  const normalized = String(answerValue).toLowerCase();

  if (previousQuestionId === "social_issue" && normalized.includes("family")) {
    return {
      id: "family_role",
      text: "What role does family play in this situation?",
      textAmharic: "ቤተሰብ በዚህ ሁኔታ ውስጥ ምን ሚና ይጫወታል?",
      type: "textarea",
      required: false,
      aiGenerated: true,
      branchingReason: "Family dynamics often influence belonging and social stress.",
    };
  }

  if (previousQuestionId === "social_safety" && normalized.includes("unsafe")) {
    return {
      id: "safe_support_needed",
      text: "Do you need immediate support or a safer next step right now?",
      textAmharic: "አሁን አስቸኳይ ድጋፍ ወይም ደህንነታችሁን የሚጠብቅ እርምጃ ያስፈልጋል?",
      type: "select",
      required: false,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "prefer_not", label: "Prefer not to say" },
      ],
      aiGenerated: true,
      branchingReason: "Safety overrides routine social guidance.",
    };
  }

  return null;
}

export function hasSocialSafetyTrigger(answers: Record<string, unknown>): boolean {
  const values = Object.values(answers).map((value) => String(value).toLowerCase());
  const dangerPhrases = ["unsafe", "afraid", "alone", "hopeless", "threat", "harm", "violence", "coercion"];
  return values.some((value) => dangerPhrases.some((phrase) => value.includes(phrase)));
}
