import {
  AstrologicalAspect,
  AspectType,
  CelestialBody,
  EthiopianCoordinatePreset,
  HousePlacement,
  HumoralElement,
  PlanetaryPosition,
  TransitForecastItem,
  ZodiacSignName,
} from "../types";
import { getPlanetarywellbeingAssociations, getHousewellbeingMapping, getAspectwellbeingImpact } from "./wellbeingMapper";
import { getDabtaraScrollPrescriptions, getTsebelTimingForSunAndMoon, getAwdeNegestZodiacMatch } from "./ethiopianTraditions";
import { allBodyPositions, chartAngles, dateFromJulianDay, julianDayFromLocal, normalizeDegrees } from "./ephemeris";
import { BIRTH_PLACE_SUGGESTIONS, resolveBirthPlace, ResolvedPlace } from "./places";
import { calculateTransits } from "./personalSky";
import { getSignFromLongitude, ordinal } from "./zodiac";

export { getSignFromLongitude } from "./zodiac";

/** Towns the birth-place field suggests; any place `resolveBirthPlace` knows can be typed. */
export const ETHIOPIAN_CITIES: Record<string, EthiopianCoordinatePreset> = Object.fromEntries(
  BIRTH_PLACE_SUGGESTIONS.map((place) => {
    const resolved = resolveBirthPlace(place.city);
    return [
      place.city,
      { city: resolved.city, latitude: resolved.latitude, longitude: resolved.longitude, altitudeMeters: resolved.altitudeMeters, region: resolved.region },
    ];
  })
);

const ASPECTS: { type: AspectType; angle: number; orb: number }[] = [
  { type: "conjunction", angle: 0, orb: 7 },
  { type: "sextile", angle: 60, orb: 5 },
  { type: "square", angle: 90, orb: 6 },
  { type: "trine", angle: 120, orb: 6 },
  { type: "opposition", angle: 180, orb: 7 },
];

// The luminaries carry wider orbs than the other planets.
const LUMINARIES: CelestialBody[] = ["Sun", "Moon"];

const ASPECT_PHRASE: Record<AspectType, string> = {
  conjunction: "conjunct",
  sextile: "sextile",
  square: "square",
  trine: "trine",
  opposition: "opposite",
};

/**
 * Casts the chart for a birth date, a local clock time and a place.
 *
 * Positions are geocentric and of date (see ./ephemeris). The time is read as local civil time at
 * the place, and the Ascendant, Midheaven and houses are computed for its coordinates.
 */
export function calculateCelestialPositions(
  birthDate: string,
  birthTime: string = "12:00",
  cityKey: string = "Addis Ababa"
): {
  planets: PlanetaryPosition[];
  houses: HousePlacement[];
  aspects: AstrologicalAspect[];
  transits: TransitForecastItem[];
  ascendant: { sign: ZodiacSignName; degree: number };
  midheaven: { sign: ZodiacSignName; degree: number };
  place: ResolvedPlace;
  julianDay: number;
} {
  const place = resolveBirthPlace(cityKey);
  const jd = julianDayFromLocal(birthDate, birthTime || "12:00", place.utcOffsetHours);
  const bodies = allBodyPositions(jd);
  const angles = chartAngles(jd, place.latitude, place.longitude);
  const ascTotalLon = angles.ascendant;
  const mcTotalLon = angles.midheaven;

  // 12 equal houses from the Ascendant degree.
  const houses: HousePlacement[] = [];
  for (let h = 1; h <= 12; h++) {
    const signInfo = getSignFromLongitude(normalizeDegrees(ascTotalLon + (h - 1) * 30));
    const mapping = getHousewellbeingMapping(h);
    houses.push({
      houseNumber: h,
      signOnCusp: signInfo.sign,
      cuspDegree: signInfo.degreeInSign,
      traditionalBodyParts: mapping.bodyParts,
      wellbeingMeaning: mapping.wellbeingMeaning,
      dailyRoutineImpact: mapping.dailyRoutineImpact,
      activePlanets: [],
    });
  }

  const rawPlanets: { planet: CelestialBody; lon: number; retrograde: boolean }[] = [
    ...bodies.map((body) => ({ planet: body.body as CelestialBody, lon: body.longitude, retrograde: body.isRetrograde })),
    { planet: "Ascendant", lon: ascTotalLon, retrograde: false },
    { planet: "Midheaven", lon: mcTotalLon, retrograde: false },
  ];

  const planets: PlanetaryPosition[] = rawPlanets.map((p) => {
    const signInfo = getSignFromLongitude(p.lon);
    const houseNum = Math.floor(normalizeDegrees(p.lon - ascTotalLon) / 30) + 1;

    const houseObj = houses.find((h) => h.houseNumber === houseNum);
    if (houseObj && p.planet !== "Ascendant" && p.planet !== "Midheaven") {
      houseObj.activePlanets.push(p.planet);
    }

    const wellbeing = getPlanetarywellbeingAssociations(p.planet);

    return {
      planet: p.planet,
      sign: signInfo.sign,
      degree: signInfo.degreeInSign,
      totalLongitude: Number(p.lon.toFixed(2)),
      house: houseNum,
      isRetrograde: p.retrograde,
      element: signInfo.element,
      ethiopianName: wellbeing.ethiopianName,
      ethiopianInterpretation: wellbeing.ethiopianInterpretation,
      wellbeingAssociations: {
        organs: wellbeing.organs,
        physiologicalSystems: wellbeing.physiologicalSystems,
        potentialVulnerabilities: wellbeing.potentialVulnerabilities,
        vitalityStrengths: wellbeing.vitalityStrengths,
      },
    };
  });

  // Aspects between the ten bodies, tightest first.
  const aspects: AstrologicalAspect[] = [];
  const majorBodies = planets.filter((p) => p.planet !== "Ascendant" && p.planet !== "Midheaven");

  for (let i = 0; i < majorBodies.length; i++) {
    for (let j = i + 1; j < majorBodies.length; j++) {
      const p1 = majorBodies[i];
      const p2 = majorBodies[j];
      let diff = Math.abs(p1.totalLongitude - p2.totalLongitude);
      if (diff > 180) diff = 360 - diff;

      const involvesLuminary = LUMINARIES.includes(p1.planet) || LUMINARIES.includes(p2.planet);
      const found = ASPECTS.find((aspect) => Math.abs(diff - aspect.angle) <= aspect.orb + (involvesLuminary ? 1 : 0));
      if (!found) continue;

      const orb = Math.abs(diff - found.angle);
      const impact = getAspectwellbeingImpact(p1.planet, p2.planet, found.type);
      const strength =
        orb <= 1
          ? "almost exact, so it is one of the strongest notes in your chart"
          : orb <= 3
            ? "close, so you will recognise it readily"
            : "wide, a background influence";
      aspects.push({
        planet1: p1.planet,
        planet2: p2.planet,
        aspectType: found.type,
        exactAngle: found.angle,
        orb: Number(orb.toFixed(2)),
        nature: found.type === "trine" || found.type === "sextile" ? "harmonious" : found.type === "conjunction" ? "dynamic" : "challenging",
        wellbeingImpact: `${p1.planet} in ${p1.sign} (${ordinal(p1.house)} house) ${ASPECT_PHRASE[found.type]} ${p2.planet} in ${p2.sign} (${ordinal(p2.house)} house), orb ${orb.toFixed(1)}° — ${strength}. ${impact.wellbeingImpact}`,
        psychosomaticIndicator: impact.psychosomaticIndicator,
      });
    }
  }
  aspects.sort((a, b) => a.orb - b.orb);

  const ascSign = getSignFromLongitude(ascTotalLon);
  const mcSign = getSignFromLongitude(mcTotalLon);

  return {
    planets,
    houses,
    aspects,
    // Today's sky measured against this chart.
    transits: calculateTransits(planets),
    ascendant: { sign: ascSign.sign, degree: ascSign.degreeInSign },
    midheaven: { sign: mcSign.sign, degree: mcSign.degreeInSign },
    place,
    julianDay: jd,
  };
}

// How much each point counts towards the elemental balance: the luminaries and Ascendant describe
// the person, while the slow outer planets are shared by everyone born in the same years.
const ELEMENT_WEIGHT: Record<CelestialBody, number> = {
  Sun: 3, Moon: 3, Ascendant: 3, Mercury: 2, Venus: 2, Mars: 2, Jupiter: 1.5, Saturn: 1.5, Midheaven: 1, Uranus: 0.5, Neptune: 0.5, Pluto: 0.5,
};

export function buildAstrologicalProfile(
  birthDate: string,
  birthTime: string = "12:00",
  city: string = "Addis Ababa"
) {
  const calc = calculateCelestialPositions(birthDate, birthTime, city);
  const coord = calc.place;

  const sun = calc.planets.find((p) => p.planet === "Sun")!;
  const moon = calc.planets.find((p) => p.planet === "Moon")!;

  // Elemental balance, weighted towards the points that are personal to this chart.
  const tally: Record<HumoralElement, number> = { esat: 0, afere: 0, nifas: 0, may: 0 };
  let totalWeight = 0;
  for (const p of calc.planets) {
    const weight = ELEMENT_WEIGHT[p.planet] ?? 1;
    tally[p.element] += weight;
    totalWeight += weight;
  }
  const elementalBalance = {
    fire: Math.round((tally.esat / totalWeight) * 100),
    earth: Math.round((tally.afere / totalWeight) * 100),
    air: Math.round((tally.nifas / totalWeight) * 100),
    water: Math.round((tally.may / totalWeight) * 100),
  };

  const dominantHumor = (Object.keys(tally) as HumoralElement[]).reduce(
    (best, element) => (tally[element] > tally[best] ? element : best),
    "esat" as HumoralElement
  );

  // Awde Negest sign
  const ethiopianZodiac = getAwdeNegestZodiacMatch(sun.sign, birthDate);
  const dabtaraPrescriptions = getDabtaraScrollPrescriptions(sun.sign, dominantHumor);
  const tsebelTiming = getTsebelTimingForSunAndMoon(sun.sign, moon.sign, dominantHumor);

  return {
    birthDateTimeUtc: dateFromJulianDay(calc.julianDay).toISOString(),
    birthLocation: city,
    coordinates: { latitude: coord.latitude, longitude: coord.longitude },
    sunSign: sun.sign,
    moonSign: moon.sign,
    risingSign: calc.ascendant.sign,
    ascendant: calc.ascendant,
    midheaven: calc.midheaven,
    castFor: {
      city: coord.city,
      region: coord.region,
      altitudeMeters: coord.altitudeMeters,
      utcOffsetHours: coord.utcOffsetHours,
      matched: coord.matched,
      query: coord.query,
    },
    elementalBalance,
    dominantHumor,
    ethiopianZodiacSign: ethiopianZodiac,
    planetaryPositions: calc.planets,
    houses: calc.houses,
    aspects: calc.aspects,
    transitsForecast: calc.transits,
    dabtaraPrescriptions,
    tsebelTiming,
  };
}
