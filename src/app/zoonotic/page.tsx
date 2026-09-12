"use client";

import { useState } from "react";
import Link from "next/link";
import {
  evaluateRawMeatSafety,
  getZebuNiterKibbehProfile,
  RawMeatConsumptionFrequency,
} from "@/lib/engines/zoonoticSafetyEngine";
import { getTazmaApitherapyProfile } from "@/lib/engines/apitherapyEngine";
import { evaluateVectorSafeIron } from "@/lib/engines/vectorSafeNutritionEngine";
import { getEnsetMicrobiomeProfile } from "@/lib/engines/fermentationMicrobiomeEngine";

export default function ZoonoticPage() {
  // Enhancement 6 State
  const [rawMeatFreq, setRawMeatFreq] = useState<RawMeatConsumptionFrequency>("weekly");
  const [hasSymptoms, setHasSymptoms] = useState<boolean>(false);
  const [consideringKosso, setConsideringKosso] = useState<boolean>(true);
  const parasitologyAssessment = evaluateRawMeatSafety(rawMeatFreq, hasSymptoms, consideringKosso);

  // Enhancement 7 State
  const zebuProfile = getZebuNiterKibbehProfile();

  // Enhancement 8 State
  const tazmaProfile = getTazmaApitherapyProfile();

  // Enhancement 9 State
  const [vectorAltitude, setVectorAltitude] = useState<number>(600);
  const [vectorRegion, setVectorRegion] = useState<string>("Gambela");
  const [intendedIronDose, setIntendedIronDose] = useState<number>(65);
  const vectorAssessment = evaluateVectorSafeIron({
    altitudeMeters: vectorAltitude,
    region: vectorRegion,
    intendedIronSupplementDoseMg: intendedIronDose,
    isSleepingUnderInsecticideTreatedNet: false,
  });

  // Enhancement 12 State
  const [selectedEnsetProduct, setSelectedEnsetProduct] = useState<"kocho" | "bulla">("kocho");
  const ensetProfile = getEnsetMicrobiomeProfile(selectedEnsetProduct);

  return (
    <div className="app-container py-10 space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
          <span>Terroir, Apiculture & Clinical Safety Gates</span>
          <span>•</span>
          <span className="text-amber-400">Enhancements 6, 7, 8, 9 & 12</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Zoonotic Safety, Zebu Lipidomics & Apitherapy
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-3xl mt-2">
          Clinical safety surveillance for raw meat consumption and toxic Kosso interception, highland Zebu pasture lipidomics,
          subterranean Tazma honey pharmacopeia, lowland malaria vector iron gating, and Enset colonic butyrate modeling.
        </p>
      </div>

      {/* Grid: Enhancement 6 (Raw Meat & Kosso Intercept) & Enhancement 9 (Vector-Safe Iron) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhancement 6: Kitfo Parasitology & Kosso Intercept */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Enhancement 6 (Safety Gate)</span>
              <h2 className="text-xl font-bold text-white">Kitfo Parasitology & Kosso Interceptor</h2>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                parasitologyAssessment.riskTier === "critical" || parasitologyAssessment.riskTier === "high"
                  ? "bg-rose-950/60 border-rose-500/40 text-rose-400"
                  : "bg-emerald-950/60 border-emerald-500/30 text-emerald-400"
              }`}
            >
              {parasitologyAssessment.riskTier.toUpperCase()} RISK
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Raw Beef Intake (Kitfo / Tere Siga):</label>
              <select
                value={rawMeatFreq}
                onChange={(e) => setRawMeatFreq(e.target.value as RawMeatConsumptionFrequency)}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="never">Never / Fully Cooked Only</option>
                <option value="rarely">Rarely (Holiday Feasts)</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="multiple_per_week">Multiple Times Per Week</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSymptoms}
                  onChange={(e) => setHasSymptoms(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-rose-500 focus:ring-0"
                />
                <span>Experiencing unexplained epigastric discomfort or nausea</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consideringKosso}
                  onChange={(e) => setConsideringKosso(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-rose-500 focus:ring-0"
                />
                <span className="text-amber-300 font-medium">Considering traditional Kosso (ኮሶ) flower infusion</span>
              </label>
            </div>
          </div>

          {/* Kosso Intercept Alert */}
          {parasitologyAssessment.kossoSafetyIntercept.interceptTriggered && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <span>🛑</span>
                <span>{parasitologyAssessment.kossoSafetyIntercept.warningTitle}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {parasitologyAssessment.kossoSafetyIntercept.clinicalAlert}
              </p>
              <div className="p-2.5 rounded bg-black/40 border border-rose-500/20 text-emerald-300 text-[11px] space-y-1">
                <strong>Clinically Validated Safe Protocol:</strong>
                <p className="text-slate-200">{parasitologyAssessment.kossoSafetyIntercept.saferConventionalAlternative}</p>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-lg bg-black/30 border border-white/5 space-y-2 text-xs">
            <span className="text-slate-400 font-semibold block text-[11px]">Culinary Hygiene Guidance:</span>
            <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
              {parasitologyAssessment.culinaryHygieneRecommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Enhancement 9: Lowland Vector-Safe Iron Gating */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Enhancement 9 (Safety Gate)</span>
              <h2 className="text-xl font-bold text-white">Lowland Vector-Safe Iron Gate</h2>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                vectorAssessment.ironSafetyGateAction === "block_high_dose_supplement"
                  ? "bg-rose-950/60 border-rose-500/40 text-rose-400"
                  : "bg-emerald-950/60 border-emerald-500/30 text-emerald-400"
              }`}
            >
              {vectorAssessment.ironSafetyGateAction.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Region:</label>
              <select
                value={vectorRegion}
                onChange={(e) => setVectorRegion(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Gambela">Gambela (550m - Endemic)</option>
                <option value="Afar">Afar / Awash (400m - Endemic)</option>
                <option value="Arba Minch">Arba Minch (1,280m - Endemic)</option>
                <option value="Addis Ababa">Addis Ababa (2,400m - Non-Endemic)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Elevation (Meters):</label>
              <input
                type="number"
                value={vectorAltitude}
                onChange={(e) => setVectorAltitude(Number(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300">Intended Oral Iron Dose (mg elemental Fe):</span>
              <span className="font-mono text-amber-400 font-bold">{intendedIronDose} mg</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={intendedIronDose}
              onChange={(e) => setIntendedIronDose(Number(e.target.value))}
              className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {vectorAssessment.gateWarningTitle && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs space-y-1">
              <span className="text-amber-400 font-bold block">{vectorAssessment.gateWarningTitle}</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">{vectorAssessment.clinicalRationale}</p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-black/30 border border-white/5 space-y-2 text-xs">
            <span className="text-emerald-400 font-semibold block text-[11px]">Recommended Whole-Food Alternatives:</span>
            <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
              {vectorAssessment.recommendedDietaryIronAlternatives.map((alt, idx) => (
                <li key={idx}>{alt}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Enhancement 7: Zebu Cattle Niter Kibbeh Lipidomics */}
      <div className="glass-panel p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Enhancement 7</span>
            <h2 className="text-2xl font-bold text-white">Highland Zebu Cattle Niter Kibbeh Lipidomics</h2>
            <p className="text-xs text-slate-400 mt-1">
              Pasture-grazed mountain butter enriched with conjugated linoleic acid (CLA), Vitamin K2, and 285% micellar carotenoid absorption.
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400 self-start md:self-auto">
            Fat-Soluble Vitamin Carrier
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-black/40 border border-white/5">
            <span className="text-xs text-slate-400 block mb-1">CLA Content</span>
            <span className="text-2xl font-extrabold font-mono text-amber-400">{zebuProfile.conjugatedLinoleicAcidMgPer100g} mg</span>
            <span className="text-[10px] text-slate-500 block mt-1">Per 100g (3x feedlot ghee)</span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5">
            <span className="text-xs text-slate-400 block mb-1">Vitamin K2 (MK-4)</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-400">{zebuProfile.vitaminK2MkgPer100g} mcg</span>
            <span className="text-[10px] text-slate-500 block mt-1">Directs calcium to bone</span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5">
            <span className="text-xs text-slate-400 block mb-1">Vitamin A (Retinol)</span>
            <span className="text-2xl font-extrabold font-mono text-amber-300">{zebuProfile.vitaminAIUPer100g} IU</span>
            <span className="text-[10px] text-slate-500 block mt-1">Active bioavailable pre-formed</span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5">
            <span className="text-xs text-slate-400 block mb-1">Micellar Multiplier</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-300">
              +{((zebuProfile.micellarAbsorptionMultiplier - 1) * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">Carotenoid absorption lift</span>
          </div>
        </div>

        {/* Botanical Spices Infusion */}
        <div className="space-y-2">
          <span className="text-xs text-slate-300 block font-semibold">Traditional Clarifying Botanical Infusion Spices:</span>
          <div className="flex flex-wrap gap-2">
            {zebuProfile.botanicalInfusionSpices.map((spice, idx) => (
              <span key={idx} className="px-3 py-1 rounded-lg text-xs bg-black/40 border border-white/10 text-slate-200">
                {spice}
              </span>
            ))}
          </div>
        </div>

        {/* Synergistic Vegetable Pairings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {zebuProfile.optimalCulinaryPairing.map((pairing, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
              <strong className="text-amber-400 block text-sm">{pairing.vegetable}</strong>
              <p className="text-emerald-300 text-[11px]">Synergy: {pairing.synergisticNutrient}</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">{pairing.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Enhancement 8 (Tazma Apitherapy) & Enhancement 12 (Enset Butyrate) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhancement 8: Tazma Mar Stingless Bee Apitherapy */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Enhancement 8</span>
              <h2 className="text-xl font-bold text-white">Tazma Mar (የታዝማ ማር) Apitherapy</h2>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400">
              Low GI (35) Trehalulose
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded bg-black/30">
              <span className="text-slate-400 block text-[10px]">Glycemic Index</span>
              <span className="font-mono text-emerald-400 font-extrabold text-base">{tazmaProfile.glycemicIndex}</span>
            </div>
            <div className="p-2.5 rounded bg-black/30">
              <span className="text-slate-400 block text-[10px]">Trehalulose Sugar</span>
              <span className="font-mono text-amber-400 font-extrabold text-base">{tazmaProfile.trehaluloseContentPct}%</span>
            </div>
            <div className="p-2.5 rounded bg-black/30">
              <span className="text-slate-400 block text-[10px]">Natural Acidity</span>
              <span className="font-mono text-rose-400 font-extrabold text-base">{tazmaProfile.pH} pH</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-400">Biochemical Mechanism:</strong> {tazmaProfile.antimicrobialMechanism}
          </p>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-white block">Validated Therapeutic Applications:</span>
            {tazmaProfile.therapeuticApplications.map((app, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-black/30 border border-white/5 text-xs space-y-1">
                <p className="font-bold text-emerald-300">{app.indicationAmharic}</p>
                <p className="text-[11px] text-slate-300">
                  <strong>Regimen:</strong> {app.suggestedRegimen}
                </p>
                <p className="text-[10px] text-slate-500">{app.mechanismOfAction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enhancement 12: Enset Prebiotic Resistant Starch & Butyrate */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Enhancement 12</span>
              <h2 className="text-xl font-bold text-white">Enset Gut Microbiome & Butyrate Engine</h2>
            </div>
            <div className="flex bg-black/40 border border-white/10 rounded-lg p-1 text-xs">
              <button
                onClick={() => setSelectedEnsetProduct("kocho")}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  selectedEnsetProduct === "kocho" ? "bg-emerald-600 text-white" : "text-slate-400"
                }`}
              >
                Kocho (ቆጮ)
              </button>
              <button
                onClick={() => setSelectedEnsetProduct("bulla")}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  selectedEnsetProduct === "bulla" ? "bg-emerald-600 text-white" : "text-slate-400"
                }`}
              >
                Bulla (ቡላ)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">{ensetProfile.nameAmharic}</h3>
            <p className="text-xs text-slate-400">{ensetProfile.botanicalOrigin}</p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Prebiotic Resistant Starch</span>
                <span className="font-mono text-emerald-400 font-extrabold text-lg">
                  {ensetProfile.resistantStarchGramsPer100g} g/100g
                </span>
                <span className="text-[10px] text-slate-500 block">Escapes small intestine</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Simulated Colon Butyrate Yield</span>
                <span className="font-mono text-amber-400 font-extrabold text-lg">
                  {ensetProfile.simulatedSCFAYieldMmolPerKg.butyrate} mmol/kg
                </span>
                <span className="text-[10px] text-slate-500 block">Primary colonocyte fuel</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-slate-200 block">Gastrointestinal Mucosal Benefits:</span>
              <ul className="list-disc list-inside text-slate-300 text-xs space-y-1">
                {ensetProfile.gastrointestinalBenefits.map((benefit, idx) => (
                  <li key={idx}>{benefit}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs">
              <strong className="text-emerald-400 block text-[11px] mb-0.5">Traditional Preparation:</strong>
              <p className="text-slate-300 text-[11px]">{ensetProfile.suggestedPreparation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-8 border-t border-white/10 text-xs">
        <Link href="/fasting" className="text-slate-400 hover:text-white transition-colors">
          ← Back to Fasting & Chrononutrition
        </Link>
        <Link href="/cultural" className="btn-primary text-xs py-2 px-4">
          Explore Astral & Cultural Heritage →
        </Link>
      </div>
    </div>
  );
}
