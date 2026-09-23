import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { auditLog, roles, userActivities, users } from "./schema";
import { DEFAULT_ROLE_PERMISSIONS, type RoleName } from "./schema/rbac";
import { hashPassword } from "../auth";

const roleDefinitions: Array<{ name: RoleName; description: string }> = [
  ["super_admin", "Full system control with unrestricted permissions"],
  ["admin", "Platform administrator with user and content management privileges"],
  ["premium", "Paid subscriber with advanced workflows"],
  ["user", "Authenticated user with personal Welbeing workflow access"],
  ["editor", "Knowledge base content editor"],
  ["reviewer", "Content approver for knowledge and safety validation"],
  ["practitioner", "Verified Welbeing professional and herbal medicine consultant"],
  ["analyst", "Read-only analytics and audit inspector"],
].map(([name, description]) => ({ name: name as RoleName, description }));

const demoUsers = [
  ["abebetadesse1@gmail.com", "Abebe Tadesse", "super_admin", "am", "1988-03-14"],
  ["mekonnen.admin@ethio-wellness.org", "Mekonnen Birhanu", "admin", "am", "1985-07-22"],
  ["frehiwot.editor@ethio-wellness.org", "Frehiwot Shenkut", "editor", "om", "1992-11-05"],
  ["yemane.reviewer@ethio-wellness.org", "Dr. Yemane Tesfaye", "reviewer", "ti", "1980-09-18"],
  ["dr.dawit@ethio-wellness.org", "Dr. Dawit Alemu", "practitioner", "en", "1982-01-30"],
  ["hailu.premium@ethio-wellness.org", "Hailu Tadesse", "premium", "en", "1995-04-12"],
  ["almaz.bekele@ethio-wellness.org", "Almaz Bekele", "user", "am", "1992-04-18"],
  ["birhanu.analyst@ethio-wellness.org", "Birhanu Kassa", "analyst", "so", "1991-08-25"],
] as const;

export async function migrateAndSeedAuth() {
  await db.transaction(async (tx) => {
    const roleIds = new Map<string, string>();
    for (const role of roleDefinitions) {
      const id = randomUUID();
      roleIds.set(role.name, id);
      await tx.insert(roles).values({
        id,
        name: role.name,
        description: role.description,
        permissions: DEFAULT_ROLE_PERMISSIONS[role.name],
        isSystemRole: true,
        isActive: true,
      }).onDuplicateKeyUpdate({
        set: { description: role.description, permissions: DEFAULT_ROLE_PERMISSIONS[role.name], isActive: true },
      });
    }

    for (const [email, name, role, language, dateOfBirth] of demoUsers) {
      const userId = randomUUID();
      await tx.insert(users).values({
        id: userId,
        email,
        name,
        passwordHash: hashPassword(role === "super_admin" ? "Ninielda@&1" : "EthioWelbeing@2026!"),
        role,
        roleId: roleIds.get(role),
        preferredLanguage: language,
        dateOfBirth: new Date(dateOfBirth),
        isVerified: true,
        isActive: true,
        loginCount: 0,
      }).onDuplicateKeyUpdate({
        set: { name, role, roleId: roleIds.get(role), preferredLanguage: language, isVerified: true, isActive: true, updatedAt: new Date() },
      });
    }

    const [admin] = await tx.select({ id: users.id }).from(users).where(eq(users.role, "super_admin")).limit(1);
    if (admin) {
      await tx.insert(auditLog).values({
        id: randomUUID(),
        userId: admin.id,
        eventType: "system_initialized",
        action: "auth_seed_complete",
        resourceType: "system",
        payload: { roles: roleDefinitions.length, users: demoUsers.length },
      });
      await tx.insert(userActivities).values({
        id: randomUUID(),
        userId: admin.id,
        activityType: "system_Welbeing",
        description: "Completed MySQL auth and RBAC seed",
        metadata: { version: "4.0.0" },
      });
    }
  });
  console.log("MySQL auth and RBAC seed completed successfully.");
}

if (process.argv[1]?.includes("runAuthMigration")) {
  migrateAndSeedAuth().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
}
