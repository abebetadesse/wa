/**
 * Diagnostic Portal Schema — Multi-Strand Knowledge Sessions
 * Stores health inquiries, structured AI reasoning, urgency scores,
 * prioritized solutions, and 5-stage action plans.
 */
import { pgTable, uuid, varchar, timestamp, jsonb, text, integer } from "../mysqlSchema";
import { users } from "./users";

export const diagnosticSessions = pgTable("diagnostic_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  query: text("query").notNull(),
  mode: varchar("mode", { length: 20 }).default("text").notNull(),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  urgencyLevel: varchar("urgency_level", { length: 20 }).notNull(),
  urgencyScore: integer("urgency_score").notNull(),
  intent: varchar("intent", { length: 50 }).notNull(),
  summary: jsonb("summary").notNull(),
  causes: jsonb("causes").default([]).notNull(),
  solutions: jsonb("solutions").default([]).notNull(),
  actionPlan: jsonb("action_plan").notNull(),
  safetyWarnings: jsonb("safety_warnings").default([]).notNull(),
  culturalContext: jsonb("cultural_context"), // Domain B isolated
  astrologicalContext: jsonb("astrological_context"), // Domain B isolated
  rawPayload: jsonb("raw_payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
