/**
 * Roles and accounts needed before anyone can sign in.
 *
 *   seedRoles()        system roles and their default permissions. Idempotent; safe in production.
 *   createAdmin()      creates or promotes one administrator. The password is supplied by the
 *                      operator (ADMIN_PASSWORD) or generated and shown once. See ./createAdmin.ts.
 *   seedDemoUsers()    sample accounts for local development only. Refuses production, and takes
 *                      its password from DEMO_USER_PASSWORD: no password is ever kept in the code.
 */
import { randomBytes, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { auditLog, roles, users } from "./schema";
import { DEFAULT_ROLE_PERMISSIONS, type RoleName } from "./schema/rbac";
import { hashPassword, validatePasswordStrength } from "../auth";

const roleDefinitions: Array<{ name: RoleName; description: string }> = [
  ["super_admin", "Full system control with unrestricted permissions"],
  ["admin", "Platform administrator with user and content management privileges"],
  ["premium", "Paid subscriber with advanced workflows"],
  ["user", "Authenticated user with personal wellbeing workflow access"],
  ["editor", "Knowledge base content editor"],
  ["reviewer", "Content approver for knowledge and safety validation"],
  ["practitioner", "Verified health professional and herbal medicine consultant"],
  ["analyst", "Read-only analytics and audit inspector"],
].map(([name, description]) => ({ name: name as RoleName, description }));

const demoUsers = [
  ["mekonnen.admin@ethio-wellness.org", "Mekonnen Birhanu", "admin", "am", "1985-07-22"],
  ["frehiwot.editor@ethio-wellness.org", "Frehiwot Shenkut", "editor", "om", "1992-11-05"],
  ["yemane.reviewer@ethio-wellness.org", "Dr. Yemane Tesfaye", "reviewer", "ti", "1980-09-18"],
  ["dr.dawit@ethio-wellness.org", "Dr. Dawit Alemu", "practitioner", "en", "1982-01-30"],
  ["hailu.premium@ethio-wellness.org", "Hailu Tadesse", "premium", "en", "1995-04-12"],
  ["almaz.bekele@ethio-wellness.org", "Almaz Bekele", "user", "am", "1992-04-18"],
  ["birhanu.analyst@ethio-wellness.org", "Birhanu Kassa", "analyst", "so", "1991-08-25"],
] as const;

/** Inserts or refreshes the system roles. Returns role name → id. */
export async function seedRoles() {
  for (const role of roleDefinitions) {
    await db
      .insert(roles)
      .values({ id: randomUUID(), name: role.name, description: role.description, permissions: DEFAULT_ROLE_PERMISSIONS[role.name], isSystemRole: true, isActive: true })
      .onDuplicateKeyUpdate({ set: { description: role.description, permissions: DEFAULT_ROLE_PERMISSIONS[role.name], isActive: true } });
  }
  const rows = await db.select({ id: roles.id, name: roles.name }).from(roles);
  return new Map(rows.map((row) => [row.name, row.id]));
}

/** A random password that satisfies validatePasswordStrength. */
export function generatePassword() {
  return `${randomBytes(15).toString("base64url")}aA1!`;
}

export interface CreateAdminInput {
  email: string;
  name?: string;
  role?: "admin" | "super_admin";
  /** Omit to have one generated; it is returned once and stored only as a hash. */
  password?: string;
}

/** Creates the account, or promotes an existing one (its password changes only if one is given). */
export async function createAdmin(input: CreateAdminInput) {
  const email = input.email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Give a valid email address.");
  const role = input.role ?? "admin";
  if (input.password) {
    const strength = validatePasswordStrength(input.password);
    if (!strength.isValid || input.password.length < 12) throw new Error(`Choose a stronger password (12+ characters). ${strength.errors.join(" ")}`.trim());
  }
  const roleIds = await seedRoles();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  const generated = !existing && !input.password ? generatePassword() : null;
  const password = input.password ?? generated;

  let userId: string;
  if (existing) {
    userId = existing.id;
    await db
      .update(users)
      .set({ role, roleId: roleIds.get(role), isActive: true, isVerified: true, failedLoginAttempts: 0, lockoutUntil: null, updatedAt: new Date(), ...(password ? { passwordHash: hashPassword(password) } : {}) })
      .where(eq(users.id, userId));
  } else {
    userId = randomUUID();
    await db.insert(users).values({ id: userId, email, name: input.name?.trim() || email.split("@")[0], passwordHash: hashPassword(password!), role, roleId: roleIds.get(role), preferredLanguage: "am", isVerified: true, isActive: true, loginCount: 0 });
  }
  await db.insert(auditLog).values({ id: randomUUID(), userId, eventType: "admin_account", action: existing ? "admin_promoted" : "admin_created", resourceType: "user", payload: { role, passwordChanged: Boolean(password) } });
  return { email, role, created: !existing, passwordChanged: Boolean(password), generatedPassword: generated };
}

/** Local development only. */
export async function seedDemoUsers() {
  const url = process.env.DATABASE_URL ?? "";
  const local = !url || /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);
  if (process.env.NODE_ENV === "production" || !local) throw new Error("Demo accounts are for local development only: refusing a production or remote database.");
  const password = process.env.DEMO_USER_PASSWORD;
  if (!password || !validatePasswordStrength(password).isValid) throw new Error("Set DEMO_USER_PASSWORD to a strong password for the demo accounts (it is not stored in the code).");
  const roleIds = await seedRoles();
  const passwordHash = hashPassword(password);
  for (const [email, name, role, language, dateOfBirth] of demoUsers) {
    await db
      .insert(users)
      .values({ id: randomUUID(), email, name, passwordHash, role, roleId: roleIds.get(role), preferredLanguage: language, dateOfBirth, isVerified: true, isActive: true, loginCount: 0 })
      .onDuplicateKeyUpdate({ set: { name, passwordHash, role, roleId: roleIds.get(role), preferredLanguage: language, isVerified: true, isActive: true, updatedAt: new Date() } });
  }
  return demoUsers.length;
}

/** Kept for existing callers: roles always, demo accounts only when explicitly requested. */
export async function migrateAndSeedAuth() {
  const roleIds = await seedRoles();
  console.log(`Roles ready (${roleIds.size}).`);
  if (process.env.SEED_DEMO_USERS === "1") console.log(`Demo accounts ready (${await seedDemoUsers()}).`);
}
