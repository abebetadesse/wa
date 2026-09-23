/**
 * Ethiopian Ethnomedicine & Wisdom Platform foundation schema.
 *
 * Domain A data is stored separately from Domain B data:
 * - scientificAnalyses and biometricScans.rawAiScientificFindings are restricted
 *   operational data for authorized admin/PhD reviewers.
 * - culturalReports and biometricScans.translatedCulturalFindings are the
 *   user-facing interpretation layer.
 *
 * This repository currently uses the MySQL-compatible schema adapter exposed by
 * mysqlSchema.ts. The table model is intentionally portable: JSON columns map
 * to PostgreSQL JSONB when the project is migrated to the PostgreSQL adapter.
 */
import { pgTable, uuid, varchar, text, jsonb, timestamp, boolean, integer } from "../mysqlSchema";
import { users } from "./users";

export type PlatformCaseStatus =
  | "intake"
  | "ai_drafting"
  | "pending_expert_review"
  | "endorsed"
  | "delivered"
  | "referred"
  | "closed";

export type PlatformUserRole = "USER" | "ADMIN" | "EXPERT";

export const platformCases = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: varchar("status", { length: 40 }).$type<PlatformCaseStatus>().default("intake").notNull(),
  caseType: varchar("case_type", { length: 80 }).notNull(),
  practitionerId: uuid("practitioner_id").references(() => users.id, { onDelete: "set null" }),
  clientConcern: text("client_concern"),
  intakeData: jsonb("intake_data").$type<Record<string, unknown>>().default({}).notNull(),
  referralReason: varchar("referral_reason", { length: 80 }),
  referralUrgency: varchar("referral_urgency", { length: 20 }),
  practitionerNotes: text("practitioner_notes"),
  practitionerEdits: jsonb("practitioner_edits").$type<Record<string, unknown>[]>(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

/**
 * Domain A: restricted scientific/scientific-adjacent analysis.
 *
 * No user-facing route should select or serialize this table. Admin/PhD
 * routes must enforce role checks before reading it.
 */
export const scientificAnalyses = pgTable("scientific_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id").references(() => platformCases.id, { onDelete: "cascade" }).notNull().unique(),
  caloricBaseline: jsonb("caloric_baseline").$type<Record<string, unknown>>(),
  aminoAcidModel: jsonb("amino_acid_model").$type<Record<string, unknown>>(),
  fattyAcidModel: jsonb("fatty_acid_model").$type<Record<string, unknown>>(),
  climateStress: jsonb("climate_stress").$type<Record<string, unknown>>(),
  epidemiology: jsonb("epidemiology").$type<Record<string, unknown>>(),
  diseaseIncidence: jsonb("disease_incidence").$type<Record<string, unknown>>(),
  rawAnalysis: jsonb("raw_analysis").$type<Record<string, unknown>>(),
  modelMetadata: jsonb("model_metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Domain B: reviewed, culturally framed report intended for the user.
 *
 * This layer must not claim to diagnose, cure, or replace qualified care.
 * Expert endorsement is recorded separately from draft generation.
 */
export const culturalReports = pgTable("cultural_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id").references(() => platformCases.id, { onDelete: "cascade" }).notNull().unique(),
  traditionalTranslation: text("traditional_translation"),
  hexacoreFirstOrder: jsonb("hexacore_first_order").$type<Record<string, unknown>>(),
  geographicalLandmarkSymbology: jsonb("geographical_landmark_symbology").$type<Record<string, unknown>>(),
  herbalSolutions: jsonb("herbal_solutions").$type<Record<string, unknown>[]>(),
  ritualSolutions: jsonb("ritual_solutions").$type<Record<string, unknown>[]>(),
  safetyNotice: text("safety_notice"),
  generatedBy: varchar("generated_by", { length: 80 }).default("system").notNull(),
  endorsedBy: uuid("endorsed_by").references(() => users.id, { onDelete: "set null" }),
  endorsedAt: timestamp("endorsed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BiometricScanType = "palm" | "tongue";

export const biometricScans = pgTable("biometric_scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  caseId: uuid("case_id").references(() => platformCases.id, { onDelete: "set null" }),
  imageUrl: varchar("image_url", { length: 1000 }).notNull(),
  scanType: varchar("scan_type", { length: 20 }).$type<BiometricScanType>().notNull(),
  /**
   * Domain A restricted output. Keep this column out of all user-facing
   * serializers and APIs.
   */
  rawAiScientificFindings: jsonb("raw_ai_scientific_findings").$type<Record<string, unknown>>(),
  /**
   * Domain B reviewed interpretation. This must remain reflective and
   * non-diagnostic, with a safety notice included in the API response.
   */
  translatedCulturalFindings: jsonb("translated_cultural_findings").$type<Record<string, unknown>>(),
  redFlags: jsonb("red_flags").$type<Array<{
    flag: string;
    severity: "low" | "medium" | "high";
    referralRecommended: boolean;
  }>>(),
  imageHash: varchar("image_hash", { length: 64 }),
  reviewStatus: varchar("review_status", { length: 40 }).default("pending_expert_review").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Attunement prompts are opt-in and time-based. They must never be random
 * engagement prompts for users who have not enabled them.
 */
export const attunementReminders = pgTable("attunement_reminders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  nextPromptAt: timestamp("next_prompt_at").notNull(),
  promptType: varchar("prompt_type", { length: 20 }).$type<BiometricScanType>().notNull(),
  optedIn: boolean("opted_in").default(false).notNull(),
  dismissedCount: integer("dismissed_count").default(0).notNull(),
  completedCount: integer("completed_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
