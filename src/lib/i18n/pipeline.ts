export interface PipelineI18nCatalog {
  common: {
    back: string;
    next: string;
    submit: string;
    cancel: string;
    loading: string;
    approve: string;
    returnToPatient: string;
    returnToProfessional: string;
    overrideGate: string;
    publishReport: string;
    low: string;
    moderate: string;
    high: string;
    safe: string;
    caution: string;
    avoid: string;
  };
  disclaimers: {
    noRuleMatchedNotSafe: string;
    preliminaryOrientationNotDiagnosis: string;
    professionalApprovalRequired: string;
    safetyOverrideNotice: string;
  };
  statuses: {
    SUBMITTED: string;
    EVALUATING: string;
    PENDING_PROFESSIONAL: string;
    PROFESSIONAL_RETURNED: string;
    PENDING_ADMIN: string;
    APPROVED: string;
    PUBLISHED: string;
    BLOCKED_BY_SAFETY_GATE: string;
  };
  profile: {
    title: string;
    subtitle: string;
    ageBand: string;
    sex: string;
    location: string;
    region: string;
    zone: string;
    woreda: string;
    agroEcological: string;
    altitude: string;
    ecosystem: string;
    currentMeds: string;
    traditionalRemedies: string;
    spiritualConsent: string;
    consentNotice: string;
  };
  preliminary: {
    title: string;
    subtitle: string;
    locationSummary: string;
    culturalPatterns: string;
    spiritualFraming: string;
    nutritionEcological: string;
    bodyScience: string;
    proceedToCase: string;
  };
  caseIntake: {
    title: string;
    subtitle: string;
    narrativeLabel: string;
    narrativePlaceholder: string;
    symptomsLabel: string;
    durationLabel: string;
    priorTreatmentsLabel: string;
    submitCaseBtn: string;
  };
  reports: {
    userReportTitle: string;
    userReportSubtitle: string;
    professionalReportTitle: string;
    professionalReportSubtitle: string;
    urgentDirective: string;
    whatMayBeHappening: string;
    localFoods: string;
    traditionalRemedies: string;
    nextSteps: string;
    whenToSeekHelpNow: string;
    pharmacologyAnalysis: string;
    herbDrugInteractions: string;
    differentialDiagnosis: string;
    auditTrail: string;
  };
}

export const pipelineEn: PipelineI18nCatalog = {
  common: {
    back: "Back",
    next: "Next",
    submit: "Submit",
    cancel: "Cancel",
    loading: "Processing evaluation...",
    approve: "Approve Clinical Case",
    returnToPatient: "Return to Patient for More Details",
    returnToProfessional: "Return to Professional for Revision",
    overrideGate: "Override Safety Gate",
    publishReport: "Approve & Publish to Patient",
    low: "Low",
    moderate: "Moderate",
    high: "High",
    safe: "Safe with Normal Dietary Intake",
    caution: "Exercise Caution & Separate Intake",
    avoid: "Avoid Concurrent Consumption",
  },
  disclaimers: {
    noRuleMatchedNotSafe:
      "No rule matched ≠ safe. Absence of a known interaction rule in the database does not guarantee safety or absence of clinical risk.",
    preliminaryOrientationNotDiagnosis:
      "This is a preliminary orientation, not a diagnosis. All health decisions should be made in consultation with qualified clinical providers.",
    professionalApprovalRequired:
      "I understand this is not a diagnosis and that a medical professional and administrator must evaluate and approve before I receive an official report.",
    safetyOverrideNotice:
      "Safety Override Notice: This evaluation was conducted with a clinical professional safety override following detected botanical-pharmaceutical interaction risk.",
  },
  statuses: {
    SUBMITTED: "Case Submitted",
    EVALUATING: "Evaluating Knowledge Pillars",
    PENDING_PROFESSIONAL: "Pending Professional Clinical Review",
    PROFESSIONAL_RETURNED: "Returned to Patient for Information",
    PENDING_ADMIN: "Pending Administrative Publication Review",
    APPROVED: "Approved by Review Board",
    PUBLISHED: "Report Published to Patient",
    BLOCKED_BY_SAFETY_GATE: "Blocked by Authoritative Herb–Drug Safety Gate",
  },
  profile: {
    title: "Culturally-Grounded Health Orientation",
    subtitle: "Grounding health insights in your agro-ecological zone, cultural heritage, and traditional diet.",
    ageBand: "Age Category",
    sex: "Biological Sex",
    location: "Geographic Location",
    region: "Region",
    zone: "Zone",
    woreda: "Woreda",
    agroEcological: "Agro-Ecological Zone",
    altitude: "Altitude Band",
    ecosystem: "Ecosystem Context",
    currentMeds: "Current Medications (Pharmaceuticals)",
    traditionalRemedies: "Traditional Herbs & Botanical Remedies",
    spiritualConsent: "Consent to include traditional spiritual & faith-based healing traditions",
    consentNotice:
      "I consent to the evaluation of my profile data against Ethiopian traditional medicine and agro-ecological health models.",
  },
  preliminary: {
    title: "Preliminary Location-Grounded Analysis",
    subtitle: "A holistic preview of cultural, ecological, nutritional, and physiological context prior to clinical intake.",
    locationSummary: "Ecological & Location Summary",
    culturalPatterns: "Cultural Health Patterns & Practices",
    spiritualFraming: "Faith & Spiritual Considerations",
    nutritionEcological: "Regional Food Systems & Seasonal Availability",
    bodyScience: "Plain-Language Physiology & Body Systems",
    proceedToCase: "Proceed to Clinical Case Intake",
  },
  caseIntake: {
    title: "Clinical Case Intake",
    subtitle: "Detail your current health concerns, symptoms, and any home or traditional remedies taken.",
    narrativeLabel: "Detailed Description of Your Condition (Narrative)",
    narrativePlaceholder: "Please describe how you are feeling, when it started, and how it impacts your daily life...",
    symptomsLabel: "Primary Symptoms Observed",
    durationLabel: "Duration of Symptoms",
    priorTreatmentsLabel: "Prior Treatments (Both Traditional Herbs and Medications)",
    submitCaseBtn: "Submit Case for Dual-Track Evaluation",
  },
  reports: {
    userReportTitle: "Personalized Culturally-Framed Health Report",
    userReportSubtitle: "Carefully reviewed by licensed medical professionals and culturally translated for your wellbeing.",
    professionalReportTitle: "Clinical Professional Report",
    professionalReportSubtitle: "Detailed case analysis for licensed medical professionals reviewing this submission.",
    urgentDirective: "Urgent Medical Attention Directive",
    whatMayBeHappening: "Understanding What May Be Happening",
    localFoods: "Local Foods and Nutrition to Emphasize",
    traditionalRemedies: "Traditional Remedies Evaluation",
    nextSteps: "Recommended Supportive Next Steps",
    whenToSeekHelpNow: "When to Seek Immediate Emergency Medical Help",
    pharmacologyAnalysis: "Comprehensive Pharmacological & CYP Pathway Analysis",
    herbDrugInteractions: "Herb–Drug Interaction Matrix",
    differentialDiagnosis: "Differential Considerations & Regional Disease Matching",
    auditTrail: "Immutable Case Lifecycle Audit Trail",
  },
};

export const pipelineAm: PipelineI18nCatalog = {
  common: {
    back: "ተመለስ",
    next: "ቀጣይ",
    submit: "አስገባ",
    cancel: "ሰርዝ",
    loading: "ምርመራው እየተከናወነ ነው...",
    approve: "የክሊኒካል ክትትሉን አጽድቅ",
    returnToPatient: "ለተጨማሪ መረጃ ለታካሚው መልስ",
    returnToProfessional: "ለክለሳ ለባለሙያው መልስ",
    overrideGate: "የደህንነት ደንብ ውሳኔን አሻሽል (Override)",
    publishReport: "አጽድቀህ ለታካሚው አትም/አጋራ",
    low: "ዝቅተኛ",
    moderate: "መካከለኛ",
    high: "ከፍተኛ",
    safe: "በመደበኛ መጠን ለመውሰድ ደህንነቱ የተጠበቀ",
    caution: "በጥንቃቄ እና በሰዓት ልዩነት ይወሰድ",
    avoid: "በአንድ ላይ ከመውሰድ በጥብቅ ይወገድ",
  },
  disclaimers: {
    noRuleMatchedNotSafe:
      "ደንብ አለመገኘቱ ደህንነቱ የተረጋገጠ መሆኑን አያመለክትም (No rule matched ≠ safe)። በመረጃ ቋቱ ውስጥ የታወቀ የመስተጋብር ደንብ አለመኖሩ ክሊኒካዊ አደጋ አለመኖሩን ዋስትና አይሰጥም።",
    preliminaryOrientationNotDiagnosis:
      "ይህ የመጀመሪያ ደረጃ አቅጣጫ ጠቋሚ እንጂ የህክምና ምርመራ (ዲያግኖሲስ) አይደለም። ማናቸውም የጤና ውሳኔዎች ብቃት ካላቸው የህክምና ባለሙያዎች ጋር መደረግ አለባቸው።",
    professionalApprovalRequired:
      "ይህ የህክምና ምርመራ እንዳልሆነ እና ይፋዊ ሪፖርት ከማግኘቴ በፊት በህክምና ባለሙያ እና በአስተዳዳሪ መገምገም እና መጽደቅ እንዳለበት ተረድቻለሁ።",
    safetyOverrideNotice:
      "የደህንነት ማሻሻያ ማስታወቂያ፡ ይህ ግምገማ በእፅዋት እና በመድኃኒት መስተጋብር ስጋት ምክንያት በክሊኒካል ባለሙያ የደህንነት ማሻሻያ ውሳኔ (Override) የተከናወነ ነው።",
  },
  statuses: {
    SUBMITTED: "ጉዳዩ ገብቷል",
    EVALUATING: "የዕውቀት ምሰሶዎች እየተገመገሙ ነው",
    PENDING_PROFESSIONAL: "የባለሙያ ክሊኒካል ግምገማ በመጠባበቅ ላይ",
    PROFESSIONAL_RETURNED: "ለተጨማሪ መረጃ ለታካሚው የተመለሰ",
    PENDING_ADMIN: "የአስተዳደር ህትመት ግምገማ በመጠባበቅ ላይ",
    APPROVED: "በግምገማ ቦርድ ጸድቋል",
    PUBLISHED: "ሪፖርቱ ለታካሚው ይፋ ተደርጓል",
    BLOCKED_BY_SAFETY_GATE: "በእፅዋት–መድኃኒት የደህንነት በር ታግዷል",
  },
  profile: {
    title: "ባህላዊ እና አካባቢያዊ የጤና መመሪያ",
    subtitle: "የጤና ግንዛቤዎን ከአካባቢዎ ሥነ-ምህዳር፣ ከባህላዊ እሴቶች እና ከባህላዊ አመጋገብ ጋር ማስተሳሰር።",
    ageBand: "የዕድሜ ክልል",
    sex: "ጾታ",
    location: "መልክአ ምድራዊ አቀማመጥ",
    region: "ክልል",
    zone: "ዞን",
    woreda: "ወረዳ",
    agroEcological: "የአየር ንብረት ቀጠና (Agro-Ecological Zone)",
    altitude: "የከፍታ መጠን (Altitude)",
    ecosystem: "ሥነ-ምህዳራዊ ሁኔታ",
    currentMeds: "አሁን የሚወስዷቸው የፋርማሲ መድኃኒቶች",
    traditionalRemedies: "የሚወስዷቸው ባህላዊ እፅዋት እና መድኃኒቶች",
    spiritualConsent: "በባህላዊ መንፈሳዊ እና እምነት-ነክ የፈውስ ልምዶች ትንታኔ ለማካተት ፈቃደኛ ነኝ",
    consentNotice: "የግል መገለጫዬ በኢትዮጵያ ባህላዊ ሕክምና እና ስነ-ምህዳራዊ የጤና ሞዴሎች እንዲገመገም ፈቃዴን እሰጣለሁ።",
  },
  preliminary: {
    title: "የመጀመሪያ ደረጃ አካባቢያዊ ትንተና",
    subtitle: "ከክሊኒካል ቅበላ በፊት የባህል፣ የስነ-ምህዳር፣ የአመጋገብ እና የሰውነት ፊዚዮሎጂ አጠቃላይ እይታ።",
    locationSummary: "የስነ-ምህዳር እና የመልክአ-ምድር ማጠቃለያ",
    culturalPatterns: "የባህላዊ ጤና ልማዶች እና ምልከታዎች",
    spiritualFraming: "የእምነት እና መንፈሳዊ ግንዛቤዎች",
    nutritionEcological: "የአካባቢው የምግብ ስርዓት እና ወቅታዊ የምግብ አቅርቦት",
    bodyScience: "ቀለል ባለ ቋንቋ የቀረበ የሰውነት ሳይንስ እና ስርዓቶች",
    proceedToCase: "ወደ ክሊኒካል ጉዳይ ቅበላ ይቀጥሉ",
  },
  caseIntake: {
    title: "የክሊኒካል ጉዳይ ቅበላ",
    subtitle: "የአሁኑን የጤና ስጋትዎን፣ ምልክቶችዎን እና የወሰዷቸውን ባህላዊም ሆኑ ዘመናዊ መድኃኒቶች በዝርዝር ይግለጹ።",
    narrativeLabel: "የህመምዎ ዝርዝር መግለጫ (ታሪክ)",
    narrativePlaceholder: "የሚሰማዎትን ስሜት፣ መቼ እንደጀመረ እና በዕለታዊ ህይወትዎ ላይ ምን ተጽዕኖ እንዳሳደረ በዝርዝር ይግለጹ...",
    symptomsLabel: "የተስተዋሉ ዋና ዋና ምልክቶች",
    durationLabel: "ህመሙ የቆየበት ጊዜ",
    priorTreatmentsLabel: "ቀደም ሲል የተወሰዱ ህክምናዎች (እፅዋትም ሆኑ የፋርማሲ መድኃኒቶች)",
    submitCaseBtn: "ጉዳዩን ለሁለትዮሽ ምርመራ አስገባ",
  },
  reports: {
    userReportTitle: "ለእርስዎ የተዘጋጀ ባህላዊ የጤና ሪፖርት",
    userReportSubtitle: "በህክምና ባለሙያዎች በጥንቃቄ ተገምግሞ ለደህንነትዎ ተስማሚ በሆነ መንገድ የተዘጋጀ።",
    professionalReportTitle: "ክሊኒካዊ የሙያ ሪፖርት",
    professionalReportSubtitle: "ፈቃድ ያለው የህክምና ባለሙያ ለሚገምግምበት ዝርዝር የጉዳይ ትንተና።",
    urgentDirective: "አስቸኳይ የህክምና እርዳታ መመሪያ",
    whatMayBeHappening: "ምን እየተከሰተ እንዳለ መረዳት",
    localFoods: "ትኩረት ሊሰጣቸው የሚገቡ የአካባቢ ምግቦች እና ስነ-ምግብ",
    traditionalRemedies: "የባህላዊ እፅዋት ደህንነት ግምገማ",
    nextSteps: "የሚመከሩ ቀጣይ ድጋፍ ሰጪ እርምጃዎች",
    whenToSeekHelpNow: "ወዲያውኑ ወደ ድንገተኛ ህክምና መሄድ ያለብዎት መቼ ነው?",
    pharmacologyAnalysis: "ዝርዝር የፋርማኮሎጂ እና የሳይቶክሮም (CYP) መስመር ትንተና",
    herbDrugInteractions: "የእፅዋት እና መድኃኒት መስተጋብር ሰንጠረዥ",
    differentialDiagnosis: "ተገማች ህመሞች እና የአካባቢ ተላላፊ በሽታዎች ማዛመጃ",
    auditTrail: "የማይለወጥ የጉዳይ ክትትል ታሪክ (Audit Trail)",
  },
};

export function getPipelineI18n(locale: string = "am"): PipelineI18nCatalog {
  return locale.toLowerCase().startsWith("en") ? pipelineEn : pipelineAm;
}
