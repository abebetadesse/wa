import { pgTable, uuid, varchar, text, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const caseCategories = pgTable("case_categories", {
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

export const caseQuestions = pgTable("case_questions", {
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

export const caseSessions = pgTable("case_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  caseId: varchar("case_id", { length: 120 }).notNull(),
  answers: jsonb("answers").default({}).notNull(),
  activeSpecializedPath: varchar("active_specialized_path", { length: 120 }),
  currentStep: varchar("current_step", { length: 30 }).default("common").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const caseCauses = pgTable("case_causes", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => caseSessions.id, { onDelete: "cascade" }).notNull(),
  description: text("description").notNull(),
  confidence: integer("confidence").notNull(),
  evidence: jsonb("evidence").default([]).notNull(),
  category: varchar("category", { length: 40 }).notNull(),
  isSelected: boolean("is_selected").default(true).notNull(),
});

export const caseSolutions = pgTable("case_solutions", {
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
