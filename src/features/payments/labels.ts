import type { BadgeTone } from "@/components/ui/badge";

export const PAYMENT_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: "Awaiting payment", tone: "neutral" },
  awaiting_review: { label: "Being checked", tone: "warning" },
  paid: { label: "Paid", tone: "success" },
  rejected: { label: "Not found", tone: "danger" },
  failed: { label: "Failed", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  needs_attention: { label: "Needs attention", tone: "danger" },
  // Business ledger (client-reported payments)
  recorded: { label: "Confirmed", tone: "success" },
  voided: { label: "Voided", tone: "neutral" },
};

const METHOD_LABELS: Record<string, string> = {
  chapa: "Chapa",
  telebirr: "telebirr",
  bank_transfer: "Bank transfer",
  cbe_birr: "CBE Birr",
  cash: "Cash",
  free: "Free",
  booking: "Included in booking",
  other: "Other",
};

export const payMethodLabel = (method: string) => METHOD_LABELS[method] ?? method;
