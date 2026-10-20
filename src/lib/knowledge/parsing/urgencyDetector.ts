import { DiagnosticUrgencyLevel } from "../types";
import { ExtractedEntity } from "./entityExtractor";
import { EMERGENCY_GUIDANCE } from "@/lib/safety/emergencyContacts";
import { screenText, type UrgencyLevel } from "@/server/safety/urgency";

export interface UrgencyDetectionResult {
  level: DiagnosticUrgencyLevel;
  score: number;
  action: string;
  recommendation: string;
  matchedSignals: string[];
}

const TIER: Record<UrgencyLevel, Omit<UrgencyDetectionResult, "matchedSignals">> = {
  emergency: {
    level: "critical",
    score: 100,
    action: `GET EMERGENCY HELP NOW: ${EMERGENCY_GUIDANCE}`,
    recommendation: "Your symptoms indicate a potential medical emergency requiring immediate in-person evaluation. Do not delay or attempt self-treatment.",
  },
  urgent: {
    level: "high",
    score: 80,
    action: "SEEK IN-PERSON MEDICAL EVALUATION WITHIN 24 HOURS",
    recommendation: "Your symptoms warrant prompt professional healthcare review today to prevent acute complications.",
  },
  soon: {
    level: "medium",
    score: 50,
    action: "SCHEDULE wellbeingCARE CONSULTATION WITHIN 1 WEEK",
    recommendation: "Schedule an appointment with a general physician or community health center for diagnostic baseline testing.",
  },
  routine: {
    level: "low",
    score: 20,
    action: "MONITOR SYMPTOMS & APPLY NUTRITIONAL / LIFESTYLE GUIDANCE",
    recommendation: "Monitor your symptoms, utilize the personalized dietary and traditional wellness advice below, and seek care if symptoms persist or intensify.",
  },
};

const RANK: UrgencyLevel[] = ["routine", "soon", "urgent", "emergency"];

/**
 * Diagnostic-portal urgency tiers. A thin adapter over the shared screen
 * (src/server/safety/urgency.ts); structured entities from the extractor can only raise the tier.
 */
export class UrgencyDetector {
  detect(text: string, entities: ExtractedEntity[]): UrgencyDetectionResult {
    const screen = screenText(text);
    let level = screen.level;
    const matchedSignals = screen.signs.map((sign) => `${TIER[screen.level].level}: ${sign.label}`);
    const raise = (to: UrgencyLevel, signal: string) => {
      if (RANK.indexOf(to) > RANK.indexOf(level)) level = to;
      matchedSignals.push(signal);
    };

    const normalized = text.toLowerCase();
    // Entities also cover Oromo, Tigrinya and Somali wording the shared screen does not read yet.
    if (entities.some((e) => e.category === "symptom" && e.value === "chest_pain")) raise("emergency", "critical symptom: chest pain");
    if (entities.some((e) => e.category === "symptom" && e.value === "breathing_difficulty")) raise("urgent", "high symptom: breathing difficulty");
    if (
      entities.some(
        (e) =>
          (e.category === "severity" && (e.value === "severe" || e.value === "critical")) ||
          (e.category === "symptom" && (e.value === "jaundice" || (e.value === "fever" && normalized.includes("days")))),
      )
    ) {
      raise("urgent", "high-urgency scientific indicator");
    }
    const duration = entities.find((e) => e.category === "duration");
    if (duration && /week|month|ሳምንት|ወር/.test(duration.value)) raise("soon", `chronic duration: ${duration.value}`);

    return { ...TIER[level], matchedSignals: matchedSignals.length ? matchedSignals : ["routine presentation"] };
  }
}
