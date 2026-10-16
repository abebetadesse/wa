/**
 * Comprehensive Case-Intake Question Bank: Biological, Wellbeing, and Health
 *
 * Implements Section 4 (Questions aligned to Knowledge Strands A through K):
 * - Biological: Symptoms, body systems, severity, red-flag screening, daily life impact
 * - Biochemical: Lab measurements, deficiencies, supplements
 * - Medication: Prescribed medicines, OTC, herbs & traditional preparations, reactions
 * - Addiction: Neutral, skippable questions on khat, alcohol, tobacco, stimulants
 * - Ecological: Water source, biomass smoke, dust, seasonal fluctuations
 * - Epidemiological: Household/community illness, endemic travel, infection testing
 * - Psychological: Sleep changes, stress, mood, coping
 * - Socioeconomic: Basic needs, healthcare access barriers
 * - Dietary & Fasting: Traditional foods (injera, teff, kocho), fasting practices & timing
 * - Cultural: Optional traditional healing practices and perspectives
 *
 * Educational reflection only. Not a medical evaluation or substitute for clinical care.
 */

export interface BiologicalQuestion {
  id: string;
  text: string;
  textAmharic?: string;
  type: "text" | "textarea" | "select" | "radio" | "multi-select";
  required: boolean;
  options?: Array<{ value: string; label: string; labelAmharic?: string }>;
  placeholder?: string;
  hint?: string;
  strand?:
    | "biological"
    | "biochemical"
    | "medication"
    | "addiction"
    | "ecological"
    | "epidemiological"
    | "psychological"
    | "socioeconomic"
    | "dietary"
    | "cultural";
}

const preferNot = { value: "prefer_not", label: "Prefer not to say", labelAmharic: "መመለስ አልፈልግም" };

export const BIOLOGICAL_STRAND_QUESTIONS: BiologicalQuestion[] = [
  // ── A. Biological: Symptoms & Functional Impact ───────────────────────────
  {
    id: "symptom_onset_pattern",
    text: "When did your symptoms begin, and did they start suddenly or gradually?",
    textAmharic: "ምልክቶቹ መቼ ጀመሩ? በድንገት ነው ወይስ ቀስ በቀስ?",
    type: "select",
    required: false,
    strand: "biological",
    options: [
      { value: "sudden_days", label: "Suddenly within the last few days", labelAmharic: "ባለፉት ጥቂት ቀናት ውስጥ በድንገት" },
      { value: "gradual_weeks", label: "Gradually over weeks", labelAmharic: "ባለፉት ሳምንታት ቀስ በቀስ" },
      { value: "months_ongoing", label: "Ongoing over months or years", labelAmharic: "ለወራት ወይም ለዓመታት የቆየ" },
      { value: "recurrent_episodes", label: "Comes and goes in episodes", labelAmharic: "በየጊዜው ተመላልሶ የሚከሰት" },
      preferNot,
    ],
  },
  {
    id: "symptom_severity_impact",
    text: "How would you describe the severity of symptoms and their impact on daily life (sleep, eating, work, movement)?",
    textAmharic: "የምልክቶቹን ክብደት እና በዕለት ተዕለት ሕይወትዎ (እንቅልፍ፣ አመጋገብ፣ ሥራ፣ እንቅስቃሴ) ላይ ያላቸውን ተፅእኖ እንዴት ይገልጹታል?",
    type: "textarea",
    required: false,
    strand: "biological",
    placeholder: "Describe how symptoms limit your daily tasks or routines.",
  },
  {
    id: "symptom_triggers_relief",
    text: "What seems to make the symptoms better or worse (food, rest, physical exertion, stress, time of day)?",
    textAmharic: "ምልክቶቹን የሚያባብሰው ወይም የሚያስታግሰው ነገር ምንድን ነው (ምግብ፣ እረፍት፣ አካላዊ ድካም፣ ጭንቀት፣ የቀኑ ሰዓት)?",
    type: "textarea",
    required: false,
    strand: "biological",
  },
  {
    id: "red_flag_symptoms_screen",
    text: "Have you noticed any of the following new or worsening signs?",
    textAmharic: "ከሚከተሉት አዳዲስ ወይም እየተባባሱ ያሉ ምልክቶች አስተውለዋል?",
    type: "select",
    required: false,
    strand: "biological",
    options: [
      { value: "none", label: "None of these", labelAmharic: "ከእነዚህ ውስጥ አንዳቸውም የሉም" },
      { value: "fever_chills", label: "Persistent fever or severe chills", labelAmharic: "ቀጣይነት ያለው ትኩሳት ወይም ብርድ ብርድ ማለት" },
      { value: "unexplained_weight_loss", label: "Unexplained weight loss", labelAmharic: "ያለ ምክንያት ክብደት መቀነስ" },
      { value: "persistent_severe_pain", label: "Severe or persistent pain", labelAmharic: "ከፍተኛ ወይም የማይለቅ ህመም" },
      { value: "breathing_changes", label: "Shortness of breath with mild exertion", labelAmharic: "ትንሽ እንቅስቃሴ ሲያደርጉ የትንፋሽ ማጠር" },
      { value: "fainting_dizziness", label: "Fainting or severe dizziness", labelAmharic: "ራስን መሳት ወይም ከባድ የማዞር ስሜት" },
      { value: "multiple_signs", label: "Multiple of the above", labelAmharic: "ከላይ ከተጠቀሱት ከአንድ በላይ ምልክቶች" },
      preferNot,
    ],
    hint: "If you experience severe difficulty breathing, chest pain, or fainting, seek immediate emergency medical care.",
  },
  {
    id: "prior_clinical_diagnosis",
    text: "Have you previously received a diagnosis or clinical evaluation for this concern?",
    textAmharic: "ለዚህ ጉዳይ ከዚህ ቀደም የህክምና ምርመራ ወይም የታወቀ የበሽታ ስም ተነግሮዎታል?",
    type: "textarea",
    required: false,
    strand: "biological",
    placeholder: "Include what a health officer, physician, or clinic told you and approximately when.",
  },

  // ── B. Biochemical: Laboratory & Nutrient Deficiencies ──────────────────────
  {
    id: "lab_tests_summary",
    text: "Have you had laboratory tests (blood count, blood sugar, kidney, liver, electrolytes, urine, stool)?",
    textAmharic: "የላብራቶሪ ምርመራ አድርገዋል (የደም መጠን፣ ስኳር፣ ኩላሊት፣ ጉበት፣ ሽንት፣ ሰገራ)?",
    type: "textarea",
    required: false,
    strand: "biochemical",
    placeholder: "Mention what test was done, date, and reported results (if known).",
  },
  {
    id: "nutrient_deficiency_history",
    text: "Has a healthcare provider ever told you that you have a nutrient deficiency?",
    textAmharic: "የጤና ባለሙያ የንጥረ-ነገር እጥረት (ለምሳሌ የብረት እጥረት ደም ማነስ) እንዳለብዎት ነግሮዎት ያውቃል?",
    type: "select",
    required: false,
    strand: "biochemical",
    options: [
      { value: "no", label: "No known deficiencies", labelAmharic: "የታወቀ እጥረት የለም" },
      { value: "iron_anemia", label: "Iron deficiency / anemia (ደም ማነስ)", labelAmharic: "የብረት እጥረት / ደም ማነስ" },
      { value: "vitamin_d", label: "Vitamin D deficiency", labelAmharic: "የቫይታሚን ዲ እጥረት" },
      { value: "vitamin_b12", label: "Vitamin B12 or folate deficiency", labelAmharic: "የቫይታሚን ቢ12 ወይም ፎሊክ አሲድ እጥረት" },
      { value: "calcium_zinc", label: "Calcium, zinc, or other mineral deficiency", labelAmharic: "የካልሲየም፣ ዚንክ ወይም ሌላ ማዕድን እጥረት" },
      { value: "other_deficiency", label: "Other metabolic / nutrient issue", labelAmharic: "ሌላ የሰውነት ንጥረ-ነገር ጉዳይ" },
      preferNot,
    ],
  },
  {
    id: "supplements_current",
    text: "Are you taking vitamins, minerals, or supplements?",
    textAmharic: "ቫይታሚን፣ ማዕድናት ወይም ሌሎች የአመጋገብ ማሟያዎችን ይወስዳሉ?",
    type: "textarea",
    required: false,
    strand: "biochemical",
    placeholder: "List supplements, dosage if known, and who recommended them.",
  },

  // ── C. Medication & Traditional Remedies ────────────────────────────────────
  {
    id: "prescribed_medications",
    text: "What prescribed or pharmacy medications do you currently take?",
    textAmharic: "በአሁኑ ወቅት በሐኪም የታዘዙ ወይም ከፋርማሲ የገዟቸውን ምን ዓይነት መድኃኒቶች ይወስዳሉ?",
    type: "textarea",
    required: false,
    strand: "medication",
    placeholder: "List medication names and how often you take them.",
    hint: "Do not stop or adjust prescribed medications based on this questionnaire or report.",
  },
  {
    id: "recent_medication_changes",
    text: "Have you recently started, stopped, changed doses, or missed doses of any medicine?",
    textAmharic: "በቅርቡ ማንኛውንም መድኃኒት መውሰድ ጀምረዋል፣ አቁመዋል፣ መጠኑን ቀይረዋል ወይም አቋርጠዋል?",
    type: "textarea",
    required: false,
    strand: "medication",
  },
  {
    id: "traditional_herbs_remedies",
    text: "Do you use traditional herbs, medicinal teas, or home remedies (e.g., ጤና አዳም / Tenadam, ኮሶ / Kosso, ነጭ ሽንኩርት / Garlic, ዝንጅብል / Ginger, ዳማከሴ / Damakese)?",
    textAmharic: "ባህላዊ ዕፅዋትን፣ የባህል መድኃኒት ወይም የቤት ውስጥ ህክምናዎችን ይጠቀማሉ (ለምሳሌ ጤና አዳም፣ ኮሶ፣ ዳማከሴ፣ ዝንጅብል፣ ነጭ ሽንኩርት)?",
    type: "textarea",
    required: false,
    strand: "medication",
    placeholder: "Name the herb or preparation, how you prepare it (tea, chewed, topical), and how often.",
  },
  {
    id: "allergies_adverse_reactions",
    text: "Have you ever had an allergic or unexpected reaction to any medicine, herb, or food?",
    textAmharic: "ለማንኛውም መድኃኒት፣ ዕፅዋት ወይም ምግብ አለርጂ ወይም ያልተጠበቀ የጎንዮሽ ጉዳት አጋጥሞዎት ያውቃል?",
    type: "textarea",
    required: false,
    strand: "medication",
  },

  // ── D. Addiction & Substance Exposure (Neutral & Skippable) ────────────────
  {
    id: "substance_use_screen",
    text: "Would you like the reviewer to consider substance use (khat, alcohol, tobacco, high caffeine) in evaluating your symptoms?",
    textAmharic: "ገምጋሚው ምልክቶችዎን ሲመረምር የጫት፣ አልኮል፣ ትምባሆ ወይም ከፍተኛ ቡና አጠቃቀምን እንዲያካትት ይፈልጋሉ?",
    type: "select",
    required: false,
    strand: "addiction",
    options: [
      { value: "no", label: "No substance use to consider", labelAmharic: "የሚታይ የለም" },
      { value: "khat_use", label: "Khat chewing (ጫት መቃም)", labelAmharic: "ጫት መቃም" },
      { value: "alcohol_use", label: "Alcohol (tella, tej, beer, spirits)", labelAmharic: "አልኮል (ጠላ፣ ጠጅ፣ ቢራ፣ አረቄ)" },
      { value: "tobacco_use", label: "Tobacco / cigarettes / shisha", labelAmharic: "ትምባሆ / ሲጋራ / ሺሻ" },
      { value: "heavy_caffeine", label: "Heavy coffee / tea / energy drink consumption", labelAmharic: "ከፍተኛ የቡና / ሻይ አጠቃቀም" },
      { value: "multiple", label: "Combination of the above", labelAmharic: "ከላይ ከተጠቀሱት ጥምር" },
      preferNot,
    ],
  },
  {
    id: "substance_impact_details",
    text: "If applicable: how often do you use it, and have you noticed effects on sleep, appetite, mood, or heart rate?",
    textAmharic: "ተገቢ ከሆነ፡ ምን ያህል ጊዜ ይጠቀማሉ? በእንቅልፍ፣ በምግብ ፍላጎት፣ በስሜት ወይም በልብ ምት ላይ ያስተዋሉት ተፅእኖ አለ?",
    type: "textarea",
    required: false,
    strand: "addiction",
  },

  // ── E. Ecological & Environmental Factors ──────────────────────────────────
  {
    id: "water_source_type",
    text: "What is your primary drinking water source?",
    textAmharic: "ዋናው የመጠጥ ውኃ ምንጭዎ ምንድን ነው?",
    type: "select",
    required: false,
    strand: "ecological",
    options: [
      { value: "piped_treated", label: "Treated municipal tap / piped water", labelAmharic: "የቧንቧ ውኃ (የታከመ)" },
      { value: "piped_untreated", label: "Untreated piped / communal tap", labelAmharic: "የቧንቧ ውኃ (ያልታከመ)" },
      { value: "protected_well", label: "Protected well or borehole", labelAmharic: "የተከለለ ጉድጓድ ወይም ቦርሆል" },
      { value: "unprotected_surface", label: "Unprotected river, stream, or pond", labelAmharic: "ያልተከለለ ወንዝ፣ ጅረት ወይም ኩሬ" },
      { value: "bottled_water", label: "Bottled water", labelAmharic: "የታሸገ ውኃ" },
      preferNot,
    ],
  },
  {
    id: "environmental_exposures",
    text: "Are you exposed to indoor biomass smoke (firewood/charcoal), agricultural pesticides, dust, or industrial chemicals?",
    textAmharic: "የማገዶ/ከሰል ጭስ፣ የግብርና ፀረ-ተባይ ኬሚካሎች፣ አቧራ ወይም የኢንዱስትሪ ኬሚካሎች ተጋላጭነት አለብዎት?",
    type: "textarea",
    required: false,
    strand: "ecological",
    placeholder: "Mention indoor cooking ventilation, farm pesticide spray, dust, or work conditions.",
  },
  {
    id: "altitude_weather_changes",
    text: "Have you recently changed altitude (e.g. moving between highlands and lowlands) or do symptoms change with weather/season?",
    textAmharic: "በቅርቡ የከፍታ ለውጥ አድርገዋል (ከደጋ ወደ ቆላ ወይም በተቃራኒው)? ምልክቶችዎ ከአየር ሁኔታ ወይም ከወቅት ጋር ይለዋወጣሉ?",
    type: "textarea",
    required: false,
    strand: "ecological",
  },

  // ── F. Epidemiological: Exposure & Contagion ──────────────────────────────
  {
    id: "household_community_symptoms",
    text: "Has anyone in your household, workplace, or neighborhood had similar symptoms recently?",
    textAmharic: "በቤትዎ፣ በሥራ ቦታዎ ወይም በአካባቢዎ ተመሳሳይ ምልክት ያለው ሰው አለ?",
    type: "select",
    required: false,
    strand: "epidemiological",
    options: [
      { value: "no", label: "No one else affected", labelAmharic: "ሌላ የተጎዳ ሰው የለም" },
      { value: "household_members", label: "Yes, people in my household", labelAmharic: "አዎ፣ በቤቴ ውስጥ ያሉ ሰዎች" },
      { value: "work_community", label: "Yes, colleagues or neighbors", labelAmharic: "አዎ፣ የስራ ባልደረቦች ወይም ጎረቤቶች" },
      { value: "unsure", label: "Not sure", labelAmharic: "እርግጠኛ አይደለሁም" },
      preferNot,
    ],
  },
  {
    id: "recent_travel_exposure",
    text: "Have you recently travelled to an area known for malaria, waterborne illness, or infectious outbreaks?",
    textAmharic: "በቅርቡ የወባ፣ የውሃ ወለድ በሽታ ወይም ተላላፊ በሽታ ወደሚገኝበት አካባቢ ተጉዘዋል?",
    type: "text",
    required: false,
    strand: "epidemiological",
    placeholder: "e.g., travel to lowland river valley, regional travel, etc.",
  },

  // ── G. Psychological: Sleep, Stress & Mood ────────────────────────────────
  {
    id: "sleep_pattern_changes",
    text: "How has your sleep been recently?",
    textAmharic: "በቅርቡ የእንቅልፍ ሁኔታዎ ምን ይመስላል?",
    type: "select",
    required: false,
    strand: "psychological",
    options: [
      { value: "good_restful", label: "Normal and restful", labelAmharic: "ጥሩ እና የሚያረካ" },
      { value: "difficulty_falling_asleep", label: "Trouble falling asleep (latency)", labelAmharic: "እንቅልፍ ለመተኛት መቸገር" },
      { value: "frequent_night_waking", label: "Waking up frequently during the night", labelAmharic: "በሌሊት በተደጋጋሚ መንቃት" },
      { value: "unrefreshing_sleep", label: "Waking up exhausted / unrested", labelAmharic: "ከእንቅልፍ ሲነቁ ድካም መሰማት" },
      { value: "excessive_sleep", label: "Sleeping much more than usual", labelAmharic: "ከልክ በላይ መተኛት" },
      preferNot,
    ],
  },
  {
    id: "stress_and_mood_impact",
    text: "Have stress, anxiety, low mood, grief, or major life difficulties contributed to how your body feels?",
    textAmharic: "ጭንቀት፣ ፍርሃት፣ የሀዘን ስሜት ወይም ከባድ የህይወት ፈተናዎች በአካልዎ ላይ ተፅእኖ አሳድረዋል?",
    type: "textarea",
    required: false,
    strand: "psychological",
  },

  // ── H. Socioeconomic: Basic Needs & Healthcare Access ──────────────────────
  {
    id: "healthcare_access_barriers",
    text: "Are healthcare costs, transport distance, or work/family responsibilities making it difficult to visit a health facility?",
    textAmharic: "የህክምና ወጪ፣ የትራንስፖርት ርቀት ወይም የቤተሰብ/የስራ ኃላፊነት ወደ ጤና ተቋም ለመሄድ እንቅፋት ሆነዋል?",
    type: "textarea",
    required: false,
    strand: "socioeconomic",
  },

  // ── I. Dietary & Fasting Patterns ─────────────────────────────────────────
  {
    id: "typical_diet_patterns",
    text: "What does your typical daily diet consist of (e.g. injera, teff, shiro, lentils, kocho, dairy, meat, vegetables)?",
    textAmharic: "የተለመደው የዕለት ተዕለት ምግብዎ ምን ይመስላል (ለምሳሌ እንጀራ፣ ጤፍ፣ ሽሮ፣ ምስር፣ ቆጮ፣ ወተት ተዋጽኦ፣ ስጋ፣ አትክልት)?",
    type: "textarea",
    required: false,
    strand: "dietary",
    placeholder: "Mention your staple foods, meal regularity, and any foods you avoid.",
  },
  {
    id: "fasting_practices",
    text: "Do you observe religious fasting (e.g., Orthodox fasting seasons / Tsom, Ramadan, or weekly Wednesday/Friday fasting)?",
    textAmharic: "ሃይማኖታዊ ጾም ይጾማሉ (ለምሳሌ የኦርቶዶክስ አፅዋማት፣ ረመዳን፣ ወይም የረቡዕ እና ዓርብ ጾም)?",
    type: "select",
    required: false,
    strand: "dietary",
    options: [
      { value: "regular_fasting", label: "Yes, regular religious fasting (vegan / no animal products until afternoon)", labelAmharic: "አዎ፣ መደበኛ ሃይማኖታዊ ጾም" },
      { value: "ramadan_fasting", label: "Yes, dawn-to-dusk intermittent fasting (Ramadan)", labelAmharic: "አዎ፣ ከንጋት እስከ ጀምበር መጥለቅ (ረመዳን)" },
      { value: "occasional_fasting", label: "Occasional or modified fasting", labelAmharic: "አልፎ አልፎ የሚደረግ ጾም" },
      { value: "no_fasting", label: "No fasting practiced", labelAmharic: "አልጾምም" },
      preferNot,
    ],
  },
  {
    id: "fasting_energy_impact",
    text: "If you fast: does fasting affect your energy levels, digestion, medication schedule, or symptom severity?",
    textAmharic: "የሚጾሙ ከሆነ፡ ጾም በጉልበትዎ፣ በምግብ መፈጨትዎ፣ በመድኃኒት ሰዓትዎ ወይም በህመምዎ ላይ ተፅዕኖ አለው?",
    type: "textarea",
    required: false,
    strand: "dietary",
  },

  // ── J. Cultural & Traditional Healing Perspectives ────────────────────────
  {
    id: "cultural_healing_practices",
    text: "Are there traditional spiritual, herbal, or community healing practices you value and would like the reviewer to respect?",
    textAmharic: "ገምጋሚው እንዲያውቅልዎ እና እንዲያከብርልዎ የሚፈልጉት ባህላዊ፣ መንፈሳዊ ወይም የዕፅዋት ህክምና ልምዶች አሉ?",
    type: "textarea",
    required: false,
    strand: "cultural",
    placeholder: "e.g., holy water (ፀበል / tsebel), traditional bone-setting, prayer, herbal teas...",
    hint: "Cultural and spiritual practices are noted with respect and will not replace clinical safety evaluations.",
  },
];

/**
 * Returns modular biological questions.
 * All questions are optional and non-blocking.
 */
export function getBiologicalQuestions(): BiologicalQuestion[] {
  return BIOLOGICAL_STRAND_QUESTIONS;
}
