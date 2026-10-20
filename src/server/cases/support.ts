/**
 * Crisis and referral support shared by every case domain.
 *
 * Emergency phone numbers are never written here: they come only from
 * src/lib/safety/emergencyContacts.ts (empty until a number is verified, plus the administrator's
 * verified list). Without a verified number the person is given generic guidance instead.
 */
import { emergencyStep, verifiedHotlines } from "@/lib/safety/emergencyContacts";
import { screenText, type CrisisKind } from "@/server/safety/urgency";
import type { Contact, SafetyOutcome } from "./types";

/** Services with no single verified number: shown as guidance, never as a number. */
export const REFERRALS = {
  amanuel: "Amanuel Mental Specialized Hospital, Addis Ababa (or the nearest hospital's mental health service)",
  healthCenter: "Your nearest health centre — ask for the social worker or counsellor",
  legalAid: "University legal aid clinics (e.g. Addis Ababa University, Haramaya University) and the Ethiopian Women Lawyers Association",
  socialServices: "Your kebele or woreda social affairs office",
  psnp: "Productive Safety Net Programme (PSNP) through your woreda office",
  elders: "A trusted elder, spiritual father (የንስሐ አባት), relative or friend",
} as const;

/** Verified emergency numbers only; empty while none are verified. */
export const emergencyHotlines: () => Contact[] = verifiedHotlines;

export function crisisOutcome(reason: string, extraSteps: string[] = [], kind: CrisisKind = "self_harm"): SafetyOutcome {
  const medical = kind === "medical";
  return {
    action: "crisis_route",
    priority: "urgent",
    reason,
    reasonCode: "crisis_route",
    confidence: 0.98,
    evidence: {
      sourceTypes: ["user self-report", "screening pattern"],
      freshnessLabel: "Immediate review required",
      notes: medical
        ? "Danger signs of a medical emergency were described, so a crisis pathway was triggered."
        : "High-risk safety language or direct risk indicators triggered a crisis pathway.",
    },
    support: medical
      ? {
        title: "Get medical help now",
        message: "What you describe may be a medical emergency. Please get help now. This information is free and always available.",
        hotlines: emergencyHotlines(),
        steps: [emergencyStep(), "Do not wait for an app report or online review.", ...extraSteps, "Ask someone to go with you if you can."],
        resources: [REFERRALS.healthCenter],
      }
      : {
        title: "Your safety comes first",
        message:
          "Please reach out for support now. This information is free and always available — no payment and no review are needed.",
        hotlines: emergencyHotlines(),
        steps: [`If you are in immediate danger: ${emergencyStep()}`, ...extraSteps, `Reach out to ${REFERRALS.elders}.`],
        resources: [REFERRALS.amanuel, REFERRALS.healthCenter],
      },
  };
}

/** Crisis outcome for a medical emergency (danger signs such as chest pain or not breathing). */
export const medicalCrisisOutcome = (reason = "Possible medical emergency described", extraSteps: string[] = []) => crisisOutcome(reason, extraSteps, "medical");

// Option codes such as "fainting_dizziness" are answers to choice questions, not free text.
const OPTION_CODE = /^[a-z0-9]+(_[a-z0-9]+)+$/;

/**
 * Scans every free-text answer with the shared screen (src/server/safety/urgency.ts). Self-harm,
 * violence and medical emergencies all route to crisis support.
 */
export function screenFreeText(answers: Record<string, unknown>): SafetyOutcome | null {
  const text = Object.values(answers)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === "string" && !OPTION_CODE.test(value.trim()))
    .join("\n");
  if (!text.trim()) return null;
  const { crisis } = screenText(text);
  if (crisis === "self_harm") return crisisOutcome("Self-harm language in answers");
  if (crisis === "violence") {
    return crisisOutcome("Violence or abuse language in answers", ["Move to a safer place if you can do so without increasing danger."], "violence");
  }
  if (crisis === "medical") return medicalCrisisOutcome("Medical emergency described in answers");
  return null;
}

export const proceed = (): SafetyOutcome => ({
  action: "proceed",
  priority: "routine",
  reasonCode: "proceed",
  confidence: 0.7,
  evidence: {
    sourceTypes: ["screening review"],
    freshnessLabel: "No elevated concern detected",
    notes: "No trigger points were identified in the current safety evaluation.",
  },
});

export const concern = (reason: string, priority: SafetyOutcome["priority"] = "routine", support?: SafetyOutcome["support"]): SafetyOutcome => ({
  action: "proceed_with_concern",
  priority,
  reason,
  reasonCode: "proceed_with_concern",
  confidence: priority === "urgent" ? 0.83 : priority === "high" ? 0.74 : 0.64,
  evidence: {
    sourceTypes: ["user response", "risk screening"],
    freshnessLabel: "Screening signal confirmed",
    notes: "User reported an elevated concern that requires attentive review and support planning.",
  },
  support,
});
