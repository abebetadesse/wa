/**
 * Enhancement 4: Ethiopian Orthodox Tsom (ጾም) Fasting & Refeeding Engine
 * Enhancement 5: Ethiopian Eater Archetype Classifier
 */

export type FastingSeason =
  | "abiy_tsom" // Great Lent (ዐቢይ ጾም - 55 days)
  | "filseta" // Assumption of Mary (ጾመ ፍልሰታ - 16 days)
  | "tsome_hawaryat" // Apostles' Fast (ጾመ ሐዋርያት)
  | "tsome_nebiyat" // Advent / Fast of Prophets (ጾመ ነቢያት - 43 days)
  | "tsome_nenewe" // Fast of Nineveh (ጾመ ነነዌ - 3 days)
  | "weekly_wed_fri" // Wednesday & Friday weekly fasts (ረቡዕና ዓርብ)
  | "non_fasting_season"; // Regular season (Fasika / non-fasting periods)

export interface FastingStatusAssessment {
  currentSeason: FastingSeason;
  seasonNameAmharic: string;
  isStrictVeganDay: boolean;
  typicalDurationDays: number;
  micronutrientVulnerabilities: {
    nutrient: string;
    depletionRisk: "high" | "moderate" | "low";
    physiologicalMechanism: string;
    indigenousCompensationStrategy: string;
  }[];
  refeedingSafeguards: {
    phase: string;
    protocol: string;
    contraindicatedFirstMeals: string[];
    digestiveSupportRemedies: string[];
  };
}

export type EaterArchetype =
  | "highland_agrarian" // ደጋማ አራሽ (Teff, Barley, Shiro, cyclic fasting)
  | "lowland_pastoralist" // ቆላማ አርብቶ አደር (Camel/Goat milk, ruminant meat, drought grains)
  | "enset_agro_forester" // የደቡብ እንሰት ቀጠና (Kocho, Bulla, Ayib, Gomen, fermented starch)
  | "urban_diaspora"; // የከተማና ዲያስፖራ (Refined blends, sedentariness, high restaurant oil/meat)

export interface EaterArchetypeProfile {
  id: EaterArchetype;
  nameAmharic: string;
  nameEnglish: string;
  description: string;
  metabolicFocus: string;
  macronutrientDistribution: {
    carbohydratesPct: number;
    proteinPct: number;
    fatPct: number;
  };
  recommendedTraditionalStaples: string[];
  keyBiochemicalRisks: string[];
  tailoredHabeshaAdvice: string;
}

export const EATER_ARCHETYPES: Record<EaterArchetype, EaterArchetypeProfile> = {
  highland_agrarian: {
    id: "highland_agrarian",
    nameAmharic: "ደጋማ አራሽ (Highland Agrarian)",
    nameEnglish: "Highland Agrarian",
    description: "Centuries-old heritage centered on slow-fermented teff injera, roasted barley (kolo), split pea shiro, and mountain greens with cyclical Christian fasting.",
    metabolicFocus: "High carbohydrate tolerance via rigorous physical toil and active GLUT4 transporters; vulnerable to phytate-bound zinc and calcium chelation.",
    macronutrientDistribution: {
      carbohydratesPct: 62,
      proteinPct: 18,
      fatPct: 20,
    },
    recommendedTraditionalStaples: ["4-Day Ersho Teff Injera", "Baqela (Faba bean) Nifro", "Gomen Wot", "Roasted Barley Kolo", "Shiro Tegabino"],
    keyBiochemicalRisks: ["Phytic acid zinc chelation", "Seasonal B12 deficiency during 55-day Great Lent"],
    tailoredHabeshaAdvice: "Ensure deep 3-4 day sourdough fermentation of teff to activate endogenous phytase, and consume sprouted fenugreek (Abish) to stimulate digestive enzymes.",
  },
  lowland_pastoralist: {
    id: "lowland_pastoralist",
    nameAmharic: "ቆላማ አርብቶ አደር (Lowland Pastoralist)",
    nameEnglish: "Lowland Pastoralist",
    description: "Heritage anchored in camel dairy, fermented goat milk, ruminant bone broths, sorghum flatbreads, and wild acacia gums across the Rift and eastern rangelands.",
    metabolicFocus: "Exceptional lipid oxidation and insulin-independent ketogenesis; low incidence of lactose intolerance due to persistent pastoralist LCT alleles.",
    macronutrientDistribution: {
      carbohydratesPct: 30,
      proteinPct: 30,
      fatPct: 40,
    },
    recommendedTraditionalStaples: ["Fermented Camel Milk (Ititu/Suusa)", "Grass-Fed Goat Bone Broth", "Mashed Sorghum / Mashilla with Ghee", "Moringa leaf soup"],
    keyBiochemicalRisks: ["Heat-stress electrolyte exhaustion", "Vitamin C and antioxidant insufficiency during prolonged dry seasons"],
    tailoredHabeshaAdvice: "Incorporate drought-resilient Moringa stenopetala (Shiferaw) leaves and wild Bedeno fruits into broths to provide essential ascorbic acid and bioflavonoids.",
  },
  enset_agro_forester: {
    id: "enset_agro_forester",
    nameAmharic: "የደቡብ እንሰት ቀጠና (Enset Agro-Forester)",
    nameEnglish: "Enset Belt Agro-Forester",
    description: "Centuries of sustainable home-garden permaculture utilizing Ensete ventricosum (Kocho, Bulla), Ayib cottage cheese, collards, and organic spiced butter.",
    metabolicFocus: "Exceptional colon microbiome diversity driven by massive prebiotic resistant starch intake; high short-chain fatty acid (butyrate) synthesis.",
    macronutrientDistribution: {
      carbohydratesPct: 55,
      proteinPct: 18,
      fatPct: 27,
    },
    recommendedTraditionalStaples: ["Fermented Kocho flatbread", "Bulla porridge with Ayib", "Gomen Kitfo with Niter Kibbeh", "Roasted cabbage leaves"],
    keyBiochemicalRisks: ["Enset is energy-dense but naturally low in protein; risk of protein-energy deficit if not paired with Ayib, beans, or fish."],
    tailoredHabeshaAdvice: "Always consume fermented Kocho accompanied by highland legume stews or fresh Ayib curd to supply complete essential amino acids (methionine and lysine).",
  },
  urban_diaspora: {
    id: "urban_diaspora",
    nameAmharic: "የከተማና ዲያስፖራ (Urban & Diaspora)",
    nameEnglish: "Urban & Modern Diaspora",
    description: "Contemporary lifestyle characterized by desk work, commercial adulterated teff/wheat blends, elevated seed oils, frequent meat stews, and high-frequency sugary coffee.",
    metabolicFocus: "Compromised insulin sensitivity, post-prandial glycemic spikes, visceral adiposity, and hyperuricemia from high-purine meat and beer consumption.",
    macronutrientDistribution: {
      carbohydratesPct: 45,
      proteinPct: 25,
      fatPct: 30,
    },
    recommendedTraditionalStaples: ["100% Whole Grain Brown Teff", "Defin Misir (Whole brown lentils)", "Braised Tikil Gomen", "Unsweetened Abol Buna with rue (Tena Adam)"],
    keyBiochemicalRisks: ["Metabolic syndrome / Type 2 diabetes", "Elevated serum uric acid (gout)", "Vitamin D deficiency from indoor lifestyle"],
    tailoredHabeshaAdvice: "Replace commercial injera (often mixed with refined wheat/rice) with certified 100% brown teff, enforce the 60-minute post-meal coffee buffer, and eliminate added cane sugar in Buna ceremonies.",
  },
};

/**
 * Enhancement 4: Evaluates Ethiopian Orthodox Fasting status and refeeding parameters
 */
export function evaluateFastingStatus(date: Date = new Date()): FastingStatusAssessment {
  const month = date.getMonth(); // 0-indexed (0 = Jan, 7 = August, etc.)
  const dayOfWeek = date.getDay(); // 0 = Sun, 3 = Wed, 5 = Fri

  let currentSeason: FastingSeason = "non_fasting_season";
  let isStrictVeganDay = false;
  let typicalDuration = 0;
  let seasonAmharic = "መደበኛ የፍስክ ወቅት (Non-Fasting Season)";

  // Month-based approximate traditional calendar boundaries:
  // Filseta: August 7 to August 22 (Month 7, approx days 7-22)
  if (month === 7 && date.getDate() >= 7 && date.getDate() <= 22) {
    currentSeason = "filseta";
    isStrictVeganDay = true;
    typicalDuration = 16;
    seasonAmharic = "ጾመ ፍልሰታ (Fast of the Assumption - 16 Days)";
  } else if ((month === 1 && date.getDate() >= 20) || month === 2 || (month === 3 && date.getDate() <= 25)) {
    // Great Lent typically spans late Feb through April
    currentSeason = "abiy_tsom";
    isStrictVeganDay = true;
    typicalDuration = 55;
    seasonAmharic = "ዐቢይ ጾም / ሁዳዴ (The Great Lent - 55 Days)";
  } else if (month === 10 && date.getDate() >= 24) {
    // Tsome Nebiyat starts Nov 24
    currentSeason = "tsome_nebiyat";
    isStrictVeganDay = true;
    typicalDuration = 43;
    seasonAmharic = "ጾመ ነቢያት (Advent / Fast of the Prophets - 43 Days)";
  } else if (dayOfWeek === 3 || dayOfWeek === 5) {
    // Wednesday or Friday weekly fast
    currentSeason = "weekly_wed_fri";
    isStrictVeganDay = true;
    typicalDuration = 1;
    seasonAmharic = dayOfWeek === 3 ? "ጾመ ረቡዕ (Wednesday Fast)" : "ጾመ ዓርብ (Friday Fast)";
  }

  return {
    currentSeason,
    seasonNameAmharic: seasonAmharic,
    isStrictVeganDay,
    typicalDurationDays: typicalDuration,
    micronutrientVulnerabilities: [
      {
        nutrient: "Vitamin B12 (Cobalamin)",
        depletionRisk: currentSeason === "abiy_tsom" ? "high" : "moderate",
        physiologicalMechanism: "Zero animal products for 55 consecutive days depletes hepatic cobalamin reserves, especially in older adults with reduced intrinsic factor.",
        indigenousCompensationStrategy: "Rely on long-fermented (72h+) Ersho teff containing symbiotic bacterial synthesis, or consume bioavailable oral cyanocobalamin / methylcobalamin.",
      },
      {
        nutrient: "Bioavailable Zinc",
        depletionRisk: "high",
        physiologicalMechanism: "High legume and grain intake with phytic acid forms insoluble zinc-phytate chelates, lowering bioavailability below 15%.",
        indigenousCompensationStrategy: "Soak lentils overnight, discard soaking water, ferment teff fully, and consume roasted pumpkin/sunflower seeds.",
      },
      {
        nutrient: "Omega-3 (EPA / DHA)",
        depletionRisk: "moderate",
        physiologicalMechanism: "Absence of fish during strict vegan fasts limits intake to plant-based ALA, which has a low (<5%) human conversion rate into active DHA.",
        indigenousCompensationStrategy: "Daily consumption of Telba (flaxseed juice) and roasted Selit (sesame paste/tahini) to maximize plant ALA substrate.",
      },
    ],
    refeedingSafeguards: {
      phase: "Post-Fast Enzymatic Re-adaptation (Fasika Refeeding Protocol)",
      protocol:
        "After breaking a major vegan fast, biliary secretion and pancreatic proteolytic enzymes (trypsin, chymotrypsin) are down-regulated. Abrupt ingestion of heavy Kitfo or fatty Doro Wot precipitates biliary colic, severe dyspepsia, and gastric distension.",
      contraindicatedFirstMeals: [
        "Raw Kitfo with high spiced butter (Niter Kibbeh)",
        "Gomen besega with heavy beef tallow",
        "Multiple hard-boiled eggs in spicy Doro Wot on empty stomach",
      ],
      digestiveSupportRemedies: [
        "Day 1: Break fast with warm vegetable or light bone broth and soft Ayib (cottage cheese).",
        "Day 2: Gradual reintroduction of tender boiled chicken (Alicha Doro) with soft steamed pumpkin.",
        "Day 3+: Traditional carminative herbal tea with dry ginger (Zingibil) and rue (Tena Adam) to stimulate gastric motility.",
      ],
    },
  };
}

/**
 * Enhancement 5: Classifies client into an authentic Ethiopian Eater Archetype
 */
export function classifyEaterArchetype(lifestyleInput: {
  region?: string;
  isDiasporaOrUrban?: boolean;
  dietaryDescription?: string;
  occupation?: string;
}): EaterArchetypeProfile {
  const text = `${lifestyleInput.region || ""} ${lifestyleInput.dietaryDescription || ""} ${lifestyleInput.occupation || ""}`.toLowerCase();

  if (lifestyleInput.isDiasporaOrUrban || text.includes("diaspora") || text.includes("addis") || text.includes("desk") || text.includes("office")) {
    return EATER_ARCHETYPES.urban_diaspora;
  }
  if (text.includes("pastoral") || text.includes("somali") || text.includes("afar") || text.includes("camel") || text.includes("goat")) {
    return EATER_ARCHETYPES.lowland_pastoralist;
  }
  if (text.includes("enset") || text.includes("kocho") || text.includes("bulla") || text.includes("gurage") || text.includes("sidama") || text.includes("wolayita") || text.includes("gamo")) {
    return EATER_ARCHETYPES.enset_agro_forester;
  }

  // Default to highland agrarian, the historical demographic majority
  return EATER_ARCHETYPES.highland_agrarian;
}
