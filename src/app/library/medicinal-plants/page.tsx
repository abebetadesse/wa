"use client";

import { useMemo, useState } from "react";
import { Search, MapPinned, Leaf, ShieldAlert, ArrowLeft, MapPin, BookOpen, FlaskConical, Factory } from "lucide-react";
import { ETHIOPIAN_MEDICINAL_PLANTS, MEDICINAL_PLANT_DISEASES, filterMedicinalPlants } from "@/lib/knowledge/ethiopianMedicinalPlants";

export default function MedicinalPlantsPage() {
  const [query, setQuery] = useState("");
  const [selectedDisease, setSelectedDisease] = useState("all");
  const [selectedPlantId, setSelectedPlantId] = useState(ETHIOPIAN_MEDICINAL_PLANTS[0]?.id ?? "");

  const diseaseOptions = useMemo(() => ["all", ...MEDICINAL_PLANT_DISEASES], []);

  const plants = useMemo(
    () => filterMedicinalPlants(query, selectedDisease),
    [query, selectedDisease]
  );

  const selectedPlant = useMemo(
    () => ETHIOPIAN_MEDICINAL_PLANTS.find((plant) => plant.id === selectedPlantId) ?? ETHIOPIAN_MEDICINAL_PLANTS[0],
    [selectedPlantId]
  );

  return (
    <main className="space-y-8 pb-16">
      <header className="rounded-[28px] border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-stone-950 to-amber-950/20 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300">
          <Leaf size={12} />
          Medicinal plant atlas
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
          Ethiopian medicinal plant atlas
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-stone-300 md:text-base">
          Extracted from the EPHI ethnobotanical medicinal plant study by wereda and normalized into searchable records
          with habitat, plant part, location, preparation, disease use, and traditional indication data.
        </p>
      </header>

      <section className="rounded-[28px] border border-stone-800 bg-stone-900/70 p-5">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <label className="flex items-center gap-3 rounded-2xl border border-stone-700 bg-stone-950/60 px-4 py-3 text-sm text-stone-300">
            <Search size={16} className="text-emerald-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by plant, disease, habitat, or region"
              className="w-full bg-transparent text-white placeholder:text-stone-500 focus:outline-none"
            />
          </label>

          <select
            value={selectedDisease}
            onChange={(event) => setSelectedDisease(event.target.value)}
            className="rounded-2xl border border-stone-700 bg-stone-950/60 px-4 py-3 text-sm text-stone-200 focus:outline-none"
            aria-label="Filter by disease"
          >
            {diseaseOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All disease types" : option}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-stone-800 bg-stone-900/70 p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Extracted records</div>
          <div className="mt-3 text-3xl font-black text-white">{ETHIOPIAN_MEDICINAL_PLANTS.length}</div>
        </div>
        <div className="rounded-[24px] border border-stone-800 bg-stone-900/70 p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Visible results</div>
          <div className="mt-3 text-3xl font-black text-white">{plants.length}</div>
        </div>
        <div className="rounded-[24px] border border-stone-800 bg-stone-900/70 p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Source</div>
          <div className="mt-3 text-sm font-semibold text-emerald-300">EPHI Wereda Study</div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="grid gap-5 xl:grid-cols-2">
          {plants.map((plant) => (
            <article key={plant.id} className="cursor-pointer rounded-[24px] border border-stone-800 bg-stone-900/70 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] transition hover:border-emerald-500/60 hover:bg-stone-900/90" onClick={() => setSelectedPlantId(plant.id)}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400">{plant.growthForm}</div>
                  <h2 className="mt-2 text-2xl font-bold text-white">{plant.vernacularName}</h2>
                  <p className="mt-1 text-sm italic text-stone-400">{plant.scientificName}</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
                  <Leaf size={22} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.15em] text-stone-300">
                {plant.amharicName && <span className="rounded-full border border-stone-700 px-2 py-1">{plant.amharicName}</span>}
                <span className="rounded-full border border-stone-700 px-2 py-1">{plant.habitat}</span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">
                    <MapPinned size={12} />
                    Habitat
                  </div>
                  <p className="text-sm text-stone-300">{plant.habitat}</p>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">
                    <ShieldAlert size={12} />
                    Parts used
                  </div>
                  <p className="text-sm text-stone-300">{plant.plantParts.join(", ")}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">Traditional use</div>
                <p className="text-sm leading-relaxed text-stone-300">{plant.traditionalUse}</p>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">Geographic distribution</div>
                  <p className="text-sm text-stone-300">{plant.geographicalDistribution ?? plant.location ?? plant.habitat}</p>
                </div>
                <div>
                  <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">Mode of action</div>
                  <p className="text-sm text-stone-300">{plant.modeOfAction ?? plant.action ?? plant.traditionalUse}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">Location</div>
                  <p className="text-sm text-stone-300">{plant.location ?? plant.habitat}</p>
                </div>
                <div>
                  <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">Preparation</div>
                  <p className="text-sm text-stone-300">{plant.modeOfPreparation ?? "Careful decoction / infusion / direct use"}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">Diseases treated</div>
                <div className="flex flex-wrap gap-2">
                  {plant.diseasesTreated.map((disease) => (
                    <span key={disease} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-amber-300">
                      {disease}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-stone-800 pt-3 text-[10px] uppercase tracking-[0.12em] text-stone-500">
                {plant.source}
              </div>
            </article>
          ))}
        </section>

        <aside className="rounded-[28px] border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-stone-950 p-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-300">Record detail</span>
            <span className="rounded-full border border-emerald-500/30 px-2 py-1 text-[10px] text-stone-300">#{selectedPlant.id}</span>
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-2 text-emerald-300">
              <Leaf size={16} />
              <span className="text-[10px] uppercase tracking-[0.2em]">{selectedPlant.growthForm}</span>
            </div>
            <h2 className="mt-3 text-3xl font-black text-white">{selectedPlant.vernacularName}</h2>
            <p className="mt-2 italic text-sm text-stone-400">{selectedPlant.scientificName}</p>
          </div>

          <div className="mt-5 rounded-[22px] border border-stone-700 bg-stone-900/50 p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">
              <MapPin size={12} />
              Location / habitat
            </div>
            <p className="mt-2 text-sm leading-relaxed text-stone-300">{selectedPlant.location ?? selectedPlant.habitat}</p>
          </div>

          <div className="mt-4 rounded-[22px] border border-stone-700 bg-stone-900/50 p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">
              <FlaskConical size={12} />
              Mode of preparation
            </div>
            <p className="mt-2 text-sm leading-relaxed text-stone-300">{selectedPlant.modeOfPreparation ?? selectedPlant.traditionalUse}</p>
          </div>

          <div className="mt-4 rounded-[22px] border border-stone-700 bg-stone-900/50 p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">
              <Leaf size={12} />
              Therapeutic action
            </div>
            <p className="mt-2 text-sm leading-relaxed text-stone-300">{selectedPlant.action ?? selectedPlant.traditionalUse}</p>
          </div>

          <div className="mt-4 rounded-[22px] border border-stone-700 bg-stone-900/50 p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">
              <BookOpen size={12} />
              Parts used
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedPlant.plantParts.map((part) => (
                <span key={part} className="rounded-full border border-stone-700 px-2 py-1 text-[10px] text-stone-300">{part}</span>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-amber-300">Traditional treatment</div>
            <p className="text-sm leading-relaxed text-stone-200">{selectedPlant.traditionalUse}</p>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">Diseases treated</div>
            <div className="flex flex-wrap gap-2">
              {selectedPlant.diseasesTreated.map((disease) => (
                <span key={disease} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-emerald-300">
                  {disease}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-stone-800 pt-4 text-[10px] uppercase tracking-[0.12em] text-stone-500">
            <div className="mb-2 flex items-center gap-2"><ShieldAlert size={12} /> Safety note</div>
            <p className="leading-relaxed text-stone-400">Documented source entry from chapter 66996. Review with ETM-DB safety gates before clinical use.</p>
          </div>

          <div className="mt-4 text-[10px] uppercase tracking-[0.12em] text-stone-600">
            {selectedPlant.source}
          </div>
        </aside>
      </section>

      {plants.length === 0 && (
        <div className="rounded-[28px] border border-dashed border-stone-700 bg-stone-900/50 p-10 text-center text-stone-300">
          No medicinal plants match the current filter.
        </div>
      )}
    </main>
  );
}
