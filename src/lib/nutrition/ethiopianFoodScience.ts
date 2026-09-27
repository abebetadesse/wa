/**
 * Ethiopian Food Biochemistry, Proximate Composition, Recipes & Raw Materials Dataset
 * Sources: Ethiopian Food Composition Table (EFCT 2025), EPHI / EHNRI, FAO/INFOODS,
 * and peer-reviewed literature on indigenous Ethiopian crops, fermentation & processing.
 */

export interface ProximateComposition {
  moistureG: number; // g / 100g
  dryMatterG: number; // g / 100g
  proteinG: number; // crude protein (N x 6.25 or 5.7)
  fatG: number; // crude fat / ether extract
  carbohydrateG: number; // available carbohydrate
  dietaryFiberG: number; // total dietary fiber
  solubleFiberG?: number;
  insolubleFiberG?: number;
  ashG: number; // mineral residue
  energyKcal: number; // metabolizable energy
  energyKj: number;
}

export interface MineralProfile {
  ironMg: number;
  calciumMg: number;
  zincMg: number;
  magnesiumMg: number;
  phosphorusMg: number;
  potassiumMg: number;
  sodiumMg: number;
  copperMg?: number;
  manganeseMg?: number;
  seleniumMcg?: number;
}

export interface VitaminProfile {
  vitaminAMcgRae?: number;
  vitaminCMg?: number;
  thiaminB1Mg?: number;
  riboflavinB2Mg?: number;
  niacinB3Mg?: number;
  vitaminB6Mg?: number;
  folateB9Mcg?: number;
  vitaminB12Mcg?: number;
  vitaminEMg?: number;
  vitaminKMcg?: number;
}

export interface AminoAcidProfile {
  // Essential Amino Acids (g / 100g protein)
  lysine: number;
  methionine: number;
  cysteine: number;
  threonine: number;
  tryptophan: number;
  valine: number;
  leucine: number;
  isoleucine: number;
  phenylalanine: number;
  tyrosine: number;
  histidine: number;
  limitingAminoAcid: string;
  proteinComplementationPartner?: string;
  digestibilityCorrectedScore?: number; // Estimated PDCAAS
}

export interface FattyAcidProfile {
  saturatedPct: number; // % of total fat
  monounsaturatedPct: number;
  polyunsaturatedPct: number;
  palmiticAcidC16_0?: number; // g / 100g fat
  stearicAcidC18_0?: number;
  oleicAcidC18_1n9?: number;
  linoleicAcidC18_2n6?: number; // Omega-6
  alphaLinolenicAcidC18_3n3?: number; // Omega-3
  omega6ToOmega3Ratio?: number;
}

export interface PhenolicBioactiveProfile {
  totalPhenolicsMgGae: number; // mg Gallic Acid Equiv / 100g
  totalFlavonoidsMgQe: number; // mg Quercetin Equiv / 100g
  proanthocyanidinsMg?: number; // condensed tannins
  ferulicAcidMg?: number;
  quercetinMg?: number;
  apigeninMg?: number;
  luteolinMg?: number;
  antioxidantCapacityDpphPct?: number; // % scavenging
  keyBioactives: string[];
}

export interface AntinutritionalFactors {
  phyticAcidMgPer100g: number;
  condensedTanninsMgPer100g: number;
  totalOxalatesMgPer100g: number;
  solubleOxalatesMgPer100g?: number;
  trypsinInhibitorTiuMg?: number;
  saponinsMgPer100g?: number;
  betaOdapMgPer100g?: number; // for Grass pea
  phytateToIronMolarRatio: number; // critical indicator: < 1.0 is favorable for Fe bioavailability
  phytateToZincMolarRatio: number; // critical indicator: < 15 is favorable for Zn bioavailability
  traditionalProcessingImpact: {
    fermentationReductionPct: number; // e.g. 75%
    soakingReductionPct: number; // e.g. 40%
    roastingReductionPct: number; // e.g. 35%
    bioavailabilityMultiplier: number; // e.g. 1.55x
    biochemicalMechanism: string;
  };
}

export interface RawCerealOrIngredient {
  id: string;
  nameEn: string;
  nameAmharic: string;
  scientificName: string;
  category: "Cereal Grain" | "Pulse / Legume" | "Root / Tuber" | "Oilseed" | "Spice / Aromatic";
  partUsed: string;
  traditionalCulinaryRole: string[];
  growingEcology: string;
  proximate: ProximateComposition;
  minerals: MineralProfile;
  vitamins: VitaminProfile;
  aminoAcids: AminoAcidProfile;
  fattyAcids: FattyAcidProfile;
  phenolics: PhenolicBioactiveProfile;
  antinutrients: AntinutritionalFactors;
}

export interface RecipeIngredientItem {
  ingredientId: string;
  nameEn: string;
  nameAmharic: string;
  amountGrams: number;
  percentageOfTotal: number;
  processingState: "raw" | "milled" | "fermented" | "roasted" | "boiled" | "cooked";
  role: string;
  proximateContribution: Partial<ProximateComposition & MineralProfile>;
}

export interface TraditionalRecipe {
  id: string;
  nameEn: string;
  nameAmharic: string;
  category: "Staple Flatbread" | "Stew / Wot" | "Porridge & Grain" | "Beverage / Convalescent" | "Snack / Bread";
  yieldGrams: number;
  servingGrams: number;
  preparationTime: string;
  fermentationDurationHours?: number;
  fastingSuitability: "fasting_friendly" | "non_fasting" | "dual";
  description: string;
  traditionalMethodSteps: string[];
  ingredients: RecipeIngredientItem[];
  compositeProximate: ProximateComposition;
  compositeMinerals: MineralProfile;
  compositeVitamins: VitaminProfile;
  antinutrientDegradationSummary: {
    nativePhytateTotalMg: number;
    cookedPhytateTotalMg: number;
    degradationPercentage: number;
    ironBioavailabilityUplift: string;
  };
  proteinComplementationNotes: string;
}

// ============================================================================
// 1. RAW CEREALS, PULSES, TUBERS & OILSEEDS DATABASE
// ============================================================================

export const ETHIOPIAN_RAW_CEREALS_AND_MATERIALS: RawCerealOrIngredient[] = [
  {
    id: "cereal-red-teff",
    nameEn: "Red Teff (Qey Teff)",
    nameAmharic: "ቀይ ጤፍ",
    scientificName: "Eragrostis tef var. rubicunda",
    category: "Cereal Grain",
    partUsed: "Whole caryopsis grain (endosperm, germ & pericarp bran)",
    traditionalCulinaryRole: ["Fermented Red Injera", "Muk / Porridge", "Traditional Tella brewing"],
    growingEcology: "Highland Dega and Weyna Dega (1,800–2,600m), vertisols and red loam",
    proximate: {
      moistureG: 9.5,
      dryMatterG: 90.5,
      proteinG: 13.5,
      fatG: 2.5,
      carbohydrateG: 72.5,
      dietaryFiberG: 8.5,
      solubleFiberG: 2.1,
      insolubleFiberG: 6.4,
      ashG: 3.0,
      energyKcal: 367,
      energyKj: 1535,
    },
    minerals: {
      ironMg: 15.2, // Peak botanical iron density in bran layer
      calciumMg: 172.0,
      zincMg: 4.2,
      magnesiumMg: 182.0,
      phosphorusMg: 380.0,
      potassiumMg: 415.0,
      sodiumMg: 12.0,
      copperMg: 0.85,
      manganeseMg: 6.2,
      seleniumMcg: 14.5,
    },
    vitamins: {
      vitaminAMcgRae: 5.0,
      thiaminB1Mg: 0.42,
      riboflavinB2Mg: 0.28,
      niacinB3Mg: 3.45,
      vitaminB6Mg: 0.48,
      folateB9Mcg: 48.0,
      vitaminEMg: 0.95,
      vitaminKMcg: 1.8,
    },
    aminoAcids: {
      lysine: 3.4,
      methionine: 3.1, // Exceptionally high methionine for a grain
      cysteine: 2.5,
      threonine: 4.1,
      tryptophan: 1.3,
      valine: 5.6,
      leucine: 8.4,
      isoleucine: 4.2,
      phenylalanine: 5.8,
      tyrosine: 3.9,
      histidine: 3.0,
      limitingAminoAcid: "Lysine (complemented by legumes/Shiro)",
      proteinComplementationPartner: "Chickpeas (Shiro) or Lentils (Misir)",
      digestibilityCorrectedScore: 0.68,
    },
    fattyAcids: {
      saturatedPct: 18.0,
      monounsaturatedPct: 32.5,
      polyunsaturatedPct: 49.5,
      palmiticAcidC16_0: 15.2,
      stearicAcidC18_0: 2.4,
      oleicAcidC18_1n9: 32.5,
      linoleicAcidC18_2n6: 45.8,
      alphaLinolenicAcidC18_3n3: 3.7,
      omega6ToOmega3Ratio: 12.4,
    },
    phenolics: {
      totalPhenolicsMgGae: 295.0, // Highest among teff grains
      totalFlavonoidsMgQe: 135.0,
      proanthocyanidinsMg: 95.0,
      ferulicAcidMg: 45.0,
      quercetinMg: 14.2,
      apigeninMg: 8.5,
      luteolinMg: 7.1,
      antioxidantCapacityDpphPct: 78.5,
      keyBioactives: ["Condensed proanthocyanidins", "Bound ferulic acid", "Apigenin-C-glucosides"],
    },
    antinutrients: {
      phyticAcidMgPer100g: 860.0,
      condensedTanninsMgPer100g: 145.0,
      totalOxalatesMgPer100g: 42.0,
      solubleOxalatesMgPer100g: 12.0,
      trypsinInhibitorTiuMg: 2.1,
      phytateToIronMolarRatio: 4.79, // Native raw ratio (blocks iron absorption)
      phytateToZincMolarRatio: 20.2, // Native raw ratio
      traditionalProcessingImpact: {
        fermentationReductionPct: 78, // Reduced to ~189 mg phytate after 4-day Ersho
        soakingReductionPct: 35,
        roastingReductionPct: 28,
        bioavailabilityMultiplier: 1.55,
        biochemicalMechanism: "Ersho backslopped fermentation activates endogenous and lactic microbial phytases, hydrolyzing inositol hexaphosphate (IP6) to lower inositol polyphosphates (IP1–IP3) and liberating Fe2+ and Zn2+.",
      },
    },
  },
  {
    id: "cereal-brown-teff",
    nameEn: "Brown Teff (Sergegna / Bunama Teff)",
    nameAmharic: "ሰርገኛ / ቡናማ ጤፍ",
    scientificName: "Eragrostis tef (Brown/Mixed)",
    category: "Cereal Grain",
    partUsed: "Whole caryopsis grain",
    traditionalCulinaryRole: ["Everyday Household Injera", "Genfo / Porridge", "Atmit gruel"],
    growingEcology: "Mid-to-high altitude Ethiopian plateau (1,700–2,500m)",
    proximate: {
      moistureG: 9.2,
      dryMatterG: 90.8,
      proteinG: 13.1,
      fatG: 2.4,
      carbohydrateG: 73.1,
      dietaryFiberG: 8.0,
      solubleFiberG: 1.9,
      insolubleFiberG: 6.1,
      ashG: 2.8,
      energyKcal: 367,
      energyKj: 1535,
    },
    minerals: {
      ironMg: 11.5,
      calciumMg: 155.0,
      zincMg: 3.9,
      magnesiumMg: 165.0,
      phosphorusMg: 365.0,
      potassiumMg: 395.0,
      sodiumMg: 11.0,
      copperMg: 0.78,
      manganeseMg: 5.8,
      seleniumMcg: 12.8,
    },
    vitamins: {
      thiaminB1Mg: 0.39,
      riboflavinB2Mg: 0.25,
      niacinB3Mg: 3.36,
      vitaminB6Mg: 0.44,
      folateB9Mcg: 44.0,
      vitaminEMg: 0.88,
    },
    aminoAcids: {
      lysine: 3.5,
      methionine: 2.9,
      cysteine: 2.3,
      threonine: 3.9,
      tryptophan: 1.3,
      valine: 5.4,
      leucine: 8.1,
      isoleucine: 4.1,
      phenylalanine: 5.5,
      tyrosine: 3.7,
      histidine: 2.9,
      limitingAminoAcid: "Lysine",
      proteinComplementationPartner: "Chickpeas, Faba beans, or Lentils",
      digestibilityCorrectedScore: 0.7,
    },
    fattyAcids: {
      saturatedPct: 18.5,
      monounsaturatedPct: 33.0,
      polyunsaturatedPct: 48.5,
      oleicAcidC18_1n9: 33.0,
      linoleicAcidC18_2n6: 45.0,
      alphaLinolenicAcidC18_3n3: 3.5,
    },
    phenolics: {
      totalPhenolicsMgGae: 215.0,
      totalFlavonoidsMgQe: 98.0,
      proanthocyanidinsMg: 65.0,
      ferulicAcidMg: 38.0,
      antioxidantCapacityDpphPct: 69.0,
      keyBioactives: ["Soluble & bound ferulic acid", "Flavone C-glycosides"],
    },
    antinutrients: {
      phyticAcidMgPer100g: 780.0,
      condensedTanninsMgPer100g: 88.0,
      totalOxalatesMgPer100g: 35.0,
      trypsinInhibitorTiuMg: 1.8,
      phytateToIronMolarRatio: 5.74,
      phytateToZincMolarRatio: 19.8,
      traditionalProcessingImpact: {
        fermentationReductionPct: 75,
        soakingReductionPct: 32,
        roastingReductionPct: 25,
        bioavailabilityMultiplier: 1.48,
        biochemicalMechanism: "72-96h backslopped fermentation degrades 75% of phytates, bringing phytate:iron ratio below 1.4.",
      },
    },
  },
  {
    id: "cereal-white-teff",
    nameEn: "White Teff (Nech Teff / Magna)",
    nameAmharic: "ነጭ ጤፍ / ማግና",
    scientificName: "Eragrostis tef var. alba",
    category: "Cereal Grain",
    partUsed: "Whole caryopsis grain",
    traditionalCulinaryRole: ["Celebratory Festive Injera", "Fine Dabo bread"],
    growingEcology: "Moderate moisture, high-fertility highlands (East & West Gojjam, Ada'a / Debre Zeyit)",
    proximate: {
      moistureG: 9.8,
      dryMatterG: 90.2,
      proteinG: 12.4,
      fatG: 2.2,
      carbohydrateG: 73.8,
      dietaryFiberG: 6.8,
      ashG: 2.2,
      energyKcal: 366,
      energyKj: 1531,
    },
    minerals: {
      ironMg: 7.6,
      calciumMg: 145.0,
      zincMg: 3.8,
      magnesiumMg: 150.0,
      phosphorusMg: 340.0,
      potassiumMg: 380.0,
      sodiumMg: 10.0,
    },
    vitamins: {
      thiaminB1Mg: 0.35,
      riboflavinB2Mg: 0.22,
      niacinB3Mg: 3.1,
      vitaminB6Mg: 0.4,
      folateB9Mcg: 40.0,
    },
    aminoAcids: {
      lysine: 3.6,
      methionine: 2.8,
      cysteine: 2.2,
      threonine: 3.8,
      tryptophan: 1.2,
      valine: 5.2,
      leucine: 8.0,
      isoleucine: 4.0,
      phenylalanine: 5.3,
      tyrosine: 3.5,
      histidine: 2.8,
      limitingAminoAcid: "Lysine",
      digestibilityCorrectedScore: 0.72,
    },
    fattyAcids: {
      saturatedPct: 19.0,
      monounsaturatedPct: 33.5,
      polyunsaturatedPct: 47.5,
      linoleicAcidC18_2n6: 44.0,
      alphaLinolenicAcidC18_3n3: 3.5,
    },
    phenolics: {
      totalPhenolicsMgGae: 115.0,
      totalFlavonoidsMgQe: 48.0,
      proanthocyanidinsMg: 22.0,
      ferulicAcidMg: 28.0,
      antioxidantCapacityDpphPct: 45.0,
      keyBioactives: ["Ferulic acid derivatives", "Resistant retrograded starch"],
    },
    antinutrients: {
      phyticAcidMgPer100g: 720.0,
      condensedTanninsMgPer100g: 35.0,
      totalOxalatesMgPer100g: 28.0,
      phytateToIronMolarRatio: 8.02,
      phytateToZincMolarRatio: 18.7,
      traditionalProcessingImpact: {
        fermentationReductionPct: 70,
        soakingReductionPct: 30,
        roastingReductionPct: 22,
        bioavailabilityMultiplier: 1.4,
        biochemicalMechanism: "Lactic acid lowering of pH accelerates phytate hydrolysis and softens gluten-free starch gel.",
      },
    },
  },
  {
    id: "cereal-highland-barley",
    nameEn: "Highland Barley (Gebs)",
    nameAmharic: "ገብስ",
    scientificName: "Hordeum vulgare",
    category: "Cereal Grain",
    partUsed: "Whole kernel / hulled grain",
    traditionalCulinaryRole: ["Beso (roasted barley powder)", "Kolo (roasted grain snack)", "Tella malting (Bikil)", "Genfo porridge"],
    growingEcology: "Highland afro-alpine Dega & Wurch (2,200–3,500m), frost-tolerant",
    proximate: {
      moistureG: 10.1,
      dryMatterG: 89.9,
      proteinG: 12.5,
      fatG: 2.3,
      carbohydrateG: 73.5,
      dietaryFiberG: 17.3, // Exceptionally high total dietary fiber
      solubleFiberG: 4.8, // Rich in cholesterol-lowering Beta-Glucans!
      insolubleFiberG: 12.5,
      ashG: 2.3,
      energyKcal: 354,
      energyKj: 1481,
    },
    minerals: {
      ironMg: 3.6,
      calciumMg: 33.0,
      zincMg: 2.8,
      magnesiumMg: 133.0,
      phosphorusMg: 264.0,
      potassiumMg: 452.0,
      sodiumMg: 12.0,
      copperMg: 0.5,
      manganeseMg: 1.9,
      seleniumMcg: 37.7,
    },
    vitamins: {
      thiaminB1Mg: 0.65,
      riboflavinB2Mg: 0.28,
      niacinB3Mg: 4.6,
      vitaminB6Mg: 0.32,
      folateB9Mcg: 19.0,
      vitaminEMg: 0.57,
    },
    aminoAcids: {
      lysine: 3.8,
      methionine: 1.9,
      cysteine: 2.2,
      threonine: 3.4,
      tryptophan: 1.4,
      valine: 5.1,
      leucine: 6.9,
      isoleucine: 3.7,
      phenylalanine: 5.2,
      tyrosine: 3.1,
      histidine: 2.4,
      limitingAminoAcid: "Lysine / Threonine",
      proteinComplementationPartner: "Roasted faba bean / pea kolo",
      digestibilityCorrectedScore: 0.65,
    },
    fattyAcids: {
      saturatedPct: 22.0,
      monounsaturatedPct: 15.0,
      polyunsaturatedPct: 63.0,
      oleicAcidC18_1n9: 15.0,
      linoleicAcidC18_2n6: 57.0,
      alphaLinolenicAcidC18_3n3: 6.0,
    },
    phenolics: {
      totalPhenolicsMgGae: 145.0,
      totalFlavonoidsMgQe: 62.0,
      proanthocyanidinsMg: 48.0,
      ferulicAcidMg: 32.0,
      antioxidantCapacityDpphPct: 58.0,
      keyBioactives: ["Mixed-linkage (1→3),(1→4)-beta-D-glucan", "Prodelphinidin", "Catechin"],
    },
    antinutrients: {
      phyticAcidMgPer100g: 620.0,
      condensedTanninsMgPer100g: 52.0,
      totalOxalatesMgPer100g: 22.0,
      phytateToIronMolarRatio: 14.5,
      phytateToZincMolarRatio: 21.9,
      traditionalProcessingImpact: {
        fermentationReductionPct: 68,
        soakingReductionPct: 45,
        roastingReductionPct: 40, // Dry roasting into Beso denatures enzyme inhibitors
        bioavailabilityMultiplier: 1.35,
        biochemicalMechanism: "Traditional sand or clay griddle roasting (Maqtet / Qolo) heats grain above 140°C, dextrinizing starch and reducing phytic acid while preserving soluble beta-glucan fiber.",
      },
    },
  },
  {
    id: "cereal-finger-millet",
    nameEn: "Finger Millet (Dagussa)",
    nameAmharic: "ዳጉሳ",
    scientificName: "Eleusine coracana",
    category: "Cereal Grain",
    partUsed: "Whole small seeded grain",
    traditionalCulinaryRole: ["Fermented Dagussa Injera", "Tella / Areki brewing starter", "Infant weaning porridge", "Kitta flatbread"],
    growingEcology: "Warm sub-humid to semi-arid midlands (Gojjam, Gonder, Tigray, Wollega)",
    proximate: {
      moistureG: 8.7,
      dryMatterG: 91.3,
      proteinG: 11.0,
      fatG: 4.2,
      carbohydrateG: 72.0,
      dietaryFiberG: 18.6,
      ashG: 2.7,
      energyKcal: 378,
      energyKj: 1582,
    },
    minerals: {
      ironMg: 3.9,
      calciumMg: 348.0, // Exceptional record-breaking botanical calcium density!
      zincMg: 2.3,
      magnesiumMg: 137.0,
      phosphorusMg: 283.0,
      potassiumMg: 408.0,
      sodiumMg: 11.0,
    },
    vitamins: {
      thiaminB1Mg: 0.42,
      riboflavinB2Mg: 0.19,
      niacinB3Mg: 1.1,
      folateB9Mcg: 18.0,
    },
    aminoAcids: {
      lysine: 2.9,
      methionine: 3.2,
      cysteine: 2.5,
      threonine: 4.2,
      tryptophan: 1.4,
      valine: 6.6,
      leucine: 9.5,
      isoleucine: 4.4,
      phenylalanine: 5.2,
      tyrosine: 3.4,
      histidine: 2.3,
      limitingAminoAcid: "Lysine",
      digestibilityCorrectedScore: 0.62,
    },
    fattyAcids: {
      saturatedPct: 24.0,
      monounsaturatedPct: 35.0,
      polyunsaturatedPct: 41.0,
      linoleicAcidC18_2n6: 38.0,
      alphaLinolenicAcidC18_3n3: 3.0,
    },
    phenolics: {
      totalPhenolicsMgGae: 385.0,
      totalFlavonoidsMgQe: 185.0,
      proanthocyanidinsMg: 160.0,
      ferulicAcidMg: 62.0,
      antioxidantCapacityDpphPct: 82.0,
      keyBioactives: ["Proanthocyanidins", "C-glycosylflavones", "Quercetin-3-O-glucoside"],
    },
    antinutrients: {
      phyticAcidMgPer100g: 790.0,
      condensedTanninsMgPer100g: 360.0,
      totalOxalatesMgPer100g: 45.0,
      phytateToIronMolarRatio: 17.1,
      phytateToZincMolarRatio: 34.0,
      traditionalProcessingImpact: {
        fermentationReductionPct: 72,
        soakingReductionPct: 48,
        roastingReductionPct: 35,
        bioavailabilityMultiplier: 1.5,
        biochemicalMechanism: "Malting / germination (Bikil) activates endogenous alpha-amylase and phytase, dropping tannins by 60% and phytates by 55%, rendering the 348mg calcium fully bioavailable.",
      },
    },
  },
  {
    id: "cereal-emmer-wheat",
    nameEn: "Emmer Wheat (Aja / Ajas)",
    nameAmharic: "አጃ",
    scientificName: "Triticum dicoccum",
    category: "Cereal Grain",
    partUsed: "Hulled grain kernel",
    traditionalCulinaryRole: ["Healing Kinche", "Porridge for bone fracture recovery", "Traditional medicinal Dabo"],
    growingEcology: "High-altitude escarpments (Bale, Shewa, Wollo highlands)",
    proximate: {
      moistureG: 10.2,
      dryMatterG: 89.8,
      proteinG: 14.8, // Highest protein content among ancient wheats
      fatG: 2.6,
      carbohydrateG: 68.5,
      dietaryFiberG: 10.5,
      ashG: 2.0,
      energyKcal: 355,
      energyKj: 1485,
    },
    minerals: {
      ironMg: 4.8,
      calciumMg: 45.0,
      zincMg: 3.9,
      magnesiumMg: 140.0,
      phosphorusMg: 390.0,
      potassiumMg: 385.0,
      sodiumMg: 8.0,
    },
    vitamins: {
      thiaminB1Mg: 0.48,
      riboflavinB2Mg: 0.18,
      niacinB3Mg: 5.2,
      vitaminB6Mg: 0.42,
      folateB9Mcg: 38.0,
    },
    aminoAcids: {
      lysine: 3.1,
      methionine: 2.0,
      cysteine: 2.4,
      threonine: 3.2,
      tryptophan: 1.3,
      valine: 4.8,
      leucine: 7.2,
      isoleucine: 3.8,
      phenylalanine: 5.1,
      tyrosine: 3.3,
      histidine: 2.6,
      limitingAminoAcid: "Lysine",
      digestibilityCorrectedScore: 0.75,
    },
    fattyAcids: {
      saturatedPct: 19.0,
      monounsaturatedPct: 18.0,
      polyunsaturatedPct: 63.0,
      linoleicAcidC18_2n6: 58.0,
      alphaLinolenicAcidC18_3n3: 5.0,
    },
    phenolics: {
      totalPhenolicsMgGae: 165.0,
      totalFlavonoidsMgQe: 55.0,
      ferulicAcidMg: 52.0,
      antioxidantCapacityDpphPct: 64.0,
      keyBioactives: ["Lutein", "Free & bound alkylresorcinols", "Ferulic acid"],
    },
    antinutrients: {
      phyticAcidMgPer100g: 740.0,
      condensedTanninsMgPer100g: 38.0,
      totalOxalatesMgPer100g: 25.0,
      phytateToIronMolarRatio: 13.0,
      phytateToZincMolarRatio: 18.8,
      traditionalProcessingImpact: {
        fermentationReductionPct: 65,
        soakingReductionPct: 40,
        roastingReductionPct: 30,
        bioavailabilityMultiplier: 1.38,
        biochemicalMechanism: "Cracking and gentle simmering (Kinche) swells starch granules without destroying heat-sensitive carotenoids.",
      },
    },
  },
  {
    id: "cereal-sorghum",
    nameEn: "Sorghum (Mashila)",
    nameAmharic: "ማሽላ",
    scientificName: "Sorghum bicolor",
    category: "Cereal Grain",
    partUsed: "Whole caryopsis",
    traditionalCulinaryRole: ["Injera blend", "Porridge", "Tella brewing grain"],
    growingEcology: "Lowland and intermediate zones, drought and heat tolerant",
    proximate: {
      moistureG: 9.2,
      dryMatterG: 90.8,
      proteinG: 10.6,
      fatG: 3.5,
      carbohydrateG: 72.1,
      dietaryFiberG: 6.7,
      ashG: 1.6,
      energyKcal: 329,
      energyKj: 1377,
    },
    minerals: {
      ironMg: 4.4,
      calciumMg: 28.0,
      zincMg: 2.2,
      magnesiumMg: 140.0,
      phosphorusMg: 287.0,
      potassiumMg: 350.0,
      sodiumMg: 6.0,
    },
    vitamins: {
      thiaminB1Mg: 0.38,
      riboflavinB2Mg: 0.15,
      niacinB3Mg: 3.8,
      folateB9Mcg: 20.0,
    },
    aminoAcids: {
      lysine: 2.2,
      methionine: 1.8,
      cysteine: 1.6,
      threonine: 3.3,
      tryptophan: 1.1,
      valine: 5.2,
      leucine: 13.5, // High leucine can impact tryptophan-niacin pathways
      isoleucine: 4.0,
      phenylalanine: 5.1,
      tyrosine: 3.2,
      histidine: 2.3,
      limitingAminoAcid: "Lysine",
      digestibilityCorrectedScore: 0.58,
    },
    fattyAcids: {
      saturatedPct: 16.0,
      monounsaturatedPct: 34.0,
      polyunsaturatedPct: 50.0,
      oleicAcidC18_1n9: 33.0,
      linoleicAcidC18_2n6: 47.0,
    },
    phenolics: {
      totalPhenolicsMgGae: 420.0,
      totalFlavonoidsMgQe: 210.0,
      proanthocyanidinsMg: 280.0,
      antioxidantCapacityDpphPct: 88.0,
      keyBioactives: ["3-Deoxyanthocyanidins (Luteolinidin, Apigeninidin)", "Condensed tannins"],
    },
    antinutrients: {
      phyticAcidMgPer100g: 780.0,
      condensedTanninsMgPer100g: 420.0,
      totalOxalatesMgPer100g: 32.0,
      phytateToIronMolarRatio: 15.0,
      phytateToZincMolarRatio: 35.1,
      traditionalProcessingImpact: {
        fermentationReductionPct: 74,
        soakingReductionPct: 50,
        roastingReductionPct: 30,
        bioavailabilityMultiplier: 1.45,
        biochemicalMechanism: "Decortication and fermentation reduce tannins by up to 75%, preventing enzyme cross-linking.",
      },
    },
  },
  {
    id: "material-enset-qocho",
    nameEn: "Enset Qocho (Fermented Pseudostem)",
    nameAmharic: "ቆጮ",
    scientificName: "Ensete ventricosum",
    category: "Root / Tuber",
    partUsed: "Fermented scraped pseudostem and pulverized corm pulp",
    traditionalCulinaryRole: ["Baked Qocho flatbread", "Kitfo base carbohydrate", "Dibe porridge"],
    growingEcology: "Southern highlands (Gurage, Sidama, Wolayta, Gedeo, Keffa; 1,600–3,000m)",
    proximate: {
      moistureG: 48.5,
      dryMatterG: 51.5,
      proteinG: 2.4,
      fatG: 0.6,
      carbohydrateG: 46.5,
      dietaryFiberG: 4.8,
      ashG: 1.8,
      energyKcal: 198,
      energyKj: 828,
    },
    minerals: {
      ironMg: 3.5,
      calciumMg: 110.0,
      zincMg: 1.8,
      magnesiumMg: 45.0,
      phosphorusMg: 85.0,
      potassiumMg: 380.0,
      sodiumMg: 15.0,
    },
    vitamins: {
      vitaminCMg: 4.5,
      thiaminB1Mg: 0.08,
      niacinB3Mg: 0.9,
    },
    aminoAcids: {
      lysine: 3.8,
      methionine: 1.2,
      cysteine: 1.1,
      threonine: 3.5,
      tryptophan: 0.9,
      valine: 4.2,
      leucine: 5.8,
      isoleucine: 3.2,
      phenylalanine: 3.8,
      tyrosine: 2.4,
      histidine: 1.8,
      limitingAminoAcid: "Methionine",
      proteinComplementationPartner: "Ayib (fresh cottage cheese), Kitfo (beef), or Gomen",
      digestibilityCorrectedScore: 0.52,
    },
    fattyAcids: {
      saturatedPct: 35.0,
      monounsaturatedPct: 25.0,
      polyunsaturatedPct: 40.0,
    },
    phenolics: {
      totalPhenolicsMgGae: 65.0,
      totalFlavonoidsMgQe: 18.0,
      keyBioactives: ["Organic acids (Lactic, Acetic, Butyric)", "Fermented resistant fiber"],
    },
    antinutrients: {
      phyticAcidMgPer100g: 45.0, // Virtually phytate-free due to months of pit fermentation!
      condensedTanninsMgPer100g: 15.0,
      totalOxalatesMgPer100g: 22.0,
      phytateToIronMolarRatio: 1.08,
      phytateToZincMolarRatio: 2.47,
      traditionalProcessingImpact: {
        fermentationReductionPct: 92, // Deep subterranean pit fermentation hydrolyzes >90% of ANFs
        soakingReductionPct: 20,
        roastingReductionPct: 15,
        bioavailabilityMultiplier: 1.85,
        biochemicalMechanism: "Anaerobic pit fermentation lasting 3–12 months with ancestral yeasts and lactic bacteria (Leuconostoc, Lactobacillus) degrades phytate complexes almost completely.",
      },
    },
  },
  {
    id: "material-chickpea",
    nameEn: "Chickpea (Shimbra)",
    nameAmharic: "ሽምብራ",
    scientificName: "Cicer arietinum",
    category: "Pulse / Legume",
    partUsed: "Whole and split decorticated seed",
    traditionalCulinaryRole: ["Shiro flour base", "Roasted Kolo snack", "Boiled Nifro", "Shimbra Asa fasting stew"],
    growingEcology: "Black heavy vertisols of central and northern Ethiopian highlands",
    proximate: {
      moistureG: 9.8,
      dryMatterG: 90.2,
      proteinG: 22.4, // High protein density
      fatG: 5.5,
      carbohydrateG: 58.0,
      dietaryFiberG: 12.8,
      ashG: 3.0,
      energyKcal: 378,
      energyKj: 1582,
    },
    minerals: {
      ironMg: 6.2,
      calciumMg: 105.0,
      zincMg: 3.4,
      magnesiumMg: 115.0,
      phosphorusMg: 366.0,
      potassiumMg: 875.0,
      sodiumMg: 24.0,
      copperMg: 0.84,
      manganeseMg: 2.2,
    },
    vitamins: {
      thiaminB1Mg: 0.48,
      riboflavinB2Mg: 0.21,
      niacinB3Mg: 1.54,
      vitaminB6Mg: 0.54,
      folateB9Mcg: 557.0, // Exceptional folate! 100g covers 140% of adult daily RDA
    },
    aminoAcids: {
      lysine: 6.8, // Abundant Lysine — the perfect missing puzzle piece for Teff Injera!
      methionine: 1.4,
      cysteine: 1.3,
      threonine: 3.8,
      tryptophan: 1.0,
      valine: 4.5,
      leucine: 7.6,
      isoleucine: 4.3,
      phenylalanine: 5.6,
      tyrosine: 3.4,
      histidine: 2.8,
      limitingAminoAcid: "Methionine & Cysteine",
      proteinComplementationPartner: "Teff Injera or Highland Barley",
      digestibilityCorrectedScore: 0.78,
    },
    fattyAcids: {
      saturatedPct: 12.0,
      monounsaturatedPct: 32.0,
      polyunsaturatedPct: 56.0,
      oleicAcidC18_1n9: 31.0,
      linoleicAcidC18_2n6: 52.0,
      alphaLinolenicAcidC18_3n3: 3.5,
    },
    phenolics: {
      totalPhenolicsMgGae: 120.0,
      totalFlavonoidsMgQe: 45.0,
      keyBioactives: ["Biochanin A", "Formononetin (isoflavones)", "Resistant prebiotic oligosaccharides"],
    },
    antinutrients: {
      phyticAcidMgPer100g: 680.0,
      condensedTanninsMgPer100g: 48.0,
      totalOxalatesMgPer100g: 30.0,
      trypsinInhibitorTiuMg: 12.5,
      phytateToIronMolarRatio: 9.3,
      phytateToZincMolarRatio: 19.8,
      traditionalProcessingImpact: {
        fermentationReductionPct: 60,
        soakingReductionPct: 52,
        roastingReductionPct: 58, // Roasting for Shiro flour heat-inactivates trypsin inhibitors
        bioavailabilityMultiplier: 1.42,
        biochemicalMechanism: "Gentle dry-pan roasting of soaked chickpeas before stone-milling into Shiro flour denatures 85% of thermolabile trypsin inhibitors.",
      },
    },
  },
  {
    id: "material-flaxseed",
    nameEn: "Flaxseed (Telba)",
    nameAmharic: "ተልባ",
    scientificName: "Linum usitatissimum",
    category: "Oilseed",
    partUsed: "Whole small shiny seed",
    traditionalCulinaryRole: ["Roasted Telba beverage / juice", "Fasting Telba Fitfit", "Gastrointestinal demulcent"],
    growingEcology: "Cool highland plateau (Bale, Arsi, Shewa)",
    proximate: {
      moistureG: 6.8,
      dryMatterG: 93.2,
      proteinG: 18.3,
      fatG: 42.2, // Extremely dense in healthy essential lipids
      carbohydrateG: 28.9,
      dietaryFiberG: 27.3, // High soluble mucilage fiber
      solubleFiberG: 10.2,
      insolubleFiberG: 17.1,
      ashG: 3.8,
      energyKcal: 534,
      energyKj: 2234,
    },
    minerals: {
      ironMg: 5.7,
      calciumMg: 255.0,
      zincMg: 4.3,
      magnesiumMg: 392.0,
      phosphorusMg: 642.0,
      potassiumMg: 813.0,
      sodiumMg: 30.0,
    },
    vitamins: {
      thiaminB1Mg: 1.64,
      riboflavinB2Mg: 0.16,
      niacinB3Mg: 3.08,
      vitaminB6Mg: 0.47,
      folateB9Mcg: 87.0,
      vitaminEMg: 0.31,
    },
    aminoAcids: {
      lysine: 4.0,
      methionine: 1.9,
      cysteine: 1.8,
      threonine: 3.6,
      tryptophan: 1.5,
      valine: 4.8,
      leucine: 6.2,
      isoleucine: 4.1,
      phenylalanine: 4.8,
      tyrosine: 2.8,
      histidine: 2.2,
      limitingAminoAcid: "Lysine",
      digestibilityCorrectedScore: 0.7,
    },
    fattyAcids: {
      saturatedPct: 9.0,
      monounsaturatedPct: 18.0,
      polyunsaturatedPct: 73.0,
      palmiticAcidC16_0: 5.2,
      stearicAcidC18_0: 3.8,
      oleicAcidC18_1n9: 18.5,
      linoleicAcidC18_2n6: 16.0,
      alphaLinolenicAcidC18_3n3: 54.0, // World's premier plant Omega-3 ALA!
      omega6ToOmega3Ratio: 0.3, // Exceptionally cardioprotective anti-inflammatory ratio!
    },
    phenolics: {
      totalPhenolicsMgGae: 450.0,
      totalFlavonoidsMgQe: 195.0,
      keyBioactives: ["Secoisolariciresinol diglucoside (SDG lignans)", "Soluble arabinoxylan mucilage"],
    },
    antinutrients: {
      phyticAcidMgPer100g: 1100.0,
      condensedTanninsMgPer100g: 65.0,
      totalOxalatesMgPer100g: 22.0,
      phytateToIronMolarRatio: 16.3,
      phytateToZincMolarRatio: 25.4,
      traditionalProcessingImpact: {
        fermentationReductionPct: 40,
        soakingReductionPct: 60,
        roastingReductionPct: 55, // Roasting destroys cyanogenic linamarin
        bioavailabilityMultiplier: 1.6,
        biochemicalMechanism: "Traditional dry pan roasting of telba seeds thermally inactivates cyanogenic glycosides (linamarin) and frees Omega-3 fatty acids for intestinal uptake.",
      },
    },
  },
];

// ============================================================================
// 2. ETHIOPIAN TRADITIONAL RECIPES WITH INGREDIENT BREAKDOWNS
// ============================================================================

export const ETHIOPIAN_RECIPES_DATABASE: TraditionalRecipe[] = [
  {
    id: "recipe-teff-injera",
    nameEn: "Fermented Brown Teff Injera",
    nameAmharic: "የቡናማ ጤፍ እንጀራ",
    category: "Staple Flatbread",
    yieldGrams: 450, // Standard large mitad injera
    servingGrams: 150,
    preparationTime: "4 days (96 hours)",
    fermentationDurationHours: 96,
    fastingSuitability: "fasting_friendly",
    description: "The quintessential staple bread of Ethiopia. Naturally gluten-free whole teff flour undergoes 4-day symbiotic lactic acid and yeast fermentation with Ersho backslopping, followed by the Aflegna hot water dough boiling technique. Baked on a traditional clay mitad, yielding its signature aerated 'eyes' (ayen) and tender sour crumb.",
    traditionalMethodSteps: [
      "Blend whole-grain brown teff flour with purified mountain spring water in an earthen buhna bowl.",
      "Inoculate with mature Ersho culture containing native Lactobacillus fermentum, L. plantarum, and Saccharomyces cerevisiae.",
      "Allow Primary Fermentation for 72 hours; decant yellowish liquid and foam (Aflegna extraction).",
      "Cook one cup of fermented batter with boiling water to form the gelatinized 'Absit' thickener; cool and fold back into the batter.",
      "Allow Secondary Fermentation for 24 hours until vigorous gas bubbles and acidic pH (3.8–4.0) develop.",
      "Pour in concentric spirals onto a seasoned clay mitad heated to ~210°C; seal with akambalo lid for 3 minutes until steam sets the spongy eyes.",
    ],
    ingredients: [
      {
        ingredientId: "cereal-brown-teff",
        nameEn: "Whole Grain Brown Teff Flour",
        nameAmharic: "የቡናማ ጤፍ ዱቄት",
        amountGrams: 180,
        percentageOfTotal: 40.0,
        processingState: "fermented",
        role: "Primary grain substrate, provides mineral density, complex starch, and characteristic sour flavor",
        proximateContribution: { proteinG: 5.2, carbohydrateG: 29.2, dietaryFiberG: 3.2, ironMg: 4.6 },
      },
      {
        ingredientId: "water",
        nameEn: "Spring Water",
        nameAmharic: "ውሃ",
        amountGrams: 260,
        percentageOfTotal: 57.8,
        processingState: "boiled",
        role: "Hydration medium for enzymatic hydrolysis and gelatinization",
        proximateContribution: { moistureG: 57.8 },
      },
      {
        ingredientId: "ersho-starter",
        nameEn: "Ersho Lactic-Yeast Culture",
        nameAmharic: "እርሾ",
        amountGrams: 10,
        percentageOfTotal: 2.2,
        processingState: "fermented",
        role: "Microbial inoculum producing lactic acid, carbon dioxide, and microbial phytase",
        proximateContribution: { proteinG: 0.3 },
      },
    ],
    compositeProximate: {
      moistureG: 62.5,
      dryMatterG: 37.5,
      proteinG: 4.8,
      fatG: 0.8,
      carbohydrateG: 34.2,
      dietaryFiberG: 4.2,
      solubleFiberG: 1.1,
      insolubleFiberG: 3.1,
      ashG: 1.7,
      energyKcal: 165,
      energyKj: 690,
    },
    compositeMinerals: {
      ironMg: 11.5,
      calciumMg: 130.0,
      zincMg: 3.6,
      magnesiumMg: 140.0,
      phosphorusMg: 220.0,
      potassiumMg: 295.0,
      sodiumMg: 9.0,
    },
    compositeVitamins: {
      thiaminB1Mg: 0.28,
      riboflavinB2Mg: 0.18,
      niacinB3Mg: 2.2,
      vitaminB6Mg: 0.32,
      folateB9Mcg: 38.0,
    },
    antinutrientDegradationSummary: {
      nativePhytateTotalMg: 780,
      cookedPhytateTotalMg: 195,
      degradationPercentage: 75.0,
      ironBioavailabilityUplift: "1.45x–1.60x higher dialyzable Fe due to IP6 conversion into low-affinity IP1–IP3 isomers.",
    },
    proteinComplementationNotes: "Teff is exceptionally rich in sulfur-containing amino acids (Methionine 2.9g/16g N, Cysteine 2.3g/16g N) but modestly limited in Lysine. Pairing with legume wots (Shiro, Misir) creates a complete amino acid profile matching whole egg reference protein.",
  },
  {
    id: "recipe-shiro-wot",
    nameEn: "Traditional Shiro Wot (Chickpea Stew)",
    nameAmharic: "የሽምብራ ሽሮ ወጥ",
    category: "Stew / Wot",
    yieldGrams: 350,
    servingGrams: 175,
    preparationTime: "40 minutes",
    fastingSuitability: "fasting_friendly",
    description: "The staple nutritious pulse stew of Ethiopia, eaten daily across fasting periods. Finely milled roasted chickpea and field pea flour seasoned with garlic, ginger, shallots, cardamom (korarima), and berbere is gently simmered into a rich, velvety aromatic stew.",
    traditionalMethodSteps: [
      "Finely mince shallots and dry-sweat in a traditional earthen dist clay pot until golden and caramelized.",
      "Add vegetable oil (or niter kibbeh if non-fasting) and incorporate berbere spice blend.",
      "Add crushed garlic, ginger, and ground black korarima; sauté for 3 minutes until aromatic.",
      "Gradually whisk in roasted Shiro flour with boiling water to prevent clumping.",
      "Simmer on low embers for 20 minutes until the stew bubbles smoothly and oil glimmers at the surface.",
    ],
    ingredients: [
      {
        ingredientId: "material-chickpea",
        nameEn: "Roasted Shiro Flour (Chickpea & Pea)",
        nameAmharic: "የሽሮ ዱቄት",
        amountGrams: 65,
        percentageOfTotal: 18.5,
        processingState: "roasted",
        role: "Protein base, thickener, and rich source of lysine, folate, and potassium",
        proximateContribution: { proteinG: 5.8, carbohydrateG: 11.2, dietaryFiberG: 2.8, ironMg: 1.8 },
      },
      {
        ingredientId: "oil-vegetable",
        nameEn: "Vegetable Oil (Sunflower / Niger seed)",
        nameAmharic: "የሱፍ / የኑግ ዘይት",
        amountGrams: 28,
        percentageOfTotal: 8.0,
        processingState: "cooked",
        role: "Lipid medium, carries fat-soluble spices and enhances satiety",
        proximateContribution: { fatG: 5.6 },
      },
      {
        ingredientId: "veg-shallot",
        nameEn: "Red Shallots / Onions",
        nameAmharic: "ቀይ ሽንኩርት",
        amountGrams: 55,
        percentageOfTotal: 15.7,
        processingState: "cooked",
        role: "Aromatic savory foundation, quercetin and prebiotic inulin",
        proximateContribution: { carbohydrateG: 1.5, dietaryFiberG: 0.6 },
      },
      {
        ingredientId: "spice-berbere",
        nameEn: "Berbere Spice Blend",
        nameAmharic: "በርበሬ",
        amountGrams: 15,
        percentageOfTotal: 4.3,
        processingState: "milled",
        role: "Capsaicin, piperine, antioxidant carotenoids, and deep ruby hue",
        proximateContribution: { dietaryFiberG: 0.4 },
      },
      {
        ingredientId: "water",
        nameEn: "Water",
        nameAmharic: "ውሃ",
        amountGrams: 187,
        percentageOfTotal: 53.5,
        processingState: "boiled",
        role: "Simmering liquid",
        proximateContribution: { moistureG: 53.5 },
      },
    ],
    compositeProximate: {
      moistureG: 72.0,
      dryMatterG: 28.0,
      proteinG: 6.8,
      fatG: 5.8,
      carbohydrateG: 12.8,
      dietaryFiberG: 3.8,
      ashG: 1.8,
      energyKcal: 130,
      energyKj: 544,
    },
    compositeMinerals: {
      ironMg: 3.8,
      calciumMg: 52.0,
      zincMg: 1.9,
      magnesiumMg: 48.0,
      phosphorusMg: 145.0,
      potassiumMg: 385.0,
      sodiumMg: 180.0,
    },
    compositeVitamins: {
      vitaminAMcgRae: 65.0,
      vitaminCMg: 3.2,
      thiaminB1Mg: 0.18,
      folateB9Mcg: 110.0, // High natural folate!
    },
    antinutrientDegradationSummary: {
      nativePhytateTotalMg: 440,
      cookedPhytateTotalMg: 180,
      degradationPercentage: 59.0,
      ironBioavailabilityUplift: "Roasting + 20-min boiling degrades 60% of phytates and 88% of trypsin inhibitors.",
    },
    proteinComplementationNotes: "Shiro's abundant Lysine (6.8g/16g N) perfectly counterbalances Teff's low lysine, producing a balanced net protein utilization (NPU > 74%).",
  },
  {
    id: "recipe-misir-wot",
    nameEn: "Spicy Split Red Lentil Stew (Qey Misir Wot)",
    nameAmharic: "የቀይ ምስር ክክ ወጥ",
    category: "Stew / Wot",
    yieldGrams: 360,
    servingGrams: 180,
    preparationTime: "45 minutes",
    fastingSuitability: "fasting_friendly",
    description: "Decorticated red split lentils simmered slowly with slow-caramelized red shallots, berbere chili spice, crushed ginger, garlic, and wild Ethiopian black cardamom. A powerhouse of plant protein and folate.",
    traditionalMethodSteps: [
      "Wash split red lentils thoroughly in cold water to remove dust and surface saponins.",
      "Caramelize minced onions slowly in a pot without oil for 10 minutes, then add vegetable oil and berbere.",
      "Add garlic, ginger, and korarima; sauté until the fragrance blooms.",
      "Add washed lentils and boiling water; reduce heat to a gentle simmer for 25 minutes until lentils collapse into a thick, comforting stew.",
    ],
    ingredients: [
      {
        ingredientId: "material-lentils",
        nameEn: "Split Red Lentils (Misir Kik)",
        nameAmharic: "የምስር ክክ",
        amountGrams: 90,
        percentageOfTotal: 25.0,
        processingState: "boiled",
        role: "Core protein and soluble fiber source",
        proximateContribution: { proteinG: 7.2, carbohydrateG: 14.5, dietaryFiberG: 4.0, ironMg: 2.8 },
      },
      {
        ingredientId: "oil-vegetable",
        nameEn: "Vegetable Oil",
        nameAmharic: "የአትክልት ዘይት",
        amountGrams: 22,
        percentageOfTotal: 6.1,
        processingState: "cooked",
        role: "Cooking fat",
        proximateContribution: { fatG: 4.8 },
      },
      {
        ingredientId: "veg-shallot",
        nameEn: "Shallots / Red Onions",
        nameAmharic: "ቀይ ሽንኩርት",
        amountGrams: 60,
        percentageOfTotal: 16.7,
        processingState: "cooked",
        role: "Base flavor",
        proximateContribution: { carbohydrateG: 1.6 },
      },
      {
        ingredientId: "spice-berbere",
        nameEn: "Berbere Spice",
        nameAmharic: "በርበሬ",
        amountGrams: 16,
        percentageOfTotal: 4.4,
        processingState: "cooked",
        role: "Spice",
        proximateContribution: { dietaryFiberG: 0.5 },
      },
      {
        ingredientId: "water",
        nameEn: "Water",
        nameAmharic: "ውሃ",
        amountGrams: 172,
        percentageOfTotal: 47.8,
        processingState: "boiled",
        role: "Simmering liquid",
        proximateContribution: { moistureG: 47.8 },
      },
    ],
    compositeProximate: {
      moistureG: 71.0,
      dryMatterG: 29.0,
      proteinG: 7.8,
      fatG: 4.9,
      carbohydrateG: 15.2,
      dietaryFiberG: 4.5,
      ashG: 1.6,
      energyKcal: 136,
      energyKj: 569,
    },
    compositeMinerals: {
      ironMg: 3.9,
      calciumMg: 38.0,
      zincMg: 1.8,
      magnesiumMg: 42.0,
      phosphorusMg: 160.0,
      potassiumMg: 410.0,
      sodiumMg: 165.0,
    },
    compositeVitamins: {
      vitaminAMcgRae: 58.0,
      vitaminCMg: 2.8,
      folateB9Mcg: 135.0, // Outstanding natural folate source
    },
    antinutrientDegradationSummary: {
      nativePhytateTotalMg: 520,
      cookedPhytateTotalMg: 190,
      degradationPercentage: 63.5,
      ironBioavailabilityUplift: "Pre-soaking and boiling degrades ~64% of tannins and phytates.",
    },
    proteinComplementationNotes: "Red lentils provide high Lysine (7.0g/16g N) which complements Teff and Barley grain meals.",
  },
  {
    id: "recipe-beso-drink",
    nameEn: "Highland Beso Smoothie / Beverage",
    nameAmharic: "የበሶ ጁስ / ፈረፈር",
    category: "Beverage / Convalescent",
    yieldGrams: 280,
    servingGrams: 280,
    preparationTime: "5 minutes",
    fastingSuitability: "fasting_friendly",
    description: "Traditional fast-acting endurance and convalescent superfood. Whole roasted highland barley is ground to ultra-fine flour, blended with chilled water and wild forest honey. Packed with heart-protective beta-glucans, gentle on the stomach, and used by Ethiopian long-distance marathoners.",
    traditionalMethodSteps: [
      "Select high-altitude roasted barley flour (Beso) prepared by dry-sand roasting.",
      "In a traditional drinking gourd or shaker, blend Beso flour with cold purified spring water.",
      "Whisk in pure Ethiopian wild forest honey until silky and froth develops.",
      "Serve chilled as an instant stamina drink or breakfast meal.",
    ],
    ingredients: [
      {
        ingredientId: "cereal-highland-barley",
        nameEn: "Roasted Highland Barley Flour (Beso)",
        nameAmharic: "የተቆላ የገብስ ዱቄት (በሶ)",
        amountGrams: 55,
        percentageOfTotal: 19.6,
        processingState: "roasted",
        role: "Main energy, soluble fiber, and potassium source",
        proximateContribution: { proteinG: 6.8, carbohydrateG: 40.4, dietaryFiberG: 9.5, energyKcal: 195 },
      },
      {
        ingredientId: "water",
        nameEn: "Spring Water",
        nameAmharic: "ውሃ",
        amountGrams: 210,
        percentageOfTotal: 75.0,
        processingState: "raw",
        role: "Hydration vehicle",
        proximateContribution: { moistureG: 75.0 },
      },
      {
        ingredientId: "sweetener-honey",
        nameEn: "Ethiopian Forest Honey",
        nameAmharic: "የማር ማር",
        amountGrams: 15,
        percentageOfTotal: 5.4,
        processingState: "raw",
        role: "Natural glucose/fructose fuel, antimicrobial enzymes",
        proximateContribution: { carbohydrateG: 12.2, energyKcal: 48 },
      },
    ],
    compositeProximate: {
      moistureG: 75.0,
      dryMatterG: 25.0,
      proteinG: 3.2,
      fatG: 0.6,
      carbohydrateG: 20.8,
      dietaryFiberG: 4.2,
      solubleFiberG: 1.6, // Active Beta-Glucans!
      ashG: 0.7,
      energyKcal: 104,
      energyKj: 435,
    },
    compositeMinerals: {
      ironMg: 1.4,
      calciumMg: 18.0,
      zincMg: 1.1,
      magnesiumMg: 52.0,
      phosphorusMg: 98.0,
      potassiumMg: 195.0,
      sodiumMg: 8.0,
    },
    compositeVitamins: {
      thiaminB1Mg: 0.22,
      riboflavinB2Mg: 0.12,
      niacinB3Mg: 1.8,
    },
    antinutrientDegradationSummary: {
      nativePhytateTotalMg: 340,
      cookedPhytateTotalMg: 190,
      degradationPercentage: 44.0,
      ironBioavailabilityUplift: "Roasting denatures enzyme inhibitors; zero digestive distress.",
    },
    proteinComplementationNotes: "Barley beta-glucans form a viscous digestive mesh that blunts postprandial glucose spikes and feeds short-chain fatty acid producing gut microbes.",
  },
  {
    id: "recipe-qocho-bread",
    nameEn: "Baked Enset Qocho Flatbread",
    nameAmharic: "የቆጮ ቂጣ / ዳቦ",
    category: "Staple Flatbread",
    yieldGrams: 300,
    servingGrams: 150,
    preparationTime: "25 minutes (after pit fermentation)",
    fastingSuitability: "fasting_friendly",
    description: "Traditional fermented false banana (Ensete ventricosum) flatbread of southern Ethiopia. Fermented under anaerobic earth pits for up to a year, kneaded with mountain spices and chopped finely, then wrapped in fresh green enset leaves and baked on an open griddle.",
    traditionalMethodSteps: [
      "Extract mature fermented Qocho pulp from underground pit; mince finely with double-bladed knife.",
      "Knead with water and a pinch of ground coriander and salt to form a uniform dough.",
      "Spread evenly between fresh waxy enset leaves (Koba).",
      "Bake on medium-heat griddle for 12 minutes per side until the leaf scorches golden and the inside turns tender and aromatic.",
    ],
    ingredients: [
      {
        ingredientId: "material-enset-qocho",
        nameEn: "Fermented Enset Pulp (Qocho)",
        nameAmharic: "የተቦካ ቆጮ",
        amountGrams: 280,
        percentageOfTotal: 93.3,
        processingState: "fermented",
        role: "Main substrate, resistant starch, and natural organic acids",
        proximateContribution: { proteinG: 3.5, carbohydrateG: 65.0, dietaryFiberG: 6.8, calciumMg: 154.0 },
      },
      {
        ingredientId: "water",
        nameEn: "Water",
        nameAmharic: "ውሃ",
        amountGrams: 18,
        percentageOfTotal: 6.0,
        processingState: "raw",
        role: "Kneading moisture",
        proximateContribution: { moistureG: 6.0 },
      },
      {
        ingredientId: "salt",
        nameEn: "Mineral Salt",
        nameAmharic: "ጨው",
        amountGrams: 2,
        percentageOfTotal: 0.7,
        processingState: "raw",
        role: "Flavor & electrolytes",
        proximateContribution: { sodiumMg: 780 },
      },
    ],
    compositeProximate: {
      moistureG: 52.0,
      dryMatterG: 48.0,
      proteinG: 2.4,
      fatG: 0.6,
      carbohydrateG: 46.5,
      dietaryFiberG: 4.8,
      ashG: 1.8,
      energyKcal: 198,
      energyKj: 828,
    },
    compositeMinerals: {
      ironMg: 3.5,
      calciumMg: 110.0,
      zincMg: 1.8,
      magnesiumMg: 45.0,
      phosphorusMg: 85.0,
      potassiumMg: 380.0,
      sodiumMg: 160.0,
    },
    compositeVitamins: {
      vitaminCMg: 3.5,
      thiaminB1Mg: 0.08,
      niacinB3Mg: 0.9,
    },
    antinutrientDegradationSummary: {
      nativePhytateTotalMg: 280,
      cookedPhytateTotalMg: 25,
      degradationPercentage: 91.0,
      ironBioavailabilityUplift: "Pit fermentation completely breaks down phytic acid; mineral availability is highest among traditional staples.",
    },
    proteinComplementationNotes: "Qocho is a high-carbohydrate staple low in protein. Traditionally and scientifically paired with Ayib (curd cheese) or Kitfo / Gomen to provide balanced amino acids.",
  },
  {
    id: "recipe-kinche",
    nameEn: "Cracked Wheat Kinche (ቂንጬ)",
    nameAmharic: "ቂንጬ",
    category: "Porridge & Grain",
    yieldGrams: 320,
    servingGrams: 160,
    preparationTime: "25 minutes",
    fastingSuitability: "dual",
    description: "Classic Ethiopian cracked grain dish prepared from crushed highland emmer or durum wheat kernels boiled gently and dressed with spiced clarified butter (niter kibbeh) or olive/sunflower oil during fasting seasons.",
    traditionalMethodSteps: [
      "Rinse cracked wheat grits in cold water.",
      "Bring water and a pinch of salt to a rolling boil in a heavy pot.",
      "Add cracked wheat, reduce heat to low, cover tightly, and steam for 18 minutes until tender.",
      "Stir in warm niter kibbeh (or vegetable oil for fasting days) and fresh black pepper before serving.",
    ],
    ingredients: [
      {
        ingredientId: "cereal-emmer-wheat",
        nameEn: "Cracked Emmer / Durum Wheat Grits",
        nameAmharic: "የተሰበረ የስንዴ / አጃ ፍርፍር",
        amountGrams: 100,
        percentageOfTotal: 31.2,
        processingState: "boiled",
        role: "Primary fiber, complex carb, and magnesium source",
        proximateContribution: { proteinG: 7.4, carbohydrateG: 34.2, dietaryFiberG: 5.2 },
      },
      {
        ingredientId: "fat-niter-kibbeh",
        nameEn: "Niter Kibbeh (Clarified Spiced Butter) or Fasting Oil",
        nameAmharic: "ንጥር ቅቤ / ዘይት",
        amountGrams: 20,
        percentageOfTotal: 6.3,
        processingState: "cooked",
        role: "Traditional flavor and lipid carrier for fat-soluble vitamins",
        proximateContribution: { fatG: 10.5, energyKcal: 95 },
      },
      {
        ingredientId: "water",
        nameEn: "Water",
        nameAmharic: "ውሃ",
        amountGrams: 198,
        percentageOfTotal: 61.9,
        processingState: "boiled",
        role: "Hydration and boiling",
        proximateContribution: { moistureG: 61.9 },
      },
      {
        ingredientId: "salt",
        nameEn: "Salt",
        nameAmharic: "ጨው",
        amountGrams: 2,
        percentageOfTotal: 0.6,
        processingState: "raw",
        role: "Seasoning",
        proximateContribution: { sodiumMg: 780 },
      },
    ],
    compositeProximate: {
      moistureG: 68.0,
      dryMatterG: 32.0,
      proteinG: 4.5,
      fatG: 5.8,
      carbohydrateG: 19.5,
      dietaryFiberG: 3.2,
      ashG: 1.2,
      energyKcal: 150,
      energyKj: 628,
    },
    compositeMinerals: {
      ironMg: 2.1,
      calciumMg: 28.0,
      zincMg: 1.8,
      magnesiumMg: 65.0,
      phosphorusMg: 165.0,
      potassiumMg: 180.0,
      sodiumMg: 190.0,
    },
    compositeVitamins: {
      thiaminB1Mg: 0.22,
      niacinB3Mg: 2.4,
      vitaminEMg: 0.45,
    },
    antinutrientDegradationSummary: {
      nativePhytateTotalMg: 370,
      cookedPhytateTotalMg: 195,
      degradationPercentage: 47.3,
      ironBioavailabilityUplift: "Cracking and thermal steaming softens cell walls, improving mineral absorption by 1.35x.",
    },
    proteinComplementationNotes: "Provides steady low-glycemic sustained carbohydrate release and dietary magnesium for muscular relaxation.",
  },
  {
    id: "recipe-telba-smoothie",
    nameEn: "Roasted Flaxseed Drink (Telba Juice)",
    nameAmharic: "የተልባ ጁስ",
    category: "Beverage / Convalescent",
    yieldGrams: 300,
    servingGrams: 300,
    preparationTime: "10 minutes",
    fastingSuitability: "fasting_friendly",
    description: "Renowned traditional medicinal beverage of Ethiopia. Whole brown flaxseed (Linum usitatissimum) is gently roasted on a clay griddle until popping, ground fine, and blended with chilled water, a hint of honey, and lemon. Rich in Omega-3 Alpha-Linolenic Acid (ALA) and soothing gastrointestinal mucilage.",
    traditionalMethodSteps: [
      "Dry-roast whole flaxseed on a flat pan over moderate flame for 4 minutes until aromatic and crackling.",
      "Cool and mill immediately to preserve volatile polyunsaturated fatty acids.",
      "Whisk with cold water until a rich, silky emulsion forms.",
      "Add honey and fresh lemon juice to taste; consume immediately.",
    ],
    ingredients: [
      {
        ingredientId: "material-flaxseed",
        nameEn: "Roasted Ground Flaxseed (Telba)",
        nameAmharic: "የተቆላ የተልባ ዱቄት",
        amountGrams: 40,
        percentageOfTotal: 13.3,
        processingState: "roasted",
        role: "Omega-3 ALA, lignans, and soluble mucilage fiber",
        proximateContribution: { proteinG: 4.8, fatG: 11.2, dietaryFiberG: 7.2, energyKcal: 142 },
      },
      {
        ingredientId: "water",
        nameEn: "Water",
        nameAmharic: "ውሃ",
        amountGrams: 245,
        percentageOfTotal: 81.7,
        processingState: "raw",
        role: "Hydration medium",
        proximateContribution: { moistureG: 81.7 },
      },
      {
        ingredientId: "sweetener-honey",
        nameEn: "Wild Forest Honey",
        nameAmharic: "የማር ማር",
        amountGrams: 15,
        percentageOfTotal: 5.0,
        processingState: "raw",
        role: "Natural sweetness",
        proximateContribution: { carbohydrateG: 12.2, energyKcal: 48 },
      },
    ],
    compositeProximate: {
      moistureG: 82.0,
      dryMatterG: 18.0,
      proteinG: 2.8,
      fatG: 5.6,
      carbohydrateG: 7.8,
      dietaryFiberG: 4.2,
      solubleFiberG: 2.1,
      ashG: 0.8,
      energyKcal: 92,
      energyKj: 385,
    },
    compositeMinerals: {
      ironMg: 1.2,
      calciumMg: 55.0,
      zincMg: 0.9,
      magnesiumMg: 82.0,
      phosphorusMg: 135.0,
      potassiumMg: 175.0,
      sodiumMg: 8.0,
    },
    compositeVitamins: {
      thiaminB1Mg: 0.35,
      folateB9Mcg: 22.0,
    },
    antinutrientDegradationSummary: {
      nativePhytateTotalMg: 440,
      cookedPhytateTotalMg: 210,
      degradationPercentage: 52.3,
      ironBioavailabilityUplift: "Roasting denatures heat-sensitive cyanogenic glucosides completely; safe and cardioprotective.",
    },
    proteinComplementationNotes: "Supplies over 2,800 mg of plant Omega-3 Alpha-Linolenic Acid (ALA) per glass, exceeding 100% of adult daily requirement. Strong anti-inflammatory and mucosal protective effects.",
  },
];

// ============================================================================
// HELPER FUNCTIONS FOR COMPOSITION CALCULATIONS & DEGRADATION
// ============================================================================

export function calculatePhytateMineralRatio(phytateMg: number, mineralMg: number, mineralAtomicWeight: number): number {
  if (mineralMg <= 0) return 0;
  const phytateMoles = (phytateMg / 1000) / 660.04; // Phytic acid MW = 660.04 g/mol
  const mineralMoles = (mineralMg / 1000) / mineralAtomicWeight;
  return phytateMoles / mineralMoles;
}

export function estimateProcessingBioavailability(
  rawPhytateMg: number,
  method: "fermentation_4day" | "fermentation_2day" | "soaking_24h" | "roasting" | "boiling"
): {
  residualPhytateMg: number;
  degradationPct: number;
  ironBioavailabilityMultiplier: number;
  zincBioavailabilityMultiplier: number;
} {
  switch (method) {
    case "fermentation_4day":
      return {
        residualPhytateMg: Math.round(rawPhytateMg * 0.23),
        degradationPct: 77,
        ironBioavailabilityMultiplier: 1.58,
        zincBioavailabilityMultiplier: 1.42,
      };
    case "fermentation_2day":
      return {
        residualPhytateMg: Math.round(rawPhytateMg * 0.42),
        degradationPct: 58,
        ironBioavailabilityMultiplier: 1.35,
        zincBioavailabilityMultiplier: 1.25,
      };
    case "soaking_24h":
      return {
        residualPhytateMg: Math.round(rawPhytateMg * 0.55),
        degradationPct: 45,
        ironBioavailabilityMultiplier: 1.25,
        zincBioavailabilityMultiplier: 1.18,
      };
    case "roasting":
      return {
        residualPhytateMg: Math.round(rawPhytateMg * 0.62),
        degradationPct: 38,
        ironBioavailabilityMultiplier: 1.2,
        zincBioavailabilityMultiplier: 1.15,
      };
    case "boiling":
      return {
        residualPhytateMg: Math.round(rawPhytateMg * 0.68),
        degradationPct: 32,
        ironBioavailabilityMultiplier: 1.15,
        zincBioavailabilityMultiplier: 1.1,
      };
    default:
      return {
        residualPhytateMg: rawPhytateMg,
        degradationPct: 0,
        ironBioavailabilityMultiplier: 1.0,
        zincBioavailabilityMultiplier: 1.0,
      };
  }
}
