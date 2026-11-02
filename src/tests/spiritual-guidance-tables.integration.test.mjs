/**
 * The Spiritual Guidance reference tables against MySQL: default rows, editing, validation, CSV
 * round trips and the data the engines read. Skipped when the database is unreachable. Rows this
 * test adds use "zz-test" keys and are removed; a default row it edits is restored.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const { dbClient } = await import("../lib/db/index.ts");
let available = true;
try {
  await dbClient`select 1`;
} catch {
  available = false;
}
const skip = () => !available && "database unavailable";

const tables = await import("../server/guidance/tables.ts");
const { SERVICE_DEFAULTS, CALENDAR_DAY_DEFAULTS } = await import("../lib/spiritual-guidance/defaults.ts");

const testName = { nameGeez: "ዘዘ-ሙከራ", nameLatin: "zz-test-name" };
let originalShop = null;

before(async () => {
  if (!available) return;
  await tables.ensureGuidanceDefaults();
  originalShop = (await tables.listRows("services")).find((row) => row.slug === "shop_opening");
});

after(async () => {
  if (!available) return;
  await tables.deleteRow("names", testName);
  await tables.deleteRow("names", { nameGeez: "", nameLatin: "zz-test-csv" });
  await tables.deleteRow("calendar", { tradition: "public", entryKey: "zz-test-day" });
  await tables.deleteRow("hijri", { year: 1599, month: 9 });
  if (originalShop) await tables.saveRow("services", originalShop, originalShop.updatedBy ?? null);
});

test("Default rows are present and inserting them again changes nothing", { skip: skip() }, async () => {
  const services = await tables.listRows("services");
  for (const service of SERVICE_DEFAULTS) assert.ok(services.some((row) => row.slug === service.slug), service.slug);
  const calendar = await tables.listRows("calendar");
  assert.ok(calendar.length >= CALENDAR_DAY_DEFAULTS.length);
  const letters = await tables.listRows("letters");
  assert.ok(letters.some((row) => row.system === "awde_negest" && row.letter === "ሀ" && row.value === 1));
  // ሀ and ሁ are different letters: the letter column compares exactly.
  assert.ok(letters.some((row) => row.system === "awde_negest" && row.letter === "ሁ"));
  await tables.ensureGuidanceDefaults();
  assert.equal((await tables.listRows("calendar")).length, calendar.length);
});

test("An administrator's edit survives the default rows being written again", { skip: skip() }, async () => {
  const edited = { ...originalShop, weights: { awde_negest: 30, numerology: 20, moon: 20, astrology: 10, hexagram: 10, religion: 10 } };
  await tables.saveRow("services", edited, null);
  await tables.ensureGuidanceDefaults();
  const after = (await tables.listRows("services")).find((row) => row.slug === "shop_opening");
  assert.equal(after.weights.awde_negest, 30);
});

test("Rows are validated before they are saved", { skip: skip() }, async () => {
  await assert.rejects(
    tables.saveRow("services", { ...originalShop, weights: { moon: 50 } }, null),
    (error) => error instanceof tables.GuidanceRowError && /add up to 50/.test(error.message),
  );
  await assert.rejects(tables.saveRow("calendar", { tradition: "public", entryKey: "zz-test-day", kind: "holiday", anchor: "weekly", names: { en: "Test" } }, null), tables.GuidanceRowError);
  await assert.rejects(tables.saveRow("names", { gender: "male", languages: ["am"], religions: ["neutral"] }, null), /Ge'ez script, Latin script or both/);
});

test("Save, update and delete a name", { skip: skip() }, async () => {
  const saved = await tables.saveRow("names", { ...testName, gender: "female", languages: ["am"], religions: ["orthodox"], meanings: { en: "A test" } }, null);
  assert.equal(saved.gender, "female");
  const updated = await tables.saveRow("names", { ...testName, gender: "unisex", languages: ["am", "en"], religions: ["neutral"], meanings: { en: "Still a test" } }, null);
  assert.equal(updated.id, saved.id);
  assert.deepEqual(updated.languages, ["am", "en"]);
  assert.equal(await tables.deleteRow("names", testName), true);
  assert.equal(await tables.deleteRow("names", testName), false);
});

test("CSV export and import round-trip, with errors reported by line", { skip: skip() }, async () => {
  const csv = await tables.exportCsv("services");
  const lines = csv.split("\n");
  assert.equal(lines[0], "slug,names,descriptions,mode,weights,options,active,displayOrder");
  const dry = await tables.importCsv("services", csv, null, true);
  assert.deepEqual(dry.errors, []);
  assert.equal(dry.saved, 0);

  const names = [
    "nameGeez,nameLatin,gender,languages,religions,origin,meanings,feastDays,tags,source,active",
    ',zz-test-csv,male,"[""om""]","[""neutral""]",Oromo,"{""en"":""Test""}",,,test,true',
    ",zz-test-bad,robot,\"[\"\"om\"\"]\",\"[\"\"neutral\"\"]\",,,,,,",
  ].join("\n");
  const result = await tables.importCsv("names", names, null);
  assert.equal(result.saved, 1);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].line, 3);
  assert.match(result.errors[0].message, /gender/);
});

test("The engines read rules and announced Hijri months from the tables", { skip: skip() }, async () => {
  await tables.saveRow("hijri", { year: 1599, month: 9, startDate: "2175-01-01", note: "test" }, null);
  await tables.saveRow("calendar", { tradition: "public", entryKey: "zz-test-day", kind: "holiday", anchor: "fixed", calendar: "gregorian", month: 2, day: 30, names: { en: "Impossible day" }, effects: { officesClosed: true } }, null);
  const data = await tables.guidanceData();
  assert.ok(data.services.some((s) => s.slug === "wedding"));
  assert.ok(data.calendarRules.some((r) => r.tradition === "orthodox" && r.entryKey === "abiy-tsom" && r.lengthDays === 55));
  assert.ok(data.hijriOverrides.some((o) => o.year === 1599 && o.start === "2175-01-01"));
  assert.ok(data.letters.pythagorean.A.value === 1);
});
