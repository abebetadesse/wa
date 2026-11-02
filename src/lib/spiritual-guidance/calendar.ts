/**
 * Calendars for the Spiritual Guidance services: Ethiopian, Gregorian and Hijri, and the labels a
 * result shows ("ጥቅምት 23, 2019 ዓ.ም. (November 2, 2026), Monday").
 *
 * Ethiopian dates reuse the conversion in cosmic/skyDay (already tested against known dates); this
 * module adds validation, so 6 Pagume only exists in a leap year. Hijri dates come from the Umm
 * al-Qura calendar built into the JavaScript runtime (ICU). In Ethiopia the start of Ramadan and
 * the Eids is announced after the new crescent is seen, which can differ from the calculated
 * calendar by a day, so callers may pass the announced month starts as `hijriOverrides`.
 *
 * Dates are civil "YYYY-MM-DD" strings for the local day in Ethiopia; nothing here depends on the
 * viewer's time zone.
 */
import {
  ETHIOPIAN_MONTHS,
  ETHIOPIAN_WEEKDAYS,
  addDays,
  fromEthiopianDate,
  toEthiopianDate,
  type EthiopianDate,
} from "@/lib/cosmic/skyDay";

export { addDays, toEthiopianDate, type EthiopianDate };

export type CalendarKind = "ethiopian" | "gregorian" | "hijri";
export type GuidanceLanguage = "am" | "om" | "en";

const DAY_MS = 86_400_000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export class CalendarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalendarError";
  }
}

/** Throws unless `date` is a real Gregorian "YYYY-MM-DD" date. */
export function assertIsoDate(date: string): void {
  const match = ISO_DATE.exec(date);
  if (!match) throw new CalendarError(`Expected a date as YYYY-MM-DD, got "${date}".`);
  const [, y, m, d] = match.map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
    throw new CalendarError(`${date} is not a real date.`);
  }
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

/** Every date from `start` to `end`, both included. */
export function dateRange(start: string, end: string): string[] {
  assertIsoDate(start);
  assertIsoDate(end);
  const count = daysBetween(start, end);
  if (count < 0) throw new CalendarError(`The search window ends (${end}) before it starts (${start}).`);
  return Array.from({ length: count + 1 }, (_, i) => addDays(start, i));
}

// ── Ethiopian ───────────────────────────────────────────────────────────────

/** A year of the Amete Mihret era is a leap year, with 6 days of Pagume, when it leaves 3 after dividing by 4. */
export function isEthiopianLeapYear(year: number): boolean {
  return ((year % 4) + 4) % 4 === 3;
}

export function ethiopianMonthLength(year: number, month: number): number {
  if (month < 13) return 30;
  return isEthiopianLeapYear(year) ? 6 : 5;
}

/** Gregorian "YYYY-MM-DD" for an Ethiopian date, rejecting dates that do not exist (such as 6 Pagume in a common year). */
export function ethiopianToGregorian(year: number, month: number, day: number): string {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new CalendarError("Ethiopian year, month and day must be whole numbers.");
  }
  if (month < 1 || month > 13) throw new CalendarError(`Ethiopian month ${month} does not exist (1–13).`);
  const length = ethiopianMonthLength(year, month);
  if (day < 1 || day > length) {
    throw new CalendarError(`${ETHIOPIAN_MONTHS[month - 1].en} ${year} has ${length} days, so day ${day} does not exist.`);
  }
  return fromEthiopianDate(year, month, day);
}

export function gregorianToEthiopian(date: string): EthiopianDate {
  assertIsoDate(date);
  return toEthiopianDate(date);
}

// ── Easter ──────────────────────────────────────────────────────────────────

/** Ethiopian Orthodox Easter (Fasika) of a Gregorian year, as "YYYY-MM-DD". */
export { ethiopianEaster as orthodoxEaster } from "@/lib/cosmic/skyDay";

/** Western (Gregorian) Easter Sunday of a year, as "YYYY-MM-DD" (anonymous Gregorian algorithm). */
export function westernEaster(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ── Hijri ───────────────────────────────────────────────────────────────────

export const HIJRI_MONTHS = [
  { en: "Muharram", am: "ሙሐረም" },
  { en: "Safar", am: "ሰፈር" },
  { en: "Rabi' al-Awwal", am: "ረቢዑል አወል" },
  { en: "Rabi' al-Thani", am: "ረቢዑል አኺር" },
  { en: "Jumada al-Ula", am: "ጀማደል ኡላ" },
  { en: "Jumada al-Akhirah", am: "ጀማደል አኺር" },
  { en: "Rajab", am: "ረጀብ" },
  { en: "Sha'ban", am: "ሻዕባን" },
  { en: "Ramadan", am: "ረመዳን" },
  { en: "Shawwal", am: "ሸዋል" },
  { en: "Dhu al-Qi'dah", am: "ዙልቀዕዳ" },
  { en: "Dhu al-Hijjah", am: "ዙልሂጃ" },
] as const;

/** The announced first day of a Hijri month, entered by an admin when it differs from the calculation. */
export interface HijriMonthStart {
  year: number;
  month: number;
  /** Gregorian date of day 1. */
  start: string;
}

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthNameAm: string;
  /** "calculated" from Umm al-Qura, or "announced" when an admin-entered month start was applied. */
  source: "calculated" | "announced";
}

const umalqura = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
  timeZone: "UTC",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

if (umalqura.resolvedOptions().calendar !== "islamic-umalqura") {
  // A runtime without full ICU data would silently fall back to Gregorian.
  throw new CalendarError("This JavaScript runtime has no Umm al-Qura calendar (full ICU data is required).");
}

function calculatedHijri(date: string): Omit<HijriDate, "monthName" | "monthNameAm" | "source"> {
  const parts = umalqura.formatToParts(new Date(`${date}T12:00:00Z`));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function withNames(h: { year: number; month: number; day: number }, source: HijriDate["source"]): HijriDate {
  const names = HIJRI_MONTHS[h.month - 1];
  return { ...h, monthName: names.en, monthNameAm: names.am, source };
}

function nextHijriMonth(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

/**
 * Hijri date of a Gregorian date. An announced month start applies from its day 1 to day 29, and to
 * day 30 unless the calculation already begins the next month on that day.
 */
export function gregorianToHijri(date: string, hijriOverrides: readonly HijriMonthStart[] = []): HijriDate {
  assertIsoDate(date);
  const calculated = calculatedHijri(date);
  const latest = hijriOverrides
    .filter((o) => daysBetween(o.start, date) >= 0)
    .sort((a, b) => daysBetween(b.start, a.start))[0];
  if (latest) {
    const offset = daysBetween(latest.start, date);
    if (offset <= 28 || (offset === 29 && calculated.day !== 1)) {
      return withNames({ year: latest.year, month: latest.month, day: offset + 1 }, "announced");
    }
    if (offset === 29) {
      // Day 30 is the calculated first of the next month: the announced month had 29 days.
      return withNames({ ...nextHijriMonth(latest.year, latest.month), day: 1 }, "announced");
    }
  }
  // The calculation has already begun a month that was announced to start later: the day still
  // belongs to the month before (it becomes its 30th day).
  const announcedLater = hijriOverrides.find(
    (o) => o.year === calculated.year && o.month === calculated.month && daysBetween(date, o.start) > 0,
  );
  if (announcedLater) {
    const previous = calculated.month === 1 ? { year: calculated.year - 1, month: 12 } : { year: calculated.year, month: calculated.month - 1 };
    const previousStart = hijriToGregorian(previous.year, previous.month, 1, hijriOverrides);
    return withNames({ ...previous, day: daysBetween(previousStart, date) + 1 }, "announced");
  }
  return withNames(calculated, "calculated");
}

/** Gregorian date of a (calculated) Hijri date; an announced month start for that month wins. */
export function hijriToGregorian(
  year: number,
  month: number,
  day: number,
  hijriOverrides: readonly HijriMonthStart[] = [],
): string {
  if (month < 1 || month > 12 || day < 1 || day > 30) throw new CalendarError(`Hijri ${year}-${month}-${day} does not exist.`);
  const announced = hijriOverrides.find((o) => o.year === year && o.month === month);
  if (announced) return addDays(announced.start, day - 1);
  // The arithmetic (tabular) calendar lands within two days of Umm al-Qura; search around it.
  const jdn =
    day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30) + 1948439 - 1;
  const guess = new Date((jdn - 2440587.5) * DAY_MS + DAY_MS / 2).toISOString().slice(0, 10);
  for (let delta = 0; delta <= 4; delta++) {
    for (const candidate of delta === 0 ? [guess] : [addDays(guess, -delta), addDays(guess, delta)]) {
      const h = calculatedHijri(candidate);
      if (h.year === year && h.month === month && h.day === day) return candidate;
    }
  }
  throw new CalendarError(`Hijri ${year}-${month}-${day} does not exist in the Umm al-Qura calendar.`);
}

export interface IslamicObservance {
  key: "islamic-new-year" | "ashura" | "mawlid" | "ramadan" | "laylat-al-qadr-nights" | "eid-al-fitr" | "arafah" | "eid-al-adha";
  name: string;
  nameAm: string;
}

/** Islamic observances that fall on a date (Ramadan covers the whole month). */
export function islamicObservancesFor(date: string, hijriOverrides: readonly HijriMonthStart[] = []): IslamicObservance[] {
  const h = gregorianToHijri(date, hijriOverrides);
  const found: IslamicObservance[] = [];
  if (h.month === 1 && h.day === 1) found.push({ key: "islamic-new-year", name: "Islamic New Year", nameAm: "የሂጅራ አዲስ ዓመት" });
  if (h.month === 1 && h.day === 10) found.push({ key: "ashura", name: "Ashura", nameAm: "ዓሹራ" });
  if (h.month === 3 && h.day === 12) found.push({ key: "mawlid", name: "Mawlid (Birth of the Prophet)", nameAm: "መውሊድ" });
  if (h.month === 9) {
    found.push({ key: "ramadan", name: "Ramadan", nameAm: "ረመዳን" });
    if (h.day >= 21) found.push({ key: "laylat-al-qadr-nights", name: "Last ten nights of Ramadan", nameAm: "የረመዳን የመጨረሻ አሥር ሌሊቶች" });
  }
  if (h.month === 10 && h.day === 1) found.push({ key: "eid-al-fitr", name: "Eid al-Fitr", nameAm: "ዒድ አል ፈጥር" });
  if (h.month === 12 && h.day === 9) found.push({ key: "arafah", name: "Day of Arafah", nameAm: "የዓረፋ ቀን" });
  if (h.month === 12 && h.day === 10) found.push({ key: "eid-al-adha", name: "Eid al-Adha", nameAm: "ዒድ አል አድሐ" });
  return found;
}

// ── Labels ──────────────────────────────────────────────────────────────────

// Afaan Oromo uses the same month names for both calendars, so labels carry ALI (Ethiopian) or ALA (Gregorian).
const ETHIOPIAN_MONTHS_OM = [
  "Fulbaana", "Onkoloolessa", "Sadaasa", "Muddee", "Amajjii", "Guraandhala", "Bitootessa",
  "Eebila", "Caamsaa", "Waxabajjii", "Adoolessa", "Hagayya", "Qaammee",
] as const;
const GREGORIAN_MONTHS_OM = [
  "Amajjii", "Guraandhala", "Bitootessa", "Eebila", "Caamsaa", "Waxabajjii",
  "Adoolessa", "Hagayya", "Fulbaana", "Onkoloolessa", "Sadaasa", "Muddee",
] as const;
const GREGORIAN_MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
const GREGORIAN_MONTHS_AM = [
  "ጃንዩወሪ", "ፌብሩወሪ", "ማርች", "ኤፕሪል", "ሜይ", "ጁን",
  "ጁላይ", "ኦገስት", "ሴፕቴምበር", "ኦክቶበር", "ኖቬምበር", "ዲሴምበር",
] as const;
const WEEKDAYS_OM = ["Dilbata", "Wiixata", "Kibxata", "Roobii", "Kamiisa", "Jimaata", "Sanbata"] as const;

export function weekdayName(date: string, language: GuidanceLanguage): string {
  const index = weekdayOf(date);
  if (language === "om") return WEEKDAYS_OM[index];
  return ETHIOPIAN_WEEKDAYS[index][language];
}

export function ethiopianLabel(date: string, language: GuidanceLanguage): string {
  const e = gregorianToEthiopian(date);
  if (language === "om") return `${ETHIOPIAN_MONTHS_OM[e.month - 1]} ${e.day}, ${e.year} ALI`;
  return `${e.monthNameAm} ${e.day}, ${e.year} ዓ.ም.`;
}

export function gregorianLabel(date: string, language: GuidanceLanguage): string {
  assertIsoDate(date);
  const [y, m, d] = date.split("-").map(Number);
  if (language === "om") return `${GREGORIAN_MONTHS_OM[m - 1]} ${d}, ${y} ALA`;
  if (language === "am") return `${GREGORIAN_MONTHS_AM[m - 1]} ${d}, ${y}`;
  return `${GREGORIAN_MONTHS_EN[m - 1]} ${d}, ${y}`;
}

export function hijriLabel(date: string, language: GuidanceLanguage, hijriOverrides: readonly HijriMonthStart[] = []): string {
  const h = gregorianToHijri(date, hijriOverrides);
  if (language === "am") return `${h.monthNameAm} ${h.day}, ${h.year} ሂ.`;
  return `${h.day} ${h.monthName} ${h.year} AH`;
}

export interface DualDate {
  gregorian: string;
  ethiopian: EthiopianDate;
  hijri: HijriDate;
  weekday: number;
  /** The preferred calendar first, then Gregorian in brackets, then the weekday. */
  label: string;
}

/** A date in every calendar, labelled the way a result card shows it. */
export function describeDate(
  date: string,
  preferred: CalendarKind,
  language: GuidanceLanguage,
  hijriOverrides: readonly HijriMonthStart[] = [],
): DualDate {
  const gregorian = gregorianLabel(date, language);
  const weekday = weekdayName(date, language);
  const main =
    preferred === "ethiopian"
      ? ethiopianLabel(date, language)
      : preferred === "hijri"
        ? hijriLabel(date, language, hijriOverrides)
        : null;
  return {
    gregorian: date,
    ethiopian: gregorianToEthiopian(date),
    hijri: gregorianToHijri(date, hijriOverrides),
    weekday: weekdayOf(date),
    label: main ? `${main} (${gregorian}), ${weekday}` : `${gregorian}, ${weekday}`,
  };
}
