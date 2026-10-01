/**
 * Metsehafe Asmat: the table-of-contents catalogue (Domain B), practice-form cautions (Domain A),
 * the firewall between them, and the server composer that delivers a chapter as a solution.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ASMAT_CONTENTS, ASMAT_HEADINGS, asmatDropdownOptions, asmatPlantSlugs, asmatSourceNotes } from "../lib/cultural/metsehafeAsmatCatalog.ts";
import { ETHIOPIAN_MANUSCRIPT_INDEX } from "../lib/cultural/manuscriptIndex.ts";
import { practiceFormCautions } from "../lib/evaluation/practiceFormSafety.ts";
import { PRACTICE_FORMS } from "../lib/shared/practiceForms.ts";
import { composeManuscriptBlock, manuscriptCatalogue, manuscriptSelection, sourceForHeadingKey, SOLUTION_MAX_LENGTH } from "../server/intake/manuscripts.ts";
import { SEED_SUBSTANCES } from "../server/safety/seed.ts";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const importsOf = (file) => [...read(file).matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);

test("table of contents: 13 chapters with the pages printed on page 2", () => {
  assert.deepEqual(ASMAT_CONTENTS.map((e) => e.number), Array.from({ length: 13 }, (_, i) => i + 1));
  assert.deepEqual(ASMAT_CONTENTS.map((e) => e.page), [3, 5, 6, 7, 14, 16, 17, 18, 19, 20, 21, 22, 23]);
  for (const entry of ASMAT_CONTENTS) assert.ok(entry.endPage >= entry.page && entry.endPage <= 24, `${entry.number}: page range`);
  assert.equal(ASMAT_CONTENTS[0].titleGeez, "ስለ መፍትሔ ስራይ");
  assert.equal(ASMAT_CONTENTS[12].titleGeez, "ድርሳን በገቢር");
});

test("headings: one per chapter, screenable materials, valid forms, seals and sub-headings inside the chapter", () => {
  assert.equal(ASMAT_HEADINGS.length, 13);
  assert.deepEqual(ASMAT_HEADINGS.map((h) => h.chapter).sort((a, b) => a - b), ASMAT_CONTENTS.map((e) => e.number));
  assert.equal(new Set(ASMAT_HEADINGS.map((h) => h.key)).size, 13);
  const slugs = new Set(SEED_SUBSTANCES.map((s) => s.slug));
  const indexIds = new Set(ETHIOPIAN_MANUSCRIPT_INDEX.map((e) => e.id));
  for (const heading of ASMAT_HEADINGS) {
    assert.match(heading.key, /^asmat_[a-z_]+$/);
    assert.equal(sourceForHeadingKey(heading.key), "metsehafe_asmat");
    const chapter = ASMAT_CONTENTS.find((e) => e.number === heading.chapter);
    // Sub-headings can sit on the chapter's first page even when the contents list the next page.
    const first = Math.min(chapter.page, ...heading.subheadings.map((s) => s.page));
    for (const p of [...heading.sealPages, ...heading.subheadings.map((s) => s.page)]) assert.ok(p >= first - 1 && p <= chapter.endPage, `${heading.key}: page ${p}`);
    for (const slug of asmatPlantSlugs(heading)) assert.ok(slugs.has(slug), `${heading.key}: ${slug} missing from the safety matrix`);
    for (const form of heading.practiceForms) assert.ok(PRACTICE_FORMS.includes(form), form);
    for (const id of heading.indexEntryIds) assert.ok(indexIds.has(id), id);
    assert.ok(heading.practiceForms.includes("recited_prayer"));
  }
  assert.equal(asmatDropdownOptions().length, 13);
  assert.ok(asmatSourceNotes(ASMAT_HEADINGS.find((h) => h.key === "asmat_buda")).length >= 2, "contents entry plus the chapter's own entry");
});

test("ethics: harm-returning and love chapters carry their framing; risky practices carry danger cautions", () => {
  const h = (key) => ASMAT_HEADINGS.find((x) => x.key === key);
  assert.ok(h("asmat_medfe").ethics.includes("protective_only"));
  assert.ok(h("asmat_mesetefaqir").ethics.includes("consent_required"));
  assert.ok(h("asmat_mesetefaqir").practiceForms.includes("given_to_another_person"));
  for (const key of ["asmat_gebya", "asmat_habt", "asmat_timhirt", "asmat_girma"]) assert.ok(h(key).ethics.includes("no_outcome_promise"), key);
  for (const key of ["asmat_maesere", "asmat_mestme", "asmat_ayne_tila", "asmat_buda"]) assert.ok(h(key).ethics.includes("health_overlap"), key);

  const eyes = practiceFormCautions(h("asmat_ayne_tila").practiceForms);
  assert.equal(eyes[0].form, "applied_near_eyes");
  assert.equal(eyes[0].level, "danger");
  assert.match(eyes[0].en, /euphorbia/i);
  assert.match(practiceFormCautions(["fumigation"])[0].en, /sulfur/i);
  for (const form of PRACTICE_FORMS) assert.equal(practiceFormCautions([form]).length, 1, form);
});

test("firewall and copyright: modules stay in their domain; the catalogue holds no book text", () => {
  assert.ok(!importsOf("lib/evaluation/practiceFormSafety.ts").some((spec) => /cultural/.test(spec)));
  assert.ok(!importsOf("lib/cultural/metsehafeAsmatCatalog.ts").some((spec) => /(evaluation|safety|location|case-workflow|nutrition)/.test(spec)));
  assert.ok(!importsOf("lib/shared/practiceForms.ts").length, "the shared vocabulary imports nothing");
  const catalogue = read("lib/cultural/metsehafeAsmatCatalog.ts");
  // The opening invocation, the prayer formula and the procedure marker begin every chapter in the book.
  for (const phrase of ["በስመ አብ", "ጸሎት በእንተ", "ገቢሩ", "ለገብርከ"]) assert.ok(!catalogue.includes(phrase), `catalogue quotes "${phrase}"`);
});

test("composer: own text, reference, cautions and framing; safety survives a long text", () => {
  const selection = manuscriptSelection("metsehafe_asmat", "asmat_mesetefaqir");
  const block = composeManuscriptBlock(selection, { geezText: null, amharicText: "የባለሙያ ጽሑፍ", guidance: null }, { lead: "ሰላም" });
  assert.match(block, /^ሰላም/);
  assert.match(block, /መጽሐፈ አስማት · መስተፋቅር — ስለ መስተፋቅር \(ገጽ 21–22\)/);
  assert.match(block, /without their knowledge and agreement/);
  assert.match(block, /A prayer for blessing, not a promise/);

  const long = composeManuscriptBlock(selection, { geezText: "ሀ".repeat(9000), amharicText: null, guidance: null });
  assert.ok(long.length <= SOLUTION_MAX_LENGTH);
  assert.match(long, /…/);
  assert.match(long, /Given to another person/, "danger cautions are never cut");
  assert.match(long, /between people who both want it/);

  const essential = composeManuscriptBlock(selection, null, { essentialCautionsOnly: true });
  assert.doesNotMatch(essential, /Prayer recited:/, "informational cautions can be left out of rule messages");

  const fewus = composeManuscriptBlock(manuscriptSelection("metsehafe_fewus", "fewus_headache_migraine"), null);
  assert.match(fewus, /መጽሐፈ ፈውስ · .* \(ገጽ 78\)/);
  assert.equal(manuscriptSelection("metsehafe_asmat", "fewus_headache_migraine"), null);
  assert.equal(manuscriptCatalogue("metsehafe_asmat").headings.length, 13);
});
