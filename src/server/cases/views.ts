/**
 * What a case owner may see. Drafts are never sent before an expert approves them, and locked
 * sections are sent as titles only until the report is paid for.
 */
import type { DomainConfig, ReportSection, WorkflowCase } from "./types";

export interface ExpertSummary {
  id: string;
  name: string | null;
  credential: string | null;
}

const REVIEW_STAGES = new Set(["awaiting_expert", "in_review"]);
const PAID_STAGES = new Set(["full_report_released", "consultation_requested"]);

function visibleSection(section: ReportSection, paid: boolean) {
  if (!section.locked || paid) return section;
  return { id: section.id, title: section.title, locked: true, cultural: section.cultural };
}

export function toOwnerView(record: WorkflowCase, config: DomainConfig, expert: ExpertSummary | null) {
  const paid = PAID_STAGES.has(record.stage);
  const approved = record.stage === "visible_to_user" || paid;

  return {
    id: record.id,
    domain: record.domain,
    label: config.label,
    stage: record.stage,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    consent: record.consent,
    auditTrail: record.auditTrail,
    safety: {
      action: record.safety.action,
      priority: record.safety.priority,
      reason: record.safety.reason ?? null,
      reasonCode: record.safety.reasonCode ?? null,
      confidence: record.safety.confidence ?? null,
      evidence: record.safety.evidence ?? null,
      support: record.safety.support ?? null,
    },
    answers: record.answers,
    context: record.context,
    questions: record.stage === "intake" || record.stage === "referred" ? config.questions(record.answers) : [],
    review: REVIEW_STAGES.has(record.stage) || approved
      ? {
          status: record.stage === "awaiting_expert" ? "queued" : record.stage === "in_review" ? "in_review" : "approved",
          expert: record.stage === "awaiting_expert" ? null : expert,
          approvedAt: record.review?.approvedAt ?? null,
          notes: approved ? record.review?.notes ?? null : null,
          checklist: record.review?.checklist ?? null,
        }
      : null,
    report:
      approved && record.draft
        ? {
            title: record.draft.title,
            summary: record.draft.summary,
            disclaimer: record.draft.disclaimer,
            aiAssisted: record.draft.aiAssisted,
            recommendations: record.draft.recommendations ?? [],
            sections: record.draft.sections.map((section) => visibleSection(section, paid)),
            unlocked: paid,
          }
        : null,
    pricing: { reportEtb: config.pricing.reportEtb, consultationEtb: config.pricing.consultationEtb, consultationFormats: config.pricing.consultationFormats },
    payment: record.payment ? { status: record.payment.status, purchaseId: record.payment.purchaseId, amountEtb: record.payment.amountEtb, method: record.payment.method } : null,
    consultation: record.consultation,
  };
}

export type OwnerView = ReturnType<typeof toOwnerView>;

/** Expert desk view: the full draft and answers, without the owner's payment details. */
export function toExpertView(record: WorkflowCase, config: DomainConfig) {
  return {
    id: record.id,
    domain: record.domain,
    label: config.label,
    stage: record.stage,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    safety: record.safety,
    consent: record.consent,
    answers: record.answers,
    context: record.context,
    draft: record.draft,
    review: record.review,
    auditTrail: record.auditTrail,
    checklist: config.reviewChecklist,
  };
}
