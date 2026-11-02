/**
 * Starting rows for the Spiritual Guidance tables. They are written once, when a table is empty or a
 * row is missing, and an administrator's edits always win afterwards. Rows that a tradition expert
 * still has to confirm are written with `validated: false` and are flagged on the admin page.
 */
import { MONTHLY_COMMEMORATIONS } from "@/lib/cosmic/skyDay";
import { GEEZ_LETTER_VALUES } from "@/lib/cultural/geezFidelGematria";
import { AWDE_NEGEST_SIGNS } from "@/lib/cultural/awdeNegestZodiac";
import type { CalendarDayRule, DayEffects, Localized } from "./observances";

// ── Services ────────────────────────────────────────────────────────────────

export const METHODS = ["awde_negest", "numerology", "astrology", "hexagram", "moon", "religion", "meaning"] as const;
export type Method = (typeof METHODS)[number];
export type MethodWeights = Partial<Record<Method, number>>;

export interface ServiceOptions {
  /** Moon themes that suit the event, best first. */
  moonThemes?: ("planning" | "growth" | "completion" | "release")[];
  /** Penalise days when Mercury is retrograde (contracts, travel, moving). */
  mercuryRetrogradePenalty?: boolean;
  /** Penalise void-of-course Moon hours. */
  voidOfCoursePenalty?: boolean;
  /** The event needs government offices and banks to be open. */
  needsOfficesOpen?: boolean;
  /** Also suggest a good time window within the day. */
  timeWindow?: boolean;
  /** The person names the activity themselves. */
  customActivity?: boolean;
}

export interface ServiceDefault {
  slug: string;
  names: Localized;
  descriptions: Localized;
  mode: "date" | "naming" | "profile";
  weights: MethodWeights;
  options: ServiceOptions;
  displayOrder: number;
}

export const SERVICE_DEFAULTS: ServiceDefault[] = [
  {
    slug: "naming",
    names: { en: "Child, business or product naming", am: "ስም ማውጣት (ልጅ፣ ንግድ፣ ምርት)" },
    descriptions: { en: "Names that suit the birth date, the mother's name and your tradition, with their meanings.", am: "ከልደት ቀን፣ ከእናት ስም እና ከእምነትዎ ጋር የሚስማሙ ስሞችና ትርጉማቸው።" },
    mode: "naming",
    weights: { awde_negest: 30, numerology: 25, religion: 25, meaning: 20 },
    options: {},
    displayOrder: 1,
  },
  {
    slug: "shop_opening",
    names: { en: "Shop or business opening date", am: "የሱቅ ወይም የንግድ መክፈቻ ቀን" },
    descriptions: { en: "The best days to open a shop or start a business.", am: "ሱቅ ለመክፈት ወይም ንግድ ለመጀመር ተስማሚ ቀናት።" },
    mode: "date",
    weights: { awde_negest: 25, numerology: 20, moon: 20, astrology: 15, hexagram: 10, religion: 10 },
    options: { moonThemes: ["growth"], needsOfficesOpen: true, timeWindow: true, voidOfCoursePenalty: true },
    displayOrder: 2,
  },
  {
    slug: "house_moving",
    names: { en: "House moving date", am: "የቤት መቀየሪያ ቀን" },
    descriptions: { en: "Good days to move into a new home.", am: "ወደ አዲስ ቤት ለመግባት ተስማሚ ቀናት።" },
    mode: "date",
    weights: { awde_negest: 25, numerology: 15, moon: 20, astrology: 20, hexagram: 10, religion: 10 },
    options: { moonThemes: ["growth"], mercuryRetrogradePenalty: true, timeWindow: true, voidOfCoursePenalty: true },
    displayOrder: 3,
  },
  {
    slug: "wedding",
    names: { en: "Wedding or engagement date", am: "የሠርግ ወይም የቀለበት ቀን" },
    descriptions: { en: "Days that suit a wedding or engagement, away from fasts.", am: "ከጾም ውጭ ለሠርግ ወይም ለቀለበት ተስማሚ ቀናት።" },
    mode: "date",
    weights: { awde_negest: 25, numerology: 15, moon: 20, astrology: 15, hexagram: 10, religion: 15 },
    options: { moonThemes: ["growth", "completion"], voidOfCoursePenalty: true },
    displayOrder: 4,
  },
  {
    slug: "rest_day",
    names: { en: "Holiday or rest day", am: "የዕረፍት ቀን ምርጫ" },
    descriptions: { en: "A lucky day to take off and rest.", am: "ለዕረፍት የሚሆን መልካም ቀን።" },
    mode: "date",
    weights: { awde_negest: 20, numerology: 25, moon: 20, astrology: 10, hexagram: 15, religion: 10 },
    options: { moonThemes: ["completion", "release"] },
    displayOrder: 5,
  },
  {
    slug: "travel",
    names: { en: "Travel start date", am: "የጉዞ መጀመሪያ ቀን" },
    descriptions: { en: "Good days to set out on a journey.", am: "ጉዞ ለመጀመር ተስማሚ ቀናት።" },
    mode: "date",
    weights: { awde_negest: 20, numerology: 15, moon: 20, astrology: 25, hexagram: 10, religion: 10 },
    options: { moonThemes: ["growth"], mercuryRetrogradePenalty: true, voidOfCoursePenalty: true, timeWindow: true },
    displayOrder: 6,
  },
  {
    slug: "contract_job",
    names: { en: "Signing a contract or starting a job", am: "ውል መፈረሚያ ወይም አዲስ ሥራ መጀመሪያ ቀን" },
    descriptions: { en: "Good days to sign an agreement or begin new work.", am: "ስምምነት ለመፈረም ወይም አዲስ ሥራ ለመጀመር ተስማሚ ቀናት።" },
    mode: "date",
    weights: { awde_negest: 20, numerology: 20, moon: 15, astrology: 25, hexagram: 10, religion: 10 },
    options: { moonThemes: ["growth", "planning"], mercuryRetrogradePenalty: true, voidOfCoursePenalty: true, needsOfficesOpen: true },
    displayOrder: 7,
  },
  {
    slug: "construction",
    names: { en: "Construction start (foundation laying)", am: "የግንባታ መጀመሪያ (የመሠረት ድንጋይ) ቀን" },
    descriptions: { en: "Good days to lay a foundation or begin building.", am: "መሠረት ለመጣል ወይም ግንባታ ለመጀመር ተስማሚ ቀናት።" },
    mode: "date",
    weights: { awde_negest: 25, numerology: 15, moon: 25, astrology: 15, hexagram: 10, religion: 10 },
    options: { moonThemes: ["growth"], timeWindow: true },
    displayOrder: 8,
  },
  {
    slug: "routine_activity",
    names: { en: "Find a date for any activity", am: "ለማንኛውም ተግባር ቀን መፈለጊያ" },
    descriptions: { en: "Describe the activity and get the most favourable days.", am: "ተግባሩን ይግለጹና ተስማሚ ቀናትን ያግኙ።" },
    mode: "date",
    weights: { awde_negest: 20, numerology: 20, moon: 20, astrology: 15, hexagram: 10, religion: 15 },
    options: { moonThemes: ["growth"], customActivity: true },
    displayOrder: 9,
  },
  {
    slug: "profile",
    names: { en: "Personal profile reading", am: "የግል መገለጫ ንባብ" },
    descriptions: { en: "Your star, numbers, lucky days, colours and direction.", am: "ኮከብዎ፣ ቁጥሮችዎ፣ መልካም ቀናት፣ ቀለማትና አቅጣጫ።" },
    mode: "profile",
    weights: {},
    options: {},
    displayOrder: 10,
  },
];

/** Weights must be whole numbers from 0 to 100 that add up to 100 (a profile reading has none). */
export function weightProblem(mode: ServiceDefault["mode"], weights: MethodWeights): string | null {
  const values = Object.entries(weights);
  if (values.some(([key]) => !(METHODS as readonly string[]).includes(key))) return `Unknown method; use ${METHODS.join(", ")}.`;
  if (values.some(([, v]) => !Number.isInteger(v) || (v as number) < 0 || (v as number) > 100)) return "Each weight must be a whole number from 0 to 100.";
  const total = values.reduce((sum, [, v]) => sum + (v as number), 0);
  if (mode === "profile") return total === 0 ? null : "A profile reading uses no weights.";
  return total === 100 ? null : `Weights add up to ${total}; they must add up to 100.`;
}

// ── Letter values ───────────────────────────────────────────────────────────

export interface LetterValueDefault {
  system: string;
  letter: string;
  value: number;
  validated: boolean;
  notes: string;
}

const PYTHAGOREAN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter, i) => [letter, (i % 9) + 1] as const);
const CHALDEAN: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4,
  N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7,
};

export const LETTER_SYSTEMS = ["awde_negest", "pythagorean", "chaldean"] as const;

export const LETTER_VALUE_DEFAULTS: LetterValueDefault[] = [
  ...Object.entries(GEEZ_LETTER_VALUES).map(([letter, value]) => ({
    system: "awde_negest",
    letter,
    value,
    validated: false,
    notes: "From the app's existing Ge'ez letter table; awaiting review by a debtera.",
  })),
  ...PYTHAGOREAN.map(([letter, value]) => ({ system: "pythagorean", letter, value, validated: true, notes: "Standard Pythagorean values." })),
  ...Object.entries(CHALDEAN).map(([letter, value]) => ({ system: "chaldean", letter, value, validated: true, notes: "Standard Chaldean values." })),
];

// ── Keyed entries ───────────────────────────────────────────────────────────

export const ENTRY_KINDS = ["awde_star", "awde_rule", "hexagram", "hexagram_pair", "template", "setting"] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

export interface EntryDefault {
  kind: EntryKind;
  entryKey: string;
  language: string;
  data: Record<string, unknown>;
  validated: boolean;
  notes: string;
}

export const DISCLAIMER: Localized = {
  en: "These readings are based on traditional and cultural systems and are offered for guidance and encouragement. Please use your own judgement for important decisions.",
  am: "እነዚህ ንባቦች በባሕላዊና በትውፊታዊ ሥርዓቶች ላይ የተመሠረቱ ሲሆኑ ለምክርና ለማበረታቻ የቀረቡ ናቸው። ለአስፈላጊ ውሳኔዎች የራስዎን ማስተዋል ይጠቀሙ።",
};

export const ENTRY_DEFAULTS: EntryDefault[] = [
  {
    kind: "awde_rule",
    entryKey: "star_from_name",
    language: "",
    data: {
      description: "Sum the letter values of the person's name and the mother's name, divide by the modulus and use the remainder as the star number.",
      names: ["person", "mother"],
      modulus: 12,
      remainderZeroIs: 12,
    },
    validated: false,
    notes: "Placeholder: confirm which names are counted, the modulus and what a remainder of 0 means.",
  },
  {
    kind: "awde_rule",
    entryKey: "star_from_date",
    language: "",
    data: {
      description: "How a candidate date is turned into a star (to be supplied by the tradition expert).",
      modulus: 12,
      remainderZeroIs: 12,
    },
    validated: false,
    notes: "Placeholder: the method for dates is not yet defined.",
  },
  ...AWDE_NEGEST_SIGNS.map((sign, index) => ({
    kind: "awde_star" as const,
    entryKey: sign.id,
    language: "",
    data: {
      number: index + 1,
      geezName: sign.geezName,
      englishName: sign.englishName,
      element: sign.element,
      luckyDays: [] as string[],
      unluckyDays: [] as string[],
      colour: "",
      direction: "",
      compatibleStars: sign.compatibleSigns ?? [],
    },
    validated: false,
    notes: "Placeholder: lucky and unlucky days, colour, direction and compatible stars to be filled in by a debtera.",
  })),
  { kind: "setting", entryKey: "default_window_days", language: "", data: { value: 90 }, validated: true, notes: "" },
  { kind: "setting", entryKey: "void_of_course_planets", language: "", data: { value: "modern" }, validated: true, notes: "modern (with Uranus, Neptune, Pluto) or traditional." },
  ...(["en", "am"] as const).map((language) => ({
    kind: "template" as const,
    entryKey: "disclaimer",
    language,
    data: { text: DISCLAIMER[language] ?? DISCLAIMER.en },
    validated: language === "en",
    notes: language === "en" ? "" : "Translation to be reviewed.",
  })),
];

// ── Calendar days ───────────────────────────────────────────────────────────

type DayDefault = Omit<CalendarDayRule, "active" | "validated" | "offsetDays" | "lengthDays" | "untilMonth" | "untilDay" | "calendar" | "month" | "day"> &
  Partial<Pick<CalendarDayRule, "offsetDays" | "lengthDays" | "untilMonth" | "untilDay" | "calendar" | "month" | "day" | "validated">>;

const CELEBRATIONS = ["wedding", "shop_opening"];
const FAST_EFFECTS: DayEffects = {
  score: -10,
  avoidFor: ["wedding"],
  note: { en: "A fasting day: celebrations with feasting are usually held after the fast.", am: "የጾም ቀን ነው፤ የድግስ ሥርዓቶች ብዙውን ጊዜ ከጾሙ በኋላ ይደረጋሉ።" },
};

const ORTHODOX: DayDefault[] = [
  ...Object.entries(MONTHLY_COMMEMORATIONS).map(([day, c]) => ({
    tradition: "orthodox" as const,
    entryKey: `monthly-${c.key}`,
    kind: "commemoration" as const,
    anchor: "monthly" as const,
    day: Number(day),
    names: { en: c.name, am: c.nameAm },
    effects: { score: c.major ? 8 : 3 },
    validated: false,
  })),
  { tradition: "orthodox", entryKey: "enkutatash", kind: "feast", anchor: "fixed", month: 1, day: 1, names: { en: "Enkutatash (New Year)", am: "እንቁጣጣሽ" }, effects: { score: 10, favourFor: CELEBRATIONS } },
  { tradition: "orthodox", entryKey: "meskel", kind: "feast", anchor: "fixed", month: 1, day: 17, names: { en: "Meskel (Finding of the True Cross)", am: "መስቀል" }, effects: { score: 10 } },
  // Genna is kept on 7 January, so it falls on 28 Tahsas in years that follow an Ethiopian leap year.
  { tradition: "orthodox", entryKey: "genna", kind: "feast", anchor: "fixed", calendar: "gregorian", month: 1, day: 7, names: { en: "Genna (Christmas)", am: "ገና (ልደት)" }, effects: { score: 10 } },
  { tradition: "orthodox", entryKey: "timket", kind: "feast", anchor: "fixed", month: 5, day: 11, names: { en: "Timket (Epiphany)", am: "ጥምቀት" }, effects: { score: 10 } },
  { tradition: "orthodox", entryKey: "qana", kind: "feast", anchor: "fixed", month: 5, day: 12, names: { en: "Qana ze Galila", am: "ቃና ዘገሊላ" }, effects: { score: 8, favourFor: ["wedding"] } },
  { tradition: "orthodox", entryKey: "buhe", kind: "feast", anchor: "fixed", month: 12, day: 13, names: { en: "Buhe (Transfiguration)", am: "ቡሄ (ደብረ ታቦር)" }, effects: { score: 5 } },
  { tradition: "orthodox", entryKey: "filseta-feast", kind: "feast", anchor: "fixed", month: 12, day: 16, names: { en: "Filseta (Assumption of Mary)", am: "ፍልሰታ" }, effects: { score: 8 } },
  { tradition: "orthodox", entryKey: "raphael", kind: "feast", anchor: "fixed", month: 13, day: 3, names: { en: "Archangel Raphael", am: "ቅዱስ ሩፋኤል" }, effects: { score: 5 } },
  { tradition: "orthodox", entryKey: "hosanna", kind: "feast", anchor: "orthodox_easter", offsetDays: -7, names: { en: "Hosanna (Palm Sunday)", am: "ሆሳዕና" }, effects: { score: 5 } },
  { tradition: "orthodox", entryKey: "siklet", kind: "fast", anchor: "orthodox_easter", offsetDays: -2, names: { en: "Siklet (Good Friday)", am: "ስቅለት" }, effects: { ...FAST_EFFECTS, score: -20, avoidFor: ["wedding", "shop_opening", "house_moving"] } },
  { tradition: "orthodox", entryKey: "fasika", kind: "feast", anchor: "orthodox_easter", offsetDays: 0, names: { en: "Fasika (Easter)", am: "ፋሲካ (ትንሣኤ)" }, effects: { score: 12 } },
  { tradition: "orthodox", entryKey: "erget", kind: "feast", anchor: "orthodox_easter", offsetDays: 39, names: { en: "Erget (Ascension)", am: "ዕርገት" }, effects: { score: 5 } },
  { tradition: "orthodox", entryKey: "peraklitos", kind: "feast", anchor: "orthodox_easter", offsetDays: 49, names: { en: "Peraklitos (Pentecost)", am: "ጰራቅሊጦስ" }, effects: { score: 5 } },
  { tradition: "orthodox", entryKey: "nineveh", kind: "fast", anchor: "orthodox_easter", offsetDays: -69, lengthDays: 3, names: { en: "Fast of Nineveh", am: "ጾመ ነነዌ" }, effects: FAST_EFFECTS },
  { tradition: "orthodox", entryKey: "abiy-tsom", kind: "fast", anchor: "orthodox_easter", offsetDays: -55, lengthDays: 55, names: { en: "Great Lent (Abiy Tsom)", am: "ዐቢይ ጾም" }, effects: { ...FAST_EFFECTS, score: -15 } },
  { tradition: "orthodox", entryKey: "apostles", kind: "fast", anchor: "orthodox_easter", offsetDays: 50, untilMonth: 11, untilDay: 4, names: { en: "Fast of the Apostles", am: "ጾመ ሐዋርያት" }, effects: FAST_EFFECTS },
  { tradition: "orthodox", entryKey: "filseta", kind: "fast", anchor: "fixed", month: 12, day: 1, lengthDays: 15, names: { en: "Filseta fast (Assumption)", am: "ጾመ ፍልሰታ" }, effects: FAST_EFFECTS },
  { tradition: "orthodox", entryKey: "nebiyat", kind: "fast", anchor: "fixed", month: 3, day: 15, untilMonth: 4, untilDay: 28, names: { en: "Fast of the Prophets (Advent)", am: "ጾመ ነቢያት" }, effects: { ...FAST_EFFECTS, exceptKeys: ["genna"] } },
  { tradition: "orthodox", entryKey: "gahad", kind: "fast", anchor: "fixed", month: 5, day: 10, names: { en: "Gahad (Eve of Timket)", am: "ጾመ ገሀድ" }, effects: FAST_EFFECTS },
  ...([3, 5] as const).map((weekday) => ({
    tradition: "orthodox" as const,
    entryKey: weekday === 3 ? "wednesday" : "friday",
    kind: "fast" as const,
    anchor: "weekly" as const,
    day: weekday,
    names: weekday === 3 ? { en: "Wednesday fast", am: "ጾመ ረቡዕ" } : { en: "Friday fast", am: "ጾመ ዓርብ" },
    effects: {
      ...FAST_EFFECTS,
      score: -5,
      exceptKeys: ["genna", "timket", "fasika"],
      exceptEasterRange: { anchor: "orthodox_easter" as const, from: 1, to: 49 },
    },
  })),
];

const MUSLIM: DayDefault[] = [
  { tradition: "muslim", entryKey: "friday", kind: "worship", anchor: "weekly", day: 5, names: { en: "Friday (Jumu'ah)", am: "ጁምዓ" }, effects: { score: 5, note: { en: "Friday congregational prayer at midday.", am: "የጁምዓ ሶላት እኩለ ቀን ላይ።" } } },
  { tradition: "muslim", entryKey: "ramadan", kind: "fast", anchor: "fixed", calendar: "hijri", month: 9, day: null, names: { en: "Ramadan", am: "ረመዳን" }, effects: { score: -10, avoidFor: ["wedding"], note: { en: "The month of fasting: weddings are usually held after Eid.", am: "የጾም ወር ነው፤ ሠርግ ብዙውን ጊዜ ከዒድ በኋላ ይደረጋል።" } } },
  { tradition: "muslim", entryKey: "eid-al-fitr", kind: "feast", anchor: "fixed", calendar: "hijri", month: 10, day: 1, names: { en: "Eid al-Fitr", am: "ዒድ አል ፈጥር" }, effects: { score: 10 } },
  { tradition: "muslim", entryKey: "arafah", kind: "worship", anchor: "fixed", calendar: "hijri", month: 12, day: 9, names: { en: "Day of Arafah", am: "የዓረፋ ቀን" }, effects: { score: 5 } },
  { tradition: "muslim", entryKey: "eid-al-adha", kind: "feast", anchor: "fixed", calendar: "hijri", month: 12, day: 10, names: { en: "Eid al-Adha", am: "ዒድ አል አድሐ" }, effects: { score: 10 } },
  { tradition: "muslim", entryKey: "mawlid", kind: "feast", anchor: "fixed", calendar: "hijri", month: 3, day: 12, names: { en: "Mawlid", am: "መውሊድ" }, effects: { score: 3 } },
  { tradition: "muslim", entryKey: "islamic-new-year", kind: "feast", anchor: "fixed", calendar: "hijri", month: 1, day: 1, names: { en: "Islamic New Year", am: "የሂጅራ አዲስ ዓመት" }, effects: { score: 3 } },
];

// Ethiopian Catholic (Ge'ez rite) and most Protestant churches keep the Ethiopian dates of Genna and Fasika.
const sunday = (tradition: "catholic" | "protestant"): DayDefault => ({
  tradition, entryKey: "sunday", kind: "worship", anchor: "weekly", day: 0, names: { en: "Sunday worship", am: "የእሑድ አምልኮ" },
  effects: { score: 0, note: { en: "Sunday worship: plan the event after the service.", am: "የእሑድ አምልኮ ቀን ነው፤ ዝግጅቱን ከአምልኮ በኋላ ያቅዱ።" } },
});
const CHRISTIAN_SHARED = (tradition: "catholic" | "protestant"): DayDefault[] => [
  sunday(tradition),
  { tradition, entryKey: "genna", kind: "feast", anchor: "fixed", calendar: "gregorian", month: 1, day: 7, names: { en: "Christmas (Genna)", am: "ገና" }, effects: { score: 10 } },
  { tradition, entryKey: "good-friday", kind: "worship", anchor: "orthodox_easter", offsetDays: -2, names: { en: "Good Friday", am: "ስቅለት" }, effects: { score: -10, avoidFor: CELEBRATIONS } },
  { tradition, entryKey: "easter", kind: "feast", anchor: "orthodox_easter", offsetDays: 0, names: { en: "Easter (Fasika)", am: "ፋሲካ" }, effects: { score: 10 } },
];
const CATHOLIC: DayDefault[] = [
  ...CHRISTIAN_SHARED("catholic"),
  { tradition: "catholic", entryKey: "lent", kind: "fast", anchor: "orthodox_easter", offsetDays: -55, lengthDays: 55, names: { en: "Lent", am: "ዐቢይ ጾም" }, effects: { score: -5, avoidFor: ["wedding"] } },
  { tradition: "catholic", entryKey: "timket", kind: "feast", anchor: "fixed", month: 5, day: 11, names: { en: "Epiphany (Timket)", am: "ጥምቀት" }, effects: { score: 8 } },
  { tradition: "catholic", entryKey: "meskel", kind: "feast", anchor: "fixed", month: 1, day: 17, names: { en: "Finding of the Cross (Meskel)", am: "መስቀል" }, effects: { score: 8 } },
  { tradition: "catholic", entryKey: "assumption", kind: "feast", anchor: "fixed", month: 12, day: 16, names: { en: "Assumption of Mary", am: "ፍልሰታ" }, effects: { score: 8 } },
];
const PROTESTANT: DayDefault[] = CHRISTIAN_SHARED("protestant");

const office = (en: string, am: string): Pick<DayDefault, "names" | "effects"> => ({ names: { en, am }, effects: { officesClosed: true } });
const PUBLIC: DayDefault[] = [
  { tradition: "public", entryKey: "enkutatash", kind: "holiday", anchor: "fixed", month: 1, day: 1, ...office("Ethiopian New Year", "እንቁጣጣሽ") },
  { tradition: "public", entryKey: "meskel", kind: "holiday", anchor: "fixed", month: 1, day: 17, ...office("Meskel", "መስቀል") },
  { tradition: "public", entryKey: "genna", kind: "holiday", anchor: "fixed", calendar: "gregorian", month: 1, day: 7, ...office("Ethiopian Christmas (Genna)", "ገና") },
  { tradition: "public", entryKey: "timket", kind: "holiday", anchor: "fixed", month: 5, day: 11, ...office("Timket (Epiphany)", "ጥምቀት") },
  { tradition: "public", entryKey: "adwa", kind: "holiday", anchor: "fixed", month: 6, day: 23, ...office("Adwa Victory Day", "የዓድዋ ድል በዓል") },
  { tradition: "public", entryKey: "siklet", kind: "holiday", anchor: "orthodox_easter", offsetDays: -2, ...office("Good Friday (Siklet)", "ስቅለት") },
  { tradition: "public", entryKey: "fasika", kind: "holiday", anchor: "orthodox_easter", offsetDays: 0, ...office("Easter (Fasika)", "ፋሲካ") },
  { tradition: "public", entryKey: "patriots", kind: "holiday", anchor: "fixed", month: 8, day: 27, ...office("Patriots' Victory Day", "የአርበኞች ድል በዓል") },
  { tradition: "public", entryKey: "labour-day", kind: "holiday", anchor: "fixed", calendar: "gregorian", month: 5, day: 1, ...office("International Labour Day", "የዓለም የሠራተኞች ቀን") },
  { tradition: "public", entryKey: "derg-downfall", kind: "holiday", anchor: "fixed", month: 9, day: 20, ...office("Downfall of the Derg", "ግንቦት 20") },
  { tradition: "public", entryKey: "eid-al-fitr", kind: "holiday", anchor: "fixed", calendar: "hijri", month: 10, day: 1, ...office("Eid al-Fitr", "ዒድ አል ፈጥር") },
  { tradition: "public", entryKey: "eid-al-adha", kind: "holiday", anchor: "fixed", calendar: "hijri", month: 12, day: 10, ...office("Eid al-Adha", "ዒድ አል አድሐ") },
  { tradition: "public", entryKey: "mawlid", kind: "holiday", anchor: "fixed", calendar: "hijri", month: 3, day: 12, ...office("Mawlid", "መውሊድ") },
];

export const CALENDAR_DAY_DEFAULTS: CalendarDayRule[] = [...ORTHODOX, ...MUSLIM, ...CATHOLIC, ...PROTESTANT, ...PUBLIC].map((row) => ({
  calendar: "ethiopian",
  month: null,
  day: null,
  offsetDays: 0,
  lengthDays: 1,
  untilMonth: null,
  untilDay: null,
  validated: false,
  ...row,
  active: true,
}));
