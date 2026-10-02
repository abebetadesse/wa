"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ETHIOPIAN_COMPOSITE_DIETS,
  PURPOSE_CONFIGS,
  ENZYME_REACTION_CONFIGS,
  formulateCompositeDiet,
  type UserPurpose,
  type EconomicTier,
  type EnzymeReactionType,
  type EthiopianCompositeDiet,
} from "@/lib/nutrition/compositeDietFormulator";

type RecipeScaleTab = "serving" | "day" | "month";
type NutrientTableTab = "proximate" | "aminoAcids" | "fattyAcids" | "minerals" | "vitamins";

export default function CompositeDietFormulatorPage() {
  // Formulation state
  const [selectedDietId, setSelectedDietId] = useState<string>("yetsom-beyayinetu");
  const [selectedPurpose, setSelectedPurpose] = useState<UserPurpose>("weight_loss");
  const [selectedEconomicTier, setSelectedEconomicTier] = useState<EconomicTier>("standard");
  const [selectedEnzyme, setSelectedEnzyme] = useState<EnzymeReactionType>("ersho_phytase_96h");

  // View state
  const [recipeTab, setRecipeTab] = useState<RecipeScaleTab>("serving");
  const [nutrientTab, setNutrientTab] = useState<NutrientTableTab>("proximate");
  const [showAmharicSteps, setShowAmharicSteps] = useState<boolean>(true);

  // Computed formulation
  const formulated = useMemo(() => {
    return formulateCompositeDiet(
      selectedDietId,
      selectedPurpose,
      selectedEconomicTier,
      selectedEnzyme
    );
  }, [selectedDietId, selectedPurpose, selectedEconomicTier, selectedEnzyme]);

  const { diet, purposeConfig, enzymeReaction, perServing, perDay, perMonth, enzymeBioavailabilitySummary, personalizedHealthNote } = formulated;

  return (
    <main className="min-h-screen bg-[#070a08] text-stone-200">
      {/* ───────────────── HEADER / HERO ───────────────── */}
      <header className="relative overflow-hidden border-b border-emerald-500/15 bg-gradient-to-br from-[#0c1a12] via-[#09130d] to-[#060a08] px-6 py-12 md:py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/foods"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/20"
              >
                ← Back to Food Science Library
              </Link>
              <Link
                href="/foods/dynamic-formulator"
                className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-400/10 px-3.5 py-1.5 text-xs font-semibold text-teal-300 transition-colors hover:bg-teal-400/20"
              >
                🎛️ Custom Proximate & Dynamic Formulator →
              </Link>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              ⚖️ Precision Diet & Recipe Formulator
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
            Ethiopian Composite Diet & <br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
              Best Recipe Formulator
            </span>
          </h1>
          <p className="mt-2 text-lg text-emerald-400 font-serif">የተመጣጠነ ቅይጥ ምግብ እና ምርጥ ቀመር አስሊ</p>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-400 md:text-base">
            Select iconic traditional Ethiopian composite diets (including the revered <em>Yetsom Beyayinetu</em> platter)
            and calibrate them to your exact physiological goal — weight loss, muscle synthesis, glycemic control, or postpartum recovery.
            Calculates scaled recipes <strong>per serving</strong>, <strong>per day</strong>, and <strong>per month</strong> with complete
            amino acid score, fatty acid chains, bioavailable minerals, and enzyme reactions.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
        {/* ───────────────── CONTROLS PANEL ───────────────── */}
        <section aria-labelledby="formulator-controls" className="grid gap-6 lg:grid-cols-12">
          {/* 1. Diet Selection (Column span 4) */}
          <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 backdrop-blur-xl lg:col-span-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 id="formulator-controls" className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                1. Select Ethiopian Diet (ምግብ ምረጥ)
              </h2>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-300">
                {ETHIOPIAN_COMPOSITE_DIETS.length} Diets
              </span>
            </div>

            <p className="mt-2 text-xs text-stone-400">
              Choose from traditional composite platters, nutrient stews, and ancestral functional drinks:
            </p>

            <div className="mt-4 max-h-[380px] space-y-2 overflow-y-auto pr-1">
              {ETHIOPIAN_COMPOSITE_DIETS.map((d) => {
                const isSelected = d.id === selectedDietId;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDietId(d.id)}
                    className={`w-full rounded-2xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-950/40 shadow-[0_0_20px_rgba(52,211,153,0.15)] ring-1 ring-emerald-400"
                        : "border-white/5 bg-black/30 hover:border-white/20 hover:bg-stone-800/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-white">{d.nameEn}</div>
                        <div className="text-xs font-medium text-amber-400">{d.nameAmharic}</div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${
                          d.isFasting ? "bg-teal-500/20 text-teal-300" : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {d.isFasting ? "Fasting (የጾም)" : "Non-Fasting"}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-stone-400">
                      {d.tagline}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-stone-500">
                      <span>{d.ingredients.length} ingredients</span>
                      <span>~{d.nutrients.proximate.energyKcal} kcal / serving</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Purpose & Cofactors Configuration (Column span 8) */}
          <div className="space-y-6 lg:col-span-8">
            {/* Purpose Selector */}
            <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                  2. Purpose of Diet Formulation (የቀመር ዓላማ)
                </h2>
                <span className="text-xs text-stone-400">Calibrates macros, fibers & serving scales</span>
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {(Object.entries(PURPOSE_CONFIGS) as [UserPurpose, (typeof PURPOSE_CONFIGS)[UserPurpose]][]).map(
                  ([key, cfg]) => {
                    const isSelected = key === selectedPurpose;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedPurpose(key)}
                        className={`rounded-2xl border p-3 text-left transition-all ${
                          isSelected
                            ? "border-amber-400 bg-amber-950/30 text-white shadow-[0_0_15px_rgba(251,191,36,0.15)] ring-1 ring-amber-400"
                            : "border-white/5 bg-black/30 text-stone-400 hover:border-white/15 hover:text-stone-200"
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight text-white">{cfg.titleEn}</div>
                        <div className="mt-0.5 text-[11px] text-amber-400">{cfg.titleAmharic}</div>
                        <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-stone-400">{cfg.description}</p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Cofactors: Economic Tier & Enzyme Reaction */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Economic Tier */}
              <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 backdrop-blur-xl">
                <div className="border-b border-white/10 pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    Economic Factor (የኢኮኖሚ አቅም ደረጃ)
                  </h3>
                  <p className="mt-0.5 text-[11px] text-stone-400">Adjusts ingredient basket tiers & budget</p>
                </div>

                <div className="mt-3.5 space-y-2">
                  {[
                    {
                      id: "economy" as const,
                      title: "Economy / Budget Staples",
                      amharic: "ተመጣጣኝ / ቆጣቢ",
                      desc: "Brown teff, field peas, shiro, collards, seasonal veg, vegetable oil (~95 ETB/meal).",
                      badge: "Low Cost",
                    },
                    {
                      id: "standard" as const,
                      title: "Standard / Balanced",
                      amharic: "መካከለኛ የተመጣጠነ",
                      desc: "Mixed/white teff, split lentils, eggs, sunflower oil, fresh market produce (~155 ETB/meal).",
                      badge: "Balanced",
                    },
                    {
                      id: "premium" as const,
                      title: "Premium Tier / Whole Organics",
                      amharic: "ከፍተኛ ጥራት / የተሟላ",
                      desc: "Magna teff, organic niter kibbeh, pasture poultry/beef, ayib, moringa, pure honey (~240 ETB/meal).",
                      badge: "Artisanal",
                    },
                  ].map((tier) => {
                    const isSelected = selectedEconomicTier === tier.id;
                    return (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedEconomicTier(tier.id)}
                        className={`w-full rounded-2xl border p-3 text-left transition-all ${
                          isSelected
                            ? "border-sky-400 bg-sky-950/30 text-white shadow-[0_0_15px_rgba(56,189,248,0.15)] ring-1 ring-sky-400"
                            : "border-white/5 bg-black/30 text-stone-400 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{tier.title}</span>
                          <span className="text-[10px] font-semibold text-sky-300">{tier.amharic}</span>
                        </div>
                        <p className="mt-1 text-[10px] text-stone-400">{tier.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Enzyme Reaction & Bioavailability */}
              <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 backdrop-blur-xl">
                <div className="border-b border-white/10 pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    Enzyme Reaction & Bioavailability (የኢንዛይም እንቅስቃሴ)
                  </h3>
                  <p className="mt-0.5 text-[11px] text-stone-400">Phytase degradation, germination & reduction</p>
                </div>

                <div className="mt-3.5 space-y-2">
                  {(Object.entries(ENZYME_REACTION_CONFIGS) as [EnzymeReactionType, (typeof ENZYME_REACTION_CONFIGS)[EnzymeReactionType]][]).map(
                    ([key, enz]) => {
                      const isSelected = selectedEnzyme === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedEnzyme(key)}
                          className={`w-full rounded-2xl border p-2.5 text-left transition-all ${
                            isSelected
                              ? "border-violet-400 bg-violet-950/30 text-white shadow-[0_0_15px_rgba(167,139,250,0.15)] ring-1 ring-violet-400"
                              : "border-white/5 bg-black/30 text-stone-400 hover:border-white/15"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold text-white">{enz.titleEn}</span>
                            <span className="shrink-0 text-[10px] font-mono font-semibold text-violet-300">
                              {enz.phytateReductionPct > 0 ? `-${enz.phytateReductionPct}% Phytate` : "Baseline"}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-1 text-[10px] text-stone-400">{enz.mechanism}</p>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────── RESULTS SECTION: RECIPE SCALES & NUTRIENT TABLES ───────────────── */}
        <section aria-labelledby="formulation-results" className="mt-10 space-y-8">
          {/* Header banner of current formulation */}
          <div className="overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-stone-900 to-amber-950/20 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Formulation Recipe Output · የቀመር ውጤት
                </span>
                <h2 id="formulation-results" className="mt-1 text-2xl font-black text-white md:text-3xl">
                  {diet.nameEn}
                </h2>
                <div className="mt-0.5 text-base font-semibold text-amber-400">{diet.nameAmharic}</div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-emerald-300">
                  <span className="text-stone-400">Target:</span> <strong>{purposeConfig.titleEn}</strong>
                </div>
                <div className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-sky-300 capitalize">
                  <span className="text-stone-400">Tier:</span> <strong>{selectedEconomicTier}</strong>
                </div>
                <div className="rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-violet-300">
                  <span className="text-stone-400">Enzyme:</span> <strong>{enzymeReaction.titleAmharic}</strong>
                </div>
              </div>
            </div>

            {/* Quick summary stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
              <div className="rounded-2xl border border-white/5 bg-black/40 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-stone-500">Per Serving Energy</div>
                <div className="mt-1 font-mono text-xl font-bold text-amber-300">
                  {perServing.nutrients.proximate.energyKcal} <span className="text-xs text-stone-400">kcal</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/40 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-stone-500">Protein (Serving)</div>
                <div className="mt-1 font-mono text-xl font-bold text-sky-300">
                  {perServing.nutrients.proximate.protein_g} <span className="text-xs text-stone-400">g</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/40 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-stone-500">Amino Acid Score</div>
                <div className="mt-1 font-mono text-xl font-bold text-emerald-300">
                  {perServing.nutrients.aminoAcids.aminoAcidScorePct}%
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/40 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-stone-500">Bioavailable Iron</div>
                <div className="mt-1 font-mono text-xl font-bold text-rose-300">
                  {perServing.nutrients.minerals.bioavailableIron_mg} <span className="text-xs text-stone-400">mg</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/40 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-stone-500">Daily Servings</div>
                <div className="mt-1 font-mono text-xl font-bold text-violet-300">
                  {perDay.servingsCount} <span className="text-xs text-stone-400">meals/day</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/40 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-stone-500">30-Day Budget</div>
                <div className="mt-1 font-mono text-xl font-bold text-yellow-300">
                  ETB {perMonth.totalMonthlyCostETB.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* ───────────────── RECIPE BREAKDOWN TABS: SERVING / DAY / MONTH ───────────────── */}
          <div className="rounded-3xl border border-white/10 bg-stone-900/50 p-6 md:p-8 backdrop-blur-xl">
            {/* Scale Tab switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex rounded-2xl border border-white/10 bg-black/40 p-1">
                {[
                  { id: "serving" as const, label: "🍽️ Per Serving (በአንድ ማዕድ)", desc: `${perServing.servingMassGrams}g portion` },
                  { id: "day" as const, label: "📅 Per Day (በቀን)", desc: `${perDay.servingsCount} servings · ${perDay.totalDailyMassGrams}g` },
                  { id: "month" as const, label: "🛒 Per Month (በወር)", desc: "30-day bulk pantry plan" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setRecipeTab(t.id)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      recipeTab === t.id
                        ? "bg-emerald-500 text-black shadow-lg"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    <div>{t.label}</div>
                    <div className="text-[9px] font-normal opacity-80">{t.desc}</div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-stone-400">
                  <input
                    type="checkbox"
                    checked={showAmharicSteps}
                    onChange={(e) => setShowAmharicSteps(e.target.checked)}
                    className="rounded border-white/20 bg-stone-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Show Amharic Instructions (የአዘገጃጀት ቅደም ተከተል)</span>
                </label>
              </div>
            </div>

            {/* TAB 1: PER SERVING */}
            {recipeTab === "serving" && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Ingredients Table */}
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <div className="border-b border-white/10 bg-stone-800/40 px-4 py-3 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Scaled Recipe Ingredients · 1 Serving ({perServing.servingMassGrams}g Assembled)
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-white/5 bg-black/40 text-[10px] uppercase text-stone-500">
                        <tr>
                          <th className="px-4 py-2.5">Component / Ingredient</th>
                          <th className="px-4 py-2.5 text-right">Mass (g)</th>
                          <th className="px-4 py-2.5">Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-stone-300">
                        {perServing.ingredients.map((ing) => (
                          <tr key={ing.id} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-2.5">
                              <div className="font-semibold text-white">{ing.nameEn}</div>
                              <div className="text-[11px] text-amber-400">{ing.nameAmharic}</div>
                              {ing.notes && <div className="text-[10px] text-stone-500">{ing.notes}</div>}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-300">
                              {ing.grams} g
                            </td>
                            <td className="px-4 py-2.5 capitalize text-stone-400">{ing.category}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t border-white/10 bg-black/50 text-xs font-bold text-white">
                        <tr>
                          <td className="px-4 py-3">Total Serving Mass & Cost</td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-300">
                            {perServing.servingMassGrams} g
                          </td>
                          <td className="px-4 py-3 text-amber-300">
                            ~ETB {perServing.estimatedCostETB}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Culinary Preparation Steps */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs font-bold uppercase tracking-wider text-amber-400">
                      <span>Culinary Method & Timing</span>
                      <span className="font-mono text-stone-400">
                        Prep: {perServing.prepInstructions.prepTimeMinutes}m | Cook: {perServing.prepInstructions.cookTimeMinutes}m
                      </span>
                    </div>

                    <div className="mt-4 space-y-3 text-xs">
                      {perServing.prepInstructions.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-[10px] font-bold text-emerald-300">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-stone-300 leading-relaxed">{step}</p>
                            {showAmharicSteps && perServing.prepInstructions.amharicSteps[idx] && (
                              <p className="mt-1 text-[11px] text-amber-300/90 leading-relaxed font-serif">
                                {perServing.prepInstructions.amharicSteps[idx]}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {perServing.prepInstructions.culinaryTips.length > 0 && (
                      <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-950/20 p-3.5 text-xs text-stone-300">
                        <strong className="block text-emerald-300 mb-1">💡 Biochemical Chef's Tip:</strong>
                        <ul className="list-inside list-disc space-y-1 text-[11px] text-stone-400">
                          {perServing.prepInstructions.culinaryTips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PER DAY */}
            {recipeTab === "day" && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-6 lg:grid-cols-12">
                  {/* Daily Schedule Timetable (Col 5) */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5 lg:col-span-5">
                    <h3 className="border-b border-white/10 pb-2.5 text-xs font-bold uppercase tracking-wider text-sky-400">
                      Daily Meal Schedule & Distribution ({perDay.servingsCount} Meals/Day)
                    </h3>

                    <div className="mt-4 space-y-4">
                      {perDay.mealDistribution.map((m, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/5 bg-stone-900/60 p-3.5">
                          <div className="flex items-center justify-between text-xs font-bold text-white">
                            <span>{m.mealName}</span>
                            <span className="text-amber-400 font-serif">{m.amharicName}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-stone-400">
                            <span>🕒 {m.timeOfDay}</span>
                            <span className="text-emerald-300">{m.grams}g · {m.caloriesKcal} kcal</span>
                          </div>
                          <p className="mt-2 text-[11px] text-stone-400 leading-relaxed">{m.suggestion}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-xl border border-white/5 bg-black/40 p-3 text-xs">
                      <div className="flex justify-between text-stone-400">
                        <span>Total Daily Food Mass:</span>
                        <strong className="font-mono text-white">{perDay.totalDailyMassGrams} g</strong>
                      </div>
                      <div className="mt-1 flex justify-between text-stone-400">
                        <span>Estimated Daily Budget:</span>
                        <strong className="font-mono text-amber-300">~ETB {perDay.estimatedDailyCostETB}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Adequacy vs Reference Daily Intake (RDI) (Col 7) */}
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5 lg:col-span-7">
                    <h3 className="border-b border-white/10 pb-2.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Daily Nutrient Adequacy vs. Reference Intake (RDI)
                    </h3>

                    <div className="mt-4 space-y-3.5">
                      {Object.entries(perDay.adequacyVsRDI).map(([key, item]) => {
                        const pct = Math.min(150, item.percent);
                        const isOptimal = pct >= 90 && pct <= 130;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between text-xs">
                              <span className="capitalize font-semibold text-stone-300">{key}</span>
                              <span className="font-mono text-[11px] text-stone-400">
                                <strong className="text-white">{item.actual}</strong> / {item.target} ({item.percent}%)
                              </span>
                            </div>
                            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-800">
                              <div
                                style={{ width: `${Math.min(100, (pct / 120) * 100)}%` }}
                                className={`h-full rounded-full transition-all ${
                                  pct < 70
                                    ? "bg-rose-500"
                                    : isOptimal
                                      ? "bg-emerald-400"
                                      : "bg-amber-400"
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PER MONTH */}
            {recipeTab === "month" && (
              <div className="mt-6 space-y-6">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                        30-Day Bulk Procurement & Raw Pantry Guide
                      </h3>
                      <p className="mt-0.5 text-xs text-stone-400">
                        Calculates raw dry grain, pulse, oil, and vegetable weights needed for 30 consecutive days.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-stone-500">Estimated 30-Day Budget</div>
                      <div className="font-mono text-2xl font-black text-amber-300">
                        ETB {perMonth.totalMonthlyCostETB.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-white/5 bg-black/40 text-[10px] uppercase text-stone-500">
                        <tr>
                          <th className="px-4 py-2.5">Pantry Staple Item</th>
                          <th className="px-4 py-2.5 text-right">30-Day Supply</th>
                          <th className="px-4 py-2.5 text-right">Estimated Cost (ETB)</th>
                          <th className="px-4 py-2.5">Traditional Storage & Preservation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-stone-300">
                        {perMonth.bulkPantryItems.map((item, i) => (
                          <tr key={i} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white">{item.nameEn}</div>
                              <div className="text-[11px] text-amber-400">{item.nameAmharic}</div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-emerald-300">
                              {item.totalKgOrLiters} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-amber-300">
                              ~ETB {item.estimatedCostETB.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-stone-400 leading-relaxed">
                              {item.storageAdvice}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-950/20 p-4 text-xs text-stone-300">
                    <strong className="block text-amber-300 mb-1">🌾 Economic Tier Guidance:</strong>
                    <p className="leading-relaxed text-stone-400">{perMonth.economicGuidance}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ───────────────── INTENSIVE NUTRIENT TABLES ───────────────── */}
          <div className="rounded-3xl border border-white/10 bg-stone-900/50 p-6 md:p-8 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Intensive Nutrient Profile Tables (የንጥረ-ነገሮች ዝርዝር ሠንጠረዥ)
                </h3>
                <p className="text-xs text-stone-400">
                  Comprehensive quantitative tables per single serving portion ({perServing.servingMassGrams}g).
                </p>
              </div>

              {/* Sub-tab switcher */}
              <div className="flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-black/40 p-1">
                {[
                  { id: "proximate" as const, label: "Proximate / Macros", icon: "📊" },
                  { id: "aminoAcids" as const, label: "Amino Acids (12)", icon: "🧬" },
                  { id: "fattyAcids" as const, label: "Fatty Acids & Omega", icon: "💧" },
                  { id: "minerals" as const, label: "Minerals & Bioavail.", icon: "⚗️" },
                  { id: "vitamins" as const, label: "Vitamins Panel", icon: "💊" },
                ].map((nt) => (
                  <button
                    key={nt.id}
                    onClick={() => setNutrientTab(nt.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      nutrientTab === nt.id
                        ? "bg-amber-400 text-black shadow"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    <span>{nt.icon}</span>
                    <span>{nt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TAB: PROXIMATE & MACROS */}
            {nutrientTab === "proximate" && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-black/40 text-[10px] uppercase text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Macronutrient / Fraction</th>
                      <th className="px-4 py-3 text-right">Per Serving</th>
                      <th className="px-4 py-3 text-right">Per Day ({perDay.servingsCount} servings)</th>
                      <th className="px-4 py-3">Reference Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-stone-300">
                    {[
                      { l: "Energy (Calories)", s: `${perServing.nutrients.proximate.energyKcal} kcal`, d: `${perDay.nutrients.proximate.energyKcal} kcal`, note: "Target calibrated to purpose" },
                      { l: "Crude Protein", s: `${perServing.nutrients.proximate.protein_g} g`, d: `${perDay.nutrients.proximate.protein_g} g`, note: "Complementary pulse + teff balance" },
                      { l: "Total Lipids (Fat)", s: `${perServing.nutrients.proximate.fat_g} g`, d: `${perDay.nutrients.proximate.fat_g} g`, note: "Healthy mono & polyunsaturated" },
                      { l: "Total Carbohydrates", s: `${perServing.nutrients.proximate.carbohydrate_g} g`, d: `${perDay.nutrients.proximate.carbohydrate_g} g`, note: "Slow-fermenting complex starches" },
                      { l: "Dietary Fiber", s: `${perServing.nutrients.proximate.dietaryFiber_g} g`, d: `${perDay.nutrients.proximate.dietaryFiber_g} g`, note: "Viscous soluble & resistant starch" },
                      { l: "Moisture Content", s: `${perServing.nutrients.proximate.moisture_g} g`, d: `${perDay.nutrients.proximate.moisture_g} g`, note: "Injera & stew hydration" },
                      { l: "Ash (Total Minerals)", s: `${perServing.nutrients.proximate.ash_g} g`, d: `${perDay.nutrients.proximate.ash_g} g`, note: "Inorganic elemental residue" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-semibold text-white">{row.l}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-amber-300">{row.s}</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-300">{row.d}</td>
                        <td className="px-4 py-3 text-stone-400">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: AMINO ACIDS */}
            {nutrientTab === "aminoAcids" && (
              <div className="mt-6 space-y-6">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-950/20 p-4 text-xs text-stone-300">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-emerald-300">
                      🧬 Complete Protein Synthesis Profile: PDCAAS {perServing.nutrients.aminoAcids.pdcaasEquivalentPct}%
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Limiting Amino Acid: <strong className="text-white">{perServing.nutrients.aminoAcids.limitingAmino}</strong>
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-stone-400 leading-relaxed">
                    Teff grains are naturally rich in sulfur-containing amino acids (Methionine and Cysteine) but modest in Lysine.
                    Legumes (Shiro chickpeas, lentils, split peas) are abundant in Lysine and Threonine but low in Methionine.
                    Combining them creates a biological score equivalent to whole egg or milk protein!
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 bg-black/40 text-[10px] uppercase text-stone-500">
                      <tr>
                        <th className="px-4 py-2.5">Amino Acid</th>
                        <th className="px-4 py-2.5">Type</th>
                        <th className="px-4 py-2.5 text-right">Per Serving (mg)</th>
                        <th className="px-4 py-2.5 text-right">Per Day (mg)</th>
                        <th className="px-4 py-2.5">Primary Physiological Function</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-stone-300">
                      {[
                        { name: "Lysine", type: "Essential (EAA)", s: perServing.nutrients.aminoAcids.lysine_mg, d: perDay.nutrients.aminoAcids.lysine_mg, func: "Collagen synthesis & carnitine energy transport" },
                        { name: "Methionine", type: "Essential (EAA)", s: perServing.nutrients.aminoAcids.methionine_mg, d: perDay.nutrients.aminoAcids.methionine_mg, func: "Methylation, glutathione & antioxidant balance" },
                        { name: "Cysteine", type: "Sulfur / Semi-EAA", s: perServing.nutrients.aminoAcids.cysteine_mg, d: perDay.nutrients.aminoAcids.cysteine_mg, func: "Keratin, hair/skin & hepatic detoxification" },
                        { name: "Leucine", type: "BCAA / Essential", s: perServing.nutrients.aminoAcids.leucine_mg, d: perDay.nutrients.aminoAcids.leucine_mg, func: "Triggers mTOR muscle protein synthesis" },
                        { name: "Isoleucine", type: "BCAA / Essential", s: perServing.nutrients.aminoAcids.isoleucine_mg, d: perDay.nutrients.aminoAcids.isoleucine_mg, func: "Muscle metabolism & endurance stamina" },
                        { name: "Valine", type: "BCAA / Essential", s: perServing.nutrients.aminoAcids.valine_mg, d: perDay.nutrients.aminoAcids.valine_mg, func: "Tissue regeneration & nitrogen balance" },
                        { name: "Threonine", type: "Essential (EAA)", s: perServing.nutrients.aminoAcids.threonine_mg, d: perDay.nutrients.aminoAcids.threonine_mg, func: "Intestinal mucin & immune antibody support" },
                        { name: "Tryptophan", type: "Essential (EAA)", s: perServing.nutrients.aminoAcids.tryptophan_mg, d: perDay.nutrients.aminoAcids.tryptophan_mg, func: "Serotonin & melatonin neuro-synthesis" },
                        { name: "Phenylalanine", type: "Essential (EAA)", s: perServing.nutrients.aminoAcids.phenylalanine_mg, d: perDay.nutrients.aminoAcids.phenylalanine_mg, func: "Dopamine & norepinephrine precursor" },
                        { name: "Tyrosine", type: "Semi-Essential", s: perServing.nutrients.aminoAcids.tyrosine_mg, d: perDay.nutrients.aminoAcids.tyrosine_mg, func: "Thyroid hormone & catecholamine synthesis" },
                        { name: "Histidine", type: "Essential (EAA)", s: perServing.nutrients.aminoAcids.histidine_mg, d: perDay.nutrients.aminoAcids.histidine_mg, func: "Histamine, myelin sheath & hemoglobin" },
                        { name: "Arginine", type: "Semi-Essential", s: perServing.nutrients.aminoAcids.arginine_mg, d: perDay.nutrients.aminoAcids.arginine_mg, func: "Nitric oxide (NO) vasodilation & immune support" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-2.5 font-semibold text-white">{row.name}</td>
                          <td className="px-4 py-2.5 text-stone-400 text-[10px]">{row.type}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold text-sky-300">{row.s} mg</td>
                          <td className="px-4 py-2.5 text-right font-mono text-emerald-300">{row.d} mg</td>
                          <td className="px-4 py-2.5 text-stone-400">{row.func}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-white/10 bg-black/50 text-xs font-bold text-white">
                      <tr>
                        <td className="px-4 py-3">Total Essential Amino Acids (EAA)</td>
                        <td className="px-4 py-3 text-emerald-300">{perServing.nutrients.aminoAcids.aminoAcidScorePct}% Score</td>
                        <td className="px-4 py-3 text-right font-mono text-sky-300">{perServing.nutrients.aminoAcids.totalEAA_mg} mg</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-300">{perDay.nutrients.aminoAcids.totalEAA_mg} mg</td>
                        <td className="px-4 py-3 text-amber-300">PDCAAS: {perServing.nutrients.aminoAcids.pdcaasEquivalentPct}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: FATTY ACIDS */}
            {nutrientTab === "fattyAcids" && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-black/40 text-[10px] uppercase text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Lipid Fraction</th>
                      <th className="px-4 py-3 text-right">Per Serving</th>
                      <th className="px-4 py-3 text-right">Per Day</th>
                      <th className="px-4 py-3">Metabolic Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-stone-300">
                    {[
                      { l: "Saturated Fatty Acids (SFA)", s: `${perServing.nutrients.fattyAcids.totalSaturated_g} g`, d: `${perDay.nutrients.fattyAcids.totalSaturated_g} g`, note: "Cell membrane integrity & fat-soluble vitamin carriage" },
                      { l: "Monounsaturated (MUFA - Oleic Acid)", s: `${perServing.nutrients.fattyAcids.totalMUFA_g} g`, d: `${perDay.nutrients.fattyAcids.totalMUFA_g} g`, note: "Heart-healthy lipid profile & LDL balance" },
                      { l: "Polyunsaturated (PUFA)", s: `${perServing.nutrients.fattyAcids.totalPUFA_g} g`, d: `${perDay.nutrients.fattyAcids.totalPUFA_g} g`, note: "Essential fatty acid synthesis" },
                      { l: "Omega-6 (Linoleic Acid - LA)", s: `${perServing.nutrients.fattyAcids.omega6_linoleic_g} g`, d: `${perDay.nutrients.fattyAcids.omega6_linoleic_g} g`, note: "Essential skin barrier & cellular signaling" },
                      { l: "Omega-3 (Alpha-Linolenic Acid - ALA)", s: `${perServing.nutrients.fattyAcids.omega3_ALA_g} g`, d: `${perDay.nutrients.fattyAcids.omega3_ALA_g} g`, note: "High anti-inflammatory eicosanoid precursor (Telba/Flax)" },
                      { l: "Omega-3 (EPA & DHA)", s: `${perServing.nutrients.fattyAcids.omega3_EPA_DHA_g} g`, d: `${perDay.nutrients.fattyAcids.omega3_EPA_DHA_g} g`, note: "Animal source / endogenous ALA elongation" },
                      { l: "Omega-3 to Omega-6 Ratio", s: perServing.nutrients.fattyAcids.omega3ToOmega6Ratio, d: perDay.nutrients.fattyAcids.omega3ToOmega6Ratio, note: "Target ideal range 1:3 to 1:5" },
                      { l: "Dietary Cholesterol", s: `${perServing.nutrients.fattyAcids.cholesterol_mg} mg`, d: `${perDay.nutrients.fattyAcids.cholesterol_mg} mg`, note: diet.isFasting ? "0 mg (100% plant fasting formulation)" : "From grass-fed pasture kibbeh, ayib or poultry" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-semibold text-white">{row.l}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-amber-300">{row.s}</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-300">{row.d}</td>
                        <td className="px-4 py-3 text-stone-400">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: MINERALS */}
            {nutrientTab === "minerals" && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-sky-400/20 bg-sky-950/20 p-4 text-xs text-stone-300">
                  <span className="font-bold text-sky-300">
                    ⚗️ Bioavailability Activated by: {enzymeBioavailabilitySummary.reactionName}
                  </span>
                  <p className="mt-1 text-[11px] text-stone-400 leading-relaxed">
                    Non-heme iron and zinc are chelated by phytic acid in raw grains. Under the selected cofactor,
                    phytic acid is reduced by <strong>{enzymeBioavailabilitySummary.phytateDegradationPct}%</strong>,
                    multiplying bioavailable iron by <strong>{enzymeBioavailabilitySummary.ironMultiplier}×</strong>.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 bg-black/40 text-[10px] uppercase text-stone-500">
                      <tr>
                        <th className="px-4 py-3">Mineral Element</th>
                        <th className="px-4 py-3 text-right">Per Serving</th>
                        <th className="px-4 py-3 text-right">Per Day</th>
                        <th className="px-4 py-3 text-right">Bioavailable Yield</th>
                        <th className="px-4 py-3">Biological Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-stone-300">
                      {[
                        { name: "Calcium (Ca)", s: `${perServing.nutrients.minerals.calcium_mg} mg`, d: `${perDay.nutrients.minerals.calcium_mg} mg`, bio: "High (Teff & Gomen)", note: "Bone mineral matrix & neuro-muscular signaling" },
                        { name: "Total Iron (Fe)", s: `${perServing.nutrients.minerals.iron_mg} mg`, d: `${perDay.nutrients.minerals.iron_mg} mg`, bio: `${perServing.nutrients.minerals.bioavailableIron_mg} mg bioavail.`, note: "Hemoglobin & oxygen transport in high altitudes" },
                        { name: "Total Zinc (Zn)", s: `${perServing.nutrients.minerals.zinc_mg} mg`, d: `${perDay.nutrients.minerals.zinc_mg} mg`, bio: `${perServing.nutrients.minerals.bioavailableZinc_mg} mg bioavail.`, note: "Immune defense & carbonic anhydrase activity" },
                        { name: "Magnesium (Mg)", s: `${perServing.nutrients.minerals.magnesium_mg} mg`, d: `${perDay.nutrients.minerals.magnesium_mg} mg`, bio: "Optimal", note: "ATP energy production & arterial relaxation" },
                        { name: "Potassium (K)", s: `${perServing.nutrients.minerals.potassium_mg} mg`, d: `${perDay.nutrients.minerals.potassium_mg} mg`, bio: "Optimal", note: "Counteracts sodium & regulates blood pressure" },
                        { name: "Sodium (Na)", s: `${perServing.nutrients.minerals.sodium_mg} mg`, d: `${perDay.nutrients.minerals.sodium_mg} mg`, bio: "Natural", note: "Fluid balance; safe within dietary ceilings" },
                        { name: "Phosphorus (P)", s: `${perServing.nutrients.minerals.phosphorus_mg} mg`, d: `${perDay.nutrients.minerals.phosphorus_mg} mg`, bio: "Elevated by phytase", note: "Bone hydroxyapatite & nucleic acid synthesis" },
                        { name: "Copper (Cu)", s: `${perServing.nutrients.minerals.copper_mg} mg`, d: `${perDay.nutrients.minerals.copper_mg} mg`, bio: "Optimal", note: "Iron oxidation & cytochrome c oxidase" },
                        { name: "Selenium (Se)", s: `${perServing.nutrients.minerals.selenium_mcg} mcg`, d: `${perDay.nutrients.minerals.selenium_mcg} mcg`, bio: "High", note: "Glutathione peroxidase antioxidant enzyme" },
                        { name: "Manganese (Mn)", s: `${perServing.nutrients.minerals.manganese_mg} mg`, d: `${perDay.nutrients.minerals.manganese_mg} mg`, bio: "High", note: "Mitochondrial superoxide dismutase (SOD)" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 font-semibold text-white">{row.name}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-amber-300">{row.s}</td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-300">{row.d}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-sky-300">{row.bio}</td>
                          <td className="px-4 py-3 text-stone-400">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: VITAMINS */}
            {nutrientTab === "vitamins" && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-black/40 text-[10px] uppercase text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Vitamin</th>
                      <th className="px-4 py-3 text-right">Per Serving</th>
                      <th className="px-4 py-3 text-right">Per Day</th>
                      <th className="px-4 py-3">Primary Source & Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-stone-300">
                    {[
                      { name: "Vitamin A (RAE)", s: `${perServing.nutrients.vitamins.vitaminA_RAE_mcg} mcg`, d: `${perDay.nutrients.vitamins.vitaminA_RAE_mcg} mcg`, note: "Carotenoid-derived retinol equivalents (Gomen, Berbere, Dubba)" },
                      { name: "Beta-Carotene", s: `${perServing.nutrients.vitamins.betaCarotene_mcg} mcg`, d: `${perDay.nutrients.vitamins.betaCarotene_mcg} mcg`, note: "Potent provitamin A antioxidant" },
                      { name: "Vitamin C (Ascorbic Acid)", s: `${perServing.nutrients.vitamins.vitaminC_mg} mg`, d: `${perDay.nutrients.vitamins.vitaminC_mg} mg`, note: "Lime, raw jalapeño, tomatoes; reduces Fe³⁺ to Fe²⁺" },
                      { name: "Vitamin D", s: `${perServing.nutrients.vitamins.vitaminD_mcg} mcg`, d: `${perDay.nutrients.vitamins.vitaminD_mcg} mcg`, note: diet.isFasting ? "Endogenous cutaneous sun synthesis recommended" : "Egg, ayib & pasture dairy" },
                      { name: "Vitamin E (Tocopherol)", s: `${perServing.nutrients.vitamins.vitaminE_mg} mg`, d: `${perDay.nutrients.vitamins.vitaminE_mg} mg`, note: "Cold-pressed seed oils & teff germ lipids" },
                      { name: "Vitamin B1 (Thiamin)", s: `${perServing.nutrients.vitamins.vitaminB1_mg} mg`, d: `${perDay.nutrients.vitamins.vitaminB1_mg} mg`, note: "Teff bran & pulses; carbohydrate energy metabolism" },
                      { name: "Vitamin B2 (Riboflavin)", s: `${perServing.nutrients.vitamins.vitaminB2_mg} mg`, d: `${perDay.nutrients.vitamins.vitaminB2_mg} mg`, note: "FAD mitochondrial respiratory chain cofactor" },
                      { name: "Vitamin B3 (Niacin)", s: `${perServing.nutrients.vitamins.vitaminB3_mg} mg`, d: `${perDay.nutrients.vitamins.vitaminB3_mg} mg`, note: "NAD+ cellular repair & sirtuin activation" },
                      { name: "Vitamin B6 (Pyridoxine)", s: `${perServing.nutrients.vitamins.vitaminB6_mg} mg`, d: `${perDay.nutrients.vitamins.vitaminB6_mg} mg`, note: "Amino acid transamination & neurotransmitter synthesis" },
                      { name: "Vitamin B9 (Folate)", s: `${perServing.nutrients.vitamins.vitaminB9_folate_mcg} mcg`, d: `${perDay.nutrients.vitamins.vitaminB9_folate_mcg} mcg`, note: "Abundant in lentils, chickpeas & collards; DNA methylation" },
                      { name: "Vitamin B12 (Cobalamin)", s: `${perServing.nutrients.vitamins.vitaminB12_mcg} mcg`, d: `${perDay.nutrients.vitamins.vitaminB12_mcg} mcg`, note: diet.isFasting ? "Trace bacterial sourdough synthesis (0.1–0.25 mcg)" : "Naturally present in chicken, eggs, ayib & beef" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-semibold text-white">{row.name}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-amber-300">{row.s}</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-300">{row.d}</td>
                        <td className="px-4 py-3 text-stone-400">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ───────────────── BIOCHEMICAL ENZYME ACTIVATION & CLINICAL HEALTH NOTE ───────────────── */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Enzyme Activation Details */}
            <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/30 via-stone-900 to-black/60 p-6 backdrop-blur-xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
                Enzyme Bioavailability Engine
              </span>
              <h3 className="mt-1 text-lg font-bold text-white">{enzymeBioavailabilitySummary.reactionName}</h3>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-2xl border border-white/5 bg-black/40 p-3">
                  <strong className="block text-violet-300 mb-1">Molecular Mechanism:</strong>
                  <p className="text-stone-300 leading-relaxed">{enzymeBioavailabilitySummary.biochemicalMechanism}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                    <span className="text-[10px] text-stone-500">Phytate Degradation</span>
                    <div className="font-mono text-sm font-bold text-emerald-400">
                      -{enzymeBioavailabilitySummary.phytateDegradationPct}%
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                    <span className="text-[10px] text-stone-500">Iron Bioavailability</span>
                    <div className="font-mono text-sm font-bold text-rose-400">
                      +{Math.round((enzymeBioavailabilitySummary.ironMultiplier - 1) * 100)}%
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/40 p-3">
                  <strong className="block text-emerald-300 mb-1">Traditional Practice Advice:</strong>
                  <p className="text-stone-300 leading-relaxed">{enzymeBioavailabilitySummary.culinaryInstructions}</p>
                </div>
              </div>
            </div>

            {/* Personalized Clinical Health Note */}
            <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-stone-900 to-black/60 p-6 backdrop-blur-xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Personalized Metabolic & Health Note
              </span>
              <h3 className="mt-1 text-lg font-bold text-white">{personalizedHealthNote.headline}</h3>

              <div className="mt-4 space-y-3 text-xs leading-relaxed">
                <div className="rounded-2xl border border-white/5 bg-black/40 p-3">
                  <strong className="block text-amber-300 mb-1">Clinical Rationale:</strong>
                  <p className="text-stone-300">{personalizedHealthNote.clinicalRationale}</p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/40 p-3">
                  <strong className="block text-sky-300 mb-1">Nutrient Synergy:</strong>
                  <p className="text-stone-300">{personalizedHealthNote.nutritionalSynergy}</p>
                </div>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-950/20 p-3">
                  <strong className="block text-emerald-300 mb-1 font-serif text-[11px]">
                    Ancestral Wisdom (ምሳሌያዊ ጥበብ):
                  </strong>
                  <p className="font-serif italic text-stone-200">{personalizedHealthNote.culturalWisdom}</p>
                  <p className="mt-2 text-[11px] text-stone-400 border-t border-white/5 pt-2">
                    {personalizedHealthNote.lifestyleRecommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
