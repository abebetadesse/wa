/**
 * Healer engines: Domain A/B firewall, Fewus catalogue, healer profile, urgency, ecological matrix,
 * biochemical analysis and the remedy orchestrator (with injected safety and literature).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { FEWUS_CONTENTS, FEWUS_HEADINGS, fewusBookReferences, fewusPlantSlugs } from "../lib/cultural/metsehafeFewusCatalog.ts";
import { calculateHealerProfile, formatHealerProfile } from "../lib/cultural/healerProfileCalculator.ts";
import { assessUrgency } from "../lib/evaluation/urgencyTriage.ts";
import { buildEcologicalMatrix, mineralRowsFor } from "../lib/location/ecologicalHealthMatrix.ts";
import { analyseBiochemistry } from "../lib/evaluation/biochemicalAnalysisEngine.ts";
import { detectCategories, orchestrateRemedies } from "../lib/case-workflow/remedyPharmacologyOrchestrator.ts";
import { resolveLocation } from "../lib/location/index.ts";
import { SEED_SUBSTANCES } from "../server/safety/seed.ts";

const root = path.resolve(import.meta.dirname, "..");
const importsOf = (file) => [...fs.readFileSync(path.join(root, file), "utf8").matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);

test("firewall: Domain A never imports Domain B, and Domain B never imports Domain A", () => {
  const domainA = ["lib/evaluation/urgencyTriage.ts", "lib/evaluation/biochemicalAnalysisEngine.ts", "lib/location/ecologicalHealthMatrix.ts", "lib/case-workflow/remedyPharmacologyOrchestrator.ts"];
  const domainB = ["lib/cultural/metsehafeFewusCatalog.ts", "lib/cultural/healerProfileCalculator.ts"];
  for (const file of domainA) assert.ok(!importsOf(file).some((spec) => /cultural/.test(spec)), `${file} imports a cultural module`);
  for (const file of domainB) assert.ok(!importsOf(file).some((spec) => /(evaluation|safety|location|case-workflow|nutrition)/.test(spec)), `${file} imports a scientific module`);
});

test("Fewus catalogue: 38 verified contents headings; intake headings point at real pages and screenable plants", () => {
  assert.equal(FEWUS_CONTENTS.length, 38);
  assert.deepEqual(FEWUS_CONTENTS.map((e) => e.number), Array.from({ length: 38 }, (_, i) => i + 1));
  assert.ok(FEWUS_CONTENTS.every((e, i) => i === 0 || e.page >= FEWUS_CONTENTS[i - 1].page), "page numbers ascend");
  assert.equal(FEWUS_CONTENTS.find((e) => e.number === 22).page, 78);
  const slugs = new Set(SEED_SUBSTANCES.map((s) => s.slug));
  for (const heading of FEWUS_HEADINGS) {
    for (const ref of fewusBookReferences(heading)) assert.ok(ref.page > 0);
    assert.equal(heading.bookMatch === "none", heading.bookSections.length === 0, heading.key);
    for (const slug of fewusPlantSlugs(heading)) assert.ok(slugs.has(slug), `${heading.key}: ${slug} missing from the safety matrix`);
  }
  const requested = ["fewus_digestive", "fewus_febrile_malaria", "fewus_respiratory", "fewus_dermatological", "fewus_headache_migraine", "fewus_rheumatic_joint"];
  for (const key of requested) assert.ok(FEWUS_HEADINGS.some((h) => h.key === key), key);
});

test("healer profile: gematria, Awde Negest circle, humour and three distinct sacred names", () => {
  const profile = calculateHealerProfile({ nameGeez: "ሰላማዊት", motherNameGeez: "ማርያም" });
  assert.ok(profile.gematria.digitalRoot >= 1 && profile.gematria.digitalRoot <= 9);
  assert.equal(profile.gematria.combinedTotal, profile.gematria.nameTotal + profile.gematria.motherTotal);
  assert.ok(["esat", "may", "nifas", "afere"].includes(profile.humor.key));
  assert.ok(profile.awdeNegest.circleNumber >= 1 && profile.awdeNegest.circleNumber <= 16);
  assert.equal(profile.sacredNames.length, 3);
  assert.equal(new Set(profile.sacredNames.map((n) => n.name)).size, 3);
  assert.ok(profile.sacredNames.some((n) => n.name === "Walatta Maryam"));
  const text = formatHealerProfile(profile);
  assert.doesNotMatch(text, /Tena Adam|tea|dose/i, "no remedies in a Domain B reading");
  assert.throws(() => calculateHealerProfile({ nameGeez: "Selam" }), /Ge'ez/);
});

test("urgency: danger signs in English and Amharic route to care; ordinary complaints stay routine", () => {
  assert.equal(assessUrgency("I have chest pain and can't breathe").level, "emergency");
  assert.equal(assessUrgency("ራሴን ማጥፋት እፈልጋለሁ").level, "emergency");
  assert.equal(assessUrgency("high fever and shivering for 3 days").level, "urgent");
  assert.equal(assessUrgency("mild bloating after meals").level, "routine");
  assert.ok(assessUrgency("fever and shivering", { pregnant: true }).score > assessUrgency("fever and shivering").score);
});

test("ecological matrix: highland Amhara flags podoconiosis, goitre and phytate-bound minerals; fermentation helps", async () => {
  const context = await resolveLocation({ region: "Amhara", source: "manual" });
  const matrix = buildEcologicalMatrix(context, new Date("2026-08-15"));
  assert.equal(matrix.ecology.key, "dega");
  assert.ok(matrix.endemic.some((e) => e.key === "podoconiosis"));
  assert.ok(matrix.deficiencies.some((d) => d.nutrient === "Iodine"));
  assert.ok(matrix.minerals.length > 0);
  for (const row of matrix.minerals) assert.ok(row.fermented.phytateFe <= row.raw.phytateFe, `${row.food}: fermentation lowers phytate:iron`);
  assert.ok(mineralRowsFor(["Teff (injera)"]).length === 1);
});

test("biochemistry: four levels, causes linked to named constituents; topical-only plants are marked", () => {
  const analysis = analyseBiochemistry({ categories: ["headache", "dermal"], plantSlugs: ["zinjibil", "embuay"] });
  assert.deepEqual(analysis.levels.map((l) => l.level), ["molecular", "pathway", "physiological", "organism"]);
  assert.ok(analysis.levels.find((l) => l.level === "pathway").solutions.some((s) => s.sources.some((src) => /Gingerol/.test(src.compound))));
  assert.ok(analysis.correlations.some((c) => c.phytochemicals.some((p) => /skin only/.test(p))));
});

test("orchestrator: screens candidates, excludes unsafe ones, refers danger signs, keeps humour out of ranking", async () => {
  assert.deepEqual(detectCategories("throbbing headache and a cough"), ["respiratory", "headache"]);
  const calls = [];
  const deps = {
    async screen({ slugs, medicineNames, profile }) {
      calls.push({ slugs, medicineNames, profile });
      const items = slugs.map((slug) => ({ slug, name: slug, scientificName: `Sci ${slug}`, kind: "traditional", toxic: slug === "embuay", alerts: slug === "feto" && profile.includes("pregnancy") ? [{ condition: "pregnancy", level: "avoid" }] : [] }));
      items.push({ slug: "warfarin", name: "Warfarin", scientificName: null, kind: "modern", toxic: false, alerts: [] });
      return { items, pairs: [{ a: "damakesse", b: "warfarin", severity: "moderate", basis: "predicted", findings: [{ effect: "x", management: "y", mechanism: "z" }] }], unmatched: [] };
    },
    async literature(name) {
      if (name.includes("damakesse")) throw new Error("offline");
      return [{ pmid: "123", title: `On ${name}`, journal: "J", year: "2020" }];
    },
  };
  const result = await orchestrateRemedies({ symptomsText: "headache", pregnant: true, medicinesText: "warfarin", culturalContext: { humor: "esat" } }, deps);
  assert.deepEqual(calls[0].profile, ["pregnancy"]);
  const feto = result.candidates.find((c) => c.slug === "feto");
  assert.equal(feto.status, "excluded");
  assert.equal(result.candidates.find((c) => c.slug === "damakesse").status, "caution");
  assert.match(result.literatureNote, /could not be reached/);
  assert.equal(result.culturalContext.humor, "esat");

  const emergency = await orchestrateRemedies({ symptomsText: "chest pain, cannot breathe", categories: ["headache"] }, deps);
  assert.equal(emergency.referFirst, true);
  assert.ok(emergency.candidates.every((c) => c.status === "excluded"));
});
