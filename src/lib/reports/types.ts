import { LocationContext } from "@/lib/location/types";
import { SourceRef } from "@/lib/knowledge/pillars/types";
import { HerbInteractionRule } from "@/lib/evaluation/stage5SafetyGate";
import { PipelineSafetyGateResult } from "@/lib/evaluation/stage5SafetyGate.pipeline";

export interface InteractionDetail {
  herbName: string;
  targetDrugClass: string;
  severity: "high" | "moderate" | "caution";
  mechanism: string;
  cypPathways: string[];
  clinicalRecommendation: string;
}

export interface ProfessionalReport {
  caseId: string;
  userSummary: { ageBand: string; sex: string; location: LocationContext };
  narrative: string;
  safetyGate: PipelineSafetyGateResult;                 // raw
  matchedRules: HerbInteractionRule[];                 // raw rows
  differentialConsiderations: {
    condition: string;
    supporting: string[];
    against: string[];
    localPrevalence: string;
  }[];
  redFlags: { flag: string; rationale: string; urgency: "immediate" | "24h" | "routine" }[];
  culturalAnalysis: {
    illnessModel: string;
    careSeekingPattern: string;
    familyDynamics: string;
    stigmaConsiderations: string;
    provenance: SourceRef[];
  };
  spiritualAnalysis?: { framing: string; provenance: SourceRef[] };
  ecologicalAnalysis: { exposures: string[]; endemicDiseases: string[]; waterSanitation: string[] };
  nutritionalAnalysis: { gaps: string[]; localSolutions: string[]; biochemistry: string };
  pharmacology: {
    herbDrugInteractions: InteractionDetail[];
    cypPathways: string[];
    monitoringPlan: string[];
    separationAdvice: string;
  };
  recommendedActions: {
    forUser: string[];
    forClinician: string[];
    referrals: string[];
  };
  confidence: "low" | "moderate" | "high";
  provenance: SourceRef[];                       // every pillar + rule cited
  generatedAt: string;
  pipelineVersion: string;
  approvedBy?: { role: "Professional"; name: string; date: string };
  overrideNotice?: string;
}

export interface UserReport {
  headline: string;                      // plain, warm, non-clinical
  urgentDirective?: string;              // only if red flag / gate block
  yourSituation: {
    culturalFraming: string;
    spiritualFraming?: string;           // omitted if not consented
    ecologicalContext: string;
  };
  whatMayBeHappening: {
    plainLanguage: string;
    bodySystems: { name: string; explanation: string }[];
  };
  foodAndNutrition: {
    localFoodsToEmphasize: string[];
    seasonalNotes: string;
    preparationNotes: string;            // culturally appropriate
  };
  traditionalRemedies: {
    name: string;
    amharic: string;
    status: "safe" | "caution" | "avoid";
    reason: string;                      // plain language, no mechanism dump
  }[];
  nextSteps: string[];
  whenToSeekHelpNow: string[];
  disclaimers: string[];
  approvedBy: { role: "Professional"; name: string; date: string };
}
