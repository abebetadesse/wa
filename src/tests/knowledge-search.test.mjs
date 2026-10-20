/**
 * Database full-text search (src/lib/knowledge/search.ts), the stored literature that replaced live
 * PubMed calls in the knowledge routes, and admin-only knowledge loading. The database part runs
 * when DATABASE_URL reaches a migrated MySQL (0007_fulltext.sql applied) and is skipped otherwise.
 */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { attachStoredLiterature, fullTextQuery, searchKnowledgeItems, searchKnowledgeStore, searchLiterature } from "../lib/knowledge/search.ts";
import { storeKnowledgeDocument } from "../lib/knowledge/catalog.ts";
import { checkAccess } from "../lib/api/route.ts";

const SRC = path.resolve(import.meta.dirname, "..");

test("search: the query sent to MATCH holds only letters, digits and spaces", () => {
  assert.equal(fullTextQuery('  khat +"chewing" -sleep* (ወባ)  '), "khat chewing sleep ወባ");
  assert.equal(fullTextQuery("x".repeat(400)).length, 300);
  assert.equal(fullTextQuery("+-*()"), "");
});

test("search: published database items first, the in-memory catalogue when the database has none or is down", async () => {
  storeKnowledgeDocument({
    strand: "addiction",
    version: "1.0.0",
    categories: [{ id: "substances", name: "Substances", description: "Common substances", data: [{ name: "Khat", description: "Stimulant leaf" }] }],
  });
  const fromDb = [{ strand: "addiction", category: "c1", category_name: "Substances", relevanceScore: 2.1, name: "KHAT (db)" }];
  const db = await searchKnowledgeStore("khat", ["addiction"], { fullText: async () => fromDb });
  assert.deepEqual(db, { engine: "fulltext", results: fromDb });

  const empty = await searchKnowledgeStore("khat", ["addiction"], { fullText: async () => [] });
  assert.equal(empty.engine, "memory");
  assert.equal(empty.results[0].name, "Khat");

  const down = await searchKnowledgeStore("khat", ["addiction"], { fullText: async () => { throw new Error("ECONNREFUSED"); } });
  assert.equal(down.engine, "memory");
  assert.equal(down.results[0].name, "Khat");
});

test("stored literature: findings get stored records, and an outage costs one attempt, never a live call", async () => {
  const finding = (name, relevanceScore) => ({ type: "condition", strand: "epidemiological", name, description: "", relevanceScore });
  const findings = { epidemiological: [finding("Malaria", 0.9), ...Array.from({ length: 7 }, (_, index) => finding(`Other ${index}`, 0.1))] };
  const asked = [];
  const search = async (query, options) => {
    asked.push({ query: query.trim(), ...options });
    return query.startsWith("Malaria") ? [{ id: "1", pmid: "31234567", title: "Malaria in the lowlands", source: "pubmed", strand: "epidemiological", relevanceScore: 0.8, keywords: [], extractedData: {}, score: 1 }] : [];
  };
  const enriched = await attachStoredLiterature(findings, { search });
  assert.equal(asked.length, 5, "only the strongest findings of a strand are looked up");
  assert.deepEqual(asked[0], { query: "Malaria", strand: "epidemiological", limit: 3 });
  assert.deepEqual(enriched.epidemiological[0].pubmedEvidence, [{ pmid: "31234567", doi: undefined, title: "Malaria in the lowlands", journal: undefined, pubDate: undefined, abstract: undefined, source: "pubmed", url: "https://pubmed.ncbi.nlm.nih.gov/31234567/" }]);
  assert.deepEqual(enriched.epidemiological.at(-1).pubmedEvidence, []);

  let attempts = 0;
  const down = await attachStoredLiterature(findings, { search: async () => { attempts++; throw new Error("ECONNREFUSED"); } });
  assert.equal(attempts, 1);
  assert.ok(down.epidemiological.every((entry) => Array.isArray(entry.pubmedEvidence) && entry.pubmedEvidence.length === 0));
});

test("knowledge routes read stored literature; live PubMed is left to the sync path", () => {
  for (const route of ["causal", "intersections", "retrieve", "strand/[strand]"]) {
    const source = fs.readFileSync(path.join(SRC, "app/api/knowledge", route, "route.ts"), "utf8");
    assert.doesNotMatch(source, /pubmedEnrichment|PubMedSource/, route);
    assert.match(source, /attachStoredLiterature/, route);
  }
  const fetcher = fs.readFileSync(path.join(SRC, "lib/literature/literatureFetcher.ts"), "utf8");
  assert.doesNotMatch(fetcher, /NULLS LAST/i, "MySQL has no NULLS LAST");
});

test("knowledge loading is for administrators only", async () => {
  const routes = {
    load: (await import("../app/api/knowledge/load/route.ts")).POST,
    "load-batch": (await import("../app/api/knowledge/load-batch/route.ts")).POST,
    reload: (await import("../app/api/knowledge/reload/route.ts")).POST,
  };
  const body = JSON.stringify({ strand: "addiction", version: "9.9.9", categories: [] });
  const call = (name) =>
    routes[name](new NextRequest(`http://localhost/api/knowledge/${name}`, { method: "POST", headers: { "Content-Type": "application/json" }, body }), { params: Promise.resolve({}) });

  for (const name of Object.keys(routes)) {
    assert.equal((await call(name)).status, 401, `${name} without sign-in`);
    const source = fs.readFileSync(path.join(SRC, "app/api/knowledge", name, "route.ts"), "utf8");
    assert.match(source, /access: \{ roles: \["admin", "super_admin"\] \}/, `${name} admits administrators only`);
  }
  assert.throws(() => checkAccess({ roles: ["admin", "super_admin"] }, { id: "u1", role: "user", permissions: [] }), /Insufficient permissions/);
});

// ── Against a migrated database ──────────────────────────────────────────────

const token = `zq${Date.now().toString(36)}`;
let database = null;
/** Probed once, by the first database test: a reachable MySQL with 0007_fulltext.sql applied. */
const reachable = (async () => {
  try {
    await searchLiterature("probe", { limit: 1 });
    await searchKnowledgeItems("probe", ["addiction"], 1);
    database = await import("../lib/db/index.ts");
    return true;
  } catch {
    return false;
  }
})();
const needsDatabase = async (t) => {
  if (await reachable) return true;
  t.skip("needs a MySQL database with 0007_fulltext.sql applied");
  return false;
};

/** Rows this file added, removed afterwards; the database may be shared with real data. */
const created = { categoryId: null, strandId: null };

after(async () => {
  if (!database) return;
  const { db } = database;
  const schema = await import("../lib/db/schema/index.ts");
  const { eq, like } = await import("drizzle-orm");
  await db.delete(schema.literatureFindings).where(like(schema.literatureFindings.title, `%${token}%`));
  // Items go with their category (ON DELETE CASCADE).
  if (created.categoryId) await db.delete(schema.knowledgeCategories).where(eq(schema.knowledgeCategories.id, created.categoryId));
  if (created.strandId) await db.delete(schema.knowledgeStrands).where(eq(schema.knowledgeStrands.id, created.strandId));
});

test("database: literature is matched on title and abstract, Amharic included, best match first", async (t) => {
  if (!(await needsDatabase(t))) return;
  const { db } = database;
  const { literatureFindings } = await import("../lib/db/schema/index.ts");
  await db.insert(literatureFindings).values([
    { id: crypto.randomUUID(), pmid: "111", title: `Malaria fever survey ${token}`, abstract: "Plasmodium in the lowlands", source: "pubmed", strand: "epidemiological", relevanceScore: 0.4, citationCount: null },
    { id: crypto.randomUUID(), pmid: "222", title: `Fever clinics ${token}`, abstract: "Outpatient records", source: "pubmed", strand: "epidemiological", relevanceScore: 0.9, citationCount: 5 },
    { id: crypto.randomUUID(), pmid: "333", title: `የወባ በሽታ ${token}`, abstract: "ወባ በኢትዮጵያ", source: "europepmc", strand: "epidemiological", relevanceScore: 0.5 },
  ]);
  const hits = await searchLiterature(`malaria fever ${token}`, { strand: "epidemiological" });
  assert.equal(hits[0].pmid, "111");
  assert.ok(hits.some((hit) => hit.pmid === "222"));
  assert.ok((await searchLiterature(`ወባ ${token}`)).some((hit) => hit.pmid === "333"));

  const { getLiteratureForStrand } = await import("../lib/literature/literatureFetcher.ts");
  assert.ok((await getLiteratureForStrand("epidemiological", ["malaria", token])).some((hit) => hit.pmid === "111"), "the strand lookup works on MySQL");
});

test("database: only published knowledge items are found", async (t) => {
  if (!(await needsDatabase(t))) return;
  const { db } = database;
  const { knowledgeCategories, knowledgeItems, knowledgeStrands } = await import("../lib/db/schema/index.ts");
  const { sql } = await import("drizzle-orm");
  const [existing] = await db.select({ id: knowledgeStrands.id }).from(knowledgeStrands).where(sql`LOWER(${knowledgeStrands.name}) = 'addiction'`).limit(1);
  const strandId = existing?.id ?? crypto.randomUUID();
  if (!existing) {
    await db.insert(knowledgeStrands).values({ id: strandId, name: "addiction" });
    created.strandId = strandId;
  }
  created.categoryId = crypto.randomUUID();
  await db.insert(knowledgeCategories).values({ id: created.categoryId, strandId, name: `Substances ${token}` });
  await db.insert(knowledgeItems).values([
    { id: crypto.randomUUID(), categoryId: created.categoryId, data: { name: `Khat ${token}`, description: "Stimulant leaf" }, status: "published" },
    { id: crypto.randomUUID(), categoryId: created.categoryId, data: { name: `Areke ${token}` }, status: "draft" },
  ]);
  const found = await searchKnowledgeItems(token, ["addiction"]);
  assert.deepEqual(found.map((item) => item.name), [`Khat ${token}`]);
  assert.equal(found[0].strand, "addiction");
  assert.equal(found[0].category_name, `Substances ${token}`);
  assert.deepEqual(await searchKnowledgeItems(token, ["dietary"]), [], "other strands are not searched");
  assert.equal((await searchKnowledgeStore(token, ["addiction"])).engine, "fulltext");
});
