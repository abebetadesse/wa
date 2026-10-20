/**
 * Keeps the JavaScript a phone downloads in check after `next build`.
 *
 *   node scripts/bundle-budget.mjs            compare the build in .next with scripts/bundle-budget.json
 *   node scripts/bundle-budget.mjs --write    record the current build as the new budget
 *   NEXT_DIST_DIR=.next-verify node scripts/bundle-budget.mjs
 *
 * Measured gzipped, as served:
 *   shared   the scripts every page loads (framework, root layout)
 *   largest  the heaviest single page (shared + its own scripts)
 * The check fails when either grows more than 5% over the budget. Lowering the budget after an
 * improvement is a deliberate step (--write), so a later change cannot quietly take the gain back.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const dist = path.join(root, process.env.NEXT_DIST_DIR || ".next");
const budgetFile = path.join(root, "scripts", "bundle-budget.json");
const TOLERANCE = 0.05;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const sizes = new Map();
function gzipKb(chunk) {
  if (!sizes.has(chunk)) {
    const file = path.join(dist, chunk);
    sizes.set(chunk, fs.existsSync(file) ? zlib.gzipSync(fs.readFileSync(file)).length / 1024 : 0);
  }
  return sizes.get(chunk);
}
const total = (chunks) => [...new Set(chunks)].filter((chunk) => chunk.endsWith(".js")).reduce((sum, chunk) => sum + gzipKb(chunk), 0);

function measure() {
  const build = readJson(path.join(dist, "build-manifest.json"));
  const app = readJson(path.join(dist, "app-build-manifest.json")).pages;
  const sharedChunks = [...(build.rootMainFiles ?? []), ...(build.polyfillFiles ?? []), ...(app["/layout"] ?? [])];
  const shared = total(sharedChunks);
  const routes = Object.entries(app)
    .filter(([route]) => route.endsWith("/page"))
    .map(([route, chunks]) => ({ route: route.replace(/\/page$/, "") || "/", kb: total([...sharedChunks, ...chunks]) }))
    .sort((a, b) => b.kb - a.kb);
  return { shared, largest: routes[0] ?? { route: "-", kb: 0 }, routes };
}

const round = (kb) => Math.round(kb * 10) / 10;

if (!fs.existsSync(path.join(dist, "app-build-manifest.json"))) {
  console.error(`No build found in ${dist}. Run \`npm run build\` first.`);
  process.exit(1);
}
const current = measure();
console.log(`Shared JavaScript on every page: ${round(current.shared)} KB gzipped`);
console.log("Heaviest pages (shared + own, gzipped):");
for (const entry of current.routes.slice(0, 8)) console.log(`  ${String(round(entry.kb)).padStart(7)} KB  ${entry.route}`);

if (process.argv.includes("--write")) {
  fs.writeFileSync(budgetFile, `${JSON.stringify({ sharedGzipKb: round(current.shared), largestPageGzipKb: round(current.largest.kb) }, null, 2)}\n`);
  console.log(`Budget written to ${path.relative(root, budgetFile)}.`);
  process.exit(0);
}

const budget = readJson(budgetFile);
const failures = [];
if (current.shared > budget.sharedGzipKb * (1 + TOLERANCE)) failures.push(`shared JavaScript ${round(current.shared)} KB > budget ${budget.sharedGzipKb} KB`);
if (current.largest.kb > budget.largestPageGzipKb * (1 + TOLERANCE)) failures.push(`${current.largest.route} ${round(current.largest.kb)} KB > budget ${budget.largestPageGzipKb} KB`);
if (failures.length) {
  console.error(`Bundle budget exceeded (more than ${TOLERANCE * 100}% over):\n  ${failures.join("\n  ")}`);
  console.error("Load the new code lazily (next/dynamic) or keep data on the server. If the growth is intended, run with --write.");
  process.exit(1);
}
console.log("Within the bundle budget.");
