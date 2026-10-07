"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import {
  ETHIOPIAN_HERITAGE_CATEGORIES,
  ETHIOPIAN_HERITAGE_DIRECTORY,
} from "@/lib/cultural/ethiopianHeritage";

export default function EthiopianHeritageExplorer() {
  const [category, setCategory] =
    useState<(typeof ETHIOPIAN_HERITAGE_CATEGORIES)[number]>("All");
  const [query, setQuery] = useState("");

  const entries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return ETHIOPIAN_HERITAGE_DIRECTORY.filter((entry) => {
      const matchesCategory = category === "All" || entry.category === category;
      const searchableText = [
        entry.name,
        entry.localName,
        entry.category,
        entry.area,
        entry.characteristics.join(" "),
        entry.culturalMeaning,
        entry.timing,
        entry.visitorNote,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return (
        matchesCategory &&
        (!normalizedQuery || searchableText.includes(normalizedQuery))
      );
    });
  }, [category, query]);

  return (
    <section
      id="ethiopian-heritage"
      aria-labelledby="ethiopian-heritage-title"
      className="scroll-mt-24 space-y-5"
    >
      <div className="rounded-[28px] border border-amber-400/20 bg-gradient-to-br from-[#302117] via-[#211d19] to-[#17231f] p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
          Ethiopia · living heritage directory · {ETHIOPIAN_HERITAGE_DIRECTORY.length} guides
        </p>
        <h2
          id="ethiopian-heritage-title"
          className="mt-2 text-2xl font-black text-white md:text-3xl"
        >
          Ceremonies, sacred places, springs &amp; cultural landscapes
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
          Explore distinct places and traditions across Ethiopia. Each guide includes
          characteristics, cultural context, seasonal notes where relevant, and
          respectful visitor guidance. Customs, access, and dates can vary by
          community and year, so confirm locally before travelling.
        </p>
        <label className="mt-6 block max-w-xl">
          <span className="mb-2 block text-xs font-semibold text-slate-300">
            Search places, ceremonies, regions, or characteristics
          </span>
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 focus-within:border-amber-300/60">
            <Search aria-hidden="true" className="shrink-0 text-slate-400" size={17} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try Timkat, Sidama, holy water, or Lalibela"
              className="min-h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </span>
        </label>
        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
          aria-label="Filter Ethiopian heritage directory"
        >
          {ETHIOPIAN_HERITAGE_CATEGORIES.map((item) => (
            <button
              key={item}
              id={item === "Springs & geothermal places" ? "mineral-springs" : undefined}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                category === item
                  ? "border-amber-300 bg-amber-300/15 text-amber-100"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-amber-300/40 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="text-xs text-slate-400">
        Showing {entries.length} {entries.length === 1 ? "guide" : "guides"}
        {category !== "All" ? ` in ${category}` : ""}.
      </p>

      {entries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="flex flex-col rounded-2xl border border-white/10 bg-stone-900/70 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                    {entry.category}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-white">{entry.name}</h3>
                  {entry.localName && (
                    <p className="mt-1 text-sm text-amber-100/80">{entry.localName}</p>
                  )}
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-slate-300">
                  {entry.area}
                </span>
              </div>

              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {entry.characteristics.map((characteristic) => (
                  <li
                    key={characteristic}
                    className="flex gap-2 text-xs leading-relaxed text-slate-300"
                  >
                    <span aria-hidden="true" className="text-amber-300">•</span>
                    <span>{characteristic}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                <p className="text-xs leading-relaxed text-slate-300">
                  <span className="font-semibold text-white">Cultural context:</span>{" "}
                  {entry.culturalMeaning}
                </p>
                {entry.timing && (
                  <p className="text-xs leading-relaxed text-slate-300">
                    <span className="font-semibold text-white">Timing:</span>{" "}
                    {entry.timing}
                  </p>
                )}
                <p className="text-xs leading-relaxed text-amber-100/90">
                  <span className="font-semibold">Respect &amp; access:</span>{" "}
                  {entry.visitorNote}
                </p>
                <a
                  href={entry.source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 underline decoration-emerald-300/30 underline-offset-4 hover:text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  Reference: {entry.source.label}
                  <ArrowUpRight aria-hidden="true" size={13} />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          No directory entries match. Try a different search or category.
        </div>
      )}
    </section>
  );
}
