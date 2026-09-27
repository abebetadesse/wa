export const CaseStatus = {
  REGISTERED: "REGISTERED",
  PROFILE_SUBMITTED: "PROFILE_SUBMITTED",
  PRELIMINARY_ANALYSIS_READY: "PRELIMINARY_ANALYSIS_READY",
  CASE_SUBMITTED: "CASE_SUBMITTED",
  /** Short alias for CASE_SUBMITTED — used by API routes, tests, and StatusTimeline */
  SUBMITTED: "SUBMITTED",
  CASE_EVALUATING: "CASE_EVALUATING",
  /** Short alias for CASE_EVALUATING — used by API routes, tests, and StatusTimeline */
  EVALUATING: "EVALUATING",
  BLOCKED_BY_SAFETY_GATE: "BLOCKED_BY_SAFETY_GATE",
  PENDING_PROFESSIONAL: "PENDING_PROFESSIONAL",
  PROFESSIONAL_RETURNED: "PROFESSIONAL_RETURNED",
  PENDING_ADMIN: "PENDING_ADMIN",
  ADMIN_RETURNED: "ADMIN_RETURNED",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
} as const;

export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus];

export const Role = {
  USER: "USER",
  PROFESSIONAL: "PROFESSIONAL",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export type EventType =
  | "registered"
  | "profile_submitted"
  | "submitted"
  | "evaluated"
  | "edited"
  | "approved"
  | "returned"
  | "published"
  | "gate_blocked"
  | "gate_overridden"
  | "held";

export interface CaseEvent {
  id: string;
  caseId: string;
  actorId: string;
  actorRole: Role;
  type: EventType;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  note?: string | null;
  at: string; // ISO 8601
}
