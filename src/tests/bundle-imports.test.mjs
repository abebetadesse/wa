/**
 * Low-bandwidth guards: the shared layout and the common form pages must not pull the large
 * reference catalogues or animation libraries into the browser, the light location facts stay in
 * step with the full data, and saves made offline are kept and sent later.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { ETHIOPIAN_PROFILED_LOCATION_COUNT, ETHIOPIAN_REGIONS, estimateAgroEcology } from "../lib/location/regions.ts";
import { getAllRegions } from "../lib/location/ethiopianPlacesSearch.ts";
import { ETHIOPIAN_LOCATIONS } from "../lib/location/ethiopiaLocations.ts";
import { clearQueued, flushOutbox, isQueued, queuePut } from "../lib/offline/outbox.ts";

const SRC = path.resolve(import.meta.dirname, "..");

const HEAVY = [
  "lib/location/ethiopianAdministrativePlaces.ts",
  "lib/location/ethiopiaLocations.ts",
  "lib/location/ethiopianPlacesSearch.ts",
  "lib/nutrition/efctDatabase.ts",
  "lib/nutrition/rawCerealMaterials.ts",
  "lib/nutrition/compositeDietsCatalog.ts",
  "lib/knowledge/traditionalMedicineDatabase.ts",
  "lib/christian/christianNameCatalog.ts",
  "components/cultural/HexacoreOrrery.tsx",
];
const HEAVY_PACKAGES = ["framer-motion", "echarts", "echarts-for-react"];

function resolveImport(from, spec) {
  const base = spec.startsWith("@/") ? path.join(SRC, spec.slice(2)) : spec.startsWith(".") ? path.resolve(path.dirname(from), spec) : null;
  if (!base) return null;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** Every module reached through static (non-type) imports, plus the packages it names. */
function staticGraph(entry) {
  const seen = new Set();
  const packages = new Set();
  const queue = [path.join(SRC, entry)];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file) || !/\.(tsx?|mjs)$/.test(file)) continue;
    seen.add(file);
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/^\s*(?:import|export)\s+(?!type\b)(?:[^'";]*?\sfrom\s+)?["']([^"']+)["']/gm)) {
      const spec = match[1];
      const resolved = resolveImport(file, spec);
      if (resolved) queue.push(resolved);
      else if (!spec.startsWith(".") && !spec.startsWith("@/")) packages.add(spec.split("/")[0].startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);
    }
  }
  return { files: [...seen].map((file) => path.relative(SRC, file).split(path.sep).join("/")), packages: [...packages] };
}

for (const entry of [
  "app/layout.tsx",
  "components/location/EthiopianLocationInput.tsx",
  "app/intake/page.tsx",
  "app/admin/users/page.tsx",
  "app/marketplace/Directory.tsx",
  "app/hexacore/page.tsx",
  "app/locations/LocationsClient.tsx",
]) {
  test(`${entry} does not load large catalogues or animation libraries`, () => {
    const { files, packages } = staticGraph(entry);
    assert.deepEqual(files.filter((file) => HEAVY.includes(file)), []);
    if (entry === "app/layout.tsx") assert.deepEqual(packages.filter((name) => HEAVY_PACKAGES.includes(name)), []);
  });
}

test("the light location facts match the full data", () => {
  assert.deepEqual([...ETHIOPIAN_REGIONS], getAllRegions());
  assert.equal(ETHIOPIAN_PROFILED_LOCATION_COUNT, ETHIOPIAN_LOCATIONS.length);
  assert.equal(estimateAgroEcology("Afar").zoneName, "Bereha (Desert)");
  assert.equal(estimateAgroEcology("Amhara", "North Wollo").altitudeMeters, 2500);
});

test("place suggestions come back small, with an altitude, and cacheable", async () => {
  const { GET } = await import("../app/api/locations/route.ts");
  const res = await GET(new NextRequest("http://localhost/api/locations?fields=places&limit=3&q=addis"));
  assert.equal(res.status, 200);
  assert.match(res.headers.get("Cache-Control") ?? "", /public/);
  const body = await res.json();
  assert.ok(body.data.length > 0 && body.data.length <= 3);
  assert.deepEqual(Object.keys(body.data[0]).sort(), ["altitudeMeters", "id", "region", "town", "zone"]);
  assert.equal(body.administrativePlaces, undefined, "the full response is not sent");
  assert.ok(JSON.stringify(body).length < 2000);
});

// ─── Offline outbox ──────────────────────────────────────────────────────────

function memoryStore() {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: (key) => data.delete(key) };
}

test("an offline save is kept, replaced by newer saves, and sent when back online", async () => {
  const store = memoryStore();
  queuePut("/api/session/s1/answers", { answers: { a: 1 } }, store, new Date(1));
  queuePut("/api/session/s1/answers", { answers: { a: 2 } }, store, new Date(2));
  assert.ok(isQueued("/api/session/s1/answers", store));

  const offline = await flushOutbox(async () => { throw new TypeError("Failed to fetch"); }, store);
  assert.deepEqual(offline, { sent: 0, remaining: 1 });

  const bodies = [];
  const online = await flushOutbox(async (url, init) => { bodies.push([url, init.method, JSON.parse(init.body)]); return { ok: true, status: 200 }; }, store);
  assert.deepEqual(online, { sent: 1, remaining: 0 });
  assert.deepEqual(bodies, [["/api/session/s1/answers", "PUT", { answers: { a: 2 } }]]);
});

test("server errors are retried later; refused saves are dropped", async () => {
  const store = memoryStore();
  queuePut("/a", { n: 1 }, store);
  queuePut("/b", { n: 2 }, store);
  const result = await flushOutbox(async (url) => (url === "/a" ? { ok: false, status: 503 } : { ok: false, status: 401 }), store);
  assert.deepEqual(result, { sent: 0, remaining: 1 });
  assert.ok(isQueued("/a", store));
  assert.ok(!isQueued("/b", store));
  clearQueued("/a", store);
  assert.ok(!isQueued("/a", store));
});

test("a save queued while sending is not lost", async () => {
  const store = memoryStore();
  queuePut("/a", { n: 1 }, store, new Date(1));
  const result = await flushOutbox(async () => {
    queuePut("/a", { n: 2 }, store, new Date(2));
    return { ok: true, status: 200 };
  }, store);
  assert.equal(result.remaining, 1);
  assert.ok(isQueued("/a", store));
});
