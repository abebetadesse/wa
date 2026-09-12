export type Language = "en" | "am" | "om" | "ti" | "so";

export interface Translations {
  nav: {
    brand: string;
    tagline: string;
    overview: string;
    diagnostic: string;
    intake: string;
    safety: string;
    foods: string;
    cultural: string;
    audit: string;
    governance: string;
    atlas: string;
    emergency: string;
    evaluateBtn: string;
  };
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    startBtn: string;
    viewReportBtn: string;
    testSafetyBtn: string;
  };
  intake: {
    title: string;
    subtitle: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
  };
  report: {
    title: string;
    statusAudited: string;
    safetyGateVerified: string;
    zeroInteractionGuarantee: string;
    gapsTitle: string;
    causesTitle: string;
    solutionsTitle: string;
    exportSummary: string;
  };
  atlas: {
    title: string;
    subtitle: string;
  };
  emergency: {
    title: string;
    subtitle: string;
    sosBtn: string;
  };
  governance: {
    title: string;
    subtitle: string;
    mabSignoff: string;
    thresholdsTitle: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    nav: {
      brand: "Ethiopian Wisdom",
      tagline: "Biochemical & Cultural Precision",
      overview: "Overview",
      diagnostic: "Diagnostic Portal",
      intake: "Intake Wizard",
      safety: "Safety Gate",
      foods: "EFCT Foods",
      cultural: "Cultural (Domain B)",
      audit: "Audit Log",
      governance: "Clinical Governance",
      atlas: "health Atlas",
      emergency: "Emergency",
      evaluateBtn: "Evaluate Profile",
    },
    hero: {
      badge: "ENTERPRISE v3.0 • CLINICAL-ADJACENT ENGINE",
      title: "Precision Ethiopian Wellness &",
      titleHighlight: "Biochemical Gap Analysis",
      subtitle: "Evaluates client intake against authentic Ethiopian food composition data (EFCT 2025) and traditional medicine safety data (ETM-DB) to surface verified health Gaps → Likely Causes → Certified Safe Solutions.",
      startBtn: "Start Comprehensive Client Intake",
      viewReportBtn: "View Latest Evaluation Report",
      testSafetyBtn: "Test Herb-Drug Safety Gate",
    },
    intake: {
      title: "Client Intake Assessment",
      subtitle: "Altitude-calibrated nutritional and pharmaceutical screening",
      step1: "Demographics & Altitude",
      step2: "Diet Log & Lifestyle",
      step3: "Medications & Safety",
      step4: "Cultural Layer (Domain B)",
      step5: "Review & Evaluate",
    },
    report: {
      title: "Biochemical health Gap & Safety Report",
      statusAudited: "REPORT STATUS: AUDITED & CERTIFIED",
      safetyGateVerified: "Safety Gate Verified",
      zeroInteractionGuarantee: "Zero-Interaction Guarantee",
      gapsTitle: "Identified Nutritional Gaps",
      causesTitle: "Identified Causal Drivers",
      solutionsTitle: "Ranked & Verified Solutions",
      exportSummary: "Export Clinical Encounter Summary",
    },
    governance: {
      title: "Medical Advisory Board & Clinical Governance",
      subtitle: "Regulatory oversight, threshold versioning, and ETM-DB interaction changelogs",
      mabSignoff: "MAB Certified & Signed Off",
      thresholdsTitle: "Evaluation Thresholds & Biomarkers",
    },
    atlas: {
      title: "Ethiopian health Nutrition Atlas",
      subtitle: "Regional nutritional deficiency rates and traditional medicine usage",
    },
    emergency: {
      title: "Emergency health Profile",
      subtitle: "Your contacts, conditions, and medications for emergency responders",
      sosBtn: "Send SOS Alert",
    },
  },
  am: {
    nav: {
      brand: "የኢትዮጵያ ሁለንተናዊ ጤና",
      tagline: "ባዮኬሚካላዊ እና ባህላዊ ትክክለኛነት",
      overview: "አጠቃላይ እይታ",
      diagnostic: "ምርመራ ፖርታል",
      intake: "የግምገማ ቅጽ",
      safety: "የደህንነት መቆጣጠሪያ",
      foods: "የኢትዮጵያ ምግቦች",
      cultural: "ባህላዊ ቅርስ (Domain B)",
      audit: "የኦዲት መዝገብ",
      governance: "የሕክምና አስተዳደር",
      atlas: "የጤና ካርታ",
      emergency: "አስቸኳይ",
      evaluateBtn: "መገለጫ ገምግም",
    },
    hero: {
      badge: "የኢንተርፕራይዝ እትም 3.0 • የሕክምና ደረጃ ግምገማ",
      title: "የኢትዮጵያ ትክክለኛ ጤና እና",
      titleHighlight: "የሥነ-ምግብ ክፍተት ትንተና",
      subtitle: "የተጠቃሚዎችን የምግብ አወሳሰድ ከኢትዮጵያ የምግብ ጥንቅር ሰንጠረዥ (EFCT 2025) እና ከባህላዊ መድኃኒቶች የደህንነት መረጃ (ETM-DB) ጋር በማገናዘብ ትክክለኛ የጤና ክፍተቶች → ምክንያቶች → የተረጋገጡ መፍትሄዎችን ያመነጫል።",
      startBtn: "ሁለንተናዊ ግምገማ ጀምር",
      viewReportBtn: "የቅርብ ጊዜ ሪፖርት ተመልከት",
      testSafetyBtn: "የዕፅዋት-መድኃኒት ደህንነት ፈትሽ",
    },
    intake: {
      title: "የተጠቃሚ የጤና እና ምግብ ግምገማ",
      subtitle: "ከፍታን ያገናዘበ የሥነ-ምግብ እና የመድኃኒት ደህንነት ምርመራ",
      step1: "መሰረታዊ መረጃ እና ከፍታ",
      step2: "የምግብ አወሳሰድ እና ልማዶች",
      step3: "መድኃኒቶች እና ደህንነት",
      step4: "ባህላዊ እሴቶች (Domain B)",
      step5: "ግምገማ እና ማረጋገጫ",
    },
    report: {
      title: "የባዮኬሚካል ጤና ክፍተት እና ደህንነት ሪፖርት",
      statusAudited: "የሪፖርት ሁኔታ፡ የተረጋገጠ እና በኦዲት የተፈተሸ",
      safetyGateVerified: "በደህንነት መቆጣጠሪያ የተረጋገጠ",
      zeroInteractionGuarantee: "ከግጭት ነፃ የመሆን ዋስትና",
      gapsTitle: "የተለዩ የሥነ-ምግብ ክፍተቶች",
      causesTitle: "አስተዋጽኦ ያደረጉ ምክንያቶች",
      solutionsTitle: "ደረጃ የተሰጣቸው እና የተረጋገጡ መፍትሄዎች",
      exportSummary: "የሕክምና ማጠቃለያ ሰነድ አውርድ (PDF)",
    },
    governance: {
      title: "የሕክምና አማካሪ ቦርድ እና ክሊኒካዊ አስተዳደር",
      subtitle: "የቁጥጥር ክትትል፣ የመለኪያ ደንቦች እና የባህላዊ መድኃኒቶች ደህንነት ማሻሻያ",
      mabSignoff: "በሕክምና ቦርዱ የተፈረመበት",
      thresholdsTitle: "የግምገማ መለኪያዎች እና ደረጃዎች",
    },
    atlas: {
      title: "የኢትዮጵያ የጤና ካርታ",
      subtitle: "በክልሎች ያለው የሥነ-ምግብ ክፍተት ወና ባህላዊ መድኃኒት አጠቃቀም",
    },
    emergency: {
      title: "አስቸኳይ የጤና መረጃ",
      subtitle: "ለድንገተኛ ጉዳይ አስፈላጊ ሰዎች፣ ሁኔታዎች እና መድኃኒቶች",
      sosBtn: "አስቸኳይ ጥሪ ላክ",
    },
  },
  om: {
    nav: {
      brand: "Fayyaa Guutuu Itoophiyaa",
      tagline: "Sirrummaa Baayookeemikaalaa fi Aadaa",
      overview: "Waliigala",
      diagnostic: "Qorannoo Fayyaa",
      intake: "Unka Qorannoo",
      safety: "Qorannoo Nageenyaa",
      foods: "Nyaata Itoophiyaa",
      cultural: "Aadaa (Domain B)",
      audit: "Galmee Oodiitii",
      governance: "Bulchiinsa Yaalaa",
      atlas: "Kaartaa Fayyaa",
      emergency: "Ariifannoo",
      evaluateBtn: "Itti Fufi",
    },
    hero: {
      badge: "ENTERPRISE v3.0 • MOOTORA YAALAA",
      title: "Fayyaa fi Nageenya Itoophiyaa &",
      titleHighlight: "Xiinxala Hanqina Nyaataa",
      subtitle: "Soorata keessan gabatee qabiyyee nyaata Itoophiyaa (EFCT 2025) fi daataa nageenya qoricha aadaa (ETM-DB) waliin xiinxaluun Hanqina Fayyaa → Sababoota → Furmaata mirkanaa'e kenna.",
      startBtn: "Qorannoo Jalqabi",
      viewReportBtn: "Gabaasa Dhihoo Ilaali",
      testSafetyBtn: "Nageenya Qorichaa Qori",
    },
    intake: {
      title: "Qorannoo Soorata Fayyaa",
      subtitle: "Sadarkaa olka'iinsa lafaa fi nageenya qorichaa",
      step1: "Oodeeffannoo fi Olka'iinsa",
      step2: "Soorata fi Amala",
      step3: "Qorichoota fi Nageenya",
      step4: "Kutaa Aadaa (Domain B)",
      step5: "Mirkaneessuu",
    },
    report: {
      title: "Gabaasa Hanqina Soorataa fi Nageenyaa",
      statusAudited: "HAALA GABAASAA: MIRKANAA'EERA",
      safetyGateVerified: "Nageenyi Mirkanaa'eera",
      zeroInteractionGuarantee: "Wal-faallessuu Irraa Bilisa",
      gapsTitle: "Hanqinaalee Soorataa Argaman",
      causesTitle: "Sababoota Gumaachan",
      solutionsTitle: "Furmaataalee Filatamoo",
      exportSummary: "Gabaasa Yaalaa Baasi",
    },
    governance: {
      title: "Bulchiinsa Yaalaa fi Boordii Fayyaa",
      subtitle: "To'annoo seeraa fi nageenya qorichoota aadaa",
      mabSignoff: "Boordiin Mirkanaa'e",
      thresholdsTitle: "Ulaagaalee Madaallii",
    },
    atlas: {
      title: "Kaartaa Fayyaa Itoophiyaa",
      subtitle: "Hanqina soorataa fi fayyadama qoricha aadaa naannoodhaan",
    },
    emergency: {
      title: "Odeeffannoo Ariifannoo",
      subtitle: "Dhaabbilee, haala fayyaa fi qorichoota yeroo balaa",
      sosBtn: "Beeksisa Ariifannoo Ergi",
    },
  },
  ti: {
    nav: {
      brand: "ሕሙማዊ ጥዕና ኢትዮጵያ",
      tagline: "ባዮኬሚካላዊ ትኽክለኛ ምርምር",
      overview: "ድምር",
      diagnostic: "ምርመራ ፖርታል",
      intake: "ቅጽ ምግምጋም",
      safety: "ድሕነት ምርምር",
      foods: "ምግቢ ኢትዮጵያ",
      cultural: "ወጋዊ ክፍሊ (Domain B)",
      audit: "መዝገብ ምርምር",
      governance: "ሕክምናዊ ምምሕዳር",
      atlas: "ካርታ ጥዕና",
      emergency: "ህጹጽ",
      evaluateBtn: "ምርምር ጀምር",
    },
    hero: {
      badge: "ENTERPRISE v3.0 • ሕክምናዊ ምርምር",
      title: "ትኽክለኛ ጥዕና ኢትዮጵያ &",
      titleHighlight: "ምምርምር ናይ ስነ-ምግቢ ጉድለት",
      subtitle: "ናይ ተጠቃሚ ምግቢ ምስ ናይ ኢትዮጵያ ምግቢ ሰሌዳ (EFCT 2025) ኣነጻጺሩ ናይ ጥዕና ጉድለት → ምኽንያቶቹ → ዉሑስ መፍትሒ ይህብ።",
      startBtn: "ምርምር ጀምር",
      viewReportBtn: "ናይ መጨረሽታ ሪፖርት ርአ",
      testSafetyBtn: "ድሕነት ምርምር ፈትን",
    },
    intake: {
      title: "ምዝጋብ ጥዕና ተጠቃሚ",
      subtitle: "ምምርምር ናይ ስነ-ምግቢ ምስ ልዕልነት ሃገር",
      step1: "ሓበሬታ ሰብ",
      step2: "ምግቢ ሂወት",
      step3: "መድሃኒት ድሕነት",
      step4: "ወጋዊ ክፍሊ (Domain B)",
      step5: "ምርምር",
    },
    report: {
      title: "ሪፖርት ናይ ጥዕና ጉድለት",
      statusAudited: "ሪፖርት ዳሕራዊ ምርምር ተሓቲቱ",
      safetyGateVerified: "ድሕነት ተረጋጊጹ",
      zeroInteractionGuarantee: "ናጻ ካብ ሕልኽ",
      gapsTitle: "ናይ ስነ-ምግቢ ጉድለት",
      causesTitle: "ምኽንያቶቹ",
      solutionsTitle: "ዉሑሳት መፍትሒ",
      exportSummary: "ወጺኡ ዘውጽእ",
    },
    governance: {
      title: "ቦርድ ሕክምና ምምሕዳር",
      subtitle: "ቁጽጽር ሕጊ ምስ ናይ ETM-DB ምዕባለ",
      mabSignoff: "ቦርድ ሓሲምዎ",
      thresholdsTitle: "ናይ ምምርምር መለክዒ",
    },
    atlas: {
      title: "ካርታ ጥዕና ኢትዮጵያ",
      subtitle: "ናይ ናይ ስነ-ምግቢ ጉድለት ብዙሕነት ብዞባ",
    },
    emergency: {
      title: "ናይ ህጹጽ ሕክምና ሓበሬታ",
      subtitle: "ኣድራሻ ህጹጽ ሰባት ምስ ሕሙምነት",
      sosBtn: "ናይ ህጹጽ መልእኽቲ ስደድ",
    },
  },
  so: {
    nav: {
      brand: "Caafimaadka Guud ee Itoobiya",
      tagline: "Saxnaanta Kiimikada & Dhaqanka",
      overview: "Guudmar",
      diagnostic: "Xarunta Baaritaanka",
      intake: "Foomka Qiimaynta",
      safety: "Ilaalada Badbaadada",
      foods: "Cuntooyinka EFCT",
      cultural: "Dhaqanka (Domain B)",
      audit: "Diiwaanka Hubinta",
      governance: "Maamulka Caafimaadka",
      atlas: "Khariidadda Caafimaadka",
      emergency: "Xaalad Degdeg",
      evaluateBtn: "Bilaab Qiimaynta",
    },
    hero: {
      badge: "ENTERPRISE v3.0 • QIIMAYNTA CAAFIMAADKA",
      title: "Caafimaadka Saxda ah ee Itoobiya &",
      titleHighlight: "Falanqaynta Nusqaanta Nafaqada",
      subtitle: "Qiimaynta cuntada iyadoo la barbardhigayo shaxda nafaqada Itoobiya (EFCT 2025) iyo badbaadada dhirta (ETM-DB).",
      startBtn: "Bilaab Qiimaynta",
      viewReportBtn: "Arag Warbixinta",
      testSafetyBtn: "Tijaabi Badbaadada Dhirta",
    },
    intake: {
      title: "Diiwaangelinta Caafimaadka",
      subtitle: "Heerka joogga iyo badbaadada dawooyinka",
      step1: "Xogta Guud",
      step2: "Cuntada & Qaabnololeedka",
      step3: "Dawooyinka & Badbaadada",
      step4: "Qaybta Dhaqanka (Domain B)",
      step5: "Xaqiijinta",
    },
    report: {
      title: "Warbixinta Nusqaanta Caafimaadka",
      statusAudited: "HEERKA WARBIXINTA: LA HUBIYEY",
      safetyGateVerified: "Badbaadada La Xaqiijiyey",
      zeroInteractionGuarantee: "Khatar La'aan",
      gapsTitle: "Nusqaamaha La Helay",
      causesTitle: "Sababaha Keena",
      solutionsTitle: "Xalka Badbaadada Leh",
      exportSummary: "Dhoofso Warbixinta",
    },
    governance: {
      title: "Guddiga Maamulka Caafimaadka",
      subtitle: "Ilaalinta xeerarka iyo horumarinta ETM-DB",
      mabSignoff: "Guddigu Saxeexay",
      thresholdsTitle: "Heerarka Qiimaynta",
    },
    atlas: {
      title: "Khariidadda Caafimaadka Itoobiya",
      subtitle: "Nusqaanta nafaqada iyo isticmaalka dawo-dhaqameedka ee deegaannada",
    },
    emergency: {
      title: "Xogta Xaaladda Degdegga",
      subtitle: "Dadka lala xiriiro, xanuunnada, iyo dawooyinka",
      sosBtn: "Dir Digniinta SOS",
    },
  },
};
