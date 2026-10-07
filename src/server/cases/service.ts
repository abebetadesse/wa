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
  addMessage,
  approveCase,
  assignCaseRole,
  attachAnalysis,
  claimCase,
  createCase,
  openQuestion,
  recordAnswers,
  releaseClaim,
  releaseFree,
  releaseWithBooking,
  requestConsultation,
  saveDraft,
  settlePayment,
  startPayment,
  submitCase,
} from "./machine";
import type { CaseBilling, CasePayMethod } from "./billing";
import { caseBilling } from "@/server/payments/caseBilling";
import { dbCaseStore, type CaseStore } from "./store";
import type { CaseAnalysis, CaseMessage, ConsultationRecord, ConsentRecord, DomainConfig, DraftReport, MessageChannel, WorkflowCase, WorkflowDomain } from "./types";
import { buildCaseAnalysis } from "./analysis";
import { loadAnalysisProfile } from "./analysisProfile";
import { ownerNotice, reviewerNotice, type OwnerNoticeType, type ReviewerNoticeType } from "./notices";
import { toExpertView, toOwnerView } from "./views";
import { caseBridge, type CaseBridge } from "@/server/marketplace/caseBridge";
import { getSettings } from "@/server/settings";
import { notify } from "@/server/marketplace/notifications";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, workflowCaseMedia } from "@/lib/db/schema";

async function send(userId: string, notice: { type: string; title: string; body?: string; href: string }, context: string) {
  try {
    await notify(userId, notice);
  } catch (error) {
    console.error(`[case-workflow] failed to notify ${context}:`, error);
  }
}

/** The people responsible for a platform case: its reviewer once claimed, otherwise the assigned role. */
async function notifyReviewers(record: WorkflowCase, type: ReviewerNoticeType) {
  const notice = reviewerNotice(record, getDomainConfig(record.domain).label, type);
  if (record.review?.expertId) return send(record.review.expertId, notice, "reviewer");
  if (record.businessId) return;
  const role = record.assignedRole ?? "admin";
  try {
    const recipients = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, role), eq(users.isActive, true), eq(users.isSuspended, false)));
    await Promise.all(recipients.map((recipient) => send(recipient.id, notice, "reviewer")));
  } catch (error) {
    console.error("[case-workflow] failed to notify assigned reviewers:", error);
  }
}

function notifyOwner(record: WorkflowCase, type: OwnerNoticeType, message?: CaseMessage) {
  return send(record.userId, ownerNotice(record, getDomainConfig(record.domain).label, type, message), "case owner");
}

interface Deps {
  store: CaseStore;
  billing: CaseBilling;
  loadExpert: (userId: string) => Promise<ExpertCandidate>;
  expertSummaries: typeof expertSummaries;
  /** Marketplace link: booking-opened cases are reviewed by the booked business's team. */
  bridge: CaseBridge;
  /** Injectable for memory-backed workflow tests; production reads administrator routing settings. */
  defaultRole?: (domain: WorkflowDomain) => Promise<string | null>;
  notifySubmitted?: (record: WorkflowCase) => Promise<void>;
  notifyApproved?: (record: WorkflowCase) => Promise<void>;
  /** Builds the reviewer's analysis dossier. Optional so workflow tests run without the knowledge base. */
  analyse?: (record: WorkflowCase, config: DomainConfig) => Promise<CaseAnalysis | null>;
  /** Progress updates and reviewer messages for the case owner (in-app, Telegram, WhatsApp). */
  notifyOwner?: (record: WorkflowCase, type: Exclude<OwnerNoticeType, "approved">, message?: CaseMessage) => Promise<void>;
  /** The owner replied: tell the reviewer (or the assigned role while nobody has claimed the case). */
  notifyReply?: (record: WorkflowCase) => Promise<void>;
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
      : await canReviewPlatformCase(user, record);
    if (!allowed) throw ApiError.notFound("Case");
    return record;
  }

  async function canReviewPlatformCase(user: AuthenticatedUser, record: WorkflowCase): Promise<boolean> {
    if (user.role === "admin" || user.role === "super_admin") return true;
    if (record.assignedRole && record.assignedRole !== user.role) return false;
    if (user.role === "expert" || user.role === "practitioner") {
      return canReview(await deps.loadExpert(user.id), record.domain);
    }
    return Boolean(record.assignedRole && user.permissions?.includes("cases:review"));
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
    assignedRole: record.assignedRole,
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

  /** The analysis supports the reviewer; a failure there must never block the person's request. */
  async function analysed(record: WorkflowCase, actorId?: string): Promise<WorkflowCase> {
    if (!deps.analyse) return record;
    try {
      return attachAnalysis(record, await deps.analyse(record, getDomainConfig(record.domain)), actorId);
    } catch (error) {
      console.error("[case-workflow] analysis failed:", error);
      return record;
    }
  }

  async function ownerReply(record: WorkflowCase, body: string, via: MessageChannel) {
    const text = body.trim();
    if (!text) throw ApiError.badRequest("Write a message first.");
    const withMessage = addMessage(record, { id: crypto.randomUUID(), from: "owner", authorId: record.userId, kind: "message", body: text.slice(0, 4000), via, at: new Date().toISOString() });
    // New information changes the picture only while the case is still being reviewed.
    const next = withMessage.stage === "awaiting_expert" || withMessage.stage === "in_review" ? await analysed(withMessage) : withMessage;
    await store.save(next);
    await deps.notifyReply?.(next);
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
      if (domain === "biological" && input.safetyAnswers.urgentSymptoms !== "yes" && !String(input.answers.caseNarrative ?? "").trim() && !String(input.answers.mediaId ?? "").trim()) {
        throw ApiError.badRequest("Write a detailed note or attach an audio/video recording.");
      }
      if (domain === "biological" && input.safetyAnswers.urgentSymptoms !== "yes" && input.consent?.dataUsage === false) {
        throw ApiError.badRequest("Consent to case analysis and report preparation is required for this pathway.");
      }
      const link = input.bookingId ? { bookingId: input.bookingId, ...(await deps.bridge.resolveBookingForCase(user, input.bookingId, domain)) } : null;
      const missing = config.safetyQuestions.filter((question) => input.safetyAnswers[question.id] === undefined).map((question) => question.id);
      if (missing.length) throw ApiError.badRequest("Please answer every safety question.", { missing });
      const record = createCase({ id: crypto.randomUUID(), userId: user.id, config, ...input, consent: input.consent ?? { dataUsage: true, emergencySupport: true, thirdPartySharing: false, retention: "90_days", consentedAt: new Date().toISOString(), consentTextVersion: "v1" }, businessId: link?.businessId ?? null, bookingId: link?.bookingId ?? null });
      if (domain === "biological" && typeof input.answers.mediaId === "string" && input.answers.mediaId) {
        const [media] = await db.select({ id: workflowCaseMedia.id }).from(workflowCaseMedia).where(and(
          eq(workflowCaseMedia.id, input.answers.mediaId),
          eq(workflowCaseMedia.userId, user.id),
          isNull(workflowCaseMedia.caseId),
        )).limit(1);
        if (!media) throw ApiError.badRequest("The audio/video attachment is missing or no longer available. Please upload it again.");
      }
      await store.insert(record);
      if (domain === "biological" && typeof input.answers.mediaId === "string" && input.answers.mediaId) {
        await db.update(workflowCaseMedia).set({ caseId: record.id }).where(and(
          eq(workflowCaseMedia.id, input.answers.mediaId),
          eq(workflowCaseMedia.userId, user.id),
          isNull(workflowCaseMedia.caseId),
        ));
        const [linked] = await db.select({ id: workflowCaseMedia.id }).from(workflowCaseMedia).where(and(
          eq(workflowCaseMedia.id, input.answers.mediaId),
          eq(workflowCaseMedia.caseId, record.id),
        )).limit(1);
        if (!linked) throw ApiError.conflict("The recording could not be linked to this case. Please contact support.");
      }
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
      const submitted = submitCase(record, draft, config);
      const assignedRole = record.businessId ? null : await deps.defaultRole?.(record.domain) ?? null;
      const next = await analysed({ ...submitted, assignedRole });
      await store.save(next);
      await announce(next, "submitted");
      if (!next.businessId) await deps.notifySubmitted?.(next);
      await deps.notifyOwner?.(next, "received");
      return ownerView(next);
    },

    /** The owner writes to their reviewer from the case page. */
    async reply(user: AuthenticatedUser, caseId: string, body: string) {
      return ownerView(await ownerReply(await owned(user, caseId), body, "app"));
    },

    /**
     * A reply sent to the Telegram or WhatsApp bot. It joins the case whose reviewer is waiting for
     * an answer, otherwise the most recent case still under review. Returns null when there is none.
     */
    async replyFromChannel(userId: string, body: string, via: Exclude<MessageChannel, "app">) {
      const records = await store.listByUser(userId);
      const target = records.find((record) => openQuestion(record)) ?? records.find((record) => record.stage === "awaiting_expert" || record.stage === "in_review");
      if (!target) return null;
      const next = await ownerReply(target, body, via);
      return { caseId: next.id, label: getDomainConfig(next.domain).label };
    },

    /** Short status lines for the bot's "status" command. */
    async statusFor(userId: string) {
      const records = await store.listByUser(userId);
      return records.slice(0, 5).map((record) => ({ id: record.id, label: getDomainConfig(record.domain).label, stage: record.stage, waitingForReply: Boolean(openQuestion(record)) }));
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
      const isAdministrator = user.role === "admin" || user.role === "super_admin";
      const isPractitioner = user.role === "expert" || user.role === "practitioner";
      const expert = isAdministrator || !isPractitioner ? null : await deps.loadExpert(user.id);
      const domains = expert ? reviewableDomains(expert) : undefined;
      if (!isAdministrator && !isPractitioner && !user.permissions?.includes("cases:review")) {
        throw ApiError.forbidden("Case review access is required.");
      }
      if (!isAdministrator && isPractitioner && !domains?.length) {
        throw ApiError.forbidden("Your practitioner credentials are not verified for any case type yet.");
      }
      const assignmentFilter = isAdministrator
        ? {}
        : { assignedRole: user.role, includeUnassigned: isPractitioner };
      const [waiting, mine] = await Promise.all([
        store.listForReview({ ...(domains ? { domains } : {}), ...assignmentFilter, stages: ["awaiting_expert"], businessId: null }),
        store.listForReview({ ...(domains ? { domains } : {}), ...assignmentFilter, stages: ["in_review"], ...(isAdministrator ? {} : { reviewerId: user.id }), businessId: null }),
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
      await deps.notifyOwner?.(next, "claimed");
      return toExpertView(next, getDomainConfig(next.domain));
    },

    /** The claiming reviewer saves an edited report without releasing it. */
    async saveDraft(user: AuthenticatedUser, caseId: string, draft: DraftReport) {
      const record = await reviewable(user, caseId);
      const next = saveDraft(record, user.id, { ...record.draft, ...draft });
      await store.save(next);
      return toExpertView(next, getDomainConfig(next.domain));
    },

    /** The claiming reviewer writes to the person, or asks for information the analysis is missing. */
    async message(user: AuthenticatedUser, caseId: string, input: { body: string; kind: CaseMessage["kind"] }) {
      const record = await reviewable(user, caseId);
      const message: CaseMessage = { id: crypto.randomUUID(), from: "reviewer", authorId: user.id, kind: input.kind, body: input.body.trim(), via: "app", at: new Date().toISOString() };
      const next = addMessage(record, message);
      await store.save(next);
      await deps.notifyOwner?.(next, "message", message);
      return toExpertView(next, getDomainConfig(next.domain));
    },

    /** Rebuilds the analysis on request (for example after the knowledge base was updated). */
    async reanalyse(user: AuthenticatedUser, caseId: string) {
      const record = await reviewable(user, caseId);
      if (record.stage !== "awaiting_expert" && record.stage !== "in_review") throw ApiError.conflict("Only requests under review can be analysed again.");
      const next = await analysed(record, user.id);
      await store.save(next);
      return toExpertView(next, getDomainConfig(next.domain));
    },

    async assignRole(user: AuthenticatedUser, caseId: string, role: string) {
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw ApiError.forbidden("Only administrators may reassign platform requests.");
      }
      const record = await store.get(caseId);
      if (!record) throw ApiError.notFound("Case");
      if (record.businessId) throw ApiError.badRequest("Business cases must be reassigned through the business workspace.");
      const next = assignCaseRole(record, role, user.id);
      await store.save(next);
      return summary(next);
    },

    async release(user: AuthenticatedUser, caseId: string) {
      const next = releaseClaim(await reviewable(user, caseId), user.id);
      await store.save(next);
      return toExpertView(next, getDomainConfig(next.domain));
    },

    async approve(user: AuthenticatedUser, caseId: string, input: { checklist: Record<string, boolean>; notes?: string; draft?: DraftReport }) {
      const record = await reviewable(user, caseId);
      const config = getDomainConfig(record.domain);
      // An edited draft keeps the fields the editor does not show (recommendations, evidence).
      const approved = approveCase(record, user.id, { ...input, draft: input.draft && record.draft ? { ...record.draft, ...input.draft } : input.draft }, config);
      // Booking cases are covered by the booking; free reports are released on approval.
      const free = !approved.bookingId && (await configFor(approved.domain)).pricing.reportEtb <= 0;
      const next = approved.bookingId ? releaseWithBooking(approved) : free ? releaseFree(approved) : approved;
      await store.save(next);
      if (free) await deps.billing.onReleased?.({ userId: next.userId, caseId: next.id, label: config.label });
      await announce(next, "approved");
      if (!next.businessId) {
        await deps.notifyApproved?.(next);
      }
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
  defaultRole: async (domain) => (await getSettings("caseRouting")).domains[domain] ?? "admin",
  notifySubmitted: (record) => notifyReviewers(record, "submitted"),
  notifyApproved: (record) => notifyOwner(record, "approved"),
  analyse: async (record, config) => buildCaseAnalysis(record, config, record.consent.dataUsage ? await loadAnalysisProfile(record.userId) : {}),
  notifyOwner,
  notifyReply: (record) => notifyReviewers(record, "reply"),
});
