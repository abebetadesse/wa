"use client";

import { useState, useCallback } from "react";
import type { RegionData } from "@/lib/location/atlas";
import type { EthiopianAdministrativeRegion } from "@/lib/location/ethiopianAdministrativePlaces";
import AdministrativeExplorer from "./AdministrativeExplorer";

interface AtlasClientProps {
  regions: RegionData[];
  administrativeRegions: EthiopianAdministrativeRegion[];
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

const ADMIN_REGION_ALIASES: Record<string, string[]> = {
  "addis-ababa": ["addis ababa"],
  afar: ["afar"],
  amhara: ["amhara"],
  oromia: ["oromia"],
  tigray: ["tigray"],
  sidama: ["sidama"],
  somali: ["ethiopia somali"],
  "benishangul": ["benishangul gumuz"],
  gambella: ["gambela"],
  harari: ["hareri"],
  "dire-dawa": ["dire dawa astedadar"],
};

function normalizeLocationName(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

function findDataRegion(
  administrativeRegion: EthiopianAdministrativeRegion,
  regions: RegionData[],
) {
  const regionName = normalizeLocationName(administrativeRegion.name);
  const match = regions.find((region) => {
    const aliases = ADMIN_REGION_ALIASES[region.id] ?? [region.name];
    return aliases.some((alias) => normalizeLocationName(alias) === regionName);
  });
  return match ?? null;
}

function findAdministrativeRegion(region: RegionData, administrativeRegions: EthiopianAdministrativeRegion[]) {
  const aliases = ADMIN_REGION_ALIASES[region.id] ?? [region.name];
  const normalizedAliases = aliases.map(normalizeLocationName);
  return administrativeRegions.find((candidate) =>
    normalizedAliases.includes(normalizeLocationName(candidate.name)),
  ) ?? null;
}

export default function AtlasClient({ regions, administrativeRegions }: AtlasClientProps) {
  const [selected, setSelected] = useState<RegionData | null>(null);
  const [selectedAdministrativeRegion, setSelectedAdministrativeRegion] =
    useState<EthiopianAdministrativeRegion | null>(null);
  const [activeFilter, setActiveFilter] = useState<"stunting" | "anemia" | "iron" | "vitaminA">("anemia");
  const [hovered, setHovered] = useState<string | null>(null);

  const selectRegion = (region: RegionData) => {
    setSelected(region);
    setSelectedAdministrativeRegion(findAdministrativeRegion(region, administrativeRegions));
  };

  const selectAdministrativeRegion = (administrativeRegion: EthiopianAdministrativeRegion) => {
    setSelectedAdministrativeRegion(administrativeRegion);
    setSelected(findDataRegion(administrativeRegion, regions));
  };

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
                        onClick={() => {
                          if (isSelected) {
                            setSelected(null);
                            setSelectedAdministrativeRegion(null);
                          } else {
                            selectRegion(region);
                          }
                        }}
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
              <RegionDetailPanel
                key={selected.id}
                region={selected}
                administrativeRegion={selectedAdministrativeRegion}
                onClose={() => {
                  setSelected(null);
                  setSelectedAdministrativeRegion(null);
                }}
              />
            ) : selectedAdministrativeRegion ? (
              <AdministrativeRegionPanel
                key={selectedAdministrativeRegion.name}
                region={selectedAdministrativeRegion}
                onClose={() => setSelectedAdministrativeRegion(null)}
              />
            ) : (
              <RegionListPanel
                regions={regions}
                administrativeRegions={administrativeRegions}
                onSelectRegion={selectRegion}
                onSelectAdministrativeRegion={selectAdministrativeRegion}
              />
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

function RegionDetailPanel({
  region,
  administrativeRegion,
  onClose,
}: {
  region: RegionData;
  administrativeRegion: EthiopianAdministrativeRegion | null;
  onClose: () => void;
}) {
  const risk = RISK_CONFIG[region.riskLevel];
  const [activeAspect, setActiveAspect] = useState("nutrition");
  const aspects = [
    { id: "nutrition", label: "Nutrition & risk", available: true },
    { id: "ecology", label: "Ecology & geography", available: Boolean(region.locationSystemsProfile) },
    { id: "agriculture", label: "Agriculture & resources", available: Boolean(region.locationSystemsProfile) },
    { id: "food-systems", label: "Industry & food systems", available: Boolean(region.locationSystemsProfile) },
    { id: "heritage", label: "Cultural heritage", available: Boolean(region.locationSystemsProfile) },
    { id: "sacred-places", label: "Sacred places & landscapes", available: Boolean(region.locationSystemsProfile) },
    { id: "location-foods", label: "Local foods & composition", available: Boolean(region.locationSystemsProfile) },
    { id: "food-safety", label: "Agricultural chemical records", available: Boolean(region.locationSystemsProfile) },
    { id: "demographics", label: "Demographic profile", available: Boolean(region.locationWellbeingProfile) },
    { id: "anthropometrics", label: "Anthropometric profile", available: Boolean(region.locationWellbeingProfile) },
    { id: "family-birth", label: "Family & birth indicators", available: Boolean(region.locationWellbeingProfile) },
    { id: "inherited-conditions", label: "Inherited conditions", available: Boolean(region.locationWellbeingProfile) },
    { id: "communicable-disease", label: "Communicable disease", available: Boolean(region.locationWellbeingProfile) },
    { id: "non-communicable-disease", label: "Non-communicable disease", available: Boolean(region.locationWellbeingProfile) },
  ].filter((aspect) => aspect.available);

  return (
    <div className="glass-panel p-5 space-y-4 animate-fade-in max-h-[80vh] overflow-y-auto">
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

      {administrativeRegion ? (
        <AdministrativeExplorer region={administrativeRegion} />
      ) : (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 text-[10px] leading-relaxed text-amber-200/80">
          The supplied administrative index does not contain a matching hierarchy for this statistical grouping.
          Its health and nutrition figures below remain at the displayed region-wide scope.
        </div>
      )}

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

      <nav aria-label={`${region.name} atlas topics`}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Location HUD · Explore an aspect</h3>
          <span className="text-[9px] text-slate-600">{aspects.length} topics</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {aspects.map((aspect, index) => (
            <a
              key={aspect.id}
              href={`#${region.id}-${aspect.id}`}
              onClick={() => setActiveAspect(aspect.id)}
              aria-current={activeAspect === aspect.id ? "location" : undefined}
              className={`rounded-lg border px-2 py-2 text-left text-[10px] transition-colors ${
                activeAspect === aspect.id
                  ? "border-teal-400/50 bg-teal-500/10 text-teal-200"
                  : "border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <span className="mr-1.5 font-mono text-[9px] text-slate-600">{String(index + 1).padStart(2, "0")}</span>
              {aspect.label}
            </a>
          ))}
        </div>
      </nav>

      <AspectSection
        id={`${region.id}-nutrition`}
        title="Nutrition, common deficiencies & staple foods"
        active={activeAspect === "nutrition"}
        onToggle={() => setActiveAspect(activeAspect === "nutrition" ? "" : "nutrition")}
      >
        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Common deficiencies</div>
            <div className="flex flex-wrap gap-1.5">
              {region.commonDeficiencies.map((d) => (
                <span key={d} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/50 border border-amber-500/30 text-amber-300">{d}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Staple foods</div>
            <div className="flex flex-wrap gap-1.5">
              {region.stapleFoods.map((food) => (
                <span key={food} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">{food}</span>
              ))}
            </div>
          </div>
        </div>
      </AspectSection>

      {region.locationSystemsProfile && (
        <>
          <AspectSection
            id={`${region.id}-ecology`}
            title="Ecology and geography"
            active={activeAspect === "ecology"}
            onToggle={() => setActiveAspect(activeAspect === "ecology" ? "" : "ecology")}
          >
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
          </AspectSection>
          <AspectSection
            id={`${region.id}-agriculture`}
            title="Agriculture and natural resources"
            active={activeAspect === "agriculture"}
            onToggle={() => setActiveAspect(activeAspect === "agriculture" ? "" : "agriculture")}
          >
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <p><span className="text-emerald-300">Crops:</span> {region.locationSystemsProfile.agriculture.crops.join(", ")}</p>
              <p><span className="text-amber-300">Livestock:</span> {region.locationSystemsProfile.agriculture.livestock.join(", ")}</p>
              <p><span className="text-cyan-300">Fisheries:</span> {region.locationSystemsProfile.agriculture.fisheries.join(", ")}</p>
              <p><span className="text-slate-400">Forest products:</span> {region.locationSystemsProfile.agriculture.forestProducts.join(", ")}</p>
            </div>
          </AspectSection>
          <AspectSection
            id={`${region.id}-food-systems`}
            title="Industry and food systems"
            active={activeAspect === "food-systems"}
            onToggle={() => setActiveAspect(activeAspect === "food-systems" ? "" : "food-systems")}
          >
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <p>Urbanization: <span className="text-violet-300">{region.locationSystemsProfile.industryAndUrbanization.urbanizationLevel}</span> · Built-up area: {region.locationSystemsProfile.industryAndUrbanization.builtUpAreaPct}%</p>
              <p><span className="text-violet-300">Industries:</span> {region.locationSystemsProfile.industryAndUrbanization.leadingIndustries.join(", ")}</p>
              <p><span className="text-emerald-300">Fermented:</span> {region.locationSystemsProfile.foodAndNutrition.fermentedFoodsAndDrinks.join(", ")}</p>
              <p><span className="text-amber-300">Preparation:</span> {region.locationSystemsProfile.foodAndNutrition.preparationMethods.join(", ")}</p>
              <p><span className="text-slate-400">Preservation:</span> {region.locationSystemsProfile.foodAndNutrition.preservationMethods.join(", ")}</p>
            </div>
          </AspectSection>
          <AspectSection
            id={`${region.id}-heritage`}
            title="Cultural heritage and common names"
            active={activeAspect === "heritage"}
            onToggle={() => setActiveAspect(activeAspect === "heritage" ? "" : "heritage")}
          >
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <p><span className="text-amber-300">Common names:</span> {region.locationSystemsProfile.culturalAndHeritage.commonNames.join(", ")}</p>
              <p><span className="text-emerald-300">Practices:</span> {region.locationSystemsProfile.culturalAndHeritage.culturalPractices.join(", ")}</p>
              <p><span className="text-violet-300">Traditional medicines:</span> {region.locationSystemsProfile.culturalAndHeritage.traditionalMedicines.join(", ")}</p>
            </div>
          </AspectSection>
          <AspectSection
            id={`${region.id}-sacred-places`}
            title="Sacred places and landscapes"
            active={activeAspect === "sacred-places"}
            onToggle={() => setActiveAspect(activeAspect === "sacred-places" ? "" : "sacred-places")}
          >
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <p><span className="text-slate-200">Churches/monasteries:</span> {region.locationSystemsProfile.culturalAndHeritage.churchesAndMonasteries.join(", ")}</p>
              <p><span className="text-slate-200">Mosques:</span> {region.locationSystemsProfile.culturalAndHeritage.mosques.join(", ")}</p>
              <p><span className="text-cyan-300">Mountains:</span> {region.locationSystemsProfile.culturalAndHeritage.mountains.join(", ")}</p>
              <p><span className="text-cyan-300">Rivers:</span> {region.locationSystemsProfile.culturalAndHeritage.rivers.join(", ")}</p>
              <p><span className="text-cyan-300">Lakes:</span> {region.locationSystemsProfile.culturalAndHeritage.lakes.join(", ")}</p>
            </div>
          </AspectSection>
          <AspectSection
            id={`${region.id}-location-foods`}
            title="Location foods and composition"
            active={activeAspect === "location-foods"}
            onToggle={() => setActiveAspect(activeAspect === "location-foods" ? "" : "location-foods")}
          >
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
          </AspectSection>
          <AspectSection
            id={`${region.id}-food-safety`}
            title="Agricultural chemical records"
            active={activeAspect === "food-safety"}
            onToggle={() => setActiveAspect(activeAspect === "food-safety" ? "" : "food-safety")}
          >
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <p>Pesticides: {region.locationSystemsProfile.foodSystem.pesticideUse.map((record) => record.activeIngredient).join(", ")}</p>
              <p>Insecticides: {region.locationSystemsProfile.foodSystem.insecticideUse.map((record) => record.activeIngredient).join(", ")}</p>
              <p className="text-rose-300">Product, residue, application-rate, and pre-harvest records require local verification.</p>
            </div>
          </AspectSection>
        </>
      )}

      {region.locationWellbeingProfile && (
        <>
          <AspectSection
            id={`${region.id}-demographics`}
            title="Demographic profile"
            active={activeAspect === "demographics"}
            onToggle={() => setActiveAspect(activeAspect === "demographics" ? "" : "demographics")}
          >
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <span>Urban: {region.locationWellbeingProfile.demographics.urbanPopulationPct}%</span>
              <span>Median age: {region.locationWellbeingProfile.demographics.medianAgeYears}</span>
              <span>Under five: {region.locationWellbeingProfile.demographics.underFivePopulationPct}%</span>
              <span>Household: {region.locationWellbeingProfile.demographics.averageHouseholdSize}</span>
              <span>Female: {region.locationWellbeingProfile.demographics.anthropometrics.genderDistributionPct.female}%</span>
              <span>Births: {region.locationWellbeingProfile.birthRatePer1000}/1k</span>
            </div>
          </AspectSection>
          <AspectSection
            id={`${region.id}-anthropometrics`}
            title="Anthropometric profile"
            active={activeAspect === "anthropometrics"}
            onToggle={() => setActiveAspect(activeAspect === "anthropometrics" ? "" : "anthropometrics")}
          >
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <span>Average BMI: {region.locationWellbeingProfile.demographics.anthropometrics.averageBmi}</span>
              <span>Fertility: {region.locationWellbeingProfile.totalFertilityRate}</span>
              <span>Height F/M: {region.locationWellbeingProfile.demographics.anthropometrics.averageHeightCm.female}/{region.locationWellbeingProfile.demographics.anthropometrics.averageHeightCm.male} cm</span>
              <span>Weight F/M: {region.locationWellbeingProfile.demographics.anthropometrics.averageWeightKg.female}/{region.locationWellbeingProfile.demographics.anthropometrics.averageWeightKg.male} kg</span>
            </div>
          </AspectSection>
          <AspectSection
            id={`${region.id}-family-birth`}
            title="Family and birth indicators"
            active={activeAspect === "family-birth"}
            onToggle={() => setActiveAspect(activeAspect === "family-birth" ? "" : "family-birth")}
          >
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
          </AspectSection>
          <AspectSection
            id={`${region.id}-inherited-conditions`}
            title="Inherited-condition indicators"
            active={activeAspect === "inherited-conditions"}
            onToggle={() => setActiveAspect(activeAspect === "inherited-conditions" ? "" : "inherited-conditions")}
          >
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
          </AspectSection>
          <AspectSection
            id={`${region.id}-communicable-disease`}
            title="Communicable disease indicators"
            active={activeAspect === "communicable-disease"}
            onToggle={() => setActiveAspect(activeAspect === "communicable-disease" ? "" : "communicable-disease")}
          >
            <div className="space-y-1.5">
              {region.locationWellbeingProfile.communicableDiseaseRates.map((rate) => (
                <div key={rate.condition} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-300">{rate.condition}</span>
                  <span className="text-rose-300">{formatDiseaseRate(rate.measure, rate.value)}</span>
                </div>
              ))}
            </div>
          </AspectSection>
          <AspectSection
            id={`${region.id}-non-communicable-disease`}
            title="Non-communicable disease indicators"
            active={activeAspect === "non-communicable-disease"}
            onToggle={() => setActiveAspect(activeAspect === "non-communicable-disease" ? "" : "non-communicable-disease")}
          >
            <div className="space-y-1.5">
              {region.locationWellbeingProfile.nonCommunicableDiseaseRates.map((rate) => (
                <div key={rate.condition} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-300">{rate.condition}</span>
                  <span className="text-amber-300">{formatDiseaseRate(rate.measure, rate.value)}</span>
                </div>
              ))}
            </div>
          </AspectSection>
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

function AspectSection({
  id,
  title,
  active,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  active: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-4 rounded-lg border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={active}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <span className="text-[11px] font-semibold text-slate-200">{title}</span>
        <span className="font-mono text-xs text-teal-300" aria-hidden="true">{active ? "−" : "+"}</span>
      </button>
      {active && <div className="border-t border-white/5 px-3 py-3">{children}</div>}
    </section>
  );
}

function AdministrativeRegionPanel({
  region,
  onClose,
}: {
  region: EthiopianAdministrativeRegion;
  onClose: () => void;
}) {
  return (
    <div className="glass-panel max-h-[80vh] space-y-4 overflow-y-auto p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">Administrative location explorer</span>
          <h2 className="mt-1 text-lg font-bold text-white">{region.name}</h2>
          <p className="mt-1 text-[10px] text-slate-500">
            {region.zones.length} zones · {region.townCount} towns / districts in the supplied index
          </p>
        </div>
        <button onClick={onClose} className="text-xs text-slate-500 hover:text-white">✕ Close</button>
      </div>
      <AdministrativeExplorer region={region} />
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 text-[10px] leading-relaxed text-amber-100/80">
        This administrative record provides names and parent relationships only. No matching regional nutrition,
        health, ecology, food-system, or coordinate profile is linked to this entry yet; the atlas does not infer
        town-level measurements from a neighboring region.
      </div>
    </div>
  );
}

function RegionListPanel({
  regions,
  administrativeRegions,
  onSelectRegion,
  onSelectAdministrativeRegion,
}: {
  regions: RegionData[];
  administrativeRegions: EthiopianAdministrativeRegion[];
  onSelectRegion: (region: RegionData) => void;
  onSelectAdministrativeRegion: (region: EthiopianAdministrativeRegion) => void;
}) {
  const unmatchedDataRegions = regions.filter(
    (region) => !findAdministrativeRegion(region, administrativeRegions),
  );

  return (
    <div className="glass-panel max-h-[80vh] space-y-4 overflow-y-auto p-4">
      <div>
        <h3 className="text-sm font-bold text-white">Region → Zone → Town</h3>
        <p className="mt-1 text-[10px] text-slate-500">Choose a location to open its zone index and town list.</p>
      </div>
      <div className="space-y-1.5">
        {administrativeRegions
          .map((region) => {
            const dataRegion = findDataRegion(region, regions);
            return (
              <button
                key={region.name}
                onClick={() => onSelectAdministrativeRegion(region)}
                className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-left transition-all hover:border-teal-400/30 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-200">{region.name}</span>
                  <span className={`text-[10px] ${dataRegion ? "text-teal-300" : "text-slate-500"}`}>
                    {dataRegion ? `${dataRegion.anemiaChildrenPct}% child anaemia*` : "location index"}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-slate-600">
                  {region.zones.length} zones · {region.townCount} towns / districts
                </div>
              </button>
            );
          })}
      </div>
      {unmatchedDataRegions.length > 0 && (
        <div className="border-t border-white/10 pt-3">
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amber-300">Legacy statistical groupings</h4>
          {unmatchedDataRegions.map((region) => {
            const risk = RISK_CONFIG[region.riskLevel];
            return (
              <button
                key={region.id}
                onClick={() => onSelectRegion(region)}
                className="w-full rounded-lg border border-amber-500/10 bg-amber-500/[0.03] px-3 py-2 text-left hover:border-amber-400/30"
              >
                <span className="text-sm text-slate-200">{region.name}</span>
                <span className={`float-right text-xs font-semibold ${risk.badge.split(" ").find((item) => item.startsWith("text-"))}`}>
                  {region.anemiaChildrenPct}% child anaemia*
                </span>
                <span className="mt-1 block text-[10px] text-slate-600">Nutrition data only · no matching hierarchy row</span>
              </button>
            );
          })}
        </div>
      )}
      <p className="text-[9px] leading-relaxed text-slate-600">
        *Regional statistical estimates only. Administrative names are taken from the supplied Region, Zone, Town list.
      </p>
    </div>
  );
}
