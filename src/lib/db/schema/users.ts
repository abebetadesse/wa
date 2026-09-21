import { pgTable, uuid, varchar, timestamp, jsonb, date, integer, boolean, text } from "../mysqlSchema";

/**
 * Enterprise Roles table defining granular RBAC privileges.
 */
export const roles = pgTable("roles", {
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
export const users = pgTable("users", {
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
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en").notNull(), // 'am' | 'om' | 'en' | 'ti' | 'so'
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  isVerified: boolean("is_verified").default(false).notNull(),
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

export const profileFieldDefinitions = pgTable("profile_field_definitions", {
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

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Active Session management table for tracking devices, IP addresses, and JWT refresh tokens.
 */
export const authSessions = pgTable("auth_sessions", {
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
export const emailVerifications = pgTable("email_verifications", {
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
export const passwordResets = pgTable("password_resets", {
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
export const userActivities = pgTable("user_activities", {
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
export const loginHistory = pgTable("login_history", {
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

export const healthProfiles = pgTable("health_profiles", {
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

// Domain B — Firewalled table. Structurally separated from clinical health fields.
// No foreign keys into clinical intake, gap causes, or solutions.
// CI linting and architectural boundaries prevent this from entering evaluation queries.
export const culturalProfiles = pgTable("cultural_profiles", {
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
