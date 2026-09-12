/**
 * TCM Visual Diagnosis Engine
 * Inspired by Huazhen TCM - AI Tongue & Pulse Diagnosis
 * Educational tool only - not a medical diagnosis system
 */

import {
  TongueColor,
  TongueCoating,
  TongueShape,
  TongueMoisture,
  TongueDiagnosisResult,
  PulseQuality,
  PulseDiagnosisResult,
  PulseReading,
} from "./healthTypes";

// TCM Pattern matrices mapped to Ethiopian humoral equivalents
const TONGUE_PATTERN_MATRIX: Record<
  string,
  Omit<TongueDiagnosisResult, "color" | "coating" | "shape" | "moisture">
> = {
  "pale-thin_white-normal-moist": {
    tcmPattern: "Blood & Qi Deficiency",
    ethiopianHumoralCorrelation: "May (Water) & Nifas (Air) deficiency — depleted life-force",
    organSystems: ["Heart", "Spleen-Pancreas", "Blood"],
    clinicalSignificance:
      "Classic signs of nutritional anemia, low energy reserves, and poor blood-building. Common in vegetarian fasting populations with inadequate iron and B12.",
    dietaryRecommendations: [
      "Increase iron-rich injera (fermented teff) daily",
      "Add lentil-based misir wat with lemon juice for vitamin C enhancement",
      "Include small portions of eggs (if not fasting) for B12",
      "Bone broth (ye'atm maret) on non-fasting days",
      "Avoid tea and coffee around mealtimes to improve iron absorption",
    ],
    herbalRecommendations: [
      { herb: "Moringa (Shiferaw)", ethiopianName: "ሽፈራው", action: "Rich in iron, folate, and B vitamins — blood builder" },
      { herb: "Fenugreek (Abish)", ethiopianName: "አቢሽ", action: "Supports blood sugar and strengthens Spleen Qi" },
      { herb: "Nigella sativa (Tikur Azmud)", ethiopianName: "ጥቁር አዝሙድ", action: "Tones immune system and blood quality" },
    ],
    urgencyFlag: "monitor",
    disclaimer: "This is a reflective wellness tool, not a clinical blood test. Pale tongue with fatigue warrants medical evaluation for anemia.",
  },
  "red-thin_yellow-normal-dry": {
    tcmPattern: "Yin Deficiency with Heat",
    ethiopianHumoralCorrelation: "Esat (Fire) excess — overactive metabolic fire",
    organSystems: ["Kidney", "Heart", "Liver"],
    clinicalSignificance:
      "Indicates internal dryness and heat, often from chronic overwork, stress, or insufficient hydration. Common during dry Bega season or prolonged intense fasting.",
    dietaryRecommendations: [
      "Increase cooling foods: cucumber, watermelon, yogurt (iru-be on non-fasting days)",
      "Reduce hot spicy berbere during active phase",
      "Drink herbal teas: chamomile, hibiscus (karkade) chilled",
      "Increase water intake — at least 2.5L daily",
      "Favor ayib (Ethiopian cottage cheese) for cooling protein",
    ],
    herbalRecommendations: [
      { herb: "Hibiscus (Karkade)", ethiopianName: "ካርካዴ", action: "Cooling, reduces internal heat, supports kidney Yin" },
      { herb: "Aloe Vera", ethiopianName: "ቀርከሃ / አሎቬ", action: "Nourishes Yin fluids, soothes inflammation" },
      { herb: "Shatavari (Ayurvedic import)", ethiopianName: "N/A", action: "Classic Yin tonic for dryness and hormonal balance" },
    ],
    urgencyFlag: "monitor",
    disclaimer: "Persistent red dry tongue with night sweats warrants a medical consultation.",
  },
  "pale-thick_white-swollen-wet": {
    tcmPattern: "Dampness-Phlegm Accumulation",
    ethiopianHumoralCorrelation: "May (Water) excess — poor fluid metabolism",
    organSystems: ["Spleen", "Stomach", "Lung"],
    clinicalSignificance:
      "Suggests sluggish digestion, bloating, mucus build-up, and weight management challenges. Associated with excessive refined carbohydrates or cold/raw foods.",
    dietaryRecommendations: [
      "Reduce injera quantity — shift to smaller portions with more variety",
      "Prioritize dry-cooked wots over heavy stews",
      "Add ginger and turmeric (ird) liberally to meals",
      "Reduce dairy and cold beverages",
      "Eat main meal at midday aligned with Habesha metabolic window",
    ],
    herbalRecommendations: [
      { herb: "Ginger (Zinjibil)", ethiopianName: "ዝንጅብል", action: "Dries dampness, strengthens Spleen Yang, improves digestion" },
      { herb: "Turmeric (Ird)", ethiopianName: "ኢርድ", action: "Anti-inflammatory, liver support, damp-clearing" },
      { herb: "Cinnamon (Qerfa)", ethiopianName: "ቀርፋ", action: "Warms Spleen, regulates blood sugar, clears phlegm" },
    ],
    urgencyFlag: "normal",
    disclaimer: "Persistent thick white coating with digestive discomfort warrants clinical evaluation for H. pylori or candida overgrowth.",
  },
  "purple-none-cracked-dry": {
    tcmPattern: "Blood Stasis with Yin Deficiency",
    ethiopianHumoralCorrelation: "Esat (Fire) & Afere (Earth) stagnation — circulation blockage",
    organSystems: ["Liver", "Heart", "Blood vessels"],
    clinicalSignificance:
      "Indicates poor circulation, chronic pain, hormonal irregularities, or long-term stress patterns. Cracks suggest longstanding nutrient depletion.",
    dietaryRecommendations: [
      "Increase circulation-supporting turmeric golden milk",
      "Add omega-3 sources: flaxseed (telba), chia if available",
      "Emphasize antioxidant-rich foods: blueberries, beets if available",
      "Reduce processed foods and excess alcohol",
      "Consider adding omega-3 rich fish on non-fasting days if acceptable",
    ],
    herbalRecommendations: [
      { herb: "Turmeric (Ird)", ethiopianName: "ኢርድ", action: "Breaks blood stasis, anti-inflammatory, liver support" },
      { herb: "Flaxseed (Telba)", ethiopianName: "ተልባ", action: "Omega-3 for cardiovascular and hormone balance" },
      { herb: "Hawthorn berry", ethiopianName: "N/A (import)", action: "Classic heart and circulation tonic" },
    ],
    urgencyFlag: "consult",
    disclaimer: "Purple tongue with chest discomfort or severe pain warrants immediate medical evaluation.",
  },
};

const DEFAULT_TONGUE_RESULT: Omit<TongueDiagnosisResult, "color" | "coating" | "shape" | "moisture"> = {
  tcmPattern: "Balanced — Minor Monitoring",
  ethiopianHumoralCorrelation: "Relatively balanced humoral state",
  organSystems: ["General wellness"],
  clinicalSignificance:
    "Your tongue presentation suggests a relatively balanced state. Continue your current wellness practices and monitor for changes.",
  dietaryRecommendations: [
    "Maintain varied, seasonal Ethiopian diet",
    "Continue traditional fermented foods (injera, ayib, tej)",
    "Stay hydrated and aligned with seasonal rhythms",
  ],
  herbalRecommendations: [
    { herb: "Moringa (Shiferaw)", ethiopianName: "ሽፈራው", action: "General tonic and nutritional support" },
    { herb: "Ginger (Zinjibil)", ethiopianName: "ዝንጅብል", action: "Digestive maintenance and immunity" },
  ],
  urgencyFlag: "normal",
  disclaimer: "This is a wellness reflection tool, not a medical diagnosis.",
};

export function analyzeTongue(
  color: TongueColor,
  coating: TongueCoating,
  shape: TongueShape,
  moisture: TongueMoisture
): TongueDiagnosisResult {
  const key = `${color}-${coating}-${shape}-${moisture}`;
  const pattern = TONGUE_PATTERN_MATRIX[key] || DEFAULT_TONGUE_RESULT;

  return {
    color,
    coating,
    shape,
    moisture,
    ...pattern,
  };
}

// Simplified pulse analysis based on self-reported qualities
const PULSE_PATTERNS: Record<
  string,
  { tcmConstitution: string; ethiopianHumoralBalance: string; dominantImbalance: string; therapeuticPrinciple: string }
> = {
  floating: {
    tcmConstitution: "Exterior Condition",
    ethiopianHumoralBalance: "Nifas (Air) rising to surface",
    dominantImbalance: "External pathogen invasion or Qi deficiency",
    therapeuticPrinciple: "Release the exterior, strengthen Wei Qi (defensive energy)",
  },
  sinking: {
    tcmConstitution: "Interior Condition",
    ethiopianHumoralBalance: "Esat (Fire) or Afere (Earth) deep imbalance",
    dominantImbalance: "Interior cold, Kidney deficiency, or chronic condition",
    therapeuticPrinciple: "Warm the interior, tonify Kidney Yang",
  },
  rapid: {
    tcmConstitution: "Heat Pattern",
    ethiopianHumoralBalance: "Esat (Fire) excess",
    dominantImbalance: "Fever, yin deficiency with heat, or inflammation",
    therapeuticPrinciple: "Clear heat, nourish Yin fluids",
  },
  slow: {
    tcmConstitution: "Cold Pattern",
    ethiopianHumoralBalance: "Afere (Earth) coldness",
    dominantImbalance: "Yang deficiency, internal cold, or low metabolism",
    therapeuticPrinciple: "Warm Yang, tonify Spleen and Kidney",
  },
  slippery: {
    tcmConstitution: "Phlegm-Dampness",
    ethiopianHumoralBalance: "May (Water) excess",
    dominantImbalance: "Dampness, phlegm, pregnancy, or digestive sluggishness",
    therapeuticPrinciple: "Transform phlegm, strengthen Spleen, dry dampness",
  },
  wiry: {
    tcmConstitution: "Liver Qi Stagnation",
    ethiopianHumoralBalance: "Nifas (Air) stagnation in Liver channel",
    dominantImbalance: "Stress, emotional tension, Liver/Gallbladder imbalance",
    therapeuticPrinciple: "Move Liver Qi, soothe stress, calm Shen (spirit)",
  },
  weak: {
    tcmConstitution: "Qi & Blood Deficiency",
    ethiopianHumoralBalance: "May (Water) & Nifas (Air) depleted",
    dominantImbalance: "Chronic fatigue, anemia, constitutional weakness",
    therapeuticPrinciple: "Tonify Qi and Blood, nourish Heart and Spleen",
  },
};

function buildPulseReading(
  position: "cun" | "guan" | "chi",
  qualities: PulseQuality[],
  side: "left" | "right"
): PulseReading {
  const organMap: Record<string, Record<"cun" | "guan" | "chi", { tcm: string; ethiopian: string }>> = {
    left: {
      cun: { tcm: "Heart / Small Intestine", ethiopian: "Center of life-force (Qalb)" },
      guan: { tcm: "Liver / Gallbladder", ethiopian: "Metabolic fire (Ye'enat Mebal)" },
      chi: { tcm: "Kidney Yin / Urinary Bladder", ethiopian: "Water essence (May Hiwot)" },
    },
    right: {
      cun: { tcm: "Lung / Large Intestine", ethiopian: "Breath life (Nifas)" },
      guan: { tcm: "Spleen-Pancreas / Stomach", ethiopian: "Earth digestion (Afere Metanet)" },
      chi: { tcm: "Kidney Yang / Pericardium", ethiopian: "Vital fire (Esat Hiwot)" },
    },
  };

  const organ = organMap[side][position];
  const primaryQuality = qualities[0] || "moderate";
  const depth = primaryQuality === "floating" ? "superficial" : primaryQuality === "sinking" ? "deep" : "middle";

  return {
    position,
    quality: qualities,
    depth,
    associatedOrgan: organ.tcm,
    ethiopianEquivalent: organ.ethiopian,
  };
}

export function analyzePulse(
  dominantQuality: PulseQuality,
  heartRateEstimate: number
): PulseDiagnosisResult {
  const pattern = PULSE_PATTERNS[dominantQuality] || {
    tcmConstitution: "Moderate — relatively balanced",
    ethiopianHumoralBalance: "Humors in relative equilibrium",
    dominantImbalance: "Minor fluctuations only",
    therapeuticPrinciple: "Maintain current wellness practices",
  };

  const makeReading = (pos: "cun" | "guan" | "chi", side: "left" | "right"): PulseReading =>
    buildPulseReading(pos, [dominantQuality], side);

  return {
    leftWrist: {
      cun: makeReading("cun", "left"),
      guan: makeReading("guan", "left"),
      chi: makeReading("chi", "left"),
    },
    rightWrist: {
      cun: makeReading("cun", "right"),
      guan: makeReading("guan", "right"),
      chi: makeReading("chi", "right"),
    },
    overallHrEstimate: heartRateEstimate,
    ...pattern,
    disclaimer:
      "This pulse reflection is based on self-reported qualities and should not replace clinical assessment by a trained practitioner.",
  };
}
