/**
 * Urgency screening of free-text client descriptions (English and Amharic). DOMAIN A.
 * The signs live in the shared screen, src/server/safety/urgency.ts; this adds healer-facing advice.
 * It does not name conditions and returns a 0–100 score used to route (never to reassure).
 */

import { levelFor, screenText, type UrgencyLevel } from "@/server/safety/urgency";

export type { UrgencyLevel };
export { levelFor };

export interface UrgencyAssessment {
  score: number;
  level: UrgencyLevel;
  signs: { id: string; label: string; score: number }[];
  advice: string;
}

const ADVICE: Record<UrgencyLevel, string> = {
  emergency: "Danger signs are described. The person should go to the nearest hospital or health centre now. Traditional care can follow once they are safe.",
  urgent: "Signs are described that need a clinician soon, ideally within a day. Traditional care should not delay this.",
  soon: "Symptoms have lasted a while or are worsening; suggest a clinic check alongside traditional care.",
  routine: "No danger signs were found in the description. This does not rule them out; ask directly when you meet.",
};

/** Thin adapter over the shared screen (src/server/safety/urgency.ts), adding advice for the healer. */
export function assessUrgency(text: string, context: { age?: number | null; pregnant?: boolean } = {}): UrgencyAssessment {
  const { score, level, signs } = screenText(text, context);
  return { score, level, signs, advice: ADVICE[level] };
}
