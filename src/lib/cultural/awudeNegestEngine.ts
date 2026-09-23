/**
 * Classical Ethiopian AwudeNegest (አውደ ነገሥት / Circle of the King) & Däbtära Tradition Engine
 * 16 Circular Tables with 16 Day/Night Sections, 60 Prediction Categories,
 * Ge'ez Fidel Arithmetic, and Däbtära Healing Scroll Manuscript Wisdom
 */

import { HumoralElement } from "@/lib/profiling/types";
import {
  AwudeNegestCircle,
  AwudeNegestReadingResult,
  AwudeNegestSection,
  DabtaraManuscriptWisdom,
} from "@/lib/profiling/extendedTypes";
import { GEEZ_LETTER_VALUES } from "./geezFidelGematria";

// Classical 60 Prediction Categories recognized in AwudeNegest parchment scrolls
export const AWUDE_NEGEST_60_CATEGORIES = [
  { id: "marriage", en: "Marriage & Betrothal", am: "ጋብቻና ጋብቻ ስምምነት" },
  { id: "travel", en: "Travel & Safe Journey", am: "መንገድና ጉዞ ሰላም" },
  { id: "enmity", en: "Enmity & Resolution", am: "ጠላትና ዕርቅ" },
  { id: "pregnancy", en: "Pregnancy & Safe Delivery", am: "ጽንስና ምጥ በደህና" },
  { id: "trial", en: "Trial & Legal Vindication", am: "ፍርድና ሙግት" },
  { id: "illness", en: "Illness & Recovery", am: "ሕመም፣ ደዌና ፈውስ" },
  { id: "business", en: "Commerce & Trading Profits", am: "ንግድና ትርፍ" },
  { id: "love", en: "Love & Affectionate Bond", am: "ፍቅርና መዋደድ" },
  { id: "career", en: "Rank & Public Honor", am: "ሹመት፣ ማዕረግና ሥራ" },
  { id: "Welbeing", en: "Vitality & Bodily Temperament", am: "ጤናና የሰውነት ባሕርይ" },
  { id: "rain", en: "Seasonal Rains & Blessing", am: "ዝናብና በረከት" },
  { id: "harvest", en: "Crops & Agricultural Yield", am: "እህልና መከር" },
  { id: "lost_property", en: "Recovery of Lost Goods", am: "የጠፋ ዕቃ መመለስ" },
  { id: "friendship", en: "Friendship & Trustworthy Counsel", am: "ወዳጅነትና እምነት" },
  { id: "partnership", en: "Joint Enterprise", am: "ሽርክናና ኅብረት" },
  { id: "relocation", en: "Moving & New Dwelling", am: "ቤት መቀየርና አዲስ ኑሮ" },
  { id: "victory", en: "Triumph over Hardship", am: "ድልና መውጣት" },
  { id: "spiritual_blessing", en: "Sacred Blessing & Penance", am: "በረከተ መንፈስና ንስሐ" },
  { id: "inheritance", en: "Inheritance & Family Estate", am: "ርስትና ቅርስ" },
  { id: "peace_at_home", en: "Domestic Harmony", am: "የቤት ውስጥ ሰላም" },
  { id: "children_future", en: "Destiny of Progeny", am: "የልጆች ዕድል" },
  { id: "reputation", en: "Good Name & Dignity", am: "መልካም ስምና ክብር" },
  { id: "debts", en: "Release from Debt", am: "ዕዳና ማገገም" },
  { id: "craftsmanship", en: "Artisanship & Building", am: "ዕደ ጥበብና ሥራ" },
  { id: "secrets", en: "Discovery of Hidden Truths", am: "የተሰወረ ምሥጢር መገለጥ" },
  { id: "livestock", en: "Cattle & Herd Welbeing", am: "ከብቶችና እንስሳት ደኅንነት" },
  { id: "drought_defense", en: "Protection from Scarcity", am: "ድርቅን መከላከል" },
  { id: "reconciliation", en: "Reconciliation of Kinsmen", am: "የዘመድ ዕርቅ" },
  { id: "peace_of_mind", en: "Inner Tranquility", am: "የልብ ዕረፍትና ሰላም" },
  { id: "pilgrimage", en: "Pilgrimage to Sacred Monasteries", am: "ደብረ ገዳማት ንግሥ" },
  { id: "wisdom_study", en: "Scholarly Studies & Books", am: "ንባብና ጥበብ" },
  { id: "tsebel_healing", en: "Holy Water Therapeutic Response", am: "ጸበልና ተዓምር" },
  { id: "stranger_intent", en: "Discerning Strangers", am: "የእንግዳ ልብ ማወቅ" },
  { id: "safe_return", en: "Safe Return from Afar", am: "ከሩቅ አገር በሰላም መመለስ" },
  { id: "famine_deliverance", en: "Deliverance from Hardship", am: "ከችግር መገላገል" },
  { id: "protection_from_evil", en: "Protection from Spells (መክስተ አጋንንት)", am: "መጠበቅና ድነት" },
  { id: "longevity", en: "Prolonged Life & Grace", am: "ዕድሜና ጸጋ" },
  { id: "mental_calm", en: "Somatic Emotional Stability", am: "የአእምሮ ጽናት" },
  { id: "dreams", en: "Interpretation of Night Visions", am: "ሕልም መፍታት" },
  { id: "generosity", en: "Almsgiving & Multiplication", am: "ምጽዋትና በረከት" },
  { id: "leadership", en: "Community Guidance", am: "ሽምግልናና መሪነት" },
  { id: "barrenness_reversal", en: "Fruitfulness of the Womb", am: "መካንነትን መሻር" },
  { id: "eye_Welbeing", en: "Clarity of Vision & Eye Care", am: "የዐይን ብርሃን" },
  { id: "joint_aches", en: "Easing Bone & Joint Imbalance", am: "የአጥንትና የቁርጥማት ቅለት" },
  { id: "respiratory_breath", en: "Free Breath & Mountain Air", am: "የትንፋሽ ሰላም" },
  { id: "fever_reduction", en: "Balancing Internal Fire", am: "የእሳት ሙቀት ማቀዝቀዝ" },
  { id: "highland_cold", en: "Warmth Against Alpine Chill", am: "ብርድ መቋቋም" },
  { id: "spring_water", en: "Discovery of Clean Springs", am: "ምንጭ ማግኘት" },
  { id: "honey_harvest", en: "Beekeeping & Sweet Yield", am: "ንብና ማር በረከት" },
  { id: "grain_storage", en: "Safekeeping of Gotera Grain", am: "ጎተራ እህል መጠበቅ" },
  { id: "coffee_blessing", en: "Buna Ceremony Peace", am: "የቡና በረከት" },
  { id: "weaving", en: "Fabric & Cotton Shema Weaving", am: "ጥልፍና ድግሥ" },
  { id: "talisman_alignment", en: "Ketab Parchment Harmony", am: "የክታብ ስምምነት" },
  { id: "court_advocacy", en: "Speaking Before Rulers", am: "በሹማምንት ፊት መናገር" },
  { id: "courage_in_danger", en: "Bravery When Facing Peril", am: "ልብ ጽናት በጭንቅ" },
  { id: "forgiveness", en: "Cleansing of Faults", am: "ይቅርታ ማግኘት" },
  { id: "humoral_balance", en: "Equilibrium of Four Humors", am: "አራቱ ባሕርያት ማስተካከል" },
  { id: "purity_of_heart", en: "Simplicity and Faith", am: "የልብ ንጽሕና" },
  { id: "guest_welcome", en: "Hospitality & House Blessing", am: "የእንግዳ መስተንግዶ" },
  { id: "final_peace", en: "Graceful Completion of Affairs", am: "ጉዳይ በሰላም መፈጸም" },
];

// Initialize the 16 Magic Circles of AwudeNegest with traditional names, regents, elements, and 16 day/night sections
export function initialize16Circles(): AwudeNegestCircle[] {
  const circleTemplates = [
    { name: "Circle of Michael (አውደ ሚካኤል - መጋቢ)", geez: "አውደ ሚካኤል", symbol: "⚔️", angel: "ቅዱስ ሚካኤል", element: "esat" as HumoralElement, temp: "Courageous defender, decisive breaker of stagnation", prophecy: "Favorable outcome through righteousness and bold initiative." },
    { name: "Circle of Gabriel (አውደ ገብርኤል - አብሳሪ)", geez: "አውደ ገብርኤል", symbol: "🕊️", angel: "ቅዱስ ገብርኤል", element: "may" as HumoralElement, temp: "Bringer of joyful tidings, peaceful reconciliation, and relief", prophecy: "New creative beginnings and deliverance from heavy burdens." },
    { name: "Circle of Raphael (አውደ ሩፋኤል - ፈዋሽ)", geez: "አውደ ሩፋኤል", symbol: "🌿", angel: "ቅዱስ ሩፋኤል", element: "nifas" as HumoralElement, temp: "Restorative healer, traveler's guide, balm for pain", prophecy: "Accelerated healing and harmonious travels across all roads." },
    { name: "Circle of Uriel (አውደ ዑራኤል - መብረቀ ብርሃን)", geez: "አውደ ዑራኤል", symbol: "⚡", angel: "ቅዱስ ዑራኤል", element: "esat" as HumoralElement, temp: "Awakener of deep conscience, lightning illumination", prophecy: "Hidden truths come into the open; clarify motives before acting." },
    { name: "Circle of Phanuel (አውደ ፋኑኤል - ንስሐ)", geez: "አውደ ፋኑኤል", symbol: "📜", angel: "ቅዱስ ፋኑኤል", element: "afere" as HumoralElement, temp: "Repentance, expulsion of malice, interior serenity", prophecy: "Release past grudges to invite unprecedented abundance." },
    { name: "Circle of Raguel (አውደ ራጉኤል - ተበቃሊ)", geez: "አውደ ራጉኤል", symbol: "⚖️", angel: "ቅዱስ ራጉኤል", element: "nifas" as HumoralElement, temp: "Righteous equilibrium, equitable contracts, civic justice", prophecy: "Legal and moral disputes resolve with fairness." },
    { name: "Circle of Saraqiel (አውደ ሰራቂኤል - ጠባቂ)", geez: "አውደ ሰራቂኤል", symbol: "🛡️", angel: "ቅዱስ ሰራቂኤል", element: "afere" as HumoralElement, temp: "Steadfast guardianship, protection of vulnerable hearths", prophecy: "Your domestic sanctuary and children are divinely shielded." },
    { name: "Circle of Cherubim (አውደ ኪሩቤል - መንበር)", geez: "አውደ ኪሩቤል", symbol: "👑", angel: "ኪሩቤል", element: "esat" as HumoralElement, temp: "Majestic reverence, sovereign foundation, elevated rank", prophecy: "Ascendancy in leadership; handle responsibility with humility." },
    { name: "Circle of Seraphim (አውደ ሱራፌል - ነበልባል)", geez: "አውደ ሱራፌል", symbol: "🔥", angel: "ሱራፌል", element: "esat" as HumoralElement, temp: "Purifying spiritual fire, ardent devotion, intensity", prophecy: "Obstacles burn away; clarify high ideals and stand tall." },
    { name: "Circle of the Apostles (አውደ ሐዋርያት - ስምሪት)", geez: "አውደ ሐዋርያት", symbol: "⛵", angel: "መንፈሰ ሐዋርያት", element: "nifas" as HumoralElement, temp: "Missionary purpose, eloquent alliance, global journey", prophecy: "Partnerships formed now carry expansive cultural fruit." },
    { name: "Circle of the Prophets (አውደ ነቢያት - ራዕይ)", geez: "አውደ ነቢያት", symbol: "👁️", angel: "መንፈሰ ነቢያት", element: "may" as HumoralElement, temp: "Prophetic dream vision, long-range wisdom, foresight", prophecy: "Listen closely to your dreams; intuition speaks truth." },
    { name: "Circle of the Martyrs (አውደ ሰማዕታት - ጽናት)", geez: "አውደ ሰማዕታት", symbol: "🏆", angel: "መንፈሰ ሰማዕታት", element: "afere" as HumoralElement, temp: "Unyielding endurance, victory through trials, dignity", prophecy: "Temporary resistance strengthens your character; keep steady." },
    { name: "Circle of the Righteous (አውደ ጻድቃን - በረከት)", geez: "አውደ ጻድቃን", symbol: "🌾", angel: "መንፈሰ ጻድቃን", element: "afere" as HumoralElement, temp: "Generous harvest, agricultural peace, honest wealth", prophecy: "The seeds planted in quiet devotion yield a rich harvest." },
    { name: "Circle of the Covenant (አውደ ታቦት - ቅድስና)", geez: "አውደ ታቦት", symbol: "✨", angel: "ማኅደረ መለኮት", element: "may" as HumoralElement, temp: "Sacred sanctuary, inviolable covenant, profound blessing", prophecy: "Remain faithful to your vows; divine favor surrounds you." },
    { name: "Circle of the Sun & Stars (አውደ ከዋክብት - ምሕዋር)", geez: "አውደ ከዋክብት", symbol: "☀️", angel: "መላእክተ ብርሃን", element: "esat" as HumoralElement, temp: "Cosmic timing, rhythmic seasonal order, vitality", prophecy: "Natural cycles align in your favor; act in rhythm with the seasons." },
    { name: "Circle of the Sabbath (አውደ ሰንበት - ዕረፍት)", geez: "አውደ ሰንበት", symbol: "🕯️", angel: "በረከተ ሰንበት", element: "may" as HumoralElement, temp: "Complete rejuvenation, sacred rest, contemplation", prophecy: "Cease restless striving; restoration and deep clarity arrive in quietude." },
  ];

  return circleTemplates.map((tmpl, idx) => {
    const circleId = idx + 1;
    const sections: AwudeNegestSection[] = [];

    // 16 Sections per circle (8 Day / 8 Night)
    for (let s = 1; s <= 16; s++) {
      const isDay = s <= 8;
      sections.push({
        sectionIndex: s,
        timeOfDay: isDay ? "መዓልት (Day)" : "ሌሊት (Night)",
        rulingSpirit: `${tmpl.angel} - Section ${s}`,
        guidanceText: isDay
          ? `Day section ${s}: Auspicious for visible outward action, negotiations, and therapeutic spring visits.`
          : `Night section ${s}: Auspicious for contemplation, holy prayer scrolls, restorative sleep, and dream analysis.`,
        symbolicColor: isDay ? "#f59e0b" : "#6366f1",
      });
    }

    return {
      id: circleId,
      name: tmpl.name,
      geezTitle: tmpl.geez,
      symbol: tmpl.symbol,
      guardianAngel: tmpl.angel,
      elementalAffinity: tmpl.element,
      temperament: tmpl.temp,
      sections,
      generalProphecy: tmpl.prophecy,
    };
  });
}

export const AWUDE_CIRCLES = initialize16Circles();

export function getAwudeNegestWindow(date: Date): string {
  const dayFactor = date.getDate() + date.getMonth() + date.getFullYear();
  const circleIndex = Math.abs(dayFactor % AWUDE_CIRCLES.length);
  const circle = AWUDE_CIRCLES[circleIndex] || AWUDE_CIRCLES[0];
  const cycle = date.getHours() >= 12 ? "Day window" : "Night window";
  return `${circle.name} — ${cycle}`;
}

/**
 * Calculates AwudeNegest Divinatory Reading
 * Accepts Ge'ez / Amharic name, category (from 60), optional place and month.
 */
export function calculateAwudeNegestReading(input: {
  name: string;
  category: string;
  motherName?: string;
  place?: string;
  month?: string;
}): AwudeNegestReadingResult {
  // Sum Ge'ez letter values
  const nameVal = calculateFidelWeight(input.name);
  const motherVal = input.motherName ? calculateFidelWeight(input.motherName) : 0;
  const placeVal = input.place ? calculateFidelWeight(input.place) : 0;
  const monthVal = input.month ? calculateFidelWeight(input.month) : 0;

  const total = nameVal + motherVal + placeVal + monthVal;
  // Modulo 16 arithmetic yields 1 - 16
  const circleIndex = total > 0 ? (total % 16 === 0 ? 16 : total % 16) : 1;
  const segment = total > 0 ? ((total - 1) % 16) + 1 : 1;
  const circle = AWUDE_CIRCLES[circleIndex - 1] || AWUDE_CIRCLES[0];

  const catObj = AWUDE_NEGEST_60_CATEGORIES.find((c) => c.id === input.category) || AWUDE_NEGEST_60_CATEGORIES[0];

  // Derive favorable status and specific prophecy based on circle + category index
  const categoryHash = (catObj.id.charCodeAt(0) + circleIndex * 7) % 10;
  const favorable = categoryHash >= 3;
  const confidence = favorable ? 85 + (categoryHash % 12) : 70 + (categoryHash % 10);

  const proverbs: Record<number, string> = {
    1: "«ድር ቢያብር አንበሳ ያስር» — Through aligned unity, even lions are tethered.",
    2: "«ከመናገር ደጋግሞ ማዳመጥ» — Better to listen twice than speak in haste.",
    3: "«ቀስ በቀስ ቈንቋላ እንቁላል በእግሯ ትሄዳለች» — Slowly by slowly, patience bears wings.",
    4: "«እውነትና ንጋት እያደር ይጠራል» — Truth and dawn grow brighter with each passing hour.",
    5: "«ሆድ ሲያውቅ ዶሮ ማታ» — What is known in the heart need not fear the evening.",
    6: "«የታገሰ ሰው መከራን ያሳልፋል» — He who endures with patience outlasts every trial.",
    7: "«የተዘራ እህል አይጠፋም» — The seed sown in righteous soil never perishes.",
    8: "«ሰው በሥራው ይታወቃል» — A person is known through their works and integrity.",
    9: "«ፍቅር የሌለው ሕይወት እንደ ባዶ ቤት ነው» — A life devoid of love is like an empty sanctuary.",
    10: "«የተማረ ሰው ለሀገር መብራት ነው» — The wise person is a radiant lantern to the land.",
    11: "«ለእውነት የቆመ አይወድቅም» — Whoever stands for truth does not stumble.",
    12: "«የዘመድ ፊት የጠዋት ፀሐይ ነው» — The face of a loyal kin is like the morning sun.",
    13: "«በረከት ከእግዚአብሔር ዘንድ ነው» — True blessing descends from divine providence.",
    14: "«የሰላም ቤት እንጀራው ጣፋጭ ነው» — In a house of peace, even simple bread is sweet.",
    15: "«ጥበብ ከወርቅና ከብር ትበልጣለች» — Wisdom excels gold and refined silver.",
    16: "«ዕረፍት ለደከመው ነፍስ መድኃኒት ነው» — Sacred rest is the ultimate medicine for the weary soul.",
  };

  const prophecyText = favorable
    ? `Regarding ${catObj.en} (${catObj.am}), the 16th-century parchment tablets of ${circle.name} reveal an auspicious opening. Obstacles soften under disciplined effort. Proceed with clear prayer and ethical intentions.`
    : `Regarding ${catObj.en} (${catObj.am}), ${circle.name} counsels prudent reflection. A momentary hesitation preserves future strength. Refrain from hasty contracts until the new crescent moon.`;

  return {
    input: {
      name: input.name,
      geEzName: input.name,
      motherName: input.motherName,
      category: catObj.id,
      place: input.place,
      month: input.month,
    },
    calculatedValues: {
      nameValue: nameVal,
      motherValue: motherVal,
      placeValue: placeVal,
      monthValue: monthVal,
      total,
      segment,
    },
    circle: {
      number: circle.id,
      name: circle.name,
      geezTitle: circle.geezTitle,
      symbol: circle.symbol,
      guardianAngel: circle.guardianAngel,
      elementalAffinity: circle.elementalAffinity,
      temperament: circle.temperament,
    },
    prediction: {
      category: catObj.en,
      categoryAmharic: catObj.am,
      favorable,
      confidence,
      prophecy: prophecyText,
      traditionalProverb: proverbs[circle.id] || proverbs[1],
      traditionalRemedy: `Pair with morning herbal tea of Tena Adam (Ruta chalepensis) and recite the 3rd section of ${circle.geezTitle}.`,
    },
    recommendations: [
      `Align key actions with daytime section 3 of ${circle.name}.`,
      "Cultivate internal gratitude and avoid contentious arguments during market hours.",
      "Honor ancestral lineage through traditional hospitable coffee sharing.",
    ],
    characterTraits: [
      `Resonant with ${circle.elementalAffinity.toUpperCase()} element: instinctive warmth, loyalty, perseverance.`,
      "Capacity for deep concentration and ethical discernment under pressure.",
    ],
    behavioralPatterns: [
      "Naturally draws companions seeking safe counsel and grounding advice.",
      "Performs best when daily schedule includes quiet morning reflection.",
    ],
    compatibility: {
      bestMatchCircles: [(circle.id + 4) % 16 || 16, (circle.id + 8) % 16 || 16],
      challengingCircles: [(circle.id + 2) % 16 || 16, (circle.id + 10) % 16 || 16],
    },
  };
}

/**
 * Calculates sum of Ge'ez letters in string
 */
export function calculateFidelWeight(text: string): number {
  let sum = 0;
  for (const char of text) {
    if (GEEZ_LETTER_VALUES[char] !== undefined) {
      sum += GEEZ_LETTER_VALUES[char];
    } else {
      // Fallback for ASCII letters
      const code = char.toLowerCase().charCodeAt(0);
      if (code >= 97 && code <= 122) {
        sum += code - 96; // a=1, b=2 ...
      }
    }
  }
  return sum;
}

/**
 * Däbtära Manuscript Healing Wisdom Prescriptions
 */
export function getDabtaraWisdom(category: string = "Welbeing"): DabtaraManuscriptWisdom {
  return {
    title: "Sacred Healing Scroll of Archangel Michael & Raphael (መጽሐፈ ፈውስ)",
    geezTitle: "ክታበ ፈውስ ወመድኃኒት",
    scriptureRef: "Classical Gondarine 17th Century Parchment Codices (EMML 2084)",
    historicalPeriod: "Late Gondar Imperial Scholarly Era (c. 1680 - 1730)",
    parchmentSealDescription: "Two interlaced talismanic octagrams enclosed in iron gall ink with vermilion accents, symbolizing the unshakeable four cardinal directions and four humors (Esat, Afere, Nifas, May).",
    healingScrollPrescription: {
      targetCondition: `Restoration of bodily equilibrium and alleviation of distress in ${category}.`,
      celestialHour: "First hour after sunrise (ሰዓተ ፀሐይ) or evening twilight.",
      herbalAllies: ["Tena Adam (Ruta chalepensis)", "Damakesse (Ocimum lamiifolium)", "Tosign (Thymus serrulatus)", "Tikur Azmud (Nigella sativa)"],
      protectivePrayerGeez: "«በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ፤ ጸሎት በእንተ ሕማመ ልብ ወዕረፍተ ነፍስ...»",
      protectivePrayerEnglish: "In the name of the Father, the Son, and the Holy Spirit, one God; prayer for the quieting of heart turbulence and the peace of the soul...",
    },
    seasonalPacing: {
      seasonName: "Bega (Highland Dry & Sunny Season)",
      WelbeingGuidance: "The dry solar wind increases internal warmth; balance with golden flax infusions and cooling evening footbaths.",
      botanicalInfusion: "Freshly crushed Damakesse leaves infused in lukewarm spring water.",
    },
  };
}
