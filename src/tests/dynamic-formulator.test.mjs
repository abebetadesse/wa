import test from "node:test";
import assert from "node:assert/strict";

test("Dynamic Formulator Engine: Intensive Ingredients & Health Issues loaded", async () => {
  const {
    FORMULATOR_INGREDIENTS,
    FORMULATOR_HEALTH_ISSUES,
  } = await import("../lib/nutrition/dynamicFormulatorEngine.ts");

  assert.ok(Array.isArray(FORMULATOR_INGREDIENTS), "Ingredients should be an array");
  assert.ok(FORMULATOR_INGREDIENTS.length >= 25, "Should have intensive list of at least 25 ingredients");

  const ethiopianCount = FORMULATOR_INGREDIENTS.filter(i => i.origin === "ethiopian").length;
  const intlCount = FORMULATOR_INGREDIENTS.filter(i => i.origin === "international").length;
  assert.ok(ethiopianCount >= 15, "Should have rich authentic Ethiopian ingredients (Teff, Shiro, Kocho, Bulla, Anchote, etc.)");
  assert.ok(intlCount >= 8, "Should have international superfood ingredients (Salmon, Quinoa, Chia, Skyr, etc.)");

  assert.ok(Array.isArray(FORMULATOR_HEALTH_ISSUES), "Health issues should be an array");
  assert.ok(FORMULATOR_HEALTH_ISSUES.length >= 6, "Should have at least 6 health issues");
});

test("Dynamic Formulator Engine: Random Diet Code Generator across 8 Platter Formats", async () => {
  const { generateRandomDietCode } = await import("../lib/nutrition/dynamicFormulatorEngine.ts");

  const formats = [
    "multi_dish_platter",
    "stew_flatbread",
    "ancient_grain_bowl",
    "functional_tonic",
    "firfir_shredded_skillet",
    "chilled_deli_platter",
    "sizzling_tibs_skillet",
    "artisan_flatbread_pocket",
  ];

  for (const fmt of formats) {
    const gen = generateRandomDietCode("muscle_hypertrophy", fmt);
    assert.ok(gen.code.includes("-"), "Code should have hyphens");
    assert.ok(gen.nameEn.length > 5, "Should have descriptive English name");
    assert.ok(gen.nameAmharic.length > 5, "Should have Amharic name");
  }
});

test("Dynamic Formulator Engine: Catalog Matching against 100-dish catalog", async () => {
  const { findMatchingCatalogDishes } = await import("../lib/nutrition/dynamicFormulatorEngine.ts");

  const matches = findMatchingCatalogDishes(
    500, // calories
    25,  // protein
    15,  // fat
    70,  // carb
    12,  // fiber
    ["teff_flour_fermented", "chickpea_shiro_flour", "red_lentils_misir"],
    "type2_diabetes_glycemic",
    3
  );

  assert.equal(matches.length, 3, "Should return 3 top matches");
  assert.ok(matches[0].matchScorePct >= 50, "Top match should have strong score");
  assert.ok(matches[0].dish.nameEn.length > 0, "Dish name should be present");
  assert.ok(matches[0].proximateComparison.length >= 4, "Proximate comparison should have macro rows");
});

test("Dynamic Formulator Engine: Custom Platter Synthesis with Dual Basis (Wet vs 100% Dry Matter)", async () => {
  const { formulateDynamicPlatter } = await import("../lib/nutrition/dynamicFormulatorEngine.ts");

  const result = formulateDynamicPlatter({
    dietCode: "TST-GLY-999",
    customDietName: "Test Glycemic Ceremonial Platter",
    platterType: "multi_dish_platter",
    healthIssueId: "type2_diabetes_glycemic",
    economicTier: "standard",
    enzymeReaction: "ersho_phytase_96h",
    servingsPerDay: 3,
    targetCaloriesPerServing: 480,
    proteinPercent: 28,
    fatPercent: 22,
    carbPercent: 50,
    minFiber_g: 14,
    targetMoisturePercent: 65,
    targetAsh_g: 6.5,
    targetLeucine_mg: 2800,
    targetIron_mg: 12,
    targetCalcium_mg: 450,
    selectedIngredientIds: ["teff_flour_fermented", "chickpea_shiro_flour", "ethiopian_collard_gomen", "flaxseed_telba", "faba_beans_ful"],
  });

  assert.equal(result.dietCode, "TST-GLY-999");
  assert.equal(result.dietName, "Test Glycemic Ceremonial Platter");
  assert.ok(result.totalServingGrams > 100, "Should have positive total weight");
  assert.ok(result.recipeItems.length >= 4, "Should contain selected ingredients");

  // Dual-Basis (Wet vs 100% Dry Matter) tests
  const wet = result.nutrientsPerServing;
  const dry = result.nutrientsPerServingDryMatter;
  const dmAnalysis = result.dryMatterAnalysis;

  assert.ok(dmAnalysis.moisturePercent > 0, "Moisture percent must be calculated");
  assert.ok(dmAnalysis.dryMatterPercent > 0, "Dry matter percent must be calculated");
  assert.equal(Math.round(dmAnalysis.moisturePercent + dmAnalysis.dryMatterPercent), 100, "Moisture + DM should equal 100%");
  assert.equal(dry.proximate.moisture_g, 0, "100% Dry Matter basis must have 0 moisture");
  assert.ok(dmAnalysis.energyKcalPer100gDry > dmAnalysis.energyKcalPer100gWet, "Caloric density per 100g DM must be higher than wet basis per 100g");
  assert.ok(dmAnalysis.proteinGramsPer100gDry > dmAnalysis.proteinGramsPer100gWet, "Protein density on DM basis must be higher than fresh wet basis");

  // Extended Nutrients tests
  const extWet = result.extendedNutrientsWet;
  assert.ok(extWet.bcaaTotal_mg > 1000, "Total BCAA should be calculated");
  assert.ok(extWet.glycine_mg > 0, "Glycine should be calculated");
  assert.ok(extWet.glutamicAcid_mg > 0, "Glutamic acid should be calculated");
  assert.ok(parseFloat(extWet.potassiumToSodiumRatio) > 0, "K:Na ratio must be computed");
  assert.ok(parseFloat(extWet.calciumToMagnesiumRatio) > 0, "Ca:Mg ratio must be computed");
  assert.ok(parseFloat(extWet.polyunsaturatedToSaturatedRatio) > 0, "P:S ratio must be computed");
  assert.ok(extWet.luteinZeaxanthin_mcg > 0, "Lutein/Zeaxanthin should be calculated");
  assert.ok(extWet.vitaminK_mcg > 0, "Vitamin K should be calculated");
  assert.ok(extWet.choline_mg > 0, "Choline should be calculated");

  // Multi-scale recipe check
  assert.ok(result.costs.perServingETB > 0, "Per serving cost should be > 0");
  assert.ok(result.costs.perDayETB > result.costs.perServingETB, "Per day cost should scale with servings");
  assert.ok(result.costs.perMonthETB > result.costs.perDayETB, "Per month cost should scale with 30 days");

  // Instructions check
  assert.ok(result.preparation.stepsEn.length >= 3, "Should have English steps");
  assert.ok(result.preparation.stepsAmharic.length >= 3, "Should have Amharic steps");
  assert.ok(result.deficiencyAdvisories.length > 0, "Should have deficiency advisories");

  // Enhanced 4-Phase Culinary Preparation check
  assert.equal(result.preparation.phases.length, 4, "Should have 4 distinct culinary phases");
  result.preparation.phases.forEach((phase, idx) => {
    assert.equal(phase.phaseNumber, idx + 1, `Phase number should be ${idx + 1}`);
    assert.ok(phase.phaseNameEn.length > 0, "Phase should have English name");
    assert.ok(phase.phaseNameAmharic.length > 0, "Phase should have Amharic name");
    assert.ok(phase.stepsEn.length > 0, "Phase should have English steps");
    assert.ok(phase.stepsAmharic.length > 0, "Phase should have Amharic steps");
    assert.ok(phase.checklistItems.length > 0, "Phase should have interactive checklist items");
    assert.ok(phase.heatLevel.length > 0, "Phase should define heat level");
  });
  assert.ok(result.preparation.toolSet.vessel.length > 0, "ToolSet vessel should be defined");
  assert.ok(result.preparation.toolSet.utensils.length > 0, "ToolSet utensils should be defined");
  assert.ok(result.preparation.platingArchitecture.centerpiece.length > 0, "Plating centerpiece should be defined");
  assert.ok(result.preparation.platingArchitecture.perimeterArrangement.length > 0, "Plating perimeter arrangement should be defined");
  assert.ok(result.preparation.preservationGuide.refrigerationInstructions.length > 0, "Preservation refrigeration guide should be defined");
  assert.ok(result.preparation.preservationGuide.reheatingMethod.length > 0, "Preservation reheating method should be defined");
  assert.ok(result.preparation.totalActiveCookMinutes > 0, "Total active cook time should be > 0");
  assert.ok(result.preparation.difficultyLevel.length > 0, "Difficulty level should be defined");
  assert.ok(result.preparation.difficultyAmharic.length > 0, "Difficulty Amharic should be defined");
});

test("API Endpoint: GET /api/nutrition/dynamic-formulator returns parameters", async () => {
  const { GET } = await import("../app/api/nutrition/dynamic-formulator/route.ts");
  const response = await GET();
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(data.ingredients), "Ingredients should be returned");
  assert.ok(data.ingredients.length >= 25, "Should return intensive ingredient catalog");
  assert.ok(Array.isArray(data.healthIssues), "Health issues should be returned");
  assert.ok(data.sampleRandom.code.length > 0, "Sample random code should be returned");
});

test("API Endpoint: POST /api/nutrition/dynamic-formulator calculates custom formulation with extended formats", async () => {
  const { POST } = await import("../app/api/nutrition/dynamic-formulator/route.ts");
  const request = new Request("http://localhost/api/nutrition/dynamic-formulator", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dietCode: "API-TEST-FIRFIR",
      customDietName: "API Test Sautéed Firfir Skillet",
      healthIssueId: "muscle_hypertrophy",
      targetCaloriesPerServing: 620,
      proteinPercent: 30,
      fatPercent: 25,
      carbPercent: 45,
      minFiber_g: 12,
      targetMoisturePercent: 60,
      targetAsh_g: 7.0,
      selectedIngredientIds: ["lean_highland_beef", "teff_flour_fermented", "roasted_barley_flour", "berbere_spice_blend"],
      servingsPerDay: 3,
      economicTier: "standard",
      enzymeReaction: "sprouting_germination",
      platterType: "firfir_shredded_skillet",
    }),
  });

  const response = await POST(request);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.dietCode, "API-TEST-FIRFIR");
  assert.equal(data.platterType, "firfir_shredded_skillet");
  assert.ok(data.nutrientsPerServing.proximate.protein_g > 15);
  assert.ok(data.dryMatterAnalysis.dryMatterPercent > 0);
  assert.ok(data.matchedCatalogDishes.length > 0);
});
