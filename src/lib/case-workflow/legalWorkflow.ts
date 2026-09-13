import { evaluateLegalSafetyScreen, type LegalSafetyAnswers, type LegalSafetyResult } from "./legalSafetyScreen";
import { getLegalQuestions, type LegalQuestion } from "./legalQuestionEngine";
import { startLegalCase, submitLegalCase, purchaseLegalReport, bookLegalConsult, getLegalCase } from "./legalExpertEngine";

export type LegalWorkflowStage =
  | "safety_screen"
  | "intake"
  | "matter"
  | "expert_review_pending"
  | "legal_aid_route"
  | "visible_to_user"
  | "full_report_released"
  | "consultation_booked"
  | "crisis_routed";

export interface LegalWorkflowSession {
  id: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  stage: LegalWorkflowStage;
  safetyAnswers?: LegalSafetyAnswers;
  safetyResult?: LegalSafetyResult;
  answers: Record<string, unknown>;
  questions: LegalQuestion[];
  paymentConfirmed: boolean;
  consultation?: {
    booked: boolean;
    format: "video" | "voice" | "chat" | "in_person";
    feeEtb: number;
    scheduledFor?: string;
  };
}

const legalSessions = new Map<string, LegalWorkflowSession>();

export function startLegalWorkflow(input: {
  userId?: string;
  safetyAnswers: LegalSafetyAnswers;
  answers?: Record<string, unknown>;
}): LegalWorkflowSession {
  const now = new Date().toISOString();
  const safetyResult = evaluateLegalSafetyScreen(input.safetyAnswers);
  const id = globalThis.crypto && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `legal-workflow-${Date.now()}`;

  const session: LegalWorkflowSession = {
    id,
    userId: input.userId,
    createdAt: now,
    updatedAt: now,
    stage: safetyResult.action === "crisis_route" ? "crisis_routed" : "intake",
    safetyAnswers: input.safetyAnswers,
    safetyResult,
    answers: input.answers || {},
    questions: safetyResult.action === "crisis_route" ? [] : getLegalQuestions("intake"),
    paymentConfirmed: false,
  };

  legalSessions.set(id, session);
  return session;
}

export function getLegalWorkflowSession(caseId: string, userId?: string): LegalWorkflowSession | undefined {
  const session = legalSessions.get(caseId);
  if (!session) return undefined;
  if (userId && session.userId && session.userId !== userId) return undefined;
  return session;
}

export function updateLegalWorkflowSession(
  caseId: string,
  answers: Record<string, unknown>,
  userId?: string
): LegalWorkflowSession | undefined {
  const session = getLegalWorkflowSession(caseId, userId);
  if (!session) return undefined;

  session.answers = { ...session.answers, ...answers };
  session.stage = "matter";
  session.questions = getLegalQuestions("matter");
  session.updatedAt = new Date().toISOString();

  legalSessions.set(caseId, session);
  return session;
}

export function analyzeLegalWorkflowSession(caseId: string, userId?: string): LegalWorkflowSession | undefined {
  const session = getLegalWorkflowSession(caseId, userId);
  if (!session) return undefined;

  const legalCase = startLegalCase({
    userId: session.userId,
    jurisdiction: String(session.answers.jurisdiction || "unknown"),
    answers: session.answers,
    safetyResult: session.safetyResult,
  });

  const submitted = submitLegalCase(legalCase.id, session.answers, session.userId);
  session.stage = submitted?.status === "legal_aid_route" ? "legal_aid_route" : "expert_review_pending";
  session.updatedAt = new Date().toISOString();

  legalSessions.set(caseId, session);
  return session;
}

export function completeLegalWorkflowPurchase(caseId: string, userId?: string): LegalWorkflowSession | undefined {
  const session = getLegalWorkflowSession(caseId, userId);
  if (!session) return undefined;

  session.paymentConfirmed = true;
  session.stage = "full_report_released";
  session.updatedAt = new Date().toISOString();

  legalSessions.set(caseId, session);
  return session;
}

export function bookLegalWorkflowConsult(
  caseId: string,
  format: "video" | "voice" | "chat" | "in_person",
  userId?: string
): LegalWorkflowSession | undefined {
  const session = getLegalWorkflowSession(caseId, userId);
  if (!session) return undefined;

  session.consultation = {
    booked: true,
    format,
    feeEtb: 1500,
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
  };
  session.stage = "consultation_booked";
  session.updatedAt = new Date().toISOString();

  legalSessions.set(caseId, session);
  return session;
}

export function evaluateAndStartLegalWorkflow(input: {
  userId?: string;
  safetyAnswers: LegalSafetyAnswers;
  answers?: Record<string, unknown>;
}): LegalWorkflowSession {
  const session = startLegalWorkflow(input);
  if (session.stage === "crisis_routed") return session;

  if (input.answers && Object.keys(input.answers).length > 0) {
    updateLegalWorkflowSession(session.id, input.answers, session.userId);
  }

  return getLegalWorkflowSession(session.id, session.userId) ?? session;
}
