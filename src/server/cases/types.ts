/**
 * Shared model for the expert-reviewed case workflows (career, legal, relationship, social, spiritual).
 * One pipeline, one persisted record shape; each domain contributes a DomainConfig.
 */

export const WORKFLOW_DOMAINS = ["career", "legal", "relationship", "social", "spiritual", "biological"] as const;
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

export type EvidenceGrade = "strong" | "moderate" | "preliminary" | "traditional" | "reflective_only";

export interface ConsentRecord {
  dataUsage: boolean;
  emergencySupport: boolean;
  thirdPartySharing: boolean;
  retention: "30_days" | "90_days" | "1_year" | "until_closed";
  consentedAt: string | null;
  consentTextVersion: string;
}

/** Normalised result of a domain's safety pre-screen. */
export interface SafetyOutcome {
  action: "proceed" | "proceed_with_concern" | "crisis_route" | "referral_route";
  priority: "urgent" | "high" | "routine";
  reason?: string;
  reasonCode?: string;
  confidence?: number;
  evidence?: {
    sourceTypes: string[];
    freshnessLabel?: string;
    notes?: string;
  };
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
  evidence?: {
    sources?: string[];
    confidence?: number;
    note?: string;
  };
  data?: Record<string, unknown>;
}

export interface RecommendationEvidence {
  grade: EvidenceGrade;
  source: string;
  confidence: number;
  note: string;
  professionalGate?: "none" | "medical_review_required" | "legal_review_required" | "specialist_review_required";
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  evidence: RecommendationEvidence;
  domain: "scientific" | "cultural" | "social" | "legal" | "career" | "spiritual";
  requiresReview?: boolean;
}

export interface DraftReport {
  title: string;
  summary: string;
  sections: ReportSection[];
  recommendations?: Recommendation[];
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

export interface ReviewChecklistItem {
  id: string;
  label: string;
}

export interface ReviewAuditEvent {
  type: "created" | "claimed" | "approved" | "assigned" | "draft_saved" | "message" | "reanalysed";
  actorId: string;
  at: string;
  details?: Record<string, unknown>;
}

/** Where a case message was written: the website, or a reply sent to the Telegram / WhatsApp bot. */
export type MessageChannel = "app" | "telegram" | "whatsapp";

/**
 * One entry in the conversation between the case owner and the reviewer. A reviewer `question`
 * waits for the owner's reply; the reply is added to the analysed narrative.
 */
export interface CaseMessage {
  id: string;
  from: "owner" | "reviewer";
  authorId: string;
  kind: "message" | "question";
  body: string;
  via: MessageChannel;
  at: string;
}

export type AnalysisLayer = "A" | "B";
export type AnalysisConfidence = "strong" | "moderate" | "tentative";

/** A knowledge-strand finding kept because something the person said or their profile supports it. */
export interface GroundedFinding {
  strand: string;
  layer: AnalysisLayer;
  name: string;
  summary: string;
  /** 0–1, from the grounding below, not from the strand's own catalogue score. */
  relevance: number;
  /** Why it was kept, e.g. `Sleep: "I cannot sleep"` or `Profile: region Oromia`. */
  matchedOn: string[];
  severity?: string;
  steps: string[];
  source?: string;
}

export interface AnalysisCause {
  id: string;
  title: string;
  explanation: string;
  confidence: AnalysisConfidence;
  /** The person's own words (or profile facts) that support this hypothesis. */
  because: string[];
  factors: string[];
  strands: string[];
}

export interface AnalysisSolution {
  id: string;
  title: string;
  steps: string[];
  horizon: "now" | "this_week" | "ongoing";
  addresses: string[];
  /** Medical, medication and herbal content must be confirmed by a qualified professional. */
  needsProfessional: boolean;
  source: string;
}

/**
 * The reviewer's dossier: every knowledge strand and engine run over the request, reduced to what
 * the person's own words support. Never sent to the case owner; the reviewer decides what goes
 * into the report.
 */
export interface CaseAnalysis {
  version: 1;
  generatedAt: string;
  /** "reflection_only": this case type publishes cultural and spiritual reflection only. */
  publishScope: "full" | "reflection_only";
  narrative: { words: number; excerpt: string };
  urgency: { level: string; score: number; signals: string[]; recommendation: string };
  factors: Array<{ id: string; label: string; weight: number; quotes: string[] }>;
  causes: AnalysisCause[];
  solutions: AnalysisSolution[];
  strands: Array<{ strand: string; layer: AnalysisLayer; considered: number; kept: number; findings: GroundedFinding[] }>;
  /** Domain B reflections, kept apart from Domain A causes. Empty when a safety signal is active. */
  reflections: GroundedFinding[];
  intersections: Array<{ title: string; description: string; recommendation: string; strands: string[] }>;
  engines: Array<{ id: string; title: string; summary: string; items: string[] }>;
  safety: { warnings: string[]; interactions: string[]; domainBSuppressed: boolean };
  dataQuality: {
    /** 0–100: how much the request and profile give the analysis to work with. */
    score: number;
    used: string[];
    gaps: string[];
    /** Questions that would sharpen the analysis; the reviewer can send one with a click. */
    followUps: string[];
  };
}

/** The persisted case. Stored as one row in `workflow_cases`. */
export interface WorkflowCase {
  id: string;
  userId: string;
  /** The marketplace business reviewing this case (null: the platform's expert pool). */
  businessId: string | null;
  bookingId: string | null;
  /** Platform role currently responsible for this request; null keeps the legacy expert pool. */
  assignedRole: string | null;
  domain: WorkflowDomain;
  stage: WorkflowStage;
  safetyAnswers: Record<string, unknown>;
  safety: SafetyOutcome;
  consent: ConsentRecord;
  answers: Record<string, unknown>;
  /** Domain-specific computed context (e.g. gematria for spiritual, timing for career). */
  context: Record<string, unknown>;
  draft: DraftReport | null;
  review: ReviewRecord | null;
  auditTrail: ReviewAuditEvent[];
  /** Conversation between the owner and the reviewer (also delivered over Telegram / WhatsApp). */
  messages: CaseMessage[];
  /** Reviewer-only analysis dossier, built on submission and refreshed when the owner adds information. */
  analysis: CaseAnalysis | null;
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
  reviewChecklist: ReviewChecklistItem[];
  safetyQuestions: WorkflowQuestion[];
  /** Answers needed before the case can be created (e.g. names for the spiritual gematria). */
  startQuestions?: WorkflowQuestion[];
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
