import {
  DabtaraHealingScrollPrescription,
  HumoralElement,
  TsebelAuspiciousTiming,
  ZodiacSignName,
} from "../types";

export interface AwdeNegestSignMatch {
  geezName: string;
  englishName: string;
  symbol: string;
  dateRange: string;
  rulingSphere: string;
  traditionalTemperament: string;
}

export const AWDE_NEGEST_TABLE: Record<ZodiacSignName, AwdeNegestSignMatch> = {
  Aries: {
    geezName: "ሐመል (Hamel)",
    englishName: "The Ram",
    symbol: "♈",
    dateRange: "Miyazya 1 – Ginbot 2 (Apr 9 – May 10)",
    rulingSphere: "Merikh (ማርስ / Mars)",
    traditionalTemperament: "Pioneering courage, dynamic initiative, fiery metabolic drive",
  },
  Taurus: {
    geezName: "ሰውር (Sowr)",
    englishName: "The Bull",
    symbol: "♉",
    dateRange: "Ginbot 3 – Sene 3 (May 11 – Jun 10)",
    rulingSphere: "Zuhara (ቬነስ / Venus)",
    traditionalTemperament: "Enduring stability, grounded perseverance, robust physical frame",
  },
  Gemini: {
    geezName: "ጀውዛ (Jawza)",
    englishName: "The Twins",
    symbol: "♊",
    dateRange: "Sene 4 – Hamle 4 (Jun 11 – Jul 11)",
    rulingSphere: "Utarid (ሜርኩሪ / Mercury)",
    traditionalTemperament: "Cognitive agility, multifaceted curiosity, swift speech and movement",
  },
  Cancer: {
    geezName: "ሰርጣን (Saratan)",
    englishName: "The Crab",
    symbol: "♋",
    dateRange: "Hamle 5 – Nehase 6 (Jul 12 – Aug 12)",
    rulingSphere: "Qemer (ጨረቃ / Moon)",
    traditionalTemperament: "Protective sanctuary, deep emotional memory, somatic sensitivity",
  },
  Leo: {
    geezName: "አሰድ (Asad)",
    englishName: "The Lion",
    symbol: "♌",
    dateRange: "Nehase 7 – Meskerem 6 (Aug 13 – Sep 16)",
    rulingSphere: "Shems (ፀሐይ / Sun)",
    traditionalTemperament: "Radiant magnanimity, sovereign heart vigor, noble executive presence",
  },
  Virgo: {
    geezName: "ሰንቡላ (Senbula)",
    englishName: "The Sheaf / Ear of Grain",
    symbol: "♍",
    dateRange: "Meskerem 7 – Tikimt 6 (Sep 17 – Oct 16)",
    rulingSphere: "Utarid (ሜርኩሪ / Mercury)",
    traditionalTemperament: "Discerning precision, digestive hygiene, methodical craftsmanship",
  },
  Libra: {
    geezName: "ሚዛን (Mizan)",
    englishName: "The Scales",
    symbol: "♎",
    dateRange: "Tikimt 7 – Hidar 7 (Oct 17 – Nov 16)",
    rulingSphere: "Zuhara (ቬነስ / Venus)",
    traditionalTemperament: "Equilibrium, aesthetic harmony, relational balance, diplomatic calm",
  },
  Scorpio: {
    geezName: "አቅራብ (Akrab)",
    englishName: "The Scorpion",
    symbol: "♏",
    dateRange: "Hidar 8 – Tahsas 8 (Nov 17 – Dec 17)",
    rulingSphere: "Merikh / Pluto (ማርስ / ፕሉቶ)",
    traditionalTemperament: "Intense regenerative power, deep emotional discernment, resilience under hardship",
  },
  Sagittarius: {
    geezName: "ቀውስ (Qaws)",
    englishName: "The Archer / Bow",
    symbol: "♐",
    dateRange: "Tahsas 9 – Tir 9 (Dec 18 – Jan 17)",
    rulingSphere: "Mushtari (ጁፒተር / Jupiter)",
    traditionalTemperament: "Philosophical optimism, highland wanderer, expansive athletic stamina",
  },
  Capricorn: {
    geezName: "ጃዲ (Jadi)",
    englishName: "The Wild Ibex / Mountain Goat (Walia)",
    symbol: "♑",
    dateRange: "Tir 10 – Yakatit 9 (Jan 18 – Feb 16)",
    rulingSphere: "Zuhal (ሳተርን / Saturn)",
    traditionalTemperament: "Alpine endurance, structural discipline, patience across generations",
  },
  Aquarius: {
    geezName: "ደለው (Delaw)",
    englishName: "The Water-Bearer / Bucket",
    symbol: "♒",
    dateRange: "Yakatit 10 – Magabit 10 (Feb 17 – Mar 19)",
    rulingSphere: "Zuhal / Uranos (ሳተርን / ዩራኑስ)",
    traditionalTemperament: "Altruistic vision, collective solidarity, progressive community innovation",
  },
  Pisces: {
    geezName: "ሁት (Hut)",
    englishName: "The Fish",
    symbol: "♓",
    dateRange: "Magabit 11 – Miyazya 1 (Mar 20 – Apr 8)",
    rulingSphere: "Mushtari / Neptun (ጁፒተር / ኔፕቱን)",
    traditionalTemperament: "Mystical empathy, oceanic devotion, subtle immune porousness",
  },
};

export function getAwdeNegestZodiacMatch(sign: ZodiacSignName, birthDateStr?: string): AwdeNegestSignMatch {
  return AWDE_NEGEST_TABLE[sign] || AWDE_NEGEST_TABLE.Aries;
}

export function getDabtaraScrollPrescriptions(
  sunSign: ZodiacSignName,
  humor: HumoralElement
): DabtaraHealingScrollPrescription[] {
  const prescriptions: DabtaraHealingScrollPrescription[] = [
    {
      title: "Awde Negest Celestial Heart & Vitality Inscription",
      geezTitle: "መጽሐፈ ፈውስ ዘዓውደ ፀሐይ (Mets'hafe Fewus Ze'Awde Tsehay)",
      targetImbalance: "Fatigue, arterial stress, and depletion of metabolic life force ('Hiwot')",
      celestialHour: "First hour of dawn (Tsehay rising on Sunday / Ehud)",
      planetaryRuler: "Sun (ፀሐይ / Shems)",
      medicinalHerbs: ["Damakesse (Ocimum lamiifolium)", "Tikur Azmud (Nigella sativa)", "Pure Raw Highland Honey (Mar)"],
      preparationInstructions: "Infuse fresh Damakesse leaves in freshly boiled spring water for 7 minutes; stir in 1/2 teaspoon of freshly ground Tikur Azmud and a spoonful of honey. Inhale the aromatic steam before sipping slowly while facing east.",
      sacredSymbolism: "Inscribed with the solar cross motif representing divine light overcoming darkness and sluggish humoral stagnation.",
      modernClinicalPrecaution: "Safe for general consumption; avoid excessive Nigella sativa intake if currently on prescription anti-hypertensive or hypoglycemic medications without clinical monitoring.",
    },
    {
      title: "Däbtära Humoral Cooling & Digestive Harmony Scroll",
      geezTitle: "መጽሐፈ ማስተስርይ ዘከርሥ (Mets'hafe Mastesrey Ze'Kers)",
      targetImbalance: "Gastric burning, excess metabolic bile, bile reflux, and irritable temperament",
      celestialHour: "Evening cooling twilight (Qemer hour on Monday / Senyo)",
      planetaryRuler: "Moon & Venus (ጨረቃ ወቬነስ)",
      medicinalHerbs: ["Tena Adam (Ruta chalepensis)", "Koseret (Lippia abyssinica)", "Ayib (Traditional fresh cottage cheese whey)"],
      preparationInstructions: "Steep a gentle sprig of Tena Adam and Koseret in lukewarm water; sip alongside a cup of fresh lactic whey (Ayib water) to coat and calm the esophageal and gastric linings.",
      sacredSymbolism: "Traditional parchment talisman invoking the dew of Mount Hermon to quench visceral fires.",
      modernClinicalPrecaution: "MANDATORY SAFETY GATE: Tena Adam contains furanocoumarins and is strictly contraindicated during pregnancy and in clients taking Warfarin or direct oral anticoagulants.",
    },
    {
      title: "Alpine Spleen & Musculoskeletal Warming Formula",
      geezTitle: "መጽሐፈ አቃቤ ርእስ ወአዕፅምት (Mets'hafe Akabe Re'es We'A'tsimt)",
      targetImbalance: "Joint stiffness, lower back cold sensitivity during Bega winds, and melancholic stagnation",
      celestialHour: "Midday Saturday (Zuhal hour / Kidame)",
      planetaryRuler: "Saturn & Mars (ሳተርን ወማርስ)",
      medicinalHerbs: ["Zingibil (Zingiber officinale)", "Korerima (Aframomum corrorima)", "Sesame oil (Selit zeyt)"],
      preparationInstructions: "Warm unrefined sesame oil with a pinch of powdered Korerima and Ginger; massage gently into lumbar spine and cold joints before bedtime.",
      sacredSymbolism: "Parchment seal of Saint George (Giyorgis) representing steadfast triumph over bodily infirmity.",
      modernClinicalPrecaution: "For external topical application; perform patch test on inner forearm to ensure no dermal contact sensitivity.",
    },
  ];

  return prescriptions;
}

export function getTsebelTimingForSunAndMoon(
  sunSign: ZodiacSignName,
  moonSign: ZodiacSignName,
  humor: HumoralElement
): TsebelAuspiciousTiming {
  const springs: Record<HumoralElement, { spring: string; location: string; days: string[]; month: string; mineral: string }> = {
    esat: {
      spring: "Wolisso & Sodere Thermal Mineral Spring (ወሊሶ ወሶደሬ)",
      location: "Southwest Shewa & Upper Awash Rift Valley",
      days: ["Sunday (እሁድ)", "Wednesday (ረቡዕ)"],
      month: "Meskerem & Tikimt (Autumnal transition)",
      mineral: "Rich in volcanic silica, mild sulfur, and cooling bicarbonate anions to temper metabolic fire and soothe stressed musculature.",
    },
    afere: {
      spring: "Debre Libanos Sacred Cliff Springs (ደብረ ሊባኖስ ጸበል)",
      location: "North Shewa Plateau Highlands",
      days: ["Saturday (ቅዳሜ)", "Tuesday (ማክሰኞ)"],
      month: "Tir & Yakatit (Highland sunny winter)",
      mineral: "Pure limestone and basalt-filtered alkaline waters rich in calcium and magnesium to nourish skeletal density and ease joint rigidity.",
    },
    nifas: {
      spring: "Ambo Mineral Thermal Baths (አምቦ ፍልውሃ)",
      location: "West Shewa Highland Basin",
      days: ["Friday (ዓርብ)", "Monday (ሰኞ)"],
      month: "Ginbot & Sene (Pre-monsoon awakening)",
      mineral: "Effervescent naturally carbonated waters high in dissolved magnesium and potassium to steady the autonomic nervous system and soothe lung airways.",
    },
    may: {
      spring: "Filwoha Imperial Thermal Springs (ፍልውሃ አዲስ አበባ)",
      location: "Central Addis Ababa Hot Springs Complex",
      days: ["Tuesday (ማክሰኞ)", "Thursday (ሐሙስ)"],
      month: "Hamle & Nehase (Kiremt peak rains)",
      mineral: "Hyper-thermal sodium sulfate and chloride waters (52°C) celebrated for mobilizing lymphatic circulation and clearing deep sinus stagnation.",
    },
  };

  const selected = springs[humor] || springs.esat;

  return {
    recommendedSpring: selected.spring,
    springLocation: selected.location,
    auspiciousDaysOfWeek: selected.days,
    ethiopianMonth: selected.month,
    planetaryRuler: humor === "esat" ? "Sun & Mars" : humor === "afere" ? "Saturn & Mercury" : humor === "nifas" ? "Mercury & Jupiter" : "Moon & Venus",
    therapeuticMineralResonance: selected.mineral,
    holisticIntention: "Harmonize the inner humoral currents with the living mineral waters of the Ethiopian highlands, fostering somatic purification, emotional clarity, and cellular reset.",
  };
}
