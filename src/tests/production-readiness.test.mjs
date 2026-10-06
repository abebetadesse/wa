/**
 * Production safeguards: environment checks, secrets that must not fall back to published defaults,
 * email delivery over SMTP, rate limits shared through the database, safe seeds and admin creation,
 * and the shape of the migration set. Database-backed cases are skipped when MySQL is unreachable.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { eq, like } from "drizzle-orm";
import { environmentReport } from "../lib/config/environment.ts";
import { encryptRestrictedField, decryptRestrictedField } from "../lib/security/encryption.ts";
import { deliverCode, linkBaseUrl } from "../server/auth/codes.ts";
import { actionEmail, mailStatus, sendMail } from "../server/mail/index.ts";
import { consumeSharedRateLimit, rateLimitStore } from "../lib/api/sharedRateLimit.ts";
import { verifyPassword } from "../lib/auth.ts";

const { db, dbClient } = await import("../lib/db/index.ts");
const schema = await import("../lib/db/schema/index.ts");
const authSeed = await import("../lib/db/migrateAndSeedAuth.ts");
let available = true;
try {
  await dbClient`select 1`;
} catch {
  available = false;
}
const skip = () => !available && "database unavailable";
const root = path.resolve(import.meta.dirname, "../..");
const run = crypto.randomBytes(3).toString("hex");

after(async () => {
  if (available) {
    const created = await db.select({ id: schema.users.id }).from(schema.users).where(like(schema.users.email, `ready-%-${run}@example.test`));
    for (const { id } of created) await db.delete(schema.auditLog).where(eq(schema.auditLog.userId, id));
    await db.delete(schema.users).where(like(schema.users.email, `ready-%-${run}@example.test`));
    await dbClient`delete from rate_limits where key like ${`test:${run}:%`}`.catch(() => null);
  }
  await dbClient.end({ timeout: 2 });
});

async function withEnv(vars, fn) {
  const saved = Object.fromEntries(Object.keys(vars).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(vars)) value === undefined ? delete process.env[key] : (process.env[key] = value);
  const quiet = { info: console.info, warn: console.warn, error: console.error };
  console.info = console.warn = console.error = () => {};
  try {
    return await fn();
  } finally {
    Object.assign(console, quiet);
    for (const [key, value] of Object.entries(saved)) value === undefined ? delete process.env[key] : (process.env[key] = value);
  }
}

const SECRET = "x".repeat(40);
const COMPLETE = { DATABASE_URL: "mysql://db.example:3306/app", AUTH_SECRET: SECRET, DATA_ENCRYPTION_KEY: `${SECRET}y`, APP_URL: "https://app.example.et", SMTP_HOST: "mail.example.et", MAIL_FROM: "no-reply@example.et", CHAPA_SECRET_KEY: "CHASECK-live", UPLOAD_DIR: "/data/uploads", AUTH_DEV_CODES: undefined, TELEGRAM_BOT_TOKEN: undefined, SMTP_USER: undefined };

test("environment: a complete configuration passes; each missing requirement is named", async () => {
  await withEnv(COMPLETE, () => assert.deepEqual(environmentReport(), { errors: [], warnings: [] }));
  await withEnv({ ...COMPLETE, DATABASE_URL: "postgres://db.example:5432/app" }, () => assert.match(environmentReport().errors.join("\n"), /must be a MySQL address/));
  await withEnv({ ...COMPLETE, AUTH_SECRET: undefined, DATA_ENCRYPTION_KEY: "short", APP_URL: undefined }, () => {
    const { errors } = environmentReport();
    assert.equal(errors.length, 3);
    assert.match(errors.join("\n"), /AUTH_SECRET is not set/);
    assert.match(errors.join("\n"), /DATA_ENCRYPTION_KEY is too short/);
    assert.match(errors.join("\n"), /APP_URL is not set/);
  });
  await withEnv({ ...COMPLETE, APP_URL: "http://app.example.et", SMTP_HOST: undefined, CHAPA_SECRET_KEY: "CHASECK_TEST-abc", UPLOAD_DIR: undefined }, () => {
    const { errors, warnings } = environmentReport();
    assert.equal(errors.length, 0);
    assert.equal(warnings.length, 4, "http address, no way to reset passwords, test payment key, uploads inside the app folder");
  });
});

test("secrets: production refuses the published development encryption key", async () => {
  await withEnv({ NODE_ENV: "production", DATA_ENCRYPTION_KEY: undefined }, () => assert.throws(() => encryptRestrictedField({ a: 1 }), /DATA_ENCRYPTION_KEY must be configured/));
  await withEnv({ NODE_ENV: "production", DATA_ENCRYPTION_KEY: SECRET }, () => assert.deepEqual(decryptRestrictedField(encryptRestrictedField({ medicines: ["warfarin"] })), { medicines: ["warfarin"] }));
});

test("links: production builds them from APP_URL only, never from the request's Host header", async () => {
  await withEnv({ NODE_ENV: "production", APP_URL: undefined }, () => assert.equal(linkBaseUrl("https://attacker.example"), ""));
  await withEnv({ NODE_ENV: "production", APP_URL: "https://app.example.et/" }, () => assert.equal(linkBaseUrl("https://attacker.example"), "https://app.example.et"));
  await withEnv({ NODE_ENV: "development", APP_URL: undefined }, () => assert.equal(linkBaseUrl("http://localhost:5500"), "http://localhost:5500"));
});

/** A minimal SMTP server that accepts one message at a time and keeps what it received. */
function fakeSmtp() {
  const received = [];
  const server = net.createServer((socket) => {
    let data = null;
    let buffer = "";
    socket.write("220 test ESMTP\r\n");
    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      if (data !== null) {
        const end = buffer.indexOf("\r\n.\r\n");
        if (end < 0) return;
        received.push({ ...data, body: buffer.slice(0, end) });
        buffer = buffer.slice(end + 5);
        data = null;
        socket.write("250 queued\r\n");
        return;
      }
      let index;
      while (data === null && (index = buffer.indexOf("\r\n")) >= 0) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);
        if (/^EHLO|^HELO/i.test(line)) socket.write("250 test\r\n");
        else if (/^MAIL FROM:/i.test(line)) (socket.from = line.slice(10)), socket.write("250 ok\r\n");
        else if (/^RCPT TO:/i.test(line)) (socket.to = line.slice(8)), socket.write("250 ok\r\n");
        else if (/^DATA/i.test(line)) (data = { from: socket.from, to: socket.to }), socket.write("354 go\r\n");
        else if (/^QUIT/i.test(line)) socket.end("221 bye\r\n");
        else socket.write("250 ok\r\n");
      }
    });
    socket.on("error", () => {});
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, received, port: server.address().port })));
}

const decodeBody = (body) => body.replace(/=\r\n/g, "").replace(/=([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

test("email: reset links and verification codes are delivered over SMTP; without SMTP nothing is sent", async () => {
  await withEnv({ SMTP_HOST: undefined }, async () => {
    assert.equal(mailStatus().configured, false);
    assert.deepEqual(await sendMail({ to: "a@example.test", subject: "s", text: "t" }), { sent: false });
  });
  const mail = actionEmail({ heading: "H <b>", lines: ["one"], code: "123456", footer: "f" });
  assert.match(mail.text, /123456/);
  assert.match(mail.html, /H &lt;b&gt;/, "content is escaped in the HTML part");

  const smtp = await fakeSmtp();
  try {
    await withEnv({ NODE_ENV: "production", SMTP_HOST: "127.0.0.1", SMTP_PORT: String(smtp.port), SMTP_USER: undefined, SMTP_SECURE: "false", MAIL_FROM: "Atlas <no-reply@example.test>", APP_URL: "https://app.example.et", AUTH_DEV_CODES: undefined }, async () => {
      assert.deepEqual(await deliverCode({ to: "client@example.test", purpose: "password_reset", token: "tok123", origin: "https://attacker.example" }), {}, "nothing is disclosed to the browser");
      assert.deepEqual(await deliverCode({ to: "client@example.test", purpose: "email_verification", token: "t", code: "654321" }), {});
    });
    assert.equal(smtp.received.length, 2);
    assert.match(smtp.received[0].to, /client@example\.test/);
    const reset = decodeBody(smtp.received[0].body);
    assert.match(reset, /https:\/\/app\.example\.et\/auth\/reset-password\?token=tok123/);
    assert.doesNotMatch(reset, /attacker/);
    assert.match(smtp.received[1].body, /654321/);
    // A mail server that is down must not break the request.
    await new Promise((resolve) => smtp.server.close(resolve));
    await withEnv({ NODE_ENV: "production", SMTP_HOST: "127.0.0.1", SMTP_PORT: String(smtp.port), SMTP_SECURE: "false", MAIL_FROM: "no-reply@example.test", APP_URL: "https://app.example.et", SMTP_USER: `u${run}` }, async () => {
      assert.deepEqual(await sendMail({ to: "a@example.test", subject: "s", text: "t" }), { sent: false });
    });
  } finally {
    smtp.server.close();
  }
});

test("rate limits: counted in the database in production, so they hold across processes", { skip: skip() }, async () => {
  await withEnv({ NODE_ENV: "production", RATE_LIMIT_STORE: undefined }, () => assert.equal(rateLimitStore(), "database"));
  await withEnv({ NODE_ENV: "development", RATE_LIMIT_STORE: undefined }, () => assert.equal(rateLimitStore(), "memory"));
  await withEnv({ RATE_LIMIT_STORE: "database" }, async () => {
    const key = `test:${run}:login`;
    for (let i = 0; i < 3; i++) assert.equal((await consumeSharedRateLimit(key, 3, 400)).allowed, true);
    const blocked = await consumeSharedRateLimit(key, 3, 400);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterSeconds >= 1);
    // The count is in the table, not in this process.
    const [row] = await dbClient`select count from rate_limits where \`key\` = ${key}`;
    assert.equal(row.count, 4);
    assert.equal((await consumeSharedRateLimit(`test:${run}:other`, 3, 400)).allowed, true, "keys are independent");
    await new Promise((resolve) => setTimeout(resolve, 500));
    assert.equal((await consumeSharedRateLimit(key, 3, 400)).allowed, true, "the window resets");
  });
});

test("administrators: created with a one-time or supplied password; nothing is hardcoded", { skip: skip() }, async () => {
  const email = `ready-admin-${run}@example.test`;
  await assert.rejects(authSeed.createAdmin({ email, password: "weak" }), /stronger password/);
  const created = await authSeed.createAdmin({ email, name: "Ready Admin" });
  assert.equal(created.created, true);
  assert.ok(created.generatedPassword.length >= 20);
  let [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  assert.equal(user.role, "admin");
  assert.ok(user.roleId, "linked to the admin role");
  assert.ok(verifyPassword(created.generatedPassword, user.passwordHash));
  assert.notEqual(user.passwordHash, created.generatedPassword, "only a hash is stored");

  // Promoting again leaves the password alone unless a new one is given.
  const again = await authSeed.createAdmin({ email, role: "super_admin" });
  assert.deepEqual([again.created, again.passwordChanged, again.generatedPassword], [false, false, null]);
  [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  assert.equal(user.role, "super_admin");
  assert.ok(verifyPassword(created.generatedPassword, user.passwordHash));

  await withEnv({ NODE_ENV: "production", DEMO_USER_PASSWORD: "Str0ng!Passw0rd#1" }, () => assert.rejects(authSeed.seedDemoUsers(), /local development only/));
  await withEnv({ NODE_ENV: "development", DATABASE_URL: "mysql://db.example.et:3306/app", DEMO_USER_PASSWORD: "Str0ng!Passw0rd#1" }, () => assert.rejects(authSeed.seedDemoUsers(), /local development only/));
});

test("repository: no passwords in seeds, no destructive seed, and an ordered migration set", () => {
  const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
  const sources = [...fs.readdirSync(path.join(root, "src/lib/db")).filter((f) => f.endsWith(".ts")).map((f) => `src/lib/db/${f}`), ...fs.readdirSync(path.join(root, "scripts")).filter((f) => /\.(mjs|js|ts)$/.test(f)).map((f) => `scripts/${f}`)];
  for (const file of sources) {
    assert.doesNotMatch(read(file), /hashPassword\(\s*["'`]/, `${file} hashes a literal password`);
    assert.doesNotMatch(read(file), /password\s*[:=]\s*["'`][^"'`$]{6,}["'`]/i, `${file} contains a literal password`);
  }
  assert.doesNotMatch(read("src/lib/db/seed.ts"), /delete\(auditLog\)/, "seeding must never clear the audit log");

  const drizzle = path.join(root, "drizzle-mysql");
  const migrations = fs.readdirSync(drizzle).filter((f) => /^\d{4}_.+\.sql$/.test(f)).sort();
  assert.ok(migrations.length > 0, "the MySQL migration set has a baseline");
  const baseline = read(`drizzle-mysql/${migrations[0]}`);
  assert.match(baseline, /CREATE TABLE `users`/);
  assert.equal((baseline.match(/CREATE TABLE `/g) ?? []).length, 99, "baseline creates every current application table");
  const numbers = migrations.map((f) => Number(f.slice(0, 4)));
  assert.deepEqual(numbers, [...numbers].sort((a, b) => a - b));
  assert.equal(new Set(numbers).size, numbers.length, "migration numbers are unique");
  assert.deepEqual(numbers, Array.from({ length: numbers.length }, (_, i) => i), "no gaps in the sequence");
  assert.match(read("scripts/migrate.mjs"), /drizzle-mysql/);
  for (const stray of ["scripts/seedAbebe.mjs", "scripts/seedDemoUsers.mjs", "case_cookies.txt"]) assert.equal(fs.existsSync(path.join(root, stray)), false, stray);
});
