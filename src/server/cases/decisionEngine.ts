/**
 * Decision Engine for Case Analysis.
 *
 * Enriches root causes with category classifications, decision guidance (immediate action,
 * diagnostic checks, threshold criteria, priority), curated Ethiopian and clinical resources,
 * profile-driven metabolic/environmental hypotheses, and synthesized decision frameworks.
 */
import type { UserProfile } from "@/lib/knowledge/types";
import { EMERGENCY_GUIDANCE, EMERGENCY_GUIDANCE_AMHARIC } from "@/lib/safety/emergencyContacts";
import { REFERRALS } from "./support";
import type {
  AnalysisCause,
  AnalysisConfidence,
  CauseCategory,
  ClinicalPicture,
  DecisionFramework,
  DecisionGuidance,
  DecisionResource,
} from "./types";
import type { DetectedFactor } from "./analysis";

// Curated reference catalogues
const STANDARD_RESOURCES: Record<string, DecisionResource> = {
  ephcg_general: {
    title: "Ethiopian Primary Health Care Clinical Guidelines (EPHCG)",
    titleAmharic: "የኢትዮጵያ የመጀመሪያ ደረጃ ጤና ክብካቤ ክሊኒካዊ መመሪያዎች",
    type: "clinical_guideline",
    description: "National protocol for outpatient triage, laboratory evaluations, and evidence-based referrals at health centre level.",
    descriptionAmharic: "በጤና ጣቢያ ደረጃ ለቅድመ ምርመራ፣ የላቦራቶሪ ምርመራዎችና ሪፈራል የሚረዳ ብሔራዊ የክሊኒክ መመሪያ።",
    evidenceGrade: "strong",
  },
  etm_db_herbal: {
    title: "Ethiopian Traditional Medicine Database (ETM-DB) Monograph",
    titleAmharic: "የኢትዮጵያ ባህላዊ መድኃኒቶች ዳታቤዝ (ETM-DB) ሰነድ",
    type: "indigenous_remedy",
    description: "EPHI verified research on pharmacological actions, traditional preparations, safety boundaries, and drug-herb interactions.",
    descriptionAmharic: "በኢትዮጵያ የሕብረተሰብ ጤና ኢንስቲትዩት የተረጋገጠ የባህላዊ ዕፅዋት አጠቃቀም፣ መጠን እና የመድኃኒት መስተጋብር ጥናት።",
    evidenceGrade: "moderate",
  },
  ephi_nutrition: {
    title: "EPHI National Dietary & Nutrition Advisory",
    titleAmharic: "የኢትዮጵያ የሕብረተሰብ ጤና ኢንስቲትዩት የአመጋገብ ምክር",
    type: "nutrition_strategy",
    description: "Guidelines on indigenous food biofortification, sourdough teff fermentation, and mineral bioavailability enhancement.",
    descriptionAmharic: "የባህላዊ ምግቦች ዝግጅት፣ የጤፍ እርሾ ማብላላት እና የተመጣጠነ ምግብ አጠቃቀም መመሪያ።",
    evidenceGrade: "strong",
  },
  crisis_hotline: {
    title: "Emergency and protection services",
    titleAmharic: "የድንገተኛ አደጋና የጥበቃ አገልግሎቶች",
    type: "safety_alert",
    urlOrContact: EMERGENCY_GUIDANCE,
    description: "24/7 immediate emergency support for gender-based violence, domestic safety, and crisis intervention.",
    descriptionAmharic: "ለጾታዊ ጥቃት፣ ለቤተሰብ ደህንነት እና ለአስቸኳይ ጥበቃ የሚሰጥ የ24 ሰዓት የነጻ የስልክ አገልግሎት።",
    evidenceGrade: "strong",
  },
  mental_health_referral: {
    title: "National Mental Health Care Directory (St. Amanuel / EPHI)",
    titleAmharic: "ብሔራዊ የአእምሮ ጤና አገልግሎት ማውጫ (ቅዱስ አማኑኤል / EPHI)",
    type: "referral_directory",
    urlOrContact: "St. Amanuel Mental Specialized Hospital",
    description: "Access to licensed clinical psychologists, psychiatric nurses, and community mental wellbeing clinics across regions.",
    descriptionAmharic: "በክልሎች የሚገኙ የስነ-ልቦና እና የአእምሮ ጤና ባለሙያዎችና ክሊኒኮች አድራሻ።",
    evidenceGrade: "strong",
  },
  maternal_health_anc: {
    title: "National Antenatal Care (ANC) & Micronutrient Protocol",
    titleAmharic: "ብሔራዊ የቅድመ ወሊድ ክትትልና ማይክሮኒውትሪየንት መመሪያ",
    type: "clinical_guideline",
    description: "Guidelines on maternal iron-folic acid supplementation, dietary diversity, and herbal contraindications in pregnancy.",
    descriptionAmharic: "በእርግዝና ወቅት የብረትና ፎሊክ አሲድ ክትትል፣ የተመጣጠነ ምግብ እና መወገድ ያለባቸው ዕፅዋት መመሪያ።",
    evidenceGrade: "strong",
  },
  fasting_resilience: {
    title: "Ethiopian Orthodox Tsom Nutritional Resilience Strategy",
    titleAmharic: "የአጽዋማት ወቅት የተመጣጠነ ምግብ አጠቃቀም ስልት",
    type: "nutrition_strategy",
    description: "Indigenous legume combinations (ater, misir, bakela), oil seeds (nug, talba), and meal timing to prevent micronutrient depletions during fasts.",
    descriptionAmharic: "በጾም ወቅት የፕሮቲንና የብረት እጥረትን ለመከላከል የጥራጥሬዎች (አተር፣ ምስር፣ ባቄላ) እና የቅባት እህሎች (ኑግ፣ ተልባ) ጥምረት።",
    evidenceGrade: "traditional",
  },
  altitude_adaptation: {
    title: "Highland Physiological Adaptation & Hydration Guide",
    titleAmharic: "የደጋማ አካባቢ የሰውነት መላመድና የውሃ አጠቃቀም መመሪያ",
    type: "clinical_guideline",
    description: "Compensatory hydration and hemoglobin baseline adjustments for populations living above 2,200m altitude.",
    descriptionAmharic: "ከ2,200 ሜትር በላይ ከፍታ ላይ ለሚኖሩ ሰዎች የሰውነት ፈሳሽና የደም መጠን ማስተካከያ መመሪያ።",
    evidenceGrade: "strong",
  },
};

export function categorizeCause(causeId: string, factors: string[]): CauseCategory {
  if (factors.some((f) => ["violence", "conflict", "family", "isolation", "grief", "money", "work", "legal"].includes(f))) {
    return "psychosocial_relational";
  }
  if (
    factors.some((f) => ["food", "caffeine", "substance"].includes(f)) ||
    causeId.includes("tannin") ||
    causeId.includes("fasting") ||
    causeId.includes("food_energy")
  ) {
    return "nutritional_metabolic";
  }
  if (
    factors.some((f) => ["physical", "abdominal", "weight_loss", "fatigue", "fever_sweats", "jaundice", "thirst_urination", "respiratory", "headache_dizziness"].includes(f)) ||
    causeId.includes("altitude") ||
    causeId.includes("anaemia") ||
    causeId.includes("gut_upset") ||
    causeId.includes("liver_signs") ||
    causeId.includes("maternal")
  ) {
    return "clinical_physiological";
  }
  if (factors.some((f) => ["spiritual", "purpose"].includes(f))) {
    return "cultural_spiritual";
  }
  return "lifestyle_environmental";
}

export function buildDecisionGuidance(
  causeId: string,
  factors: string[],
  profile: UserProfile
): DecisionGuidance {
  const has = (...ids: string[]) => factors.some((f) => ids.includes(f));

  if (has("violence")) {
    return {
      immediateAction: "Verify physical safety immediately and establish a trusted contact before taking any further steps.",
      immediateActionAmharic: "ማንኛውንም ተጨማሪ እርምጃ ከመውሰድዎ በፊት ወዲያውኑ አካላዊ ደህንነትዎን ያረጋግጡና ታማኝ የቤተሰብ ሰው ያነጋግሩ።",
      diagnosticCheck: "Urgent safety audit and legal/protection intake with trained social worker or local law enforcement.",
      diagnosticCheckAmharic: "አስቸኳይ የደህንነት ግምገማ እና ከማህበራዊ ሰራተኛ ወይም ከህግ አስከባሪ ጋር የሚደረግ ቃለ-መጠይቅ።",
      thresholdCriteria: "Any immediate threat of physical harm or intimidation requires immediate contact with local emergency services.",
      thresholdCriteriaAmharic: "ማንኛውም የአካላዊ ጥቃት ወይም የማስፈራራት ስጋት ካለ ወዲያውኑ በአካባቢው ያለውን የድንገተኛ አደጋ አገልግሎት ማግኘት ያስፈልጋል።",
      priority: "urgent",
    };
  }

  if (causeId === "tannin_chelation_iron" || (has("caffeine", "food") && has("fatigue"))) {
    return {
      immediateAction: "Shift drinking tea or coffee (bunna) to at least 90-120 minutes after meals to prevent polyphenol tannin chelation of iron and zinc.",
      immediateActionAmharic: "ሻይ ወይም ቡና ከምግብ ጋር አብሮ ከመጠጣት ይልቅ ከምግብ በኋላ ከ90 እስከ 120 ደቂቃዎች አዘግይተው ይጠጡ፤ ይህም የብረትና ዚንክ ንጥረ ነገሮች እንዳይመከኑ ይረዳል።",
      diagnosticCheck: "Complete blood count (CBC) and serum ferritin test at a local health centre.",
      diagnosticCheckAmharic: "በአቅራቢያዎ በሚገኝ ጤና ጣቢያ የተሟላ የደም ምርመራ (CBC) እና የፌሪቲን (ferritin) ምርመራ ማድረግ።",
      thresholdCriteria: "If fatigue, dizziness, or paleness persist after 2-3 weeks of beverage separation, request clinical evaluation for iron deficiency anemia.",
      thresholdCriteriaAmharic: "የቡና/ሻይ ሰዓት ካስተካከሉ ከ2-3 ሳምንታት በኋላ ድካም፣ የማዞር ስሜት ወይም የፊት መንጣት ካልተሻሻለ የደም ማነስ ምርመራ ያድርጉ።",
      priority: "moderate",
    };
  }

  if (causeId === "altitude_adaptation_strain") {
    return {
      immediateAction: "Increase daily water intake by 500-800ml and incorporate iron-dense greens (gomen), teff, and lentils to support erythropoiesis.",
      immediateActionAmharic: "በየቀኑ የሚጠጡትን የውሃ መጠን በግማሽ ሊትር ይጨምሩ፤ እንዲሁም የደም ሴሎችን ለማጠናከር ጎመን፣ ጤፍ እና ምስር አዘውትረው ይመገቡ።",
      diagnosticCheck: "Hemoglobin and hematocrit with altitude-adjusted reference ranges (>2,200m requires approx +1.5-2.0 g/dL threshold).",
      diagnosticCheckAmharic: "ከደጋማ ከፍታ ጋር የተስተካከለ የሂሞግሎቢን ምርመራ (ከ2200 ሜትር በላይ የደም መጠን ገደብ ከ1.5-2.0 ከፍ ይላል)።",
      thresholdCriteria: "Exertional breathlessness or persistent morning headaches at altitude indicate oxygenation check or clinical review.",
      thresholdCriteriaAmharic: "በእንቅስቃሴ ወቅት የትንፋሽ ማጠር ወይም ጠዋት ጠዋት ራስ ምታት ከቀጠለ ክሊኒካዊ ምርመራ ያስፈልጋል።",
      priority: "moderate",
    };
  }

  if (causeId === "fasting_metabolic_adaptation" || (has("food") && has("fatigue", "weight_loss"))) {
    return {
      immediateAction: "Diversify plant-based protein combinations: mix roasted pulses (kolo, besso) with flaxseed (talba) and include seasonal legumes daily.",
      immediateActionAmharic: "በጾም ወቅት የፕሮቲን ምንጮችን ያዳብሩ፡ ቆሎ እና በሶን ከተልባ ጋር ይቀላቅሉ፤ ምስር፣ ሽምብራና ባቄላ በየቀኑ ያካትቱ።",
      diagnosticCheck: "Fasting blood glucose, serum albumin, and basic metabolic panel if lethargy or unintentional weight loss continues.",
      diagnosticCheckAmharic: "ድካም ወይም የክብደት መቀነስ ከቀጠለ የጾም ወቅት የስኳር መጠንና የሰውነት አልቡሚን ምርመራ ማድረግ።",
      thresholdCriteria: "Unintended weight loss exceeding 5% in 3 months or persistent lightheadedness warrants temporary fasting exemption under spiritual and medical guidance.",
      thresholdCriteriaAmharic: "በ3 ወራት ውስጥ ከ5% በላይ ያልታሰበ ክብደት መቀነስ ወይም ተደጋጋሚ ራስ ማዞር ካለ የጾም እረፍት ለማግኘት የሃይማኖትና የህክምና ምክር ይጠይቁ።",
      priority: "moderate",
    };
  }

  if (has("weight_loss") || has("abdominal") || has("fever_sweats") || has("jaundice")) {
    return {
      immediateAction: "Book an in-person diagnostic evaluation at a health centre or clinic within 48 to 72 hours; keep a symptom and meal log.",
      immediateActionAmharic: "በ48 እስከ 72 ሰዓታት ውስጥ በአቅራቢያዎ ጤና ጣቢያ ወይም ክሊኒክ በአካል በመሄድ ምርመራ ያድርጉ፤ የበሉትንና የተሰማዎትን ማስታወሻ ይያዙ።",
      diagnosticCheck: "Stool examination for ova and parasites, H. pylori antigen, CBC, abdominal ultrasound if persistent.",
      diagnosticCheckAmharic: "የሰገራ ምርመራ (ለጥገኛ ተህዋስያን)፣ የጨጓራ ባክቴሪያ (H. pylori) እና አስፈላጊ ከሆነ የአልትራሳውንድ ምርመራ።",
      thresholdCriteria: "Blood in stool, unremitting vomiting, high fever, or visible jaundice (yellow eyes) requires same-day emergency assessment.",
      thresholdCriteriaAmharic: "በሰገራ ውስጥ ደም ከታየ፣ ተደጋጋሚ ማስመለስ፣ ከፍተኛ ትኩሳት ወይም የአይን ቢጫ መሆን ከታየ በዕለቱ ወደ ድንገተኛ ህክምና ይሂዱ።",
      priority: "high",
    };
  }

  if (has("money", "conflict", "family")) {
    return {
      immediateAction: "Agree on one designated quiet hour this week to list household obligations together without assigning fault.",
      immediateActionAmharic: "በዚህ ሳምንት ውስጥ የቤተሰብ ወጪዎችንና እዳዎችን በግልጽ ለመነጋገር አንድ ሰላማዊ ሰዓት መድቡ።",
      diagnosticCheck: "Structured household income-versus-debt inventory and elder mediation (Shemgelna) check.",
      diagnosticCheckAmharic: "የቤተሰብ ገቢና ወጪን በግልጽ ማስላት እና አስፈላጊ ከሆነ የሽምግልና ድጋፍ ማግኘት።",
      thresholdCriteria: "If financial arguments escalate to threats, intimidation, or property destruction, activate safety planning.",
      thresholdCriteriaAmharic: "የገንዘብ ክርክሮች ወደ ማስፈራራት ወይም ጥቃት የሚያመሩ ከሆነ የደህንነት ጥበቃ ያድርጉ።",
      priority: "moderate",
    };
  }

  if (has("sleep", "anxiety", "low_mood")) {
    return {
      immediateAction: "Establish a strict anchor wake-up time for 14 consecutive days and halt stimulant use (coffee, tea, khat) after 1:00 PM.",
      immediateActionAmharic: "ለ14 ተከታታይ ቀናት ቋሚ የመነሻ ሰዓት ይኑርዎት፤ ከቀኑ 7 ሰዓት በኋላ ቡና፣ ሻይ ወይም ጫት አይጠቀሙ።",
      diagnosticCheck: "PHQ-9 depression / GAD-7 anxiety screening assessment with a healthcare provider or counselor.",
      diagnosticCheckAmharic: "ከጤና ባለሙያ ወይም ከአማካሪ ጋር የስነ-ልቦና ግምገማ (PHQ-9 / GAD-7) ማድረግ።",
      thresholdCriteria: "Feelings of hopelessness lasting over 14 days or any thoughts of self-harm require direct consultation with a mental health professional.",
      thresholdCriteriaAmharic: "ከ14 ቀናት በላይ የዘለቀ የድብርት ስሜት ወይም ራስን የመጉዳት ሀሳብ ከመጣ ወዲያውኑ የአእምሮ ጤና ባለሙያ ያማክሩ።",
      priority: "moderate",
    };
  }

  return {
    immediateAction: "Review this hypothesis with the expert and note how your daily patterns and environment align with it.",
    immediateActionAmharic: "ይህን መላ-ምት ከባለሙያው ጋር ይወያዩበትና ከዕለት ተዕለት ልምድዎ ጋር እንዴት እንደሚገናኝ ያገናዝቡ።",
    diagnosticCheck: "Routine health checkup or situational review with relevant family or community counsel.",
    diagnosticCheckAmharic: "መደበኛ የጤና ምርመራ ወይም ከቤተሰብና ማህበረሰብ ሽማግሌዎች ጋር የሚደረግ ውይይት።",
    thresholdCriteria: "If the situation causes progressive daily functional impairment, seek structured professional consultation.",
    thresholdCriteriaAmharic: "ሁኔታው የዕለት ተዕለት ኑሮዎን እያስተጓጎለ ከቀጠለ የባለሙያ ድጋፍ ያግኙ።",
    priority: "routine",
  };
}

export function buildDecisionResources(
  causeId: string,
  factors: string[],
  profile: UserProfile
): DecisionResource[] {
  const resources: DecisionResource[] = [];
  const has = (...ids: string[]) => factors.some((f) => ids.includes(f));

  if (has("violence")) {
    resources.push(STANDARD_RESOURCES.crisis_hotline);
    resources.push(STANDARD_RESOURCES.mental_health_referral);
    return resources;
  }

  if (causeId === "tannin_chelation_iron" || (has("caffeine", "food") && has("fatigue"))) {
    resources.push(STANDARD_RESOURCES.ephi_nutrition);
    resources.push(STANDARD_RESOURCES.ephcg_general);
  }

  if (causeId === "altitude_adaptation_strain" || (profile.location?.altitude && profile.location.altitude >= 2200)) {
    resources.push(STANDARD_RESOURCES.altitude_adaptation);
  }

  if (causeId === "fasting_metabolic_adaptation" || profile.lifestyle?.fasting || has("food")) {
    resources.push(STANDARD_RESOURCES.fasting_resilience);
    resources.push(STANDARD_RESOURCES.ephi_nutrition);
  }

  if (profile.pregnant || profile.lactating || profile.pregnancyOrLactation?.startsWith("pregnant")) {
    resources.push(STANDARD_RESOURCES.maternal_health_anc);
  }

  if (has("physical", "abdominal", "weight_loss", "fatigue", "fever_sweats")) {
    resources.push(STANDARD_RESOURCES.ephcg_general);
    resources.push(STANDARD_RESOURCES.etm_db_herbal);
  }

  if (has("anxiety", "low_mood", "sleep", "isolation", "grief")) {
    resources.push(STANDARD_RESOURCES.mental_health_referral);
  }

  if (!resources.length) {
    resources.push(STANDARD_RESOURCES.ephcg_general);
  }

  return resources;
}

export function buildDecisionFramework(
  causes: AnalysisCause[],
  detected: DetectedFactor[],
  urgency: { level: string; score: number; signals: string[]; recommendation: string },
  profile: UserProfile,
  clinical?: ClinicalPicture
): DecisionFramework {
  const activeCauses = causes.filter((c) => c.status !== "ruled_out");
  const topCause = activeCauses[0];
  const personalSafety = detected.some((d) => d.factor.safety);

  let primaryDecision = "Maintain observant lifestyle tracking and follow up with the recommended steps.";
  let primaryDecisionAmharic = "የዕለት ተዕለት የአኗኗር ሁኔታዎን ይከታተሉና የተጠቆሙትን እርምጃዎች ይከተሉ።";

  if (urgency.level === "critical" || personalSafety) {
    primaryDecision = `Urgent safety priority: ${EMERGENCY_GUIDANCE}`;
    primaryDecisionAmharic = `አስቸኳይ የደህንነት ቅድሚያ፡ ${EMERGENCY_GUIDANCE_AMHARIC}`;
  } else if (clinical && clinical.priority.level !== "routine") {
    primaryDecision = `Prioritize clinical evaluation ${clinical.priority.timeframe}: obtain diagnostic checks (${clinical.checks.slice(0, 3).join(", ")}) before starting self-treatment.`;
    primaryDecisionAmharic = `ክሊኒካዊ ምርመራን ${clinical.priority.timeframe} ቅድሚያ ይስጡ፡ የራስዎን ሕክምና ከመጀመርዎ በፊት በጤና ጣቢያ ምርመራ ያድርጉ።`;
  } else if (topCause) {
    primaryDecision = `Address primary contributing factor: "${topCause.title}". ${topCause.decisionGuidance?.immediateAction ?? "Initiate targeted adjustment."}`;
    primaryDecisionAmharic = `ዋናውን መንስኤ ትኩረት ይስጡ፡ "${topCause.titleAmharic ?? topCause.title}"። ${topCause.decisionGuidance?.immediateActionAmharic ?? "የተጠቆመውን ማስተካከያ ይጀምሩ።"}`;
  }

  const actionableNextSteps: string[] = [];
  const actionableNextStepsAmharic: string[] = [];

  if (topCause?.decisionGuidance?.immediateAction) {
    actionableNextSteps.push(topCause.decisionGuidance.immediateAction);
    if (topCause.decisionGuidance.immediateActionAmharic) {
      actionableNextStepsAmharic.push(topCause.decisionGuidance.immediateActionAmharic);
    }
  }

  for (const cause of activeCauses.slice(1, 3)) {
    if (cause.decisionGuidance?.immediateAction) {
      actionableNextSteps.push(cause.decisionGuidance.immediateAction);
      if (cause.decisionGuidance.immediateActionAmharic) {
        actionableNextStepsAmharic.push(cause.decisionGuidance.immediateActionAmharic);
      }
    }
  }

  if (clinical && clinical.priority.level !== "routine") {
    const clinStep = `Schedule clinical assessment ${clinical.priority.timeframe}: request verification of ${clinical.checks.slice(0, 2).join("; ")}.`;
    actionableNextSteps.push(clinStep);
    actionableNextStepsAmharic.push(`በ${clinical.priority.timeframe} ውስጥ የጤና ጣቢያ ቀጠሮ ይያዙና ምርመራ ያድርጉ።`);
  }

  const tradeOffsAndCautions = [
    "Do not stop or modify prescribed chronic medications without consulting your primary clinician.",
    ...(detected.some((d) => d.factor.physical)
      ? ["Lifestyle, dietary, and herbal adjustments support wellbeing but do not replace objective laboratory diagnostic testing."]
      : []),
    ...(profile.pregnant || profile.pregnancyOrLactation?.startsWith("pregnant")
      ? ["Pregnancy contraindicates aggressive fasting and strong traditional herbal infusions (such as heavy gesho or ruta/tena adam)."]
      : []),
    ...(typeof profile.location?.altitude === "number" && profile.location.altitude >= 2200
      ? ["Living above 2,200m increases respiratory water loss and metabolic oxygen demand; ensure adequate daily fluid intake."]
      : []),
  ];

  const tradeOffsAndCautionsAmharic = [
    "የታዘዙ ቋሚ መድኃኒቶችን ከሀኪምዎ ጋር ሳይመካከሩ በፍጹም አያቋርጡ ወይም አይቀይሩ።",
    ...(detected.some((d) => d.factor.physical)
      ? ["የአኗኗርና የምግብ ማስተካከያዎች ጠቃሚ ቢሆኑም የላቦራቶሪና የህክምና ምርመራን አይተኩም።"]
      : []),
    ...(profile.pregnant || profile.pregnancyOrLactation?.startsWith("pregnant")
      ? ["በእርግዝና ወቅት ጥብቅ ጾም እና ኃይለኛ ባህላዊ ዕፅዋትን (እንደ ጌሾ ወይም ከፍተኛ የጤና አዳም) መጠቀም አይመከርም።"]
      : []),
    ...(typeof profile.location?.altitude === "number" && profile.location.altitude >= 2200
      ? ["ከ2,200 ሜትር በላይ ከፍታ ላይ በሚኖሩበት ጊዜ በቂ የውሃ መጠን መውሰድ አስፈላጊ ነው።"]
      : []),
  ];

  const relevantResources: DecisionResource[] = [];
  const seenTitles = new Set<string>();
  for (const cause of activeCauses) {
    for (const res of cause.resources ?? []) {
      if (!seenTitles.has(res.title)) {
        seenTitles.add(res.title);
        relevantResources.push(res);
      }
    }
  }

  if (!relevantResources.length) {
    relevantResources.push(STANDARD_RESOURCES.ephcg_general);
  }

  return {
    primaryDecision,
    primaryDecisionAmharic,
    urgencyLevel: urgency.level,
    actionableNextSteps: [...new Set(actionableNextSteps)].slice(0, 4),
    actionableNextStepsAmharic: [...new Set(actionableNextStepsAmharic)].slice(0, 4),
    tradeOffsAndCautions: [...new Set(tradeOffsAndCautions)].slice(0, 4),
    tradeOffsAndCautionsAmharic: [...new Set(tradeOffsAndCautionsAmharic)].slice(0, 4),
    relevantResources: relevantResources.slice(0, 5),
  };
}
