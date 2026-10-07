/**
 * Domain configurations for the expert-reviewed case workflows. Question content lives in the
 * existing question engines under src/lib/case-workflow; safety rules and drafts live here.
 */
import { ApiError } from "@/lib/api/route";
import { calculateFullDivination } from "@/lib/cultural/spiritualDivinationEngine";
import { calculateTimingWindows } from "@/lib/cultural/careerTimingEngine";
import { buildCareerProfile, getCareerQuestions } from "@/lib/case-workflow/careerQuestionEngine";
import { retrieveReflectiveCaseFindings } from "@/lib/case-workflow/reflectiveCaseAnalysis";
import { getLegalQuestions } from "@/lib/case-workflow/legalQuestionEngine";
import { getRelationshipQuestions } from "@/lib/case-workflow/relationshipQuestionEngine";
import { getSocialQuestions } from "@/lib/case-workflow/socialQuestionEngine";
import { generateDynamicQuestions } from "@/lib/case-workflow/spiritualQuestionEngine";
import type { DomainConfig, SafetyOutcome, WorkflowDomain } from "../types";
import { concern, crisisOutcome, proceed, REFERRALS, screenFreeText, CONTACTS } from "../support";
import { CAREER_SAFETY, LEGAL_SAFETY, RELATIONSHIP_SAFETY, SOCIAL_SAFETY, SPIRITUAL_SAFETY } from "./safetyQuestions";
import { aiSection, compact, normalizeQuestions, REPORT_DISCLAIMER, STANDARD_CHECKLIST, text } from "./shared";
import { buildSpiritualSections } from "./spiritualContent";

const SPIRITUAL_NAME_QUESTIONS = [
  { id: "nameGeez", text: "Your name in Ge'ez script", textAmharic: "ስምዎ በግዕዝ ፊደል", type: "name_geez", required: true, hint: "For example ሰላማዊት. The reading is calculated from the letters of your name." },
  { id: "motherNameGeez", text: "Your mother's name in Ge'ez script", textAmharic: "የእናትዎ ስም በግዕዝ ፊደል", type: "name_geez", required: false },
];

const anyPreferNot = (answers: Record<string, unknown>) => Object.values(answers).includes("prefer_not");
const incompleteScreen = () => concern("One or more safety questions were not answered; the reviewer should check in first.");

// ── Career ───────────────────────────────────────────────────────────────────

const career: DomainConfig = {
  domain: "career",
  label: "Money & Business Reflection",
  description: "Spiritual and cultural reflection on work, livelihood, and enterprise; no career, business, financial, or scientific advice.",
  pricing: { reportEtb: 500, consultationEtb: 1000, consultationFormats: ["video", "voice", "chat", "in_person"] },
  reviewChecklist: [...STANDARD_CHECKLIST, { id: "reflection_only", label: "Only cultural and spiritual reflection is included; no career or financial instructions are given." }],
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
    const culturalFindings = await retrieveReflectiveCaseFindings("career", "vocation meaningful work identity and community values");
    return {
      title: "Vocation and cultural reflection",
      summary: "Optional spiritual and cultural reflection on vocation, identity, and work. It does not predict outcomes or guide career or financial decisions.",
      sections: compact([
        {
          id: "cultural_reflection",
          title: "Work, vocation, and community values",
          body: "Different Ethiopian communities and faith traditions understand meaningful work through values such as service, responsibility, identity, and contribution. These are optional reflection themes, not instructions.",
          locked: false,
        },
        culturalFindings.length > 0 && {
          id: "ethiopian_cultural_context",
          title: "Ethiopian cultural perspectives",
          items: culturalFindings.map((finding) => `${finding.title}: ${finding.reflection} ${finding.culturalContext}`),
          locked: false,
          cultural: true,
        },
        timing && {
          id: "timing",
          title: "Traditional symbolic timing",
          body: "A tradition-based symbolic reading, offered for cultural reflection only. It is not a forecast or a recommendation about when to make career or business decisions.",
          items: [timing.numerology.narrativeSummary],
          locked: true,
          cultural: true,
          data: { numerology: timing.numerology.narrativeSummary },
        },
      ]),
      recommendations: [],
      disclaimer: "Spiritual and cultural reflection only. No career, financial, scientific, or predictive advice is provided.",
      generatedAt: new Date().toISOString(),
      aiAssisted: false,
    };
  },
};

// ── Legal ────────────────────────────────────────────────────────────────────

const legal: DomainConfig = {
  domain: "legal",
  label: "Peace & Harmony",
  description: "Spiritual and cultural reflection on disputes, family harmony, and customary reconciliation (ሽምግልና); no scientific or statutory legal advice.",
  pricing: { reportEtb: 500, consultationEtb: 1000, consultationFormats: ["video", "voice", "in_person"] },
  reviewChecklist: [...STANDARD_CHECKLIST, { id: "reflection_only", label: "Only cultural and spiritual reflection is included; no scientific advice or formal statutory instruction is given." }],
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
          message: "This platform provides spiritual and cultural dispute reflection only. For criminal matters, please contact a licensed attorney or legal aid service as soon as possible.",
          hotlines: [],
          steps: ["Do not make statements about the case without legal advice.", "Contact a licensed attorney or a legal aid clinic."],
          resources: [REFERRALS.legalAid],
        },
      };
    }
    if (answers.evictionRisk === "within_7" || answers.evictionRisk === "within_30") {
      return concern("Time-sensitive eviction risk.", "urgent", {
        title: "Eviction support may be time-sensitive",
        message: "Contact legal aid or community elders promptly. Do not wait on this reflection report for formal court or housing deadlines.",
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
  async buildDraft({ answers }) {
    const culturalFindings = await retrieveReflectiveCaseFindings("legal", "customary dispute reconciliation shemgelna spiritual peacemaking");
    const deadline = text(answers.deadline);
    return {
      title: "Cultural & Spiritual Dispute Reflection (የሽምግልና እና የዕርቅ ምክር)",
      summary: `Your ${text(answers.issue_type) || "dispute"} matter, reflected through Ethiopian customary reconciliation (ሽምግልና / Shemgelna) and spiritual peacemaking traditions. Grounded entirely in cultural and spiritual wisdom — no scientific or statutory legal advice.`,
      sections: compact([
        {
          id: "customary_peacemaking",
          title: "Customary Peacemaking & Elder Reconciliation (የሽምግልና መንገድ)",
          body: "In Ethiopian traditions, disputes are resolved through respected elders (ሽማግሌዎች / Jaarsummaa / Sulh) who facilitate mutual listening, restorative equity, and relationship healing rather than adversarial division.",
          items: [
            "Involve trusted community elders or spiritual leaders early to create a neutral space for dialogue.",
            "Focus on restoring relationship harmony and community peace rather than escalating confrontation.",
            "Acknowledge mutual dignity and explore restorative solutions that respect both parties' standing.",
          ],
          locked: false,
          cultural: true,
        },
        culturalFindings.length > 0 && {
          id: "ethiopian_cultural_context",
          title: "Ethiopian Cultural Reconciliation Context",
          items: culturalFindings.map((finding) => `${finding.title}: ${finding.reflection} ${finding.culturalContext}`),
          locked: false,
          cultural: true,
        },
        deadline && deadline !== "no"
          ? { id: "time_awareness", title: "Time and Conscience Awareness", body: "You noted an upcoming date or deadline. Seek peaceful communication or timely counsel with elders or trusted representatives before tension escalates.", locked: false }
          : null,
        {
          id: "spiritual_reconciliation",
          title: "Spiritual Conscience & Forgiving Grudges (ዕርቅ እና ሰላም)",
          body: "Spiritual traditions teach that holding grudges (ቂም) impairs inner peace and community blessing. Reconciliation (ዕርቅ) seeks repentance, forgiveness, and restored fellowship.",
          items: [
            "Reflect with humility and prayerful discernment on fair terms of peace.",
            "Prioritize family stability, child wellbeing, and communal brotherhood over winning an argument.",
          ],
          locked: false,
          cultural: true,
        },
      ]),
      recommendations: [
        {
          id: "legal-r1",
          title: "Involve community elders for customary mediation",
          description: "Consult trusted family or community elders (ሽማግሌዎች / Jaarsummaa) for customary reconciliation (ሽምግልና).",
          evidence: { grade: "traditional" as const, source: "Ethiopian customary law", confidence: 0.85, note: "Grounded in Ethiopian traditional peacemaking practice." },
          domain: "cultural" as const,
        },
        {
          id: "legal-r2",
          title: "Emphasize reconciliation (ዕርቅ) and mutual understanding",
          description: "Focus on restoring community harmony and mutual dignity rather than adversarial escalation.",
          evidence: { grade: "reflective_only" as const, source: "Spiritual and cultural reflection", confidence: 0.8, note: "Spiritual and cultural reflection only." },
          domain: "spiritual" as const,
        },
      ],
      disclaimer: "Spiritual and cultural reflection only. No scientific, medical, or statutory legal advice is provided.",
      generatedAt: new Date().toISOString(),
      aiAssisted: false,
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

// ── Biological, wellbeing and health ────────────────────────────────────────

const biological: DomainConfig = {
  domain: "biological",
  label: "Biological, Wellbeing and Health",
  description: "Share one detailed account of your concern for a reviewer-assisted, evidence-aware look at biological, biochemical and wellbeing factors. Educational reflection only, not a medical evaluation or substitute for healthcare.",
  pricing: { reportEtb: 0, consultationEtb: 0, consultationFormats: ["video", "voice", "chat"] },
  reviewChecklist: [
    ...STANDARD_CHECKLIST,
    { id: "medical_scope", label: "Biochemical and biological findings are evidence-grounded and not presented as a diagnosis." },
    { id: "medical_referral", label: "Urgent symptoms and any need for qualified medical care are clearly addressed." },
  ],
  safetyQuestions: normalizeQuestions([{
    id: "urgentSymptoms",
    text: "Are you experiencing a medical emergency now, such as severe difficulty breathing, chest pain, heavy bleeding, fainting, or signs of stroke?",
    type: "choice",
    required: true,
    options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }],
  }]),
  startQuestions: normalizeQuestions([
    {
      id: "urgentSymptoms",
      text: "Are you experiencing a medical emergency now, such as severe difficulty breathing, chest pain, heavy bleeding, fainting, or signs of stroke?",
      type: "choice",
      required: true,
      options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }],
    },
    {
      id: "caseNarrative",
      text: "Describe your health or wellbeing concern in detail",
      type: "textarea",
      required: false,
      placeholder: "Include what you have noticed, when it began, relevant test results (if any), medicines or supplements, and what you would like help understanding. Do not include another person's private information.",
      hint: "One written account is enough. You may optionally attach one audio or video note instead or in addition.",
    },
  ]),
  evaluateSafety(answers) {
    if (answers.urgentSymptoms === "yes") {
      return crisisOutcome("Possible medical emergency reported", [
        "Contact local emergency services or go to the nearest emergency department now.",
        "Do not wait for an app report or online review.",
      ]);
    }
    return proceed();
  },
  questions: () => [],
  screenAnswers: screenFreeText,
  async buildDraft({ answers }) {
    const narrative = text(answers.caseNarrative) || "The user submitted an audio or video attachment for human review. No media transcription or interpretation is available to the AI analysis.";
    const ai = text(answers.caseNarrative) ? await aiSection("biological", { caseNarrative: narrative }) : null;
    return {
      title: "Biological, wellbeing and health case review",
      summary: "A preliminary case brief for an authorized reviewer. No diagnosis or treatment decision is made by this automated draft.",
      sections: compact([
        {
          id: "scope",
          title: "Review scope",
          body: "The reviewer should assess the submitted account against relevant biological, biochemical, medication-safety and dietary knowledge, note uncertainty and missing information, and recommend qualified clinical follow-up when appropriate.",
          locked: false,
        },
        ai,
        {
          id: "review_required",
          title: "Qualified human review",
          body: "This case and any AI-generated analysis must be checked by the assigned administrator or qualified delegate before a report is sent to the user.",
          locked: false,
        },
      ]),
      recommendations: [],
      disclaimer: "Educational, preliminary information only. This app does not diagnose conditions, interpret laboratory tests as a clinician, or prescribe treatment. For urgent or worsening symptoms, contact local emergency services or a qualified healthcare professional.",
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
  startQuestions: normalizeQuestions(SPIRITUAL_NAME_QUESTIONS),
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
    const nameQuestions = SPIRITUAL_NAME_QUESTIONS;
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

export const DOMAIN_CONFIGS: Record<WorkflowDomain, DomainConfig> = { career, legal, relationship, social, spiritual, biological };

export function getDomainConfig(domain: string): DomainConfig {
  const config = DOMAIN_CONFIGS[domain as WorkflowDomain];
  if (!config) throw ApiError.notFound("Case type");
  return config;
}
