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
    <main className="min-h-screen bg-background text-soft">
      {/* ───────────────── HEADER / HERO ───────────────── */}
      <header className="relative overflow-hidden border-b border-brand/15 bg-gradient-to-br from-brand-soft via-background to-gold-soft px-6 py-12 md:py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/foods"
                className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3.5 py-1.5 text-xs font-semibold text-brand-strong transition-colors hover:bg-brand/20"
              >
                ← Back to Food Science Library
              </Link>
              <Link
                href="/foods/dynamic-formulator"
                className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-xs font-semibold text-brand-strong transition-colors hover:bg-brand/20"
              >
                🎛️ Custom Proximate & Dynamic Formulator →
              </Link>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-strong">
              ⚖️ Precision Diet & Recipe Formulator
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Ethiopian Composite Diet & <br />
            <span className="bg-gradient-to-r from-brand via-brand-soft to-gold-fill bg-clip-text text-transparent">
              Best Recipe Formulator
            </span>
          </h1>
          <p className="mt-2 text-lg text-brand font-serif">የተመጣጠነ ቅይጥ ምግብ እና ምርጥ ቀመር አስሊ</p>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
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
          <div className="rounded-3xl border border-border bg-card/60 p-6  lg:col-span-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 id="formulator-controls" className="text-sm font-bold uppercase tracking-wider text-brand">
                1. Select Ethiopian Diet (ምግብ ምረጥ)
              </h2>
              <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-brand-strong">
                {ETHIOPIAN_COMPOSITE_DIETS.length} Diets
              </span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
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
                        ? "border-brand bg-brand-soft ring-1 ring-brand"
                        : "border-border bg-sunken/50 hover:border-border-strong hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-foreground">{d.nameEn}</div>
                        <div className="text-xs font-medium text-gold">{d.nameAmharic}</div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${
                          d.isFasting ? "bg-brand/20 text-brand-strong" : "bg-danger/20 text-danger-strong"
                        }`}
                      >
                        {d.isFasting ? "Fasting (የጾም)" : "Non-Fasting"}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                      {d.tagline}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-subtle">
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
            <div className="rounded-3xl border border-border bg-card/60 p-6 ">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gold">
                  2. Purpose of Diet Formulation (የቀመር ዓላማ)
                </h2>
                <span className="text-xs text-muted-foreground">Calibrates macros, fibers & serving scales</span>
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
                            ? "border-gold bg-gold-soft text-foreground ring-1 ring-gold"
                            : "border-border bg-sunken/50 text-muted-foreground hover:border-border hover:text-soft"
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight text-foreground">{cfg.titleEn}</div>
                        <div className="mt-0.5 text-[11px] text-gold">{cfg.titleAmharic}</div>
                        <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">{cfg.description}</p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Cofactors: Economic Tier & Enzyme Reaction */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Economic Tier */}
              <div className="rounded-3xl border border-border bg-card/60 p-6 ">
                <div className="border-b border-border pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-info">
                    Economic Factor (የኢኮኖሚ አቅም ደረጃ)
                  </h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Adjusts ingredient basket tiers & budget</p>
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
                            ? "border-info bg-info-soft text-foreground ring-1 ring-info"
                            : "border-border bg-sunken/50 text-muted-foreground hover:border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{tier.title}</span>
                          <span className="text-[10px] font-semibold text-info">{tier.amharic}</span>
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground">{tier.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Enzyme Reaction & Bioavailability */}
              <div className="rounded-3xl border border-border bg-card/60 p-6 ">
                <div className="border-b border-border pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-plum">
                    Enzyme Reaction & Bioavailability (የኢንዛይም እንቅስቃሴ)
                  </h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Phytase degradation, germination & reduction</p>
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
                              ? "border-plum bg-plum-soft text-foreground ring-1 ring-plum"
                              : "border-border bg-sunken/50 text-muted-foreground hover:border-border"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold text-foreground">{enz.titleEn}</span>
                            <span className="shrink-0 text-[10px] font-mono font-semibold text-plum">
                              {enz.phytateReductionPct > 0 ? `-${enz.phytateReductionPct}% Phytate` : "Baseline"}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">{enz.mechanism}</p>
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
          <div className="overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-r from-brand-soft via-card to-gold-soft p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand">
                  Formulation Recipe Output · የቀመር ውጤት
                </span>
                <h2 id="formulation-results" className="mt-1 text-2xl font-bold text-foreground md:text-3xl">
                  {diet.nameEn}
                </h2>
                <div className="mt-0.5 text-base font-semibold text-gold">{diet.nameAmharic}</div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="rounded-xl border border-brand/20 bg-brand/10 px-3 py-1.5 text-brand-strong">
                  <span className="text-muted-foreground">Target:</span> <strong>{purposeConfig.titleEn}</strong>
                </div>
                <div className="rounded-xl border border-info/20 bg-info/10 px-3 py-1.5 text-info-strong capitalize">
                  <span className="text-muted-foreground">Tier:</span> <strong>{selectedEconomicTier}</strong>
                </div>
                <div className="rounded-xl border border-plum/20 bg-plum/10 px-3 py-1.5 text-plum-strong">
                  <span className="text-muted-foreground">Enzyme:</span> <strong>{enzymeReaction.titleAmharic}</strong>
                </div>
              </div>
            </div>

            {/* Quick summary stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
              <div className="rounded-2xl border border-border bg-sunken/80 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-subtle">Per Serving Energy</div>
                <div className="mt-1 font-mono text-xl font-bold text-gold">
                  {perServing.nutrients.proximate.energyKcal} <span className="text-xs text-muted-foreground">kcal</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-sunken/80 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-subtle">Protein (Serving)</div>
                <div className="mt-1 font-mono text-xl font-bold text-info">
                  {perServing.nutrients.proximate.protein_g} <span className="text-xs text-muted-foreground">g</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-sunken/80 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-subtle">Amino Acid Score</div>
                <div className="mt-1 font-mono text-xl font-bold text-brand">
                  {perServing.nutrients.aminoAcids.aminoAcidScorePct}%
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-sunken/80 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-subtle">Bioavailable Iron</div>
                <div className="mt-1 font-mono text-xl font-bold text-danger">
                  {perServing.nutrients.minerals.bioavailableIron_mg} <span className="text-xs text-muted-foreground">mg</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-sunken/80 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-subtle">Daily Servings</div>
                <div className="mt-1 font-mono text-xl font-bold text-plum">
                  {perDay.servingsCount} <span className="text-xs text-muted-foreground">meals/day</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-sunken/80 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-subtle">30-Day Budget</div>
                <div className="mt-1 font-mono text-xl font-bold text-gold">
                  ETB {perMonth.totalMonthlyCostETB.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* ───────────────── RECIPE BREAKDOWN TABS: SERVING / DAY / MONTH ───────────────── */}
          <div className="rounded-3xl border border-border bg-card/50 p-6 md:p-8 ">
            {/* Scale Tab switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex rounded-2xl border border-border bg-sunken/80 p-1">
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
                        ? "bg-brand text-brand-foreground shadow-panel"
                        : "text-muted-foreground hover:text-brand-foreground"
                    }`}
                  >
                    <div>{t.label}</div>
                    <div className="text-[9px] font-normal opacity-80">{t.desc}</div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={showAmharicSteps}
                    onChange={(e) => setShowAmharicSteps(e.target.checked)}
                    className="rounded border-border-strong bg-muted text-brand focus:ring-brand"
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
                  <div className="overflow-hidden rounded-2xl border border-border bg-sunken/50">
                    <div className="border-b border-border bg-muted/40 px-4 py-3 text-xs font-bold uppercase tracking-wider text-brand">
                      Scaled Recipe Ingredients · 1 Serving ({perServing.servingMassGrams}g Assembled)
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-sunken/80 text-[10px] uppercase text-subtle">
                        <tr>
                          <th className="px-4 py-2.5">Component / Ingredient</th>
                          <th className="px-4 py-2.5 text-right">Mass (g)</th>
                          <th className="px-4 py-2.5">Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-soft">
                        {perServing.ingredients.map((ing) => (
                          <tr key={ing.id} className="hover:bg-foreground/[0.02]">
                            <td className="px-4 py-2.5">
                              <div className="font-semibold text-foreground">{ing.nameEn}</div>
                              <div className="text-[11px] text-gold">{ing.nameAmharic}</div>
                              {ing.notes && <div className="text-[10px] text-subtle">{ing.notes}</div>}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-brand">
                              {ing.grams} g
                            </td>
                            <td className="px-4 py-2.5 capitalize text-muted-foreground">{ing.category}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t border-border bg-sunken/80 text-xs font-bold text-foreground">
                        <tr>
                          <td className="px-4 py-3">Total Serving Mass & Cost</td>
                          <td className="px-4 py-3 text-right font-mono text-brand">
                            {perServing.servingMassGrams} g
                          </td>
                          <td className="px-4 py-3 text-gold">
                            ~ETB {perServing.estimatedCostETB}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Culinary Preparation Steps */}
                  <div className="rounded-2xl border border-border bg-sunken/50 p-5">
                    <div className="flex items-center justify-between border-b border-border pb-3 text-xs font-bold uppercase tracking-wider text-gold">
                      <span>Culinary Method & Timing</span>
                      <span className="font-mono text-muted-foreground">
                        Prep: {perServing.prepInstructions.prepTimeMinutes}m | Cook: {perServing.prepInstructions.cookTimeMinutes}m
                      </span>
                    </div>

                    <div className="mt-4 space-y-3 text-xs">
                      {perServing.prepInstructions.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/20 text-[10px] font-bold text-brand-strong">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-soft leading-relaxed">{step}</p>
                            {showAmharicSteps && perServing.prepInstructions.amharicSteps[idx] && (
                              <p className="mt-1 text-[11px] text-gold leading-relaxed font-serif">
                                {perServing.prepInstructions.amharicSteps[idx]}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {perServing.prepInstructions.culinaryTips.length > 0 && (
                      <div className="mt-5 rounded-xl border border-brand/20 bg-brand-soft p-3.5 text-xs text-soft">
                        <strong className="block text-brand mb-1">💡 Biochemical Chef's Tip:</strong>
                        <ul className="list-inside list-disc space-y-1 text-[11px] text-muted-foreground">
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
                  <div className="rounded-2xl border border-border bg-sunken/50 p-5 lg:col-span-5">
                    <h3 className="border-b border-border pb-2.5 text-xs font-bold uppercase tracking-wider text-info">
                      Daily Meal Schedule & Distribution ({perDay.servingsCount} Meals/Day)
                    </h3>

                    <div className="mt-4 space-y-4">
                      {perDay.mealDistribution.map((m, idx) => (
                        <div key={idx} className="rounded-2xl border border-border bg-card/60 p-3.5">
                          <div className="flex items-center justify-between text-xs font-bold text-foreground">
                            <span>{m.mealName}</span>
                            <span className="text-gold font-serif">{m.amharicName}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                            <span>🕒 {m.timeOfDay}</span>
                            <span className="text-brand">{m.grams}g · {m.caloriesKcal} kcal</span>
                          </div>
                          <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">{m.suggestion}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-xl border border-border bg-sunken/80 p-3 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Total Daily Food Mass:</span>
                        <strong className="font-mono text-foreground">{perDay.totalDailyMassGrams} g</strong>
                      </div>
                      <div className="mt-1 flex justify-between text-muted-foreground">
                        <span>Estimated Daily Budget:</span>
                        <strong className="font-mono text-gold">~ETB {perDay.estimatedDailyCostETB}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Adequacy vs Reference Daily Intake (RDI) (Col 7) */}
                  <div className="rounded-2xl border border-border bg-sunken/50 p-5 lg:col-span-7">
                    <h3 className="border-b border-border pb-2.5 text-xs font-bold uppercase tracking-wider text-brand">
                      Daily Nutrient Adequacy vs. Reference Intake (RDI)
                    </h3>

                    <div className="mt-4 space-y-3.5">
                      {Object.entries(perDay.adequacyVsRDI).map(([key, item]) => {
                        const pct = Math.min(150, item.percent);
                        const isOptimal = pct >= 90 && pct <= 130;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between text-xs">
                              <span className="capitalize font-semibold text-soft">{key}</span>
                              <span className="font-mono text-[11px] text-muted-foreground">
                                <strong className="text-foreground">{item.actual}</strong> / {item.target} ({item.percent}%)
                              </span>
                            </div>
                            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                style={{ width: `${Math.min(100, (pct / 120) * 100)}%` }}
                                className={`h-full rounded-full transition-all ${
                                  pct < 70
                                    ? "bg-danger"
                                    : isOptimal
                                      ? "bg-brand"
                                      : "bg-gold-fill"
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
                <div className="rounded-2xl border border-border bg-sunken/50 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gold">
                        30-Day Bulk Procurement & Raw Pantry Guide
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Calculates raw dry grain, pulse, oil, and vegetable weights needed for 30 consecutive days.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-subtle">Estimated 30-Day Budget</div>
                      <div className="font-mono text-2xl font-bold text-gold">
                        ETB {perMonth.totalMonthlyCostETB.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-sunken/80 text-[10px] uppercase text-subtle">
                        <tr>
                          <th className="px-4 py-2.5">Pantry Staple Item</th>
                          <th className="px-4 py-2.5 text-right">30-Day Supply</th>
                          <th className="px-4 py-2.5 text-right">Estimated Cost (ETB)</th>
                          <th className="px-4 py-2.5">Traditional Storage & Preservation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-soft">
                        {perMonth.bulkPantryItems.map((item, i) => (
                          <tr key={i} className="hover:bg-foreground/[0.02]">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground">{item.nameEn}</div>
                              <div className="text-[11px] text-gold">{item.nameAmharic}</div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-brand">
                              {item.totalKgOrLiters} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-gold">
                              ~ETB {item.estimatedCostETB.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-muted-foreground leading-relaxed">
                              {item.storageAdvice}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 rounded-2xl border border-gold/20 bg-gold-soft p-4 text-xs text-soft">
                    <strong className="block text-gold mb-1">🌾 Economic Tier Guidance:</strong>
                    <p className="leading-relaxed text-muted-foreground">{perMonth.economicGuidance}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ───────────────── INTENSIVE NUTRIENT TABLES ───────────────── */}
          <div className="rounded-3xl border border-border bg-card/50 p-6 md:p-8 ">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Intensive Nutrient Profile Tables (የንጥረ-ነገሮች ዝርዝር ሠንጠረዥ)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Comprehensive quantitative tables per single serving portion ({perServing.servingMassGrams}g).
                </p>
              </div>

              {/* Sub-tab switcher */}
              <div className="flex flex-wrap gap-1 rounded-2xl border border-border bg-sunken/80 p-1">
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
                        ? "bg-gold-fill text-gold-foreground shadow"
                        : "text-muted-foreground hover:text-gold-foreground"
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
                  <thead className="border-b border-border bg-sunken/80 text-[10px] uppercase text-subtle">
                    <tr>
                      <th className="px-4 py-3">Macronutrient / Fraction</th>
                      <th className="px-4 py-3 text-right">Per Serving</th>
                      <th className="px-4 py-3 text-right">Per Day ({perDay.servingsCount} servings)</th>
                      <th className="px-4 py-3">Reference Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-soft">
                    {[
                      { l: "Energy (Calories)", s: `${perServing.nutrients.proximate.energyKcal} kcal`, d: `${perDay.nutrients.proximate.energyKcal} kcal`, note: "Target calibrated to purpose" },
                      { l: "Crude Protein", s: `${perServing.nutrients.proximate.protein_g} g`, d: `${perDay.nutrients.proximate.protein_g} g`, note: "Complementary pulse + teff balance" },
                      { l: "Total Lipids (Fat)", s: `${perServing.nutrients.proximate.fat_g} g`, d: `${perDay.nutrients.proximate.fat_g} g`, note: "Healthy mono & polyunsaturated" },
                      { l: "Total Carbohydrates", s: `${perServing.nutrients.proximate.carbohydrate_g} g`, d: `${perDay.nutrients.proximate.carbohydrate_g} g`, note: "Slow-fermenting complex starches" },
                      { l: "Dietary Fiber", s: `${perServing.nutrients.proximate.dietaryFiber_g} g`, d: `${perDay.nutrients.proximate.dietaryFiber_g} g`, note: "Viscous soluble & resistant starch" },
                      { l: "Moisture Content", s: `${perServing.nutrients.proximate.moisture_g} g`, d: `${perDay.nutrients.proximate.moisture_g} g`, note: "Injera & stew hydration" },
                      { l: "Ash (Total Minerals)", s: `${perServing.nutrients.proximate.ash_g} g`, d: `${perDay.nutrients.proximate.ash_g} g`, note: "Inorganic elemental residue" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-foreground/[0.02]">
                        <td className="px-4 py-3 font-semibold text-foreground">{row.l}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-gold">{row.s}</td>
                        <td className="px-4 py-3 text-right font-mono text-brand">{row.d}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: AMINO ACIDS */}
            {nutrientTab === "aminoAcids" && (
              <div className="mt-6 space-y-6">
                <div className="rounded-2xl border border-brand/20 bg-brand-soft p-4 text-xs text-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-brand">
                      🧬 Complete Protein Synthesis Profile: PDCAAS {perServing.nutrients.aminoAcids.pdcaasEquivalentPct}%
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Limiting Amino Acid: <strong className="text-foreground">{perServing.nutrients.aminoAcids.limitingAmino}</strong>
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                    Teff grains are naturally rich in sulfur-containing amino acids (Methionine and Cysteine) but modest in Lysine.
                    Legumes (Shiro chickpeas, lentils, split peas) are abundant in Lysine and Threonine but low in Methionine.
                    Combining them creates a biological score equivalent to whole egg or milk protein!
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-sunken/80 text-[10px] uppercase text-subtle">
                      <tr>
                        <th className="px-4 py-2.5">Amino Acid</th>
                        <th className="px-4 py-2.5">Type</th>
                        <th className="px-4 py-2.5 text-right">Per Serving (mg)</th>
                        <th className="px-4 py-2.5 text-right">Per Day (mg)</th>
                        <th className="px-4 py-2.5">Primary Physiological Function</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-soft">
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
                        <tr key={i} className="hover:bg-foreground/[0.02]">
                          <td className="px-4 py-2.5 font-semibold text-foreground">{row.name}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-[10px]">{row.type}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold text-info">{row.s} mg</td>
                          <td className="px-4 py-2.5 text-right font-mono text-brand">{row.d} mg</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{row.func}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-border bg-sunken/80 text-xs font-bold text-foreground">
                      <tr>
                        <td className="px-4 py-3">Total Essential Amino Acids (EAA)</td>
                        <td className="px-4 py-3 text-brand">{perServing.nutrients.aminoAcids.aminoAcidScorePct}% Score</td>
                        <td className="px-4 py-3 text-right font-mono text-info">{perServing.nutrients.aminoAcids.totalEAA_mg} mg</td>
                        <td className="px-4 py-3 text-right font-mono text-brand">{perDay.nutrients.aminoAcids.totalEAA_mg} mg</td>
                        <td className="px-4 py-3 text-gold">PDCAAS: {perServing.nutrients.aminoAcids.pdcaasEquivalentPct}%</td>
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
                  <thead className="border-b border-border bg-sunken/80 text-[10px] uppercase text-subtle">
                    <tr>
                      <th className="px-4 py-3">Lipid Fraction</th>
                      <th className="px-4 py-3 text-right">Per Serving</th>
                      <th className="px-4 py-3 text-right">Per Day</th>
                      <th className="px-4 py-3">Metabolic Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-soft">
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
                      <tr key={i} className="hover:bg-foreground/[0.02]">
                        <td className="px-4 py-3 font-semibold text-foreground">{row.l}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-gold">{row.s}</td>
                        <td className="px-4 py-3 text-right font-mono text-brand">{row.d}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: MINERALS */}
            {nutrientTab === "minerals" && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-info/20 bg-info-soft p-4 text-xs text-soft">
                  <span className="font-bold text-info">
                    ⚗️ Bioavailability Activated by: {enzymeBioavailabilitySummary.reactionName}
                  </span>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                    Non-heme iron and zinc are chelated by phytic acid in raw grains. Under the selected cofactor,
                    phytic acid is reduced by <strong>{enzymeBioavailabilitySummary.phytateDegradationPct}%</strong>,
                    multiplying bioavailable iron by <strong>{enzymeBioavailabilitySummary.ironMultiplier}×</strong>.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-sunken/80 text-[10px] uppercase text-subtle">
                      <tr>
                        <th className="px-4 py-3">Mineral Element</th>
                        <th className="px-4 py-3 text-right">Per Serving</th>
                        <th className="px-4 py-3 text-right">Per Day</th>
                        <th className="px-4 py-3 text-right">Bioavailable Yield</th>
                        <th className="px-4 py-3">Biological Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-soft">
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
                        <tr key={i} className="hover:bg-foreground/[0.02]">
                          <td className="px-4 py-3 font-semibold text-foreground">{row.name}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-gold">{row.s}</td>
                          <td className="px-4 py-3 text-right font-mono text-brand">{row.d}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-info">{row.bio}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.note}</td>
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
                  <thead className="border-b border-border bg-sunken/80 text-[10px] uppercase text-subtle">
                    <tr>
                      <th className="px-4 py-3">Vitamin</th>
                      <th className="px-4 py-3 text-right">Per Serving</th>
                      <th className="px-4 py-3 text-right">Per Day</th>
                      <th className="px-4 py-3">Primary Source & Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-soft">
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
                      <tr key={i} className="hover:bg-foreground/[0.02]">
                        <td className="px-4 py-3 font-semibold text-foreground">{row.name}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-gold">{row.s}</td>
                        <td className="px-4 py-3 text-right font-mono text-brand">{row.d}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.note}</td>
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
            <div className="rounded-3xl border border-plum/20 bg-gradient-to-br from-plum-soft via-card to-card p-6 shadow-panel">
              <span className="text-[10px] font-bold uppercase tracking-widest text-plum">
                Enzyme Bioavailability Engine
              </span>
              <h3 className="mt-1 text-lg font-bold text-foreground">{enzymeBioavailabilitySummary.reactionName}</h3>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-2xl border border-border bg-sunken/80 p-3">
                  <strong className="block text-plum mb-1">Molecular Mechanism:</strong>
                  <p className="text-soft leading-relaxed">{enzymeBioavailabilitySummary.biochemicalMechanism}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-border bg-sunken/50 p-2.5">
                    <span className="text-[10px] text-subtle">Phytate Degradation</span>
                    <div className="font-mono text-sm font-bold text-brand">
                      -{enzymeBioavailabilitySummary.phytateDegradationPct}%
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-sunken/50 p-2.5">
                    <span className="text-[10px] text-subtle">Iron Bioavailability</span>
                    <div className="font-mono text-sm font-bold text-danger">
                      +{Math.round((enzymeBioavailabilitySummary.ironMultiplier - 1) * 100)}%
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-sunken/80 p-3">
                  <strong className="block text-brand mb-1">Traditional Practice Advice:</strong>
                  <p className="text-soft leading-relaxed">{enzymeBioavailabilitySummary.culinaryInstructions}</p>
                </div>
              </div>
            </div>

            {/* Personalized Clinical Health Note */}
            <div className="rounded-3xl border border-brand/20 bg-gradient-to-br from-brand-soft via-card to-card p-6 shadow-panel">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Personalized Metabolic & Health Note
              </span>
              <h3 className="mt-1 text-lg font-bold text-foreground">{personalizedHealthNote.headline}</h3>

              <div className="mt-4 space-y-3 text-xs leading-relaxed">
                <div className="rounded-2xl border border-border bg-sunken/80 p-3">
                  <strong className="block text-gold mb-1">Clinical Rationale:</strong>
                  <p className="text-soft">{personalizedHealthNote.clinicalRationale}</p>
                </div>

                <div className="rounded-2xl border border-border bg-sunken/80 p-3">
                  <strong className="block text-info mb-1">Nutrient Synergy:</strong>
                  <p className="text-soft">{personalizedHealthNote.nutritionalSynergy}</p>
                </div>

                <div className="rounded-2xl border border-brand/20 bg-brand-soft p-3">
                  <strong className="block text-brand mb-1 font-serif text-[11px]">
                    Ancestral Wisdom (ምሳሌያዊ ጥበብ):
                  </strong>
                  <p className="font-serif italic text-soft">{personalizedHealthNote.culturalWisdom}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground border-t border-border pt-2">
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
