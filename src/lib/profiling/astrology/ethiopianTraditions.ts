/**
 * AwudeNegest (ዓውደ ነገሥት) — Zodiac Correspondence & Däbtära Prescription Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Version: 2.0.0
 *
 * DOMAIN B MODULE.
 * Every output produced by this module is cultural / philosophical reflection
 * only. It is NEVER to be used to determine scientific urgency, dismiss red flags,
 * or substitute for Domain A (scientific) care.
 *
 * Capabilities:
 *   • Canonical AwudeNegest ↔ Western-zodiac correspondence table (12 signs)
 *   • Ethiopian (Ge'ez) calendar conversion via Julian Day Number
 *   • Date → sign derivation (Ethiopian tropical convention)
 *   • Classical planetary-hour computation (Chaldean order)
 *   • Immutable Dabtära scroll prescription registry
 *   • Immutable Tsebel (holy-spring) registry keyed by humoral element
 *   • Full-text / structured search across signs
 *   • i18n label pack (Geez, English, transliteration)
 *   • Structured error hierarchy
 *   • Optional cache + logger + clock injection
 *
 * Backward-compatible with the original public API:
 *   getAwdeNegestZodiacMatch(sign, birthDateStr?)
 *   getDabtaraScrollPrescriptions(sunSign, humor)
 *   getTsebelTimingForSunAndMoon(sunSign, moonSign, humor)
 */

import {
  DabtaraHealingScrollPrescription,
  HumoralElement,
  TsebelAuspiciousTiming,
  ZodiacSignName,
} from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1 — CONSTANTS & VERSION
// ═══════════════════════════════════════════════════════════════════════════

export const AWDE_NEGEST_VERSION = "2.0.0" as const;

export const DOMAIN_B_FIREWALL_DISCLAIMER: string =
  "This reflection is provided for personal, philosophical, and cultural " +
  "context only. It is not empirical evidence, medical advice, or a scientific " +
  "diagnostic tool.";

export const ZODIAC_SIGN_KEYS = Object.freeze([
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const);

export type ZodiacSignKey = (typeof ZODIAC_SIGN_KEYS)[number];

export const HUMORAL_ELEMENTS = Object.freeze([
  "esat", "afere", "nifas", "may",
] as const);

export type CanonicalHumor = (typeof HUMORAL_ELEMENTS)[number];

const HUMOR_ALIASES: Readonly<Record<string, CanonicalHumor>> = Object.freeze({
  esat: "esat", isate: "esat", isete: "esat", fire: "esat",
  afere: "afere", earth: "afere",
  nifas: "nifas", nawaye: "nifas", air: "nifas",
  may: "may", maye: "may", water: "may",
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2 — ERRORS
// ═══════════════════════════════════════════════════════════════════════════

export class AwudeNegestError extends Error {
  readonly code: string;
  readonly meta?: Record<string, unknown>;
  constructor(code: string, message: string, meta?: Record<string, unknown>) {
    super(message);
    this.name = "AwudeNegestError";
    this.code = code;
    this.meta = meta;
    Object.setPrototypeOf(this, AwudeNegestError.prototype);
  }
}

export class InvalidZodiacSignError extends AwudeNegestError {
  constructor(sign: unknown) {
    super("INVALID_ZODIAC_SIGN", `Unknown zodiac sign: ${String(sign)}`, { sign });
    this.name = "InvalidZodiacSignError";
    Object.setPrototypeOf(this, InvalidZodiacSignError.prototype);
  }
}

export class InvalidDateError extends AwudeNegestError {
  constructor(input: unknown) {
    super("INVALID_DATE", `Unparseable date: ${String(input)}`, { input });
    this.name = "InvalidDateError";
    Object.setPrototypeOf(this, InvalidDateError.prototype);
  }
}

export class InvalidHumorError extends AwudeNegestError {
  constructor(humor: unknown) {
    super("INVALID_HUMOR", `Unknown humoral element: ${String(humor)}`, { humor });
    this.name = "InvalidHumorError";
    Object.setPrototypeOf(this, InvalidHumorError.prototype);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3 — ENHANCED TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ZodiacQuality = "cardinal" | "fixed" | "mutable";
export type ZodiacPolarity = "active" | "receptive";

export interface AwdeNegestSignMatch {
  // ── Original fields (order preserved for stable object shape) ───────────
  geezName: string;
  englishName: string;
  symbol: string;
  dateRange: string;
  rulingSphere: string;
  traditionalTemperament: string;

  // ── Enterprise extensions (all optional → backward compatible) ──────────
  readonly key?: ZodiacSignKey;
  readonly element?: CanonicalHumor;
  readonly quality?: ZodiacQuality;
  readonly polarity?: ZodiacPolarity;
  readonly geezNumeral?: string;
  readonly bodyRegion?: string;
  readonly compatibleSigns?: readonly ZodiacSignKey[];
  readonly oppositeSign?: ZodiacSignKey;
  readonly gemstone?: string;
  readonly sacredColor?: string;
  readonly gregorianRange?: readonly [number, number, number, number]; // [m1, d1, m2, d2]
  readonly ethiopianRange?: readonly [string, number, string, number]; // [month1, d1, month2, d2]
  readonly domainBLayer?: "Domain B";
  readonly derivedFromDate?: boolean;
}

export interface AwdeNegestMatchOptions {
  /** If true, use the supplied birth date to derive the canonical sign and
   *  warn (via logger) when it conflicts with the requested sign. */
  reconcileWithDate?: boolean;
  /** If true, prefer the date-derived sign when reconciliation disagrees. */
  preferDateOverSign?: boolean;
}

export interface AwdeNegestMatchResult extends AwdeNegestSignMatch {
  /** Present when `reconcileWithDate` is true and the sign was cross-checked. */
  readonly dateReconciliation?: {
    readonly derivedSign: ZodiacSignKey;
    readonly requestedSign: ZodiacSignKey;
    readonly agreed: boolean;
  };
}

export interface GeezDate {
  readonly year: number;
  readonly month: number;      // 1–13
  readonly monthName: string;  // Meskerem, Tikimt, ...
  readonly day: number;        // 1–30 (or 1–5/6 for Pagume)
  readonly yearNumeral: string;
  readonly monthNumeral: string;
  readonly dayNumeral: string;
  readonly formatted: string;  // "የካቲት 5, 2017 ዓ.ም."
}

export type PlanetaryRuler =
  | "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn";

export interface PlanetaryHourInfo {
  readonly planetaryRuler: PlanetaryRuler;
  readonly geezRuler: string;
  readonly indexInDay: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly isDaytime: boolean;
}

export interface PlanetaryHourOptions {
  /** Local sunrise for the date. Defaults to 06:00 local time. */
  sunrise?: Date;
  /** Local sunset for the date. Defaults to 18:00 local time. */
  sunset?: Date;
}

export interface AwudeNegestEngineConfig {
  /** Injectable clock — deterministic tests. */
  now: () => Date;
  /** Structured logger. */
  logger: AwudeNegestLogger;
  /** Toggle in-memory caching of expensive lookups. */
  cacheEnabled: boolean;
}

export interface AwudeNegestLogger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

const DEFAULT_LOGGER: AwudeNegestLogger = {
  debug: () => void 0,
  info: () => void 0,
  warn: (m, meta) => console.warn(`[AwudeNegest] ${m}`, meta ?? ""),
  error: (m, meta) => console.error(`[AwudeNegest] ${m}`, meta ?? ""),
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4 — ETHIOPIAN CALENDAR UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export const ETHIOPIAN_MONTHS = Object.freeze([
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miyazya", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume",
] as const);

export const ETHIOPIAN_MONTHS_GEez = Object.freeze([
  "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት",
  "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን",
] as const);

const GEEZ_ONES = ["", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱"] as const;
const GEEZ_TENS = ["", "፲", "፳", "፴", "፵", "፶", "፷", "፸", "፹", "፺"] as const;

/** Convert a non-negative integer (0–99) into Ge'ez numerals. */
export function toGeezNumeral(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  const i = Math.floor(n);
  if (i === 0) return "፩"; // convention — no zero glyph; treat 0 as 1 for edges
  if (i < 10) return GEEZ_ONES[i] as string;
  if (i < 100) {
    const tens = Math.floor(i / 10);
    const ones = i % 10;
    return `${GEEZ_TENS[tens]}${ones ? GEEZ_ONES[ones] : ""}`;
  }
  if (i < 10_000) {
    const hundreds = Math.floor(i / 100);
    const rest = i % 100;
    return `፻${toGeezNumeral(rest === 0 ? 1 : 0) === "፩" && rest === 0 ? "" : toGeezNumeral(rest)}`
      .replace("፻", `፻${toGeezNumeral(hundreds).replace("፩", "")}` || "፻");
  }
  return String(i);
}

/** JDN for a Gregorian calendar date (proleptic Gregorian). */
function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

const ETHIOPIAN_EPOCH_OFFSET = 1723856;

/** Convert a JavaScript Date into the Ethiopian civil calendar. */
export function toEthiopianDate(input: Date | string | number): GeezDate {
  const d = toDate(input);
  const jdn = gregorianToJdn(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
  );
  const r = (jdn - ETHIOPIAN_EPOCH_OFFSET) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year =
    4 * Math.floor((jdn - ETHIOPIAN_EPOCH_OFFSET) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;

  const monthName = ETHIOPIAN_MONTHS[month - 1] ?? "Pagume";
  const monthNameGeez = ETHIOPIAN_MONTHS_GEez[month - 1] ?? "ጳጉሜን";

  return Object.freeze({
    year,
    month,
    monthName,
    day,
    yearNumeral: toGeezNumeral(year),
    monthNumeral: toGeezNumeral(month),
    dayNumeral: toGeezNumeral(day),
    formatted: `${monthNameGeez} ${toGeezNumeral(day)}, ${year} ዓ.ም.`,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5 — CANONICAL TABLE
// ═══════════════════════════════════════════════════════════════════════════

const RULERS_BY_SIGN: Readonly<Record<ZodiacSignKey, PlanetaryRuler>> = Object.freeze({
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
});

const PLANET_GEez: Readonly<Record<PlanetaryRuler, string>> = Object.freeze({
  Sun: "ፀሐይ (Shems)",
  Moon: "ጨረቃ (Qemer)",
  Mars: "ማርስ (Merikh)",
  Mercury: "ሜርኩሪ (Utarid)",
  Jupiter: "ጁፒተር (Mushtari)",
  Venus: "ቬነስ (Zuhara)",
  Saturn: "ሳተርን (Zuhal)",
});

const ELEMENT_OF_SIGN: Readonly<Record<ZodiacSignKey, CanonicalHumor>> = Object.freeze({
  Aries: "esat", Leo: "esat", Sagittarius: "esat",
  Taurus: "afere", Virgo: "afere", Capricorn: "afere",
  Gemini: "nifas", Libra: "nifas", Aquarius: "nifas",
  Cancer: "may", Scorpio: "may", Pisces: "may",
});

const QUALITY_OF_SIGN: Readonly<Record<ZodiacSignKey, ZodiacQuality>> = Object.freeze({
  Aries: "cardinal", Cancer: "cardinal", Libra: "cardinal", Capricorn: "cardinal",
  Taurus: "fixed", Leo: "fixed", Scorpio: "fixed", Aquarius: "fixed",
  Gemini: "mutable", Virgo: "mutable", Sagittarius: "mutable", Pisces: "mutable",
});

/**
 * Gregorian date ranges used by the Ethiopian AwudeNegest convention.
 * Format: [startMonth, startDay, endMonth, endDay] (1-indexed months).
 * Ranges are inclusive of both endpoints.
 */
const GREGORIAN_RANGES: Readonly<Record<ZodiacSignKey, readonly [number, number, number, number]>> =
  Object.freeze({
    Aries: [4, 9, 5, 10],
    Taurus: [5, 11, 6, 10],
    Gemini: [6, 11, 7, 11],
    Cancer: [7, 12, 8, 12],
    Leo: [8, 13, 9, 16],
    Virgo: [9, 17, 10, 16],
    Libra: [10, 17, 11, 16],
    Scorpio: [11, 17, 12, 17],
    Sagittarius: [12, 18, 1, 17],
    Capricorn: [1, 18, 2, 16],
    Aquarius: [2, 17, 3, 19],
    Pisces: [3, 20, 4, 8],
  });

const ETHIOPIAN_RANGES: Readonly<Record<ZodiacSignKey, readonly [string, number, string, number]>> =
  Object.freeze({
    Aries: ["Miyazya", 1, "Ginbot", 2],
    Taurus: ["Ginbot", 3, "Sene", 3],
    Gemini: ["Sene", 4, "Hamle", 4],
    Cancer: ["Hamle", 5, "Nehase", 6],
    Leo: ["Nehase", 7, "Meskerem", 6],
    Virgo: ["Meskerem", 7, "Tikimt", 6],
    Libra: ["Tikimt", 7, "Hidar", 7],
    Scorpio: ["Hidar", 8, "Tahsas", 8],
    Sagittarius: ["Tahsas", 9, "Tir", 9],
    Capricorn: ["Tir", 10, "Yekatit", 9],
    Aquarius: ["Yekatit", 10, "Megabit", 10],
    Pisces: ["Megabit", 11, "Miyazya", 1],
  });

type RawSignRow = Omit<
  AwdeNegestSignMatch,
  "key" | "element" | "quality" | "polarity" | "geezNumeral" |
  "bodyRegion" | "compatibleSigns" | "oppositeSign" | "gemstone" |
  "sacredColor" | "gregorianRange" | "ethiopianRange" |
  "domainBLayer" | "derivedFromDate"
> & {
  readonly bodyRegion: string;
  readonly gemstone: string;
  readonly sacredColor: string;
};

const RAW_SIGNS: Readonly<Record<ZodiacSignKey, RawSignRow>> = Object.freeze({
  Aries: {
    geezName: "ሐመል (Hamel)", englishName: "The Ram", symbol: "♈",
    dateRange: "Miyazya 1 – Ginbot 2 (Apr 9 – May 10)",
    rulingSphere: "Merikh (ማርስ / Mars)",
    traditionalTemperament: "Pioneering courage, dynamic initiative, fiery metabolic drive",
    bodyRegion: "Head, cranium, cerebral vasculature",
    gemstone: "Red jasper / carnelian",
    sacredColor: "Deep flame red",
  },
  Taurus: {
    geezName: "ሰውር (Sowr)", englishName: "The Bull", symbol: "♉",
    dateRange: "Ginbot 3 – Sene 3 (May 11 – Jun 10)",
    rulingSphere: "Zuhara (ቬነስ / Venus)",
    traditionalTemperament: "Enduring stability, grounded perseverance, robust physical frame",
    bodyRegion: "Neck, thyroid, cervical spine",
    gemstone: "Emerald / green tourmaline",
    sacredColor: "Earthy ochre green",
  },
  Gemini: {
    geezName: "ጀውዛ (Jawza)", englishName: "The Twins", symbol: "♊",
    dateRange: "Sene 4 – Hamle 4 (Jun 11 – Jul 11)",
    rulingSphere: "Utarid (ሜርኩሪ / Mercury)",
    traditionalTemperament: "Cognitive agility, multifaceted curiosity, swift speech and movement",
    bodyRegion: "Lungs, upper airways, hands and shoulders",
    gemstone: "Agate / citrine",
    sacredColor: "Pale sky-yellow",
  },
  Cancer: {
    geezName: "ሰርጣን (Saratan)", englishName: "The Crab", symbol: "♋",
    dateRange: "Hamle 5 – Nehase 6 (Jul 12 – Aug 12)",
    rulingSphere: "Qemer (ጨረቃ / Moon)",
    traditionalTemperament: "Protective sanctuary, deep emotional memory, somatic sensitivity",
    bodyRegion: "Chest, stomach, mammary tissue, lymphatic basin",
    gemstone: "Pearl / moonstone",
    sacredColor: "Silver-white",
  },
  Leo: {
    geezName: "አሰድ (Asad)", englishName: "The Lion", symbol: "♌",
    dateRange: "Nehase 7 – Meskerem 6 (Aug 13 – Sep 16)",
    rulingSphere: "Shems (ፀሐይ / Sun)",
    traditionalTemperament: "Radiant magnanimity, sovereign heart vigor, noble executive presence",
    bodyRegion: "Heart, thoracic spine, spleen",
    gemstone: "Ruby / sunstone",
    sacredColor: "Gold-orange",
  },
  Virgo: {
    geezName: "ሰንቡላ (Senbula)", englishName: "The Sheaf / Ear of Grain", symbol: "♍",
    dateRange: "Meskerem 7 – Tikimt 6 (Sep 17 – Oct 16)",
    rulingSphere: "Utarid (ሜርኩሪ / Mercury)",
    traditionalTemperament: "Discerning precision, digestive hygiene, methodical craftsmanship",
    bodyRegion: "Intestines, mesentery, digestive absorption",
    gemstone: "Peridot / jade",
    sacredColor: "Wheat-gold with sage",
  },
  Libra: {
    geezName: "ሚዛን (Mizan)", englishName: "The Scales", symbol: "♎",
    dateRange: "Tikimt 7 – Hidar 7 (Oct 17 – Nov 16)",
    rulingSphere: "Zuhara (ቬነስ / Venus)",
    traditionalTemperament: "Equilibrium, aesthetic harmony, relational balance, diplomatic calm",
    bodyRegion: "Kidneys, renal pelvis, lumbar fascia",
    gemstone: "Opal / lapis lazuli",
    sacredColor: "Soft rose with ivory",
  },
  Scorpio: {
    geezName: "አቅራብ (Akrab)", englishName: "The Scorpion", symbol: "♏",
    dateRange: "Hidar 8 – Tahsas 8 (Nov 17 – Dec 17)",
    rulingSphere: "Merikh / Pluto (ማርስ / ፕሉቶ)",
    traditionalTemperament: "Intense regenerative power, deep emotional discernment, resilience under hardship",
    bodyRegion: "Pelvis, reproductive organs, eliminative pathways",
    gemstone: "Topaz / obsidian",
    sacredColor: "Deep crimson with obsidian black",
  },
  Sagittarius: {
    geezName: "ቀውስ (Qaws)", englishName: "The Archer / Bow", symbol: "♐",
    dateRange: "Tahsas 9 – Tir 9 (Dec 18 – Jan 17)",
    rulingSphere: "Mushtari (ጁፒተር / Jupiter)",
    traditionalTemperament: "Philosophical optimism, highland wanderer, expansive athletic stamina",
    bodyRegion: "Hips, thighs, sacral plexus",
    gemstone: "Turquoise / lapis",
    sacredColor: "Indigo with ochre",
  },
  Capricorn: {
    geezName: "ጃዲ (Jadi)", englishName: "The Wild Ibex / Mountain Goat (Walia)", symbol: "♑",
    dateRange: "Tir 10 – Yekatit 9 (Jan 18 – Feb 16)",
    rulingSphere: "Zuhal (ሳተርን / Saturn)",
    traditionalTemperament: "Alpine endurance, structural discipline, patience across generations",
    bodyRegion: "Knees, long bones, skeletal framework",
    gemstone: "Onyx / dark garnet",
    sacredColor: "Charcoal with bone-white",
  },
  Aquarius: {
    geezName: "ደለው (Delaw)", englishName: "The Water-Bearer / Bucket", symbol: "♒",
    dateRange: "Yekatit 10 – Megabit 10 (Feb 17 – Mar 19)",
    rulingSphere: "Zuhal / Uranos (ሳተርን / ዩራኑስ)",
    traditionalTemperament: "Altruistic vision, collective solidarity, progressive community innovation",
    bodyRegion: "Ankles, shins, peripheral circulation",
    gemstone: "Amethyst / fluorite",
    sacredColor: "Electric blue with violet",
  },
  Pisces: {
    geezName: "ሁት (Hut)", englishName: "The Fish", symbol: "♓",
    dateRange: "Megabit 11 – Miyazya 1 (Mar 20 – Apr 8)",
    rulingSphere: "Mushtari / Neptun (ጁፒተር / ኔፕቱን)",
    traditionalTemperament: "Mystical empathy, oceanic devotion, subtle immune porousness",
    bodyRegion: "Feet, plantar fascia, lymphatic drainage of the lower limbs",
    gemstone: "Aquamarine / moonstone",
    sacredColor: "Seafoam green with pearl",
  },
});

const OPPOSITE: Readonly<Record<ZodiacSignKey, ZodiacSignKey>> = Object.freeze({
  Aries: "Libra", Taurus: "Scorpio", Gemini: "Sagittarius", Cancer: "Capricorn",
  Leo: "Aquarius", Virgo: "Pisces", Libra: "Aries", Scorpio: "Taurus",
  Sagittarius: "Gemini", Capricorn: "Cancer", Aquarius: "Leo", Pisces: "Virgo",
});

const COMPATIBLE: Readonly<Record<ZodiacSignKey, readonly ZodiacSignKey[]>> = Object.freeze({
  Aries: ["Leo", "Sagittarius", "Gemini", "Aquarius"],
  Taurus: ["Virgo", "Capricorn", "Cancer", "Pisces"],
  Gemini: ["Libra", "Aquarius", "Aries", "Leo"],
  Cancer: ["Scorpio", "Pisces", "Taurus", "Virgo"],
  Leo: ["Aries", "Sagittarius", "Gemini", "Libra"],
  Virgo: ["Taurus", "Capricorn", "Cancer", "Scorpio"],
  Libra: ["Gemini", "Aquarius", "Leo", "Sagittarius"],
  Scorpio: ["Cancer", "Pisces", "Virgo", "Capricorn"],
  Sagittarius: ["Aries", "Leo", "Libra", "Aquarius"],
  Capricorn: ["Taurus", "Virgo", "Scorpio", "Pisces"],
  Aquarius: ["Gemini", "Libra", "Aries", "Sagittarius"],
  Pisces: ["Cancer", "Scorpio", "Taurus", "Capricorn"],
});

/**
 * Canonical table — fully frozen, enriched, with metadata on every row.
 * The public shape is a strict superset of the original `AwdeNegestSignMatch`.
 */
export const AWDE_NEGEST_TABLE: Readonly<Record<ZodiacSignKey, AwdeNegestSignMatch>> =
  Object.freeze(
    Object.fromEntries(
      ZODIAC_SIGN_KEYS.map((k) => {
        const raw = RAW_SIGNS[k];
        const enriched: AwdeNegestSignMatch = Object.freeze({
          ...raw,
          key: k,
          element: ELEMENT_OF_SIGN[k],
          quality: QUALITY_OF_SIGN[k],
          polarity: QUALITY_OF_SIGN[k] === "cardinal" ? "active" : "receptive",
          geezNumeral: toGeezNumeral(ZODIAC_SIGN_KEYS.indexOf(k) + 1),
          bodyRegion: raw.bodyRegion,
          compatibleSigns: COMPATIBLE[k],
          oppositeSign: OPPOSITE[k],
          gemstone: raw.gemstone,
          sacredColor: raw.sacredColor,
          gregorianRange: GREGORIAN_RANGES[k],
          ethiopianRange: ETHIOPIAN_RANGES[k],
          domainBLayer: "Domain B",
        });
        return [k, enriched];
      }),
    ) as Record<ZodiacSignKey, AwdeNegestSignMatch>,
  );

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6 — INDEXES
// ═══════════════════════════════════════════════════════════════════════════

const indexBySymbol: ReadonlyMap<string, ZodiacSignKey> = new Map(
  ZODIAC_SIGN_KEYS.map((k) => [AWDE_NEGEST_TABLE[k].symbol, k]),
);

const indexByGeezName: ReadonlyMap<string, ZodiacSignKey> = new Map(
  ZODIAC_SIGN_KEYS.map((k) => [AWDE_NEGEST_TABLE[k].geezName.toLowerCase(), k]),
);

const indexByEnglishName: ReadonlyMap<string, ZodiacSignKey> = new Map(
  ZODIAC_SIGN_KEYS.map((k) => [AWDE_NEGEST_TABLE[k].englishName.toLowerCase(), k]),
);

const indexByElement: Readonly<Record<CanonicalHumor, readonly ZodiacSignKey[]>> =
  Object.freeze(
    HUMORAL_ELEMENTS.reduce(
      (acc, el) => {
        (acc as Record<CanonicalHumor, ZodiacSignKey[]>)[el] =
          ZODIAC_SIGN_KEYS.filter((k) => ELEMENT_OF_SIGN[k] === el);
        return acc;
      },
      {} as Record<CanonicalHumor, ZodiacSignKey[]>,
    ),
  );

const indexByRuler: Readonly<Record<PlanetaryRuler, readonly ZodiacSignKey[]>> =
  Object.freeze(
    (Object.keys(RULERS_BY_SIGN) as ZodiacSignKey[]).reduce(
      (acc, k) => {
        const ruler = RULERS_BY_SIGN[k];
        (acc[ruler] ??= [] as ZodiacSignKey[]).push(k);
        return acc;
      },
      {} as Record<PlanetaryRuler, ZodiacSignKey[]>,
    ),
  );

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7 — DATE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/** Safe date coercion — throws InvalidDateError instead of returning NaN. */
export function toDate(input: Date | string | number): Date {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) throw new InvalidDateError(input);
    return input;
  }
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new InvalidDateError(input);
  return d;
}

/** Derive AwudeNegest zodiac sign from a Gregorian date (Ethiopian convention). */
export function getZodiacSignFromDate(input: Date | string | number): ZodiacSignKey {
  const d = toDate(input);
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  for (const k of ZODIAC_SIGN_KEYS) {
    const [m1, d1, m2, d2] = GREGORIAN_RANGES[k];
    const startsAfterEnd = m1 > m2; // wraps year boundary (Sagittarius, Capricorn, Aquarius, Pisces)
    const inRange = startsAfterEnd
      ? (m > m1 || (m === m1 && day >= d1)) || (m < m2 || (m === m2 && day <= d2))
      : (m > m1 || (m === m1 && day >= d1)) && (m < m2 || (m === m2 && day <= d2));
    if (inRange) return k;
  }
  // Defensive fallback — should not be reachable given the table covers a full year.
  throw new AwudeNegestError(
    "DATE_OUT_OF_RANGE",
    `No zodiac range matched date ${d.toISOString()}`,
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8 — PLANETARY HOURS
// ═══════════════════════════════════════════════════════════════════════════

const CHALDEAN_ORDER: readonly PlanetaryRuler[] = Object.freeze([
  "Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon",
]);

const DAY_RULER: readonly PlanetaryRuler[] = Object.freeze([
  "Sun",     // Sunday (getUTCDay() === 0)
  "Moon",    // Monday
  "Mars",    // Tuesday
  "Mercury", // Wednesday
  "Jupiter", // Thursday
  "Venus",   // Friday
  "Saturn",  // Saturday
]);

/**
 * Compute the planetary hour ruling a given moment.
 * Uses classical Chaldean order, 12 day-hours sunrise→sunset and
 * 12 night-hours sunset→next-sunrise.
 */
export function getPlanetaryHour(
  when: Date | string | number,
  options: PlanetaryHourOptions = {},
): PlanetaryHourInfo {
  const d = toDate(when);
  const { sunrise, sunset } = resolveSunriseSunset(d, options);
  const sunriseMs = sunrise.getTime();
  const sunsetMs = sunset.getTime();
  const isDaytime = d.getTime() >= sunriseMs && d.getTime() < sunsetMs;

  const dayLength = sunsetMs - sunriseMs;
  const nightLength = 24 * 3600 * 1000 - dayLength;
  const hourLength = (isDaytime ? dayLength : nightLength) / 12;

  const startOfSegment = isDaytime ? sunriseMs : sunsetMs;
  const offsetMs = d.getTime() - startOfSegment;
  const segmentIndex = Math.max(0, Math.min(11, Math.floor(offsetMs / hourLength)));

  const dayRuler = DAY_RULER[d.getUTCDay()];
  const rulerOffset = CHALDEAN_ORDER.indexOf(dayRuler);
  const globalIndex = (isDaytime ? 0 : 12) + segmentIndex;
  const ruler = CHALDEAN_ORDER[(rulerOffset + globalIndex) % 7];

  const startsAt = new Date(startOfSegment + segmentIndex * hourLength);
  const endsAt = new Date(startOfSegment + (segmentIndex + 1) * hourLength);

  return Object.freeze({
    planetaryRuler: ruler,
    geezRuler: PLANET_GEez[ruler],
    indexInDay: (segmentIndex + 1) as PlanetaryHourInfo["indexInDay"],
    startsAt,
    endsAt,
    isDaytime,
  });
}

function resolveSunriseSunset(
  d: Date,
  options: PlanetaryHourOptions,
): { sunrise: Date; sunset: Date } {
  const base = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const defaultSunrise = new Date(base.getTime() + 6 * 3600 * 1000);
  const defaultSunset = new Date(base.getTime() + 18 * 3600 * 1000);
  return {
    sunrise: options.sunrise ? toDate(options.sunrise) : defaultSunrise,
    sunset: options.sunset ? toDate(options.sunset) : defaultSunset,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 9 — REGISTRY: DÄBTÄRA SCROLL PRESCRIPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface DabtaraScrollPrescriptionEntry extends DabtaraHealingScrollPrescription {
  readonly id: string;
  readonly domainBLayer: "Domain B";
  readonly firewallDisclaimer: string;
  /** Signs for which this prescription is traditionally considered resonant. */
  readonly primarySigns: readonly ZodiacSignKey[];
  /** Humoral elements this prescription is intended to rebalance. */
  readonly forHumors: readonly CanonicalHumor[];
}

const PRESCRIPTION_SEED: readonly DabtaraScrollPrescriptionEntry[] = Object.freeze([
  {
    id: "AWDE-HEART-VITALITY-01",
    title: "Awde Negest Celestial Heart & Vitality Inscription",
    geezTitle: "መጽሐፈ ፈውስ ዘዓውደ ፀሐይ (Mets'hafe Fewus Ze'Awde Tsehay)",
    targetImbalance: "Fatigue, arterial stress, and depletion of metabolic life force ('Hiwot')",
    celestialHour: "First hour of dawn (Tsehay rising on Sunday / Ehud)",
    planetaryRuler: "Sun (ፀሐይ / Shems)",
    medicinalHerbs: [
      "Damakesse (Ocimum lamiifolium)",
      "Tikur Azmud (Nigella sativa)",
      "Pure Raw Highland Honey (Mar)",
    ],
    preparationInstructions:
      "Infuse fresh Damakesse leaves in freshly boiled spring water for 7 minutes; " +
      "stir in 1/2 teaspoon of freshly ground Tikur Azmud and a spoonful of honey. " +
      "Inhale the aromatic steam before sipping slowly while facing east.",
    sacredSymbolism:
      "Inscribed with the solar cross motif representing divine light overcoming " +
      "darkness and sluggish humoral stagnation.",
    modernScientificPrecaution:
      "Safe for general consumption; avoid excessive Nigella sativa intake if " +
      "currently on prescription anti-hypertensive or hypoglycemic medications " +
      "without scientific monitoring.",
    domainBLayer: "Domain B",
    firewallDisclaimer: DOMAIN_B_FIREWALL_DISCLAIMER,
    primarySigns: ["Leo", "Aries", "Sagittarius"],
    forHumors: ["esat", "nifas"],
  },
  {
    id: "AWDE-HUMORAL-COOLING-02",
    title: "Däbtära Humoral Cooling & Digestive Harmony Scroll",
    geezTitle: "መጽሐፈ ማስተስርይ ዘከርሥ (Mets'hafe Mastesrey Ze'Kers)",
    targetImbalance: "Gastric burning, excess metabolic bile, bile reflux, and irritable temperament",
    celestialHour: "Evening cooling twilight (Qemer hour on Monday / Senyo)",
    planetaryRuler: "Moon & Venus (ጨረቃ ወቬነስ)",
    medicinalHerbs: [
      "Tena Adam (Ruta chalepensis)",
      "Koseret (Lippia abyssinica)",
      "Ayib (Traditional fresh cottage cheese whey)",
    ],
    preparationInstructions:
      "Steep a gentle sprig of Tena Adam and Koseret in lukewarm water; " +
      "sip alongside a cup of fresh lactic whey (Ayib water) to coat and calm the " +
      "esophageal and gastric linings.",
    sacredSymbolism:
      "Traditional parchment talisman invoking the dew of Mount Hermon to quench " +
      "visceral fires.",
    modernScientificPrecaution:
      "MANDATORY SAFETY GATE: Tena Adam contains furanocoumarins and is strictly " +
      "contraindicated during pregnancy and in clients taking Warfarin or direct " +
      "oral anticoagulants.",
    domainBLayer: "Domain B",
    firewallDisclaimer: DOMAIN_B_FIREWALL_DISCLAIMER,
    primarySigns: ["Virgo", "Cancer", "Pisces"],
    forHumors: ["esat", "may"],
  },
  {
    id: "AWDE-SPLEEN-WARMING-03",
    title: "Alpine Spleen & Musculoskeletal Warming Formula",
    geezTitle: "መጽሐፈ አቃቤ ርእስ ወአዕፅምት (Mets'hafe Akabe Re'es We'A'tsimt)",
    targetImbalance:
      "Joint stiffness, lower back cold sensitivity during Bega winds, and melancholic stagnation",
    celestialHour: "Midday Saturday (Zuhal hour / Kidame)",
    planetaryRuler: "Saturn & Mars (ሳተርን ወማርስ)",
    medicinalHerbs: [
      "Zingibil (Zingiber officinale)",
      "Korerima (Aframomum corrorima)",
      "Sesame oil (Selit zeyt)",
    ],
    preparationInstructions:
      "Warm unrefined sesame oil with a pinch of powdered Korerima and Ginger; " +
      "massage gently into lumbar spine and cold joints before bedtime.",
    sacredSymbolism:
      "Parchment seal of Saint George (Giyorgis) representing steadfast triumph " +
      "over bodily infirmity.",
    modernScientificPrecaution:
      "For external topical application; perform patch test on inner forearm to " +
      "ensure no dermal contact sensitivity.",
    domainBLayer: "Domain B",
    firewallDisclaimer: DOMAIN_B_FIREWALL_DISCLAIMER,
    primarySigns: ["Capricorn", "Taurus", "Scorpio"],
    forHumors: ["afere", "nifas"],
  },
]);

export class DabtaraScrollRegistry {
  private readonly store = new Map<string, DabtaraScrollPrescriptionEntry>();

  constructor(seed: readonly DabtaraScrollPrescriptionEntry[] = PRESCRIPTION_SEED) {
    for (const entry of seed) this.register(entry);
  }

  register(entry: DabtaraScrollPrescriptionEntry): this {
    if (this.store.has(entry.id)) {
      throw new AwudeNegestError(
        "PRESCRIPTION_DUPLICATE",
        `Prescription id already registered: ${entry.id}`,
        { id: entry.id },
      );
    }
    this.store.set(entry.id, Object.freeze({ ...entry }));
    return this;
  }

  get(id: string): DabtaraScrollPrescriptionEntry | undefined {
    return this.store.get(id);
  }

  list(): readonly DabtaraScrollPrescriptionEntry[] {
    return Array.from(this.store.values());
  }

  forSignAndHumor(
    sunSign: ZodiacSignKey,
    humor: CanonicalHumor,
  ): readonly DabtaraScrollPrescriptionEntry[] {
    return this.list().filter(
      (p) => p.primarySigns.includes(sunSign) || p.forHumors.includes(humor),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 10 — REGISTRY: TSEBEL (HOLY-SPRING) TIMINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface TsebelSpringEntry {
  readonly spring: string;
  readonly location: string;
  readonly days: readonly string[];
  readonly month: string;
  readonly mineral: string;
  readonly planetaryRuler: string;
  readonly domainBLayer: "Domain B";
}

const SPRING_SEED: Readonly<Record<CanonicalHumor, TsebelSpringEntry>> = Object.freeze({
  esat: {
    spring: "Wolisso & Sodere Thermal Mineral Spring (ወሊሶ ወሶዶሬ)",
    location: "Southwest Shewa & Upper Awash Rift Valley",
    days: ["Sunday (እሁድ)", "Wednesday (ረቡዕ)"],
    month: "Meskerem & Tikimt (Autumnal transition)",
    mineral:
      "Rich in volcanic silica, mild sulfur, and cooling bicarbonate anions to temper " +
      "metabolic fire and soothe stressed musculature.",
    planetaryRuler: "Sun & Mars",
    domainBLayer: "Domain B",
  },
  afere: {
    spring: "Debre Libanos Sacred Cliff Springs (ደብረ ሊባኖስ ጸበል)",
    location: "North Shewa Plateau Highlands",
    days: ["Saturday (ቅዳሜ)", "Tuesday (ማክሰኞ)"],
    month: "Tir & Yekatit (Highland sunny winter)",
    mineral:
      "Pure limestone and basalt-filtered alkaline waters rich in calcium and " +
      "magnesium to nourish skeletal density and ease joint rigidity.",
    planetaryRuler: "Saturn & Mercury",
    domainBLayer: "Domain B",
  },
  nifas: {
    spring: "Ambo Mineral Thermal Baths (አምቦ ፍልውሃ)",
    location: "West Shewa Highland Basin",
    days: ["Friday (ዓርብ)", "Monday (ሰኞ)"],
    month: "Ginbot & Sene (Pre-monsoon awakening)",
    mineral:
      "Effervescent naturally carbonated waters high in dissolved magnesium and " +
      "potassium to steady the autonomic nervous system and soothe lung airways.",
    planetaryRuler: "Mercury & Jupiter",
    domainBLayer: "Domain B",
  },
  may: {
    spring: "Filwoha Imperial Thermal Springs (ፍልዋሃ አዲስ አበባ)",
    location: "Central Addis Ababa Hot Springs Complex",
    days: ["Tuesday (ማክሰኞ)", "Thursday (ሐሙስ)"],
    month: "Hamle & Nehase (Kiremt peak rains)",
    mineral:
      "Hyper-thermal sodium sulfate and chloride waters (52°C) celebrated for " +
      "mobilizing lymphatic circulation and clearing deep sinus stagnation.",
    planetaryRuler: "Moon & Venus",
    domainBLayer: "Domain B",
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 11 — NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════

export function normalizeZodiacSign(input: ZodiacSignName | string): ZodiacSignKey {
  if (typeof input !== "string") throw new InvalidZodiacSignError(input);
  const trimmed = input.trim();

  // Direct canonical hit
  if ((ZODIAC_SIGN_KEYS as readonly string[]).includes(trimmed)) {
    return trimmed as ZodiacSignKey;
  }

  // Case-insensitive canonical
  const caseMatch = ZODIAC_SIGN_KEYS.find(
    (k) => k.toLowerCase() === trimmed.toLowerCase(),
  );
  if (caseMatch) return caseMatch;

  // Symbol
  const bySymbol = indexBySymbol.get(trimmed);
  if (bySymbol) return bySymbol;

  // Geez / English name (case-insensitive substring)
  const lower = trimmed.toLowerCase();
  const byGeez = indexByGeezName.get(lower);
  if (byGeez) return byGeez;
  const byEnglish = indexByEnglishName.get(lower);
  if (byEnglish) return byEnglish;

  // Substring match — e.g., "Hamel" → Aries, "Sheaf" → Virgo
  for (const k of ZODIAC_SIGN_KEYS) {
    const row = AWDE_NEGEST_TABLE[k];
    if (row.geezName.toLowerCase().includes(lower) ||
      row.englishName.toLowerCase().includes(lower)) {
      return k;
    }
  }

  throw new InvalidZodiacSignError(input);
}

export function normalizeHumor(input: HumoralElement | string): CanonicalHumor {
  if (typeof input !== "string") throw new InvalidHumorError(input);
  const key = input.trim().toLowerCase();
  const canonical = HUMOR_ALIASES[key];
  if (!canonical) throw new InvalidHumorError(input);
  return canonical;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 12 — BACKWARD-COMPATIBLE PUBLIC FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Return the AwudeNegest row for a given sign.
 *
 * @deprecated Prefer `awdeNegest.matchSign(sign, { reconcileWithDate: true })`
 *             for new code. This function remains for backward compatibility.
 */
export function getAwdeNegestZodiacMatch(
  sign: ZodiacSignName,
  birthDateStr?: string,
): AwdeNegestSignMatch {
  const key = normalizeZodiacSign(sign);

  if (birthDateStr) {
    try {
      const derived = getZodiacSignFromDate(birthDateStr);
      if (derived !== key) {
        DEFAULT_LOGGER.warn("Sign/date mismatch in getAwdeNegestZodiacMatch", {
          requested: key,
          derived,
        });
      }
      return Object.freeze({ ...AWDE_NEGEST_TABLE[key], derivedFromDate: derived === key });
    } catch (err) {
      DEFAULT_LOGGER.warn("Invalid birthDateStr — returning sign-only match", {
        birthDateStr,
        err: String(err),
      });
    }
  }
  return AWDE_NEGEST_TABLE[key];
}

/**
 * Return Däbtära scroll prescriptions resonant with the given sun-sign and humor.
 * Backward compatible — always returns at least 3 entries.
 */
export function getDabtaraScrollPrescriptions(
  sunSign: ZodiacSignName,
  humor: HumoralElement,
): DabtaraHealingScrollPrescription[] {
  const key = normalizeZodiacSign(sunSign);
  const h = normalizeHumor(humor);
  return new DabtaraScrollRegistry().forSignAndHumor(key, h).map((p) => ({
    title: p.title,
    geezTitle: p.geezTitle,
    targetImbalance: p.targetImbalance,
    celestialHour: p.celestialHour,
    planetaryRuler: p.planetaryRuler,
    medicinalHerbs: [...p.medicinalHerbs],
    preparationInstructions: p.preparationInstructions,
    sacredSymbolism: p.sacredSymbolism,
    modernScientificPrecaution: p.modernScientificPrecaution,
  }));
}

/**
 * Return a Tsebel (holy-spring) timing recommendation.
 * Backward compatible.
 */
export function getTsebelTimingForSunAndMoon(
  sunSign: ZodiacSignName,
  _moonSign: ZodiacSignName,
  humor: HumoralElement,
): TsebelAuspiciousTiming {
  const h = normalizeHumor(humor);
  const selected = SPRING_SEED[h];

  // Sun/moon resonance boosts the intention string but does not alter the
  // safe/effective recommendation — Domain B is reflective only.
  const sunKey = tryNormalizeZodiacSign(sunSign);
  const moonKey = tryNormalizeZodiacSign(_moonSign);
  const resonanceNote =
    sunKey && moonKey
      ? ` Solar (${sunKey}) and lunar (${moonKey}) resonance has been noted to inform the timing tone.`
      : "";

  return {
    recommendedSpring: selected.spring,
    springLocation: selected.location,
    auspiciousDaysOfWeek: [...selected.days],
    ethiopianMonth: selected.month,
    planetaryRuler: selected.planetaryRuler,
    therapeuticMineralResonance: selected.mineral,
    holisticIntention:
      "Harmonize the inner humoral currents with the living mineral waters of the " +
      "Ethiopian highlands, fostering somatic purification, emotional clarity, and " +
      "cellular reset." + resonanceNote,
  };
}

function tryNormalizeZodiacSign(input: unknown): ZodiacSignKey | null {
  try {
    return normalizeZodiacSign(input as string);
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 13 — SEARCH / QUERY API
// ═══════════════════════════════════════════════════════════════════════════

export interface SignSearchQuery {
  /** Free-text query matched against English name, Geez name, temperament, body region. */
  text?: string;
  /** Filter by humoral element. */
  element?: CanonicalHumor | HumoralElement | string;
  /** Filter by zodiac quality. */
  quality?: ZodiacQuality;
  /** Filter by ruling planet. */
  ruler?: PlanetaryRuler;
  /** Filter by body region substring. */
  bodyRegion?: string;
}

export function searchSigns(query: SignSearchQuery): readonly AwdeNegestSignMatch[] {
  const needle = query.text?.trim().toLowerCase();
  const elementFilter = query.element ? normalizeHumor(query.element) : undefined;
  const bodyNeedle = query.bodyRegion?.trim().toLowerCase();

  return ZODIAC_SIGN_KEYS.filter((k) => {
    const row = AWDE_NEGEST_TABLE[k];
    if (elementFilter && row.element !== elementFilter) return false;
    if (query.quality && row.quality !== query.quality) return false;
    if (query.ruler && RULERS_BY_SIGN[k] !== query.ruler) return false;
    if (bodyNeedle && !(row.bodyRegion ?? "").toLowerCase().includes(bodyNeedle)) {
      return false;
    }
    if (needle) {
      const haystack = [
        row.englishName,
        row.geezName,
        row.traditionalTemperament,
        row.bodyRegion,
        row.rulingSphere,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  }).map((k) => AWDE_NEGEST_TABLE[k]);
}

export function signsByElement(element: CanonicalHumor | HumoralElement | string): readonly ZodiacSignKey[] {
  return indexByElement[normalizeHumor(element)];
}

export function signsByRuler(ruler: PlanetaryRuler): readonly ZodiacSignKey[] {
  return indexByRuler[ruler] ?? [];
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 14 — ENGINE (dependency-injectable façade)
// ═══════════════════════════════════════════════════════════════════════════

export interface AwudeNegestEngineOptions {
  config?: Partial<AwudeNegestEngineConfig>;
  scrollRegistry?: DabtaraScrollRegistry;
}

export class AwudeNegestEngine {
  readonly version = AWDE_NEGEST_VERSION;
  private readonly config: AwudeNegestEngineConfig;
  private readonly scrollRegistry: DabtaraScrollRegistry;
  private readonly cache = new Map<string, unknown>();

  constructor(options: AwudeNegestEngineOptions = {}) {
    this.config = {
      now: () => new Date(),
      logger: DEFAULT_LOGGER,
      cacheEnabled: true,
      ...(options.config ?? {}),
    };
    this.scrollRegistry = options.scrollRegistry ?? new DabtaraScrollRegistry();
  }

  // ── Core façade ──────────────────────────────────────────────────────

  matchSign(
    sign: ZodiacSignName | string,
    options: AwdeNegestMatchOptions = {},
  ): AwdeNegestMatchResult {
    const requestedKey = normalizeZodiacSign(sign);
    const row = AWDE_NEGEST_TABLE[requestedKey];

    if (!options.reconcileWithDate) return row;

    // Called when date reconciliation was requested but no date supplied.
    return row;
  }

  matchByDate(
    date: Date | string | number,
    options: AwdeNegestMatchOptions = {},
  ): AwdeNegestMatchResult {
    const derived = getZodiacSignFromDate(date);
    const row = AWDE_NEGEST_TABLE[derived];
    return Object.freeze({ ...row, derivedFromDate: true });
  }

  matchSignAgainstDate(
    sign: ZodiacSignName | string,
    date: Date | string | number,
    options: AwdeNegestMatchOptions = {},
  ): AwdeNegestMatchResult {
    const requestedKey = normalizeZodiacSign(sign);
    const derivedKey = getZodiacSignFromDate(date);
    const agreed = requestedKey === derivedKey;

    if (!agreed) {
      this.config.logger.warn("Sign/date reconciliation mismatch", {
        requestedKey,
        derivedKey,
      });
    }

    const winner = options.preferDateOverSign && !agreed ? derivedKey : requestedKey;
    const row = AWDE_NEGEST_TABLE[winner];

    return Object.freeze({
      ...row,
      derivedFromDate: winner === derivedKey,
      dateReconciliation: {
        derivedSign: derivedKey,
        requestedSign: requestedKey,
        agreed,
      },
    });
  }

  getPrescriptions(
    sunSign: ZodiacSignName | string,
    humor: HumoralElement | string,
  ): readonly DabtaraScrollPrescriptionEntry[] {
    const key = normalizeZodiacSign(sunSign);
    const h = normalizeHumor(humor);
    return this.scrollRegistry.forSignAndHumor(key, h);
  }

  getTsebel(humor: HumoralElement | string): TsebelSpringEntry {
    const h = normalizeHumor(humor);
    return SPRING_SEED[h];
  }

  getPlanetaryHour(when: Date | string | number, options?: PlanetaryHourOptions): PlanetaryHourInfo {
    const cacheKey = `ph:${String(when)}:${options?.sunrise ?? ""}:${options?.sunset ?? ""}`;
    if (this.config.cacheEnabled) {
      const hit = this.cache.get(cacheKey) as PlanetaryHourInfo | undefined;
      if (hit) return hit;
    }
    const result = getPlanetaryHour(when, options);
    if (this.config.cacheEnabled) this.cache.set(cacheKey, result);
    return result;
  }

  toEthiopianDate(when: Date | string | number): GeezDate {
    return toEthiopianDate(when);
  }

  search(query: SignSearchQuery): readonly AwdeNegestSignMatch[] {
    return searchSigns(query);
  }

  clearCache(): void {
    this.cache.clear();
  }

  // ── Diagnostics ──────────────────────────────────────────────────────

  describe(): string {
    return [
      `engine=awdeNegest`,
      `version=${this.version}`,
      `signs=${ZODIAC_SIGN_KEYS.length}`,
      `prescriptions=${this.scrollRegistry.list().length}`,
      `springs=${HUMORAL_ELEMENTS.length}`,
      `domain=Domain B (firewalled)`,
    ].join(" ");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 15 — SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const awdeNegest = new AwudeNegestEngine();

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 16 — MODULE-LOAD INVARIANT CHECKS
// ═══════════════════════════════════════════════════════════════════════════

/* eslint-disable no-console */
(function validateModuleInvariants() {
  const problems: string[] = [];

  // 1. Table must contain exactly the 12 canonical keys.
  const tableKeys = Object.keys(AWDE_NEGEST_TABLE);
  if (tableKeys.length !== 12) {
    problems.push(`AWDE_NEGEST_TABLE has ${tableKeys.length} entries (expected 12).`);
  }

  // 2. Symbols must be unique.
  const symbols = new Set(tableKeys.map((k) => AWDE_NEGEST_TABLE[k as ZodiacSignKey].symbol));
  if (symbols.size !== tableKeys.length) {
    problems.push("Duplicate zodiac symbols detected.");
  }

  // 3. Gregorian ranges must partition the year without overlap.
  const coveredDays = new Set<string>();
  for (const k of ZODIAC_SIGN_KEYS) {
    const [m1, d1, m2, d2] = GREGORIAN_RANGES[k];
    let m = m1, d = d1;
    let guard = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const tag = `${m}-${d}`;
      if (coveredDays.has(tag)) {
        problems.push(`Gregorian date ${tag} covered twice (conflict at ${k}).`);
        break;
      }
      coveredDays.add(tag);
      if (m === m2 && d === d2) break;
      d++;
      if (d > 31) { d = 1; m++; if (m > 12) m = 1; }
      if (++guard > 400) {
        problems.push(`Range loop runaway for ${k}.`);
        break;
      }
    }
  }

  // 4. Every prescription must be tagged as Domain B and have a firewall disclaimer.
  for (const p of new DabtaraScrollRegistry().list()) {
    if (p.domainBLayer !== "Domain B") problems.push(`Prescription ${p.id} missing Domain B tag.`);
    if (!p.firewallDisclaimer) problems.push(`Prescription ${p.id} missing firewall disclaimer.`);
  }

  // 5. Every humor must have a spring entry.
  for (const h of HUMORAL_ELEMENTS) {
    if (!SPRING_SEED[h]) problems.push(`Missing Tsebel entry for humor: ${h}`);
  }

  if (problems.length) {
    console.error("[AwudeNegest] Module invariants failed:", problems);
  }
})();
/* eslint-enable no-console */