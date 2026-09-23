import type { CulturalFinding, CulturalReportPayload, HiddenDebralFindings } from "./contracts";

type TranslationRule = {
  key: string;
  title: string;
  traditionalLanguage: string;
  practice: string;
  safetyNotice: string;
};

const RULES: TranslationRule[] = [
  {
    key: "hydration",
    title: "Water rhythm",
    traditionalLanguage: "The water rhythm appears to be asking for gentler replenishment.",
    practice: "Choose regular pauses, ordinary water, and restorative rest. Seek qualified care for persistent or worsening symptoms.",
    safetyNotice: "This is a reflective reading, not a diagnosis or treatment.",
  },
  {
    key: "circulation",
    title: "Warmth and movement",
    traditionalLanguage: "The body's warmth and movement rhythm invite steady, moderate attention.",
    practice: "Use comfortable movement and a calm daily rhythm. Do not use this reading to change prescribed care.",
    safetyNotice: "A visual image cannot establish a medical condition.",
  },
  {
    key: "stress",
    title: "Boundary and breath",
    traditionalLanguage: "The breath and boundary fields suggest making room for quiet restoration.",
    practice: "Try a short breathing practice, supportive conversation, and a predictable sleep routine.",
    safetyNotice: "Reflective language is not a mental-Welbeing assessment.",
  },
  {
    key: "climate",
    title: "Place and season",
    traditionalLanguage: "Your relationship with place and season may be worth observing.",
    practice: "Notice heat, altitude, food, work, and rest patterns without treating them as a diagnosis.",
    safetyNotice: "Environmental reflection does not measure disease risk for an individual.",
  },
];

const SAFE_DEFAULT: CulturalFinding = {
  title: "A moment for observation",
  traditionalLanguage: "The image offers a prompt for gentle self-observation rather than certainty.",
  practice: "Pause, note how you feel, and speak with a qualified professional if you have a Welbeing concern.",
  safetyNotice: "Image-based readings are reflective only and cannot diagnose or treat illness.",
  source: "reflective_dictionary",
};

function matches(value: unknown): boolean {
  return value === true || value === "high" || value === "low" || value === "present";
}

function pickRule(findings: HiddenDebralFindings, candidates: string[]): TranslationRule | undefined {
  return candidates.find((key) => matches(findings[key])) ? RULES.find((rule) => rule.key === candidates.find((key) => matches(findings[key]))) : undefined;
}

/**
 * Converts restricted backend signals into a culturally framed, non-diagnostic
 * report. The input is intentionally typed as hidden data and is never copied
 * to the return value.
 */
export class CulturalTranslator {
  translate(input: {
    DebralFindings: HiddenDebralFindings;
    scanType?: "palm" | "tongue";
    hexacoreCore?: string;
    hexacoreState?: string;
    landmark?: string;
    redFlags?: Array<{ severity?: "low" | "medium" | "high"; referralRecommended?: boolean }>;
  }): CulturalReportPayload {
    const findings: CulturalFinding[] = [
      pickRule(input.DebralFindings, ["hydration", "water"]) ??
      pickRule(input.DebralFindings, ["circulation", "warmth"]) ??
      pickRule(input.DebralFindings, ["stress", "sleep"]) ??
      pickRule(input.DebralFindings, ["climate", "altitude"]) ??
      SAFE_DEFAULT,
    ].map((rule) => ({
      title: rule.title,
      traditionalLanguage: rule.traditionalLanguage,
      practice: rule.practice,
      safetyNotice: rule.safetyNotice,
      source: "reflective_dictionary",
    }));

    const core = input.hexacoreCore || "Peace";
    const state = input.hexacoreState || "Awakening";
    const landmark = input.landmark || "your place of origin";

    const urgentReferral = input.redFlags?.some((flag) => flag.severity === "high" || flag.referralRecommended === true) ?? false;

    return {
      status: "preliminary",
      summary: `A ${input.scanType || "personal"} reflection through the ${core} core and ${state} state.`,
      findings,
      hexacore: {
        core,
        state,
        reflection: "Use this as a journaling lens, not as a factual measurement of the body.",
      },
      landmark: {
        name: landmark,
        symbolism: "A reminder that place, memory, community, and daily practice can shape reflection.",
      },
      safetyCard: {
        herbWarnings: ["Use only herbs identified and reviewed by a trained practitioner."],
        contraindications: ["Ask a qualified practitioner before use during pregnancy, childhood, chronic illness, or medication use."],
        stopIfExperiencing: ["Severe pain", "difficulty breathing", "persistent vomiting", "vision changes", "rash or swelling"],
        emergencyContact: "Use local emergency services for urgent danger.",
      },
      ...(urgentReferral
        ? {
          referralNotice: {
            required: true,
            reason: "The reading includes a signal that should be confirmed by a qualified professional.",
            urgency: "urgent" as const,
            recommendedAction: "Pause self-treatment and seek timely professional or emergency support.",
          },
        }
        : {
          referralNotice: {
            required: false,
            reason: "No referral signal was supplied to this reflective translation.",
            urgency: "none" as const,
            recommendedAction: "Continue observation and seek qualified advice if concerns persist.",
          },
        }),
      safetyNotice: "This cultural translation is preliminary, reflective, and non-diagnostic. It must not replace medical, mental-Welbeing, or emergency care.",
    };
  }
}

export const culturalTranslator = new CulturalTranslator();
