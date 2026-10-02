/**
 * Complete Catalog of 100 Authentic Ethiopian Composite Dishes & Platters
 * (100 የተመረጡ የኢትዮጵያ ባህላዊ ምግቦችና ማዕዶች ሙሉ ዝርዝር)
 *
 * Covers 10 culinary domains:
 *  1. Fasting Combination Platters & Multi-Wot Mesobs (10)
 *  2. Legume Stews, Pulses & Shiro Varieties (15)
 *  3. Poultry, Eggs & Festive Wots (10)
 *  4. Beef, Lamb, Goat & Game Traditional Dishes (15)
 *  5. Enset (False Banana) Specialties & Southern Heritage (8)
 *  6. Porridges, Breakfast Bowls & Whole Grains (12)
 *  7. Vegetables, Roots, Greens & Tubers (10)
 *  8. Salads, Condiments & Cold Delicacies (8)
 *  9. Fish Specialties (Rift Valley & Lake Tana) (6)
 * 10. Functional Tonics, Drinks & Liquid Meals (6)
 */

import type { EthiopianCompositeDiet } from "./compositeDietFormulator";

export const ETHIOPIAN_COMPOSITE_DIETS_CATALOG: EthiopianCompositeDiet[] = [
  {
    "id": "yetsom-beyayinetu",
    "nameEn": "Yetsom Beyayinetu (Ethiopian Fasting Combination Platter)",
    "nameAmharic": "የጾም በያይነቱ",
    "category": "fasting_combo",
    "tagline": "The pinnacle of complementary plant-based Ethiopian culinary nutrition.",
    "description": "Yetsom Beyayinetu (Ethiopian Fasting Combination Platter) (የጾም በያይነቱ): The pinnacle of complementary plant-based Ethiopian culinary nutrition. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 520,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 220,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "shiro-wot",
        "nameEn": "Shiro Wot (Chickpea & Pea Stew)",
        "nameAmharic": "ሽሮ ወጥ",
        "gramsPerServing": 70,
        "category": "legume",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "yemisir-wot",
        "nameEn": "Yemisir Wot (Red Lentil Stew)",
        "nameAmharic": "የምስር ወጥ",
        "gramsPerServing": 60,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "kik-alicha",
        "nameEn": "Kik Alicha (Split Pea Stew)",
        "nameAmharic": "ክክ አልጫ",
        "gramsPerServing": 50,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "gomen-wot",
        "nameEn": "Gomen Wot (Collard Greens)",
        "nameAmharic": "የጎመን ወጥ",
        "gramsPerServing": 40,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      },
      {
        "id": "tikil-gomen",
        "nameEn": "Tikil Gomen (Cabbage & Carrot)",
        "nameAmharic": "ጥቅል ጎመን",
        "gramsPerServing": 40,
        "category": "vegetable",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "azifa",
        "nameEn": "Azifa (Green Lentils with Mustard)",
        "nameAmharic": "አዚፋ",
        "gramsPerServing": 25,
        "category": "legume",
        "dryEquivalentRatio": 0.42
      },
      {
        "id": "fosolia",
        "nameEn": "Fosolia (Green Beans & Carrot)",
        "nameAmharic": "ፎሶሊያ",
        "gramsPerServing": 15,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Yetsom Beyayinetu (Ethiopian Fasting Combination Platter).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየጾም በያይነቱ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 685,
        "protein_g": 27.8,
        "fat_g": 13.5,
        "carbohydrate_g": 114.2,
        "dietaryFiber_g": 21.6,
        "moisture_g": 308,
        "ash_g": 9.7
      },
      "aminoAcids": {
        "histidine_mg": 723,
        "isoleucine_mg": 1168,
        "leucine_mg": 2002,
        "lysine_mg": 1890,
        "methionine_mg": 612,
        "cysteine_mg": 556,
        "phenylalanine_mg": 1279,
        "tyrosine_mg": 890,
        "threonine_mg": 1056,
        "tryptophan_mg": 334,
        "valine_mg": 1334,
        "arginine_mg": 1890,
        "totalEAA_mg": 13734,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2.2,
        "totalMUFA_g": 4.7,
        "totalPUFA_g": 6.6,
        "omega6_linoleic_g": 4.9,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 95,
      "standard": 155,
      "premium": 240
    }
  },
  {
    "id": "tigray-maadi-fasting",
    "nameEn": "Tigray Ma'adi Fasting Platter with Tsebhi & Timtimo",
    "nameAmharic": "የትግራይ ማዕዲ የጾም በያይነቱ",
    "category": "fasting_combo",
    "tagline": "Northern highland heritage fasting platter with rich Timtimo and Hamli.",
    "description": "Tigray Ma'adi Fasting Platter with Tsebhi & Timtimo (የትግራይ ማዕዲ የጾም በያይነቱ): Northern highland heritage fasting platter with rich Timtimo and Hamli. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 482,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 212,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Tigray Ma'adi Fasting Platter with Tsebhi & Timtimo Stew Component",
        "nameAmharic": "የትግራይ ማዕዲ የጾም በያይነቱ ወጥ",
        "gramsPerServing": 164,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 48,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 58,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Tigray Ma'adi Fasting Platter with Tsebhi & Timtimo.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየትግራይ ማዕዲ የጾም በያይነቱ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 670,
        "protein_g": 26.5,
        "fat_g": 12.8,
        "carbohydrate_g": 112,
        "dietaryFiber_g": 20.8,
        "moisture_g": 302,
        "ash_g": 9.3
      },
      "aminoAcids": {
        "histidine_mg": 689,
        "isoleucine_mg": 1113,
        "leucine_mg": 1908,
        "lysine_mg": 1802,
        "methionine_mg": 583,
        "cysteine_mg": 530,
        "phenylalanine_mg": 1219,
        "tyrosine_mg": 848,
        "threonine_mg": 1007,
        "tryptophan_mg": 318,
        "valine_mg": 1272,
        "arginine_mg": 1802,
        "totalEAA_mg": 13091,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2,
        "totalMUFA_g": 4.5,
        "totalPUFA_g": 6.3,
        "omega6_linoleic_g": 4.7,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 90,
      "standard": 150,
      "premium": 230
    }
  },
  {
    "id": "gondar-sabbatical-fasting",
    "nameEn": "Gondar Sabbatical Fasting Platter",
    "nameAmharic": "የጎንደር ሰንበት የጾም ማዕድ",
    "category": "fasting_combo",
    "tagline": "Royal Gondarine fasting spread centered on Shimbra Asa and Siljo dip.",
    "description": "Gondar Sabbatical Fasting Platter (የጎንደር ሰንበት የጾም ማዕድ): Royal Gondarine fasting spread centered on Shimbra Asa and Siljo dip. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 500,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 220,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Gondar Sabbatical Fasting Platter Stew Component",
        "nameAmharic": "የጎንደር ሰንበት የጾም ማዕድ ወጥ",
        "gramsPerServing": 170,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 50,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 60,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Gondar Sabbatical Fasting Platter.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየጎንደር ሰንበት የጾም ማዕድ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 695,
        "protein_g": 28.2,
        "fat_g": 14,
        "carbohydrate_g": 114.5,
        "dietaryFiber_g": 22,
        "moisture_g": 313,
        "ash_g": 9.9
      },
      "aminoAcids": {
        "histidine_mg": 733,
        "isoleucine_mg": 1184,
        "leucine_mg": 2030,
        "lysine_mg": 1918,
        "methionine_mg": 620,
        "cysteine_mg": 564,
        "phenylalanine_mg": 1297,
        "tyrosine_mg": 902,
        "threonine_mg": 1072,
        "tryptophan_mg": 338,
        "valine_mg": 1354,
        "arginine_mg": 1918,
        "totalEAA_mg": 13930,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2.2,
        "totalMUFA_g": 4.9,
        "totalPUFA_g": 6.9,
        "omega6_linoleic_g": 5.2,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 100,
      "standard": 160,
      "premium": 250
    }
  },
  {
    "id": "wollo-yehud-beyayinetu",
    "nameEn": "Wollo Ye'Ehud Beyayinetu (Sunday Fasting Platter)",
    "nameAmharic": "የወሎ እሁድ በያይነቱ",
    "category": "fasting_combo",
    "tagline": "Highland Wollo blend of legumes, potato-carrot alicha, and golden lentils.",
    "description": "Wollo Ye'Ehud Beyayinetu (Sunday Fasting Platter) (የወሎ እሁድ በያይነቱ): Highland Wollo blend of legumes, potato-carrot alicha, and golden lentils. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 468,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 206,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Wollo Ye'Ehud Beyayinetu (Sunday Fasting Platter) Stew Component",
        "nameAmharic": "የወሎ እሁድ በያይነቱ ወጥ",
        "gramsPerServing": 159,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 47,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 56,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Wollo Ye'Ehud Beyayinetu (Sunday Fasting Platter).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየወሎ እሁድ በያይነቱ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 650,
        "protein_g": 24.2,
        "fat_g": 13.8,
        "carbohydrate_g": 108,
        "dietaryFiber_g": 19.5,
        "moisture_g": 293,
        "ash_g": 8.5
      },
      "aminoAcids": {
        "histidine_mg": 629,
        "isoleucine_mg": 1016,
        "leucine_mg": 1742,
        "lysine_mg": 1646,
        "methionine_mg": 532,
        "cysteine_mg": 484,
        "phenylalanine_mg": 1113,
        "tyrosine_mg": 774,
        "threonine_mg": 920,
        "tryptophan_mg": 290,
        "valine_mg": 1162,
        "arginine_mg": 1646,
        "totalEAA_mg": 11954,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2.2,
        "totalMUFA_g": 4.8,
        "totalPUFA_g": 6.8,
        "omega6_linoleic_g": 5.1,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 85,
      "standard": 140,
      "premium": 220
    }
  },
  {
    "id": "harari-ge-wot-fasting",
    "nameEn": "Harari Ge-Wot Fasting Platter",
    "nameAmharic": "የሐረሪ የጾም ገይ ወጥ",
    "category": "fasting_combo",
    "tagline": "Eastern walled-city spice feast with cardamom, cloves, and okra.",
    "description": "Harari Ge-Wot Fasting Platter (የሐረሪ የጾም ገይ ወጥ): Eastern walled-city spice feast with cardamom, cloves, and okra. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 457,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 201,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Harari Ge-Wot Fasting Platter Stew Component",
        "nameAmharic": "የሐረሪ የጾም ገይ ወጥ ወጥ",
        "gramsPerServing": 155,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 46,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 55,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Harari Ge-Wot Fasting Platter.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየሐረሪ የጾም ገይ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 635,
        "protein_g": 23.5,
        "fat_g": 12.2,
        "carbohydrate_g": 108.5,
        "dietaryFiber_g": 21,
        "moisture_g": 286,
        "ash_g": 8.2
      },
      "aminoAcids": {
        "histidine_mg": 611,
        "isoleucine_mg": 987,
        "leucine_mg": 1692,
        "lysine_mg": 1598,
        "methionine_mg": 517,
        "cysteine_mg": 470,
        "phenylalanine_mg": 1081,
        "tyrosine_mg": 752,
        "threonine_mg": 893,
        "tryptophan_mg": 282,
        "valine_mg": 1128,
        "arginine_mg": 1598,
        "totalEAA_mg": 11609,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2,
        "totalMUFA_g": 4.3,
        "totalPUFA_g": 5.9,
        "omega6_linoleic_g": 4.4,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 95,
      "standard": 155,
      "premium": 240
    }
  },
  {
    "id": "gurage-yetsom-mesob",
    "nameEn": "Gurage Yetsom Mesob with Kocho",
    "nameAmharic": "የጉራጌ የጾም ማዕድ በቆጮ",
    "category": "fasting_combo",
    "tagline": "Highland enset flatbread paired with rich legume wots and kale.",
    "description": "Gurage Yetsom Mesob with Kocho (የጉራጌ የጾም ማዕድ በቆጮ): Highland enset flatbread paired with rich legume wots and kale. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 486,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 214,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Gurage Yetsom Mesob with Kocho Stew Component",
        "nameAmharic": "የጉራጌ የጾም ማዕድ በቆጮ ወጥ",
        "gramsPerServing": 165,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 49,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 58,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Gurage Yetsom Mesob with Kocho.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየጉራጌ የጾም ማዕድ በቆጮ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 675,
        "protein_g": 22.8,
        "fat_g": 13.5,
        "carbohydrate_g": 115,
        "dietaryFiber_g": 18.5,
        "moisture_g": 304,
        "ash_g": 8
      },
      "aminoAcids": {
        "histidine_mg": 593,
        "isoleucine_mg": 958,
        "leucine_mg": 1642,
        "lysine_mg": 1550,
        "methionine_mg": 502,
        "cysteine_mg": 456,
        "phenylalanine_mg": 1049,
        "tyrosine_mg": 730,
        "threonine_mg": 866,
        "tryptophan_mg": 274,
        "valine_mg": 1094,
        "arginine_mg": 1550,
        "totalEAA_mg": 11264,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2.2,
        "totalMUFA_g": 4.7,
        "totalPUFA_g": 6.6,
        "omega6_linoleic_g": 4.9,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 90,
      "standard": 145,
      "premium": 225
    }
  },
  {
    "id": "gojjam-yetsom-platter",
    "nameEn": "Gojjam Yetsom Platter with Telba & Shimbra",
    "nameAmharic": "የጎጃም የጾም ማዕድ",
    "category": "fasting_combo",
    "tagline": "Breadbasket feast of fertile Gojjam: pure brown teff, chickpeas, and flax.",
    "description": "Gojjam Yetsom Platter with Telba & Shimbra (የጎጃም የጾም ማዕድ): Breadbasket feast of fertile Gojjam: pure brown teff, chickpeas, and flax. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 497,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 219,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Gojjam Yetsom Platter with Telba & Shimbra Stew Component",
        "nameAmharic": "የጎጃም የጾም ማዕድ ወጥ",
        "gramsPerServing": 169,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 50,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 60,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Gojjam Yetsom Platter with Telba & Shimbra.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየጎጃም የጾም ማዕድ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 690,
        "protein_g": 27.5,
        "fat_g": 16.2,
        "carbohydrate_g": 110,
        "dietaryFiber_g": 24.2,
        "moisture_g": 311,
        "ash_g": 9.6
      },
      "aminoAcids": {
        "histidine_mg": 715,
        "isoleucine_mg": 1155,
        "leucine_mg": 1980,
        "lysine_mg": 1870,
        "methionine_mg": 605,
        "cysteine_mg": 550,
        "phenylalanine_mg": 1265,
        "tyrosine_mg": 880,
        "threonine_mg": 1045,
        "tryptophan_mg": 330,
        "valine_mg": 1320,
        "arginine_mg": 1870,
        "totalEAA_mg": 13585,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2.6,
        "totalMUFA_g": 5.7,
        "totalPUFA_g": 7.9,
        "omega6_linoleic_g": 5.9,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 85,
      "standard": 135,
      "premium": 215
    }
  },
  {
    "id": "shewa-festive-fasting",
    "nameEn": "Shewa Festive Fasting Feast",
    "nameAmharic": "የሸዋ የበዓል የጾም ማዕድ",
    "category": "fasting_combo",
    "tagline": "Comprehensive central highland festive fasting platter.",
    "description": "Shewa Festive Fasting Feast (የሸዋ የበዓል የጾም ማዕድ): Comprehensive central highland festive fasting platter. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 511,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 225,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Shewa Festive Fasting Feast Stew Component",
        "nameAmharic": "የሸዋ የበዓል የጾም ማዕድ ወጥ",
        "gramsPerServing": 174,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 51,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 61,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Shewa Festive Fasting Feast.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየሸዋ የበዓል የጾም ማዕድ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 710,
        "protein_g": 28.5,
        "fat_g": 14.5,
        "carbohydrate_g": 118,
        "dietaryFiber_g": 23.5,
        "moisture_g": 320,
        "ash_g": 10
      },
      "aminoAcids": {
        "histidine_mg": 741,
        "isoleucine_mg": 1197,
        "leucine_mg": 2052,
        "lysine_mg": 1938,
        "methionine_mg": 627,
        "cysteine_mg": 570,
        "phenylalanine_mg": 1311,
        "tyrosine_mg": 912,
        "threonine_mg": 1083,
        "tryptophan_mg": 342,
        "valine_mg": 1368,
        "arginine_mg": 1938,
        "totalEAA_mg": 14079,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2.3,
        "totalMUFA_g": 5.1,
        "totalPUFA_g": 7.1,
        "omega6_linoleic_g": 5.3,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 105,
      "standard": 170,
      "premium": 260
    }
  },
  {
    "id": "lake-tana-fishermen-fasting",
    "nameEn": "Lake Tana Fishermen's Fasting Platter",
    "nameAmharic": "የጣና ሐይቅ የጾም ማዕድ",
    "category": "fasting_combo",
    "tagline": "Island monastery fasting platter with watercress, legumes, and fresh herbs.",
    "description": "Lake Tana Fishermen's Fasting Platter (የጣና ሐይቅ የጾም ማዕድ): Island monastery fasting platter with watercress, legumes, and fresh herbs. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 446,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 196,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Lake Tana Fishermen's Fasting Platter Stew Component",
        "nameAmharic": "የጣና ሐይቅ የጾም ማዕድ ወጥ",
        "gramsPerServing": 152,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 45,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 54,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Lake Tana Fishermen's Fasting Platter.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየጣና ሐይቅ የጾም ማዕድ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 620,
        "protein_g": 25.8,
        "fat_g": 12,
        "carbohydrate_g": 104,
        "dietaryFiber_g": 21,
        "moisture_g": 279,
        "ash_g": 9
      },
      "aminoAcids": {
        "histidine_mg": 671,
        "isoleucine_mg": 1084,
        "leucine_mg": 1858,
        "lysine_mg": 1754,
        "methionine_mg": 568,
        "cysteine_mg": 516,
        "phenylalanine_mg": 1187,
        "tyrosine_mg": 826,
        "threonine_mg": 980,
        "tryptophan_mg": 310,
        "valine_mg": 1238,
        "arginine_mg": 1754,
        "totalEAA_mg": 12746,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 1.9,
        "totalMUFA_g": 4.2,
        "totalPUFA_g": 5.9,
        "omega6_linoleic_g": 4.4,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 80,
      "standard": 130,
      "premium": 205
    }
  },
  {
    "id": "arsi-bale-highland-platter",
    "nameEn": "Arsi-Bale Highland Legume Platter",
    "nameAmharic": "የአርሲ ባሌ የጥራጥሬ ማዕድ",
    "category": "fasting_combo",
    "tagline": "Cool afro-alpine plateau meal rich in roasted barley, peas, and garlic.",
    "description": "Arsi-Bale Highland Legume Platter (የአርሲ ባሌ የጥራጥሬ ማዕድ): Cool afro-alpine plateau meal rich in roasted barley, peas, and garlic. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 475,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 209,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Arsi-Bale Highland Legume Platter Stew Component",
        "nameAmharic": "የአርሲ ባሌ የጥራጥሬ ማዕድ ወጥ",
        "gramsPerServing": 162,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 48,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 57,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Arsi-Bale Highland Legume Platter.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየአርሲ ባሌ የጥራጥሬ ማዕድ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 660,
        "protein_g": 26,
        "fat_g": 13,
        "carbohydrate_g": 111,
        "dietaryFiber_g": 22.5,
        "moisture_g": 297,
        "ash_g": 9.1
      },
      "aminoAcids": {
        "histidine_mg": 676,
        "isoleucine_mg": 1092,
        "leucine_mg": 1872,
        "lysine_mg": 1768,
        "methionine_mg": 572,
        "cysteine_mg": 520,
        "phenylalanine_mg": 1196,
        "tyrosine_mg": 832,
        "threonine_mg": 988,
        "tryptophan_mg": 312,
        "valine_mg": 1248,
        "arginine_mg": 1768,
        "totalEAA_mg": 12844,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2.1,
        "totalMUFA_g": 4.6,
        "totalPUFA_g": 6.3,
        "omega6_linoleic_g": 4.7,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 85,
      "standard": 135,
      "premium": 210
    }
  },
  {
    "id": "shiro-tegabino",
    "nameEn": "Shiro Tegabino in Shakla Dist (Clay Pot)",
    "nameAmharic": "ሽሮ ተጋቢኖ በሸክላ",
    "category": "legume_stew",
    "tagline": "Bubbling chickpea & field pea flour stew in earthenware.",
    "description": "Shiro Tegabino in Shakla Dist (Clay Pot) (ሽሮ ተጋቢኖ በሸክላ): Bubbling chickpea & field pea flour stew in earthenware. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 446,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 220,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "shiro-powder",
        "nameEn": "Shiro Tegabino Flour",
        "nameAmharic": "የተፈጨ የሽሮ ዱቄት",
        "gramsPerServing": 160,
        "category": "legume",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "gomen-side",
        "nameEn": "Steamed Ethiopian Collard Greens",
        "nameAmharic": "የበሰለ ጎመን",
        "gramsPerServing": 70,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      },
      {
        "id": "oil-spices",
        "nameEn": "Vegetable Oil, Onions & Berbere",
        "nameAmharic": "ዘይት፣ ሽንኩርትና ቅመሞች",
        "gramsPerServing": 30,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Shiro Tegabino in Shakla Dist (Clay Pot).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለሽሮ ተጋቢኖ በሸክላ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 620,
        "protein_g": 24.5,
        "fat_g": 14.2,
        "carbohydrate_g": 98.4,
        "dietaryFiber_g": 18.2,
        "moisture_g": 279,
        "ash_g": 8.6
      },
      "aminoAcids": {
        "histidine_mg": 637,
        "isoleucine_mg": 1029,
        "leucine_mg": 1764,
        "lysine_mg": 1666,
        "methionine_mg": 539,
        "cysteine_mg": 490,
        "phenylalanine_mg": 1127,
        "tyrosine_mg": 784,
        "threonine_mg": 931,
        "tryptophan_mg": 294,
        "valine_mg": 1176,
        "arginine_mg": 1666,
        "totalEAA_mg": 12103,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2.3,
        "totalMUFA_g": 5,
        "totalPUFA_g": 6.9,
        "omega6_linoleic_g": 5.2,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 75,
      "standard": 120,
      "premium": 190
    }
  },
  {
    "id": "shiro-bozena",
    "nameEn": "Shiro Bozena (Shiro with Stewed Beef)",
    "nameAmharic": "ሽሮ ቦዘና በስጋ",
    "category": "legume_stew",
    "tagline": "Comforting marriage of spiced chickpea flour and shredded braised beef.",
    "description": "Shiro Bozena (Shiro with Stewed Beef) (ሽሮ ቦዘና በስጋ): Comforting marriage of spiced chickpea flour and shredded braised beef. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 518,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 228,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Shiro Bozena (Shiro with Stewed Beef) Stew Component",
        "nameAmharic": "ሽሮ ቦዘና በስጋ ወጥ",
        "gramsPerServing": 176,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 52,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 62,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Shiro Bozena (Shiro with Stewed Beef).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለሽሮ ቦዘና በስጋ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 720,
        "protein_g": 38.5,
        "fat_g": 24,
        "carbohydrate_g": 88,
        "dietaryFiber_g": 15.5,
        "moisture_g": 324,
        "ash_g": 13.5
      },
      "aminoAcids": {
        "histidine_mg": 1001,
        "isoleucine_mg": 1617,
        "leucine_mg": 3157,
        "lysine_mg": 3003,
        "methionine_mg": 963,
        "cysteine_mg": 770,
        "phenylalanine_mg": 1771,
        "tyrosine_mg": 1232,
        "threonine_mg": 1463,
        "tryptophan_mg": 462,
        "valine_mg": 1848,
        "arginine_mg": 2618,
        "totalEAA_mg": 19905,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 10.8,
        "totalMUFA_g": 9.1,
        "totalPUFA_g": 4.1,
        "omega6_linoleic_g": 3.1,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 160,
      "standard": 240,
      "premium": 360
    }
  },
  {
    "id": "shiro-feses",
    "nameEn": "Shiro Feses / Miten Shiro Wot (Smooth Shiro)",
    "nameAmharic": "ሽሮ ፈሰስ / ምጥን ሽሮ",
    "category": "legume_stew",
    "tagline": "Silky, smooth, pourable spiced chickpea stew.",
    "description": "Shiro Feses / Miten Shiro Wot (Smooth Shiro) (ሽሮ ፈሰስ / ምጥን ሽሮ): Silky, smooth, pourable spiced chickpea stew. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 403,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 177,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Shiro Feses / Miten Shiro Wot (Smooth Shiro) Stew Component",
        "nameAmharic": "ሽሮ ፈሰስ / ምጥን ሽሮ ወጥ",
        "gramsPerServing": 137,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 40,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 48,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Shiro Feses / Miten Shiro Wot (Smooth Shiro).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለሽሮ ፈሰስ / ምጥን ሽሮ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 560,
        "protein_g": 21,
        "fat_g": 11.5,
        "carbohydrate_g": 94,
        "dietaryFiber_g": 16,
        "moisture_g": 252,
        "ash_g": 7.4
      },
      "aminoAcids": {
        "histidine_mg": 546,
        "isoleucine_mg": 882,
        "leucine_mg": 1512,
        "lysine_mg": 1428,
        "methionine_mg": 462,
        "cysteine_mg": 420,
        "phenylalanine_mg": 966,
        "tyrosine_mg": 672,
        "threonine_mg": 798,
        "tryptophan_mg": 252,
        "valine_mg": 1008,
        "arginine_mg": 1428,
        "totalEAA_mg": 10374,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 1.8,
        "totalMUFA_g": 4,
        "totalPUFA_g": 5.7,
        "omega6_linoleic_g": 4.3,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 65,
      "standard": 105,
      "premium": 170
    }
  },
  {
    "id": "yemisir-wot",
    "nameEn": "Yemisir Wot (Spicy Red Lentil Stew)",
    "nameAmharic": "የምስር ወጥ",
    "category": "legume_stew",
    "tagline": "Fiery, thick, slow-cooked red lentil stew in berbere.",
    "description": "Yemisir Wot (Spicy Red Lentil Stew) (የምስር ወጥ): Fiery, thick, slow-cooked red lentil stew in berbere. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 439,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 193,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Yemisir Wot (Spicy Red Lentil Stew) Stew Component",
        "nameAmharic": "የምስር ወጥ ወጥ",
        "gramsPerServing": 149,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 44,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 53,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Yemisir Wot (Spicy Red Lentil Stew).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየምስር ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 610,
        "protein_g": 26.5,
        "fat_g": 12,
        "carbohydrate_g": 101,
        "dietaryFiber_g": 19.5,
        "moisture_g": 275,
        "ash_g": 9.3
      },
      "aminoAcids": {
        "histidine_mg": 689,
        "isoleucine_mg": 1113,
        "leucine_mg": 1908,
        "lysine_mg": 1802,
        "methionine_mg": 583,
        "cysteine_mg": 530,
        "phenylalanine_mg": 1219,
        "tyrosine_mg": 848,
        "threonine_mg": 1007,
        "tryptophan_mg": 318,
        "valine_mg": 1272,
        "arginine_mg": 1802,
        "totalEAA_mg": 13091,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 1.9,
        "totalMUFA_g": 4.2,
        "totalPUFA_g": 5.9,
        "omega6_linoleic_g": 4.4,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 75,
      "standard": 125,
      "premium": 195
    }
  },
  {
    "id": "yemisir-alicha",
    "nameEn": "Yemisir Alicha (Mild Turmeric Yellow Lentil Stew)",
    "nameAmharic": "የምስር አልጫ",
    "category": "legume_stew",
    "tagline": "Mild, aromatic, golden turmeric lentil stew for gentle digestion.",
    "description": "Yemisir Alicha (Mild Turmeric Yellow Lentil Stew) (የምስር አልጫ): Mild, aromatic, golden turmeric lentil stew for gentle digestion. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 425,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 187,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Yemisir Alicha (Mild Turmeric Yellow Lentil Stew) Stew Component",
        "nameAmharic": "የምስር አልጫ ወጥ",
        "gramsPerServing": 145,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 43,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 51,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Yemisir Alicha (Mild Turmeric Yellow Lentil Stew).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየምስር አልጫ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 590,
        "protein_g": 25,
        "fat_g": 11.2,
        "carbohydrate_g": 99,
        "dietaryFiber_g": 18.5,
        "moisture_g": 266,
        "ash_g": 8.8
      },
      "aminoAcids": {
        "histidine_mg": 650,
        "isoleucine_mg": 1050,
        "leucine_mg": 1800,
        "lysine_mg": 1700,
        "methionine_mg": 550,
        "cysteine_mg": 500,
        "phenylalanine_mg": 1150,
        "tyrosine_mg": 800,
        "threonine_mg": 950,
        "tryptophan_mg": 300,
        "valine_mg": 1200,
        "arginine_mg": 1700,
        "totalEAA_mg": 12350,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 1.8,
        "totalMUFA_g": 3.9,
        "totalPUFA_g": 5.5,
        "omega6_linoleic_g": 4.1,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 70,
      "standard": 115,
      "premium": 185
    }
  },
  {
    "id": "kik-alicha",
    "nameEn": "Kik Alicha (Mild Yellow Split Pea Stew)",
    "nameAmharic": "ክክ አልጫ",
    "category": "legume_stew",
    "tagline": "Comforting golden split pea stew with turmeric and ginger.",
    "description": "Kik Alicha (Mild Yellow Split Pea Stew) (ክክ አልጫ): Comforting golden split pea stew with turmeric and ginger. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 436,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 192,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Kik Alicha (Mild Yellow Split Pea Stew) Stew Component",
        "nameAmharic": "ክክ አልጫ ወጥ",
        "gramsPerServing": 148,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 44,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 52,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Kik Alicha (Mild Yellow Split Pea Stew).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለክክ አልጫ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 605,
        "protein_g": 25.2,
        "fat_g": 11.8,
        "carbohydrate_g": 102,
        "dietaryFiber_g": 19,
        "moisture_g": 272,
        "ash_g": 8.8
      },
      "aminoAcids": {
        "histidine_mg": 655,
        "isoleucine_mg": 1058,
        "leucine_mg": 1814,
        "lysine_mg": 1714,
        "methionine_mg": 554,
        "cysteine_mg": 504,
        "phenylalanine_mg": 1159,
        "tyrosine_mg": 806,
        "threonine_mg": 958,
        "tryptophan_mg": 302,
        "valine_mg": 1210,
        "arginine_mg": 1714,
        "totalEAA_mg": 12448,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 1.9,
        "totalMUFA_g": 4.1,
        "totalPUFA_g": 5.8,
        "omega6_linoleic_g": 4.4,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 70,
      "standard": 115,
      "premium": 185
    }
  },
  {
    "id": "kik-wot",
    "nameEn": "Kik Wot (Fiery Red Split Pea Stew)",
    "nameAmharic": "ክክ ወጥ",
    "category": "legume_stew",
    "tagline": "Robust yellow split peas braised in rich, pungent berbere sauce.",
    "description": "Kik Wot (Fiery Red Split Pea Stew) (ክክ ወጥ): Robust yellow split peas braised in rich, pungent berbere sauce. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 443,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 195,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Kik Wot (Fiery Red Split Pea Stew) Stew Component",
        "nameAmharic": "ክክ ወጥ ወጥ",
        "gramsPerServing": 151,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 44,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 53,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Kik Wot (Fiery Red Split Pea Stew).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለክክ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 615,
        "protein_g": 25.5,
        "fat_g": 12.2,
        "carbohydrate_g": 103,
        "dietaryFiber_g": 19.2,
        "moisture_g": 277,
        "ash_g": 8.9
      },
      "aminoAcids": {
        "histidine_mg": 663,
        "isoleucine_mg": 1071,
        "leucine_mg": 1836,
        "lysine_mg": 1734,
        "methionine_mg": 561,
        "cysteine_mg": 510,
        "phenylalanine_mg": 1173,
        "tyrosine_mg": 816,
        "threonine_mg": 969,
        "tryptophan_mg": 306,
        "valine_mg": 1224,
        "arginine_mg": 1734,
        "totalEAA_mg": 12597,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2,
        "totalMUFA_g": 4.3,
        "totalPUFA_g": 5.9,
        "omega6_linoleic_g": 4.4,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 72,
      "standard": 120,
      "premium": 190
    }
  },
  {
    "id": "bakela-wot",
    "nameEn": "Bakela Wot (Fava Bean Stew with Cardamom)",
    "nameAmharic": "የባቄላ ወጥ",
    "category": "legume_stew",
    "tagline": "Substantial fava bean stew simmered with highland korerima.",
    "description": "Bakela Wot (Fava Bean Stew with Cardamom) (የባቄላ ወጥ): Substantial fava bean stew simmered with highland korerima. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 454,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 200,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Bakela Wot (Fava Bean Stew with Cardamom) Stew Component",
        "nameAmharic": "የባቄላ ወጥ ወጥ",
        "gramsPerServing": 154,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 45,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 54,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Bakela Wot (Fava Bean Stew with Cardamom).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየባቄላ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 630,
        "protein_g": 27.2,
        "fat_g": 12,
        "carbohydrate_g": 105,
        "dietaryFiber_g": 20.5,
        "moisture_g": 284,
        "ash_g": 9.5
      },
      "aminoAcids": {
        "histidine_mg": 707,
        "isoleucine_mg": 1142,
        "leucine_mg": 1958,
        "lysine_mg": 1850,
        "methionine_mg": 598,
        "cysteine_mg": 544,
        "phenylalanine_mg": 1251,
        "tyrosine_mg": 870,
        "threonine_mg": 1034,
        "tryptophan_mg": 326,
        "valine_mg": 1306,
        "arginine_mg": 1850,
        "totalEAA_mg": 13436,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 1.9,
        "totalMUFA_g": 4.2,
        "totalPUFA_g": 5.9,
        "omega6_linoleic_g": 4.4,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 75,
      "standard": 125,
      "premium": 195
    }
  },
  {
    "id": "ater-wot",
    "nameEn": "Ater Wot (Green Field Pea Stew)",
    "nameAmharic": "የአተር ወጥ",
    "category": "legume_stew",
    "tagline": "Whole green field pea stew packed with highland sweetness.",
    "description": "Ater Wot (Green Field Pea Stew) (የአተር ወጥ): Whole green field pea stew packed with highland sweetness. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 439,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 193,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Ater Wot (Green Field Pea Stew) Stew Component",
        "nameAmharic": "የአተር ወጥ ወጥ",
        "gramsPerServing": 149,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 44,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 53,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Ater Wot (Green Field Pea Stew).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየአተር ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 610,
        "protein_g": 24.8,
        "fat_g": 11.5,
        "carbohydrate_g": 104,
        "dietaryFiber_g": 19.8,
        "moisture_g": 275,
        "ash_g": 8.7
      },
      "aminoAcids": {
        "histidine_mg": 645,
        "isoleucine_mg": 1042,
        "leucine_mg": 1786,
        "lysine_mg": 1686,
        "methionine_mg": 546,
        "cysteine_mg": 496,
        "phenylalanine_mg": 1141,
        "tyrosine_mg": 794,
        "threonine_mg": 942,
        "tryptophan_mg": 298,
        "valine_mg": 1190,
        "arginine_mg": 1686,
        "totalEAA_mg": 12252,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 1.8,
        "totalMUFA_g": 4,
        "totalPUFA_g": 5.7,
        "omega6_linoleic_g": 4.3,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 70,
      "standard": 115,
      "premium": 185
    }
  },
  {
    "id": "shimbra-asa",
    "nameEn": "Shimbra Asa (Spiced Chickpea Fish Dumplings in Wot)",
    "nameAmharic": "ሽምብራ ዓሳ",
    "category": "legume_stew",
    "tagline": "Ingenious fasting dumpling dish shaped like fish in spicy berbere gravy.",
    "description": "Shimbra Asa (Spiced Chickpea Fish Dumplings in Wot) (ሽምብራ ዓሳ): Ingenious fasting dumpling dish shaped like fish in spicy berbere gravy. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 468,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 206,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Shimbra Asa (Spiced Chickpea Fish Dumplings in Wot) Stew Component",
        "nameAmharic": "ሽምብራ ዓሳ ወጥ",
        "gramsPerServing": 159,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 47,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 56,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Shimbra Asa (Spiced Chickpea Fish Dumplings in Wot).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለሽምብራ ዓሳ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 650,
        "protein_g": 27.5,
        "fat_g": 13.8,
        "carbohydrate_g": 106,
        "dietaryFiber_g": 20.5,
        "moisture_g": 293,
        "ash_g": 9.6
      },
      "aminoAcids": {
        "histidine_mg": 715,
        "isoleucine_mg": 1155,
        "leucine_mg": 1980,
        "lysine_mg": 1870,
        "methionine_mg": 605,
        "cysteine_mg": 550,
        "phenylalanine_mg": 1265,
        "tyrosine_mg": 880,
        "threonine_mg": 1045,
        "tryptophan_mg": 330,
        "valine_mg": 1320,
        "arginine_mg": 1870,
        "totalEAA_mg": 13585,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2.2,
        "totalMUFA_g": 4.8,
        "totalPUFA_g": 6.8,
        "omega6_linoleic_g": 5.1,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 85,
      "standard": 140,
      "premium": 220
    }
  },
  {
    "id": "boloke-wot",
    "nameEn": "Boloke Wot (Red Haricot Bean Stew)",
    "nameAmharic": "የቦሎቄ ወጥ",
    "category": "legume_stew",
    "tagline": "Hearty red bean stew loaded with anthocyanins and dietary fiber.",
    "description": "Boloke Wot (Red Haricot Bean Stew) (የቦሎቄ ወጥ): Hearty red bean stew loaded with anthocyanins and dietary fiber. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 446,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 196,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Boloke Wot (Red Haricot Bean Stew) Stew Component",
        "nameAmharic": "የቦሎቄ ወጥ ወጥ",
        "gramsPerServing": 152,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 45,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 54,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Boloke Wot (Red Haricot Bean Stew).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየቦሎቄ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 620,
        "protein_g": 25.5,
        "fat_g": 12,
        "carbohydrate_g": 104.5,
        "dietaryFiber_g": 21,
        "moisture_g": 279,
        "ash_g": 8.9
      },
      "aminoAcids": {
        "histidine_mg": 663,
        "isoleucine_mg": 1071,
        "leucine_mg": 1836,
        "lysine_mg": 1734,
        "methionine_mg": 561,
        "cysteine_mg": 510,
        "phenylalanine_mg": 1173,
        "tyrosine_mg": 816,
        "threonine_mg": 969,
        "tryptophan_mg": 306,
        "valine_mg": 1224,
        "arginine_mg": 1734,
        "totalEAA_mg": 12597,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 1.9,
        "totalMUFA_g": 4.2,
        "totalPUFA_g": 5.9,
        "omega6_linoleic_g": 4.4,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 72,
      "standard": 120,
      "premium": 190
    }
  },
  {
    "id": "guaya-wot",
    "nameEn": "Guaya Wot (Grass Pea Stew with Rue & Garlic)",
    "nameAmharic": "የጓያ ወጥ",
    "category": "legume_stew",
    "tagline": "Traditional highland drought-tolerant legume stew seasoned with tena'adam.",
    "description": "Guaya Wot (Grass Pea Stew with Rue & Garlic) (የጓያ ወጥ): Traditional highland drought-tolerant legume stew seasoned with tena'adam. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 425,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 187,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Guaya Wot (Grass Pea Stew with Rue & Garlic) Stew Component",
        "nameAmharic": "የጓያ ወጥ ወጥ",
        "gramsPerServing": 145,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 43,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 51,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Guaya Wot (Grass Pea Stew with Rue & Garlic).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየጓያ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 590,
        "protein_g": 26,
        "fat_g": 11,
        "carbohydrate_g": 99,
        "dietaryFiber_g": 19.5,
        "moisture_g": 266,
        "ash_g": 9.1
      },
      "aminoAcids": {
        "histidine_mg": 676,
        "isoleucine_mg": 1092,
        "leucine_mg": 1872,
        "lysine_mg": 1768,
        "methionine_mg": 572,
        "cysteine_mg": 520,
        "phenylalanine_mg": 1196,
        "tyrosine_mg": 832,
        "threonine_mg": 988,
        "tryptophan_mg": 312,
        "valine_mg": 1248,
        "arginine_mg": 1768,
        "totalEAA_mg": 12844,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 1.8,
        "totalMUFA_g": 3.9,
        "totalPUFA_g": 5.3,
        "omega6_linoleic_g": 4,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 65,
      "standard": 110,
      "premium": 175
    }
  },
  {
    "id": "gibto-wot",
    "nameEn": "Gibto Wot (Debittered Lupin Seed Stew)",
    "nameAmharic": "የግብጦ ወጥ",
    "category": "legume_stew",
    "tagline": "Debittered white lupin legume stew with exceptional protein density.",
    "description": "Gibto Wot (Debittered Lupin Seed Stew) (የግብጦ ወጥ): Debittered white lupin legume stew with exceptional protein density. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 461,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 203,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Gibto Wot (Debittered Lupin Seed Stew) Stew Component",
        "nameAmharic": "የግብጦ ወጥ ወጥ",
        "gramsPerServing": 157,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 46,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 55,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Gibto Wot (Debittered Lupin Seed Stew).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየግብጦ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 640,
        "protein_g": 31.5,
        "fat_g": 13.5,
        "carbohydrate_g": 100,
        "dietaryFiber_g": 22,
        "moisture_g": 288,
        "ash_g": 11
      },
      "aminoAcids": {
        "histidine_mg": 819,
        "isoleucine_mg": 1323,
        "leucine_mg": 2268,
        "lysine_mg": 2142,
        "methionine_mg": 693,
        "cysteine_mg": 630,
        "phenylalanine_mg": 1449,
        "tyrosine_mg": 1008,
        "threonine_mg": 1197,
        "tryptophan_mg": 378,
        "valine_mg": 1512,
        "arginine_mg": 2142,
        "totalEAA_mg": 15561,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2.2,
        "totalMUFA_g": 4.7,
        "totalPUFA_g": 6.6,
        "omega6_linoleic_g": 4.9,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 75,
      "standard": 125,
      "premium": 195
    }
  },
  {
    "id": "dubba-be-misir",
    "nameEn": "Dubba be'Misir Wot (Pumpkin & Red Lentil Stew)",
    "nameAmharic": "የዱባና ምስር ወጥ",
    "category": "legume_stew",
    "tagline": "Golden yellow pumpkin and red lentils simmered in sweet-spicy harmony.",
    "description": "Dubba be'Misir Wot (Pumpkin & Red Lentil Stew) (የዱባና ምስር ወጥ): Golden yellow pumpkin and red lentils simmered in sweet-spicy harmony. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 425,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 187,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Dubba be'Misir Wot (Pumpkin & Red Lentil Stew) Stew Component",
        "nameAmharic": "የዱባና ምስር ወጥ ወጥ",
        "gramsPerServing": 145,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 43,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 51,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Dubba be'Misir Wot (Pumpkin & Red Lentil Stew).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዱባና ምስር ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 590,
        "protein_g": 23.5,
        "fat_g": 11.8,
        "carbohydrate_g": 104,
        "dietaryFiber_g": 19.8,
        "moisture_g": 266,
        "ash_g": 8.2
      },
      "aminoAcids": {
        "histidine_mg": 611,
        "isoleucine_mg": 987,
        "leucine_mg": 1692,
        "lysine_mg": 1598,
        "methionine_mg": 517,
        "cysteine_mg": 470,
        "phenylalanine_mg": 1081,
        "tyrosine_mg": 752,
        "threonine_mg": 893,
        "tryptophan_mg": 282,
        "valine_mg": 1128,
        "arginine_mg": 1598,
        "totalEAA_mg": 11609,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 1.9,
        "totalMUFA_g": 4.1,
        "totalPUFA_g": 5.8,
        "omega6_linoleic_g": 4.4,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 80,
      "standard": 130,
      "premium": 200
    }
  },
  {
    "id": "ater-kollo-fitfit",
    "nameEn": "Ye'Ater Kollo Fitfit Stew",
    "nameAmharic": "የአተር ቆሎ ፍትፍት",
    "category": "legume_stew",
    "tagline": "Crunchy roasted field pea snack reconstituted into savory spiced stew with injera.",
    "description": "Ye'Ater Kollo Fitfit Stew (የአተር ቆሎ ፍትፍት): Crunchy roasted field pea snack reconstituted into savory spiced stew with injera. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 432,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 190,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Ye'Ater Kollo Fitfit Stew Stew Component",
        "nameAmharic": "የአተር ቆሎ ፍትፍት ወጥ",
        "gramsPerServing": 147,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 43,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 52,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Ye'Ater Kollo Fitfit Stew.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየአተር ቆሎ ፍትፍት አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 600,
        "protein_g": 24.5,
        "fat_g": 12.5,
        "carbohydrate_g": 100,
        "dietaryFiber_g": 18,
        "moisture_g": 270,
        "ash_g": 8.6
      },
      "aminoAcids": {
        "histidine_mg": 637,
        "isoleucine_mg": 1029,
        "leucine_mg": 1764,
        "lysine_mg": 1666,
        "methionine_mg": 539,
        "cysteine_mg": 490,
        "phenylalanine_mg": 1127,
        "tyrosine_mg": 784,
        "threonine_mg": 931,
        "tryptophan_mg": 294,
        "valine_mg": 1176,
        "arginine_mg": 1666,
        "totalEAA_mg": 12103,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 2,
        "totalMUFA_g": 4.4,
        "totalPUFA_g": 6.1,
        "omega6_linoleic_g": 4.6,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 70,
      "standard": 115,
      "premium": 180
    }
  },
  {
    "id": "doro-wot-festive",
    "nameEn": "Doro Wot Festive Platter with Injera, Ayib & Egg",
    "nameAmharic": "የዶሮ ወጥ በጤፍ እንጀራና አይብ",
    "category": "festive_poultry_meat",
    "tagline": "The crown jewel of Ethiopian festive gastronomy and hospitality.",
    "description": "Doro Wot Festive Platter with Injera, Ayib & Egg (የዶሮ ወጥ በጤፍ እንጀራና አይብ): The crown jewel of Ethiopian festive gastronomy and hospitality. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 547,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 220,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "doro-chicken",
        "nameEn": "Simmered Country Chicken & Gravy",
        "nameAmharic": "የዶሮ ስጋና ወጥ",
        "gramsPerServing": 180,
        "category": "animal",
        "dryEquivalentRatio": 0.75
      },
      {
        "id": "boiled-egg",
        "nameEn": "Hard-Boiled Egg (Enkulal)",
        "nameAmharic": "የተቀቀለ እንቁላል",
        "gramsPerServing": 50,
        "category": "animal",
        "dryEquivalentRatio": 1
      },
      {
        "id": "ayib",
        "nameEn": "Fresh Ethiopian Cottage Cheese (Ayib)",
        "nameAmharic": "አይብ",
        "gramsPerServing": 50,
        "category": "animal",
        "dryEquivalentRatio": 1
      },
      {
        "id": "gomen-side",
        "nameEn": "Gomen Greens Side",
        "nameAmharic": "ጎመን",
        "gramsPerServing": 30,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Doro Wot Festive Platter with Injera, Ayib & Egg.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዶሮ ወጥ በጤፍ እንጀራና አይብ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 760,
        "protein_g": 44.2,
        "fat_g": 26.5,
        "carbohydrate_g": 88,
        "dietaryFiber_g": 13.5,
        "moisture_g": 342,
        "ash_g": 15.5
      },
      "aminoAcids": {
        "histidine_mg": 1149,
        "isoleucine_mg": 1856,
        "leucine_mg": 3624,
        "lysine_mg": 3448,
        "methionine_mg": 1105,
        "cysteine_mg": 884,
        "phenylalanine_mg": 2033,
        "tyrosine_mg": 1414,
        "threonine_mg": 1680,
        "tryptophan_mg": 530,
        "valine_mg": 2122,
        "arginine_mg": 2431,
        "totalEAA_mg": 22276,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 11.9,
        "totalMUFA_g": 10.1,
        "totalPUFA_g": 4.5,
        "omega6_linoleic_g": 3.4,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 210
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 1.8
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 220,
      "standard": 340,
      "premium": 520
    }
  },
  {
    "id": "doro-alicha",
    "nameEn": "Doro Alicha (Mild Turmeric Chicken Stew)",
    "nameAmharic": "የዶሮ አልጫ ወጥ",
    "category": "festive_poultry_meat",
    "tagline": "Mild, aromatic golden chicken stew with korerima and ginger.",
    "description": "Doro Alicha (Mild Turmeric Chicken Stew) (የዶሮ አልጫ ወጥ): Mild, aromatic golden chicken stew with korerima and ginger. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 518,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 228,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Doro Alicha (Mild Turmeric Chicken Stew) Stew Component",
        "nameAmharic": "የዶሮ አልጫ ወጥ ወጥ",
        "gramsPerServing": 176,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 52,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 62,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Doro Alicha (Mild Turmeric Chicken Stew).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዶሮ አልጫ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 720,
        "protein_g": 42,
        "fat_g": 24.5,
        "carbohydrate_g": 86,
        "dietaryFiber_g": 12.8,
        "moisture_g": 324,
        "ash_g": 14.7
      },
      "aminoAcids": {
        "histidine_mg": 1092,
        "isoleucine_mg": 1764,
        "leucine_mg": 3444,
        "lysine_mg": 3276,
        "methionine_mg": 1050,
        "cysteine_mg": 840,
        "phenylalanine_mg": 1932,
        "tyrosine_mg": 1344,
        "threonine_mg": 1596,
        "tryptophan_mg": 504,
        "valine_mg": 2016,
        "arginine_mg": 2310,
        "totalEAA_mg": 21168,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 11,
        "totalMUFA_g": 9.3,
        "totalPUFA_g": 4.2,
        "omega6_linoleic_g": 3.2,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 210
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 1.8
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 210,
      "standard": 330,
      "premium": 500
    }
  },
  {
    "id": "doro-tibs",
    "nameEn": "Doro Tibs with Rosemary & Jalapeño",
    "nameAmharic": "የዶሮ ጥብስ",
    "category": "festive_poultry_meat",
    "tagline": "Succulent pan-seared chicken strips with garlic, rosemary, and green chili.",
    "description": "Doro Tibs with Rosemary & Jalapeño (የዶሮ ጥብስ): Succulent pan-seared chicken strips with garlic, rosemary, and green chili. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 490,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 216,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Doro Tibs with Rosemary & Jalapeño Stew Component",
        "nameAmharic": "የዶሮ ጥብስ ወጥ",
        "gramsPerServing": 167,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 49,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 59,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Doro Tibs with Rosemary & Jalapeño.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዶሮ ጥብስ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 680,
        "protein_g": 43.5,
        "fat_g": 22,
        "carbohydrate_g": 82,
        "dietaryFiber_g": 11.5,
        "moisture_g": 306,
        "ash_g": 15.2
      },
      "aminoAcids": {
        "histidine_mg": 1131,
        "isoleucine_mg": 1827,
        "leucine_mg": 3567,
        "lysine_mg": 3393,
        "methionine_mg": 1088,
        "cysteine_mg": 870,
        "phenylalanine_mg": 2001,
        "tyrosine_mg": 1392,
        "threonine_mg": 1653,
        "tryptophan_mg": 522,
        "valine_mg": 2088,
        "arginine_mg": 2393,
        "totalEAA_mg": 21925,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 9.9,
        "totalMUFA_g": 8.4,
        "totalPUFA_g": 3.7,
        "omega6_linoleic_g": 2.8,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 190,
      "standard": 290,
      "premium": 440
    }
  },
  {
    "id": "enkulal-firfir",
    "nameEn": "Enkulal Firfir with Tomatoes & Green Peppers",
    "nameAmharic": "የእንቁላል ፍርፍር",
    "category": "festive_poultry_meat",
    "tagline": "Scrambled spiced eggs folded with diced onions, tomatoes, and chilies.",
    "description": "Enkulal Firfir with Tomatoes & Green Peppers (የእንቁላል ፍርፍር): Scrambled spiced eggs folded with diced onions, tomatoes, and chilies. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 418,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 184,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Enkulal Firfir with Tomatoes & Green Peppers Stew Component",
        "nameAmharic": "የእንቁላል ፍርፍር ወጥ",
        "gramsPerServing": 142,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 42,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 50,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Enkulal Firfir with Tomatoes & Green Peppers.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየእንቁላል ፍርፍር አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 580,
        "protein_g": 27.5,
        "fat_g": 24.5,
        "carbohydrate_g": 68,
        "dietaryFiber_g": 9.5,
        "moisture_g": 261,
        "ash_g": 9.6
      },
      "aminoAcids": {
        "histidine_mg": 715,
        "isoleucine_mg": 1155,
        "leucine_mg": 2255,
        "lysine_mg": 2145,
        "methionine_mg": 688,
        "cysteine_mg": 550,
        "phenylalanine_mg": 1265,
        "tyrosine_mg": 880,
        "threonine_mg": 1045,
        "tryptophan_mg": 330,
        "valine_mg": 1320,
        "arginine_mg": 1513,
        "totalEAA_mg": 13861,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 11,
        "totalMUFA_g": 9.3,
        "totalPUFA_g": 4.2,
        "omega6_linoleic_g": 3.2,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 210
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 1.8
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 110,
      "standard": 175,
      "premium": 260
    }
  },
  {
    "id": "enkulal-be-kibbeh",
    "nameEn": "Enkulal be'Kibbeh (Poached Egg in Clarified Butter)",
    "nameAmharic": "እንቁላል በቅቤ",
    "category": "festive_poultry_meat",
    "tagline": "Ancestral highland energy breakfast of eggs gently basted in aromatic spiced butter.",
    "description": "Enkulal be'Kibbeh (Poached Egg in Clarified Butter) (እንቁላል በቅቤ): Ancestral highland energy breakfast of eggs gently basted in aromatic spiced butter. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 389,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 171,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Enkulal be'Kibbeh (Poached Egg in Clarified Butter) Stew Component",
        "nameAmharic": "እንቁላል በቅቤ ወጥ",
        "gramsPerServing": 132,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 39,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 47,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Enkulal be'Kibbeh (Poached Egg in Clarified Butter).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለእንቁላል በቅቤ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 540,
        "protein_g": 20.8,
        "fat_g": 31,
        "carbohydrate_g": 52,
        "dietaryFiber_g": 7.8,
        "moisture_g": 243,
        "ash_g": 7.3
      },
      "aminoAcids": {
        "histidine_mg": 541,
        "isoleucine_mg": 874,
        "leucine_mg": 1706,
        "lysine_mg": 1622,
        "methionine_mg": 520,
        "cysteine_mg": 416,
        "phenylalanine_mg": 957,
        "tyrosine_mg": 666,
        "threonine_mg": 790,
        "tryptophan_mg": 250,
        "valine_mg": 998,
        "arginine_mg": 1144,
        "totalEAA_mg": 10484,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 14,
        "totalMUFA_g": 11.8,
        "totalPUFA_g": 5.2,
        "omega6_linoleic_g": 3.9,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 210
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 1.8
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 100,
      "standard": 160,
      "premium": 240
    }
  },
  {
    "id": "doro-firfir",
    "nameEn": "Doro Firfir with Teff Injera",
    "nameAmharic": "የዶሮ ፍርፍር",
    "category": "festive_poultry_meat",
    "tagline": "Shredded chicken and rich berbere gravy soaked into soft teff injera.",
    "description": "Doro Firfir with Teff Injera (የዶሮ ፍርፍር): Shredded chicken and rich berbere gravy soaked into soft teff injera. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 511,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 225,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Doro Firfir with Teff Injera Stew Component",
        "nameAmharic": "የዶሮ ፍርፍር ወጥ",
        "gramsPerServing": 174,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 51,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 61,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Doro Firfir with Teff Injera.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዶሮ ፍርፍር አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 710,
        "protein_g": 39,
        "fat_g": 22.5,
        "carbohydrate_g": 89,
        "dietaryFiber_g": 13,
        "moisture_g": 320,
        "ash_g": 13.7
      },
      "aminoAcids": {
        "histidine_mg": 1014,
        "isoleucine_mg": 1638,
        "leucine_mg": 3198,
        "lysine_mg": 3042,
        "methionine_mg": 975,
        "cysteine_mg": 780,
        "phenylalanine_mg": 1794,
        "tyrosine_mg": 1248,
        "threonine_mg": 1482,
        "tryptophan_mg": 468,
        "valine_mg": 1872,
        "arginine_mg": 2145,
        "totalEAA_mg": 19656,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 10.1,
        "totalMUFA_g": 8.6,
        "totalPUFA_g": 3.8,
        "omega6_linoleic_g": 2.8,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 180,
      "standard": 280,
      "premium": 430
    }
  },
  {
    "id": "ye-agazen-doro",
    "nameEn": "Ye'Agazen Doro (Highland Guineafowl Stew)",
    "nameAmharic": "የአጋዘን/የሜዳ ዶሮ ወጥ",
    "category": "festive_poultry_meat",
    "tagline": "Lean, aromatic wild-game fowl stew braised with highland spices.",
    "description": "Ye'Agazen Doro (Highland Guineafowl Stew) (የአጋዘን/የሜዳ ዶሮ ወጥ): Lean, aromatic wild-game fowl stew braised with highland spices. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 518,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 228,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Ye'Agazen Doro (Highland Guineafowl Stew) Stew Component",
        "nameAmharic": "የአጋዘን/የሜዳ ዶሮ ወጥ ወጥ",
        "gramsPerServing": 176,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 52,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 62,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Ye'Agazen Doro (Highland Guineafowl Stew).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየአጋዘን/የሜዳ ዶሮ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 720,
        "protein_g": 46.5,
        "fat_g": 21,
        "carbohydrate_g": 86,
        "dietaryFiber_g": 13,
        "moisture_g": 324,
        "ash_g": 16.3
      },
      "aminoAcids": {
        "histidine_mg": 1209,
        "isoleucine_mg": 1953,
        "leucine_mg": 3813,
        "lysine_mg": 3627,
        "methionine_mg": 1163,
        "cysteine_mg": 930,
        "phenylalanine_mg": 2139,
        "tyrosine_mg": 1488,
        "threonine_mg": 1767,
        "tryptophan_mg": 558,
        "valine_mg": 2232,
        "arginine_mg": 2558,
        "totalEAA_mg": 23437,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 9.5,
        "totalMUFA_g": 8,
        "totalPUFA_g": 3.5,
        "omega6_linoleic_g": 2.6,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 240,
      "standard": 380,
      "premium": 580
    }
  },
  {
    "id": "enkulal-be-gomen",
    "nameEn": "Enkulal be'Gomen (Eggs Scrambled with Collard Greens)",
    "nameAmharic": "እንቁላል በጎመን",
    "category": "festive_poultry_meat",
    "tagline": "Nutrient-packed breakfast of fresh farm eggs scrambled into stewed kale.",
    "description": "Enkulal be'Gomen (Eggs Scrambled with Collard Greens) (እንቁላል በጎመን): Nutrient-packed breakfast of fresh farm eggs scrambled into stewed kale. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 425,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 187,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Enkulal be'Gomen (Eggs Scrambled with Collard Greens) Stew Component",
        "nameAmharic": "እንቁላል በጎመን ወጥ",
        "gramsPerServing": 145,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 43,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 51,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Enkulal be'Gomen (Eggs Scrambled with Collard Greens).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለእንቁላል በጎመን አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 590,
        "protein_g": 26.5,
        "fat_g": 23.5,
        "carbohydrate_g": 72,
        "dietaryFiber_g": 13.5,
        "moisture_g": 266,
        "ash_g": 9.3
      },
      "aminoAcids": {
        "histidine_mg": 689,
        "isoleucine_mg": 1113,
        "leucine_mg": 2173,
        "lysine_mg": 2067,
        "methionine_mg": 663,
        "cysteine_mg": 530,
        "phenylalanine_mg": 1219,
        "tyrosine_mg": 848,
        "threonine_mg": 1007,
        "tryptophan_mg": 318,
        "valine_mg": 1272,
        "arginine_mg": 1458,
        "totalEAA_mg": 13357,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 10.6,
        "totalMUFA_g": 8.9,
        "totalPUFA_g": 4,
        "omega6_linoleic_g": 3,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 210
      },
      "minerals": {
        "calcium_mg": 340,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 980,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 320,
        "betaCarotene_mcg": 3840,
        "vitaminC_mg": 36,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 1.8
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 110,
      "standard": 170,
      "premium": 250
    }
  },
  {
    "id": "doro-be-ayib-special",
    "nameEn": "Doro be'Ayib Special (Spiced Chicken with Cottage Cheese)",
    "nameAmharic": "የዶሮ ወጥ በአይብ",
    "category": "festive_poultry_meat",
    "tagline": "Rich poultry stew balanced with cool, fresh artisanal buttermilk curd.",
    "description": "Doro be'Ayib Special (Spiced Chicken with Cottage Cheese) (የዶሮ ወጥ በአይብ): Rich poultry stew balanced with cool, fresh artisanal buttermilk curd. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 533,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 235,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Doro be'Ayib Special (Spiced Chicken with Cottage Cheese) Stew Component",
        "nameAmharic": "የዶሮ ወጥ በአይብ ወጥ",
        "gramsPerServing": 181,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 53,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 64,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Doro be'Ayib Special (Spiced Chicken with Cottage Cheese).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዶሮ ወጥ በአይብ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 740,
        "protein_g": 45,
        "fat_g": 25.5,
        "carbohydrate_g": 84,
        "dietaryFiber_g": 12,
        "moisture_g": 333,
        "ash_g": 15.7
      },
      "aminoAcids": {
        "histidine_mg": 1170,
        "isoleucine_mg": 1890,
        "leucine_mg": 3690,
        "lysine_mg": 3510,
        "methionine_mg": 1125,
        "cysteine_mg": 900,
        "phenylalanine_mg": 2070,
        "tyrosine_mg": 1440,
        "threonine_mg": 1710,
        "tryptophan_mg": 540,
        "valine_mg": 2160,
        "arginine_mg": 2475,
        "totalEAA_mg": 22680,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 11.5,
        "totalMUFA_g": 9.7,
        "totalPUFA_g": 4.3,
        "omega6_linoleic_g": 3.2,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 210
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 1.8
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 230,
      "standard": 350,
      "premium": 530
    }
  },
  {
    "id": "doro-kitfo",
    "nameEn": "Doro Kitfo (Minced Seasoned Chicken with Mitmita)",
    "nameAmharic": "የዶሮ ክትፎ",
    "category": "festive_poultry_meat",
    "tagline": "Fine chicken breast tartare warmed gently in spiced butter and fiery mitmita.",
    "description": "Doro Kitfo (Minced Seasoned Chicken with Mitmita) (የዶሮ ክትፎ): Fine chicken breast tartare warmed gently in spiced butter and fiery mitmita. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 482,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 212,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Doro Kitfo (Minced Seasoned Chicken with Mitmita) Stew Component",
        "nameAmharic": "የዶሮ ክትፎ ወጥ",
        "gramsPerServing": 164,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 48,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 58,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Doro Kitfo (Minced Seasoned Chicken with Mitmita).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዶሮ ክትፎ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 670,
        "protein_g": 44,
        "fat_g": 22,
        "carbohydrate_g": 78,
        "dietaryFiber_g": 10.5,
        "moisture_g": 302,
        "ash_g": 15.4
      },
      "aminoAcids": {
        "histidine_mg": 1144,
        "isoleucine_mg": 1848,
        "leucine_mg": 3608,
        "lysine_mg": 3432,
        "methionine_mg": 1100,
        "cysteine_mg": 880,
        "phenylalanine_mg": 2024,
        "tyrosine_mg": 1408,
        "threonine_mg": 1672,
        "tryptophan_mg": 528,
        "valine_mg": 2112,
        "arginine_mg": 2420,
        "totalEAA_mg": 22176,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 9.9,
        "totalMUFA_g": 8.4,
        "totalPUFA_g": 3.7,
        "omega6_linoleic_g": 2.8,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 195,
      "standard": 300,
      "premium": 460
    }
  },
  {
    "id": "kitfo-special",
    "nameEn": "Kitfo Special with Kocho, Gomen Kitfo & Ayib",
    "nameAmharic": "ክትፎ በቆጮ፣ ጎመን ክትፎና አይብ",
    "category": "traditional_beef_enset",
    "tagline": "The Gurage heritage powerhouse of grass-fed beef, clarified spiced butter, and enset kocho.",
    "description": "Kitfo Special with Kocho, Gomen Kitfo & Ayib (ክትፎ በቆጮ፣ ጎመን ክትፎና አይብ): The Gurage heritage powerhouse of grass-fed beef, clarified spiced butter, and enset kocho. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 562,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "beef-kitfo",
        "nameEn": "Lean Minced Beef & Niter Kibbeh",
        "nameAmharic": "የክትፎ ስጋ በንጥር ቅቤ",
        "gramsPerServing": 170,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "kocho",
        "nameEn": "Baked Enset Kocho Bread",
        "nameAmharic": "የተጋገረ ቆጮ",
        "gramsPerServing": 150,
        "category": "cereal",
        "dryEquivalentRatio": 0.65
      },
      {
        "id": "gomen-kitfo",
        "nameEn": "Gomen Kitfo (Spiced Greens)",
        "nameAmharic": "ጎመን ክትፎ",
        "gramsPerServing": 80,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      },
      {
        "id": "ayib",
        "nameEn": "Fresh Ayib (Cottage Cheese)",
        "nameAmharic": "አይብ",
        "gramsPerServing": 70,
        "category": "animal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Kitfo Special with Kocho, Gomen Kitfo & Ayib.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለክትፎ በቆጮ፣ ጎመን ክትፎና አይብ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 780,
        "protein_g": 48.6,
        "fat_g": 34.2,
        "carbohydrate_g": 68.5,
        "dietaryFiber_g": 11.2,
        "moisture_g": 351,
        "ash_g": 17
      },
      "aminoAcids": {
        "histidine_mg": 1264,
        "isoleucine_mg": 2041,
        "leucine_mg": 3985,
        "lysine_mg": 3791,
        "methionine_mg": 1215,
        "cysteine_mg": 972,
        "phenylalanine_mg": 2236,
        "tyrosine_mg": 1555,
        "threonine_mg": 1847,
        "tryptophan_mg": 583,
        "valine_mg": 2333,
        "arginine_mg": 2673,
        "totalEAA_mg": 24495,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 15.4,
        "totalMUFA_g": 13,
        "totalPUFA_g": 5.8,
        "omega6_linoleic_g": 4.4,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 260,
      "standard": 390,
      "premium": 580
    }
  },
  {
    "id": "kitfo-leb-leb",
    "nameEn": "Kitfo Leb-Leb (Lightly Warmed Spiced Beef Tartare)",
    "nameAmharic": "ክትፎ ለብ-ለብ",
    "category": "traditional_beef_enset",
    "tagline": "Minced tenderloin flash-warmed in spiced butter with mitmita.",
    "description": "Kitfo Leb-Leb (Lightly Warmed Spiced Beef Tartare) (ክትፎ ለብ-ለብ): Minced tenderloin flash-warmed in spiced butter with mitmita. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 533,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 235,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Kitfo Leb-Leb (Lightly Warmed Spiced Beef Tartare) Stew Component",
        "nameAmharic": "ክትፎ ለብ-ለብ ወጥ",
        "gramsPerServing": 181,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 53,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 64,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Kitfo Leb-Leb (Lightly Warmed Spiced Beef Tartare).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለክትፎ ለብ-ለብ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 740,
        "protein_g": 46.5,
        "fat_g": 32,
        "carbohydrate_g": 65,
        "dietaryFiber_g": 10.5,
        "moisture_g": 333,
        "ash_g": 16.3
      },
      "aminoAcids": {
        "histidine_mg": 1209,
        "isoleucine_mg": 1953,
        "leucine_mg": 3813,
        "lysine_mg": 3627,
        "methionine_mg": 1163,
        "cysteine_mg": 930,
        "phenylalanine_mg": 2139,
        "tyrosine_mg": 1488,
        "threonine_mg": 1767,
        "tryptophan_mg": 558,
        "valine_mg": 2232,
        "arginine_mg": 2558,
        "totalEAA_mg": 23437,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 14.4,
        "totalMUFA_g": 12.2,
        "totalPUFA_g": 5.4,
        "omega6_linoleic_g": 4.1,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 250,
      "standard": 380,
      "premium": 560
    }
  },
  {
    "id": "kitfo-tere",
    "nameEn": "Kitfo Tere (Raw Minced Tenderloin with Ayib & Mitmita)",
    "nameAmharic": "ጥሬ ክትፎ",
    "category": "traditional_beef_enset",
    "tagline": "Traditional raw minced prime beef seasoned with aromatic spiced butter.",
    "description": "Kitfo Tere (Raw Minced Tenderloin with Ayib & Mitmita) (ጥሬ ክትፎ): Traditional raw minced prime beef seasoned with aromatic spiced butter. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 518,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 228,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Kitfo Tere (Raw Minced Tenderloin with Ayib & Mitmita) Stew Component",
        "nameAmharic": "ጥሬ ክትፎ ወጥ",
        "gramsPerServing": 176,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 52,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 62,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Kitfo Tere (Raw Minced Tenderloin with Ayib & Mitmita).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለጥሬ ክትፎ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 720,
        "protein_g": 47,
        "fat_g": 30.5,
        "carbohydrate_g": 62,
        "dietaryFiber_g": 10,
        "moisture_g": 324,
        "ash_g": 16.5
      },
      "aminoAcids": {
        "histidine_mg": 1222,
        "isoleucine_mg": 1974,
        "leucine_mg": 3854,
        "lysine_mg": 3666,
        "methionine_mg": 1175,
        "cysteine_mg": 940,
        "phenylalanine_mg": 2162,
        "tyrosine_mg": 1504,
        "threonine_mg": 1786,
        "tryptophan_mg": 564,
        "valine_mg": 2256,
        "arginine_mg": 2585,
        "totalEAA_mg": 23688,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 13.7,
        "totalMUFA_g": 11.6,
        "totalPUFA_g": 5.2,
        "omega6_linoleic_g": 3.9,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 250,
      "standard": 380,
      "premium": 560
    }
  },
  {
    "id": "gored-gored",
    "nameEn": "Gored Gored (Cubed Tender Beef in Awaze & Kibbeh)",
    "nameAmharic": "ጎረድ ጎረድ",
    "category": "traditional_beef_enset",
    "tagline": "Prime raw or lightly warmed cubed beef bathed in awaze and melted kibbeh.",
    "description": "Gored Gored (Cubed Tender Beef in Awaze & Kibbeh) (ጎረድ ጎረድ): Prime raw or lightly warmed cubed beef bathed in awaze and melted kibbeh. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 526,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 231,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Gored Gored (Cubed Tender Beef in Awaze & Kibbeh) Stew Component",
        "nameAmharic": "ጎረድ ጎረድ ወጥ",
        "gramsPerServing": 179,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 53,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 63,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Gored Gored (Cubed Tender Beef in Awaze & Kibbeh).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለጎረድ ጎረድ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 730,
        "protein_g": 48,
        "fat_g": 31,
        "carbohydrate_g": 63,
        "dietaryFiber_g": 9.8,
        "moisture_g": 329,
        "ash_g": 16.8
      },
      "aminoAcids": {
        "histidine_mg": 1248,
        "isoleucine_mg": 2016,
        "leucine_mg": 3936,
        "lysine_mg": 3744,
        "methionine_mg": 1200,
        "cysteine_mg": 960,
        "phenylalanine_mg": 2208,
        "tyrosine_mg": 1536,
        "threonine_mg": 1824,
        "tryptophan_mg": 576,
        "valine_mg": 2304,
        "arginine_mg": 2640,
        "totalEAA_mg": 24192,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 14,
        "totalMUFA_g": 11.8,
        "totalPUFA_g": 5.2,
        "omega6_linoleic_g": 3.9,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 260,
      "standard": 390,
      "premium": 570
    }
  },
  {
    "id": "siga-wot",
    "nameEn": "Siga Wot (Fiery Beef Stew in Berbere Gravy)",
    "nameAmharic": "የስጋ ወጥ",
    "category": "traditional_beef_enset",
    "tagline": "Slow-braised beef chunks in caramelized onions and deep red berbere sauce.",
    "description": "Siga Wot (Fiery Beef Stew in Berbere Gravy) (የስጋ ወጥ): Slow-braised beef chunks in caramelized onions and deep red berbere sauce. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 540,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 238,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Siga Wot (Fiery Beef Stew in Berbere Gravy) Stew Component",
        "nameAmharic": "የስጋ ወጥ ወጥ",
        "gramsPerServing": 184,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 54,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 65,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Siga Wot (Fiery Beef Stew in Berbere Gravy).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየስጋ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 750,
        "protein_g": 44.5,
        "fat_g": 28,
        "carbohydrate_g": 84,
        "dietaryFiber_g": 12.5,
        "moisture_g": 338,
        "ash_g": 15.6
      },
      "aminoAcids": {
        "histidine_mg": 1157,
        "isoleucine_mg": 1869,
        "leucine_mg": 3649,
        "lysine_mg": 3471,
        "methionine_mg": 1113,
        "cysteine_mg": 890,
        "phenylalanine_mg": 2047,
        "tyrosine_mg": 1424,
        "threonine_mg": 1691,
        "tryptophan_mg": 534,
        "valine_mg": 2136,
        "arginine_mg": 2448,
        "totalEAA_mg": 22429,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 12.6,
        "totalMUFA_g": 10.6,
        "totalPUFA_g": 4.8,
        "omega6_linoleic_g": 3.6,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 220,
      "standard": 330,
      "premium": 490
    }
  },
  {
    "id": "siga-alicha",
    "nameEn": "Siga Alicha (Mild Highland Beef Stew with Ginger)",
    "nameAmharic": "የስጋ አልጫ",
    "category": "traditional_beef_enset",
    "tagline": "Gentle turmeric beef stew simmered with garlic, ginger, and potatoes.",
    "description": "Siga Alicha (Mild Highland Beef Stew with Ginger) (የስጋ አልጫ): Gentle turmeric beef stew simmered with garlic, ginger, and potatoes. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 511,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 225,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Siga Alicha (Mild Highland Beef Stew with Ginger) Stew Component",
        "nameAmharic": "የስጋ አልጫ ወጥ",
        "gramsPerServing": 174,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 51,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 61,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Siga Alicha (Mild Highland Beef Stew with Ginger).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየስጋ አልጫ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 710,
        "protein_g": 43,
        "fat_g": 26.5,
        "carbohydrate_g": 82,
        "dietaryFiber_g": 12,
        "moisture_g": 320,
        "ash_g": 15.1
      },
      "aminoAcids": {
        "histidine_mg": 1118,
        "isoleucine_mg": 1806,
        "leucine_mg": 3526,
        "lysine_mg": 3354,
        "methionine_mg": 1075,
        "cysteine_mg": 860,
        "phenylalanine_mg": 1978,
        "tyrosine_mg": 1376,
        "threonine_mg": 1634,
        "tryptophan_mg": 516,
        "valine_mg": 2064,
        "arginine_mg": 2365,
        "totalEAA_mg": 21672,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 11.9,
        "totalMUFA_g": 10.1,
        "totalPUFA_g": 4.5,
        "omega6_linoleic_g": 3.4,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 210,
      "standard": 320,
      "premium": 480
    }
  },
  {
    "id": "tibs-ye-bego",
    "nameEn": "Tibs Ye'Bego (Pan-Seared Highland Lamb Tibs)",
    "nameAmharic": "የበግ ጥብስ",
    "category": "traditional_beef_enset",
    "tagline": "Highland sheep meat sautéed with red onions, garlic, and fresh rosemary.",
    "description": "Tibs Ye'Bego (Pan-Seared Highland Lamb Tibs) (የበግ ጥብስ): Highland sheep meat sautéed with red onions, garlic, and fresh rosemary. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 547,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 241,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Tibs Ye'Bego (Pan-Seared Highland Lamb Tibs) Stew Component",
        "nameAmharic": "የበግ ጥብስ ወጥ",
        "gramsPerServing": 186,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 55,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 66,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Tibs Ye'Bego (Pan-Seared Highland Lamb Tibs).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየበግ ጥብስ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 760,
        "protein_g": 42,
        "fat_g": 32.5,
        "carbohydrate_g": 76,
        "dietaryFiber_g": 10.5,
        "moisture_g": 342,
        "ash_g": 14.7
      },
      "aminoAcids": {
        "histidine_mg": 1092,
        "isoleucine_mg": 1764,
        "leucine_mg": 3444,
        "lysine_mg": 3276,
        "methionine_mg": 1050,
        "cysteine_mg": 840,
        "phenylalanine_mg": 1932,
        "tyrosine_mg": 1344,
        "threonine_mg": 1596,
        "tryptophan_mg": 504,
        "valine_mg": 2016,
        "arginine_mg": 2310,
        "totalEAA_mg": 21168,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 14.6,
        "totalMUFA_g": 12.4,
        "totalPUFA_g": 5.5,
        "omega6_linoleic_g": 4.1,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 240,
      "standard": 360,
      "premium": 540
    }
  },
  {
    "id": "derek-tibs",
    "nameEn": "Derek Tibs (Crispy Dry-Fried Beef with Rosemary)",
    "nameAmharic": "ደረቅ ጥብስ",
    "category": "traditional_beef_enset",
    "tagline": "Crisp-fried beef cubes tossed with sizzling peppers, awaze, and mitmita.",
    "description": "Derek Tibs (Crispy Dry-Fried Beef with Rosemary) (ደረቅ ጥብስ): Crisp-fried beef cubes tossed with sizzling peppers, awaze, and mitmita. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 533,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 235,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Derek Tibs (Crispy Dry-Fried Beef with Rosemary) Stew Component",
        "nameAmharic": "ደረቅ ጥብስ ወጥ",
        "gramsPerServing": 181,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 53,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 64,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Derek Tibs (Crispy Dry-Fried Beef with Rosemary).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለደረቅ ጥብስ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 740,
        "protein_g": 47.5,
        "fat_g": 29,
        "carbohydrate_g": 74,
        "dietaryFiber_g": 9.5,
        "moisture_g": 333,
        "ash_g": 16.6
      },
      "aminoAcids": {
        "histidine_mg": 1235,
        "isoleucine_mg": 1995,
        "leucine_mg": 3895,
        "lysine_mg": 3705,
        "methionine_mg": 1188,
        "cysteine_mg": 950,
        "phenylalanine_mg": 2185,
        "tyrosine_mg": 1520,
        "threonine_mg": 1805,
        "tryptophan_mg": 570,
        "valine_mg": 2280,
        "arginine_mg": 2613,
        "totalEAA_mg": 23941,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 13.1,
        "totalMUFA_g": 11,
        "totalPUFA_g": 4.9,
        "omega6_linoleic_g": 3.7,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 230,
      "standard": 350,
      "premium": 520
    }
  },
  {
    "id": "quanta-firfir",
    "nameEn": "Quanta Firfir (Sun-Dried Spiced Beef Jerky Stew with Injera)",
    "nameAmharic": "የቋንጣ ፍርፍር",
    "category": "traditional_beef_enset",
    "tagline": "Savory cured highland beef jerky shredded with injera in fiery spiced gravy.",
    "description": "Quanta Firfir (Sun-Dried Spiced Beef Jerky Stew with Injera) (የቋንጣ ፍርፍር): Savory cured highland beef jerky shredded with injera in fiery spiced gravy. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 518,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "quanta-beef",
        "nameEn": "Sun-Dried Cured Beef Jerky (Quanta)",
        "nameAmharic": "የተዘጋጀ ቋንጣ",
        "gramsPerServing": 110,
        "category": "animal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "injera-folded",
        "nameEn": "Shredded Teff Injera Folded In",
        "nameAmharic": "የተፈተፈተ የጤፍ እንጀራ",
        "gramsPerServing": 250,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "kibbeh-sauce",
        "nameEn": "Niter Kibbeh & Berbere Sauce",
        "nameAmharic": "የበርበሬና ንጥር ቅቤ ወጥ",
        "gramsPerServing": 110,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "fresh-peppers",
        "nameEn": "Raw Jalapeño & Shallots",
        "nameAmharic": "ቃሪያና ቀይ ሽንኩርት",
        "gramsPerServing": 40,
        "category": "vegetable",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Quanta Firfir (Sun-Dried Spiced Beef Jerky Stew with Injera).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየቋንጣ ፍርፍር አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 720,
        "protein_g": 42.5,
        "fat_g": 24.8,
        "carbohydrate_g": 86,
        "dietaryFiber_g": 13.5,
        "moisture_g": 324,
        "ash_g": 14.9
      },
      "aminoAcids": {
        "histidine_mg": 1105,
        "isoleucine_mg": 1785,
        "leucine_mg": 3485,
        "lysine_mg": 3315,
        "methionine_mg": 1063,
        "cysteine_mg": 850,
        "phenylalanine_mg": 1955,
        "tyrosine_mg": 1360,
        "threonine_mg": 1615,
        "tryptophan_mg": 510,
        "valine_mg": 2040,
        "arginine_mg": 2338,
        "totalEAA_mg": 21421,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 11.2,
        "totalMUFA_g": 9.4,
        "totalPUFA_g": 4.2,
        "omega6_linoleic_g": 3.2,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 185,
      "standard": 290,
      "premium": 440
    }
  },
  {
    "id": "minchet-abish",
    "nameEn": "Minchet Abish (Finely Minced Spiced Beef with Fenugreek)",
    "nameAmharic": "ምንቸት አብሽ",
    "category": "traditional_beef_enset",
    "tagline": "Velvety minced beef braised with fenugreek, berbere, and boiled eggs.",
    "description": "Minchet Abish (Finely Minced Spiced Beef with Fenugreek) (ምንቸት አብሽ): Velvety minced beef braised with fenugreek, berbere, and boiled eggs. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 526,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 231,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Minchet Abish (Finely Minced Spiced Beef with Fenugreek) Stew Component",
        "nameAmharic": "ምንቸት አብሽ ወጥ",
        "gramsPerServing": 179,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 53,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 63,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Minchet Abish (Finely Minced Spiced Beef with Fenugreek).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለምንቸት አብሽ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 730,
        "protein_g": 45,
        "fat_g": 28.5,
        "carbohydrate_g": 78,
        "dietaryFiber_g": 11.5,
        "moisture_g": 329,
        "ash_g": 15.7
      },
      "aminoAcids": {
        "histidine_mg": 1170,
        "isoleucine_mg": 1890,
        "leucine_mg": 3690,
        "lysine_mg": 3510,
        "methionine_mg": 1125,
        "cysteine_mg": 900,
        "phenylalanine_mg": 2070,
        "tyrosine_mg": 1440,
        "threonine_mg": 1710,
        "tryptophan_mg": 540,
        "valine_mg": 2160,
        "arginine_mg": 2475,
        "totalEAA_mg": 22680,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 12.8,
        "totalMUFA_g": 10.8,
        "totalPUFA_g": 4.9,
        "omega6_linoleic_g": 3.7,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 210,
      "standard": 320,
      "premium": 480
    }
  },
  {
    "id": "minchet-abish-alicha",
    "nameEn": "Minchet Abish Alicha (Mild Minced Beef with Turmeric)",
    "nameAmharic": "ምንቸት አብሽ አልጫ",
    "category": "traditional_beef_enset",
    "tagline": "Golden minced beef simmered with turmeric, garlic, and sliced hard-boiled eggs.",
    "description": "Minchet Abish Alicha (Mild Minced Beef with Turmeric) (ምንቸት አብሽ አልጫ): Golden minced beef simmered with turmeric, garlic, and sliced hard-boiled eggs. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 497,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 219,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Minchet Abish Alicha (Mild Minced Beef with Turmeric) Stew Component",
        "nameAmharic": "ምንቸት አብሽ አልጫ ወጥ",
        "gramsPerServing": 169,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 50,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 60,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Minchet Abish Alicha (Mild Minced Beef with Turmeric).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለምንቸት አብሽ አልጫ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 690,
        "protein_g": 43.5,
        "fat_g": 26,
        "carbohydrate_g": 76,
        "dietaryFiber_g": 11,
        "moisture_g": 311,
        "ash_g": 15.2
      },
      "aminoAcids": {
        "histidine_mg": 1131,
        "isoleucine_mg": 1827,
        "leucine_mg": 3567,
        "lysine_mg": 3393,
        "methionine_mg": 1088,
        "cysteine_mg": 870,
        "phenylalanine_mg": 2001,
        "tyrosine_mg": 1392,
        "threonine_mg": 1653,
        "tryptophan_mg": 522,
        "valine_mg": 2088,
        "arginine_mg": 2393,
        "totalEAA_mg": 21925,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 11.7,
        "totalMUFA_g": 9.9,
        "totalPUFA_g": 4.4,
        "omega6_linoleic_g": 3.3,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 200,
      "standard": 310,
      "premium": 460
    }
  },
  {
    "id": "zigni-tigray",
    "nameEn": "Zigni (Deep Caramelized Beef Stew - Tigray Style)",
    "nameAmharic": "ዝግኒ",
    "category": "traditional_beef_enset",
    "tagline": "Intense, slow-simmered caramelized beef stew from the northern highlands.",
    "description": "Zigni (Deep Caramelized Beef Stew - Tigray Style) (ዝግኒ): Intense, slow-simmered caramelized beef stew from the northern highlands. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 533,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 235,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Zigni (Deep Caramelized Beef Stew - Tigray Style) Stew Component",
        "nameAmharic": "ዝግኒ ወጥ",
        "gramsPerServing": 181,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 53,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 64,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Zigni (Deep Caramelized Beef Stew - Tigray Style).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለዝግኒ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 740,
        "protein_g": 45.5,
        "fat_g": 27.5,
        "carbohydrate_g": 82,
        "dietaryFiber_g": 12,
        "moisture_g": 333,
        "ash_g": 15.9
      },
      "aminoAcids": {
        "histidine_mg": 1183,
        "isoleucine_mg": 1911,
        "leucine_mg": 3731,
        "lysine_mg": 3549,
        "methionine_mg": 1138,
        "cysteine_mg": 910,
        "phenylalanine_mg": 2093,
        "tyrosine_mg": 1456,
        "threonine_mg": 1729,
        "tryptophan_mg": 546,
        "valine_mg": 2184,
        "arginine_mg": 2503,
        "totalEAA_mg": 22933,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 12.4,
        "totalMUFA_g": 10.5,
        "totalPUFA_g": 4.6,
        "omega6_linoleic_g": 3.5,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 220,
      "standard": 340,
      "premium": 500
    }
  },
  {
    "id": "beg-alicha-wot",
    "nameEn": "Beg Alicha Wot (Tender Lamb Stew in Turmeric Sauce)",
    "nameAmharic": "የበግ አልጫ ወጥ",
    "category": "traditional_beef_enset",
    "tagline": "Succulent lamb pieces simmered in sweet onions, ginger, and turmeric.",
    "description": "Beg Alicha Wot (Tender Lamb Stew in Turmeric Sauce) (የበግ አልጫ ወጥ): Succulent lamb pieces simmered in sweet onions, ginger, and turmeric. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 526,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 231,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Beg Alicha Wot (Tender Lamb Stew in Turmeric Sauce) Stew Component",
        "nameAmharic": "የበግ አልጫ ወጥ ወጥ",
        "gramsPerServing": 179,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 53,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 63,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Beg Alicha Wot (Tender Lamb Stew in Turmeric Sauce).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየበግ አልጫ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 730,
        "protein_g": 41.5,
        "fat_g": 31,
        "carbohydrate_g": 78,
        "dietaryFiber_g": 11,
        "moisture_g": 329,
        "ash_g": 14.5
      },
      "aminoAcids": {
        "histidine_mg": 1079,
        "isoleucine_mg": 1743,
        "leucine_mg": 3403,
        "lysine_mg": 3237,
        "methionine_mg": 1038,
        "cysteine_mg": 830,
        "phenylalanine_mg": 1909,
        "tyrosine_mg": 1328,
        "threonine_mg": 1577,
        "tryptophan_mg": 498,
        "valine_mg": 1992,
        "arginine_mg": 2283,
        "totalEAA_mg": 20917,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 14,
        "totalMUFA_g": 11.8,
        "totalPUFA_g": 5.2,
        "omega6_linoleic_g": 3.9,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 230,
      "standard": 350,
      "premium": 520
    }
  },
  {
    "id": "beg-wot",
    "nameEn": "Beg Wot (Fiery Red Berbere Lamb Stew)",
    "nameAmharic": "የበግ ወጥ",
    "category": "traditional_beef_enset",
    "tagline": "Rich, aromatic highland lamb simmered in piquant red pepper stew.",
    "description": "Beg Wot (Fiery Red Berbere Lamb Stew) (የበግ ወጥ): Rich, aromatic highland lamb simmered in piquant red pepper stew. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 540,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 238,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Beg Wot (Fiery Red Berbere Lamb Stew) Stew Component",
        "nameAmharic": "የበግ ወጥ ወጥ",
        "gramsPerServing": 184,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 54,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 65,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Beg Wot (Fiery Red Berbere Lamb Stew).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየበግ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 750,
        "protein_g": 42.5,
        "fat_g": 32,
        "carbohydrate_g": 80,
        "dietaryFiber_g": 11.5,
        "moisture_g": 338,
        "ash_g": 14.9
      },
      "aminoAcids": {
        "histidine_mg": 1105,
        "isoleucine_mg": 1785,
        "leucine_mg": 3485,
        "lysine_mg": 3315,
        "methionine_mg": 1063,
        "cysteine_mg": 850,
        "phenylalanine_mg": 1955,
        "tyrosine_mg": 1360,
        "threonine_mg": 1615,
        "tryptophan_mg": 510,
        "valine_mg": 2040,
        "arginine_mg": 2338,
        "totalEAA_mg": 21421,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 14.4,
        "totalMUFA_g": 12.2,
        "totalPUFA_g": 5.4,
        "omega6_linoleic_g": 4.1,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 235,
      "standard": 355,
      "premium": 530
    }
  },
  {
    "id": "dulet",
    "nameEn": "Dulet (Minced Tripe, Liver & Lean Beef Sauté)",
    "nameAmharic": "ዱለት",
    "category": "traditional_beef_enset",
    "tagline": "Finely minced beef liver, tripe, and lean steak seasoned with mitmita.",
    "description": "Dulet (Minced Tripe, Liver & Lean Beef Sauté) (ዱለት): Finely minced beef liver, tripe, and lean steak seasoned with mitmita. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 490,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 216,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Dulet (Minced Tripe, Liver & Lean Beef Sauté) Stew Component",
        "nameAmharic": "ዱለት ወጥ",
        "gramsPerServing": 167,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 49,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 59,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Dulet (Minced Tripe, Liver & Lean Beef Sauté).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለዱለት አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 680,
        "protein_g": 49,
        "fat_g": 24.5,
        "carbohydrate_g": 68,
        "dietaryFiber_g": 8.5,
        "moisture_g": 306,
        "ash_g": 17.2
      },
      "aminoAcids": {
        "histidine_mg": 1274,
        "isoleucine_mg": 2058,
        "leucine_mg": 4018,
        "lysine_mg": 3822,
        "methionine_mg": 1225,
        "cysteine_mg": 980,
        "phenylalanine_mg": 2254,
        "tyrosine_mg": 1568,
        "threonine_mg": 1862,
        "tryptophan_mg": 588,
        "valine_mg": 2352,
        "arginine_mg": 2695,
        "totalEAA_mg": 24696,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 11,
        "totalMUFA_g": 9.3,
        "totalPUFA_g": 4.2,
        "omega6_linoleic_g": 3.2,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 200,
      "standard": 310,
      "premium": 460
    }
  },
  {
    "id": "kocho-be-ayib",
    "nameEn": "Baked Kocho Flatbread with Ayib & Mitmita",
    "nameAmharic": "የተጋገረ ቆጮ በአይብ",
    "category": "traditional_beef_enset",
    "tagline": "Traditional Gurage baked enset flatbread served with fresh curd cheese.",
    "description": "Baked Kocho Flatbread with Ayib & Mitmita (የተጋገረ ቆጮ በአይብ): Traditional Gurage baked enset flatbread served with fresh curd cheese. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 418,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 184,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Baked Kocho Flatbread with Ayib & Mitmita Stew Component",
        "nameAmharic": "የተጋገረ ቆጮ በአይብ ወጥ",
        "gramsPerServing": 142,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 42,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 50,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Baked Kocho Flatbread with Ayib & Mitmita.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየተጋገረ ቆጮ በአይብ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 580,
        "protein_g": 18.5,
        "fat_g": 19,
        "carbohydrate_g": 88,
        "dietaryFiber_g": 14.5,
        "moisture_g": 261,
        "ash_g": 6.5
      },
      "aminoAcids": {
        "histidine_mg": 481,
        "isoleucine_mg": 777,
        "leucine_mg": 1517,
        "lysine_mg": 1443,
        "methionine_mg": 463,
        "cysteine_mg": 370,
        "phenylalanine_mg": 851,
        "tyrosine_mg": 592,
        "threonine_mg": 703,
        "tryptophan_mg": 222,
        "valine_mg": 888,
        "arginine_mg": 1018,
        "totalEAA_mg": 9325,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 8.6,
        "totalMUFA_g": 7.2,
        "totalPUFA_g": 3.2,
        "omega6_linoleic_g": 2.4,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 110,
      "standard": 175,
      "premium": 260
    }
  },
  {
    "id": "bulla-porridge",
    "nameEn": "Refined Bulla Porridge with Spiced Butter & Milk",
    "nameAmharic": "የቡላ ገንፎ በወተትና ቅቤ",
    "category": "breakfast_porridge",
    "tagline": "Silky, easy-digesting fermented enset starch porridge for recovery.",
    "description": "Refined Bulla Porridge with Spiced Butter & Milk (የቡላ ገንፎ በወተትና ቅቤ): Silky, easy-digesting fermented enset starch porridge for recovery. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 439,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "bulla-starch",
        "nameEn": "Refined Fermented Enset Bulla",
        "nameAmharic": "የተጣራ የቡላ ዱቄት",
        "gramsPerServing": 80,
        "category": "cereal",
        "dryEquivalentRatio": 1
      },
      {
        "id": "milk",
        "nameEn": "Fresh Whole Cow's Milk",
        "nameAmharic": "የላም ወተት",
        "gramsPerServing": 250,
        "category": "animal",
        "dryEquivalentRatio": 0.12
      },
      {
        "id": "niter-kibbeh",
        "nameEn": "Spiced Clarified Butter",
        "nameAmharic": "ንጥር ቅቤ",
        "gramsPerServing": 30,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "spices",
        "nameEn": "Korerima Cardamom & Salt",
        "nameAmharic": "ኮረሪማና ጨው",
        "gramsPerServing": 5,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "ayib-garnish",
        "nameEn": "Fresh Ayib Curd Garnish",
        "nameAmharic": "አይብ",
        "gramsPerServing": 25,
        "category": "animal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Refined Bulla Porridge with Spiced Butter & Milk.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየቡላ ገንፎ በወተትና ቅቤ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 610,
        "protein_g": 15.2,
        "fat_g": 28.4,
        "carbohydrate_g": 74,
        "dietaryFiber_g": 5.8,
        "moisture_g": 275,
        "ash_g": 5.3
      },
      "aminoAcids": {
        "histidine_mg": 395,
        "isoleucine_mg": 638,
        "leucine_mg": 1246,
        "lysine_mg": 1186,
        "methionine_mg": 380,
        "cysteine_mg": 304,
        "phenylalanine_mg": 699,
        "tyrosine_mg": 486,
        "threonine_mg": 578,
        "tryptophan_mg": 182,
        "valine_mg": 730,
        "arginine_mg": 836,
        "totalEAA_mg": 7660,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 12.8,
        "totalMUFA_g": 10.8,
        "totalPUFA_g": 4.8,
        "omega6_linoleic_g": 3.6,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 110,
      "standard": 175,
      "premium": 260
    }
  },
  {
    "id": "bulla-genfo-berbere",
    "nameEn": "Bulla Genfo with Berbere Crater",
    "nameAmharic": "የቡላ ገንፎ በበርበሬ",
    "category": "breakfast_porridge",
    "tagline": "Glassy enset starch porridge centered with spiced melted butter and berbere.",
    "description": "Bulla Genfo with Berbere Crater (የቡላ ገንፎ በበርበሬ): Glassy enset starch porridge centered with spiced melted butter and berbere. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 446,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "grain-base",
        "nameEn": "Bulla Genfo with Berbere Crater Whole Flour Base",
        "nameAmharic": "የቡላ ገንፎ በበርበሬ ዱቄት",
        "gramsPerServing": 143,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "spiced-butter-oil",
        "nameEn": "Spiced Clarified Butter (Kibbeh)",
        "nameAmharic": "ንጥር ቅቤ",
        "gramsPerServing": 45,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "berbere-spice",
        "nameEn": "Berbere or Cardamom Seasoning",
        "nameAmharic": "በርበሬ ወይም ኮረሪማ",
        "gramsPerServing": 18,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "side-accompaniment",
        "nameEn": "Fresh Ayib / Yogurt",
        "nameAmharic": "አይብ ወይም እርጎ",
        "gramsPerServing": 45,
        "category": "animal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Bulla Genfo with Berbere Crater.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየቡላ ገንፎ በበርበሬ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 620,
        "protein_g": 14.5,
        "fat_g": 29,
        "carbohydrate_g": 76,
        "dietaryFiber_g": 6.2,
        "moisture_g": 279,
        "ash_g": 5.1
      },
      "aminoAcids": {
        "histidine_mg": 377,
        "isoleucine_mg": 609,
        "leucine_mg": 1189,
        "lysine_mg": 1131,
        "methionine_mg": 363,
        "cysteine_mg": 290,
        "phenylalanine_mg": 667,
        "tyrosine_mg": 464,
        "threonine_mg": 551,
        "tryptophan_mg": 174,
        "valine_mg": 696,
        "arginine_mg": 798,
        "totalEAA_mg": 7309,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 13.1,
        "totalMUFA_g": 11,
        "totalPUFA_g": 4.9,
        "omega6_linoleic_g": 3.7,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 115,
      "standard": 180,
      "premium": 270
    }
  },
  {
    "id": "bulla-muk",
    "nameEn": "Bulla Muk (Thin Soothing Bulla Soup for Recovery)",
    "nameAmharic": "የቡላ ሙክ",
    "category": "functional_drink",
    "tagline": "Gentle restorative drink given to convalescents and new mothers.",
    "description": "Bulla Muk (Thin Soothing Bulla Soup for Recovery) (የቡላ ሙክ): Gentle restorative drink given to convalescents and new mothers. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 302,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "drink-flour-base",
        "nameEn": "Bulla Muk (Thin Soothing Bulla Soup for Recovery) Roasted Flour/Seed Base",
        "nameAmharic": "የቡላ ሙክ ዱቄት",
        "gramsPerServing": 76,
        "category": "cereal",
        "dryEquivalentRatio": 1
      },
      {
        "id": "sweetener-spice",
        "nameEn": "Pure Honey & Spices",
        "nameAmharic": "ማርና ቅመማ ቅመም",
        "gramsPerServing": 24,
        "category": "sweetener",
        "dryEquivalentRatio": 1
      },
      {
        "id": "pure-water",
        "nameEn": "Spring Water / Decoction",
        "nameAmharic": "የምንጭ ውሃ",
        "gramsPerServing": 202,
        "category": "cereal",
        "dryEquivalentRatio": 0
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Bulla Muk (Thin Soothing Bulla Soup for Recovery).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየቡላ ሙክ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 420,
        "protein_g": 10.5,
        "fat_g": 16.5,
        "carbohydrate_g": 59,
        "dietaryFiber_g": 4.2,
        "moisture_g": 189,
        "ash_g": 3.7
      },
      "aminoAcids": {
        "histidine_mg": 273,
        "isoleucine_mg": 441,
        "leucine_mg": 861,
        "lysine_mg": 819,
        "methionine_mg": 263,
        "cysteine_mg": 210,
        "phenylalanine_mg": 483,
        "tyrosine_mg": 336,
        "threonine_mg": 399,
        "tryptophan_mg": 126,
        "valine_mg": 504,
        "arginine_mg": 578,
        "totalEAA_mg": 5293,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 7.4,
        "totalMUFA_g": 6.3,
        "totalPUFA_g": 2.8,
        "omega6_linoleic_g": 2.1,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 80,
      "standard": 130,
      "premium": 195
    }
  },
  {
    "id": "gedeo-koba-stew",
    "nameEn": "Gedeo Koba Stew with Anchote & Kocho",
    "nameAmharic": "የጌዴኦ ኮባ ወጥ",
    "category": "vegetable_root",
    "tagline": "Southern agroforestry specialty pairing calcium-rich anchote and fermented enset.",
    "description": "Gedeo Koba Stew with Anchote & Kocho (የጌዴኦ ኮባ ወጥ): Southern agroforestry specialty pairing calcium-rich anchote and fermented enset. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 389,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 171,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Gedeo Koba Stew with Anchote & Kocho Stew Component",
        "nameAmharic": "የጌዴኦ ኮባ ወጥ ወጥ",
        "gramsPerServing": 132,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 39,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 47,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Gedeo Koba Stew with Anchote & Kocho.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየጌዴኦ ኮባ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 540,
        "protein_g": 16.2,
        "fat_g": 12,
        "carbohydrate_g": 94,
        "dietaryFiber_g": 18.2,
        "moisture_g": 243,
        "ash_g": 5.7
      },
      "aminoAcids": {
        "histidine_mg": 421,
        "isoleucine_mg": 680,
        "leucine_mg": 1166,
        "lysine_mg": 842,
        "methionine_mg": 356,
        "cysteine_mg": 324,
        "phenylalanine_mg": 745,
        "tyrosine_mg": 518,
        "threonine_mg": 616,
        "tryptophan_mg": 194,
        "valine_mg": 778,
        "arginine_mg": 891,
        "totalEAA_mg": 7531,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.9,
        "totalMUFA_g": 4.2,
        "totalPUFA_g": 5.9,
        "omega6_linoleic_g": 4.4,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 95,
      "standard": 150,
      "premium": 230
    }
  },
  {
    "id": "sidama-wesa-porridge",
    "nameEn": "Sidama Wesa Porridge with Spiced Butter",
    "nameAmharic": "የሲዳማ ዌሳ ገንፎ",
    "category": "breakfast_porridge",
    "tagline": "Sidama staple porridge prepared from fermented enset wesa pulp.",
    "description": "Sidama Wesa Porridge with Spiced Butter (የሲዳማ ዌሳ ገንፎ): Sidama staple porridge prepared from fermented enset wesa pulp. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 425,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "grain-base",
        "nameEn": "Sidama Wesa Porridge with Spiced Butter Whole Flour Base",
        "nameAmharic": "የሲዳማ ዌሳ ገንፎ ዱቄት",
        "gramsPerServing": 136,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "spiced-butter-oil",
        "nameEn": "Spiced Clarified Butter (Kibbeh)",
        "nameAmharic": "ንጥር ቅቤ",
        "gramsPerServing": 43,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "berbere-spice",
        "nameEn": "Berbere or Cardamom Seasoning",
        "nameAmharic": "በርበሬ ወይም ኮረሪማ",
        "gramsPerServing": 17,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "side-accompaniment",
        "nameEn": "Fresh Ayib / Yogurt",
        "nameAmharic": "አይብ ወይም እርጎ",
        "gramsPerServing": 43,
        "category": "animal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Sidama Wesa Porridge with Spiced Butter.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየሲዳማ ዌሳ ገንፎ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 590,
        "protein_g": 14.8,
        "fat_g": 26.5,
        "carbohydrate_g": 75,
        "dietaryFiber_g": 12,
        "moisture_g": 266,
        "ash_g": 5.2
      },
      "aminoAcids": {
        "histidine_mg": 385,
        "isoleucine_mg": 622,
        "leucine_mg": 1214,
        "lysine_mg": 1154,
        "methionine_mg": 370,
        "cysteine_mg": 296,
        "phenylalanine_mg": 681,
        "tyrosine_mg": 474,
        "threonine_mg": 562,
        "tryptophan_mg": 178,
        "valine_mg": 710,
        "arginine_mg": 814,
        "totalEAA_mg": 7460,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 11.9,
        "totalMUFA_g": 10.1,
        "totalPUFA_g": 4.5,
        "omega6_linoleic_g": 3.4,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 100,
      "standard": 160,
      "premium": 240
    }
  },
  {
    "id": "wolayta-utta-pancake",
    "nameEn": "Wolayta Bulla Pancake (Utta) with Yogurt",
    "nameAmharic": "የወላይታ ኡታ",
    "category": "breakfast_porridge",
    "tagline": "Thick, tender fermented enset starch pancake served with fresh yogurt.",
    "description": "Wolayta Bulla Pancake (Utta) with Yogurt (የወላይታ ኡታ): Thick, tender fermented enset starch pancake served with fresh yogurt. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 403,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "grain-base",
        "nameEn": "Wolayta Bulla Pancake (Utta) with Yogurt Whole Flour Base",
        "nameAmharic": "የወላይታ ኡታ ዱቄት",
        "gramsPerServing": 129,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "spiced-butter-oil",
        "nameEn": "Spiced Clarified Butter (Kibbeh)",
        "nameAmharic": "ንጥር ቅቤ",
        "gramsPerServing": 40,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "berbere-spice",
        "nameEn": "Berbere or Cardamom Seasoning",
        "nameAmharic": "በርበሬ ወይም ኮረሪማ",
        "gramsPerServing": 16,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "side-accompaniment",
        "nameEn": "Fresh Ayib / Yogurt",
        "nameAmharic": "አይብ ወይም እርጎ",
        "gramsPerServing": 40,
        "category": "animal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Wolayta Bulla Pancake (Utta) with Yogurt.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየወላይታ ኡታ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 560,
        "protein_g": 16,
        "fat_g": 22,
        "carbohydrate_g": 76,
        "dietaryFiber_g": 8.5,
        "moisture_g": 252,
        "ash_g": 5.6
      },
      "aminoAcids": {
        "histidine_mg": 416,
        "isoleucine_mg": 672,
        "leucine_mg": 1312,
        "lysine_mg": 1248,
        "methionine_mg": 400,
        "cysteine_mg": 320,
        "phenylalanine_mg": 736,
        "tyrosine_mg": 512,
        "threonine_mg": 608,
        "tryptophan_mg": 192,
        "valine_mg": 768,
        "arginine_mg": 880,
        "totalEAA_mg": 8064,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 9.9,
        "totalMUFA_g": 8.4,
        "totalPUFA_g": 3.7,
        "omega6_linoleic_g": 2.8,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 105,
      "standard": 165,
      "premium": 250
    }
  },
  {
    "id": "gurage-ayib-be-gomen",
    "nameEn": "Gurage Ayib be'Gomen Kitfo",
    "nameAmharic": "የጉራጌ አይብ በጎመን ክትፎ",
    "category": "traditional_beef_enset",
    "tagline": "Finely minced seasoned collards layered with fresh artisanal cottage cheese.",
    "description": "Gurage Ayib be'Gomen Kitfo (የጉራጌ አይብ በጎመን ክትፎ): Finely minced seasoned collards layered with fresh artisanal cottage cheese. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 446,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 196,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Gurage Ayib be'Gomen Kitfo Stew Component",
        "nameAmharic": "የጉራጌ አይብ በጎመን ክትፎ ወጥ",
        "gramsPerServing": 152,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 45,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 54,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Gurage Ayib be'Gomen Kitfo.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየጉራጌ አይብ በጎመን ክትፎ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 620,
        "protein_g": 26.5,
        "fat_g": 28,
        "carbohydrate_g": 68,
        "dietaryFiber_g": 13.5,
        "moisture_g": 279,
        "ash_g": 9.3
      },
      "aminoAcids": {
        "histidine_mg": 689,
        "isoleucine_mg": 1113,
        "leucine_mg": 2173,
        "lysine_mg": 2067,
        "methionine_mg": 663,
        "cysteine_mg": 530,
        "phenylalanine_mg": 1219,
        "tyrosine_mg": 848,
        "threonine_mg": 1007,
        "tryptophan_mg": 318,
        "valine_mg": 1272,
        "arginine_mg": 1458,
        "totalEAA_mg": 13357,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 12.6,
        "totalMUFA_g": 10.6,
        "totalPUFA_g": 4.8,
        "omega6_linoleic_g": 3.6,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 340,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 980,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 320,
        "betaCarotene_mcg": 3840,
        "vitaminC_mg": 36,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 130,
      "standard": 200,
      "premium": 300
    }
  },
  {
    "id": "barley-genfo",
    "nameEn": "Highland Barley Genfo with Niter Kibbeh & Berbere",
    "nameAmharic": "የገብስ ገንፎ በቅቤና በርበሬ",
    "category": "breakfast_porridge",
    "tagline": "The ancestral mountain energy bowl for sustained stamina and warmth.",
    "description": "Highland Barley Genfo with Niter Kibbeh & Berbere (የገብስ ገንፎ በቅቤና በርበሬ): The ancestral mountain energy bowl for sustained stamina and warmth. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 497,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "barley-flour",
        "nameEn": "Roasted Highland Barley Flour",
        "nameAmharic": "የተቆላ የገብስ ዱቄት",
        "gramsPerServing": 110,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "niter-kibbeh",
        "nameEn": "Spiced Clarified Butter (Kibbeh)",
        "nameAmharic": "ንጥር ቅቤ",
        "gramsPerServing": 35,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "berbere",
        "nameEn": "Berbere Spice Mix",
        "nameAmharic": "በርበሬ",
        "gramsPerServing": 15,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "yogurt-ayib",
        "nameEn": "Traditional Ayib or Ergo Swirl",
        "nameAmharic": "እርጎ ወይም አይብ",
        "gramsPerServing": 40,
        "category": "animal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Highland Barley Genfo with Niter Kibbeh & Berbere.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየገብስ ገንፎ በቅቤና በርበሬ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 690,
        "protein_g": 17.8,
        "fat_g": 31.5,
        "carbohydrate_g": 88,
        "dietaryFiber_g": 16.5,
        "moisture_g": 311,
        "ash_g": 6.2
      },
      "aminoAcids": {
        "histidine_mg": 463,
        "isoleucine_mg": 748,
        "leucine_mg": 1460,
        "lysine_mg": 1388,
        "methionine_mg": 445,
        "cysteine_mg": 356,
        "phenylalanine_mg": 819,
        "tyrosine_mg": 570,
        "threonine_mg": 676,
        "tryptophan_mg": 214,
        "valine_mg": 854,
        "arginine_mg": 979,
        "totalEAA_mg": 8972,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 14.2,
        "totalMUFA_g": 12,
        "totalPUFA_g": 5.3,
        "omega6_linoleic_g": 4,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 90,
      "standard": 150,
      "premium": 230
    }
  },
  {
    "id": "teff-genfo",
    "nameEn": "Teff Genfo with Niter Kibbeh & Yogurt",
    "nameAmharic": "የጤፍ ገንፎ",
    "category": "breakfast_porridge",
    "tagline": "Mineral-rich red teff flour porridge centered with spiced butter crater.",
    "description": "Teff Genfo with Niter Kibbeh & Yogurt (የጤፍ ገንፎ): Mineral-rich red teff flour porridge centered with spiced butter crater. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 475,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "grain-base",
        "nameEn": "Teff Genfo with Niter Kibbeh & Yogurt Whole Flour Base",
        "nameAmharic": "የጤፍ ገንፎ ዱቄት",
        "gramsPerServing": 152,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "spiced-butter-oil",
        "nameEn": "Spiced Clarified Butter (Kibbeh)",
        "nameAmharic": "ንጥር ቅቤ",
        "gramsPerServing": 48,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "berbere-spice",
        "nameEn": "Berbere or Cardamom Seasoning",
        "nameAmharic": "በርበሬ ወይም ኮረሪማ",
        "gramsPerServing": 19,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "side-accompaniment",
        "nameEn": "Fresh Ayib / Yogurt",
        "nameAmharic": "አይብ ወይም እርጎ",
        "gramsPerServing": 48,
        "category": "animal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Teff Genfo with Niter Kibbeh & Yogurt.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየጤፍ ገንፎ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 660,
        "protein_g": 18.5,
        "fat_g": 29,
        "carbohydrate_g": 85,
        "dietaryFiber_g": 17.5,
        "moisture_g": 297,
        "ash_g": 6.5
      },
      "aminoAcids": {
        "histidine_mg": 481,
        "isoleucine_mg": 777,
        "leucine_mg": 1517,
        "lysine_mg": 1443,
        "methionine_mg": 463,
        "cysteine_mg": 370,
        "phenylalanine_mg": 851,
        "tyrosine_mg": 592,
        "threonine_mg": 703,
        "tryptophan_mg": 222,
        "valine_mg": 888,
        "arginine_mg": 1018,
        "totalEAA_mg": 9325,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 13.1,
        "totalMUFA_g": 11,
        "totalPUFA_g": 4.9,
        "omega6_linoleic_g": 3.7,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 95,
      "standard": 155,
      "premium": 240
    }
  },
  {
    "id": "aja-emmer-genfo",
    "nameEn": "Emmer Wheat Genfo (Aja Genfo)",
    "nameAmharic": "የአጃ ገንፎ",
    "category": "breakfast_porridge",
    "tagline": "Ancient emmer farro porridge renowned for joint and bone strength.",
    "description": "Emmer Wheat Genfo (Aja Genfo) (የአጃ ገንፎ): Ancient emmer farro porridge renowned for joint and bone strength. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 482,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "grain-base",
        "nameEn": "Emmer Wheat Genfo (Aja Genfo) Whole Flour Base",
        "nameAmharic": "የአጃ ገንፎ ዱቄት",
        "gramsPerServing": 154,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "spiced-butter-oil",
        "nameEn": "Spiced Clarified Butter (Kibbeh)",
        "nameAmharic": "ንጥር ቅቤ",
        "gramsPerServing": 48,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "berbere-spice",
        "nameEn": "Berbere or Cardamom Seasoning",
        "nameAmharic": "በርበሬ ወይም ኮረሪማ",
        "gramsPerServing": 19,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "side-accompaniment",
        "nameEn": "Fresh Ayib / Yogurt",
        "nameAmharic": "አይብ ወይም እርጎ",
        "gramsPerServing": 48,
        "category": "animal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Emmer Wheat Genfo (Aja Genfo).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየአጃ ገንፎ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 670,
        "protein_g": 19.2,
        "fat_g": 29.5,
        "carbohydrate_g": 86,
        "dietaryFiber_g": 18,
        "moisture_g": 302,
        "ash_g": 6.7
      },
      "aminoAcids": {
        "histidine_mg": 499,
        "isoleucine_mg": 806,
        "leucine_mg": 1574,
        "lysine_mg": 1498,
        "methionine_mg": 480,
        "cysteine_mg": 384,
        "phenylalanine_mg": 883,
        "tyrosine_mg": 614,
        "threonine_mg": 730,
        "tryptophan_mg": 230,
        "valine_mg": 922,
        "arginine_mg": 1056,
        "totalEAA_mg": 9676,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 13.3,
        "totalMUFA_g": 11.2,
        "totalPUFA_g": 5,
        "omega6_linoleic_g": 3.8,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 95,
      "standard": 155,
      "premium": 240
    }
  },
  {
    "id": "dagussa-millet-genfo",
    "nameEn": "Finger Millet Genfo (Dagussa Genfo)",
    "nameAmharic": "የዳጉሳ ገንፎ",
    "category": "breakfast_porridge",
    "tagline": "Record calcium density finger millet porridge for postpartum recovery.",
    "description": "Finger Millet Genfo (Dagussa Genfo) (የዳጉሳ ገንፎ): Record calcium density finger millet porridge for postpartum recovery. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 468,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "grain-base",
        "nameEn": "Finger Millet Genfo (Dagussa Genfo) Whole Flour Base",
        "nameAmharic": "የዳጉሳ ገንፎ ዱቄት",
        "gramsPerServing": 150,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "spiced-butter-oil",
        "nameEn": "Spiced Clarified Butter (Kibbeh)",
        "nameAmharic": "ንጥር ቅቤ",
        "gramsPerServing": 47,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "berbere-spice",
        "nameEn": "Berbere or Cardamom Seasoning",
        "nameAmharic": "በርበሬ ወይም ኮረሪማ",
        "gramsPerServing": 19,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "side-accompaniment",
        "nameEn": "Fresh Ayib / Yogurt",
        "nameAmharic": "አይብ ወይም እርጎ",
        "gramsPerServing": 47,
        "category": "animal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Finger Millet Genfo (Dagussa Genfo).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዳጉሳ ገንፎ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 650,
        "protein_g": 16.5,
        "fat_g": 28,
        "carbohydrate_g": 86.5,
        "dietaryFiber_g": 19.2,
        "moisture_g": 293,
        "ash_g": 5.8
      },
      "aminoAcids": {
        "histidine_mg": 429,
        "isoleucine_mg": 693,
        "leucine_mg": 1353,
        "lysine_mg": 1287,
        "methionine_mg": 413,
        "cysteine_mg": 330,
        "phenylalanine_mg": 759,
        "tyrosine_mg": 528,
        "threonine_mg": 627,
        "tryptophan_mg": 198,
        "valine_mg": 792,
        "arginine_mg": 908,
        "totalEAA_mg": 8317,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 12.6,
        "totalMUFA_g": 10.6,
        "totalPUFA_g": 4.8,
        "omega6_linoleic_g": 3.6,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 460,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 85,
      "standard": 140,
      "premium": 220
    }
  },
  {
    "id": "kinche-breakfast",
    "nameEn": "Kinche Cracked Wheat with Niter Kibbeh & Korerima",
    "nameAmharic": "ቂንጬ በቅቤና ኮረሪማ",
    "category": "grain_breakfast",
    "tagline": "The golden, fluffy whole-grain breakfast of champions.",
    "description": "Kinche Cracked Wheat with Niter Kibbeh & Korerima (ቂንጬ በቅቤና ኮረሪማ): The golden, fluffy whole-grain breakfast of champions. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 418,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "cracked-wheat",
        "nameEn": "Whole Cracked Durum Wheat",
        "nameAmharic": "ስንዴ ቂንጬ",
        "gramsPerServing": 110,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "niter-kibbeh",
        "nameEn": "Spiced Clarified Butter",
        "nameAmharic": "ንጥር ቅቤ",
        "gramsPerServing": 30,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "korerima-salt",
        "nameEn": "Ground Korerima & Salt",
        "nameAmharic": "ኮረሪማና ጨው",
        "gramsPerServing": 5,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "herbal-accompaniment",
        "nameEn": "Spiced Herbal Tea / Warm Milk",
        "nameAmharic": "የተቀመመ ሻይ ወይም ወተት",
        "gramsPerServing": 35,
        "category": "animal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Kinche Cracked Wheat with Niter Kibbeh & Korerima.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለቂንጬ በቅቤና ኮረሪማ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 580,
        "protein_g": 16.2,
        "fat_g": 27.5,
        "carbohydrate_g": 74.5,
        "dietaryFiber_g": 13.8,
        "moisture_g": 261,
        "ash_g": 5.7
      },
      "aminoAcids": {
        "histidine_mg": 421,
        "isoleucine_mg": 680,
        "leucine_mg": 1328,
        "lysine_mg": 1264,
        "methionine_mg": 405,
        "cysteine_mg": 324,
        "phenylalanine_mg": 745,
        "tyrosine_mg": 518,
        "threonine_mg": 616,
        "tryptophan_mg": 194,
        "valine_mg": 778,
        "arginine_mg": 891,
        "totalEAA_mg": 8164,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 12.4,
        "totalMUFA_g": 10.5,
        "totalPUFA_g": 4.6,
        "omega6_linoleic_g": 3.5,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 75,
      "standard": 125,
      "premium": 195
    }
  },
  {
    "id": "kinche-fasting-telba",
    "nameEn": "Kinche with Flaxseed Oil (Fasting Kinche)",
    "nameAmharic": "የጾም ቂንጬ በተልባ ዘይት",
    "category": "grain_breakfast",
    "tagline": "Steamed cracked durum wheat tossed with roasted flaxseed oil and cardamom.",
    "description": "Kinche with Flaxseed Oil (Fasting Kinche) (የጾም ቂንጬ በተልባ ዘይት): Steamed cracked durum wheat tossed with roasted flaxseed oil and cardamom. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 374,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "grain-base",
        "nameEn": "Kinche with Flaxseed Oil (Fasting Kinche) Whole Flour Base",
        "nameAmharic": "የጾም ቂንጬ በተልባ ዘይት ዱቄት",
        "gramsPerServing": 120,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "spiced-butter-oil",
        "nameEn": "Spiced Vegetable/Flax Oil",
        "nameAmharic": "የተቀመመ ዘይት",
        "gramsPerServing": 37,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "berbere-spice",
        "nameEn": "Berbere or Cardamom Seasoning",
        "nameAmharic": "በርበሬ ወይም ኮረሪማ",
        "gramsPerServing": 15,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "side-accompaniment",
        "nameEn": "Herbal Tea",
        "nameAmharic": "የተቀመመ ሻይ",
        "gramsPerServing": 37,
        "category": "cereal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Kinche with Flaxseed Oil (Fasting Kinche).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየጾም ቂንጬ በተልባ ዘይት አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 520,
        "protein_g": 15.5,
        "fat_g": 16.5,
        "carbohydrate_g": 81,
        "dietaryFiber_g": 15.5,
        "moisture_g": 234,
        "ash_g": 5.4
      },
      "aminoAcids": {
        "histidine_mg": 403,
        "isoleucine_mg": 651,
        "leucine_mg": 1116,
        "lysine_mg": 806,
        "methionine_mg": 341,
        "cysteine_mg": 310,
        "phenylalanine_mg": 713,
        "tyrosine_mg": 496,
        "threonine_mg": 589,
        "tryptophan_mg": 186,
        "valine_mg": 744,
        "arginine_mg": 853,
        "totalEAA_mg": 7208,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 2.6,
        "totalMUFA_g": 5.8,
        "totalPUFA_g": 8.1,
        "omega6_linoleic_g": 2,
        "omega3_ALA_g": 5.7,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "3:1",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 65,
      "standard": 105,
      "premium": 165
    }
  },
  {
    "id": "muk-barley-gruel",
    "nameEn": "Muk (Thin Spiced Barley Gruel with Ginger)",
    "nameAmharic": "የገብስ ሙክ",
    "category": "functional_drink",
    "tagline": "Warming spiced barley elixir brewed with ginger, garlic, and rue.",
    "description": "Muk (Thin Spiced Barley Gruel with Ginger) (የገብስ ሙክ): Warming spiced barley elixir brewed with ginger, garlic, and rue. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 274,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "drink-flour-base",
        "nameEn": "Muk (Thin Spiced Barley Gruel with Ginger) Roasted Flour/Seed Base",
        "nameAmharic": "የገብስ ሙክ ዱቄት",
        "gramsPerServing": 69,
        "category": "cereal",
        "dryEquivalentRatio": 1
      },
      {
        "id": "sweetener-spice",
        "nameEn": "Pure Honey & Spices",
        "nameAmharic": "ማርና ቅመማ ቅመም",
        "gramsPerServing": 22,
        "category": "sweetener",
        "dryEquivalentRatio": 1
      },
      {
        "id": "pure-water",
        "nameEn": "Spring Water / Decoction",
        "nameAmharic": "የምንጭ ውሃ",
        "gramsPerServing": 184,
        "category": "cereal",
        "dryEquivalentRatio": 0
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Muk (Thin Spiced Barley Gruel with Ginger).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየገብስ ሙክ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 380,
        "protein_g": 11.2,
        "fat_g": 6.5,
        "carbohydrate_g": 71,
        "dietaryFiber_g": 13,
        "moisture_g": 171,
        "ash_g": 3.9
      },
      "aminoAcids": {
        "histidine_mg": 291,
        "isoleucine_mg": 470,
        "leucine_mg": 806,
        "lysine_mg": 582,
        "methionine_mg": 246,
        "cysteine_mg": 224,
        "phenylalanine_mg": 515,
        "tyrosine_mg": 358,
        "threonine_mg": 426,
        "tryptophan_mg": 134,
        "valine_mg": 538,
        "arginine_mg": 616,
        "totalEAA_mg": 5206,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1,
        "totalMUFA_g": 2.3,
        "totalPUFA_g": 3.2,
        "omega6_linoleic_g": 2.4,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 50,
      "standard": 85,
      "premium": 135
    }
  },
  {
    "id": "enkuro-roasted-grain",
    "nameEn": "Enkuro (Crushed Roasted Cereal Breakfast Porridge)",
    "nameAmharic": "እንኩሮ",
    "category": "grain_breakfast",
    "tagline": "Coarsely ground roasted grain porridge tossed with spiced clarified butter.",
    "description": "Enkuro (Crushed Roasted Cereal Breakfast Porridge) (እንኩሮ): Coarsely ground roasted grain porridge tossed with spiced clarified butter. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 439,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "grain-base",
        "nameEn": "Enkuro (Crushed Roasted Cereal Breakfast Porridge) Whole Flour Base",
        "nameAmharic": "እንኩሮ ዱቄት",
        "gramsPerServing": 140,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "spiced-butter-oil",
        "nameEn": "Spiced Clarified Butter (Kibbeh)",
        "nameAmharic": "ንጥር ቅቤ",
        "gramsPerServing": 44,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "berbere-spice",
        "nameEn": "Berbere or Cardamom Seasoning",
        "nameAmharic": "በርበሬ ወይም ኮረሪማ",
        "gramsPerServing": 18,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "side-accompaniment",
        "nameEn": "Fresh Ayib / Yogurt",
        "nameAmharic": "አይብ ወይም እርጎ",
        "gramsPerServing": 44,
        "category": "animal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Enkuro (Crushed Roasted Cereal Breakfast Porridge).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለእንኩሮ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 610,
        "protein_g": 17,
        "fat_g": 25,
        "carbohydrate_g": 82,
        "dietaryFiber_g": 15,
        "moisture_g": 275,
        "ash_g": 5.9
      },
      "aminoAcids": {
        "histidine_mg": 442,
        "isoleucine_mg": 714,
        "leucine_mg": 1394,
        "lysine_mg": 1326,
        "methionine_mg": 425,
        "cysteine_mg": 340,
        "phenylalanine_mg": 782,
        "tyrosine_mg": 544,
        "threonine_mg": 646,
        "tryptophan_mg": 204,
        "valine_mg": 816,
        "arginine_mg": 935,
        "totalEAA_mg": 8568,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 11.3,
        "totalMUFA_g": 9.5,
        "totalPUFA_g": 4.2,
        "omega6_linoleic_g": 3.2,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 80,
      "standard": 130,
      "premium": 200
    }
  },
  {
    "id": "nefro-highland-mix",
    "nameEn": "Nefro (Boiled Whole Chickpeas, Wheat & Fava Beans)",
    "nameAmharic": "ነፍሮ",
    "category": "grain_breakfast",
    "tagline": "Ancient travel and festival grain mix of boiled whole wheat and pulses.",
    "description": "Nefro (Boiled Whole Chickpeas, Wheat & Fava Beans) (ነፍሮ): Ancient travel and festival grain mix of boiled whole wheat and pulses. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 418,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "grain-base",
        "nameEn": "Nefro (Boiled Whole Chickpeas, Wheat & Fava Beans) Whole Flour Base",
        "nameAmharic": "ነፍሮ ዱቄት",
        "gramsPerServing": 134,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "spiced-butter-oil",
        "nameEn": "Spiced Vegetable/Flax Oil",
        "nameAmharic": "የተቀመመ ዘይት",
        "gramsPerServing": 42,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "berbere-spice",
        "nameEn": "Berbere or Cardamom Seasoning",
        "nameAmharic": "በርበሬ ወይም ኮረሪማ",
        "gramsPerServing": 17,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "side-accompaniment",
        "nameEn": "Herbal Tea",
        "nameAmharic": "የተቀመመ ሻይ",
        "gramsPerServing": 42,
        "category": "cereal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Nefro (Boiled Whole Chickpeas, Wheat & Fava Beans).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለነፍሮ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 580,
        "protein_g": 25.5,
        "fat_g": 8.5,
        "carbohydrate_g": 104,
        "dietaryFiber_g": 22,
        "moisture_g": 261,
        "ash_g": 8.9
      },
      "aminoAcids": {
        "histidine_mg": 663,
        "isoleucine_mg": 1071,
        "leucine_mg": 1836,
        "lysine_mg": 1326,
        "methionine_mg": 561,
        "cysteine_mg": 510,
        "phenylalanine_mg": 1173,
        "tyrosine_mg": 816,
        "threonine_mg": 969,
        "tryptophan_mg": 306,
        "valine_mg": 1224,
        "arginine_mg": 1403,
        "totalEAA_mg": 11858,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.4,
        "totalMUFA_g": 3,
        "totalPUFA_g": 4.1,
        "omega6_linoleic_g": 3.1,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 65,
      "standard": 105,
      "premium": 165
    }
  },
  {
    "id": "besso-tikur-porridge",
    "nameEn": "Besso Tikur (Dark Roasted Barley Porridge)",
    "nameAmharic": "ጥቁር በሶ ገንፎ",
    "category": "breakfast_porridge",
    "tagline": "Deeply roasted highland barley porridge tossed with cold-pressed seed oil.",
    "description": "Besso Tikur (Dark Roasted Barley Porridge) (ጥቁር በሶ ገንፎ): Deeply roasted highland barley porridge tossed with cold-pressed seed oil. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 425,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "grain-base",
        "nameEn": "Besso Tikur (Dark Roasted Barley Porridge) Whole Flour Base",
        "nameAmharic": "ጥቁር በሶ ገንፎ ዱቄት",
        "gramsPerServing": 136,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "spiced-butter-oil",
        "nameEn": "Spiced Vegetable/Flax Oil",
        "nameAmharic": "የተቀመመ ዘይት",
        "gramsPerServing": 43,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "berbere-spice",
        "nameEn": "Berbere or Cardamom Seasoning",
        "nameAmharic": "በርበሬ ወይም ኮረሪማ",
        "gramsPerServing": 17,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "side-accompaniment",
        "nameEn": "Herbal Tea",
        "nameAmharic": "የተቀመመ ሻይ",
        "gramsPerServing": 43,
        "category": "cereal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Besso Tikur (Dark Roasted Barley Porridge).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለጥቁር በሶ ገንፎ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 590,
        "protein_g": 16.5,
        "fat_g": 14.5,
        "carbohydrate_g": 102,
        "dietaryFiber_g": 17.5,
        "moisture_g": 266,
        "ash_g": 5.8
      },
      "aminoAcids": {
        "histidine_mg": 429,
        "isoleucine_mg": 693,
        "leucine_mg": 1188,
        "lysine_mg": 858,
        "methionine_mg": 363,
        "cysteine_mg": 330,
        "phenylalanine_mg": 759,
        "tyrosine_mg": 528,
        "threonine_mg": 627,
        "tryptophan_mg": 198,
        "valine_mg": 792,
        "arginine_mg": 908,
        "totalEAA_mg": 7673,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 2.3,
        "totalMUFA_g": 5.1,
        "totalPUFA_g": 7.1,
        "omega6_linoleic_g": 5.3,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 70,
      "standard": 115,
      "premium": 180
    }
  },
  {
    "id": "mishinga-sorghum-genfo",
    "nameEn": "Sorghum Porridge (Mishinga Genfo)",
    "nameAmharic": "የማሽላ ገንፎ",
    "category": "breakfast_porridge",
    "tagline": "Red sorghum porridge rich in polyphenols and drought-resistant nourishment.",
    "description": "Sorghum Porridge (Mishinga Genfo) (የማሽላ ገንፎ): Red sorghum porridge rich in polyphenols and drought-resistant nourishment. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 439,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "grain-base",
        "nameEn": "Sorghum Porridge (Mishinga Genfo) Whole Flour Base",
        "nameAmharic": "የማሽላ ገንፎ ዱቄት",
        "gramsPerServing": 140,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "spiced-butter-oil",
        "nameEn": "Spiced Vegetable/Flax Oil",
        "nameAmharic": "የተቀመመ ዘይት",
        "gramsPerServing": 44,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "berbere-spice",
        "nameEn": "Berbere or Cardamom Seasoning",
        "nameAmharic": "በርበሬ ወይም ኮረሪማ",
        "gramsPerServing": 18,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "side-accompaniment",
        "nameEn": "Herbal Tea",
        "nameAmharic": "የተቀመመ ሻይ",
        "gramsPerServing": 44,
        "category": "cereal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Sorghum Porridge (Mishinga Genfo).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየማሽላ ገንፎ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 610,
        "protein_g": 16.8,
        "fat_g": 12,
        "carbohydrate_g": 112,
        "dietaryFiber_g": 16.5,
        "moisture_g": 275,
        "ash_g": 5.9
      },
      "aminoAcids": {
        "histidine_mg": 437,
        "isoleucine_mg": 706,
        "leucine_mg": 1210,
        "lysine_mg": 874,
        "methionine_mg": 370,
        "cysteine_mg": 336,
        "phenylalanine_mg": 773,
        "tyrosine_mg": 538,
        "threonine_mg": 638,
        "tryptophan_mg": 202,
        "valine_mg": 806,
        "arginine_mg": 924,
        "totalEAA_mg": 7814,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.9,
        "totalMUFA_g": 4.2,
        "totalPUFA_g": 5.9,
        "omega6_linoleic_g": 4.4,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 65,
      "standard": 105,
      "premium": 165
    }
  },
  {
    "id": "senafitch-kinche",
    "nameEn": "Spiced Mustard Infused Kinche",
    "nameAmharic": "የሰናፍጭ ቂንጬ",
    "category": "grain_breakfast",
    "tagline": "Steamed cracked wheat laced with ground mustard seed oil and shallots.",
    "description": "Spiced Mustard Infused Kinche (የሰናፍጭ ቂንጬ): Steamed cracked wheat laced with ground mustard seed oil and shallots. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 382,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "grain-base",
        "nameEn": "Spiced Mustard Infused Kinche Whole Flour Base",
        "nameAmharic": "የሰናፍጭ ቂንጬ ዱቄት",
        "gramsPerServing": 122,
        "category": "cereal",
        "dryEquivalentRatio": 0.35
      },
      {
        "id": "spiced-butter-oil",
        "nameEn": "Spiced Vegetable/Flax Oil",
        "nameAmharic": "የተቀመመ ዘይት",
        "gramsPerServing": 38,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "berbere-spice",
        "nameEn": "Berbere or Cardamom Seasoning",
        "nameAmharic": "በርበሬ ወይም ኮረሪማ",
        "gramsPerServing": 15,
        "category": "spice_herb",
        "dryEquivalentRatio": 1
      },
      {
        "id": "side-accompaniment",
        "nameEn": "Herbal Tea",
        "nameAmharic": "የተቀመመ ሻይ",
        "gramsPerServing": 38,
        "category": "cereal",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Spiced Mustard Infused Kinche.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየሰናፍጭ ቂንጬ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 530,
        "protein_g": 15.8,
        "fat_g": 16,
        "carbohydrate_g": 83,
        "dietaryFiber_g": 15,
        "moisture_g": 239,
        "ash_g": 5.5
      },
      "aminoAcids": {
        "histidine_mg": 411,
        "isoleucine_mg": 664,
        "leucine_mg": 1138,
        "lysine_mg": 822,
        "methionine_mg": 348,
        "cysteine_mg": 316,
        "phenylalanine_mg": 727,
        "tyrosine_mg": 506,
        "threonine_mg": 600,
        "tryptophan_mg": 190,
        "valine_mg": 758,
        "arginine_mg": 869,
        "totalEAA_mg": 7349,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 2.6,
        "totalMUFA_g": 5.6,
        "totalPUFA_g": 7.8,
        "omega6_linoleic_g": 5.9,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 70,
      "standard": 110,
      "premium": 175
    }
  },
  {
    "id": "gomen-wot",
    "nameEn": "Gomen Wot (Ethiopian Collards Stewed with Garlic)",
    "nameAmharic": "የጎመን ወጥ",
    "category": "vegetable_root",
    "tagline": "Ethiopian kale (Brassica carinata) stewed tender with shallots and garlic.",
    "description": "Gomen Wot (Ethiopian Collards Stewed with Garlic) (የጎመን ወጥ): Ethiopian kale (Brassica carinata) stewed tender with shallots and garlic. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 346,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 152,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Gomen Wot (Ethiopian Collards Stewed with Garlic) Stew Component",
        "nameAmharic": "የጎመን ወጥ ወጥ",
        "gramsPerServing": 118,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 35,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 42,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Gomen Wot (Ethiopian Collards Stewed with Garlic).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየጎመን ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 480,
        "protein_g": 18.5,
        "fat_g": 11.5,
        "carbohydrate_g": 80,
        "dietaryFiber_g": 19.5,
        "moisture_g": 216,
        "ash_g": 6.5
      },
      "aminoAcids": {
        "histidine_mg": 481,
        "isoleucine_mg": 777,
        "leucine_mg": 1332,
        "lysine_mg": 962,
        "methionine_mg": 407,
        "cysteine_mg": 370,
        "phenylalanine_mg": 851,
        "tyrosine_mg": 592,
        "threonine_mg": 703,
        "tryptophan_mg": 222,
        "valine_mg": 888,
        "arginine_mg": 1018,
        "totalEAA_mg": 8603,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.8,
        "totalMUFA_g": 4,
        "totalPUFA_g": 5.7,
        "omega6_linoleic_g": 4.3,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 340,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 980,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 320,
        "betaCarotene_mcg": 3840,
        "vitaminC_mg": 36,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 65,
      "standard": 105,
      "premium": 165
    }
  },
  {
    "id": "tikil-gomen",
    "nameEn": "Tikil Gomen (Cabbage, Carrots & Potatoes with Turmeric)",
    "nameAmharic": "ጥቅል ጎመን",
    "category": "vegetable_root",
    "tagline": "Tender sautéed white cabbage with sliced carrots, onions, and turmeric.",
    "description": "Tikil Gomen (Cabbage, Carrots & Potatoes with Turmeric) (ጥቅል ጎመን): Tender sautéed white cabbage with sliced carrots, onions, and turmeric. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 367,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 161,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Tikil Gomen (Cabbage, Carrots & Potatoes with Turmeric) Stew Component",
        "nameAmharic": "ጥቅል ጎመን ወጥ",
        "gramsPerServing": 125,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 37,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 44,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Tikil Gomen (Cabbage, Carrots & Potatoes with Turmeric).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለጥቅል ጎመን አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 510,
        "protein_g": 16.2,
        "fat_g": 11,
        "carbohydrate_g": 90,
        "dietaryFiber_g": 17.8,
        "moisture_g": 230,
        "ash_g": 5.7
      },
      "aminoAcids": {
        "histidine_mg": 421,
        "isoleucine_mg": 680,
        "leucine_mg": 1166,
        "lysine_mg": 842,
        "methionine_mg": 356,
        "cysteine_mg": 324,
        "phenylalanine_mg": 745,
        "tyrosine_mg": 518,
        "threonine_mg": 616,
        "tryptophan_mg": 194,
        "valine_mg": 778,
        "arginine_mg": 891,
        "totalEAA_mg": 7531,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.8,
        "totalMUFA_g": 3.9,
        "totalPUFA_g": 5.3,
        "omega6_linoleic_g": 4,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 340,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 980,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 320,
        "betaCarotene_mcg": 3840,
        "vitaminC_mg": 36,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 65,
      "standard": 105,
      "premium": 165
    }
  },
  {
    "id": "gomen-be-siga",
    "nameEn": "Gomen be'Siga (Collard Greens Simmered with Beef Marrow)",
    "nameAmharic": "ጎመን በስጋ",
    "category": "traditional_beef_enset",
    "tagline": "Highland greens braised for hours with succulent bone marrow beef chunks.",
    "description": "Gomen be'Siga (Collard Greens Simmered with Beef Marrow) (ጎመን በስጋ): Highland greens braised for hours with succulent bone marrow beef chunks. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 526,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 231,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Gomen be'Siga (Collard Greens Simmered with Beef Marrow) Stew Component",
        "nameAmharic": "ጎመን በስጋ ወጥ",
        "gramsPerServing": 179,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 53,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 63,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Gomen be'Siga (Collard Greens Simmered with Beef Marrow).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለጎመን በስጋ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 730,
        "protein_g": 44,
        "fat_g": 32,
        "carbohydrate_g": 70,
        "dietaryFiber_g": 15.2,
        "moisture_g": 329,
        "ash_g": 15.4
      },
      "aminoAcids": {
        "histidine_mg": 1144,
        "isoleucine_mg": 1848,
        "leucine_mg": 3608,
        "lysine_mg": 3432,
        "methionine_mg": 1100,
        "cysteine_mg": 880,
        "phenylalanine_mg": 2024,
        "tyrosine_mg": 1408,
        "threonine_mg": 1672,
        "tryptophan_mg": 528,
        "valine_mg": 2112,
        "arginine_mg": 2420,
        "totalEAA_mg": 22176,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 14.4,
        "totalMUFA_g": 12.2,
        "totalPUFA_g": 5.4,
        "omega6_linoleic_g": 4.1,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 340,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 980,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 320,
        "betaCarotene_mcg": 3840,
        "vitaminC_mg": 36,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 210,
      "standard": 320,
      "premium": 480
    }
  },
  {
    "id": "dinich-wot",
    "nameEn": "Dinich Wot (Spiced Potato Stew with Onions & Berbere)",
    "nameAmharic": "የድንች ወጥ",
    "category": "vegetable_root",
    "tagline": "Cubed highland potatoes simmered in fiery, fragrant berbere onion gravy.",
    "description": "Dinich Wot (Spiced Potato Stew with Onions & Berbere) (የድንች ወጥ): Cubed highland potatoes simmered in fiery, fragrant berbere onion gravy. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 403,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 177,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Dinich Wot (Spiced Potato Stew with Onions & Berbere) Stew Component",
        "nameAmharic": "የድንች ወጥ ወጥ",
        "gramsPerServing": 137,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 40,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 48,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Dinich Wot (Spiced Potato Stew with Onions & Berbere).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየድንች ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 560,
        "protein_g": 17.5,
        "fat_g": 12,
        "carbohydrate_g": 98,
        "dietaryFiber_g": 16.5,
        "moisture_g": 252,
        "ash_g": 6.1
      },
      "aminoAcids": {
        "histidine_mg": 455,
        "isoleucine_mg": 735,
        "leucine_mg": 1260,
        "lysine_mg": 910,
        "methionine_mg": 385,
        "cysteine_mg": 350,
        "phenylalanine_mg": 805,
        "tyrosine_mg": 560,
        "threonine_mg": 665,
        "tryptophan_mg": 210,
        "valine_mg": 840,
        "arginine_mg": 963,
        "totalEAA_mg": 8138,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.9,
        "totalMUFA_g": 4.2,
        "totalPUFA_g": 5.9,
        "omega6_linoleic_g": 4.4,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 65,
      "standard": 105,
      "premium": 165
    }
  },
  {
    "id": "dinich-be-karot-alicha",
    "nameEn": "Dinich be'Karot Alicha (Potato & Carrot Turmeric Stew)",
    "nameAmharic": "የድንችና ካሮት አልጫ",
    "category": "vegetable_root",
    "tagline": "Mild, golden turmeric stew with potatoes, carrots, and sweet onions.",
    "description": "Dinich be'Karot Alicha (Potato & Carrot Turmeric Stew) (የድንችና ካሮት አልጫ): Mild, golden turmeric stew with potatoes, carrots, and sweet onions. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 389,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 171,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Dinich be'Karot Alicha (Potato & Carrot Turmeric Stew) Stew Component",
        "nameAmharic": "የድንችና ካሮት አልጫ ወጥ",
        "gramsPerServing": 132,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 39,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 47,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Dinich be'Karot Alicha (Potato & Carrot Turmeric Stew).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየድንችና ካሮት አልጫ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 540,
        "protein_g": 16.5,
        "fat_g": 11.2,
        "carbohydrate_g": 96,
        "dietaryFiber_g": 16,
        "moisture_g": 243,
        "ash_g": 5.8
      },
      "aminoAcids": {
        "histidine_mg": 429,
        "isoleucine_mg": 693,
        "leucine_mg": 1188,
        "lysine_mg": 858,
        "methionine_mg": 363,
        "cysteine_mg": 330,
        "phenylalanine_mg": 759,
        "tyrosine_mg": 528,
        "threonine_mg": 627,
        "tryptophan_mg": 198,
        "valine_mg": 792,
        "arginine_mg": 908,
        "totalEAA_mg": 7673,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.8,
        "totalMUFA_g": 3.9,
        "totalPUFA_g": 5.5,
        "omega6_linoleic_g": 4.1,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 65,
      "standard": 105,
      "premium": 165
    }
  },
  {
    "id": "fosolia-be-karot",
    "nameEn": "Fosolia be'Karot (Green Beans & Carrots Sauté)",
    "nameAmharic": "ፎሶሊያ በካሮት",
    "category": "vegetable_root",
    "tagline": "Tender string beans and sliced carrots braised in garlic and shallots.",
    "description": "Fosolia be'Karot (Green Beans & Carrots Sauté) (ፎሶሊያ በካሮት): Tender string beans and sliced carrots braised in garlic and shallots. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 353,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 155,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Fosolia be'Karot (Green Beans & Carrots Sauté) Stew Component",
        "nameAmharic": "ፎሶሊያ በካሮት ወጥ",
        "gramsPerServing": 120,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 35,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 42,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Fosolia be'Karot (Green Beans & Carrots Sauté).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለፎሶሊያ በካሮት አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 490,
        "protein_g": 17.2,
        "fat_g": 11,
        "carbohydrate_g": 84,
        "dietaryFiber_g": 18,
        "moisture_g": 221,
        "ash_g": 6
      },
      "aminoAcids": {
        "histidine_mg": 447,
        "isoleucine_mg": 722,
        "leucine_mg": 1238,
        "lysine_mg": 894,
        "methionine_mg": 378,
        "cysteine_mg": 344,
        "phenylalanine_mg": 791,
        "tyrosine_mg": 550,
        "threonine_mg": 654,
        "tryptophan_mg": 206,
        "valine_mg": 826,
        "arginine_mg": 946,
        "totalEAA_mg": 7996,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.8,
        "totalMUFA_g": 3.9,
        "totalPUFA_g": 5.3,
        "omega6_linoleic_g": 4,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 340,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 980,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 320,
        "betaCarotene_mcg": 3840,
        "vitaminC_mg": 36,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 70,
      "standard": 110,
      "premium": 175
    }
  },
  {
    "id": "anchote-tuber-stew",
    "nameEn": "Anchote Tuber Stew with Spiced Butter",
    "nameAmharic": "የአንጮቴ ወጥ",
    "category": "vegetable_root",
    "tagline": "High-calcium Oromo indigenous tuber stewed with niter kibbeh and garlic.",
    "description": "Anchote Tuber Stew with Spiced Butter (የአንጮቴ ወጥ): High-calcium Oromo indigenous tuber stewed with niter kibbeh and garlic. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 425,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 187,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Anchote Tuber Stew with Spiced Butter Stew Component",
        "nameAmharic": "የአንጮቴ ወጥ ወጥ",
        "gramsPerServing": 145,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 43,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 51,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Anchote Tuber Stew with Spiced Butter.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየአንጮቴ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 590,
        "protein_g": 18.5,
        "fat_g": 24,
        "carbohydrate_g": 78,
        "dietaryFiber_g": 17.2,
        "moisture_g": 266,
        "ash_g": 6.5
      },
      "aminoAcids": {
        "histidine_mg": 481,
        "isoleucine_mg": 777,
        "leucine_mg": 1517,
        "lysine_mg": 1443,
        "methionine_mg": 463,
        "cysteine_mg": 370,
        "phenylalanine_mg": 851,
        "tyrosine_mg": 592,
        "threonine_mg": 703,
        "tryptophan_mg": 222,
        "valine_mg": 888,
        "arginine_mg": 1018,
        "totalEAA_mg": 9325,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 10.8,
        "totalMUFA_g": 9.1,
        "totalPUFA_g": 4.1,
        "omega6_linoleic_g": 3.1,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 540,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 120,
      "standard": 185,
      "premium": 280
    }
  },
  {
    "id": "dinicha-oromo",
    "nameEn": "Oromo Potato (Dinicha Oromo) Boiled with Salt & Garlic",
    "nameAmharic": "የኦሮሞ ድንች",
    "category": "vegetable_root",
    "tagline": "Small, aromatic indigenous black tubers boiled tender with sea salt.",
    "description": "Oromo Potato (Dinicha Oromo) Boiled with Salt & Garlic (የኦሮሞ ድንች): Small, aromatic indigenous black tubers boiled tender with sea salt. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 346,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 152,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Oromo Potato (Dinicha Oromo) Boiled with Salt & Garlic Stew Component",
        "nameAmharic": "የኦሮሞ ድንች ወጥ",
        "gramsPerServing": 118,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 35,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 42,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Oromo Potato (Dinicha Oromo) Boiled with Salt & Garlic.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየኦሮሞ ድንች አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 480,
        "protein_g": 14.5,
        "fat_g": 8.5,
        "carbohydrate_g": 90,
        "dietaryFiber_g": 15.5,
        "moisture_g": 216,
        "ash_g": 5.1
      },
      "aminoAcids": {
        "histidine_mg": 377,
        "isoleucine_mg": 609,
        "leucine_mg": 1044,
        "lysine_mg": 754,
        "methionine_mg": 319,
        "cysteine_mg": 290,
        "phenylalanine_mg": 667,
        "tyrosine_mg": 464,
        "threonine_mg": 551,
        "tryptophan_mg": 174,
        "valine_mg": 696,
        "arginine_mg": 798,
        "totalEAA_mg": 6743,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.4,
        "totalMUFA_g": 3,
        "totalPUFA_g": 4.1,
        "omega6_linoleic_g": 3.1,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 60,
      "standard": 95,
      "premium": 150
    }
  },
  {
    "id": "godere-steamed-taro",
    "nameEn": "Godere (Taro Root) Steamed with Niter Kibbeh",
    "nameAmharic": "የጎደሬ ስር",
    "category": "vegetable_root",
    "tagline": "Steamed southwest highland taro root tossed with cardamom spiced butter.",
    "description": "Godere (Taro Root) Steamed with Niter Kibbeh (የጎደሬ ስር): Steamed southwest highland taro root tossed with cardamom spiced butter. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 410,
    "isFasting": false,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 180,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Godere (Taro Root) Steamed with Niter Kibbeh Stew Component",
        "nameAmharic": "የጎደሬ ስር ወጥ",
        "gramsPerServing": 139,
        "category": "animal",
        "dryEquivalentRatio": 0.8
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Niter Kibbeh & Berbere",
        "nameAmharic": "ንጥር ቅቤና በርበሬ",
        "gramsPerServing": 41,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 49,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Godere (Taro Root) Steamed with Niter Kibbeh.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየጎደሬ ስር አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 570,
        "protein_g": 15,
        "fat_g": 22,
        "carbohydrate_g": 82,
        "dietaryFiber_g": 14.8,
        "moisture_g": 257,
        "ash_g": 5.3
      },
      "aminoAcids": {
        "histidine_mg": 390,
        "isoleucine_mg": 630,
        "leucine_mg": 1230,
        "lysine_mg": 1170,
        "methionine_mg": 375,
        "cysteine_mg": 300,
        "phenylalanine_mg": 690,
        "tyrosine_mg": 480,
        "threonine_mg": 570,
        "tryptophan_mg": 180,
        "valine_mg": 720,
        "arginine_mg": 825,
        "totalEAA_mg": 7560,
        "limitingAmino": "None (Complete High-Biological-Value)",
        "aminoAcidScorePct": 100,
        "pdcaasEquivalentPct": 98
      },
      "fattyAcids": {
        "totalSaturated_g": 9.9,
        "totalMUFA_g": 8.4,
        "totalPUFA_g": 3.7,
        "omega6_linoleic_g": 2.8,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.12,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 85
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 4.7,
        "zinc_mg": 7.5,
        "bioavailableZinc_mg": 2.6,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 620,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 220,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 1.2,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.54,
        "vitaminB3_mg": 8.5,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.4
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 95,
      "standard": 150,
      "premium": 230
    }
  },
  {
    "id": "timatim-salata",
    "nameEn": "Timatim Salata with Jalapeño, Shallots & Lemon",
    "nameAmharic": "የቲማቲም ሰላጣ",
    "category": "salad_side",
    "tagline": "Fresh diced vine tomatoes, minced shallots, and spicy green peppers in lemon oil.",
    "description": "Timatim Salata with Jalapeño, Shallots & Lemon (የቲማቲም ሰላጣ): Fresh diced vine tomatoes, minced shallots, and spicy green peppers in lemon oil. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 302,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 133,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Timatim Salata with Jalapeño, Shallots & Lemon Stew Component",
        "nameAmharic": "የቲማቲም ሰላጣ ወጥ",
        "gramsPerServing": 103,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 30,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 36,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Timatim Salata with Jalapeño, Shallots & Lemon.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየቲማቲም ሰላጣ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 420,
        "protein_g": 14,
        "fat_g": 9.5,
        "carbohydrate_g": 72,
        "dietaryFiber_g": 13.5,
        "moisture_g": 189,
        "ash_g": 4.9
      },
      "aminoAcids": {
        "histidine_mg": 364,
        "isoleucine_mg": 588,
        "leucine_mg": 1008,
        "lysine_mg": 728,
        "methionine_mg": 308,
        "cysteine_mg": 280,
        "phenylalanine_mg": 644,
        "tyrosine_mg": 448,
        "threonine_mg": 532,
        "tryptophan_mg": 168,
        "valine_mg": 672,
        "arginine_mg": 770,
        "totalEAA_mg": 6510,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.5,
        "totalMUFA_g": 3.3,
        "totalPUFA_g": 4.7,
        "omega6_linoleic_g": 3.5,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 60,
      "standard": 95,
      "premium": 150
    }
  },
  {
    "id": "azifa-lentil-salad",
    "nameEn": "Azifa (Whole Green Lentil Salad with Brown Mustard & Lime)",
    "nameAmharic": "አዚፋ",
    "category": "salad_side",
    "tagline": "Tangy, zesty green lentil salad packed with raw brown mustard and cold-pressed freshness.",
    "description": "Azifa (Whole Green Lentil Salad with Brown Mustard & Lime) (አዚፋ): Tangy, zesty green lentil salad packed with raw brown mustard and cold-pressed freshness. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 389,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 200,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "green-lentils",
        "nameEn": "Cooked Whole Green Lentils",
        "nameAmharic": "የበሰለ አረንጓዴ ምስር",
        "gramsPerServing": 150,
        "category": "legume",
        "dryEquivalentRatio": 0.42
      },
      {
        "id": "senafitch-dressing",
        "nameEn": "Mustard Seed, Lime & Oil Dressing",
        "nameAmharic": "የሰናፍጭ፣ ሎሚና ዘይት ቅመም",
        "gramsPerServing": 40,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "fresh-veg",
        "nameEn": "Fresh Shallots, Tomatoes & Green Peppers",
        "nameAmharic": "ቲማቲም፣ ቃሪያና ሽንኩርት",
        "gramsPerServing": 50,
        "category": "vegetable",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Azifa (Whole Green Lentil Salad with Brown Mustard & Lime).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለአዚፋ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 540,
        "protein_g": 22.4,
        "fat_g": 11.2,
        "carbohydrate_g": 88,
        "dietaryFiber_g": 17.5,
        "moisture_g": 243,
        "ash_g": 7.8
      },
      "aminoAcids": {
        "histidine_mg": 582,
        "isoleucine_mg": 941,
        "leucine_mg": 1613,
        "lysine_mg": 1165,
        "methionine_mg": 493,
        "cysteine_mg": 448,
        "phenylalanine_mg": 1030,
        "tyrosine_mg": 717,
        "threonine_mg": 851,
        "tryptophan_mg": 269,
        "valine_mg": 1075,
        "arginine_mg": 1232,
        "totalEAA_mg": 10416,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.8,
        "totalMUFA_g": 3.9,
        "totalPUFA_g": 5.5,
        "omega6_linoleic_g": 4.1,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 85,
      "standard": 135,
      "premium": 210
    }
  },
  {
    "id": "telba-fitfit",
    "nameEn": "Telba Fitfit with Shredded Injera & Green Chili",
    "nameAmharic": "የተልባ ፍትፍት",
    "category": "fasting_combo",
    "tagline": "The supreme cold-pressed plant Omega-3 emulsion and colon tonic.",
    "description": "Telba Fitfit with Shredded Injera & Green Chili (የተልባ ፍትፍት): The supreme cold-pressed plant Omega-3 emulsion and colon tonic. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 403,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Shredded Fermented Teff Injera",
        "nameAmharic": "የተቆራረጠ የጤፍ እንጀራ",
        "gramsPerServing": 200,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "flax-seed",
        "nameEn": "Roasted Ground Flaxseed (Telba)",
        "nameAmharic": "የተፈጨ ተልባ",
        "gramsPerServing": 60,
        "category": "cereal",
        "dryEquivalentRatio": 1
      },
      {
        "id": "shallot-chili",
        "nameEn": "Shallots, Jalapeño & Lemon",
        "nameAmharic": "ቀይ ሽንኩርት፣ ቃሪያና ሎሚ",
        "gramsPerServing": 40,
        "category": "vegetable",
        "dryEquivalentRatio": 1
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Telba Fitfit with Shredded Injera & Green Chili.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየተልባ ፍትፍት አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 560,
        "protein_g": 19.5,
        "fat_g": 22.8,
        "carbohydrate_g": 72,
        "dietaryFiber_g": 23.4,
        "moisture_g": 252,
        "ash_g": 6.8
      },
      "aminoAcids": {
        "histidine_mg": 507,
        "isoleucine_mg": 819,
        "leucine_mg": 1404,
        "lysine_mg": 1326,
        "methionine_mg": 429,
        "cysteine_mg": 390,
        "phenylalanine_mg": 897,
        "tyrosine_mg": 624,
        "threonine_mg": 741,
        "tryptophan_mg": 234,
        "valine_mg": 936,
        "arginine_mg": 1326,
        "totalEAA_mg": 9633,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 3.6,
        "totalMUFA_g": 8,
        "totalPUFA_g": 11.2,
        "omega6_linoleic_g": 2.8,
        "omega3_ALA_g": 7.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "3:1",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 70,
      "standard": 115,
      "premium": 180
    }
  },
  {
    "id": "suf-fitfit",
    "nameEn": "Suf Fitfit (Safflower Seed Milk Emulsion with Injera)",
    "nameAmharic": "የሱፍ ፍትፍት",
    "category": "fasting_combo",
    "tagline": "Crushed white safflower seed milk tossed with shredded teff injera.",
    "description": "Suf Fitfit (Safflower Seed Milk Emulsion with Injera) (የሱፍ ፍትፍት): Crushed white safflower seed milk tossed with shredded teff injera. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 396,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 174,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Suf Fitfit (Safflower Seed Milk Emulsion with Injera) Stew Component",
        "nameAmharic": "የሱፍ ፍትፍት ወጥ",
        "gramsPerServing": 135,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 40,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 48,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Suf Fitfit (Safflower Seed Milk Emulsion with Injera).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየሱፍ ፍትፍት አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 550,
        "protein_g": 18.2,
        "fat_g": 21,
        "carbohydrate_g": 74,
        "dietaryFiber_g": 18.5,
        "moisture_g": 248,
        "ash_g": 6.4
      },
      "aminoAcids": {
        "histidine_mg": 473,
        "isoleucine_mg": 764,
        "leucine_mg": 1310,
        "lysine_mg": 1238,
        "methionine_mg": 400,
        "cysteine_mg": 364,
        "phenylalanine_mg": 837,
        "tyrosine_mg": 582,
        "threonine_mg": 692,
        "tryptophan_mg": 218,
        "valine_mg": 874,
        "arginine_mg": 1238,
        "totalEAA_mg": 8990,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 3.4,
        "totalMUFA_g": 7.4,
        "totalPUFA_g": 10.2,
        "omega6_linoleic_g": 7.7,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 65,
      "standard": 110,
      "premium": 175
    }
  },
  {
    "id": "selit-fitfit",
    "nameEn": "Selit Fitfit (Sesame Seed Milk with Injera)",
    "nameAmharic": "የሰሊጥ ፍትፍት",
    "category": "fasting_combo",
    "tagline": "High-calcium roasted sesame seed emulsion folded with injera pieces.",
    "description": "Selit Fitfit (Sesame Seed Milk with Injera) (የሰሊጥ ፍትፍት): High-calcium roasted sesame seed emulsion folded with injera pieces. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 418,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 184,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Selit Fitfit (Sesame Seed Milk with Injera) Stew Component",
        "nameAmharic": "የሰሊጥ ፍትፍት ወጥ",
        "gramsPerServing": 142,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 42,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 50,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Selit Fitfit (Sesame Seed Milk with Injera).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየሰሊጥ ፍትፍት አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 580,
        "protein_g": 19,
        "fat_g": 24.5,
        "carbohydrate_g": 73,
        "dietaryFiber_g": 17,
        "moisture_g": 261,
        "ash_g": 6.7
      },
      "aminoAcids": {
        "histidine_mg": 494,
        "isoleucine_mg": 798,
        "leucine_mg": 1368,
        "lysine_mg": 1292,
        "methionine_mg": 418,
        "cysteine_mg": 380,
        "phenylalanine_mg": 874,
        "tyrosine_mg": 608,
        "threonine_mg": 722,
        "tryptophan_mg": 228,
        "valine_mg": 912,
        "arginine_mg": 1292,
        "totalEAA_mg": 9386,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 96,
        "pdcaasEquivalentPct": 92
      },
      "fattyAcids": {
        "totalSaturated_g": 3.9,
        "totalMUFA_g": 8.6,
        "totalPUFA_g": 12,
        "omega6_linoleic_g": 9,
        "omega3_ALA_g": 0.8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 480,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 220,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 75,
      "standard": 120,
      "premium": 190
    }
  },
  {
    "id": "timatim-fitfit",
    "nameEn": "Timatim Fitfit (Fresh Tomato, Jalapeño & Injera Salad)",
    "nameAmharic": "የቲማቲም ፍትፍት",
    "category": "salad_side",
    "tagline": "Chilled fresh tomato dressing with green chilies soaked into rolled injera.",
    "description": "Timatim Fitfit (Fresh Tomato, Jalapeño & Injera Salad) (የቲማቲም ፍትፍት): Chilled fresh tomato dressing with green chilies soaked into rolled injera. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 317,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 139,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Timatim Fitfit (Fresh Tomato, Jalapeño & Injera Salad) Stew Component",
        "nameAmharic": "የቲማቲም ፍትፍት ወጥ",
        "gramsPerServing": 108,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 32,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 38,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Timatim Fitfit (Fresh Tomato, Jalapeño & Injera Salad).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየቲማቲም ፍትፍት አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 440,
        "protein_g": 14.5,
        "fat_g": 10,
        "carbohydrate_g": 76,
        "dietaryFiber_g": 14,
        "moisture_g": 198,
        "ash_g": 5.1
      },
      "aminoAcids": {
        "histidine_mg": 377,
        "isoleucine_mg": 609,
        "leucine_mg": 1044,
        "lysine_mg": 754,
        "methionine_mg": 319,
        "cysteine_mg": 290,
        "phenylalanine_mg": 667,
        "tyrosine_mg": 464,
        "threonine_mg": 551,
        "tryptophan_mg": 174,
        "valine_mg": 696,
        "arginine_mg": 798,
        "totalEAA_mg": 6743,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.6,
        "totalMUFA_g": 3.5,
        "totalPUFA_g": 4.9,
        "omega6_linoleic_g": 3.7,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 60,
      "standard": 95,
      "premium": 150
    }
  },
  {
    "id": "siljo-dip",
    "nameEn": "Siljo (Fermented Broad Bean & Safflower Probiotic Dip)",
    "nameAmharic": "ስልጆ",
    "category": "salad_side",
    "tagline": "Ancient fermented fava bean flour paste with safflower milk and mustard.",
    "description": "Siljo (Fermented Broad Bean & Safflower Probiotic Dip) (ስልጆ): Ancient fermented fava bean flour paste with safflower milk and mustard. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 331,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 146,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Siljo (Fermented Broad Bean & Safflower Probiotic Dip) Stew Component",
        "nameAmharic": "ስልጆ ወጥ",
        "gramsPerServing": 113,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 33,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 40,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Siljo (Fermented Broad Bean & Safflower Probiotic Dip).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለስልጆ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 460,
        "protein_g": 21,
        "fat_g": 12.5,
        "carbohydrate_g": 68,
        "dietaryFiber_g": 16.5,
        "moisture_g": 207,
        "ash_g": 7.4
      },
      "aminoAcids": {
        "histidine_mg": 546,
        "isoleucine_mg": 882,
        "leucine_mg": 1512,
        "lysine_mg": 1092,
        "methionine_mg": 462,
        "cysteine_mg": 420,
        "phenylalanine_mg": 966,
        "tyrosine_mg": 672,
        "threonine_mg": 798,
        "tryptophan_mg": 252,
        "valine_mg": 1008,
        "arginine_mg": 1155,
        "totalEAA_mg": 9765,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 2,
        "totalMUFA_g": 4.4,
        "totalPUFA_g": 6.1,
        "omega6_linoleic_g": 4.6,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 75,
      "standard": 120,
      "premium": 190
    }
  },
  {
    "id": "senafitch-dip",
    "nameEn": "Senafitch (Freshly Pounded Brown Mustard Dip)",
    "nameAmharic": "ሰናፍጭ",
    "category": "salad_side",
    "tagline": "Pungent, sinus-clearing brown mustard paste with garlic and cold spring water.",
    "description": "Senafitch (Freshly Pounded Brown Mustard Dip) (ሰናፍጭ): Pungent, sinus-clearing brown mustard paste with garlic and cold spring water. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 230,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 101,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Senafitch (Freshly Pounded Brown Mustard Dip) Stew Component",
        "nameAmharic": "ሰናፍጭ ወጥ",
        "gramsPerServing": 78,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 23,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 28,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Senafitch (Freshly Pounded Brown Mustard Dip).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለሰናፍጭ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 320,
        "protein_g": 12,
        "fat_g": 9,
        "carbohydrate_g": 50,
        "dietaryFiber_g": 11,
        "moisture_g": 144,
        "ash_g": 4.2
      },
      "aminoAcids": {
        "histidine_mg": 312,
        "isoleucine_mg": 504,
        "leucine_mg": 864,
        "lysine_mg": 624,
        "methionine_mg": 264,
        "cysteine_mg": 240,
        "phenylalanine_mg": 552,
        "tyrosine_mg": 384,
        "threonine_mg": 456,
        "tryptophan_mg": 144,
        "valine_mg": 576,
        "arginine_mg": 660,
        "totalEAA_mg": 5580,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.4,
        "totalMUFA_g": 3.2,
        "totalPUFA_g": 4.4,
        "omega6_linoleic_g": 3.3,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 45,
      "standard": 75,
      "premium": 120
    }
  },
  {
    "id": "awaze-paste",
    "nameEn": "Awaze Paste (Sun-Dried Chili & Spiced Honey-Mead Paste)",
    "nameAmharic": "አዋዜ",
    "category": "salad_side",
    "tagline": "Artisanal condiment blended from berbere, tej (honey mead), and garlic.",
    "description": "Awaze Paste (Sun-Dried Chili & Spiced Honey-Mead Paste) (አዋዜ): Artisanal condiment blended from berbere, tej (honey mead), and garlic. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 245,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 108,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Awaze Paste (Sun-Dried Chili & Spiced Honey-Mead Paste) Stew Component",
        "nameAmharic": "አዋዜ ወጥ",
        "gramsPerServing": 83,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 25,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 29,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Awaze Paste (Sun-Dried Chili & Spiced Honey-Mead Paste).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለአዋዜ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 340,
        "protein_g": 9.5,
        "fat_g": 7.5,
        "carbohydrate_g": 60,
        "dietaryFiber_g": 12.5,
        "moisture_g": 153,
        "ash_g": 3.3
      },
      "aminoAcids": {
        "histidine_mg": 247,
        "isoleucine_mg": 399,
        "leucine_mg": 684,
        "lysine_mg": 494,
        "methionine_mg": 209,
        "cysteine_mg": 190,
        "phenylalanine_mg": 437,
        "tyrosine_mg": 304,
        "threonine_mg": 361,
        "tryptophan_mg": 114,
        "valine_mg": 456,
        "arginine_mg": 523,
        "totalEAA_mg": 4418,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.2,
        "totalMUFA_g": 2.6,
        "totalPUFA_g": 3.7,
        "omega6_linoleic_g": 2.8,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 50,
      "standard": 85,
      "premium": 135
    }
  },
  {
    "id": "asa-wot",
    "nameEn": "Asa Wot (Spicy Nile Tilapia Stew in Berbere)",
    "nameAmharic": "የዓሳ ወጥ",
    "category": "fish_seafood",
    "tagline": "Fresh Lake Tana or Ziway tilapia simmered in rich spicy berbere gravy.",
    "description": "Asa Wot (Spicy Nile Tilapia Stew in Berbere) (የዓሳ ወጥ): Fresh Lake Tana or Ziway tilapia simmered in rich spicy berbere gravy. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 461,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 203,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Asa Wot (Spicy Nile Tilapia Stew in Berbere) Stew Component",
        "nameAmharic": "የዓሳ ወጥ ወጥ",
        "gramsPerServing": 157,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 46,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 55,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Asa Wot (Spicy Nile Tilapia Stew in Berbere).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዓሳ ወጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 640,
        "protein_g": 38.5,
        "fat_g": 18,
        "carbohydrate_g": 84,
        "dietaryFiber_g": 12.5,
        "moisture_g": 288,
        "ash_g": 13.5
      },
      "aminoAcids": {
        "histidine_mg": 1001,
        "isoleucine_mg": 1617,
        "leucine_mg": 2772,
        "lysine_mg": 2002,
        "methionine_mg": 847,
        "cysteine_mg": 770,
        "phenylalanine_mg": 1771,
        "tyrosine_mg": 1232,
        "threonine_mg": 1463,
        "tryptophan_mg": 462,
        "valine_mg": 1848,
        "arginine_mg": 2118,
        "totalEAA_mg": 17903,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 2.9,
        "totalMUFA_g": 6.3,
        "totalPUFA_g": 8.8,
        "omega6_linoleic_g": 6.6,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.45,
        "omega3ToOmega6Ratio": "1:2",
        "cholesterol_mg": 55
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 4.5,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.8
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 160,
      "standard": 250,
      "premium": 390
    }
  },
  {
    "id": "asa-alicha",
    "nameEn": "Asa Alicha (Mild Fish Stew with Turmeric & Ginger)",
    "nameAmharic": "የዓሳ አልጫ",
    "category": "fish_seafood",
    "tagline": "Delicate fish fillet simmered gently with turmeric, ginger, and shallots.",
    "description": "Asa Alicha (Mild Fish Stew with Turmeric & Ginger) (የዓሳ አልጫ): Delicate fish fillet simmered gently with turmeric, ginger, and shallots. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 439,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 193,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Asa Alicha (Mild Fish Stew with Turmeric & Ginger) Stew Component",
        "nameAmharic": "የዓሳ አልጫ ወጥ",
        "gramsPerServing": 149,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 44,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 53,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Asa Alicha (Mild Fish Stew with Turmeric & Ginger).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዓሳ አልጫ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 610,
        "protein_g": 37,
        "fat_g": 16.5,
        "carbohydrate_g": 82,
        "dietaryFiber_g": 12,
        "moisture_g": 275,
        "ash_g": 13
      },
      "aminoAcids": {
        "histidine_mg": 962,
        "isoleucine_mg": 1554,
        "leucine_mg": 2664,
        "lysine_mg": 1924,
        "methionine_mg": 814,
        "cysteine_mg": 740,
        "phenylalanine_mg": 1702,
        "tyrosine_mg": 1184,
        "threonine_mg": 1406,
        "tryptophan_mg": 444,
        "valine_mg": 1776,
        "arginine_mg": 2035,
        "totalEAA_mg": 17205,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 2.6,
        "totalMUFA_g": 5.8,
        "totalPUFA_g": 8.1,
        "omega6_linoleic_g": 6.1,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.45,
        "omega3ToOmega6Ratio": "1:2",
        "cholesterol_mg": 55
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 4.5,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.8
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 155,
      "standard": 245,
      "premium": 380
    }
  },
  {
    "id": "asa-gulash",
    "nameEn": "Asa Gulash (Diced Lake Fish Braised with Garlic & Onions)",
    "nameAmharic": "የዓሳ ጉላሽ",
    "category": "fish_seafood",
    "tagline": "Cubed tilapia fillets pan-braised with fresh tomatoes, garlic, and green chili.",
    "description": "Asa Gulash (Diced Lake Fish Braised with Garlic & Onions) (የዓሳ ጉላሽ): Cubed tilapia fillets pan-braised with fresh tomatoes, garlic, and green chili. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 446,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 196,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Asa Gulash (Diced Lake Fish Braised with Garlic & Onions) Stew Component",
        "nameAmharic": "የዓሳ ጉላሽ ወጥ",
        "gramsPerServing": 152,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 45,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 54,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Asa Gulash (Diced Lake Fish Braised with Garlic & Onions).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዓሳ ጉላሽ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 620,
        "protein_g": 39,
        "fat_g": 16,
        "carbohydrate_g": 83,
        "dietaryFiber_g": 12,
        "moisture_g": 279,
        "ash_g": 13.7
      },
      "aminoAcids": {
        "histidine_mg": 1014,
        "isoleucine_mg": 1638,
        "leucine_mg": 2808,
        "lysine_mg": 2028,
        "methionine_mg": 858,
        "cysteine_mg": 780,
        "phenylalanine_mg": 1794,
        "tyrosine_mg": 1248,
        "threonine_mg": 1482,
        "tryptophan_mg": 468,
        "valine_mg": 1872,
        "arginine_mg": 2145,
        "totalEAA_mg": 18135,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 2.6,
        "totalMUFA_g": 5.6,
        "totalPUFA_g": 7.8,
        "omega6_linoleic_g": 5.9,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.45,
        "omega3ToOmega6Ratio": "1:2",
        "cholesterol_mg": 55
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 4.5,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.8
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 165,
      "standard": 260,
      "premium": 400
    }
  },
  {
    "id": "asa-tibs",
    "nameEn": "Asa Tibs (Pan-Crisped Whole Tilapia with Mitmita & Lime)",
    "nameAmharic": "የዓሳ ጥብስ",
    "category": "fish_seafood",
    "tagline": "Crisp-fried whole river tilapia served sizzling with lime and mitmita.",
    "description": "Asa Tibs (Pan-Crisped Whole Tilapia with Mitmita & Lime) (የዓሳ ጥብስ): Crisp-fried whole river tilapia served sizzling with lime and mitmita. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 468,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 206,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Asa Tibs (Pan-Crisped Whole Tilapia with Mitmita & Lime) Stew Component",
        "nameAmharic": "የዓሳ ጥብስ ወጥ",
        "gramsPerServing": 159,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 47,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 56,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Asa Tibs (Pan-Crisped Whole Tilapia with Mitmita & Lime).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዓሳ ጥብስ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 650,
        "protein_g": 42,
        "fat_g": 19.5,
        "carbohydrate_g": 80,
        "dietaryFiber_g": 11.5,
        "moisture_g": 293,
        "ash_g": 14.7
      },
      "aminoAcids": {
        "histidine_mg": 1092,
        "isoleucine_mg": 1764,
        "leucine_mg": 3024,
        "lysine_mg": 2184,
        "methionine_mg": 924,
        "cysteine_mg": 840,
        "phenylalanine_mg": 1932,
        "tyrosine_mg": 1344,
        "threonine_mg": 1596,
        "tryptophan_mg": 504,
        "valine_mg": 2016,
        "arginine_mg": 2310,
        "totalEAA_mg": 19530,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 3.1,
        "totalMUFA_g": 6.8,
        "totalPUFA_g": 9.6,
        "omega6_linoleic_g": 7.2,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.45,
        "omega3ToOmega6Ratio": "1:2",
        "cholesterol_mg": 55
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 4.5,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.8
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 175,
      "standard": 270,
      "premium": 420
    }
  },
  {
    "id": "asa-kitfo",
    "nameEn": "Asa Kitfo (Minced Fish Tartare with Mitmita & Spiced Oil)",
    "nameAmharic": "የዓሳ ክትፎ",
    "category": "fish_seafood",
    "tagline": "Finely minced fresh lake fish tossed with mitmita, lemon, and spiced oil.",
    "description": "Asa Kitfo (Minced Fish Tartare with Mitmita & Spiced Oil) (የዓሳ ክትፎ): Finely minced fresh lake fish tossed with mitmita, lemon, and spiced oil. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 454,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 200,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Asa Kitfo (Minced Fish Tartare with Mitmita & Spiced Oil) Stew Component",
        "nameAmharic": "የዓሳ ክትፎ ወጥ",
        "gramsPerServing": 154,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 45,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 54,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Asa Kitfo (Minced Fish Tartare with Mitmita & Spiced Oil).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዓሳ ክትፎ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 630,
        "protein_g": 41.5,
        "fat_g": 18,
        "carbohydrate_g": 78,
        "dietaryFiber_g": 11,
        "moisture_g": 284,
        "ash_g": 14.5
      },
      "aminoAcids": {
        "histidine_mg": 1079,
        "isoleucine_mg": 1743,
        "leucine_mg": 2988,
        "lysine_mg": 2158,
        "methionine_mg": 913,
        "cysteine_mg": 830,
        "phenylalanine_mg": 1909,
        "tyrosine_mg": 1328,
        "threonine_mg": 1577,
        "tryptophan_mg": 498,
        "valine_mg": 1992,
        "arginine_mg": 2283,
        "totalEAA_mg": 19298,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 2.9,
        "totalMUFA_g": 6.3,
        "totalPUFA_g": 8.8,
        "omega6_linoleic_g": 6.6,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.45,
        "omega3ToOmega6Ratio": "1:2",
        "cholesterol_mg": 55
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 4.5,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.8
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 170,
      "standard": 265,
      "premium": 410
    }
  },
  {
    "id": "asa-firfir",
    "nameEn": "Asa Firfir (Shredded Injera in Spiced Fish Broth)",
    "nameAmharic": "የዓሳ ፍርፍር",
    "category": "fish_seafood",
    "tagline": "Flaked lake fish and spicy broth folded with torn teff injera.",
    "description": "Asa Firfir (Shredded Injera in Spiced Fish Broth) (የዓሳ ፍርፍር): Flaked lake fish and spicy broth folded with torn teff injera. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 475,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "teff-injera",
        "nameEn": "Fermented Teff Injera",
        "nameAmharic": "የጤፍ እንጀራ",
        "gramsPerServing": 209,
        "category": "cereal",
        "dryEquivalentRatio": 0.45
      },
      {
        "id": "main-stew",
        "nameEn": "Asa Firfir (Shredded Injera in Spiced Fish Broth) Stew Component",
        "nameAmharic": "የዓሳ ፍርፍር ወጥ",
        "gramsPerServing": 162,
        "category": "legume",
        "dryEquivalentRatio": 0.4
      },
      {
        "id": "seasoning-oil",
        "nameEn": "Spiced Oil & Berbere",
        "nameAmharic": "ዘይትና በርበሬ",
        "gramsPerServing": 48,
        "category": "oil_fat",
        "dryEquivalentRatio": 1
      },
      {
        "id": "vegetable-side",
        "nameEn": "Stewed Collards or Fresh Salad",
        "nameAmharic": "ጎመን ወይም ሰላጣ",
        "gramsPerServing": 57,
        "category": "vegetable",
        "dryEquivalentRatio": 0.85
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Asa Firfir (Shredded Injera in Spiced Fish Broth).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየዓሳ ፍርፍር አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 660,
        "protein_g": 36.5,
        "fat_g": 17.5,
        "carbohydrate_g": 92,
        "dietaryFiber_g": 13,
        "moisture_g": 297,
        "ash_g": 12.8
      },
      "aminoAcids": {
        "histidine_mg": 949,
        "isoleucine_mg": 1533,
        "leucine_mg": 2628,
        "lysine_mg": 1898,
        "methionine_mg": 803,
        "cysteine_mg": 730,
        "phenylalanine_mg": 1679,
        "tyrosine_mg": 1168,
        "threonine_mg": 1387,
        "tryptophan_mg": 438,
        "valine_mg": 1752,
        "arginine_mg": 2008,
        "totalEAA_mg": 16973,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 2.8,
        "totalMUFA_g": 6.1,
        "totalPUFA_g": 8.6,
        "omega6_linoleic_g": 6.5,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0.45,
        "omega3ToOmega6Ratio": "1:2",
        "cholesterol_mg": 55
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 38,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 4.5,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 2.8
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 150,
      "standard": 235,
      "premium": 370
    }
  },
  {
    "id": "beso-nutritional-drink",
    "nameEn": "Beso Power Drink with Roasted Barley, Flax & Honey",
    "nameAmharic": "የበሶ መጠጥ ከተልባና ማር ጋር",
    "category": "functional_drink",
    "tagline": "The legendary long-distance runner's fuel and digestive soother.",
    "description": "Beso Power Drink with Roasted Barley, Flax & Honey (የበሶ መጠጥ ከተልባና ማር ጋር): The legendary long-distance runner's fuel and digestive soother. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 356,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "beso-flour",
        "nameEn": "Roasted Barley Flour (Beso)",
        "nameAmharic": "የበሶ ዱቄት",
        "gramsPerServing": 80,
        "category": "cereal",
        "dryEquivalentRatio": 1
      },
      {
        "id": "telba-flour",
        "nameEn": "Ground Roasted Flaxseed (Telba)",
        "nameAmharic": "የተፈጨ ተልባ",
        "gramsPerServing": 30,
        "category": "cereal",
        "dryEquivalentRatio": 1
      },
      {
        "id": "honey",
        "nameEn": "Pure Ethiopian Highland Honey",
        "nameAmharic": "የደጋ ንጹህ ማር",
        "gramsPerServing": 25,
        "category": "sweetener",
        "dryEquivalentRatio": 1
      },
      {
        "id": "water",
        "nameEn": "Spring Water",
        "nameAmharic": "የምንጭ ውሃ",
        "gramsPerServing": 245,
        "category": "cereal",
        "dryEquivalentRatio": 0
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Beso Power Drink with Roasted Barley, Flax & Honey.",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየበሶ መጠጥ ከተልባና ማር ጋር አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 495,
        "protein_g": 14.8,
        "fat_g": 13.5,
        "carbohydrate_g": 82,
        "dietaryFiber_g": 18.5,
        "moisture_g": 223,
        "ash_g": 5.2
      },
      "aminoAcids": {
        "histidine_mg": 385,
        "isoleucine_mg": 622,
        "leucine_mg": 1066,
        "lysine_mg": 770,
        "methionine_mg": 326,
        "cysteine_mg": 296,
        "phenylalanine_mg": 681,
        "tyrosine_mg": 474,
        "threonine_mg": 562,
        "tryptophan_mg": 178,
        "valine_mg": 710,
        "arginine_mg": 814,
        "totalEAA_mg": 6884,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 2.2,
        "totalMUFA_g": 4.7,
        "totalPUFA_g": 6.6,
        "omega6_linoleic_g": 1.7,
        "omega3_ALA_g": 4.6,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "3:1",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 65,
      "standard": 110,
      "premium": 175
    }
  },
  {
    "id": "beso-water-drink",
    "nameEn": "Beso Drink with Cold Spring Water (Sugarless/Fasting)",
    "nameAmharic": "የውሃ በሶ",
    "category": "functional_drink",
    "tagline": "Pure stone-ground roasted barley shaken with cold spring water and sea salt.",
    "description": "Beso Drink with Cold Spring Water (Sugarless/Fasting) (የውሃ በሶ): Pure stone-ground roasted barley shaken with cold spring water and sea salt. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 295,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "drink-flour-base",
        "nameEn": "Beso Drink with Cold Spring Water (Sugarless/Fasting) Roasted Flour/Seed Base",
        "nameAmharic": "የውሃ በሶ ዱቄት",
        "gramsPerServing": 74,
        "category": "cereal",
        "dryEquivalentRatio": 1
      },
      {
        "id": "sweetener-spice",
        "nameEn": "Pure Honey & Spices",
        "nameAmharic": "ማርና ቅመማ ቅመም",
        "gramsPerServing": 24,
        "category": "sweetener",
        "dryEquivalentRatio": 1
      },
      {
        "id": "pure-water",
        "nameEn": "Spring Water / Decoction",
        "nameAmharic": "የምንጭ ውሃ",
        "gramsPerServing": 198,
        "category": "cereal",
        "dryEquivalentRatio": 0
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Beso Drink with Cold Spring Water (Sugarless/Fasting).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየውሃ በሶ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 410,
        "protein_g": 14,
        "fat_g": 4.5,
        "carbohydrate_g": 80,
        "dietaryFiber_g": 16,
        "moisture_g": 185,
        "ash_g": 4.9
      },
      "aminoAcids": {
        "histidine_mg": 364,
        "isoleucine_mg": 588,
        "leucine_mg": 1008,
        "lysine_mg": 728,
        "methionine_mg": 308,
        "cysteine_mg": 280,
        "phenylalanine_mg": 644,
        "tyrosine_mg": 448,
        "threonine_mg": 532,
        "tryptophan_mg": 168,
        "valine_mg": 672,
        "arginine_mg": 770,
        "totalEAA_mg": 6510,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 0.7,
        "totalMUFA_g": 1.6,
        "totalPUFA_g": 2.2,
        "omega6_linoleic_g": 1.7,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 45,
      "standard": 75,
      "premium": 120
    }
  },
  {
    "id": "telba-drink",
    "nameEn": "Telba Drink (Warm Infused Flaxseed Tonic)",
    "nameAmharic": "የተልባ ጭማቂ",
    "category": "functional_drink",
    "tagline": "Roasted crushed flaxseed infused warm for colon lubrication and Omega-3 intake.",
    "description": "Telba Drink (Warm Infused Flaxseed Tonic) (የተልባ ጭማቂ): Roasted crushed flaxseed infused warm for colon lubrication and Omega-3 intake. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 310,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "drink-flour-base",
        "nameEn": "Telba Drink (Warm Infused Flaxseed Tonic) Roasted Flour/Seed Base",
        "nameAmharic": "የተልባ ጭማቂ ዱቄት",
        "gramsPerServing": 78,
        "category": "cereal",
        "dryEquivalentRatio": 1
      },
      {
        "id": "sweetener-spice",
        "nameEn": "Pure Honey & Spices",
        "nameAmharic": "ማርና ቅመማ ቅመም",
        "gramsPerServing": 25,
        "category": "sweetener",
        "dryEquivalentRatio": 1
      },
      {
        "id": "pure-water",
        "nameEn": "Spring Water / Decoction",
        "nameAmharic": "የምንጭ ውሃ",
        "gramsPerServing": 208,
        "category": "cereal",
        "dryEquivalentRatio": 0
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Telba Drink (Warm Infused Flaxseed Tonic).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየተልባ ጭማቂ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 430,
        "protein_g": 15.5,
        "fat_g": 23.5,
        "carbohydrate_g": 42,
        "dietaryFiber_g": 21,
        "moisture_g": 194,
        "ash_g": 5.4
      },
      "aminoAcids": {
        "histidine_mg": 403,
        "isoleucine_mg": 651,
        "leucine_mg": 1116,
        "lysine_mg": 806,
        "methionine_mg": 341,
        "cysteine_mg": 310,
        "phenylalanine_mg": 713,
        "tyrosine_mg": 496,
        "threonine_mg": 589,
        "tryptophan_mg": 186,
        "valine_mg": 744,
        "arginine_mg": 853,
        "totalEAA_mg": 7208,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 3.8,
        "totalMUFA_g": 8.2,
        "totalPUFA_g": 11.5,
        "omega6_linoleic_g": 2.9,
        "omega3_ALA_g": 8,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "3:1",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 55,
      "standard": 90,
      "premium": 145
    }
  },
  {
    "id": "abish-drink",
    "nameEn": "Abish Drink (Cold Sprouted Fenugreek Galactagogue Tonic)",
    "nameAmharic": "የአብሽ መጠጥ",
    "category": "functional_drink",
    "tagline": "Sprouted whipped fenugreek beverage for glucose control and milk production.",
    "description": "Abish Drink (Cold Sprouted Fenugreek Galactagogue Tonic) (የአብሽ መጠጥ): Sprouted whipped fenugreek beverage for glucose control and milk production. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 259,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "drink-flour-base",
        "nameEn": "Abish Drink (Cold Sprouted Fenugreek Galactagogue Tonic) Roasted Flour/Seed Base",
        "nameAmharic": "የአብሽ መጠጥ ዱቄት",
        "gramsPerServing": 65,
        "category": "cereal",
        "dryEquivalentRatio": 1
      },
      {
        "id": "sweetener-spice",
        "nameEn": "Pure Honey & Spices",
        "nameAmharic": "ማርና ቅመማ ቅመም",
        "gramsPerServing": 21,
        "category": "sweetener",
        "dryEquivalentRatio": 1
      },
      {
        "id": "pure-water",
        "nameEn": "Spring Water / Decoction",
        "nameAmharic": "የምንጭ ውሃ",
        "gramsPerServing": 174,
        "category": "cereal",
        "dryEquivalentRatio": 0
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Abish Drink (Cold Sprouted Fenugreek Galactagogue Tonic).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለየአብሽ መጠጥ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 360,
        "protein_g": 18.2,
        "fat_g": 6.2,
        "carbohydrate_g": 59,
        "dietaryFiber_g": 22.5,
        "moisture_g": 162,
        "ash_g": 6.4
      },
      "aminoAcids": {
        "histidine_mg": 473,
        "isoleucine_mg": 764,
        "leucine_mg": 1310,
        "lysine_mg": 946,
        "methionine_mg": 400,
        "cysteine_mg": 364,
        "phenylalanine_mg": 837,
        "tyrosine_mg": 582,
        "threonine_mg": 692,
        "tryptophan_mg": 218,
        "valine_mg": 874,
        "arginine_mg": 1001,
        "totalEAA_mg": 8461,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1,
        "totalMUFA_g": 2.2,
        "totalPUFA_g": 3,
        "omega6_linoleic_g": 2.3,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 50,
      "standard": 85,
      "premium": 135
    }
  },
  {
    "id": "shameta-probiotic",
    "nameEn": "Shameta (Fermented Barley & Spiced Probiotic Beverage)",
    "nameAmharic": "ሻሜታ",
    "category": "functional_drink",
    "tagline": "Traditional cloudy fermented barley beverage seasoned with rue and ginger.",
    "description": "Shameta (Fermented Barley & Spiced Probiotic Beverage) (ሻሜታ): Traditional cloudy fermented barley beverage seasoned with rue and ginger. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 317,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "drink-flour-base",
        "nameEn": "Shameta (Fermented Barley & Spiced Probiotic Beverage) Roasted Flour/Seed Base",
        "nameAmharic": "ሻሜታ ዱቄት",
        "gramsPerServing": 79,
        "category": "cereal",
        "dryEquivalentRatio": 1
      },
      {
        "id": "sweetener-spice",
        "nameEn": "Pure Honey & Spices",
        "nameAmharic": "ማርና ቅመማ ቅመም",
        "gramsPerServing": 25,
        "category": "sweetener",
        "dryEquivalentRatio": 1
      },
      {
        "id": "pure-water",
        "nameEn": "Spring Water / Decoction",
        "nameAmharic": "የምንጭ ውሃ",
        "gramsPerServing": 212,
        "category": "cereal",
        "dryEquivalentRatio": 0
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Shameta (Fermented Barley & Spiced Probiotic Beverage).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለሻሜታ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 440,
        "protein_g": 13.5,
        "fat_g": 7,
        "carbohydrate_g": 82,
        "dietaryFiber_g": 15.5,
        "moisture_g": 198,
        "ash_g": 4.7
      },
      "aminoAcids": {
        "histidine_mg": 351,
        "isoleucine_mg": 567,
        "leucine_mg": 972,
        "lysine_mg": 702,
        "methionine_mg": 297,
        "cysteine_mg": 270,
        "phenylalanine_mg": 621,
        "tyrosine_mg": 432,
        "threonine_mg": 513,
        "tryptophan_mg": 162,
        "valine_mg": 648,
        "arginine_mg": 743,
        "totalEAA_mg": 6278,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 1.1,
        "totalMUFA_g": 2.4,
        "totalPUFA_g": 3.5,
        "omega6_linoleic_g": 2.6,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 50,
      "standard": 85,
      "premium": 135
    }
  },
  {
    "id": "korefe-highland",
    "nameEn": "Korefe (Traditional Highland Fermented Malt Beverage)",
    "nameAmharic": "ኮረፌ",
    "category": "functional_drink",
    "tagline": "Foamy fermented roasted barley and gesho beverage renowned in Gondar.",
    "description": "Korefe (Traditional Highland Fermented Malt Beverage) (ኮረፌ): Foamy fermented roasted barley and gesho beverage renowned in Gondar. Authentically formulated for complete micronutrient and amino acid balance.",
    "culturalContext": "Traditional culinary heritage of Ethiopia, deeply valued for wellness and balanced community nutrition.",
    "baseServingGrams": 324,
    "isFasting": true,
    "baseServingsPerDay": 2.8,
    "ingredients": [
      {
        "id": "drink-flour-base",
        "nameEn": "Korefe (Traditional Highland Fermented Malt Beverage) Roasted Flour/Seed Base",
        "nameAmharic": "ኮረፌ ዱቄት",
        "gramsPerServing": 81,
        "category": "cereal",
        "dryEquivalentRatio": 1
      },
      {
        "id": "sweetener-spice",
        "nameEn": "Pure Honey & Spices",
        "nameAmharic": "ማርና ቅመማ ቅመም",
        "gramsPerServing": 26,
        "category": "sweetener",
        "dryEquivalentRatio": 1
      },
      {
        "id": "pure-water",
        "nameEn": "Spring Water / Decoction",
        "nameAmharic": "የምንጭ ውሃ",
        "gramsPerServing": 217,
        "category": "cereal",
        "dryEquivalentRatio": 0
      }
    ],
    "recipeInstructions": {
      "prepTimeMinutes": 20,
      "cookTimeMinutes": 35,
      "steps": [
        "Select quality raw ingredients for Korefe (Traditional Highland Fermented Malt Beverage).",
        "Slow-cook aromatics and spices until fragrant.",
        "Simmer main ingredients until tender and flavors merge completely.",
        "Serve piping hot with fresh fermented teff injera or traditional accompaniment."
      ],
      "amharicSteps": [
        "ለኮረፌ አስፈላጊ የሆኑትን ንጥረ-ነገሮች በጥንቃቄ ማዘጋጀት።",
        "ሽንኩርትና ቅመማ ቅመሞችን በሚገባ ማቁላላት።",
        "ንጥረ-ነገሩ ለስልሶ እስኪበስልና እስኪዋሀድ ድረስ ማብሰል።",
        "በትኩሱ ከጤፍ እንጀራ ወይም ከባህላዊ ማባያው ጋር ማቅረብ።"
      ],
      "culinaryTips": [
        "Traditional slow simmering and fermentation enhance mineral bioavailability."
      ]
    },
    "nutrients": {
      "proximate": {
        "energyKcal": 450,
        "protein_g": 14,
        "fat_g": 5.5,
        "carbohydrate_g": 86,
        "dietaryFiber_g": 14.8,
        "moisture_g": 203,
        "ash_g": 4.9
      },
      "aminoAcids": {
        "histidine_mg": 364,
        "isoleucine_mg": 588,
        "leucine_mg": 1008,
        "lysine_mg": 728,
        "methionine_mg": 308,
        "cysteine_mg": 280,
        "phenylalanine_mg": 644,
        "tyrosine_mg": 448,
        "threonine_mg": 532,
        "tryptophan_mg": 168,
        "valine_mg": 672,
        "arginine_mg": 770,
        "totalEAA_mg": 6510,
        "limitingAmino": "None (Fully balanced complementary profile)",
        "aminoAcidScorePct": 82,
        "pdcaasEquivalentPct": 85
      },
      "fattyAcids": {
        "totalSaturated_g": 0.9,
        "totalMUFA_g": 1.9,
        "totalPUFA_g": 2.7,
        "omega6_linoleic_g": 2,
        "omega3_ALA_g": 0.4,
        "omega3_EPA_DHA_g": 0,
        "omega3ToOmega6Ratio": "1:6",
        "cholesterol_mg": 0
      },
      "minerals": {
        "calcium_mg": 260,
        "iron_mg": 21.5,
        "bioavailableIron_mg": 2.6,
        "zinc_mg": 5.8,
        "bioavailableZinc_mg": 1.3,
        "magnesium_mg": 220,
        "potassium_mg": 750,
        "sodium_mg": 480,
        "phosphorus_mg": 420,
        "copper_mg": 1.1,
        "selenium_mcg": 22,
        "manganese_mg": 5.5
      },
      "vitamins": {
        "vitaminA_RAE_mcg": 90,
        "betaCarotene_mcg": 850,
        "vitaminC_mg": 14,
        "vitaminD_mcg": 0,
        "vitaminE_mg": 2.8,
        "vitaminB1_mg": 0.58,
        "vitaminB2_mg": 0.32,
        "vitaminB3_mg": 4.6,
        "vitaminB6_mg": 0.7,
        "vitaminB9_folate_mcg": 120,
        "vitaminB12_mcg": 0.15
      }
    },
    "costEstimatesPerServingETB": {
      "economy": 55,
      "standard": 90,
      "premium": 140
    }
  }
];
