/**
 * Case workflow service: loads a case, applies a pure transition from machine.ts, persists it.
 * Ownership and expert eligibility are enforced here, not in routes.
 */
import crypto from "node:crypto";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { DOMAIN_CONFIGS, getDomainConfig } from "./domains";
import { canReview, expertSummaries, loadExpert, reviewableDomains, type ExpertCandidate } from "./experts";
import {
  approveCase,
  claimCase,
  confirmPayment,
  createCase,
  recordAnswers,
  releaseClaim,
  releaseWithBooking,
  requestConsultation,
  startPayment,
  submitCase,
} from "./machine";
import { getPaymentProvider, newPurchaseId, type PaymentMethod, type PaymentProvider } from "./payments";
import { dbCaseStore, type CaseStore } from "./store";
import type { ConsultationRecord, ConsentRecord, DraftReport, WorkflowCase, WorkflowDomain } from "./types";
import { toExpertView, toOwnerView } from "./views";
import { caseBridge, type CaseBridge } from "@/server/marketplace/caseBridge";

interface Deps {
  store: CaseStore;
  payments: () => PaymentProvider;
  loadExpert: (userId: string) => Promise<ExpertCandidate>;
  expertSummaries: typeof expertSummaries;
  /** Marketplace link: booking-opened cases are reviewed by the booked business's team. */
  bridge: CaseBridge;
}

export function createCaseService(deps: Deps) {
  const { store } = deps;

  async function ownerView(record: WorkflowCase) {
    const expertId = record.review?.expertId;
    const experts = expertId ? await deps.expertSummaries([expertId]) : new Map();
    return toOwnerView(record, getDomainConfig(record.domain), expertId ? experts.get(expertId) ?? null : null);
  }

  async function owned(user: AuthenticatedUser, caseId: string) {
    const record = await store.get(caseId);
    // Same 404 for missing and foreign cases, so case ids cannot be probed.
    if (!record || record.userId !== user.id) throw ApiError.notFound("Case");
    return record;
  }

  async function reviewable(user: AuthenticatedUser, caseId: string) {
    const record = await store.get(caseId);
    if (!record) throw ApiError.notFound("Case");
    const allowed = record.businessId
      ? await deps.bridge.canReviewForBusiness(user.id, record.businessId)
      : canReview(await deps.loadExpert(user.id), record.domain);
    if (!allowed) throw ApiError.notFound("Case");
    return record;
  }

  async function announce(record: WorkflowCase, type: "submitted" | "claimed" | "approved") {
    if (!record.businessId) return;
    await deps.bridge.onCaseEvent({ type, caseId: record.id, businessId: record.businessId, clientUserId: record.userId, label: getDomainConfig(record.domain).label });
  }

  const summary = (record: WorkflowCase) => ({
    id: record.id,
    domain: record.domain,
    label: getDomainConfig(record.domain).label,
    stage: record.stage,
    priority: record.safety.priority,
    concern: record.safety.reason ?? null,
    bookingId: record.bookingId,
    reviewerId: record.review?.expertId ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });

  const byPriority = (a: WorkflowCase, b: WorkflowCase) => {
    const rank = { urgent: 0, high: 1, routine: 2 };
    return rank[a.safety.priority] - rank[b.safety.priority] || a.createdAt.localeCompare(b.createdAt);
  };

  return {
    listDomains() {
      return Object.values(DOMAIN_CONFIGS).map((config) => ({
        domain: config.domain,
        label: config.label,
        description: config.description,
        pricing: config.pricing,
        safetyQuestions: config.safetyQuestions,
        startQuestions: config.startQuestions ?? [],
      }));
    },

    async start(user: AuthenticatedUser, domain: WorkflowDomain, input: {
      safetyAnswers: Record<string, unknown>;
      answers: Record<string, unknown>;
      consent?: Partial<ConsentRecord>;
      bookingId?: string;
    }) {
      const config = getDomainConfig(domain);
      const link = input.bookingId ? { bookingId: input.bookingId, ...(await deps.bridge.resolveBookingForCase(user, input.bookingId, domain)) } : null;
      const missing = config.safetyQuestions.filter((question) => input.safetyAnswers[question.id] === undefined).map((question) => question.id);
      if (missing.length) throw ApiError.badRequest("Please answer every safety question.", { missing });
      const record = createCase({ id: crypto.randomUUID(), userId: user.id, config, ...input, consent: input.consent ?? { dataUsage: true, emergencySupport: true, thirdPartySharing: false, retention: "90_days", consentedAt: new Date().toISOString(), consentTextVersion: "v1" }, businessId: link?.businessId ?? null, bookingId: link?.bookingId ?? null });
      await store.insert(record);
      if (link) await deps.bridge.linkBooking(link.bookingId, record.id);
      return ownerView(record);
    },

    async listMine(user: AuthenticatedUser) {
      const records = await store.listByUser(user.id);
      return Promise.all(records.map(ownerView));
    },

    async get(user: AuthenticatedUser, caseId: string) {
      return ownerView(await owned(user, caseId));
    },

    async answer(user: AuthenticatedUser, caseId: string, answers: Record<string, unknown>) {
      const record = await owned(user, caseId);
      const next = recordAnswers(record, answers, getDomainConfig(record.domain));
      await store.save(next);
      return ownerView(next);
    },

    async submit(user: AuthenticatedUser, caseId: string) {
      const record = await owned(user, caseId);
      const config = getDomainConfig(record.domain);
      const draft = await config.buildDraft({ answers: record.answers, context: record.context, safety: record.safety });
      const next = submitCase(record, draft, config);
      await store.save(next);
      await announce(next, "submitted");
      return ownerView(next);
    },

    async purchase(user: AuthenticatedUser, caseId: string, method: PaymentMethod) {
      const record = await owned(user, caseId);
      const config = getDomainConfig(record.domain);
      // Validate the case state before touching the payment provider.
      if (record.payment?.status === "confirmed") throw ApiError.conflict("This report is already paid for.");
      if (record.stage !== "visible_to_user") throw ApiError.conflict("This report cannot be purchased right now.");
      const provider = deps.payments();
      const purchaseId = newPurchaseId();
      const next = startPayment(record, { purchaseId, amountEtb: config.pricing.reportEtb, method, provider: provider.name });
      const { checkoutUrl } = await provider.createCheckout({ purchaseId, caseId, amountEtb: config.pricing.reportEtb, method });
      await store.save(next);
      return { purchaseId, amountEtb: config.pricing.reportEtb, currency: "ETB", method, checkoutUrl };
    },

    async confirmPurchase(user: AuthenticatedUser, caseId: string, purchaseId: string, reference?: string) {
      const record = await owned(user, caseId);
      const verdict = await deps.payments().verify({ purchaseId, reference });
      if (!verdict.paid || !verdict.reference) throw new ApiError(402, "Payment has not been received yet.");
      const next = confirmPayment(record, purchaseId, verdict.reference);
      await store.save(next);
      return ownerView(next);
    },

    async requestConsultation(user: AuthenticatedUser, caseId: string, input: Pick<ConsultationRecord, "format" | "preferredTimes" | "note">) {
      const record = await owned(user, caseId);
      const next = requestConsultation(record, input, getDomainConfig(record.domain));
      await store.save(next);
      return ownerView(next);
    },

    // ── Expert desk ────────────────────────────────────────────────────────

    async queue(user: AuthenticatedUser) {
      const expert = await deps.loadExpert(user.id);
      const domains = reviewableDomains(expert);
      if (!domains.length) throw ApiError.forbidden("Your practitioner credentials are not verified for any case type yet.");
      // Booking-opened cases belong to their business, so the platform pool only sees unlinked ones.
      const [waiting, mine] = await Promise.all([
        store.listForReview({ domains, stages: ["awaiting_expert"], businessId: null }),
        store.listForReview({ domains, stages: ["in_review"], reviewerId: user.id, businessId: null }),
      ]);
      return { domains, waiting: waiting.sort(byPriority).map(summary), inReview: mine.map(summary) };
    },

    /** A business's own cases, for its reviewers. */
    async businessQueue(user: AuthenticatedUser, businessId: string) {
      if (!(await deps.bridge.canReviewForBusiness(user.id, businessId))) throw ApiError.notFound("Business");
      const [waiting, inReview, done] = await Promise.all([
        store.listForReview({ stages: ["awaiting_expert"], businessId }),
        store.listForReview({ stages: ["in_review"], businessId }),
        store.listForReview({ stages: ["visible_to_user", "full_report_released", "consultation_requested"], businessId }),
      ]);
      return {
        waiting: waiting.sort(byPriority).map(summary),
        inReview: inReview.sort(byPriority).map(summary),
        approved: done.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 50).map(summary),
      };
    },

    async getForExpert(user: AuthenticatedUser, caseId: string) {
      const record = await reviewable(user, caseId);
      return toExpertView(record, getDomainConfig(record.domain));
    },

    async claim(user: AuthenticatedUser, caseId: string) {
      const next = claimCase(await reviewable(user, caseId), user.id);
      await store.save(next);
      await announce(next, "claimed");
      return toExpertView(next, getDomainConfig(next.domain));
    },

    async release(user: AuthenticatedUser, caseId: string) {
      const next = releaseClaim(await reviewable(user, caseId), user.id);
      await store.save(next);
      return toExpertView(next, getDomainConfig(next.domain));
    },

    async approve(user: AuthenticatedUser, caseId: string, input: { checklist: Record<string, boolean>; notes?: string; draft?: DraftReport }) {
      const record = await reviewable(user, caseId);
      const config = getDomainConfig(record.domain);
      const approved = approveCase(record, user.id, input, config);
      const next = approved.bookingId ? releaseWithBooking(approved) : approved;
      await store.save(next);
      await announce(next, "approved");
      return toExpertView(next, config);
    },
  };
}

export type CaseService = ReturnType<typeof createCaseService>;

export const caseService = createCaseService({
  store: dbCaseStore,
  payments: getPaymentProvider,
  loadExpert,
  expertSummaries,
  bridge: caseBridge,
});
