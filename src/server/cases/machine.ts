/**
 * Pure transitions for WorkflowCase. No I/O: callers load, transition, then persist.
 * Every function returns a new object and throws ApiError for illegal moves.
 */
import { ApiError } from "@/lib/api/route";
import type {
  CaseAnalysis,
  CaseMessage,
  ConsultationRecord,
  ConsentRecord,
  DomainConfig,
  DraftReport,
  PaymentRecord,
  SafetyOutcome,
  WorkflowCase,
  WorkflowStage,
} from "./types";

const now = () => new Date().toISOString();

function assertStage(record: WorkflowCase, allowed: WorkflowStage[], action: string) {
  if (!allowed.includes(record.stage)) {
    throw ApiError.conflict(`Cannot ${action} while the case is ${record.stage.replace(/_/g, " ")}.`);
  }
}

function stageForSafety(safety: SafetyOutcome): WorkflowStage {
  if (safety.action === "crisis_route") return "crisis_routed";
  if (safety.action === "referral_route") return "referred";
  return "intake";
}

/** The more severe of two outcomes wins; crisis always dominates. */
export function mergeSafety(a: SafetyOutcome, b: SafetyOutcome | null): SafetyOutcome {
  if (!b) return a;
  const rank = { proceed: 0, proceed_with_concern: 1, referral_route: 2, crisis_route: 3 } as const;
  return rank[b.action] > rank[a.action] ? b : a;
}

export function createCase(input: {
  id: string;
  userId: string;
  config: DomainConfig;
  safetyAnswers: Record<string, unknown>;
  answers: Record<string, unknown>;
  consent?: Partial<ConsentRecord>;
  /** Set when the case was opened from a marketplace booking; that business reviews it. */
  businessId?: string | null;
  bookingId?: string | null;
}): WorkflowCase {
  const safety = input.config.evaluateSafety(input.safetyAnswers);
  const stage = stageForSafety(safety);
  const context = stage === "crisis_routed" ? {} : input.config.buildContext?.(input.answers) ?? {};
  const timestamp = now();
  return {
    id: input.id,
    userId: input.userId,
    businessId: input.businessId ?? null,
    bookingId: input.bookingId ?? null,
    assignedRole: null,
    domain: input.config.domain,
    stage,
    safetyAnswers: input.safetyAnswers,
    safety,
    consent: {
      dataUsage: input.consent?.dataUsage ?? true,
      emergencySupport: input.consent?.emergencySupport ?? true,
      thirdPartySharing: input.consent?.thirdPartySharing ?? false,
      retention: input.consent?.retention ?? "90_days",
      consentedAt: input.consent?.consentedAt ?? timestamp,
      consentTextVersion: input.consent?.consentTextVersion ?? "v1",
    },
    answers: input.answers,
    context,
    draft: null,
    review: null,
    auditTrail: [{ type: "created", actorId: input.userId, at: timestamp, details: { domain: input.config.domain, stage } }],
    messages: [],
    analysis: null,
    payment: null,
    consultation: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function recordAnswers(record: WorkflowCase, answers: Record<string, unknown>, config: DomainConfig): WorkflowCase {
  // A referral (e.g. legal aid) still lets the person finish their intake; a crisis does not.
  assertStage(record, ["intake", "referred"], "update answers");
  const merged = { ...record.answers, ...answers };
  const safety = mergeSafety(record.safety, config.screenAnswers?.(merged) ?? null);
  const context = config.buildContext ? config.buildContext(merged) : record.context;
  return { ...record, answers: merged, context, safety, stage: safety.action === "crisis_route" ? "crisis_routed" : record.stage, updatedAt: now() };
}

/** A question with `dependsOn` only applies when the answer it depends on matches. */
export function isApplicable(question: { dependsOn?: { questionId: string; value: string | string[] } }, answers: Record<string, unknown>) {
  if (!question.dependsOn) return true;
  const actual = answers[question.dependsOn.questionId];
  const expected = question.dependsOn.value;
  const values = Array.isArray(actual) ? actual.map(String) : [String(actual ?? "")];
  return (Array.isArray(expected) ? expected : [expected]).some((value) => values.includes(value));
}

export function missingRequired(record: WorkflowCase, config: DomainConfig): string[] {
  return config
    .questions(record.answers)
    .filter((question) => question.required && isApplicable(question, record.answers))
    .filter((question) => {
      const value = record.answers[question.id];
      return value === undefined || value === null || (typeof value === "string" && !value.trim()) || (Array.isArray(value) && !value.length);
    })
    .map((question) => question.id);
}

/** Submission freezes the answers and attaches the draft; the case then waits for a human expert. */
export function submitCase(record: WorkflowCase, draft: DraftReport, config: DomainConfig): WorkflowCase {
  assertStage(record, ["intake", "referred"], "submit");
  const missing = missingRequired(record, config);
  if (missing.length) throw ApiError.badRequest("Please answer all required questions.", { missing });
  return { ...record, draft, stage: "awaiting_expert", updatedAt: now() };
}

export function assignCaseRole(record: WorkflowCase, role: string, actorId: string): WorkflowCase {
  assertStage(record, ["awaiting_expert", "in_review"], "assign");
  if (record.businessId) throw ApiError.badRequest("Business cases must be assigned through the business workspace.");
  const timestamp = now();
  const reassigned = record.stage === "in_review";
  return {
    ...record,
    assignedRole: role,
    stage: reassigned ? "awaiting_expert" : record.stage,
    review: reassigned ? null : record.review,
    auditTrail: [...record.auditTrail, {
      type: "assigned",
      actorId,
      at: timestamp,
      details: { role, previousRole: record.assignedRole, reviewerReleased: reassigned },
    }],
    updatedAt: timestamp,
  };
}

export function routeToCrisis(record: WorkflowCase, safety: SafetyOutcome): WorkflowCase {
  return { ...record, safety, stage: "crisis_routed", updatedAt: now() };
}

export function claimCase(record: WorkflowCase, expertId: string): WorkflowCase {
  assertStage(record, ["awaiting_expert"], "claim");
  const nowTs = now();
  return {
    ...record,
    stage: "in_review",
    review: { expertId, claimedAt: nowTs },
    auditTrail: [...record.auditTrail, { type: "claimed", actorId: expertId, at: nowTs, details: { stage: "in_review" } }],
    updatedAt: nowTs,
  };
}

/** The claiming reviewer saves edits to the report without releasing it. */
export function saveDraft(record: WorkflowCase, expertId: string, draft: DraftReport): WorkflowCase {
  assertStage(record, ["in_review"], "edit the report");
  if (record.review?.expertId !== expertId) throw ApiError.forbidden("This case is assigned to another expert.");
  const timestamp = now();
  return {
    ...record,
    draft,
    auditTrail: [...record.auditTrail, { type: "draft_saved", actorId: expertId, at: timestamp, details: { sections: draft.sections.length } }],
    updatedAt: timestamp,
  };
}

const CONVERSATION_STAGES: WorkflowStage[] = ["awaiting_expert", "in_review", "visible_to_user", "full_report_released", "consultation_requested"];
export const MAX_CASE_MESSAGES = 200;

/** Adds a message to the owner ↔ reviewer conversation. Message text is kept out of the audit trail. */
export function addMessage(record: WorkflowCase, message: CaseMessage): WorkflowCase {
  assertStage(record, CONVERSATION_STAGES, "send a message");
  if (message.from === "reviewer") {
    if (record.stage !== "in_review") throw ApiError.conflict("Claim the request before writing to the person.");
    if (record.review?.expertId !== message.authorId) throw ApiError.forbidden("This case is assigned to another expert.");
  }
  if (record.messages.length >= MAX_CASE_MESSAGES) throw ApiError.conflict("This conversation is full. Please open a new request.");
  return {
    ...record,
    messages: [...record.messages, message],
    auditTrail: [...record.auditTrail, { type: "message", actorId: message.authorId, at: message.at, details: { from: message.from, kind: message.kind, via: message.via } }],
    updatedAt: message.at,
  };
}

/** The reviewer's most recent question, while the owner has not answered it. */
export function openQuestion(record: WorkflowCase): CaseMessage | null {
  const last = record.messages[record.messages.length - 1];
  return last && last.from === "reviewer" && last.kind === "question" ? last : null;
}

/** Stores a (re)built analysis. `actorId` is set when a reviewer asked for it, and is audited. */
export function attachAnalysis(record: WorkflowCase, analysis: CaseAnalysis | null, actorId?: string): WorkflowCase {
  if (!actorId) return { ...record, analysis };
  const timestamp = now();
  return { ...record, analysis, auditTrail: [...record.auditTrail, { type: "reanalysed", actorId, at: timestamp }], updatedAt: timestamp };
}

export function releaseClaim(record: WorkflowCase, expertId: string): WorkflowCase {
  assertStage(record, ["in_review"], "release");
  if (record.review?.expertId !== expertId) throw ApiError.forbidden("This case is assigned to another expert.");
  return { ...record, stage: "awaiting_expert", review: null, updatedAt: now() };
}

export function approveCase(
  record: WorkflowCase,
  expertId: string,
  input: { checklist: Record<string, boolean>; notes?: string; draft?: DraftReport },
  config: DomainConfig,
): WorkflowCase {
  assertStage(record, ["in_review"], "approve");
  if (record.review?.expertId !== expertId) throw ApiError.forbidden("This case is assigned to another expert.");
  const incomplete = config.reviewChecklist.filter((item) => input.checklist[item.id] !== true).map((item) => item.id);
  if (incomplete.length) throw ApiError.badRequest("Complete the review checklist before approving.", { incomplete });
  const approvedAt = now();
  return {
    ...record,
    draft: input.draft ?? record.draft,
    stage: "visible_to_user",
    review: { ...record.review, approvedAt, notes: input.notes, checklist: input.checklist },
    auditTrail: [...record.auditTrail, { type: "approved", actorId: expertId, at: approvedAt, details: { checklist: input.checklist, notes: input.notes ?? null } }],
    updatedAt: approvedAt,
  };
}

export function startPayment(record: WorkflowCase, payment: Omit<PaymentRecord, "status" | "createdAt">): WorkflowCase {
  assertStage(record, ["visible_to_user"], "start a payment");
  if (record.payment?.status === "confirmed") throw ApiError.conflict("This report is already paid for.");
  return { ...record, payment: { ...payment, status: "pending", createdAt: now() }, updatedAt: now() };
}

export function requestConsultation(
  record: WorkflowCase,
  input: Pick<ConsultationRecord, "format" | "preferredTimes" | "note">,
  config: DomainConfig,
): WorkflowCase {
  assertStage(record, ["full_report_released"], "request a consultation");
  if (!config.pricing.consultationFormats.includes(input.format)) throw ApiError.badRequest(`Format '${input.format}' is not offered for this case type.`);
  return {
    ...record,
    stage: "consultation_requested",
    consultation: { ...input, feeEtb: config.pricing.consultationEtb, requestedAt: now(), status: "requested" },
    updatedAt: now(),
  };
}

/**
 * Cases opened from a marketplace booking are paid for through the booking, so approval releases
 * the full report directly instead of asking the client to pay again.
 */
export function releaseWithBooking(record: WorkflowCase): WorkflowCase {
  if (!record.bookingId) throw ApiError.conflict("Only booking-linked cases are released with their booking.");
  assertStage(record, ["visible_to_user"], "release the report");
  return released(record, { purchaseId: `booking:${record.bookingId}`, amountEtb: 0, method: "booking", provider: "business", providerReference: record.bookingId });
}

/** Releases the full report without payment (free mode, or a report priced at zero). */
export function releaseFree(record: WorkflowCase): WorkflowCase {
  assertStage(record, ["visible_to_user"], "release the report");
  return released(record, { purchaseId: `free:${record.id}`, amountEtb: 0, method: "free", provider: "platform" });
}

/**
 * Credits a payment confirmed by the payment service (Chapa verify or an administrator's review).
 * Repeating the same purchase is a no-op, so webhooks, return URLs and retries can all call it.
 */
export function settlePayment(record: WorkflowCase, payment: { purchaseId: string; amountEtb: number; method: string; provider: string; reference: string }): WorkflowCase {
  if (record.payment?.status === "confirmed") {
    if (record.payment.purchaseId === payment.purchaseId) return record;
    throw ApiError.conflict("This report was already paid for with another payment.");
  }
  assertStage(record, ["visible_to_user"], "confirm a payment");
  return released(record, { purchaseId: payment.purchaseId, amountEtb: payment.amountEtb, method: payment.method, provider: payment.provider, providerReference: payment.reference });
}

function released(record: WorkflowCase, payment: Omit<PaymentRecord, "status" | "createdAt" | "confirmedAt">): WorkflowCase {
  const timestamp = now();
  return {
    ...record,
    stage: "full_report_released",
    payment: {
      ...payment,
      status: "confirmed",
      createdAt: record.payment?.purchaseId === payment.purchaseId ? record.payment.createdAt : timestamp,
      confirmedAt: timestamp,
    },
    updatedAt: timestamp,
  };
}
