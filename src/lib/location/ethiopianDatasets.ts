import { LocationContext } from "./types";

export interface EthiopianRegionProfile {
  region: string;
  defaultZone: string;
  defaultWoreda: string;
  lat: number;
  lng: number;
  agroEcological: LocationContext["agroEcological"];
  altitudeBand: LocationContext["altitudeBand"];
  ecosystem: string;
  watershed: string;
  marketAccess: LocationContext["marketAccess"];
  endemicDiseases: string[];
  foodAvailability: {
    staples: string[];
    seasonalGaps: string[];
  };
  climate: {
    zone: string;
    rainySeasons: string[];
  };
}

export const ETHIOPIAN_REGION_PROFILES: Record<string, EthiopianRegionProfile> = {
  "Addis Ababa": {
    region: "Addis Ababa",
    defaultZone: "Addis Ababa",
    defaultWoreda: "Bole",
    lat: 9.03,
    lng: 38.74,
    agroEcological: "highland",
    altitudeBand: "2300-3200",
    ecosystem: "Afromontane plateau & eucalyptus woodland",
    watershed: "Awash Basin",
    marketAccess: "urban",
    endemicDiseases: ["upper_respiratory_infections", "hypertension", "trachoma"],
    foodAvailability: {
      staples: ["Teff (injera)", "Wheat", "Faba bean (shiro)", "Lentils", "Barley"],
      seasonalGaps: ["June", "July", "August"],
    },
    climate: {
      zone: "Cool Sub-tropical Highland (Dega)",
      rainySeasons: ["Kiremt (July-September)", "Belg (March-May)"],
    },
  },
  "Amhara": {
    region: "Amhara",
    defaultZone: "North Gondar",
    defaultWoreda: "Debark",
    lat: 12.6,
    lng: 37.46,
    agroEcological: "highland",
    altitudeBand: "2300-3200",
    ecosystem: "Highland Afroalpine & Montane forest (Simien mountain system)",
    watershed: "Abbay (Blue Nile) Basin",
    marketAccess: "rural-market",
    endemicDiseases: ["podoconiosis", "trachoma", "respiratory_infections", "goiter_iodine_deficiency"],
    foodAvailability: {
      staples: ["Teff", "Barley", "Faba bean", "Field pea", "Flaxseed (telba)"],
      seasonalGaps: ["July", "August", "September"],
    },
    climate: {
      zone: "Highland Temperate (Dega / Wurch)",
      rainySeasons: ["Kiremt (June-September)"],
    },
  },
  "Oromia": {
    region: "Oromia",
    defaultZone: "East Shewa",
    defaultWoreda: "Bishoftu",
    lat: 8.75,
    lng: 38.98,
    agroEcological: "midland",
    altitudeBand: "1500-2300",
    ecosystem: "Acacia-Combretum savanna & volcanic rift lakes",
    watershed: "Awash & Rift Valley Lakes Basin",
    marketAccess: "peri-urban",
    endemicDiseases: ["malaria", "dental_fluorosis", "schistosomiasis", "typhoid"],
    foodAvailability: {
      staples: ["Teff", "Maize", "Wheat", "Chickpeas (shimbra)", "Sorghum"],
      seasonalGaps: ["June", "July"],
    },
    climate: {
      zone: "Sub-humid Midland (Weyna Dega)",
      rainySeasons: ["Kiremt (July-September)", "Belg (March-April)"],
    },
  },
  "Tigray": {
    region: "Tigray",
    defaultZone: "Central Tigray",
    defaultWoreda: "Axum",
    lat: 14.13,
    lng: 38.72,
    agroEcological: "midland",
    altitudeBand: "1500-2300",
    ecosystem: "Degraded dry Afromontane scrub & terraced basalt ridges",
    watershed: "Tekeze Basin",
    marketAccess: "rural-market",
    endemicDiseases: ["malaria", "visceral_leishmaniasis", "trachoma", "undernutrition"],
    foodAvailability: {
      staples: ["Teff", "Finger millet (dagussa)", "Sorghum", "Grass pea (guaya)", "Sesame"],
      seasonalGaps: ["June", "July", "August", "September"],
    },
    climate: {
      zone: "Semi-arid Highland/Midland",
      rainySeasons: ["Kiremt (July-August)"],
    },
  },
  "Sidama": {
    region: "Sidama",
    defaultZone: "Hawassa",
    defaultWoreda: "Aleta Wendo",
    lat: 6.9,
    lng: 38.48,
    agroEcological: "highland",
    altitudeBand: "1500-2300",
    ecosystem: "Moist Evergreen Montane forest & Enset homegarden agroforest",
    watershed: "Rift Valley Lakes (Lake Hawassa / Bilate)",
    marketAccess: "peri-urban",
    endemicDiseases: ["podoconiosis", "helminthiasis", "malaria_seasonal", "anemia"],
    foodAvailability: {
      staples: ["Enset (kocho, bulla)", "Kale (gomen)", "Maize", "Haricot bean", "Avocado"],
      seasonalGaps: ["March", "April"],
    },
    climate: {
      zone: "Moist Weyna Dega (High rainfall sub-humid)",
      rainySeasons: ["Belg (March-May)", "Kiremt (June-October)"],
    },
  },
  "Afar": {
    region: "Afar",
    defaultZone: "Awsi Rasu",
    defaultWoreda: "Semera",
    lat: 11.79,
    lng: 41.0,
    agroEcological: "desert",
    altitudeBand: "<1500",
    ecosystem: "Desert scrub & salt flats (Danakil Depression)",
    watershed: "Awash Endorheic Basin",
    marketAccess: "remote",
    endemicDiseases: ["malaria", "dengue_fever", "heat_exhaustion", "cutaneous_leishmaniasis"],
    foodAvailability: {
      staples: ["Camel milk", "Goat milk", "Sorghum", "Imported dates", "Cornmeal"],
      seasonalGaps: ["May", "June", "July", "August"],
    },
    climate: {
      zone: "Hyper-arid Lowland (Bereha)",
      rainySeasons: ["Karma (July-August)", "Sugum (March-April)"],
    },
  },
  "Somali": {
    region: "Somali",
    defaultZone: "Fafan",
    defaultWoreda: "Jijiga",
    lat: 9.35,
    lng: 42.8,
    agroEcological: "lowland",
    altitudeBand: "<1500",
    ecosystem: "Acacia-Commiphora dry bushland and semidesert pastoral rangeland",
    watershed: "Wabi Shebelle Basin",
    marketAccess: "remote",
    endemicDiseases: ["malaria", "cholera_seasonal", "tuberculosis", "acute_watery_diarrhea"],
    foodAvailability: {
      staples: ["Camel milk", "Sorghum", "Maize", "Goat meat", "Canjeero"],
      seasonalGaps: ["January", "February", "July", "August"],
    },
    climate: {
      zone: "Arid / Semi-Arid Lowland (Kolla / Bereha)",
      rainySeasons: ["Gu (April-June)", "Deyr (October-November)"],
    },
  },
  "Southern Nations": {
    region: "Southern Nations",
    defaultZone: "Gamo",
    defaultWoreda: "Arba Minch",
    lat: 6.03,
    lng: 37.55,
    agroEcological: "rift-valley",
    altitudeBand: "1500-2300",
    ecosystem: "Great Rift Valley escarpment & Nechisar savanna lakes",
    watershed: "Omo-Gibe Basin",
    marketAccess: "rural-market",
    endemicDiseases: ["malaria", "schistosomiasis", "visceral_leishmaniasis", "podoconiosis"],
    foodAvailability: {
      staples: ["Enset (kocho)", "Banana", "Fish (Chamo/Abaya)", "Maize", "Taro (godere)"],
      seasonalGaps: ["June", "July"],
    },
    climate: {
      zone: "Humid Rift Valley Basin",
      rainySeasons: ["April-May", "September-October"],
    },
  },
};
