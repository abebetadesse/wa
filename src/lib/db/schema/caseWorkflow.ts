import { mysqlTable, uuid, varchar, text, integer, boolean, jsonb, timestamp, index } from "../mysqlSchema";
import { users } from "./users";

export const caseCategories = mysqlTable("case_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 20 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  commonQuestionSetId: varchar("common_question_set_id", { length: 120 }).notNull(),
  specializedQuestionSets: jsonb("specialized_question_sets").default([]).notNull(),
  knowledgeStrandFilters: jsonb("knowledge_strand_filters").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const caseQuestions = mysqlTable("case_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionSetId: varchar("question_set_id", { length: 120 }).notNull(),
  fieldId: varchar("field_id", { length: 120 }).notNull(),
  text: text("text").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  required: boolean("required").default(false).notNull(),
  options: jsonb("options").default([]).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  section: varchar("section", { length: 20 }).notNull(),
  dependsOn: jsonb("depends_on"),
  knowledgeMappings: jsonb("knowledge_mappings").default([]).notNull(),
});

export const caseSessions = mysqlTable("case_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  caseId: varchar("case_id", { length: 120 }).notNull(),
  answers: jsonb("answers").default({}).notNull(),
  activeSpecializedPath: varchar("active_specialized_path", { length: 120 }),
  currentStep: varchar("current_step", { length: 30 }).default("common").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const caseCauses = mysqlTable("case_causes", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => caseSessions.id, { onDelete: "cascade" }).notNull(),
  description: text("description").notNull(),
  confidence: integer("confidence").notNull(),
  evidence: jsonb("evidence").default([]).notNull(),
  category: varchar("category", { length: 40 }).notNull(),
  isSelected: boolean("is_selected").default(true).notNull(),
});

export const caseSolutions = mysqlTable("case_solutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => caseSessions.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  section: varchar("section", { length: 30 }).notNull(),
  description: text("description").notNull(),
  steps: jsonb("steps").default([]).notNull(),
  confidence: integer("confidence").notNull(),
  basedOnCauses: jsonb("based_on_causes").default([]).notNull(),
  knowledgeReferences: jsonb("knowledge_references").default([]).notNull(),
});

/**
 * Expert-reviewed case workflows (career, legal, relationship, social, spiritual).
 * One row per case; structured sub-records are JSON (see src/server/cases/types.ts).
 */
export const workflowCases = mysqlTable("workflow_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  domain: varchar("domain", { length: 30 }).notNull(),
  stage: varchar("stage", { length: 40 }).notNull(),
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
  /** Marketplace business that reviews the case (see drizzle/0005). References added in SQL to avoid an import cycle. */
  businessId: uuid("business_id"),
  bookingId: uuid("booking_id").unique(),
  safetyAnswers: jsonb("safety_answers").default({}).notNull(),
  safety: jsonb("safety").notNull(),
  answers: jsonb("answers").default({}).notNull(),
  context: jsonb("context").default({}).notNull(),
  draft: jsonb("draft"),
  review: jsonb("review"),
  payment: jsonb("payment"),
  consultation: jsonb("consultation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Private audio/video evidence for a biological pathway case; unattached uploads expire by cleanup. */
export const workflowCaseMedia = mysqlTable("workflow_case_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  caseId: uuid("case_id").references(() => workflowCases.id, { onDelete: "cascade" }),
  kind: varchar("kind", { length: 10 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  storageKey: varchar("storage_key", { length: 200 }).notNull(),
  originalName: varchar("original_name", { length: 200 }),
  sha256: varchar("sha256", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("workflow_case_media_user_idx").on(table.userId, table.createdAt), index("workflow_case_media_case_idx").on(table.caseId)]);
