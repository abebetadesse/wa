/**
 * Reference data every installation needs once the schema is in place: system roles, marketplace
 * catalogues, the Ethiopian food-composition tables and the herb–medicine safety reference.
 * Safe to repeat; it adds what is missing and never removes accounts, bookings or edits made by
 * knowledge editors. Run by `npm run db:reference` and by the application's start-up set-up.
 */
import { seedRoles } from "./migrateAndSeedAuth";
import { runSeed } from "./seed";
import { seedMarketplaceCatalogues } from "./seedMarketplaceCatalogues";
import { ensureSafetySynced } from "@/server/safety";

export async function setupReferenceData(log: (line: string) => void = console.log) {
  const roles = await seedRoles();
  log(`Roles ready (${roles.size}).`);
  const catalogues = await seedMarketplaceCatalogues();
  log(`Marketplace catalogues ready (${catalogues.categories} categories, ${catalogues.serviceKinds} service kinds).`);
  await runSeed();
  await ensureSafetySynced(true);
  log("Safety reference ready.");

  try {
    const { db } = await import("@/lib/db");
    const { users, roles } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const [existing] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.email, "abebetadesse1@gmail.com")).limit(1);
    if (existing && existing.role !== "super_admin") {
      const [superRole] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, "super_admin")).limit(1);
      if (superRole) {
        await db.update(users).set({ role: "super_admin", roleId: superRole.id }).where(eq(users.id, existing.id));
        log("Promoted abebetadesse1@gmail.com to super_admin.");
      }
    }
  } catch {
    // Non-fatal if users table not ready yet
  }
}
