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
}
