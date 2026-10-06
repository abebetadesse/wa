import { mysqlTable, uuid, varchar, numeric, jsonb, timestamp, boolean, text } from "../mysqlSchema";
import { users } from "./users";
import { nutrients } from "./nutrition";
import { herbs } from "./herbs";

export const intakeSubmissions = mysqlTable("intake_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  payload: jsonb("payload").notNull(), // Canonical normalized profile snapshot & diet log
  status: varchar("status", { length: 20 }).default("pending").notNull(), // "pending" | "processing" | "complete" | "failed"
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  errorMessage: text("error_message"),
});

export const wellbeingGapReports = mysqlTable("wellbeing_gap_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => intakeSubmissions.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  modelVersion: varchar("model_version", { length: 50 }).notNull(), // "eval-v3.0.0-deterministic+claude-3-5"
  summaryNarrative: text("summary_narrative"),
  safetyGateVerified: boolean("safety_gate_verified").default(true).notNull(),
});

export const identifiedGaps = mysqlTable("identified_gaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").references(() => wellbeingGapReports.id, { onDelete: "cascade" }).notNull(),
  nutrientId: uuid("nutrient_id").references(() => nutrients.id).notNull(),
  gapType: varchar("gap_type", { length: 20 }).notNull(), // "deficiency" | "excess"
  severity: varchar("severity", { length: 20 }).notNull(), // "low" | "moderate" | "high"
  estimatedIntakePct: numeric("estimated_intake_pct", { precision: 6, scale: 2 }).notNull(), // e.g. 42.50% of adjusted target
  targetRda: numeric("target_rda", { precision: 10, scale: 2 }).notNull(), // Profile & altitude-adjusted target
  calculatedDailyIntake: numeric("calculated_daily_intake", { precision: 10, scale: 2 }).notNull(),
  sourceRef: varchar("source_ref", { length: 100 }).notNull(), // "EFCT2025-EVAL-THR"
});

export const gapCauses = mysqlTable("gap_causes", {
  id: uuid("id").primaryKey().defaultRandom(),
  gapId: uuid("gap_id").references(() => identifiedGaps.id, { onDelete: "cascade" }).notNull(),
  causeType: varchar("cause_type", { length: 40 }).notNull(), // "dietary" | "absorption_inhibitor" | "medication" | "age_related" | "lifestyle"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  evidenceStrength: varchar("evidence_strength", { length: 20 }).notNull(), // "established" | "probable" | "preliminary"
  sourceRef: varchar("source_ref", { length: 100 }).notNull(), // Traceability is required
});

export const gapSolutions = mysqlTable("gap_solutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  gapId: uuid("gap_id").references(() => identifiedGaps.id, { onDelete: "cascade" }).notNull(),
  solutionType: varchar("solution_type", { length: 40 }).notNull(), // "dietary_change" | "traditional_remedy" | "lifestyle" | "referral"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  herbId: uuid("herb_id").references(() => herbs.id), // optional if traditional_remedy
  interactionChecked: varchar("interaction_checked", { length: 20 }).default("pending").notNull(), // "pass" | "flagged" | "n_a"
  rankScore: numeric("rank_score", { precision: 4, scale: 2 }).default("1.00").notNull(),
  sourceRef: varchar("source_ref", { length: 100 }).notNull(),
});

// Immutable audit trail for every evaluation, safety gate check, administrative action, and user viewing
export const auditLog = mysqlTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  eventType: varchar("event_type", { length: 80 }).notNull(), // maps to action / event type
  action: varchar("action", { length: 100 }),
  resourceType: varchar("resource_type", { length: 50 }),
  resourceId: varchar("resource_id", { length: 100 }),
  payload: jsonb("payload").default({}).notNull(),
  details: jsonb("details").default({}),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  sessionId: uuid("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
