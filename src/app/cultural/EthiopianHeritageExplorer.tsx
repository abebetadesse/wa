"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import {
  ETHIOPIAN_HERITAGE_CATEGORIES,
  ETHIOPIAN_HERITAGE_DIRECTORY,
} from "@/lib/cultural/ethiopianHeritage";
import { assetUrl } from "@/lib/base-path";

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
      <div className="rounded-[28px] border border-gold/20 bg-gradient-to-br from-gold-soft via-card to-brand-soft p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
          Ethiopia · living heritage directory · {ETHIOPIAN_HERITAGE_DIRECTORY.length} guides
        </p>
        <h2
          id="ethiopian-heritage-title"
          className="mt-2 text-2xl font-bold text-foreground md:text-3xl"
        >
          Ceremonies, sacred places, springs &amp; cultural landscapes
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-soft">
          Explore distinct places and traditions across Ethiopia. Each guide includes
          characteristics, cultural context, seasonal notes where relevant, and
          respectful visitor guidance. Customs, access, and dates can vary by
          community and year, so confirm locally before travelling.
        </p>
        <label className="mt-6 block max-w-xl">
          <span className="mb-2 block text-xs font-semibold text-soft">
            Search places, ceremonies, regions, or characteristics
          </span>
          <span className="flex items-center gap-2 rounded-xl border border-border bg-sunken/50 px-3 focus-within:border-gold/60">
            <Search aria-hidden="true" className="shrink-0 text-muted-foreground" size={17} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try Timkat, Sidama, holy water, or Lalibela"
              className="min-h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-subtle"
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
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                category === item
                  ? "border-gold bg-gold/15 text-gold-strong"
                  : "border-border bg-foreground/5 text-soft hover:border-gold/40 hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="text-xs text-muted-foreground">
        Showing {entries.length} {entries.length === 1 ? "guide" : "guides"}
        {category !== "All" ? ` in ${category}` : ""}.
      </p>

      {entries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="flex flex-col rounded-2xl border border-border bg-card/70 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
                    {entry.category}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-foreground">{entry.name}</h3>
                  {entry.localName && (
                    <p className="mt-1 text-sm text-gold-strong">{entry.localName}</p>
                  )}
                </div>
                <span className="rounded-full border border-border bg-foreground/5 px-2.5 py-1 text-[10px] text-soft">
                  {entry.area}
                </span>
              </div>

              <ul className="mt-4 space-y-2 border-t border-border pt-4">
                {entry.characteristics.map((characteristic) => (
                  <li
                    key={characteristic}
                    className="flex gap-2 text-xs leading-relaxed text-soft"
                  >
                    <span aria-hidden="true" className="text-gold">•</span>
                    <span>{characteristic}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <p className="text-xs leading-relaxed text-soft">
                  <span className="font-semibold text-foreground">Cultural context:</span>{" "}
                  {entry.culturalMeaning}
                </p>
                {entry.timing && (
                  <p className="text-xs leading-relaxed text-soft">
                    <span className="font-semibold text-foreground">Timing:</span>{" "}
                    {entry.timing}
                  </p>
                )}
                <p className="text-xs leading-relaxed text-gold-strong">
                  <span className="font-semibold">Respect &amp; access:</span>{" "}
                  {entry.visitorNote}
                </p>
                <a
                  href={assetUrl(entry.source.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand underline decoration-brand/30 underline-offset-4 hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
        <div className="rounded-2xl border border-border bg-foreground/5 p-6 text-sm text-soft">
          No directory entries match. Try a different search or category.
        </div>
      )}
    </section>
  );
}
