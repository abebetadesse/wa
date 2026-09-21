/**
 * Emergency Schema — Domain A (Clinical Safety)
 * Stores emergency contacts, conditions, and alert logs for each user.
 * This data is also cached in the offline knowledge base (IndexedDB).
 */
import { pgTable, uuid, varchar, timestamp, jsonb, boolean, text } from "../mysqlSchema";
import { users } from "./users";

export const emergencyProfiles = pgTable("emergency_profiles", {
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
  bloodType: varchar("blood_type", { length: 10 }),

  // Nearest health facility
  preferredHospital: varchar("preferred_hospital", { length: 255 }),
  preferredHospitalPhone: varchar("preferred_hospital_phone", { length: 50 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emergencyAlerts = pgTable("emergency_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  // "sos_manual" | "threshold_critical" | "no_checkin"

  severity: varchar("severity", { length: 20 }).notNull(),
  // "warning" | "critical"

  message: text("message").notNull(),

  contactsNotified: jsonb("contacts_notified").default([]).notNull(),
  // $jsonb shape: string[] — phone numbers notified

  resolved: boolean("resolved").default(false).notNull(),
  resolvedAt: timestamp("resolved_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
