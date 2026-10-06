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
import { setupReferenceData } from "./referenceData";

setupReferenceData()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => dbClient.end({ timeout: 2 }));
