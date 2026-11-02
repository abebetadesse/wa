/**
 * Positions of the Sun, Moon and planets for the Spiritual Guidance services, from Astronomy Engine
 * (full VSOP87 and lunar theories, accurate to well under an arcminute; no truncated series).
 *
 * Longitudes are geocentric, apparent, on the true ecliptic of date, which is what the tropical
 * zodiac is measured on. Times are epoch milliseconds.
 */
import * as Astronomy from "astronomy-engine";
import { ZODIAC_SIGNS } from "@/lib/profiling/astrology/zodiac";
import type { ZodiacSignName } from "@/lib/profiling/types";

export const HOUR_MS = 3_600_000;
export const DAY_MS = 86_400_000;

export type PlanetName = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto";

const BODIES: Record<PlanetName, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

/** A place on Earth with its civil time offset (Ethiopia keeps UTC+3 all year). */
export interface GuidancePlace {
  name: string;
  latitude: number;
  /** Degrees east of Greenwich. */
  longitude: number;
  altitudeMeters: number;
  /** Hours east of UT for civil time at the place. */
  utcOffsetHours: number;
}

export const ADDIS_ABABA: GuidancePlace = { name: "Addis Ababa", latitude: 9.03, longitude: 38.74, altitudeMeters: 2355, utcOffsetHours: 3 };

export function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

/** Ecliptic longitude of a body (0–360°) as seen from the centre of the Earth. */
export function longitude(body: PlanetName, ms: number): number {
  const date = new Date(ms);
  if (body === "Sun") return Astronomy.SunPosition(date).elon;
  if (body === "Moon") return Astronomy.EclipticGeoMoon(date).lon;
  return Astronomy.Ecliptic(Astronomy.GeoVector(BODIES[body], date, true)).elon;
}

/** Degrees per day; negative while the planet is retrograde. */
export function dailyMotion(body: PlanetName, ms: number): number {
  const half = DAY_MS / 4;
  const delta = normalizeDegrees(longitude(body, ms + half) - longitude(body, ms - half) + 180) - 180;
  return delta * 2;
}

export interface SignPosition {
  sign: ZodiacSignName;
  /** 0-based index from Aries. */
  signIndex: number;
  degreeInSign: number;
  /** Traditional Ge'ez name used in Ethiopian astrology, e.g. "ሐመል (Hamel)". */
  signGeez: string;
}

export function signOf(eclipticLongitude: number): SignPosition {
  const lon = normalizeDegrees(eclipticLongitude);
  const signIndex = Math.floor(lon / 30) % 12;
  const sign = ZODIAC_SIGNS[signIndex];
  return { sign: sign.name, signIndex, degreeInSign: Number((lon % 30).toFixed(2)), signGeez: sign.ethiopianGeez };
}

/** Epoch ms of local midnight starting a "YYYY-MM-DD" civil date. */
export function localMidnight(date: string, utcOffsetHours: number): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d) - utcOffsetHours * HOUR_MS;
}

/** "06:12": 24-hour local clock for an instant. */
export function localClock(ms: number, utcOffsetHours: number): string {
  return new Date(ms + utcOffsetHours * HOUR_MS).toISOString().slice(11, 16);
}

/** Epoch ms when `f` crosses zero going upwards between `from` and `to`, or null. */
export function searchCrossing(f: (ms: number) => number, from: number, to: number): number | null {
  const found = Astronomy.Search((t) => f(t.date.getTime()), Astronomy.MakeTime(new Date(from)), Astronomy.MakeTime(new Date(to)), {
    dt_tolerance_seconds: 30,
  });
  return found ? found.date.getTime() : null;
}

export { Astronomy };

// ── Per-day cache ───────────────────────────────────────────────────────────

const CACHE_LIMIT = 20_000;
const cache = new Map<string, unknown>();

/**
 * Memoise a day's result. Sky positions for a date and place never change, so a cached value is
 * always correct; the oldest entries are dropped once the cache is full.
 */
export function cachedDay<T>(namespace: string, date: string, place: GuidancePlace, compute: () => T): T {
  const key = `${namespace}|${date}|${place.latitude.toFixed(3)}|${place.longitude.toFixed(3)}|${place.utcOffsetHours}`;
  if (cache.has(key)) return cache.get(key) as T;
  const value = compute();
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
  cache.set(key, value);
  return value;
}
