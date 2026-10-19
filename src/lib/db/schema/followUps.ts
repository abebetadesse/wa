/**
 * Outcome check-ins sent 3, 14 and 30 days after a report is delivered or a booking is completed
 * (src/server/followUps). One row per check-in; the person's answer is stored on the same row.
 */
import { boolean, index, integer, mysqlTable, timestamp, uniqueIndex, uuid, varchar } from "../mysqlSchema";
import { users } from "./users";
import { workflowCases } from "./caseWorkflow";
import { bookings, businesses } from "./marketplace";

export const followUps = mysqlTable(
  "follow_ups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    caseId: uuid("case_id").references(() => workflowCases.id, { onDelete: "cascade" }),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "cascade" }),
    domain: varchar("domain", { length: 40 }),
    label: varchar("label", { length: 160 }).notNull(),
    dayOffset: integer("day_offset").notNull(),
    dueAt: timestamp("due_at").notNull(),
    sentAt: timestamp("sent_at"),
    answeredAt: timestamp("answered_at"),
    answeredVia: varchar("answered_via", { length: 20 }),
    helped: varchar("helped", { length: 10 }),
    sideEffects: varchar("side_effects", { length: 1000 }),
    comment: varchar("comment", { length: 1000 }),
    needsAttention: boolean("needs_attention").default(false).notNull(),
    reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("follow_ups_case_day_uq").on(table.caseId, table.dayOffset),
    uniqueIndex("follow_ups_booking_day_uq").on(table.bookingId, table.dayOffset),
    index("follow_ups_due_idx").on(table.sentAt, table.dueAt),
    index("follow_ups_user_idx").on(table.userId, table.sentAt),
    index("follow_ups_reviewer_idx").on(table.reviewerId),
    index("follow_ups_business_idx").on(table.businessId),
  ],
);
