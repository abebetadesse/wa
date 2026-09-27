"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Sparkles,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronRight,
  Flame,
  ShieldCheck,
  Activity,
  Heart,
  Droplets,
  Zap,
  Info,
  Sliders,
  Scale,
  X,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  ETHIOPIAN_RAW_CEREALS_AND_MATERIALS,
  ETHIOPIAN_RECIPES_DATABASE,
  RawCerealOrIngredient,
  TraditionalRecipe,
  estimateProcessingBioavailability,
  calculatePhytateMineralRatio,
} from "@/lib/nutrition/ethiopianFoodScience";

type TabView = "recipes" | "cereals" | "compare" | "anf_lab" | "efct_foods";

interface FoodBiochemistryExplorerProps {
  efctDbFoods?: any[];
}

export function FoodBiochemistryExplorer({ efctDbFoods = [] }: FoodBiochemistryExplorerProps) {
  const [activeTab, setActiveTab] = useState<TabView>("recipes");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [fastingFilter, setFastingFilter] = useState<"all" | "fasting" | "non_fasting">("all");

  // Selection states
  const [selectedRecipe, setSelectedRecipe] = useState<TraditionalRecipe | null>(null);
  const [selectedCereal, setSelectedCereal] = useState<RawCerealOrIngredient | null>(null);

  // ANF Lab state
  const [labGrainId, setLabGrainId] = useState<string>("cereal-red-teff");
  const [labMethod, setLabMethod] = useState<"fermentation_4day" | "fermentation_2day" | "soaking_24h" | "roasting" | "boiling">("fermentation_4day");

  // Comparison state
  const [compareGrains, setCompareGrains] = useState<string[]>([
    "cereal-red-teff",
    "cereal-white-teff",
    "cereal-finger-millet",
    "cereal-highland-barley",
  ]);

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return ETHIOPIAN_RECIPES_DATABASE.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.nameEn.toLowerCase().includes(q) ||
        r.nameAmharic.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some((ing) => ing.nameEn.toLowerCase().includes(q) || ing.nameAmharic.toLowerCase().includes(q));

      const matchesCategory =
        categoryFilter === "all" || r.category.toLowerCase().includes(categoryFilter.toLowerCase());

      const matchesFasting =
        fastingFilter === "all" ||
        (fastingFilter === "fasting" && r.fastingSuitability === "fasting_friendly") ||
        (fastingFilter === "non_fasting" && r.fastingSuitability !== "fasting_friendly");

      return matchesSearch && matchesCategory && matchesFasting;
    });
  }, [searchQuery, categoryFilter, fastingFilter]);

  // Filtered raw materials
  const filteredCereals = useMemo(() => {
    return ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.nameEn.toLowerCase().includes(q) ||
        c.nameAmharic.toLowerCase().includes(q) ||
        c.scientificName.toLowerCase().includes(q) ||
        c.partUsed.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "all" || c.category.toLowerCase().includes(categoryFilter.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  // Active lab grain
  const activeLabGrain = useMemo(() => {
    return (
      ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((g) => g.id === labGrainId) ||
      ETHIOPIAN_RAW_CEREALS_AND_MATERIALS[0]
    );
  }, [labGrainId]);

  const labBioavailability = useMemo(() => {
    return estimateProcessingBioavailability(
      activeLabGrain.antinutrients.phyticAcidMgPer100g,
      labMethod
    );
  }, [activeLabGrain, labMethod]);

  const nativePhytateFeRatio = calculatePhytateMineralRatio(
    activeLabGrain.antinutrients.phyticAcidMgPer100g,
    activeLabGrain.minerals.ironMg,
    55.85
  );

  const cookedPhytateFeRatio = calculatePhytateMineralRatio(
    labBioavailability.residualPhytateMg,
    activeLabGrain.minerals.ironMg,
    55.85
  );

  return (
    <div className="space-y-8">
      {/* ── Top Navigation Tabs ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("recipes")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "recipes"
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🍲</span>
            <span>Traditional Recipes & Formulations ({ETHIOPIAN_RECIPES_DATABASE.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cereals")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "cereals"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🌾</span>
            <span>Cereals & Raw Materials ({ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("compare")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "compare"
                ? "bg-sky-500 text-black shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>⚖️</span>
            <span>Cereal Comparison Matrix</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("anf_lab")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === "anf_lab"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🔬</span>
            <span>Antinutrient Degradation Lab</span>
          </button>
          {efctDbFoods.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("efct_foods")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === "efct_foods"
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>📜</span>
              <span>EFCT Database ({efctDbFoods.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 px-3">
          <span>✓ EFCT 2025 Validated</span>
        </div>
      </div>

      {/* ── Search and Filter Controls (for recipes and cereals) ── */}
      {(activeTab === "recipes" || activeTab === "cereals") && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/40 border border-white/10">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "recipes"
                  ? "Search recipe or ingredient (e.g. ጤፍ, Injera, Shiro, Lentil, Beso)..."
                  : "Search cereal or raw material (e.g. Red Teff, Barley, Dagussa, Chickpea)..."
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "recipes" && (
              <div className="flex items-center gap-1 bg-zinc-950 border border-white/10 rounded-xl p-1 text-xs">
                {(["all", "fasting", "non_fasting"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFastingFilter(mode)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      fastingFilter === mode
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {mode === "all" ? "All Diets" : mode === "fasting" ? "🌿 Fasting (የፆም)" : "🍗 Dual / Meat"}
                  </button>
                ))}
              </div>
            )}

            {activeTab === "cereals" && (
              <div className="flex items-center gap-1 bg-zinc-950 border border-white/10 rounded-xl p-1 text-xs">
                {["all", "Cereal", "Pulse", "Root", "Oilseed"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      categoryFilter === cat
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat === "all" ? "All Grains" : cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 1: TRADITIONAL RECIPES & INGREDIENT FORMULATIONS
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "recipes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-950/20 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-white text-lg group-hover:text-emerald-300 transition-colors">
                        {recipe.nameEn}
                      </h3>
                      <div className="text-xs font-serif text-amber-400 font-semibold mt-0.5">
                        {recipe.nameAmharic}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-mono uppercase tracking-wider font-semibold border ${
                        recipe.fastingSuitability === "fasting_friendly"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {recipe.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {recipe.description}
                  </p>

                  {/* Ingredients preview */}
                  <div className="space-y-2 mb-4 p-3 rounded-2xl bg-black/40 border border-white/5">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Ingredients & Raw Materials</span>
                      <span className="text-emerald-400 font-bold">{recipe.ingredients.length} items</span>
                    </div>
                    <div className="space-y-1.5">
                      {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 truncate max-w-[180px]">
                            • {ing.nameEn} ({ing.nameAmharic})
                          </span>
                          <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                            {ing.percentageOfTotal}%
                          </span>
                        </div>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <div className="text-[10px] text-slate-500 italic">
                          +{recipe.ingredients.length - 3} more ingredients...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Composite Proximate Snapshot */}
                  <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] uppercase font-mono text-slate-500">Energy</div>
                      <div className="text-xs font-bold text-white mt-0.5">{recipe.compositeProximate.energyKcal} kcal</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] uppercase font-mono text-slate-500">Protein</div>
                      <div className="text-xs font-bold text-emerald-300 mt-0.5">{recipe.compositeProximate.proteinG}g</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] uppercase font-mono text-slate-500">Fiber</div>
                      <div className="text-xs font-bold text-amber-300 mt-0.5">{recipe.compositeProximate.dietaryFiberG}g</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] uppercase font-mono text-slate-500">Iron</div>
                      <div className="text-xs font-bold text-sky-300 mt-0.5">{recipe.compositeMinerals.ironMg}mg</div>
                    </div>
                  </div>

                  {/* ANF Reduction Badge */}
                  <div className="text-[11px] p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 leading-snug">
                    <span className="font-bold">🛡️ ANF Degradation: </span>
                    {recipe.antinutrientDegradationSummary.degradationPercentage}% phytate breakdown via traditional processing.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRecipe(recipe)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Inspect Recipe Formulation & Proximate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 2: CEREALS & RAW MATERIALS EXPLORER
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "cereals" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCereals.map((cereal) => (
              <div
                key={cereal.id}
                className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all hover:shadow-xl hover:shadow-amber-950/20 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-white text-lg group-hover:text-amber-300 transition-colors">
                        {cereal.nameEn}
                      </h3>
                      <div className="text-xs font-serif text-amber-400 font-semibold mt-0.5">
                        {cereal.nameAmharic}
                      </div>
                      <div className="text-[11px] text-slate-500 italic mt-0.5">
                        {cereal.scientificName}
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                      {cereal.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    {cereal.partUsed} · {cereal.growingEcology}
                  </p>

                  {/* Proximate Grid per 100g */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] uppercase font-mono text-slate-500">Protein</div>
                      <div className="text-xs font-bold text-emerald-300 mt-0.5">{cereal.proximate.proteinG}g</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] uppercase font-mono text-slate-500">Dietary Fiber</div>
                      <div className="text-xs font-bold text-amber-300 mt-0.5">{cereal.proximate.dietaryFiberG}g</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] uppercase font-mono text-slate-500">Energy</div>
                      <div className="text-xs font-bold text-white mt-0.5">{cereal.proximate.energyKcal} kcal</div>
                    </div>
                  </div>

                  {/* Mineral highlights */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2 mb-4">
                    <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center justify-between">
                      <span>Micronutrient Highlights (per 100g)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Iron (Fe)</span>
                        <span className="font-bold text-white">{cereal.minerals.ironMg} mg</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Calcium (Ca)</span>
                        <span className="font-bold text-white">{cereal.minerals.calciumMg} mg</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Zinc (Zn)</span>
                        <span className="font-bold text-white">{cereal.minerals.zincMg} mg</span>
                      </div>
                    </div>
                  </div>

                  {/* Phenolics & ANF badge */}
                  <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-purple-300">
                      🌿 Phenolics: {cereal.phenolics.totalPhenolicsMgGae} mg GAE
                    </span>
                    <span className="text-rose-300">
                      🛡️ Phytate: {cereal.antinutrients.phyticAcidMgPer100g} mg
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCereal(cereal)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Deep Biochemical & Amino Acid Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 3: CEREAL COMPARISON MATRIX
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "compare" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Side-by-Side Cereal Nutritional Matrix</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Compare proximate composition, mineral density, amino acids, phenolics, and antinutritional factors across staple Ethiopian grains.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.slice(0, 6).map((grain) => {
                  const isSelected = compareGrains.includes(grain.id);
                  return (
                    <button
                      key={grain.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          if (compareGrains.length > 2) {
                            setCompareGrains(compareGrains.filter((id) => id !== grain.id));
                          }
                        } else {
                          if (compareGrains.length < 5) {
                            setCompareGrains([...compareGrains, grain.id]);
                          }
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-sky-500 text-black shadow-md shadow-sky-500/20"
                          : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {grain.nameEn.split(" ")[0]} ({grain.nameAmharic})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto pt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 font-mono uppercase text-slate-400 bg-zinc-900/60 rounded-l-xl">
                      Biochemical Parameter (per 100g)
                    </th>
                    {compareGrains.map((gid) => {
                      const g = ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((item) => item.id === gid);
                      if (!g) return null;
                      return (
                        <th key={gid} className="py-3 px-4 font-bold text-white bg-zinc-900/60">
                          <div>{g.nameEn}</div>
                          <div className="text-[11px] font-serif text-amber-400 font-normal">{g.nameAmharic}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="bg-emerald-950/10 font-bold text-emerald-300">
                    <td className="py-2.5 px-4">PROXIMATE: Crude Protein (g)</td>
                    {compareGrains.map((gid) => (
                      <td key={gid} className="py-2.5 px-4 font-mono">
                        {ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((item) => item.id === gid)?.proximate.proteinG} g
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-300">Total Dietary Fiber (g)</td>
                    {compareGrains.map((gid) => (
                      <td key={gid} className="py-2 px-4 font-mono text-amber-300 font-semibold">
                        {ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((item) => item.id === gid)?.proximate.dietaryFiberG} g
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-300">Available Carbohydrates (g)</td>
                    {compareGrains.map((gid) => (
                      <td key={gid} className="py-2 px-4 font-mono text-slate-200">
                        {ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((item) => item.id === gid)?.proximate.carbohydrateG} g
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-300">Energy (kcal)</td>
                    {compareGrains.map((gid) => (
                      <td key={gid} className="py-2 px-4 font-mono text-slate-200">
                        {ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((item) => item.id === gid)?.proximate.energyKcal} kcal
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-sky-950/15 font-bold text-sky-300">
                    <td className="py-2.5 px-4">MINERAL: Iron (Fe mg)</td>
                    {compareGrains.map((gid) => {
                      const fe = ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((item) => item.id === gid)?.minerals.ironMg;
                      return (
                        <td key={gid} className="py-2.5 px-4 font-mono">
                          <span className={fe && fe > 10 ? "text-amber-400 font-extrabold" : ""}>
                            {fe} mg
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-300">Calcium (Ca mg)</td>
                    {compareGrains.map((gid) => {
                      const ca = ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((item) => item.id === gid)?.minerals.calciumMg;
                      return (
                        <td key={gid} className="py-2 px-4 font-mono text-slate-200">
                          <span className={ca && ca > 200 ? "text-emerald-400 font-extrabold" : ""}>
                            {ca} mg
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-300">Zinc (Zn mg)</td>
                    {compareGrains.map((gid) => (
                      <td key={gid} className="py-2 px-4 font-mono text-slate-200">
                        {ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((item) => item.id === gid)?.minerals.zincMg} mg
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-purple-950/15 font-bold text-purple-300">
                    <td className="py-2.5 px-4">AMINO ACIDS: Methionine (g/100g Pro)</td>
                    {compareGrains.map((gid) => (
                      <td key={gid} className="py-2.5 px-4 font-mono text-slate-200">
                        {ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((item) => item.id === gid)?.aminoAcids.methionine} g
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-300">Lysine (g/100g Pro)</td>
                    {compareGrains.map((gid) => (
                      <td key={gid} className="py-2 px-4 font-mono text-slate-200">
                        {ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((item) => item.id === gid)?.aminoAcids.lysine} g
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-amber-950/15 font-bold text-amber-300">
                    <td className="py-2.5 px-4">BIOACTIVES: Total Phenolics (mg GAE)</td>
                    {compareGrains.map((gid) => (
                      <td key={gid} className="py-2.5 px-4 font-mono text-slate-200">
                        {ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((item) => item.id === gid)?.phenolics.totalPhenolicsMgGae} mg
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-rose-950/15 font-bold text-rose-300">
                    <td className="py-2.5 px-4">ANTINUTRIENT: Phytic Acid (mg/100g)</td>
                    {compareGrains.map((gid) => (
                      <td key={gid} className="py-2.5 px-4 font-mono text-slate-200">
                        {ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((item) => item.id === gid)?.antinutrients.phyticAcidMgPer100g} mg
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-300">Phytate:Fe Molar Ratio (Raw)</td>
                    {compareGrains.map((gid) => {
                      const g = ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.find((item) => item.id === gid);
                      const ratio = g ? calculatePhytateMineralRatio(g.antinutrients.phyticAcidMgPer100g, g.minerals.ironMg, 55.85) : 0;
                      return (
                        <td key={gid} className="py-2 px-4 font-mono">
                          <span className={ratio > 5 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                            {ratio.toFixed(2)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 4: ANTINUTRITIONAL FACTOR (ANF) DEGRADATION LAB
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "anf_lab" && (
        <div className="space-y-6">
          <div className="p-7 rounded-3xl bg-zinc-950 border border-purple-500/30 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="badge badge-safe mb-2">Biochemical Kinetics Simulator</div>
                <h3 className="text-2xl font-bold text-white">
                  Indigenous Processing &amp; Mineral Liberation Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Test how ancestral preparation—such as 4-day Ersho lactic fermentation, soaking, roasting, or germination—breaks down phytic acid and condensed tannins to lower the Phytate:Iron molar ratio into the bioavailable zone (&lt; 1.0).
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-slate-400 font-bold">
                  Select Raw Grain / Pulse:
                </label>
                <select
                  value={labGrainId}
                  onChange={(e) => setLabGrainId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-sm text-white outline-none focus:border-purple-500"
                >
                  {ETHIOPIAN_RAW_CEREALS_AND_MATERIALS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nameEn} ({g.nameAmharic}) — Native Phytate: {g.antinutrients.phyticAcidMgPer100g} mg/100g
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-slate-400 font-bold">
                  Select Indigenous Preparation Method:
                </label>
                <select
                  value={labMethod}
                  onChange={(e) => setLabMethod(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="fermentation_4day">4-Day Ersho Lactic Fermentation (ማብላላት - 77% breakdown)</option>
                  <option value="fermentation_2day">2-Day Short Fermentation (58% breakdown)</option>
                  <option value="soaking_24h">24-Hour Soaking &amp; Water Discard (መዘፍዘፍ - 45% breakdown)</option>
                  <option value="roasting">Clay Griddle Roasting / Maqtet (ማመስ - 38% breakdown)</option>
                  <option value="boiling">Thermal Boiling / Steaming (መቀቀል - 32% breakdown)</option>
                </select>
              </div>
            </div>

            {/* Results Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="text-[10px] uppercase font-mono text-slate-400">Native Raw Phytic Acid</div>
                <div className="text-2xl font-black text-rose-400 mt-1">
                  {activeLabGrain.antinutrients.phyticAcidMgPer100g} <span className="text-xs font-normal">mg/100g</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Bound to non-heme iron and zinc</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30">
                <div className="text-[10px] uppercase font-mono text-slate-400">Residual Phytic Acid</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {labBioavailability.residualPhytateMg} <span className="text-xs font-normal">mg/100g</span>
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-1">
                  -{labBioavailability.degradationPct}% degraded
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-sky-500/30">
                <div className="text-[10px] uppercase font-mono text-slate-400">Phytate:Fe Molar Ratio</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base text-slate-500 line-through font-mono">
                    {nativePhytateFeRatio.toFixed(2)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                  <span className={`text-2xl font-black font-mono ${cookedPhytateFeRatio < 1.0 ? "text-emerald-400" : "text-sky-300"}`}>
                    {cookedPhytateFeRatio.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] text-sky-400/80 mt-1">
                  {cookedPhytateFeRatio < 1.0 ? "Target reached (< 1.0 ideal)" : "Substantially improved"}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30">
                <div className="text-[10px] uppercase font-mono text-slate-400">Bioavailability Multiplier</div>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  &times;{labBioavailability.ironBioavailabilityMultiplier}
                </div>
                <div className="text-[11px] text-amber-300/80 mt-1">
                  Iron uptake elevated by +{Math.round((labBioavailability.ironBioavailabilityMultiplier - 1) * 100)}%
                </div>
              </div>
            </div>

            {/* Scientific Explanation */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
              <strong className="text-purple-300 block mb-1">Indigenous Biochemical Mechanism:</strong>
              {activeLabGrain.antinutrients.traditionalProcessingImpact.biochemicalMechanism}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 5: ORIGINAL EFCT DATABASE VIEW
         ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "efct_foods" && efctDbFoods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {efctDbFoods.map((food: any) => (
            <div key={food.id} className="glass-panel p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{food.name}</h3>
                    <div className="text-xs text-amber-400 font-medium mt-0.5">{food.nameAmharic}</div>
                  </div>
                  <span className="badge badge-safe text-[10px] whitespace-nowrap">{food.category}</span>
                </div>
                {food.traditionalPreparation && (
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5 text-xs text-slate-300 leading-relaxed mb-4">
                    <strong className="text-emerald-400 block mb-0.5">Traditional Preparation:</strong>
                    {food.traditionalPreparation}
                  </div>
                )}
                {food.nutrients && food.nutrients.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    {food.nutrients.map((nut: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white/[0.02]">
                        <span className="text-slate-300">{nut.name}</span>
                        <span className="font-mono font-semibold text-white">
                          {nut.amount} {nut.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          RECIPE INSPECTION MODAL / DRAWER
         ════════════════════════════════════════════════════════════════════ */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-zinc-950 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            <button
              type="button"
              onClick={() => setSelectedRecipe(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="badge badge-safe mb-2">Traditional Recipe Formulation</div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedRecipe.nameEn}</h2>
              <div className="text-sm font-serif text-amber-400 mt-0.5">{selectedRecipe.nameAmharic}</div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedRecipe.description}</p>
            </div>

            {/* Ingredients breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Ingredients &amp; Raw Material Formulations:
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">
                        {ing.nameEn} ({ing.nameAmharic})
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-emerald-400 font-bold">{ing.amountGrams}g</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                          {ing.percentageOfTotal}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">{ing.role}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Composite Proximate Composition */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Cooked Dish Proximate Composition (per 100g):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Energy</div>
                  <div className="text-lg font-bold text-white mt-1">{selectedRecipe.compositeProximate.energyKcal} kcal</div>
                  <div className="text-[10px] text-slate-500">{selectedRecipe.compositeProximate.energyKj} kJ</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Protein</div>
                  <div className="text-lg font-bold text-emerald-300 mt-1">{selectedRecipe.compositeProximate.proteinG}g</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Fat</div>
                  <div className="text-lg font-bold text-amber-300 mt-1">{selectedRecipe.compositeProximate.fatG}g</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Carbohydrates</div>
                  <div className="text-lg font-bold text-sky-300 mt-1">{selectedRecipe.compositeProximate.carbohydrateG}g</div>
                </div>
              </div>
            </div>

            {/* Traditional Method Steps */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Traditional Culinary Preparation &amp; Method:
              </h4>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                {selectedRecipe.traditionalMethodSteps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="text-white">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Complementation notes */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
              <strong className="text-emerald-300 block mb-1">Protein Complementation &amp; Mineral Uptake:</strong>
              {selectedRecipe.proteinComplementationNotes}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          CEREAL RAW MATERIAL DETAIL MODAL / DRAWER
         ════════════════════════════════════════════════════════════════════ */}
      {selectedCereal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-zinc-950 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            <button
              type="button"
              onClick={() => setSelectedCereal(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="badge badge-safe mb-2">Raw Cereal &amp; Grain Biochemistry</div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedCereal.nameEn}</h2>
              <div className="text-sm font-serif text-amber-400 mt-0.5">{selectedCereal.nameAmharic}</div>
              <div className="text-xs font-mono text-slate-500 italic mt-0.5">{selectedCereal.scientificName}</div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {selectedCereal.partUsed} · Ecology: {selectedCereal.growingEcology}
              </p>
            </div>

            {/* Complete Proximate Composition (per 100g) */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                1. Proximate Composition &amp; Energy (per 100g dry matter):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Crude Protein</div>
                  <div className="text-base font-bold text-emerald-300 mt-1">{selectedCereal.proximate.proteinG} g</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Crude Fat / Lipids</div>
                  <div className="text-base font-bold text-amber-300 mt-1">{selectedCereal.proximate.fatG} g</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Available Carbs</div>
                  <div className="text-base font-bold text-sky-300 mt-1">{selectedCereal.proximate.carbohydrateG} g</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Dietary Fiber</div>
                  <div className="text-base font-bold text-purple-300 mt-1">{selectedCereal.proximate.dietaryFiberG} g</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Total Ash</div>
                  <div className="text-base font-bold text-slate-200 mt-1">{selectedCereal.proximate.ashG} g</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Moisture</div>
                  <div className="text-base font-bold text-slate-200 mt-1">{selectedCereal.proximate.moistureG} g</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 col-span-2">
                  <div className="text-[10px] font-mono uppercase text-slate-500">Gross Energy</div>
                  <div className="text-base font-bold text-white mt-1">
                    {selectedCereal.proximate.energyKcal} kcal ({selectedCereal.proximate.energyKj} kJ)
                  </div>
                </div>
              </div>
            </div>

            {/* Minerals & Vitamins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-sky-300 font-bold">
                  2. Mineral Composition (per 100g):
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-500">Iron (Fe):</span> <strong className="text-white">{selectedCereal.minerals.ironMg} mg</strong></div>
                  <div><span className="text-slate-500">Calcium (Ca):</span> <strong className="text-white">{selectedCereal.minerals.calciumMg} mg</strong></div>
                  <div><span className="text-slate-500">Zinc (Zn):</span> <strong className="text-white">{selectedCereal.minerals.zincMg} mg</strong></div>
                  <div><span className="text-slate-500">Magnesium (Mg):</span> <strong className="text-white">{selectedCereal.minerals.magnesiumMg} mg</strong></div>
                  <div><span className="text-slate-500">Phosphorus (P):</span> <strong className="text-white">{selectedCereal.minerals.phosphorusMg} mg</strong></div>
                  <div><span className="text-slate-500">Potassium (K):</span> <strong className="text-white">{selectedCereal.minerals.potassiumMg} mg</strong></div>
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                  3. Vitamin Profile:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-500">Thiamin (B1):</span> <strong className="text-white">{selectedCereal.vitamins.thiaminB1Mg || "—"} mg</strong></div>
                  <div><span className="text-slate-500">Riboflavin (B2):</span> <strong className="text-white">{selectedCereal.vitamins.riboflavinB2Mg || "—"} mg</strong></div>
                  <div><span className="text-slate-500">Niacin (B3):</span> <strong className="text-white">{selectedCereal.vitamins.niacinB3Mg || "—"} mg</strong></div>
                  <div><span className="text-slate-500">Folate (B9):</span> <strong className="text-white">{selectedCereal.vitamins.folateB9Mcg || "—"} mcg</strong></div>
                </div>
              </div>
            </div>

            {/* Amino Acid Profile */}
            <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                4. Essential Amino Acid Profile (g per 100g protein):
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono">
                <div className="p-2 rounded-xl bg-white/[0.02]">
                  <span className="text-slate-500 block text-[10px]">Lysine</span>
                  <span className="text-white font-bold">{selectedCereal.aminoAcids.lysine}g</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02]">
                  <span className="text-slate-500 block text-[10px]">Methionine</span>
                  <span className="text-white font-bold">{selectedCereal.aminoAcids.methionine}g</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02]">
                  <span className="text-slate-500 block text-[10px]">Cysteine</span>
                  <span className="text-white font-bold">{selectedCereal.aminoAcids.cysteine}g</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02]">
                  <span className="text-slate-500 block text-[10px]">Threonine</span>
                  <span className="text-white font-bold">{selectedCereal.aminoAcids.threonine}g</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02]">
                  <span className="text-slate-500 block text-[10px]">Tryptophan</span>
                  <span className="text-white font-bold">{selectedCereal.aminoAcids.tryptophan}g</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.02]">
                  <span className="text-slate-500 block text-[10px]">Leucine</span>
                  <span className="text-white font-bold">{selectedCereal.aminoAcids.leucine}g</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Limiting Amino Acid: <strong className="text-amber-300">{selectedCereal.aminoAcids.limitingAminoAcid}</strong>
                {selectedCereal.aminoAcids.proteinComplementationPartner && (
                  <span> · Complements with: <strong className="text-emerald-300">{selectedCereal.aminoAcids.proteinComplementationPartner}</strong></span>
                )}
              </div>
            </div>

            {/* Phenolics & Antinutrients */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20">
                <h4 className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold">
                  5. Phenolic Bioactives &amp; Antioxidants:
                </h4>
                <div className="space-y-1 text-xs">
                  <div>Total Phenolics: <strong className="text-white">{selectedCereal.phenolics.totalPhenolicsMgGae} mg GAE/100g</strong></div>
                  <div>Total Flavonoids: <strong className="text-white">{selectedCereal.phenolics.totalFlavonoidsMgQe} mg QE/100g</strong></div>
                  <div>Antioxidant DPPH: <strong className="text-white">{selectedCereal.phenolics.antioxidantCapacityDpphPct || "—"}%</strong></div>
                  <div className="text-[11px] text-purple-200 mt-2">{selectedCereal.phenolics.keyBioactives.join(", ")}</div>
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20">
                <h4 className="text-xs font-mono uppercase tracking-wider text-rose-300 font-bold">
                  6. Antinutritional Factors &amp; Kinetics:
                </h4>
                <div className="space-y-1 text-xs">
                  <div>Phytic Acid: <strong className="text-white">{selectedCereal.antinutrients.phyticAcidMgPer100g} mg/100g</strong></div>
                  <div>Condensed Tannins: <strong className="text-white">{selectedCereal.antinutrients.condensedTanninsMgPer100g} mg/100g</strong></div>
                  <div>Total Oxalates: <strong className="text-white">{selectedCereal.antinutrients.totalOxalatesMgPer100g} mg/100g</strong></div>
                  <div>Phytate:Fe Molar Ratio: <strong className="text-rose-300">{selectedCereal.antinutrients.phytateToIronMolarRatio.toFixed(2)}</strong></div>
                  <div className="text-[11px] text-rose-200 mt-2">
                    Fermentation degrades {selectedCereal.antinutrients.traditionalProcessingImpact.fermentationReductionPct}% of phytates, delivering a &times;{selectedCereal.antinutrients.traditionalProcessingImpact.bioavailabilityMultiplier} mineral bioavailability uplift.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
