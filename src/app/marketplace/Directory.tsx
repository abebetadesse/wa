"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Heart,
  Leaf,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Button, EmptyState, ErrorState, LoadingState, Select } from "@/components/ui";
import { BusinessCard, LANGUAGE_LABELS, MODE_LABELS, formatEtb, type BusinessSummary } from "@/features/marketplace/shared";
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

interface Suggestions {
  popular: { label: string; category?: string; query?: string; icon: string }[];
  businesses: { id: string; slug: string; name: string; nameAm: string | null; city: string | null; categoryName: string }[];
  services: { id: string; name: string; nameAm: string | null; businessName: string; businessSlug: string; priceEtb: string }[];
  categories: { slug: string; name: string; nameAm: string | null; sector: string }[];
}

const FILTER_KEYS = ["q", "category", "sector", "region", "mode", "language", "minPrice", "maxPrice", "sort", "page"] as const;

const QUICK_SEARCH_PILLS = [
  { label: "🌿 Herbal medicine", q: "herbal" },
  { label: "📜 Awde Negest", q: "Awde Negest" },
  { label: "🦴 Bone setting", q: "bone setting" },
  { label: "☕ Ceremony", q: "ceremony" },
  { label: "📍 Addis Ababa", region: "Addis Ababa" },
  { label: "💻 Online / Video", mode: "video" },
];

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

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Price input local states
  const [minPriceInput, setMinPriceInput] = useState(params.get("minPrice") ?? "");
  const [maxPriceInput, setMaxPriceInput] = useState(params.get("maxPrice") ?? "");

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

  // Fetch directory businesses whenever query string changes
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

  // Keep local query input in sync with URL
  useEffect(() => {
    setQuery(params.get("q") ?? "");
    setMinPriceInput(params.get("minPrice") ?? "");
    setMaxPriceInput(params.get("maxPrice") ?? "");
  }, [params]);

  // Live debounced search
  useEffect(() => {
    const currentQ = params.get("q") ?? "";
    if (query.trim() === currentQ) return;
    const timer = setTimeout(() => {
      setParam({ q: query.trim() || null });
    }, 350);
    return () => clearTimeout(timer);
  }, [query, params, setParam]);

  // Autocomplete fetcher
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      apiFetch<Suggestions>(`/api/marketplace/suggestions?q=${encodeURIComponent(query.trim())}`)
        .then((data) => !cancelled && setSuggestions(data))
        .catch(() => !cancelled && setSuggestions(null));
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setShowSuggestions(false);
    setParam({ q: query.trim() || null });
  }

  function handleClearSearch() {
    setQuery("");
    setShowSuggestions(false);
    setParam({ q: null });
  }

  function handleSelectSuggestion(type: "business" | "service" | "category" | "query", value: string, extraSlug?: string) {
    setShowSuggestions(false);
    if (type === "business") {
      router.push(`/b/${value}`);
    } else if (type === "service") {
      router.push(`/b/${extraSlug ?? value}`);
    } else if (type === "category") {
      setQuery("");
      setParam({ category: value, q: null });
    } else {
      setQuery(value);
      setParam({ q: value });
    }
  }

  function applyPriceFilter(e: FormEvent) {
    e.preventDefault();
    setParam({
      minPrice: minPriceInput.trim() || null,
      maxPrice: maxPriceInput.trim() || null,
    });
  }

  const active = FILTER_KEYS.filter((key) => key !== "sort" && key !== "page" && params.get(key));
  const categoryName = (slug: string) => facets?.categories.find((c) => c.slug === slug)?.name ?? slug;
  const chipLabel = (key: string, value: string) =>
    key === "category" ? categoryName(value)
    : key === "mode" ? MODE_LABELS[value]?.label ?? value
    : key === "language" ? LANGUAGE_LABELS[value] ?? value
    : key === "sector" ? (value === "cultural" ? "Cultural services" : "Healing traditions")
    : key === "minPrice" ? `Min ${value} ETB`
    : key === "maxPrice" ? `Max ${value} ETB`
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

      {/* Price budget filter */}
      <form onSubmit={applyPriceFilter} className="flex flex-col gap-2 rounded-2xl border border-border p-3">
        <span className="text-sm font-semibold text-foreground">Price range (ETB)</span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" size="sm" variant="outline" className="h-7 flex-1 text-xs">Apply</Button>
          {(params.get("minPrice") || params.get("maxPrice")) && (
            <button
              type="button"
              onClick={() => {
                setMinPriceInput("");
                setMaxPriceInput("");
                setParam({ minPrice: null, maxPrice: null });
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          )}
        </div>
      </form>

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

  const hasSuggestions =
    suggestions &&
    (suggestions.popular.length > 0 ||
      suggestions.businesses.length > 0 ||
      suggestions.services.length > 0 ||
      suggestions.categories.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Find a healer or cultural maker</h1>
        <p className="text-muted-foreground">Every listing is a verified business. Book directly, message them, and get live updates.</p>
      </div>

      {/* Main Search Bar with Live Autocomplete */}
      <div ref={searchContainerRef} className="relative mt-6">
        <form
          onSubmit={onSearch}
          className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-sm transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-ring"
        >
          <Search className="ml-3 size-5 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="directory-search" className="sr-only">Search</label>
          <input
            id="directory-search"
            value={query}
            autoComplete="off"
            onFocus={() => setShowSuggestions(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Search by healer name, service (e.g. Awde Negest), herb, or city…"
            className="h-11 min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="mr-1 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Clear search text"
            >
              <X className="size-4" />
            </button>
          )}
          <Button type="submit" className="h-11 px-6">Search</Button>
        </form>

        {/* Autocomplete Dropdown */}
        {showSuggestions && hasSuggestions && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-3xl border border-border bg-card p-3 shadow-2xl backdrop-blur">
            {suggestions.popular.length > 0 && !query.trim() && (
              <div>
                <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Popular searches</p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {suggestions.popular.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSelectSuggestion(item.category ? "category" : "query", item.category ?? item.query ?? item.label)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <Sparkles className="size-4 text-brand" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {suggestions.categories.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tradition / Categories</p>
                <div className="flex flex-wrap gap-1.5 px-3 py-1">
                  {suggestions.categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => handleSelectSuggestion("category", cat.slug)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:border-brand hover:bg-brand/10"
                    >
                      <Tag className="size-3 text-brand" />
                      <span>{cat.name}</span>
                      {cat.nameAm && <span className="text-[11px] text-muted-foreground">({cat.nameAm})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {suggestions.businesses.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Healers &amp; Businesses</p>
                <div className="flex flex-col gap-1">
                  {suggestions.businesses.map((biz) => (
                    <button
                      key={biz.id}
                      type="button"
                      onClick={() => handleSelectSuggestion("business", biz.slug)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <div>
                        <span className="font-semibold">{biz.name}</span>
                        {biz.nameAm && <span className="ml-1.5 text-xs text-muted-foreground">({biz.nameAm})</span>}
                        <span className="ml-2 text-xs text-muted-foreground">· {biz.categoryName}</span>
                      </div>
                      {biz.city && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" /> {biz.city}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {suggestions.services.length > 0 && (
              <div>
                <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Services</p>
                <div className="flex flex-col gap-1">
                  {suggestions.services.map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => handleSelectSuggestion("service", srv.id, srv.businessSlug)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <div>
                        <span className="font-semibold text-brand-strong">{srv.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">at {srv.businessName}</span>
                      </div>
                      <span className="font-display text-xs font-bold text-foreground">{formatEtb(srv.priceEtb)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Search Suggestions Pills */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-muted-foreground">Try:</span>
        {QUICK_SEARCH_PILLS.map((pill) => (
          <button
            key={pill.label}
            type="button"
            onClick={() => {
              if (pill.region) setParam({ region: pill.region });
              else if (pill.mode) setParam({ mode: pill.mode });
              else if (pill.q) {
                setQuery(pill.q);
                setParam({ q: pill.q });
              }
            }}
            className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-brand hover:bg-brand/10 hover:text-brand-strong"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Active filters and sort */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters(true)}>
          <SlidersHorizontal className="size-4" aria-hidden="true" /> Filters{active.length ? ` (${active.length})` : ""}
        </Button>
        {active.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (key === "q") setQuery("");
              if (key === "minPrice") setMinPriceInput("");
              if (key === "maxPrice") setMaxPriceInput("");
              setParam({ [key]: null });
            }}
            className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-strong hover:bg-brand/20"
          >
            {chipLabel(key, params.get(key)!)} <X className="size-3.5" aria-label="Remove filter" />
          </button>
        ))}
        {active.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setMinPriceInput("");
              setMaxPriceInput("");
              router.push(pathname);
            }}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        )}
        <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          Sort
          <Select className="h-9 w-auto py-1" value={params.get("sort") ?? "rating"} onChange={(event) => setParam({ sort: event.target.value })}>
            <option value="rating">{params.get("q") ? "Best match" : "Top rated"}</option>
            <option value="price_asc">Price: Low to high</option>
            <option value="price_desc">Price: High to low</option>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </Select>
        </label>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">{filters}</aside>

        <section aria-live="polite" aria-busy={loading}>
          {error && <ErrorState message={error} onRetry={() => router.refresh()} />}
          {!error && loading && !results && <LoadingState label="Searching verified practitioners…" />}
          {!error && results && (
            <>
              <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                <p>
                  {results.total === 0
                    ? "No businesses match your search."
                    : `${results.total} ${results.total === 1 ? "business" : "businesses"} found`}
                  {params.get("q") && <span className="font-semibold text-foreground"> for “{params.get("q")}”</span>}
                </p>
                {loading && <span className="text-xs font-medium text-brand animate-pulse">Updating…</span>}
              </div>

              {results.total === 0 ? (
                <EmptyState
                  title="Nothing matches these search criteria"
                  description="Try searching with a broader keyword (e.g. 'herbal', 'reading', 'massage'), another location, or clear active filters."
                  action={
                    active.length ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuery("");
                          setMinPriceInput("");
                          setMaxPriceInput("");
                          router.push(pathname);
                        }}
                      >
                        Clear all filters
                      </Button>
                    ) : undefined
                  }
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
