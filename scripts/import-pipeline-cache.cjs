process.env.NODE_ENV = process.env.NODE_ENV || "production";
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/lib/db/loadEnv.ts
var import_node_fs = __toESM(require("node:fs"));
var import_node_path = __toESM(require("node:path"));
var root = import_node_path.default.resolve(__dirname, "../../..");
var searchedDirs = [root, process.cwd(), import_node_path.default.resolve(root, ".."), import_node_path.default.resolve(process.cwd(), "..")];
var fileNames = [".env", ".env.production", ".env.local"];
for (const dir of new Set(searchedDirs)) {
  for (const name of fileNames) {
    const file = import_node_path.default.join(dir, name);
    if (!import_node_fs.default.existsSync(file))
      continue;
    for (const line of import_node_fs.default.readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1];
        const val = match[2].replace(/^(["'])(.*)\1$/, "$2").trim();
        if ((process.env[key] === void 0 || process.env[key].trim() === "") && val) {
          process.env[key] = val;
        }
      }
    }
  }
}
if (!process.env.DATABASE_URL?.trim()) {
  if (process.env.NODE_ENV === "production") {
    console.error("DATABASE_URL is not set. Put it in .env in the application folder, or pass it via the environment:");
    console.error('  DATABASE_URL="mysql://USER:PASSWORD@127.0.0.1:3306/DATABASE" npm run db:setup');
    process.exit(1);
  }
  console.warn("DATABASE_URL is not set: using the local development database.");
}

// scripts/import-pipeline-cache.mjs
var import_node_path3 = __toESM(require("node:path"), 1);

// src/lib/db/index.ts
var import_mysql2 = require("drizzle-orm/mysql2");
var import_promise = __toESM(require("mysql2/promise"));

// src/lib/db/schema/index.ts
var schema_exports = {};
__export(schema_exports, {
  ALL_PERMISSIONS: () => ALL_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS: () => DEFAULT_ROLE_PERMISSIONS,
  DROPDOWN_TYPES: () => DROPDOWN_TYPES,
  HEXACORE_DEFAULT_PRODUCTS: () => HEXACORE_DEFAULT_PRODUCTS,
  PERMISSION_CATEGORIES: () => PERMISSION_CATEGORIES,
  PUBLISHING_FLOORS: () => PUBLISHING_FLOORS,
  attunementReminders: () => attunementReminders,
  auditLog: () => auditLog,
  authSessions: () => authSessions,
  autoResponseRules: () => autoResponseRules,
  availabilityRules: () => availabilityRules,
  bioNarrativeReports: () => bioNarrativeReports,
  biometricScans: () => biometricScans,
  bookings: () => bookings,
  businessCategories: () => businessCategories,
  businessClients: () => businessClients,
  businessInvitations: () => businessInvitations,
  businessKnowledgeSets: () => businessKnowledgeSets,
  businessMembers: () => businessMembers,
  businessTools: () => businessTools,
  businesses: () => businesses,
  caseCategories: () => caseCategories,
  caseCauses: () => caseCauses,
  caseQuestions: () => caseQuestions,
  caseSessions: () => caseSessions,
  caseSolutions: () => caseSolutions,
  caseSummaryCards: () => caseSummaryCards,
  chatIntakes: () => chatIntakes,
  compounds: () => compounds,
  conversations: () => conversations,
  culturalProfiles: () => culturalProfiles,
  culturalReports: () => culturalReports,
  diagnosticSessions: () => diagnosticSessions,
  emailVerifications: () => emailVerifications,
  emergencyAlerts: () => emergencyAlerts,
  emergencyProfiles: () => emergencyProfiles,
  fewusTexts: () => fewusTexts,
  followUps: () => followUps,
  foodNutrients: () => foodNutrients,
  foods: () => foods,
  gapCauses: () => gapCauses,
  gapSolutions: () => gapSolutions,
  herbDrugInteractions: () => herbDrugInteractions,
  herbs: () => herbs,
  hexacoreAspects: () => hexacoreAspects,
  hexacoreCircleInvites: () => hexacoreCircleInvites,
  hexacoreCircleMembers: () => hexacoreCircleMembers,
  hexacoreCirclePosts: () => hexacoreCirclePosts,
  hexacoreCircleReactions: () => hexacoreCircleReactions,
  hexacoreCircles: () => hexacoreCircles,
  hexacoreFrequencyHistory: () => hexacoreFrequencyHistory,
  hexacoreJournal: () => hexacoreJournal,
  hexacorePracticeLog: () => hexacorePracticeLog,
  hexacorePractices: () => hexacorePractices,
  hexacoreProducts: () => hexacoreProducts,
  hexacorePurchases: () => hexacorePurchases,
  hexacoreSubscriptions: () => hexacoreSubscriptions,
  identifiedGaps: () => identifiedGaps,
  intakeAttachments: () => intakeAttachments,
  intakeSubmissions: () => intakeSubmissions,
  knowledgeCategories: () => knowledgeCategories,
  knowledgeItems: () => knowledgeItems,
  knowledgeSets: () => knowledgeSets,
  knowledgeStrands: () => knowledgeStrands,
  knowledgeVersions: () => knowledgeVersions,
  literatureFindings: () => literatureFindings,
  literatureSyncLog: () => literatureSyncLog,
  loginHistory: () => loginHistory,
  messages: () => messages,
  notifications: () => notifications,
  nutrients: () => nutrients,
  passwordResets: () => passwordResets,
  payments: () => payments,
  pipelineAssignments: () => pipelineAssignments,
  pipelineCaseEvents: () => pipelineCaseEvents,
  pipelineCases: () => pipelineCases,
  pipelinePreliminaryAnalyses: () => pipelinePreliminaryAnalyses,
  pipelineProfiles: () => pipelineProfiles,
  pipelineReports: () => pipelineReports,
  platformCases: () => platformCases,
  platformPayments: () => platformPayments,
  platformSettings: () => platformSettings,
  profileFieldDefinitions: () => profileFieldDefinitions,
  publishingCriteria: () => publishingCriteria,
  rateLimits: () => rateLimits,
  realtimeEvents: () => realtimeEvents,
  remedies: () => remedies,
  remedyIngredients: () => remedyIngredients,
  responseDrafts: () => responseDrafts,
  reviews: () => reviews,
  roleHasPermission: () => roleHasPermission,
  roles: () => roles,
  safetyInteractions: () => safetyInteractions,
  safetySubstances: () => safetySubstances,
  scheduledTasks: () => scheduledTasks,
  scientificAnalyses: () => scientificAnalyses,
  serviceIntakeSettings: () => serviceIntakeSettings,
  serviceKinds: () => serviceKinds,
  services: () => services,
  stockMovements: () => stockMovements,
  timeOff: () => timeOff,
  toolkitTools: () => toolkitTools,
  toolkitUsage: () => toolkitUsage,
  userActivities: () => userActivities,
  userProfiles: () => userProfiles,
  users: () => users,
  wellbeingGapReports: () => wellbeingGapReports,
  wellbeingProfiles: () => wellbeingProfiles,
  workflowCaseMedia: () => workflowCaseMedia,
  workflowCases: () => workflowCases
});

// src/lib/db/mysqlSchema.ts
var import_drizzle_orm = require("drizzle-orm");
var import_mysql_core = require("drizzle-orm/mysql-core");
function tablePrefix() {
  const prefix = (process.env.DB_TABLE_PREFIX ?? "").trim();
  if (!prefix)
    return "";
  if (!/^[a-z][a-z0-9]{0,10}_$/.test(prefix)) {
    throw new Error(`DB_TABLE_PREFIX "${prefix}" is not valid. Use 1\u201311 lowercase letters or digits followed by one underscore, for example wa_.`);
  }
  return prefix;
}
var mysqlTable = (0, import_mysql_core.mysqlTableCreator)((name) => `${tablePrefix()}${name}`);
var newId = () => globalThis.crypto.randomUUID();
function uuid(name) {
  const builder = (0, import_mysql_core.varchar)(name, { length: 36 });
  const withDefault = {
    defaultRandom() {
      return this.$defaultFn(newId);
    }
  };
  return Object.assign(builder, withDefault);
}
function timestamp(name, _options) {
  const builder = (0, import_mysql_core.datetime)(name, { mode: "date", fsp: 3 });
  const withDefault = {
    defaultNow() {
      return this.default(import_drizzle_orm.sql`CURRENT_TIMESTAMP(3)`);
    }
  };
  return Object.assign(builder, withDefault);
}
var json = (0, import_mysql_core.customType)({
  dataType: () => "json",
  toDriver: (value) => value === void 0 ? null : JSON.stringify(value),
  // MySQL drivers can return JSON columns as parsed values, JSON text, or unquoted strings.
  fromDriver: (value) => {
    if (typeof value !== "string")
      return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
});
function jsonb(name) {
  return json(name);
}
function date(name) {
  return (0, import_mysql_core.date)(name, { mode: "string" });
}
function bigserial(name, _options) {
  return (0, import_mysql_core.bigint)(name, { mode: "number", unsigned: true }).autoincrement();
}
var integer = import_mysql_core.int;
var numeric = import_mysql_core.decimal;
var real = import_mysql_core.float;

// src/lib/db/schema/users.ts
var roles = mysqlTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: (0, import_mysql_core.varchar)("name", { length: 50 }).notNull().unique(),
  // 'super_admin' | 'admin' | 'premium' | 'user' | etc.
  description: (0, import_mysql_core.text)("description"),
  permissions: jsonb("permissions").$type().default([]).notNull(),
  // Array of permission keys
  isSystemRole: (0, import_mysql_core.boolean)("is_system_role").default(false).notNull(),
  isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var users = mysqlTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: (0, import_mysql_core.varchar)("email", { length: 255 }).notNull().unique(),
  phone: (0, import_mysql_core.varchar)("phone", { length: 30 }).unique(),
  name: (0, import_mysql_core.varchar)("name", { length: 255 }),
  // Also represents full_name
  passwordHash: (0, import_mysql_core.varchar)("password_hash", { length: 255 }),
  role: (0, import_mysql_core.varchar)("role", { length: 30 }).default("user").notNull(),
  roleId: uuid("role_id").references(() => roles.id),
  dateOfBirth: date("date_of_birth"),
  gender: (0, import_mysql_core.varchar)("gender", { length: 20 }),
  region: (0, import_mysql_core.varchar)("region", { length: 100 }),
  // e.g. Addis Ababa, Oromia, Amhara, Tigray, Somali, Sidama
  city: (0, import_mysql_core.varchar)("city", { length: 100 }),
  practitionerCredentials: jsonb("practitioner_credentials").$type(),
  preferences: jsonb("preferences").$type().default({}),
  preferredLanguage: (0, import_mysql_core.varchar)("preferred_language", { length: 10 }).default("am").notNull(),
  // 'am' | 'om' | 'en' | 'ti' | 'so'
  profileImageUrl: (0, import_mysql_core.varchar)("profile_image_url", { length: 500 }),
  isVerified: (0, import_mysql_core.boolean)("is_verified").default(false).notNull(),
  /** Telegram account linked through the Telegram Login Widget (verification, sign-in, notifications). */
  telegramId: (0, import_mysql_core.varchar)("telegram_id", { length: 32 }).unique(),
  telegramUsername: (0, import_mysql_core.varchar)("telegram_username", { length: 64 }),
  telegramVerifiedAt: timestamp("telegram_verified_at"),
  /** Forward in-app notifications to Telegram. */
  telegramNotify: (0, import_mysql_core.boolean)("telegram_notify").default(true).notNull(),
  /** WhatsApp number (digits, international format) linked by messaging the platform's WhatsApp bot. */
  whatsappPhone: (0, import_mysql_core.varchar)("whatsapp_phone", { length: 20 }).unique(),
  whatsappVerifiedAt: timestamp("whatsapp_verified_at"),
  /** Forward in-app notifications to WhatsApp. */
  whatsappNotify: (0, import_mysql_core.boolean)("whatsapp_notify").default(true).notNull(),
  /** Last message received from this number: WhatsApp allows free-form replies for 24 hours after it. */
  whatsappLastInboundAt: timestamp("whatsapp_last_inbound_at"),
  isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
  isSuspended: (0, import_mysql_core.boolean)("is_suspended").default(false).notNull(),
  suspensionReason: (0, import_mysql_core.text)("suspension_reason"),
  loginCount: integer("login_count").default(0).notNull(),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lockoutUntil: timestamp("lockout_until"),
  lastLoginAt: timestamp("last_login_at"),
  passwordChangedAt: timestamp("password_changed_at"),
  notes: (0, import_mysql_core.text)("notes"),
  tags: jsonb("tags").$type().default([]),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var profileFieldDefinitions = mysqlTable("profile_field_definitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  section: (0, import_mysql_core.varchar)("section", { length: 100 }).notNull(),
  label: (0, import_mysql_core.varchar)("label", { length: 255 }).notNull(),
  fieldType: (0, import_mysql_core.varchar)("field_type", { length: 30 }).notNull(),
  required: (0, import_mysql_core.boolean)("required").default(false).notNull(),
  placeholder: (0, import_mysql_core.text)("placeholder"),
  helpText: (0, import_mysql_core.text)("help_text"),
  defaultValue: jsonb("default_value"),
  options: jsonb("options").$type().default([]).notNull(),
  validation: jsonb("validation").$type().default({}).notNull(),
  conditional: jsonb("conditional").$type(),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
  isUserVisible: (0, import_mysql_core.boolean)("is_user_visible").default(true).notNull(),
  isAdminOnly: (0, import_mysql_core.boolean)("is_admin_only").default(false).notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var userProfiles = mysqlTable("user_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  primaryName: (0, import_mysql_core.varchar)("primary_name", { length: 255 }),
  birthDate: date("birth_date"),
  birthTime: (0, import_mysql_core.varchar)("birth_time", { length: 10 }),
  // HH:mm
  birthLocation: (0, import_mysql_core.varchar)("birth_location", { length: 255 }),
  currentLocation: (0, import_mysql_core.varchar)("current_location", { length: 255 }),
  motherName: (0, import_mysql_core.varchar)("mother_name", { length: 255 }),
  // Resolved LocationContext JSONB for birth location
  birthLocationContext: jsonb("birth_location_context"),
  birthLocationContextSource: (0, import_mysql_core.varchar)("birth_location_context_source", { length: 20 }),
  // "gps" | "manual" | "admin"
  // Resolved LocationContext JSONB for current location
  locationContext: jsonb("location_context"),
  locationContextResolvedAt: timestamp("location_context_resolved_at"),
  locationContextSource: (0, import_mysql_core.varchar)("location_context_source", { length: 20 }),
  // "gps" | "manual" | "admin"
  // Consent flags
  consentSpiritual: (0, import_mysql_core.boolean)("consent_spiritual").default(false).notNull(),
  consentLocation: (0, import_mysql_core.boolean)("consent_location").default(false).notNull(),
  consent: jsonb("consent").$type().default({
    location: false,
    spiritual: false,
    traditionalMedicine: false,
    bioNarrative: false,
    voiceIntake: false,
    manuscriptKnowledge: false,
    identityContext: false
  }).notNull(),
  consentUpdatedAt: timestamp("consent_updated_at"),
  consentHistory: jsonb("consent_history").$type().default([]).notNull(),
  onboardingCompleted: (0, import_mysql_core.boolean)("onboarding_completed").default(false).notNull(),
  data: jsonb("data").$type().default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var authSessions = mysqlTable("auth_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  refreshTokenHash: (0, import_mysql_core.varchar)("refresh_token_hash", { length: 128 }).notNull().unique(),
  accessToken: (0, import_mysql_core.varchar)("access_token", { length: 1e3 }),
  ipAddress: (0, import_mysql_core.varchar)("ip_address", { length: 45 }),
  userAgent: (0, import_mysql_core.text)("user_agent"),
  deviceInfo: jsonb("device_info").$type().default({}),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var emailVerifications = mysqlTable("email_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: (0, import_mysql_core.varchar)("token", { length: 255 }).notNull(),
  otpCode: (0, import_mysql_core.varchar)("otp_code", { length: 10 }),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var passwordResets = mysqlTable("password_resets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: (0, import_mysql_core.varchar)("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var userActivities = mysqlTable("user_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  activityType: (0, import_mysql_core.varchar)("activity_type", { length: 50 }).notNull(),
  // 'login', 'case_created', 'report_saved', etc.
  description: (0, import_mysql_core.text)("description").notNull(),
  metadata: jsonb("metadata").$type().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var loginHistory = mysqlTable("login_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  email: (0, import_mysql_core.varchar)("email", { length: 255 }).notNull(),
  ipAddress: (0, import_mysql_core.varchar)("ip_address", { length: 45 }),
  userAgent: (0, import_mysql_core.text)("user_agent"),
  deviceInfo: jsonb("device_info").$type().default({}),
  status: (0, import_mysql_core.varchar)("status", { length: 20 }).notNull(),
  // 'success' | 'failed' | 'locked'
  failureReason: (0, import_mysql_core.text)("failure_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var wellbeingProfiles = mysqlTable("wellbeing_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  age: integer("age"),
  gender: (0, import_mysql_core.varchar)("gender", { length: 20 }),
  // "male" | "female" | "other"
  region: (0, import_mysql_core.varchar)("region", { length: 100 }),
  // e.g. "Addis Ababa", "Amhara", "Oromia", "Tigray", "Sidama", etc.
  altitudeMeters: integer("altitude_meters"),
  // e.g. 2400m for Addis Ababa
  activityLevel: (0, import_mysql_core.varchar)("activity_level", { length: 30 }),
  // "sedentary" | "moderate" | "active" | "very_active"
  pregnancyOrLactation: (0, import_mysql_core.varchar)("pregnancy_or_lactation", { length: 30 }),
  // "none" | "pregnant_t1" | "pregnant_t2" | "pregnant_t3" | "lactating"
  medicalHistory: jsonb("medical_history").default([]),
  // Restricted data class - field encrypted/secure
  medications: jsonb("medications").default([]),
  // Active prescription medications
  allergies: jsonb("allergies").default([]),
  lifestyleHabits: jsonb("lifestyle_habits").default({}),
  // e.g. bunna/tea immediately with meals, sun exposure, fasting (Tsom)
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var culturalProfiles = mysqlTable("cultural_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  fullName: (0, import_mysql_core.varchar)("full_name", { length: 255 }),
  birthDate: date("birth_date"),
  birthTime: (0, import_mysql_core.varchar)("birth_time", { length: 10 }),
  birthLocation: (0, import_mysql_core.varchar)("birth_location", { length: 255 }),
  geezZodiacSign: (0, import_mysql_core.varchar)("geez_zodiac_sign", { length: 100 }),
  traditionalNameMeaning: (0, import_mysql_core.varchar)("traditional_name_meaning", { length: 500 }),
  culturalCalendarPreference: (0, import_mysql_core.varchar)("cultural_calendar_preference", { length: 50 }).default("geez"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var bioNarrativeReports = mysqlTable("bio_narrative_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // draft | pending_endorsement | endorsed | published
  status: (0, import_mysql_core.varchar)("status", { length: 30 }).notNull().default("draft"),
  sections: jsonb("sections"),
  // BioNarrativeSections
  regionalContextSections: jsonb("regional_context_sections"),
  screeningPrompts: jsonb("screening_prompts").default([]).notNull(),
  containsHealthContent: (0, import_mysql_core.boolean)("contains_health_content").notNull().default(true),
  requiresHumanReview: (0, import_mysql_core.boolean)("requires_human_review").notNull().default(true),
  hasCulturalContent: (0, import_mysql_core.boolean)("has_cultural_content").notNull().default(false),
  calculations: jsonb("calculations"),
  // Raw calculation results (admin/professional only)
  disclaimer: (0, import_mysql_core.text)("disclaimer"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  endorsedBy: jsonb("endorsed_by"),
  // { role, name, date }
  endorsedAt: timestamp("endorsed_at"),
  publishedAt: timestamp("published_at"),
  returnedWithComments: (0, import_mysql_core.text)("returned_with_comments"),
  auditEvents: jsonb("audit_events").default([]),
  // AuditEvent[]
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var caseSummaryCards = mysqlTable("case_summary_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id"),
  // linked after session start
  userId: uuid("user_id").notNull().references(() => users.id),
  rawNarrative: (0, import_mysql_core.text)("raw_narrative").notNull(),
  aiTranslation: (0, import_mysql_core.text)("ai_translation"),
  // English translation if input was Amharic
  headline: (0, import_mysql_core.varchar)("headline", { length: 255 }),
  domain: (0, import_mysql_core.varchar)("domain", { length: 50 }),
  subDomain: (0, import_mysql_core.varchar)("sub_domain", { length: 100 }),
  userIntention: (0, import_mysql_core.text)("user_intention"),
  keySymptoms: jsonb("key_symptoms").default([]),
  emergencyDetected: (0, import_mysql_core.boolean)("emergency_detected").notNull().default(false),
  emergencySignals: jsonb("emergency_signals").$type().default([]).notNull(),
  emergencyRoutedAt: timestamp("emergency_routed_at"),
  urgencyFlag: (0, import_mysql_core.varchar)("urgency_flag", { length: 20 }).default("none"),
  // none | watch | urgent | emergency
  aiConfidence: integer("ai_confidence"),
  // 0–100
  suggestedStrands: jsonb("suggested_strands").default([]),
  // KnowledgeStrand[]
  suggestedStrandDetails: jsonb("suggested_strand_details").default([]).notNull(),
  endorsedByUser: (0, import_mysql_core.boolean)("endorsed_by_user").default(false).notNull(),
  endorsedAt: timestamp("endorsed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var publishingCriteria = mysqlTable("publishing_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  allowAutoPublishBioNarrative: (0, import_mysql_core.boolean)("allow_auto_publish_bio_narrative").default(false).notNull(),
  allowAutoPublishCases: (0, import_mysql_core.boolean)("allow_auto_publish_cases").default(false).notNull(),
  autoPublishIfDomainIn: jsonb("auto_publish_if_domain_in").default([]),
  // string[]
  requireProfessionalReviewForDomains: jsonb("require_pro_review").default([]),
  // string[]
  requireAdminApprovalForDomains: jsonb("require_admin_approval").default([]),
  // string[]
  maxAutoPublishAiConfidence: integer("max_auto_publish_ai_confidence").default(90),
  // 0–100
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var PUBLISHING_FLOORS = {
  healthContentRequiresReview: true,
  domainsRequiringReview: ["wellbeing", "spiritual", "relationships"],
  urgentCaseRequiresAdmin: true
};

// src/lib/db/schema/nutrition.ts
var foods = mysqlTable("foods", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: (0, import_mysql_core.varchar)("name", { length: 255 }).notNull(),
  // e.g. "Teff Injera (Fermented)", "Shiro Wot"
  nameAmharic: (0, import_mysql_core.varchar)("name_amharic", { length: 255 }),
  // e.g. "ጤፍ እንጀራ", "ሽሮ ወጥ"
  category: (0, import_mysql_core.varchar)("category", { length: 100 }).notNull(),
  // "Grains & Cereals", "Legumes & Pulses", "Roots & Tubers", "Vegetables", "Spices"
  traditionalPreparation: (0, import_mysql_core.text)("traditional_preparation"),
  // fermentation details, roasting, sun drying
  sourceRef: (0, import_mysql_core.varchar)("source_ref", { length: 100 }).notNull(),
  // e.g. "EFCT2025-0142" - lineage traceability
  fastingSuitability: (0, import_mysql_core.varchar)("fasting_suitability", { length: 50 }).default("dual"),
  // "fasting_friendly", "non_fasting", "dual"
  glycemicIndex: integer("glycemic_index"),
  phyticAcidMg: numeric("phytic_acid_mg", { precision: 8, scale: 2 }),
  tanninsMg: numeric("tannins_mg", { precision: 8, scale: 2 }),
  oxalatesMg: numeric("oxalates_mg", { precision: 8, scale: 2 }),
  fermentationReductionPct: integer("fermentation_reduction_pct")
});
var nutrients = mysqlTable("nutrients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: (0, import_mysql_core.varchar)("name", { length: 100 }).notNull(),
  // "Iron", "Calcium", "Zinc", "Vitamin B12", "Folate", "Vitamin D", "Magnesium"
  symbol: (0, import_mysql_core.varchar)("symbol", { length: 20 }),
  // "Fe", "Ca", "Zn", "B12", "B9", "VitD", "Mg"
  unit: (0, import_mysql_core.varchar)("unit", { length: 20 }).notNull(),
  // "mg", "mcg", "g", "IU"
  category: (0, import_mysql_core.varchar)("category", { length: 50 }).notNull(),
  // "mineral", "vitamin", "macronutrient"
  rdaBase: numeric("rda_base", { precision: 10, scale: 2 }).notNull(),
  // standard baseline RDA
  tolerableUpperLimit: numeric("tolerable_upper_limit", { precision: 10, scale: 2 })
  // UL threshold
});
var foodNutrients = mysqlTable(
  "food_nutrients",
  {
    foodId: uuid("food_id").references(() => foods.id, { onDelete: "cascade" }).notNull(),
    nutrientId: uuid("nutrient_id").references(() => nutrients.id, { onDelete: "cascade" }).notNull(),
    amountPer100g: numeric("amount_per_100g", { precision: 10, scale: 3 }).notNull(),
    bioavailabilityFactor: numeric("bioavailability_factor", { precision: 4, scale: 2 }).default("1.00"),
    // Fermentation uplift e.g. 1.45 for injera fermentation degradation of phytates
    fermentationImpactNote: (0, import_mysql_core.varchar)("fermentation_impact_note", { length: 255 })
    // Traceable scientific annotation
  },
  (t) => ({
    pk: (0, import_mysql_core.primaryKey)({ columns: [t.foodId, t.nutrientId] })
  })
);

// src/lib/db/schema/herbs.ts
var herbs = mysqlTable("herbs", {
  id: uuid("id").primaryKey().defaultRandom(),
  nameVernacular: (0, import_mysql_core.varchar)("name_vernacular", { length: 255 }).notNull(),
  // e.g. "Damakesse", "Tena Adam", "Kosso", "Gesho"
  nameScientific: (0, import_mysql_core.varchar)("name_scientific", { length: 255 }).notNull(),
  // e.g. "Ocimum lamiifolium", "Ruta chalepensis", "Hagenia abyssinica"
  nameAmharic: (0, import_mysql_core.varchar)("name_amharic", { length: 255 }),
  // "ዳማከሴ", "ጤና አዳም", "ኮሶ", "ጌሾ"
  traditionalUses: (0, import_mysql_core.text)("traditional_uses").notNull(),
  primaryPartsUsed: (0, import_mysql_core.varchar)("primary_parts_used", { length: 150 }),
  // "Leaves", "Seeds", "Flowers", "Roots", "Bark"
  contraindicationsGeneral: (0, import_mysql_core.text)("contraindications_general"),
  // General scientific contraindications (pregnancy, renal failure)
  safetyLevel: (0, import_mysql_core.varchar)("safety_level", { length: 20 }).default("caution").notNull(),
  // safe | caution | contraindicated | toxic
  ld50: (0, import_mysql_core.decimal)("ld50", { precision: 10, scale: 2 }),
  toxicEffects: jsonb("toxic_effects").$type().default([]).notNull(),
  organTargets: jsonb("organ_targets").$type().default([]).notNull(),
  regions: jsonb("regions").$type().default([]).notNull(),
  altitudeRange: jsonb("altitude_range").$type(),
  preparationMethods: jsonb("preparation_methods").$type().default([]).notNull(),
  evidenceLevel: (0, import_mysql_core.varchar)("evidence_level", { length: 50 }),
  sourceRef: (0, import_mysql_core.varchar)("source_ref", { length: 100 }).notNull()
  // e.g. "ETM-DB-2025-081"
});
var compounds = mysqlTable("compounds", {
  id: uuid("id").primaryKey().defaultRandom(),
  herbId: uuid("herb_id").references(() => herbs.id, { onDelete: "cascade" }).notNull(),
  compoundName: (0, import_mysql_core.varchar)("compound_name", { length: 255 }).notNull(),
  // e.g. "Rutin", "Kosotoxin", "Rosmarinic acid", "Coumarins"
  chemicalClass: (0, import_mysql_core.varchar)("chemical_class", { length: 100 }),
  // "Flavonoid", "Alkaloid", "Phloroglucinol derivative"
  mechanismOfAction: (0, import_mysql_core.text)("mechanism_of_action")
  // CYP450 inhibition, platelet aggregation inhibition, etc.
});
var herbDrugInteractions = mysqlTable("herb_drug_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  herbId: uuid("herb_id").references(() => herbs.id, { onDelete: "cascade" }).notNull(),
  drugClass: (0, import_mysql_core.varchar)("drug_class", { length: 150 }).notNull(),
  // "Anticoagulants / Antiplatelets", "ACE Inhibitors", "Hypoglycemics", "Sedatives / CNS Depressants"
  drugNameExample: (0, import_mysql_core.varchar)("drug_name_example", { length: 255 }),
  // "Warfarin, Aspirin, Clopidogrel"
  interactionSeverity: (0, import_mysql_core.varchar)("interaction_severity", { length: 20 }).notNull(),
  // "high" | "moderate" | "caution"
  mechanism: (0, import_mysql_core.text)("mechanism").notNull(),
  // "Additive hypoprothrombinemic effect / enhanced bleeding risk"
  physiologicalEffect: (0, import_mysql_core.text)("physiological_effect").notNull(),
  // "Severe hemorrhage, excessive bleeding"
  contraindicated: (0, import_mysql_core.boolean)("contraindicated").default(true).notNull(),
  // strict contraindication flag
  evidenceLevel: (0, import_mysql_core.varchar)("evidence_level", { length: 50 }).notNull(),
  // "scientific Study", "In Vivo", "In Vitro Pharmacological", "Documented Case Report"
  sourceRef: (0, import_mysql_core.varchar)("source_ref", { length: 100 }).notNull(),
  // e.g. "ETM-SAFETY-WAR-01"
  ethiopianContext: (0, import_mysql_core.text)("ethiopian_context"),
  // Local usage pattern that creates the hidden interaction risk
  recommendation: (0, import_mysql_core.text)("recommendation")
  // Actionable scientific guidance for this specific interaction
});

// src/lib/db/schema/gapAnalysis.ts
var intakeSubmissions = mysqlTable("intake_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  payload: jsonb("payload").notNull(),
  // Canonical normalized profile snapshot & diet log
  status: (0, import_mysql_core.varchar)("status", { length: 20 }).default("pending").notNull(),
  // "pending" | "processing" | "complete" | "failed"
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  errorMessage: (0, import_mysql_core.text)("error_message")
});
var wellbeingGapReports = mysqlTable("wellbeing_gap_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => intakeSubmissions.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  modelVersion: (0, import_mysql_core.varchar)("model_version", { length: 50 }).notNull(),
  // "eval-v3.0.0-deterministic+claude-3-5"
  summaryNarrative: (0, import_mysql_core.text)("summary_narrative"),
  safetyGateVerified: (0, import_mysql_core.boolean)("safety_gate_verified").default(true).notNull()
});
var identifiedGaps = mysqlTable("identified_gaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").references(() => wellbeingGapReports.id, { onDelete: "cascade" }).notNull(),
  nutrientId: uuid("nutrient_id").references(() => nutrients.id).notNull(),
  gapType: (0, import_mysql_core.varchar)("gap_type", { length: 20 }).notNull(),
  // "deficiency" | "excess"
  severity: (0, import_mysql_core.varchar)("severity", { length: 20 }).notNull(),
  // "low" | "moderate" | "high"
  estimatedIntakePct: numeric("estimated_intake_pct", { precision: 6, scale: 2 }).notNull(),
  // e.g. 42.50% of adjusted target
  targetRda: numeric("target_rda", { precision: 10, scale: 2 }).notNull(),
  // Profile & altitude-adjusted target
  calculatedDailyIntake: numeric("calculated_daily_intake", { precision: 10, scale: 2 }).notNull(),
  sourceRef: (0, import_mysql_core.varchar)("source_ref", { length: 100 }).notNull()
  // "EFCT2025-EVAL-THR"
});
var gapCauses = mysqlTable("gap_causes", {
  id: uuid("id").primaryKey().defaultRandom(),
  gapId: uuid("gap_id").references(() => identifiedGaps.id, { onDelete: "cascade" }).notNull(),
  causeType: (0, import_mysql_core.varchar)("cause_type", { length: 40 }).notNull(),
  // "dietary" | "absorption_inhibitor" | "medication" | "age_related" | "lifestyle"
  title: (0, import_mysql_core.varchar)("title", { length: 255 }).notNull(),
  description: (0, import_mysql_core.text)("description").notNull(),
  evidenceStrength: (0, import_mysql_core.varchar)("evidence_strength", { length: 20 }).notNull(),
  // "established" | "probable" | "preliminary"
  sourceRef: (0, import_mysql_core.varchar)("source_ref", { length: 100 }).notNull()
  // Traceability is required
});
var gapSolutions = mysqlTable("gap_solutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  gapId: uuid("gap_id").references(() => identifiedGaps.id, { onDelete: "cascade" }).notNull(),
  solutionType: (0, import_mysql_core.varchar)("solution_type", { length: 40 }).notNull(),
  // "dietary_change" | "traditional_remedy" | "lifestyle" | "referral"
  title: (0, import_mysql_core.varchar)("title", { length: 255 }).notNull(),
  description: (0, import_mysql_core.text)("description").notNull(),
  herbId: uuid("herb_id").references(() => herbs.id),
  // optional if traditional_remedy
  interactionChecked: (0, import_mysql_core.varchar)("interaction_checked", { length: 20 }).default("pending").notNull(),
  // "pass" | "flagged" | "n_a"
  rankScore: numeric("rank_score", { precision: 4, scale: 2 }).default("1.00").notNull(),
  sourceRef: (0, import_mysql_core.varchar)("source_ref", { length: 100 }).notNull()
});
var auditLog = mysqlTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  eventType: (0, import_mysql_core.varchar)("event_type", { length: 80 }).notNull(),
  // maps to action / event type
  action: (0, import_mysql_core.varchar)("action", { length: 100 }),
  resourceType: (0, import_mysql_core.varchar)("resource_type", { length: 50 }),
  resourceId: (0, import_mysql_core.varchar)("resource_id", { length: 100 }),
  payload: jsonb("payload").default({}).notNull(),
  details: jsonb("details").default({}),
  ipAddress: (0, import_mysql_core.varchar)("ip_address", { length: 45 }),
  userAgent: (0, import_mysql_core.text)("user_agent"),
  sessionId: uuid("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// src/lib/db/schema/emergency.ts
var emergencyProfiles = mysqlTable("emergency_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  // Emergency contacts
  contacts: jsonb("contacts").default([]).notNull(),
  // $jsonb shape: [{ name: string, phone: string, relationship: string }]
  // Conditions to share with emergency responders
  activeConditions: jsonb("active_conditions").default([]).notNull(),
  // $jsonb shape: string[]  e.g. ["anemia", "type_2_diabetes"]
  // Active medications — critical for paramedics
  activeMedications: jsonb("active_medications").default([]).notNull(),
  // $jsonb shape: [{ name: string, dose: string }]
  // Allergies (food, drug, environmental)
  knownAllergies: jsonb("known_allergies").default([]).notNull(),
  // $jsonb shape: string[]
  // Blood type (if known)
  bloodType: (0, import_mysql_core.varchar)("blood_type", { length: 10 }),
  // Nearest health facility
  preferredHospital: (0, import_mysql_core.varchar)("preferred_hospital", { length: 255 }),
  preferredHospitalPhone: (0, import_mysql_core.varchar)("preferred_hospital_phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var emergencyAlerts = mysqlTable("emergency_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  alertType: (0, import_mysql_core.varchar)("alert_type", { length: 50 }).notNull(),
  // "sos_manual" | "threshold_critical" | "no_checkin"
  severity: (0, import_mysql_core.varchar)("severity", { length: 20 }).notNull(),
  // "warning" | "critical"
  message: (0, import_mysql_core.text)("message").notNull(),
  contactsNotified: jsonb("contacts_notified").default([]).notNull(),
  // $jsonb shape: string[] — phone numbers notified
  resolved: (0, import_mysql_core.boolean)("resolved").default(false).notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// src/lib/db/schema/diagnostic.ts
var diagnosticSessions = mysqlTable("diagnostic_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  query: (0, import_mysql_core.text)("query").notNull(),
  mode: (0, import_mysql_core.varchar)("mode", { length: 20 }).default("text").notNull(),
  language: (0, import_mysql_core.varchar)("language", { length: 10 }).default("am").notNull(),
  urgencyLevel: (0, import_mysql_core.varchar)("urgency_level", { length: 20 }).notNull(),
  urgencyScore: integer("urgency_score").notNull(),
  intent: (0, import_mysql_core.varchar)("intent", { length: 50 }).notNull(),
  summary: jsonb("summary").notNull(),
  causes: jsonb("causes").default([]).notNull(),
  solutions: jsonb("solutions").default([]).notNull(),
  actionPlan: jsonb("action_plan").notNull(),
  safetyWarnings: jsonb("safety_warnings").default([]).notNull(),
  culturalContext: jsonb("cultural_context"),
  // Domain B isolated
  astrologicalContext: jsonb("astrological_context"),
  // Domain B isolated
  rawPayload: jsonb("raw_payload"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// src/lib/db/schema/caseWorkflow.ts
var caseCategories = mysqlTable("case_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: (0, import_mysql_core.varchar)("name", { length: 120 }).notNull(),
  description: (0, import_mysql_core.text)("description").notNull(),
  icon: (0, import_mysql_core.varchar)("icon", { length: 20 }).notNull(),
  isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  commonQuestionSetId: (0, import_mysql_core.varchar)("common_question_set_id", { length: 120 }).notNull(),
  specializedQuestionSets: jsonb("specialized_question_sets").default([]).notNull(),
  knowledgeStrandFilters: jsonb("knowledge_strand_filters").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var caseQuestions = mysqlTable("case_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionSetId: (0, import_mysql_core.varchar)("question_set_id", { length: 120 }).notNull(),
  fieldId: (0, import_mysql_core.varchar)("field_id", { length: 120 }).notNull(),
  text: (0, import_mysql_core.text)("text").notNull(),
  type: (0, import_mysql_core.varchar)("type", { length: 20 }).notNull(),
  required: (0, import_mysql_core.boolean)("required").default(false).notNull(),
  options: jsonb("options").default([]).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  section: (0, import_mysql_core.varchar)("section", { length: 20 }).notNull(),
  dependsOn: jsonb("depends_on"),
  knowledgeMappings: jsonb("knowledge_mappings").default([]).notNull()
});
var caseSessions = mysqlTable("case_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  caseId: (0, import_mysql_core.varchar)("case_id", { length: 120 }).notNull(),
  answers: jsonb("answers").default({}).notNull(),
  activeSpecializedPath: (0, import_mysql_core.varchar)("active_specialized_path", { length: 120 }),
  currentStep: (0, import_mysql_core.varchar)("current_step", { length: 30 }).default("common").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull()
});
var caseCauses = mysqlTable("case_causes", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => caseSessions.id, { onDelete: "cascade" }).notNull(),
  description: (0, import_mysql_core.text)("description").notNull(),
  confidence: integer("confidence").notNull(),
  evidence: jsonb("evidence").default([]).notNull(),
  category: (0, import_mysql_core.varchar)("category", { length: 40 }).notNull(),
  isSelected: (0, import_mysql_core.boolean)("is_selected").default(true).notNull()
});
var caseSolutions = mysqlTable("case_solutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => caseSessions.id, { onDelete: "cascade" }).notNull(),
  title: (0, import_mysql_core.text)("title").notNull(),
  section: (0, import_mysql_core.varchar)("section", { length: 30 }).notNull(),
  description: (0, import_mysql_core.text)("description").notNull(),
  steps: jsonb("steps").default([]).notNull(),
  confidence: integer("confidence").notNull(),
  basedOnCauses: jsonb("based_on_causes").default([]).notNull(),
  knowledgeReferences: jsonb("knowledge_references").default([]).notNull()
});
var workflowCases = mysqlTable("workflow_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  domain: (0, import_mysql_core.varchar)("domain", { length: 30 }).notNull(),
  stage: (0, import_mysql_core.varchar)("stage", { length: 40 }).notNull(),
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var workflowCaseMedia = mysqlTable("workflow_case_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  caseId: uuid("case_id").references(() => workflowCases.id, { onDelete: "cascade" }),
  kind: (0, import_mysql_core.varchar)("kind", { length: 10 }).notNull(),
  mimeType: (0, import_mysql_core.varchar)("mime_type", { length: 100 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  storageKey: (0, import_mysql_core.varchar)("storage_key", { length: 200 }).notNull(),
  originalName: (0, import_mysql_core.varchar)("original_name", { length: 200 }),
  sha256: (0, import_mysql_core.varchar)("sha256", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [(0, import_mysql_core.index)("workflow_case_media_user_idx").on(table.userId, table.createdAt), (0, import_mysql_core.index)("workflow_case_media_case_idx").on(table.caseId)]);
var chatIntakes = mysqlTable("chat_intakes", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).primaryKey(),
  state: jsonb("state").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// src/lib/db/schema/knowledgeManagement.ts
var knowledgeStrands = mysqlTable("knowledge_strands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: (0, import_mysql_core.varchar)("name", { length: 100 }).notNull().unique(),
  description: (0, import_mysql_core.text)("description").default("").notNull(),
  version: (0, import_mysql_core.varchar)("version", { length: 30 }).default("1.0.0").notNull(),
  isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var knowledgeCategories = mysqlTable("knowledge_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  strandId: uuid("strand_id").references(() => knowledgeStrands.id, { onDelete: "cascade" }).notNull(),
  name: (0, import_mysql_core.varchar)("name", { length: 120 }).notNull(),
  description: (0, import_mysql_core.text)("description").default("").notNull(),
  schema: jsonb("schema").default({ fields: [] }).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var knowledgeItems = mysqlTable("knowledge_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => knowledgeCategories.id, { onDelete: "cascade" }).notNull(),
  data: jsonb("data").default({}).notNull(),
  version: integer("version").default(1).notNull(),
  status: (0, import_mysql_core.varchar)("status", { length: 20 }).default("draft").notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var knowledgeVersions = mysqlTable("knowledge_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id").references(() => knowledgeItems.id, { onDelete: "cascade" }).notNull(),
  data: jsonb("data").notNull(),
  versionNumber: integer("version_number").notNull(),
  changeComment: (0, import_mysql_core.text)("change_comment").default("").notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// src/lib/db/schema/rbac.ts
var PERMISSION_CATEGORIES = {
  PUBLIC: "Public & General",
  PROFILE: "User Profile",
  CASES: "Scientific Cases",
  PREMIUM_FEATURES: "Premium Features & AI",
  CONTENT: "Knowledge & Content Management",
  USER_MANAGEMENT: "User Management",
  ROLE_MANAGEMENT: "Role Management",
  AUDIT_ANALYTICS: "Audit & Analytics",
  SYSTEM: "System Administration",
  PRACTITIONER: "Practitioner Portal"
};
var ALL_PERMISSIONS = [
  // Public
  { key: "public:view", label: "View Public Pages", category: PERMISSION_CATEGORIES.PUBLIC },
  { key: "auth:register", label: "User Registration & Login", category: PERMISSION_CATEGORIES.PUBLIC },
  // Profile
  { key: "profile:view", label: "View Own Profile", category: PERMISSION_CATEGORIES.PROFILE },
  { key: "profile:edit", label: "Edit Own Profile", category: PERMISSION_CATEGORIES.PROFILE },
  // Cases
  { key: "cases:create", label: "Create Wellbeing Cases", category: PERMISSION_CATEGORIES.CASES },
  { key: "cases:view", label: "View Own Wellbeing Cases", category: PERMISSION_CATEGORIES.CASES },
  { key: "cases:edit", label: "Edit Own Wellbeing Cases", category: PERMISSION_CATEGORIES.CASES },
  { key: "cases:review", label: "Review Assigned Case Requests", category: PERMISSION_CATEGORIES.CASES },
  // Premium Features
  { key: "ai:chat", label: "Advanced AI Chat Engine", category: PERMISSION_CATEGORIES.PREMIUM_FEATURES },
  { key: "reports:full", label: "Full Multi-Disciplinary Reports", category: PERMISSION_CATEGORIES.PREMIUM_FEATURES },
  { key: "reports:basic", label: "Basic Wellbeing Gap Reports", category: PERMISSION_CATEGORIES.PREMIUM_FEATURES },
  { key: "data:export", label: "Export Wellbeing Data (JSON/CSV)", category: PERMISSION_CATEGORIES.PREMIUM_FEATURES },
  // Content
  { key: "content:view", label: "View Knowledge Base Items", category: PERMISSION_CATEGORIES.CONTENT },
  { key: "content:edit", label: "Edit Knowledge Base Strands & Items", category: PERMISSION_CATEGORIES.CONTENT },
  { key: "content:submit", label: "Submit Knowledge Content for Review", category: PERMISSION_CATEGORIES.CONTENT },
  { key: "content:review", label: "Review Knowledge Content Submissions", category: PERMISSION_CATEGORIES.CONTENT },
  { key: "content:approve", label: "Approve Knowledge Content", category: PERMISSION_CATEGORIES.CONTENT },
  { key: "content:publish", label: "Publish Knowledge Content", category: PERMISSION_CATEGORIES.CONTENT },
  // User Management
  { key: "users:view", label: "View User Directory", category: PERMISSION_CATEGORIES.USER_MANAGEMENT },
  { key: "users:create", label: "Create Users", category: PERMISSION_CATEGORIES.USER_MANAGEMENT },
  { key: "users:edit", label: "Edit User Information", category: PERMISSION_CATEGORIES.USER_MANAGEMENT },
  { key: "users:delete", label: "Delete Users", category: PERMISSION_CATEGORIES.USER_MANAGEMENT },
  { key: "users:suspend", label: "Suspend / Activate Users", category: PERMISSION_CATEGORIES.USER_MANAGEMENT },
  { key: "users:impersonate", label: "Impersonate User Account", category: PERMISSION_CATEGORIES.USER_MANAGEMENT },
  // Role Management
  { key: "roles:view", label: "View Roles & Permissions", category: PERMISSION_CATEGORIES.ROLE_MANAGEMENT },
  { key: "roles:create", label: "Create Custom Roles", category: PERMISSION_CATEGORIES.ROLE_MANAGEMENT },
  { key: "roles:edit", label: "Edit Roles & Permissions", category: PERMISSION_CATEGORIES.ROLE_MANAGEMENT },
  { key: "roles:delete", label: "Delete Custom Roles", category: PERMISSION_CATEGORIES.ROLE_MANAGEMENT },
  // Audit & Analytics
  { key: "audit:view", label: "View System Audit Logs", category: PERMISSION_CATEGORIES.AUDIT_ANALYTICS },
  { key: "analytics:view", label: "View Analytics & Statistics", category: PERMISSION_CATEGORIES.AUDIT_ANALYTICS },
  // System
  { key: "settings:manage", label: "Manage System Settings", category: PERMISSION_CATEGORIES.SYSTEM },
  // Practitioner
  { key: "practitioner:profile:manage", label: "Manage Verified Practitioner Profile", category: PERMISSION_CATEGORIES.PRACTITIONER },
  { key: "practitioner:consult", label: "Consult Users & Scientific Sessions", category: PERMISSION_CATEGORIES.PRACTITIONER }
];
var DEFAULT_ROLE_PERMISSIONS = {
  super_admin: ["*"],
  admin: [
    "public:view",
    "auth:register",
    "profile:view",
    "profile:edit",
    "cases:create",
    "cases:view",
    "cases:edit",
    "cases:review",
    "reports:basic",
    "reports:full",
    "ai:chat",
    "data:export",
    "content:view",
    "content:edit",
    "content:submit",
    "content:review",
    "content:approve",
    "content:publish",
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
    "users:suspend",
    "roles:view",
    "audit:view",
    "analytics:view",
    "practitioner:consult",
    "practitioner:profile:manage"
  ],
  premium: [
    "public:view",
    "auth:register",
    "profile:view",
    "profile:edit",
    "cases:create",
    "cases:view",
    "cases:edit",
    "reports:basic",
    "reports:full",
    "ai:chat",
    "data:export",
    "practitioner:consult"
  ],
  user: [
    "public:view",
    "auth:register",
    "profile:view",
    "profile:edit",
    "cases:create",
    "cases:view",
    "cases:edit",
    "reports:basic"
  ],
  editor: [
    "public:view",
    "auth:register",
    "profile:view",
    "profile:edit",
    "cases:create",
    "cases:view",
    "cases:edit",
    "reports:basic",
    "reports:full",
    "ai:chat",
    "data:export",
    "content:view",
    "content:edit",
    "content:submit"
  ],
  reviewer: [
    "public:view",
    "auth:register",
    "profile:view",
    "profile:edit",
    "cases:create",
    "cases:view",
    "cases:edit",
    "cases:review",
    "reports:basic",
    "reports:full",
    "ai:chat",
    "data:export",
    "content:view",
    "content:review",
    "content:approve"
  ],
  practitioner: [
    "public:view",
    "auth:register",
    "profile:view",
    "profile:edit",
    "cases:create",
    "cases:view",
    "cases:edit",
    "cases:review",
    "reports:basic",
    "reports:full",
    "ai:chat",
    "data:export",
    "practitioner:profile:manage",
    "practitioner:consult"
  ],
  analyst: [
    "public:view",
    "auth:register",
    "profile:view",
    "profile:edit",
    "cases:create",
    "cases:view",
    "audit:view",
    "analytics:view"
  ],
  guest: [
    "public:view",
    "auth:register"
  ]
};
function roleHasPermission(rolePermissions, permission) {
  if (rolePermissions.includes("*"))
    return true;
  return rolePermissions.includes(permission);
}

// src/lib/db/schema/literatureFindings.ts
var literatureFindings = mysqlTable("literature_findings", {
  id: uuid("id").primaryKey().defaultRandom(),
  // ── Source metadata ──────────────────────────────────────────────────────────
  pmid: (0, import_mysql_core.text)("pmid"),
  // PubMed ID (may be null for non-PubMed sources)
  doi: (0, import_mysql_core.text)("doi"),
  // Digital Object Identifier
  title: (0, import_mysql_core.text)("title").notNull(),
  abstract: (0, import_mysql_core.text)("abstract"),
  authors: jsonb("authors").$type(),
  journal: (0, import_mysql_core.text)("journal"),
  pubDate: (0, import_mysql_core.text)("pub_date"),
  // YYYY or YYYY-MM
  source: (0, import_mysql_core.text)("source").notNull(),
  // "pubmed" | "europepmc" | "who_gho" | "openalex" | "gbd_ihme"
  // ── Strand mapping ───────────────────────────────────────────────────────────
  strand: (0, import_mysql_core.text)("strand").notNull(),
  // KnowledgeStrandType
  strandTopicMatch: (0, import_mysql_core.text)("strand_topic_match"),
  // Comma-separated matched keywords
  relevanceScore: real("relevance_score"),
  // 0.0–1.0 normalised overlap score
  // ── Extracted findings (dependent variables per strand) ──────────────────────
  extractedData: jsonb("extracted_data").$type(),
  // ── Processing metadata ──────────────────────────────────────────────────────
  fetchedAt: timestamp("fetched_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  isActive: integer("is_active").default(1),
  // 1 = active, 0 = superseded/archived
  // ── Bibliographic enrichment ────────────────────────────────────────────────
  meshTerms: jsonb("mesh_terms").$type(),
  keywords: jsonb("keywords").$type(),
  citationCount: integer("citation_count")
});
var literatureSyncLog = mysqlTable("literature_sync_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  articlesFound: integer("articles_found").default(0),
  newArticles: integer("new_articles").default(0),
  updatedArticles: integer("updated_articles").default(0),
  errors: jsonb("errors").$type(),
  byStrand: jsonb("by_strand").$type(),
  bySource: jsonb("by_source").$type(),
  triggeredBy: (0, import_mysql_core.text)("triggered_by").default("cron")
  // "cron" | "manual"
});

// src/lib/db/schema/ethnomedicine.ts
var platformCases = mysqlTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: (0, import_mysql_core.varchar)("status", { length: 40 }).$type().default("intake").notNull(),
  caseType: (0, import_mysql_core.varchar)("case_type", { length: 80 }).notNull(),
  practitionerId: uuid("practitioner_id").references(() => users.id, { onDelete: "set null" }),
  clientConcern: (0, import_mysql_core.text)("client_concern"),
  intakeData: jsonb("intake_data").$type().default({}).notNull(),
  referralReason: (0, import_mysql_core.varchar)("referral_reason", { length: 80 }),
  referralUrgency: (0, import_mysql_core.varchar)("referral_urgency", { length: 20 }),
  practitionerNotes: (0, import_mysql_core.text)("practitioner_notes"),
  practitionerEdits: jsonb("practitioner_edits").$type(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at")
});
var scientificAnalyses = mysqlTable("scientific_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id").references(() => platformCases.id, { onDelete: "cascade" }).notNull().unique(),
  caloricBaseline: jsonb("caloric_baseline").$type(),
  aminoAcidModel: jsonb("amino_acid_model").$type(),
  fattyAcidModel: jsonb("fatty_acid_model").$type(),
  climateStress: jsonb("climate_stress").$type(),
  epidemiology: jsonb("epidemiology").$type(),
  diseaseIncidence: jsonb("disease_incidence").$type(),
  rawAnalysis: jsonb("raw_analysis").$type(),
  modelMetadata: jsonb("model_metadata").$type(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var culturalReports = mysqlTable("cultural_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id").references(() => platformCases.id, { onDelete: "cascade" }).notNull().unique(),
  traditionalTranslation: (0, import_mysql_core.text)("traditional_translation"),
  hexacoreFirstOrder: jsonb("hexacore_first_order").$type(),
  geographicalLandmarkSymbology: jsonb("geographical_landmark_symbology").$type(),
  herbalSolutions: jsonb("herbal_solutions").$type(),
  ritualSolutions: jsonb("ritual_solutions").$type(),
  safetyNotice: (0, import_mysql_core.text)("safety_notice"),
  generatedBy: (0, import_mysql_core.varchar)("generated_by", { length: 80 }).default("system").notNull(),
  endorsedBy: uuid("endorsed_by").references(() => users.id, { onDelete: "set null" }),
  endorsedAt: timestamp("endorsed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var biometricScans = mysqlTable("biometric_scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  caseId: uuid("case_id").references(() => platformCases.id, { onDelete: "set null" }),
  imageUrl: (0, import_mysql_core.varchar)("image_url", { length: 1e3 }).notNull(),
  scanType: (0, import_mysql_core.varchar)("scan_type", { length: 20 }).$type().notNull(),
  /**
   * Domain A restricted output. Keep this column out of all user-facing
   * serializers and APIs.
   */
  rawAiScientificFindings: jsonb("raw_ai_scientific_findings").$type(),
  /**
   * Domain B reviewed interpretation. This must remain reflective and
   * non-diagnostic, with a safety notice included in the API response.
   */
  translatedCulturalFindings: jsonb("translated_cultural_findings").$type(),
  redFlags: jsonb("red_flags").$type(),
  imageHash: (0, import_mysql_core.varchar)("image_hash", { length: 64 }),
  reviewStatus: (0, import_mysql_core.varchar)("review_status", { length: 40 }).default("pending_expert_review").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var attunementReminders = mysqlTable("attunement_reminders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  nextPromptAt: timestamp("next_prompt_at").notNull(),
  promptType: (0, import_mysql_core.varchar)("prompt_type", { length: 20 }).$type().notNull(),
  optedIn: (0, import_mysql_core.boolean)("opted_in").default(false).notNull(),
  dismissedCount: integer("dismissed_count").default(0).notNull(),
  completedCount: integer("completed_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// src/lib/db/schema/marketplace.ts
var timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
};
var businessCategories = mysqlTable("business_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: (0, import_mysql_core.varchar)("slug", { length: 80 }).notNull().unique(),
  name: (0, import_mysql_core.varchar)("name", { length: 120 }).notNull(),
  nameAm: (0, import_mysql_core.varchar)("name_am", { length: 120 }),
  description: (0, import_mysql_core.text)("description"),
  /** "healing" or "cultural" — drives safety requirements and navigation grouping. */
  sector: (0, import_mysql_core.varchar)("sector", { length: 20 }).notNull(),
  icon: (0, import_mysql_core.varchar)("icon", { length: 40 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
  ...timestamps
});
var serviceKinds = mysqlTable("service_kinds", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: (0, import_mysql_core.varchar)("slug", { length: 80 }).notNull().unique(),
  name: (0, import_mysql_core.varchar)("name", { length: 120 }).notNull(),
  nameAm: (0, import_mysql_core.varchar)("name_am", { length: 120 }),
  description: (0, import_mysql_core.text)("description"),
  /** Whether bookings of this kind require the client safety screen (e.g. remedies taken by mouth). */
  requiresSafetyScreen: (0, import_mysql_core.boolean)("requires_safety_screen").default(false).notNull(),
  /** Optional link to an expert-reviewed case workflow domain (career, spiritual …). */
  caseDomain: (0, import_mysql_core.varchar)("case_domain", { length: 30 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
  ...timestamps
});
var businesses = mysqlTable(
  "businesses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: (0, import_mysql_core.varchar)("slug", { length: 120 }).notNull().unique(),
    ownerId: uuid("owner_id").references(() => users.id, { onDelete: "restrict" }).notNull(),
    categoryId: uuid("category_id").references(() => businessCategories.id).notNull(),
    name: (0, import_mysql_core.varchar)("name", { length: 160 }).notNull(),
    nameAm: (0, import_mysql_core.varchar)("name_am", { length: 160 }),
    tagline: (0, import_mysql_core.varchar)("tagline", { length: 240 }),
    description: (0, import_mysql_core.text)("description"),
    region: (0, import_mysql_core.varchar)("region", { length: 100 }),
    city: (0, import_mysql_core.varchar)("city", { length: 100 }),
    address: (0, import_mysql_core.text)("address"),
    phone: (0, import_mysql_core.varchar)("phone", { length: 30 }),
    email: (0, import_mysql_core.varchar)("email", { length: 255 }),
    languages: jsonb("languages").$type().default([]).notNull(),
    deliveryModes: jsonb("delivery_modes").$type().default([]).notNull(),
    logoUrl: (0, import_mysql_core.text)("logo_url"),
    coverUrl: (0, import_mysql_core.text)("cover_url"),
    timezone: (0, import_mysql_core.varchar)("timezone", { length: 60 }).default("Africa/Addis_Ababa").notNull(),
    /** draft → pending_verification → verified; suspended by administrators. */
    status: (0, import_mysql_core.varchar)("status", { length: 30 }).default("draft").notNull(),
    verification: jsonb("verification").$type(),
    /** Where clients can pay this business directly (shown on bookings). */
    paymentAccounts: jsonb("payment_accounts").$type().default({}).notNull(),
    ratingAverage: numeric("rating_average", { precision: 3, scale: 2 }),
    ratingCount: integer("rating_count").default(0).notNull(),
    ...timestamps
  },
  (table) => [
    (0, import_mysql_core.index)("businesses_status_idx").on(table.status),
    (0, import_mysql_core.index)("businesses_category_idx").on(table.categoryId),
    (0, import_mysql_core.index)("businesses_region_idx").on(table.region)
  ]
);
var businessMembers = mysqlTable(
  "business_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    /** owner | manager | practitioner | staff */
    role: (0, import_mysql_core.varchar)("role", { length: 20 }).notNull(),
    title: (0, import_mysql_core.varchar)("title", { length: 120 }),
    isBookable: (0, import_mysql_core.boolean)("is_bookable").default(false).notNull(),
    ...timestamps
  },
  (table) => [(0, import_mysql_core.uniqueIndex)("business_members_unique").on(table.businessId, table.userId)]
);
var services = mysqlTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    kindId: uuid("kind_id").references(() => serviceKinds.id).notNull(),
    name: (0, import_mysql_core.varchar)("name", { length: 160 }).notNull(),
    nameAm: (0, import_mysql_core.varchar)("name_am", { length: 160 }),
    description: (0, import_mysql_core.text)("description"),
    durationMinutes: integer("duration_minutes").notNull(),
    priceEtb: numeric("price_etb", { precision: 12, scale: 2 }).notNull(),
    deliveryModes: jsonb("delivery_modes").$type().default([]).notNull(),
    /** Minutes kept free after each booking. */
    bufferMinutes: integer("buffer_minutes").default(0).notNull(),
    isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps
  },
  (table) => [(0, import_mysql_core.index)("services_business_idx").on(table.businessId)]
);
var availabilityRules = mysqlTable(
  "availability_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    memberId: uuid("member_id").references(() => businessMembers.id, { onDelete: "cascade" }),
    weekday: (0, import_mysql_core.smallint)("weekday").notNull(),
    startMinute: integer("start_minute").notNull(),
    endMinute: integer("end_minute").notNull(),
    ...timestamps
  },
  (table) => [(0, import_mysql_core.index)("availability_business_idx").on(table.businessId)]
);
var timeOff = mysqlTable("time_off", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  memberId: uuid("member_id").references(() => businessMembers.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  reason: (0, import_mysql_core.varchar)("reason", { length: 200 }),
  ...timestamps
});
var businessClients = mysqlTable(
  "business_clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    name: (0, import_mysql_core.varchar)("name", { length: 160 }).notNull(),
    phone: (0, import_mysql_core.varchar)("phone", { length: 30 }),
    email: (0, import_mysql_core.varchar)("email", { length: 255 }),
    /** Private practitioner notes; never shown to the client. */
    notes: (0, import_mysql_core.text)("notes"),
    tags: jsonb("tags").$type().default([]).notNull(),
    consent: jsonb("consent").$type().default({}).notNull(),
    ...timestamps
  },
  (table) => [
    (0, import_mysql_core.index)("business_clients_business_idx").on(table.businessId),
    (0, import_mysql_core.uniqueIndex)("business_clients_user_unique").on(table.businessId, table.userId)
  ]
);
var bookings = mysqlTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: (0, import_mysql_core.varchar)("reference", { length: 20 }).notNull().unique(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    serviceId: uuid("service_id").references(() => services.id).notNull(),
    clientId: uuid("client_id").references(() => businessClients.id).notNull(),
    bookedByUserId: uuid("booked_by_user_id").references(() => users.id, { onDelete: "set null" }),
    memberId: uuid("member_id").references(() => businessMembers.id, { onDelete: "set null" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    deliveryMode: (0, import_mysql_core.varchar)("delivery_mode", { length: 20 }).notNull(),
    /** requested → confirmed → completed; declined / cancelled / no_show end the booking. */
    status: (0, import_mysql_core.varchar)("status", { length: 20 }).default("requested").notNull(),
    priceEtb: numeric("price_etb", { precision: 12, scale: 2 }).notNull(),
    paymentStatus: (0, import_mysql_core.varchar)("payment_status", { length: 20 }).default("unpaid").notNull(),
    clientNote: (0, import_mysql_core.text)("client_note"),
    businessNote: (0, import_mysql_core.text)("business_note"),
    safety: jsonb("safety").$type(),
    /** Client intake for the service: dropdown choice, text, Ge'ez names and attachment ids. */
    intake: jsonb("intake").$type(),
    caseId: uuid("case_id"),
    cancelledBy: (0, import_mysql_core.varchar)("cancelled_by", { length: 20 }),
    cancelReason: (0, import_mysql_core.text)("cancel_reason"),
    ...timestamps
  },
  (table) => [
    (0, import_mysql_core.index)("bookings_business_time_idx").on(table.businessId, table.startsAt),
    (0, import_mysql_core.index)("bookings_client_idx").on(table.clientId),
    (0, import_mysql_core.index)("bookings_user_idx").on(table.bookedByUserId),
    (0, import_mysql_core.index)("bookings_status_idx").on(table.status)
  ]
);
var payments = mysqlTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    clientId: uuid("client_id").references(() => businessClients.id, { onDelete: "set null" }),
    amountEtb: numeric("amount_etb", { precision: 12, scale: 2 }).notNull(),
    method: (0, import_mysql_core.varchar)("method", { length: 30 }).notNull(),
    reference: (0, import_mysql_core.varchar)("reference", { length: 120 }),
    note: (0, import_mysql_core.text)("note"),
    /** recorded | voided; client-submitted proofs start as pending and become recorded or rejected. */
    status: (0, import_mysql_core.varchar)("status", { length: 20 }).default("recorded").notNull(),
    /** Set when the client reported this payment themselves (telebirr / bank transfer proof). */
    submittedBy: uuid("submitted_by").references(() => users.id, { onDelete: "set null" }),
    receivedOn: date("received_on").notNull(),
    recordedBy: uuid("recorded_by").references(() => users.id, { onDelete: "set null" }),
    voidedBy: uuid("voided_by").references(() => users.id, { onDelete: "set null" }),
    voidReason: (0, import_mysql_core.text)("void_reason"),
    ...timestamps
  },
  (table) => [(0, import_mysql_core.index)("payments_business_idx").on(table.businessId, table.receivedOn)]
);
var remedies = mysqlTable(
  "remedies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    name: (0, import_mysql_core.varchar)("name", { length: 160 }).notNull(),
    nameAm: (0, import_mysql_core.varchar)("name_am", { length: 160 }),
    /** powder, oil, decoction, smoke, ointment … */
    form: (0, import_mysql_core.varchar)("form", { length: 40 }).notNull(),
    description: (0, import_mysql_core.text)("description"),
    unit: (0, import_mysql_core.varchar)("unit", { length: 20 }).notNull(),
    stockQuantity: numeric("stock_quantity", { precision: 12, scale: 2 }).default("0").notNull(),
    reorderLevel: numeric("reorder_level", { precision: 12, scale: 2 }).default("0").notNull(),
    priceEtb: numeric("price_etb", { precision: 12, scale: 2 }),
    /** Practitioner-entered cautions shown to clients. */
    safetyNotes: (0, import_mysql_core.text)("safety_notes"),
    isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
    ...timestamps
  },
  (table) => [(0, import_mysql_core.index)("remedies_business_idx").on(table.businessId)]
);
var remedyIngredients = mysqlTable(
  "remedy_ingredients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    remedyId: uuid("remedy_id").references(() => remedies.id, { onDelete: "cascade" }).notNull(),
    herbId: uuid("herb_id").references(() => herbs.id),
    name: (0, import_mysql_core.varchar)("name", { length: 160 }).notNull(),
    ...timestamps
  },
  (table) => [(0, import_mysql_core.index)("remedy_ingredients_remedy_idx").on(table.remedyId)]
);
var stockMovements = mysqlTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  remedyId: uuid("remedy_id").references(() => remedies.id, { onDelete: "cascade" }).notNull(),
  /** Positive for restock, negative for dispensing or waste. */
  quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
  reason: (0, import_mysql_core.varchar)("reason", { length: 30 }).notNull(),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  note: (0, import_mysql_core.text)("note"),
  recordedBy: uuid("recorded_by").references(() => users.id, { onDelete: "set null" }),
  ...timestamps
});
var reviews = mysqlTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "cascade" }).notNull().unique(),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    rating: (0, import_mysql_core.smallint)("rating").notNull(),
    comment: (0, import_mysql_core.text)("comment"),
    response: (0, import_mysql_core.text)("response"),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    /** published | hidden (moderation) */
    status: (0, import_mysql_core.varchar)("status", { length: 20 }).default("published").notNull(),
    ...timestamps
  },
  (table) => [(0, import_mysql_core.index)("reviews_business_idx").on(table.businessId)]
);
var conversations = mysqlTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    clientUserId: uuid("client_user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [(0, import_mysql_core.uniqueIndex)("conversations_unique").on(table.businessId, table.clientUserId)]
);
var messages = mysqlTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
    senderId: uuid("sender_id").references(() => users.id, { onDelete: "set null" }),
    /** client | business */
    senderSide: (0, import_mysql_core.varchar)("sender_side", { length: 10 }).notNull(),
    body: (0, import_mysql_core.text)("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [(0, import_mysql_core.index)("messages_conversation_idx").on(table.conversationId, table.createdAt)]
);
var realtimeEvents = mysqlTable(
  "realtime_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    /** Audience: "user:<uuid>" or "business:<uuid>". */
    channel: (0, import_mysql_core.varchar)("channel", { length: 80 }).notNull(),
    type: (0, import_mysql_core.varchar)("type", { length: 60 }).notNull(),
    payload: jsonb("payload").$type().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    (0, import_mysql_core.index)("realtime_events_channel_idx").on(table.channel, table.id),
    (0, import_mysql_core.index)("realtime_events_created_idx").on(table.createdAt)
  ]
);
var notifications = mysqlTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    type: (0, import_mysql_core.varchar)("type", { length: 60 }).notNull(),
    title: (0, import_mysql_core.varchar)("title", { length: 200 }).notNull(),
    body: (0, import_mysql_core.text)("body"),
    href: (0, import_mysql_core.text)("href"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [(0, import_mysql_core.index)("notifications_user_idx").on(table.userId, table.createdAt)]
);
var businessInvitations = mysqlTable(
  "business_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    email: (0, import_mysql_core.varchar)("email", { length: 255 }).notNull(),
    role: (0, import_mysql_core.varchar)("role", { length: 20 }).notNull(),
    title: (0, import_mysql_core.varchar)("title", { length: 120 }),
    isBookable: (0, import_mysql_core.boolean)("is_bookable").default(false).notNull(),
    tokenHash: (0, import_mysql_core.varchar)("token_hash", { length: 64 }).notNull().unique(),
    invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    acceptedBy: uuid("accepted_by").references(() => users.id, { onDelete: "set null" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [(0, import_mysql_core.index)("business_invitations_business_idx").on(table.businessId)]
);

// src/lib/db/schema/hexacore.ts
var hexacoreAspects = mysqlTable("hexacore_aspects", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: (0, import_mysql_core.varchar)("code", { length: 3 }).notNull().unique(),
  coreCode: (0, import_mysql_core.varchar)("core_code", { length: 1 }).$type().notNull(),
  name: (0, import_mysql_core.varchar)("name", { length: 80 }).notNull(),
  nameAm: (0, import_mysql_core.varchar)("name_am", { length: 80 }),
  expression: (0, import_mysql_core.text)("expression"),
  bodyZone: (0, import_mysql_core.varchar)("body_zone", { length: 80 }),
  frequencyHz: integer("frequency_hz"),
  shadow: (0, import_mysql_core.varchar)("shadow", { length: 100 }),
  gift: (0, import_mysql_core.varchar)("gift", { length: 100 }),
  displayOrder: integer("display_order").notNull()
});
var hexacorePractices = mysqlTable("hexacore_practices", {
  id: uuid("id").primaryKey().defaultRandom(),
  coreCode: (0, import_mysql_core.varchar)("core_code", { length: 1 }).$type().notNull(),
  aspectCode: (0, import_mysql_core.varchar)("aspect_code", { length: 3 }),
  type: (0, import_mysql_core.varchar)("type", { length: 30 }).notNull(),
  name: (0, import_mysql_core.varchar)("name", { length: 120 }).notNull(),
  nameAm: (0, import_mysql_core.varchar)("name_am", { length: 120 }),
  instruction: (0, import_mysql_core.text)("instruction").notNull(),
  durationMin: integer("duration_min"),
  timeOfDay: (0, import_mysql_core.varchar)("time_of_day", { length: 30 }),
  soundHz: integer("sound_hz"),
  herbId: uuid("herb_id"),
  references: jsonb("references").$type().default([]).notNull()
});
var hexacoreJournal = mysqlTable("hexacore_journal", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  entryDate: timestamp("entry_date").notNull(),
  selectedCore: (0, import_mysql_core.varchar)("selected_core", { length: 1 }).$type(),
  selectedAspect: (0, import_mysql_core.varchar)("selected_aspect", { length: 3 }),
  prompt: (0, import_mysql_core.text)("prompt"),
  response: (0, import_mysql_core.text)("response"),
  mood: integer("mood"),
  practiceCompleted: jsonb("practice_completed").$type().default([]).notNull(),
  frequenciesSnapshot: jsonb("frequencies_snapshot").$type(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var hexacorePracticeLog = mysqlTable("hexacore_practice_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  practiceId: uuid("practice_id").references(() => hexacorePractices.id, { onDelete: "cascade" }).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  durationSec: integer("duration_sec"),
  notes: (0, import_mysql_core.text)("notes")
});
var hexacoreFrequencyHistory = mysqlTable("hexacore_frequency_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  frequencies: jsonb("frequencies").$type().notNull(),
  dominantCore: (0, import_mysql_core.varchar)("dominant_core", { length: 1 }).$type().notNull(),
  source: (0, import_mysql_core.varchar)("source", { length: 50 }).notNull()
});
var hexacoreCircles = mysqlTable("hexacore_circles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: (0, import_mysql_core.varchar)("name", { length: 120 }).notNull(),
  slug: (0, import_mysql_core.varchar)("slug", { length: 140 }).notNull().unique(),
  coreCode: (0, import_mysql_core.varchar)("core_code", { length: 1 }).$type().notNull(),
  description: (0, import_mysql_core.text)("description"),
  isPrivate: (0, import_mysql_core.boolean)("is_private").default(false).notNull(),
  maxMembers: integer("max_members").default(12).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var hexacoreCircleMembers = mysqlTable("hexacore_circle_members", {
  circleId: uuid("circle_id").references(() => hexacoreCircles.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: (0, import_mysql_core.varchar)("role", { length: 20 }).default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull()
}, (table) => ({
  memberKey: (0, import_mysql_core.primaryKey)({ columns: [table.circleId, table.userId] })
}));
var hexacoreCirclePosts = mysqlTable("hexacore_circle_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  circleId: uuid("circle_id").references(() => hexacoreCircles.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: (0, import_mysql_core.varchar)("type", { length: 30 }).notNull(),
  body: (0, import_mysql_core.text)("body").notNull(),
  coreCode: (0, import_mysql_core.varchar)("core_code", { length: 1 }).$type(),
  aspectCode: (0, import_mysql_core.varchar)("aspect_code", { length: 3 }),
  frequenciesAtPost: jsonb("frequencies_at_post").$type(),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var hexacoreCircleReactions = mysqlTable("hexacore_circle_reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => hexacoreCirclePosts.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  kind: (0, import_mysql_core.varchar)("kind", { length: 30 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var hexacoreCircleInvites = mysqlTable("hexacore_circle_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  circleId: uuid("circle_id").references(() => hexacoreCircles.id, { onDelete: "cascade" }).notNull(),
  invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
  invitedEmail: (0, import_mysql_core.varchar)("invited_email", { length: 255 }),
  invitedUserId: uuid("invited_user_id").references(() => users.id, { onDelete: "set null" }),
  token: (0, import_mysql_core.varchar)("token", { length: 80 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var hexacoreProducts = mysqlTable("hexacore_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: (0, import_mysql_core.varchar)("code", { length: 60 }).notNull().unique(),
  name: (0, import_mysql_core.varchar)("name", { length: 140 }).notNull(),
  nameAm: (0, import_mysql_core.varchar)("name_am", { length: 140 }),
  tagline: (0, import_mysql_core.varchar)("tagline", { length: 240 }),
  taglineAm: (0, import_mysql_core.varchar)("tagline_am", { length: 240 }),
  description: (0, import_mysql_core.text)("description"),
  descriptionAm: (0, import_mysql_core.text)("description_am"),
  priceEtb: numeric("price_etb", { precision: 12, scale: 2 }).notNull(),
  priceUsd: numeric("price_usd", { precision: 8, scale: 2 }).notNull(),
  tier: (0, import_mysql_core.varchar)("tier", { length: 30 }).$type().notNull(),
  features: jsonb("features").$type().default([]).notNull(),
  badgeEn: (0, import_mysql_core.varchar)("badge_en", { length: 60 }),
  badgeAm: (0, import_mysql_core.varchar)("badge_am", { length: 60 }),
  isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var hexacorePurchases = mysqlTable("hexacore_purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: (0, import_mysql_core.varchar)("reference", { length: 30 }).notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  clientEmail: (0, import_mysql_core.varchar)("client_email", { length: 255 }),
  clientName: (0, import_mysql_core.varchar)("client_name", { length: 160 }),
  clientPhone: (0, import_mysql_core.varchar)("client_phone", { length: 40 }),
  productId: uuid("product_id").references(() => hexacoreProducts.id, { onDelete: "restrict" }).notNull(),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  amountPaidEtb: numeric("amount_paid_etb", { precision: 12, scale: 2 }).notNull(),
  amountPaidUsd: numeric("amount_paid_usd", { precision: 8, scale: 2 }),
  paymentMethod: (0, import_mysql_core.varchar)("payment_method", { length: 40 }).notNull(),
  paymentReference: (0, import_mysql_core.varchar)("payment_reference", { length: 140 }),
  status: (0, import_mysql_core.varchar)("status", { length: 30 }).default("pending").notNull(),
  clientIntake: jsonb("client_intake").$type(),
  unlockedPayload: jsonb("unlocked_payload").$type(),
  proofUrl: (0, import_mysql_core.text)("proof_url"),
  notes: (0, import_mysql_core.text)("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var hexacoreSubscriptions = mysqlTable("hexacore_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  plan: (0, import_mysql_core.varchar)("plan", { length: 40 }).notNull(),
  status: (0, import_mysql_core.varchar)("status", { length: 30 }).default("active").notNull(),
  amountEtb: numeric("amount_etb", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: (0, import_mysql_core.varchar)("payment_method", { length: 40 }).notNull(),
  renewsAt: timestamp("renews_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var HEXACORE_DEFAULT_PRODUCTS = [
  {
    code: "free_preview",
    name: "Hexacore Celestial Preview",
    nameAm: "\u12E8\u1204\u12AD\u1233\u12AE\u122D \u1218\u1230\u1228\u1273\u12CA \u12A5\u12ED\u1273",
    tagline: "Explore the 3 outer cores & current Ethiopian seasonal shift",
    taglineAm: "3\u1271\u1295 \u12CB\u1293 \u121B\u12D5\u12A8\u120B\u1275 \u12A5\u1293 \u12E8\u12C8\u1245\u1271\u1295 \u12E8\u12A2\u1275\u12EE\u1335\u12EB \u1208\u12CD\u1325 \u1260\u1290\u133B \u12ED\u1243\u1299",
    description: "Free celestial reflection exploring primary active cores and planetary alignments.",
    descriptionAm: "\u12E83\u1271\u1295 \u12CB\u1293 \u121B\u12D5\u12A8\u120B\u1275 \u121A\u12DB\u1295\u1293 \u12C8\u1245\u1273\u12CA \u1218\u1218\u122A\u12EB\u1295 \u1260\u1290\u133B \u12E8\u121A\u1243\u1299\u1260\u1275\u1362",
    priceEtb: "0.00",
    priceUsd: "0.00",
    tier: "free",
    badgeEn: "Free Access",
    badgeAm: "\u1290\u133B \u1218\u12F3\u1228\u123B",
    sortOrder: 1,
    features: [
      { textEn: "Interactive 3D Celestial Orrery (Layers 1\u20133)", textAm: "\u1270\u1295\u1240\u1233\u1243\u123D \u12E8\u12A6\u1228\u122A \u12A5\u12ED\u1273 (\u12F0\u1228\u1303 1-3)", highlight: true },
      { textEn: "Dominant Core & Aspect Identification", textAm: "\u12E8\u1240\u12F3\u121A \u121B\u12D5\u12A8\u120D \u1218\u1208\u12EB" },
      { textEn: "Current Ethiopian Season Shift (Kiremt/Tseday/Bega/Belg)", textAm: "\u12C8\u1245\u1273\u12CA \u12E8\u12A2\u1275\u12EE\u1335\u12EB \u12C8\u1245\u1275 \u1218\u1218\u122A\u12EB" },
      { textEn: "Basic Daily Journal Prompt", textAm: "\u12E8\u1240\u1295 \u121B\u1230\u120B\u1230\u12EB \u1325\u12EB\u1244" }
    ]
  },
  {
    code: "natal_dossier",
    name: "Complete 14-Layer Natal Arcana Dossier",
    nameAm: "\u12E8\u1270\u121F\u120B \u12E814-\u12F0\u1228\u1303 \u12E8\u120D\u12F0\u1275 \u12A0\u122D\u12AB\u1293 \u121B\u1205\u12F0\u122D",
    tagline: "Full numerology, archetypes, initiation trials, and exportable PDF dossier",
    taglineAm: "\u1219\u1209 \u12E8\u1241\u1325\u122D \u1235\u120C\u1275\u1363 \u1325\u1295\u1273\u12CA \u121D\u120D\u12AD\u1276\u127D\u1363 \u12E8\u1205\u12ED\u12C8\u1275 \u1348\u1270\u1293\u12CE\u127D \u12A5\u1293 \u12E8\u121A\u12C8\u122D\u12F5 \u1352\u12F2\u12A4\u134D \u121B\u1205\u12F0\u122D",
    description: "The definitive personal wisdom blueprint decoding all 14 layers, 6-based numerology, personal solfeggio audio frequency, and custom botanical formulations.",
    descriptionAm: "\u1201\u1209\u1295\u121D 14 \u12E8\u1325\u1260\u1265 \u12F0\u1228\u1303\u12CE\u127D\u1363 \u12E8\u12A2\u1275\u12EE\u1335\u12EB \u12D5\u133D\u12CB\u1275 \u1240\u1218\u121E\u127D\u1363 \u12E8\u12F5\u121D\u1345 \u134D\u122A\u12A9\u12CC\u1295\u1232 \u12A5\u1293 \u12E8\u1205\u12ED\u12C8\u1275 \u1218\u1295\u1308\u12F5\u1295 \u12E8\u12EB\u12D8 \u1325\u120D\u1245 \u121B\u1205\u12F0\u122D\u1362",
    priceEtb: "450.00",
    priceUsd: "14.99",
    tier: "standard",
    badgeEn: "Most Popular",
    badgeAm: "\u1270\u1218\u122B\u132D \u121B\u1205\u12F0\u122D",
    sortOrder: 2,
    features: [
      { textEn: "Complete 14-Layer Arcana Analysis Unlocked", textAm: "\u1219\u1209 14\u1271 \u12E8\u1325\u1260\u1265 \u12F0\u1228\u1303\u12CE\u127D \u1270\u12A8\u134D\u1270\u12CB\u120D", highlight: true },
      { textEn: "6-Based Traditional Numerology & Destiny Map", textAm: "\u12606 \u1241\u1325\u122D \u1235\u120C\u1275 \u12E8\u1270\u1230\u122B \u12E8\u12D5\u1323-\u1348\u1295\u1273 \u12AB\u122D\u1273" },
      { textEn: "Personal Solfeggio Audio Frequency (Hz)", textAm: "\u12E8\u130D\u120D \u12E8\u1236\u120D\u134C\u1305\u12EE \u12F5\u121D\u1345 \u134D\u122A\u12A9\u12CC\u1295\u1232 (Hz)" },
      { textEn: "Indigenous Ethiopian Botanical Formulations (Damakesse, Tena Adam)", textAm: "\u12E8\u1200\u1308\u122D \u1260\u1240\u120D \u12D5\u133D\u12CB\u1275 \u1240\u1218\u121E\u127D \u1218\u1218\u122A\u12EB" },
      { textEn: "Genesis Creation-Day Relational Cycles", textAm: "\u12E8\u1235\u1290-\u134D\u1325\u1228\u1275 6\u1271 \u1240\u1293\u1275 \u130D\u1295\u1299\u1290\u1276\u127D" },
      { textEn: "Print-Ready Gold & Obsidian PDF Client Dossier", textAm: "\u1260\u121A\u12EB\u121D\u122D \u12C8\u122D\u1243\u121B \u12F2\u12DB\u12ED\u1295 \u12E8\u121A\u12C8\u122D\u12F5 \u1352\u12F2\u12A4\u134D \u121B\u1205\u12F0\u122D", highlight: true }
    ]
  },
  {
    code: "guided_session",
    name: "1-on-1 Guided Debtera Consultation + Dossier",
    nameAm: "\u12E8\u130D\u120D \u12F0\u1265\u1270\u122B/\u1263\u1208\u1219\u12EB \u12E8\u121B\u121B\u12A8\u122D \u12AD\u134D\u1208-\u130A\u12DC + \u121B\u1205\u12F0\u122D",
    tagline: "45-min private video/in-person session with certified traditional wisdom guide",
    taglineAm: "\u12A8\u1263\u1208\u1219\u12EB \u130B\u122D \u12E845 \u12F0\u1242\u1243 \u12E8\u130D\u120D \u126A\u12F2\u12EE \u12C8\u12ED\u121D \u1260\u12A0\u12AB\u120D \u12E8\u121A\u12F0\u1228\u130D \u12E8\u1295\u1263\u1265 \u12AD\u134D\u1208-\u130A\u12DC",
    description: "Personalized reading with an authentic traditional debtera/spiritual guide to interpret your Awde Negast alignment, review family lineage, and formulate custom life direction practices.",
    descriptionAm: "\u12E8\u12A0\u12CD\u12F0-\u1290\u1308\u1225\u1275 \u1295\u1263\u1265\u1363 \u12E8\u1264\u1270\u1230\u1265 \u1275\u12CD\u120D\u12F5 \u1325\u1293\u1275 \u12A5\u1293 \u12E8\u1205\u12ED\u12C8\u1275 \u12A0\u1245\u1323\u132B \u1218\u1218\u122A\u12EB\u12CE\u127D\u1295 \u12A8\u1263\u1208\u1219\u12EB \u130B\u122D \u1260\u1325\u120D\u1240\u1275 \u12E8\u121A\u1218\u1228\u121D\u1229\u1260\u1275\u1362",
    priceEtb: "1200.00",
    priceUsd: "39.99",
    tier: "session",
    badgeEn: "Live Practitioner",
    badgeAm: "\u12E8\u1240\u1325\u1273 \u1263\u1208\u1219\u12EB",
    sortOrder: 3,
    features: [
      { textEn: "45-Minute Private Video or In-Person Session", textAm: "\u12E845 \u12F0\u1242\u1243 \u12E8\u130D\u120D \u12E8\u121B\u121B\u12A8\u122D \u12AD\u134D\u1208-\u130A\u12DC", highlight: true },
      { textEn: "Full 14-Layer Dossier Included ($14.99 Value)", textAm: "\u12E8\u1270\u121F\u120B\u12CD \u12E814-\u12F0\u1228\u1303 \u121B\u1205\u12F0\u122D \u1260\u1290\u133B \u1270\u12AB\u1275\u1277\u120D" },
      { textEn: "Awde Negast & Ge'ez Lineage Interpretation", textAm: "\u12E8\u12A0\u12CD\u12F0-\u1290\u1308\u1225\u1275\u1293 \u12E8\u1265\u122B\u1293 \u1275\u122D\u1313\u121C" },
      { textEn: "Debtera-Endorsed Botanical Formulation Guidance", textAm: "\u1260\u1263\u1208\u1219\u12EB \u12E8\u1270\u1228\u130B\u1308\u1320 \u12E8\u1263\u1205\u120B\u12CA \u12D5\u133D\u12CB\u1275 \u121D\u12AD\u1228-\u1200\u1233\u1265" },
      { textEn: "Follow-up Q&A and 30-Day Practice Plan", textAm: "\u12E830-\u1240\u1295 \u12E8\u120D\u121D\u121D\u12F5 \u12A5\u1245\u12F5 \u12A5\u1293 \u12E8\u12F5\u130B\u134D \u1218\u1218\u122A\u12EB" }
    ]
  },
  {
    code: "monthly_membership",
    name: "Hexacore Arcana Daily Biorhythm Club",
    nameAm: "\u12E8\u12C8\u122D\u1203\u12CA \u12E8\u1204\u12AD\u1233\u12AE\u122D \u1263\u12EE\u122A\u12DD\u121D \u12A5\u1293 \u12E8\u12F5\u121D\u1345 \u12A0\u1263\u120D\u1290\u1275",
    tagline: "Daily 30-day journal, solfeggio audio player, and private circle access",
    taglineAm: "\u12D5\u1208\u1273\u12CA \u121B\u1230\u120B\u1230\u12EB\u1363 \u12E8\u1236\u120D\u134C\u1305\u12EE \u12F5\u121D\u1345 \u121B\u132B\u12C8\u127B \u12A5\u1293 \u12E8\u1205\u1265\u1228\u1275 \u121B\u1205\u1260\u122D \u1218\u12F3\u1228\u123B",
    description: "Continuous spiritual and cultural alignment with daily reflection prompts, audio solfeggio sound baths, seasonal shifts tracking, and access to private Hexacore Circles.",
    descriptionAm: "\u1240\u1323\u12ED\u1290\u1275 \u12EB\u1208\u12CD \u12E8\u12D5\u1208\u1275 \u1270\u12D5\u1208\u1275 \u1218\u1295\u1348\u1233\u12CA \u1309\u12DE\u1363 \u12E8\u121B\u1230\u120B\u1230\u12EB \u12F5\u121D\u1346\u127D\u1363 \u12A5\u1293 \u12E8\u130D\u120D \u12E8\u1325\u1293\u1275 \u121B\u1205\u1260\u122B\u1275 \u1218\u12F3\u1228\u123B\u1362",
    priceEtb: "199.00",
    priceUsd: "4.99",
    tier: "subscription",
    badgeEn: "Monthly SaaS",
    badgeAm: "\u12C8\u122D\u1203\u12CA \u121D\u12DD\u1308\u1263",
    sortOrder: 4,
    features: [
      { textEn: "Daily 30-Day Guided Alignment Journal & Mood Tracking", textAm: "\u12D5\u1208\u1273\u12CA \u12E830-\u1240\u1295 \u121B\u1230\u120B\u1230\u12EB \u12A5\u1293 \u12E8\u1235\u121C\u1275 \u1218\u12DD\u1308\u1265", highlight: true },
      { textEn: "Streamable Solfeggio Frequencies (396Hz\u2013963Hz)", textAm: "\u12E8\u1270\u1235\u1270\u12AB\u12A8\u1209 \u12E8\u1236\u120D\u134C\u1305\u12EE \u12F5\u121D\u1346\u127D \u121B\u132B\u12C8\u127B" },
      { textEn: "Exclusive Access to Private Hexacore Community Circles", textAm: "\u12E8\u130D\u120D \u12E8\u1204\u12AD\u1233\u12AE\u122D \u121B\u1205\u1260\u122B\u1275 \u1219\u1209 \u1218\u12F3\u1228\u123B" },
      { textEn: "Automated Seasonal Transition & Planetary Biorhythm Alerts", textAm: "\u12C8\u1245\u1273\u12CA \u12E8\u12A2\u1275\u12EE\u1335\u12EB \u12E8\u12A0\u12E8\u122D\u1293 \u12E8\u1355\u120B\u1294\u1276\u127D \u121B\u1233\u12C8\u1242\u12EB" },
      { textEn: "Priority Booking Discounts on Debtera Consultations", textAm: "\u1260\u1263\u1208\u1219\u12EB \u121D\u12AD\u12AD\u122D \u120B\u12ED \u120D\u12E9 \u1245\u1293\u123D" }
    ]
  }
];

// src/lib/db/schema/caseEvaluationPipeline.ts
var pipelineProfiles = mysqlTable("pipeline_profiles", {
  id: (0, import_mysql_core.varchar)("id", { length: 120 }).primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  userIdString: (0, import_mysql_core.varchar)("user_id_string", { length: 120 }).notNull(),
  ageBand: (0, import_mysql_core.varchar)("age_band", { length: 40 }).notNull(),
  sex: (0, import_mysql_core.varchar)("sex", { length: 20 }).notNull(),
  pregnancyStatus: (0, import_mysql_core.varchar)("pregnancy_status", { length: 40 }),
  chronicConditions: jsonb("chronic_conditions").default([]).notNull(),
  currentMeds: jsonb("current_meds").default([]).notNull(),
  allergies: jsonb("allergies").default([]).notNull(),
  traditionalUse: jsonb("traditional_use").default([]).notNull(),
  diet: jsonb("diet").notNull(),
  substanceUse: jsonb("substance_use").notNull(),
  location: jsonb("location").notNull(),
  spiritualContext: (0, import_mysql_core.text)("spiritual_context"),
  culturalContext: (0, import_mysql_core.text)("cultural_context"),
  consent: jsonb("consent").default({}).notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [(0, import_mysql_core.index)("pipeline_profiles_user_idx").on(table.userIdString, table.updatedAt)]);
var pipelinePreliminaryAnalyses = mysqlTable("pipeline_preliminary_analyses", {
  id: (0, import_mysql_core.varchar)("id", { length: 120 }).primaryKey(),
  profileId: (0, import_mysql_core.varchar)("profile_id", { length: 120 }).notNull(),
  locationCtx: jsonb("location_ctx").notNull(),
  sections: jsonb("sections").notNull(),
  confidence: (0, import_mysql_core.varchar)("confidence", { length: 20 }).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull()
}, (table) => [(0, import_mysql_core.uniqueIndex)("pipeline_preliminary_analyses_profile_idx").on(table.profileId)]);
var pipelineCases = mysqlTable("pipeline_cases", {
  id: (0, import_mysql_core.varchar)("id", { length: 120 }).primaryKey(),
  userId: (0, import_mysql_core.varchar)("user_id", { length: 120 }).notNull(),
  profileId: (0, import_mysql_core.varchar)("profile_id", { length: 120 }).notNull(),
  narrative: (0, import_mysql_core.text)("narrative").notNull(),
  symptoms: jsonb("symptoms").default([]).notNull(),
  duration: (0, import_mysql_core.varchar)("duration", { length: 100 }).notNull(),
  selfTreatments: jsonb("self_treatments").default([]).notNull(),
  attachments: jsonb("attachments").default([]).notNull(),
  emergencyDetected: (0, import_mysql_core.boolean)("emergency_detected").default(false).notNull(),
  emergencySignals: jsonb("emergency_signals").default([]).notNull(),
  emergencyRoutedAt: timestamp("emergency_routed_at"),
  status: (0, import_mysql_core.varchar)("status", { length: 50 }).default("SUBMITTED").notNull(),
  assignedProfessionalId: (0, import_mysql_core.varchar)("assigned_professional_id", { length: 120 }),
  overrideJustification: (0, import_mysql_core.text)("override_justification"),
  overrideActorId: (0, import_mysql_core.varchar)("override_actor_id", { length: 120 }),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  (0, import_mysql_core.index)("pipeline_cases_user_status_idx").on(table.userId, table.status),
  (0, import_mysql_core.index)("pipeline_cases_status_idx").on(table.status, table.submittedAt),
  (0, import_mysql_core.index)("pipeline_cases_professional_idx").on(table.assignedProfessionalId)
]);
var pipelineReports = mysqlTable("pipeline_reports", {
  id: (0, import_mysql_core.varchar)("id", { length: 120 }).primaryKey(),
  caseId: (0, import_mysql_core.varchar)("case_id", { length: 120 }).notNull(),
  kind: (0, import_mysql_core.varchar)("kind", { length: 20 }).notNull(),
  // USER | PROFESSIONAL
  version: integer("version").default(1).notNull(),
  payload: jsonb("payload").notNull(),
  safetyGate: jsonb("safety_gate"),
  confidence: (0, import_mysql_core.varchar)("confidence", { length: 20 }).notNull(),
  provenance: jsonb("provenance").notNull(),
  authoredBy: (0, import_mysql_core.varchar)("authored_by", { length: 120 }),
  approvedBy: (0, import_mysql_core.varchar)("approved_by", { length: 120 }),
  approvedAt: timestamp("approved_at"),
  publishedAt: timestamp("published_at"),
  supersededBy: (0, import_mysql_core.varchar)("superseded_by", { length: 120 }),
  createdAt: timestamp("created_at").defaultNow().notNull()
}, (table) => [(0, import_mysql_core.index)("pipeline_reports_case_idx").on(table.caseId, table.kind, table.version)]);
var pipelineCaseEvents = mysqlTable("pipeline_case_events", {
  id: (0, import_mysql_core.varchar)("id", { length: 120 }).primaryKey(),
  caseId: (0, import_mysql_core.varchar)("case_id", { length: 120 }).notNull(),
  actorId: (0, import_mysql_core.varchar)("actor_id", { length: 120 }).notNull(),
  actorRole: (0, import_mysql_core.varchar)("actor_role", { length: 30 }).notNull(),
  type: (0, import_mysql_core.varchar)("type", { length: 60 }).notNull(),
  // submitted, evaluated, edited, approved, returned, published, gate_blocked, gate_overridden
  before: jsonb("before"),
  after: jsonb("after"),
  note: (0, import_mysql_core.text)("note"),
  at: timestamp("at").defaultNow().notNull(),
  seq: bigserial("seq").notNull().unique()
}, (table) => [(0, import_mysql_core.index)("pipeline_case_events_case_idx").on(table.caseId, table.seq)]);
var pipelineAssignments = mysqlTable("pipeline_assignments", {
  id: (0, import_mysql_core.varchar)("id", { length: 120 }).primaryKey(),
  caseId: (0, import_mysql_core.varchar)("case_id", { length: 120 }).notNull(),
  professionalId: (0, import_mysql_core.varchar)("professional_id", { length: 120 }).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull()
});

// src/lib/db/schema/platform.ts
var platformSettings = mysqlTable("platform_settings", {
  key: (0, import_mysql_core.varchar)("key", { length: 60 }).primaryKey(),
  value: jsonb("value").$type().notNull(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var platformPayments = mysqlTable(
  "platform_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Our reference, sent to the provider as tx_ref. */
    txRef: (0, import_mysql_core.varchar)("tx_ref", { length: 64 }).notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    /** case_report | consultation */
    purpose: (0, import_mysql_core.varchar)("purpose", { length: 30 }).notNull(),
    subjectId: uuid("subject_id").notNull(),
    description: (0, import_mysql_core.varchar)("description", { length: 200 }),
    amountEtb: numeric("amount_etb", { precision: 12, scale: 2 }).notNull(),
    /** chapa | telebirr | bank_transfer | free */
    method: (0, import_mysql_core.varchar)("method", { length: 30 }).notNull(),
    /** chapa (online checkout) | manual (proof checked by an administrator) | free */
    channel: (0, import_mysql_core.varchar)("channel", { length: 20 }).notNull(),
    /** pending → paid | failed | cancelled; manual: awaiting_review → paid | rejected */
    status: (0, import_mysql_core.varchar)("status", { length: 20 }).notNull(),
    checkoutUrl: (0, import_mysql_core.text)("checkout_url"),
    /** Provider's reference (Chapa ref id) or the payer's transaction number for manual payments. */
    providerReference: (0, import_mysql_core.varchar)("provider_reference", { length: 120 }),
    payerName: (0, import_mysql_core.varchar)("payer_name", { length: 160 }),
    payerNote: (0, import_mysql_core.text)("payer_note"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNote: (0, import_mysql_core.text)("review_note"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    raw: jsonb("raw").$type(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    (0, import_mysql_core.index)("platform_payments_subject_idx").on(table.purpose, table.subjectId),
    (0, import_mysql_core.index)("platform_payments_status_idx").on(table.status, table.createdAt),
    (0, import_mysql_core.index)("platform_payments_user_idx").on(table.userId)
  ]
);
var rateLimits = mysqlTable(
  "rate_limits",
  {
    key: (0, import_mysql_core.varchar)("key", { length: 400 }).primaryKey(),
    count: integer("count").default(0).notNull(),
    resetAt: timestamp("reset_at", { withTimezone: true }).notNull()
  },
  (table) => [(0, import_mysql_core.index)("rate_limits_reset_idx").on(table.resetAt)]
);
var scheduledTasks = mysqlTable(
  "scheduled_tasks",
  {
    name: (0, import_mysql_core.varchar)("name", { length: 80 }).primaryKey(),
    everySeconds: integer("every_seconds").notNull(),
    nextRunAt: timestamp("next_run_at").defaultNow().notNull(),
    leaseOwner: (0, import_mysql_core.varchar)("lease_owner", { length: 120 }),
    leaseUntil: timestamp("lease_until"),
    lastStartedAt: timestamp("last_started_at"),
    lastSuccessAt: timestamp("last_success_at"),
    lastErrorAt: timestamp("last_error_at"),
    lastError: (0, import_mysql_core.varchar)("last_error", { length: 1e3 }),
    consecutiveFailures: integer("consecutive_failures").default(0).notNull(),
    runCount: integer("run_count").default(0).notNull()
  },
  (table) => [(0, import_mysql_core.index)("scheduled_tasks_due_idx").on(table.nextRunAt)]
);

// src/lib/db/schema/toolkit.ts
var toolkitTools = mysqlTable("toolkit_tools", {
  key: (0, import_mysql_core.varchar)("key", { length: 80 }).primaryKey(),
  name: (0, import_mysql_core.varchar)("name", { length: 160 }).notNull(),
  description: (0, import_mysql_core.text)("description").notNull().default(""),
  /** care_pathway | evidence | practice | support | governance */
  group: (0, import_mysql_core.varchar)("group", { length: 30 }).notNull(),
  href: (0, import_mysql_core.varchar)("href", { length: 500 }).notNull(),
  /** public | practitioner | admin */
  audience: (0, import_mysql_core.varchar)("audience", { length: 20 }).notNull(),
  strands: jsonb("strands").$type().default([]).notNull(),
  suggestedFor: jsonb("suggested_for").$type().default({ categories: [], serviceKinds: [] }).notNull(),
  /** builtin: from src/server/toolkit/registry.ts · custom: added by an administrator */
  source: (0, import_mysql_core.varchar)("source", { length: 20 }).notNull(),
  /** Set once an administrator edits a built-in tool, so later syncs keep their wording. */
  customized: (0, import_mysql_core.boolean)("customized").default(false).notNull(),
  isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var knowledgeSets = mysqlTable("knowledge_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: (0, import_mysql_core.varchar)("slug", { length: 100 }).notNull().unique(),
  name: (0, import_mysql_core.varchar)("name", { length: 160 }).notNull(),
  description: (0, import_mysql_core.text)("description").notNull().default(""),
  toolKeys: jsonb("tool_keys").$type().default([]).notNull(),
  strands: jsonb("strands").$type().default([]).notNull(),
  /** Business categories (slugs) that receive this set automatically when it is published. */
  categorySlugs: jsonb("category_slugs").$type().default([]).notNull(),
  /** Admin guidance shown to healers with the set. */
  guidance: (0, import_mysql_core.text)("guidance"),
  /** draft | published | archived */
  status: (0, import_mysql_core.varchar)("status", { length: 20 }).default("draft").notNull(),
  version: integer("version").default(0).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var businessKnowledgeSets = mysqlTable(
  "business_knowledge_sets",
  {
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    setId: uuid("set_id").references(() => knowledgeSets.id, { onDelete: "cascade" }).notNull(),
    /** active | removed (removed sets are not re-added automatically) */
    status: (0, import_mysql_core.varchar)("status", { length: 20 }).default("active").notNull(),
    /** auto: added because of the business's category · manual: chosen by the business */
    origin: (0, import_mysql_core.varchar)("origin", { length: 20 }).notNull(),
    /** Last version the business has seen, to show "updated" badges. */
    seenVersion: integer("seen_version").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [(0, import_mysql_core.primaryKey)({ columns: [table.businessId, table.setId] })]
);
var businessTools = mysqlTable(
  "business_tools",
  {
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    toolKey: (0, import_mysql_core.varchar)("tool_key", { length: 80 }).references(() => toolkitTools.key, { onDelete: "cascade" }).notNull(),
    /** added | hidden (hidden tools stay out even when a set includes them) */
    state: (0, import_mysql_core.varchar)("state", { length: 20 }).default("added").notNull(),
    pinned: (0, import_mysql_core.boolean)("pinned").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [(0, import_mysql_core.primaryKey)({ columns: [table.businessId, table.toolKey] })]
);
var toolkitUsage = mysqlTable(
  "toolkit_usage",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    toolKey: (0, import_mysql_core.varchar)("tool_key", { length: 80 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [(0, import_mysql_core.index)("toolkit_usage_business_idx").on(table.businessId, table.createdAt), (0, import_mysql_core.index)("toolkit_usage_tool_idx").on(table.toolKey, table.createdAt)]
);

// src/lib/db/schema/safety.ts
var safetySubstances = mysqlTable(
  "safety_substances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: (0, import_mysql_core.varchar)("slug", { length: 100 }).notNull().unique(),
    name: (0, import_mysql_core.varchar)("name", { length: 200 }).notNull(),
    /** modern | traditional */
    kind: (0, import_mysql_core.varchar)("kind", { length: 20 }).notNull(),
    category: (0, import_mysql_core.varchar)("category", { length: 80 }).notNull(),
    scientificName: (0, import_mysql_core.varchar)("scientific_name", { length: 200 }),
    amharicName: (0, import_mysql_core.varchar)("amharic_name", { length: 200 }),
    aliases: jsonb("aliases").$type().default([]).notNull(),
    properties: jsonb("properties").$type().default([]).notNull(),
    cautions: jsonb("cautions").$type().default({}).notNull(),
    notes: (0, import_mysql_core.text)("notes"),
    evidence: (0, import_mysql_core.varchar)("evidence", { length: 120 }),
    /** published | draft | archived */
    status: (0, import_mysql_core.varchar)("status", { length: 20 }).default("published").notNull(),
    /** seed | custom */
    origin: (0, import_mysql_core.varchar)("origin", { length: 20 }).notNull(),
    customized: (0, import_mysql_core.boolean)("customized").default(false).notNull(),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [(0, import_mysql_core.index)("safety_substances_kind_idx").on(table.kind, table.category)]
);
var safetyInteractions = mysqlTable(
  "safety_interactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Slugs stored in alphabetical order so each pair exists once. */
    substanceA: (0, import_mysql_core.varchar)("substance_a", { length: 100 }).references(() => safetySubstances.slug, { onDelete: "cascade", onUpdate: "cascade" }).notNull(),
    substanceB: (0, import_mysql_core.varchar)("substance_b", { length: 100 }).references(() => safetySubstances.slug, { onDelete: "cascade", onUpdate: "cascade" }).notNull(),
    severity: (0, import_mysql_core.varchar)("severity", { length: 20 }).notNull(),
    mechanism: (0, import_mysql_core.text)("mechanism").notNull(),
    effect: (0, import_mysql_core.text)("effect").notNull(),
    management: (0, import_mysql_core.text)("management").notNull(),
    evidence: (0, import_mysql_core.varchar)("evidence", { length: 120 }).notNull(),
    source: (0, import_mysql_core.varchar)("source", { length: 300 }).notNull(),
    status: (0, import_mysql_core.varchar)("status", { length: 20 }).default("published").notNull(),
    origin: (0, import_mysql_core.varchar)("origin", { length: 20 }).notNull(),
    customized: (0, import_mysql_core.boolean)("customized").default(false).notNull(),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [(0, import_mysql_core.uniqueIndex)("safety_interactions_pair_unique").on(table.substanceA, table.substanceB)]
);

// src/lib/db/schema/intake.ts
var DROPDOWN_TYPES = ["none", "custom", "metsehafe_fewus", "metsehafe_asmat", "awde_negest"];
var serviceIntakeSettings = mysqlTable("service_intake_settings", {
  serviceId: uuid("service_id").primaryKey().references(() => services.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
  allowText: (0, import_mysql_core.boolean)("allow_text").default(true).notNull(),
  allowImage: (0, import_mysql_core.boolean)("allow_image").default(true).notNull(),
  allowAudio: (0, import_mysql_core.boolean)("allow_audio").default(true).notNull(),
  allowVideo: (0, import_mysql_core.boolean)("allow_video").default(false).notNull(),
  /** none | custom | metsehafe_fewus | metsehafe_asmat | awde_negest */
  dropdownType: (0, import_mysql_core.varchar)("dropdown_type", { length: 30 }).default("none").notNull(),
  dropdownLabel: (0, import_mysql_core.varchar)("dropdown_label", { length: 160 }),
  customDropdownOptions: jsonb("custom_dropdown_options").$type().default([]).notNull(),
  /** Prompt shown above the text box. */
  textPrompt: (0, import_mysql_core.varchar)("text_prompt", { length: 300 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
var intakeAttachments = mysqlTable(
  "intake_attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    /** Null until the booking that uses it is created. */
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "cascade" }),
    uploaderId: uuid("uploader_id").references(() => users.id, { onDelete: "set null" }),
    /** image | audio | video */
    kind: (0, import_mysql_core.varchar)("kind", { length: 10 }).notNull(),
    mimeType: (0, import_mysql_core.varchar)("mime_type", { length: 100 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    storageKey: (0, import_mysql_core.varchar)("storage_key", { length: 200 }).notNull(),
    originalName: (0, import_mysql_core.varchar)("original_name", { length: 200 }),
    sha256: (0, import_mysql_core.varchar)("sha256", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [(0, import_mysql_core.index)("intake_attachments_booking_idx").on(table.bookingId), (0, import_mysql_core.index)("intake_attachments_uploader_idx").on(table.uploaderId, table.createdAt)]
);
var autoResponseRules = mysqlTable(
  "auto_response_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    /** Null: applies to every service of the business. */
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "cascade" }),
    name: (0, import_mysql_core.varchar)("name", { length: 160 }).notNull(),
    isActive: (0, import_mysql_core.boolean)("is_active").default(true).notNull(),
    triggerCriteria: jsonb("trigger_criteria").$type().default({}).notNull(),
    /** instant_auto_send | draft_for_review */
    responseMode: (0, import_mysql_core.varchar)("response_mode", { length: 30 }).notNull(),
    templateTitle: (0, import_mysql_core.varchar)("template_title", { length: 200 }).notNull(),
    templateBody: (0, import_mysql_core.text)("template_body").notNull(),
    attachedRemedies: jsonb("attached_remedies").$type().default([]).notNull(),
    /** Include the business's manuscript text (Fewus or Asmat) for the selected heading in the response. */
    includeFewusText: (0, import_mysql_core.boolean)("include_fewus_text").default(false).notNull(),
    /** Include the Ge'ez name reckoning / Awde Negest profile in the response. */
    includeProfile: (0, import_mysql_core.boolean)("include_profile").default(false).notNull(),
    priority: integer("priority").default(100).notNull(),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [(0, import_mysql_core.index)("auto_response_rules_business_idx").on(table.businessId, table.isActive)]
);
var responseDrafts = mysqlTable(
  "response_drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "cascade" }).notNull(),
    ruleId: uuid("rule_id").references(() => autoResponseRules.id, { onDelete: "set null" }),
    /** rule | manual | system */
    source: (0, import_mysql_core.varchar)("source", { length: 20 }).notNull(),
    title: (0, import_mysql_core.varchar)("title", { length: 200 }).notNull(),
    body: (0, import_mysql_core.text)("body").notNull(),
    remedies: jsonb("remedies").$type().default([]).notNull(),
    /** draft | sent | dismissed */
    status: (0, import_mysql_core.varchar)("status", { length: 20 }).default("draft").notNull(),
    /** Why a rule's instant send was held for review (urgency, remedies). */
    heldReason: (0, import_mysql_core.text)("held_reason"),
    messageId: uuid("message_id").references(() => messages.id, { onDelete: "set null" }),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    sentBy: uuid("sent_by").references(() => users.id, { onDelete: "set null" }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [(0, import_mysql_core.index)("response_drafts_booking_idx").on(table.bookingId, table.status)]
);
var fewusTexts = mysqlTable(
  "fewus_texts",
  {
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
    headingKey: (0, import_mysql_core.varchar)("heading_key", { length: 60 }).notNull(),
    geezText: (0, import_mysql_core.text)("geez_text"),
    amharicText: (0, import_mysql_core.text)("amharic_text"),
    guidance: (0, import_mysql_core.text)("guidance"),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [(0, import_mysql_core.primaryKey)({ columns: [table.businessId, table.headingKey] })]
);

// src/lib/db/schema/followUps.ts
var followUps = mysqlTable(
  "follow_ups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    caseId: uuid("case_id").references(() => workflowCases.id, { onDelete: "cascade" }),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "cascade" }),
    domain: (0, import_mysql_core.varchar)("domain", { length: 40 }),
    label: (0, import_mysql_core.varchar)("label", { length: 160 }).notNull(),
    dayOffset: integer("day_offset").notNull(),
    dueAt: timestamp("due_at").notNull(),
    sentAt: timestamp("sent_at"),
    answeredAt: timestamp("answered_at"),
    answeredVia: (0, import_mysql_core.varchar)("answered_via", { length: 20 }),
    helped: (0, import_mysql_core.varchar)("helped", { length: 10 }),
    sideEffects: (0, import_mysql_core.varchar)("side_effects", { length: 1e3 }),
    comment: (0, import_mysql_core.varchar)("comment", { length: 1e3 }),
    needsAttention: (0, import_mysql_core.boolean)("needs_attention").default(false).notNull(),
    reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "set null" }),
    businessId: uuid("business_id").references(() => businesses.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => [
    (0, import_mysql_core.uniqueIndex)("follow_ups_case_day_uq").on(table.caseId, table.dayOffset),
    (0, import_mysql_core.uniqueIndex)("follow_ups_booking_day_uq").on(table.bookingId, table.dayOffset),
    (0, import_mysql_core.index)("follow_ups_due_idx").on(table.sentAt, table.dueAt),
    (0, import_mysql_core.index)("follow_ups_user_idx").on(table.userId, table.sentAt),
    (0, import_mysql_core.index)("follow_ups_reviewer_idx").on(table.reviewerId),
    (0, import_mysql_core.index)("follow_ups_business_idx").on(table.businessId)
  ]
);

// src/lib/db/index.ts
var connectionString = process.env.DATABASE_URL || "mysql://root:devroot@localhost:3307/ethio_wellness";
var globalForDb = globalThis;
function createPool() {
  const pool2 = import_promise.default.createPool({
    uri: connectionString,
    connectionLimit: Number(process.env.DB_POOL_MAX) || 10,
    waitForConnections: true,
    maxIdle: 5,
    idleTimeout: 3e4,
    connectTimeout: 1e4,
    enableKeepAlive: true,
    charset: "utf8mb4",
    timezone: "Z",
    // Exact DECIMAL and BIGINT values arrive as strings instead of rounded floats.
    decimalNumbers: false,
    supportBigNumbers: true
  });
  pool2.pool.on("connection", (connection) => {
    connection.query("SET time_zone = '+00:00'");
    connection.query("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED");
  });
  return pool2;
}
var pool = globalForDb.mysqlPool ?? createPool();
globalForDb.mysqlPool = pool;
var db = (0, import_mysql2.drizzle)(pool, { schema: schema_exports, mode: "default" });
async function run(strings, ...values) {
  const [rows] = await pool.query(strings.join("?"), values);
  return rows;
}
var dbClient = Object.assign(run, {
  /** Closes the pool (scripts and tests; the server keeps it open). */
  end: (_options) => pool.end()
});

// src/lib/pipeline/store.ts
var import_drizzle_orm2 = require("drizzle-orm");

// src/lib/security/encryption.ts
var import_crypto = __toESM(require("crypto"));
var DEVELOPMENT_KEY = "ethio-wellness-enterprise-aes256-key-32b!";
function encryptionKey() {
  const configured = process.env.DATA_ENCRYPTION_KEY;
  if (configured)
    return configured;
  if (process.env.NODE_ENV === "production")
    throw new Error("DATA_ENCRYPTION_KEY must be configured in production.");
  return DEVELOPMENT_KEY;
}
var ALGORITHM = "aes-256-gcm";
var IV_LENGTH = 16;
function encryptRestrictedField(data) {
  const jsonStr = JSON.stringify(data);
  const iv = import_crypto.default.randomBytes(IV_LENGTH);
  const key = import_crypto.default.createHash("sha256").update(encryptionKey()).digest();
  const cipher = import_crypto.default.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(jsonStr, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    ciphertext: encrypted,
    classification: "Restricted",
    encryptedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function decryptRestrictedField(payload) {
  if (!payload || !payload.ciphertext || !payload.iv || !payload.tag) {
    return payload;
  }
  try {
    const key = import_crypto.default.createHash("sha256").update(encryptionKey()).digest();
    const iv = Buffer.from(payload.iv, "hex");
    const tag = Buffer.from(payload.tag, "hex");
    const decipher = import_crypto.default.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(payload.ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (err) {
    console.error("Failed to decrypt restricted field:", err);
    return payload;
  }
}

// src/lib/pipeline/store.ts
var iso = (value) => value instanceof Date ? value.toISOString() : new Date(value).toISOString();
var isoOrUndefined = (value) => value === null ? void 0 : iso(value);
var dateOrNull = (value) => value ? new Date(value) : null;
var orUndefined = (value) => value === null ? void 0 : value;
var compact = (record) => Object.fromEntries(Object.entries(record).filter(([, value]) => value !== void 0));
function sealList(value) {
  return encryptRestrictedField(value);
}
function openList(value, field) {
  const opened = decryptRestrictedField(value);
  if (!Array.isArray(opened))
    throw new Error(`Pipeline profile field ${field} could not be decrypted.`);
  return opened;
}
function toProfileRow(profile, accountId) {
  return {
    id: profile.id,
    userId: accountId,
    userIdString: profile.userId,
    ageBand: profile.ageBand,
    sex: profile.sex,
    pregnancyStatus: profile.pregnancyStatus ?? null,
    chronicConditions: sealList(profile.chronicConditions),
    currentMeds: sealList(profile.currentMeds),
    allergies: sealList(profile.allergies),
    traditionalUse: profile.traditionalUse,
    diet: profile.diet,
    substanceUse: profile.substanceUse,
    location: profile.location,
    spiritualContext: profile.spiritualContext ?? null,
    culturalContext: profile.culturalContext ?? null,
    consent: profile.consent,
    submittedAt: new Date(profile.submittedAt),
    updatedAt: new Date(profile.updatedAt)
  };
}
function fromProfileRow(row) {
  return compact({
    id: row.id,
    userId: row.userIdString,
    ageBand: row.ageBand,
    sex: row.sex,
    pregnancyStatus: orUndefined(row.pregnancyStatus),
    chronicConditions: openList(row.chronicConditions, "chronicConditions"),
    currentMeds: openList(row.currentMeds, "currentMeds"),
    allergies: openList(row.allergies, "allergies"),
    traditionalUse: row.traditionalUse ?? [],
    diet: row.diet ?? {},
    substanceUse: row.substanceUse ?? {},
    location: row.location,
    spiritualContext: orUndefined(row.spiritualContext),
    culturalContext: orUndefined(row.culturalContext),
    consent: row.consent,
    submittedAt: iso(row.submittedAt),
    updatedAt: iso(row.updatedAt)
  });
}
function toAnalysisRow(profileId, analysis) {
  const { profileId: _profileId, locationSummary, confidence, generatedAt, ...sections } = analysis;
  return {
    id: profileId,
    profileId,
    locationCtx: locationSummary,
    sections,
    confidence,
    generatedAt: new Date(generatedAt)
  };
}
function fromAnalysisRow(row) {
  const sections = row.sections;
  return {
    ...sections,
    profileId: row.profileId,
    locationSummary: row.locationCtx,
    confidence: row.confidence,
    generatedAt: iso(row.generatedAt)
  };
}
function toCaseRow(record) {
  return {
    id: record.id,
    userId: record.userId,
    profileId: record.profileId,
    narrative: record.narrative,
    symptoms: record.symptoms,
    duration: record.duration,
    selfTreatments: record.selfTreatments,
    attachments: record.attachments,
    emergencyDetected: record.emergencyDetected ?? false,
    emergencySignals: record.emergencySignals ?? [],
    emergencyRoutedAt: dateOrNull(record.emergencyRoutedAt),
    status: record.status,
    assignedProfessionalId: record.assignedProfessionalId ?? null,
    overrideJustification: record.overrideJustification ?? null,
    overrideActorId: record.overrideActorId ?? null,
    submittedAt: new Date(record.submittedAt),
    updatedAt: new Date(record.updatedAt)
  };
}
function fromCaseRow(row) {
  return compact({
    id: row.id,
    userId: row.userId,
    profileId: row.profileId,
    narrative: row.narrative,
    symptoms: row.symptoms ?? [],
    duration: row.duration,
    selfTreatments: row.selfTreatments ?? [],
    attachments: row.attachments ?? [],
    emergencyDetected: row.emergencyDetected,
    emergencySignals: row.emergencySignals ?? [],
    emergencyRoutedAt: isoOrUndefined(row.emergencyRoutedAt),
    status: row.status,
    assignedProfessionalId: orUndefined(row.assignedProfessionalId),
    overrideJustification: orUndefined(row.overrideJustification),
    overrideActorId: orUndefined(row.overrideActorId),
    submittedAt: iso(row.submittedAt),
    updatedAt: iso(row.updatedAt)
  });
}
function toReportRow(report) {
  return {
    id: report.id,
    caseId: report.caseId,
    kind: report.kind,
    version: report.version,
    payload: report.payload,
    safetyGate: report.safetyGate ?? null,
    confidence: report.confidence,
    provenance: report.provenance,
    authoredBy: report.authoredBy ?? null,
    approvedBy: report.approvedBy ?? null,
    approvedAt: dateOrNull(report.approvedAt),
    publishedAt: dateOrNull(report.publishedAt),
    supersededBy: report.supersededBy ?? null,
    createdAt: new Date(report.createdAt)
  };
}
function fromReportRow(row) {
  return compact({
    id: row.id,
    caseId: row.caseId,
    kind: row.kind,
    version: row.version,
    payload: row.payload,
    safetyGate: orUndefined(row.safetyGate),
    confidence: row.confidence,
    provenance: row.provenance ?? [],
    authoredBy: orUndefined(row.authoredBy),
    approvedBy: orUndefined(row.approvedBy),
    approvedAt: isoOrUndefined(row.approvedAt),
    publishedAt: isoOrUndefined(row.publishedAt),
    supersededBy: orUndefined(row.supersededBy),
    createdAt: iso(row.createdAt)
  });
}
function fromEventRow(row) {
  return {
    id: row.id,
    caseId: row.caseId,
    actorId: row.actorId,
    actorRole: row.actorRole,
    type: row.type,
    before: row.before ?? null,
    after: row.after ?? null,
    note: row.note,
    at: iso(row.at)
  };
}
async function accountIdFor(userId) {
  if (userId.length > 36)
    return null;
  const [row] = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm2.eq)(users.id, userId)).limit(1);
  return row?.id ?? null;
}
var dbPipelineStore = {
  async saveProfile(profile) {
    const { id, ...changes } = toProfileRow(profile, await accountIdFor(profile.userId));
    await db.insert(pipelineProfiles).values({ id, ...changes }).onDuplicateKeyUpdate({ set: changes });
  },
  async getProfile(id) {
    const [row] = await db.select().from(pipelineProfiles).where((0, import_drizzle_orm2.eq)(pipelineProfiles.id, id)).limit(1);
    return row ? fromProfileRow(row) : null;
  },
  async getLatestProfileForUser(userId) {
    const [row] = await db.select().from(pipelineProfiles).where((0, import_drizzle_orm2.eq)(pipelineProfiles.userIdString, userId)).orderBy((0, import_drizzle_orm2.desc)(pipelineProfiles.updatedAt), (0, import_drizzle_orm2.desc)(pipelineProfiles.submittedAt)).limit(1);
    return row ? fromProfileRow(row) : null;
  },
  async saveAnalysis(profileId, analysis) {
    const { id, ...changes } = toAnalysisRow(profileId, analysis);
    await db.insert(pipelinePreliminaryAnalyses).values({ id, ...changes }).onDuplicateKeyUpdate({ set: changes });
  },
  async getAnalysis(profileId) {
    const [row] = await db.select().from(pipelinePreliminaryAnalyses).where((0, import_drizzle_orm2.eq)(pipelinePreliminaryAnalyses.profileId, profileId)).limit(1);
    return row ? fromAnalysisRow(row) : null;
  },
  async saveCase(record) {
    const { id, ...changes } = toCaseRow(record);
    await db.insert(pipelineCases).values({ id, ...changes }).onDuplicateKeyUpdate({ set: changes });
  },
  async getCase(id) {
    const [row] = await db.select().from(pipelineCases).where((0, import_drizzle_orm2.eq)(pipelineCases.id, id)).limit(1);
    return row ? fromCaseRow(row) : null;
  },
  async listCases(filter = {}) {
    const conditions = [];
    if (filter.userId)
      conditions.push((0, import_drizzle_orm2.eq)(pipelineCases.userId, filter.userId));
    if (filter.status)
      conditions.push((0, import_drizzle_orm2.eq)(pipelineCases.status, filter.status));
    if (filter.professionalId) {
      conditions.push((0, import_drizzle_orm2.or)((0, import_drizzle_orm2.eq)(pipelineCases.assignedProfessionalId, filter.professionalId), (0, import_drizzle_orm2.isNull)(pipelineCases.assignedProfessionalId)));
    }
    const rows = await db.select().from(pipelineCases).where(conditions.length ? (0, import_drizzle_orm2.and)(...conditions) : void 0).orderBy((0, import_drizzle_orm2.desc)(pipelineCases.submittedAt));
    return rows.map(fromCaseRow);
  },
  async saveReport(report) {
    const { id, ...changes } = toReportRow(report);
    await db.insert(pipelineReports).values({ id, ...changes }).onDuplicateKeyUpdate({ set: changes });
  },
  async listReports(caseId) {
    const rows = await db.select().from(pipelineReports).where((0, import_drizzle_orm2.eq)(pipelineReports.caseId, caseId)).orderBy((0, import_drizzle_orm2.desc)(pipelineReports.version));
    return rows.map(fromReportRow);
  },
  async insertEvent(event) {
    await db.insert(pipelineCaseEvents).values({
      id: event.id,
      caseId: event.caseId,
      actorId: event.actorId,
      actorRole: event.actorRole,
      type: event.type,
      before: event.before ?? null,
      after: event.after ?? null,
      note: event.note ?? null,
      at: new Date(event.at)
    });
  },
  async listEvents(caseId) {
    const rows = await db.select().from(pipelineCaseEvents).where((0, import_drizzle_orm2.eq)(pipelineCaseEvents.caseId, caseId)).orderBy((0, import_drizzle_orm2.asc)(pipelineCaseEvents.seq));
    return rows.map(fromEventRow);
  }
};

// src/lib/pipeline/importCache.ts
var import_node_fs2 = __toESM(require("node:fs"));
var import_node_path2 = __toESM(require("node:path"));
var list = (value) => Array.isArray(value) ? value : [];
function normaliseProfile(record) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    ...record,
    chronicConditions: list(record.chronicConditions),
    currentMeds: list(record.currentMeds),
    allergies: list(record.allergies),
    traditionalUse: list(record.traditionalUse),
    diet: record.diet ?? {},
    substanceUse: record.substanceUse ?? {},
    consent: record.consent ?? { spiritualAnalysisOptIn: false, dataUseAcknowledged: false, requiresProfessionalApprovalAcknowledged: false },
    submittedAt: record.submittedAt ?? record.updatedAt ?? now,
    updatedAt: record.updatedAt ?? record.submittedAt ?? now
  };
}
function normaliseCase(record) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    ...record,
    symptoms: list(record.symptoms),
    selfTreatments: list(record.selfTreatments),
    attachments: list(record.attachments),
    submittedAt: record.submittedAt ?? record.updatedAt ?? now,
    updatedAt: record.updatedAt ?? record.submittedAt ?? now
  };
}
function jsonFiles(dir) {
  if (!import_node_fs2.default.existsSync(dir))
    return [];
  return import_node_fs2.default.readdirSync(dir).filter((name) => name.endsWith(".json")).sort().map((name) => import_node_path2.default.join(dir, name));
}
async function importPipelineCache(options) {
  const { cacheDir, store, dryRun = false, log = console.log } = options;
  const counts = () => ({ imported: 0, skipped: 0, failed: 0 });
  const summary = { profiles: counts(), analyses: counts(), cases: counts(), reports: counts(), events: counts() };
  async function each(kind, files, exists, save) {
    for (const file of files) {
      try {
        const record = JSON.parse(import_node_fs2.default.readFileSync(file, "utf8"));
        if (await exists(record, file)) {
          summary[kind].skipped++;
          continue;
        }
        if (!dryRun)
          await save(record, file);
        summary[kind].imported++;
      } catch (error) {
        summary[kind].failed++;
        log(`could not import ${import_node_path2.default.relative(cacheDir, file)}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
  const pipelineDir = import_node_path2.default.join(cacheDir, "pipeline");
  await each(
    "profiles",
    jsonFiles(import_node_path2.default.join(pipelineDir, "profiles")),
    async (record) => Boolean(await store.getProfile(record.id)),
    (record) => store.saveProfile(normaliseProfile(record))
  );
  const profileIdOf = (file) => import_node_path2.default.basename(file, ".json");
  await each(
    "analyses",
    jsonFiles(import_node_path2.default.join(pipelineDir, "analyses")),
    async (_record, file) => Boolean(await store.getAnalysis(profileIdOf(file))),
    (record, file) => store.saveAnalysis(profileIdOf(file), record)
  );
  await each(
    "cases",
    jsonFiles(import_node_path2.default.join(pipelineDir, "cases")),
    async (record) => Boolean(await store.getCase(record.id)),
    (record) => store.saveCase(normaliseCase(record))
  );
  await each(
    "reports",
    jsonFiles(import_node_path2.default.join(pipelineDir, "reports")),
    async (record) => (await store.listReports(record.caseId)).some((report) => report.id === record.id),
    (record) => store.saveReport({ ...record, provenance: list(record.provenance) })
  );
  const eventsDir = import_node_path2.default.join(cacheDir, "events");
  const eventFiles = import_node_fs2.default.existsSync(eventsDir) ? import_node_fs2.default.readdirSync(eventsDir).filter((name) => name.endsWith(".jsonl")).sort() : [];
  for (const name of eventFiles) {
    const lines = import_node_fs2.default.readFileSync(import_node_path2.default.join(eventsDir, name), "utf8").split(/\r?\n/).filter((line) => line.trim());
    const known = /* @__PURE__ */ new Set();
    let loaded = false;
    for (const [index2, line] of lines.entries()) {
      try {
        const event = JSON.parse(line);
        if (!loaded) {
          for (const existing of await store.listEvents(event.caseId))
            known.add(existing.id);
          loaded = true;
        }
        if (known.has(event.id)) {
          summary.events.skipped++;
          continue;
        }
        if (!dryRun)
          await store.insertEvent({ ...event, before: event.before ?? null, after: event.after ?? null, note: event.note ?? null });
        known.add(event.id);
        summary.events.imported++;
      } catch (error) {
        summary.events.failed++;
        log(`could not import events/${name} line ${index2 + 1}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
  return summary;
}

// scripts/import-pipeline-cache.mjs
function option(name) {
  const index2 = process.argv.indexOf(name);
  return index2 >= 0 ? process.argv[index2 + 1] : void 0;
}
async function main() {
  const cacheDir = import_node_path3.default.resolve(option("--dir") ?? import_node_path3.default.join(process.cwd(), ".cases_cache"));
  const dryRun = process.argv.includes("--dry-run");
  console.log(`${dryRun ? "Checking" : "Importing"} ${cacheDir}`);
  const summary = await importPipelineCache({ cacheDir, store: dbPipelineStore, dryRun });
  let failed = 0;
  for (const [kind, counts] of Object.entries(summary)) {
    console.log(`${kind}: ${counts.imported} ${dryRun ? "to import" : "imported"}, ${counts.skipped} already present, ${counts.failed} failed`);
    failed += counts.failed;
  }
  if (failed) {
    console.error(`${failed} record(s) could not be imported; see the messages above. Fix them and run the import again.`);
    process.exitCode = 1;
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(() => dbClient.end({ timeout: 2 }));
