/**
 * The real astronomical Moon for one local day at one place: phase, lit fraction, age, tropical
 * sign (and the time it changes sign, if it does that day) and moonrise and moonset.
 *
 * Phase names follow the almanac convention (and timeanddate.com): a day is called New, First
 * Quarter, Full or Last Quarter only when that exact instant falls within the local day; any other
 * day is a crescent or gibbous Moon, waxing or waning. Illumination, age and sign are given at the
 * reference time, local noon unless the caller asks for another hour.
 *
 * These values are facts for the result card and must never be adjusted to suit a reading.
 */
import { MOON_PHASES, type MoonPhaseKey } from "@/lib/cosmic/skyDay";
import {
  ADDIS_ABABA,
  Astronomy,
  DAY_MS,
  HOUR_MS,
  cachedDay,
  localClock,
  localMidnight,
  longitude,
  normalizeDegrees,
  searchCrossing,
  signOf,
  type GuidancePlace,
  type SignPosition,
} from "./ephemeris";

export type { MoonPhaseKey };

export const MOON_PHASE_NAMES: Record<MoonPhaseKey, string> = {
  new: "New Moon",
  "waxing-crescent": "Waxing Crescent",
  "first-quarter": "First Quarter",
  "waxing-gibbous": "Waxing Gibbous",
  full: "Full Moon",
  "waning-gibbous": "Waning Gibbous",
  "last-quarter": "Last Quarter",
  "waning-crescent": "Waning Crescent",
};

const QUARTER_KEYS: MoonPhaseKey[] = ["new", "first-quarter", "full", "last-quarter"];

/** What tradition reads into each part of the lunar cycle; used to match a date to an event. */
export type MoonTheme = "planning" | "growth" | "completion" | "release";

export function moonTheme(phase: MoonPhaseKey): MoonTheme {
  if (phase === "new") return "planning";
  if (phase === "full") return "completion";
  if (phase === "waxing-crescent" || phase === "first-quarter" || phase === "waxing-gibbous") return "growth";
  return "release";
}

export interface MoonEvent {
  /** ISO instant (UTC). */
  time: string;
  /** "14:37" local clock time at the place. */
  local: string;
}

export interface MoonDay {
  date: string;
  place: string;
  /** ISO instant the illumination, age and sign refer to. */
  referenceTime: string;
  phase: MoonPhaseKey;
  phaseName: string;
  phaseNameAm: string;
  symbol: string;
  theme: MoonTheme;
  waxing: boolean;
  /** Lit fraction of the disc, 0–1. */
  illumination: number;
  /** Days since the previous new Moon. */
  ageDays: number;
  /** Moon − Sun ecliptic longitude: 0 at new Moon, 180 at full. */
  elongation: number;
  sign: SignPosition;
  /** The exact quarter (new, first quarter, full, last quarter) that falls on this day, if any. */
  quarter: (MoonEvent & { phase: MoonPhaseKey }) | null;
  /** When the Moon moves into the next sign during this day, if it does. */
  signChange: (MoonEvent & { to: SignPosition }) | null;
  moonrise: MoonEvent | null;
  moonset: MoonEvent | null;
}

export interface MoonDayOptions {
  /** Local hour (0–24) the illumination, age and sign refer to; noon by default. */
  referenceHour?: number;
}

function event(ms: number, place: GuidancePlace): MoonEvent {
  return { time: new Date(ms).toISOString(), local: localClock(ms, place.utcOffsetHours) };
}

function computeMoonDay(date: string, place: GuidancePlace, referenceHour: number): MoonDay {
  const start = localMidnight(date, place.utcOffsetHours);
  const end = start + DAY_MS;
  const reference = start + referenceHour * HOUR_MS;

  const next = Astronomy.SearchMoonQuarter(new Date(start));
  const quarterMs = next.time.date.getTime();
  const quarter = quarterMs < end ? { ...event(quarterMs, place), phase: QUARTER_KEYS[next.quarter] } : null;

  const elongation = Astronomy.MoonPhase(new Date(reference));
  const phase: MoonPhaseKey =
    quarter?.phase ??
    (elongation < 90 ? "waxing-crescent" : elongation < 180 ? "waxing-gibbous" : elongation < 270 ? "waning-gibbous" : "waning-crescent");

  const previousNew = Astronomy.SearchMoonPhase(0, new Date(reference), -32);
  const ageDays = previousNew ? (reference - previousNew.date.getTime()) / DAY_MS : NaN;

  const signAtStart = signOf(longitude("Moon", start));
  const signAtEnd = signOf(longitude("Moon", end));
  let signChange: MoonDay["signChange"] = null;
  if (signAtStart.signIndex !== signAtEnd.signIndex) {
    const boundary = signAtEnd.signIndex * 30;
    const at = searchCrossing((ms) => normalizeDegrees(longitude("Moon", ms) - boundary + 180) - 180, start, end);
    if (at !== null) signChange = { ...event(at, place), to: signOf(boundary) };
  }

  const observer = new Astronomy.Observer(place.latitude, place.longitude, place.altitudeMeters);
  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, new Date(start), 1);
  const set = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, new Date(start), 1);
  const within = (t: Astronomy.AstroTime | null) => (t && t.date.getTime() < end ? event(t.date.getTime(), place) : null);

  const names = MOON_PHASES[phase];
  return {
    date,
    place: place.name,
    referenceTime: new Date(reference).toISOString(),
    phase,
    phaseName: MOON_PHASE_NAMES[phase],
    phaseNameAm: names.nameAm,
    symbol: names.symbol,
    theme: moonTheme(phase),
    waxing: elongation < 180,
    illumination: Astronomy.Illumination(Astronomy.Body.Moon, new Date(reference)).phase_fraction,
    ageDays,
    elongation,
    sign: signOf(longitude("Moon", reference)),
    quarter,
    signChange,
    moonrise: within(rise),
    moonset: within(set),
  };
}

/** The Moon on a local civil date ("YYYY-MM-DD") at a place; Addis Ababa when no place is given. */
export function moonDay(date: string, place: GuidancePlace = ADDIS_ABABA, options: MoonDayOptions = {}): MoonDay {
  const referenceHour = options.referenceHour ?? 12;
  return cachedDay(`moon@${referenceHour}`, date, place, () => computeMoonDay(date, place, referenceHour));
}
