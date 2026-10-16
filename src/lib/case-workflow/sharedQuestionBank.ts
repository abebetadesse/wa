/**
 * Comprehensive Case-Intake Question Bank: Shared Modular Questions
 *
 * Implements Section 1 (Goal & Timeline), Section 3 (Shared Context),
 * Section 6 (Resources & Referrals), and Section 7 (Accuracy & Follow-up).
 *
 * Designed to be modular, sensitive, and skippable (`required: false`).
 */

export interface SharedWorkflowQuestion {
  id: string;
  text: string;
  textAmharic?: string;
  type: "text" | "textarea" | "select" | "radio" | "multi-select";
  required: boolean;
  options?: Array<{ value: string; label: string; labelAmharic?: string }>;
  placeholder?: string;
  hint?: string;
}

const preferNot = { value: "prefer_not", label: "Prefer not to say", labelAmharic: "መመለስ አልፈልግም" };

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: GOAL AND TIMELINE
// ═══════════════════════════════════════════════════════════════════════════════

export const CASE_GOAL_QUESTIONS: SharedWorkflowQuestion[] = [
  {
    id: "case_goal",
    text: "What would you like the report to help you understand, decide, prepare for, or discuss?",
    textAmharic: "ይህ ሪፖርት ምን እንዲረዱ፣ እንዲወስኑ፣ እንዲዘጋጁበት ወይም ከሌላ ሰው ጋር እንዲወያዩበት እንዲረዳዎት ይፈልጋሉ?",
    type: "textarea",
    required: false,
    placeholder: "e.g., understand possible contributing factors, prepare for a doctor/elder visit, make a peaceful choice...",
  },
  {
    id: "desired_outcome",
    text: "What would a useful outcome look like to you?",
    textAmharic: "ለእርስዎ ጠቃሚ ውጤት ምን ሊመስል ይችላል?",
    type: "text",
    required: false,
    placeholder: "e.g., clear next steps, peace of mind, family harmony, better sleep...",
  },
  {
    id: "urgent_focus",
    text: "Which part of the situation feels most important or urgent right now?",
    textAmharic: "አሁን በሁኔታው ውስጥ በጣም አስፈላጊ ወይም አስቸኳይ የሚሰማዎት የትኛው ክፍል ነው?",
    type: "text",
    required: false,
  },
  {
    id: "timeline_onset",
    text: "When did the concern first begin, and has it changed recently?",
    textAmharic: "ጉዳዩ ለመጀመሪያ ጊዜ መቼ ተጀመረ? በቅርቡ ለውጥ አሳይቷል?",
    type: "select",
    required: false,
    options: [
      { value: "past_few_days", label: "In the past few days", labelAmharic: "ባለፉት ጥቂት ቀናት" },
      { value: "past_few_weeks", label: "In the past few weeks", labelAmharic: "ባለፉት ጥቂት ሳምንታት" },
      { value: "past_few_months", label: "In the past few months", labelAmharic: "ባለፉት ጥቂት ወራት" },
      { value: "over_a_year", label: "Over a year ago / ongoing", labelAmharic: "ከአንድ አመት በላይ / ቀጣይነት ያለው" },
      { value: "comes_and_goes", label: "It comes and goes in cycles", labelAmharic: "ይመጣል ይሄዳል (ተመላልሶ የሚከሰት)" },
      preferNot,
    ],
  },
  {
    id: "timeline_trajectory",
    text: "How has the situation progressed over time?",
    textAmharic: "ሁኔታው በጊዜ ሂደት እንዴት እየሄደ ነው?",
    type: "select",
    required: false,
    options: [
      { value: "worsening", label: "Gradually or rapidly worsening", labelAmharic: "እየተባባሰ ነው" },
      { value: "stayed_same", label: "Stayed about the same", labelAmharic: "ተመሳሳይ ሆኖ ቀጥሏል" },
      { value: "improving", label: "Improving or stabilizing", labelAmharic: "እየተሻሻለ ነው" },
      { value: "unpredictable", label: "Unpredictable / fluctuates", labelAmharic: "ተለዋዋጭ ነው" },
      preferNot,
    ],
  },
  {
    id: "recent_changes",
    text: "Have there been recent changes in your life—illness, new medication, relocation, relationship shift, financial pressure, or routine change?",
    textAmharic: "በቅርቡ በህይወትዎ ውስጥ ለውጦች ተከስተዋል—ህመም፣ አዲስ መድሃኒት፣ የመኖሪያ ለውጥ፣ የቤተሰብ ለውጥ፣ የገንዘብ ጫና ወይም የዕለት ተዕለት ለውጥ?",
    type: "textarea",
    required: false,
  },
  {
    id: "previous_attempts",
    text: "What have you already tried? What helped, did not help, or made things worse?",
    textAmharic: "እስካሁን ምን ሞክረዋል? የትኛው ረዳ፣ የትኛው አልረዳም ወይም አባባሰው?",
    type: "textarea",
    required: false,
  },
  {
    id: "avoid_focus",
    text: "Is there anything you do NOT want the reviewer or report to focus on?",
    textAmharic: "ገምጋሚው ወይም ሪፖርቱ ትኩረት እንዳያደርግበት የሚፈልጉት ነገር አለ?",
    type: "text",
    required: false,
  },
  {
    id: "report_format_preference",
    text: "Would you prefer the report to be brief and practical, detailed and explanatory, or a combination?",
    textAmharic: "ሪፖርቱ አጭር እና ተግባራዊ፣ ዝርዝር እና ገላጭ፣ ወይስ ሁለቱንም ያጣመረ እንዲሆን ይመርጣሉ?",
    type: "select",
    required: false,
    options: [
      { value: "brief_practical", label: "Brief and practical (action-oriented)", labelAmharic: "አጭር እና ተግባራዊ" },
      { value: "detailed_explanatory", label: "Detailed and explanatory (in-depth)", labelAmharic: "ዝርዝር እና ገላጭ" },
      { value: "combination", label: "Combination of both", labelAmharic: "ሁለቱንም ያጣመረ" },
      preferNot,
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: SHARED CONTEXT (ENVIRONMENT, LANGUAGE, ACCESS & STRENGTHS)
// ═══════════════════════════════════════════════════════════════════════════════

export const SHARED_CONTEXT_QUESTIONS: SharedWorkflowQuestion[] = [
  {
    id: "location_setting",
    text: "What best describes your current setting? (Please do not provide a street address)",
    textAmharic: "የአሁኑ የመኖሪያ አካባቢዎ ምን ይመስላል? (እባክዎ የቤት አድራሻ አይስጡ)",
    type: "select",
    required: false,
    options: [
      { value: "urban", label: "Urban / city", labelAmharic: "ከተማ" },
      { value: "semi_urban", label: "Semi-urban / town", labelAmharic: "ከፊል-ከተማ / ወረዳ ማዕከል" },
      { value: "rural", label: "Rural agrarian", labelAmharic: "ገጠር / የግብርና አካባቢ" },
      { value: "pastoralist", label: "Pastoralist / agro-pastoralist", labelAmharic: "አርብቶ አደር" },
      { value: "diaspora", label: "Living abroad / diaspora", labelAmharic: "ከኢትዮጵያ ውጭ / ዲያስፖራ" },
      preferNot,
    ],
  },
  {
    id: "language_preference",
    text: "What language do you prefer for reviewer communication and reports?",
    textAmharic: "ለገምጋሚው መልዕክት እና ለሪፖርቱ የትኛውን ቋንቋ ይመርጣሉ?",
    type: "select",
    required: false,
    options: [
      { value: "amharic", label: "አማርኛ (Amharic)", labelAmharic: "አማርኛ" },
      { value: "english", label: "English", labelAmharic: "እንግሊዝኛ" },
      { value: "oromo", label: "Afaan Oromoo", labelAmharic: "ኦሮምኛ" },
      { value: "tigrinya", label: "ትግርኛ (Tigrinya)", labelAmharic: "ትግርኛ" },
      { value: "somali", label: "Soomaali (Somali)", labelAmharic: "ሶማሊኛ" },
      preferNot,
    ],
  },
  {
    id: "consultation_format_preference",
    text: "If a follow-up consultation is available, what format would be most practical for you?",
    textAmharic: "የቀጣይ የምክክር አገልግሎት ካለ፣ ለእርስዎ የበለጠ ምቹ የሚሆነው የትኛው ነው?",
    type: "select",
    required: false,
    options: [
      { value: "chat", label: "Secure in-app chat", labelAmharic: "በመተግበሪያ ውስጥ የጽሑፍ ውይይት" },
      { value: "voice", label: "Phone or voice call", labelAmharic: "የስልክ ወይም የድምፅ ጥሪ" },
      { value: "video", label: "Video consultation", labelAmharic: "የቪዲዮ ምክክር" },
      { value: "in_person", label: "In-person (where available)", labelAmharic: "በአካል (አካባቢው ሲኖር)" },
      preferNot,
    ],
  },
  {
    id: "life_obligations",
    text: "Are family responsibilities, caregiving, work, study, housing, or transport shaping your practical options?",
    textAmharic: "የቤተሰብ ኃላፊነት፣ ተንከባካቢነት፣ ሥራ፣ ትምህርት፣ ቤት ወይም ትራንስፖርት አማራጮችዎን እየወሰኑ ናቸው?",
    type: "textarea",
    required: false,
    placeholder: "Mention obligations that affect what is manageable or realistic for you.",
  },
  {
    id: "coping_strengths",
    text: "What personal, family, faith, or community strengths can you draw on right now?",
    textAmharic: "አሁን ሊጠቀሙባቸው የሚችሉ የግል፣ የቤተሰብ፣ የእምነት ወይም የማህበረሰብ ጥንካሬዎች ምንድን ናቸው?",
    type: "textarea",
    required: false,
    placeholder: "e.g., prayer, patience, supportive siblings, community iddir/mahber...",
  },
  {
    id: "assumptions_to_avoid",
    text: "What should the reviewer avoid assuming about you, your family, your beliefs, or your circumstances?",
    textAmharic: "ገምጋሚው ስለ እርስዎ፣ ቤተሰብዎ፣ እምነትዎ ወይም ሁኔታዎ ምን ከመገመት መቆጠብ አለበት?",
    type: "textarea",
    required: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: RESOURCES, REFERRALS, AND SERVICES
// ═══════════════════════════════════════════════════════════════════════════════

export const RESOURCE_AND_REFERRAL_QUESTIONS: SharedWorkflowQuestion[] = [
  {
    id: "desired_support_path",
    text: "What kind of support would be most useful to you after receiving the report?",
    textAmharic: "ሪፖርቱን ከተቀበሉ በኋላ የትኛው ድጋፍ የበለጠ ይጠቅምዎታል?",
    type: "select",
    required: false,
    options: [
      { value: "health_clinician", label: "Health centre or qualified medical professional", labelAmharic: "የጤና ጣቢያ ወይም የህክምና ባለሙያ" },
      { value: "counsellor", label: "Mental health counsellor or psychologist", labelAmharic: "የአእምሮ ጤና ወይም የስነ-ልቦና አማካሪ" },
      { value: "legal_aid", label: "Legal aid clinic or community elders (ሽምግልና)", labelAmharic: "የህግ ድጋፍ ወይም የሽምግልና ሽማግሌዎች" },
      { value: "social_services", label: "Kebele social worker / safety net programme", labelAmharic: "የቀበሌ ማህበራዊ ሰራተኛ / ሴፍቲ ኔት" },
      { value: "community_support", label: "Faith or community group (iddir, church, mosque)", labelAmharic: "የእምነት ወይም የማህበረሰብ ቡድን (እድር፣ ቤተክርስቲያን፣ መስጊድ)" },
      { value: "reviewer_consultation", label: "Direct consultation with this case's reviewer", labelAmharic: "ከዚህ ጉዳይ ገምጋሚ ጋር የቀጥታ ምክክር" },
      { value: "self_reflection_only", label: "No referrals needed; I want to reflect on my own", labelAmharic: "ምንም ሪፈራል አያስፈልግም፤ ራሴ ማሰላሰል እፈልጋለሁ" },
      preferNot,
    ],
  },
  {
    id: "referral_barriers",
    text: "Are cost, transport, distance, language, privacy, or family pressure making it difficult to access help?",
    textAmharic: "ወጪ፣ ትራንስፖርት፣ ርቀት፣ ቋንቋ፣ ሚስጥራዊነት ወይም የቤተሰብ ጫና እርዳታ ለማግኘት አስቸጋሪ አድርገውታል?",
    type: "textarea",
    required: false,
    placeholder: "Mention any barriers so the reviewer can suggest practical, realistic options.",
  },
  {
    id: "prepare_questions_help",
    text: "Would you like the report to include suggested questions to ask a doctor, counsellor, lawyer, or community elder?",
    textAmharic: "ሪፖርቱ ለሀኪም፣ ለአማካሪ፣ ለህግ ባለሙያ ወይም ለሽማግሌ የሚጠየቁ ጥያቄዎችን እንዲያካትት ይፈልጋሉ?",
    type: "select",
    required: false,
    options: [
      { value: "yes", label: "Yes, please provide question prompts", labelAmharic: "አዎ፣ እባክዎ የጥያቄ ሃሳቦችን ያካትቱ" },
      { value: "no", label: "No, that is not necessary", labelAmharic: "አይ፣ አያስፈልግም" },
      preferNot,
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: REPORT ACCURACY AND REVIEWER FOLLOW-UP
// ═══════════════════════════════════════════════════════════════════════════════

export const ACCURACY_AND_FOLLOWUP_QUESTIONS: SharedWorkflowQuestion[] = [
  {
    id: "accuracy_reflection",
    text: "Is there any detail the questions might have misunderstood or left out that you want noted?",
    textAmharic: "ጥያቄዎቹ ያልተረዱት ወይም የተተወ እንዲስተካከል የሚፈልጉት ዝርዝር ነገር አለ?",
    type: "textarea",
    required: false,
  },
  {
    id: "private_reviewer_notes",
    text: "Is there sensitive information you would rather discuss privately with the reviewer during a consultation?",
    textAmharic: "በምክክር ወቅት ከገምጋሚው ጋር በሚስጥር ብቻ ሊወያዩበት የሚመርጡት ሚስጥራዊ መረጃ አለ?",
    type: "textarea",
    required: false,
  },
  {
    id: "reviewer_followup_consent",
    text: "Are you open to receiving clarifying follow-up questions from the reviewer if needed?",
    textAmharic: "አስፈላጊ ሆኖ ሲገኝ ከገምጋሚው ተጨማሪ የማጣሪያ ጥያቄዎችን ለመቀበል ፍቃደኛ ነዎት?",
    type: "select",
    required: false,
    options: [
      { value: "yes", label: "Yes, I am happy to answer follow-up questions", labelAmharic: "አዎ፣ ተጨማሪ ጥያቄዎችን ለመመለስ ፈቃደኛ ነኝ" },
      { value: "no", label: "No, please base the report only on what I provided", labelAmharic: "አይ፣ ሪፖርቱ በሰጠሁት መረጃ ላይ ብቻ የተመሰረተ ይሁን" },
      preferNot,
    ],
  },
  {
    id: "safe_contact_preferences",
    text: "What is a safe way and time for the reviewer or support team to contact you?",
    textAmharic: "ገምጋሚው ወይም የድጋፍ ቡድኑ እርስዎን ለማግኘት ምቹ እና አስተማማኝ መንገድ እና ሰዓት የትኛው ነው?",
    type: "text",
    required: false,
    placeholder: "e.g., in-app messages only, weekday mornings, evening phone call...",
  },
];
