import { HumoralElement } from "./awdeNegestZodiac";

export type ConstitutionAnswerKey =
  | "energy"
  | "digestion"
  | "stress"
  | "sleep"
  | "temperature"
  | "activity";

export type TcmConstitutionType =
  | "balanced"
  | "qi_deficient"
  | "yang_deficient"
  | "yin_deficient"
  | "phlegm_damp"
  | "damp_heat"
  | "qi_stagnation"
  | "blood_stasis"
  | "special_diathesis";

/** Compatibility name for consumers that do not need to distinguish the TCM layer. */
export type ConstitutionType = TcmConstitutionType;

export type Dosha = "vata" | "pitta" | "kapha";

export interface ConstitutionAnswers {
  energy: number;
  digestion: number;
  stress: number;
  sleep: number;
  temperature: number;
  activity: number;
}

export interface ConstitutionAssessment {
  tcmType: TcmConstitutionType;
  tcmLabel: string;
  dosha: Dosha;
  doshaLabel: string;
  humoralElement: HumoralElement;
  humoralLabel: string;
  fiveElementFocus: string;
  scores: ConstitutionAnswers;
  reflectiveGuidance: string[];
  disclaimer: string;
}

const TCM_LABELS: Record<TcmConstitutionType, string> = {
  balanced: "Balanced constitution",
  qi_deficient: "Qi-deficient tendency",
  yang_deficient: "Yang-deficient tendency",
  yin_deficient: "Yin-deficient tendency",
  phlegm_damp: "Phlegm-damp tendency",
  damp_heat: "Damp-heat tendency",
  qi_stagnation: "Qi-stagnation tendency",
  blood_stasis: "Blood-stasis tendency",
  special_diathesis: "Sensitive or special tendency",
};

const GUIDANCE: Record<TcmConstitutionType, string[]> = {
  balanced: ["Keep meals regular and varied.", "Protect sleep and preserve the routines that already support you."],
  qi_deficient: ["Favor regular meals and gentle, consistent movement.", "Build recovery time into demanding days."],
  yang_deficient: ["Favor warm meals and gradual activity rather than abrupt exertion.", "Track whether cold exposure changes comfort or energy."],
  yin_deficient: ["Prioritize hydration, rest, and a calmer evening rhythm.", "Avoid treating persistent dryness or sleep issues with self-prescribed herbs."],
  phlegm_damp: ["Use smaller regular meals and light movement after eating.", "Notice how highly processed or very rich meals affect energy."],
  damp_heat: ["Favor simple meals, hydration, and cooling breaks from heat.", "Seek professional advice for persistent digestive or inflammatory symptoms."],
  qi_stagnation: ["Use predictable movement and brief breathing pauses to reset attention.", "Create space for emotional processing rather than skipping meals or rest."],
  blood_stasis: ["Break up long periods of sitting with comfortable movement.", "Discuss persistent pain, swelling, or circulation changes with a Debrian."],
  special_diathesis: ["Record patterns around food, environment, and stress without assuming a diagnosis.", "Review recurring or severe reactions with a qualified Welbeingcare professional."],
};

function clampScore(value: number) {
  return Math.max(0, Math.min(3, Math.round(Number.isFinite(value) ? value : 0)));
}

export function assessConstitution(input: Partial<ConstitutionAnswers>): ConstitutionAssessment {
  const scores: ConstitutionAnswers = {
    energy: clampScore(input.energy ?? 0),
    digestion: clampScore(input.digestion ?? 0),
    stress: clampScore(input.stress ?? 0),
    sleep: clampScore(input.sleep ?? 0),
    temperature: clampScore(input.temperature ?? 0),
    activity: clampScore(input.activity ?? 0),
  };

  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const average = total / 6;
  let tcmType: TcmConstitutionType = "balanced";

  if (scores.stress >= 3 && scores.sleep >= 2) tcmType = "qi_stagnation";
  else if (scores.temperature >= 3 && scores.digestion >= 2) tcmType = "yang_deficient";
  else if (scores.temperature <= 1 && scores.sleep >= 2) tcmType = "yin_deficient";
  else if (scores.digestion >= 3 && scores.activity >= 2) tcmType = "phlegm_damp";
  else if (scores.digestion >= 3 && scores.temperature <= 1) tcmType = "damp_heat";
  else if (scores.energy >= 3 && scores.activity >= 2) tcmType = "qi_deficient";
  else if (scores.stress >= 3 && scores.activity >= 2) tcmType = "blood_stasis";
  else if (scores.stress >= 2 || scores.temperature >= 2) tcmType = "special_diathesis";
  else if (average < 1) tcmType = "balanced";

  const dosha: Dosha =
    scores.stress + scores.sleep >= scores.digestion + scores.temperature + 2
      ? "vata"
      : scores.digestion + scores.temperature >= scores.energy + scores.sleep + 2
        ? "pitta"
        : "kapha";

  const humoralElement: HumoralElement =
    scores.temperature >= 2
      ? "esat"
      : scores.stress >= 2
        ? "nifas"
        : scores.digestion >= 2
          ? "may"
          : "afere";

  const fiveElementFocus =
    scores.digestion >= 2 ? "Earth / grounding" : scores.stress >= 2 ? "Wood / movement" : scores.energy >= 2 ? "Fire / vitality" : "Water / restoration";

  return {
    tcmType,
    tcmLabel: TCM_LABELS[tcmType],
    dosha,
    doshaLabel: `${dosha.charAt(0).toUpperCase()}${dosha.slice(1)} tendency`,
    humoralElement,
    humoralLabel: humoralElement === "esat" ? "Fire / Choleric" : humoralElement === "nifas" ? "Air / Sanguine" : humoralElement === "may" ? "Water / Phlegmatic" : "Earth / Melancholic",
    fiveElementFocus,
    scores,
    reflectiveGuidance: GUIDANCE[tcmType],
    disclaimer: "Self-reflection only. These traditional frameworks are not medical diagnoses and should not guide medication or treatment decisions.",
  };
}
