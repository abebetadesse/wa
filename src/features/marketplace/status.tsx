import { Badge, type BadgeTone } from "@/components/ui/badge";

export const BOOKING_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  requested: { label: "Awaiting confirmation", tone: "warning" },
  confirmed: { label: "Confirmed", tone: "success" },
  declined: { label: "Declined", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  completed: { label: "Completed", tone: "brand" },
  no_show: { label: "Missed", tone: "danger" },
};

export const PAYMENT_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  unpaid: { label: "Unpaid", tone: "neutral" },
  partial: { label: "Part paid", tone: "warning" },
  paid: { label: "Paid", tone: "success" },
  refunded: { label: "Refunded", tone: "neutral" },
};

export function BookingStatusBadge({ status }: { status: string }) {
  const meta = BOOKING_STATUS[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const meta = PAYMENT_STATUS[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function formatWhen(iso: string | Date, timeZone: string, style: "short" | "long" = "long") {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
