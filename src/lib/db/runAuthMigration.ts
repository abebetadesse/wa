import { migrateAndSeedAuth } from "./migrateAndSeedAuth";

migrateAndSeedAuth()
  .then(() => {
    console.log("Migration and seed completed.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
