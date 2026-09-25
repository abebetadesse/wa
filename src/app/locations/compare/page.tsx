import Link from "next/link";
import { notFound } from "next/navigation";
import { getEthiopianLocationById } from "@/lib/location/ethiopiaLocations";

export default async function CompareLocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const params = await searchParams;
  const ids = (params.ids ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    notFound();
  }

  const selected = ids
    .map((id) => getEthiopianLocationById(id))
    .filter((location): location is NonNullable<typeof location> => Boolean(location));

  if (selected.length === 0) {
    notFound();
  }

  const highestAltitude = selected.reduce((max, location) => Math.max(max, location.altitudeMeters), 0);
  const largestPopulation = selected.reduce((max, location) => Math.max(max, location.wellbeingProfile.demographics.estimatedPopulation), 0);
  const mostUrban = selected.reduce(
    (max, location) =>
      location.wellbeingProfile.demographics.urbanPopulationPct > max.wellbeingProfile.demographics.urbanPopulationPct
        ? location
        : max,
    selected[0],
  );
  const averageCompleteness = Math.round(
    selected.reduce((sum, location) => sum + (location.denseData.dataQuality?.completenessPct ?? 0), 0) / Math.max(1, selected.length),
  );

  const topDifferences = [
    {
      label: "Altitude spread",
      value: `${Math.max(...selected.map((location) => location.altitudeMeters)) - Math.min(...selected.map((location) => location.altitudeMeters))} m`,
      note: `${selected[0].name} to ${selected[selected.length - 1].name}`,
    },
    {
      label: "Urbanization gap",
      value: `${Math.max(...selected.map((location) => location.wellbeingProfile.demographics.urbanPopulationPct)) - Math.min(...selected.map((location) => location.wellbeingProfile.demographics.urbanPopulationPct))}%`,
      note: "largest urban share difference",
    },
    {
      label: "Fertility range",
      value: `${(Math.max(...selected.map((location) => location.wellbeingProfile.totalFertilityRate)) - Math.min(...selected.map((location) => location.wellbeingProfile.totalFertilityRate))).toFixed(1)}`,
      note: "range across the selected set",
    },
  ];

  const columns = [
    { key: "region", label: "Region" },
    { key: "altitudeMeters", label: "Altitude" },
    { key: "population", label: "Population" },
    { key: "urbanPopulationPct", label: "Urban %" },
    { key: "fertility", label: "Fertility" },
    { key: "staples", label: "Staples" },
    { key: "medicines", label: "Traditional medicines" },
  ] as const;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Location comparison</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Selected Ethiopian locations</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/api/locations/export?ids=${encodeURIComponent(ids.join(","))}`}
              className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/20"
            >
              Export CSV
            </a>
            <Link href="/locations" className="text-sm text-cyan-300 hover:text-cyan-200">
              ← Back to registry
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <InsightCard label="Highest elevation" value={`${highestAltitude} m`} note={selected.find((location) => location.altitudeMeters === highestAltitude)?.name ?? "N/A"} />
          <InsightCard label="Largest population" value={new Intl.NumberFormat().format(largestPopulation)} note={selected.find((location) => location.wellbeingProfile.demographics.estimatedPopulation === largestPopulation)?.name ?? "N/A"} />
          <InsightCard label="Most urban" value={`${mostUrban.wellbeingProfile.demographics.urbanPopulationPct}%`} note={mostUrban.name} />
          <InsightCard label="Avg. data completeness" value={`${averageCompleteness}%`} note="Across selected locations" />
        </div>

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Top differences</h2>
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">What stands out</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {topDifferences.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
                <p className="mt-1 text-xs text-slate-300">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
          <table className="min-w-full border-collapse text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-4 py-3">Location</th>
                {selected.map((location) => (
                  <th key={location.id} className="px-4 py-3 whitespace-nowrap">
                    <div>
                      <div className="font-semibold text-white">{location.name}</div>
                      <div className="text-[10px] text-cyan-300">{location.region}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {columns.map((column) => (
                <tr key={column.key} className="border-t border-slate-800">
                  <td className="px-4 py-3 font-medium text-white">{column.label}</td>
                  {selected.map((location) => {
                    const value =
                      column.key === "region"
                        ? location.region
                        : column.key === "altitudeMeters"
                          ? `${location.altitudeMeters} m`
                          : column.key === "population"
                            ? location.wellbeingProfile.demographics.estimatedPopulation.toLocaleString()
                            : column.key === "urbanPopulationPct"
                              ? `${location.wellbeingProfile.demographics.urbanPopulationPct}%`
                              : column.key === "fertility"
                                ? String(location.wellbeingProfile.totalFertilityRate)
                                : column.key === "staples"
                                  ? location.systemsProfile.foodAndNutrition.stapleFoods.join(", ")
                                  : location.systemsProfile.culturalAndHeritage.traditionalMedicines.join(", ");

                    return <td key={`${location.id}-${column.key}`} className="px-4 py-3 align-top text-slate-300">{value}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {selected.map((location) => (
            <div key={location.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">{location.region}</p>
              <h2 className="mt-2 text-xl font-bold text-white">{location.name}</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>Altitude: {location.altitudeMeters} m</p>
                <p>Population: {location.wellbeingProfile.demographics.estimatedPopulation.toLocaleString()}</p>
                <p>Urban share: {location.wellbeingProfile.demographics.urbanPopulationPct}%</p>
                <p>Household size: {location.wellbeingProfile.demographics.averageHouseholdSize}</p>
                <p>Agro-zone: {location.agroZone}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/locations/${location.id}`} className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-cyan-200">
                  Full profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function InsightCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{note}</p>
    </div>
  );
}
