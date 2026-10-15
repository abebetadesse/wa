/**
 * Reads common misspellings of symptom words the way the person meant them ("Abdominal paim"),
 * so a typing slip does not hide a symptom from the analysis. Only the words below are ever
 * produced, a correction needs the same first letter and one edit (two for long words), and real
 * English words that sit one edit away ("weigh", "fewer", "couch") are never changed. The person's
 * own wording is still what is quoted; each correction is listed for the reviewer as "read as".
 */

/** Words a symptom description is made of. Corrections only ever land on one of these. */
const VOCABULARY = [
  "pain", "pains", "painful", "ache", "aches", "abdominal", "abdomen", "stomach", "belly", "cramps", "cramping",
  "weight", "losing", "appetite", "nausea", "vomiting", "vomit", "diarrhoea", "diarrhea", "constipation",
  "bloating", "heartburn", "indigestion", "ulcer", "gastritis", "fever", "chills", "sweats", "sweating",
  "cough", "coughing", "breathing", "breathless", "headache", "migraine", "dizziness", "dizzy", "fatigue",
  "tired", "tiredness", "weakness", "exhausted", "bleeding", "blood", "stool", "stools", "urine", "urination",
  "thirst", "thirsty", "swelling", "swollen", "itching", "rash", "jaundice", "yellow", "numbness", "palpitations",
  "chest", "throat", "swallowing", "joint", "joints", "muscle", "insomnia", "sleep", "sleeping", "anxiety",
  "anxious", "depressed", "stress", "medicine", "medication", "tablets", "remedy", "fasting", "eating",
];

/** Real words one edit from a vocabulary word: left as written. */
const KEEP = new Set([
  "paid", "pail", "pair", "paint", "rain", "gain", "main", "vain", "weigh", "weighs", "eight", "height",
  "lose", "loose", "lost", "fewer", "never", "lever", "couch", "touch", "rough", "tough", "dough", "bloom",
  "flood", "chess", "chase", "check", "tires", "timed", "tiled", "tread", "steep", "sheep", "sleet", "slept",
  "stole", "store", "stood", "storm", "ranch", "fellow", "mellow", "dairy", "diary", "every", "beating",
  "seating", "heating", "points", "jointly", "mussel", "tablet", "cables", "dress", "press", "abode",
  "stolen", "thirty", "worthy", "remedies", "tried", "sweep", "cheat", "joins", "blond", "coach", "cheap",
]);

/** Slips too short for the edit rule. */
const ALIASES: Record<string, string> = {
  paim: "pain", pian: "pain", pein: "pain", painn: "pain", payn: "pain", piain: "pain", pani: "pain",
  abdomial: "abdominal", abdominl: "abdominal", abdomenal: "abdominal", abdominial: "abdominal", abdomnal: "abdominal",
  stomache: "stomach", stomac: "stomach", stomack: "stomach", stumach: "stomach",
  diarhea: "diarrhea", diarrea: "diarrhea", diarhoea: "diarrhoea", diarreah: "diarrhea", diahrea: "diarrhea",
  vomitting: "vomiting", nausia: "nausea",
  feaver: "fever", fevar: "fever", coff: "cough", caugh: "cough", hedache: "headache", headach: "headache",
  wieght: "weight", weigth: "weight", wight: "weight", waight: "weight", weght: "weight",
  apetite: "appetite", appetit: "appetite", apettite: "appetite", tierd: "tired", tird: "tired",
  constipaton: "constipation", consipation: "constipation", bleding: "bleeding", blod: "blood",
};

const WORDS = new Set(VOCABULARY);

/** Optimal string alignment distance, stopping once it exceeds `limit`. */
function distance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  const rows: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let best = limit + 1;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
      best = Math.min(best, rows[i][j]);
    }
    if (best > limit) return limit + 1;
  }
  return rows[a.length][b.length];
}

function correctWord(word: string): string | null {
  const lower = word.toLowerCase();
  if (lower.length < 4 || WORDS.has(lower) || KEEP.has(lower)) return null;
  if (ALIASES[lower]) return ALIASES[lower];
  const limit = lower.length >= 8 ? 2 : 1;
  const candidates = VOCABULARY.filter((target) => target.length >= 5 && target[0] === lower[0] && distance(lower, target, limit) <= limit);
  // An ambiguous slip ("stoll": stool or still?) is left alone.
  return candidates.length === 1 ? candidates[0] : null;
}

export interface SpellingCorrection {
  from: string;
  to: string;
}

/** The text with symptom-word slips corrected, and what was changed. Non-Latin text is untouched. */
export function correctSpelling(text: string): { text: string; corrections: SpellingCorrection[] } {
  const corrections: SpellingCorrection[] = [];
  const corrected = text.replace(/[A-Za-z][A-Za-z']*/g, (word) => {
    const to = correctWord(word);
    if (!to) return word;
    if (!corrections.some((entry) => entry.from === word)) corrections.push({ from: word, to });
    return word[0] === word[0].toUpperCase() ? `${to[0].toUpperCase()}${to.slice(1)}` : to;
  });
  return { text: corrected, corrections };
}
