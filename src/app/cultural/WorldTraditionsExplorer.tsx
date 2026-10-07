"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, Search } from "lucide-react";
import {
  CULTURAL_STARTER_RESOURCES,
  WORLD_TRADITIONS,
  WORLD_TRADITION_REGIONS,
} from "@/lib/cultural/worldTraditions";

export default function WorldTraditionsExplorer() {
  const [region, setRegion] = useState<(typeof WORLD_TRADITION_REGIONS)[number]>("All regions");
  const [query, setQuery] = useState("");

  const traditions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return WORLD_TRADITIONS.filter((item) => {
      const matchesRegion = region === "All regions" || item.region === region;
      const searchableText = [
        item.country,
        item.region,
        item.tradition,
        item.focus,
        item.overview,
      ].join(" ").toLocaleLowerCase();
      return matchesRegion && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [query, region]);

  return (
    <section
      id="world-traditions"
      aria-labelledby="world-traditions-title"
      className="scroll-mt-24 space-y-6"
    >
      <div className="rounded-[28px] border border-emerald-400/20 bg-gradient-to-br from-[#152821] via-[#18231f] to-[#201b18] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              Cultural exchange · 8 learning guides
            </span>
            <h2 id="world-traditions-title" className="mt-2 text-2xl font-black text-white md:text-3xl">
              Traditions in their own context
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Explore selected traditions from China, India, Japan, Latin America, Ethiopia, and Ghana.
              These introductions are starting points—not a claim that a region has one shared culture.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-200">
            <BookOpen aria-hidden="true" size={16} />
            <span>Curated links to cultural and public-health sources</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-slate-300">Search traditions</span>
            <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 focus-within:border-emerald-300/60">
              <Search aria-hidden="true" className="shrink-0 text-slate-400" size={17} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try a country, practice, or theme"
                className="min-h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </span>
          </label>
          <div className="flex flex-wrap gap-2" aria-label="Filter traditions by region">
            {WORLD_TRADITION_REGIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRegion(item)}
                aria-pressed={region === item}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                  region === item
                    ? "border-emerald-300 bg-emerald-300/15 text-emerald-100"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-300/40 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400" aria-live="polite">
        Showing {traditions.length} {traditions.length === 1 ? "guide" : "guides"}
        {region !== "All regions" ? ` in ${region}` : ""}.
      </p>

      {traditions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {traditions.map((item) => (
            <article
              key={item.id}
              className="flex flex-col rounded-2xl border border-white/10 bg-stone-900/70 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    {item.region} · {item.country}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-white">{item.tradition}</h3>
                </div>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-slate-300">
                  {item.focus}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{item.overview}</p>
              <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                <p className="text-xs leading-relaxed text-slate-300">
                  <span className="font-semibold text-white">Reflect:</span> {item.reflection}
                </p>
                <p className="text-xs leading-relaxed text-amber-200/90">{item.context}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {item.resources.map((resource) => (
                    <a
                      key={resource.url}
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 underline decoration-emerald-300/30 underline-offset-4 hover:text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                    >
                      {resource.organization}
                      <ArrowUpRight aria-hidden="true" size={13} />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          No guides match that search. Try another term or choose a different region.
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <h3 className="text-base font-bold text-white">Continue learning</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Start with these organizations for broader context, evidence, and cultural heritage resources.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CULTURAL_STARTER_RESOURCES.map((resource) => (
            <a
              key={resource.organization}
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-emerald-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                {resource.organization}
              </span>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-white group-hover:text-emerald-100">
                {resource.title}
                <ArrowUpRight aria-hidden="true" size={14} />
              </span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
