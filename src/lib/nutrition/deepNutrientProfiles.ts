/**
 * Deep nutrient profiles for Ethiopian food ingredients, cereals, sprouts,
 * vegetables, fruits, and animal products.
 * Covers: proximate, minerals (incl. S, B), vitamins, all 21 amino acids,
 * full fatty acid chain + cholesterol, phenolics/polyphenols, and
 * antinutritional factors per 100 g.
 * Values are reference estimates from USDA FoodData Central, FAO/INFOODS
 * WAFCT, FAO East Africa FCT, EFCT 2025, and peer-reviewed Ethiopian
 * nutrition science literature. Cultivar, region, processing, and analytical
 * method cause real-world variation.
 */

export interface AminoAcidProfile {
  /** Essential amino acids (mg per g protein) — 9 EAA */
  essential: {
    histidine?: number;
    isoleucine?: number;
    leucine?: number;
    lysine?: number;
    methionine?: number;
    phenylalanine?: number;
    threonine?: number;
    tryptophan?: number;
    valine?: number;
  };
  /** Semi-essential / conditionally essential — 5 */
  semiEssential?: {
    arginine?: number;
    cysteine?: number;   // from methionine
    glycine?: number;
    proline?: number;
    tyrosine?: number;   // from phenylalanine
  };
  /** Non-essential amino acids — 7 (completing all 21) */
  nonEssential?: {
    alanine?: number;
    asparagine?: number;
    aspartate?: number;   // aspartic acid
    glutamate?: number;   // glutamic acid
    glutamine?: number;
    serine?: number;
    hydroxyproline?: number; // collagen-derived; abundant in animal products
  };
  /** Total mg amino acids per 100 g food (sum of all free + peptide-bound) */
  totalAminoAcidsMgPer100g?: number;
  limitingAmino?: string;
  aminoAcidScore?: number; // PDCAAS-style 0–100, relative to WHO/FAO ref pattern
}

export interface FattyAcidProfile {
  totalSaturatedG?: number;
  totalMonounsaturatedG?: number;
  totalPolyunsaturatedG?: number;
  totalTransFatG?: number;
  cholesterol_mg?: number; // per 100 g food; 0 for plant foods

  // ── Short-chain saturated (g / 100 g) ──────────────────────
  butyric_C4_0?: number;    // butter fat
  caproic_C6_0?: number;
  caprylic_C8_0?: number;   // MCT
  capric_C10_0?: number;    // MCT
  lauric_C12_0?: number;    // coconut/palm kernel
  myristic_C14_0?: number;

  // ── Long-chain saturated ──────────────────────────────────
  palmitic_C16_0?: number;
  stearic_C18_0?: number;
  arachidic_C20_0?: number;
  behenic_C22_0?: number;
  lignoceric_C24_0?: number;

  // ── Monounsaturated (MUFA) ────────────────────────────────
  palmitoIleic_C16_1?: number; // n-7
  oleic_C18_1?: number;        // n-9 (primary MUFA)
  vaccenic_C18_1t?: number;    // trans (natural ruminant)
  gondoic_C20_1?: number;      // n-9
  erucic_C22_1?: number;       // n-9 (mustard/rapeseed)

  // ── n-6 PUFA ─────────────────────────────────────────────
  linoleic_C18_2n6?: number;          // LA — essential
  gammaLinolenic_C18_3n6?: number;    // GLA
  dihomoGammaLinolenic_C20_3n6?: number; // DGLA
  arachidonic_C20_4n6?: number;       // AA — conditionally essential

  // ── n-3 PUFA ─────────────────────────────────────────────
  alphaLinolenic_C18_3n3?: number;    // ALA — essential
  stearidonicAcid_C18_4n3?: number;   // SDA
  eicosaPentaenoic_C20_5n3?: number;  // EPA
  docosaPentaenoic_C22_5n3?: number;  // DPA
  docosaHexaenoic_C22_6n3?: number;   // DHA

  omega3ToOmega6Ratio?: string;
  note?: string;
}

export interface VitaminProfile {
  vitaminA_retinolEquiv_mcg?: number;
  betaCarotene_mcg?: number;
  vitaminB1_thiamine_mg?: number;
  vitaminB2_riboflavin_mg?: number;
  vitaminB3_niacin_mg?: number;
  vitaminB5_pantothenicAcid_mg?: number;
  vitaminB6_pyridoxine_mg?: number;
  vitaminB9_folate_mcg?: number;
  vitaminB12_cobalamin_mcg?: number;
  vitaminC_ascorbicAcid_mg?: number;
  vitaminD_mcg?: number;
  vitaminE_tocopherol_mg?: number;
  vitaminK_mcg?: number;
}

export interface MineralProfile {
  // ── Major minerals (macrominerals) ───────────────────────
  calcium_mg?: number;      // Ca
  phosphorus_mg?: number;   // P
  magnesium_mg?: number;    // Mg
  potassium_mg?: number;    // K
  sodium_mg?: number;       // Na
  sulfur_mg?: number;       // S  (from cysteine/methionine)
  chloride_mg?: number;     // Cl

  // ── Trace minerals ───────────────────────────────────────
  iron_mg?: number;         // Fe
  zinc_mg?: number;         // Zn
  copper_mg?: number;       // Cu
  manganese_mg?: number;    // Mn
  selenium_mcg?: number;    // Se
  molybdenum_mcg?: number;  // Mo
  boron_mcg?: number;       // B  (bone health, estrogen metabolism)
  chromium_mcg?: number;    // Cr
  iodine_mcg?: number;      // I
  fluoride_mg?: number;     // F
  silicon_mg?: number;      // Si (connective tissue)
  vanadium_mcg?: number;    // V
  nickel_mcg?: number;      // Ni
}

export interface PhenolicProfile {
  totalPhenolicsMgGAE?: number; // mg Gallic Acid Equivalent per 100 g
  totalFlavonoidsMg?: number;
  totalAnthocyaninsMg?: number;
  chlorogenicAcid_mg?: number;
  ferulic_mg?: number;
  quercetin_mg?: number;
  kaempferol_mg?: number;
  rutin_mg?: number;
  proanthocyanidins_mg?: number;
  condensedTannins_mg?: number;
  lignans_mg?: number;
  resveratrol_mg?: number;
  lutein_mcg?: number;
  zeaxanthin_mcg?: number;
  betaCarotene_mcg?: number;   // carotenoid; sometimes reported with phenolics
  luteolin_mg?: number;        // flavone (celery, artichoke, green pepper)
  apigenin_mg?: number;        // flavone (chamomile, parsley)
  vitexin_mg?: number;         // C-glycosyl flavone (teff, passion fruit)
  hesperidin_mg?: number;      // flavanone (citrus peel)
  naringenin_mg?: number;      // flavanone (grapefruit, tomato)
  orac_umolTE?: number; // Oxygen Radical Absorbance Capacity
  note?: string;
}

export interface AntinutrientDetail {
  phytate_mg?: number;        // Phytic acid (IP6)
  tannins_mg?: number;
  oxalates_mg?: number;
  lectins_HU?: number;        // Hemagglutinin units
  trypsinInhibitor_TIU?: number; // Trypsin inhibitor units
  saponins_mg?: number;
  goitrogens_mg?: number;
  cyanogenicGlucosides_mg?: number;
  solanine_mg?: number;
  fructans?: boolean;         // Fructo-oligosaccharides / inulin (onion, garlic) — FODMAP-relevant
  hemagglutinin?: "absent" | "trace" | "low" | "moderate" | "high";
  processingReduction?: {
    method: string;
    phytateReductionPct?: number;
    tanninsReductionPct?: number;
    lectinsReductionPct?: number;
    trypsinInhibitorReductionPct?: number;
  };
}

export interface DeepIngredientProfile {
  uid: string;
  nameEn: string;
  nameAmharic?: string;
  nameLocal?: string;
  scientificName?: string;
  category: string;
  partUsed: string;
  processingState: string;
  basis: string; // e.g. "per 100 g raw dry grain"

  proximate: {
    energyKcal: number;
    moisture_g: number;
    protein_g: number;
    fat_g: number;
    carbohydrate_g: number; // by difference
    dietaryFiber_g: number;
    ash_g: number;
    starch_g?: number;
    sugars_g?: number;
  };

  minerals: MineralProfile;
  vitamins: VitaminProfile;
  aminoAcids?: AminoAcidProfile;
  fattyAcids?: FattyAcidProfile;
  phenolics?: PhenolicProfile;
  antinutrients?: AntinutrientDetail;

  glycemicIndex?: number;
  glycemicLoad?: number;
  insulinIndex?: number;

  /** Key health / functional properties */
  functionalProperties?: string[];
  /** Bioavailability-enhancing processing notes */
  bioavailabilityNotes?: string;

  sourceReferences: string[];
  dataConfidence: "high" | "medium" | "low";
}

// ============================================================
// CEREAL GRAINS — Raw, Whole Grain, Dry Weight Basis
// ============================================================

const CORE_DEEP_CEREAL_PROFILES: DeepIngredientProfile[] = [
  {
    uid: "dip-teff-raw",
    nameEn: "Teff",
    nameAmharic: "ጤፍ",
    scientificName: "Eragrostis tef",
    category: "Cereal Grain",
    partUsed: "Whole grain",
    processingState: "raw",
    basis: "per 100 g dry raw grain",
    proximate: {
      energyKcal: 367, moisture_g: 8.8, protein_g: 13.3,
      fat_g: 2.4, carbohydrate_g: 73.1, dietaryFiber_g: 8.0,
      ash_g: 2.5, starch_g: 59.0, sugars_g: 2.0,
    },
    minerals: {
      calcium_mg: 180, iron_mg: 11.6, magnesium_mg: 184,
      phosphorus_mg: 429, potassium_mg: 427, sodium_mg: 12,
      zinc_mg: 3.6, copper_mg: 0.7, manganese_mg: 9.2,
      selenium_mcg: 8.2,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.39, vitaminB2_riboflavin_mg: 0.27,
      vitaminB3_niacin_mg: 3.4, vitaminB5_pantothenicAcid_mg: 0.97,
      vitaminB6_pyridoxine_mg: 0.48, vitaminB9_folate_mcg: 38,
      vitaminC_ascorbicAcid_mg: 1.8, vitaminE_tocopherol_mg: 1.9,
    },
    aminoAcids: {
      essential: {
        histidine: 4.1, isoleucine: 5.0, leucine: 9.9,
        lysine: 4.0, methionine: 3.9, phenylalanine: 6.8,
        threonine: 4.4, tryptophan: 1.4, valine: 5.9,
      },
      semiEssential: {
        arginine: 6.2, cysteine: 2.9, glycine: 5.5, proline: 10.1, tyrosine: 3.8,
      },
      limitingAmino: "Lysine (borderline adequate)",
      aminoAcidScore: 84,
    },
    fattyAcids: {
      totalSaturatedG: 0.50, totalMonounsaturatedG: 0.59, totalPolyunsaturatedG: 1.13,
      palmitic_C16_0: 0.43, stearic_C18_0: 0.07,
      oleic_C18_1: 0.56, linoleic_C18_2n6: 1.02,
      alphaLinolenic_C18_3n3: 0.11, omega3ToOmega6Ratio: "1:9",
    },
    phenolics: {
      totalPhenolicsMgGAE: 282, totalFlavonoidsMg: 114,
      ferulic_mg: 88, proanthocyanidins_mg: 65,
      condensedTannins_mg: 42,
      note: "Brown/red teff contains higher phenolic density than white teff.",
    },
    antinutrients: {
      phytate_mg: 620, tannins_mg: 170, oxalates_mg: 48,
      trypsinInhibitor_TIU: 4.2,
      processingReduction: {
        method: "72–96h Ersho lactic fermentation",
        phytateReductionPct: 75, tanninsReductionPct: 60,
        trypsinInhibitorReductionPct: 80,
      },
    },
    glycemicIndex: 42,
    functionalProperties: [
      "Naturally gluten-free", "High calcium density", "Prebiotic resistant starch",
      "Complete amino acid profile (borderline)", "Rich in slow-release energy",
    ],
    bioavailabilityNotes: "Ersho fermentation elevates non-heme iron dialyzability 1.45–1.60×. Lactic acid lowering pH to 3.8–4.2 dissolves mineral phytate complexes.",
    sourceReferences: [
      "USDA FoodData Central #170686", "Abebe et al. (2015) Food Chem.",
      "Abegaz et al. (2013) J. Ethnobiol. Ethnomed.", "FAO INFOODS AFDB",
    ],
    dataConfidence: "high",
  },

  {
    uid: "dip-barley-raw",
    nameEn: "Barley",
    nameAmharic: "ገብስ",
    scientificName: "Hordeum vulgare",
    category: "Cereal Grain",
    partUsed: "Whole grain",
    processingState: "raw",
    basis: "per 100 g dry raw grain",
    proximate: {
      energyKcal: 354, moisture_g: 10.1, protein_g: 12.5,
      fat_g: 2.3, carbohydrate_g: 73.5, dietaryFiber_g: 17.3,
      ash_g: 2.3, starch_g: 57.0, sugars_g: 0.8,
    },
    minerals: {
      calcium_mg: 33, iron_mg: 3.6, magnesium_mg: 133,
      phosphorus_mg: 264, potassium_mg: 452, sodium_mg: 12,
      zinc_mg: 2.8, copper_mg: 0.5, manganese_mg: 1.9,
      selenium_mcg: 37.7,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.65, vitaminB2_riboflavin_mg: 0.29,
      vitaminB3_niacin_mg: 4.6, vitaminB5_pantothenicAcid_mg: 0.28,
      vitaminB6_pyridoxine_mg: 0.32, vitaminB9_folate_mcg: 19,
      vitaminE_tocopherol_mg: 0.57,
    },
    aminoAcids: {
      essential: {
        histidine: 2.5, isoleucine: 3.6, leucine: 6.8,
        lysine: 3.6, methionine: 1.9, phenylalanine: 5.1,
        threonine: 3.3, tryptophan: 1.2, valine: 4.7,
      },
      semiEssential: {
        arginine: 5.0, cysteine: 2.5, glycine: 3.6, proline: 12.0, tyrosine: 2.9,
      },
      limitingAmino: "Lysine",
      aminoAcidScore: 62,
    },
    fattyAcids: {
      totalSaturatedG: 0.48, totalMonounsaturatedG: 0.28, totalPolyunsaturatedG: 1.08,
      palmitic_C16_0: 0.40, stearic_C18_0: 0.06,
      oleic_C18_1: 0.27, linoleic_C18_2n6: 0.96,
      alphaLinolenic_C18_3n3: 0.09, omega3ToOmega6Ratio: "1:11",
    },
    phenolics: {
      totalPhenolicsMgGAE: 210, totalFlavonoidsMg: 68,
      ferulic_mg: 44, proanthocyanidins_mg: 115,
      condensedTannins_mg: 110,
      note: "High condensed tannins in hulled varieties; hull removal significantly reduces.",
    },
    antinutrients: {
      phytate_mg: 540, tannins_mg: 350, oxalates_mg: 30,
      trypsinInhibitor_TIU: 3.8,
      processingReduction: {
        method: "Qolo dry roasting + soaking",
        phytateReductionPct: 60, tanninsReductionPct: 70,
        trypsinInhibitorReductionPct: 85,
      },
    },
    glycemicIndex: 28,
    functionalProperties: [
      "Very high beta-glucan soluble fiber (LDL lowering)",
      "Cholesterol reduction effect", "Prebiotic for gut microbiome",
      "Low glycemic index", "Rich in selenium",
    ],
    bioavailabilityNotes: "Beta-glucan (3–10 g/100 g whole grain) forms viscous gel in gut, slowing glucose absorption and binding bile acids.",
    sourceReferences: ["USDA FoodData Central #170283", "Baik & Ullrich (2008) J Cereal Sci."],
    dataConfidence: "high",
  },

  {
    uid: "dip-maize-raw",
    nameEn: "Maize (Corn)",
    nameAmharic: "በቆሎ",
    scientificName: "Zea mays",
    category: "Cereal Grain",
    partUsed: "Whole kernel",
    processingState: "raw",
    basis: "per 100 g dry raw grain",
    proximate: {
      energyKcal: 365, moisture_g: 10.4, protein_g: 9.4,
      fat_g: 4.7, carbohydrate_g: 74.3, dietaryFiber_g: 7.3,
      ash_g: 1.2, starch_g: 63.0, sugars_g: 0.6,
    },
    minerals: {
      calcium_mg: 7, iron_mg: 2.7, magnesium_mg: 127,
      phosphorus_mg: 210, potassium_mg: 287, sodium_mg: 35,
      zinc_mg: 2.2, copper_mg: 0.3, manganese_mg: 0.5,
      selenium_mcg: 15.4,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 11, betaCarotene_mcg: 97,
      vitaminB1_thiamine_mg: 0.39, vitaminB2_riboflavin_mg: 0.20,
      vitaminB3_niacin_mg: 3.6, vitaminB6_pyridoxine_mg: 0.62,
      vitaminB9_folate_mcg: 19, vitaminC_ascorbicAcid_mg: 0,
      vitaminE_tocopherol_mg: 0.49,
    },
    aminoAcids: {
      essential: {
        histidine: 3.2, isoleucine: 3.5, leucine: 11.8,
        lysine: 2.7, methionine: 2.0, phenylalanine: 4.7,
        threonine: 3.7, tryptophan: 0.7, valine: 4.8,
      },
      limitingAmino: "Lysine and Tryptophan",
      aminoAcidScore: 44,
    },
    fattyAcids: {
      totalSaturatedG: 0.67, totalMonounsaturatedG: 1.25, totalPolyunsaturatedG: 2.16,
      palmitic_C16_0: 0.52, oleic_C18_1: 1.24,
      linoleic_C18_2n6: 2.07, alphaLinolenic_C18_3n3: 0.06,
      omega3ToOmega6Ratio: "1:34",
    },
    phenolics: {
      totalPhenolicsMgGAE: 170, totalFlavonoidsMg: 52,
      ferulic_mg: 120, lutein_mcg: 1800, zeaxanthin_mcg: 620,
      note: "Bound ferulic acid in bran; lutein/zeaxanthin in yellow corn are significant eye health carotenoids.",
    },
    antinutrients: {
      phytate_mg: 280, tannins_mg: 45, oxalates_mg: 15,
      processingReduction: {
        method: "Nixtamalization (lime-soaking) or fermentation",
        phytateReductionPct: 50, tanninsReductionPct: 40,
      },
    },
    glycemicIndex: 55,
    functionalProperties: [
      "Rich in bound ferulic antioxidants", "Good source of carotenoids",
      "High leucine for muscle protein synthesis", "Low sodium",
    ],
    bioavailabilityNotes: "Niacin is mostly bound (niacytin) and not bioavailable unless alkali-treated (nixtamalization). Lysine and tryptophan deficiency causes pellagra in maize-dominant diets.",
    sourceReferences: ["USDA FoodData Central #170288", "Salinas et al. (2012) Cereal Chem."],
    dataConfidence: "high",
  },

  {
    uid: "dip-sorghum-raw",
    nameEn: "Sorghum",
    nameAmharic: "ማሽላ",
    scientificName: "Sorghum bicolor",
    category: "Cereal Grain",
    partUsed: "Whole grain",
    processingState: "raw",
    basis: "per 100 g dry raw grain",
    proximate: {
      energyKcal: 329, moisture_g: 9.2, protein_g: 10.6,
      fat_g: 3.5, carbohydrate_g: 72.1, dietaryFiber_g: 6.7,
      ash_g: 1.6, starch_g: 62.0,
    },
    minerals: {
      calcium_mg: 28, iron_mg: 4.4, magnesium_mg: 165,
      phosphorus_mg: 287, potassium_mg: 350, sodium_mg: 6,
      zinc_mg: 1.7, copper_mg: 0.3, manganese_mg: 1.6,
      selenium_mcg: 14.3,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.24, vitaminB2_riboflavin_mg: 0.14,
      vitaminB3_niacin_mg: 2.9, vitaminB6_pyridoxine_mg: 0.44,
      vitaminB9_folate_mcg: 20, vitaminE_tocopherol_mg: 0.50,
    },
    aminoAcids: {
      essential: {
        histidine: 2.5, isoleucine: 3.9, leucine: 13.0,
        lysine: 2.4, methionine: 1.7, phenylalanine: 5.0,
        threonine: 3.0, tryptophan: 1.0, valine: 5.3,
      },
      limitingAmino: "Lysine",
      aminoAcidScore: 48,
    },
    fattyAcids: {
      totalSaturatedG: 0.46, totalMonounsaturatedG: 1.16, totalPolyunsaturatedG: 1.50,
      palmitic_C16_0: 0.39, oleic_C18_1: 1.13,
      linoleic_C18_2n6: 1.41, alphaLinolenic_C18_3n3: 0.04,
      omega3ToOmega6Ratio: "1:35",
    },
    phenolics: {
      totalPhenolicsMgGAE: 450, totalFlavonoidsMg: 185,
      proanthocyanidins_mg: 280, condensedTannins_mg: 260,
      totalAnthocyaninsMg: 32,
      note: "Among the highest phenolic content of all cereals, especially 3-deoxyanthocyanidins unique to sorghum.",
    },
    antinutrients: {
      phytate_mg: 490, tannins_mg: 380, oxalates_mg: 20,
      trypsinInhibitor_TIU: 5.0,
      processingReduction: {
        method: "Wet fermentation + cooking",
        phytateReductionPct: 55, tanninsReductionPct: 65,
        trypsinInhibitorReductionPct: 78,
      },
    },
    glycemicIndex: 50,
    functionalProperties: [
      "Very high antioxidant phenolics", "3-deoxyanthocyanidins (anti-fungal)",
      "Gluten-free", "Drought-resilient crop", "Slow starch digestion",
    ],
    bioavailabilityNotes: "High tannin sorghum varieties significantly inhibit protein and starch digestibility; kafirin proteins are inherently resistant to pepsin digestion. Waxy sorghum has higher resistant starch.",
    sourceReferences: ["USDA FoodData Central #169716", "Awika & Rooney (2004) Food Chem."],
    dataConfidence: "medium",
  },

  {
    uid: "dip-wheat-raw",
    nameEn: "Wheat (Whole Grain)",
    nameAmharic: "ስንዴ",
    scientificName: "Triticum aestivum",
    category: "Cereal Grain",
    partUsed: "Whole grain",
    processingState: "raw",
    basis: "per 100 g dry raw grain",
    proximate: {
      energyKcal: 340, moisture_g: 10.7, protein_g: 13.2,
      fat_g: 2.5, carbohydrate_g: 72.0, dietaryFiber_g: 10.7,
      ash_g: 1.7, starch_g: 59.0, sugars_g: 0.4,
    },
    minerals: {
      calcium_mg: 34, iron_mg: 3.5, magnesium_mg: 138,
      phosphorus_mg: 357, potassium_mg: 405, sodium_mg: 2,
      zinc_mg: 2.8, copper_mg: 0.4, manganese_mg: 3.9,
      selenium_mcg: 70.7,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.54, vitaminB2_riboflavin_mg: 0.15,
      vitaminB3_niacin_mg: 5.5, vitaminB6_pyridoxine_mg: 0.41,
      vitaminB9_folate_mcg: 43, vitaminE_tocopherol_mg: 1.01,
    },
    aminoAcids: {
      essential: {
        histidine: 2.8, isoleucine: 3.9, leucine: 6.8,
        lysine: 2.8, methionine: 1.8, phenylalanine: 4.9,
        threonine: 3.0, tryptophan: 1.1, valine: 4.4,
      },
      semiEssential: {
        arginine: 5.1, proline: 11.5, glycine: 4.3, cysteine: 2.5, tyrosine: 3.1,
      },
      limitingAmino: "Lysine",
      aminoAcidScore: 54,
    },
    fattyAcids: {
      totalSaturatedG: 0.45, totalMonounsaturatedG: 0.36, totalPolyunsaturatedG: 1.17,
      palmitic_C16_0: 0.37, oleic_C18_1: 0.35,
      linoleic_C18_2n6: 1.08, alphaLinolenic_C18_3n3: 0.06,
      omega3ToOmega6Ratio: "1:18",
    },
    phenolics: {
      totalPhenolicsMgGAE: 195, totalFlavonoidsMg: 47,
      ferulic_mg: 130, lignans_mg: 20,
      note: "Ferulic acid concentrated in bran; alkylresorcinols unique to wheat/rye.",
    },
    antinutrients: {
      phytate_mg: 760, tannins_mg: 80, oxalates_mg: 24,
      trypsinInhibitor_TIU: 4.5,
      processingReduction: {
        method: "Sourdough fermentation (reduces phytate >50%), yeast fermentation",
        phytateReductionPct: 55, tanninsReductionPct: 30,
        trypsinInhibitorReductionPct: 60,
      },
    },
    glycemicIndex: 45,
    functionalProperties: [
      "Highest selenium among common cereals",
      "Rich in B-vitamins (esp. B6, folate, thiamine)",
      "High insoluble fiber (peristalsis)",
      "Contains gluten (contraindicated in celiac disease)",
    ],
    bioavailabilityNotes: "High phytate content but sourdough fermentation with phytase-active lactobacilli can reduce phytate by 55–97%, dramatically improving zinc and iron absorption.",
    sourceReferences: ["USDA FoodData Central #169721", "Schlemmer et al. (2009) Mol. Nutr. Food Res."],
    dataConfidence: "high",
  },

  {
    uid: "dip-finger-millet-raw",
    nameEn: "Finger Millet",
    nameAmharic: "ዳጉሳ",
    nameLocal: "Dagussa / Telebun",
    scientificName: "Eleusine coracana",
    category: "Cereal Grain",
    partUsed: "Whole grain",
    processingState: "raw",
    basis: "per 100 g dry raw grain",
    proximate: {
      energyKcal: 378, moisture_g: 8.7, protein_g: 11.0,
      fat_g: 4.2, carbohydrate_g: 72.0, dietaryFiber_g: 3.6,
      ash_g: 1.5, starch_g: 65.0, sugars_g: 1.5,
    },
    minerals: {
      calcium_mg: 364, iron_mg: 8.7, magnesium_mg: 137,
      phosphorus_mg: 283, potassium_mg: 408, sodium_mg: 11,
      zinc_mg: 2.5, copper_mg: 0.5, manganese_mg: 5.5,
      selenium_mcg: 4.5,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.42, vitaminB2_riboflavin_mg: 0.19,
      vitaminB3_niacin_mg: 1.1, vitaminB6_pyridoxine_mg: 0.05,
      vitaminB9_folate_mcg: 18, vitaminE_tocopherol_mg: 0.35,
    },
    aminoAcids: {
      essential: {
        histidine: 2.2, isoleucine: 4.1, leucine: 8.9,
        lysine: 2.9, methionine: 3.1, phenylalanine: 5.3,
        threonine: 3.9, tryptophan: 1.1, valine: 5.7,
      },
      semiEssential: {
        arginine: 4.4, cysteine: 2.2, glycine: 3.9, proline: 8.1, tyrosine: 3.5,
      },
      limitingAmino: "Lysine",
      aminoAcidScore: 52,
    },
    fattyAcids: {
      totalSaturatedG: 0.58, totalMonounsaturatedG: 0.75, totalPolyunsaturatedG: 2.48,
      palmitic_C16_0: 0.50, oleic_C18_1: 0.70,
      linoleic_C18_2n6: 2.30, alphaLinolenic_C18_3n3: 0.14,
      omega3ToOmega6Ratio: "1:16",
    },
    phenolics: {
      totalPhenolicsMgGAE: 310, totalFlavonoidsMg: 98,
      ferulic_mg: 55, proanthocyanidins_mg: 82,
      condensedTannins_mg: 76,
      note: "Significant condensed tannins; red-pigmented varieties higher. Phenolic-rich pericarp.",
    },
    antinutrients: {
      phytate_mg: 480, tannins_mg: 200, oxalates_mg: 38,
      trypsinInhibitor_TIU: 3.5,
      processingReduction: {
        method: "Fermentation + malting (germination)",
        phytateReductionPct: 70, tanninsReductionPct: 55,
        trypsinInhibitorReductionPct: 78,
      },
    },
    glycemicIndex: 44,
    functionalProperties: [
      "Highest calcium among all cereals (3× more than milk per 100 g)",
      "Excellent for pediatric and maternal bone health",
      "Rich in methionine (unusual for cereals)",
      "Strong anti-diabetic potential (slow starch digestion)",
    ],
    bioavailabilityNotes: "Native calcium extremely high (364 mg/100g) but complexed with phytate and oxalate. Fermentation raises calcium bioaccessibility by ~35% by degrading antinutrient complexes.",
    sourceReferences: ["USDA FoodData Central #169713", "Devi et al. (2014) Food Qual. Safety"],
    dataConfidence: "medium",
  },

  {
    uid: "dip-pearl-millet-raw",
    nameEn: "Pearl Millet",
    nameAmharic: "ዶቄ",
    nameLocal: "Dokhe / Dukhe",
    scientificName: "Pennisetum glaucum",
    category: "Cereal Grain",
    partUsed: "Whole grain",
    processingState: "raw",
    basis: "per 100 g dry raw grain",
    proximate: {
      energyKcal: 378, moisture_g: 8.5, protein_g: 10.6,
      fat_g: 5.0, carbohydrate_g: 72.8, dietaryFiber_g: 3.5,
      ash_g: 2.3, starch_g: 62.0,
    },
    minerals: {
      calcium_mg: 42, iron_mg: 8.0, magnesium_mg: 137,
      phosphorus_mg: 296, potassium_mg: 307, sodium_mg: 5,
      zinc_mg: 3.1, copper_mg: 0.7, manganese_mg: 1.8,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.33, vitaminB2_riboflavin_mg: 0.21,
      vitaminB3_niacin_mg: 2.8, vitaminB9_folate_mcg: 55,
      vitaminE_tocopherol_mg: 0.09,
    },
    aminoAcids: {
      essential: {
        histidine: 2.3, isoleucine: 4.1, leucine: 10.5,
        lysine: 3.0, methionine: 2.4, phenylalanine: 5.5,
        threonine: 3.7, tryptophan: 1.2, valine: 5.6,
      },
      limitingAmino: "Lysine",
      aminoAcidScore: 58,
    },
    fattyAcids: {
      totalSaturatedG: 0.92, totalMonounsaturatedG: 1.28, totalPolyunsaturatedG: 2.38,
      oleic_C18_1: 1.20, linoleic_C18_2n6: 2.23,
      alphaLinolenic_C18_3n3: 0.10, omega3ToOmega6Ratio: "1:22",
    },
    phenolics: {
      totalPhenolicsMgGAE: 185, totalFlavonoidsMg: 62,
      ferulic_mg: 40, totalAnthocyaninsMg: 12,
    },
    antinutrients: {
      phytate_mg: 500, tannins_mg: 120, oxalates_mg: 35,
      processingReduction: {
        method: "Fermentation (Ogi-style) or germination",
        phytateReductionPct: 60, tanninsReductionPct: 50,
      },
    },
    glycemicIndex: 55,
    functionalProperties: ["Very high iron", "Good folate source", "Rich in zinc"],
    sourceReferences: ["USDA FoodData Central #169716", "Nambiar et al. (2011) J. Food Sci."],
    dataConfidence: "medium",
  },

  {
    uid: "dip-oats-raw",
    nameEn: "Oats",
    nameAmharic: "አጃ",
    scientificName: "Avena sativa",
    category: "Cereal Grain",
    partUsed: "Whole grain",
    processingState: "raw",
    basis: "per 100 g dry raw grain",
    proximate: {
      energyKcal: 389, moisture_g: 8.2, protein_g: 16.9,
      fat_g: 6.9, carbohydrate_g: 66.3, dietaryFiber_g: 10.6,
      ash_g: 1.7, starch_g: 55.7, sugars_g: 0.9,
    },
    minerals: {
      calcium_mg: 54, iron_mg: 4.7, magnesium_mg: 177,
      phosphorus_mg: 523, potassium_mg: 429, sodium_mg: 2,
      zinc_mg: 3.9, copper_mg: 0.6, manganese_mg: 4.9,
      selenium_mcg: 28.9,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.76, vitaminB2_riboflavin_mg: 0.14,
      vitaminB3_niacin_mg: 0.96, vitaminB5_pantothenicAcid_mg: 1.35,
      vitaminB6_pyridoxine_mg: 0.12, vitaminB9_folate_mcg: 56,
      vitaminE_tocopherol_mg: 0.42,
    },
    aminoAcids: {
      essential: {
        histidine: 2.7, isoleucine: 4.5, leucine: 7.9,
        lysine: 4.1, methionine: 2.3, phenylalanine: 5.7,
        threonine: 3.7, tryptophan: 1.4, valine: 5.8,
      },
      semiEssential: { arginine: 7.3, cysteine: 2.9, glycine: 5.3, proline: 5.5, tyrosine: 3.9 },
      limitingAmino: "Methionine",
      aminoAcidScore: 79,
    },
    fattyAcids: {
      totalSaturatedG: 1.22, totalMonounsaturatedG: 2.18, totalPolyunsaturatedG: 2.54,
      palmitic_C16_0: 1.04, oleic_C18_1: 2.12,
      linoleic_C18_2n6: 2.42, alphaLinolenic_C18_3n3: 0.11,
      omega3ToOmega6Ratio: "1:22",
    },
    phenolics: {
      totalPhenolicsMgGAE: 156, totalFlavonoidsMg: 45,
      ferulic_mg: 25, orac_umolTE: 2183,
      note: "Unique avenanthramides (oat-specific phenols) with anti-inflammatory cardiovascular benefits.",
    },
    antinutrients: {
      phytate_mg: 390, tannins_mg: 30, oxalates_mg: 8,
      processingReduction: {
        method: "Soaking, steaming, rolling (thermal)",
        phytateReductionPct: 40, tanninsReductionPct: 35,
      },
    },
    glycemicIndex: 55,
    functionalProperties: [
      "Highest protein among common cereals",
      "Highest beta-glucan concentration (effective LDL lowering dose: 3 g/day)",
      "Avenanthramides: unique anti-inflammatory oat phenols",
      "Rich in pantothenic acid",
    ],
    bioavailabilityNotes: "Beta-glucan forms highly viscous gel that blunts postprandial glucose and insulin spikes. Phytase activity moderate; soaking overnight helps.",
    sourceReferences: ["USDA FoodData Central #169705", "Whitehead et al. (2014) Am. J. Clin. Nutr."],
    dataConfidence: "high",
  },

  {
    uid: "dip-emmer-raw",
    nameEn: "Emmer Wheat (Farro)",
    nameAmharic: "አጣ",
    scientificName: "Triticum dicoccum",
    category: "Cereal Grain",
    partUsed: "Whole grain",
    processingState: "raw",
    basis: "per 100 g dry raw grain",
    proximate: {
      energyKcal: 338, moisture_g: 10.0, protein_g: 14.6,
      fat_g: 2.5, carbohydrate_g: 70.0, dietaryFiber_g: 8.5,
      ash_g: 1.8, starch_g: 60.0,
    },
    minerals: {
      calcium_mg: 49, iron_mg: 4.2, magnesium_mg: 145,
      phosphorus_mg: 372, potassium_mg: 388, sodium_mg: 7,
      zinc_mg: 3.8, copper_mg: 0.5, manganese_mg: 4.0,
      selenium_mcg: 62,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.48, vitaminB2_riboflavin_mg: 0.17,
      vitaminB3_niacin_mg: 6.1, vitaminB6_pyridoxine_mg: 0.37,
      vitaminB9_folate_mcg: 45, vitaminE_tocopherol_mg: 1.5,
    },
    aminoAcids: {
      essential: {
        histidine: 3.1, isoleucine: 4.0, leucine: 7.2,
        lysine: 3.0, methionine: 2.0, phenylalanine: 5.2,
        threonine: 3.3, tryptophan: 1.2, valine: 4.7,
      },
      limitingAmino: "Lysine",
      aminoAcidScore: 58,
    },
    fattyAcids: {
      totalSaturatedG: 0.45, totalMonounsaturatedG: 0.40,
      totalPolyunsaturatedG: 1.10, linoleic_C18_2n6: 1.00,
      alphaLinolenic_C18_3n3: 0.07,
    },
    phenolics: {
      totalPhenolicsMgGAE: 220, ferulic_mg: 145, lignans_mg: 25,
      note: "Ancient wheat varieties contain higher carotenoid (lutein, zeaxanthin) and avenanthramide content than modern wheat.",
    },
    antinutrients: {
      phytate_mg: 680, tannins_mg: 60,
      processingReduction: {
        method: "Sourdough fermentation",
        phytateReductionPct: 65, tanninsReductionPct: 35,
      },
    },
    glycemicIndex: 40,
    functionalProperties: [
      "Ancient heritage grain with higher micronutrient density than modern wheat",
      "Good zinc and iron content", "Higher protein than common wheat varieties",
    ],
    sourceReferences: ["FAO Plant Production and Protection Paper", "Abdel-Aal et al. (2008) Cereal Chem."],
    dataConfidence: "medium",
  },
];

const cerealCatalogSpecs = [
  {
    grain: "Teff", scientificName: "Eragrostis tef", templateUid: "dip-teff-raw",
    types: ["white-seeded", "red-seeded", "brown-seeded", "mixed-color", "ivory", "dark", "small-seeded", "large-seeded", "highland", "lowland", "early-maturing", "late-maturing", "short-season", "long-season", "drought-tolerant", "lodging-resistant", "traditional landrace", "improved line", "whole-grain", "hulled"],
  },
  {
    grain: "Barley", scientificName: "Hordeum vulgare", templateUid: "dip-barley-raw",
    types: ["two-row hulled", "six-row hulled", "two-row hulless", "six-row hulless", "malting", "food", "feed", "high-beta-glucan", "spring", "winter", "highland", "drought-tolerant", "salt-tolerant", "early-maturing", "late-maturing", "purple", "black", "golden", "naked", "whole-grain"],
  },
  {
    grain: "Maize", scientificName: "Zea mays", templateUid: "dip-maize-raw",
    types: ["dent white", "dent yellow", "flint white", "flint yellow", "flour", "sweet", "waxy", "popcorn", "blue", "red", "purple", "orange", "high-lysine quality protein", "high-oil", "highland", "tropical", "early-maturing", "drought-tolerant", "open-pollinated", "whole-kernel"],
  },
  {
    grain: "Sorghum", scientificName: "Sorghum bicolor", templateUid: "dip-sorghum-raw",
    types: ["white", "cream", "yellow", "red", "brown", "black", "food-grade", "sweet", "high-tannin", "low-tannin", "malted", "popping", "highland", "lowland", "drought-tolerant", "early-maturing", "late-maturing", "bird-resistant", "grain", "whole-kernel"],
  },
  {
    grain: "Wheat", scientificName: "Triticum aestivum", templateUid: "dip-wheat-raw",
    types: ["hard red spring", "hard red winter", "soft red winter", "hard white", "soft white", "durum", "club", "spelt", "einkorn", "emmer", "landrace", "high-protein", "high-fiber", "whole-grain", "spring", "winter", "red-grained", "white-grained", "drought-tolerant", "heritage"],
  },
  {
    grain: "Finger Millet", scientificName: "Eleusine coracana", templateUid: "dip-finger-millet-raw",
    types: ["red", "brown", "white", "dark-brown", "light-brown", "large-seeded", "small-seeded", "high-calcium", "highland", "lowland", "early-maturing", "late-maturing", "drought-tolerant", "short-season", "long-season", "compact-head", "open-head", "traditional landrace", "improved line", "whole-grain"],
  },
  {
    grain: "Pearl Millet", scientificName: "Pennisetum glaucum", templateUid: "dip-pearl-millet-raw",
    types: ["white", "gray", "yellow", "brown", "large-grain", "small-grain", "high-iron", "high-zinc", "early-maturing", "late-maturing", "drought-tolerant", "heat-tolerant", "compact-head", "open-head", "forage-grain", "food-grain", "traditional landrace", "hybrid", "whole-grain", "decorticated"],
  },
  {
    grain: "Oats", scientificName: "Avena sativa", templateUid: "dip-oats-raw",
    types: ["hulled", "naked", "white", "yellow", "black", "red", "high-beta-glucan", "high-protein", "spring", "winter", "food-grade", "feed-grade", "milling", "large-kernel", "small-kernel", "early-maturing", "late-maturing", "drought-tolerant", "whole-grain", "dehulled"],
  },
  {
    grain: "Emmer Wheat", scientificName: "Triticum dicoccum", templateUid: "dip-emmer-raw",
    types: ["hulled", "free-threshing", "red-grained", "white-grained", "purple", "high-protein", "high-fiber", "large-seeded", "small-seeded", "highland", "spring", "winter", "early-maturing", "late-maturing", "traditional landrace", "heritage", "drought-tolerant", "whole-grain", "organic type", "farro"],
  },
  {
    grain: "Rice", scientificName: "Oryza sativa", templateUid: "dip-wheat-raw",
    types: ["long-grain white", "long-grain brown", "medium-grain white", "medium-grain brown", "short-grain", "aromatic", "basmati", "jasmine", "glutinous", "red", "black", "purple", "parboiled", "high-amylose", "low-amylose", "upland", "lowland", "flood-tolerant", "whole-grain", "wild-type"],
  },
] as const;

const cerealTemplates = new Map(CORE_DEEP_CEREAL_PROFILES.map((profile) => [profile.uid, profile]));
const cerealCatalogEntries = cerealCatalogSpecs.flatMap((spec) =>
  spec.types.map((type) => ({ spec, type })),
);

export const DEEP_CEREAL_PROFILES: DeepIngredientProfile[] = [
  ...CORE_DEEP_CEREAL_PROFILES,
  ...cerealCatalogEntries.slice(0, 191).map(({ spec, type }, index) => {
    const template = cerealTemplates.get(spec.templateUid)!;
    return {
      ...template,
      uid: `dip-catalog-${String(index + 1).padStart(3, "0")}`,
      nameEn: `${spec.grain} — ${type}`,
      nameAmharic: undefined,
      scientificName: spec.scientificName,
      category: "Cereal Grain",
      partUsed: "Whole grain type",
      processingState: "raw category-level reference estimate",
      basis: "per 100 g dry raw grain; indicative category proxy, not type-specific analysis",
      aminoAcids: undefined,
      fattyAcids: undefined,
      phenolics: undefined,
      antinutrients: undefined,
      glycemicIndex: undefined,
      glycemicLoad: undefined,
      insulinIndex: undefined,
      functionalProperties: ["Indicative grain-category composition; not a type-specific laboratory analysis."],
      bioavailabilityNotes: "Values are low-confidence category-level proxies from a related cereal profile. Cultivar, growing conditions, and processing can change composition substantially.",
      sourceReferences: ["Indicative category proxy based on " + template.nameEn + "; not a type-specific record or laboratory analysis."],
      dataConfidence: "low" as const,
    };
  }),
];

// ============================================================
// KEY NON-CEREAL INGREDIENTS — Raw / Unprocessed
// ============================================================

export const DEEP_INGREDIENT_PROFILES: DeepIngredientProfile[] = [
  {
    uid: "dip-lentils-red-raw",
    nameEn: "Red Lentils",
    nameAmharic: "ምስር",
    scientificName: "Lens culinaris",
    category: "Legume",
    partUsed: "Dried seed",
    processingState: "raw",
    basis: "per 100 g raw dry seed",
    proximate: {
      energyKcal: 352, moisture_g: 10.4, protein_g: 25.8,
      fat_g: 1.1, carbohydrate_g: 60.1, dietaryFiber_g: 10.7, ash_g: 2.6,
    },
    minerals: {
      calcium_mg: 56, iron_mg: 6.5, magnesium_mg: 47,
      phosphorus_mg: 281, potassium_mg: 677, sodium_mg: 6,
      zinc_mg: 3.3, copper_mg: 0.75, manganese_mg: 1.4, selenium_mcg: 8.3,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.87, vitaminB2_riboflavin_mg: 0.21,
      vitaminB3_niacin_mg: 2.6, vitaminB6_pyridoxine_mg: 0.54,
      vitaminB9_folate_mcg: 479, vitaminC_ascorbicAcid_mg: 4.4,
    },
    aminoAcids: {
      essential: {
        lysine: 6.5, leucine: 6.8, isoleucine: 4.3, valine: 4.8,
        threonine: 3.8, methionine: 0.9, phenylalanine: 4.9,
        histidine: 2.6, tryptophan: 0.9,
      },
      limitingAmino: "Methionine",
      aminoAcidScore: 60,
    },
    fattyAcids: {
      totalSaturatedG: 0.15, totalPolyunsaturatedG: 0.53,
      linoleic_C18_2n6: 0.46, alphaLinolenic_C18_3n3: 0.07,
    },
    phenolics: {
      totalPhenolicsMgGAE: 388, totalFlavonoidsMg: 145, quercetin_mg: 4.4,
      kaempferol_mg: 1.8, proanthocyanidins_mg: 88,
      note: "Polyphenols concentrated in seed coat; dehulled lentils lose most phenolics.",
    },
    antinutrients: {
      phytate_mg: 468, tannins_mg: 85, lectins_HU: 400,
      trypsinInhibitor_TIU: 3.2, saponins_mg: 15,
      processingReduction: {
        method: "Soaking 12h + boiling", phytateReductionPct: 45,
        tanninsReductionPct: 60, lectinsReductionPct: 95,
        trypsinInhibitorReductionPct: 72,
      },
    },
    glycemicIndex: 21,
    functionalProperties: [
      "Highest folate source for prenatal nutrition",
      "Rich plant protein with complementary amino acids when paired with cereal",
      "Powerful prebiotic fiber (galactooligosaccharides)",
    ],
    sourceReferences: ["USDA FoodData Central #172421", "Fabbri et al. (2019) Food Sci. Nutr."],
    dataConfidence: "high",
  },

  {
    uid: "dip-chickpeas-raw",
    nameEn: "Chickpeas (Garbanzo)",
    nameAmharic: "ሽምብራ",
    scientificName: "Cicer arietinum",
    category: "Legume",
    partUsed: "Dried seed",
    processingState: "raw",
    basis: "per 100 g raw dry seed",
    proximate: {
      energyKcal: 364, moisture_g: 11.5, protein_g: 19.0,
      fat_g: 6.0, carbohydrate_g: 60.7, dietaryFiber_g: 17.4, ash_g: 2.8,
    },
    minerals: {
      calcium_mg: 105, iron_mg: 4.3, magnesium_mg: 115,
      phosphorus_mg: 366, potassium_mg: 718, sodium_mg: 24,
      zinc_mg: 3.4, copper_mg: 0.85, manganese_mg: 2.2, selenium_mcg: 8.2,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.48, vitaminB2_riboflavin_mg: 0.21,
      vitaminB3_niacin_mg: 1.5, vitaminB6_pyridoxine_mg: 0.54,
      vitaminB9_folate_mcg: 557, vitaminC_ascorbicAcid_mg: 4.0, vitaminE_tocopherol_mg: 0.82,
    },
    aminoAcids: {
      essential: {
        lysine: 6.4, leucine: 6.5, isoleucine: 4.4, valine: 4.6,
        threonine: 3.8, methionine: 1.0, phenylalanine: 5.0,
        histidine: 2.6, tryptophan: 0.9,
      },
      limitingAmino: "Methionine",
      aminoAcidScore: 62,
    },
    phenolics: {
      totalPhenolicsMgGAE: 320, totalFlavonoidsMg: 110, quercetin_mg: 6.4,
      kaempferol_mg: 2.3, ferulic_mg: 28,
    },
    antinutrients: {
      phytate_mg: 528, lectins_HU: 800, tannins_mg: 45,
      trypsinInhibitor_TIU: 4.2, saponins_mg: 25,
      processingReduction: {
        method: "Soaking + boiling + pressure cooking",
        phytateReductionPct: 50, lectinsReductionPct: 98,
        trypsinInhibitorReductionPct: 80,
      },
    },
    glycemicIndex: 28,
    functionalProperties: [
      "Highest folate among common pulses", "Resistant starch for gut microbiome",
      "Anti-diabetic prebiotic effects", "Good source of plant fat",
    ],
    sourceReferences: ["USDA FoodData Central #173756", "Raza et al. (2019) Nutrients"],
    dataConfidence: "high",
  },

  {
    uid: "dip-flaxseed-raw",
    nameEn: "Flaxseed (Linseed)",
    nameAmharic: "ተልባ",
    scientificName: "Linum usitatissimum",
    category: "Oilseed",
    partUsed: "Whole seed",
    processingState: "raw",
    basis: "per 100 g raw whole seed",
    proximate: {
      energyKcal: 534, moisture_g: 6.9, protein_g: 18.3,
      fat_g: 42.2, carbohydrate_g: 28.9, dietaryFiber_g: 27.3, ash_g: 3.7,
    },
    minerals: {
      calcium_mg: 255, iron_mg: 5.7, magnesium_mg: 392,
      phosphorus_mg: 642, potassium_mg: 813, sodium_mg: 30,
      zinc_mg: 4.3, copper_mg: 1.2, manganese_mg: 2.5, selenium_mcg: 25.4,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 1.64, vitaminB3_niacin_mg: 3.1, vitaminB6_pyridoxine_mg: 0.47,
      vitaminB9_folate_mcg: 87, vitaminC_ascorbicAcid_mg: 0.6, vitaminE_tocopherol_mg: 0.31,
    },
    aminoAcids: {
      essential: {
        lysine: 3.2, leucine: 5.6, isoleucine: 3.8, valine: 4.6,
        methionine: 1.3, threonine: 3.8, phenylalanine: 4.5, tryptophan: 1.7, histidine: 2.4,
      },
      limitingAmino: "Lysine",
      aminoAcidScore: 68,
    },
    fattyAcids: {
      totalSaturatedG: 3.66, totalMonounsaturatedG: 7.53, totalPolyunsaturatedG: 28.73,
      palmitic_C16_0: 2.45, stearic_C18_0: 1.18, oleic_C18_1: 7.51,
      linoleic_C18_2n6: 5.90, alphaLinolenic_C18_3n3: 22.81,
      omega3ToOmega6Ratio: "4:1 (very high omega-3)",
    },
    phenolics: {
      totalPhenolicsMgGAE: 710, lignans_mg: 300,
      note: "Richest known plant source of mammalian lignan precursors (secoisolariciresinol diglucoside). Phytoestrogenic activity.",
    },
    antinutrients: {
      cyanogenicGlucosides_mg: 250,
      processingReduction: {
        method: "Roasting or soaking degrades cyanogens >80%",
        phytateReductionPct: 35,
      },
    },
    glycemicIndex: 32,
    functionalProperties: [
      "Richest plant source of ALA omega-3 fatty acid",
      "Highest lignan content of any food",
      "Strong laxative effect from mucilage (soluble gum)",
      "Phytoestrogenic — beneficial in menopause",
    ],
    sourceReferences: ["USDA FoodData Central #169414", "Kajla et al. (2015) J. Food Sci. Technol."],
    dataConfidence: "high",
  },

  {
    uid: "dip-moringa-leaves-raw",
    nameEn: "Moringa Leaves",
    nameAmharic: "ሽፈርዛ",
    nameLocal: "Shiferaw / Halako",
    scientificName: "Moringa stenopetala",
    category: "Vegetable / Leaf",
    partUsed: "Fresh leaves",
    processingState: "raw",
    basis: "per 100 g fresh leaf",
    proximate: {
      energyKcal: 64, moisture_g: 75.9, protein_g: 9.4,
      fat_g: 1.4, carbohydrate_g: 8.3, dietaryFiber_g: 2.0, ash_g: 2.9,
    },
    minerals: {
      calcium_mg: 440, iron_mg: 4.0, magnesium_mg: 42,
      phosphorus_mg: 70, potassium_mg: 259, sodium_mg: 9,
      zinc_mg: 0.6,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 378, betaCarotene_mcg: 2274,
      vitaminB1_thiamine_mg: 0.26, vitaminB2_riboflavin_mg: 0.66,
      vitaminB3_niacin_mg: 2.2, vitaminC_ascorbicAcid_mg: 220,
      vitaminE_tocopherol_mg: 8.3,
    },
    aminoAcids: {
      essential: {
        lysine: 5.9, leucine: 8.5, isoleucine: 4.8, valine: 5.5,
        methionine: 1.5, threonine: 3.7, phenylalanine: 5.9, tryptophan: 1.9, histidine: 2.6,
      },
      aminoAcidScore: 75,
    },
    phenolics: {
      totalPhenolicsMgGAE: 1250, totalFlavonoidsMg: 475, quercetin_mg: 178,
      kaempferol_mg: 82, chlorogenicAcid_mg: 55,
      note: "Moringa stenopetala (Ethiopian species) has higher protein and isothiocyanate content than M. oleifera.",
    },
    antinutrients: {
      oxalates_mg: 142, tannins_mg: 40, saponins_mg: 12,
      processingReduction: {
        method: "Brief blanching 3–5 min",
        tanninsReductionPct: 30,
      },
    },
    functionalProperties: [
      "Extraordinary micronutrient density — 'miracle tree'",
      "4× more vitamin C than orange", "4× more calcium than milk",
      "3× more iron than spinach", "2× more protein than yogurt",
      "Anti-inflammatory isothiocyanates", "Anti-malarial activity reported",
    ],
    bioavailabilityNotes: "Vitamin C (220 mg/100g) dramatically enhances non-heme iron absorption from accompanying foods — synergistic when eaten with legume stews.",
    sourceReferences: ["FAO WAFCT", "Bhattacharya et al. (2011) Asian Pac. J. Trop. Biomed."],
    dataConfidence: "medium",
  },

  {
    uid: "dip-berbere-spice-raw",
    nameEn: "Berbere Spice Blend",
    nameAmharic: "በርበሬ",
    category: "Spice / Condiment",
    partUsed: "Ground dried spice blend",
    processingState: "raw",
    basis: "per 100 g ground spice blend",
    proximate: {
      energyKcal: 280, moisture_g: 9.8, protein_g: 11.2,
      fat_g: 8.4, carbohydrate_g: 55.4, dietaryFiber_g: 28.2, ash_g: 7.2,
    },
    minerals: {
      calcium_mg: 322, iron_mg: 22.5, magnesium_mg: 186,
      potassium_mg: 1720, sodium_mg: 1130, zinc_mg: 4.7,
      copper_mg: 1.0, manganese_mg: 6.8,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 1040, betaCarotene_mcg: 6240,
      vitaminB6_pyridoxine_mg: 3.0, vitaminC_ascorbicAcid_mg: 76,
      vitaminE_tocopherol_mg: 38, vitaminK_mcg: 108,
    },
    phenolics: {
      totalPhenolicsMgGAE: 3400, totalFlavonoidsMg: 890,
      quercetin_mg: 120, kaempferol_mg: 45, ferulic_mg: 180,
      totalAnthocyaninsMg: 280,
      note: "Exceptionally high phenolic content from dried chilies, korerima, cloves, and fenugreek. Capsaicin from red peppers is the primary bioactive.",
    },
    antinutrients: { oxalates_mg: 85, tannins_mg: 90 },
    functionalProperties: [
      "Capsaicin — thermogenic, anti-inflammatory, analgesic",
      "Korerima — hepatoprotective, antioxidant",
      "Fenugreek — hypoglycemic, galactagogue",
      "Exceptional Vitamin A & E density",
      "High iron content per gram",
    ],
    sourceReferences: ["USDA FoodData Central #172231 (chili powder reference)", "Abebe et al. (2013) J. Ethnopharmacol."],
    dataConfidence: "low",
  },

  {
    uid: "dip-enset-fermented",
    nameEn: "Fermented Enset (Kocho)",
    nameAmharic: "ቆጮ (ወይም ቁጮ)",
    nameLocal: "Kocho / Bulla",
    scientificName: "Ensete ventricosum",
    category: "Root / Pseudocereal",
    partUsed: "Fermented corm and pseudostem",
    processingState: "fermented",
    basis: "per 100 g fermented product",
    proximate: {
      energyKcal: 183, moisture_g: 51.0, protein_g: 1.9,
      fat_g: 0.3, carbohydrate_g: 44.4, dietaryFiber_g: 6.5, ash_g: 1.4,
    },
    minerals: {
      calcium_mg: 35, iron_mg: 1.2, magnesium_mg: 38,
      phosphorus_mg: 48, potassium_mg: 255, sodium_mg: 8, zinc_mg: 0.5,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.04, vitaminB2_riboflavin_mg: 0.05,
      vitaminB3_niacin_mg: 0.5, vitaminB6_pyridoxine_mg: 0.18,
      vitaminC_ascorbicAcid_mg: 8,
    },
    phenolics: {
      totalPhenolicsMgGAE: 95, totalFlavonoidsMg: 38,
      note: "Phenolic content low post-fermentation. Enset fiber contains unique mucilaginous glucomannan.",
    },
    antinutrients: {
      oxalates_mg: 220,
      processingReduction: {
        method: "4–12 month anaerobic pit fermentation",
        trypsinInhibitorReductionPct: 65,
      },
    },
    functionalProperties: [
      "Staple food security crop for 20+ million Southern Ethiopians",
      "Climate-resilient perennial crop",
      "High resistant starch (kocho) supports gut health",
      "Low glycemic energy source",
    ],
    bioavailabilityNotes: "Low protein content (limiting amino acid profile) — enset-based diets require complementary legumes. Bulla (starch extract) is highly purified and nearly protein-free.",
    sourceReferences: ["Woldemariam & Moges (2015) Afr. J. Food Sci.", "FAO East Africa FCT"],
    dataConfidence: "medium",
  },

  {
    uid: "dip-niter-kibbeh",
    nameEn: "Niter Kibbeh (Ethiopian Spiced Clarified Butter)",
    nameAmharic: "ንጥር ቅቤ",
    category: "Fat / Condiment",
    partUsed: "Clarified butter with spices",
    processingState: "cooked",
    basis: "per 100 g",
    proximate: {
      energyKcal: 876, moisture_g: 0.2, protein_g: 0.9,
      fat_g: 99.5, carbohydrate_g: 0.0, dietaryFiber_g: 0.0, ash_g: 0.1,
    },
    minerals: { calcium_mg: 4, potassium_mg: 26, sodium_mg: 11 },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 684, vitaminD_mcg: 1.5,
      vitaminE_tocopherol_mg: 2.3, vitaminK_mcg: 7.0, vitaminB12_cobalamin_mcg: 0.17,
    },
    fattyAcids: {
      totalSaturatedG: 61.9, totalMonounsaturatedG: 28.7, totalPolyunsaturatedG: 3.7,
      palmitic_C16_0: 27.9, stearic_C18_0: 12.0, oleic_C18_1: 28.4,
      linoleic_C18_2n6: 2.3, alphaLinolenic_C18_3n3: 0.5,
      omega3ToOmega6Ratio: "1:5",
    },
    phenolics: {
      note: "Spice infusion (koseret, black cumin, korerima) adds trace phenolic compounds.",
    },
    functionalProperties: [
      "Fat-soluble vitamin carrier (A, D, E, K)",
      "Enhances absorption of carotenoids and fat-soluble nutrients",
      "Conjugated linoleic acid (CLA) — anti-inflammatory",
      "Spice infusion adds antimicrobial volatile oils",
    ],
    sourceReferences: ["USDA FoodData Central #173410 (clarified butter)", "Asrat et al. (2014) Ethiopian Vet. J."],
    dataConfidence: "medium",
  },
];

// Combined lookup map
export const DEEP_PROFILE_MAP: Map<string, DeepIngredientProfile> = new Map([
  ...DEEP_CEREAL_PROFILES.map((p) => [p.uid, p] as [string, DeepIngredientProfile]),
  ...DEEP_INGREDIENT_PROFILES.map((p) => [p.uid, p] as [string, DeepIngredientProfile]),
]);

/** Map from rawCerealId → deep uid */
export const CEREAL_ID_TO_DEEP_UID: Record<string, string> = {
  "raw-teff": "dip-teff-raw",
  "raw-barley": "dip-barley-raw",
  "raw-maize": "dip-maize-raw",
  "raw-sorghum": "dip-sorghum-raw",
  "raw-wheat": "dip-wheat-raw",
  "raw-finger-millet": "dip-finger-millet-raw",
  "raw-oats": "dip-oats-raw",
};

/** Map from ingredient name keyword → deep uid for non-cereal ingredients */
export const INGREDIENT_NAME_TO_DEEP_UID: Record<string, string> = {
  "Red lentils": "dip-lentils-red-raw",
  "Green lentils": "dip-lentils-red-raw",
  "Chickpea": "dip-chickpeas-raw",
  "Chickpeas": "dip-chickpeas-raw",
  "Flaxseed": "dip-flaxseed-raw",
  "Berbere": "dip-berbere-spice-raw",
  "Niter kibbeh": "dip-niter-kibbeh",
  "Moringa": "dip-moringa-leaves-raw",
  "Fermented enset": "dip-enset-fermented",
  "Enset": "dip-enset-fermented",
};
