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
            Ethiopian health <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Nutrition Atlas</span>
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeFilter === f
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
            { label: "Avg Child Anaemia", value: `${Math.round(regions.reduce((s,r)=>s+r.anemiaChildrenPct,0)/Math.max(regions.length,1))}%`, color: "text-rose-400" },
            { label: "Avg Iron Deficiency", value: `${Math.round(regions.reduce((s,r)=>s+r.ironDeficiencyPct,0)/Math.max(regions.length,1))}%`, color: "text-amber-400" },
            { label: "Avg Trad. Med Usage", value: `${Math.round(regions.reduce((s,r)=>s+r.traditionalMedicineUsagePct,0)/Math.max(regions.length,1))}%`, color: "text-violet-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel p-4 text-center">
              <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-600 text-center">
          Data: EPHI DHS 2019 / MiNDO National Micronutrient Survey / WHO SEARO. Population-level estimates — individual clinical assessments require the full evaluation pipeline.
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

      <div className="pt-2 border-t border-white/10">
        <p className="text-[10px] text-slate-600">
          Population: ~{(region.population / 1_000_000).toFixed(1)}M · Source: EPHI DHS 2019
        </p>
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
                      className={`h-full rounded-full ${
                        region.riskLevel === "very-high" ? "bg-rose-500" :
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
