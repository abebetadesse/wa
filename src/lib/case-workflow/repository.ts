import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { caseCauses, caseSessions, caseSolutions } from "@/lib/db/schema";
import type { CaseSession, Cause, Solution } from "./engine";

const WORKFLOW_KEY = "__caseWorkflow";

type StoredAnswers = Record<string, unknown> & {
  [WORKFLOW_KEY]?: {
    causes: Cause[];
    solutions: Solution[];
    reportConfirmed: boolean;
    selectedSolutionIds: string[];
    workflowContext?: CaseSession["workflowContext"];
  };
};

export async function persistCaseSession(session: CaseSession) {
  const answers: StoredAnswers = {
    ...session.answers,
    [WORKFLOW_KEY]: {
      causes: session.causes,
      solutions: session.solutions,
      reportConfirmed: session.reportConfirmed,
      selectedSolutionIds: session.selectedSolutionIds,
      workflowContext: session.workflowContext,
    },
  };

  await db.insert(caseSessions).values({
    id: session.id,
    userId: session.userId || null,
    caseId: session.caseId,
    answers,
    activeSpecializedPath: session.activeSpecializedPath || null,
    currentStep: session.currentStep,
    createdAt: new Date(session.createdAt),
    lastUpdated: new Date(session.lastUpdated),
  }).onConflictDoUpdate({
    target: caseSessions.id,
    set: { answers, activeSpecializedPath: session.activeSpecializedPath || null, currentStep: session.currentStep, lastUpdated: new Date(session.lastUpdated) },
  });

  await db.delete(caseCauses).where(eq(caseCauses.sessionId, session.id));
  if (session.causes.length) {
    await db.insert(caseCauses).values(session.causes.map((cause) => ({
      sessionId: session.id,
      description: cause.description,
      confidence: Math.round(cause.confidence * 100),
      evidence: cause.evidence,
      category: cause.category,
      isSelected: cause.isSelected,
    })));
  }

  await db.delete(caseSolutions).where(eq(caseSolutions.sessionId, session.id));
  if (session.solutions.length) {
    await db.insert(caseSolutions).values(session.solutions.map((solution) => ({
      sessionId: session.id,
      title: solution.title,
      section: solution.section,
      description: solution.description,
      steps: solution.steps,
      confidence: Math.round(solution.confidence * 100),
      basedOnCauses: solution.basedOnCauses,
      knowledgeReferences: solution.knowledgeReferences,
    })));
  }

  return session;
}

export async function loadCaseSession(sessionId: string, userId: string) {
  const [stored] = await db.select().from(caseSessions).where(and(eq(caseSessions.id, sessionId), eq(caseSessions.userId, userId))).limit(1);
  if (!stored) return undefined;
  const storedAnswers = (stored.answers || {}) as StoredAnswers;
  const workflow = storedAnswers[WORKFLOW_KEY];
  const { [WORKFLOW_KEY]: _ignored, ...answers } = storedAnswers;
  const [storedCauses, storedSolutions] = await Promise.all([
    db.select().from(caseCauses).where(eq(caseCauses.sessionId, sessionId)),
    db.select().from(caseSolutions).where(eq(caseSolutions.sessionId, sessionId)),
  ]);
  const session: CaseSession = {
    id: stored.id,
    caseId: stored.caseId,
    userId: stored.userId || undefined,
    answers,
    activeSpecializedPath: stored.activeSpecializedPath || undefined,
    currentStep: stored.currentStep as CaseSession["currentStep"],
    causes: workflow?.causes || storedCauses.map((cause) => ({ id: cause.id, description: cause.description, confidence: cause.confidence / 100, evidence: Array.isArray(cause.evidence) ? cause.evidence as string[] : [], category: cause.category, isSelected: cause.isSelected, relatedCauses: [] })),
    solutions: workflow?.solutions || storedSolutions.map((solution) => ({ id: solution.id, title: solution.title, section: solution.section as Solution["section"], description: solution.description, steps: Array.isArray(solution.steps) ? solution.steps as string[] : [], confidence: solution.confidence / 100, basedOnCauses: Array.isArray(solution.basedOnCauses) ? solution.basedOnCauses as string[] : [], knowledgeReferences: Array.isArray(solution.knowledgeReferences) ? solution.knowledgeReferences as string[] : [] })),
    reportConfirmed: workflow?.reportConfirmed ?? (stored.currentStep !== "reportReview" && stored.currentStep !== "specialized" && stored.currentStep !== "common"),
    selectedSolutionIds: workflow?.selectedSolutionIds || [],
    workflowContext: workflow?.workflowContext,
    createdAt: stored.createdAt.toISOString(),
    lastUpdated: stored.lastUpdated.toISOString(),
  };
  return session;
}
