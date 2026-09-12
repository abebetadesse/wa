import { evaluateCareerSafetyScreen, type CareerSafetyAnswers, type CareerSafetyResult } from "./careerSafetyScreen";
import { buildCareerProfile, getCareerQuestions, type CareerQuestion } from "./careerQuestionEngine";
import { calculateTimingWindows, type CareerProfile } from "@/lib/cultural/careerTimingEngine";
import { assignCareerAdvisor, buildCareerReportShell, getAvailableAdvisors } from "./careerExpertEngine";

export type CareerWorkflowStage =
  | "safety_screen"
  | "foundation"
  | "stage_specific"
  | "timing"
  | "expert_review_pending"
  | "visible_to_user"
  | "full_report_released"
  | "consultation_booked"
  | "crisis_routed";

export interface CareerWorkflowSession {
  id: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  stage: CareerWorkflowStage;
  safetyAnswers?: CareerSafetyAnswers;
  safetyResult?: CareerSafetyResult;
  answers: Record<string, string>;
  profile?: CareerProfile;
  questions: CareerQuestion[];
  timingAnalysis?: ReturnType<typeof calculateTimingWindows>;
  expertAssignment?: ReturnType<typeof assignCareerAdvisor>;
  report?: ReturnType<typeof buildCareerReportShell>;
  paymentConfirmed: boolean;
  consultation?: {
    booked: boolean;
    format: "video" | "voice" | "chat" | "in_person";
    feeEtb: number;
    scheduledFor?: string;
  };
}

const careerSessions = new Map<string, CareerWorkflowSession>();

export function startCareerCase(input: {
  userId?: string;
  safetyAnswers: CareerSafetyAnswers;
  answers?: Record<string, string>;
}): CareerWorkflowSession {
  const now = new Date().toISOString();
  const safetyResult = evaluateCareerSafetyScreen(input.safetyAnswers);
  const id = globalThis.crypto && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `career-${Date.now()}`;

  const session: CareerWorkflowSession = {
    id,
    userId: input.userId,
    createdAt: now,
    updatedAt: now,
    stage: safetyResult.action === "crisis_route" ? "crisis_routed" : "foundation",
    safetyAnswers: input.safetyAnswers,
    safetyResult,
    answers: input.answers ?? {},
    questions: safetyResult.action === "crisis_route" ? [] : getCareerQuestions("exploring"),
    paymentConfirmed: false,
  };

  careerSessions.set(id, session);
  return session;
}

export function getCareerCase(caseId: string, userId?: string): CareerWorkflowSession | undefined {
  const session = careerSessions.get(caseId);
  if (!session) return undefined;
  if (userId && session.userId && session.userId !== userId) return undefined;
  return session;
}

export function updateCareerCase(
  caseId: string,
  answers: Record<string, string>,
  userId?: string
): CareerWorkflowSession | undefined {
  const session = getCareerCase(caseId, userId);
  if (!session) return undefined;

  session.answers = { ...session.answers, ...answers };
  session.profile = buildCareerProfile(session.answers);
  session.stage = "stage_specific";
  session.questions = getCareerQuestions(session.profile.careerStage);
  session.updatedAt = new Date().toISOString();

  careerSessions.set(caseId, session);
  return session;
}

export function analyzeCareerCase(caseId: string, userId?: string): CareerWorkflowSession | undefined {
  const session = getCareerCase(caseId, userId);
  if (!session) return undefined;

  if (!session.profile) {
    session.profile = buildCareerProfile(session.answers);
  }

  const timingAnalysis = calculateTimingWindows(session.profile);
  const assignment = assignCareerAdvisor(session.profile, {
    needsFinancialAdvisor: Boolean(session.answers["neg_type"] || session.answers["biz_start_funding"] || session.answers["scale_partner_interest"] || session.answers["trans_bridge"]),
  });

  session.timingAnalysis = timingAnalysis;
  session.expertAssignment = assignment ?? null;
  session.stage = assignment ? "expert_review_pending" : "visible_to_user";
  session.report = assignment ? buildCareerReportShell(caseId, session.profile, assignment) : undefined;
  session.updatedAt = new Date().toISOString();

  careerSessions.set(caseId, session);
  return session;
}

export function purchaseCareerReport(caseId: string, userId?: string): CareerWorkflowSession | undefined {
  const session = getCareerCase(caseId, userId);
  if (!session) return undefined;

  session.paymentConfirmed = true;
  session.stage = "full_report_released";
  session.updatedAt = new Date().toISOString();

  careerSessions.set(caseId, session);
  return session;
}

export function bookCareerConsult(
  caseId: string,
  format: "video" | "voice" | "chat" | "in_person",
  userId?: string
): CareerWorkflowSession | undefined {
  const session = getCareerCase(caseId, userId);
  if (!session) return undefined;

  session.consultation = {
    booked: true,
    format,
    feeEtb: 1200,
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
  };
  session.stage = "consultation_booked";
  session.updatedAt = new Date().toISOString();

  careerSessions.set(caseId, session);
  return session;
}

export function getAvailableCareerAdvisors() {
  return getAvailableAdvisors();
}

export function evaluateAndStartCareerCase(input: {
  userId?: string;
  safetyAnswers: CareerSafetyAnswers;
  answers?: Record<string, string>;
}): CareerWorkflowSession {
  const session = startCareerCase(input);
  if (session.stage === "crisis_routed") return session;

  if (input.answers && Object.keys(input.answers).length > 0) {
    session.answers = { ...session.answers, ...input.answers };
    session.profile = buildCareerProfile(session.answers);
    session.stage = "foundation";
    session.questions = getCareerQuestions("exploring");
    session.updatedAt = new Date().toISOString();
    careerSessions.set(session.id, session);
  }

  return getCareerCase(session.id, session.userId) ?? session;
}
