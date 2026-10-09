import { test } from "node:test";
import assert from "node:assert/strict";
import {
  INTENSIVE_TRADITIONAL_MEDICINES,
  TRADITIONAL_MEDICINE_CATEGORIES,
  filterTraditionalMedicines,
  toMedicinalPlant,
} from "../lib/knowledge/traditionalMedicineDatabase.ts";
import { ETHIOPIAN_MEDICINAL_PLANTS } from "../lib/knowledge/ethiopianMedicinalPlants.ts";

test("Intensive Traditional Medicine Database: contains comprehensive authentic Ethiopian records", () => {
  assert.ok(
    INTENSIVE_TRADITIONAL_MEDICINES.length >= 30,
    `Expected at least 30 intensive traditional medicine records, got ${INTENSIVE_TRADITIONAL_MEDICINES.length}`
  );

  for (const item of INTENSIVE_TRADITIONAL_MEDICINES) {
    assert.ok(item.id, "Every item must have an id");
    assert.ok(item.amharicName, `Item ${item.id} must have an amharicName`);
    assert.ok(item.vernacularName, `Item ${item.id} must have a vernacularName`);
    assert.ok(item.scientificName, `Item ${item.id} must have a scientificName`);
    assert.ok(item.botanicalFamily, `Item ${item.id} must have a botanicalFamily`);
    assert.ok(item.growthForm, `Item ${item.id} must have a growthForm`);
    assert.ok(item.habitat, `Item ${item.id} must have a habitat`);
    assert.ok(item.location, `Item ${item.id} must have a location`);
    assert.ok(item.plantParts.length > 0, `Item ${item.id} must have plantParts`);
    assert.ok(item.primaryCategory, `Item ${item.id} must have a primaryCategory`);
    assert.ok(item.categoryAmharic, `Item ${item.id} must have a categoryAmharic`);
    assert.ok(item.traditionalUse, `Item ${item.id} must have traditionalUse`);
    assert.ok(item.traditionalPreparation.method, `Item ${item.id} must have preparation method`);
    assert.ok(item.traditionalPreparation.methodAmharic, `Item ${item.id} must have methodAmharic`);
    assert.ok(item.traditionalPreparation.instructionsAmharic, `Item ${item.id} must have instructionsAmharic`);
    assert.ok(item.traditionalPreparation.dosageTradition, `Item ${item.id} must have dosageTradition`);
    assert.ok(item.diseasesTreated.length > 0, `Item ${item.id} must have diseasesTreated`);
    assert.ok(item.pharmacologicalActions.length > 0, `Item ${item.id} must have pharmacologicalActions`);
    assert.ok(item.safetyClassification, `Item ${item.id} must have safetyClassification`);
    assert.ok(item.safetyNotes, `Item ${item.id} must have safetyNotes`);
  }
});

test("Medicinal plant photos are external, taxon-specific, and properly attributed", () => {
  const plantsWithPhotos = INTENSIVE_TRADITIONAL_MEDICINES.filter((plant) => plant.imageUrl);
  assert.equal(plantsWithPhotos.length, INTENSIVE_TRADITIONAL_MEDICINES.length);

  for (const plant of plantsWithPhotos) {
    assert.equal(new URL(plant.imageUrl).protocol, "https:", `${plant.id}: photo must use HTTPS`);
    assert.match(plant.imageAlt ?? "", /photograph|herbarium specimen/i, `${plant.id}: photo must have descriptive alt text`);
    assert.ok(plant.imageAttribution, `${plant.id}: photo must credit its contributor`);
    assert.equal(new URL(plant.imageLicenseUrl).protocol, "https:", `${plant.id}: license must be linked`);
    assert.equal(new URL(plant.imageSourceUrl).protocol, "https:", `${plant.id}: source must be linked`);
    assert.ok(!plant.imageUrl.startsWith("data:"), `${plant.id}: generated artwork is not a plant photo`);
  }
});

test("Metsehafe Fewus (መጽሐፈ ፈውስ) manuscript linkages: cross-referenced remedies have chapters and pages", () => {
  const manuscriptCited = INTENSIVE_TRADITIONAL_MEDICINES.filter((m) => !!m.manuscriptReference);
  assert.ok(
    manuscriptCited.length >= 20,
    `Expected at least 20 manuscript-referenced remedies, got ${manuscriptCited.length}`
  );

  for (const item of manuscriptCited) {
    const ref = item.manuscriptReference;
    assert.ok(ref.bookTitle.includes("መጽሐፈ ፈውስ"), `${item.id}: book title must reference መጽሐፈ ፈውስ`);
    assert.ok(ref.chapterOrSection, `${item.id}: must have chapter or section`);
    assert.ok(ref.pageNumber && ref.pageNumber > 0, `${item.id}: page number must be > 0`);
  }
});

test("Category coverage: all 10 traditional therapeutic categories are represented", () => {
  const categoryKeys = Object.keys(TRADITIONAL_MEDICINE_CATEGORIES);
  assert.equal(categoryKeys.length, 10);

  for (const catKey of categoryKeys) {
    const items = INTENSIVE_TRADITIONAL_MEDICINES.filter(
      (m) => m.primaryCategory === catKey || (m.secondaryCategories ?? []).includes(catKey)
    );
    assert.ok(items.length > 0, `Category ${catKey} must have at least one traditional medicine record`);
  }
});

test("Search and filtering: matches Amharic names, diseases, and safety levels", () => {
  // Amharic search
  const kossoSearch = filterTraditionalMedicines({ query: "ኮሶ" });
  assert.ok(kossoSearch.some((m) => m.slug === "kosso"));

  const tenaAdamSearch = filterTraditionalMedicines({ query: "ጤና አዳም" });
  assert.ok(tenaAdamSearch.some((m) => m.slug === "tena-adam"));

  // Disease search
  const jaundiceSearch = filterTraditionalMedicines({ query: "ወፍ በሽታ" });
  assert.ok(jaundiceSearch.length > 0);
  assert.ok(jaundiceSearch.some((m) => m.slug === "mekmiko" || m.slug === "bisana" || m.slug === "sensel"));

  // Category filter
  const boneSetting = filterTraditionalMedicines({ category: "musculoskeletal_fracture" });
  assert.ok(boneSetting.length >= 3);
  assert.ok(boneSetting.some((m) => m.slug === "feto" || m.slug === "enset" || m.slug === "kitkita"));

  // Safety filter
  const safeCulinary = filterTraditionalMedicines({ safety: "safe_culinary" });
  assert.ok(safeCulinary.length > 0);
  assert.ok(safeCulinary.every((m) => m.safetyClassification === "safe_culinary"));

  // Manuscript only filter
  const fewusOnly = filterTraditionalMedicines({ manuscriptOnly: true });
  assert.ok(fewusOnly.length > 0);
  assert.ok(fewusOnly.every((m) => !!m.manuscriptReference));
});

test("Safety and toxicology guardrails: toxic and high-risk herbs carry strict contraindications", () => {
  const endod = INTENSIVE_TRADITIONAL_MEDICINES.find((m) => m.slug === "endod");
  assert.ok(endod);
  assert.equal(endod.safetyClassification, "toxic_internal_external_only");
  assert.ok(endod.contraindications.some((c) => /INTERNAL|ORAL/i.test(c)));

  const astenagir = INTENSIVE_TRADITIONAL_MEDICINES.find((m) => m.slug === "astenagir");
  assert.ok(astenagir);
  assert.equal(astenagir.safetyClassification, "strictly_poisonous");
  assert.ok(astenagir.contraindications.some((c) => /INTERNAL/i.test(c)));

  const kosso = INTENSIVE_TRADITIONAL_MEDICINES.find((m) => m.slug === "kosso");
  assert.ok(kosso);
  assert.equal(kosso.safetyClassification, "high_risk_potent");
  assert.ok(kosso.contraindications.some((c) => /Pregnancy/i.test(c)));

  const feto = INTENSIVE_TRADITIONAL_MEDICINES.find((m) => m.slug === "feto");
  assert.ok(feto);
  assert.ok(feto.contraindications.some((c) => /Pregnancy/i.test(c)));
});

test("Backwards compatibility: toMedicinalPlant correctly formats for legacy components", () => {
  const kosso = INTENSIVE_TRADITIONAL_MEDICINES.find((m) => m.slug === "kosso");
  assert.ok(kosso);
  const mapped = toMedicinalPlant(kosso);

  assert.equal(mapped.scientificName, kosso.scientificName);
  assert.equal(mapped.amharicName, kosso.amharicName);
  assert.equal(mapped.growthForm, kosso.growthForm);
  assert.equal(mapped.imageUrl, kosso.imageUrl);
  assert.equal(mapped.imageAttribution, kosso.imageAttribution);
  assert.equal(mapped.imageLicenseUrl, kosso.imageLicenseUrl);
  assert.ok(mapped.diseasesTreated.length > 0);
  assert.ok(mapped.modeOfPreparation?.includes("ማዘፍዘፍ"));
  assert.ok(mapped.source.includes("መጽሐፈ ፈውስ"));
});

test("Integration with ETHIOPIAN_MEDICINAL_PLANTS: expands the global pharmacopeia list", () => {
  assert.ok(ETHIOPIAN_MEDICINAL_PLANTS.length >= 80);
  assert.ok(ETHIOPIAN_MEDICINAL_PLANTS.some((p) => p.scientificName.includes("Hagenia abyssinica")));
  assert.ok(ETHIOPIAN_MEDICINAL_PLANTS.some((p) => p.scientificName.includes("Ruta chalepensis")));
  assert.ok(ETHIOPIAN_MEDICINAL_PLANTS.some((p) => p.scientificName.includes("Taverniera abyssinica")));
  assert.ok(ETHIOPIAN_MEDICINAL_PLANTS.some((p) => p.scientificName.includes("Echinops kebericho")));
});
