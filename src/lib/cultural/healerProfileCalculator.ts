/**
 * Healer profile calculator: Ge'ez Fidel gematria, Awde Negest circle and sacred-name suggestions
 * for the healer's review workspace. DOMAIN B (heritage and reflection). It never recommends
 * remedies, doses or medical actions; the Awde Negest engine's generic remedy line is dropped on
 * purpose, because remedies are screened by the safety matrix on the Domain A side.
 */
import { AWUDE_NEGEST_60_CATEGORIES, calculateAwudeNegestReading } from "./awudeNegestEngine";
import { COMMON_BAPTISMAL_PATRONS, calculateGeezGematria } from "./geezFidelGematria";

export type Humor = "esat" | "may" | "nifas" | "afere";

export const HUMOR_LABELS: Record<Humor, { am: string; en: string; quality: string }> = {
  esat: { am: "እሳት", en: "Fire", quality: "warm and dry" },
  may: { am: "ማይ", en: "Water", quality: "cold and moist" },
  nifas: { am: "ነፋስ", en: "Air", quality: "warm and moist" },
  afere: { am: "አፈር", en: "Earth", quality: "cold and dry" },
};

export interface SacredNameSuggestion {
  name: string;
  nameGeez: string;
  gender: "male" | "female";
  meaning: string;
  virtue: string;
  patron: string;
  /** Day of every Ethiopian month on which the patron is commemorated, when well established. */
  monthlyCommemoration: number | null;
}

export interface HealerProfile {
  input: { nameGeez: string; motherNameGeez: string | null; category: string };
  gematria: {
    letters: { letter: string; value: number }[];
    nameTotal: number;
    motherTotal: number;
    combinedTotal: number;
    digitalRoot: number;
    virtue: string;
    resonance: string;
  };
  awdeNegest: {
    circleNumber: number;
    circleName: string;
    circleGeez: string;
    guardian: string;
    symbol: string;
    temperament: string;
    section: number;
    sectionTime: "day" | "night";
    category: { id: string; en: string; am: string };
    reflection: string;
    proverb: string;
  };
  humor: { key: Humor; am: string; en: string; quality: string };
  sacredNames: SacredNameSuggestion[];
  boundary: string;
}

/** Theophoric name patrons: Ge'ez stem, English form, patron description and commemoration day. */
interface Patron {
  key: string;
  en: string;
  geez: string;
  patron: string;
  meaningOf: string;
  day: number | null;
}

const PATRONS: Record<string, Patron> = {
  mikael: { key: "mikael", en: "Mikael", geez: "ሚካኤል", patron: "Archangel Michael", meaningOf: "Michael", day: 12 },
  gabriel: { key: "gabriel", en: "Gebriel", geez: "ገብርኤል", patron: "Archangel Gabriel", meaningOf: "Gabriel", day: 19 },
  rufael: { key: "rufael", en: "Rufael", geez: "ሩፋኤል", patron: "Archangel Raphael, the healer", meaningOf: "Raphael", day: 3 },
  uriel: { key: "uriel", en: "Uriel", geez: "ዑራኤል", patron: "Archangel Uriel", meaningOf: "Uriel", day: null },
  fanuel: { key: "fanuel", en: "Fanuel", geez: "ፋኑኤል", patron: "Archangel Phanuel", meaningOf: "Phanuel", day: null },
  raguel: { key: "raguel", en: "Raguel", geez: "ራጉኤል", patron: "Archangel Raguel", meaningOf: "Raguel", day: null },
  maryam: { key: "maryam", en: "Maryam", geez: "ማርያም", patron: "Saint Mary", meaningOf: "Mary", day: 21 },
  selassie: { key: "selassie", en: "Selassie", geez: "ሥላሴ", patron: "the Holy Trinity", meaningOf: "the Trinity", day: null },
  giyorgis: { key: "giyorgis", en: "Giyorgis", geez: "ጊዮርጊስ", patron: "Saint George", meaningOf: "Saint George", day: 23 },
  meskel: { key: "meskel", en: "Meskel", geez: "መስቀል", patron: "the Holy Cross", meaningOf: "the Cross", day: null },
  kristos: { key: "kristos", en: "Kristos", geez: "ክርስቶስ", patron: "Christ", meaningOf: "Christ", day: null },
  tekle: { key: "tekle", en: "Tekle Haymanot", geez: "ተክለ ሃይማኖት", patron: "Abune Tekle Haymanot", meaningOf: "Tekle Haymanot", day: 24 },
};

/** Guardian of each Awde Negest circle (by name fragment) → patron key. */
const CIRCLE_PATRON: [RegExp, string][] = [
  [/Michael/, "mikael"],
  [/Gabriel/, "gabriel"],
  [/Raphael/, "rufael"],
  [/Uriel/, "uriel"],
  [/Phanuel/, "fanuel"],
  [/Raguel/, "raguel"],
];

/** Digital root → patron, following the gematria virtue of each number. */
const ROOT_PATRON: Record<number, string> = { 1: "selassie", 2: "gabriel", 3: "selassie", 4: "giyorgis", 5: "meskel", 6: "tekle", 7: "mikael", 8: "kristos", 9: "maryam" };

const PREFIXES = {
  gebre: { en: "Gebre", geez: "ገብረ", gender: "male" as const, meaning: "Servant of" },
  wolde: { en: "Wolde", geez: "ወልደ", gender: "male" as const, meaning: "Son of" },
  haile: { en: "Haile", geez: "ኃይለ", gender: "male" as const, meaning: "Strength of" },
  walatta: { en: "Walatta", geez: "ወለተ", gender: "female" as const, meaning: "Daughter of" },
  amete: { en: "Amete", geez: "አመተ", gender: "female" as const, meaning: "Handmaid of" },
};

function nameFor(prefix: keyof typeof PREFIXES, patron: Patron, virtue: string): SacredNameSuggestion {
  const p = PREFIXES[prefix];
  const feast = COMMON_BAPTISMAL_PATRONS.find((entry) => entry.prefix.toLowerCase() === patron.key)?.dayOfMonth ?? patron.day;
  return {
    name: `${p.en} ${patron.en}`,
    nameGeez: `${p.geez} ${patron.geez}`,
    gender: p.gender,
    meaning: `${p.meaning} ${patron.meaningOf}`,
    virtue,
    patron: patron.patron,
    monthlyCommemoration: feast,
  };
}

/**
 * Three sacred-name suggestions: one under the circle's guardian, one under the patron of the
 * digital root, and one under Saint Mary (or another patron if already used), mixing forms.
 */
export function suggestSacredNames(circleName: string, digitalRoot: number, virtue: string): SacredNameSuggestion[] {
  const circleKey = CIRCLE_PATRON.find(([pattern]) => pattern.test(circleName))?.[1] ?? "mikael";
  const rootKey = ROOT_PATRON[digitalRoot] ?? "selassie";
  const keys = [...new Set([circleKey, rootKey, "maryam", "mikael", "gabriel"])].slice(0, 3);
  const male: (keyof typeof PREFIXES)[] = ["gebre", "wolde", "haile"];
  let nextMale = 0;
  return keys.map((key, index) => {
    // Saint Mary takes the familiar "Walatta Maryam"; a third non-Marian name takes a female form.
    if (key === "maryam") return nameFor("walatta", PATRONS[key], virtue);
    if (index === 2) return nameFor("amete", PATRONS[key], virtue);
    return nameFor(male[nextMale++], PATRONS[key], virtue);
  });
}

export function calculateHealerProfile(input: { nameGeez: string; motherNameGeez?: string | null; category?: string }): HealerProfile {
  const nameGeez = input.nameGeez.trim();
  if (!/[ሀ-፿]/.test(nameGeez)) throw new Error("A name in Ge'ez letters is required.");
  const mother = input.motherNameGeez?.trim() || null;
  const own = calculateGeezGematria(nameGeez);
  const combined = calculateGeezGematria(`${nameGeez}${mother ?? ""}`);
  const motherTotal = mother ? calculateGeezGematria(mother).totalNumericalSum : 0;

  const category = AWUDE_NEGEST_60_CATEGORIES.find((c) => c.id === input.category) ?? AWUDE_NEGEST_60_CATEGORIES.find((c) => c.id === "wellbeing")!;
  const reading = calculateAwudeNegestReading({ name: nameGeez, motherName: mother ?? undefined, category: category.id });
  const humorKey = reading.circle.elementalAffinity as Humor;
  const section = reading.calculatedValues.segment;

  return {
    input: { nameGeez, motherNameGeez: mother, category: category.id },
    gematria: {
      letters: combined.recognizedFidelLetters,
      nameTotal: own.totalNumericalSum,
      motherTotal,
      combinedTotal: combined.totalNumericalSum,
      digitalRoot: combined.reducedDigitValue,
      virtue: combined.philosophicalVirtue,
      resonance: combined.biblicalResonance,
    },
    awdeNegest: {
      circleNumber: reading.circle.number,
      circleName: reading.circle.name,
      circleGeez: reading.circle.geezTitle,
      guardian: reading.circle.guardianAngel,
      symbol: reading.circle.symbol,
      temperament: reading.circle.temperament,
      section,
      sectionTime: section <= 8 ? "day" : "night",
      category: { id: category.id, en: category.en, am: category.am },
      reflection: reading.prediction.prophecy,
      proverb: reading.prediction.traditionalProverb,
    },
    humor: { key: humorKey, ...HUMOR_LABELS[humorKey] },
    sacredNames: suggestSacredNames(reading.circle.name, combined.reducedDigitValue, combined.philosophicalVirtue),
    boundary: "A reflective reading within the Awde Negest and Ge'ez letter traditions. It is not a prediction, a diagnosis or a remedy. Baptismal names are chosen by the family with their priest.",
  };
}

/** Plain text for inserting the profile into a review or message. */
export function formatHealerProfile(profile: HealerProfile) {
  const names = profile.sacredNames.map((n) => `• ${n.nameGeez} (${n.name}): ${n.meaning}${n.monthlyCommemoration ? `, remembered on day ${n.monthlyCommemoration} of each month` : ""}`).join("\n");
  return [
    `የስም ሐሳብ (Name reckoning): ${profile.input.nameGeez}${profile.input.motherNameGeez ? ` + ${profile.input.motherNameGeez}` : ""} = ${profile.gematria.combinedTotal} → ${profile.gematria.digitalRoot}`,
    `${profile.gematria.virtue}`,
    `አውደ ነገሥት: ${profile.awdeNegest.circleGeez} (${profile.awdeNegest.circleName}), ${profile.awdeNegest.sectionTime === "day" ? "መዓልት" : "ሌሊት"} section ${profile.awdeNegest.section}`,
    `ባሕርይ (humour): ${profile.humor.am} / ${profile.humor.en}, ${profile.humor.quality}`,
    `${profile.awdeNegest.proverb}`,
    `Sacred names to consider:\n${names}`,
    profile.boundary,
  ].join("\n\n");
}
