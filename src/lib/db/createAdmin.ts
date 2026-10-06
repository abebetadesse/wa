/**
 * Create or promote an administrator.
 *
 *   npm run admin:create -- --email you@example.com [--name "Your Name"] [--role super_admin]
 *
 * Password: set ADMIN_PASSWORD in the environment (12+ characters, mixed case, a digit and a
 * symbol). For a new account without ADMIN_PASSWORD, one is generated and printed once: sign in
 * and change it straight away. An existing account keeps its password unless ADMIN_PASSWORD is set.
 * Passwords are never passed as command-line arguments (they would be saved in shell history).
 */
import "./loadEnv";
import { dbClient } from "./index";
import { createAdmin } from "./migrateAndSeedAuth";

function arg(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const email = arg("email") ?? process.env.ADMIN_EMAIL;
  if (!email) throw new Error("Pass the administrator's email: --email you@example.com (or set ADMIN_EMAIL).");
  const role = arg("role") ?? "admin";
  if (role !== "admin" && role !== "super_admin") throw new Error("--role must be admin or super_admin.");
  const result = await createAdmin({ email, name: arg("name") ?? process.env.ADMIN_NAME, role, password: process.env.ADMIN_PASSWORD || undefined });
  console.log(`${result.created ? "Created" : "Updated"} ${result.email} as ${result.role}.`);
  if (result.generatedPassword) {
    console.log(`One-time password: ${result.generatedPassword}`);
    console.log("It is shown only now. Sign in and change it from your profile.");
  } else if (result.passwordChanged) {
    console.log("Password set from ADMIN_PASSWORD. Remove that variable from the environment now.");
  } else {
    console.log("Password unchanged.");
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => dbClient.end({ timeout: 2 }));
