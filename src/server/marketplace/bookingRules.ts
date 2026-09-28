/** Pure booking rules: who may move a booking to which status, and payment status from amounts. */
import crypto from "node:crypto";

export const BOOKING_STATUSES = ["requested", "confirmed", "declined", "cancelled", "completed", "no_show"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export type Actor = "client" | "business";

const BUSINESS_MOVES: Partial<Record<BookingStatus, BookingStatus[]>> = {
  requested: ["confirmed", "declined"],
  confirmed: ["completed", "no_show", "cancelled"],
};
const CLIENT_MOVES: Partial<Record<BookingStatus, BookingStatus[]>> = {
  requested: ["cancelled"],
  confirmed: ["cancelled"],
};

export type TransitionCheck = { ok: true } | { ok: false; reason: string };

export function canTransition(input: { from: BookingStatus; to: BookingStatus; actor: Actor; startsAt: Date; now?: Date }): TransitionCheck {
  const now = input.now ?? new Date();
  const allowed = (input.actor === "business" ? BUSINESS_MOVES : CLIENT_MOVES)[input.from] ?? [];
  if (!allowed.includes(input.to)) return { ok: false, reason: `A ${input.from.replace("_", " ")} booking cannot be marked ${input.to.replace("_", " ")}.` };
  if (input.actor === "client" && input.startsAt <= now) return { ok: false, reason: "This booking has already started. Please message the business instead." };
  if ((input.to === "completed" || input.to === "no_show") && input.startsAt > now) {
    return { ok: false, reason: "A booking can only be completed or marked no-show after its start time." };
  }
  return { ok: true };
}

export function paymentStatus(priceEtb: number, paidEtb: number): "unpaid" | "partial" | "paid" {
  if (paidEtb <= 0) return "unpaid";
  return paidEtb + 0.005 >= priceEtb ? "paid" : "partial";
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Short, unambiguous reference clients can read over the phone, e.g. "BK-7F3K2Q". */
export function bookingReference() {
  const bytes = crypto.randomBytes(6);
  return `BK-${[...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("")}`;
}
