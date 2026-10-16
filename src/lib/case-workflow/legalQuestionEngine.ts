export type LegalStage = "intake" | "matter" | "review";

export interface LegalQuestion {
  id: string;
  text: string;
  textAmharic?: string;
  type: "text" | "textarea" | "select" | "radio" | "multi-select" | "date";
  required: boolean;
  placeholder?: string;
  hint?: string;
  options?: Array<{ value: string; label: string; labelAmharic?: string }>;
  aiGenerated?: boolean;
  branchingReason?: string;
}

export function getLegalQuestions(stage: LegalStage = "intake"): LegalQuestion[] {
  switch (stage) {
    case "matter":
      return [
        {
          id: "issue_type",
          text: "What kind of legal question is this?",
          textAmharic: "ይህ የትኛው የህግ ጉዳይ ነው?",
          type: "select",
          required: true,
          options: [
            { value: "housing", label: "Housing / tenancy / eviction" },
            { value: "contract", label: "Contract or business obligation" },
            { value: "family", label: "Family / inheritance / custody" },
            { value: "dispute", label: "Dispute or conflict" },
          ],
          aiGenerated: false,
        },
        {
          id: "matter_detail",
          text: "Please summarize the issue in your own words.",
          textAmharic: "ጉዳዩን በራስዎ ቃላት አጭር ይግለጹ።",
          type: "textarea",
          required: true,
          aiGenerated: false,
        },
        {
          id: "deadline",
          text: "Is there a deadline, hearing, or notice in the next 30 days?",
          textAmharic: "በ30 ቀናት ውስጥ የቅጣት፣ የችሎት ቀን ወይም ማስጠንቀቂያ አለ?",
          type: "select",
          required: true,
          options: [
            { value: "no", label: "No" },
            { value: "within_30", label: "Yes, within 30 days" },
            { value: "within_7", label: "Yes, within 7 days" },
            { value: "prefer_not", label: "Prefer not to say" },
          ],
          aiGenerated: false,
        },
        {
          id: "matter_timeline",
          text: "When did this dispute or matter first begin, and what key events have happened since?",
          textAmharic: "ይህ ውዝግብ ወይም ጉዳይ መቼ ጀመረ? ከዚያ ወዲህ ምን ዋና ዋና ክስተቶች ተከስተዋል?",
          type: "textarea",
          required: false,
          aiGenerated: false,
        },
        {
          id: "documents_held",
          text: "What documents, contracts, notices, receipts, or agreements do you have regarding this matter?",
          textAmharic: "ስለዚህ ጉዳይ በእጅዎ ያሉ ሰነዶች፣ ውሎች፣ ማስጠንቀቂያዎች፣ ደረሰኞች ወይም ስምምነቶች ምንድን ናቸው?",
          type: "textarea",
          required: false,
          aiGenerated: false,
          placeholder: "Mention type of document and approximate date.",
        },
        {
          id: "customary_reconciliation_openness",
          text: "Would cultural reflection on customary elder mediation (ሽምግልና / Jaarsummaa / Sulh) be safe, appropriate, and acceptable to you?",
          textAmharic: "በባህላዊ የሽምግልና እና የዕርቅ መንገድ (ሽምግልና / ጃርሱማ / ሱልህ) ላይ የሚሰጥ ባህላዊ ምክር ለእርስዎ አስተማማኝ እና ተቀባይነት ያለው ነው?",
          type: "select",
          required: false,
          options: [
            { value: "yes_welcomed", label: "Yes, customary peacemaking is welcomed" },
            { value: "only_if_neutral", label: "Only if truly neutral respected elders are involved" },
            { value: "not_appropriate", label: "No, formal legal or statutory process is preferred" },
            { value: "prefer_not", label: "Prefer not to say" },
          ],
          aiGenerated: false,
          hint: "Cultural and spiritual reflection only. This app does not provide formal or statutory legal representation.",
        },
      ];
    case "review":
      return [
        {
          id: "next_step",
          text: "What practical next step do you want to prepare for?",
          textAmharic: "ለሚቀጥለው እርምጃ ምን እንደሚሰራ እንዲያውቁ ይፈልጋሉ?",
          type: "textarea",
          required: false,
          aiGenerated: true,
        },
      ];
    case "intake":
    default:
      return [
        {
          id: "jurisdiction",
          text: "What area or jurisdiction is this matter in?",
          textAmharic: "ይህ ጉዳይ በየትኛው ክልል ወይም ቦታ ላይ ነው?",
          type: "text",
          required: true,
          placeholder: "Addis Ababa, Oromia, etc.",
          aiGenerated: false,
        },
        {
          id: "legal_goal",
          text: "What outcome matters most right now?",
          textAmharic: "አሁን በጣም አስፈላጊው ውጤት ምንድን ነው?",
          type: "select",
          required: true,
          options: [
            { value: "rights", label: "Rights and obligations" },
            { value: "strategy", label: "Next-step strategy" },
            { value: "contract", label: "Contract review" },
            { value: "urgency", label: "Urgent action planning" },
          ],
          aiGenerated: false,
        },
        {
          id: "safety_context",
          text: "Do you feel safe continuing this conversation today?",
          textAmharic: "ዛሬ ይህንን ውይይት ለመቀጠል ደህንነት ያለዎት ነው?",
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

export function getLegalFollowUp(previousQuestionId: string, answerValue: string): LegalQuestion | null {
  const normalized = String(answerValue).toLowerCase();

  if (previousQuestionId === "legal_goal" && normalized.includes("contract")) {
    return {
      id: "contract_scope",
      text: "What document or agreement is involved?",
      textAmharic: "ምን ሰነድ ወይም ስምምነት ነው የሚያካትተው?",
      type: "textarea",
      required: false,
      aiGenerated: true,
      branchingReason: "contract-related matters need a specific document review approach.",
    };
  }

  if (previousQuestionId === "safety_context" && normalized.includes("unsafe")) {
    return {
      id: "immediate_support_needed",
      text: "Do you need a safe plan or immediate emergency support right now?",
      textAmharic: "አሁን ደህንነታችሁን የሚጠብቅ እቅድ ወይም አስቸኳይ የአደጋ እርዳታ ያስፈልጋል?",
      type: "select",
      required: false,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "prefer_not", label: "Prefer not to say" },
      ],
      aiGenerated: true,
      branchingReason: "Immediate safety should supersede general legal guidance.",
    };
  }

  return null;
}

export function hasLegalSafetyTrigger(answers: Record<string, unknown>): boolean {
  const values = Object.values(answers).map((value) => String(value).toLowerCase());
  const dangerPhrases = ["unsafe", "threat", "danger", "afraid", "hit", "coercion", "eviction", "harassment"];
  return values.some((value) => dangerPhrases.some((phrase) => value.includes(phrase)));
}
