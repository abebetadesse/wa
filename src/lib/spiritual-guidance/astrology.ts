/**
 * Western tropical astrology for the Spiritual Guidance services, computed from Astronomy Engine:
 * the birth chart's Sun, Moon and rising sign, and for each candidate day the Moon's sign, the
 * void-of-course Moon and which planets are retrograde.
 *
 * Void of course follows the usual modern definition: from the Moon's last exact major aspect
 * (conjunction, sextile, square, trine or opposition) to a planet while in a sign, until it enters
 * the next sign. Which planets count is a choice between traditions, so it is an option; the
 * default includes Uranus, Neptune and Pluto, as most published void-of-course tables do.
 */
import {
  ADDIS_ABABA,
  Astronomy,
  DAY_MS,
  HOUR_MS,
  cachedDay,
  dailyMotion,
  localClock,
  localMidnight,
  longitude,
  normalizeDegrees,
  searchCrossing,
  signOf,
  type GuidancePlace,
  type PlanetName,
  type SignPosition,
} from "./ephemeris";

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const MINUTE_MS = 60_000;

export const MAJOR_ASPECTS = [
  { angle: 0, name: "conjunction" },
  { angle: 60, name: "sextile" },
  { angle: 90, name: "square" },
  { angle: 120, name: "trine" },
  { angle: 180, name: "opposition" },
] as const;
export type AspectName = (typeof MAJOR_ASPECTS)[number]["name"];

export const TRADITIONAL_PLANETS: readonly PlanetName[] = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
export const MODERN_PLANETS: readonly PlanetName[] = [...TRADITIONAL_PLANETS, "Uranus", "Neptune", "Pluto"];
const RETROGRADE_CANDIDATES: readonly PlanetName[] = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

// ── Birth chart ─────────────────────────────────────────────────────────────

export interface BirthInput {
  /** Gregorian "YYYY-MM-DD". */
  date: string;
  /** Local "HH:MM" at the birth place; leave out when unknown. */
  time?: string | null;
  /** Birth place; the Moon and Sun need it only for the time zone, the rising sign needs the coordinates. */
  place?: GuidancePlace | null;
}

export interface NatalPlacement extends SignPosition {
  /** False when the birth time is unknown and the body changed sign during the birth day. */
  certain: boolean;
}

export interface NatalChart {
  sun: NatalPlacement;
  /** Null when the birth time is unknown and the Moon changed sign that day. */
  moon: NatalPlacement | null;
  /** Null unless both the birth time and place are known. */
  rising: SignPosition | null;
  notes: string[];
}

function parseClock(time: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) throw new Error(`Expected a birth time as HH:MM, got "${time}".`);
  return Number(match[1]) * HOUR_MS + Number(match[2]) * MINUTE_MS;
}

/** Ecliptic longitude rising on the eastern horizon. */
export function ascendantLongitude(ms: number, latitude: number, longitudeEast: number): number {
  const date = new Date(ms);
  const theta = (Astronomy.SiderealTime(date) * 15 + longitudeEast) * RAD;
  const epsilon = Astronomy.e_tilt(Astronomy.MakeTime(date)).tobl * RAD;
  const phi = latitude * RAD;
  return normalizeDegrees(Math.atan2(Math.cos(theta), -(Math.sin(theta) * Math.cos(epsilon) + Math.tan(phi) * Math.sin(epsilon))) * DEG);
}

export function natalChart(birth: BirthInput): NatalChart {
  const place = birth.place ?? ADDIS_ABABA;
  const dayStart = localMidnight(birth.date, place.utcOffsetHours);
  const dayEnd = dayStart + DAY_MS - MINUTE_MS;
  const notes: string[] = [];

  if (birth.time) {
    const moment = dayStart + parseClock(birth.time);
    return {
      sun: { ...signOf(longitude("Sun", moment)), certain: true },
      moon: { ...signOf(longitude("Moon", moment)), certain: true },
      rising: birth.place ? signOf(ascendantLongitude(moment, place.latitude, place.longitude)) : null,
      notes: birth.place ? notes : ["The rising sign needs the place of birth."],
    };
  }

  notes.push("The birth time is unknown, so positions are for midday and the rising sign is not given.");
  const noon = dayStart + 12 * HOUR_MS;
  const sunStart = signOf(longitude("Sun", dayStart));
  const sunEnd = signOf(longitude("Sun", dayEnd));
  const sunCertain = sunStart.signIndex === sunEnd.signIndex;
  if (!sunCertain) notes.push(`The Sun moved from ${sunStart.sign} into ${sunEnd.sign} that day; the birth time decides which.`);
  const moonStart = signOf(longitude("Moon", dayStart));
  const moonEnd = signOf(longitude("Moon", dayEnd));
  const moonCertain = moonStart.signIndex === moonEnd.signIndex;
  if (!moonCertain) notes.push(`The Moon moved from ${moonStart.sign} into ${moonEnd.sign} that day; the birth time decides which.`);
  return {
    sun: { ...signOf(longitude("Sun", noon)), certain: sunCertain },
    moon: moonCertain ? { ...signOf(longitude("Moon", noon)), certain: true } : null,
    rising: null,
    notes,
  };
}

// ── Void-of-course Moon ─────────────────────────────────────────────────────

export interface LunarAspect {
  planet: PlanetName;
  aspect: AspectName;
  /** Epoch ms when the aspect is exact. */
  at: number;
}

interface SignStay {
  sign: SignPosition;
  enters: number;
  leaves: number;
  lastAspect: LunarAspect | null;
}

/** When the Moon crosses the sign boundary at `boundary` degrees, searching from `from` (forwards or backwards). */
function moonIngress(boundary: number, from: number, direction: 1 | -1): number {
  const f = (ms: number) => normalizeDegrees(longitude("Moon", ms) - boundary + 180) - 180;
  // The Moon needs at most about 2.7 days to cross a sign.
  const window = 3 * DAY_MS;
  const found = direction > 0 ? searchCrossing(f, from, from + window) : searchCrossing(f, from - window, from);
  if (found === null) throw new Error("Could not find the Moon's sign ingress.");
  return found;
}

function aspectsDuring(planet: PlanetName, from: number, to: number): LunarAspect[] {
  const separation = (ms: number) => longitude("Moon", ms) - longitude(planet, ms);
  const found: LunarAspect[] = [];
  const step = 2 * HOUR_MS;
  let t0 = from;
  let s0 = separation(t0);
  while (t0 < to) {
    const t1 = Math.min(t0 + step, to);
    // The Moon always outruns the planet, so the separation grows; unwrap it against the last sample.
    const s1raw = separation(t1);
    const s1 = s0 + (normalizeDegrees(s1raw - s0 + 180) - 180);
    for (let k = Math.ceil(s0 / 30); k * 30 <= s1; k++) {
      const target = normalizeDegrees(k * 30);
      const aspect = MAJOR_ASPECTS.find((a) => a.angle === target || 360 - a.angle === target);
      if (!aspect) continue;
      const at = searchCrossing((ms) => normalizeDegrees(separation(ms) - target + 180) - 180, t0, t1);
      if (at !== null && at >= from && at <= to) found.push({ planet, aspect: aspect.name, at });
    }
    t0 = t1;
    s0 = s1;
  }
  return found;
}

const signStayCache = new Map<string, SignStay>();

function signStayAt(ms: number, planets: readonly PlanetName[]): SignStay {
  const sign = signOf(longitude("Moon", ms));
  const enters = moonIngress(sign.signIndex * 30, ms, -1);
  const leaves = moonIngress(((sign.signIndex + 1) % 12) * 30, ms, 1);
  const key = `${Math.round(enters / MINUTE_MS)}|${planets.join(",")}`;
  const cached = signStayCache.get(key);
  if (cached) return cached;
  const aspects = planets.flatMap((planet) => aspectsDuring(planet, enters, leaves));
  const lastAspect = aspects.sort((a, b) => b.at - a.at)[0] ?? null;
  const stay = { sign, enters, leaves, lastAspect };
  if (signStayCache.size > 2000) signStayCache.clear();
  signStayCache.set(key, stay);
  return stay;
}

export interface VoidOfCourse {
  /** ISO instants; the period may begin before or end after the day it was found for. */
  start: string;
  end: string;
  startLocal: string;
  endLocal: string;
  sign: SignPosition["sign"];
  /** The aspect that began the void; null if the Moon made no major aspect in the sign at all. */
  lastAspect: { planet: PlanetName; aspect: AspectName } | null;
  /** Hours of the void that fall within the local day. */
  hoursThisDay: number;
}

/** Void-of-course periods that overlap a local day. */
export function voidOfCourseOn(date: string, place: GuidancePlace = ADDIS_ABABA, planets: readonly PlanetName[] = MODERN_PLANETS): VoidOfCourse[] {
  const dayStart = localMidnight(date, place.utcOffsetHours);
  const dayEnd = dayStart + DAY_MS;
  const periods: VoidOfCourse[] = [];
  let probe = dayStart;
  while (probe < dayEnd) {
    const stay = signStayAt(probe, planets);
    const start = stay.lastAspect?.at ?? stay.enters;
    const overlap = Math.min(stay.leaves, dayEnd) - Math.max(start, dayStart);
    if (overlap > 0) {
      periods.push({
        start: new Date(start).toISOString(),
        end: new Date(stay.leaves).toISOString(),
        startLocal: localClock(start, place.utcOffsetHours),
        endLocal: localClock(stay.leaves, place.utcOffsetHours),
        sign: stay.sign.sign,
        lastAspect: stay.lastAspect ? { planet: stay.lastAspect.planet, aspect: stay.lastAspect.aspect } : null,
        hoursThisDay: Number((overlap / HOUR_MS).toFixed(2)),
      });
    }
    probe = stay.leaves + MINUTE_MS;
  }
  return periods;
}

// ── Daily transits ──────────────────────────────────────────────────────────

export interface Station {
  planet: PlanetName;
  /** "retrograde" when the planet turns backwards this day, "direct" when it turns forwards. */
  turns: "retrograde" | "direct";
}

export interface DailyTransits {
  date: string;
  moonSign: SignPosition;
  voidOfCourse: VoidOfCourse[];
  /** Total hours of the local day the Moon is void of course. */
  voidHours: number;
  /** Planets moving backwards at local noon. */
  retrograde: PlanetName[];
  mercuryRetrograde: boolean;
  /** Planets that turn retrograde or direct during the day. */
  stations: Station[];
}

export interface TransitOptions {
  /** Planets whose aspects end a void-of-course Moon; modern (with Uranus–Pluto) by default. */
  voidPlanets?: readonly PlanetName[];
}

export function dailyTransits(date: string, place: GuidancePlace = ADDIS_ABABA, options: TransitOptions = {}): DailyTransits {
  const planets = options.voidPlanets ?? MODERN_PLANETS;
  return cachedDay(`transits:${planets.join(",")}`, date, place, () => {
    const dayStart = localMidnight(date, place.utcOffsetHours);
    const noon = dayStart + 12 * HOUR_MS;
    const voidOfCourse = voidOfCourseOn(date, place, planets);
    const retrograde = RETROGRADE_CANDIDATES.filter((p) => dailyMotion(p, noon) < 0);
    const stations: Station[] = [];
    for (const planet of RETROGRADE_CANDIDATES) {
      const before = dailyMotion(planet, dayStart);
      const after = dailyMotion(planet, dayStart + DAY_MS);
      if (before > 0 && after < 0) stations.push({ planet, turns: "retrograde" });
      if (before < 0 && after > 0) stations.push({ planet, turns: "direct" });
    }
    return {
      date,
      moonSign: signOf(longitude("Moon", noon)),
      voidOfCourse,
      voidHours: Number(voidOfCourse.reduce((sum, v) => sum + v.hoursThisDay, 0).toFixed(2)),
      retrograde,
      mercuryRetrograde: retrograde.includes("Mercury"),
      stations,
    };
  });
}
