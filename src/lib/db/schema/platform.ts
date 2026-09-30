/**
 * Platform-level settings and the ledger of payments the platform itself collects
 * (case reports, consultations). Business payments for bookings live in `payments` (marketplace.ts).
 */
import { index, jsonb, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

/** Administrator-controlled settings, one JSON document per key (see src/server/settings). */
export const platformSettings = pgTable("platform_settings", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const platformPayments = pgTable(
  "platform_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Our reference, sent to the provider as tx_ref. */
    txRef: varchar("tx_ref", { length: 64 }).notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    /** case_report | consultation */
    purpose: varchar("purpose", { length: 30 }).notNull(),
    subjectId: uuid("subject_id").notNull(),
    description: varchar("description", { length: 200 }),
    amountEtb: numeric("amount_etb", { precision: 12, scale: 2 }).notNull(),
    /** chapa | telebirr | bank_transfer | free */
    method: varchar("method", { length: 30 }).notNull(),
    /** chapa (online checkout) | manual (proof checked by an administrator) | free */
    channel: varchar("channel", { length: 20 }).notNull(),
    /** pending → paid | failed | cancelled; manual: awaiting_review → paid | rejected */
    status: varchar("status", { length: 20 }).notNull(),
    checkoutUrl: text("checkout_url"),
    /** Provider's reference (Chapa ref id) or the payer's transaction number for manual payments. */
    providerReference: varchar("provider_reference", { length: 120 }),
    payerName: varchar("payer_name", { length: 160 }),
    payerNote: text("payer_note"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNote: text("review_note"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    raw: jsonb("raw").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("platform_payments_subject_idx").on(table.purpose, table.subjectId),
    index("platform_payments_status_idx").on(table.status, table.createdAt),
    index("platform_payments_user_idx").on(table.userId),
  ],
);
