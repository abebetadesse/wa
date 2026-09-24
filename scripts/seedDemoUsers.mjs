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
  const roles = await sql`SELECT id, name FROM roles`;
  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));

  const demoUsers = [
    {
      email: "almaz.bekele@ethio-wellness.org",
      name: "Almaz Bekele",
      role: "user",
      roleId: roleMap["user"] || null,
      phone: "+251911223344",
      region: "Addis Ababa",
      city: "Addis Ababa",
      language: "en",
    },
    {
      email: "yemane.reviewer@ethio-wellness.org",
      name: "Dr. Yemane Tesfaye",
      role: "reviewer",
      roleId: roleMap["reviewer"] || null,
      phone: "+251922334455",
      region: "Addis Ababa",
      city: "Addis Ababa",
      language: "en",
    },
    {
      email: "mekonnen.admin@ethio-wellness.org",
      name: "Mekonnen Birhanu",
      role: "admin",
      roleId: roleMap["admin"] || null,
      phone: "+251933445566",
      region: "Addis Ababa",
      city: "Addis Ababa",
      language: "en",
    },
  ];

  for (const u of demoUsers) {
    const existing = await sql`SELECT id FROM users WHERE email = ${u.email}`;
    if (existing.length > 0) {
      await sql`
        UPDATE users 
        SET name = ${u.name},
            password_hash = ${hash},
            role = ${u.role},
            role_id = ${u.roleId},
            is_active = true,
            is_verified = true,
            failed_login_attempts = 0,
            lockout_until = null,
            updated_at = NOW()
        WHERE email = ${u.email}
      `;
      console.log("Updated demo user:", u.email);
    } else {
      await sql`
        INSERT INTO users (
          id, email, name, password_hash, role, role_id, phone, region, city, 
          preferred_language, is_active, is_verified, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), ${u.email}, ${u.name}, ${hash}, ${u.role}, ${u.roleId},
          ${u.phone}, ${u.region}, ${u.city}, ${u.language}, true, true, NOW(), NOW()
        )
      `;
      console.log("Inserted demo user:", u.email);
    }
  }

  console.log("All demo users seeded successfully!");
  await sql.end();
}

main().catch((err) => {
  console.error("Error seeding demo users:", err);
  process.exit(1);
});
