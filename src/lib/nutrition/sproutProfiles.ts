/**
 * Sprout & Germinated Seed Nutritional Profiles
 * 25 items — per 100 g fresh/raw sprouts unless noted.
 * Germination dramatically elevates vitamins C, B-group, folate, and
 * degrades phytate, tannins, and trypsin inhibitors while boosting
 * enzyme activity and bioavailable minerals.
 * Sources: USDA FoodData Central, FAO/INFOODS AFDB, Kaur & Prasad (2021)
 * Trends Food Sci Technol, Liang et al. (2020) J Agric Food Chem.
 */

import type {
  DeepIngredientProfile,
  AminoAcidProfile,
  FattyAcidProfile,
  MineralProfile,
  VitaminProfile,
  PhenolicProfile,
  AntinutrientDetail,
} from "./deepNutrientProfiles";

export const SPROUT_PROFILES: DeepIngredientProfile[] = [
  // ── 1. Teff Sprouts ─────────────────────────────────────────
  {
    uid: "spr-teff",
    nameEn: "Teff Sprouts",
    nameAmharic: "የበቀለ ጤፍ",
    scientificName: "Eragrostis tef",
    category: "Sprout",
    partUsed: "Germinated grain (48–72h)",
    processingState: "sprouted",
    basis: "per 100 g fresh sprouts",
    proximate: {
      energyKcal: 101, moisture_g: 72.5, protein_g: 5.2,
      fat_g: 1.1, carbohydrate_g: 19.4, dietaryFiber_g: 3.8,
      ash_g: 1.8, starch_g: 12.0, sugars_g: 2.9,
    },
    minerals: {
      calcium_mg: 148, phosphorus_mg: 310, magnesium_mg: 126,
      potassium_mg: 298, sodium_mg: 8, sulfur_mg: 82,
      iron_mg: 8.9, zinc_mg: 2.7, copper_mg: 0.55,
      manganese_mg: 6.1, selenium_mcg: 6.2, molybdenum_mcg: 14,
      boron_mcg: 320,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 2, betaCarotene_mcg: 12,
      vitaminB1_thiamine_mg: 0.52, vitaminB2_riboflavin_mg: 0.31,
      vitaminB3_niacin_mg: 3.8, vitaminB5_pantothenicAcid_mg: 1.1,
      vitaminB6_pyridoxine_mg: 0.55, vitaminB9_folate_mcg: 68,
      vitaminC_ascorbicAcid_mg: 14.2, vitaminE_tocopherol_mg: 2.3,
      vitaminK_mcg: 8.1,
    },
    aminoAcids: {
      essential: {
        histidine: 3.9, isoleucine: 4.8, leucine: 9.5,
        lysine: 4.2, methionine: 3.6, phenylalanine: 6.5,
        threonine: 4.2, tryptophan: 1.5, valine: 5.7,
      },
      semiEssential: {
        arginine: 5.8, cysteine: 2.7, glycine: 5.2,
        proline: 9.6, tyrosine: 3.6,
      },
      nonEssential: {
        alanine: 6.0, asparagine: 4.1, aspartate: 8.2,
        glutamate: 18.5, glutamine: 5.1, serine: 4.8,
      },
      totalAminoAcidsMgPer100g: 4820,
      limitingAmino: "Lysine (borderline adequate after germination)",
      aminoAcidScore: 86,
    },
    fattyAcids: {
      totalSaturatedG: 0.22, totalMonounsaturatedG: 0.28, totalPolyunsaturatedG: 0.55,
      cholesterol_mg: 0,
      palmitic_C16_0: 0.19, stearic_C18_0: 0.03,
      oleic_C18_1: 0.26, linoleic_C18_2n6: 0.49,
      alphaLinolenic_C18_3n3: 0.06, omega3ToOmega6Ratio: "1:8",
    },
    phenolics: {
      totalPhenolicsMgGAE: 198, totalFlavonoidsMg: 82,
      ferulic_mg: 64, proanthocyanidins_mg: 28,
      note: "Germination increases free phenolic acids by 30–45% vs dry grain.",
    },
    antinutrients: {
      phytate_mg: 155, tannins_mg: 62, oxalates_mg: 24,
      trypsinInhibitor_TIU: 1.8,
      processingReduction: {
        method: "48–72h germination at 25°C",
        phytateReductionPct: 75, tanninsReductionPct: 65,
        trypsinInhibitorReductionPct: 82,
      },
    },
    glycemicIndex: 36,
    functionalProperties: [
      "Enhanced iron and zinc bioavailability post-germination",
      "Activated endogenous phytase enzymes",
      "Increased vitamin C for non-heme iron absorption",
      "Prebiotic resistant starch with improved digestibility",
    ],
    bioavailabilityNotes: "Germination activates endogenous phytase, reducing phytate by 75%. Ascorbic acid generated during sprouting enhances non-heme iron absorption by up to 2×.",
    sourceReferences: ["USDA FoodData Central #170687", "Abebe et al. (2015) Food Chemistry", "FAO INFOODS AFDB"],
    dataConfidence: "medium",
  },

  // ── 2. Lentil Sprouts ────────────────────────────────────────
  {
    uid: "spr-lentil",
    nameEn: "Lentil Sprouts",
    nameAmharic: "የበቀለ ምስር",
    scientificName: "Lens culinaris",
    category: "Sprout",
    partUsed: "Germinated seeds (72h)",
    processingState: "sprouted",
    basis: "per 100 g fresh sprouts",
    proximate: {
      energyKcal: 106, moisture_g: 69.4, protein_g: 8.96,
      fat_g: 0.55, carbohydrate_g: 18.34, dietaryFiber_g: 5.25,
      ash_g: 2.75, starch_g: 9.8, sugars_g: 1.9,
    },
    minerals: {
      calcium_mg: 25, phosphorus_mg: 173, magnesium_mg: 28,
      potassium_mg: 322, sodium_mg: 11, sulfur_mg: 144,
      iron_mg: 3.21, zinc_mg: 1.5, copper_mg: 0.27,
      manganese_mg: 0.51, selenium_mcg: 0.6, molybdenum_mcg: 65,
      boron_mcg: 740,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 3, betaCarotene_mcg: 18,
      vitaminB1_thiamine_mg: 0.22, vitaminB2_riboflavin_mg: 0.12,
      vitaminB3_niacin_mg: 1.69, vitaminB5_pantothenicAcid_mg: 0.63,
      vitaminB6_pyridoxine_mg: 0.19, vitaminB9_folate_mcg: 98,
      vitaminC_ascorbicAcid_mg: 16.5, vitaminE_tocopherol_mg: 0.21,
      vitaminK_mcg: 13.4,
    },
    aminoAcids: {
      essential: {
        histidine: 2.7, isoleucine: 4.6, leucine: 7.8,
        lysine: 7.4, methionine: 0.6, phenylalanine: 5.2,
        threonine: 3.8, tryptophan: 0.9, valine: 5.0,
      },
      semiEssential: {
        arginine: 7.9, cysteine: 1.4, glycine: 3.9,
        proline: 4.2, tyrosine: 2.9,
      },
      nonEssential: {
        alanine: 4.5, asparagine: 8.8, aspartate: 11.6,
        glutamate: 17.1, glutamine: 4.2, serine: 4.9,
      },
      totalAminoAcidsMgPer100g: 8050,
      limitingAmino: "Methionine + Cysteine",
      aminoAcidScore: 79,
    },
    fattyAcids: {
      totalSaturatedG: 0.07, totalMonounsaturatedG: 0.09, totalPolyunsaturatedG: 0.28,
      cholesterol_mg: 0,
      palmitic_C16_0: 0.06, stearic_C18_0: 0.01,
      oleic_C18_1: 0.08, linoleic_C18_2n6: 0.24,
      alphaLinolenic_C18_3n3: 0.04, omega3ToOmega6Ratio: "1:6",
    },
    phenolics: {
      totalPhenolicsMgGAE: 312, totalFlavonoidsMg: 128,
      quercetin_mg: 18, kaempferol_mg: 12, rutin_mg: 22,
      note: "Germination markedly increases isoflavones and condensed tannin solubility.",
    },
    antinutrients: {
      phytate_mg: 210, tannins_mg: 88, oxalates_mg: 34,
      lectins_HU: 280, trypsinInhibitor_TIU: 3.1,
      processingReduction: {
        method: "72h germination; discard soak water",
        phytateReductionPct: 68, tanninsReductionPct: 72,
        lectinsReductionPct: 80, trypsinInhibitorReductionPct: 78,
      },
    },
    glycemicIndex: 25,
    functionalProperties: [
      "Outstanding folate source for prenatal nutrition",
      "High lysine complementing cereal amino acid profiles",
      "Enzymes activated: amylase, lipase, protease",
      "Phytoestrogen activity (isoflavones)",
    ],
    bioavailabilityNotes: "Sprouting reduces phytate 68% and activates endogenous enzymes that hydrolyze complex oligosaccharides, reducing flatulence factors by 40%.",
    sourceReferences: ["USDA FoodData Central #175199", "FAO/WHO Protein Quality Evaluation (1991)", "Liang et al. (2020) J Agric Food Chem"],
    dataConfidence: "high",
  },

  // ── 3. Chickpea Sprouts (Shimbra) ────────────────────────────
  {
    uid: "spr-chickpea",
    nameEn: "Chickpea Sprouts",
    nameAmharic: "የበቀለ ሽምብራ",
    scientificName: "Cicer arietinum",
    category: "Sprout",
    partUsed: "Germinated seeds (48h)",
    processingState: "sprouted",
    basis: "per 100 g fresh sprouts",
    proximate: {
      energyKcal: 121, moisture_g: 67.5, protein_g: 8.82,
      fat_g: 1.91, carbohydrate_g: 19.8, dietaryFiber_g: 4.9,
      ash_g: 2.0, starch_g: 12.2, sugars_g: 3.4,
    },
    minerals: {
      calcium_mg: 37, phosphorus_mg: 191, magnesium_mg: 44,
      potassium_mg: 359, sodium_mg: 10, sulfur_mg: 168,
      iron_mg: 2.67, zinc_mg: 1.53, copper_mg: 0.35,
      manganese_mg: 0.88, selenium_mcg: 3.7, molybdenum_mcg: 84,
      boron_mcg: 960,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.19, vitaminB2_riboflavin_mg: 0.10,
      vitaminB3_niacin_mg: 1.5, vitaminB5_pantothenicAcid_mg: 0.59,
      vitaminB6_pyridoxine_mg: 0.24, vitaminB9_folate_mcg: 115,
      vitaminC_ascorbicAcid_mg: 21.8, vitaminE_tocopherol_mg: 0.49,
      vitaminK_mcg: 9.0,
    },
    aminoAcids: {
      essential: {
        histidine: 2.5, isoleucine: 4.4, leucine: 7.2,
        lysine: 7.0, methionine: 0.9, phenylalanine: 5.5,
        threonine: 3.5, tryptophan: 1.1, valine: 4.3,
      },
      semiEssential: {
        arginine: 8.8, cysteine: 1.6, glycine: 3.7,
        proline: 4.0, tyrosine: 3.0,
      },
      nonEssential: {
        alanine: 4.2, asparagine: 6.2, aspartate: 12.0,
        glutamate: 17.5, glutamine: 3.8, serine: 5.2,
      },
      totalAminoAcidsMgPer100g: 7910,
      limitingAmino: "Methionine + Cysteine",
      aminoAcidScore: 81,
    },
    fattyAcids: {
      totalSaturatedG: 0.20, totalMonounsaturatedG: 0.44, totalPolyunsaturatedG: 0.84,
      cholesterol_mg: 0,
      palmitic_C16_0: 0.18, stearic_C18_0: 0.03,
      oleic_C18_1: 0.39, linoleic_C18_2n6: 0.79,
      alphaLinolenic_C18_3n3: 0.05, omega3ToOmega6Ratio: "1:16",
    },
    phenolics: {
      totalPhenolicsMgGAE: 285, totalFlavonoidsMg: 98,
      quercetin_mg: 14, kaempferol_mg: 9,
    },
    antinutrients: {
      phytate_mg: 320, tannins_mg: 96, oxalates_mg: 28,
      saponins_mg: 62, trypsinInhibitor_TIU: 2.8,
      processingReduction: {
        method: "48h germination; soaking + rinsing",
        phytateReductionPct: 62, tanninsReductionPct: 68,
        trypsinInhibitorReductionPct: 74,
      },
    },
    glycemicIndex: 33,
    functionalProperties: [
      "High bioaccessible boron for bone metabolism",
      "Significant isoflavones (biochanin A, formononetin)",
      "Dense folate for neural tube development",
      "Prebiotic galacto-oligosaccharides",
    ],
    bioavailabilityNotes: "Sprouting reduces raffinose family oligosaccharides by 50%, significantly reducing flatulence while preserving prebiotic inulin fractions.",
    sourceReferences: ["USDA FoodData Central #173948", "Kaur & Prasad (2021) Trends Food Sci Technol"],
    dataConfidence: "medium",
  },

  // ── 4. Fenugreek Sprouts (Abish) ─────────────────────────────
  {
    uid: "spr-fenugreek",
    nameEn: "Fenugreek Sprouts",
    nameAmharic: "የበቀለ አቢሽ",
    scientificName: "Trigonella foenum-graecum",
    category: "Sprout",
    partUsed: "Germinated seeds (48–60h)",
    processingState: "sprouted",
    basis: "per 100 g fresh sprouts",
    proximate: {
      energyKcal: 98, moisture_g: 71.0, protein_g: 8.2,
      fat_g: 1.5, carbohydrate_g: 15.3, dietaryFiber_g: 5.8,
      ash_g: 4.0, starch_g: 5.2, sugars_g: 1.8,
    },
    minerals: {
      calcium_mg: 118, phosphorus_mg: 296, magnesium_mg: 124,
      potassium_mg: 772, sodium_mg: 67, sulfur_mg: 198,
      iron_mg: 8.2, zinc_mg: 2.5, copper_mg: 0.41,
      manganese_mg: 0.91, selenium_mcg: 6.3, molybdenum_mcg: 18,
      boron_mcg: 520,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 8, betaCarotene_mcg: 48,
      vitaminB1_thiamine_mg: 0.32, vitaminB2_riboflavin_mg: 0.37,
      vitaminB3_niacin_mg: 1.64, vitaminB9_folate_mcg: 57,
      vitaminC_ascorbicAcid_mg: 9.8, vitaminE_tocopherol_mg: 0.38,
    },
    aminoAcids: {
      essential: {
        histidine: 2.8, isoleucine: 4.5, leucine: 7.9,
        lysine: 6.6, methionine: 1.2, phenylalanine: 5.1,
        threonine: 3.9, tryptophan: 1.3, valine: 5.0,
      },
      semiEssential: {
        arginine: 6.8, cysteine: 1.9, glycine: 4.5, proline: 5.1, tyrosine: 2.9,
      },
      nonEssential: {
        alanine: 5.2, asparagine: 5.4, aspartate: 11.2,
        glutamate: 16.3, glutamine: 3.5, serine: 5.0,
      },
      totalAminoAcidsMgPer100g: 7380,
      limitingAmino: "Methionine",
      aminoAcidScore: 77,
    },
    fattyAcids: {
      totalSaturatedG: 0.42, totalMonounsaturatedG: 0.19, totalPolyunsaturatedG: 0.75,
      cholesterol_mg: 0,
      palmitic_C16_0: 0.38, oleic_C18_1: 0.17,
      linoleic_C18_2n6: 0.70, alphaLinolenic_C18_3n3: 0.05,
      omega3ToOmega6Ratio: "1:14",
    },
    phenolics: {
      totalPhenolicsMgGAE: 420, totalFlavonoidsMg: 165,
      quercetin_mg: 22, kaempferol_mg: 16,
      note: "Rich in trigonelline, 4-hydroxyisoleucine (insulin sensitizer).",
    },
    antinutrients: {
      saponins_mg: 185, tannins_mg: 62, phytate_mg: 240,
      processingReduction: {
        method: "48h germination reduces saponins 55%, phytate 65%",
        phytateReductionPct: 65, tanninsReductionPct: 58,
      },
    },
    glycemicIndex: 24,
    functionalProperties: [
      "Potent hypoglycemic — 4-hydroxyisoleucine mimics insulin signaling",
      "Galactomannan fiber slows gastric emptying",
      "Galactagogue: stimulates breast milk production",
      "Rich iron source with vitamin C co-factor",
    ],
    bioavailabilityNotes: "Fenugreek sprouts deliver 4-hydroxyisoleucine, a unique amino acid shown to enhance glucose-stimulated insulin release by 25% in vitro.",
    sourceReferences: ["USDA FoodData Central #170409", "Nagulapalli Venkata et al. (2017) Phytother Res"],
    dataConfidence: "medium",
  },

  // ── 5. Mung Bean Sprouts ─────────────────────────────────────
  {
    uid: "spr-mungbean",
    nameEn: "Mung Bean Sprouts",
    nameAmharic: "የበቀለ ሙግ ባቄላ",
    scientificName: "Vigna radiata",
    category: "Sprout",
    partUsed: "Germinated seeds (72h)",
    processingState: "sprouted",
    basis: "per 100 g fresh sprouts",
    proximate: {
      energyKcal: 30, moisture_g: 90.4, protein_g: 3.04,
      fat_g: 0.18, carbohydrate_g: 5.94, dietaryFiber_g: 1.8,
      ash_g: 0.44, sugars_g: 4.13,
    },
    minerals: {
      calcium_mg: 13, phosphorus_mg: 54, magnesium_mg: 21,
      potassium_mg: 149, sodium_mg: 6, sulfur_mg: 55,
      iron_mg: 0.91, zinc_mg: 0.41, copper_mg: 0.164,
      manganese_mg: 0.188, selenium_mcg: 0.6, molybdenum_mcg: 29,
      boron_mcg: 280,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 1, betaCarotene_mcg: 6,
      vitaminB1_thiamine_mg: 0.084, vitaminB2_riboflavin_mg: 0.124,
      vitaminB3_niacin_mg: 0.749, vitaminB5_pantothenicAcid_mg: 0.38,
      vitaminB6_pyridoxine_mg: 0.088, vitaminB9_folate_mcg: 61,
      vitaminC_ascorbicAcid_mg: 13.2, vitaminK_mcg: 33.0,
    },
    aminoAcids: {
      essential: {
        histidine: 2.1, isoleucine: 3.5, leucine: 5.9,
        lysine: 5.5, methionine: 0.8, phenylalanine: 4.1,
        threonine: 2.9, tryptophan: 0.9, valine: 3.9,
      },
      semiEssential: {
        arginine: 5.1, cysteine: 1.2, glycine: 3.1,
        proline: 2.9, tyrosine: 2.3,
      },
      nonEssential: {
        alanine: 3.4, asparagine: 5.2, aspartate: 8.8,
        glutamate: 14.2, glutamine: 3.0, serine: 3.7,
      },
      totalAminoAcidsMgPer100g: 2520,
      limitingAmino: "Methionine + Cysteine",
      aminoAcidScore: 72,
    },
    fattyAcids: {
      totalSaturatedG: 0.046, totalMonounsaturatedG: 0.016, totalPolyunsaturatedG: 0.079,
      cholesterol_mg: 0,
      palmitic_C16_0: 0.040, oleic_C18_1: 0.014,
      linoleic_C18_2n6: 0.072, alphaLinolenic_C18_3n3: 0.007,
      omega3ToOmega6Ratio: "1:10",
    },
    phenolics: {
      totalPhenolicsMgGAE: 185, quercetin_mg: 8, vitexin_mg: 14,
      note: "Vitexin and isovitexin are key C-glycosyl flavones with anti-inflammatory properties.",
    },
    antinutrients: {
      phytate_mg: 60, tannins_mg: 18, oxalates_mg: 12, trypsinInhibitor_TIU: 0.9,
      processingReduction: {
        method: "72h germination at 25°C in dark",
        phytateReductionPct: 80, tanninsReductionPct: 78,
        trypsinInhibitorReductionPct: 88,
      },
    },
    glycemicIndex: 22,
    functionalProperties: [
      "Extremely low calorie density — ideal weight management food",
      "Rich in vitexin: anti-inflammatory C-glycosyl flavone",
      "High folate for prenatal and cardiovascular health",
      "Rapid digestibility — suitable for convalescent diets",
    ],
    bioavailabilityNotes: "Among the lowest antinutrient burden of any sprouted legume. Nearly complete hydrolysis of raffinose and stachyose by 72h.",
    sourceReferences: ["USDA FoodData Central #175180", "Kaur & Prasad (2021) Trends Food Sci Technol"],
    dataConfidence: "high",
  },

  // ── 6. Soybean Sprouts ───────────────────────────────────────
  {
    uid: "spr-soybean",
    nameEn: "Soybean Sprouts",
    nameAmharic: "የበቀለ ሶያ ባቄላ",
    scientificName: "Glycine max",
    category: "Sprout",
    partUsed: "Germinated seeds (48–72h)",
    processingState: "sprouted",
    basis: "per 100 g fresh sprouts",
    proximate: {
      energyKcal: 122, moisture_g: 68.9, protein_g: 13.09,
      fat_g: 6.69, carbohydrate_g: 9.57, dietaryFiber_g: 0.0,
      ash_g: 1.75, sugars_g: 4.23,
    },
    minerals: {
      calcium_mg: 67, phosphorus_mg: 194, magnesium_mg: 52,
      potassium_mg: 484, sodium_mg: 14, sulfur_mg: 245,
      iron_mg: 2.1, zinc_mg: 1.0, copper_mg: 0.22,
      manganese_mg: 0.52, selenium_mcg: 1.5, molybdenum_mcg: 92,
      boron_mcg: 1120,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 2, betaCarotene_mcg: 15,
      vitaminB1_thiamine_mg: 0.25, vitaminB2_riboflavin_mg: 0.14,
      vitaminB3_niacin_mg: 1.65, vitaminB5_pantothenicAcid_mg: 0.87,
      vitaminB6_pyridoxine_mg: 0.18, vitaminB9_folate_mcg: 172,
      vitaminC_ascorbicAcid_mg: 15.3, vitaminE_tocopherol_mg: 0.41,
      vitaminK_mcg: 33.3,
    },
    aminoAcids: {
      essential: {
        histidine: 2.6, isoleucine: 5.3, leucine: 8.1,
        lysine: 6.3, methionine: 1.4, phenylalanine: 5.4,
        threonine: 3.8, tryptophan: 1.4, valine: 4.9,
      },
      semiEssential: {
        arginine: 7.5, cysteine: 1.4, glycine: 4.1,
        proline: 5.0, tyrosine: 3.7,
      },
      nonEssential: {
        alanine: 4.5, asparagine: 5.6, aspartate: 11.4,
        glutamate: 18.8, glutamine: 4.6, serine: 5.2,
      },
      totalAminoAcidsMgPer100g: 11780,
      limitingAmino: "Methionine (borderline)",
      aminoAcidScore: 96,
    },
    fattyAcids: {
      totalSaturatedG: 0.98, totalMonounsaturatedG: 1.47, totalPolyunsaturatedG: 3.75,
      cholesterol_mg: 0,
      palmitic_C16_0: 0.89, stearic_C18_0: 0.09,
      oleic_C18_1: 1.40, linoleic_C18_2n6: 3.22,
      alphaLinolenic_C18_3n3: 0.43, omega3ToOmega6Ratio: "1:7.5",
    },
    phenolics: {
      totalPhenolicsMgGAE: 338, totalFlavonoidsMg: 142,
      note: "Rich isoflavones: genistein (1.8 mg/100g), daidzein (0.9 mg/100g) increased by germination.",
    },
    antinutrients: {
      phytate_mg: 480, tannins_mg: 24, saponins_mg: 112,
      lectins_HU: 1800, trypsinInhibitor_TIU: 6.2,
      processingReduction: {
        method: "72h germination + optional blanching",
        phytateReductionPct: 58, lectinsReductionPct: 85,
        trypsinInhibitorReductionPct: 72,
      },
    },
    glycemicIndex: 18,
    functionalProperties: [
      "Complete protein — PDCAAS 0.96 (highest among plant sprouts)",
      "Isoflavones: cardioprotective and phytoestrogenic",
      "Highest boron content of all sprouts",
      "Significant ALA (plant n-3) content",
    ],
    bioavailabilityNotes: "Germination increases protease activity 4×, significantly improving amino acid digestibility. Boron at 1120 mcg/100g supports bone mineral density and estrogen metabolism.",
    sourceReferences: ["USDA FoodData Central #174272", "FAO/WHO Protein Quality (1991)"],
    dataConfidence: "high",
  },

  // ── 7. Wheat Sprouts ─────────────────────────────────────────
  {
    uid: "spr-wheat",
    nameEn: "Wheat Sprouts",
    nameAmharic: "የበቀለ ስንዴ",
    scientificName: "Triticum aestivum",
    category: "Sprout",
    partUsed: "Germinated grain (48h)",
    processingState: "sprouted",
    basis: "per 100 g fresh sprouts",
    proximate: {
      energyKcal: 198, moisture_g: 46.1, protein_g: 7.49,
      fat_g: 1.27, carbohydrate_g: 42.53, dietaryFiber_g: 2.2,
      ash_g: 1.14, starch_g: 34.5, sugars_g: 6.8,
    },
    minerals: {
      calcium_mg: 30, phosphorus_mg: 234, magnesium_mg: 82,
      potassium_mg: 169, sodium_mg: 16, sulfur_mg: 128,
      iron_mg: 2.35, zinc_mg: 1.65, copper_mg: 0.25,
      manganese_mg: 1.58, selenium_mcg: 25.3, molybdenum_mcg: 28,
      boron_mcg: 380,
    },
    vitamins: {
      vitaminB1_thiamine_mg: 0.23, vitaminB2_riboflavin_mg: 0.16,
      vitaminB3_niacin_mg: 3.6, vitaminB5_pantothenicAcid_mg: 0.95,
      vitaminB6_pyridoxine_mg: 0.28, vitaminB9_folate_mcg: 45,
      vitaminC_ascorbicAcid_mg: 4.0, vitaminE_tocopherol_mg: 1.1,
      vitaminK_mcg: 2.2,
    },
    aminoAcids: {
      essential: {
        histidine: 2.0, isoleucine: 3.5, leucine: 6.9,
        lysine: 2.6, methionine: 1.8, phenylalanine: 4.9,
        threonine: 2.9, tryptophan: 1.1, valine: 4.5,
      },
      semiEssential: {
        arginine: 4.4, cysteine: 2.3, glycine: 3.8,
        proline: 10.8, tyrosine: 2.5,
      },
      nonEssential: {
        alanine: 3.5, asparagine: 3.1, aspartate: 4.9,
        glutamate: 31.2, glutamine: 8.0, serine: 4.4,
      },
      totalAminoAcidsMgPer100g: 6720,
      limitingAmino: "Lysine",
      aminoAcidScore: 58,
    },
    fattyAcids: {
      totalSaturatedG: 0.21, totalMonounsaturatedG: 0.13, totalPolyunsaturatedG: 0.55,
      cholesterol_mg: 0,
      palmitic_C16_0: 0.18, stearic_C18_0: 0.03,
      oleic_C18_1: 0.12, linoleic_C18_2n6: 0.49,
      alphaLinolenic_C18_3n3: 0.06, omega3ToOmega6Ratio: "1:8",
    },
    phenolics: {
      totalPhenolicsMgGAE: 225, ferulic_mg: 88, lignans_mg: 32,
    },
    antinutrients: {
      phytate_mg: 380, tannins_mg: 24, oxalates_mg: 18,
      processingReduction: {
        method: "48h germination; phytase activation peaks at 24h",
        phytateReductionPct: 70, tanninsReductionPct: 55,
      },
    },
    glycemicIndex: 41,
    functionalProperties: [
      "Activated glutathione and SOD antioxidant enzymes",
      "High selenium (25 mcg) for thyroid and immune function",
      "Ferulic acid: potent UV-photoprotective phenolic",
    ],
    bioavailabilityNotes: "Germination converts starch to simpler maltose and glucose chains while activating endogenous alpha-amylase. Gluten proteins are partially hydrolyzed, improving tolerability for mild gluten sensitivity (NOT celiac safe).",
    sourceReferences: ["USDA FoodData Central #168898", "Liang et al. (2020) J Agric Food Chem"],
    dataConfidence: "high",
  },

  // ── 8. Radish Sprouts (Mella) ────────────────────────────────
  {
    uid: "spr-radish",
    nameEn: "Radish Sprouts",
    nameAmharic: "የበቀለ ሜሊሳ",
    scientificName: "Raphanus sativus",
    category: "Sprout",
    partUsed: "Germinated seed (5–7d cotyledon stage)",
    processingState: "sprouted",
    basis: "per 100 g fresh sprouts",
    proximate: {
      energyKcal: 43, moisture_g: 89.0, protein_g: 3.81,
      fat_g: 2.53, carbohydrate_g: 3.57, dietaryFiber_g: 2.2,
      ash_g: 1.09,
    },
    minerals: {
      calcium_mg: 51, phosphorus_mg: 113, magnesium_mg: 29,
      potassium_mg: 86, sodium_mg: 18, sulfur_mg: 310,
      iron_mg: 1.34, zinc_mg: 0.56, copper_mg: 0.14,
      manganese_mg: 0.30, selenium_mcg: 0.6, boron_mcg: 145,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 24, betaCarotene_mcg: 141,
      vitaminB2_riboflavin_mg: 0.10, vitaminB3_niacin_mg: 0.91,
      vitaminB9_folate_mcg: 95, vitaminC_ascorbicAcid_mg: 28.9,
      vitaminE_tocopherol_mg: 1.02, vitaminK_mcg: 47.2,
    },
    aminoAcids: {
      essential: {
        histidine: 2.5, isoleucine: 3.9, leucine: 6.1,
        lysine: 5.4, methionine: 1.8, phenylalanine: 3.8,
        threonine: 3.2, tryptophan: 1.0, valine: 4.5,
      },
      semiEssential: {
        arginine: 4.9, cysteine: 2.0, glycine: 3.8, proline: 3.4, tyrosine: 2.4,
      },
      nonEssential: {
        alanine: 4.2, asparagine: 4.6, aspartate: 9.4,
        glutamate: 12.8, glutamine: 2.9, serine: 3.9,
      },
      totalAminoAcidsMgPer100g: 3240,
      limitingAmino: "Tryptophan",
      aminoAcidScore: 74,
    },
    fattyAcids: {
      totalSaturatedG: 0.28, totalMonounsaturatedG: 0.60, totalPolyunsaturatedG: 1.42,
      cholesterol_mg: 0,
      erucic_C22_1: 0.45, linoleic_C18_2n6: 1.02,
      alphaLinolenic_C18_3n3: 0.40, omega3ToOmega6Ratio: "1:2.6",
    },
    phenolics: {
      totalPhenolicsMgGAE: 480, totalFlavonoidsMg: 192,
      quercetin_mg: 38, kaempferol_mg: 28,
      note: "Rich in sulforaphane precursors (glucosinolates → ITC on chewing).",
    },
    antinutrients: {
      goitrogens_mg: 18,
      processingReduction: {
        method: "Light steaming deactivates goitrogenic activity",
        trypsinInhibitorReductionPct: 60,
      },
    },
    glycemicIndex: 15,
    functionalProperties: [
      "Dense glucosinolates → sulforaphane & isothiocyanates (cancer chemoprotective)",
      "High sulfur (310 mg) for glutathione synthesis",
      "Outstanding vitamin K for bone coagulation",
      "Exceptionally low GI — suitable for diabetic diets",
    ],
    bioavailabilityNotes: "Radish sprouts contain ~3× more glucosinolate-derived isothiocyanates than mature radish. Sulforaphane activates Nrf2-mediated phase II detoxification enzymes.",
    sourceReferences: ["USDA FoodData Central #11449", "Fahey et al. (2001) Cancer Epidemiol Biomarkers"],
    dataConfidence: "medium",
  },

  // ── 9. Sunflower Sprouts ─────────────────────────────────────
  {
    uid: "spr-sunflower",
    nameEn: "Sunflower Sprouts",
    nameAmharic: "የበቀለ ሱፍ ዘር",
    scientificName: "Helianthus annuus",
    category: "Sprout",
    partUsed: "Germinated seed, cotyledon stage (7–10d)",
    processingState: "sprouted",
    basis: "per 100 g fresh microgreens/sprouts",
    proximate: {
      energyKcal: 78, moisture_g: 83.0, protein_g: 6.2,
      fat_g: 4.8, carbohydrate_g: 3.1, dietaryFiber_g: 1.9, ash_g: 2.9,
    },
    minerals: {
      calcium_mg: 42, phosphorus_mg: 188, magnesium_mg: 68,
      potassium_mg: 248, sodium_mg: 22, sulfur_mg: 188,
      iron_mg: 2.8, zinc_mg: 1.9, copper_mg: 0.58,
      manganese_mg: 0.82, selenium_mcg: 18.4, boron_mcg: 265,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 12, betaCarotene_mcg: 72,
      vitaminB1_thiamine_mg: 0.38, vitaminB2_riboflavin_mg: 0.22,
      vitaminB3_niacin_mg: 2.8, vitaminB6_pyridoxine_mg: 0.42,
      vitaminB9_folate_mcg: 88, vitaminC_ascorbicAcid_mg: 22.5,
      vitaminE_tocopherol_mg: 8.4, vitaminK_mcg: 18.2,
    },
    aminoAcids: {
      essential: {
        histidine: 2.8, isoleucine: 4.5, leucine: 7.8,
        lysine: 4.0, methionine: 2.9, phenylalanine: 5.2,
        threonine: 3.9, tryptophan: 1.6, valine: 5.6,
      },
      semiEssential: {
        arginine: 9.8, cysteine: 1.8, glycine: 5.4, proline: 4.5, tyrosine: 3.2,
      },
      nonEssential: {
        alanine: 4.8, asparagine: 4.9, aspartate: 9.2,
        glutamate: 20.8, glutamine: 4.5, serine: 4.9,
      },
      totalAminoAcidsMgPer100g: 5580,
      limitingAmino: "Lysine",
      aminoAcidScore: 78,
    },
    fattyAcids: {
      totalSaturatedG: 0.52, totalMonounsaturatedG: 1.82, totalPolyunsaturatedG: 2.08,
      cholesterol_mg: 0,
      palmitic_C16_0: 0.48, stearic_C18_0: 0.04,
      oleic_C18_1: 1.78, linoleic_C18_2n6: 2.02,
      alphaLinolenic_C18_3n3: 0.06, omega3ToOmega6Ratio: "1:34",
    },
    phenolics: {
      totalPhenolicsMgGAE: 185, chlorogenicAcid_mg: 92,
      note: "Chlorogenic acid is a key antidiabetic and hepatoprotective polyphenol.",
    },
    antinutrients: {
      phytate_mg: 288, tannins_mg: 20,
      processingReduction: {
        method: "7-day germination under light",
        phytateReductionPct: 72, tanninsReductionPct: 65,
      },
    },
    glycemicIndex: 28,
    functionalProperties: [
      "Highest vitamin E (8.4 mg tocopherol) of common sprouts",
      "Dense chlorogenic acid for blood sugar regulation",
      "Rich arginine for nitric oxide / cardiovascular health",
      "High selenium for thyroid and GPx antioxidant enzyme",
    ],
    bioavailabilityNotes: "The high oleic:linoleic ratio provides MUFA stability. Vitamin E present as alpha-tocopherol protects PUFAs from oxidation in storage.",
    sourceReferences: ["Samuolienė et al. (2012) J Sci Food Agric", "USDA FoodData Central"],
    dataConfidence: "medium",
  },

  // ── 10. Broccoli Sprouts ─────────────────────────────────────
  {
    uid: "spr-broccoli",
    nameEn: "Broccoli Sprouts",
    nameAmharic: "የበቀለ ብሮኮሊ",
    scientificName: "Brassica oleracea var. italica",
    category: "Sprout",
    partUsed: "3-day cotyledon sprouts",
    processingState: "sprouted",
    basis: "per 100 g fresh sprouts",
    proximate: {
      energyKcal: 28, moisture_g: 91.0, protein_g: 2.85,
      fat_g: 0.35, carbohydrate_g: 4.98, dietaryFiber_g: 1.6, ash_g: 0.82,
    },
    minerals: {
      calcium_mg: 47, phosphorus_mg: 74, magnesium_mg: 22,
      potassium_mg: 185, sodium_mg: 30, sulfur_mg: 285,
      iron_mg: 0.84, zinc_mg: 0.40, copper_mg: 0.04,
      manganese_mg: 0.22, selenium_mcg: 1.6, boron_mcg: 180,
    },
    vitamins: {
      vitaminA_retinolEquiv_mcg: 31, betaCarotene_mcg: 371,
      vitaminB1_thiamine_mg: 0.07, vitaminB2_riboflavin_mg: 0.08,
      vitaminB3_niacin_mg: 0.64, vitaminB6_pyridoxine_mg: 0.16,
      vitaminB9_folate_mcg: 108, vitaminC_ascorbicAcid_mg: 41.5,
      vitaminE_tocopherol_mg: 1.45, vitaminK_mcg: 102.4,
    },
    aminoAcids: {
      essential: {
        isoleucine: 4.1, leucine: 6.0, lysine: 5.8,
        methionine: 1.6, phenylalanine: 3.6, threonine: 3.5,
        tryptophan: 1.0, valine: 4.4, histidine: 2.2,
      },
      semiEssential: {
        arginine: 4.8, cysteine: 1.4, glycine: 3.6, proline: 2.9, tyrosine: 2.3,
      },
      nonEssential: {
        alanine: 4.0, asparagine: 4.8, aspartate: 9.0,
        glutamate: 14.5, glutamine: 3.2, serine: 3.5,
      },
      totalAminoAcidsMgPer100g: 2420,
      limitingAmino: "Methionine",
      aminoAcidScore: 80,
    },
    fattyAcids: {
      totalSaturatedG: 0.04, totalMonounsaturatedG: 0.03, totalPolyunsaturatedG: 0.17,
      cholesterol_mg: 0,
      alphaLinolenic_C18_3n3: 0.13, linoleic_C18_2n6: 0.04,
      omega3ToOmega6Ratio: "3:1",
    },
    phenolics: {
      totalPhenolicsMgGAE: 520, totalFlavonoidsMg: 210,
      quercetin_mg: 42, kaempferol_mg: 36,
      note: "Sulforaphane precursor glucoraphanin: ~800 mg/100g (100× mature broccoli florets). Myrosinase converts to sulforaphane on chewing.",
    },
    antinutrients: {
      goitrogens_mg: 22, oxalates_mg: 14,
      processingReduction: {
        method: "Eat raw; light steam preserves myrosinase",
        trypsinInhibitorReductionPct: 50,
      },
    },
    glycemicIndex: 10,
    functionalProperties: [
      "Highest dietary sulforaphane source — Nrf2 activator",
      "Outstanding vitamin K (102 mcg) for bone and vascular health",
      "Exceptional folate density for cellular methylation",
      "n-3/n-6 ratio of 3:1 — rare anti-inflammatory plant food",
    ],
    bioavailabilityNotes: "Glucoraphanin in broccoli sprouts (800 mg/100g) is 10–100× that of mature broccoli. Myrosinase enzyme intact in raw sprouts converts glucoraphanin → sulforaphane, the most potent known dietary Nrf2 activator.",
    sourceReferences: ["Fahey et al. (1997) Science", "Moreno et al. (2006) J Agric Food Chem", "USDA FoodData Central"],
    dataConfidence: "high",
  },
];
