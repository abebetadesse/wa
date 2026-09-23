/**
 * Vedic Astrology (Jyotish), Divisional Charts, Vimshottari Dasha, and Panchang Engine
 * Inspired by AstroSage Kundli & Time Passages
 */

import {
  CelestialBody,
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
  PrashnaKundliResult,
  VedicPlanetaryPlacement,
} from "../extendedTypes";
import { calculateCelestialPositions, getSignFromLongitude } from "./chartCalculator";

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

/**
 * Generates Vedic (Jyotish) Placements for all planets including D1 and D9 charts
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
} {
  const western = calculateCelestialPositions(birthDate, birthTime, city);
  const ayanamsha = calculateLahiriAyanamsha(birthDate);

  const d1Placements: VedicPlanetaryPlacement[] = western.planets.map((p) => {
    const siderealLong = tropicalToSidereal(p.totalLongitude, ayanamsha);
    const siderealSignInfo = getSignFromLongitude(siderealLong);
    const nakshatra = getNakshatraFromSidereal(siderealLong);

    // Simple dignity estimation
    let dignity: VedicPlanetaryPlacement["dignity"] = "Neutral";
    if (p.planet === "Sun" && siderealSignInfo.sign === "Aries") dignity = "Exalted";
    else if (p.planet === "Sun" && siderealSignInfo.sign === "Libra") dignity = "Debilitated";
    else if (p.planet === "Moon" && siderealSignInfo.sign === "Taurus") dignity = "Exalted";
    else if (p.planet === "Moon" && siderealSignInfo.sign === "Scorpio") dignity = "Debilitated";
    else if (p.planet === "Mars" && siderealSignInfo.sign === "Capricorn") dignity = "Exalted";
    else if (p.planet === "Jupiter" && siderealSignInfo.sign === "Cancer") dignity = "Exalted";
    else if (p.planet === "Venus" && siderealSignInfo.sign === "Pisces") dignity = "Exalted";
    else if (p.planet === "Saturn" && siderealSignInfo.sign === "Libra") dignity = "Exalted";
    else dignity = "Own Sign";

    return {
      planet: p.planet,
      siderealSign: siderealSignInfo.sign,
      degree: siderealSignInfo.degreeInSign,
      totalLongitude: siderealLong,
      nakshatra,
      house: p.house,
      isRetrograde: p.isRetrograde,
      dignity,
      karaka: p.planet === "Sun" ? "Atmakaraka (Soul)" : "Amatyakaraka (Counsel)",
    };
  });

  const d9Placements: DivisionalChartPlacement = {
    chartCode: "D9",
    chartName: "Navamsha Chakra (Spiritual Dharma & Relational Synergy)",
    purpose: "Reveals the inner soul trajectory, marital harmony, and matured secondary destiny.",
    placements: d1Placements.map((p) => ({
      planet: p.planet,
      sign: getNavamshaSign(p.totalLongitude),
      house: ((ZODIAC_LIST.indexOf(getNavamshaSign(p.totalLongitude)) + 1) % 12) + 1,
    })),
  };

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
  };
}

/**
 * Calculates Vimshottari Dasha periods starting from birth date and Moon's Nakshatra
 */
export function calculateVimshottariDasha(birthDateStr: string, moonSiderealLongitude: number): DashaPeriod[] {
  const nak = getNakshatraFromSidereal(moonSiderealLongitude);
  const nakshatraSpan = 360 / 27; // 13.3333°
  const degreeIntoNak = moonSiderealLongitude % nakshatraSpan;
  const fractionElapsed = degreeIntoNak / nakshatraSpan;
  const fractionRemaining = 1 - fractionElapsed;

  // Find index of starting Dasha lord
  const lordIndex = DASHA_LORDS.findIndex((d) => d.planet.toLowerCase() === nak.rulingPlanet.toLowerCase());
  const startIndex = lordIndex >= 0 ? lordIndex : 0;

  const [yStr, mStr, dStr] = birthDateStr.split("-");
  const birthYear = parseInt(yStr || "1990", 10);
  const birthMonth = parseInt(mStr || "1", 10);
  const birthDay = parseInt(dStr || "1", 10);

  const periods: DashaPeriod[] = [];
  let currentYear = birthYear + (birthMonth - 1) / 12 + birthDay / 365;
  const nowYear = new Date().getFullYear() + new Date().getMonth() / 12;

  // Initial balance of first Dasha
  const firstLord = DASHA_LORDS[startIndex];
  const initialDuration = firstLord.years * fractionRemaining;
  const firstEndYear = currentYear + initialDuration;

  periods.push({
    planet: firstLord.planet,
    startDate: `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`,
    endDate: `${Math.floor(firstEndYear)}-${String(birthMonth).padStart(2, "0")}-01`,
    isCurrent: nowYear >= currentYear && nowYear < firstEndYear,
  });

  currentYear = firstEndYear;

  // Next 8 cycles
  for (let i = 1; i < 9; i++) {
    const nextLord = DASHA_LORDS[(startIndex + i) % DASHA_LORDS.length];
    const endYear = currentYear + nextLord.years;
    const isCurrent = nowYear >= currentYear && nowYear < endYear;

    periods.push({
      planet: nextLord.planet,
      startDate: `${Math.floor(currentYear)}-01-01`,
      endDate: `${Math.floor(endYear)}-01-01`,
      isCurrent,
      subPeriods: isCurrent
        ? [
          { planet: nextLord.planet, startDate: `${Math.floor(currentYear)}-01-01`, endDate: `${Math.floor(currentYear + nextLord.years * 0.3)}-01-01`, isCurrent: true },
          { planet: "Jupiter", startDate: `${Math.floor(currentYear + nextLord.years * 0.3)}-01-01`, endDate: `${Math.floor(endYear)}-01-01`, isCurrent: false },
        ]
        : undefined,
    });

    currentYear = endYear;
  }

  return periods;
}

/**
 * Calculates traditional 5-limb Panchang for given date and time
 */
export function calculatePanchang(dateStr: string = new Date().toISOString().slice(0, 10), cityKey: string = "Addis Ababa"): PanchangData {
  const positions = calculateCelestialPositions(dateStr, "12:00", cityKey);
  const ayanamsha = calculateLahiriAyanamsha(dateStr);

  const sunLong = tropicalToSidereal(positions.planets.find((p) => p.planet === "Sun")?.totalLongitude || 0, ayanamsha);
  const moonLong = tropicalToSidereal(positions.planets.find((p) => p.planet === "Moon")?.totalLongitude || 0, ayanamsha);

  // Tithi: (Moon - Sun) / 12 degrees
  let diff = moonLong - sunLong;
  if (diff < 0) diff += 360;
  const tithiIndex = Math.floor(diff / 12) + 1;
  const isShukla = tithiIndex <= 15;
  const tithiNames = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", isShukla ? "Purnima (Full Moon)" : "Amavasya (New Moon)"
  ];
  const tithiName = tithiNames[(tithiIndex - 1) % 15] || "Pratipada";

  // Nakshatra of the Moon
  const nakshatra = getNakshatraFromSidereal(moonLong);

  // Yoga: (Sun + Moon) / 13° 20'
  const yogaSum = (sunLong + moonLong) % 360;
  const yogaIndex = Math.floor(yogaSum / (360 / 27)) + 1;
  const YOGA_NAMES = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
    "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
    "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
    "Indra", "Vaidhriti"
  ];
  const yogaName = YOGA_NAMES[(yogaIndex - 1) % 27] || "Priti";
  const isAuspiciousYoga = ["Priti", "Ayushman", "Saubhagya", "Shobhana", "Sukarma", "Harshana", "Siddhi", "Shiva", "Shubha", "Brahma"].includes(yogaName);

  // Karana: half tithi (6 degrees)
  const karanaIndex = Math.floor(diff / 6) + 1;
  const KARANA_NAMES = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"];
  const karanaName = KARANA_NAMES[(karanaIndex - 1) % KARANA_NAMES.length] || "Bava";

  // Vaar (Day of week)
  const dateObj = new Date(dateStr);
  const dayIndex = dateObj.getDay(); // 0 = Sunday
  const VAARS = [
    { dayOfWeek: "Sunday", rulingPlanet: "Sun", ethiopianName: "እሑድ (Shems / ፀሐይ)" },
    { dayOfWeek: "Monday", rulingPlanet: "Moon", ethiopianName: "ሰኞ (Qemer / ጨረቃ)" },
    { dayOfWeek: "Tuesday", rulingPlanet: "Mars", ethiopianName: "ማክሰኞ (Merikh / ማርስ)" },
    { dayOfWeek: "Wednesday", rulingPlanet: "Mercury", ethiopianName: "ረቡዕ (Utarid / ሜርኩሪ)" },
    { dayOfWeek: "Thursday", rulingPlanet: "Jupiter", ethiopianName: "ሐሙስ (Mushtari / ጁፒተር)" },
    { dayOfWeek: "Friday", rulingPlanet: "Venus", ethiopianName: "ዓርብ (Zuhara / ቬነስ)" },
    { dayOfWeek: "Saturday", rulingPlanet: "Saturn", ethiopianName: "ቅዳሜ (Zuhal / ሳተርን)" },
  ];
  const vaar = VAARS[dayIndex] || VAARS[0];

  return {
    tithi: {
      number: tithiIndex,
      name: `${tithiName} (${isShukla ? "Shukla Paksha" : "Krishna Paksha"})`,
      paksha: isShukla ? "Shukla (Waxing)" : "Krishna (Waning)",
      meaning: isShukla ? "Favorable for constructive expansion, nourishment, and beginnings." : "Favorable for introspection, detox, and completing cycles.",
    },
    nakshatra,
    yoga: {
      number: yogaIndex,
      name: yogaName,
      auspiciousness: isAuspiciousYoga ? "Auspicious" : "Neutral",
    },
    karana: {
      number: karanaIndex,
      name: karanaName,
      rulingDeity: "Vedic & Ethiopian Celestial Regents",
    },
    vaar,
    sunrise: "06:18 AM EAT",
    sunset: "06:34 PM EAT",
    auspiciousPeriod: "Abhijit Muhurta: 11:45 AM – 12:35 PM",
  };
}

/**
 * Prashna Kundli (Horary Astrology) Engine
 * Casts a chart for a specific query question, instant timestamp, and GPS location.
 */
export function generatePrashnaKundli(
  question: string,
  city: string = "Addis Ababa",
  latitude: number = 9.03,
  longitude: number = 38.74
): PrashnaKundliResult {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const chart = calculateCelestialPositions(dateStr, timeStr, city);
  const ayanamsha = calculateLahiriAyanamsha(dateStr);
  const siderealAscLong = tropicalToSidereal(chart.ascendant.degree, ayanamsha);
  const ascSign = getSignFromLongitude(siderealAscLong).sign;
  const nak = getNakshatraFromSidereal(siderealAscLong);

  // Determine query category and relevant house (Karya Bhava)
  const qLower = question.toLowerCase();
  let karyaBhava = 1;
  let topic = "General Endeavor & Vitality";

  if (qLower.includes("wellbeing") || qLower.includes("sick") || qLower.includes("cure") || qLower.includes("doctor")) {
    karyaBhava = 6;
    topic = "wellbeing & Recovery";
  } else if (qLower.includes("love") || qLower.includes("marry") || qLower.includes("partner") || qLower.includes("relationship")) {
    karyaBhava = 7;
    topic = "Partnership & Affection";
  } else if (qLower.includes("job") || qLower.includes("work") || qLower.includes("career") || qLower.includes("business")) {
    karyaBhava = 10;
    topic = "Career & Vocation";
  } else if (qLower.includes("money") || qLower.includes("wealth") || qLower.includes("buy") || qLower.includes("sell")) {
    karyaBhava = 2;
    topic = "Financial Flow";
  } else if (qLower.includes("travel") || qLower.includes("journey") || qLower.includes("flight") || qLower.includes("move")) {
    karyaBhava = 9;
    topic = "Travel & New Horizons";
  }

  // Calculate planetary indicator
  const rulingLord = nak.rulingPlanet;
  const isFavorable = ["Jupiter", "Venus", "Moon", "Sun"].includes(rulingLord);

  return {
    question,
    queryTimestamp: `${dateStr} ${timeStr} EAT`,
    location: { city, latitude, longitude },
    prashnaAscendant: {
      sign: ascSign,
      degree: Number((siderealAscLong % 30).toFixed(2)),
      nakshatra: nak.name,
    },
    karyaBhava,
    rulingPlanet: rulingLord,
    outcomePrediction: isFavorable
      ? `The horary planetary confluence strongly favors this initiative for ${topic}. The Lagna lord is in harmonious reception with the 10th house sphere.`
      : `Moderate patience required for ${topic}. Take gradual steps; align efforts during the upcoming waxing moon cycle for peak efficacy.`,
    confidenceScore: isFavorable ? 88 : 74,
    favorableDirections: ["East (Sunrise)", "North-East (Sacred Portal)"],
    auspiciousTimingRecommendation: "Initiate major communications between 10:00 AM and 12:30 PM local highland time.",
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
  const todayStr = new Date().toISOString().slice(0, 10);
  const nowTransits = calculateCelestialPositions(todayStr, "12:00", city);

  const sunSign = natal.planets.find((p) => p.planet === "Sun")?.sign || "Aries";
  const moonSign = natal.planets.find((p) => p.planet === "Moon")?.sign || "Taurus";
  const risingSign = natal.ascendant.sign;

  // Active transits vs natal
  const activeTransits: TransitForecastItem[] = nowTransits.transits.slice(0, 4);

  let vitality = 82;
  if (natal.ascendant.sign === nowTransits.planets.find((p) => p.planet === "Sun")?.sign) {
    vitality += 10;
  }

  const overview =
    period === "daily"
      ? `Today, the transiting Moon illuminates your ${moonSign} sphere, providing enhanced emotional attunement and clarity in your interactions.`
      : period === "weekly"
        ? `This week centers on grounding your energetic reserves. The solar currents through your chart highlight collaborative initiatives and personal wellness.`
        : `This month marks a progressive cycle for long-range planning, somatic rejuvenation, and aligning your personal endeavors with ancestral cycles.`;

  return {
    period,
    targetDate: todayStr,
    sunSign,
    moonSign,
    risingSign,
    overview,
    vitalityScore: Math.min(vitality, 98),
    focusAreas: {
      physicalWellness: "Incorporate warming highland teas (Zingibil, Tosign) and maintain hydration throughout your daily rhythm.",
      emotionalEquilibrium: "Honor your inner rhythm. Step away from overstimulation during late afternoon hours.",
      purposeAndCareer: "Favorable window for structured presentations, clear project blueprints, and ethical team coordination.",
      socialAndRelational: "Warm communications flow naturally; express appreciation to close companions and mentors.",
    },
    planetaryTransitsActive: activeTransits,
    auspiciousHours: "07:30 AM – 09:15 AM & 02:00 PM – 03:45 PM",
    cautionaryAdvice: "Avoid impulsive decisions in fast-moving commercial discussions; verify all details twice.",
  };
}
