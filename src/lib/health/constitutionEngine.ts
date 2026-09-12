/**
 * Holistic Constitution Engine
 * Integrating AyurAI / AyurGenie - Dosha + Ethiopian Humoral + TCM
 */

import {
  ConstitutionQuizAnswer,
  DoshaPrakritiScore,
  EthiopianHumoralScore,
  HolisticConstitutionProfile,
  DoshaType,
  EthiopianHumor,
} from "./healthTypes";

export interface ConstitutionQuestion {
  id: string;
  text: string;
  amharicText?: string;
  category: ConstitutionQuizAnswer["category"];
  options: {
    label: string;
    scores: {
      vata: number; pitta: number; kapha: number;
      esat: number; afere: number; nifas: number; may: number;
    };
  }[];
}

export const CONSTITUTION_QUESTIONS: ConstitutionQuestion[] = [
  {
    id: "body-frame",
    text: "How would you describe your body frame?",
    amharicText: "የሰውነትዎን ቅርጽ እንዴት ይገልፁታል?",
    category: "physical",
    options: [
      { label: "Slim, light, hard to gain weight", scores: { vata: 2, pitta: 0, kapha: 0, esat: 0, afere: 0, nifas: 2, may: 0 } },
      { label: "Medium, muscular, well-proportioned", scores: { vata: 0, pitta: 2, kapha: 0, esat: 2, afere: 1, nifas: 0, may: 0 } },
      { label: "Larger, solid, gains weight easily", scores: { vata: 0, pitta: 0, kapha: 2, esat: 0, afere: 2, nifas: 0, may: 2 } },
    ],
  },
  {
    id: "skin-type",
    text: "How does your skin generally feel?",
    amharicText: "ቆዳዎ ብዙ ጊዜ እንዴት ይሰማዎታል?",
    category: "physical",
    options: [
      { label: "Dry, rough, or prone to cracking", scores: { vata: 2, pitta: 0, kapha: 0, esat: 0, afere: 0, nifas: 2, may: 0 } },
      { label: "Oily, warm, prone to redness/acne", scores: { vata: 0, pitta: 2, kapha: 0, esat: 2, afere: 0, nifas: 0, may: 0 } },
      { label: "Thick, moist, smooth, cool", scores: { vata: 0, pitta: 0, kapha: 2, esat: 0, afere: 1, nifas: 0, may: 2 } },
    ],
  },
  {
    id: "digestion",
    text: "How is your digestion?",
    amharicText: "የምግብ መፈጨትዎ እንዴት ነው?",
    category: "digestive",
    options: [
      { label: "Irregular, bloating, gas-prone, variable appetite", scores: { vata: 2, pitta: 0, kapha: 0, esat: 0, afere: 0, nifas: 2, may: 0 } },
      { label: "Strong, sharp hunger, can't skip meals, heartburn tendency", scores: { vata: 0, pitta: 2, kapha: 0, esat: 2, afere: 0, nifas: 0, may: 0 } },
      { label: "Slow, steady, satiated for long, low appetite", scores: { vata: 0, pitta: 0, kapha: 2, esat: 0, afere: 2, nifas: 0, may: 1 } },
    ],
  },
  {
    id: "energy-pattern",
    text: "How does your energy typically behave?",
    amharicText: "ጉልበትዎ ብዙ ጊዜ እንዴት ነው?",
    category: "physical",
    options: [
      { label: "Comes in bursts, tires quickly, restless", scores: { vata: 2, pitta: 0, kapha: 0, esat: 0, afere: 0, nifas: 2, may: 0 } },
      { label: "High, focused, competitive, driven", scores: { vata: 0, pitta: 2, kapha: 0, esat: 2, afere: 0, nifas: 0, may: 0 } },
      { label: "Steady, slow to start, good endurance", scores: { vata: 0, pitta: 0, kapha: 2, esat: 0, afere: 1, nifas: 0, may: 2 } },
    ],
  },
  {
    id: "sleep",
    text: "How do you sleep?",
    amharicText: "ምን ያህል ጥሩ ይተኛሉ?",
    category: "sleep",
    options: [
      { label: "Light, disturbed, wake often, vivid dreams", scores: { vata: 2, pitta: 0, kapha: 0, esat: 0, afere: 0, nifas: 2, may: 0 } },
      { label: "Moderate, wake refreshed, can't sleep if too hot", scores: { vata: 0, pitta: 2, kapha: 0, esat: 1, afere: 0, nifas: 0, may: 0 } },
      { label: "Deep, heavy, long sleep, hard to wake", scores: { vata: 0, pitta: 0, kapha: 2, esat: 0, afere: 2, nifas: 0, may: 2 } },
    ],
  },
  {
    id: "stress-response",
    text: "Under stress, you tend to:",
    amharicText: "ጫና ሲኖር ምን ያደርጋሉ?",
    category: "emotional",
    options: [
      { label: "Feel anxious, overwhelmed, scattered, or fearful", scores: { vata: 2, pitta: 0, kapha: 0, esat: 0, afere: 0, nifas: 2, may: 1 } },
      { label: "Become irritable, critical, controlling, or angry", scores: { vata: 0, pitta: 2, kapha: 0, esat: 2, afere: 0, nifas: 0, may: 0 } },
      { label: "Withdraw, hold onto emotions, become complacent", scores: { vata: 0, pitta: 0, kapha: 2, esat: 0, afere: 2, nifas: 0, may: 2 } },
    ],
  },
  {
    id: "mind-pattern",
    text: "How would you describe your thinking style?",
    amharicText: "አስተሳሰብዎ ምን ዓይነት ነው?",
    category: "mental",
    options: [
      { label: "Quick, creative, change my mind often, forgetful", scores: { vata: 2, pitta: 0, kapha: 0, esat: 0, afere: 0, nifas: 2, may: 0 } },
      { label: "Analytical, precise, decisive, focused", scores: { vata: 0, pitta: 2, kapha: 0, esat: 1, afere: 1, nifas: 0, may: 0 } },
      { label: "Calm, methodical, slow but thorough, good memory", scores: { vata: 0, pitta: 0, kapha: 2, esat: 0, afere: 2, nifas: 0, may: 1 } },
    ],
  },
  {
    id: "seasonal-preference",
    text: "Which season do you prefer?",
    amharicText: "የትኛውን ወቅት ይመርጣሉ?",
    category: "seasonal",
    options: [
      { label: "Warm/Summer (cold bothers me)", scores: { vata: 2, pitta: 0, kapha: 0, esat: 0, afere: 0, nifas: 2, may: 0 } },
      { label: "Cool/Autumn (heat bothers me)", scores: { vata: 0, pitta: 2, kapha: 0, esat: 2, afere: 0, nifas: 0, may: 0 } },
      { label: "Warm & dry (damp/cold bothers me)", scores: { vata: 0, pitta: 0, kapha: 2, esat: 1, afere: 2, nifas: 0, may: 1 } },
    ],
  },
];

function determineDoshaType(scores: { vata: number; pitta: number; kapha: number }): DoshaPrakritiScore {
  const total = scores.vata + scores.pitta + scores.kapha || 1;
  const vata = Math.round((scores.vata / total) * 100);
  const pitta = Math.round((scores.pitta / total) * 100);
  const kapha = Math.round((scores.kapha / total) * 100);

  const sorted = [
    { type: "Vata" as DoshaType, value: vata },
    { type: "Pitta" as DoshaType, value: pitta },
    { type: "Kapha" as DoshaType, value: kapha },
  ].sort((a, b) => b.value - a.value);

  const primary = sorted[0];
  const secondary = sorted[1];

  let primaryDosha: DoshaType = primary.type;
  let secondaryDosha: DoshaType | undefined;

  if (primary.value - secondary.value < 15) {
    // Dual type
    const combo = [primary.type, secondary.type].sort().join("-") as DoshaType;
    if (["Vata-Pitta", "Pitta-Kapha", "Vata-Kapha"].includes(combo)) {
      primaryDosha = combo;
    } else {
      secondaryDosha = secondary.type;
    }
  }

  if (Math.abs(vata - pitta) < 10 && Math.abs(pitta - kapha) < 10) {
    primaryDosha = "Tridosha";
  }

  return { vata, pitta, kapha, primaryDosha, secondaryDosha };
}

function determineHumor(scores: { esat: number; afere: number; nifas: number; may: number }): EthiopianHumoralScore {
  const total = scores.esat + scores.afere + scores.nifas + scores.may || 1;
  const esat = Math.round((scores.esat / total) * 100);
  const afere = Math.round((scores.afere / total) * 100);
  const nifas = Math.round((scores.nifas / total) * 100);
  const may = Math.round((scores.may / total) * 100);

  const sorted = [
    { humor: "esat" as EthiopianHumor, value: esat },
    { humor: "afere" as EthiopianHumor, value: afere },
    { humor: "nifas" as EthiopianHumor, value: nifas },
    { humor: "may" as EthiopianHumor, value: may },
  ].sort((a, b) => b.value - a.value);

  return {
    esat, afere, nifas, may,
    dominantHumor: sorted[0].humor,
    secondaryHumor: sorted[1].value > 20 ? sorted[1].humor : undefined,
  };
}

export function buildConstitutionProfile(
  answers: ConstitutionQuizAnswer[]
): HolisticConstitutionProfile {
  const totals = { vata: 0, pitta: 0, kapha: 0, esat: 0, afere: 0, nifas: 0, may: 0 };

  for (const answer of answers) {
    totals.vata += answer.vataScore;
    totals.pitta += answer.pittaScore;
    totals.kapha += answer.kaphaScore;
    totals.esat += answer.esatScore;
    totals.afere += answer.afereScore;
    totals.nifas += answer.nifasScore;
    totals.may += answer.mayScore;
  }

  const dosha = determineDoshaType(totals);
  const humor = determineHumor(totals);

  const DOSHA_NARRATIVES: Record<string, string> = {
    Vata: "You are governed by the principle of movement and change (Nifas — Air essence). Your constitution thrives on warmth, routine, and nourishment. You are creative and quick but need grounding through regular meals, warm foods, and adequate rest.",
    Pitta: "You are governed by the principle of transformation and heat (Esat — Fire essence). Your constitution thrives on cooling, moderation, and structured activity. You are focused and driven but need to temper intensity with relaxation and cooling foods.",
    Kapha: "You are governed by the principle of stability and cohesion (Afere + May — Earth and Water). Your constitution thrives on stimulation, variety, and lightening practices. You are steady and loyal but benefit from daily movement and reducing heavy foods.",
    "Vata-Pitta": "A dual constitution of movement and fire — highly creative and driven, but prone to burnout and inflammation. Prioritize warm, moderately spiced foods and regular scheduling.",
    "Pitta-Kapha": "A dual constitution of fire and stability — determined and strong, but prone to metabolic excess and weight challenges. Prioritize cooling, lighter meals and regular vigorous activity.",
    "Vata-Kapha": "A dual constitution of movement and stability — adaptable but inconsistent. Often experiences cold, damp conditions and irregular digestion. Prioritize warm, dry foods and consistent routine.",
    Tridosha: "A rare tri-constitutional balance — generally resilient but responds sensitively to seasonal and dietary changes. Follow seasonal protocols closely.",
  };

  return {
    profileId: `cp-${Date.now()}`,
    assessedAt: new Date().toISOString(),
    dosha,
    humor,
    tcmConstitution: humor.dominantHumor === "esat" ? "Fire-Heat" :
      humor.dominantHumor === "afere" ? "Earth-Phlegm" :
      humor.dominantHumor === "nifas" ? "Wind-Deficiency" : "Water-Damp",
    overallConstitutionNarrative: DOSHA_NARRATIVES[dosha.primaryDosha] || "A unique blend of constitutional energies.",
    strengthsAndVulnerabilities: {
      physicalStrengths: dosha.primaryDosha.includes("Pitta")
        ? ["Strong metabolism", "Good muscle tone", "High drive"]
        : dosha.primaryDosha.includes("Kapha")
        ? ["Strong endurance", "Stable immunity", "Good joint lubrication"]
        : ["Quick reflexes", "Creative adaptability", "Light and agile"],
      physicalVulnerabilities: dosha.primaryDosha.includes("Vata")
        ? ["Irregular digestion", "Joint dryness", "Poor circulation in cold"]
        : dosha.primaryDosha.includes("Pitta")
        ? ["Inflammation", "Acid reflux", "Heat rashes"]
        : ["Congestion", "Weight gain", "Slow lymphatic flow"],
      mentalStrengths: dosha.primaryDosha.includes("Vata")
        ? ["Creativity", "Intuition", "Rapid thinking"]
        : dosha.primaryDosha.includes("Pitta")
        ? ["Focus", "Analytical precision", "Leadership"]
        : ["Patience", "Loyalty", "Long-term memory"],
      mentalVulnerabilities: dosha.primaryDosha.includes("Vata")
        ? ["Anxiety", "Overwhelm", "Scattered focus"]
        : dosha.primaryDosha.includes("Pitta")
        ? ["Irritability", "Perfectionism", "Judgment"]
        : ["Attachment", "Resistance to change", "Depression"],
      digestiveNotes: dosha.primaryDosha.includes("Vata")
        ? "Variable agni — irregular hunger, gas, bloating. Regular warm meals essential."
        : dosha.primaryDosha.includes("Pitta")
        ? "Sharp agni — strong hunger, acid tendency. Avoid skipping meals."
        : "Slow agni — low hunger, mucus tendency. Lighter warm meals best.",
      immuneNotes: dosha.primaryDosha.includes("Kapha")
        ? "Strong but slow immune response; prone to mucus congestion and lingering illness."
        : dosha.primaryDosha.includes("Pitta")
        ? "Strong immune response; tends toward inflammatory conditions."
        : "Variable immunity; susceptible to nervous system depletion.",
    },
    seasonalGuidance: {
      spring: "Detox season — emphasize bitter greens, light soups, reduce Kapha-aggravating heavy foods",
      summer: "Cooling focus — increase cooling foods, reduce spicy, hydrate with hibiscus water",
      autumn: "Grounding season — warm soups, oil massage, reduce raw cold foods, add warming spices",
      winter: "Nourishing season — tonifying foods, sesame oil, warming spices, hearty legume soups",
      kiremt: "Ethiopian rainy season (June–September) — dampness and cold increase. Emphasize warming spices (ginger, cinnamon), avoid cold raw foods, support immune system.",
      bega: "Ethiopian dry season (October–February) — dryness and wind increase. Increase oil massage, warming soups, stay hydrated, reduce cooling foods.",
    },
    dietaryProtocol: {
      favored: dosha.primaryDosha.includes("Vata")
        ? ["Warm soups", "Fermented teff injera", "Cooked lentils", "Root vegetables", "Warm sesame tea"]
        : dosha.primaryDosha.includes("Pitta")
        ? ["Cooling salads (when not fasting)", "Cucumber", "Coconut", "Ayib", "Lightly spiced dishes"]
        : ["Light soups", "Spiced lentils", "Ginger-heavy dishes", "Millet", "Raw honey"],
      reduce: dosha.primaryDosha.includes("Vata")
        ? ["Raw vegetables", "Dry crackers", "Cold drinks", "Excessive travel", "Late meals"]
        : dosha.primaryDosha.includes("Pitta")
        ? ["Berbere overload", "Hot chili", "Alcohol", "Fried foods", "Midday sun exposure"]
        : ["Heavy dairy", "Excess injera portions", "Cold beverages", "Naps after meals", "Processed sugar"],
      avoid: dosha.primaryDosha.includes("Vata")
        ? ["Very dry foods", "Ice water", "Skipping meals"]
        : dosha.primaryDosha.includes("Pitta")
        ? ["Excess mitmita", "Fried kitfo", "Caffeinated excess"]
        : ["Ice cream", "Excess enset-based meals", "Sedentary post-meal periods"],
      cookingMethods: ["Steam", "Pressure cook", "Slow cook", "Ferment"],
      spicesToEmphasize: dosha.primaryDosha.includes("Vata")
        ? ["Ginger", "Cumin", "Fenugreek", "Cinnamon"]
        : dosha.primaryDosha.includes("Pitta")
        ? ["Coriander", "Fennel", "Cardamom", "Mint"]
        : ["Black pepper", "Ginger", "Turmeric", "Mustard seed"],
      spicesToMinimize: dosha.primaryDosha.includes("Pitta")
        ? ["Excess berbere", "Mitmita", "Cayenne"]
        : ["Excess salt", "Very sour ferments"],
    },
    lifestyleProtocol: {
      wakeUpTime: dosha.primaryDosha.includes("Kapha") ? "Before 6 AM (rise with sun)" : "6–7 AM",
      exerciseType: dosha.primaryDosha.includes("Vata")
        ? "Gentle yoga, walking, swimming"
        : dosha.primaryDosha.includes("Pitta")
        ? "Moderate hiking, swimming, team sports"
        : "Vigorous cardio, running, cycling",
      exerciseIntensity: dosha.primaryDosha.includes("Vata") ? "Low to moderate" : dosha.primaryDosha.includes("Pitta") ? "Moderate" : "High",
      meditationStyle: dosha.primaryDosha.includes("Vata")
        ? "Grounding meditation, body scan, breath focus"
        : dosha.primaryDosha.includes("Pitta")
        ? "Loving-kindness, cooling visualization"
        : "Invigorating breath work, dynamic movement meditation",
      sleepSchedule: "10 PM – 6 AM (align with solar cycles)",
      oilMassageFrequency: dosha.primaryDosha.includes("Vata") ? "Daily sesame oil massage" : "2–3x weekly",
      herbalTeas: dosha.primaryDosha.includes("Vata")
        ? ["Ginger-licorice", "Ashwagandha milk", "Fenugreek tea"]
        : dosha.primaryDosha.includes("Pitta")
        ? ["Hibiscus", "Peppermint", "Coriander seed tea"]
        : ["Ginger-cinnamon", "Green tea", "Tulsi"],
    },
    ayurvedicHerbsForBalance: dosha.primaryDosha.includes("Vata")
      ? [
          { herb: "Ashwagandha", sanskritName: "Withania somnifera", ethiopianEquivalent: "Endod (related)", purpose: "Nervous system tonic, adaptogen", dosage: "300mg extract 2x daily", caution: "Avoid in hyperthyroidism" },
          { herb: "Shatavari", sanskritName: "Asparagus racemosus", ethiopianEquivalent: undefined, purpose: "Hormonal balance, Yin tonic", dosage: "1–2g powder daily", caution: "Avoid in estrogen-sensitive conditions" },
        ]
      : dosha.primaryDosha.includes("Pitta")
      ? [
          { herb: "Amla", sanskritName: "Phyllanthus emblica", ethiopianEquivalent: "Nug (partial)", purpose: "Pitta cooling, vitamin C, liver support", dosage: "1–2g powder daily", caution: "May thin blood at high doses" },
          { herb: "Brahmi", sanskritName: "Bacopa monnieri", ethiopianEquivalent: undefined, purpose: "Mental cooling, clarity, memory", dosage: "300mg extract daily", caution: "May cause GI upset" },
        ]
      : [
          { herb: "Triphala", sanskritName: "Three fruits blend", ethiopianEquivalent: undefined, purpose: "Digestive cleansing, bowel regularity", dosage: "1g powder at night", caution: "Avoid in severe diarrhea" },
          { herb: "Guggul", sanskritName: "Commiphora mukul", ethiopianEquivalent: "Mayabeles (related resin)", purpose: "Metabolism support, cholesterol balance", dosage: "As directed by practitioner", caution: "Avoid in pregnancy" },
        ],
  };
}
