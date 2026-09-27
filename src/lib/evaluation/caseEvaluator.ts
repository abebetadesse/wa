import { LocationContext } from "@/lib/location/types";
import { UserProfileData } from "./profileEvaluator";
import { evaluateSafetyGate, PipelineSafetyGateResult } from "./stage5SafetyGate.pipeline";
import { queryPillar, resolveCulturalPillarId, resolveSpiritualPillarId } from "@/lib/knowledge/pillars";
import { SourceRef } from "@/lib/knowledge/pillars/types";
import { ProfessionalReport, InteractionDetail } from "@/lib/reports/types";
import { projectUserReport } from "@/lib/reports/projectUserReport";
import { UserReport } from "@/lib/reports/types";

export interface CaseSubmissionInput {
  caseId: string;
  userId: string;
  narrative: string;
  symptoms: string[];
  duration?: string;
  selfTreatments?: {
    herbs?: string[];
    medications?: string[];
    other?: string[];
  };
  attachments?: string[];
  consentCheckbox: boolean;
}

export interface DualTrackEvaluationResult {
  professionalReport: ProfessionalReport;
  userReport: UserReport;
  isSafetyBlocked: boolean;
  overrideRequired: boolean;
  highestUrgency?: "immediate" | "24h" | "routine";
}

/**
 * Stage C: Dual-Track Case Evaluation Engine (§9).
 * Runs Track 1 (Scientific & Safety Gate) and Track 2 (Cultural, Spiritual, Ecological, Nutritional)
 * in parallel and merges into authoritative ProfessionalReport and projected UserReport.
 */
export async function evaluateClinicalCase(
  caseInput: CaseSubmissionInput,
  profile: UserProfileData,
  ctx: LocationContext
): Promise<DualTrackEvaluationResult> {
  // ── Track 1: Scientific & Safety Gate ──────────────────────────────────────
  const reportedHerbs = [
    ...(caseInput.selfTreatments?.herbs || []),
    ...(profile.traditionalUse?.map((t) => t.name) || []),
  ];

  const activeMeds = [
    ...(profile.currentMeds || []),
    ...(caseInput.selfTreatments?.medications?.map((m) => ({ name: m })) || []),
  ];

  // Authoritative safety gate run
  const safetyGateResult: PipelineSafetyGateResult = evaluateSafetyGate(reportedHerbs, activeMeds);

  // Red flags & clinical presentation pillars
  const [redFlagsResult, patternsResult, biochemResult, endemicResult] = await Promise.all([
    queryPillar<any, any>("clinical.redFlags", {
      narrative: caseInput.narrative,
      symptoms: caseInput.symptoms,
    }, ctx),
    queryPillar<any, any>("clinical.presentationPatterns", null, ctx),
    queryPillar<any, any>("biomedical.nutritionBiochemistry", null, ctx),
    queryPillar<any, any>("biomedical.endemicDisease", null, ctx),
  ]);

  // Format pharmacology interactions
  const herbDrugInteractions: InteractionDetail[] = (safetyGateResult.matchedRules || []).map((rule) => ({
    herbName: rule.herbName,
    targetDrugClass: rule.targetDrugClass,
    severity: rule.interactionSeverity,
    mechanism: rule.mechanism,
    cypPathways: rule.cypPathways || ["CYP450 / Metabolic"],
    clinicalRecommendation: rule.contraindicated
      ? "Immediate discontinuation required. Contraindicated combination."
      : "Separate ingestion by at least 3-4 hours; monitor target clinical parameters.",
  }));

  // Build differential considerations matched to local presentation and endemicity
  const differentialConsiderations: ProfessionalReport["differentialConsiderations"] = [
    {
      condition: "Functional Dyspepsia / Peptic Ulcer Disease",
      supporting: caseInput.symptoms.filter((s) => s.toLowerCase().includes("burn") || s.toLowerCase().includes("stomach") || s.toLowerCase().includes("pain")),
      against: ["Absence of overt hematemesis or persistent nocturnal waking"],
      localPrevalence: "High across highland communities consuming unbuffered berbere pastes and irregular fasting schedules.",
    },
    {
      condition: ctx.endemicDiseases.includes("malaria") ? "Subacute Plasmodium Infection" : "Post-Viral Fatigue Syndrome",
      supporting: caseInput.symptoms.filter((s) => s.toLowerCase().includes("tired") || s.toLowerCase().includes("fatigue") || s.toLowerCase().includes("cold")),
      against: ["Lack of continuous high temperature or severe shivering chills"],
      localPrevalence: `Prevalent in ${ctx.admin.region} altitude band (${ctx.altitudeBand}m).`,
    },
  ];

  // ── Track 2: Cultural / Spiritual / Ecological / Nutritional ───────────────
  const culturalPillarId = resolveCulturalPillarId(ctx);
  const culturalResult = await queryPillar<unknown, any>(culturalPillarId, null, ctx);

  let spiritualAnalysis: ProfessionalReport["spiritualAnalysis"] | undefined = undefined;
  if (profile.consentSpiritual && profile.spiritualContext) {
    const spiritualPillarId = resolveSpiritualPillarId(profile.spiritualContext);
    const spiritualResult = await queryPillar<any, any>(
      spiritualPillarId,
      { consented: true, spiritualContext: profile.spiritualContext },
      ctx
    );
    if (spiritualResult.data?.framing) {
      spiritualAnalysis = {
        framing: spiritualResult.data.framing,
        provenance: spiritualResult.provenance,
      };
    }
  }

  const [watershedResult, floraResult, foodResult, microResult] = await Promise.all([
    queryPillar<unknown, any>("ecological.watersheds", null, ctx),
    queryPillar<unknown, any>("ecological.endemicFlora", null, ctx),
    queryPillar<unknown, any>("nutritional.foodSystems", null, ctx),
    queryPillar<unknown, any>("nutritional.micronutrientGaps", null, ctx),
  ]);

  // ── Merge Rules (§9) ───────────────────────────────────────────────────────
  // Rule: Cultural content must never contradict a safety directive.
  let illnessModel = culturalResult.data.illnessModels?.[0] || "Humoral equilibrium (Bird/Muket) and seasonal strain.";
  if (safetyGateResult.blocked) {
    illnessModel += ` [SAFETY OVERRIDE NOTE: Client-reported traditional herb ${safetyGateResult.flaggedHerbs.join(", ")} directly conflicts with pharmaceutical ${safetyGateResult.flaggedMedications.join(", ")}. Herb intake must pause immediately.]`;
  }

  const redFlagsList = redFlagsResult.data.identifiedRedFlags.map((rf: any) => ({
    flag: rf.flag,
    rationale: rf.rationale,
    urgency: rf.urgency,
  }));

  // Aggregate provenance from all pillars and rules
  const allProvenance: SourceRef[] = [
    ...culturalResult.provenance,
    ...watershedResult.provenance,
    ...floraResult.provenance,
    ...foodResult.provenance,
    ...microResult.provenance,
    ...biochemResult.provenance,
    ...endemicResult.provenance,
    ...patternsResult.provenance,
    ...redFlagsResult.provenance,
  ];

  const professionalReport: ProfessionalReport = {
    caseId: caseInput.caseId,
    userSummary: {
      ageBand: profile.ageBand,
      sex: profile.sex,
      location: ctx,
    },
    narrative: caseInput.narrative,
    safetyGate: safetyGateResult,
    matchedRules: safetyGateResult.matchedRules,
    differentialConsiderations,
    redFlags: redFlagsList,
    culturalAnalysis: {
      illnessModel,
      careSeekingPattern: culturalResult.data.careSeekingPatterns?.[0] || "Home infusion followed by community clinic if unresolved.",
      familyDynamics: culturalResult.data.familyDynamics || "Family council consulting elder members.",
      stigmaConsiderations: "Somatic distress may express psychological and emotional burdens in highland and pastoralist contexts.",
      provenance: culturalResult.provenance,
    },
    spiritualAnalysis,
    ecologicalAnalysis: {
      exposures: ctx.endemicDiseases,
      endemicDiseases: endemicResult.data.endemicProfile || ctx.endemicDiseases,
      waterSanitation: watershedResult.data.waterQualityRisks || [],
    },
    nutritionalAnalysis: {
      gaps: microResult.data.vulnerableNutrients || [],
      localSolutions: foodResult.data.staples || [],
      biochemistry: biochemResult.data.fermentationBiochemistry || "Fermentation optimizes mineral bioavailability.",
    },
    pharmacology: {
      herbDrugInteractions,
      cypPathways: herbDrugInteractions.flatMap((i) => i.cypPathways),
      monitoringPlan: [
        "Monitor international normalized ratio (INR) if anticoagulant therapy is concurrent.",
        "Serial blood pressure evaluation in seated and standing positions.",
      ],
      separationAdvice: "Strict 4-hour temporal separation recommended between herbal teas and oral synthetic pharmaceuticals.",
    },
    recommendedActions: {
      forUser: [
        "Discontinue any unverified traditional herbal brews while prescription medications are active.",
        "Increase fluid intake with boiled water, light shiro broth, and herbal ginger tea.",
        "Attend local health facility if symptoms worsen over the next 48 hours.",
      ],
      forClinician: [
        "Review client's concurrent use of traditional home preparations.",
        "Perform baseline complete blood count (CBC) and basic metabolic panel (BMP).",
        "Assess for regional endemic co-morbidities based on agro-ecological zone.",
      ],
      referrals: [
        "Woreda Primary Hospital / Health Center Internal Medicine outpatient clinic.",
      ],
    },
    confidence: ctx.confidence === "reduced" ? "moderate" : "high",
    provenance: allProvenance,
    generatedAt: new Date().toISOString(),
    pipelineVersion: "1.0.0-dual-track",
  };

  // Generate safety-filtered User Report via pure projection
  const userReport = projectUserReport(professionalReport, {
    userConsentSpiritual: profile.consentSpiritual,
  });

  return {
    professionalReport,
    userReport,
    isSafetyBlocked: safetyGateResult.blocked,
    overrideRequired: safetyGateResult.overrideRequired,
    highestUrgency: redFlagsResult.data.highestUrgency,
  };
}

/**
 * Adapter / alias for evaluateClinicalCase used by API routes and tests.
 * Accepts a simplified argument shape.
 */
export async function evaluateCase(args: {
  caseInput: {
    id: string;
    userId: string;
    profileId?: string;
    narrative: string;
    symptoms: string[];
    duration?: string;
    selfTreatments?: string[];
    attachments?: string[];
  };
  profile: {
    id: string;
    userId: string;
    ageBand: string;
    sex: string;
    pregnancyStatus?: string;
    chronicConditions?: string[];
    currentMeds?: Array<{ name: string; dosage?: string; frequency?: string }>;
    allergies?: string[];
    traditionalUse?: Array<{ name: string; preparation?: string; purpose?: string }>;
    diet?: any;
    substanceUse?: any;
    location: any;
    spiritualContext?: string;
    culturalContext?: string;
    consent?: { spiritualAnalysisOptIn?: boolean };
  };
  location: any;
}): Promise<{
  professionalReport: ProfessionalReport;
  userReport: UserReport;
  safetyGateResult: PipelineSafetyGateResult;
  isSafetyBlocked: boolean;
}> {
  // Normalize self-treatments from string[] -> herb/medication split heuristic
  const selfTreatmentStrings = args.caseInput.selfTreatments || [];
  const herbKeywords = ["kosso", "tena adam", "feto", "ginger", "damakesse", "khat", "camel milk", "herbal"];
  const selfHerbs = selfTreatmentStrings.filter((t) =>
    herbKeywords.some((k) => t.toLowerCase().includes(k))
  );
  const selfMeds = selfTreatmentStrings.filter((t) =>
    !herbKeywords.some((k) => t.toLowerCase().includes(k))
  );

  const adaptedInput: CaseSubmissionInput = {
    caseId: args.caseInput.id,
    userId: args.caseInput.userId,
    narrative: args.caseInput.narrative,
    symptoms: args.caseInput.symptoms,
    duration: args.caseInput.duration,
    selfTreatments: {
      herbs: selfHerbs,
      medications: selfMeds,
      other: [],
    },
    attachments: args.caseInput.attachments || [],
    consentCheckbox: true,
  };

  const adaptedProfile: UserProfileData = {
    id: args.profile.id,
    userId: args.profile.userId,
    ageBand: args.profile.ageBand,
    sex: args.profile.sex,
    pregnancyStatus: args.profile.pregnancyStatus,
    chronicConditions: args.profile.chronicConditions || [],
    currentMeds: (args.profile.currentMeds || []).map((m: any) => ({
      name: m.name,
      dose: m.dosage,
    })),
    allergies: args.profile.allergies || [],
    traditionalUse: (args.profile.traditionalUse || []).map((h: any) => ({
      name: h.name,
    })),
    diet: {
      pattern: args.profile.diet?.primaryStaple,
      restrictions: args.profile.diet?.fastingSchedule ? [args.profile.diet.fastingSchedule] : [],
    },
    substanceUse: {
      coffeeCupsDaily: args.profile.substanceUse?.coffeeDailyCups,
      khat: args.profile.substanceUse?.khatFrequency !== undefined,
      alcohol: args.profile.substanceUse?.alcoholFrequency,
    },
    location: args.location,
    spiritualContext: args.profile.spiritualContext,
    consentSpiritual: args.profile.consent?.spiritualAnalysisOptIn ?? false,
  };

  const result = await evaluateClinicalCase(adaptedInput, adaptedProfile, args.location);

  return {
    professionalReport: result.professionalReport,
    userReport: result.userReport,
    safetyGateResult: result.professionalReport.safetyGate,
    isSafetyBlocked: result.isSafetyBlocked,
  };
}
