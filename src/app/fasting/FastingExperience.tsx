"use client";

import Link from "next/link";
import { useState } from "react";
import { convertToHabeshaTime } from "@/lib/engines/chrononutritionEngine";
import {
  evaluateFastingStatus,
  EATER_ARCHETYPES,
  EaterArchetype,
  FastingSeason,
} from "@/lib/engines/fastingMetabolismEngine";

export default function FastingExperience() {
  const now = new Date();
  const [currentHour24, setCurrentHour24] = useState<number>(now.getHours());
  const [currentMinute, setCurrentMinute] = useState<number>(now.getMinutes());
  const habeshaTime = convertToHabeshaTime(currentHour24, currentMinute);

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

  const [selectedArchetype, setSelectedArchetype] = useState<EaterArchetype>("highland_agrarian");
  const archetypeProfile = EATER_ARCHETYPES[selectedArchetype];

  return (
    <div className="app-container py-10 space-y-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-2">
          <span>Chrononutrition & Fasting Metabolism Engine</span>
          <span>•</span>
          <span className="text-gold">Enhancements 3, 4 & 5</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          Equatorial Sun Clock, Tsom Calendar & Eater Archetypes
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-3xl mt-2">
          Aligning carbohydrate ingestion with the 12-hour equatorial Habesha solar rhythm, mitigating
          micronutrient depletion across 250+ Orthodox fasting days, and balancing dietary macronutrients by cultural archetype.
        </p>
      </div>

      <div className="glass-panel p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold text-gold uppercase tracking-wider">Enhancement 3</span>
            <h2 className="text-2xl font-bold text-foreground">Equatorial 12-Hour Habesha Sun Clock (የኢትዮጵያ ሰዓት አቆጣጠር)</h2>
            <p className="text-xs text-muted-foreground mt-1">
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
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand hover:bg-brand text-brand-foreground transition-colors"
            >
              Sync Current Time
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-soft">Standard 24-Hour Time:</span>
            <span className="font-mono text-brand font-bold text-lg">
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
            className="w-full h-2.5 bg-sunken/80 rounded-lg appearance-none cursor-pointer accent-gold"
          />
          <div className="flex justify-between text-[10px] text-subtle font-mono">
            <span>00:00 (Midnight)</span>
            <span>06:00 (Sunrise / 12h)</span>
            <span>12:00 (Noon / 6h)</span>
            <span>18:00 (Sunset / 12h)</span>
            <span>23:00 (Late Night)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-sunken/80 border border-border flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Ethiopian Clock (Habesha Ketat)</span>
              <p className="text-2xl md:text-3xl font-extrabold text-gold">
                {habeshaTime.ethiopianHourLabelAmharic}
              </p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-foreground/10 text-foreground">
                {habeshaTime.isDaytime ? "☀️ የቀን ክፍለ ጊዜ (Daytime)" : "🌙 የማታ ክፍለ ጊዜ (Nighttime)"}
              </span>
            </div>
            <div className="pt-3 border-t border-border text-xs text-muted-foreground">
              Circadian Phase: <strong className="text-brand uppercase">{habeshaTime.circadianPhase.replace("_", " ")}</strong>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-sunken/80 border border-border space-y-3 md:col-span-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-muted-foreground block">Metabolic Timing Recommendation</span>
                <h3 className="font-bold text-foreground text-base mt-0.5">
                  {habeshaTime.macronutrientPartitioningPriority.recommendedMealType}
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${habeshaTime.macronutrientPartitioningPriority.carbohydrateTolerance === "very_high"
                    ? "bg-brand-soft border border-brand/40 text-brand-strong"
                    : habeshaTime.macronutrientPartitioningPriority.carbohydrateTolerance === "high"
                      ? "bg-gold-soft border border-gold/40 text-gold-strong"
                      : "bg-muted border border-border text-soft"
                  }`}
              >
                Carb Tolerance: {habeshaTime.macronutrientPartitioningPriority.carbohydrateTolerance.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-soft leading-relaxed">
              {habeshaTime.macronutrientPartitioningPriority.metabolicNote}
            </p>

            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">Optimal Traditional Habesha Foods for this Window:</span>
              <div className="flex flex-wrap gap-2">
                {habeshaTime.macronutrientPartitioningPriority.optimalFoods.map((food, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-brand-soft border border-brand/20 text-brand-strong">
                    {food}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold text-gold uppercase tracking-wider">Enhancement 4</span>
            <h2 className="text-2xl font-bold text-foreground">Ethiopian Orthodox Tsom (ጾም) Fasting & Refeeding Engine</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Observing up to 250 vegan days annually creates unique micronutrient depletion dynamics (B12, Zinc, EPA/DHA) and requires structured refeeding.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value as FastingSeason)}
              className="bg-sunken/80 border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-gold"
            >
              <option value="abiy_tsom">ዐቢይ ጾም (Great Lent - 55 Days)</option>
              <option value="filseta">ጾመ ፍልሰታ (Assumption of Mary - 16 Days)</option>
              <option value="tsome_nebiyat">ጾመ ነቢያት (Prophets' Fast - 43 Days)</option>
              <option value="weekly_wed_fri">ረቡዕና ዓርብ (Wed & Fri Fast)</option>
              <option value="non_fasting_season">መደበኛ ፍስክ (Non-Fasting Period)</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-soft uppercase tracking-wider">
            Micronutrient Vulnerabilities during {fastingProfile.seasonNameAmharic}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fastingProfile.micronutrientVulnerabilities.map((vuln, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-sunken/50 border border-border space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <strong className="text-foreground text-sm">{vuln.nutrient}</strong>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${vuln.depletionRisk === "high"
                        ? "bg-danger-soft border border-danger/30 text-danger-strong"
                        : "bg-gold-soft border border-gold/30 text-gold-strong"
                      }`}
                  >
                    {vuln.depletionRisk.toUpperCase()} RISK
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">{vuln.physiologicalMechanism}</p>
                <div className="p-2 rounded bg-brand-soft border border-brand/20 text-brand-strong text-[11px]">
                  <strong>Indigenous Solution:</strong> {vuln.indigenousCompensationStrategy}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-gold-soft border border-gold/30 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-gold text-lg">⚠️</span>
            <h4 className="font-bold text-gold-strong text-sm">{fastingProfile.refeedingSafeguards.phase}</h4>
          </div>
          <p className="text-xs text-soft leading-relaxed">
            {fastingProfile.refeedingSafeguards.protocol}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gold/20 text-xs">
            <div>
              <span className="text-danger font-semibold block mb-1">❌ Contraindicated First Meals (Biliary Risk):</span>
              <ul className="list-disc list-inside text-muted-foreground text-[11px] space-y-0.5">
                {fastingProfile.refeedingSafeguards.contraindicatedFirstMeals.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-brand font-semibold block mb-1">✓ Recommended Enzymatic Rehabilitation:</span>
              <ul className="list-disc list-inside text-soft text-[11px] space-y-0.5">
                {fastingProfile.refeedingSafeguards.digestiveSupportRemedies.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 md:p-8 space-y-6">
        <div className="border-b border-border pb-4">
          <span className="text-xs font-bold text-brand uppercase tracking-wider">Enhancement 5</span>
          <h2 className="text-2xl font-bold text-foreground">Ethiopian Eater Archetype Classifier</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Tailoring macronutrient splits and metabolic risk surveillance to ancestral and contemporary Habesha lifestyles.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(Object.keys(EATER_ARCHETYPES) as EaterArchetype[]).map((key) => {
            const arch = EATER_ARCHETYPES[key];
            const isSelected = selectedArchetype === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedArchetype(key)}
                className={`p-3 rounded-xl text-left border transition-all ${isSelected
                    ? "bg-brand-soft border-brand text-foreground shadow-panel"
                    : "bg-sunken/50 border-border text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
              >
                <span className="text-xs block font-bold truncate">{arch.nameAmharic}</span>
                <span className="text-[10px] text-muted-foreground block">{arch.nameEnglish}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 rounded-xl bg-sunken/80 border border-border space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">{archetypeProfile.nameAmharic}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{archetypeProfile.description}</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-muted-foreground block">Recommended Ancestral Macronutrient Split:</span>
            <div className="grid grid-cols-3 gap-3 text-xs text-center">
              <div className="p-2.5 rounded bg-brand-soft border border-brand/20">
                <span className="text-muted-foreground block text-[10px]">Carbohydrates</span>
                <span className="font-mono text-brand font-extrabold text-base">
                  {archetypeProfile.macronutrientDistribution.carbohydratesPct}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-gold-soft border border-gold/20">
                <span className="text-muted-foreground block text-[10px]">Proteins</span>
                <span className="font-mono text-gold font-extrabold text-base">
                  {archetypeProfile.macronutrientDistribution.proteinPct}%
                </span>
              </div>
              <div className="p-2.5 rounded bg-danger-soft border border-danger/20">
                <span className="text-muted-foreground block text-[10px]">Fats / Lipids</span>
                <span className="font-mono text-danger font-extrabold text-base">
                  {archetypeProfile.macronutrientDistribution.fatPct}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-foreground/5 space-y-1.5">
              <span className="text-brand font-semibold block">Recommended Traditional Staples:</span>
              <div className="flex flex-wrap gap-1.5">
                {archetypeProfile.recommendedTraditionalStaples.map((staple, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-sunken/80 border border-border text-soft text-[11px]">
                    {staple}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-foreground/5 space-y-1.5">
              <span className="text-danger font-semibold block">Key Metabolic Vulnerabilities:</span>
              <ul className="list-disc list-inside text-soft text-[11px] space-y-0.5">
                {archetypeProfile.keyBiochemicalRisks.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-brand-soft border border-brand/20 text-xs">
            <strong className="text-brand">Tailored Scientific & Cultural Advice:</strong>{" "}
            <span className="text-soft">{archetypeProfile.tailoredHabeshaAdvice}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-border text-xs">
        <Link href="/ecology" className="text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Agro-Ecology
        </Link>
        <Link href="/zoonotic" className="btn-primary text-xs py-2 px-4">
          Explore Regional Ecology, Apiculture & Safety →
        </Link>
      </div>
    </div>
  );
}
