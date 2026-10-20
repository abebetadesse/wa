process.env.NODE_ENV = process.env.NODE_ENV || "production";
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
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

// src/lib/db/mysqlSchema.ts
function tablePrefix() {
  const prefix = (process.env.DB_TABLE_PREFIX ?? "").trim();
  if (!prefix)
    return "";
  if (!/^[a-z][a-z0-9]{0,10}_$/.test(prefix)) {
    throw new Error(`DB_TABLE_PREFIX "${prefix}" is not valid. Use 1\u201311 lowercase letters or digits followed by one underscore, for example wa_.`);
  }
  return prefix;
}
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
function jsonb(name) {
  return json(name);
}
function date(name) {
  return (0, import_mysql_core.date)(name, { mode: "string" });
}
function bigserial(name, _options) {
  return (0, import_mysql_core.bigint)(name, { mode: "number", unsigned: true }).autoincrement();
}
var import_drizzle_orm, import_mysql_core, mysqlTable, newId, json, integer, numeric, real;
var init_mysqlSchema = __esm({
  "src/lib/db/mysqlSchema.ts"() {
    "use strict";
    import_drizzle_orm = require("drizzle-orm");
    import_mysql_core = require("drizzle-orm/mysql-core");
    mysqlTable = (0, import_mysql_core.mysqlTableCreator)((name) => `${tablePrefix()}${name}`);
    newId = () => globalThis.crypto.randomUUID();
    json = (0, import_mysql_core.customType)({
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
    integer = import_mysql_core.int;
    numeric = import_mysql_core.decimal;
    real = import_mysql_core.float;
  }
});

// src/lib/db/schema/users.ts
var roles, users, profileFieldDefinitions, userProfiles, authSessions, emailVerifications, passwordResets, userActivities, loginHistory, wellbeingProfiles, culturalProfiles, bioNarrativeReports, caseSummaryCards, publishingCriteria, PUBLISHING_FLOORS;
var init_users = __esm({
  "src/lib/db/schema/users.ts"() {
    "use strict";
    init_mysqlSchema();
    roles = mysqlTable("roles", {
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
    users = mysqlTable("users", {
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
    profileFieldDefinitions = mysqlTable("profile_field_definitions", {
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
    userProfiles = mysqlTable("user_profiles", {
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
    authSessions = mysqlTable("auth_sessions", {
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
    emailVerifications = mysqlTable("email_verifications", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      token: (0, import_mysql_core.varchar)("token", { length: 255 }).notNull(),
      otpCode: (0, import_mysql_core.varchar)("otp_code", { length: 10 }),
      expiresAt: timestamp("expires_at").notNull(),
      verifiedAt: timestamp("verified_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    passwordResets = mysqlTable("password_resets", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      token: (0, import_mysql_core.varchar)("token", { length: 255 }).notNull(),
      expiresAt: timestamp("expires_at").notNull(),
      usedAt: timestamp("used_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    userActivities = mysqlTable("user_activities", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      activityType: (0, import_mysql_core.varchar)("activity_type", { length: 50 }).notNull(),
      // 'login', 'case_created', 'report_saved', etc.
      description: (0, import_mysql_core.text)("description").notNull(),
      metadata: jsonb("metadata").$type().default({}),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    loginHistory = mysqlTable("login_history", {
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
    wellbeingProfiles = mysqlTable("wellbeing_profiles", {
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
    culturalProfiles = mysqlTable("cultural_profiles", {
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
    bioNarrativeReports = mysqlTable("bio_narrative_reports", {
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
    caseSummaryCards = mysqlTable("case_summary_cards", {
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
    publishingCriteria = mysqlTable("publishing_criteria", {
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
    PUBLISHING_FLOORS = {
      healthContentRequiresReview: true,
      domainsRequiringReview: ["wellbeing", "spiritual", "relationships"],
      urgentCaseRequiresAdmin: true
    };
  }
});

// src/lib/db/schema/nutrition.ts
var foods, nutrients, foodNutrients;
var init_nutrition = __esm({
  "src/lib/db/schema/nutrition.ts"() {
    "use strict";
    init_mysqlSchema();
    foods = mysqlTable("foods", {
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
    nutrients = mysqlTable("nutrients", {
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
    foodNutrients = mysqlTable(
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
  }
});

// src/lib/db/schema/herbs.ts
var herbs, compounds, herbDrugInteractions;
var init_herbs = __esm({
  "src/lib/db/schema/herbs.ts"() {
    "use strict";
    init_mysqlSchema();
    herbs = mysqlTable("herbs", {
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
    compounds = mysqlTable("compounds", {
      id: uuid("id").primaryKey().defaultRandom(),
      herbId: uuid("herb_id").references(() => herbs.id, { onDelete: "cascade" }).notNull(),
      compoundName: (0, import_mysql_core.varchar)("compound_name", { length: 255 }).notNull(),
      // e.g. "Rutin", "Kosotoxin", "Rosmarinic acid", "Coumarins"
      chemicalClass: (0, import_mysql_core.varchar)("chemical_class", { length: 100 }),
      // "Flavonoid", "Alkaloid", "Phloroglucinol derivative"
      mechanismOfAction: (0, import_mysql_core.text)("mechanism_of_action")
      // CYP450 inhibition, platelet aggregation inhibition, etc.
    });
    herbDrugInteractions = mysqlTable("herb_drug_interactions", {
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
  }
});

// src/lib/db/schema/gapAnalysis.ts
var intakeSubmissions, wellbeingGapReports, identifiedGaps, gapCauses, gapSolutions, auditLog;
var init_gapAnalysis = __esm({
  "src/lib/db/schema/gapAnalysis.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    init_nutrition();
    init_herbs();
    intakeSubmissions = mysqlTable("intake_submissions", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: uuid("user_id").references(() => users.id).notNull(),
      payload: jsonb("payload").notNull(),
      // Canonical normalized profile snapshot & diet log
      status: (0, import_mysql_core.varchar)("status", { length: 20 }).default("pending").notNull(),
      // "pending" | "processing" | "complete" | "failed"
      submittedAt: timestamp("submitted_at").defaultNow().notNull(),
      errorMessage: (0, import_mysql_core.text)("error_message")
    });
    wellbeingGapReports = mysqlTable("wellbeing_gap_reports", {
      id: uuid("id").primaryKey().defaultRandom(),
      submissionId: uuid("submission_id").references(() => intakeSubmissions.id, { onDelete: "cascade" }).notNull(),
      userId: uuid("user_id").references(() => users.id).notNull(),
      generatedAt: timestamp("generated_at").defaultNow().notNull(),
      modelVersion: (0, import_mysql_core.varchar)("model_version", { length: 50 }).notNull(),
      // "eval-v3.0.0-deterministic+claude-3-5"
      summaryNarrative: (0, import_mysql_core.text)("summary_narrative"),
      safetyGateVerified: (0, import_mysql_core.boolean)("safety_gate_verified").default(true).notNull()
    });
    identifiedGaps = mysqlTable("identified_gaps", {
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
    gapCauses = mysqlTable("gap_causes", {
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
    gapSolutions = mysqlTable("gap_solutions", {
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
    auditLog = mysqlTable("audit_log", {
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
  }
});

// src/lib/db/schema/emergency.ts
var emergencyProfiles, emergencyAlerts;
var init_emergency = __esm({
  "src/lib/db/schema/emergency.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    emergencyProfiles = mysqlTable("emergency_profiles", {
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
    emergencyAlerts = mysqlTable("emergency_alerts", {
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
  }
});

// src/lib/db/schema/diagnostic.ts
var diagnosticSessions;
var init_diagnostic = __esm({
  "src/lib/db/schema/diagnostic.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    diagnosticSessions = mysqlTable("diagnostic_sessions", {
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
  }
});

// src/lib/db/schema/caseWorkflow.ts
var caseCategories, caseQuestions, caseSessions, caseCauses, caseSolutions, workflowCases, workflowCaseMedia, chatIntakes, caseAssistantTurns;
var init_caseWorkflow = __esm({
  "src/lib/db/schema/caseWorkflow.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    caseCategories = mysqlTable("case_categories", {
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
    caseQuestions = mysqlTable("case_questions", {
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
    caseSessions = mysqlTable("case_sessions", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
      caseId: (0, import_mysql_core.varchar)("case_id", { length: 120 }).notNull(),
      answers: jsonb("answers").default({}).notNull(),
      activeSpecializedPath: (0, import_mysql_core.varchar)("active_specialized_path", { length: 120 }),
      currentStep: (0, import_mysql_core.varchar)("current_step", { length: 30 }).default("common").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      lastUpdated: timestamp("last_updated").defaultNow().notNull()
    });
    caseCauses = mysqlTable("case_causes", {
      id: uuid("id").primaryKey().defaultRandom(),
      sessionId: uuid("session_id").references(() => caseSessions.id, { onDelete: "cascade" }).notNull(),
      description: (0, import_mysql_core.text)("description").notNull(),
      confidence: integer("confidence").notNull(),
      evidence: jsonb("evidence").default([]).notNull(),
      category: (0, import_mysql_core.varchar)("category", { length: 40 }).notNull(),
      isSelected: (0, import_mysql_core.boolean)("is_selected").default(true).notNull()
    });
    caseSolutions = mysqlTable("case_solutions", {
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
    workflowCases = mysqlTable("workflow_cases", {
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
    workflowCaseMedia = mysqlTable("workflow_case_media", {
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
    chatIntakes = mysqlTable("chat_intakes", {
      userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).primaryKey(),
      state: jsonb("state").notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    caseAssistantTurns = mysqlTable("case_assistant_turns", {
      id: uuid("id").primaryKey().defaultRandom(),
      caseId: uuid("case_id").references(() => workflowCases.id, { onDelete: "cascade" }).notNull(),
      userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      asker: (0, import_mysql_core.varchar)("asker", { length: 10 }).notNull(),
      question: (0, import_mysql_core.varchar)("question", { length: 2e3 }).notNull(),
      answer: (0, import_mysql_core.text)("answer").notNull(),
      mode: (0, import_mysql_core.varchar)("mode", { length: 12 }).notNull(),
      sources: jsonb("sources").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    }, (table) => [(0, import_mysql_core.index)("case_assistant_turns_case_idx").on(table.caseId, table.createdAt)]);
  }
});

// src/lib/db/schema/knowledgeManagement.ts
var knowledgeStrands, knowledgeCategories, knowledgeItems, knowledgeVersions;
var init_knowledgeManagement = __esm({
  "src/lib/db/schema/knowledgeManagement.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    knowledgeStrands = mysqlTable("knowledge_strands", {
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
    knowledgeCategories = mysqlTable("knowledge_categories", {
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
    knowledgeItems = mysqlTable("knowledge_items", {
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
    knowledgeVersions = mysqlTable("knowledge_versions", {
      id: uuid("id").primaryKey().defaultRandom(),
      itemId: uuid("item_id").references(() => knowledgeItems.id, { onDelete: "cascade" }).notNull(),
      data: jsonb("data").notNull(),
      versionNumber: integer("version_number").notNull(),
      changeComment: (0, import_mysql_core.text)("change_comment").default("").notNull(),
      createdBy: uuid("created_by").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
  }
});

// src/lib/db/schema/rbac.ts
function roleHasPermission(rolePermissions, permission) {
  if (rolePermissions.includes("*"))
    return true;
  return rolePermissions.includes(permission);
}
var PERMISSION_CATEGORIES, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS;
var init_rbac = __esm({
  "src/lib/db/schema/rbac.ts"() {
    "use strict";
    PERMISSION_CATEGORIES = {
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
    ALL_PERMISSIONS = [
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
    DEFAULT_ROLE_PERMISSIONS = {
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
  }
});

// src/lib/db/schema/literatureFindings.ts
var literatureFindings, literatureSyncLog;
var init_literatureFindings = __esm({
  "src/lib/db/schema/literatureFindings.ts"() {
    "use strict";
    init_mysqlSchema();
    literatureFindings = mysqlTable("literature_findings", {
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
    literatureSyncLog = mysqlTable("literature_sync_log", {
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
  }
});

// src/lib/db/schema/ethnomedicine.ts
var platformCases, scientificAnalyses, culturalReports, biometricScans, attunementReminders;
var init_ethnomedicine = __esm({
  "src/lib/db/schema/ethnomedicine.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    platformCases = mysqlTable("cases", {
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
    scientificAnalyses = mysqlTable("scientific_analyses", {
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
    culturalReports = mysqlTable("cultural_reports", {
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
    biometricScans = mysqlTable("biometric_scans", {
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
    attunementReminders = mysqlTable("attunement_reminders", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      nextPromptAt: timestamp("next_prompt_at").notNull(),
      promptType: (0, import_mysql_core.varchar)("prompt_type", { length: 20 }).$type().notNull(),
      optedIn: (0, import_mysql_core.boolean)("opted_in").default(false).notNull(),
      dismissedCount: integer("dismissed_count").default(0).notNull(),
      completedCount: integer("completed_count").default(0).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
  }
});

// src/lib/db/schema/marketplace.ts
var timestamps, businessCategories, serviceKinds, businesses, businessMembers, services, availabilityRules, timeOff, businessClients, bookings, payments, remedies, remedyIngredients, stockMovements, reviews, conversations, messages, realtimeEvents, notifications, businessInvitations;
var init_marketplace = __esm({
  "src/lib/db/schema/marketplace.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    init_herbs();
    timestamps = {
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
    };
    businessCategories = mysqlTable("business_categories", {
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
    serviceKinds = mysqlTable("service_kinds", {
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
    businesses = mysqlTable(
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
    businessMembers = mysqlTable(
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
    services = mysqlTable(
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
    availabilityRules = mysqlTable(
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
    timeOff = mysqlTable("time_off", {
      id: uuid("id").primaryKey().defaultRandom(),
      businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }).notNull(),
      memberId: uuid("member_id").references(() => businessMembers.id, { onDelete: "cascade" }),
      startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
      endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
      reason: (0, import_mysql_core.varchar)("reason", { length: 200 }),
      ...timestamps
    });
    businessClients = mysqlTable(
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
    bookings = mysqlTable(
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
    payments = mysqlTable(
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
    remedies = mysqlTable(
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
    remedyIngredients = mysqlTable(
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
    stockMovements = mysqlTable("stock_movements", {
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
    reviews = mysqlTable(
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
    conversations = mysqlTable(
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
    messages = mysqlTable(
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
    realtimeEvents = mysqlTable(
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
    notifications = mysqlTable(
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
    businessInvitations = mysqlTable(
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
  }
});

// src/lib/db/schema/hexacore.ts
var hexacoreAspects, hexacorePractices, hexacoreJournal, hexacorePracticeLog, hexacoreFrequencyHistory, hexacoreCircles, hexacoreCircleMembers, hexacoreCirclePosts, hexacoreCircleReactions, hexacoreCircleInvites, hexacoreProducts, hexacorePurchases, hexacoreSubscriptions, HEXACORE_DEFAULT_PRODUCTS;
var init_hexacore = __esm({
  "src/lib/db/schema/hexacore.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    init_marketplace();
    hexacoreAspects = mysqlTable("hexacore_aspects", {
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
    hexacorePractices = mysqlTable("hexacore_practices", {
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
    hexacoreJournal = mysqlTable("hexacore_journal", {
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
    hexacorePracticeLog = mysqlTable("hexacore_practice_log", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      practiceId: uuid("practice_id").references(() => hexacorePractices.id, { onDelete: "cascade" }).notNull(),
      completedAt: timestamp("completed_at").defaultNow().notNull(),
      durationSec: integer("duration_sec"),
      notes: (0, import_mysql_core.text)("notes")
    });
    hexacoreFrequencyHistory = mysqlTable("hexacore_frequency_history", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      recordedAt: timestamp("recorded_at").defaultNow().notNull(),
      frequencies: jsonb("frequencies").$type().notNull(),
      dominantCore: (0, import_mysql_core.varchar)("dominant_core", { length: 1 }).$type().notNull(),
      source: (0, import_mysql_core.varchar)("source", { length: 50 }).notNull()
    });
    hexacoreCircles = mysqlTable("hexacore_circles", {
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
    hexacoreCircleMembers = mysqlTable("hexacore_circle_members", {
      circleId: uuid("circle_id").references(() => hexacoreCircles.id, { onDelete: "cascade" }).notNull(),
      userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      role: (0, import_mysql_core.varchar)("role", { length: 20 }).default("member").notNull(),
      joinedAt: timestamp("joined_at").defaultNow().notNull()
    }, (table) => ({
      memberKey: (0, import_mysql_core.primaryKey)({ columns: [table.circleId, table.userId] })
    }));
    hexacoreCirclePosts = mysqlTable("hexacore_circle_posts", {
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
    hexacoreCircleReactions = mysqlTable("hexacore_circle_reactions", {
      id: uuid("id").primaryKey().defaultRandom(),
      postId: uuid("post_id").references(() => hexacoreCirclePosts.id, { onDelete: "cascade" }).notNull(),
      userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      kind: (0, import_mysql_core.varchar)("kind", { length: 30 }).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    hexacoreCircleInvites = mysqlTable("hexacore_circle_invites", {
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
    hexacoreProducts = mysqlTable("hexacore_products", {
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
    hexacorePurchases = mysqlTable("hexacore_purchases", {
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
    hexacoreSubscriptions = mysqlTable("hexacore_subscriptions", {
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
    HEXACORE_DEFAULT_PRODUCTS = [
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
  }
});

// src/lib/db/schema/caseEvaluationPipeline.ts
var pipelineProfiles, pipelinePreliminaryAnalyses, pipelineCases, pipelineReports, pipelineCaseEvents, pipelineAssignments;
var init_caseEvaluationPipeline = __esm({
  "src/lib/db/schema/caseEvaluationPipeline.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    pipelineProfiles = mysqlTable("pipeline_profiles", {
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
    pipelinePreliminaryAnalyses = mysqlTable("pipeline_preliminary_analyses", {
      id: (0, import_mysql_core.varchar)("id", { length: 120 }).primaryKey(),
      profileId: (0, import_mysql_core.varchar)("profile_id", { length: 120 }).notNull(),
      locationCtx: jsonb("location_ctx").notNull(),
      sections: jsonb("sections").notNull(),
      confidence: (0, import_mysql_core.varchar)("confidence", { length: 20 }).notNull(),
      generatedAt: timestamp("generated_at").defaultNow().notNull()
    }, (table) => [(0, import_mysql_core.uniqueIndex)("pipeline_preliminary_analyses_profile_idx").on(table.profileId)]);
    pipelineCases = mysqlTable("pipeline_cases", {
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
    pipelineReports = mysqlTable("pipeline_reports", {
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
    pipelineCaseEvents = mysqlTable("pipeline_case_events", {
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
    pipelineAssignments = mysqlTable("pipeline_assignments", {
      id: (0, import_mysql_core.varchar)("id", { length: 120 }).primaryKey(),
      caseId: (0, import_mysql_core.varchar)("case_id", { length: 120 }).notNull(),
      professionalId: (0, import_mysql_core.varchar)("professional_id", { length: 120 }).notNull(),
      assignedAt: timestamp("assigned_at").defaultNow().notNull()
    });
  }
});

// src/lib/db/schema/platform.ts
var platformSettings, platformPayments, rateLimits, scheduledTasks;
var init_platform = __esm({
  "src/lib/db/schema/platform.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    platformSettings = mysqlTable("platform_settings", {
      key: (0, import_mysql_core.varchar)("key", { length: 60 }).primaryKey(),
      value: jsonb("value").$type().notNull(),
      updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
    });
    platformPayments = mysqlTable(
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
    rateLimits = mysqlTable(
      "rate_limits",
      {
        key: (0, import_mysql_core.varchar)("key", { length: 400 }).primaryKey(),
        count: integer("count").default(0).notNull(),
        resetAt: timestamp("reset_at", { withTimezone: true }).notNull()
      },
      (table) => [(0, import_mysql_core.index)("rate_limits_reset_idx").on(table.resetAt)]
    );
    scheduledTasks = mysqlTable(
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
  }
});

// src/lib/db/schema/toolkit.ts
var toolkitTools, knowledgeSets, businessKnowledgeSets, businessTools, toolkitUsage;
var init_toolkit = __esm({
  "src/lib/db/schema/toolkit.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    init_marketplace();
    toolkitTools = mysqlTable("toolkit_tools", {
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
    knowledgeSets = mysqlTable("knowledge_sets", {
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
    businessKnowledgeSets = mysqlTable(
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
    businessTools = mysqlTable(
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
    toolkitUsage = mysqlTable(
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
  }
});

// src/lib/db/schema/safety.ts
var safetySubstances, safetyInteractions;
var init_safety = __esm({
  "src/lib/db/schema/safety.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    safetySubstances = mysqlTable(
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
    safetyInteractions = mysqlTable(
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
  }
});

// src/lib/db/schema/intake.ts
var DROPDOWN_TYPES, serviceIntakeSettings, intakeAttachments, autoResponseRules, responseDrafts, fewusTexts;
var init_intake = __esm({
  "src/lib/db/schema/intake.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    init_marketplace();
    DROPDOWN_TYPES = ["none", "custom", "metsehafe_fewus", "metsehafe_asmat", "awde_negest"];
    serviceIntakeSettings = mysqlTable("service_intake_settings", {
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
    intakeAttachments = mysqlTable(
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
    autoResponseRules = mysqlTable(
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
    responseDrafts = mysqlTable(
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
    fewusTexts = mysqlTable(
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
  }
});

// src/lib/db/schema/followUps.ts
var followUps;
var init_followUps = __esm({
  "src/lib/db/schema/followUps.ts"() {
    "use strict";
    init_mysqlSchema();
    init_users();
    init_caseWorkflow();
    init_marketplace();
    followUps = mysqlTable(
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
  }
});

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
  caseAssistantTurns: () => caseAssistantTurns,
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
var init_schema = __esm({
  "src/lib/db/schema/index.ts"() {
    "use strict";
    init_users();
    init_nutrition();
    init_herbs();
    init_gapAnalysis();
    init_emergency();
    init_diagnostic();
    init_caseWorkflow();
    init_knowledgeManagement();
    init_rbac();
    init_literatureFindings();
    init_ethnomedicine();
    init_hexacore();
    init_caseEvaluationPipeline();
    init_marketplace();
    init_platform();
    init_toolkit();
    init_safety();
    init_intake();
    init_followUps();
  }
});

// src/lib/db/index.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  dbClient: () => dbClient,
  pool: () => pool
});
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
async function run(strings, ...values) {
  const [rows] = await pool.query(strings.join("?"), values);
  return rows;
}
var import_mysql2, import_promise, connectionString, globalForDb, pool, db, dbClient;
var init_db = __esm({
  "src/lib/db/index.ts"() {
    "use strict";
    import_mysql2 = require("drizzle-orm/mysql2");
    import_promise = __toESM(require("mysql2/promise"));
    init_schema();
    connectionString = process.env.DATABASE_URL || "mysql://root:devroot@localhost:3307/ethio_wellness";
    globalForDb = globalThis;
    pool = globalForDb.mysqlPool ?? createPool();
    globalForDb.mysqlPool = pool;
    db = (0, import_mysql2.drizzle)(pool, { schema: schema_exports, mode: "default" });
    dbClient = Object.assign(run, {
      /** Closes the pool (scripts and tests; the server keeps it open). */
      end: (_options) => pool.end()
    });
  }
});

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

// src/lib/db/setupReference.ts
init_db();

// src/lib/db/migrateAndSeedAuth.ts
var import_node_crypto = require("node:crypto");
var import_drizzle_orm4 = require("drizzle-orm");
init_db();
init_schema();
init_rbac();

// src/lib/auth.ts
var import_headers = require("next/headers");
init_db();
init_schema();
var import_drizzle_orm3 = require("drizzle-orm");
init_rbac();

// src/lib/db/write.ts
var import_drizzle_orm2 = require("drizzle-orm");
var import_mysql_core2 = require("drizzle-orm/mysql-core");
var keyCache = /* @__PURE__ */ new WeakMap();
function primaryKey2(table) {
  let keys = keyCache.get(table);
  if (!keys) {
    const columns = Object.entries((0, import_drizzle_orm2.getTableColumns)(table));
    const composite = (0, import_mysql_core2.getTableConfig)(table).primaryKeys[0]?.columns.map((column) => column.name);
    const names = new Set(composite?.length ? composite : columns.filter(([, column]) => column.primary).map(([, column]) => column.name));
    keys = columns.filter(([, column]) => names.has(column.name)).map(([key, column]) => ({ key, column }));
    if (!keys.length)
      throw new Error(`${(0, import_drizzle_orm2.getTableName)(table)} has no primary key; write helpers need one.`);
    keyCache.set(table, keys);
  }
  return keys;
}
function keepExisting(table) {
  const { key, column } = primaryKey2(table)[0];
  return { [key]: import_drizzle_orm2.sql`${column}` };
}

// src/lib/auth.ts
var ACCESS_TTL_SECONDS = 15 * 60;

// src/lib/db/migrateAndSeedAuth.ts
var roleDefinitions = [
  ["super_admin", "Full system control with unrestricted permissions"],
  ["admin", "Platform administrator with user and content management privileges"],
  ["premium", "Paid subscriber with advanced workflows"],
  ["user", "Authenticated user with personal wellbeing workflow access"],
  ["editor", "Knowledge base content editor"],
  ["reviewer", "Content approver for knowledge and safety validation"],
  ["practitioner", "Verified health professional and herbal medicine consultant"],
  ["analyst", "Read-only analytics and audit inspector"]
].map(([name, description]) => ({ name, description }));
async function seedRoles() {
  for (const role of roleDefinitions) {
    await db.insert(roles).values({ id: (0, import_node_crypto.randomUUID)(), name: role.name, description: role.description, permissions: DEFAULT_ROLE_PERMISSIONS[role.name], isSystemRole: true, isActive: true }).onDuplicateKeyUpdate({ set: { description: role.description, permissions: DEFAULT_ROLE_PERMISSIONS[role.name], isActive: true } });
  }
  const rows = await db.select({ id: roles.id, name: roles.name }).from(roles);
  return new Map(rows.map((row) => [row.name, row.id]));
}

// src/lib/db/seed.ts
var import_node_crypto2 = require("node:crypto");
var import_node_path2 = require("node:path");
var import_node_url = require("node:url");
var import_drizzle_orm5 = require("drizzle-orm");
init_db();
init_schema();

// src/lib/nutrition/efctDatabase.ts
var EFCT_MASTER_FOODS = [
  // ==========================================
  // 1. GRAINS & CEREALS (36 items)
  // ==========================================
  {
    id: "efct-0101",
    name: "Fermented Brown Teff Injera",
    nameAmharic: "\u12E8\u1261\u1293\u121B \u1324\u134D \u12A5\u1295\u1300\u122B (\u12E8\u1266\u12AB)",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0101",
    traditionalPreparation: "4-day spontaneous lactic acid and yeast fermentation with Ersho starter. Microbial phytase breaks down phytate complexes by up to 75%, liberating bound divalent cations.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 42, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 220,
      tanninsMgPer100g: 85,
      oxalatesMgPer100g: 30,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "72\u201396h Ersho lactic backslopped fermentation and aeration (Aflegna).",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Non-heme iron dialyzability elevated by 1.45x\u20131.60x; zinc bioavailability elevated by 1.35x."
    },
    macros: { caloriesKcal: 165, proteinG: 4.8, carbohydratesG: 34.2, fatsG: 0.8, dietaryFiberG: 4.2 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 11.5, bioavailabilityFactor: 1.45, note: "Phytate degraded by Ersho fermentation" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 130, bioavailabilityFactor: 1.2, note: "Volcanic soil uptake in grain bran" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3.6, bioavailabilityFactor: 1.35, note: "Microbially liberated" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 140, bioavailabilityFactor: 1.15, note: "High cellular mineral density" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 4.2, bioavailabilityFactor: 1, note: "Prebiotic resistant starch" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 4.8, bioavailabilityFactor: 1, note: "Contains all 8 essential amino acids" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Iron-deficiency anemia", "Pre-diabetes & metabolic syndrome", "Celiac disease (naturally gluten-free)"],
      bioactiveCompounds: ["Prebiotic arabinoxylans", "Proanthocyanidins", "Resistant retrograded starch"],
      digestiveTolerance: "Excellent gastrointestinal soothing due to lactic fermentation acidity (pH 3.8\u20134.2)."
    }
  },
  {
    id: "efct-0102",
    name: "White Teff Injera (Nech Teff)",
    nameAmharic: "\u12E8\u1290\u132D \u1324\u134D \u12A5\u1295\u1300\u122B",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0102",
    traditionalPreparation: "Fermented white teff flour (Eragrostis tef var. alba). Highly prized for soft spongy texture and subtle sourness.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 48, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 180,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 22,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "72h Ersho fermentation with scum skimming.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Smooth mineral release with lower native polyphenol content than dark grains."
    },
    macros: { caloriesKcal: 170, proteinG: 4.5, carbohydratesG: 36, fatsG: 0.7, dietaryFiberG: 3.2 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 6.8, bioavailabilityFactor: 1.35, note: "Fermented injera non-heme iron" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 90, bioavailabilityFactor: 1.15, note: "Endosperm calcium" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.8, bioavailabilityFactor: 1.25, note: "Bioavailable zinc" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 4.5, bioavailabilityFactor: 1, note: "Gluten-free cereal protein" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 3.2, bioavailabilityFactor: 1, note: "Fermented grain fiber" }
    ],
    physiologicalNotes: {
      primaryIndications: ["General digestive wellness", "Gluten intolerance", "Cardiovascular support"],
      bioactiveCompounds: ["Soluble ferulic acid", "Resistant starch"],
      digestiveTolerance: "Very gentle on sensitive digestive tracts."
    }
  },
  {
    id: "efct-0103",
    name: "Red Teff Injera (Qey Teff)",
    nameAmharic: "\u12E8\u1240\u12ED \u1324\u134D \u12A5\u1295\u1300\u122B",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0103",
    traditionalPreparation: "Fermented dark whole-grain red teff. Contains the highest iron and phenolic antioxidant concentration among all teff cultivars.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 39, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 290,
      tanninsMgPer100g: 140,
      oxalatesMgPer100g: 38,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Extended 96h Ersho fermentation with temperature controlled resting.",
      fermentationReductionPct: 78,
      bioavailabilityUpliftDescription: "Fermentation neutralizes tannins while preserving concentrated bran-bound iron."
    },
    macros: { caloriesKcal: 160, proteinG: 5.1, carbohydratesG: 33.5, fatsG: 0.9, dietaryFiberG: 4.8 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 15.2, bioavailabilityFactor: 1.5, note: "Peak iron density among all cultivated grains" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 160, bioavailabilityFactor: 1.25, note: "High bran calcium" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 4.1, bioavailabilityFactor: 1.4, note: "Enzymatic activation" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 165, bioavailabilityFactor: 1.2, note: "Dense mineral matrix" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 4.8, bioavailabilityFactor: 1, note: "Whole grain roughage" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 5.1, bioavailabilityFactor: 1, note: "Rich in methionine" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Highland altitude hemoglobin synthesis", "Severe nutritional anemia", "Athletic stamina"],
      bioactiveCompounds: ["High polymeric proanthocyanidins", "Bran flavonoids"],
      digestiveTolerance: "Substantial satiety; requires thorough chewing and hydration."
    }
  },
  {
    id: "efct-0104",
    name: "Roasted Barley Besso Drink",
    nameAmharic: "\u12E8\u1308\u1265\u1235 \u1260\u1236",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0104",
    traditionalPreparation: "Highland barley (Hordeum vulgare) cleaned, slow-roasted over clay griddles, ground to fine flour, and shaken with water and a touch of honey or salt.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 35, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 120,
      tanninsMgPer100g: 45,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Thermal roasting (Qolo technique) thermally denatures heat-labile antinutrients.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Roasting gelatinizes beta-glucan starch and enhances soluble mineral release."
    },
    macros: { caloriesKcal: 352, proteinG: 11.5, carbohydratesG: 68, fatsG: 2.1, dietaryFiberG: 14.5 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 14.5, bioavailabilityFactor: 1, note: "Rich in beta-glucan soluble fiber" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 120, bioavailabilityFactor: 1.1, note: "High cellular magnesium" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.5, bioavailabilityFactor: 1.2, note: "Roasted barley iron" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 450, bioavailabilityFactor: 1, note: "Electrolyte replenishment" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 11.5, bioavailabilityFactor: 1, note: "High satiety protein" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Cholesterol reduction (LDL lowering via beta-glucan)", "Gastric ulcer soothing", "Endurance hydration"],
      bioactiveCompounds: ["Barley beta-glucans", "Tocotrienols"],
      digestiveTolerance: "Forms a soothing demulcent gel in the stomach, shielding gastric mucosa from excess acid."
    }
  },
  {
    id: "efct-0105",
    name: "Kinche (Cracked Wheat Porridge)",
    nameAmharic: "\u1242\u1295\u132C",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0105",
    traditionalPreparation: "Coarsely cracked whole wheat boiled in water until tender, seasoned with spiced clarified butter (niter kibbeh) or oil during fasting.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 52, rating: "medium" },
    antinutrients: {
      phyticAcidMgPer100g: 310,
      tanninsMgPer100g: 50,
      oxalatesMgPer100g: 25,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Prolonged boiling and pre-cracking.",
      fermentationReductionPct: 40,
      bioavailabilityUpliftDescription: "Cracking grain enhances moisture penetration and starch availability."
    },
    macros: { caloriesKcal: 185, proteinG: 6.2, carbohydratesG: 35, fatsG: 2.8, dietaryFiberG: 5.5 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 5.5, bioavailabilityFactor: 1, note: "Insoluble wheat bran fiber" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 6.2, bioavailabilityFactor: 1, note: "Plant protein" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 78, bioavailabilityFactor: 1, note: "Whole grain magnesium" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 2.8, bioavailabilityFactor: 1, note: "Non-heme cereal iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Bowel regularity & peristalsis", "Sustained morning energy"],
      bioactiveCompounds: ["Wheat bran alkylresorcinols"],
      digestiveTolerance: "Wholesome breakfast staple; moderate portion if gluten sensitive."
    }
  },
  {
    id: "efct-0106",
    name: "Genfo (Barley-Emmer Porridge with Berbere Well)",
    nameAmharic: "\u12E8\u1308\u1265\u1235\u1293 \u12A0\u1303 \u1308\u1295\u134E",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0106",
    traditionalPreparation: "Thick roasted barley and emmer wheat porridge whipped vigorously in boiling water, served with a central well of melted niter kibbeh and berbere.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 45, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 150,
      tanninsMgPer100g: 60,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Intense dry roasting prior to milling and vigorous boiling.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Thermal processing degrades phytates and gelatinizes complex starches."
    },
    macros: { caloriesKcal: 240, proteinG: 7.5, carbohydratesG: 42, fatsG: 5.2, dietaryFiberG: 7 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 7, bioavailabilityFactor: 1, note: "Mixed soluble and insoluble fiber" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 65, bioavailabilityFactor: 1.1, note: "Cereal calcium" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.2, bioavailabilityFactor: 1.15, note: "Emmer & barley iron" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 95, bioavailabilityFactor: 1.1, note: "Muscular recovery mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Postpartum maternal recovery", "Bone fracture convalescence", "Thermal body warming"],
      bioactiveCompounds: ["Emmer avenanthramides", "Barley beta-glucans"],
      digestiveTolerance: "Heavy grounding comfort food; provides long-lasting sustained caloric satiety."
    }
  },
  {
    id: "efct-0107",
    name: "Sorghum Bread (Mashila Qitta)",
    nameAmharic: "\u12E8\u121B\u123D\u120B \u1242\u1323",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0107",
    traditionalPreparation: "Drought-resilient lowland sorghum (Sorghum bicolor) flour lightly fermented and baked on earthenware mitad into dense flatbread.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 50, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 340,
      tanninsMgPer100g: 180,
      oxalatesMgPer100g: 28,
      trypsinInhibitorLevel: "moderate",
      traditionalDegradationMethod: "Overnight light fermentation and baking.",
      fermentationReductionPct: 55,
      bioavailabilityUpliftDescription: "Thermal contact neutralizes cyanogenic precursors in cultivated grain varieties."
    },
    macros: { caloriesKcal: 190, proteinG: 5.5, carbohydratesG: 39, fatsG: 1.5, dietaryFiberG: 4 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5, bioavailabilityFactor: 1.15, note: "Sorghum iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.2, bioavailabilityFactor: 1.1, note: "Cereal zinc" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 85, bioavailabilityFactor: 1, note: "Electrolyte mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Lowland arid adaptation", "High antioxidant polyphenol protection"],
      bioactiveCompounds: ["3-Deoxyanthocyanidins", "Flavones"],
      digestiveTolerance: "Good tolerance; traditionally paired with buttermilk or vegetable stews."
    }
  },
  {
    id: "efct-0108",
    name: "Finger Millet Bread (Dagussa Injera)",
    nameAmharic: "\u12E8\u12F3\u1309\u1233 \u12A5\u1295\u1300\u122B",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0108",
    traditionalPreparation: "Calcium-dense highland finger millet (Eleusine coracana) fermented with Ersho into distinctive dark reddish-brown injera.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 44, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 250,
      tanninsMgPer100g: 110,
      oxalatesMgPer100g: 32,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "72h Ersho fermentation.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Microbial phytase markedly unlocks extraordinarily high native calcium."
    },
    macros: { caloriesKcal: 168, proteinG: 4.2, carbohydratesG: 35, fatsG: 0.9, dietaryFiberG: 4.5 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 340, bioavailabilityFactor: 1.35, note: "Highest natural calcium density among all cereals (3x milk equivalent)" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 6.5, bioavailabilityFactor: 1.3, note: "Bioavailable millet iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.5, bioavailabilityFactor: 1.2, note: "Trace mineral" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 4.5, bioavailabilityFactor: 1, note: "Slow digesting fiber" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Pediatric bone mineralization", "Osteoporosis prevention in elderly", "Maternal lactation calcium support"],
      bioactiveCompounds: ["Eleusinian polyphenols", "Tryptophan"],
      digestiveTolerance: "Remarkable digestive calm; favored in Gojjam and Gondar for bone strength."
    }
  },
  {
    id: "efct-0109",
    name: "Ethiopian Roasted Kolo Mix",
    nameAmharic: "\u12E8\u1246\u120E \u1245\u120D\u1245\u120D",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0109",
    traditionalPreparation: "Hand-roasted blend of whole barley grains, chickpeas (shimbra), peanuts (lewz), and safflower seed kernels. Ubiquitous daily snack.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 38, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 190,
      tanninsMgPer100g: 75,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "High heat sand/clay roasting completely destroys trypsin inhibitors.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Dry thermal roasting neutralizes enzyme blockers and stabilizes healthy fats."
    },
    macros: { caloriesKcal: 410, proteinG: 16.5, carbohydratesG: 62, fatsG: 11, dietaryFiberG: 12 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 16.5, bioavailabilityFactor: 1, note: "Complementary pulse and cereal amino acids" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 12, bioavailabilityFactor: 1, note: "Whole roasted grain roughage" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 6.2, bioavailabilityFactor: 1.1, note: "Roasted seed and pulse iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3.4, bioavailabilityFactor: 1.1, note: "Plant zinc" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 155, bioavailabilityFactor: 1, note: "High energy mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Sustained mental concentration during travel/study", "Appetite stabilization"],
      bioactiveCompounds: ["Legume lignans", "Roasted seed phytosterols"],
      digestiveTolerance: "Requires slow and thorough mastication; provides hours of stable blood sugar."
    }
  },
  {
    id: "efct-0110",
    name: "Chechebsa / Kita Firfir (Torn Flatbread with Spiced Butter)",
    nameAmharic: "\u1328\u1328\u1265\u1233 / \u1242\u1323 \u134D\u122D\u134D\u122D",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0110",
    traditionalPreparation: "Unleavened wheat and teff flour dough shallow-cooked on a mitad griddle into rustic flatbread (kita), torn into bite-sized shreds, and pan-tossed in warm niter kibbeh infused with berbere.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 52, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 210,
      tanninsMgPer100g: 45,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Short resting of dough and high-heat pan sear degrades active phytates and gelatinizes starch.",
      fermentationReductionPct: 40,
      bioavailabilityUpliftDescription: "Lipids from niter kibbeh enhance assimilation of carotenoids and fat-soluble micronutrients."
    },
    macros: { caloriesKcal: 295, proteinG: 6.8, carbohydratesG: 44.5, fatsG: 10.5, dietaryFiberG: 4.8 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.2, bioavailabilityFactor: 1.15, note: "Grain iron mobilized with warming spices" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 65, bioavailabilityFactor: 1.1, note: "Teff-wheat blend calcium" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 88, bioavailabilityFactor: 1.05, note: "Cellular energy support" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 120, bioavailabilityFactor: 1.25, note: "Retinol from spiced clarified butter" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 4.8, bioavailabilityFactor: 1, note: "Whole grain sustained satiety" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Rapid morning glycogen replenishment", "Convalescent recovery", "Cold weather sustained energy"],
      bioactiveCompounds: ["Capsaicinoids from berbere", "Butyric acid from kibbeh", "Wheat ferulic acid"],
      digestiveTolerance: "Easily digestible when served warm; lubricates gastric mucosa."
    }
  },
  {
    id: "efct-0111",
    name: "Besso Chuko (Roasted Barley Kneaded with Kibbeh)",
    nameAmharic: "\u1260\u1236 \u1329\u12AE",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0111",
    traditionalPreparation: "Highland barley (Hordeum vulgare) cleaned, slow-roasted to golden amber, stone-ground to flour, and vigorously kneaded with abundant spiced clarified butter, korerima, and salt until firm and moldable.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 41, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 140,
      tanninsMgPer100g: 50,
      oxalatesMgPer100g: 14,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Dry sand/griddle roasting destroys enzymatic inhibitors and reduces phytate complexes.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Thermal roasting and lipid saturation protect minerals and provide extended caloric delivery."
    },
    macros: { caloriesKcal: 460, proteinG: 9.8, carbohydratesG: 52, fatsG: 24.5, dietaryFiberG: 11.2 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 11.2, bioavailabilityFactor: 1, note: "High beta-glucan soluble viscous fiber" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 115, bioavailabilityFactor: 1.1, note: "Metabolic enzyme activator" },
      { name: "Phosphorus", symbol: "P", unit: "mg", amountPer100g: 260, bioavailabilityFactor: 1, note: "Bone mineral matrix" },
      { name: "Selenium", symbol: "Se", unit: "mcg", amountPer100g: 22, bioavailabilityFactor: 1.2, note: "Thyroid and antioxidant protection" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Long-distance travel nutrition", "Post-exercise glycogen and lipid reloading", "Appetite suppression"],
      bioactiveCompounds: ["Cereal beta-glucans", "Korerima monoterpenes", "Conjugated linoleic acid (CLA)"],
      digestiveTolerance: "Dense but soothing; delays gastric emptying, promoting long hours of stable glucose."
    }
  },
  {
    id: "efct-0112",
    name: "Mixed Grain Injera (Sergegna Injera)",
    nameAmharic: "\u1230\u122D\u1308\u129B \u12A5\u1295\u1300\u122B",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0112",
    traditionalPreparation: "Composite flour of brown teff, highland barley, and sorghum subjected to 3-day lactic fermentation with Ersho backslopping, cooked on clay mitad with classic spongy eyes (ayen).",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 44, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 230,
      tanninsMgPer100g: 78,
      oxalatesMgPer100g: 24,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "72h microbial fermentation activates endogenous phytase across all three grain types.",
      fermentationReductionPct: 72,
      bioavailabilityUpliftDescription: "Multigrain synergy releases broader micronutrient spectrum than single-grain bread."
    },
    macros: { caloriesKcal: 168, proteinG: 5.1, carbohydratesG: 34.8, fatsG: 1.1, dietaryFiberG: 4.9 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 9.4, bioavailabilityFactor: 1.4, note: "Lactic fermented teff-barley iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3.1, bioavailabilityFactor: 1.3, note: "High bioaccessibility" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 110, bioavailabilityFactor: 1.15, note: "Bran mineral density" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 4.9, bioavailabilityFactor: 1, note: "Prebiotic arabinoxylans & beta-glucans" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Metabolic syndrome glycemic control", "Daily iron repletion", "Colonic microbiome diversity"],
      bioactiveCompounds: ["Proanthocyanidins", "Resistant retrograded starch", "Ferulic acid oligomers"],
      digestiveTolerance: "Light, aerated crumb with gentle acidity (pH 3.9) supporting gastric enzyme action."
    }
  },
  {
    id: "efct-0113",
    name: "Emmer Wheat Porridge (Aja Genfo)",
    nameAmharic: "\u12E8\u12A0\u1303 \u1308\u1295\u134E",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0113",
    traditionalPreparation: "Ancient hulled emmer wheat (Triticum dicoccum, Aja) de-hulled, stone-milled, slowly whisked in boiling spring water with a wooden mashero into a dense silky pudding, topped with niter kibbeh and berbere.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 43, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 175,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 16,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Prolonged vigorous cooking at boiling temperature hydrolyzes antinutrients.",
      fermentationReductionPct: 55,
      bioavailabilityUpliftDescription: "Emmer wheat's ancient low-gliadin gluten structure makes its minerals far more accessible."
    },
    macros: { caloriesKcal: 215, proteinG: 7.2, carbohydratesG: 41, fatsG: 3.8, dietaryFiberG: 6.4 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 7.2, bioavailabilityFactor: 1.05, note: "Rich in cysteine and methionine" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 128, bioavailabilityFactor: 1.1, note: "High cellular mineral concentration" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3, bioavailabilityFactor: 1.15, note: "Bioavailable ancient wheat zinc" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.1, note: "Emmer whole grain iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Postpartum tissue healing", "Sore muscle recovery", "Hypoallergenic grain replacement for modern wheat"],
      bioactiveCompounds: ["Alkylresorcinols", "Carotenoids (lutein)", "Resistant starch"],
      digestiveTolerance: "Revered in Ethiopian medicine for soothing irritable gut and ulcers."
    }
  },
  {
    id: "efct-0114",
    name: "Roasted Wheat Kolo with Peanuts (\u12E8\u1235\u1295\u12F4 \u1246\u120E)",
    nameAmharic: "\u12E8\u1235\u1295\u12F4\u1293 \u12E8\u1208\u12CD\u12DD \u1246\u120E",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0114",
    traditionalPreparation: "Whole grain highland wheat kernels parched over hot griddles until puffed and crunchy, tossed with roasted red-skin peanuts and fine sea salt.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 42, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 220,
      tanninsMgPer100g: 65,
      oxalatesMgPer100g: 25,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Dry thermal roasting (>160\xB0C) deactivates enzyme blockers and lectins.",
      fermentationReductionPct: 58,
      bioavailabilityUpliftDescription: "Thermal breakdown allows rapid mastication and release of bound amino acids."
    },
    macros: { caloriesKcal: 425, proteinG: 14.8, carbohydratesG: 61.5, fatsG: 13.5, dietaryFiberG: 9.8 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 14.8, bioavailabilityFactor: 1, note: "Complete complementary amino acid profile from legume & cereal" },
      { name: "Vitamin E", symbol: "VitE", unit: "mg", amountPer100g: 4.5, bioavailabilityFactor: 1, note: "Alpha-tocopherol from peanut oil" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 145, bioavailabilityFactor: 1.05, note: "Neuromuscular support" },
      { name: "Niacin", symbol: "B3", unit: "mg", amountPer100g: 6.2, bioavailabilityFactor: 1, note: "Energy metabolic cofactor" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Sustained cognitive endurance", "Healthy weight management snack", "Pre-workout fueling"],
      bioactiveCompounds: ["Resveratrol from peanut skins", "Wheat lignans", "Phytosterols"],
      digestiveTolerance: "Dense fiber matrix; best consumed with warm water or herbal tea."
    }
  },
  {
    id: "efct-0115",
    name: "Muk / Atmit (Traditional Grain & Flax Gruel)",
    nameAmharic: "\u1219\u12AD / \u12A0\u1325\u121A\u1275",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0115",
    traditionalPreparation: "Fine composite flour of roasted barley, oats, and ground golden flaxseed slowly simmered in water into a silky thin gruel, seasoned with crushed cardamom and honey.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 39, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 110,
      tanninsMgPer100g: 30,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Pre-roasting of grain followed by liquid boiling breaks antinutritional bonds.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Liquid suspension maximizes intestinal absorption without taxing digestion."
    },
    macros: { caloriesKcal: 135, proteinG: 3.8, carbohydratesG: 22.4, fatsG: 3.2, dietaryFiberG: 4.1 },
    nutrients: [
      { name: "Omega-3", symbol: "ALA", unit: "g", amountPer100g: 1.4, bioavailabilityFactor: 1.2, note: "Plant essential alpha-linolenic acid" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 62, bioavailabilityFactor: 1.1, note: "Smooth muscle relaxant" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 2.8, bioavailabilityFactor: 1.15, note: "Easily assimilated non-heme iron" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 4.1, bioavailabilityFactor: 1, note: "Demulcent mucilage & beta-glucan" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Maternal lactation stimulation", "Gastric ulcer convalescence", "Infant weaning hydration"],
      bioactiveCompounds: ["Secoisolariciresinol diglucoside (SDG)", "Oat avenanthramides", "Soluble mucilage"],
      digestiveTolerance: "Supreme gentle tolerance; provides instant barrier protection to inflamed mucosa."
    }
  },
  {
    id: "efct-0116",
    name: "Dabo Kolo (Spiced Crunchy Wheat Nuggets)",
    nameAmharic: "\u12E8\u12F3\u1266 \u1246\u120E",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0116",
    traditionalPreparation: "Stiff unleavened wheat dough flavored with berbere, garlic paste, salt, and black cumin (tikur azmud), hand-rolled into pencil-thin cords, diced into tiny diamond beads, and dry-baked or lightly fried to crisp perfection.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 50, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 180,
      tanninsMgPer100g: 40,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Baking and dry pan searing neutralizes antinutritional complexes.",
      fermentationReductionPct: 50,
      bioavailabilityUpliftDescription: "Thymoquinone from black cumin synergistically aids nutrient absorption."
    },
    macros: { caloriesKcal: 385, proteinG: 9.2, carbohydratesG: 64, fatsG: 9.8, dietaryFiberG: 5.5 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.8, bioavailabilityFactor: 1.05, note: "Enriched with black cumin trace minerals" },
      { name: "Thiamine", symbol: "B1", unit: "mg", amountPer100g: 0.38, bioavailabilityFactor: 1, note: "Carbohydrate metabolism cofactor" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.1, bioavailabilityFactor: 1, note: "Cellular renewal" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Holiday festive hospitality", "Convenient travel energy", "Satiety control"],
      bioactiveCompounds: ["Thymoquinone", "Capsaicin", "Cinnamic acid derivatives"],
      digestiveTolerance: "Crunchy and dry; best chewed deliberately with coffee or spiced tea."
    }
  },
  {
    id: "efct-0117",
    name: "Defo Dabo (Ceremonial Clay-Oven Sourdough Bread)",
    nameAmharic: "\u12F5\u134E \u12F3\u1266",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0117",
    traditionalPreparation: "Heavy whole-grain wheat dough enriched with fenugreek, coriander, and black seed, wrapped entirely in glossy false banana (enset/koba) leaves and slow-baked for hours in a sealed earthenware pit or cast iron pot covered in hot embers.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 47, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 195,
      tanninsMgPer100g: 42,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Overnight starter fermentation coupled with multi-hour low-heat leaf-baking degrades 70% of phytates.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Enset leaf wrapping traps moisture and volatile phenolic aromas, enhancing mineral availability."
    },
    macros: { caloriesKcal: 235, proteinG: 8.4, carbohydratesG: 46.2, fatsG: 2.1, dietaryFiberG: 5.8 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.5, bioavailabilityFactor: 1.3, note: "Sourdough fermentation unlocks cereal iron" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 95, bioavailabilityFactor: 1.15, note: "Whole wheat grain core" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 75, bioavailabilityFactor: 1.2, note: "Natural bacterial folate synthesis" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.6, bioavailabilityFactor: 1.25, note: "Microbially freed" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Holiday festive celebration sustenance", "Sustained athletic glycogen stores", "Digestive regularity"],
      bioactiveCompounds: ["Trigonelline from fenugreek", "Polyphenols infused from scorched enset leaves", "Resistant starch"],
      digestiveTolerance: "Long sourdough fermentation reduces fructans, eliminating bloating."
    }
  },
  {
    id: "efct-0118",
    name: "Ambasha (Festive Spiced Bread with Cardamom & Nigella)",
    nameAmharic: "\u12A0\u121D\u1263\u123B",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0118",
    traditionalPreparation: "Celebratory leavened flatbread decoratively scored with circular spokes (like a wagon wheel), seasoned with ground korerima, fenugreek, garlic water, and black cumin, baked over clay griddles.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 49, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 170,
      tanninsMgPer100g: 38,
      oxalatesMgPer100g: 16,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Yeast leavening and slow pan-baking under tight cover.",
      fermentationReductionPct: 62,
      bioavailabilityUpliftDescription: "Korerima monoterpenes enhance digestive enzyme secretion in the duodenum."
    },
    macros: { caloriesKcal: 250, proteinG: 7.9, carbohydratesG: 48.5, fatsG: 2.8, dietaryFiberG: 4.4 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.9, bioavailabilityFactor: 1.2, note: "Leavened grain non-heme iron" },
      { name: "Manganese", symbol: "Mn", unit: "mg", amountPer100g: 1.8, bioavailabilityFactor: 1.1, note: "Cartilage and antioxidant enzyme cofactor" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.2, bioavailabilityFactor: 1.15, note: "Immune support" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Post-fasting refeeding", "Festive hospitality", "Cardiovascular support via spice matrix"],
      bioactiveCompounds: ["1,8-Cineole from korerima", "Thymoquinone", "Fenugreek diosgenin"],
      digestiveTolerance: "Soft, fragrant, and gentle on the stomach; widely eaten across Tigray and Eritrea."
    }
  },
  {
    id: "efct-0119",
    name: "Qitta (Unleavened Hearth Pan Flatbread)",
    nameAmharic: "\u12E8\u121D\u1323\u12F5 \u1242\u1323",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0119",
    traditionalPreparation: "Whole wheat, barley, or teff flour mixed with water, salt, and black seed into a soft dough, immediately spread thin by hand on a piping-hot clay mitad, and baked crisp on both sides.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 55, rating: "medium" },
    antinutrients: {
      phyticAcidMgPer100g: 240,
      tanninsMgPer100g: 50,
      oxalatesMgPer100g: 22,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "High direct conductive griddle heat (mitad surface >200\xB0C) denatures native proteins and degrades surface phytates.",
      fermentationReductionPct: 35,
      bioavailabilityUpliftDescription: "Unfermented bread preserves the pure whole-grain cereal mineral baseline."
    },
    macros: { caloriesKcal: 240, proteinG: 8.1, carbohydratesG: 49, fatsG: 1.5, dietaryFiberG: 5.6 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4, bioavailabilityFactor: 1, note: "Whole grain iron" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 105, bioavailabilityFactor: 1, note: "Muscular electrolyte balance" },
      { name: "Phosphorus", symbol: "P", unit: "mg", amountPer100g: 230, bioavailabilityFactor: 1, note: "Bone mineral content" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Rapid emergency meal preparation", "High-altitude shepherd sustenance", "Hypoallergenic staple"],
      bioactiveCompounds: ["Insoluble cereal bran lignin", "Alkylresorcinols"],
      digestiveTolerance: "Hearty and chewy; best paired with tea, milk, or dipped in spiced honey butter."
    }
  },
  {
    id: "efct-0120",
    name: "Korefe (Fermented Probiotic Highland Barley Brew)",
    nameAmharic: "\u1246\u1228\u134C",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0120",
    traditionalPreparation: "Indigenous highland beverage from Gondar prepared by fermenting roasted malted barley (bikil), gesho leaves (Rhamnus prinoides), and water for 48 hours; served foaming and effervescent with active yeasts.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 46, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 45,
      tanninsMgPer100g: 28,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Dual lactic acid bacteria and Saccharomyces fermentation thoroughly degrades phytates.",
      fermentationReductionPct: 82,
      bioavailabilityUpliftDescription: "Microbial enzymatic release yields bioavailable B-vitamins and dissolved minerals."
    },
    macros: { caloriesKcal: 68, proteinG: 1.4, carbohydratesG: 12.8, fatsG: 0.2, dietaryFiberG: 1.8 },
    nutrients: [
      { name: "Vitamin B1", symbol: "B1", unit: "mg", amountPer100g: 0.22, bioavailabilityFactor: 1.3, note: "Synthesized during active yeast budding" },
      { name: "Niacin", symbol: "B3", unit: "mg", amountPer100g: 1.8, bioavailabilityFactor: 1.25, note: "Cellular energy currency" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 1.2, bioavailabilityFactor: 1.4, note: "Freely solubilized ion" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 38, bioavailabilityFactor: 1.2, note: "Fermented malt electrolyte" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Gut microbiome repopulation", "Physical labor recovery rehydration", "Appetite stimulation"],
      bioactiveCompounds: ["Live probiotic Saccharomyces and Lactobacillus strains", "Gesho gentiopicroside derivatives"],
      digestiveTolerance: "Frothy, cooling, and mild; natural lactic acidity soothes intestinal bloating."
    }
  },
  {
    id: "efct-0121",
    name: "Tella (Traditional Fermented Sorghum & Gesho Beer)",
    nameAmharic: "\u1320\u120B",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0121",
    traditionalPreparation: "Indigenous Ethiopian fermented beverage brewed from sun-dried Gesho stems/leaves, germinated barley malt (bikil), roasted crushed sorghum/barley flour (enkuro), and water, fermented in smoked clay pots (insera) for 5\u201314 days.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 45, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 35,
      tanninsMgPer100g: 45,
      oxalatesMgPer100g: 8,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Multi-stage backslopped wild fermentation reduces grain antinutrients by over 80%.",
      fermentationReductionPct: 80,
      bioavailabilityUpliftDescription: "Wood-smoked clay pot tannins combine with hops-like Gesho phenolics for antimicrobial stability."
    },
    macros: { caloriesKcal: 72, proteinG: 1.2, carbohydratesG: 11.5, fatsG: 0.1, dietaryFiberG: 1.2 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 2.1, bioavailabilityFactor: 1.35, note: "Solubilized non-heme iron from dark malt" },
      { name: "Vitamin B2", symbol: "B2", unit: "mg", amountPer100g: 0.18, bioavailabilityFactor: 1.25, note: "Fermentation riboflavin" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 32, bioavailabilityFactor: 1.15, note: "Malt mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Social bonding & cultural ceremonies", "Post-work rehydration", "Natural relaxation"],
      bioactiveCompounds: ["Gesho flavonoids", "Melanoidins from roasted enkuro", "Ferulic acid"],
      digestiveTolerance: "Traditional filtration leaves fine colloidal grain particles that provide gentle gastrointestinal coating."
    }
  },
  {
    id: "efct-0122",
    name: "Borde (Spontaneously Fermented Lowland Cereal Beverage)",
    nameAmharic: "\u1266\u122D\u12F4",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0122",
    traditionalPreparation: "Thick, opaque, creamy fermented cereal beverage produced in Southern and Western Ethiopia from roasted maize, malted sorghum, and finger millet through spontaneous 24\u201348h lactic fermentation.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 42, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 50,
      tanninsMgPer100g: 30,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Lactic acid bacteria (Lactobacillus plantarum, L. fermentum) rapidly drop pH to 3.6, activating phytases.",
      fermentationReductionPct: 85,
      bioavailabilityUpliftDescription: "B-group vitamins increase by 40\u201380% over unfermented cereal slurry."
    },
    macros: { caloriesKcal: 92, proteinG: 2.4, carbohydratesG: 18, fatsG: 0.8, dietaryFiberG: 2.5 },
    nutrients: [
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 45, bioavailabilityFactor: 1.3, note: "Microbially synthesized folate" },
      { name: "Thiamine", symbol: "B1", unit: "mg", amountPer100g: 0.28, bioavailabilityFactor: 1.25, note: "High bioactivity" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 55, bioavailabilityFactor: 1.2, note: "Liberated from finger millet" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.2, bioavailabilityFactor: 1.4, note: "High dialyzability" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Agricultural field laborer meal-replacement", "Lactating mother nutrition", "Thermal exhaustion recovery"],
      bioactiveCompounds: ["Lactic acid probiotics", "Bioactive peptides", "GABA"],
      digestiveTolerance: "Refreshing tart taste; acts as natural digestive tonic and gut shield."
    }
  },
  {
    id: "efct-0123",
    name: "Shamita (Traditional Fermented Roasted Barley Beverage)",
    nameAmharic: "\u123B\u121A\u1273",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0123",
    traditionalPreparation: "A thick, low-alcohol fermented beverage consumed as a quick meal substitute; prepared from roasted barley flour, water, salt, garlic, ginger, and rue (tena'adam), fermented overnight.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 44, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 60,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Overnight ambient fermentation in clay vessels with antimicrobial spices.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Garlic allicin and gingerols suppress putrefactive gut bacteria while preserving probiotic flora."
    },
    macros: { caloriesKcal: 85, proteinG: 2.1, carbohydratesG: 16.5, fatsG: 0.6, dietaryFiberG: 2.8 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 2.8, bioavailabilityFactor: 1, note: "Barley beta-glucan in suspension" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 48, bioavailabilityFactor: 1.15, note: "Cellular hydration" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 2.4, bioavailabilityFactor: 1.3, note: "Bioaccessible mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Workday midday energy replenishment", "Digestive gas expulsion", "Cardioprotection"],
      bioactiveCompounds: ["Beta-glucans", "Gingerols", "Rutin from rue"],
      digestiveTolerance: "Thick yet easily processed; carminative spices prevent gastrointestinal distress."
    }
  },
  {
    id: "efct-0124",
    name: "Katikala / Areki (Triple-Distilled Herbal Grain Spirit)",
    nameAmharic: "\u12A0\u1228\u1244",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0124",
    traditionalPreparation: "Distilled spirit produced from fermented barley malt (bikil), dagussa, and dried gesho leaves, using traditional clay retort stills (terb); often redistilled with koseret or anise seed.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Thermal distillation leaves 100% of non-volatile antinutrients behind in the mash.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Purified volatile herbal terpenes condense into distillate."
    },
    macros: { caloriesKcal: 230, proteinG: 0, carbohydratesG: 0, fatsG: 0, dietaryFiberG: 0 },
    nutrients: [
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 2, bioavailabilityFactor: 1, note: "Trace mineral carryover" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Traditional aperitif", "Digestive tonic after heavy festive meals", "Herbal carrier in folk medicine"],
      bioactiveCompounds: ["Lippia monoterpenes", "Thymol traces", "Ethanol"],
      digestiveTolerance: "Potent (35\u201345% ABV); consumed in ceremonial shot glasses (berle) with food."
    }
  },
  {
    id: "efct-0125",
    name: "Sweet Corn Boiled Cob (Beqolo Qanzo)",
    nameAmharic: "\u12E8\u1260\u1246\u120E \u12A5\u1238\u1275 (\u12E8\u1270\u1240\u1240\u1208)",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0125",
    traditionalPreparation: "Tender freshly harvested milky green corn (Zea mays) boiled on the cob with husks in salted water until kernels are succulent and plump.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 52, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 130,
      tanninsMgPer100g: 22,
      oxalatesMgPer100g: 8,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Prolonged boiling breaks down pericarp hemicellulose and softens insoluble fiber.",
      fermentationReductionPct: 45,
      bioavailabilityUpliftDescription: "Heat cooking increases antioxidant ferulic acid availability by over 50%."
    },
    macros: { caloriesKcal: 96, proteinG: 3.4, carbohydratesG: 19, fatsG: 1.2, dietaryFiberG: 2.7 },
    nutrients: [
      { name: "Lutein & Zeaxanthin", symbol: "Lut", unit: "mcg", amountPer100g: 680, bioavailabilityFactor: 1.2, note: "Macular eye protection" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 42, bioavailabilityFactor: 1, note: "Cellular synthesis" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 270, bioavailabilityFactor: 1, note: "Blood pressure support" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Seasonal harvest whole-food nutrition", "Ocular protection against solar UV radiation", "Children's dietary fiber"],
      bioactiveCompounds: ["Bound ferulic acid released by boiling", "Zeaxanthin", "Lutein"],
      digestiveTolerance: "Chew thoroughly to rupture outer pericarp; gentle on the stomach."
    }
  },
  {
    id: "efct-0126",
    name: "Asharo Kolo (Puffed Roasted Whole Grains)",
    nameAmharic: "\u12A0\u123B\u122E \u1246\u120E",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0126",
    traditionalPreparation: "Selected whole sorghum and barley kernels roasted on a perforated iron griddle over high heat, causing kernels to pop and puff into light, airy golden nuggets.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 45, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 160,
      tanninsMgPer100g: 55,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Instant high-heat popping ruptures starch granules and shears antinutrient rings.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Puffed matrix enhances salivary amylase contact and rapid enzymatic breakdown."
    },
    macros: { caloriesKcal: 375, proteinG: 11.2, carbohydratesG: 72, fatsG: 3.4, dietaryFiberG: 10.5 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.1, note: "Dry popped cereal iron" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 130, bioavailabilityFactor: 1.05, note: "Cellular ATP synthesis" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.8, bioavailabilityFactor: 1.05, note: "Trace mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Light, healthy snacking during coffee ceremonies", "Low-fat fiber repletion", "Celiac safe when using pure sorghum"],
      bioactiveCompounds: ["Condensed tannins transformed into safe insoluble complexes", "Sorghum 3-deoxyanthocyanidins"],
      digestiveTolerance: "Light on the stomach; excellent crunch without excess oil."
    }
  },
  {
    id: "efct-0127",
    name: "Anbabero (Double-Layered Festive Injera with Awaze)",
    nameAmharic: "\u12A0\u1295\u1263\u1260\u122E",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0127",
    traditionalPreparation: "Two sheets of fermented teff injera layered together, basted between with spiced melted niter kibbeh and red awaze/berbere paste, rolled tightly, and toasted lightly over embers.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 44, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 190,
      tanninsMgPer100g: 70,
      oxalatesMgPer100g: 25,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Ersho 4-day fermentation plus thermal basting.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "High-fat dairy lipid emulsion triples carotenoid and capsaicin uptake."
    },
    macros: { caloriesKcal: 260, proteinG: 6.2, carbohydratesG: 36, fatsG: 10.5, dietaryFiberG: 4.6 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 10.2, bioavailabilityFactor: 1.45, note: "Fermented teff iron accelerated by vitamin C in awaze" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 125, bioavailabilityFactor: 1.2, note: "High volcanic soil mineral" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 140, bioavailabilityFactor: 1.3, note: "From niter kibbeh & red pepper" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Holiday breakfast indulgence", "Post-childbirth maternal recovery", "High stamina support"],
      bioactiveCompounds: ["Capsaicin", "Kibbeh butyrate", "Resistant starch"],
      digestiveTolerance: "Rich yet easily broken down; sour fermentation balances spiced dairy richness."
    }
  },
  {
    id: "efct-0128",
    name: "Chachabsa with Honey (\u121B\u122D \u1328\u1328\u1265\u1233)",
    nameAmharic: "\u121B\u122D \u1328\u1328\u1265\u1233",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0128",
    traditionalPreparation: "Traditional pan flatbread torn into flakes, pan-seared with golden spiced butter and glazed with raw highland forest honey (Mar), served warm.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 58, rating: "medium" },
    antinutrients: {
      phyticAcidMgPer100g: 160,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 14,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Quick pan roasting followed by honey glaze.",
      fermentationReductionPct: 45,
      bioavailabilityUpliftDescription: "Raw honey enzymes (diastase, invertase) aid in rapid carbohydrate breakdown."
    },
    macros: { caloriesKcal: 340, proteinG: 5.8, carbohydratesG: 54, fatsG: 11.8, dietaryFiberG: 3.8 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.5, bioavailabilityFactor: 1.15, note: "Grain iron assisted by organic acids in honey" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 180, bioavailabilityFactor: 1, note: "Electrolyte replenishment" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 115, bioavailabilityFactor: 1.25, note: "Preformed retinol from butter" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Children's growth and energy", "Underweight nourishment", "Post-fasting revitalization"],
      bioactiveCompounds: ["Honey pinocembrin", "Butyric acid", "Ferulic acid"],
      digestiveTolerance: "Very smooth and comforting; coats the throat and esophagus."
    }
  },
  {
    id: "efct-0129",
    name: "Farso (Oromo Traditional Fermented Malt Drink)",
    nameAmharic: "\u134B\u122D\u1236",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0129",
    traditionalPreparation: "Traditional Oromo fermented cereal beverage prepared from roasted barley, sorghum, and sprouted malt, lightly bittered with gesho and served fresh during communal labor (Daboo).",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 43, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 40,
      tanninsMgPer100g: 32,
      oxalatesMgPer100g: 9,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Spontaneous lactic-yeast symbiotic fermentation.",
      fermentationReductionPct: 84,
      bioavailabilityUpliftDescription: "Enzymatic sprouting of grains produces high maltose and free amino nitrogen."
    },
    macros: { caloriesKcal: 76, proteinG: 1.6, carbohydratesG: 13.5, fatsG: 0.3, dietaryFiberG: 1.5 },
    nutrients: [
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 36, bioavailabilityFactor: 1.2, note: "Hydrating mineral" },
      { name: "Vitamin B6", symbol: "B6", unit: "mg", amountPer100g: 0.16, bioavailabilityFactor: 1.25, note: "Pyridoxine from yeast fermentation" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 2.2, bioavailabilityFactor: 1.35, note: "Malted grain iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Communal harvest labor endurance", "Electrolyte restoration", "Digestive stimulation"],
      bioactiveCompounds: ["Polyphenols", "GABA", "Lactobacillus cell-wall components"],
      digestiveTolerance: "Pleasantly tart and energizing; prevents dehydration in warm climates."
    }
  },
  {
    id: "efct-0130",
    name: "Hilbet Bread Accompaniment (\u12E8\u1205\u120D\u1260\u1275 \u12F3\u1266)",
    nameAmharic: "\u12E8\u1205\u120D\u1260\u1275 \u12F3\u1266",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0130",
    traditionalPreparation: "Dense crusty whole-wheat and barley loaf baked specifically to be dipped into whipped fenugreek and broad bean cream (hilbet) during fasting in Tigray.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 48, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 185,
      tanninsMgPer100g: 42,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Long slow sourdough fermentation.",
      fermentationReductionPct: 68,
      bioavailabilityUpliftDescription: "When dipped in hilbet, fenugreek saponins improve cereal starch digestion kinetics."
    },
    macros: { caloriesKcal: 228, proteinG: 8.2, carbohydratesG: 44, fatsG: 1.8, dietaryFiberG: 6.2 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 6.2, bioavailabilityFactor: 1, note: "Substantial bran roughage" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.1, bioavailabilityFactor: 1.2, note: "Non-heme mineral" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.4, bioavailabilityFactor: 1.15, note: "Trace nutrient" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Fasting season satiation", "Glucose stability in diabetic patients", "Digestive regularity"],
      bioactiveCompounds: ["Arabinoxylans", "Lignans", "Ferulic acid"],
      digestiveTolerance: "Firm texture requires chewing; pairing with hilbet provides smooth digestive transit."
    }
  },
  {
    id: "efct-0131",
    name: "Ga'at (Tigrayan Traditional Barley Porridge)",
    nameAmharic: "\u130B\u12D3\u1275 (\u12E8\u1308\u1265\u1235)",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0131",
    traditionalPreparation: "Stone-ground roasted highland barley cooked into an extremely thick, firm mountain-shaped porridge mound, hollowed at the peak to hold melted spiced butter and berbere or yogurt.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 42, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 135,
      tanninsMgPer100g: 48,
      oxalatesMgPer100g: 14,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "High-heat roasting of barley before stone grinding and vigorous boiling.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Roasting gelatinizes barley starch and minimizes phytic mineral binding."
    },
    macros: { caloriesKcal: 230, proteinG: 6.8, carbohydratesG: 43.5, fatsG: 4.2, dietaryFiberG: 8.8 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 8.8, bioavailabilityFactor: 1, note: "High barley beta-glucan" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 110, bioavailabilityFactor: 1.1, note: "High cellular mineral" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.2, bioavailabilityFactor: 1.15, note: "Highland barley mineral uptake" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Postnatal maternal rebuilding", "Recovery from strenuous farm labor", "Joint lubrication"],
      bioactiveCompounds: ["Beta-glucans", "Tocotrienols", "Ferulic acid"],
      digestiveTolerance: "Hearty and deeply satisfying; provides steady energy release for over 6 hours."
    }
  },
  {
    id: "efct-0132",
    name: "Teff Porridge (\u12E8\u1324\u134D \u1308\u1295\u134E)",
    nameAmharic: "\u12E8\u1324\u134D \u1308\u1295\u134E",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0132",
    traditionalPreparation: "Whole grain brown and red teff flour stirred into boiling water until thick, glossy, and smooth, served with an interior well of niter kibbeh, mitmita, and spiced honey.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 46, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 210,
      tanninsMgPer100g: 75,
      oxalatesMgPer100g: 26,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Prolonged slow simmering on low heat breaks down protein-phytate linkages.",
      fermentationReductionPct: 52,
      bioavailabilityUpliftDescription: "Whole grain teff retains germ and bran, supplying maximum trace minerals."
    },
    macros: { caloriesKcal: 210, proteinG: 6.4, carbohydratesG: 39.5, fatsG: 3.5, dietaryFiberG: 5.8 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 8.8, bioavailabilityFactor: 1.25, note: "Native red teff iron density" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 145, bioavailabilityFactor: 1.15, note: "Highest amongst all non-dairy porridges" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3.2, bioavailabilityFactor: 1.1, note: "Essential mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Anemia recovery", "Pediatric bone mineralization", "Gluten-sensitive celiac nutrition"],
      bioactiveCompounds: ["Proanthocyanidins", "Resistant retrograded starch", "Arabinoxylans"],
      digestiveTolerance: "Exceptionally gentle; coats gastric walls and promotes steady digestion."
    }
  },
  {
    id: "efct-0133",
    name: "Roasted Sorghum Grain (Eshet Mashila)",
    nameAmharic: "\u12E8\u121B\u123D\u120B \u12A5\u1238\u1275 (\u12E8\u1270\u1320\u1260\u1230)",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0133",
    traditionalPreparation: "Freshly matured heads of lowland sorghum roasted whole over open wood embers until the husk chars and tender grains inside steam in their own moisture.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 44, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 170,
      tanninsMgPer100g: 90,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "High direct wood smoke and radiant ember heat thermalizes polyphenol complexes.",
      fermentationReductionPct: 58,
      bioavailabilityUpliftDescription: "Wood ember roasting imparts smoky phenolic protection against oxidative stress."
    },
    macros: { caloriesKcal: 310, proteinG: 8.5, carbohydratesG: 62, fatsG: 2.8, dietaryFiberG: 8.2 },
    nutrients: [
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 140, bioavailabilityFactor: 1.05, note: "High cellular mineral concentration" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.6, bioavailabilityFactor: 1.1, note: "Drought-resilient grain iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.5, bioavailabilityFactor: 1.05, note: "Trace mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Antioxidant free-radical quenching", "Lowland drought food security", "Sustained athletic energy"],
      bioactiveCompounds: ["3-Deoxyanthocyanidins (apigeninidin, luteolinidin)", "Condensed sorghum tannins"],
      digestiveTolerance: "Slow digesting; provides hours of satiety and prevents insulin spikes."
    }
  },
  {
    id: "efct-0134",
    name: "Himbasha with Raisins (\u12E8\u12D8\u1262\u1265 \u1205\u121D\u1263\u123B)",
    nameAmharic: "\u12E8\u12D8\u1262\u1265 \u1205\u121D\u1263\u123B",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0134",
    traditionalPreparation: "Celebratory Tigrayan leavened bread enriched with sun-dried sweet raisins (zebib), korerima, and black seeds, baked slowly to a golden brown patterned wheel.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 54, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 155,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Extended starter fermentation and oven baking.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Tartaric and malic acids from dried raisins promote non-heme iron solubility."
    },
    macros: { caloriesKcal: 268, proteinG: 7.5, carbohydratesG: 52.8, fatsG: 3.1, dietaryFiberG: 4.6 },
    nutrients: [
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 280, bioavailabilityFactor: 1, note: "Raisin and whole wheat potassium" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.2, bioavailabilityFactor: 1.25, note: "Synergistic mineral uptake" },
      { name: "Boron", symbol: "B", unit: "mcg", amountPer100g: 450, bioavailabilityFactor: 1, note: "Bone density and hormone support" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Holiday sweet treat alternative to refined pastry", "Cardiovascular support", "Natural iron repletion"],
      bioactiveCompounds: ["Resveratrol from raisins", "Korerima monoterpenes", "Thymoquinone"],
      digestiveTolerance: "Sweet and aromatic; very comforting and easy to digest."
    }
  },
  {
    id: "efct-0135",
    name: "Germinated Barley Malt (Bikil) (\u12E8\u1308\u1265\u1235 \u1265\u1245\u120D)",
    nameAmharic: "\u12E8\u1308\u1265\u1235 \u1265\u1245\u120D",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0135",
    traditionalPreparation: "Highland barley steeped in clean water, germinated for 3\u20135 days until acrospires reach 3/4 kernel length, sun-dried on clean grass mats, and stone-milled into enzymatic malt flour.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 48, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 80,
      tanninsMgPer100g: 30,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Germination activates endogenous phytase enzymes that break down >70% of native phytates.",
      fermentationReductionPct: 78,
      bioavailabilityUpliftDescription: "Massive release of active alpha- and beta-amylases converts starch into bioavailable maltose."
    },
    macros: { caloriesKcal: 345, proteinG: 12.5, carbohydratesG: 68, fatsG: 2.2, dietaryFiberG: 8.5 },
    nutrients: [
      { name: "Vitamin B1", symbol: "B1", unit: "mg", amountPer100g: 0.45, bioavailabilityFactor: 1.3, note: "Sprouting quadruples thiamine levels" },
      { name: "Riboflavin", symbol: "B2", unit: "mg", amountPer100g: 0.32, bioavailabilityFactor: 1.3, note: "High bioactivity" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 95, bioavailabilityFactor: 1.35, note: "Enzymatically synthesized" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3.6, bioavailabilityFactor: 1.4, note: "Highly dialyzable" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Catalytic ingredient in all traditional fermentations", "Nutrient-dense convalescent additive", "Enzyme therapy"],
      bioactiveCompounds: ["Free amylases and proteases", "Hordenine", "Ferulic acid esterase"],
      digestiveTolerance: "Aids digestion of surrounding starches in composite foods."
    }
  },
  {
    id: "efct-0136",
    name: "Roasted Maize & Chickpea Kolo (\u12E8\u1260\u1246\u120E\u1293 \u12E8\u123D\u121D\u1265\u122B \u1246\u120E)",
    nameAmharic: "\u12E8\u1260\u1246\u120E\u1293 \u12E8\u123D\u121D\u1265\u122B \u1246\u120E",
    category: "Grains & Cereals",
    sourceRef: "EFCT2025-0136",
    traditionalPreparation: "Tender dried maize kernels and whole chickpeas dry-roasted together on a hot clay metade with coarse salt and bird's eye pepper until fragrant and blistered.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 40, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 195,
      tanninsMgPer100g: 50,
      oxalatesMgPer100g: 16,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Thermal griddle roasting deactivates trypsin and chymotrypsin inhibitors.",
      fermentationReductionPct: 62,
      bioavailabilityUpliftDescription: "Heat treatment optimizes amino acid balance between cereal methionine and pulse lysine."
    },
    macros: { caloriesKcal: 395, proteinG: 13.8, carbohydratesG: 66.5, fatsG: 7.2, dietaryFiberG: 11.5 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 13.8, bioavailabilityFactor: 1, note: "Complementary pulse-cereal protein" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 11.5, bioavailabilityFactor: 1, note: "Substantial colon-cleansing roughage" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 110, bioavailabilityFactor: 1.1, note: "Chickpea folate" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.1, note: "Non-heme mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["High-satiety travel snack", "Stable sustained glycemic fuel", "Oral mastication health"],
      bioactiveCompounds: ["Legume isoflavones", "Corn carotenoids", "Resistant starch"],
      digestiveTolerance: "Satisfying crunch; slow gastric breakdown promotes hours of fullness."
    }
  },
  // ==========================================
  // 2. LEGUMES & PULSES (35 items)
  // ==========================================
  {
    id: "efct-0201",
    name: "Shiro Wot (Spiced Chickpea & Field Pea Stew)",
    nameAmharic: "\u123D\u122E \u12C8\u1325",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0201",
    traditionalPreparation: "Roasted, de-hulled, and seasoned chickpea (Cicer arietinum) and field pea flour slowly simmered with minced red onions, garlic, and berbere.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 34, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 210,
      tanninsMgPer100g: 65,
      oxalatesMgPer100g: 28,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Pre-soaking, thorough sun-drying, dry roasting, and prolonged simmering.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Roasting pulses deactivates hemagglutinins and enhances protein digestibility."
    },
    macros: { caloriesKcal: 180, proteinG: 12.4, carbohydratesG: 22, fatsG: 4.8, dietaryFiberG: 6.2 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 12.4, bioavailabilityFactor: 1, note: "Everyday staple protein source across Ethiopia" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 180, bioavailabilityFactor: 1, note: "Critical maternal and cellular folate" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.1, note: "Pulse non-heme iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.2, bioavailabilityFactor: 1.1, note: "Bioavailable pulse zinc" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 480, bioavailabilityFactor: 1, note: "Cardiovascular electrolyte" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 6.2, bioavailabilityFactor: 1, note: "Soluble legume fiber" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Prenatal folate fortification", "Fasting season protein security", "Cholesterol control"],
      bioactiveCompounds: ["Chickpea isoflavones", "Allium sulfur compounds from garlic/onion"],
      digestiveTolerance: "Traditional roasting significantly reduces flatulence-inducing oligosaccharides (stachyose/raffinose)."
    }
  },
  {
    id: "efct-0202",
    name: "Misir Wot (Spicy Red Lentil Stew)",
    nameAmharic: "\u12E8\u121D\u1235\u122D \u12C8\u1325",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0202",
    traditionalPreparation: "Split de-hulled red lentils (Lens culinaris) simmered in rich berbere paste, red onions, ginger, and garlic into a thick stew.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 31, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 160,
      tanninsMgPer100g: 40,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "De-hulling removes outer seed coats containing the majority of tannins.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "De-hulled split lentils exhibit rapid cooking and minimal mineral chelation."
    },
    macros: { caloriesKcal: 195, proteinG: 14.5, carbohydratesG: 26, fatsG: 3.5, dietaryFiberG: 7.9 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 14.5, bioavailabilityFactor: 1, note: "High lysine pulse protein" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 210, bioavailabilityFactor: 1, note: "Over 50% daily baseline requirement per portion" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5.5, bioavailabilityFactor: 1.15, note: "De-hulled lentil iron" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 7.9, bioavailabilityFactor: 1, note: "Prebiotic colon substrate" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Prenatal neural tube protection", "High-altitude blood regeneration", "Type 2 diabetes glycemic control"],
      bioactiveCompounds: ["Lentil lectin fragments", "Capsaicin from berbere"],
      digestiveTolerance: "Rapidly digestible; lighter on the stomach than un-hulled whole pulses."
    }
  },
  {
    id: "efct-0203",
    name: "Kik Alicha (Mild Yellow Split Pea Stew)",
    nameAmharic: "\u12E8\u12AD\u12AD \u12A0\u120D\u132B \u12C8\u1325",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0203",
    traditionalPreparation: "De-hulled yellow split peas slowly simmered with fresh turmeric (Ird), garlic, ginger, and red onions without chili peppers.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 33, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 170,
      tanninsMgPer100g: 30,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Soaking and prolonged simmering with anti-inflammatory turmeric.",
      fermentationReductionPct: 72,
      bioavailabilityUpliftDescription: "Mild non-acidic preparation optimal for inflamed gastric linings."
    },
    macros: { caloriesKcal: 175, proteinG: 13, carbohydratesG: 25, fatsG: 2.8, dietaryFiberG: 6.8 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 13, bioavailabilityFactor: 1, note: "Gentle pulse protein" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 160, bioavailabilityFactor: 1, note: "Natural dietary folate" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.2, bioavailabilityFactor: 1.1, note: "Plant iron" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 420, bioavailabilityFactor: 1, note: "Cardiovascular balance" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Gastritis and heartburn (chegura)", "Pediatric weaning nutrition", "Convalescent recovery"],
      bioactiveCompounds: ["Curcuminoids from turmeric (Ird)", "Gingerols from ginger"],
      digestiveTolerance: "Exceptionally well tolerated by individuals sensitive to spicy berbere dishes."
    }
  },
  {
    id: "efct-0204",
    name: "Bakela Wot (Highland Fava Bean Stew)",
    nameAmharic: "\u12E8\u1263\u1244\u120B \u12C8\u1325",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0204",
    traditionalPreparation: "Highland fava beans (Vicia faba) soaked, skinned, and cooked into thick hearty stew with onions, ginger, and cardamom.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 36, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 280,
      tanninsMgPer100g: 95,
      oxalatesMgPer100g: 35,
      trypsinInhibitorLevel: "moderate",
      traditionalDegradationMethod: "Overnight soaking and complete manual removal of tough seed coats.",
      fermentationReductionPct: 68,
      bioavailabilityUpliftDescription: "Peeling fava coats eliminates 80% of vicine and convicine glycosides."
    },
    macros: { caloriesKcal: 185, proteinG: 15, carbohydratesG: 24, fatsG: 2.2, dietaryFiberG: 8.5 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 15, bioavailabilityFactor: 1, note: "High biological value plant protein" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 225, bioavailabilityFactor: 1, note: "Abundant natural folate" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5.8, bioavailabilityFactor: 1.1, note: "Fava bean iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.6, bioavailabilityFactor: 1.1, note: "Plant zinc" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Dopaminergic neuro-support (natural L-DOPA precursor)", "Highland muscular endurance"],
      bioactiveCompounds: ["Levodopa (L-DOPA)", "Flavonol glycosides"],
      digestiveTolerance: "Contraindicated in individuals with G6PD deficiency (favism risk)."
    }
  },
  {
    id: "efct-0205",
    name: "Shimbra Asa (Spiced Chickpea Dumplings in Wot)",
    nameAmharic: "\u12E8\u123D\u1295\u1265\u122B \u12D3\u1223",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0205",
    traditionalPreparation: "Seasoned chickpea dough shaped into stylized fish fillets, baked or pan-seared, then simmered in spicy berbere sauce. Celebrated fasting delicacy.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 37, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 195,
      tanninsMgPer100g: 55,
      oxalatesMgPer100g: 22,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Double cooking: baking/frying followed by stew simmering.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Thermal cycle maximizes protein digestibility and reduces flatulence."
    },
    macros: { caloriesKcal: 215, proteinG: 13.5, carbohydratesG: 28, fatsG: 5.8, dietaryFiberG: 7.2 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 13.5, bioavailabilityFactor: 1, note: "Chickpea protein" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.5, bioavailabilityFactor: 1.1, note: "Plant iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.4, bioavailabilityFactor: 1.1, note: "Pulse zinc" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Culinary fasting satisfaction", "Sustained athletic protein"],
      bioactiveCompounds: ["Chickpea saponins", "Capsaicin"],
      digestiveTolerance: "Very satisfying chewy texture without heavy animal fat."
    }
  },
  {
    id: "efct-0206",
    name: "Azifa (Chilled Green Lentil Salad with Mustard)",
    nameAmharic: "\u12A0\u12DA\u134B",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0206",
    traditionalPreparation: "Whole brown/green lentils boiled tender, lightly mashed with Ethiopian brown mustard (Senafich), fresh lime juice, diced red onions, and green chilies.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 29, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 140,
      tanninsMgPer100g: 70,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Boiling followed by acid maceration with fresh lime juice (ascorbic acid).",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Ascorbic acid from fresh lime juice elevates non-heme iron absorption by 2.0x\u20133.0x!"
    },
    macros: { caloriesKcal: 155, proteinG: 11.2, carbohydratesG: 22.5, fatsG: 1.8, dietaryFiberG: 8.2 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 6.2, bioavailabilityFactor: 2.2, note: "Citric & ascorbic acid from lime juice doubles iron absorption" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 24, bioavailabilityFactor: 1, note: "Fresh lime and raw pepper vitamin C" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 175, bioavailabilityFactor: 1, note: "Whole lentil folate" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 8.2, bioavailabilityFactor: 1, note: "High prebiotic roughage" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Rapid nutritional iron replenishment", "Metabolic digestive stimulation via mustard isothiocyanates", "Liver bile flow"],
      bioactiveCompounds: ["Sinigrin from brown mustard (Senafich)", "L-ascorbic acid"],
      digestiveTolerance: "Crisp and invigorating; stimulates digestive secretions."
    }
  },
  {
    id: "efct-0207",
    name: "Nifro (Boiled Mixed Grains & Pulses)",
    nameAmharic: "\u1295\u134D\u122E",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0207",
    traditionalPreparation: "Whole chickpeas, wheat kernels, and fava beans soaked overnight, boiled together with a pinch of salt until plump and tender. Traditional harvest and commemoration dish.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 40, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 220,
      tanninsMgPer100g: 60,
      oxalatesMgPer100g: 25,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Extended 18-hour cold soaking followed by 2-hour slow boiling.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Soaking initiates enzymatic grain germination, reducing phytates."
    },
    macros: { caloriesKcal: 230, proteinG: 12, carbohydratesG: 38, fatsG: 3.2, dietaryFiberG: 10.5 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 10.5, bioavailabilityFactor: 1, note: "Superb whole grain and pulse fiber" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 12, bioavailabilityFactor: 1, note: "Complete complementary amino acids" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.1, note: "Whole seed iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.8, bioavailabilityFactor: 1.1, note: "Germinated zinc" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Chronic constipation & sluggish colon", "Long-lasting physical labor fuel"],
      bioactiveCompounds: ["Resistant starch type 3", "Soluble arabinogalactans"],
      digestiveTolerance: "High roughage; requires adequate water intake."
    }
  },
  {
    id: "efct-0209",
    name: "Siljo (Fermented Fava Bean & Safflower Paste)",
    nameAmharic: "\u1235\u120D\u1306",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0209",
    traditionalPreparation: "Milled fava bean flour cooked with water extracted from safflower (suf) seeds, fermented for 3\u20135 days with mustard seed, garlic, and rue. Highly valued during Lent (Abiy Tsom).",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 30, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 90,
      tanninsMgPer100g: 40,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Multistage fermentation with lactic acid bacteria and mustard essential oils.",
      fermentationReductionPct: 85,
      bioavailabilityUpliftDescription: "Probiotic fermentation eliminates antinutrients and produces functional organic acids."
    },
    macros: { caloriesKcal: 160, proteinG: 11, carbohydratesG: 18, fatsG: 5.5, dietaryFiberG: 6 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 11, bioavailabilityFactor: 1, note: "Fermented fava & seed protein" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 110, bioavailabilityFactor: 1.25, note: "Safflower mineral calcium" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.35, note: "Fermentation liberated iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.5, bioavailabilityFactor: 1.3, note: "Probiotic accessible zinc" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Gut microbiome diversity during strict fasting", "Immune modulation via allyl isothiocyanate"],
      bioactiveCompounds: ["Probiotic Lactobacillus brevis & L. plantarum", "Safflower carthamin"],
      digestiveTolerance: "Pungent and tangy; acts as a powerful digestive stimulant."
    }
  },
  {
    id: "efct-0210",
    name: "Bozena Shiro (Chickpea Stew Simmered with Beef Jerky)",
    nameAmharic: "\u1266\u12D8\u1293 \u123D\u122E",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0210",
    traditionalPreparation: "Spiced chickpea and field pea shiro flour slow-simmered in an earthenware dish with minced cured beef jerky strips (quanta), red onions, garlic, and niter kibbeh.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 36, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 170,
      tanninsMgPer100g: 50,
      oxalatesMgPer100g: 22,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Thermal roasting of shiro flour and multi-hour slow simmer degrades pulse antinutrients.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Heme iron and animal protein in beef accelerate non-heme iron absorption from chickpeas (Meat Factor effect)."
    },
    macros: { caloriesKcal: 235, proteinG: 18.5, carbohydratesG: 21, fatsG: 8.5, dietaryFiberG: 5.8 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 18.5, bioavailabilityFactor: 1.15, note: "Complete pulse and beef protein blend" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 6.2, bioavailabilityFactor: 1.45, note: "Heme + non-heme synergistic assimilation" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3.8, bioavailabilityFactor: 1.35, note: "High bioavailability" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 1.2, bioavailabilityFactor: 1.2, note: "Supplied by cured beef" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Muscle wasting rehabilitation", "Post-fasting protein recovery", "Athletic rebuilding"],
      bioactiveCompounds: ["Carnosine from beef", "Chickpea saponins", "Allium sulfur molecules"],
      digestiveTolerance: "Rich and hearty; comforting and warming to the digestive tract."
    }
  },
  {
    id: "efct-0211",
    name: "Shiro Tegabino (Thick Clay-Pot Sizzling Shiro)",
    nameAmharic: "\u123D\u122E \u1270\u130B\u1262\u1296",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0211",
    traditionalPreparation: "Extra-dense seasoned shiro flour prepared with finely minced shallots and berbere, served furiously bubbling in a heavy glazed clay skillet (diste) drizzled with spiced oil.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 33, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 190,
      tanninsMgPer100g: 55,
      oxalatesMgPer100g: 24,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "High temperature clay bubbling continues thermal breakdown of residual oligosaccharides.",
      fermentationReductionPct: 72,
      bioavailabilityUpliftDescription: "Dense emulsification keeps pulse minerals in suspension for gradual intestinal absorption."
    },
    macros: { caloriesKcal: 210, proteinG: 13.8, carbohydratesG: 23.5, fatsG: 6.8, dietaryFiberG: 6.8 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 13.8, bioavailabilityFactor: 1, note: "High lysine pulse amino acids" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 195, bioavailabilityFactor: 1, note: "Supports DNA synthesis" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5.1, bioavailabilityFactor: 1.15, note: "Liberated pulse iron" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 510, bioavailabilityFactor: 1, note: "Cardiovascular electrolyte" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Everyday plant-based protein security", "Cholesterol management", "Type 2 diabetes glycemic regulation"],
      bioactiveCompounds: ["Legume isoflavonoids", "Berbere capsaicin", "Quercetin from shallots"],
      digestiveTolerance: "Clay pot heat eliminates harsh starch grains; exceptionally smooth mouthfeel."
    }
  },
  {
    id: "efct-0212",
    name: "Hilbet (Whipped Fenugreek & Fava Bean Cream Dip)",
    nameAmharic: "\u1205\u120D\u1260\u1275",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0212",
    traditionalPreparation: "De-hulled highland fava beans (Vicia faba) and fenugreek seeds (abish) soaked for 24h, pulverized fine with garlic, ginger, and wild mustard water (senafich), then hand-whipped vigorously into a cool, frothy white cream dip.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 24, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 95,
      tanninsMgPer100g: 25,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "24-hour steeping and aeration leaches tannins; vigorous whipping aerates enzymes.",
      fermentationReductionPct: 80,
      bioavailabilityUpliftDescription: "Fenugreek galactomannans form a viscous gel that slows glucose uptake and enhances mineral release."
    },
    macros: { caloriesKcal: 145, proteinG: 11.2, carbohydratesG: 18, fatsG: 2.2, dietaryFiberG: 7.5 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 7.5, bioavailabilityFactor: 1, note: "Exceptional soluble galactomannan matrix" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.35, note: "Soaked pulse non-heme iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.8, bioavailabilityFactor: 1.3, note: "Enzymatically freed" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 165, bioavailabilityFactor: 1.1, note: "Pulse maternal nutrition" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Blood glucose blunting in diabetes", "Lactation enhancement in nursing mothers", "Lenten fasting gut comfort"],
      bioactiveCompounds: ["4-Hydroxyisoleucine (insulinotropic)", "Trigonelline", "Diosgenin"],
      digestiveTolerance: "Cooling, silky, and alkaline; relieves heartburn and gastric irritation instantly."
    }
  },
  {
    id: "efct-0213",
    name: "Duba & Kik Wot (Pumpkin and Yellow Split Pea Stew)",
    nameAmharic: "\u12E8\u12F1\u1263\u1293 \u12E8\u12AD\u12AD \u12C8\u1325",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0213",
    traditionalPreparation: "De-hulled yellow split peas simmered slowly until creamy, then combined with sweet cubed pumpkin (duba), fresh turmeric, garlic, and sliced jalape\xF1o.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 35, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 140,
      tanninsMgPer100g: 30,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "De-hulling of peas and prolonged boiling breaks down phytate and lectin networks.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Turmeric curcuminoids and vegetable oils protect vitamins against oxidation."
    },
    macros: { caloriesKcal: 165, proteinG: 9.8, carbohydratesG: 25.5, fatsG: 3.2, dietaryFiberG: 6.4 },
    nutrients: [
      { name: "Beta-Carotene", symbol: "bCar", unit: "mcg", amountPer100g: 1850, bioavailabilityFactor: 1.25, note: "Pro-vitamin A from yellow pumpkin flesh" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 140, bioavailabilityFactor: 1.05, note: "Yellow split pea folate" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 440, bioavailabilityFactor: 1, note: "Electrolyte balance" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Eye health and skin integrity", "Mild hypoallergenic pediatric weaning", "Blood pressure regulation"],
      bioactiveCompounds: ["Curcumin from turmeric", "Lutein & zeaxanthin", "Cucurbitacins"],
      digestiveTolerance: "Sweet, soft, and soothing; ideal for sensitive stomachs."
    }
  },
  {
    id: "efct-0214",
    name: "Defen Misir Alicha (Whole Brown Lentil Mild Stew)",
    nameAmharic: "\u12F5\u134D\u1295 \u121D\u1235\u122D \u12A0\u120D\u132B",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0214",
    traditionalPreparation: "Unpeeled whole highland brown lentils (Lens culinaris) soaked, boiled tender, and gently simmered in a golden turmeric, onion, garlic, and ginger broth without hot peppers.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 29, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 180,
      tanninsMgPer100g: 65,
      oxalatesMgPer100g: 22,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Overnight pre-soaking discards soluble polyphenols; slow simmering softens the intact seed coat.",
      fermentationReductionPct: 68,
      bioavailabilityUpliftDescription: "Preserved lentil seed coats provide dense prebiotic polyphenols and insoluble fiber."
    },
    macros: { caloriesKcal: 175, proteinG: 12.8, carbohydratesG: 26.5, fatsG: 2.8, dietaryFiberG: 8.5 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 8.5, bioavailabilityFactor: 1, note: "High colon-protective seed coat fiber" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.5, bioavailabilityFactor: 1.1, note: "Whole lentil mineral" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 180, bioavailabilityFactor: 1.05, note: "Cellular renewal" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.4, bioavailabilityFactor: 1.1, note: "Immune support" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Constipation prevention and gut microbiome feeding", "Cardiovascular cholesterol reduction", "Gestational diabetes"],
      bioactiveCompounds: ["Flavonols (catechin, epicatechin)", "Curcuminoids", "Prebiotic resistant starch"],
      digestiveTolerance: "Thoroughly pre-soaked whole lentils digest smoothly without heavy bloating."
    }
  },
  {
    id: "efct-0215",
    name: "Defen Misir Qey Wot (Whole Brown Lentil Spicy Stew)",
    nameAmharic: "\u12F5\u134D\u1295 \u121D\u1235\u122D \u1240\u12ED \u12C8\u1325",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0215",
    traditionalPreparation: "Whole unhulled brown lentils cooked in a deep, pungent caramelized shallot and berbere sauce with ginger, garlic, and korerima.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 30, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 175,
      tanninsMgPer100g: 68,
      oxalatesMgPer100g: 24,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Pre-soaking and long reduction in acidic tomato-shallot-berbere paste.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Thermal cooking with berbere extracts fat-soluble bioactives from lentil bran."
    },
    macros: { caloriesKcal: 190, proteinG: 13.2, carbohydratesG: 28, fatsG: 3.5, dietaryFiberG: 8.8 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5.2, bioavailabilityFactor: 1.25, note: "Berbere spices enhance non-heme iron uptake" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 13.2, bioavailabilityFactor: 1, note: "High quality plant protein" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 175, bioavailabilityFactor: 1, note: "Fasting staple folate" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Lenten fasting muscle maintenance", "Iron deficiency anemia management", "Appetite suppression"],
      bioactiveCompounds: ["Capsaicin", "Lentil proanthocyanidins", "1,8-Cineole"],
      digestiveTolerance: "Rich and robust; pair with fermented teff injera for complete protein assimilation."
    }
  },
  {
    id: "efct-0216",
    name: "Adenguare Wot (Red Haricot Bean Stew)",
    nameAmharic: "\u12E8\u12A0\u12F0\u1295\u1313\u122C \u12C8\u1325",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0216",
    traditionalPreparation: "Indigenous Ethiopian kidney/haricot beans (Phaseolus vulgaris) soaked for 18h, boiled until tender, and simmered with red onions, berbere, garlic, and ground false cardamom.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 32, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 185,
      tanninsMgPer100g: 72,
      oxalatesMgPer100g: 30,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Prolonged rolling boil (>30 min) completely destroys phytohaemagglutinin lectins.",
      fermentationReductionPct: 74,
      bioavailabilityUpliftDescription: "Lectins fully neutralized; high potassium-to-sodium ratio supports healthy renal function."
    },
    macros: { caloriesKcal: 195, proteinG: 13.5, carbohydratesG: 29.5, fatsG: 2.8, dietaryFiberG: 9.2 },
    nutrients: [
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 560, bioavailabilityFactor: 1, note: "Superior electrolyte concentration" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.15, note: "Haricot bean iron" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 9.2, bioavailabilityFactor: 1, note: "Resistant starch & soluble pectin" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Hypertension management via natural potassium", "Colon cancer risk reduction", "Prolonged satiety"],
      bioactiveCompounds: ["Anthocyanins from red bean coat", "Phaseolin", "Flavonoids"],
      digestiveTolerance: "Mandatory soaking and full boiling renders beans smooth and gas-free."
    }
  },
  {
    id: "efct-0217",
    name: "Gwaya (Grass Pea) Boiled Nifro",
    nameAmharic: "\u12E8\u1313\u12EB \u1295\u134D\u122E",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0217",
    traditionalPreparation: "Drought-hardy grass peas (Lathyrus sativus) repeatedly steeped in warm water with ash extract or salt, boiled with multiple water changes to leach ODAP neurotoxin, seasoned with sea salt.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 28, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 130,
      tanninsMgPer100g: 45,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Multiple soaking water changes and prolonged boiling leaches >85% of water-soluble ODAP neurotoxin.",
      fermentationReductionPct: 85,
      bioavailabilityUpliftDescription: "Traditional processing detoxifies grass pea into an invaluable protein reserve during dry spells."
    },
    macros: { caloriesKcal: 215, proteinG: 16.8, carbohydratesG: 34, fatsG: 1.6, dietaryFiberG: 8.4 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 16.8, bioavailabilityFactor: 1, note: "Exceptionally high protein density (28% dry weight)" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5.6, bioavailabilityFactor: 1.1, note: "Drought-crop trace iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3.1, bioavailabilityFactor: 1.1, note: "Cellular renewal" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Severe drought food security", "High-protein famine resilience", "Arid soil nitrogen fixation"],
      bioactiveCompounds: ["Homoarginine (nitric oxide precursor)", "Polyphenols"],
      digestiveTolerance: "Safe when processed with traditional soaking and water discard; never consumed as sole continuous diet."
    }
  },
  {
    id: "efct-0218",
    name: "Roasted Chickpeas (Qola Shimbra)",
    nameAmharic: "\u12E8\u1246\u120B \u123D\u121D\u1265\u122B (\u12E8\u1270\u1320\u1260\u1230)",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0218",
    traditionalPreparation: "Whole chickpeas soaked briefly in brine, roasted on hot sand in a concave iron griddle until outer skins blister and kernels turn crisp and nutty.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 32, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 190,
      tanninsMgPer100g: 52,
      oxalatesMgPer100g: 22,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "High temperature conductive sand roasting completely neutralizes trypsin and amylase inhibitors.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Roasting gelatinizes chickpea starch into retrograded resistant starch."
    },
    macros: { caloriesKcal: 380, proteinG: 19.5, carbohydratesG: 58, fatsG: 6.5, dietaryFiberG: 13.5 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 19.5, bioavailabilityFactor: 1, note: "Rich in branched-chain amino acids" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 13.5, bioavailabilityFactor: 1, note: "Soluble and insoluble roughage" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 220, bioavailabilityFactor: 1.1, note: "Exceptional snack folate density" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5.8, bioavailabilityFactor: 1.1, note: "Roasted pulse non-heme iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Portable clean protein snack", "Blood sugar stabilization between meals", "Prebiotic bowel health"],
      bioactiveCompounds: ["Biochanin A", "Formononetin", "Chickpea saponins"],
      digestiveTolerance: "Pleasantly crunchy; chew thoroughly with water to avoid dry satiety."
    }
  },
  {
    id: "efct-0219",
    name: "Boiled Fresh Fava Pods (Bakela Eshet)",
    nameAmharic: "\u12E8\u1263\u1244\u120B \u12A5\u1238\u1275 (\u12E8\u1270\u1240\u1240\u1208)",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0219",
    traditionalPreparation: "Tender, newly harvested green fava bean pods boiled whole in well-salted spring water; eaten by popping succulent beans directly into the mouth.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 34, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 110,
      tanninsMgPer100g: 38,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Fresh young stage contains 60% less antinutrients than mature dry seeds.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Immature green seeds provide native vitamin C that boosts internal iron absorption."
    },
    macros: { caloriesKcal: 118, proteinG: 8.5, carbohydratesG: 18.2, fatsG: 0.9, dietaryFiberG: 6.2 },
    nutrients: [
      { name: "L-DOPA", symbol: "DOPA", unit: "mg", amountPer100g: 185, bioavailabilityFactor: 1.25, note: "Natural dopamine neurotransmitter precursor" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 28, bioavailabilityFactor: 1, note: "Natural ascorbic acid" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 145, bioavailabilityFactor: 1.1, note: "Cellular health" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Neurological dopamine support & mood elevation", "Seasonal fresh harvest vitality", "Hypertension relief"],
      bioactiveCompounds: ["Levodopa (L-DOPA)", "Kaempferol", "Ascorbic acid"],
      digestiveTolerance: "Sweet and tender; far lighter on the digestive tract than dry fava beans."
    }
  },
  {
    id: "efct-0220",
    name: "Gibto (Debittered White Lupin Snack)",
    nameAmharic: "\u12E8\u130D\u1265\u1326 \u12A5\u1238\u1275",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0220",
    traditionalPreparation: "Indigenous highland white lupin seeds (Lupinus albus) roasted, then submerged in flowing river water or soaked with daily water changes for 4\u20137 days to completely leach toxic bitter quinolizidine alkaloids.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 18, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 90,
      tanninsMgPer100g: 25,
      oxalatesMgPer100g: 14,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Multi-day hydraulic leaching washes out bitter lupanine alkaloids completely.",
      fermentationReductionPct: 92,
      bioavailabilityUpliftDescription: "Debittered lupin is the highest plant protein source (up to 44% protein) with near-zero starch."
    },
    macros: { caloriesKcal: 370, proteinG: 36.2, carbohydratesG: 12.5, fatsG: 9.8, dietaryFiberG: 18 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 36.2, bioavailabilityFactor: 1.1, note: "Concentrated essential amino acid profile" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 18, bioavailabilityFactor: 1, note: "Pectinaceous prebiotic matrix" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 190, bioavailabilityFactor: 1.15, note: "Exceptional mineral density" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.25, note: "Immune mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Type 2 diabetes glycemic blunting", "Ketogenic and ultra-low carb protein support", "Hypercholesterolemia control"],
      bioactiveCompounds: ["Gamma-conglutin (potent insulin mimetic)", "Lupin phytosterols"],
      digestiveTolerance: "Satisfying firm chew; zero glycemic spike; suppresses appetite for many hours."
    }
  },
  {
    id: "efct-0221",
    name: "Ful Medames Habesha (Slow-Cooked Fava Dip with Spices)",
    nameAmharic: "\u12E8\u1200\u1260\u123B \u1349\u120D",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0221",
    traditionalPreparation: "Highland fava beans slow-simmered overnight in a copper or clay vessel until buttery soft, lightly crushed with cumin, sea salt, minced shallots, diced jalape\xF1o, and finished with cold-pressed oil or niter kibbeh.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 31, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 120,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 16,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "8\u201312 hour slow simmering thermalizes antinutritional complexes completely.",
      fermentationReductionPct: 78,
      bioavailabilityUpliftDescription: "Crushing cooked beans exposes cellular starch and protein to rapid gastrointestinal absorption."
    },
    macros: { caloriesKcal: 185, proteinG: 11.8, carbohydratesG: 24, fatsG: 5.2, dietaryFiberG: 7.8 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.5, bioavailabilityFactor: 1.2, note: "Slow simmered bioavailable iron" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 190, bioavailabilityFactor: 1.1, note: "Nearly half daily RDA per bowl" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 480, bioavailabilityFactor: 1, note: "Cardiovascular electrolyte" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Breakfast brain fuel & focus", "Sustained athletic morning stamina", "Fasting season muscle preservation"],
      bioactiveCompounds: ["L-DOPA", "Apigenin from shallots", "Cuminaldehyde"],
      digestiveTolerance: "Creamy, smooth, and easily tolerated; commonly eaten with warm sourdough bread."
    }
  },
  {
    id: "efct-0222",
    name: "Misir Fitfit (Chilled Spiced Lentil & Injera Salad)",
    nameAmharic: "\u12E8\u121D\u1235\u122D \u134D\u1275\u134D\u1275",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0222",
    traditionalPreparation: "Slow-cooked red lentil wot allowed to cool, gently folded with torn pieces of cold fermented teff injera, freshly diced red onions, and sliced green peppers; served chilled.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 32, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 150,
      tanninsMgPer100g: 45,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Injera fermentation and lentil cooking combine to minimize chelation.",
      fermentationReductionPct: 76,
      bioavailabilityUpliftDescription: "Retrograded resistant starch forms during cooling, acting as a potent prebiotic."
    },
    macros: { caloriesKcal: 178, proteinG: 8.5, carbohydratesG: 30.5, fatsG: 2.4, dietaryFiberG: 5.8 },
    nutrients: [
      { name: "Resistant Starch", symbol: "RS3", unit: "g", amountPer100g: 3.2, bioavailabilityFactor: 1.3, note: "Cooled starch creates butyrate in colon" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 6.8, bioavailabilityFactor: 1.35, note: "Lentil + fermented teff iron" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 135, bioavailabilityFactor: 1.1, note: "Cellular renewal" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Summer heat hydration and cooling", "Colonic short-chain fatty acid generation", "Gentle fasting digestion"],
      bioactiveCompounds: ["Retrograded starch", "Quercetin from fresh onions", "Capsaicin"],
      digestiveTolerance: "Pleasantly tangy and refreshing; gentle on digestive tract."
    }
  },
  {
    id: "efct-0223",
    name: "Shiro Mitten Blend Flour (\u12E8\u1270\u12D8\u130B\u1300 \u12E8\u123D\u122E \u121D\u1325\u1295 \u12F1\u1244\u1275)",
    nameAmharic: "\u12E8\u1270\u12D8\u130B\u1300 \u12E8\u123D\u122E \u121D\u1325\u1295 \u12F1\u1244\u1275",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0223",
    traditionalPreparation: "De-hulled chickpeas and field peas seasoned with sun-dried garlic, ginger, shallots, korerima, rue, basil, and red pepper, then stone-milled into a fine, shelf-stable golden powder.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 35, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 220,
      tanninsMgPer100g: 60,
      oxalatesMgPer100g: 25,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Pre-soaking of pulses and sun-drying with aromatic antimicrobial spices.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Spice polyphenols protect delicate pulse lipids and amino acids from rancidity."
    },
    macros: { caloriesKcal: 355, proteinG: 21, carbohydratesG: 56, fatsG: 5.5, dietaryFiberG: 14.5 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 21, bioavailabilityFactor: 1, note: "Concentrated dry pulse protein baseline" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 310, bioavailabilityFactor: 1.1, note: "Crucial for maternal health" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 7.2, bioavailabilityFactor: 1.15, note: "Dry legume mineral density" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3.5, bioavailabilityFactor: 1.1, note: "Essential mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["National food security powder", "Immediate protein soup base", "Emergency nutrition storage"],
      bioactiveCompounds: ["Allicin derivatives", "Gingerols", "Korerima cineole"],
      digestiveTolerance: "Ready to cook; expands smoothly in boiling water to create velvety shiro wot."
    }
  },
  {
    id: "efct-0224",
    name: "Sprouted Lentil Salad (\u12E8\u1260\u1240\u1208 \u121D\u1235\u122D \u1230\u120B\u1323)",
    nameAmharic: "\u12E8\u1260\u1240\u1208 \u121D\u1235\u122D \u1230\u120B\u1323",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0224",
    traditionalPreparation: "Whole green lentils steeped in spring water and sprouted for 48 hours until tiny green shoots appear, tossed fresh with lime juice, minced jalape\xF1o, shallots, and cold-pressed niger seed oil.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 25, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 65,
      tanninsMgPer100g: 22,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Germination activates endogenous phytases, degrading >75% of phytic acid naturally.",
      fermentationReductionPct: 82,
      bioavailabilityUpliftDescription: "Vitamin C and bioactive enzymes multiply 4-fold during 48-hour sprout development."
    },
    macros: { caloriesKcal: 125, proteinG: 9.8, carbohydratesG: 18.5, fatsG: 2.2, dietaryFiberG: 6.5 },
    nutrients: [
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 18.5, bioavailabilityFactor: 1.25, note: "De novo synthesized during germination" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.45, note: "Maximum bioavailability unlocked by sprouting" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.6, bioavailabilityFactor: 1.4, note: "Freely bioaccessible" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Cellular rejuvenation and live enzyme therapy", "Anemia reversal without heat loss", "Immune stimulation"],
      bioactiveCompounds: ["Live protease & amylase enzymes", "Polyphenolic stilbenes", "Ascorbic acid"],
      digestiveTolerance: "Crisp and succulent; remarkably light with zero post-prandial heaviness."
    }
  },
  {
    id: "efct-0225",
    name: "Cowpea Stew (Yenugug / Yefoliya Wot)",
    nameAmharic: "\u12E8\u1291\u1309\u130D / \u12E8\u134E\u120A\u12EB \u12C8\u1325",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0225",
    traditionalPreparation: "Lowland cowpeas / black-eyed peas (Vigna unguiculata) soaked and slowly simmered with red onions, garlic, berbere, and ginger into a rich, fragrant pulse stew.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 34, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 160,
      tanninsMgPer100g: 50,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Pre-soaking and long slow simmering dissolves seed-coat oligosaccharides.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "High soluble fiber content normalizes lipid profiles and supports healthy gut microbiota."
    },
    macros: { caloriesKcal: 180, proteinG: 12.2, carbohydratesG: 28, fatsG: 2.2, dietaryFiberG: 7.9 },
    nutrients: [
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 215, bioavailabilityFactor: 1.1, note: "Over half of daily requirement per serving" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.6, bioavailabilityFactor: 1.15, note: "Cowpea non-heme iron" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 88, bioavailabilityFactor: 1.05, note: "Cellular mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Lowland drought nutritional security", "Prenatal neural tube defect prevention", "Cardiovascular wellness"],
      bioactiveCompounds: ["Proanthocyanidins", "Flavonols", "Resistant starch"],
      digestiveTolerance: "Smooth texture; carminative garlic and ginger eliminate intestinal gas."
    }
  },
  {
    id: "efct-0226",
    name: "Soybean & Teff Blend Gruel (\u12E8\u12A0\u12A9\u122A \u12A0\u1270\u122D\u1293 \u1324\u134D \u1219\u12AD)",
    nameAmharic: "\u12E8\u12A0\u12A9\u122A \u12A0\u1270\u122D\u1293 \u1324\u134D \u1219\u12AD",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0226",
    traditionalPreparation: "Roasted, de-hulled soybeans (Glycine max) and teff grains milled into composite flour, slowly boiled into thick nourishing porridge for recovering patients and growing children.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 36, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 210,
      tanninsMgPer100g: 45,
      oxalatesMgPer100g: 22,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Thermal de-hulling, thorough roasting, and boiling destroys Kunitz trypsin inhibitors.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Soybean lysine perfectly complements teff sulfur amino acids, creating near-perfect net protein utilization."
    },
    macros: { caloriesKcal: 220, proteinG: 14.5, carbohydratesG: 28, fatsG: 6.2, dietaryFiberG: 5.5 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 14.5, bioavailabilityFactor: 1.15, note: "Complete PDCAAS score equivalent to animal protein" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 120, bioavailabilityFactor: 1.15, note: "Dual legume-teff mineral base" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5.4, bioavailabilityFactor: 1.2, note: "High dialyzable iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Pediatric protein-energy malnutrition rehabilitation", "Elderly sarcopenia prevention", "Vegan complete nutrition"],
      bioactiveCompounds: ["Soy isoflavones (genistein, daidzein)", "Teff arabinoxylans"],
      digestiveTolerance: "Thorough cooking renders soy velvety and easy on infant and elderly stomachs."
    }
  },
  {
    id: "efct-0227",
    name: "Masho (Mung Bean) Ethiopian Porridge",
    nameAmharic: "\u12E8\u121B\u123E \u1308\u1295\u134E",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0227",
    traditionalPreparation: "Indigenous green mung beans (Vigna radiata) soaked, hulled, cooked to tender porridge consistency, whipped with spiced oil and green herbs.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 30, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 115,
      tanninsMgPer100g: 32,
      oxalatesMgPer100g: 14,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "De-hulling and boiling completely eliminates oligosaccharide gas formers.",
      fermentationReductionPct: 78,
      bioavailabilityUpliftDescription: "Mung bean protein is exceptionally digestible and does not trigger flatulence."
    },
    macros: { caloriesKcal: 175, proteinG: 12, carbohydratesG: 27.5, fatsG: 1.8, dietaryFiberG: 6.8 },
    nutrients: [
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 420, bioavailabilityFactor: 1, note: "Heart-healthy electrolyte" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 82, bioavailabilityFactor: 1.1, note: "Metabolic enzyme cofactor" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.2, bioavailabilityFactor: 1.15, note: "Gentle non-heme iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Post-illness gentle convalescence", "Body cooling during fevers", "Easy protein absorption for ulcers"],
      bioactiveCompounds: ["Vitexin", "Isovitexin", "Antioxidant flavonoids"],
      digestiveTolerance: "Considered the easiest pulse to digest across traditional African and Asian systems."
    }
  },
  {
    id: "efct-0228",
    name: "Bakela Kolo (Cracked Roasted Fava Beans)",
    nameAmharic: "\u12E8\u1263\u1244\u120B \u1246\u120E",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0228",
    traditionalPreparation: "Dry highland fava beans soaked in salted water, de-hulled, split into halves, and slowly dry-roasted on clay pans until deeply crunchy and amber.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 36, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 165,
      tanninsMgPer100g: 40,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "De-hulling removes >80% of fava tannins prior to dry pan roasting.",
      fermentationReductionPct: 72,
      bioavailabilityUpliftDescription: "De-hulled split cotyledons cook quickly and offer high protein availability."
    },
    macros: { caloriesKcal: 365, proteinG: 24.5, carbohydratesG: 55, fatsG: 3.5, dietaryFiberG: 11.2 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 24.5, bioavailabilityFactor: 1, note: "High protein concentration" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 6.2, bioavailabilityFactor: 1.1, note: "Highland fava bean iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3.4, bioavailabilityFactor: 1.1, note: "Trace mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["High-protein fasting work snack", "Travel nourishment", "Sustained satiety"],
      bioactiveCompounds: ["Fava isoflavones", "Phytosterols"],
      digestiveTolerance: "Crunchy and dry; best enjoyed with warm tea or coffee."
    }
  },
  {
    id: "efct-0229",
    name: "White Haricot Beans with Tomato & Garlic",
    nameAmharic: "\u12E8\u1290\u132D \u12A0\u12F0\u1295\u1313\u122C \u12C8\u1325",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0229",
    traditionalPreparation: "Small white haricot navy beans soaked overnight, boiled tender, and simmered in a fragrant sauce of vine-ripened tomatoes, minced garlic, turmeric, and fresh green chili.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 31, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 155,
      tanninsMgPer100g: 30,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Pre-soaking and long boiling dissolves phaseolin lectins completely.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Tomato lycopene and vitamin C significantly elevate iron absorption."
    },
    macros: { caloriesKcal: 175, proteinG: 11.5, carbohydratesG: 28.5, fatsG: 2.2, dietaryFiberG: 8.8 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.3, note: "Vitamin C boosted absorption" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 8.8, bioavailabilityFactor: 1, note: "Soluble prebiotic fiber" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 160, bioavailabilityFactor: 1.05, note: "Essential B-vitamin" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Cardiovascular LDL cholesterol reduction", "Colon health", "Hypoallergenic fasting staple"],
      bioactiveCompounds: ["Lycopene", "Allicin", "Phaseolamin (alpha-amylase inhibitor)"],
      digestiveTolerance: "Tender and flavorful; white beans are softer than dark beans."
    }
  },
  {
    id: "efct-0230",
    name: "Azifa with Toasted Sesame (\u12E8\u1230\u120A\u1325 \u12A0\u12DA\u134B)",
    nameAmharic: "\u12E8\u1230\u120A\u1325 \u12A0\u12DA\u134B",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0230",
    traditionalPreparation: "Tender boiled green lentils lightly mashed with fresh lime juice, Ethiopian brown mustard paste (senafich), jalape\xF1o, and enriched with stone-ground toasted sesame paste.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 27, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 140,
      tanninsMgPer100g: 45,
      oxalatesMgPer100g: 22,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Lentil boiling and cold acidulation with fresh lime juice degrades phytate bindings.",
      fermentationReductionPct: 74,
      bioavailabilityUpliftDescription: "Sesame methionine complements lentil lysine; sesame calcium elevates overall mineral score."
    },
    macros: { caloriesKcal: 215, proteinG: 12.8, carbohydratesG: 22, fatsG: 8.5, dietaryFiberG: 7.2 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 165, bioavailabilityFactor: 1.2, note: "High calcium from whole toasted sesame paste" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5.4, bioavailabilityFactor: 1.4, note: "Lime juice ascorbic acid triples iron uptake" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 15, bioavailabilityFactor: 1, note: "Fresh lime juice" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Plant-based bone mineralization during fasting", "Anemia support", "Antioxidant liver support"],
      bioactiveCompounds: ["Sesamol & sesamolin", "Sinigrin from mustard", "Lentil polyphenols"],
      digestiveTolerance: "Tangy, cool, and stimulating; mustard promotes gastric digestive juices."
    }
  },
  {
    id: "efct-0231",
    name: "Fermented Chickpea Flatcake (\u12E8\u123D\u121D\u1265\u122B \u1242\u1323)",
    nameAmharic: "\u12E8\u123D\u121D\u1265\u122B \u1242\u1323",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0231",
    traditionalPreparation: "Stone-ground chickpea flour mixed with water, garlic, and wild yeast starter, allowed to ferment for 12\u201324h into a tangy batter, poured onto an oiled metade and cooked until golden crisp.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 34, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 110,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "24h spontaneous fermentation degrades >65% of native phytates.",
      fermentationReductionPct: 76,
      bioavailabilityUpliftDescription: "Lactic acid bacteria synthesize B-vitamins and liberate chelated zinc and iron."
    },
    macros: { caloriesKcal: 235, proteinG: 13.5, carbohydratesG: 34, fatsG: 4.8, dietaryFiberG: 7.2 },
    nutrients: [
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.8, bioavailabilityFactor: 1.35, note: "Freed by pulse lactic fermentation" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.6, bioavailabilityFactor: 1.3, note: "Bioavailable pulse mineral" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 185, bioavailabilityFactor: 1.2, note: "Fermentation enriched" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Grain-free low-carb fasting bread substitute", "Celiac safe nutrition", "Gut microbiome feeding"],
      bioactiveCompounds: ["Lactic acid", "Resistant starch", "Chickpea saponins"],
      digestiveTolerance: "Fermentation completely eliminates oligosaccharide gas; very light on the digestive system."
    }
  },
  {
    id: "efct-0232",
    name: "Roasted Field Peas (Yegayso Ater Kolo)",
    nameAmharic: "\u12E8\u12A0\u1270\u122D \u1246\u120E",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0232",
    traditionalPreparation: "Highland yellow and green field peas (Pisum sativum) parched over glowing embers in an iron pot with a dash of salt and ginger.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 35, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 175,
      tanninsMgPer100g: 48,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Dry heat ember roasting deactivates pulse digestive enzyme blockers.",
      fermentationReductionPct: 62,
      bioavailabilityUpliftDescription: "Whole roasted field peas preserve intact resistant starch matrices."
    },
    macros: { caloriesKcal: 375, proteinG: 22, carbohydratesG: 61, fatsG: 2.5, dietaryFiberG: 14 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 14, bioavailabilityFactor: 1, note: "Top-tier dietary roughage" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 22, bioavailabilityFactor: 1, note: "High lysine pulse protein" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5.1, bioavailabilityFactor: 1.1, note: "Field pea mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Satiety and weight management", "Diabetic snacking", "Colonic motility support"],
      bioactiveCompounds: ["Pea saponins", "Phytic acid breakdown metabolites", "Phenolics"],
      digestiveTolerance: "Hard crunch; chew slowly to promote salivary enzyme mixing."
    }
  },
  {
    id: "efct-0233",
    name: "Shiro Felfel (Whole Chickpea & Split Pea Stew)",
    nameAmharic: "\u123D\u122E \u1348\u120D\u1348\u120D",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0233",
    traditionalPreparation: "Traditional textured stew combining finely stone-ground shiro flour with whole pre-cooked chickpeas and yellow split peas in rich berbere sauce.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 32, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 180,
      tanninsMgPer100g: 50,
      oxalatesMgPer100g: 22,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Pre-cooking whole legumes and long simmer of shiro flour.",
      fermentationReductionPct: 74,
      bioavailabilityUpliftDescription: "Dual texture delivers both rapid gastric release and sustained intestinal fermentation."
    },
    macros: { caloriesKcal: 195, proteinG: 13, carbohydratesG: 26, fatsG: 4.8, dietaryFiberG: 7.5 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 13, bioavailabilityFactor: 1, note: "Complete plant protein" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 175, bioavailabilityFactor: 1.05, note: "Cellular renewal" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.9, bioavailabilityFactor: 1.15, note: "Bioaccessible iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Hearty fasting main dish", "Muscle recovery", "Blood glucose blunting"],
      bioactiveCompounds: ["Legume flavonoids", "Berbere carotenoids", "Shallot allium compounds"],
      digestiveTolerance: "Rich mouthfeel; whole legumes provide satisfying chew."
    }
  },
  {
    id: "efct-0234",
    name: "Pigeon Pea Stew (Yeyeweyin Ater Wot)",
    nameAmharic: "\u12E8\u12C8\u12ED\u1295 \u12A0\u1270\u122D \u12C8\u1325",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0234",
    traditionalPreparation: "Drought-resilient pigeon peas (Cajanus cajan) cultivated in Rift Valley valleys, soaked, split, and cooked into savory berbere stew with ginger and garlic.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 33, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 165,
      tanninsMgPer100g: 55,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Pre-soaking and prolonged boiling reduces antinutrients by over 70%.",
      fermentationReductionPct: 72,
      bioavailabilityUpliftDescription: "High sulfur amino acid content supports liver detoxification pathways."
    },
    macros: { caloriesKcal: 185, proteinG: 13.8, carbohydratesG: 27.5, fatsG: 2.2, dietaryFiberG: 8.1 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 13.8, bioavailabilityFactor: 1, note: "Sulfur-rich pigeon pea protein" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 95, bioavailabilityFactor: 1.1, note: "Cellular hydration" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.4, bioavailabilityFactor: 1.15, note: "Trace mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Lowland food security", "Cardiovascular support", "Liver phase II detoxification"],
      bioactiveCompounds: ["Cajanin", "Isoflavones", "Stilbenes"],
      digestiveTolerance: "Pleasant nutty flavor; easily digestible when well-cooked."
    }
  },
  {
    id: "efct-0235",
    name: "Lupine Flour Flatbread (\u12E8\u130D\u1265\u1326 \u1242\u1323)",
    nameAmharic: "\u12E8\u130D\u1265\u1326 \u1242\u1323",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0235",
    traditionalPreparation: "Water-debittered white lupine flour kneaded with a touch of teff and flaxseed, baked crisp on a clay griddle into an ultra-low carbohydrate flatbread.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 20, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 85,
      tanninsMgPer100g: 20,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Aqueous leaching followed by griddle baking.",
      fermentationReductionPct: 88,
      bioavailabilityUpliftDescription: "Ultra-low starch content makes it virtually invisible to blood glucose spikes."
    },
    macros: { caloriesKcal: 255, proteinG: 22.5, carbohydratesG: 14, fatsG: 7.2, dietaryFiberG: 12.5 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 22.5, bioavailabilityFactor: 1.1, note: "Over 35% protein dry matter" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 12.5, bioavailabilityFactor: 1, note: "Lupin cell-wall polysaccharides" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3.2, bioavailabilityFactor: 1.25, note: "Cellular renewal" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Diabetic glycemic normalization", "Medical weight loss", "Insulin resistance management"],
      bioactiveCompounds: ["Gamma-conglutin", "Phytosterols", "Lupin peptides"],
      digestiveTolerance: "Dense and satisfying; two small pieces provide hours of hunger satisfaction."
    }
  },
  {
    id: "efct-0236",
    name: "Bambara Groundnut Boiled Kernels (\u12E8\u1266\u121D\u1266\u122A \u12A0\u1270\u122D)",
    nameAmharic: "\u12E8\u1266\u121D\u1266\u122A \u12A0\u1270\u122D",
    category: "Legumes & Pulses",
    sourceRef: "EFCT2025-0236",
    traditionalPreparation: "Subterranean legume kernels (Vigna subterranea) cultivated in Western Ethiopia, soaked overnight and boiled tender in salted water with coriander seeds.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 31, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 145,
      tanninsMgPer100g: 40,
      oxalatesMgPer100g: 16,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Overnight soaking and boiling deactivates native protease inhibitors.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Balanced complete food with 60% carbohydrate, 20% protein, and 6% healthy fats."
    },
    macros: { caloriesKcal: 245, proteinG: 12.8, carbohydratesG: 38, fatsG: 4.8, dietaryFiberG: 7.5 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.15, note: "Subterranean seed iron" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 490, bioavailabilityFactor: 1, note: "Cardiovascular electrolyte" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 110, bioavailabilityFactor: 1.1, note: "High cellular mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["All-in-one balanced survival nutrition", "Endurance athletic energy", "Childhood growth"],
      bioactiveCompounds: ["Flavonoids", "Plant sterols", "Resistant starch"],
      digestiveTolerance: "Pleasantly sweet and nutty; very easy on the stomach."
    }
  },
  // ==========================================
  // 3. ROOTS & TUBERS (22 items)
  // ==========================================
  {
    id: "efct-0301",
    name: "Kocho (Underground Pit-Fermented Enset Bread)",
    nameAmharic: "\u1246\u132E",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0301",
    traditionalPreparation: "Scraped pseudo-stem and pulverized corm of Ensete ventricosum fermented in underground earthen pits for 3 to 12 months, kneaded and baked over hot clay griddles.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 46, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 40,
      tanninsMgPer100g: 30,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Multi-month anaerobic earthen pit fermentation destroys volatile bitter glycosides.",
      fermentationReductionPct: 90,
      bioavailabilityUpliftDescription: "Pit fermentation produces abundant butyrate, acetate, and propionate short-chain fatty acids."
    },
    macros: { caloriesKcal: 195, proteinG: 1.8, carbohydratesG: 45, fatsG: 0.5, dietaryFiberG: 5.8 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 160, bioavailabilityFactor: 1.2, note: "Mineral-rich soil-derived calcium" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 5.8, bioavailabilityFactor: 1, note: "Prebiotic resistant enset fiber" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 380, bioavailabilityFactor: 1, note: "Cellular potassium" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 1.2, bioavailabilityFactor: 1.1, note: "Trace mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Irritable bowel syndrome (IBS) and mucosal inflammation", "Caloric resilience against drought", "Gastric lining repair"],
      bioactiveCompounds: ["Enset beta-sitosterol", "Butyric acid fermentation products"],
      digestiveTolerance: "Soothing and demulcent; traditionally given to comfort abdominal irritation."
    }
  },
  {
    id: "efct-0302",
    name: "Bulla Porridge",
    nameAmharic: "\u12E8\u1261\u120B \u1308\u1295\u134E",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0302",
    traditionalPreparation: "Refined liquid squeezed from fresh enset pulp, decanted, sun-dried into pure white starch, and cooked into silky porridge with milk or niter kibbeh.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 54, rating: "medium" },
    antinutrients: {
      phyticAcidMgPer100g: 20,
      tanninsMgPer100g: 15,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Decanting and water washing washes away soluble antinutrients.",
      fermentationReductionPct: 92,
      bioavailabilityUpliftDescription: "Near-pure digestible starch with exceptionally low antinutritional interference."
    },
    macros: { caloriesKcal: 210, proteinG: 1.2, carbohydratesG: 49, fatsG: 0.3, dietaryFiberG: 3.2 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 185, bioavailabilityFactor: 1.15, note: "Traditional postpartum recovery food" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 3.2, bioavailabilityFactor: 1, note: "Gentle enset starch" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 2.1, bioavailabilityFactor: 1, note: "Trace iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Postpartum maternal recovery", "Acute gastritis relief", "Pediatric convalescence"],
      bioactiveCompounds: ["Easily assimilable amylopectin"],
      digestiveTolerance: "The gentlest traditional food in Ethiopian medicine; zero mechanical or chemical irritation."
    }
  },
  {
    id: "efct-0303",
    name: "Taro / Godere (Boiled Highland Colocasia)",
    nameAmharic: "\u130E\u12F0\u122C",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0303",
    traditionalPreparation: "Highland taro corms (Colocasia esculenta) thoroughly boiled with salt and mild spices until needle-like calcium oxalate raphides are completely dissolved.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 48, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 65,
      tanninsMgPer100g: 25,
      oxalatesMgPer100g: 140,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Prolonged boiling in abundant water with water discarded neutralizes soluble oxalates.",
      fermentationReductionPct: 85,
      bioavailabilityUpliftDescription: "Boiling destroys calcium oxalate needle crystals, making root safe and nourishing."
    },
    macros: { caloriesKcal: 142, proteinG: 2.1, carbohydratesG: 34, fatsG: 0.2, dietaryFiberG: 5.1 },
    nutrients: [
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 590, bioavailabilityFactor: 1, note: "Exceptionally high potassium" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 33, bioavailabilityFactor: 1, note: "Tuber magnesium" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 5.1, bioavailabilityFactor: 1, note: "Resistant tuber starch" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 43, bioavailabilityFactor: 1, note: "Bioavailable post-boiling" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Hypertension management (high potassium-to-sodium ratio)", "Colon health"],
      bioactiveCompounds: ["Water-soluble mucilage polysaccharides"],
      digestiveTolerance: "Must be thoroughly boiled; never consume raw."
    }
  },
  {
    id: "efct-0304",
    name: "Sweet Potato (Sukar Dinich)",
    nameAmharic: "\u12E8\u1235\u12B3\u122D \u12F5\u1295\u127D",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0304",
    traditionalPreparation: "Orange and yellow fleshed sweet potato tubers (Ipomoea batatas) boiled or roasted over embers.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 50, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 35,
      tanninsMgPer100g: 15,
      oxalatesMgPer100g: 28,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Boiling and roasting.",
      fermentationReductionPct: 50,
      bioavailabilityUpliftDescription: "Thermal cooking unlocks beta-carotene into easily micellized form."
    },
    macros: { caloriesKcal: 110, proteinG: 1.8, carbohydratesG: 25.5, fatsG: 0.2, dietaryFiberG: 3.5 },
    nutrients: [
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 780, bioavailabilityFactor: 1.25, note: "Rich pro-vitamin A beta-carotene" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 19.5, bioavailabilityFactor: 0.85, note: "Tuber vitamin C" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 337, bioavailabilityFactor: 1, note: "Cardiac electrolyte" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 3.5, bioavailabilityFactor: 1, note: "Soluble dietary fiber" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Pediatric vitamin A deficiency prevention", "Immune mucosal barrier integrity"],
      bioactiveCompounds: ["Trans-beta-carotene", "Chlorogenic acids"],
      digestiveTolerance: "Easily digestible and naturally sweet."
    }
  },
  {
    id: "efct-0305",
    name: "Oromo Dinicha (Plectranthus edulis)",
    nameAmharic: "\u12E8\u12A6\u122E\u121E \u12F5\u1295\u127D",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0305",
    traditionalPreparation: "Indigenous Ethiopian tuber cultivated in the highlands of Oromia and Southern Ethiopia, boiled with salt.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 45, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 45,
      tanninsMgPer100g: 30,
      oxalatesMgPer100g: 22,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Boiling in salted water.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Gentle boiling leaches trace bitter glycosides."
    },
    macros: { caloriesKcal: 125, proteinG: 2.4, carbohydratesG: 28, fatsG: 0.3, dietaryFiberG: 4.2 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 72, bioavailabilityFactor: 1.1, note: "High tuber calcium" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.8, bioavailabilityFactor: 1.1, note: "Indigenous tuber iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 1.8, bioavailabilityFactor: 1.1, note: "Trace mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Indigenous agrobiodiversity conservation", "Slow-release carbohydrate energy"],
      bioactiveCompounds: ["Terpenoid glycosides", "Tuber inulin"],
      digestiveTolerance: "Mild pleasant earthy flavor; highly filling."
    }
  },
  {
    id: "efct-0306",
    name: "Anchote Boiled Tuber (\u12A0\u1295\u132E\u1274)",
    nameAmharic: "\u12A0\u1295\u132E\u1274",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0306",
    traditionalPreparation: "Indigenous Western Oromo root crop (Coccinia abessinica) boiled with skin intact to preserve micronutrients, peeled, and mashed or sliced with garlic, salt, and spiced butter or oil.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 38, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 45,
      tanninsMgPer100g: 18,
      oxalatesMgPer100g: 28,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Boiling unpeeled tuber dissolves surface oxalates and hydrolyzes complex saponins.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Anchote contains the highest natural calcium density among all known root vegetables worldwide (>300mg/100g)."
    },
    macros: { caloriesKcal: 112, proteinG: 3.2, carbohydratesG: 23.5, fatsG: 0.3, dietaryFiberG: 4.8 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 345, bioavailabilityFactor: 1.3, note: "World-record calcium density in a tuber" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5.5, bioavailabilityFactor: 1.25, note: "Exceptional bioavailable tuber iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.4, bioavailabilityFactor: 1.2, note: "Bone mineral matrix" },
      { name: "Phosphorus", symbol: "P", unit: "mg", amountPer100g: 180, bioavailabilityFactor: 1, note: "Synergistic calcium phosphate deposition" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Bone fracture rapid consolidation", "Postpartum maternal bone remineralization", "Childhood skeletal development"],
      bioactiveCompounds: ["Cucurbitacins", "Saponins with anti-inflammatory activity", "Mucilage"],
      digestiveTolerance: "Pleasantly sweet and velvety; highly revered in Oromo medicine for skeletal and joint recovery."
    }
  },
  {
    id: "efct-0307",
    name: "Dinich Alicha Wot (Mild Potato & Carrot Stew)",
    nameAmharic: "\u12E8\u12F5\u1295\u127D \u12A0\u120D\u132B \u12C8\u1325",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0307",
    traditionalPreparation: "Highland potatoes (Solanum tuberosum) peeled, cubed, and slowly simmered with sliced sweet carrots, red onions, garlic, ginger, and turmeric broth.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 58, rating: "medium" },
    antinutrients: {
      phyticAcidMgPer100g: 25,
      tanninsMgPer100g: 10,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Peeling and boiling eliminates potato solanine glycoalkaloids.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Turmeric and vegetable oils enhance carotenoid uptake from carrots."
    },
    macros: { caloriesKcal: 110, proteinG: 2.2, carbohydratesG: 22, fatsG: 2.1, dietaryFiberG: 3.1 },
    nutrients: [
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 420, bioavailabilityFactor: 1, note: "High potato potassium" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 16.5, bioavailabilityFactor: 1, note: "Potato ascorbic acid" },
      { name: "Beta-Carotene", symbol: "bCar", unit: "mcg", amountPer100g: 1450, bioavailabilityFactor: 1.25, note: "Carrot pro-vitamin A" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Everyday comforting fasting meal", "Gentle pediatric meal", "Gastric ulcer soothing"],
      bioactiveCompounds: ["Curcumin", "Carotenoids", "Quercetin"],
      digestiveTolerance: "Soft, comforting, and very easily digested by young children and elderly adults."
    }
  },
  {
    id: "efct-0308",
    name: "Dinich Qey Wot (Spicy Potato Stew with Berbere)",
    nameAmharic: "\u12E8\u12F5\u1295\u127D \u1240\u12ED \u12C8\u1325",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0308",
    traditionalPreparation: "Cubed highland potatoes simmered in a dense, rich caramelized onion and berbere paste with garlic, ginger, and korerima.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 56, rating: "medium" },
    antinutrients: {
      phyticAcidMgPer100g: 30,
      tanninsMgPer100g: 20,
      oxalatesMgPer100g: 14,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Slow simmering in spiced acidic sauce.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Berbere capsaicin accelerates metabolic rate and promotes circulation."
    },
    macros: { caloriesKcal: 125, proteinG: 2.6, carbohydratesG: 23.5, fatsG: 2.8, dietaryFiberG: 3.4 },
    nutrients: [
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 440, bioavailabilityFactor: 1, note: "Electrolyte support" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 18, bioavailabilityFactor: 1, note: "Potato + berbere pepper vitamin C" },
      { name: "Vitamin B6", symbol: "B6", unit: "mg", amountPer100g: 0.28, bioavailabilityFactor: 1, note: "Neurological health" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Warming energy during cold highland rainy season (Kiremt)", "Low-cost high-energy staple", "Circulatory stimulation"],
      bioactiveCompounds: ["Capsaicin", "Chlorogenic acid", "Allium sulfides"],
      digestiveTolerance: "Spicy yet comforting; pairs wonderfully with fermented injera."
    }
  },
  {
    id: "efct-0309",
    name: "Roasted Kocho Flatbread with Kibbeh (\u12E8\u1245\u1264 \u1246\u132E)",
    nameAmharic: "\u12E8\u1245\u1264 \u1246\u132E",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0309",
    traditionalPreparation: "Pit-fermented enset pulp (kocho) chopped fine with traditional wooden knives, kneaded with water, wrapped in banana leaves, baked over clay griddles, and generously basted with hot spiced niter kibbeh.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 45, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 30,
      tanninsMgPer100g: 15,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Months-long underground anaerobic pit fermentation hydrolyzes virtually all antinutrients.",
      fermentationReductionPct: 88,
      bioavailabilityUpliftDescription: "Enset pit lactic fermentation makes starch retrograded and extremely resistant to blood sugar spikes."
    },
    macros: { caloriesKcal: 275, proteinG: 2.1, carbohydratesG: 46, fatsG: 10.2, dietaryFiberG: 5.8 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 85, bioavailabilityFactor: 1.25, note: "Fermented enset mineral" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.8, bioavailabilityFactor: 1.35, note: "Bioavailable liberated iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 1.8, bioavailabilityFactor: 1.3, note: "Microbially accessible" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Bone fracture recovery (Gurage traditional protocol with kitfo)", "Ulcer and gastritis mucosal soothing", "Long-lasting fullness"],
      bioactiveCompounds: ["Short chain fatty acids (acetate, propionate)", "Enset resistant starch", "Kibbeh butyrate"],
      digestiveTolerance: "Supreme digestive calm; eliminates stomach acidity and coats gastric walls."
    }
  },
  {
    id: "efct-0310",
    name: "Bulla Atmit (Silky Enset Starch Gruel)",
    nameAmharic: "\u12E8\u1261\u120B \u12A0\u1325\u121A\u1275",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0310",
    traditionalPreparation: "Refined, decanted, and sun-dried white enset starch (bulla) cooked gently in boiling water or milk with crushed cardamom, ginger, and honey into a smooth, translucent medicinal gruel.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 48, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 15,
      tanninsMgPer100g: 8,
      oxalatesMgPer100g: 5,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Water decantation and sun drying washes away all soluble antinutritional salts.",
      fermentationReductionPct: 92,
      bioavailabilityUpliftDescription: "Pure refined enset starch delivers near-instant, non-irritating calories to exhausted gut walls."
    },
    macros: { caloriesKcal: 140, proteinG: 1.2, carbohydratesG: 32.5, fatsG: 0.8, dietaryFiberG: 1.8 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 65, bioavailabilityFactor: 1.3, note: "Clean mineral assimilation" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 35, bioavailabilityFactor: 1.2, note: "Gentle muscular relaxant" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 2.2, bioavailabilityFactor: 1.3, note: "Assimilation without constipation" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Post-partum mother recovery (traditional Arsi & Gurage protocol)", "Severe diarrhea and dysentery rehydration", "Weaning food for delicate infants"],
      bioactiveCompounds: ["Soluble amylose-amylopectin matrix", "Demulcent enset polysaccharides"],
      digestiveTolerance: "The gentlest known food in Ethiopian medical traditions; requires zero mechanical digestion."
    }
  },
  {
    id: "efct-0311",
    name: "Godere Fried Chips (Crisp Highland Taro)",
    nameAmharic: "\u12E8\u130E\u12F0\u122C \u1325\u1265\u1235",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0311",
    traditionalPreparation: "Highland taro corms (Colocasia esculenta) thoroughly parboiled in salted water to dissolve calcium oxalate raphides, sliced thin, and fried crisp in vegetable oil, dusted with mitmita.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 46, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 35,
      tanninsMgPer100g: 15,
      oxalatesMgPer100g: 22,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Parboiling in salt water eliminates acrid raphide needles prior to frying.",
      fermentationReductionPct: 82,
      bioavailabilityUpliftDescription: "Cooking gelatinizes taro's extremely small starch granules for easy assimilation."
    },
    macros: { caloriesKcal: 265, proteinG: 2.8, carbohydratesG: 44, fatsG: 8.8, dietaryFiberG: 5.4 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 5.4, bioavailabilityFactor: 1, note: "High resistant starch and soluble mucilage" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 520, bioavailabilityFactor: 1, note: "Higher than conventional potato" },
      { name: "Vitamin E", symbol: "VitE", unit: "mg", amountPer100g: 2.8, bioavailabilityFactor: 1, note: "Lipid antioxidant" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Clean energy snack", "High potassium electrolyte reload", "Gluten-free starch alternative"],
      bioactiveCompounds: ["Taro mucilage", "Phenolics", "Retrograded starch"],
      digestiveTolerance: "Crisp outside and fluffy inside; parboiling ensures zero throat scratchiness."
    }
  },
  {
    id: "efct-0312",
    name: "Boiled Cassava / Yuca (\u12E8\u12AB\u1233\u126B \u1235\u122D)",
    nameAmharic: "\u12E8\u12AB\u1233\u126B \u1235\u122D (\u12E8\u1270\u1240\u1240\u1208)",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0312",
    traditionalPreparation: "Sweet cassava roots (Manihot esculenta) cultivated in Southwestern Ethiopia peeled deeply, chopped into logs, boiled vigorously in open pots to volatilize cyanogenic glycosides, seasoned with salt and lime.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 50, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 40,
      tanninsMgPer100g: 12,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Deep peeling of cortex and open-lid boiling eliminates >95% of volatile cyanogenic linamarin.",
      fermentationReductionPct: 95,
      bioavailabilityUpliftDescription: "Thorough boiling transforms tough cassava into pure digestible energy."
    },
    macros: { caloriesKcal: 160, proteinG: 1.4, carbohydratesG: 38, fatsG: 0.3, dietaryFiberG: 2.4 },
    nutrients: [
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 20.5, bioavailabilityFactor: 1, note: "Natural tuber ascorbic acid" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 28, bioavailabilityFactor: 1, note: "Essential B-vitamin" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 270, bioavailabilityFactor: 1, note: "Hydration balance" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Lowland food security", "High-carbohydrate athletic loading", "Low-allergen staple"],
      bioactiveCompounds: ["Resistant starch", "Anthocyanins (in colored varieties)"],
      digestiveTolerance: "Tender and starchy; easy on the digestive tract when cooked fully."
    }
  },
  {
    id: "efct-0313",
    name: "Yams of Southern Ethiopia (Boyer / Boyena)",
    nameAmharic: "\u1266\u12EC / \u1266\u12EC\u1293",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0313",
    traditionalPreparation: "Indigenous highland and mid-altitude wild/domesticated yams (Dioscorea abyssinica) harvested from Gamo and Wolayta valleys, peeled, sliced, and slow-steamed over enset leaf racks.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 44, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 50,
      tanninsMgPer100g: 20,
      oxalatesMgPer100g: 16,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Leaf-steaming and long thermal cook breaks down dioscorine alkaloid traces.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Dioscorea yams deliver steroidal saponins that support adrenal and hormonal balance."
    },
    macros: { caloriesKcal: 118, proteinG: 2, carbohydratesG: 27.5, fatsG: 0.2, dietaryFiberG: 4.2 },
    nutrients: [
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 670, bioavailabilityFactor: 1, note: "Exceptional cardiovascular potassium density" },
      { name: "Vitamin B6", symbol: "B6", unit: "mg", amountPer100g: 0.29, bioavailabilityFactor: 1, note: "Homocysteine regulation" },
      { name: "Manganese", symbol: "Mn", unit: "mg", amountPer100g: 0.4, bioavailabilityFactor: 1.1, note: "Antioxidant enzyme cofactor" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Hormonal balance and menopausal symptom relief", "Severe hypertension control", "Clean ancestral carbohydrate source"],
      bioactiveCompounds: ["Diosgenin", "Allantoin", "Dioscorin"],
      digestiveTolerance: "Moist, slightly fibrous, and deeply satiating; prevents rapid insulin surges."
    }
  },
  {
    id: "efct-0314",
    name: "Roasted Sweet Potato with Spiced Flax Dip",
    nameAmharic: "\u12E8\u1235\u12B3\u122D \u12F5\u1295\u127D\u1293 \u12E8\u1270\u120D\u1263 \u121B\u1263\u12EB",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0314",
    traditionalPreparation: "Orange-fleshed sweet potato (Sukar Dinich) slow-roasted in hearth embers until caramelized, served alongside a savory dip of toasted ground flaxseed, lime, and jalape\xF1o.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 44, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 65,
      tanninsMgPer100g: 20,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Thermal ember roasting hydrolyzes antinutrients and converts maltose.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Flaxseed healthy fats increase beta-carotene absorption from orange sweet potato by 300%."
    },
    macros: { caloriesKcal: 195, proteinG: 4.5, carbohydratesG: 32, fatsG: 5.8, dietaryFiberG: 6.2 },
    nutrients: [
      { name: "Beta-Carotene", symbol: "bCar", unit: "mcg", amountPer100g: 8500, bioavailabilityFactor: 1.45, note: "Over 100% daily Vitamin A requirement via natural carotenoids" },
      { name: "Omega-3", symbol: "ALA", unit: "g", amountPer100g: 1.6, bioavailabilityFactor: 1.2, note: "From ground roasted flaxseed" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 480, bioavailabilityFactor: 1, note: "Cardiovascular electrolyte" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Childhood Vitamin A deficiency eradication", "Anti-inflammatory joint lubrication", "Skin tissue restoration"],
      bioactiveCompounds: ["Beta-carotene", "Secoisolariciresinol diglucoside", "Chlorogenic acid"],
      digestiveTolerance: "Creamy, naturally sweet, and deeply soothing to the digestive tract."
    }
  },
  {
    id: "efct-0315",
    name: "Anchote Stew with Spiced Butter (\u12E8\u12A0\u1295\u132E\u1274 \u12C8\u1325)",
    nameAmharic: "\u12E8\u12A0\u1295\u132E\u1274 \u12C8\u1325",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0315",
    traditionalPreparation: "Tender boiled anchote roots mashed and cooked in a rich reduction of niter kibbeh, shallots, garlic, korerima, and chopped green chili, traditionally prepared during Meskel celebrations.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 40, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 40,
      tanninsMgPer100g: 15,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Boiling, mashing, and cooking in spiced butter.",
      fermentationReductionPct: 72,
      bioavailabilityUpliftDescription: "Spiced butter lipids maximize calcium and fat-soluble nutrient uptake in gut villi."
    },
    macros: { caloriesKcal: 215, proteinG: 3.8, carbohydratesG: 24, fatsG: 11.5, dietaryFiberG: 4.9 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 310, bioavailabilityFactor: 1.35, note: "Peak plant-based bioavailable calcium" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5.2, bioavailabilityFactor: 1.3, note: "Synergistic mineral absorption" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 130, bioavailabilityFactor: 1.25, note: "Retinol from niter kibbeh" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Bone fracture restoration", "Osteoporosis defense", "Postpartum mother pelvic recovery"],
      bioactiveCompounds: ["Cucurbitacins", "Butyric acid", "Korerima monoterpenes"],
      digestiveTolerance: "Silky and luxurious; renowned across Wollega for rapid healing."
    }
  },
  {
    id: "efct-0316",
    name: "Fermented Bulla Drink with Honey (\u12E8\u1261\u120B \u132D\u121B\u1242)",
    nameAmharic: "\u12E8\u1261\u120B \u132D\u121B\u1242",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0316",
    traditionalPreparation: "Decanted liquid enset bulla starch lightly fermented for 24h, diluted with spring water, warm ginger, and raw wild honey into an energizing, probiotic tonic.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 46, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 12,
      tanninsMgPer100g: 5,
      oxalatesMgPer100g: 4,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Fermentation and starch decantation.",
      fermentationReductionPct: 90,
      bioavailabilityUpliftDescription: "Lactic bacteria and natural honey enzymes generate a gut-repairing tonic."
    },
    macros: { caloriesKcal: 85, proteinG: 0.8, carbohydratesG: 20.5, fatsG: 0.1, dietaryFiberG: 1.2 },
    nutrients: [
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 28, bioavailabilityFactor: 1.2, note: "Hydrating mineral" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 45, bioavailabilityFactor: 1.25, note: "Enset mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Gastrointestinal lining regeneration", "Diarrheal dehydration", "Gentle energy replenishment"],
      bioactiveCompounds: ["Lactic acid bacteria", "Gingerols", "Honey flavonoids"],
      digestiveTolerance: "Supremely soothing; cools burning sensations in the stomach immediately."
    }
  },
  {
    id: "efct-0317",
    name: "Mashed Highland Potatoes with Garlic & Rue (\u12E8\u12F5\u1295\u127D \u1295\u134D\u122E)",
    nameAmharic: "\u12E8\u12F5\u1295\u127D \u1295\u134D\u122E / \u12A5\u1238\u1275",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0317",
    traditionalPreparation: "Small newly-harvested highland potatoes boiled skin-on in brine with fresh sprigs of rue (tena'adam) and crushed garlic, lightly crushed and eaten warm.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 54, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 28,
      tanninsMgPer100g: 12,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Boiling in salted brine softens skin and leaches residual glycoalkaloids.",
      fermentationReductionPct: 62,
      bioavailabilityUpliftDescription: "Skin-on cooking retains high potassium and mineral layers directly beneath peel."
    },
    macros: { caloriesKcal: 105, proteinG: 2.4, carbohydratesG: 23, fatsG: 0.2, dietaryFiberG: 3.5 },
    nutrients: [
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 480, bioavailabilityFactor: 1, note: "High skin-retention potassium" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 19.5, bioavailabilityFactor: 1, note: "Ascorbic acid" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Hypertension reduction", "Athletic recovery hydration", "Digestive comfort"],
      bioactiveCompounds: ["Rutin from rue", "Allicin", "Potato anthocyanins"],
      digestiveTolerance: "Very gentle and aromatic; rue prevents gas accumulation."
    }
  },
  {
    id: "efct-0318",
    name: "Enset Corm Roasted Slices (Amicho) (\u12A0\u121A\u127E)",
    nameAmharic: "\u12A0\u121A\u127E",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0318",
    traditionalPreparation: "The central underground corm of young enset plants (Ensete ventricosum) cleaned, sliced into thick steaks, and boiled tender or roasted over clay griddles.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 42, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 25,
      tanninsMgPer100g: 14,
      oxalatesMgPer100g: 8,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Boiling young corm hydrolyzes starches and softens fibrous parenchyma.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "High moisture and complex prebiotic mucilage feed beneficial Bifidobacteria."
    },
    macros: { caloriesKcal: 115, proteinG: 1.5, carbohydratesG: 26.5, fatsG: 0.2, dietaryFiberG: 4.8 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 4.8, bioavailabilityFactor: 1, note: "Prebiotic enset fiber" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 78, bioavailabilityFactor: 1.2, note: "Bone support" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 1.4, bioavailabilityFactor: 1.15, note: "Trace mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Lowland & highland staple food security", "Gentle non-acidic gut fuel", "Colonic health"],
      bioactiveCompounds: ["Soluble enset mucilage", "Polyphenols"],
      digestiveTolerance: "Soft, mildly sweet like artichoke or potato; exceptionally gentle on the bowel."
    }
  },
  {
    id: "efct-0319",
    name: "Tiger Nut / Chufa Tuber (\u12E8\u121D\u12F5\u122D \u1208\u12CD\u12DD)",
    nameAmharic: "\u12E8\u121D\u12F5\u122D \u1208\u12CD\u12DD",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0319",
    traditionalPreparation: "Small sweet subterranean tubers of Cyperus esculentus washed, sun-dried, chewed as sweet whole-food energizer or soaked and stone-milled into rich milky emulsion.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 35, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 70,
      tanninsMgPer100g: 22,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Sun drying and soaking activates endogenous enzymes.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "High oleic acid lipid profile mirrors olive oil in a sweet crunchy tuber."
    },
    macros: { caloriesKcal: 400, proteinG: 5.2, carbohydratesG: 42.5, fatsG: 24, dietaryFiberG: 15.5 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 15.5, bioavailabilityFactor: 1, note: "Phenomenal prebiotic fiber concentration" },
      { name: "Vitamin E", symbol: "VitE", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1, note: "Cell-membrane antioxidant" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 105, bioavailabilityFactor: 1.1, note: "Neuromuscular mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Microbiome prebiotic rewilding", "Satiety and cardiovascular lipid health", "Natural sweet craving control"],
      bioactiveCompounds: ["Oleic acid", "Resistant starch", "Polyphenols"],
      digestiveTolerance: "Sweet and nutty; high fiber promotes regular, healthy bowel motility."
    }
  },
  {
    id: "efct-0320",
    name: "Wild Arrowroot Starch Pudding (\u12E8\u12F1\u122D \u12F5\u1295\u127D \u1308\u1295\u134E)",
    nameAmharic: "\u12E8\u12F1\u122D \u12F5\u1295\u127D \u1308\u1295\u134E",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0320",
    traditionalPreparation: "Wild forest arrowroot tubers grated, starch washed and settled, cooked in water with cinnamon and cardamom into a crystal-clear gelatinous porridge.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 45, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 10,
      tanninsMgPer100g: 6,
      oxalatesMgPer100g: 4,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Water extraction and starch decantation washes out all antinutrients.",
      fermentationReductionPct: 94,
      bioavailabilityUpliftDescription: "Ultra-pure amylopectin matrix provides non-fermentable, soothing gastric energy."
    },
    macros: { caloriesKcal: 130, proteinG: 0.5, carbohydratesG: 31.8, fatsG: 0.1, dietaryFiberG: 1.2 },
    nutrients: [
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 180, bioavailabilityFactor: 1, note: "Cellular hydration" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 1.8, bioavailabilityFactor: 1.2, note: "Trace mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Acute gastroenteritis recovery", "Pediatric colic and indigestion", "Acid reflux barrier"],
      bioactiveCompounds: ["Neutral starch polysaccharides", "Trace essential oils from spices"],
      digestiveTolerance: "Non-irritating to inflamed intestines; widely used for gastrointestinal recovery."
    }
  },
  {
    id: "efct-0321",
    name: "Sliced Boiled Oromo Potato Salad (\u12E8\u12F6\u1290\u127B \u1230\u120B\u1323)",
    nameAmharic: "\u12E8\u12F6\u1290\u127B \u1230\u120B\u1323",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0321",
    traditionalPreparation: "Indigenous highland Plectranthus edulis tubers boiled tender, chilled, sliced, and tossed with fresh shallots, sliced green chili, lemon juice, and virgin linseed oil.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 36, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 35,
      tanninsMgPer100g: 15,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Boiling and acid dressing degrades trace oxalates.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Cooling creates resistant retrograded starch, lowering blood glucose impact."
    },
    macros: { caloriesKcal: 125, proteinG: 2.8, carbohydratesG: 22, fatsG: 3.2, dietaryFiberG: 4.5 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.2, bioavailabilityFactor: 1.3, note: "Highland indigenous tuber iron density" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 75, bioavailabilityFactor: 1.15, note: "Bone mineral" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 14, bioavailabilityFactor: 1, note: "Fresh lemon juice & pepper" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Low-glycemic root carbohydrate replacement", "Hypertension dietary management", "Highland heritage biodiversity preservation"],
      bioactiveCompounds: ["Plectranthus diterpenes", "Quercetin", "Resistant starch"],
      digestiveTolerance: "Firm, nutty texture with no heaviness; very gentle on the stomach."
    }
  },
  {
    id: "efct-0322",
    name: "Taro Leaves & Corm Braised Stew (\u12E8\u130E\u12F0\u122C \u1245\u1320\u120D\u1293 \u1235\u122D \u12C8\u1325)",
    nameAmharic: "\u12E8\u130E\u12F0\u122C \u1245\u1320\u120D\u1293 \u1235\u122D \u12C8\u1325",
    category: "Roots & Tubers",
    sourceRef: "EFCT2025-0322",
    traditionalPreparation: "Tender young taro leaves and cubed corm boiled vigorously together with tamarind or lemon juice to completely dissolve raphides, then braised with shallots, garlic, and turmeric.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 38, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 45,
      tanninsMgPer100g: 22,
      oxalatesMgPer100g: 35,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Acid boiling (lemon/tamarind) and water discard dissolves sharp calcium oxalate needles.",
      fermentationReductionPct: 88,
      bioavailabilityUpliftDescription: "Combining nutrient-dense green leaf and mineral-dense corm creates full synergy."
    },
    macros: { caloriesKcal: 110, proteinG: 3.5, carbohydratesG: 19.5, fatsG: 2.2, dietaryFiberG: 5.2 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 145, bioavailabilityFactor: 1.2, note: "Dual leaf and corm calcium base" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.8, bioavailabilityFactor: 1.25, note: "Bioavailable mineral" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 420, bioavailabilityFactor: 1.2, note: "Beta-carotene from dark taro leaves" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Southern Ethiopia harvest wellness", "Bone and ocular health synergy", "High-potassium cellular alkalization"],
      bioactiveCompounds: ["Chlorophyll", "Lutein", "Curcuminoids"],
      digestiveTolerance: "Tender and velvety; acid parboiling guarantees a silky, soothing texture."
    }
  },
  // ==========================================
  // 4. VEGETABLES & GREENS (31 items)
  // ==========================================
  {
    id: "efct-0208",
    name: "Fasolia (Green Beans, Carrots & Onions)",
    nameAmharic: "\u12E8\u134B\u1236\u120A\u12EB \u12C8\u1325",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0208",
    traditionalPreparation: "Fresh tender green beans (Phaseolus vulgaris) sliced and saut\xE9ed with sweet carrots, red onions, garlic, and turmeric.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 32, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 45,
      tanninsMgPer100g: 20,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Fresh vegetable saut\xE9ing.",
      fermentationReductionPct: 40,
      bioavailabilityUpliftDescription: "Low antinutrients natively."
    },
    macros: { caloriesKcal: 85, proteinG: 2.8, carbohydratesG: 12, fatsG: 3.2, dietaryFiberG: 3.8 },
    nutrients: [
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 420, bioavailabilityFactor: 1.2, note: "Beta-carotene from carrots absorbed with cooking oil" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 18, bioavailabilityFactor: 0.9, note: "Vegetable vitamin C" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 3.8, bioavailabilityFactor: 1, note: "Pectin and cellulose" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 290, bioavailabilityFactor: 1, note: "Low-sodium electrolyte" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Eye health & night vision", "Mild digestive detox", "Caloric balance during fasting"],
      bioactiveCompounds: ["Carotenoids (alpha and beta-carotene)", "Lutein"],
      digestiveTolerance: "Light, sweet, and soothing for all ages."
    }
  },
  {
    id: "efct-0401",
    name: "Habesha Gomen (Ethiopian Highland Collard)",
    nameAmharic: "\u130E\u1218\u1295",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0401",
    traditionalPreparation: "Highland Ethiopian kale (Brassica carinata) braised with garlic, ginger, sliced green chili, and vegetable oil or niter kibbeh.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 20, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 15,
      tanninsMgPer100g: 25,
      oxalatesMgPer100g: 45,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Light braising and steam cooking.",
      fermentationReductionPct: 50,
      bioavailabilityUpliftDescription: "Exceptionally low oxalic acid allows high calcium absorption (>40% absorption vs <5% in common spinach)."
    },
    macros: { caloriesKcal: 65, proteinG: 3.2, carbohydratesG: 8.5, fatsG: 2.1, dietaryFiberG: 4 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 210, bioavailabilityFactor: 1.35, note: "Exceptionally bioavailable calcium due to low oxalate profile" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 380, bioavailabilityFactor: 1.2, note: "Beta-carotene provitamin A" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 45, bioavailabilityFactor: 0.85, note: "Partially heat-sensitive" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 120, bioavailabilityFactor: 1, note: "Leafy green folate" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 4, bioavailabilityFactor: 1, note: "Digestive roughage" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Bone density fortification during dairy-free fasting", "Retinal macular health via lutein", "Cellular detoxification"],
      bioactiveCompounds: ["Glucosinolates (allyl isothiocyanate precursors)", "Lutein & zeaxanthin"],
      digestiveTolerance: "Cooking deactivates mild goitrogens; very gentle on digestion."
    }
  },
  {
    id: "efct-0402",
    name: "Moringa (Shiferaw) Leaf Powder",
    nameAmharic: "\u12E8\u123D\u1348\u122B\u12CD \u1245\u1320\u120D \u12F1\u1244\u1275",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0402",
    traditionalPreparation: "Shade-dried leaves of indigenous Moringa stenopetala from Konso and Arba Minch, pulverized into fine vibrant green powder.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 18, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 80,
      tanninsMgPer100g: 45,
      oxalatesMgPer100g: 50,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Shade drying preserves micronutrients while reducing moisture-dependent antinutrients.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Super-dense micronutrient matrix delivering concentrated minerals."
    },
    macros: { caloriesKcal: 205, proteinG: 27, carbohydratesG: 38, fatsG: 2.5, dietaryFiberG: 19 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 1850, bioavailabilityFactor: 1.15, note: "Unmatched plant calcium density" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 28, bioavailabilityFactor: 1.2, note: "Concentrated plant iron" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 1600, bioavailabilityFactor: 1, note: "Over 170% daily baseline provitamin A" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 27, bioavailabilityFactor: 1, note: "High protein leaf flour" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 360, bioavailabilityFactor: 1.1, note: "Cellular magnesium" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Severe multi-micronutrient deficiency", "Lactation enhancement", "Blood glucose modulation"],
      bioactiveCompounds: ["Moringine isothiocyanates", "Quercetin & chlorogenic acid"],
      digestiveTolerance: "Introduce gradually (1/2 tsp daily) to prevent mild laxative effect."
    }
  },
  {
    id: "efct-0403",
    name: "Duba Wot (Pumpkin / Squash Stew)",
    nameAmharic: "\u12E8\u12F1\u1263 \u12C8\u1325",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0403",
    traditionalPreparation: "Ripe yellow pumpkin (Cucurbita pepo) cubed and simmered in mild berbere or turmeric sauce with garlic and red onions.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 45, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 20,
      tanninsMgPer100g: 10,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Stew simmering.",
      fermentationReductionPct: 50,
      bioavailabilityUpliftDescription: "Low antinutrients; high carotenoid micellization with cooking oils."
    },
    macros: { caloriesKcal: 90, proteinG: 2.1, carbohydratesG: 18, fatsG: 1.8, dietaryFiberG: 3.2 },
    nutrients: [
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 650, bioavailabilityFactor: 1.2, note: "High provitamin A carotenoids" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 340, bioavailabilityFactor: 1, note: "Hypotensive electrolyte" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 15, bioavailabilityFactor: 0.8, note: "Vegetable vitamin C" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Visual pigment regeneration", "Prostate and urinary health", "Gentle fasting nourishment"],
      bioactiveCompounds: ["Beta-cryptoxanthin", "Cucurbitacins"],
      digestiveTolerance: "Very gentle and easy on the intestines."
    }
  },
  {
    id: "efct-0404",
    name: "Timatim Fitfit (Fresh Tomato & Injera Salad)",
    nameAmharic: "\u12E8\u1272\u121B\u1272\u121D \u134D\u1275\u134D\u1275",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0404",
    traditionalPreparation: "Fresh vine-ripened tomatoes diced with onions, minced green chili (kariya), lemon juice, and torn pieces of cold fermented teff injera.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 38, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 70,
      tanninsMgPer100g: 25,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Fresh raw preparation with cold fermented teff.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Vitamin C from fresh tomatoes and lemon dramatically multiplies teff iron uptake."
    },
    macros: { caloriesKcal: 140, proteinG: 3.8, carbohydratesG: 28, fatsG: 1.5, dietaryFiberG: 3.5 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 7.2, bioavailabilityFactor: 1.85, note: "Fresh tomato vitamin C elevates teff iron absorption by 85%" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 32, bioavailabilityFactor: 1, note: "Raw tomato and lemon ascorbic acid" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 210, bioavailabilityFactor: 1, note: "Lycopene and beta-carotene" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Optimal meal pairing for treating iron deficiency", "Vascular endothelial protection via lycopene"],
      bioactiveCompounds: ["Lycopene", "Flavonoid rutin"],
      digestiveTolerance: "Refreshing and hydrating; excellent cooling dish in warm weather."
    }
  },
  {
    id: "efct-0405",
    name: "Gomen Kitfo (Minced Steamed Collards with Kibbeh)",
    nameAmharic: "\u130E\u1218\u1295 \u12AD\u1275\u134E",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0405",
    traditionalPreparation: "Fresh highland collard greens (Brassica carinata) boiled until tender, squeezed bone-dry, minced superfine with a sharp knife, and warm-tossed with spiced niter kibbeh, mitmita, and minced shallots.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 20, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 20,
      tanninsMgPer100g: 15,
      oxalatesMgPer100g: 45,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Boiling collards and squeezing out the bitter cooking liquid removes >60% of soluble oxalates and glucosinolates.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Clarified butter lipids multiply the intestinal absorption of fat-soluble vitamins A, K, and lutein by over 400%."
    },
    macros: { caloriesKcal: 145, proteinG: 3.8, carbohydratesG: 7.2, fatsG: 11.5, dietaryFiberG: 4.8 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 210, bioavailabilityFactor: 1.35, note: "Top-tier bioavailable plant calcium" },
      { name: "Vitamin K", symbol: "VitK", unit: "mcg", amountPer100g: 380, bioavailabilityFactor: 1.4, note: "Critical for osteocalcin bone binding & coagulation" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 420, bioavailabilityFactor: 1.45, note: "High carotenoid uptake via niter kibbeh" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.2, bioavailabilityFactor: 1.25, note: "Highland brassica iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Bone density and osteoporosis prevention", "Healthy coagulation & vascular elasticity", "Vision protection against glare"],
      bioactiveCompounds: ["Sulforaphane precursors", "Lutein & zeaxanthin", "Indole-3-carbinol", "Butyric acid"],
      digestiveTolerance: "Minced texture and discarded cooking water eliminates bitterness and gas."
    }
  },
  {
    id: "efct-0406",
    name: "Tikil Gomen (Braised Ethiopian Cabbage & Potatoes)",
    nameAmharic: "\u1325\u1245\u120D \u130E\u1218\u1295",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0406",
    traditionalPreparation: "Fresh sweet green/white cabbage thinly shredded and braised slowly with carrots, potatoes, red onions, garlic, and fresh turmeric root until tender and sweet.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 38, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 15,
      tanninsMgPer100g: 10,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Slow steam-braising breaks down goitrogenic glucosinolates into safe, bioactive isothiocyanates.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Combining turmeric with allium aromatics enhances anti-inflammatory cytokine modulation."
    },
    macros: { caloriesKcal: 78, proteinG: 2.1, carbohydratesG: 12.8, fatsG: 2.4, dietaryFiberG: 3.8 },
    nutrients: [
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 38, bioavailabilityFactor: 1, note: "Potent natural antioxidant defense" },
      { name: "Vitamin K", symbol: "VitK", unit: "mcg", amountPer100g: 65, bioavailabilityFactor: 1.15, note: "Vascular health" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 48, bioavailabilityFactor: 1.05, note: "Cellular renewal" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Gastric ulcer mucosal repair (Vitamin U / S-methylmethionine)", "Liver Phase II detoxification", "Fasting season digestive comfort"],
      bioactiveCompounds: ["Glucobrassicin", "S-methylmethionine (anti-ulcer factor)", "Curcumin", "Carotenoids"],
      digestiveTolerance: "Tender, mildly sweet, and alkaline; coats and calms acidic gastrointestinal distress."
    }
  },
  {
    id: "efct-0407",
    name: "Qey Sir (Spiced Beetroot & Potato Saut\xE9)",
    nameAmharic: "\u1240\u12ED \u1235\u122D (\u12E8\u1270\u1320\u1260\u1230)",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0407",
    traditionalPreparation: "Deep ruby highland beetroots (Beta vulgaris) peeled, sliced into batons, and saut\xE9ed with potatoes, red onions, garlic, ginger, and green chilies in vegetable oil.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 45, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 22,
      tanninsMgPer100g: 14,
      oxalatesMgPer100g: 55,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Thermal braising hydrolyzes betalains into absorbable antioxidant pigments.",
      fermentationReductionPct: 55,
      bioavailabilityUpliftDescription: "Natural dietary nitrates in beets convert to nitric oxide (NO), promoting vasodilation and tissue perfusion."
    },
    macros: { caloriesKcal: 92, proteinG: 2, carbohydratesG: 16.5, fatsG: 2.5, dietaryFiberG: 3.6 },
    nutrients: [
      { name: "Dietary Nitrate", symbol: "NO3", unit: "mg", amountPer100g: 145, bioavailabilityFactor: 1.35, note: "Endothelial nitric oxide synthesizer" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 85, bioavailabilityFactor: 1.1, note: "Natural beetroot folate" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 360, bioavailabilityFactor: 1, note: "Arterial pressure regulator" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 1.8, bioavailabilityFactor: 1.2, note: "Non-heme mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Hypertension and endothelial dysfunction reduction", "High-altitude athletic endurance", "Liver methylation & detox support"],
      bioactiveCompounds: ["Betanin & betaxanthins", "Betaine (trimethylglycine)", "Dietary inorganic nitrates"],
      digestiveTolerance: "Sweet and vibrant; promotes healthy bile flow and peristalsis."
    }
  },
  {
    id: "efct-0408",
    name: "Salata (Ethiopian Chopped Salad with Green Pepper)",
    nameAmharic: "\u1230\u120B\u1323 (\u12E8\u12A2\u1275\u12EE\u1335\u12EB)",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0408",
    traditionalPreparation: "Fresh highland crisp lettuce, diced vine tomatoes, minced shallots, and spicy green jalape\xF1os (kariya) tossed in a zesty dressing of freshly squeezed lime juice, cold-pressed oil, and sea salt.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 10,
      tanninsMgPer100g: 8,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Fresh raw consumption preserves 100% of heat-sensitive ascorbic acid and live food enzymes.",
      fermentationReductionPct: 30,
      bioavailabilityUpliftDescription: "Fresh lime juice vitamin C instantly triples non-heme iron absorption from accompanying wot dishes."
    },
    macros: { caloriesKcal: 48, proteinG: 1.2, carbohydratesG: 5.5, fatsG: 2.6, dietaryFiberG: 1.8 },
    nutrients: [
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 26, bioavailabilityFactor: 1.2, note: "Fresh lime & tomato ascorbic acid" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 180, bioavailabilityFactor: 1.15, note: "Carotenoids from lettuce & tomato" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 220, bioavailabilityFactor: 1, note: "Cellular hydration" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Iron absorption catalyst when paired with legume wots", "Digestive enzyme activation", "Hydration and palate cleansing"],
      bioactiveCompounds: ["Capsaicin", "Lycopene", "Quercetin", "Ascorbic acid"],
      digestiveTolerance: "Crisp, cool, and sharp; stimulates saliva and gastric juices."
    }
  },
  {
    id: "efct-0409",
    name: "Kariya / Senig Kariya (Stuffed Green Peppers)",
    nameAmharic: "\u1235\u1295\u130D \u1243\u122A\u12EB",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0409",
    traditionalPreparation: "Whole large green chili peppers slit lengthwise, seeds removed, and packed with finely minced shallots, diced fresh tomatoes, minced garlic, sea salt, and a splash of vinegar or lemon juice.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 18, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 12,
      tanninsMgPer100g: 10,
      oxalatesMgPer100g: 14,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Acid marination in lemon juice breaks down cellular walls.",
      fermentationReductionPct: 40,
      bioavailabilityUpliftDescription: "High concentration of capsaicin and ascorbic acid activates saliva and digestive secretions."
    },
    macros: { caloriesKcal: 38, proteinG: 1.5, carbohydratesG: 6.8, fatsG: 0.5, dietaryFiberG: 2.4 },
    nutrients: [
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 88, bioavailabilityFactor: 1.25, note: "Over 100% RDA in a single stuffed pepper" },
      { name: "Vitamin B6", symbol: "B6", unit: "mg", amountPer100g: 0.22, bioavailabilityFactor: 1, note: "Energy metabolism" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 120, bioavailabilityFactor: 1.1, note: "Beta-carotene" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Immediate digestive fire (Agni) stimulation", "Immune defense boost against colds", "Metabolic thermogenesis"],
      bioactiveCompounds: ["Capsaicin", "Dihydrocapsaicin", "Allicin", "Lycopene"],
      digestiveTolerance: "Spicy and tangy; eaten alongside heavy stews to speed gastric transit."
    }
  },
  {
    id: "efct-0410",
    name: "Bamia Wot (Ethiopian Okra Stew)",
    nameAmharic: "\u12E8\u1263\u121A\u12EB \u12C8\u1325",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0410",
    traditionalPreparation: "Tender young okra pods (Abelmoschus esculentus) trimmed, sliced, and slow-simmered in a rich, spicy berbere, red onion, garlic, and tomato sauce until meltingly tender.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 25, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 28,
      tanninsMgPer100g: 18,
      oxalatesMgPer100g: 35,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Acidic simmering in tomato-berbere reduction hydrolyzes soluble oxalates.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Okra mucilage binds bile acids and dietary cholesterol in the gut lumen, facilitating excretion."
    },
    macros: { caloriesKcal: 65, proteinG: 2.4, carbohydratesG: 9.8, fatsG: 2.1, dietaryFiberG: 4.5 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 4.5, bioavailabilityFactor: 1, note: "Rich in soluble viscous mucilage" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 95, bioavailabilityFactor: 1.25, note: "High bioavailable vegetable calcium" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 75, bioavailabilityFactor: 1.1, note: "Prenatal cell growth" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 22, bioavailabilityFactor: 1, note: "Natural antioxidant" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Cholesterol reduction via bile acid sequestration", "Gastric lining coating in peptic ulcers", "Type 2 diabetes blood glucose blunting"],
      bioactiveCompounds: ["Rhamnogalacturonan mucilage", "Isoquercitrin", "Capsaicin"],
      digestiveTolerance: "Velvety and protective; provides a gentle coating across irritated intestines."
    }
  },
  {
    id: "efct-0411",
    name: "Yetsom Beyaynetu (Fasting Vegetable Platter)",
    nameAmharic: "\u12E8\u133E\u121D \u1260\u12EB\u12ED\u1290\u1271",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0411",
    traditionalPreparation: "The premier Ethiopian fasting feast: an elaborate colorful platter composed of shiro, misir wot, kik alicha, habesha gomen, tikil gomen, fasolia, and qey sir arranged over fermented teff injera.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 36, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 130,
      tanninsMgPer100g: 40,
      oxalatesMgPer100g: 25,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Fermented injera + cooked pulse + braised vegetable synergy degrades >75% of antinutrients.",
      fermentationReductionPct: 78,
      bioavailabilityUpliftDescription: "Ultimate nutritional synergy: teff cereal amino acids + pulse lysine + leafy green calcium + antioxidant carotenoids."
    },
    macros: { caloriesKcal: 175, proteinG: 7.8, carbohydratesG: 28.5, fatsG: 4.2, dietaryFiberG: 6.8 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 6.5, bioavailabilityFactor: 1.45, note: "Multi-component bioavailable iron" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 140, bioavailabilityFactor: 1.3, note: "Teff + gomen vegetable calcium" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 145, bioavailabilityFactor: 1.15, note: "Comprehensive B-vitamin coverage" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 310, bioavailabilityFactor: 1.3, note: "From greens, pumpkin, and carrots" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Complete plant-based nutritional perfection", "Cardiovascular anti-inflammatory defense", "Colonic microbiome biodiversity"],
      bioactiveCompounds: ["Sulforaphane", "Curcumin", "Capsaicin", "Betanin", "Polyphenols"],
      digestiveTolerance: "Diverse, balanced, and complete; the golden standard of Ethiopian nutritional wisdom."
    }
  },
  {
    id: "efct-0412",
    name: "Moringa Leaf Fresh Stew (\u12E8\u123D\u1348\u122B\u12CD \u1245\u1320\u120D \u12C8\u1325)",
    nameAmharic: "\u12E8\u123D\u1348\u122B\u12CD \u1245\u1320\u120D \u12C8\u1325",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0412",
    traditionalPreparation: "Freshly stripped green leaves of Southern Ethiopian Moringa stenopetala (Aleko / Shiferaw) blanched in water and simmered with onions, garlic, ginger, and cold-pressed oil.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 18, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 22,
      tanninsMgPer100g: 16,
      oxalatesMgPer100g: 25,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Brief blanching in boiling water leaches soluble antinutritional complexes.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Fresh leaves retain exceptional levels of bioavailable iron, calcium, and all 9 essential amino acids."
    },
    macros: { caloriesKcal: 72, proteinG: 6.2, carbohydratesG: 7.5, fatsG: 2.1, dietaryFiberG: 4.2 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 6.2, bioavailabilityFactor: 1.1, note: "Remarkably high protein density for a leafy green" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 280, bioavailabilityFactor: 1.3, note: "Triple that of dairy milk" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5.8, bioavailabilityFactor: 1.35, note: "High dialyzability" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 650, bioavailabilityFactor: 1.3, note: "High carotenoid density" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Multinutrient micronutrient deficiency reversal", "Hypertension and arterial relaxation", "Immune stimulation"],
      bioactiveCompounds: ["Moringine", "Chlorogenic acid", "Quercetin-3-glucoside", "Kaempferol"],
      digestiveTolerance: "Pleasant, mildly peppery taste; highly regarded in Konso as daily vitality food."
    }
  },
  {
    id: "efct-0413",
    name: "Wild Amaranth Greens (Yedur Gomen)",
    nameAmharic: "\u12E8\u12F1\u122D \u130E\u1218\u1295",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0413",
    traditionalPreparation: "Tender young leaves and succulent shoots of wild amaranth (Amaranthus hybridus / viridis) foraged from highland edges, steamed and saut\xE9ed with shallots and garlic.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 16, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 25,
      tanninsMgPer100g: 15,
      oxalatesMgPer100g: 50,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Initial steaming and discarding liquid removes soluble oxalates.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Wild amaranth greens pack twice the iron and magnesium of commercial spinach."
    },
    macros: { caloriesKcal: 42, proteinG: 3.5, carbohydratesG: 5.2, fatsG: 0.6, dietaryFiberG: 3.2 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.25, note: "Wild foraged iron density" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 215, bioavailabilityFactor: 1.2, note: "Rich plant calcium" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 85, bioavailabilityFactor: 1.15, note: "High cellular mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Anemia treatment in rural communities", "Bone remineralization", "Antioxidant cellular protection"],
      bioactiveCompounds: ["Amaranthin", "Rutin", "Squalene traces", "Chlorophyll"],
      digestiveTolerance: "Soft, earthy, and tender; very easy to consume."
    }
  },
  {
    id: "efct-0414",
    name: "Abesha Tomato Salad with Ayib (\u12E8\u1272\u121B\u1272\u121D\u1293 \u12A0\u12ED\u1265 \u1230\u120B\u1323)",
    nameAmharic: "\u12E8\u1272\u121B\u1272\u121D\u1293 \u12A0\u12ED\u1265 \u1230\u120B\u1323",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0414",
    traditionalPreparation: "Ripe vine tomatoes diced and tossed with freshly crumbled Ethiopian cottage curd (ayib), torn besobila (holy basil), jalape\xF1o slices, and mild red onions.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 22, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 10,
      tanninsMgPer100g: 8,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Ayib's calcium ions naturally bind free food oxalates in the gut lumen, rendering them non-absorbable.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Ayib protein and dairy lipids increase tomato lycopene absorption by 3-fold."
    },
    macros: { caloriesKcal: 115, proteinG: 7.5, carbohydratesG: 6.8, fatsG: 6.5, dietaryFiberG: 1.6 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 160, bioavailabilityFactor: 1.35, note: "From fresh cottage curd" },
      { name: "Lycopene", symbol: "Lyc", unit: "mcg", amountPer100g: 3200, bioavailabilityFactor: 1.4, note: "Cardiovascular and prostate protector" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 22, bioavailabilityFactor: 1.1, note: "Natural ascorbic acid" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Cooling side dish against spicy wots", "Prostate protection and arterial health", "Fast bioavailable calcium repletion"],
      bioactiveCompounds: ["Lycopene", "Eugenol from besobila", "Dairy bioactive peptides"],
      digestiveTolerance: "Cooling, refreshing, and calming; extinguishes the burn of hot mitmita or berbere."
    }
  },
  {
    id: "efct-0415",
    name: "Cauliflower & Green Pea Alicha (\u12E8\u12A0\u1260\u1263 \u130E\u1218\u1295 \u12A0\u120D\u132B)",
    nameAmharic: "\u12E8\u12A0\u1260\u1263 \u130E\u1218\u1295 \u12A0\u120D\u132B",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0415",
    traditionalPreparation: "Cauliflower florets and sweet tender green garden peas saut\xE9ed in turmeric, caramelized red onions, garlic, and fresh grated ginger.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 32, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 35,
      tanninsMgPer100g: 14,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Gentle steaming hydrolyzes sinigrin glucosinolates into bioactive indole-3-carbinol.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Green peas supply lysine while cauliflower provides choline and sulfur compounds."
    },
    macros: { caloriesKcal: 85, proteinG: 4.2, carbohydratesG: 12.5, fatsG: 2.2, dietaryFiberG: 4.4 },
    nutrients: [
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 45, bioavailabilityFactor: 1, note: "Nearly half daily requirement" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 65, bioavailabilityFactor: 1.1, note: "B-vitamin support" },
      { name: "Choline", symbol: "Chol", unit: "mg", amountPer100g: 42, bioavailabilityFactor: 1, note: "Liver and brain cell health" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Liver detoxification support", "Hormonal estrogen balance via indole-3-carbinol", "Healthy weight loss staple"],
      bioactiveCompounds: ["Indole-3-carbinol", "Sulforaphane", "Curcumin"],
      digestiveTolerance: "Tender and mild; ginger eliminates brassica gas formation."
    }
  },
  {
    id: "efct-0416",
    name: "Zucchini / Yafer Dube Saut\xE9 (\u12E8\u12A0\u1348\u122D \u12F1\u1263 / \u12D9\u12AA\u1292 \u1325\u1265\u1235)",
    nameAmharic: "\u12E8\u12A0\u1348\u122D \u12F1\u1263 / \u12D9\u12AA\u1292 \u1325\u1265\u1235",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0416",
    traditionalPreparation: "Highland summer squash / zucchini sliced into rounds and flashed in hot vegetable oil with shallots, garlic, crushed turmeric, and green chilies.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 20, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 12,
      tanninsMgPer100g: 8,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "High-heat flash saut\xE9 maintains crisp texture while breaking down cell walls.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "High water and electrolyte content provides natural cellular hydration."
    },
    macros: { caloriesKcal: 55, proteinG: 1.6, carbohydratesG: 6.2, fatsG: 3, dietaryFiberG: 2.1 },
    nutrients: [
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 280, bioavailabilityFactor: 1, note: "Hydrating mineral" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 18, bioavailabilityFactor: 1, note: "Antioxidant" },
      { name: "Lutein", symbol: "Lut", unit: "mcg", amountPer100g: 1200, bioavailabilityFactor: 1.25, note: "Ocular protection" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Low-calorie diabetic meal support", "Kidney detoxification and mild diuresis", "Vision protection"],
      bioactiveCompounds: ["Lutein", "Curcumin", "Carotenoids"],
      digestiveTolerance: "Very light, juicy, and gentle on sensitive digestions."
    }
  },
  {
    id: "efct-0417",
    name: "Eggplant / Melanzana Wot (\u12E8\u12F0\u1295\u1260\u1303\u1295 \u12C8\u1325)",
    nameAmharic: "\u12E8\u12F0\u1295\u1260\u1303\u1295 \u12C8\u1325",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0417",
    traditionalPreparation: "Fresh eggplant (Solanum melongena) cubed, salted to draw out bitter liquids, and simmered in a rich caramelized onion, garlic, tomato, and berbere sauce.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 24, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 20,
      tanninsMgPer100g: 25,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Pre-salting and slow braising draws out solanine alkaloids.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Eggplant acts as a cellular sponge, absorbing protective spice polyphenols into its fiber matrix."
    },
    macros: { caloriesKcal: 75, proteinG: 1.8, carbohydratesG: 9.5, fatsG: 3.8, dietaryFiberG: 3.8 },
    nutrients: [
      { name: "Nasunin", symbol: "Nas", unit: "mg", amountPer100g: 22, bioavailabilityFactor: 1.3, note: "Potent brain cell-membrane anthocyanin antioxidant" },
      { name: "Manganese", symbol: "Mn", unit: "mg", amountPer100g: 0.25, bioavailabilityFactor: 1.05, note: "Antioxidant enzyme cofactor" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 240, bioavailabilityFactor: 1, note: "Electrolyte balance" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Brain lipid peroxidation protection (Nasunin)", "Cardiovascular arterial protection", "Weight control"],
      bioactiveCompounds: ["Nasunin (delphinidin anthocyanin)", "Chlorogenic acid", "Capsaicin"],
      digestiveTolerance: "Melt-in-the-mouth texture; very easy on the stomach."
    }
  },
  {
    id: "efct-0418",
    name: "Fresh Purslane Salad (\u12E8\u1328\u134C \u130E\u1218\u1295)",
    nameAmharic: "\u12E8\u1328\u134C \u130E\u1218\u1295",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0418",
    traditionalPreparation: "Wild succulent purslane leaves (Portulaca oleracea) harvested from moist soils, washed in spring water, and dressed with lime juice, minced shallots, and cold-pressed linseed oil.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 12, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 15,
      tanninsMgPer100g: 10,
      oxalatesMgPer100g: 65,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Fresh lime juice dressing and pairing with mineral-rich foods balances natural oxalates.",
      fermentationReductionPct: 40,
      bioavailabilityUpliftDescription: "Purslane contains the highest plant-based Omega-3 alpha-linolenic acid (ALA) of any leafy vegetable on earth."
    },
    macros: { caloriesKcal: 38, proteinG: 2.1, carbohydratesG: 4.2, fatsG: 1.8, dietaryFiberG: 2.2 },
    nutrients: [
      { name: "Omega-3", symbol: "ALA", unit: "mg", amountPer100g: 380, bioavailabilityFactor: 1.3, note: "World-record Omega-3 fatty acid content for a leafy green" },
      { name: "Vitamin E", symbol: "VitE", unit: "mg", amountPer100g: 12.2, bioavailabilityFactor: 1.25, note: "Exceptional alpha-tocopherol density" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 68, bioavailabilityFactor: 1.2, note: "High bioaccessible mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Cardiovascular arrhythmia prevention and arterial elasticity", "Neuroprotection and cognitive clarity", "Systemic anti-inflammatory balance"],
      bioactiveCompounds: ["Alpha-linolenic acid", "Betalains", "Glutathione", "Melatonin"],
      digestiveTolerance: "Pleasantly tart and mucilaginous; coats and lubricates the digestive tract."
    }
  },
  {
    id: "efct-0419",
    name: "Steamed Stinging Nettle Greens (Yedobe Gomen)",
    nameAmharic: "\u12E8\u12F6\u1264 \u130E\u1218\u1295",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0419",
    traditionalPreparation: "Young wild stinging nettle shoots (Urtica simensis) foraged with tongs, steamed vigorously for 5 minutes to permanently deactivate stinging trichome hairs, and braised with garlic and shallots.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 14, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 18,
      tanninsMgPer100g: 15,
      oxalatesMgPer100g: 30,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "High temperature steaming breaks down formic acid and histamine trichomes in seconds.",
      fermentationReductionPct: 80,
      bioavailabilityUpliftDescription: "Thermal cooking liberates massive stores of bioavailable organic iron, silica, and calcium."
    },
    macros: { caloriesKcal: 48, proteinG: 4.2, carbohydratesG: 6.5, fatsG: 0.8, dietaryFiberG: 4.5 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 6.2, bioavailabilityFactor: 1.4, note: "Renowned traditional anemia therapeutic" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 320, bioavailabilityFactor: 1.35, note: "Top-tier skeletal mineral density" },
      { name: "Silica", symbol: "Si", unit: "mg", amountPer100g: 15, bioavailabilityFactor: 1.3, note: "Connective tissue, hair, and nail matrix" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Severe iron-deficiency anemia reversal", "Seasonal allergic rhinitis relief", "Arthritic joint pain reduction"],
      bioactiveCompounds: ["Flavonoids (quercetin, rutin)", "Beta-sitosterol", "Chlorophyll", "Caffeic acid"],
      digestiveTolerance: "Rich, earthy, and deep green; leaves no sting once cooked."
    }
  },
  {
    id: "efct-0420",
    name: "Spiced Braised Leeks (\u12E8\u1263\u122E \u123D\u1295\u12A9\u122D\u1275 \u1325\u1265\u1235)",
    nameAmharic: "\u12E8\u1263\u122E \u123D\u1295\u12A9\u122D\u1275 \u1325\u1265\u1235",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0420",
    traditionalPreparation: "Highland sweet leeks (Allium ampeloprasum) cleaned, sliced into thick discs, and gently caramelized in niter kibbeh or oil with a pinch of korerima and sea salt.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 28, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 15,
      tanninsMgPer100g: 10,
      oxalatesMgPer100g: 16,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Slow caramelization breaks down tough inulin fibers into sweet, bioaccessible prebiotic oligosaccharides.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "High inulin content feeds colon Bifidobacteria, which produce protective butyrate."
    },
    macros: { caloriesKcal: 72, proteinG: 1.8, carbohydratesG: 12, fatsG: 2.5, dietaryFiberG: 3.5 },
    nutrients: [
      { name: "Prebiotic Inulin", symbol: "Inul", unit: "g", amountPer100g: 3.2, bioavailabilityFactor: 1.3, note: "Selective food for probiotic bacteria" },
      { name: "Vitamin K", symbol: "VitK", unit: "mcg", amountPer100g: 45, bioavailabilityFactor: 1.15, note: "Vascular health" },
      { name: "Manganese", symbol: "Mn", unit: "mg", amountPer100g: 0.35, bioavailabilityFactor: 1.1, note: "Metabolic cofactor" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Gut microbiome restoration", "Arterial stiffness reduction", "Mild diuretic kidney clearing"],
      bioactiveCompounds: ["Kaempferol", "Allicin derivatives", "Inulin"],
      digestiveTolerance: "Sweet and melting; exceptionally gentle on the intestinal wall."
    }
  },
  {
    id: "efct-0421",
    name: "Roasted Bell Pepper Salad (\u12E8\u1243\u122A\u12EB \u1325\u1265\u1235 \u1230\u120B\u1323)",
    nameAmharic: "\u12E8\u1243\u122A\u12EB \u1325\u1265\u1235 \u1230\u120B\u1323",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0421",
    traditionalPreparation: "Sweet red and green peppers charred over glowing wood coals until skin blisters black, steam-peeled, sliced into strips, and marinated in garlic, olive oil, and lemon.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 20, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 12,
      tanninsMgPer100g: 10,
      oxalatesMgPer100g: 14,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Wood ember roasting and peeling removes hard indigestible waxy skin.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Thermal roasting caramelizes natural sugars and triples bioaccessibility of beta-carotene."
    },
    macros: { caloriesKcal: 62, proteinG: 1.4, carbohydratesG: 8.5, fatsG: 2.8, dietaryFiberG: 2.8 },
    nutrients: [
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 110, bioavailabilityFactor: 1.25, note: "More than double the Vitamin C of fresh oranges" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 240, bioavailabilityFactor: 1.3, note: "Carotenoids" },
      { name: "Vitamin B6", symbol: "B6", unit: "mg", amountPer100g: 0.28, bioavailabilityFactor: 1.05, note: "Neurological health" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Collagen biosynthesis & skin rejuvenation", "Immune defense strengthening", "Cardiovascular protection"],
      bioactiveCompounds: ["Capsanthin", "Luteolin", "Quercetin"],
      digestiveTolerance: "Skin-free and silky; zero heartburn or digestive delay."
    }
  },
  {
    id: "efct-0422",
    name: "Green Papaya Fasting Stew (\u12E8\u1325\u122C \u1353\u1353\u12EB \u12C8\u1325)",
    nameAmharic: "\u12E8\u1325\u122C \u1353\u1353\u12EB \u12C8\u1325",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0422",
    traditionalPreparation: "Unripe firm green papaya (Carica papaya) peeled, seeded, cubed, and simmered in a mild turmeric or berbere sauce with garlic, mimicking tender chayote squash.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 25, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 15,
      tanninsMgPer100g: 12,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Boiling thermalizes papain enzyme into a gentle digestive matrix.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Papaya pectin and trace papain assist in breaking down accompanying legumes and grains."
    },
    macros: { caloriesKcal: 45, proteinG: 1.1, carbohydratesG: 9.8, fatsG: 0.4, dietaryFiberG: 2.8 },
    nutrients: [
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 48, bioavailabilityFactor: 1, note: "Natural ascorbic acid" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 38, bioavailabilityFactor: 1, note: "Cellular renewal" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 210, bioavailabilityFactor: 1, note: "Electrolyte balance" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Protein digestion assistance", "Intestinal parasite defense in traditional medicine", "Low-calorie filling vegetable"],
      bioactiveCompounds: ["Papain fragments", "Carpaine", "Pectin", "Flavonoids"],
      digestiveTolerance: "Tender and mild; highly effective at preventing bloating."
    }
  },
  {
    id: "efct-0423",
    name: "Braised Spinach with Garlic (\u12E8\u1235\u1352\u1293\u127D \u130E\u1218\u1295)",
    nameAmharic: "\u12E8\u1235\u1352\u1293\u127D \u130E\u1218\u1295",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0423",
    traditionalPreparation: "Fresh highland spinach leaves washed, flash-braised in hot oil with finely minced shallots, garlic, and ginger until wilted and vibrant emerald.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 20,
      tanninsMgPer100g: 12,
      oxalatesMgPer100g: 60,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Flash cooking preserves delicate vitamins while softening insoluble fibers.",
      fermentationReductionPct: 50,
      bioavailabilityUpliftDescription: "Ginger and garlic allicin enhance circulatory delivery of bioavailable leaf minerals."
    },
    macros: { caloriesKcal: 52, proteinG: 2.8, carbohydratesG: 4.8, fatsG: 2.8, dietaryFiberG: 2.5 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.5, bioavailabilityFactor: 1.2, note: "Plant-based leafy iron" },
      { name: "Folate", symbol: "B9", unit: "mcg", amountPer100g: 145, bioavailabilityFactor: 1.15, note: "High natural folate" },
      { name: "Vitamin K", symbol: "VitK", unit: "mcg", amountPer100g: 420, bioavailabilityFactor: 1.35, note: "Top-tier Vitamin K" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Prenatal folate support", "Vascular endothelial integrity", "Macular eye protection"],
      bioactiveCompounds: ["Lutein", "Zeaxanthin", "Allicin", "Gingerols"],
      digestiveTolerance: "Silky and delicate; very quick to digest."
    }
  },
  {
    id: "efct-0424",
    name: "Radish Root and Tops Salad (\u12E8\u1240\u12ED \u1219\u120D\u132D \u1230\u120B\u1323)",
    nameAmharic: "\u12E8\u1240\u12ED \u1219\u120D\u132D \u1230\u120B\u1323",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0424",
    traditionalPreparation: "Peppery red and white radish roots sliced paper-thin together with tender young radish greens, dressed with lemon juice, salt, and cold-pressed sesame oil.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 10,
      tanninsMgPer100g: 8,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Fresh preparation retains full myrosinase enzyme activity.",
      fermentationReductionPct: 35,
      bioavailabilityUpliftDescription: "Active myrosinase converts glucosinolates into potent chemopreventive sulforaphane."
    },
    macros: { caloriesKcal: 35, proteinG: 1.2, carbohydratesG: 4.8, fatsG: 1.5, dietaryFiberG: 2 },
    nutrients: [
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 22, bioavailabilityFactor: 1.1, note: "Ascorbic acid" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 240, bioavailabilityFactor: 1, note: "Hydration mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Biliary flow stimulation & liver sluggishness", "Sinus and nasal airway clearing", "Digestive enzyme activation"],
      bioactiveCompounds: ["Raphanin", "Sulforaphene", "Glucoraphanin"],
      digestiveTolerance: "Peppery, crisp, and stimulating; promotes instant salivation."
    }
  },
  {
    id: "efct-0425",
    name: "Highland Turnip Stew (\u12E8\u123B\u120D\u1308\u121D \u12C8\u1325)",
    nameAmharic: "\u12E8\u123B\u120D\u1308\u121D \u12C8\u1325",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0425",
    traditionalPreparation: "Highland white turnips (Brassica rapa) peeled, cut into wedges, and simmered slowly with sweet carrots, onions, turmeric, and garlic until fork-tender.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 30, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 18,
      tanninsMgPer100g: 12,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Boiling turnip roots mellows pungent glucosinolates into sweet compounds.",
      fermentationReductionPct: 68,
      bioavailabilityUpliftDescription: "High water content and soluble fibers soothe intestinal mucosal linings."
    },
    macros: { caloriesKcal: 58, proteinG: 1.4, carbohydratesG: 10.5, fatsG: 1.8, dietaryFiberG: 3.2 },
    nutrients: [
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 25, bioavailabilityFactor: 1, note: "Immune support" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 45, bioavailabilityFactor: 1.15, note: "Plant calcium" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Bronchial congestion relief in traditional medicine", "Low-calorie satiety", "Kidney detoxification"],
      bioactiveCompounds: ["Glucosinolates", "Curcuminoids", "Quercetin"],
      digestiveTolerance: "Soft, mildly sweet, and comforting; very gentle on the stomach."
    }
  },
  {
    id: "efct-0426",
    name: "Braised Fenugreek Greens (\u12E8\u12A0\u1265\u123D \u1245\u1320\u120D)",
    nameAmharic: "\u12E8\u12A0\u1265\u123D \u1245\u1320\u120D (\u12E8\u1260\u1230\u1208)",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0426",
    traditionalPreparation: "Tender bittersweet green fenugreek shoots harvested young, blanched, and saut\xE9ed with shallots, garlic, and cold-pressed niger seed oil.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 16, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 22,
      tanninsMgPer100g: 18,
      oxalatesMgPer100g: 16,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Blanching removes bitter excess saponins while retaining therapeutic active principles.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Fenugreek leaf compounds increase insulin receptor sensitivity in peripheral tissues."
    },
    macros: { caloriesKcal: 55, proteinG: 4.4, carbohydratesG: 6, fatsG: 2.2, dietaryFiberG: 3.8 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.5, bioavailabilityFactor: 1.3, note: "Rich bioavailable leaf iron" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 195, bioavailabilityFactor: 1.25, note: "High density" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 32, bioavailabilityFactor: 1, note: "Ascorbic acid" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Postprandial hyperglycemia control", "Lactation volume stimulation in nursing women", "Appetite regulation"],
      bioactiveCompounds: ["4-Hydroxyisoleucine", "Trigonelline", "Diosgenin", "Flavonoids"],
      digestiveTolerance: "Bittersweet and warming; stimulates bile release and smooth digestion."
    }
  },
  {
    id: "efct-0427",
    name: "Wild Mustard Greens (Senafich Gomen)",
    nameAmharic: "\u12E8\u1230\u1293\u134D\u132D \u130E\u1218\u1295",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0427",
    traditionalPreparation: "Indigenous Ethiopian mustard greens (Brassica carinata) with distinctive peppery bite, braised slowly with garlic, ginger, and green chilies.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 16, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 20,
      tanninsMgPer100g: 16,
      oxalatesMgPer100g: 35,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Boiling and discarding first liquid reduces sharp allyl isothiocyanate pungency.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Thermal cooking preserves glucosinolate bioactivity while unlocking bound minerals."
    },
    macros: { caloriesKcal: 48, proteinG: 3.4, carbohydratesG: 5.8, fatsG: 2, dietaryFiberG: 3.8 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 185, bioavailabilityFactor: 1.3, note: "High bioavailability" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 380, bioavailabilityFactor: 1.25, note: "Pro-vitamin A" },
      { name: "Vitamin K", symbol: "VitK", unit: "mcg", amountPer100g: 340, bioavailabilityFactor: 1.35, note: "Bone & vascular health" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Cellular detox pathway induction (Nrf2)", "Respiratory airway clearing", "Bone mineralization"],
      bioactiveCompounds: ["Sinigrin", "Allyl isothiocyanate", "Carotenoids", "Chlorophyll"],
      digestiveTolerance: "Zesty and robust; warms the stomach and accelerates digestion."
    }
  },
  {
    id: "efct-0428",
    name: "Fresh Enset Leaf Stew (\u12E8\u12AE\u1263 \u1208\u130B \u1245\u1320\u120D)",
    nameAmharic: "\u12E8\u12AE\u1263 \u1208\u130B \u1245\u1320\u120D",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0428",
    traditionalPreparation: "Very young, tender unfurled central shoot leaves of false banana (Ensete ventricosum) shredded, blanched, and stewed with garlic, shallots, and Ethiopian cardamom.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 20, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 25,
      tanninsMgPer100g: 20,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Blanching removes astringent tannins from young leaves.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Unique enset flavonoids deliver concentrated cellular protection."
    },
    macros: { caloriesKcal: 52, proteinG: 2.8, carbohydratesG: 7.2, fatsG: 1.8, dietaryFiberG: 4.2 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 4.2, bioavailabilityFactor: 1, note: "Prebiotic enset leaf roughage" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 120, bioavailabilityFactor: 1.2, note: "Plant mineral" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.2, bioavailabilityFactor: 1.25, note: "Bioavailable iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Southern Ethiopia ancestral longevity diet", "Gut transit regularizer", "Micronutrient density in seasonal food gaps"],
      bioactiveCompounds: ["Enset polyphenols", "Chlorophyll", "Lutein"],
      digestiveTolerance: "Hearty and slightly chewy; very soothing to the colon."
    }
  },
  {
    id: "efct-0429",
    name: "Pickled Shallots with Jalape\xF1o (\u12E8\u1240\u12ED \u123D\u1295\u12A9\u122D\u1275 \u12A0\u1278\u1276)",
    nameAmharic: "\u12E8\u1240\u12ED \u123D\u1295\u12A9\u122D\u1275 \u12A0\u1278\u1276",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0429",
    traditionalPreparation: "Thinly sliced Ethiopian red shallots and jalape\xF1o rings steeped in fresh lime juice, sea salt, and black cumin for 30 minutes until bright translucent fuchsia.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 18, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 10,
      tanninsMgPer100g: 8,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Citrus acid cure tenderizes raw allium fibers without heat damage.",
      fermentationReductionPct: 45,
      bioavailabilityUpliftDescription: "Acid cure preserves 100% of quercetin bioactivity and boosts non-heme iron uptake."
    },
    macros: { caloriesKcal: 42, proteinG: 1.2, carbohydratesG: 8.5, fatsG: 0.2, dietaryFiberG: 1.8 },
    nutrients: [
      { name: "Quercetin", symbol: "Querc", unit: "mg", amountPer100g: 35, bioavailabilityFactor: 1.35, note: "High plant antioxidant flavonoid density" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 19, bioavailabilityFactor: 1.2, note: "Fresh lime & pepper" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Vascular antioxidant protection", "Allergy and mast cell stabilization via quercetin", "Fat digestion catalyst"],
      bioactiveCompounds: ["Quercetin-4'-O-beta-D-glucoside", "Allicin", "Capsaicin", "Thymoquinone"],
      digestiveTolerance: "Crisp, tart, and zesty; cuts through rich foods and promotes digestion."
    }
  },
  {
    id: "efct-0430",
    name: "Fermented Cabbage & Mustard Kraut (\u12E8\u130E\u1218\u1295 \u12A0\u121D\u1266\u1233)",
    nameAmharic: "\u12E8\u130E\u1218\u1295 \u12A0\u121D\u1266\u1233",
    category: "Vegetables & Greens",
    sourceRef: "EFCT2025-0430",
    traditionalPreparation: "Shredded cabbage and wild mustard greens salted and packed tightly in clay crocks, spontaneously lacto-fermented for 7\u201314 days with garlic, ginger, and chili.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 8,
      tanninsMgPer100g: 5,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Lactic acid fermentation completely degrades residual antinutrients.",
      fermentationReductionPct: 85,
      bioavailabilityUpliftDescription: "Probiotic Lactobacillus plantarum population exceeds 10^8 CFU/g, enhancing gut barrier function."
    },
    macros: { caloriesKcal: 32, proteinG: 1.6, carbohydratesG: 5.2, fatsG: 0.3, dietaryFiberG: 2.8 },
    nutrients: [
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 34, bioavailabilityFactor: 1.25, note: "Stabilized by low lactic pH" },
      { name: "Lactic Acid", symbol: "LA", unit: "g", amountPer100g: 1.4, bioavailabilityFactor: 1.3, note: "Natural intestinal acidifier" },
      { name: "Vitamin K2", symbol: "K2", unit: "mcg", amountPer100g: 8.5, bioavailabilityFactor: 1.3, note: "Microbially synthesized menaquinone" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Microbiome restoration after infection or antibiotics", "Digestive enzyme amplification", "Immune modulation"],
      bioactiveCompounds: ["Live probiotic lactic acid bacteria", "Isothiocyanates", "Menaquinones"],
      digestiveTolerance: "Tart, tangy, and crunchy; acts as a potent digestive catalyst."
    }
  },
  // ==========================================
  // 5. SEEDS, NUTS & OILS (22 items)
  // ==========================================
  {
    id: "efct-0501",
    name: "Roasted Telba (Flaxseed) Drink",
    nameAmharic: "\u12E8\u1270\u120D\u1263 \u12CD\u1200 / \u132D\u121B\u1242",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0501",
    traditionalPreparation: "Flaxseed (Linum usitatissimum) lightly toasted to pop, finely ground, and whisked into warm water with honey. Creates a thick soothing mucilage.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 25, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 180,
      tanninsMgPer100g: 50,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Light dry roasting thermally inactivates trace cyanogenic glycosides (linamarin).",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Roasting frees alpha-linolenic omega-3 fatty acids from cellular matrix."
    },
    macros: { caloriesKcal: 260, proteinG: 9.5, carbohydratesG: 15, fatsG: 18.5, dietaryFiberG: 13.5 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 13.5, bioavailabilityFactor: 1, note: "Superb water-soluble arabinoxylan mucilage" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 195, bioavailabilityFactor: 1, note: "High anti-stress magnesium" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 410, bioavailabilityFactor: 1, note: "Cardiovascular electrolyte" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 2.8, bioavailabilityFactor: 1, note: "Plant iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Omega-3 fatty acid intake during fasting", "Esophageal and gastric ulcer mucosal coating", "Constipation relief"],
      bioactiveCompounds: ["Alpha-linolenic acid (ALA Omega-3)", "Secoisolariciresinol diglucoside (SDG lignan)"],
      digestiveTolerance: "Supreme mucosal demulcent; coats inflamed stomach and promotes gentle bowel movement."
    }
  },
  {
    id: "efct-0502",
    name: "Suf Fitfit (Wild Safflower Seed Milk with Injera)",
    nameAmharic: "\u12E8\u1231\u134D \u134D\u1275\u134D\u1275",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0502",
    traditionalPreparation: "Safflower seeds (Carthamus tinctorius) crushed in water, filtered through fine mesh to extract rich white seed milk, seasoned with chili, and mixed with torn injera.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 34, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 110,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Crushing and cloth filtration discards hull-bound antinutrients.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Emulsified seed milk delivers bioavailable linoleic and oleic fatty acids."
    },
    macros: { caloriesKcal: 230, proteinG: 7.2, carbohydratesG: 32, fatsG: 9, dietaryFiberG: 4.8 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 115, bioavailabilityFactor: 1.2, note: "Seed milk bioavailable calcium" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 5.2, bioavailabilityFactor: 1.25, note: "Teff & safflower iron" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 125, bioavailabilityFactor: 1.1, note: "Cellular magnesium" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Essential linoleic fatty acid source during vegan fasting", "Cardiovascular lipid modulation"],
      bioactiveCompounds: ["Carthamin", "Polyunsaturated fatty acids"],
      digestiveTolerance: "Light, silky, and cooling to an irritated stomach."
    }
  },
  {
    id: "efct-0503",
    name: "Nug (Niger Seed) Paste",
    nameAmharic: "\u12E8\u1291\u130D \u1218\u1228\u1245",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0503",
    traditionalPreparation: "Indigenous Ethiopian Niger seed (Guizotia abyssinica) roasted, pounded into oily aromatic paste, used as cooking fat and seasoning during fasting seasons.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 22, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 140,
      tanninsMgPer100g: 40,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Thermal roasting and paste pressing.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Essential oil release facilitates fat-soluble vitamin absorption."
    },
    macros: { caloriesKcal: 515, proteinG: 19.5, carbohydratesG: 16, fatsG: 43, dietaryFiberG: 8.5 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 19.5, bioavailabilityFactor: 1, note: "High protein seed paste" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 7.8, bioavailabilityFactor: 1.1, note: "Seed iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 4.2, bioavailabilityFactor: 1.1, note: "High seed zinc" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 280, bioavailabilityFactor: 1, note: "Dense mineral content" }
    ],
    physiologicalNotes: {
      primaryIndications: ["High calorie fasting energy", "Cellular membrane fluidity via linoleic acid"],
      bioactiveCompounds: ["Linoleic acid (Omega-6)", "Sesamol-related lignans"],
      digestiveTolerance: "Nutritious and dense; consume in culinary moderation."
    }
  },
  {
    id: "efct-0504",
    name: "Selit Fitfit (Sesame Kernel Milk with Injera)",
    nameAmharic: "\u12E8\u1230\u120A\u1325 \u134D\u1275\u134D\u1275",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0504",
    traditionalPreparation: "White humera sesame seeds lightly roasted, pounded fine in a wooden mortar with water, strained into creamy plant milk, seasoned with chili and salt, and folded with cold fermented teff injera.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 28, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 220,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 40,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Light pan toasting followed by aqueous extraction and straining leaves the majority of outer oxalates in pomace.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Sesame kernel emulsion delivers extraordinary concentrations of bioavailable calcium, copper, and sesamin lignans."
    },
    macros: { caloriesKcal: 235, proteinG: 7.2, carbohydratesG: 22, fatsG: 13.5, dietaryFiberG: 4.2 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 280, bioavailabilityFactor: 1.25, note: "Supreme non-dairy fasting calcium source" },
      { name: "Copper", symbol: "Cu", unit: "mg", amountPer100g: 1.4, bioavailabilityFactor: 1.3, note: "Collagen synthesis & iron mobilization" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 110, bioavailabilityFactor: 1.15, note: "Neuromuscular support" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.3, note: "Sesame + teff synergistic iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Bone fracture recovery during fasting seasons", "Cardiovascular blood pressure reduction", "Skin elasticity & anti-aging"],
      bioactiveCompounds: ["Sesamin & sesamolin lignans", "Sesamol", "Vitamin E gamma-tocopherol"],
      digestiveTolerance: "Silky, nutty, and soothing; ideal during strict fasting days."
    }
  },
  {
    id: "efct-0505",
    name: "Roasted Sesame Butter (Selit Dikus)",
    nameAmharic: "\u12E8\u1230\u120A\u1325 \u12F5\u1241\u1235",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0505",
    traditionalPreparation: "Highland white sesame seeds gently dry-roasted to golden amber, stone-milled into a thick, aromatic seed butter with sea salt and a pinch of korerima.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 310,
      tanninsMgPer100g: 45,
      oxalatesMgPer100g: 50,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Thermal dry roasting breaks down antinutritional complexes and releases aromatic volatile oils.",
      fermentationReductionPct: 55,
      bioavailabilityUpliftDescription: "Stone-milling crushes cellular membranes, freeing fat-soluble tocopherols and lignans."
    },
    macros: { caloriesKcal: 595, proteinG: 18.2, carbohydratesG: 11.5, fatsG: 54, dietaryFiberG: 9.5 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 975, bioavailabilityFactor: 1.2, note: "Nearly 1000mg natural plant calcium per 100g" },
      { name: "Copper", symbol: "Cu", unit: "mg", amountPer100g: 4.1, bioavailabilityFactor: 1.25, note: "Over 400% daily baseline" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 350, bioavailabilityFactor: 1.1, note: "Cellular relaxation" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 7.8, bioavailabilityFactor: 1.15, note: "Immune and hormonal health" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Severe calcium & mineral repletion", "Cardiovascular lipid profile optimization", "Joint anti-inflammatory support"],
      bioactiveCompounds: ["Sesamin", "Sesamolin", "Phytosterols", "Gamma-tocopherol"],
      digestiveTolerance: "Rich and dense; a spoonful mixed with warm water or spread on flatbread provides lasting energy."
    }
  },
  {
    id: "efct-0506",
    name: "Roasted Ground Flax Powder (Yefetche Telba)",
    nameAmharic: "\u12E8\u1270\u1348\u1328 \u1270\u120D\u1263 (\u12F1\u1244\u1275)",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0506",
    traditionalPreparation: "Brown and golden Ethiopian flaxseeds (Linum usitatissimum) carefully parched over low heat until they pop, then immediately stone-milled into a fine meal, releasing protective oils.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 12, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 240,
      tanninsMgPer100g: 38,
      oxalatesMgPer100g: 22,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Gentle pan roasting deactivates cyanogenic linamarin glycosides completely.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Milling unbroken seed coats is essential; whole unbroken flaxseeds pass through undigested."
    },
    macros: { caloriesKcal: 535, proteinG: 18.5, carbohydratesG: 29, fatsG: 42, dietaryFiberG: 27.5 },
    nutrients: [
      { name: "Omega-3", symbol: "ALA", unit: "g", amountPer100g: 22.8, bioavailabilityFactor: 1.35, note: "Highest terrestrial plant source of ALA Omega-3" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 27.5, bioavailabilityFactor: 1, note: "Soluble mucilage and insoluble lignan matrix" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 390, bioavailabilityFactor: 1.15, note: "High cellular mineral concentration" },
      { name: "Lignans", symbol: "SDG", unit: "mg", amountPer100g: 300, bioavailabilityFactor: 1.4, note: "Antioxidant phytoestrogen support" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Systemic cardiovascular inflammation reduction", "Bowel motility and constipation relief", "Hormonal estrogen balance via lignans"],
      bioactiveCompounds: ["Secoisolariciresinol diglucoside (SDG)", "Alpha-linolenic acid", "Mucilage polysaccharides"],
      digestiveTolerance: "Gel-forming in water; deeply soothing to inflamed colon linings."
    }
  },
  {
    id: "efct-0507",
    name: "Suf Wot (Safflower Seed Cream Stew)",
    nameAmharic: "\u12E8\u1231\u134D \u12C8\u1325",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0507",
    traditionalPreparation: "Whole safflower seeds (Carthamus tinctorius) toasted, crushed with spring water to extract milky emulsion, strained of hulls, and simmered with red onions, garlic, berbere, and sliced potatoes during Great Lent.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 30, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 90,
      tanninsMgPer100g: 30,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Aqueous extraction and fine mesh straining removes indigestible fibrous hulls.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Creamy safflower emulsion provides light, highly digestible polyunsaturated lipids."
    },
    macros: { caloriesKcal: 195, proteinG: 6.8, carbohydratesG: 14.5, fatsG: 12.8, dietaryFiberG: 4.2 },
    nutrients: [
      { name: "Vitamin E", symbol: "VitE", unit: "mg", amountPer100g: 8.5, bioavailabilityFactor: 1.2, note: "From unrefined safflower lipids" },
      { name: "Linoleic Acid", symbol: "LA", unit: "g", amountPer100g: 8.2, bioavailabilityFactor: 1.1, note: "Essential omega-6 fatty acid" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 320, bioavailabilityFactor: 1, note: "Electrolyte balance" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Fasting season healthy lipid intake", "Skin dryness and eczema alleviation", "Arterial plaque defense"],
      bioactiveCompounds: ["Carthamin", "Safflor yellow", "Alpha-tocopherol"],
      digestiveTolerance: "Creamy, nutty, and light; provides richness without animal dairy."
    }
  },
  {
    id: "efct-0508",
    name: "Lewz (Peanut) Butter Traditional Dip",
    nameAmharic: "\u12E8\u1208\u12CD\u12DD \u12F5\u120D\u1205",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0508",
    traditionalPreparation: "Highland dry-roasted peanuts (Arachis hypogaea) ground on granite stones with garlic, bird's eye chili, sea salt, and a dash of warm water into a rich, savory bread spread.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 16, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 175,
      tanninsMgPer100g: 45,
      oxalatesMgPer100g: 35,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Thorough wood-fire roasting completely deactivates peanut lectins and protease blockers.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "High mono- and polyunsaturated fats slow gastric emptying and sustain steady energy."
    },
    macros: { caloriesKcal: 588, proteinG: 25, carbohydratesG: 16.5, fatsG: 49.5, dietaryFiberG: 8.5 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 25, bioavailabilityFactor: 1.05, note: "Rich in arginine and BCAAs" },
      { name: "Niacin", symbol: "B3", unit: "mg", amountPer100g: 13.5, bioavailabilityFactor: 1.1, note: "Near 100% daily requirement" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 170, bioavailabilityFactor: 1.1, note: "Metabolic cofactor" },
      { name: "Resveratrol", symbol: "Resv", unit: "mcg", amountPer100g: 145, bioavailabilityFactor: 1.25, note: "Cardiovascular polyphenol" }
    ],
    physiologicalNotes: {
      primaryIndications: ["High-calorie energy density for undernourished individuals", "Nitric oxide synthesis via high arginine", "Fasting season muscle maintenance"],
      bioactiveCompounds: ["Resveratrol", "p-Coumaric acid", "Phytosterols", "Allicin"],
      digestiveTolerance: "Rich and savory; pairs deliciously with sourdough qitta or crusty bread."
    }
  },
  {
    id: "efct-0509",
    name: "Telba Porridge (Yetelba Genfo)",
    nameAmharic: "\u12E8\u1270\u120D\u1263 \u1308\u1295\u134E",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0509",
    traditionalPreparation: "Roasted stone-ground flaxseed meal slowly whisked with boiling water and roasted barley flour into an extraordinarily thick, glossy mucilaginous porridge, hollowed and filled with niter kibbeh or oil and berbere.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 25, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 180,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Thermal roasting and liquid boiling neutralizes antinutrients.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Flax mucilage forms a viscous gel that coats the stomach lining and enhances joint synovial fluid."
    },
    macros: { caloriesKcal: 310, proteinG: 11.2, carbohydratesG: 22, fatsG: 18.5, dietaryFiberG: 14.8 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 14.8, bioavailabilityFactor: 1, note: "Colonic prebiotic and bulk former" },
      { name: "Omega-3", symbol: "ALA", unit: "g", amountPer100g: 7.2, bioavailabilityFactor: 1.3, note: "Potent anti-inflammatory lipid load" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 185, bioavailabilityFactor: 1.15, note: "Joint and muscle mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Joint pain and osteoarthritis relief (traditional Ethiopian knee-remedy)", "Severe chronic constipation reversal", "Gastric ulcer protection"],
      bioactiveCompounds: ["Soluble arabinoxylan mucilage", "Secoisolariciresinol", "Alpha-linolenic acid"],
      digestiveTolerance: "Luxuriously smooth and soothing; lubricates the entire digestive tract."
    }
  },
  {
    id: "efct-0510",
    name: "Roasted Sunflower Seeds (Yetsihay Fere)",
    nameAmharic: "\u12E8\u1340\u1210\u12ED \u134D\u122C (\u12E8\u1270\u1320\u1260\u1230)",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0510",
    traditionalPreparation: "Locally grown sunflower seeds (Helianthus annuus) cleaned, lightly brined, pan-roasted to crackling perfection, and cracked between teeth for the nutty kernel.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 18, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 190,
      tanninsMgPer100g: 30,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Pan roasting deactivates enzyme blockers and loosens hull attachment.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Sunflower kernels are among the richest dietary sources of natural Vitamin E (alpha-tocopherol)."
    },
    macros: { caloriesKcal: 580, proteinG: 20.8, carbohydratesG: 20, fatsG: 51.5, dietaryFiberG: 8.6 },
    nutrients: [
      { name: "Vitamin E", symbol: "VitE", unit: "mg", amountPer100g: 35, bioavailabilityFactor: 1.35, note: "Over 200% daily requirement of natural alpha-tocopherol" },
      { name: "Selenium", symbol: "Se", unit: "mcg", amountPer100g: 53, bioavailabilityFactor: 1.3, note: "Vital thyroid & antioxidant mineral" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 325, bioavailabilityFactor: 1.1, note: "Neuromuscular support" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Systemic cellular antioxidant membrane defense", "Thyroid hormone T4-to-T3 conversion via selenium", "Cardiovascular support"],
      bioactiveCompounds: ["Alpha-tocopherol", "Chlorogenic acid", "Phytosterols"],
      digestiveTolerance: "Crunchy and nutty; masticating kernels promotes dental and salivary health."
    }
  },
  {
    id: "efct-0511",
    name: "Roasted Pumpkin Seeds (Ye Dube Fere)",
    nameAmharic: "\u12E8\u12F1\u1263 \u134D\u122C (\u12E8\u1270\u1320\u1260\u1230)",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0511",
    traditionalPreparation: "Fresh seeds scooped from ripe yellow pumpkins, washed, sun-dried, salted, and roasted in hot clay skillets until puffed.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 16, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 175,
      tanninsMgPer100g: 25,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Dry heat roasting enhances digestibility and ruptures tough endosperm walls.",
      fermentationReductionPct: 62,
      bioavailabilityUpliftDescription: "High zinc and cucurbitin amino acids target male urological and parasitic defense."
    },
    macros: { caloriesKcal: 560, proteinG: 30, carbohydratesG: 14.5, fatsG: 49, dietaryFiberG: 6.5 },
    nutrients: [
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 7.8, bioavailabilityFactor: 1.3, note: "Key prostate and immune mineral" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 590, bioavailabilityFactor: 1.2, note: "Highest natural magnesium density of any food" },
      { name: "Tryptophan", symbol: "Trp", unit: "mg", amountPer100g: 575, bioavailabilityFactor: 1.25, note: "Serotonin and melatonin precursor for deep sleep" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Prostate health & benign prostatic hyperplasia prevention", "Deep restorative sleep promotion (tryptophan + magnesium)", "Intestinal parasite defense (cucurbitin)"],
      bioactiveCompounds: ["Cucurbitin", "Delta-7-sterols", "Zinc-protein complexes"],
      digestiveTolerance: "Nutty and crisp; highly valued in Ethiopian rural wellness traditions."
    }
  },
  {
    id: "efct-0512",
    name: "Cold-Pressed Safflower Seed Oil (\u12E8\u1231\u134D \u12D8\u12ED\u1275)",
    nameAmharic: "\u12E8\u1231\u134D \u12D8\u12ED\u1275",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0512",
    traditionalPreparation: "Raw sun-dried safflower seeds cold-pressed using traditional wooden screw presses, filtered naturally through cloth without chemical refining.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Mechanical pressing separates 100% of water-soluble and seed-meal antinutrients into press cake.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Pure unrefined lipids deliver high concentrations of natural gamma-tocopherol and plant sterols."
    },
    macros: { caloriesKcal: 884, proteinG: 0, carbohydratesG: 0, fatsG: 100, dietaryFiberG: 0 },
    nutrients: [
      { name: "Vitamin E", symbol: "VitE", unit: "mg", amountPer100g: 34, bioavailabilityFactor: 1.3, note: "Potent lipid antioxidant" },
      { name: "Linoleic Acid", symbol: "LA", unit: "g", amountPer100g: 74, bioavailabilityFactor: 1.1, note: "Essential polyunsaturated fatty acid" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Traditional fasting cooking lipid", "Cardiovascular LDL cholesterol reduction", "Skin barrier restoration"],
      bioactiveCompounds: ["Polyunsaturated fatty acids", "Phytosterols", "Alpha/gamma-tocopherols"],
      digestiveTolerance: "Light, golden, and clean; does not leave heavy greasy aftertaste."
    }
  },
  {
    id: "efct-0513",
    name: "Ethiopian Cold-Pressed Sesame Oil (\u12E8\u1230\u120A\u1325 \u12D8\u12ED\u1275)",
    nameAmharic: "\u12E8\u1230\u120A\u1325 \u12D8\u12ED\u1275",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0513",
    traditionalPreparation: "High-grade Humera white sesame seeds gently stone-pressed at ambient temperature, producing a fragrant, golden oil renowned for natural stability.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Cold extraction leaves all water-soluble phytates and oxalates in the meal cake.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "High endogenous sesamol content gives sesame oil exceptional resistance to oxidation and rancidity."
    },
    macros: { caloriesKcal: 884, proteinG: 0, carbohydratesG: 0, fatsG: 100, dietaryFiberG: 0 },
    nutrients: [
      { name: "Sesamol & Sesamin", symbol: "Ses", unit: "mg", amountPer100g: 950, bioavailabilityFactor: 1.35, note: "Unique lipid-soluble lignan antioxidants" },
      { name: "Vitamin E", symbol: "VitE", unit: "mg", amountPer100g: 28, bioavailabilityFactor: 1.25, note: "Gamma-tocopherol dominance" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Arterial endothelium protection", "Skin lipid nourishment and wound healing", "Oil pulling oral microbiome hygiene"],
      bioactiveCompounds: ["Sesamol", "Sesamolin", "Sesamin", "Oleic & linoleic fatty acids"],
      digestiveTolerance: "Smooth and aromatic; promotes healthy bile excretion."
    }
  },
  {
    id: "efct-0514",
    name: "Telba with Honey & Lemon (\u12E8\u1270\u120D\u1263 \u121B\u122D\u1293 \u120E\u121A)",
    nameAmharic: "\u12E8\u1270\u120D\u1263 \u121B\u122D\u1293 \u120E\u121A",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0514",
    traditionalPreparation: "Freshly roasted flaxseeds ground to powder, steeped in warm water into a smooth mucilaginous drink, finished with raw highland honey and fresh lime juice.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 32, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 80,
      tanninsMgPer100g: 15,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Roasting and warm liquid infusion dissolves soluble fibers.",
      fermentationReductionPct: 72,
      bioavailabilityUpliftDescription: "Vitamin C from lime juice enhances the absorption of flaxseed trace minerals."
    },
    macros: { caloriesKcal: 145, proteinG: 4.8, carbohydratesG: 18, fatsG: 7.2, dietaryFiberG: 6.5 },
    nutrients: [
      { name: "Omega-3", symbol: "ALA", unit: "g", amountPer100g: 3.8, bioavailabilityFactor: 1.35, note: "Solubilized plant Omega-3" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 16, bioavailabilityFactor: 1.1, note: "Fresh lime juice" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 6.5, bioavailabilityFactor: 1, note: "Mucilage coating" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Acid reflux and gastritis mucosal soothing", "Morning digestive awakening and regularity", "Respiratory soothing for dry coughs"],
      bioactiveCompounds: ["Soluble flaxseed mucilage", "Honey pinocembrin", "Limonene"],
      digestiveTolerance: "Velvety, sweet-tart, and deeply soothing; coats the esophagus immediately."
    }
  },
  {
    id: "efct-0515",
    name: "Roasted Castor Bean Paste (\u12E8\u1309\u120E \u12D8\u12ED\u1275)",
    nameAmharic: "\u12E8\u1309\u120E \u12D8\u12ED\u1275",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0515",
    traditionalPreparation: "Indigenous castor seeds (Ricinus communis) thoroughly boiled for hours in water to denature toxic ricin lectins, skimmed, and pressed into traditional medicinal oil (Gulo Zeyt).",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Extended boiling (>2 hours) permanently denatures water-soluble ricin protein toxin.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Purified ricinoleic acid exerts selective stimulation on EP3 prostanoid receptors in smooth muscle."
    },
    macros: { caloriesKcal: 884, proteinG: 0, carbohydratesG: 0, fatsG: 100, dietaryFiberG: 0 },
    nutrients: [
      { name: "Ricinoleic Acid", symbol: "RA", unit: "g", amountPer100g: 88, bioavailabilityFactor: 1, note: "Unique monounsaturated 12-hydroxy fatty acid" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Severe acute constipation clearing (traditional purgative)", "Labor induction assistance under midwife supervision", "Scalp and hair follicle nourishment"],
      bioactiveCompounds: ["Ricinoleic acid", "Trace sterols"],
      digestiveTolerance: "Potent purgative; taken strictly in teaspoon medicinal doses, never as cooking oil."
    }
  },
  {
    id: "efct-0516",
    name: "Roasted Cottonseed Kernels (\u12E8\u1325\u1325 \u134D\u122C)",
    nameAmharic: "\u12E8\u1325\u1325 \u134D\u122C",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0516",
    traditionalPreparation: "Cotton seeds (Gossypium hirsutum) de-linted, thoroughly wood-roasted at high heat to bind toxic gossypol polyphenols with proteins, ground into savory meal.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 20, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 220,
      tanninsMgPer100g: 50,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Thermal dry roasting binds reactive gossypol aldehydes with lysine, rendering them non-toxic.",
      fermentationReductionPct: 82,
      bioavailabilityUpliftDescription: "Processed cottonseed meal delivers concentrated vegetable protein and polyunsaturated fats."
    },
    macros: { caloriesKcal: 495, proteinG: 22, carbohydratesG: 22.5, fatsG: 36, dietaryFiberG: 12 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 22, bioavailabilityFactor: 1, note: "Plant protein reserve" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 280, bioavailabilityFactor: 1.1, note: "Cellular mineral" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 4.2, bioavailabilityFactor: 1.1, note: "Immune support" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Lowland pastoralist drought energy reserve", "High-fat protein emergency food", "Topical skin emollient"],
      bioactiveCompounds: ["Bound gossypol complexes", "Tocopherols", "Phospholipids"],
      digestiveTolerance: "Dense and heavy; consumed in modest portions alongside grains."
    }
  },
  {
    id: "efct-0517",
    name: "Sesame Halwa Habesha (\u12E8\u1230\u120A\u1325 \u1203\u120D\u12CB)",
    nameAmharic: "\u12E8\u1230\u120A\u1325 \u1203\u120D\u12CB",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0517",
    traditionalPreparation: "Toasted white sesame seeds stone-milled into tahina paste, mixed with boiled unrefined cane sugar syrup (Sukwar) and korerima, whipped until set into dense, crumbly sweet confection.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 50, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 160,
      tanninsMgPer100g: 25,
      oxalatesMgPer100g: 30,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Thermal toasting and boiling neutralizes seed antinutrients.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "High healthy fat content blunts the glycemic absorption of the cane syrup."
    },
    macros: { caloriesKcal: 510, proteinG: 12.5, carbohydratesG: 48, fatsG: 32, dietaryFiberG: 6.2 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 540, bioavailabilityFactor: 1.25, note: "Dense calcium candy" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 6.5, bioavailabilityFactor: 1.2, note: "Bioavailable plant iron" },
      { name: "Copper", symbol: "Cu", unit: "mg", amountPer100g: 2.2, bioavailabilityFactor: 1.25, note: "High trace copper" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Fasting energy treat and celebration confection", "Childhood high-mineral sweet snack", "Strenuous physical energy replenishment"],
      bioactiveCompounds: ["Sesamin", "Sesamol", "Cineole from korerima"],
      digestiveTolerance: "Sweet, nutty, and satisfying; a small piece provides substantial energy."
    }
  },
  {
    id: "efct-0518",
    name: "Roasted Nug Cake (Yetekelefe Nug) (\u12E8\u1270\u1308\u1218\u12F0 \u12E8\u1291\u130D \u1242\u1323)",
    nameAmharic: "\u12E8\u1270\u1308\u1218\u12F0 \u12E8\u1291\u130D \u1242\u1323",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0518",
    traditionalPreparation: "Residual protein-dense press cake from traditional niger seed oil pressing (Nug Ficho), mixed with warm water and sea salt, molded into cakes, and toasted on clay griddles.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 24, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 180,
      tanninsMgPer100g: 40,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Mechanical press oil-removal followed by direct griddle roasting.",
      fermentationReductionPct: 68,
      bioavailabilityUpliftDescription: "Niger seed cake is uniquely rich in sulfur amino acids (methionine & cysteine), balancing pulse proteins."
    },
    macros: { caloriesKcal: 385, proteinG: 32, carbohydratesG: 22, fatsG: 12.5, dietaryFiberG: 16.5 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 32, bioavailabilityFactor: 1.1, note: "Over 30% protein with high methionine" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 16.5, bioavailabilityFactor: 1, note: "Intense dietary roughage" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 8.5, bioavailabilityFactor: 1.2, note: "Exceptional mineral concentration" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 5.2, bioavailabilityFactor: 1.2, note: "Trace mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["High-protein recovery food during fasting", "Anemia intervention", "Methionine supplementation for vegan diets"],
      bioactiveCompounds: ["Niger seed polyphenols", "Tocopherols", "Plant lignans"],
      digestiveTolerance: "Dense and firm; best crumbled into soups or eaten with warm tea."
    }
  },
  {
    id: "efct-0519",
    name: "Walnut & Peanut Energy Paste (\u12E8\u12CB\u120D\u1290\u1270\u1293 \u1208\u12CD\u12DD \u1245\u120D\u1245\u120D)",
    nameAmharic: "\u12E8\u12CB\u120D\u1290\u1270\u1293 \u1208\u12CD\u12DD \u1245\u120D\u1245\u120D",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0519",
    traditionalPreparation: "Roasted highland peanuts and wild tree nuts crushed in a wooden mortar with pure honey, crushed korerima, and a pinch of cinnamon into an energizing paste.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 34, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 150,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 25,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Dry heat roasting breaks down enzyme blockers.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Synergy of mono- and polyunsaturated fatty acids maximizes brain lipid absorption."
    },
    macros: { caloriesKcal: 565, proteinG: 18, carbohydratesG: 28.5, fatsG: 45, dietaryFiberG: 7.2 },
    nutrients: [
      { name: "Omega-3", symbol: "ALA", unit: "g", amountPer100g: 3.5, bioavailabilityFactor: 1.25, note: "From tree nut oils" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 165, bioavailabilityFactor: 1.1, note: "Cognitive support" },
      { name: "Vitamin E", symbol: "VitE", unit: "mg", amountPer100g: 7.8, bioavailabilityFactor: 1.2, note: "Antioxidant" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Mental focus and memory support for scholars and clergy", "Post-fasting revitalization", "Stamina enhancement"],
      bioactiveCompounds: ["Ellagic acid", "Resveratrol", "Pinocembrin", "Cinnamaldehyde"],
      digestiveTolerance: "Rich, nutty, and sweet; provides smooth sustained mental energy."
    }
  },
  {
    id: "efct-0520",
    name: "Fenugreek Seed Emulsion (Yetebeke Abish)",
    nameAmharic: "\u12E8\u1270\u1260\u1320\u1260\u1320 \u12A0\u1265\u123D",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0520",
    traditionalPreparation: "Whole golden fenugreek seeds soaked in water for 24h, drained, pounded in a mortar, whipped vigorously with fresh water into a thick, frothy, white marshmallow-like foam, seasoned with honey or salt.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 110,
      tanninsMgPer100g: 28,
      oxalatesMgPer100g: 14,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "24h soaking with water changes leaches excess bitter sapogenins.",
      fermentationReductionPct: 82,
      bioavailabilityUpliftDescription: "Vigorous mechanical whipping aerates galactomannan mucilage into a protective gastric emulsion."
    },
    macros: { caloriesKcal: 110, proteinG: 7.5, carbohydratesG: 15, fatsG: 2.2, dietaryFiberG: 11.5 },
    nutrients: [
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 11.5, bioavailabilityFactor: 1, note: "Soluble galactomannan mucilage" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 6.8, bioavailabilityFactor: 1.35, note: "Bioavailable soaked seed iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 2.8, bioavailabilityFactor: 1.3, note: "Freed by steeping" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Diabetes glucose control & insulin sensitization", "Breast milk volume expansion in nursing mothers", "Appetite stimulation and healthy weight gain"],
      bioactiveCompounds: ["4-Hydroxyisoleucine", "Trigonelline", "Diosgenin", "Galactomannan"],
      digestiveTolerance: "Fluffy, cooling, and soothing; creates a demulcent shield across the stomach lining."
    }
  },
  {
    id: "efct-0521",
    name: "Roasted Watermelon Seed Kernels (\u12E8\u1200\u1265\u1200\u1265 \u134D\u122C)",
    nameAmharic: "\u12E8\u1200\u1265\u1200\u1265 \u134D\u122C (\u12E8\u1270\u1320\u1260\u1230)",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0521",
    traditionalPreparation: "Seeds collected from lowland Ethiopian watermelons (Citrullus lanatus), rinsed in brine, dried in the sun, and roasted in hot iron pans until fragrant and crackling.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 18, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 165,
      tanninsMgPer100g: 25,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Pan roasting deactivates enzyme blockers and loosens kernel hulls.",
      fermentationReductionPct: 64,
      bioavailabilityUpliftDescription: "Watermelon kernels contain up to 35% protein and exceptional levels of magnesium."
    },
    macros: { caloriesKcal: 555, proteinG: 28.5, carbohydratesG: 15.2, fatsG: 47.5, dietaryFiberG: 5.8 },
    nutrients: [
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 515, bioavailabilityFactor: 1.2, note: "Second highest food magnesium source" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 7.2, bioavailabilityFactor: 1.25, note: "Essential cellular mineral" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 7.4, bioavailabilityFactor: 1.15, note: "High seed iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Arterial blood pressure lowering", "Renal filtration support", "Male reproductive vitality"],
      bioactiveCompounds: ["Citrulline", "Arginine", "Phytosterols", "Tocopherols"],
      digestiveTolerance: "Nutty and crisp; pleasant snack without heavy aftertaste."
    }
  },
  {
    id: "efct-0522",
    name: "Mixed Seed Vitality Butter (\u12E8\u1270\u1208\u12EB\u12E9 \u134D\u122C\u12CE\u127D \u1245\u1264)",
    nameAmharic: "\u12E8\u1270\u1208\u12EB\u12E9 \u134D\u122C\u12CE\u127D \u1245\u1264",
    category: "Seeds, Nuts & Oils",
    sourceRef: "EFCT2025-0522",
    traditionalPreparation: "Toasted white sesame seeds, golden flaxseed, and hulled safflower kernels stone-ground together with sea salt and black cumin into a powerhouse seed butter.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 210,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 28,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Triple dry-pan roasting breaks down seed-coat barriers.",
      fermentationReductionPct: 66,
      bioavailabilityUpliftDescription: "Combines sesame calcium, flax Omega-3, and safflower Vitamin E into a single matrix."
    },
    macros: { caloriesKcal: 565, proteinG: 19.5, carbohydratesG: 16, fatsG: 50, dietaryFiberG: 12.8 },
    nutrients: [
      { name: "Omega-3", symbol: "ALA", unit: "g", amountPer100g: 8.5, bioavailabilityFactor: 1.35, note: "High anti-inflammatory lipid load" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 480, bioavailabilityFactor: 1.25, note: "Dense plant calcium" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 290, bioavailabilityFactor: 1.15, note: "Neuromuscular support" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 5.5, bioavailabilityFactor: 1.2, note: "Immune support" }
    ],
    physiologicalNotes: {
      primaryIndications: ["All-in-one fasting nutritional fortification", "Joint inflammation and stiffness reduction", "Cardiovascular health"],
      bioactiveCompounds: ["Sesamin", "Secoisolariciresinol", "Thymoquinone", "Phytosterols"],
      digestiveTolerance: "Creamy and rich; spreads easily on sourdough or dissolves in warm water."
    }
  },
  // ==========================================
  // 6. MEAT, POULTRY & DAIRY (38 items)
  // ==========================================
  {
    id: "efct-0601",
    name: "Doro Wot with Hardboiled Egg",
    nameAmharic: "\u12F6\u122E \u12C8\u1325 \u12A8\u12A5\u1295\u1241\u120B\u120D \u130B\u122D",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0601",
    traditionalPreparation: "Celebrated Ethiopian festive chicken stew simmered for hours in slow-caramelized red onions, niter kibbeh, ginger, garlic, and heavy berbere sauce.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 22, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Animal-source food free from plant antinutrients.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Contains meat factor which stimulates simultaneous non-heme iron absorption."
    },
    macros: { caloriesKcal: 235, proteinG: 22.5, carbohydratesG: 6.5, fatsG: 14, dietaryFiberG: 1.8 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 22.5, bioavailabilityFactor: 1, note: "Complete animal protein" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 1.8, bioavailabilityFactor: 1, note: "Essential animal-source cobalamin (75% RDA per portion)" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.8, bioavailabilityFactor: 1.8, note: "Heme iron with 25-30% direct intestinal absorption" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3.2, bioavailabilityFactor: 1.5, note: "Highly bioavailable animal zinc" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Post-fasting remineralization & B12 repletion", "Muscle mass synthesis", "Anemia recovery"],
      bioactiveCompounds: ["Carnitine", "Carnosine", "Egg lutein"],
      digestiveTolerance: "Rich and spiced; consume with plenty of teff injera."
    }
  },
  {
    id: "efct-0602",
    name: "Siga Key Wot (Beef Stew)",
    nameAmharic: "\u12E8\u1225\u130B \u1240\u12ED \u12C8\u1325",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0602",
    traditionalPreparation: "Tender beef cubes slow-simmered in berbere, caramelized red onions, garlic, and spiced clarified butter.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 18, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Animal-source food.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "High heme iron density."
    },
    macros: { caloriesKcal: 245, proteinG: 24, carbohydratesG: 5, fatsG: 15, dietaryFiberG: 1.2 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 24, bioavailabilityFactor: 1, note: "Complete mammalian protein" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.2, bioavailabilityFactor: 1.85, note: "Heme iron" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 2.1, bioavailabilityFactor: 1, note: "Near 100% daily B12 requirement" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.5, note: "Peak bioavailable zinc" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Rapid hepatic B12 store replenishment", "Zinc-dependent immune recovery"],
      bioactiveCompounds: ["Creatine", "Heme iron peptide complexes"],
      digestiveTolerance: "Substantial satiety; best paired with greens (Gomen)."
    }
  },
  {
    id: "efct-0603",
    name: "Minced Beef Kitfo (with Mitmita & Niter Kibbeh)",
    nameAmharic: "\u12AD\u1275\u134E",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0603",
    traditionalPreparation: "Finely minced extra-lean top round beef warmed with spiced clarified butter (niter kibbeh) and fiery mitmita chili powder. Served raw, leb-leb (warmed), or betam-tibsel (cooked).",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 10, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Animal protein with antioxidant spice blend.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Pure bioavailable heme iron and zinc."
    },
    macros: { caloriesKcal: 270, proteinG: 26, carbohydratesG: 1.5, fatsG: 18, dietaryFiberG: 0.5 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.6, bioavailabilityFactor: 1.9, note: "Superior heme iron absorption" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 2.4, bioavailabilityFactor: 1, note: "100% full daily RDA in 100g" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 5.2, bioavailabilityFactor: 1.6, note: "Unmatched bioavailable zinc" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 26, bioavailabilityFactor: 1, note: "Pure muscle protein" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Post-anemic recovery", "Heavy athletic power replenishment"],
      bioactiveCompounds: ["Carnitine", "CLA (Conjugated linoleic acid from grass-fed cattle)"],
      digestiveTolerance: "Raw/rare meat carries zoonotic tapeworm (Taenia saginata) risk; ensure meat is veterinary inspected or thoroughly cooked (betam-tibsel) during pregnancy."
    }
  },
  {
    id: "efct-0604",
    name: "Ayib (Fresh Ethiopian Cottage Cheese)",
    nameAmharic: "\u12A0\u12ED\u1265",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0604",
    traditionalPreparation: "Soft lactic curd cheese made by gently heating naturally fermented whole buttermilk, straining through muslin. Traditionally served alongside spicy wots and kitfo.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 25, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Lactic fermentation curdling.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Lactic acid solubilizes calcium into ionic, easily absorbed form."
    },
    macros: { caloriesKcal: 145, proteinG: 13.5, carbohydratesG: 3.5, fatsG: 8.5, dietaryFiberG: 0 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 240, bioavailabilityFactor: 1.35, note: "Highly bioavailable ionic dairy calcium" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 13.5, bioavailabilityFactor: 1, note: "Casein and whey protein" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 0.9, bioavailabilityFactor: 1, note: "Dairy B12" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Tempering acute gastrointestinal capsicum irritation", "Bone mineralization", "Sleep-supportive tryptophan"],
      bioactiveCompounds: ["Casein phosphopeptides", "L-tryptophan"],
      digestiveTolerance: "Lactic fermentation reduces lactose, making it easier to tolerate than fresh sweet milk."
    }
  },
  {
    id: "efct-0605",
    name: "Ergo (Traditional Fermented Sour Milk)",
    nameAmharic: "\u12A5\u122D\u130E",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0605",
    traditionalPreparation: "Fresh raw whole cow milk fermented spontaneously at ambient highland temperatures in smoked clay pots (Geleb). Forms rich thick curds.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 30, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Probiotic spontaneous fermentation.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Probiotic live cultures generate peptides and synthesize B vitamins."
    },
    macros: { caloriesKcal: 135, proteinG: 6.8, carbohydratesG: 8, fatsG: 8.2, dietaryFiberG: 0 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 220, bioavailabilityFactor: 1.35, note: "Lactic-bound bioavailable calcium" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 0.7, bioavailabilityFactor: 1, note: "Fermented dairy cobalamin" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 6.8, bioavailabilityFactor: 1, note: "Lactobacillus pre-digested proteins" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Gut microbiome restoration", "Recovery from antibiotic dysbiosis", "Calcium replenishment"],
      bioactiveCompounds: ["Lactobacillus acidophilus & Lactococcus lactis live strains", "Smoked pot phenolic traces"],
      digestiveTolerance: "Significantly lower lactose than sweet milk; well tolerated by lactose maldigesters."
    }
  },
  {
    id: "efct-0606",
    name: "Lake Tana Tilapia / Asa Wot (Fish Stew)",
    nameAmharic: "\u12E8\u12D3\u1223 \u12C8\u1325",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0606",
    traditionalPreparation: "Freshwater Tilapia from Lake Tana or Lake Hawassa simmered with berbere, garlic, korerima, and tomato paste.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Cooked fresh fish.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "High bioavailability white fish protein."
    },
    macros: { caloriesKcal: 175, proteinG: 20, carbohydratesG: 4, fatsG: 8.5, dietaryFiberG: 1 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 20, bioavailabilityFactor: 1, note: "High quality lean fish protein" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 2.2, bioavailabilityFactor: 1, note: "Abundant fish B12" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 2.1, bioavailabilityFactor: 1.7, note: "Heme iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 1.9, bioavailabilityFactor: 1.4, note: "Freshwater fish zinc" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Cognitive brain health", "Cardiovascular support", "Gentle non-red-meat protein"],
      bioactiveCompounds: ["EPA & DHA omega-3 precursors", "Selenium"],
      digestiveTolerance: "Light, easily digestible, and anti-inflammatory."
    }
  },
  {
    id: "efct-0607",
    name: "Sega Tibs (Saut\xE9ed Beef Strips with Rosemary)",
    nameAmharic: "\u12E8\u1260\u122C \u1235\u130B \u1325\u1265\u1235",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0607",
    traditionalPreparation: "Lean beef sirloin cubed and flash-seared in high heat with caramelized red onions, garlic, fresh rosemary sprigs (yetebes qitel), green jalape\xF1os, and spiced niter kibbeh.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "High temperature pan searing deactivates surface microorganisms while preserving tender muscle interior.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Pure heme iron exhibits 25\u201335% absorption efficiency, unaffected by plant phytates or polyphenols."
    },
    macros: { caloriesKcal: 250, proteinG: 26.5, carbohydratesG: 2.2, fatsG: 15.5, dietaryFiberG: 0.5 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 26.5, bioavailabilityFactor: 1.25, note: "Complete human essential amino acid score" },
      { name: "Heme Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.8, bioavailabilityFactor: 1.6, note: "High bioavailable heme iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 6.2, bioavailabilityFactor: 1.45, note: "Peak zinc density" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 2.4, bioavailabilityFactor: 1.35, note: "Full daily adult RDA per serving" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Rapid iron repletion after fasting seasons", "Muscle hypertrophy and athletic power", "Cellular energy synthesis"],
      bioactiveCompounds: ["Carnosine", "Creatine", "Rosmarinic acid", "Conjugated linoleic acid (CLA)"],
      digestiveTolerance: "Well-seared lean beef with rosemary aids gastric digestive motility."
    }
  },
  {
    id: "efct-0608",
    name: "Beg Tibs (Saut\xE9ed Highland Lamb with Kibbeh)",
    nameAmharic: "\u12E8\u1260\u130D \u1325\u1265\u1235",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0608",
    traditionalPreparation: "Grass-fed highland Ethiopian lamb (Beg) cubed with succulent fat cap, pan-saut\xE9ed vigorously with niter kibbeh, shallots, garlic, korerima, and fresh rosemary.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "High temperature pan searing.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Free-range highland pasture grazing produces high levels of beneficial omega-3 and CLA in lamb fat."
    },
    macros: { caloriesKcal: 295, proteinG: 23.5, carbohydratesG: 1.8, fatsG: 22, dietaryFiberG: 0.4 },
    nutrients: [
      { name: "Heme Iron", symbol: "Fe", unit: "mg", amountPer100g: 2.9, bioavailabilityFactor: 1.55, note: "Bioavailable heme iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 5.4, bioavailabilityFactor: 1.4, note: "High bioaccessible zinc" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 2.6, bioavailabilityFactor: 1.35, note: "Essential cobalamin" },
      { name: "Selenium", symbol: "Se", unit: "mcg", amountPer100g: 28, bioavailabilityFactor: 1.3, note: "Thyroid protection" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Holiday festive celebration refeeding", "Warming energy during cold highland climates", "Vitality and hormone synthesis"],
      bioactiveCompounds: ["Conjugated linoleic acid (CLA)", "Carnitine", "Rosmarinic acid"],
      digestiveTolerance: "Rich and tender; eaten piping hot with fermented injera and awaze dip."
    }
  },
  {
    id: "efct-0609",
    name: "Gored Gored (Cubed Raw Lean Beef with Awaze)",
    nameAmharic: "\u130E\u1228\u12F5 \u130E\u1228\u12F5",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0609",
    traditionalPreparation: "Freshly butchered, prime lean beef tenderloin trimmed of fat, cut into bite-sized cubes, and tossed raw in warm melted niter kibbeh, hot awaze paste, and coarse sea salt.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Fresh butcher selection within hours of slaughter; raw preparation preserves heat-sensitive vitamins.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Zero heat cooking retains 100% of native bioavailable B-vitamins, creatine, and cellular enzymes."
    },
    macros: { caloriesKcal: 210, proteinG: 27.5, carbohydratesG: 1.2, fatsG: 10.5, dietaryFiberG: 0.2 },
    nutrients: [
      { name: "Heme Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.6, bioavailabilityFactor: 1.65, note: "Undenatured native heme iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 6.8, bioavailabilityFactor: 1.5, note: "Highest biological availability" },
      { name: "Creatine", symbol: "Crt", unit: "mg", amountPer100g: 450, bioavailabilityFactor: 1.4, note: "Preserved completely in raw muscle" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Immediate physical vitality and stamina", "Post-fasting intense muscle rebuilding", "High-iron replenishment"],
      bioactiveCompounds: ["Native creatine", "Carnosine", "Coenzyme Q10", "Capsaicin"],
      digestiveTolerance: "Tender and melt-in-mouth; warm kibbeh and piquant awaze stimulate digestive juices."
    }
  },
  {
    id: "efct-0610",
    name: "Doro Alicha Wot (Mild Festive Chicken Stew)",
    nameAmharic: "\u12E8\u12F6\u122E \u12A0\u120D\u132B \u12C8\u1325",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0610",
    traditionalPreparation: "Free-range country chicken (Yenat Doro) butchered into 12 traditional cuts, skin removed, slow-simmered in sweet onions, turmeric, ginger, garlic, and korerima with hard-boiled eggs.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 20, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Multi-hour slow simmering of bone-in chicken extracts gelatin and marrow minerals.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Turmeric curcuminoids and chicken marrow lipids form an easily digestible anti-inflammatory broth."
    },
    macros: { caloriesKcal: 195, proteinG: 24, carbohydratesG: 4.5, fatsG: 9, dietaryFiberG: 1 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 24, bioavailabilityFactor: 1.25, note: "Lean poultry complete protein" },
      { name: "Niacin", symbol: "B3", unit: "mg", amountPer100g: 9.8, bioavailabilityFactor: 1.15, note: "Energy metabolic cofactor" },
      { name: "Phosphorus", symbol: "P", unit: "mg", amountPer100g: 220, bioavailabilityFactor: 1.1, note: "Bone mineral" },
      { name: "Choline", symbol: "Chol", unit: "mg", amountPer100g: 85, bioavailabilityFactor: 1.2, note: "From hard-boiled egg yolk" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Gentle post-fasting transition for sensitive stomachs", "Convalescent recovery from fevers", "Childhood protein nourishment"],
      bioactiveCompounds: ["Curcumin", "Gelatin / collagen peptides", "Gingerols"],
      digestiveTolerance: "Mild, aromatic, and comforting; no harsh chili pepper irritation."
    }
  },
  {
    id: "efct-0611",
    name: "Beg Wot (Rich Lamb Stew with Berbere)",
    nameAmharic: "\u12E8\u1260\u130D \u1240\u12ED \u12C8\u1325",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0611",
    traditionalPreparation: "Highland bone-in lamb chunks slow-simmered for hours in caramelized red onions, rich berbere spice, garlic, ginger, and korerima until the meat falls off the bone.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 22, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Long simmering breaks down connective collagen into soluble gelatin.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Gelatin coats the intestinal lining while enhancing mineral and electrolyte absorption."
    },
    macros: { caloriesKcal: 260, proteinG: 22, carbohydratesG: 5.5, fatsG: 16.8, dietaryFiberG: 1.4 },
    nutrients: [
      { name: "Heme Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.2, bioavailabilityFactor: 1.55, note: "High bioavailable mineral" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.4, note: "Immune support" },
      { name: "Gelatin / Collagen", symbol: "Col", unit: "g", amountPer100g: 3.8, bioavailabilityFactor: 1.3, note: "Gut-barrier repair" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Holiday festive celebration centerpiece", "Joint cartilage rebuilding via natural gelatin", "Winter thermal energy"],
      bioactiveCompounds: ["Capsaicin", "Collagen peptides", "Conjugated linoleic acid"],
      digestiveTolerance: "Hearty, rich, and deeply satisfying; best enjoyed with fermented teff injera."
    }
  },
  {
    id: "efct-0612",
    name: "Beg Alicha Wot (Mild Yellow Lamb Stew)",
    nameAmharic: "\u12E8\u1260\u130D \u12A0\u120D\u132B \u12C8\u1325",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0612",
    traditionalPreparation: "Tender bone-in mutton slow-cooked with mounds of sweet red shallots, crushed garlic, fresh ginger root, korerima, and golden turmeric, creating a silky yellow gravy.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 18, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Low-heat prolonged simmering.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Turmeric and black pepper piperine compounds synergistically optimize curcuminoid uptake."
    },
    macros: { caloriesKcal: 245, proteinG: 21.5, carbohydratesG: 4.8, fatsG: 15.5, dietaryFiberG: 1.1 },
    nutrients: [
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 4.5, bioavailabilityFactor: 1.4, note: "Trace mineral" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 2.2, bioavailabilityFactor: 1.35, note: "High cobalamin" },
      { name: "Selenium", symbol: "Se", unit: "mcg", amountPer100g: 24, bioavailabilityFactor: 1.25, note: "Thyroid protection" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Post-illness protein recovery without chili heat", "Joint and tendon rebuilding", "Elderly nutrition"],
      bioactiveCompounds: ["Curcumin", "1,8-Cineole", "Gingerols", "Carnosine"],
      digestiveTolerance: "Extremely tender and mild; does not aggravate acid-sensitive stomachs."
    }
  },
  {
    id: "efct-0613",
    name: "Kikel / Beg Kikel (Highland Lamb & Bone Broth Stew)",
    nameAmharic: "\u12E8\u1260\u130D \u1245\u1240\u120D",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0613",
    traditionalPreparation: "Bone-in lamb shanks, ribs, and marrow joints simmered for 3+ hours in highland spring water with crushed ginger, whole garlic cloves, turmeric, and sliced jalape\xF1o; served piping hot in broth bowls.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 10, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Long slow bone decoction extracts bioavailable collagen, glycine, and glucosamine.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Warm bone broth delivers glycine and proline directly to repair damaged mucosal enterocytes."
    },
    macros: { caloriesKcal: 185, proteinG: 22, carbohydratesG: 2, fatsG: 10, dietaryFiberG: 0.3 },
    nutrients: [
      { name: "Glycine & Proline", symbol: "Gly", unit: "g", amountPer100g: 4.5, bioavailabilityFactor: 1.45, note: "Gut lining repair & collagen synthesis" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 65, bioavailabilityFactor: 1.35, note: "Leached from bone matrix" },
      { name: "Phosphorus", symbol: "P", unit: "mg", amountPer100g: 195, bioavailabilityFactor: 1.25, note: "Bone mineral" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 5.1, bioavailabilityFactor: 1.4, note: "High bioavailability" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Convalescent hospital recovery protocol", "Postpartum maternal revitalization", "Inflammatory bowel & leaky gut repair"],
      bioactiveCompounds: ["Collagen peptides", "Hyaluronic acid", "Glucosamine", "Chondroitin sulfate"],
      digestiveTolerance: "Light, restorative, and instantly hydrating; widely prescribed in Ethiopian folk medicine."
    }
  },
  {
    id: "efct-0614",
    name: "Derek Tibs (Crispy Pan-Charred Beef)",
    nameAmharic: "\u12F0\u1228\u1245 \u1325\u1265\u1235",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0614",
    traditionalPreparation: "Lean beef cubes cooked in a bone-dry iron wok over scorching heat until deeply charred and crisp outside while tender inside, served on sizzling clay pedestals with awaze and mitmita.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "High intense dry heat cooking.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Minimal surface fat retention concentrates protein density per gram."
    },
    macros: { caloriesKcal: 235, proteinG: 31, carbohydratesG: 0.5, fatsG: 12, dietaryFiberG: 0.1 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 31, bioavailabilityFactor: 1.25, note: "Ultra-concentrated animal protein" },
      { name: "Heme Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.1, bioavailabilityFactor: 1.6, note: "Highly bioavailable" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 7.2, bioavailabilityFactor: 1.45, note: "Cellular renewal" }
    ],
    physiologicalNotes: {
      primaryIndications: ["High-protein athletic diets", "Low-carb ketogenic nutrition", "Rapid muscle rebuilding"],
      bioactiveCompounds: ["Carnosine", "Anserine", "Creatine"],
      digestiveTolerance: "Crispy and savory; dip in awaze to supply moisture and digestive spices."
    }
  },
  {
    id: "efct-0615",
    name: "Quanta Firfir (Dried Cured Beef Jerky with Injera)",
    nameAmharic: "\u124B\u1295\u1323 \u134D\u122D\u134D\u122D",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0615",
    traditionalPreparation: "Traditional sun-cured spiced beef jerky (quanta) rehydrated and simmered in spicy berbere, red onions, garlic, and niter kibbeh, then folded with pieces of fermented teff injera.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 42, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 110,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Sun-drying of beef and fermentation of injera combined with spicy reduction.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Quanta's dense protein matrix hydrates slowly, creating a balanced, high-satiety breakfast."
    },
    macros: { caloriesKcal: 285, proteinG: 18.5, carbohydratesG: 32, fatsG: 10.5, dietaryFiberG: 4.2 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 7.5, bioavailabilityFactor: 1.5, note: "Heme quanta iron + teff iron synergy" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 18.5, bioavailabilityFactor: 1.2, note: "High quality complete protein" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 4.2, bioavailabilityFactor: 1.35, note: "Immune support" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Holiday celebration morning breakfast", "Strenuous field endurance fueling", "Anemia recovery"],
      bioactiveCompounds: ["Capsaicin", "Carnosine", "Resistant retrograded starch"],
      digestiveTolerance: "Savory, hearty, and deeply comforting; a legendary Ethiopian morning meal."
    }
  },
  {
    id: "efct-0616",
    name: "Zilzil Tibs (Long Strips of Sizzling Beef)",
    nameAmharic: "\u12DD\u120D\u12DD\u120D \u1325\u1265\u1235",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0616",
    traditionalPreparation: "Tender strips of skirt or flank beef marinated in garlic, korerima, and rosemary, sizzled over hot charcoal coals or cast iron griddles with fresh green chili peppers.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "High direct heat flash grilling.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Marination in garlic and spices suppresses heterocyclic amine formation during high-heat grilling."
    },
    macros: { caloriesKcal: 245, proteinG: 27, carbohydratesG: 1.5, fatsG: 14.5, dietaryFiberG: 0.3 },
    nutrients: [
      { name: "Heme Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.5, bioavailabilityFactor: 1.6, note: "Highly bioavailable" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 6, bioavailabilityFactor: 1.45, note: "Peak zinc" },
      { name: "Vitamin B6", symbol: "B6", unit: "mg", amountPer100g: 0.55, bioavailabilityFactor: 1.2, note: "Neurological metabolism" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Athletic recovery", "Post-work hospitality feast", "Lean protein repletion"],
      bioactiveCompounds: ["Rosmarinic acid", "Allicin", "Carnosine"],
      digestiveTolerance: "Tender and juicy; long grain strips are easy to chew."
    }
  },
  {
    id: "efct-0617",
    name: "Shekla Tibs (Beef Served Sizzling in Clay Pot)",
    nameAmharic: "\u12E8\u1238\u12AD\u120B \u1325\u1265\u1235",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0617",
    traditionalPreparation: "Tender beef pieces flash-saut\xE9ed with onions, rosemary, and kibbeh, transferred to an elevated earthenware clay bowl (shekla) heated from beneath by glowing wood embers.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Continuous gentle heat on clay prevents fat burning.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Slow steady warmth keeps meat fats in fluid liquid state, enhancing gastric lipase digestion."
    },
    macros: { caloriesKcal: 260, proteinG: 25.5, carbohydratesG: 2, fatsG: 17, dietaryFiberG: 0.4 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 25.5, bioavailabilityFactor: 1.25, note: "High quality protein" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.6, bioavailabilityFactor: 1.6, note: "Heme iron" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 2.5, bioavailabilityFactor: 1.35, note: "Cobalamin" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Social festive gatherings", "Thermal warming in cold highland evenings", "Sustained athletic energy"],
      bioactiveCompounds: ["Rosmarinic acid", "Kibbeh terpenes", "Carnosine"],
      digestiveTolerance: "Sizzling and aromatic; eaten warm with fresh injera."
    }
  },
  {
    id: "efct-0618",
    name: "Minchet Abish (Spiced Ground Beef Stew)",
    nameAmharic: "\u121D\u1295\u1278\u1275 \u12A0\u1265\u123D (\u1240\u12ED)",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0618",
    traditionalPreparation: "Lean beef ground very fine, simmered slowly in caramelized red onions, rich berbere, garlic, and ground fenugreek (abish), topped with sliced hard-boiled eggs.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 20, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 15,
      tanninsMgPer100g: 10,
      oxalatesMgPer100g: 8,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Fine mincing and slow braising with fenugreek hydrolyzes connective fibers.",
      fermentationReductionPct: 80,
      bioavailabilityUpliftDescription: "Fenugreek galactomannans smooth glucose release while ground beef provides instant amino acid availability."
    },
    macros: { caloriesKcal: 220, proteinG: 22.5, carbohydratesG: 4.8, fatsG: 12.5, dietaryFiberG: 1.5 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.2, bioavailabilityFactor: 1.55, note: "Heme iron from ground beef" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 5.5, bioavailabilityFactor: 1.4, note: "Trace mineral" },
      { name: "Choline", symbol: "Chol", unit: "mg", amountPer100g: 65, bioavailabilityFactor: 1.2, note: "Egg yolk choline" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Easy-to-chew protein for elderly and convalescent individuals", "Anemia recovery", "Metabolic glucose control via fenugreek"],
      bioactiveCompounds: ["4-Hydroxyisoleucine from fenugreek", "Capsaicin", "Carnosine"],
      digestiveTolerance: "Finely ground texture is exceptionally gentle on digestion."
    }
  },
  {
    id: "efct-0619",
    name: "Minchet Abish Alicha (Mild Spiced Minced Beef Stew)",
    nameAmharic: "\u121D\u1295\u1278\u1275 \u12A0\u1265\u123D \u12A0\u120D\u132B",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0619",
    traditionalPreparation: "Finely ground beef simmered in a delicate golden turmeric, shallot, garlic, ginger, and fenugreek broth, studded with hard-boiled eggs.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 18, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 12,
      tanninsMgPer100g: 8,
      oxalatesMgPer100g: 6,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Gentle low-heat braising.",
      fermentationReductionPct: 85,
      bioavailabilityUpliftDescription: "Mild non-acidic broth ideal for ulcer patients requiring high-protein tissue healing."
    },
    macros: { caloriesKcal: 210, proteinG: 22, carbohydratesG: 4.2, fatsG: 11.8, dietaryFiberG: 1.2 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 22, bioavailabilityFactor: 1.25, note: "Complete animal protein" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 5.2, bioavailabilityFactor: 1.4, note: "Tissue healing mineral" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 2.1, bioavailabilityFactor: 1.35, note: "Cobalamin" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Gastric ulcer convalescence needing protein", "Pediatric growth", "Post-surgical healing"],
      bioactiveCompounds: ["Curcumin", "Fenugreek trigonelline", "Gingerols"],
      digestiveTolerance: "Delicate, smooth, and easily digestible."
    }
  },
  {
    id: "efct-0620",
    name: "Dullet (Minced Tripe, Liver & Lean Beef)",
    nameAmharic: "\u12F1\u1208\u1275",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0620",
    traditionalPreparation: "Fresh beef tripe (chigwara), liver (tifat), and lean flank minced superfine by hand, quickly saut\xE9ed in spiced niter kibbeh with fiery mitmita, onions, and jalape\xF1os.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Fresh butchering, washing with lime/salt, and rapid flash pan saut\xE9.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Beef liver provides the world's most concentrated source of preformed Vitamin A, Vitamin B12, and bioavailable copper."
    },
    macros: { caloriesKcal: 195, proteinG: 24.5, carbohydratesG: 1.8, fatsG: 10.2, dietaryFiberG: 0.3 },
    nutrients: [
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 3850, bioavailabilityFactor: 1.6, note: "Over 400% daily Vitamin A requirement via natural retinol" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 18.5, bioavailabilityFactor: 1.5, note: "Highest natural concentration in human diet" },
      { name: "Heme Iron", symbol: "Fe", unit: "mg", amountPer100g: 7.8, bioavailabilityFactor: 1.65, note: "Rapid anemia reversal" },
      { name: "Copper", symbol: "Cu", unit: "mg", amountPer100g: 3.4, bioavailabilityFactor: 1.45, note: "Ceruloplasmin synthesis" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Rapid multi-micronutrient restoration", "Pernicious and iron-deficiency anemia reversal", "Immune rebuilding"],
      bioactiveCompounds: ["Preformed retinol", "CoQ10", "Glutathione", "Capsaicin"],
      digestiveTolerance: "Piquant, savory, and rich; traditionally consumed with fresh fermented teff injera."
    }
  },
  {
    id: "efct-0621",
    name: "Tripe Stew / Shifinfin (\u12E8\u1328\u1313\u122B \u12C8\u1325 / \u123D\u134D\u1295\u134D\u1295)",
    nameAmharic: "\u12E8\u1328\u1313\u122B \u12C8\u1325 / \u123D\u134D\u1295\u134D\u1295",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0621",
    traditionalPreparation: "Beef honeycomb tripe meticulously cleaned with lemon and coarse salt, sliced into strips, and slow-simmered for 4 hours in caramelized onions and spicy berbere.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Multi-hour slow simmering tenderizes dense collagenous honeycomb matrix.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Natural elastin and collagen peptides soothe and seal the human intestinal mucosa."
    },
    macros: { caloriesKcal: 165, proteinG: 19.5, carbohydratesG: 3.5, fatsG: 8.2, dietaryFiberG: 0.8 },
    nutrients: [
      { name: "Gelatin / Collagen", symbol: "Col", unit: "g", amountPer100g: 5.2, bioavailabilityFactor: 1.4, note: "Connective tissue healing" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3.5, bioavailabilityFactor: 1.35, note: "Cellular renewal" },
      { name: "Selenium", symbol: "Se", unit: "mcg", amountPer100g: 22, bioavailabilityFactor: 1.25, note: "Antioxidant enzyme cofactor" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Intestinal mucosal barrier repair (like-cures-like organotherapy)", "Low-fat high-protein nourishment", "Joint connective tissue support"],
      bioactiveCompounds: ["Collagen", "Elastin", "Capsaicin", "Allium sulfur molecules"],
      digestiveTolerance: "Tender and chewy; slow cooking makes it easy on digestion."
    }
  },
  {
    id: "efct-0622",
    name: "Ergo (Traditional Fermented Whole Milk Yogurt)",
    nameAmharic: "\u12A5\u122D\u130E",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0622",
    traditionalPreparation: "Fresh whole raw cow or goat milk collected in wood-smoked earthenware vessels (insera), spontaneously cultured with lactic acid bacteria for 48\u201372h into a thick, creamy, tart curd.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 30, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Wild lactic fermentation ferments lactose into lactic acid, dropping pH to 4.1.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Lactose reduced by >70%; calcium and phosphate solubilize into ionic, easily absorbed states."
    },
    macros: { caloriesKcal: 68, proteinG: 3.6, carbohydratesG: 4.2, fatsG: 4, dietaryFiberG: 0 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 135, bioavailabilityFactor: 1.4, note: "Peak bioavailability in acidic lactic medium" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 3.6, bioavailabilityFactor: 1.3, note: "Pre-digested casein curds" },
      { name: "Probiotics", symbol: "CFU", unit: "M", amountPer100g: 450, bioavailabilityFactor: 1.4, note: "Lactobacillus and Lactococcus strains" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Gut dysbiosis and antibiotic recovery", "Lactose intolerance calcium repletion", "Gastric ulcer cooling"],
      bioactiveCompounds: ["Live probiotic lactic acid bacteria", "Conjugated linoleic acid", "Bioactive dairy peptides"],
      digestiveTolerance: "Thick, tart, and cooling; well-tolerated by individuals who cannot drink fresh milk."
    }
  },
  {
    id: "efct-0623",
    name: "Agwat (Clarified Whey from Ayib Production)",
    nameAmharic: "\u12A0\u1313\u1275",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0623",
    traditionalPreparation: "The golden translucent whey separated after gently heating buttermilk/ergo to precipitate ayib curd, cooled and enjoyed as a refreshing, mineral-packed probiotic beverage.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 35, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Lactic fermentation followed by thermal curd separation.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Contains soluble alpha-lactalbumin and beta-lactoglobulin whey proteins with rapid 20-minute gastric transit."
    },
    macros: { caloriesKcal: 28, proteinG: 1.2, carbohydratesG: 4.8, fatsG: 0.3, dietaryFiberG: 0 },
    nutrients: [
      { name: "Whey Protein", symbol: "Whey", unit: "g", amountPer100g: 1.2, bioavailabilityFactor: 1.45, note: "Fastest-absorbing protein known" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 95, bioavailabilityFactor: 1.4, note: "Fully ionic soluble calcium" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 160, bioavailabilityFactor: 1, note: "Hydrating mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Post-exercise rapid electrolyte & amino acid delivery", "Gentle kidney cleansing and diuretic hydration", "Hepatic glutathione synthesis"],
      bioactiveCompounds: ["Alpha-lactalbumin", "Lactoferrin traces", "Lactic acid"],
      digestiveTolerance: "Light, tart, and deeply hydrating; passes through the stomach effortlessly."
    }
  },
  {
    id: "efct-0624",
    name: "Asa Tibs (Crispy Pan-Fried Whole Tilapia)",
    nameAmharic: "\u12E8\u12D3\u1223 \u1325\u1265\u1235",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0624",
    traditionalPreparation: "Fresh Rift Valley lake tilapia (Oreochromis niloticus) scored deeply, marinated in lemon, garlic, and korerima, lightly dusted in teff flour, and fried crisp in vegetable oil.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "High temperature frying.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "High heat makes crispy small bones edible, delivering significant dietary calcium."
    },
    macros: { caloriesKcal: 215, proteinG: 22.5, carbohydratesG: 2, fatsG: 13, dietaryFiberG: 0.2 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 22.5, bioavailabilityFactor: 1.25, note: "Easily digested fish protein" },
      { name: "Selenium", symbol: "Se", unit: "mcg", amountPer100g: 45, bioavailabilityFactor: 1.35, note: "Antioxidant protection" },
      { name: "Phosphorus", symbol: "P", unit: "mg", amountPer100g: 210, bioavailabilityFactor: 1.15, note: "Bone mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["High-protein fasting option during fish-permitted fasts", "Thyroid health via selenium", "Cardiovascular support"],
      bioactiveCompounds: ["Omega-3 fatty acids", "Selenium-protein complexes"],
      digestiveTolerance: "Crisp outside and flaky inside; very easy on the digestive tract."
    }
  },
  {
    id: "efct-0625",
    name: "Asa Lebleb (Quick-Poached Spiced Fish Fillets)",
    nameAmharic: "\u12E8\u12D3\u1223 \u1208\u1265\u1208\u1265",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0625",
    traditionalPreparation: "Tender freshwater tilapia or Nile perch fillets cubed and flash-poached in hot spiced oil with garlic, ginger, shallots, jalape\xF1o, and rosemary for just 2\u20133 minutes.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Flash poaching preserves delicate fish proteins.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Gentle heat preserves heat-sensitive omega-3 fatty acids and vitamin D."
    },
    macros: { caloriesKcal: 155, proteinG: 21, carbohydratesG: 1.5, fatsG: 7.5, dietaryFiberG: 0.2 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 21, bioavailabilityFactor: 1.3, note: "Ultra-digestible fish protein" },
      { name: "Vitamin D", symbol: "VitD", unit: "IU", amountPer100g: 140, bioavailabilityFactor: 1.25, note: "Bone and immune health" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 340, bioavailabilityFactor: 1, note: "Electrolyte balance" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Convalescent protein recovery", "Gentle non-fried fish nutrition", "Cognitive clarity"],
      bioactiveCompounds: ["DHA & EPA traces", "Allicin", "Rosmarinic acid"],
      digestiveTolerance: "Silky, tender, and effortless to digest; ideal for sensitive stomachs."
    }
  },
  {
    id: "efct-0626",
    name: "Asa Dulet (Minced Fish Saut\xE9ed with Herbs)",
    nameAmharic: "\u12E8\u12D3\u1223 \u12F1\u1208\u1275",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0626",
    traditionalPreparation: "Boneless fresh tilapia fillets finely minced by hand, saut\xE9ed in vegetable oil with diced red onions, fiery mitmita, sliced jalape\xF1os, and fresh lime juice.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Flash pan saut\xE9.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Finely minced fish protein maximizes surface area for rapid enzymatic cleavage in stomach."
    },
    macros: { caloriesKcal: 165, proteinG: 22, carbohydratesG: 2.2, fatsG: 7.8, dietaryFiberG: 0.4 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 22, bioavailabilityFactor: 1.3, note: "High quality complete protein" },
      { name: "Selenium", symbol: "Se", unit: "mcg", amountPer100g: 40, bioavailabilityFactor: 1.35, note: "Cellular defense" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 12, bioavailabilityFactor: 1.1, note: "Fresh lime juice" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Fasting season festive celebration dish", "Cardiovascular support", "Metabolic stimulation"],
      bioactiveCompounds: ["Capsaicin", "Allicin", "Omega-3 fatty acids"],
      digestiveTolerance: "Piquant, light, and tender; leaves zero feeling of heaviness."
    }
  },
  {
    id: "efct-0627",
    name: "Asa Cutlet (Spiced Fish Croquette)",
    nameAmharic: "\u12E8\u12D3\u1223 \u12AB\u1275\u120C\u1275",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0627",
    traditionalPreparation: "Flaked cooked lake fish mashed with boiled potatoes, minced garlic, ginger, fresh herbs, and korerima, formed into patties, and shallow-fried golden.",
    fastingSuitability: "dual",
    glycemicIndex: { value: 45, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 15,
      tanninsMgPer100g: 8,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Double thermal cooking breaks down antinutrients.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Combines fish animal protein with potassium-dense potato matrix."
    },
    macros: { caloriesKcal: 195, proteinG: 14.5, carbohydratesG: 16, fatsG: 8.5, dietaryFiberG: 1.8 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 14.5, bioavailabilityFactor: 1.2, note: "Balanced fish protein" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 380, bioavailabilityFactor: 1, note: "Hydration balance" },
      { name: "Phosphorus", symbol: "P", unit: "mg", amountPer100g: 170, bioavailabilityFactor: 1.1, note: "Bone health" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Child-friendly fish nutrition", "Hospitality appetizers", "Light protein snack"],
      bioactiveCompounds: ["Gingerols", "1,8-Cineole", "Fish peptides"],
      digestiveTolerance: "Soft inside with golden crust; very gentle on the stomach."
    }
  },
  {
    id: "efct-0628",
    name: "Gomen Be Siga (Collards Braised with Beef & Ribs)",
    nameAmharic: "\u130E\u1218\u1295 \u1260\u1235\u130B",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0628",
    traditionalPreparation: "Highland collard greens braised together with bone-in beef short ribs, spiced niter kibbeh, garlic, ginger, and green chilies until meltingly tender.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 18, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 15,
      tanninsMgPer100g: 12,
      oxalatesMgPer100g: 35,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Long slow braising with animal fat reduces soluble oxalates.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "The 'Meat Factor' in beef triples non-heme iron and calcium absorption from the collard greens."
    },
    macros: { caloriesKcal: 235, proteinG: 18.5, carbohydratesG: 6.2, fatsG: 15.5, dietaryFiberG: 3.8 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 165, bioavailabilityFactor: 1.35, note: "Leafy green + bone mineral" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.5, bioavailabilityFactor: 1.5, note: "Heme + non-heme synergy" },
      { name: "Vitamin K", symbol: "VitK", unit: "mcg", amountPer100g: 280, bioavailabilityFactor: 1.4, note: "High bioaccessible Vitamin K" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Bone density fortification", "Anemia reversal", "Cold weather deeply nourishing meal"],
      bioactiveCompounds: ["Sulforaphane", "Carnosine", "Kibbeh butyrate"],
      digestiveTolerance: "Tender and comforting; collards balance the richness of the beef."
    }
  },
  {
    id: "efct-0629",
    name: "Dinich Be Siga (Potato & Beef Simmered Stew)",
    nameAmharic: "\u12F5\u1295\u127D \u1260\u1235\u130B",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0629",
    traditionalPreparation: "Tender cubed beef simmered with potato quarters in a rich, mild turmeric or spicy berbere gravy with caramelized onions and garlic.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 48, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 20,
      tanninsMgPer100g: 12,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Simmering hydrolyzes antinutrients.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Beef protein and lipids moderate the glycemic response of the potatoes."
    },
    macros: { caloriesKcal: 210, proteinG: 16.5, carbohydratesG: 16, fatsG: 9.5, dietaryFiberG: 2.2 },
    nutrients: [
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 460, bioavailabilityFactor: 1, note: "High potato potassium" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.2, bioavailabilityFactor: 1.45, note: "Heme iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 3.8, bioavailabilityFactor: 1.35, note: "Trace mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Comforting family meal", "Children's balanced growth", "Post-fasting gradual refeeding"],
      bioactiveCompounds: ["Carnosine", "Chlorogenic acid", "Allicin"],
      digestiveTolerance: "Soft, satisfying, and easy to digest."
    }
  },
  {
    id: "efct-0630",
    name: "Fasolia Be Siga (Green Beans & Beef Saut\xE9)",
    nameAmharic: "\u134B\u1236\u120A\u12EB \u1260\u1235\u130B",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0630",
    traditionalPreparation: "French green beans and sweet carrots sliced and stir-fried with strips of lean beef, onions, garlic, and turmeric until tender-crisp.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 30, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 25,
      tanninsMgPer100g: 15,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Saut\xE9ing green beans preserves crispness while breaking down lectins.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Beta-carotene from carrots and iron from beef absorbed with high efficiency."
    },
    macros: { caloriesKcal: 175, proteinG: 15.2, carbohydratesG: 9.5, fatsG: 8.8, dietaryFiberG: 3.2 },
    nutrients: [
      { name: "Beta-Carotene", symbol: "bCar", unit: "mcg", amountPer100g: 1200, bioavailabilityFactor: 1.3, note: "From carrots" },
      { name: "Heme Iron", symbol: "Fe", unit: "mg", amountPer100g: 2.8, bioavailabilityFactor: 1.5, note: "Bioavailable beef iron" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 14, bioavailabilityFactor: 1, note: "Green bean ascorbic acid" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Balanced low-glycemic meal", "Weight management", "Cardiovascular support"],
      bioactiveCompounds: ["Curcumin", "Carotenoids", "Allicin"],
      digestiveTolerance: "Crisp and colorful; exceptionally well-tolerated."
    }
  },
  {
    id: "efct-0631",
    name: "Qey Sega Tibs (Spicy Red Pepper Beef Stir-Fry)",
    nameAmharic: "\u1240\u12ED \u12E8\u1260\u122C \u1325\u1265\u1235",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0631",
    traditionalPreparation: "Tender beef sirloin flashed in hot kibbeh with awaze paste, sliced jalape\xF1os, red onions, garlic, and fresh rosemary sprigs.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "High temperature flash searing.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Awaze capsaicin enhances digestive secretion and mucosal perfusion."
    },
    macros: { caloriesKcal: 255, proteinG: 26, carbohydratesG: 2.8, fatsG: 15.8, dietaryFiberG: 0.6 },
    nutrients: [
      { name: "Heme Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.8, bioavailabilityFactor: 1.6, note: "High bioavailable iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 5.8, bioavailabilityFactor: 1.45, note: "Peak zinc" },
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 110, bioavailabilityFactor: 1.25, note: "From awaze & kibbeh" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Metabolic stimulation", "Athletic power and iron reloading", "Cold weather warmth"],
      bioactiveCompounds: ["Capsaicin", "Rosmarinic acid", "Carnosine"],
      digestiveTolerance: "Fiery and savory; pairs perfectly with soft teff injera."
    }
  },
  {
    id: "efct-0632",
    name: "Enkulal Firfir (Scrambled Eggs with Onions & Peppers)",
    nameAmharic: "\u12A5\u1295\u1241\u120B\u120D \u134D\u122D\u134D\u122D",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0632",
    traditionalPreparation: "Fresh farm eggs scrambled gently in niter kibbeh or oil with finely minced red onions, tomatoes, garlic, jalape\xF1os, and sea salt.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Gentle heat denatures egg avidin, unlocking 100% of biotin bioavailability.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Cooking eggs unlocks complete 100% biological value protein and makes choline fully bioaccessible."
    },
    macros: { caloriesKcal: 165, proteinG: 11.5, carbohydratesG: 3.2, fatsG: 11.8, dietaryFiberG: 0.6 },
    nutrients: [
      { name: "Choline", symbol: "Chol", unit: "mg", amountPer100g: 220, bioavailabilityFactor: 1.35, note: "Brain neurotransmitter & liver cell health" },
      { name: "Lutein & Zeaxanthin", symbol: "Lut", unit: "mcg", amountPer100g: 480, bioavailabilityFactor: 1.4, note: "High bioavailable egg yolk carotenoids" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 1.1, bioavailabilityFactor: 1.3, note: "Cellular renewal" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Morning cognitive fuel & focus", "Childhood brain and ocular development", "Gentle complete protein breakfast"],
      bioactiveCompounds: ["Choline", "Lutein", "Quercetin from onions"],
      digestiveTolerance: "Fluffy, tender, and fast to digest; suitable for all ages."
    }
  },
  {
    id: "efct-0633",
    name: "Enkulal Be Siga (Scrambled Eggs with Minced Meat)",
    nameAmharic: "\u12A5\u1295\u1241\u120B\u120D \u1260\u1235\u130B",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0633",
    traditionalPreparation: "Spiced minced beef saut\xE9ed until browned, then folded with farm eggs, sliced jalape\xF1os, tomatoes, and red onions in niter kibbeh.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 12, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Cooking denatures avidin and breaks down meat connective tissues.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Dual animal protein sources provide comprehensive amino acid coverage with zero antinutrients."
    },
    macros: { caloriesKcal: 225, proteinG: 18.5, carbohydratesG: 2.8, fatsG: 15.5, dietaryFiberG: 0.5 },
    nutrients: [
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 18.5, bioavailabilityFactor: 1.25, note: "Complete animal protein" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 3.2, bioavailabilityFactor: 1.55, note: "Heme iron" },
      { name: "Choline", symbol: "Chol", unit: "mg", amountPer100g: 185, bioavailabilityFactor: 1.3, note: "Brain and liver support" }
    ],
    physiologicalNotes: {
      primaryIndications: ["High-power breakfast for physical labor", "Bodybuilding muscle repair", "Sustained satiety"],
      bioactiveCompounds: ["Choline", "Carnosine", "Allicin"],
      digestiveTolerance: "Hearty and savory; provides stable energy for 5+ hours."
    }
  },
  {
    id: "efct-0634",
    name: "Camel Milk (Fresh & Fermented Lowland Milk)",
    nameAmharic: "\u12E8\u130D\u1218\u120D \u12C8\u1270\u1275",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0634",
    traditionalPreparation: "Fresh or spontaneously fermented milk from Somali and Afar dromedary camels, drunk raw or slightly soured in smoked wooden vessels (Gorfa).",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 25, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Naturally lacks beta-lactoglobulin, the primary allergen in cow's milk.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Contains micro-vesicular insulin-like peptides that survive stomach acid intact, aiding glycemic control."
    },
    macros: { caloriesKcal: 52, proteinG: 3.4, carbohydratesG: 4.5, fatsG: 2.8, dietaryFiberG: 0 },
    nutrients: [
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 5.2, bioavailabilityFactor: 1.35, note: "Triple the Vitamin C of cow's milk" },
      { name: "Lactoferrin", symbol: "Lf", unit: "mg", amountPer100g: 48, bioavailabilityFactor: 1.4, note: "Potent antimicrobial and iron transporter" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 155, bioavailabilityFactor: 1, note: "Electrolyte" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Type 1 and Type 2 diabetes glycemic regulation", "Severe cow dairy allergies (zero beta-lactoglobulin)", "Autism spectrum and autoimmune modulation"],
      bioactiveCompounds: ["Insulin-like proteins", "Lactoferrin", "Nanobodies (single-domain antibodies)"],
      digestiveTolerance: "Light, slightly salty, and easily digested; causes zero dairy mucus formation."
    }
  },
  {
    id: "efct-0635",
    name: "Goat Milk (Highland Raw Fermented Milk)",
    nameAmharic: "\u12E8\u134D\u12E8\u120D \u12C8\u1270\u1275",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0635",
    traditionalPreparation: "Milk collected from free-ranging highland goats feeding on diverse acacia and medicinal browse, fermented naturally into light tart curds.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 28, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "A2-casein and smaller fat globules allow rapid gastric digestion within 30 minutes.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Medium-chain fatty acids (capric, caprylic, caproic) are absorbed directly via portal vein."
    },
    macros: { caloriesKcal: 69, proteinG: 3.6, carbohydratesG: 4.4, fatsG: 4.1, dietaryFiberG: 0 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 135, bioavailabilityFactor: 1.4, note: "Highly bioavailable" },
      { name: "MCTs", symbol: "MCT", unit: "g", amountPer100g: 1.2, bioavailabilityFactor: 1.35, note: "Instant liver fuel" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 200, bioavailabilityFactor: 1, note: "Electrolyte balance" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Pediatric failure to thrive", "Cow milk sensitivity and eczema", "Rapid energy recovery"],
      bioactiveCompounds: ["A2 beta-casein", "Oligosaccharides similar to human breast milk", "Medium-chain triglycerides"],
      digestiveTolerance: "Soft curd structure; digests twice as fast as bovine milk."
    }
  },
  {
    id: "efct-0636",
    name: "Ayib with Collard Greens (\u12A0\u12ED\u1265 \u1260\u130E\u1218\u1295)",
    nameAmharic: "\u12A0\u12ED\u1265 \u1260\u130E\u1218\u1295",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0636",
    traditionalPreparation: "Fresh crumbly cow cottage curd (ayib) blended with finely minced steamed highland collard greens, melted niter kibbeh, and a touch of mitmita.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 24, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 15,
      tanninsMgPer100g: 10,
      oxalatesMgPer100g: 30,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Ayib's calcium precipitates collard oxalates into insoluble, harmless gut complexes.",
      fermentationReductionPct: 80,
      bioavailabilityUpliftDescription: "Dual calcium source: dairy curd + brassica greens yields optimal bone mineralization."
    },
    macros: { caloriesKcal: 155, proteinG: 12, carbohydratesG: 5.5, fatsG: 9.5, dietaryFiberG: 2.8 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 220, bioavailabilityFactor: 1.35, note: "Dual animal-plant calcium matrix" },
      { name: "Protein", symbol: "Pro", unit: "g", amountPer100g: 12, bioavailabilityFactor: 1.25, note: "High quality casein protein" },
      { name: "Vitamin K", symbol: "VitK", unit: "mcg", amountPer100g: 180, bioavailabilityFactor: 1.3, note: "From dark collards" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Bone fracture recovery & osteopenia prevention", "Dental enamel mineralization", "Soothing side dish against spicy stews"],
      bioactiveCompounds: ["Sulforaphane", "Casein phosphopeptides", "Lutein"],
      digestiveTolerance: "Cooling, creamy, and gentle on the stomach."
    }
  },
  {
    id: "efct-0637",
    name: "Bone Marrow & Cartilage Stew (\u12E8\u1240\u1295\u12F5 \u12A8\u1265\u1275 \u1245\u120D\u1325\u121D)",
    nameAmharic: "\u12E8\u1240\u1295\u12F5 \u12A8\u1265\u1275 \u1245\u120D\u1325\u121D",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0637",
    traditionalPreparation: "Large beef marrow bones and articular joints cracked and slow-simmered for 6+ hours with ginger, turmeric, and garlic until gelatin melts and marrow slides out.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Multi-hour bone extraction.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Directly supplies alkylglycerols, glucosamine, chondroitin, and collagen peptides."
    },
    macros: { caloriesKcal: 310, proteinG: 14.5, carbohydratesG: 0.5, fatsG: 28, dietaryFiberG: 0 },
    nutrients: [
      { name: "Collagen & Gelatin", symbol: "Col", unit: "g", amountPer100g: 6.8, bioavailabilityFactor: 1.45, note: "Direct gut barrier and joint renewal" },
      { name: "Phosphorus", symbol: "P", unit: "mg", amountPer100g: 145, bioavailabilityFactor: 1.2, note: "Bone mineral" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 2.8, bioavailabilityFactor: 1.5, note: "Marrow heme iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Severe joint degeneration & osteoarthritis", "Immune cell production via marrow alkylglycerols", "Leaky gut barrier repair"],
      bioactiveCompounds: ["Alkylglycerols", "Hyaluronic acid", "Glucosamine", "Adiponectin"],
      digestiveTolerance: "Rich and gelatinous; traditional restorative consumed warm."
    }
  },
  {
    id: "efct-0638",
    name: "Yebeg Chibto (Roasted Seasoned Lamb Ribs)",
    nameAmharic: "\u12E8\u1260\u130D \u132D\u1265\u1326",
    category: "Meat, Poultry & Dairy",
    sourceRef: "EFCT2025-0638",
    traditionalPreparation: "Highland lamb ribs and breast rub-marinated in coarse sea salt, korerima, and rosemary, spit-roasted over slow-burning acacia wood coals until crisp-skinned.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Wood-fire spit roasting renders excess surface fat.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Wood coals impart phenolic smoke compounds while fat rendering preserves high bioavailable zinc."
    },
    macros: { caloriesKcal: 320, proteinG: 21, carbohydratesG: 0.8, fatsG: 26.5, dietaryFiberG: 0.1 },
    nutrients: [
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 5.8, bioavailabilityFactor: 1.4, note: "High bioavailable zinc" },
      { name: "Heme Iron", symbol: "Fe", unit: "mg", amountPer100g: 2.6, bioavailabilityFactor: 1.55, note: "Heme iron" },
      { name: "Vitamin B12", symbol: "B12", unit: "mcg", amountPer100g: 2.4, bioavailabilityFactor: 1.35, note: "Cobalamin" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Celebration feast hospitality", "Winter calorie replenishment", "Mineral repletion"],
      bioactiveCompounds: ["Conjugated linoleic acid", "Rosmarinic acid", "Carnitine"],
      digestiveTolerance: "Savory and tender; pair with fresh tomato salad to aid digestion."
    }
  },
  // ==========================================
  // 7. SPICES & NUTRIENT AMPLIFIERS (16 items)
  // ==========================================
  {
    id: "efct-0701",
    name: "Traditional Ethiopian Berbere Paste",
    nameAmharic: "\u1260\u122D\u1260\u122C",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0701",
    traditionalPreparation: "Sun-dried red peppers de-seeded, blended with korerima (cardamom), fenugreek (abish), cloves, ginger, garlic, rue (tena adam), and holy basil, slow roasted and ground into vibrant crimson powder.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 25, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 50,
      tanninsMgPer100g: 65,
      oxalatesMgPer100g: 35,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Sun-drying, deseeded chili pods, dry roasting and slow aging.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Capsaicin and piperine stimulate mesenteric blood flow, multiplying nutrient absorption."
    },
    macros: { caloriesKcal: 290, proteinG: 12.5, carbohydratesG: 48, fatsG: 9.5, dietaryFiberG: 22 },
    nutrients: [
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 1450, bioavailabilityFactor: 1, note: "High carotenoid concentration from sun-dried peppers" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 12, bioavailabilityFactor: 1.1, note: "Spice mineral iron" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 35, bioavailabilityFactor: 0.8, note: "Residual sun-dried vitamin C" },
      { name: "Dietary Fiber", symbol: "Fib", unit: "g", amountPer100g: 22, bioavailabilityFactor: 1, note: "Dietary spice fiber" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Peripheral circulation stimulation", "Thermogenic metabolism elevation", "Antimicrobial food preservation"],
      bioactiveCompounds: ["Capsaicin", "4-terpineol from korerima", "Trigonelline from fenugreek"],
      digestiveTolerance: "Strong thermogenic spice; moderate in active gastric ulcers or severe reflux."
    }
  },
  {
    id: "efct-0702",
    name: "Mitmita Spice Blend",
    nameAmharic: "\u121A\u1325\u121A\u1323",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0702",
    traditionalPreparation: "Pungent bird's eye chili peppers (Capsicum frutescens) ground with Ethiopian cardamom (korerima), whole cloves (qurunfud), and sea salt.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 20, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 40,
      tanninsMgPer100g: 45,
      oxalatesMgPer100g: 20,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Dry roasting and fine milling.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Clove eugenol acts as natural carminative and gastro-protective agent."
    },
    macros: { caloriesKcal: 310, proteinG: 11, carbohydratesG: 52, fatsG: 10, dietaryFiberG: 24 },
    nutrients: [
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 1800, bioavailabilityFactor: 1, note: "Dense provitamin A" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 9.5, bioavailabilityFactor: 1, note: "Spice iron" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 140, bioavailabilityFactor: 1, note: "Spice mineral trace" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Acute peripheral vasodilation", "Antimicrobial food defense when consuming raw kitfo"],
      bioactiveCompounds: ["Capsaicinoids", "Eugenol from cloves"],
      digestiveTolerance: "Very high heat; use sparingly as pinch condiment."
    }
  },
  {
    id: "efct-0703",
    name: "Niter Kibbeh (Ethiopian Clarified Spiced Butter)",
    nameAmharic: "\u1295\u1325\u122D \u1245\u1264",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0703",
    traditionalPreparation: "Cultured highland cow butter simmered on low heat until milk solids precipitate, clarified and infused with korerima, koseret (Lippia abyssinica), tikur azmud (nigella), ginger, and garlic.",
    fastingSuitability: "non_fasting",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 0,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Clarification completely removes water and milk solids.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Essential fat carrier that multiplies absorption of fat-soluble vitamins (A, D, E, K) from greens."
    },
    macros: { caloriesKcal: 884, proteinG: 0.3, carbohydratesG: 0, fatsG: 99.5, dietaryFiberG: 0 },
    nutrients: [
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 850, bioavailabilityFactor: 1, note: "True preformed retinol from grass-fed highland cattle" },
      { name: "Vitamin D", symbol: "VitD", unit: "IU", amountPer100g: 65, bioavailabilityFactor: 1, note: "Natural dairy vitamin D" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Carotenoid and fat-soluble vitamin absorption catalyst", "Conjugated linoleic acid (CLA) delivery"],
      bioactiveCompounds: ["Butyric acid", "Koseret terpenes", "Thymoquinone traces from tikur azmud"],
      digestiveTolerance: "Milk solids removed; well tolerated by lactose sensitive individuals."
    }
  },
  {
    id: "efct-0704",
    name: "Awaze Paste (Fermented Berbere & Tej Paste)",
    nameAmharic: "\u12A0\u12CB\u12DC",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0704",
    traditionalPreparation: "Finely ground berbere master spice blend whipped with aged Ethiopian honey wine (tej), minced garlic, grated ginger, and korerima into a smooth, piquant fermented dipping sauce.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 25, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 25,
      tanninsMgPer100g: 35,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Fermentation in acidic honey wine (pH 3.6) breaks down spice antinutrients and liberates capsaicinoids.",
      fermentationReductionPct: 78,
      bioavailabilityUpliftDescription: "Alcohol and acid in tej act as natural solvents, extracting and stabilizing lipid-soluble carotenoids."
    },
    macros: { caloriesKcal: 110, proteinG: 3.5, carbohydratesG: 18, fatsG: 2.2, dietaryFiberG: 4.8 },
    nutrients: [
      { name: "Vitamin A", symbol: "VitA", unit: "mcg", amountPer100g: 680, bioavailabilityFactor: 1.45, note: "Concentrated red pepper carotenoids" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 45, bioavailabilityFactor: 1.25, note: "Natural antioxidant" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 4.5, bioavailabilityFactor: 1.35, note: "Mobilized spice iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Digestive fire (Agni) stimulation", "Metabolic thermogenesis and circulation", "Antimicrobial food preservation"],
      bioactiveCompounds: ["Capsaicin", "Dihydrocapsaicin", "Gingerols", "Pinocembrin"],
      digestiveTolerance: "Fiery yet balanced; acidic honey wine base stimulates healthy gastric secretions."
    }
  },
  {
    id: "efct-0705",
    name: "Korerima Seeds (Ethiopian Black Cardamom)",
    nameAmharic: "\u12AE\u1228\u122A\u121B",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0705",
    traditionalPreparation: "Sun-dried indigenous pods of Aframomum corrorima cracked to release fragrant brown seeds, toasted lightly, and stone-ground into an essential warming spice.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 30,
      tanninsMgPer100g: 45,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Sun drying in pod husk followed by pan toasting.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "High 1,8-cineole terpene content stimulates biliary and pancreatic lipase enzymes."
    },
    macros: { caloriesKcal: 310, proteinG: 10.8, carbohydratesG: 58, fatsG: 4.2, dietaryFiberG: 28 },
    nutrients: [
      { name: "Manganese", symbol: "Mn", unit: "mg", amountPer100g: 28, bioavailabilityFactor: 1.3, note: "World-class dietary manganese concentration" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 13.5, bioavailabilityFactor: 1.2, note: "Dense trace iron" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 7.5, bioavailabilityFactor: 1.15, note: "Trace mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Carminative relief from intestinal gas and cramping", "Bronchial airway relaxation and decongestion", "Gastric mucosal barrier reinforcement"],
      bioactiveCompounds: ["1,8-Cineole", "Terpinyl acetate", "Sabinene", "Limonene"],
      digestiveTolerance: "Intensely aromatic, warm, and comforting; eliminates stomach spasms."
    }
  },
  {
    id: "efct-0706",
    name: "Koseret Leaves (Lippia adoensis)",
    nameAmharic: "\u12AE\u1230\u1228\u1275",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0706",
    traditionalPreparation: "Shade-dried aromatic leaves of the highland shrub Lippia adoensis var. koseret, infused into clarified butter (niter kibbeh) or steeped as a medicinal herbal infusion.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 15,
      tanninsMgPer100g: 30,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Shade drying preserves volatile terpenes while breaking down bitter glucuronides.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Lippia monoterpenes dissolve directly into dairy lipids, acting as natural preservatives against lipid oxidation."
    },
    macros: { caloriesKcal: 260, proteinG: 12, carbohydratesG: 44, fatsG: 3.5, dietaryFiberG: 32 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 1250, bioavailabilityFactor: 1.2, note: "Dense dried herb mineral matrix" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 22, bioavailabilityFactor: 1.15, note: "Highland herb iron" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Natural antimicrobial lipid preservation in niter kibbeh", "Digestive spasm and colic relief", "Systemic antioxidant protection"],
      bioactiveCompounds: ["Linalool", "Limonene", "Lippiaphenol", "Carvacrol"],
      digestiveTolerance: "Sweet, minty, and herbaceous; profoundly soothing to the nervous and digestive systems."
    }
  },
  {
    id: "efct-0707",
    name: "Tena'adam / Rue Seed Pods & Leaves (\u1324\u1293 \u12A0\u12F3\u121D)",
    nameAmharic: "\u1324\u1293 \u12A0\u12F3\u121D",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0707",
    traditionalPreparation: "Fresh leaves and green seed pods of Ruta chalepensis dipped whole into hot coffee cups or pounded fresh with salt into fresh ayib cottage cheese.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 0, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 10,
      tanninsMgPer100g: 20,
      oxalatesMgPer100g: 8,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Brief hot beverage infusion or acid maceration releases volatile flavone glycosides.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "Rutin from rue strengthens capillary walls and prevents microvascular fragility."
    },
    macros: { caloriesKcal: 45, proteinG: 2.2, carbohydratesG: 8, fatsG: 0.6, dietaryFiberG: 4.5 },
    nutrients: [
      { name: "Rutin", symbol: "Rut", unit: "mg", amountPer100g: 320, bioavailabilityFactor: 1.4, note: "Premier natural capillary-strengthening bioflavonoid" },
      { name: "Vitamin C", symbol: "VitC", unit: "mg", amountPer100g: 28, bioavailabilityFactor: 1.1, note: "Antioxidant" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Abdominal colic and indigestion calming", "Capillary fragility & varicose vein support", "Coffee acidity buffer and aroma enhancer"],
      bioactiveCompounds: ["Rutin", "Furanocoumarins (bergapten)", "Chalepensin", "Essential oils"],
      digestiveTolerance: "Pungent and intensely aromatic; traditionally used in moderation (a sprig or two) for digestive mastery."
    }
  },
  {
    id: "efct-0708",
    name: "Besobila (Ethiopian Sacred Basil) (\u1260\u1236\u1262\u120B)",
    nameAmharic: "\u1260\u1236\u1262\u120B",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0708",
    traditionalPreparation: "Sun-dried flower spikes and leaves of Ocimum basilicum var. thyrsiflorum stone-ground and incorporated into berbere, shiro, and spiced clarified butter.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 20,
      tanninsMgPer100g: 25,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Shade drying preserves monoterpenes and hydrolyzes volatile precursors.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Essential volatile oils suppress food spoilage microorganisms naturally."
    },
    macros: { caloriesKcal: 250, proteinG: 14.5, carbohydratesG: 48, fatsG: 4, dietaryFiberG: 38 },
    nutrients: [
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 18, bioavailabilityFactor: 1.2, note: "Dense herb mineral baseline" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 1600, bioavailabilityFactor: 1.2, note: "Concentrated dried leaf calcium" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Signature aromatherapeutic stabilizer in Ethiopian cooking", "Antimicrobial food safety", "Gastric relaxation"],
      bioactiveCompounds: ["Methyl chavicol (estragole)", "Linalool", "Eugenol", "Rosmarinic acid"],
      digestiveTolerance: "Sweet, spicy, and uplifting; calms digestive cramping and elevates mood."
    }
  },
  {
    id: "efct-0709",
    name: "Tikur Azmud (Black Cumin / Nigella sativa)",
    nameAmharic: "\u1325\u1241\u122D \u12A0\u12DD\u1219\u12F5",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0709",
    traditionalPreparation: "Small matte-black seeds of Nigella sativa dry-roasted lightly and folded into bread doughs (dabo), spiced butter, or infused in warm water with honey as universal tonic.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 10, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 45,
      tanninsMgPer100g: 30,
      oxalatesMgPer100g: 12,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Light dry toasting volatilizes thymoquinone and hydrolyzes seed-coat complexes.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Thymoquinone is one of nature's most thoroughly researched broad-spectrum anti-inflammatory molecules."
    },
    macros: { caloriesKcal: 375, proteinG: 16, carbohydratesG: 44, fatsG: 15, dietaryFiberG: 12 },
    nutrients: [
      { name: "Thymoquinone", symbol: "TQ", unit: "mg", amountPer100g: 1200, bioavailabilityFactor: 1.45, note: "World-class therapeutic quinone" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 10.5, bioavailabilityFactor: 1.2, note: "Seed trace mineral" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 4.8, bioavailabilityFactor: 1.2, note: "Immune support" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Universal panacea in traditional medicine ('cures everything except death')", "Asthma and bronchial airway spasm reduction", "Autoimmune and inflammatory modulation"],
      bioactiveCompounds: ["Thymoquinone", "Thymohydroquinone", "Dithymoquinone", "Nigellone"],
      digestiveTolerance: "Pungent, warm, and slightly bitter; promotes smooth gastrointestinal motility."
    }
  },
  {
    id: "efct-0710",
    name: "Nech Azmud (White Cumin / Bishop's Weed / Ajwain)",
    nameAmharic: "\u1290\u132D \u12A0\u12DD\u1219\u12F5",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0710",
    traditionalPreparation: "Thymol-rich striped seeds of Trachyspermum ammi dry-roasted on clay pans, crushed fine, and infused into breads, clarified butter, or warm infusions for colic.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 12, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 35,
      tanninsMgPer100g: 25,
      oxalatesMgPer100g: 10,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Pan toasting activates volatile thymol fraction.",
      fermentationReductionPct: 68,
      bioavailabilityUpliftDescription: "Thymol accelerates gastric acid and digestive enzyme release in the upper GI tract."
    },
    macros: { caloriesKcal: 305, proteinG: 15.5, carbohydratesG: 43, fatsG: 18, dietaryFiberG: 21 },
    nutrients: [
      { name: "Thymol", symbol: "Thy", unit: "mg", amountPer100g: 2100, bioavailabilityFactor: 1.4, note: "Exceptional antibacterial & antispasmodic monoterpene" },
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 1500, bioavailabilityFactor: 1.2, note: "Dense seed calcium" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Instant relief from acute bloating and severe intestinal flatulence", "Respiratory antimicrobial therapy", "Gut dysbiosis suppression"],
      bioactiveCompounds: ["Thymol (35\u201360% of essential oil)", "gamma-Terpinene", "p-Cymene"],
      digestiveTolerance: "Intensely pungent, warm, and aromatic; eliminates gas within minutes."
    }
  },
  {
    id: "efct-0711",
    name: "Senafich (Pungent Ethiopian Brown Mustard Paste)",
    nameAmharic: "\u1230\u1293\u134D\u132D",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0711",
    traditionalPreparation: "Brown mustard seeds (Brassica nigra) stone-ground fine, activated with cold spring water and a splash of vinegar to trigger myrosinase enzyme conversion, beaten into sharp nasal-clearing condiment.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 60,
      tanninsMgPer100g: 25,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Cold water activation allows endogenous myrosinase to convert 100% of sinigrin into volatile allyl isothiocyanate.",
      fermentationReductionPct: 75,
      bioavailabilityUpliftDescription: "Isothiocyanates induce Phase II hepatic detoxifying enzymes (glutathione S-transferase)."
    },
    macros: { caloriesKcal: 165, proteinG: 10.5, carbohydratesG: 14, fatsG: 9.2, dietaryFiberG: 6.8 },
    nutrients: [
      { name: "Allyl Isothiocyanate", symbol: "AITC", unit: "mg", amountPer100g: 450, bioavailabilityFactor: 1.45, note: "Potent phase II detox inducer" },
      { name: "Selenium", symbol: "Se", unit: "mcg", amountPer100g: 65, bioavailabilityFactor: 1.35, note: "High antioxidant trace mineral" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 180, bioavailabilityFactor: 1.15, note: "Metabolic mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Hepatic phase II detoxification acceleration", "Sinus and nasal congestion clearing", "Essential condiment with Azifa and Kitfo"],
      bioactiveCompounds: ["Allyl isothiocyanate", "Sinigrin", "Glucosinolates"],
      digestiveTolerance: "Fiery sharp pungency that rises through the sinuses; cleanses the palate and stimulates digestion."
    }
  },
  {
    id: "efct-0712",
    name: "Ird (Ethiopian Highland Turmeric Powder)",
    nameAmharic: "\u12A5\u122D\u12F5",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0712",
    traditionalPreparation: "Highland cultivated turmeric rhizomes (Curcuma longa) boiled, sun-dried, peeled, and pulverized into brilliant golden-yellow spice powder, the cornerstone of Alicha wots.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 20, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 40,
      tanninsMgPer100g: 30,
      oxalatesMgPer100g: 35,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Boiling rhizomes prior to sun drying gelatinizes starch and stabilizes curcuminoids.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Simmering in oil alongside shallots and garlic increases curcumin bioavailability by 2000%."
    },
    macros: { caloriesKcal: 312, proteinG: 7.8, carbohydratesG: 65, fatsG: 3.2, dietaryFiberG: 21 },
    nutrients: [
      { name: "Curcuminoids", symbol: "Curc", unit: "mg", amountPer100g: 3800, bioavailabilityFactor: 1.4, note: "World-class systemic anti-inflammatory polyphenol" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 41, bioavailabilityFactor: 1.1, note: "Extremely dense mineral baseline" },
      { name: "Manganese", symbol: "Mn", unit: "mg", amountPer100g: 7.8, bioavailabilityFactor: 1.2, note: "Superoxide dismutase cofactor" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Systemic NF-kB inflammatory cytokine downregulation", "Joint arthritis and tendon relief", "Hepatic liver protective antioxidant"],
      bioactiveCompounds: ["Curcumin", "Demetoxycurcumin", "Turmerones", "Zingiberene"],
      digestiveTolerance: "Earthy, warm, and mild; remarkably gentle on all gastric conditions."
    }
  },
  {
    id: "efct-0713",
    name: "Zinjibil (Sun-Dried Highland Ginger Powder)",
    nameAmharic: "\u12DD\u1295\u1305\u1265\u120D",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0713",
    traditionalPreparation: "Fresh highland ginger rhizomes (Zingiber officinale) sliced, dried under the intense highland sun, and ground into pungent, warming spice powder.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 25,
      tanninsMgPer100g: 20,
      oxalatesMgPer100g: 15,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Sun drying converts pungent gingerols into more potent shogaols.",
      fermentationReductionPct: 65,
      bioavailabilityUpliftDescription: "Shogaols exert strong antispasmodic and anti-nausea action on gastrointestinal 5-HT3 receptors."
    },
    macros: { caloriesKcal: 335, proteinG: 9, carbohydratesG: 71, fatsG: 4.2, dietaryFiberG: 14 },
    nutrients: [
      { name: "Gingerols & Shogaols", symbol: "Ging", unit: "mg", amountPer100g: 1450, bioavailabilityFactor: 1.4, note: "Potent gastrointestinal prokinetic & anti-nausea" },
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 1320, bioavailabilityFactor: 1, note: "Concentrated electrolyte" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 214, bioavailabilityFactor: 1.15, note: "Muscular relaxation" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Gastric emptying stimulation and nausea prevention", "Delayed-onset muscle soreness reduction", "Respiratory antimicrobial warming"],
      bioactiveCompounds: ["6-Gingerol", "6-Shogaol", "Zingiberene", "Paradol"],
      digestiveTolerance: "Warm, spicy, and digestive-clearing; accelerates sluggish stomach transit."
    }
  },
  {
    id: "efct-0714",
    name: "Abish (Whole Fenugreek Seeds)",
    nameAmharic: "\u12A0\u1265\u123D (\u134D\u122C)",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0714",
    traditionalPreparation: "Whole dried hard golden seeds of Trigonella foenum-graecum, lightly roasted to tame bitterness, and stone-ground into medicinal and culinary master powders.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 180,
      tanninsMgPer100g: 45,
      oxalatesMgPer100g: 18,
      trypsinInhibitorLevel: "low",
      traditionalDegradationMethod: "Roasting and prolonged steeping hydrolyzes bitter sapogenin bonds.",
      fermentationReductionPct: 70,
      bioavailabilityUpliftDescription: "High soluble galactomannan content slows carbohydrate absorption and normalizes postprandial glucose."
    },
    macros: { caloriesKcal: 323, proteinG: 23, carbohydratesG: 58, fatsG: 6.4, dietaryFiberG: 25 },
    nutrients: [
      { name: "Soluble Galactomannan", symbol: "Gal", unit: "g", amountPer100g: 20, bioavailabilityFactor: 1.35, note: "Viscous glucose-blunting soluble fiber" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 33.5, bioavailabilityFactor: 1.25, note: "Exceptional mineral density" },
      { name: "4-Hydroxyisoleucine", symbol: "4-HIL", unit: "mg", amountPer100g: 550, bioavailabilityFactor: 1.4, note: "Glucose-dependent insulin stimulator" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Diabetic glycemic normalization", "Maternal breast milk volume stimulation", "Serum triglyceride and LDL reduction"],
      bioactiveCompounds: ["4-Hydroxyisoleucine", "Trigonelline", "Diosgenin", "Yamogenin"],
      digestiveTolerance: "Bittersweet; gelatinous when steeped in liquid, coating sensitive stomachs."
    }
  },
  {
    id: "efct-0715",
    name: "Qarafa (Ethiopian Cinnamon Bark)",
    nameAmharic: "\u1240\u1228\u134B",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0715",
    traditionalPreparation: "Sun-dried tree bark rolls of Cinnamomum verum harvested from mid-altitude forest gardens, stone-ground fine and added to teas, breads, and holiday spice blends.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 15, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 20,
      tanninsMgPer100g: 50,
      oxalatesMgPer100g: 25,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Bark sun-curing preserves active volatile cinnamaldehyde.",
      fermentationReductionPct: 60,
      bioavailabilityUpliftDescription: "Procyanidin type-A polymers mimic insulin action at the cellular receptor level."
    },
    macros: { caloriesKcal: 247, proteinG: 4, carbohydratesG: 80, fatsG: 1.2, dietaryFiberG: 53 },
    nutrients: [
      { name: "Calcium", symbol: "Ca", unit: "mg", amountPer100g: 1e3, bioavailabilityFactor: 1.2, note: "Dense bark calcium" },
      { name: "Manganese", symbol: "Mn", unit: "mg", amountPer100g: 17.5, bioavailabilityFactor: 1.25, note: "High antioxidant enzyme cofactor" },
      { name: "Iron", symbol: "Fe", unit: "mg", amountPer100g: 8.3, bioavailabilityFactor: 1.15, note: "Trace mineral" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Insulin receptor sensitization and blood sugar control", "Oral hygiene and antimicrobial breath freshening", "Gastric warming and digestion"],
      bioactiveCompounds: ["Cinnamaldehyde", "Procyanidin Type-A polymers", "Cinnamic acid", "Eugenol"],
      digestiveTolerance: "Sweet, pungent, and warming; stimulates healthy circulation."
    }
  },
  {
    id: "efct-0716",
    name: "Tej (Fermented Honey Wine with Gesho)",
    nameAmharic: "\u1320\u1305",
    category: "Spices & Nutrient Amplifiers",
    sourceRef: "EFCT2025-0716",
    traditionalPreparation: "Royal Ethiopian honey mead prepared by fermenting wild blossom forest honey (Mar), water, and debarked stems of Gesho (Rhamnus prinoides) in clay vessels for 15\u201330 days.",
    fastingSuitability: "fasting_friendly",
    glycemicIndex: { value: 45, rating: "low" },
    antinutrients: {
      phyticAcidMgPer100g: 0,
      tanninsMgPer100g: 15,
      oxalatesMgPer100g: 0,
      trypsinInhibitorLevel: "negligible",
      traditionalDegradationMethod: "Long slow wild yeast honey fermentation.",
      fermentationReductionPct: 100,
      bioavailabilityUpliftDescription: "Fermentation releases honey polyphenols, propolis traces, and Gesho gentiopicrosides into an active liquid solution."
    },
    macros: { caloriesKcal: 115, proteinG: 0.3, carbohydratesG: 14.5, fatsG: 0, dietaryFiberG: 0 },
    nutrients: [
      { name: "Potassium", symbol: "K", unit: "mg", amountPer100g: 85, bioavailabilityFactor: 1, note: "Wild forest honey mineral" },
      { name: "Magnesium", symbol: "Mg", unit: "mg", amountPer100g: 12, bioavailabilityFactor: 1.1, note: "Trace mineral" },
      { name: "Zinc", symbol: "Zn", unit: "mg", amountPer100g: 0.45, bioavailabilityFactor: 1.2, note: "Propolis traces" }
    ],
    physiologicalNotes: {
      primaryIndications: ["Celebration and festive toast", "Antioxidant polyphenol delivery from forest blossoms", "Appetite stimulation"],
      bioactiveCompounds: ["Gesho gentiopicroside", "Pinocembrin", "Chrysin", "Propolis flavones"],
      digestiveTolerance: "Sweet, effervescent, and mildly bitter; traditionally served in round-bottom glass carafes (berele)."
    }
  }
];

// src/lib/db/seed.ts
var import_meta = {};
var nutrientsData = [
  ["Iron", "Fe", "mg", "mineral", "18.00", "45.00"],
  ["Calcium", "Ca", "mg", "mineral", "1000.00", "2500.00"],
  ["Zinc", "Zn", "mg", "mineral", "11.00", "40.00"],
  ["Vitamin B12", "B12", "mcg", "vitamin", "2.40", null],
  ["Folate", "B9", "mcg", "vitamin", "400.00", "1000.00"],
  ["Vitamin D", "VitD", "IU", "vitamin", "600.00", "4000.00"],
  ["Magnesium", "Mg", "mg", "mineral", "400.00", "350.00"],
  ["Vitamin C", "VitC", "mg", "vitamin", "90.00", "2000.00"],
  ["Vitamin A", "VitA", "mcg", "vitamin", "900.00", "3000.00"],
  ["Protein", "Pro", "g", "macronutrient", "56.00", null],
  ["Dietary Fiber", "Fib", "g", "macronutrient", "30.00", null],
  ["Potassium", "K", "mg", "mineral", "3400.00", null]
];
async function runSeed(options = {}) {
  const [{ n }] = await db.select({ n: import_drizzle_orm5.sql`count(*)` }).from(nutrients);
  if (n > 0 && !options.reset) {
    console.log(`Food reference data is already present (${n} nutrients); nothing to do. Use --reset to replace it.`);
    return { seeded: false };
  }
  await db.transaction(async (tx) => {
    await tx.delete(foodNutrients);
    await tx.delete(foods);
    await tx.delete(nutrients);
    const nutrientIds = /* @__PURE__ */ new Map();
    for (const [name, symbol, unit, category, rdaBase, tolerableUpperLimit] of nutrientsData) {
      const id = (0, import_node_crypto2.randomUUID)();
      nutrientIds.set(name, id);
      await tx.insert(nutrients).values({ id, name, symbol, unit, category, rdaBase, tolerableUpperLimit });
    }
    for (const food of EFCT_MASTER_FOODS) {
      const foodId = (0, import_node_crypto2.randomUUID)();
      await tx.insert(foods).values({
        id: foodId,
        name: food.name,
        nameAmharic: food.nameAmharic,
        category: food.category,
        traditionalPreparation: food.traditionalPreparation,
        sourceRef: food.sourceRef,
        fastingSuitability: food.fastingSuitability,
        glycemicIndex: food.glycemicIndex.value,
        phyticAcidMg: String(food.antinutrients.phyticAcidMgPer100g),
        tanninsMg: String(food.antinutrients.tanninsMgPer100g),
        oxalatesMg: String(food.antinutrients.oxalatesMgPer100g),
        fermentationReductionPct: food.antinutrients.fermentationReductionPct
      });
      for (const nutrient of food.nutrients) {
        const nutrientId = nutrientIds.get(nutrient.name);
        if (!nutrientId)
          continue;
        await tx.insert(foodNutrients).values({
          foodId,
          nutrientId,
          amountPer100g: String(nutrient.amountPer100g),
          bioavailabilityFactor: String(nutrient.bioavailabilityFactor),
          fermentationImpactNote: nutrient.note || food.antinutrients.bioavailabilityUpliftDescription
        });
      }
    }
    await tx.insert(auditLog).values({
      id: (0, import_node_crypto2.randomUUID)(),
      eventType: "system_initialized",
      action: "seed_complete",
      resourceType: "system",
      payload: { foods: EFCT_MASTER_FOODS.length, nutrients: nutrientsData.length }
    });
  });
  console.log(`Seeded ${EFCT_MASTER_FOODS.length} Ethiopian foods and ${nutrientsData.length} nutrients.`);
  return { seeded: true };
}
var isMainModule = process.argv[1] && import_meta.url === (0, import_node_url.pathToFileURL)((0, import_node_path2.resolve)(process.argv[1])).href;
if (isMainModule)
  runSeed({ reset: process.argv.includes("--reset") }).then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
  });

// src/lib/db/seedMarketplaceCatalogues.ts
init_db();
init_schema();
var categories = [
  { slug: "herbalist", name: "Herbalist", nameAm: "\u12E8\u1263\u1205\u120D \u1218\u12F5\u1283\u1292\u1275 \u12A0\u12CB\u1242", sector: "healing", icon: "leaf", sortOrder: 10, description: "Preparation of traditional herbal remedies and guidance on their safe use." },
  { slug: "debtera", name: "Debtera", nameAm: "\u12F0\u1265\u1270\u122B", sector: "healing", icon: "scroll", sortOrder: 20, description: "Ge'ez scholarship, Awde Negest readings, prayers and protective scrolls." },
  { slug: "bone-setter", name: "Bone setter", nameAm: "\u12C8\u130C\u123B", sector: "healing", icon: "hand", sortOrder: 30, description: "Traditional bone setting and bodywork for sprains and minor injuries." },
  { slug: "spiritual-guide", name: "Spiritual guide", nameAm: "\u1218\u1295\u1348\u1233\u12CA \u12A0\u121B\u12AB\u122A", sector: "healing", icon: "sparkles", sortOrder: 40, description: "Spiritual counsel, reflection and life-direction guidance." },
  { slug: "bodywork", name: "Traditional bodywork", nameAm: "\u1263\u1205\u120B\u12CA \u121B\u1238\u1275", sector: "healing", icon: "heart-handshake", sortOrder: 50, description: "Massage, steam and other traditional bodywork." },
  { slug: "artisan", name: "Artisan & crafts", nameAm: "\u12E8\u12A5\u1305 \u1325\u1260\u1265", sector: "cultural", icon: "palette", sortOrder: 60, description: "Weaving, pottery, basketry, jewellery and other handmade crafts." },
  { slug: "coffee-ceremony", name: "Coffee ceremony", nameAm: "\u12E8\u1261\u1293 \u1225\u1290 \u1225\u122D\u12D3\u1275", sector: "cultural", icon: "coffee", sortOrder: 70, description: "Coffee ceremony hosting for homes, offices and events." },
  { slug: "music-dance", name: "Music & dance", nameAm: "\u1219\u12DA\u1243\u1293 \u12CD\u12DD\u12CB\u12DC", sector: "cultural", icon: "music", sortOrder: 80, description: "Traditional music, dance performance and lessons." },
  { slug: "ceremony-events", name: "Ceremonies & events", nameAm: "\u1225\u1290 \u1225\u122D\u12D3\u1275\u1293 \u12DD\u130D\u1305\u1275", sector: "cultural", icon: "calendar-heart", sortOrder: 90, description: "Weddings, holidays and cultural event planning." },
  { slug: "language-manuscripts", name: "Ge'ez & manuscripts", nameAm: "\u130D\u12D5\u12DD\u1293 \u1265\u122B\u1293", sector: "cultural", icon: "book-open", sortOrder: 100, description: "Ge'ez lessons, calligraphy and manuscript work." },
  { slug: "heritage-tours", name: "Heritage tours", nameAm: "\u12E8\u1245\u122D\u1235 \u1309\u1265\u129D\u1275", sector: "cultural", icon: "map", sortOrder: 110, description: "Guided visits to heritage sites and living traditions." },
  { slug: "hexacore-practitioner", name: "Hexacore practitioner", nameAm: "\u1204\u12AD\u1233\u12AE\u122D \u120D\u121D\u121D\u12F5", sector: "healing", icon: "hexagon", sortOrder: 55, description: "Practitioners who combine the Hexacore six-core reflection system with body-sign readings (tongue, palm, face) and symbolic guidance. Sessions are reflective and educational, not a medical diagnosis." }
];
var kinds = [
  { slug: "consultation", name: "Consultation", nameAm: "\u121D\u12AD\u12AD\u122D", requiresSafetyScreen: false, caseDomain: null, sortOrder: 10, description: "A one-to-one session." },
  { slug: "remedy-preparation", name: "Remedy preparation", nameAm: "\u12E8\u1218\u12F5\u1283\u1292\u1275 \u12DD\u130D\u1305\u1275", requiresSafetyScreen: true, caseDomain: null, sortOrder: 20, description: "A remedy prepared for the client; the safety screen checks medicines and pregnancy." },
  { slug: "bodywork-session", name: "Bodywork session", nameAm: "\u12E8\u1230\u12CD\u1290\u1275 \u1215\u12AD\u121D\u1293", requiresSafetyScreen: true, caseDomain: null, sortOrder: 30, description: "Hands-on session; the safety screen checks injuries and conditions first." },
  { slug: "reading", name: "Reading", nameAm: "\u1295\u1263\u1265", requiresSafetyScreen: false, caseDomain: "spiritual", sortOrder: 40, description: "Awde Negest or name reading, reviewed by the practitioner." },
  { slug: "life-direction-review", name: "Life direction review", nameAm: "\u12E8\u1215\u12ED\u12C8\u1275 \u12A0\u1245\u1323\u132B \u130D\u121D\u1308\u121B", requiresSafetyScreen: false, caseDomain: "career", sortOrder: 50, description: "A written review of career or life direction." },
  { slug: "ceremony", name: "Ceremony", nameAm: "\u1225\u1290 \u1225\u122D\u12D3\u1275", requiresSafetyScreen: false, caseDomain: null, sortOrder: 60, description: "A ceremony or blessing held for the client." },
  { slug: "class", name: "Class or workshop", nameAm: "\u1275\u121D\u1205\u122D\u1275", requiresSafetyScreen: false, caseDomain: null, sortOrder: 70, description: "Lessons for individuals or groups." },
  { slug: "commission", name: "Commission", nameAm: "\u1275\u12D5\u12DB\u12DD", requiresSafetyScreen: false, caseDomain: null, sortOrder: 80, description: "A made-to-order piece (craft, scroll, garment)." },
  { slug: "event-service", name: "Event service", nameAm: "\u12E8\u12DD\u130D\u1305\u1275 \u12A0\u1308\u120D\u130D\u120E\u1275", requiresSafetyScreen: false, caseDomain: null, sortOrder: 90, description: "Hosting or performing at an event." },
  { slug: "hexacore-reading", name: "Hexacore reading", nameAm: "\u1204\u12AD\u1233\u12AE\u122D \u1295\u1263\u1265", requiresSafetyScreen: false, caseDomain: "spiritual", sortOrder: 60, description: "Full six-core Hexacore Arcana session: core mapping, archetype identification, frequency analysis, correspondences and journaling guidance." },
  { slug: "tongue-reading", name: "Tongue reading", nameAm: "\u12E8\u121D\u120B\u1235 \u1295\u1263\u1265", requiresSafetyScreen: false, caseDomain: null, sortOrder: 61, description: "Traditional body-sign assessment of tongue surface, colour, coat and shape. Offered as reflective and educational content; not a medical diagnosis." },
  { slug: "palm-reading", name: "Palm reading", nameAm: "\u12E8\u12A5\u1305 \u1218\u1235\u1218\u122D \u1295\u1263\u1265", requiresSafetyScreen: false, caseDomain: null, sortOrder: 62, description: "Cultural and reflective reading of hand lines, mounts and finger shape, drawing on Ethiopian hand-reading traditions and comparative palmistry." },
  { slug: "face-reading", name: "Face reading & biometrics", nameAm: "\u12E8\u134A\u1275 \u1295\u1263\u1265", requiresSafetyScreen: false, caseDomain: null, sortOrder: 63, description: "Facial zone, feature and expression mapping using traditional physiognomy and modern biometric pattern reference. Covers forehead, eye, nose, mouth and ear zones. Reflective only \u2014 not a medical or forensic assessment." },
  { slug: "body-sign-reading", name: "Body-sign reading", nameAm: "\u12E8\u1230\u12CD\u1290\u1275 \u121D\u120D\u12AD\u1275 \u1295\u1263\u1265", requiresSafetyScreen: false, caseDomain: null, sortOrder: 64, description: "Combined reading that may include tongue, palm, face and posture patterns as traditional body-sign indicators. Always framed as reflection, never diagnosis." }
];
async function seedMarketplaceCatalogues() {
  await db.transaction(async (tx) => {
    await tx.insert(businessCategories).values(categories).onDuplicateKeyUpdate({ set: keepExisting(businessCategories) });
    await tx.insert(serviceKinds).values(kinds).onDuplicateKeyUpdate({ set: keepExisting(serviceKinds) });
  });
  return { categories: categories.length, serviceKinds: kinds.length };
}

// src/server/safety/index.ts
var import_drizzle_orm7 = require("drizzle-orm");
var import_zod2 = require("zod");
init_db();
init_schema();

// src/lib/api/route.ts
var import_server = require("next/server");
var import_zod = require("zod");

// src/lib/audit.ts
init_db();
init_schema();

// src/lib/shutdown.ts
var g = globalThis;
function onShutdown(name, hook) {
  g.__ethioShutdownHooks ??= /* @__PURE__ */ new Map();
  g.__ethioShutdownHooks.set(name, hook);
}

// src/lib/audit.ts
var BATCH_SIZE = 50;
var FLUSH_INTERVAL_MS = 2e3;
var g2 = globalThis;
if (!g2._auditBuffer)
  g2._auditBuffer = [];
var buffer = g2._auditBuffer;
async function flushBuffer() {
  if (buffer.length === 0)
    return;
  const batch = buffer.splice(0, BATCH_SIZE);
  const auditRows = batch.filter((e) => e.type === "audit");
  const activityRows = batch.filter((e) => e.type === "activity");
  const loginRows = batch.filter((e) => e.type === "login");
  const writes = [];
  if (auditRows.length > 0) {
    writes.push(
      db.insert(auditLog).values(
        auditRows.map(({ opts }) => ({
          userId: opts.userId || null,
          eventType: opts.action,
          action: opts.action,
          resourceType: opts.resourceType || "system",
          resourceId: opts.resourceId || null,
          payload: opts.details || {},
          details: opts.details || {},
          ipAddress: opts.ipAddress || null,
          userAgent: opts.userAgent || null,
          sessionId: opts.sessionId || null
        }))
      ).catch((err) => console.error("[audit] batch write failed:", err))
    );
  }
  if (activityRows.length > 0) {
    writes.push(
      db.insert(userActivities).values(
        activityRows.map(({ opts }) => ({
          userId: opts.userId,
          activityType: opts.activityType,
          description: opts.description,
          metadata: opts.metadata || {}
        }))
      ).catch((err) => console.error("[audit] activity batch write failed:", err))
    );
  }
  if (loginRows.length > 0) {
    writes.push(
      db.insert(loginHistory).values(
        loginRows.map(({ opts }) => ({
          userId: opts.userId || null,
          email: opts.email,
          ipAddress: opts.ipAddress || null,
          userAgent: opts.userAgent || null,
          deviceInfo: opts.deviceInfo || {},
          status: opts.status,
          failureReason: opts.failureReason || null
        }))
      ).catch((err) => console.error("[audit] login batch write failed:", err))
    );
  }
  await Promise.allSettled(writes);
}
if (!g2._auditFlushTimer && typeof setInterval !== "undefined") {
  g2._auditFlushTimer = setInterval(() => {
    flushBuffer().catch((err) => console.error("[audit] interval flush error:", err));
  }, FLUSH_INTERVAL_MS);
  if (typeof g2._auditFlushTimer.unref === "function") {
    g2._auditFlushTimer.unref();
  }
}
onShutdown("audit-buffer", () => flushBuffer());

// src/lib/api/route.ts
init_rbac();

// src/lib/api/sharedRateLimit.ts
var import_drizzle_orm6 = require("drizzle-orm");
init_db();
init_schema();
var SWEEP_EVERY_MS = 10 * 60 * 1e3;

// src/server/safety/rules.ts
var SEVERITIES = ["contraindicated", "major", "moderate", "minor"];
var CONDITIONS = ["pregnancy", "breastfeeding", "kidney", "liver", "children", "older"];
var PROPERTIES = {
  anticoagulant: "Thins the blood (anticoagulant)",
  vka: "Vitamin K\u2013dependent blood thinner",
  antiplatelet: "Stops platelets clumping",
  nsaid: "Anti-inflammatory painkiller (NSAID)",
  bleeding_risk: "May increase bleeding",
  vitamin_k: "Rich in vitamin K",
  hypoglycemic: "Lowers blood sugar",
  hyperglycemic: "Raises blood sugar",
  lactic_acidosis_risk: "Lactic acidosis risk",
  hypotensive: "Lowers blood pressure",
  hypertensive: "Raises blood pressure",
  bradycardic: "Slows the heart",
  nitrate: "Nitrate (widens blood vessels)",
  pde5_inhibitor: "PDE-5 inhibitor",
  cardiac_glycoside: "Heart glycoside (narrow margin)",
  diuretic: "Increases urine (water pill)",
  potassium_raising: "Raises potassium",
  potassium_lowering: "Lowers potassium",
  raas_blocker: "ACE inhibitor / ARB",
  narrow_renal: "Cleared by kidneys, narrow margin",
  cns_depressant: "Causes drowsiness / slows breathing",
  stimulant: "Stimulant",
  serotonergic: "Raises serotonin",
  qt_prolonging: "Can disturb heart rhythm (QT)",
  anticholinergic: "Anticholinergic (dry mouth, confusion)",
  seizure_threshold_lowering: "Can trigger seizures",
  cyp3a4_inhibitor_strong: "Strongly blocks liver enzyme CYP3A4",
  cyp3a4_inhibitor: "Blocks liver enzyme CYP3A4",
  cyp3a4_inducer: "Speeds up liver enzymes (inducer)",
  cyp3a4_inducer_weak: "May speed up liver enzymes",
  cyp3a4_substrate: "Broken down by CYP3A4",
  cyp3a4_substrate_narrow: "Broken down by CYP3A4, narrow margin",
  cyp2c9_inhibitor: "Blocks liver enzyme CYP2C9",
  cyp2c9_substrate_narrow: "Broken down by CYP2C9, narrow margin",
  cyp1a2_inhibitor: "Blocks liver enzyme CYP1A2",
  cyp1a2_substrate: "Broken down by CYP1A2",
  cyp2c19_inhibitor: "Blocks liver enzyme CYP2C19",
  cyp2c19_prodrug: "Needs CYP2C19 to work",
  cyp2d6_inhibitor: "Blocks liver enzyme CYP2D6",
  cyp2d6_prodrug: "Needs CYP2D6 to work",
  hepatotoxic: "Can harm the liver",
  hepatic_load: "Strains the liver at high doses",
  nephrotoxic: "Can harm the kidneys",
  ototoxic: "Can harm hearing",
  polyvalent_cation: "Contains iron, calcium, magnesium or zinc",
  chelation_sensitive: "Binds minerals in the gut",
  acid_suppressant: "Reduces stomach acid",
  acid_dependent: "Needs stomach acid to be absorbed",
  absorption_reducing: "Slows or reduces absorption (fibre, mucilage)",
  laxative_stimulant: "Stimulant laxative / purgative",
  gi_irritant: "Irritates the stomach and gut",
  alcohol: "Alcohol",
  disulfiram_like: "Reacts badly with alcohol",
  uterotonic: "Stimulates the womb",
  hormonal_contraceptive: "Hormonal contraceptive",
  estrogenic: "Estrogen-like",
  immunosuppressant: "Suppresses the immune system",
  immunostimulant: "Stimulates the immune system",
  corticosteroid: "Corticosteroid",
  bone_marrow_suppressant: "Can lower blood counts",
  narrow_therapeutic: "Narrow margin between dose and harm",
  photosensitizing: "Sun sensitivity",
  toxic_internal: "Poisonous if swallowed",
  hemolytic: "Can break red cells (G6PD)",
  urate_lowering: "Xanthine oxidase blocker"
};
var PROPERTY_KEYS = Object.keys(PROPERTIES);
var r = (a, b, severity, mechanism, effect, management) => ({
  a: Array.isArray(a) ? a : [a],
  b: Array.isArray(b) ? b : [b],
  severity,
  mechanism,
  effect,
  management
});
var PROPERTY_RULES = [
  r("anticoagulant", ["anticoagulant", "antiplatelet", "nsaid"], "major", "Two blood-thinning actions add together.", "Serious bleeding, including in the stomach or brain.", "Avoid together unless a prescriber manages it; watch for bruising, black stools, blood in urine."),
  r("antiplatelet", ["antiplatelet", "nsaid"], "moderate", "Platelet effects add together.", "More bruising and stomach bleeding.", "Use together only when prescribed; protect the stomach and watch for bleeding."),
  r(["anticoagulant", "antiplatelet"], ["bleeding_risk", "gi_irritant"], "moderate", "The remedy adds a mild blood-thinning or stomach-irritating effect.", "Higher bleeding risk.", "Avoid regular or large amounts; stop before procedures; watch for bleeding."),
  r("nsaid", ["nsaid", "corticosteroid", "gi_irritant"], "moderate", "Both irritate or thin the stomach lining.", "Stomach ulcers and bleeding.", "Avoid combining painkillers of this type; take with food; ask about stomach protection."),
  r("vka", "vitamin_k", "moderate", "Vitamin K works against warfarin-type blood thinners.", "The blood thinner works less well; clot risk.", "Keep vitamin K intake steady rather than avoiding it; tell the prescriber about big diet changes."),
  r("hypoglycemic", "hypoglycemic", "moderate", "Blood-sugar lowering effects add together.", "Low blood sugar: shaking, sweating, confusion.", "Check sugar more often; eat regularly; know how to treat a low."),
  r("hypoglycemic", "hyperglycemic", "moderate", "Opposing effects on blood sugar.", "Diabetes control becomes unpredictable.", "Monitor blood sugar; the diabetes dose may need adjusting."),
  r("hypotensive", "hypotensive", "moderate", "Blood-pressure lowering effects add together.", "Dizziness, fainting and falls, especially on standing.", "Stand up slowly; check blood pressure; reduce if dizzy."),
  r("hypotensive", "hypertensive", "moderate", "Opposing effects on blood pressure.", "Blood-pressure medicine works less well.", "Check blood pressure; limit the stimulant."),
  r("bradycardic", ["bradycardic", "cardiac_glycoside"], "moderate", "Heart-slowing effects add together.", "Very slow pulse, dizziness, fainting.", "Check pulse; seek care if under 50 or fainting."),
  r("nitrate", "pde5_inhibitor", "contraindicated", "Both widen blood vessels strongly.", "Dangerous fall in blood pressure.", "Never take together."),
  r("cns_depressant", ["cns_depressant", "alcohol"], "major", "Sedating effects add together.", "Heavy drowsiness, slowed breathing, falls, accidents.", "Avoid together; never drive; lower doses if unavoidable."),
  r("serotonergic", "serotonergic", "major", "Serotonin builds up.", "Serotonin syndrome: agitation, fever, shaking, fast heart.", "Avoid combining; seek urgent care for these signs."),
  r("qt_prolonging", "qt_prolonging", "major", "Both lengthen the heart's recovery time (QT).", "Dangerous heart rhythm, fainting, sudden death.", "Avoid together where possible; an ECG may be needed."),
  r("qt_prolonging", "potassium_lowering", "moderate", "Low potassium makes QT prolongation more dangerous.", "Heart rhythm problems.", "Keep potassium normal; monitor."),
  r("anticholinergic", "anticholinergic", "moderate", "Anticholinergic effects add together.", "Confusion, constipation, urine retention, fast heart; worse in older adults.", "Avoid combining, especially in older adults."),
  r("seizure_threshold_lowering", "seizure_threshold_lowering", "moderate", "Both lower the seizure threshold.", "Fits, especially with epilepsy or alcohol withdrawal.", "Avoid together in people prone to seizures."),
  r("cyp3a4_inhibitor_strong", "cyp3a4_substrate_narrow", "major", "The liver breaks the medicine down much more slowly.", "Medicine levels rise to toxic levels.", "Avoid, or adjust dose under a prescriber."),
  r("cyp3a4_inhibitor_strong", "cyp3a4_substrate", "moderate", "The liver breaks the medicine down more slowly.", "Stronger effects and side effects.", "Watch for side effects; a lower dose may be needed."),
  r("cyp3a4_inhibitor", "cyp3a4_substrate_narrow", "moderate", "The liver breaks the medicine down more slowly.", "Higher medicine levels and side effects.", "Monitor closely; dose changes may be needed."),
  r("cyp3a4_inducer", "cyp3a4_substrate_narrow", "major", "The liver clears the medicine much faster.", "The medicine stops working properly.", "Avoid, or use a different medicine or a higher dose under supervision."),
  r("cyp3a4_inducer", "cyp3a4_substrate", "moderate", "The liver clears the medicine faster.", "Weaker effect.", "Check that the medicine still works; dose may need raising."),
  r(["cyp3a4_inducer", "cyp3a4_inducer_weak"], "hormonal_contraceptive", "major", "Faster breakdown of contraceptive hormones.", "Contraception can fail; unplanned pregnancy.", "Use condoms or a method not affected (e.g. IUD, injection) during and 4 weeks after."),
  r("cyp3a4_inducer_weak", "cyp3a4_substrate_narrow", "moderate", "The remedy may speed up breakdown of the medicine.", "The medicine may work less well.", "Avoid regular use alongside; monitor effect."),
  r("cyp2c9_inhibitor", "cyp2c9_substrate_narrow", "major", "Slower breakdown of warfarin-type or phenytoin-type medicines.", "Bleeding (warfarin) or toxicity (phenytoin).", "Avoid or monitor INR / levels closely."),
  r("cyp1a2_inhibitor", "cyp1a2_substrate", "moderate", "Slower breakdown by liver enzyme CYP1A2.", "Higher levels: jitteriness, fast heart (caffeine, theophylline).", "Reduce coffee; monitor theophylline."),
  r("cyp2c19_inhibitor", "cyp2c19_prodrug", "moderate", "The medicine cannot be activated properly.", "Clopidogrel protects the heart less well.", "Prefer an alternative stomach medicine (e.g. pantoprazole)."),
  r("cyp2d6_inhibitor", "cyp2d6_prodrug", "moderate", "The painkiller cannot be converted to its active form.", "Poor pain relief.", "Choose a different painkiller."),
  r("hepatotoxic", ["hepatotoxic", "alcohol"], "major", "Two strains on the liver.", "Liver injury: yellow eyes, dark urine, tiredness.", "Avoid combining; check liver tests; stop if jaundice appears."),
  r("hepatic_load", ["hepatotoxic", "alcohol"], "moderate", "Added strain on the liver.", "Higher chance of liver injury.", "Keep doses low; avoid alcohol; watch for jaundice."),
  r("nephrotoxic", "nephrotoxic", "major", "Two strains on the kidneys.", "Kidney injury.", "Avoid combining; check kidney function; drink enough fluids."),
  r("nsaid", ["nephrotoxic", "raas_blocker", "diuretic"], "moderate", "NSAIDs reduce blood flow to the kidneys.", "Kidney injury, especially when dehydrated; weaker blood-pressure control.", "Use the lowest dose for the shortest time; keep hydrated."),
  r("narrow_renal", ["nsaid", "raas_blocker", "diuretic"], "major", "Kidneys clear lithium more slowly.", "Lithium toxicity: shaking, confusion, vomiting.", "Avoid, or check lithium levels closely."),
  r("potassium_raising", "potassium_raising", "major", "Potassium builds up.", "Dangerously high potassium; heart rhythm problems.", "Check potassium; avoid potassium supplements unless prescribed."),
  r("potassium_lowering", "cardiac_glycoside", "major", "Low potassium makes digoxin toxic.", "Digoxin toxicity: nausea, visual changes, irregular pulse.", "Check potassium and digoxin levels."),
  r("potassium_lowering", "potassium_lowering", "moderate", "Potassium losses add together.", "Weakness, cramps, heart rhythm problems.", "Check potassium; eat potassium-rich foods."),
  r("diuretic", "diuretic", "moderate", "Fluid losses add together.", "Dehydration, dizziness, kidney strain.", "Drink enough; watch for dizziness and low urine."),
  r("polyvalent_cation", "chelation_sensitive", "moderate", "Minerals bind the medicine in the gut.", "The medicine is poorly absorbed and may fail.", "Take the medicine 2 hours before or 4\u20136 hours after."),
  r("acid_suppressant", "acid_dependent", "moderate", "Less stomach acid means poorer absorption.", "The medicine works less well.", "Separate doses or use an alternative."),
  r("absorption_reducing", ["narrow_therapeutic", "hormonal_contraceptive", "chelation_sensitive"], "minor", "Fibre or mucilage slows absorption.", "Lower or delayed medicine effect.", "Take the medicine 1\u20132 hours before the remedy."),
  r("laxative_stimulant", ["narrow_therapeutic", "hormonal_contraceptive"], "minor", "Faster gut transit and diarrhoea reduce absorption.", "The medicine may work less well.", "Avoid purgatives around important doses; use backup contraception if diarrhoea."),
  r("alcohol", "disulfiram_like", "major", "The medicine blocks alcohol breakdown.", "Flushing, vomiting, fast heart, collapse.", "No alcohol during and for 3 days after."),
  r("alcohol", "lactic_acidosis_risk", "moderate", "Alcohol raises lactic acid.", "Lactic acidosis (rare but serious).", "Avoid heavy drinking."),
  r("alcohol", ["hypoglycemic", "anticoagulant", "nsaid"], "moderate", "Alcohol adds to the medicine's risks.", "Low blood sugar, bleeding or stomach bleeding.", "Avoid or keep to small amounts with food."),
  r("stimulant", "stimulant", "moderate", "Stimulant effects add together.", "Fast heart, raised blood pressure, anxiety, poor sleep.", "Limit the stimulants."),
  r("uterotonic", "uterotonic", "major", "Womb-stimulating effects add together.", "Over-strong contractions, bleeding.", "Never combine outside a birth attendant's care."),
  r("immunostimulant", "immunosuppressant", "moderate", "Opposing effects on the immune system.", "The immune-suppressing medicine may work less well.", "Avoid immune-stimulating remedies with transplant or autoimmune medicines."),
  r("immunosuppressant", "immunosuppressant", "moderate", "Immune suppression adds together.", "Serious infections.", "Only as prescribed; watch for fever."),
  r("bone_marrow_suppressant", "bone_marrow_suppressant", "major", "Effects on blood-cell production add together.", "Anaemia, infections, bleeding.", "Check blood counts."),
  r("ototoxic", "ototoxic", "moderate", "Effects on the inner ear add together.", "Hearing loss, ringing, dizziness.", "Avoid combining; monitor hearing."),
  r("photosensitizing", "photosensitizing", "minor", "Sun-sensitising effects add together.", "Sunburn and skin reactions.", "Protect skin from the sun."),
  r("estrogenic", "hormonal_contraceptive", "minor", "Estrogen-like plant compounds.", "Possible change in hormonal effect.", "Avoid large regular amounts.")
];
function parseCautionCodes(codes) {
  const map = { p: "pregnancy", b: "breastfeeding", k: "kidney", l: "liver", c: "children", e: "older" };
  const out = {};
  for (const ch of codes) {
    const condition = map[ch.toLowerCase()];
    if (condition)
      out[condition] = { level: ch === ch.toUpperCase() ? "avoid" : "caution" };
  }
  return out;
}

// src/server/safety/seed.ts
var M = (slug, name, category, properties, cautionCodes = "", aliases = "", notes) => ({
  slug,
  name,
  kind: "modern",
  category,
  properties: properties.split(" ").filter(Boolean),
  cautionCodes,
  aliases: aliases.split(";").map((a) => a.trim()).filter(Boolean),
  notes,
  evidence: "Established pharmacology"
});
var T = (slug, name, scientificName, amharicName, category, properties, cautionCodes = "", aliases = "", notes, evidence = "Traditional use; limited studies") => ({
  slug,
  name,
  kind: "traditional",
  category,
  properties: properties.split(" ").filter(Boolean),
  cautionCodes,
  aliases: aliases.split(";").map((a) => a.trim()).filter(Boolean),
  scientificName,
  amharicName,
  notes,
  evidence
});
var BLOOD = "Blood thinners";
var PAIN = "Pain & inflammation";
var DM = "Diabetes";
var CV = "Blood pressure & heart";
var ABX = "Antibiotics";
var TB = "Tuberculosis";
var HIV = "HIV";
var MAL = "Malaria";
var FUNG = "Antifungals";
var WORM = "Worms & parasites";
var NEURO = "Epilepsy";
var PSY = "Mental health & sleep";
var RESP = "Breathing & allergy";
var IMM = "Steroids & immune";
var GI = "Stomach & gut";
var HORM = "Hormones & pregnancy";
var VIT = "Vitamins & minerals";
var SEED_SUBSTANCES = [
  // ── Blood thinners
  M("warfarin", "Warfarin", BLOOD, "anticoagulant vka cyp2c9_substrate_narrow narrow_therapeutic", "PlE", "Coumadin;Marevan"),
  M("heparin", "Heparin", BLOOD, "anticoagulant potassium_raising", "k"),
  M("enoxaparin", "Enoxaparin", BLOOD, "anticoagulant", "ke", "Clexane"),
  M("rivaroxaban", "Rivaroxaban", BLOOD, "anticoagulant cyp3a4_substrate_narrow", "PBkl", "Xarelto"),
  M("aspirin", "Aspirin", BLOOD, "antiplatelet nsaid", "pCk", "Acetylsalicylic acid;ASA", "Avoid in children under 16 (Reye's syndrome) unless prescribed."),
  M("clopidogrel", "Clopidogrel", BLOOD, "antiplatelet cyp2c19_prodrug", "l", "Plavix"),
  // ── Pain & inflammation
  M("paracetamol", "Paracetamol", PAIN, "hepatic_load", "l", "Acetaminophen;Panadol;Tylenol", "Liver damage in overdose or with regular heavy drinking."),
  M("ibuprofen", "Ibuprofen", PAIN, "nsaid", "PKe", "Brufen;Advil"),
  M("diclofenac", "Diclofenac", PAIN, "nsaid", "PKe", "Voltaren;Cataflam"),
  M("indomethacin", "Indomethacin", PAIN, "nsaid", "PKe", "Indocid"),
  M("naproxen", "Naproxen", PAIN, "nsaid", "PKe"),
  M("piroxicam", "Piroxicam", PAIN, "nsaid", "PKe", "Feldene"),
  M("mefenamic-acid", "Mefenamic acid", PAIN, "nsaid", "PKe", "Ponstan"),
  M("tramadol", "Tramadol", PAIN, "cns_depressant serotonergic seizure_threshold_lowering cyp2d6_prodrug", "PBe", "Tramal"),
  M("codeine", "Codeine", PAIN, "cns_depressant cyp2d6_prodrug", "PBCe"),
  M("morphine", "Morphine", PAIN, "cns_depressant", "PBke"),
  M("pethidine", "Pethidine", PAIN, "cns_depressant serotonergic", "Pke", "Meperidine"),
  // ── Diabetes
  M("metformin", "Metformin", DM, "hypoglycemic lactic_acidosis_risk", "K", "Glucophage"),
  M("glibenclamide", "Glibenclamide", DM, "hypoglycemic", "PKE", "Glyburide;Daonil"),
  M("glimepiride", "Glimepiride", DM, "hypoglycemic", "Pke", "Amaryl"),
  M("gliclazide", "Gliclazide", DM, "hypoglycemic", "Pk", "Diamicron"),
  M("insulin", "Insulin (regular / NPH / mixed)", DM, "hypoglycemic", "", "Actrapid;Insulatard;Mixtard"),
  // ── Blood pressure & heart
  M("enalapril", "Enalapril", CV, "hypotensive potassium_raising raas_blocker", "Pk", "Renitec"),
  M("lisinopril", "Lisinopril", CV, "hypotensive potassium_raising raas_blocker", "Pk"),
  M("captopril", "Captopril", CV, "hypotensive potassium_raising raas_blocker", "Pk"),
  M("losartan", "Losartan", CV, "hypotensive potassium_raising raas_blocker", "Pk", "Cozaar"),
  M("amlodipine", "Amlodipine", CV, "hypotensive cyp3a4_substrate", "p", "Norvasc"),
  M("nifedipine", "Nifedipine", CV, "hypotensive cyp3a4_substrate", "p", "Adalat"),
  M("hydrochlorothiazide", "Hydrochlorothiazide", CV, "diuretic hypotensive potassium_lowering", "pk", "HCT;HCTZ"),
  M("furosemide", "Furosemide", CV, "diuretic hypotensive potassium_lowering ototoxic", "pk", "Lasix"),
  M("spironolactone", "Spironolactone", CV, "diuretic hypotensive potassium_raising", "Pk", "Aldactone"),
  M("atenolol", "Atenolol", CV, "hypotensive bradycardic", "pk", "Tenormin"),
  M("propranolol", "Propranolol", CV, "hypotensive bradycardic", "p", "Inderal"),
  M("metoprolol", "Metoprolol", CV, "hypotensive bradycardic", "p"),
  M("carvedilol", "Carvedilol", CV, "hypotensive bradycardic", "p"),
  M("bisoprolol", "Bisoprolol", CV, "hypotensive bradycardic", "p"),
  M("methyldopa", "Methyldopa", CV, "hypotensive", "", "Aldomet", "Commonly used for high blood pressure in pregnancy."),
  M("hydralazine", "Hydralazine", CV, "hypotensive", ""),
  M("digoxin", "Digoxin", CV, "cardiac_glycoside narrow_therapeutic bradycardic", "KE", "Lanoxin"),
  M("amiodarone", "Amiodarone", CV, "qt_prolonging cyp3a4_inhibitor cyp2c9_inhibitor bradycardic photosensitizing", "PBl", "Cordarone"),
  M("atorvastatin", "Atorvastatin", CV, "cyp3a4_substrate", "PBl", "Lipitor"),
  M("simvastatin", "Simvastatin", CV, "cyp3a4_substrate_narrow", "PBl", "Zocor", "Muscle damage risk rises sharply when its breakdown is blocked."),
  M("isosorbide-dinitrate", "Isosorbide dinitrate", CV, "nitrate hypotensive", "", "Isordil"),
  M("glyceryl-trinitrate", "Glyceryl trinitrate", CV, "nitrate hypotensive", "", "Nitroglycerin;GTN"),
  M("sildenafil", "Sildenafil", CV, "pde5_inhibitor hypotensive cyp3a4_substrate", "", "Viagra"),
  // ── Antibiotics
  M("amoxicillin", "Amoxicillin", ABX, "", "", "Amoxil"),
  M("ampicillin", "Ampicillin", ABX, "", ""),
  M("amoxicillin-clavulanate", "Amoxicillin\u2013clavulanate", ABX, "", "l", "Augmentin;Co-amoxiclav"),
  M("cloxacillin", "Cloxacillin", ABX, "", ""),
  M("benzylpenicillin", "Benzylpenicillin", ABX, "", "", "Penicillin G;Crystalline penicillin"),
  M("benzathine-penicillin", "Benzathine penicillin", ABX, "", ""),
  M("cephalexin", "Cephalexin", ABX, "", "k", "Keflex"),
  M("ceftriaxone", "Ceftriaxone", ABX, "", "", "Rocephin"),
  M("azithromycin", "Azithromycin", ABX, "qt_prolonging", "", "Zithromax"),
  M("erythromycin", "Erythromycin", ABX, "qt_prolonging cyp3a4_inhibitor", "l"),
  M("clarithromycin", "Clarithromycin", ABX, "qt_prolonging cyp3a4_inhibitor_strong", "pk", "Klacid"),
  M("ciprofloxacin", "Ciprofloxacin", ABX, "qt_prolonging cyp1a2_inhibitor chelation_sensitive seizure_threshold_lowering", "PBc", "Cipro"),
  M("norfloxacin", "Norfloxacin", ABX, "cyp1a2_inhibitor chelation_sensitive", "PBc"),
  M("levofloxacin", "Levofloxacin", ABX, "qt_prolonging chelation_sensitive seizure_threshold_lowering", "PBc"),
  M("doxycycline", "Doxycycline", ABX, "chelation_sensitive photosensitizing", "PBC"),
  M("tetracycline", "Tetracycline", ABX, "chelation_sensitive photosensitizing", "PBCK"),
  M("metronidazole", "Metronidazole", ABX, "disulfiram_like cyp2c9_inhibitor", "p", "Flagyl"),
  M("tinidazole", "Tinidazole", ABX, "disulfiram_like", "PB", "Fasigyn"),
  M("cotrimoxazole", "Cotrimoxazole", ABX, "cyp2c9_inhibitor potassium_raising bone_marrow_suppressant", "pk", "Bactrim;Septrin;Sulfamethoxazole\u2013trimethoprim"),
  M("nitrofurantoin", "Nitrofurantoin", ABX, "", "K"),
  M("gentamicin", "Gentamicin", ABX, "nephrotoxic ototoxic", "PK"),
  M("chloramphenicol", "Chloramphenicol", ABX, "bone_marrow_suppressant", "PB"),
  M("clindamycin", "Clindamycin", ABX, "", ""),
  M("vancomycin", "Vancomycin", ABX, "nephrotoxic ototoxic", "k"),
  // ── Tuberculosis
  M("rifampicin", "Rifampicin", TB, "cyp3a4_inducer hepatotoxic", "l", "Rifampin;RHZE;RH"),
  M("isoniazid", "Isoniazid", TB, "hepatotoxic cyp2c9_inhibitor", "l", "INH"),
  M("pyrazinamide", "Pyrazinamide", TB, "hepatotoxic", "L", "PZA"),
  M("ethambutol", "Ethambutol", TB, "", "k"),
  M("streptomycin", "Streptomycin", TB, "nephrotoxic ototoxic", "PK"),
  // ── HIV
  M("tld", "Tenofovir\u2013lamivudine\u2013dolutegravir (TLD)", HIV, "nephrotoxic chelation_sensitive", "k", "TLD;Tenofovir/Lamivudine/Dolutegravir"),
  M("tenofovir", "Tenofovir (TDF)", HIV, "nephrotoxic", "k", "TDF"),
  M("lamivudine", "Lamivudine", HIV, "", "k", "3TC"),
  M("dolutegravir", "Dolutegravir", HIV, "chelation_sensitive", "", "DTG"),
  M("efavirenz", "Efavirenz", HIV, "cyp3a4_inducer qt_prolonging", "p", "EFV"),
  M("nevirapine", "Nevirapine", HIV, "cyp3a4_inducer hepatotoxic", "L", "NVP"),
  M("zidovudine", "Zidovudine", HIV, "bone_marrow_suppressant", "", "AZT"),
  M("abacavir", "Abacavir", HIV, "", "l", "ABC"),
  M("lopinavir-ritonavir", "Lopinavir\u2013ritonavir", HIV, "cyp3a4_inhibitor_strong qt_prolonging", "l", "LPV/r;Kaletra"),
  M("atazanavir-ritonavir", "Atazanavir\u2013ritonavir", HIV, "cyp3a4_inhibitor_strong acid_dependent", "l", "ATV/r"),
  // ── Malaria
  M("artemether-lumefantrine", "Artemether\u2013lumefantrine", MAL, "qt_prolonging cyp3a4_substrate_narrow", "p", "Coartem;AL"),
  M("chloroquine", "Chloroquine", MAL, "qt_prolonging", ""),
  M("primaquine", "Primaquine", MAL, "hemolytic", "PB", "", "Check G6PD before use."),
  M("quinine", "Quinine", MAL, "qt_prolonging hypoglycemic", ""),
  M("artesunate", "Artesunate", MAL, "", "p"),
  // ── Antifungals
  M("fluconazole", "Fluconazole", FUNG, "cyp3a4_inhibitor cyp2c9_inhibitor qt_prolonging", "Pk", "Diflucan"),
  M("ketoconazole", "Ketoconazole (oral)", FUNG, "cyp3a4_inhibitor_strong hepatotoxic qt_prolonging acid_dependent", "PL", "Nizoral"),
  M("griseofulvin", "Griseofulvin", FUNG, "cyp3a4_inducer", "PL"),
  M("nystatin", "Nystatin", FUNG, "", ""),
  // ── Worms & parasites
  M("albendazole", "Albendazole", WORM, "", "P", "Zentel"),
  M("mebendazole", "Mebendazole", WORM, "", "P", "Vermox"),
  M("praziquantel", "Praziquantel", WORM, "cyp3a4_substrate", "", "Biltricide"),
  M("ivermectin", "Ivermectin", WORM, "", "PB", "Mectizan"),
  M("niclosamide", "Niclosamide", WORM, "", ""),
  // ── Epilepsy
  M("phenobarbital", "Phenobarbital", NEURO, "cyp3a4_inducer cns_depressant", "PE", "Phenobarbitone;Luminal"),
  M("phenytoin", "Phenytoin", NEURO, "cyp3a4_inducer cyp2c9_substrate_narrow narrow_therapeutic", "P", "Epanutin;Dilantin"),
  M("carbamazepine", "Carbamazepine", NEURO, "cyp3a4_inducer cyp3a4_substrate_narrow narrow_therapeutic", "P", "Tegretol"),
  M("valproate", "Sodium valproate", NEURO, "hepatotoxic", "PL", "Valproic acid;Epilim;Depakine"),
  // ── Mental health & sleep
  M("diazepam", "Diazepam", PSY, "cns_depressant cyp3a4_substrate", "PBE", "Valium"),
  M("lorazepam", "Lorazepam", PSY, "cns_depressant", "PBE"),
  M("chlorpromazine", "Chlorpromazine", PSY, "qt_prolonging cns_depressant anticholinergic hypotensive", "pE", "Largactil"),
  M("haloperidol", "Haloperidol", PSY, "qt_prolonging cns_depressant", "pE"),
  M("risperidone", "Risperidone", PSY, "qt_prolonging hypotensive", "pe"),
  M("olanzapine", "Olanzapine", PSY, "cns_depressant anticholinergic hyperglycemic cyp1a2_substrate", "pe"),
  M("amitriptyline", "Amitriptyline", PSY, "serotonergic qt_prolonging cns_depressant anticholinergic", "pE"),
  M("imipramine", "Imipramine", PSY, "serotonergic qt_prolonging cns_depressant anticholinergic", "pE"),
  M("fluoxetine", "Fluoxetine", PSY, "serotonergic cyp2d6_inhibitor bleeding_risk", "p", "Prozac"),
  M("sertraline", "Sertraline", PSY, "serotonergic bleeding_risk", "p", "Zoloft"),
  M("lithium", "Lithium carbonate", PSY, "narrow_renal narrow_therapeutic", "PBK"),
  M("promethazine", "Promethazine", RESP, "cns_depressant anticholinergic", "CE", "Phenergan"),
  M("chlorpheniramine", "Chlorphenamine", RESP, "cns_depressant anticholinergic", "e", "Chlorpheniramine;Piriton"),
  M("biperiden", "Biperiden", PSY, "anticholinergic", "E", "Akineton"),
  // ── Breathing & allergy
  M("salbutamol", "Salbutamol", RESP, "potassium_lowering stimulant", "", "Albuterol;Ventolin"),
  M("aminophylline", "Aminophylline / theophylline", RESP, "cyp1a2_substrate narrow_therapeutic seizure_threshold_lowering stimulant", "e", "Theophylline"),
  M("beclomethasone", "Beclomethasone inhaler", RESP, "", ""),
  // ── Steroids & immune
  M("prednisolone", "Prednisolone", IMM, "hyperglycemic immunosuppressant corticosteroid", "", "Prednisone"),
  M("dexamethasone", "Dexamethasone", IMM, "hyperglycemic immunosuppressant corticosteroid", ""),
  M("hydrocortisone", "Hydrocortisone", IMM, "hyperglycemic corticosteroid", ""),
  M("methotrexate", "Methotrexate", IMM, "bone_marrow_suppressant hepatotoxic narrow_therapeutic", "PBKL"),
  M("azathioprine", "Azathioprine", IMM, "immunosuppressant bone_marrow_suppressant", "pl"),
  M("cyclosporine", "Ciclosporin", IMM, "immunosuppressant cyp3a4_substrate_narrow nephrotoxic potassium_raising", "k", "Cyclosporine"),
  M("hydroxychloroquine", "Hydroxychloroquine", IMM, "qt_prolonging", ""),
  M("allopurinol", "Allopurinol", IMM, "urate_lowering", "k", "Zyloric"),
  M("colchicine", "Colchicine", IMM, "cyp3a4_substrate_narrow", "PK"),
  // ── Stomach & gut
  M("omeprazole", "Omeprazole", GI, "cyp2c19_inhibitor acid_suppressant", "", "Losec"),
  M("cimetidine", "Cimetidine", GI, "cyp3a4_inhibitor cyp1a2_inhibitor cyp2c9_inhibitor acid_suppressant", "k"),
  M("antacid", "Aluminium/magnesium hydroxide antacid", GI, "polyvalent_cation", "k", "Antacid;Maalox;Gelusil"),
  M("metoclopramide", "Metoclopramide", GI, "cns_depressant", "Ce", "Plasil;Maxolon"),
  M("ondansetron", "Ondansetron", GI, "qt_prolonging serotonergic", "", "Zofran"),
  M("loperamide", "Loperamide", GI, "", "C", "Imodium"),
  M("bisacodyl", "Bisacodyl", GI, "laxative_stimulant potassium_lowering", "", "Dulcolax"),
  M("hyoscine-butylbromide", "Hyoscine butylbromide", GI, "anticholinergic", "e", "Buscopan"),
  // ── Hormones & pregnancy
  M("combined-oral-contraceptive", "Combined oral contraceptive pill", HORM, "hormonal_contraceptive cyp3a4_substrate", "P", "Microgynon;The pill;COC"),
  M("levonorgestrel", "Levonorgestrel (emergency / implant)", HORM, "hormonal_contraceptive", "", "Postinor;Jadelle"),
  M("medroxyprogesterone", "Medroxyprogesterone injection", HORM, "", "", "Depo-Provera;Depo", "Injectable contraception is not weakened by enzyme inducers."),
  M("levothyroxine", "Levothyroxine", HORM, "chelation_sensitive narrow_therapeutic", "", "Thyroxine;Eltroxin"),
  M("oxytocin", "Oxytocin", HORM, "uterotonic", "", "Pitocin"),
  M("misoprostol", "Misoprostol", HORM, "uterotonic", "P", "Cytotec"),
  M("ergometrine", "Ergometrine", HORM, "uterotonic hypertensive", "P"),
  // ── Vitamins & minerals
  M("ferrous-sulfate", "Ferrous sulfate (iron)", VIT, "polyvalent_cation acid_dependent", "", "Iron tablets;Ferrous"),
  M("calcium-carbonate", "Calcium carbonate", VIT, "polyvalent_cation", "k"),
  M("zinc-sulfate", "Zinc sulfate", VIT, "polyvalent_cation", ""),
  M("folic-acid", "Folic acid", VIT, "", ""),
  M("vitamin-k", "Phytomenadione (vitamin K)", VIT, "vitamin_k", "", "Vitamin K1"),
  M("potassium-chloride", "Potassium chloride", VIT, "potassium_raising", "K"),
  // ── Traditional: medicinal plants
  T("tena-adam", "Tena Adam (rue)", "Ruta chalepensis", "\u1324\u1293 \u12A0\u12F3\u121D", "Medicinal plant", "bleeding_risk uterotonic photosensitizing cyp3a4_inhibitor", "PB", "Tenadam;Rue;Chalepensis", "Added to coffee (buna) and used for stomach complaints."),
  T("tikur-azmud", "Tikur azmud (black seed)", "Nigella sativa", "\u1325\u1241\u122D \u12A0\u12DD\u1219\u12F5", "Medicinal plant", "hypoglycemic hypotensive bleeding_risk", "p", "Black cumin;Habbat al-sauda;Nigella"),
  T("damakesse", "Damakesse", "Ocimum lamiifolium", "\u12F3\u121B\u12A8\u1234", "Medicinal plant", "hypotensive", "p", "Damakese", "Fever, headache and cold remedy."),
  T("feto", "Feto (garden cress)", "Lepidium sativum", "\u134C\u1326", "Medicinal plant", "diuretic hypoglycemic uterotonic", "P", "Garden cress;Fetto"),
  T("tosign", "Tosign (highland thyme)", "Thymus schimperi", "\u1326\u1235\u129D", "Medicinal plant", "bleeding_risk", "p", "Tosigne;Thyme"),
  T("gesho", "Gesho", "Rhamnus prinoides", "\u130C\u123E", "Medicinal plant", "laxative_stimulant", "p", "Buckthorn", "Used to brew tella and tej."),
  T("moringa", "Moringa (shiferaw / haleko)", "Moringa stenopetala", "\u123D\u1348\u122B\u12CD", "Medicinal plant", "hypoglycemic hypotensive cyp3a4_inhibitor uterotonic", "P", "Shiferaw;Haleko;Aleko;Moringa oleifera", "Root and bark have womb-stimulating effects; leaves are eaten."),
  T("grawa", "Grawa (bitter leaf)", "Vernonia amygdalina", "\u130D\u122B\u12CB", "Medicinal plant", "hypoglycemic hypotensive", "P", "Bitter leaf;Girawa"),
  T("koseret", "Koseret", "Lippia adoensis", "\u12AE\u1230\u1228\u1275", "Medicinal plant", "", "p", "Kosseret"),
  T("besobila", "Besobila (sacred basil)", "Ocimum basilicum", "\u1260\u1236\u1265\u120B", "Medicinal plant", "hypoglycemic", "p", "Basil;Besobela"),
  T("endod", "Endod (soapberry)", "Phytolacca dodecandra", "\u12A5\u1295\u12F6\u12F5", "Medicinal plant", "toxic_internal gi_irritant", "PBCKLE", "Soapberry", "Used as soap and against snails; poisonous if swallowed.", "Toxicology reports"),
  T("astenagir", "Astenagir (thorn apple)", "Datura stramonium", "\u12A0\u1235\u1270\u1293\u130D\u122D", "Medicinal plant", "toxic_internal anticholinergic", "PBCKLE", "Datura;Jimsonweed", "Poisonous; confusion, hallucinations, fast heart.", "Toxicology reports"),
  T("gulo", "Gulo (castor)", "Ricinus communis", "\u1309\u120E", "Medicinal plant", "laxative_stimulant potassium_lowering uterotonic", "PB", "Castor;Castor oil"),
  T("sena", "Sena (senna)", "Senna alexandrina", "\u1234\u1293", "Anthelmintic & purgative", "laxative_stimulant potassium_lowering", "pb", "Senna;Cassia"),
  T("ret", "Ret (aloe)", "Aloe spp.", "\u122C\u1275", "Medicinal plant", "laxative_stimulant potassium_lowering hypoglycemic", "PB", "Aloe;Aloe vera", "The yellow latex is a strong purgative."),
  T("kebercho", "Kebercho", "Echinops kebericho", "\u12A8\u1260\u122D\u127E", "Medicinal plant", "", "P", "Kebericho", "Mostly burned as fumigant."),
  T("dingetegna", "Dingetegna", "Taverniera abyssinica", "\u12F5\u1295\u1308\u1270\u129B", "Medicinal plant", "", "p"),
  T("bisana", "Bisana", "Croton macrostachyus", "\u1265\u1233\u1293", "Anthelmintic & purgative", "laxative_stimulant hepatic_load", "PBC"),
  T("abalo", "Abalo", "Brucea antidysenterica", "\u12A0\u1263\u120E", "Anthelmintic & purgative", "gi_irritant", "PBC"),
  T("enkoko", "Enkoko", "Embelia schimperi", "\u12A5\u1295\u1246\u1246", "Anthelmintic & purgative", "gi_irritant", "PBC", "Enqoqo"),
  T("metere", "Metere", "Glinus lotoides", "\u121C\u1270\u122C", "Anthelmintic & purgative", "gi_irritant", "PB"),
  T("kosso", "Kosso", "Hagenia abyssinica", "\u12AE\u1236", "Anthelmintic & purgative", "laxative_stimulant gi_irritant potassium_lowering", "PBCkl", "Koso;Hagenia", "Traditional tapeworm treatment; strong purgative."),
  T("duba-fre", "Duba fre (pumpkin seed)", "Cucurbita pepo", "\u12F1\u1263 \u134D\u122C", "Anthelmintic & purgative", "", "", "Pumpkin seed", "A gentle traditional tapeworm remedy."),
  T("chikugn", "Chikugn", "Artemisia abyssinica", "\u132D\u1241\u129D", "Medicinal plant", "seizure_threshold_lowering uterotonic", "PBC"),
  T("ariti", "Ariti", "Artemisia afra", "\u12A0\u122A\u1272", "Medicinal plant", "seizure_threshold_lowering uterotonic", "PBC", "African wormwood"),
  T("agam", "Agam", "Carissa spinarum", "\u12A0\u130B\u121D", "Medicinal plant", "hypotensive", "p", "Carissa"),
  T("tult", "Tult", "Rumex nepalensis", "\u1271\u120D\u1275", "Medicinal plant", "laxative_stimulant", "p"),
  T("mekmeko", "Mekmeko", "Rumex abyssinicus", "\u1218\u1245\u1218\u1246", "Medicinal plant", "laxative_stimulant", "p"),
  T("gorteb", "Gorteb (plantain)", "Plantago lanceolata", "\u130E\u122D\u1270\u1265", "Medicinal plant", "absorption_reducing", "", "Plantain"),
  T("gizawa", "Gizawa (ashwagandha)", "Withania somnifera", "\u130A\u12DB\u12CB", "Medicinal plant", "cns_depressant immunostimulant hypoglycemic hypotensive", "PB", "Ashwagandha"),
  T("misirich", "Misirich", "Clerodendrum myricoides", "\u121D\u1235\u122D\u127D", "Medicinal plant", "", "P"),
  T("sensel", "Sensel", "Justicia schimperiana", "\u1235\u1295\u1230\u120D", "Medicinal plant", "", "p"),
  T("hareg-resa", "Hareg resa", "Zehneria scabra", "\u1210\u1228\u130D \u1228\u1233", "Medicinal plant", "", "p"),
  T("amja", "Amja", "Hypericum revolutum", "\u12A0\u121D\u1303", "Medicinal plant", "cyp3a4_inducer_weak photosensitizing", "PB", "", "Tagged by analogy with St John's wort (same genus).", "Genus analogy; not studied directly"),
  T("digita", "Digita", "Calpurnia aurea", "\u12F2\u130D\u1273", "Medicinal plant", "toxic_internal", "PBCKLE", "", "Used externally (e.g. against lice).", "Toxicology reports"),
  T("mefakia", "Mefakia (tooth stick)", "Salvadora persica", "\u1218\u134B\u1242\u12EB", "Medicinal plant", "", "", "Miswak;Toothbrush tree"),
  T("bahir-zaf", "Bahir zaf (eucalyptus)", "Eucalyptus globulus", "\u1263\u1215\u122D \u12DB\u134D", "Medicinal plant", "toxic_internal", "C", "Eucalyptus", "Steam inhalation is common; the oil is poisonous if swallowed, especially by children."),
  T("kulkual", "Kulkual (euphorbia)", "Euphorbia candelabrum", "\u1241\u120D\u124B\u120D", "Medicinal plant", "toxic_internal gi_irritant", "PBCKLE", "Candelabra tree", "The milky latex burns skin and causes severe eye injury, including blindness; never near the eyes.", "Toxicology reports"),
  T("shola", "Shola (sycamore fig)", "Ficus sycomorus", "\u123E\u120B", "Medicinal plant", "gi_irritant", "pC", "Sycamore fig;Sholla", "The fruit is eaten; the milky latex irritates skin and eyes."),
  T("tinjut", "Tinjut", "Otostegia integrifolia", "\u1325\u1295\u1301\u1275", "Medicinal plant", "", "pC", "Tinjute", "Mostly burned as a fumigant for homes and milk pots; the smoke irritates the airways."),
  T("woyra", "Woyra (wild olive)", "Olea europaea subsp. cuspidata", "\u12C8\u12ED\u122B", "Medicinal plant", "hypotensive hypoglycemic", "p", "Olive leaf", "Used as fumigant and leaf tea."),
  T("girar", "Girar (acacia)", "Acacia nilotica", "\u130D\u122B\u122D", "Medicinal plant", "hypoglycemic absorption_reducing", "p", "Acacia"),
  T("qontir", "Qontir", "Acacia abyssinica", "\u1246\u1295\u1272\u122D", "Medicinal plant", "", ""),
  T("itan", "Itan (frankincense)", "Boswellia papyrifera", "\u12D5\u1323\u1295", "Medicinal plant", "", "p", "Frankincense;Lubanj;Etan", "Mostly burned as incense and fumigant; little is swallowed."),
  T("karbe", "Karbe (myrrh)", "Commiphora myrrha", "\u12A8\u122D\u1264", "Medicinal plant", "uterotonic hypoglycemic", "PB", "Myrrh;Kerbe", "Traditionally used to bring on menstruation; avoid in pregnancy."),
  T("embuay", "Embuay (Sodom apple)", "Solanum incanum", "\u12A5\u121D\u1267\u12ED", "Medicinal plant", "toxic_internal gi_irritant", "PBCKLE", "Embway;Sodom apple;Bitter apple", "The fruit contains glycoalkaloids; traditionally applied to the skin, not swallowed.", "Toxicology reports; traditional topical use"),
  T("senafich", "Senafich (black mustard)", "Brassica nigra", "\u1230\u1293\u134D\u132D", "Spice & food plant", "gi_irritant", "p", "Mustard;Black mustard;Senafch", "Seed paste is used as a warming poultice; it can blister skin if left on too long."),
  T("kega", "Kega (wild rose)", "Rosa abyssinica", "\u1240\u130B", "Medicinal plant", "", "", "Wild rose;Abyssinian rose", "Petals and hips are made into tea."),
  T("yemdir-berbere", "Yemdir berbere", "Acmella caulirhiza", "\u12E8\u121D\u12F5\u122D \u1260\u122D\u1260\u122C", "Medicinal plant", "", "p", "", "Numbing toothache remedy."),
  // ── Traditional: spices & food plants
  T("nech-shinkurt", "Nech shinkurt (garlic)", "Allium sativum", "\u1290\u132D \u123D\u1295\u12A9\u122D\u1275", "Spice & food plant", "bleeding_risk cyp3a4_inducer_weak hypotensive", "", "Garlic", "Normal cooking amounts are fine; concentrated or raw daily remedies matter.", "Clinical and pharmacokinetic studies"),
  T("zinjibil", "Zinjibil (ginger)", "Zingiber officinale", "\u12DD\u1295\u1305\u1265\u120D", "Spice & food plant", "bleeding_risk hypoglycemic", "", "Ginger", void 0, "Clinical studies"),
  T("abish", "Abish (fenugreek)", "Trigonella foenum-graecum", "\u12A0\u1265\u123D", "Spice & food plant", "hypoglycemic bleeding_risk absorption_reducing uterotonic", "P", "Fenugreek", void 0, "Clinical studies"),
  T("telba", "Telba (linseed)", "Linum usitatissimum", "\u1270\u120D\u1263", "Spice & food plant", "absorption_reducing hypoglycemic", "", "Linseed;Flaxseed"),
  T("ensilal", "Ensilal (fennel)", "Foeniculum vulgare", "\u12A5\u1295\u1235\u120B\u120D", "Spice & food plant", "estrogenic", "p", "Fennel;Insilal"),
  T("dimbilal", "Dimbilal (coriander)", "Coriandrum sativum", "\u12F5\u121D\u1265\u120B\u120D", "Spice & food plant", "hypoglycemic", "", "Coriander"),
  T("ird", "Ird (turmeric)", "Curcuma longa", "\u12A5\u122D\u12F5", "Spice & food plant", "bleeding_risk cyp3a4_inhibitor hypoglycemic", "", "Turmeric", void 0, "Clinical studies"),
  T("kerefa", "Kerefa (cinnamon)", "Cinnamomum spp.", "\u1240\u1228\u134B", "Spice & food plant", "hypoglycemic hepatic_load", "", "Cinnamon;Cassia", "Cassia cinnamon contains coumarin, which strains the liver in large amounts."),
  T("krinfud", "Krinfud (clove)", "Syzygium aromaticum", "\u1245\u122D\u1295\u1349\u12F5", "Spice & food plant", "bleeding_risk", "", "Clove"),
  T("berbere", "Berbere (chili blend)", "Capsicum spp.", "\u1260\u122D\u1260\u122C", "Spice & food plant", "gi_irritant", "", "Chili;Mitmita"),
  T("timiz", "Timiz (long pepper)", "Piper capense", "\u1325\u121D\u12DD", "Spice & food plant", "cyp3a4_inhibitor", "", "Long pepper", "Pepper compounds (piperine) can raise medicine levels.", "Pharmacological studies"),
  T("kundo-berbere", "Kundo berbere (black pepper)", "Piper nigrum", "\u1241\u1295\u12F6 \u1260\u122D\u1260\u122C", "Spice & food plant", "cyp3a4_inhibitor gi_irritant", "", "Black pepper;Kundo", "Food amounts are fine; piperine in concentrated remedies can raise medicine levels.", "Pharmacokinetic studies"),
  T("korerima", "Korerima", "Aframomum corrorima", "\u12AE\u1228\u122A\u121B", "Spice & food plant", "", "", "Ethiopian cardamom"),
  T("tej-sar", "Tej sar (lemongrass)", "Cymbopogon citratus", "\u12E8\u1324\u1293 \u1233\u122D", "Spice & food plant", "diuretic hypotensive", "p", "Lemongrass"),
  T("gomen", "Gomen (Ethiopian kale)", "Brassica carinata", "\u130E\u1218\u1295", "Spice & food plant", "vitamin_k", "", "Collard greens;Kale", "Very rich in vitamin K; keep intake steady on warfarin.", "Nutrient composition"),
  T("mar", "Mar (honey)", "Apis mellifera product", "\u121B\u122D", "Spice & food plant", "hyperglycemic", "C", "Honey", "Not for babies under 1 year."),
  // ── Traditional: drinks & stimulants
  T("khat", "Khat (chat)", "Catha edulis", "\u132B\u1275", "Drinks & stimulants", "stimulant hypertensive hepatic_load", "PB", "Chat;Qat;Miraa", void 0, "Clinical and pharmacokinetic studies"),
  T("buna", "Buna (coffee)", "Coffea arabica", "\u1261\u1293", "Drinks & stimulants", "stimulant cyp1a2_substrate", "p", "Coffee", void 0, "Clinical studies"),
  T("shai", "Shai (tea)", "Camellia sinensis", "\u123B\u12ED", "Drinks & stimulants", "stimulant cyp1a2_substrate", "", "Tea"),
  T("tella", "Tella (home-brewed beer)", "Fermented cereal with gesho", "\u1320\u120B", "Drinks & stimulants", "alcohol cns_depressant", "", "Talla;Home beer", void 0, "Established pharmacology of alcohol"),
  T("tej", "Tej (honey wine)", "Fermented honey with gesho", "\u1320\u1305", "Drinks & stimulants", "alcohol cns_depressant hyperglycemic", "", "Honey wine;Mead", void 0, "Established pharmacology of alcohol"),
  T("areke", "Areke (distilled spirit)", "Distilled cereal spirit", "\u12A0\u1228\u1244", "Drinks & stimulants", "alcohol cns_depressant", "", "Arake;Katikala", void 0, "Established pharmacology of alcohol")
];
var I = (a, b, severity, mechanism, effect, management, evidence, source) => ({ a, b, severity, mechanism, effect, management, evidence, source });
var STOCKLEY = "Stockley's Drug Interactions / BNF interaction guidance";
var ETH_HIV = "Ethiopian national consolidated HIV guidelines";
var ETH_TB = "Ethiopian national TB/TB-HIV guidelines";
var SEED_INTERACTIONS = [
  // Blood thinners
  I("warfarin", "metronidazole", "major", "Metronidazole blocks warfarin breakdown.", "INR rises sharply; bleeding.", "Avoid, or reduce warfarin and check INR within 3\u20135 days.", "Clinical", STOCKLEY),
  I("warfarin", "cotrimoxazole", "major", "Cotrimoxazole blocks warfarin breakdown.", "INR rises; bleeding.", "Prefer another antibiotic, or monitor INR closely.", "Clinical", STOCKLEY),
  I("warfarin", "fluconazole", "major", "Fluconazole blocks CYP2C9.", "INR rises; bleeding.", "Monitor INR; a lower warfarin dose is often needed.", "Clinical", STOCKLEY),
  I("warfarin", "rifampicin", "major", "Rifampicin speeds warfarin clearance.", "Warfarin stops working; clots.", "Large dose increases are needed; check INR often, and again when rifampicin stops.", "Clinical", STOCKLEY),
  I("warfarin", "aspirin", "major", "Blood-thinning effects add.", "Serious bleeding.", "Only when a specialist intends it.", "Clinical", STOCKLEY),
  I("warfarin", "amiodarone", "major", "Amiodarone blocks warfarin breakdown for months.", "INR rises; bleeding.", "Reduce warfarin by about a third to a half; monitor INR.", "Clinical", STOCKLEY),
  I("warfarin", "paracetamol", "moderate", "Regular paracetamol can raise INR.", "Bleeding with regular high doses.", "Occasional doses are fine; check INR if taken daily.", "Clinical", STOCKLEY),
  I("warfarin", "gomen", "moderate", "Large changes in vitamin K intake change warfarin's effect.", "INR falls (clots) or rises when intake drops.", "Keep gomen and leafy greens steady week to week rather than avoiding them.", "Clinical (vitamin K)", STOCKLEY),
  I("warfarin", "nech-shinkurt", "moderate", "Garlic has antiplatelet effects.", "Increased bleeding and INR reports.", "Avoid concentrated or raw daily garlic remedies.", "Case reports", "Herb\u2013drug interaction reviews"),
  I("warfarin", "zinjibil", "moderate", "Ginger inhibits platelet aggregation.", "Increased bleeding risk.", "Avoid large daily ginger remedies.", "Case reports", "Herb\u2013drug interaction reviews"),
  I("warfarin", "abish", "moderate", "Fenugreek contains coumarins and affects platelets.", "INR rise and bleeding reported.", "Avoid fenugreek remedies; food amounts need steady intake.", "Case reports", "Herb\u2013drug interaction reviews"),
  I("clopidogrel", "omeprazole", "moderate", "Omeprazole blocks clopidogrel activation.", "Less protection from heart attack and stroke.", "Use pantoprazole or an H2 blocker instead.", "Clinical", STOCKLEY),
  // Heart & kidneys
  I("sildenafil", "isosorbide-dinitrate", "contraindicated", "Both release nitric oxide pathways.", "Severe low blood pressure.", "Never combine.", "Clinical", STOCKLEY),
  I("sildenafil", "glyceryl-trinitrate", "contraindicated", "Both release nitric oxide pathways.", "Severe low blood pressure.", "Never combine; no nitrate within 24 hours of sildenafil.", "Clinical", STOCKLEY),
  I("enalapril", "spironolactone", "major", "Both raise potassium.", "Dangerous hyperkalaemia.", "Check potassium and kidney function regularly.", "Clinical", STOCKLEY),
  I("digoxin", "furosemide", "moderate", "Furosemide lowers potassium.", "Digoxin toxicity.", "Check potassium; supplement if low.", "Clinical", STOCKLEY),
  I("digoxin", "amiodarone", "major", "Amiodarone raises digoxin levels.", "Digoxin toxicity.", "Halve the digoxin dose and check levels.", "Clinical", STOCKLEY),
  I("simvastatin", "clarithromycin", "contraindicated", "Clarithromycin blocks simvastatin breakdown.", "Severe muscle breakdown (rhabdomyolysis).", "Stop simvastatin during the antibiotic course.", "Clinical", STOCKLEY),
  I("simvastatin", "lopinavir-ritonavir", "contraindicated", "Ritonavir blocks simvastatin breakdown.", "Severe muscle damage.", "Use another statin (e.g. low-dose atorvastatin).", "Clinical", ETH_HIV),
  I("lithium", "ibuprofen", "major", "NSAIDs reduce lithium clearance.", "Lithium toxicity.", "Avoid; use paracetamol for pain.", "Clinical", STOCKLEY),
  I("lithium", "hydrochlorothiazide", "major", "Thiazides reduce lithium clearance.", "Lithium toxicity.", "Avoid, or lower lithium and monitor levels.", "Clinical", STOCKLEY),
  // Infections, TB and HIV
  I("rifampicin", "combined-oral-contraceptive", "major", "Rifampicin speeds hormone clearance.", "Contraceptive failure.", "Use injectable, IUD or condoms during and for 4 weeks after.", "Clinical", ETH_TB),
  I("rifampicin", "dolutegravir", "major", "Rifampicin speeds dolutegravir clearance.", "HIV treatment failure and resistance.", "Give dolutegravir 50 mg twice daily during and 2 weeks after rifampicin.", "Clinical", ETH_HIV),
  I("rifampicin", "tld", "major", "Rifampicin speeds dolutegravir clearance.", "HIV treatment failure.", "Add an extra 50 mg dolutegravir 12 hours after TLD during and 2 weeks after rifampicin.", "Clinical", ETH_HIV),
  I("rifampicin", "nevirapine", "contraindicated", "Rifampicin sharply lowers nevirapine levels; both strain the liver.", "HIV treatment failure and liver injury.", "Do not combine; use an efavirenz- or dolutegravir-based regimen.", "Clinical", ETH_HIV),
  I("rifampicin", "lopinavir-ritonavir", "contraindicated", "Rifampicin lowers protease inhibitor levels drastically.", "HIV treatment failure.", "Use rifabutin or change the HIV regimen under specialist care.", "Clinical", ETH_HIV),
  I("rifampicin", "praziquantel", "major", "Rifampicin almost removes praziquantel from the blood.", "Schistosomiasis treatment fails.", "Wait 4 weeks after rifampicin or use a specialist plan.", "Pharmacokinetic", STOCKLEY),
  I("rifampicin", "artemether-lumefantrine", "major", "Rifampicin sharply lowers lumefantrine.", "Malaria treatment failure.", "Avoid together; seek specialist advice.", "Pharmacokinetic", STOCKLEY),
  I("efavirenz", "artemether-lumefantrine", "moderate", "Efavirenz lowers lumefantrine levels.", "Higher risk of malaria treatment failure.", "Complete the full course; watch for recurrence.", "Pharmacokinetic", ETH_HIV),
  I("isoniazid", "phenytoin", "major", "Isoniazid blocks phenytoin breakdown.", "Phenytoin toxicity: unsteadiness, drowsiness.", "Monitor phenytoin levels.", "Clinical", STOCKLEY),
  I("carbamazepine", "combined-oral-contraceptive", "major", "Carbamazepine speeds hormone clearance.", "Contraceptive failure.", "Use injectable, IUD or condoms.", "Clinical", STOCKLEY),
  I("ciprofloxacin", "aminophylline", "major", "Ciprofloxacin blocks theophylline breakdown.", "Theophylline toxicity: vomiting, fast heart, seizures.", "Avoid, or reduce theophylline and monitor.", "Clinical", STOCKLEY),
  I("ciprofloxacin", "antacid", "moderate", "Aluminium and magnesium bind ciprofloxacin.", "Antibiotic fails.", "Take ciprofloxacin 2 hours before or 6 hours after.", "Clinical", STOCKLEY),
  I("ciprofloxacin", "ferrous-sulfate", "moderate", "Iron binds ciprofloxacin.", "Antibiotic fails.", "Separate by at least 2 hours before / 6 hours after.", "Clinical", STOCKLEY),
  I("doxycycline", "ferrous-sulfate", "moderate", "Iron binds doxycycline.", "Antibiotic fails.", "Separate by 2\u20133 hours.", "Clinical", STOCKLEY),
  I("dolutegravir", "ferrous-sulfate", "moderate", "Iron binds dolutegravir.", "HIV treatment may fail.", "Take dolutegravir 2 hours before or 6 hours after iron, or together with food.", "Clinical", ETH_HIV),
  I("dolutegravir", "metformin", "moderate", "Dolutegravir raises metformin levels.", "More stomach upset and lactic acidosis risk.", "Limit metformin to 1 g/day and monitor.", "Clinical", ETH_HIV),
  I("metronidazole", "tella", "major", "Metronidazole blocks alcohol breakdown.", "Flushing, vomiting, palpitations.", "No tella, tej or areke during and for 3 days after.", "Clinical", STOCKLEY),
  I("metronidazole", "tej", "major", "Metronidazole blocks alcohol breakdown.", "Flushing, vomiting, palpitations.", "No alcohol during and for 3 days after.", "Clinical", STOCKLEY),
  I("metronidazole", "areke", "major", "Metronidazole blocks alcohol breakdown.", "Flushing, vomiting, palpitations.", "No alcohol during and for 3 days after.", "Clinical", STOCKLEY),
  I("cotrimoxazole", "methotrexate", "contraindicated", "Both block folate and methotrexate clearance falls.", "Severe bone-marrow suppression.", "Avoid the combination.", "Clinical", STOCKLEY),
  I("allopurinol", "azathioprine", "major", "Allopurinol blocks azathioprine breakdown.", "Life-threatening bone-marrow suppression.", "Cut azathioprine to a quarter under specialist care, or avoid.", "Clinical", STOCKLEY),
  // Mind & pain
  I("tramadol", "fluoxetine", "major", "Both raise serotonin; fluoxetine also blocks tramadol activation.", "Serotonin syndrome and seizures; poorer pain relief.", "Choose another painkiller.", "Clinical", STOCKLEY),
  I("fluoxetine", "amitriptyline", "major", "Fluoxetine raises amitriptyline levels; serotonin adds up.", "Toxicity and serotonin syndrome.", "Avoid, or use low doses with monitoring.", "Clinical", STOCKLEY),
  I("paracetamol", "areke", "major", "Regular alcohol depletes liver defences against paracetamol.", "Liver damage even at normal doses.", "Keep paracetamol to 2 g/day or less with regular drinking.", "Clinical", STOCKLEY),
  // Traditional drinks and plants (documented)
  I("khat", "amoxicillin", "moderate", "Chewing khat slows stomach emptying and absorption.", "Lower antibiotic levels.", "Take the antibiotic at least 2 hours after chewing.", "Pharmacokinetic study", "Attef et al., J Antimicrob Chemother 1997 (khat and ampicillin/amoxycillin)"),
  I("khat", "ampicillin", "major", "Chewing khat markedly reduces ampicillin absorption.", "The antibiotic may fail.", "Do not chew khat within 2 hours of doses.", "Pharmacokinetic study", "Attef et al., J Antimicrob Chemother 1997 (khat and ampicillin/amoxycillin)"),
  I("buna", "ciprofloxacin", "moderate", "Ciprofloxacin slows caffeine breakdown.", "Jitteriness, fast heart, poor sleep.", "Cut down coffee during the course.", "Clinical", STOCKLEY),
  I("buna", "aminophylline", "moderate", "Caffeine competes with theophylline.", "Theophylline side effects.", "Keep coffee intake low and steady.", "Clinical", STOCKLEY),
  I("buna", "lithium", "moderate", "Changing coffee intake changes lithium levels.", "Sudden stop can raise lithium.", "Keep coffee intake steady.", "Clinical", STOCKLEY),
  I("ensilal", "ciprofloxacin", "moderate", "Fennel reduced ciprofloxacin absorption in studies.", "Lower antibiotic levels.", "Avoid fennel remedies within 2 hours of doses.", "Animal pharmacokinetic study", "Herb\u2013drug interaction reviews"),
  I("nech-shinkurt", "lopinavir-ritonavir", "moderate", "Garlic supplements lowered protease inhibitor levels.", "HIV treatment may weaken.", "Avoid garlic supplements; food amounts are fine.", "Pharmacokinetic study", "Herb\u2013drug interaction reviews"),
  I("tena-adam", "warfarin", "major", "Furanocoumarins and rutin add antiplatelet effects and inhibit CYP3A4 metabolism.", "Serious bleeding.", "Do not use Tena Adam remedies with blood thinners.", "Platform reference (review)", "ETM-SAFETY-WAR-01"),
  I("kosso", "warfarin", "major", "Kosotoxin irritates the gut lining and strains the liver.", "Gut bleeding.", "Avoid kosso while on blood thinners.", "Platform reference (review)", "ETM-SAFETY-KOS-02"),
  I("kosso", "metformin", "moderate", "Purging, fluid loss and metabolic strain.", "Dehydration and unstable blood sugar.", "Avoid; if used, stop metformin that day and drink fluids.", "Platform reference (review)", "ETM-SAFETY-KOS-03"),
  I("tikur-azmud", "metformin", "moderate", "Thymoquinone lowers blood sugar alongside diabetes medicines.", "Low blood sugar.", "Check blood sugar more often.", "Platform reference (review)", "ETM-SAFETY-GLU-03"),
  I("damakesse", "enalapril", "moderate", "Additive blood-vessel relaxation.", "Dizziness and fainting.", "Stand up slowly; check blood pressure.", "Platform reference (review)", "ETM-SAFETY-HYP-04"),
  I("feto", "furosemide", "moderate", "Additive water and potassium losses.", "Dehydration and low potassium.", "Drink enough; check potassium.", "Platform reference (review)", "ETM-SAFETY-DIU-05")
];

// src/server/safety/index.ts
var MAX_ITEMS = 40;
var syncing = null;
function ensureSafetySynced(force = false) {
  if (force || !syncing) {
    syncing = syncSeed().catch((error) => {
      syncing = null;
      throw error;
    });
  }
  return syncing;
}
async function syncSeed() {
  await db.transaction(async (tx) => {
    for (const seed of SEED_SUBSTANCES) {
      const values = {
        name: seed.name,
        kind: seed.kind,
        category: seed.category,
        scientificName: seed.scientificName ?? null,
        amharicName: seed.amharicName ?? null,
        aliases: seed.aliases,
        properties: seed.properties,
        cautions: parseCautionCodes(seed.cautionCodes),
        notes: seed.notes ?? null,
        evidence: seed.evidence ?? null
      };
      await tx.insert(safetySubstances).values({ slug: seed.slug, origin: "seed", ...values }).onDuplicateKeyUpdate({ set: keepExisting(safetySubstances) });
      await tx.update(safetySubstances).set({ ...values, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm7.and)((0, import_drizzle_orm7.eq)(safetySubstances.slug, seed.slug), (0, import_drizzle_orm7.eq)(safetySubstances.customized, false)));
    }
    for (const seed of SEED_INTERACTIONS) {
      const [a, b] = seed.a < seed.b ? [seed.a, seed.b] : [seed.b, seed.a];
      const values = { severity: seed.severity, mechanism: seed.mechanism, effect: seed.effect, management: seed.management, evidence: seed.evidence, source: seed.source };
      await tx.insert(safetyInteractions).values({ substanceA: a, substanceB: b, origin: "seed", ...values }).onDuplicateKeyUpdate({ set: keepExisting(safetyInteractions) });
      await tx.update(safetyInteractions).set({ ...values, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm7.and)((0, import_drizzle_orm7.eq)(safetyInteractions.substanceA, a), (0, import_drizzle_orm7.eq)(safetyInteractions.substanceB, b), (0, import_drizzle_orm7.eq)(safetyInteractions.customized, false)));
    }
  });
  invalidate();
}
var reference = null;
function invalidate() {
  reference = null;
}
var matrixInput = import_zod2.z.object({
  items: import_zod2.z.array(import_zod2.z.string().min(1).max(100)).max(MAX_ITEMS).default([]),
  names: import_zod2.z.array(import_zod2.z.string().trim().min(1).max(120)).max(MAX_ITEMS).default([]),
  profile: import_zod2.z.array(import_zod2.z.enum(CONDITIONS)).max(CONDITIONS.length).default([])
}).refine((value) => value.items.length + value.names.length > 0, "Add at least one medicine or remedy.");
var cautionSchema = import_zod2.z.record(import_zod2.z.enum(CONDITIONS), import_zod2.z.object({ level: import_zod2.z.enum(["avoid", "caution"]), note: import_zod2.z.string().trim().max(300).optional() }));
var substanceInput = import_zod2.z.object({
  name: import_zod2.z.string().trim().min(2).max(200),
  kind: import_zod2.z.enum(["modern", "traditional"]),
  category: import_zod2.z.string().trim().min(2).max(80),
  scientificName: import_zod2.z.string().trim().max(200).optional(),
  amharicName: import_zod2.z.string().trim().max(200).optional(),
  aliases: import_zod2.z.array(import_zod2.z.string().trim().min(1).max(120)).max(30).default([]),
  properties: import_zod2.z.array(import_zod2.z.enum(PROPERTY_KEYS)).max(30).default([]),
  cautions: cautionSchema.default({}),
  notes: import_zod2.z.string().trim().max(2e3).optional(),
  evidence: import_zod2.z.string().trim().max(120).optional(),
  status: import_zod2.z.enum(["published", "draft", "archived"]).default("published")
});
var interactionInput = import_zod2.z.object({
  a: import_zod2.z.string().min(1).max(100),
  b: import_zod2.z.string().min(1).max(100),
  severity: import_zod2.z.enum(SEVERITIES),
  mechanism: import_zod2.z.string().trim().min(3).max(2e3),
  effect: import_zod2.z.string().trim().min(3).max(2e3),
  management: import_zod2.z.string().trim().min(3).max(2e3),
  evidence: import_zod2.z.string().trim().min(2).max(120),
  source: import_zod2.z.string().trim().min(2).max(300),
  status: import_zod2.z.enum(["published", "draft", "archived"]).default("published")
});

// src/lib/db/referenceData.ts
async function setupReferenceData(log2 = console.log) {
  const roles2 = await seedRoles();
  log2(`Roles ready (${roles2.size}).`);
  const catalogues = await seedMarketplaceCatalogues();
  log2(`Marketplace catalogues ready (${catalogues.categories} categories, ${catalogues.serviceKinds} service kinds).`);
  await runSeed();
  await ensureSafetySynced(true);
  log2("Safety reference ready.");
  try {
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { users: users2, roles: roles3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq6 } = await import("drizzle-orm");
    const [existing] = await db2.select({ id: users2.id, role: users2.role }).from(users2).where(eq6(users2.email, "abebetadesse1@gmail.com")).limit(1);
    if (existing && existing.role !== "super_admin") {
      const [superRole] = await db2.select({ id: roles3.id }).from(roles3).where(eq6(roles3.name, "super_admin")).limit(1);
      if (superRole) {
        await db2.update(users2).set({ role: "super_admin", roleId: superRole.id }).where(eq6(users2.id, existing.id));
        log2("Promoted abebetadesse1@gmail.com to super_admin.");
      }
    }
  } catch {
  }
}

// src/lib/db/setupReference.ts
setupReferenceData().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(() => dbClient.end({ timeout: 2 }));
