/**
 * Shared model for the expert-reviewed case workflows (career, legal, relationship, social, spiritual).
 * One pipeline, one persisted record shape; each domain contributes a DomainConfig.
 */

export const WORKFLOW_DOMAINS = ["career", "legal", "relationship", "social", "spiritual"] as const;
export type WorkflowDomain = (typeof WORKFLOW_DOMAINS)[number];

/**
 * intake ──submit──▶ awaiting_expert ──claim──▶ in_review ──approve──▶ visible_to_user
 *    │                                                                     │ pay
 *    └─ safety screen may route to crisis_routed / referred                ▼
 *                                                   full_report_released ──▶ consultation_requested
 */
export const WORKFLOW_STAGES = [
  "intake",
  "crisis_routed",
  "referred",
  "awaiting_expert",
  "in_review",
  "visible_to_user",
  "full_report_released",
  "consultation_requested",
] as const;
export type WorkflowStage = (typeof WORKFLOW_STAGES)[number];

export interface Contact {
  name: string;
  number: string;
}

/** Normalised result of a domain's safety pre-screen. */
export interface SafetyOutcome {
  action: "proceed" | "proceed_with_concern" | "crisis_route" | "referral_route";
  priority: "urgent" | "high" | "routine";
  reason?: string;
  /** Free, always-visible support content (crisis lines, legal aid, safety plan). */
  support?: {
    title: string;
    message: string;
    hotlines: Contact[];
    steps: string[];
    resources?: string[];
  };
}

export interface QuestionOption {
  value: string;
  label: string;
  labelAmharic?: string;
}

export interface WorkflowQuestion {
  id: string;
  text: string;
  textAmharic?: string;
  type: string;
  required: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  hint?: string;
  dependsOn?: { questionId: string; value: string | string[] };
}

export interface ReportSection {
  id: string;
  title: string;
  body?: string;
  items?: string[];
  /** Locked sections are shown only after the report is paid for. */
  locked: boolean;
  /** Domain B (cultural/reflective) content, displayed separately from Domain A findings. */
  cultural?: boolean;
  data?: Record<string, unknown>;
}

export interface DraftReport {
  title: string;
  summary: string;
  sections: ReportSection[];
  disclaimer: string;
  generatedAt: string;
  aiAssisted: boolean;
}

export interface PaymentRecord {
  status: "pending" | "confirmed" | "failed";
  purchaseId: string;
  amountEtb: number;
  method: string;
  provider: string;
  providerReference?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface ConsultationRecord {
  format: "video" | "voice" | "chat" | "in_person";
  preferredTimes: string[];
  note?: string;
  feeEtb: number;
  requestedAt: string;
  status: "requested" | "scheduled" | "completed" | "cancelled";
  scheduledFor?: string;
}

export interface ReviewRecord {
  expertId: string;
  claimedAt: string;
  approvedAt?: string;
  notes?: string;
  checklist?: Record<string, boolean>;
}

/** The persisted case. Stored as one row in `workflow_cases`. */
export interface WorkflowCase {
  id: string;
  userId: string;
  domain: WorkflowDomain;
  stage: WorkflowStage;
  safetyAnswers: Record<string, unknown>;
  safety: SafetyOutcome;
  answers: Record<string, unknown>;
  /** Domain-specific computed context (e.g. gematria for spiritual, timing for career). */
  context: Record<string, unknown>;
  draft: DraftReport | null;
  review: ReviewRecord | null;
  payment: PaymentRecord | null;
  consultation: ConsultationRecord | null;
  createdAt: string;
  updatedAt: string;
}

export interface DomainPricing {
  reportEtb: number;
  consultationEtb: number;
  consultationFormats: ConsultationRecord["format"][];
}

export interface DomainConfig {
  domain: WorkflowDomain;
  label: string;
  description: string;
  pricing: DomainPricing;
  /** The review checklist an expert must complete before a report is released. */
  reviewChecklist: { id: string; label: string }[];
  safetyQuestions: WorkflowQuestion[];
  evaluateSafety(answers: Record<string, unknown>): SafetyOutcome;
  /** Questions for the intake. May depend on answers given so far. */
  questions(answers: Record<string, unknown>): WorkflowQuestion[];
  /** Extra safety signals found in free-text answers (e.g. self-harm language). */
  screenAnswers?(answers: Record<string, unknown>): SafetyOutcome | null;
  /** Domain context computed at start (e.g. gematria from names). Throws ApiError on bad input. */
  buildContext?(answers: Record<string, unknown>): Record<string, unknown>;
  /** Builds the draft an expert will review. */
  buildDraft(input: { answers: Record<string, unknown>; context: Record<string, unknown>; safety: SafetyOutcome }): Promise<DraftReport> | DraftReport;
}
