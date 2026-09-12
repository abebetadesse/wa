import { pool } from "./index";
import { hashPassword } from "../auth";
import { DEFAULT_ROLE_PERMISSIONS, RoleName } from "./schema/rbac";

export async function migrateAndSeedAuth() {
  const client = await pool.connect();
  try {
    console.log("🔒 Running enterprise auth & RBAC migration & seeding...");

    // 1. DDL: Ensure tables and columns exist
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      -- 1. Roles table
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- 2. Extend users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash VARCHAR(255),
        role VARCHAR(30) NOT NULL DEFAULT 'user',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        failed_login_attempts INTEGER NOT NULL DEFAULT 0,
        lockout_until TIMESTAMP,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30) UNIQUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS region VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) NOT NULL DEFAULT 'en';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

      -- 3. Sessions table
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        refresh_token_hash VARCHAR(128) NOT NULL UNIQUE,
        access_token VARCHAR(1000),
        ip_address VARCHAR(45),
        user_agent TEXT,
        device_info JSONB DEFAULT '{}'::jsonb,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        revoked_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS access_token VARCHAR(1000);
      ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS device_info JSONB DEFAULT '{}'::jsonb;
      ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

      -- 4. Email verifications table
      CREATE TABLE IF NOT EXISTS email_verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        otp_code VARCHAR(10),
        expires_at TIMESTAMP NOT NULL,
        verified_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- 5. Password resets table
      CREATE TABLE IF NOT EXISTS password_resets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- 6. User activities table
      CREATE TABLE IF NOT EXISTS user_activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- 7. Login history table
      CREATE TABLE IF NOT EXISTS login_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        device_info JSONB DEFAULT '{}'::jsonb,
        status VARCHAR(20) NOT NULL,
        failure_reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- 8. Extend audit_log table
      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        event_type VARCHAR(80) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS action VARCHAR(100);
      ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS resource_type VARCHAR(50);
      ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS resource_id VARCHAR(100);
      ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;
      ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
      ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS user_agent TEXT;
      ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS session_id UUID;
    `);

    // 2. Seed Default Roles
    const roleMap: Record<string, string> = {};
    const rolesToSeed: Array<{ name: RoleName; description: string; isSystem: boolean }> = [
      { name: "super_admin", description: "Full system control with unrestricted permissions", isSystem: true },
      { name: "admin", description: "Platform administrator with user and content management privileges", isSystem: true },
      { name: "premium", description: "Paid subscriber with advanced AI chat, full reports, and practitioner consults", isSystem: true },
      { name: "user", description: "Basic authenticated patient/user with access to personal health workflows", isSystem: true },
      { name: "editor", description: "Knowledge base content editor for Ethiopian medicine strands and items", isSystem: true },
      { name: "reviewer", description: "Content approver for traditional knowledge and clinical validations", isSystem: true },
      { name: "practitioner", description: "Verified Ethiopian health professional and herbal medicine consultant", isSystem: true },
      { name: "analyst", description: "Read-only analytics and audit log inspector", isSystem: true },
    ];

    for (const r of rolesToSeed) {
      const perms = JSON.stringify(DEFAULT_ROLE_PERMISSIONS[r.name]);
      const res = await client.query(
        `INSERT INTO roles (name, description, permissions, is_system_role, is_active)
         VALUES ($1, $2, $3::jsonb, $4, TRUE)
         ON CONFLICT (name) DO UPDATE SET
           description = EXCLUDED.description,
           permissions = EXCLUDED.permissions,
           updated_at = NOW()
         RETURNING id, name;`,
        [r.name, r.description, perms, r.isSystem]
      );
      roleMap[res.rows[0].name] = res.rows[0].id;
    }
    console.log(`✅ Seeded ${Object.keys(roleMap).length} default enterprise roles.`);

    // 3. Seed Demo Users for each Persona
    const defaultPasswordHash = hashPassword("Ethiohealth@2026!");
    const superAdminPasswordHash = hashPassword("Ninielda@&1");

    const demoUsers = [
      {
        email: "abebetadesse1@gmail.com",
        name: "Abebe Tadesse",
        role: "super_admin",
        phone: "+251911234567",
        gender: "male",
        region: "Addis Ababa",
        city: "Addis Ababa",
        language: "am",
        dob: "1988-03-14",
        passwordHash: superAdminPasswordHash,
      },
      {
        email: "mekonnen.admin@ethio-wellness.org",
        name: "Mekonnen Birhanu",
        role: "admin",
        phone: "+251912345678",
        gender: "male",
        region: "Amhara",
        city: "Bahir Dar",
        language: "am",
        dob: "1985-07-22",
      },
      {
        email: "frehiwot.editor@ethio-wellness.org",
        name: "Frehiwot Shenkut",
        role: "editor",
        phone: "+251913456789",
        gender: "female",
        region: "Oromia",
        city: "Adama",
        language: "om",
        dob: "1992-11-05",
      },
      {
        email: "yemane.reviewer@ethio-wellness.org",
        name: "Dr. Yemane Tesfaye",
        role: "reviewer",
        phone: "+251914567890",
        gender: "male",
        region: "Tigray",
        city: "Mekelle",
        language: "ti",
        dob: "1980-09-18",
      },
      {
        email: "dr.dawit@ethio-wellness.org",
        name: "Dr. Dawit Alemu",
        role: "practitioner",
        phone: "+251915678901",
        gender: "male",
        region: "Addis Ababa",
        city: "Addis Ababa",
        language: "en",
        dob: "1982-01-30",
      },
      {
        email: "hailu.premium@ethio-wellness.org",
        name: "Hailu Tadesse",
        role: "premium",
        phone: "+251916789012",
        gender: "male",
        region: "Sidama",
        city: "Hawassa",
        language: "en",
        dob: "1995-04-12",
      },
      {
        email: "almaz.bekele@ethio-wellness.org",
        name: "Almaz Bekele",
        role: "user",
        phone: "+251917890123",
        gender: "female",
        region: "Addis Ababa",
        city: "Addis Ababa",
        language: "am",
        dob: "1992-04-18",
      },
      {
        email: "birhanu.analyst@ethio-wellness.org",
        name: "Birhanu Kassa",
        role: "analyst",
        phone: "+251918901234",
        gender: "male",
        region: "Somali",
        city: "Jijiga",
        language: "so",
        dob: "1991-08-25",
      },
    ];

    // Migrate legacy superadmin user if it exists to avoid phone unique constraint conflict
    await client.query(
      `UPDATE users 
       SET email = 'abebetadesse1@gmail.com', name = 'Abebe Tadesse' 
       WHERE email = 'superadmin@ethio-wellness.org' 
         AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'abebetadesse1@gmail.com');`
    );
    await client.query(
      `DELETE FROM users WHERE email = 'superadmin@ethio-wellness.org';`
    );

    for (const u of demoUsers) {
      const roleId = roleMap[u.role];
      const pwHash = (u as any).passwordHash ?? defaultPasswordHash;
      await client.query(
        `INSERT INTO users (
           email, name, password_hash, role, role_id, phone, gender,
           region, city, preferred_language, date_of_birth, is_verified, is_active, login_count
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE, TRUE, 12)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           role_id = EXCLUDED.role_id,
           phone = EXCLUDED.phone,
           preferred_language = EXCLUDED.preferred_language,
           is_verified = TRUE,
           is_active = TRUE,
           updated_at = NOW();`,
        [
          u.email,
          u.name,
          pwHash,
          u.role,
          roleId,
          u.phone,
          u.gender,
          u.region,
          u.city,
          u.language,
          u.dob,
        ]
      );
    }
    console.log(`✅ Seeded ${demoUsers.length} enterprise persona demo accounts.`);

    // 4. Seed Initial User Activities & Audit Logs if empty
    const { rows: auditCount } = await client.query("SELECT COUNT(*) FROM audit_log;");
    if (parseInt(auditCount[0].count, 10) === 0 || parseInt(auditCount[0].count, 10) < 5) {
      const { rows: superAdminRow } = await client.query("SELECT id FROM users WHERE role = 'super_admin' LIMIT 1;");
      const adminId = superAdminRow[0]?.id;

      if (adminId) {
        await client.query(
          `INSERT INTO audit_log (user_id, event_type, action, resource_type, resource_id, details, payload, ip_address)
           VALUES 
             ($1, 'system_initialized', 'system_initialize', 'system', 'root', '{"version": "3.0.0"}'::jsonb, '{"version": "3.0.0"}'::jsonb, '127.0.0.1'),
             ($1, 'role_created', 'role_create', 'role', 'super_admin', '{"role": "super_admin"}'::jsonb, '{"role": "super_admin"}'::jsonb, '127.0.0.1'),
             ($1, 'user_registered', 'user_register', 'user', 'demo', '{"count": 8}'::jsonb, '{"count": 8}'::jsonb, '127.0.0.1'),
             ($1, 'security_policy_updated', 'policy_update', 'security', 'lockout', '{"maxAttempts": 5, "durationMin": 15}'::jsonb, '{}'::jsonb, '127.0.0.1');`,
          [adminId]
        );

        await client.query(
          `INSERT INTO user_activities (user_id, activity_type, description, metadata)
           VALUES 
             ($1, 'login', 'Logged in successfully from web browser', '{"device": "Desktop Chrome", "ip": "127.0.0.1"}'::jsonb),
             ($1, 'role_audit', 'Reviewed enterprise role permissions matrix', '{"reviewedRoles": 8}'::jsonb),
             ($1, 'system_health', 'Conducted platform security verification', '{"status": "optimal"}'::jsonb);`,
          [adminId]
        );

        await client.query(
          `INSERT INTO login_history (user_id, email, ip_address, user_agent, status, failure_reason)
           VALUES 
             ($1, 'abebetadesse1@gmail.com', '127.0.0.1', 'Mozilla/5.0 Chrome/130', 'success', NULL),
             ($1, 'abebetadesse1@gmail.com', '127.0.0.1', 'Mozilla/5.0 Safari/605', 'success', NULL);`,
          [adminId]
        );
      }
    }

    console.log("🌟 Enterprise auth migration & seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error during migrateAndSeedAuth:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Direct execution support
const isMain = Boolean(
  process.argv[1] &&
    (process.argv[1].includes("migrateAndSeedAuth") ||
      import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/")))
);

if (isMain) {
  migrateAndSeedAuth()
    .then(() => {
      console.log("Migration script finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
