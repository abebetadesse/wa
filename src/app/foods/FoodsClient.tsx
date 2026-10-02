"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { EFCT_MASTER_FOODS } from "@/lib/nutrition/efctDatabase";
import { RAW_CEREAL_MATERIALS } from "@/lib/nutrition/rawCerealMaterials";
import { RECIPE_INGREDIENT_CUES } from "@/lib/nutrition/recipeIngredients";
import {
  DEEP_CEREAL_PROFILES,
  DEEP_INGREDIENT_PROFILES,
  DEEP_PROFILE_MAP,
  CEREAL_ID_TO_DEEP_UID,
  INGREDIENT_NAME_TO_DEEP_UID,
  type DeepIngredientProfile,
} from "@/lib/nutrition/deepNutrientProfiles";
import { SPROUT_PROFILES } from "@/lib/nutrition/sproutProfiles";
import { VEGETABLE_PROFILES } from "@/lib/nutrition/vegetableProfiles";
import { FRUIT_PROFILES } from "@/lib/nutrition/fruitProfiles";
import { ANIMAL_PRODUCT_PROFILES } from "@/lib/nutrition/animalProductProfiles";

// ────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────

type ActiveTab = "recipes" | "cereals" | "ingredients" | "sprouts" | "vegetables" | "fruits" | "animals";
type NutrientTab = "proximate" | "minerals" | "vitamins" | "aminoAcids" | "fattyAcids" | "phenolics" | "antinutrients";

const FOOD_CATEGORIES = [
  "All",
  "Grains & Cereals",
  "Legumes & Pulses",
  "Roots & Tubers",
  "Vegetables & Greens",
  "Seeds, Nuts & Oils",
  "Meat, Poultry & Dairy",
  "Spices & Nutrient Amplifiers",
] as const;

type FoodCategory = (typeof FOOD_CATEGORIES)[number];

const FASTING_OPTIONS = ["All", "Fasting-friendly", "Non-fasting", "Dual"] as const;

// ────────────────────────────────────────────────────────────────
// NUTRIENT TAB COMPONENT
// ────────────────────────────────────────────────────────────────

function DeepNutrientPanel({ profile }: { profile: DeepIngredientProfile }) {
  const [tab, setTab] = useState<NutrientTab>("proximate");

  const tabs: { key: NutrientTab; label: string; hasData: boolean }[] = [
    { key: "proximate", label: "Proximate", hasData: true },
    { key: "minerals", label: "Minerals", hasData: Object.keys(profile.minerals).length > 0 },
    { key: "vitamins", label: "Vitamins", hasData: Object.keys(profile.vitamins).length > 0 },
    { key: "aminoAcids", label: "Amino Acids", hasData: !!profile.aminoAcids },
    { key: "fattyAcids", label: "Fatty Acids", hasData: !!profile.fattyAcids },
    { key: "phenolics", label: "Phenolics", hasData: !!profile.phenolics },
    { key: "antinutrients", label: "Antinutrients", hasData: !!profile.antinutrients },
  ];

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-400/15 bg-black/40">
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-white/10 bg-black/30">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            disabled={!t.hasData}
            className={`shrink-0 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
              !t.hasData
                ? "cursor-not-allowed text-stone-600"
                : tab === t.key
                  ? "border-b-2 border-emerald-400 text-emerald-300"
                  : "text-stone-400 hover:text-stone-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Proximate */}
      {tab === "proximate" && (
        <div className="p-3">
          <p className="mb-3 text-[10px] text-stone-500">{profile.basis}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Energy", value: `${profile.proximate.energyKcal} kcal`, highlight: true },
              { label: "Protein", value: `${profile.proximate.protein_g} g`, highlight: false },
              { label: "Carbs", value: `${profile.proximate.carbohydrate_g} g`, highlight: false },
              { label: "Fat", value: `${profile.proximate.fat_g} g`, highlight: false },
              { label: "Dietary Fiber", value: `${profile.proximate.dietaryFiber_g} g`, highlight: false },
              { label: "Ash", value: `${profile.proximate.ash_g} g`, highlight: false },
              { label: "Moisture", value: `${profile.proximate.moisture_g} g`, highlight: false },
              ...(profile.proximate.starch_g ? [{ label: "Starch", value: `${profile.proximate.starch_g} g`, highlight: false }] : []),
              ...(profile.proximate.sugars_g !== undefined ? [{ label: "Sugars", value: `${profile.proximate.sugars_g} g`, highlight: false }] : []),
            ].map(({ label, value, highlight }) => (
              <div key={label} className={`rounded-xl p-2.5 ${highlight ? "border border-emerald-500/30 bg-emerald-950/40" : "border border-white/5 bg-white/[0.03]"}`}>
                <div className="text-[9px] font-semibold uppercase tracking-wider text-stone-500">{label}</div>
                <div className={`mt-0.5 font-mono text-sm font-bold ${highlight ? "text-emerald-300" : "text-white"}`}>{value}</div>
              </div>
            ))}
          </div>
          {profile.glycemicIndex && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-950/20 p-2.5">
              <span className="text-[10px] font-semibold text-amber-400">Glycemic Index</span>
              <span className="font-mono text-sm font-bold text-amber-200">{profile.glycemicIndex}</span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${profile.glycemicIndex < 55 ? "bg-green-900/50 text-green-300" : profile.glycemicIndex < 70 ? "bg-yellow-900/50 text-yellow-300" : "bg-red-900/50 text-red-300"}`}>
                {profile.glycemicIndex < 55 ? "LOW GI" : profile.glycemicIndex < 70 ? "MED GI" : "HIGH GI"}
              </span>
            </div>
          )}
          {profile.functionalProperties && profile.functionalProperties.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-stone-500">Key Functional Properties</p>
              <ul className="space-y-1">
                {profile.functionalProperties.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-stone-300">
                    <span className="mt-0.5 shrink-0 text-emerald-400">✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Minerals */}
      {tab === "minerals" && (
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(profile.minerals)
              .filter(([, v]) => v !== undefined)
              .map(([key, value]) => {
                const mineralNames: Record<string, string> = {
                  // Macrominerals
                  calcium_mg: "Calcium (Ca)", phosphorus_mg: "Phosphorus (P)",
                  magnesium_mg: "Magnesium (Mg)", potassium_mg: "Potassium (K)",
                  sodium_mg: "Sodium (Na)", sulfur_mg: "Sulfur (S)", chloride_mg: "Chloride (Cl)",
                  // Trace minerals
                  iron_mg: "Iron (Fe)", zinc_mg: "Zinc (Zn)", copper_mg: "Copper (Cu)",
                  manganese_mg: "Manganese (Mn)", selenium_mcg: "Selenium (Se)",
                  molybdenum_mcg: "Molybdenum (Mo)", boron_mcg: "Boron (B)",
                  chromium_mcg: "Chromium (Cr)", iodine_mcg: "Iodine (I)",
                  fluoride_mg: "Fluoride (F)", silicon_mg: "Silicon (Si)",
                  vanadium_mcg: "Vanadium (V)", nickel_mcg: "Nickel (Ni)",
                };
                const unit = key.endsWith("_mcg") ? "mcg" : "mg";
                return (
                  <div key={key} className="rounded-xl border border-sky-500/10 bg-sky-950/20 p-2.5">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-sky-400">{mineralNames[key] ?? key}</div>
                    <div className="mt-0.5 font-mono text-sm font-bold text-white">{value} <span className="text-xs font-normal text-stone-400">{unit}/100g</span></div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Vitamins */}
      {tab === "vitamins" && (
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.entries(profile.vitamins)
              .filter(([, v]) => v !== undefined)
              .map(([key, value]) => {
                const vitNames: Record<string, string> = {
                  vitaminA_retinolEquiv_mcg: "Vitamin A (RAE)", betaCarotene_mcg: "β-Carotene",
                  vitaminB1_thiamine_mg: "Vitamin B1 (Thiamine)", vitaminB2_riboflavin_mg: "Vitamin B2 (Riboflavin)",
                  vitaminB3_niacin_mg: "Vitamin B3 (Niacin)", vitaminB5_pantothenicAcid_mg: "Vitamin B5",
                  vitaminB6_pyridoxine_mg: "Vitamin B6", vitaminB9_folate_mcg: "Vitamin B9 (Folate)",
                  vitaminB12_cobalamin_mcg: "Vitamin B12", vitaminC_ascorbicAcid_mg: "Vitamin C",
                  vitaminD_mcg: "Vitamin D", vitaminE_tocopherol_mg: "Vitamin E", vitaminK_mcg: "Vitamin K",
                };
                const unit = key.endsWith("_mcg") ? "mcg" : "mg";
                return (
                  <div key={key} className="rounded-xl border border-violet-500/10 bg-violet-950/20 p-2.5">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-violet-400">{vitNames[key] ?? key}</div>
                    <div className="mt-0.5 font-mono text-sm font-bold text-white">{value} <span className="text-xs font-normal text-stone-400">{unit}/100g</span></div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Amino Acids */}
      {tab === "aminoAcids" && profile.aminoAcids && (
        <div className="p-3 space-y-4">
          {/* Essential */}
          <div>
            <h5 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-amber-400">Essential Amino Acids</h5>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(profile.aminoAcids.essential).filter(([, v]) => v !== undefined).map(([aa, val]) => (
                <div key={aa} className="rounded-xl border border-amber-500/10 bg-amber-950/15 p-2.5">
                  <div className="text-[9px] font-semibold capitalize tracking-wider text-amber-400">{aa}</div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-white">{val} <span className="text-xs font-normal text-stone-400">mg/g prot</span></div>
                </div>
              ))}
            </div>
          </div>
          {/* Semi-essential */}
          {profile.aminoAcids.semiEssential && (
            <div>
              <h5 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">Conditionally Essential</h5>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(profile.aminoAcids.semiEssential).filter(([, v]) => v !== undefined).map(([aa, val]) => (
                  <div key={aa} className="rounded-xl border border-stone-500/10 bg-stone-900/30 p-2.5">
                    <div className="text-[9px] font-semibold capitalize tracking-wider text-stone-400">{aa}</div>
                    <div className="mt-0.5 font-mono text-sm font-bold text-white">{val} <span className="text-xs font-normal text-stone-500">mg/g prot</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Non-essential (7 — completes all 21) */}
          {profile.aminoAcids.nonEssential && (
            <div>
              <h5 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-600">Non-Essential (all 21 AAs)</h5>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(profile.aminoAcids.nonEssential).filter(([, v]) => v !== undefined).map(([aa, val]) => (
                  <div key={aa} className="rounded-xl border border-stone-700/20 bg-stone-900/20 p-2.5">
                    <div className="text-[9px] font-semibold capitalize tracking-wider text-stone-600">{aa}</div>
                    <div className="mt-0.5 font-mono text-sm font-bold text-stone-300">{val} <span className="text-xs font-normal text-stone-600">mg/g prot</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {profile.aminoAcids.totalAminoAcidsMgPer100g !== undefined && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 flex items-center gap-3">
              <span className="text-[10px] font-semibold text-stone-500">Total Amino Acids</span>
              <span className="font-mono text-sm font-bold text-white">{profile.aminoAcids.totalAminoAcidsMgPer100g.toLocaleString()} <span className="text-xs font-normal text-stone-500">mg/100g</span></span>
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-xs">
            {profile.aminoAcids.limitingAmino && (
              <div className="rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-1.5">
                <span className="text-stone-400">Limiting: </span>
                <span className="font-semibold text-red-300">{profile.aminoAcids.limitingAmino}</span>
              </div>
            )}
            {profile.aminoAcids.aminoAcidScore !== undefined && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 px-3 py-1.5">
                <span className="text-stone-400">PDCAAS Score: </span>
                <span className="font-semibold text-emerald-300">{profile.aminoAcids.aminoAcidScore}/100</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fatty Acids */}
      {tab === "fattyAcids" && profile.fattyAcids && (
        <div className="p-3">
          {/* Cholesterol & Trans Fat banner */}
          {(profile.fattyAcids.cholesterol_mg !== undefined || profile.fattyAcids.totalTransFatG !== undefined) && (
            <div className="mb-3 flex flex-wrap gap-2">
              {profile.fattyAcids.cholesterol_mg !== undefined && (
                <div className={`flex-1 min-w-[120px] rounded-xl p-2.5 border ${
                  profile.fattyAcids.cholesterol_mg === 0
                    ? "border-emerald-500/15 bg-emerald-950/15"
                    : profile.fattyAcids.cholesterol_mg > 200
                      ? "border-rose-500/20 bg-rose-950/20"
                      : "border-amber-500/15 bg-amber-950/15"
                }`}>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-amber-400">Cholesterol</div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-white">
                    {profile.fattyAcids.cholesterol_mg} <span className="text-xs font-normal text-stone-400">mg/100g</span>
                  </div>
                </div>
              )}
              {profile.fattyAcids.totalTransFatG !== undefined && profile.fattyAcids.totalTransFatG > 0 && (
                <div className="flex-1 min-w-[120px] rounded-xl border border-yellow-500/20 bg-yellow-950/15 p-2.5">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-yellow-400">Trans Fat (total)</div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-white">
                    {profile.fattyAcids.totalTransFatG} <span className="text-xs font-normal text-stone-400">g/100g</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              // Totals
              { label: "Total Saturated", value: profile.fattyAcids.totalSaturatedG, unit: "g", type: "sat" },
              { label: "Total MUFA", value: profile.fattyAcids.totalMonounsaturatedG, unit: "g", type: "mufa" },
              { label: "Total PUFA", value: profile.fattyAcids.totalPolyunsaturatedG, unit: "g", type: "pufa" },
              // Short-chain saturated
              { label: "Butyric C4:0", value: profile.fattyAcids.butyric_C4_0, unit: "g", type: "sat" },
              { label: "Caproic C6:0", value: profile.fattyAcids.caproic_C6_0, unit: "g", type: "sat" },
              { label: "Caprylic C8:0 (MCT)", value: profile.fattyAcids.caprylic_C8_0, unit: "g", type: "sat" },
              { label: "Capric C10:0 (MCT)", value: profile.fattyAcids.capric_C10_0, unit: "g", type: "sat" },
              { label: "Lauric C12:0", value: profile.fattyAcids.lauric_C12_0, unit: "g", type: "sat" },
              { label: "Myristic C14:0", value: profile.fattyAcids.myristic_C14_0, unit: "g", type: "sat" },
              // Long-chain saturated
              { label: "Palmitic C16:0", value: profile.fattyAcids.palmitic_C16_0, unit: "g", type: "sat" },
              { label: "Stearic C18:0", value: profile.fattyAcids.stearic_C18_0, unit: "g", type: "sat" },
              { label: "Arachidic C20:0", value: profile.fattyAcids.arachidic_C20_0, unit: "g", type: "sat" },
              { label: "Behenic C22:0", value: profile.fattyAcids.behenic_C22_0, unit: "g", type: "sat" },
              // MUFA
              { label: "Palmitoleic C16:1", value: profile.fattyAcids.palmitoIleic_C16_1, unit: "g", type: "mufa" },
              { label: "Oleic C18:1 n-9", value: profile.fattyAcids.oleic_C18_1, unit: "g", type: "mufa" },
              { label: "Vaccenic C18:1t", value: profile.fattyAcids.vaccenic_C18_1t, unit: "g", type: "mufa" },
              { label: "Gondoic C20:1", value: profile.fattyAcids.gondoic_C20_1, unit: "g", type: "mufa" },
              { label: "Erucic C22:1", value: profile.fattyAcids.erucic_C22_1, unit: "g", type: "mufa" },
              // n-6 PUFA
              { label: "Linoleic C18:2 n-6 (LA)", value: profile.fattyAcids.linoleic_C18_2n6, unit: "g", type: "n6" },
              { label: "γ-Linolenic C18:3 n-6 (GLA)", value: profile.fattyAcids.gammaLinolenic_C18_3n6, unit: "g", type: "n6" },
              { label: "Arachidonic C20:4 n-6 (AA)", value: profile.fattyAcids.arachidonic_C20_4n6, unit: "g", type: "n6" },
              // n-3 PUFA
              { label: "ALA C18:3 n-3", value: profile.fattyAcids.alphaLinolenic_C18_3n3, unit: "g", type: "n3" },
              { label: "EPA C20:5 n-3", value: profile.fattyAcids.eicosaPentaenoic_C20_5n3, unit: "g", type: "n3" },
              { label: "DPA C22:5 n-3", value: profile.fattyAcids.docosaPentaenoic_C22_5n3, unit: "g", type: "n3" },
              { label: "DHA C22:6 n-3", value: profile.fattyAcids.docosaHexaenoic_C22_6n3, unit: "g", type: "n3" },
            ].filter(({ value }) => value !== undefined && value !== null)
             .map(({ label, value, unit, type }) => {
              const isN3 = type === "n3";
              const isN6 = type === "n6";
              const isMufa = type === "mufa";
              const isSat = type === "sat";
              return (
                <div key={label} className={`rounded-xl p-2.5 border ${
                  isN3 ? "border-teal-500/15 bg-teal-950/20"
                  : isN6 ? "border-orange-500/15 bg-orange-950/20"
                  : isMufa ? "border-sky-500/10 bg-sky-950/15"
                  : isSat ? "border-stone-500/10 bg-stone-900/30"
                  : "border-white/5 bg-white/[0.03]"
                }`}>
                  <div className={`text-[9px] font-semibold uppercase tracking-wider ${
                    isN3 ? "text-teal-400" : isN6 ? "text-orange-400" : isMufa ? "text-sky-400" : "text-stone-500"
                  }`}>{label}</div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-white">{value} <span className="text-xs font-normal text-stone-400">{unit}/100g</span></div>
                </div>
              );
            })}
          </div>
          {(profile.fattyAcids.omega3ToOmega6Ratio || profile.fattyAcids.note) && (
            <div className="mt-3 space-y-2">
              {profile.fattyAcids.omega3ToOmega6Ratio && (
                <div className="rounded-xl border border-teal-500/20 bg-teal-950/20 p-2.5">
                  <span className="text-[10px] font-semibold text-teal-400">ω-3 : ω-6 Ratio: </span>
                  <span className="font-mono text-sm font-bold text-white">{profile.fattyAcids.omega3ToOmega6Ratio}</span>
                </div>
              )}
              {profile.fattyAcids.note && (
                <p className="text-[11px] leading-relaxed text-stone-400 italic">{profile.fattyAcids.note}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Phenolics */}
      {tab === "phenolics" && profile.phenolics && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { label: "Total Phenolics (GAE)", value: profile.phenolics.totalPhenolicsMgGAE, unit: "mg" },
              { label: "Total Flavonoids", value: profile.phenolics.totalFlavonoidsMg, unit: "mg" },
              { label: "Total Anthocyanins", value: profile.phenolics.totalAnthocyaninsMg, unit: "mg" },
              { label: "Chlorogenic Acid", value: profile.phenolics.chlorogenicAcid_mg, unit: "mg" },
              { label: "Ferulic Acid", value: profile.phenolics.ferulic_mg, unit: "mg" },
              { label: "Quercetin", value: profile.phenolics.quercetin_mg, unit: "mg" },
              { label: "Kaempferol", value: profile.phenolics.kaempferol_mg, unit: "mg" },
              { label: "Rutin", value: profile.phenolics.rutin_mg, unit: "mg" },
              { label: "Proanthocyanidins", value: profile.phenolics.proanthocyanidins_mg, unit: "mg" },
              { label: "Condensed Tannins", value: profile.phenolics.condensedTannins_mg, unit: "mg" },
              { label: "Lignans", value: profile.phenolics.lignans_mg, unit: "mg" },
              { label: "Lutein", value: profile.phenolics.lutein_mcg, unit: "mcg" },
              { label: "Zeaxanthin", value: profile.phenolics.zeaxanthin_mcg, unit: "mcg" },
              { label: "ORAC", value: profile.phenolics.orac_umolTE, unit: "µmolTE" },
            ].filter(({ value }) => value !== undefined).map(({ label, value, unit }) => (
              <div key={label} className="rounded-xl border border-rose-500/10 bg-rose-950/15 p-2.5">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-rose-400">{label}</div>
                <div className="mt-0.5 font-mono text-sm font-bold text-white">{value} <span className="text-xs font-normal text-stone-400">{unit}/100g</span></div>
              </div>
            ))}
          </div>
          {profile.phenolics.note && (
            <p className="rounded-xl border border-rose-500/10 bg-rose-950/10 p-3 text-[11px] leading-relaxed text-stone-300">
              {profile.phenolics.note}
            </p>
          )}
        </div>
      )}

      {/* Antinutrients */}
      {tab === "antinutrients" && profile.antinutrients && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { label: "Phytate (IP6)", value: profile.antinutrients.phytate_mg, unit: "mg" },
              { label: "Tannins", value: profile.antinutrients.tannins_mg, unit: "mg" },
              { label: "Oxalates", value: profile.antinutrients.oxalates_mg, unit: "mg" },
              { label: "Trypsin Inhibitor", value: profile.antinutrients.trypsinInhibitor_TIU, unit: "TIU" },
              { label: "Lectins", value: profile.antinutrients.lectins_HU, unit: "HU" },
              { label: "Saponins", value: profile.antinutrients.saponins_mg, unit: "mg" },
              { label: "Goitrogens", value: profile.antinutrients.goitrogens_mg, unit: "mg" },
              { label: "Cyanogenic Glycosides", value: profile.antinutrients.cyanogenicGlucosides_mg, unit: "mg" },
            ].filter(({ value }) => value !== undefined).map(({ label, value, unit }) => (
              <div key={label} className="rounded-xl border border-orange-500/10 bg-orange-950/15 p-2.5">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-orange-400">{label}</div>
                <div className="mt-0.5 font-mono text-sm font-bold text-white">{value} <span className="text-xs font-normal text-stone-400">{unit}/100g (raw)</span></div>
              </div>
            ))}
          </div>
          {profile.antinutrients.processingReduction && (
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-950/15 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Processing Reduction</p>
              <p className="text-[11px] text-stone-300">{profile.antinutrients.processingReduction.method}</p>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                {profile.antinutrients.processingReduction.phytateReductionPct && (
                  <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-emerald-300">Phytate −{profile.antinutrients.processingReduction.phytateReductionPct}%</span>
                )}
                {profile.antinutrients.processingReduction.tanninsReductionPct && (
                  <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-emerald-300">Tannins −{profile.antinutrients.processingReduction.tanninsReductionPct}%</span>
                )}
                {profile.antinutrients.processingReduction.lectinsReductionPct && (
                  <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-emerald-300">Lectins −{profile.antinutrients.processingReduction.lectinsReductionPct}%</span>
                )}
                {profile.antinutrients.processingReduction.trypsinInhibitorReductionPct && (
                  <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-emerald-300">Trypsin Inh. −{profile.antinutrients.processingReduction.trypsinInhibitorReductionPct}%</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Source references */}
      {profile.sourceReferences.length > 0 && (
        <div className="border-t border-white/5 px-3 py-2 text-[9px] text-stone-600">
          Sources: {profile.sourceReferences.join(" · ")}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// DEEP PROFILE CARD — reusable card for Sprouts / Veg / Fruits / Animals
// ────────────────────────────────────────────────────────────────

type AccentColor = "stone" | "green" | "teal" | "orange" | "rose";

const ACCENT: Record<AccentColor, { border: string; hoverBorder: string; badge: string; text: string; dim: string }> = {
  stone:  { border: "border-white/10",       hoverBorder: "hover:border-emerald-500/20", badge: "border-stone-500/20 bg-stone-800/40 text-stone-300",  text: "text-stone-400",  dim: "text-stone-500" },
  green:  { border: "border-green-500/15",   hoverBorder: "hover:border-green-400/30",   badge: "border-green-500/20 bg-green-950/40 text-green-300",  text: "text-green-400",  dim: "text-green-600" },
  teal:   { border: "border-teal-500/15",    hoverBorder: "hover:border-teal-400/30",    badge: "border-teal-500/20 bg-teal-950/40 text-teal-300",    text: "text-teal-400",   dim: "text-teal-600" },
  orange: { border: "border-orange-500/15",  hoverBorder: "hover:border-orange-400/30",  badge: "border-orange-500/20 bg-orange-950/40 text-orange-300", text: "text-orange-400", dim: "text-orange-600" },
  rose:   { border: "border-rose-500/15",    hoverBorder: "hover:border-rose-400/30",    badge: "border-rose-500/20 bg-rose-950/40 text-rose-300",    text: "text-rose-400",   dim: "text-rose-600" },
};

function DeepProfileCard({ profile, accentColor = "stone" }: { profile: DeepIngredientProfile; accentColor?: AccentColor }) {
  const a = ACCENT[accentColor];
  return (
    <div className={`overflow-hidden rounded-3xl border ${a.border} ${a.hoverBorder} bg-stone-900/60 shadow-lg transition`}>
      {/* Header */}
      <div className="border-b border-white/[0.06] p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white leading-snug">{profile.nameEn}</h3>
            {profile.nameAmharic && <div className={`mt-0.5 text-sm font-medium ${a.text}`}>{profile.nameAmharic}</div>}
            {profile.nameLocal && <div className="text-[10px] text-stone-500">{profile.nameLocal}</div>}
            {profile.scientificName && <div className="mt-0.5 text-[10px] italic text-stone-500">{profile.scientificName}</div>}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${a.badge}`}>{profile.category}</span>
            <span className="rounded-full border border-stone-700/30 bg-stone-900/50 px-2 py-0.5 text-[10px] text-stone-500">{profile.processingState}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              profile.dataConfidence === "high" ? "border-green-500/20 bg-green-950/20 text-green-400"
              : profile.dataConfidence === "medium" ? "border-yellow-500/20 bg-yellow-950/20 text-yellow-400"
              : "border-red-500/20 bg-red-950/20 text-red-400"
            }`}>{profile.dataConfidence} confidence</span>
          </div>
        </div>
        <p className={`mt-1.5 text-[9px] ${a.dim}`}>{profile.basis} · {profile.partUsed}</p>

        {/* Quick macro pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { l: "kcal", v: profile.proximate.energyKcal, c: "text-amber-300" },
            { l: "pro",  v: `${profile.proximate.protein_g}g`,       c: "text-sky-300"     },
            { l: "carb", v: `${profile.proximate.carbohydrate_g}g`,  c: "text-violet-300"  },
            { l: "fat",  v: `${profile.proximate.fat_g}g`,           c: "text-rose-300"    },
            { l: "fiber",v: `${profile.proximate.dietaryFiber_g}g`,  c: "text-emerald-300" },
            ...(profile.fattyAcids?.cholesterol_mg !== undefined
              ? [{ l: "chol", v: `${profile.fattyAcids.cholesterol_mg}mg`, c: profile.fattyAcids.cholesterol_mg === 0 ? "text-emerald-400" : "text-orange-300" }]
              : []),
          ].map(({ l, v, c }) => (
            <span key={l} className="rounded-lg border border-white/5 bg-black/30 px-2 py-0.5 font-mono text-[10px]">
              <span className="text-stone-500">{l}: </span><span className={`font-bold ${c}`}>{v}</span>
            </span>
          ))}
        </div>

        {/* Key functional properties */}
        {profile.functionalProperties && profile.functionalProperties.length > 0 && (
          <ul className="mt-3 space-y-0.5">
            {profile.functionalProperties.slice(0, 3).map((p, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-stone-300">
                <span className={`mt-0.5 shrink-0 ${a.text}`}>✓</span> {p}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Deep nutrient panel */}
      <div className="p-4">
        <DeepNutrientPanel profile={profile} />
        {profile.bioavailabilityNotes && (
          <div className={`mt-3 rounded-xl border ${a.border} p-3 text-[11px] leading-relaxed text-stone-300`}>
            <strong className={`block mb-0.5 ${a.text}`}>Bioavailability:</strong>
            {profile.bioavailabilityNotes}
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// RECIPE INGREDIENT CHIPS
// ────────────────────────────────────────────────────────────────

function IngredientChip({
  name,
  rawCerealId,
  catalogFoodId,
}: {
  name: string;
  rawCerealId?: string;
  catalogFoodId?: string;
}) {
  const [open, setOpen] = useState(false);

  // Resolve deep profile
  const deepProfile: DeepIngredientProfile | undefined = useMemo(() => {
    if (rawCerealId && CEREAL_ID_TO_DEEP_UID[rawCerealId]) {
      return DEEP_PROFILE_MAP.get(CEREAL_ID_TO_DEEP_UID[rawCerealId]);
    }
    // Try name-based lookup
    const found = Object.entries(INGREDIENT_NAME_TO_DEEP_UID).find(([k]) =>
      name.toLowerCase().includes(k.toLowerCase())
    );
    if (found) return DEEP_PROFILE_MAP.get(found[1]);
    return undefined;
  }, [rawCerealId, name]);

  const isLinked = !!deepProfile || !!catalogFoodId || !!rawCerealId;

  return (
    <div className="flex flex-col">
      <button
        onClick={() => deepProfile && setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
          deepProfile
            ? "border border-emerald-400/30 bg-emerald-300/10 text-emerald-200 hover:bg-emerald-300/20 hover:shadow-[0_0_8px_rgba(52,211,153,0.15)]"
            : isLinked
              ? "border border-blue-400/20 bg-blue-300/10 text-blue-200 hover:bg-blue-300/20"
              : "border border-white/10 bg-white/[0.03] text-stone-400 cursor-default"
        }`}
        title={deepProfile ? `View full nutrient profile: ${name}` : isLinked ? "Linked to catalog entry" : "No analytical composition record"}
      >
        {name}
        {deepProfile && (
          <span className="text-[9px] text-emerald-400">{open ? "▲" : "▼"}</span>
        )}
        {!deepProfile && isLinked && <span className="text-[9px] text-blue-400">↗</span>}
      </button>
      {open && deepProfile && (
        <div className="mt-2 ml-1">
          <DeepNutrientPanel profile={deepProfile} />
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// FOOD RECIPE CARD
// ────────────────────────────────────────────────────────────────

function FoodRecipeCard({ food, isCompared, onToggleComparison }: {
  food: (typeof EFCT_MASTER_FOODS)[number];
  isCompared: boolean;
  onToggleComparison: (foodId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const cues = RECIPE_INGREDIENT_CUES[food.id] ?? [];
  const fastingColors = {
    fasting_friendly: "bg-emerald-900/50 text-emerald-300 border-emerald-500/20",
    non_fasting: "bg-rose-900/50 text-rose-300 border-rose-500/20",
    dual: "bg-indigo-900/50 text-indigo-300 border-indigo-500/20",
  };
  const fastingLabels = {
    fasting_friendly: "Fasting ✓",
    non_fasting: "Non-Fasting",
    dual: "Dual Use",
  };

  const vitaminNutrients = food.nutrients.filter((n) => /vitamin|folate/i.test(n.name));
  const mineralNutrients = food.nutrients.filter((n) => /iron|calcium|zinc|magnesium|potassium|sodium|phosphorus|selenium|copper|manganese/i.test(n.name));

  return (
    <div
      id={`food-${food.id}`}
      className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-stone-900/90 to-stone-950/95 shadow-xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.07)]"
    >
      {/* Header */}
      <div className="border-b border-white/[0.06] p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold leading-tight text-white">{food.name}</h3>
            <div className="mt-0.5 font-medium text-amber-400 text-xs">{food.nameAmharic}</div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-stone-300">
              {food.category}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${fastingColors[food.fastingSuitability]}`}>
              {fastingLabels[food.fastingSuitability]}
            </span>
          </div>
        </div>

        {/* Macro pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { label: "kcal", value: food.macros.caloriesKcal, color: "text-amber-300" },
            { label: "pro", value: `${food.macros.proteinG}g`, color: "text-sky-300" },
            { label: "carb", value: `${food.macros.carbohydratesG}g`, color: "text-violet-300" },
            { label: "fat", value: `${food.macros.fatsG}g`, color: "text-rose-300" },
            { label: "fiber", value: `${food.macros.dietaryFiberG}g`, color: "text-emerald-300" },
          ].map(({ label, value, color }) => (
            <span key={label} className="rounded-lg border border-white/5 bg-black/30 px-2 py-0.5 font-mono text-[10px]">
              <span className="text-stone-500">{label}: </span>
              <span className={`font-bold ${color}`}>{value}</span>
            </span>
          ))}
          {food.glycemicIndex && (
            <span className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] font-bold ${
              food.glycemicIndex.rating === "low" ? "border-green-500/20 bg-green-950/30 text-green-300" :
              food.glycemicIndex.rating === "medium" ? "border-yellow-500/20 bg-yellow-950/30 text-yellow-300" :
              "border-red-500/20 bg-red-950/30 text-red-300"
            }`}>
              GI: {food.glycemicIndex.value}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onToggleComparison(food.id)}
          aria-pressed={isCompared}
          className={`mt-3 rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition ${
            isCompared
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border-white/10 bg-white/[0.03] text-stone-300 hover:border-emerald-400/30 hover:text-emerald-200"
          }`}
        >
          {isCompared ? "✓ Added to comparison" : "＋ Compare nutrition"}
        </button>
      </div>

      {/* Preparation */}
      {food.traditionalPreparation && (
        <div className="border-b border-white/[0.06] px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Preparation</p>
          <p className="mt-1 text-[11px] leading-relaxed text-stone-300">{food.traditionalPreparation}</p>
        </div>
      )}

      {/* Ingredients */}
      {cues.length > 0 && (
        <div className="border-b border-white/[0.06] px-5 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            Ingredients · Click for nutrient data
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cues.map((cue) => (
              <IngredientChip
                key={cue.name}
                name={cue.name}
                rawCerealId={cue.rawCerealId}
                catalogFoodId={cue.catalogFoodId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Expand / collapse nutrient detail */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span className="text-[11px] font-semibold text-emerald-300">
          Full nutritional composition
        </span>
        <span className={`text-emerald-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-white/[0.06] p-5">
          {/* Nutrients from DB */}
          {food.nutrients.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Key Nutrient Values · per 100g</p>
              <div className="space-y-1.5">
                {food.nutrients.map((nut, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                    <span className="text-stone-300">
                      {nut.name}{nut.symbol && <span className="ml-1 font-mono text-stone-500">({nut.symbol})</span>}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-white">{nut.amountPer100g} {nut.unit}</span>
                      {Number(nut.bioavailabilityFactor) > 1.0 && (
                        <span className="rounded bg-emerald-950/50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                          ×{nut.bioavailabilityFactor} bio
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vitamins / Minerals */}
          {(vitaminNutrients.length > 0 || mineralNutrients.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-3">
              {vitaminNutrients.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-400">Vitamins</p>
                  <p className="text-[11px] text-stone-300">{vitaminNutrients.map((n) => `${n.name}: ${n.amountPer100g} ${n.unit}`).join(" · ")}</p>
                </div>
              )}
              {mineralNutrients.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">Minerals</p>
                  <p className="text-[11px] text-stone-300">{mineralNutrients.map((n) => `${n.name}: ${n.amountPer100g} ${n.unit}`).join(" · ")}</p>
                </div>
              )}
            </div>
          )}

          {/* Phenolics */}
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">Phenolics & Bioactives</p>
            <p className="text-[11px] leading-relaxed text-stone-300">
              {food.physiologicalNotes.bioactiveCompounds.join(" · ") || "Not recorded"}
            </p>
            <p className="mt-1 text-[9px] text-stone-600">Qualitative — quantitative phenolic values not available for this catalog record.</p>
          </div>

          {/* Antinutrients */}
          <div className="rounded-xl border border-orange-500/10 bg-orange-950/10 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-orange-400">Antinutritional Factors · per 100g</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <span className="text-stone-500">Phytic acid</span><span className="text-right font-mono text-stone-300">{food.antinutrients.phyticAcidMgPer100g} mg</span>
              <span className="text-stone-500">Tannins</span><span className="text-right font-mono text-stone-300">{food.antinutrients.tanninsMgPer100g} mg</span>
              <span className="text-stone-500">Oxalates</span><span className="text-right font-mono text-stone-300">{food.antinutrients.oxalatesMgPer100g} mg</span>
              <span className="text-stone-500">Trypsin inhibitor</span><span className="text-right font-mono capitalize text-stone-300">{food.antinutrients.trypsinInhibitorLevel}</span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-stone-500">
              {food.antinutrients.traditionalDegradationMethod} Reduction by processing: {food.antinutrients.fermentationReductionPct}%.
            </p>
            <p className="mt-1 text-[10px] text-emerald-400/80">{food.antinutrients.bioavailabilityUpliftDescription}</p>
          </div>

          {/* Health indications */}
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">Therapeutic Indications</p>
            <div className="flex flex-wrap gap-1.5">
              {food.physiologicalNotes.primaryIndications.map((ind) => (
                <span key={ind} className="rounded-full border border-teal-500/15 bg-teal-950/20 px-2 py-0.5 text-[10px] font-medium text-teal-300">{ind}</span>
              ))}
            </div>
          </div>

          {/* Digestive tolerance */}
          <div className="rounded-xl border border-stone-700/30 bg-stone-900/40 p-3 text-[11px] leading-relaxed text-stone-300">
            <strong className="block text-stone-400">Digestive tolerance:</strong>
            {food.physiologicalNotes.digestiveTolerance}
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-white/[0.05] px-5 py-2 flex items-center justify-between text-[9px] font-mono text-stone-600">
        <span>ref: {food.sourceRef}</span>
        <span>{food.id}</span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// CEREAL DEEP CARD
// ────────────────────────────────────────────────────────────────

function CerealDeepCard({ profile }: { profile: DeepIngredientProfile }) {
  const [expanded, setExpanded] = useState(false);
  const cerealBasic = RAW_CEREAL_MATERIALS.find((c) => CEREAL_ID_TO_DEEP_UID[c.id] === profile.uid);

  return (
    <div id={`cereal-${profile.uid}`} className="overflow-hidden rounded-3xl border border-amber-500/15 bg-gradient-to-b from-amber-950/20 to-stone-950/80 shadow-lg transition-all hover:border-amber-400/25">
      {/* Header */}
      <div className="border-b border-white/[0.06] p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-white">{profile.nameEn}</h3>
            {profile.nameAmharic && <div className="mt-0.5 text-sm text-amber-400">{profile.nameAmharic}</div>}
            {profile.nameLocal && <div className="mt-0.5 text-[10px] text-stone-500">{profile.nameLocal}</div>}
            <div className="mt-1 text-xs italic text-stone-500">{profile.scientificName}</div>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-950/30 px-2.5 py-1 text-[10px] font-semibold text-amber-300">
            {profile.processingState}
          </div>
        </div>
        <p className="mt-1.5 text-[9px] text-stone-600">{profile.basis}</p>

        {/* Quick proximate pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { l: "kcal", v: profile.proximate.energyKcal, c: "text-amber-300" },
            { l: "pro", v: `${profile.proximate.protein_g}g`, c: "text-sky-300" },
            { l: "carb", v: `${profile.proximate.carbohydrate_g}g`, c: "text-violet-300" },
            { l: "fat", v: `${profile.proximate.fat_g}g`, c: "text-rose-300" },
            { l: "fiber", v: `${profile.proximate.dietaryFiber_g}g`, c: "text-emerald-300" },
          ].map(({ l, v, c }) => (
            <span key={l} className="rounded-lg border border-white/5 bg-black/30 px-2 py-0.5 font-mono text-[10px]">
              <span className="text-stone-500">{l}: </span>
              <span className={`font-bold ${c}`}>{v}</span>
            </span>
          ))}
          {profile.glycemicIndex && (
            <span className="rounded-lg border border-green-500/20 bg-green-950/30 px-2 py-0.5 font-mono text-[10px] font-bold text-green-300">GI: {profile.glycemicIndex}</span>
          )}
        </div>

        {/* Uses */}
        {cerealBasic && (
          <div className="mt-3">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-stone-500">Uses as ingredient</p>
            <p className="mt-1 text-[11px] text-stone-400">{cerealBasic.useAsIngredient.join(" · ")}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="text-[11px] font-semibold text-amber-300">Full nutrition: minerals · vitamins · amino acids · fatty acids · phenolics</span>
        <span className={`text-amber-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>⌄</span>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] p-4">
          <DeepNutrientPanel profile={profile} />
          {profile.bioavailabilityNotes && (
            <div className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-950/15 p-3 text-[11px] leading-relaxed text-stone-300">
              <strong className="text-emerald-400 block mb-0.5">Bioavailability notes:</strong>
              {profile.bioavailabilityNotes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────────────────

export default function FoodsPageClient() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("recipes");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FoodCategory>("All");
  const [fasting, setFasting] = useState<string>("All");
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [portionGrams, setPortionGrams] = useState(150);
  const [comparisonNotice, setComparisonNotice] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Derived filtered foods
  const filteredFoods = useMemo(() => {
    const q = search.toLowerCase();
    return EFCT_MASTER_FOODS.filter((f) => {
      if (category !== "All" && f.category !== category) return false;
      if (fasting !== "All") {
        if (fasting === "Fasting-friendly" && f.fastingSuitability !== "fasting_friendly") return false;
        if (fasting === "Non-fasting" && f.fastingSuitability !== "non_fasting") return false;
        if (fasting === "Dual" && f.fastingSuitability !== "dual") return false;
      }
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.nameAmharic.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.traditionalPreparation.toLowerCase().includes(q) ||
        f.physiologicalNotes.primaryIndications.some((i) => i.toLowerCase().includes(q)) ||
        f.physiologicalNotes.bioactiveCompounds.some((compound) => compound.toLowerCase().includes(q)) ||
        f.nutrients.some((nutrient) => nutrient.name.toLowerCase().includes(q) || (nutrient.symbol ?? "").toLowerCase().includes(q)) ||
        ["phytic acid", "tannins", "oxalates", "antinutrients"].some((term) =>
          term.includes(q) && q.length > 2
        ) ||
        (RECIPE_INGREDIENT_CUES[f.id] ?? []).some((c) => c.name.toLowerCase().includes(q))
      );
    });
  }, [search, category, fasting]);

  const filteredCereals = useMemo(() => {
    const q = search.toLowerCase();
    return DEEP_CEREAL_PROFILES.filter((c) =>
      !q || c.nameEn.toLowerCase().includes(q) || (c.nameAmharic ?? "").includes(q) || (c.scientificName ?? "").toLowerCase().includes(q)
    );
  }, [search]);

  const filteredIngredients = useMemo(() => {
    const q = search.toLowerCase();
    return DEEP_INGREDIENT_PROFILES.filter((p) =>
      !q || p.nameEn.toLowerCase().includes(q) || (p.nameAmharic ?? "").includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredSprouts = useMemo(() => {
    const q = search.toLowerCase();
    return SPROUT_PROFILES.filter((p) =>
      !q || p.nameEn.toLowerCase().includes(q) || (p.nameAmharic ?? "").includes(q)
    );
  }, [search]);

  const filteredVegetables = useMemo(() => {
    const q = search.toLowerCase();
    return VEGETABLE_PROFILES.filter((p) =>
      !q || p.nameEn.toLowerCase().includes(q) || (p.nameAmharic ?? "").includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredFruits = useMemo(() => {
    const q = search.toLowerCase();
    return FRUIT_PROFILES.filter((p) =>
      !q || p.nameEn.toLowerCase().includes(q) || (p.nameAmharic ?? "").includes(q)
    );
  }, [search]);

  const filteredAnimals = useMemo(() => {
    const q = search.toLowerCase();
    return ANIMAL_PRODUCT_PROFILES.filter((p) =>
      !q || p.nameEn.toLowerCase().includes(q) || (p.nameAmharic ?? "").includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [search]);

  const clearSearch = useCallback(() => {
    setSearch("");
    searchRef.current?.focus();
  }, []);

  const categoryGroups = useMemo(() => {
    const groups: Record<string, typeof EFCT_MASTER_FOODS> = {};
    for (const f of filteredFoods) {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    }
    return groups;
  }, [filteredFoods]);

  const comparedFoods = useMemo(
    () => comparisonIds.flatMap((id) => {
      const food = EFCT_MASTER_FOODS.find((item) => item.id === id);
      return food ? [food] : [];
    }),
    [comparisonIds],
  );

  const comparisonNutrients = useMemo(() => {
    const nutrientNames = new Map<string, { name: string; unit: string }>();
    for (const food of comparedFoods) {
      for (const nutrient of food.nutrients) {
        if (/iron|calcium|zinc|magnesium|potassium|sodium|phosphorus|selenium|copper|manganese|vitamin|folate/i.test(nutrient.name)) {
          const key = nutrient.name.toLowerCase();
          if (!nutrientNames.has(key)) nutrientNames.set(key, { name: nutrient.name, unit: nutrient.unit });
        }
      }
    }
    return Array.from(nutrientNames.values());
  }, [comparedFoods]);

  const toggleComparison = useCallback((foodId: string) => {
    if (comparisonIds.includes(foodId)) {
      setComparisonIds(comparisonIds.filter((id) => id !== foodId));
      setComparisonNotice("");
      return;
    }
    if (comparisonIds.length >= 3) {
      setComparisonNotice("Compare up to three foods at a time. Remove one to add another.");
      return;
    }
    setComparisonIds([...comparisonIds, foodId]);
    setComparisonNotice("");
  }, [comparisonIds]);

  return (
    <main className="min-h-screen bg-[#0a0d0b]">
      {/* ───── Hero ───── */}
      <header className="relative overflow-hidden border-b border-emerald-500/10 bg-gradient-to-br from-[#0d1c14] via-[#111a0f] to-[#0a100d] px-6 py-14 md:py-20">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute right-1/3 bottom-0 h-64 w-64 translate-y-1/2 rounded-full bg-amber-400/4 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/8 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300">
            🌿 Ethiopian Food Science & Composition
          </div>
          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
            Food as Memory,<br />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Medicine & Daily Practice
            </span>
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-stone-400 md:text-base">
            Explore the full nutritional science of Ethiopian foods — from raw cereal grain amino acid profiles to fermented injera phenolics and antinutritional factor reduction.
            Click any ingredient chip to expand its complete nutrient composition.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-stone-500">
            {[
              { icon: "🌾", label: "200 Cereals Grain Profiles" },
              { icon: "🍲", label: `${EFCT_MASTER_FOODS.length} Traditional Recipes` },
              { icon: "🌱", label: `${SPROUT_PROFILES.length} Sprout Profiles` },
              { icon: "🥦", label: "40 Vegetables Profiles" },
              { icon: "🍊", label: "50 Fruits Profiles" },
              { icon: "🥩", label: "50 Animal Products Profiles" },
              { icon: "🔬", label: "All 21 Amino Acids · Full Fatty Acid Chain · Cholesterol" },
              { icon: "⚗️", label: "Ca · Mg · Fe · K · Na · S · P · Cu · Mo · Mn · B · Se · Zn" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1">
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-400/25 bg-gradient-to-r from-emerald-950/40 via-stone-900/60 to-amber-950/30 p-5 backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  ⚡ New Interactive Engine
                </div>
                <h2 className="mt-1.5 text-base font-bold text-white sm:text-lg">
                  Composite Diet & Best Recipe Formulator (የተመጣጠነ ቅይጥ ምግብ አስሊ)
                </h2>
                <p className="mt-1 text-xs text-stone-300 max-w-2xl">
                  Formulate traditional Ethiopian diets (including <strong>Yetsom Beyayinetu</strong>, Shiro Tegabino, Doro Wot, Kitfo, and Genfo)
                  calibrated for weight loss, muscle build, diabetes, or recovery. Generates recipes <strong>per serving</strong>, <strong>per day</strong>,
                  and <strong>per month</strong> with 12 amino acids, fatty acids, bioavailable minerals, and enzyme activation cofactors.
                </p>
              </div>
              <div className="shrink-0 flex flex-wrap sm:flex-col gap-2">
                <Link
                  href="/foods/composite-formulator"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:from-emerald-300 hover:to-teal-300"
                >
                  <span>100 Diets Formulator</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/foods/dynamic-formulator"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-400/40 bg-teal-950/40 px-4 py-2 text-xs font-bold text-teal-300 transition-all hover:bg-teal-900/60"
                >
                  <span>🎛️ Dynamic Formulator</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ───── Search & Filters ───── */}
      <div className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0a0d0b]/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
            <input
              ref={searchRef}
              type="search"
              placeholder="Search foods, ingredients, nutrients, indications…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-stone-500 focus:border-emerald-500/40 focus:bg-white/8 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
            {search && (
              <button onClick={clearSearch} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white">✕</button>
            )}
          </div>
          {/* Filters (recipe tab only) */}
          {activeTab === "recipes" && (
            <div className="flex flex-wrap gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="rounded-full border border-white/10 bg-stone-900 px-3 py-2 text-xs text-stone-300 focus:border-emerald-500/40 focus:outline-none"
              >
                {FOOD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={fasting}
                onChange={(e) => setFasting(e.target.value)}
                className="rounded-full border border-white/10 bg-stone-900 px-3 py-2 text-xs text-stone-300 focus:border-emerald-500/40 focus:outline-none"
              >
                {FASTING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ───── Tab navigation ───── */}
      <div className="border-b border-white/[0.07] bg-[#0a0d0b] px-6">
        <div className="mx-auto max-w-6xl flex gap-1 overflow-x-auto">
          {([
            { key: "recipes" as ActiveTab, label: `Recipes & Dishes (${EFCT_MASTER_FOODS.length})`, icon: "🍲" },
            { key: "cereals" as ActiveTab, label: "Cereal Grains (200)", icon: "🌾" },
            { key: "ingredients" as ActiveTab, label: `Ingredients (${DEEP_INGREDIENT_PROFILES.length})`, icon: "🫘" },
            { key: "sprouts" as ActiveTab, label: `Sprouts (${SPROUT_PROFILES.length})`, icon: "🌱" },
            { key: "vegetables" as ActiveTab, label: "Vegetables (40)", icon: "🥦" },
            { key: "fruits" as ActiveTab, label: "Fruits (50)", icon: "🍊" },
            { key: "animals" as ActiveTab, label: "Animal Products (50)", icon: "🥩" },
          ] as const).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`shrink-0 flex items-center gap-1.5 border-b-2 px-4 py-3.5 text-xs font-semibold transition-all ${
                activeTab === key
                  ? "border-emerald-400 text-emerald-300"
                  : "border-transparent text-stone-500 hover:border-stone-600 hover:text-stone-300"
              }`}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
      </div>

      {comparedFoods.length > 0 && (
        <section aria-labelledby="food-comparison-heading" className="border-b border-emerald-500/10 bg-emerald-950/10 px-6 py-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Nutrition analysis</div>
                <h2 id="food-comparison-heading" className="mt-1 text-lg font-bold text-white">Compare foods by portion</h2>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-stone-400">
                  Values are scaled from each record’s per-100 g estimates. Adjust the serving weight to compare like-for-like portions; this is not a personalized dietary prescription.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-stone-300">
                Portion
                <input
                  aria-label="Comparison portion in grams"
                  type="number"
                  min="1"
                  max="2000"
                  step="10"
                  value={portionGrams}
                  onChange={(event) => setPortionGrams(Math.min(2000, Math.max(1, Number(event.target.value) || 1)))}
                  className="w-24 rounded-lg border border-white/10 bg-stone-900 px-3 py-2 font-mono text-white focus:border-emerald-500/40 focus:outline-none"
                />
                <span>g</span>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {comparedFoods.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => toggleComparison(food.id)}
                  aria-label={`Remove ${food.name} from comparison`}
                  className="rounded-full border border-emerald-500/20 bg-emerald-950/40 px-3 py-1.5 text-[11px] text-emerald-200 transition hover:border-rose-500/30 hover:text-rose-200"
                >
                  {food.name} <span aria-hidden="true">×</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setComparisonIds([]); setComparisonNotice(""); }}
                className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-stone-400 transition hover:text-white"
              >
                Clear comparison
              </button>
            </div>
            {comparisonNotice && (
              <p role="status" className="mt-2 text-xs text-amber-300">{comparisonNotice}</p>
            )}

            <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
              <table className="w-full min-w-[620px] text-left text-xs">
                <caption className="sr-only">Nutrient comparison for a {portionGrams} gram portion</caption>
                <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-wider text-stone-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">Nutrient per {portionGrams} g</th>
                    {comparedFoods.map((food) => (
                      <th scope="col" key={food.id} className="px-4 py-3 text-right">{food.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: "Energy", unit: "kcal", getValue: (food: typeof EFCT_MASTER_FOODS[number]) => food.macros.caloriesKcal },
                    { name: "Protein", unit: "g", getValue: (food: typeof EFCT_MASTER_FOODS[number]) => food.macros.proteinG },
                    { name: "Carbohydrate", unit: "g", getValue: (food: typeof EFCT_MASTER_FOODS[number]) => food.macros.carbohydratesG },
                    { name: "Fat", unit: "g", getValue: (food: typeof EFCT_MASTER_FOODS[number]) => food.macros.fatsG },
                    { name: "Dietary fiber", unit: "g", getValue: (food: typeof EFCT_MASTER_FOODS[number]) => food.macros.dietaryFiberG },
                  ].map((nutrient) => (
                    <tr key={nutrient.name}>
                      <th scope="row" className="px-4 py-2.5 font-medium text-stone-300">{nutrient.name}</th>
                      {comparedFoods.map((food) => (
                        <td key={food.id} className="px-4 py-2.5 text-right font-mono text-white">
                          {(nutrient.getValue(food) * portionGrams / 100).toFixed(1)} <span className="text-stone-500">{nutrient.unit}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                  {comparisonNutrients.map((nutrient) => (
                    <tr key={nutrient.name}>
                      <th scope="row" className="px-4 py-2.5 font-medium text-stone-300">{nutrient.name}</th>
                      {comparedFoods.map((food) => {
                        const value = food.nutrients.find((item) => item.name.toLowerCase() === nutrient.name.toLowerCase());
                        return (
                          <td key={food.id} className="px-4 py-2.5 text-right font-mono text-white">
                            {value ? `${(value.amountPer100g * portionGrams / 100).toFixed(2)} ${value.unit}` : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-stone-500">
              {comparedFoods.map((food) => <span key={food.id}>{food.name}: {food.sourceRef}</span>)}
            </div>
          </div>
        </section>
      )}

      {/* ───── Content ───── */}
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* RECIPES TAB */}
        {activeTab === "recipes" && (
          <div>
            {filteredFoods.length === 0 ? (
              <div className="py-20 text-center text-stone-500">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-semibold text-stone-400">No foods match your search</p>
                <button onClick={() => { setSearch(""); setCategory("All"); setFasting("All"); }} className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs text-stone-400 hover:text-white">Clear filters</button>
              </div>
            ) : (
              Object.entries(categoryGroups).map(([cat, foods]) => (
                <section key={cat} className="mb-12">
                  <div className="mb-5 flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white">{cat}</h2>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-stone-400">{foods.length} items</span>
                  </div>
                  <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {foods.map((food) => (
                      <FoodRecipeCard
                        key={food.id}
                        food={food}
                        isCompared={comparisonIds.includes(food.id)}
                        onToggleComparison={toggleComparison}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}

        {/* CEREALS TAB */}
        {activeTab === "cereals" && (
          <div>
            <div className="mb-6 rounded-2xl border border-amber-500/15 bg-amber-950/10 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">Reference Estimates — Dry Raw Grain per 100 g</p>
              <p className="text-xs leading-relaxed text-stone-400">
                Values are generic food-composition reference estimates from published tables (USDA FoodData Central, FAO/INFOODS AFDB, peer-reviewed Ethiopian cereal studies).
                They are not Ethiopian cultivar-specific laboratory measurements. Cultivar, growing conditions, milling degree, moisture content, and analytical method cause significant real-world variation.
                Click any card to expand the full nutrient matrix including amino acids, fatty acids, phenolics, and antinutrients.
              </p>
            </div>

            {/* Comparison table */}
            <div className="mb-8 overflow-x-auto rounded-2xl border border-white/10 bg-stone-900/40">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="border-b border-white/10 bg-black/40 text-[10px] uppercase tracking-[0.12em] text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Cereal</th>
                    <th className="px-4 py-3 text-right">kcal</th>
                    <th className="px-4 py-3 text-right">Protein g</th>
                    <th className="px-4 py-3 text-right">Carb g</th>
                    <th className="px-4 py-3 text-right">Fat g</th>
                    <th className="px-4 py-3 text-right">Fiber g</th>
                    <th className="px-4 py-3 text-right">Ca mg</th>
                    <th className="px-4 py-3 text-right">Fe mg</th>
                    <th className="px-4 py-3 text-right">Zn mg</th>
                    <th className="px-4 py-3 text-right">GI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCereals.map((c) => (
                    <tr key={c.uid} className="cursor-pointer text-stone-200 transition-colors hover:bg-white/[0.03]">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{c.nameEn}</div>
                        <div className="text-amber-400">{c.nameAmharic}</div>
                        <div className="text-[10px] italic text-stone-500">{c.scientificName}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{c.proximate.energyKcal}</td>
                      <td className="px-4 py-3 text-right font-mono">{c.proximate.protein_g}</td>
                      <td className="px-4 py-3 text-right font-mono">{c.proximate.carbohydrate_g}</td>
                      <td className="px-4 py-3 text-right font-mono">{c.proximate.fat_g}</td>
                      <td className="px-4 py-3 text-right font-mono">{c.proximate.dietaryFiber_g}</td>
                      <td className="px-4 py-3 text-right font-mono">{c.minerals.calcium_mg ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-mono">{c.minerals.iron_mg ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-mono">{c.minerals.zinc_mg ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {c.glycemicIndex ? (
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${c.glycemicIndex < 55 ? "bg-green-900/50 text-green-300" : "bg-yellow-900/50 text-yellow-300"}`}>
                            {c.glycemicIndex}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Detailed cards */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {filteredCereals.map((c) => (
                <CerealDeepCard key={c.uid} profile={c} />
              ))}
            </div>
          </div>
        )}

        {/* INGREDIENTS TAB */}
        {activeTab === "ingredients" && (
          <div>
            <div className="mb-6 rounded-2xl border border-stone-700/30 bg-stone-900/40 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Non-Cereal Ingredient Profiles</p>
              <p className="text-xs leading-relaxed text-stone-500">
                Detailed composition of key non-cereal Ethiopian food ingredients including legumes, oilseeds, vegetables, spice blends, and root crops.
                Data sourced from USDA FoodData Central, FAO WAFCT, and peer-reviewed Ethiopian ethnobotanical studies.
              </p>
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {filteredIngredients.map((p) => (
                <DeepProfileCard key={p.uid} profile={p} accentColor="stone" />
              ))}
            </div>
          </div>
        )}

        {/* SPROUTS TAB */}
        {activeTab === "sprouts" && (
          <div>
            <div className="mb-6 rounded-2xl border border-green-700/20 bg-green-950/10 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-2">🌱 Germinated & Sprouted Seeds — Complete Profiles</p>
              <p className="text-xs leading-relaxed text-stone-400">
                Germination (sprouting) is one of the most powerful food-processing technologies for improving nutritional quality.
                It activates endogenous phytases, proteases, and amylases — reducing antinutrients by 60–85%, elevating
                vitamins C, B-group and folate by 2–5×, and dramatically improving mineral bioavailability.
                All 21 amino acids profiled per 100 g fresh sprout.
              </p>
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {filteredSprouts.map((p) => (
                <DeepProfileCard key={p.uid} profile={p} accentColor="green" />
              ))}
            </div>
          </div>
        )}

        {/* VEGETABLES TAB */}
        {activeTab === "vegetables" && (
          <div>
            <div className="mb-6 rounded-2xl border border-teal-700/20 bg-teal-950/10 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-2">🥦 Vegetable Profiles — Ethiopian & Universal</p>
              <p className="text-xs leading-relaxed text-stone-400">
                Full nutrient composition of vegetables consumed in Ethiopian cuisine and globally, per 100 g raw edible portion.
                Covers all 21 amino acids, full mineral panel (Ca, Mg, Fe, K, Na, S, P, Cu, Mo, Mn, B, Se, Zn),
                vitamins, fatty acid profile, phenolics with specific bioactive notes, and antinutrient profiles.
                Traditional Ethiopian vegetables — gomen (Brassica carinata), timatim, shinkurt — are highlighted.
              </p>
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {filteredVegetables.map((p) => (
                <DeepProfileCard key={p.uid} profile={p} accentColor="teal" />
              ))}
            </div>
          </div>
        )}

        {/* FRUITS TAB */}
        {activeTab === "fruits" && (
          <div>
            <div className="mb-6 rounded-2xl border border-orange-700/20 bg-orange-950/10 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">🍊 Fruit Profiles — Ethiopian & Tropical</p>
              <p className="text-xs leading-relaxed text-stone-400">
                Comprehensive nutritional profiles for Ethiopian and pan-African tropical fruits, per 100 g raw edible portion.
                Includes unique bioactives: lycopene (guava, tomato), mangiferin (mango), papain (papaya), bromelain (pineapple),
                hesperidin (orange), tartaric acid (tamarind), passion fruit chrysin, and avocado persenones.
                All fatty acids, cholesterol, and all 21 amino acids included.
              </p>
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {filteredFruits.map((p) => (
                <DeepProfileCard key={p.uid} profile={p} accentColor="orange" />
              ))}
            </div>
          </div>
        )}

        {/* ANIMAL PRODUCTS TAB */}
        {activeTab === "animals" && (
          <div>
            <div className="mb-6 rounded-2xl border border-rose-700/20 bg-rose-950/10 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-2">🥩 Animal Product Profiles — Complete Nutrient Matrix</p>
              <p className="text-xs leading-relaxed text-stone-400">
                Animal products provide complete proteins (PDCAAS = 100), heme iron with 15–35% absorption, preformed vitamin A,
                vitamin B12 (exclusive to animal foods), long-chain omega-3s (EPA, DHA, DPA), arachidonic acid (AA), and cholesterol.
                Profiles include: beef, lamb/goat, chicken, eggs, whole milk, ayib, ergo, tilapia, liver, and traditional composite dishes.
                All 21 amino acids including hydroxyproline (collagen) are included for animal products.
              </p>
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {filteredAnimals.map((p) => (
                <DeepProfileCard key={p.uid} profile={p} accentColor="rose" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-8 text-center text-[10px] text-stone-600">
        <p>Ethiopian Food Composition Database · Reference estimates from USDA FoodData Central, FAO/INFOODS WAFCT, FAO East Africa FCT, and peer-reviewed Ethiopian food science literature.</p>
        <p className="mt-1">Values are for informational and research purposes. Not a substitute for certified laboratory analysis. Clinical nutritional decisions require qualified dietitian guidance.</p>
      </footer>
    </main>
  );
}
