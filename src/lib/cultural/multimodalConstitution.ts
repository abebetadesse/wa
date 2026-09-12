import { assessConstitution, ConstitutionAnswers, ConstitutionAssessment } from "./constitutionAssessment";

export type PulseQuality = "not-collected" | "floating" | "deep" | "slow" | "rapid" | "slippery" | "rough";
export type TongueColor = "not-collected" | "pale" | "pink" | "red" | "purple";
export type TongueCoating = "not-collected" | "thin-white" | "thick-white" | "yellow" | "patchy" | "none";
export type TongueShape = "not-collected" | "normal" | "swollen" | "thin" | "toothed" | "cracked";

export interface MultimodalInput {
  constitution: Partial<ConstitutionAnswers>;
  pulse: { quality: PulseQuality; recordedAt?: string };
  tongue: { color: TongueColor; coating: TongueCoating; shape: TongueShape; recordedAt?: string };
  vitals: { heartRate?: number; bloodOxygen?: number; sleepHours?: number; recordedAt?: string };
}

export interface MultimodalAssessment {
  constitution: ConstitutionAssessment;
  modalityCoverage: { manualPattern: boolean; tongueObservation: boolean; wearableVitals: boolean };
  observations: Array<{ modality: "pulse" | "tongue" | "vitals"; finding: string; source: string }>;
  wellnessSignals: string[];
  safetyFlags: string[];
  recommendations: Array<{ category: "food" | "rhythm" | "movement" | "reflection"; title: string; detail: string; rationale: string }>;
  disclaimer: string;
}

function validNumber(value: number | undefined) { return typeof value === "number" && Number.isFinite(value); }
function bounded(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }

export function assessMultimodalConstitution(input: MultimodalInput): MultimodalAssessment {
  const observations: MultimodalAssessment["observations"] = [];
  const safetyFlags: string[] = [];
  const constitutionScores: ConstitutionAnswers = {
    energy: bounded(Number(input.constitution.energy ?? 0), 0, 3),
    digestion: bounded(Number(input.constitution.digestion ?? 0), 0, 3),
    stress: bounded(Number(input.constitution.stress ?? 0), 0, 3),
    sleep: bounded(Number(input.constitution.sleep ?? 0), 0, 3),
    temperature: bounded(Number(input.constitution.temperature ?? 0), 0, 3),
    activity: bounded(Number(input.constitution.activity ?? 0), 0, 3),
  };

  if (input.pulse.quality !== "not-collected") {
    const pulseMap: Record<PulseQuality, keyof ConstitutionAnswers> = { floating: "stress", deep: "energy", slow: "temperature", rapid: "stress", slippery: "digestion", rough: "activity", "not-collected": "energy" };
    const key = pulseMap[input.pulse.quality];
    constitutionScores[key] = bounded(constitutionScores[key] + 1, 0, 3);
    observations.push({ modality: "pulse", finding: `${input.pulse.quality} pulse pattern recorded for reflection`, source: "Manual user observation" });
  }

  if (input.tongue.color !== "not-collected" || input.tongue.coating !== "not-collected" || input.tongue.shape !== "not-collected") {
    if (input.tongue.color === "pale") constitutionScores.energy = bounded(constitutionScores.energy + 1, 0, 3);
    if (input.tongue.coating === "thick-white" || input.tongue.shape === "swollen") constitutionScores.digestion = bounded(constitutionScores.digestion + 1, 0, 3);
    if (input.tongue.color === "red" || input.tongue.coating === "yellow") constitutionScores.temperature = bounded(constitutionScores.temperature + 1, 0, 3);
    if (input.tongue.shape === "cracked") constitutionScores.sleep = bounded(constitutionScores.sleep + 1, 0, 3);
    observations.push({ modality: "tongue", finding: `Tongue observation recorded: ${input.tongue.color}, ${input.tongue.coating}, ${input.tongue.shape}`, source: "Manual camera-assisted observation" });
  }

  const heartRate = input.vitals.heartRate;
  const bloodOxygen = input.vitals.bloodOxygen;
  const sleepHours = input.vitals.sleepHours;
  if (typeof heartRate === "number" && Number.isFinite(heartRate)) {
    observations.push({ modality: "vitals", finding: `Heart rate ${heartRate} bpm`, source: "User-entered wearable reading" });
    if (heartRate < 45 || heartRate > 120) safetyFlags.push("Heart-rate reading is outside a typical resting range; repeat the measurement and seek professional advice if persistent or symptomatic.");
  }
  if (typeof bloodOxygen === "number" && Number.isFinite(bloodOxygen)) {
    observations.push({ modality: "vitals", finding: `Blood oxygen ${bloodOxygen}%`, source: "User-entered wearable reading" });
    if (bloodOxygen < 92) safetyFlags.push("Blood-oxygen reading is low; repeat with a properly fitted device and seek urgent medical advice if it remains low or breathing is difficult.");
  }
  if (typeof sleepHours === "number" && Number.isFinite(sleepHours)) {
    observations.push({ modality: "vitals", finding: `Sleep duration ${sleepHours} hours`, source: "User-entered wearable reading" });
    if (sleepHours < 5) constitutionScores.sleep = bounded(constitutionScores.sleep + 1, 0, 3);
  }

  const constitution = assessConstitution(constitutionScores);
  const signals = [constitution.tcmLabel, constitution.doshaLabel, constitution.humoralLabel, constitution.fiveElementFocus];
  const recommendations: MultimodalAssessment["recommendations"] = [
    { category: "food", title: "Use fermented Ethiopian staples", detail: "Consider fermented teff injera, lentils, Gomen, and Kocho as part of a varied eating pattern.", rationale: "Supports the platform's existing Ethiopian fermentation and nutrient context." },
    { category: "rhythm", title: "Protect a steady evening rhythm", detail: "Keep a consistent wake time and create a low-stimulation wind-down period.", rationale: "Your self-reported sleep, stress, and wearable context contribute to this reflection." },
    { category: "movement", title: "Choose gentle, repeatable movement", detail: "Try a short walk or comfortable mobility session and stop if symptoms worsen.", rationale: "Builds continuity without treating the constitution label as a diagnosis." },
    { category: "reflection", title: "Review the pattern over time", detail: "Repeat observations under similar conditions and compare trends instead of overinterpreting one reading.", rationale: "Single pulse, tongue, or wearable readings are noisy and context-dependent." },
  ];

  return {
    constitution,
    modalityCoverage: {
      manualPattern: Object.values(input.constitution).some((value) => Number(value) > 0),
      tongueObservation: input.tongue.color !== "not-collected" || input.tongue.coating !== "not-collected" || input.tongue.shape !== "not-collected",
      wearableVitals: Object.values(input.vitals).some((value) => validNumber(value as number | undefined)),
    },
    observations,
    wellnessSignals: signals,
    safetyFlags,
    recommendations,
    disclaimer: "This is a reflective wellness assessment, not medical diagnosis, pulse diagnosis, tongue diagnosis, or treatment. Wearables and camera observations are not medical-device evidence. Do not change medication or delay urgent care based on this result.",
  };
}
