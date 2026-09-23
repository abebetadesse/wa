/**
 * Domain configurations for the expert-reviewed case workflows. Question content lives in the
 * existing question engines under src/lib/case-workflow; safety rules and drafts live here.
 */
import { ApiError } from "@/lib/api/route";
import { calculateFullDivination } from "@/lib/cultural/spiritualDivinationEngine";
import { calculateTimingWindows } from "@/lib/cultural/careerTimingEngine";
import { buildCareerProfile, FINANCIAL_DISCLAIMER, getCareerQuestions } from "@/lib/case-workflow/careerQuestionEngine";
import { getLegalQuestions } from "@/lib/case-workflow/legalQuestionEngine";
import { getRelationshipQuestions } from "@/lib/case-workflow/relationshipQuestionEngine";
import { getSocialQuestions } from "@/lib/case-workflow/socialQuestionEngine";
import { generateDynamicQuestions } from "@/lib/case-workflow/spiritualQuestionEngine";
import type { DomainConfig, SafetyOutcome, WorkflowDomain } from "../types";
import { concern, crisisOutcome, proceed, REFERRALS, screenFreeText, CONTACTS } from "../support";
import { CAREER_SAFETY, LEGAL_SAFETY, RELATIONSHIP_SAFETY, SOCIAL_SAFETY, SPIRITUAL_SAFETY } from "./safetyQuestions";
import { aiSection, compact, normalizeQuestions, REPORT_DISCLAIMER, STANDARD_CHECKLIST, text } from "./shared";
import { buildSpiritualSections } from "./spiritualContent";

const anyPreferNot = (answers: Record<string, unknown>) => Object.values(answers).includes("prefer_not");
const incompleteScreen = () => concern("One or more safety questions were not answered; the reviewer should check in first.");

// ── Career ───────────────────────────────────────────────────────────────────

const career: DomainConfig = {
  domain: "career",
  label: "Career & Business",
  description: "Career direction, business timing and next steps, reviewed by a career advisor.",
  pricing: { reportEtb: 500, consultationEtb: 1000, consultationFormats: ["video", "voice", "chat", "in_person"] },
  reviewChecklist: [...STANDARD_CHECKLIST, { id: "financial_disclaimer", label: "No investment or financial instruction is given." }],
  safetyQuestions: CAREER_SAFETY,
  evaluateSafety(answers) {
    if (answers.self_harm === "occasionally" || answers.self_harm === "frequently") return crisisOutcome("Self-harm reported in career screen");
    if (answers.basic_needs === "no") {
      return concern("Unable to meet basic needs; social support may be required first.", "high", {
        title: "Immediate support is available — for free",
        message: "If you are struggling to meet basic needs, these services can help while your case is reviewed.",
        hotlines: [{ name: CONTACTS.crisisLine.name, number: CONTACTS.crisisLine.number }],
        steps: ["Contact the social worker at your nearest health centre.", "Ask your kebele or woreda office about the Productive Safety Net Programme."],
        resources: [REFERRALS.psnp, REFERRALS.socialServices, REFERRALS.healthCenter],
      });
    }
    if (answers.financial_pressure === "yes") return concern("External pressure to make financial decisions; coercion risk noted.", "high");
    return anyPreferNot(answers) ? incompleteScreen() : proceed();
  },
  questions: (answers) => normalizeQuestions(getCareerQuestions((text(answers.career_stage) || "exploring") as Parameters<typeof getCareerQuestions>[0])),
  screenAnswers: (answers) => screenFreeText(answers) ?? (answers.recover_emotional_check === "yes" ? concern("Emotional distress reported during recovery questions.", "high") : null),
  async buildDraft({ answers }) {
    const profile = buildCareerProfile(Object.fromEntries(Object.entries(answers).map(([key, value]) => [key, text(value)])));
    const timing = profile.geezName && profile.motherGeezName ? calculateTimingWindows(profile) : null;
    const ai = await aiSection("career", { profile, answers });
    return {
      title: "Career direction review",
      summary: profile.topGoal
        ? `A review of your goal — “${profile.topGoal}” — at the ${profile.careerStage.replace(/_/g, " ")} stage${profile.sector ? ` in ${profile.sector}` : ""}.`
        : `A review of your ${profile.careerStage.replace(/_/g, " ")} career stage and next steps.`,
      sections: compact([
        {
          id: "next_steps",
          title: "Practical next steps",
          items: [
            "Write your goal as one concrete action you can take in the next 14 days.",
            "List the two people or institutions most able to help with that action.",
            "Set a review date to check progress with your advisor.",
          ],
          locked: false,
        },
        ai,
        timing && {
          id: "timing",
          title: "Traditional timing reflection",
          body: `${timing.currentWindow.actionRecommendation} ${timing.lunarPhaseNote}`,
          items: [`Best day of week: ${timing.bestDayOfWeek} (${timing.bestDayAmharic})`, `Suggested month for action: ${timing.recommendedActionMonth}`],
          locked: true,
          cultural: true,
          data: { numerology: timing.numerology.narrativeSummary, ritualNote: timing.currentWindow.ritualNote },
        },
        { id: "financial_disclaimer", title: "About financial topics", body: FINANCIAL_DISCLAIMER, locked: false },
      ]),
      disclaimer: REPORT_DISCLAIMER,
      generatedAt: new Date().toISOString(),
      aiAssisted: Boolean(ai),
    };
  },
};

// ── Legal ────────────────────────────────────────────────────────────────────

const legal: DomainConfig = {
  domain: "legal",
  label: "Legal Guidance",
  description: "Organising a legal question, deadlines and lawful next steps, reviewed by a legal practitioner.",
  pricing: { reportEtb: 600, consultationEtb: 1500, consultationFormats: ["video", "voice", "in_person"] },
  reviewChecklist: [...STANDARD_CHECKLIST, { id: "deadlines_flagged", label: "Deadlines and time-sensitive risks are clearly flagged." }],
  safetyQuestions: LEGAL_SAFETY,
  evaluateSafety(answers): SafetyOutcome {
    if (answers.immediateHarm === "physical_danger" || answers.immediateHarm === "threats") {
      return crisisOutcome("Threats or physical danger reported", ["Keep evidence and documents safe when doing so will not increase danger."]);
    }
    if (answers.childWelfare === "concerned") {
      return crisisOutcome("Child welfare concern", ["Keep the child in a safe place if possible.", "Contact the police or your woreda women and children affairs office."]);
    }
    if (answers.criminalMatter === "yes") {
      return {
        action: "referral_route",
        priority: "high",
        reason: "Criminal matter — requires a licensed attorney.",
        support: {
          title: "Criminal matters need a licensed attorney",
          message: "This platform does not give guidance on criminal cases. You can still record your situation, but please contact a licensed attorney or legal aid service as soon as possible.",
          hotlines: [],
          steps: ["Do not make statements about the case without legal advice.", "Contact a licensed attorney or a legal aid clinic."],
          resources: [REFERRALS.legalAid],
        },
      };
    }
    if (answers.evictionRisk === "within_7" || answers.evictionRisk === "within_30") {
      return concern("Time-sensitive eviction risk.", "urgent", {
        title: "Eviction support may be time-sensitive",
        message: "Contact legal aid promptly while your case is reviewed. Do not wait on this report for court or housing deadlines.",
        hotlines: [],
        steps: ["Keep every notice and document you receive.", "Contact legal aid or your kebele housing office this week."],
        resources: [REFERRALS.legalAid],
      });
    }
    if (answers.criminalMatter === "unsure") return concern("Unclear whether the matter is criminal.", "high");
    return anyPreferNot(answers) ? incompleteScreen() : proceed();
  },
  questions: () => normalizeQuestions([...getLegalQuestions("intake"), ...getLegalQuestions("matter")]),
  screenAnswers: screenFreeText,
  async buildDraft({ answers, safety }) {
    const ai = await aiSection("legal", { answers });
    const deadline = text(answers.deadline);
    return {
      title: "Legal question and next-step plan",
      summary: `Your ${text(answers.issue_type) || "legal"} matter, organised around immediate risks, deadlines and lawful next steps.`,
      sections: compact([
        deadline && deadline !== "no"
          ? { id: "deadline", title: "Time-sensitive", body: "You reported a deadline or notice. Contact legal aid or an attorney before that date, independently of this report.", locked: false }
          : null,
        {
          id: "next_steps",
          title: "Next steps",
          items: [
            "Write down the key dates, names and documents in one place.",
            "Keep originals safe and share copies only.",
            safety.action === "referral_route" ? "Contact a licensed attorney before taking further action." : "Ask a legal aid clinic to confirm the rules that apply in your region.",
          ],
          locked: false,
        },
        ai,
      ]),
      disclaimer: `${REPORT_DISCLAIMER} This is not legal advice or representation.`,
      generatedAt: new Date().toISOString(),
      aiAssisted: Boolean(ai),
    };
  },
};

// ── Relationship ─────────────────────────────────────────────────────────────

const relationship: DomainConfig = {
  domain: "relationship",
  label: "Relationships & Family",
  description: "Relationship patterns, communication and family dynamics, reviewed by a counsellor.",
  pricing: { reportEtb: 500, consultationEtb: 1200, consultationFormats: ["video", "voice", "chat"] },
  reviewChecklist: [...STANDARD_CHECKLIST, { id: "no_blame", label: "The report avoids blame and does not advise staying in an unsafe situation." }],
  safetyQuestions: RELATIONSHIP_SAFETY,
  evaluateSafety(answers) {
    if (answers.immediateRisk === "yes" || answers.feelsSafe === "unsafe" || answers.domesticViolence === "active" || answers.childSafety === "concerned") {
      return crisisOutcome("Relationship safety risk", ["Move to a safer place if you can do so without increasing danger."]);
    }
    if (answers.domesticViolence === "possible" || anyPreferNot(answers)) {
      return concern("Possible safety concern; trauma-aware review required.", "high");
    }
    return proceed();
  },
  questions: () =>
    normalizeQuestions([...getRelationshipQuestions("intake"), ...getRelationshipQuestions("pattern"), ...getRelationshipQuestions("family")]),
  screenAnswers: screenFreeText,
  async buildDraft({ answers }) {
    const ai = await aiSection("relationship", { answers });
    return {
      title: "Relationship reflection and communication plan",
      summary: "A review of the patterns you described, with communication steps that keep safety and respect first.",
      sections: compact([
        {
          id: "communication",
          title: "Communication steps",
          items: [
            "Choose a calm time to talk and agree on one topic only.",
            "Describe your own experience (“I felt…”) rather than the other person's intent.",
            "Agree on one small change each, and review it together after a week.",
          ],
          locked: false,
        },
        ai,
        {
          id: "support",
          title: "Community and family support",
          body: "A respected elder, a spiritual father or a trained counsellor can help mediate when conversations stall. Mediation is never appropriate where there is violence or coercion.",
          locked: true,
          cultural: true,
        },
      ]),
      disclaimer: REPORT_DISCLAIMER,
      generatedAt: new Date().toISOString(),
      aiAssisted: Boolean(ai),
    };
  },
};

// ── Social ───────────────────────────────────────────────────────────────────

const social: DomainConfig = {
  domain: "social",
  label: "Belonging & Community",
  description: "Loneliness, belonging and community connection, reviewed by a social support practitioner.",
  pricing: { reportEtb: 400, consultationEtb: 900, consultationFormats: ["video", "voice", "chat", "in_person"] },
  reviewChecklist: STANDARD_CHECKLIST,
  safetyQuestions: SOCIAL_SAFETY,
  evaluateSafety(answers) {
    if (answers.immediateRisk === "yes" || answers.self_harm === "occasionally" || answers.self_harm === "frequently") {
      return crisisOutcome("Self-harm or immediate risk reported in social screen");
    }
    if (answers.loneliness === "high" || answers.supportAvailable === "none") {
      return concern("Isolation with limited support; community-centred review required.", "high", {
        title: "Support can be built step by step",
        message: "You do not need to handle loneliness alone. These are places to start while your case is reviewed.",
        hotlines: [{ name: CONTACTS.crisisLine.name, number: CONTACTS.crisisLine.number }],
        steps: ["Reach out to one person this week, even briefly.", "Ask your iddir, church, mosque or community group about gatherings."],
        resources: [REFERRALS.elders, REFERRALS.healthCenter],
      });
    }
    return anyPreferNot(answers) ? incompleteScreen() : proceed();
  },
  questions: () => normalizeQuestions([...getSocialQuestions("intake"), ...getSocialQuestions("pattern")]),
  screenAnswers: screenFreeText,
  async buildDraft({ answers }) {
    const ai = await aiSection("social", { answers });
    return {
      title: "Belonging and community connection plan",
      summary: "Practical steps toward safe connection and supportive routines, based on your answers.",
      sections: compact([
        {
          id: "next_steps",
          title: "Next steps",
          items: [
            "Identify one trusted person or community resource to reconnect with.",
            "Focus on one practical step at a time to reduce pressure.",
            "If conflict or coercion is present, put safety and support before reconciliation.",
          ],
          locked: false,
        },
        ai,
        {
          id: "community",
          title: "Community traditions of support",
          body: "Iddir, equb, mahber and faith communities have long provided belonging and mutual aid. Joining one gathering can be a low-pressure first step.",
          locked: true,
          cultural: true,
        },
      ]),
      disclaimer: REPORT_DISCLAIMER,
      generatedAt: new Date().toISOString(),
      aiAssisted: Boolean(ai),
    };
  },
};

// ── Spiritual ────────────────────────────────────────────────────────────────

const spiritual: DomainConfig = {
  domain: "spiritual",
  label: "Spiritual & Life Direction",
  description: "Reflective Awde Negest reading of your name and life season, reviewed by a debtera.",
  pricing: { reportEtb: 500, consultationEtb: 1000, consultationFormats: ["video", "voice", "chat", "in_person"] },
  reviewChecklist: [
    ...STANDARD_CHECKLIST,
    { id: "reflective_framing", label: "Divination content is framed as reflection, never as prediction or medical guidance." },
  ],
  safetyQuestions: SPIRITUAL_SAFETY,
  evaluateSafety(answers) {
    if (answers.immediateRisk === "yes" || answers.self_harm === "occasionally" || answers.self_harm === "frequently") {
      return crisisOutcome("Self-harm or immediate risk reported", [
        "Traditional divination is for reflection, never for crisis. Please reach out to a person now.",
      ]);
    }
    return anyPreferNot(answers) ? incompleteScreen() : proceed();
  },
  buildContext(answers) {
    const name = text(answers.nameGeez);
    if (!name) throw ApiError.badRequest("Your name in Ge'ez is required to begin.");
    const gematria = calculateFullDivination(name, text(answers.motherNameGeez));
    return { gematria };
  },
  questions(answers) {
    // The name questions come first; dynamic reflection questions follow once the gematria is known.
    const nameQuestions = [
      { id: "nameGeez", text: "Your name in Ge'ez script", textAmharic: "ስምዎ በግዕዝ ፊደል", type: "name_geez", required: true },
      { id: "motherNameGeez", text: "Your mother's name in Ge'ez script", textAmharic: "የእናትዎ ስም በግዕዝ ፊደል", type: "name_geez", required: false },
    ];
    const name = text(answers.nameGeez);
    if (!name) return normalizeQuestions(nameQuestions);
    const gematria = calculateFullDivination(name, text(answers.motherNameGeez));
    return normalizeQuestions([
      ...nameQuestions,
      ...generateDynamicQuestions(gematria, text(answers.question_category) || "life_direction", answers).map((question) => ({
        ...question,
        dependsOn: undefined,
      })),
    ]);
  },
  screenAnswers: (answers) => screenFreeText(answers) ?? (answers.safety_screening === "unsafe" ? crisisOutcome("Reported feeling unsafe") : null),
  async buildDraft({ answers, context }) {
    const gematria = context.gematria as ReturnType<typeof calculateFullDivination>;
    const category = text(answers.question_category) || "life_direction";
    const ai = await aiSection("spiritual", { answers, category, gematria });
    return {
      title: "Awde Negest reflection",
      summary: `A reflective reading of ${gematria.nameGeez} in the Awde Negest tradition, focused on ${category.replace(/_/g, " ")}.`,
      sections: [...buildSpiritualSections(gematria, category), ...compact([ai])],
      disclaimer: REPORT_DISCLAIMER,
      generatedAt: new Date().toISOString(),
      aiAssisted: Boolean(ai),
    };
  },
};

export const DOMAIN_CONFIGS: Record<WorkflowDomain, DomainConfig> = { career, legal, relationship, social, spiritual };

export function getDomainConfig(domain: string): DomainConfig {
  const config = DOMAIN_CONFIGS[domain as WorkflowDomain];
  if (!config) throw ApiError.notFound("Case type");
  return config;
}
