import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { workflowCases } from "@/lib/db/schema";
import type { WorkflowCase, WorkflowDomain, WorkflowStage } from "./types";

export interface CaseStore {
  get(id: string): Promise<WorkflowCase | null>;
  listByUser(userId: string): Promise<WorkflowCase[]>;
  listForReview(filter: { domains: WorkflowDomain[]; stages: WorkflowStage[]; reviewerId?: string }): Promise<WorkflowCase[]>;
  insert(record: WorkflowCase): Promise<void>;
  save(record: WorkflowCase): Promise<void>;
}

type Row = typeof workflowCases.$inferSelect;

const iso = (value: Date | string) => (value instanceof Date ? value.toISOString() : new Date(value).toISOString());

function fromRow(row: Row): WorkflowCase {
  return {
    id: row.id,
    userId: row.userId,
    domain: row.domain as WorkflowDomain,
    stage: row.stage as WorkflowStage,
    safetyAnswers: (row.safetyAnswers ?? {}) as WorkflowCase["safetyAnswers"],
    safety: row.safety as WorkflowCase["safety"],
    answers: (row.answers ?? {}) as WorkflowCase["answers"],
    context: (row.context ?? {}) as WorkflowCase["context"],
    draft: (row.draft ?? null) as WorkflowCase["draft"],
    review: (row.review ?? null) as WorkflowCase["review"],
    payment: (row.payment ?? null) as WorkflowCase["payment"],
    consultation: (row.consultation ?? null) as WorkflowCase["consultation"],
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

function toRow(record: WorkflowCase) {
  return {
    id: record.id,
    userId: record.userId,
    domain: record.domain,
    stage: record.stage,
    reviewerId: record.review?.expertId ?? null,
    safetyAnswers: record.safetyAnswers,
    safety: record.safety,
    answers: record.answers,
    context: record.context,
    draft: record.draft,
    review: record.review,
    payment: record.payment,
    consultation: record.consultation,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  };
}

export const dbCaseStore: CaseStore = {
  async get(id) {
    const [row] = await db.select().from(workflowCases).where(eq(workflowCases.id, id)).limit(1);
    return row ? fromRow(row) : null;
  },
  async listByUser(userId) {
    const rows = await db.select().from(workflowCases).where(eq(workflowCases.userId, userId)).orderBy(desc(workflowCases.updatedAt));
    return rows.map(fromRow);
  },
  async listForReview({ domains, stages, reviewerId }) {
    if (!domains.length || !stages.length) return [];
    const conditions = [inArray(workflowCases.domain, domains), inArray(workflowCases.stage, stages)];
    if (reviewerId) conditions.push(eq(workflowCases.reviewerId, reviewerId));
    const rows = await db.select().from(workflowCases).where(and(...conditions)).orderBy(workflowCases.createdAt);
    return rows.map(fromRow);
  },
  async insert(record) {
    await db.insert(workflowCases).values(toRow(record));
  },
  async save(record) {
    const { id, createdAt: _createdAt, userId: _userId, ...changes } = toRow(record);
    await db.update(workflowCases).set(changes).where(eq(workflowCases.id, id));
  },
};

/** In-memory store for tests and local experiments. */
export function createMemoryCaseStore(): CaseStore {
  const records = new Map<string, WorkflowCase>();
  const clone = (record: WorkflowCase) => structuredClone(record);
  return {
    async get(id) {
      const record = records.get(id);
      return record ? clone(record) : null;
    },
    async listByUser(userId) {
      return [...records.values()].filter((record) => record.userId === userId).map(clone);
    },
    async listForReview({ domains, stages, reviewerId }) {
      return [...records.values()]
        .filter((record) => domains.includes(record.domain) && stages.includes(record.stage))
        .filter((record) => !reviewerId || record.review?.expertId === reviewerId)
        .map(clone);
    },
    async insert(record) {
      records.set(record.id, clone(record));
    },
    async save(record) {
      records.set(record.id, clone(record));
    },
  };
}
