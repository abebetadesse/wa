"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getEthiopianLocationDataset } from "@/lib/location/ethiopiaLocations";

export default function LocationsPage() {
  const allLocations = useMemo(() => getEthiopianLocationDataset(), []);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [confidenceFilter, setConfidenceFilter] = useState<"all" | "high" | "medium" | "low" | "unknown">("all");
  const [sortBy, setSortBy] = useState<"name" | "population" | "altitude" | "confidence">("name");
  const [compareIds, setCompareIds] = useState<string[]>(["addis-ababa", "hawassa", "gambella"]);

  const regions = ["all", ...new Set(allLocations.map((location) => location.region))];

  const filteredLocations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allLocations
      .filter((location) => {
        const matchesRegion = region === "all" || location.region === region;
        const matchesConfidence = confidenceFilter === "all" || location.sourceConfidence === confidenceFilter;
        const matchesSearch =
          query.length === 0 ||
          location.name.toLowerCase().includes(query) ||
          location.region.toLowerCase().includes(query) ||
          location.nameAmharic.toLowerCase().includes(query) ||
          location.stapleFoods.some((item) => item.toLowerCase().includes(query));

        return matchesRegion && matchesConfidence && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "population":
            return b.population - a.population;
          case "altitude":
            return b.altitudeMeters - a.altitudeMeters;
          case "confidence":
            return b.provenanceSummary.confidenceScore - a.provenanceSummary.confidenceScore;
          case "name":
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [allLocations, confidenceFilter, region, search, sortBy]);

  const compareLocations = useMemo(
    () => allLocations.filter((location) => compareIds.includes(location.id)),
    [allLocations, compareIds],
  );

  const averageSourceConfidence = Math.round(
    allLocations.reduce((sum, location) => sum + (location.provenanceSummary.confidenceScore ?? 0), 0) / Math.max(1, allLocations.length),
  );

  const toggleCompare = (id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((value) => value !== id);
      }
      if (current.length >= 3) {
        return [...current.slice(1), id];
      }
      return [...current, id];
    });
  };

  const exportCsv = () => {
    const header = [
      "id",
      "region",
      "name",
      "nameAmharic",
      "altitudeMeters",
      "agroZone",
      "population",
      "urbanPopulationPct",
      "totalFertilityRate",
      "stapleFoods",
      "traditionalMedicines",
    ];

    const rows = filteredLocations.map((location) => [
      location.id,
      location.region,
      location.name,
      location.nameAmharic,
      location.altitudeMeters,
      location.agroZone,
      location.population,
      location.urbanPopulationPct,
      location.totalFertilityRate,
      location.stapleFoods.join(" | "),
      location.traditionalMedicines.join(" | "),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ethiopia-locations-${region === "all" ? "all" : region.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Location registry</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Ethiopian locations dataset</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            One complete location profile per place, ready for clinical, nutritional, ecological, and cultural analysis.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, region, or staple food"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-slate-500 md:max-w-md"
            />
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none md:min-w-[180px]"
            >
              {regions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All regions" : option}
                </option>
              ))}
            </select>
            <select
              value={confidenceFilter}
              onChange={(event) => setConfidenceFilter(event.target.value as typeof confidenceFilter)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none md:min-w-[160px]"
            >
              <option value="all">All provenance levels</option>
              <option value="high">High confidence</option>
              <option value="medium">Medium confidence</option>
              <option value="low">Low confidence</option>
              <option value="unknown">Unknown</option>
            </select>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none md:min-w-[150px]"
            >
              <option value="name">Sort: name</option>
              <option value="population">Sort: population</option>
              <option value="altitude">Sort: altitude</option>
              <option value="confidence">Sort: confidence</option>
            </select>
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/20"
          >
            Export CSV
          </button>
        </div>

        <div className="mb-5 text-sm text-slate-400">
          Showing <span className="font-semibold text-white">{filteredLocations.length}</span> of <span className="font-semibold text-white">{allLocations.length}</span> locations
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-5">
          <MiniStat label="Regions" value={regions.length - 1} />
          <MiniStat label="Highland" value={allLocations.filter((location) => location.altitudeMeters >= 1800).length} />
          <MiniStat label="Lowland" value={allLocations.filter((location) => location.altitudeMeters < 1800).length} />
          <MiniStat label="Source confidence" value={`${averageSourceConfidence}/100`} />
          <MiniStat label="Compare set" value={compareLocations.length} />
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Compare selected locations</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Max 3</span>
              {compareLocations.length > 0 && (
                <Link
                  href={`/locations/compare?ids=${compareIds.join(",")}`}
                  className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200 transition hover:border-amber-400 hover:bg-amber-500/20"
                >
                  View compare
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {compareLocations.map((location) => (
              <div key={location.id} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{location.region}</p>
                    <p className="mt-1 font-semibold text-white">{location.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCompare(location.id)}
                    className="text-xs text-rose-300 hover:text-rose-200"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-300">
                  <p>Altitude: {location.altitudeMeters}m</p>
                  <p>Population: {location.population.toLocaleString()}</p>
                  <p>Staples: {location.stapleFoods.slice(0, 2).join(", ")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredLocations.map((location) => (
            <article key={location.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{location.region}</p>
                  <h2 className="mt-1 text-xl font-bold text-white">{location.name}</h2>
                  <p className="text-sm text-slate-400">{location.nameAmharic}</p>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-200">
                  {location.agroZone}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                <div className="rounded-xl bg-slate-800/80 p-2">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Altitude</dt>
                  <dd className="mt-1 font-semibold text-white">{location.altitudeMeters} m</dd>
                </div>
                <div className="rounded-xl bg-slate-800/80 p-2">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Population</dt>
                  <dd className="mt-1 font-semibold text-white">{location.population.toLocaleString()}</dd>
                </div>
                <div className="rounded-xl bg-slate-800/80 p-2">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Urban</dt>
                  <dd className="mt-1 font-semibold text-white">{location.urbanPopulationPct}%</dd>
                </div>
                <div className="rounded-xl bg-slate-800/80 p-2">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Fertility</dt>
                  <dd className="mt-1 font-semibold text-white">{location.totalFertilityRate}</dd>
                </div>
              </dl>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/60 px-2.5 py-2">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Source confidence</span>
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${
                    location.sourceConfidence === "high"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : location.sourceConfidence === "medium"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                        : location.sourceConfidence === "low"
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                          : "border-slate-600 bg-slate-800/80 text-slate-200"
                  }`}>
                    {location.sourceConfidence}
                  </span>
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">Staple foods</p>
                  <p>{location.stapleFoods.join(", ")}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">Traditional medicines</p>
                  <p>{location.traditionalMedicines.join(", ")}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-2">
                <Link
                  href={`/locations/${location.id}`}
                  className="inline-flex rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-cyan-200 transition hover:border-cyan-400 hover:bg-cyan-500/20"
                >
                  Open full profile
                </Link>
                <button
                  type="button"
                  onClick={() => toggleCompare(location.id)}
                  className={`rounded-full border px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] transition ${
                    compareIds.includes(location.id)
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                      : "border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {compareIds.includes(location.id) ? "Selected" : "Compare"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredLocations.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center text-slate-300">
            No locations match your current filters.
          </div>
        )}
      </div>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
