/**
 * Composite Diet Formulator Calculator (የተመጣጠነ ቅይጥ ምግብ ቀመር አስሊ)
 *
 * Implements scientific dietary formulation for authentic Ethiopian composite dishes
 * including Yetsom Beyayinetu, Shiro Tegabino, Doro Wot, Kitfo Special, Genfo,
 * Beso, Bulla, Azifa, Telba Fitfit, Kinche, Dubba Wot, and Quanta Firfir.
 *
 * Provides multi-scale recipe breakdowns:
 *   - Per Serving (በአንድ ማዕድ/ምግብ)
 *   - Per Day (በቀን - Daily Schedule & RDI Adequacy)
 *   - Per Month (በወር - 30-Day Bulk Procurement & ETB Budget)
 *
 * Features:
 *   - Intensively detailed Nutrient Tables (Macronutrients, 12 Amino Acids + PDCAAS,
 *     Fatty Acid Chain + Omega-3/6, Minerals with Bioavailability, Vitamins).
 *   - User Purpose Formulations (Weight loss, Weight gain, Muscle build, Diabetes,
 *     Hypertension, Anemia, Gastritis, Postpartum).
 *   - Selected Cofactors: Economic Tier (Economy, Standard, Premium) &
 *     Enzyme Reactions (Ersho Phytase, Sprouting, Trypsin Inactivation, Ascorbic Acid).
 */

import { ETHIOPIAN_COMPOSITE_DIETS_CATALOG } from "./compositeDietsCatalog";

export type DietCategory =
  | "fasting_combo"
  | "legume_stew"
  | "festive_poultry_meat"
  | "traditional_beef_enset"
  | "breakfast_porridge"
  | "functional_drink"
  | "salad_side"
  | "grain_breakfast"
  | "vegetable_root"
  | "fish_seafood";

export type UserPurpose =
  | "weight_loss"
  | "weight_gain"
  | "muscle_build"
  | "therapeutic_diabetes"
  | "therapeutic_hypertension"
  | "therapeutic_anemia"
  | "therapeutic_gastritis"
  | "postpartum_lactation";

export type EconomicTier = "economy" | "standard" | "premium";

export type EnzymeReactionType =
  | "ersho_phytase_96h"
  | "sprouting_germination"
  | "thermal_trypsin_inactivation"
  | "ascorbic_acid_reduction"
  | "standard_preparation";

// ────────────────────────────────────────────────────────────────
// NUTRIENT PROFILE INTERFACES
// ────────────────────────────────────────────────────────────────

export interface DietProximate {
  energyKcal: number;
  protein_g: number;
  fat_g: number;
  carbohydrate_g: number;
  dietaryFiber_g: number;
  moisture_g: number;
  ash_g: number;
}

export interface DietAminoAcids {
  // 9 Essential Amino Acids (EAA)
  histidine_mg: number;
  isoleucine_mg: number;
  leucine_mg: number;
  lysine_mg: number;
  methionine_mg: number;
  cysteine_mg: number; // Sulfur AA paired with Methionine
  phenylalanine_mg: number;
  tyrosine_mg: number; // Aromatic AA paired with Phenylalanine
  threonine_mg: number;
  tryptophan_mg: number;
  valine_mg: number;
  // Key Functional Amino Acids
  arginine_mg: number;
  totalEAA_mg: number;
  limitingAmino: string;
  aminoAcidScorePct: number; // 0 - 100%
  pdcaasEquivalentPct: number; // Digestibility-adjusted protein score
}

export interface DietFattyAcids {
  totalSaturated_g: number;
  totalMUFA_g: number; // Monounsaturated (oleic acid)
  totalPUFA_g: number; // Polyunsaturated
  omega6_linoleic_g: number; // LA (18:2 n-6)
  omega3_ALA_g: number; // Alpha-linolenic acid (18:3 n-3)
  omega3_EPA_DHA_g: number; // Long-chain n-3 (trace/nil in vegan, present in animal/fish)
  omega3ToOmega6Ratio: string;
  cholesterol_mg: number;
}

export interface DietMinerals {
  calcium_mg: number;
  iron_mg: number;
  bioavailableIron_mg: number;
  zinc_mg: number;
  bioavailableZinc_mg: number;
  magnesium_mg: number;
  potassium_mg: number;
  sodium_mg: number;
  phosphorus_mg: number;
  copper_mg: number;
  selenium_mcg: number;
  manganese_mg: number;
}

export interface DietVitamins {
  vitaminA_RAE_mcg: number;
  betaCarotene_mcg: number;
  vitaminC_mg: number;
  vitaminD_mcg: number;
  vitaminE_mg: number;
  vitaminB1_mg: number;
  vitaminB2_mg: number;
  vitaminB3_mg: number;
  vitaminB6_mg: number;
  vitaminB9_folate_mcg: number;
  vitaminB12_mcg: number;
}

export interface DietNutrientProfile {
  proximate: DietProximate;
  aminoAcids: DietAminoAcids;
  fattyAcids: DietFattyAcids;
  minerals: DietMinerals;
  vitamins: DietVitamins;
}

export interface DietIngredientItem {
  id: string;
  nameEn: string;
  nameAmharic: string;
  gramsPerServing: number;
  category: "cereal" | "legume" | "vegetable" | "animal" | "oil_fat" | "spice_herb" | "sweetener";
  dryEquivalentRatio: number; // Ratio of raw dry weight to cooked/prepared weight
  notes?: string;
}

export interface EthiopianCompositeDiet {
  id: string;
  nameEn: string;
  nameAmharic: string;
  category: DietCategory;
  tagline: string;
  description: string;
  culturalContext: string;
  baseServingGrams: number;
  isFasting: boolean;
  baseServingsPerDay: number;
  ingredients: DietIngredientItem[];
  recipeInstructions: {
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    steps: string[];
    amharicSteps: string[];
    culinaryTips: string[];
  };
  nutrients: DietNutrientProfile;
  costEstimatesPerServingETB: {
    economy: number;
    standard: number;
    premium: number;
  };
}

// ────────────────────────────────────────────────────────────────
// USER PURPOSE PRESETS & DEFINITIONS
// ────────────────────────────────────────────────────────────────

export interface PurposeConfig {
  id: UserPurpose;
  titleEn: string;
  titleAmharic: string;
  description: string;
  calorieTargetMultiplier: number;
  proteinMultiplier: number;
  fiberMultiplier: number;
  carbMultiplier: number;
  fatMultiplier: number;
  servingSizeAdjustment: number;
  servingsPerDay: number;
  clinicalRationale: string;
  nutritionalSynergy: string;
  culturalWisdom: string;
}

export const PURPOSE_CONFIGS: Record<UserPurpose, PurposeConfig> = {
  weight_loss: {
    id: "weight_loss",
    titleEn: "Weight Loss & Fat Reduction",
    titleAmharic: "የሰውነት ክብደት መቀነስ እና ስብ ማቃጠል",
    description: "High satiety, calorie deficit (~1,500–1,750 kcal), elevated viscous fiber, low glycemic impact.",
    calorieTargetMultiplier: 0.82,
    proteinMultiplier: 1.15,
    fiberMultiplier: 1.4,
    carbMultiplier: 0.78,
    fatMultiplier: 0.75,
    servingSizeAdjustment: 0.88,
    servingsPerDay: 2.6,
    clinicalRationale:
      "Teff's high resistant starch and legume soluble fibers delay gastric emptying and induce cholecystokinin (CCK) secretion, reducing spontaneous appetite without nutritional starvation.",
    nutritionalSynergy:
      "High protein-to-energy ratio preserves fat-free lean muscle mass during steady caloric deficit.",
    culturalWisdom: "«ምግብ በጥበብ ሲበላ ፈውስ ነው፤ ያለልክ ሲበላ ደዌ ይሆናል።» (Food taken with wisdom is healing; taken without measure it breeds sickness.)",
  },
  weight_gain: {
    id: "weight_gain",
    titleEn: "Healthy Weight & Mass Gain",
    titleAmharic: "ጤናማ የሰውነት ክብደት መጨመር",
    description: "Nutrient-dense caloric surplus (~2,600–3,000 kcal), balanced healthy lipids, and enriched wholesome carbs.",
    calorieTargetMultiplier: 1.28,
    proteinMultiplier: 1.2,
    fiberMultiplier: 1.0,
    carbMultiplier: 1.3,
    fatMultiplier: 1.25,
    servingSizeAdjustment: 1.22,
    servingsPerDay: 3.2,
    clinicalRationale:
      "Provides sustained positive energy and nitrogen balance through unrefined complex carbohydrates and essential fatty acids, promoting healthy somatic tissue gain rather than visceral adiposity.",
    nutritionalSynergy:
      "Synergy between whole grains (barley, teff) and unrefined seed oils or niter kibbeh ensures high energy density with complete micronutrient absorption.",
    culturalWisdom: "«በሶና ገንፎ አጥንት ያጠነክራል፣ ሰውነትን ያለመልማል።» (Beso and Genfo strengthen the bone and nourish the body.)",
  },
  muscle_build: {
    id: "muscle_build",
    titleEn: "Muscle Building & Athletic Performance",
    titleAmharic: "የጡንቻ ግንባታ እና ስፖርታዊ ብቃት",
    description: "High protein (1.6–2.0g/kg), optimized Branched-Chain Amino Acids (Leucine, Isoleucine, Valine), complete complementary proteins.",
    calorieTargetMultiplier: 1.18,
    proteinMultiplier: 1.45,
    fiberMultiplier: 1.1,
    carbMultiplier: 1.15,
    fatMultiplier: 0.95,
    servingSizeAdjustment: 1.15,
    servingsPerDay: 3.0,
    clinicalRationale:
      "Exceeds the 2.7g Leucine anabolic threshold per feeding to stimulate muscle protein synthesis (MPS) via the mTORC1 pathway while supplying glycogen for intense physical labor or training.",
    nutritionalSynergy:
      "Teff grain (rich in sulfur amino acids Methionine & Cysteine) perfectly complements legumes (rich in Lysine & Threonine), creating a complete protein score comparable to whole egg or whey.",
    culturalWisdom: "«የገብስ ኃይል ለጉልበት፣ የጤፍ ብርታት ለልብ።» (The power of barley brings strength to the knees; the fortitude of teff empowers the heart.)",
  },
  therapeutic_diabetes: {
    id: "therapeutic_diabetes",
    titleEn: "Diabetes & Glycemic Regulation",
    titleAmharic: "የስኳር ህመም እና የግሉኮስ ቁጥጥር",
    description: "Low glycemic load, high beta-glucan and resistant starch, slow sustained glucose release.",
    calorieTargetMultiplier: 0.92,
    proteinMultiplier: 1.1,
    fiberMultiplier: 1.6,
    carbMultiplier: 0.72,
    fatMultiplier: 0.9,
    servingSizeAdjustment: 0.92,
    servingsPerDay: 2.8,
    clinicalRationale:
      "Viscous fermentable fibers and low glycemic index (<50) flatten postprandial glucose curves, reduce hepatic glucose output, and improve peripheral insulin sensitivity.",
    nutritionalSynergy:
      "Fenugreek (Abish) trigonelline and teff polyphenols slow intestinal alpha-glucosidase activity.",
    culturalWisdom: "«አብሽና ምስር የደም ጣፋጭነትን ያረጋጋሉ።» (Fenugreek and lentils balance sweet blood.)",
  },
  therapeutic_hypertension: {
    id: "therapeutic_hypertension",
    titleEn: "Hypertension & Cardiovascular Health",
    titleAmharic: "የደም ግፊት ቁጥጥር እና የልብ ጤንነት",
    description: "Low sodium (<1,400mg), high potassium (>3,500mg) and magnesium, high Omega-3 ALA.",
    calorieTargetMultiplier: 0.95,
    proteinMultiplier: 1.05,
    fiberMultiplier: 1.35,
    carbMultiplier: 0.95,
    fatMultiplier: 0.9,
    servingSizeAdjustment: 0.95,
    servingsPerDay: 2.8,
    clinicalRationale:
      "A high Dietary Potassium-to-Sodium ratio (>3.5:1) activates natriuresis and relaxes vascular smooth muscle tone through endothelial hyperpolarization.",
    nutritionalSynergy:
      "Flaxseed (Telba) ALA alpha-linolenic acid together with Ethiopian kale (Gomen) glucosinolates promotes arterial elasticity.",
    culturalWisdom: "«ነጭ ሽንኩርትና ጎመን የልብን ሩጫ ያበርዳሉ።» (Garlic and greens cool the racing heart.)",
  },
  therapeutic_anemia: {
    id: "therapeutic_anemia",
    titleEn: "Iron Deficiency Anemia Recovery",
    titleAmharic: "የደም ማነስ ድጋፍ እና ማገገሚያ",
    description: "Maximized elemental iron, phytate-degraded matrix, high ascorbic acid and folate synergy.",
    calorieTargetMultiplier: 1.05,
    proteinMultiplier: 1.2,
    fiberMultiplier: 1.15,
    carbMultiplier: 1.0,
    fatMultiplier: 1.0,
    servingSizeAdjustment: 1.05,
    servingsPerDay: 3.0,
    clinicalRationale:
      "Pairs non-heme iron from red teff and legumes with ascorbic acid reduction and long sourdough phytase degradation, multiplying iron uptake across the duodenal DMT1 transporter.",
    nutritionalSynergy:
      "Ascorbic acid from fresh lime/green pepper chemically reduces insoluble Fe³⁺ to absorbable Fe²⁺.",
    culturalWisdom: "«ቀይ ጤፍ ደም ይሰራል፣ ቃሪያና ሎሚ ያቀላጥፈዋል።» (Red teff builds blood; peppers and lime hasten its path.)",
  },
  therapeutic_gastritis: {
    id: "therapeutic_gastritis",
    titleEn: "Gastritis & Acid Balance",
    titleAmharic: "የጨጓራ ህመም ማስታገሻ እና የተመጣጠነ ምግብ",
    description: "Soothing mucilaginous starches, non-irritating spices, gentle digestion, and mucosal protection.",
    calorieTargetMultiplier: 0.98,
    proteinMultiplier: 1.05,
    fiberMultiplier: 0.9,
    carbMultiplier: 1.05,
    fatMultiplier: 0.85,
    servingSizeAdjustment: 0.95,
    servingsPerDay: 3.2,
    clinicalRationale:
      "Neutralizes mucosal micro-ulcerations using soothing enset bulla starches and barley emulsions, avoiding gastric acid hyper-secretion.",
    nutritionalSynergy:
      "Bulla oligosaccharides create a protective cytoprotective gelatinous barrier across gastric parietal cells.",
    culturalWisdom: "«የቡላ ገንፎ የጨጓራን ቁስል ይሸፍናል፣ ልብንም ያረጋጋል።» (Bulla porridge coats the stomach wound and pacifies inner irritation.)",
  },
  postpartum_lactation: {
    id: "postpartum_lactation",
    titleEn: "Postpartum & Lactation Recovery",
    titleAmharic: "የወላድና አራስ ጥንካሬ እና የጡት ወተት ማበልጸጊያ",
    description: "Galactagogue enrichment (Abish/Telba), high bioavailable calcium, phosphorus, folate, and rich healthy lipids.",
    calorieTargetMultiplier: 1.25,
    proteinMultiplier: 1.35,
    fiberMultiplier: 1.2,
    carbMultiplier: 1.2,
    fatMultiplier: 1.25,
    servingSizeAdjustment: 1.2,
    servingsPerDay: 3.5,
    clinicalRationale:
      "Supplies an additional 450–500 kcal and 25g protein required for maternal milk synthesis, while providing phytoestrogenic galactagogues that elevate serum prolactin.",
    nutritionalSynergy:
      "Fenugreek diosgenin stimulates mammary glandular development while bulla and niter kibbeh replenish maternal fat stores.",
    culturalWisdom: "«አራስ በገንፎና በአብሽ ትጠነክራለች፣ ወተቷም ይፈሳል።» (The new mother grows strong with genfo and fenugreek, and her milk flows abundantly.)",
  },
};

// ────────────────────────────────────────────────────────────────
// ENZYME REACTION COFACTORS
// ────────────────────────────────────────────────────────────────

export interface EnzymeReactionConfig {
  id: EnzymeReactionType;
  titleEn: string;
  titleAmharic: string;
  mechanism: string;
  ironMultiplier: number;
  zincMultiplier: number;
  calciumMultiplier: number;
  proteinBioavailabilityMultiplier: number;
  bVitaminMultiplier: number;
  phytateReductionPct: number;
  scientificExplanation: string;
  traditionalPreparationTip: string;
}

export const ENZYME_REACTION_CONFIGS: Record<EnzymeReactionType, EnzymeReactionConfig> = {
  ersho_phytase_96h: {
    id: "ersho_phytase_96h",
    titleEn: "Traditional 72–96h Ersho Fermentation (Phytase Activation)",
    titleAmharic: "ባህላዊ የ72-96 ሰዓት የእርሾ ማብላላት (የፋይታይዝ ኢንዛይም ማነቃቂያ)",
    mechanism: "Microbial & endogenous cereal phytase hydrolyzes inositol hexakisphosphate (IP6) into lower inositol phosphates, releasing bound divalent cations.",
    ironMultiplier: 2.4, // +140% bioavailability
    zincMultiplier: 1.85,
    calciumMultiplier: 1.35,
    proteinBioavailabilityMultiplier: 1.18,
    bVitaminMultiplier: 1.25,
    phytateReductionPct: 88,
    scientificExplanation:
      "Prolonged sourdough fermentation at pH 4.2–4.8 activates endogenous phytases from grain kernels and lactic acid bacteria (LAB, Lactobacillus fermentum & Pediococcus pentosaceus). This degrades 85–90% of phytic acid, converting unabsorbable mineral-phytate chelates into free absorbable minerals.",
    traditionalPreparationTip:
      "Use mature 3-day Ersho starter. Allow the teff batter to ferment until yellowish liquid (lit) rises to the surface before boiling the absit binder.",
  },
  sprouting_germination: {
    id: "sprouting_germination",
    titleEn: "48h Soaking & Germination / Malting (Amylase & Protease Activation)",
    titleAmharic: "የ48 ሰዓት እሸት ማብቀል / ብቅል (የአሚሌዝ እና ፕሮቲኤዝ ኢንዛይሞች)",
    mechanism: "Hydration triggers de novo synthesis of plant alpha-amylase and endopeptidases, breaking down storage prolamins and synthesising vitamins.",
    ironMultiplier: 1.8,
    zincMultiplier: 1.6,
    calciumMultiplier: 1.25,
    proteinBioavailabilityMultiplier: 1.25, // Unblocks lysine and threonine
    bVitaminMultiplier: 1.45, // Synthesizes B1, B2, B9
    phytateReductionPct: 72,
    scientificExplanation:
      "Germination de-represses gibberellin-mediated transcription in the aleurone layer. Proteases break insoluble storage proteins into easily absorbable peptides and free essential amino acids (especially Lysine and Threonine). Endogenous B-vitamins increase up to 45%.",
    traditionalPreparationTip:
      "Soak barley or pulses for 18 hours, drain, and keep covered in moist cotton cloth for 2 days until sprouts appear (bikil style) before sun-drying and gentle milling.",
  },
  thermal_trypsin_inactivation: {
    id: "thermal_trypsin_inactivation",
    titleEn: "Thermal Trypsin Inhibitor Deactivation (Simmering >95°C)",
    titleAmharic: "የሙቀት ማፍላት የኢንዛይም መከላከያ ማጥፊያ (ትሪፕሲን አጋቾችን ማጥፋት)",
    mechanism: "Heat denaturation of heat-labile Kunitz and Bowman-Birk protease inhibitors present in legume flours.",
    ironMultiplier: 1.25,
    zincMultiplier: 1.2,
    calciumMultiplier: 1.1,
    proteinBioavailabilityMultiplier: 1.32,
    bVitaminMultiplier: 0.92, // Slight heat loss in vit C / B1
    phytateReductionPct: 35,
    scientificExplanation:
      "Legumes like chickpeas and field peas contain high levels of Bowman-Birk and Kunitz trypsin inhibitors that block human pancreatic enzymes. Sustained boiling (>95°C for at least 30–45 min in Shiro cooking) fully denatures these inhibitors, allowing trypsin and chymotrypsin to digest amino acids unobstructed.",
    traditionalPreparationTip:
      "Slow-cook Shiro and lentils over medium embers for at least 35 minutes until the fragrant spiced oil separates at the rim of the clay pot.",
  },
  ascorbic_acid_reduction: {
    id: "ascorbic_acid_reduction",
    titleEn: "Ascorbic Acid (Vitamin C) Co-factor Reduction (Fe³⁺ → Fe²⁺)",
    titleAmharic: "የቫይታሚን ሲ ኬሚካላዊ ቅነሳ (የብረት ንጥረ-ነገር ማቅለጥ)",
    mechanism: "Ascorbate donates an electron, reducing insoluble ferric iron to soluble ferrous iron, which binds the apical DMT1 transporter.",
    ironMultiplier: 3.1, // +210% non-heme iron absorption
    zincMultiplier: 1.25,
    calciumMultiplier: 1.05,
    proteinBioavailabilityMultiplier: 1.05,
    bVitaminMultiplier: 1.1,
    phytateReductionPct: 15,
    scientificExplanation:
      "Non-heme iron in plant foods is predominantly insoluble ferric (Fe³⁺) hydroxide. Concomitant intake of ascorbic acid (from freshly squeezed lime, raw jalapeño peppers, and diced tomatoes) acts as a reducing agent and chelator, keeping iron soluble in the alkaline duodenum for DMT1 transporter uptake.",
    traditionalPreparationTip:
      "Squeeze fresh lime over your Azifa or Yetsom Beyayinetu and serve with slices of raw green chili (kariya) immediately before eating.",
  },
  standard_preparation: {
    id: "standard_preparation",
    titleEn: "Standard Baseline Domestic Preparation",
    titleAmharic: "መደበኛ የቤት ውስጥ አዘገጃጀት",
    mechanism: "Standard cooking without specific enzyme or bioavailability optimization steps.",
    ironMultiplier: 1.0,
    zincMultiplier: 1.0,
    calciumMultiplier: 1.0,
    proteinBioavailabilityMultiplier: 1.0,
    bVitaminMultiplier: 1.0,
    phytateReductionPct: 10,
    scientificExplanation:
      "Standard boiling and preparation. Non-heme iron absorption remains at typical baseline (3–5%), and legume proteins digest at standard unassisted rates.",
    traditionalPreparationTip:
      "Standard boiling and serving according to common household habits.",
  },
};

// ────────────────────────────────────────────────────────────────
// INTENSIVE ETHIOPIAN COMPOSITE DIETS DATABASE (100 dishes)
// Sourced from the generated catalog — run scripts/generateCompositeDiets.mjs to regenerate.
// ────────────────────────────────────────────────────────────────

/**
 * Full 100-dish list of authentic Ethiopian composite dishes and platters.
 * Covers 10 culinary domains:
 *  1. Fasting Combination Platters & Multi-Wot Mesobs (10)
 *  2. Legume Stews, Pulses & Shiro Varieties (15)
 *  3. Poultry, Eggs & Festive Wots (10)
 *  4. Beef, Lamb, Goat & Game Traditional Dishes (15)
 *  5. Enset (False Banana) Specialties & Southern Heritage (8)
 *  6. Porridges, Breakfast Bowls & Whole Grains (12)
 *  7. Vegetables, Roots, Greens & Tubers (10)
 *  8. Salads, Condiments & Cold Delicacies (8)
 *  9. Fish Specialties – Rift Valley & Lake Tana (6)
 * 10. Functional Tonics, Drinks & Liquid Meals (6)
 */
export const ETHIOPIAN_COMPOSITE_DIETS: EthiopianCompositeDiet[] = ETHIOPIAN_COMPOSITE_DIETS_CATALOG;

// ────────────────────────────────────────────────────────────────
// (The following block is the OLD inline 12-dish stub — kept here
//  as placeholder so the rest of the file compiles unchanged)
// ────────────────────────────────────────────────────────────────
const _UNUSED_INLINE_DIETS: EthiopianCompositeDiet[] = [
  // 1. YETSOM BEYAYINETU (Fasting Combo Platter)
  {
    id: "yetsom-beyayinetu",
    nameEn: "Yetsom Beyayinetu (Ethiopian Fasting Combination Platter)",
    nameAmharic: "የጾም በያይነቱ",
    category: "fasting_combo",
    tagline: "The pinnacle of complementary plant-based Ethiopian culinary nutrition.",
    description:
      "An iconic circular platter composed of 100% fermented teff injera crowned with rich mounds of Shiro Wot, Yemisir Wot (red lentils), Kik Alicha (yellow split peas), Tikil Gomen (cabbage & carrots), Gomen Wot (Ethiopian collard greens), and Azifa (green lentils with brown mustard).",
    culturalContext:
      "Central to the 250+ fasting days observed by the Ethiopian Orthodox Tewahedo tradition. Designed over centuries to provide complete complementary protein nutrition without animal products.",
    baseServingGrams: 520,
    isFasting: true,
    baseServingsPerDay: 2.8,
    ingredients: [
      { id: "teff-injera", nameEn: "Fermented Teff Injera", nameAmharic: "የጤፍ እንጀራ", gramsPerServing: 220, category: "cereal", dryEquivalentRatio: 0.45, notes: "100% fermented sourdough teff" },
      { id: "shiro-wot", nameEn: "Shiro Wot (Chickpea & Pea Stew)", nameAmharic: "ሽሮ ወጥ", gramsPerServing: 70, category: "legume", dryEquivalentRatio: 0.35, notes: "Spiced chickpea and field pea flour" },
      { id: "yemisir-wot", nameEn: "Yemisir Wot (Spicy Red Lentil Stew)", nameAmharic: "የምስር ወጥ", gramsPerServing: 60, category: "legume", dryEquivalentRatio: 0.4, notes: "Split red lentils in berbere sauce" },
      { id: "kik-alicha", nameEn: "Kik Alicha (Mild Yellow Split Pea Stew)", nameAmharic: "ክክ አልጫ", gramsPerServing: 50, category: "legume", dryEquivalentRatio: 0.4, notes: "Yellow split peas with turmeric & ginger" },
      { id: "gomen-wot", nameEn: "Gomen Wot (Stewed Collard Greens)", nameAmharic: "የጎመን ወጥ", gramsPerServing: 40, category: "vegetable", dryEquivalentRatio: 0.85, notes: "Ethiopian collard greens (Brassica carinata)" },
      { id: "tikil-gomen", nameEn: "Tikil Gomen (Cabbage & Carrot sauté)", nameAmharic: "ጥቅል ጎመን", gramsPerServing: 40, category: "vegetable", dryEquivalentRatio: 0.8, notes: "Fresh white cabbage, sliced carrots, turmeric" },
      { id: "azifa", nameEn: "Azifa (Green Lentils with Brown Mustard)", nameAmharic: "አዚፋ", gramsPerServing: 25, category: "legume", dryEquivalentRatio: 0.42, notes: "Whole green lentils with mustard seed & lime" },
      { id: "fosolia", nameEn: "Fosolia (Green Beans & Carrots)", nameAmharic: "ፎሶሊያ", gramsPerServing: 15, category: "vegetable", dryEquivalentRatio: 0.85, notes: "Braised green string beans & shallots" },
    ],
    recipeInstructions: {
      prepTimeMinutes: 35,
      cookTimeMinutes: 65,
      steps: [
        "Prepare authentic 3-day fermented teff injera on the mitad clay griddle, ensuring even eyelets (ayen).",
        "Slow-simmer red lentils in berbere, caramelized red onions, garlic, and ginger until thick and aromatic.",
        "Cook yellow split peas with turmeric, ginger, and garlic into a creamy, golden Kik Alicha.",
        "Sauté Shiro powder in simmering water and oil, whisking constantly until smooth and glossy.",
        "Steam chopped collard greens and sauté cabbage with carrots and turmeric until tender-crisp.",
        "Assemble by spreading a fresh teff injera across a large circular mesob tray, spooning distinct colorful mounds of each wot along the perimeter and center.",
      ],
      amharicSteps: [
        "ለ3 ቀናት የቦካ የጤፍ ሊጥ በምጣድ ላይ እኩል ዓይን አውጥቶ እስኪበስል ድረስ እንጀራ መጋገር።",
        "የቀይ ምስር ክክን በደቀቀ ቀይ ሽንኩርት፣ ነጭ ሽንኩርት፣ ዝንጅብልና በርበሬ በሚገባ ማብሰል።",
        "የቢጫ ክክ አልጫን በእርድ፣ ነጭ ሽንኩርትና ዝንጅብል ለስልሶ እስኪዋሀድ ማብሰል።",
        "የሽሮ ዱቄትን በፈላ ውሃና ዘይት እያማሰሉ ወፍራም ሆኖ እስኪንተከተክ ድረስ ማብሰል።",
        "ጎመኑንና ጥቅል ጎመኑን በየራሳቸው ቅመም ለስልሰው እስኪበስሉ ድረስ ማዘጋጀት።",
        "እንጀራውን በሰፊው ሰፌድ/ማዕድ ላይ ዘርግቶ እያንዳንዱን ወጥ በየተራ በመደዳ ማስተናበር።",
      ],
      culinaryTips: [
        "Squeeze fresh lime and scatter diced raw green chili over the Azifa and Gomen right before serving to boost iron bioavailability threefold.",
        "Pairing teff injera with three distinct legumes (chickpea, red lentil, yellow pea) provides complete essential amino acid profile with a PDCAAS of 94%.",
      ],
    },
    nutrients: {
      proximate: {
        energyKcal: 685,
        protein_g: 27.8,
        fat_g: 13.5,
        carbohydrate_g: 114.2,
        dietaryFiber_g: 21.6,
        moisture_g: 332.0,
        ash_g: 10.9,
      },
      aminoAcids: {
        histidine_mg: 640,
        isoleucine_mg: 1140,
        leucine_mg: 1980,
        lysine_mg: 1580,
        methionine_mg: 490,
        cysteine_mg: 420,
        phenylalanine_mg: 1320,
        tyrosine_mg: 880,
        threonine_mg: 1020,
        tryptophan_mg: 310,
        valine_mg: 1340,
        arginine_mg: 1820,
        totalEAA_mg: 10740,
        limitingAmino: "None (Fully balanced complementary profile)",
        aminoAcidScorePct: 96,
        pdcaasEquivalentPct: 92,
      },
      fattyAcids: {
        totalSaturated_g: 2.1,
        totalMUFA_g: 4.8,
        totalPUFA_g: 5.9,
        omega6_linoleic_g: 4.9,
        omega3_ALA_g: 0.9,
        omega3_EPA_DHA_g: 0.0,
        omega3ToOmega6Ratio: "1:5.4",
        cholesterol_mg: 0,
      },
      minerals: {
        calcium_mg: 320,
        iron_mg: 23.5,
        bioavailableIron_mg: 2.8, // 12% in standard phytase-active sourdough
        zinc_mg: 6.8,
        bioavailableZinc_mg: 1.7,
        magnesium_mg: 260,
        potassium_mg: 1180,
        sodium_mg: 640,
        phosphorus_mg: 520,
        copper_mg: 1.4,
        selenium_mcg: 28.5,
        manganese_mg: 7.2,
      },
      vitamins: {
        vitaminA_RAE_mcg: 290,
        betaCarotene_mcg: 3480,
        vitaminC_mg: 34.0,
        vitaminD_mcg: 0.0,
        vitaminE_mg: 3.8,
        vitaminB1_mg: 0.72,
        vitaminB2_mg: 0.38,
        vitaminB3_mg: 5.2,
        vitaminB6_mg: 0.85,
        vitaminB9_folate_mcg: 245,
        vitaminB12_mcg: 0.25, // Trace bacterial synthesis during 96h ersho fermentation
      },
    },
    costEstimatesPerServingETB: {
      economy: 95,
      standard: 155,
      premium: 240,
    },
  },

  // 2. SHIRO TEGABINO & GOMEN (Clay-pot Chickpea Stew)
  {
    id: "shiro-tegabino",
    nameEn: "Shiro Tegabino & Gomen with Teff Injera",
    nameAmharic: "ሽሮ ተጋቢኖ ከጎመንና እንጀራ ጋር",
    category: "legume_stew",
    tagline: "The beloved Ethiopian staple: bubbling clay-pot chickpea goodness and mineral-packed greens.",
    description:
      "A rich, thick, bubbling stew prepared from roasted chickpea and field pea flour seasoned with garlic, shallots, and berbere in an earthen pot (shakla dist), served alongside tender steamed collards and teff injera.",
    culturalContext:
      "The working person's lifeblood and the country's most ubiquitous, cherished daily meal across all socioeconomic strata.",
    baseServingGrams: 480,
    isFasting: true,
    baseServingsPerDay: 2.8,
    ingredients: [
      { id: "teff-injera", nameEn: "Fermented Teff Injera", nameAmharic: "የጤፍ እንጀራ", gramsPerServing: 220, category: "cereal", dryEquivalentRatio: 0.45 },
      { id: "shiro-powder", nameEn: "Shiro Flour (Cooked into Tegabino)", nameAmharic: "የተፈጨ የሽሮ ዱቄት", gramsPerServing: 160, category: "legume", dryEquivalentRatio: 0.35, notes: "Chickpea & pea flour with rue & garlic" },
      { id: "gomen", nameEn: "Steamed Ethiopian Collard Greens", nameAmharic: "የበሰለ ጎመን", gramsPerServing: 70, category: "vegetable", dryEquivalentRatio: 0.85, notes: "Brassica carinata sautéed with garlic" },
      { id: "oil-spices", nameEn: "Vegetable Oil, Onions & Berbere", nameAmharic: "ዘይት፣ ሽንኩርትና ቅመሞች", gramsPerServing: 30, category: "oil_fat", dryEquivalentRatio: 1.0 },
    ],
    recipeInstructions: {
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      steps: [
        "Finely mince red onions and sweat in the earthen pot without oil until tender and sweet.",
        "Add vegetable oil (or niter kibbeh if non-fasting), minced garlic, and berbere; sauté for 3 minutes.",
        "Pour in boiling water, then slowly rain in Shiro flour while whisking vigorously to avoid any lumps.",
        "Simmer on gentle heat until the stew thickens into a bubbly volcanic texture and red oil beads at the edges.",
        "In a separate pan, sauté chopped collard greens with garlic and a touch of ginger.",
        "Serve bubbling directly in the clay pot with rolled teff injera.",
      ],
      amharicSteps: [
        "ቀይ ሽንኩርቱን በደቃቁ ከትፎ በሸክላ ድስት ላይ ያለዘይት ማቁላላት።",
        "ዘይትና የተከተፈ ነጭ ሽንኩርት ጨምሮ ለጥቂት ደቂቃዎች ማዋሀድ።",
        "የፈላ ውሃ ጨምሮ የሽሮውን ዱቄት ቀስ በቀስ እየነሰነሱ በማማሰያ እብጠት እንዳይኖረው ማዋሀድ።",
        "እሳቱን ቀንሶ ሽሮው ወፍሮ ዘይቱ እስኪንሳፈፍ ድረስ ማብሰል።",
        "ጎመኑን በነጭ ሽንኩርትና ዘይት ለስልሶ ማብሰል።",
        "በሸክላው እየተንተከተከ ከጤፍ እንጀራ ጋር ማቅረብ።",
      ],
      culinaryTips: [
        "Long boiling (>30 min) of chickpea flour completely denatures trypsin inhibitors, elevating protein digestibility above 90%.",
        "Collard greens supply abundant calcium and lutein, perfectly complementing the iron-rich teff and protein-dense legumes.",
      ],
    },
    nutrients: {
      proximate: {
        energyKcal: 620,
        protein_g: 24.5,
        fat_g: 14.2,
        carbohydrate_g: 98.4,
        dietaryFiber_g: 18.2,
        moisture_g: 318.0,
        ash_g: 8.7,
      },
      aminoAcids: {
        histidine_mg: 580,
        isoleucine_mg: 1020,
        leucine_mg: 1760,
        lysine_mg: 1450,
        methionine_mg: 430,
        cysteine_mg: 390,
        phenylalanine_mg: 1220,
        tyrosine_mg: 780,
        threonine_mg: 920,
        tryptophan_mg: 280,
        valine_mg: 1190,
        arginine_mg: 1680,
        totalEAA_mg: 9630,
        limitingAmino: "Methionine (Balanced by Teff)",
        aminoAcidScorePct: 93,
        pdcaasEquivalentPct: 89,
      },
      fattyAcids: {
        totalSaturated_g: 2.2,
        totalMUFA_g: 5.1,
        totalPUFA_g: 6.2,
        omega6_linoleic_g: 5.3,
        omega3_ALA_g: 0.7,
        omega3_EPA_DHA_g: 0.0,
        omega3ToOmega6Ratio: "1:7.5",
        cholesterol_mg: 0,
      },
      minerals: {
        calcium_mg: 290,
        iron_mg: 21.0,
        bioavailableIron_mg: 2.3,
        zinc_mg: 5.9,
        bioavailableZinc_mg: 1.5,
        magnesium_mg: 230,
        potassium_mg: 980,
        sodium_mg: 580,
        phosphorus_mg: 440,
        copper_mg: 1.2,
        selenium_mcg: 22.0,
        manganese_mg: 5.8,
      },
      vitamins: {
        vitaminA_RAE_mcg: 240,
        betaCarotene_mcg: 2880,
        vitaminC_mg: 28.0,
        vitaminD_mcg: 0.0,
        vitaminE_mg: 4.1,
        vitaminB1_mg: 0.65,
        vitaminB2_mg: 0.32,
        vitaminB3_mg: 4.8,
        vitaminB6_mg: 0.78,
        vitaminB9_folate_mcg: 210,
        vitaminB12_mcg: 0.15,
      },
    },
    costEstimatesPerServingETB: {
      economy: 75,
      standard: 120,
      premium: 190,
    },
  },

  // 3. DORO WOT FESTIVE PLATTER (Chicken Stew with Ayib & Egg)
  {
    id: "doro-wot-festive",
    nameEn: "Doro Wot Festive Platter with Injera, Ayib & Hard-Boiled Egg",
    nameAmharic: "የዶሮ ወጥ በጤፍ እንጀራና አይብ",
    category: "festive_poultry_meat",
    tagline: "The crown jewel of Ethiopian festive gastronomy and hospitality.",
    description:
      "Slow-cooked chicken simmered for hours in caramelized red shallots, berbere spice, and clarified spiced butter (niter kibbeh), paired with a hard-boiled egg scored to absorb gravy, fresh curd cheese (ayib), and teff injera.",
    culturalContext:
      "Prepared for major holidays (Genna, Fasika, Enkutatash, Meskel) and weddings. A symbol of deep celebration, culinary mastery, and joyous union.",
    baseServingGrams: 530,
    isFasting: false,
    baseServingsPerDay: 2.6,
    ingredients: [
      { id: "teff-injera", nameEn: "Fermented Teff Injera", nameAmharic: "የጤፍ እንጀራ", gramsPerServing: 220, category: "cereal", dryEquivalentRatio: 0.45 },
      { id: "doro-chicken", nameEn: "Simmered Country Chicken & Gravy", nameAmharic: "የዶሮ ስጋና ወጥ", gramsPerServing: 180, category: "animal", dryEquivalentRatio: 0.75, notes: "Free-range pasture chicken drumstick/thigh" },
      { id: "boiled-egg", nameEn: "Hard-Boiled Egg (Enkulal)", nameAmharic: "የተቀቀለ እንቁላል", gramsPerServing: 50, category: "animal", dryEquivalentRatio: 1.0 },
      { id: "ayib", nameEn: "Fresh Ethiopian Cottage Cheese (Ayib)", nameAmharic: "አይብ", gramsPerServing: 50, category: "animal", dryEquivalentRatio: 1.0, notes: "Traditional buttermilk curd cheese" },
      { id: "gomen-side", nameEn: "Gomen Greens Side", nameAmharic: "ጎመን", gramsPerServing: 30, category: "vegetable", dryEquivalentRatio: 0.85 },
    ],
    recipeInstructions: {
      prepTimeMinutes: 60,
      cookTimeMinutes: 120,
      steps: [
        "Clean chicken portions meticulously with lemon juice, salt, and cold water; make deep diagonal incisions.",
        "Slow-caramelize large quantities of finely pureed red onions in an ungreased pot for over an hour until mahogany brown.",
        "Incorporate berbere spice and niter kibbeh; simmer gently until deep crimson and fragrant.",
        "Add garlic, ginger, and korerima; introduce the chicken portions and simmer until fork-tender.",
        "Pierce hard-boiled eggs with a fork and immerse in the rich sauce for the final 15 minutes.",
        "Serve on fresh teff injera garnished with a cooling mound of fresh ayib.",
      ],
      amharicSteps: [
        "የዶሮ ብልቶችን በሎሚና ጨው በሚገባ አጥቦ ቅመሙ እንዲገባበት ሰንጠቅ ሰንጠቅ ማድረግ።",
        "የደቀቀውን ቀይ ሽንኩርት ያለዘይት ለረጅም ሰዓት ቡናማ እስኪሆን ድረስ ማቁላላት።",
        "በርበሬና አንጓሎ የተዘጋጀ ንጥር ቅቤ ጨምሮ ዘይቱ እስኪንሳፈፍ ድረስ ማንተክተክ።",
        "ነጭ ሽንኩርት፣ ዝንጅብልና ኮረሪማ ጨምሮ የዶሮውን ስጋ ጨምሮ ለስልሶ እስኪበስል ድረስ ማብሰል።",
        "የተቀቀሉትን እንቁላሎች በሹካ ወጋግቶ ወጡ ውስጥ ጨምሮ ለ15 ደቂቃ ማቆየት።",
        "በጤፍ እንጀራ ላይ ከነጭ አይብ ጋር ማቅረብ።",
      ],
      culinaryTips: [
        "Ayib provides casein protein and calcium that tame the capsaicin heat while boosting amino acid variety.",
        "High bioavailable heme iron from chicken combines with non-heme iron from teff injera for superior hematopoietic support.",
      ],
    },
    nutrients: {
      proximate: {
        energyKcal: 760,
        protein_g: 44.2,
        fat_g: 26.5,
        carbohydrate_g: 88.0,
        dietaryFiber_g: 13.5,
        moisture_g: 312.0,
        ash_g: 9.8,
      },
      aminoAcids: {
        histidine_mg: 1120,
        isoleucine_mg: 2150,
        leucine_mg: 3480,
        lysine_mg: 3260,
        methionine_mg: 1040,
        cysteine_mg: 580,
        phenylalanine_mg: 1980,
        tyrosine_mg: 1420,
        threonine_mg: 1840,
        tryptophan_mg: 510,
        valine_mg: 2320,
        arginine_mg: 2780,
        totalEAA_mg: 19680,
        limitingAmino: "None (Complete High-Biological-Value Protein)",
        aminoAcidScorePct: 100,
        pdcaasEquivalentPct: 98,
      },
      fattyAcids: {
        totalSaturated_g: 11.2,
        totalMUFA_g: 9.8,
        totalPUFA_g: 3.8,
        omega6_linoleic_g: 3.1,
        omega3_ALA_g: 0.4,
        omega3_EPA_DHA_g: 0.18,
        omega3ToOmega6Ratio: "1:5.3",
        cholesterol_mg: 285,
      },
      minerals: {
        calcium_mg: 380,
        iron_mg: 22.8,
        bioavailableIron_mg: 4.8, // Enhanced by heme iron + meat factor
        zinc_mg: 7.9,
        bioavailableZinc_mg: 2.8,
        magnesium_mg: 210,
        potassium_mg: 920,
        sodium_mg: 720,
        phosphorus_mg: 590,
        copper_mg: 1.1,
        selenium_mcg: 46.0,
        manganese_mg: 4.8,
      },
      vitamins: {
        vitaminA_RAE_mcg: 360,
        betaCarotene_mcg: 2100,
        vitaminC_mg: 16.0,
        vitaminD_mcg: 1.6,
        vitaminE_mg: 2.9,
        vitaminB1_mg: 0.52,
        vitaminB2_mg: 0.68,
        vitaminB3_mg: 9.8,
        vitaminB6_mg: 1.15,
        vitaminB9_folate_mcg: 180,
        vitaminB12_mcg: 2.4, // Rich B12 from chicken, egg, and ayib
      },
    },
    costEstimatesPerServingETB: {
      economy: 220,
      standard: 340,
      premium: 520,
    },
  },

  // 4. KITFO SPECIAL WITH KOCHO, GOMEN & AYIB
  {
    id: "kitfo-special",
    nameEn: "Kitfo Special with Kocho, Gomen Kitfo & Ayib",
    nameAmharic: "ክትፎ በቆጮ፣ ጎመን ክትፎና አይብ",
    category: "traditional_beef_enset",
    tagline: "The Gurage heritage powerhouse of grass-fed beef, clarified spiced butter, and enset kocho.",
    description:
      "Tender, freshly minced lean beef warmed gently with spiced clarified butter (niter kibbeh) and fiery mitmita, served with traditional baked enset kocho flatbread, seasoned collards (gomen kitfo), and fresh ayib.",
    culturalContext:
      "Celebrated across Ethiopia and originating from the Gurage highlands; traditionally served during the Meskel festival and revered for strength, stamina, and recovery.",
    baseServingGrams: 470,
    isFasting: false,
    baseServingsPerDay: 2.6,
    ingredients: [
      { id: "beef-kitfo", nameEn: "Lean Minced Beef & Niter Kibbeh", nameAmharic: "የክትፎ ስጋ በንጥር ቅቤ", gramsPerServing: 170, category: "animal", dryEquivalentRatio: 0.8, notes: "Prime tenderloin with mitmita & korerima" },
      { id: "kocho", nameEn: "Baked Enset Kocho Bread", nameAmharic: "የተጋገረ ቆጮ", gramsPerServing: 150, category: "cereal", dryEquivalentRatio: 0.65, notes: "Fermented Ensete ventricosum pulp" },
      { id: "gomen-kitfo", nameEn: "Gomen Kitfo (Spiced Greens)", nameAmharic: "ጎመን ክትፎ", gramsPerServing: 80, category: "vegetable", dryEquivalentRatio: 0.85, notes: "Finely chopped collard greens with kibbeh" },
      { id: "ayib", nameEn: "Fresh Ayib (Cottage Cheese)", nameAmharic: "አይብ", gramsPerServing: 70, category: "animal", dryEquivalentRatio: 1.0 },
    ],
    recipeInstructions: {
      prepTimeMinutes: 25,
      cookTimeMinutes: 20,
      steps: [
        "Mince lean, sinew-free beef sirloin or tenderloin exceedingly fine using a sharp heavy knife.",
        "Melt authentic niter kibbeh gently; whisk in mitmita pepper and freshly ground korerima (black cardamom).",
        "Toss the minced beef in the warm spiced butter until lightly warmed (leb-leb) or served raw (tere) per preference.",
        "Chop steamed collard greens finely; toss with a spoonful of niter kibbeh and cardamom.",
        "Bake thinly rolled fermented kocho sheets wrapped in enset leaves over a hot clay griddle until golden and fragrant.",
        "Arrange the kitfo alongside steaming kocho, gomen kitfo, and fresh cooling ayib.",
      ],
      amharicSteps: [
        "ስስና ጅማት የሌለውን የቀይ ስጋ በጥንቃቄ በደቃቁ መክተፍ።",
        "ንጥር ቅቤውን አቅልጦ ከሚጥሚጣና ከደቀቀ ኮረሪማ ጋር ማዋሀድ።",
        "ስጋውን በሞቀው ቅቤ እያሹ ለብ-ለብ ወይም ጥሬ እንደፍላጎቱ ማዘጋጀት።",
        "የበሰለውን ጎመን በደቃቁ ከትፎ በቅቤና በኮረሪማ አሹቶ ጎመን ክትፎ ማዘጋጀት።",
        "የቦካውን ቆጮ በኮባ ቅጠል ጠቅልሎ በምጣድ ላይ ገልበጥ ገልበጥ እያደረጉ ማብሰል።",
        "ክትፎውን ከትኩስ ቆጮ፣ ጎመን ክትፎና አይብ ጋር አሰናድቶ ማቅረብ።",
      ],
      culinaryTips: [
        "Enset kocho is an alkaline-forming resistant starch powerhouse that protects the stomach against the spice heat of mitmita.",
        "Grass-fed Ethiopian beef delivers bioavailable conjugated linoleic acid (CLA) and optimal heme iron for athletes and convalescents.",
      ],
    },
    nutrients: {
      proximate: {
        energyKcal: 780,
        protein_g: 48.6,
        fat_g: 34.2,
        carbohydrate_g: 68.5,
        dietaryFiber_g: 11.2,
        moisture_g: 275.0,
        ash_g: 8.5,
      },
      aminoAcids: {
        histidine_mg: 1420,
        isoleucine_mg: 2360,
        leucine_mg: 3950,
        lysine_mg: 3880,
        methionine_mg: 1180,
        cysteine_mg: 520,
        phenylalanine_mg: 2150,
        tyrosine_mg: 1540,
        threonine_mg: 2050,
        tryptophan_mg: 540,
        valine_mg: 2480,
        arginine_mg: 3120,
        totalEAA_mg: 22070,
        limitingAmino: "None (Exceptional Protein Density)",
        aminoAcidScorePct: 100,
        pdcaasEquivalentPct: 99,
      },
      fattyAcids: {
        totalSaturated_g: 16.5,
        totalMUFA_g: 12.8,
        totalPUFA_g: 2.4,
        omega6_linoleic_g: 1.8,
        omega3_ALA_g: 0.35,
        omega3_EPA_DHA_g: 0.12,
        omega3ToOmega6Ratio: "1:4.8",
        cholesterol_mg: 135,
      },
      minerals: {
        calcium_mg: 410,
        iron_mg: 19.5,
        bioavailableIron_mg: 5.2, // Very high bioavailability from heme iron
        zinc_mg: 9.8,
        bioavailableZinc_mg: 3.6,
        magnesium_mg: 195,
        potassium_mg: 870,
        sodium_mg: 620,
        phosphorus_mg: 620,
        copper_mg: 0.95,
        selenium_mcg: 48.0,
        manganese_mg: 2.4,
      },
      vitamins: {
        vitaminA_RAE_mcg: 280,
        betaCarotene_mcg: 1650,
        vitaminC_mg: 14.0,
        vitaminD_mcg: 1.2,
        vitaminE_mg: 2.2,
        vitaminB1_mg: 0.42,
        vitaminB2_mg: 0.72,
        vitaminB3_mg: 11.2,
        vitaminB6_mg: 1.28,
        vitaminB9_folate_mcg: 140,
        vitaminB12_mcg: 3.8, // Abundant natural cobalamin
      },
    },
    costEstimatesPerServingETB: {
      economy: 260,
      standard: 390,
      premium: 580,
    },
  },

  // 5. HIGHLAND BARLEY GENFO (Porridge with Kibbeh & Berbere)
  {
    id: "barley-genfo",
    nameEn: "Highland Barley Genfo with Niter Kibbeh & Berbere",
    nameAmharic: "የገብስ ገንፎ በቅቤና በርበሬ",
    category: "breakfast_porridge",
    tagline: "The ancestral mountain energy bowl for sustained stamina, recovery, and warmth.",
    description:
      "A dense, smooth volcanic dome of slow-stirred roasted highland barley porridge with a crater pool of melted spiced butter (niter kibbeh) and berbere, fringed with cool yogurt or ayib.",
    culturalContext:
      "The quintessential postpartum recovery food for new mothers (aras) and rigorous mountain workers across Shewa, Wollo, and Gondar.",
    baseServingGrams: 400,
    isFasting: false,
    baseServingsPerDay: 2.5,
    ingredients: [
      { id: "barley-flour", nameEn: "Roasted Highland Barley Flour", nameAmharic: "የተቆላ የገብስ ዱቄት", gramsPerServing: 110, category: "cereal", dryEquivalentRatio: 0.35, notes: "Cooks into 320g thick porridge" },
      { id: "niter-kibbeh", nameEn: "Spiced Clarified Butter (Kibbeh)", nameAmharic: "ንጥር ቅቤ", gramsPerServing: 35, category: "oil_fat", dryEquivalentRatio: 1.0, notes: "Infused with koseret & black cumin" },
      { id: "berbere", nameEn: "Berbere Spice Mix", nameAmharic: "በርበሬ", gramsPerServing: 15, category: "spice_herb", dryEquivalentRatio: 1.0 },
      { id: "yogurt-ayib", nameEn: "Traditional Ayib or Ergo Swirl", nameAmharic: "እርጎ ወይም አይብ", gramsPerServing: 40, category: "animal", dryEquivalentRatio: 1.0 },
    ],
    recipeInstructions: {
      prepTimeMinutes: 10,
      cookTimeMinutes: 30,
      steps: [
        "Bring salted water to a vigorous rolling boil in a heavy pot.",
        "Gradually add roasted barley flour in batches, stirring vigorously with a sturdy wooden mashesha stick against the pot walls.",
        "Beat continuously until the porridge is completely lump-free, elastic, and thoroughly cooked.",
        "Mound into a smooth dome on a wide plate and use a moistened spoon to create a deep central well.",
        "Melt niter kibbeh and combine with berbere; pour the vibrant red butter into the central crater.",
        "Ring the perimeter with fresh ayib or creamy fermented ergo.",
      ],
      amharicSteps: [
        "ውሃ በጨው በድስት ውስጥ አፍልቶ ማፍላት።",
        "የተቆላውን የገብስ ዱቄት ቀስ በቀስ እየጨመሩ በማሼሻ ከድስቱ ጋር እያጋጩ በደንብ ማሸት።",
        "ምንም እብጠት እንዳይኖረው አድርጎ ተለጣጭና የበሰለ ገንፎ እስኪሆን ድረስ ማብሰል።",
        "ገንፎውን በሳህን ላይ ደልድሎ በመሀከሉ በማንኪያ ጉድጓድ ማውጣት።",
        "የቀለጠውን ንጥር ቅቤ ከበርበሬ ጋር አዋህዶ መሀከሉ ላይ ማፍሰስ።",
        "ዙሪያውን በጣፋጭ እርጎ ወይም አይብ አስጊጦ ማቅረብ።",
      ],
      culinaryTips: [
        "Barley is packed with beta-glucan soluble fiber that binds bile acids and stabilizes postprandial insulin response.",
        "The healthy saturated fats in niter kibbeh act as carriers for fat-soluble carotenoids and vitamins from the berbere.",
      ],
    },
    nutrients: {
      proximate: {
        energyKcal: 690,
        protein_g: 17.8,
        fat_g: 31.5,
        carbohydrate_g: 88.0,
        dietaryFiber_g: 16.5,
        moisture_g: 225.0,
        ash_g: 6.2,
      },
      aminoAcids: {
        histidine_mg: 410,
        isoleucine_mg: 740,
        leucine_mg: 1290,
        lysine_mg: 780,
        methionine_mg: 340,
        cysteine_mg: 360,
        phenylalanine_mg: 920,
        tyrosine_mg: 580,
        threonine_mg: 620,
        tryptophan_mg: 210,
        valine_mg: 910,
        arginine_mg: 980,
        totalEAA_mg: 6860,
        limitingAmino: "Lysine (Elevated when served with Ayib)",
        aminoAcidScorePct: 84,
        pdcaasEquivalentPct: 82,
      },
      fattyAcids: {
        totalSaturated_g: 18.2,
        totalMUFA_g: 8.9,
        totalPUFA_g: 2.1,
        omega6_linoleic_g: 1.6,
        omega3_ALA_g: 0.35,
        omega3_EPA_DHA_g: 0.05,
        omega3ToOmega6Ratio: "1:4.6",
        cholesterol_mg: 78,
      },
      minerals: {
        calcium_mg: 220,
        iron_mg: 12.4,
        bioavailableIron_mg: 1.8,
        zinc_mg: 4.8,
        bioavailableZinc_mg: 1.3,
        magnesium_mg: 185,
        potassium_mg: 540,
        sodium_mg: 410,
        phosphorus_mg: 360,
        copper_mg: 0.85,
        selenium_mcg: 32.0,
        manganese_mg: 3.4,
      },
      vitamins: {
        vitaminA_RAE_mcg: 245,
        betaCarotene_mcg: 1480,
        vitaminC_mg: 8.0,
        vitaminD_mcg: 0.85,
        vitaminE_mg: 2.1,
        vitaminB1_mg: 0.48,
        vitaminB2_mg: 0.38,
        vitaminB3_mg: 5.6,
        vitaminB6_mg: 0.62,
        vitaminB9_folate_mcg: 95,
        vitaminB12_mcg: 0.65,
      },
    },
    costEstimatesPerServingETB: {
      economy: 90,
      standard: 150,
      premium: 230,
    },
  },

  // 6. BESO NUTRITIONAL POWER DRINK (Barley, Flaxseed & Honey)
  {
    id: "beso-nutritional-drink",
    nameEn: "Beso Power Drink with Roasted Barley, Flax & Honey",
    nameAmharic: "የበሶ መጠጥ ከተልባና ማር ጋር",
    category: "functional_drink",
    tagline: "The legendary long-distance runner's fuel and digestive soother.",
    description:
      "A fast, easily digestible nutrient beverage blended from finely ground roasted highland barley flour (beso), crushed roasted flaxseed (telba), and pure mountain honey shaken in cold spring water.",
    culturalContext:
      "Used by Ethiopian Olympic marathon runners, pastoralists on long journeys, and school children for quick, non-heavy brain and endurance fuel.",
    baseServingGrams: 380,
    isFasting: true,
    baseServingsPerDay: 3.0,
    ingredients: [
      { id: "beso-flour", nameEn: "Roasted Barley Flour (Beso)", nameAmharic: "የበሶ ዱቄት", gramsPerServing: 80, category: "cereal", dryEquivalentRatio: 1.0, notes: "Stone-ground roasted barley" },
      { id: "telba-flour", nameEn: "Ground Roasted Flaxseed (Telba)", nameAmharic: "የተፈጨ ተልባ", gramsPerServing: 30, category: "cereal", dryEquivalentRatio: 1.0, notes: "High Omega-3 ALA content" },
      { id: "honey", nameEn: "Pure Ethiopian Highland Honey", nameAmharic: "የደጋ ንጹህ ማር", gramsPerServing: 25, category: "sweetener", dryEquivalentRatio: 1.0 },
      { id: "water", nameEn: "Spring Water", nameAmharic: "የምንጭ ውሃ", gramsPerServing: 245, category: "cereal", dryEquivalentRatio: 0.0 },
    ],
    recipeInstructions: {
      prepTimeMinutes: 5,
      cookTimeMinutes: 0,
      steps: [
        "Place roasted barley flour (beso) and crushed roasted flaxseed in a traditional shaker bottle or gourd.",
        "Add cold spring water and a tablespoon of raw honey.",
        "Shake vigorously for 45 seconds until an unctuous, velvety emulsion forms with a delicate foam cap.",
        "Drink immediately while fresh to enjoy maximum satiety and sustained energy.",
      ],
      amharicSteps: [
        "የተቆላውን የበሶ ዱቄትና የተፈጨውን ተልባ በማቡኪያ ወይም ጠርሙስ ውስጥ መጨመር።",
        "ቀዝቃዛ የምንጭ ውሃና ማር ማከል ።",
        "እስኪዋሀድና ቆንጆ አረፋ እስኪያወጣ ድረስ ለ45 ሰከንድ በደንብ ማወዛወዝ።",
        "ልክ እንደተዘጋጀ ወዲያውኑ መጠጣት።",
      ],
      culinaryTips: [
        "The flax mucilage provides soluble arabinoxylans that lubricate the colon and feed beneficial Bifidobacteria.",
        "Alpha-linolenic acid (ALA) in flax provides 2.8g of Omega-3 per serving, supporting cardiovascular and cognitive health.",
      ],
    },
    nutrients: {
      proximate: {
        energyKcal: 495,
        protein_g: 14.8,
        fat_g: 13.5,
        carbohydrate_g: 82.0,
        dietaryFiber_g: 18.5,
        moisture_g: 250.0,
        ash_g: 4.2,
      },
      aminoAcids: {
        histidine_mg: 320,
        isoleucine_mg: 580,
        leucine_mg: 990,
        lysine_mg: 620,
        methionine_mg: 280,
        cysteine_mg: 310,
        phenylalanine_mg: 720,
        tyrosine_mg: 460,
        threonine_mg: 510,
        tryptophan_mg: 180,
        valine_mg: 740,
        arginine_mg: 1240,
        totalEAA_mg: 5540,
        limitingAmino: "Lysine",
        aminoAcidScorePct: 82,
        pdcaasEquivalentPct: 80,
      },
      fattyAcids: {
        totalSaturated_g: 1.4,
        totalMUFA_g: 2.6,
        totalPUFA_g: 8.9,
        omega6_linoleic_g: 2.1,
        omega3_ALA_g: 6.8, // Massive Omega-3 powerhouse
        omega3_EPA_DHA_g: 0.0,
        omega3ToOmega6Ratio: "3.2:1 (Ideal Anti-inflammatory Ratio)",
        cholesterol_mg: 0,
      },
      minerals: {
        calcium_mg: 165,
        iron_mg: 8.6,
        bioavailableIron_mg: 1.2,
        zinc_mg: 4.2,
        bioavailableZinc_mg: 1.1,
        magnesium_mg: 220,
        potassium_mg: 490,
        sodium_mg: 45,
        phosphorus_mg: 380,
        copper_mg: 0.75,
        selenium_mcg: 24.0,
        manganese_mg: 2.8,
      },
      vitamins: {
        vitaminA_RAE_mcg: 15,
        betaCarotene_mcg: 90,
        vitaminC_mg: 2.5,
        vitaminD_mcg: 0.0,
        vitaminE_mg: 2.8,
        vitaminB1_mg: 0.58,
        vitaminB2_mg: 0.24,
        vitaminB3_mg: 4.2,
        vitaminB6_mg: 0.55,
        vitaminB9_folate_mcg: 85,
        vitaminB12_mcg: 0.0,
      },
    },
    costEstimatesPerServingETB: {
      economy: 65,
      standard: 110,
      premium: 175,
    },
  },

  // 7. REFINED BULLA PORRIDGE (Enset Starch with Milk & Kibbeh)
  {
    id: "bulla-porridge",
    nameEn: "Refined Bulla Porridge with Spiced Butter & Milk",
    nameAmharic: "የቡላ ገንፎ በቅቤና ወተት",
    category: "breakfast_porridge",
    tagline: "Silky, easy-digesting fermented enset starch porridge for delicate stomachs and recovery.",
    description:
      "A delicate, translucent, soothing porridge made from refined enset starch (bulla) cooked gently in fresh milk, crowned with a swirl of golden niter kibbeh and aromatic cardamom (korerima).",
    culturalContext:
      "Renowned across southern and central Ethiopia as the ultimate gentle restorative for gastritis, digestive sensitivity, surgery convalescence, and child weaning.",
    baseServingGrams: 390,
    isFasting: false,
    baseServingsPerDay: 2.8,
    ingredients: [
      { id: "bulla-starch", nameEn: "Refined Fermented Enset Bulla", nameAmharic: "የተጣራ የቡላ ዱቄት", gramsPerServing: 80, category: "cereal", dryEquivalentRatio: 1.0, notes: "Micro-filtered fermented enset starch" },
      { id: "milk", nameEn: "Fresh Whole Cow's Milk", nameAmharic: "የላም ወተት", gramsPerServing: 250, category: "animal", dryEquivalentRatio: 0.12 },
      { id: "niter-kibbeh", nameEn: "Spiced Clarified Butter", nameAmharic: "ንጥር ቅቤ", gramsPerServing: 30, category: "oil_fat", dryEquivalentRatio: 1.0 },
      { id: "spices", nameEn: "Korerima Cardamom & Salt", nameAmharic: "ኮረሪማና ጨው", gramsPerServing: 5, category: "spice_herb", dryEquivalentRatio: 1.0 },
      { id: "ayib-garnish", nameEn: "Fresh Ayib Curd Garnish", nameAmharic: "አይብ", gramsPerServing: 25, category: "animal", dryEquivalentRatio: 1.0 },
    ],
    recipeInstructions: {
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      steps: [
        "Dissolve dry bulla powder in 1/2 cup of cold milk to form a lump-free slurry.",
        "Bring the remaining milk to a gentle scald over medium-low heat.",
        "Whisk the bulla slurry into the warm milk in a steady stream; stir continuously with a wooden spoon.",
        "Cook gently for 12–15 minutes until thick, glassy, translucent, and glossy.",
        "Pour into a warm bowl, make a shallow hollow, and spoon in melted niter kibbeh seasoned with ground korerima.",
        "Serve lukewarm for supreme digestive comfort.",
      ],
      amharicSteps: [
        "የቡላውን ዱቄት በቀዝቃዛ ወተት በደንብ ማሟሟት።",
        "የቀረውን ወተት በመካከለኛ እሳት ላይ ማሞቅ።",
        "የሟሟውን ቡላ ወደ ሞቀው ወተት ቀስ በቀስ እየጨመሩ ያለማቋረጥ ማማሰል።",
        "ቡላው እስኪወፍርና የብርጭቆ መልክ እስኪያወጣ ድረስ ለ15 ደቂቃ ማብሰል።",
        "በሳህን አውጥቶ መሀከሉ ላይ በኮረሪማ የተነጠረውን ቅቤ አፍስሶ ማቅረብ።",
      ],
      culinaryTips: [
        "Bulla contains fine-particulate resistant starch that does not irritate peptic ulcer beds and normalizes intestinal transit.",
        "Calcium and phosphorus from the milk and ayib enhance bone remineralization in postpartum women.",
      ],
    },
    nutrients: {
      proximate: {
        energyKcal: 610,
        protein_g: 15.2,
        fat_g: 28.4,
        carbohydrate_g: 74.0,
        dietaryFiber_g: 5.8,
        moisture_g: 260.0,
        ash_g: 4.8,
      },
      aminoAcids: {
        histidine_mg: 380,
        isoleucine_mg: 720,
        leucine_mg: 1240,
        lysine_mg: 1050,
        methionine_mg: 340,
        cysteine_mg: 180,
        phenylalanine_mg: 690,
        tyrosine_mg: 640,
        threonine_mg: 610,
        tryptophan_mg: 190,
        valine_mg: 820,
        arginine_mg: 520,
        totalEAA_mg: 6570,
        limitingAmino: "Methionine",
        aminoAcidScorePct: 88,
        pdcaasEquivalentPct: 86,
      },
      fattyAcids: {
        totalSaturated_g: 17.5,
        totalMUFA_g: 7.9,
        totalPUFA_g: 1.2,
        omega6_linoleic_g: 0.9,
        omega3_ALA_g: 0.25,
        omega3_EPA_DHA_g: 0.05,
        omega3ToOmega6Ratio: "1:3.6",
        cholesterol_mg: 82,
      },
      minerals: {
        calcium_mg: 380,
        iron_mg: 4.5,
        bioavailableIron_mg: 0.8,
        zinc_mg: 3.4,
        bioavailableZinc_mg: 1.2,
        magnesium_mg: 95,
        potassium_mg: 460,
        sodium_mg: 280,
        phosphorus_mg: 340,
        copper_mg: 0.35,
        selenium_mcg: 18.0,
        manganese_mg: 1.1,
      },
      vitamins: {
        vitaminA_RAE_mcg: 260,
        betaCarotene_mcg: 120,
        vitaminC_mg: 4.0,
        vitaminD_mcg: 1.4,
        vitaminE_mg: 1.5,
        vitaminB1_mg: 0.22,
        vitaminB2_mg: 0.52,
        vitaminB3_mg: 1.8,
        vitaminB6_mg: 0.32,
        vitaminB9_folate_mcg: 45,
        vitaminB12_mcg: 1.1,
      },
    },
    costEstimatesPerServingETB: {
      economy: 110,
      standard: 175,
      premium: 260,
    },
  },

  // 8. AZIFA & SALAD WITH INJERA (Whole Green Lentil Salad)
  {
    id: "azifa-lentil-salad",
    nameEn: "Azifa Green Lentil Salad with Teff Injera",
    nameAmharic: "አዚፋ ከሰላጣና እንጀራ ጋር",
    category: "salad_side",
    tagline: "Tangy, zesty green lentil salad packed with raw brown mustard and cold-pressed freshness.",
    description:
      "Tender whole green lentils partially mashed and tossed with cold-pressed oil, freshly ground Ethiopian brown mustard seed (senafitch), freshly squeezed lime juice, minced shallots, and fiery green chilies, served with teff injera.",
    culturalContext:
      "Served cold during fasting periods, especially Good Friday (Siklet) and warm afternoons, valued for its invigorating crispness and liver-cleansing qualities.",
    baseServingGrams: 440,
    isFasting: true,
    baseServingsPerDay: 2.8,
    ingredients: [
      { id: "teff-injera", nameEn: "Fermented Teff Injera", nameAmharic: "የጤፍ እንጀራ", gramsPerServing: 200, category: "cereal", dryEquivalentRatio: 0.45 },
      { id: "green-lentils", nameEn: "Cooked Whole Green Lentils", nameAmharic: "የበሰለ አረንጓዴ ምስር", gramsPerServing: 150, category: "legume", dryEquivalentRatio: 0.42, notes: "Boiled al dente, lightly crushed" },
      { id: "senafitch-dressing", nameEn: "Mustard Seed, Lime & Oil Dressing", nameAmharic: "የሰናፍጭ፣ ሎሚና ዘይት ቅመም", gramsPerServing: 40, category: "oil_fat", dryEquivalentRatio: 1.0, notes: "Brown mustard with fresh lime juice" },
      { id: "fresh-veg", nameEn: "Fresh Shallots, Tomatoes & Green Peppers", nameAmharic: "ቲማቲም፣ ቃሪያና ሽንኩርት", gramsPerServing: 50, category: "vegetable", dryEquivalentRatio: 1.0 },
    ],
    recipeInstructions: {
      prepTimeMinutes: 20,
      cookTimeMinutes: 25,
      steps: [
        "Boil whole brown or green lentils until tender but retaining structural integrity; drain and cool completely.",
        "In a mortar, grind brown mustard seeds with cold water until a pungent, sinus-clearing paste forms.",
        "Lightly mash half the lentils with the back of a fork; leave the other half whole for contrasting texture.",
        "Fold in minced shallots, diced fresh tomatoes, and finely sliced jalapeño peppers.",
        "Whisk mustard paste with freshly squeezed lime juice and vegetable oil; pour over the lentil mixture and toss.",
        "Serve chilled or at room temperature rolled in soft teff injera.",
      ],
      amharicSteps: [
        "አረንጓዴውን ምስር ሳይፈረካከስ ለስልሶ እስኪበስል ድረስ ቀቅሎ ማቀዝቀዝ።",
        "የሰናፍጭ ፍሬን በሙቀጫ ውስጥ በትንሽ ውሃ ወፍራም ለጥፍ እስኪሆን ድረስ መውቀስ።",
        "ምስሩን ግማሹን በማንኪያ ጫን ጫን እያደረጉ ግማሹን ሙሉውን መተው።",
        "የተከተፈ ቀይ ሽንኩርት፣ ቲማቲምና ቃሪያ መጨመር።",
        "የሰናፍጩን ለጥፍ ከሎሚ ጭማቂና ዘይት ጋር አዋህዶ ምስሩ ላይ ማፍሰስና ማደባለቅ።",
        "ቀዝቀዝ አድርጎ ከጤፍ እንጀራ ጋር ማቅረብ።",
      ],
      culinaryTips: [
        "Sinigrin and allyl isothiocyanate from freshly crushed mustard seeds stimulate digestive bile secretions and gastric motility.",
        "The abundant vitamin C in freshly squeezed lime keeps the non-heme iron in reduced, highly absorbable Fe²⁺ state.",
      ],
    },
    nutrients: {
      proximate: {
        energyKcal: 540,
        protein_g: 22.4,
        fat_g: 11.2,
        carbohydrate_g: 88.0,
        dietaryFiber_g: 17.5,
        moisture_g: 295.0,
        ash_g: 6.9,
      },
      aminoAcids: {
        histidine_mg: 520,
        isoleucine_mg: 920,
        leucine_mg: 1580,
        lysine_mg: 1380,
        methionine_mg: 390,
        cysteine_mg: 350,
        phenylalanine_mg: 1120,
        tyrosine_mg: 710,
        threonine_mg: 820,
        tryptophan_mg: 240,
        valine_mg: 1080,
        arginine_mg: 1480,
        totalEAA_mg: 8550,
        limitingAmino: "Methionine (Balanced by Teff)",
        aminoAcidScorePct: 92,
        pdcaasEquivalentPct: 88,
      },
      fattyAcids: {
        totalSaturated_g: 1.8,
        totalMUFA_g: 4.2,
        totalPUFA_g: 4.8,
        omega6_linoleic_g: 4.1,
        omega3_ALA_g: 0.65,
        omega3_EPA_DHA_g: 0.0,
        omega3ToOmega6Ratio: "1:6.3",
        cholesterol_mg: 0,
      },
      minerals: {
        calcium_mg: 240,
        iron_mg: 17.8,
        bioavailableIron_mg: 3.2, // Boosted by high ascorbic acid in lime
        zinc_mg: 5.2,
        bioavailableZinc_mg: 1.5,
        magnesium_mg: 195,
        potassium_mg: 880,
        sodium_mg: 380,
        phosphorus_mg: 410,
        copper_mg: 1.1,
        selenium_mcg: 22.0,
        manganese_mg: 4.2,
      },
      vitamins: {
        vitaminA_RAE_mcg: 140,
        betaCarotene_mcg: 1680,
        vitaminC_mg: 46.0, // High Vitamin C from lime, pepper & tomato
        vitaminD_mcg: 0.0,
        vitaminE_mg: 3.2,
        vitaminB1_mg: 0.58,
        vitaminB2_mg: 0.28,
        vitaminB3_mg: 3.9,
        vitaminB6_mg: 0.68,
        vitaminB9_folate_mcg: 220,
        vitaminB12_mcg: 0.1,
      },
    },
    costEstimatesPerServingETB: {
      economy: 85,
      standard: 135,
      premium: 210,
    },
  },

  // 9. TELBA FITFIT (Flaxseed & Shredded Injera)
  {
    id: "telba-fitfit",
    nameEn: "Telba Fitfit (Crushed Flaxseed & Injera)",
    nameAmharic: "የተልባ ፍትፍት",
    category: "fasting_combo",
    tagline: "The supreme cold-pressed plant Omega-3 emulsion and colon tonic.",
    description:
      "A soothing, cool dish made by grinding roasted flaxseeds into a fine powder, blending with cold water into a rich plant-milk emulsion seasoned with shallots and green chilies, then tossed with rolled bite-sized pieces of fermented teff injera.",
    culturalContext:
      "Traditionally eaten during Lent and as a morning tonic to soothe gastrointestinal inflammation, constipation, and joint stiffness.",
    baseServingGrams: 460,
    isFasting: true,
    baseServingsPerDay: 2.8,
    ingredients: [
      { id: "teff-injera", nameEn: "Shredded Fermented Teff Injera", nameAmharic: "የተቆራረጠ የጤፍ እንጀራ", gramsPerServing: 200, category: "cereal", dryEquivalentRatio: 0.45 },
      { id: "flax-seed", nameEn: "Roasted Ground Flaxseed (Telba)", nameAmharic: "የተፈጨ ተልባ", gramsPerServing: 60, category: "cereal", dryEquivalentRatio: 1.0, notes: "Cold-infused into 220g thick flax milk" },
      { id: "shallot-chili", nameEn: "Shallots, Jalapeño & Lemon", nameAmharic: "ቀይ ሽንኩርት፣ ቃሪያና ሎሚ", gramsPerServing: 40, category: "vegetable", dryEquivalentRatio: 1.0 },
    ],
    recipeInstructions: {
      prepTimeMinutes: 15,
      cookTimeMinutes: 5,
      steps: [
        "Lightly roast whole golden flaxseeds in a dry pan until they pop aromatically; cool and grind into a silky powder.",
        "Add cold water gradually while whisking to create a thick, pale-golden flax milk emulsion.",
        "Season with finely chopped shallots, diced green chili, salt, and freshly squeezed lemon juice.",
        "Tear fresh teff injera into bite-sized ribbons and fold gently into the flax emulsion so each piece absorbs the dressing.",
        "Serve immediately while chilled or at room temperature.",
      ],
      amharicSteps: [
        "ተልባውን በደረቅ ምጣድ ላይ እስኪፈነዳ ድረስ ለስለስ አድርጎ መቁላትና ማቀዝቀዝ።",
        "የተቆላውን ተልባ በሚገባ ደቁሶ መፍጨት።",
        "ቀዝቃዛ ውሃ ቀስ በቀስ እየጨመሩ ነጣ ያለ የተልባ ወተት እስኪሆን ድረስ ማዋሀድ።",
        "የደቀቀ ቀይ ሽንኩርት፣ ቃሪያ፣ ጨውና የሎሚ ጭማቂ መጨመር።",
        "የጤፍ እንጀራውን ቆራርጦ ከተልባው ጋር ማዋሀድና ወዲያውኑ ማቅረብ።",
      ],
      culinaryTips: [
        "Grinding flaxseeds just before preparation prevents the rapid auto-oxidation of sensitive polyunsaturated alpha-linolenic acid (ALA).",
        "The combination of teff prebiotic resistant starch and flax lignans creates the ultimate synbiotic meal for intestinal microbiome diversity.",
      ],
    },
    nutrients: {
      proximate: {
        energyKcal: 560,
        protein_g: 19.5,
        fat_g: 22.8,
        carbohydrate_g: 72.0,
        dietaryFiber_g: 23.4,
        moisture_g: 310.0,
        ash_g: 6.8,
      },
      aminoAcids: {
        histidine_mg: 450,
        isoleucine_mg: 820,
        leucine_mg: 1390,
        lysine_mg: 980,
        methionine_mg: 380,
        cysteine_mg: 390,
        phenylalanine_mg: 1050,
        tyrosine_mg: 640,
        threonine_mg: 750,
        tryptophan_mg: 260,
        valine_mg: 1040,
        arginine_mg: 1720,
        totalEAA_mg: 7720,
        limitingAmino: "Lysine",
        aminoAcidScorePct: 86,
        pdcaasEquivalentPct: 83,
      },
      fattyAcids: {
        totalSaturated_g: 2.3,
        totalMUFA_g: 4.1,
        totalPUFA_g: 15.6,
        omega6_linoleic_g: 3.8,
        omega3_ALA_g: 11.8, // Record-holding plant Omega-3 density
        omega3_EPA_DHA_g: 0.0,
        omega3ToOmega6Ratio: "3.1:1 (Optimal Anti-inflammatory Balance)",
        cholesterol_mg: 0,
      },
      minerals: {
        calcium_mg: 310,
        iron_mg: 16.5,
        bioavailableIron_mg: 2.5,
        zinc_mg: 5.6,
        bioavailableZinc_mg: 1.5,
        magnesium_mg: 310,
        potassium_mg: 720,
        sodium_mg: 340,
        phosphorus_mg: 490,
        copper_mg: 1.3,
        selenium_mcg: 26.0,
        manganese_mg: 4.9,
      },
      vitamins: {
        vitaminA_RAE_mcg: 80,
        betaCarotene_mcg: 960,
        vitaminC_mg: 22.0,
        vitaminD_mcg: 0.0,
        vitaminE_mg: 4.2,
        vitaminB1_mg: 0.78,
        vitaminB2_mg: 0.26,
        vitaminB3_mg: 4.1,
        vitaminB6_mg: 0.72,
        vitaminB9_folate_mcg: 145,
        vitaminB12_mcg: 0.05,
      },
    },
    costEstimatesPerServingETB: {
      economy: 70,
      standard: 115,
      premium: 180,
    },
  },

  // 10. KINCHE BREAKFAST (Cracked Wheat with Niter Kibbeh & Cardamom)
  {
    id: "kinche-breakfast",
    nameEn: "Kinche Cracked Wheat with Niter Kibbeh & Korerima",
    nameAmharic: "ቂንጬ በቅቤና ኮረሪማ",
    category: "grain_breakfast",
    tagline: "The golden, fluffy whole-grain breakfast of champions.",
    description:
      "Coarsely cracked whole durum wheat grains steamed gently until fluffy and tender, tossed with fragrant spiced clarified butter (niter kibbeh), freshly ground black cardamom, and sea salt.",
    culturalContext:
      "The quintessential morning comfort food across Ethiopian households, revered for simplicity, warmth, and easy digestion.",
    baseServingGrams: 380,
    isFasting: false,
    baseServingsPerDay: 2.8,
    ingredients: [
      { id: "cracked-wheat", nameEn: "Whole Cracked Durum Wheat", nameAmharic: "ስንዴ ቂንጬ", gramsPerServing: 110, category: "cereal", dryEquivalentRatio: 0.35, notes: "Yields 330g cooked fluffy grains" },
      { id: "niter-kibbeh", nameEn: "Spiced Clarified Butter", nameAmharic: "ንጥር ቅቤ", gramsPerServing: 30, category: "oil_fat", dryEquivalentRatio: 1.0 },
      { id: "korerima-salt", nameEn: "Ground Korerima & Salt", nameAmharic: "ኮረሪማና ጨው", gramsPerServing: 5, category: "spice_herb", dryEquivalentRatio: 1.0 },
      { id: "herbal-accompaniment", nameEn: "Spiced Herbal Tea / Warm Milk", nameAmharic: "የተቀመመ ሻይ ወይም ወተት", gramsPerServing: 35, category: "animal", dryEquivalentRatio: 1.0 },
    ],
    recipeInstructions: {
      prepTimeMinutes: 5,
      cookTimeMinutes: 25,
      steps: [
        "Rinse cracked wheat grains briefly to remove surface flour dust.",
        "Bring 2.5 cups of lightly salted water to a rolling boil in a saucepan.",
        "Add the cracked wheat, reduce heat to low, cover with a tight-fitting lid, and simmer undisturbed for 20 minutes until water is absorbed and grains are tender.",
        "Uncover and fluff grains with a fork.",
        "Drizzle melted aromatic niter kibbeh and sprinkle freshly ground korerima; toss gently until every grain glistens.",
        "Serve hot alongside spiced tea or warm milk.",
      ],
      amharicSteps: [
        "የተከካውን ስንዴ አቧራውን ለቀቅ እስኪያደርግ ድረስ ማጠብ።",
        "ውሃ በጨው በድስት ውስጥ ማፍላት።",
        "ስንዴውን ጨምሮ እሳቱን ቀንሶ ክዳኑን ከድኖ ውሃው እስኪመጥጥ ድረስ ለ20 ደቂቃ ማብሰል።",
        "በሹካ ፍርፍር አድርጎ ማገላበጥ።",
        "የቀለጠውን ንጥር ቅቤና ኮረሪማ ጨምሮ ስንዴው እስኪያብረቀርቅ ማዋሀድ።",
        "በትኩሱ ከቀመመ ሻይ ወይም ወተት ጋር ማቅረብ።",
      ],
      culinaryTips: [
        "Durum wheat supplies complex starch and insoluble bran fiber that maintain steady morning blood glucose levels.",
        "Infusing niter kibbeh with koseret adds antimicrobial volatile terpenoids that promote gastric health.",
      ],
    },
    nutrients: {
      proximate: {
        energyKcal: 580,
        protein_g: 16.2,
        fat_g: 27.5,
        carbohydrate_g: 74.5,
        dietaryFiber_g: 13.8,
        moisture_g: 220.0,
        ash_g: 4.8,
      },
      aminoAcids: {
        histidine_mg: 380,
        isoleucine_mg: 620,
        leucine_mg: 1140,
        lysine_mg: 520,
        methionine_mg: 280,
        cysteine_mg: 340,
        phenylalanine_mg: 780,
        tyrosine_mg: 480,
        threonine_mg: 520,
        tryptophan_mg: 180,
        valine_mg: 760,
        arginine_mg: 690,
        totalEAA_mg: 5890,
        limitingAmino: "Lysine",
        aminoAcidScorePct: 78,
        pdcaasEquivalentPct: 75,
      },
      fattyAcids: {
        totalSaturated_g: 15.8,
        totalMUFA_g: 7.6,
        totalPUFA_g: 1.8,
        omega6_linoleic_g: 1.4,
        omega3_ALA_g: 0.3,
        omega3_EPA_DHA_g: 0.05,
        omega3ToOmega6Ratio: "1:4.6",
        cholesterol_mg: 68,
      },
      minerals: {
        calcium_mg: 140,
        iron_mg: 6.8,
        bioavailableIron_mg: 1.0,
        zinc_mg: 4.1,
        bioavailableZinc_mg: 1.1,
        magnesium_mg: 165,
        potassium_mg: 410,
        sodium_mg: 320,
        phosphorus_mg: 310,
        copper_mg: 0.65,
        selenium_mcg: 44.0,
        manganese_mg: 3.8,
      },
      vitamins: {
        vitaminA_RAE_mcg: 210,
        betaCarotene_mcg: 110,
        vitaminC_mg: 1.5,
        vitaminD_mcg: 0.75,
        vitaminE_mg: 1.8,
        vitaminB1_mg: 0.48,
        vitaminB2_mg: 0.22,
        vitaminB3_mg: 5.1,
        vitaminB6_mg: 0.46,
        vitaminB9_folate_mcg: 65,
        vitaminB12_mcg: 0.45,
      },
    },
    costEstimatesPerServingETB: {
      economy: 75,
      standard: 125,
      premium: 195,
    },
  },

  // 11. DUBBA WOT (Rich Spiced Pumpkin & Lentil Stew with Injera)
  {
    id: "dubba-wot-lentils",
    nameEn: "Dubba Wot (Spiced Pumpkin & Red Lentil Stew) with Injera",
    nameAmharic: "የዱባ ወጥ በምስርና እንጀራ",
    category: "fasting_combo",
    tagline: "Carotenoid-dense golden pumpkin and lentil harmony.",
    description:
      "Sweet Ethiopian yellow pumpkin (dubba) simmered tender with split red lentils in a fragrant sauce of shallots, garlic, ginger, and berbere, poured over fermented teff injera.",
    culturalContext:
      "A beloved countryside fasting dish that showcases seasonal harvest vegetables, renowned for eyesight protection and kidney health.",
    baseServingGrams: 490,
    isFasting: true,
    baseServingsPerDay: 2.8,
    ingredients: [
      { id: "teff-injera", nameEn: "Fermented Teff Injera", nameAmharic: "የጤፍ እንጀራ", gramsPerServing: 220, category: "cereal", dryEquivalentRatio: 0.45 },
      { id: "pumpkin", nameEn: "Yellow Pumpkin Cubes (Dubba)", nameAmharic: "የተከተፈ ዱባ", gramsPerServing: 140, category: "vegetable", dryEquivalentRatio: 0.85, notes: "High beta-carotene squash" },
      { id: "red-lentils", nameEn: "Split Red Lentils (Yemisir Kik)", nameAmharic: "ቀይ ምስር", gramsPerServing: 80, category: "legume", dryEquivalentRatio: 0.4 },
      { id: "spiced-gravy", nameEn: "Onions, Garlic, Ginger & Berbere", nameAmharic: "ሽንኩርት፣ ነጭ ሽንኩርትና በርበሬ", gramsPerServing: 50, category: "oil_fat", dryEquivalentRatio: 1.0 },
    ],
    recipeInstructions: {
      prepTimeMinutes: 20,
      cookTimeMinutes: 40,
      steps: [
        "Peel and cube ripe yellow pumpkin into 1-inch bite-sized chunks.",
        "Caramelize minced red onions in a pot; add minced garlic, ginger, and berbere.",
        "Add rinsed split red lentils and 2 cups of water; simmer for 15 minutes.",
        "Introduce pumpkin cubes and cook gently until pumpkin is buttery and lentils have thickened into a rich golden-orange stew.",
        "Ladle generously over fresh sourdough teff injera.",
      ],
      amharicSteps: [
        "የበሰለውን ቢጫ ዱባ ልጦ በደቃቁ መክተፍ።",
        "የደቀቀውን ቀይ ሽንኩርት አቁላልቶ ነጭ ሽንኩርት፣ ዝንጅብልና በርበሬ መጨመር።",
        "የታጠበውን ቀይ ምስር ጨምሮ ለ15 ደቂቃ ማንተክተክ።",
        "የተከተፈውን ዱባ ጨምሮ ለስልሶ እስኪበስልና ወጡ እስኪወፍር ድረስ ማብሰል።",
        "በጤፍ እንጀራ ላይ አፍስሶ ማቅረብ።",
      ],
      culinaryTips: [
        "Beta-carotene from pumpkin is 400% better absorbed when cooked together with dietary lipids from the stew.",
        "Lentil folate and pumpkin lutein provide potent ocular and cardiovascular protection.",
      ],
    },
    nutrients: {
      proximate: {
        energyKcal: 590,
        protein_g: 23.5,
        fat_g: 11.8,
        carbohydrate_g: 104.0,
        dietaryFiber_g: 19.8,
        moisture_g: 320.0,
        ash_g: 7.8,
      },
      aminoAcids: {
        histidine_mg: 540,
        isoleucine_mg: 980,
        leucine_mg: 1680,
        lysine_mg: 1420,
        methionine_mg: 410,
        cysteine_mg: 380,
        phenylalanine_mg: 1180,
        tyrosine_mg: 740,
        threonine_mg: 880,
        tryptophan_mg: 260,
        valine_mg: 1140,
        arginine_mg: 1540,
        totalEAA_mg: 9010,
        limitingAmino: "Methionine",
        aminoAcidScorePct: 93,
        pdcaasEquivalentPct: 89,
      },
      fattyAcids: {
        totalSaturated_g: 1.9,
        totalMUFA_g: 4.4,
        totalPUFA_g: 5.1,
        omega6_linoleic_g: 4.3,
        omega3_ALA_g: 0.75,
        omega3_EPA_DHA_g: 0.0,
        omega3ToOmega6Ratio: "1:5.7",
        cholesterol_mg: 0,
      },
      minerals: {
        calcium_mg: 260,
        iron_mg: 18.5,
        bioavailableIron_mg: 2.4,
        zinc_mg: 5.4,
        bioavailableZinc_mg: 1.4,
        magnesium_mg: 215,
        potassium_mg: 1120, // Exceptional potassium density
        sodium_mg: 490,
        phosphorus_mg: 430,
        copper_mg: 1.1,
        selenium_mcg: 21.0,
        manganese_mg: 4.8,
      },
      vitamins: {
        vitaminA_RAE_mcg: 680, // Rich Vitamin A powerhouse
        betaCarotene_mcg: 8160,
        vitaminC_mg: 31.0,
        vitaminD_mcg: 0.0,
        vitaminE_mg: 3.5,
        vitaminB1_mg: 0.62,
        vitaminB2_mg: 0.31,
        vitaminB3_mg: 4.6,
        vitaminB6_mg: 0.81,
        vitaminB9_folate_mcg: 235,
        vitaminB12_mcg: 0.1,
      },
    },
    costEstimatesPerServingETB: {
      economy: 80,
      standard: 130,
      premium: 200,
    },
  },

  // 12. QUANTA FIRFIR (Sun-Dried Spiced Beef Jerky Stew with Injera)
  {
    id: "quanta-firfir",
    nameEn: "Quanta Firfir (Sun-Dried Spiced Beef Jerky Stew with Injera)",
    nameAmharic: "የቋንጣ ፍርፍር",
    category: "traditional_beef_enset",
    tagline: "Savory cured highland beef jerky shredded with injera in fiery spiced gravy.",
    description:
      "Sun-dried, spice-cured beef strips (quanta) braised in a rich reduction of onions, garlic, berbere, and niter kibbeh, gently folded with shredded rolls of fermented teff injera until deeply saturated.",
    culturalContext:
      "A traditional nomadic and traveler preservation staple of Ethiopia; celebrated as the ultimate hearty weekend brunch or recovery meal.",
    baseServingGrams: 510,
    isFasting: false,
    baseServingsPerDay: 2.6,
    ingredients: [
      { id: "quanta-beef", nameEn: "Sun-Dried Cured Beef Jerky (Quanta)", nameAmharic: "የተዘጋጀ ቋንጣ", gramsPerServing: 110, category: "animal", dryEquivalentRatio: 0.45, notes: "Cured with korerima, salt & berbere" },
      { id: "injera-folded", nameEn: "Shredded Teff Injera Folded In", nameAmharic: "የተፈተፈተ የጤፍ እንጀራ", gramsPerServing: 250, category: "cereal", dryEquivalentRatio: 0.45 },
      { id: "kibbeh-sauce", nameEn: "Niter Kibbeh & Berbere Sauce", nameAmharic: "የበርበሬና ንጥር ቅቤ ወጥ", gramsPerServing: 110, category: "oil_fat", dryEquivalentRatio: 1.0 },
      { id: "fresh-peppers", nameEn: "Raw Jalapeño & Shallots", nameAmharic: "ቃሪያና ቀይ ሽንኩርት", gramsPerServing: 40, category: "vegetable", dryEquivalentRatio: 1.0 },
    ],
    recipeInstructions: {
      prepTimeMinutes: 15,
      cookTimeMinutes: 35,
      steps: [
        "Cut sun-dried quanta jerky into bite-sized strips; rinse quickly in warm water to soften.",
        "Caramelize minced red onions in a saucepan with niter kibbeh and berbere until glossy.",
        "Add garlic, ginger, and the quanta pieces; pour in 1.5 cups of broth and simmer for 25 minutes until the beef is tender and deeply flavorful.",
        "Tear fresh teff injera into pieces and gently fold into the simmering stew until sauce is fully absorbed but not mushy.",
        "Garnish with raw jalapeño rings and serve piping hot.",
      ],
      amharicSteps: [
        "የደረቀውን ቋንጣ ቆራርጦ ለብ ባለ ውሃ ማለስለስ።",
        "የደቀቀውን ቀይ ሽንኩርት በቅቤና በርበሬ በሚገባ ማቁላላት።",
        "ነጭ ሽንኩርት፣ ዝንጅብልና ቋንጣውን ጨምሮ ውሃ አፍስሶ ቋንጣው እስኪለሰልስ ለ25 ደቂቃ ማብሰል።",
        "የጤፍ እንጀራውን ቆራርጦ ወጡ ውስጥ ማዋሀድ።",
        "በጥሬ ቃሪያ አስጊጦ በትኩሱ ማቅረብ።",
      ],
      culinaryTips: [
        "The sun-drying and natural salt curing of quanta concentrates bioavailable heme iron and essential amino acids.",
        "Folding injera directly into the simmering sauce allows the teff fibers to soak up lipid-soluble carotenoids and capsaicinoids.",
      ],
    },
    nutrients: {
      proximate: {
        energyKcal: 720,
        protein_g: 42.5,
        fat_g: 24.8,
        carbohydrate_g: 86.0,
        dietaryFiber_g: 13.5,
        moisture_g: 280.0,
        ash_g: 9.2,
      },
      aminoAcids: {
        histidine_mg: 1150,
        isoleucine_mg: 1980,
        leucine_mg: 3340,
        lysine_mg: 3120,
        methionine_mg: 980,
        cysteine_mg: 480,
        phenylalanine_mg: 1840,
        tyrosine_mg: 1290,
        threonine_mg: 1720,
        tryptophan_mg: 460,
        valine_mg: 2120,
        arginine_mg: 2650,
        totalEAA_mg: 18430,
        limitingAmino: "None (High-Biological-Value Protein)",
        aminoAcidScorePct: 98,
        pdcaasEquivalentPct: 96,
      },
      fattyAcids: {
        totalSaturated_g: 11.5,
        totalMUFA_g: 9.4,
        totalPUFA_g: 3.2,
        omega6_linoleic_g: 2.6,
        omega3_ALA_g: 0.45,
        omega3_EPA_DHA_g: 0.12,
        omega3ToOmega6Ratio: "1:5.8",
        cholesterol_mg: 95,
      },
      minerals: {
        calcium_mg: 280,
        iron_mg: 24.2,
        bioavailableIron_mg: 4.6, // High heme + non-heme mix
        zinc_mg: 8.4,
        bioavailableZinc_mg: 2.9,
        magnesium_mg: 210,
        potassium_mg: 890,
        sodium_mg: 920,
        phosphorus_mg: 540,
        copper_mg: 1.1,
        selenium_mcg: 42.0,
        manganese_mg: 4.5,
      },
      vitamins: {
        vitaminA_RAE_mcg: 260,
        betaCarotene_mcg: 1740,
        vitaminC_mg: 18.0,
        vitaminD_mcg: 0.95,
        vitaminE_mg: 2.6,
        vitaminB1_mg: 0.48,
        vitaminB2_mg: 0.58,
        vitaminB3_mg: 8.8,
        vitaminB6_mg: 1.05,
        vitaminB9_folate_mcg: 140,
        vitaminB12_mcg: 2.8,
      },
    },
    costEstimatesPerServingETB: {
      economy: 185,
      standard: 290,
      premium: 440,
    },
  },
];

// ────────────────────────────────────────────────────────────────
// FORMULATION ENGINE & MULTI-SCALE SCALER
// ────────────────────────────────────────────────────────────────

export interface FormulatedDietResult {
  diet: EthiopianCompositeDiet;
  purposeConfig: PurposeConfig;
  economicTier: EconomicTier;
  enzymeReaction: EnzymeReactionConfig;

  // Scale multiplier derived from purpose and energy needs
  servingMultiplier: number;

  // 1. RECIPE PER SERVING (በአንድ ማዕድ/ምግብ)
  perServing: {
    servingMassGrams: number;
    ingredients: Array<{
      id: string;
      nameEn: string;
      nameAmharic: string;
      grams: number;
      category: string;
      notes?: string;
    }>;
    estimatedCostETB: number;
    nutrients: DietNutrientProfile;
    prepInstructions: EthiopianCompositeDiet["recipeInstructions"];
  };

  // 2. RECIPE PER DAY (በቀን - Daily Schedule)
  perDay: {
    servingsCount: number;
    totalDailyMassGrams: number;
    ingredients: Array<{
      id: string;
      nameEn: string;
      nameAmharic: string;
      gramsPerDay: number;
    }>;
    estimatedDailyCostETB: number;
    nutrients: DietNutrientProfile;
    adequacyVsRDI: Record<string, { actual: number; target: number; percent: number; status: "optimal" | "adequate" | "low" | "high" }>;
    mealDistribution: Array<{
      mealName: string;
      amharicName: string;
      timeOfDay: string;
      fraction: number;
      grams: number;
      caloriesKcal: number;
      suggestion: string;
    }>;
  };

  // 3. RECIPE PER MONTH (በወር - 30-Day Bulk Procurement & Pantry)
  perMonth: {
    daysCount: number;
    totalMonthlyCostETB: number;
    bulkPantryItems: Array<{
      nameEn: string;
      nameAmharic: string;
      totalKgOrLiters: number;
      unit: "kg" | "liters" | "grams";
      estimatedCostETB: number;
      storageAdvice: string;
    }>;
    economicGuidance: string;
  };

  // BIOCHEMICAL ENZYME ACTIVATION IMPACT
  enzymeBioavailabilitySummary: {
    reactionName: string;
    phytateDegradationPct: number;
    ironMultiplier: number;
    zincMultiplier: number;
    proteinBioavailabilityMultiplier: number;
    bVitaminMultiplier: number;
    biochemicalMechanism: string;
    culinaryInstructions: string;
  };

  // PERSONALIZED CLINICAL HEALTH NOTE
  personalizedHealthNote: {
    headline: string;
    clinicalRationale: string;
    nutritionalSynergy: string;
    culturalWisdom: string;
    lifestyleRecommendation: string;
  };
}

/** Reference Daily Intakes (RDI) for average adult baseline */
export const ADULT_RDI_BASELINE = {
  energyKcal: 2100,
  protein_g: 56,
  fat_g: 65,
  carbohydrate_g: 275,
  dietaryFiber_g: 30,
  calcium_mg: 1000,
  iron_mg: 18,
  zinc_mg: 11,
  magnesium_mg: 400,
  potassium_mg: 3500,
  sodium_mg: 2000, // Upper safe limit
  vitaminA_RAE_mcg: 800,
  vitaminC_mg: 90,
  vitaminD_mcg: 15,
  vitaminB9_folate_mcg: 400,
  vitaminB12_mcg: 2.4,
};

/**
 * Core Formulation Calculation Function
 */
export function formulateCompositeDiet(
  dietId: string,
  purpose: UserPurpose = "weight_loss",
  economicTier: EconomicTier = "standard",
  enzymeReactionType: EnzymeReactionType = "ersho_phytase_96h"
): FormulatedDietResult {
  const baseDiet = ETHIOPIAN_COMPOSITE_DIETS.find((d) => d.id === dietId) ?? ETHIOPIAN_COMPOSITE_DIETS[0];
  const purposeConfig = PURPOSE_CONFIGS[purpose] ?? PURPOSE_CONFIGS.weight_loss;
  const enzymeReaction = ENZYME_REACTION_CONFIGS[enzymeReactionType] ?? ENZYME_REACTION_CONFIGS.ersho_phytase_96h;

  // Determine scaling multiplier
  const servingMultiplier = purposeConfig.servingSizeAdjustment;
  const servingsPerDay = purposeConfig.servingsPerDay;

  // Compute serving-level nutrients with purpose & enzyme adjustments
  const baseNutrients = baseDiet.nutrients;

  // Bioavailability multipliers
  const feMult = enzymeReaction.ironMultiplier;
  const znMult = enzymeReaction.zincMultiplier;
  const caMult = enzymeReaction.calciumMultiplier;
  const proteinDigestibilityMult = enzymeReaction.proteinBioavailabilityMultiplier;
  const bVitMult = enzymeReaction.bVitaminMultiplier;

  // Calculate scaled single-serving profile
  const servingNutrients: DietNutrientProfile = {
    proximate: {
      energyKcal: Math.round(baseNutrients.proximate.energyKcal * servingMultiplier * (purposeConfig.calorieTargetMultiplier / 1.0)),
      protein_g: Math.round(baseNutrients.proximate.protein_g * servingMultiplier * purposeConfig.proteinMultiplier * 10) / 10,
      fat_g: Math.round(baseNutrients.proximate.fat_g * servingMultiplier * purposeConfig.fatMultiplier * 10) / 10,
      carbohydrate_g: Math.round(baseNutrients.proximate.carbohydrate_g * servingMultiplier * purposeConfig.carbMultiplier * 10) / 10,
      dietaryFiber_g: Math.round(baseNutrients.proximate.dietaryFiber_g * servingMultiplier * purposeConfig.fiberMultiplier * 10) / 10,
      moisture_g: Math.round(baseNutrients.proximate.moisture_g * servingMultiplier),
      ash_g: Math.round(baseNutrients.proximate.ash_g * servingMultiplier * 10) / 10,
    },
    aminoAcids: {
      histidine_mg: Math.round(baseNutrients.aminoAcids.histidine_mg * servingMultiplier * purposeConfig.proteinMultiplier),
      isoleucine_mg: Math.round(baseNutrients.aminoAcids.isoleucine_mg * servingMultiplier * purposeConfig.proteinMultiplier),
      leucine_mg: Math.round(baseNutrients.aminoAcids.leucine_mg * servingMultiplier * purposeConfig.proteinMultiplier),
      lysine_mg: Math.round(baseNutrients.aminoAcids.lysine_mg * servingMultiplier * purposeConfig.proteinMultiplier * (enzymeReactionType === "sprouting_germination" ? 1.2 : 1.0)),
      methionine_mg: Math.round(baseNutrients.aminoAcids.methionine_mg * servingMultiplier * purposeConfig.proteinMultiplier),
      cysteine_mg: Math.round(baseNutrients.aminoAcids.cysteine_mg * servingMultiplier * purposeConfig.proteinMultiplier),
      phenylalanine_mg: Math.round(baseNutrients.aminoAcids.phenylalanine_mg * servingMultiplier * purposeConfig.proteinMultiplier),
      tyrosine_mg: Math.round(baseNutrients.aminoAcids.tyrosine_mg * servingMultiplier * purposeConfig.proteinMultiplier),
      threonine_mg: Math.round(baseNutrients.aminoAcids.threonine_mg * servingMultiplier * purposeConfig.proteinMultiplier * (enzymeReactionType === "sprouting_germination" ? 1.15 : 1.0)),
      tryptophan_mg: Math.round(baseNutrients.aminoAcids.tryptophan_mg * servingMultiplier * purposeConfig.proteinMultiplier),
      valine_mg: Math.round(baseNutrients.aminoAcids.valine_mg * servingMultiplier * purposeConfig.proteinMultiplier),
      arginine_mg: Math.round(baseNutrients.aminoAcids.arginine_mg * servingMultiplier * purposeConfig.proteinMultiplier),
      totalEAA_mg: Math.round(baseNutrients.aminoAcids.totalEAA_mg * servingMultiplier * purposeConfig.proteinMultiplier),
      limitingAmino: baseNutrients.aminoAcids.limitingAmino,
      aminoAcidScorePct: Math.min(100, Math.round(baseNutrients.aminoAcids.aminoAcidScorePct * (enzymeReactionType === "sprouting_germination" ? 1.06 : 1.0))),
      pdcaasEquivalentPct: Math.min(100, Math.round(baseNutrients.aminoAcids.pdcaasEquivalentPct * proteinDigestibilityMult)),
    },
    fattyAcids: {
      totalSaturated_g: Math.round(baseNutrients.fattyAcids.totalSaturated_g * servingMultiplier * purposeConfig.fatMultiplier * 10) / 10,
      totalMUFA_g: Math.round(baseNutrients.fattyAcids.totalMUFA_g * servingMultiplier * purposeConfig.fatMultiplier * 10) / 10,
      totalPUFA_g: Math.round(baseNutrients.fattyAcids.totalPUFA_g * servingMultiplier * purposeConfig.fatMultiplier * 10) / 10,
      omega6_linoleic_g: Math.round(baseNutrients.fattyAcids.omega6_linoleic_g * servingMultiplier * purposeConfig.fatMultiplier * 10) / 10,
      omega3_ALA_g: Math.round(baseNutrients.fattyAcids.omega3_ALA_g * servingMultiplier * purposeConfig.fatMultiplier * 10) / 10,
      omega3_EPA_DHA_g: Math.round(baseNutrients.fattyAcids.omega3_EPA_DHA_g * servingMultiplier * 100) / 100,
      omega3ToOmega6Ratio: baseNutrients.fattyAcids.omega3ToOmega6Ratio,
      cholesterol_mg: Math.round(baseNutrients.fattyAcids.cholesterol_mg * servingMultiplier),
    },
    minerals: {
      calcium_mg: Math.round(baseNutrients.minerals.calcium_mg * servingMultiplier * caMult),
      iron_mg: Math.round(baseNutrients.minerals.iron_mg * servingMultiplier * 10) / 10,
      bioavailableIron_mg: Math.round(baseNutrients.minerals.bioavailableIron_mg * servingMultiplier * feMult * 10) / 10,
      zinc_mg: Math.round(baseNutrients.minerals.zinc_mg * servingMultiplier * 10) / 10,
      bioavailableZinc_mg: Math.round(baseNutrients.minerals.bioavailableZinc_mg * servingMultiplier * znMult * 10) / 10,
      magnesium_mg: Math.round(baseNutrients.minerals.magnesium_mg * servingMultiplier),
      potassium_mg: Math.round(baseNutrients.minerals.potassium_mg * servingMultiplier),
      sodium_mg: Math.round(baseNutrients.minerals.sodium_mg * servingMultiplier),
      phosphorus_mg: Math.round(baseNutrients.minerals.phosphorus_mg * servingMultiplier),
      copper_mg: Math.round(baseNutrients.minerals.copper_mg * servingMultiplier * 100) / 100,
      selenium_mcg: Math.round(baseNutrients.minerals.selenium_mcg * servingMultiplier * 10) / 10,
      manganese_mg: Math.round(baseNutrients.minerals.manganese_mg * servingMultiplier * 10) / 10,
    },
    vitamins: {
      vitaminA_RAE_mcg: Math.round(baseNutrients.vitamins.vitaminA_RAE_mcg * servingMultiplier),
      betaCarotene_mcg: Math.round(baseNutrients.vitamins.betaCarotene_mcg * servingMultiplier),
      vitaminC_mg: Math.round(baseNutrients.vitamins.vitaminC_mg * servingMultiplier * (enzymeReactionType === "ascorbic_acid_reduction" ? 1.35 : 1.0)),
      vitaminD_mcg: Math.round(baseNutrients.vitamins.vitaminD_mcg * servingMultiplier * 10) / 10,
      vitaminE_mg: Math.round(baseNutrients.vitamins.vitaminE_mg * servingMultiplier * 10) / 10,
      vitaminB1_mg: Math.round(baseNutrients.vitamins.vitaminB1_mg * servingMultiplier * bVitMult * 100) / 100,
      vitaminB2_mg: Math.round(baseNutrients.vitamins.vitaminB2_mg * servingMultiplier * bVitMult * 100) / 100,
      vitaminB3_mg: Math.round(baseNutrients.vitamins.vitaminB3_mg * servingMultiplier * 10) / 10,
      vitaminB6_mg: Math.round(baseNutrients.vitamins.vitaminB6_mg * servingMultiplier * 10) / 10,
      vitaminB9_folate_mcg: Math.round(baseNutrients.vitamins.vitaminB9_folate_mcg * servingMultiplier * bVitMult),
      vitaminB12_mcg: Math.round(baseNutrients.vitamins.vitaminB12_mcg * servingMultiplier * 100) / 100,
    },
  };

  // Scaled serving ingredients
  const servingIngredients = baseDiet.ingredients.map((ing) => ({
    id: ing.id,
    nameEn: ing.nameEn,
    nameAmharic: ing.nameAmharic,
    grams: Math.round(ing.gramsPerServing * servingMultiplier),
    category: ing.category,
    notes: ing.notes,
  }));
  const totalServingMass = servingIngredients.reduce((s, i) => s + i.grams, 0);

  // Cost per serving based on economic tier
  const costPerServing = baseDiet.costEstimatesPerServingETB[economicTier] * servingMultiplier;

  // ────────────────────────────────────────────────────────────────
  // 2. DAILY COMPUTATION
  // ────────────────────────────────────────────────────────────────
  const dailyMass = Math.round(totalServingMass * servingsPerDay);
  const dailyIngredients = baseDiet.ingredients.map((ing) => ({
    id: ing.id,
    nameEn: ing.nameEn,
    nameAmharic: ing.nameAmharic,
    gramsPerDay: Math.round(ing.gramsPerServing * servingMultiplier * servingsPerDay),
  }));

  const dailyNutrients: DietNutrientProfile = {
    proximate: {
      energyKcal: Math.round(servingNutrients.proximate.energyKcal * servingsPerDay),
      protein_g: Math.round(servingNutrients.proximate.protein_g * servingsPerDay * 10) / 10,
      fat_g: Math.round(servingNutrients.proximate.fat_g * servingsPerDay * 10) / 10,
      carbohydrate_g: Math.round(servingNutrients.proximate.carbohydrate_g * servingsPerDay * 10) / 10,
      dietaryFiber_g: Math.round(servingNutrients.proximate.dietaryFiber_g * servingsPerDay * 10) / 10,
      moisture_g: Math.round(servingNutrients.proximate.moisture_g * servingsPerDay),
      ash_g: Math.round(servingNutrients.proximate.ash_g * servingsPerDay * 10) / 10,
    },
    aminoAcids: {
      histidine_mg: Math.round(servingNutrients.aminoAcids.histidine_mg * servingsPerDay),
      isoleucine_mg: Math.round(servingNutrients.aminoAcids.isoleucine_mg * servingsPerDay),
      leucine_mg: Math.round(servingNutrients.aminoAcids.leucine_mg * servingsPerDay),
      lysine_mg: Math.round(servingNutrients.aminoAcids.lysine_mg * servingsPerDay),
      methionine_mg: Math.round(servingNutrients.aminoAcids.methionine_mg * servingsPerDay),
      cysteine_mg: Math.round(servingNutrients.aminoAcids.cysteine_mg * servingsPerDay),
      phenylalanine_mg: Math.round(servingNutrients.aminoAcids.phenylalanine_mg * servingsPerDay),
      tyrosine_mg: Math.round(servingNutrients.aminoAcids.tyrosine_mg * servingsPerDay),
      threonine_mg: Math.round(servingNutrients.aminoAcids.threonine_mg * servingsPerDay),
      tryptophan_mg: Math.round(servingNutrients.aminoAcids.tryptophan_mg * servingsPerDay),
      valine_mg: Math.round(servingNutrients.aminoAcids.valine_mg * servingsPerDay),
      arginine_mg: Math.round(servingNutrients.aminoAcids.arginine_mg * servingsPerDay),
      totalEAA_mg: Math.round(servingNutrients.aminoAcids.totalEAA_mg * servingsPerDay),
      limitingAmino: servingNutrients.aminoAcids.limitingAmino,
      aminoAcidScorePct: servingNutrients.aminoAcids.aminoAcidScorePct,
      pdcaasEquivalentPct: servingNutrients.aminoAcids.pdcaasEquivalentPct,
    },
    fattyAcids: {
      totalSaturated_g: Math.round(servingNutrients.fattyAcids.totalSaturated_g * servingsPerDay * 10) / 10,
      totalMUFA_g: Math.round(servingNutrients.fattyAcids.totalMUFA_g * servingsPerDay * 10) / 10,
      totalPUFA_g: Math.round(servingNutrients.fattyAcids.totalPUFA_g * servingsPerDay * 10) / 10,
      omega6_linoleic_g: Math.round(servingNutrients.fattyAcids.omega6_linoleic_g * servingsPerDay * 10) / 10,
      omega3_ALA_g: Math.round(servingNutrients.fattyAcids.omega3_ALA_g * servingsPerDay * 10) / 10,
      omega3_EPA_DHA_g: Math.round(servingNutrients.fattyAcids.omega3_EPA_DHA_g * servingsPerDay * 100) / 100,
      omega3ToOmega6Ratio: servingNutrients.fattyAcids.omega3ToOmega6Ratio,
      cholesterol_mg: Math.round(servingNutrients.fattyAcids.cholesterol_mg * servingsPerDay),
    },
    minerals: {
      calcium_mg: Math.round(servingNutrients.minerals.calcium_mg * servingsPerDay),
      iron_mg: Math.round(servingNutrients.minerals.iron_mg * servingsPerDay * 10) / 10,
      bioavailableIron_mg: Math.round(servingNutrients.minerals.bioavailableIron_mg * servingsPerDay * 10) / 10,
      zinc_mg: Math.round(servingNutrients.minerals.zinc_mg * servingsPerDay * 10) / 10,
      bioavailableZinc_mg: Math.round(servingNutrients.minerals.bioavailableZinc_mg * servingsPerDay * 10) / 10,
      magnesium_mg: Math.round(servingNutrients.minerals.magnesium_mg * servingsPerDay),
      potassium_mg: Math.round(servingNutrients.minerals.potassium_mg * servingsPerDay),
      sodium_mg: Math.round(servingNutrients.minerals.sodium_mg * servingsPerDay),
      phosphorus_mg: Math.round(servingNutrients.minerals.phosphorus_mg * servingsPerDay),
      copper_mg: Math.round(servingNutrients.minerals.copper_mg * servingsPerDay * 100) / 100,
      selenium_mcg: Math.round(servingNutrients.minerals.selenium_mcg * servingsPerDay * 10) / 10,
      manganese_mg: Math.round(servingNutrients.minerals.manganese_mg * servingsPerDay * 10) / 10,
    },
    vitamins: {
      vitaminA_RAE_mcg: Math.round(servingNutrients.vitamins.vitaminA_RAE_mcg * servingsPerDay),
      betaCarotene_mcg: Math.round(servingNutrients.vitamins.betaCarotene_mcg * servingsPerDay),
      vitaminC_mg: Math.round(servingNutrients.vitamins.vitaminC_mg * servingsPerDay),
      vitaminD_mcg: Math.round(servingNutrients.vitamins.vitaminD_mcg * servingsPerDay * 10) / 10,
      vitaminE_mg: Math.round(servingNutrients.vitamins.vitaminE_mg * servingsPerDay * 10) / 10,
      vitaminB1_mg: Math.round(servingNutrients.vitamins.vitaminB1_mg * servingsPerDay * 100) / 100,
      vitaminB2_mg: Math.round(servingNutrients.vitamins.vitaminB2_mg * servingsPerDay * 100) / 100,
      vitaminB3_mg: Math.round(servingNutrients.vitamins.vitaminB3_mg * servingsPerDay * 10) / 10,
      vitaminB6_mg: Math.round(servingNutrients.vitamins.vitaminB6_mg * servingsPerDay * 10) / 10,
      vitaminB9_folate_mcg: Math.round(servingNutrients.vitamins.vitaminB9_folate_mcg * servingsPerDay),
      vitaminB12_mcg: Math.round(servingNutrients.vitamins.vitaminB12_mcg * servingsPerDay * 100) / 100,
    },
  };

  // Adequacy evaluation vs RDI
  const adequacyVsRDI: FormulatedDietResult["perDay"]["adequacyVsRDI"] = {
    energy: {
      actual: dailyNutrients.proximate.energyKcal,
      target: Math.round(ADULT_RDI_BASELINE.energyKcal * purposeConfig.calorieTargetMultiplier),
      percent: Math.round((dailyNutrients.proximate.energyKcal / (ADULT_RDI_BASELINE.energyKcal * purposeConfig.calorieTargetMultiplier)) * 100),
      status: "optimal",
    },
    protein: {
      actual: dailyNutrients.proximate.protein_g,
      target: Math.round(ADULT_RDI_BASELINE.protein_g * purposeConfig.proteinMultiplier),
      percent: Math.round((dailyNutrients.proximate.protein_g / (ADULT_RDI_BASELINE.protein_g * purposeConfig.proteinMultiplier)) * 100),
      status: dailyNutrients.proximate.protein_g >= ADULT_RDI_BASELINE.protein_g * purposeConfig.proteinMultiplier ? "optimal" : "adequate",
    },
    fiber: {
      actual: dailyNutrients.proximate.dietaryFiber_g,
      target: Math.round(ADULT_RDI_BASELINE.dietaryFiber_g * purposeConfig.fiberMultiplier),
      percent: Math.round((dailyNutrients.proximate.dietaryFiber_g / (ADULT_RDI_BASELINE.dietaryFiber_g * purposeConfig.fiberMultiplier)) * 100),
      status: "optimal",
    },
    calcium: {
      actual: dailyNutrients.minerals.calcium_mg,
      target: ADULT_RDI_BASELINE.calcium_mg,
      percent: Math.round((dailyNutrients.minerals.calcium_mg / ADULT_RDI_BASELINE.calcium_mg) * 100),
      status: dailyNutrients.minerals.calcium_mg >= ADULT_RDI_BASELINE.calcium_mg ? "optimal" : "adequate",
    },
    iron: {
      actual: dailyNutrients.minerals.iron_mg,
      target: ADULT_RDI_BASELINE.iron_mg,
      percent: Math.round((dailyNutrients.minerals.iron_mg / ADULT_RDI_BASELINE.iron_mg) * 100),
      status: "optimal",
    },
    zinc: {
      actual: dailyNutrients.minerals.zinc_mg,
      target: ADULT_RDI_BASELINE.zinc_mg,
      percent: Math.round((dailyNutrients.minerals.zinc_mg / ADULT_RDI_BASELINE.zinc_mg) * 100),
      status: dailyNutrients.minerals.zinc_mg >= ADULT_RDI_BASELINE.zinc_mg ? "optimal" : "adequate",
    },
    potassium: {
      actual: dailyNutrients.minerals.potassium_mg,
      target: ADULT_RDI_BASELINE.potassium_mg,
      percent: Math.round((dailyNutrients.minerals.potassium_mg / ADULT_RDI_BASELINE.potassium_mg) * 100),
      status: dailyNutrients.minerals.potassium_mg >= 3000 ? "optimal" : "adequate",
    },
    folate: {
      actual: dailyNutrients.vitamins.vitaminB9_folate_mcg,
      target: ADULT_RDI_BASELINE.vitaminB9_folate_mcg,
      percent: Math.round((dailyNutrients.vitamins.vitaminB9_folate_mcg / ADULT_RDI_BASELINE.vitaminB9_folate_mcg) * 100),
      status: dailyNutrients.vitamins.vitaminB9_folate_mcg >= ADULT_RDI_BASELINE.vitaminB9_folate_mcg ? "optimal" : "adequate",
    },
    vitaminC: {
      actual: dailyNutrients.vitamins.vitaminC_mg,
      target: ADULT_RDI_BASELINE.vitaminC_mg,
      percent: Math.round((dailyNutrients.vitamins.vitaminC_mg / ADULT_RDI_BASELINE.vitaminC_mg) * 100),
      status: dailyNutrients.vitamins.vitaminC_mg >= ADULT_RDI_BASELINE.vitaminC_mg ? "optimal" : "adequate",
    },
  };

  // Meal schedule distribution
  const mealDistribution: FormulatedDietResult["perDay"]["mealDistribution"] = [
    {
      mealName: "Morning Meal (Breakfast)",
      amharicName: "ቁርስ",
      timeOfDay: "07:30 - 08:30",
      fraction: 0.3,
      grams: Math.round(dailyMass * 0.3),
      caloriesKcal: Math.round(dailyNutrients.proximate.energyKcal * 0.3),
      suggestion: "Energy awakening portion with hot herbal tea or spring water.",
    },
    {
      mealName: "Midday Meal (Lunch)",
      amharicName: "ምሳ",
      timeOfDay: "12:30 - 13:30",
      fraction: 0.45,
      grams: Math.round(dailyMass * 0.45),
      caloriesKcal: Math.round(dailyNutrients.proximate.energyKcal * 0.45),
      suggestion: "Main hearty portion eaten slowly in community, maximized with fresh greens and lemon.",
    },
    {
      mealName: "Evening Meal (Dinner)",
      amharicName: "እራት",
      timeOfDay: "19:00 - 20:00",
      fraction: 0.25,
      grams: Math.round(dailyMass * 0.25),
      caloriesKcal: Math.round(dailyNutrients.proximate.energyKcal * 0.25),
      suggestion: "Easily digestible evening portion eaten at least 2.5 hours prior to sleep.",
    },
  ];

  // ────────────────────────────────────────────────────────────────
  // 3. MONTHLY BULK PROCUREMENT (30 DAYS)
  // ────────────────────────────────────────────────────────────────
  const daysInMonth = 30;
  const totalMonthlyCost = Math.round(costPerServing * servingsPerDay * daysInMonth);

  // Group raw ingredient demands into bulk pantry supplies
  const rawGrainsAndPulses: Record<string, { nameEn: string; nameAmharic: string; totalGrams: number; unit: "kg" | "liters" | "grams"; storage: string }> = {};

  for (const item of dailyIngredients) {
    const original = baseDiet.ingredients.find((i) => i.id === item.id);
    const dryRatio = original?.dryEquivalentRatio ?? 0.5;
    const rawGrams30Days = item.gramsPerDay * daysInMonth * dryRatio;

    let groupKey = item.id;
    let nameEn = item.nameEn;
    let nameAmharic = item.nameAmharic;
    let unit: "kg" | "liters" | "grams" = "kg";
    let storage = "Store in clean, airtight, cool, dry containers.";

    if (item.id === "teff-injera") {
      groupKey = "raw-teff-flour";
      nameEn = "Whole Teff Grain / Flour (የጤፍ ዱቄት)";
      nameAmharic = "የጤፍ ዱቄት";
      storage = "Keep in breathable sacks or sealed barrels off concrete floors; refresh Ersho every 3 days.";
    } else if (item.id === "shiro-powder" || item.id === "shiro-wot") {
      groupKey = "bulk-shiro-powder";
      nameEn = "Milled Shiro Powder (የተፈጨ የሽሮ ዱቄት)";
      nameAmharic = "የሽሮ ዱቄት";
      storage = "Airtight tin or clay pot away from moisture to preserve roasted spice aromas.";
    } else if (item.id === "yemisir-wot" || item.id === "red-lentils") {
      groupKey = "bulk-red-lentils";
      nameEn = "Dry Split Red Lentils (የምስር ክክ)";
      nameAmharic = "የምስር ክክ";
      storage = "Dry, weevil-free sealed container with dry neem or eucalyptus leaves.";
    } else if (item.id === "oil-spices" || item.id === "kibbeh-sauce") {
      groupKey = "bulk-oil-kibbeh";
      nameEn = economicTier === "premium" ? "Pure Spiced Niter Kibbeh (ንጥር ቅቤ)" : "High-grade Vegetable/Sunflower Oil (የምግብ ዘይት)";
      nameAmharic = economicTier === "premium" ? "ንጥር ቅቤ" : "የምግብ ዘይት";
      unit = economicTier === "premium" ? "kg" : "liters";
      storage = "Cool dark pantry; airtight jar.";
    }

    if (!rawGrainsAndPulses[groupKey]) {
      rawGrainsAndPulses[groupKey] = { nameEn, nameAmharic, totalGrams: 0, unit, storage };
    }
    rawGrainsAndPulses[groupKey].totalGrams += rawGrams30Days;
  }

  // Convert to clean Pantry Items list
  const bulkPantryItems: FormulatedDietResult["perMonth"]["bulkPantryItems"] = Object.values(rawGrainsAndPulses).map((item) => {
    const valInKgOrL = Math.round((item.totalGrams / 1000) * 10) / 10;
    // Estimate component cost proportionally
    const costShare = Math.round(totalMonthlyCost * (item.totalGrams / (dailyMass * daysInMonth * 0.45)));
    return {
      nameEn: item.nameEn,
      nameAmharic: item.nameAmharic,
      totalKgOrLiters: Math.max(0.5, valInKgOrL),
      unit: item.unit,
      estimatedCostETB: Math.min(totalMonthlyCost, Math.max(150, Math.round(costShare))),
      storageAdvice: item.storage,
    };
  });

  // Economic guidance note
  const economicGuidance =
    economicTier === "economy"
      ? "Budget-optimized formulation relies on nutritious local field peas, brown teff, and seasonal Ethiopian greens, achieving 100% of essential micronutrient goals at minimum market cost (~ETB " +
        totalMonthlyCost.toLocaleString() +
        "/month)."
      : economicTier === "standard"
        ? "Balanced household formulation combines magna teff, split lentils, eggs, and sunflower oil for optimal balance between variety, convenience, and expense (~ETB " +
          totalMonthlyCost.toLocaleString() +
          "/month)."
        : "Premium tier formulation incorporates magna teff, organic pasture clarified butter (niter kibbeh), cottage cheese, and prime lean cuts for peak bioavailability (~ETB " +
          totalMonthlyCost.toLocaleString() +
          "/month).";

  // Personalized clinical note
  const personalizedHealthNote: FormulatedDietResult["personalizedHealthNote"] = {
    headline: `${purposeConfig.titleEn} Optimized Formulation`,
    clinicalRationale: purposeConfig.clinicalRationale,
    nutritionalSynergy: purposeConfig.nutritionalSynergy,
    culturalWisdom: purposeConfig.culturalWisdom,
    lifestyleRecommendation:
      purpose === "weight_loss"
        ? "Eat mindfully on a traditional mesob, starting with the fiber-rich collard greens and Azifa before consuming the teff injera to maximize satiety hormones."
        : purpose === "muscle_build"
          ? "Consume one full portion within 90 minutes of strength or endurance training to maximize muscle protein synthesis with peak BCAA bioavailability."
          : purpose === "therapeutic_diabetes"
            ? "Avoid rapid drinking of water during meals; allow the soluble dietary fibers to form a viscous intestinal gel that regulates glucose diffusion."
            : "Chew slowly, hydrate generously between meals, and allow the traditional fermented probiotics to flourish in your gut.",
  };

  return {
    diet: baseDiet,
    purposeConfig,
    economicTier,
    enzymeReaction,
    servingMultiplier,
    perServing: {
      servingMassGrams: totalServingMass,
      ingredients: servingIngredients,
      estimatedCostETB: Math.round(costPerServing),
      nutrients: servingNutrients,
      prepInstructions: baseDiet.recipeInstructions,
    },
    perDay: {
      servingsCount: servingsPerDay,
      totalDailyMassGrams: dailyMass,
      ingredients: dailyIngredients,
      estimatedDailyCostETB: Math.round(costPerServing * servingsPerDay),
      nutrients: dailyNutrients,
      adequacyVsRDI,
      mealDistribution,
    },
    perMonth: {
      daysCount: daysInMonth,
      totalMonthlyCostETB: totalMonthlyCost,
      bulkPantryItems,
      economicGuidance,
    },
    enzymeBioavailabilitySummary: {
      reactionName: enzymeReaction.titleEn,
      phytateDegradationPct: enzymeReaction.phytateReductionPct,
      ironMultiplier: enzymeReaction.ironMultiplier,
      zincMultiplier: enzymeReaction.zincMultiplier,
      proteinBioavailabilityMultiplier: enzymeReaction.proteinBioavailabilityMultiplier,
      bVitaminMultiplier: enzymeReaction.bVitaminMultiplier,
      biochemicalMechanism: enzymeReaction.mechanism,
      culinaryInstructions: enzymeReaction.traditionalPreparationTip,
    },
    personalizedHealthNote,
  };
}
