/**
 * Verification tests for the enhanced marketplace search engine:
 * multi-token matching, cross-entity search (businesses, services, remedies, categories),
 * price filtering, sorting, relevance ranking, and autocomplete suggestions.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { eq, inArray } from "drizzle-orm";

const { db, dbClient } = await import("../lib/db/index.ts");
const schema = await import("../lib/db/schema/index.ts");
const businessesSvc = await import("../server/marketplace/businesses.ts");
const catalogue = await import("../server/marketplace/catalogue.ts");

let available = true;
try {
  await dbClient`select 1`;
} catch {
  available = false;
}

const run = crypto.randomBytes(4).toString("hex");
const created = { users: [], businesses: [] };
const person = (role = "user") => ({
  id: crypto.randomUUID(),
  email: `search-${run}-${crypto.randomBytes(3).toString("hex")}@example.test`,
  name: `Search Tester ${run}`,
  role,
  permissions: [],
  phone: null,
});

let owner, admin, businessA, businessB, categoryHealing;

before(async () => {
  if (!available) return;
  owner = person("owner");
  admin = { ...person("admin"), role: "admin" };
  for (const user of [owner, admin]) {
    await db.insert(schema.users).values({ id: user.id, email: user.email, name: user.name, role: user.role });
    created.users.push(user.id);
  }

  const [category] = await catalogue.listCategories();
  categoryHealing = category;

  // Create Business A in Addis Ababa offering "Awde Negest Celestial Reading"
  businessA = await businessesSvc.createBusiness(owner, {
    categoryId: category.id,
    name: `Alpha Debtera Center ${run}`,
    nameAm: "አልፋ ደብተራ ማዕከል",
    tagline: "Sacred astrological and manuscript wisdom",
    region: "Addis Ababa",
    city: "Addis Ababa",
    languages: ["am", "en"],
    deliveryModes: ["in_person", "video"],
  });
  created.businesses.push(businessA.id);

  // Create Business B in Gondar offering "Traditional Bone Alignment"
  businessB = await businessesSvc.createBusiness(owner, {
    categoryId: category.id,
    name: `Gondar Healing Arts ${run}`,
    nameAm: "ጎንደር ፈውስ ጥበብ",
    tagline: "Orthopaedic traditional alignment and herbal remedies",
    region: "Amhara",
    city: "Gondar",
    languages: ["am"],
    deliveryModes: ["in_person"],
  });
  created.businesses.push(businessB.id);

  // Add services
  const kinds = await catalogue.listServiceKinds();
  const kind = kinds[0];

  await catalogue.saveService(owner, businessA.id, null, {
    kindId: kind.id,
    name: `Awde Negest Celestial Charting ${run}`,
    durationMinutes: 45,
    priceEtb: 650,
    deliveryModes: ["video"],
    bufferMinutes: 0,
    isActive: true,
    sortOrder: 0,
  });

  await catalogue.saveService(owner, businessB.id, null, {
    kindId: kind.id,
    name: `Traditional Bone Alignment ${run}`,
    durationMinutes: 60,
    priceEtb: 300,
    deliveryModes: ["in_person"],
    bufferMinutes: 0,
    isActive: true,
    sortOrder: 0,
  });

  // Verify both businesses
  await businessesSvc.submitForVerification(owner, businessA.id, { credentials: [{ label: "Astrology verification" }] });
  await businessesSvc.decideVerification(admin, businessA.id, "verified", "Approved");

  await businessesSvc.submitForVerification(owner, businessB.id, { credentials: [{ label: "Bone setter lineage" }] });
  await businessesSvc.decideVerification(admin, businessB.id, "verified", "Approved");
});

after(async () => {
  if (!available) return;
  if (created.businesses.length) {
    const ids = created.businesses;
    await db.delete(schema.services).where(inArray(schema.services.businessId, ids));
    await db.delete(schema.businesses).where(inArray(schema.businesses.id, ids));
  }
  await db.delete(schema.users).where(inArray(schema.users.id, created.users));
  await dbClient.end({ timeout: 2 });
});

const skip = () => !available && "database unavailable";

test("search engine finds businesses by business name (English & Amharic)", { skip: skip() }, async () => {
  const byEnglish = await businessesSvc.searchDirectory({ q: `Alpha Debtera ${run}` });
  assert.ok(byEnglish.total >= 1);
  assert.equal(byEnglish.businesses[0].id, businessA.id);

  const byAmharic = await businessesSvc.searchDirectory({ q: "አልፋ ደብተራ" });
  assert.ok(byAmharic.businesses.some((b) => b.id === businessA.id));
});

test("search engine finds businesses by offered service name (cross-entity service search)", { skip: skip() }, async () => {
  // Business A is named "Alpha Debtera Center", but offers "Awde Negest Celestial Charting"
  const found = await businessesSvc.searchDirectory({ q: `Celestial Charting ${run}` });
  assert.ok(found.total >= 1);
  const match = found.businesses.find((b) => b.id === businessA.id);
  assert.ok(match, "Business A is found when searching for its service name");
  assert.ok(match.matchingServices.some((s) => s.includes("Celestial Charting")), "matchingServices returns the matched service");

  // Search "Bone Alignment"
  const foundB = await businessesSvc.searchDirectory({ q: `Bone Alignment ${run}` });
  assert.ok(foundB.businesses.some((b) => b.id === businessB.id));
});

test("search engine supports multi-token search across different fields (e.g. name + city)", { skip: skip() }, async () => {
  // "Alpha Addis" -> "Alpha" in name, "Addis" in city
  const found = await businessesSvc.searchDirectory({ q: `Alpha Addis ${run}` });
  assert.ok(found.businesses.some((b) => b.id === businessA.id));

  // "Bone Gondar" -> "Bone" in service name, "Gondar" in city
  const foundGondar = await businessesSvc.searchDirectory({ q: `Bone Gondar ${run}` });
  assert.ok(foundGondar.businesses.some((b) => b.id === businessB.id));
});

test("search engine filters by price range (minPrice & maxPrice)", { skip: skip() }, async () => {
  // Business B service is 300 ETB, Business A is 650 ETB
  const cheapOnly = await businessesSvc.searchDirectory({ q: run, maxPrice: 400 });
  assert.ok(cheapOnly.businesses.some((b) => b.id === businessB.id));
  assert.ok(!cheapOnly.businesses.some((b) => b.id === businessA.id));

  const expensiveOnly = await businessesSvc.searchDirectory({ q: run, minPrice: 500 });
  assert.ok(expensiveOnly.businesses.some((b) => b.id === businessA.id));
  assert.ok(!expensiveOnly.businesses.some((b) => b.id === businessB.id));
});

test("search engine sorts by price_asc and price_desc", { skip: skip() }, async () => {
  const ascResults = await businessesSvc.searchDirectory({ q: run, sort: "price_asc" });
  const descResults = await businessesSvc.searchDirectory({ q: run, sort: "price_desc" });

  assert.ok(ascResults.total >= 2);
  const ascPrices = ascResults.businesses.filter((b) => [businessA.id, businessB.id].includes(b.id)).map((b) => Number(b.fromPriceEtb));
  assert.equal(ascPrices[0], 300);
  assert.equal(ascPrices[1], 650);

  const descPrices = descResults.businesses.filter((b) => [businessA.id, businessB.id].includes(b.id)).map((b) => Number(b.fromPriceEtb));
  assert.equal(descPrices[0], 650);
  assert.equal(descPrices[1], 300);
});

test("searchSuggestions returns autocomplete suggestions for prefix and popular when empty", { skip: skip() }, async () => {
  // Empty query returns popular suggestions
  const empty = await businessesSvc.searchSuggestions("");
  assert.ok(empty.popular.length > 0, "Popular suggestions returned when query is empty");

  // Prefix query returns matching businesses and services
  const query = await businessesSvc.searchSuggestions(`Alpha Debtera ${run}`);
  assert.ok(query.businesses.some((b) => b.id === businessA.id));

  const serviceQuery = await businessesSvc.searchSuggestions(`Celestial ${run}`);
  assert.ok(serviceQuery.services.some((s) => s.businessSlug === businessA.slug));
});
