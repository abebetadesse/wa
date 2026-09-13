import { evaluateSocialSafetyScreen, type SocialSafetyAnswers, type SocialSafetyResult } from "./socialSafetyScreen";
import { getSocialQuestions, type SocialQuestion } from "./socialQuestionEngine";
import { startSocialCase, submitSocialCase, purchaseSocialReport, bookSocialConsult, getSocialCase } from "./socialExpertEngine";

export type SocialWorkflowStage =
  | "safety_screen"
  | "intake"
  | "pattern"
  | "expert_review_pending"
  | "visible_to_user"
  | "full_report_released"
  | "consultation_booked"
  | "crisis_routed";

export interface SocialWorkflowSession {
  id: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  stage: SocialWorkflowStage;
  safetyAnswers?: SocialSafetyAnswers;
  safetyResult?: SocialSafetyResult;
  answers: Record<string, unknown>;
  questions: SocialQuestion[];
  paymentConfirmed: boolean;
  consultation?: {
    booked: boolean;
    format: "video" | "voice" | "chat" | "in_person";
    feeEtb: number;
    scheduledFor?: string;
  };
}

const socialSessions = new Map<string, SocialWorkflowSession>();

export function startSocialWorkflow(input: {
  userId?: string;
  safetyAnswers: SocialSafetyAnswers;
  answers?: Record<string, unknown>;
}): SocialWorkflowSession {
  const now = new Date().toISOString();
  const safetyResult = evaluateSocialSafetyScreen(input.safetyAnswers);
  const id = globalThis.crypto && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `social-workflow-${Date.now()}`;

  const session: SocialWorkflowSession = {
    id,
    userId: input.userId,
    createdAt: now,
    updatedAt: now,
    stage: safetyResult.action === "crisis_route" ? "crisis_routed" : "intake",
    safetyAnswers: input.safetyAnswers,
    safetyResult,
    answers: input.answers || {},
    questions: safetyResult.action === "crisis_route" ? [] : getSocialQuestions("intake"),
    paymentConfirmed: false,
  };

  socialSessions.set(id, session);
  return session;
}

export function getSocialWorkflowSession(caseId: string, userId?: string): SocialWorkflowSession | undefined {
  const session = socialSessions.get(caseId);
  if (!session) return undefined;
  if (userId && session.userId && session.userId !== userId) return undefined;
  return session;
}

export function updateSocialWorkflowSession(
  caseId: string,
  answers: Record<string, unknown>,
  userId?: string
): SocialWorkflowSession | undefined {
  const session = getSocialWorkflowSession(caseId, userId);
  if (!session) return undefined;

  session.answers = { ...session.answers, ...answers };
  session.stage = "pattern";
  session.questions = getSocialQuestions("pattern");
  session.updatedAt = new Date().toISOString();

  socialSessions.set(caseId, session);
  return session;
}

export function analyzeSocialWorkflowSession(caseId: string, userId?: string): SocialWorkflowSession | undefined {
  const session = getSocialWorkflowSession(caseId, userId);
  if (!session) return undefined;

  const socialCase = startSocialCase({
    userId: session.userId,
    answers: session.answers,
    safetyResult: session.safetyResult,
  });

  const submitted = submitSocialCase(socialCase.id, session.answers, session.userId);
  session.stage = submitted?.status === "pending_expert_review" ? "expert_review_pending" : "visible_to_user";
  session.updatedAt = new Date().toISOString();

  socialSessions.set(caseId, session);
  return session;
}

export function completeSocialWorkflowPurchase(caseId: string, userId?: string): SocialWorkflowSession | undefined {
  const session = getSocialWorkflowSession(caseId, userId);
  if (!session) return undefined;

  session.paymentConfirmed = true;
  session.stage = "full_report_released";
  session.updatedAt = new Date().toISOString();

  socialSessions.set(caseId, session);
  return session;
}

export function bookSocialWorkflowConsult(
  caseId: string,
  format: "video" | "voice" | "chat" | "in_person",
  userId?: string
): SocialWorkflowSession | undefined {
  const session = getSocialWorkflowSession(caseId, userId);
  if (!session) return undefined;

  session.consultation = {
    booked: true,
    format,
    feeEtb: 900,
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
  };
  session.stage = "consultation_booked";
  session.updatedAt = new Date().toISOString();

  socialSessions.set(caseId, session);
  return session;
}

export function evaluateAndStartSocialWorkflow(input: {
  userId?: string;
  safetyAnswers: SocialSafetyAnswers;
  answers?: Record<string, unknown>;
}): SocialWorkflowSession {
  const session = startSocialWorkflow(input);
  if (session.stage === "crisis_routed") return session;

  if (input.answers && Object.keys(input.answers).length > 0) {
    updateSocialWorkflowSession(session.id, input.answers, session.userId);
  }

  return getSocialWorkflowSession(session.id, session.userId) ?? session;
}
