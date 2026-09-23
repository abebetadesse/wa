export type AgroClimaticZone = "dega" | "weina_dega" | "kolla" | "bereha";

export interface AgroEcologicalProfile {
  zone: AgroClimaticZone;
  nameAmharic: string;
  altitudeRangeMeters: [number, number];
  typicalTemperatureRangeC: [number, number];
  annualRainfallMm: [number, number];
  predominantSoilType: string;
  soilMineralCharacteristics: {
    ironBioavailability: number; // multiplier e.g. 1.15 in volcanic basalt
    zincBioavailability: number;
    magnesiumLevel: "high" | "moderate" | "low";
    calciumLevel: "high" | "moderate" | "low";
  };
  keyStapleCrops: string[];
  endemicBotanicalHeritage: string[];
}

export const AGRO_CLIMATIC_ZONES: Record<AgroClimaticZone, AgroEcologicalProfile> = {
  dega: {
    zone: "dega",
    nameAmharic: "ደጋ (ቀዝቃዛ ደጋማ ስፍራ)",
    altitudeRangeMeters: [2400, 3800],
    typicalTemperatureRangeC: [10, 16],
    annualRainfallMm: [1000, 2000],
    predominantSoilType: "Volcanic Basaltic Nitisols / Vertisols (Gojjam, Gondar, North Shewa)",
    soilMineralCharacteristics: {
      ironBioavailability: 1.25, // Rich weathered volcanic iron minerals
      zincBioavailability: 1.15,
      magnesiumLevel: "high",
      calciumLevel: "high",
    },
    keyStapleCrops: ["Brown Teff", "Barley (Gebs)", "Faba Beans (Baqela)", "Enset"],
    endemicBotanicalHeritage: ["Kosso (Hagenia abyssinica)", "Tosign (Thymus serrulatus)", "Gibbira (Lobelia rhynchopetalum)"],
  },
  weina_dega: {
    zone: "weina_dega",
    nameAmharic: "ወይና ደጋ (መካከለኛ የአየር ጠባይ)",
    altitudeRangeMeters: [1500, 2400],
    typicalTemperatureRangeC: [16, 22],
    annualRainfallMm: [800, 1500],
    predominantSoilType: "Cambisols / Eutric Nitisols (Oromia highlands, Sidama, Southern Rift Escarpment)",
    soilMineralCharacteristics: {
      ironBioavailability: 1.10,
      zincBioavailability: 1.05,
      magnesiumLevel: "high",
      calciumLevel: "moderate",
    },
    keyStapleCrops: ["White Teff", "Maize", "Chickpeas (Shiro base)", "Coffee Arabica", "Enset"],
    endemicBotanicalHeritage: ["Tena Adam (Ruta chalepensis)", "Damakesse (Ocimum lamiifolium)", "Gesho (Rhamnus prinoides)"],
  },
  kolla: {
    zone: "kolla",
    nameAmharic: "ቆላ (ሞቃታማ ዝቅተኛ ስፍራ)",
    altitudeRangeMeters: [500, 1500],
    typicalTemperatureRangeC: [22, 30],
    annualRainfallMm: [400, 800],
    predominantSoilType: "Fluvisols / Calcisols / Arenosols (Dire Dawa, Awash Valley, Gambela, Lowland Somali)",
    soilMineralCharacteristics: {
      ironBioavailability: 0.95,
      zincBioavailability: 0.90,
      magnesiumLevel: "moderate",
      calciumLevel: "high",
    },
    keyStapleCrops: ["Sorghum (Mashilla)", "Sesame (Selit)", "Cowpea", "Moringa stenopetala"],
    endemicBotanicalHeritage: ["Feto (Lepidium sativum)", "Agam (Carissa spinarum)", "Bedeno (Balanites aegyptiaca)"],
  },
  bereha: {
    zone: "bereha",
    nameAmharic: "በረሃ (ደረቅና በረሃማ ስፍራ)",
    altitudeRangeMeters: [0, 500],
    typicalTemperatureRangeC: [30, 45],
    annualRainfallMm: [100, 400],
    predominantSoilType: "Gypsisols / Solonchaks (Danakil Depression, Afar lowlands, Ogaden borders)",
    soilMineralCharacteristics: {
      ironBioavailability: 0.85,
      zincBioavailability: 0.80,
      magnesiumLevel: "low",
      calciumLevel: "high",
    },
    keyStapleCrops: ["Pastoralist Camel Dairy", "Date Palms", "Drought-hardy Millets"],
    endemicBotanicalHeritage: ["Acacia senegal", "Commiphora myrrha (Karbe)", "Aloe debrana"],
  },
};

export interface FluorideAssessment {
  isRiftValleyZone: boolean;
  waterFluorideEstimatePpm: number;
  fluorosisRiskTier: "critical" | "elevated" | "low";
  calciumChelationFactor: number;
  recommendations: {
    title: string;
    description: string;
    evidence: string;
  }[];
}

export const RIFT_VALLEY_GEOTHERMAL_REGIONS = [
  "Wonji",
  "Mojo",
  "Ziway",
  "Batu",
  "Hawassa",
  "Shashemene",
  "Arba Minch",
  "Metehara",
  "Nazret (Adama)",
  "Oromia (Rift Valley)",
];

/**
 * Enhancement 1: Resolves agro-ecological zone and soil mineral characteristics
 */
export function resolveAgroEcologicalZone(altitudeMeters: number): AgroEcologicalProfile {
  if (altitudeMeters >= 2400) return AGRO_CLIMATIC_ZONES.dega;
  if (altitudeMeters >= 1500) return AGRO_CLIMATIC_ZONES.weina_dega;
  if (altitudeMeters >= 500) return AGRO_CLIMATIC_ZONES.kolla;
  return AGRO_CLIMATIC_ZONES.bereha;
}

/**
 * Enhancement 2: Detects Rift Valley geothermal fluoride risk and provides calcium antagonist protocol
 */
export function evaluateRiftValleyFluoride(region: string): FluorideAssessment {
  const isRiftValley = RIFT_VALLEY_GEOTHERMAL_REGIONS.some((r) =>
    region.toLowerCase().includes(r.toLowerCase())
  );

  if (isRiftValley) {
    return {
      isRiftValleyZone: true,
      waterFluorideEstimatePpm: 8.5, // Well water in Rift Valley frequently reaches 6-15 mg/L
      fluorosisRiskTier: "critical",
      calciumChelationFactor: 0.65, // Insoluble CaF2 precipitation reduces free calcium absorption
      recommendations: [
        {
          title: "Prioritize Low-Oxalate Ethiopian Greens (Gomen & Kocho)",
          description:
            "High fluoride intake precipitates soluble calcium into insoluble calcium fluoride (CaF2). Compensate by ingesting 200g+ daily of braised Gomen (210mg Ca) and fermented Kocho to maintain positive calcium balance.",
          evidence: "Ethiopian Geological Survey / WHO Endemic Fluorosis Guidelines 2024",
        },
        {
          title: "Defluoridation / Rainwater or Spring Separation",
          description:
            "Utilize bone-char filters or aluminum-based defluoridators for drinking water, or harvest highland rainwater for tea preparation.",
          evidence: "Mojo / Wonji Water Quality Research Initiative",
        },
        {
          title: "Avoid Heavy Fluoride-Accumulating Old Tea Leaves",
          description:
            "Mature black tea leaves hyper-accumulate fluoride. In the Rift Valley, substitute roasted barley tea or Tosign thyme infusions.",
          evidence: "Journal of Ethiopian wellbeing Science Fluoride Pharmacokinetics",
        },
      ],
    };
  }

  return {
    isRiftValleyZone: false,
    waterFluorideEstimatePpm: 0.8,
    fluorosisRiskTier: "low",
    calciumChelationFactor: 1.0,
    recommendations: [],
  };
}
