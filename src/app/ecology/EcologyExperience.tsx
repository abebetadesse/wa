"use client";

import { useState } from "react";
import Link from "next/link";
import {
  resolveAgroEcologicalZone,
  evaluateRiftValleyFluoride,
  RIFT_VALLEY_GEOTHERMAL_REGIONS,
} from "@/lib/engines/agroEcologicalEngine";
import { calculateErshoKinetics } from "@/lib/engines/fermentationMicrobiomeEngine";
import { getAllWildFruits } from "@/lib/engines/wildForagingEngine";

export default function EcologyExperience() {
  const [altitudeMeters, setAltitudeMeters] = useState<number>(2400);
  const zoneProfile = resolveAgroEcologicalZone(altitudeMeters);

  const [selectedRegion, setSelectedRegion] = useState<string>("Hawassa");
  const fluorideAssessment = evaluateRiftValleyFluoride(selectedRegion);

  const [fermentationHours, setFermentationHours] = useState<number>(72);
  const ershoKinetics = calculateErshoKinetics(fermentationHours);

  const wildFruits = getAllWildFruits();

  return (
    <div className="app-container py-10 space-y-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-2">
          <span>Enterprise Botanical & Agro-Ecological Engine</span>
          <span>•</span>
          <span className="text-gold">Enhancements 1, 2, 10 & 11</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          Agro-Ecology, Regional Conditions & Fermentation Kinetics
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-3xl mt-2">
          Biochemical calibration based on elevation zones, volcanic soil trace minerals, Rift Valley fluoride antagonism,
          deep 4-day sourdough phytase kinetics, and indigenous famine-resilience wild botanicals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Enhancement 1</span>
              <h2 className="text-xl font-bold text-foreground">Agro-Climatic Conditions & Soil Minerals</h2>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-brand-soft border border-brand/30 text-brand-strong">
              {zoneProfile.zone.toUpperCase()}
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-soft">Elevation (Meters above sea level):</span>
              <span className="font-mono text-brand font-bold text-base">{altitudeMeters} m</span>
            </div>
            <input
              type="range"
              min="200"
              max="3800"
              step="50"
              value={altitudeMeters}
              onChange={(e) => setAltitudeMeters(Number(e.target.value))}
              className="w-full h-2 bg-sunken/80 rounded-lg appearance-none cursor-pointer accent-brand"
            />
            <div className="flex justify-between text-[11px] text-subtle mt-1">
              <span>0m Bereha</span>
              <span>1500m Kolla</span>
              <span>2400m Weina Dega</span>
              <span>3800m Dega</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-sunken/50 border border-border space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-foreground text-base">{zoneProfile.nameAmharic}</h3>
              <span className="text-xs text-muted-foreground font-mono">
                {zoneProfile.typicalTemperatureRangeC[0]}°C - {zoneProfile.typicalTemperatureRangeC[1]}°C
              </span>
            </div>
            <p className="text-xs text-soft leading-relaxed">
              <strong className="text-brand">Soil Geology:</strong> {zoneProfile.predominantSoilType}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
              <div className="p-2 rounded bg-foreground/5">
                <span className="text-muted-foreground block text-[10px]">Iron Bioavailability Multiplier</span>
                <span className="font-mono text-brand font-bold text-sm">
                  {(zoneProfile.soilMineralCharacteristics.ironBioavailability * 100).toFixed(0)}%
                </span>
              </div>
              <div className="p-2 rounded bg-foreground/5">
                <span className="text-muted-foreground block text-[10px]">Zinc Bioavailability Multiplier</span>
                <span className="font-mono text-gold font-bold text-sm">
                  {(zoneProfile.soilMineralCharacteristics.zincBioavailability * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">Key Regional Staples:</span>
              <div className="flex flex-wrap gap-1.5">
                {zoneProfile.keyStapleCrops.map((crop) => (
                  <span key={crop} className="px-2 py-0.5 rounded text-[11px] bg-brand-soft border border-brand/20 text-brand-strong">
                    {crop}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-xs font-bold text-gold uppercase tracking-wider">Enhancement 2</span>
              <h2 className="text-xl font-bold text-foreground">Rift Valley Fluoride Antagonist Advisor</h2>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                fluorideAssessment.fluorosisRiskTier === "critical"
                  ? "bg-danger-soft border-danger/40 text-danger-strong"
                  : "bg-brand-soft border-brand/30 text-brand-strong"
              }`}
            >
              {fluorideAssessment.fluorosisRiskTier.toUpperCase()} RISK
            </span>
          </div>

          <div>
            <label className="text-xs text-soft block mb-1.5 font-medium">Select Geographic Region:</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-sunken/80 border border-border rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:border-gold"
            >
              {RIFT_VALLEY_GEOTHERMAL_REGIONS.map((reg) => (
                <option key={reg} value={reg} className="bg-card text-foreground">
                  {reg} (Rift Valley Geothermal Zone)
                </option>
              ))}
              <option value="Addis Ababa" className="bg-card text-foreground">Addis Ababa (Highland Basalt)</option>
              <option value="Gondar" className="bg-card text-foreground">Gondar (Northern Highlands)</option>
              <option value="Bahir Dar" className="bg-card text-foreground">Bahir Dar (Lake Tana Basin)</option>
            </select>
          </div>

          <div className="p-4 rounded-xl bg-sunken/50 border border-border space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-foreground/5">
                <span className="text-muted-foreground block text-[10px]">Estimated Water Fluoride</span>
                <span className="font-mono text-gold font-bold text-base">
                  {fluorideAssessment.waterFluorideEstimatePpm} mg/L
                </span>
                <span className="text-[10px] text-subtle block">WHO Guide: &lt;1.5 mg/L</span>
              </div>
              <div className="p-2.5 rounded bg-foreground/5">
                <span className="text-muted-foreground block text-[10px]">Free Calcium Absorption Factor</span>
                <span className="font-mono text-danger font-bold text-base">
                  {(fluorideAssessment.calciumChelationFactor * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-subtle block">Insoluble CaF2 precipitation</span>
              </div>
            </div>

            {fluorideAssessment.recommendations.length > 0 ? (
              <div className="space-y-2 mt-2">
                <span className="text-xs font-semibold text-gold block">Antagonist Protocols:</span>
                {fluorideAssessment.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-gold-soft border border-gold/20 text-xs space-y-1">
                    <p className="font-semibold text-gold-strong">{rec.title}</p>
                    <p className="text-soft text-[11px] leading-relaxed">{rec.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-brand">
                ✓ Non-geothermal highland aquifer: standard baseline calcium targets apply without heavy fluoride chelation.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold text-brand uppercase tracking-wider">Enhancement 10</span>
            <h2 className="text-2xl font-bold text-foreground">Ersho (እርሾ) 4-Day Teff Sourdough Fermentation Kinetics</h2>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-brand-soft border border-brand/30 text-brand-strong self-start md:self-auto">
            Dynamic Phytase Activation Model
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-soft">Fermentation Time:</span>
            <span className="font-mono text-brand font-bold text-lg">{ershoKinetics.hoursFermented} Hours (Day {(ershoKinetics.hoursFermented / 24).toFixed(1)})</span>
          </div>
          <input
            type="range"
            min="0"
            max="96"
            step="6"
            value={fermentationHours}
            onChange={(e) => setFermentationHours(Number(e.target.value))}
            className="w-full h-2.5 bg-sunken/80 rounded-lg appearance-none cursor-pointer accent-brand"
          />
          <div className="flex justify-between text-[11px] text-subtle font-mono">
            <span>0h (Fresh Mix)</span>
            <span>24h (Gas Surge)</span>
            <span>48h (Phytase Peak)</span>
            <span>72h (Optimal Eyes)</span>
            <span>96h (Max Liberation)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-sunken/80 border border-border">
            <span className="text-xs text-muted-foreground block mb-1">Dough Acidity</span>
            <span className="text-2xl font-extrabold font-mono text-gold">{ershoKinetics.doughPH} pH</span>
            <span className="text-[11px] text-subtle block mt-1">Optimal phytase: &lt;4.5</span>
          </div>

          <div className="p-4 rounded-xl bg-sunken/80 border border-border">
            <span className="text-xs text-muted-foreground block mb-1">Phytate Degradation</span>
            <span className="text-2xl font-extrabold font-mono text-brand">{ershoKinetics.phytateDegradationPct}%</span>
            <span className="text-[11px] text-subtle block mt-1">Phytic acid hydrolyzed</span>
          </div>

          <div className="p-4 rounded-xl bg-sunken/80 border border-border">
            <span className="text-xs text-muted-foreground block mb-1">Iron Bioavailability</span>
            <span className="text-2xl font-extrabold font-mono text-brand">
              {(ershoKinetics.ironBioavailabilityMultiplier * 100).toFixed(0)}%
            </span>
            <span className="text-[11px] text-subtle block mt-1">+{((ershoKinetics.ironBioavailabilityMultiplier - 1) * 100).toFixed(0)}% vs unfermented</span>
          </div>

          <div className="p-4 rounded-xl bg-sunken/80 border border-border">
            <span className="text-xs text-muted-foreground block mb-1">Zinc Bioavailability</span>
            <span className="text-2xl font-extrabold font-mono text-brand">
              {(ershoKinetics.zincBioavailabilityMultiplier * 100).toFixed(0)}%
            </span>
            <span className="text-[11px] text-subtle block mt-1">Liberated from IP6 chelate</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-sunken/50 border border-border space-y-2 text-xs">
          <p className="text-soft leading-relaxed">
            <strong className="text-foreground">Textural & Cultural State:</strong> {ershoKinetics.sensoryAndTexturalStage}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-muted-foreground font-medium">Dominant Symbiotic Species:</span>
            {ershoKinetics.dominantMicroorganisms.map((m, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-foreground/5 text-soft italic">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold text-gold uppercase tracking-wider">Enhancement 11</span>
            <h2 className="text-2xl font-bold text-foreground">Indigenous Ethiopian Wild Edible Fruits & Foraging</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Famine-resilient highland and dryland flora with dense antioxidant ORAC scores and ascorbic iron chelators.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wildFruits.map((fruit) => (
            <div key={fruit.id} className="glass-panel p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-foreground text-base leading-snug">{fruit.nameAmharic}</h3>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-brand-soft border border-brand/30 text-brand-strong">
                    {fruit.agroEcologicalZone}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground italic">{fruit.botanicalName}</p>

                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-border text-[11px]">
                  <div className="p-1.5 rounded bg-sunken/50">
                    <span className="text-subtle block text-[9px]">Vitamin C</span>
                    <span className="font-mono text-brand font-bold">{fruit.vitaminCMgPer100g} mg</span>
                  </div>
                  <div className="p-1.5 rounded bg-sunken/50">
                    <span className="text-subtle block text-[9px]">ORAC Antioxidant</span>
                    <span className="font-mono text-gold font-bold">{fruit.oracAntioxidantScoreUmolTE}</span>
                  </div>
                </div>

                <p className="text-xs text-soft leading-relaxed pt-1">{fruit.traditionalUsageAndEthnobotany}</p>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-[11px] text-brand font-medium leading-tight">
                  <span className="text-muted-foreground block text-[9px] uppercase font-bold">Biochemical Role</span>
                  {fruit.nutritionalRole}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-border text-xs">
        <Link href="/intake" className="text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Client Intake
        </Link>
        <Link href="/fasting" className="btn-primary text-xs py-2 px-4">
          Explore Fasting & Chrononutrition →
        </Link>
      </div>
    </div>
  );
}
