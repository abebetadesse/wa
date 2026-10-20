import type { CaseStatus, CaseEvent } from "./types";
import type { LocationContext } from "../location/types";
import type { PreliminaryAnalysis } from "../evaluation/profileEvaluator";
import type { ProfessionalReport, UserReport } from "../reports/types";
import { newCaseEvent, type CaseEventInput } from "./events";
import { dbPipelineStore, type PipelineCaseFilter, type PipelineStore } from "./store";

export interface PipelineProfileRecord {
  id: string;
  userId: string;
  ageBand: string;
  sex: string;
  pregnancyStatus?: string;
  chronicConditions: string[];
  currentMeds: Array<{ name: string; dosage?: string; frequency?: string }>;
  allergies: string[];
  traditionalUse: Array<{ name: string; preparation?: string; purpose?: string }>;
  diet: {
    primaryStaple?: string;
    fastingSchedule?: string;
    meatDairyFrequency?: string;
    notes?: string;
  };
  substanceUse: {
    coffeeDailyCups?: number;
    khatFrequency?: string;
    alcoholFrequency?: string;
    tobaccoUse?: boolean;
  };
  location: LocationContext;
  spiritualContext?: string;
  culturalContext?: string;
  consent: {
    spiritualAnalysisOptIn: boolean;
    dataUseAcknowledged: boolean;
    requiresProfessionalApprovalAcknowledged: boolean;
  };
  submittedAt: string;
  updatedAt: string;
}

export interface PipelineCaseRecord {
  id: string;
  userId: string;
  profileId: string;
  narrative: string;
  symptoms: string[];
  duration: string;
  selfTreatments: string[];
  attachments: string[];
  emergencyDetected?: boolean;
  emergencySignals?: string[];
  emergencyRoutedAt?: string;
  status: CaseStatus;
  submittedAt: string;
  updatedAt: string;
  assignedProfessionalId?: string;
  overrideJustification?: string;
  overrideActorId?: string;
}

export interface PipelineReportRecord {
  id: string;
  caseId: string;
  kind: "USER" | "PROFESSIONAL";
  version: number;
  payload: UserReport | ProfessionalReport;
  safetyGate?: any;
  confidence: "low" | "moderate" | "high";
  provenance: any[];
  authoredBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
  supersededBy?: string;
  createdAt: string;
}

/** The pipeline's records over a store: MySQL in the application, memory in tests. */
export function createPipelineRepository(store: PipelineStore) {
  async function getLatestReport(caseId: string, kind: PipelineReportRecord["kind"]): Promise<PipelineReportRecord | null> {
    const reports = await store.listReports(caseId);
    return reports.find((report) => report.kind === kind && !report.supersededBy) ?? null;
  }

  return {
    // Profiles
    async saveProfile(profile: PipelineProfileRecord): Promise<PipelineProfileRecord> {
      await store.saveProfile(profile);
      return profile;
    },

    getProfileById(id: string): Promise<PipelineProfileRecord | null> {
      return store.getProfile(id);
    },

    getProfileByUserId(userId: string): Promise<PipelineProfileRecord | null> {
      return store.getLatestProfileForUser(userId);
    },

    // Preliminary Analyses
    async savePreliminaryAnalysis(profileId: string, analysis: PreliminaryAnalysis): Promise<PreliminaryAnalysis> {
      await store.saveAnalysis(profileId, analysis);
      return analysis;
    },

    getPreliminaryAnalysisByProfileId(profileId: string): Promise<PreliminaryAnalysis | null> {
      return store.getAnalysis(profileId);
    },

    // Cases
    async saveCase(caseRecord: PipelineCaseRecord): Promise<PipelineCaseRecord> {
      await store.saveCase(caseRecord);
      return caseRecord;
    },

    getCaseById(id: string): Promise<PipelineCaseRecord | null> {
      return store.getCase(id);
    },

    listCases(filter?: PipelineCaseFilter): Promise<PipelineCaseRecord[]> {
      return store.listCases(filter);
    },

    // Reports
    async saveReport(report: PipelineReportRecord): Promise<PipelineReportRecord> {
      await store.saveReport(report);
      return report;
    },

    getReportsByCaseId(caseId: string): Promise<PipelineReportRecord[]> {
      return store.listReports(caseId);
    },

    getLatestUserReport(caseId: string): Promise<PipelineReportRecord | null> {
      return getLatestReport(caseId, "USER");
    },

    getLatestProfessionalReport(caseId: string): Promise<PipelineReportRecord | null> {
      return getLatestReport(caseId, "PROFESSIONAL");
    },

    async overrideSafetyGate(caseId: string, actorId: string, justification: string): Promise<void> {
      const record = await store.getCase(caseId);
      if (!record) throw new Error("Case not found");
      record.overrideJustification = justification;
      record.overrideActorId = actorId;
      record.updatedAt = new Date().toISOString();
      await store.saveCase(record);
    },

    async hasSafetyGateOverride(caseId: string): Promise<boolean> {
      const record = await store.getCase(caseId);
      return Boolean(record?.overrideJustification && record.overrideJustification.trim().length > 0);
    },

    // Audit Events
    /** Records an event with a snapshot of what the user can currently see. A failed write is an error. */
    async appendEvent(input: CaseEventInput): Promise<CaseEvent> {
      const [caseRecord, latestUserReport] = await Promise.all([store.getCase(input.caseId), getLatestReport(input.caseId, "USER")]);
      const event = newCaseEvent({
        ...input,
        after: {
          ...(input.after ?? {}),
          userVisibleSnapshot: {
            caseStatus: caseRecord?.status ?? null,
            emergencyDetected: caseRecord?.emergencyDetected ?? false,
            emergencySignals: caseRecord?.emergencySignals ?? [],
            userReport: latestUserReport?.payload ?? null,
            userReportVersion: latestUserReport?.version ?? null,
            userReportPublishedAt: latestUserReport?.publishedAt ?? null,
          },
        },
      });
      await store.insertEvent(event);
      return event;
    },

    getEvents(caseId: string): Promise<CaseEvent[]> {
      return store.listEvents(caseId);
    },
  };
}

export type PipelineRepository = ReturnType<typeof createPipelineRepository>;

export const pipelineRepository = createPipelineRepository(dbPipelineStore);
