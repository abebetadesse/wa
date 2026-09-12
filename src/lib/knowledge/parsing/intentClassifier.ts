export type QueryIntent =
  | "diagnostic"
  | "treatment"
  | "prevention"
  | "dietary"
  | "lifestyle"
  | "herbal"
  | "astrological"
  | "emergency";

export interface IntentClassificationResult {
  intent: QueryIntent;
  confidence: number;
  detectedLanguage: "en" | "am" | "om" | "ti" | "so";
  keywordsMatched: string[];
}

export class IntentClassifier {
  private intentKeywords: Record<QueryIntent, Record<string, string[]>> = {
    emergency: {
      en: ["emergency", "urgent", "immediate", "cannot breathe", "chest pain", "unconscious", "stroke", "seizure", "bleeding profusely", "dying"],
      am: ["አስቸኳይ", "አደገኛ", "መተንፈስ አልቻልኩም", "የደረት ህመም", "ራሱን ሳተ", "ደም መፍሰስ", "ድንገተኛ"],
      om: ["ariifachiisaa", "hafuura baafachuu dadhabe", "dhukkubbi qomaa", "dhiiga dhangala'u", "birmannaa"],
      ti: ["ህጹጽ", "ሓደጋ", "ምስትንፋስ ስኢነ", "ቃንዛ ኣፍልቢ", "ምድማይ"],
      so: ["degdeg", "xanuun laabta", "neefsasho adag", "dhiigbax", "gurmad"],
    },
    diagnostic: {
      en: ["pain", "ache", "hurt", "sick", "symptom", "fever", "headache", "stomach", "cough", "fatigue", "vomit", "diarrhea"],
      am: ["ህመም", "ራስ ምታት", "ትኩሳት", "ሆድ", "ሳል", "ድካም", "ማስመለስ", "ተቅማጥ", "ያመኛል"],
      om: ["dhukkubbi", "hoo'ina qaamaa", "mataan na dhukkuba", "garaa kaasaa", "qufaa", "dadhabbi"],
      ti: ["ቃንዛ", "ረስኒ", "ርእሰይ ሓሚሙ", "ሳዕሊ", "ድኻም"],
      so: ["xanuun", "qandho", "madax xanuun", "qufac", "daal"],
    },
    treatment: {
      en: ["cure", "remedy", "medicine", "pill", "drug", "treat", "heal", "doctor", "prescription", "antibiotic"],
      am: ["መድሃኒት", "ፈውስ", "ማዳን", "ህክምና", "ኪኒን", "ዶክተር"],
      om: ["qoricha", "fayyina", "yaala", "doktora"],
      ti: ["መድሃኒት", "ፈውሲ", "ሕክምና"],
      so: ["daawo", "daawayn", "dhaqtar"],
    },
    prevention: {
      en: ["prevent", "avoid", "protect", "risk", "vaccine", "safe", "shield", "hygiene"],
      am: ["መከላከል", "ክትባት", "ደህንነት", "ንፅህና", "ስጋት"],
      om: ["ittisuu", "eeggannoo", "talaallii"],
      ti: ["ምክልኻል", "ክትባት", "ጥንቃቐ"],
      so: ["ka hortag", "tallaal", "difaac"],
    },
    dietary: {
      en: ["food", "eat", "diet", "meal", "nutrition", "teff", "injera", "shiro", "fasting", "tsom", "calorie", "vitamin"],
      am: ["ምግብ", "መብላት", "የምግብ ስርዓት", "ጤፍ", "እንጀራ", "ሽሮ", "ጾም", "ቫይታሚን"],
      om: ["nyaata", "soorata", "tsoma", "buna", "qorafeessaa"],
      ti: ["ምግቢ", "ጾም", "ጥዕና ምግቢ"],
      so: ["cunto", "nafaqo", "soom"],
    },
    lifestyle: {
      en: ["sleep", "insomnia", "exercise", "stress", "work", "routine", "walk", "habit", "relaxation", "buna ceremony"],
      am: ["እንቅልፍ", "ስፖርት", "ጭንቀት", "ልምድ", "እረፍት", "የቡና ስነ-ስርዓት"],
      om: ["hirriba", "sochii qaamaa", "dhiphina"],
      ti: ["ድቃስ", "ስፖርት", "ጭንቀት"],
      so: ["hurdo", "jimicsi", "walwal"],
    },
    herbal: {
      en: ["herb", "plant", "root", "leaf", "traditional remedy", "tena adam", "kosso", "damakesse", "tikur azmud", "feto", "garlic", "ginger"],
      am: ["እፅዋት", "ባህላዊ መድሃኒት", "ተና አዳም", "ኮሶ", "ዳማከሴ", "ጥቁር አዝሙድ", "ፌጦ", "ነጭ ሽንኩርት", "ዝንጅብል"],
      om: ["qoricha aadaa", "habalu", "damaqasee", "habaasuda gurraacha", "qullubbii"],
      ti: ["ባህላዊ ፈውሲ", "ኮሶ", "ዳማከሴ", "ጥቁር ኣዝሙድ"],
      so: ["dhirta daawada", "toonka", "sinjibiil"],
    },
    astrological: {
      en: ["star", "zodiac", "birthday", "born", "awde negest", "humor", "element", "fire", "water", "air", "earth", "horoscope"],
      am: ["ኮከብ", "ዓውደ ነገሥት", "እሳት", "ውሃ", "ንፋስ", "መሬት", "የትውልድ ቀን"],
      om: ["urjii", "guyyaa dhalootaa"],
      ti: ["ኮኾብ", "ዓውደ ነገሥት", "ዕለተ ልደት"],
      so: ["xiddig", "maalinta dhalashada"],
    },
  };

  detectLanguage(text: string): "en" | "am" | "om" | "ti" | "so" {
    // Ge'ez script detection
    if (/[\u1200-\u137F]/.test(text)) {
      // Differentiate between Tigrinya and Amharic by specific characters
      if (/[ቐቒቓቄቕቖቘቚቛቜቝጘጚጛጜጝጞጟ]/.test(text)) {
        return "ti";
      }
      return "am";
    }

    const lower = text.toLowerCase();
    // Afaan Oromo indicators
    if (/\b(dhukkubbi|garaa|mataan|qufaa|hoo'ina|qoricha|akkam|fayyaa|nyaata)\b/i.test(lower)) {
      return "om";
    }
    // Somali indicators
    if (/\b(xanuun|qandho|madax|qufac|daawo|sidee|caafimaad|cunto)\b/i.test(lower)) {
      return "so";
    }

    return "en";
  }

  classify(text: string): IntentClassificationResult {
    const normalized = text.toLowerCase().trim();
    const language = this.detectLanguage(text);

    let bestIntent: QueryIntent = "diagnostic";
    let highestScore = 0;
    let matchedKeywords: string[] = [];

    for (const [intentKey, langDict] of Object.entries(this.intentKeywords) as [QueryIntent, Record<string, string[]>][]) {
      const keywords = [...(langDict[language] || []), ...(langDict.en || [])];
      let score = 0;
      const matched: string[] = [];

      for (const kw of keywords) {
        if (normalized.includes(kw.toLowerCase())) {
          score += intentKey === "emergency" ? 40 : 15;
          matched.push(kw);
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestIntent = intentKey;
        matchedKeywords = matched;
      }
    }

    return {
      intent: bestIntent,
      confidence: Math.min(0.65 + (highestScore / 100), 0.98),
      detectedLanguage: language,
      keywordsMatched: matchedKeywords,
    };
  }
}
