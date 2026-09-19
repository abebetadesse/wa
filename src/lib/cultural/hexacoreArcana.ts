export type HexacoreName = "Power" | "Humanity" | "Creation" | "Peace" | "Spirit" | "Order";
export type CreationDay = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface HexacoreCore {
  id: Lowercase<HexacoreName>;
  name: HexacoreName;
  number: number;
  essence: string;
  question: string;
  amharic: string;
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
}

export interface HexacoreAspect {
  id: string;
  coreId: HexacoreCore["id"];
  name: string;
  expression: string;
  bodyZone: string;
  baseFrequencyHz: number;
  shadow: string;
  gift: string;
}

export interface HexacoreFrequency {
  id: string;
  aspectId: string;
  name: string;
  state: "Dormant" | "Awakening" | "Active" | "Radiant" | "Transcendent" | "Eternal";
  sign: string;
  soundHz: number;
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

export interface HexacoreProfile {
  coreNumber: number;
  dominantCore: HexacoreName;
  secondaryCore: HexacoreName;
  tertiaryCore: HexacoreName;
  creationDay: CreationDay;
  aspect: HexacoreAspect;
  frequency: HexacoreFrequency;
  archetype: string;
  shadow: string;
  gift: string;
  correspondences: Pick<HexacoreCore, "planet" | "plant" | "soundHz" | "geometry" | "metal" | "stone">;
  creationDayMapping: CreationDayMapping;
  safety: {
    reflectiveOnly: true;
    bodySignsAreNotDiagnosis: true;
    ageGateRequired: true;
  };
}

const core = (value: Omit<HexacoreCore, "id">): HexacoreCore => ({ ...value, id: value.name.toLowerCase() as Lowercase<HexacoreName> });

export const HEXACORE_CORES: HexacoreCore[] = [
  core({ name: "Power", number: 1, essence: "Will, courage, transformation", question: "How do I act with courage?", amharic: "Hayil", polarity: "Active–Directing", season: "Spring", direction: "East", time: "Noon", planet: "Mars/Sun", metal: "Iron", stone: "Ruby", plant: "Nettle", soundHz: 741, geometry: "Triangle", bodySystem: "Muscular/Skeletal", virtue: "Courage", shadow: "Domination", gift: "Justice", creationDay: "Wednesday", chakra: "Solar Plexus", meridian: "Liver", element: "Fire", tarotSuit: "Wands", rune: "Fehu" }),
  core({ name: "Humanity", number: 2, essence: "Connection, empathy, justice", question: "How do I connect without losing myself?", amharic: "Enat", polarity: "Receptive–Connecting", season: "Summer", direction: "West", time: "Dusk", planet: "Moon", metal: "Silver", stone: "Rose Quartz", plant: "Rose", soundHz: 396, geometry: "Circle", bodySystem: "Circulatory", virtue: "Compassion", shadow: "Enmeshment", gift: "Universal Love", creationDay: "Thursday", chakra: "Heart", meridian: "Heart", element: "Water", tarotSuit: "Cups", rune: "Gebo" }),
  core({ name: "Creation", number: 3, essence: "Imagination, fertility, craft", question: "What can I bring into form?", amharic: "Fetret", polarity: "Projective–Forming", season: "Late Summer", direction: "North", time: "Midnight", planet: "Venus", metal: "Copper", stone: "Emerald", plant: "Basil", soundHz: 528, geometry: "Spiral", bodySystem: "Reproductive", virtue: "Creativity", shadow: "Scatteredness", gift: "Manifestation", creationDay: "Tuesday", chakra: "Sacral", meridian: "Kidney", element: "Earth", tarotSuit: "Pentacles", rune: "Berkano" }),
  core({ name: "Peace", number: 4, essence: "Balance, healing, forgiveness", question: "What can be restored?", amharic: "Selam", polarity: "Neutral–Balancing", season: "Autumn", direction: "Center", time: "Twilight", planet: "Saturn", metal: "Lead", stone: "Clear Quartz", plant: "Chamomile", soundHz: 432, geometry: "Square", bodySystem: "Digestive", virtue: "Forgiveness", shadow: "Stagnation", gift: "Serenity", creationDay: "Friday", chakra: "Root", meridian: "Spleen", element: "Aether", tarotSuit: "Swords", rune: "Algiz" }),
  core({ name: "Spirit", number: 5, essence: "Meaning, intuition, faith", question: "What gives this life meaning?", amharic: "Menfes", polarity: "Expansive–Dissolving", season: "Winter", direction: "Above/Below", time: "Dawn", planet: "Neptune", metal: "Platinum", stone: "Amethyst", plant: "Frankincense", soundHz: 963, geometry: "Point", bodySystem: "Respiratory", virtue: "Faith", shadow: "Dogma", gift: "Transcendence", creationDay: "Sunday", chakra: "Crown", meridian: "Lung", element: "Air", tarotSuit: "Major Arcana", rune: "Sowilo" }),
  core({ name: "Order", number: 6, essence: "Structure, law, rhythm, time, boundaries, justice", question: "How do I align with what is right?", amharic: "Sir'at", polarity: "Neutral–Directing", season: "Late Autumn", direction: "South", time: "First Light", planet: "Jupiter", metal: "Tin", stone: "Lapis Lazuli", plant: "Fennel", soundHz: 852, geometry: "Hexagon", bodySystem: "Nervous System", virtue: "Justice", shadow: "Rigidity", gift: "Righteousness", creationDay: "Monday", chakra: "Third Eye", meridian: "Triple Burner", element: "Metal", tarotSuit: "Disks", rune: "Jera" }),
];

const aspectSeed: Array<[string, string, string, string, string, string]> = [
  ["Spark", "Initiation, will", "Spine", "Hesitation", "Initiative", "Power"], ["Flame", "Courage, action", "Blood", "Recklessness", "Bravery", "Power"], ["Forge", "Transformation, discipline", "Muscles", "Burnout", "Mastery", "Power"], ["Throne", "Sovereignty, rule", "Crown", "Tyranny", "Leadership", "Power"], ["Sacrifice", "Power given away", "Heart", "Martyrdom", "Generosity", "Power"], ["Shield", "Protection, boundaries", "Arms", "Isolation", "Safety", "Power"],
  ["Bond", "One-to-one intimacy", "Heart", "Enmeshment", "Authenticity", "Humanity"], ["Tribe", "Community belonging", "Hands", "Conformity", "Belonging", "Humanity"], ["Justice", "Fairness for all", "Blood", "Revenge", "Equity", "Humanity"], ["Compassion", "Suffering with others", "Chest", "Pity", "Empathy", "Humanity"], ["Unity", "All is one", "Whole body", "Absorption", "Oneness", "Humanity"], ["Service", "Giving without expectation", "Feet", "Servitude", "Contribution", "Humanity"],
  ["Seed", "Conception, beginning", "Womb", "Barrenness", "Potential", "Creation"], ["Craft", "Skill, making", "Hands/Mind", "Perfectionism", "Mastery", "Creation"], ["Legacy", "What outlives you", "Bones", "Ego", "Inheritance", "Creation"], ["Beauty", "Aesthetics, harmony", "Eyes", "Vanity", "Aesthetics", "Creation"], ["Innovation", "New forms", "Brain", "Chaos", "Invention", "Creation"], ["Destruction", "Necessary endings", "Hands", "Vandalism", "Renewal", "Creation"],
  ["Root", "Grounding, stability", "Feet", "Fear", "Safety", "Peace"], ["Stillness", "Meditation, rest", "Navel", "Numbness", "Serenity", "Peace"], ["Return", "Forgiveness, healing", "Heart", "Resentment", "Release", "Peace"], ["Balance", "Harmony, justice", "Inner ear", "Indecision", "Equilibrium", "Peace"], ["Bliss", "Supreme peace", "Whole body", "Attachment", "Ecstasy", "Peace"], ["Silence", "The void", "Throat", "Isolation", "Emptiness", "Peace"],
  ["Breath", "Life force, breath", "Lungs", "Shallow breath", "Vitality", "Spirit"], ["Vision", "Intuition, dreams", "Third Eye", "Delusion", "Insight", "Spirit"], ["Surrender", "Faith, release", "Crown", "Apathy", "Trust", "Spirit"], ["Silence", "Inner stillness", "Whole body", "Isolation", "Peace", "Spirit"], ["Union", "Mystical union", "Heart", "Dissolution", "Oneness", "Spirit"], ["Descent", "Spirit into matter", "Feet", "Materialism", "Incarnation", "Spirit"],
  ["Law", "Rules, principles", "Nervous system", "Legalism", "Justice", "Order"], ["Rhythm", "Cycles, time", "Heart", "Rigidity", "Flow", "Order"], ["Boundary", "Limits, containers", "Skin", "Walls", "Safety", "Order"], ["Hierarchy", "Levels, structure", "Spine", "Oppression", "Order", "Order"], ["Tradition", "Ancestral wisdom", "Bones", "Stagnation", "Continuity", "Order"], ["Cosmos", "Universal order", "Crown", "Chaos", "Harmony", "Order"],
];

export const HEXACORE_ASPECTS: HexacoreAspect[] = aspectSeed.map(([name, expression, bodyZone, shadow, gift, coreName], index) => {
  const core = HEXACORE_CORES.find((item) => item.name === coreName)!;
  return { id: `${core.id[0].toUpperCase()}${(index % 6) + 1}`, coreId: core.id, name, expression, bodyZone, baseFrequencyHz: [174, 285, 396, 528, 741, 852][index % 6], shadow, gift };
});

export const HEXACORE_FREQUENCIES: HexacoreFrequency[] = HEXACORE_ASPECTS.flatMap((aspect) =>
  (["Dormant", "Awakening", "Active", "Radiant", "Transcendent", "Eternal"] as const).map((state, index) => ({
    id: `${aspect.id}.${index + 1}`, aspectId: aspect.id, name: `${state} ${aspect.name}`, state,
    sign: ["Closed awareness", "Curiosity and opening", "Embodied practice", "Generative expression", "Integrated presence", "Reflective continuity"][index],
    soundHz: [174, 285, 396, 528, 741, 963][index],
  })),
);

export const HEXACORE_PAIRS: HexacorePair[] = [
  ["Power", "Humanity", "The Leader", "Will guided by love", "Domination", "Justice"],
  ["Power", "Creation", "The Builder", "Will made manifest", "Burnout", "Manifestation"],
  ["Power", "Spirit", "The Prophet", "Truth with force", "Fanaticism", "Reform"],
  ["Power", "Peace", "The Judge", "Force balanced by mercy", "Rigidity", "Justice"],
  ["Power", "Order", "The Lawgiver", "Will aligned with law", "Tyranny", "Righteousness"],
  ["Humanity", "Creation", "The Nurturer", "Love made visible", "Overgiving", "Art"],
  ["Humanity", "Spirit", "The Visionary", "Love meets meaning", "Escapism", "Prophetic empathy"],
  ["Humanity", "Peace", "The Healer", "Love that restores", "Martyrdom", "Compassion"],
  ["Humanity", "Order", "The Diplomat", "Love with boundaries", "People-pleasing", "Fairness"],
  ["Creation", "Spirit", "The Mystic Artist", "Form meets formless", "Ungroundedness", "Beauty"],
  ["Creation", "Peace", "The Gardener", "Patient cultivation", "Stagnation", "Harvest"],
  ["Creation", "Order", "The Architect", "Form meets structure", "Perfectionism", "Design"],
  ["Spirit", "Peace", "The Monk", "Inner stillness", "Isolation", "Wisdom"],
  ["Spirit", "Order", "The Sage", "Insight meets law", "Dogmatism", "Truth"],
  ["Peace", "Order", "The Steward", "Rest meets responsibility", "Avoider", "Stability"],
].map(([left, right, name, dynamic, shadow, gift]) => ({ id: `${left}-${right}`.toLowerCase(), left: left as HexacoreName, right: right as HexacoreName, name, dynamic, shadow, gift }));

export const CREATION_DAY_MAPPINGS: CreationDayMapping[] = [
  { day: "Sunday", creationAct: "Light separated from darkness", primaryCore: "Spirit", secondaryCore: "Order", relationalMeaning: "Light gives meaning; Order gives it boundary.", practice: "Meditation, breathwork", bodySign: "Crown, breath", herb: "Frankincense", soundHz: 963 },
  { day: "Monday", creationAct: "Waters separated from waters", primaryCore: "Order", secondaryCore: "Humanity", relationalMeaning: "Order creates space for connection.", practice: "Set intentions, establish routines", bodySign: "Nervous system, skin", herb: "Fennel", soundHz: 852 },
  { day: "Tuesday", creationAct: "Land and plants emerge", primaryCore: "Creation", secondaryCore: "Power", relationalMeaning: "Creation needs Power to emerge.", practice: "Make something, plant, build", bodySign: "Womb, hands", herb: "Basil", soundHz: 528 },
  { day: "Wednesday", creationAct: "Lights govern time", primaryCore: "Power", secondaryCore: "Order", relationalMeaning: "Power governs time; Order gives Power its seasons.", practice: "Act, decide, lead", bodySign: "Spine, blood", herb: "Nettle", soundHz: 741 },
  { day: "Thursday", creationAct: "Sea creatures and birds fill waters and sky", primaryCore: "Humanity", secondaryCore: "Spirit", relationalMeaning: "Humanity bridges depths and heights.", practice: "Connect, forgive, serve", bodySign: "Heart, hands", herb: "Rose", soundHz: 396 },
  { day: "Friday", creationAct: "Land animals and humans are created", primaryCore: "Peace", secondaryCore: "Humanity", relationalMeaning: "Peace crowns creation; work is good and rest is permitted.", practice: "Rest, forgive, heal", bodySign: "Navel, feet", herb: "Chamomile", soundHz: 432 },
];

function digitSum(value: string): number {
  return value.replace(/\D/g, "").split("").reduce((sum, digit) => sum + Number(digit), 0);
}

export function buildHexacoreProfile(birthDate: string, allowReflectiveContent: boolean, ageVerified: boolean): HexacoreProfile {
  if (!allowReflectiveContent) throw new Error("Explicit consent is required for Hexacore reflective content.");
  if (!ageVerified) throw new Error("Hexacore divination and herbal correspondence content is restricted to adults.");
  const parsed = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error("birthDate must be a valid ISO date.");
  const coreNumber = ((digitSum(birthDate) - 1) % 6) + 1;
  const dominant = HEXACORE_CORES[coreNumber - 1];
  const secondary = HEXACORE_CORES[(coreNumber % 6)];
  const tertiary = HEXACORE_CORES[(coreNumber + 1) % 6];
  const day = CREATION_DAY_MAPPINGS.find((mapping) => mapping.day === ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][parsed.getUTCDay()]) ?? CREATION_DAY_MAPPINGS[0];
  const aspect = HEXACORE_ASPECTS.find((item) => item.coreId === dominant.id)!;
  const frequency = HEXACORE_FREQUENCIES.find((item) => item.aspectId === aspect.id && item.state === "Active")!;
  const pair = HEXACORE_PAIRS.find((item) => item.left === dominant.name && item.right === secondary.name) ?? HEXACORE_PAIRS.find((item) => item.left === secondary.name && item.right === dominant.name)!;
  return {
    coreNumber, dominantCore: dominant.name, secondaryCore: secondary.name, tertiaryCore: tertiary.name,
    creationDay: day.day, aspect, frequency, archetype: pair.name, shadow: pair.shadow, gift: pair.gift,
    correspondences: { planet: dominant.planet, plant: dominant.plant, soundHz: dominant.soundHz, geometry: dominant.geometry, metal: dominant.metal, stone: dominant.stone },
    creationDayMapping: day,
    safety: { reflectiveOnly: true, bodySignsAreNotDiagnosis: true, ageGateRequired: true },
  };
}
