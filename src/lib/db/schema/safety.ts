/**
 * Medicine & remedy safety matrix: modern medicines and traditional remedies with their
 * pharmacological properties, plus curated interaction pairs. Seeded from
 * src/server/safety/seed.ts and maintained by knowledge editors.
 */
import { boolean, index, jsonb, mysqlTable, text, timestamp, uniqueIndex, uuid, varchar } from "../mysqlSchema";
import { users } from "./users";

export const safetySubstances = mysqlTable(
  "safety_substances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 200 }).notNull(),
    /** modern | traditional */
    kind: varchar("kind", { length: 20 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    scientificName: varchar("scientific_name", { length: 200 }),
    amharicName: varchar("amharic_name", { length: 200 }),
    aliases: jsonb("aliases").$type<string[]>().default([]).notNull(),
    properties: jsonb("properties").$type<string[]>().default([]).notNull(),
    cautions: jsonb("cautions").$type<Record<string, { level: "avoid" | "caution"; note?: string }>>().default({}).notNull(),
    notes: text("notes"),
    evidence: varchar("evidence", { length: 120 }),
    /** published | draft | archived */
    status: varchar("status", { length: 20 }).default("published").notNull(),
    /** seed | custom */
    origin: varchar("origin", { length: 20 }).notNull(),
    customized: boolean("customized").default(false).notNull(),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("safety_substances_kind_idx").on(table.kind, table.category)],
);

export const safetyInteractions = mysqlTable(
  "safety_interactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Slugs stored in alphabetical order so each pair exists once. */
    substanceA: varchar("substance_a", { length: 100 }).references(() => safetySubstances.slug, { onDelete: "cascade", onUpdate: "cascade" }).notNull(),
    substanceB: varchar("substance_b", { length: 100 }).references(() => safetySubstances.slug, { onDelete: "cascade", onUpdate: "cascade" }).notNull(),
    severity: varchar("severity", { length: 20 }).notNull(),
    mechanism: text("mechanism").notNull(),
    effect: text("effect").notNull(),
    management: text("management").notNull(),
    evidence: varchar("evidence", { length: 120 }).notNull(),
    source: varchar("source", { length: 300 }).notNull(),
    status: varchar("status", { length: 20 }).default("published").notNull(),
    origin: varchar("origin", { length: 20 }).notNull(),
    customized: boolean("customized").default(false).notNull(),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("safety_interactions_pair_unique").on(table.substanceA, table.substanceB)],
);
