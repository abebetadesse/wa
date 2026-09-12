"use client";

import { useState } from "react";
import Link from "next/link";
import { convertToHabeshaTime } from "@/lib/engines/chrononutritionEngine";
import {
  evaluateFastingStatus,
  EATER_ARCHETYPES,
  EaterArchetype,
  FastingSeason,
} from "@/lib/engines/fastingMetabolismEngine";

export default function FastingPage() {
  // Enhancement 3 State: Habesha Clock
  const now = new Date();
  const [currentHour24, setCurrentHour24] = useState<number>(now.getHours());
  const [currentMinute, setCurrentMinute] = useState<number>(now.getMinutes());
  const habeshaTime = convertToHabeshaTime(currentHour24, currentMinute);

  // Enhancement 4 State: Fasting Calendar
  const [selectedSeason, setSelectedSeason] = useState<FastingSeason>("abiy_tsom");
  const fastingProfile = evaluateFastingStatus(
    selectedSeason === "filseta"
      ? new Date(2026, 7, 15)
      : selectedSeason === "abiy_tsom"
      ? new Date(2026, 2, 10)
      : selectedSeason === "tsome_nebiyat"
      ? new Date(2026, 11, 1)
      : new Date(2026, 4, 10)
  );

  // Enhancement 5 State: Eater Archetype
  const [selectedArchetype, setSelectedArchetype] = useState<EaterArchetype>("highland_agrarian");
  const archetypeProfile = EATER_ARCHETYPES[selectedArchetype];

  return (
    <div className="app-container py-10 space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
          <span>Chrononutrition & Fasting Metabolism Engine</span>
          <span>•</span>
          <span className="text-amber-400">Enhancements 3, 4 & 5</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Equatorial Sun Clock, Tsom Calendar & Eater Archetypes
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-3xl mt-2">
          Aligning carbohydrate ingestion with the 12-hour equatorial Habesha solar rhythm, mitigating
          micronutrient depletion across 250+ Orthodox fasting days, and balancing dietary macronutrients by cultural archetype.
        </p>
      </div>

      {/* Enhancement 3: Habesha Equatorial Sun Clock */}
      <div className="glass-panel p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Enhancement 3</span>
            <h2 className="text-2xl font-bold text-white">Equatorial 12-Hour Habesha Sun Clock (የኢትዮጵያ ሰዓት አቆጣጠር)</h2>
            <p className="text-xs text-slate-400 mt-1">
              Ethiopia is situated 9°N of the equator: sunrise is 6:00 AM (0:00 / 1:00 ሰዓት). GLUT4 insulin sensitivity peaks midday.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const d = new Date();
                setCurrentHour24(d.getHours());
                setCurrentMinute(d.getMinutes());
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Sync Current Time
            </button>
          </div>
        </div>

        {/* Time Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300">Standard 24-Hour Time:</span>
            <span className="font-mono text-emerald-400 font-bold text-lg">
              {currentHour24.toString().padStart(2, "0")}:{currentMinute.toString().padStart(2, "0")}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={currentHour24}
            onChange={(e) => setCurrentHour24(Number(e.target.value))}
            className="w-full h-2.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>00:00 (Midnight)</span>
            <span>06:00 (Sunrise / 12h)</span>
            <span>12:00 (Noon / 6h)</span>
            <span>18:00 (Sunset / 12h)</span>
            <span>23:00 (Late Night)</span>
          </div>
        </div>

        {/* Clock Result Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Ethiopian Clock (Habesha Ketat)</span>
              <p className="text-2xl md:text-3xl font-extrabold text-amber-400">
                {habeshaTime.ethiopianHourLabelAmharic}
              </p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white/10 text-white">
                {habeshaTime.isDaytime ? "☀️ የቀን ክፍለ ጊዜ (Daytime)" : "🌙 የማታ ክፍለ ጊዜ (Nighttime)"}
              </span>
            </div>
            <div className="pt-3 border-t border-white/5 text-xs text-slate-400">
              Circadian Phase: <strong className="text-emerald-400 uppercase">{habeshaTime.circadianPhase.replace("_", " ")}</strong>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-black/40 border border-white/5 space-y-3 md:col-span-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-slate-400 block">Metabolic Timing Recommendation</span>
                <h3 className="font-bold text-white text-base mt-0.5">
                  {habeshaTime.macronutrientPartitioningPriority.recommendedMealType}
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  habeshaTime.macronutrientPartitioningPriority.carbohydrateTolerance === "very_high"
                    ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-400"
                    : habeshaTime.macronutrientPartitioningPriority.carbohydrateTolerance === "high"
                    ? "bg-amber-950/60 border border-amber-500/40 text-amber-400"
                    : "bg-slate-800 border border-white/10 text-slate-300"
                }`}
              >
                Carb Tolerance: {habeshaTime.macronutrientPartitioningPriority.carbohydrateTolerance.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {habeshaTime.macronutrientPartitioningPriority.metabolicNote}
            </p>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Optimal Traditional Habesha Foods for this Window:</span>
              <div className="flex flex-wrap gap-2">
                {habeshaTime.macronutrientPartitioningPriority.optimalFoods.map((food, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
                    {food}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhancement 4: Orthodox Christian Tsom Fasting & Refeeding Engine */}
      <div className="glass-panel p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Enhancement 4</span>
            <h2 className="text-2xl font-bold text-white">Ethiopian Orthodox Tsom (ጾም) Fasting & Refeeding Engine</h2>
            <p className="text-xs text-slate-400 mt-1">
              Observing up to 250 vegan days annually creates unique micronutrient depletion dynamics (B12, Zinc, EPA/DHA) and requires structured refeeding.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value as FastingSeason)}
              className="bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="abiy_tsom">ዐቢይ ጾም (Great Lent - 55 Days)</option>
              <option value="filseta">ጾመ ፍልሰታ (Assumption of Mary - 16 Days)</option>
              <option value="tsome_nebiyat">ጾመ ነቢያት (Prophets' Fast - 43 Days)</option>
              <option value="weekly_wed_fri">ረቡዕና ዓርብ (Wed & Fri Fast)</option>
              <option value="non_fasting_season">መደበኛ ፍስክ (Non-Fasting Period)</option>
            </select>
          </div>
        </div>

        {/* Fasting Micronutrient Vulnerabilities */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Micronutrient Vulnerabilities during {fastingProfile.seasonNameAmharic}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fastingProfile.micronutrientVulnerabilities.map((vuln, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <strong className="text-white text-sm">{vuln.nutrient}</strong>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      vuln.depletionRisk === "high"
                        ? "bg-rose-950/60 border border-rose-500/30 text-rose-400"
                        : "bg-amber-950/60 border border-amber-500/30 text-amber-400"
                    }`}
                  >
                    {vuln.depletionRisk.toUpperCase()} RISK
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{vuln.physiologicalMechanism}</p>
                <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-[11px]">
                  <strong>Indigenous Solution:</strong> {vuln.indigenousCompensationStrategy}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refeeding Protocol Warning */}
        <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">⚠️</span>
            <h4 className="font-bold text-amber-200 text-sm">{fastingProfile.refeedingSafeguards.phase}</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {fastingProfile.refeedingSafeguards.protocol}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-amber-500/20 text-xs">
            <div>
              <span className="text-rose-400 font-semibold block mb-1">❌ Contraindicated First Meals (Biliary Risk):</span>
              <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                {fastingProfile.refeedingSafeguards.contraindicatedFirstMeals.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-emerald-400 font-semibold block mb-1">✓ Recommended Enzymatic Rehabilitation:</span>
              <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                {fastingProfile.refeedingSafeguards.digestiveSupportRemedies.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Enhancement 5: Ethiopian Eater Archetype Classifier */}
      <div className="glass-panel p-6 md:p-8 space-y-6">
        <div className="border-b border-white/10 pb-4">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Enhancement 5</span>
          <h2 className="text-2xl font-bold text-white">Ethiopian Eater Archetype Classifier</h2>
          <p className="text-xs text-slate-400 mt-1">
            Tailoring macronutrient splits and metabolic risk surveillance to ancestral and contemporary Habesha lifestyles.
          </p>
        </div>

        {/* Archetype Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(Object.keys(EATER_ARCHETYPES) as EaterArchetype[]).map((key) => {
            const arch = EATER_ARCHETYPES[key];
            const isSelected = selectedArchetype === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedArchetype(key)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? "bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/50"
                    : "bg-black/30 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-xs block font-bold truncate">{arch.nameAmharic}</span>
                <span className="text-[10px] text-slate-400 block">{arch.nameEnglish}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Archetype Details */}
        <div className="p-6 rounded-xl bg-black/40 border border-white/5 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{archetypeProfile.nameAmharic}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{archetypeProfile.description}</p>
            </div>
          </div>

          {/* Macro Split Progress Bars */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 block">Recommended Ancestral Macronutrient Split:</span>
            <div className="grid grid-cols-3 gap-3 text-xs text-center">
              <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/20">
                <span className="text-slate-400 block text-[10px]">Carbohydrates</span>
                <span className="font-mono text-emerald-400 font-extrabold text-base">
                  {archetypeProfile.macronutrientDistribution.carbohydratesPct}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-amber-950/30 border border-amber-500/20">
                <span className="text-slate-400 block text-[10px]">Proteins</span>
                <span className="font-mono text-amber-400 font-extrabold text-base">
                  {archetypeProfile.macronutrientDistribution.proteinPct}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/20">
                <span className="text-slate-400 block text-[10px]">Fats / Lipids</span>
                <span className="font-mono text-rose-400 font-extrabold text-base">
                  {archetypeProfile.macronutrientDistribution.fatPct}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-white/5 space-y-1.5">
              <span className="text-emerald-400 font-semibold block">Recommended Traditional Staples:</span>
              <div className="flex flex-wrap gap-1.5">
                {archetypeProfile.recommendedTraditionalStaples.map((staple, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-200 text-[11px]">
                    {staple}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/5 space-y-1.5">
              <span className="text-rose-400 font-semibold block">Key Metabolic Vulnerabilities:</span>
              <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                {archetypeProfile.keyBiochemicalRisks.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs">
            <strong className="text-emerald-400">Tailored Clinical & Cultural Advice:</strong>{" "}
            <span className="text-slate-200">{archetypeProfile.tailoredHabeshaAdvice}</span>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-8 border-t border-white/10 text-xs">
        <Link href="/ecology" className="text-slate-400 hover:text-white transition-colors">
          ← Back to Agro-Ecology
        </Link>
        <Link href="/zoonotic" className="btn-primary text-xs py-2 px-4">
          Explore Terroir, Apiculture & Safety →
        </Link>
      </div>
    </div>
  );
}
