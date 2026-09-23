/**
 * Enhancement 15: Lunar Botanical Foraging Potency Calendar
 * Enhancement 18: Pagume (ጳጉሜ) 13th-Month Cleansing Portal & Countdown
 * Enhancement 19: Sacred Geothermal Mineral Springs (Tsebel / Filwoha) Directory
 * Enhancement 20: Mindful Ethiopian Coffee Ceremony (Abol/Tona/Bereka) Somatics Engine
 *
 * DOMAIN B HERITAGE LAYER: Purely reflective, cultural, and somatic traditions.
 */

export interface LunarForagingPhase {
  phaseName: "waxing_crescent" | "full_moon" | "waning_gibbous" | "new_moon";
  phaseNameAmharic: string;
  sapDynamic: string;
  recommendedHarvestPart: "aerial_leaves_flowers" | "roots_rhizomes_bark" | "seeds_resins";
  recommendedHerbs: string[];
  traditionalRationale: string;
}

/**
 * Enhancement 15: Evaluates lunar phase and provides traditional foraging guidelines
 */
export function getLunarForagingGuidance(date: Date = new Date()): LunarForagingPhase {
  // Approximate lunar age calculation (29.53-day synodic month)
  const epoch = new Date(2000, 0, 6, 18, 14, 0).getTime();
  const diffDays = (date.getTime() - epoch) / (1000 * 60 * 60 * 24);
  const lunarAge = diffDays % 29.530588853;

  if (lunarAge >= 13 && lunarAge <= 16) {
    return {
      phaseName: "full_moon",
      phaseNameAmharic: "ሙሉ ጨረቃ (Full Lunar Radiance)",
      sapDynamic: "Peak hydrostatic pressure throughout aerial tissues; maximum volatile oil concentration.",
      recommendedHarvestPart: "aerial_leaves_flowers",
      recommendedHerbs: ["Tena Adam (Ruta)", "Besobila (Sacred Basil)", "Koseret", "Tosign (Thymus)"],
      traditionalRationale: "Parchment manuscripts instruct that fragrant aromatic leaves cut under full moonlight retain their therapeutic scent and essential oils longest.",
    };
  } else if (lunarAge > 16 && lunarAge <= 27) {
    return {
      phaseName: "waning_gibbous",
      phaseNameAmharic: "እየጎደለች ያለች ጨረቃ (Waning Moon)",
      sapDynamic: "Botanical vitality recedes into underground storage organs and roots.",
      recommendedHarvestPart: "roots_rhizomes_bark",
      recommendedHerbs: ["Zingibil (Ginger rhizome)", "Ird (Curcuma)", "Abish (Fenugreek seeds)", "Feto (Lepidium)"],
      traditionalRationale: "As the lunar light dims, plant sugars and medicinal resins concentrate in taproots and rhizomes, yielding maximum therapeutic density.",
    };
  } else if (lunarAge > 27 || lunarAge < 2) {
    return {
      phaseName: "new_moon",
      phaseNameAmharic: "ጨለማ ጨረቃ / ጽልመት (Dark / New Moon)",
      sapDynamic: "Dormancy and resting cycle; low sap circulation.",
      recommendedHarvestPart: "seeds_resins",
      recommendedHerbs: ["Karbe (Myrrh resin)", "Tikur Azmud (Black cumin seed)", "Gesho dry wood"],
      traditionalRationale: "Period of rest for living flora; ideal for collecting hardened resins and mature dry seed heads without depleting living parent plants.",
    };
  } else {
    return {
      phaseName: "waxing_crescent",
      phaseNameAmharic: "እየሞላች ያለች ጨረቃ (Waxing Crescent)",
      sapDynamic: "Upward ascent of water and minerals through vascular xylem.",
      recommendedHarvestPart: "aerial_leaves_flowers",
      recommendedHerbs: ["Damakesse (Ocimum)", "Moringa fresh leaves", "Gomen tops"],
      traditionalRationale: "Ascending sap nourishes young foliage, making this the prime phase for gathering fresh culinary and medicinal greens.",
    };
  }
}

export interface PagumeCountdownInfo {
  isCurrentlyPagume: boolean;
  daysUntilNextPagume: number;
  significanceAmharic: string;
  ritualPractices: {
    title: string;
    description: string;
  }[];
}

/**
 * Enhancement 18: Calculates Pagume (13th Month) status and purification customs
 */
export function getPagumeStatus(date: Date = new Date()): PagumeCountdownInfo {
  const month = date.getMonth(); // 0-indexed (8 = September)
  const day = date.getDate();

  // Pagume runs approximately Sept 6 to Sept 10 (or 11 in leap year)
  const isCurrentlyPagume = month === 8 && day >= 6 && day <= 11;

  // Calculate days until next Sept 6
  let targetYear = date.getFullYear();
  if (month > 8 || (month === 8 && day > 11)) {
    targetYear += 1;
  }
  const nextPagumeDate = new Date(targetYear, 8, 6);
  const diffTime = nextPagumeDate.getTime() - date.getTime();
  const daysUntil = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    isCurrentlyPagume,
    daysUntilNextPagume: daysUntil,
    significanceAmharic: "ጳጉሜ (The 13th Month of Sunshine) - 5 or 6 Epagomenal Days of Renewal",
    ritualPractices: [
      {
        title: "Dawn Water Purification (የጳጉሜ ውኃ መታጠብ)",
        description: "Bathing in cold mountain streams, springs, or rainwater before sunrise during Pagume is believed to wash away seasonal fatigue and purify the skin.",
      },
      {
        title: "Ketema Grass Spread (የቄጤማ ምንጣፍ)",
        description: "Fresh fragrant green sedge rushes (Ketema) are strewn across homes as an emblem of resurrection, fertility, and hospitality for the New Year.",
      },
      {
        title: "Reconciliation and Forgiveness (ዕርቅና ይቅርታ)",
        description: "Neighbors and family members resolve longstanding grievances before the old year expires, ensuring a clean emotional slate for Meskerem 1.",
      },
    ],
  };
}

export interface MineralSpringDestination {
  id: string;
  nameAmharic: string;
  nameEnglish: string;
  location: string;
  springType: "thermal_sulfur" | "sacred_tsebel_stream" | "soda_carbonated";
  waterTemperatureC: number;
  prominentMinerals: string[];
  traditionalAndBalneotherapeuticIndications: string;
  /** Cultural metadata is optional because historical records are incomplete. */
  culturalSignificance?: string;
  seasonalAccess?: string;
  associatedRituals?: string;
}

export const ETHIOPIAN_MINERAL_SPRINGS: MineralSpringDestination[] = [
  {
    id: "filwoha_addis",
    nameAmharic: "የአዲስ አበባ ፍልውኃ (Addis Ababa Filwoha)",
    nameEnglish: "Finfinne Thermal Springs",
    location: "Addis Ababa (Center)",
    springType: "thermal_sulfur",
    waterTemperatureC: 48,
    prominentMinerals: ["Natural Sulfur", "Sodium Bicarbonate", "Silica", "Fluoride trace"],
    traditionalAndBalneotherapeuticIndications:
      "Deep volcanic geothermal thermal baths historically used by Empress Taitu Betul. Promotes peripheral vasodilation, relieves chronic rheumatologic pain, and soothes dry eczema.",
  },
  {
    id: "sodere_hot_springs",
    nameAmharic: "የሶደሬ ፍልውኃ (Sodere Hot Springs)",
    nameEnglish: "Sodere Volcanic Springs",
    location: "East Shewa, Awash River Basin",
    springType: "thermal_sulfur",
    waterTemperatureC: 44,
    prominentMinerals: ["Dissolved Sulfur", "Magnesium Sulfate", "Calcium"],
    traditionalAndBalneotherapeuticIndications:
      "Renowned thermal spring resort surrounded by lush fig trees. Relaxes hypertonic muscle spasms and restores joint flexibility.",
  },
  {
    id: "wondo_genet",
    nameAmharic: "የወንዶ ገነት ፍልውኃ (Wondo Genet Forest Springs)",
    nameEnglish: "Wondo Genet Forest Springs",
    location: "Sidama Region",
    springType: "thermal_sulfur",
    waterTemperatureC: 42,
    prominentMinerals: ["Alkaline Silicates", "Sulfur", "Trace Potassium"],
    traditionalAndBalneotherapeuticIndications:
      "Nestled inside a moist subtropical juniper canopy. Ideal for somatic reset, psychological decompression, and deep respiratory inhalation of natural steam.",
  },
  {
    id: "entoto_tsebel",
    nameAmharic: "የእንጦጦ ማርያም ጸበል (Entoto Maryam Sacred Tsebel)",
    nameEnglish: "Entoto Sacred Spring",
    location: "Mount Entoto, Addis Ababa (2,900m)",
    springType: "sacred_tsebel_stream",
    waterTemperatureC: 14, // Crisp alpine cold spring
    prominentMinerals: ["Pure Basaltic Mountain Electrolytes", "High Dissolved Oxygen"],
    traditionalAndBalneotherapeuticIndications:
      "Sacred highland cold-water spring where pilgrims seek physical rejuvenation, spiritual solace, and cold-shock thermogenesis.",
  },
];

/**
 * Enhancement 19: Returns directory of historical balneotherapeutic springs
 */
export function getMineralSpringsDirectory(): MineralSpringDestination[] {
  return ETHIOPIAN_MINERAL_SPRINGS;
}

export interface CoffeeCeremonyStage {
  roundNameAmharic: string;
  roundNameEnglish: string;
  extractionOrder: number;
  roastSensoryPrompt: string;
  mindfulnessIntention: string;
  suggestedDurationMinutes: number;
}

export const COFFEE_CEREMONY_ROUNDS: CoffeeCeremonyStage[] = [
  {
    roundNameAmharic: "አቦል (Abol)",
    roundNameEnglish: "The First Round (Ancestral Inception)",
    extractionOrder: 1,
    roastSensoryPrompt: "Inhale the deep, rich aromatics of freshly roasted heirloom beans mingled with the holy smoke of frankincense (ዕጣን).",
    mindfulnessIntention: "Grounding and reflection: honor the ancient soil of Keffa and your lineage. Focus on deep diaphragmatic breathing.",
    suggestedDurationMinutes: 15,
  },
  {
    roundNameAmharic: "ቶና (Tona)",
    roundNameEnglish: "The Second Round (Communal Fellowship)",
    extractionOrder: 2,
    roastSensoryPrompt: "Water is added to the Jebena pot; as the heat re-extracts the beans, a smoother, rounder aroma fills the air.",
    mindfulnessIntention: "Harmony and reconciliation: listen openly to those seated around you. Express gratitude for shared shelter and nourishment.",
    suggestedDurationMinutes: 12,
  },
  {
    roundNameAmharic: "በረካ (Bereka)",
    roundNameEnglish: "The Third Round (The Sacred Blessing)",
    extractionOrder: 3,
    roastSensoryPrompt: "The final, gentle extraction—light, sweet, and comforting. Enjoy with freshly popped white popcorn (ፈንዲሻ).",
    mindfulnessIntention: "Blessing and peace: receive the benediction of elders for prosperity, Welbeing, and a calm spirit.",
    suggestedDurationMinutes: 10,
  },
];

/**
 * Enhancement 20: Evaluates coffee ceremony timing and validates the 60-minute post-meal iron buffer
 */
export function evaluateCoffeeTiming(minutesSinceLastMeal: number): {
  isSafeToBrew: boolean;
  ironChelationWarning: boolean;
  minutesRemainingToSafeBuffer: number;
  biochemicalExplanation: string;
  ceremonyRounds: CoffeeCeremonyStage[];
} {
  const safeBufferMinutes = 60;
  const isSafe = minutesSinceLastMeal >= safeBufferMinutes;
  const remaining = Math.max(0, safeBufferMinutes - minutesSinceLastMeal);

  return {
    isSafeToBrew: isSafe,
    ironChelationWarning: !isSafe,
    minutesRemainingToSafeBuffer: remaining,
    biochemicalExplanation: isSafe
      ? "Sufficient post-prandial time has elapsed. Dietary non-heme iron from your teff or legume meal has cleared the proximal duodenum; polyphenols in Buna will not chelate iron."
      : `High concentrations of chlorogenic acids and polyphenolic tannins in Ethiopian coffee bind unabsorbed dietary iron, reducing iron absorption by up to 70-80%. Please wait ${remaining} more minutes before starting the Abol round.`,
    ceremonyRounds: COFFEE_CEREMONY_ROUNDS,
  };
}
