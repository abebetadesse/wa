/**
 * The sky and the calendar for one local day at one place, for timing traditional remedies.
 *
 * Sun and Moon positions come from the profile ephemeris (Meeus, truncated series); this module adds
 * what a healer works with day to day: sunrise, sunset and twilight, moonrise and moonset, the
 * Moon's phase, age and sign, the 24 planetary hours, the Ethiopian date and clock, the Orthodox
 * fasts and feasts, the monthly commemorations and the season. Rise and set times are good to a
 * minute or two, which is finer than any traditional rule needs.
 *
 * Pure and dependency-light: it runs in the browser (so the planner works offline) and on the server.
 * Times are epoch milliseconds; "local" means civil time at the place's fixed UTC offset
 * (Ethiopia keeps +3 all year), never the viewer's own time zone.
 */
import {
  angularDifference,
  julianDayFromDate,
  localSiderealTime,
  moonLongitude,
  normalizeDegrees,
  obliquity,
  sunLongitude,
} from "@/lib/profiling/astrology/ephemeris";
import { ZODIAC_SIGNS } from "@/lib/profiling/astrology/zodiac";

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const SYNODIC_MONTH = 29.530588853;

export interface SkyPlace {
  name: string;
  latitude: number;
  /** Degrees east of Greenwich. */
  longitude: number;
  altitudeMeters: number;
  /** Hours east of UT for civil time at the place. */
  utcOffsetHours: number;
}

// ── Local date helpers ──────────────────────────────────────────────────────

/** "YYYY-MM-DD" of the local civil date containing `ms`. */
export function localDateOf(ms: number, utcOffsetHours: number): string {
  return new Date(ms + utcOffsetHours * HOUR_MS).toISOString().slice(0, 10);
}

/** Epoch ms of local midnight starting a "YYYY-MM-DD" civil date. */
export function localMidnight(date: string, utcOffsetHours: number): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d) - utcOffsetHours * HOUR_MS;
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** "06:12" — 24-hour local clock for an instant. */
export function localClock(ms: number, utcOffsetHours: number): string {
  return new Date(ms + utcOffsetHours * HOUR_MS).toISOString().slice(11, 16);
}

/** Local clock hours (0–24, fractional) of an instant. */
export function localHours(ms: number, utcOffsetHours: number): number {
  const shifted = ms + utcOffsetHours * HOUR_MS;
  return (((shifted % DAY_MS) + DAY_MS) % DAY_MS) / HOUR_MS;
}

// ── Ethiopian clock ─────────────────────────────────────────────────────────

export type EthiopianClockPeriod = "night" | "morning" | "day" | "evening";

export interface EthiopianClock {
  /** 1–12; the day's first hour (12) starts at 6:00 international time. */
  hour: number;
  minute: number;
  period: EthiopianClockPeriod;
  /** "ከጠዋቱ 3:00" */
  label: string;
}

const CLOCK_PERIOD_AM: Record<EthiopianClockPeriod, string> = {
  night: "ከሌሊቱ",
  morning: "ከጠዋቱ",
  day: "ከቀኑ",
  evening: "ከምሽቱ",
};

/** Ethiopian time of day: hours are counted from 6 AM and 6 PM, as people say them. */
export function ethiopianClock(ms: number, utcOffsetHours: number): EthiopianClock {
  const total = Math.round(localHours(ms, utcOffsetHours) * 60) % 1440;
  const h24 = Math.floor(total / 60);
  const minute = total % 60;
  const hour = ((h24 - 6 + 24) % 12) || 12;
  const period: EthiopianClockPeriod = h24 < 6 ? "night" : h24 < 12 ? "morning" : h24 < 18 ? "day" : "evening";
  return { hour, minute, period, label: `${CLOCK_PERIOD_AM[period]} ${hour}:${String(minute).padStart(2, "0")}` };
}

// ── Ethiopian calendar ──────────────────────────────────────────────────────

export const ETHIOPIAN_MONTHS = [
  { en: "Meskerem", am: "መስከረም" }, { en: "Tikimt", am: "ጥቅምት" }, { en: "Hidar", am: "ኅዳር" },
  { en: "Tahsas", am: "ታኅሣሥ" }, { en: "Tir", am: "ጥር" }, { en: "Yekatit", am: "የካቲት" },
  { en: "Megabit", am: "መጋቢት" }, { en: "Miyazya", am: "ሚያዝያ" }, { en: "Ginbot", am: "ግንቦት" },
  { en: "Sene", am: "ሰኔ" }, { en: "Hamle", am: "ሐምሌ" }, { en: "Nehase", am: "ነሐሴ" },
  { en: "Pagume", am: "ጳጉሜን" },
] as const;

export const ETHIOPIAN_WEEKDAYS = [
  { en: "Sunday", am: "እሑድ" }, { en: "Monday", am: "ሰኞ" }, { en: "Tuesday", am: "ማክሰኞ" },
  { en: "Wednesday", am: "ረቡዕ" }, { en: "Thursday", am: "ሐሙስ" }, { en: "Friday", am: "ዓርብ" },
  { en: "Saturday", am: "ቅዳሜ" },
] as const;

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthNameAm: string;
  /** "ጥቅምት 4, 2019 ዓ.ም." */
  label: string;
}

// Julian Day Number of 1 Meskerem, year 1 (Amete Mihret era), less one year, as in the usual algorithm.
const ETHIOPIC_EPOCH = 1723856;

function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function jdnToIsoDate(jdn: number): string {
  return new Date((jdn - 2440588) * DAY_MS).toISOString().slice(0, 10);
}

function isoDateToJdn(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return gregorianToJdn(y, m, d);
}

export function toEthiopianDate(date: string): EthiopianDate {
  const jdn = isoDateToJdn(date);
  const r = (jdn - ETHIOPIC_EPOCH) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - ETHIOPIC_EPOCH) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  const names = ETHIOPIAN_MONTHS[month - 1];
  return { year, month, day, monthName: names.en, monthNameAm: names.am, label: `${names.am} ${day}, ${year} ዓ.ም.` };
}

/** Gregorian "YYYY-MM-DD" of an Ethiopian calendar date. */
export function fromEthiopianDate(year: number, month: number, day: number): string {
  return jdnToIsoDate(ETHIOPIC_EPOCH + 365 * year + Math.floor(year / 4) + 30 * (month - 1) + day - 1);
}

// ── Fasts, feasts and commemorations ────────────────────────────────────────

/** Ethiopian Easter (Fasika): the Julian-calendar Easter, given as a Gregorian date (1900–2099). */
export function ethiopianEaster(gregorianYear: number): string {
  const a = gregorianYear % 4;
  const b = gregorianYear % 7;
  const c = gregorianYear % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  // Julian → Gregorian is +13 days for 1900–2099.
  return new Date(Date.UTC(gregorianYear, month - 1, day + 13)).toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return isoDateToJdn(to) - isoDateToJdn(from);
}

export interface CalendarObservance {
  key: string;
  name: string;
  nameAm: string;
}

/** Commemorations kept on the same day of every Ethiopian month. */
const MONTHLY_COMMEMORATIONS: Record<number, CalendarObservance & { major: boolean }> = {
  1: { key: "lideta", name: "Lideta (Birth of Mary)", nameAm: "ልደታ ለማርያም", major: true },
  2: { key: "thaddeus", name: "Saint Thaddeus", nameAm: "ታዴዎስ ሐዋርያ", major: false },
  3: { key: "baata", name: "Ba'ata (Presentation of Mary)", nameAm: "በዓታ ለማርያም", major: false },
  4: { key: "yohannes-wolde-negodgwad", name: "John the Evangelist", nameAm: "ዮሐንስ ወልደ ነጎድጓድ", major: false },
  5: { key: "abo", name: "Abune Gebre Menfes Kidus (Abo)", nameAm: "አቡነ ገብረ መንፈስ ቅዱስ", major: true },
  6: { key: "iyesus", name: "Iyesus · Qusquam", nameAm: "ኢየሱስ · ቁስቋም", major: false },
  7: { key: "selassie", name: "Holy Trinity (Selassie)", nameAm: "ሥላሴ", major: true },
  8: { key: "arbaetu-ensesa", name: "The Four Living Creatures", nameAm: "አርባዕቱ እንስሳ", major: false },
  9: { key: "thomas", name: "Saint Thomas", nameAm: "ቶማስ", major: false },
  10: { key: "meskel", name: "Holy Cross (Meskel)", nameAm: "መስቀል", major: false },
  11: { key: "hanna-iyakem", name: "Hanna and Iyakem", nameAm: "ሐና ወኢያቄም", major: false },
  12: { key: "michael", name: "Archangel Michael", nameAm: "ቅዱስ ሚካኤል", major: true },
  13: { key: "egziabher-ab", name: "God the Father · Archangel Raphael", nameAm: "እግዚአብሔር አብ · ሩፋኤል", major: false },
  14: { key: "aregawi", name: "Abune Aregawi", nameAm: "አቡነ አረጋዊ", major: false },
  15: { key: "qirqos", name: "Saint Qirqos", nameAm: "ቂርቆስ", major: false },
  16: { key: "kidane-mihret", name: "Kidane Mihret (Covenant of Mercy)", nameAm: "ኪዳነ ምሕረት", major: true },
  17: { key: "estifanos", name: "Saint Stephen", nameAm: "እስጢፋኖስ", major: false },
  18: { key: "ewostatewos", name: "Abune Ewostatewos", nameAm: "ኤዎስጣቴዎስ", major: false },
  19: { key: "gabriel", name: "Archangel Gabriel", nameAm: "ቅዱስ ገብርኤል", major: true },
  20: { key: "tsige", name: "Elisha the Prophet", nameAm: "ነቢዩ ኤልሳዕ", major: false },
  21: { key: "mariam", name: "Saint Mary (Egzitine Mariam)", nameAm: "እግዝእትነ ማርያም", major: true },
  22: { key: "uriel", name: "Archangel Uriel", nameAm: "ቅዱስ ዑራኤል", major: true },
  23: { key: "giyorgis", name: "Saint George (Giyorgis)", nameAm: "ቅዱስ ጊዮርጊስ", major: true },
  24: { key: "tekle-haymanot", name: "Abune Tekle Haymanot", nameAm: "አቡነ ተክለ ሃይማኖት", major: true },
  25: { key: "merkorewos", name: "Saint Merkorewos", nameAm: "መርቆሬዎስ", major: false },
  26: { key: "hosea", name: "Hosea the Prophet", nameAm: "ነቢዩ ሆሴዕ", major: false },
  27: { key: "medhane-alem", name: "Medhane Alem (Saviour of the World)", nameAm: "መድኃኔ ዓለም", major: true },
  28: { key: "amanuel", name: "Amanuel", nameAm: "አማኑኤል", major: true },
  29: { key: "bale-wold", name: "Bale Wold (Feast of the Son)", nameAm: "ባለ ወልድ", major: true },
  30: { key: "markos", name: "Saint Mark", nameAm: "ማርቆስ ወንጌላዊ", major: false },
};

/** Fixed annual feasts by Ethiopian month and day. */
const ANNUAL_FEASTS: { month: number; day: number; observance: CalendarObservance }[] = [
  { month: 1, day: 1, observance: { key: "enkutatash", name: "Enkutatash (New Year)", nameAm: "እንቁጣጣሽ" } },
  { month: 1, day: 17, observance: { key: "meskel-feast", name: "Meskel (Finding of the True Cross)", nameAm: "መስቀል" } },
  { month: 4, day: 29, observance: { key: "genna", name: "Genna (Christmas)", nameAm: "ገና (ልደት)" } },
  { month: 5, day: 11, observance: { key: "timket", name: "Timket (Epiphany)", nameAm: "ጥምቀት" } },
  { month: 5, day: 12, observance: { key: "qana", name: "Qana ze Galila", nameAm: "ቃና ዘገሊላ" } },
  { month: 12, day: 13, observance: { key: "buhe", name: "Buhe (Transfiguration)", nameAm: "ቡሄ (ደብረ ታቦር)" } },
  { month: 12, day: 16, observance: { key: "filseta-feast", name: "Filseta (Assumption of Mary)", nameAm: "ፍልሰታ" } },
  { month: 13, day: 3, observance: { key: "raphael", name: "Archangel Raphael", nameAm: "ቅዱስ ሩፋኤል" } },
];

export interface DayObservances {
  /** A fasting day, and which fast; null on a day without a fast. */
  fast: CalendarObservance | null;
  feasts: CalendarObservance[];
  /** The monthly commemoration for this day of the Ethiopian month. */
  commemoration: (CalendarObservance & { major: boolean }) | null;
}

export function observancesFor(date: string, weekday: number, ethiopian: EthiopianDate): DayObservances {
  const [gYear] = date.split("-").map(Number);
  const easter = ethiopianEaster(gYear);
  const fromEaster = daysBetween(easter, date);
  const { month, day } = ethiopian;

  const feasts: CalendarObservance[] = ANNUAL_FEASTS.filter((f) => f.month === month && f.day === day).map((f) => f.observance);
  const movable: Record<number, CalendarObservance> = {
    [-7]: { key: "hosanna", name: "Hosanna (Palm Sunday)", nameAm: "ሆሳዕና" },
    [-2]: { key: "siklet", name: "Siklet (Good Friday)", nameAm: "ስቅለት" },
    0: { key: "fasika", name: "Fasika (Easter)", nameAm: "ፋሲካ (ትንሣኤ)" },
    39: { key: "erget", name: "Erget (Ascension)", nameAm: "ዕርገት" },
    49: { key: "peraklitos", name: "Peraklitos (Pentecost)", nameAm: "ጰራቅሊጦስ" },
  };
  if (movable[fromEaster]) feasts.push(movable[fromEaster]);

  // The Apostles' fast runs from the Monday after Pentecost to 4 Hamle; July falls in Ethiopian year gYear − 8.
  const hamle4 = fromEthiopianDate(gYear - 8, 11, 4);
  const isFeastDay = feasts.some((f) => ["genna", "timket", "fasika"].includes(f.key));

  let fast: CalendarObservance | null = null;
  if (fromEaster >= -69 && fromEaster <= -67) fast = { key: "nineveh", name: "Fast of Nineveh", nameAm: "ጾመ ነነዌ" };
  else if (fromEaster >= -55 && fromEaster <= -1) fast = { key: "abiy-tsom", name: "Great Lent (Abiy Tsom)", nameAm: "ዐቢይ ጾም" };
  else if (fromEaster >= 50 && daysBetween(date, hamle4) >= 0) fast = { key: "apostles", name: "Fast of the Apostles", nameAm: "ጾመ ሐዋርያት" };
  else if (month === 12 && day <= 15) fast = { key: "filseta", name: "Filseta fast (Assumption)", nameAm: "ጾመ ፍልሰታ" };
  else if ((month === 3 && day >= 15) || (month === 4 && day <= 28)) fast = { key: "nebiyat", name: "Fast of the Prophets (Advent)", nameAm: "ጾመ ነቢያት" };
  else if (month === 5 && day === 10) fast = { key: "gahad", name: "Gahad (Eve of Timket)", nameAm: "ጾመ ገሀድ" };
  // Wednesdays and Fridays, except in the fifty days after Easter and on Genna or Timket.
  else if ((weekday === 3 || weekday === 5) && !(fromEaster >= 1 && fromEaster <= 49) && !isFeastDay) {
    fast = { key: weekday === 3 ? "wednesday" : "friday", name: weekday === 3 ? "Wednesday fast" : "Friday fast", nameAm: weekday === 3 ? "ጾመ ረቡዕ" : "ጾመ ዓርብ" };
  }

  return { fast, feasts, commemoration: month <= 12 ? MONTHLY_COMMEMORATIONS[day] ?? null : null };
}

// ── Season and climate zone ─────────────────────────────────────────────────

export interface SeasonInfo {
  key: "kiremt" | "bega" | "belg";
  name: string;
  nameAm: string;
  description: string;
}

/** Highland rainfall seasons; the south and east have two shorter rainy seasons instead. */
export function seasonFor(date: string): SeasonInfo {
  const month = Number(date.slice(5, 7));
  if (month >= 6 && month <= 9) return { key: "kiremt", name: "Kiremt — main rains", nameAm: "ክረምት", description: "Long rains in the highlands: wet roots, damp storage, cool nights." };
  if (month >= 2 && month <= 5) return { key: "belg", name: "Belg — short rains", nameAm: "በልግ", description: "Short, uneven rains and warming days; new growth on many plants." };
  return { key: "bega", name: "Bega — dry season", nameAm: "በጋ", description: "Dry, sunny days and cold highland nights; good drying weather." };
}

export interface ClimateZone {
  key: "bereha" | "kolla" | "weyna-dega" | "dega" | "wurch";
  name: string;
  nameAm: string;
}

/** Traditional agro-climatic zone from altitude. */
export function climateZoneFor(altitudeMeters: number): ClimateZone {
  if (altitudeMeters < 500) return { key: "bereha", name: "Bereha (hot desert lowland)", nameAm: "በረሃ" };
  if (altitudeMeters < 1500) return { key: "kolla", name: "Kolla (warm lowland)", nameAm: "ቆላ" };
  if (altitudeMeters < 2300) return { key: "weyna-dega", name: "Weyna Dega (temperate midland)", nameAm: "ወይና ደጋ" };
  if (altitudeMeters < 3200) return { key: "dega", name: "Dega (cool highland)", nameAm: "ደጋ" };
  return { key: "wurch", name: "Wurch (cold upland)", nameAm: "ውርጭ" };
}

// ── Sun and Moon in the sky ─────────────────────────────────────────────────

// Periodic terms for the Moon's latitude (Meeus table 47.B, largest terms): D, M, M', F and 1e-6 degrees.
const MOON_LATITUDE_TERMS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0, 0, 0, 1, 5128122], [0, 0, 1, 1, 280602], [0, 0, 1, -1, 277693], [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413], [2, 0, -1, -1, 46271], [2, 0, 0, 1, 32573], [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266], [0, 0, 2, -1, 8822], [2, -1, 0, -1, 8216], [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200], [2, 1, 0, -1, -3359], [2, -1, -1, 1, 2463], [2, -1, 0, 1, 2211],
  [2, -1, -1, -1, 2065], [0, 1, -1, -1, -1870], [4, 0, -1, -1, 1828], [0, 1, 0, 1, -1794],
  [0, 0, 0, 3, -1749], [0, 1, -1, 1, -1565], [1, 0, 0, 1, -1491], [0, 1, 1, 1, -1475],
  [0, 1, 1, -1, -1410], [0, 1, 0, -1, -1344], [1, 0, 0, -1, -1335], [0, 0, 3, 1, 1107],
  [4, 0, 0, -1, 1021], [4, 0, -1, 1, 833],
];

/** Geocentric ecliptic latitude of the Moon, degrees. */
export function moonLatitude(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  const lp = (218.3164477 + 481267.88123421 * t) * RAD;
  const d = (297.8501921 + 445267.1114034 * t) * RAD;
  const m = (357.5291092 + 35999.0502909 * t) * RAD;
  const mp = (134.9633964 + 477198.8675055 * t) * RAD;
  const f = (93.272095 + 483202.0175233 * t) * RAD;
  const e = 1 - 0.002516 * t;
  const a1 = (119.75 + 131.849 * t) * RAD;
  const a3 = (313.45 + 481266.484 * t) * RAD;
  let sum = 0;
  for (const [cd, cm, cmp, cf, coefficient] of MOON_LATITUDE_TERMS) {
    const eccentricity = Math.abs(cm) === 1 ? e : 1;
    sum += coefficient * eccentricity * Math.sin(cd * d + cm * m + cmp * mp + cf * f);
  }
  sum += -2235 * Math.sin(lp) + 382 * Math.sin(a3) + 175 * Math.sin(a1 - f) + 175 * Math.sin(a1 + f) + 127 * Math.sin(lp - mp) - 115 * Math.sin(lp + mp);
  return sum / 1e6;
}

function equatorial(longitude: number, latitude: number, jd: number): { ra: number; dec: number } {
  const eps = obliquity(jd) * RAD;
  const lambda = longitude * RAD;
  const beta = latitude * RAD;
  const ra = Math.atan2(Math.sin(lambda) * Math.cos(eps) - Math.tan(beta) * Math.sin(eps), Math.cos(lambda)) * DEG;
  const dec = Math.asin(Math.sin(beta) * Math.cos(eps) + Math.cos(beta) * Math.sin(eps) * Math.sin(lambda)) * DEG;
  return { ra: normalizeDegrees(ra), dec };
}

function altitude(body: "Sun" | "Moon", ms: number, place: SkyPlace): number {
  const jd = julianDayFromDate(new Date(ms));
  const { ra, dec } = body === "Sun" ? equatorial(sunLongitude(jd), 0, jd) : equatorial(moonLongitude(jd), moonLatitude(jd), jd);
  const hourAngle = (localSiderealTime(jd, place.longitude) - ra) * RAD;
  const phi = place.latitude * RAD;
  const decRad = dec * RAD;
  return Math.asin(Math.sin(phi) * Math.sin(decRad) + Math.cos(phi) * Math.cos(decRad) * Math.cos(hourAngle)) * DEG;
}

/**
 * Instants within [start, end) when a body's altitude crosses `horizon` going up (rise) and down (set).
 * Sampled every 10 minutes and interpolated; a body moves well under a degree in that time.
 */
function crossings(body: "Sun" | "Moon", start: number, end: number, place: SkyPlace, horizon: number): { rises: number[]; sets: number[] } {
  const step = 10 * 60_000;
  const rises: number[] = [];
  const sets: number[] = [];
  let prevT = start;
  let prevH = altitude(body, start, place) - horizon;
  for (let t = start + step; t <= end; t += step) {
    const h = altitude(body, t, place) - horizon;
    if (prevH < 0 && h >= 0) rises.push(prevT + (step * -prevH) / (h - prevH));
    else if (prevH >= 0 && h < 0) sets.push(prevT + (step * prevH) / (prevH - h));
    prevT = t;
    prevH = h;
  }
  return { rises, sets };
}

// Apparent horizon: refraction and the solar semi-diameter for the Sun; for the Moon its mean parallax as well.
const SUN_HORIZON = -0.833;
const CIVIL_TWILIGHT = -6;
const MOON_HORIZON = 0.125;

// ── Moon phase ──────────────────────────────────────────────────────────────

export type MoonPhaseKey =
  | "new" | "waxing-crescent" | "first-quarter" | "waxing-gibbous"
  | "full" | "waning-gibbous" | "last-quarter" | "waning-crescent";

export const MOON_PHASES: Record<MoonPhaseKey, { name: string; nameAm: string; symbol: string }> = {
  new: { name: "New moon", nameAm: "አዲስ ጨረቃ", symbol: "🌑" },
  "waxing-crescent": { name: "Waxing crescent", nameAm: "እያደገ ያለ ጨረቃ (ቀጭን)", symbol: "🌒" },
  "first-quarter": { name: "First quarter", nameAm: "የመጀመሪያ ሩብ", symbol: "🌓" },
  "waxing-gibbous": { name: "Waxing gibbous", nameAm: "እያደገ ያለ ጨረቃ (ሙሉ የሚቃረብ)", symbol: "🌔" },
  full: { name: "Full moon", nameAm: "ሙሉ ጨረቃ", symbol: "🌕" },
  "waning-gibbous": { name: "Waning gibbous", nameAm: "እየቀነሰ ያለ ጨረቃ (ሙሉ ያለፈ)", symbol: "🌖" },
  "last-quarter": { name: "Last quarter", nameAm: "የመጨረሻ ሩብ", symbol: "🌗" },
  "waning-crescent": { name: "Waning crescent", nameAm: "እየቀነሰ ያለ ጨረቃ (ቀጭን)", symbol: "🌘" },
};

/** Moon − Sun longitude, 0 at new moon, 180 at full. */
export function moonElongation(ms: number): number {
  const jd = julianDayFromDate(new Date(ms));
  return normalizeDegrees(moonLongitude(jd) - sunLongitude(jd));
}

export function phaseKeyFor(elongation: number): MoonPhaseKey {
  const keys: MoonPhaseKey[] = ["new", "waxing-crescent", "first-quarter", "waxing-gibbous", "full", "waning-gibbous", "last-quarter", "waning-crescent"];
  return keys[Math.floor(normalizeDegrees(elongation + 22.5) / 45) % 8];
}

export interface MoonState {
  elongation: number;
  phase: MoonPhaseKey;
  /** Lit fraction of the disc, 0–1. */
  illumination: number;
  waxing: boolean;
  /** Days since the last new moon. */
  ageDays: number;
  sign: string;
  signGeez: string;
  /** The body region tradition gives to the sign the Moon is in. */
  bodyRegion: BodyRegionKey;
}

export function moonStateAt(ms: number): MoonState {
  const jd = julianDayFromDate(new Date(ms));
  const lon = moonLongitude(jd);
  const elongation = normalizeDegrees(lon - sunLongitude(jd));
  const signIndex = Math.floor(lon / 30) % 12;
  return {
    elongation,
    phase: phaseKeyFor(elongation),
    illumination: (1 - Math.cos(elongation * RAD)) / 2,
    waxing: elongation < 180,
    ageDays: (elongation / 360) * SYNODIC_MONTH,
    sign: ZODIAC_SIGNS[signIndex].name,
    signGeez: ZODIAC_SIGNS[signIndex].ethiopianGeez,
    bodyRegion: SIGN_BODY_REGION[signIndex],
  };
}

export type PrincipalPhase = "new" | "first-quarter" | "full" | "last-quarter";

export interface PhaseEvent {
  phase: PrincipalPhase;
  at: number;
}

/** New, quarter and full moons between two instants, each found to within a minute. */
export function principalPhases(start: number, end: number): PhaseEvent[] {
  const order: PrincipalPhase[] = ["new", "first-quarter", "full", "last-quarter"];
  const events: PhaseEvent[] = [];
  const step = 6 * HOUR_MS;
  let prev = start;
  let prevQuarter = Math.floor(moonElongation(start) / 90);
  for (let t = start + step; t <= end + step; t += step) {
    const quarter = Math.floor(moonElongation(t) / 90);
    if (quarter !== prevQuarter) {
      const target = quarter * 90;
      let lo = prev;
      let hi = t;
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (angularDifference(moonElongation(mid), target) < 0) lo = mid;
        else hi = mid;
      }
      const at = (lo + hi) / 2;
      if (at >= start && at < end) events.push({ phase: order[quarter], at });
      prevQuarter = quarter;
    }
    prev = t;
  }
  return events;
}

// ── The Moon's sign and the body ────────────────────────────────────────────

export type BodyRegionKey =
  | "head" | "neck" | "arms-chest" | "breast-stomach" | "heart-back" | "belly-bowels"
  | "kidneys-lower-back" | "genitals-bladder" | "hips-thighs" | "knees-bones" | "calves-ankles" | "feet";

export const BODY_REGIONS: Record<BodyRegionKey, string> = {
  head: "Head and face",
  neck: "Neck and throat",
  "arms-chest": "Shoulders, arms and lungs",
  "breast-stomach": "Breast and stomach",
  "heart-back": "Heart and upper back",
  "belly-bowels": "Belly and bowels",
  "kidneys-lower-back": "Kidneys and lower back",
  "genitals-bladder": "Genitals and bladder",
  "hips-thighs": "Hips and thighs",
  "knees-bones": "Knees, joints and bones",
  "calves-ankles": "Calves, ankles and circulation",
  feet: "Feet",
};

/** The old "man of signs": each sign, from Aries to Pisces, governs a region from head to feet. */
const SIGN_BODY_REGION: BodyRegionKey[] = [
  "head", "neck", "arms-chest", "breast-stomach", "heart-back", "belly-bowels",
  "kidneys-lower-back", "genitals-bladder", "hips-thighs", "knees-bones", "calves-ankles", "feet",
];

// ── Planetary hours ─────────────────────────────────────────────────────────

export type Planet = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn";

export const PLANETS: Record<Planet, { nameAm: string; theme: string }> = {
  Sun: { nameAm: "ፀሐይ", theme: "vitality, strength, the heart and eyes" },
  Moon: { nameAm: "ጨረቃ", theme: "fluids, sleep, women's health and children" },
  Mars: { nameAm: "ማርስ (መሪክ)", theme: "heat, courage, blood, muscle and cutting" },
  Mercury: { nameAm: "ሜርኩሪ (ዑጣሪድ)", theme: "speech, nerves, breath and learning" },
  Jupiter: { nameAm: "ጁፒተር (ሙሽታሪ)", theme: "growth, the liver, blessing and abundance" },
  Venus: { nameAm: "ቬነስ (ዙሀራ)", theme: "fertility, love, the skin and kidneys" },
  Saturn: { nameAm: "ሳተርን (ዙሐል)", theme: "bones, endurance, removal and binding" },
};

const CHALDEAN_ORDER: Planet[] = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];
const DAY_RULER: Planet[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

export interface PlanetaryHour {
  /** 1–12 within the day or within the night. */
  index: number;
  isDaytime: boolean;
  ruler: Planet;
  start: number;
  end: number;
}

// ── One day ─────────────────────────────────────────────────────────────────

export interface SkyDay {
  date: string;
  weekday: number;
  weekdayName: string;
  weekdayNameAm: string;
  ethiopian: EthiopianDate;
  dayRuler: Planet;
  sun: {
    civilDawn: number | null;
    sunrise: number;
    solarNoon: number;
    sunset: number;
    civilDusk: number | null;
    dayLengthHours: number;
  };
  moon: {
    rise: number | null;
    set: number | null;
    /** At local noon. */
    state: MoonState;
    /** A new, quarter or full moon falling on this local day. */
    event: PhaseEvent | null;
  };
  planetaryHours: PlanetaryHour[];
  observances: DayObservances;
  season: SeasonInfo;
}

function sunEvents(date: string, place: SkyPlace) {
  const start = localMidnight(date, place.utcOffsetHours);
  const end = start + DAY_MS;
  const rise = crossings("Sun", start, end, place, SUN_HORIZON);
  const civil = crossings("Sun", start, end, place, CIVIL_TWILIGHT);
  // Within the tropics the Sun always rises and sets; the 6 AM / 6 PM fallback only guards odd input.
  const sunrise = rise.rises[0] ?? start + 6 * HOUR_MS;
  const sunset = rise.sets[rise.sets.length - 1] ?? start + 18 * HOUR_MS;
  return { sunrise, sunset, civilDawn: civil.rises[0] ?? null, civilDusk: civil.sets[civil.sets.length - 1] ?? null };
}

export function skyDay(date: string, place: SkyPlace, phaseEvents?: PhaseEvent[]): SkyDay {
  const offset = place.utcOffsetHours;
  const start = localMidnight(date, offset);
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const ethiopian = toEthiopianDate(date);

  const today = sunEvents(date, place);
  const tomorrow = sunEvents(addDays(date, 1), place);
  const solarNoon = (today.sunrise + today.sunset) / 2;

  // Day hours divide sunrise→sunset in twelve; night hours divide sunset→next sunrise.
  const dayRuler = DAY_RULER[weekday];
  const first = CHALDEAN_ORDER.indexOf(dayRuler);
  const dayHour = (today.sunset - today.sunrise) / 12;
  const nightHour = (tomorrow.sunrise - today.sunset) / 12;
  const planetaryHours: PlanetaryHour[] = Array.from({ length: 24 }, (_, i) => {
    const isDaytime = i < 12;
    const s = isDaytime ? today.sunrise + i * dayHour : today.sunset + (i - 12) * nightHour;
    return { index: (i % 12) + 1, isDaytime, ruler: CHALDEAN_ORDER[(first + i) % 7], start: s, end: s + (isDaytime ? dayHour : nightHour) };
  });

  const moonTimes = crossings("Moon", start, start + DAY_MS, place, MOON_HORIZON);
  const events = phaseEvents ?? principalPhases(start, start + DAY_MS);
  const event = events.find((e) => e.at >= start && e.at < start + DAY_MS) ?? null;

  return {
    date,
    weekday,
    weekdayName: ETHIOPIAN_WEEKDAYS[weekday].en,
    weekdayNameAm: ETHIOPIAN_WEEKDAYS[weekday].am,
    ethiopian,
    dayRuler,
    sun: {
      civilDawn: today.civilDawn,
      sunrise: today.sunrise,
      solarNoon,
      sunset: today.sunset,
      civilDusk: today.civilDusk,
      dayLengthHours: (today.sunset - today.sunrise) / HOUR_MS,
    },
    moon: { rise: moonTimes.rises[0] ?? null, set: moonTimes.sets[0] ?? null, state: moonStateAt(start + 12 * HOUR_MS), event },
    planetaryHours,
    observances: observancesFor(date, weekday, ethiopian),
    season: seasonFor(date),
  };
}

/** Consecutive days from `date`, sharing one search for the principal phases. */
export function skyDays(date: string, count: number, place: SkyPlace): SkyDay[] {
  const start = localMidnight(date, place.utcOffsetHours);
  const events = principalPhases(start, start + count * DAY_MS);
  return Array.from({ length: count }, (_, i) => skyDay(addDays(date, i), place, events));
}
