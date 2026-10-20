/**
 * One way to start a case: the older entry points redirect to the expert-reviewed workflows, no
 * in-app link points at a redirected page, and the home page offers every care pathway.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { CASE_ENTRY_REDIRECTS } from "../../next.config.ts";
import { DOMAIN_CONFIGS } from "../server/cases/domains/index.ts";
import { WORKFLOW_DOMAINS } from "../server/cases/types.ts";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC = path.join(ROOT, "src");

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "tests" ? [] : sourceFiles(full);
    return /\.(tsx?|mjs)$/.test(entry.name) ? [full] : [];
  });
}

test("older case entry points redirect to the workflow for the same pathway", () => {
  const bySource = Object.fromEntries(CASE_ENTRY_REDIRECTS.map((rule) => [rule.source, rule]));
  assert.equal(bySource["/case-pipeline"].destination, "/case/workflows");
  assert.equal(bySource["/inquiry"].destination, "/case/workflows");
  assert.equal(bySource["/case/career"].destination, "/case/workflows/new/career");
  assert.equal(bySource["/case/career/:path*"].destination, "/case/workflows/new/career");
  assert.equal(bySource["/case/legal/intake"].destination, "/case/workflows/new/legal");
  assert.equal(bySource["/case/spiritual/intake/step-1"].destination, "/case/workflows/new/spiritual");
  assert.deepEqual(bySource["/case/spiritual/intake/step-2"].missing, [{ type: "query", key: "caseId" }], "a spiritual case already in progress keeps its step-2 page");
  for (const rule of CASE_ENTRY_REDIRECTS) {
    const domain = rule.destination.match(/^\/case\/workflows\/new\/([a-z]+)$/)?.[1];
    assert.ok(rule.destination === "/case/workflows" || WORKFLOW_DOMAINS.includes(domain), rule.destination);
  }
  assert.ok(fs.existsSync(path.join(SRC, "app/case/workflows/new/[domain]/page.tsx")));
});

test("the redirected pages and their unused routes are gone", () => {
  for (const gone of [
    "app/case-pipeline",
    "app/inquiry",
    "app/case/career",
    "app/case/legal/intake",
    "app/case/spiritual/intake/step-1",
    "app/api/case/career",
    "app/api/case/evaluate",
    "app/api/inquiry",
  ]) {
    assert.equal(fs.existsSync(path.join(SRC, gone)), false, gone);
  }
  assert.ok(fs.existsSync(path.join(SRC, "app/case/spiritual/intake/step-2/page.tsx")), "step 2 stays for cases in progress");
});

test("no in-app link points at a redirected page", () => {
  const redirected = /["'`](\/case-pipeline|\/inquiry|\/case\/career(?:\/intake)?|\/case\/legal\/intake|\/case\/spiritual\/intake(?:\/step-1)?)["'`?]/;
  const offenders = sourceFiles(SRC)
    .filter((file) => !file.endsWith(`${path.sep}middleware.ts`))
    .filter((file) => redirected.test(fs.readFileSync(file, "utf8")))
    .map((file) => path.relative(ROOT, file));
  assert.deepEqual(offenders, []);
});

test("the home page offers every care pathway with its current name", () => {
  const home = fs.readFileSync(path.join(SRC, "components/home/HomePageContent.tsx"), "utf8");
  const listed = Object.fromEntries([...home.matchAll(/\{ domain: "([a-z]+)", label: "([^"]+)"/g)].map((match) => [match[1], match[2]]));
  assert.deepEqual(Object.keys(listed).sort(), [...WORKFLOW_DOMAINS].sort());
  for (const domain of WORKFLOW_DOMAINS) assert.equal(listed[domain], DOMAIN_CONFIGS[domain].label, domain);
  assert.match(home, /href=\{`\/case\/workflows\/new\/\$\{pathway\.domain\}`\}/);
});
