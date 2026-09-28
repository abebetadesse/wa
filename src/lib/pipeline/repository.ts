import fs from "fs";
import path from "path";
import { CaseStatus, Role, type CaseEvent, type EventType } from "./types";
import { LocationContext } from "../location/types";
import { PreliminaryAnalysis } from "../evaluation/profileEvaluator";
import { ProfessionalReport, UserReport } from "../reports/types";
import { appendCaseEvent, getCaseEvents } from "./events";

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

const STORAGE_ROOT = path.join(process.cwd(), ".cases_cache", "pipeline");
const PROFILES_DIR = path.join(STORAGE_ROOT, "profiles");
const ANALYSES_DIR = path.join(STORAGE_ROOT, "analyses");
const CASES_DIR = path.join(STORAGE_ROOT, "cases");
const REPORTS_DIR = path.join(STORAGE_ROOT, "reports");

function ensureDirs() {
  [STORAGE_ROOT, PROFILES_DIR, ANALYSES_DIR, CASES_DIR, REPORTS_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// In-memory cache for ultra-fast access
const profilesCache = new Map<string, PipelineProfileRecord>();
const userToProfileMap = new Map<string, string>();
const analysesCache = new Map<string, PreliminaryAnalysis>();
const casesCache = new Map<string, PipelineCaseRecord>();
const reportsCache = new Map<string, PipelineReportRecord>();

type PipelineEventInput = {
  caseId: string;
  actorId: string;
  actorRole: Role;
  type: EventType;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  note?: string | null;
};

async function appendPipelineEvent(input: PipelineEventInput): Promise<CaseEvent> {
  const caseRecord = casesCache.get(input.caseId);
  const latestUserReport = Array.from(reportsCache.values())
    .filter((report) => report.caseId === input.caseId && report.kind === "USER" && !report.supersededBy)
    .sort((left, right) => right.version - left.version)[0];

  return appendCaseEvent({
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
}

// Hydrate from disk on module load
try {
  ensureDirs();
  // Hydrate profiles
  const profileFiles = fs.readdirSync(PROFILES_DIR);
  for (const file of profileFiles) {
    if (file.endsWith(".json")) {
      const content = fs.readFileSync(path.join(PROFILES_DIR, file), "utf-8");
      const record = JSON.parse(content) as PipelineProfileRecord;
      profilesCache.set(record.id, record);
      userToProfileMap.set(record.userId, record.id);
    }
  }

  // Hydrate analyses
  const analysisFiles = fs.readdirSync(ANALYSES_DIR);
  for (const file of analysisFiles) {
    if (file.endsWith(".json")) {
      const content = fs.readFileSync(path.join(ANALYSES_DIR, file), "utf-8");
      const record = JSON.parse(content) as PreliminaryAnalysis;
      analysesCache.set(path.basename(file, ".json"), record);
    }
  }

  // Hydrate cases
  const caseFiles = fs.readdirSync(CASES_DIR);
  for (const file of caseFiles) {
    if (file.endsWith(".json")) {
      const content = fs.readFileSync(path.join(CASES_DIR, file), "utf-8");
      const record = JSON.parse(content) as PipelineCaseRecord;
      casesCache.set(record.id, record);
    }
  }

  // Hydrate reports
  const reportFiles = fs.readdirSync(REPORTS_DIR);
  for (const file of reportFiles) {
    if (file.endsWith(".json")) {
      const content = fs.readFileSync(path.join(REPORTS_DIR, file), "utf-8");
      const record = JSON.parse(content) as PipelineReportRecord;
      reportsCache.set(record.id, record);
    }
  }
} catch (err) {
  console.warn("Pipeline storage hydration error:", err);
}

export const pipelineRepository = {
  // Profiles
  async saveProfile(profile: PipelineProfileRecord): Promise<PipelineProfileRecord> {
    ensureDirs();
    profilesCache.set(profile.id, profile);
    userToProfileMap.set(profile.userId, profile.id);
    fs.writeFileSync(path.join(PROFILES_DIR, `${profile.id}.json`), JSON.stringify(profile, null, 2));
    return profile;
  },

  async getProfileById(id: string): Promise<PipelineProfileRecord | null> {
    return profilesCache.get(id) || null;
  },

  async getProfileByUserId(userId: string): Promise<PipelineProfileRecord | null> {
    const profileId = userToProfileMap.get(userId);
    if (!profileId) {
      // Linear scan fallback
      for (const p of profilesCache.values()) {
        if (p.userId === userId) {
          userToProfileMap.set(userId, p.id);
          return p;
        }
      }
      return null;
    }
    return profilesCache.get(profileId) || null;
  },

  // Preliminary Analyses
  async savePreliminaryAnalysis(profileId: string, analysis: PreliminaryAnalysis): Promise<PreliminaryAnalysis> {
    ensureDirs();
    analysesCache.set(profileId, analysis);
    fs.writeFileSync(path.join(ANALYSES_DIR, `${profileId}.json`), JSON.stringify(analysis, null, 2));
    return analysis;
  },

  async getPreliminaryAnalysisByProfileId(profileId: string): Promise<PreliminaryAnalysis | null> {
    return analysesCache.get(profileId) || null;
  },

  // Cases
  async saveCase(caseRecord: PipelineCaseRecord): Promise<PipelineCaseRecord> {
    ensureDirs();
    casesCache.set(caseRecord.id, caseRecord);
    fs.writeFileSync(path.join(CASES_DIR, `${caseRecord.id}.json`), JSON.stringify(caseRecord, null, 2));
    return caseRecord;
  },

  async getCaseById(id: string): Promise<PipelineCaseRecord | null> {
    return casesCache.get(id) || null;
  },

  async listCases(filter?: {
    userId?: string;
    status?: CaseStatus;
    professionalId?: string;
  }): Promise<PipelineCaseRecord[]> {
    let results = Array.from(casesCache.values());
    if (filter?.userId) {
      results = results.filter((c) => c.userId === filter.userId);
    }
    if (filter?.status) {
      results = results.filter((c) => c.status === filter.status);
    }
    if (filter?.professionalId) {
      results = results.filter((c) => c.assignedProfessionalId === filter.professionalId || !c.assignedProfessionalId);
    }
    return results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  },

  // Reports
  async saveReport(report: PipelineReportRecord): Promise<PipelineReportRecord> {
    ensureDirs();
    reportsCache.set(report.id, report);
    fs.writeFileSync(path.join(REPORTS_DIR, `${report.id}.json`), JSON.stringify(report, null, 2));
    return report;
  },

  async getReportsByCaseId(caseId: string): Promise<PipelineReportRecord[]> {
    return Array.from(reportsCache.values())
      .filter((r) => r.caseId === caseId)
      .sort((a, b) => b.version - a.version);
  },

  async getLatestUserReport(caseId: string): Promise<PipelineReportRecord | null> {
    const list = Array.from(reportsCache.values())
      .filter((r) => r.caseId === caseId && r.kind === "USER" && !r.supersededBy)
      .sort((a, b) => b.version - a.version);
    return list[0] || null;
  },

  async getLatestProfessionalReport(caseId: string): Promise<PipelineReportRecord | null> {
    const list = Array.from(reportsCache.values())
      .filter((r) => r.caseId === caseId && r.kind === "PROFESSIONAL" && !r.supersededBy)
      .sort((a, b) => b.version - a.version);
    return list[0] || null;
  },

  async overrideSafetyGate(caseId: string, actorId: string, justification: string): Promise<void> {
    const c = await this.getCaseById(caseId);
    if (!c) throw new Error("Case not found");
    c.overrideJustification = justification;
    c.overrideActorId = actorId;
    c.updatedAt = new Date().toISOString();
    await this.saveCase(c);
  },

  async hasSafetyGateOverride(caseId: string): Promise<boolean> {
    const c = await this.getCaseById(caseId);
    return Boolean(c?.overrideJustification && c?.overrideJustification.trim().length > 0);
  },

  // Audit Events
  appendEvent: appendPipelineEvent,
  getEvents: getCaseEvents,
};
