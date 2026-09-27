/**
 * Dynamic Question Branching & Crisis Screening Engine for Case 3
 * (Career & Business)
 *
 * Generates contextual questions that adapt in real-time to:
 * - Career stage (exploring → scaling)
 * - Business type and sector
 * - Financial distress signals
 * - Safety flags from the pre-screen
 *
 * Safety rule: No question may suggest, recommend, or imply investment,
 * financial advice, or legal guidance. A reflection-only scope disclaimer
 * is injected automatically when financial topics appear.
 */

import type { CareerProfile, CareerStage, BusinessType } from "@/lib/cultural/careerTimingEngine";

// ════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════

export type QuestionType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "number"
  | "slider"
  | "date"
  | "name_geez";

export interface QuestionOption {
  value: string;
  label: string;
  labelAmharic?: string;
  followUp?: string; // ID of the follow-up question to inject
}

export interface CareerQuestion {
  id: string;
  text: string;
  textAmharic: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  placeholder?: string;
  hint?: string;
  financialDisclaimerRequired?: boolean;
  safetyNote?: string;
  dependsOn?: { questionId: string; value: string | string[] };
  aiFollowUpTrigger?: boolean; // if true, AI generates next question based on answer
}

export interface CareerBranchContext {
  careerStage: CareerStage;
  businessType: BusinessType;
  sector: string;
  geezName: string;
  motherGeezName: string;
  safetyFlag?: "concern" | "crisis" | "none";
  answers: Record<string, string>;
}

export interface FollowUpInstruction {
  questionId: string;
  answerValue: string;
  followUpQuestion: CareerQuestion;
}

// ════════════════════════════════════════════════════════════
// Stage 1 — Foundation Questions (always shown)
// ════════════════════════════════════════════════════════════

export const FOUNDATION_QUESTIONS: CareerQuestion[] = [
  {
    id: "career_geez_name",
    text: "Enter your full Ge'ez (Ethiopian) name",
    textAmharic: "ሙሉ ግዕዝ ስምዎን ያስገቡ",
    type: "name_geez",
    required: true,
    placeholder: "e.g. ሰሎሞን, ማርያም",
    hint: "Your name will be used to calculate your career numerology and timing windows.",
    aiFollowUpTrigger: true,
  },
  {
    id: "career_mother_geez_name",
    text: "Your mother's Ge'ez name",
    textAmharic: "የእናትዎ ግዕዝ ስም",
    type: "name_geez",
    required: true,
    placeholder: "e.g. ወይዘሮ ሙሉ",
    hint: "Used alongside your name to complete the Abushakir gematria calculation.",
  },
  {
    id: "career_stage",
    text: "Where are you in your career or business journey?",
    textAmharic: "በሙያ ወይም ንግድ ጉዞዎ ላይ የት ነዎት?",
    type: "select",
    required: true,
    options: [
      { value: "exploring", label: "Exploring — I am not yet sure what direction to take", labelAmharic: "እያሰስኩ ነው — ምን አቅጣጫ እንደሚወሰድ ገና አሳሳቢ ነው" },
      { value: "job_seeking", label: "Job-seeking — actively applying for positions", labelAmharic: "ሥራ እፈልጋለሁ — ለቦታዎች ማቅረቢያ እያደረግሁ ነው" },
      { value: "negotiating", label: "Negotiating — offer, salary, or contract in front of me", labelAmharic: "እየደራደርሁ ነው — ቅናሽ ወይም ውል ፊቴ ላይ አለ" },
      { value: "starting_business", label: "Starting a business — planning or registration phase", labelAmharic: "ንግድ ለማጀመር — ዕቅድ ወይም ምዝገባ ምዕራፍ" },
      { value: "growing_business", label: "Growing a business — operating but want to expand", labelAmharic: "ንግድ ለማሳደግ — እየሰራ ነው ነገር ግን ማስፋት ፈልጋለሁ" },
      { value: "transitioning", label: "Transitioning — changing field, role, or city", labelAmharic: "ተዛወርዋለሁ — መስክ፣ ሚና ወይም ከተማ እቀይራለሁ" },
      { value: "scaling", label: "Scaling — growing fast and need strategic support", labelAmharic: "አሳድጋለሁ — በፍጥነት እያደኩ ስልታዊ ድጋፍ ያስፈልገኛል" },
      { value: "recovering", label: "Recovering — after a setback, closure, or difficult period", labelAmharic: "ከዳከምሁ ወደ ኋላ ለመምጣት — ከሽንፈት ወይም ከፈተና ጊዜ በኋላ" },
    ],
    aiFollowUpTrigger: true,
  },
  {
    id: "career_sector",
    text: "Which sector or field are you working in (or hoping to enter)?",
    textAmharic: "ሥራዎ ወይም ሊገቡ ያስቡት ዘርፍ ወይም ሙያ ምን ነው?",
    type: "text",
    required: true,
    placeholder: "e.g. Agriculture, Tech, Education, Retail, healthcare, Construction",
  },
  {
    id: "career_business_type",
    text: "What type of business or work arrangement describes your situation?",
    textAmharic: "የቢዝነስዎ ወይም የሥራ ዝግጅትዎ ምን ዓይነት ነው?",
    type: "select",
    required: false,
    options: [
      { value: "not_yet_started", label: "Not yet started" },
      { value: "sole_trader", label: "Sole trader / freelancer / self-employed" },
      { value: "informal", label: "Informal business (market stall, small trade)" },
      { value: "partnership", label: "Partnership or co-ownership" },
      { value: "cooperative", label: "Cooperative (Edir, Equb, or formal)" },
      { value: "formal_registered", label: "Formally registered company" },
      { value: "social_enterprise", label: "Social enterprise or NGO" },
      { value: "franchise", label: "Franchise" },
    ],
  },
  {
    id: "career_top_goal",
    text: "What is the most important thing you want this guidance to help you achieve?",
    textAmharic: "ይህ ምክር እንዲረዳዎ በጣም አስፈላጊ ነገር ምን ነው?",
    type: "textarea",
    required: true,
    placeholder: "Describe your goal in your own words — be as specific as possible.",
    aiFollowUpTrigger: true,
  },
];

// ════════════════════════════════════════════════════════════
// Stage-specific question sets
// ════════════════════════════════════════════════════════════

const STAGE_QUESTIONS: Record<CareerStage, CareerQuestion[]> = {
  exploring: [
    {
      id: "explore_skills",
      text: "What skills or abilities do people already come to you for — even informally?",
      textAmharic: "ሰዎች ቢዘወትሩ ወደ እርሶ የሚመጡ — ቢያንስ ተፈጥሯዊ ችሎታዎ ምን ነው?",
      type: "textarea",
      required: true,
      aiFollowUpTrigger: true,
    },
    {
      id: "explore_constraints",
      text: "What limits your choices right now? (Location, family responsibility, education, finances)",
      textAmharic: "አሁን ምርጫዎን የሚወስን ምንድነው? (ቦታ፣ የቤተሰብ ኃላፊነት፣ ትምህርት፣ ፋይናንስ)",
      type: "checkbox",
      required: false,
      options: [
        { value: "location", label: "Geographic limitations" },
        { value: "family", label: "Family or caring responsibilities" },
        { value: "education", label: "Lack of formal qualification" },
        { value: "capital", label: "Insufficient startup capital", financialDisclaimerRequired: true } as unknown as QuestionOption,
        { value: "language", label: "Language or communication barrier" },
        { value: "network", label: "Limited professional network" },
        { value: "confidence", label: "Confidence or direction" },
      ],
    },
    {
      id: "explore_timeframe",
      text: "How soon are you hoping to make a meaningful move?",
      textAmharic: "ትርጉም ያለው እርምጃ ለመውሰድ ምን ያህል ጊዜ ይፈልጋሉ?",
      type: "select",
      required: true,
      options: [
        { value: "within_month", label: "Within the next month" },
        { value: "within_6_months", label: "Within 6 months" },
        { value: "within_year", label: "Within a year" },
        { value: "no_rush", label: "I have time to plan carefully" },
      ],
    },
  ],

  job_seeking: [
    {
      id: "job_target_role",
      text: "Describe the role or position you are targeting.",
      textAmharic: "ዒላማ ሚና ወይም ቦታ ይግለጹ።",
      type: "textarea",
      required: true,
      aiFollowUpTrigger: true,
    },
    {
      id: "job_applications_count",
      text: "How many applications have you submitted in the last 30 days?",
      textAmharic: "ባለፉ 30 ቀናት ውስጥ ስንት ማቅረቢያ ላኩ?",
      type: "number",
      required: false,
      placeholder: "0",
    },
    {
      id: "job_barrier",
      text: "What is the biggest obstacle you face in the job search?",
      textAmharic: "ሥራ ፍለጋ ላይ ያጋጠምዎ ትልቁ እንቅፋት ምን ነው?",
      type: "textarea",
      required: true,
      aiFollowUpTrigger: true,
    },
    {
      id: "job_open_to_relocation",
      text: "Are you open to relocating for the right opportunity?",
      textAmharic: "ትክክለኛ ዕድል ቢቀርብ ቦታ ለመቀየር ዝግጁ ናቸው?",
      type: "radio",
      required: true,
      options: [
        { value: "yes", label: "Yes, I am flexible" },
        { value: "no", label: "No, I need to stay local" },
        { value: "maybe", label: "Possibly, depending on the offer" },
      ],
    },
  ],

  negotiating: [
    {
      id: "neg_type",
      text: "What type of negotiation are you entering?",
      textAmharic: "ወደ ምን ዓይነት ድርድር ነዎት የሚገቡት?",
      type: "select",
      required: true,
      options: [
        { value: "salary", label: "Salary or compensation" },
        { value: "contract_terms", label: "Contract terms" },
        { value: "partnership_agreement", label: "Partnership or equity agreement" },
        { value: "supplier_deal", label: "Supplier or vendor deal" },
        { value: "rent_lease", label: "Business rent or lease" },
      ],
      financialDisclaimerRequired: true,
    },
    {
      id: "neg_power",
      text: "How would you describe your negotiating position right now?",
      textAmharic: "አሁን ያለዎ ድርድር አቅም ምን ይመስላል?",
      type: "radio",
      required: true,
      options: [
        { value: "strong", label: "Strong — they need me more than I need them" },
        { value: "balanced", label: "Balanced — both sides have something to gain" },
        { value: "weak", label: "Weak — I need this more than they do" },
        { value: "unsure", label: "I'm not sure" },
      ],
    },
    {
      id: "neg_deadline",
      text: "Is there a deadline or time pressure on this negotiation?",
      textAmharic: "ይህ ድርድር ላይ የጊዜ ገደብ አለ?",
      type: "select",
      required: true,
      options: [
        { value: "yes_urgent", label: "Yes, very urgent (within days)" },
        { value: "yes_soon", label: "Yes, within a few weeks" },
        { value: "no_flexible", label: "No, I have flexibility" },
      ],
    },
  ],

  starting_business: [
    {
      id: "biz_start_concept",
      text: "Describe your business concept in one or two sentences.",
      textAmharic: "የቢዝነስ ሃሳብዎን በአንድ ወይም ሁለት ዓረፍተ ነገር ይግለጹ።",
      type: "textarea",
      required: true,
      aiFollowUpTrigger: true,
    },
    {
      id: "biz_start_funding",
      text: "How are you planning to fund the startup?",
      textAmharic: "ስታርተፕ ዘርፍ ፋይናንስ ለምን ያቅዳሉ?",
      type: "select",
      required: true,
      financialDisclaimerRequired: true,
      options: [
        { value: "personal_savings", label: "Personal savings" },
        { value: "family_support", label: "Family or community support (Equb/Edir)" },
        { value: "microfinance", label: "Microfinance institution" },
        { value: "bank_loan", label: "Bank loan" },
        { value: "grant", label: "Grant or government program" },
        { value: "investor", label: "External investor" },
        { value: "not_sure", label: "Not sure yet" },
      ],
    },
    {
      id: "biz_start_registered",
      text: "Have you already registered or named your business?",
      textAmharic: "ቢዝነስዎን ቀድሞ ምዝግቧል ወይም ሰይሟል?",
      type: "radio",
      required: true,
      options: [
        { value: "yes_registered", label: "Yes, fully registered" },
        { value: "yes_named", label: "Yes, named but not yet registered" },
        { value: "no", label: "No, not yet" },
      ],
    },
  ],

  growing_business: [
    {
      id: "grow_bottleneck",
      text: "What is the main bottleneck preventing faster growth?",
      textAmharic: "ፈጠን ዕድገትን የሚያደናቅፍ ዋናው አሰቃቂ ምን ነው?",
      type: "textarea",
      required: true,
      aiFollowUpTrigger: true,
    },
    {
      id: "grow_team_size",
      text: "How many people work in the business (including yourself)?",
      textAmharic: "ቢዝነሱ ውስጥ ስንት ሰው ይሰራሉ (ራስዎን ጨምሮ)?",
      type: "number",
      required: false,
      placeholder: "1",
    },
    {
      id: "grow_revenue_trend",
      text: "How would you describe your revenue trend over the last 6 months?",
      textAmharic: "ባለፉ 6 ወር ያለ ገቢ አዝማሚያ ምን ይመስላል?",
      type: "radio",
      required: true,
      options: [
        { value: "growing_fast", label: "Growing significantly" },
        { value: "growing_steady", label: "Steady and consistent growth" },
        { value: "flat", label: "Flat — roughly the same" },
        { value: "declining", label: "Declining" },
        { value: "prefer_not", label: "Prefer not to share" },
      ],
    },
  ],

  transitioning: [
    {
      id: "trans_from",
      text: "What are you leaving behind?",
      textAmharic: "ምን ትተው ነው የሚሄዱት?",
      type: "textarea",
      required: true,
      aiFollowUpTrigger: true,
    },
    {
      id: "trans_to",
      text: "What are you moving toward?",
      textAmharic: "ወደ ምን ነው የሚሄዱት?",
      type: "textarea",
      required: true,
      aiFollowUpTrigger: true,
    },
    {
      id: "trans_bridge",
      text: "Do you have any bridge income or savings to support this transition?",
      textAmharic: "ይህን ሽግግር ለመደገፍ ድልድይ ገቢ ወይም ቁጠባ አለዎ?",
      type: "radio",
      required: true,
      financialDisclaimerRequired: true,
      options: [
        { value: "yes_comfortable", label: "Yes, I am financially comfortable during the transition" },
        { value: "yes_tight", label: "Yes, but it will be tight" },
        { value: "no", label: "No — timing is urgent" },
      ],
    },
  ],

  scaling: [
    {
      id: "scale_milestone",
      text: "What does success at the next scale look like to you?",
      textAmharic: "ቀጣዩ ዕርከን ሲደርሱ ስኬት ምን ይመስልሆናል?",
      type: "textarea",
      required: true,
      aiFollowUpTrigger: true,
    },
    {
      id: "scale_bottleneck",
      text: "What is the single biggest barrier to reaching that milestone?",
      textAmharic: "ያ ምዕራፍ ለመድረስ ትልቁ እንቅፋት ምን ነው?",
      type: "textarea",
      required: true,
    },
    {
      id: "scale_partner_interest",
      text: "Are you considering partnerships, investors, or strategic alliances?",
      textAmharic: "አጋርነቶችን፣ ባለሀብቶችን ወይም ስትራቴጂካዊ ህብረቶችን ያስባሉ?",
      type: "radio",
      required: false,
      financialDisclaimerRequired: true,
      options: [
        { value: "yes_actively", label: "Yes, actively looking" },
        { value: "yes_open", label: "Open to it if the right opportunity comes" },
        { value: "no", label: "No, prefer to stay independent" },
      ],
    },
  ],

  recovering: [
    {
      id: "recover_what_happened",
      text: "Briefly describe the setback or difficult period you are recovering from.",
      textAmharic: "ያጋጠምዎ ሽንፈት ወይም ከባድ ጊዜ ጥቂት ይግለጹ።",
      type: "textarea",
      required: true,
      aiFollowUpTrigger: true,
      safetyNote: "Your response is handled with care. This information is private and will not be shared outside your case.",
    },
    {
      id: "recover_support",
      text: "Who or what has been your support during this time?",
      textAmharic: "በዚህ ጊዜ ድጋፍዎ ማን ወይም ምን ነው?",
      type: "textarea",
      required: false,
    },
    {
      id: "recover_readiness",
      text: "How ready do you feel to take your next professional step?",
      textAmharic: "ቀጣዩ ሙያዊ እርምጃ ለመውሰድ ምን ያህል ዝግጁ ነዎት?",
      type: "slider",
      required: true,
      hint: "1 = Not at all ready · 10 = Completely ready",
    },
  ],
};

// ════════════════════════════════════════════════════════════
// Dynamic follow-up injection rules
// ════════════════════════════════════════════════════════════

export const FOLLOW_UP_RULES: FollowUpInstruction[] = [
  {
    questionId: "career_stage",
    answerValue: "recovering",
    followUpQuestion: {
      id: "recover_emotional_check",
      text: "During difficult periods, some people also experience low moods or hopelessness. Is that something you are experiencing?",
      textAmharic: "ከባድ ጊዜ ወቅት አንዳንዶች ዝቅተኛ ስሜት ወይም ተስፋ መቁረጥ ያጋጥማቸዋል። ይህ ነገር አጋጥሞዎ ይሆን?",
      type: "select",
      required: true,
      safetyNote: "SAFETY_SCREEN_TRIGGER",
      options: [
        { value: "no", label: "No, I feel resilient overall" },
        { value: "sometimes", label: "Sometimes, but I am managing" },
        { value: "yes", label: "Yes — it has been affecting me significantly" },
        { value: "prefer_not", label: "Prefer not to answer" },
      ],
    },
  },
  {
    questionId: "job_applications_count",
    answerValue: "0",
    followUpQuestion: {
      id: "job_blocked_reason",
      text: "What has been stopping you from submitting applications?",
      textAmharic: "ማቅረቢያ ከመላክ ምን አግዷዎ?",
      type: "textarea",
      required: true,
      aiFollowUpTrigger: true,
    },
  },
];

// ════════════════════════════════════════════════════════════
// Public API
// ════════════════════════════════════════════════════════════

export function getCareerQuestions(stage: CareerStage): CareerQuestion[] {
  return [...FOUNDATION_QUESTIONS, ...(STAGE_QUESTIONS[stage] ?? [])];
}

export function getFollowUpQuestion(
  questionId: string,
  answerValue: string
): CareerQuestion | null {
  const rule = FOLLOW_UP_RULES.find(
    (r) =>
      r.questionId === questionId &&
      (r.answerValue === answerValue || answerValue.includes(r.answerValue))
  );
  return rule?.followUpQuestion ?? null;
}

export function buildCareerProfile(answers: Record<string, string>): CareerProfile {
  return {
    geezName: answers["career_geez_name"] ?? "",
    motherGeezName: answers["career_mother_geez_name"] ?? "",
    careerStage: (answers["career_stage"] as CareerStage) ?? "exploring",
    businessType: (answers["career_business_type"] as BusinessType) ?? "not_yet_started",
    sector: answers["career_sector"] ?? "",
    yearsInCurrentField: parseInt(answers["career_years"] ?? "0", 10),
    hasExistingBusiness: ["growing_business", "scaling"].includes(answers["career_stage"] ?? ""),
    topGoal: answers["career_top_goal"] ?? "",
  };
}

export function hasSafetyTrigger(answers: Record<string, string>): boolean {
  return answers["recover_emotional_check"] === "yes";
}

export function requiresFinancialDisclaimer(questionId: string): boolean {
  const disclaimerQuestions = [
    "neg_type",
    "biz_start_funding",
    "scale_partner_interest",
    "trans_bridge",
    "neg_deadline",
  ];
  return disclaimerQuestions.includes(questionId);
}

export const FINANCIAL_DISCLAIMER =
  "This intake provides optional spiritual and cultural reflection only. It does not provide career, business, financial, legal, scientific, or predictive advice.";
