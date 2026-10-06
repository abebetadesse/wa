/**
 * The application prepares its own database when it starts in production: pending migrations,
 * then the reference data, then (optionally) the first administrator.
 *
 * Why here and not only in `npm run db:setup`: on some hosts (Plesk's "Run script") commands do
 * not receive the settings the running application has, so the command cannot find the database
 * while the application can. The rules are the same ones the command uses (scripts/migrate-core.mjs):
 * an unprefixed set-up refuses a database that already holds tables, a prefixed one touches only
 * tables carrying the prefix, a named database lock lets one process do the work, and a set-up
 * interrupted by a restart continues where it stopped.
 *
 *   DB_AUTO_SETUP=off               turn this off and run `npm run db:setup` yourself
 *   ADMIN_EMAIL, ADMIN_PASSWORD     create this administrator once, if the account does not exist
 *   ADMIN_NAME, ADMIN_ROLE          optional (role: admin, the default, or super_admin)
 *
 * It runs beside start-up, not before it: the site answers straight away and /api/health reports
 * the progress or the reason for a failure.
 */
import path from "node:path";
import mysql from "mysql2/promise";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";
import { tablePrefix } from "@/lib/db/mysqlSchema";
import { createAdmin } from "@/lib/db/migrateAndSeedAuth";
import { setupReferenceData } from "@/lib/db/referenceData";
import { runMigrations } from "../../../scripts/migrate-core.mjs";

export interface SetupStatus {
  state: "off" | "running" | "ready" | "failed";
  /** Why it failed, or what it is waiting for. Safe to show: connection details are removed. */
  detail?: string;
  /** About the optional administrator account. */
  notice?: string;
  at: string;
}

const globalForSetup = globalThis as unknown as { databaseSetup?: SetupStatus; databaseSetupRun?: Promise<void> };

const set = (status: Omit<SetupStatus, "at">) => {
  globalForSetup.databaseSetup = { ...status, at: new Date().toISOString() };
};

export const setupStatus = (): SetupStatus => globalForSetup.databaseSetup ?? { state: "off", at: new Date().toISOString() };

/** Removes user names, hosts and addresses from a database error before it is shown to anyone. */
export function publicDetail(message: string): string {
  return message
    .replace(/mysql:\/\/\S+/gi, "mysql://…")
    .replace(/'[^']*'@'[^']*'/g, "the database user")
    .replace(/\b\d{1,3}(\.\d{1,3}){3}(:\d+)?\b/g, "the database server")
    .slice(0, 300);
}

const log = (line: string) => console.log(`[setup] ${line}`);
const LOCK_WAIT_SECONDS = 900;

async function createFirstAdministrator(): Promise<string | undefined> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return undefined;
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  // An existing account is never changed from here: a restart must not reset anyone's password.
  if (existing) return "The administrator account already exists. Remove ADMIN_EMAIL and ADMIN_PASSWORD from the settings.";
  try {
    await createAdmin({ email, name: process.env.ADMIN_NAME, password, role: process.env.ADMIN_ROLE?.trim() === "super_admin" ? "super_admin" : "admin" });
    return "The administrator account was created. Sign in, then remove ADMIN_EMAIL and ADMIN_PASSWORD from the settings.";
  } catch (error) {
    return `The administrator account was not created: ${error instanceof Error ? error.message : "unknown error"}`;
  }
}

async function run() {
  if (process.env.NODE_ENV !== "production" || process.env.DB_AUTO_SETUP?.trim().toLowerCase() === "off") return;
  const url = process.env.DATABASE_URL?.trim() ?? "";
  set({ state: "running", detail: "Preparing the database." });
  let lock: mysql.Connection | null = null;
  try {
    const prefix = tablePrefix();
    const lockName = `ethio_wellness_setup${prefix ? `:${prefix}` : ""}`;
    lock = await mysql.createConnection({ uri: url, connectTimeout: 20_000 });
    // Another process of this application may already be at work; wait for it rather than race it.
    const [rows] = await lock.query("SELECT GET_LOCK(?, ?) AS acquired", [lockName, LOCK_WAIT_SECONDS]);
    if (Number((rows as Array<{ acquired: number }>)[0]?.acquired) !== 1) throw new Error("Another process has been preparing the database for a long time. Restart the application.");
    try {
      const { ran } = await runMigrations({ url, prefix, migrationDir: path.join(process.cwd(), "drizzle-mysql"), log });
      const [{ n }] = await db.select({ n: count() }).from(roles);
      if (ran.length || !n) await setupReferenceData(log);
      const notice = await createFirstAdministrator();
      if (notice) log(notice);
      set({ state: "ready", notice });
    } finally {
      await lock.query("SELECT RELEASE_LOCK(?)", [lockName]).catch(() => null);
    }
  } catch (error) {
    const detail = publicDetail(error instanceof Error ? error.message : String(error));
    console.error(`[setup] failed: ${detail}`);
    set({ state: "failed", detail });
  } finally {
    await lock?.end().catch(() => null);
  }
}

/** Starts the set-up once per process. Never throws. */
export function prepareDatabase(): Promise<void> {
  globalForSetup.databaseSetupRun ??= run();
  return globalForSetup.databaseSetupRun;
}
