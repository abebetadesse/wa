import { test } from "node:test";
import assert from "node:assert/strict";
import {
  RAW_CEREAL_MATERIALS,
  searchRawCerealMaterials,
} from "../lib/nutrition/rawCerealMaterials.ts";
import { RECIPE_INGREDIENT_CUES } from "../lib/nutrition/recipeIngredients.ts";

test("raw cereal reference records expose complete proximate composition per 100 g", () => {
  assert.equal(RAW_CEREAL_MATERIALS.length, 7);

  for (const cereal of RAW_CEREAL_MATERIALS) {
    assert.equal(cereal.basis, "dry raw grain per 100 g");
    assert.equal(cereal.dataQuality, "reference_estimate");
    assert.ok(cereal.name && cereal.scientificName && cereal.nameAmharic);
    assert.ok(cereal.useAsIngredient.length > 0);
    assert.ok(cereal.sourceUrl.startsWith("https://fdc.nal.usda.gov/"));
    for (const value of Object.values(cereal.proximate)) {
      assert.ok(Number.isFinite(value) && value >= 0);
    }
  }
});

test("raw cereal search matches English, Amharic, scientific name, and use", () => {
  assert.equal(searchRawCerealMaterials("teff")[0]?.id, "raw-teff");
  assert.equal(searchRawCerealMaterials("ጤፍ")[0]?.id, "raw-teff");
  assert.equal(searchRawCerealMaterials("Sorghum bicolor")[0]?.id, "raw-sorghum");
  assert.equal(searchRawCerealMaterials("injera flour")[0]?.id, "raw-teff");
  assert.deepEqual(searchRawCerealMaterials("no cereal exists"), []);
});

test("prepared-food ingredient links resolve to raw cereal records", () => {
  const rawCerealIds = new Set(RAW_CEREAL_MATERIALS.map((cereal) => cereal.id));
  const linkedCerealIds = Object.values(RECIPE_INGREDIENT_CUES)
    .flat()
    .flatMap((ingredient) => ingredient.rawCerealId ? [ingredient.rawCerealId] : []);

  assert.ok(linkedCerealIds.length > 0);
  assert.ok(linkedCerealIds.every((id) => rawCerealIds.has(id)));
});
