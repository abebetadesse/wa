export interface ExtractedEntity {
  category: "symptom" | "body_part" | "duration" | "severity" | "trigger" | "medication" | "substance";
  value: string;
  label: string;
  confidence: number;
}

export class EntityExtractor {
  private symptomsDict: Record<string, string[]> = {
    headache: ["headache", "head pain", "migraine", "throbbing head", "ራስ ምታት", "mataan na dhukkuba", "madax xanuun", "ርእሲ ቃንዛ"],
    fever: ["fever", "high temperature", "chills", "rigors", "ትኩሳት", "hoo'ina qaamaa", "qandho", "ረስኒ"],
    stomach_pain: ["stomach pain", "abdominal pain", "belly ache", "epigastric burning", "heartburn", "የሆድ ህመም", "ጨጓራ", "garaa kaasaa", "xanuun caloosha"],
    vomiting: ["vomit", "vomiting", "nausea", "retching", "ማስመለስ", "ማቅለሽለሽ", "haqqisiisa", "matag"],
    diarrhea: ["diarrhea", "diarrhoea", "loose stool", "watery stool", "ተቅማጥ", "garaa baasa", "shubanka"],
    cough: ["cough", "coughing", "dry cough", "productive cough", "ሳል", "qufaa", "qufac", "ሳዕሊ"],
    fatigue: ["fatigue", "tired", "exhausted", "weakness", "lethargy", "low energy", "ድካም", "ዝለት", "dadhabbi", "daal"],
    chest_pain: ["chest pain", "angina", "tightness in chest", "pressure in chest", "የደረት ህመም", "dhukkubbi qomaa", "xanuun laabta"],
    breathing_difficulty: ["difficulty breathing", "shortness of breath", "dyspnea", "gasping", "suffocating", "መተንፈስ መቸገር", "ቁርጥማት", "hafuura baafachuu dadhabuu", "neefsasho adag"],
    bleeding: ["bleeding", "blood in stool", "blood in vomit", "coughing blood", "hemoptysis", "ደም መፍሰስ", "ደም", "dhiiga dhangala'u", "dhiigbax"],
    rash: ["rash", "hives", "itching", "itchy", "skin eruption", "አለርጂ", "ሽፍታ", "hooqqisa gogaa", "cuncun"],
    jaundice: ["jaundice", "yellow eyes", "yellow skin", "dark urine", "ቢጫ መሆን", "ወፍ በሽታ"],
    joint_pain: ["joint pain", "arthritis", "stiff joints", "የመገጣጠሚያ ህመም", "ቁርጥማት", "dhukkubbi buusaa"],
  };

  private bodyPartsDict: Record<string, string[]> = {
    head: ["head", "brain", "forehead", "temple", "ራስ", "ቅንብር"],
    chest: ["chest", "sternum", "lungs", "heart", "ደረት", "ልብ"],
    abdomen: ["stomach", "belly", "abdomen", "gut", "intestine", "ሆድ", "ጨጓራ"],
    back: ["back", "spine", "lower back", "ጀርባ", "ወገብ"],
    throat: ["throat", "pharynx", "tonsils", "ጉሮሮ"],
    skin: ["skin", "epidermis", "scalp", "ቆዳ"],
    joints: ["joint", "knees", "elbows", "ankles", "wrists", "መገጣጠሚያ", "ጉልበት"],
    eyes: ["eye", "eyes", "vision", "አይን"],
  };

  private severityKeywords: Record<string, string[]> = {
    critical: ["unbearable", "excruciating", "can't stand", "agony", "dying", "extreme", "እጅግ ከባድ", "አስከፊ"],
    severe: ["severe", "intense", "heavy", "terrible", "very bad", "worsening", "ከባድ", "በጣም"],
    moderate: ["moderate", "medium", "manageable", "somewhat", "መካከለኛ"],
    mild: ["mild", "slight", "little", "occasional", "ቀላል", "ትንሽ"],
  };

  private triggersDict: Record<string, string[]> = {
    after_eating: ["after eating", "after meal", "postprandial", "when i eat", "ምግብ ከበላሁ በኋላ"],
    after_fasting: ["after fasting", "during fasting", "empty stomach", "tsom", "በጾም ወቅት", "ከጾም በኋላ"],
    when_stressed: ["when stressed", "under pressure", "after arguing", "worrying", "ጭንቀት ሲበዛ"],
    after_coffee: ["after coffee", "buna", "drinking coffee", "ቡና ከጠጣሁ"],
    cold_exposure: ["in the cold", "cold weather", "winter", "kiremt", "ብርድ ሲመታኝ"],
  };

  private medicationsList: string[] = [
    "warfarin", "aspirin", "metformin", "insulin", "lisinopril", "enalapril", "amlodipine",
    "atenolol", "hydrochlorothiazide", "coartem", "artemether", "chloroquine", "quinine",
    "amoxicillin", "ciprofloxacin", "doxycycline", "rifampicin", "isoniazid", "dolutegravir",
  ];

  private substancesList: string[] = [
    "khat", "chat", "alcohol", "tella", "tej", "areke", "katikala", "beer", "wine", "liquor",
    "tobacco", "cigarettes", "smoking", "tumbakho", "gaya", "cannabis", "weed",
  ];

  extract(text: string): ExtractedEntity[] {
    const normalized = text.toLowerCase();
    const results: ExtractedEntity[] = [];

    // 1. Symptoms
    for (const [symKey, aliases] of Object.entries(this.symptomsDict)) {
      if (aliases.some((alias) => normalized.includes(alias.toLowerCase()))) {
        results.push({
          category: "symptom",
          value: symKey,
          label: symKey.replace(/_/g, " "),
          confidence: 0.92,
        });
      }
    }

    // 2. Body Parts
    for (const [partKey, aliases] of Object.entries(this.bodyPartsDict)) {
      if (aliases.some((alias) => normalized.includes(alias.toLowerCase()))) {
        results.push({
          category: "body_part",
          value: partKey,
          label: partKey.replace(/_/g, " "),
          confidence: 0.9,
        });
      }
    }

    // 3. Durations (Regex matching)
    const durationRegex = /(?:for|since|past|last|duration|ቆየኝ|ከ)\s*(\d+)\s*(days?|weeks?|months?|years?|ቀን|ሳምንት|ወር|ዓመት)/i;
    const durMatch = text.match(durationRegex);
    if (durMatch) {
      results.push({
        category: "duration",
        value: `${durMatch[1]} ${durMatch[2]}`,
        label: "Duration of Concern",
        confidence: 0.88,
      });
    }

    // 4. Severity
    for (const [sevKey, keywords] of Object.entries(this.severityKeywords)) {
      if (keywords.some((kw) => normalized.includes(kw))) {
        results.push({
          category: "severity",
          value: sevKey,
          label: `${sevKey.toUpperCase()} Severity`,
          confidence: 0.85,
        });
        break;
      }
    }

    // 5. Triggers
    for (const [trigKey, phrases] of Object.entries(this.triggersDict)) {
      if (phrases.some((p) => normalized.includes(p))) {
        results.push({
          category: "trigger",
          value: trigKey,
          label: trigKey.replace(/_/g, " "),
          confidence: 0.86,
        });
      }
    }

    // 6. Medications
    for (const med of this.medicationsList) {
      if (normalized.includes(med)) {
        results.push({
          category: "medication",
          value: med,
          label: `Medication: ${med.toUpperCase()}`,
          confidence: 0.94,
        });
      }
    }

    // 7. Substances
    for (const sub of this.substancesList) {
      if (normalized.includes(sub)) {
        results.push({
          category: "substance",
          value: sub,
          label: `Substance: ${sub.toUpperCase()}`,
          confidence: 0.92,
        });
      }
    }

    return results;
  }
}
