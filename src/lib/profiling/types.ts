/**
 * Integrated Personal Profiling Module - Core Data Types
 * Unifies Astrology, Numerology, and Naming Analysis with Ethiopian Traditions
 */

export type HumoralElement = "esat" | "afere" | "nifas" | "may"; // Fire, Earth, Air, Water

export interface EthiopianCoordinatePreset {
  city: string;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  region: string;
}

// ==========================================
// ASTROLOGY TYPES
// ==========================================

export type CelestialBody =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto"
  | "Ascendant"
  | "Midheaven";

export type ZodiacSignName =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export interface PlanetaryPosition {
  planet: CelestialBody;
  sign: ZodiacSignName;
  degree: number; // 0 - 29.99
  totalLongitude: number; // 0 - 360
  house: number; // 1 - 12
  isRetrograde: boolean;
  element: HumoralElement;
  ethiopianName: string;
  ethiopianInterpretation: string;
  healthAssociations: {
    organs: string[];
    physiologicalSystems: string[];
    potentialVulnerabilities: string[];
    vitalityStrengths: string[];
  };
}

export interface HousePlacement {
  houseNumber: number; // 1 - 12
  signOnCusp: ZodiacSignName;
  cuspDegree: number;
  traditionalBodyParts: string[];
  healthMeaning: string;
  dailyRoutineImpact: string;
  activePlanets: CelestialBody[];
}

export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export interface AstrologicalAspect {
  planet1: CelestialBody;
  planet2: CelestialBody;
  aspectType: AspectType;
  exactAngle: number;
  orb: number;
  nature: "harmonious" | "challenging" | "dynamic";
  healthImpact: string;
  psychosomaticIndicator: string;
}

export interface TransitForecastItem {
  transitingPlanet: CelestialBody;
  targetPlanetOrPoint: CelestialBody;
  aspect: AspectType;
  currentSign: ZodiacSignName;
  durationWindow: string;
  healthForecast: string;
  balancingAdvice: string;
}

export interface DabtaraHealingScrollPrescription {
  title: string;
  geezTitle: string;
  targetImbalance: string;
  celestialHour: string;
  planetaryRuler: string;
  medicinalHerbs: string[];
  preparationInstructions: string;
  sacredSymbolism: string;
  modernClinicalPrecaution: string;
}

export interface TsebelAuspiciousTiming {
  recommendedSpring: string;
  springLocation: string;
  auspiciousDaysOfWeek: string[];
  ethiopianMonth: string;
  planetaryRuler: string;
  therapeuticMineralResonance: string;
  holisticIntention: string;
}

export interface AstrologicalProfile {
  birthDateTimeUtc: string;
  birthLocation: string;
  coordinates: { latitude: number; longitude: number };
  sunSign: ZodiacSignName;
  moonSign: ZodiacSignName;
  risingSign: ZodiacSignName;
  elementalBalance: {
    fire: number; // percentage
    earth: number;
    air: number;
    water: number;
  };
  dominantHumor: HumoralElement;
  ethiopianZodiacSign: {
    geezName: string;
    englishName: string;
    symbol: string;
    dateRange: string;
    rulingSphere: string;
    traditionalTemperament: string;
  };
  planetaryPositions: PlanetaryPosition[];
  houses: HousePlacement[];
  aspects: AstrologicalAspect[];
  transitsForecast: TransitForecastItem[];
  dabtaraPrescriptions: DabtaraHealingScrollPrescription[];
  tsebelTiming: TsebelAuspiciousTiming;
}

// ==========================================
// NUMEROLOGY TYPES
// ==========================================

export interface CoreNumberAnalysis {
  number: number;
  isMasterNumber: boolean;
  name: string;
  archetype: string;
  ethiopianAdaptation: string;
  ethiopianSymbol: string;
  healthPatterns: {
    strengths: string[];
    vulnerabilities: string[];
    psychosomaticTendencies: string[];
    lifestyleRecommendations: string[];
  };
}

export interface NumerologyProfile {
  lifePath: CoreNumberAnalysis;
  destiny: CoreNumberAnalysis; // Expression
  soulUrge: CoreNumberAnalysis; // Heart's Desire
  personality: CoreNumberAnalysis;
  birthDayNumber: CoreNumberAnalysis;
  geezGematriaSynergy?: {
    totalWeight: number;
    digitalRoot: number;
    virtueMeaning: string;
  };
  somatichealthSummary: {
    targetOrganSystems: string[];
    primaryStressResponse: string[];
    preventiveHabits: string[];
  };
}

// ==========================================
// NAMING & IDENTITY TYPES
// ==========================================

export interface EthiopianNameRecord {
  name: string;
  geezFidel?: string;
  language: "Amharic" | "Ge'ez" | "Afaan Oromo" | "Tigrinya" | "Other";
  meaning: string;
  gender: "female" | "male" | "unisex";
  originEtymology: string;
  culturalContext: string;
  numerologicalValues: {
    destiny: number;
    soulUrge: number;
    personality: number;
  };
  healthIdentityCorrelation: {
    selfPerceptionTheme: string;
    emotionalExpressionStyle: string;
    psychosomaticTendency: string;
    balancingVirtue: string;
  };
}

export interface NameAnalysisReport {
  rawInputName: string;
  parsedComponents: {
    givenName: string;
    fatherName?: string;
    grandfatherName?: string;
  };
  givenNameProfile: EthiopianNameRecord;
  familyLineageProfile?: EthiopianNameRecord;
  overallNameIdentitySynergy: {
    identityNarrative: string;
    healthBehaviorInfluence: string;
    mindBodyResilience: string;
  };
}

export interface NameSuggestionResult {
  suggestedName: string;
  geezFidel: string;
  language: string;
  meaning: string;
  sourceTradition?: string;
  score?: number;
  scoreBreakdown?: {
    destinyMatch: number;
    genderMatch: number;
    languageMatch: number;
    meaningAlignment: number;
  };
  primaryElement: HumoralElement;
  destinyNumber: number;
  alignmentReason: string;
  healthHarmonizationBenefit: string;
  recommendation?: string;
}

// ==========================================
// INTEGRATED PROFILE SYNTHESIS TYPES
// ==========================================

export interface SeasonalhealthPattern {
  season: "Kiremt (Rainy)" | "Bega (Dry & Sunny)" | "Belg (Short Rains)" | "Pagume (Renewal)";
  ethiopianMonths: string;
  potentialVulnerabilities: string[];
  dietaryAdjustments: string[];
  botanicalSupports: string[];
  dailyPacing: string;
}

export interface IntegratedPersonalProfile {
  id: string;
  generatedAt: string;
  userInfo: {
    fullName: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    preferredLanguage: string;
  };
  astrology: AstrologicalProfile;
  numerology: NumerologyProfile;
  naming: NameAnalysisReport;
  synthesis: {
    constitutionalType: string;
    humoralDominance: HumoralElement;
    vitalityScore: number; // 0 - 100
    primaryhealthRisks: string[];
    enduringStrengths: string[];
    seasonalPatterns: SeasonalhealthPattern[];
    recommendations: {
      dietary: {
        therapeuticPrinciples: string[];
        favoredEthiopianFoods: string[];
        foodsToModerate: string[];
      };
      herbalAdaptogens: {
        herb: string;
        traditionalUse: string;
        synergyNote: string;
        safetyPrecaution: string;
      }[];
      mindBodyLifestyle: string[];
      culturalTraditionsIntegration: string[];
    };
    crossStrandInsights: {
      biochemicalNotes: string;
      psychologicalNotes: string;
      dietaryNotes: string;
      culturalNotes: string;
    };
  };
}
