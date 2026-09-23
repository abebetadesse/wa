import { DiagnosticUrgencyLevel } from "../types";
import { ExtractedEntity } from "./entityExtractor";

export interface UrgencyDetectionResult {
  level: DiagnosticUrgencyLevel;
  score: number;
  action: string;
  recommendation: string;
  matchedSignals: string[];
}

export class UrgencyDetector {
  private criticalSignals = [
    "chest pain", "heart attack", "stroke", "paralysis", "cannot breathe", "gasping",
    "unconscious", "unresponsive", "fainting", "syncope", "heavy bleeding", "vomiting blood",
    "coughing blood", "anaphylaxis", "choking", "seizure", "convulsions", "sudden loss of vision",
    "የደረት ህመም", "መተንፈስ አልቻልኩም", "ራሱን ሳተ", "ደም ማስመለስ", "መንቀጥቀጥ",
  ];

  private highSignals = [
    "severe pain", "excruciating", "high fever", "rigors", "stiff neck", "photophobia",
    "yellow eyes", "dark urine", "persistent vomiting", "unable to keep fluids",
    "allergic reaction", "swollen lips", "difficulty swallowing", "black stool", "melena",
    "ከባድ ህመም", "ከፍተኛ ትኩሳት", "አንገት መወጠር", "ቢጫ አይን",
  ];

  private mediumSignals = [
    "persistent", "worsening", "for weeks", "for months", "recurrent", "moderate pain",
    "chronic cough", "unexplained weight loss", "night sweats", "swollen glands",
    "ቀጣይ ህመም", "እየባሰ", "ክብደት መቀነስ",
  ];

  detect(text: string, entities: ExtractedEntity[]): UrgencyDetectionResult {
    const normalized = text.toLowerCase();
    const matchedSignals: string[] = [];

    // 1. Check Critical Signals
    let hasCritical = false;
    for (const signal of this.criticalSignals) {
      if (normalized.includes(signal)) {
        matchedSignals.push(`critical: ${signal}`);
        hasCritical = true;
      }
    }

    const criticalEntity = entities.some(
      (e) => e.category === "symptom" && (e.value === "chest_pain" || e.value === "breathing_difficulty" || e.value === "bleeding")
    );
    if (criticalEntity) {
      hasCritical = true;
      matchedSignals.push("critical symptom: respiratory/cardiovascular/hemorrhage");
    }

    if (hasCritical) {
      return {
        level: "critical",
        score: 100,
        action: "CALL 907 / 991 OR GO TO NEAREST EMERGENCY ROOM IMMEDIATELY",
        recommendation: "Your symptoms indicate a potential medical emergency requiring immediate in-person evaluation. Do not delay or attempt self-treatment.",
        matchedSignals,
      };
    }

    // 2. Check High Urgency Signals
    let hasHigh = false;
    for (const signal of this.highSignals) {
      if (normalized.includes(signal)) {
        matchedSignals.push(`high: ${signal}`);
        hasHigh = true;
      }
    }

    const highEntity = entities.some(
      (e) => (e.category === "severity" && (e.value === "severe" || e.value === "critical")) ||
        (e.category === "symptom" && (e.value === "jaundice" || (e.value === "fever" && normalized.includes("days"))))
    );
    if (highEntity) {
      hasHigh = true;
      matchedSignals.push("high-urgency scientific indicator");
    }

    if (hasHigh) {
      return {
        level: "high",
        score: 80,
        action: "SEEK IN-PERSON MEDICAL EVALUATION WITHIN 24 HOURS",
        recommendation: "Your symptoms warrant prompt professional healthcare review today to prevent acute complications.",
        matchedSignals,
      };
    }

    // 3. Check Medium Urgency Signals
    let hasMedium = false;
    for (const signal of this.mediumSignals) {
      if (normalized.includes(signal)) {
        matchedSignals.push(`medium: ${signal}`);
        hasMedium = true;
      }
    }

    const durationEntity = entities.find((e) => e.category === "duration");
    if (durationEntity && (durationEntity.value.includes("week") || durationEntity.value.includes("month") || durationEntity.value.includes("ሳምንት") || durationEntity.value.includes("ወር"))) {
      hasMedium = true;
      matchedSignals.push(`chronic duration: ${durationEntity.value}`);
    }

    if (hasMedium) {
      return {
        level: "medium",
        score: 50,
        action: "SCHEDULE wellbeingCARE CONSULTATION WITHIN 1 WEEK",
        recommendation: "Schedule an appointment with a general physician or community health center for diagnostic baseline testing.",
        matchedSignals,
      };
    }

    // 4. Low / Routine Urgency
    return {
      level: "low",
      score: 20,
      action: "MONITOR SYMPTOMS & APPLY NUTRITIONAL / LIFESTYLE GUIDANCE",
      recommendation: "Monitor your symptoms, utilize the personalized dietary and traditional wellness advice below, and seek care if symptoms persist or intensify.",
      matchedSignals: ["routine presentation"],
    };
  }
}
