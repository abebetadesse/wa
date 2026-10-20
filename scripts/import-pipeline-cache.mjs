/**
 * Moves the professional-review pipeline's old file storage into MySQL, once:
 *
 *   .cases_cache/pipeline/{profiles,analyses,cases,reports}/*.json
 *   .cases_cache/events/*.jsonl
 *
 *   npm run db:import-pipeline-cache                      import from ./.cases_cache
 *   npm run db:import-pipeline-cache -- --dir /some/.cases_cache
 *   npm run db:import-pipeline-cache -- --dry-run         count what would be imported
 *
 * Run it after `npm run db:migrate`. Safe to repeat: records already in the database are skipped,
 * never overwritten. Medication, allergy and condition lists are encrypted on the way in
 * (DATA_ENCRYPTION_KEY). The files are left in place; remove them once the counts look right.
 * .cases_cache/spiritual belongs to another feature and is not touched.
 */
import "../src/lib/db/loadEnv.ts";
import path from "node:path";
import { dbClient } from "../src/lib/db/index.ts";
import { dbPipelineStore } from "../src/lib/pipeline/store.ts";
import { importPipelineCache } from "../src/lib/pipeline/importCache.ts";

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const cacheDir = path.resolve(option("--dir") ?? path.join(process.cwd(), ".cases_cache"));
  const dryRun = process.argv.includes("--dry-run");
  console.log(`${dryRun ? "Checking" : "Importing"} ${cacheDir}`);
  const summary = await importPipelineCache({ cacheDir, store: dbPipelineStore, dryRun });
  let failed = 0;
  for (const [kind, counts] of Object.entries(summary)) {
    console.log(`${kind}: ${counts.imported} ${dryRun ? "to import" : "imported"}, ${counts.skipped} already present, ${counts.failed} failed`);
    failed += counts.failed;
  }
  if (failed) {
    console.error(`${failed} record(s) could not be imported; see the messages above. Fix them and run the import again.`);
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => dbClient.end({ timeout: 2 }));
