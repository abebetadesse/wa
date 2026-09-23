/**
 * Extended Data Models for Astrology, Multi-System Numerology, AwudeNegest, AI Chat, and Compatibility
 * Integrating best practices from AstroSage, Life Purpose App, Numi, Co-Star, AstroNumer, CUE, The Pattern, Time Passages, and AwudeNegest
 */

import {
  AstrologicalAspect,
  CelestialBody,
  HousePlacement,
  HumoralElement,
  PlanetaryPosition,
  TransitForecastItem,
  ZodiacSignName,
} from "./types";

// ==========================================
// VEDIC ASTROLOGY (JYOTISH) & PANCHANG TYPES
// ==========================================

export interface NakshatraInfo {
  index: number; // 1 - 27
  name: string;
  geezName: string;
  rulingPlanet: string;
  deity: string;
  degreeSpan: string;
  pada: number; // 1 - 4
  element: HumoralElement;
  symbol: string;
  temperament: string;
}

export interface VedicPlanetaryPlacement {
  planet: CelestialBody;
  siderealSign: ZodiacSignName;
  degree: number;
  totalLongitude: number;
  nakshatra: NakshatraInfo;
  house: number; // Bhava 1 - 12
  isRetrograde: boolean;
  dignity: "Exalted" | "Moolatrikona" | "Own Sign" | "Friendly" | "Neutral" | "Enemy" | "Debilitated";
  karaka: string; // Atmakaraka, Amatyakaraka, etc.
}

export interface DivisionalChartPlacement {
  chartCode: "D1" | "D9" | "D2" | "D3" | "D7" | "D10" | "D12" | "D16" | "D20" | "D24" | "D27" | "D30" | "D60";
  chartName: string;
  purpose: string;
  placements: {
    planet: CelestialBody;
    sign: ZodiacSignName;
    house: number;
  }[];
}

export interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  subPeriods?: {
    planet: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }[];
}

export interface PanchangData {
  tithi: {
    number: number; // 1 - 30 (Shukla / Krishna)
    name: string;
    paksha: "Shukla (Waxing)" | "Krishna (Waning)";
    meaning: string;
  };
  nakshatra: NakshatraInfo;
  yoga: {
    number: number; // 1 - 27
    name: string;
    auspiciousness: "Auspicious" | "Neutral" | "Challenging";
  };
  karana: {
    number: number;
    name: string;
    rulingDeity: string;
  };
  vaar: {
    dayOfWeek: string;
    rulingPlanet: string;
    ethiopianName: string;
  };
  sunrise: string;
  sunset: string;
  auspiciousPeriod: string;
}

export interface PrashnaKundliResult {
  question: string;
  queryTimestamp: string;
  location: {
    city: string;
    latitude: number;
    longitude: number;
  };
  prashnaAscendant: {
    sign: ZodiacSignName;
    degree: number;
    nakshatra: string;
  };
  karyaBhava: number; // House answering the query
  rulingPlanet: string;
  outcomePrediction: string;
  confidenceScore: number;
  favorableDirections: string[];
  auspiciousTimingRecommendation: string;
}

export interface DetailedHoroscope {
  period: "daily" | "weekly" | "monthly";
  targetDate: string;
  sunSign: ZodiacSignName;
  moonSign: ZodiacSignName;
  risingSign: ZodiacSignName;
  overview: string;
  vitalityScore: number; // 0 - 100
  focusAreas: {
    physicalWellness: string;
    emotionalEquilibrium: string;
    purposeAndCareer: string;
    socialAndRelational: string;
  };
  planetaryTransitsActive: TransitForecastItem[];
  auspiciousHours: string;
  cautionaryAdvice: string;
}

// ==========================================
// MULTI-SYSTEM NUMEROLOGY TYPES
// ==========================================

export interface DanMillmanLifePath {
  unreducedNumber: string; // e.g. "35/8", "40/4", "28/10", "19/10"
  primaryNumber: number;
  constituentDigits: number[];
  corePurpose: string;
  innateGifts: string[];
  recurringChallenges: string[];
  physicalwellbeingTendencies: {
    vulnerabilities: string[];
    vitalityPractices: string[];
  };
  careerAffinities: string[];
  relationshipDynamics: string[];
}

export interface ChaldeanNumerologyData {
  nameVibrationNumber: number;
  birthDayVibrationNumber: number;
  compoundNumberMeaning: string;
  luckyDays: string[];
  harmoniousGems: string[];
  vibrationalTone: string;
}

export interface PersonalDayYearData {
  personalDay: number;
  personalMonth: number;
  personalYear: number;
  houseColor: string; // Hex color for astrological house resonance
  astrologicalHouseResonance: number; // 1 - 12
  dailyAffirmation: string;
  journalPrompt: string;
  suggestedPacing: "Accelerate" | "Consolidate" | "Reflect" | "Rest";
}

export interface ExtendedNumerologyProfile {
  pythagorean: {
    lifePath: number;
    destinyNumber: number;
    soulUrge: number;
    personalityNumber: number;
    birthDayNumber: number;
  };
  chaldean: ChaldeanNumerologyData;
  danMillman: DanMillmanLifePath;
  personalCycles: PersonalDayYearData;
  geezGematria: {
    totalWeight: number;
    digitalRoot: number;
    virtue: string;
    biblicalResonance: string;
  };
}

// ==========================================
// ETHIOPIAN AWUDENEGEST & CULTURAL TYPES
// ==========================================

export interface AwudeNegestSection {
  sectionIndex: number; // 1 - 16
  timeOfDay: "መዓልት (Day)" | "ሌሊት (Night)";
  rulingSpirit: string;
  guidanceText: string;
  symbolicColor: string;
}

export interface AwudeNegestCircle {
  id: number; // 1 - 16
  name: string; // In Ge'ez and transliteration
  geezTitle: string;
  symbol: string;
  guardianAngel: string;
  elementalAffinity: HumoralElement;
  temperament: string;
  sections: AwudeNegestSection[];
  generalProphecy: string;
}

export interface AwudeNegestReadingResult {
  input: {
    name: string;
    geEzName: string;
    motherName?: string;
    category: string;
    place?: string;
    month?: string;
  };
  calculatedValues: {
    nameValue: number;
    motherValue: number;
    placeValue: number;
    monthValue: number;
    total: number;
    segment: number;
  };
  circle: {
    number: number; // 1 - 16
    name: string;
    geezTitle: string;
    symbol: string;
    guardianAngel: string;
    elementalAffinity: HumoralElement;
    temperament: string;
  };
  prediction: {
    category: string;
    categoryAmharic: string;
    favorable: boolean;
    confidence: number;
    prophecy: string;
    traditionalProverb: string;
    traditionalRemedy: string;
  };
  recommendations: string[];
  characterTraits: string[];
  behavioralPatterns: string[];
  compatibility: {
    bestMatchCircles: number[];
    challengingCircles: number[];
  };
}

export interface DabtaraManuscriptWisdom {
  title: string;
  geezTitle: string;
  scriptureRef: string;
  historicalPeriod: string;
  parchmentSealDescription: string;
  healingScrollPrescription: {
    targetCondition: string;
    celestialHour: string;
    herbalAllies: string[];
    protectivePrayerGeez: string;
    protectivePrayerEnglish: string;
  };
  seasonalPacing: {
    seasonName: string;
    wellbeingGuidance: string;
    botanicalInfusion: string;
  };
}

// ==========================================
// AI CHAT & SESSION TYPES
// ==========================================

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  contextBadges?: string[];
}

export interface AIChatSessionData {
  sessionId: string;
  userId: string;
  userContext: {
    fullName: string;
    birthDate: string;
    birthTime: string;
    city: string;
    sunSign: string;
    moonSign: string;
    risingSign: string;
    danMillmanLifePath: string;
    pythagoreanLifePath: number;
    destinyNumber: number;
    awudeCircleNumber: number;
    personalDay: number;
    personalYear: number;
  };
  messages: AIChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// COMPATIBILITY ANALYSIS TYPES
// ==========================================

export type ThePatternBondCategory =
  | "soulmate"
  | "extraordinary"
  | "powerful"
  | "meaningful"
  | "complex"
  | "growth";

export interface CompatibilityReport {
  id: string;
  profile1: {
    name: string;
    birthDate: string;
    sunSign: string;
    lifePath: string;
    awudeCircle: number;
  };
  profile2: {
    name: string;
    birthDate: string;
    sunSign: string;
    lifePath: string;
    awudeCircle: number;
    isBrandOrCompany?: boolean;
  };
  scores: {
    astrological: number; // 0 - 100
    numerological: number; // 0 - 100
    awudeNegest: number; // 0 - 100
    overall: number; // 0 - 100
  };
  bondCategory: ThePatternBondCategory;
  bondDescription: string;
  synastryHighlights: {
    title: string;
    type: "strength" | "friction" | "karmic";
    description: string;
  }[];
  lifePathSynergy: string;
  awudeCircleResonance: string;
  recommendations: string[];
}

// ==========================================
// COMPLIANCE & LEGAL DISCLAIMERS
// ==========================================

export const PLATFORM_DISCLAIMERS = {
  astrology:
    "Astrological insights are for entertainment, spiritual enrichment, and self-reflection. They are not predictive or medical diagnoses.",
  numerology:
    "Numerology calculations derive from ancient historical traditions and are designed for personal reflection, not deterministic forecasting.",
  awudeNegest:
    "AwudeNegest and Däbtära manuscripts reflect classical Ethiopian cultural heritage and divinatory traditions. They do not substitute for scientific, legal, or financial counsel.",
  aiChat:
    "AI-generated interpretations ground themselves in your specific calculations but do not constitute certified psychological or healthcare therapy.",
  compatibility:
    "Compatibility metrics synthesize astrological and numerological patterns for relational self-inquiry and should not dictate interpersonal or corporate decisions.",
  wellbeing:
    "All wellbeing and somatic associations are educational and traditional; consult a qualified medical physician for scientific symptoms.",
};
