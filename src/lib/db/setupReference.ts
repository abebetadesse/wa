/**
 * Reference data every installation needs, after the schema is in place (`npm run db:migrate`):
 * system roles, marketplace catalogues, the Ethiopian food-composition tables and the
 * herb–medicine safety reference.
 * Safe to repeat; it adds what is missing and never removes accounts, bookings or edits made by
 * knowledge editors.
 *
 *   npm run db:reference
 */
import "./loadEnv";
import { dbClient } from "./index";
import { seedRoles } from "./migrateAndSeedAuth";
import { runSeed } from "./seed";
import { seedMarketplaceCatalogues } from "./seedMarketplaceCatalogues";
import { ensureSafetySynced } from "@/server/safety";

async function main() {
  const roles = await seedRoles();
  console.log(`Roles ready (${roles.size}).`);
  const catalogues = await seedMarketplaceCatalogues();
  console.log(`Marketplace catalogues ready (${catalogues.categories} categories, ${catalogues.serviceKinds} service kinds).`);
  await runSeed();
  await ensureSafetySynced(true);
  console.log("Safety reference ready.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => dbClient.end({ timeout: 2 }));
