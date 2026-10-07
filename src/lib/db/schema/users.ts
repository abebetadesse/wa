import { mysqlTable, uuid, varchar, timestamp, jsonb, date, integer, boolean, text } from "../mysqlSchema";

/**
 * Enterprise Roles table defining granular RBAC privileges.
 */
export const roles = mysqlTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(), // 'super_admin' | 'admin' | 'premium' | 'user' | etc.
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().default([]).notNull(), // Array of permission keys
  isSystemRole: boolean("is_system_role").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Enterprise Users table extended with Ethiopian demographic and access control fields.
 */
export const users = mysqlTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 30 }).unique(),
  name: varchar("name", { length: 255 }), // Also represents full_name
  passwordHash: varchar("password_hash", { length: 255 }),
  role: varchar("role", { length: 30 }).default("user").notNull(),
  roleId: uuid("role_id").references(() => roles.id),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 20 }),
  region: varchar("region", { length: 100 }), // e.g. Addis Ababa, Oromia, Amhara, Tigray, Somali, Sidama
  city: varchar("city", { length: 100 }),
  practitionerCredentials: jsonb("practitioner_credentials").$type<{
    degree?: string;
    institution?: string;
    yearsExperience?: number;
    verifiedAt?: string;
    verificationMethod?: string;
    /** Title shown to case owners, e.g. "Debtera", "Career advisor". */
    title?: string;
    bio?: string;
    /** Case workflow domains this practitioner may review (see src/server/cases/types.ts). */
    domains?: string[];
    languages?: string[];
  }>(),
  preferences: jsonb("preferences").$type<{
    attunementReminders?: boolean;
    reminderFrequencyDays?: number;
    language?: "am" | "en" | "om" | "ti" | "so";
    shareWithPractitioner?: boolean;
  }>().default({}),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("am").notNull(), // 'am' | 'om' | 'en' | 'ti' | 'so'
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  isVerified: boolean("is_verified").default(false).notNull(),
  /** Telegram account linked through the Telegram Login Widget (verification, sign-in, notifications). */
  telegramId: varchar("telegram_id", { length: 32 }).unique(),
  telegramUsername: varchar("telegram_username", { length: 64 }),
  telegramVerifiedAt: timestamp("telegram_verified_at"),
  /** Forward in-app notifications to Telegram. */
  telegramNotify: boolean("telegram_notify").default(true).notNull(),
  /** WhatsApp number (digits, international format) linked by messaging the platform's WhatsApp bot. */
  whatsappPhone: varchar("whatsapp_phone", { length: 20 }).unique(),
  whatsappVerifiedAt: timestamp("whatsapp_verified_at"),
  /** Forward in-app notifications to WhatsApp. */
  whatsappNotify: boolean("whatsapp_notify").default(true).notNull(),
  /** Last message received from this number: WhatsApp allows free-form replies for 24 hours after it. */
  whatsappLastInboundAt: timestamp("whatsapp_last_inbound_at"),
  isActive: boolean("is_active").default(true).notNull(),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  suspensionReason: text("suspension_reason"),
  loginCount: integer("login_count").default(0).notNull(),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lockoutUntil: timestamp("lockout_until"),
  lastLoginAt: timestamp("last_login_at"),
  passwordChangedAt: timestamp("password_changed_at"),
  notes: text("notes"),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const profileFieldDefinitions = mysqlTable("profile_field_definitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  section: varchar("section", { length: 100 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  fieldType: varchar("field_type", { length: 30 }).notNull(),
  required: boolean("required").default(false).notNull(),
  placeholder: text("placeholder"),
  helpText: text("help_text"),
  defaultValue: jsonb("default_value"),
  options: jsonb("options").$type<string[]>().default([]).notNull(),
  validation: jsonb("validation").$type<Record<string, unknown>>().default({}).notNull(),
  conditional: jsonb("conditional").$type<Record<string, unknown> | null>(),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isUserVisible: boolean("is_user_visible").default(true).notNull(),
  isAdminOnly: boolean("is_admin_only").default(false).notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProfiles = mysqlTable("user_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  primaryName: varchar("primary_name", { length: 255 }),
  birthDate: date("birth_date"),
  birthTime: varchar("birth_time", { length: 10 }), // HH:mm
  birthLocation: varchar("birth_location", { length: 255 }),
  currentLocation: varchar("current_location", { length: 255 }),
  motherName: varchar("mother_name", { length: 255 }),
  // Resolved LocationContext JSONB for birth location
  birthLocationContext: jsonb("birth_location_context"),
  birthLocationContextSource: varchar("birth_location_context_source", { length: 20 }), // "gps" | "manual" | "admin"
  // Resolved LocationContext JSONB for current location
  locationContext: jsonb("location_context"),
  locationContextResolvedAt: timestamp("location_context_resolved_at"),
  locationContextSource: varchar("location_context_source", { length: 20 }), // "gps" | "manual" | "admin"
  // Consent flags
  consentSpiritual: boolean("consent_spiritual").default(false).notNull(),
  consentLocation: boolean("consent_location").default(false).notNull(),
  consent: jsonb("consent").$type<{
    location: boolean;
    spiritual: boolean;
    traditionalMedicine: boolean;
    bioNarrative: boolean;
    voiceIntake: boolean;
    manuscriptKnowledge: boolean;
    identityContext: boolean;
  }>().default({
    location: false,
    spiritual: false,
    traditionalMedicine: false,
    bioNarrative: false,
    voiceIntake: false,
    manuscriptKnowledge: false,
    identityContext: false,
  }).notNull(),
  consentUpdatedAt: timestamp("consent_updated_at"),
  consentHistory: jsonb("consent_history").$type<Array<{
    at: string;
    changes: Record<string, boolean>;
  }>>().default([]).notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Active Session management table for tracking devices, IP addresses, and JWT refresh tokens.
 */
export const authSessions = mysqlTable("auth_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  refreshTokenHash: varchar("refresh_token_hash", { length: 128 }).notNull().unique(),
  accessToken: varchar("access_token", { length: 1000 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  deviceInfo: jsonb("device_info").$type<Record<string, unknown>>().default({}),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Email verification codes & OTP tokens.
 */
export const emailVerifications = mysqlTable("email_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  otpCode: varchar("otp_code", { length: 10 }),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Password reset tokens.
 */
export const passwordResets = mysqlTable("password_resets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * User Activities log for user timeline and personal history.
 */
export const userActivities = mysqlTable("user_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // 'login', 'case_created', 'report_saved', etc.
  description: text("description").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Login history log for enterprise security monitoring & lockout diagnostics.
 */
export const loginHistory = mysqlTable("login_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  deviceInfo: jsonb("device_info").$type<Record<string, unknown>>().default({}),
  status: varchar("status", { length: 20 }).notNull(), // 'success' | 'failed' | 'locked'
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wellbeingProfiles = mysqlTable("wellbeing_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  age: integer("age"),
  gender: varchar("gender", { length: 20 }), // "male" | "female" | "other"
  region: varchar("region", { length: 100 }), // e.g. "Addis Ababa", "Amhara", "Oromia", "Tigray", "Sidama", etc.
  altitudeMeters: integer("altitude_meters"), // e.g. 2400m for Addis Ababa
  activityLevel: varchar("activity_level", { length: 30 }), // "sedentary" | "moderate" | "active" | "very_active"
  pregnancyOrLactation: varchar("pregnancy_or_lactation", { length: 30 }), // "none" | "pregnant_t1" | "pregnant_t2" | "pregnant_t3" | "lactating"
  medicalHistory: jsonb("medical_history").default([]), // Restricted data class - field encrypted/secure
  medications: jsonb("medications").default([]), // Active prescription medications
  allergies: jsonb("allergies").default([]),
  lifestyleHabits: jsonb("lifestyle_habits").default({}), // e.g. bunna/tea immediately with meals, sun exposure, fasting (Tsom)
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Domain B — Firewalled table. Structurally separated from scientific wellbeing fields.
// No foreign keys into scientific intake, gap causes, or solutions.
// CI linting and architectural boundaries prevent this from entering evaluation queries.
export const culturalProfiles = mysqlTable("cultural_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  birthDate: date("birth_date"),
  birthTime: varchar("birth_time", { length: 10 }),
  birthLocation: varchar("birth_location", { length: 255 }),
  geezZodiacSign: varchar("geez_zodiac_sign", { length: 100 }),
  traditionalNameMeaning: varchar("traditional_name_meaning", { length: 500 }),
  culturalCalendarPreference: varchar("cultural_calendar_preference", { length: 50 }).default("geez"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Enhancement: Bio-Narrative Reports ─────────────────────────────────────
// Stores AI-generated bio-narrative reports. Flows through:
//   draft → pending_endorsement → endorsed → published
// Admin/professional may edit sections before publishing.
export const bioNarrativeReports = mysqlTable("bio_narrative_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // draft | pending_endorsement | endorsed | published
  status: varchar("status", { length: 30 }).notNull().default("draft"),
  sections: jsonb("sections"),  // BioNarrativeSections
  regionalContextSections: jsonb("regional_context_sections"),
  screeningPrompts: jsonb("screening_prompts").default([]).notNull(),
  containsHealthContent: boolean("contains_health_content").notNull().default(true),
  requiresHumanReview: boolean("requires_human_review").notNull().default(true),
  hasCulturalContent: boolean("has_cultural_content").notNull().default(false),
  calculations: jsonb("calculations"),  // Raw calculation results (admin/professional only)
  disclaimer: text("disclaimer"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  endorsedBy: jsonb("endorsed_by"),  // { role, name, date }
  endorsedAt: timestamp("endorsed_at"),
  publishedAt: timestamp("published_at"),
  returnedWithComments: text("returned_with_comments"),
  auditEvents: jsonb("audit_events").default([]),  // AuditEvent[]
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Enhancement: Case Summary Cards ────────────────────────────────────────
// Created by the AI Case Summary Engine after free-expression intake.
// Presented to the user for endorsement before the formal session starts.
export const caseSummaryCards = mysqlTable("case_summary_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id"),  // linked after session start
  userId: uuid("user_id").notNull().references(() => users.id),
  rawNarrative: text("raw_narrative").notNull(),
  aiTranslation: text("ai_translation"),  // English translation if input was Amharic
  headline: varchar("headline", { length: 255 }),
  domain: varchar("domain", { length: 50 }),
  subDomain: varchar("sub_domain", { length: 100 }),
  userIntention: text("user_intention"),
  keySymptoms: jsonb("key_symptoms").default([]),
  emergencyDetected: boolean("emergency_detected").notNull().default(false),
  emergencySignals: jsonb("emergency_signals").$type<string[]>().default([]).notNull(),
  emergencyRoutedAt: timestamp("emergency_routed_at"),
  urgencyFlag: varchar("urgency_flag", { length: 20 }).default("none"),  // none | watch | urgent | emergency
  aiConfidence: integer("ai_confidence"),  // 0–100
  suggestedStrands: jsonb("suggested_strands").default([]),  // KnowledgeStrand[]
  suggestedStrandDetails: jsonb("suggested_strand_details").default([]).notNull(),
  endorsedByUser: boolean("endorsed_by_user").default(false).notNull(),
  endorsedAt: timestamp("endorsed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Enhancement: Publishing Criteria ───────────────────────────────────────
// Admin-controlled singleton config defining auto-publish rules and review gates.
export const publishingCriteria = mysqlTable("publishing_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  allowAutoPublishBioNarrative: boolean("allow_auto_publish_bio_narrative").default(false).notNull(),
  allowAutoPublishCases: boolean("allow_auto_publish_cases").default(false).notNull(),
  autoPublishIfDomainIn: jsonb("auto_publish_if_domain_in").default([]),  // string[]
  requireProfessionalReviewForDomains: jsonb("require_pro_review").default([]),  // string[]
  requireAdminApprovalForDomains: jsonb("require_admin_approval").default([]),  // string[]
  maxAutoPublishAiConfidence: integer("max_auto_publish_ai_confidence").default(90),  // 0–100
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const PUBLISHING_FLOORS = {
  healthContentRequiresReview: true,
  domainsRequiringReview: ["wellbeing", "spiritual", "relationships"] as const,
  urgentCaseRequiresAdmin: true,
} as const;
