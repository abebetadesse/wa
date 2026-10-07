"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { CaseSearchField, CaseSearchResult } from "@/lib/discovery/caseSearch";

const filterFields: { key: CaseSearchField; label: string }[] = [
  { key: "caseType", label: "Case topic" },
  { key: "herb", label: "Herb or food ingredient" },
  { key: "diet", label: "Diet" },
  { key: "location", label: "Location" },
  { key: "element", label: "Hexacore element" },
];

type Filters = Record<CaseSearchField, string>;
const emptyFilters: Filters = { caseType: "", herb: "", diet: "", location: "", element: "" };

export default function DiscoverExperience() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [result, setResult] = useState<CaseSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = useCallback(async (requestedQuery: string, requestedFilters: Filters) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (requestedQuery.trim()) params.set("q", requestedQuery.trim());
      for (const [key, value] of Object.entries(requestedFilters)) {
        if (value) params.set(key, value);
      }
      const response = await fetch(`/api/case-search?${params.toString()}`);
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Case search failed.");
      setResult(payload.data as CaseSearchResult);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Case search failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void search("", emptyFilters);
  }, [search]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void search(query, filters);
  }

  function clearFilters() {
    setQuery("");
    setFilters(emptyFilters);
    void search("", emptyFilters);
  }

  return (
    <section className="mx-auto max-w-6xl">
      <header className="mb-7 max-w-3xl">
        <div className="badge badge-safe mb-3">Illustrative case library · Educational only</div>
        <h2 className="text-2xl font-bold text-white md:text-3xl">Search sample cases and practical next steps</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Explore 200 generated examples by topic, food or herb, diet, Ethiopian location, and Hexacore element.
          These are not real patient cases or personalized medical advice; Hexacore tags are reflective cultural context, not clinical categories.
        </p>
      </header>

      <form onSubmit={submit} className="glass-panel mb-8 space-y-4 p-5 md:p-7">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-white">Search all enabled case fields</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try sleep, ginger, injera, Gondar, or Water"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-emerald-500"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filterFields.map(({ key, label }) => {
            const options = result?.settings[key] ? result.options[key] : [];
            if (!options.length) return null;
            return (
              <label key={key} className="text-xs font-medium text-slate-300">
                <span className="mb-1.5 block">{label}</span>
                <select
                  value={filters[key]}
                  onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white"
                >
                  <option value="">Any {label.toLowerCase()}</option>
                  {options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" disabled={loading}>{loading ? "Searching..." : "Find cases"}</button>
          <button type="button" onClick={clearFilters} className="btn-secondary" disabled={loading}>Clear filters</button>
        </div>
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      </form>

      {result && (
        <section aria-live="polite" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="badge badge-moderate mb-2">{result.total} example{result.total === 1 ? "" : "s"}</div>
              <h3 className="text-xl font-bold text-white">{result.isFallback ? "Helpful starting points" : "Matching sample cases"}</h3>
            </div>
          </div>
          {result.message && <p className="rounded-xl border border-amber-400/20 bg-amber-950/20 p-3 text-sm text-amber-100">{result.message}</p>}
          <div className="grid gap-4 lg:grid-cols-2">
            {result.results.map((sample) => (
              <article key={sample.id} className="glass-panel p-5">
                <div className="flex flex-wrap gap-2">
                  <span className="badge badge-safe normal-case tracking-normal">{sample.caseType}</span>
                  <span className="badge badge-moderate normal-case tracking-normal">{sample.location}</span>
                  <span className="badge badge-safe normal-case tracking-normal">Hexacore · {sample.element}</span>
                </div>
                <h4 className="mt-3 text-lg font-bold text-white">{sample.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{sample.summary}</p>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-xs uppercase tracking-wide text-emerald-300">Food / herb context</dt><dd className="mt-1 text-slate-200">{sample.herb}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-emerald-300">Diet idea</dt><dd className="mt-1 text-slate-200">{sample.diet}</dd></div>
                </dl>
                <div className="mt-4 rounded-xl border border-emerald-500/15 bg-emerald-950/20 p-3">
                  <h5 className="text-xs font-bold uppercase tracking-wide text-emerald-200">Possible next step</h5>
                  <p className="mt-1 text-sm leading-relaxed text-slate-200">{sample.recommendation}</p>
                </div>
                <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-rose-200/80">{sample.safetyNote}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
