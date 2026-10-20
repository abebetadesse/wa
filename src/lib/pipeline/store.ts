import { and, asc, desc, eq, isNull, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  pipelineCaseEvents,
  pipelineCases,
  pipelinePreliminaryAnalyses,
  pipelineProfiles,
  pipelineReports,
  users,
} from "@/lib/db/schema";
import { decryptRestrictedField, encryptRestrictedField } from "@/lib/security/encryption";
import type { PreliminaryAnalysis } from "../evaluation/profileEvaluator";
import type { CaseEvent, CaseStatus, Role, EventType } from "./types";
import type { PipelineCaseRecord, PipelineProfileRecord, PipelineReportRecord } from "./repository";

export interface PipelineCaseFilter {
  userId?: string;
  status?: CaseStatus;
  /** Cases assigned to this professional, plus cases not yet assigned to anyone. */
  professionalId?: string;
}

/**
 * Where the professional-review pipeline keeps its records. Profiles, analyses, cases and reports
 * are saved whole (insert or replace); events are insert-only and never change once written.
 */
export interface PipelineStore {
  saveProfile(profile: PipelineProfileRecord): Promise<void>;
  getProfile(id: string): Promise<PipelineProfileRecord | null>;
  /** The most recently saved profile of a user. */
  getLatestProfileForUser(userId: string): Promise<PipelineProfileRecord | null>;
  saveAnalysis(profileId: string, analysis: PreliminaryAnalysis): Promise<void>;
  getAnalysis(profileId: string): Promise<PreliminaryAnalysis | null>;
  saveCase(record: PipelineCaseRecord): Promise<void>;
  getCase(id: string): Promise<PipelineCaseRecord | null>;
  /** Newest submission first. */
  listCases(filter?: PipelineCaseFilter): Promise<PipelineCaseRecord[]>;
  saveReport(report: PipelineReportRecord): Promise<void>;
  /** Highest version first. */
  listReports(caseId: string): Promise<PipelineReportRecord[]>;
  /** Fails when an event with the same id already exists. */
  insertEvent(event: CaseEvent): Promise<void>;
  /** In the order the events were written. */
  listEvents(caseId: string): Promise<CaseEvent[]>;
}

// ─── Rows ─────────────────────────────────────────────────────────────────────

type ProfileRow = typeof pipelineProfiles.$inferSelect;
type AnalysisRow = typeof pipelinePreliminaryAnalyses.$inferSelect;
type CaseRow = typeof pipelineCases.$inferSelect;
type ReportRow = typeof pipelineReports.$inferSelect;
type EventRow = typeof pipelineCaseEvents.$inferSelect;

const iso = (value: Date | string) => (value instanceof Date ? value.toISOString() : new Date(value).toISOString());
const isoOrUndefined = (value: Date | string | null) => (value === null ? undefined : iso(value));
const dateOrNull = (value: string | undefined) => (value ? new Date(value) : null);
const orUndefined = <T>(value: T | null) => (value === null ? undefined : value);
/** Leaves out unset optional fields, so a record reads back exactly as it was saved. */
const compact = <T extends object>(record: T): T => Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined)) as T;

/** Medication, allergy and condition lists are Restricted data: encrypted before they reach the database. */
function sealList(value: unknown[]) {
  return encryptRestrictedField(value);
}

function openList<T>(value: unknown, field: string): T[] {
  const opened = decryptRestrictedField<unknown>(value);
  if (!Array.isArray(opened)) throw new Error(`Pipeline profile field ${field} could not be decrypted.`);
  return opened as T[];
}

export function toProfileRow(profile: PipelineProfileRecord, accountId: string | null) {
  return {
    id: profile.id,
    userId: accountId,
    userIdString: profile.userId,
    ageBand: profile.ageBand,
    sex: profile.sex,
    pregnancyStatus: profile.pregnancyStatus ?? null,
    chronicConditions: sealList(profile.chronicConditions),
    currentMeds: sealList(profile.currentMeds),
    allergies: sealList(profile.allergies),
    traditionalUse: profile.traditionalUse,
    diet: profile.diet,
    substanceUse: profile.substanceUse,
    location: profile.location,
    spiritualContext: profile.spiritualContext ?? null,
    culturalContext: profile.culturalContext ?? null,
    consent: profile.consent,
    submittedAt: new Date(profile.submittedAt),
    updatedAt: new Date(profile.updatedAt),
  };
}

export function fromProfileRow(row: ProfileRow): PipelineProfileRecord {
  return compact({
    id: row.id,
    userId: row.userIdString,
    ageBand: row.ageBand,
    sex: row.sex,
    pregnancyStatus: orUndefined(row.pregnancyStatus),
    chronicConditions: openList(row.chronicConditions, "chronicConditions"),
    currentMeds: openList(row.currentMeds, "currentMeds"),
    allergies: openList(row.allergies, "allergies"),
    traditionalUse: (row.traditionalUse ?? []) as PipelineProfileRecord["traditionalUse"],
    diet: (row.diet ?? {}) as PipelineProfileRecord["diet"],
    substanceUse: (row.substanceUse ?? {}) as PipelineProfileRecord["substanceUse"],
    location: row.location as PipelineProfileRecord["location"],
    spiritualContext: orUndefined(row.spiritualContext),
    culturalContext: orUndefined(row.culturalContext),
    consent: row.consent as PipelineProfileRecord["consent"],
    submittedAt: iso(row.submittedAt),
    updatedAt: iso(row.updatedAt),
  });
}

type AnalysisSections = Omit<PreliminaryAnalysis, "profileId" | "locationSummary" | "confidence" | "generatedAt">;

function toAnalysisRow(profileId: string, analysis: PreliminaryAnalysis) {
  const { profileId: _profileId, locationSummary, confidence, generatedAt, ...sections } = analysis;
  return {
    id: profileId,
    profileId,
    locationCtx: locationSummary,
    sections: sections satisfies AnalysisSections,
    confidence,
    generatedAt: new Date(generatedAt),
  };
}

function fromAnalysisRow(row: AnalysisRow): PreliminaryAnalysis {
  const sections = row.sections as AnalysisSections;
  return {
    ...sections,
    profileId: row.profileId,
    locationSummary: row.locationCtx as PreliminaryAnalysis["locationSummary"],
    confidence: row.confidence as PreliminaryAnalysis["confidence"],
    generatedAt: iso(row.generatedAt),
  };
}

function toCaseRow(record: PipelineCaseRecord) {
  return {
    id: record.id,
    userId: record.userId,
    profileId: record.profileId,
    narrative: record.narrative,
    symptoms: record.symptoms,
    duration: record.duration,
    selfTreatments: record.selfTreatments,
    attachments: record.attachments,
    emergencyDetected: record.emergencyDetected ?? false,
    emergencySignals: record.emergencySignals ?? [],
    emergencyRoutedAt: dateOrNull(record.emergencyRoutedAt),
    status: record.status,
    assignedProfessionalId: record.assignedProfessionalId ?? null,
    overrideJustification: record.overrideJustification ?? null,
    overrideActorId: record.overrideActorId ?? null,
    submittedAt: new Date(record.submittedAt),
    updatedAt: new Date(record.updatedAt),
  };
}

function fromCaseRow(row: CaseRow): PipelineCaseRecord {
  return compact({
    id: row.id,
    userId: row.userId,
    profileId: row.profileId,
    narrative: row.narrative,
    symptoms: (row.symptoms ?? []) as string[],
    duration: row.duration,
    selfTreatments: (row.selfTreatments ?? []) as string[],
    attachments: (row.attachments ?? []) as string[],
    emergencyDetected: row.emergencyDetected,
    emergencySignals: (row.emergencySignals ?? []) as string[],
    emergencyRoutedAt: isoOrUndefined(row.emergencyRoutedAt),
    status: row.status as CaseStatus,
    assignedProfessionalId: orUndefined(row.assignedProfessionalId),
    overrideJustification: orUndefined(row.overrideJustification),
    overrideActorId: orUndefined(row.overrideActorId),
    submittedAt: iso(row.submittedAt),
    updatedAt: iso(row.updatedAt),
  });
}

function toReportRow(report: PipelineReportRecord) {
  return {
    id: report.id,
    caseId: report.caseId,
    kind: report.kind,
    version: report.version,
    payload: report.payload,
    safetyGate: report.safetyGate ?? null,
    confidence: report.confidence,
    provenance: report.provenance,
    authoredBy: report.authoredBy ?? null,
    approvedBy: report.approvedBy ?? null,
    approvedAt: dateOrNull(report.approvedAt),
    publishedAt: dateOrNull(report.publishedAt),
    supersededBy: report.supersededBy ?? null,
    createdAt: new Date(report.createdAt),
  };
}

function fromReportRow(row: ReportRow): PipelineReportRecord {
  return compact({
    id: row.id,
    caseId: row.caseId,
    kind: row.kind as PipelineReportRecord["kind"],
    version: row.version,
    payload: row.payload as PipelineReportRecord["payload"],
    safetyGate: orUndefined(row.safetyGate),
    confidence: row.confidence as PipelineReportRecord["confidence"],
    provenance: (row.provenance ?? []) as unknown[],
    authoredBy: orUndefined(row.authoredBy),
    approvedBy: orUndefined(row.approvedBy),
    approvedAt: isoOrUndefined(row.approvedAt),
    publishedAt: isoOrUndefined(row.publishedAt),
    supersededBy: orUndefined(row.supersededBy),
    createdAt: iso(row.createdAt),
  });
}

function fromEventRow(row: EventRow): CaseEvent {
  return {
    id: row.id,
    caseId: row.caseId,
    actorId: row.actorId,
    actorRole: row.actorRole as Role,
    type: row.type as EventType,
    before: (row.before ?? null) as CaseEvent["before"],
    after: (row.after ?? null) as CaseEvent["after"],
    note: row.note,
    at: iso(row.at),
  };
}

// ─── MySQL ────────────────────────────────────────────────────────────────────

/** The account id to link a profile to, so deleting the account deletes the profile with it. */
async function accountIdFor(userId: string): Promise<string | null> {
  if (userId.length > 36) return null;
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  return row?.id ?? null;
}

export const dbPipelineStore: PipelineStore = {
  async saveProfile(profile) {
    const { id, ...changes } = toProfileRow(profile, await accountIdFor(profile.userId));
    await db.insert(pipelineProfiles).values({ id, ...changes }).onDuplicateKeyUpdate({ set: changes });
  },
  async getProfile(id) {
    const [row] = await db.select().from(pipelineProfiles).where(eq(pipelineProfiles.id, id)).limit(1);
    return row ? fromProfileRow(row) : null;
  },
  async getLatestProfileForUser(userId) {
    const [row] = await db
      .select()
      .from(pipelineProfiles)
      .where(eq(pipelineProfiles.userIdString, userId))
      .orderBy(desc(pipelineProfiles.updatedAt), desc(pipelineProfiles.submittedAt))
      .limit(1);
    return row ? fromProfileRow(row) : null;
  },
  async saveAnalysis(profileId, analysis) {
    const { id, ...changes } = toAnalysisRow(profileId, analysis);
    await db.insert(pipelinePreliminaryAnalyses).values({ id, ...changes }).onDuplicateKeyUpdate({ set: changes });
  },
  async getAnalysis(profileId) {
    const [row] = await db.select().from(pipelinePreliminaryAnalyses).where(eq(pipelinePreliminaryAnalyses.profileId, profileId)).limit(1);
    return row ? fromAnalysisRow(row) : null;
  },
  async saveCase(record) {
    const { id, ...changes } = toCaseRow(record);
    await db.insert(pipelineCases).values({ id, ...changes }).onDuplicateKeyUpdate({ set: changes });
  },
  async getCase(id) {
    const [row] = await db.select().from(pipelineCases).where(eq(pipelineCases.id, id)).limit(1);
    return row ? fromCaseRow(row) : null;
  },
  async listCases(filter = {}) {
    const conditions: SQL[] = [];
    if (filter.userId) conditions.push(eq(pipelineCases.userId, filter.userId));
    if (filter.status) conditions.push(eq(pipelineCases.status, filter.status));
    if (filter.professionalId) {
      conditions.push(or(eq(pipelineCases.assignedProfessionalId, filter.professionalId), isNull(pipelineCases.assignedProfessionalId))!);
    }
    const rows = await db
      .select()
      .from(pipelineCases)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(pipelineCases.submittedAt));
    return rows.map(fromCaseRow);
  },
  async saveReport(report) {
    const { id, ...changes } = toReportRow(report);
    await db.insert(pipelineReports).values({ id, ...changes }).onDuplicateKeyUpdate({ set: changes });
  },
  async listReports(caseId) {
    const rows = await db.select().from(pipelineReports).where(eq(pipelineReports.caseId, caseId)).orderBy(desc(pipelineReports.version));
    return rows.map(fromReportRow);
  },
  async insertEvent(event) {
    await db.insert(pipelineCaseEvents).values({
      id: event.id,
      caseId: event.caseId,
      actorId: event.actorId,
      actorRole: event.actorRole,
      type: event.type,
      before: event.before ?? null,
      after: event.after ?? null,
      note: event.note ?? null,
      at: new Date(event.at),
    });
  },
  async listEvents(caseId) {
    const rows = await db.select().from(pipelineCaseEvents).where(eq(pipelineCaseEvents.caseId, caseId)).orderBy(asc(pipelineCaseEvents.seq));
    return rows.map(fromEventRow);
  },
};

// ─── Memory ───────────────────────────────────────────────────────────────────

/** In-memory store for tests and local experiments. */
export function createMemoryPipelineStore(): PipelineStore {
  const profiles = new Map<string, PipelineProfileRecord>();
  const analyses = new Map<string, PreliminaryAnalysis>();
  const cases = new Map<string, PipelineCaseRecord>();
  const reports = new Map<string, PipelineReportRecord>();
  const events: CaseEvent[] = [];
  const clone = <T>(value: T): T => structuredClone(value);
  const time = (value: string) => new Date(value).getTime();
  return {
    async saveProfile(profile) {
      profiles.set(profile.id, clone(profile));
    },
    async getProfile(id) {
      const profile = profiles.get(id);
      return profile ? clone(profile) : null;
    },
    async getLatestProfileForUser(userId) {
      const [latest] = [...profiles.values()]
        .filter((profile) => profile.userId === userId)
        .sort((a, b) => time(b.updatedAt) - time(a.updatedAt) || time(b.submittedAt) - time(a.submittedAt));
      return latest ? clone(latest) : null;
    },
    async saveAnalysis(profileId, analysis) {
      analyses.set(profileId, clone({ ...analysis, profileId }));
    },
    async getAnalysis(profileId) {
      const analysis = analyses.get(profileId);
      return analysis ? clone(analysis) : null;
    },
    async saveCase(record) {
      cases.set(record.id, clone(record));
    },
    async getCase(id) {
      const record = cases.get(id);
      return record ? clone(record) : null;
    },
    async listCases(filter = {}) {
      return [...cases.values()]
        .filter((record) => !filter.userId || record.userId === filter.userId)
        .filter((record) => !filter.status || record.status === filter.status)
        .filter((record) => !filter.professionalId || !record.assignedProfessionalId || record.assignedProfessionalId === filter.professionalId)
        .sort((a, b) => time(b.submittedAt) - time(a.submittedAt))
        .map(clone);
    },
    async saveReport(report) {
      reports.set(report.id, clone(report));
    },
    async listReports(caseId) {
      return [...reports.values()]
        .filter((report) => report.caseId === caseId)
        .sort((a, b) => b.version - a.version)
        .map(clone);
    },
    async insertEvent(event) {
      if (events.some((existing) => existing.id === event.id)) throw new Error(`Pipeline event ${event.id} already exists.`);
      events.push(clone(event));
    },
    async listEvents(caseId) {
      return events.filter((event) => event.caseId === caseId).map(clone);
    },
  };
}
