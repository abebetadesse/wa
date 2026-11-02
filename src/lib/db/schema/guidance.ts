// Reference tables for the Spiritual Guidance services (date finding and naming). Everything a
// tradition expert may need to correct lives here and is edited from /admin/guidance, never in code.
import { mysqlTable, uuid, varchar, integer, boolean, jsonb, timestamp, date, index, uniqueIndex, primaryKey } from "../mysqlSchema";
import { users } from "./users";

/** Numeric value of each letter for a counting system (Awde Negest, Pythagorean, Chaldean …). */
export const guidanceLetterValues = mysqlTable("guidance_letter_values", {
  id: uuid("id").primaryKey().defaultRandom(),
  system: varchar("system", { length: 40 }).notNull(),
  letter: varchar("letter", { length: 8 }).notNull(),
  value: integer("value").notNull(),
  /** Set once a tradition expert has confirmed the value; unvalidated values are flagged on results. */
  validated: boolean("validated").default(false).notNull(),
  notes: varchar("notes", { length: 500 }).default("").notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("guidance_letter_values_system_letter_uq").on(table.system, table.letter)]);

/**
 * Keyed documents of one kind: Awde Negest stars and counting rules, hexagram meanings and pairs,
 * explanation templates, settings. `language` is "" for language-neutral rows.
 */
export const guidanceEntries = mysqlTable("guidance_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: varchar("kind", { length: 40 }).notNull(),
  entryKey: varchar("entry_key", { length: 120 }).notNull(),
  language: varchar("language", { length: 5 }).default("").notNull(),
  data: jsonb("data").notNull(),
  validated: boolean("validated").default(false).notNull(),
  notes: varchar("notes", { length: 500 }).default("").notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("guidance_entries_kind_key_lang_uq").on(table.kind, table.entryKey, table.language)]);

/** One row per service card: which event it is for and how much each method counts. */
export const guidanceServices = mysqlTable("guidance_services", {
  slug: varchar("slug", { length: 60 }).primaryKey(),
  /** { am, om, en } */
  names: jsonb("names").notNull(),
  descriptions: jsonb("descriptions").notNull(),
  /** "date" (find dates), "naming" or "profile". */
  mode: varchar("mode", { length: 12 }).notNull(),
  /** Weights per method, 0–100, summing to 100. */
  weights: jsonb("weights").notNull(),
  /** Preferred Moon themes, time-of-day window, whether offices must be open … */
  options: jsonb("options").notNull(),
  active: boolean("active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * A feast, fast, commemoration or public holiday and what it means for each kind of event.
 * `anchor` decides how the date is found: a fixed calendar date ("fixed"), days from Orthodox or
 * Western Easter, or a weekday ("weekly", with `day` 0–6 from Sunday). A fixed row with no `day`
 * covers the whole month (Ramadan). `lengthDays` or `untilMonth`/`untilDay` make it a period.
 */
export const guidanceCalendarDays = mysqlTable("guidance_calendar_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** orthodox, muslim, catholic, protestant or public (national holidays). */
  tradition: varchar("tradition", { length: 20 }).notNull(),
  entryKey: varchar("entry_key", { length: 80 }).notNull(),
  /** feast, fast, commemoration, holiday or worship. */
  kind: varchar("kind", { length: 20 }).notNull(),
  anchor: varchar("anchor", { length: 20 }).notNull(),
  /** ethiopian, gregorian or hijri (for "fixed"). */
  calendar: varchar("calendar", { length: 10 }).default("ethiopian").notNull(),
  month: integer("month"),
  day: integer("day"),
  offsetDays: integer("offset_days").default(0).notNull(),
  lengthDays: integer("length_days").default(1).notNull(),
  untilMonth: integer("until_month"),
  untilDay: integer("until_day"),
  /** { am, om, en } */
  names: jsonb("names").notNull(),
  /** { score, avoidFor: [...], favourFor: [...], officesClosed, note: { am, om, en } } */
  effects: jsonb("effects").notNull(),
  active: boolean("active").default(true).notNull(),
  validated: boolean("validated").default(false).notNull(),
  notes: varchar("notes", { length: 500 }).default("").notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("guidance_calendar_days_key_uq").on(table.tradition, table.entryKey)]);

/** The announced first day of a Hijri month, when the moon sighting differs from the calculation. */
export const guidanceHijriMonthStarts = mysqlTable("guidance_hijri_month_starts", {
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  startDate: date("start_date").notNull(),
  note: varchar("note", { length: 300 }).default("").notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.year, table.month] })]);

/** Names offered by the naming service, imported from CSV and edited by admins. */
export const guidanceNames = mysqlTable("guidance_names", {
  id: uuid("id").primaryKey().defaultRandom(),
  nameGeez: varchar("name_geez", { length: 80 }).default("").notNull(),
  nameLatin: varchar("name_latin", { length: 80 }).default("").notNull(),
  /** male, female or unisex. */
  gender: varchar("gender", { length: 10 }).notNull(),
  /** ["am", "om", "ti", "en", "ar"] */
  languages: jsonb("languages").notNull(),
  /** ["orthodox", "muslim", "protestant", "catholic", "neutral"] */
  religions: jsonb("religions").notNull(),
  origin: varchar("origin", { length: 80 }).default("").notNull(),
  /** { am, om, en } */
  meanings: jsonb("meanings").notNull(),
  /** Saints' or feast days the name belongs to: [{ calendar, month, day }]. */
  feastDays: jsonb("feast_days").notNull(),
  tags: jsonb("tags").notNull(),
  source: varchar("source", { length: 200 }).default("").notNull(),
  active: boolean("active").default(true).notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("guidance_names_name_uq").on(table.nameGeez, table.nameLatin),
  index("guidance_names_gender_idx").on(table.gender, table.active),
]);

export type GuidanceLetterValueRow = typeof guidanceLetterValues.$inferSelect;
export type GuidanceEntryRow = typeof guidanceEntries.$inferSelect;
export type GuidanceServiceRow = typeof guidanceServices.$inferSelect;
export type GuidanceCalendarDayRow = typeof guidanceCalendarDays.$inferSelect;
export type GuidanceHijriMonthStartRow = typeof guidanceHijriMonthStarts.$inferSelect;
export type GuidanceNameRow = typeof guidanceNames.$inferSelect;
