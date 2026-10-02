"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FORMULATOR_INGREDIENTS,
  FORMULATOR_HEALTH_ISSUES,
  formulateDynamicPlatter,
  generateRandomDietCode,
  type FormulatorIngredient,
  type FormulatorHealthIssue,
  type PlatterType,
  type DynamicFormulatorInput,
} from "@/lib/nutrition/dynamicFormulatorEngine";
import type { EconomicTier, EnzymeReactionType } from "@/lib/nutrition/compositeDietFormulator";

type RecipeScaleTab = "serving" | "day" | "month";
type NutrientTableTab = "proximate" | "aminoAcids" | "fattyAcids" | "minerals" | "vitamins";
type BasisMode = "wet" | "dry";
type IngredientCategoryFilter =
  | "all"
  | "ethiopian"
  | "international"
  | "cereal"
  | "legume"
  | "oil_seed"
  | "vegetable"
  | "animal"
  | "spice_superfood"
  | "high_protein";

export default function DynamicFormulatorPage() {
  // ── FORMULATOR STATE ────────────────────────────────────────────────────────
  const [healthIssueId, setHealthIssueId] = useState<string>("type2_diabetes_glycemic");
  const [platterType, setPlatterType] = useState<PlatterType>("multi_dish_platter");
  const [economicTier, setEconomicTier] = useState<EconomicTier>("standard");
  const [enzymeReaction, setEnzymeReaction] = useState<EnzymeReactionType>("ersho_phytase_96h");
  const [servingsPerDay, setServingsPerDay] = useState<number>(3);

  // Target Proximate Composition details
  const [targetCalories, setTargetCalories] = useState<number>(480);
  const [proteinPct, setProteinPct] = useState<number>(26);
  const [fatPct, setFatPct] = useState<number>(24);
  const [carbPct, setCarbPct] = useState<number>(50);
  const [minFiber, setMinFiber] = useState<number>(14);
  const [targetMoisturePct, setTargetMoisturePct] = useState<number>(65);
  const [targetAshGrams, setTargetAshGrams] = useState<number>(6.5);

  // Advanced target micronutrients & amino acids (collapsible)
  const [showAdvancedTargets, setShowAdvancedTargets] = useState<boolean>(false);
  const [targetLeucine, setTargetLeucine] = useState<number>(2800);
  const [targetLysine, setTargetLysine] = useState<number>(2200);
  const [targetIron, setTargetIron] = useState<number>(12);
  const [targetCalcium, setTargetCalcium] = useState<number>(450);
  const [targetZinc, setTargetZinc] = useState<number>(8);
  const [targetVitC, setTargetVitC] = useState<number>(45);
  const [targetFolate, setTargetFolate] = useState<number>(250);
  const [targetVitB12, setTargetVitB12] = useState<number>(1.5);

  // Selected ingredients (default to health issue recommendations)
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([
    "teff_flour_fermented",
    "chickpea_shiro_flour",
    "ethiopian_collard_gomen",
    "flaxseed_telba",
    "red_lentils_misir",
    "faba_beans_ful",
  ]);

  // Custom Diet Code / Name state
  const [dietCode, setDietCode] = useState<string>("ETH-GLY-418");
  const [customDietName, setCustomDietName] = useState<string>("Highland Bio-Active Ceremonial Beyayinetu Mesob");

  // UI View state
  const [ingredientFilter, setIngredientFilter] = useState<IngredientCategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recipeTab, setRecipeTab] = useState<RecipeScaleTab>("serving");
  const [nutrientTab, setNutrientTab] = useState<NutrientTableTab>("proximate");
  const [basisMode, setBasisMode] = useState<BasisMode>("wet");
  const [showAmharicSteps, setShowAmharicSteps] = useState<boolean>(true);
  const [activeCulinaryPhase, setActiveCulinaryPhase] = useState<number>(1);
  const [checkedChecklistItems, setCheckedChecklistItems] = useState<Record<string, boolean>>({});
  const [culinaryViewTab, setCulinaryViewTab] = useState<"phases" | "tools" | "plating" | "preservation">("phases");

  const toggleChecklistItem = (itemKey: string) => {
    setCheckedChecklistItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  // ── HELPER: RANDOMIZE CODE & NAME ──────────────────────────────────────────
  const handleRandomizeDiet = () => {
    const gen = generateRandomDietCode(healthIssueId, platterType);
    setDietCode(gen.code);
    setCustomDietName(gen.nameEn);
  };

  // ── HELPER: APPLY HEALTH ISSUE PRESET ───────────────────────────────────────
  const handleSelectHealthIssue = (issue: FormulatorHealthIssue) => {
    setHealthIssueId(issue.id);
    setTargetCalories(issue.recommendedTargets.caloriesPerServing);
    setProteinPct(issue.recommendedTargets.proteinPercent);
    setFatPct(issue.recommendedTargets.fatPercent);
    setCarbPct(issue.recommendedTargets.carbPercent);
    setMinFiber(issue.recommendedTargets.minFiber_g);
    setSelectedIngredientIds(issue.recommendedIngredientIds);
    setEnzymeReaction(issue.preferredEnzymeReaction);

    const gen = generateRandomDietCode(issue.id, platterType);
    setDietCode(gen.code);
    setCustomDietName(gen.nameEn);
  };

  // ── INGREDIENT TOGGLE ───────────────────────────────────────────────────────
  const toggleIngredient = (id: string) => {
    setSelectedIngredientIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // ── FILTERED INGREDIENTS LIST ───────────────────────────────────────────────
  const filteredIngredients = useMemo(() => {
    return FORMULATOR_INGREDIENTS.filter((ing) => {
      const matchesSearch =
        searchQuery === "" ||
        ing.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ing.nameAmharic.includes(searchQuery) ||
        ing.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (ingredientFilter === "ethiopian") return ing.origin === "ethiopian";
      if (ingredientFilter === "international") return ing.origin === "international";
      if (ingredientFilter === "cereal") return ing.category === "cereal";
      if (ingredientFilter === "legume") return ing.category === "legume";
      if (ingredientFilter === "oil_seed") return ing.category === "oil_seed";
      if (ingredientFilter === "vegetable") return ing.category === "vegetable";
      if (ingredientFilter === "animal") return ing.category === "animal";
      if (ingredientFilter === "spice_superfood") return ing.category === "spice_superfood";
      if (ingredientFilter === "high_protein") return ing.per100g.protein_g >= 18;
      return true;
    });
  }, [ingredientFilter, searchQuery]);

  // ── DYNAMIC CALCULATION ─────────────────────────────────────────────────────
  const formulationInput: DynamicFormulatorInput = useMemo(() => {
    return {
      dietCode,
      customDietName,
      platterType,
      healthIssueId,
      economicTier,
      enzymeReaction,
      servingsPerDay,
      targetCaloriesPerServing: targetCalories,
      proteinPercent: proteinPct,
      fatPercent: fatPct,
      carbPercent: carbPct,
      minFiber_g: minFiber,
      targetMoisturePercent: targetMoisturePct,
      targetAsh_g: targetAshGrams,
      targetLeucine_mg: targetLeucine,
      targetLysine_mg: targetLysine,
      targetIron_mg: targetIron,
      targetCalcium_mg: targetCalcium,
      targetZinc_mg: targetZinc,
      targetVitaminC_mg: targetVitC,
      targetFolate_mcg: targetFolate,
      targetVitaminB12_mcg: targetVitB12,
      selectedIngredientIds,
    };
  }, [
    dietCode,
    customDietName,
    platterType,
    healthIssueId,
    economicTier,
    enzymeReaction,
    servingsPerDay,
    targetCalories,
    proteinPct,
    fatPct,
    carbPct,
    minFiber,
    targetMoisturePct,
    targetAshGrams,
    targetLeucine,
    targetLysine,
    targetIron,
    targetCalcium,
    targetZinc,
    targetVitC,
    targetFolate,
    targetVitB12,
    selectedIngredientIds,
  ]);

  const result = useMemo(() => {
    return formulateDynamicPlatter(formulationInput);
  }, [formulationInput]);

  const {
    nutrientsPerServing,
    nutrientsPerServingDryMatter,
    extendedNutrientsWet,
    extendedNutrientsDry,
    nutrientsPerDay,
    nutrientsPerMonth,
    dryMatterAnalysis,
    recipeItems,
    totalServingGrams,
    costs,
    rdiAdequacyPct,
    deficiencyAdvisories,
    preparation,
    clinicalImpact,
    matchedCatalogDishes,
  } = result;

  // Active nutrients based on Scale Tab & Basis Mode (Wet vs Dry Matter)
  const activeNutrients = useMemo(() => {
    if (basisMode === "dry") {
      return nutrientsPerServingDryMatter;
    }
    return recipeTab === "serving" ? nutrientsPerServing : nutrientsPerDay;
  }, [basisMode, recipeTab, nutrientsPerServing, nutrientsPerServingDryMatter, nutrientsPerDay]);

  const activeExtended = useMemo(() => {
    return basisMode === "dry" ? extendedNutrientsDry : extendedNutrientsWet;
  }, [basisMode, extendedNutrientsDry, extendedNutrientsWet]);

  return (
    <main className="min-h-screen bg-[#070a08] text-stone-200">
      {/* ───────────────── HEADER / HERO ───────────────── */}
      <header className="relative overflow-hidden border-b border-emerald-500/15 bg-gradient-to-br from-[#0c1a12] via-[#09130d] to-[#060a08] px-6 py-10 md:py-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/foods"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/20"
              >
                ← Food Science Library
              </Link>
              <Link
                href="/foods/composite-formulator"
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/20"
              >
                🍲 100 Ethiopian Diets Catalog →
              </Link>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-300">
              ⚡ Multi-Scale Dynamic Synthesis
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
                Dynamic Composite Diet & <br />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                  Platter Formulation Engine
                </span>
              </h1>
              <p className="mt-1 text-base text-emerald-400 font-serif">
                ተለዋዋጭ የተመጣጠነ ማዕድና ምግብ ቀመር አስሊ (የኢትዮጵያና ዓለም አቀፍ ግብአቶች ቅንብር)
              </p>
            </div>

            {/* Random Diet Code Generator Banner */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xl shrink-0">
              <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Active Diet Protocol</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                  {dietCode}
                </span>
                <button
                  type="button"
                  onClick={handleRandomizeDiet}
                  className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 px-2.5 py-1 text-xs text-emerald-300 font-medium transition-all"
                >
                  🎲 Randomize
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-stone-300 md:text-sm">
            Configure your custom <strong>Proximate Composition</strong> targets (protein, lipid, carbohydrate, fiber, moisture, and ash), select your preferred authentic <strong>Ethiopian staples & international superfoods from our 70+ ingredient library</strong>, and specify presentation formats. Computes exact gram recipes, ranks matching dishes from the <strong>100-dish catalog</strong>, and evaluates results on both <strong>Wet Weight Basis</strong> and <strong>100% Dry Matter Basis</strong>.
          </p>
        </div>
      </header>

      {/* ───────────────── MAIN INTERACTIVE WORKSPACE ───────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* ═══════════════════════════════════════════════════════════════
              LEFT COLUMN: DYNAMIC CONFIGURATION CONTROLS (Col span 5)
             ═══════════════════════════════════════════════════════════════ */}
          <div className="space-y-6 lg:col-span-5">
            {/* 1. HEALTH ISSUES PRESETS */}
            <section className="rounded-3xl border border-white/10 bg-stone-900/60 p-5 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <span>1. Health Goal & Indication</span>
                  <span className="text-[10px] font-normal text-stone-400 font-serif">(የጤና ሁኔታ)</span>
                </h2>
                <span className="text-[10px] font-mono text-stone-400">{FORMULATOR_HEALTH_ISSUES.length} Protocols</span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {FORMULATOR_HEALTH_ISSUES.map((issue) => {
                  const isSelected = healthIssueId === issue.id;
                  return (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => handleSelectHealthIssue(issue)}
                      className={`text-left rounded-xl p-3 border transition-all text-xs ${
                        isSelected
                          ? "border-emerald-400/50 bg-emerald-500/15 text-white shadow-lg shadow-emerald-500/10"
                          : "border-white/5 bg-white/[0.02] text-stone-300 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="font-semibold text-emerald-200 line-clamp-1">{issue.titleEn}</div>
                      <div className="text-[10px] text-stone-400 font-serif mt-0.5 line-clamp-1">{issue.titleAmharic}</div>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-stone-400 font-mono">
                        <span className="rounded bg-black/40 px-1 py-0.5">{issue.recommendedTargets.caloriesPerServing} kcal</span>
                        <span className="rounded bg-black/40 px-1 py-0.5">{issue.recommendedTargets.proteinPercent}% P</span>
                        <span className="rounded bg-black/40 px-1 py-0.5">{issue.recommendedTargets.minFiber_g}g Fib</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. PROXIMATE COMPOSITION TARGET SLIDERS & ADVANCED MICROS */}
            <section className="rounded-3xl border border-white/10 bg-stone-900/60 p-5 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-2">
                  <span>2. Target Proximate Composition</span>
                  <span className="text-[10px] font-normal text-stone-400 font-serif">(የቀመር ዒላማ)</span>
                </h2>
                <div className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                  {targetCalories} kcal ({Math.round(targetCalories * 4.184)} kJ)
                </div>
              </div>

              {/* Macro Partition Visual Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-mono text-stone-400 mb-1.5">
                  <span className="text-emerald-400 font-bold">Protein: {proteinPct}%</span>
                  <span className="text-amber-400 font-bold">Fat: {fatPct}%</span>
                  <span className="text-sky-400 font-bold">Carbs: {carbPct}%</span>
                </div>
                <div className="h-3 w-full rounded-full overflow-hidden flex bg-stone-800">
                  <div style={{ width: `${proteinPct}%` }} className="bg-emerald-500 transition-all" title="Protein %" />
                  <div style={{ width: `${fatPct}%` }} className="bg-amber-500 transition-all" title="Fat %" />
                  <div style={{ width: `${carbPct}%` }} className="bg-sky-500 transition-all" title="Carbohydrates %" />
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="mt-4 space-y-3.5 text-xs">
                {/* Calories Slider */}
                <div>
                  <div className="flex justify-between text-stone-300 mb-1">
                    <span>Target Calories per Serving:</span>
                    <span className="font-mono text-emerald-300 font-bold">{targetCalories} kcal / {Math.round(targetCalories * 4.184)} kJ</span>
                  </div>
                  <input
                    type="range"
                    min="250"
                    max="1100"
                    step="25"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[9px] text-stone-500 font-mono mt-0.5">
                    <span>250 kcal (Light / Fasting)</span>
                    <span>550 kcal (Standard Platter)</span>
                    <span>1100 kcal (Surplus Mass)</span>
                  </div>
                </div>

                {/* Protein Slider */}
                <div>
                  <div className="flex justify-between text-stone-300 mb-1">
                    <span className="text-emerald-300 font-semibold">Crude Protein Target:</span>
                    <span className="font-mono text-emerald-400 font-bold">{proteinPct}% ({Math.round((targetCalories * (proteinPct / 100)) / 4)}g)</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="45"
                    step="1"
                    value={proteinPct}
                    onChange={(e) => setProteinPct(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
                  />
                </div>

                {/* Fat Slider */}
                <div>
                  <div className="flex justify-between text-stone-300 mb-1">
                    <span className="text-amber-300 font-semibold">Total Lipids / Healthy Fat:</span>
                    <span className="font-mono text-amber-400 font-bold">{fatPct}% ({Math.round((targetCalories * (fatPct / 100)) / 9)}g)</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="1"
                    value={fatPct}
                    onChange={(e) => setFatPct(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
                  />
                </div>

                {/* Carbohydrates Slider */}
                <div>
                  <div className="flex justify-between text-stone-300 mb-1">
                    <span className="text-sky-300 font-semibold">Complex Carbohydrate Target:</span>
                    <span className="font-mono text-sky-400 font-bold">{carbPct}% ({Math.round((targetCalories * (carbPct / 100)) / 4)}g)</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="70"
                    step="1"
                    value={carbPct}
                    onChange={(e) => setCarbPct(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
                  />
                </div>

                {/* Dietary Fiber Slider */}
                <div>
                  <div className="flex justify-between text-stone-300 mb-1">
                    <span className="text-teal-300 font-semibold">Minimum Dietary Fiber:</span>
                    <span className="font-mono text-teal-400 font-bold">{minFiber} grams</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={minFiber}
                    onChange={(e) => setMinFiber(Number(e.target.value))}
                    className="w-full accent-teal-400 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
                  />
                </div>

                {/* Moisture & Ash Targets */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  <div>
                    <div className="flex justify-between text-[11px] text-stone-300 mb-1">
                      <span>Target Moisture:</span>
                      <span className="font-mono text-sky-300 font-bold">{targetMoisturePct}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="85"
                      step="5"
                      value={targetMoisturePct}
                      onChange={(e) => setTargetMoisturePct(Number(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer h-1 bg-stone-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-stone-300 mb-1">
                      <span>Target Mineral Ash:</span>
                      <span className="font-mono text-amber-300 font-bold">{targetAshGrams}g</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="15"
                      step="0.5"
                      value={targetAshGrams}
                      onChange={(e) => setTargetAshGrams(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer h-1 bg-stone-700 rounded-lg"
                    />
                  </div>
                </div>

                {/* Expandable Advanced Target Micronutrients */}
                <div className="pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedTargets(!showAdvancedTargets)}
                    className="w-full flex items-center justify-between text-[11px] text-stone-400 hover:text-white font-mono p-2 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <span>🔬 Advanced Target Amino Acids & Micronutrients</span>
                    <span>{showAdvancedTargets ? "▲ Hide" : "▼ Expand (Leucine, Iron, Ca, Zn, Vit C)"}</span>
                  </button>

                  {showAdvancedTargets && (
                    <div className="mt-3 space-y-3 p-3 rounded-2xl bg-black/40 border border-white/5 text-[11px]">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between text-stone-300">
                            <span>Target Leucine (mTOR):</span>
                            <span className="font-mono text-emerald-400">{targetLeucine} mg</span>
                          </div>
                          <input
                            type="range"
                            min="1500"
                            max="4500"
                            step="100"
                            value={targetLeucine}
                            onChange={(e) => setTargetLeucine(Number(e.target.value))}
                            className="w-full accent-emerald-400 h-1 bg-stone-700 rounded-lg"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-stone-300">
                            <span>Target Lysine:</span>
                            <span className="font-mono text-emerald-400">{targetLysine} mg</span>
                          </div>
                          <input
                            type="range"
                            min="1000"
                            max="3500"
                            step="100"
                            value={targetLysine}
                            onChange={(e) => setTargetLysine(Number(e.target.value))}
                            className="w-full accent-emerald-400 h-1 bg-stone-700 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between text-stone-300">
                            <span>Target Iron (Fe):</span>
                            <span className="font-mono text-amber-300">{targetIron} mg</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="30"
                            step="1"
                            value={targetIron}
                            onChange={(e) => setTargetIron(Number(e.target.value))}
                            className="w-full accent-amber-400 h-1 bg-stone-700 rounded-lg"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-stone-300">
                            <span>Target Calcium (Ca):</span>
                            <span className="font-mono text-amber-300">{targetCalcium} mg</span>
                          </div>
                          <input
                            type="range"
                            min="150"
                            max="1000"
                            step="50"
                            value={targetCalcium}
                            onChange={(e) => setTargetCalcium(Number(e.target.value))}
                            className="w-full accent-amber-400 h-1 bg-stone-700 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between text-stone-300">
                            <span>Target Vitamin C:</span>
                            <span className="font-mono text-teal-300">{targetVitC} mg</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="120"
                            step="5"
                            value={targetVitC}
                            onChange={(e) => setTargetVitC(Number(e.target.value))}
                            className="w-full accent-teal-400 h-1 bg-stone-700 rounded-lg"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-stone-300">
                            <span>Target Vitamin B12:</span>
                            <span className="font-mono text-teal-300">{targetVitB12} mcg</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="5.0"
                            step="0.5"
                            value={targetVitB12}
                            onChange={(e) => setTargetVitB12(Number(e.target.value))}
                            className="w-full accent-teal-400 h-1 bg-stone-700 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 3. EXTENSIVE INGREDIENT SELECTION MATRIX (70+ ITEMS) */}
            <section className="rounded-3xl border border-white/10 bg-stone-900/60 p-5 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <span>3. Selected Ingredients ({selectedIngredientIds.length})</span>
                  <span className="text-[10px] font-normal text-stone-400 font-serif">(የተመረጡ ግብአቶች)</span>
                </h2>
                <div className="flex items-center gap-1.5 font-mono text-[9px]">
                  <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-emerald-300">
                    {FORMULATOR_INGREDIENTS.filter(i => selectedIngredientIds.includes(i.id) && i.origin === "ethiopian").length} 🇪🇹 Eth
                  </span>
                  <span className="rounded-full bg-teal-400/10 px-2 py-0.5 text-teal-300">
                    {FORMULATOR_INGREDIENTS.filter(i => selectedIngredientIds.includes(i.id) && i.origin === "international").length} 🌐 Intl
                  </span>
                </div>
              </div>

              {/* Filter Tabs & Search */}
              <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
                {[
                  { id: "all" as IngredientCategoryFilter, label: `All (${FORMULATOR_INGREDIENTS.length})` },
                  { id: "ethiopian" as IngredientCategoryFilter, label: "🇪🇹 Ethiopian" },
                  { id: "international" as IngredientCategoryFilter, label: "🌐 Global Superfoods" },
                  { id: "cereal" as IngredientCategoryFilter, label: "🌾 Grains & Teff" },
                  { id: "legume" as IngredientCategoryFilter, label: "🫘 Legumes & Shiro" },
                  { id: "oil_seed" as IngredientCategoryFilter, label: "🌻 Oilseeds & Fats" },
                  { id: "vegetable" as IngredientCategoryFilter, label: "🥬 Greens & Roots" },
                  { id: "animal" as IngredientCategoryFilter, label: "🥩 Meat & Fish" },
                  { id: "spice_superfood" as IngredientCategoryFilter, label: "🌶️ Spices & Yeast" },
                  { id: "high_protein" as IngredientCategoryFilter, label: "💪 High Protein" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setIngredientFilter(tab.id)}
                    className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                      ingredientFilter === tab.id
                        ? "bg-white/15 text-white border border-white/20"
                        : "bg-white/5 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-2.5">
                <input
                  type="text"
                  placeholder="Filter 70+ ingredients (e.g. Teff, Shiro, Salmon, Quinoa, Telba, Gomen, Anchote)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {/* Scrollable Ingredients Picker */}
              <div className="mt-3 max-h-[320px] overflow-y-auto space-y-2 pr-1">
                {filteredIngredients.map((ing) => {
                  const isChecked = selectedIngredientIds.includes(ing.id);
                  return (
                    <div
                      key={ing.id}
                      onClick={() => toggleIngredient(ing.id)}
                      className={`flex items-start gap-2.5 rounded-xl border p-2.5 cursor-pointer transition-all ${
                        isChecked
                          ? "border-emerald-400/40 bg-emerald-950/20 text-white shadow-sm"
                          : "border-white/5 bg-white/[0.01] text-stone-400 hover:border-white/15 hover:bg-white/5"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 accent-emerald-500 rounded cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-xs text-stone-200 truncate">{ing.nameEn}</span>
                          <span className="text-[10px] font-mono shrink-0">
                            {ing.origin === "ethiopian" ? "🇪🇹" : "🌐"}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 font-serif">{ing.nameAmharic}</div>
                        <div className="mt-1 flex flex-wrap gap-1 text-[9px] font-mono text-stone-400">
                          <span className="rounded bg-black/40 px-1 py-0.5 text-emerald-400">
                            {ing.per100g.protein_g}g Prot
                          </span>
                          <span className="rounded bg-black/40 px-1 py-0.5 text-amber-400">
                            {ing.per100g.fat_g}g Fat
                          </span>
                          <span className="rounded bg-black/40 px-1 py-0.5 text-sky-400">
                            {ing.per100g.fiber_g}g Fib
                          </span>
                          <span className="rounded bg-black/40 px-1 py-0.5 text-stone-300">
                            ~{ing.costPer100gETB.standard} ETB/100g
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. EXPANDED PLATTER & DISH PRESENTATION FORMATS (8 FORMATS) */}
            <section className="rounded-3xl border border-white/10 bg-stone-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    4. Platter & Dish Presentation Format (8 Formats)
                  </h2>
                  <span className="text-[10px] font-mono text-stone-400">የማዕድ አቀራረብ</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: "multi_dish_platter" as PlatterType, label: "Ceremonial Beyayinetu", icon: "🍲", desc: "Multi-wot feast on Teff Injera" },
                    { id: "stew_flatbread" as PlatterType, label: "Claypot Wot & Rolled Injera", icon: "🥘", desc: "Bubbling hot stew in glazed claypot" },
                    { id: "ancient_grain_bowl" as PlatterType, label: "Ancestral Genfo Bowl", icon: "🥣", desc: "Crater porridge with spiced kibbeh moat" },
                    { id: "firfir_shredded_skillet" as PlatterType, label: "Stir-Fried Injera Firfir", icon: "🫓", desc: "Sautéed shredded injera with rich gravy" },
                    { id: "chilled_deli_platter" as PlatterType, label: "Cold Chilled Deli Platter", icon: "🥗", desc: "Zesty Azifa, cold Telba fitfit & relish" },
                    { id: "sizzling_tibs_skillet" as PlatterType, label: "Sizzling Tibs Skillet", icon: "🥩", desc: "High-heat cast-iron skillet with rosemary" },
                    { id: "artisan_flatbread_pocket" as PlatterType, label: "Artisan Pocket Wrap", icon: "🥪", desc: "Ancient-grain pocket with legume filling" },
                    { id: "functional_tonic" as PlatterType, label: "Functional Elixir Tonic", icon: "🥤", desc: "Whipped seed milk & cold mucilage tonic" },
                  ].map((format) => (
                    <button
                      key={format.id}
                      type="button"
                      onClick={() => setPlatterType(format.id)}
                      className={`rounded-xl p-2.5 border text-left transition-all ${
                        platterType === format.id
                          ? "border-purple-400/50 bg-purple-500/15 text-white shadow-md shadow-purple-500/10"
                          : "border-white/5 bg-white/[0.02] text-stone-400 hover:border-white/20"
                      }`}
                    >
                      <div className="font-semibold text-xs flex items-center gap-1.5 text-purple-200">
                        <span>{format.icon}</span>
                        <span className="truncate">{format.label}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1 line-clamp-1">{format.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Economic Tier & Enzyme Cofactor */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/10">
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Economic Tier:</label>
                  <select
                    value={economicTier}
                    onChange={(e) => setEconomicTier(e.target.value as EconomicTier)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="economy">Economy (ቆጣቢ - Brown Teff / Shiro)</option>
                    <option value="standard">Standard (መካከለኛ - Balanced Mix)</option>
                    <option value="premium">Premium (ከፍተኛ - Organic / Kibbeh / Salmon)</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Enzyme Reaction:</label>
                  <select
                    value={enzymeReaction}
                    onChange={(e) => setEnzymeReaction(e.target.value as EnzymeReactionType)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="ersho_phytase_96h">Ersho Phytase 96h (Fe & Zn ×2.4)</option>
                    <option value="sprouting_germination">Sprouting Germination (Lysine +22%)</option>
                    <option value="ascorbic_acid_reduction">Ascorbic Acid (Fe3+ → Fe2+ Reduction)</option>
                    <option value="thermal_trypsin_inactivation">Thermal Inactivation (Digestibility +15%)</option>
                    <option value="standard_preparation">Standard Traditional Preparation</option>
                  </select>
                </div>
              </div>

              {/* Servings per day slider */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex justify-between text-xs text-stone-300 mb-1">
                  <span>Daily Schedule (Servings / Day):</span>
                  <span className="font-mono text-emerald-400 font-bold">{servingsPerDay} servings</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={servingsPerDay}
                  onChange={(e) => setServingsPerDay(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
                />
              </div>
            </section>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              RIGHT COLUMN: LIVE SYNTHESIZED PLATTER RESULTS (Col span 7)
             ═══════════════════════════════════════════════════════════════ */}
          <div className="space-y-6 lg:col-span-7">
            {/* PLATTER HERO SUMMARY CARD WITH DUAL-BASIS CONTROLLER */}
            <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/40 via-stone-900/60 to-teal-950/30 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                      {result.dietCode}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      {result.isInternationalOrHybrid ? "🌐 Hybrid Global-Ethiopian" : "🇪🇹 Authentic Ethiopian Heritage"}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono bg-black/40 px-2 py-0.5 rounded-full">
                      {totalServingGrams}g fresh / serving
                    </span>
                  </div>

                  <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl leading-tight">
                    {result.dietName}
                  </h2>
                  <div className="text-sm text-emerald-400 font-serif mt-0.5">
                    {result.dietNameAmharic}
                  </div>
                </div>

                {/* Cost Box */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 text-right shrink-0">
                  <div className="text-[10px] uppercase tracking-wider text-stone-400">Formulated Cost</div>
                  <div className="font-mono text-xl font-black text-emerald-300">
                    ~{costs.perServingETB} <span className="text-xs font-normal text-stone-400">ETB/meal</span>
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                    {costs.perDayETB} ETB/day · {costs.perMonthETB.toLocaleString()} ETB/mo
                  </div>
                </div>
              </div>

              {/* 💧 WET WEIGHT BASIS VS 🌾 100% DRY MATTER BASIS CONTROLLER */}
              <div className="mt-5 p-3 rounded-2xl bg-black/50 border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{basisMode === "wet" ? "💧 As-Eaten Wet Weight Basis" : "🌾 100% Dry Matter Basis (Moisture-Free)"}</span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {basisMode === "wet"
                      ? `Normalized to ${totalServingGrams}g fresh meal weight (${dryMatterAnalysis.moisturePercent}% water)`
                      : `Normalized per 100g of dry matter solids (stripping out all moisture for standard food science comparison)`}
                  </div>
                </div>

                <div className="flex rounded-xl bg-stone-900 p-1 border border-white/10 shrink-0 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setBasisMode("wet")}
                    className={`rounded-lg px-3 py-1.5 transition-all ${
                      basisMode === "wet" ? "bg-emerald-500 text-black shadow font-bold" : "text-stone-400 hover:text-white"
                    }`}
                  >
                    💧 Wet Basis (Fresh)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBasisMode("dry")}
                    className={`rounded-lg px-3 py-1.5 transition-all ${
                      basisMode === "dry" ? "bg-amber-400 text-black shadow font-bold" : "text-stone-400 hover:text-white"
                    }`}
                  >
                    🌾 Dry Matter (100% DM)
                  </button>
                </div>
              </div>

              {/* Macro Pills Bar */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs">
                <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
                    {basisMode === "wet" ? "Energy / Serving" : "Energy / 100g DM"}
                  </span>
                  <span className="text-lg font-bold text-white">
                    {basisMode === "wet" ? nutrientsPerServing.proximate.energyKcal : dryMatterAnalysis.energyKcalPer100gDry}
                  </span>
                  <span className="text-[10px] text-stone-400"> kcal</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 block">
                    {basisMode === "wet" ? "Protein / Serving" : "Protein / 100g DM"}
                  </span>
                  <span className="text-lg font-bold text-emerald-300">
                    {basisMode === "wet" ? `${nutrientsPerServing.proximate.protein_g}g` : `${dryMatterAnalysis.proteinGramsPer100gDry}g`}
                  </span>
                  <span className="text-[10px] text-stone-400"> ({nutrientsPerServing.aminoAcids.pdcaasEquivalentPct}% PDCAAS)</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 block">
                    {basisMode === "wet" ? "Lipids / Serving" : "Lipids / 100g DM"}
                  </span>
                  <span className="text-lg font-bold text-amber-300">
                    {basisMode === "wet" ? `${nutrientsPerServing.proximate.fat_g}g` : `${dryMatterAnalysis.fatGramsPer100gDry}g`}
                  </span>
                  <span className="text-[10px] text-stone-400"> (Ω3:Ω6 {nutrientsPerServing.fattyAcids.omega3ToOmega6Ratio})</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                  <span className="text-[10px] uppercase tracking-wider text-teal-400 block">
                    {basisMode === "wet" ? "Fiber / Serving" : "Fiber / 100g DM"}
                  </span>
                  <span className="text-lg font-bold text-teal-300">
                    {basisMode === "wet" ? `${nutrientsPerServing.proximate.dietaryFiber_g}g` : `${dryMatterAnalysis.fiberGramsPer100gDry}g`}
                  </span>
                  <span className="text-[10px] text-stone-400"> (Prebiotic)</span>
                </div>
              </div>
            </div>

            {/* DRY MATTER COMPARATIVE SCIENTIFIC ANALYSIS CARD */}
            <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-5 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <span>Food Science Analysis: Wet vs Dry Matter Basis</span>
                  <span className="text-[10px] font-normal text-stone-400 font-serif">(የእርጥብና ደረቅ ክብደት ንጽጽር)</span>
                </h3>
                <span className="text-[10px] font-mono text-stone-400">FAO / INFOODS Standard</span>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-3 rounded-xl border border-white/5 bg-black/30">
                  <span className="text-[10px] text-stone-400 block uppercase">Total Fresh Weight</span>
                  <span className="text-base font-bold text-white">{dryMatterAnalysis.freshWeightGrams} g</span>
                </div>
                <div className="p-3 rounded-xl border border-white/5 bg-black/30">
                  <span className="text-[10px] text-sky-400 block uppercase">Moisture Content</span>
                  <span className="text-base font-bold text-sky-300">{dryMatterAnalysis.moisturePercent}% ({dryMatterAnalysis.moistureGrams}g)</span>
                </div>
                <div className="p-3 rounded-xl border border-white/5 bg-black/30">
                  <span className="text-[10px] text-amber-400 block uppercase">Dry Matter Solids</span>
                  <span className="text-base font-bold text-amber-300">{dryMatterAnalysis.dryMatterPercent}% ({dryMatterAnalysis.dryMatterGrams}g)</span>
                </div>
                <div className="p-3 rounded-xl border border-white/5 bg-black/30">
                  <span className="text-[10px] text-teal-400 block uppercase">DM Concentration Factor</span>
                  <span className="text-base font-bold text-teal-300">{dryMatterAnalysis.concentrationFactor}×</span>
                </div>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-stone-400 uppercase">
                      <th className="pb-1.5">Nutrient Metric</th>
                      <th className="pb-1.5 text-right text-emerald-400">Wet Basis (Fresh Meal)</th>
                      <th className="pb-1.5 text-right text-amber-300">Dry Matter Basis (per 100g DM)</th>
                      <th className="pb-1.5 text-right text-stone-400">Concentration Effect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    <tr>
                      <td className="py-1.5 text-stone-300">Energy Density</td>
                      <td className="py-1.5 text-right text-emerald-300">{dryMatterAnalysis.energyKcalPer100gWet} kcal/100g</td>
                      <td className="py-1.5 text-right text-amber-300">{dryMatterAnalysis.energyKcalPer100gDry} kcal/100g DM</td>
                      <td className="py-1.5 text-right text-stone-400">+{Math.round(((dryMatterAnalysis.energyKcalPer100gDry / Math.max(1, dryMatterAnalysis.energyKcalPer100gWet)) - 1) * 100)}%</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-stone-300">Protein Concentration</td>
                      <td className="py-1.5 text-right text-emerald-300">{dryMatterAnalysis.proteinGramsPer100gWet} g/100g</td>
                      <td className="py-1.5 text-right text-amber-300">{dryMatterAnalysis.proteinGramsPer100gDry} g/100g DM</td>
                      <td className="py-1.5 text-right text-stone-400">+{Math.round(((dryMatterAnalysis.proteinGramsPer100gDry / Math.max(0.1, dryMatterAnalysis.proteinGramsPer100gWet)) - 1) * 100)}%</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-stone-300">Lipid Concentration</td>
                      <td className="py-1.5 text-right text-emerald-300">{dryMatterAnalysis.fatGramsPer100gWet} g/100g</td>
                      <td className="py-1.5 text-right text-amber-300">{dryMatterAnalysis.fatGramsPer100gDry} g/100g DM</td>
                      <td className="py-1.5 text-right text-stone-400">+{Math.round(((dryMatterAnalysis.fatGramsPer100gDry / Math.max(0.1, dryMatterAnalysis.fatGramsPer100gWet)) - 1) * 100)}%</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-stone-300">Dietary Fiber Concentration</td>
                      <td className="py-1.5 text-right text-emerald-300">{dryMatterAnalysis.fiberGramsPer100gWet} g/100g</td>
                      <td className="py-1.5 text-right text-amber-300">{dryMatterAnalysis.fiberGramsPer100gDry} g/100g DM</td>
                      <td className="py-1.5 text-right text-stone-400">+{Math.round(((dryMatterAnalysis.fiberGramsPer100gDry / Math.max(0.1, dryMatterAnalysis.fiberGramsPer100gWet)) - 1) * 100)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOP MATCHED 100-DISH CATALOG RECOMMENDATIONS */}
            <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <span>Top Matched Regional Dishes & Platters</span>
                    <span className="text-[10px] font-normal text-stone-400 font-serif">(ከተመረጡ 100 የኢትዮጵያ ማዕዶች)</span>
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Comparing your proximate targets & ingredients against all 100 dishes in the authentic catalog:
                  </p>
                </div>
                <Link
                  href="/foods/composite-formulator"
                  className="text-[10px] font-bold text-amber-300 hover:text-amber-200 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20"
                >
                  View All 100 →
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {matchedCatalogDishes.map((match) => (
                  <div
                    key={match.dish.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 hover:border-amber-400/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 font-bold">
                          {match.matchScorePct}% Match
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">{match.dish.nutrients.proximate.energyKcal} kcal</span>
                      </div>
                      <div className="font-bold text-xs text-white line-clamp-1">{match.dish.nameEn}</div>
                      <div className="text-[10px] text-emerald-400 font-serif line-clamp-1">{match.dish.nameAmharic}</div>
                      <div className="mt-2 text-[10px] text-stone-400 space-y-1">
                        {match.matchReasons.slice(0, 2).map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-1">
                            <span className="text-amber-400 shrink-0">✓</span>
                            <span className="line-clamp-2">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-stone-400">
                      <span>{match.dish.nutrients.proximate.protein_g}g Prot</span>
                      <span>{match.dish.nutrients.proximate.dietaryFiber_g}g Fib</span>
                      <span className="text-amber-300">~{match.dish.costEstimatesPerServingETB.standard} ETB</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SYNTHESIZED RECIPE TABLE (PER SERVING / DAY / MONTH) */}
            <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Synthesized Recipe & Procurement Breakdown
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Proportioned to satisfy targeted proximate calories & protein
                  </p>
                </div>

                {/* Scale Tabs */}
                <div className="flex rounded-xl bg-black/40 p-1 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setRecipeTab("serving")}
                    className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                      recipeTab === "serving" ? "bg-emerald-500 text-black shadow" : "text-stone-400 hover:text-white"
                    }`}
                  >
                    Per Serving
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipeTab("day")}
                    className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                      recipeTab === "day" ? "bg-emerald-500 text-black shadow" : "text-stone-400 hover:text-white"
                    }`}
                  >
                    Per Day ({servingsPerDay}×)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipeTab("month")}
                    className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                      recipeTab === "month" ? "bg-emerald-500 text-black shadow" : "text-stone-400 hover:text-white"
                    }`}
                  >
                    Per Month (30 Days)
                  </button>
                </div>
              </div>

              {/* Recipe Items Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-stone-400 font-mono">
                      <th className="pb-2">Ingredient</th>
                      <th className="pb-2">Culinary Role</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2 text-right">Share %</th>
                      <th className="pb-2 text-right">Cost (ETB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recipeItems.map((item) => {
                      const amountFormatted =
                        recipeTab === "serving"
                          ? `${item.gramsPerServing} g`
                          : recipeTab === "day"
                          ? `${item.gramsPerDay} g`
                          : item.gramsPerMonth >= 1000
                          ? `${(item.gramsPerMonth / 1000).toFixed(2)} kg`
                          : `${item.gramsPerMonth} g`;

                      const costFormatted =
                        recipeTab === "serving"
                          ? `${Math.round((item.gramsPerServing / 100) * (item.ingredient.costPer100gETB[economicTier] ?? item.ingredient.costPer100gETB.standard))} ETB`
                          : recipeTab === "day"
                          ? `${Math.round((item.gramsPerDay / 100) * (item.ingredient.costPer100gETB[economicTier] ?? item.ingredient.costPer100gETB.standard))} ETB`
                          : `${item.costETBPerMonth.toLocaleString()} ETB`;

                      return (
                        <tr key={item.ingredient.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 pr-2">
                            <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                              <span>{item.ingredient.origin === "ethiopian" ? "🇪🇹" : "🌐"}</span>
                              <span>{item.ingredient.nameEn}</span>
                            </div>
                            <div className="text-[10px] text-stone-400 font-serif">{item.ingredient.nameAmharic}</div>
                          </td>
                          <td className="py-2.5 px-2 text-stone-400 text-[11px] max-w-[180px] truncate">
                            {item.culinaryRole}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-300">
                            {amountFormatted}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-stone-400">
                            {item.contributionPct}%
                          </td>
                          <td className="py-2.5 pl-2 text-right font-mono text-amber-300">
                            {costFormatted}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/10 font-mono text-xs font-bold text-white">
                      <td className="pt-3">Total Batch</td>
                      <td className="pt-3 text-stone-400 text-[10px]">{recipeItems.length} ingredients</td>
                      <td className="pt-3 text-right text-emerald-300">
                        {recipeTab === "serving"
                          ? `${totalServingGrams} g`
                          : recipeTab === "day"
                          ? `${Math.round(totalServingGrams * servingsPerDay)} g`
                          : `${((totalServingGrams * servingsPerDay * 30) / 1000).toFixed(1)} kg`}
                      </td>
                      <td className="pt-3 text-right text-stone-400">100%</td>
                      <td className="pt-3 text-right text-amber-300">
                        {recipeTab === "serving"
                          ? `${costs.perServingETB} ETB`
                          : recipeTab === "day"
                          ? `${costs.perDayETB} ETB`
                          : `${costs.perMonthETB.toLocaleString()} ETB`}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 5-TIER INTENSIVE NUTRIENT TABLES (WITH DUAL BASIS SUPPORT) */}
            <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                    5-Tier Intensive Nutrient Profile
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Mode: <strong className="text-white">{basisMode === "wet" ? "💧 As-Eaten Fresh Basis" : "🌾 100% Dry Matter Basis (per 100g DM)"}</strong>
                  </p>
                </div>

                {/* Nutrient Tabs */}
                <div className="flex flex-wrap rounded-xl bg-black/40 p-1 border border-white/10 text-xs">
                  {[
                    { id: "proximate" as NutrientTableTab, label: "Proximate" },
                    { id: "aminoAcids" as NutrientTableTab, label: "18 Amino Acids & DIAAS" },
                    { id: "fattyAcids" as NutrientTableTab, label: "Fatty Acids & Lipids" },
                    { id: "minerals" as NutrientTableTab, label: "Minerals & Ratios" },
                    { id: "vitamins" as NutrientTableTab, label: "Vitamin Spectrum" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setNutrientTab(tab.id)}
                      className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                        nutrientTab === tab.id ? "bg-teal-500 text-black shadow" : "text-stone-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab 1: Proximate Table */}
              {nutrientTab === "proximate" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-2xl border border-white/5 bg-black/30 p-4 space-y-2.5 font-mono">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-stone-400">Total Energy:</span>
                      <span className="font-bold text-white">
                        {activeNutrients.proximate.energyKcal} kcal ({Math.round(activeNutrients.proximate.energyKcal * 4.184)} kJ)
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-stone-400">Crude Protein:</span>
                      <span className="font-bold text-emerald-300">{activeNutrients.proximate.protein_g} g</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-stone-400">Total Lipids (Fat):</span>
                      <span className="font-bold text-amber-300">{activeNutrients.proximate.fat_g} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Available Carbohydrates:</span>
                      <span className="font-bold text-sky-300">{activeNutrients.proximate.carbohydrate_g} g</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-black/30 p-4 space-y-2.5 font-mono">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-stone-400">Dietary Fiber:</span>
                      <span className="font-bold text-teal-300">{activeNutrients.proximate.dietaryFiber_g} g</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-stone-400">Moisture Content:</span>
                      <span className="font-bold text-stone-300">
                        {basisMode === "wet" ? `${activeNutrients.proximate.moisture_g} g (${dryMatterAnalysis.moisturePercent}%)` : "0 g (100% DM Basis)"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-stone-400">Total Mineral Ash:</span>
                      <span className="font-bold text-stone-300">{activeNutrients.proximate.ash_g} g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Protein Energy Ratio:</span>
                      <span className="font-bold text-emerald-400">
                        {((activeNutrients.proximate.protein_g * 4 / Math.max(1, activeNutrients.proximate.energyKcal)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: 18 Amino Acids Table & DIAAS */}
              {nutrientTab === "aminoAcids" && (
                <div className="mt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs mb-3 font-mono">
                    <span>PDCAAS: <strong className="text-emerald-300">{activeNutrients.aminoAcids.pdcaasEquivalentPct}%</strong></span>
                    <span>DIAAS Equiv: <strong className="text-emerald-300">{activeExtended.diaasEquivalentPct}%</strong></span>
                    <span>Total BCAA: <strong className="text-emerald-300">{activeExtended.bcaaTotal_mg} mg</strong></span>
                    <span>Total EAA: <strong className="text-emerald-300">{activeNutrients.aminoAcids.totalEAA_mg} mg</strong></span>
                    <span>Limiting: <strong className="text-amber-300">{activeNutrients.aminoAcids.limitingAmino}</strong></span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                    {[
                      { name: "Leucine (mTOR trigger)", val: activeNutrients.aminoAcids.leucine_mg },
                      { name: "Isoleucine (BCAA)", val: activeNutrients.aminoAcids.isoleucine_mg },
                      { name: "Valine (BCAA)", val: activeNutrients.aminoAcids.valine_mg },
                      { name: "Lysine", val: activeNutrients.aminoAcids.lysine_mg },
                      { name: "Methionine (Teff sulfur)", val: activeNutrients.aminoAcids.methionine_mg },
                      { name: "Cysteine", val: activeNutrients.aminoAcids.cysteine_mg },
                      { name: "Phenylalanine", val: activeNutrients.aminoAcids.phenylalanine_mg },
                      { name: "Tyrosine", val: activeNutrients.aminoAcids.tyrosine_mg },
                      { name: "Threonine", val: activeNutrients.aminoAcids.threonine_mg },
                      { name: "Tryptophan (Serotonin)", val: activeNutrients.aminoAcids.tryptophan_mg },
                      { name: "Histidine", val: activeNutrients.aminoAcids.histidine_mg },
                      { name: "Arginine (NO donor)", val: activeNutrients.aminoAcids.arginine_mg },
                      { name: "Glycine (Glutathione)", val: activeExtended.glycine_mg },
                      { name: "Proline (Collagen)", val: activeExtended.proline_mg },
                      { name: "Glutamic Acid (Gut/CNS)", val: activeExtended.glutamicAcid_mg },
                      { name: "Aspartic Acid", val: activeExtended.asparticAcid_mg },
                      { name: "Serine", val: activeExtended.serine_mg },
                      { name: "Alanine", val: activeExtended.alanine_mg },
                    ].map((aa) => (
                      <div key={aa.name} className="p-2.5 rounded-xl border border-white/5 bg-black/30 flex justify-between">
                        <span className="text-stone-400 text-[11px] truncate">{aa.name}:</span>
                        <span className="font-bold text-emerald-300 ml-1 shrink-0">{aa.val} mg</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Fatty Acids Table */}
              {nutrientTab === "fattyAcids" && (
                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-3 rounded-xl border border-white/5 bg-black/30">
                      <span className="text-[10px] text-stone-400 block uppercase">Saturated</span>
                      <span className="font-bold text-white text-base">{activeNutrients.fattyAcids.totalSaturated_g}g</span>
                    </div>
                    <div className="p-3 rounded-xl border border-white/5 bg-black/30">
                      <span className="text-[10px] text-stone-400 block uppercase">Monounsaturated (MUFA)</span>
                      <span className="font-bold text-emerald-300 text-base">{activeNutrients.fattyAcids.totalMUFA_g}g</span>
                    </div>
                    <div className="p-3 rounded-xl border border-white/5 bg-black/30">
                      <span className="text-[10px] text-stone-400 block uppercase">Polyunsaturated (PUFA)</span>
                      <span className="font-bold text-amber-300 text-base">{activeNutrients.fattyAcids.totalPUFA_g}g</span>
                    </div>
                    <div className="p-3 rounded-xl border border-white/5 bg-black/30">
                      <span className="text-[10px] text-stone-400 block uppercase">Ω3 to Ω6 Ratio</span>
                      <span className="font-bold text-teal-300 text-base">{activeNutrients.fattyAcids.omega3ToOmega6Ratio}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl border border-white/5 bg-black/20 flex justify-between">
                      <span className="text-stone-400">Omega-3 ALA (Plant):</span>
                      <span className="font-bold text-teal-300">{activeNutrients.fattyAcids.omega3_ALA_g}g</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-white/5 bg-black/20 flex justify-between">
                      <span className="text-stone-400">Omega-3 EPA (Marine):</span>
                      <span className="font-bold text-teal-300">{activeExtended.eicosapentaenoic_EPA_g}g</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-white/5 bg-black/20 flex justify-between">
                      <span className="text-stone-400">Omega-3 DHA (Marine):</span>
                      <span className="font-bold text-teal-300">{activeExtended.docosahexaenoic_DHA_g}g</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-white/5 bg-black/20 flex justify-between">
                      <span className="text-stone-400">Oleic Acid (18:1 cis-9):</span>
                      <span className="font-bold text-emerald-300">{activeExtended.oleicAcid_g}g</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-white/5 bg-black/20 flex justify-between">
                      <span className="text-stone-400">P:S Ratio:</span>
                      <span className="font-bold text-amber-300">{activeExtended.polyunsaturatedToSaturatedRatio}</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-white/5 bg-black/20 flex justify-between">
                      <span className="text-stone-400">Cholesterol:</span>
                      <span className="font-bold text-stone-300">{activeNutrients.fattyAcids.cholesterol_mg} mg</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Minerals Table & Electrolyte Ratios */}
              {nutrientTab === "minerals" && (
                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                    <span>K:Na Ratio: <strong className="text-amber-300">{activeExtended.potassiumToSodiumRatio} (DASH: {">"}3.0)</strong></span>
                    <span>Ca:Mg Ratio: <strong className="text-amber-300">{activeExtended.calciumToMagnesiumRatio}</strong></span>
                    <span>Ca:P Ratio: <strong className="text-amber-300">{activeExtended.calciumToPhosphorusRatio}</strong></span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: "Total Iron (Fe)", val: `${activeNutrients.minerals.iron_mg} mg`, extra: `Bioavailable: ${activeNutrients.minerals.bioavailableIron_mg}mg` },
                      { name: "Total Zinc (Zn)", val: `${activeNutrients.minerals.zinc_mg} mg`, extra: `Bioavailable: ${activeNutrients.minerals.bioavailableZinc_mg}mg` },
                      { name: "Calcium (Ca)", val: `${activeNutrients.minerals.calcium_mg} mg`, extra: "Bone matrix" },
                      { name: "Magnesium (Mg)", val: `${activeNutrients.minerals.magnesium_mg} mg`, extra: "Glycemic cofactor" },
                      { name: "Potassium (K)", val: `${activeNutrients.minerals.potassium_mg} mg`, extra: "DASH blood pressure" },
                      { name: "Sodium (Na)", val: `${activeNutrients.minerals.sodium_mg} mg`, extra: "Electrolyte balance" },
                      { name: "Phosphorus (P)", val: `${activeNutrients.minerals.phosphorus_mg} mg`, extra: "ATP & bones" },
                      { name: "Selenium (Se)", val: `${activeNutrients.minerals.selenium_mcg} mcg`, extra: "Antioxidant GPX" },
                      { name: "Copper (Cu)", val: `${activeExtended.copper_mg} mg`, extra: "Cytochrome oxidase" },
                      { name: "Manganese (Mn)", val: `${activeExtended.manganese_mg} mg`, extra: "Mitochondrial SOD" },
                      { name: "Iodine (I)", val: `${activeExtended.iodine_mcg} mcg`, extra: "Thyroid T3/T4" },
                    ].map((min) => (
                      <div key={min.name} className="p-2.5 rounded-xl border border-white/5 bg-black/30">
                        <div className="flex justify-between">
                          <span className="text-stone-400">{min.name}:</span>
                          <span className="font-bold text-amber-300">{min.val}</span>
                        </div>
                        <div className="text-[10px] text-stone-500 mt-1">{min.extra}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Vitamins Table */}
              {nutrientTab === "vitamins" && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  {[
                    { name: "Vitamin A (RAE)", val: `${activeNutrients.vitamins.vitaminA_RAE_mcg} mcg` },
                    { name: "Beta-Carotene", val: `${activeNutrients.vitamins.betaCarotene_mcg} mcg` },
                    { name: "Lutein + Zeaxanthin", val: `${activeExtended.luteinZeaxanthin_mcg} mcg` },
                    { name: "Vitamin C (Ascorbic)", val: `${activeNutrients.vitamins.vitaminC_mg} mg` },
                    { name: "Vitamin D3", val: `${activeNutrients.vitamins.vitaminD_mcg} mcg (${activeExtended.vitaminD_IU} IU)` },
                    { name: "Vitamin E", val: `${activeNutrients.vitamins.vitaminE_mg} mg` },
                    { name: "Vitamin K", val: `${activeExtended.vitaminK_mcg} mcg` },
                    { name: "Vitamin B1 (Thiamine)", val: `${activeNutrients.vitamins.vitaminB1_mg} mg` },
                    { name: "Vitamin B2 (Riboflavin)", val: `${activeNutrients.vitamins.vitaminB2_mg} mg` },
                    { name: "Vitamin B3 (Niacin)", val: `${activeNutrients.vitamins.vitaminB3_mg} mg` },
                    { name: "Vitamin B5 (Pantothenic)", val: `${activeExtended.vitaminB5_pantothenic_mg} mg` },
                    { name: "Vitamin B6 (Pyridoxine)", val: `${activeNutrients.vitamins.vitaminB6_mg} mg` },
                    { name: "Vitamin B7 (Biotin)", val: `${activeExtended.vitaminB7_biotin_mcg} mcg` },
                    { name: "Folate B9 (DFE)", val: `${activeNutrients.vitamins.vitaminB9_folate_mcg} mcg` },
                    { name: "Vitamin B12", val: `${activeNutrients.vitamins.vitaminB12_mcg} mcg` },
                    { name: "Choline", val: `${activeExtended.choline_mg} mg` },
                  ].map((vit) => (
                    <div key={vit.name} className="p-2.5 rounded-xl border border-white/5 bg-black/30 flex justify-between">
                      <span className="text-stone-400">{vit.name}:</span>
                      <span className="font-bold text-emerald-300">{vit.val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DEFICIENCY CORRECTIONS & OPTIMIZATION ADVISORY */}
            <div className="rounded-3xl border border-amber-500/20 bg-stone-900/60 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <span>Deficiency Corrections & Culinary Additions</span>
                  <span className="text-[10px] font-normal text-stone-400 font-serif">(የጎደሉ ንጥረ-ምግቦች ማካካሻ)</span>
                </h3>
                <span className="text-[10px] font-mono text-stone-400">RDI Benchmarks</span>
              </div>

              <div className="mt-4 space-y-3">
                {deficiencyAdvisories.map((adv, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 text-xs ${
                      adv.status === "deficit"
                        ? "border-rose-500/30 bg-rose-950/20 text-stone-200"
                        : adv.status === "mild_deficit"
                        ? "border-amber-500/30 bg-amber-950/20 text-stone-200"
                        : "border-emerald-500/30 bg-emerald-950/20 text-stone-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{adv.nutrientName}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/40">
                        Current: <strong>{adv.currentAmountFormatted}</strong> / Target: <strong>{adv.targetRdiFormatted}</strong>
                      </span>
                    </div>
                    <p className="mt-1.5 text-stone-300 leading-relaxed text-xs">
                      {adv.recommendationNote}
                    </p>
                    {adv.suggestedAdditions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Suggested Additions:</span>
                        {adv.suggestedAdditions.map((item, i) => (
                          <span key={i} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-amber-200 font-medium">
                            + {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ENHANCED STEP-BY-STEP CULINARY PREPARATION & 4-PHASE MASTER ARCHITECTURE */}
            <div className="rounded-3xl border border-white/10 bg-stone-900/70 p-6 backdrop-blur-xl shadow-2xl space-y-6">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Step-by-Step Culinary Preparation
                    </h3>
                    <span className="text-xs font-serif text-emerald-400">
                      (የምግብ አሠራር ቅደም-ተከተል እና የሙያ ዝግጅት)
                    </span>
                    <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                      {preparation.difficultyLevel} · {preparation.difficultyAmharic}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 flex flex-wrap items-center gap-2">
                    <span>⏱️ Total Active Cook Time: <strong className="text-white">{preparation.totalActiveCookMinutes} min</strong></span>
                    <span>·</span>
                    <span>Prep: <strong className="text-stone-300">{preparation.prepTimeMinutes} min</strong></span>
                    <span>·</span>
                    <span>Thermal Cook: <strong className="text-stone-300">{preparation.cookTimeMinutes} min</strong></span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAmharicSteps(!showAmharicSteps)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>🌐</span>
                    <span>{showAmharicSteps ? "English View Only" : "አማርኛ ጨምር (Bilingual)"}</span>
                  </button>
                </div>
              </div>

              {/* Bioactive Enzyme Banner */}
              <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 to-emerald-950/20 p-4 text-xs text-teal-200 flex items-start gap-3 shadow-inner">
                <span className="text-xl shrink-0 mt-0.5">🧬</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-teal-300 uppercase tracking-wider text-[11px] font-bold">
                      Bioactive Enzyme Activation Protocol:
                    </strong>
                    <span className="text-[10px] text-teal-400/80 font-mono">
                      {enzymeReaction.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-stone-300 leading-relaxed text-[11.5px]">
                    {preparation.enzymeBioactiveTip}
                  </p>
                </div>
              </div>

              {/* Culinary View Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-3">
                <button
                  type="button"
                  onClick={() => setCulinaryViewTab("phases")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    culinaryViewTab === "phases"
                      ? "bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20 font-bold"
                      : "bg-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-200"
                  }`}
                >
                  <span>🍳</span>
                  <span>Four Culinary Phases (4ቱ ምዕራፎች)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCulinaryViewTab("tools")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    culinaryViewTab === "tools"
                      ? "bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20 font-bold"
                      : "bg-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-200"
                  }`}
                >
                  <span>🥘</span>
                  <span>ToolSet & Vessels (ዕቃዎች)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCulinaryViewTab("plating")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    culinaryViewTab === "plating"
                      ? "bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20 font-bold"
                      : "bg-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-200"
                  }`}
                >
                  <span>🍽️</span>
                  <span>Plating Architecture (ማዕድ አቀራረብ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCulinaryViewTab("preservation")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    culinaryViewTab === "preservation"
                      ? "bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20 font-bold"
                      : "bg-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-200"
                  }`}
                >
                  <span>🧊</span>
                  <span>Preservation & Reheating (ማቆየት እና ማሞቅ)</span>
                </button>
              </div>

              {/* TAB 1: FOUR CULINARY PHASES */}
              {culinaryViewTab === "phases" && (
                <div className="space-y-5">
                  {/* Phase Selector Timeline Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {preparation.phases.map((phase) => {
                      const isActive = activeCulinaryPhase === phase.phaseNumber;
                      return (
                        <button
                          key={phase.phaseNumber}
                          type="button"
                          onClick={() => setActiveCulinaryPhase(phase.phaseNumber)}
                          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                            isActive
                              ? "border-emerald-500/60 bg-emerald-950/30 text-white shadow-lg shadow-emerald-950/50"
                              : "border-white/5 bg-black/20 text-stone-400 hover:border-white/20 hover:bg-white/5 hover:text-stone-300"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 mb-1">
                            <span className={isActive ? "text-emerald-400 font-bold" : ""}>PHASE 0{phase.phaseNumber}</span>
                            <span>⏱️ {phase.durationMinutes}m</span>
                          </div>
                          <div className="font-bold text-xs line-clamp-1 text-white">
                            {phase.phaseNumber === 1
                              ? "Mise en Place"
                              : phase.phaseNumber === 2
                              ? "Thermal Cooking"
                              : phase.phaseNumber === 3
                              ? "Plating Assembly"
                              : "Preservation"}
                          </div>
                          <div className="text-[10px] font-serif text-stone-400 line-clamp-1 mt-0.5">
                            {phase.phaseNameAmharic.replace(/^ምዕራፍ \d+፡ /, "")}
                          </div>
                          {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Phase Details */}
                  {(() => {
                    const currentPhase =
                      preparation.phases.find((p) => p.phaseNumber === activeCulinaryPhase) ??
                      preparation.phases[0];

                    return (
                      <div className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-5">
                        {/* Phase Header & Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-stone-950 text-[10px] font-bold">
                                {currentPhase.phaseNumber}
                              </span>
                              <h4 className="text-sm font-bold text-white">
                                {currentPhase.phaseNameEn}
                              </h4>
                            </div>
                            {showAmharicSteps && (
                              <p className="text-xs font-serif text-emerald-400 mt-0.5 ml-7">
                                {currentPhase.phaseNameAmharic}
                              </p>
                            )}
                            <p className="text-xs text-stone-300 mt-1 ml-7 leading-relaxed">
                              {currentPhase.phasePurpose}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                              🔥 {currentPhase.heatLevel}
                            </span>
                            <span className="rounded-xl border border-teal-500/30 bg-teal-950/20 px-2.5 py-1 text-[11px] font-medium text-teal-300">
                              🥘 {currentPhase.vessel.split(" or ")[0]}
                            </span>
                            <span className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono text-stone-300">
                              ⏱️ {currentPhase.durationMinutes} min
                            </span>
                          </div>
                        </div>

                        {/* Biochemical mechanism callout */}
                        {currentPhase.biochemicalTip && (
                          <div className="rounded-xl border border-teal-500/20 bg-teal-950/10 p-3 text-xs text-teal-200 flex items-start gap-2.5">
                            <span className="text-base shrink-0">🔬</span>
                            <div>
                              <strong className="block text-[10px] uppercase tracking-wider text-teal-300">
                                Biochemical & Bioavailability Rationale:
                              </strong>
                              <span className="text-[11.5px] text-stone-300 leading-relaxed">
                                {currentPhase.biochemicalTip}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Interactive Culinary Checklist */}
                        <div className="rounded-xl border border-white/5 bg-stone-900/50 p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                              <span>✅</span>
                              <span>Chef Checklist & Safety Gates</span>
                              <span className="text-[10px] text-stone-500 font-serif">(የደረጃው የቁጥጥር ዝርዝር)</span>
                            </span>
                            <span className="text-[10px] font-mono text-stone-400">
                              {currentPhase.checklistItems.filter((_, idx) => checkedChecklistItems[`${currentPhase.phaseNumber}_${idx}`]).length} / {currentPhase.checklistItems.length} Done
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {currentPhase.checklistItems.map((item, idx) => {
                              const itemKey = `${currentPhase.phaseNumber}_${idx}`;
                              const isChecked = Boolean(checkedChecklistItems[itemKey]);

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => toggleChecklistItem(itemKey)}
                                  className={`w-full text-left p-2 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                                    isChecked
                                      ? "bg-emerald-950/30 text-emerald-200 border border-emerald-500/30"
                                      : "bg-black/20 text-stone-300 border border-white/5 hover:border-white/10"
                                  }`}
                                >
                                  <span className={`flex h-4 w-4 shrink-0 mt-0.5 items-center justify-center rounded border ${
                                    isChecked ? "bg-emerald-500 border-emerald-500 text-stone-950 text-[10px] font-bold" : "border-stone-500 bg-transparent"
                                  }`}>
                                    {isChecked && "✓"}
                                  </span>
                                  <span className={`text-[11.5px] leading-relaxed ${isChecked ? "line-through text-stone-400" : ""}`}>
                                    {item}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Step-by-Step Instructions */}
                        <div className="space-y-3 pt-1">
                          <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                            Detailed Phase Instructions ({currentPhase.stepsEn.length} Steps)
                          </h5>

                          <ol className="space-y-3">
                            {currentPhase.stepsEn.map((stepEn, idx) => (
                              <li
                                key={idx}
                                className="rounded-2xl border border-white/5 bg-stone-900/40 p-3.5 flex items-start gap-3 hover:border-white/15 transition-all"
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 font-mono text-xs font-bold text-emerald-300">
                                  {idx + 1}
                                </span>
                                <div className="space-y-1 flex-1">
                                  <p className="text-stone-200 leading-relaxed text-xs">
                                    {stepEn}
                                  </p>
                                  {showAmharicSteps && currentPhase.stepsAmharic[idx] && (
                                    <p className="text-stone-400 font-serif leading-relaxed text-[11px] pt-0.5 border-t border-white/5">
                                      {currentPhase.stepsAmharic[idx]}
                                    </p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Phase Navigation Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <button
                            type="button"
                            disabled={currentPhase.phaseNumber === 1}
                            onClick={() => setActiveCulinaryPhase((p) => Math.max(1, p - 1))}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-stone-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5"
                          >
                            <span>←</span>
                            <span>Previous Phase</span>
                          </button>

                          <span className="text-[10px] font-mono text-stone-400">
                            Phase {currentPhase.phaseNumber} of {preparation.phases.length}
                          </span>

                          <button
                            type="button"
                            disabled={currentPhase.phaseNumber === preparation.phases.length}
                            onClick={() => setActiveCulinaryPhase((p) => Math.min(preparation.phases.length, p + 1))}
                            className="text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5 font-bold"
                          >
                            <span>Next Phase</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 2: CULINARY TOOLSET & VESSELS */}
              {culinaryViewTab === "tools" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Cooking Vessel */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span className="text-lg">🥘</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">Primary Cooking Vessel</h4>
                    </div>
                    <p className="text-xs font-semibold text-stone-200">{preparation.toolSet.vessel}</p>
                    {showAmharicSteps && (
                      <p className="text-xs font-serif text-stone-400">{preparation.toolSet.vesselAmharic}</p>
                    )}
                  </div>

                  {/* Heat Source */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400">
                      <span className="text-lg">🔥</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">Heat Source & Calibration</h4>
                    </div>
                    <p className="text-xs font-semibold text-stone-200">{preparation.toolSet.heatSource}</p>
                    {showAmharicSteps && (
                      <p className="text-xs font-serif text-stone-400">{preparation.toolSet.heatSourceAmharic}</p>
                    )}
                  </div>

                  {/* Utensils */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-teal-400">
                      <span className="text-lg">🥄</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">Essential Prep Utensils</h4>
                    </div>
                    <ul className="space-y-1.5 text-xs text-stone-300">
                      {preparation.toolSet.utensils.map((u, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-teal-400">•</span>
                          <div>
                            <span>{u}</span>
                            {showAmharicSteps && preparation.toolSet.utensilsAmharic[i] && (
                              <span className="text-[11px] font-serif text-stone-400 block">
                                {preparation.toolSet.utensilsAmharic[i]}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Storage Vessel */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sky-400">
                      <span className="text-lg">🏺</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">Optimal Storage Vessel</h4>
                    </div>
                    <p className="text-xs font-semibold text-stone-200">{preparation.toolSet.storageVessel}</p>
                    {showAmharicSteps && (
                      <p className="text-xs font-serif text-stone-400">{preparation.toolSet.storageVesselAmharic}</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PLATING ARCHITECTURE & CLOCK-FACE */}
              {culinaryViewTab === "plating" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <span>🍽️</span>
                          <span>Plating Aesthetic & Presentation Geometry</span>
                        </h4>
                        <p className="text-xs text-stone-300 mt-1">
                          {preparation.platingArchitecture.layoutDescriptionEn}
                        </p>
                        {showAmharicSteps && (
                          <p className="text-xs font-serif text-stone-400 mt-0.5">
                            {preparation.platingArchitecture.layoutDescriptionAmharic}
                          </p>
                        )}
                      </div>

                      <span className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 text-xs font-mono text-emerald-300">
                        Serving Temp: {preparation.platingArchitecture.servingTemperature}
                      </span>
                    </div>

                    {/* Centerpiece & Perimeter Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Centerpiece Card */}
                      <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-4 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          🎯 Visual & Flavor Centerpiece (የማዕዱ ማዕከል)
                        </div>
                        <p className="text-xs font-bold text-white">
                          {preparation.platingArchitecture.centerpiece}
                        </p>
                        {showAmharicSteps && (
                          <p className="text-xs font-serif text-amber-200/80">
                            {preparation.platingArchitecture.centerpieceAmharic}
                          </p>
                        )}
                      </div>

                      {/* Edible Utensil Card */}
                      <div className="rounded-xl border border-teal-500/30 bg-teal-950/15 p-4 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                          🥖 Probiotic Edible Utensil (የእንጀራ አጠቃቀም)
                        </div>
                        <p className="text-xs text-stone-200 leading-relaxed">
                          {preparation.platingArchitecture.edibleUtensilNote}
                        </p>
                      </div>
                    </div>

                    {/* Perimeter Clock-Face Layout */}
                    <div className="rounded-xl border border-white/5 bg-stone-900/50 p-4 space-y-2.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center justify-between">
                        <span>🕒 Radial Clock-Face Arrangement</span>
                        <span className="text-[9px] font-mono text-emerald-400">Harmonized Chromatic Contrast</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {preparation.platingArchitecture.perimeterArrangement.map((item, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl border border-white/5 bg-black/20 text-xs text-stone-300 flex items-center gap-2"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-mono font-bold text-emerald-300">
                              {i + 1}
                            </span>
                            <span className="leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cultural Etiquette & Color Harmony */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl border border-white/5 bg-black/20 text-stone-300">
                        <strong className="block text-[10px] uppercase tracking-wider text-emerald-400 mb-1">
                          🎨 Color Harmony & Cephalic Activation:
                        </strong>
                        <p className="text-[11.5px] leading-relaxed text-stone-300">
                          {preparation.platingArchitecture.colorHarmonyNote}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl border border-white/5 bg-black/20 text-stone-300">
                        <strong className="block text-[10px] uppercase tracking-wider text-amber-400 mb-1">
                          🤝 Cultural Ritual & Mindful Pacing:
                        </strong>
                        <p className="text-[11.5px] leading-relaxed text-stone-300">
                          {preparation.platingArchitecture.culturalEtiquetteNote}
                        </p>
                      </div>
                    </div>

                    {/* Garnishes */}
                    {preparation.platingArchitecture.garnishes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          Finishing Garnishes:
                        </span>
                        {preparation.platingArchitecture.garnishes.map((g, i) => (
                          <span
                            key={i}
                            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-stone-200"
                          >
                            🌿 {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: PRESERVATION, REHEATING & BULK PREP */}
              {culinaryViewTab === "preservation" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <span>🧊</span>
                          <span>Preservation, Reheating & Nutrient Retention Protocol</span>
                        </h4>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Safeguard heat-sensitive vitamins, prevent lipid rancidity, and ensure food safety
                        </p>
                      </div>

                      <span className="rounded-xl border border-sky-500/30 bg-sky-950/20 px-3 py-1 text-xs font-bold text-sky-300">
                        Refrigerate: Max {preparation.preservationGuide.maxRefrigeratedDays} Days
                      </span>
                    </div>

                    {/* Refrigeration & Reheating Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Refrigeration */}
                      <div className="rounded-xl border border-white/5 bg-stone-900/50 p-4 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                          <span>❄️</span>
                          <span>Refrigeration Protocol (2–4°C)</span>
                        </div>
                        <p className="text-xs text-stone-200 leading-relaxed">
                          {preparation.preservationGuide.refrigerationInstructions}
                        </p>
                        {showAmharicSteps && (
                          <p className="text-xs font-serif text-stone-400 leading-relaxed border-t border-white/5 pt-1.5">
                            {preparation.preservationGuide.refrigerationInstructionsAmharic}
                          </p>
                        )}
                      </div>

                      {/* Reheating */}
                      <div className="rounded-xl border border-white/5 bg-stone-900/50 p-4 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <span>♨️</span>
                          <span>Gentle Reheating Method (Stovetop)</span>
                        </div>
                        <p className="text-xs text-stone-200 leading-relaxed">
                          {preparation.preservationGuide.reheatingMethod}
                        </p>
                        {showAmharicSteps && (
                          <p className="text-xs font-serif text-stone-400 leading-relaxed border-t border-white/5 pt-1.5">
                            {preparation.preservationGuide.reheatingMethodAmharic}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Batch Cooking & Bulk Monthly Storage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Batch Cooking */}
                      <div className="rounded-xl border border-white/5 bg-stone-900/50 p-4 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <span>🍱</span>
                          <span>Batch Cooking & Freezing (30 Days)</span>
                        </div>
                        <p className="text-xs text-stone-200 leading-relaxed">
                          {preparation.preservationGuide.batchCookingTip}
                        </p>
                        {showAmharicSteps && (
                          <p className="text-xs font-serif text-stone-400 leading-relaxed border-t border-white/5 pt-1.5">
                            {preparation.preservationGuide.batchCookingTipAmharic}
                          </p>
                        )}
                      </div>

                      {/* Bulk Monthly Storage */}
                      <div className="rounded-xl border border-white/5 bg-stone-900/50 p-4 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                          <span>🌾</span>
                          <span>Raw Grain & Dry Spice Monthly Storage</span>
                        </div>
                        <p className="text-xs text-stone-200 leading-relaxed">
                          {preparation.preservationGuide.monthlyBulkStorageTip}
                        </p>
                      </div>
                    </div>

                    {/* Nutrient Retention Warning */}
                    <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-xs text-rose-200 flex items-start gap-2.5">
                      <span className="text-base shrink-0 mt-0.5">⚠️</span>
                      <div>
                        <strong className="block text-rose-300 uppercase tracking-wider text-[10px] font-bold">
                          Critical Nutrient Retention Advisory:
                        </strong>
                        <span className="text-[11.5px] leading-relaxed text-stone-300">
                          {preparation.preservationGuide.nutrientRetentionWarning}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CLINICAL & METABOLIC RATIONALE */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-stone-900/80 via-emerald-950/20 to-stone-900/80 p-6 backdrop-blur-xl shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                Clinical Impact & Metabolic Synergy (የጤና ጠቀሜታ)
              </h3>
              <h4 className="text-base font-bold text-white">{clinicalImpact.headline}</h4>
              <p className="mt-2 text-xs text-stone-300 leading-relaxed">
                {clinicalImpact.biochemicalMechanism}
              </p>
              <div className="mt-3 p-3 rounded-2xl border border-white/5 bg-black/40 text-xs font-mono text-emerald-300">
                {clinicalImpact.metabolicEffect}
              </div>
              <blockquote className="mt-3 text-xs italic text-amber-300 font-serif border-l-2 border-amber-400/50 pl-3 py-0.5">
                {clinicalImpact.culturalWisdom}
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
