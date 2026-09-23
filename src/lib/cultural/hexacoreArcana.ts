export type HexacoreName = "Power" | "Humanity" | "Creation" | "Peace" | "Spirit" | "Order";
export type CreationDay = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface HexacoreCore {
  id: Lowercase<HexacoreName>;
  name: HexacoreName;
  number: number;
  essence: string;
  question: string;
  // Multi-lingual names
  sanskrit: string;
  hebrew: string;
  arabic: string;
  amharic: string;
  greek: string;
  latin: string;
  chinese: string;
  japanese: string;
  // Correspondences
  polarity: string;
  season: string;
  direction: string;
  time: string;
  planet: string;
  metal: string;
  stone: string;
  plant: string;
  soundHz: number;
  geometry: string;
  bodySystem: string;
  virtue: string;
  shadow: string;
  gift: string;
  creationDay: CreationDay;
  chakra: string;
  meridian: string;
  element: string;
  tarotSuit: string;
  rune: string;
  iChing: string;
  platonicSolid: string;
}

export interface HexacoreAspect {
  id: string; // P1..P6, H1..H6, C1..C6, E1..E6, S1..S6, O1..O6
  coreId: HexacoreCore["id"];
  coreName: HexacoreName;
  name: string;
  expression: string;
  bodyZone: string;
  baseFrequencyHz: number;
  shadow: string;
  gift: string;
}

export interface HexacoreFrequency {
  id: string; // e.g. H1.1 .. H1.6
  aspectId: string;
  name: string;
  state: "Dormant" | "Awakening" | "Active" | "Radiant" | "Transcendent" | "Eternal";
  sign: string;
  soundHz: number;
}

export interface HexacoreArchetype {
  id: string; // e.g. H1.1
  coreName: HexacoreName;
  aspectId: string;
  aspectName: string;
  index: number;
  name: string;
  role: string;
  shadow: string;
  gift: string;
  remedy: string;
  bodySign: string;
}

export interface HexacoreCorrespondence {
  archetypeId: string;
  archetypeName: string;
  planet: string;
  herb: string;
  soundHz: number;
  geometry: string;
  bodySign: string;
  creationDay: CreationDay;
  metal: string;
  stone: string;
}

export interface HexacorePair {
  id: string;
  left: HexacoreName;
  right: HexacoreName;
  name: string;
  dynamic: string;
  shadow: string;
  gift: string;
}

export interface CreationDayMapping {
  day: CreationDay;
  creationAct: string;
  primaryCore: HexacoreName;
  secondaryCore: HexacoreName;
  relationalMeaning: string;
  practice: string;
  bodySign: string;
  herb: string;
  soundHz: number;
}

export interface EthiopianHerbDetail {
  core: HexacoreName;
  herb: string;
  scientificName: string;
  preparation: string;
  activeIngredient: string;
  sideEffect: string;
  location: string;
  creationDay: CreationDay;
  dosage?: string;
  contraindications?: string[];
  safetyRating?: "Safe" | "Caution" | "Strict Gate";
}

export interface BodySignZone {
  zone: string;
  core: HexacoreName;
  sign: string;
  meaning: string;
  remedy: string;
}

export interface TemporalCycle {
  scale: "Daily" | "Monthly" | "Annual" | "Life" | "Cosmic" | "Creation";
  phase: string;
  core: HexacoreName;
  themeOrPractice: string;
  detail: string;
}

export interface InitiationGate {
  gate: string;
  core: HexacoreName;
  trialSummary: string;
  reward: string;
  duration: string;
  trials: string[];
}

export interface CosmologicalRealm {
  realm: string;
  core: HexacoreName;
  description: string;
  ruler: string;
  gateway: string;
  subRealms: Array<{ name: string; meaning: string }>;
}

export interface HexacoreProfile {
  coreNumber: number;
  dominantCore: HexacoreName;
  secondaryCore: HexacoreName;
  tertiaryCore: HexacoreName;
  dormantCore: HexacoreName;
  creationDay: CreationDay;
  aspect: HexacoreAspect;
  frequency: HexacoreFrequency;
  archetype: string;
  shadow: string;
  gift: string;
  correspondences: Pick<HexacoreCore, "planet" | "plant" | "soundHz" | "geometry" | "metal" | "stone">;
  creationDayMapping: CreationDayMapping;
  // Enhanced 14-layer additions
  layerSummary?: {
    layer1Cores: { dominant: HexacoreName; secondary: HexacoreName; tertiary: HexacoreName; dormant: HexacoreName };
    layer2Aspects: HexacoreAspect[];
    layer3Frequencies: HexacoreFrequency[];
    layer4Archetypes: HexacoreArchetype[];
    layer5Shadows: Array<{ shadow: string; remedy: string; bodySign: string }>;
    layer6Gifts: Array<{ gift: string; expression: string }>;
    layer7Correspondences: HexacoreCorrespondence[];
    layer8Temporal: { daily: string; monthly: string; annual: string; life: string; cosmic: string; creation: CreationDay };
    layer9Energetic: { body: string; center: string; meridian: string; soundHz: number };
    layer10Collective: { groupSize: number; dynamic: string; shadow: string; gift: string };
    layer11Initiation: { gate: string; trial: string; reward: string; level: string };
    layer12Cosmology: { realm: string; ruler: string; age: string; heaven: string };
    layer13CreationDays: CreationDayMapping;
    layer14CrossSystem: { tcm: string; ayurveda: string; unani: string; ethiopian: string; latinAmerican: string; western: string };
  };
  safety: {
    reflectiveOnly: true;
    bodySignsAreNotDiagnosis: true;
    ageGateRequired: true;
  };
}

// ─────────────────────────────────────────────────────────────
// LAYER 1: THE SIX CORES
// ─────────────────────────────────────────────────────────────

const createCore = (val: Omit<HexacoreCore, "id">): HexacoreCore => ({
  ...val,
  id: val.name.toLowerCase() as Lowercase<HexacoreName>,
});

export const HEXACORE_CORES: HexacoreCore[] = [
  createCore({
    name: "Power",
    number: 1,
    essence: "Will, courage, action, sovereignty, transformation",
    question: "How do I act with courage and righteous will?",
    sanskrit: "Shakti",
    hebrew: "Gevurah",
    arabic: "Quwwa",
    amharic: "Hayil",
    greek: "Kratos",
    latin: "Potestas",
    chinese: "Qi",
    japanese: "Chikara",
    polarity: "Active–Directing",
    season: "Spring",
    direction: "East",
    time: "Noon",
    planet: "Mars/Sun",
    metal: "Iron",
    stone: "Ruby",
    plant: "Withania somnifera (Nettle / Ashwagandha)",
    soundHz: 741,
    geometry: "Triangle",
    bodySystem: "Muscular/Skeletal",
    virtue: "Courage",
    shadow: "Domination",
    gift: "Justice",
    creationDay: "Wednesday",
    chakra: "Solar Plexus",
    meridian: "Liver",
    element: "Fire",
    tarotSuit: "Wands",
    rune: "Fehu",
    iChing: "Qian",
    platonicSolid: "Tetrahedron",
  }),
  createCore({
    name: "Humanity",
    number: 2,
    essence: "Connection, empathy, love, communal belonging, bridge",
    question: "Who am I with others, and how do I love unconditionally?",
    sanskrit: "Hridaya",
    hebrew: "Chesed",
    arabic: "Rahma",
    amharic: "Enat",
    greek: "Agape",
    latin: "Caritas",
    chinese: "Ren",
    japanese: "Ai",
    polarity: "Receptive–Connecting",
    season: "Summer",
    direction: "West",
    time: "Dusk",
    planet: "Moon",
    metal: "Silver",
    stone: "Rose Quartz",
    plant: "Rosa abyssinica (Rose)",
    soundHz: 396,
    geometry: "Circle",
    bodySystem: "Circulatory",
    virtue: "Compassion",
    shadow: "Enmeshment",
    gift: "Universal Love",
    creationDay: "Thursday",
    chakra: "Heart",
    meridian: "Heart",
    element: "Water",
    tarotSuit: "Cups",
    rune: "Gebo",
    iChing: "Kun",
    platonicSolid: "Icosahedron",
  }),
  createCore({
    name: "Creation",
    number: 3,
    essence: "Imagination, fertility, craft, invention, form from formless",
    question: "What lasting beauty and form can I bring into being?",
    sanskrit: "Srishti",
    hebrew: "Binah",
    arabic: "Khalq",
    amharic: "Fetret",
    greek: "Poiesis",
    latin: "Creatio",
    chinese: "Zao",
    japanese: "Sozo",
    polarity: "Projective–Forming",
    season: "Late Summer",
    direction: "North",
    time: "Midnight",
    planet: "Venus",
    metal: "Copper",
    stone: "Emerald",
    plant: "Nigella sativa (Tikur Azmud / Black Seed)",
    soundHz: 528,
    geometry: "Spiral",
    bodySystem: "Reproductive",
    virtue: "Creativity",
    shadow: "Scatteredness",
    gift: "Manifestation",
    creationDay: "Tuesday",
    chakra: "Sacral",
    meridian: "Kidney",
    element: "Earth",
    tarotSuit: "Pentacles",
    rune: "Berkano",
    iChing: "Zhen",
    platonicSolid: "Dodecahedron",
  }),
  createCore({
    name: "Peace",
    number: 4,
    essence: "Balance, healing, forgiveness, serenity, rest",
    question: "What needs forgiveness and restoration in me?",
    sanskrit: "Shanti",
    hebrew: "Tiferet",
    arabic: "Salam",
    amharic: "Selam",
    greek: "Eirene",
    latin: "Pax",
    chinese: "He",
    japanese: "Wa",
    polarity: "Neutral–Balancing",
    season: "Autumn",
    direction: "Center",
    time: "Twilight",
    planet: "Saturn",
    metal: "Lead",
    stone: "Clear Quartz",
    plant: "Hagenia abyssinica (Kosso / Chamomile)",
    soundHz: 432,
    geometry: "Square",
    bodySystem: "Digestive",
    virtue: "Forgiveness",
    shadow: "Stagnation",
    gift: "Serenity",
    creationDay: "Friday",
    chakra: "Root",
    meridian: "Spleen",
    element: "Aether",
    tarotSuit: "Swords",
    rune: "Algiz",
    iChing: "Kan",
    platonicSolid: "Hexahedron",
  }),
  createCore({
    name: "Spirit",
    number: 5,
    essence: "Meaning, intuition, faith, breath, transcendence, source",
    question: "What connects my spirit to the infinite and eternal?",
    sanskrit: "Atman",
    hebrew: "Keter",
    arabic: "Ruh",
    amharic: "Menfes",
    greek: "Pneuma",
    latin: "Spiritus",
    chinese: "Shen",
    japanese: "Rei",
    polarity: "Expansive–Dissolving",
    season: "Winter",
    direction: "Above/Below",
    time: "Dawn",
    planet: "Neptune",
    metal: "Platinum",
    stone: "Amethyst",
    plant: "Ocimum lamiifolium (Damakese / Frankincense)",
    soundHz: 963,
    geometry: "Point",
    bodySystem: "Respiratory",
    virtue: "Faith",
    shadow: "Dogma",
    gift: "Transcendence",
    creationDay: "Sunday",
    chakra: "Crown",
    meridian: "Lung",
    element: "Air",
    tarotSuit: "Major Arcana",
    rune: "Sowilo",
    iChing: "Li",
    platonicSolid: "Octahedron",
  }),
  createCore({
    name: "Order",
    number: 6,
    essence: "Structure, law, cosmic rhythm, time, boundaries, righteousness",
    question: "How do I align my actions with universal justice?",
    sanskrit: "Ṛta",
    hebrew: "Mishpat",
    arabic: "Mizan",
    amharic: "Sir'at",
    greek: "Kosmos",
    latin: "Ordo",
    chinese: "Li",
    japanese: "Rei",
    polarity: "Neutral–Directing",
    season: "Late Autumn",
    direction: "South",
    time: "First Light",
    planet: "Jupiter",
    metal: "Tin",
    stone: "Lapis Lazuli",
    plant: "Ruta chalepensis (Tena Adam / Fennel)",
    soundHz: 852,
    geometry: "Hexagon",
    bodySystem: "Nervous System",
    virtue: "Justice",
    shadow: "Rigidity",
    gift: "Righteousness",
    creationDay: "Monday",
    chakra: "Third Eye",
    meridian: "Triple Burner",
    element: "Metal",
    tarotSuit: "Disks",
    rune: "Jera",
    iChing: "Gen",
    platonicSolid: "Cuboctahedron",
  }),
];

// ─────────────────────────────────────────────────────────────
// LAYER 2: THE 36 ASPECTS (6 PER CORE)
// ─────────────────────────────────────────────────────────────

interface AspectRawSeed {
  code: string;
  name: string;
  expression: string;
  bodyZone: string;
  freq: number;
  shadow: string;
  gift: string;
  coreName: HexacoreName;
}

const RAW_ASPECTS: AspectRawSeed[] = [
  // Power (P1-P6)
  { code: "P1", name: "Spark", expression: "Initiation, will", bodyZone: "Spine", freq: 396, shadow: "Hesitation", gift: "Initiative", coreName: "Power" },
  { code: "P2", name: "Flame", expression: "Courage, action", bodyZone: "Blood", freq: 528, shadow: "Recklessness", gift: "Bravery", coreName: "Power" },
  { code: "P3", name: "Forge", expression: "Transformation, discipline", bodyZone: "Muscles", freq: 741, shadow: "Burnout", gift: "Mastery", coreName: "Power" },
  { code: "P4", name: "Throne", expression: "Sovereignty, rule", bodyZone: "Crown", freq: 852, shadow: "Tyranny", gift: "Leadership", coreName: "Power" },
  { code: "P5", name: "Sacrifice", expression: "Power given away", bodyZone: "Heart", freq: 639, shadow: "Martyrdom", gift: "Generosity", coreName: "Power" },
  { code: "P6", name: "Shield", expression: "Protection, boundaries", bodyZone: "Arms", freq: 417, shadow: "Isolation", gift: "Safety", coreName: "Power" },

  // Humanity (H1-H6)
  { code: "H1", name: "Bond", expression: "One-to-one intimacy", bodyZone: "Heart", freq: 396, shadow: "Enmeshment", gift: "Authenticity", coreName: "Humanity" },
  { code: "H2", name: "Tribe", expression: "Community belonging", bodyZone: "Hands", freq: 417, shadow: "Conformity", gift: "Belonging", coreName: "Humanity" },
  { code: "H3", name: "Justice", expression: "Fairness for all", bodyZone: "Blood", freq: 528, shadow: "Revenge", gift: "Equity", coreName: "Humanity" },
  { code: "H4", name: "Compassion", expression: "Suffering with others", bodyZone: "Chest", freq: 639, shadow: "Pity", gift: "Empathy", coreName: "Humanity" },
  { code: "H5", name: "Unity", expression: "All is one", bodyZone: "Whole body", freq: 963, shadow: "Absorption", gift: "Oneness", coreName: "Humanity" },
  { code: "H6", name: "Service", expression: "Giving without expectation", bodyZone: "Feet", freq: 285, shadow: "Servitude", gift: "Contribution", coreName: "Humanity" },

  // Creation (C1-C6)
  { code: "C1", name: "Seed", expression: "Conception, beginning", bodyZone: "Womb", freq: 174, shadow: "Barrenness", gift: "Potential", coreName: "Creation" },
  { code: "C2", name: "Craft", expression: "Skill, making", bodyZone: "Hands/Mind", freq: 285, shadow: "Perfectionism", gift: "Mastery", coreName: "Creation" },
  { code: "C3", name: "Legacy", expression: "What outlives you", bodyZone: "Bones", freq: 396, shadow: "Ego", gift: "Inheritance", coreName: "Creation" },
  { code: "C4", name: "Beauty", expression: "Aesthetics, harmony", bodyZone: "Eyes", freq: 528, shadow: "Vanity", gift: "Aesthetics", coreName: "Creation" },
  { code: "C5", name: "Innovation", expression: "New forms", bodyZone: "Brain", freq: 741, shadow: "Chaos", gift: "Invention", coreName: "Creation" },
  { code: "C6", name: "Destruction", expression: "Necessary endings", bodyZone: "Hands", freq: 417, shadow: "Vandalism", gift: "Renewal", coreName: "Creation" },

  // Peace (E1-E6)
  { code: "E1", name: "Root", expression: "Grounding, stability", bodyZone: "Feet", freq: 174, shadow: "Fear", gift: "Safety", coreName: "Peace" },
  { code: "E2", name: "Stillness", expression: "Meditation, rest", bodyZone: "Navel", freq: 285, shadow: "Numbness", gift: "Serenity", coreName: "Peace" },
  { code: "E3", name: "Return", expression: "Forgiveness, healing", bodyZone: "Heart", freq: 396, shadow: "Resentment", gift: "Release", coreName: "Peace" },
  { code: "E4", name: "Balance", expression: "Harmony, justice", bodyZone: "Inner ear", freq: 528, shadow: "Indecision", gift: "Equilibrium", coreName: "Peace" },
  { code: "E5", name: "Bliss", expression: "Supreme peace", bodyZone: "Whole body", freq: 963, shadow: "Attachment", gift: "Ecstasy", coreName: "Peace" },
  { code: "E6", name: "Silence", expression: "The void", bodyZone: "Throat", freq: 852, shadow: "Isolation", gift: "Emptiness", coreName: "Peace" },

  // Spirit (S1-S6)
  { code: "S1", name: "Breath", expression: "Life force, prana", bodyZone: "Lungs", freq: 417, shadow: "Shallow breath", gift: "Vitality", coreName: "Spirit" },
  { code: "S2", name: "Vision", expression: "Intuition, dreams", bodyZone: "Third Eye", freq: 741, shadow: "Delusion", gift: "Insight", coreName: "Spirit" },
  { code: "S3", name: "Surrender", expression: "Faith, release", bodyZone: "Crown", freq: 852, shadow: "Apathy", gift: "Trust", coreName: "Spirit" },
  { code: "S4", name: "Silence", expression: "Inner stillness", bodyZone: "Whole body", freq: 963, shadow: "Isolation", gift: "Peace", coreName: "Spirit" },
  { code: "S5", name: "Union", expression: "Mystical union", bodyZone: "Heart", freq: 963, shadow: "Dissolution", gift: "Oneness", coreName: "Spirit" },
  { code: "S6", name: "Descent", expression: "Spirit into matter", bodyZone: "Feet", freq: 174, shadow: "Materialism", gift: "Incarnation", coreName: "Spirit" },

  // Order (O1-O6)
  { code: "O1", name: "Law", expression: "Rules, principles", bodyZone: "Nervous system", freq: 852, shadow: "Legalism", gift: "Justice", coreName: "Order" },
  { code: "O2", name: "Rhythm", expression: "Cycles, time", bodyZone: "Heart", freq: 528, shadow: "Rigidity", gift: "Flow", coreName: "Order" },
  { code: "O3", name: "Boundary", expression: "Limits, containers", bodyZone: "Skin", freq: 396, shadow: "Walls", gift: "Safety", coreName: "Order" },
  { code: "O4", name: "Hierarchy", expression: "Levels, structure", bodyZone: "Spine", freq: 741, shadow: "Oppression", gift: "Order", coreName: "Order" },
  { code: "O5", name: "Tradition", expression: "Ancestral wisdom", bodyZone: "Bones", freq: 417, shadow: "Stagnation", gift: "Continuity", coreName: "Order" },
  { code: "O6", name: "Cosmos", expression: "Universal order", bodyZone: "Crown", freq: 963, shadow: "Chaos", gift: "Harmony", coreName: "Order" },
];

export const HEXACORE_ASPECTS: HexacoreAspect[] = RAW_ASPECTS.map((item) => {
  const c = HEXACORE_CORES.find((core) => core.name === item.coreName)!;
  return {
    id: item.code,
    coreId: c.id,
    coreName: item.coreName,
    name: item.name,
    expression: item.expression,
    bodyZone: item.bodyZone,
    baseFrequencyHz: item.freq,
    shadow: item.shadow,
    gift: item.gift,
  };
});

// ─────────────────────────────────────────────────────────────
// LAYER 3: THE 216 FREQUENCIES (6 PER ASPECT)
// ─────────────────────────────────────────────────────────────

const FREQ_STATES = ["Dormant", "Awakening", "Active", "Radiant", "Transcendent", "Eternal"] as const;
const FREQ_SIGNS = [
  "Closed awareness / cold extremities",
  "Curiosity / warm palms / awakening pulse",
  "Steady breath / integrated regular practice",
  "Unconditional love / glowing presence / radiance",
  "Universal empathy / stillness in motion",
  "Luminous presence / eternal peace",
];
const SOLFEGGIO_SEQUENCE = [174, 285, 396, 528, 741, 963];

export const HEXACORE_FREQUENCIES: HexacoreFrequency[] = HEXACORE_ASPECTS.flatMap((aspect) =>
  FREQ_STATES.map((state, idx) => ({
    id: `${aspect.id}.${idx + 1}`,
    aspectId: aspect.id,
    name: `${state} ${aspect.name}`,
    state,
    sign: FREQ_SIGNS[idx],
    soundHz: SOLFEGGIO_SEQUENCE[idx],
  }))
);

// ─────────────────────────────────────────────────────────────
// LAYER 4: THE 216 ARCHETYPES (6 PER ASPECT)
// ─────────────────────────────────────────────────────────────

// Canonical named archetype seeds for key aspects
const ARCHETYPE_SEEDS: Record<string, Array<{ name: string; role: string; shadow: string; gift: string; remedy: string; bodySign: string }>> = {
  H1: [
    { name: "The Wounded Healer", role: "Heals others through own pain", shadow: "Martyr", gift: "Compassion", remedy: "Self-care and boundaries", bodySign: "Warm hands, open heart" },
    { name: "The Bridge", role: "Connects estranged forces and enemies", shadow: "People-pleaser", gift: "Diplomacy", remedy: "Stand in personal truth", bodySign: "Clear throat, calm pulse" },
    { name: "The Mother", role: "Nurtures all life unconditionally", shadow: "Smotherer", gift: "Nurturing", remedy: "Trust in organic growth", bodySign: "Open chest, soft gaze" },
    { name: "The Lover", role: "Embodies union and beauty", shadow: "Addict", gift: "Ecstasy", remedy: "Find internal wholeness", bodySign: "Steady heart rhythm" },
    { name: "The Twin", role: "Mirror of soul intimacy", shadow: "Enmeshment", gift: "Authenticity", remedy: "Differentiation with love", bodySign: "Clear skin, calm breath" },
    { name: "The Companion", role: "Walks beside on long journeys", shadow: "Dependency", gift: "Loyalty", remedy: "Self-reliance with open heart", bodySign: "Grounded feet" },
  ],
  P2: [
    { name: "The Warrior", role: "Defends the weak and upholds dignity", shadow: "Bully", gift: "Protection", remedy: "Compassion in strength", bodySign: "Calm posture, relaxed jaw" },
    { name: "The Sovereign King/Queen", role: "Rules with justice and equity", shadow: "Tyrant", gift: "Justice", remedy: "Service to the realm", bodySign: "Upright spine, steady gaze" },
    { name: "The Alchemist", role: "Transforms poison into medicine", shadow: "Manipulator", gift: "Transformation", remedy: "Radical truth-telling", bodySign: "Warm core, clear eyes" },
    { name: "The Pioneer", role: "Breaks new territory with bravery", shadow: "Reckless", gift: "Innovation", remedy: "Grounding and counsel", bodySign: "Steady blood pressure" },
    { name: "The Guardian", role: "Protects sacred boundaries", shadow: "Wall-builder", gift: "Boundaries", remedy: "Selective opening", bodySign: "Warm hands, flexible shoulders" },
    { name: "The Champion", role: "Fights for righteous cause", shadow: "Fanatic", gift: "Devotion", remedy: "Humility and broad vision", bodySign: "Deep rhythmic breath" },
  ],
};

export const HEXACORE_ARCHETYPES: HexacoreArchetype[] = HEXACORE_ASPECTS.flatMap((aspect) => {
  const specific = ARCHETYPE_SEEDS[aspect.id];
  return [1, 2, 3, 4, 5, 6].map((i) => {
    const item = specific?.[i - 1];
    return {
      id: `${aspect.id}.${i}`,
      coreName: aspect.coreName,
      aspectId: aspect.id,
      aspectName: aspect.name,
      index: i,
      name: item?.name ?? `The ${aspect.name} ${["Herald", "Guardian", "Adept", "Architect", "Mystic", "Sovereign"][i - 1]}`,
      role: item?.role ?? `Embodies the ${aspect.name} expression of ${aspect.coreName}`,
      shadow: item?.shadow ?? aspect.shadow,
      gift: item?.gift ?? aspect.gift,
      remedy: item?.remedy ?? `Cultivate balanced ${aspect.gift.toLowerCase()} through reflection`,
      bodySign: item?.bodySign ?? `${aspect.bodyZone} warmth and calm`,
    };
  });
});

// ─────────────────────────────────────────────────────────────
// LAYER 7: THE 1,296 CORRESPONDENCES (6 PER ARCHETYPE)
// ─────────────────────────────────────────────────────────────

const HERB_MAP: Record<HexacoreName, string> = {
  Power: "Withania somnifera (Nettle / Ashwagandha)",
  Humanity: "Rosa abyssinica (Rose)",
  Creation: "Nigella sativa (Tikur Azmud)",
  Peace: "Hagenia abyssinica (Kosso)",
  Spirit: "Ocimum lamiifolium (Damakese)",
  Order: "Ruta chalepensis (Tena Adam / Fennel)",
};

const PLANET_MAP: Record<HexacoreName, string[]> = {
  Power: ["Mars", "Sun", "Pluto", "Jupiter", "Chiron", "Sun"],
  Humanity: ["Moon", "Venus", "Neptune", "Mercury", "Chiron", "Moon"],
  Creation: ["Venus", "Mercury", "Earth", "Uranus", "Jupiter", "Venus"],
  Peace: ["Saturn", "Neptune", "Earth", "Moon", "Chiron", "Saturn"],
  Spirit: ["Neptune", "Uranus", "Sun", "Jupiter", "Mercury", "Neptune"],
  Order: ["Jupiter", "Saturn", "Mercury", "Mars", "North Node", "Jupiter"],
};

export const HEXACORE_CORRESPONDENCES: HexacoreCorrespondence[] = HEXACORE_ARCHETYPES.flatMap((arch) => {
  const c = HEXACORE_CORES.find((core) => core.name === arch.coreName)!;
  const planets = PLANET_MAP[arch.coreName];
  const herbs = [
    HERB_MAP[arch.coreName],
    "Rosa abyssinica",
    "Nigella sativa",
    "Hagenia abyssinica",
    "Ocimum lamiifolium",
    "Ruta chalepensis",
  ];
  const sounds = [c.soundHz, 396, 417, 528, 639, 741, 852, 963];
  const geometries = [c.geometry, "Triangle", "Circle", "Spiral", "Square", "Hexagon"];
  const days: CreationDay[] = ["Wednesday", "Thursday", "Tuesday", "Friday", "Sunday", "Monday"];

  return [1, 2, 3, 4, 5, 6].map((domainIndex) => ({
    archetypeId: `${arch.id}.${domainIndex}`,
    archetypeName: `${arch.name} (Octave ${domainIndex})`,
    planet: planets[(arch.index + domainIndex - 2) % 6],
    herb: herbs[(arch.index + domainIndex - 2) % 6],
    soundHz: sounds[(arch.index + domainIndex - 2) % sounds.length],
    geometry: geometries[(arch.index + domainIndex - 2) % geometries.length],
    bodySign: arch.bodySign,
    creationDay: days[(arch.index + domainIndex - 2) % 6],
    metal: c.metal,
    stone: c.stone,
  }));
});

// ─────────────────────────────────────────────────────────────
// LAYER 8: TEMPORAL CYCLES (6 SCALES × 6 PHASES = 36 PHASES)
// ─────────────────────────────────────────────────────────────

export const TEMPORAL_CYCLES: TemporalCycle[] = [
  // Daily (Circadian)
  { scale: "Daily", phase: "First Light (4–6 AM)", core: "Order", themeOrPractice: "Set intentions, structure schedule", detail: "852 Hz · Nervous system alignment" },
  { scale: "Daily", phase: "Dawn (6–9 AM)", core: "Spirit", themeOrPractice: "Meditation, deep breathwork", detail: "963 Hz · Crown awareness" },
  { scale: "Daily", phase: "Morning (9 AM–12 PM)", core: "Power", themeOrPractice: "Action, decisive will", detail: "741 Hz · Muscular activation" },
  { scale: "Daily", phase: "Afternoon (12–4 PM)", core: "Creation", themeOrPractice: "Making, building, craft", detail: "528 Hz · Womb & hand manifestation" },
  { scale: "Daily", phase: "Evening (4–8 PM)", core: "Humanity", themeOrPractice: "Connection, family, deep listening", detail: "396 Hz · Heart center release" },
  { scale: "Daily", phase: "Night (8 PM–4 AM)", core: "Peace", themeOrPractice: "Rest, surrender, restorative sleep", detail: "432 Hz · Digestion & root safety" },

  // Monthly (Lunar/Hebdomadal)
  { scale: "Monthly", phase: "Week 1", core: "Order", themeOrPractice: "Establish routines", detail: "Set calendar & boundaries" },
  { scale: "Monthly", phase: "Week 2", core: "Power", themeOrPractice: "Set clear goals", detail: "Initiate major milestones" },
  { scale: "Monthly", phase: "Week 3", core: "Creation", themeOrPractice: "Take generative action", detail: "Produce tangible artifacts" },
  { scale: "Monthly", phase: "Week 4", core: "Humanity", themeOrPractice: "Connect and collaborate", detail: "Strengthen relational bonds" },
  { scale: "Monthly", phase: "Week 5", core: "Peace", themeOrPractice: "Review, release, forgive", detail: "Clear grudges and fatigue" },
  { scale: "Monthly", phase: "Week 6", core: "Spirit", themeOrPractice: "Reflect and surrender", detail: "Silent contemplation and prayer" },

  // Annual (Solar Seasons)
  { scale: "Annual", phase: "Rising (Mar–Apr)", core: "Power", themeOrPractice: "New beginnings", detail: "Spring thaw · Nettle tonic" },
  { scale: "Annual", phase: "Flowing (May–Jun)", core: "Humanity", themeOrPractice: "Community flowering", detail: "Summer gathering · Rose water" },
  { scale: "Annual", phase: "Bearing (Jul–Aug)", core: "Creation", themeOrPractice: "Fruit and harvest", detail: "Late summer abundance · Basil seed" },
  { scale: "Annual", phase: "Turning (Sep–Oct)", core: "Order", themeOrPractice: "Structure and store", detail: "Autumn harvest storage · Fennel tea" },
  { scale: "Annual", phase: "Releasing (Nov)", core: "Peace", themeOrPractice: "Quiet surrender", detail: "Late autumn resting · Chamomile" },
  { scale: "Annual", phase: "Resting (Dec–Feb)", core: "Spirit", themeOrPractice: "Deep reflection", detail: "Winter silence · Frankincense" },

  // Life Stages (Ontogenetic)
  { scale: "Life", phase: "Spark (0–12 yrs)", core: "Power", themeOrPractice: "Learn will and courage", detail: "Face childhood fears" },
  { scale: "Life", phase: "Bridge (13–24 yrs)", core: "Humanity", themeOrPractice: "Learn love and empathy", detail: "Reconciliation and social bonds" },
  { scale: "Life", phase: "Seed (25–36 yrs)", core: "Creation", themeOrPractice: "Build family and craft", detail: "Create that which outlives self" },
  { scale: "Life", phase: "Root (37–48 yrs)", core: "Peace", themeOrPractice: "Heal and stabilize", detail: "Sit with pain, achieve serenity" },
  { scale: "Life", phase: "Law (49–60 yrs)", core: "Order", themeOrPractice: "Establish justice and counsel", detail: "Uphold righteous societal structures" },
  { scale: "Life", phase: "Wind (61+ yrs)", core: "Spirit", themeOrPractice: "Transcend and guide", detail: "Surrender material control, mentor" },

  // Cosmic Cycles (Epochal Ages)
  { scale: "Cosmic", phase: "Age of Sparks (0–10,000 yrs)", core: "Power", themeOrPractice: "Primordial will and beginnings", detail: "Emergence of fire and self-awareness" },
  { scale: "Cosmic", phase: "Age of Bridges (10,000–20,000 yrs)", core: "Humanity", themeOrPractice: "Connection and communal bond", detail: "Tribal reconciliation and collective love" },
  { scale: "Cosmic", phase: "Age of Seeds (20,000–30,000 yrs)", core: "Creation", themeOrPractice: "Generative civilizational flourishing", detail: "Architecture, craft, and permanent legacy" },
  { scale: "Cosmic", phase: "Age of Roots (30,000–40,000 yrs)", core: "Peace", themeOrPractice: "Healing and foundational stabilization", detail: "Centering in stillness and restorative harmony" },
  { scale: "Cosmic", phase: "Age of Laws (40,000–50,000 yrs)", core: "Order", themeOrPractice: "Cosmic structure and universal law", detail: "Codified justice, celestial geometry" },
  { scale: "Cosmic", phase: "Age of Winds (50,000+ yrs)", core: "Spirit", themeOrPractice: "Transcendence and luminous return", detail: "Formless union and mystical return to source" },

  // Creation Cycle (Six Genesis Days)
  { scale: "Creation", phase: "Sunday (Day 1)", core: "Spirit", themeOrPractice: "Light separated from darkness", detail: "Meaning meets sacred boundary" },
  { scale: "Creation", phase: "Monday (Day 2)", core: "Order", themeOrPractice: "Waters separated from waters", detail: "Structure meets relational flow" },
  { scale: "Creation", phase: "Tuesday (Day 3)", core: "Creation", themeOrPractice: "Land and plants emerge", detail: "Form meets generative will" },
  { scale: "Creation", phase: "Wednesday (Day 4)", core: "Power", themeOrPractice: "Lights placed in the sky", detail: "Will governs time and seasons" },
  { scale: "Creation", phase: "Thursday (Day 5)", core: "Humanity", themeOrPractice: "Sea creatures and birds flourish", detail: "Love meets boundless spirit" },
  { scale: "Creation", phase: "Friday (Day 6)", core: "Peace", themeOrPractice: "Land animals and humanity created", detail: "Rest crowns creation" },
];

// ─────────────────────────────────────────────────────────────
// LAYER 9: ENERGETIC BODIES & CENTERS
// ─────────────────────────────────────────────────────────────

export interface EnergeticBodyInfo {
  name: string;
  core: HexacoreName;
  function: string;
  centerName: string;
  chakraLocation: string;
  soundHz: number;
  meridian: string;
  emotion: string;
}

export const ENERGETIC_BODIES: EnergeticBodyInfo[] = [
  { name: "Physical Body", core: "Peace", function: "Grounding, physical survival", centerName: "Root Center", chakraLocation: "Base of spine", soundHz: 432, meridian: "Spleen", emotion: "Worry / Groundedness" },
  { name: "Emotional Body", core: "Humanity", function: "Feeling, empathy, intimacy", centerName: "Heart Center", chakraLocation: "Center of chest", soundHz: 396, meridian: "Heart", emotion: "Joy / Compassion" },
  { name: "Mental Body", core: "Creation", function: "Thought, craft, imagination", centerName: "Sacral Center", chakraLocation: "Lower abdomen", soundHz: 528, meridian: "Kidney", emotion: "Fear / Creative Flow" },
  { name: "Will Body", core: "Power", function: "Action, directive power", centerName: "Solar Center", chakraLocation: "Upper abdomen", soundHz: 741, meridian: "Liver", emotion: "Anger / Courage" },
  { name: "Causal Body", core: "Order", function: "Universal structure, law", centerName: "Throat Center", chakraLocation: "Throat / Voice", soundHz: 852, meridian: "Triple Burner", emotion: "Rigidity / Truth" },
  { name: "Spiritual Body", core: "Spirit", function: "Transcendence, divine union", centerName: "Crown Center", chakraLocation: "Top of head", soundHz: 963, meridian: "Lung", emotion: "Grief / Transcendence" },
];

// ─────────────────────────────────────────────────────────────
// LAYER 10: COLLECTIVE FIELDS & RELATIONSHIP DYNAMICS
// ─────────────────────────────────────────────────────────────

export const HEXACORE_PAIRS: HexacorePair[] = [
  { id: "power-humanity", left: "Power", right: "Humanity", name: "The Leader", dynamic: "Will guided by love", shadow: "Domination", gift: "Justice" },
  { id: "power-creation", left: "Power", right: "Creation", name: "The Builder", dynamic: "Will made manifest", shadow: "Burnout", gift: "Manifestation" },
  { id: "power-spirit", left: "Power", right: "Spirit", name: "The Prophet", dynamic: "Truth with force", shadow: "Fanaticism", gift: "Reform" },
  { id: "power-peace", left: "Power", right: "Peace", name: "The Judge", dynamic: "Force balanced by mercy", shadow: "Rigidity", gift: "Justice" },
  { id: "power-order", left: "Power", right: "Order", name: "The Lawgiver", dynamic: "Will aligned with law", shadow: "Tyranny", gift: "Righteousness" },
  { id: "humanity-creation", left: "Humanity", right: "Creation", name: "The Nurturer", dynamic: "Love made visible", shadow: "Overgiving", gift: "Art" },
  { id: "humanity-spirit", left: "Humanity", right: "Spirit", name: "The Visionary", dynamic: "Love meets meaning", shadow: "Escapism", gift: "Prophetic empathy" },
  { id: "humanity-peace", left: "Humanity", right: "Peace", name: "The Healer", dynamic: "Love that restores", shadow: "Martyrdom", gift: "Compassion" },
  { id: "humanity-order", left: "Humanity", right: "Order", name: "The Diplomat", dynamic: "Love with boundaries", shadow: "People-pleasing", gift: "Fairness" },
  { id: "creation-spirit", left: "Creation", right: "Spirit", name: "The Mystic Artist", dynamic: "Form meets formless", shadow: "Ungroundedness", gift: "Beauty" },
  { id: "creation-peace", left: "Creation", right: "Peace", name: "The Gardener", dynamic: "Patient cultivation", shadow: "Stagnation", gift: "Harvest" },
  { id: "creation-order", left: "Creation", right: "Order", name: "The Architect", dynamic: "Form meets structure", shadow: "Perfectionism", gift: "Design" },
  { id: "spirit-peace", left: "Spirit", right: "Peace", name: "The Monk", dynamic: "Inner stillness", shadow: "Isolation", gift: "Wisdom" },
  { id: "spirit-order", left: "Spirit", right: "Order", name: "The Sage", dynamic: "Insight meets law", shadow: "Dogmatism", gift: "Truth" },
  { id: "peace-order", left: "Peace", right: "Order", name: "The Steward", dynamic: "Rest meets responsibility", shadow: "Avoider", gift: "Stability" },
];

export const COLLECTIVE_DYNAMICS = {
  groupSizes: [
    { size: 1, core: "Power", dynamic: "Individual will", example: "Solitary practitioner", practice: "Meditation on courage" },
    { size: 2, core: "Humanity", dynamic: "Partnership / Dyad", example: "Spiritual couple, deep friendship", practice: "Deep reciprocal listening" },
    { size: 3, core: "Creation", dynamic: "Triad / Generative team", example: "Artisan workshop, founding team", practice: "Collaborative design" },
    { size: 4, core: "Peace", dynamic: "Family unit / Stability", example: "Home sanctuary, hearth", practice: "Family reconciliation ritual" },
    { size: 5, core: "Order", dynamic: "Council / Governance", example: "Elders circle, legal council", practice: "Consensus-based governance" },
    { size: 6, core: "Spirit", dynamic: "Tribe / Community", example: "Sacred congregation, spiritual festival", practice: "Communal liturgy & celebration" },
  ],
  collectiveShadows: [
    { shadow: "War", core: "Humanity", expression: "Broken connection", remedy: "Reconciliation" },
    { shadow: "Sterility", core: "Creation", expression: "Blocked creativity", remedy: "Art therapy" },
    { shadow: "Dogma", core: "Spirit", expression: "Fixed belief", remedy: "Interfaith dialogue" },
    { shadow: "Tyranny", core: "Power", expression: "Abused will", remedy: "Democracy" },
    { shadow: "Chaos", core: "Peace", expression: "Lost center", remedy: "Ritual, order" },
    { shadow: "Corruption", core: "Order", expression: "Abused law", remedy: "Transparency" },
  ],
  collectiveGifts: [
    { gift: "Peace", core: "Humanity", expression: "Reconciliation", practice: "Council" },
    { gift: "Art", core: "Creation", expression: "Cultural flowering", practice: "Festival" },
    { gift: "Wisdom", core: "Spirit", expression: "Shared insight", practice: "Storytelling" },
    { gift: "Justice", core: "Power", expression: "Fair rule", practice: "Law" },
    { gift: "Order", core: "Peace", expression: "Stable society", practice: "Tradition" },
    { gift: "Righteousness", core: "Order", expression: "Fair law", practice: "Justice" },
  ],
};

// ─────────────────────────────────────────────────────────────
// LAYER 11: INITIATION GATES (6 GATES × 6 TRIALS)
// ─────────────────────────────────────────────────────────────

export const INITIATION_GATES: InitiationGate[] = [
  {
    gate: "Gate of Sparks",
    core: "Power",
    trialSummary: "Face your deepest fears and establish righteous will",
    reward: "Sovereign Will",
    duration: "1 year",
    trials: [
      "Fast for one day in intentional contemplation",
      "Speak your truth to power without hesitation",
      "Defend someone weaker from injustice",
      "Make a difficult ethical decision without compromise",
      "Lead a group through uncertainty",
      "Sacrifice something dear for a greater good",
    ],
  },
  {
    gate: "Gate of Bridges",
    core: "Humanity",
    trialSummary: "Forgive an enemy and embody unconditional love",
    reward: "Universal Love",
    duration: "1 year",
    trials: [
      "Forgive someone who wounded you deeply",
      "Ask for forgiveness where you caused harm",
      "Serve a complete stranger with kindness",
      "Listen deeply for an hour without interrupting",
      "Love without attachment or conditions",
      "Give without expectation of return",
    ],
  },
  {
    gate: "Gate of Seeds",
    core: "Creation",
    trialSummary: "Create an eternal work of art, service, or craft",
    reward: "Mastery of Form",
    duration: "1 year",
    trials: [
      "Plant and nurture a tree to rooted maturity",
      "Write a manuscript or journal of wisdom",
      "Create a piece of art that heals the viewer",
      "Build a physical or digital sanctuary",
      "Teach an apprentice a sacred skill",
      "Leave an enduring legacy for future generations",
    ],
  },
  {
    gate: "Gate of Roots",
    core: "Peace",
    trialSummary: "Sit in silence with unresolved pain and achieve true stillness",
    reward: "Deep Serenity",
    duration: "1 year",
    trials: [
      "Sit in unbroken silence for 24 hours",
      "Practice fasting from speech for 3 days",
      "Forgive yourself completely for past failures",
      "Heal an old emotional wound through acceptance",
      "Rest deeply without guilt or anxiety",
      "Embrace emptiness as fertile peace",
    ],
  },
  {
    gate: "Gate of Laws",
    core: "Order",
    trialSummary: "Serve justice, keep vows, and embody sacred principle",
    reward: "Cosmic Righteousness",
    duration: "1 year",
    trials: [
      "Study and internalize a sacred traditional text",
      "Keep an unbroken vow for 365 days",
      "Serve a community without recognition",
      "Establish an unshakeable daily spiritual routine",
      "Teach and uphold a sacred ethical boundary",
      "Mediate a conflict with impartial justice",
    ],
  },
  {
    gate: "Gate of Winds",
    core: "Spirit",
    trialSummary: "Surrender personal ego and realize unity with the divine",
    reward: "Spiritual Freedom",
    duration: "1 year",
    trials: [
      "Maintain 40 days of dawn prayer and meditation",
      "Give away cherished possessions to those in need",
      "Contemplate mortality and face fear of death",
      "Surrender personal will to divine providence",
      "Experience ego-dissolution into stillness",
      "Return to daily life embodying compassionate presence",
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// LAYER 12: COSMOLOGICAL REALMS (6 REALMS × 6 SUB-REALMS)
// ─────────────────────────────────────────────────────────────

export const COSMOLOGICAL_REALMS: CosmologicalRealm[] = [
  {
    realm: "The Hearth",
    core: "Humanity",
    description: "The cosmic chamber where souls connect in unconditional love",
    ruler: "The Mother (Enat)",
    gateway: "Heart Center",
    subRealms: [
      { name: "The Cradle", meaning: "Innocent primordial love" },
      { name: "The Circle", meaning: "Communal fellowship" },
      { name: "The Bridge", meaning: "Reconciling estrangement" },
      { name: "The Wound", meaning: "Compassionate suffering" },
      { name: "The Union", meaning: "Divine relational ecstasy" },
      { name: "The Sacrifice", meaning: "Selfless outpouring" },
    ],
  },
  {
    realm: "The Workshop",
    core: "Creation",
    description: "The celestial forge where forms, galaxies, and ideas are crafted",
    ruler: "The Artisan (Waq / Fetari)",
    gateway: "Hands and Sacral",
    subRealms: [
      { name: "The Seed", meaning: "Infinite potential" },
      { name: "The Wheel", meaning: "Mastery of sacred craft" },
      { name: "The Tower", meaning: "Enduring legacy" },
      { name: "The Mirror", meaning: "Harmonic beauty" },
      { name: "The Key", meaning: "Radical innovation" },
      { name: "The Hammer", meaning: "Necessary renewal through dissolution" },
    ],
  },
  {
    realm: "The Temple",
    core: "Spirit",
    description: "The boundless realm of prayer, divine light, and breath",
    ruler: "The Mystic (Menfes)",
    gateway: "Crown Center",
    subRealms: [
      { name: "The Breath", meaning: "Prana of life" },
      { name: "The Eye", meaning: "Prophetic vision" },
      { name: "The Altar", meaning: "Total surrender" },
      { name: "The Void", meaning: "Pure stillness" },
      { name: "The Flame", meaning: "Unitive absorption" },
      { name: "The Descent", meaning: "Incarnation into matter" },
    ],
  },
  {
    realm: "The Throne",
    core: "Power",
    description: "The seat of sovereign authority, courage, and cosmic will",
    ruler: "The Sovereign King (Nigus)",
    gateway: "Spine and Core",
    subRealms: [
      { name: "The Spark", meaning: "Divine initiation" },
      { name: "The Sword", meaning: "Courage in battle" },
      { name: "The Forge", meaning: "Discipline under pressure" },
      { name: "The Crown", meaning: "Righteous sovereignty" },
      { name: "The Gift", meaning: "Sacrifice of authority" },
      { name: "The Shield", meaning: "Impenetrable boundary" },
    ],
  },
  {
    realm: "The Garden",
    core: "Peace",
    description: "The tranquil haven of reconciliation, deep rest, and healing",
    ruler: "The Gardener (Selam)",
    gateway: "Feet and Navel",
    subRealms: [
      { name: "The Root", meaning: "Ancestral grounding" },
      { name: "The Pool", meaning: "Unwavering stillness" },
      { name: "The Path", meaning: "Merciful return" },
      { name: "The Scale", meaning: "Equilibrium" },
      { name: "The Flower", meaning: "Ecstatic bliss" },
      { name: "The Silence", meaning: "Fertile emptiness" },
    ],
  },
  {
    realm: "The Hall",
    core: "Order",
    description: "The great council of cosmic law, rhythm, and universal justice",
    ruler: "The Just Judge (Mizan)",
    gateway: "Throat and Eyes",
    subRealms: [
      { name: "The Law", meaning: "Immutable principle" },
      { name: "The Rhythm", meaning: "Seasonal cycle" },
      { name: "The Boundary", meaning: "Protective perimeter" },
      { name: "The Ladder", meaning: "Hierarchical ascension" },
      { name: "The Scroll", meaning: "Ancestral tradition" },
      { name: "The Cosmos", meaning: "Universal symphony" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// LAYER 13: CREATION DAYS (6 DAYS × RELATIONAL MEANINGS)
// ─────────────────────────────────────────────────────────────

export const CREATION_DAY_MAPPINGS: CreationDayMapping[] = [
  {
    day: "Sunday",
    creationAct: "Light separated from darkness",
    primaryCore: "Spirit",
    secondaryCore: "Order",
    relationalMeaning: "Light gives meaning; Order gives it boundary. Spirit without Order becomes chaos; Order without Spirit becomes empty law.",
    practice: "Meditation, deep breathwork, dawn greeting",
    bodySign: "Crown, breath",
    herb: "Frankincense",
    soundHz: 963,
  },
  {
    day: "Monday",
    creationAct: "Waters separated from waters",
    primaryCore: "Order",
    secondaryCore: "Humanity",
    relationalMeaning: "Order creates space for connection. Boundaries are not walls; they are the banks that let the river of Humanity flow.",
    practice: "Set intentions, organize weekly routines, establish limits",
    bodySign: "Nervous system, skin",
    herb: "Fennel (Tena Adam)",
    soundHz: 852,
  },
  {
    day: "Tuesday",
    creationAct: "Land and plants emerge",
    primaryCore: "Creation",
    secondaryCore: "Power",
    relationalMeaning: "Creation needs Power to emerge. The seed must push through soil. Power without Creation is force without fruit.",
    practice: "Make something tangible with your hands; plant, build, or craft",
    bodySign: "Womb, hands",
    herb: "Basil (Tikur Azmud)",
    soundHz: 528,
  },
  {
    day: "Wednesday",
    creationAct: "Lights placed in sky to govern time",
    primaryCore: "Power",
    secondaryCore: "Order",
    relationalMeaning: "Power governs time; Order gives Power its seasons. The sun rules the day, the moon rules the night—each within its law.",
    practice: "Act decisively, take leadership, make difficult decisions",
    bodySign: "Spine, blood",
    herb: "Nettle (Withania somnifera)",
    soundHz: 741,
  },
  {
    day: "Thursday",
    creationAct: "Sea creatures and birds fill waters and sky",
    primaryCore: "Humanity",
    secondaryCore: "Spirit",
    relationalMeaning: "Humanity is the bridge between depths and heights. Spirit gives Humanity its wings; Humanity gives Spirit its heart.",
    practice: "Connect deeply, listen without speaking, serve, forgive",
    bodySign: "Heart, hands",
    herb: "Rose (Rosa abyssinica)",
    soundHz: 396,
  },
  {
    day: "Friday",
    creationAct: "Land animals and humans are created",
    primaryCore: "Peace",
    secondaryCore: "Humanity",
    relationalMeaning: "Peace crowns creation. Humanity is made for rest, not endless toil. On the sixth day, the work is good—and Peace is the verdict.",
    practice: "Rest, heal, forgive self, practice stillness",
    bodySign: "Navel, feet",
    herb: "Chamomile (Kosso / Hagenia)",
    soundHz: 432,
  },
];

// ─────────────────────────────────────────────────────────────
// LAYER 14: CROSS-SYSTEM BRIDGES & ETHIOPIAN HERBAL SAFETY
// ─────────────────────────────────────────────────────────────

export const CROSS_SYSTEM_TRADITIONS: Record<HexacoreName, Record<string, string>> = {
  Power: { tcm: "Liver (Wood)", ayurveda: "Pitta", unani: "Fire", ethiopian: "Hayil (ሀይል)", latinAmerican: "Inti", western: "Mars / Sun" },
  Humanity: { tcm: "Heart (Fire)", ayurveda: "Kapha", unani: "Air", ethiopian: "Enat (እናት)", latinAmerican: "Pachamama", western: "Moon" },
  Creation: { tcm: "Kidney (Water)", ayurveda: "Vata", unani: "Water", ethiopian: "Fetret (ፍጥረት)", latinAmerican: "Mama Cocha", western: "Venus" },
  Peace: { tcm: "Spleen (Earth)", ayurveda: "Kapha", unani: "Earth", ethiopian: "Selam (ሰላም)", latinAmerican: "Mama Quilla", western: "Saturn" },
  Spirit: { tcm: "Lung (Metal)", ayurveda: "Vata", unani: "Aether", ethiopian: "Menfes (መንፈስ)", latinAmerican: "Wiracocha", western: "Neptune" },
  Order: { tcm: "Triple Burner", ayurveda: "Pitta", unani: "Air", ethiopian: "Sir'at (ስርዓት)", latinAmerican: "Viracocha", western: "Jupiter" },
};

export const ETHIOPIAN_HERBAL_INTEGRATION: EthiopianHerbDetail[] = [
  {
    core: "Power",
    herb: "Withania somnifera (Grawa / Ashwagandha)",
    scientificName: "Withania somnifera",
    preparation: "Root powder in warm milk or water",
    activeIngredient: "Withanolides, alkaloids",
    sideEffect: "Excess sedation, gastric upset at high doses",
    location: "Lowlands, Rift Valley",
    creationDay: "Wednesday",
    dosage: "1-3g daily",
    contraindications: ["Pregnancy", "Severe hyperthyroidism"],
    safetyRating: "Caution",
  },
  {
    core: "Humanity",
    herb: "Rosa abyssinica (Kega / Wild Rose)",
    scientificName: "Rosa abyssinica",
    preparation: "Sun-dried petal infusion or rose hip decoction",
    activeIngredient: "Flavonoids, anthocyanins, vitamin C",
    sideEffect: "Mild digestive laxative effect",
    location: "Highland escarpments (2,000–3,200m)",
    creationDay: "Thursday",
    dosage: "1-2 cups tea",
    contraindications: [],
    safetyRating: "Safe",
  },
  {
    core: "Creation",
    herb: "Nigella sativa (Tikur Azmud)",
    scientificName: "Nigella sativa",
    preparation: "Cold-pressed seed oil or lightly toasted crushed seed",
    activeIngredient: "Thymoquinone, nigelline",
    sideEffect: "Blood-thinning at high doses, mild skin allergy",
    location: "Widespread cultivated fields (Gojjam, Gondar)",
    creationDay: "Tuesday",
    dosage: "1-2 teaspoons seed or 1ml oil",
    contraindications: ["Upcoming surgery", "High-dose blood thinners"],
    safetyRating: "Safe",
  },
  {
    core: "Peace",
    herb: "Hagenia abyssinica (Kosso)",
    scientificName: "Hagenia abyssinica",
    preparation: "Crushed female flower inflorescence in water (TRADITIONAL TAPEWORM REMEDY)",
    activeIngredient: "Kosins, phloroglucinol derivatives",
    sideEffect: "MANDATORY WARNING: Potential optic nerve toxicity and nausea at high doses",
    location: "Montane cloud forests (2,400–3,600m)",
    creationDay: "Friday",
    dosage: "STRICT MEDICAL SUPERVISION REQUIRED (Historic: 5-10g single dose)",
    contraindications: ["Pregnancy (abortifacient)", "Liver failure", "Kidney disease"],
    safetyRating: "Strict Gate",
  },
  {
    core: "Spirit",
    herb: "Ocimum lamiifolium (Damakese)",
    scientificName: "Ocimum lamiifolium",
    preparation: "Crushed fresh leaf juice inhaled or steeped as steam inhalation",
    activeIngredient: "Eugenol, linalool, bornyl acetate",
    sideEffect: "Mild drowsiness, transient mucous membrane cooling",
    location: "Home gardens across Ethiopian highlands",
    creationDay: "Sunday",
    dosage: "Leaves steeped in steaming water",
    contraindications: [],
    safetyRating: "Safe",
  },
  {
    core: "Order",
    herb: "Ruta chalepensis (Tena Adam)",
    scientificName: "Ruta chalepensis",
    preparation: "Fresh berry dropped in traditional coffee (Buna) or light leaf tea",
    activeIngredient: "Rutin, bergapten, furocoumarins",
    sideEffect: "Photosensitivity, uterine contraction at high concentrations",
    location: "Cultivated in highland home gardens",
    creationDay: "Monday",
    dosage: "1-2 fresh leaves/berries only",
    contraindications: ["Pregnancy", "Photosensitivity disorders"],
    safetyRating: "Caution",
  },
];

// ─────────────────────────────────────────────────────────────
// BODY SIGN READING ENGINE (TONGUE, PALM, FACE, BODY)
// ─────────────────────────────────────────────────────────────

export const BODY_SIGN_ZONES = {
  tongue: [
    { zone: "Tip", core: "Spirit", sign: "Red tip", meaning: "Overactive mind / agitation", remedy: "Silent meditation & Damakese steam" },
    { zone: "Edges", core: "Humanity", sign: "Red or swollen edges", meaning: "Emotional stress / repressed grief", remedy: "Forgiveness journal & Rose tea" },
    { zone: "Center", core: "Peace", sign: "Yellow coating", meaning: "Digestive fire stagnation", remedy: "Fasting & gentle broth" },
    { zone: "Root", core: "Power", sign: "Pale root", meaning: "Depleted willpower & vitality", remedy: "Movement, sun exposure, Ashwagandha" },
    { zone: "Underside", core: "Creation", sign: "Distended blue veins", meaning: "Stagnant creative expression", remedy: "Crafting & Tikur Azmud seed" },
    { zone: "Back", core: "Order", sign: "White coating", meaning: "Nervous system exhaustion", remedy: "Strict sleep schedule & Tena Adam" },
  ],
  palm: [
    { zone: "Life Line", core: "Power", sign: "Deep and clear", meaning: "Strong vital reservoir", remedy: "Maintain physical discipline" },
    { zone: "Heart Line", core: "Humanity", sign: "Long and curved toward Jupiter", meaning: "Deep relational capacity", remedy: "Practice Welbeingy boundaries" },
    { zone: "Head Line", core: "Creation", sign: "Wavy descent toward Moon mount", meaning: "Rich imaginative fertility", remedy: "Channel into tangible art" },
    { zone: "Fate Line", core: "Peace", sign: "Steady central ascent", meaning: "Clear inner compass", remedy: "Trust unhurried progression" },
    { zone: "Spirit Line", core: "Spirit", sign: "Girdle of Venus / intuitive ring", meaning: "Subtle empathic perception", remedy: "Daily silence and prayer" },
    { zone: "Order Line", core: "Order", sign: "Well-defined Apollo boundary", meaning: "Respect for sacred law and integrity", remedy: "Lead through ethical clarity" },
  ],
  face: [
    { zone: "Forehead", core: "Spirit", sign: "Horizontal contemplation lines", meaning: "Intense mental contemplation", remedy: "Rest eyes, walk in nature" },
    { zone: "Eyes", core: "Humanity", sign: "Luminous and expressive", meaning: "Receptive emotional presence", remedy: "Connect openly with peers" },
    { zone: "Nose", core: "Power", sign: "Prominent bridge and firm wings", meaning: "Strong executive drive and resolve", remedy: "Serve collective good" },
    { zone: "Mouth", core: "Creation", sign: "Full expressive contours", meaning: "Fertile verbal and artistic manifestation", remedy: "Speak constructive truth" },
    { zone: "Chin / Jaw", core: "Peace", sign: "Broad, grounded mandible", meaning: "Stability under pressure", remedy: "Release stubborn tensions" },
    { zone: "Cheeks", core: "Order", sign: "Even tone and firm contours", meaning: "Equilibrium in autonomic nervous system", remedy: "Uphold steady rhythms" },
  ],
};

// ─────────────────────────────────────────────────────────────
// 6-BASED NUMEROLOGY ENGINE
// ─────────────────────────────────────────────────────────────

export interface HexacoreNumerology {
  coreNumber: number;
  isMaster: boolean;
  masterTitle?: string;
  destinyNumber: number;
  soulNumber: number;
  personalityNumber: number;
  maturityNumber: number;
  challengeNumber: number;
  creationDayNumber: number;
  gridFrequency: string; // e.g. "Power–Humanity (1,2)"
}

export function calculate6BasedNumerology(birthDate: string, name: string = ""): HexacoreNumerology {
  const digits = birthDate.replace(/\D/g, "").split("").map(Number);
  const sumAll = digits.reduce((a, b) => a + b, 0);

  // Check master numbers (11, 22, 33, 44, 55, 66)
  const masterList: Record<number, string> = {
    11: "The Visionary (Humanity–Spirit)",
    22: "The Master Builder (Creation–Peace)",
    33: "The Universal Healer (Spirit–Humanity)",
    44: "The Sovereign Judge (Power–Peace)",
    55: "The Prophet of Reform (Spirit–Power)",
    66: "The Cosmic Lawgiver (Order–Order)",
    77: "The Wise Monk (Peace–Spirit)",
    88: "The Manifestor (Creation–Power)",
    99: "The Compassionate Sage (Humanity–Peace)",
  };

  const isMaster = sumAll in masterList;
  const coreNumber = isMaster ? sumAll : (((sumAll - 1) % 6) + 1);

  // Destiny: day of birth reduced
  const dayOfMonth = parseInt(birthDate.split("-")[2] || "1", 10);
  const destinyNumber = ((dayOfMonth - 1) % 6) + 1;

  // Soul (Vowels in name)
  const vowels = name.toLowerCase().match(/[aeiou]/g) || [];
  const soulNumber = vowels.length ? ((vowels.length - 1) % 6) + 1 : 2;

  // Personality (Consonants in name)
  const consonants = name.toLowerCase().match(/[bcdfghjklmnpqrstvwxyz]/g) || [];
  const personalityNumber = consonants.length ? ((consonants.length - 1) % 6) + 1 : 4;

  const maturityNumber = ((destinyNumber + soulNumber - 1) % 6) + 1;
  const challengeNumber = Math.abs(destinyNumber - personalityNumber) || 1;

  const parsed = new Date(`${birthDate}T00:00:00Z`);
  const dayIndex = Number.isNaN(parsed.getTime()) ? 0 : parsed.getUTCDay();
  const creationDayNumber = ((dayIndex + 5) % 6) + 1; // Maps Sunday (0) -> 6, Wednesday -> 3, etc.

  const gridRow = ((coreNumber - 1) % 6) + 1;
  const gridCol = ((creationDayNumber - 1) % 6) + 1;
  const gridFrequency = `${HEXACORE_CORES[gridRow - 1].name}–${HEXACORE_CORES[gridCol - 1].name} (${gridRow},${gridCol})`;

  return {
    coreNumber,
    isMaster,
    masterTitle: masterList[coreNumber],
    destinyNumber,
    soulNumber,
    personalityNumber,
    maturityNumber,
    challengeNumber,
    creationDayNumber,
    gridFrequency,
  };
}

// ─────────────────────────────────────────────────────────────
// 30-DAY HEXACORE JOURNAL PROMPT GENERATOR
// ─────────────────────────────────────────────────────────────

export interface JournalPrompt {
  dayNumber: number;
  core: HexacoreName;
  aspect: string;
  creationDay: CreationDay;
  soundHz: number;
  herb: string;
  bodySign: string;
  morningPractice: string;
  middayReflection: string;
  eveningPractice: string;
  shadow: string;
  gift: string;
  affirmation: string;
}

export function getJournalPromptForDay(dayNumber: number): JournalPrompt {
  const day = Math.min(30, Math.max(1, Math.round(dayNumber)));
  let coreName: HexacoreName = "Power";
  let aspectName = "Spark";
  let creationDay: CreationDay = "Wednesday";

  if (day <= 7) {
    coreName = "Power";
    creationDay = "Wednesday";
    aspectName = ["Spark", "Flame", "Forge", "Throne", "Sacrifice", "Shield", "Integration"][day - 1];
  } else if (day <= 14) {
    coreName = "Humanity";
    creationDay = "Thursday";
    aspectName = ["Bond", "Tribe", "Justice", "Compassion", "Unity", "Service", "Integration"][day - 8];
  } else if (day <= 21) {
    coreName = "Creation";
    creationDay = "Tuesday";
    aspectName = ["Seed", "Craft", "Legacy", "Beauty", "Innovation", "Destruction", "Integration"][day - 15];
  } else if (day <= 28) {
    coreName = "Peace";
    creationDay = "Friday";
    aspectName = ["Root", "Stillness", "Return", "Balance", "Bliss", "Silence", "Integration"][day - 22];
  } else if (day === 29) {
    coreName = "Spirit";
    creationDay = "Sunday";
    aspectName = "Vision & Breath (Integration)";
  } else {
    coreName = "Order";
    creationDay = "Monday";
    aspectName = "Cosmic Law & Rhythm (Integration)";
  }

  const c = HEXACORE_CORES.find((core) => core.name === coreName)!;
  const aspectObj = HEXACORE_ASPECTS.find((a) => a.coreName === coreName && a.name === aspectName) || HEXACORE_ASPECTS.find((a) => a.coreName === coreName)!;

  return {
    dayNumber: day,
    core: coreName,
    aspect: aspectName,
    creationDay,
    soundHz: c.soundHz,
    herb: HERB_MAP[coreName],
    bodySign: `${aspectObj.bodyZone} awareness`,
    morningPractice: `10 minutes breathwork and contemplation on ${aspectName}. Drink warm ${HERB_MAP[coreName].split("(")[0].trim()} infusion.`,
    middayReflection: `Notice where you embody ${aspectObj.gift} today and where you slip into ${aspectObj.shadow}.`,
    eveningPractice: `Listen to ${c.soundHz} Hz for 10 minutes. Record one gratitude and release today's stress.`,
    shadow: aspectObj.shadow,
    gift: aspectObj.gift,
    affirmation: `I embody ${aspectObj.gift} through the sacred power of ${coreName}.`,
  };
}

// ─────────────────────────────────────────────────────────────
// PROFILE BUILDER: FULL 14-LAYER ARCHITECTURE
// ─────────────────────────────────────────────────────────────

export function buildHexacoreProfile(
  birthDate: string,
  allowReflectiveContent: boolean,
  ageVerified: boolean,
  name: string = "Seeker"
): HexacoreProfile {
  if (!allowReflectiveContent) {
    throw new Error("Explicit consent is required for Hexacore reflective content.");
  }
  if (!ageVerified) {
    throw new Error("Hexacore divination and herbal correspondence content is restricted to adults (18+).");
  }

  const parsed = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("birthDate must be a valid ISO date format (YYYY-MM-DD).");
  }

  const numerology = calculate6BasedNumerology(birthDate, name);
  const normalizedCore = ((numerology.coreNumber - 1) % 6) + 1;

  const dominant = HEXACORE_CORES[normalizedCore - 1];
  const secondary = HEXACORE_CORES[normalizedCore % 6];
  const tertiary = HEXACORE_CORES[(normalizedCore + 1) % 6];
  const dormant = HEXACORE_CORES[(normalizedCore + 3) % 6];

  const creationDayOrder: CreationDay[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Sunday"];
  const dayName = creationDayOrder[parsed.getUTCDay()] || "Thursday";
  const day = CREATION_DAY_MAPPINGS.find((m) => m.day === dayName) ?? CREATION_DAY_MAPPINGS[4]; // default Thursday

  const dominantAspects = HEXACORE_ASPECTS.filter((a) => a.coreName === dominant.name);
  const primaryAspect = dominantAspects[0];
  const primaryFrequency = HEXACORE_FREQUENCIES.find((f) => f.aspectId === primaryAspect.id && f.state === "Radiant") || HEXACORE_FREQUENCIES[0];

  const pair =
    HEXACORE_PAIRS.find((p) => p.left === dominant.name && p.right === secondary.name) ??
    HEXACORE_PAIRS.find((p) => p.left === secondary.name && p.right === dominant.name) ??
    HEXACORE_PAIRS[0];

  const primaryArchetype = HEXACORE_ARCHETYPES.find((a) => a.coreName === dominant.name) ?? HEXACORE_ARCHETYPES[0];
  const dominantCorrespondences = HEXACORE_CORRESPONDENCES.filter((c) => c.creationDay === dominant.creationDay);

  const layerSummary = {
    layer1Cores: { dominant: dominant.name, secondary: secondary.name, tertiary: tertiary.name, dormant: dormant.name },
    layer2Aspects: dominantAspects,
    layer3Frequencies: HEXACORE_FREQUENCIES.filter((f) => f.aspectId.startsWith(primaryAspect.id.charAt(0))),
    layer4Archetypes: HEXACORE_ARCHETYPES.filter((a) => a.coreName === dominant.name),
    layer5Shadows: dominantAspects.map((a) => ({ shadow: a.shadow, remedy: `Practice balanced ${a.gift}`, bodySign: a.bodyZone })),
    layer6Gifts: dominantAspects.map((a) => ({ gift: a.gift, expression: a.expression })),
    layer7Correspondences: dominantCorrespondences.slice(0, 6),
    layer8Temporal: {
      daily: "Evening (Humanity)",
      monthly: "Week 4 (Peace)",
      annual: "Flowing (Humanity)",
      life: "Seed (Creation)",
      cosmic: "Age of Bridges",
      creation: day.day,
    },
    layer9Energetic: {
      body: "Emotional Body",
      center: `${dominant.chakra} Center`,
      meridian: `${dominant.meridian} Meridian`,
      soundHz: dominant.soundHz,
    },
    layer10Collective: {
      groupSize: 2,
      dynamic: pair.dynamic,
      shadow: pair.shadow,
      gift: pair.gift,
    },
    layer11Initiation: {
      gate: INITIATION_GATES.find((g) => g.core === dominant.name)?.gate || "Gate of Bridges",
      trial: INITIATION_GATES.find((g) => g.core === dominant.name)?.trials[0] || "Forgive an enemy",
      reward: dominant.virtue,
      level: "Student",
    },
    layer12Cosmology: {
      realm: COSMOLOGICAL_REALMS.find((r) => r.core === dominant.name)?.realm || "The Hearth",
      ruler: COSMOLOGICAL_REALMS.find((r) => r.core === dominant.name)?.ruler || "The Mother",
      age: "Age of Bridges",
      heaven: "Second Heaven",
    },
    layer13CreationDays: day,
    layer14CrossSystem: {
      tcm: CROSS_SYSTEM_TRADITIONS[dominant.name].tcm,
      ayurveda: CROSS_SYSTEM_TRADITIONS[dominant.name].ayurveda,
      unani: CROSS_SYSTEM_TRADITIONS[dominant.name].unani,
      ethiopian: CROSS_SYSTEM_TRADITIONS[dominant.name].ethiopian,
      latinAmerican: CROSS_SYSTEM_TRADITIONS[dominant.name].latinAmerican,
      western: CROSS_SYSTEM_TRADITIONS[dominant.name].western,
    },
  };

  return {
    coreNumber: numerology.coreNumber,
    dominantCore: dominant.name,
    secondaryCore: secondary.name,
    tertiaryCore: tertiary.name,
    dormantCore: dormant.name,
    creationDay: day.day,
    aspect: primaryAspect,
    frequency: primaryFrequency,
    archetype: numerology.masterTitle ? `${numerology.masterTitle} (${pair.name})` : pair.name,
    shadow: pair.shadow,
    gift: pair.gift,
    correspondences: {
      planet: dominant.planet,
      plant: dominant.plant,
      soundHz: dominant.soundHz,
      geometry: dominant.geometry,
      metal: dominant.metal,
      stone: dominant.stone,
    },
    creationDayMapping: day,
    layerSummary,
    safety: {
      reflectiveOnly: true,
      bodySignsAreNotDiagnosis: true,
      ageGateRequired: true,
    },
  };
}
