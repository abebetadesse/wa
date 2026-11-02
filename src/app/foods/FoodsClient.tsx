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
    <div className="mt-3 overflow-hidden rounded-2xl border border-brand/15 bg-sunken/80">
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-border bg-sunken/50">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            disabled={!t.hasData}
            className={`shrink-0 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
              !t.hasData
                ? "cursor-not-allowed text-subtle"
                : tab === t.key
                  ? "border-b-2 border-brand text-brand"
                  : "text-muted-foreground hover:text-soft"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Proximate */}
      {tab === "proximate" && (
        <div className="p-3">
          <p className="mb-3 text-[10px] text-subtle">{profile.basis}</p>
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
              <div key={label} className={`rounded-xl p-2.5 ${highlight ? "border border-brand/30 bg-brand-soft" : "border border-border bg-foreground/[0.03]"}`}>
                <div className="text-[9px] font-semibold uppercase tracking-wider text-subtle">{label}</div>
                <div className={`mt-0.5 font-mono text-sm font-bold ${highlight ? "text-brand" : "text-foreground"}`}>{value}</div>
              </div>
            ))}
          </div>
          {profile.glycemicIndex && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-gold/20 bg-gold-soft p-2.5">
              <span className="text-[10px] font-semibold text-gold">Glycemic Index</span>
              <span className="font-mono text-sm font-bold text-gold-strong">{profile.glycemicIndex}</span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${profile.glycemicIndex < 55 ? "bg-brand-soft text-brand-strong" : profile.glycemicIndex < 70 ? "bg-gold-soft text-gold-strong" : "bg-danger-soft text-danger-strong"}`}>
                {profile.glycemicIndex < 55 ? "LOW GI" : profile.glycemicIndex < 70 ? "MED GI" : "HIGH GI"}
              </span>
            </div>
          )}
          {profile.functionalProperties && profile.functionalProperties.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-subtle">Key Functional Properties</p>
              <ul className="space-y-1">
                {profile.functionalProperties.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-soft">
                    <span className="mt-0.5 shrink-0 text-brand">✓</span> {p}
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
                  <div key={key} className="rounded-xl border border-info/10 bg-info-soft p-2.5">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-info">{mineralNames[key] ?? key}</div>
                    <div className="mt-0.5 font-mono text-sm font-bold text-foreground">{value} <span className="text-xs font-normal text-muted-foreground">{unit}/100g</span></div>
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
                  <div key={key} className="rounded-xl border border-plum/10 bg-plum-soft p-2.5">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-plum">{vitNames[key] ?? key}</div>
                    <div className="mt-0.5 font-mono text-sm font-bold text-foreground">{value} <span className="text-xs font-normal text-muted-foreground">{unit}/100g</span></div>
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
            <h5 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gold">Essential Amino Acids</h5>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(profile.aminoAcids.essential).filter(([, v]) => v !== undefined).map(([aa, val]) => (
                <div key={aa} className="rounded-xl border border-gold/10 bg-gold-soft/70 p-2.5">
                  <div className="text-[9px] font-semibold capitalize tracking-wider text-gold">{aa}</div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-foreground">{val} <span className="text-xs font-normal text-muted-foreground">mg/g prot</span></div>
                </div>
              ))}
            </div>
          </div>
          {/* Semi-essential */}
          {profile.aminoAcids.semiEssential && (
            <div>
              <h5 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Conditionally Essential</h5>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(profile.aminoAcids.semiEssential).filter(([, v]) => v !== undefined).map(([aa, val]) => (
                  <div key={aa} className="rounded-xl border border-border-strong bg-card/30 p-2.5">
                    <div className="text-[9px] font-semibold capitalize tracking-wider text-muted-foreground">{aa}</div>
                    <div className="mt-0.5 font-mono text-sm font-bold text-foreground">{val} <span className="text-xs font-normal text-subtle">mg/g prot</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Non-essential (7 — completes all 21) */}
          {profile.aminoAcids.nonEssential && (
            <div>
              <h5 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-subtle">Non-Essential (all 21 AAs)</h5>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(profile.aminoAcids.nonEssential).filter(([, v]) => v !== undefined).map(([aa, val]) => (
                  <div key={aa} className="rounded-xl border border-border bg-card/20 p-2.5">
                    <div className="text-[9px] font-semibold capitalize tracking-wider text-subtle">{aa}</div>
                    <div className="mt-0.5 font-mono text-sm font-bold text-soft">{val} <span className="text-xs font-normal text-subtle">mg/g prot</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {profile.aminoAcids.totalAminoAcidsMgPer100g !== undefined && (
            <div className="rounded-xl border border-border bg-foreground/[0.02] p-2.5 flex items-center gap-3">
              <span className="text-[10px] font-semibold text-subtle">Total Amino Acids</span>
              <span className="font-mono text-sm font-bold text-foreground">{profile.aminoAcids.totalAminoAcidsMgPer100g.toLocaleString()} <span className="text-xs font-normal text-subtle">mg/100g</span></span>
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-xs">
            {profile.aminoAcids.limitingAmino && (
              <div className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-1.5">
                <span className="text-muted-foreground">Limiting: </span>
                <span className="font-semibold text-danger">{profile.aminoAcids.limitingAmino}</span>
              </div>
            )}
            {profile.aminoAcids.aminoAcidScore !== undefined && (
              <div className="rounded-lg border border-brand/20 bg-brand-soft px-3 py-1.5">
                <span className="text-muted-foreground">PDCAAS Score: </span>
                <span className="font-semibold text-brand">{profile.aminoAcids.aminoAcidScore}/100</span>
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
                    ? "border-brand/15 bg-brand-soft/70"
                    : profile.fattyAcids.cholesterol_mg > 200
                      ? "border-danger/20 bg-danger-soft"
                      : "border-gold/15 bg-gold-soft/70"
                }`}>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-gold">Cholesterol</div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-foreground">
                    {profile.fattyAcids.cholesterol_mg} <span className="text-xs font-normal text-muted-foreground">mg/100g</span>
                  </div>
                </div>
              )}
              {profile.fattyAcids.totalTransFatG !== undefined && profile.fattyAcids.totalTransFatG > 0 && (
                <div className="flex-1 min-w-[120px] rounded-xl border border-gold/20 bg-gold-soft/70 p-2.5">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-gold">Trans Fat (total)</div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-foreground">
                    {profile.fattyAcids.totalTransFatG} <span className="text-xs font-normal text-muted-foreground">g/100g</span>
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
                  isN3 ? "border-brand/15 bg-brand-soft"
                  : isN6 ? "border-warning/15 bg-warning-soft"
                  : isMufa ? "border-info/10 bg-info-soft/70"
                  : isSat ? "border-border-strong bg-card/30"
                  : "border-border bg-foreground/[0.03]"
                }`}>
                  <div className={`text-[9px] font-semibold uppercase tracking-wider ${
                    isN3 ? "text-brand" : isN6 ? "text-warning" : isMufa ? "text-info" : "text-subtle"
                  }`}>{label}</div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-foreground">{value} <span className="text-xs font-normal text-muted-foreground">{unit}/100g</span></div>
                </div>
              );
            })}
          </div>
          {(profile.fattyAcids.omega3ToOmega6Ratio || profile.fattyAcids.note) && (
            <div className="mt-3 space-y-2">
              {profile.fattyAcids.omega3ToOmega6Ratio && (
                <div className="rounded-xl border border-brand/20 bg-brand-soft p-2.5">
                  <span className="text-[10px] font-semibold text-brand">ω-3 : ω-6 Ratio: </span>
                  <span className="font-mono text-sm font-bold text-foreground">{profile.fattyAcids.omega3ToOmega6Ratio}</span>
                </div>
              )}
              {profile.fattyAcids.note && (
                <p className="text-[11px] leading-relaxed text-muted-foreground italic">{profile.fattyAcids.note}</p>
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
              <div key={label} className="rounded-xl border border-danger/10 bg-danger-soft/70 p-2.5">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-danger">{label}</div>
                <div className="mt-0.5 font-mono text-sm font-bold text-foreground">{value} <span className="text-xs font-normal text-muted-foreground">{unit}/100g</span></div>
              </div>
            ))}
          </div>
          {profile.phenolics.note && (
            <p className="rounded-xl border border-danger/10 bg-danger-soft/70 p-3 text-[11px] leading-relaxed text-soft">
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
              <div key={label} className="rounded-xl border border-warning/10 bg-warning-soft/70 p-2.5">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-warning">{label}</div>
                <div className="mt-0.5 font-mono text-sm font-bold text-foreground">{value} <span className="text-xs font-normal text-muted-foreground">{unit}/100g (raw)</span></div>
              </div>
            ))}
          </div>
          {profile.antinutrients.processingReduction && (
            <div className="rounded-xl border border-brand/15 bg-brand-soft/70 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand">Processing Reduction</p>
              <p className="text-[11px] text-soft">{profile.antinutrients.processingReduction.method}</p>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                {profile.antinutrients.processingReduction.phytateReductionPct && (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand-strong">Phytate −{profile.antinutrients.processingReduction.phytateReductionPct}%</span>
                )}
                {profile.antinutrients.processingReduction.tanninsReductionPct && (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand-strong">Tannins −{profile.antinutrients.processingReduction.tanninsReductionPct}%</span>
                )}
                {profile.antinutrients.processingReduction.lectinsReductionPct && (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand-strong">Lectins −{profile.antinutrients.processingReduction.lectinsReductionPct}%</span>
                )}
                {profile.antinutrients.processingReduction.trypsinInhibitorReductionPct && (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand-strong">Trypsin Inh. −{profile.antinutrients.processingReduction.trypsinInhibitorReductionPct}%</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Source references */}
      {profile.sourceReferences.length > 0 && (
        <div className="border-t border-border px-3 py-2 text-[9px] text-subtle">
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
  stone:  { border: "border-border",       hoverBorder: "hover:border-brand/20", badge: "border-border-strong bg-muted/40 text-soft",  text: "text-muted-foreground",  dim: "text-subtle" },
  green:  { border: "border-brand/15",   hoverBorder: "hover:border-brand/30",   badge: "border-brand/20 bg-brand-soft text-brand-strong",  text: "text-brand",  dim: "text-brand" },
  teal:   { border: "border-brand/15",    hoverBorder: "hover:border-brand/30",    badge: "border-brand/20 bg-brand-soft text-brand-strong",    text: "text-brand",   dim: "text-brand" },
  orange: { border: "border-warning/15",  hoverBorder: "hover:border-warning/30",  badge: "border-warning/20 bg-warning-soft text-warning-strong", text: "text-warning", dim: "text-warning" },
  rose:   { border: "border-danger/15",    hoverBorder: "hover:border-danger/30",    badge: "border-danger/20 bg-danger-soft text-danger-strong",    text: "text-danger",   dim: "text-danger" },
};

function DeepProfileCard({ profile, accentColor = "stone" }: { profile: DeepIngredientProfile; accentColor?: AccentColor }) {
  const a = ACCENT[accentColor];
  return (
    <div className={`overflow-hidden rounded-3xl border ${a.border} ${a.hoverBorder} bg-card/60 shadow-panel transition`}>
      {/* Header */}
      <div className="border-b border-border p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-foreground leading-snug">{profile.nameEn}</h3>
            {profile.nameAmharic && <div className={`mt-0.5 text-sm font-medium ${a.text}`}>{profile.nameAmharic}</div>}
            {profile.nameLocal && <div className="text-[10px] text-subtle">{profile.nameLocal}</div>}
            {profile.scientificName && <div className="mt-0.5 text-[10px] italic text-subtle">{profile.scientificName}</div>}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${a.badge}`}>{profile.category}</span>
            <span className="rounded-full border border-border bg-card/50 px-2 py-0.5 text-[10px] text-subtle">{profile.processingState}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              profile.dataConfidence === "high" ? "border-brand/20 bg-brand-soft text-brand-strong"
              : profile.dataConfidence === "medium" ? "border-gold/20 bg-gold-soft text-gold-strong"
              : "border-danger/20 bg-danger-soft text-danger-strong"
            }`}>{profile.dataConfidence} confidence</span>
          </div>
        </div>
        <p className={`mt-1.5 text-[9px] ${a.dim}`}>{profile.basis} · {profile.partUsed}</p>

        {/* Quick macro pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { l: "kcal", v: profile.proximate.energyKcal, c: "text-gold" },
            { l: "pro",  v: `${profile.proximate.protein_g}g`,       c: "text-info"     },
            { l: "carb", v: `${profile.proximate.carbohydrate_g}g`,  c: "text-plum"  },
            { l: "fat",  v: `${profile.proximate.fat_g}g`,           c: "text-danger"    },
            { l: "fiber",v: `${profile.proximate.dietaryFiber_g}g`,  c: "text-brand" },
            ...(profile.fattyAcids?.cholesterol_mg !== undefined
              ? [{ l: "chol", v: `${profile.fattyAcids.cholesterol_mg}mg`, c: profile.fattyAcids.cholesterol_mg === 0 ? "text-brand" : "text-warning" }]
              : []),
          ].map(({ l, v, c }) => (
            <span key={l} className="rounded-lg border border-border bg-sunken/50 px-2 py-0.5 font-mono text-[10px]">
              <span className="text-subtle">{l}: </span><span className={`font-bold ${c}`}>{v}</span>
            </span>
          ))}
        </div>

        {/* Key functional properties */}
        {profile.functionalProperties && profile.functionalProperties.length > 0 && (
          <ul className="mt-3 space-y-0.5">
            {profile.functionalProperties.slice(0, 3).map((p, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-soft">
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
          <div className={`mt-3 rounded-xl border ${a.border} p-3 text-[11px] leading-relaxed text-soft`}>
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
            ? "border border-brand/30 bg-brand/10 text-brand-strong hover:bg-brand/20"
            : isLinked
              ? "border border-info/20 bg-info/10 text-info-strong hover:bg-info/20"
              : "border border-border bg-foreground/[0.03] text-muted-foreground cursor-default"
        }`}
        title={deepProfile ? `View full nutrient profile: ${name}` : isLinked ? "Linked to catalog entry" : "No analytical composition record"}
      >
        {name}
        {deepProfile && (
          <span className="text-[9px] text-brand">{open ? "▲" : "▼"}</span>
        )}
        {!deepProfile && isLinked && <span className="text-[9px] text-info">↗</span>}
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
    fasting_friendly: "bg-brand-soft text-brand-strong border-brand/20",
    non_fasting: "bg-danger-soft text-danger-strong border-danger/20",
    dual: "bg-info-soft text-info-strong border-info/20",
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
      className="flex flex-col overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card/90 to-background/95 shadow-panel transition-all duration-300 hover:border-brand/20"
    >
      {/* Header */}
      <div className="border-b border-border p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold leading-tight text-foreground">{food.name}</h3>
            <div className="mt-0.5 font-medium text-gold text-xs">{food.nameAmharic}</div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="rounded-full border border-border bg-foreground/5 px-2 py-0.5 text-[10px] font-semibold text-soft">
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
            { label: "kcal", value: food.macros.caloriesKcal, color: "text-gold" },
            { label: "pro", value: `${food.macros.proteinG}g`, color: "text-info" },
            { label: "carb", value: `${food.macros.carbohydratesG}g`, color: "text-plum" },
            { label: "fat", value: `${food.macros.fatsG}g`, color: "text-danger" },
            { label: "fiber", value: `${food.macros.dietaryFiberG}g`, color: "text-brand" },
          ].map(({ label, value, color }) => (
            <span key={label} className="rounded-lg border border-border bg-sunken/50 px-2 py-0.5 font-mono text-[10px]">
              <span className="text-subtle">{label}: </span>
              <span className={`font-bold ${color}`}>{value}</span>
            </span>
          ))}
          {food.glycemicIndex && (
            <span className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] font-bold ${
              food.glycemicIndex.rating === "low" ? "border-brand/20 bg-brand-soft text-brand-strong" :
              food.glycemicIndex.rating === "medium" ? "border-gold/20 bg-gold-soft text-gold-strong" :
              "border-danger/20 bg-danger-soft text-danger-strong"
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
              ? "border-brand/30 bg-brand/10 text-brand-strong"
              : "border-border bg-foreground/[0.03] text-soft hover:border-brand/30 hover:text-brand-strong"
          }`}
        >
          {isCompared ? "✓ Added to comparison" : "＋ Compare nutrition"}
        </button>
      </div>

      {/* Preparation */}
      {food.traditionalPreparation && (
        <div className="border-b border-border px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">Preparation</p>
          <p className="mt-1 text-[11px] leading-relaxed text-soft">{food.traditionalPreparation}</p>
        </div>
      )}

      {/* Ingredients */}
      {cues.length > 0 && (
        <div className="border-b border-border px-5 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gold">
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
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-foreground/[0.03]"
      >
        <span className="text-[11px] font-semibold text-brand">
          Full nutritional composition
        </span>
        <span className={`text-brand transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-border p-5">
          {/* Nutrients from DB */}
          {food.nutrients.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Key Nutrient Values · per 100g</p>
              <div className="space-y-1.5">
                {food.nutrients.map((nut, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-foreground/[0.03] px-3 py-2 text-xs">
                    <span className="text-soft">
                      {nut.name}{nut.symbol && <span className="ml-1 font-mono text-subtle">({nut.symbol})</span>}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">{nut.amountPer100g} {nut.unit}</span>
                      {Number(nut.bioavailabilityFactor) > 1.0 && (
                        <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[9px] font-bold text-brand-strong border border-brand/20">
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
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-plum">Vitamins</p>
                  <p className="text-[11px] text-soft">{vitaminNutrients.map((n) => `${n.name}: ${n.amountPer100g} ${n.unit}`).join(" · ")}</p>
                </div>
              )}
              {mineralNutrients.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-info">Minerals</p>
                  <p className="text-[11px] text-soft">{mineralNutrients.map((n) => `${n.name}: ${n.amountPer100g} ${n.unit}`).join(" · ")}</p>
                </div>
              )}
            </div>
          )}

          {/* Phenolics */}
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-danger">Phenolics & Bioactives</p>
            <p className="text-[11px] leading-relaxed text-soft">
              {food.physiologicalNotes.bioactiveCompounds.join(" · ") || "Not recorded"}
            </p>
            <p className="mt-1 text-[9px] text-subtle">Qualitative — quantitative phenolic values not available for this catalog record.</p>
          </div>

          {/* Antinutrients */}
          <div className="rounded-xl border border-warning/10 bg-warning-soft/70 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-warning">Antinutritional Factors · per 100g</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <span className="text-subtle">Phytic acid</span><span className="text-right font-mono text-soft">{food.antinutrients.phyticAcidMgPer100g} mg</span>
              <span className="text-subtle">Tannins</span><span className="text-right font-mono text-soft">{food.antinutrients.tanninsMgPer100g} mg</span>
              <span className="text-subtle">Oxalates</span><span className="text-right font-mono text-soft">{food.antinutrients.oxalatesMgPer100g} mg</span>
              <span className="text-subtle">Trypsin inhibitor</span><span className="text-right font-mono capitalize text-soft">{food.antinutrients.trypsinInhibitorLevel}</span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-subtle">
              {food.antinutrients.traditionalDegradationMethod} Reduction by processing: {food.antinutrients.fermentationReductionPct}%.
            </p>
            <p className="mt-1 text-[10px] text-brand">{food.antinutrients.bioavailabilityUpliftDescription}</p>
          </div>

          {/* Health indications */}
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Therapeutic Indications</p>
            <div className="flex flex-wrap gap-1.5">
              {food.physiologicalNotes.primaryIndications.map((ind) => (
                <span key={ind} className="rounded-full border border-brand/15 bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand-strong">{ind}</span>
              ))}
            </div>
          </div>

          {/* Digestive tolerance */}
          <div className="rounded-xl border border-border bg-card/40 p-3 text-[11px] leading-relaxed text-soft">
            <strong className="block text-muted-foreground">Digestive tolerance:</strong>
            {food.physiologicalNotes.digestiveTolerance}
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-border px-5 py-2 flex items-center justify-between text-[9px] font-mono text-subtle">
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
    <div id={`cereal-${profile.uid}`} className="overflow-hidden rounded-3xl border border-gold/15 bg-gradient-to-b from-gold-soft to-background/80 shadow-panel transition-all hover:border-gold/25">
      {/* Header */}
      <div className="border-b border-border p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">{profile.nameEn}</h3>
            {profile.nameAmharic && <div className="mt-0.5 text-sm text-gold">{profile.nameAmharic}</div>}
            {profile.nameLocal && <div className="mt-0.5 text-[10px] text-subtle">{profile.nameLocal}</div>}
            <div className="mt-1 text-xs italic text-subtle">{profile.scientificName}</div>
          </div>
          <div className="rounded-lg border border-gold/20 bg-gold-soft px-2.5 py-1 text-[10px] font-semibold text-gold-strong">
            {profile.processingState}
          </div>
        </div>
        <p className="mt-1.5 text-[9px] text-subtle">{profile.basis}</p>

        {/* Quick proximate pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { l: "kcal", v: profile.proximate.energyKcal, c: "text-gold" },
            { l: "pro", v: `${profile.proximate.protein_g}g`, c: "text-info" },
            { l: "carb", v: `${profile.proximate.carbohydrate_g}g`, c: "text-plum" },
            { l: "fat", v: `${profile.proximate.fat_g}g`, c: "text-danger" },
            { l: "fiber", v: `${profile.proximate.dietaryFiber_g}g`, c: "text-brand" },
          ].map(({ l, v, c }) => (
            <span key={l} className="rounded-lg border border-border bg-sunken/50 px-2 py-0.5 font-mono text-[10px]">
              <span className="text-subtle">{l}: </span>
              <span className={`font-bold ${c}`}>{v}</span>
            </span>
          ))}
          {profile.glycemicIndex && (
            <span className="rounded-lg border border-brand/20 bg-brand-soft px-2 py-0.5 font-mono text-[10px] font-bold text-brand-strong">GI: {profile.glycemicIndex}</span>
          )}
        </div>

        {/* Uses */}
        {cerealBasic && (
          <div className="mt-3">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-subtle">Uses as ingredient</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{cerealBasic.useAsIngredient.join(" · ")}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-foreground/[0.02]"
      >
        <span className="text-[11px] font-semibold text-gold">Full nutrition: minerals · vitamins · amino acids · fatty acids · phenolics</span>
        <span className={`text-gold transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>⌄</span>
      </button>

      {expanded && (
        <div className="border-t border-border p-4">
          <DeepNutrientPanel profile={profile} />
          {profile.bioavailabilityNotes && (
            <div className="mt-3 rounded-xl border border-brand/15 bg-brand-soft/70 p-3 text-[11px] leading-relaxed text-soft">
              <strong className="text-brand block mb-0.5">Bioavailability notes:</strong>
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
    <main className="min-h-screen bg-background">
      {/* ───── Hero ───── */}
      <header className="relative overflow-hidden border-b border-brand/10 bg-gradient-to-br from-brand-soft via-background to-gold-soft px-6 py-14 md:py-20">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 -translate-y-1/2 rounded-full bg-brand/5 blur-3xl" />
          <div className="absolute right-1/3 bottom-0 h-64 w-64 translate-y-1/2 rounded-full bg-gold/4 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/8 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-strong">
            🌿 Ethiopian Food Science & Composition
          </div>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
            Food as Memory,<br />
            <span className="bg-gradient-to-r from-brand via-brand to-gold-fill bg-clip-text text-transparent">
              Medicine & Daily Practice
            </span>
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Explore the full nutritional science of Ethiopian foods — from raw cereal grain amino acid profiles to fermented injera phenolics and antinutritional factor reduction.
            Click any ingredient chip to expand its complete nutrient composition.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-subtle">
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
              <div key={label} className="flex items-center gap-1.5 rounded-full border border-border bg-foreground/[0.03] px-3 py-1">
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-brand/25 bg-gradient-to-r from-brand-soft via-card/60 to-gold-soft p-5 ">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-strong">
                  ⚡ New Interactive Engine
                </div>
                <h2 className="mt-1.5 text-base font-bold text-foreground sm:text-lg">
                  Composite Diet & Best Recipe Formulator (የተመጣጠነ ቅይጥ ምግብ አስሊ)
                </h2>
                <p className="mt-1 text-xs text-soft max-w-2xl">
                  Formulate traditional Ethiopian diets (including <strong>Yetsom Beyayinetu</strong>, Shiro Tegabino, Doro Wot, Kitfo, and Genfo)
                  calibrated for weight loss, muscle build, diabetes, or recovery. Generates recipes <strong>per serving</strong>, <strong>per day</strong>,
                  and <strong>per month</strong> with 12 amino acids, fatty acids, bioavailable minerals, and enzyme activation cofactors.
                </p>
              </div>
              <div className="shrink-0 flex flex-wrap sm:flex-col gap-2">
                <Link
                  href="/foods/composite-formulator"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand to-brand px-4 py-2.5 text-xs font-bold text-brand-foreground shadow-panel transition-all hover:scale-105 hover:from-brand hover:to-brand"
                >
                  <span>100 Diets Formulator</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/foods/dynamic-formulator"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand/40 bg-brand-soft px-4 py-2 text-xs font-bold text-brand-strong transition-all hover:bg-brand-soft"
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
      <div className="sticky top-0 z-30 border-b border-border bg-background/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto max-w-6xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
            <input
              ref={searchRef}
              type="search"
              placeholder="Search foods, ingredients, nutrients, indications…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-foreground/5 py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-subtle focus:border-brand/40 focus:bg-foreground/8 focus:outline-none focus:ring-1 focus:ring-brand/30"
            />
            {search && (
              <button onClick={clearSearch} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">✕</button>
            )}
          </div>
          {/* Filters (recipe tab only) */}
          {activeTab === "recipes" && (
            <div className="flex flex-wrap gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="rounded-full border border-border bg-card px-3 py-2 text-xs text-soft focus:border-brand/40 focus:outline-none"
              >
                {FOOD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={fasting}
                onChange={(e) => setFasting(e.target.value)}
                className="rounded-full border border-border bg-card px-3 py-2 text-xs text-soft focus:border-brand/40 focus:outline-none"
              >
                {FASTING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ───── Tab navigation ───── */}
      <div className="border-b border-border bg-background px-6">
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
                  ? "border-brand text-brand"
                  : "border-transparent text-subtle hover:border-border-strong hover:text-soft"
              }`}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
      </div>

      {comparedFoods.length > 0 && (
        <section aria-labelledby="food-comparison-heading" className="border-b border-brand/10 bg-brand-soft/70 px-6 py-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Nutrition analysis</div>
                <h2 id="food-comparison-heading" className="mt-1 text-lg font-bold text-foreground">Compare foods by portion</h2>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                  Values are scaled from each record’s per-100 g estimates. Adjust the serving weight to compare like-for-like portions; this is not a personalized dietary prescription.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-soft">
                Portion
                <input
                  aria-label="Comparison portion in grams"
                  type="number"
                  min="1"
                  max="2000"
                  step="10"
                  value={portionGrams}
                  onChange={(event) => setPortionGrams(Math.min(2000, Math.max(1, Number(event.target.value) || 1)))}
                  className="w-24 rounded-lg border border-border bg-card px-3 py-2 font-mono text-foreground focus:border-brand/40 focus:outline-none"
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
                  className="rounded-full border border-brand/20 bg-brand-soft px-3 py-1.5 text-[11px] text-brand-strong transition hover:border-danger/30 hover:text-danger-strong"
                >
                  {food.name} <span aria-hidden="true">×</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setComparisonIds([]); setComparisonNotice(""); }}
                className="rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground transition hover:text-foreground"
              >
                Clear comparison
              </button>
            </div>
            {comparisonNotice && (
              <p role="status" className="mt-2 text-xs text-gold">{comparisonNotice}</p>
            )}

            <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-sunken/50">
              <table className="w-full min-w-[620px] text-left text-xs">
                <caption className="sr-only">Nutrient comparison for a {portionGrams} gram portion</caption>
                <thead className="border-b border-border bg-foreground/[0.03] text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3">Nutrient per {portionGrams} g</th>
                    {comparedFoods.map((food) => (
                      <th scope="col" key={food.id} className="px-4 py-3 text-right">{food.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { name: "Energy", unit: "kcal", getValue: (food: typeof EFCT_MASTER_FOODS[number]) => food.macros.caloriesKcal },
                    { name: "Protein", unit: "g", getValue: (food: typeof EFCT_MASTER_FOODS[number]) => food.macros.proteinG },
                    { name: "Carbohydrate", unit: "g", getValue: (food: typeof EFCT_MASTER_FOODS[number]) => food.macros.carbohydratesG },
                    { name: "Fat", unit: "g", getValue: (food: typeof EFCT_MASTER_FOODS[number]) => food.macros.fatsG },
                    { name: "Dietary fiber", unit: "g", getValue: (food: typeof EFCT_MASTER_FOODS[number]) => food.macros.dietaryFiberG },
                  ].map((nutrient) => (
                    <tr key={nutrient.name}>
                      <th scope="row" className="px-4 py-2.5 font-medium text-soft">{nutrient.name}</th>
                      {comparedFoods.map((food) => (
                        <td key={food.id} className="px-4 py-2.5 text-right font-mono text-foreground">
                          {(nutrient.getValue(food) * portionGrams / 100).toFixed(1)} <span className="text-subtle">{nutrient.unit}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                  {comparisonNutrients.map((nutrient) => (
                    <tr key={nutrient.name}>
                      <th scope="row" className="px-4 py-2.5 font-medium text-soft">{nutrient.name}</th>
                      {comparedFoods.map((food) => {
                        const value = food.nutrients.find((item) => item.name.toLowerCase() === nutrient.name.toLowerCase());
                        return (
                          <td key={food.id} className="px-4 py-2.5 text-right font-mono text-foreground">
                            {value ? `${(value.amountPer100g * portionGrams / 100).toFixed(2)} ${value.unit}` : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-subtle">
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
              <div className="py-20 text-center text-subtle">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-semibold text-muted-foreground">No foods match your search</p>
                <button onClick={() => { setSearch(""); setCategory("All"); setFasting("All"); }} className="mt-4 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground">Clear filters</button>
              </div>
            ) : (
              Object.entries(categoryGroups).map(([cat, foods]) => (
                <section key={cat} className="mb-12">
                  <div className="mb-5 flex items-center gap-3">
                    <h2 className="text-lg font-bold text-foreground">{cat}</h2>
                    <span className="rounded-full border border-border bg-foreground/5 px-2 py-0.5 text-[10px] text-muted-foreground">{foods.length} items</span>
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
            <div className="mb-6 rounded-2xl border border-gold/15 bg-gold-soft/70 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-2">Reference Estimates — Dry Raw Grain per 100 g</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Values are generic food-composition reference estimates from published tables (USDA FoodData Central, FAO/INFOODS AFDB, peer-reviewed Ethiopian cereal studies).
                They are not Ethiopian cultivar-specific laboratory measurements. Cultivar, growing conditions, milling degree, moisture content, and analytical method cause significant real-world variation.
                Click any card to expand the full nutrient matrix including amino acids, fatty acids, phenolics, and antinutrients.
              </p>
            </div>

            {/* Comparison table */}
            <div className="mb-8 overflow-x-auto rounded-2xl border border-border bg-card/40">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="border-b border-border bg-sunken/80 text-[10px] uppercase tracking-[0.12em] text-subtle">
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
                <tbody className="divide-y divide-border">
                  {filteredCereals.map((c) => (
                    <tr key={c.uid} className="cursor-pointer text-soft transition-colors hover:bg-foreground/[0.03]">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{c.nameEn}</div>
                        <div className="text-gold">{c.nameAmharic}</div>
                        <div className="text-[10px] italic text-subtle">{c.scientificName}</div>
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
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${c.glycemicIndex < 55 ? "bg-brand-soft text-brand-strong" : "bg-gold-soft text-gold-strong"}`}>
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
            <div className="mb-6 rounded-2xl border border-border bg-card/40 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Non-Cereal Ingredient Profiles</p>
              <p className="text-xs leading-relaxed text-subtle">
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
            <div className="mb-6 rounded-2xl border border-brand/20 bg-brand-soft/70 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand mb-2">🌱 Germinated & Sprouted Seeds — Complete Profiles</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
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
            <div className="mb-6 rounded-2xl border border-brand/20 bg-brand-soft/70 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand mb-2">🥦 Vegetable Profiles — Ethiopian & Universal</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
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
            <div className="mb-6 rounded-2xl border border-warning/20 bg-warning-soft/70 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-warning mb-2">🍊 Fruit Profiles — Ethiopian & Tropical</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
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
            <div className="mb-6 rounded-2xl border border-danger/20 bg-danger-soft/70 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-danger mb-2">🥩 Animal Product Profiles — Complete Nutrient Matrix</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
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
      <footer className="border-t border-border px-6 py-8 text-center text-[10px] text-subtle">
        <p>Ethiopian Food Composition Database · Reference estimates from USDA FoodData Central, FAO/INFOODS WAFCT, FAO East Africa FCT, and peer-reviewed Ethiopian food science literature.</p>
        <p className="mt-1">Values are for informational and research purposes. Not a substitute for certified laboratory analysis. Clinical nutritional decisions require qualified dietitian guidance.</p>
      </footer>
    </main>
  );
}
