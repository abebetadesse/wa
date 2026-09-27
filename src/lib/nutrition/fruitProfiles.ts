/**
 * Fruit Nutritional Profiles — Ethiopian & Tropical Fruits
 * 25 items. Per 100 g raw edible portion unless stated otherwise.
 * Sources: USDA FoodData Central, FAO/INFOODS AFDB, FAO East Africa FCT,
 * Rufino et al. (2010) Food Chem., EFCT 2025 Ethiopian Fruit Composition Data.
 */

import type { DeepIngredientProfile } from "./deepNutrientProfiles";

export const FRUIT_PROFILES: DeepIngredientProfile[] = [
  // ── 1. Avocado (Avokado) ─────────────────────────────────────
  {
    uid: "frt-avocado",
    nameEn: "Avocado",
    nameAmharic: "አቮካዶ",
    scientificName: "Persea americana",
    category: "Tropical Fruit",
    partUsed: "Flesh (pulp)",
    processingState: "raw",
    basis: "per 100 g raw pulp",
    proximate: {
      energyKcal: 160, moisture_g: 73.2, protein_g: 2.0,
      fat_g: 14.66, carbohydrate_g: 8.53, dietaryFiber_g: 6.7, ash_g: 1.61, sugars_g: 0.66,
    },
    minerals: {
      calcium_mg: 12, phosphorus_mg: 52, magnesium_mg: 29,
      potassium_mg: 485, sodium_mg: 7, sulfur_mg: 28,
      iron_mg: 0.55, zinc_mg: 0.64, copper_mg: 0.19,
      manganese_mg: 0.142, selenium_mcg: 0.4, boron_mcg: 206, molybdenum_mcg: 3,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 7, betaCarotene_mcg: 62,
      vitaminB1_thiamine_mg: 0.067, vitaminB2_riboflavin_mg: 0.13,
      vitaminB3_niacin_mg: 1.738, vitaminB5_pantothenicAcid_mg: 1.389,
      vitaminB6_pyridoxine_mg: 0.257, vitaminB9_folate_mcg: 81,
      vitaminC_ascorbicAcid_mg: 10.0, vitaminE_tocopherol_mg: 2.07,
      vitaminK_mcg: 21.0,
    },
    aminoAcids: {
      essential: {
        histidine: 2.2, isoleucine: 2.9, leucine: 4.9,
        lysine: 4.3, methionine: 1.2, phenylalanine: 3.1,
        threonine: 2.5, tryptophan: 0.9, valine: 3.6,
      },
      semiEssential: { arginine: 3.7, cysteine: 0.7, glycine: 3.5, proline: 3.1, tyrosine: 1.9 },
      nonEssential: {
        alanine: 3.6, asparagine: 3.8, aspartate: 10.2,
        glutamate: 12.1, glutamine: 2.8, serine: 2.8,
      },
      totalAminoAcidsMgPer100g: 1820,
      limitingAmino: "Methionine (low but adequate in mixed diet)",
      aminoAcidScore: 62,
    },
    fattyAcids: {
      totalSaturatedG: 2.13, totalMonounsaturatedG: 9.80, totalPolyunsaturatedG: 1.82,
      cholesterol_mg: 0,
      palmitic_C16_0: 2.07, stearic_C18_0: 0.06,
      oleic_C18_1: 9.80,
      linoleic_C18_2n6: 1.69, alphaLinolenic_C18_3n3: 0.13,
      omega3ToOmega6Ratio: "1:13",
    },
    phenolics: {
      totalPhenolicsMgGAE: 198, lutein_mcg: 271, zeaxanthin_mcg: 0,
      note: "Persenones A and B: unique avocado bioactives inhibiting superoxide/nitric oxide generation in macrophages.",
    },
    glycemicIndex: 15,
    functionalProperties: [
      "Highest MUFA (oleic acid, 9.8g) of common fruits — similar to olive oil profile",
      "Outstanding pantothenic acid (B5) for adrenal and fatty acid metabolism",
      "Dense potassium (485 mg) and folate (81 mcg)",
      "Fat co-ingestion with vegetables massively increases carotenoid bioavailability (3–5×)",
    ],
    bioavailabilityNotes: "Avocado acts as a nutrient booster: adding half an avocado to a salad increases lycopene and beta-carotene absorption 4× and 2.6×, respectively (Unlu et al., 2005). High MUFA fat content aids fat-soluble vitamin absorption.",
    sourceReferences: ["USDA FoodData Central #171705", "Dreher & Davenport (2013) Crit Rev Food Sci Nutr"],
    dataConfidence: "high",
  },

  // ── 2. Mango (Mango) ─────────────────────────────────────────
  {
    uid: "frt-mango",
    nameEn: "Mango",
    nameAmharic: "ማንጎ",
    scientificName: "Mangifera indica",
    category: "Tropical Fruit",
    partUsed: "Flesh (pulp)",
    processingState: "raw",
    basis: "per 100 g raw flesh",
    proximate: {
      energyKcal: 60, moisture_g: 83.5, protein_g: 0.82,
      fat_g: 0.38, carbohydrate_g: 14.98, dietaryFiber_g: 1.6, ash_g: 0.36, sugars_g: 13.66,
    },
    minerals: {
      calcium_mg: 11, phosphorus_mg: 14, magnesium_mg: 10,
      potassium_mg: 168, sodium_mg: 1, sulfur_mg: 12,
      iron_mg: 0.16, zinc_mg: 0.09, copper_mg: 0.111,
      manganese_mg: 0.063, selenium_mcg: 0.6, boron_mcg: 68,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 54, betaCarotene_mcg: 640,
      vitaminB1_thiamine_mg: 0.028, vitaminB2_riboflavin_mg: 0.038,
      vitaminB3_niacin_mg: 0.669, vitaminB5_pantothenicAcid_mg: 0.197,
      vitaminB6_pyridoxine_mg: 0.119, vitaminB9_folate_mcg: 43,
      vitaminC_ascorbicAcid_mg: 36.4, vitaminE_tocopherol_mg: 0.9,
      vitaminK_mcg: 4.2,
    },
    aminoAcids: {
      essential: {
        histidine: 1.2, isoleucine: 1.8, leucine: 3.1,
        lysine: 3.0, methionine: 0.6, phenylalanine: 1.8,
        threonine: 1.7, tryptophan: 0.6, valine: 2.4,
      },
      semiEssential: { arginine: 1.5, glycine: 2.0, proline: 1.8, tyrosine: 1.0, cysteine: 0.4 },
      nonEssential: {
        alanine: 2.4, aspartate: 5.4, glutamate: 6.4,
        glutamine: 1.8, serine: 1.6, asparagine: 3.0,
      },
      totalAminoAcidsMgPer100g: 722,
      aminoAcidScore: 45,
    },
    fattyAcids: {
      totalSaturatedG: 0.092, totalMonounsaturatedG: 0.14, totalPolyunsaturatedG: 0.071,
      cholesterol_mg: 0,
      oleic_C18_1: 0.135, linoleic_C18_2n6: 0.071,
    },
    phenolics: {
      totalPhenolicsMgGAE: 312, totalFlavonoidsMg: 124,
      quercetin_mg: 4.0, chlorogenicAcid_mg: 8.5, lutein_mcg: 23,
      note: "Mangiferin is mango's signature xanthone bioactive: anti-inflammatory, anti-diabetic, anti-cancer in animal models.",
    },
    glycemicIndex: 51,
    functionalProperties: [
      "Rich mangiferin xanthone — unique anti-inflammatory bioactive",
      "Dense vitamin C (36 mg) for immune function and collagen synthesis",
      "Notable folate (43 mcg) for DNA methylation",
      "Gallic acid and quercetin derivatives with antioxidant activity",
    ],
    bioavailabilityNotes: "Ripe mango has high free sugars; unripe mango contains more pectin and resistant starch. Traditional Ethiopian consumption includes both ripe dessert use and green mango in salads.",
    sourceReferences: ["USDA FoodData Central #169910", "Masibo & Han (2009) Compr Rev Food Sci Food Saf"],
    dataConfidence: "high",
  },

  // ── 3. Banana (Muz) ──────────────────────────────────────────
  {
    uid: "frt-banana",
    nameEn: "Banana",
    nameAmharic: "ሙዝ",
    scientificName: "Musa paradisiaca",
    category: "Tropical Fruit",
    partUsed: "Flesh (ripe)",
    processingState: "raw",
    basis: "per 100 g raw ripe flesh",
    proximate: {
      energyKcal: 89, moisture_g: 74.9, protein_g: 1.09,
      fat_g: 0.33, carbohydrate_g: 22.84, dietaryFiber_g: 2.6, ash_g: 0.82, sugars_g: 12.23,
    },
    minerals: {
      calcium_mg: 5, phosphorus_mg: 22, magnesium_mg: 27,
      potassium_mg: 358, sodium_mg: 1, sulfur_mg: 16,
      iron_mg: 0.26, zinc_mg: 0.15, copper_mg: 0.078,
      manganese_mg: 0.27, selenium_mcg: 1.0, boron_mcg: 172, molybdenum_mcg: 14,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 3, betaCarotene_mcg: 26,
      vitaminB1_thiamine_mg: 0.031, vitaminB2_riboflavin_mg: 0.073,
      vitaminB3_niacin_mg: 0.665, vitaminB5_pantothenicAcid_mg: 0.334,
      vitaminB6_pyridoxine_mg: 0.367, vitaminB9_folate_mcg: 20,
      vitaminC_ascorbicAcid_mg: 8.7, vitaminE_tocopherol_mg: 0.1,
      vitaminK_mcg: 0.5,
    },
    aminoAcids: {
      essential: {
        histidine: 0.9, isoleucine: 1.5, leucine: 2.2,
        lysine: 2.0, methionine: 0.5, phenylalanine: 1.4,
        threonine: 1.3, tryptophan: 0.6, valine: 1.7,
      },
      semiEssential: { arginine: 2.1, cysteine: 0.5, glycine: 1.4, proline: 1.2, tyrosine: 0.8 },
      nonEssential: {
        alanine: 1.6, aspartate: 4.5, glutamate: 5.1,
        glutamine: 2.4, serine: 1.5, asparagine: 2.6,
      },
      totalAminoAcidsMgPer100g: 928,
      aminoAcidScore: 52,
    },
    fattyAcids: {
      totalSaturatedG: 0.112, totalMonounsaturatedG: 0.032, totalPolyunsaturatedG: 0.073,
      cholesterol_mg: 0,
      palmitic_C16_0: 0.107, oleic_C18_1: 0.032,
      linoleic_C18_2n6: 0.073,
    },
    phenolics: {
      totalPhenolicsMgGAE: 148, totalFlavonoidsMg: 32,
      note: "Dopamine content: 70–100 mcg/g in banana pulp — a dietary neuroactive amine (does not cross BBB).",
    },
    glycemicIndex: 51,
    functionalProperties: [
      "Highest vitamin B6 of common fruits (0.37 mg) — serotonin and dopamine synthesis",
      "Dense potassium (358 mg) for blood pressure and muscle function",
      "Prebiotic fructo-oligosaccharides and resistant starch (unripe)",
      "Natural source of dopamine (dietary, not CNS-active)",
    ],
    bioavailabilityNotes: "Unripe bananas contain 12–15% resistant starch (RS2) which ferments in the colon as prebiotic. Ripening converts RS to free sugars, raising GI from ~30 (green) to 51 (ripe).",
    sourceReferences: ["USDA FoodData Central #173944", "Bello-Pérez & Paredes-López (2009)"],
    dataConfidence: "high",
  },

  // ── 4. Papaya (Papaya) ────────────────────────────────────────
  {
    uid: "frt-papaya",
    nameEn: "Papaya",
    nameAmharic: "ፓፓያ",
    scientificName: "Carica papaya",
    category: "Tropical Fruit",
    partUsed: "Flesh (ripe)",
    processingState: "raw",
    basis: "per 100 g raw ripe flesh",
    proximate: {
      energyKcal: 43, moisture_g: 88.1, protein_g: 0.47,
      fat_g: 0.26, carbohydrate_g: 10.82, dietaryFiber_g: 1.7, ash_g: 0.35, sugars_g: 7.82,
    },
    minerals: {
      calcium_mg: 20, phosphorus_mg: 10, magnesium_mg: 21,
      potassium_mg: 182, sodium_mg: 8, sulfur_mg: 10,
      iron_mg: 0.25, zinc_mg: 0.08, copper_mg: 0.045,
      manganese_mg: 0.04, selenium_mcg: 0.6, boron_mcg: 44,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 47, betaCarotene_mcg: 276,
      vitaminB1_thiamine_mg: 0.023, vitaminB2_riboflavin_mg: 0.027,
      vitaminB3_niacin_mg: 0.357, vitaminB5_pantothenicAcid_mg: 0.218,
      vitaminB6_pyridoxine_mg: 0.038, vitaminB9_folate_mcg: 38,
      vitaminC_ascorbicAcid_mg: 61.8, vitaminE_tocopherol_mg: 0.3,
      vitaminK_mcg: 2.6,
    },
    aminoAcids: {
      essential: {
        histidine: 0.8, isoleucine: 0.7, leucine: 1.4,
        lysine: 1.6, methionine: 0.3, phenylalanine: 0.8,
        threonine: 0.8, tryptophan: 0.3, valine: 0.9,
      },
      semiEssential: { arginine: 1.0, glycine: 0.8, proline: 0.6, tyrosine: 0.5, cysteine: 0.2 },
      nonEssential: {
        alanine: 0.8, aspartate: 2.2, glutamate: 2.4,
        glutamine: 0.8, serine: 0.8, asparagine: 0.9,
      },
      totalAminoAcidsMgPer100g: 396,
      aminoAcidScore: 38,
    },
    fattyAcids: {
      totalSaturatedG: 0.079, totalMonounsaturatedG: 0.072, totalPolyunsaturatedG: 0.058,
      cholesterol_mg: 0,
      oleic_C18_1: 0.072, linoleic_C18_2n6: 0.058,
    },
    phenolics: {
      totalPhenolicsMgGAE: 132, betaCarotene_mcg: 276, lutein_mcg: 89, zeaxanthin_mcg: 0,
      note: "Lycopene 1828 mcg/100g (red-fleshed papaya). Papain protease enzyme aids protein digestion.",
    },
    glycemicIndex: 60,
    functionalProperties: [
      "Papain protease enzyme: meat tenderizer, digestive support, anti-inflammatory",
      "Very high vitamin C (61.8 mg) per low calorie (43 kcal) profile",
      "Lycopene (1828 mcg) in red-flesh varieties for prostate and cardiovascular health",
      "Beta-cryptoxanthin for lung cancer risk reduction",
    ],
    bioavailabilityNotes: "Papain remains active in ripe fruit. Seeds contain carpaine (alkaloid) and benzyl isothiocyanate with antimicrobial properties — used in traditional medicine. Green papaya seeds are a traditional antihelminthic.",
    sourceReferences: ["USDA FoodData Central #169926", "González-Aguilar et al. (2008) J Sci Food Agric"],
    dataConfidence: "high",
  },

  // ── 5. Passion Fruit (Yelemed Tibeb) ─────────────────────────
  {
    uid: "frt-passion-fruit",
    nameEn: "Passion Fruit (Purple)",
    nameAmharic: "ፓሽን ፍሬ",
    scientificName: "Passiflora edulis",
    category: "Tropical Fruit",
    partUsed: "Pulp (with seeds)",
    processingState: "raw",
    basis: "per 100 g raw pulp",
    proximate: {
      energyKcal: 97, moisture_g: 72.9, protein_g: 2.2,
      fat_g: 0.7, carbohydrate_g: 23.38, dietaryFiber_g: 10.4, ash_g: 0.8, sugars_g: 11.2,
    },
    minerals: {
      calcium_mg: 12, phosphorus_mg: 68, magnesium_mg: 29,
      potassium_mg: 348, sodium_mg: 28, sulfur_mg: 24,
      iron_mg: 1.6, zinc_mg: 0.1, copper_mg: 0.086,
      manganese_mg: 0.054, selenium_mcg: 0.6, boron_mcg: 88,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 64, betaCarotene_mcg: 743,
      vitaminB1_thiamine_mg: 0.0, vitaminB2_riboflavin_mg: 0.13,
      vitaminB3_niacin_mg: 1.5, vitaminB6_pyridoxine_mg: 0.1,
      vitaminB9_folate_mcg: 14, vitaminC_ascorbicAcid_mg: 30.0,
      vitaminE_tocopherol_mg: 0.02, vitaminK_mcg: 0.7,
    },
    aminoAcids: {
      essential: {
        histidine: 1.4, isoleucine: 2.0, leucine: 3.0,
        lysine: 2.5, methionine: 0.6, phenylalanine: 1.8,
        threonine: 1.9, tryptophan: 0.5, valine: 2.4,
      },
      nonEssential: {
        alanine: 2.4, aspartate: 6.2, glutamate: 8.4,
        glutamine: 2.2, serine: 2.0, asparagine: 3.0,
      },
      totalAminoAcidsMgPer100g: 1880,
      aminoAcidScore: 50,
    },
    fattyAcids: {
      totalSaturatedG: 0.059, totalMonounsaturatedG: 0.086, totalPolyunsaturatedG: 0.411,
      cholesterol_mg: 0,
      oleic_C18_1: 0.086, linoleic_C18_2n6: 0.394,
      alphaLinolenic_C18_3n3: 0.017, omega3ToOmega6Ratio: "1:23",
    },
    phenolics: {
      totalPhenolicsMgGAE: 380, totalFlavonoidsMg: 152,
      note: "Passiflorins, chrysin (flavone) — anxiolytic and sedative in traditional medicine. Piceatannol from seeds.",
    },
    glycemicIndex: 30,
    functionalProperties: [
      "Extremely high dietary fiber (10.4 g/100g) — highest of common fruits",
      "Rich beta-carotene (743 mcg) and vitamin C (30 mg)",
      "Chrysin flavone: GABA modulator — anxiolytic properties",
      "Notable iron content for a fruit (1.6 mg/100g)",
    ],
    sourceReferences: ["USDA FoodData Central #168152", "Zeraatpishe et al. (2011) Med Hypotheses"],
    dataConfidence: "medium",
  },

  // ── 6. Guava (Zeitun) ─────────────────────────────────────────
  {
    uid: "frt-guava",
    nameEn: "Guava",
    nameAmharic: "ዘይቱን / ጓቫ",
    scientificName: "Psidium guajava",
    category: "Tropical Fruit",
    partUsed: "Flesh with seeds (raw)",
    processingState: "raw",
    basis: "per 100 g raw guava",
    proximate: {
      energyKcal: 68, moisture_g: 80.8, protein_g: 2.55,
      fat_g: 0.95, carbohydrate_g: 14.32, dietaryFiber_g: 5.4, ash_g: 1.0, sugars_g: 8.92,
    },
    minerals: {
      calcium_mg: 18, phosphorus_mg: 40, magnesium_mg: 22,
      potassium_mg: 417, sodium_mg: 2, sulfur_mg: 35,
      iron_mg: 0.26, zinc_mg: 0.23, copper_mg: 0.23,
      manganese_mg: 0.15, selenium_mcg: 0.6, boron_mcg: 112,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 31, betaCarotene_mcg: 374,
      vitaminB1_thiamine_mg: 0.067, vitaminB2_riboflavin_mg: 0.04,
      vitaminB3_niacin_mg: 1.084, vitaminB5_pantothenicAcid_mg: 0.451,
      vitaminB6_pyridoxine_mg: 0.11, vitaminB9_folate_mcg: 49,
      vitaminC_ascorbicAcid_mg: 228.3, vitaminE_tocopherol_mg: 0.73,
      vitaminK_mcg: 2.6,
    },
    aminoAcids: {
      essential: {
        histidine: 1.8, isoleucine: 3.1, leucine: 5.2,
        lysine: 4.3, methionine: 0.9, phenylalanine: 2.8,
        threonine: 2.4, tryptophan: 0.8, valine: 4.0,
      },
      semiEssential: { arginine: 3.0, cysteine: 0.8, glycine: 3.8, proline: 2.2, tyrosine: 1.6 },
      nonEssential: {
        alanine: 3.5, aspartate: 9.2, glutamate: 10.8,
        glutamine: 2.8, serine: 2.8, asparagine: 3.4,
      },
      totalAminoAcidsMgPer100g: 2190,
      aminoAcidScore: 56,
    },
    fattyAcids: {
      totalSaturatedG: 0.272, totalMonounsaturatedG: 0.087, totalPolyunsaturatedG: 0.401,
      cholesterol_mg: 0,
      palmitic_C16_0: 0.248, oleic_C18_1: 0.084,
      linoleic_C18_2n6: 0.375, alphaLinolenic_C18_3n3: 0.026,
    },
    phenolics: {
      totalPhenolicsMgGAE: 620, totalFlavonoidsMg: 240,
      quercetin_mg: 42, kaempferol_mg: 8, lutein_mcg: 0,
      note: "Lycopene 5204 mcg/100g in pink/red guava. One of the richest dietary lycopene sources, exceeding tomato.",
    },
    glycemicIndex: 28,
    functionalProperties: [
      "Highest vitamin C of any common fruit (228 mg — 3× orange, 4× daily requirement)",
      "Lycopene 5204 mcg (pink guava) — superior to tomato",
      "Remarkable quercetin density (42 mg) for cardiovascular protection",
      "Dense dietary fiber (5.4 g) for gut microbiome support",
    ],
    bioavailabilityNotes: "Guava's vitamin C is better retained than citrus during storage due to lower pH environment. Pink guava lycopene bioavailability is estimated at 26% (vs 10–15% for processed tomato products).",
    sourceReferences: ["USDA FoodData Central #173044", "Jimenez-Escrig et al. (2001) J Agric Food Chem"],
    dataConfidence: "high",
  },

  // ── 7. Lemon (Lomi) ──────────────────────────────────────────
  {
    uid: "frt-lemon",
    nameEn: "Lemon",
    nameAmharic: "ሎሚ",
    scientificName: "Citrus limon",
    category: "Citrus Fruit",
    partUsed: "Juice and pulp",
    processingState: "raw",
    basis: "per 100 g raw lemon (with peel)",
    proximate: {
      energyKcal: 29, moisture_g: 88.9, protein_g: 1.1,
      fat_g: 0.3, carbohydrate_g: 9.32, dietaryFiber_g: 2.8, ash_g: 0.5, sugars_g: 2.5,
    },
    minerals: {
      calcium_mg: 26, phosphorus_mg: 16, magnesium_mg: 8,
      potassium_mg: 138, sodium_mg: 2, sulfur_mg: 14,
      iron_mg: 0.6, zinc_mg: 0.06, copper_mg: 0.037,
      manganese_mg: 0.03, selenium_mcg: 0.4, boron_mcg: 96,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.04, vitaminB2_riboflavin_mg: 0.02,
      vitaminB3_niacin_mg: 0.1, vitaminB6_pyridoxine_mg: 0.08,
      vitaminB9_folate_mcg: 11, vitaminC_ascorbicAcid_mg: 53.0,
      vitaminE_tocopherol_mg: 0.15, vitaminK_mcg: 0.0,
    },
    aminoAcids: {
      essential: {
        histidine: 0.8, isoleucine: 1.5, leucine: 2.0,
        lysine: 1.8, methionine: 0.4, phenylalanine: 1.2,
        threonine: 1.2, tryptophan: 0.3, valine: 1.5,
      },
      nonEssential: {
        alanine: 1.5, aspartate: 7.8, glutamate: 13.2,
        glutamine: 2.5, serine: 1.2,
      },
      totalAminoAcidsMgPer100g: 940,
      aminoAcidScore: 42,
    },
    fattyAcids: {
      totalSaturatedG: 0.039, totalMonounsaturatedG: 0.011, totalPolyunsaturatedG: 0.089,
      cholesterol_mg: 0,
      linoleic_C18_2n6: 0.066, alphaLinolenic_C18_3n3: 0.023,
    },
    phenolics: {
      totalPhenolicsMgGAE: 345, quercetin_mg: 1.3, kaempferol_mg: 0.9,
      note: "Eriocitrin and hesperidin (flavanones) in peel; limonene (terpene) in essential oil: cholesterol-lowering, apoptotic.",
    },
    glycemicIndex: 20,
    functionalProperties: [
      "Vitamin C (53 mg) — powerful iron absorption enhancer in traditional wot dishes",
      "Limonene in zest: detoxification enzyme inducer (CYP3A4)",
      "Citric acid: alkalinizing metabolite despite acidic taste; prevents kidney stones",
      "Hesperidin and eriocitrin: anti-inflammatory flavanones",
    ],
    bioavailabilityNotes: "Lemon juice addition to Ethiopian legume dishes (lentils, chickpeas) can increase non-heme iron absorption by 2–3×. Traditional use of yelomi chai during fasting supports iron and folate bioavailability.",
    sourceReferences: ["USDA FoodData Central #167746"],
    dataConfidence: "high",
  },

  // ── 8. Orange (Birtukan) ─────────────────────────────────────
  {
    uid: "frt-orange",
    nameEn: "Orange",
    nameAmharic: "ብርቱካን",
    scientificName: "Citrus sinensis",
    category: "Citrus Fruit",
    partUsed: "Flesh (fresh segments)",
    processingState: "raw",
    basis: "per 100 g raw flesh",
    proximate: {
      energyKcal: 47, moisture_g: 86.8, protein_g: 0.94,
      fat_g: 0.12, carbohydrate_g: 11.75, dietaryFiber_g: 2.4, ash_g: 0.4, sugars_g: 9.35,
    },
    minerals: {
      calcium_mg: 40, phosphorus_mg: 14, magnesium_mg: 10,
      potassium_mg: 181, sodium_mg: 0, sulfur_mg: 10,
      iron_mg: 0.1, zinc_mg: 0.07, copper_mg: 0.045,
      manganese_mg: 0.025, selenium_mcg: 0.5, boron_mcg: 192,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 11, betaCarotene_mcg: 71,
      vitaminB1_thiamine_mg: 0.087, vitaminB2_riboflavin_mg: 0.040,
      vitaminB3_niacin_mg: 0.282, vitaminB5_pantothenicAcid_mg: 0.25,
      vitaminB6_pyridoxine_mg: 0.06, vitaminB9_folate_mcg: 30,
      vitaminC_ascorbicAcid_mg: 53.2, vitaminE_tocopherol_mg: 0.18,
      vitaminK_mcg: 0.0,
    },
    aminoAcids: {
      essential: {
        histidine: 0.9, isoleucine: 1.5, leucine: 2.2,
        lysine: 2.4, methionine: 0.4, phenylalanine: 1.4,
        threonine: 1.2, tryptophan: 0.4, valine: 2.0,
      },
      nonEssential: {
        alanine: 2.3, aspartate: 6.4, glutamate: 9.6,
        glutamine: 2.4, serine: 1.4, asparagine: 2.0,
      },
      totalAminoAcidsMgPer100g: 826,
      aminoAcidScore: 48,
    },
    fattyAcids: {
      totalSaturatedG: 0.015, totalMonounsaturatedG: 0.023, totalPolyunsaturatedG: 0.025,
      cholesterol_mg: 0,
    },
    phenolics: {
      totalPhenolicsMgGAE: 228, quercetin_mg: 2.0, hesperidin_mg: 28.5,
      note: "Hesperidin (28.5 mg/100g): cardioprotective, anti-inflammatory, venous tone-improving flavanone.",
    },
    glycemicIndex: 40,
    functionalProperties: [
      "Classic non-heme iron absorption enhancer (53 mg vitamin C)",
      "Hesperidin for capillary fragility, venous insufficiency",
      "High boron (192 mcg) for bone health and sex hormone metabolism",
    ],
    sourceReferences: ["USDA FoodData Central #169097"],
    dataConfidence: "high",
  },

  // ── 9. Tamarind (Humer) ──────────────────────────────────────
  {
    uid: "frt-tamarind",
    nameEn: "Tamarind (raw pulp)",
    nameAmharic: "ሁመር",
    scientificName: "Tamarindus indica",
    category: "Leguminous Fruit",
    partUsed: "Pulp (raw, seeded)",
    processingState: "raw",
    basis: "per 100 g raw tamarind pulp",
    proximate: {
      energyKcal: 239, moisture_g: 31.4, protein_g: 2.8,
      fat_g: 0.6, carbohydrate_g: 62.5, dietaryFiber_g: 5.1, ash_g: 2.7, sugars_g: 57.4,
    },
    minerals: {
      calcium_mg: 74, phosphorus_mg: 113, magnesium_mg: 92,
      potassium_mg: 628, sodium_mg: 28, sulfur_mg: 42,
      iron_mg: 2.8, zinc_mg: 0.1, copper_mg: 0.086,
      manganese_mg: 0.929, selenium_mcg: 1.3, boron_mcg: 148,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.428, vitaminB2_riboflavin_mg: 0.152,
      vitaminB3_niacin_mg: 1.938, vitaminB5_pantothenicAcid_mg: 0.143,
      vitaminB6_pyridoxine_mg: 0.066, vitaminB9_folate_mcg: 14,
      vitaminC_ascorbicAcid_mg: 3.5, vitaminE_tocopherol_mg: 0.1,
      vitaminK_mcg: 2.8,
    },
    aminoAcids: {
      essential: {
        histidine: 1.0, isoleucine: 1.5, leucine: 2.8,
        lysine: 2.4, methionine: 0.4, phenylalanine: 2.0,
        threonine: 1.6, tryptophan: 0.3, valine: 2.2,
      },
      semiEssential: { arginine: 3.2, glycine: 2.4, proline: 2.6, tyrosine: 1.2, cysteine: 0.4 },
      nonEssential: {
        alanine: 2.4, aspartate: 7.6, glutamate: 10.2,
        glutamine: 2.2, serine: 1.6, asparagine: 3.8,
      },
      totalAminoAcidsMgPer100g: 2388,
      aminoAcidScore: 55,
    },
    fattyAcids: {
      totalSaturatedG: 0.272, totalMonounsaturatedG: 0.181, totalPolyunsaturatedG: 0.059,
      cholesterol_mg: 0, palmitic_C16_0: 0.248, oleic_C18_1: 0.181, linoleic_C18_2n6: 0.059,
    },
    phenolics: {
      totalPhenolicsMgGAE: 690, totalFlavonoidsMg: 185,
      note: "Tartaric acid (17g/100g) gives characteristic sourness. Luteolin, apigenin, procyanidins B1 and B2. Traditionally used as digestive and laxative agent.",
    },
    glycemicIndex: 65,
    functionalProperties: [
      "Outstanding thiamine (0.43 mg) — highest of common fruits",
      "High iron (2.8 mg) and magnesium (92 mg) for a fruit",
      "Tartaric acid: chelates minerals, enhances calcium bioavailability",
      "Traditional digestive: stimulates bile flow, promotes intestinal motility",
    ],
    sourceReferences: ["USDA FoodData Central #169909", "Havinga et al. (2010) J Ethnopharmacol"],
    dataConfidence: "high",
  },

  // ── 10. Pineapple (Ananas) ────────────────────────────────────
  {
    uid: "frt-pineapple",
    nameEn: "Pineapple",
    nameAmharic: "አናናስ",
    scientificName: "Ananas comosus",
    category: "Tropical Fruit",
    partUsed: "Flesh (raw)",
    processingState: "raw",
    basis: "per 100 g raw flesh",
    proximate: {
      energyKcal: 50, moisture_g: 86.0, protein_g: 0.54,
      fat_g: 0.12, carbohydrate_g: 13.12, dietaryFiber_g: 1.4, ash_g: 0.23, sugars_g: 9.85,
    },
    minerals: {
      calcium_mg: 13, phosphorus_mg: 8, magnesium_mg: 12,
      potassium_mg: 109, sodium_mg: 1, sulfur_mg: 8,
      iron_mg: 0.29, zinc_mg: 0.12, copper_mg: 0.11,
      manganese_mg: 0.927, selenium_mcg: 0.1, boron_mcg: 52,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.079, vitaminB2_riboflavin_mg: 0.032,
      vitaminB3_niacin_mg: 0.5, vitaminB5_pantothenicAcid_mg: 0.213,
      vitaminB6_pyridoxine_mg: 0.112, vitaminB9_folate_mcg: 18,
      vitaminC_ascorbicAcid_mg: 47.8, vitaminE_tocopherol_mg: 0.02,
      vitaminK_mcg: 0.7,
    },
    aminoAcids: {
      essential: {
        histidine: 0.8, isoleucine: 1.1, leucine: 1.8,
        lysine: 1.5, methionine: 0.4, phenylalanine: 1.3,
        threonine: 1.1, tryptophan: 0.3, valine: 1.5,
      },
      nonEssential: {
        alanine: 1.5, aspartate: 4.2, glutamate: 5.5,
        glutamine: 1.5, serine: 1.2, asparagine: 2.0,
      },
      totalAminoAcidsMgPer100g: 468,
      aminoAcidScore: 40,
    },
    fattyAcids: {
      totalSaturatedG: 0.009, totalMonounsaturatedG: 0.013, totalPolyunsaturatedG: 0.04,
      cholesterol_mg: 0, linoleic_C18_2n6: 0.028, alphaLinolenic_C18_3n3: 0.012,
    },
    phenolics: {
      totalPhenolicsMgGAE: 152, chlorogenicAcid_mg: 8.2,
      note: "Bromelain protease (stem: 2,400 GDU/g; fruit: 1,000 GDU/g): anti-inflammatory, fibrinolytic, digestive aid.",
    },
    glycemicIndex: 59,
    functionalProperties: [
      "Bromelain enzyme: reduces post-surgical inflammation, improves protein digestion",
      "Highest manganese of common fruits (0.93 mg) — cofactor for SOD antioxidant",
      "Vitamin C (47.8 mg) per serving for immune and connective tissue function",
    ],
    sourceReferences: ["USDA FoodData Central #169124", "Pavan et al. (2012) Biotechnol Res Int"],
    dataConfidence: "high",
  },
];
