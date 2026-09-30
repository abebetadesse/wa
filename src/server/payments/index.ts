/**
 * Payments the platform collects (case reports). Three ways to pay, each switchable by administrators:
 *
 *   chapa          online checkout (cards, telebirr, CBE Birr, M-Pesa …) → verified with Chapa's API
 *   telebirr       via Chapa checkout, or manually to the platform's telebirr number
 *   bank_transfer  manually to one of the platform's bank accounts
 *
 * Manual payments carry the payer's transaction number and wait for an administrator to confirm
 * them. Every success runs through `settle()`, which is idempotent and credits the subject once.
 */
import crypto from "node:crypto";
import { and, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { platformPayments, users } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { getSettings, type PaymentSettings } from "@/server/settings";
import { notify, notifyAdmins } from "@/server/marketplace/notifications";
import { publish, userChannel } from "@/server/realtime";
import { chapaConfigured, chapaMode, initializeCheckout, verifyTransaction } from "./chapa";

export const PAY_METHODS = ["chapa", "telebirr", "bank_transfer"] as const;
export type PayMethod = (typeof PAY_METHODS)[number];
export const PAYMENT_PURPOSES = ["case_report"] as const;
export type PaymentPurpose = (typeof PAYMENT_PURPOSES)[number];

export type PlatformPayment = typeof platformPayments.$inferSelect;

// ── What the payer can use ───────────────────────────────────────────────────

export interface PaymentOption {
  id: PayMethod;
  label: string;
  /** online: redirect to Chapa; manual: pay yourself, then submit the transaction number. */
  kind: "online" | "manual";
  description: string;
  telebirr?: { accountName: string; phone: string };
  accounts?: { bank: string; accountName: string; accountNumber: string }[];
}

export function availableOptions(settings: PaymentSettings, chapaReady = chapaConfigured()): PaymentOption[] {
  const { chapa, telebirr, bank_transfer } = settings.methods;
  const options: PaymentOption[] = [];
  if (telebirr.enabled) {
    if (telebirr.channel === "chapa" && chapaReady) {
      options.push({ id: "telebirr", label: "telebirr", kind: "online", description: "Pay from your telebirr wallet on the secure checkout page." });
    } else if (telebirr.channel === "manual" && telebirr.phone) {
      options.push({ id: "telebirr", label: "telebirr", kind: "manual", description: "Send the amount to our telebirr number, then enter the transaction number.", telebirr: { accountName: telebirr.accountName, phone: telebirr.phone } });
    }
  }
  if (chapa.enabled && chapaReady) {
    options.push({ id: "chapa", label: "Chapa", kind: "online", description: "Card, CBE Birr, M-Pesa, Amole or bank, on Chapa's secure checkout." });
  }
  if (bank_transfer.enabled && bank_transfer.accounts.length) {
    options.push({ id: "bank_transfer", label: "Bank transfer", kind: "manual", description: "Transfer to one of our accounts, then enter the transaction reference.", accounts: bank_transfer.accounts });
  }
  return options;
}

export async function paymentOptions() {
  const settings = await getSettings("payments");
  return { freeMode: settings.freeMode, options: availableOptions(settings), instructions: settings.instructions || null };
}

/** Configuration health for the admin screen. */
export async function paymentStatusForAdmin() {
  const settings = await getSettings("payments");
  return {
    chapa: { configured: chapaConfigured(), mode: chapaMode(), webhookSecret: Boolean(process.env.CHAPA_WEBHOOK_SECRET) },
    available: availableOptions(settings).map((option) => option.id),
  };
}

// ── Creating payments ────────────────────────────────────────────────────────

const newTxRef = () => `EWP-${crypto.randomUUID()}`;

export function appOrigin(fallback: string) {
  return (process.env.APP_URL || fallback).replace(/\/$/, "");
}

async function optionFor(method: PayMethod, kind: PaymentOption["kind"]) {
  const option = availableOptions(await getSettings("payments")).find((item) => item.id === method);
  if (!option) throw ApiError.badRequest("That payment method is not available right now.");
  if (option.kind !== kind) {
    throw ApiError.badRequest(kind === "online" ? "This method is paid manually: send the amount, then submit the transaction number." : "This method is paid online through the checkout page.");
  }
  return option;
}

export async function createOnlinePayment(input: {
  user: AuthenticatedUser;
  purpose: PaymentPurpose;
  subjectId: string;
  amountEtb: number;
  method: PayMethod;
  description: string;
  returnPath: string;
  origin: string;
}) {
  await optionFor(input.method, "online");
  const txRef = newTxRef();
  const [payer] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, input.user.id)).limit(1);
  const [first, ...rest] = (payer?.name ?? "").trim().split(/\s+/);
  const origin = appOrigin(input.origin);
  const [row] = await db
    .insert(platformPayments)
    .values({ txRef, userId: input.user.id, purpose: input.purpose, subjectId: input.subjectId, description: input.description, amountEtb: input.amountEtb.toFixed(2), method: input.method, channel: "chapa", status: "pending" })
    .returning();
  try {
    const { checkoutUrl } = await initializeCheckout({
      txRef,
      amountEtb: input.amountEtb,
      email: payer?.email,
      firstName: first || null,
      lastName: rest.join(" ") || null,
      title: "Payment",
      description: input.description,
      callbackUrl: `${origin}/api/payments/chapa/callback`,
      returnUrl: `${origin}${input.returnPath}${input.returnPath.includes("?") ? "&" : "?"}payment=${encodeURIComponent(txRef)}`,
    });
    await db.update(platformPayments).set({ checkoutUrl, updatedAt: new Date() }).where(eq(platformPayments.id, row.id));
    return { ...row, checkoutUrl };
  } catch (error) {
    await db.update(platformPayments).set({ status: "failed", reviewNote: error instanceof Error ? error.message.slice(0, 500) : "checkout failed", updatedAt: new Date() }).where(eq(platformPayments.id, row.id));
    throw error;
  }
}

export const manualPaymentInput = z.object({
  method: z.enum(["telebirr", "bank_transfer"]),
  reference: z.string().trim().min(4, "Enter the transaction number from your receipt.").max(60).regex(/^[A-Za-z0-9 _./-]+$/, "Use only the letters and numbers from your receipt."),
  payerName: z.string().trim().max(160).optional(),
  note: z.string().trim().max(500).optional(),
});

export async function submitManualPayment(input: z.infer<typeof manualPaymentInput> & {
  user: AuthenticatedUser;
  purpose: PaymentPurpose;
  subjectId: string;
  amountEtb: number;
  description: string;
}) {
  await optionFor(input.method, "manual");
  const reference = input.reference.toUpperCase().replace(/\s+/g, "");
  const pending = await db
    .select({ id: platformPayments.id })
    .from(platformPayments)
    .where(and(eq(platformPayments.purpose, input.purpose), eq(platformPayments.subjectId, input.subjectId), eq(platformPayments.status, "awaiting_review")))
    .limit(1);
  if (pending.length) throw ApiError.conflict("You already sent a payment for this. We'll let you know as soon as it's confirmed.");
  try {
    const [row] = await db
      .insert(platformPayments)
      .values({
        txRef: newTxRef(),
        userId: input.user.id,
        purpose: input.purpose,
        subjectId: input.subjectId,
        description: input.description,
        amountEtb: input.amountEtb.toFixed(2),
        method: input.method,
        channel: "manual",
        status: "awaiting_review",
        providerReference: reference,
        payerName: input.payerName || null,
        payerNote: input.note || null,
      })
      .returning();
    await notifyAdmins({ type: "payment.review", title: "Payment to confirm", body: `${input.description}: ${input.amountEtb} ETB by ${input.method === "telebirr" ? "telebirr" : "bank transfer"} (${reference})`, href: "/admin/payments" });
    return row;
  } catch (error) {
    if (pgCode(error) === "23505") throw ApiError.conflict("This transaction number has already been submitted.");
    throw error;
  }
}

// ── Confirming ───────────────────────────────────────────────────────────────

/** Asks Chapa about an online payment and settles it when paid. Safe to call repeatedly. */
export async function verifyOnlinePayment(txRef: string, expectedUserId?: string) {
  const [row] = await db.select().from(platformPayments).where(eq(platformPayments.txRef, txRef)).limit(1);
  if (!row || (expectedUserId && row.userId !== expectedUserId)) throw ApiError.notFound("Payment");
  if (row.channel !== "chapa") return row;
  if (row.status === "paid") {
    await settleSubject(row);
    return row;
  }
  const result = await verifyTransaction(txRef);
  if (!result.paid) return row;
  // Never trust a paid status for less than we asked for, or in another currency.
  if ((result.currency && result.currency !== "ETB") || (result.amountEtb != null && result.amountEtb + 0.005 < Number(row.amountEtb))) {
    const [flagged] = await db
      .update(platformPayments)
      .set({ status: "needs_attention", raw: result.raw, reviewNote: `Paid ${result.amountEtb} ${result.currency}, expected ${row.amountEtb} ETB.`, updatedAt: new Date() })
      .where(eq(platformPayments.id, row.id))
      .returning();
    return flagged;
  }
  return settle(row, { providerReference: result.reference ?? txRef, raw: result.raw });
}

export const reviewInput = z.object({ decision: z.enum(["paid", "rejected"]), note: z.string().trim().max(500).optional() });

export async function reviewManualPayment(admin: AuthenticatedUser, paymentId: string, input: z.infer<typeof reviewInput>) {
  const [row] = await db.select().from(platformPayments).where(eq(platformPayments.id, paymentId)).limit(1);
  if (!row) throw ApiError.notFound("Payment");
  if (row.channel !== "manual" || row.status !== "awaiting_review") throw ApiError.conflict("This payment has already been reviewed.");
  if (input.decision === "rejected") {
    if (!input.note) throw ApiError.badRequest("Tell the payer why the payment was not accepted.");
    const [updated] = await db
      .update(platformPayments)
      .set({ status: "rejected", reviewedBy: admin.id, reviewedAt: new Date(), reviewNote: input.note, updatedAt: new Date() })
      .where(and(eq(platformPayments.id, row.id), eq(platformPayments.status, "awaiting_review")))
      .returning();
    if (!updated) throw ApiError.conflict("This payment has already been reviewed.");
    if (row.userId) {
      await notify(row.userId, { type: "payment.rejected", title: "Payment not confirmed", body: `${row.description ?? "Your payment"}: ${input.note}`, href: subjectHref(row) });
    }
    return updated;
  }
  return settle(row, { reviewedBy: admin.id, reviewNote: input.note });
}

async function settle(row: PlatformPayment, extra: { providerReference?: string; raw?: Record<string, unknown>; reviewedBy?: string; reviewNote?: string }) {
  let updated: PlatformPayment | undefined;
  try {
    [updated] = await db
      .update(platformPayments)
      .set({
        status: "paid",
        paidAt: new Date(),
        providerReference: extra.providerReference ?? row.providerReference,
        raw: extra.raw ?? row.raw,
        reviewedBy: extra.reviewedBy ?? null,
        reviewedAt: extra.reviewedBy ? new Date() : null,
        reviewNote: extra.reviewNote ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(platformPayments.id, row.id), inArray(platformPayments.status, ["pending", "awaiting_review", "failed"])))
      .returning();
  } catch (error) {
    // Another payment for the same subject already succeeded: keep the money visible for a refund.
    if (pgCode(error) !== "23505") throw error;
    [updated] = await db
      .update(platformPayments)
      .set({ status: "needs_attention", reviewNote: "Paid twice for the same item. Refund this payment.", providerReference: extra.providerReference ?? row.providerReference, raw: extra.raw ?? row.raw, updatedAt: new Date() })
      .where(eq(platformPayments.id, row.id))
      .returning();
    await notifyAdmins({ type: "payment.duplicate", title: "Duplicate payment to refund", body: `${row.description ?? row.txRef}: ${row.amountEtb} ETB`, href: "/admin/payments" });
    return updated ?? row;
  }
  const paid = updated ?? (await db.select().from(platformPayments).where(eq(platformPayments.id, row.id)).limit(1))[0];
  if (paid?.status === "paid") await settleSubject(paid);
  return paid ?? row;
}

/**
 * Credits whatever was paid for. Idempotent: the case machine ignores repeats of the same purchase.
 * If the item can no longer take this payment (e.g. it was unlocked for free meanwhile), the money
 * is flagged for a refund instead of failing, so webhooks are not retried forever.
 */
async function settleSubject(payment: PlatformPayment) {
  if (payment.purpose === "case_report") {
    const { caseService } = await import("@/server/cases/service");
    try {
      await caseService.settlePayment(payment.subjectId, {
        purchaseId: payment.txRef,
        amountEtb: Number(payment.amountEtb),
        method: payment.method,
        provider: payment.channel,
        reference: payment.providerReference ?? payment.txRef,
      });
    } catch (error) {
      if (!(error instanceof ApiError) || (error.status !== 409 && error.status !== 404)) throw error;
      await db
        .update(platformPayments)
        .set({ status: "needs_attention", reviewNote: `Paid, but could not be applied: ${error.message} Refund this payment.`, updatedAt: new Date() })
        .where(eq(platformPayments.id, payment.id));
      await notifyAdmins({ type: "payment.attention", title: "Payment to refund", body: `${payment.description ?? payment.txRef}: ${payment.amountEtb} ETB`, href: "/admin/payments" });
      return;
    }
  }
  if (payment.userId) await publish(userChannel(payment.userId), "payment.paid", { paymentId: payment.id, purpose: payment.purpose, subjectId: payment.subjectId });
}

function subjectHref(payment: Pick<PlatformPayment, "purpose" | "subjectId">) {
  return payment.purpose === "case_report" ? `/case/workflows/${payment.subjectId}` : "/account";
}

// ── Reading ──────────────────────────────────────────────────────────────────

export async function latestPayment(purpose: PaymentPurpose, subjectId: string) {
  const [row] = await db
    .select()
    .from(platformPayments)
    .where(and(eq(platformPayments.purpose, purpose), eq(platformPayments.subjectId, subjectId)))
    .orderBy(desc(platformPayments.createdAt))
    .limit(1);
  return row ?? null;
}

export const adminPaymentQuery = z.object({
  status: z.enum(["all", "awaiting_review", "paid", "pending", "rejected", "failed", "needs_attention"]).default("all"),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export async function listPlatformPayments(query: z.infer<typeof adminPaymentQuery>) {
  const conditions: SQL[] = [];
  if (query.status !== "all") conditions.push(eq(platformPayments.status, query.status));
  const [rows, [totals]] = await Promise.all([
    db
      .select({ payment: platformPayments, payerEmail: users.email, payerAccountName: users.name })
      .from(platformPayments)
      .leftJoin(users, eq(users.id, platformPayments.userId))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(platformPayments.createdAt))
      .limit(query.limit),
    db
      .select({
        paidEtb: sql<string>`coalesce(sum(${platformPayments.amountEtb}) filter (where ${platformPayments.status} = 'paid'), 0)`,
        paid30Etb: sql<string>`coalesce(sum(${platformPayments.amountEtb}) filter (where ${platformPayments.status} = 'paid' and ${platformPayments.paidAt} > now() - interval '30 days'), 0)`,
        awaitingReview: sql<number>`count(*) filter (where ${platformPayments.status} = 'awaiting_review')::int`,
        needsAttention: sql<number>`count(*) filter (where ${platformPayments.status} = 'needs_attention')::int`,
      })
      .from(platformPayments),
  ]);
  return {
    payments: rows.map((row) => ({ ...row.payment, payerEmail: row.payerEmail, payerAccountName: row.payerAccountName, raw: undefined })),
    totals: { paidEtb: Number(totals.paidEtb), paid30Etb: Number(totals.paid30Etb), awaitingReview: totals.awaitingReview, needsAttention: totals.needsAttention },
  };
}

export async function myPlatformPayments(userId: string) {
  const rows = await db.select().from(platformPayments).where(eq(platformPayments.userId, userId)).orderBy(desc(platformPayments.createdAt)).limit(100);
  return rows.map(({ raw: _raw, checkoutUrl: _url, reviewedBy: _by, ...row }) => ({ ...row, href: subjectHref(row) }));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function pgCode(error: unknown): string | undefined {
  for (let current = error as { code?: string; cause?: unknown } | undefined; current; current = current.cause as typeof current) {
    if (typeof current.code === "string" && /^[0-9A-Z]{5}$/.test(current.code)) return current.code;
  }
  return undefined;
}
