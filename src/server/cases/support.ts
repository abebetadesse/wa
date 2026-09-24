/**
 * Crisis and referral support shared by every case domain.
 *
 * VERIFY BEFORE RELEASE: these numbers are shown to people in crisis. Confirm each one with the
 * operating organisation and record the date in `verifiedOn`. Never add placeholder numbers:
 * describe the service instead (see `withoutNumber`).
 */
import type { Contact, SafetyOutcome } from "./types";

interface SupportContact extends Contact {
  verifiedOn: string | null;
}

export const CONTACTS = {
  police: { name: "Police emergency", number: "991", verifiedOn: null },
  ambulance: { name: "Ambulance (Ethiopian Red Cross)", number: "907", verifiedOn: null },
  fire: { name: "Fire emergency", number: "939", verifiedOn: null },
  crisisLine: { name: "Mental health and gender-based violence support line", number: "952", verifiedOn: null },
} satisfies Record<string, SupportContact>;

/** Services with no single verified number: shown as guidance, never as a fake number. */
export const REFERRALS = {
  amanuel: "Amanuel Mental Specialized Hospital, Addis Ababa (or the nearest hospital's mental health service)",
  healthCenter: "Your nearest health centre — ask for the social worker or counsellor",
  legalAid: "University legal aid clinics (e.g. Addis Ababa University, Haramaya University) and the Ethiopian Women Lawyers Association",
  socialServices: "Your kebele or woreda social affairs office",
  psnp: "Productive Safety Net Programme (PSNP) through your woreda office",
  elders: "A trusted elder, spiritual father (የንስሐ አባት), relative or friend",
} as const;

const contact = ({ name, number }: SupportContact): Contact => ({ name, number });

export const EMERGENCY_CONTACTS: Contact[] = [contact(CONTACTS.crisisLine), contact(CONTACTS.police), contact(CONTACTS.ambulance)];

export function crisisOutcome(reason: string, extraSteps: string[] = []): SafetyOutcome {
  return {
    action: "crisis_route",
    priority: "urgent",
    reason,
    reasonCode: "crisis_route",
    confidence: 0.98,
    evidence: {
      sourceTypes: ["user self-report", "screening pattern"],
      freshnessLabel: "Immediate review required",
      notes: "High-risk safety language or direct risk indicators triggered a crisis pathway.",
    },
    support: {
      title: "Your safety comes first",
      message:
        "Please reach out for support now. This information is free and always available — no payment and no review are needed.",
      hotlines: EMERGENCY_CONTACTS,
      steps: [
        `If you are in immediate danger, call ${CONTACTS.police.number} (police) or ${CONTACTS.ambulance.number} (ambulance).`,
        `Call ${CONTACTS.crisisLine.number} for confidential support.`,
        ...extraSteps,
        `Reach out to ${REFERRALS.elders}.`,
      ],
      resources: [REFERRALS.amanuel, REFERRALS.healthCenter],
    },
  };
}

const SELF_HARM = [
  "kill myself", "suicide", "suicidal", "end my life", "want to die", "hurt myself", "hang myself",
  "take my own life", "slit my", "self harm", "self-harm", "shoot myself", "no reason to live",
  "ራሴን ላጠፋ", "መሞት እፈልጋለሁ", "ራሴን ልገድል",
];
const VIOLENCE = [
  "domestic violence", "he beats me", "she beats me", "beats me", "physically abuse", "threatened to kill",
  "unsafe at home", "raped", "sexual abuse", "ይደበድበኛል",
];

/** Scans every free-text answer for self-harm or violence language. */
export function screenFreeText(answers: Record<string, unknown>): SafetyOutcome | null {
  const text = Object.values(answers)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
  if (!text) return null;
  if (SELF_HARM.some((phrase) => text.includes(phrase))) return crisisOutcome("Self-harm language in answers");
  if (VIOLENCE.some((phrase) => text.includes(phrase))) {
    return crisisOutcome("Violence or abuse language in answers", ["Move to a safer place if you can do so without increasing danger."]);
  }
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
