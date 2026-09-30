/** Live CaseBilling: admin-controlled prices and the platform payment ledger. */
import type { CaseBilling } from "@/server/cases/billing";
import { getSettings } from "@/server/settings";
import { notify } from "@/server/marketplace/notifications";
import { createOnlinePayment, latestPayment, submitManualPayment, verifyOnlinePayment } from "./index";

export const caseBilling: CaseBilling = {
  async pricing(domain, defaults) {
    const settings = await getSettings("payments");
    if (settings.freeMode) return { reportEtb: 0, consultationEtb: 0 };
    return { ...defaults, ...(settings.prices[domain] ?? {}) };
  },

  async checkout({ user, caseId, amountEtb, method, description, origin }) {
    const payment = await createOnlinePayment({ user, purpose: "case_report", subjectId: caseId, amountEtb, method, description, returnPath: `/case/workflows/${caseId}`, origin });
    return { purchaseId: payment.txRef, checkoutUrl: payment.checkoutUrl };
  },

  async submitManual({ user, caseId, amountEtb, description, method, reference, payerName, note }) {
    const payment = await submitManualPayment({ user, purpose: "case_report", subjectId: caseId, amountEtb, description, method, reference, payerName, note });
    return { purchaseId: payment.txRef };
  },

  async verify(user, purchaseId) {
    const payment = await verifyOnlinePayment(purchaseId, user.id);
    if (payment.status !== "paid") return { paid: false };
    return { paid: true, amountEtb: Number(payment.amountEtb), method: payment.method, provider: payment.channel, reference: payment.providerReference ?? payment.txRef };
  },

  async latest(caseId) {
    const row = await latestPayment("case_report", caseId);
    if (!row) return null;
    return {
      purchaseId: row.txRef,
      method: row.method,
      channel: row.channel,
      status: row.status,
      amountEtb: Number(row.amountEtb),
      reference: row.channel === "manual" ? row.providerReference : null,
      reviewNote: row.status === "rejected" ? row.reviewNote : null,
      createdAt: row.createdAt.toISOString(),
    };
  },

  async onReleased({ userId, caseId, label }) {
    await notify(userId, { type: "case.released", title: "Your full report is ready", body: label, href: `/case/workflows/${caseId}` });
  },
};
