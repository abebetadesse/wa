/**
 * Healer toolkit: the platform's engines and knowledge repositories as tools that businesses pick,
 * knowledge sets curated by administrators, and the usage signals that drive recommendations.
 */
import { bigserial, boolean, index, integer, jsonb, mysqlTable, primaryKey, text, timestamp, uuid, varchar } from "../mysqlSchema";
import { users } from "./users";
import { businesses } from "./marketplace";

export const toolkitTools = mysqlTable("toolkit_tools", {
  key: varchar("key", { length: 80 }).primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description").notNull().default(""),
  /** care_pathway | evidence | practice | support | governance */
  group: varchar("group", { length: 30 }).notNull(),
  href: varchar("href", { length: 500 }).notNull(),
  /** public | practitioner | admin */
  audience: varchar("audience", { length: 20 }).notNull(),
  strands: jsonb("strands").$type<string[]>().default([]).notNull(),
  suggestedFor: jsonb("suggested_for").$type<{ categories: string[]; serviceKinds: string[] }>().default({ categories: [], serviceKinds: [] }).notNull(),
  /** builtin: from src/server/toolkit/registry.ts · custom: added by an administrator */
  source: varchar("source", { length: 20 }).notNull(),
  /** Set once an administrator edits a built-in tool, so later syncs keep their wording. */
  customized: boolean("customized").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** A curated bundle of tools and knowledge strands, published to businesses by administrators. */
export const knowledgeSets = mysqlTable("knowledge_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description").notNull().default(""),
  toolKeys: jsonb("tool_keys").$type<string[]>().default([]).notNull(),
  strands: jsonb("strands").$type<string[]>().default([]).notNull(),
  /** Business categories (slugs) that receive this set automatically when it is published. */
  categorySlugs: jsonb("category_slugs").$type<string[]>().default([]).notNull(),
  /** Admin guidance shown to healers with the set. */
  guidance: text("guidance"),
  /** draft | published | archived */
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  version: integer("version").default(0).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const businessKnowledgeSets = mysqlTable(
  "business_knowledge_sets",
  {
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    setId: uuid("set_id").references(() => knowledgeSets.id, { onDelete: "cascade" }).notNull(),
    /** active | removed (removed sets are not re-added automatically) */
    status: varchar("status", { length: 20 }).default("active").notNull(),
    /** auto: added because of the business's category · manual: chosen by the business */
    origin: varchar("origin", { length: 20 }).notNull(),
    /** Last version the business has seen, to show "updated" badges. */
    seenVersion: integer("seen_version").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.businessId, table.setId] })],
);

/** Tools a business chose to keep in its toolkit (on top of those its sets provide). */
export const businessTools = mysqlTable(
  "business_tools",
  {
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    toolKey: varchar("tool_key", { length: 80 }).references(() => toolkitTools.key, { onDelete: "cascade" }).notNull(),
    /** added | hidden (hidden tools stay out even when a set includes them) */
    state: varchar("state", { length: 20 }).default("added").notNull(),
    pinned: boolean("pinned").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.businessId, table.toolKey] })],
);

/** One row per tool opened by someone working in a business: the behaviour signal. */
export const toolkitUsage = mysqlTable(
  "toolkit_usage",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    toolKey: varchar("tool_key", { length: 80 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("toolkit_usage_business_idx").on(table.businessId, table.createdAt), index("toolkit_usage_tool_idx").on(table.toolKey, table.createdAt)],
);
