export type SocialCaseStatus =
  | "case_received"
  | "intake_started"
  | "pending_expert_review"
  | "visible_to_user"
  | "full_report_released"
  | "consultation_booked"
  | "crisis_routed";

export interface SocialExpert {
  id: string;
  name: string;
  credential: string;
  specialization: string;
  languages: string[];
  rating: number;
  isAvailable: boolean;
}

export interface SocialCaseSession {
  id: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  status: SocialCaseStatus;
  issueType?: string;
  answers: Record<string, unknown>;
  safetyResult?: {
    action: string;
    expertFlag?: { reason: string; priority: string };
    crisisContent?: {
      title: string;
      message: string;
      hotlines: Array<{ name: string; number: string }>;
      safetyPlanSteps: string[];
    };
    supportContent?: {
      title: string;
      message: string;
      hotlines: Array<{ name: string; number: string }>;
      resources: string[];
    };
  };
  assignedExpert?: SocialExpert;
  report?: {
    title: string;
    summary: string;
    recommendations: string[];
  };
  paymentConfirmed: boolean;
  consultation?: {
    booked: boolean;
    format: "video" | "voice" | "chat" | "in_person";
    feeEtb: number;
    scheduledFor?: string;
  };
}

export const SOCIAL_EXPERTS: SocialExpert[] = [
  {
    id: "social-counselor-1",
    name: "Hirut Abebe",
    credential: "Licensed social worker",
    specialization: "loneliness, belonging, and family support",
    languages: ["am", "en"],
    rating: 4.8,
    isAvailable: true,
  },
  {
    id: "social-mediator-1",
    name: "Kebede Tefera",
    credential: "Community mediator",
    specialization: "family and community reconciliation",
    languages: ["am", "om", "en"],
    rating: 4.7,
    isAvailable: true,
  },
  {
    id: "social-mentor-1",
    name: "Mariam Tadesse",
    credential: "Peer support specialist",
    specialization: "belonging and relationship repair",
    languages: ["am", "en"],
    rating: 4.9,
    isAvailable: true,
  },
];

const socialCases = new Map<string, SocialCaseSession>();

export function assignSocialExpert(issueType?: string): SocialExpert {
  if (issueType === "family") return SOCIAL_EXPERTS[1];
  if (issueType === "belonging") return SOCIAL_EXPERTS[2];
  return SOCIAL_EXPERTS[0];
}

export function startSocialCase(input: {
  userId?: string;
  answers?: Record<string, unknown>;
  safetyResult?: SocialCaseSession["safetyResult"];
}): SocialCaseSession {
  const now = new Date().toISOString();
  const id = globalThis.crypto && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `social-${Date.now()}`;

  const session: SocialCaseSession = {
    id,
    userId: input.userId,
    createdAt: now,
    updatedAt: now,
    status: input.safetyResult && input.safetyResult.action === "crisis_route" ? "crisis_routed" : "intake_started",
    answers: input.answers || {},
    safetyResult: input.safetyResult,
    paymentConfirmed: false,
  };

  socialCases.set(id, session);
  return session;
}

export function getSocialCase(caseId: string, userId?: string): SocialCaseSession | undefined {
  const session = socialCases.get(caseId);
  if (!session) return undefined;
  if (userId && session.userId && session.userId !== userId) return undefined;
  return session;
}

export function submitSocialCase(
  caseId: string,
  answers: Record<string, unknown>,
  userId?: string
): SocialCaseSession | undefined {
  const session = getSocialCase(caseId, userId);
  if (!session) return undefined;

  session.answers = { ...session.answers, ...answers };
  session.updatedAt = new Date().toISOString();
  session.issueType = String(session.answers.belonging_need || "community_support");
  session.assignedExpert = assignSocialExpert(session.issueType);
  session.status = "pending_expert_review";
  session.report = {
    title: "Social support and belonging review",
    summary: "The plan focuses on safe connection, supportive routines, and practical next steps for belonging and community support.",
    recommendations: [
      "Identify one trusted person or community resource to reconnect with.",
      "Reduce pressure by focusing on one practical next step at a time.",
      "If conflict or coercion is present, prioritize safety and support before deeper reconciliation.",
    ],
  };

  socialCases.set(caseId, session);
  return session;
}

export function previewSocialCase(caseId: string, userId?: string): SocialCaseSession | undefined {
  const session = getSocialCase(caseId, userId);
  if (!session) return undefined;
  session.status = session.status === "crisis_routed" ? "crisis_routed" : "visible_to_user";
  session.updatedAt = new Date().toISOString();
  socialCases.set(caseId, session);
  return session;
}

export function purchaseSocialReport(caseId: string, userId?: string): SocialCaseSession | undefined {
  const session = getSocialCase(caseId, userId);
  if (!session) return undefined;
  session.paymentConfirmed = true;
  session.status = "full_report_released";
  session.updatedAt = new Date().toISOString();
  socialCases.set(caseId, session);
  return session;
}

export function bookSocialConsult(
  caseId: string,
  format: "video" | "voice" | "chat" | "in_person",
  userId?: string
): SocialCaseSession | undefined {
  const session = getSocialCase(caseId, userId);
  if (!session) return undefined;
  session.consultation = {
    booked: true,
    format,
    feeEtb: 900,
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
  };
  session.status = "consultation_booked";
  session.updatedAt = new Date().toISOString();
  socialCases.set(caseId, session);
  return session;
}
