import { dbClient } from "./index";
import { migrateAndSeedAuth } from "./migrateAndSeedAuth";

migrateAndSeedAuth()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => dbClient.end({ timeout: 2 }));
