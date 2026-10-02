import test from "node:test";
import assert from "node:assert/strict";

import {
  ETHIOPIAN_COMPOSITE_DIETS,
  PURPOSE_CONFIGS,
  ENZYME_REACTION_CONFIGS,
  formulateCompositeDiet,
} from "../lib/nutrition/compositeDietFormulator.ts";

test("Composite Diet Database: covers authentic Ethiopian traditional dishes including Yetsom Beyayinetu", () => {
  assert.ok(ETHIOPIAN_COMPOSITE_DIETS.length >= 10, "Should have at least 10 authentic Ethiopian diets");

  const beyayinetu = ETHIOPIAN_COMPOSITE_DIETS.find((d) => d.id === "yetsom-beyayinetu");
  assert.ok(beyayinetu, "Yetsom Beyayinetu must be present in the database");
  assert.equal(beyayinetu.nameAmharic, "የጾም በያይነቱ");
  assert.equal(beyayinetu.isFasting, true);

  // Check sub-components
  const ingredientIds = beyayinetu.ingredients.map((i) => i.id);
  assert.ok(ingredientIds.includes("teff-injera"), "Must include Teff Injera");
  assert.ok(ingredientIds.includes("shiro-wot"), "Must include Shiro Wot");
  assert.ok(ingredientIds.includes("yemisir-wot"), "Must include Yemisir Wot");
  assert.ok(ingredientIds.includes("kik-alicha"), "Must include Kik Alicha");
  assert.ok(ingredientIds.includes("gomen-wot"), "Must include Gomen");
  assert.ok(ingredientIds.includes("azifa"), "Must include Azifa");

  // Check other key Ethiopian dishes
  const doroWot = ETHIOPIAN_COMPOSITE_DIETS.find((d) => d.id === "doro-wot-festive");
  assert.ok(doroWot, "Doro Wot must be present");
  assert.equal(doroWot.isFasting, false);

  const kitfo = ETHIOPIAN_COMPOSITE_DIETS.find((d) => d.id === "kitfo-special");
  assert.ok(kitfo, "Kitfo must be present");

  const beso = ETHIOPIAN_COMPOSITE_DIETS.find((d) => d.id === "beso-nutritional-drink");
  assert.ok(beso, "Beso must be present");

  const telba = ETHIOPIAN_COMPOSITE_DIETS.find((d) => d.id === "telba-fitfit");
  assert.ok(telba, "Telba Fitfit must be present");
});

test("Intensive Nutrient Profiles: contains all proximate, 12 amino acids, fatty acids, minerals & vitamins", () => {
  const beyayinetu = ETHIOPIAN_COMPOSITE_DIETS.find((d) => d.id === "yetsom-beyayinetu");
  const { nutrients } = beyayinetu;

  // Proximate
  assert.ok(nutrients.proximate.energyKcal > 500, "Energy should exceed 500 kcal per serving");
  assert.ok(nutrients.proximate.protein_g > 20, "Protein should exceed 20g");
  assert.ok(nutrients.proximate.dietaryFiber_g > 15, "Dietary fiber should exceed 15g");
  assert.ok(nutrients.proximate.carbohydrate_g > 80, "Carbohydrates should exceed 80g");

  // 12 Amino Acids
  const aa = nutrients.aminoAcids;
  assert.ok(aa.lysine_mg > 1000, "Lysine must be quantified and substantial");
  assert.ok(aa.methionine_mg > 300, "Methionine must be quantified");
  assert.ok(aa.cysteine_mg > 300, "Cysteine must be quantified");
  assert.ok(aa.leucine_mg > 1500, "Leucine must be quantified");
  assert.ok(aa.isoleucine_mg > 800, "Isoleucine must be quantified");
  assert.ok(aa.valine_mg > 1000, "Valine must be quantified");
  assert.ok(aa.threonine_mg > 800, "Threonine must be quantified");
  assert.ok(aa.tryptophan_mg > 200, "Tryptophan must be quantified");
  assert.ok(aa.phenylalanine_mg > 1000, "Phenylalanine must be quantified");
  assert.ok(aa.tyrosine_mg > 600, "Tyrosine must be quantified");
  assert.ok(aa.histidine_mg > 500, "Histidine must be quantified");
  assert.ok(aa.arginine_mg > 1200, "Arginine must be quantified");
  assert.ok(aa.aminoAcidScorePct >= 90, "Amino acid score should reflect complementary balance");
  assert.ok(aa.pdcaasEquivalentPct >= 85, "PDCAAS should be high");

  // Fatty Acids
  const fa = nutrients.fattyAcids;
  assert.ok(fa.totalPUFA_g > 0, "PUFA must be quantified");
  assert.ok(fa.omega6_linoleic_g > 0, "Omega-6 LA must be quantified");
  assert.ok(fa.omega3_ALA_g > 0, "Omega-3 ALA must be quantified");
  assert.ok(fa.omega3ToOmega6Ratio.length > 0, "Omega-3 to Omega-6 ratio must be present");
  assert.equal(fa.cholesterol_mg, 0, "Plant fasting platter has 0 cholesterol");

  // Minerals
  const min = nutrients.minerals;
  assert.ok(min.calcium_mg > 200, "Calcium should be high from teff and collards");
  assert.ok(min.iron_mg > 15, "Iron should be high from teff and lentils");
  assert.ok(min.bioavailableIron_mg > 0, "Bioavailable iron must be quantified");
  assert.ok(min.zinc_mg > 5, "Zinc must be quantified");
  assert.ok(min.potassium_mg >= 700, "Potassium should be rich");
  assert.ok(min.magnesium_mg > 150, "Magnesium should be rich");

  // Vitamins
  const vit = nutrients.vitamins;
  assert.ok(vit.vitaminA_RAE_mcg >= 80, "Vitamin A must be quantified");
  assert.ok(vit.betaCarotene_mcg >= 800, "Beta-carotene must be high from gomen/carrots");
  assert.ok(vit.vitaminC_mg >= 12, "Vitamin C must be quantified");
  assert.ok(vit.vitaminB9_folate_mcg > 150, "Folate must be high from pulses and greens");
});

test("Multi-Scale Recipe Formulation: correctly computes per serving, per day, and per month", () => {
  const result = formulateCompositeDiet(
    "yetsom-beyayinetu",
    "weight_loss",
    "standard",
    "ersho_phytase_96h"
  );

  // 1. Per Serving
  assert.ok(result.perServing.servingMassGrams > 400, "Serving mass should be over 400g");
  assert.ok(result.perServing.ingredients.length >= 7, "Must itemize each component");
  assert.ok(result.perServing.estimatedCostETB > 50, "Must calculate cost per serving in ETB");
  assert.ok(result.perServing.prepInstructions.steps.length > 0, "Must provide cooking steps");
  assert.ok(result.perServing.prepInstructions.amharicSteps.length > 0, "Must provide Amharic cooking steps");

  // 2. Per Day
  assert.ok(result.perDay.servingsCount >= 2.0, "Should recommend at least 2 servings per day");
  assert.ok(result.perDay.totalDailyMassGrams > result.perServing.servingMassGrams, "Daily mass > serving mass");
  assert.ok(result.perDay.mealDistribution.length === 3, "Should provide breakfast, lunch, and dinner timetable");
  assert.ok(result.perDay.adequacyVsRDI.energy.percent > 0, "Should compute adequacy percentage vs RDI");
  assert.ok(result.perDay.adequacyVsRDI.protein.percent > 0, "Protein adequacy should be computed");

  // 3. Per Month (30 Days)
  assert.equal(result.perMonth.daysCount, 30);
  assert.ok(result.perMonth.totalMonthlyCostETB > 2000, "Monthly cost should be in realistic ETB range");
  assert.ok(result.perMonth.bulkPantryItems.length >= 3, "Should list bulk dry pantry items");

  const teffPantry = result.perMonth.bulkPantryItems.find((p) => p.nameEn.toLowerCase().includes("teff"));
  assert.ok(teffPantry, "Must specify bulk Teff grain/flour procurement");
  assert.ok(teffPantry.totalKgOrLiters >= 5, "Monthly teff procurement should be at least 5 kg");
});

test("Purpose Formulations: modulates macronutrients according to user goal", () => {
  const loss = formulateCompositeDiet("yetsom-beyayinetu", "weight_loss");
  const gain = formulateCompositeDiet("yetsom-beyayinetu", "weight_gain");
  const muscle = formulateCompositeDiet("yetsom-beyayinetu", "muscle_build");

  // Caloric comparison
  assert.ok(
    loss.perServing.nutrients.proximate.energyKcal < gain.perServing.nutrients.proximate.energyKcal,
    "Weight loss calories must be lower than weight gain calories"
  );

  // Protein comparison
  assert.ok(
    muscle.perServing.nutrients.proximate.protein_g > loss.perServing.nutrients.proximate.protein_g,
    "Muscle build protein must be elevated"
  );
  assert.ok(
    muscle.perServing.nutrients.aminoAcids.leucine_mg > 2000,
    "Muscle build must supply high leucine for mTOR activation"
  );

  // Therapeutic conditions
  const diabetes = formulateCompositeDiet("yetsom-beyayinetu", "therapeutic_diabetes");
  assert.ok(
    diabetes.perServing.nutrients.proximate.dietaryFiber_g > loss.perServing.nutrients.proximate.dietaryFiber_g,
    "Diabetes formulation emphasizes higher fiber"
  );

  const hypertension = formulateCompositeDiet("yetsom-beyayinetu", "therapeutic_hypertension");
  const kNaRatio = hypertension.perDay.nutrients.minerals.potassium_mg / hypertension.perDay.nutrients.minerals.sodium_mg;
  assert.ok(kNaRatio > 1.5, "Hypertension formulation maintains favorable K:Na ratio");
});

test("Economic Tiers: scales monthly and serving budget appropriately", () => {
  const econ = formulateCompositeDiet("yetsom-beyayinetu", "weight_loss", "economy");
  const std = formulateCompositeDiet("yetsom-beyayinetu", "weight_loss", "standard");
  const prem = formulateCompositeDiet("yetsom-beyayinetu", "weight_loss", "premium");

  assert.ok(econ.perServing.estimatedCostETB < std.perServing.estimatedCostETB, "Economy < Standard serving cost");
  assert.ok(std.perServing.estimatedCostETB < prem.perServing.estimatedCostETB, "Standard < Premium serving cost");
  assert.ok(econ.perMonth.totalMonthlyCostETB < std.perMonth.totalMonthlyCostETB, "Economy < Standard monthly budget");
  assert.ok(std.perMonth.totalMonthlyCostETB < prem.perMonth.totalMonthlyCostETB, "Standard < Premium monthly budget");
});

test("Enzyme Reaction Cofactors: enhances mineral and protein bioavailability", () => {
  const standard = formulateCompositeDiet("yetsom-beyayinetu", "weight_loss", "standard", "standard_preparation");
  const phytase = formulateCompositeDiet("yetsom-beyayinetu", "weight_loss", "standard", "ersho_phytase_96h");
  const ascorbic = formulateCompositeDiet("yetsom-beyayinetu", "weight_loss", "standard", "ascorbic_acid_reduction");
  const sprouting = formulateCompositeDiet("yetsom-beyayinetu", "weight_loss", "standard", "sprouting_germination");

  // Phytase activation degrades phytate and boosts bioavailable iron & zinc
  assert.ok(
    phytase.perServing.nutrients.minerals.bioavailableIron_mg > standard.perServing.nutrients.minerals.bioavailableIron_mg * 2.0,
    "Ersho phytase should at least double bioavailable iron"
  );
  assert.ok(
    phytase.perServing.nutrients.minerals.bioavailableZinc_mg > standard.perServing.nutrients.minerals.bioavailableZinc_mg * 1.5,
    "Ersho phytase should boost bioavailable zinc"
  );

  // Ascorbic acid reduction boosts non-heme iron absorption
  assert.ok(
    ascorbic.perServing.nutrients.minerals.bioavailableIron_mg > standard.perServing.nutrients.minerals.bioavailableIron_mg * 2.5,
    "Ascorbic acid cofactor should nearly triple iron bioavailability"
  );

  // Sprouting germination boosts free lysine and B-vitamins
  assert.ok(
    sprouting.perServing.nutrients.aminoAcids.lysine_mg > standard.perServing.nutrients.aminoAcids.lysine_mg,
    "Sprouting increases free lysine"
  );
  assert.ok(
    sprouting.perServing.nutrients.vitamins.vitaminB1_mg > standard.perServing.nutrients.vitamins.vitaminB1_mg,
    "Sprouting increases thiamin B1"
  );
});

test("API Endpoint: GET /api/nutrition/composite-formulator returns catalog options", async () => {
  const { GET } = await import("../app/api/nutrition/composite-formulator/route.ts");
  const response = await GET();
  assert.equal(response.status, 200);

  const data = await response.json();
  assert.ok(Array.isArray(data.diets), "Should return diets array");
  assert.ok(data.diets.length >= 10, "Should have 10+ diets");
  assert.ok(Array.isArray(data.purposes), "Should return purposes array");
  assert.ok(Array.isArray(data.economicTiers), "Should return economic tiers");
  assert.ok(Array.isArray(data.enzymeReactions), "Should return enzyme reactions");
});

test("API Endpoint: POST /api/nutrition/composite-formulator calculates tailored formulation", async () => {
  const { POST } = await import("../app/api/nutrition/composite-formulator/route.ts");
  const request = new Request("http://localhost/api/nutrition/composite-formulator", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dietId: "yetsom-beyayinetu",
      purpose: "muscle_build",
      economicTier: "premium",
      enzymeReactionType: "ersho_phytase_96h",
    }),
  });

  const response = await POST(request);
  assert.equal(response.status, 200);

  const result = await response.json();
  assert.equal(result.diet.id, "yetsom-beyayinetu");
  assert.equal(result.purposeConfig.id, "muscle_build");
  assert.equal(result.economicTier, "premium");
  assert.ok(result.perServing.servingMassGrams > 400);
  assert.ok(result.perDay.servingsCount >= 2.5);
  assert.ok(result.perMonth.daysCount === 30);
  assert.ok(result.perMonth.totalMonthlyCostETB > 3000);
  assert.ok(result.perServing.nutrients.aminoAcids.leucine_mg > 2000);
  assert.ok(result.personalizedHealthNote.headline.length > 0);
});

