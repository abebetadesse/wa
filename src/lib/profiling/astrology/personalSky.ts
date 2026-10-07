/**
 * Transits: where the planets are now, measured against one person's natal chart.
 *
 * Nothing here is a fixed list. Each item exists only because a planet in the sky today is within
 * orb of an aspect to a point in this person's chart, and its dates come from stepping the
 * ephemeris until the aspect leaves orb.
 */

import { AspectType, CelestialBody, HumoralElement, PlanetaryPosition, TransitForecastItem } from "../types";
import { angularDifference, bodyLongitude, bodySpeed, dateFromJulianDay, EphemerisBody, julianDayFromDate } from "./ephemeris";
import { ELEMENT_LABEL, getSignFromLongitude, HOUSE_THEMES, ordinal } from "./zodiac";

const ASPECT_ANGLES: { type: AspectType; angle: number }[] = [
  { type: "conjunction", angle: 0 },
  { type: "sextile", angle: 60 },
  { type: "square", angle: 90 },
  { type: "trine", angle: 120 },
  { type: "opposition", angle: 180 },
];

const ASPECT_VERB: Record<AspectType, string> = {
  conjunction: "is joining",
  sextile: "is in sextile to",
  square: "is squaring",
  trine: "is in trine to",
  opposition: "is opposing",
};

// Orb allowed, weight in the ranking, and how far to scan for the start and end of the transit.
const TRANSITING: { body: EphemerisBody; orb: number; weight: number; stepDays: number; maxDays: number }[] = [
  { body: "Saturn", orb: 3, weight: 10, stepDays: 3, maxDays: 540 },
  { body: "Pluto", orb: 2, weight: 9, stepDays: 5, maxDays: 900 },
  { body: "Uranus", orb: 2.5, weight: 9, stepDays: 5, maxDays: 720 },
  { body: "Neptune", orb: 2, weight: 8, stepDays: 5, maxDays: 900 },
  { body: "Jupiter", orb: 3, weight: 8, stepDays: 2, maxDays: 300 },
  { body: "Mars", orb: 2.5, weight: 5, stepDays: 1, maxDays: 120 },
  { body: "Sun", orb: 2, weight: 3, stepDays: 0.5, maxDays: 10 },
  { body: "Venus", orb: 2, weight: 2, stepDays: 0.5, maxDays: 40 },
  { body: "Mercury", orb: 2, weight: 2, stepDays: 0.5, maxDays: 40 },
];

const NATAL_WEIGHT: Partial<Record<CelestialBody, number>> = {
  Sun: 3, Moon: 3, Ascendant: 3, Midheaven: 2, Mercury: 2, Venus: 2, Mars: 2, Jupiter: 1, Saturn: 1,
};

const TRANSIT_THEMES: Record<string, { gift: string; care: string }> = {
  Jupiter: { gift: "growth, confidence and a wider view", care: "overdoing it — too much food, spending or promising" },
  Saturn: { gift: "structure, patience and staying power", care: "tiredness, stiffness and a heavier mood" },
  Uranus: { gift: "fresh perspective and room to change", care: "restlessness and broken sleep" },
  Neptune: { gift: "imagination, compassion and rest", care: "blurred boundaries and low motivation" },
  Pluto: { gift: "deep renewal and resolve", care: "intensity and the urge to control outcomes" },
  Mars: { gift: "drive, courage and physical energy", care: "heat, haste and friction with others" },
  Sun: { gift: "clarity and vitality", care: "pushing past your limits" },
  Venus: { gift: "ease, affection and enjoyment", care: "comfort-seeking and indulgence" },
  Mercury: { gift: "clear thinking and good conversation", care: "mental overload and scattered attention" },
};

const NATAL_DOMAIN: Partial<Record<CelestialBody, string>> = {
  Sun: "core vitality and sense of purpose",
  Moon: "emotional rhythm, sleep and appetite",
  Mercury: "thinking, speech and nerves",
  Venus: "relationships, comfort and what you value",
  Mars: "drive, temper and physical effort",
  Jupiter: "faith, growth and generosity",
  Saturn: "duties, limits and long-term structure",
  Ascendant: "body, appearance and first responses",
  Midheaven: "work, reputation and direction",
};

const ELEMENT_STEADY: Record<HumoralElement, string> = {
  esat: "cooling habits: unhurried meals, water through the day, and a pause before reacting",
  afere: "movement and variety: a brisk daily walk and lighter evening meals",
  nifas: "grounding routines: regular meal and sleep times, warm food, less screen time late at night",
  may: "warmth and clear boundaries: warm drinks, time in the sun, and saying no when you are drained",
};

const ELEMENT_USE: Record<HumoralElement, string> = {
  esat: "start the thing you have been postponing while the energy is there",
  afere: "build something that lasts — a habit, a saving, a piece of craft",
  nifas: "have the conversation, write it down, teach or learn",
  may: "give time to a close relationship or a reflective practice",
};

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Distance from exactness of `aspectAngle` between a transiting body and a fixed natal longitude. */
function orbAt(body: EphemerisBody, jd: number, natalLongitude: number, aspectAngle: number): number {
  return Math.abs(Math.abs(angularDifference(bodyLongitude(body, jd), natalLongitude)) - aspectAngle);
}

interface Candidate {
  config: (typeof TRANSITING)[number];
  natal: PlanetaryPosition;
  aspect: AspectType;
  angle: number;
  orb: number;
  score: number;
  longitude: number;
  speed: number;
}

/**
 * The transits active for this natal chart at `when`, strongest first.
 */
export function calculateTransits(natalPlanets: PlanetaryPosition[], when: Date = new Date(), limit = 6): TransitForecastItem[] {
  const jdNow = julianDayFromDate(when);
  const targets = natalPlanets.filter((planet) => NATAL_WEIGHT[planet.planet]);
  const candidates: Candidate[] = [];

  for (const config of TRANSITING) {
    const longitude = bodyLongitude(config.body, jdNow);
    const speed = bodySpeed(config.body, jdNow);
    for (const natal of targets) {
      const separation = Math.abs(angularDifference(longitude, natal.totalLongitude));
      for (const { type, angle } of ASPECT_ANGLES) {
        const orb = Math.abs(separation - angle);
        if (orb > config.orb) continue;
        const score = config.weight * (NATAL_WEIGHT[natal.planet] || 1) * (1 - 0.6 * (orb / config.orb));
        candidates.push({ config, natal, aspect: type, angle, orb, score, longitude, speed });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  return candidates.slice(0, limit).map((candidate) => {
    const { config, natal, aspect, angle, orb, longitude, speed } = candidate;
    const body = config.body;

    // Walk outwards from today until the aspect leaves orb, noting when it is (or was) closest.
    const scan = (direction: 1 | -1) => {
      let edge = jdNow;
      let bestJd = jdNow;
      let bestOrb = orb;
      let previous = orb;
      // A retrograde planet can make the same aspect up to three times; report the pass nearest to today.
      let nearestPassFound = false;
      for (let offset = config.stepDays; offset <= config.maxDays; offset += config.stepDays) {
        const jd = jdNow + direction * offset;
        const value = orbAt(body, jd, natal.totalLongitude, angle);
        if (value > config.orb) break;
        edge = jd;
        if (!nearestPassFound) {
          if (value < bestOrb) {
            bestOrb = value;
            bestJd = jd;
          } else if (value > previous) {
            nearestPassFound = true;
          }
        }
        previous = value;
      }
      return { edge, bestJd, bestOrb };
    };
    const past = scan(-1);
    const future = scan(1);
    const start = past.edge;
    const end = future.edge;

    const isApplying = orbAt(body, jdNow + 1, natal.totalLongitude, angle) < orb;
    const nature: TransitForecastItem["nature"] =
      aspect === "trine" || aspect === "sextile" ? "harmonious" : aspect === "conjunction" ? "dynamic" : "challenging";
    const transitSign = getSignFromLongitude(longitude).sign;
    const retrograde = speed < 0;
    const themes = TRANSIT_THEMES[body];
    const domain = NATAL_DOMAIN[natal.planet] || "this part of your chart";
    const houseTheme = HOUSE_THEMES[natal.house] || "this area of life";
    const natalPoint = `natal ${natal.planet} at ${natal.degree.toFixed(1)}° ${natal.sign}`;

    // A building aspect peaks ahead; an easing one has already peaked.
    const peak = isApplying ? future : past;
    const peakJd = peak.bestJd;
    const peakOrb = peak.bestOrb;
    const peakDay = dateFromJulianDay(peakJd);
    const peakLabel =
      Math.abs(peakJd - jdNow) < config.stepDays
        ? "closest now"
        : `${isApplying ? "" : "was "}${peakOrb < 0.25 ? "exact" : `closest (${peakOrb.toFixed(1)}°)`} around ${formatDay(peakDay)}`;

    const headline = `${body} in ${transitSign}${retrograde ? " (retrograde)" : ""} ${ASPECT_VERB[aspect]} your ${natalPoint}`;

    const effect =
      nature === "harmonious"
        ? `This is a supportive contact: ${themes.gift} flow easily into your ${domain}.`
        : nature === "challenging"
          ? `This is a testing contact: your ${domain} meet pressure, and the thing to watch is ${themes.care}.`
          : `This is a concentrated contact: ${body} adds ${themes.gift} to your ${domain}, and can tip into ${themes.care}.`;

    const wellbeingForecast = `${headline}, in your ${ordinal(natal.house)} house of ${houseTheme}. ${effect} Orb ${orb.toFixed(1)}°, ${isApplying ? "still building" : "now easing"}; ${peakLabel}.`;

    const balancingAdvice =
      nature === "harmonious"
        ? `Your ${natal.planet} is in ${natal.sign}, a sign of ${ELEMENT_LABEL[natal.element]}: ${ELEMENT_USE[natal.element]}.`
        : `Your ${natal.planet} is in ${natal.sign}, a sign of ${ELEMENT_LABEL[natal.element]}; steady it with ${ELEMENT_STEADY[natal.element]}.`;

    return {
      transitingPlanet: body,
      targetPlanetOrPoint: natal.planet,
      aspect,
      currentSign: transitSign,
      durationWindow: `${formatDay(dateFromJulianDay(start))} – ${formatDay(dateFromJulianDay(end))}`,
      wellbeingForecast,
      balancingAdvice,
      nature,
      orb: Number(orb.toFixed(2)),
      isApplying,
      isRetrograde: retrograde,
      peakDate: isoDay(peakDay),
      peakOrb: Number(peakOrb.toFixed(2)),
      natalSign: natal.sign,
      natalHouse: natal.house,
      headline,
    };
  });
}
