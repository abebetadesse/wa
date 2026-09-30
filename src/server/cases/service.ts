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
  createCase,
  recordAnswers,
  releaseClaim,
  releaseFree,
  releaseWithBooking,
  requestConsultation,
  settlePayment,
  startPayment,
  submitCase,
} from "./machine";
import type { CaseBilling, CasePayMethod } from "./billing";
import { caseBilling } from "@/server/payments/caseBilling";
import { dbCaseStore, type CaseStore } from "./store";
import type { ConsultationRecord, ConsentRecord, DomainConfig, DraftReport, WorkflowCase, WorkflowDomain } from "./types";
import { toExpertView, toOwnerView } from "./views";
import { caseBridge, type CaseBridge } from "@/server/marketplace/caseBridge";

interface Deps {
  store: CaseStore;
  billing: CaseBilling;
  loadExpert: (userId: string) => Promise<ExpertCandidate>;
  expertSummaries: typeof expertSummaries;
  /** Marketplace link: booking-opened cases are reviewed by the booked business's team. */
  bridge: CaseBridge;
}

export function createCaseService(deps: Deps) {
  const { store } = deps;

  /** The domain's configuration with the administrator's current prices. */
  async function configFor(domain: WorkflowDomain): Promise<DomainConfig> {
    const config = getDomainConfig(domain);
    const prices = await deps.billing.pricing(domain, { reportEtb: config.pricing.reportEtb, consultationEtb: config.pricing.consultationEtb });
    return { ...config, pricing: { ...config.pricing, ...prices } };
  }

  async function ownerView(record: WorkflowCase) {
    const expertId = record.review?.expertId;
    const [experts, config, attempt] = await Promise.all([
      expertId ? deps.expertSummaries([expertId]) : Promise.resolve(new Map()),
      configFor(record.domain),
      record.stage === "visible_to_user" && !record.bookingId ? deps.billing.latest(record.id) : Promise.resolve(null),
    ]);
    return { ...toOwnerView(record, config, expertId ? experts.get(expertId) ?? null : null), paymentAttempt: attempt };
  }

  async function released(record: WorkflowCase) {
    await store.save(record);
    await deps.billing.onReleased?.({ userId: record.userId, caseId: record.id, label: getDomainConfig(record.domain).label });
  }

  function assertPayable(record: WorkflowCase) {
    if (record.payment?.status === "confirmed") throw ApiError.conflict("This report is already paid for.");
    if (record.stage !== "visible_to_user" || record.bookingId) throw ApiError.conflict("This report cannot be purchased right now.");
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

  async function settle(caseId: string, payment: { purchaseId: string; amountEtb: number; method: string; provider: string; reference: string }) {
    const record = await store.get(caseId);
    if (!record) throw ApiError.notFound("Case");
    const next = settlePayment(record, payment);
    if (next !== record) await released(next);
    return next;
  }

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

    /**
     * Online checkout (Chapa, or telebirr through Chapa). When the report is free the full report
     * is released straight away and `released` is returned instead of a checkout URL.
     */
    async purchase(user: AuthenticatedUser, caseId: string, method: CasePayMethod, origin = "") {
      const record = await owned(user, caseId);
      assertPayable(record);
      const config = await configFor(record.domain);
      if (config.pricing.reportEtb <= 0) {
        const next = releaseFree(record);
        await released(next);
        return { released: true as const, amountEtb: 0, currency: "ETB", view: await ownerView(next) };
      }
      const { purchaseId, checkoutUrl } = await deps.billing.checkout({ user, caseId, amountEtb: config.pricing.reportEtb, method, description: `${config.label} full report`, origin });
      await store.save(startPayment(record, { purchaseId, amountEtb: config.pricing.reportEtb, method, provider: "chapa" }));
      return { released: false as const, purchaseId, amountEtb: config.pricing.reportEtb, currency: "ETB", method, checkoutUrl };
    },

    /** telebirr / bank transfer paid by the client; an administrator confirms it against the statement. */
    async submitManualPayment(user: AuthenticatedUser, caseId: string, input: { method: "telebirr" | "bank_transfer"; reference: string; payerName?: string; note?: string }) {
      const record = await owned(user, caseId);
      assertPayable(record);
      const config = await configFor(record.domain);
      if (config.pricing.reportEtb <= 0) throw ApiError.conflict("This report is free. Refresh the page to open it.");
      const { purchaseId } = await deps.billing.submitManual({ user, caseId, amountEtb: config.pricing.reportEtb, description: `${config.label} full report`, ...input });
      await store.save(startPayment(record, { purchaseId, amountEtb: config.pricing.reportEtb, method: input.method, provider: "manual" }));
      return ownerView(await owned(user, caseId));
    },

    /** Called when the client returns from checkout. Only the payment service can say it was paid. */
    async confirmPurchase(user: AuthenticatedUser, caseId: string, purchaseId: string) {
      const record = await owned(user, caseId);
      if (record.payment?.status === "confirmed" && record.payment.purchaseId === purchaseId) return ownerView(record);
      const verdict = await deps.billing.verify(user, purchaseId);
      if (!verdict.paid) throw new ApiError(402, "Payment has not been received yet.");
      return ownerView(await settle(caseId, { purchaseId, amountEtb: verdict.amountEtb ?? 0, method: verdict.method ?? "chapa", provider: verdict.provider ?? "chapa", reference: verdict.reference ?? purchaseId }));
    },

    /** Credits a confirmed payment (from the client's return, Chapa's webhook or an administrator). */
    settlePayment: settle,

    async requestConsultation(user: AuthenticatedUser, caseId: string, input: Pick<ConsultationRecord, "format" | "preferredTimes" | "note">) {
      const record = await owned(user, caseId);
      const next = requestConsultation(record, input, await configFor(record.domain));
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
      // Booking cases are covered by the booking; free reports are released on approval.
      const free = !approved.bookingId && (await configFor(approved.domain)).pricing.reportEtb <= 0;
      const next = approved.bookingId ? releaseWithBooking(approved) : free ? releaseFree(approved) : approved;
      await store.save(next);
      if (free) await deps.billing.onReleased?.({ userId: next.userId, caseId: next.id, label: config.label });
      await announce(next, "approved");
      return toExpertView(next, config);
    },
  };
}

export type CaseService = ReturnType<typeof createCaseService>;

export const caseService = createCaseService({
  store: dbCaseStore,
  billing: caseBilling,
  loadExpert,
  expertSummaries,
  bridge: caseBridge,
});
