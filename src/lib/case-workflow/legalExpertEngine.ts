export type LegalCaseStatus =
  | "case_received"
  | "intake_started"
  | "pending_expert_review"
  | "legal_aid_route"
  | "visible_to_user"
  | "full_report_released"
  | "consultation_booked"
  | "crisis_routed";

export interface LegalExpert {
  id: string;
  name: string;
  credential: string;
  specialization: string;
  languages: string[];
  rating: number;
  isAvailable: boolean;
}

export interface LegalCaseSession {
  id: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  status: LegalCaseStatus;
  jurisdiction?: string;
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
    legalAidContent?: {
      title: string;
      message: string;
      hotlines: Array<{ name: string; number: string }>;
      resources: string[];
    };
  };
  assignedExpert?: LegalExpert;
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

export const LEGAL_EXPERTS: LegalExpert[] = [
  {
    id: "legal-shemgelna-1",
    name: "Ato Mihret Bekele",
    credential: "Traditional elder & customary mediator (ሽማግሌ)",
    specialization: "customary reconciliation (ሽምግልና) and family harmony",
    languages: ["am", "en"],
    rating: 4.9,
    isAvailable: true,
  },
  {
    id: "legal-spiritual-1",
    name: "Kesis Daniel Tesfaye",
    credential: "Spiritual peacemaker & community counselor",
    specialization: "spiritual conscience, restorative ethics & mediation",
    languages: ["am", "en", "om"],
    rating: 4.8,
    isAvailable: true,
  },
  {
    id: "legal-cultural-1",
    name: "W/ro Aster Gashaw",
    credential: "Cultural mediator & elder counselor",
    specialization: "neighborhood peacemaking and customary dispute resolution",
    languages: ["am", "en"],
    rating: 4.9,
    isAvailable: true,
  },
];

const legalCases = new Map<string, LegalCaseSession>();

export function assignLegalExpert(issueType?: string): LegalExpert {
  if (issueType === "housing") return LEGAL_EXPERTS[2];
  if (issueType === "family") return LEGAL_EXPERTS[1];
  return LEGAL_EXPERTS[0];
}

export function startLegalCase(input: {
  userId?: string;
  jurisdiction?: string;
  answers?: Record<string, unknown>;
  safetyResult?: LegalCaseSession["safetyResult"];
}): LegalCaseSession {
  const now = new Date().toISOString();
  const id = globalThis.crypto && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `legal-${Date.now()}`;

  const session: LegalCaseSession = {
    id,
    userId: input.userId,
    createdAt: now,
    updatedAt: now,
    status: input.safetyResult && input.safetyResult.action === "crisis_route" ? "crisis_routed" : "intake_started",
    jurisdiction: input.jurisdiction,
    answers: input.answers || {},
    safetyResult: input.safetyResult,
    paymentConfirmed: false,
  };

  legalCases.set(id, session);
  return session;
}

export function getLegalCase(caseId: string, userId?: string): LegalCaseSession | undefined {
  const session = legalCases.get(caseId);
  if (!session) return undefined;
  if (userId && session.userId && session.userId !== userId) return undefined;
  return session;
}

export function submitLegalCase(
  caseId: string,
  answers: Record<string, unknown>,
  userId?: string
): LegalCaseSession | undefined {
  const session = getLegalCase(caseId, userId);
  if (!session) return undefined;
  if (session.status === "crisis_routed") return session;

  session.answers = { ...session.answers, ...answers };
  session.updatedAt = new Date().toISOString();
  session.issueType = String(session.answers.issue_type || "dispute");
  session.assignedExpert = assignLegalExpert(session.issueType);
  session.status = session.safetyResult?.action === "legal_aid_route" ? "legal_aid_route" : "pending_expert_review";
  session.report = {
    title: "Cultural & Spiritual Dispute Guidance (የሽምግልና እና የክርክር ምክር)",
    summary: `Your matter has been prepared for customary reconciliation (ሽምግልና) and spiritual reflection in ${session.jurisdiction || "your community"}. Grounded entirely in traditional Ethiopian peacemaking and spiritual conscience — no scientific or statutory legal advice.`,
    recommendations: [
      "Involve trusted community elders (ሽማግሌዎች) or spiritual leaders for customary reconciliation.",
      "Ground dialogue in mutual dignity, spiritual conscience, and restorative harmony.",
      "Spiritual and cultural reflection only: no scientific, clinical, or statutory legal advice is provided.",
    ],
  };

  legalCases.set(caseId, session);
  return session;
}

export function previewLegalCase(caseId: string, userId?: string): LegalCaseSession | undefined {
  const session = getLegalCase(caseId, userId);
  if (!session) return undefined;
  session.status = session.status === "crisis_routed" ? "crisis_routed" : "visible_to_user";
  session.updatedAt = new Date().toISOString();
  legalCases.set(caseId, session);
  return session;
}

export function purchaseLegalReport(caseId: string, userId?: string): LegalCaseSession | undefined {
  const session = getLegalCase(caseId, userId);
  if (!session) return undefined;
  if (session.status === "crisis_routed") return session;
  session.paymentConfirmed = true;
  session.status = "full_report_released";
  session.updatedAt = new Date().toISOString();
  legalCases.set(caseId, session);
  return session;
}

export function bookLegalConsult(
  caseId: string,
  format: "video" | "voice" | "chat" | "in_person",
  userId?: string
): LegalCaseSession | undefined {
  const session = getLegalCase(caseId, userId);
  if (!session) return undefined;
  if (session.status === "crisis_routed") return session;
  session.consultation = {
    booked: true,
    format,
    feeEtb: 1500,
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
  };
  session.status = "consultation_booked";
  session.updatedAt = new Date().toISOString();
  legalCases.set(caseId, session);
  return session;
}
