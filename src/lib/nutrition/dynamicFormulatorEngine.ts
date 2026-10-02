/**
 * Dynamic Composite Diet Formulator Engine (ተለዋዋጭ የተመጣጠነ ማዕድና ምግብ ቀመር ሞተር)
 *
 * Enables dynamic formulation where users can specify:
 *   - Target Proximate Composition (Energy kcal/kJ, Protein %, Fat %, Carbohydrate %, Fiber g, Moisture %, Ash g)
 *   - Target Micronutrients & Amino Acids (Leucine, Lysine, EAA, Iron, Calcium, Zinc, Potassium:Sodium, Vitamin C, Folate, B12)
 *   - Preferred Ingredients (Extensive 70+ Library: Ethiopian Staples + Global Superfoods)
 *   - Health & Clinical Issues (Weight loss, Muscle build, Diabetes, Hypertension, Anemia, Gastritis, Postpartum, Longevity)
 *   - Economic Factor & Budget Tier (Economy, Standard, Premium)
 *   - Enzyme & Biochemical Cofactors (Ersho phytase 96h, Sprouting germination, Trypsin inactivation, Ascorbic acid reduction)
 *   - Platter & Presentation Formats (8 Distinct Formats: Mesob Feast, Claypot Stew, Genfo Bowl, Firfir Skillet, Chilled Deli, Tibs Skillet, Pocket Wrap, Tonic Elixir)
 *   - Dual Basis Analysis: Wet Weight (As-Eaten / Fresh Basis) AND 100% Dry Matter Basis (Moisture-Free Standard)
 *
 * Outputs:
 *   - Matching catalog dishes from 100-dish Ethiopian library
 *   - Custom synthesized recipe with exact gram weights per serving, per day, per month
 *   - 5-Tier Intensive Nutrient Profile with advanced amino acids, fatty acid chains, electrolytes, and vitamin spectrum
 *   - Dry Matter vs Wet Weight comparative analytics
 *   - Nutritional deficiency corrections and preparation steps in English and Amharic
 */

import {
  ETHIOPIAN_COMPOSITE_DIETS_CATALOG,
} from "./compositeDietsCatalog";
import type {
  EthiopianCompositeDiet,
  DietNutrientProfile,
  DietProximate,
  DietAminoAcids,
  DietFattyAcids,
  DietMinerals,
  DietVitamins,
  EconomicTier,
  EnzymeReactionType,
} from "./compositeDietFormulator";

// ─────────────────────────────────────────────────────────────────────────────
// DATA TYPES FOR DYNAMIC FORMULATOR
// ─────────────────────────────────────────────────────────────────────────────

export type IngredientOrigin = "ethiopian" | "international";
export type IngredientCategory =
  | "cereal"
  | "legume"
  | "vegetable"
  | "animal"
  | "oil_seed"
  | "spice_superfood";

export interface FormulatorIngredient {
  id: string;
  nameEn: string;
  nameAmharic: string;
  origin: IngredientOrigin;
  category: IngredientCategory;
  description: string;
  culinaryRole: string;
  keyBenefits: string[];
  defaultPortionGrams: number;
  costPer100gETB: {
    economy: number;
    standard: number;
    premium: number;
  };
  per100g: {
    energyKcal: number;
    protein_g: number;
    fat_g: number;
    carb_g: number;
    fiber_g: number;
    moisture_g: number;
    ash_g: number;
    // Essential Amino Acids (mg)
    histidine_mg: number;
    isoleucine_mg: number;
    leucine_mg: number;
    lysine_mg: number;
    methionine_mg: number;
    cysteine_mg: number;
    phenylalanine_mg: number;
    tyrosine_mg: number;
    threonine_mg: number;
    tryptophan_mg: number;
    valine_mg: number;
    arginine_mg: number;
    // Functional Amino Acids
    glycine_mg?: number;
    proline_mg?: number;
    glutamicAcid_mg?: number;
    asparticAcid_mg?: number;
    serine_mg?: number;
    alanine_mg?: number;
    limitingAmino: string;
    pdcaasScorePct: number;
    // Fatty Acids (g)
    saturatedFat_g: number;
    mufa_g: number;
    pufa_g: number;
    omega6_la_g: number;
    omega3_ala_g: number;
    omega3_epa_dha_g: number;
    oleicAcid_g?: number;
    palmiticAcid_g?: number;
    stearicAcid_g?: number;
    cholesterol_mg: number;
    // Key Minerals (mg / mcg)
    calcium_mg: number;
    iron_mg: number;
    zinc_mg: number;
    magnesium_mg: number;
    potassium_mg: number;
    sodium_mg: number;
    phosphorus_mg: number;
    copper_mg?: number;
    manganese_mg?: number;
    selenium_mcg: number;
    iodine_mcg?: number;
    // Vitamins
    vitaminA_RAE_mcg: number;
    betaCarotene_mcg: number;
    luteinZeaxanthin_mcg?: number;
    vitaminC_mg: number;
    vitaminD_mcg: number;
    vitaminE_mg: number;
    vitaminK_mcg?: number;
    vitaminB1_mg: number;
    vitaminB2_mg: number;
    vitaminB3_mg: number;
    vitaminB5_mg?: number;
    vitaminB6_mg: number;
    vitaminB7_mcg?: number;
    folate_mcg: number;
    vitaminB12_mcg: number;
    choline_mg?: number;
  };
}

export type PlatterType =
  | "multi_dish_platter"       // Grand Ceremonial Mesob (የክብር መሶብ በያይነቱ)
  | "stew_flatbread"           // Classic Claypot Wot & Rolled Injera (የሸክላ ድስት ድልብ ወጥ)
  | "ancient_grain_bowl"       // Ancestral Grain Bowl & Genfo (የባህል ገንፎ ማዕድ)
  | "functional_tonic"         // Functional Liquid Meal & Tonic Elixir (ፈሳሽ የተመጣጠነ መጠጥ)
  | "firfir_shredded_skillet"  // Stir-Fried Injera / Flatbread Firfir (የእንጀራ ፍርፍር በጋለ ምጣድ)
  | "chilled_deli_platter"     // Cold Chilled Deli Platter / Azifa & Fitfit (ቀዝቃዛ የበጋ ማዕድ)
  | "sizzling_tibs_skillet"    // Sizzling Tibs Skillet & Herbs (የጥብስ ማዕድ በጋለ ምጣድ)
  | "artisan_flatbread_pocket"; // Artisan Whole-Grain Pocket / Wrap (የተሟላ ኪስ ሳንድዊች)

export interface FormulatorHealthIssue {
  id: string;
  titleEn: string;
  titleAmharic: string;
  category: "metabolic" | "body_composition" | "cardiovascular" | "digestive" | "vitality";
  description: string;
  clinicalRationale: string;
  culturalWisdom: string;
  recommendedTargets: {
    caloriesPerServing: number;
    proteinPercent: number;
    fatPercent: number;
    carbPercent: number;
    minFiber_g: number;
  };
  recommendedIngredientIds: string[];
  preferredEnzymeReaction: EnzymeReactionType;
}

export interface DynamicFormulatorInput {
  dietCode?: string;
  customDietName?: string;
  platterType: PlatterType;
  healthIssueId: string;
  economicTier: EconomicTier;
  enzymeReaction: EnzymeReactionType;
  servingsPerDay: number;
  // Proximate target overrides
  targetCaloriesPerServing: number;
  proteinPercent: number;
  fatPercent: number;
  carbPercent: number;
  minFiber_g: number;
  // Additional proximate details requested by user:
  targetMoisturePercent?: number;
  targetAsh_g?: number;
  // Specific target amino acids, minerals, vitamins
  targetLeucine_mg?: number;
  targetLysine_mg?: number;
  targetTotalEAA_mg?: number;
  targetIron_mg?: number;
  targetCalcium_mg?: number;
  targetZinc_mg?: number;
  targetVitaminC_mg?: number;
  targetFolate_mcg?: number;
  targetVitaminB12_mcg?: number;
  // Selected ingredients
  selectedIngredientIds: string[];
}

export interface CatalogMatchResult {
  dish: EthiopianCompositeDiet;
  matchScorePct: number;
  matchReasons: string[];
  proximateComparison: {
    metric: string;
    targetValue: number;
    dishValue: number;
    unit: string;
  }[];
}

export interface SynthesizedRecipeItem {
  ingredient: FormulatorIngredient;
  gramsPerServing: number;
  gramsPerDay: number;
  gramsPerMonth: number;
  costETBPerMonth: number;
  culinaryRole: string;
  contributionPct: number;
}

export interface NutrientDeficiencyAdvisory {
  nutrientName: string;
  currentAmountFormatted: string;
  targetRdiFormatted: string;
  status: "optimal" | "mild_deficit" | "deficit" | "surplus";
  recommendationNote: string;
  suggestedAdditions: string[];
}

// ── Enhanced Culinary Preparation Structures ─────────────────────────────────

export type HeatLevel =
  | "No Heat (Cold)"
  | "Low (50–80°C)"
  | "Medium-Low (80–100°C)"
  | "Medium (100–120°C)"
  | "Medium-High (120–160°C)"
  | "High (160–200°C)"
  | "Smoking Hot (200°C+)";

export interface CulinaryPhase {
  phaseNumber: number;
  phaseNameEn: string;
  phaseNameAmharic: string;
  phasePurpose: string;
  durationMinutes: number;
  heatLevel: HeatLevel;
  vessel: string;
  stepsEn: string[];
  stepsAmharic: string[];
  biochemicalTip?: string;
  checklistItems: string[];
}

export interface CulinaryToolSet {
  vessel: string;
  vesselAmharic: string;
  utensils: string[];
  utensilsAmharic: string[];
  heatSource: string;
  heatSourceAmharic: string;
  storageVessel: string;
  storageVesselAmharic: string;
}

export interface PlatingArchitecture {
  layoutDescriptionEn: string;
  layoutDescriptionAmharic: string;
  centerpiece: string;
  centerpieceAmharic: string;
  perimeterArrangement: string[];
  colorHarmonyNote: string;
  edibleUtensilNote: string;
  culturalEtiquetteNote: string;
  garnishes: string[];
  servingTemperature: string;
}

export interface PreservationGuide {
  refrigerationInstructions: string;
  refrigerationInstructionsAmharic: string;
  reheatingMethod: string;
  reheatingMethodAmharic: string;
  maxRefrigeratedDays: number;
  batchCookingTip: string;
  batchCookingTipAmharic: string;
  monthlyBulkStorageTip: string;
  nutrientRetentionWarning: string;
}

export interface DryMatterAnalysisSummary {
  freshWeightGrams: number;
  moistureGrams: number;
  moisturePercent: number;
  dryMatterGrams: number;
  dryMatterPercent: number;
  concentrationFactor: number;
  energyKcalPer100gWet: number;
  energyKcalPer100gDry: number;
  proteinGramsPer100gWet: number;
  proteinGramsPer100gDry: number;
  fatGramsPer100gWet: number;
  fatGramsPer100gDry: number;
  carbsGramsPer100gWet: number;
  carbsGramsPer100gDry: number;
  fiberGramsPer100gWet: number;
  fiberGramsPer100gDry: number;
  ashGramsPer100gDry: number;
}

export interface ExtendedNutrientProfile {
  // Base 5-tier profiles
  base: DietNutrientProfile;
  // Extended Amino Acids & Protein Quality
  bcaaTotal_mg: number;
  glycine_mg: number;
  proline_mg: number;
  glutamicAcid_mg: number;
  asparticAcid_mg: number;
  serine_mg: number;
  alanine_mg: number;
  lysineToArginineRatio: string;
  eaaToTotalProteinRatioPct: number;
  diaasEquivalentPct: number;
  // Extended Fatty Acids
  palmiticAcid_g: number;
  stearicAcid_g: number;
  oleicAcid_g: number;
  arachidonicAcid_ARA_g: number;
  eicosapentaenoic_EPA_g: number;
  docosahexaenoic_DHA_g: number;
  polyunsaturatedToSaturatedRatio: string;
  totalOmega3_g: number;
  totalOmega6_g: number;
  // Extended Minerals & Electrolyte Ratios
  potassiumToSodiumRatio: string;
  calciumToMagnesiumRatio: string;
  calciumToPhosphorusRatio: string;
  copper_mg: number;
  manganese_mg: number;
  iodine_mcg: number;
  // Extended Vitamins
  retinol_mcg: number;
  luteinZeaxanthin_mcg: number;
  vitaminD_IU: number;
  vitaminK_mcg: number;
  vitaminB5_pantothenic_mg: number;
  vitaminB7_biotin_mcg: number;
  choline_mg: number;
}

export interface DynamicFormulationResult {
  dietCode: string;
  dietName: string;
  dietNameAmharic: string;
  isInternationalOrHybrid: boolean;
  platterType: PlatterType;
  healthIssue: FormulatorHealthIssue;
  economicTier: EconomicTier;
  enzymeReaction: EnzymeReactionType;
  servingsPerDay: number;
  // Scaled recipe
  recipeItems: SynthesizedRecipeItem[];
  totalServingGrams: number;
  costs: {
    perServingETB: number;
    perDayETB: number;
    perMonthETB: number;
  };
  // Dual-Basis 5-Tier Nutrients
  nutrientsPerServing: DietNutrientProfile; // Wet Weight Basis (As-Eaten)
  nutrientsPerServingDryMatter: DietNutrientProfile; // 100% Dry Matter Basis (Moisture-Free)
  extendedNutrientsWet: ExtendedNutrientProfile;
  extendedNutrientsDry: ExtendedNutrientProfile;
  nutrientsPerDay: DietNutrientProfile;
  nutrientsPerMonth: {
    energyKcal: number;
    protein_kg: number;
    fat_kg: number;
    carb_kg: number;
    fiber_kg: number;
  };
  // Dry Matter Analytics
  dryMatterAnalysis: DryMatterAnalysisSummary;
  rdiAdequacyPct: Record<string, number>;
  // Recommendations & Deficiency corrections
  deficiencyAdvisories: NutrientDeficiencyAdvisory[];
  // Instructions
  preparation: {
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    totalActiveCookMinutes: number;
    difficultyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert Chef";
    difficultyAmharic: string;
    stepsEn: string[];
    stepsAmharic: string[];
    enzymeBioactiveTip: string;
    platingGuide: string;
    phases: CulinaryPhase[];
    toolSet: CulinaryToolSet;
    platingArchitecture: PlatingArchitecture;
    preservationGuide: PreservationGuide;
  };
  // Clinical impact
  clinicalImpact: {
    headline: string;
    biochemicalMechanism: string;
    metabolicEffect: string;
    culturalWisdom: string;
  };
  // Top catalog matches
  matchedCatalogDishes: CatalogMatchResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// EXTENSIVE INGREDIENTS DATABASE (70+ HIGH-FIDELITY PROFILE INGREDIENTS)
// ─────────────────────────────────────────────────────────────────────────────

export const FORMULATOR_INGREDIENTS: FormulatorIngredient[] = [
  // ── 1. CEREALS, PSEUDOCEREALS & ANCIENT GRAINS (14) ────────────────────────
  {
    id: "teff_flour_fermented",
    nameEn: "Fermented Teff Injera Batter",
    nameAmharic: "የቦካ የጤፍ ሊጥ",
    origin: "ethiopian",
    category: "cereal",
    description: "Ancient staple grain fermented for 72–96 hours, rich in prebiotics, resistant starch, iron, and methionine.",
    culinaryRole: "Foundation flatbread (Injera) or wholesome crepes serving as edible utensils.",
    keyBenefits: ["Slow-digesting low GI carbohydrates", "Naturally gluten-free", "High sulfur amino acids (Methionine/Cysteine)", "High bioavailable iron from fermentation"],
    defaultPortionGrams: 200,
    costPer100gETB: { economy: 18, standard: 24, premium: 32 },
    per100g: {
      energyKcal: 145, protein_g: 4.8, fat_g: 0.8, carb_g: 29.5, fiber_g: 4.2, moisture_g: 62.0, ash_g: 1.7,
      histidine_mg: 140, isoleucine_mg: 210, leucine_mg: 390, lysine_mg: 180, methionine_mg: 160, cysteine_mg: 110,
      phenylalanine_mg: 260, tyrosine_mg: 190, threonine_mg: 190, tryptophan_mg: 60, valine_mg: 280, arginine_mg: 270,
      glycine_mg: 190, proline_mg: 310, glutamicAcid_mg: 920, asparticAcid_mg: 380, serine_mg: 220, alanine_mg: 260,
      limitingAmino: "Lysine", pdcaasScorePct: 76,
      saturatedFat_g: 0.18, mufa_g: 0.22, pufa_g: 0.38, omega6_la_g: 0.32, omega3_ala_g: 0.05, omega3_epa_dha_g: 0,
      oleicAcid_g: 0.20, palmiticAcid_g: 0.14, stearicAcid_g: 0.03, cholesterol_mg: 0,
      calcium_mg: 85, iron_mg: 7.2, zinc_mg: 2.1, magnesium_mg: 68, potassium_mg: 185, sodium_mg: 12, phosphorus_mg: 155,
      copper_mg: 0.32, manganese_mg: 2.4, selenium_mcg: 4.5, iodine_mcg: 2.1,
      vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, luteinZeaxanthin_mcg: 65, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 0.4,
      vitaminK_mcg: 1.2, vitaminB1_mg: 0.18, vitaminB2_mg: 0.12, vitaminB3_mg: 1.8, vitaminB5_mg: 0.42, vitaminB6_mg: 0.22,
      vitaminB7_mcg: 4.5, folate_mcg: 34, vitaminB12_mcg: 0, choline_mg: 18.2,
    },
  },
  {
    id: "teff_grain_red",
    nameEn: "Raw Red/Brown Teff (Tikur Teff)",
    nameAmharic: "የቀይ / የጥቁር ጤፍ እህል",
    origin: "ethiopian",
    category: "cereal",
    description: "Unpolished dark whole teff grain with superior iron, polyphenols, and slow-burning complex starch.",
    culinaryRole: "Milled for dark rustic injera, hearty porridge (Muk), or sprouted grain bowls.",
    keyBenefits: ["Highest iron density of all teff varieties", "Vast antioxidant proanthocyanidins", "Superior mineral retention"],
    defaultPortionGrams: 90,
    costPer100gETB: { economy: 16, standard: 22, premium: 28 },
    per100g: {
      energyKcal: 367, protein_g: 13.3, fat_g: 2.4, carb_g: 73.1, fiber_g: 8.0, moisture_g: 10.8, ash_g: 2.9,
      histidine_mg: 380, isoleucine_mg: 560, leucine_mg: 1040, lysine_mg: 490, methionine_mg: 410, cysteine_mg: 280,
      phenylalanine_mg: 690, tyrosine_mg: 510, threonine_mg: 510, tryptophan_mg: 170, valine_mg: 740, arginine_mg: 720,
      glycine_mg: 510, proline_mg: 820, glutamicAcid_mg: 2450, asparticAcid_mg: 980, serine_mg: 580, alanine_mg: 690,
      limitingAmino: "Lysine", pdcaasScorePct: 74,
      saturatedFat_g: 0.45, mufa_g: 0.58, pufa_g: 1.05, omega6_la_g: 0.92, omega3_ala_g: 0.11, omega3_epa_dha_g: 0,
      oleicAcid_g: 0.52, palmiticAcid_g: 0.36, stearicAcid_g: 0.07, cholesterol_mg: 0,
      calcium_mg: 180, iron_mg: 16.5, zinc_mg: 4.1, magnesium_mg: 184, potassium_mg: 427, sodium_mg: 12, phosphorus_mg: 378,
      copper_mg: 0.85, manganese_mg: 9.2, selenium_mcg: 9.8, iodine_mcg: 3.5,
      vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, luteinZeaxanthin_mcg: 120, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 0.9,
      vitaminK_mcg: 2.8, vitaminB1_mg: 0.42, vitaminB2_mg: 0.28, vitaminB3_mg: 3.4, vitaminB5_mg: 0.95, vitaminB6_mg: 0.48,
      vitaminB7_mcg: 8.2, folate_mcg: 78, vitaminB12_mcg: 0, choline_mg: 36.5,
    },
  },
  {
    id: "teff_grain_white",
    nameEn: "Magna White Teff (ነጭ ጤፍ)",
    nameAmharic: "የማኛ ነጭ ጤፍ እህል",
    origin: "ethiopian",
    category: "cereal",
    description: "Premium ivory teff prized for delicate mild taste, soft airy injera eyes (ayeb), and easy digestion.",
    culinaryRole: "Celebrated elite banquet injera and smooth children's weaning foods.",
    keyBenefits: ["Soft velvety crumb with high digestibility", "Low glycemic index", "Rich sulfur amino acids"],
    defaultPortionGrams: 90,
    costPer100gETB: { economy: 24, standard: 32, premium: 42 },
    per100g: {
      energyKcal: 365, protein_g: 12.8, fat_g: 2.2, carb_g: 74.2, fiber_g: 7.2, moisture_g: 11.2, ash_g: 2.4,
      histidine_mg: 360, isoleucine_mg: 540, leucine_mg: 990, lysine_mg: 470, methionine_mg: 390, cysteine_mg: 270,
      phenylalanine_mg: 660, tyrosine_mg: 490, threonine_mg: 490, tryptophan_mg: 160, valine_mg: 710, arginine_mg: 690,
      glycine_mg: 490, proline_mg: 780, glutamicAcid_mg: 2320, asparticAcid_mg: 940, serine_mg: 550, alanine_mg: 660,
      limitingAmino: "Lysine", pdcaasScorePct: 75,
      saturatedFat_g: 0.41, mufa_g: 0.52, pufa_g: 0.98, omega6_la_g: 0.85, omega3_ala_g: 0.10, omega3_epa_dha_g: 0,
      oleicAcid_g: 0.48, palmiticAcid_g: 0.32, stearicAcid_g: 0.06, cholesterol_mg: 0,
      calcium_mg: 160, iron_mg: 9.5, zinc_mg: 3.6, magnesium_mg: 170, potassium_mg: 405, sodium_mg: 10, phosphorus_mg: 355,
      copper_mg: 0.72, manganese_mg: 7.5, selenium_mcg: 8.5, iodine_mcg: 2.8,
      vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, luteinZeaxanthin_mcg: 90, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 0.8,
      vitaminK_mcg: 2.2, vitaminB1_mg: 0.39, vitaminB2_mg: 0.25, vitaminB3_mg: 3.2, vitaminB5_mg: 0.88, vitaminB6_mg: 0.44,
      vitaminB7_mcg: 7.5, folate_mcg: 72, vitaminB12_mcg: 0, choline_mg: 34.0,
    },
  },
  {
    id: "roasted_barley_flour",
    nameEn: "Roasted Highland Barley (Beso Flour)",
    nameAmharic: "የተቆላ የገብስ ዱቄት (በሶ)",
    origin: "ethiopian",
    category: "cereal",
    description: "Roasted high-altitude barley milled into fine flour, loaded with beta-glucan soluble fiber.",
    culinaryRole: "Instant drink, cold shake, or rolled dumplings with water or spiced butter.",
    keyBenefits: ["Cardiovascular LDL reduction via beta-glucan", "Instant sustained endurance fuel", "High satiety score"],
    defaultPortionGrams: 80,
    costPer100gETB: { economy: 15, standard: 20, premium: 28 },
    per100g: {
      energyKcal: 354, protein_g: 10.8, fat_g: 2.1, carb_g: 72.8, fiber_g: 15.6, moisture_g: 8.5, ash_g: 2.2,
      histidine_mg: 240, isoleucine_mg: 380, leucine_mg: 710, lysine_mg: 390, methionine_mg: 210, cysteine_mg: 230,
      phenylalanine_mg: 560, tyrosine_mg: 340, threonine_mg: 360, tryptophan_mg: 170, valine_mg: 520, arginine_mg: 540,
      glycine_mg: 420, proline_mg: 1120, glutamicAcid_mg: 2580, asparticAcid_mg: 620, serine_mg: 440, alanine_mg: 410,
      limitingAmino: "Lysine", pdcaasScorePct: 70,
      saturatedFat_g: 0.42, mufa_g: 0.32, pufa_g: 1.15, omega6_la_g: 0.98, omega3_ala_g: 0.12, omega3_epa_dha_g: 0,
      oleicAcid_g: 0.28, palmiticAcid_g: 0.35, stearicAcid_g: 0.05, cholesterol_mg: 0,
      calcium_mg: 38, iron_mg: 4.8, zinc_mg: 2.9, magnesium_mg: 95, potassium_mg: 320, sodium_mg: 9, phosphorus_mg: 240,
      copper_mg: 0.45, manganese_mg: 1.8, selenium_mcg: 28.0, iodine_mcg: 2.0,
      vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, luteinZeaxanthin_mcg: 140, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 0.6,
      vitaminK_mcg: 2.5, vitaminB1_mg: 0.35, vitaminB2_mg: 0.18, vitaminB3_mg: 4.6, vitaminB5_mg: 0.72, vitaminB6_mg: 0.38,
      vitaminB7_mcg: 9.4, folate_mcg: 38, vitaminB12_mcg: 0, choline_mg: 37.8,
    },
  },
  {
    id: "whole_barley_grits",
    nameEn: "Highland Whole Barley Grits (የገብስ ክክ)",
    nameAmharic: "የገብስ ክክ ለእህል ቅንጬ",
    origin: "ethiopian",
    category: "cereal",
    description: "Coarsely crushed dehusked highland barley cooked into soothing digestive porridges or soups.",
    culinaryRole: "Simmered slow grain pilafs and restorative barley broths.",
    keyBenefits: ["Massive beta-glucan for gut microbiome", "Very low glycemic index (GI 28)", "Bile acid binding"],
    defaultPortionGrams: 85,
    costPer100gETB: { economy: 14, standard: 18, premium: 25 },
    per100g: {
      energyKcal: 352, protein_g: 11.2, fat_g: 2.3, carb_g: 73.5, fiber_g: 16.2, moisture_g: 9.8, ash_g: 2.0,
      histidine_mg: 250, isoleucine_mg: 390, leucine_mg: 730, lysine_mg: 400, methionine_mg: 220, cysteine_mg: 240,
      phenylalanine_mg: 570, tyrosine_mg: 350, threonine_mg: 370, tryptophan_mg: 175, valine_mg: 530, arginine_mg: 550,
      limitingAmino: "Lysine", pdcaasScorePct: 71,
      saturatedFat_g: 0.44, mufa_g: 0.34, pufa_g: 1.18, omega6_la_g: 1.02, omega3_ala_g: 0.12, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 42, iron_mg: 5.1, zinc_mg: 3.1, magnesium_mg: 102, potassium_mg: 345, sodium_mg: 8, phosphorus_mg: 255,
      selenium_mcg: 29.5, vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 0.7,
      vitaminB1_mg: 0.38, vitaminB2_mg: 0.20, vitaminB3_mg: 4.8, vitaminB6_mg: 0.40, folate_mcg: 42, vitaminB12_mcg: 0,
    },
  },
  {
    id: "cracked_wheat_kinche",
    nameEn: "Cracked Emmer/Wheat (Kinche)",
    nameAmharic: "የስንዴ ቅንጬ",
    origin: "ethiopian",
    category: "cereal",
    description: "Coarsely crushed unpolished whole wheat/emmer simmered into fluffy grain grits.",
    culinaryRole: "Comforting breakfast pilaf infused with kibbeh or olive oil.",
    keyBenefits: ["Complex energy release", "High insoluble digestive fiber", "Rich in B-vitamins"],
    defaultPortionGrams: 100,
    costPer100gETB: { economy: 14, standard: 18, premium: 25 },
    per100g: {
      energyKcal: 342, protein_g: 12.3, fat_g: 1.8, carb_g: 69.2, fiber_g: 11.5, moisture_g: 10.2, ash_g: 1.8,
      histidine_mg: 280, isoleucine_mg: 440, leucine_mg: 820, lysine_mg: 340, methionine_mg: 190, cysteine_mg: 250,
      phenylalanine_mg: 610, tyrosine_mg: 380, threonine_mg: 370, tryptophan_mg: 150, valine_mg: 540, arginine_mg: 580,
      limitingAmino: "Lysine", pdcaasScorePct: 62,
      saturatedFat_g: 0.32, mufa_g: 0.28, pufa_g: 0.95, omega6_la_g: 0.82, omega3_ala_g: 0.08, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 34, iron_mg: 3.6, zinc_mg: 2.7, magnesium_mg: 115, potassium_mg: 360, sodium_mg: 6, phosphorus_mg: 280,
      selenium_mcg: 35.0, vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 0.8,
      vitaminB1_mg: 0.42, vitaminB2_mg: 0.15, vitaminB3_mg: 5.2, vitaminB6_mg: 0.34, folate_mcg: 45, vitaminB12_mcg: 0,
    },
  },
  {
    id: "emmer_wheat_aja",
    nameEn: "Ancient Emmer Wheat (Aja / አጃ)",
    nameAmharic: "የአጃ እህል (ኤመር)",
    origin: "ethiopian",
    category: "cereal",
    description: "Ancestral hulled wheat with higher protein and lower allergenicity, ideal for therapeutic porridges.",
    culinaryRole: "Milled into restorative porridge for nursing mothers, athletes, and convalescents.",
    keyBenefits: ["High protein (14.5%)", "Dense zinc and magnesium", "Gentle starch digestion"],
    defaultPortionGrams: 85,
    costPer100gETB: { economy: 18, standard: 24, premium: 32 },
    per100g: {
      energyKcal: 350, protein_g: 14.5, fat_g: 2.2, carb_g: 68.5, fiber_g: 10.8, moisture_g: 10.0, ash_g: 2.1,
      histidine_mg: 320, isoleucine_mg: 510, leucine_mg: 950, lysine_mg: 410, methionine_mg: 230, cysteine_mg: 280,
      phenylalanine_mg: 710, tyrosine_mg: 440, threonine_mg: 430, tryptophan_mg: 180, valine_mg: 620, arginine_mg: 670,
      limitingAmino: "Lysine", pdcaasScorePct: 68,
      saturatedFat_g: 0.38, mufa_g: 0.32, pufa_g: 1.10, omega6_la_g: 0.98, omega3_ala_g: 0.10, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 45, iron_mg: 4.8, zinc_mg: 3.8, magnesium_mg: 135, potassium_mg: 395, sodium_mg: 8, phosphorus_mg: 310,
      selenium_mcg: 38.0, vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 1.1,
      vitaminB1_mg: 0.46, vitaminB2_mg: 0.19, vitaminB3_mg: 5.8, vitaminB6_mg: 0.42, folate_mcg: 52, vitaminB12_mcg: 0,
    },
  },
  {
    id: "finger_millet_dagussa",
    nameEn: "Finger Millet (Dagussa / ዳጉሳ)",
    nameAmharic: "የዳጉሳ እህል",
    origin: "ethiopian",
    category: "cereal",
    description: "Exceptional mineral-rich African cereal with extraordinary calcium content and dense polyphenols.",
    culinaryRole: "Whisked into calcium-rich porridge, flatbread, or malted nutritional tonics.",
    keyBenefits: ["344mg Calcium per 100g (beats all cereals)", "Gluten-free low glycemic starch", "Bone density builder"],
    defaultPortionGrams: 80,
    costPer100gETB: { economy: 15, standard: 20, premium: 28 },
    per100g: {
      energyKcal: 336, protein_g: 7.3, fat_g: 1.5, carb_g: 72.0, fiber_g: 11.5, moisture_g: 11.5, ash_g: 2.7,
      histidine_mg: 180, isoleucine_mg: 320, leucine_mg: 680, lysine_mg: 220, methionine_mg: 210, cysteine_mg: 170,
      phenylalanine_mg: 410, tyrosine_mg: 290, threonine_mg: 310, tryptophan_mg: 100, valine_mg: 480, arginine_mg: 380,
      limitingAmino: "Lysine", pdcaasScorePct: 60,
      saturatedFat_g: 0.35, mufa_g: 0.28, pufa_g: 0.72, omega6_la_g: 0.62, omega3_ala_g: 0.08, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 344, iron_mg: 6.4, zinc_mg: 2.3, magnesium_mg: 137, potassium_mg: 408, sodium_mg: 11, phosphorus_mg: 283,
      selenium_mcg: 8.2, vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 0.5,
      vitaminB1_mg: 0.42, vitaminB2_mg: 0.19, vitaminB3_mg: 1.1, vitaminB6_mg: 0.38, folate_mcg: 48, vitaminB12_mcg: 0,
    },
  },
  {
    id: "sorghum_mashila",
    nameEn: "Highland Sorghum (Mashila / ማሽላ)",
    nameAmharic: "የማሽላ እህል",
    origin: "ethiopian",
    category: "cereal",
    description: "Drought-resilient ancient grain loaded with rare 3-deoxyanthocyanidin antioxidants and tannins.",
    culinaryRole: "Fermented into sweet Injera blends or boiled as whole grain rice substitute.",
    keyBenefits: ["Potent anti-carcinogenic polyphenols", "Slow-release resistant starch", "Celiac safe"],
    defaultPortionGrams: 85,
    costPer100gETB: { economy: 13, standard: 17, premium: 24 },
    per100g: {
      energyKcal: 339, protein_g: 10.6, fat_g: 3.3, carb_g: 72.1, fiber_g: 8.6, moisture_g: 11.0, ash_g: 1.6,
      histidine_mg: 220, isoleucine_mg: 380, leucine_mg: 1250, lysine_mg: 210, methionine_mg: 160, cysteine_mg: 180,
      phenylalanine_mg: 510, tyrosine_mg: 360, threonine_mg: 320, tryptophan_mg: 110, valine_mg: 510, arginine_mg: 360,
      limitingAmino: "Lysine", pdcaasScorePct: 55,
      saturatedFat_g: 0.55, mufa_g: 1.05, pufa_g: 1.45, omega6_la_g: 1.35, omega3_ala_g: 0.08, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 28, iron_mg: 4.4, zinc_mg: 2.1, magnesium_mg: 165, potassium_mg: 350, sodium_mg: 6, phosphorus_mg: 287,
      selenium_mcg: 12.0, vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 0.5,
      vitaminB1_mg: 0.33, vitaminB2_mg: 0.14, vitaminB3_mg: 3.7, vitaminB6_mg: 0.44, folate_mcg: 20, vitaminB12_mcg: 0,
    },
  },
  {
    id: "organic_quinoa_tri_color",
    nameEn: "Andean Tri-Color Quinoa (ዓለም አቀፍ ኪንዋ)",
    nameAmharic: "ኪንዋ (አንዲያን እህል)",
    origin: "international",
    category: "cereal",
    description: "Complete plant-protein pseudo-cereal loaded with all 9 essential amino acids, iron, and magnesium.",
    culinaryRole: "Fluffy modern grain bowl base or hybrid combination with Teff and barley.",
    keyBenefits: ["Rare complete plant protein (PDCAAS 88%)", "Gluten-free with low glycemic index", "Anti-inflammatory quercetin flavonoids"],
    defaultPortionGrams: 80,
    costPer100gETB: { economy: 45, standard: 65, premium: 90 },
    per100g: {
      energyKcal: 368, protein_g: 14.1, fat_g: 6.1, carb_g: 64.2, fiber_g: 7.0, moisture_g: 11.2, ash_g: 2.4,
      histidine_mg: 410, isoleucine_mg: 540, leucine_mg: 920, lysine_mg: 740, methionine_mg: 320, cysteine_mg: 250,
      phenylalanine_mg: 620, tyrosine_mg: 430, threonine_mg: 480, tryptophan_mg: 180, valine_mg: 640, arginine_mg: 1120,
      limitingAmino: "None (Balanced Complete)", pdcaasScorePct: 88,
      saturatedFat_g: 0.72, mufa_g: 1.62, pufa_g: 3.32, omega6_la_g: 2.95, omega3_ala_g: 0.35, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 47, iron_mg: 4.6, zinc_mg: 3.1, magnesium_mg: 197, potassium_mg: 563, sodium_mg: 5, phosphorus_mg: 457,
      selenium_mcg: 8.5, vitaminA_RAE_mcg: 1, betaCarotene_mcg: 8, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 2.4,
      vitaminB1_mg: 0.36, vitaminB2_mg: 0.32, vitaminB3_mg: 1.5, vitaminB6_mg: 0.49, folate_mcg: 184, vitaminB12_mcg: 0,
    },
  },
  {
    id: "steel_cut_oats",
    nameEn: "Steel-Cut Whole Oats (የአጃ ፍሌክስ)",
    nameAmharic: "የአጃ ፍሌክስ / ኦትስ",
    origin: "international",
    category: "cereal",
    description: "Minimally processed groat oats delivering concentrated avenanthramides and beta-glucan fiber.",
    culinaryRole: "Warm morning porridge or mixed into power shakes with flaxseed.",
    keyBenefits: ["Cardiovascular plaque stabilization", "High soluble beta-glucan", "Avenanthramide anti-itching/anti-inflammatory"],
    defaultPortionGrams: 80,
    costPer100gETB: { economy: 30, standard: 45, premium: 65 },
    per100g: {
      energyKcal: 379, protein_g: 13.2, fat_g: 6.5, carb_g: 67.7, fiber_g: 10.1, moisture_g: 9.5, ash_g: 1.8,
      histidine_mg: 280, isoleucine_mg: 520, leucine_mg: 980, lysine_mg: 560, methionine_mg: 240, cysteine_mg: 340,
      phenylalanine_mg: 680, tyrosine_mg: 450, threonine_mg: 440, tryptophan_mg: 180, valine_mg: 690, arginine_mg: 880,
      limitingAmino: "Lysine", pdcaasScorePct: 75,
      saturatedFat_g: 1.25, mufa_g: 2.18, pufa_g: 2.54, omega6_la_g: 2.42, omega3_ala_g: 0.11, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 52, iron_mg: 4.7, zinc_mg: 3.9, magnesium_mg: 177, potassium_mg: 429, sodium_mg: 6, phosphorus_mg: 523,
      selenium_mcg: 28.9, vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 0.7,
      vitaminB1_mg: 0.76, vitaminB2_mg: 0.14, vitaminB3_mg: 1.0, vitaminB6_mg: 0.12, folate_mcg: 56, vitaminB12_mcg: 0,
    },
  },

  // ── 2. LEGUMES, PULSES & FERMENTED PROTEINS (13) ───────────────────────────
  {
    id: "chickpea_shiro_flour",
    nameEn: "Sun-Dried Chickpea Shiro Blend (ሽሮ)",
    nameAmharic: "ሚጥን የሽሮ ዱቄት",
    origin: "ethiopian",
    category: "legume",
    description: "Spiced roasted chickpea and field pea flour seasoned with garlic, ginger, basil, and cardamom.",
    culinaryRole: "Whipped thick clay-pot stew (Tegabino) or velvety everyday fast-day staple.",
    keyBenefits: ["High Lysine complement to Teff Methionine", "High arginine for nitric oxide circulation", "Very high satiety"],
    defaultPortionGrams: 80,
    costPer100gETB: { economy: 20, standard: 28, premium: 38 },
    per100g: {
      energyKcal: 378, protein_g: 21.4, fat_g: 6.2, carb_g: 58.5, fiber_g: 14.8, moisture_g: 9.2, ash_g: 3.6,
      histidine_mg: 580, isoleucine_mg: 880, leucine_mg: 1540, lysine_mg: 1420, methionine_mg: 280, cysteine_mg: 290,
      phenylalanine_mg: 1120, tyrosine_mg: 680, threonine_mg: 810, tryptophan_mg: 210, valine_mg: 920, arginine_mg: 1880,
      glycine_mg: 880, proline_mg: 940, glutamicAcid_mg: 3850, asparticAcid_mg: 2420, serine_mg: 1040, alanine_mg: 910,
      limitingAmino: "Methionine", pdcaasScorePct: 78,
      saturatedFat_g: 0.65, mufa_g: 1.45, pufa_g: 2.85, omega6_la_g: 2.65, omega3_ala_g: 0.18, omega3_epa_dha_g: 0,
      oleicAcid_g: 1.38, palmiticAcid_g: 0.52, stearicAcid_g: 0.08, cholesterol_mg: 0,
      calcium_mg: 110, iron_mg: 6.8, zinc_mg: 3.8, magnesium_mg: 125, potassium_mg: 790, sodium_mg: 45, phosphorus_mg: 330,
      copper_mg: 0.82, manganese_mg: 2.1, selenium_mcg: 12.0, iodine_mcg: 3.2,
      vitaminA_RAE_mcg: 5, betaCarotene_mcg: 32, luteinZeaxanthin_mcg: 280, vitaminC_mg: 3.2, vitaminD_mcg: 0, vitaminE_mg: 1.1,
      vitaminK_mcg: 9.0, vitaminB1_mg: 0.48, vitaminB2_mg: 0.22, vitaminB3_mg: 2.1, vitaminB5_mg: 1.45, vitaminB6_mg: 0.52,
      vitaminB7_mcg: 18.0, folate_mcg: 430, vitaminB12_mcg: 0, choline_mg: 95.0,
    },
  },
  {
    id: "whole_roasted_chickpea_qolo",
    nameEn: "Highland Roasted Chickpeas (Shimbra Qolo)",
    nameAmharic: "የተቆላ ሽምብራ ቆሎ",
    origin: "ethiopian",
    category: "legume",
    description: "Slow-roasted crunchy whole chickpeas with sea salt and rosemary, an authentic high-protein portable snack.",
    culinaryRole: "Crunchy snack, salad topper, or accompaniment to Ethiopian coffee ceremony.",
    keyBenefits: ["Crunchy high-satiety snacking", "Zero blood sugar crash", "High prebiotic galactooligosaccharides"],
    defaultPortionGrams: 50,
    costPer100gETB: { economy: 18, standard: 25, premium: 35 },
    per100g: {
      energyKcal: 395, protein_g: 20.8, fat_g: 6.8, carb_g: 61.2, fiber_g: 15.2, moisture_g: 6.5, ash_g: 3.2,
      histidine_mg: 560, isoleucine_mg: 860, leucine_mg: 1500, lysine_mg: 1390, methionine_mg: 270, cysteine_mg: 280,
      phenylalanine_mg: 1090, tyrosine_mg: 660, threonine_mg: 790, tryptophan_mg: 200, valine_mg: 900, arginine_mg: 1840,
      limitingAmino: "Methionine", pdcaasScorePct: 76,
      saturatedFat_g: 0.72, mufa_g: 1.55, pufa_g: 3.05, omega6_la_g: 2.85, omega3_ala_g: 0.18, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 115, iron_mg: 6.2, zinc_mg: 3.6, magnesium_mg: 130, potassium_mg: 810, sodium_mg: 180, phosphorus_mg: 340,
      selenium_mcg: 11.5, vitaminA_RAE_mcg: 4, betaCarotene_mcg: 28, vitaminC_mg: 1.5, vitaminD_mcg: 0, vitaminE_mg: 0.9,
      vitaminB1_mg: 0.44, vitaminB2_mg: 0.19, vitaminB3_mg: 1.8, vitaminB6_mg: 0.48, folate_mcg: 380, vitaminB12_mcg: 0,
    },
  },
  {
    id: "red_lentils_misir",
    nameEn: "Split Red Lentils (Yemisir)",
    nameAmharic: "የቀይ ምስር ክክ",
    origin: "ethiopian",
    category: "legume",
    description: "Quick-cooking red lentils simmered in rich berbere spice, sweet onions, and garlic.",
    culinaryRole: "Fiery rich stew (Yemisir Wot) or mild comforting stew (Misir Alicha).",
    keyBenefits: ["Exceptional folate & iron source", "Rapid cooking with zero phytic acid lock", "Plant protein powerhouse"],
    defaultPortionGrams: 85,
    costPer100gETB: { economy: 24, standard: 32, premium: 42 },
    per100g: {
      energyKcal: 358, protein_g: 24.6, fat_g: 1.2, carb_g: 61.8, fiber_g: 11.2, moisture_g: 10.5, ash_g: 2.7,
      histidine_mg: 620, isoleucine_mg: 990, leucine_mg: 1780, lysine_mg: 1680, methionine_mg: 210, cysteine_mg: 260,
      phenylalanine_mg: 1240, tyrosine_mg: 720, threonine_mg: 890, tryptophan_mg: 220, valine_mg: 1120, arginine_mg: 1940,
      limitingAmino: "Methionine", pdcaasScorePct: 74,
      saturatedFat_g: 0.18, mufa_g: 0.22, pufa_g: 0.55, omega6_la_g: 0.45, omega3_ala_g: 0.08, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 48, iron_mg: 7.5, zinc_mg: 3.4, magnesium_mg: 98, potassium_mg: 820, sodium_mg: 14, phosphorus_mg: 290,
      selenium_mcg: 14.5, vitaminA_RAE_mcg: 2, betaCarotene_mcg: 16, vitaminC_mg: 2.0, vitaminD_mcg: 0, vitaminE_mg: 0.7,
      vitaminB1_mg: 0.54, vitaminB2_mg: 0.21, vitaminB3_mg: 2.6, vitaminB6_mg: 0.44, folate_mcg: 480, vitaminB12_mcg: 0,
    },
  },
  {
    id: "faba_beans_ful",
    nameEn: "Crushed Faba Beans (Baqela / Ful)",
    nameAmharic: "የባቄላ ፉል",
    origin: "ethiopian",
    category: "legume",
    description: "Slow-simmered highland broad beans mashed with cumin, olive oil, tomato, and fresh peppers.",
    culinaryRole: "High-protein breakfast skillet served with warm whole-grain pita or injera.",
    keyBenefits: ["Natural L-DOPA precursor for cognitive clarity", "Massive protein and mineral density", "High satiety"],
    defaultPortionGrams: 100,
    costPer100gETB: { economy: 18, standard: 25, premium: 35 },
    per100g: {
      energyKcal: 341, protein_g: 26.1, fat_g: 1.5, carb_g: 58.3, fiber_g: 16.5, moisture_g: 11.0, ash_g: 3.1,
      histidine_mg: 660, isoleucine_mg: 1020, leucine_mg: 1840, lysine_mg: 1720, methionine_mg: 220, cysteine_mg: 280,
      phenylalanine_mg: 1160, tyrosine_mg: 790, threonine_mg: 870, tryptophan_mg: 240, valine_mg: 1090, arginine_mg: 2150,
      limitingAmino: "Methionine", pdcaasScorePct: 76,
      saturatedFat_g: 0.24, mufa_g: 0.26, pufa_g: 0.68, omega6_la_g: 0.58, omega3_ala_g: 0.09, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 103, iron_mg: 6.7, zinc_mg: 3.1, magnesium_mg: 192, potassium_mg: 1060, sodium_mg: 18, phosphorus_mg: 420,
      selenium_mcg: 11.2, vitaminA_RAE_mcg: 3, betaCarotene_mcg: 20, vitaminC_mg: 1.8, vitaminD_mcg: 0, vitaminE_mg: 0.5,
      vitaminB1_mg: 0.55, vitaminB2_mg: 0.29, vitaminB3_mg: 2.8, vitaminB6_mg: 0.38, folate_mcg: 423, vitaminB12_mcg: 0,
    },
  },
  {
    id: "split_yellow_peas_kik",
    nameEn: "Split Yellow Peas (Kik Ater)",
    nameAmharic: "የቢጫ አተር ክክ",
    origin: "ethiopian",
    category: "legume",
    description: "Dehulled split yellow field peas simmered with garlic, ginger, and turmeric into mild Kik Alicha.",
    culinaryRole: "Golden mild stew providing soothing color and creaminess on Beyayinetu platters.",
    keyBenefits: ["Low allergenicity and gentle on sensitive guts", "High potassium and folate", "Pure complex carbohydrate energy"],
    defaultPortionGrams: 80,
    costPer100gETB: { economy: 18, standard: 24, premium: 32 },
    per100g: {
      energyKcal: 341, protein_g: 24.5, fat_g: 1.2, carb_g: 60.4, fiber_g: 15.5, moisture_g: 10.8, ash_g: 2.6,
      histidine_mg: 590, isoleucine_mg: 970, leucine_mg: 1720, lysine_mg: 1750, methionine_mg: 230, cysteine_mg: 270,
      phenylalanine_mg: 1180, tyrosine_mg: 710, threonine_mg: 860, tryptophan_mg: 210, valine_mg: 1080, arginine_mg: 1980,
      limitingAmino: "Methionine", pdcaasScorePct: 75,
      saturatedFat_g: 0.19, mufa_g: 0.24, pufa_g: 0.58, omega6_la_g: 0.48, omega3_ala_g: 0.08, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 55, iron_mg: 4.4, zinc_mg: 3.0, magnesium_mg: 115, potassium_mg: 980, sodium_mg: 15, phosphorus_mg: 320,
      selenium_mcg: 13.0, vitaminA_RAE_mcg: 2, betaCarotene_mcg: 18, vitaminC_mg: 1.4, vitaminD_mcg: 0, vitaminE_mg: 0.4,
      vitaminB1_mg: 0.72, vitaminB2_mg: 0.22, vitaminB3_mg: 2.9, vitaminB6_mg: 0.35, folate_mcg: 274, vitaminB12_mcg: 0,
    },
  },
  {
    id: "grass_pea_guaya",
    nameEn: "Grass Pea / Chickling Vetch (Guaya / ጓያ)",
    nameAmharic: "የጓያ ክክ (የተዘፈቀ)",
    origin: "ethiopian",
    category: "legume",
    description: "Drought-hardy ancient pulse pre-soaked and boiled to remove ODAP, prized for extreme protein density (28%).",
    culinaryRole: "Thick savory porridge or Shiro amplifier during fasting seasons.",
    keyBenefits: ["Extreme protein concentration", "Rich in polyphenols", "High prebiotic resistant starch"],
    defaultPortionGrams: 75,
    costPer100gETB: { economy: 12, standard: 16, premium: 22 },
    per100g: {
      energyKcal: 345, protein_g: 28.2, fat_g: 1.1, carb_g: 57.8, fiber_g: 14.2, moisture_g: 10.2, ash_g: 3.0,
      histidine_mg: 680, isoleucine_mg: 1120, leucine_mg: 1980, lysine_mg: 1880, methionine_mg: 240, cysteine_mg: 290,
      phenylalanine_mg: 1290, tyrosine_mg: 820, threonine_mg: 950, tryptophan_mg: 230, valine_mg: 1180, arginine_mg: 2280,
      limitingAmino: "Methionine", pdcaasScorePct: 73,
      saturatedFat_g: 0.18, mufa_g: 0.22, pufa_g: 0.52, omega6_la_g: 0.42, omega3_ala_g: 0.08, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 92, iron_mg: 7.8, zinc_mg: 3.8, magnesium_mg: 142, potassium_mg: 1020, sodium_mg: 18, phosphorus_mg: 380,
      selenium_mcg: 10.5, vitaminA_RAE_mcg: 3, betaCarotene_mcg: 22, vitaminC_mg: 2.1, vitaminD_mcg: 0, vitaminE_mg: 0.6,
      vitaminB1_mg: 0.62, vitaminB2_mg: 0.24, vitaminB3_mg: 3.1, vitaminB6_mg: 0.38, folate_mcg: 390, vitaminB12_mcg: 0,
    },
  },
  {
    id: "fermented_organic_tempeh",
    nameEn: "Cultured Soy Tempeh (የተብላላ ቴምፔ)",
    nameAmharic: "ቴምፔ (የተብላላ አኩሪ አተር)",
    origin: "international",
    category: "legume",
    description: "Rhizopus-fermented whole soybeans with dense umami texture, deactivated anti-nutrients, and complete amino acids.",
    culinaryRole: "Marinated cubes pan-seared with berbere or tossed into hearty stir-fries.",
    keyBenefits: ["Fermentation inactivates phytic acid and increases isoflavone bioavailability", "High calcium and magnesium", "Prebiotic fungal mycelium"],
    defaultPortionGrams: 100,
    costPer100gETB: { economy: 40, standard: 55, premium: 75 },
    per100g: {
      energyKcal: 192, protein_g: 20.3, fat_g: 10.8, carb_g: 7.6, fiber_g: 4.5, moisture_g: 60.0, ash_g: 1.3,
      histidine_mg: 560, isoleucine_mg: 920, leucine_mg: 1580, lysine_mg: 1240, methionine_mg: 280, cysteine_mg: 240,
      phenylalanine_mg: 1020, tyrosine_mg: 720, threonine_mg: 860, tryptophan_mg: 230, valine_mg: 980, arginine_mg: 1420,
      limitingAmino: "Methionine", pdcaasScorePct: 88,
      saturatedFat_g: 2.2, mufa_g: 3.0, pufa_g: 5.1, omega6_la_g: 4.4, omega3_ala_g: 0.65, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 111, iron_mg: 2.7, zinc_mg: 1.8, magnesium_mg: 81, potassium_mg: 412, sodium_mg: 9, phosphorus_mg: 266,
      selenium_mcg: 8.8, vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 0.8,
      vitaminB1_mg: 0.28, vitaminB2_mg: 0.36, vitaminB3_mg: 4.6, vitaminB6_mg: 0.22, folate_mcg: 24, vitaminB12_mcg: 0.08,
    },
  },
  {
    id: "organic_edamame_soy",
    nameEn: "Steamed Green Edamame (አኩሪ አተር)",
    nameAmharic: "የአኩሪ አተር እሸት",
    origin: "international",
    category: "legume",
    description: "Young green whole soybeans delivering complete protein, folate, and heart-protective isoflavones.",
    culinaryRole: "Tossed whole in salads, sautéed with garlic, or blended into velvety green purees.",
    keyBenefits: ["Complete plant protein", "High natural folate", "Rich in saponins and phytosterols"],
    defaultPortionGrams: 90,
    costPer100gETB: { economy: 35, standard: 50, premium: 70 },
    per100g: {
      energyKcal: 122, protein_g: 11.9, fat_g: 5.2, carb_g: 8.9, fiber_g: 5.2, moisture_g: 72.0, ash_g: 1.8,
      histidine_mg: 340, isoleucine_mg: 540, leucine_mg: 930, lysine_mg: 780, methionine_mg: 160, cysteine_mg: 150,
      phenylalanine_mg: 610, tyrosine_mg: 420, threonine_mg: 520, tryptophan_mg: 140, valine_mg: 580, arginine_mg: 840,
      limitingAmino: "Methionine", pdcaasScorePct: 86,
      saturatedFat_g: 0.68, mufa_g: 1.25, pufa_g: 2.85, omega6_la_g: 2.45, omega3_ala_g: 0.38, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 63, iron_mg: 2.3, zinc_mg: 1.4, magnesium_mg: 64, potassium_mg: 436, sodium_mg: 6, phosphorus_mg: 169,
      selenium_mcg: 0.8, vitaminA_RAE_mcg: 15, betaCarotene_mcg: 175, vitaminC_mg: 6.1, vitaminD_mcg: 0, vitaminE_mg: 0.7,
      vitaminB1_mg: 0.20, vitaminB2_mg: 0.16, vitaminB3_mg: 0.9, vitaminB6_mg: 0.22, folate_mcg: 311, vitaminB12_mcg: 0,
    },
  },

  // ── 3. OILSEEDS, NUTS & FUNCTIONAL LIPIDS (13) ─────────────────────────────
  {
    id: "flaxseed_telba",
    nameEn: "Highland Golden/Brown Flaxseed (Telba)",
    nameAmharic: "የተፈጨ የቴልባ ፍሬ",
    origin: "ethiopian",
    category: "oil_seed",
    description: "Roasted and water-extracted mucilaginous flaxseed, supreme plant source of Alpha-Linolenic Acid (Omega-3).",
    culinaryRole: "Soothing drink (Telba Muk) or chilled Injera Fitfit dressing.",
    keyBenefits: ["Vast Omega-3 ALA content for reducing systemic inflammation", "Soluble prebiotic lignans", "Gastro-mucosal protection"],
    defaultPortionGrams: 35,
    costPer100gETB: { economy: 22, standard: 30, premium: 42 },
    per100g: {
      energyKcal: 534, protein_g: 18.3, fat_g: 42.2, carb_g: 28.9, fiber_g: 27.3, moisture_g: 7.0, ash_g: 3.6,
      histidine_mg: 440, isoleucine_mg: 710, leucine_mg: 1150, lysine_mg: 780, methionine_mg: 340, cysteine_mg: 320,
      phenylalanine_mg: 840, tyrosine_mg: 510, threonine_mg: 680, tryptophan_mg: 260, valine_mg: 950, arginine_mg: 1720,
      glycine_mg: 1250, proline_mg: 980, glutamicAcid_mg: 3650, asparticAcid_mg: 1980, serine_mg: 920, alanine_mg: 880,
      limitingAmino: "Lysine", pdcaasScorePct: 70,
      saturatedFat_g: 3.65, mufa_g: 7.52, pufa_g: 28.7, omega6_la_g: 5.9, omega3_ala_g: 22.8, omega3_epa_dha_g: 0,
      oleicAcid_g: 7.20, palmiticAcid_g: 2.10, stearicAcid_g: 1.40, cholesterol_mg: 0,
      calcium_mg: 255, iron_mg: 5.7, zinc_mg: 4.2, magnesium_mg: 392, potassium_mg: 813, sodium_mg: 30, phosphorus_mg: 642,
      copper_mg: 1.22, manganese_mg: 2.48, selenium_mcg: 25.4, iodine_mcg: 1.5,
      vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, luteinZeaxanthin_mcg: 650, vitaminC_mg: 0.6, vitaminD_mcg: 0, vitaminE_mg: 0.3,
      vitaminK_mcg: 4.3, vitaminB1_mg: 1.64, vitaminB2_mg: 0.16, vitaminB3_mg: 3.1, vitaminB5_mg: 0.98, vitaminB6_mg: 0.47,
      vitaminB7_mcg: 6.2, folate_mcg: 87, vitaminB12_mcg: 0, choline_mg: 78.7,
    },
  },
  {
    id: "niger_seed_nug",
    nameEn: "Ethiopian Niger Seed (Nug / የኑግ ፍሬ)",
    nameAmharic: "የተፈጨ የኑግ ፍሬ",
    origin: "ethiopian",
    category: "oil_seed",
    description: "Indigenous oilseed producing fragrant light dressing and high-grade linoleic acid.",
    culinaryRole: "Whipped into silky milk (Ye'nug Wetet) or folded with injera into fast-day fitfit.",
    keyBenefits: ["Rich in essential polyunsaturated fatty acids", "High magnesium and vitamin E", "Brain and nervous system lipid support"],
    defaultPortionGrams: 35,
    costPer100gETB: { economy: 25, standard: 35, premium: 48 },
    per100g: {
      energyKcal: 512, protein_g: 19.5, fat_g: 39.0, carb_g: 29.5, fiber_g: 18.5, moisture_g: 6.8, ash_g: 4.2,
      histidine_mg: 480, isoleucine_mg: 760, leucine_mg: 1220, lysine_mg: 850, methionine_mg: 360, cysteine_mg: 310,
      phenylalanine_mg: 920, tyrosine_mg: 540, threonine_mg: 710, tryptophan_mg: 240, valine_mg: 990, arginine_mg: 1840,
      limitingAmino: "Lysine", pdcaasScorePct: 72,
      saturatedFat_g: 4.8, mufa_g: 5.2, pufa_g: 27.2, omega6_la_g: 24.5, omega3_ala_g: 2.4, omega3_epa_dha_g: 0,
      oleicAcid_g: 4.90, palmiticAcid_g: 3.10, stearicAcid_g: 1.50, cholesterol_mg: 0,
      calcium_mg: 280, iron_mg: 9.2, zinc_mg: 4.8, magnesium_mg: 340, potassium_mg: 720, sodium_mg: 22, phosphorus_mg: 580,
      copper_mg: 1.10, manganese_mg: 2.2, selenium_mcg: 18.0, iodine_mcg: 1.2,
      vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 0.8, vitaminD_mcg: 0, vitaminE_mg: 4.2,
      vitaminB1_mg: 0.82, vitaminB2_mg: 0.24, vitaminB3_mg: 3.8, vitaminB6_mg: 0.42, folate_mcg: 95, vitaminB12_mcg: 0,
    },
  },
  {
    id: "white_sesame_selit",
    nameEn: "Highland White Sesame (Selit / ሰሊጥ)",
    nameAmharic: "የተላጠ የሰሊጥ ፍሬ",
    origin: "ethiopian",
    category: "oil_seed",
    description: "High-grade Humera white sesame delivering incredible calcium density and sesamin lignans.",
    culinaryRole: "Toasted and ground into rich paste, sprinkled over injera, or blended into seed milks.",
    keyBenefits: ["975mg Calcium per 100g (superlative bone builder)", "Rich in sesamin and sesamolin antioxidants", "High copper and zinc"],
    defaultPortionGrams: 30,
    costPer100gETB: { economy: 30, standard: 42, premium: 58 },
    per100g: {
      energyKcal: 573, protein_g: 17.7, fat_g: 49.7, carb_g: 23.4, fiber_g: 11.8, moisture_g: 4.7, ash_g: 4.5,
      histidine_mg: 480, isoleucine_mg: 680, leucine_mg: 1220, lysine_mg: 570, methionine_mg: 520, cysteine_mg: 360,
      phenylalanine_mg: 820, tyrosine_mg: 560, threonine_mg: 620, tryptophan_mg: 380, valine_mg: 880, arginine_mg: 2420,
      limitingAmino: "Lysine", pdcaasScorePct: 68,
      saturatedFat_g: 7.0, mufa_g: 18.8, pufa_g: 21.8, omega6_la_g: 21.4, omega3_ala_g: 0.38, omega3_epa_dha_g: 0,
      oleicAcid_g: 18.5, palmiticAcid_g: 4.8, stearicAcid_g: 2.0, cholesterol_mg: 0,
      calcium_mg: 975, iron_mg: 14.6, zinc_mg: 7.8, magnesium_mg: 351, potassium_mg: 468, sodium_mg: 11, phosphorus_mg: 629,
      copper_mg: 4.08, manganese_mg: 2.46, selenium_mcg: 34.4, iodine_mcg: 1.8,
      vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 0.25,
      vitaminB1_mg: 0.79, vitaminB2_mg: 0.25, vitaminB3_mg: 4.5, vitaminB6_mg: 0.79, folate_mcg: 97, vitaminB12_mcg: 0,
    },
  },
  {
    id: "organic_chia_seeds",
    nameEn: "Organic Black Chia Seeds (የቺያ ፍሬ)",
    nameAmharic: "የቺያ ፍሬ",
    origin: "international",
    category: "oil_seed",
    description: "Hydrophilic seeds that swell to form a hydrating mucilage matrix, providing remarkable soluble fiber and Omega-3 ALA.",
    culinaryRole: "Chia pudding, porridge enrichment, or whipped with lemon and honey.",
    keyBenefits: ["Hydrating mucilage slowing glucose release", "Vast plant Omega-3 ALA", "Supreme soluble and insoluble fiber"],
    defaultPortionGrams: 30,
    costPer100gETB: { economy: 40, standard: 60, premium: 85 },
    per100g: {
      energyKcal: 486, protein_g: 16.5, fat_g: 30.7, carb_g: 42.1, fiber_g: 34.4, moisture_g: 5.8, ash_g: 4.8,
      histidine_mg: 530, isoleucine_mg: 780, leucine_mg: 1350, lysine_mg: 970, methionine_mg: 580, cysteine_mg: 410,
      phenylalanine_mg: 1010, tyrosine_mg: 560, threonine_mg: 710, tryptophan_mg: 440, valine_mg: 950, arginine_mg: 2140,
      limitingAmino: "Lysine", pdcaasScorePct: 78,
      saturatedFat_g: 3.3, mufa_g: 2.3, pufa_g: 23.7, omega6_la_g: 5.8, omega3_ala_g: 17.8, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 631, iron_mg: 7.7, zinc_mg: 4.6, magnesium_mg: 335, potassium_mg: 407, sodium_mg: 16, phosphorus_mg: 860,
      selenium_mcg: 55.2, vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 1.6, vitaminD_mcg: 0, vitaminE_mg: 0.5,
      vitaminB1_mg: 0.62, vitaminB2_mg: 0.17, vitaminB3_mg: 8.8, vitaminB6_mg: 0.38, folate_mcg: 49, vitaminB12_mcg: 0,
    },
  },
  {
    id: "raw_walnuts",
    nameEn: "Raw Heart Walnuts (የዋልነት ፍሬ)",
    nameAmharic: "የዋልነት ፍሬ (ዓለም አቀፍ)",
    origin: "international",
    category: "oil_seed",
    description: "Brain-shaped nuts delivering dense alpha-linolenic acid, polyphenols, and neuro-protective melatonin.",
    culinaryRole: "Crushed over porridges, salads, or folded into spiced nut butter.",
    keyBenefits: ["Top nut source of plant Omega-3 ALA (9.1g/100g)", "Supports cognitive longevity", "Endothelial vascular elasticity"],
    defaultPortionGrams: 30,
    costPer100gETB: { economy: 75, standard: 110, premium: 150 },
    per100g: {
      energyKcal: 654, protein_g: 15.2, fat_g: 65.2, carb_g: 13.7, fiber_g: 6.7, moisture_g: 4.1, ash_g: 1.8,
      histidine_mg: 390, isoleucine_mg: 620, leucine_mg: 1170, lysine_mg: 420, methionine_mg: 280, cysteine_mg: 210,
      phenylalanine_mg: 710, tyrosine_mg: 410, threonine_mg: 600, tryptophan_mg: 170, valine_mg: 750, arginine_mg: 2280,
      limitingAmino: "Lysine", pdcaasScorePct: 70,
      saturatedFat_g: 6.1, mufa_g: 8.9, pufa_g: 47.2, omega6_la_g: 38.1, omega3_ala_g: 9.1, omega3_epa_dha_g: 0,
      oleicAcid_g: 8.8, palmiticAcid_g: 4.2, stearicAcid_g: 1.8, cholesterol_mg: 0,
      calcium_mg: 98, iron_mg: 2.9, zinc_mg: 3.1, magnesium_mg: 158, potassium_mg: 441, sodium_mg: 2, phosphorus_mg: 346,
      copper_mg: 1.59, manganese_mg: 3.4, selenium_mcg: 4.9, iodine_mcg: 1.0,
      vitaminA_RAE_mcg: 1, betaCarotene_mcg: 12, vitaminC_mg: 1.3, vitaminD_mcg: 0, vitaminE_mg: 0.7,
      vitaminB1_mg: 0.34, vitaminB2_mg: 0.15, vitaminB3_mg: 1.1, vitaminB6_mg: 0.54, folate_mcg: 98, vitaminB12_mcg: 0,
    },
  },
  {
    id: "hass_avocado",
    nameEn: "Creamy Hass Avocado (አቮካዶ)",
    nameAmharic: "አቮካዶ",
    origin: "international",
    category: "vegetable",
    description: "Nutrient-dense fruit rich in oleic acid monounsaturated fat, potassium, and carotenoid enhancers.",
    culinaryRole: "Sliced creamy garnish on warm Injera or blended into rich gazpacho salad dressing.",
    keyBenefits: ["Enhances carotenoid absorption from greens by 400%", "High potassium to sodium ratio for blood pressure control", "Silky heart-healthy monounsaturated lipids"],
    defaultPortionGrams: 80,
    costPer100gETB: { economy: 18, standard: 25, premium: 35 },
    per100g: {
      energyKcal: 160, protein_g: 2.0, fat_g: 14.7, carb_g: 8.5, fiber_g: 6.7, moisture_g: 73.0, ash_g: 1.6,
      histidine_mg: 49, isoleucine_mg: 84, leucine_mg: 143, lysine_mg: 132, methionine_mg: 38, cysteine_mg: 27,
      phenylalanine_mg: 97, tyrosine_mg: 52, threonine_mg: 73, tryptophan_mg: 25, valine_mg: 107, arginine_mg: 88,
      limitingAmino: "Methionine", pdcaasScorePct: 65,
      saturatedFat_g: 2.1, mufa_g: 9.8, pufa_g: 1.8, omega6_la_g: 1.68, omega3_ala_g: 0.11, omega3_epa_dha_g: 0,
      oleicAcid_g: 9.6, palmiticAcid_g: 1.9, stearicAcid_g: 0.15, cholesterol_mg: 0,
      calcium_mg: 12, iron_mg: 0.6, zinc_mg: 0.6, magnesium_mg: 29, potassium_mg: 485, sodium_mg: 7, phosphorus_mg: 52,
      copper_mg: 0.19, manganese_mg: 0.14, selenium_mcg: 0.4, iodine_mcg: 0.8,
      vitaminA_RAE_mcg: 7, betaCarotene_mcg: 62, luteinZeaxanthin_mcg: 271, vitaminC_mg: 10.0, vitaminD_mcg: 0, vitaminE_mg: 2.1,
      vitaminK_mcg: 21.0, vitaminB1_mg: 0.07, vitaminB2_mg: 0.13, vitaminB3_mg: 1.7, vitaminB6_mg: 0.26, folate_mcg: 81, vitaminB12_mcg: 0,
    },
  },
  {
    id: "spiced_clarified_butter_kibbeh",
    nameEn: "Herbal Spiced Clarified Butter (Niter Kibbeh)",
    nameAmharic: "ንጥር ቅቤ",
    origin: "ethiopian",
    category: "oil_seed",
    description: "Clarified grass-fed butter infused with korarima, kosseret, thyme, turmeric, garlic, and fenugreek.",
    culinaryRole: "Aromatic cooking medium providing profound mouthfeel and lipid-soluble vitamin transport.",
    keyBenefits: ["Rich in fat-soluble vitamins A, D, E, K2", "Butyrate for gut mucosal barrier integrity", "Carotenoid carrier"],
    defaultPortionGrams: 20,
    costPer100gETB: { economy: 80, standard: 110, premium: 150 },
    per100g: {
      energyKcal: 884, protein_g: 0.4, fat_g: 99.5, carb_g: 0, fiber_g: 0, moisture_g: 0.2, ash_g: 0.1,
      histidine_mg: 10, isoleucine_mg: 15, leucine_mg: 28, lysine_mg: 22, methionine_mg: 8, cysteine_mg: 4,
      phenylalanine_mg: 14, tyrosine_mg: 12, threonine_mg: 14, tryptophan_mg: 4, valine_mg: 18, arginine_mg: 12,
      limitingAmino: "N/A (Lipid source)", pdcaasScorePct: 90,
      saturatedFat_g: 62.0, mufa_g: 27.5, pufa_g: 3.8, omega6_la_g: 2.2, omega3_ala_g: 1.1, omega3_epa_dha_g: 0.08,
      oleicAcid_g: 26.8, palmiticAcid_g: 28.5, stearicAcid_g: 12.0, cholesterol_mg: 256,
      calcium_mg: 18, iron_mg: 0.4, zinc_mg: 0.2, magnesium_mg: 4, potassium_mg: 15, sodium_mg: 10, phosphorus_mg: 20,
      selenium_mcg: 1.2, vitaminA_RAE_mcg: 840, betaCarotene_mcg: 120, vitaminC_mg: 0, vitaminD_mcg: 1.8, vitaminE_mg: 2.8,
      vitaminK_mcg: 8.6, vitaminB1_mg: 0.01, vitaminB2_mg: 0.02, vitaminB3_mg: 0.05, vitaminB6_mg: 0.01, folate_mcg: 3, vitaminB12_mcg: 0.18,
    },
  },
  {
    id: "extra_virgin_olive_oil",
    nameEn: "Extra Virgin Olive Oil (የወይራ ዘይት)",
    nameAmharic: "የወይራ ዘይት (ቀዝቃዛ የተጨመቀ)",
    origin: "international",
    category: "oil_seed",
    description: "Cold-pressed unrefined olive oil rich in oleocanthal, oleic acid, and squalene.",
    culinaryRole: "Finishing dressing on warm lentils, salads, and fast-day fitfit.",
    keyBenefits: ["High oleocanthal natural COX-inhibitor", "Superb monounsaturated lipid profile", "Vascular endothelium protection"],
    defaultPortionGrams: 20,
    costPer100gETB: { economy: 60, standard: 85, premium: 120 },
    per100g: {
      energyKcal: 884, protein_g: 0, fat_g: 100, carb_g: 0, fiber_g: 0, moisture_g: 0, ash_g: 0,
      histidine_mg: 0, isoleucine_mg: 0, leucine_mg: 0, lysine_mg: 0, methionine_mg: 0, cysteine_mg: 0,
      phenylalanine_mg: 0, tyrosine_mg: 0, threonine_mg: 0, tryptophan_mg: 0, valine_mg: 0, arginine_mg: 0,
      limitingAmino: "N/A", pdcaasScorePct: 0,
      saturatedFat_g: 13.8, mufa_g: 73.0, pufa_g: 10.5, omega6_la_g: 9.8, omega3_ala_g: 0.7, omega3_epa_dha_g: 0,
      oleicAcid_g: 72.0, palmiticAcid_g: 11.0, stearicAcid_g: 2.2, cholesterol_mg: 0,
      calcium_mg: 1, iron_mg: 0.5, zinc_mg: 0.1, magnesium_mg: 0, potassium_mg: 1, sodium_mg: 2, phosphorus_mg: 0,
      selenium_mcg: 0, vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 14.3,
      vitaminK_mcg: 60.2, vitaminB1_mg: 0, vitaminB2_mg: 0, vitaminB3_mg: 0, vitaminB6_mg: 0, folate_mcg: 0, vitaminB12_mcg: 0,
    },
  },

  // ── 4. VEGETABLES, ROOTS, TUBERS & GREENS (14) ─────────────────────────────
  {
    id: "ethiopian_collard_gomen",
    nameEn: "Highland Collard Greens (Ye'abesha Gomen)",
    nameAmharic: "የሀበሻ ጎመን",
    origin: "ethiopian",
    category: "vegetable",
    description: "Finely sliced brassica greens sautéed with garlic, ginger, cardamom, and onions.",
    culinaryRole: "Vibrant emerald green centerpiece on Beyayinetu platters.",
    keyBenefits: ["Huge lutein & beta-carotene for cellular protection", "Glucosinolates supporting hepatic detox", "Bone calcium density"],
    defaultPortionGrams: 120,
    costPer100gETB: { economy: 10, standard: 15, premium: 22 },
    per100g: {
      energyKcal: 48, protein_g: 3.2, fat_g: 1.8, carb_g: 6.5, fiber_g: 3.8, moisture_g: 87.0, ash_g: 1.5,
      histidine_mg: 72, isoleucine_mg: 120, leucine_mg: 210, lysine_mg: 160, methionine_mg: 45, cysteine_mg: 40,
      phenylalanine_mg: 140, tyrosine_mg: 95, threonine_mg: 130, tryptophan_mg: 38, valine_mg: 150, arginine_mg: 180,
      limitingAmino: "Methionine", pdcaasScorePct: 75,
      saturatedFat_g: 0.25, mufa_g: 0.65, pufa_g: 0.72, omega6_la_g: 0.42, omega3_ala_g: 0.28, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 195, iron_mg: 2.1, zinc_mg: 0.7, magnesium_mg: 32, potassium_mg: 320, sodium_mg: 42, phosphorus_mg: 58,
      copper_mg: 0.18, manganese_mg: 0.78, selenium_mcg: 1.5, iodine_mcg: 1.2,
      vitaminA_RAE_mcg: 380, betaCarotene_mcg: 4560, luteinZeaxanthin_mcg: 7200, vitaminC_mg: 42.0, vitaminD_mcg: 0, vitaminE_mg: 1.8,
      vitaminK_mcg: 440.0, vitaminB1_mg: 0.08, vitaminB2_mg: 0.14, vitaminB3_mg: 0.9, vitaminB6_mg: 0.24, folate_mcg: 135, vitaminB12_mcg: 0,
    },
  },
  {
    id: "kocho_fermented",
    nameEn: "Fermented Enset Flatbread (Kocho)",
    nameAmharic: "የተጋገረ ቆጮ",
    origin: "ethiopian",
    category: "vegetable",
    description: "Subterranean fermented enset (false banana) pseudo-stem dough, naturally gluten-free and alkaline.",
    culinaryRole: "Staple flatbread pairing with Kitfo, cabbage, and cottage cheese.",
    keyBenefits: ["Ultra-soothing for peptic gastritis & GERD", "Rich prebiotic lactic acid bacteria ferment", "High potassium & calcium"],
    defaultPortionGrams: 150,
    costPer100gETB: { economy: 16, standard: 22, premium: 30 },
    per100g: {
      energyKcal: 195, protein_g: 1.4, fat_g: 0.3, carb_g: 47.2, fiber_g: 5.8, moisture_g: 49.0, ash_g: 2.1,
      histidine_mg: 28, isoleucine_mg: 45, leucine_mg: 82, lysine_mg: 55, methionine_mg: 22, cysteine_mg: 18,
      phenylalanine_mg: 64, tyrosine_mg: 42, threonine_mg: 48, tryptophan_mg: 14, valine_mg: 62, arginine_mg: 58,
      limitingAmino: "Methionine", pdcaasScorePct: 52,
      saturatedFat_g: 0.08, mufa_g: 0.05, pufa_g: 0.12, omega6_la_g: 0.09, omega3_ala_g: 0.02, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 92, iron_mg: 3.2, zinc_mg: 1.4, magnesium_mg: 48, potassium_mg: 390, sodium_mg: 15, phosphorus_mg: 62,
      selenium_mcg: 1.8, vitaminA_RAE_mcg: 4, betaCarotene_mcg: 25, vitaminC_mg: 2.5, vitaminD_mcg: 0, vitaminE_mg: 0.2,
      vitaminB1_mg: 0.08, vitaminB2_mg: 0.06, vitaminB3_mg: 1.1, vitaminB6_mg: 0.16, folate_mcg: 24, vitaminB12_mcg: 0,
    },
  },
  {
    id: "bulla_enset_flour",
    nameEn: "Refined Enset Starch (Bulla / ቡላ)",
    nameAmharic: "የተጣራ የቡላ ዱቄት",
    origin: "ethiopian",
    category: "vegetable",
    description: "The premium dehydrated sediment from pressed enset juice, cooked into ultra-smooth therapeutic Genfo.",
    culinaryRole: "Whisked into silky restorative porridge with milk, butter, and berbere.",
    keyBenefits: ["Supreme gastric mucosal demulcent", "Rapid easily absorbed carbohydrate", "Gentle on inflamed bowels"],
    defaultPortionGrams: 80,
    costPer100gETB: { economy: 28, standard: 38, premium: 52 },
    per100g: {
      energyKcal: 355, protein_g: 1.2, fat_g: 0.2, carb_g: 86.5, fiber_g: 2.8, moisture_g: 9.8, ash_g: 1.5,
      histidine_mg: 22, isoleucine_mg: 38, leucine_mg: 65, lysine_mg: 42, methionine_mg: 18, cysteine_mg: 14,
      phenylalanine_mg: 52, tyrosine_mg: 34, threonine_mg: 38, tryptophan_mg: 11, valine_mg: 48, arginine_mg: 44,
      limitingAmino: "Methionine", pdcaasScorePct: 48,
      saturatedFat_g: 0.05, mufa_g: 0.03, pufa_g: 0.08, omega6_la_g: 0.06, omega3_ala_g: 0.01, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 68, iron_mg: 2.4, zinc_mg: 1.1, magnesium_mg: 35, potassium_mg: 290, sodium_mg: 12, phosphorus_mg: 45,
      selenium_mcg: 1.2, vitaminA_RAE_mcg: 2, betaCarotene_mcg: 14, vitaminC_mg: 1.8, vitaminD_mcg: 0, vitaminE_mg: 0.1,
      vitaminB1_mg: 0.06, vitaminB2_mg: 0.04, vitaminB3_mg: 0.8, vitaminB6_mg: 0.12, folate_mcg: 18, vitaminB12_mcg: 0,
    },
  },
  {
    id: "pumpkin_dubba_flesh",
    nameEn: "Highland Sweet Pumpkin (Dubba / ዱባ)",
    nameAmharic: "የበሰለ የዱባ ፍሬ ስጋ",
    origin: "ethiopian",
    category: "vegetable",
    description: "Vibrant orange highland squash simmered with berbere and garlic into luscious Dubba Wot.",
    culinaryRole: "Melt-in-your-mouth vegetable stew offering natural sweetness and moisture.",
    keyBenefits: ["Massive beta-carotene (provitamin A)", "Low caloric density with high satiety", "Rich in soluble pectin fiber"],
    defaultPortionGrams: 120,
    costPer100gETB: { economy: 10, standard: 14, premium: 20 },
    per100g: {
      energyKcal: 26, protein_g: 1.0, fat_g: 0.1, carb_g: 6.5, fiber_g: 1.1, moisture_g: 91.6, ash_g: 0.8,
      histidine_mg: 22, isoleucine_mg: 38, leucine_mg: 62, lysine_mg: 52, methionine_mg: 15, cysteine_mg: 12,
      phenylalanine_mg: 45, tyrosine_mg: 32, threonine_mg: 35, tryptophan_mg: 12, valine_mg: 45, arginine_mg: 48,
      limitingAmino: "Methionine", pdcaasScorePct: 65,
      saturatedFat_g: 0.03, mufa_g: 0.01, pufa_g: 0.04, omega6_la_g: 0.03, omega3_ala_g: 0.01, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 21, iron_mg: 0.8, zinc_mg: 0.3, magnesium_mg: 12, potassium_mg: 340, sodium_mg: 1, phosphorus_mg: 44,
      copper_mg: 0.09, manganese_mg: 0.12, selenium_mcg: 0.3, iodine_mcg: 0.5,
      vitaminA_RAE_mcg: 426, betaCarotene_mcg: 5110, luteinZeaxanthin_mcg: 1500, vitaminC_mg: 9.0, vitaminD_mcg: 0, vitaminE_mg: 1.06,
      vitaminK_mcg: 1.1, vitaminB1_mg: 0.05, vitaminB2_mg: 0.11, vitaminB3_mg: 0.6, vitaminB6_mg: 0.06, folate_mcg: 16, vitaminB12_mcg: 0,
    },
  },
  {
    id: "beetroot_key_sir",
    nameEn: "Highland Red Beetroot (Key Sir / ቀይ ስር)",
    nameAmharic: "ቀይ ስር ከአትክልት ጋር",
    origin: "ethiopian",
    category: "vegetable",
    description: "Deep crimson root vegetable simmered with potato and sweet onion, rich in dietary inorganic nitrate (NO3-).",
    culinaryRole: "Vibrant sweet crimson side dish balancing spicy berbere stews on Beyayinetu.",
    keyBenefits: ["Inorganic nitrates increase blood flow and lower blood pressure", "Betalain anti-inflammatory pigments", "Hepatic detox support"],
    defaultPortionGrams: 100,
    costPer100gETB: { economy: 10, standard: 15, premium: 22 },
    per100g: {
      energyKcal: 43, protein_g: 1.6, fat_g: 0.2, carb_g: 9.6, fiber_g: 2.8, moisture_g: 87.6, ash_g: 1.1,
      histidine_mg: 32, isoleucine_mg: 58, leucine_mg: 98, lysine_mg: 82, methionine_mg: 22, cysteine_mg: 18,
      phenylalanine_mg: 68, tyrosine_mg: 48, threonine_mg: 62, tryptophan_mg: 22, valine_mg: 72, arginine_mg: 64,
      limitingAmino: "Methionine", pdcaasScorePct: 62,
      saturatedFat_g: 0.03, mufa_g: 0.03, pufa_g: 0.06, omega6_la_g: 0.05, omega3_ala_g: 0.01, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 16, iron_mg: 0.8, zinc_mg: 0.4, magnesium_mg: 23, potassium_mg: 325, sodium_mg: 78, phosphorus_mg: 40,
      copper_mg: 0.08, manganese_mg: 0.33, selenium_mcg: 0.7, iodine_mcg: 1.5,
      vitaminA_RAE_mcg: 2, betaCarotene_mcg: 20, vitaminC_mg: 4.9, vitaminD_mcg: 0, vitaminE_mg: 0.04,
      vitaminK_mcg: 0.2, vitaminB1_mg: 0.03, vitaminB2_mg: 0.04, vitaminB3_mg: 0.3, vitaminB6_mg: 0.07, folate_mcg: 109, vitaminB12_mcg: 0,
    },
  },
  {
    id: "oromo_potato_anchote",
    nameEn: "Anchote Tuber (አንጮቴ)",
    nameAmharic: "አንጮቴ (የኦሮሞ ድንች)",
    origin: "ethiopian",
    category: "vegetable",
    description: "Western highland indigenous root tuber (Coccinia abyssinica) with astonishing calcium content (119mg) and rapid bone healing renown.",
    culinaryRole: "Boiled and mashed with butter, garlic, and wild herbs for recovery feasts.",
    keyBenefits: ["High calcium and protein for a root crop", "Traditional medicine for bone fracture healing", "Rich in saponins"],
    defaultPortionGrams: 100,
    costPer100gETB: { economy: 18, standard: 26, premium: 36 },
    per100g: {
      energyKcal: 98, protein_g: 3.2, fat_g: 0.4, carb_g: 21.5, fiber_g: 3.6, moisture_g: 74.0, ash_g: 1.8,
      histidine_mg: 62, isoleucine_mg: 110, leucine_mg: 185, lysine_mg: 145, methionine_mg: 38, cysteine_mg: 32,
      phenylalanine_mg: 125, tyrosine_mg: 82, threonine_mg: 115, tryptophan_mg: 35, valine_mg: 130, arginine_mg: 160,
      limitingAmino: "Methionine", pdcaasScorePct: 70,
      saturatedFat_g: 0.08, mufa_g: 0.06, pufa_g: 0.15, omega6_la_g: 0.12, omega3_ala_g: 0.02, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 119, iron_mg: 5.5, zinc_mg: 2.1, magnesium_mg: 72, potassium_mg: 450, sodium_mg: 22, phosphorus_mg: 88,
      selenium_mcg: 1.4, vitaminA_RAE_mcg: 5, betaCarotene_mcg: 35, vitaminC_mg: 18.5, vitaminD_mcg: 0, vitaminE_mg: 0.3,
      vitaminB1_mg: 0.12, vitaminB2_mg: 0.08, vitaminB3_mg: 1.4, vitaminB6_mg: 0.22, folate_mcg: 45, vitaminB12_mcg: 0,
    },
  },

  // ── 5. ANIMAL, POULTRY & MARINE PROTEINS (9) ────────────────────────────────
  {
    id: "lean_highland_beef",
    nameEn: "Pasture-Raised Highland Beef (Ye'bere Siga)",
    nameAmharic: "የደጋ በሬ ስጋ",
    origin: "ethiopian",
    category: "animal",
    description: "Finely minced fresh pasture-fed highland beef, rich in bioavailable heme iron, creatine, and carnosine.",
    culinaryRole: "Kitfo delicacy seasoned with mitmita and kibbeh, or simmered in Kay Siga Wot.",
    keyBenefits: ["Maximum biological value protein (PDCAAS 100%)", "Highest bioavailable heme iron for anemia", "High Zinc and Vitamin B12"],
    defaultPortionGrams: 120,
    costPer100gETB: { economy: 85, standard: 110, premium: 145 },
    per100g: {
      energyKcal: 172, protein_g: 22.8, fat_g: 8.5, carb_g: 0, fiber_g: 0, moisture_g: 68.0, ash_g: 1.1,
      histidine_mg: 780, isoleucine_mg: 1040, leucine_mg: 1820, lysine_mg: 1960, methionine_mg: 620, cysteine_mg: 290,
      phenylalanine_mg: 920, tyrosine_mg: 780, threonine_mg: 980, tryptophan_mg: 260, valine_mg: 1150, arginine_mg: 1520,
      glycine_mg: 1150, proline_mg: 920, glutamicAcid_mg: 3450, asparticAcid_mg: 2100, serine_mg: 880, alanine_mg: 1250,
      limitingAmino: "None (Complete)", pdcaasScorePct: 100,
      saturatedFat_g: 3.4, mufa_g: 3.8, pufa_g: 0.55, omega6_la_g: 0.38, omega3_ala_g: 0.12, omega3_epa_dha_g: 0.05,
      oleicAcid_g: 3.50, palmiticAcid_g: 2.10, stearicAcid_g: 1.15, cholesterol_mg: 65,
      calcium_mg: 16, iron_mg: 3.4, zinc_mg: 6.2, magnesium_mg: 24, potassium_mg: 340, sodium_mg: 68, phosphorus_mg: 215,
      copper_mg: 0.12, manganese_mg: 0.02, selenium_mcg: 26.5, iodine_mcg: 4.5,
      vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 0.2, vitaminE_mg: 0.4,
      vitaminK_mcg: 1.5, vitaminB1_mg: 0.08, vitaminB2_mg: 0.22, vitaminB3_mg: 5.4, vitaminB5_mg: 0.65, vitaminB6_mg: 0.48,
      vitaminB7_mcg: 2.5, folate_mcg: 12, vitaminB12_mcg: 2.8, choline_mg: 82.0,
    },
  },
  {
    id: "free_range_chicken_doro",
    nameEn: "Free-Range Country Chicken (Ye'habesha Doro)",
    nameAmharic: "የሀበሻ ዶሮ",
    origin: "ethiopian",
    category: "animal",
    description: "Slow-simmered slow-grown indigenous chicken in caramelized red onion and berbere reduction.",
    culinaryRole: "Celebrated centerpiece of Doro Wot festive banquets.",
    keyBenefits: ["Lean anabolic amino acid density", "High selenium and niacin", "Easily digestible"],
    defaultPortionGrams: 140,
    costPer100gETB: { economy: 95, standard: 130, premium: 170 },
    per100g: {
      energyKcal: 165, protein_g: 24.2, fat_g: 7.2, carb_g: 0, fiber_g: 0, moisture_g: 68.0, ash_g: 1.1,
      histidine_mg: 750, isoleucine_mg: 1120, leucine_mg: 1880, lysine_mg: 2050, methionine_mg: 640, cysteine_mg: 310,
      phenylalanine_mg: 950, tyrosine_mg: 810, threonine_mg: 1020, tryptophan_mg: 270, valine_mg: 1210, arginine_mg: 1620,
      limitingAmino: "None (Complete)", pdcaasScorePct: 100,
      saturatedFat_g: 2.1, mufa_g: 3.1, pufa_g: 1.6, omega6_la_g: 1.35, omega3_ala_g: 0.12, omega3_epa_dha_g: 0.06,
      cholesterol_mg: 72, calcium_mg: 14, iron_mg: 1.8, zinc_mg: 2.4, magnesium_mg: 28, potassium_mg: 310, sodium_mg: 74, phosphorus_mg: 220,
      selenium_mcg: 28.0, vitaminA_RAE_mcg: 18, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 0.3, vitaminE_mg: 0.5,
      vitaminB1_mg: 0.09, vitaminB2_mg: 0.18, vitaminB3_mg: 7.2, vitaminB6_mg: 0.55, folate_mcg: 14, vitaminB12_mcg: 0.85,
    },
  },
  {
    id: "country_farm_eggs",
    nameEn: "Country Farm Eggs (Inkulal / እንቁላል)",
    nameAmharic: "የሀበሻ ዶሮ እንቁላል",
    origin: "ethiopian",
    category: "animal",
    description: "Hard-boiled free-range whole eggs steeped in rich Doro Wot gravy, providing complete choline and carotenoids.",
    culinaryRole: "Steeped inside Doro Wot or scrambled with onions and jalapeños (Inkulal Firfir).",
    keyBenefits: ["Gold standard reference protein (Biological Value 100)", "High choline for brain and liver", "Lutein for eye health"],
    defaultPortionGrams: 60,
    costPer100gETB: { economy: 45, standard: 60, premium: 80 },
    per100g: {
      energyKcal: 143, protein_g: 12.6, fat_g: 9.5, carb_g: 0.7, fiber_g: 0, moisture_g: 76.0, ash_g: 1.0,
      histidine_mg: 310, isoleucine_mg: 670, leucine_mg: 1080, lysine_mg: 900, methionine_mg: 380, cysteine_mg: 270,
      phenylalanine_mg: 670, tyrosine_mg: 500, threonine_mg: 600, tryptophan_mg: 170, valine_mg: 760, arginine_mg: 780,
      limitingAmino: "None (Complete)", pdcaasScorePct: 100,
      saturatedFat_g: 3.1, mufa_g: 3.8, pufa_g: 1.9, omega6_la_g: 1.6, omega3_ala_g: 0.08, omega3_epa_dha_g: 0.15,
      cholesterol_mg: 372, calcium_mg: 56, iron_mg: 1.8, zinc_mg: 1.3, magnesium_mg: 12, potassium_mg: 138, sodium_mg: 142, phosphorus_mg: 198,
      selenium_mcg: 30.7, vitaminA_RAE_mcg: 160, betaCarotene_mcg: 15, luteinZeaxanthin_mcg: 503, vitaminC_mg: 0, vitaminD_mcg: 2.0, vitaminE_mg: 1.05,
      vitaminK_mcg: 0.3, vitaminB1_mg: 0.04, vitaminB2_mg: 0.45, vitaminB3_mg: 0.07, vitaminB5_mg: 1.53, vitaminB6_mg: 0.17,
      vitaminB7_mcg: 20.0, folate_mcg: 47, vitaminB12_mcg: 1.02, choline_mg: 294.0,
    },
  },
  {
    id: "wild_atlantic_salmon",
    nameEn: "Wild Cold-Water Salmon (የአትላንቲክ ሳልሞን ዓሣ)",
    nameAmharic: "ሳልሞን (ኦሜጋ-3 ዓሣ)",
    origin: "international",
    category: "animal",
    description: "Marine cold-water fatty fish containing world-class long-chain Omega-3 (EPA & DHA) and astaxanthin.",
    culinaryRole: "Pan-seared fillet infused with berbere or grilled on cedar wood.",
    keyBenefits: ["2.2g of EPA+DHA per serving for neurovascular and cardiovascular protection", "Complete biological protein", "High bioavailable Vitamin D3 and B12"],
    defaultPortionGrams: 140,
    costPer100gETB: { economy: 120, standard: 160, premium: 220 },
    per100g: {
      energyKcal: 208, protein_g: 22.5, fat_g: 12.8, carb_g: 0, fiber_g: 0, moisture_g: 64.0, ash_g: 1.2,
      histidine_mg: 680, isoleucine_mg: 1040, leucine_mg: 1820, lysine_mg: 2080, methionine_mg: 670, cysteine_mg: 240,
      phenylalanine_mg: 880, tyrosine_mg: 760, threonine_mg: 990, tryptophan_mg: 250, valine_mg: 1180, arginine_mg: 1350,
      limitingAmino: "None (Complete)", pdcaasScorePct: 100,
      saturatedFat_g: 2.1, mufa_g: 4.8, pufa_g: 4.9, omega6_la_g: 0.75, omega3_ala_g: 0.35, omega3_epa_dha_g: 3.65,
      oleicAcid_g: 4.20, palmiticAcid_g: 1.50, stearicAcid_g: 0.45, cholesterol_mg: 55,
      calcium_mg: 15, iron_mg: 0.8, zinc_mg: 0.9, magnesium_mg: 30, potassium_mg: 490, sodium_mg: 59, phosphorus_mg: 250,
      copper_mg: 0.09, manganese_mg: 0.04, selenium_mcg: 41.5, iodine_mcg: 28.0,
      vitaminA_RAE_mcg: 40, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 13.5, vitaminE_mg: 3.5,
      vitaminK_mcg: 0.8, vitaminB1_mg: 0.23, vitaminB2_mg: 0.38, vitaminB3_mg: 8.5, vitaminB5_mg: 1.70, vitaminB6_mg: 0.82,
      vitaminB7_mcg: 5.8, folate_mcg: 28, vitaminB12_mcg: 4.2, choline_mg: 85.0,
    },
  },
  {
    id: "lake_tilapia_fish",
    nameEn: "Fresh Lake Tilapia (Qurso Asa / ዓሣ)",
    nameAmharic: "የሐይቅ አሳ (ቁርሶ አሳ)",
    origin: "ethiopian",
    category: "animal",
    description: "Freshwater wild fish from Lake Tana or Lake Chamo, lean, white, and quickly digestible.",
    culinaryRole: "Crispy pan-fried fillet with lemon and berbere dip, or simmered in Asa Wot.",
    keyBenefits: ["Ultra-lean protein (under 2g fat)", "High selenium for thyroid deiodinase enzymes", "Zero carbohydrate"],
    defaultPortionGrams: 140,
    costPer100gETB: { economy: 65, standard: 90, premium: 125 },
    per100g: {
      energyKcal: 128, protein_g: 26.2, fat_g: 2.7, carb_g: 0, fiber_g: 0, moisture_g: 71.0, ash_g: 1.1,
      histidine_mg: 720, isoleucine_mg: 1180, leucine_mg: 2110, lysine_mg: 2380, methionine_mg: 750, cysteine_mg: 280,
      phenylalanine_mg: 1020, tyrosine_mg: 880, threonine_mg: 1120, tryptophan_mg: 290, valine_mg: 1320, arginine_mg: 1540,
      limitingAmino: "None (Complete)", pdcaasScorePct: 100,
      saturatedFat_g: 0.95, mufa_g: 0.98, pufa_g: 0.62, omega6_la_g: 0.32, omega3_ala_g: 0.05, omega3_epa_dha_g: 0.22,
      cholesterol_mg: 57, calcium_mg: 14, iron_mg: 0.6, zinc_mg: 0.4, magnesium_mg: 34, potassium_mg: 380, sodium_mg: 56, phosphorus_mg: 204,
      selenium_mcg: 54.4, vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 3.1, vitaminE_mg: 0.4,
      vitaminB1_mg: 0.04, vitaminB2_mg: 0.06, vitaminB3_mg: 3.9, vitaminB6_mg: 0.16, folate_mcg: 6, vitaminB12_mcg: 1.86,
    },
  },
  {
    id: "greek_yogurt_skyr",
    nameEn: "Strained High-Protein Skyr/Greek Yogurt (እርጎ)",
    nameAmharic: "የተጣራ እርጎ / ስካይር",
    origin: "international",
    category: "animal",
    description: "Triple-strained cultured dairy packed with bioactive casein and whey peptides, live probiotics, and calcium.",
    culinaryRole: "Cooling dip pairing with fiery wot, or base for post-workout protein bowls.",
    keyBenefits: ["Massive whey/casein protein ratio", "Live Lactobacillus bulgaricus gut cultures", "High bioavailable calcium"],
    defaultPortionGrams: 150,
    costPer100gETB: { economy: 30, standard: 45, premium: 65 },
    per100g: {
      energyKcal: 59, protein_g: 10.2, fat_g: 0.4, carb_g: 3.6, fiber_g: 0, moisture_g: 85.0, ash_g: 0.8,
      histidine_mg: 280, isoleucine_mg: 520, leucine_mg: 980, lysine_mg: 820, methionine_mg: 260, cysteine_mg: 120,
      phenylalanine_mg: 490, tyrosine_mg: 490, threonine_mg: 440, tryptophan_mg: 140, valine_mg: 650, arginine_mg: 360,
      limitingAmino: "None (Complete)", pdcaasScorePct: 100,
      saturatedFat_g: 0.12, mufa_g: 0.08, pufa_g: 0.02, omega6_la_g: 0.01, omega3_ala_g: 0.01, omega3_epa_dha_g: 0,
      cholesterol_mg: 5, calcium_mg: 110, iron_mg: 0.1, zinc_mg: 0.5, magnesium_mg: 11, potassium_mg: 141, sodium_mg: 36, phosphorus_mg: 135,
      selenium_mcg: 9.7, vitaminA_RAE_mcg: 2, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 0.1, vitaminE_mg: 0.05,
      vitaminB1_mg: 0.04, vitaminB2_mg: 0.28, vitaminB3_mg: 0.21, vitaminB6_mg: 0.06, folate_mcg: 7, vitaminB12_mcg: 0.75,
    },
  },

  // ── 6. FUNCTIONAL HERBS, SPICES & SUPERFOOD BOOSTERS (8) ───────────────────
  {
    id: "berbere_spice_blend",
    nameEn: "Authentic Sun-Dried Berbere (የበርበሬ ድብልቅ)",
    nameAmharic: "የበርበሬ ቅመም ድብልቅ",
    origin: "ethiopian",
    category: "spice_superfood",
    description: "Complex 16-spice blend including sun-dried red chili, korarima, rue, ginger, garlic, cloves, and cinnamon.",
    culinaryRole: "Primary chromatic and thermodynamic flavor catalyst for all traditional red wots.",
    keyBenefits: ["Capsaicin boosts resting metabolic rate and thermogenesis", "High carotenoids and vitamin A", "Anti-microbial preservative"],
    defaultPortionGrams: 20,
    costPer100gETB: { economy: 40, standard: 60, premium: 85 },
    per100g: {
      energyKcal: 318, protein_g: 12.0, fat_g: 14.5, carb_g: 52.0, fiber_g: 28.5, moisture_g: 8.5, ash_g: 7.2,
      histidine_mg: 280, isoleucine_mg: 460, leucine_mg: 820, lysine_mg: 590, methionine_mg: 190, cysteine_mg: 180,
      phenylalanine_mg: 540, tyrosine_mg: 380, threonine_mg: 480, tryptophan_mg: 140, valine_mg: 580, arginine_mg: 710,
      limitingAmino: "N/A (Spice)", pdcaasScorePct: 60,
      saturatedFat_g: 2.4, mufa_g: 2.8, pufa_g: 7.8, omega6_la_g: 7.2, omega3_ala_g: 0.45, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 330, iron_mg: 17.5, zinc_mg: 3.5, magnesium_mg: 155, potassium_mg: 1950, sodium_mg: 95, phosphorus_mg: 290,
      selenium_mcg: 8.5, vitaminA_RAE_mcg: 1450, betaCarotene_mcg: 17400, vitaminC_mg: 45.0, vitaminD_mcg: 0, vitaminE_mg: 28.5,
      vitaminB1_mg: 0.32, vitaminB2_mg: 0.95, vitaminB3_mg: 8.7, vitaminB6_mg: 2.45, folate_mcg: 105, vitaminB12_mcg: 0,
    },
  },
  {
    id: "nutritional_yeast_fortified",
    nameEn: "Bio-Fortified Nutritional Yeast (ኒውትሪሽናል ዪስት)",
    nameAmharic: "ኒውትሪሽናል ዪስት (ቢ-ኮምፕሌክስ)",
    origin: "international",
    category: "spice_superfood",
    description: "Deactivated primary yeast flakes with rich nutty-cheesy flavor, full B-complex spectrum and Vitamin B12.",
    culinaryRole: "Savory seasoning sprinkled over Shiro, Gomen, or ancient grain porridge.",
    keyBenefits: ["50% complete protein by weight", "Comprehensive Vitamin B12 source for plant-based eaters", "Beta-1,3/1,6-glucan immunity booster"],
    defaultPortionGrams: 15,
    costPer100gETB: { economy: 60, standard: 85, premium: 120 },
    per100g: {
      energyKcal: 380, protein_g: 48.0, fat_g: 4.5, carb_g: 38.0, fiber_g: 22.0, moisture_g: 5.0, ash_g: 6.5,
      histidine_mg: 1180, isoleucine_mg: 2350, leucine_mg: 3620, lysine_mg: 3510, methionine_mg: 820, cysteine_mg: 520,
      phenylalanine_mg: 2180, tyrosine_mg: 1650, threonine_mg: 2420, tryptophan_mg: 620, valine_mg: 2750, arginine_mg: 2480,
      limitingAmino: "Methionine", pdcaasScorePct: 92,
      saturatedFat_g: 0.8, mufa_g: 0.6, pufa_g: 2.8, omega6_la_g: 2.5, omega3_ala_g: 0.25, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 80, iron_mg: 5.2, zinc_mg: 8.5, magnesium_mg: 129, potassium_mg: 2200, sodium_mg: 120, phosphorus_mg: 1100,
      selenium_mcg: 95.0, vitaminA_RAE_mcg: 0, betaCarotene_mcg: 0, vitaminC_mg: 0, vitaminD_mcg: 0, vitaminE_mg: 0.4,
      vitaminB1_mg: 18.0, vitaminB2_mg: 15.0, vitaminB3_mg: 95.0, vitaminB6_mg: 12.0, folate_mcg: 1400, vitaminB12_mcg: 45.0,
    },
  },
  {
    id: "moringa_leaf_powder",
    nameEn: "Miracle Tree Moringa Leaf Powder (ሺፈራው)",
    nameAmharic: "የሺፈራው ቅጠል ዱቄት (ሞሪንጋ)",
    origin: "ethiopian",
    category: "spice_superfood",
    description: "Sun-dried pulverized southern Ethiopian moringa leaves (Moringa stenopetala), an astonishing micronutrient multivitamin.",
    culinaryRole: "Stirred into morning tonics, Shiro stew, or sprinkled over salad platters.",
    keyBenefits: ["30% complete protein", "Dense calcium (2,000mg/100g) and iron (28mg/100g)", "Potent isothiocyanates"],
    defaultPortionGrams: 10,
    costPer100gETB: { economy: 40, standard: 60, premium: 85 },
    per100g: {
      energyKcal: 320, protein_g: 29.4, fat_g: 5.2, carb_g: 38.2, fiber_g: 19.2, moisture_g: 7.2, ash_g: 10.5,
      histidine_mg: 620, isoleucine_mg: 1280, leucine_mg: 2150, lysine_mg: 1420, methionine_mg: 450, cysteine_mg: 410,
      phenylalanine_mg: 1580, tyrosine_mg: 980, threonine_mg: 1290, tryptophan_mg: 480, valine_mg: 1620, arginine_mg: 1780,
      limitingAmino: "Methionine", pdcaasScorePct: 82,
      saturatedFat_g: 1.2, mufa_g: 0.8, pufa_g: 2.8, omega6_la_g: 1.8, omega3_ala_g: 0.95, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 2003, iron_mg: 28.2, zinc_mg: 3.3, magnesium_mg: 368, potassium_mg: 1324, sodium_mg: 21, phosphorus_mg: 204,
      selenium_mcg: 8.5, vitaminA_RAE_mcg: 1630, betaCarotene_mcg: 19560, vitaminC_mg: 17.3, vitaminD_mcg: 0, vitaminE_mg: 113.0,
      vitaminB1_mg: 2.64, vitaminB2_mg: 20.5, vitaminB3_mg: 8.2, vitaminB6_mg: 1.24, folate_mcg: 40, vitaminB12_mcg: 0,
    },
  },
  {
    id: "fenugreek_powder_abish",
    nameEn: "Wild Fenugreek Seed Powder (Abish / አብሽ)",
    nameAmharic: "የአብሽ ዱቄት",
    origin: "ethiopian",
    category: "spice_superfood",
    description: "Cold-infused whipped fenugreek seeds, famous for 4-hydroxyisoleucine insulin sensitization and milk production.",
    culinaryRole: "Frothy whipped digestive drink (Abish Fitfit) or key spice in Shiro and Kibbeh.",
    keyBenefits: ["4-hydroxyisoleucine stimulates glucose-dependent insulin secretion", "Stimulates prolactin for breast milk flow", "Galactomannan soluble fiber blocks cholesterol"],
    defaultPortionGrams: 15,
    costPer100gETB: { economy: 20, standard: 30, premium: 42 },
    per100g: {
      energyKcal: 323, protein_g: 23.0, fat_g: 6.4, carb_g: 58.3, fiber_g: 24.6, moisture_g: 8.8, ash_g: 3.9,
      histidine_mg: 580, isoleucine_mg: 980, leucine_mg: 1650, lysine_mg: 1450, methionine_mg: 310, cysteine_mg: 290,
      phenylalanine_mg: 1020, tyrosine_mg: 710, threonine_mg: 880, tryptophan_mg: 280, valine_mg: 1040, arginine_mg: 2180,
      limitingAmino: "Methionine", pdcaasScorePct: 75,
      saturatedFat_g: 1.46, mufa_g: 2.20, pufa_g: 2.45, omega6_la_g: 1.95, omega3_ala_g: 0.45, omega3_epa_dha_g: 0,
      cholesterol_mg: 0, calcium_mg: 176, iron_mg: 33.5, zinc_mg: 2.5, magnesium_mg: 191, potassium_mg: 770, sodium_mg: 67, phosphorus_mg: 296,
      copper_mg: 1.11, manganese_mg: 1.23, selenium_mcg: 6.3, iodine_mcg: 1.8,
      vitaminA_RAE_mcg: 3, betaCarotene_mcg: 36, vitaminC_mg: 3.0, vitaminD_mcg: 0, vitaminE_mg: 1.2,
      vitaminB1_mg: 0.32, vitaminB2_mg: 0.36, vitaminB3_mg: 1.6, vitaminB6_mg: 0.60, folate_mcg: 57, vitaminB12_mcg: 0,
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH & CLINICAL ISSUES PRESETS
// ─────────────────────────────────────────────────────────────────────────────

export const FORMULATOR_HEALTH_ISSUES: FormulatorHealthIssue[] = [
  {
    id: "weight_loss_visceral",
    titleEn: "Weight Loss & Visceral Fat Depletion",
    titleAmharic: "የሰውነት ክብደት መቀነስ እና የሆድ ስብ ማቃጠል",
    category: "body_composition",
    description: "Formulated for deep calorie deficit, delayed gastric emptying, high soluble fiber, and maximum satiety per calorie.",
    clinicalRationale:
      "Teff resistant starch combined with legume beta-glucans and viscous flaxseed mucilage triggers prolonged peptide YY (PYY) and GLP-1 secretion, blunting spontaneous hunger while sparing fat-free mass.",
    culturalWisdom: "«ምግብ በጥበብ ሲበላ ፈውስ ነው፤ ያለልክ ሲበላ ደዌ ይሆናል።» (Food taken with wisdom is medicine; taken without measure it breeds ailment.)",
    recommendedTargets: {
      caloriesPerServing: 380,
      proteinPercent: 28,
      fatPercent: 22,
      carbPercent: 50,
      minFiber_g: 14,
    },
    recommendedIngredientIds: ["teff_flour_fermented", "red_lentils_misir", "ethiopian_collard_gomen", "flaxseed_telba", "roasted_barley_flour"],
    preferredEnzymeReaction: "ersho_phytase_96h",
  },
  {
    id: "muscle_hypertrophy",
    titleEn: "Lean Muscle Hypertrophy & Peak Athletics",
    titleAmharic: "የጡንቻ ግንባታ እና ከፍተኛ ስፖርታዊ ብቃት",
    category: "body_composition",
    description: "Optimized for myofibrillar protein synthesis, leucine threshold (>2.8g/serving), positive nitrogen retention, and rapid glycogen restocking.",
    clinicalRationale:
      "Exceeds the skeletal muscle leucine trigger threshold via complementary teff (sulfur amino acids) + shiro chickpea (lysine/arginine) + pasture beef/salmon, maximizing mTORC1 pathway activation.",
    culturalWisdom: "«የገብስ ኃይል ለጉልበት፣ የጤፍ ብርታት ለልብ።» (Barley grants strength to knees; teff fortifies the heart.)",
    recommendedTargets: {
      caloriesPerServing: 650,
      proteinPercent: 32,
      fatPercent: 24,
      carbPercent: 44,
      minFiber_g: 10,
    },
    recommendedIngredientIds: ["lean_highland_beef", "chickpea_shiro_flour", "teff_flour_fermented", "greek_yogurt_skyr", "roasted_barley_flour"],
    preferredEnzymeReaction: "sprouting_germination",
  },
  {
    id: "type2_diabetes_glycemic",
    titleEn: "Type-2 Diabetes & Glycemic Flattening",
    titleAmharic: "የስኳር በሽታ ቁጥጥር (ዝቅተኛ ግላይሴሚክ ማዕድ)",
    category: "metabolic",
    description: "Minimizes postprandial glucose surges, maximizes cellular insulin sensitivity, and provides abundant chromium and magnesium cofactors.",
    clinicalRationale:
      "Fermented teff amylose retrogradation plus faba bean and chia seed viscous gel decelerates alpha-glucosidase starch hydrolysis, flattening glucose excursions.",
    culturalWisdom: "«የአተርና የባቄላ እሸት ደም ያረጋጋል፤ ስኳርን ያበርዳል።» (Fresh pulses soothe the blood and cool the surge of sweetness.)",
    recommendedTargets: {
      caloriesPerServing: 420,
      proteinPercent: 25,
      fatPercent: 28,
      carbPercent: 47,
      minFiber_g: 16,
    },
    recommendedIngredientIds: ["teff_flour_fermented", "faba_beans_ful", "ethiopian_collard_gomen", "organic_chia_seeds", "hass_avocado"],
    preferredEnzymeReaction: "ersho_phytase_96h",
  },
  {
    id: "hypertension_cardio_dash",
    titleEn: "Hypertension, Heart Health & High K:Na Ratio",
    titleAmharic: "የደም ግፊት ቁጥጥር እና የልብ ጤንነት",
    category: "cardiovascular",
    description: "Engineered to deliver over 1,200mg potassium per meal, under 300mg sodium, with therapeutic marine and flax Omega-3s.",
    clinicalRationale:
      "A high potassium-to-sodium ratio (>4.0) stimulates vascular smooth muscle hyperpolarization and promotes renal natriuresis, lowering peripheral vascular resistance.",
    culturalWisdom: "«ነጭ ሽንኩርትና ጎመን የልብ ደም ስርን ያጠራል።» (Garlic and wild greens cleanse the arterial pathways of the heart.)",
    recommendedTargets: {
      caloriesPerServing: 450,
      proteinPercent: 22,
      fatPercent: 26,
      carbPercent: 52,
      minFiber_g: 12,
    },
    recommendedIngredientIds: ["wild_atlantic_salmon", "kocho_fermented", "ethiopian_collard_gomen", "flaxseed_telba", "roasted_barley_flour"],
    preferredEnzymeReaction: "ascorbic_acid_reduction",
  },
  {
    id: "iron_deficiency_anemia",
    titleEn: "Iron-Deficiency Anemia & Hemoglobin Restoration",
    titleAmharic: "የደም ማነስ (አኒሚያ) እና የሂሞግሎቢን ግንባታ",
    category: "vitality",
    description: "Maximal elemental and heme iron bio-accessibility by combining red teff, lentils, beef, and acidic fermentation to degrade phytates.",
    clinicalRationale:
      "Degrades inositol hexaphosphate (IP6) via Ersho phytase enzyme while ascorbic acid reduces ferric Fe3+ to soluble absorbable ferrous Fe2+ ions, multiplying iron uptake 3.5-fold.",
    culturalWisdom: "«ቀይ ጤፍና የበሬ ጉበት የደከመ ደምን ያድሳል።» (Red teff and lean meat renew exhausted blood.)",
    recommendedTargets: {
      caloriesPerServing: 520,
      proteinPercent: 26,
      fatPercent: 24,
      carbPercent: 50,
      minFiber_g: 11,
    },
    recommendedIngredientIds: ["teff_grain_red", "lean_highland_beef", "red_lentils_misir", "ethiopian_collard_gomen", "nutritional_yeast_fortified"],
    preferredEnzymeReaction: "ersho_phytase_96h",
  },
  {
    id: "gastritis_mucosal_healing",
    titleEn: "Gastritis, Acid Reflux & Mucosal Protection",
    titleAmharic: "የጨጓራ ህመም እና የአንጀት ቁስለት ፈውስ",
    category: "digestive",
    description: "Zero-irritation, non-spicy, soothing mucilaginous matrix featuring fermented enset (Kocho) and flaxseed gel.",
    clinicalRationale:
      "Enset starch and flax mucopolysaccharides form an alkaline protective colloidal film over the gastric mucosa, buffering excess hydrochloric acid without synthetic PPIs.",
    culturalWisdom: "«ቆጮና ቴልባ የተቃጠለ ጨጓራን ያበርዳል፤ እንደ አሸዋ የቆሰለውን ያክማል።» (Kocho and Telba cool a flaming stomach and soothe ulcerations.)",
    recommendedTargets: {
      caloriesPerServing: 430,
      proteinPercent: 16,
      fatPercent: 22,
      carbPercent: 62,
      minFiber_g: 10,
    },
    recommendedIngredientIds: ["kocho_fermented", "bulla_enset_flour", "flaxseed_telba", "greek_yogurt_skyr", "hass_avocado"],
    preferredEnzymeReaction: "thermal_trypsin_inactivation",
  },
  {
    id: "postpartum_lactation",
    titleEn: "Postpartum Recovery, Lactation & Replenishment",
    titleAmharic: "የወሊድ ማገገሚያ እና የእናት ጡት ወተት ማበልጸጊያ",
    category: "vitality",
    description: "Calorie-dense, micronutrient-loaded restorative porridge and stew formula rich in galactagogues (fenugreek, flax), calcium, and iron.",
    clinicalRationale:
      "Stimulates prolactin secretion via fenugreek phytoestrogens and oat/barley saponins while supplying dense calcium, iodine, and maternal choline.",
    culturalWisdom: "«አራስ በገንፎና በቅቤ ትበረታለች፤ ወተቷም ይፈላል።» (The nursing mother gains fortitude from rich genfo and spiced butter; her milk flows abundantly.)",
    recommendedTargets: {
      caloriesPerServing: 620,
      proteinPercent: 20,
      fatPercent: 32,
      carbPercent: 48,
      minFiber_g: 9,
    },
    recommendedIngredientIds: ["roasted_barley_flour", "spiced_clarified_butter_kibbeh", "chickpea_shiro_flour", "fenugreek_powder_abish", "free_range_chicken_doro"],
    preferredEnzymeReaction: "sprouting_germination",
  },
  {
    id: "longevity_anti_inflammatory",
    titleEn: "Blue-Zone Longevity & Cellular Anti-Aging",
    titleAmharic: "ረጅም ዕድሜ እና የሴል እብጠት መከላከያ",
    category: "vitality",
    description: "Integrates polyphenols, anthocyanins, sulforaphane, marine Omega-3s, and ferment prebiotics to suppress systemic NF-kB inflammation.",
    clinicalRationale:
      "Synergizes dark brassica polyphenols, marine EPA/DHA, and fermented fiber short-chain fatty acids (acetate, propionate, butyrate) to activate AMPK and sirtuin longevity pathways.",
    culturalWisdom: "«ቀለል ያለ ማዕድ፣ የተብላላ እህልና የደጋ አትክልት እድሜን ያረዝማል።» (A modest platter of fermented grains and highland greens elongates life.)",
    recommendedTargets: {
      caloriesPerServing: 480,
      proteinPercent: 24,
      fatPercent: 26,
      carbPercent: 50,
      minFiber_g: 15,
    },
    recommendedIngredientIds: ["wild_atlantic_salmon", "organic_quinoa_tri_color", "ethiopian_collard_gomen", "organic_chia_seeds", "hass_avocado"],
    preferredEnzymeReaction: "ersho_phytase_96h",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RANDOM DIET CODE & TITLE GENERATOR (INTERNATIONAL & ETHIOPIAN HYBRID)
// ─────────────────────────────────────────────────────────────────────────────

const DIET_PREFIXES = ["ETH", "GLO", "NOV", "ZEA", "MED", "PAN", "APX", "SOL"];
const DIET_PURPOSE_CODES: Record<string, string> = {
  weight_loss_visceral: "FAT",
  muscle_hypertrophy: "PRO",
  type2_diabetes_glycemic: "GLY",
  hypertension_cardio_dash: "CAR",
  iron_deficiency_anemia: "HEM",
  gastritis_mucosal_healing: "MUC",
  postpartum_lactation: "LAC",
  longevity_anti_inflammatory: "LON",
};

const RANDOM_NAME_ADJECTIVES = [
  "Highland Bio-Active",
  "Zenith Adaptive",
  "NovaVital Balanced",
  "Apex Therapeutic",
  "Nordic-Highland Hybrid",
  "Mediterranean-Teff Supreme",
  "Regenerative Cell-Shield",
  "Solaris Metabolic",
  "Ancient-Modern Fusion",
];

const RANDOM_NAME_NOUNS: Record<PlatterType, string[]> = {
  multi_dish_platter: ["Ceremonial Beyayinetu Mesob", "Grand Mesob Feast", "Macro-Balance Platter", "Synergy Banquet"],
  stew_flatbread: ["Claypot Wot & Rolled Injera", "Artisan Flatbread Platter", "Simmered Stew Platter"],
  ancient_grain_bowl: ["Ancestral Genfo Bowl", "Genfo & Seed Porridge", "Beso Vitality Bowl"],
  functional_tonic: ["Elixir Tonic & Mucilage Infusion", "High-Performance Liquid Meal", "Cellular Shake"],
  firfir_shredded_skillet: ["Cast-Iron Firfir Skillet", "Sautéed Injera Firfir Feast", "Spiced Gravy Firfir Platter"],
  chilled_deli_platter: ["Chilled Azifa Deli Platter", "Summer Fitfit & Lentil Platter", "Cold Herbaceous Deli Bowl"],
  sizzling_tibs_skillet: ["Sizzling Braised Tibs Skillet", "Cast-Iron Rosemary Skillet", "Flash-Seared Gourmet Skillet"],
  artisan_flatbread_pocket: ["Ancient-Grain Pocket Wrap", "Artisan Teff Pocket", "Folded Flatbread Delicacy"],
};

export function generateRandomDietCode(healthIssueId: string, platterType: PlatterType = "multi_dish_platter"): {
  code: string;
  nameEn: string;
  nameAmharic: string;
} {
  const prefix = DIET_PREFIXES[Math.floor(Math.random() * DIET_PREFIXES.length)];
  const purposeCode = DIET_PURPOSE_CODES[healthIssueId] || "NUT";
  const num = Math.floor(100 + Math.random() * 900);
  const code = `${prefix}-${purposeCode}-${num}`;

  const adj = RANDOM_NAME_ADJECTIVES[Math.floor(Math.random() * RANDOM_NAME_ADJECTIVES.length)];
  const nouns = RANDOM_NAME_NOUNS[platterType] ?? RANDOM_NAME_NOUNS.multi_dish_platter;
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const nameEn = `${adj} ${noun}`;

  const nameAmharic = `ተለዋዋጭ ልዩ ማዕድ (${code})`;

  return { code, nameEn, nameAmharic };
}

// ─────────────────────────────────────────────────────────────────────────────
// CATALOG MATCHING ALGORITHM (RANKS 100-DISH CATALOG AGAINST TARGETS)
// ─────────────────────────────────────────────────────────────────────────────

export function findMatchingCatalogDishes(
  targetCalories: number,
  targetProtein_g: number,
  targetFat_g: number,
  targetCarb_g: number,
  targetFiber_g: number,
  selectedIngredientIds: string[],
  healthIssueId: string,
  limit: number = 3
): CatalogMatchResult[] {
  const catalog = ETHIOPIAN_COMPOSITE_DIETS_CATALOG;

  const scoredDishes = catalog.map((dish) => {
    const p = dish.nutrients.proximate;

    // Relative difference penalty for macronutrients
    const calDeltaPct = Math.abs(p.energyKcal - targetCalories) / Math.max(targetCalories, 100);
    const protDeltaPct = Math.abs(p.protein_g - targetProtein_g) / Math.max(targetProtein_g, 10);
    const fatDeltaPct = Math.abs(p.fat_g - targetFat_g) / Math.max(targetFat_g, 5);
    const carbDeltaPct = Math.abs(p.carbohydrate_g - targetCarb_g) / Math.max(targetCarb_g, 20);

    const proximateCloseness = Math.max(0, 1 - (calDeltaPct * 0.3 + protDeltaPct * 0.3 + fatDeltaPct * 0.2 + carbDeltaPct * 0.2));

    // Ingredient overlap bonus
    let ingredientOverlapCount = 0;
    const dishIngredientTexts = dish.ingredients.map((i) => (i.id + " " + i.nameEn + " " + i.nameAmharic).toLowerCase());
    for (const selId of selectedIngredientIds) {
      const cleanId = selId.replace(/_/g, " ").toLowerCase();
      if (dishIngredientTexts.some((txt) => txt.includes(cleanId) || cleanId.includes(txt))) {
        ingredientOverlapCount++;
      }
    }
    const ingredientMatchRatio = selectedIngredientIds.length > 0
      ? Math.min(1.0, ingredientOverlapCount / selectedIngredientIds.length)
      : 0.5;

    // Health issue suitability bonus
    let healthBonus = 0;
    if (healthIssueId === "type2_diabetes_glycemic" && p.dietaryFiber_g > 12 && p.protein_g > 18) healthBonus += 0.15;
    if (healthIssueId === "weight_loss_visceral" && p.energyKcal < 550 && p.dietaryFiber_g > 10) healthBonus += 0.15;
    if (healthIssueId === "muscle_hypertrophy" && p.protein_g > 25) healthBonus += 0.15;
    if (healthIssueId === "iron_deficiency_anemia" && dish.nutrients.minerals.iron_mg > 8) healthBonus += 0.15;
    if (healthIssueId === "gastritis_mucosal_healing" && (dish.category === "traditional_beef_enset" || dish.nameEn.toLowerCase().includes("kocho") || dish.nameEn.toLowerCase().includes("bulla"))) healthBonus += 0.2;

    const rawScore = (proximateCloseness * 0.55 + ingredientMatchRatio * 0.3 + healthBonus * 0.15) * 100;
    const matchScorePct = Math.min(99, Math.max(45, Math.round(rawScore)));

    const matchReasons: string[] = [];
    if (Math.abs(p.energyKcal - targetCalories) < 80) matchReasons.push(`Caloric proximity (${p.energyKcal} kcal vs ${Math.round(targetCalories)} target)`);
    if (Math.abs(p.protein_g - targetProtein_g) < 5) matchReasons.push(`Optimal protein match (${p.protein_g}g vs ${Math.round(targetProtein_g)}g)`);
    if (p.dietaryFiber_g >= targetFiber_g) matchReasons.push(`Robust dietary fiber (${p.dietaryFiber_g}g meets target ${Math.round(targetFiber_g)}g)`);
    if (ingredientOverlapCount > 0) matchReasons.push(`Contains ${ingredientOverlapCount} of your chosen ingredients`);
    if (healthBonus > 0) matchReasons.push(`Clinically aligned with ${healthIssueId.replace(/_/g, " ")}`);
    if (matchReasons.length === 0) matchReasons.push("Closest regional composite profile in Ethiopian catalog");

    const proximateComparison = [
      { metric: "Calories", targetValue: Math.round(targetCalories), dishValue: p.energyKcal, unit: "kcal" },
      { metric: "Protein", targetValue: Math.round(targetProtein_g * 10) / 10, dishValue: p.protein_g, unit: "g" },
      { metric: "Fat", targetValue: Math.round(targetFat_g * 10) / 10, dishValue: p.fat_g, unit: "g" },
      { metric: "Carbs", targetValue: Math.round(targetCarb_g * 10) / 10, dishValue: p.carbohydrate_g, unit: "g" },
      { metric: "Fiber", targetValue: Math.round(targetFiber_g * 10) / 10, dishValue: p.dietaryFiber_g, unit: "g" },
    ];

    return {
      dish,
      matchScorePct,
      matchReasons,
      proximateComparison,
    };
  });

  scoredDishes.sort((a, b) => b.matchScorePct - a.matchScorePct);
  return scoredDishes.slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC SYNTHESIS FORMULATOR (CALCULATES CUSTOM DISH / PLATTER)
// ─────────────────────────────────────────────────────────────────────────────

export function formulateDynamicPlatter(input: DynamicFormulatorInput): DynamicFormulationResult {
  const healthIssue = FORMULATOR_HEALTH_ISSUES.find((h) => h.id === input.healthIssueId) ?? FORMULATOR_HEALTH_ISSUES[0];

  // Resolve target macronutrients (energy split)
  const targetKcal = input.targetCaloriesPerServing > 0 ? input.targetCaloriesPerServing : healthIssue.recommendedTargets.caloriesPerServing;
  const protPct = input.proteinPercent > 0 ? input.proteinPercent : healthIssue.recommendedTargets.proteinPercent;
  const fatPct = input.fatPercent > 0 ? input.fatPercent : healthIssue.recommendedTargets.fatPercent;
  const carbPct = input.carbPercent > 0 ? input.carbPercent : healthIssue.recommendedTargets.carbPercent;
  const minFiber_g = input.minFiber_g > 0 ? input.minFiber_g : healthIssue.recommendedTargets.minFiber_g;

  // Convert percentages to target grams per serving
  const targetProteinGrams = (targetKcal * (protPct / 100)) / 4;
  const targetFatGrams = (targetKcal * (fatPct / 100)) / 9;
  const targetCarbGrams = (targetKcal * (carbPct / 100)) / 4;

  // Resolve selected ingredients (fallback to issue recommendations if empty)
  const activeIngredientIds = input.selectedIngredientIds && input.selectedIngredientIds.length > 0
    ? input.selectedIngredientIds
    : healthIssue.recommendedIngredientIds;

  const resolvedIngredients = activeIngredientIds
    .map((id) => FORMULATOR_INGREDIENTS.find((ing) => ing.id === id))
    .filter((ing): ing is FormulatorIngredient => Boolean(ing));

  // Determine if international ingredients are included
  const hasInternational = resolvedIngredients.some((ing) => ing.origin === "international");

  // Generate diet code and name if not supplied
  const codeInfo = input.dietCode && input.customDietName
    ? { code: input.dietCode, nameEn: input.customDietName, nameAmharic: input.customDietName }
    : generateRandomDietCode(healthIssue.id, input.platterType);

  const dietCode = input.dietCode || codeInfo.code;
  const dietName = input.customDietName || codeInfo.nameEn;
  const dietNameAmharic = codeInfo.nameAmharic;

  // ── INGREDIENT PORTION OPTIMIZATION ─────────────────────────────────────────
  const baseWeightMap: Record<string, number> = {};

  // Group ingredients by primary nutritional role
  const proteinHeavy = resolvedIngredients.filter((ing) => ing.per100g.protein_g >= 18);
  const lipidHeavy = resolvedIngredients.filter((ing) => ing.per100g.fat_g >= 15);
  const carbHeavy = resolvedIngredients.filter((ing) => ing.per100g.carb_g >= 25 && ing.per100g.fat_g < 15);

  // Initial portion assignments
  resolvedIngredients.forEach((ing) => {
    baseWeightMap[ing.id] = ing.defaultPortionGrams;
  });

  // Calculate current sum
  const computeCurrentTotals = () => {
    let kcal = 0, prot = 0, fat = 0, carb = 0;
    resolvedIngredients.forEach((ing) => {
      const g = baseWeightMap[ing.id];
      const factor = g / 100;
      kcal += ing.per100g.energyKcal * factor;
      prot += ing.per100g.protein_g * factor;
      fat += ing.per100g.fat_g * factor;
      carb += ing.per100g.carb_g * factor;
    });
    return { kcal, prot, fat, carb };
  };

  let totals = computeCurrentTotals();

  // Iteratively scale groups to approach targets
  if (proteinHeavy.length > 0 && totals.prot > 0) {
    const protScale = Math.min(2.5, Math.max(0.4, targetProteinGrams / totals.prot));
    proteinHeavy.forEach((ing) => {
      baseWeightMap[ing.id] = Math.round(baseWeightMap[ing.id] * protScale);
    });
  }

  totals = computeCurrentTotals();
  if (lipidHeavy.length > 0 && totals.fat > 0) {
    const fatScale = Math.min(2.2, Math.max(0.3, targetFatGrams / totals.fat));
    lipidHeavy.forEach((ing) => {
      baseWeightMap[ing.id] = Math.round(baseWeightMap[ing.id] * fatScale);
    });
  }

  totals = computeCurrentTotals();
  if (carbHeavy.length > 0 && totals.carb > 0) {
    const carbScale = Math.min(2.5, Math.max(0.4, targetCarbGrams / totals.carb));
    carbHeavy.forEach((ing) => {
      baseWeightMap[ing.id] = Math.round(baseWeightMap[ing.id] * carbScale);
    });
  }

  // Global fine-tuning scale towards target calories
  totals = computeCurrentTotals();
  if (totals.kcal > 0) {
    const globalScale = Math.min(1.5, Math.max(0.7, targetKcal / totals.kcal));
    resolvedIngredients.forEach((ing) => {
      baseWeightMap[ing.id] = Math.max(10, Math.round(baseWeightMap[ing.id] * globalScale));
    });
  }

  const servingsPerDay = input.servingsPerDay > 0 ? input.servingsPerDay : 3.0;
  const daysPerMonth = 30;

  // Build synthesized recipe items
  let totalServingGrams = 0;
  let totalCostPerServingETB = 0;

  const recipeItems: SynthesizedRecipeItem[] = resolvedIngredients.map((ing) => {
    const gramsPerServing = baseWeightMap[ing.id];
    totalServingGrams += gramsPerServing;

    const gramsPerDay = Math.round(gramsPerServing * servingsPerDay);
    const gramsPerMonth = Math.round(gramsPerDay * daysPerMonth);

    const costPer100g = ing.costPer100gETB[input.economicTier] ?? ing.costPer100gETB.standard;
    const costPerServing = (gramsPerServing / 100) * costPer100g;
    totalCostPerServingETB += costPerServing;

    const costETBPerMonth = Math.round((gramsPerMonth / 100) * costPer100g);

    return {
      ingredient: ing,
      gramsPerServing,
      gramsPerDay,
      gramsPerMonth,
      costETBPerMonth,
      culinaryRole: ing.culinaryRole,
      contributionPct: 0,
    };
  });

  recipeItems.forEach((item) => {
    item.contributionPct = Math.round((item.gramsPerServing / Math.max(1, totalServingGrams)) * 100);
  });

  const totalCostPerDayETB = Math.round(totalCostPerServingETB * servingsPerDay);
  const totalCostPerMonthETB = Math.round(totalCostPerDayETB * daysPerMonth);

  // ── BIOCHEMICAL & ENZYME COFACTOR MULTIPLIERS ──────────────────────────────
  let phytaseFeMult = 1.0;
  let phytaseZnMult = 1.0;
  let phytaseCaMult = 1.0;
  let proteinBioavailability = 1.0;
  let lysineBoost = 1.0;
  let bVitBoost = 1.0;
  let vitCBoost = 1.0;

  switch (input.enzymeReaction) {
    case "ersho_phytase_96h":
      phytaseFeMult = 2.4;
      phytaseZnMult = 1.85;
      phytaseCaMult = 1.35;
      proteinBioavailability = 1.12;
      bVitBoost = 1.25;
      break;
    case "sprouting_germination":
      phytaseFeMult = 2.1;
      phytaseZnMult = 1.7;
      proteinBioavailability = 1.18;
      lysineBoost = 1.22;
      bVitBoost = 1.35;
      break;
    case "ascorbic_acid_reduction":
      phytaseFeMult = 2.8;
      vitCBoost = 1.4;
      break;
    case "thermal_trypsin_inactivation":
      proteinBioavailability = 1.15;
      break;
    default:
      break;
  }

  // ── NUTRIENT AGGREGATION PER SERVING (WET WEIGHT BASIS) ─────────────────────
  let totalMoistureGrams = 0;
  let totalAshGrams = 0;

  const proximate: DietProximate = {
    energyKcal: 0,
    protein_g: 0,
    fat_g: 0,
    carbohydrate_g: 0,
    dietaryFiber_g: 0,
    moisture_g: 0,
    ash_g: 0,
  };

  const aminoAcids: DietAminoAcids = {
    histidine_mg: 0,
    isoleucine_mg: 0,
    leucine_mg: 0,
    lysine_mg: 0,
    methionine_mg: 0,
    cysteine_mg: 0,
    phenylalanine_mg: 0,
    tyrosine_mg: 0,
    threonine_mg: 0,
    tryptophan_mg: 0,
    valine_mg: 0,
    arginine_mg: 0,
    totalEAA_mg: 0,
    limitingAmino: "None",
    aminoAcidScorePct: 90,
    pdcaasEquivalentPct: 85,
  };

  const fattyAcids: DietFattyAcids = {
    totalSaturated_g: 0,
    totalMUFA_g: 0,
    totalPUFA_g: 0,
    omega6_linoleic_g: 0,
    omega3_ALA_g: 0,
    omega3_EPA_DHA_g: 0,
    omega3ToOmega6Ratio: "1:4.0",
    cholesterol_mg: 0,
  };

  const minerals: DietMinerals = {
    calcium_mg: 0,
    iron_mg: 0,
    bioavailableIron_mg: 0,
    zinc_mg: 0,
    bioavailableZinc_mg: 0,
    magnesium_mg: 0,
    potassium_mg: 0,
    sodium_mg: 0,
    phosphorus_mg: 0,
    copper_mg: 0,
    selenium_mcg: 0,
    manganese_mg: 0,
  };

  const vitamins: DietVitamins = {
    vitaminA_RAE_mcg: 0,
    betaCarotene_mcg: 0,
    vitaminC_mg: 0,
    vitaminD_mcg: 0,
    vitaminE_mg: 0,
    vitaminB1_mg: 0,
    vitaminB2_mg: 0,
    vitaminB3_mg: 0,
    vitaminB6_mg: 0,
    vitaminB9_folate_mcg: 0,
    vitaminB12_mcg: 0,
  };

  // Additional extended nutrients
  let totalGlycine_mg = 0;
  let totalProline_mg = 0;
  let totalGlutamicAcid_mg = 0;
  let totalAsparticAcid_mg = 0;
  let totalSerine_mg = 0;
  let totalAlanine_mg = 0;

  let totalPalmitic_g = 0;
  let totalStearic_g = 0;
  let totalOleic_g = 0;
  let totalARA_g = 0;
  let totalEPA_g = 0;
  let totalDHA_g = 0;

  let totalIodine_mcg = 0;
  let totalLutein_mcg = 0;
  let totalVitK_mcg = 0;
  let totalVitB5_mg = 0;
  let totalVitB7_mcg = 0;
  let totalCholine_mg = 0;

  recipeItems.forEach(({ ingredient, gramsPerServing }) => {
    const f = gramsPerServing / 100;
    const p = ingredient.per100g;

    proximate.energyKcal += p.energyKcal * f;
    proximate.protein_g += p.protein_g * f;
    proximate.fat_g += p.fat_g * f;
    proximate.carbohydrate_g += p.carb_g * f;
    proximate.dietaryFiber_g += p.fiber_g * f;
    proximate.moisture_g += p.moisture_g * f;
    proximate.ash_g += p.ash_g * f;

    totalMoistureGrams += p.moisture_g * f;
    totalAshGrams += p.ash_g * f;

    aminoAcids.histidine_mg += p.histidine_mg * f;
    aminoAcids.isoleucine_mg += p.isoleucine_mg * f;
    aminoAcids.leucine_mg += p.leucine_mg * f;
    aminoAcids.lysine_mg += p.lysine_mg * f * lysineBoost;
    aminoAcids.methionine_mg += p.methionine_mg * f;
    aminoAcids.cysteine_mg += p.cysteine_mg * f;
    aminoAcids.phenylalanine_mg += p.phenylalanine_mg * f;
    aminoAcids.tyrosine_mg += p.tyrosine_mg * f;
    aminoAcids.threonine_mg += p.threonine_mg * f;
    aminoAcids.tryptophan_mg += p.tryptophan_mg * f;
    aminoAcids.valine_mg += p.valine_mg * f;
    aminoAcids.arginine_mg += p.arginine_mg * f;

    totalGlycine_mg += (p.glycine_mg ?? p.arginine_mg * 0.7) * f;
    totalProline_mg += (p.proline_mg ?? p.leucine_mg * 0.6) * f;
    totalGlutamicAcid_mg += (p.glutamicAcid_mg ?? p.protein_g * 180) * f;
    totalAsparticAcid_mg += (p.asparticAcid_mg ?? p.protein_g * 90) * f;
    totalSerine_mg += (p.serine_mg ?? p.threonine_mg * 1.1) * f;
    totalAlanine_mg += (p.alanine_mg ?? p.valine_mg * 0.9) * f;

    fattyAcids.totalSaturated_g += p.saturatedFat_g * f;
    fattyAcids.totalMUFA_g += p.mufa_g * f;
    fattyAcids.totalPUFA_g += p.pufa_g * f;
    fattyAcids.omega6_linoleic_g += p.omega6_la_g * f;
    fattyAcids.omega3_ALA_g += p.omega3_ala_g * f;
    fattyAcids.omega3_EPA_DHA_g += p.omega3_epa_dha_g * f;
    fattyAcids.cholesterol_mg += p.cholesterol_mg * f;

    totalOleic_g += (p.oleicAcid_g ?? p.mufa_g * 0.9) * f;
    totalPalmitic_g += (p.palmiticAcid_g ?? p.saturatedFat_g * 0.6) * f;
    totalStearic_g += (p.stearicAcid_g ?? p.saturatedFat_g * 0.3) * f;
    totalEPA_g += (p.omega3_epa_dha_g * 0.55) * f;
    totalDHA_g += (p.omega3_epa_dha_g * 0.45) * f;
    totalARA_g += (p.omega6_la_g * 0.05) * f;

    minerals.calcium_mg += p.calcium_mg * f * phytaseCaMult;
    minerals.iron_mg += p.iron_mg * f;
    minerals.zinc_mg += p.zinc_mg * f;
    minerals.magnesium_mg += p.magnesium_mg * f;
    minerals.potassium_mg += p.potassium_mg * f;
    minerals.sodium_mg += p.sodium_mg * f;
    minerals.phosphorus_mg += p.phosphorus_mg * f;
    minerals.selenium_mcg += p.selenium_mcg * f;
    minerals.copper_mg += (p.copper_mg ?? 0.25) * f;
    minerals.manganese_mg += (p.manganese_mg ?? 0.6) * f;
    totalIodine_mcg += (p.iodine_mcg ?? 2.5) * f;

    vitamins.vitaminA_RAE_mcg += p.vitaminA_RAE_mcg * f;
    vitamins.betaCarotene_mcg += p.betaCarotene_mcg * f;
    vitamins.vitaminC_mg += p.vitaminC_mg * f * vitCBoost;
    vitamins.vitaminD_mcg += p.vitaminD_mcg * f;
    vitamins.vitaminE_mg += p.vitaminE_mg * f;
    vitamins.vitaminB1_mg += p.vitaminB1_mg * f * bVitBoost;
    vitamins.vitaminB2_mg += p.vitaminB2_mg * f * bVitBoost;
    vitamins.vitaminB3_mg += p.vitaminB3_mg * f;
    vitamins.vitaminB6_mg += p.vitaminB6_mg * f;
    vitamins.vitaminB9_folate_mcg += p.folate_mcg * f * bVitBoost;
    vitamins.vitaminB12_mcg += p.vitaminB12_mcg * f;

    totalLutein_mcg += (p.luteinZeaxanthin_mcg ?? p.betaCarotene_mcg * 0.3) * f;
    totalVitK_mcg += (p.vitaminK_mcg ?? 5.0) * f;
    totalVitB5_mg += (p.vitaminB5_mg ?? 0.6) * f;
    totalVitB7_mcg += (p.vitaminB7_mcg ?? 4.0) * f;
    totalCholine_mg += (p.choline_mg ?? 25.0) * f;
  });

  // Calculate bioavailable minerals with enzyme boost
  const baseBioavailableFeRatio = 0.08 * phytaseFeMult;
  minerals.bioavailableIron_mg = Math.round(minerals.iron_mg * baseBioavailableFeRatio * 10) / 10;

  const baseBioavailableZnRatio = 0.15 * phytaseZnMult;
  minerals.bioavailableZinc_mg = Math.round(minerals.zinc_mg * baseBioavailableZnRatio * 10) / 10;

  // Round values
  proximate.energyKcal = Math.round(proximate.energyKcal);
  proximate.protein_g = Math.round(proximate.protein_g * 10) / 10;
  proximate.fat_g = Math.round(proximate.fat_g * 10) / 10;
  proximate.carbohydrate_g = Math.round(proximate.carbohydrate_g * 10) / 10;
  proximate.dietaryFiber_g = Math.round(proximate.dietaryFiber_g * 10) / 10;
  proximate.moisture_g = Math.round(totalMoistureGrams);
  proximate.ash_g = Math.round(totalAshGrams * 10) / 10;

  aminoAcids.totalEAA_mg = Math.round(
    aminoAcids.histidine_mg + aminoAcids.isoleucine_mg + aminoAcids.leucine_mg +
    aminoAcids.lysine_mg + aminoAcids.methionine_mg + aminoAcids.cysteine_mg +
    aminoAcids.phenylalanine_mg + aminoAcids.tyrosine_mg + aminoAcids.threonine_mg +
    aminoAcids.tryptophan_mg + aminoAcids.valine_mg
  );

  // PDCAAS computation
  const hasAnimalOrSoy = resolvedIngredients.some((ing) => ing.category === "animal" || ing.id.includes("tempeh") || ing.id.includes("quinoa"));
  aminoAcids.pdcaasEquivalentPct = Math.min(100, Math.round((hasAnimalOrSoy ? 92 : 82) * proteinBioavailability));
  aminoAcids.aminoAcidScorePct = Math.min(100, Math.round(aminoAcids.pdcaasEquivalentPct * 1.05));
  aminoAcids.limitingAmino = hasAnimalOrSoy ? "None (Balanced High Quality)" : "Methionine (Balanced by Teff)";

  // Fatty acid ratios
  fattyAcids.totalSaturated_g = Math.round(fattyAcids.totalSaturated_g * 10) / 10;
  fattyAcids.totalMUFA_g = Math.round(fattyAcids.totalMUFA_g * 10) / 10;
  fattyAcids.totalPUFA_g = Math.round(fattyAcids.totalPUFA_g * 10) / 10;
  fattyAcids.omega6_linoleic_g = Math.round(fattyAcids.omega6_linoleic_g * 10) / 10;
  fattyAcids.omega3_ALA_g = Math.round(fattyAcids.omega3_ALA_g * 100) / 100;
  fattyAcids.omega3_EPA_DHA_g = Math.round(fattyAcids.omega3_EPA_DHA_g * 100) / 100;
  const totalOmega3 = fattyAcids.omega3_ALA_g + fattyAcids.omega3_EPA_DHA_g;
  const omegaRatio = totalOmega3 > 0
    ? `1:${(fattyAcids.omega6_linoleic_g / totalOmega3).toFixed(1)}`
    : "1:8.0";
  fattyAcids.omega3ToOmega6Ratio = omegaRatio;
  fattyAcids.cholesterol_mg = Math.round(fattyAcids.cholesterol_mg);

  // Minerals rounding
  minerals.calcium_mg = Math.round(minerals.calcium_mg);
  minerals.iron_mg = Math.round(minerals.iron_mg * 10) / 10;
  minerals.zinc_mg = Math.round(minerals.zinc_mg * 10) / 10;
  minerals.magnesium_mg = Math.round(minerals.magnesium_mg);
  minerals.potassium_mg = Math.round(minerals.potassium_mg);
  minerals.sodium_mg = Math.round(minerals.sodium_mg);
  minerals.phosphorus_mg = Math.round(minerals.phosphorus_mg);
  minerals.copper_mg = Math.round(minerals.copper_mg * 100) / 100;
  minerals.manganese_mg = Math.round(minerals.manganese_mg * 10) / 10;
  minerals.selenium_mcg = Math.round(minerals.selenium_mcg * 10) / 10;

  // Vitamins rounding
  vitamins.vitaminA_RAE_mcg = Math.round(vitamins.vitaminA_RAE_mcg);
  vitamins.betaCarotene_mcg = Math.round(vitamins.betaCarotene_mcg);
  vitamins.vitaminC_mg = Math.round(vitamins.vitaminC_mg * 10) / 10;
  vitamins.vitaminD_mcg = Math.round(vitamins.vitaminD_mcg * 10) / 10;
  vitamins.vitaminE_mg = Math.round(vitamins.vitaminE_mg * 10) / 10;
  vitamins.vitaminB1_mg = Math.round(vitamins.vitaminB1_mg * 100) / 100;
  vitamins.vitaminB2_mg = Math.round(vitamins.vitaminB2_mg * 100) / 100;
  vitamins.vitaminB3_mg = Math.round(vitamins.vitaminB3_mg * 10) / 10;
  vitamins.vitaminB6_mg = Math.round(vitamins.vitaminB6_mg * 10) / 10;
  vitamins.vitaminB9_folate_mcg = Math.round(vitamins.vitaminB9_folate_mcg);
  vitamins.vitaminB12_mcg = Math.round(vitamins.vitaminB12_mcg * 100) / 100;

  const nutrientsPerServing: DietNutrientProfile = {
    proximate,
    aminoAcids,
    fattyAcids,
    minerals,
    vitamins,
  };

  // ── 100% DRY MATTER BASIS CALCULATION (MOISTURE-FREE NORMALIZATION) ────────
  // Standard AOAC / FAO Conversion:
  // Dry Matter % = 100 - Moisture %
  // Factor = 100 / Total Dry Matter Grams
  const actualFreshWeight = Math.max(1, totalServingGrams);
  const moisturePct = Math.min(95, Math.max(5, (totalMoistureGrams / actualFreshWeight) * 100));
  const dryMatterGrams = Math.max(1, actualFreshWeight - totalMoistureGrams);
  const dryMatterPct = 100 - moisturePct;
  const dmMultiplier = 100 / dryMatterGrams; // Multiplier to express per 100g of dry solids

  const nutrientsPerServingDryMatter: DietNutrientProfile = {
    proximate: {
      energyKcal: Math.round(proximate.energyKcal * dmMultiplier),
      protein_g: Math.round(proximate.protein_g * dmMultiplier * 10) / 10,
      fat_g: Math.round(proximate.fat_g * dmMultiplier * 10) / 10,
      carbohydrate_g: Math.round(proximate.carbohydrate_g * dmMultiplier * 10) / 10,
      dietaryFiber_g: Math.round(proximate.dietaryFiber_g * dmMultiplier * 10) / 10,
      moisture_g: 0, // 0 in 100% Dry Matter basis
      ash_g: Math.round(proximate.ash_g * dmMultiplier * 10) / 10,
    },
    aminoAcids: {
      histidine_mg: Math.round(aminoAcids.histidine_mg * dmMultiplier),
      isoleucine_mg: Math.round(aminoAcids.isoleucine_mg * dmMultiplier),
      leucine_mg: Math.round(aminoAcids.leucine_mg * dmMultiplier),
      lysine_mg: Math.round(aminoAcids.lysine_mg * dmMultiplier),
      methionine_mg: Math.round(aminoAcids.methionine_mg * dmMultiplier),
      cysteine_mg: Math.round(aminoAcids.cysteine_mg * dmMultiplier),
      phenylalanine_mg: Math.round(aminoAcids.phenylalanine_mg * dmMultiplier),
      tyrosine_mg: Math.round(aminoAcids.tyrosine_mg * dmMultiplier),
      threonine_mg: Math.round(aminoAcids.threonine_mg * dmMultiplier),
      tryptophan_mg: Math.round(aminoAcids.tryptophan_mg * dmMultiplier),
      valine_mg: Math.round(aminoAcids.valine_mg * dmMultiplier),
      arginine_mg: Math.round(aminoAcids.arginine_mg * dmMultiplier),
      totalEAA_mg: Math.round(aminoAcids.totalEAA_mg * dmMultiplier),
      limitingAmino: aminoAcids.limitingAmino,
      aminoAcidScorePct: aminoAcids.aminoAcidScorePct,
      pdcaasEquivalentPct: aminoAcids.pdcaasEquivalentPct,
    },
    fattyAcids: {
      totalSaturated_g: Math.round(fattyAcids.totalSaturated_g * dmMultiplier * 10) / 10,
      totalMUFA_g: Math.round(fattyAcids.totalMUFA_g * dmMultiplier * 10) / 10,
      totalPUFA_g: Math.round(fattyAcids.totalPUFA_g * dmMultiplier * 10) / 10,
      omega6_linoleic_g: Math.round(fattyAcids.omega6_linoleic_g * dmMultiplier * 10) / 10,
      omega3_ALA_g: Math.round(fattyAcids.omega3_ALA_g * dmMultiplier * 100) / 100,
      omega3_EPA_DHA_g: Math.round(fattyAcids.omega3_EPA_DHA_g * dmMultiplier * 100) / 100,
      omega3ToOmega6Ratio: fattyAcids.omega3ToOmega6Ratio,
      cholesterol_mg: Math.round(fattyAcids.cholesterol_mg * dmMultiplier),
    },
    minerals: {
      calcium_mg: Math.round(minerals.calcium_mg * dmMultiplier),
      iron_mg: Math.round(minerals.iron_mg * dmMultiplier * 10) / 10,
      bioavailableIron_mg: Math.round(minerals.bioavailableIron_mg * dmMultiplier * 10) / 10,
      zinc_mg: Math.round(minerals.zinc_mg * dmMultiplier * 10) / 10,
      bioavailableZinc_mg: Math.round(minerals.bioavailableZinc_mg * dmMultiplier * 10) / 10,
      magnesium_mg: Math.round(minerals.magnesium_mg * dmMultiplier),
      potassium_mg: Math.round(minerals.potassium_mg * dmMultiplier),
      sodium_mg: Math.round(minerals.sodium_mg * dmMultiplier),
      phosphorus_mg: Math.round(minerals.phosphorus_mg * dmMultiplier),
      copper_mg: Math.round(minerals.copper_mg * dmMultiplier * 100) / 100,
      manganese_mg: Math.round(minerals.manganese_mg * dmMultiplier * 10) / 10,
      selenium_mcg: Math.round(minerals.selenium_mcg * dmMultiplier * 10) / 10,
    },
    vitamins: {
      vitaminA_RAE_mcg: Math.round(vitamins.vitaminA_RAE_mcg * dmMultiplier),
      betaCarotene_mcg: Math.round(vitamins.betaCarotene_mcg * dmMultiplier),
      vitaminC_mg: Math.round(vitamins.vitaminC_mg * dmMultiplier * 10) / 10,
      vitaminD_mcg: Math.round(vitamins.vitaminD_mcg * dmMultiplier * 10) / 10,
      vitaminE_mg: Math.round(vitamins.vitaminE_mg * dmMultiplier * 10) / 10,
      vitaminB1_mg: Math.round(vitamins.vitaminB1_mg * dmMultiplier * 100) / 100,
      vitaminB2_mg: Math.round(vitamins.vitaminB2_mg * dmMultiplier * 100) / 100,
      vitaminB3_mg: Math.round(vitamins.vitaminB3_mg * dmMultiplier * 10) / 10,
      vitaminB6_mg: Math.round(vitamins.vitaminB6_mg * dmMultiplier * 10) / 10,
      vitaminB9_folate_mcg: Math.round(vitamins.vitaminB9_folate_mcg * dmMultiplier),
      vitaminB12_mcg: Math.round(vitamins.vitaminB12_mcg * dmMultiplier * 100) / 100,
    },
  };

  // Dry Matter Analysis Summary
  const dryMatterAnalysis: DryMatterAnalysisSummary = {
    freshWeightGrams: Math.round(actualFreshWeight),
    moistureGrams: Math.round(totalMoistureGrams),
    moisturePercent: Math.round(moisturePct * 10) / 10,
    dryMatterGrams: Math.round(dryMatterGrams),
    dryMatterPercent: Math.round(dryMatterPct * 10) / 10,
    concentrationFactor: Math.round(dmMultiplier * 100) / 100,
    energyKcalPer100gWet: Math.round((proximate.energyKcal / actualFreshWeight) * 100),
    energyKcalPer100gDry: Math.round((proximate.energyKcal / dryMatterGrams) * 100),
    proteinGramsPer100gWet: Math.round((proximate.protein_g / actualFreshWeight) * 1000) / 10,
    proteinGramsPer100gDry: Math.round((proximate.protein_g / dryMatterGrams) * 1000) / 10,
    fatGramsPer100gWet: Math.round((proximate.fat_g / actualFreshWeight) * 1000) / 10,
    fatGramsPer100gDry: Math.round((proximate.fat_g / dryMatterGrams) * 1000) / 10,
    carbsGramsPer100gWet: Math.round((proximate.carbohydrate_g / actualFreshWeight) * 1000) / 10,
    carbsGramsPer100gDry: Math.round((proximate.carbohydrate_g / dryMatterGrams) * 1000) / 10,
    fiberGramsPer100gWet: Math.round((proximate.dietaryFiber_g / actualFreshWeight) * 1000) / 10,
    fiberGramsPer100gDry: Math.round((proximate.dietaryFiber_g / dryMatterGrams) * 1000) / 10,
    ashGramsPer100gDry: Math.round((proximate.ash_g / dryMatterGrams) * 1000) / 10,
  };

  // ── EXTENDED NUTRIENT PROFILES (WET & DRY) ─────────────────────────────────
  const bcaaTotal_mg = Math.round(aminoAcids.leucine_mg + aminoAcids.isoleucine_mg + aminoAcids.valine_mg);
  const kNaRatio = minerals.sodium_mg > 0 ? (minerals.potassium_mg / minerals.sodium_mg).toFixed(1) : "15.0";
  const caMgRatio = minerals.magnesium_mg > 0 ? (minerals.calcium_mg / minerals.magnesium_mg).toFixed(2) : "1.8";
  const caPRatio = minerals.phosphorus_mg > 0 ? (minerals.calcium_mg / minerals.phosphorus_mg).toFixed(2) : "0.8";
  const psRatio = fattyAcids.totalSaturated_g > 0 ? (fattyAcids.totalPUFA_g / fattyAcids.totalSaturated_g).toFixed(2) : "1.2";

  const extendedNutrientsWet: ExtendedNutrientProfile = {
    base: nutrientsPerServing,
    bcaaTotal_mg,
    glycine_mg: Math.round(totalGlycine_mg),
    proline_mg: Math.round(totalProline_mg),
    glutamicAcid_mg: Math.round(totalGlutamicAcid_mg),
    asparticAcid_mg: Math.round(totalAsparticAcid_mg),
    serine_mg: Math.round(totalSerine_mg),
    alanine_mg: Math.round(totalAlanine_mg),
    lysineToArginineRatio: (aminoAcids.lysine_mg / Math.max(1, aminoAcids.arginine_mg)).toFixed(2),
    eaaToTotalProteinRatioPct: Math.round((aminoAcids.totalEAA_mg / Math.max(1, proximate.protein_g * 1000)) * 100),
    diaasEquivalentPct: Math.min(100, Math.round(aminoAcids.pdcaasEquivalentPct * 1.04)),
    palmiticAcid_g: Math.round(totalPalmitic_g * 10) / 10,
    stearicAcid_g: Math.round(totalStearic_g * 10) / 10,
    oleicAcid_g: Math.round(totalOleic_g * 10) / 10,
    arachidonicAcid_ARA_g: Math.round(totalARA_g * 100) / 100,
    eicosapentaenoic_EPA_g: Math.round(totalEPA_g * 100) / 100,
    docosahexaenoic_DHA_g: Math.round(totalDHA_g * 100) / 100,
    polyunsaturatedToSaturatedRatio: psRatio,
    totalOmega3_g: Math.round((fattyAcids.omega3_ALA_g + fattyAcids.omega3_EPA_DHA_g) * 100) / 100,
    totalOmega6_g: Math.round((fattyAcids.omega6_linoleic_g + totalARA_g) * 100) / 100,
    potassiumToSodiumRatio: kNaRatio,
    calciumToMagnesiumRatio: caMgRatio,
    calciumToPhosphorusRatio: caPRatio,
    copper_mg: minerals.copper_mg,
    manganese_mg: minerals.manganese_mg,
    iodine_mcg: Math.round(totalIodine_mcg * 10) / 10,
    retinol_mcg: Math.round(vitamins.vitaminA_RAE_mcg * 0.15),
    luteinZeaxanthin_mcg: Math.round(totalLutein_mcg),
    vitaminD_IU: Math.round(vitamins.vitaminD_mcg * 40),
    vitaminK_mcg: Math.round(totalVitK_mcg),
    vitaminB5_pantothenic_mg: Math.round(totalVitB5_mg * 10) / 10,
    vitaminB7_biotin_mcg: Math.round(totalVitB7_mcg * 10) / 10,
    choline_mg: Math.round(totalCholine_mg),
  };

  const extendedNutrientsDry: ExtendedNutrientProfile = {
    base: nutrientsPerServingDryMatter,
    bcaaTotal_mg: Math.round(bcaaTotal_mg * dmMultiplier),
    glycine_mg: Math.round(totalGlycine_mg * dmMultiplier),
    proline_mg: Math.round(totalProline_mg * dmMultiplier),
    glutamicAcid_mg: Math.round(totalGlutamicAcid_mg * dmMultiplier),
    asparticAcid_mg: Math.round(totalAsparticAcid_mg * dmMultiplier),
    serine_mg: Math.round(totalSerine_mg * dmMultiplier),
    alanine_mg: Math.round(totalAlanine_mg * dmMultiplier),
    lysineToArginineRatio: extendedNutrientsWet.lysineToArginineRatio,
    eaaToTotalProteinRatioPct: extendedNutrientsWet.eaaToTotalProteinRatioPct,
    diaasEquivalentPct: extendedNutrientsWet.diaasEquivalentPct,
    palmiticAcid_g: Math.round(totalPalmitic_g * dmMultiplier * 10) / 10,
    stearicAcid_g: Math.round(totalStearic_g * dmMultiplier * 10) / 10,
    oleicAcid_g: Math.round(totalOleic_g * dmMultiplier * 10) / 10,
    arachidonicAcid_ARA_g: Math.round(totalARA_g * dmMultiplier * 100) / 100,
    eicosapentaenoic_EPA_g: Math.round(totalEPA_g * dmMultiplier * 100) / 100,
    docosahexaenoic_DHA_g: Math.round(totalDHA_g * dmMultiplier * 100) / 100,
    polyunsaturatedToSaturatedRatio: psRatio,
    totalOmega3_g: Math.round(extendedNutrientsWet.totalOmega3_g * dmMultiplier * 100) / 100,
    totalOmega6_g: Math.round(extendedNutrientsWet.totalOmega6_g * dmMultiplier * 100) / 100,
    potassiumToSodiumRatio: kNaRatio,
    calciumToMagnesiumRatio: caMgRatio,
    calciumToPhosphorusRatio: caPRatio,
    copper_mg: Math.round(minerals.copper_mg * dmMultiplier * 100) / 100,
    manganese_mg: Math.round(minerals.manganese_mg * dmMultiplier * 10) / 10,
    iodine_mcg: Math.round(totalIodine_mcg * dmMultiplier * 10) / 10,
    retinol_mcg: Math.round(extendedNutrientsWet.retinol_mcg * dmMultiplier),
    luteinZeaxanthin_mcg: Math.round(totalLutein_mcg * dmMultiplier),
    vitaminD_IU: Math.round(extendedNutrientsWet.vitaminD_IU * dmMultiplier),
    vitaminK_mcg: Math.round(totalVitK_mcg * dmMultiplier),
    vitaminB5_pantothenic_mg: Math.round(totalVitB5_mg * dmMultiplier * 10) / 10,
    vitaminB7_biotin_mcg: Math.round(totalVitB7_mcg * dmMultiplier * 10) / 10,
    choline_mg: Math.round(totalCholine_mg * dmMultiplier),
  };

  // ── SCALE TO PER-DAY PROFILE ───────────────────────────────────────────────
  const mult = servingsPerDay;
  const nutrientsPerDay: DietNutrientProfile = {
    proximate: {
      energyKcal: Math.round(proximate.energyKcal * mult),
      protein_g: Math.round(proximate.protein_g * mult * 10) / 10,
      fat_g: Math.round(proximate.fat_g * mult * 10) / 10,
      carbohydrate_g: Math.round(proximate.carbohydrate_g * mult * 10) / 10,
      dietaryFiber_g: Math.round(proximate.dietaryFiber_g * mult * 10) / 10,
      moisture_g: Math.round(proximate.moisture_g * mult),
      ash_g: Math.round(proximate.ash_g * mult * 10) / 10,
    },
    aminoAcids: {
      histidine_mg: Math.round(aminoAcids.histidine_mg * mult),
      isoleucine_mg: Math.round(aminoAcids.isoleucine_mg * mult),
      leucine_mg: Math.round(aminoAcids.leucine_mg * mult),
      lysine_mg: Math.round(aminoAcids.lysine_mg * mult),
      methionine_mg: Math.round(aminoAcids.methionine_mg * mult),
      cysteine_mg: Math.round(aminoAcids.cysteine_mg * mult),
      phenylalanine_mg: Math.round(aminoAcids.phenylalanine_mg * mult),
      tyrosine_mg: Math.round(aminoAcids.tyrosine_mg * mult),
      threonine_mg: Math.round(aminoAcids.threonine_mg * mult),
      tryptophan_mg: Math.round(aminoAcids.tryptophan_mg * mult),
      valine_mg: Math.round(aminoAcids.valine_mg * mult),
      arginine_mg: Math.round(aminoAcids.arginine_mg * mult),
      totalEAA_mg: Math.round(aminoAcids.totalEAA_mg * mult),
      limitingAmino: aminoAcids.limitingAmino,
      aminoAcidScorePct: aminoAcids.aminoAcidScorePct,
      pdcaasEquivalentPct: aminoAcids.pdcaasEquivalentPct,
    },
    fattyAcids: {
      totalSaturated_g: Math.round(fattyAcids.totalSaturated_g * mult * 10) / 10,
      totalMUFA_g: Math.round(fattyAcids.totalMUFA_g * mult * 10) / 10,
      totalPUFA_g: Math.round(fattyAcids.totalPUFA_g * mult * 10) / 10,
      omega6_linoleic_g: Math.round(fattyAcids.omega6_linoleic_g * mult * 10) / 10,
      omega3_ALA_g: Math.round(fattyAcids.omega3_ALA_g * mult * 100) / 100,
      omega3_EPA_DHA_g: Math.round(fattyAcids.omega3_EPA_DHA_g * mult * 100) / 100,
      omega3ToOmega6Ratio: fattyAcids.omega3ToOmega6Ratio,
      cholesterol_mg: Math.round(fattyAcids.cholesterol_mg * mult),
    },
    minerals: {
      calcium_mg: Math.round(minerals.calcium_mg * mult),
      iron_mg: Math.round(minerals.iron_mg * mult * 10) / 10,
      bioavailableIron_mg: Math.round(minerals.bioavailableIron_mg * mult * 10) / 10,
      zinc_mg: Math.round(minerals.zinc_mg * mult * 10) / 10,
      bioavailableZinc_mg: Math.round(minerals.bioavailableZinc_mg * mult * 10) / 10,
      magnesium_mg: Math.round(minerals.magnesium_mg * mult),
      potassium_mg: Math.round(minerals.potassium_mg * mult),
      sodium_mg: Math.round(minerals.sodium_mg * mult),
      phosphorus_mg: Math.round(minerals.phosphorus_mg * mult),
      copper_mg: Math.round(minerals.copper_mg * mult * 10) / 10,
      selenium_mcg: Math.round(minerals.selenium_mcg * mult * 10) / 10,
      manganese_mg: Math.round(minerals.manganese_mg * mult * 10) / 10,
    },
    vitamins: {
      vitaminA_RAE_mcg: Math.round(vitamins.vitaminA_RAE_mcg * mult),
      betaCarotene_mcg: Math.round(vitamins.betaCarotene_mcg * mult),
      vitaminC_mg: Math.round(vitamins.vitaminC_mg * mult * 10) / 10,
      vitaminD_mcg: Math.round(vitamins.vitaminD_mcg * mult * 10) / 10,
      vitaminE_mg: Math.round(vitamins.vitaminE_mg * mult * 10) / 10,
      vitaminB1_mg: Math.round(vitamins.vitaminB1_mg * mult * 100) / 100,
      vitaminB2_mg: Math.round(vitamins.vitaminB2_mg * mult * 100) / 100,
      vitaminB3_mg: Math.round(vitamins.vitaminB3_mg * mult * 10) / 10,
      vitaminB6_mg: Math.round(vitamins.vitaminB6_mg * mult * 10) / 10,
      vitaminB9_folate_mcg: Math.round(vitamins.vitaminB9_folate_mcg * mult),
      vitaminB12_mcg: Math.round(vitamins.vitaminB12_mcg * mult * 100) / 100,
    },
  };

  // Monthly macro totals
  const nutrientsPerMonth = {
    energyKcal: Math.round(nutrientsPerDay.proximate.energyKcal * 30),
    protein_kg: Math.round((nutrientsPerDay.proximate.protein_g * 30 / 1000) * 10) / 10,
    fat_kg: Math.round((nutrientsPerDay.proximate.fat_g * 30 / 1000) * 10) / 10,
    carb_kg: Math.round((nutrientsPerDay.proximate.carbohydrate_g * 30 / 1000) * 10) / 10,
    fiber_kg: Math.round((nutrientsPerDay.proximate.dietaryFiber_g * 30 / 1000) * 10) / 10,
  };

  // ── RDI ADEQUACY BENCHMARKS ────────────────────────────────────────────────
  const RDI = {
    energyKcal: 2000,
    protein_g: 56,
    dietaryFiber_g: 28,
    calcium_mg: 1000,
    iron_mg: 14,
    zinc_mg: 11,
    magnesium_mg: 400,
    potassium_mg: 3500,
    vitaminA_RAE_mcg: 800,
    vitaminC_mg: 90,
    vitaminD_mcg: 15,
    vitaminB12_mcg: 2.4,
    folate_mcg: 400,
  };

  const rdiAdequacyPct: Record<string, number> = {
    Protein: Math.round((nutrientsPerDay.proximate.protein_g / RDI.protein_g) * 100),
    Fiber: Math.round((nutrientsPerDay.proximate.dietaryFiber_g / RDI.dietaryFiber_g) * 100),
    Calcium: Math.round((nutrientsPerDay.minerals.calcium_mg / RDI.calcium_mg) * 100),
    Iron: Math.round((nutrientsPerDay.minerals.iron_mg / RDI.iron_mg) * 100),
    Zinc: Math.round((nutrientsPerDay.minerals.zinc_mg / RDI.zinc_mg) * 100),
    Magnesium: Math.round((nutrientsPerDay.minerals.magnesium_mg / RDI.magnesium_mg) * 100),
    Potassium: Math.round((nutrientsPerDay.minerals.potassium_mg / RDI.potassium_mg) * 100),
    VitaminA: Math.round((nutrientsPerDay.vitamins.vitaminA_RAE_mcg / RDI.vitaminA_RAE_mcg) * 100),
    VitaminC: Math.round((nutrientsPerDay.vitamins.vitaminC_mg / RDI.vitaminC_mg) * 100),
    VitaminD: Math.round((nutrientsPerDay.vitamins.vitaminD_mcg / RDI.vitaminD_mcg) * 100),
    VitaminB12: Math.round((nutrientsPerDay.vitamins.vitaminB12_mcg / RDI.vitaminB12_mcg) * 100),
    Folate: Math.round((nutrientsPerDay.vitamins.vitaminB9_folate_mcg / RDI.folate_mcg) * 100),
  };

  // ── DEFICIENCY CORRECTION ADVISORIES ───────────────────────────────────────
  const deficiencyAdvisories: NutrientDeficiencyAdvisory[] = [];

  if (rdiAdequacyPct.Calcium < 75) {
    deficiencyAdvisories.push({
      nutrientName: "Calcium (ካልሲየም)",
      currentAmountFormatted: `${nutrientsPerDay.minerals.calcium_mg} mg/day`,
      targetRdiFormatted: "1,000 mg/day",
      status: "mild_deficit",
      recommendationNote: "Add sesame seeds (Selit), raw Ethiopian collards, or Anchote tuber to fulfill bone matrix mineralization.",
      suggestedAdditions: ["White Sesame (Selit)", "Highland Collard Greens (Gomen)", "Anchote Tuber (Coccinia)", "Enset Kocho / Bulla", "Greek Skyr"],
    });
  }

  if (rdiAdequacyPct.VitaminB12 < 70) {
    deficiencyAdvisories.push({
      nutrientName: "Vitamin B12 (ኮባላሚን)",
      currentAmountFormatted: `${nutrientsPerDay.vitamins.vitaminB12_mcg} mcg/day`,
      targetRdiFormatted: "2.4 mcg/day",
      status: "deficit",
      recommendationNote: "Plant-dominant diets lack intrinsic B12. Integrate bio-fortified nutritional yeast, country farm eggs, or wild cold-water salmon.",
      suggestedAdditions: ["Bio-Fortified Nutritional Yeast (1 tbsp)", "Pasture Highland Beef", "Wild Atlantic Salmon", "Strained Skyr", "Farm Fresh Eggs"],
    });
  }

  if (rdiAdequacyPct.VitaminD < 60) {
    deficiencyAdvisories.push({
      nutrientName: "Vitamin D3 (ቫይታሚን ዲ)",
      currentAmountFormatted: `${nutrientsPerDay.vitamins.vitaminD_mcg} mcg/day`,
      targetRdiFormatted: "15 mcg/day",
      status: "mild_deficit",
      recommendationNote: "Supplement through 20 minutes of morning equatorial sun exposure or oily fish / sun-exposed wild mushrooms.",
      suggestedAdditions: ["Wild Atlantic Salmon", "Country Farm Eggs (Inkulal)", "15-20 min equatorial sun exposure"],
    });
  }

  if (nutrientsPerDay.fattyAcids.omega3_ALA_g + nutrientsPerDay.fattyAcids.omega3_EPA_DHA_g < 2.0) {
    deficiencyAdvisories.push({
      nutrientName: "Omega-3 Fatty Acids (ኦሜጋ-3 ቅባት)",
      currentAmountFormatted: `${(nutrientsPerDay.fattyAcids.omega3_ALA_g + nutrientsPerDay.fattyAcids.omega3_EPA_DHA_g).toFixed(2)} g/day`,
      targetRdiFormatted: "2.5 g/day",
      status: "mild_deficit",
      recommendationNote: "Elevate anti-inflammatory ratio by stirring roasted ground flaxseed (Telba) into water or choosing salmon.",
      suggestedAdditions: ["Highland Flaxseed (Telba)", "Organic Chia Seeds", "Wild Cold-Water Salmon", "Raw Walnuts"],
    });
  }

  if (deficiencyAdvisories.length === 0) {
    deficiencyAdvisories.push({
      nutrientName: "Comprehensive Micronutrient Integrity",
      currentAmountFormatted: "All key RDIs met",
      targetRdiFormatted: "Optimal",
      status: "optimal",
      recommendationNote: "Your custom formula satisfies or exceeds all essential amino acid, mineral, and vitamin benchmarks.",
      suggestedAdditions: ["Maintain consistent seasonal preparation and hydration"],
    });
  }

  // ── PREPARATION STEPS (ENGLISH + AMHARIC & 4 CULINARY PHASES) ──────────────
  const isPorridge = input.platterType === "ancient_grain_bowl";
  const isTonic = input.platterType === "functional_tonic";
  const isFirfir = input.platterType === "firfir_shredded_skillet";
  const isChilled = input.platterType === "chilled_deli_platter";
  const isTibs = input.platterType === "sizzling_tibs_skillet";

  // Specific ingredient detection
  const hasTeff = activeIngredientIds.some((id) => id.includes("teff"));
  const hasShiro = activeIngredientIds.some((id) => id.includes("shiro"));
  const hasTibsMeat = activeIngredientIds.some(
    (id) => id.includes("beef") || id.includes("lamb") || id.includes("tibs")
  );
  const hasSalmon = activeIngredientIds.some((id) => id.includes("salmon"));
  const hasGomen = activeIngredientIds.some(
    (id) => id.includes("gomen") || id.includes("collard")
  );
  const hasMisir = activeIngredientIds.some(
    (id) => id.includes("misir") || id.includes("lentil")
  );
  const hasTelba = activeIngredientIds.some(
    (id) => id.includes("telba") || id.includes("flaxseed")
  );
  const hasChia = activeIngredientIds.some((id) => id.includes("chia"));
  const hasQuinoa = activeIngredientIds.some((id) => id.includes("quinoa"));
  const hasBarley = activeIngredientIds.some((id) => id.includes("barley"));
  const hasFaba = activeIngredientIds.some(
    (id) => id.includes("faba") || id.includes("ful")
  );
  const hasChickpea = activeIngredientIds.some((id) => id.includes("chickpea"));
  const hasBerbere = activeIngredientIds.some((id) => id.includes("berbere"));
  const hasTempeh = activeIngredientIds.some((id) => id.includes("tempeh"));
  const hasErsho = input.enzymeReaction === "ersho_phytase_96h";
  const hasSprouting = input.enzymeReaction === "sprouting_germination";
  const hasAscorbic = input.enzymeReaction === "ascorbic_acid_reduction";

  const prepTimeMinutes = isTonic ? 10 : isPorridge ? 15 : hasErsho ? 35 : isFirfir ? 20 : 25;
  const cookTimeMinutes = isTonic ? 0 : isPorridge ? 20 : isChilled ? 15 : isTibs ? 15 : isFirfir ? 15 : 35;
  const totalActiveCookMinutes = prepTimeMinutes + cookTimeMinutes;

  const difficultyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert Chef" = isTonic
    ? "Beginner"
    : isPorridge || isChilled
    ? "Intermediate"
    : input.platterType === "multi_dish_platter" || hasErsho || (hasTibsMeat && hasShiro)
    ? "Expert Chef"
    : "Advanced";

  const difficultyAmharic = isTonic
    ? "ቀላል / ጀማሪ ደረጃ"
    : isPorridge || isChilled
    ? "መካከለኛ ደረጃ"
    : input.platterType === "multi_dish_platter" || hasErsho || (hasTibsMeat && hasShiro)
    ? "ከፍተኛ የሙያ ደረጃ (ባለሙያ)"
    : "ከፍተኛ ደረጃ";

  const enzymeBioactiveTip =
    input.enzymeReaction === "ersho_phytase_96h"
      ? "Ersho 96-hour microbial sourdough fermentation degraded >85% of IP6 phytic acid, multiplying bioavailable iron and zinc by 240%."
      : input.enzymeReaction === "sprouting_germination"
      ? "Germination has doubled active free amino acids (especially Lysine and Threonine) while hydrolyzing flatulence-causing alpha-galactosides."
      : input.enzymeReaction === "ascorbic_acid_reduction"
      ? "Fresh lemon juice added immediately before eating reduces insoluble ferric iron (Fe3+) into soluble absorbable ferrous iron (Fe2+)."
      : "Standard traditional preparation preserves active macronutrient balances and authentic regional flavor notes.";

  const platingGuide =
    input.platterType === "multi_dish_platter"
      ? "Present on an authentic circular Mesob platter with each portion distinctly placed for chromatic harmony."
      : input.platterType === "firfir_shredded_skillet"
      ? "Serve directly in the warm skillet garnished with fresh jalapeños and cool Ayib curd."
      : input.platterType === "chilled_deli_platter"
      ? "Arrange Azifa, chilled fitfit, and tomato relish in clean compartments on a wide slate platter."
      : input.platterType === "sizzling_tibs_skillet"
      ? "Serve sizzling on a heated cast-iron brazier with fragrant smoking rosemary sprigs."
      : input.platterType === "ancient_grain_bowl"
      ? "Shape into a central peak in a wide ceramic bowl with spiced lipid moat around the perimeter."
      : "Serve chilled in a crystal goblet with fresh mint or a dusting of roasted flaxseed.";

  // ── 1. CULINARY TOOLSET ────────────────────────────────────────────────────
  const toolSet: CulinaryToolSet = isPorridge
    ? {
        vessel: "Heavy-bottomed earthenware pot (Dist) or cast-iron Dutch oven",
        vesselAmharic: "ባህላዊ የሸክላ ድስት ወይም ወፍራም የብረት ድስት",
        utensils: ["Traditional wooden stirring paddle (Zena / Maslafa)", "Ladle", "Fine-mesh flour sifter", "Wide serving bowl"],
        utensilsAmharic: ["በባህል የተወረሰ የእንጨት ማማሰያ (ዜና)", "የእንጨት ጭልፋ", "የዱቄት መንፊያ", "ሰፊ የሸክላ ሳህን"],
        heatSource: "Even low-to-medium heat source (charcoal brazier or induction at 90–110°C)",
        heatSourceAmharic: "ዝቅተኛ ወጥ ሙቀት (ክሰል ማብሰያ ወይም የኤሌክትሪክ ምድጃ)",
        storageVessel: "Glazed ceramic bowl sealed with parchment or airtight glass container",
        storageVesselAmharic: "የሸክላ ጎድጓዳ ሳህን ወይም አየር የማያስገባ የብርጭቆ ዕቃ",
      }
    : isTonic
    ? {
        vessel: "Burr grinder or stone mortar, followed by wide crystal beaker or ceramic pitcher",
        vesselAmharic: "የድንጋይ ሙቀጫ ወይም ፈጪ፣ ከዚያም የመስታወት ማሰሮ",
        utensils: ["Fine wire whisk", "Citrus hand press", "Micro-mesh sieve (optional)", "Long bar spoon"],
        utensilsAmharic: ["የሽቦ መምቻ", "የሎሚ መጭመቂያ", "ጥቃቅን ማጣሪያ", "ረጅም ማንኪያ"],
        heatSource: "Dry cast-iron skillet for seed activation (gentle dry roasting only), cold-served water",
        heatSourceAmharic: "ደረቅ መጥበሻ (ለማቁላት ብቻ)፣ የቀዘቀዘ ውሃ ማቅረቢያ",
        storageVessel: "Amber UV-blocking glass bottle with airtight gasket cap",
        storageVesselAmharic: "ብርሃን የማያሳልፍ ጥቁር አምበር ጠርሙስ",
      }
    : isTibs
    ? {
        vessel: "Heavy seasoned black cast-iron skillet (Biret Dist) or clay brazier (Shekela)",
        vesselAmharic: "የጋለ ጥቁር የብረት ምጣድ (ብረት ድስት) ወይም ሸክላ",
        utensils: ["Stainless steel chef tongs", "Heavy wooden turner", "Chef's carving knife", "Heat-resistant trivet"],
        utensilsAmharic: ["የብረት ማያዣ (ቶንግስ)", "የእንጨት ማገላበጫ", "ስለት ያለው ቢላዋ", "ሙቀት መቋቋሚያ ማስቀመጫ"],
        heatSource: "High-output flame or maximum induction searing surface (180–220°C)",
        heatSourceAmharic: "ከፍተኛ ነበልባል ወይም ከፍተኛ ሙቀት ሰጪ ምድጃ",
        storageVessel: "Shallow glass food storage container with snap-lock seal",
        storageVesselAmharic: "ጥልቀት የሌለው አየር የማያስገባ የብርጭቆ ዕቃ",
      }
    : isFirfir
    ? {
        vessel: "Wide flared cast-iron or carbon steel skillet",
        vesselAmharic: "ሰፊ የብረት ድስት ወይም ምጣድ",
        utensils: ["Curved wooden spatula for gentle folding", "Chef knife", "Deep saucier spoon"],
        utensilsAmharic: ["እንጀራ እንዳይቦካ በቀስታ ማገላበጫ የእንጨት ጭልፋ", "ቢላዋ", "የወጥ ማውጫ"],
        heatSource: "Medium flame for onion caramelization, gentle simmer during folding",
        heatSourceAmharic: "መካከለኛ እሳት ሽንኩርት ለማቁላት፣ ዝቅተኛ እሳት ለማዋሃድ",
        storageVessel: "Airtight glass container with vent tab",
        storageVesselAmharic: "አየር የማያስገባ የብርጭቆ ዕቃ",
      }
    : isChilled
    ? {
        vessel: "Stainless steel mixing bowls and shallow slate or porcelain platter",
        vesselAmharic: "የማይዝግ ብረት ሳህን እና ሰፊ የገበታ ሰሌዳ",
        utensils: ["Small wire whisk", "Silicone spatula", "Fine grater / Microplane", "Serving tongs"],
        utensilsAmharic: ["አነስተኛ መምቻ", "የሲሊኮን መዛያ", "መፈቅፈቂያ", "ማስተናገጃ ማያዣ"],
        heatSource: "Simmering stockpot for lentil boiling; ice-water bath for flash chilling",
        heatSourceAmharic: "ምስር መቀቀያ ድስት፤ ወዲያውኑ ማቀዝቀዣ የቀዘቀዘ ውሃ",
        storageVessel: "Compartmentalized hermetic glass meal prep containers",
        storageVesselAmharic: "ክፍፍል ያለው አየር የማያስገባ የመስታወት ማከማቻ",
      }
    : {
        vessel: "Set of traditional Ethiopian clay pots (Dist) and woven communal Mesob platter",
        vesselAmharic: "ባህላዊ የሸክላ ድስቶች (ድስት) እና የተሸመነ የሰፌድ መሶብ",
        utensils: ["Set of deep carved wooden ladles (Zena)", "Chef knife and prep bowls", "Stainless vegetable tongs", "Injera lifter (Safed)"],
        utensilsAmharic: ["የተጠረቡ የእንጨት ጭልፋዎች (ዜና)", "ስለት ያለው ቢላዋና መክተፊያ", "አትክልት ማንሻ ማያዣ", "የእንጀራ ሰፌድ"],
        heatSource: "Multi-burner setup: medium-low for slow legume reduction, high for quick vegetable sauté",
        heatSourceAmharic: "የተለያየ እሳት ያላቸው በርነሮች፡ ዝቅተኛ ለሽሮ/ምስር፣ ከፍተኛ ለአትክልት",
        storageVessel: "Individual airtight borosilicate glass meal containers separated by dish",
        storageVesselAmharic: "የተለያዩ ወጦች ተለይተው የሚቀመጡባቸው አየር የማያስገቡ የመስታወት ዕቃዎች",
      };

  // ── 2. PLATING ARCHITECTURE ────────────────────────────────────────────────
  const centerpiece = isPorridge
    ? "Peak-and-Crater (Kefet) with molten spiced lipid moat and berbere dusting"
    : isTibs
    ? "Sizzling caramelized protein in cast-iron skillet with charred jalapeño crown"
    : isFirfir
    ? "Glistening sauce-infused shredded injera mounded with fresh jalapeño and Ayib"
    : isTonic
    ? "Frosted crystal goblet with floating Korarima dusting and lemon zest ribbon"
    : "Deep aromatic Shiro or Misir Wat circular anchor in the center";

  const centerpieceAmharic = isPorridge
    ? "መሃሉ የተቦረቦረ ገንፎ ከነጠረ ቅቤና ሚጥሚጣ ጋር"
    : isTibs
    ? "በጋለ ምጣድ ላይ እየተንጣጣ የቀረበ የጥብስ ስጋ ከቃሪያ ጋር"
    : isFirfir
    ? "በወጥ የራሰ የፈረፈረ እንጀራ በቃሪያና በአይብ ያጌጠ"
    : isTonic
    ? "በመስታወት የቀረበ የቴልባ/ቺያ መጠጥ በኮረሪማ የተከሸነ"
    : "የደመቀ የሽሮ ወይም የምስር ወጥ ማዕከል";

  const perimeterArrangement = isPorridge
    ? [
        "Rim North: Cultured probiotic Ayib curd or Icelandic Skyr",
        "Rim East: Diced toasted flaxseeds (Telba) for crunch and lignans",
        "Rim South: Extra reservoir of warm niter kibbeh or olive oil",
        "Rim West: Fresh herbal sprigs or crushed fenugreek seeds",
      ]
    : isTibs
    ? [
        "12 o'clock: Freshly bruised rosemary sprigs releasing volatile piney terpenes",
        "3 o'clock: Crisp sliced raw jalapeños (Qariya) for capsicum synergy",
        "6 o'clock: Neatly rolled cylinders of 100% fermented Teff Injera",
        "9 o'clock: Fresh Ethiopian Senafich (spiced ground mustard dip)",
      ]
    : isFirfir
    ? [
        "Top Center: Fresh snow-white Ayib curd to modulate capsaicin heat",
        "Clockwise 2 o'clock: Crisp pickled shallot slivers",
        "Clockwise 6 o'clock: Rolled crisp dried Injera crisps (Dirkosh)",
        "Clockwise 10 o'clock: Roasted Korarima and Awaze dipping sauce",
      ]
    : isTonic
    ? [
        "Base: Chilled crystalline glassware frosted at 10°C",
        "Surface: Swirled mucilage emulsion with unbroken surface tension",
        "Rim: Fine rimming of roasted flaxseed flour and raw mountain honey",
        "Garnish: Ribbon of untreated organic lemon peel",
      ]
    : [
        "12 o'clock: Vibrant emerald Ethiopian collard greens (Gomen) flash-sautéed with garlic",
        "3 o'clock: Velvety golden yellow split pea stew (Kik Alicha) with fresh turmeric",
        "6 o'clock: Ruby simmered beetroot with carrots and roasted cumin (Key Sir)",
        "9 o'clock: Spiced whole brown lentil stew (Defen Misir Wat) rich in resistant starch",
      ];

  const platingArchitecture: PlatingArchitecture = {
    layoutDescriptionEn: isTonic
      ? "Vertical glass presentation showcasing suspended prebiotic mucilage layers with frosted rimming."
      : isPorridge
      ? "Classic Ethiopian volcanic caldera architecture: raised porridge rim containing a molten lipid core."
      : isFirfir
      ? "Rustic skillet presentation: caramelized shreds crowned with cooling curd and verdant chilies."
      : isTibs
      ? "Sizzling kinetic presentation: smoking cast iron with acoustic sizzle and aroma plume."
      : "Circular radial geometry with centerpiece gravity and balanced chromatic contrast (Emerald, Gold, Crimson, and Earthy Ochre) on a traditional woven Mesob base.",
    layoutDescriptionAmharic: isTonic
      ? "በመስታወት ዕቃ ውስጥ የተንሳፈፈ የተፈጥሮ ቴልባ/ቺያ መጠጥ አቀራረብ።"
      : isPorridge
      ? "በባህላዊ የገንፎ አቀራረብ፡ ዙሪያው ከፍ ብሎ መሃሉ ለቅቤና ሚጥሚጣ የተቦረቦረ።"
      : isFirfir
      ? "በጋለ ድስት የቀረበ ፍርፍር በአይብና በቃሪያ ያሸበረቀ።"
      : isTibs
      ? "በጋለ የብረት ድስት እየተንጣጣ የሚቀርብ የጥብስ አቀራረብ።"
      : "በባህላዊ ክብ መሶብ ላይ የተዘረጋ የተዋበና የተመጣጠነ የቀለማት ቅንብር (አረንጓዴ ጎመን፣ ወርቃማ ሽሮ፣ ቀይ ምስር እና ቡናማ እንጀራ)።",
    centerpiece,
    centerpieceAmharic,
    perimeterArrangement,
    colorHarmonyNote:
      "High chromatic contrast stimulates cephalic-phase digestive enzyme secretion (salivary amylase and gastric gastrin) prior to the first bite.",
    edibleUtensilNote:
      "Freshly fermented 100% Teff Injera folded into rolled cylinders ('Dirkosh' or 'Zulzul') serving as a 100% natural, probiotic edible utensil.",
    culturalEtiquetteNote:
      "Traditionally consumed with the right hand using the thumb and first two fingers ('Gursha' ritual), fostering mindful portion pacing, satiety signaling, and community bond.",
    garnishes: [
      "Thin rings of fresh Jalapeño (Qariya)",
      "Crumbled cultured curd (Ayib)",
      "Bruised fresh rosemary sprigs",
      "Toasted Ethiopian sesame/flax dusting",
    ],
    servingTemperature: isTonic
      ? "Chilled (10–14°C)"
      : isChilled
      ? "Crisp Cellar Temp (8–12°C)"
      : isTibs
      ? "Sizzling Hot (>85°C)"
      : "Warm & Steaming (65–75°C)",
  };

  // ── 3. PRESERVATION GUIDE ──────────────────────────────────────────────────
  const preservationGuide: PreservationGuide = {
    refrigerationInstructions:
      "Transfer cooled portions into airtight borosilicate glass meal containers. Store at 2–4°C within 1 hour of preparation. Keep raw condiments (Senafich, Ayib) in separate containers.",
    refrigerationInstructionsAmharic:
      "የቀዘቀዘውን ምግብ አየር በማያስገባ የመስታወት ዕቃ ውስጥ በማድረግ በ2-4 ዲግሪ ሴንቲግሬድ ማቀዝቀዣ ውስጥ ያስቀምጡ። አጃቢ ምግቦችን ለይተው ያስቀምጡ።",
    reheatingMethod:
      "Gently reheat stews on the stovetop over low flame with 20–30ml of filtered water or bone broth, stirring smoothly until uniform steam rises (75°C). Avoid intense microwave boiling.",
    reheatingMethodAmharic:
      "ወጦችን በድስት ላይ በጥቂት ውሃ ወይም መረቅ በዝቅተኛ እሳት ላይ እያማሰሉ ቀስ ብለው ያሞቁ። በከፍተኛ ማይክሮዌቭ አያፍሉት።",
    maxRefrigeratedDays: isTonic ? 2 : isChilled ? 3 : 5,
    batchCookingTip:
      "Cook legume bases (Shiro, Misir, Kik) in 3x batch volume; divide into meal-sized portions and freeze for up to 1 month. Add fresh greens and delicate spices just before serving.",
    batchCookingTipAmharic:
      "የምስርና የሽሮ ወጦችን በብዛት ሰርተው በማቀዝቀዣ በረዶ ክፍል (Freezer) እስከ 1 ወር ማቆየት ይቻላል። ጎመኑንና ትኩስ ቅመሞችን በሚበላበት ቀን ማዘጋጀት ይመረጣል።",
    monthlyBulkStorageTip:
      "Store raw dry grains, teff flour, shiro powder, and whole spices in cool, dark airtight bins to prevent fatty acid oxidation and phytase degradation over 30–90 days.",
    nutrientRetentionWarning:
      "Avoid repeated heating and cooling cycles. Reheat only the exact single serving to be consumed to preserve vitamin C, thiamine (B1), and delicate polyunsaturated fatty acids.",
  };

  // ── 4. FOUR CULINARY PHASES ────────────────────────────────────────────────
  const phase1En: string[] = isTonic
    ? [
        "Inspect whole flaxseed (Telba), chia seeds, and sesame seeds for purity; toast dry over gentle heat (65–75°C) for 3 minutes to activate lignans without burning.",
        "Mill in a burr grinder into an ultra-fine meal to shatter the outer lignified seed-coat and unlock bioavailable alpha-linolenic omega-3 fatty acids.",
        "Measure chilled spring water (or coconut water) and freshly squeezed lemon juice to supply ascorbic acid for iron reduction.",
      ]
    : isPorridge
    ? [
        "Sift heirloom roasted barley flour (Senafich Beso), fermented teff flour, and quinoa powder through a fine sieve to aerate and ensure clump-free incorporation.",
        "Accurately measure the 3.5:1 liquid-to-flour hydration ratio using seasoned bone broth or filtered mineral water.",
        "Temper the spiced clarified butter (Niter Kibbeh) or extra-virgin olive oil to room temperature for seamless emulsification.",
      ]
    : isFirfir
    ? [
        "Tear 100% fermented Teff Injera into uniform 3×3 cm bite-sized pieces; spread on a clean surface for 10 minutes to dry slightly so it absorbs sauce without dissolving.",
        "Finely brunoise red onions (Qey Shinkurt) to maximize cellular rupture and rapid alliinase enzyme synthesis.",
        "Crush fresh garlic cloves and grate ginger root; measure pure Ethiopian berbere spice blend.",
      ]
    : [
        hasErsho
          ? "Verify 72–96h microbial sourdough Ersho activity: check for gentle sour fermentation aroma indicating complete IP6 phytate breakdown."
          : "Measure all ancient flours, grains, and dry ingredients accurately using culinary scales.",
        hasShiro
          ? "Whisk sun-dried chickpea/pea Shiro powder with a small ladle of cold water to form a smooth slurry, preventing thermal shock lumps."
          : "Sort and rinse legumes (lentils, chickpeas, or faba beans) in cold water until runoff is crystal clear.",
        hasGomen
          ? "Wash highland Ethiopian collard greens (Gomen) thoroughly, remove tough central fibrous ribs, and cut crosswise into fine chiffonade ribbons."
          : "Wash and prep all seasonal fresh vegetables into uniform bite-sized cuts.",
        hasTibsMeat || hasSalmon || hasTempeh
          ? "Slice proteins (beef, salmon, or tempeh) uniformly across the grain into thin medallions; pat dry to guarantee crisp Maillard caramelization."
          : "Measure whole spices (Korarima, Mekelesha, Korerima) into small prep bowls.",
      ];

  const phase1Am: string[] = isTonic
    ? [
        "የተመረጡትን ፍሬዎች (ቴልባ፣ ቺያ ወይም ሰሊጥ) በንጹህ ምጣድ ላይ ሳያርሩ በመጠኑ ለ3 ደቂቃ ያቁላሉ።",
        "በወፍጮ ወይም በባህላዊ ሙቀጫ የፍሬው ልጣጭ እስኪላላና ኦሜጋ-3 እስኪወጣ ድረስ በደንብ ይፍጩት።",
        "የቀዘቀዘ ንጹህ ውሃ እና ቫይታሚን ሲ የሚሰጥ ትኩስ የሎሚ ጭማቂ ለክንውን ያዘጋጁ።",
      ]
    : isPorridge
    ? [
        "የገብስ፣ የጤፍ፣ የቡላ ወይም የኪንዋ ዱቄቱን በወንፊት ነፍተው አየር እንዲገባውና እንዳይጓጉል ያድርጉ።",
        "የውሃውን ወይም የመረቁን መጠን ከዱቄቱ ጋር (3.5 ለ 1) በትክክል ለክተው ያዘጋጁ።",
        "የነጠረ ቅቤ (ንጥር ቅቤ) ወይም የወይራ ዘይቱን በክፍል ሙቀት ላይ እንዲለሰልስ ያድርጉ።",
      ]
    : isFirfir
    ? [
        "የተጋገረውን የጤፍ እንጀራ በ3×3 ሳንቲም ሜትር ስፋት ቆራርጠው መረቁን እንዲመጥ ለ10 ደቂቃ አየር ላይ ያቆዩት።",
        "ቀይ ሽንኩርቱን በደቃቁ ከትፈው የተፈጥሮ ኢንዛይሞች እንዲነቃቁ ያድርጉ።",
        "ነጭ ሽንኩርትና ዝንጅብል ወቅጠው ንጹህ የኢትዮጵያ በርበሬና ቅቤ ያዘጋጁ።",
      ]
    : [
        hasErsho
          ? "የቦካውን የጤፍ ሊጥ የእርሾ እርምጃ ይፈትሹ፤ ጤናማ አሲዳማ ሽታ የፋይታይት መሟሟትን ያረጋግጣል።"
          : "ሁሉንም እህሎችና ግብዓቶች በሚዛን ለክተው ያዘጋጁ።",
        hasShiro
          ? "የሽሮ ዱቄቱን በጥቂት ቀዝቃዛ ውሃ በጥብጠው ያዘጋጁ፤ ሙቅ ውሃ ውስጥ ሲገባ እንዳይጓጉል ይረዳል።"
          : "ምስሩን ወይም አተሩን በንጹህ ውሃ አጥበው ያዘጋጁ።",
        hasGomen
          ? "የሀበሻ ጎመኑን በደንብ አጥበው፣ መሃከለኛ አገዳውን አውጥተው በደቃቁ ይክተፉት።"
          : "አትክልቶችን በተመጣጠነ መጠን ቆራርጠው ያዘጋጁ።",
        hasTibsMeat || hasSalmon || hasTempeh
          ? "ስጋውን፣ ዓሣውን ወይም ቴምፔውን በተመጣጠነ መጠን ቆራርጠው እርጥበቱን በወረቀት ያድርቁ።"
          : "ቅመማ ቅመሞችን (ኮረሪማ፣ መከለሻ) በየጎድጓዳ ሳህኑ ለክተው ያዘጋጁ።",
      ];

  const phase2En: string[] = isTonic
    ? [
        "No thermal heat: combine freshly milled seed powder with cold water in a glass vessel.",
        "Whisk vigorously for 90 seconds to disperse the mucilage fibers into a silky, suspended colloidal matrix.",
        "Stir in raw wild honey and fresh lemon juice immediately before consumption to protect ascorbic acid from oxidation.",
      ]
    : isPorridge
    ? [
        "Bring 3.5 parts seasoned bone broth or mineral spring water to a steady rolling boil in a heavy earthenware pot.",
        "Stream in the flour mixture in a continuous fine cascade while whisking rapidly with the wooden Zena to prevent lumps.",
        "Reduce heat to low (85–90°C); stir rhythmically for 18–22 minutes until starches achieve deep gloss and viscous gelatinization.",
        "Remove from heat, cover tightly, and allow to rest for 3 minutes for starch network stabilization.",
      ]
    : isFirfir
    ? [
        "Sweat finely minced shallots in a dry skillet for 4 minutes until golden; fold in spiced niter kibbeh or olive oil with crushed garlic.",
        "Add authentic Berbere and bloom gently over medium heat for 3 minutes, coaxing fat-soluble aromatic flavor compounds into the oil.",
        "Deglaze with rich broth and simmer uncovered for 8 minutes to build a concentrated, aromatic Kulet reduction.",
        "Introduce torn Teff Injera into the simmering gravy; gently fold for 2–3 minutes until evenly coated and sauce is deeply absorbed.",
      ]
    : isTibs
    ? [
        "Preheat seasoned cast-iron skillet until smoking hot (200–215°C).",
        "Add spiced clarified butter (kibbeh) or high-smoke oil, then immediately introduce sliced meat or marinated tempeh in an uncrowded single layer.",
        "Sear undisturbed for 2–3 minutes to create deep Maillard caramelization while locking in tender interior juices.",
        "Toss in sliced red onions, fresh rosemary sprigs, and green jalapeño peppers for the final 60 seconds before removing from heat.",
      ]
    : [
        "In a heavy pot, sweat onions and garlic until caramelized; stir in Berbere and legume slurry (Shiro/Misir) with broth.",
        "Simmer gently over medium heat (100–110°C) for 25–30 minutes until legumes break down into a thick, velvety stew.",
        "In a separate skillet, flash-sauté greens (Gomen) with crushed garlic and ginger for 4 minutes, preserving vivid chlorophyll.",
        hasTibsMeat || hasSalmon || hasTempeh
          ? "Sear protein over high heat in spiced fat, achieving exterior crispness while retaining tender interior moisture."
          : "Stir in finishing spices (Korarima and Mekelesha) during the final 60 seconds of simmering to preserve delicate volatile aromas.",
      ];

  const phase2Am: string[] = isTonic
    ? [
        "ምንም ሙቀት ሳይጠቀሙ፡ የተፈጨውን የቴልባ/ቺያ ዱቄት በቀዘቀዘ ውሃ ውስጥ በመስታወት ዕቃ ይጨምሩ።",
        "የተፈጥሮ ሙሲሌጅ (ልስላሴው) በእኩል እንዲዋሃድ ለ90 ሰከንዶች በሽቦ መምቻ በደንብ ይምቱት።",
        "ቫይታሚን ሲ እንዳይበላሽ ትኩስ የሎሚ ጭማቂና ጥቂት ማር ጨምረው ወዲያውኑ ያዋህዱት።",
      ]
    : isPorridge
    ? [
        "በወፍራም የሸክላ ድስት ውስጥ 3.5 እጥፍ ውሃ ወይም መረቅ አፍልተው ያዘጋጁ።",
        "የተዘጋጀውን ዱቄት እያማሰሉ ቀስ በቀስ ይጨምሩ፤ እንዳይጓጉል በፍጥነት ያማስሉት።",
        "እሳቱን በመቀነስ (85-90°C) በእንጨት ማማሰያ ለ18-22 ደቂቃ እስኪበስልና እስኪወፍር ድረስ ያማስሉት።",
        "ከእሳት ካወጡ በኋላ ድስቱን ከድነው ለ3 ደቂቃ ያቆዩት።",
      ]
    : isFirfir
    ? [
        "የተከተፈውን ሽንኩርት በደረቅ ድስት ላይ ካቁላሉ በኋላ ቅቤና የተወቀጠ ነጭ ሽንኩርት ይጨምሩበት።",
        "በርበሬ ጨምረው በቅቤው ውስጥ ለ3 ደቂቃ በመካከለኛ ሙቀት በማቁላት ቀለሙና ጣዕሙ እንዲወጣ ያድርጉ።",
        "መረቅ ጨምረው ለ8 ደቂቃ በማፍላት ወፍራም ኩስኩስ (ቁሌት) ያዘጋጁ።",
        "የተቆረጠውን እንጀራ በድስቱ ውስጥ ጨምረው መረቁን እንዲመጥ ለ2-3 ደቂቃ በቀስታ ያገላብጡት።",
      ]
    : isTibs
    ? [
        "የብረት ድስቱን ወይም ምጣዱን እስኪጨስ ድረስ (200°C) በደንብ ያግሉት።",
        "የነጠረ ቅቤ ወይም ዘይት አድርገው ስጋውን ወይም ቴምፔውን በከፍተኛ ሙቀት ላይ ፈጥነው ይጥበሱት።",
        "ጭማቂው ሳይወጣ ከውጭ ጥብስ ከውስጥ ለስላሳ እንዲሆን ለ2-3 ደቂቃ በከፍተኛ ሙቀት ያገላብጡት።",
        "የተከተፈ ሽንኩርት፣ የጥብስ ቅጠል (ሮዝመሪ) እና ቃሪያ ጨምረው ለ1 ደቂቃ አገላብጠው ከእሳት ያውርዱ።",
      ]
    : [
        "ሽንኩርትና ነጭ ሽንኩርቱን በደንብ ካቁላሉ በኋላ በርበሬና የሽሮ/ምስር መረቁን ጨምረው ያዋህዱ።",
        "እሳቱን በመቀነስ ለ25-30 ደቂቃ ያብስሉት፤ ወጡ ወፍራም፣ ልስልስና ጥሩ መዓዛ ያለው ይሆናል።",
        "በሌላ ድስት ጎመኑን በነጭ ሽንኩርትና ዝንጅብል ለ4 ደቂቃ ጠብሰው አረንጓዴ ቀለሙ እንዳይጠፋ ያዘጋጁ።",
        hasTibsMeat || hasSalmon || hasTempeh
          ? "ስጋውን፣ ዓሣውን ወይም ቴምፔውን በጋለ ቅቤ ጠብሰው ጭማቂው እንዳይወጣ ያድርጉ።"
          : "መከለሻና ኮረሪማ በመጨረሻው 1 ደቂቃ ላይ ጨምረው የተፈጥሮ መዓዛቸው እንዳይጠፋ ያድርጉ።",
      ];

  const phase3En: string[] = isTonic
    ? [
        "Pour the chilled tonic into a clear crystal goblet or traditional ceramic cup.",
        "Garnish the velvety surface with a dusting of freshly ground korarima cardamom or roasted sesame seeds.",
        "Serve immediately at 10–14°C while the mucilaginous fiber suspension remains completely homogeneous.",
      ]
    : isPorridge
    ? [
        "Mound the piping hot porridge in the center of a wide, warmed ceramic or clay bowl.",
        "Form a smooth circular depression (Kefet) in the center using the back of a warm spoon.",
        "Ladle warm spiced niter kibbeh or extra-virgin olive oil into the crater and dust with berbere or mitmita.",
        "Arrange a cooling border of fresh cultured curd (Ayib) or yogurt around the outer rim.",
      ]
    : isFirfir
    ? [
        "Transfer the glistening firfir onto a warm serving platter or present directly in the sizzling skillet.",
        "Crown with crisp slices of fresh jalapeño and a dollop of snow-white cultured Ayib curd.",
        "Accompany with rolled quarters of soft fermented Teff Injera for tactile dining enjoyment.",
      ]
    : isTibs
    ? [
        "Present the sizzling tibs directly on the heated cast-iron brazier (Shekela) or cast-iron skillet.",
        "Garnish with bruised rosemary sprigs releasing fresh piney aromas into the rising steam.",
        "Serve immediately alongside warm rolled fermented Teff Injera or crusty whole-grain bread.",
      ]
    : [
        "Unfurl a fresh disc of 100% fermented Teff Injera across a circular traditional woven Mesob platter.",
        "Ladle the rich, dark Berbere stew or Shiro precisely in the center as the visual and aromatic centerpiece.",
        "Artfully distribute vibrant vegetable mounds (emerald Gomen, golden Kik Alicha, ruby Key Sir) around the perimeter clock-face (12, 3, 6, 9 o'clock).",
        "Surround with rolled Teff Injera cylinders (Dirkosh/Zulzul) serving as authentic biodegradable edible utensils.",
      ];

  const phase3Am: string[] = isTonic
    ? [
        "የቀዘቀዘውን መጠጥ በመስታወት ብርጭቆ ወይም በባህላዊ የሸክላ ዋንጫ ውስጥ ይቅዱ።",
        "ላዩ ላይ በጥቂቱ የተፈጨ ኮረሪማ ወይም የተቆላ ሰሊጥ በመነስነስ ያስውቡት።",
        "የተፈጥሮ ልስላሴው ሳይከፋፈል በ10-14 ዲግሪ ሴንቲግሬድ ትኩስ ሆኖ እያለ ወዲያውኑ ያቅርቡት።",
      ]
    : isPorridge
    ? [
        "ትኩስ ገንፎውን በሰፊና በሞቀ የሸክላ ሳህን መሃል ላይ ያድርጉት።",
        "በማንኪያ መሃሉን ቀድደው የተዋበ ክብ ጉድጓድ (ከፈት) ያዘጋጁ።",
        "በቀደዱት መሃል ላይ የነጠረ ቅቤ ወይም የወይራ ዘይት አፍስሰው በሚጥሚጣ ወይም በርበሬ ያስውቡት።",
        "በጎኑ የቀዘቀዘ እርጎ ወይም አይብ በማስቀመጥ ትኩስ እያለ በማዕድ ያቅርቡት።",
      ]
    : isFirfir
    ? [
        "የተዘጋጀውን ፍርፍር በሰፊ ሳህን ወይም በጋለ ድስቱ ላይ እንዳለ ያቅርቡት።",
        "ላዩ ላይ የተከተፈ ቃሪያና ለስላሳ አይብ በማድረግ ያስውቡት።",
        "ከጎኑ ከተጠቀለለ ለስላሳ የጤፍ እንጀራ ጋር በማዕድ ያቅርቡት።",
      ]
    : isTibs
    ? [
        "እየተንጣጣ በጋለ ምጣድ ወይም በሸክላ ላይ እንዳለ ከእሳት ወዲያውኑ በማዕድ ያቅርቡት።",
        "የጥብስ ቅጠል (ሮዝመሪ) ላዩ ላይ በማድረግ ጥሩ መዓዛ እንዲኖረው ያስውቡት።",
        "ከተጠቀለለ የጤፍ እንጀራ ወይም ከቂጣ ጋር ትኩስ እያለ ያቅርቡት።",
      ]
    : [
        "የተጋገረውን የጤፍ እንጀራ በመሶብ ወይም በሰፊ ሳህን ላይ ያንጥፉ።",
        "የተዘጋጀውን የሽሮ ወይም የምስር ወጥ በመሃል ላይ በማዕከልነት ያቅርቡ።",
        "የተዘጋጁትን አትክልቶች (አረንጓዴ ጎመን፣ ወርቃማ ክክ፣ ቀይ ስር) በክብ በመደርደር የተሟላ ማዕድ አድርገው ያስውቡ።",
        "የተጠቀለሉ የጤፍ እንጀራዎችን በዙሪያው በማስቀመጥ በባህላዊና በተመጣጠነ መልኩ ያቅርቡት።",
      ];

  const phase4En: string[] = [
    "Allow any leftover portions to cool uncovered to ambient room temperature (max 45 minutes); do not seal boiling-hot food to prevent condensation and sour spoilage.",
    "Portion separate stew components into airtight borosilicate glass containers; refrigerate at 2–4°C for up to 4–5 days.",
    "For bulk preparation: legume bases (Shiro, Misir) freeze safely at -18°C for up to 30 days without loss of protein or dietary fiber.",
    "Reheat stews gently on the stove over low flame with 25ml of water or bone broth; avoid repeated microwave boiling to protect heat-sensitive vitamins.",
  ];

  const phase4Am: string[] = [
    "የተረፈውን ምግብ በክፍል ሙቀት ለ45 ደቂቃ ያቀዝቅዙት፤ ትኩስ እያለ መክደን እርጥበት ፈጥሮ ምግቡን እንዳያበላሸው ይጠንቀቁ።",
    "የተለያዩ ወጦችን ለይተው አየር በማያስገባ የመስታወት ዕቃ ውስጥ በ2-4 ዲግሪ ሴንቲግሬድ ማቀዝቀዣ ውስጥ እስከ 4-5 ቀናት ያቆዩ።",
    "ለረጅም ጊዜ ለማቆየት፡ የሽሮና የምስር ወጦችን በማቀዝቀዣ በረዶ ክፍል ውስጥ እስከ 30 ቀናት ያለ ምንም ንጥረ-ምግብ መጥፋት ማቆየት ይቻላል።",
    "ወጦችን እንደገና ሲያሞቁ በድስት ላይ በጥቂት ውሃ ወይም መረቅ በዝቅተኛ እሳት ላይ ያሞቁ፤ ማይክሮዌቭ ውስጥ ደጋግሞ ማፍላት ቫይታሚኖችን ያጠፋል።",
  ];

  const phases: CulinaryPhase[] = [
    {
      phaseNumber: 1,
      phaseNameEn: "Phase 1: Mise en Place & Enzyme Activation",
      phaseNameAmharic: "ምዕራፍ 1፡ ቅድመ-ዝግጅት እና ኢንዛይም ማንቃት",
      phasePurpose:
        "Ingredient sanitation, precise nutritional weighing, and biochemical bioavailability activation (phytase enzymatic hydrolysis or moisture tempering).",
      durationMinutes: prepTimeMinutes,
      heatLevel: isTonic ? "Low (50–80°C)" : "No Heat (Cold)",
      vessel: toolSet.vessel,
      stepsEn: phase1En,
      stepsAmharic: phase1Am,
      biochemicalTip: hasErsho
        ? "Ersho sourdough fermentation (Lactobacillus & Yeasts) lowers pH to 4.3, degrading antinutritional IP6 phytates and boosting bioavailable iron/zinc by 240%."
        : hasSprouting
        ? "Germination hydrolyzes flatulence-causing oligosaccharides while doubling free bioavailable Lysine and Threonine amino acids."
        : hasAscorbic
        ? "Ascorbic acid from fresh lemon reduces ferric iron (Fe3+) into absorbable ferrous iron (Fe2+)."
        : "Cold mise en place prevents premature lipid oxidation and preserves delicate antioxidant flavonoids.",
      checklistItems: [
        "Weighed all dry grains, legumes, and aromatics accurately (የግብዓት መጠን በትክክል መመዘን)",
        "Activated enzyme pathway (Ersho fermentation / seed milling / citrus prep) (ኢንዛይም ማንቃት)",
        "Sanitized cutting surfaces and prepared cooking vessels (ዕቃዎችን ማዘጋጀት)",
      ],
    },
    {
      phaseNumber: 2,
      phaseNameEn: "Phase 2: Thermal Processing & Bioactive Infusion",
      phaseNameAmharic: "ምዕራፍ 2፡ ሙቀት አያያዝ እና ማብሰል",
      phasePurpose:
        "Controlled thermal hydrolysis, carotenoid/polyphenol lipid-phase extraction, and deep Maillard reaction while preventing micronutrient denaturation.",
      durationMinutes: cookTimeMinutes,
      heatLevel: isTonic
        ? "No Heat (Cold)"
        : isTibs
        ? "Smoking Hot (200°C+)"
        : isPorridge
        ? "Medium-Low (80–100°C)"
        : "Medium (100–120°C)",
      vessel: toolSet.vessel,
      stepsEn: phase2En,
      stepsAmharic: phase2Am,
      biochemicalTip:
        "Simmering spices in healthy lipids extracts fat-soluble carotenoids, capsanthin, and polyphenols, tripling their intestinal bioavailability compared to raw consumption.",
      checklistItems: [
        "Monitored thermal threshold to prevent vitamin C and B-complex degradation (ሙቀቱን መቆጣጠር)",
        "Maintained continuous stirring to prevent starches from scorching (በደንብ ማማሰል)",
        "Infused finishing aromatics (Korarima/Mekelesha) in final 60 seconds (ቅመሞችን በሰዓቱ መጨመር)",
      ],
    },
    {
      phaseNumber: 3,
      phaseNameEn: "Phase 3: Plating Assembly & Kinetic Temperature Balancing",
      phaseNameAmharic: "ምዕራፍ 3፡ ማዕድ አቀራረብ እና ቅንብር",
      phasePurpose:
        "Chromatic aesthetic presentation, steam balance, portion partition, and cultural edible-utensil integration.",
      durationMinutes: 5,
      heatLevel: "No Heat (Cold)",
      vessel: "Handwoven straw Mesob or wide porcelain serving platter",
      stepsEn: phase3En,
      stepsAmharic: phase3Am,
      biochemicalTip:
        "The porous honeycombed eyes ('Ayn') of authentic fermented Teff Injera trap stews and gravies, ensuring each bite delivers an optimal balance of proteins, fiber, and micronutrients.",
      checklistItems: [
        "Unfurled fresh Teff Injera base with porous eyes facing upward (እንጀራውን በመሶብ ላይ ማንጠፍ)",
        "Arranged vibrant stews and condiments equidistant around perimeter (ወጦችን በክብ መደርደር)",
        "Added cooling garnishes (fresh chilies, Ayib curd, rosemary) (በቃሪያና በአይብ ማስዋብ)",
      ],
    },
    {
      phaseNumber: 4,
      phaseNameEn: "Phase 4: Preservation, Storage & Nutrient Retention",
      phaseNameAmharic: "ምዕራፍ 4፡ ማቆየት እና እንደገና ማሞቅ",
      phasePurpose:
        "Preventing pathogenic microbial proliferation, avoiding lipid rancidity, and safely reheating without nutrient degradation.",
      durationMinutes: 5,
      heatLevel: "Low (50–80°C)",
      vessel: "Airtight borosilicate glass containers & steam-reheating skillet",
      stepsEn: phase4En,
      stepsAmharic: phase4Am,
      biochemicalTip:
        "Reheating gently on a stovetop with broth avoids the localized thermal hotspots of high-power microwaves that break down thiamine (B1) and folate.",
      checklistItems: [
        "Allowed food to cool uncovered to room temperature before sealing (ከመክደን በፊት ማቀዝቀዝ)",
        "Stored in airtight borosilicate glass in refrigerator at 2–4°C (በመስታወት ዕቃ ማቀዝቀዣ ውስጥ ማስቀመጥ)",
        "Reheated only single serving gently on low stovetop flame (የሚበላውን መጠን ብቻ ቀስ ብሎ ማሞቅ)",
      ],
    },
  ];

  // Flat stepsEn and stepsAmharic for backward compatibility (comprehensive)
  const stepsEn: string[] = [
    ...phase1En,
    ...phase2En,
    ...phase3En,
  ];

  const stepsAmharic: string[] = [
    ...phase1Am,
    ...phase2Am,
    ...phase3Am,
  ];

  // ── CLINICAL & METABOLIC INSIGHT ───────────────────────────────────────────
  const clinicalImpact = {
    headline: `${healthIssue.titleEn} Optimization Protocol`,
    biochemicalMechanism: healthIssue.clinicalRationale,
    metabolicEffect: `Delivers ${proximate.energyKcal} kcal/serving (${nutrientsPerDay.proximate.energyKcal} kcal/day) on an as-eaten basis (${dryMatterAnalysis.energyKcalPer100gDry} kcal/100g on a 100% Dry Matter basis). Contains ${proximate.protein_g}g Protein (${dryMatterAnalysis.proteinGramsPer100gDry}g/100g DM) with ${aminoAcids.pdcaasEquivalentPct}% PDCAAS quality and ${proximate.dietaryFiber_g}g Dietary Fiber.`,
    culturalWisdom: healthIssue.culturalWisdom,
  };

  // ── RETRIEVE TOP MATCHING CATALOG DISHES ───────────────────────────────────
  const matchedCatalogDishes = findMatchingCatalogDishes(
    proximate.energyKcal,
    proximate.protein_g,
    proximate.fat_g,
    proximate.carbohydrate_g,
    proximate.dietaryFiber_g,
    activeIngredientIds,
    healthIssue.id,
    3
  );

  return {
    dietCode,
    dietName,
    dietNameAmharic,
    isInternationalOrHybrid: hasInternational,
    platterType: input.platterType,
    healthIssue,
    economicTier: input.economicTier,
    enzymeReaction: input.enzymeReaction,
    servingsPerDay,
    recipeItems,
    totalServingGrams,
    costs: {
      perServingETB: Math.round(totalCostPerServingETB),
      perDayETB: totalCostPerDayETB,
      perMonthETB: totalCostPerMonthETB,
    },
    nutrientsPerServing,
    nutrientsPerServingDryMatter,
    extendedNutrientsWet,
    extendedNutrientsDry,
    nutrientsPerDay,
    nutrientsPerMonth,
    dryMatterAnalysis,
    rdiAdequacyPct,
    deficiencyAdvisories,
    preparation: {
      prepTimeMinutes,
      cookTimeMinutes,
      totalActiveCookMinutes,
      difficultyLevel,
      difficultyAmharic,
      stepsEn,
      stepsAmharic,
      enzymeBioactiveTip,
      platingGuide,
      phases,
      toolSet,
      platingArchitecture,
      preservationGuide,
    },
    clinicalImpact,
    matchedCatalogDishes,
  };
}
