import { pgTable, uuid, varchar, text, timestamp, jsonb, integer, boolean, primaryKey } from "../mysqlSchema";
import { users } from "./users";

export type HexacoreCoreCode = "P" | "H" | "C" | "E" | "S" | "O";
export type EthiopianSeason = "kiremt" | "tseday" | "bega" | "belg";

export const hexacoreAspects = pgTable("hexacore_aspects", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 3 }).notNull().unique(),
  coreCode: varchar("core_code", { length: 1 }).$type<HexacoreCoreCode>().notNull(),
  name: varchar("name", { length: 80 }).notNull(),
  nameAm: varchar("name_am", { length: 80 }),
  expression: text("expression"),
  bodyZone: varchar("body_zone", { length: 80 }),
  frequencyHz: integer("frequency_hz"),
  shadow: varchar("shadow", { length: 100 }),
  gift: varchar("gift", { length: 100 }),
  displayOrder: integer("display_order").notNull(),
});

export const hexacorePractices = pgTable("hexacore_practices", {
  id: uuid("id").primaryKey().defaultRandom(),
  coreCode: varchar("core_code", { length: 1 }).$type<HexacoreCoreCode>().notNull(),
  aspectCode: varchar("aspect_code", { length: 3 }),
  type: varchar("type", { length: 30 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  nameAm: varchar("name_am", { length: 120 }),
  instruction: text("instruction").notNull(),
  durationMin: integer("duration_min"),
  timeOfDay: varchar("time_of_day", { length: 30 }),
  soundHz: integer("sound_hz"),
  herbId: uuid("herb_id"),
  references: jsonb("references").$type<string[]>().default([]).notNull(),
});

export const hexacoreJournal = pgTable("hexacore_journal", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  entryDate: timestamp("entry_date").notNull(),
  selectedCore: varchar("selected_core", { length: 1 }).$type<HexacoreCoreCode>(),
  selectedAspect: varchar("selected_aspect", { length: 3 }),
  prompt: text("prompt"),
  response: text("response"),
  mood: integer("mood"),
  practiceCompleted: jsonb("practice_completed").$type<string[]>().default([]).notNull(),
  frequenciesSnapshot: jsonb("frequencies_snapshot").$type<Record<string, number>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hexacorePracticeLog = pgTable("hexacore_practice_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  practiceId: uuid("practice_id").references(() => hexacorePractices.id, { onDelete: "cascade" }).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  durationSec: integer("duration_sec"),
  notes: text("notes"),
});

export const hexacoreFrequencyHistory = pgTable("hexacore_frequency_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  frequencies: jsonb("frequencies").$type<Record<HexacoreCoreCode, number>>().notNull(),
  dominantCore: varchar("dominant_core", { length: 1 }).$type<HexacoreCoreCode>().notNull(),
  source: varchar("source", { length: 50 }).notNull(),
});

export const hexacoreCircles = pgTable("hexacore_circles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  coreCode: varchar("core_code", { length: 1 }).$type<HexacoreCoreCode>().notNull(),
  description: text("description"),
  isPrivate: boolean("is_private").default(false).notNull(),
  maxMembers: integer("max_members").default(12).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hexacoreCircleMembers = pgTable("hexacore_circle_members", {
  circleId: uuid("circle_id").references(() => hexacoreCircles.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 20 }).default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  memberKey: primaryKey({ columns: [table.circleId, table.userId] }),
}));

export const hexacoreCirclePosts = pgTable("hexacore_circle_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  circleId: uuid("circle_id").references(() => hexacoreCircles.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  body: text("body").notNull(),
  coreCode: varchar("core_code", { length: 1 }).$type<HexacoreCoreCode>(),
  aspectCode: varchar("aspect_code", { length: 3 }),
  frequenciesAtPost: jsonb("frequencies_at_post").$type<Record<string, number>>(),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hexacoreCircleReactions = pgTable("hexacore_circle_reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => hexacoreCirclePosts.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  kind: varchar("kind", { length: 30 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hexacoreCircleInvites = pgTable("hexacore_circle_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  circleId: uuid("circle_id").references(() => hexacoreCircles.id, { onDelete: "cascade" }).notNull(),
  invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
  invitedEmail: varchar("invited_email", { length: 255 }),
  invitedUserId: uuid("invited_user_id").references(() => users.id, { onDelete: "set null" }),
  token: varchar("token", { length: 80 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
