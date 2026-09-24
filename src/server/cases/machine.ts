/**
 * Pure transitions for WorkflowCase. No I/O: callers load, transition, then persist.
 * Every function returns a new object and throws ApiError for illegal moves.
 */
import { ApiError } from "@/lib/api/route";
import type {
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
}): WorkflowCase {
  const safety = input.config.evaluateSafety(input.safetyAnswers);
  const stage = stageForSafety(safety);
  const context = stage === "crisis_routed" ? {} : input.config.buildContext?.(input.answers) ?? {};
  const timestamp = now();
  return {
    id: input.id,
    userId: input.userId,
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

export function confirmPayment(record: WorkflowCase, purchaseId: string, providerReference: string): WorkflowCase {
  if (record.payment?.status === "confirmed" && record.payment.purchaseId === purchaseId) return record;
  assertStage(record, ["visible_to_user"], "confirm a payment");
  if (!record.payment || record.payment.purchaseId !== purchaseId) throw ApiError.badRequest("Unknown purchase for this case.");
  return {
    ...record,
    stage: "full_report_released",
    payment: { ...record.payment, status: "confirmed", providerReference, confirmedAt: now() },
    updatedAt: now(),
  };
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
