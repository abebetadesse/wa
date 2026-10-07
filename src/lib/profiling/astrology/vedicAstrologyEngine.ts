/**
 * Vedic Astrology (Jyotish), Divisional Charts, Vimshottari Dasha, and Panchang Engine
 * Inspired by AstroSage Kundli & Time Passages
 */

import {
  HumoralElement,
  TransitForecastItem,
  ZodiacSignName,
} from "../types";
import {
  DashaPeriod,
  DetailedHoroscope,
  DivisionalChartPlacement,
  NakshatraInfo,
  PanchangData,
  PersonalDayAlignment,
  PrashnaKundliResult,
  VedicPlanetaryPlacement,
} from "../extendedTypes";
import { calculateCelestialPositions, getSignFromLongitude } from "./chartCalculator";
import {
  allBodyPositions,
  bodyLongitude,
  chartAngles,
  formatClock,
  julianDayFromDate,
  julianDayFromLocal,
  lunarNodeLongitude,
  moonIllumination,
  solarDay,
} from "./ephemeris";
import { calculateTransits } from "./personalSky";
import { resolveBirthPlace } from "./places";
import { HOUSE_THEMES, ordinal } from "./zodiac";

// 27 Nakshatras with traditional Vedic details and Ethiopian celestial resonances
export const NAKSHATRAS: {
  name: string;
  geezName: string;
  rulingPlanet: string;
  deity: string;
  symbol: string;
  element: HumoralElement;
  temperament: string;
}[] = [
    { name: "Ashwini", geezName: "አስዊኒ (ቀዳሚ)", rulingPlanet: "Ketu", deity: "Ashwini Kumaras", symbol: "Horse's Head", element: "esat", temperament: "Swift, healing, pioneering vitality" },
    { name: "Bharani", geezName: "ባራኒ (ተሸካሚ)", rulingPlanet: "Venus", deity: "Yama", symbol: "Yoni / Vessel", element: "esat", temperament: "Restraint, transformative discipline" },
    { name: "Krittika", geezName: "ክሪቲካ (ነበልባል)", rulingPlanet: "Sun", deity: "Agni", symbol: "Flame / Razor", element: "esat", temperament: "Purifying discernment, radiant clarity" },
    { name: "Rohini", geezName: "ሮሂኒ (ቀይ ኮከብ)", rulingPlanet: "Moon", deity: "Brahma", symbol: "Chariot / Temple", element: "afere", temperament: "Sensory charm, fertility, artistic growth" },
    { name: "Mrigashira", geezName: "ምሪጋሺራ (አጋዘን)", rulingPlanet: "Mars", deity: "Soma", symbol: "Deer's Head", element: "afere", temperament: "Inquisitive searching, gentle agility" },
    { name: "Ardra", geezName: "አርዲራ (የእንባ ጠብታ)", rulingPlanet: "Rahu", deity: "Rudra", symbol: "Teardrop / Diamond", element: "nifas", temperament: "Cathartic storm, emotional breakthrough" },
    { name: "Punarvasu", geezName: "ፑናርቫሱ (ተመላሽ ብርሃን)", rulingPlanet: "Jupiter", deity: "Aditi", symbol: "Bow & Quiver", element: "nifas", temperament: "Restoration of virtue, resilient return" },
    { name: "Pushya", geezName: "ፑሽያ (በረከት)", rulingPlanet: "Saturn", deity: "Brihaspati", symbol: "Flower / Udder", element: "may", temperament: "Deep spiritual nourishment, ethical shelter" },
    { name: "Ashlesha", geezName: "አሽሌሻ (እባብ)", rulingPlanet: "Mercury", deity: "Nagas", symbol: "Coiled Serpent", element: "may", temperament: "Intuitive psychology, mystical insight" },
    { name: "Magha", geezName: "ማጋ (ታላቁ)", rulingPlanet: "Ketu", deity: "Pitris (Ancestors)", symbol: "Royal Throne", element: "esat", temperament: "Ancestral authority, noble heritage" },
    { name: "Purva Phalguni", geezName: "ፑርቫ ፈልጉኒ", rulingPlanet: "Venus", deity: "Bhaga", symbol: "Hammock / Fig Tree", element: "esat", temperament: "Rejuvenation, delight, harmonious leisure" },
    { name: "Uttara Phalguni", geezName: "ኡታራ ፈልጉኒ", rulingPlanet: "Sun", deity: "Aryaman", symbol: "Bed / Pillar", element: "afere", temperament: "Honor, steadfast alliances, civic duty" },
    { name: "Hasta", geezName: "ሀስታ (የፈዋሽ እጅ)", rulingPlanet: "Moon", deity: "Savitur", symbol: "Open Hand", element: "afere", temperament: "Artisanal skill, therapeutic dexterity" },
    { name: "Chitra", geezName: "ቺትራ (የከበረ ዕንቁ)", rulingPlanet: "Mars", deity: "Vishwakarma", symbol: "Bright Jewel", element: "nifas", temperament: "Architectural vision, aesthetic precision" },
    { name: "Swati", geezName: "ስዋቲ (ነፃ ነፋስ)", rulingPlanet: "Rahu", deity: "Vayu", symbol: "Young Shoot / Coral", element: "nifas", temperament: "Independent adaptation, diplomatic grace" },
    { name: "Vishakha", geezName: "ቪሻካ (ድል አድራጊ)", rulingPlanet: "Jupiter", deity: "Indra & Agni", symbol: "Triumphal Arch", element: "esat", temperament: "Focused triumph, unwavering goal pursuit" },
    { name: "Anuradha", geezName: "አኑራዳ (የፍቅር ኮከብ)", rulingPlanet: "Saturn", deity: "Mitra", symbol: "Lotus Blossom", element: "may", temperament: "Loyal brotherhood, quiet devotion, resilience" },
    { name: "Jyeshtha", geezName: "ጄሽታ (ታላቁ ሽማግሌ)", rulingPlanet: "Mercury", deity: "Indra", symbol: "Circular Amulet", element: "may", temperament: "Strategic leadership, veteran fortitude" },
    { name: "Mula", geezName: "ሙላ (ሥር)", rulingPlanet: "Ketu", deity: "Nirriti", symbol: "Tied Roots", element: "esat", temperament: "Deep investigation, dismantling illusion" },
    { name: "Purva Ashadha", geezName: "ፑርቫ አሻዳ (የማይሸነፍ)", rulingPlanet: "Venus", deity: "Apas (Waters)", symbol: "Winnowing Basket", element: "esat", temperament: "Unshakeable confidence, cleansing flow" },
    { name: "Uttara Ashadha", geezName: "ኡታራ አሻዳ (ዘላቂ ድል)", rulingPlanet: "Sun", deity: "Vishwadevas", symbol: "Elephant Tusk", element: "afere", temperament: "Universal solidarity, steadfast integrity" },
    { name: "Shravana", geezName: "ሽራቫና (የአዳማጭ ጆሮ)", rulingPlanet: "Moon", deity: "Vishnu", symbol: "Three Footprints / Ear", element: "afere", temperament: "Scholarly listening, traditional knowledge" },
    { name: "Dhanishta", geezName: "ዳኒሽታ (የከበሮ ዜማ)", rulingPlanet: "Mars", deity: "Eight Vasus", symbol: "Dolphin / Drum", element: "nifas", temperament: "Rhythmic leadership, martial philanthropy" },
    { name: "Shatabhisha", geezName: "ሻታቢሻ (መቶ ፈዋሾች)", rulingPlanet: "Rahu", deity: "Varuna", symbol: "Empty Circle / 100 Herbs", element: "nifas", temperament: "Esoteric medicine, solitary contemplation" },
    { name: "Purva Bhadrapada", geezName: "ፑርቫ ባድራፓዳ", rulingPlanet: "Jupiter", deity: "Aja Ekapada", symbol: "Funeral Cot / Sword", element: "may", temperament: "Spiritual asceticism, profound earnestness" },
    { name: "Uttara Bhadrapada", geezName: "ኡታራ ባድራፓዳ", rulingPlanet: "Saturn", deity: "Ahirbudhnya", symbol: "Twin in the Deep", element: "may", temperament: "Contemplative serenity, enlightened endurance" },
    { name: "Revati", geezName: "ሬቫቲ (መጋቢ ኮከብ)", rulingPlanet: "Mercury", deity: "Pushan", symbol: "Fish / Drum", element: "may", temperament: "Compassionate guidance, safe voyage completion" },
  ];

const ZODIAC_LIST: ZodiacSignName[] = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Vimshottari Dasha Lords and Year Durations (120 years total cycle)
const DASHA_LORDS: { planet: string; years: number }[] = [
  { planet: "Ketu", years: 7 },
  { planet: "Venus", years: 20 },
  { planet: "Sun", years: 6 },
  { planet: "Moon", years: 10 },
  { planet: "Mars", years: 7 },
  { planet: "Rahu", years: 18 },
  { planet: "Jupiter", years: 16 },
  { planet: "Saturn", years: 19 },
  { planet: "Mercury", years: 17 },
];

/**
 * Calculates Lahiri Ayanamsha for a given birth date.
 * At J2000.0 (Jan 1, 2000), Lahiri Ayanamsha was ~23° 51' 25" (23.8569°).
 * Precession rate: ~50.29 arcseconds/year = ~0.01397°/year.
 */
export function calculateLahiriAyanamsha(birthDateStr: string): number {
  const parts = birthDateStr.split("-");
  const year = parseInt(parts[0] || "2000", 10);
  const month = parseInt(parts[1] || "1", 10);
  const day = parseInt(parts[2] || "1", 10);
  const decimalYear = year + (month - 1) / 12 + day / 365;
  const diffYears = decimalYear - 2000;
  return 23.8569 + diffYears * 0.01397;
}

/**
 * Converts Tropical Longitude to Sidereal Longitude using Lahiri Ayanamsha
 */
export function tropicalToSidereal(tropicalLongitude: number, ayanamsha: number): number {
  let sidereal = (tropicalLongitude - ayanamsha) % 360;
  if (sidereal < 0) sidereal += 360;
  return sidereal;
}

/**
 * Identifies Nakshatra and Pada from Sidereal Longitude
 */
export function getNakshatraFromSidereal(siderealLongitude: number): NakshatraInfo {
  const norm = (siderealLongitude % 360 + 360) % 360;
  const nakshatraSpan = 360 / 27; // 13.333333° (13° 20')
  const index = Math.floor(norm / nakshatraSpan);
  const degreeIntoNakshatra = norm % nakshatraSpan;
  const pada = Math.floor(degreeIntoNakshatra / (nakshatraSpan / 4)) + 1;

  const nak = NAKSHATRAS[index] || NAKSHATRAS[0];
  const startDeg = index * nakshatraSpan;
  const endDeg = startDeg + nakshatraSpan;

  return {
    index: index + 1,
    name: nak.name,
    geezName: nak.geezName,
    rulingPlanet: nak.rulingPlanet,
    deity: nak.deity,
    degreeSpan: `${startDeg.toFixed(1)}° – ${endDeg.toFixed(1)}°`,
    pada: Math.min(Math.max(pada, 1), 4),
    element: nak.element,
    symbol: nak.symbol,
    temperament: nak.temperament,
  };
}

/**
 * Calculates Navamsha (D9) sign from Sidereal Longitude
 */
export function getNavamshaSign(siderealLongitude: number): ZodiacSignName {
  const signIndex = Math.floor(siderealLongitude / 30);
  const degInSign = siderealLongitude % 30;
  const navamshaPart = Math.floor(degInSign / (30 / 9)); // 0 to 8

  // Navamsha start sign by element:
  // Fire (0, 4, 8) -> Aries (0)
  // Earth (1, 5, 9) -> Capricorn (9)
  // Air (2, 6, 10) -> Libra (6)
  // Water (3, 7, 11) -> Cancer (3)
  const elementGroup = signIndex % 4;
  let startOffset = 0;
  if (elementGroup === 0) startOffset = 0; // Aries
  else if (elementGroup === 1) startOffset = 9; // Capricorn
  else if (elementGroup === 2) startOffset = 6; // Libra
  else if (elementGroup === 3) startOffset = 3; // Cancer

  const finalSignIndex = (startOffset + navamshaPart) % 12;
  return ZODIAC_LIST[finalSignIndex] || "Aries";
}

const SIGN_LORD: Record<ZodiacSignName, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury",
  Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};

const EXALTATION: Record<string, ZodiacSignName> = {
  Sun: "Aries", Moon: "Taurus", Mars: "Capricorn", Mercury: "Virgo", Jupiter: "Cancer", Venus: "Pisces", Saturn: "Libra",
};

const NATURAL_FRIENDS: Record<string, { friends: string[]; enemies: string[] }> = {
  Sun: { friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"] },
  Moon: { friends: ["Sun", "Mercury"], enemies: [] },
  Mars: { friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"] },
  Mercury: { friends: ["Sun", "Venus"], enemies: ["Moon"] },
  Jupiter: { friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"] },
  Venus: { friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"] },
  Saturn: { friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"] },
};

const CHARA_KARAKAS = [
  "Atmakaraka (soul's aim)",
  "Amatyakaraka (vocation)",
  "Bhratrikaraka (courage, siblings)",
  "Matrikaraka (nurture, home)",
  "Putrakaraka (creativity, children)",
  "Gnatikaraka (obstacles to master)",
  "Darakaraka (partnership)",
];

type Dignity = VedicPlanetaryPlacement["dignity"];

/** Dignity of one of the seven classical planets in a sidereal sign; other points have none. */
export function getVedicDignity(planet: string, sign: ZodiacSignName): Dignity {
  const exalted = EXALTATION[planet];
  if (!exalted) return "Neutral";
  if (sign === exalted) return "Exalted";
  if (ZODIAC_LIST[(ZODIAC_LIST.indexOf(exalted) + 6) % 12] === sign) return "Debilitated";
  const lord = SIGN_LORD[sign];
  if (lord === planet) return "Own Sign";
  const relation = NATURAL_FRIENDS[planet];
  if (relation.friends.includes(lord)) return "Friendly";
  if (relation.enemies.includes(lord)) return "Enemy";
  return "Neutral";
}

const CLASSICAL = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];

function wholeSignHouse(signIndex: number, lagnaSignIndex: number): number {
  return ((signIndex - lagnaSignIndex + 12) % 12) + 1;
}

/**
 * Generates Vedic (Jyotish) placements for all planets including the D1 and D9 charts.
 * Houses are whole-sign bhavas counted from the sidereal Lagna of the birth place and time.
 */
export function calculateVedicChart(
  birthDate: string,
  birthTime: string = "12:00",
  city: string = "Addis Ababa"
): {
  ayanamsha: number;
  d1Placements: VedicPlanetaryPlacement[];
  d9Placements: DivisionalChartPlacement;
  divisionalChartCatalog: { code: string; name: string; purpose: string }[];
  lunarNodes: { name: "Rahu" | "Ketu"; siderealSign: ZodiacSignName; degree: number; nakshatra: NakshatraInfo; house: number }[];
  lagna: { siderealSign: ZodiacSignName; degree: number; nakshatra: NakshatraInfo; lord: string };
} {
  const western = calculateCelestialPositions(birthDate, birthTime, city);
  const ayanamsha = calculateLahiriAyanamsha(birthDate);

  const sidereal = western.planets.map((p) => ({ planet: p, longitude: tropicalToSidereal(p.totalLongitude, ayanamsha) }));
  const lagnaLongitude = sidereal.find((entry) => entry.planet.planet === "Ascendant")?.longitude ?? 0;
  const lagnaSignIndex = Math.floor(lagnaLongitude / 30);

  // Chara karakas: the seven classical planets ranked by degree travelled in their sign.
  const karakaOrder = sidereal
    .filter((entry) => CLASSICAL.includes(entry.planet.planet))
    .sort((a, b) => (b.longitude % 30) - (a.longitude % 30))
    .map((entry) => entry.planet.planet);

  const d1Placements: VedicPlanetaryPlacement[] = sidereal.map(({ planet: p, longitude }) => {
    const signInfo = getSignFromLongitude(longitude);
    const rank = karakaOrder.indexOf(p.planet);
    return {
      planet: p.planet,
      siderealSign: signInfo.sign,
      degree: signInfo.degreeInSign,
      totalLongitude: longitude,
      nakshatra: getNakshatraFromSidereal(longitude),
      house: wholeSignHouse(Math.floor(longitude / 30), lagnaSignIndex),
      isRetrograde: p.isRetrograde,
      dignity: getVedicDignity(p.planet, signInfo.sign),
      karaka: rank >= 0 ? CHARA_KARAKAS[rank] : "—",
    };
  });

  const d9LagnaIndex = ZODIAC_LIST.indexOf(getNavamshaSign(lagnaLongitude));
  const d9Placements: DivisionalChartPlacement = {
    chartCode: "D9",
    chartName: "Navamsha Chakra (Spiritual Dharma & Relational Synergy)",
    purpose: "Reveals the inner soul trajectory, marital harmony, and matured secondary destiny.",
    placements: d1Placements.map((p) => {
      const sign = getNavamshaSign(p.totalLongitude);
      return {
        planet: p.planet,
        sign,
        house: wholeSignHouse(ZODIAC_LIST.indexOf(sign), d9LagnaIndex),
        nakshatra: p.nakshatra.name,
        pada: p.nakshatra.pada,
        dignity: CLASSICAL.includes(p.planet) ? getVedicDignity(p.planet, sign) : undefined,
        vargottama: sign === p.siderealSign,
      };
    }),
  };

  const rahuLongitude = tropicalToSidereal(lunarNodeLongitude(western.julianDay), ayanamsha);
  const lunarNodes = ([["Rahu", rahuLongitude], ["Ketu", (rahuLongitude + 180) % 360]] as const).map(([name, longitude]) => {
    const signInfo = getSignFromLongitude(longitude);
    return {
      name,
      siderealSign: signInfo.sign,
      degree: signInfo.degreeInSign,
      nakshatra: getNakshatraFromSidereal(longitude),
      house: wholeSignHouse(Math.floor(longitude / 30), lagnaSignIndex),
    };
  });

  const lagnaSign = getSignFromLongitude(lagnaLongitude);

  const divisionalChartCatalog = [
    { code: "D1", name: "Rashi Chakra", purpose: "Physical incarnation, general life path, overt personality." },
    { code: "D2", name: "Hora", purpose: "Wealth generation, financial stamina, solar/lunar vitality." },
    { code: "D3", name: "Drekkana", purpose: "Siblings, courage, motivation, third-house initiatives." },
    { code: "D7", name: "Saptamsha", purpose: "Progeny, creative offspring, inherited lineage vitality." },
    { code: "D9", name: "Navamsha", purpose: "Marriage, life partner, spiritual fortitude, destiny after age 32." },
    { code: "D10", name: "Dashamsha", purpose: "Professional status, career zenith, civic leadership." },
    { code: "D12", name: "Dwadashamsha", purpose: "Ancestral karma, maternal and paternal lineage resonance." },
    { code: "D16", name: "Shodashamsha", purpose: "Vehicles, luxury, domestic serenity, subconscious happiness." },
    { code: "D20", name: "Vimshamsha", purpose: "Spiritual practice, meditation, devotion (bhakti), sacred study." },
    { code: "D24", name: "Chaturvimshamsha", purpose: "Higher education, academic brilliance, knowledge retention." },
    { code: "D27", name: "Saptavimshamsha", purpose: "Innate subconscious strengths, vulnerabilities, resilience." },
    { code: "D30", name: "Trimshamsha", purpose: "Misfortunes, wellbeing hazards, karmic debt remediation." },
    { code: "D60", name: "Shashtiamsha", purpose: "Past life karma, root cause of deep recurring life events." },
  ];

  return {
    ayanamsha,
    d1Placements,
    d9Placements,
    divisionalChartCatalog,
    lunarNodes,
    lagna: {
      siderealSign: lagnaSign.sign,
      degree: lagnaSign.degreeInSign,
      nakshatra: getNakshatraFromSidereal(lagnaLongitude),
      lord: SIGN_LORD[lagnaSign.sign],
    },
  };
}

const YEAR_MS = 365.25 * 86400000;

function isoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Vimshottari Dasha from the birth moment and the Moon's sidereal longitude.
 *
 * The first mahadasha is the part still to run of the period ruled by the Moon's nakshatra lord;
 * every mahadasha carries its nine antardashas with real start and end dates.
 */
export function calculateVimshottariDasha(
  birthDateStr: string,
  moonSiderealLongitude: number,
  birthTime: string = "12:00",
  utcOffsetHours: number = 3
): DashaPeriod[] {
  const nak = getNakshatraFromSidereal(moonSiderealLongitude);
  const nakshatraSpan = 360 / 27;
  const fractionElapsed = (((moonSiderealLongitude % 360) + 360) % nakshatraSpan) / nakshatraSpan;

  const lordIndex = DASHA_LORDS.findIndex((d) => d.planet.toLowerCase() === nak.rulingPlanet.toLowerCase());
  const startIndex = lordIndex >= 0 ? lordIndex : 0;

  const [yStr, mStr, dStr] = birthDateStr.split("-");
  const [hStr, minStr] = (birthTime || "12:00").split(":");
  const birthMs = Date.UTC(
    parseInt(yStr || "1990", 10),
    parseInt(mStr || "1", 10) - 1,
    parseInt(dStr || "1", 10),
    (parseInt(hStr || "12", 10) || 0) - utcOffsetHours,
    parseInt(minStr || "0", 10) || 0
  );
  const nowMs = Date.now();

  const periods: DashaPeriod[] = [];
  // Where the first mahadasha would have begun had the person been born at its start.
  let cursor = birthMs - DASHA_LORDS[startIndex].years * fractionElapsed * YEAR_MS;

  for (let i = 0; i < DASHA_LORDS.length; i++) {
    const lordPosition = (startIndex + i) % DASHA_LORDS.length;
    const lord = DASHA_LORDS[lordPosition];
    const mahaStart = cursor;
    const mahaEnd = cursor + lord.years * YEAR_MS;

    const subPeriods: NonNullable<DashaPeriod["subPeriods"]> = [];
    let subCursor = mahaStart;
    for (let k = 0; k < DASHA_LORDS.length; k++) {
      const sub = DASHA_LORDS[(lordPosition + k) % DASHA_LORDS.length];
      const subEnd = subCursor + ((lord.years * sub.years) / 120) * YEAR_MS;
      if (subEnd > birthMs) {
        subPeriods.push({
          planet: sub.planet,
          startDate: isoDate(Math.max(subCursor, birthMs)),
          endDate: isoDate(subEnd),
          isCurrent: nowMs >= subCursor && nowMs < subEnd,
        });
      }
      subCursor = subEnd;
    }

    periods.push({
      planet: lord.planet,
      startDate: isoDate(Math.max(mahaStart, birthMs)),
      endDate: isoDate(mahaEnd),
      isCurrent: nowMs >= Math.max(mahaStart, birthMs) && nowMs < mahaEnd,
      subPeriods,
    });

    cursor = mahaEnd;
  }

  return periods;
}

/** Today's civil date (YYYY-MM-DD) at a fixed UTC offset; East Africa Time by default. */
export function localDateString(utcOffsetHours = 3, when: Date = new Date()): string {
  return new Date(when.getTime() + utcOffsetHours * 3600000).toISOString().slice(0, 10);
}

const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami",
  "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
];

// The five tithi families repeat through each fortnight.
const TITHI_GROUPS = [
  { name: "Nanda", meaning: "a day of gladness: good for beginnings, celebrations and reaching out" },
  { name: "Bhadra", meaning: "a steady day: good for health routines, practical work and agreements" },
  { name: "Jaya", meaning: "a day for overcoming: good for effort, competition and clearing obstacles" },
  { name: "Rikta", meaning: "an emptying day: good for cleaning, ending and letting go rather than starting" },
  { name: "Purna", meaning: "a day of fullness: good for completing, gathering and giving thanks" },
];

const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
];
const CHALLENGING_YOGAS = ["Vishkambha", "Atiganda", "Shula", "Ganda", "Vyaghata", "Vajra", "Vyatipata", "Parigha", "Vaidhriti"];

const MOVABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
const KARANA_DEITY: Record<string, string> = {
  Bava: "Indra", Balava: "Brahma", Kaulava: "Mitra", Taitila: "Aryaman", Gara: "Bhumi (Earth)", Vanija: "Lakshmi",
  Vishti: "Yama", Shakuni: "Kali", Chatushpada: "Rudra", Naga: "the Nagas", Kimstughna: "Vayu",
};

const VAARS = [
  { dayOfWeek: "Sunday", rulingPlanet: "Sun", ethiopianName: "እሑድ (Shems / ፀሐይ)" },
  { dayOfWeek: "Monday", rulingPlanet: "Moon", ethiopianName: "ሰኞ (Qemer / ጨረቃ)" },
  { dayOfWeek: "Tuesday", rulingPlanet: "Mars", ethiopianName: "ማክሰኞ (Merikh / ማርስ)" },
  { dayOfWeek: "Wednesday", rulingPlanet: "Mercury", ethiopianName: "ረቡዕ (Utarid / ሜርኩሪ)" },
  { dayOfWeek: "Thursday", rulingPlanet: "Jupiter", ethiopianName: "ሐሙስ (Mushtari / ጁፒተር)" },
  { dayOfWeek: "Friday", rulingPlanet: "Venus", ethiopianName: "ዓርብ (Zuhara / ቬነስ)" },
  { dayOfWeek: "Saturday", rulingPlanet: "Saturn", ethiopianName: "ቅዳሜ (Zuhal / ሳተርን)" },
];

// Which eighth of the daytime is Rahu Kalam, by weekday (Sunday first).
const RAHU_KALAM_SEGMENT = [8, 2, 7, 5, 6, 4, 3];

function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map((part) => parseInt(part, 10));
  return new Date(Date.UTC(y || 2000, (m || 1) - 1, d || 1)).getUTCDay();
}

function moonPhaseName(elongation: number): string {
  if (elongation < 6 || elongation > 354) return "New Moon";
  if (elongation < 84) return "Waxing Crescent";
  if (elongation < 96) return "First Quarter";
  if (elongation < 174) return "Waxing Gibbous";
  if (elongation < 186) return "Full Moon";
  if (elongation < 264) return "Waning Gibbous";
  if (elongation < 276) return "Last Quarter";
  return "Waning Crescent";
}

/**
 * The five limbs of the Panchang for a civil date, taken at sunrise at the given place.
 * Sunrise, sunset, Abhijit Muhurta and Rahu Kalam are computed for that place's coordinates.
 */
export function calculatePanchang(dateStr: string = localDateString(), cityKey: string = "Addis Ababa"): PanchangData {
  const place = resolveBirthPlace(cityKey);
  const day = solarDay(dateStr, place.latitude, place.longitude, place.utcOffsetHours);
  const sunriseClock = `${String(Math.floor(day.sunrise)).padStart(2, "0")}:${String(Math.floor((day.sunrise % 1) * 60)).padStart(2, "0")}`;
  const jd = julianDayFromLocal(dateStr, sunriseClock, place.utcOffsetHours);
  const ayanamsha = calculateLahiriAyanamsha(dateStr);

  const sunLong = tropicalToSidereal(bodyLongitude("Sun", jd), ayanamsha);
  const moonLong = tropicalToSidereal(bodyLongitude("Moon", jd), ayanamsha);

  // Tithi: every 12° the Moon gains on the Sun.
  const diff = (moonLong - sunLong + 360) % 360;
  const tithiIndex = Math.floor(diff / 12) + 1;
  const isShukla = tithiIndex <= 15;
  const inFortnight = ((tithiIndex - 1) % 15) + 1;
  const tithiName = inFortnight === 15 ? (isShukla ? "Purnima (Full Moon)" : "Amavasya (New Moon)") : TITHI_NAMES[inFortnight - 1];
  const group = TITHI_GROUPS[(inFortnight - 1) % 5];

  const nakshatra = getNakshatraFromSidereal(moonLong);

  // Yoga: the sum of the two longitudes in 13°20' steps.
  const yogaIndex = Math.floor(((sunLong + moonLong) % 360) / (360 / 27)) + 1;
  const yogaName = YOGA_NAMES[yogaIndex - 1] || "Priti";

  // Karana: half a tithi. Four fixed karanas frame the month; seven movable ones repeat between them.
  const karanaIndex = Math.floor(diff / 6);
  const karanaName =
    karanaIndex === 0 ? "Kimstughna" : karanaIndex === 57 ? "Shakuni" : karanaIndex === 58 ? "Chatushpada" : karanaIndex === 59 ? "Naga" : MOVABLE_KARANAS[(karanaIndex - 1) % 7];

  const weekday = weekdayOf(dateStr);
  const vaar = VAARS[weekday];

  const muhurta = day.dayLengthHours / 15;
  const eighth = day.dayLengthHours / 8;
  const rahuStart = day.sunrise + (RAHU_KALAM_SEGMENT[weekday] - 1) * eighth;

  return {
    tithi: {
      number: tithiIndex,
      name: `${tithiName} (${isShukla ? "Shukla Paksha" : "Krishna Paksha"})`,
      paksha: isShukla ? "Shukla (Waxing)" : "Krishna (Waning)",
      meaning: `${group.name} tithi — ${group.meaning}.`,
    },
    nakshatra,
    yoga: {
      number: yogaIndex,
      name: yogaName,
      auspiciousness: CHALLENGING_YOGAS.includes(yogaName) ? "Challenging" : "Auspicious",
    },
    karana: {
      number: karanaIndex + 1,
      name: karanaName,
      rulingDeity: KARANA_DEITY[karanaName] || "—",
    },
    vaar,
    sunrise: `${formatClock(day.sunrise)} EAT`,
    sunset: `${formatClock(day.sunset)} EAT`,
    auspiciousPeriod: `Abhijit Muhurta: ${formatClock(day.solarNoon - muhurta / 2)} – ${formatClock(day.solarNoon + muhurta / 2)}`,
    date: dateStr,
    location: { city: place.city, latitude: place.latitude, longitude: place.longitude, matched: place.matched },
    rahuKalam: `${formatClock(rahuStart)} – ${formatClock(rahuStart + eighth)}`,
    dayLength: `${Math.floor(Math.round(day.dayLengthHours * 60) / 60)}h ${String(Math.round(day.dayLengthHours * 60) % 60).padStart(2, "0")}m`,
    moonPhase: { name: moonPhaseName(diff), illumination: Math.round(moonIllumination(diff) * 100) },
  };
}

const TARA_BALA = [
  { name: "Janma", favourable: false, meaning: "the Moon returns to your birth star: a sensitive day — keep plans simple and look after your body" },
  { name: "Sampat", favourable: true, meaning: "the star of gain: a good day for requests, earnings and practical progress" },
  { name: "Vipat", favourable: false, meaning: "the star of obstacles: avoid risks and double-check arrangements" },
  { name: "Kshema", favourable: true, meaning: "the star of wellbeing: a good day for rest, care routines and settling matters" },
  { name: "Pratyak", favourable: false, meaning: "the star of opposition: expect friction and postpone confrontations" },
  { name: "Sadhana", favourable: true, meaning: "the star of accomplishment: a good day for study, practice and sustained effort" },
  { name: "Naidhana", favourable: false, meaning: "the star of endings: rest, finish what is open and avoid major new starts" },
  { name: "Mitra", favourable: true, meaning: "the friendly star: a good day for meetings, visits and asking for help" },
  { name: "Parama Mitra", favourable: true, meaning: "the star of the great friend: support comes easily — a good day for most undertakings" },
];

/**
 * How today's Moon stands in relation to one person's birth Moon (Tara Bala and Chandra Bala),
 * and which house of their chart it is passing through.
 */
export function calculatePersonalDayAlignment(
  natal: { moonSiderealLongitude: number; ascendantTropicalLongitude: number },
  when: Date = new Date()
): PersonalDayAlignment {
  const jd = julianDayFromDate(when);
  const date = localDateString(3, when);
  const ayanamsha = calculateLahiriAyanamsha(date);
  const moonTropical = bodyLongitude("Moon", jd);
  const moonSidereal = tropicalToSidereal(moonTropical, ayanamsha);
  const elongation = (moonTropical - bodyLongitude("Sun", jd) + 360) % 360;

  const birthStar = getNakshatraFromSidereal(natal.moonSiderealLongitude);
  const todayStar = getNakshatraFromSidereal(moonSidereal);
  const count = ((todayStar.index - birthStar.index + 27) % 27) + 1;
  const tara = TARA_BALA[(count - 1) % 9];

  const natalMoonSign = Math.floor(natal.moonSiderealLongitude / 30);
  const todayMoonSign = Math.floor(moonSidereal / 30);
  const fromNatalMoon = ((todayMoonSign - natalMoonSign + 12) % 12) + 1;
  const strong = [1, 3, 6, 7, 10, 11].includes(fromNatalMoon);
  const weak = [4, 8, 12].includes(fromNatalMoon);

  const natalHouse = Math.floor((((moonTropical - natal.ascendantTropicalLongitude) % 360) + 360) % 360 / 30) + 1;
  const tropicalSign = getSignFromLongitude(moonTropical).sign;

  return {
    date,
    birthStar: { name: birthStar.name, geezName: birthStar.geezName, pada: birthStar.pada, rulingPlanet: birthStar.rulingPlanet, temperament: birthStar.temperament },
    moonToday: {
      tropicalSign,
      siderealSign: ZODIAC_LIST[todayMoonSign],
      nakshatra: todayStar.name,
      nakshatraGeez: todayStar.geezName,
      natalHouse,
      houseTheme: HOUSE_THEMES[natalHouse],
    },
    phase: { name: moonPhaseName(elongation), illumination: Math.round(moonIllumination(elongation) * 100), waxing: elongation < 180 },
    taraBala: { count, name: tara.name, favourable: tara.favourable, meaning: `Counting from ${birthStar.name}, today's ${todayStar.name} is star ${count} — ${tara.meaning}.` },
    chandraBala: {
      houseFromNatalMoon: fromNatalMoon,
      strength: strong ? "strong" : weak ? "low" : "moderate",
      meaning: strong
        ? `The Moon is in the ${ordinal(fromNatalMoon)} sign from your birth Moon: your mind is steady and your judgement can be trusted today.`
        : weak
          ? `The Moon is in the ${ordinal(fromNatalMoon)} sign from your birth Moon: emotional reserves run lower — pace yourself and delay weighty decisions.`
          : `The Moon is in the ${ordinal(fromNatalMoon)} sign from your birth Moon: an ordinary day for the mind — routine matters go best.`,
    },
  };
}

const PLANET_DIRECTION: Record<string, string> = {
  Sun: "East", Venus: "South-East", Mars: "South", Saturn: "West", Moon: "North-West", Mercury: "North", Jupiter: "North-East",
};
const ELEMENT_DIRECTION: Record<HumoralElement, string> = { esat: "East", afere: "South", nifas: "West", may: "North" };
const CHALDEAN_ORDER = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];

const PRASHNA_TOPICS: { house: number; topic: string; words: string[] }[] = [
  { house: 6, topic: "wellbeing & Recovery", words: ["wellbeing", "sick", "cure", "doctor", "health", "illness", "pain", "heal", "recover"] },
  { house: 7, topic: "Partnership & Affection", words: ["love", "marry", "marriage", "partner", "relationship", "husband", "wife", "spouse"] },
  { house: 10, topic: "Career & Vocation", words: ["job", "work", "career", "business", "promotion", "boss"] },
  { house: 2, topic: "Financial Flow", words: ["money", "wealth", "buy", "sell", "salary", "loan", "debt", "invest"] },
  { house: 9, topic: "Travel & New Horizons", words: ["travel", "journey", "flight", "move", "abroad", "visa", "study", "exam", "school", "university"] },
  { house: 4, topic: "Home & Family", words: ["house", "home", "land", "rent", "family", "mother", "property"] },
  { house: 5, topic: "Children & Creativity", words: ["child", "children", "pregnan", "baby", "son", "daughter", "creative"] },
  { house: 11, topic: "Friends & Gains", words: ["friend", "community", "profit", "gain", "win"] },
];

/** The next planetary hour ruled by `planet` at a place, starting from `when`. */
function nextPlanetaryHour(planet: string, place: { latitude: number; longitude: number; utcOffsetHours: number }, when: Date): string | null {
  const nowHours = ((when.getTime() / 3600000 + place.utcOffsetHours) % 24 + 24) % 24;
  let dateStr = localDateString(place.utcOffsetHours, when);
  let day = solarDay(dateStr, place.latitude, place.longitude, place.utcOffsetHours);
  let clock = nowHours;
  if (nowHours < day.sunrise) {
    // Before dawn the hours still belong to the previous day.
    dateStr = localDateString(place.utcOffsetHours, new Date(when.getTime() - 86400000));
    day = solarDay(dateStr, place.latitude, place.longitude, place.utcOffsetHours);
    clock = nowHours + 24;
  }
  const dayHour = day.dayLengthHours / 12;
  const nightHour = (24 - day.dayLengthHours) / 12;
  let lordIndex = CHALDEAN_ORDER.indexOf(VAARS[weekdayOf(dateStr)].rulingPlanet);
  let start = day.sunrise;
  for (let hour = 0; hour < 24; hour++) {
    const length = hour < 12 ? dayHour : nightHour;
    const end = start + length;
    if (CHALDEAN_ORDER[lordIndex] === planet && end > clock) {
      return `${formatClock(Math.max(start, clock))} – ${formatClock(end)}`;
    }
    start = end;
    lordIndex = (lordIndex + 1) % 7;
  }
  return null;
}

/**
 * Prashna Kundli (Horary Astrology) Engine
 * Casts a chart for the moment a question is asked, at the place it is asked, and reads the
 * house that governs the matter. Every statement in the answer names the placement it rests on.
 */
export function generatePrashnaKundli(
  question: string,
  city: string = "Addis Ababa",
  latitude: number = 9.03,
  longitude: number = 38.74
): PrashnaKundliResult {
  const now = new Date();
  const resolved = resolveBirthPlace(city);
  const place = resolved.matched ? resolved : { ...resolved, city: city || resolved.city, latitude, longitude };

  const jd = julianDayFromDate(now);
  const dateStr = localDateString(place.utcOffsetHours, now);
  const localHours = ((now.getTime() / 3600000 + place.utcOffsetHours) % 24 + 24) % 24;
  const timeStr = `${String(Math.floor(localHours)).padStart(2, "0")}:${String(Math.floor((localHours % 1) * 60)).padStart(2, "0")}`;

  const ayanamsha = calculateLahiriAyanamsha(dateStr);
  const siderealAscLong = tropicalToSidereal(chartAngles(jd, place.latitude, place.longitude).ascendant, ayanamsha);
  const ascInfo = getSignFromLongitude(siderealAscLong);
  const ascSign = ascInfo.sign;
  const lagnaIndex = Math.floor(siderealAscLong / 30);
  const nak = getNakshatraFromSidereal(siderealAscLong);

  // Where the seven classical planets stand at this moment, by whole-sign house from the Prashna Lagna.
  const sky = new Map<string, { sign: ZodiacSignName; house: number }>();
  for (const position of allBodyPositions(jd)) {
    if (!CLASSICAL.includes(position.body)) continue;
    const sid = tropicalToSidereal(position.longitude, ayanamsha);
    sky.set(position.body, { sign: getSignFromLongitude(sid).sign, house: wholeSignHouse(Math.floor(sid / 30), lagnaIndex) });
  }
  const elongation = (bodyLongitude("Moon", jd) - bodyLongitude("Sun", jd) + 360) % 360;
  const waxing = elongation < 180;

  // The house that governs the matter (Karya Bhava).
  const qLower = question.toLowerCase();
  const matched = PRASHNA_TOPICS.find((entry) => entry.words.some((word) => qLower.includes(word)));
  const karyaBhava = matched?.house ?? 1;
  const topic = matched?.topic ?? "General Endeavor & Vitality";

  const karyaSign = ZODIAC_LIST[(lagnaIndex + karyaBhava - 1) % 12];
  const karyaLord = SIGN_LORD[karyaSign];
  const lagnaLord = SIGN_LORD[ascSign];
  const karyaLordPlace = sky.get(karyaLord)!;
  const lagnaLordPlace = sky.get(lagnaLord)!;
  const moonPlace = sky.get("Moon")!;

  const reasoning: string[] = [];
  let score = 0;
  const weigh = (points: number, line: string) => {
    score += points;
    reasoning.push(`${points > 0 ? "+" : points < 0 ? "−" : "•"} ${line}`);
  };
  const houseQuality = (house: number) => ([1, 4, 7, 10].includes(house) ? 2 : [5, 9].includes(house) ? 2 : [6, 8, 12].includes(house) ? -2 : house === 11 ? 1 : 0);
  const describeHouse = (house: number) =>
    [1, 4, 7, 10].includes(house) ? "an angular house, where planets act strongly" : [5, 9].includes(house) ? "a house of fortune" : [6, 8, 12].includes(house) ? "a difficult house" : house === 11 ? "the house of gains" : "a neutral house";

  weigh(houseQuality(karyaLordPlace.house), `${karyaLord}, lord of the ${ordinal(karyaBhava)} house of the matter (${karyaSign}), is in ${karyaLordPlace.sign} in the ${ordinal(karyaLordPlace.house)} house — ${describeHouse(karyaLordPlace.house)}.`);
  const karyaDignity = getVedicDignity(karyaLord, karyaLordPlace.sign);
  if (["Exalted", "Own Sign", "Friendly"].includes(karyaDignity)) weigh(1, `${karyaLord} is ${karyaDignity.toLowerCase()} there, so it can deliver.`);
  if (["Debilitated", "Enemy"].includes(karyaDignity)) weigh(-1, `${karyaLord} is ${karyaDignity === "Enemy" ? "in an enemy's sign" : "debilitated"} there, so results come with effort.`);
  if (lagnaLord !== karyaLord) {
    weigh(houseQuality(lagnaLordPlace.house) > 0 ? 1 : houseQuality(lagnaLordPlace.house) < 0 ? -1 : 0, `${lagnaLord}, lord of the rising sign ${ascSign} (you, the asker), is in the ${ordinal(lagnaLordPlace.house)} house — ${describeHouse(lagnaLordPlace.house)}.`);
    const relation = NATURAL_FRIENDS[lagnaLord];
    if (relation.friends.includes(karyaLord)) weigh(1, `${lagnaLord} and ${karyaLord} are natural friends: you and the matter are in sympathy.`);
    else if (relation.enemies.includes(karyaLord)) weigh(-1, `${lagnaLord} and ${karyaLord} are natural enemies: expect to negotiate for what you want.`);
  } else {
    weigh(1, `${lagnaLord} rules both you and the matter, so the outcome lies largely in your own hands.`);
  }
  weigh(waxing ? 1 : -1, `The Moon is ${waxing ? "waxing" : "waning"} (${Math.round(moonIllumination(elongation) * 100)}% lit) in ${moonPlace.sign}, the ${ordinal(moonPlace.house)} house: ${waxing ? "the matter is growing" : "the matter is winding down or needs finishing first"}.`);
  for (const benefic of ["Jupiter", "Venus"]) {
    if (sky.get(benefic)!.house === karyaBhava) weigh(1, `${benefic} occupies the house of the matter and protects it.`);
  }
  for (const malefic of ["Saturn", "Mars"]) {
    if (sky.get(malefic)!.house === karyaBhava && malefic !== karyaLord) weigh(-1, `${malefic} occupies the house of the matter and ${malefic === "Saturn" ? "delays" : "heats"} it.`);
  }

  const verdict =
    score >= 3
      ? `The chart for this moment favours ${topic}.`
      : score >= 1
        ? `The chart for this moment leans in favour of ${topic}, with conditions.`
        : score >= -1
          ? `The chart for this moment is evenly balanced on ${topic}: the result depends on how you proceed.`
          : `The chart for this moment advises patience on ${topic}.`;

  const hour = nextPlanetaryHour(karyaLord, place, now);

  return {
    question,
    queryTimestamp: `${dateStr} ${timeStr} EAT`,
    location: { city: place.city, latitude: place.latitude, longitude: place.longitude },
    prashnaAscendant: {
      sign: ascSign,
      degree: Number((siderealAscLong % 30).toFixed(2)),
      nakshatra: nak.name,
    },
    karyaBhava,
    rulingPlanet: karyaLord,
    outcomePrediction: `${verdict} ${reasoning[0].slice(2)}`,
    confidenceScore: Math.max(52, Math.min(93, 60 + Math.abs(score) * 6)),
    favorableDirections: Array.from(new Set([PLANET_DIRECTION[karyaLord], ELEMENT_DIRECTION[ascInfo.element]])).map((direction, index) => `${direction} (${index === 0 ? `direction of ${karyaLord}` : `${ascSign} rising`})`),
    auspiciousTimingRecommendation: hour
      ? `Next hour of ${karyaLord} at ${place.city}: ${hour}.`
      : `No hour of ${karyaLord} remains before sunrise at ${place.city}; act after dawn.`,
    topic,
    score,
    reasoning,
  };
}

/**
 * Calculates a personalized daily, weekly, or monthly transit horoscope based on natal chart positions
 */
export function calculatePersonalizedHoroscope(
  birthDate: string,
  birthTime: string = "12:00",
  city: string = "Addis Ababa",
  period: "daily" | "weekly" | "monthly" = "daily"
): DetailedHoroscope {
  const natal = calculateCelestialPositions(birthDate, birthTime, city);
  const now = new Date();
  const todayStr = localDateString(natal.place.utcOffsetHours, now);

  const sun = natal.planets.find((p) => p.planet === "Sun")!;
  const moon = natal.planets.find((p) => p.planet === "Moon")!;
  const ascendant = natal.planets.find((p) => p.planet === "Ascendant")!;

  // Fast contacts matter for a day; the slow planets set the tone of a month.
  const fast: string[] = ["Sun", "Mercury", "Venus", "Mars"];
  const all = calculateTransits(natal.planets, now, 12);
  const ranked =
    period === "daily"
      ? [...all].sort((a, b) => Number(fast.includes(b.transitingPlanet)) - Number(fast.includes(a.transitingPlanet)))
      : period === "monthly"
        ? all.filter((t) => !fast.includes(t.transitingPlanet) || t.transitingPlanet === "Mars")
        : all;
  const activeTransits: TransitForecastItem[] = (ranked.length ? ranked : all).slice(0, 4);

  const ayanamsha = calculateLahiriAyanamsha(birthDate);
  const alignment = calculatePersonalDayAlignment(
    { moonSiderealLongitude: tropicalToSidereal(moon.totalLongitude, ayanamsha), ascendantTropicalLongitude: ascendant.totalLongitude },
    now
  );

  const supportive = all.filter((t) => t.nature === "harmonious").length;
  const testing = all.filter((t) => t.nature === "challenging").length;
  const vitality = 74 + (supportive - testing) * 3 + (alignment.taraBala.favourable ? 4 : -3) + (alignment.chandraBala.strength === "strong" ? 4 : alignment.chandraBala.strength === "low" ? -4 : 0);

  const lead = activeTransits[0];
  const pick = (targets: string[], fallback: string) => {
    const hit = all.find((t) => targets.includes(t.targetPlanetOrPoint));
    return hit ? `${hit.headline}. ${hit.balancingAdvice}` : fallback;
  };

  const overview =
    period === "daily"
      ? `Today the Moon is in ${alignment.moonToday.tropicalSign}, crossing your ${ordinal(alignment.moonToday.natalHouse)} house of ${alignment.moonToday.houseTheme}. ${alignment.taraBala.meaning}`
      : lead
        ? `${period === "weekly" ? "This week" : "This month"} the leading influence on your chart is: ${lead.wellbeingForecast}`
        : `${period === "weekly" ? "This week" : "This month"} no major planet is in close aspect to your chart: a quiet stretch in which your own routines set the tone.`;

  return {
    period,
    targetDate: todayStr,
    sunSign: sun.sign,
    moonSign: moon.sign,
    risingSign: natal.ascendant.sign,
    overview,
    vitalityScore: Math.max(45, Math.min(vitality, 98)),
    focusAreas: {
      physicalWellness: pick(["Ascendant", "Sun", "Mars"], `No planet is pressing on your Sun, Mars or ${natal.ascendant.sign} Ascendant: keep to the routines that already suit you.`),
      emotionalEquilibrium: pick(["Moon"], alignment.chandraBala.meaning),
      purposeAndCareer: pick(["Midheaven", "Saturn", "Jupiter"], `Your ${natal.midheaven.sign} Midheaven is undisturbed: steady, unhurried work suits this period.`),
      socialAndRelational: pick(["Venus", "Mercury"], `Your natal Venus and Mercury are free of strong contacts: relationships follow their usual rhythm.`),
    },
    planetaryTransitsActive: activeTransits,
    auspiciousHours: `Hours of ${SIGN_LORD[natal.ascendant.sign]}, ruler of your ${natal.ascendant.sign} Ascendant: ${nextPlanetaryHour(SIGN_LORD[natal.ascendant.sign], natal.place, now) ?? "after sunrise tomorrow"}.`,
    cautionaryAdvice:
      all.find((t) => t.nature === "challenging")?.balancingAdvice ??
      (alignment.taraBala.favourable ? "No testing aspect is active; the main risk is doing too much because things feel easy." : alignment.taraBala.meaning),
  };
}
