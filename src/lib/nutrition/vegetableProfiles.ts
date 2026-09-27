/**
 * Vegetable Nutritional Profiles — Ethiopian & Universal
 * 30 items. Per 100 g raw edible portion unless noted.
 * Sources: USDA FoodData Central, FAO East Africa FCT, EFCT 2025,
 * Gebhardt & Thomas (2002) USDA Nutrient Data Lab.
 */

import type { DeepIngredientProfile } from "./deepNutrientProfiles";

export const VEGETABLE_PROFILES: DeepIngredientProfile[] = [
  // ── 1. Ethiopian Mustard Greens (Gomen) ──────────────────────
  {
    uid: "veg-gomen",
    nameEn: "Ethiopian Mustard Greens (Collard / Kale hybrid)",
    nameAmharic: "ጎመን",
    scientificName: "Brassica carinata",
    category: "Leafy Vegetable",
    partUsed: "Leaves and tender stems",
    processingState: "raw",
    basis: "per 100 g raw leaves",
    proximate: {
      energyKcal: 32, moisture_g: 88.3, protein_g: 3.2,
      fat_g: 0.5, carbohydrate_g: 5.8, dietaryFiber_g: 3.1,
      ash_g: 2.2,
    },
    minerals: {
      calcium_mg: 210, phosphorus_mg: 62, magnesium_mg: 22,
      potassium_mg: 448, sodium_mg: 18, sulfur_mg: 145,
      iron_mg: 2.1, zinc_mg: 0.48, copper_mg: 0.09,
      manganese_mg: 0.38, selenium_mcg: 1.0, boron_mcg: 220,
      molybdenum_mcg: 12,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 214, betaCarotene_mcg: 2868,
      vitaminB1_thiamine_mg: 0.10, vitaminB2_riboflavin_mg: 0.15,
      vitaminB3_niacin_mg: 1.18, vitaminB6_pyridoxine_mg: 0.27,
      vitaminB9_folate_mcg: 129, vitaminC_ascorbicAcid_mg: 98.3,
      vitaminE_tocopherol_mg: 1.7, vitaminK_mcg: 390,
    },
    aminoAcids: {
      essential: {
        histidine: 2.1, isoleucine: 3.6, leucine: 5.5,
        lysine: 5.2, methionine: 1.1, phenylalanine: 3.5,
        threonine: 3.2, tryptophan: 0.8, valine: 4.2,
      },
      semiEssential: {
        arginine: 3.8, cysteine: 0.9, glycine: 3.4, proline: 2.9, tyrosine: 2.1,
      },
      nonEssential: {
        alanine: 3.8, asparagine: 5.2, aspartate: 10.8,
        glutamate: 12.6, glutamine: 2.4, serine: 3.2,
      },
      totalAminoAcidsMgPer100g: 2820,
      limitingAmino: "Methionine + Cysteine",
      aminoAcidScore: 70,
    },
    fattyAcids: {
      totalSaturatedG: 0.06, totalMonounsaturatedG: 0.07, totalPolyunsaturatedG: 0.24,
      cholesterol_mg: 0,
      alphaLinolenic_C18_3n3: 0.18, linoleic_C18_2n6: 0.06,
      omega3ToOmega6Ratio: "3:1",
    },
    phenolics: {
      totalPhenolicsMgGAE: 480, totalFlavonoidsMg: 195,
      quercetin_mg: 34, kaempferol_mg: 28, lutein_mcg: 7840,
      zeaxanthin_mcg: 1120,
      note: "Glucosinolates (sinigrin, gluconapin) degrade to isothiocyanates during chopping and cooking.",
    },
    antinutrients: {
      oxalates_mg: 142, goitrogens_mg: 28,
      processingReduction: {
        method: "Brief blanching (3 min) reduces oxalates 40%, preserves 75% vitamin C",
        tanninsReductionPct: 30,
      },
    },
    glycemicIndex: 15,
    functionalProperties: [
      "Outstanding vitamin K1 (390 mcg) — bone mineralization and coagulation",
      "Dense lutein + zeaxanthin for macular protection",
      "High Ca:P ratio favors calcium retention",
      "Glucosinolate → ITC cancer chemopreventive",
    ],
    bioavailabilityNotes: "Calcium in Brassica greens is highly bioavailable (fractional absorption ~60% vs ~32% for milk) due to low oxalate/phytate ratio. Cooking in spiced oil (niter kibbeh or ayib) with fat-soluble carotenoid co-absorption.",
    sourceReferences: ["USDA FoodData Central #11234", "FAO East Africa FCT", "Jonnalagadda et al. (2017) Nutr Today"],
    dataConfidence: "high",
  },

  // ── 2. Ethiopian Kale (Yeabesha Gomen) ───────────────────────
  {
    uid: "veg-yeabesha-gomen",
    nameEn: "Yeabesha Gomen (Ethiopian Kale)",
    nameAmharic: "ያበሻ ጎመን",
    scientificName: "Brassica oleracea var. acephala",
    category: "Leafy Vegetable",
    partUsed: "Leaves",
    processingState: "raw",
    basis: "per 100 g raw leaves",
    proximate: {
      energyKcal: 35, moisture_g: 87.7, protein_g: 2.92,
      fat_g: 0.7, carbohydrate_g: 6.8, dietaryFiber_g: 3.6,
      ash_g: 1.88,
    },
    minerals: {
      calcium_mg: 254, phosphorus_mg: 55, magnesium_mg: 34,
      potassium_mg: 491, sodium_mg: 38, sulfur_mg: 154,
      iron_mg: 1.7, zinc_mg: 0.56, copper_mg: 0.29,
      manganese_mg: 0.92, selenium_mcg: 0.9, boron_mcg: 198,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 241, betaCarotene_mcg: 2895,
      vitaminB1_thiamine_mg: 0.11, vitaminB2_riboflavin_mg: 0.13,
      vitaminB3_niacin_mg: 1.0, vitaminB6_pyridoxine_mg: 0.27,
      vitaminB9_folate_mcg: 141, vitaminC_ascorbicAcid_mg: 120.0,
      vitaminE_tocopherol_mg: 1.54, vitaminK_mcg: 817,
    },
    aminoAcids: {
      essential: {
        histidine: 1.9, isoleucine: 3.9, leucine: 5.2,
        lysine: 4.8, methionine: 0.9, phenylalanine: 3.4,
        threonine: 3.0, tryptophan: 0.7, valine: 4.0,
      },
      semiEssential: {
        arginine: 3.4, cysteine: 0.8, glycine: 3.0, proline: 2.6, tyrosine: 2.0,
      },
      nonEssential: {
        alanine: 3.4, aspartate: 10.2, glutamate: 11.8,
        glutamine: 2.1, serine: 2.9, asparagine: 4.2,
      },
      totalAminoAcidsMgPer100g: 2540,
      limitingAmino: "Methionine",
      aminoAcidScore: 68,
    },
    fattyAcids: {
      totalSaturatedG: 0.09, totalMonounsaturatedG: 0.05, totalPolyunsaturatedG: 0.34,
      cholesterol_mg: 0,
      alphaLinolenic_C18_3n3: 0.24, linoleic_C18_2n6: 0.09,
      omega3ToOmega6Ratio: "2.7:1",
    },
    phenolics: {
      totalPhenolicsMgGAE: 596, totalFlavonoidsMg: 248,
      quercetin_mg: 22, kaempferol_mg: 18, lutein_mcg: 18246,
      zeaxanthin_mcg: 1020,
    },
    antinutrients: { oxalates_mg: 128, goitrogens_mg: 32 },
    glycemicIndex: 15,
    functionalProperties: [
      "Highest vitamin K of common vegetables (817 mcg)",
      "Exceptional lutein density (18 mg) for macular health",
      "Very favorable omega-3/omega-6 ratio among plant foods",
    ],
    bioavailabilityNotes: "Traditional wot preparations with oil dramatically increase fat-soluble vitamin A and carotenoid absorption from kale.",
    sourceReferences: ["USDA FoodData Central #11233", "FAO East Africa FCT"],
    dataConfidence: "high",
  },

  // ── 3. Sweet Potato Leaves (Ye'akuala Gomen) ─────────────────
  {
    uid: "veg-sweetpotato-leaf",
    nameEn: "Sweet Potato Leaves",
    nameAmharic: "የአቃላ ቅጠል",
    scientificName: "Ipomoea batatas",
    category: "Leafy Vegetable",
    partUsed: "Young leaves and petioles",
    processingState: "raw",
    basis: "per 100 g raw leaves",
    proximate: {
      energyKcal: 42, moisture_g: 86.1, protein_g: 3.0,
      fat_g: 0.5, carbohydrate_g: 8.5, dietaryFiber_g: 3.0, ash_g: 1.9,
    },
    minerals: {
      calcium_mg: 78, phosphorus_mg: 65, magnesium_mg: 70,
      potassium_mg: 518, sodium_mg: 9, sulfur_mg: 78,
      iron_mg: 0.97, zinc_mg: 0.32, copper_mg: 0.08,
      manganese_mg: 0.38, selenium_mcg: 0.9, boron_mcg: 165,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 475, betaCarotene_mcg: 5700,
      vitaminB2_riboflavin_mg: 0.38, vitaminB3_niacin_mg: 1.8,
      vitaminB6_pyridoxine_mg: 0.32, vitaminB9_folate_mcg: 81,
      vitaminC_ascorbicAcid_mg: 11.0, vitaminE_tocopherol_mg: 2.22,
      vitaminK_mcg: 108,
    },
    aminoAcids: {
      essential: {
        isoleucine: 3.8, leucine: 5.8, lysine: 5.0,
        methionine: 1.2, phenylalanine: 4.0, threonine: 3.2,
        tryptophan: 1.0, valine: 4.5, histidine: 2.0,
      },
      semiEssential: { arginine: 4.0, glycine: 3.6, proline: 2.8, tyrosine: 2.2, cysteine: 0.9 },
      nonEssential: {
        alanine: 4.2, aspartate: 10.2, glutamate: 12.4,
        glutamine: 2.2, serine: 3.0, asparagine: 4.4,
      },
      totalAminoAcidsMgPer100g: 2650,
      aminoAcidScore: 72,
    },
    fattyAcids: {
      totalSaturatedG: 0.10, totalMonounsaturatedG: 0.01, totalPolyunsaturatedG: 0.26,
      cholesterol_mg: 0,
      alphaLinolenic_C18_3n3: 0.19, linoleic_C18_2n6: 0.07,
      omega3ToOmega6Ratio: "2.7:1",
    },
    phenolics: { totalPhenolicsMgGAE: 360, totalFlavonoidsMg: 148, lutein_mcg: 10380 },
    antinutrients: { oxalates_mg: 82, phytate_mg: 45 },
    glycemicIndex: 22,
    functionalProperties: [
      "Very high beta-carotene — critical for VAD prevention in sub-Saharan Africa",
      "Significant vitamin E for cellular antioxidant defense",
    ],
    sourceReferences: ["USDA FoodData Central #11507", "FAO East Africa FCT"],
    dataConfidence: "medium",
  },

  // ── 4. Spinach (Shbhti) ───────────────────────────────────────
  {
    uid: "veg-spinach",
    nameEn: "Spinach",
    nameAmharic: "ሽብህቲ",
    scientificName: "Spinacia oleracea",
    category: "Leafy Vegetable",
    partUsed: "Leaves",
    processingState: "raw",
    basis: "per 100 g raw leaves",
    proximate: {
      energyKcal: 23, moisture_g: 91.4, protein_g: 2.86,
      fat_g: 0.39, carbohydrate_g: 3.63, dietaryFiber_g: 2.2, ash_g: 1.72,
    },
    minerals: {
      calcium_mg: 99, phosphorus_mg: 49, magnesium_mg: 79,
      potassium_mg: 558, sodium_mg: 79, sulfur_mg: 64,
      iron_mg: 2.71, zinc_mg: 0.53, copper_mg: 0.13,
      manganese_mg: 0.897, selenium_mcg: 1.0, boron_mcg: 184,
      molybdenum_mcg: 11,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 469, betaCarotene_mcg: 5626,
      vitaminB1_thiamine_mg: 0.078, vitaminB2_riboflavin_mg: 0.189,
      vitaminB3_niacin_mg: 0.724, vitaminB6_pyridoxine_mg: 0.195,
      vitaminB9_folate_mcg: 194, vitaminC_ascorbicAcid_mg: 28.1,
      vitaminE_tocopherol_mg: 2.03, vitaminK_mcg: 482.9,
    },
    aminoAcids: {
      essential: {
        histidine: 2.5, isoleucine: 3.9, leucine: 5.6,
        lysine: 5.6, methionine: 1.3, phenylalanine: 3.9,
        threonine: 3.3, tryptophan: 1.0, valine: 4.0,
      },
      semiEssential: { arginine: 4.6, cysteine: 0.7, glycine: 3.9, proline: 2.9, tyrosine: 2.0 },
      nonEssential: {
        alanine: 4.5, asparagine: 5.0, aspartate: 10.8,
        glutamate: 14.1, glutamine: 3.8, serine: 3.1,
      },
      totalAminoAcidsMgPer100g: 2420,
      limitingAmino: "Methionine (low but adequate in mixed diet)",
      aminoAcidScore: 74,
    },
    fattyAcids: {
      totalSaturatedG: 0.063, totalMonounsaturatedG: 0.011, totalPolyunsaturatedG: 0.165,
      cholesterol_mg: 0,
      alphaLinolenic_C18_3n3: 0.138, linoleic_C18_2n6: 0.027,
      omega3ToOmega6Ratio: "5:1",
    },
    phenolics: {
      totalPhenolicsMgGAE: 380, quercetin_mg: 3.5, kaempferol_mg: 11.5,
      lutein_mcg: 12198, zeaxanthin_mcg: 2753,
    },
    antinutrients: {
      oxalates_mg: 750, phytate_mg: 80,
      processingReduction: {
        method: "Blanching (2 min boiling) reduces oxalates by 50–87%",
        phytateReductionPct: 40,
      },
    },
    glycemicIndex: 15,
    functionalProperties: [
      "Dense folate for prenatal health (194 mcg/100g)",
      "Outstanding lutein (12 mg) — highest of common vegetables",
      "High vitamin K (483 mcg) for bone and coagulation",
      "Important caveat: high oxalates inhibit calcium and iron absorption",
    ],
    bioavailabilityNotes: "Despite high iron content (2.71 mg), iron bioavailability is limited by oxalates (750 mg). Cooking reduces oxalates 50–87%, significantly improving mineral bioavailability. Pairing with vitamin C foods enhances non-heme iron absorption.",
    sourceReferences: ["USDA FoodData Central #11457", "Massey (2003) J Nutr"],
    dataConfidence: "high",
  },

  // ── 5. Tomato (Timatim) ───────────────────────────────────────
  {
    uid: "veg-tomato",
    nameEn: "Tomato",
    nameAmharic: "ቲማቲም",
    scientificName: "Solanum lycopersicum",
    category: "Fruit Vegetable",
    partUsed: "Whole fruit (fresh)",
    processingState: "raw",
    basis: "per 100 g raw tomato",
    proximate: {
      energyKcal: 18, moisture_g: 94.5, protein_g: 0.88,
      fat_g: 0.20, carbohydrate_g: 3.89, dietaryFiber_g: 1.2, ash_g: 0.53,
    },
    minerals: {
      calcium_mg: 10, phosphorus_mg: 24, magnesium_mg: 11,
      potassium_mg: 237, sodium_mg: 5, sulfur_mg: 18,
      iron_mg: 0.27, zinc_mg: 0.17, copper_mg: 0.059,
      manganese_mg: 0.114, selenium_mcg: 0.0, molybdenum_mcg: 4, boron_mcg: 128,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 42, betaCarotene_mcg: 449,
      vitaminB1_thiamine_mg: 0.037, vitaminB2_riboflavin_mg: 0.019,
      vitaminB3_niacin_mg: 0.594, vitaminB6_pyridoxine_mg: 0.080,
      vitaminB9_folate_mcg: 15, vitaminC_ascorbicAcid_mg: 13.7,
      vitaminE_tocopherol_mg: 0.54, vitaminK_mcg: 7.9,
    },
    aminoAcids: {
      essential: {
        histidine: 1.5, isoleucine: 1.5, leucine: 2.5,
        lysine: 2.7, methionine: 0.6, phenylalanine: 1.7,
        threonine: 2.0, tryptophan: 0.5, valine: 2.0,
      },
      semiEssential: { arginine: 2.1, glycine: 2.1, proline: 1.9, tyrosine: 1.3, cysteine: 0.5 },
      nonEssential: {
        alanine: 2.3, aspartate: 11.9, glutamate: 33.0,
        glutamine: 5.0, serine: 1.9, asparagine: 3.0,
      },
      totalAminoAcidsMgPer100g: 760,
      aminoAcidScore: 48,
    },
    fattyAcids: {
      totalSaturatedG: 0.028, totalMonounsaturatedG: 0.031, totalPolyunsaturatedG: 0.083,
      cholesterol_mg: 0,
      linoleic_C18_2n6: 0.079, alphaLinolenic_C18_3n3: 0.004,
    },
    phenolics: {
      totalPhenolicsMgGAE: 188, totalFlavonoidsMg: 42,
      quercetin_mg: 3.0, lutein_mcg: 123, zeaxanthin_mcg: 10,
      note: "Lycopene is the dominant bioactive: 2573 mcg/100g raw; cooking with oil increases bioavailability 3–5×.",
    },
    antinutrients: { solanine_mg: 0.4 },
    glycemicIndex: 15,
    functionalProperties: [
      "Lycopene (2573 mcg): prostate cancer prevention, cardiovascular protection",
      "Cooking in fat increases lycopene bioavailability 3–5× (berbere sauce)",
      "Very low caloric density for satiety-based weight management",
    ],
    bioavailabilityNotes: "Lycopene is a fat-soluble carotenoid; traditional Ethiopian berbere wot cooking with oil dramatically enhances bioavailability. Lycopene from tomato paste is 2.5× more bioavailable than raw.",
    sourceReferences: ["USDA FoodData Central #11529", "Erdman et al. (2009) J Nutr"],
    dataConfidence: "high",
  },

  // ── 6. Onion (Shinkurt) ──────────────────────────────────────
  {
    uid: "veg-onion",
    nameEn: "Onion",
    nameAmharic: "ሽንኩርት",
    scientificName: "Allium cepa",
    category: "Bulb Vegetable",
    partUsed: "Bulb (edible portion)",
    processingState: "raw",
    basis: "per 100 g raw onion",
    proximate: {
      energyKcal: 40, moisture_g: 89.1, protein_g: 1.10,
      fat_g: 0.10, carbohydrate_g: 9.34, dietaryFiber_g: 1.7, ash_g: 0.36, sugars_g: 4.24,
    },
    minerals: {
      calcium_mg: 23, phosphorus_mg: 29, magnesium_mg: 10,
      potassium_mg: 146, sodium_mg: 4, sulfur_mg: 102,
      iron_mg: 0.21, zinc_mg: 0.17, copper_mg: 0.039,
      manganese_mg: 0.129, selenium_mcg: 0.5, boron_mcg: 244, molybdenum_mcg: 4,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.046, vitaminB2_riboflavin_mg: 0.027,
      vitaminB3_niacin_mg: 0.116, vitaminB6_pyridoxine_mg: 0.12,
      vitaminB9_folate_mcg: 19, vitaminC_ascorbicAcid_mg: 7.4,
      vitaminE_tocopherol_mg: 0.02, vitaminK_mcg: 0.4,
    },
    aminoAcids: {
      essential: {
        histidine: 1.2, isoleucine: 1.6, leucine: 2.4,
        lysine: 2.3, methionine: 0.7, phenylalanine: 1.9,
        threonine: 1.5, tryptophan: 0.6, valine: 2.5,
      },
      semiEssential: { arginine: 2.0, cysteine: 0.8, glycine: 2.2, proline: 2.0, tyrosine: 1.0 },
      nonEssential: {
        alanine: 2.5, aspartate: 6.8, glutamate: 22.5,
        glutamine: 8.0, serine: 2.0, asparagine: 3.2,
      },
      totalAminoAcidsMgPer100g: 888,
      aminoAcidScore: 40,
    },
    fattyAcids: {
      totalSaturatedG: 0.042, totalMonounsaturatedG: 0.013, totalPolyunsaturatedG: 0.017,
      cholesterol_mg: 0,
    },
    phenolics: {
      totalPhenolicsMgGAE: 335, quercetin_mg: 39.2, kaempferol_mg: 4.6,
      note: "Quercetin in onion is the gold standard dietary quercetin source; bioavailability 4× higher than apple quercetin.",
    },
    antinutrients: { fructans: true },
    glycemicIndex: 10,
    functionalProperties: [
      "Dense quercetin: anti-inflammatory, anti-platelet aggregation, cardioprotective",
      "Organosulfur compounds (allicin precursors): antimicrobial, antithrombotic",
      "High boron (244 mcg) for bone health and testosterone metabolism",
      "Prebiotic inulin and fructo-oligosaccharides for gut microbiome support",
    ],
    bioavailabilityNotes: "Quercetin in onion is glycosylated (quercetin-4'-glucoside), which is highly bioavailable in the small intestine. Onion quercetin absorption (52%) far exceeds that of pure quercetin aglycone.",
    sourceReferences: ["USDA FoodData Central #11282", "Manach et al. (2004) Am J Clin Nutr"],
    dataConfidence: "high",
  },

  // ── 7. Garlic (Nech Shinkurt) ────────────────────────────────
  {
    uid: "veg-garlic",
    nameEn: "Garlic",
    nameAmharic: "ነጭ ሽንኩርት",
    scientificName: "Allium sativum",
    category: "Bulb Vegetable",
    partUsed: "Cloves (raw)",
    processingState: "raw",
    basis: "per 100 g raw garlic",
    proximate: {
      energyKcal: 149, moisture_g: 58.6, protein_g: 6.36,
      fat_g: 0.5, carbohydrate_g: 33.06, dietaryFiber_g: 2.1, ash_g: 1.5, sugars_g: 1.0,
    },
    minerals: {
      calcium_mg: 181, phosphorus_mg: 153, magnesium_mg: 25,
      potassium_mg: 401, sodium_mg: 17, sulfur_mg: 356,
      iron_mg: 1.7, zinc_mg: 1.16, copper_mg: 0.299,
      manganese_mg: 1.672, selenium_mcg: 14.2, molybdenum_mcg: 18, boron_mcg: 135,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.2, vitaminB2_riboflavin_mg: 0.11,
      vitaminB3_niacin_mg: 0.7, vitaminB6_pyridoxine_mg: 1.235,
      vitaminB9_folate_mcg: 3, vitaminC_ascorbicAcid_mg: 31.2,
      vitaminE_tocopherol_mg: 0.08, vitaminK_mcg: 1.7,
    },
    aminoAcids: {
      essential: {
        histidine: 1.1, isoleucine: 2.2, leucine: 3.3,
        lysine: 2.7, methionine: 0.8, phenylalanine: 1.8,
        threonine: 1.6, tryptophan: 0.6, valine: 2.9,
      },
      semiEssential: { arginine: 6.4, cysteine: 2.1, glycine: 2.0, proline: 1.6, tyrosine: 1.0 },
      nonEssential: {
        alanine: 2.3, aspartate: 4.3, glutamate: 9.8,
        glutamine: 4.2, serine: 2.0, asparagine: 2.8,
      },
      totalAminoAcidsMgPer100g: 5640,
      aminoAcidScore: 58,
    },
    fattyAcids: {
      totalSaturatedG: 0.089, totalMonounsaturatedG: 0.011, totalPolyunsaturatedG: 0.249,
      cholesterol_mg: 0,
      linoleic_C18_2n6: 0.231, alphaLinolenic_C18_3n3: 0.018,
    },
    phenolics: {
      totalPhenolicsMgGAE: 550, quercetin_mg: 1.7, kaempferol_mg: 0.8,
      note: "Primary bioactives: allicin (diallyl thiosulfinate) generated from alliin by alliinase on crushing. S-allylcysteine (SAC) in aged garlic extract.",
    },
    glycemicIndex: 30,
    functionalProperties: [
      "Highest sulfur content of common vegetables (356 mg) — garlic organosulfurs",
      "Allicin: broad-spectrum antimicrobial, anti-Helicobacter pylori",
      "LDL cholesterol reduction (meta-analysis: −10 mg/dL)",
      "ACE-inhibitory peptides for blood pressure regulation",
      "Prebiotics (fructans) for Bifidobacterium enrichment",
    ],
    bioavailabilityNotes: "Allicin is volatile and heat-labile; crush garlic 10 min before cooking to allow alliinase reaction. S-allylcysteine (SAC) in aged garlic persists through heat and absorption.",
    sourceReferences: ["USDA FoodData Central #11215", "Ried et al. (2016) J Nutr"],
    dataConfidence: "high",
  },

  // ── 8. Carrot (Karrote) ───────────────────────────────────────
  {
    uid: "veg-carrot",
    nameEn: "Carrot",
    nameAmharic: "ካሮት",
    scientificName: "Daucus carota",
    category: "Root Vegetable",
    partUsed: "Root (raw)",
    processingState: "raw",
    basis: "per 100 g raw carrot",
    proximate: {
      energyKcal: 41, moisture_g: 88.3, protein_g: 0.93,
      fat_g: 0.24, carbohydrate_g: 9.58, dietaryFiber_g: 2.8, ash_g: 0.97, sugars_g: 4.74,
    },
    minerals: {
      calcium_mg: 33, phosphorus_mg: 35, magnesium_mg: 12,
      potassium_mg: 320, sodium_mg: 69, sulfur_mg: 22,
      iron_mg: 0.30, zinc_mg: 0.24, copper_mg: 0.045,
      manganese_mg: 0.143, selenium_mcg: 0.1, boron_mcg: 96,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 835, betaCarotene_mcg: 8285,
      vitaminB1_thiamine_mg: 0.066, vitaminB2_riboflavin_mg: 0.058,
      vitaminB3_niacin_mg: 0.983, vitaminB6_pyridoxine_mg: 0.138,
      vitaminB9_folate_mcg: 19, vitaminC_ascorbicAcid_mg: 5.9,
      vitaminE_tocopherol_mg: 0.66, vitaminK_mcg: 13.2,
    },
    aminoAcids: {
      essential: {
        histidine: 1.4, isoleucine: 1.8, leucine: 2.8,
        lysine: 2.5, methionine: 0.7, phenylalanine: 2.0,
        threonine: 2.1, tryptophan: 0.6, valine: 2.2,
      },
      semiEssential: { arginine: 2.6, glycine: 2.2, proline: 1.9, tyrosine: 1.3, cysteine: 0.5 },
      nonEssential: {
        alanine: 2.7, aspartate: 10.4, glutamate: 13.8,
        glutamine: 3.8, serine: 2.0, asparagine: 4.5,
      },
      totalAminoAcidsMgPer100g: 802,
      aminoAcidScore: 48,
    },
    fattyAcids: {
      totalSaturatedG: 0.037, totalMonounsaturatedG: 0.014, totalPolyunsaturatedG: 0.117,
      cholesterol_mg: 0,
      linoleic_C18_2n6: 0.109, alphaLinolenic_C18_3n3: 0.008,
    },
    phenolics: {
      totalPhenolicsMgGAE: 188, chlorogenicAcid_mg: 18, lutein_mcg: 256, zeaxanthin_mcg: 0,
      note: "Alpha-carotene (3477 mcg/100g) and beta-carotene (8285 mcg) are primary provitamin A carotenoids.",
    },
    antinutrients: { oxalates_mg: 15 },
    glycemicIndex: 39,
    functionalProperties: [
      "One of the richest dietary sources of provitamin A (beta + alpha carotene)",
      "Cooking + fat significantly increases carotenoid bioavailability (2–6×)",
      "Soluble pectin fiber: prebiotic + LDL-lowering",
    ],
    bioavailabilityNotes: "Beta-carotene bioavailability from raw carrots is ~3–4%; cooking and chopping rupture cell walls, increasing to 15–20%. Adding fat during cooking further boosts to 30%+.",
    sourceReferences: ["USDA FoodData Central #11124", "Brouwer et al. (2000) J Nutr"],
    dataConfidence: "high",
  },

  // ── 9. Cabbage (Tikil Gomen) ──────────────────────────────────
  {
    uid: "veg-cabbage",
    nameEn: "Cabbage",
    nameAmharic: "ቲቅል ጎመን",
    scientificName: "Brassica oleracea var. capitata",
    category: "Brassica Vegetable",
    partUsed: "Head (raw)",
    processingState: "raw",
    basis: "per 100 g raw cabbage",
    proximate: {
      energyKcal: 25, moisture_g: 92.2, protein_g: 1.28,
      fat_g: 0.1, carbohydrate_g: 5.8, dietaryFiber_g: 2.5, ash_g: 0.64,
    },
    minerals: {
      calcium_mg: 40, phosphorus_mg: 26, magnesium_mg: 12,
      potassium_mg: 170, sodium_mg: 18, sulfur_mg: 110,
      iron_mg: 0.47, zinc_mg: 0.18, copper_mg: 0.019,
      manganese_mg: 0.16, selenium_mcg: 0.3, boron_mcg: 108,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.061, vitaminB2_riboflavin_mg: 0.040,
      vitaminB3_niacin_mg: 0.234, vitaminB6_pyridoxine_mg: 0.124,
      vitaminB9_folate_mcg: 43, vitaminC_ascorbicAcid_mg: 36.6,
      vitaminE_tocopherol_mg: 0.15, vitaminK_mcg: 76.0,
    },
    aminoAcids: {
      essential: {
        histidine: 1.5, isoleucine: 2.5, leucine: 3.0,
        lysine: 3.1, methionine: 0.7, phenylalanine: 2.0,
        threonine: 2.0, tryptophan: 0.6, valine: 2.5,
      },
      semiEssential: { arginine: 2.9, cysteine: 0.7, glycine: 2.4, proline: 2.0, tyrosine: 1.3 },
      nonEssential: {
        alanine: 2.7, aspartate: 8.3, glutamate: 15.4,
        glutamine: 5.0, serine: 2.1, asparagine: 4.2,
      },
      totalAminoAcidsMgPer100g: 1102,
      aminoAcidScore: 62,
    },
    fattyAcids: {
      totalSaturatedG: 0.034, totalMonounsaturatedG: 0.017, totalPolyunsaturatedG: 0.017,
      cholesterol_mg: 0,
      alphaLinolenic_C18_3n3: 0.011, linoleic_C18_2n6: 0.006,
    },
    phenolics: {
      totalPhenolicsMgGAE: 255, quercetin_mg: 1.3, kaempferol_mg: 6.4,
      note: "Glucosinolates (sinigrin, glucobrassicin) generate anti-cancer isothiocyanates on cutting.",
    },
    antinutrients: { goitrogens_mg: 25, oxalates_mg: 28 },
    glycemicIndex: 15,
    functionalProperties: [
      "Dense vitamin K for bone mineralization (76 mcg)",
      "Glucosinolates: phase II enzyme induction, cancer risk reduction",
      "Folate for DNA methylation and red blood cell formation",
    ],
    sourceReferences: ["USDA FoodData Central #11109", "FAO East Africa FCT"],
    dataConfidence: "high",
  },

  // ── 10. Ethiopian Green Pepper (Akuri Berbere) ────────────────
  {
    uid: "veg-green-pepper",
    nameEn: "Green Pepper",
    nameAmharic: "ቀይ ቃሪያ (አረንጓዴ)",
    scientificName: "Capsicum annuum",
    category: "Fruit Vegetable",
    partUsed: "Pod (fresh)",
    processingState: "raw",
    basis: "per 100 g raw green bell pepper",
    proximate: {
      energyKcal: 20, moisture_g: 93.9, protein_g: 0.86,
      fat_g: 0.17, carbohydrate_g: 4.64, dietaryFiber_g: 1.7, ash_g: 0.43,
    },
    minerals: {
      calcium_mg: 10, phosphorus_mg: 20, magnesium_mg: 10,
      potassium_mg: 175, sodium_mg: 3, sulfur_mg: 20,
      iron_mg: 0.34, zinc_mg: 0.13, copper_mg: 0.066,
      manganese_mg: 0.122, selenium_mcg: 0.1, boron_mcg: 78,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 18, betaCarotene_mcg: 208,
      vitaminB1_thiamine_mg: 0.057, vitaminB2_riboflavin_mg: 0.028,
      vitaminB3_niacin_mg: 0.48, vitaminB6_pyridoxine_mg: 0.224,
      vitaminB9_folate_mcg: 10, vitaminC_ascorbicAcid_mg: 80.4,
      vitaminE_tocopherol_mg: 0.37, vitaminK_mcg: 7.4,
    },
    aminoAcids: {
      essential: {
        isoleucine: 1.5, leucine: 2.4, lysine: 2.5,
        methionine: 0.4, phenylalanine: 1.5, threonine: 1.5,
        tryptophan: 0.4, valine: 1.8, histidine: 0.8,
      },
      semiEssential: {
        glycine: 1.6,
      },
      nonEssential: {
        glutamate: 10.4, aspartate: 8.8, alanine: 2.0,
        serine: 1.4,
      },
      totalAminoAcidsMgPer100g: 720,
    },
    fattyAcids: {
      totalSaturatedG: 0.058, totalMonounsaturatedG: 0.008, totalPolyunsaturatedG: 0.084,
      cholesterol_mg: 0,
      linoleic_C18_2n6: 0.066, alphaLinolenic_C18_3n3: 0.018,
    },
    phenolics: {
      totalPhenolicsMgGAE: 185, quercetin_mg: 3.2, luteolin_mg: 2.8,
    },
    glycemicIndex: 15,
    functionalProperties: [
      "Very high vitamin C (80 mg) — major non-heme iron absorption enhancer",
      "Capsanthin and capsorubin carotenoids (in red/orange peppers)",
      "Very low calorie density (20 kcal/100g) for weight management",
    ],
    sourceReferences: ["USDA FoodData Central #11333"],
    dataConfidence: "high",
  },
];
