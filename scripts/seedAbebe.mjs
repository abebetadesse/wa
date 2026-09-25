import crypto from "crypto";
import postgres from "postgres";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

const sql = postgres(
  process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/ethio_wellness"
);

async function main() {
  const hash = hashPassword("Ethiowellbeing@2026!");
  const roles = await sql`SELECT id, name FROM roles WHERE name = 'admin'`;
  const adminRoleId = roles[0]?.id || null;

  const existing = await sql`SELECT id FROM users WHERE email = 'abebetadesse1@gmail.com'`;
  if (existing.length === 0) {
    await sql`
      INSERT INTO users (
        id, email, name, password_hash, role, role_id, phone, region, city, 
        preferred_language, is_active, is_verified, failed_login_attempts, lockout_until, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 'abebetadesse1@gmail.com', 'Abebe Tadesse', ${hash}, 'admin', ${adminRoleId},
        '+251911000000', 'Addis Ababa', 'Addis Ababa', 'am', true, true, 0, null, NOW(), NOW()
      )
    `;
    console.log("Seeded abebetadesse1@gmail.com as admin with password Ethiowellbeing@2026!");
  } else {
    await sql`
      UPDATE users 
      SET password_hash = ${hash},
          role = 'admin',
          is_active = true,
          is_verified = true,
          failed_login_attempts = 0,
          lockout_until = null,
          updated_at = NOW()
      WHERE email = 'abebetadesse1@gmail.com'
    `;
    console.log("Updated abebetadesse1@gmail.com with password Ethiowellbeing@2026!");
  }
  await sql.end();
}

main().catch((err) => {
  console.error("Error seeding abebe user:", err);
  process.exit(1);
});
