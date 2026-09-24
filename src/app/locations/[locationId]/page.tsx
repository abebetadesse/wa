import Link from "next/link";
import { notFound } from "next/navigation";
import { getEthiopianLocationById, getLocationProvenanceSummary } from "@/lib/location/ethiopiaLocations";

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  const location = getEthiopianLocationById(locationId);

  if (!location) {
    notFound();
  }

  const diseaseSummary = [
    ...location.wellbeingProfile.communicableDiseaseRates.map((rate) => `${rate.condition}: ${rate.value}${rate.measure === "prevalence_pct" ? "%" : "/100k"}`),
    ...location.wellbeingProfile.nonCommunicableDiseaseRates.map((rate) => `${rate.condition}: ${rate.value}${rate.measure === "prevalence_pct" ? "%" : "/100k"}`),
  ];
  const provenance = getLocationProvenanceSummary(location);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/locations" className="text-sm text-cyan-300 hover:text-cyan-200">
            ← Back to all locations
          </Link>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-200">
            {location.agroZone}
          </span>
        </div>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{location.region}</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">{location.name}</h1>
              <p className="mt-1 text-lg text-slate-400">{location.nameAmharic}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Elevation</p>
              <p className="text-2xl font-bold text-emerald-300">{location.altitudeMeters} m</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Population" value={location.wellbeingProfile.demographics.estimatedPopulation.toLocaleString()} />
          <StatCard label="Urban share" value={`${location.wellbeingProfile.demographics.urbanPopulationPct}%`} />
          <StatCard label="Median age" value={`${location.wellbeingProfile.demographics.medianAgeYears} yrs`} />
          <StatCard label="Household" value={`${location.wellbeingProfile.demographics.averageHouseholdSize} people`} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <DetailPanel title="Population and health profile">
            <ul className="space-y-2 text-sm text-slate-300">
              <li><span className="text-slate-400">Languages:</span> {location.commonLanguages.join(", ")}</li>
              <li><span className="text-slate-400">Rift valley:</span> {location.riftValley ? "Yes" : "No"}</li>
              <li><span className="text-slate-400">Birth rate:</span> {location.wellbeingProfile.birthRatePer1000}/1000</li>
              <li><span className="text-slate-400">Total fertility rate:</span> {location.wellbeingProfile.totalFertilityRate}</li>
              <li><span className="text-slate-400">Reference year:</span> {location.wellbeingProfile.referenceYear}</li>
            </ul>
          </DetailPanel>

          <DetailPanel title="Nutrition and food system">
            <div className="space-y-3 text-sm text-slate-300">
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">Staples</p>
                <p>{location.systemsProfile.foodAndNutrition.stapleFoods.join(", ")}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">Fermented foods</p>
                <p>{location.systemsProfile.foodAndNutrition.fermentedFoodsAndDrinks.join(", ")}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">Common ingredients</p>
                <p>{location.systemsProfile.foodAndNutrition.commonIngredients.join(", ")}</p>
              </div>
            </div>
          </DetailPanel>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <DetailPanel title="Traditional medicine and cultural profile">
            <ul className="space-y-2 text-sm text-slate-300">
              {location.systemsProfile.culturalAndHeritage.traditionalMedicines.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </DetailPanel>

          <DetailPanel title="Data provenance and trust">
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2">
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Overall confidence</span>
                <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-200">
                  {provenance.overallConfidence}
                </span>
              </div>
              <p><span className="text-slate-400">Confidence score:</span> {provenance.confidenceScore}/100</p>
              <p><span className="text-slate-400">Source coverage:</span> {provenance.sourceCoveragePct}%</p>
              <p><span className="text-slate-400">Linked sources:</span> {provenance.verifiedSources}</p>
              {provenance.unresolvedGaps.length > 0 && (
                <ul className="space-y-1 text-xs text-amber-200">
                  {provenance.unresolvedGaps.map((gap) => (
                    <li key={gap}>• {gap}</li>
                  ))}
                </ul>
              )}
            </div>
          </DetailPanel>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <DetailPanel title="Disease and risk summary">
            <ul className="space-y-2 text-sm text-slate-300">
              {diseaseSummary.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </DetailPanel>

          <DetailPanel title="Evidence note">
            <p className="text-sm text-slate-300">
              This location profile is an indicative planning estimate. The source confidence layer helps distinguish verified observations from modeled and inferred values so users can interpret the analysis with appropriate caution.
            </p>
          </DetailPanel>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <DetailPanel title="Ecology">
            <ul className="space-y-2 text-sm text-slate-300">
              <li><span className="text-slate-400">Ecosystem:</span> {location.systemsProfile.ecology.ecosystem}</li>
              <li><span className="text-slate-400">Geography:</span> {location.systemsProfile.ecology.geography}</li>
              <li><span className="text-slate-400">Rainfall:</span> {location.systemsProfile.ecology.annualPrecipitationMm[0]}–{location.systemsProfile.ecology.annualPrecipitationMm[1]} mm</li>
              <li><span className="text-slate-400">Temp:</span> {location.systemsProfile.ecology.temperatureRangeC[0]}–{location.systemsProfile.ecology.temperatureRangeC[1]}°C</li>
            </ul>
          </DetailPanel>

          <DetailPanel title="Agriculture">
            <ul className="space-y-2 text-sm text-slate-300">
              {location.systemsProfile.agriculture.crops.slice(0, 6).map((crop) => (
                <li key={crop}>• {crop}</li>
              ))}
            </ul>
          </DetailPanel>

          <DetailPanel title="Food-based patterns">
            <ul className="space-y-2 text-sm text-slate-300">
              {location.systemsProfile.foodAndNutrition.traditionalDietPatterns.slice(0, 6).map((pattern) => (
                <li key={pattern}>• {pattern}</li>
              ))}
            </ul>
          </DetailPanel>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function DetailPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      {children}
    </div>
  );
}
