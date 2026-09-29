import type { BadgeTone } from "@/components/ui/badge";

export const BUSINESS_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  pending_verification: { label: "Verification pending", tone: "warning" },
  verified: { label: "Verified · live", tone: "success" },
  suspended: { label: "Suspended", tone: "danger" },
};

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank transfer",
  telebirr: "Telebirr",
  cbe_birr: "CBE Birr",
  other: "Other",
};

export const minutesToTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
export const timeToMinutes = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + (m || 0);
};
