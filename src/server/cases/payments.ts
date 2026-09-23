/**
 * Payment confirmation must come from the payment provider, never from the browser.
 * No live provider (Telebirr, CBE Birr, Chapa…) is integrated yet; until one is, only the simulated
 * provider exists, and it is available in development only when PAYMENTS_MODE=simulated.
 */
import crypto from "node:crypto";
import { ApiError } from "@/lib/api/route";

export const PAYMENT_METHODS = ["telebirr", "cbe_birr", "chapa"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface PaymentProvider {
  name: string;
  createCheckout(input: { purchaseId: string; caseId: string; amountEtb: number; method: PaymentMethod }): Promise<{ checkoutUrl: string }>;
  /** Asks the provider whether the purchase was paid. Returns the provider's reference when it was. */
  verify(input: { purchaseId: string; reference?: string }): Promise<{ paid: boolean; reference?: string }>;
}

const simulated: PaymentProvider = {
  name: "simulated",
  async createCheckout({ caseId, purchaseId }) {
    return { checkoutUrl: `/case/workflows/${caseId}/payment?purchaseId=${purchaseId}` };
  },
  async verify({ purchaseId }) {
    return { paid: true, reference: `SIM-${purchaseId}` };
  },
};

export function getPaymentProvider(): PaymentProvider {
  if (process.env.PAYMENTS_MODE === "simulated" && process.env.NODE_ENV !== "production") return simulated;
  throw new ApiError(503, "Online payment is not available yet. Please contact support to complete your purchase.");
}

export function newPurchaseId() {
  return `pur_${crypto.randomUUID()}`;
}
