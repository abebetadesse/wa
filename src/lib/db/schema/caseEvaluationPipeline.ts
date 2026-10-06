import { mysqlTable, uuid, varchar, text, integer, boolean, jsonb, timestamp } from "../mysqlSchema";
import { users } from "./users";

export const pipelineProfiles = mysqlTable("pipeline_profiles", {
  id: varchar("id", { length: 120 }).primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  userIdString: varchar("user_id_string", { length: 120 }).notNull(),
  ageBand: varchar("age_band", { length: 40 }).notNull(),
  sex: varchar("sex", { length: 20 }).notNull(),
  pregnancyStatus: varchar("pregnancy_status", { length: 40 }),
  chronicConditions: jsonb("chronic_conditions").default([]).notNull(),
  currentMeds: jsonb("current_meds").default([]).notNull(),
  allergies: jsonb("allergies").default([]).notNull(),
  traditionalUse: jsonb("traditional_use").default([]).notNull(),
  diet: jsonb("diet").notNull(),
  substanceUse: jsonb("substance_use").notNull(),
  location: jsonb("location").notNull(),
  spiritualContext: text("spiritual_context"),
  culturalContext: text("cultural_context"),
  consent: jsonb("consent").default({}).notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pipelinePreliminaryAnalyses = mysqlTable("pipeline_preliminary_analyses", {
  id: varchar("id", { length: 120 }).primaryKey(),
  profileId: varchar("profile_id", { length: 120 }).notNull(),
  locationCtx: jsonb("location_ctx").notNull(),
  sections: jsonb("sections").notNull(),
  confidence: varchar("confidence", { length: 20 }).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const pipelineCases = mysqlTable("pipeline_cases", {
  id: varchar("id", { length: 120 }).primaryKey(),
  userId: varchar("user_id", { length: 120 }).notNull(),
  profileId: varchar("profile_id", { length: 120 }).notNull(),
  narrative: text("narrative").notNull(),
  symptoms: jsonb("symptoms").default([]).notNull(),
  duration: varchar("duration", { length: 100 }).notNull(),
  selfTreatments: jsonb("self_treatments").default([]).notNull(),
  attachments: jsonb("attachments").default([]).notNull(),
  emergencyDetected: boolean("emergency_detected").default(false).notNull(),
  emergencySignals: jsonb("emergency_signals").default([]).notNull(),
  emergencyRoutedAt: timestamp("emergency_routed_at"),
  status: varchar("status", { length: 50 }).default("SUBMITTED").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pipelineReports = mysqlTable("pipeline_reports", {
  id: varchar("id", { length: 120 }).primaryKey(),
  caseId: varchar("case_id", { length: 120 }).notNull(),
  kind: varchar("kind", { length: 20 }).notNull(), // USER | PROFESSIONAL
  version: integer("version").default(1).notNull(),
  payload: jsonb("payload").notNull(),
  safetyGate: jsonb("safety_gate"),
  confidence: varchar("confidence", { length: 20 }).notNull(),
  provenance: jsonb("provenance").notNull(),
  authoredBy: varchar("authored_by", { length: 120 }),
  approvedBy: varchar("approved_by", { length: 120 }),
  approvedAt: timestamp("approved_at"),
  publishedAt: timestamp("published_at"),
  supersededBy: varchar("superseded_by", { length: 120 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pipelineCaseEvents = mysqlTable("pipeline_case_events", {
  id: varchar("id", { length: 120 }).primaryKey(),
  caseId: varchar("case_id", { length: 120 }).notNull(),
  actorId: varchar("actor_id", { length: 120 }).notNull(),
  actorRole: varchar("actor_role", { length: 30 }).notNull(),
  type: varchar("type", { length: 60 }).notNull(), // submitted, evaluated, edited, approved, returned, published, gate_blocked, gate_overridden
  before: jsonb("before"),
  after: jsonb("after"),
  note: text("note"),
  at: timestamp("at").defaultNow().notNull(),
});

export const pipelineAssignments = mysqlTable("pipeline_assignments", {
  id: varchar("id", { length: 120 }).primaryKey(),
  caseId: varchar("case_id", { length: 120 }).notNull(),
  professionalId: varchar("professional_id", { length: 120 }).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});
