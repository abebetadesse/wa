/**
 * The one urgency and crisis screen for free text, in English and Amharic. Every detector in the
 * app (case intake, workflows, diagnostic portal, inquiry, spiritual crisis check, red-flag pillar)
 * is a thin adapter over `screenText`, so a phrase that is an emergency on one screen is an
 * emergency on all of them.
 *
 * It does not name conditions; it looks for danger signs that need a qualified person first and
 * returns a 0–100 score used to route (never to reassure). Absence of a sign is not safety.
 *
 * Pure and dependency-free: it runs on the server and in client components.
 *
 * Amharic notes:
 * - Text and patterns are folded so homophone letters match (ሐ/ኀ→ሀ, ሠ→ሰ, ዐ→አ, ፀ→ጸ): ሕይወቴን = ህይወቴን.
 * - A bare ራሴን never triggers: it is "myself" but also "my head" (ራሴን አመመኝ = I have a headache).
 *   Only full self-harm phrases (ራሴን ማጥፋት, ራሴን ልገድል, …) count.
 * - መንቀጥቀጥ (trembling, also earthquake) and ልቤ ያመኛል (heartache, often grief) are deliberately not
 *   emergency signs on their own.
 */

export type UrgencyLevel = "routine" | "soon" | "urgent" | "emergency";
export type CrisisKind = "self_harm" | "violence" | "medical";

export interface UrgencySign {
  id: string;
  label: string;
  score: number;
}

export interface ScreenContext {
  age?: number | null;
  pregnant?: boolean;
}

export interface ScreenResult {
  level: UrgencyLevel;
  score: number;
  signs: UrgencySign[];
  /** Set exactly when `level` is "emergency": what kind of crisis pathway applies. */
  crisis: CrisisKind | null;
}

interface SignRule extends UrgencySign {
  /** Medical signs can be negated in English ("no chest pain"); self-harm and violence never are. */
  kind: "self_harm" | "violence" | "medical";
  patterns: RegExp[];
}

// Ethiopic homophone families folded onto one letter series (each series is 8 code points).
const FOLD: Array<[number, number]> = [
  [0x1210, 0x1200], // ሐ → ሀ
  [0x1280, 0x1200], // ኀ → ሀ
  [0x1220, 0x1230], // ሠ → ሰ
  [0x12d0, 0x12a0], // ዐ → አ
  [0x1340, 0x1338], // ፀ → ጸ
];

/** Folds Amharic homophone letters so spelling variants match the same pattern. */
export function foldEthiopic(text: string): string {
  return text.replace(/[ሐ-ሗኀ-ኇሠ-ሧዐ-዗ፀ-ፇ]/g, (char) => {
    const code = char.charCodeAt(0);
    const family = FOLD.find(([from]) => code >= from && code < from + 8)!;
    return String.fromCharCode(family[1] + (code - family[0]));
  });
}

const rule = (id: string, label: string, score: number, kind: SignRule["kind"], patterns: RegExp[]): SignRule => ({
  id,
  label,
  score,
  kind,
  patterns: patterns.map((pattern) => new RegExp(foldEthiopic(pattern.source), pattern.flags.includes("i") ? pattern.flags : `${pattern.flags}i`)),
});

const SIGNS: SignRule[] = [
  rule("self_harm", "Thoughts of self-harm or suicide", 100, "self_harm", [
    /suicid|kill(ing)? myself|end(ing)? my (own )?life|take my (own )?life|want to die|wish i (was|were) dead|better off dead|no reason to live|self[- ]?harm|hurt(ing)? myself|hang myself|shoot myself|slit my|overdose on purpose/,
    /ራሴን (ማጥፋት|ላጠፋ|ላጥፋ|አጠፋለሁ|ልገድል|ልግደል|እገድላለሁ|መግደል|ልጎዳ|መጉዳት|ሰቅዬ)|ራስን (ማጥፋት|መግደል)|ህይወቴን (ማጥፋት|ላጠፋ|ላጥፋ)|መሞት እፈልጋለሁ|ብሞት ይሻለኛል|መኖር አልፈልግም/,
  ]),
  rule("violence", "Violence, abuse or threats to life", 90, "violence", [
    /domestic violence|(he|she|they) (beats?|hits?|chokes?|kicks?) me|beat(s|ing)? me (up)?|physically abus|threaten(ed|s|ing)? to kill|unsafe at home|afraid (he|she|they) will kill me|\braped?\b|sexual(ly)? (assault|abuse|abused)|violent attack/,
    /ይደበድበኛል|ትደበድበኛለች|ይደበድቡኛል|ደበደበኝ|ደበደበችኝ|ደበደቡኝ|ተደፈርኩ|የጾታ ጥቃት|ጾታዊ ጥቃት|ሊገድለኝ|ሊገድሉኝ|ልትገድለኝ|እገድልሻለሁ|እገድልሀለሁ/,
  ]),
  rule("breathing", "Cannot breathe or severe breathlessness", 95, "medical", [
    /can'?t breathe|can ?not breathe|unable to breathe|struggling to breathe|gasping|choking|blue lips|stridor|cyanosis/,
    /መተንፈስ (አልቻልኩም|አልችልም|ያቅተኛል|አቃተኝ|አቃተው|አቃታት)|ትንፋሽ አጠረኝ|ትንፋሽ የለኝም/,
  ]),
  rule("breathless", "Shortness of breath", 70, "medical", [/difficulty breathing|shortness of breath|short of breath|breathless/, /ትንፋሽ (ያጥረኛል|ማጠር)|የትንፋሽ ማጠር/]),
  rule("chest_pain", "Chest pain or pressure", 90, "medical", [
    /chest (pain|pressure|tightness)|pain in (my|the|his|her) chest|heart attack/,
    /የደረት (ህመም|ውጋት)|ደረቴን (ያመኛል|አመመኝ|ይወጋኛል|ወጋኝ|ይጨመድደኛል|ጨመደደኝ|ያቃጥለኛል)|ደረቴ (ያመኛል|ይወጋኛል)/,
  ]),
  rule("unconscious", "Fainting, collapse or unconsciousness", 95, "medical", [
    /unconscious|loss of consciousness|lost consciousness|passed out|blacked out|faint(ed|ing)|syncope|unresponsive|\b(i|he|she|they) (suddenly )?collapsed|won'?t wake up|can'?t wake (him|her|them)|sudden(ly)? confus|disoriented/,
    /ራሱን (ስቶ|ሳተ|አያውቅም)|ራሷን (ስታ|ሳተች)|ራሴን ሳትኩ|ራስን መሳት|ራስ መሳት|ንቃተ ህሊና|አልተነቃም|አይነቃም/,
  ]),
  rule("seizure", "Seizure or fits", 90, "medical", [/seizure|convuls|having (a )?fits?\b|(has|have|gets?) fits\b|epileptic (fit|attack)/, /የሚጥል|ይጥለኛል|መንፈራገጥ|አንዘፈዘፈ/]),
  rule("stroke", "Signs of stroke", 95, "medical", [
    /face (droop|drooping|is drooping)|slurred speech|one side (of (my|his|her) body )?(is )?(weak|numb)|weakness on one side|sudden weakness|sudden(ly)? paraly|paraly[sz]ed on one side|sudden (loss of vision|vision loss|blindness)/,
    /አንድ ጎኔ (ደነዘዘ|ሞተ|አልታዘዝ|አይንቀሳቀስም)|ንግግሬ ተ(ሳሰረ|ዘጋ)|ንግግሩ ተ(ሳሰረ|ዘጋ)|ፊቴ ተጣመመ|ፊቱ ተጣመመ|ፊቷ ተጣመመ|ሽባ ሆን/,
  ]),
  rule("head_injury", "Serious head injury", 90, "medical", [/severe head injury|head (injury|trauma)|hit (my|his|her) head and (lost|passed|blacked)/, /የጭንቅላት ጉዳት|ጭንቅላቱን ተመታ|ጭንቅላቴን ተመታሁ/]),
  rule("bleeding", "Heavy bleeding or vomiting blood", 90, "medical", [
    /heavy bleeding|severe bleeding|bleeding (a lot|heavily|won'?t stop|that won'?t stop)|hemorrhag|haemorrhag|major blood loss|vomit(ing|ed)? blood|blood in (my )?vomit|black (stool|tarry)|melena/,
    /ብዙ ደም|ደም (አስመለሰኝ|ማስመለስ|ማስታወክ|አስታወከኝ|ይፈሰኛል)|ጥቁር ሰገራ/,
  ]),
  rule("poison_bite", "Poisoning, overdose or snake bite", 95, "medical", [
    /\b(i|he|she|they|we|baby|child|son|daughter) (was|were|has been|have been|got) poisoned|swallowed (bleach|poison|chemicals?|pesticide|rat poison|pills|kerosene)|overdose|took too many (pills|tablets)|snake ?bite|bitten by a snake/,
    /እባብ (ነደፈኝ|ነከሰኝ|ነደፈው|ነደፋት)|መርዝ (ጠጣ|ጠጣሁ|ጠጥቼ|ጠጣች|ዋጥኩ|ዋጠ|በላሁ)/,
  ]),
  rule("anaphylaxis", "Severe allergic reaction", 90, "medical", [/anaphyla|throat (is )?(closing|swelling)|swollen (tongue|throat)/]),
  rule("pregnancy_danger", "Bleeding, severe pain or danger signs in pregnancy", 95, "medical", [
    /pregnan[a-z]* .*(bleed|severe pain|abdominal pain|belly pain|stomach pain|severe headache|blurred vision|seizure|fits)|(bleed|severe pain|abdominal pain|severe headache|blurred vision|seizure).* pregnan/,
    /እርጉዝ.*(ደም|ህመም)|ነፍሰ ጡር.*(ደም|ህመም)/,
  ]),
  rule("severe_headache", "Sudden worst headache or stiff neck with fever", 85, "medical", [/worst headache|sudden (severe )?headache|stiff neck|photophobia/, /አንገቴ (ደረቀ|አልዞር|ተወጠረ)|አንገት መወጠር|ድንገተኛ ከባድ የራስ ምታት/]),
  rule("infant_fever", "Fever in a baby or young child", 80, "medical", [/(baby|infant|newborn|toddler|my child).*(fever|very hot|burning up)|(fever|burning up).*(baby|infant|newborn)/, /(ህፃን|ጨቅላ).*(ትኩሳት|ያቃጥላል)/]),
  rule("allergic", "Allergic swelling or trouble swallowing", 65, "medical", [/allergic reaction|swollen lips|difficulty swallowing|can'?t swallow/]),
  rule("blood_in_stool", "Blood in the stool", 70, "medical", [/blood in (my |the )?(stool|poo)|bloody stool/, /ደም የቀላቀለ ሰገራ|ሰገራዬ ደም/]),
  rule("coughing_blood", "Coughing up blood", 70, "medical", [/cough(ing|ed)? (up )?blood/, /ደም የተቀላቀለ አክታ|ደም አስለኝ/]),
  rule("jaundice", "Yellow eyes or skin", 70, "medical", [/yellow (eyes|skin)|(eyes|skin) (is |are |has |have )?(turned |gone |become )?yellow|jaundice|dark urine/, /ዓይኔ ቢጫ|ቢጫ ዓይን|ቢጫ አይን|አይኔ ቢጫ|የወፍ በሽታ/]),
  rule("high_fever", "High or long-lasting fever", 65, "medical", [/high fever|fever for (\d+|several|many) days|fever (and|with) (chills|shivering)|shivering|rigors/, /ከፍተኛ ትኩሳት|ብርድ ብርድ|ለቀናት ትኩሳት|ወባ/]),
  rule("severe_pain", "Severe pain", 65, "medical", [/severe pain|excruciating|unbearable pain/, /ከባድ ህመም|የማይቻል ህመም/]),
  rule("dehydration", "Cannot keep fluids down / severe diarrhoea", 65, "medical", [
    /can'?t keep (water|fluids|anything) down|unable to keep fluids|persistent vomiting|severe diarrh|diarrh[a-z]* .*(blood|days)|very little urine/,
    /ውሃ (አልጠጣም|አይቆይልኝም)|ተቅማጥ.*(ደም|ቀናት)/,
  ]),
  rule("bleeding_other", "Bleeding", 60, "medical", [/\bbleeding\b|blood loss/, /ደም መፍሰስ|ደም ይፈሳል/]),
  rule("heart", "Heart pain or palpitations", 60, "medical", [/palpitation|heart (is )?racing|racing heart/, /የልብ ህመም/]),
  rule("lump", "A new lump or swelling", 60, "medical", [/\blumps?\b(?! sum)|a (new )?mass (in|on)|swelling (in|on) (my )?(breast|neck|armpit)|swollen glands/, /እብጠት|ጉብታ/]),
  rule("wound_infection", "Spreading redness, pus or a wound not healing", 60, "medical", [/\bpus\b|spreading red|wound (not healing|infected)|infected wound/, /መግል|ቁስሉ (አልዳነም|ተመረዘ)/]),
  rule("long_cough", "Cough for more than two weeks", 55, "medical", [
    /cough(ing)? for (\d+ )?(weeks|months)|cough.*(2|two|three|3) weeks|chronic cough|night sweats|weight loss/,
    /ሳል.*(ሳምንት|ወር)|ሌሊት ላብ|ክብደት መቀነስ/,
  ]),
  rule("persistent", "Symptoms lasting weeks or getting worse", 40, "medical", [
    /for (\d+|several|many|a few) (weeks|months|years)|for (weeks|months)|getting worse|worse every day|worsening|not improving|\bpersistent\b|recurrent/,
    /እየባሰ|ለሳምንታት|ለወራት|ቀጣይ ህመም/,
  ]),
];

/** Public description of the signs (id, label, score), for documentation and admin screens. */
export const URGENCY_SIGNS: readonly UrgencySign[] = SIGNS.map(({ id, label, score }) => ({ id, label, score }));

// English negation right before a sign ("no chest pain", "I don't have any fever"). Kept narrow so
// "I'm not sure, but I have chest pain" still counts.
const NEGATED = /(\b(no|not|never|without|denies|deny)\s+(any\s+|a\s+|have\s+|had\s+|feel\s+|got\s+)*|\b(do|does|did|have|has)\s*n[o']?t\s+(have\s+|had\s+|get\s+|got\s+|feel\s+|felt\s+|notice\s+)?(any\s+|a\s+)?)$/i;

function matches(sign: SignRule, text: string): boolean {
  return sign.patterns.some((pattern) => {
    const global = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
    for (const match of text.matchAll(global)) {
      if (sign.kind !== "medical") return true;
      const clause = text.slice(Math.max(0, (match.index ?? 0) - 40), match.index).split(/[.;!?\n,]/).pop() ?? "";
      if (!NEGATED.test(clause)) return true;
    }
    return false;
  });
}

export function levelFor(score: number): UrgencyLevel {
  if (score >= 85) return "emergency";
  if (score >= 60) return "urgent";
  if (score >= 30) return "soon";
  return "routine";
}

/** Screens free text for danger signs. `crisis` is set exactly when the level is "emergency". */
export function screenText(text: string, context: ScreenContext = {}): ScreenResult {
  const folded = foldEthiopic(String(text ?? ""));
  const found = folded.trim() ? SIGNS.filter((sign) => matches(sign, folded)) : [];
  const signs = found.map(({ id, label, score }) => ({ id, label, score }));
  let score = signs.reduce((max, sign) => Math.max(max, sign.score), 0);
  // More than one serious sign, or a more vulnerable person, raises the score. Minor signs
  // ("for weeks", "persistent") describe the same complaint and do not stack.
  const serious = signs.filter((sign) => sign.score >= 60).length;
  if (serious > 1) score = Math.min(100, score + 5 * (serious - 1));
  if (score > 0 && ((context.age != null && (context.age < 5 || context.age >= 70)) || context.pregnant)) score = Math.min(100, score + 10);
  const level = levelFor(score);
  const crisis: CrisisKind | null =
    level !== "emergency" ? null : found.some((sign) => sign.kind === "self_harm") ? "self_harm" : found.some((sign) => sign.kind === "violence") ? "violence" : "medical";
  return { level, score, signs, crisis };
}
