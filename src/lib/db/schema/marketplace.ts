/**
 * Marketplace for traditional healers and cultural businesses.
 *
 * Clients discover verified businesses and book their services; each business runs its practice
 * from a workspace (bookings, clients, services, remedies, payments, reviews, messages).
 * All catalogues (categories, service kinds) are data managed by administrators, not code.
 */
import { sql } from "drizzle-orm";
import { bigserial, index, integer, jsonb, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar, boolean, smallint, date } from "drizzle-orm/pg-core";
import { users } from "./users";
import { herbs } from "./herbs";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

// ── Catalogues ───────────────────────────────────────────────────────────────

/** Kinds of business, e.g. herbalist, debtera, bone-setter, artisan, ceremony service. */
export const businessCategories = pgTable("business_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  nameAm: varchar("name_am", { length: 120 }),
  description: text("description"),
  /** "healing" or "cultural" — drives safety requirements and navigation grouping. */
  sector: varchar("sector", { length: 20 }).notNull(),
  icon: varchar("icon", { length: 40 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

/** Kinds of service a business can offer, e.g. consultation, reading, remedy preparation, ceremony, class. */
export const serviceKinds = pgTable("service_kinds", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  nameAm: varchar("name_am", { length: 120 }),
  description: text("description"),
  /** Whether bookings of this kind require the client safety screen (e.g. remedies taken by mouth). */
  requiresSafetyScreen: boolean("requires_safety_screen").default(false).notNull(),
  /** Optional link to an expert-reviewed case workflow domain (career, spiritual …). */
  caseDomain: varchar("case_domain", { length: 30 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

// ── Businesses ───────────────────────────────────────────────────────────────

export const businesses = pgTable(
  "businesses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    ownerId: uuid("owner_id").references(() => users.id, { onDelete: "restrict" }).notNull(),
    categoryId: uuid("category_id").references(() => businessCategories.id).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    nameAm: varchar("name_am", { length: 160 }),
    tagline: varchar("tagline", { length: 240 }),
    description: text("description"),
    region: varchar("region", { length: 100 }),
    city: varchar("city", { length: 100 }),
    address: text("address"),
    phone: varchar("phone", { length: 30 }),
    email: varchar("email", { length: 255 }),
    languages: jsonb("languages").$type<string[]>().default([]).notNull(),
    deliveryModes: jsonb("delivery_modes").$type<string[]>().default([]).notNull(),
    logoUrl: text("logo_url"),
    coverUrl: text("cover_url"),
    timezone: varchar("timezone", { length: 60 }).default("Africa/Addis_Ababa").notNull(),
    /** draft → pending_verification → verified; suspended by administrators. */
    status: varchar("status", { length: 30 }).default("draft").notNull(),
    verification: jsonb("verification").$type<{
      submittedAt?: string;
      reviewedAt?: string;
      reviewedBy?: string;
      notes?: string;
      credentials?: { label: string; issuer?: string; reference?: string }[];
    }>(),
    ratingAverage: numeric("rating_average", { precision: 3, scale: 2 }),
    ratingCount: integer("rating_count").default(0).notNull(),
    ...timestamps,
  },
  (table) => [
    index("businesses_status_idx").on(table.status),
    index("businesses_category_idx").on(table.categoryId),
    index("businesses_region_idx").on(table.region),
  ],
);

/** People who work in a business workspace. */
export const businessMembers = pgTable(
  "business_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    /** owner | manager | practitioner | staff */
    role: varchar("role", { length: 20 }).notNull(),
    title: varchar("title", { length: 120 }),
    isBookable: boolean("is_bookable").default(false).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("business_members_unique").on(table.businessId, table.userId)],
);

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    kindId: uuid("kind_id").references(() => serviceKinds.id).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    nameAm: varchar("name_am", { length: 160 }),
    description: text("description"),
    durationMinutes: integer("duration_minutes").notNull(),
    priceEtb: numeric("price_etb", { precision: 12, scale: 2 }).notNull(),
    deliveryModes: jsonb("delivery_modes").$type<string[]>().default([]).notNull(),
    /** Minutes kept free after each booking. */
    bufferMinutes: integer("buffer_minutes").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps,
  },
  (table) => [index("services_business_idx").on(table.businessId)],
);

/** Weekly opening hours (per business, optionally per practitioner). Minutes since midnight. */
export const availabilityRules = pgTable(
  "availability_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    memberId: uuid("member_id").references(() => businessMembers.id, { onDelete: "cascade" }),
    weekday: smallint("weekday").notNull(),
    startMinute: integer("start_minute").notNull(),
    endMinute: integer("end_minute").notNull(),
    ...timestamps,
  },
  (table) => [index("availability_business_idx").on(table.businessId)],
);

export const timeOff = pgTable("time_off", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  memberId: uuid("member_id").references(() => businessMembers.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  reason: varchar("reason", { length: 200 }),
  ...timestamps,
});

// ── Clients, bookings, payments ──────────────────────────────────────────────

/** A business's own client record (CRM). May be linked to a platform account. */
export const businessClients = pgTable(
  "business_clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    name: varchar("name", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 30 }),
    email: varchar("email", { length: 255 }),
    /** Private practitioner notes; never shown to the client. */
    notes: text("notes"),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    consent: jsonb("consent").$type<{ recordKeeping?: string; contact?: string }>().default({}).notNull(),
    ...timestamps,
  },
  (table) => [
    index("business_clients_business_idx").on(table.businessId),
    uniqueIndex("business_clients_user_unique").on(table.businessId, table.userId),
  ],
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: varchar("reference", { length: 20 }).notNull().unique(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    serviceId: uuid("service_id").references(() => services.id).notNull(),
    clientId: uuid("client_id").references(() => businessClients.id).notNull(),
    bookedByUserId: uuid("booked_by_user_id").references(() => users.id, { onDelete: "set null" }),
    memberId: uuid("member_id").references(() => businessMembers.id, { onDelete: "set null" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    deliveryMode: varchar("delivery_mode", { length: 20 }).notNull(),
    /** requested → confirmed → completed; declined / cancelled / no_show end the booking. */
    status: varchar("status", { length: 20 }).default("requested").notNull(),
    priceEtb: numeric("price_etb", { precision: 12, scale: 2 }).notNull(),
    paymentStatus: varchar("payment_status", { length: 20 }).default("unpaid").notNull(),
    clientNote: text("client_note"),
    businessNote: text("business_note"),
    safety: jsonb("safety").$type<Record<string, unknown>>(),
    caseId: uuid("case_id"),
    cancelledBy: varchar("cancelled_by", { length: 20 }),
    cancelReason: text("cancel_reason"),
    ...timestamps,
  },
  (table) => [
    index("bookings_business_time_idx").on(table.businessId, table.startsAt),
    index("bookings_client_idx").on(table.clientId),
    index("bookings_user_idx").on(table.bookedByUserId),
    index("bookings_status_idx").on(table.status),
  ],
);

/** Manually recorded payments (cash, bank transfer, mobile money reference). */
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    clientId: uuid("client_id").references(() => businessClients.id, { onDelete: "set null" }),
    amountEtb: numeric("amount_etb", { precision: 12, scale: 2 }).notNull(),
    method: varchar("method", { length: 30 }).notNull(),
    reference: varchar("reference", { length: 120 }),
    note: text("note"),
    /** recorded | voided */
    status: varchar("status", { length: 20 }).default("recorded").notNull(),
    receivedOn: date("received_on").notNull(),
    recordedBy: uuid("recorded_by").references(() => users.id, { onDelete: "set null" }),
    voidedBy: uuid("voided_by").references(() => users.id, { onDelete: "set null" }),
    voidReason: text("void_reason"),
    ...timestamps,
  },
  (table) => [index("payments_business_idx").on(table.businessId, table.receivedOn)],
);

// ── Remedies and inventory ───────────────────────────────────────────────────

export const remedies = pgTable(
  "remedies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    nameAm: varchar("name_am", { length: 160 }),
    /** powder, oil, decoction, smoke, ointment … */
    form: varchar("form", { length: 40 }).notNull(),
    description: text("description"),
    unit: varchar("unit", { length: 20 }).notNull(),
    stockQuantity: numeric("stock_quantity", { precision: 12, scale: 2 }).default("0").notNull(),
    reorderLevel: numeric("reorder_level", { precision: 12, scale: 2 }).default("0").notNull(),
    priceEtb: numeric("price_etb", { precision: 12, scale: 2 }),
    /** Practitioner-entered cautions shown to clients. */
    safetyNotes: text("safety_notes"),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [index("remedies_business_idx").on(table.businessId)],
);

/** Remedy ingredients link to the herb knowledge base so the herb-drug safety gate can check them. */
export const remedyIngredients = pgTable(
  "remedy_ingredients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    remedyId: uuid("remedy_id").references(() => remedies.id, { onDelete: "cascade" }).notNull(),
    herbId: uuid("herb_id").references(() => herbs.id),
    name: varchar("name", { length: 160 }).notNull(),
    ...timestamps,
  },
  (table) => [index("remedy_ingredients_remedy_idx").on(table.remedyId)],
);

export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  remedyId: uuid("remedy_id").references(() => remedies.id, { onDelete: "cascade" }).notNull(),
  /** Positive for restock, negative for dispensing or waste. */
  quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
  reason: varchar("reason", { length: 30 }).notNull(),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  note: text("note"),
  recordedBy: uuid("recorded_by").references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
});

// ── Reviews and messages ─────────────────────────────────────────────────────

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "cascade" }).notNull().unique(),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    rating: smallint("rating").notNull(),
    comment: text("comment"),
    response: text("response"),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    /** published | hidden (moderation) */
    status: varchar("status", { length: 20 }).default("published").notNull(),
    ...timestamps,
  },
  (table) => [index("reviews_business_idx").on(table.businessId)],
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    clientUserId: uuid("client_user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [uniqueIndex("conversations_unique").on(table.businessId, table.clientUserId)],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
    senderId: uuid("sender_id").references(() => users.id, { onDelete: "set null" }),
    /** client | business */
    senderSide: varchar("sender_side", { length: 10 }).notNull(),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("messages_conversation_idx").on(table.conversationId, table.createdAt)],
);

// ── Realtime ─────────────────────────────────────────────────────────────────

/**
 * Event outbox for realtime updates. Rows are written in the same request as the change and
 * announced with NOTIFY; SSE clients resume from their last event id after reconnecting.
 */
export const realtimeEvents = pgTable(
  "realtime_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    /** Audience: "user:<uuid>" or "business:<uuid>". */
    channel: varchar("channel", { length: 80 }).notNull(),
    type: varchar("type", { length: 60 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  },
  (table) => [index("realtime_events_channel_idx").on(table.channel, table.id)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    type: varchar("type", { length: 60 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body"),
    href: text("href"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("notifications_user_idx").on(table.userId, table.createdAt)],
);

// ── Team invitations ─────────────────────────────────────────────────────────

/**
 * An invitation to join a business team. Only a SHA-256 digest of the token is stored; the link
 * is shown once to the inviter (and sent in-app when the invitee already has an account).
 */
export const businessInvitations = pgTable(
  "business_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull(),
    title: varchar("title", { length: 120 }),
    isBookable: boolean("is_bookable").default(false).notNull(),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    acceptedBy: uuid("accepted_by").references(() => users.id, { onDelete: "set null" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index("business_invitations_business_idx").on(table.businessId)],
);
