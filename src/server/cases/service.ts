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
  requestConsultation,
  startPayment,
  submitCase,
} from "./machine";
import { getPaymentProvider, newPurchaseId, type PaymentMethod, type PaymentProvider } from "./payments";
import { dbCaseStore, type CaseStore } from "./store";
import type { ConsultationRecord, ConsentRecord, DraftReport, WorkflowCase, WorkflowDomain } from "./types";
import { toExpertView, toOwnerView } from "./views";

interface Deps {
  store: CaseStore;
  payments: () => PaymentProvider;
  loadExpert: (userId: string) => Promise<ExpertCandidate>;
  expertSummaries: typeof expertSummaries;
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
    const expert = await deps.loadExpert(user.id);
    const record = await store.get(caseId);
    if (!record || !canReview(expert, record.domain)) throw ApiError.notFound("Case");
    return record;
  }

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
    }) {
      const config = getDomainConfig(domain);
      const missing = config.safetyQuestions.filter((question) => input.safetyAnswers[question.id] === undefined).map((question) => question.id);
      if (missing.length) throw ApiError.badRequest("Please answer every safety question.", { missing });
      const record = createCase({ id: crypto.randomUUID(), userId: user.id, config, ...input, consent: input.consent ?? { dataUsage: true, emergencySupport: true, thirdPartySharing: false, retention: "90_days", consentedAt: new Date().toISOString(), consentTextVersion: "v1" } });
      await store.insert(record);
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
      return ownerView(next);
    },

    async purchase(user: AuthenticatedUser, caseId: string, method: PaymentMethod) {
      const record = await owned(user, caseId);
      const config = getDomainConfig(record.domain);
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
      const [waiting, mine] = await Promise.all([
        store.listForReview({ domains, stages: ["awaiting_expert"] }),
        store.listForReview({ domains, stages: ["in_review"], reviewerId: user.id }),
      ]);
      const summary = (record: WorkflowCase) => ({
        id: record.id,
        domain: record.domain,
        label: getDomainConfig(record.domain).label,
        stage: record.stage,
        priority: record.safety.priority,
        concern: record.safety.reason ?? null,
        createdAt: record.createdAt,
      });
      const byPriority = (a: WorkflowCase, b: WorkflowCase) => {
        const rank = { urgent: 0, high: 1, routine: 2 };
        return rank[a.safety.priority] - rank[b.safety.priority] || a.createdAt.localeCompare(b.createdAt);
      };
      return { domains, waiting: waiting.sort(byPriority).map(summary), inReview: mine.map(summary) };
    },

    async getForExpert(user: AuthenticatedUser, caseId: string) {
      const record = await reviewable(user, caseId);
      return toExpertView(record, getDomainConfig(record.domain));
    },

    async claim(user: AuthenticatedUser, caseId: string) {
      const next = claimCase(await reviewable(user, caseId), user.id);
      await store.save(next);
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
      const next = approveCase(record, user.id, input, config);
      await store.save(next);
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
});
