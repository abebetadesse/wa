import {
  AstrologicalAspect,
  CelestialBody,
  EthiopianCoordinatePreset,
  HousePlacement,
  HumoralElement,
  PlanetaryPosition,
  TransitForecastItem,
  ZodiacSignName,
} from "../types";
import { getPlanetaryhealthAssociations, getHousehealthMapping, getAspecthealthImpact } from "./healthMapper";
import { getDabtaraScrollPrescriptions, getTsebelTimingForSunAndMoon, getAwdeNegestZodiacMatch } from "./ethiopianTraditions";

export const ETHIOPIAN_CITIES: Record<string, EthiopianCoordinatePreset> = {
  "Addis Ababa": { city: "Addis Ababa", latitude: 9.03, longitude: 38.74, altitudeMeters: 2400, region: "Shewa / Capital" },
  "Gondar": { city: "Gondar", latitude: 12.60, longitude: 37.46, altitudeMeters: 2133, region: "Amhara Highlands" },
  "Lalibela": { city: "Lalibela", latitude: 12.03, longitude: 39.04, altitudeMeters: 2500, region: "Lasta Highlands" },
  "Harar": { city: "Harar", latitude: 9.31, longitude: 42.13, altitudeMeters: 1885, region: "Harari Plateau" },
  "Bahir Dar": { city: "Bahir Dar", latitude: 11.59, longitude: 37.39, altitudeMeters: 1800, region: "Lake Tana Basin" },
  "Hawassa": { city: "Hawassa", latitude: 7.05, longitude: 38.47, altitudeMeters: 1708, region: "Great Rift Valley" },
  "Mekelle": { city: "Mekelle", latitude: 13.49, longitude: 39.47, altitudeMeters: 2084, region: "Tigray Highlands" },
  "Jimma": { city: "Jimma", latitude: 7.67, longitude: 36.83, altitudeMeters: 1780, region: "Oromia / Coffee Biosphere" },
  "Dire Dawa": { city: "Dire Dawa", latitude: 9.59, longitude: 41.86, altitudeMeters: 1276, region: "Eastern Lowland foothills" },
  "Axum": { city: "Axum", latitude: 14.13, longitude: 38.72, altitudeMeters: 2131, region: "Tigray Northern Highlands" },
};

const ZODIAC_SIGNS: { name: ZodiacSignName; startDegree: number; element: HumoralElement; ethiopianGeez: string }[] = [
  { name: "Aries", startDegree: 0, element: "esat", ethiopianGeez: "ሐመል (Hamel)" },
  { name: "Taurus", startDegree: 30, element: "afere", ethiopianGeez: "ሰውር (Sowr)" },
  { name: "Gemini", startDegree: 60, element: "nifas", ethiopianGeez: "ጀውዛ (Jawza)" },
  { name: "Cancer", startDegree: 90, element: "may", ethiopianGeez: "ሰርጣን (Saratan)" },
  { name: "Leo", startDegree: 120, element: "esat", ethiopianGeez: "አሰድ (Asad)" },
  { name: "Virgo", startDegree: 150, element: "afere", ethiopianGeez: "ሰንቡላ (Senbula)" },
  { name: "Libra", startDegree: 180, element: "nifas", ethiopianGeez: "ሚዛን (Mizan)" },
  { name: "Scorpio", startDegree: 210, element: "may", ethiopianGeez: "አቅራብ (Akrab)" },
  { name: "Sagittarius", startDegree: 240, element: "esat", ethiopianGeez: "ቀውስ (Qaws)" },
  { name: "Capricorn", startDegree: 270, element: "afere", ethiopianGeez: "ጃዲ (Jadi)" },
  { name: "Aquarius", startDegree: 300, element: "nifas", ethiopianGeez: "ደለው (Delaw)" },
  { name: "Pisces", startDegree: 330, element: "may", ethiopianGeez: "ሁት (Hut)" },
];

function normalizeDegree(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

export function getSignFromLongitude(totalLongitude: number): { sign: ZodiacSignName; degreeInSign: number; element: HumoralElement } {
  const norm = normalizeDegree(totalLongitude);
  const signIndex = Math.floor(norm / 30);
  const signObj = ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];
  const degreeInSign = Number((norm % 30).toFixed(2));
  return {
    sign: signObj.name,
    degreeInSign,
    element: signObj.element,
  };
}

/**
 * Calculates planetary longitudes deterministically using astronomical mean motion algorithms.
 * Gives realistic positions for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto.
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
} {
  const [yearStr, monthStr, dayStr] = birthDate.split("-");
  const year = parseInt(yearStr || "1990", 10);
  const month = parseInt(monthStr || "1", 10);
  const day = parseInt(dayStr || "1", 10);

  const [hourStr, minStr] = birthTime.split(":");
  const hours = parseInt(hourStr || "12", 10);
  const minutes = parseInt(minStr || "0", 10);
  const decTime = hours + minutes / 60;

  const coord = ETHIOPIAN_CITIES[cityKey] || ETHIOPIAN_CITIES["Addis Ababa"];

  // Julian Day Calculation
  let Y = year;
  let M = month;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + day + B - 1524.5 + decTime / 24;

  // Days since J2000.0 (Jan 1.5, 2000)
  const d = jd - 2451545.0;

  // Sun Mean Longitude
  const sunL = normalizeDegree(280.46 + 0.9856474 * d);
  const sunM = normalizeDegree(357.528 + 0.9856003 * d) * (Math.PI / 180);
  const sunTotalLon = normalizeDegree(sunL + 1.915 * Math.sin(sunM) + 0.020 * Math.sin(2 * sunM));

  // Moon Mean Longitude
  const moonL = normalizeDegree(218.316 + 13.176396 * d);
  const moonM = normalizeDegree(134.963 + 13.064993 * d) * (Math.PI / 180);
  const moonTotalLon = normalizeDegree(moonL + 6.289 * Math.sin(moonM));

  // Mercury (Mean period ~87.97 days)
  const mercL = normalizeDegree(sunTotalLon + 24 * Math.sin((d * 4.092 * Math.PI) / 180));

  // Venus (Mean period ~224.7 days)
  const venL = normalizeDegree(sunTotalLon + 43 * Math.sin((d * 1.602 * Math.PI) / 180 + 1.2));

  // Mars (Mean period ~686.98 days)
  const marsL = normalizeDegree(355.43 + 0.524033 * d + 8 * Math.sin((d * 0.524 * Math.PI) / 180));

  // Jupiter (Mean period ~4332.59 days = 11.86 yrs)
  const jupL = normalizeDegree(34.35 + 0.083085 * d);

  // Saturn (Mean period ~10759.22 days = 29.45 yrs)
  const satL = normalizeDegree(50.07 + 0.033444 * d);

  // Uranus (~84 yrs)
  const uranL = normalizeDegree(314.05 + 0.011726 * d);

  // Neptune (~164.8 yrs)
  const nepL = normalizeDegree(304.34 + 0.005981 * d);

  // Pluto (~248 yrs)
  const plutL = normalizeDegree(238.93 + 0.00397 * d);

  // Sidereal Local Time & Ascendant computation
  const gmst = normalizeDegree(280.46061837 + 360.98564736629 * d);
  const lst = normalizeDegree(gmst + coord.longitude);
  const ascTotalLon = normalizeDegree(lst + 90);
  const mcTotalLon = normalizeDegree(lst);

  // 12 Equal Houses based on Ascendant
  const houses: HousePlacement[] = [];
  for (let h = 1; h <= 12; h++) {
    const cuspLon = normalizeDegree(ascTotalLon + (h - 1) * 30);
    const signInfo = getSignFromLongitude(cuspLon);
    const mapping = getHousehealthMapping(h);

    houses.push({
      houseNumber: h,
      signOnCusp: signInfo.sign,
      cuspDegree: signInfo.degreeInSign,
      traditionalBodyParts: mapping.bodyParts,
      healthMeaning: mapping.healthMeaning,
      dailyRoutineImpact: mapping.dailyRoutineImpact,
      activePlanets: [],
    });
  }

  // Raw list of celestial bodies
  const rawPlanets: { planet: CelestialBody; lon: number }[] = [
    { planet: "Sun", lon: sunTotalLon },
    { planet: "Moon", lon: moonTotalLon },
    { planet: "Mercury", lon: mercL },
    { planet: "Venus", lon: venL },
    { planet: "Mars", lon: marsL },
    { planet: "Jupiter", lon: jupL },
    { planet: "Saturn", lon: satL },
    { planet: "Uranus", lon: uranL },
    { planet: "Neptune", lon: nepL },
    { planet: "Pluto", lon: plutL },
    { planet: "Ascendant", lon: ascTotalLon },
    { planet: "Midheaven", lon: mcTotalLon },
  ];

  // Map each planet into house and enrich with health associations
  const planets: PlanetaryPosition[] = rawPlanets.map((p) => {
    const signInfo = getSignFromLongitude(p.lon);
    // House calculation
    const offsetFromAsc = normalizeDegree(p.lon - ascTotalLon);
    const houseNum = Math.floor(offsetFromAsc / 30) + 1;

    // Attach to house active planets list
    const houseObj = houses.find((h) => h.houseNumber === houseNum);
    if (houseObj && p.planet !== "Ascendant" && p.planet !== "Midheaven") {
      houseObj.activePlanets.push(p.planet);
    }

    const health = getPlanetaryhealthAssociations(p.planet);

    return {
      planet: p.planet,
      sign: signInfo.sign,
      degree: signInfo.degreeInSign,
      totalLongitude: Number(p.lon.toFixed(2)),
      house: houseNum,
      isRetrograde: p.planet === "Mercury" ? Math.sin(d * 0.1) < -0.6 : false,
      element: signInfo.element,
      ethiopianName: health.ethiopianName,
      ethiopianInterpretation: health.ethiopianInterpretation,
      healthAssociations: {
        organs: health.organs,
        physiologicalSystems: health.physiologicalSystems,
        potentialVulnerabilities: health.potentialVulnerabilities,
        vitalityStrengths: health.vitalityStrengths,
      },
    };
  });

  // Calculate aspects between major bodies
  const aspects: AstrologicalAspect[] = [];
  const majorBodies = planets.filter((p) => p.planet !== "Ascendant" && p.planet !== "Midheaven");

  for (let i = 0; i < majorBodies.length; i++) {
    for (let j = i + 1; j < majorBodies.length; j++) {
      const p1 = majorBodies[i];
      const p2 = majorBodies[j];
      let diff = Math.abs(p1.totalLongitude - p2.totalLongitude);
      if (diff > 180) diff = 360 - diff;

      let aspectType: "conjunction" | "sextile" | "square" | "trine" | "opposition" | null = null;
      let exactAngle = 0;
      let orb = 0;

      if (diff <= 7) {
        aspectType = "conjunction";
        exactAngle = 0;
        orb = diff;
      } else if (Math.abs(diff - 60) <= 6) {
        aspectType = "sextile";
        exactAngle = 60;
        orb = Math.abs(diff - 60);
      } else if (Math.abs(diff - 90) <= 7) {
        aspectType = "square";
        exactAngle = 90;
        orb = Math.abs(diff - 90);
      } else if (Math.abs(diff - 120) <= 7) {
        aspectType = "trine";
        exactAngle = 120;
        orb = Math.abs(diff - 120);
      } else if (Math.abs(diff - 180) <= 7) {
        aspectType = "opposition";
        exactAngle = 180;
        orb = Math.abs(diff - 180);
      }

      if (aspectType) {
        const aspectImpact = getAspecthealthImpact(p1.planet, p2.planet, aspectType);
        aspects.push({
          planet1: p1.planet,
          planet2: p2.planet,
          aspectType,
          exactAngle,
          orb: Number(orb.toFixed(2)),
          nature: aspectType === "trine" || aspectType === "sextile" ? "harmonious" : aspectType === "conjunction" ? "dynamic" : "challenging",
          healthImpact: aspectImpact.healthImpact,
          psychosomaticIndicator: aspectImpact.psychosomaticIndicator,
        });
      }
    }
  }

  // Calculate Transit Forecasts (Simulated current transits based on current date)
  const now = new Date();
  const currentDays = (now.getTime() - new Date("2000-01-01T12:00:00Z").getTime()) / 86400000;
  const currentSaturnLon = normalizeDegree(50.07 + 0.033444 * currentDays);
  const currentJupiterLon = normalizeDegree(34.35 + 0.083085 * currentDays);
  const currentMarsLon = normalizeDegree(355.43 + 0.524033 * currentDays);

  const transits: TransitForecastItem[] = [
    {
      transitingPlanet: "Jupiter",
      targetPlanetOrPoint: planets.find((p) => p.planet === "Sun")?.planet || "Sun",
      aspect: "trine",
      currentSign: getSignFromLongitude(currentJupiterLon).sign,
      durationWindow: "Current 3-month window",
      healthForecast: "Cellular renewal phase: enhanced liver metabolic clearing and elevated immune vitality.",
      balancingAdvice: "Incorporate light bitter greens (Habesha Gomen) and morning sun exposure to maximize energy assimilation.",
    },
    {
      transitingPlanet: "Saturn",
      targetPlanetOrPoint: planets.find((p) => p.planet === "Moon")?.planet || "Moon",
      aspect: "square",
      currentSign: getSignFromLongitude(currentSaturnLon).sign,
      durationWindow: "Next 6-8 weeks",
      healthForecast: "Elevated psychosomatic sensitivity: slight vulnerability to musculoskeletal stiffness, fatigue, and melancholic mood dips.",
      balancingAdvice: "Prioritize warm sesame oil rubs, warm spiced teas (Ginger/Korerima), and consistent sleep pacing.",
    },
    {
      transitingPlanet: "Mars",
      targetPlanetOrPoint: planets.find((p) => p.planet === "Mars")?.planet || "Mars",
      aspect: "conjunction",
      currentSign: getSignFromLongitude(currentMarsLon).sign,
      durationWindow: "Upcoming 3 weeks",
      healthForecast: "Heightened inflammatory and metabolic heat: increased digestive acid and tendency toward impulsivity.",
      balancingAdvice: "Avoid excessively greasy or ultra-spicy hot Berbere stews; balance meals with cooling Ayib and pure spring water.",
    },
  ];

  const ascSign = getSignFromLongitude(ascTotalLon);
  const mcSign = getSignFromLongitude(mcTotalLon);

  return {
    planets,
    houses,
    aspects,
    transits,
    ascendant: { sign: ascSign.sign, degree: ascSign.degreeInSign },
    midheaven: { sign: mcSign.sign, degree: mcSign.degreeInSign },
  };
}

export function buildAstrologicalProfile(
  birthDate: string,
  birthTime: string = "12:00",
  city: string = "Addis Ababa"
) {
  const coord = ETHIOPIAN_CITIES[city] || ETHIOPIAN_CITIES["Addis Ababa"];
  const calc = calculateCelestialPositions(birthDate, birthTime, city);

  const sun = calc.planets.find((p) => p.planet === "Sun")!;
  const moon = calc.planets.find((p) => p.planet === "Moon")!;

  // Compute elemental percentages from planets
  let fireCount = 0;
  let earthCount = 0;
  let airCount = 0;
  let waterCount = 0;

  for (const p of calc.planets) {
    if (p.element === "esat") fireCount++;
    else if (p.element === "afere") earthCount++;
    else if (p.element === "nifas") airCount++;
    else if (p.element === "may") waterCount++;
  }

  const totalPoints = calc.planets.length || 1;
  const elementalBalance = {
    fire: Math.round((fireCount / totalPoints) * 100),
    earth: Math.round((earthCount / totalPoints) * 100),
    air: Math.round((airCount / totalPoints) * 100),
    water: Math.round((waterCount / totalPoints) * 100),
  };

  // Determine dominant humor
  let dominantHumor: HumoralElement = "esat";
  let maxVal = elementalBalance.fire;
  if (elementalBalance.earth > maxVal) {
    dominantHumor = "afere";
    maxVal = elementalBalance.earth;
  }
  if (elementalBalance.air > maxVal) {
    dominantHumor = "nifas";
    maxVal = elementalBalance.air;
  }
  if (elementalBalance.water > maxVal) {
    dominantHumor = "may";
    maxVal = elementalBalance.water;
  }

  // Awde Negest sign
  const ethiopianZodiac = getAwdeNegestZodiacMatch(sun.sign, birthDate);
  const dabtaraPrescriptions = getDabtaraScrollPrescriptions(sun.sign, dominantHumor);
  const tsebelTiming = getTsebelTimingForSunAndMoon(sun.sign, moon.sign, dominantHumor);

  return {
    birthDateTimeUtc: `${birthDate}T${birthTime}:00Z`,
    birthLocation: city,
    coordinates: { latitude: coord.latitude, longitude: coord.longitude },
    sunSign: sun.sign,
    moonSign: moon.sign,
    risingSign: calc.ascendant.sign,
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
