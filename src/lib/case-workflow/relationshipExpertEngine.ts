export type RelationshipCaseStatus =
  | "case_received"
  | "intake_started"
  | "pending_expert_review"
  | "visible_to_user"
  | "consultation_booked"
  | "crisis_routed";

export interface RelationshipExpert {
  id: string;
  name: string;
  credential: string;
  specialization: string;
  languages: string[];
  rating: number;
  isAvailable: boolean;
}

export interface RelationshipCaseSession {
  id: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  status: RelationshipCaseStatus;
  userName: string;
  partnerName?: string;
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
  };
  compatibility?: {
    score: number;
    summary: string;
    notes: string[];
  };
  assignedExpert?: RelationshipExpert;
  report?: {
    title: string;
    summary: string;
    recommendations: string[];
  };
  paymentConfirmed: boolean;
  consultation?: {
    booked: boolean;
    format: "video" | "voice" | "chat";
    feeEtb: number;
    scheduledFor?: string;
  };
}

export const RELATIONSHIP_EXPERTS: RelationshipExpert[] = [
  {
    id: "relationship-counselor-1",
    name: "Selam Bekele",
    credential: "Licensed counselor",
    specialization: "relationship counseling and safety planning",
    languages: ["am", "en"],
    rating: 4.9,
    isAvailable: true,
  },
  {
    id: "relationship-mediator-1",
    name: "Yared Mulu",
    credential: "Verified family mediator",
    specialization: "family communication and mediation",
    languages: ["am", "en", "om"],
    rating: 4.8,
    isAvailable: true,
  },
];

const relationshipCases = new Map<string, RelationshipCaseSession>();

export function assignRelationshipExpert(scope: string): RelationshipExpert {
  const candidates = RELATIONSHIP_EXPERTS.filter((expert) => {
    if (scope === "safety") return expert.specialization.includes("safety") || expert.specialization.includes("counseling");
    return expert.isAvailable;
  });

  const selected = candidates[0] || RELATIONSHIP_EXPERTS[0];
  return selected;
}

export function buildRelationshipCompatibility(
  userName: string,
  partnerName: string,
  cues: Record<string, unknown> = {}
): {
  score: number;
  summary: string;
  notes: string[];
} {
  const seed = userName.length + (partnerName || "").length;
  const communication = Number(cues.communicationScore ?? 60);
  const trust = Number(cues.trustScore ?? 65);
  const balance = Number(cues.balanceScore ?? 58);
  const score = Math.min(100, Math.max(20, Math.round((communication + trust + balance + (seed % 12)) / 4)));

  return {
    score,
    summary:
      score >= 70
        ? "The relationship shows a healthy foundation with room for more intentional communication."
        : score >= 45
          ? "The relationship has potential, but it will likely benefit from clearer boundaries and honest conversations."
          : "The relationship is under stress and may need skilled support, clearer safety planning, and more intentional pacing.",
    notes: [
      "Communication and trust are the most important levers here.",
      "Safety and respect should be treated as non-negotiable.",
      "A culturally grounded mediator or counselor may help the process.",
    ],
  };
}

export function startRelationshipCase(input: {
  userId?: string;
  userName: string;
  partnerName?: string;
  answers?: Record<string, unknown>;
  safetyResult?: RelationshipCaseSession["safetyResult"];
}): RelationshipCaseSession {
  const now = new Date().toISOString();
  const id = (globalThis.crypto && typeof crypto.randomUUID === "function") ? crypto.randomUUID() : `relationship-${Date.now()}`;
  const session: RelationshipCaseSession = {
    id,
    userId: input.userId,
    createdAt: now,
    updatedAt: now,
    status: input.safetyResult && input.safetyResult.action === "crisis_route" ? "crisis_routed" : "intake_started",
    userName: input.userName,
    partnerName: input.partnerName,
    answers: input.answers || {},
    safetyResult: input.safetyResult,
    compatibility: buildRelationshipCompatibility(input.userName, input.partnerName || "", input.answers || {}),
    paymentConfirmed: false,
  };

  relationshipCases.set(id, session);
  return session;
}

export function getRelationshipCase(caseId: string, userId?: string): RelationshipCaseSession | undefined {
  const session = relationshipCases.get(caseId);
  if (!session) return undefined;
  if (userId && session.userId && session.userId !== userId) return undefined;
  return session;
}

export function submitRelationshipCase(
  caseId: string,
  answers: Record<string, unknown>,
  userId?: string
): RelationshipCaseSession | undefined {
  const session = getRelationshipCase(caseId, userId);
  if (!session) return undefined;
  if (session.status === "crisis_routed") return session;

  session.answers = { ...session.answers, ...answers };
  session.updatedAt = new Date().toISOString();
  session.status = "pending_expert_review";
  session.assignedExpert = assignRelationshipExpert("relationship");
  session.compatibility = buildRelationshipCompatibility(session.userName, session.partnerName || "", session.answers);
  session.report = {
    title: "Relationship reflection and support plan",
    summary: `A relationship review has been prepared for ${session.userName}. The focus is on communication, boundaries, and safety-first next steps.`,
    recommendations: [
      "Clarify the issue in plain terms before the next conversation.",
      "Set one boundary or decision that protects emotional and physical safety.",
      "Use a mediator or counselor if communication remains stuck or unsafe.",
    ],
  };

  relationshipCases.set(caseId, session);
  return session;
}

export function previewRelationshipCase(caseId: string, userId?: string): RelationshipCaseSession | undefined {
  const session = getRelationshipCase(caseId, userId);
  if (!session) return undefined;
  session.status = session.status === "crisis_routed" ? "crisis_routed" : "visible_to_user";
  session.updatedAt = new Date().toISOString();
  relationshipCases.set(caseId, session);
  return session;
}

export function purchaseRelationshipReport(caseId: string, userId?: string): RelationshipCaseSession | undefined {
  const session = getRelationshipCase(caseId, userId);
  if (!session) return undefined;
  if (session.status === "crisis_routed") return session;
  session.paymentConfirmed = true;
  session.status = "visible_to_user";
  session.updatedAt = new Date().toISOString();
  relationshipCases.set(caseId, session);
  return session;
}

export function bookRelationshipConsult(
  caseId: string,
  format: "video" | "voice" | "chat",
  userId?: string
): RelationshipCaseSession | undefined {
  const session = getRelationshipCase(caseId, userId);
  if (!session) return undefined;
  if (session.status === "crisis_routed") return session;
  session.consultation = {
    booked: true,
    format,
    feeEtb: 1200,
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
  };
  session.status = "consultation_booked";
  session.updatedAt = new Date().toISOString();
  relationshipCases.set(caseId, session);
  return session;
}

export function getRelationshipMediationGuide(): {
  title: string;
  sections: string[];
} {
  return {
    title: "Relationship mediation guide",
    sections: [
      "Start with a private, calm conversation and one cooperative goal.",
      "Use simple statements that describe impact rather than blame.",
      "Ask for one clear next step and agree on timing.",
      "If there is fear, coercion, or child risk, prioritize safety support before mediation.",
    ],
  };
}
