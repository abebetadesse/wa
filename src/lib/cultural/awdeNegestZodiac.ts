/**
 * Enhancement 13: Awde Negest (አውደ ነገሥት) Ge'ez Zodiac Constellations
 * Enhancement 14: Four Classical Zemen Humoral Elements (አራቱ ባሕርያት)
 *
 * DOMAIN B HERITAGE LAYER: Strictly isolated from clinical and diagnostic computations.
 * Provides cultural self-reflection rooted in classical Ethiopian parchment manuscripts.
 */

export type HumoralElement = "esat" | "nifas" | "may" | "afere"; // Fire, Air, Water, Earth

export interface AwdeNegestSign {
  id: string;
  geezName: string;
  englishName: string;
  symbol: string;
  dateRange: string;
  element: HumoralElement;
  elementAmharic: string;
  rulingSphere: string;
  traditionalTemperament: string;
  culturalReflectiveTheme: string;
  traditionalBotanicalAffinity: string;
  /** Optional metadata used by the cultural exploration UI. */
  houseNumber?: number;
  compatibleSigns?: string[];
}

export const AWDE_NEGEST_SIGNS: AwdeNegestSign[] = [
  {
    id: "hamel",
    geezName: "ሐመል (Hamel)",
    englishName: "The Ram (Aries)",
    symbol: "♈",
    dateRange: "Miyazya 1 – Ginbot 2 (Apr 9 – May 10)",
    element: "esat",
    elementAmharic: "እሳት (Fire - Warm & Dry)",
    rulingSphere: "Merikh (ማርስ / Mars)",
    traditionalTemperament: "Pioneering courage, dynamic initiative, fierce independence",
    culturalReflectiveTheme: "Awakening of spring rains and emergence of new shoots across the highlands.",
    traditionalBotanicalAffinity: "Tena Adam (Ruta chalepensis) & Zingibil (Zingiber officinale)",
  },
  {
    id: "sowr",
    geezName: "ሰውር (Sowr)",
    englishName: "The Bull (Taurus)",
    symbol: "♉",
    dateRange: "Ginbot 3 – Sene 3 (May 11 – Jun 10)",
    element: "afere",
    elementAmharic: "አፈር (Earth - Cold & Dry)",
    rulingSphere: "Zuhara (ቬነስ / Venus)",
    traditionalTemperament: "Patience, grounded loyalty, enduring physical strength",
    culturalReflectiveTheme: "Plowing the black vertisols in preparation for the great Meher sowing.",
    traditionalBotanicalAffinity: "Teff (Eragrostis tef) & Korerima (Aframomum corrorima)",
  },
  {
    id: "jawza",
    geezName: "ጀውዛ (Jawza)",
    englishName: "The Twins (Gemini)",
    symbol: "♊",
    dateRange: "Sene 4 – Hamle 4 (Jun 11 – Jul 11)",
    element: "nifas",
    elementAmharic: "ንፋስ (Air - Warm & Moist)",
    rulingSphere: "Utarid (ሜርኩሪ / Mercury)",
    traditionalTemperament: "Intellectual agility, eloquence, multifaceted curiosity",
    culturalReflectiveTheme: "Vigorous mountain winds carrying the moisture of the Atlantic monsoon.",
    traditionalBotanicalAffinity: "Koseret (Lippia abyssinica) & Tosign (Thymus serrulatus)",
  },
  {
    id: "saratan",
    geezName: "ሰርጣን (Saratan)",
    englishName: "The Crab (Cancer)",
    symbol: "♋",
    dateRange: "Hamle 5 – Nehase 6 (Jul 12 – Aug 12)",
    element: "may",
    elementAmharic: "ማይ (Water - Cold & Moist)",
    rulingSphere: "Qemer (ጨረቃ / Moon)",
    traditionalTemperament: "Emotional depth, nurturing sanctuary, protective devotion",
    culturalReflectiveTheme: "Torrential Kiremt downpours swelling the sacred Blue Nile (Abay).",
    traditionalBotanicalAffinity: "Enset (Ensete ventricosum) & Damakesse (Ocimum lamiifolium)",
  },
  {
    id: "asad",
    geezName: "አሰድ (Asad)",
    englishName: "The Lion (Leo)",
    symbol: "♌",
    dateRange: "Nehase 7 – Meskerem 6 (Aug 13 – Sep 16)",
    element: "esat",
    elementAmharic: "እሳት (Fire - Warm & Dry)",
    rulingSphere: "Shems (ፀሐይ / Sun)",
    traditionalTemperament: "Magnanimity, noble leadership, radiant warmth",
    culturalReflectiveTheme: "Golden sunlight returning through parting cloud mists above alpine peaks.",
    traditionalBotanicalAffinity: "Tikur Azmud (Nigella sativa) & Gesho (Rhamnus prinoides)",
  },
  {
    id: "sunbula",
    geezName: "ሱንቡላ (Sunbula)",
    englishName: "The Ear of Grain (Virgo)",
    symbol: "♍",
    dateRange: "Meskerem 7 – Tikimt 7 (Sep 17 – Oct 17)",
    element: "afere",
    elementAmharic: "አፈር (Earth - Cold & Dry)",
    rulingSphere: "Utarid (ሜርኩሪ / Mercury)",
    traditionalTemperament: "Analytical precision, service to community, discernment",
    culturalReflectiveTheme: "The yellow carpets of Adey Abeba and the ripening of barley fields.",
    traditionalBotanicalAffinity: "Gebs (Barley) & Feto (Lepidium sativum)",
  },
  {
    id: "mizan",
    geezName: "ሚዛን (Mizan)",
    englishName: "The Scales (Libra)",
    symbol: "♎",
    dateRange: "Tikimt 8 – Hidar 8 (Oct 18 – Nov 17)",
    element: "nifas",
    elementAmharic: "ንፋስ (Air - Warm & Moist)",
    rulingSphere: "Zuhara (ቬነስ / Venus)",
    traditionalTemperament: "Harmonious balance, mediation, appreciation of sacred beauty",
    culturalReflectiveTheme: "Clear azure highland skies and communal reconciliation festivities.",
    traditionalBotanicalAffinity: "Besobila (Sacred Basil) & Nech Azmud (Trachyspermum ammi)",
  },
  {
    id: "aqrab",
    geezName: "አቅረብ (Aqrab)",
    englishName: "The Scorpion (Scorpio)",
    symbol: "♏",
    dateRange: "Hidar 9 – Tahsas 9 (Nov 18 – Dec 18)",
    element: "may",
    elementAmharic: "ማይ (Water - Cold & Moist)",
    rulingSphere: "Merikh (ማርስ / Mars)",
    traditionalTemperament: "Deep regenerative insight, unyielding tenacity, mystical intuition",
    culturalReflectiveTheme: "Subterranean springs and the hidden roots storing winter sustenance.",
    traditionalBotanicalAffinity: "Abish (Trigonella foenum-graecum) & Karbe (Myrrh)",
  },
  {
    id: "qaws",
    geezName: "ቀውስ (Qaws)",
    englishName: "The Bow / Archer (Sagittarius)",
    symbol: "♐",
    dateRange: "Tahsas 10 – Tir 9 (Dec 19 – Jan 17)",
    element: "esat",
    elementAmharic: "እሳት (Fire - Warm & Dry)",
    rulingSphere: "Mushtari (ጁፒተር / Jupiter)",
    traditionalTemperament: "Philosophical vision, boundless aspiration, pursuit of truth",
    culturalReflectiveTheme: "Campfires under pristine mountain skies celebrating Genna and Timkat.",
    traditionalBotanicalAffinity: "Eret (Aloe debrana) & Kolo grains",
  },
  {
    id: "jady",
    geezName: "ጀዲ (Jady)",
    englishName: "The Sea-Goat (Capricorn)",
    symbol: "♑",
    dateRange: "Tir 10 – Yakatit 8 (Jan 18 – Feb 15)",
    element: "afere",
    elementAmharic: "አፈር (Earth - Cold & Dry)",
    rulingSphere: "Zuhal (ሳተርን / Saturn)",
    traditionalTemperament: "Disciplined mastery, ancestral reverence, enduring resilience",
    culturalReflectiveTheme: "Ancient stone megaliths and monastery walls weathering dry desert winds.",
    traditionalBotanicalAffinity: "Kosso (Hagenia abyssinica) & Telba (Flaxseed)",
  },
  {
    id: "dalwi",
    geezName: "ደልዊ (Dalwi)",
    englishName: "The Water-Bearer (Aquarius)",
    symbol: "♒",
    dateRange: "Yakatit 9 – Megabit 9 (Feb 16 – Mar 17)",
    element: "nifas",
    elementAmharic: "ንፋስ (Air - Warm & Moist)",
    rulingSphere: "Zuhal (ሳተርን / Saturn)",
    traditionalTemperament: "Visionary humanism, egalitarian spirit, innovative detachment",
    culturalReflectiveTheme: "Water poured during Timkat blessings sanctifying the soil for humanity.",
    traditionalBotanicalAffinity: "Tazma Mar & Shiferaw (Moringa stenopetala)",
  },
  {
    id: "hwt",
    geezName: "ሑት (Hwt)",
    englishName: "The Fish (Pisces)",
    symbol: "♓",
    dateRange: "Megabit 10 – Miyazya 1 (Mar 18 – Apr 8)",
    element: "may",
    elementAmharic: "ማይ (Water - Cold & Moist)",
    rulingSphere: "Mushtari (ጁፒተር / Jupiter)",
    traditionalTemperament: "Compassionate empathy, mystical transcendence, lyrical artistry",
    culturalReflectiveTheme: "Sacred Lake Tana islands where ancient parchment scripts rest in peace.",
    traditionalBotanicalAffinity: "Wanza (Cordia africana) & Tosign Thyme",
  },
];

export interface HumoralBalanceProfile {
  element: HumoralElement;
  nameAmharic: string;
  qualities: string;
  associatedBodilyHumor: string;
  traditionalTemperament: string;
  dietaryHarmonizationAdvice: string;
  traditionalHerbalTeas: string[];
}

export const HUMORAL_ELEMENTS: Record<HumoralElement, HumoralBalanceProfile> = {
  esat: {
    element: "esat",
    nameAmharic: "እሳት (Fire / Safra)",
    qualities: "ሙቅና ደረቅ (Hot & Dry)",
    associatedBodilyHumor: "ሐሞት (Yellow Bile / Choler)",
    traditionalTemperament: "Fiery drive, decisive leadership, quick digestion; can run hot or irritable when out of balance.",
    dietaryHarmonizationAdvice: "Balance internal heat with cooling, hydrating infusions (lemon balm, light tosign, barley water) and soothing fermented enset or fresh cucumber.",
    traditionalHerbalTeas: ["Tosign (Mountain Thyme)", "Fresh Lemongrass", "Wild Rosehip infusion"],
  },
  nifas: {
    element: "nifas",
    nameAmharic: "ንፋስ (Air / Dam)",
    qualities: "ሙቅና ርጥብ (Hot & Moist)",
    associatedBodilyHumor: "ደም (Blood / Sanguine)",
    traditionalTemperament: "Sociable, enthusiastic, spontaneous; prone to restless agitation or mental dispersiveness.",
    dietaryHarmonizationAdvice: "Anchor airy tendencies with grounding roasted grains (barley kolo, whole lentils), healthy spiced ghee, and calm rhythm in eating.",
    traditionalHerbalTeas: ["Koseret (Lippia abyssinica)", "Besobila infusion", "Chamomile with honey"],
  },
  may: {
    element: "may",
    nameAmharic: "ማይ (Water / Balgham)",
    qualities: "ቀዝቃዛና ርጥብ (Cold & Moist)",
    associatedBodilyHumor: "አክታ (Phlegm / Phlegmatic)",
    traditionalTemperament: "Calm, deeply patient, peace-loving; prone to sluggish digestion, heaviness, or respiratory congestion when cold.",
    dietaryHarmonizationAdvice: "Invigorate slow metabolism with warming carminative spices (ginger, black cardamom, rue, black cumin) and dry-cooked foods.",
    traditionalHerbalTeas: ["Zingibil (Fresh ginger) with clove", "Korerima spiced warm tea", "Tena Adam hot water"],
  },
  afere: {
    element: "afere",
    nameAmharic: "አፈር (Earth / Sawda)",
    qualities: "ቀዝቃዛና ደረቅ (Cold & Dry)",
    associatedBodilyHumor: "ጸሊም ሐሞት (Black Bile / Melancholic)",
    traditionalTemperament: "Methodical, deeply loyal, reflective; prone to worry, dry skin, and digestive stiffness under stress.",
    dietaryHarmonizationAdvice: "Nourish dry earth constitution with warm, moist, unctuous foods: rich broths, soft bulla porridge, flaxseed (telba), and clarified butter.",
    traditionalHerbalTeas: ["Warm Telba (Flaxseed milk)", "Abish (Fenugreek) soothing infusion", "Ginger with cinnamon"],
  },
};

/**
 * Enhancement 13: Look up Awde Negest sign by ID or approximate month/day
 */
export function getAwdeNegestSign(signId: string): AwdeNegestSign | undefined {
  return AWDE_NEGEST_SIGNS.find((s) => s.id === signId.toLowerCase());
}

/**
 * Enhancement 14: Get Humoral element profile
 */
export function getHumoralProfile(element: HumoralElement): HumoralBalanceProfile {
  return HUMORAL_ELEMENTS[element];
}
