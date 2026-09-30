/**
 * What the case workflow needs from payments. The live implementation (src/server/payments/caseBilling.ts)
 * uses administrator settings and the platform payment ledger; tests pass an in-memory one.
 */
import type { AuthenticatedUser } from "@/lib/auth";
import type { WorkflowDomain } from "./types";

export type CasePayMethod = "chapa" | "telebirr" | "bank_transfer";

export interface PaymentAttempt {
  purchaseId: string;
  method: string;
  channel: string;
  status: string;
  amountEtb: number;
  reference: string | null;
  reviewNote: string | null;
  createdAt: string;
}

export interface VerifiedPayment {
  paid: boolean;
  amountEtb?: number;
  method?: string;
  provider?: string;
  reference?: string;
}

export interface CaseBilling {
  /** Current prices; zero means free (free mode, or an administrator set the price to 0). */
  pricing(domain: WorkflowDomain, defaults: { reportEtb: number; consultationEtb: number }): Promise<{ reportEtb: number; consultationEtb: number }>;
  checkout(input: { user: AuthenticatedUser; caseId: string; amountEtb: number; method: CasePayMethod; description: string; origin: string }): Promise<{ purchaseId: string; checkoutUrl: string }>;
  submitManual(input: {
    user: AuthenticatedUser;
    caseId: string;
    amountEtb: number;
    description: string;
    method: "telebirr" | "bank_transfer";
    reference: string;
    payerName?: string;
    note?: string;
  }): Promise<{ purchaseId: string }>;
  /** Asks the payment service; only its answer can mark a purchase paid. */
  verify(user: AuthenticatedUser, purchaseId: string): Promise<VerifiedPayment>;
  latest(caseId: string): Promise<PaymentAttempt | null>;
  /** Tells the owner their full report is ready. */
  onReleased?(input: { userId: string; caseId: string; label: string }): Promise<void>;
}
