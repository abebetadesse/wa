import { buildDenseLocationData, type LocationObservation, type ProvenanceRecord, type DataQualitySummary, type SpatialUnit, type SourceComparison, type FoodConsumptionObservation, type NutritionSurvey } from "./denseLocationData";

export type EthiopianAgroZone = "dega" | "weina_dega" | "kolla" | "bereha";
export interface EthiopianLocationSystemsProfile {
  dataLabel: "indicative_planning_estimate";
  referenceYear: number;
  sourceNote: string;
  ecology: {
    ecosystem: string;
    geography: string;
    riversAndWaterBodies: string[];
    annualPrecipitationMm: [number, number];
    temperatureRangeC: [number, number];
    soilTypes: string[];
    forestTypes: string[];
    protectedAreasAndBiodiversity: string[];
  };
  agriculture: {
    crops: string[];
    livestock: string[];
    beesAndApiculture: string[];
    fisheries: string[];
    insectResources: string[];
    forestProducts: string[];
    productionSystems: string[];
  };
  industryAndUrbanization: {
    leadingIndustries: string[];
    urbanizationLevel: "urban" | "peri_urban" | "rural_hub";
    builtUpAreaPct: number;
    infrastructureNotes: string[];
  };
  foodAndNutrition: {
    stapleFoods: string[];
    fermentedFoodsAndDrinks: string[];
    commonIngredients: string[];
    preparationMethods: string[];
    traditionalDietPatterns: string[];
    utensilsAndSpices: string[];
    preservationMethods: string[];
  };
  culturalAndHeritage: {
    commonNames: string[];
    traditionalMedicines: string[];
    traditionalPractices: string[];
    churchesAndMonasteries: string[];
    mosques: string[];
    mountains: string[];
    rivers: string[];
    lakes: string[];
    culturalPractices: string[];
  };
  foodSystem: {
    locationFoods: LocationFoodProfile[];
    pesticideUse: AgriculturalChemicalRecord[];
    insecticideUse: AgriculturalChemicalRecord[];
    processingFacilitiesAndMethods: string[];
  };
}

export interface ProximateComposition {
  basis: "as_fed" | "dry_matter";
  moisturePct?: number;
  crudeProteinPct?: number;
  crudeFiberPct?: number;
  etherExtractPct?: number;
  ashPct?: number;
  nitrogenFreeExtractPct?: number;
  energyMjPerKg?: number;
}

export interface LocationFoodProfile {
  food: string;
  localNames: string[];
  foodGroup: "cereal" | "pulse" | "oilseed" | "root" | "fruit" | "vegetable" | "animal" | "beverage" | "spice" | "forage";
  productionNotes: string;
  ingredients: string[];
  processingMethods: string[];
  preservationMethods: string[];
  proximateComposition?: ProximateComposition;
  compositionSource: {
    name: "EFCT" | "Feedipedia" | "local_survey" | "not_verified";
    reference: string;
    url?: string;
    intendedUse: "human_food" | "animal_feed" | "both" | "reference_only";
  };
}

export interface AgriculturalChemicalRecord {
  activeIngredient: string;
  targetCropOrPest: string;
  usePurpose: "pesticide" | "insecticide";
  applicationContext: string;
  sourceNote: string;
}

export interface EthiopianLocation {
  id: string;
  region: string;
  name: string;
  nameAmharic: string;
  aliases: string[];
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  agroZone: EthiopianAgroZone;
  riftValley: boolean;
  commonLanguages: string[];
  wellbeingProfile: EthiopianLocationWellbeingProfile;
  systemsProfile: EthiopianLocationSystemsProfile;
  denseData: {
    observations: LocationObservation[];
    sourceComparisons: SourceComparison[];
    spatialUnits: SpatialUnit[];
    provenance: ProvenanceRecord[];
    dataQuality: DataQualitySummary;
    foodConsumption: FoodConsumptionObservation[];
    nutritionSurveys: NutritionSurvey[];
  };
}

export interface DiseaseRate {
  condition: string;
  category: "communicable" | "non_communicable";
  measure: "annual_incidence_per_100k" | "prevalence_pct" | "mortality_per_100k";
  value: number;
  populationScope: string;
}

export interface BirthDefectIndicator {
  condition: string;
  measure: "estimated_prevalence_per_10000_births";
  value: number;
  populationScope: string;
}

export interface GeneticDisorderIndicator {
  condition: string;
  measure: "estimated_prevalence_per_10000_population" | "carrier_frequency_pct";
  value: number;
  populationScope: string;
}

export interface EthiopianLocationWellbeingProfile {
  dataLabel: "indicative_planning_estimate";
  referenceYear: number;
  sourceNote: string;
  demographics: {
    estimatedPopulation: number;
    urbanPopulationPct: number;
    femalePopulationPct: number;
    underFivePopulationPct: number;
    workingAgePopulationPct: number;
    medianAgeYears: number;
    averageHouseholdSize: number;
    anthropometrics: {
      averageBmi: number;
      averageHeightCm: {
        female: number;
        male: number;
      };
      averageWeightKg: {
        female: number;
        male: number;
      };
      genderDistributionPct: {
        female: number;
        male: number;
        otherOrUndisclosed: number;
      };
    };
  };
  birthRatePer1000: number;
  totalFertilityRate: number;
  marriageAndInheritance: {
    polygamousUnionPct: number;
    polygamyPopulationScope: string;
    birthDefects: BirthDefectIndicator[];
    geneticDisorders: GeneticDisorderIndicator[];
  };
  communicableDiseaseRates: DiseaseRate[];
  nonCommunicableDiseaseRates: DiseaseRate[];
}

const profile = (
  estimatedPopulation: number,
  urbanPopulationPct: number,
  medianAgeYears: number,
  averageHouseholdSize: number,
  communicableDiseaseRates: DiseaseRate[],
  nonCommunicableDiseaseRates: DiseaseRate[],
  underFivePopulationPct = 13,
) => {
  const femalePopulationPct = 50.2;
  const malePopulationPct = Number((100 - femalePopulationPct).toFixed(1));
  const averageHeightCm = {
    female: Number((153 + urbanPopulationPct * 0.04 + medianAgeYears * 0.08).toFixed(1)),
    male: Number((164 + urbanPopulationPct * 0.04 + medianAgeYears * 0.08).toFixed(1)),
  };
  const averageWeightKg = {
    female: Number((47 + urbanPopulationPct * 0.06 + medianAgeYears * 0.22).toFixed(1)),
    male: Number((55 + urbanPopulationPct * 0.07 + medianAgeYears * 0.25).toFixed(1)),
  };
  const averageBmi = Number((
    ((averageWeightKg.female / (averageHeightCm.female / 100) ** 2) +
      (averageWeightKg.male / (averageHeightCm.male / 100) ** 2)) / 2
  ).toFixed(1));
  const birthDefects: BirthDefectIndicator[] = [
    { condition: "Neural tube defects", measure: "estimated_prevalence_per_10000_births", value: Number((10.5 + underFivePopulationPct * 0.35).toFixed(1)), populationScope: "Live births" },
    { condition: "Congenital heart defects", measure: "estimated_prevalence_per_10000_births", value: Number((8.5 + underFivePopulationPct * 0.22).toFixed(1)), populationScope: "Live births" },
    { condition: "Orofacial clefts", measure: "estimated_prevalence_per_10000_births", value: Number((6.2 + underFivePopulationPct * 0.12).toFixed(1)), populationScope: "Live births" },
  ];
  const geneticDisorders: GeneticDisorderIndicator[] = [
    { condition: "Sickle-cell trait", measure: "carrier_frequency_pct", value: Number((1.2 + (100 - urbanPopulationPct) * 0.015).toFixed(1)), populationScope: "Estimated carrier frequency; not a diagnosis" },
    { condition: "G6PD deficiency", measure: "estimated_prevalence_per_10000_population", value: Number((95 + (100 - urbanPopulationPct) * 0.8).toFixed(1)), populationScope: "General population; planning estimate" },
    { condition: "Inherited blood disorders (other)", measure: "estimated_prevalence_per_10000_population", value: Number((18 + underFivePopulationPct * 0.7).toFixed(1)), populationScope: "General population; planning estimate" },
  ];

  return {
    dataLabel: "indicative_planning_estimate" as const,
    referenceYear: 2024,
    sourceNote: "Indicative planning estimate assembled from public Ethiopian population-health patterns; anthropometric, birth-defect, polygamy, and inherited-condition indicators are modeled town averages, not a patient diagnosis or official surveillance rate.",
    demographics: {
      estimatedPopulation,
      urbanPopulationPct,
      femalePopulationPct,
      underFivePopulationPct,
      workingAgePopulationPct: 53,
      medianAgeYears,
      averageHouseholdSize,
      anthropometrics: {
        averageBmi,
        averageHeightCm,
        averageWeightKg,
        genderDistributionPct: {
          female: femalePopulationPct,
          male: malePopulationPct,
          otherOrUndisclosed: 0,
        },
      },
    },
    birthRatePer1000: Number((underFivePopulationPct * 1.8 + 2.5 - urbanPopulationPct * 0.04).toFixed(1)),
    totalFertilityRate: Number((2.1 + underFivePopulationPct * 0.08 - urbanPopulationPct * 0.012).toFixed(1)),
    marriageAndInheritance: {
      polygamousUnionPct: Number((8.5 + (100 - urbanPopulationPct) * 0.14).toFixed(1)),
      polygamyPopulationScope: "Estimated percentage of currently married unions; planning indicator",
      birthDefects,
      geneticDisorders,
    },
    communicableDiseaseRates,
    nonCommunicableDiseaseRates,
  };
};

const communicable = (malaria: number, tb: number, hiv: number, diarrheal: number): DiseaseRate[] => [
  { condition: "Malaria", category: "communicable", measure: "annual_incidence_per_100k", value: malaria, populationScope: "General population at risk" },
  { condition: "Tuberculosis", category: "communicable", measure: "annual_incidence_per_100k", value: tb, populationScope: "General population" },
  { condition: "HIV", category: "communicable", measure: "prevalence_pct", value: hiv, populationScope: "Adults aged 15–49" },
  { condition: "Acute diarrhoeal illness", category: "communicable", measure: "annual_incidence_per_100k", value: diarrheal, populationScope: "General population" },
];

const nonCommunicable = (hypertension: number, diabetes: number, cvdMortality: number, cancer: number): DiseaseRate[] => [
  { condition: "Hypertension", category: "non_communicable", measure: "prevalence_pct", value: hypertension, populationScope: "Adults aged 18+" },
  { condition: "Diabetes", category: "non_communicable", measure: "prevalence_pct", value: diabetes, populationScope: "Adults aged 20+" },
  { condition: "Cardiovascular disease", category: "non_communicable", measure: "mortality_per_100k", value: cvdMortality, populationScope: "All ages" },
  { condition: "Cancer", category: "non_communicable", measure: "annual_incidence_per_100k", value: cancer, populationScope: "General population" },
];

const buildSystemsProfile = (
  location: Pick<EthiopianLocation, "name" | "aliases" | "agroZone" | "riftValley">,
): EthiopianLocationSystemsProfile => {
  const zoneData: Record<EthiopianAgroZone, Omit<EthiopianLocationSystemsProfile["ecology"], "geography" | "riversAndWaterBodies"> & {
    crops: string[];
    livestock: string[];
    fisheries: string[];
    forestProducts: string[];
    diet: string[];
  }> = {
    dega: {
      ecosystem: "Cool Ethiopian highland and montane agricultural ecosystem",
      annualPrecipitationMm: [1000, 2000],
      temperatureRangeC: [10, 16],
      soilTypes: ["Nitisols", "Vertisols", "Volcanic basalt-derived soils"],
      forestTypes: ["Afro-alpine heath", "Montane evergreen forest", "Eucalyptus woodlots"],
      protectedAreasAndBiodiversity: ["Highland watersheds", "Native watershed vegetation", "Pollinator habitats"],
      crops: ["Teff", "Barley", "Faba bean", "Field pea", "Potato", "Enset"],
      livestock: ["Cattle", "Sheep", "Goats", "Donkeys", "Poultry"],
      fisheries: ["Highland streams", "Reservoir fish where available"],
      forestProducts: ["Fuelwood", "Eucalyptus poles", "Honey", "Wild herbs"],
      diet: ["Injera-based cereal and pulse diet", "Highland dairy and legume meals"],
    },
    weina_dega: {
      ecosystem: "Temperate-to-warm mid-altitude mixed farming ecosystem",
      annualPrecipitationMm: [800, 1500],
      temperatureRangeC: [16, 22],
      soilTypes: ["Nitisols", "Cambisols", "Vertisols"],
      forestTypes: ["Montane forest remnants", "Coffee forest", "Eucalyptus woodlots"],
      protectedAreasAndBiodiversity: ["Coffee landscapes", "Rift escarpment habitats", "Wetland and lake margins"],
      crops: ["Teff", "Maize", "Wheat", "Sorghum", "Enset", "Coffee", "Haricot bean"],
      livestock: ["Cattle", "Goats", "Sheep", "Poultry", "Bees"],
      fisheries: ["Lakes and reservoirs", "Riverine artisanal fisheries"],
      forestProducts: ["Coffee", "Honey", "Fuelwood", "Bamboo or poles"],
      diet: ["Cereal-pulse meals", "Enset and root-crop meals", "Coffee-centered hospitality"],
    },
    kolla: {
      ecosystem: "Warm lowland, riverine, savanna, and Rift Valley ecosystem",
      annualPrecipitationMm: [400, 800],
      temperatureRangeC: [22, 30],
      soilTypes: ["Fluvisols", "Calcisols", "Arenosols"],
      forestTypes: ["Dry woodland", "Acacia woodland", "Riverine forest"],
      protectedAreasAndBiodiversity: ["River corridors", "Dryland wildlife habitat", "Lake and wetland margins"],
      crops: ["Sorghum", "Maize", "Sesame", "Cowpea", "Cotton", "Banana", "Moringa"],
      livestock: ["Cattle", "Goats", "Sheep", "Camels", "Poultry"],
      fisheries: ["Lake fisheries", "River fisheries", "Small-scale aquaculture"],
      forestProducts: ["Gum and resin", "Honey", "Fuelwood", "Fodder", "Wild fruits"],
      diet: ["Sorghum and maize meals", "Pastoral dairy and meat meals", "Seasonal fruits and greens"],
    },
    bereha: {
      ecosystem: "Arid and semi-arid pastoral ecosystem",
      annualPrecipitationMm: [100, 400],
      temperatureRangeC: [30, 45],
      soilTypes: ["Arenosols", "Gypsisols", "Solonchaks"],
      forestTypes: ["Desert scrub", "Acacia-Commiphora woodland", "Dry-season grazing bushland"],
      protectedAreasAndBiodiversity: ["Desert wildlife corridors", "Salt-lake and wetland habitats", "Pastoral rangelands"],
      crops: ["Sorghum", "Millet", "Dates", "Sesame", "Irrigated vegetables"],
      livestock: ["Camels", "Goats", "Sheep", "Cattle", "Donkeys"],
      fisheries: ["Lake and seasonal waterbody fisheries where available"],
      forestProducts: ["Gum arabic", "Resins", "Charcoal alternatives", "Fodder", "Wild fruits"],
      diet: ["Camel-milk and grain diet", "Drought-resilient cereal meals", "Dates and seasonal produce"],
    },
  };

  const base = zoneData[location.agroZone];
  const localWater: Record<string, string[]> = {
    "Addis Ababa": ["Akaki River", "Gefersa reservoir", "Highland springs"],
    "Bahir Dar": ["Lake Tana", "Blue Nile", "Wetland and lakeshore systems"],
    Gondar: ["Angereb River", "Lake Tana watershed", "Highland springs"],
    Mekelle: ["Seasonal highland streams", "Small reservoirs and ponds"],
    Adama: ["Awash River", "Koka reservoir", "Rift Valley groundwater"],
    Hawassa: ["Lake Hawassa", "Tikur Wuha River", "Rift Valley springs"],
    "Arba Minch": ["Lake Chamo", "Lake Abaya", "Kulfo River"],
    "Dire Dawa": ["Dechatu River", "Seasonal wadis", "Groundwater wells"],
    Jigjiga: ["Seasonal wadis", "Pastoral wells and ponds"],
    Semera: ["Awash River basin", "Seasonal wadis", "Groundwater"],
    Assosa: ["Dabus River tributaries", "Seasonal streams", "Wetland pockets"],
    Gambella: ["Baro River", "Openo River", "Floodplain wetlands"],
    Harar: ["Seasonal streams", "Harar highland springs"],
  };
  const heritage: Record<string, Omit<EthiopianLocationSystemsProfile["culturalAndHeritage"], "commonNames">> = {
    "Addis Ababa": {
      traditionalMedicines: ["Eucalyptus and aromatic steam practices", "Black cumin and herbal infusions", "Community birth and elder-care knowledge"],
      traditionalPractices: ["Coffee ceremony", "Eder and equb mutual aid", "Meskel and Timkat observances"],
      churchesAndMonasteries: ["Holy Trinity Cathedral", "St. George Cathedral", "Entoto Maryam Church"],
      mosques: ["Anwar Mosque", "Grand Anwar Mosque area", "Jama Mosque"],
      mountains: ["Mount Entoto", "Yerer Mountain"],
      rivers: ["Akaki River", "Little Akaki River"],
      lakes: ["Gefersa reservoir", "Legedadi reservoir"],
      culturalPractices: ["Amharic and Afaan Oromo urban traditions", "Coffee hospitality", "Ethiopian Orthodox, Muslim, and other faith communities"],
    },
    "Bahir Dar": {
      traditionalMedicines: ["Gesho-based herbal preparations", "Hagenia and local highland plant knowledge", "Honey and spice remedies"],
      traditionalPractices: ["Lake Tana boat traditions", "Coffee ceremony", "Timkat celebrations"],
      churchesAndMonasteries: ["Ura Kidane Mehret Monastery", "Kebran Gabriel Monastery", "St. George Church"],
      mosques: ["Bahir Dar central mosque communities"],
      mountains: ["Mount Guna", "Choke Mountain highlands"],
      rivers: ["Blue Nile", "Gilgel Abay"],
      lakes: ["Lake Tana"],
      culturalPractices: ["Amhara oral traditions", "Monastic manuscript heritage", "Lakeshore fishing and farming traditions"],
    },
    Gondar: {
      traditionalMedicines: ["Kosso and highland herbal knowledge", "Tena Adam and rue infusions", "Honey-based preparations"],
      traditionalPractices: ["Coffee ceremony", "Timkat celebrations", "Elder mediation and community associations"],
      churchesAndMonasteries: ["Debre Berhan Selassie Church", "Fasil Ghebbi churches", "Gorgora monasteries"],
      mosques: ["Gondar central mosque communities"],
      mountains: ["Simien Mountains", "Mount Guna"],
      rivers: ["Angereb River", "Rib River"],
      lakes: ["Lake Tana"],
      culturalPractices: ["Gondarine architecture and music", "Amhara craft traditions", "Orthodox Christian and Muslim heritage"],
    },
    Harar: {
      traditionalMedicines: ["Herbal spice infusions", "Honey and black-seed preparations", "Traditional midwifery knowledge"],
      traditionalPractices: ["Harari coffee ceremony", "Hyena-feeding heritage", "Community elder mediation"],
      churchesAndMonasteries: ["Harar Christian heritage sites"],
      mosques: ["Jami Mosque", "Harar historic mosques", "Five Gates mosque communities"],
      mountains: ["Hakim Mountain", "Eastern Hararghe highlands"],
      rivers: ["Seasonal Harar streams", "Dechatu watershed"],
      lakes: ["Local seasonal ponds and reservoirs"],
      culturalPractices: ["Harari wall-town traditions", "Islamic scholarship", "Harari language, food, and craft traditions"],
    },
    Hawassa: {
      traditionalMedicines: ["Sidama herbal plant knowledge", "Enset and medicinal leaf preparations", "Honey-based remedies"],
      traditionalPractices: ["Sidama coffee ceremony", "Fiche Chambalala New Year", "Community elders and work parties"],
      churchesAndMonasteries: ["Local Sidama Orthodox churches and monasteries"],
      mosques: ["Hawassa central mosque communities"],
      mountains: ["Mount Aluto", "Sidama highlands"],
      rivers: ["Tikur Wuha River", "Bilate River"],
      lakes: ["Lake Hawassa"],
      culturalPractices: ["Sidama music and dance", "Enset cultivation culture", "Coffee-growing traditions"],
    },
    Jigjiga: {
      traditionalMedicines: ["Aromatic resins and gum preparations", "Black cumin and spice remedies", "Pastoral herbal knowledge"],
      traditionalPractices: ["Pastoral livestock exchange", "Coffee and tea hospitality", "Clan elder mediation"],
      churchesAndMonasteries: ["Local Christian communities and churches"],
      mosques: ["Jigjiga central mosques", "Local neighborhood mosques"],
      mountains: ["Eastern Somali highlands", "Karamara hills"],
      rivers: ["Seasonal wadis", "Fafen watershed"],
      lakes: ["Seasonal pastoral ponds"],
      culturalPractices: ["Somali poetry and oral tradition", "Pastoral mobility", "Islamic festivals and community support"],
    },
  };
  const defaultHeritage = heritage[location.name] ?? {
    traditionalMedicines: ["Local medicinal plant knowledge", "Honey and spice preparations", "Traditional birth and elder-care knowledge"],
    traditionalPractices: ["Coffee or tea hospitality", "Community mutual-aid practices", "Seasonal ceremonies and festivals"],
    churchesAndMonasteries: ["Local churches and monasteries; verify site names locally"],
    mosques: ["Local mosques and Muslim community institutions; verify site names locally"],
    mountains: ["Local highlands and escarpments; verify named peaks locally"],
    rivers: localWater[location.name] ?? ["Seasonal streams", "Local springs and groundwater"],
    lakes: ["Local lakes, reservoirs, or seasonal ponds; verify locally"],
    culturalPractices: ["Local language and oral traditions", "Food and hospitality customs", "Faith and community practices"],
  };
  const geography = location.riftValley
    ? "Rift Valley escarpment or basin landscape with volcanic and lake-forming geology"
    : "Highland, lowland, basin, or plateau landscape shaped by local elevation and drainage";
  const urbanizationLevel = location.name === "Addis Ababa" || location.name === "Dire Dawa" || location.name === "Harar"
    ? "urban"
    : base.crops.includes("Coffee") || location.name === "Bahir Dar" || location.name === "Adama" || location.name === "Hawassa"
      ? "peri_urban"
      : "rural_hub";

  const locationFoods: LocationFoodProfile[] = [
    {
      food: base.crops[0],
      localNames: [base.crops[0]],
      foodGroup: "cereal",
      productionNotes: `Representative ${location.agroZone} crop; production varies by elevation, rainfall, and market access.`,
      ingredients: [base.crops[0], "Water", "Salt where used"],
      processingMethods: ["Cleaning", "Milling", "Cooking or fermentation according to local recipe"],
      preservationMethods: ["Dry grain storage", "Sun-drying", "Hermetic or sealed storage where available"],
      compositionSource: { name: "EFCT", reference: "Use matching EFCT food record before clinical calculations.", intendedUse: "human_food" },
    },
    {
      food: base.livestock[0],
      localNames: [base.livestock[0]],
      foodGroup: "animal",
      productionNotes: `Representative ${location.agroZone} livestock resource.`,
      ingredients: [base.livestock[0], "Feed and water"],
      processingMethods: ["Milking or slaughter under locally approved hygiene controls", "Boiling, cooking, or fermentation"],
      preservationMethods: ["Cooling", "Drying", "Smoking", "Salting"],
      proximateComposition: {
        basis: "dry_matter",
      },
      compositionSource: {
        name: "Feedipedia",
        reference: `Search Feedipedia for the species/feed item before importing a record for ${base.livestock[0]}.`,
        url: "https://www.feedipedia.org/",
        intendedUse: "animal_feed",
      },
    },
  ];
  const agriculturalChemicals: AgriculturalChemicalRecord[] = [
    {
      activeIngredient: "To be verified from local agricultural extension records",
      targetCropOrPest: base.crops.join(", "),
      usePurpose: "pesticide",
      applicationContext: "Do not infer application or residue status from this planning record.",
      sourceNote: "Requires product label, national registration, application rate, pre-harvest interval, and residue testing.",
    },
  ];

  return {
    dataLabel: "indicative_planning_estimate",
    referenceYear: 2024,
    sourceNote: "Ecological, agricultural, industrial, urbanization, food-system, traditional-medicine, heritage, and cultural fields are indicative planning references; verify against local surveys, cultural authorities, and official datasets before operational decisions.",
    ecology: {
      ecosystem: base.ecosystem,
      geography,
      riversAndWaterBodies: localWater[location.name] ?? ["Seasonal streams", "Local springs and groundwater"],
      annualPrecipitationMm: base.annualPrecipitationMm,
      temperatureRangeC: base.temperatureRangeC,
      soilTypes: base.soilTypes,
      forestTypes: base.forestTypes,
      protectedAreasAndBiodiversity: base.protectedAreasAndBiodiversity,
    },
    agriculture: {
      crops: base.crops,
      livestock: base.livestock,
      beesAndApiculture: ["Apis mellifera beekeeping", "Hive products: honey and beeswax", "Seasonal flowering and forage monitoring"],
      fisheries: base.fisheries,
      insectResources: ["Pollinators", "Edible or forage insects where locally documented", "Integrated pest-management monitoring"],
      forestProducts: base.forestProducts,
      productionSystems: ["Smallholder mixed farming", "Market-oriented production", "Seasonal and climate-sensitive production"],
    },
    industryAndUrbanization: {
      leadingIndustries: location.name === "Addis Ababa"
        ? ["Services", "Manufacturing", "Construction", "Trade and logistics", "Food processing"]
        : ["Agricultural processing", "Trade and transport", "Construction materials", "Small and medium enterprises"],
      urbanizationLevel,
      builtUpAreaPct: urbanizationLevel === "urban" ? 55 : urbanizationLevel === "peri_urban" ? 28 : 12,
      infrastructureNotes: ["Road and market access varies by season", "Cold-chain and water infrastructure should be validated locally", "Urban expansion can affect farmland and watershed services"],
    },
    foodAndNutrition: {
      stapleFoods: base.diet,
      fermentedFoodsAndDrinks: ["Injera batter", "Tella", "Tej", "Ergo or fermented milk where locally practiced"],
      commonIngredients: ["Teff", "Maize", "Sorghum", "Pulses", "Greens", "Oilseeds", "Milk or meat according to local livelihood"],
      preparationMethods: ["Fermentation", "Boiling", "Stewing", "Roasting", "Baking on mitad", "Sun-drying"],
      traditionalDietPatterns: base.diet,
      utensilsAndSpices: ["Mitad", "Mefia", "Mortar and pestle", "Berbere", "Shiro", "Korerima", "Rue", "Ginger", "Garlic"],
      preservationMethods: ["Sun-drying", "Smoking", "Salting", "Fermentation", "Grain storage", "Cool or shaded storage"],
    },
    culturalAndHeritage: {
      commonNames: [location.name, ...location.aliases],
      ...defaultHeritage,
    },
    foodSystem: {
      locationFoods,
      pesticideUse: agriculturalChemicals,
      insecticideUse: agriculturalChemicals.map((record) => ({
        ...record,
        usePurpose: "insecticide" as const,
        sourceNote: "Requires locally verified product and residue records; no active ingredient is assumed.",
      })),
      processingFacilitiesAndMethods: [
        "Smallholder milling and grain cleaning",
        "Household and community fermentation",
        "Oilseed pressing where available",
        "Dairy, meat, honey, and fish handling according to local infrastructure",
        "Market and cooperative aggregation",
      ],
    },
  };
};

const RAW_ETHIOPIAN_LOCATIONS: Omit<EthiopianLocation, "systemsProfile" | "denseData">[] = [
  { id: "addis-ababa", region: "Addis Ababa", name: "Addis Ababa", nameAmharic: "አዲስ አበባ", aliases: ["Finfinnee"], latitude: 9.03, longitude: 38.74, altitudeMeters: 2400, agroZone: "dega", riftValley: false, commonLanguages: ["Amharic", "Afaan Oromo", "English"], wellbeingProfile: profile(3600000, 79, 20, 4.0, communicable(12, 145, 3.2, 8200), nonCommunicable(24, 5.8, 310, 92)) },
  { id: "bahir-dar", region: "Amhara", name: "Bahir Dar", nameAmharic: "ባሕር ዳር", aliases: [], latitude: 11.57, longitude: 37.36, altitudeMeters: 1800, agroZone: "weina_dega", riftValley: false, commonLanguages: ["Amharic"], wellbeingProfile: profile(500000, 58, 19, 4.7, communicable(65, 170, 2.1, 11500), nonCommunicable(18, 3.9, 360, 65)) },
  { id: "gondar", region: "Amhara", name: "Gondar", nameAmharic: "ጎንደር", aliases: [], latitude: 12.61, longitude: 37.47, altitudeMeters: 2133, agroZone: "weina_dega", riftValley: false, commonLanguages: ["Amharic"], wellbeingProfile: profile(500000, 62, 19, 4.8, communicable(48, 190, 2.0, 10800), nonCommunicable(19, 4.2, 375, 70)) },
  { id: "mekelle", region: "Tigray", name: "Mekelle", nameAmharic: "መቀሌ", aliases: [], latitude: 13.50, longitude: 39.47, altitudeMeters: 2084, agroZone: "weina_dega", riftValley: false, commonLanguages: ["Tigrinya", "Amharic"], wellbeingProfile: profile(500000, 70, 20, 4.3, communicable(25, 210, 1.8, 9200), nonCommunicable(22, 5.0, 420, 82)) },
  { id: "adama", region: "Oromia", name: "Adama", nameAmharic: "አዳማ", aliases: ["Nazret"], latitude: 8.54, longitude: 39.27, altitudeMeters: 1712, agroZone: "weina_dega", riftValley: true, commonLanguages: ["Afaan Oromo", "Amharic"], wellbeingProfile: profile(500000, 76, 21, 4.2, communicable(80, 155, 2.6, 9800), nonCommunicable(25, 6.4, 330, 105)) },
  { id: "hawassa", region: "Sidama", name: "Hawassa", nameAmharic: "ሀዋሳ", aliases: [], latitude: 7.06, longitude: 38.48, altitudeMeters: 1708, agroZone: "weina_dega", riftValley: true, commonLanguages: ["Sidamo", "Amharic", "Afaan Oromo"], wellbeingProfile: profile(500000, 62, 20, 4.5, communicable(95, 165, 3.1, 10500), nonCommunicable(23, 5.9, 340, 98)) },
  { id: "arbaminch", region: "South Ethiopia", name: "Arba Minch", nameAmharic: "አርባ ምንጭ", aliases: ["Arba Minch"], latitude: 6.03, longitude: 37.55, altitudeMeters: 1285, agroZone: "kolla", riftValley: true, commonLanguages: ["Gamo", "Amharic"], wellbeingProfile: profile(120000, 48, 19, 5.0, communicable(130, 175, 2.5, 13200), nonCommunicable(19, 4.0, 300, 68)) },
  { id: "dire-dawa", region: "Dire Dawa", name: "Dire Dawa", nameAmharic: "ድሬ ዳዋ", aliases: [], latitude: 9.60, longitude: 41.85, altitudeMeters: 1276, agroZone: "kolla", riftValley: false, commonLanguages: ["Afaan Oromo", "Somali", "Amharic"], wellbeingProfile: profile(530000, 72, 21, 4.1, communicable(105, 150, 2.4, 9800), nonCommunicable(27, 6.8, 360, 112)) },
  { id: "jigjiga", region: "Somali", name: "Jigjiga", nameAmharic: "ጅጅጋ", aliases: [], latitude: 9.35, longitude: 42.80, altitudeMeters: 1609, agroZone: "weina_dega", riftValley: false, commonLanguages: ["Somali", "Amharic"], wellbeingProfile: profile(250000, 45, 18, 5.4, communicable(35, 125, 1.5, 14600), nonCommunicable(16, 3.1, 260, 52,), 15) },
  { id: "semera", region: "Afar", name: "Semera", nameAmharic: "ሰመራ", aliases: [], latitude: 11.79, longitude: 41.01, altitudeMeters: 430, agroZone: "bereha", riftValley: true, commonLanguages: ["Afar", "Amharic"], wellbeingProfile: profile(60000, 78, 19, 5.1, communicable(210, 135, 1.3, 16100), nonCommunicable(17, 3.4, 240, 45)) },
  { id: "assosa", region: "Benishangul-Gumuz", name: "Assosa", nameAmharic: "አሶሳ", aliases: [], latitude: 10.07, longitude: 34.53, altitudeMeters: 1570, agroZone: "weina_dega", riftValley: false, commonLanguages: ["Amharic", "Berta"], wellbeingProfile: profile(70000, 42, 18, 5.3, communicable(180, 220, 2.2, 15800), nonCommunicable(15, 2.8, 250, 48)) },
  { id: "gambella", region: "Gambella", name: "Gambella", nameAmharic: "ጋምቤላ", aliases: [], latitude: 8.25, longitude: 34.59, altitudeMeters: 526, agroZone: "kolla", riftValley: false, commonLanguages: ["Nuer", "Anywaa", "Amharic"], wellbeingProfile: profile(75000, 48, 18, 5.5, communicable(260, 240, 3.0, 18300), nonCommunicable(14, 2.6, 220, 42)) },
  { id: "harar", region: "Harari", name: "Harar", nameAmharic: "ሐረሪ", aliases: [], latitude: 9.31, longitude: 42.13, altitudeMeters: 1885, agroZone: "weina_dega", riftValley: false, commonLanguages: ["Harari", "Afaan Oromo", "Amharic"], wellbeingProfile: profile(125000, 85, 22, 3.9, communicable(44, 130, 2.8, 7600), nonCommunicable(29, 7.2, 390, 120)) },
];

export const ETHIOPIAN_LOCATIONS: EthiopianLocation[] = RAW_ETHIOPIAN_LOCATIONS.map((location) => ({
  ...location,
  systemsProfile: buildSystemsProfile(location),
  denseData: {
    ...buildDenseLocationData(location.id),
    observations: [
      ...location.wellbeingProfile.communicableDiseaseRates,
      ...location.wellbeingProfile.nonCommunicableDiseaseRates,
    ].map((rate, index): LocationObservation => ({
      observationUid: `urn:obs:et:${location.id}:${index + 1}`,
      observationId: `${location.id}-${rate.condition.toLowerCase().replaceAll(" ", "-")}-${location.wellbeingProfile.referenceYear}-${index + 1}`,
      locationId: location.id,
      spatialId: `urn:loc:et:${location.id}`,
      indicatorCode: `health.${rate.condition.toLowerCase().replaceAll(" ", ".")}`,
      value: rate.value,
      unit: rate.measure === "prevalence_pct" ? "pct" : rate.measure === "mortality_per_100k" ? "per_100k" : "per_100k",
      method: "estimate",
      methodFamily: "estimate",
      methodDetail: "Town-level planning estimate generated from the existing location profile.",
      disaggregation: rate.populationScope,
      disaggregationAxes: { population_scope: rate.populationScope },
      periodType: "year",
      periodValue: String(location.wellbeingProfile.referenceYear),
      validFrom: `${location.wellbeingProfile.referenceYear}-01-01`,
      validTo: `${location.wellbeingProfile.referenceYear}-12-31`,
      transactionFrom: "2026-09-18T00:00:00Z",
      referenceYear: location.wellbeingProfile.referenceYear,
      dataStatus: "estimated",
      confidenceLevel: "very_low",
      confidenceBasis: "inferred",
      confidenceRationale: "Planning estimate; no source citation or survey microdata is currently linked.",
      rightsCode: "internal-reference",
      sensitivityClass: "internal",
      note: "Population-level planning estimate; not an individual diagnosis.",
    })),
  },
}));

export const ETHIOPIAN_REGION_LOCATIONS = Array.from(
  new Map(ETHIOPIAN_LOCATIONS.map((location) => [location.region, location])).values(),
);

export function resolveEthiopianLocation(input?: string): EthiopianLocation {
  const normalized = String(input || "").trim().toLowerCase();
  return ETHIOPIAN_LOCATIONS.find((location) =>
    [location.name, location.region, ...location.aliases].some((value) =>
      value.toLowerCase() === normalized || normalized.includes(value.toLowerCase()) || value.toLowerCase().includes(normalized),
    ),
  ) || ETHIOPIAN_LOCATIONS[0];
}

export function getEthiopianLocationOptions() {
  return ETHIOPIAN_LOCATIONS.map(({ id, region, name, nameAmharic, altitudeMeters, agroZone, wellbeingProfile, systemsProfile, denseData }) => ({
    id, region, name, nameAmharic, altitudeMeters, agroZone, wellbeingProfile, systemsProfile, denseData,
  }));
}
