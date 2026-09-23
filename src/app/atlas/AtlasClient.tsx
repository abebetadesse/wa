"use client";

import { useState, useCallback } from "react";
import type { RegionData } from "@/app/api/atlas/route";

interface AtlasClientProps {
  regions: RegionData[];
}

const RISK_CONFIG = {
  "very-high": { fill: "fill-rose-600/70", stroke: "stroke-rose-400", label: "Very High Risk", badge: "bg-rose-950/60 border-rose-500/40 text-rose-300" },
  high: { fill: "fill-orange-500/60", stroke: "stroke-orange-400", label: "High Risk", badge: "bg-orange-950/60 border-orange-500/40 text-orange-300" },
  moderate: { fill: "fill-amber-500/50", stroke: "stroke-amber-400", label: "Moderate Risk", badge: "bg-amber-950/60 border-amber-500/40 text-amber-300" },
  low: { fill: "fill-emerald-600/50", stroke: "stroke-emerald-400", label: "Low Risk", badge: "bg-emerald-950/60 border-emerald-500/40 text-emerald-300" },
};

const formatDiseaseRate = (measure: string, value: number) => {
  if (measure === "prevalence_pct") return `${value}% prevalence`;
  if (measure === "mortality_per_100k") return `${value}/100k mortality`;
  return `${value}/100k annual incidence`;
};

// Simplified Ethiopia SVG region paths (schematic polygons, not geo-accurate)
const REGION_PATHS: Record<string, string> = {
  tigray: "M210,50 L310,50 L330,120 L290,130 L240,125 L200,110 Z",
  afar: "M310,50 L390,80 L410,200 L370,220 L330,210 L290,130 L310,100 Z",
  amhara: "M150,100 L240,125 L290,130 L285,200 L240,220 L190,230 L150,220 L130,180 L130,140 Z",
  "benishangul": "M90,150 L150,140 L150,220 L140,260 L100,270 L80,240 L80,190 Z",
  "dire-dawa": "M350,215 L380,215 L380,240 L350,240 Z",
  harari: "M345,230 L375,230 L375,258 L345,258 Z",
  somali: "M370,220 L450,160 L480,250 L460,350 L400,380 L360,350 L350,300 L370,260 Z",
  oromia: "M140,220 L240,220 L285,200 L320,250 L330,300 L300,350 L260,370 L200,360 L160,330 L130,290 L130,250 Z",
  "addis-ababa": "M265,235 L295,235 L295,265 L265,265 Z",
  sidama: "M230,300 L285,295 L300,340 L270,365 L230,355 L215,330 Z",
  snnp: "M150,290 L230,290 L215,330 L230,355 L200,375 L155,370 L130,350 L130,310 Z",
  gambella: "M80,270 L140,270 L150,310 L130,360 L90,370 L70,340 L70,300 Z",
};

export default function AtlasClient({ regions }: AtlasClientProps) {
  const [selected, setSelected] = useState<RegionData | null>(null);
  const [activeFilter, setActiveFilter] = useState<"stunting" | "anemia" | "iron" | "vitaminA">("anemia");
  const [hovered, setHovered] = useState<string | null>(null);

  const getRegionById = useCallback(
    (id: string) => regions.find((r) => r.id === id) ?? null,
    [regions]
  );

  const getFilterValue = (r: RegionData) => {
    switch (activeFilter) {
      case "stunting": return r.stuntingPct;
      case "anemia": return r.anemiaChildrenPct;
      case "iron": return r.ironDeficiencyPct;
      case "vitaminA": return r.vitaminADeficiencyPct;
    }
  };

  const filterLabel = {
    stunting: "Stunting (%)",
    anemia: "Child Anaemia (%)",
    iron: "Iron Deficiency (%)",
    vitaminA: "Vitamin A Deficiency (%)",
  }[activeFilter];

  const nationalAvg = regions.length > 0
    ? Math.round(regions.reduce((sum, r) => sum + getFilterValue(r), 0) / regions.length)
    : 0;

  return (
    <div className="py-10">
      <div className="app-container">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            EPHI DHS 2019 · MiNDO Survey · WHO SEARO
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Ethiopian wellbeing <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Nutrition Atlas</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Population-level nutritional deficiency rates, stunting, and anaemia prevalence across all Ethiopian regions.
            Select a region for detailed breakdown and food recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map Panel */}
          <div className="xl:col-span-2 glass-panel p-6">
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(["anemia", "stunting", "iron", "vitaminA"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${activeFilter === f
                    ? "bg-teal-600 border-teal-500 text-white"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}
                >
                  {filterLabel.replace(filterLabel, { anemia: "Child Anaemia", stunting: "Stunting", iron: "Iron Deficiency", vitaminA: "Vitamin A Deficiency" }[f])}
                </button>
              ))}
            </div>

            {/* SVG Map */}
            <div className="relative">
              <svg
                viewBox="0 0 520 440"
                className="w-full max-h-[440px]"
                style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.4))" }}
              >
                {/* Background */}
                <rect width="520" height="440" fill="transparent" />

                {Object.entries(REGION_PATHS).map(([regionId, path]) => {
                  const region = getRegionById(regionId);
                  if (!region) return null;
                  const risk = RISK_CONFIG[region.riskLevel];
                  const isSelected = selected?.id === regionId;
                  const isHovered = hovered === regionId;

                  return (
                    <g key={regionId}>
                      <path
                        d={path}
                        className={`${risk.fill} ${risk.stroke} cursor-pointer transition-all duration-200`}
                        strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.2}
                        style={{
                          opacity: isSelected ? 1 : isHovered ? 0.9 : 0.75,
                          filter: isSelected ? "brightness(1.3)" : isHovered ? "brightness(1.15)" : "none",
                        }}
                        onClick={() => setSelected(isSelected ? null : region)}
                        onMouseEnter={() => setHovered(regionId)}
                        onMouseLeave={() => setHovered(null)}
                      />
                      {/* Region label */}
                      <text
                        x={region.labelX}
                        y={region.labelY}
                        textAnchor="middle"
                        className="select-none pointer-events-none"
                        fontSize={regionId === "addis-ababa" || regionId === "harari" || regionId === "dire-dawa" ? 7 : 9}
                        fill={isSelected || isHovered ? "#ffffff" : "#cbd5e1"}
                        fontWeight={isSelected ? "700" : "500"}
                      >
                        {region.name.split(" ")[0]}
                      </text>
                      {/* Value badge */}
                      <text
                        x={region.labelX}
                        y={region.labelY + 11}
                        textAnchor="middle"
                        className="select-none pointer-events-none"
                        fontSize={8}
                        fill={isSelected || isHovered ? "#ffffff" : "#94a3b8"}
                        fontWeight="600"
                      >
                        {getFilterValue(region)}%
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                {Object.entries(RISK_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <div className={`w-3 h-3 rounded-sm ${cfg.fill} border ${cfg.stroke}`} />
                    {cfg.label}
                  </div>
                ))}
              </div>
            </div>

            {/* National average */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-500">National Average · {filterLabel}</span>
              <span className="text-sm font-bold text-white">{nationalAvg}%</span>
            </div>
          </div>

          {/* Sidebar Panel */}
          <div className="space-y-4">
            {selected ? (
              <RegionDetailPanel region={selected} onClose={() => setSelected(null)} />
            ) : (
              <RegionListPanel regions={regions} onSelect={setSelected} />
            )}
          </div>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Regions Tracked", value: regions.length.toString(), color: "text-teal-400" },
            { label: "Avg Child Anaemia", value: `${Math.round(regions.reduce((s, r) => s + r.anemiaChildrenPct, 0) / Math.max(regions.length, 1))}%`, color: "text-rose-400" },
            { label: "Avg Iron Deficiency", value: `${Math.round(regions.reduce((s, r) => s + r.ironDeficiencyPct, 0) / Math.max(regions.length, 1))}%`, color: "text-amber-400" },
            { label: "Avg Trad. Med Usage", value: `${Math.round(regions.reduce((s, r) => s + r.traditionalMedicineUsagePct, 0) / Math.max(regions.length, 1))}%`, color: "text-violet-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel p-4 text-center">
              <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-600 text-center">
          Data: EPHI DHS 2019 / MiNDO National Micronutrient Survey / WHO SEARO. Population-level estimates — individual scientific assessments require the full evaluation pipeline.
        </p>
      </div>
    </div>
  );
}

function RegionDetailPanel({ region, onClose }: { region: RegionData; onClose: () => void }) {
  const risk = RISK_CONFIG[region.riskLevel];

  return (
    <div className="glass-panel p-5 space-y-4 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${risk.badge} mb-1`}>
            {risk.label}
          </span>
          <h2 className="text-lg font-bold text-white">{region.name}</h2>
          <p className="text-xs text-slate-500">{region.nameAmharic} · {region.nameOromo}</p>
          <p className="text-xs text-slate-600 mt-0.5">Capital: {region.capital} · Alt: {region.altitudeRange}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-600 hover:text-white transition-colors text-xs mt-1"
        >
          ✕ Close
        </button>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Child Anaemia", value: `${region.anemiaChildrenPct}%`, color: "text-rose-400" },
          { label: "Women Anaemia", value: `${region.anemiaWomenPct}%`, color: "text-rose-300" },
          { label: "Stunting", value: `${region.stuntingPct}%`, color: "text-orange-400" },
          { label: "Iron Deficiency", value: `${region.ironDeficiencyPct}%`, color: "text-amber-400" },
          { label: "Vitamin A Def.", value: `${region.vitaminADeficiencyPct}%`, color: "text-yellow-400" },
          { label: "Trad. Medicine", value: `${region.traditionalMedicineUsagePct}%`, color: "text-violet-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] rounded-lg p-2.5 border border-white/5">
            <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Common deficiencies */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Common Deficiencies</div>
        <div className="flex flex-wrap gap-1.5">
          {region.commonDeficiencies.map((d) => (
            <span key={d} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/50 border border-amber-500/30 text-amber-300">
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Staple foods */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Staple Foods</div>
        <div className="flex flex-wrap gap-1.5">
          {region.stapleFoods.map((f) => (
            <span key={f} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">
              {f}
            </span>
          ))}
        </div>
      </div>

      {region.locationSystemsProfile && (
        <>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ecology and geography</div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <p>{region.locationSystemsProfile.ecology.ecosystem}</p>
              <p className="text-slate-400">{region.locationSystemsProfile.ecology.geography}</p>
              <div className="grid grid-cols-2 gap-2">
                <span>Rain: {region.locationSystemsProfile.ecology.annualPrecipitationMm.join("–")} mm</span>
                <span>Temperature: {region.locationSystemsProfile.ecology.temperatureRangeC.join("–")}°C</span>
              </div>
              <p className="text-cyan-300">Water: {region.locationSystemsProfile.ecology.riversAndWaterBodies.join(", ")}</p>
              <p className="text-slate-400">Soils: {region.locationSystemsProfile.ecology.soilTypes.join(", ")}</p>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Agriculture and natural resources</div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <p><span className="text-emerald-300">Crops:</span> {region.locationSystemsProfile.agriculture.crops.join(", ")}</p>
              <p><span className="text-amber-300">Livestock:</span> {region.locationSystemsProfile.agriculture.livestock.join(", ")}</p>
              <p><span className="text-cyan-300">Fisheries:</span> {region.locationSystemsProfile.agriculture.fisheries.join(", ")}</p>
              <p><span className="text-slate-400">Forest products:</span> {region.locationSystemsProfile.agriculture.forestProducts.join(", ")}</p>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Industry and food systems</div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <p>Urbanization: <span className="text-violet-300">{region.locationSystemsProfile.industryAndUrbanization.urbanizationLevel}</span> · Built-up area: {region.locationSystemsProfile.industryAndUrbanization.builtUpAreaPct}%</p>
              <p><span className="text-violet-300">Industries:</span> {region.locationSystemsProfile.industryAndUrbanization.leadingIndustries.join(", ")}</p>
              <p><span className="text-emerald-300">Fermented:</span> {region.locationSystemsProfile.foodAndNutrition.fermentedFoodsAndDrinks.join(", ")}</p>
              <p><span className="text-amber-300">Preparation:</span> {region.locationSystemsProfile.foodAndNutrition.preparationMethods.join(", ")}</p>
              <p><span className="text-slate-400">Preservation:</span> {region.locationSystemsProfile.foodAndNutrition.preservationMethods.join(", ")}</p>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cultural heritage and common names</div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <p><span className="text-amber-300">Common names:</span> {region.locationSystemsProfile.culturalAndHeritage.commonNames.join(", ")}</p>
              <p><span className="text-emerald-300">Practices:</span> {region.locationSystemsProfile.culturalAndHeritage.culturalPractices.join(", ")}</p>
              <p><span className="text-violet-300">Traditional medicines:</span> {region.locationSystemsProfile.culturalAndHeritage.traditionalMedicines.join(", ")}</p>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sacred places and landscapes</div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <p><span className="text-slate-200">Churches/monasteries:</span> {region.locationSystemsProfile.culturalAndHeritage.churchesAndMonasteries.join(", ")}</p>
              <p><span className="text-slate-200">Mosques:</span> {region.locationSystemsProfile.culturalAndHeritage.mosques.join(", ")}</p>
              <p><span className="text-cyan-300">Mountains:</span> {region.locationSystemsProfile.culturalAndHeritage.mountains.join(", ")}</p>
              <p><span className="text-cyan-300">Rivers:</span> {region.locationSystemsProfile.culturalAndHeritage.rivers.join(", ")}</p>
              <p><span className="text-cyan-300">Lakes:</span> {region.locationSystemsProfile.culturalAndHeritage.lakes.join(", ")}</p>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location foods and composition</div>
            <div className="space-y-2 text-[11px] text-slate-300">
              {region.locationSystemsProfile.foodSystem.locationFoods.map((food) => (
                <div key={food.food} className="rounded-lg border border-white/5 bg-white/[0.03] p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-emerald-300">{food.food}</span>
                    <span className="text-[10px] uppercase text-slate-500">{food.foodGroup}</span>
                  </div>
                  <p className="mt-1 text-slate-400">{food.ingredients.join(", ")}</p>
                  <p className="mt-1">Processing: {food.processingMethods.join(", ")}</p>
                  <p className="mt-1 text-cyan-300">
                    Composition source: {food.compositionSource.name} · {food.compositionSource.intendedUse.replace("_", " ")}
                  </p>
                  {food.proximateComposition && (
                    <p className="mt-1 text-amber-300">
                      Proximate: {food.proximateComposition.crudeProteinPct ?? "—"}% protein · {food.proximateComposition.crudeFiberPct ?? "—"}% fibre · {food.proximateComposition.ashPct ?? "—"}% ash ({food.proximateComposition.basis.replace("_", " ")})
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Agricultural chemical records</div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <p>Pesticides: {region.locationSystemsProfile.foodSystem.pesticideUse.map((record) => record.activeIngredient).join(", ")}</p>
              <p>Insecticides: {region.locationSystemsProfile.foodSystem.insecticideUse.map((record) => record.activeIngredient).join(", ")}</p>
              <p className="text-rose-300">Product, residue, application-rate, and pre-harvest records require local verification.</p>
            </div>
          </div>
        </>
      )}

      {region.locationWellbeingProfile && (
        <>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Demographic profile</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <span>Urban: {region.locationWellbeingProfile.demographics.urbanPopulationPct}%</span>
              <span>Median age: {region.locationWellbeingProfile.demographics.medianAgeYears}</span>
              <span>Under five: {region.locationWellbeingProfile.demographics.underFivePopulationPct}%</span>
              <span>Household: {region.locationWellbeingProfile.demographics.averageHouseholdSize}</span>
              <span>Female: {region.locationWellbeingProfile.demographics.anthropometrics.genderDistributionPct.female}%</span>
              <span>Births: {region.locationWellbeingProfile.birthRatePer1000}/1k</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Anthropometric profile</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <span>Average BMI: {region.locationWellbeingProfile.demographics.anthropometrics.averageBmi}</span>
              <span>Fertility: {region.locationWellbeingProfile.totalFertilityRate}</span>
              <span>Height F/M: {region.locationWellbeingProfile.demographics.anthropometrics.averageHeightCm.female}/{region.locationWellbeingProfile.demographics.anthropometrics.averageHeightCm.male} cm</span>
              <span>Weight F/M: {region.locationWellbeingProfile.demographics.anthropometrics.averageWeightKg.female}/{region.locationWellbeingProfile.demographics.anthropometrics.averageWeightKg.male} kg</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Family and birth indicators</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <span>Polygamous unions: {region.locationWellbeingProfile.marriageAndInheritance.polygamousUnionPct}%</span>
              <span>Scope: married unions</span>
            </div>
            <div className="mt-2 space-y-1.5">
              {region.locationWellbeingProfile.marriageAndInheritance.birthDefects.map((indicator) => (
                <div key={indicator.condition} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-300">{indicator.condition}</span>
                  <span className="text-violet-300">{indicator.value}/10k births</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Inherited-condition indicators</div>
            <div className="space-y-1.5">
              {region.locationWellbeingProfile.marriageAndInheritance.geneticDisorders.map((indicator) => (
                <div key={indicator.condition} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-300">{indicator.condition}</span>
                  <span className="text-cyan-300">
                    {indicator.value}{indicator.measure === "carrier_frequency_pct" ? "%" : "/10k"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Communicable disease indicators</div>
            <div className="space-y-1.5">
              {region.locationWellbeingProfile.communicableDiseaseRates.map((rate) => (
                <div key={rate.condition} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-300">{rate.condition}</span>
                  <span className="text-rose-300">{formatDiseaseRate(rate.measure, rate.value)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Non-communicable disease indicators</div>
            <div className="space-y-1.5">
              {region.locationWellbeingProfile.nonCommunicableDiseaseRates.map((rate) => (
                <div key={rate.condition} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-300">{rate.condition}</span>
                  <span className="text-amber-300">{formatDiseaseRate(rate.measure, rate.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="pt-2 border-t border-white/10">
        <p className="text-[10px] text-slate-600">
          Population: ~{(region.population / 1_000_000).toFixed(1)}M · Nutrition source: EPHI DHS 2019
        </p>
        {region.locationWellbeingProfile && <p className="mt-1 text-[10px] text-slate-600">{region.locationWellbeingProfile.sourceNote}</p>}
      </div>
    </div>
  );
}

function RegionListPanel({ regions, onSelect }: { regions: RegionData[]; onSelect: (r: RegionData) => void }) {
  return (
    <div className="glass-panel p-4 space-y-2">
      <h3 className="text-sm font-bold text-white mb-3">Select a Region</h3>
      <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
        {[...regions]
          .sort((a, b) => b.anemiaChildrenPct - a.anemiaChildrenPct)
          .map((region) => {
            const risk = RISK_CONFIG[region.riskLevel];
            return (
              <button
                key={region.id}
                onClick={() => onSelect(region)}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.06] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    {region.name}
                  </span>
                  <span className={`text-xs font-bold ${risk.badge.split(" ").find(c => c.startsWith("text-")) ?? "text-slate-400"}`}>
                    {region.anemiaChildrenPct}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${region.riskLevel === "very-high" ? "bg-rose-500" :
                        region.riskLevel === "high" ? "bg-orange-500" :
                          region.riskLevel === "moderate" ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      style={{ width: `${region.anemiaChildrenPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-600 whitespace-nowrap">Child anaemia</span>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
