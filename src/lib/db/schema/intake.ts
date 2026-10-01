/**
 * Healer intake: per-service intake modalities, uploaded intake media, criteria-based
 * auto-response rules, response drafts awaiting the healer, and each business's own
 * manuscript texts (Metsehafe Fewus and Metsehafe Asmat).
 */
import { boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { bookings, businesses, messages, services } from "./marketplace";

export const DROPDOWN_TYPES = ["none", "custom", "metsehafe_fewus", "metsehafe_asmat", "awde_negest"] as const;
export type DropdownType = (typeof DROPDOWN_TYPES)[number];

export const serviceIntakeSettings = pgTable("service_intake_settings", {
  serviceId: uuid("service_id").primaryKey().references(() => services.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  allowText: boolean("allow_text").default(true).notNull(),
  allowImage: boolean("allow_image").default(true).notNull(),
  allowAudio: boolean("allow_audio").default(true).notNull(),
  allowVideo: boolean("allow_video").default(false).notNull(),
  /** none | custom | metsehafe_fewus | metsehafe_asmat | awde_negest */
  dropdownType: varchar("dropdown_type", { length: 30 }).default("none").notNull(),
  dropdownLabel: varchar("dropdown_label", { length: 160 }),
  customDropdownOptions: jsonb("custom_dropdown_options").$type<{ value: string; label: string }[]>().default([]).notNull(),
  /** Prompt shown above the text box. */
  textPrompt: varchar("text_prompt", { length: 300 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const intakeAttachments = pgTable(
  "intake_attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    /** Null until the booking that uses it is created. */
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "cascade" }),
    uploaderId: uuid("uploader_id").references(() => users.id, { onDelete: "set null" }),
    /** image | audio | video */
    kind: varchar("kind", { length: 10 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    storageKey: varchar("storage_key", { length: 200 }).notNull(),
    originalName: varchar("original_name", { length: 200 }),
    sha256: varchar("sha256", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("intake_attachments_booking_idx").on(table.bookingId), index("intake_attachments_uploader_idx").on(table.uploaderId, table.createdAt)],
);

export interface TriggerCriteria {
  /** Dropdown values (Fewus heading keys, Awde Negest categories or custom values). */
  dropdownValues?: string[];
  /** Words or phrases in the client's text (any language). */
  keywords?: string[];
  /** Ge'ez gematria digital roots 1–9 of the client's name. */
  digitalRoots?: number[];
  /** Humoral temperament from the Awde Negest circle. */
  humors?: ("esat" | "may" | "nifas" | "afere")[];
  /** Urgency score range 0–100. */
  minUrgency?: number;
  maxUrgency?: number;
}

export const autoResponseRules = pgTable(
  "auto_response_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    /** Null: applies to every service of the business. */
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    triggerCriteria: jsonb("trigger_criteria").$type<TriggerCriteria>().default({}).notNull(),
    /** instant_auto_send | draft_for_review */
    responseMode: varchar("response_mode", { length: 30 }).notNull(),
    templateTitle: varchar("template_title", { length: 200 }).notNull(),
    templateBody: text("template_body").notNull(),
    attachedRemedies: jsonb("attached_remedies").$type<{ remedyId?: string; name: string; note?: string }[]>().default([]).notNull(),
    /** Include the business's manuscript text (Fewus or Asmat) for the selected heading in the response. */
    includeFewusText: boolean("include_fewus_text").default(false).notNull(),
    /** Include the Ge'ez name reckoning / Awde Negest profile in the response. */
    includeProfile: boolean("include_profile").default(false).notNull(),
    priority: integer("priority").default(100).notNull(),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("auto_response_rules_business_idx").on(table.businessId, table.isActive)],
);

export const responseDrafts = pgTable(
  "response_drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "cascade" }).notNull(),
    ruleId: uuid("rule_id").references(() => autoResponseRules.id, { onDelete: "set null" }),
    /** rule | manual | system */
    source: varchar("source", { length: 20 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull(),
    remedies: jsonb("remedies").$type<{ remedyId?: string; name: string; note?: string }[]>().default([]).notNull(),
    /** draft | sent | dismissed */
    status: varchar("status", { length: 20 }).default("draft").notNull(),
    /** Why a rule's instant send was held for review (urgency, remedies). */
    heldReason: text("held_reason"),
    messageId: uuid("message_id").references(() => messages.id, { onDelete: "set null" }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    sentBy: uuid("sent_by").references(() => users.id, { onDelete: "set null" }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("response_drafts_booking_idx").on(table.bookingId, table.status)],
);

/** A business's own texts for each manuscript heading (fewus_* and asmat_* keys), from their copy of the book or their lineage. */
export const fewusTexts = pgTable(
  "fewus_texts",
  {
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    headingKey: varchar("heading_key", { length: 60 }).notNull(),
    geezText: text("geez_text"),
    amharicText: text("amharic_text"),
    guidance: text("guidance"),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.businessId, table.headingKey] })],
);
