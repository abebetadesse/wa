/**
 * Urgency screening of free-text client descriptions (English and Amharic). DOMAIN A.
 * It does not name conditions; it looks for danger signs that need a qualified clinician first,
 * and returns a 0–100 score used to route (never to reassure). Absence of a sign is not safety.
 */

export type UrgencyLevel = "routine" | "soon" | "urgent" | "emergency";

interface Sign {
  id: string;
  label: string;
  score: number;
  patterns: RegExp[];
}

const SIGNS: Sign[] = [
  { id: "self_harm", label: "Thoughts of self-harm or suicide", score: 100, patterns: [/suicid|kill myself|end my life|self[- ]?harm|want to die/i, /ራሴን (ማጥፋት|ልገድል|ልጎዳ)|መሞት እፈልጋለሁ/] },
  { id: "breathing", label: "Cannot breathe or severe breathlessness", score: 95, patterns: [/can'?t breathe|cannot breathe|struggling to breathe|choking|blue lips/i, /መተንፈስ (አልቻልኩም|ያቅተኛል|አቃተኝ)|ትንፋሽ (አጠረኝ|ያጥረኛል)/] },
  { id: "chest_pain", label: "Chest pain or pressure", score: 90, patterns: [/chest (pain|pressure|tightness)|pain in (my|the) chest/i, /የደረት (ሕመም|ህመም|ውጋት)|ደረቴን/] },
  { id: "unconscious", label: "Fainting, unconsciousness or confusion", score: 95, patterns: [/unconscious|passed out|faint(ed|ing)|unresponsive|confus(ed|ion)/i, /ራሱን (ስቶ|ሳተ)|ራሴን ሳትኩ|መደናገር/] },
  { id: "seizure", label: "Seizure or fits", score: 90, patterns: [/seizure|convuls|fits?\b|epilep/i, /የሚጥል|ይጥለኛል|መንፈራገጥ/] },
  { id: "stroke", label: "Signs of stroke", score: 95, patterns: [/face (droop|drooping)|slurred speech|one side (weak|numb)|sudden weakness/i, /አንድ ጎኔ|ንግግሬ ተ(ሳሰረ|ዘጋ)|ፊቴ ተጣመመ/] },
  { id: "bleeding", label: "Heavy bleeding or vomiting blood", score: 90, patterns: [/heavy bleeding|bleeding (a lot|heavily|won'?t stop)|vomit(ing)? blood|black (stool|tarry)|blood in (my )?(vomit|stool)/i, /ብዙ ደም|ደም (አስመለሰኝ|ማስመለስ|ይፈሰኛል)|ጥቁር ሰገራ/] },
  { id: "poison_bite", label: "Poisoning or snake bite", score: 95, patterns: [/poison(ed|ing)|snake ?bite|overdose|swallowed (bleach|chemical|pesticide)/i, /እባብ (ነደፈኝ|ነከሰኝ)|መርዝ/] },
  { id: "pregnancy_bleeding", label: "Bleeding or severe pain in pregnancy", score: 95, patterns: [/pregnan[a-z]* .*(bleed|pain)|(bleed|pain).* pregnan/i, /እርጉዝ.*(ደም|ሕመም)|ነፍሰ ጡር.*ደም/] },
  { id: "severe_headache", label: "Sudden worst headache or stiff neck with fever", score: 85, patterns: [/worst headache|sudden (severe )?headache|stiff neck/i, /አንገቴ (ደረቀ|አልዞር)|ድንገተኛ ከባድ የራስ ምታት/] },
  { id: "infant_fever", label: "Fever in a baby or young child", score: 80, patterns: [/(baby|infant|newborn|toddler|my child).*(fever|hot)|(fever|hot).*(baby|infant|newborn)/i, /(ሕፃን|ህፃን|ጨቅላ).*(ትኩሳት|ያቃጥላል)/] },
  { id: "high_fever", label: "High or long-lasting fever", score: 65, patterns: [/high fever|fever for (\d+|several|many) days|fever (and|with) (chills|shivering)|shivering/i, /ከፍተኛ ትኩሳት|ብርድ ብርድ|ለቀናት ትኩሳት|ወባ/] },
  { id: "jaundice", label: "Yellow eyes or skin", score: 70, patterns: [/yellow (eyes|skin)|jaundice/i, /ዓይኔ ቢጫ|ቢጫ ዓይን|የወፍ በሽታ/] },
  { id: "dehydration", label: "Cannot keep fluids down / severe diarrhoea", score: 65, patterns: [/can'?t keep (water|fluids|anything) down|severe diarrh|diarrh[a-z]* .*(blood|days)|very little urine/i, /ውሃ (አልጠጣም|አይቆይልኝም)|ተቅማጥ.*(ደም|ቀናት)/] },
  { id: "lump", label: "A new lump or swelling", score: 60, patterns: [/lump|mass|swelling (in|on) (my )?(breast|neck|armpit)/i, /እብጠት|ጉብታ/] },
  { id: "wound_infection", label: "Spreading redness, pus or a wound not healing", score: 60, patterns: [/pus|spreading red|wound (not healing|infected)|infected wound/i, /መግል|ቁስሉ (አልዳነም|ተመረዘ)/] },
  { id: "long_cough", label: "Cough for more than two weeks", score: 55, patterns: [/cough(ing)? for (\d+ )?(weeks|months)|cough.*(2|two|three|3) weeks|coughing blood|night sweats|weight loss/i, /ሳል.*(ሳምንት|ወር)|ደም የተቀላቀለ አክታ|ሌሊት ላብ|ክብደት መቀነስ/] },
  { id: "persistent", label: "Symptoms lasting weeks or getting worse", score: 40, patterns: [/for (weeks|months)|getting worse|worse every day|not improving/i, /እየባሰ|ለሳምንታት|ለወራት/] },
];

export interface UrgencyAssessment {
  score: number;
  level: UrgencyLevel;
  signs: { id: string; label: string; score: number }[];
  advice: string;
}

export function levelFor(score: number): UrgencyLevel {
  if (score >= 85) return "emergency";
  if (score >= 60) return "urgent";
  if (score >= 30) return "soon";
  return "routine";
}

const ADVICE: Record<UrgencyLevel, string> = {
  emergency: "Danger signs are described. The person should go to the nearest hospital or health centre now. Traditional care can follow once they are safe.",
  urgent: "Signs are described that need a clinician soon, ideally within a day. Traditional care should not delay this.",
  soon: "Symptoms have lasted a while or are worsening; suggest a clinic check alongside traditional care.",
  routine: "No danger signs were found in the description. This does not rule them out; ask directly when you meet.",
};

export function assessUrgency(text: string, context: { age?: number | null; pregnant?: boolean } = {}): UrgencyAssessment {
  const signs = SIGNS.filter((sign) => sign.patterns.some((pattern) => pattern.test(text))).map(({ id, label, score }) => ({ id, label, score }));
  let score = signs.reduce((max, sign) => Math.max(max, sign.score), 0);
  // More than one sign, or a more vulnerable person, raises the score.
  if (signs.length > 1) score = Math.min(100, score + 5 * (signs.length - 1));
  if (score > 0 && ((context.age != null && (context.age < 5 || context.age >= 70)) || context.pregnant)) score = Math.min(100, score + 10);
  const level = levelFor(score);
  return { score, level, signs, advice: ADVICE[level] };
}
