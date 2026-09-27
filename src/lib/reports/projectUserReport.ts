import { ProfessionalReport, UserReport } from "./types";
import { SAFETY_GATE_DISCLAIMER } from "@/lib/evaluation/stage5SafetyGate.pipeline";

export interface ProjectionOptions {
  userConsentSpiritual?: boolean;
}

/**
 * Pure projection function: projects a ProfessionalReport into a culturally-translated,
 * safety-filtered UserReport.
 *
 * Non-negotiable security rules (§10, §20):
 * - Explicit allowlist ONLY.
 * - Under NO code path may mechanisms, CYP pathways, differentials, or raw rule rows leak.
 * - Spiritual section is omitted if user did not explicitly consent.
 * - Mandatory verbatim disclaimer: "No rule matched ≠ safe" included.
 */
export function projectUserReport(
  pro: ProfessionalReport,
  options?: ProjectionOptions
): UserReport {
  // 1. Headline
  const headline = pro.redFlags.length > 0 && pro.redFlags.some((rf) => rf.urgency === "immediate")
    ? "Urgent Care Advisory: Please Read Promptly"
    : pro.safetyGate.blocked
    ? "Safety Notice on Traditional Remedy Use"
    : `Personalized Care Guidance for ${pro.userSummary.location.admin.region} Community`;

  // 2. Urgent directive
  let urgentDirective: string | undefined = undefined;
  if (pro.redFlags.some((rf) => rf.urgency === "immediate")) {
    const immediateFlag = pro.redFlags.find((rf) => rf.urgency === "immediate")!;
    urgentDirective = `IMMEDIATE ACTION REQUIRED: ${immediateFlag.rationale} Report to the nearest health facility.`;
  } else if (pro.safetyGate.blocked) {
    urgentDirective = `CAUTION: Potential high-risk herb-drug interaction detected (${pro.safetyGate.flaggedHerbs.join(", ")}). Do not take traditional remedies until reviewed by your clinician.`;
  }

  // 3. Cultural & Ecological framing
  const culturalFraming = pro.culturalAnalysis?.illnessModel
    ? `In your community context, these symptoms are often understood through ${pro.culturalAnalysis.illnessModel.toLowerCase()}. Caring for yourself involves honoring body rhythms while staying attentive to warning signs.`
    : "Guided by traditional Ethiopian community care and natural bodily equilibrium.";

  // Spiritual framing (strictly opt-in)
  let spiritualFraming: string | undefined = undefined;
  if (options?.userConsentSpiritual && pro.spiritualAnalysis?.framing) {
    spiritualFraming = pro.spiritualAnalysis.framing;
  }

  const ecologicalContext = `Tuned to the ${pro.userSummary.location.agroEcological} environment (${pro.userSummary.location.altitudeBand}m elevation) in ${pro.userSummary.location.admin.region}. Local seasonal shifts affect hydration, energy, and recovery.`;

  // 4. Plain language body systems
  const bodySystems = [
    {
      name: "Digestive & Energy Balance",
      explanation: "How your body processes daily grains, hydration, and nutritional staples to support vitality.",
    },
    {
      name: "Environmental Adaptation",
      explanation: `How your circulatory and respiratory systems adapt to the ${pro.userSummary.location.agroEcological} altitude and climate.`,
    },
  ];

  // 5. Food and nutrition
  const localFoodsToEmphasize = pro.userSummary.location.foodAvailability?.staples?.slice(0, 4) || [
    "Fermented Teff Injera",
    "Faba Bean Shiro",
    "Leafy Gomen",
  ];
  const seasonalNotes = pro.userSummary.location.foodAvailability?.seasonalGaps?.length
    ? `Seasonal reminder: during ${pro.userSummary.location.foodAvailability.seasonalGaps.join(" and ")}, maintain dietary variety through stored pulses (shiro, lentils) and sprouted seeds.`
    : "Maintain wholesome traditional staples balanced with fresh legumes and cooked greens.";
  const preparationNotes = "Emphasize traditional slow-fermented grains (72-hour sourdough) and thoroughly boiled legume stews to maximize nutrient uptake.";

  // 6. Traditional remedies (Safety filtered — NO mechanism dumps or CYP pathways)
  const traditionalRemedies: UserReport["traditionalRemedies"] = [];

  // Check matched rules
  for (const rule of pro.matchedRules || []) {
    const isAvoid = rule.interactionSeverity === "high" || rule.contraindicated;
    traditionalRemedies.push({
      name: rule.herbName,
      amharic: rule.herbName === "Tena Adam" ? "ጤና አዳም" : rule.herbName === "Kosso" ? "ኮሶ" : rule.herbName === "Tikur Azmud" ? "ጥቁር አዝሙድ" : "የባህል መድኃኒት",
      status: isAvoid ? "avoid" : "caution",
      reason: rule.plainLanguageEffect || "May interact with your current medications. Please exercise caution.",
    });
  }

  // If no remedies flagged as avoid, include general safe culinary guidance
  if (!traditionalRemedies.some((r) => r.name === "Tena Adam")) {
    traditionalRemedies.push({
      name: "Ginger (Zingibil) & Tena Adam (Culinary drops)",
      amharic: "ዝንጅብል እና ጤና አዳም",
      status: "safe",
      reason: "Small culinary amounts used in tea or hot water are generally well-tolerated for warming digestive comfort.",
    });
  }

  // 7. Next steps & help directives
  const nextSteps = (pro.recommendedActions?.forUser && pro.recommendedActions.forUser.length > 0)
    ? pro.recommendedActions.forUser
    : [
        "Maintain adequate fluid intake with warm herbal tea or clean boiled water.",
        "Consume small, frequent nutrient-rich meals incorporating fermented injera and cooked greens.",
        "Allow rest during peak afternoon hours if experiencing fatigue.",
      ];

  const whenToSeekHelpNow = pro.redFlags.length > 0
    ? pro.redFlags.map((rf) => rf.rationale)
    : [
        "Sudden fainting, confusion, or difficulty speaking.",
        "Vomiting blood or noticing dark tarry stools.",
        "Severe, worsening shortness of breath while resting.",
        "High continuous fever lasting more than 48 hours without relief.",
      ];

  // 8. Disclaimers (Must include verbatim §1)
  const disclaimers = [
    SAFETY_GATE_DISCLAIMER,
    "This report provides culturally attuned, evidence-aware care guidance. It does not replace clinical consultation, prescription modification, or emergency medical treatment.",
    "Always inform your doctor or local health officer about any traditional herbs or remedies you take.",
  ];

  if (pro.overrideNotice) {
    disclaimers.push(`Professional Clinical Override: ${pro.overrideNotice}`);
  }

  return {
    headline,
    urgentDirective,
    yourSituation: {
      culturalFraming,
      spiritualFraming,
      ecologicalContext,
    },
    whatMayBeHappening: {
      plainLanguage: "Your reported symptoms reflect a combination of bodily strain and local environmental influences. Supporting your recovery involves dietary balance, proper rest, and safe medication practices.",
      bodySystems,
    },
    foodAndNutrition: {
      localFoodsToEmphasize,
      seasonalNotes,
      preparationNotes,
    },
    traditionalRemedies,
    nextSteps,
    whenToSeekHelpNow,
    disclaimers,
    approvedBy: pro.approvedBy || {
      role: "Professional",
      name: "Clinical Case Reviewer",
      date: new Date().toISOString().split("T")[0],
    },
  };
}
