"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Button, EmptyState, ErrorState, LoadingState, Select } from "@/components/ui";
import { BusinessCard, LANGUAGE_LABELS, MODE_LABELS, type BusinessSummary } from "@/features/marketplace/shared";
import { cn } from "@/lib/utils";

interface Facets {
  categories: { slug: string; name: string; nameAm: string | null; sector: string; count: number }[];
  regions: { region: string | null; count: number }[];
  languages: { language: string; count: number }[];
}

interface Results {
  businesses: BusinessSummary[];
  total: number;
  page: number;
  totalPages: number;
}

const FILTER_KEYS = ["q", "category", "sector", "region", "mode", "language", "sort", "page"] as const;

export function Directory() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [facets, setFacets] = useState<Facets | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState(params.get("q") ?? "");

  const queryString = params.toString();

  const setParam = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(queryString);
      for (const [key, value] of Object.entries(updates)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      if (!("page" in updates)) next.delete("page");
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, queryString, router],
  );

  useEffect(() => {
    apiFetch<Facets>("/api/marketplace/facets").then(setFacets).catch(() => setFacets({ categories: [], regions: [], languages: [] }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const search = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      const value = new URLSearchParams(queryString).get(key);
      if (value) search.set(key, value);
    }
    apiFetch<Results>(`/api/marketplace/businesses?${search.toString()}`)
      .then((data) => !cancelled && (setResults(data), setError(null)))
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  useEffect(() => setQuery(params.get("q") ?? ""), [params]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setParam({ q: query.trim() || null });
  }

  const active = FILTER_KEYS.filter((key) => key !== "sort" && key !== "page" && params.get(key));
  const categoryName = (slug: string) => facets?.categories.find((c) => c.slug === slug)?.name ?? slug;
  const chipLabel = (key: string, value: string) =>
    key === "category" ? categoryName(value)
    : key === "mode" ? MODE_LABELS[value]?.label ?? value
    : key === "language" ? LANGUAGE_LABELS[value] ?? value
    : key === "sector" ? (value === "cultural" ? "Cultural services" : "Healing traditions")
    : key === "q" ? `“${value}”`
    : value;

  const filters = (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tradition</legend>
        <div className="flex flex-col gap-1">
          {(["healing", "cultural"] as const).map((sector) => {
            const items = facets?.categories.filter((c) => c.sector === sector) ?? [];
            if (!items.length) return null;
            return (
              <div key={sector} className="mb-2">
                <p className="mb-1 px-2 text-xs font-semibold text-muted-foreground">{sector === "healing" ? "Healing" : "Cultural"}</p>
                {items.map((category) => {
                  const selected = params.get("category") === category.slug;
                  return (
                    <button
                      key={category.slug}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setParam({ category: selected ? null : category.slug })}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors",
                        selected ? "bg-brand/10 font-semibold text-brand-strong" : "text-foreground hover:bg-accent",
                      )}
                    >
                      <span>{category.name}</span>
                      {category.count > 0 && <span className="text-xs text-muted-foreground">{category.count}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
        Region
        <Select value={params.get("region") ?? ""} onChange={(event) => setParam({ region: event.target.value || null })}>
          <option value="">Anywhere</option>
          {facets?.regions.filter((r) => r.region).map((region) => (
            <option key={region.region} value={region.region!}>{region.region} ({region.count})</option>
          ))}
        </Select>
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-foreground">How you meet</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(MODE_LABELS).map(([mode, { label, icon: Icon }]) => {
            const selected = params.get("mode") === mode;
            return (
              <button
                key={mode}
                type="button"
                aria-pressed={selected}
                onClick={() => setParam({ mode: selected ? null : mode })}
                className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors", selected ? "border-brand bg-brand/10 text-brand-strong" : "border-border text-muted-foreground hover:border-input")}
              >
                <Icon className="size-3.5" aria-hidden="true" /> {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {facets && facets.languages.length > 0 && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-foreground">
          Language
          <Select value={params.get("language") ?? ""} onChange={(event) => setParam({ language: event.target.value || null })}>
            <option value="">Any language</option>
            {facets.languages.map((language) => (
              <option key={language.language} value={language.language}>{LANGUAGE_LABELS[language.language] ?? language.language}</option>
            ))}
          </Select>
        </label>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Find a healer or cultural maker</h1>
        <p className="text-muted-foreground">Every listing is a verified business. Book directly, message them, and get live updates.</p>
      </div>

      <form onSubmit={onSearch} className="mt-6 flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring">
        <Search className="ml-3 size-5 text-muted-foreground" aria-hidden="true" />
        <label htmlFor="directory-search" className="sr-only">Search</label>
        <input
          id="directory-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, service or city"
          className="h-11 min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Button type="submit" className="h-11">Search</Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters(true)}>
          <SlidersHorizontal className="size-4" aria-hidden="true" /> Filters{active.length ? ` (${active.length})` : ""}
        </Button>
        {active.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setParam({ [key]: null })}
            className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-strong hover:bg-brand/20"
          >
            {chipLabel(key, params.get(key)!)} <X className="size-3.5" aria-label="Remove filter" />
          </button>
        ))}
        {active.length > 0 && (
          <button type="button" onClick={() => router.push(pathname)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
            Clear all
          </button>
        )}
        <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          Sort
          <Select className="h-9 w-auto py-1" value={params.get("sort") ?? "rating"} onChange={(event) => setParam({ sort: event.target.value })}>
            <option value="rating">Top rated</option>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </Select>
        </label>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">{filters}</aside>

        <section aria-live="polite" aria-busy={loading}>
          {error && <ErrorState message={error} onRetry={() => router.refresh()} />}
          {!error && loading && !results && <LoadingState label="Finding businesses…" />}
          {!error && results && (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {results.total === 0 ? "No businesses match yet." : `${results.total} ${results.total === 1 ? "business" : "businesses"}`}
              </p>
              {results.total === 0 ? (
                <EmptyState
                  title="Nothing matches these filters"
                  description="Try a broader search, another region or a different way of meeting."
                  action={active.length ? <Button variant="outline" onClick={() => router.push(pathname)}>Clear filters</Button> : undefined}
                />
              ) : (
                <ul className={cn("grid gap-5 sm:grid-cols-2 xl:grid-cols-3 transition-opacity", loading && "opacity-60")}>
                  {results.businesses.map((business) => (
                    <li key={business.id}>
                      <BusinessCard business={business} />
                    </li>
                  ))}
                </ul>
              )}
              {results.totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
                  <Button variant="outline" size="sm" disabled={results.page <= 1} onClick={() => setParam({ page: String(results.page - 1) })}>
                    <ChevronLeft className="size-4" aria-hidden="true" /> Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {results.page} of {results.totalPages}</span>
                  <Button variant="outline" size="sm" disabled={results.page >= results.totalPages} onClick={() => setParam({ page: String(results.page + 1) })}>
                    Next <ChevronRight className="size-4" aria-hidden="true" />
                  </Button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} aria-label="Close filters" />
          <div className="absolute inset-y-0 right-0 flex w-[min(22rem,90vw)] flex-col gap-4 overflow-y-auto bg-background p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-bold text-foreground">Filters</p>
              <button type="button" onClick={() => setShowFilters(false)} className="rounded-full p-2 hover:bg-accent" aria-label="Close filters">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {filters}
            <Button className="mt-auto" onClick={() => setShowFilters(false)}>Show results</Button>
          </div>
        </div>
      )}
    </div>
  );
}
