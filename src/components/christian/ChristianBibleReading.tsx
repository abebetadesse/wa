"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useProfileReligion } from "@/hooks/useProfileReligion";
import {
  READING_CATEGORIES,
  READING_LIBRARY,
  WORDPROJECT_INDEX_URL,
  readingsByCategory,
  wordProjectChapterUrl,
  type ReadingCategory,
  type ReadingOption,
} from "@/lib/christian/readingLibrary";
import { getLiturgicalContext } from "@/lib/christian/liturgicalCalendar";

// ─── Local storage ──────────────────────────────────────────────

const LS_VERSION = "v1";
const LS_LAST = `ewa.christian.lastReading.${LS_VERSION}`;
const LS_BOOKMARKS = `ewa.christian.bookmarks.${LS_VERSION}`;

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage quota or privacy mode — ignore */
  }
}

// ─── Main component ─────────────────────────────────────────────

export default function ChristianBibleReading() {
  const { loading, error, isChristian, tradition, rawReligion } = useProfileReligion();

  const [activeCategory, setActiveCategory] = useState<ReadingCategory>("daily");
  const [selected, setSelected] = useState<ReadingOption>(READING_LIBRARY[0]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [justCopied, setJustCopied] = useState(false);

  // Load persisted state once we're in the browser
  useEffect(() => {
    setBookmarks(readLS<string[]>(LS_BOOKMARKS, []));
    const lastId = readLS<string | null>(LS_LAST, null);
    if (lastId) {
      const found = READING_LIBRARY.find((r) => r.id === lastId);
      if (found) {
        setSelected(found);
        setActiveCategory(found.category);
      }
    }
  }, []);

  // Persist continue-reading whenever selection changes
  useEffect(() => {
    writeLS(LS_LAST, selected.id);
  }, [selected.id]);

  const liturgical = useMemo(() => getLiturgicalContext(), []);
  const categoryReadings = useMemo(
    () => readingsByCategory(activeCategory),
    [activeCategory]
  );

  const isBookmarked = bookmarks.includes(selected.id);

  const toggleBookmark = useCallback(() => {
    setBookmarks((prev) => {
      const next = prev.includes(selected.id)
        ? prev.filter((id) => id !== selected.id)
        : [...prev, selected.id];
      writeLS(LS_BOOKMARKS, next);
      return next;
    });
  }, [selected.id]);

  const handleShare = useCallback(async () => {
    const url = wordProjectChapterUrl(selected.book, selected.chapter);
    const shareData = {
      title: `${selected.label} — Amharic Bible`,
      text: `${selected.label}: ${selected.description}`,
      url,
    };

    try {
      const browserNavigator = navigator as Navigator & {
        share?: (data: ShareData) => Promise<void>;
      };
      if (typeof browserNavigator.share === "function") {
        await browserNavigator.share(shareData);
        return;
      }
      await browserNavigator.clipboard.writeText(url);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    } catch {
      /* user cancelled or clipboard blocked — silently ignore */
    }
  }, [selected]);

  // ─── Loading skeleton ────────────────────────────────────────
  if (loading) {
    return <LoadingSkeleton />;
  }

  // ─── Error or non-Christian — hidden entirely ────────────────
  // We don't render an error card for non-Christian users; the component
  // simply does not appear. Errors are logged upstream by the hook.
  if (error || !isChristian) {
    return null;
  }

  const sourceUrl = wordProjectChapterUrl(selected.book, selected.chapter);
  const traditionLabel = traditionLabelFor(tradition);

  return (
    <section
      aria-labelledby="christian-reading-heading"
      className="mt-8 rounded-3xl border border-amber-500/30 bg-stone-950/70 p-6 shadow-xl shadow-amber-950/10"
    >
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
            Christian reading path · Amharic Bible
          </p>
          <h2
            id="christian-reading-heading"
            className="mt-2 text-2xl font-bold text-white"
          >
            Read a chapter in Amharic
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-300">
            Because your profile identifies a Christian tradition, you can open
            an Amharic chapter directly from WordProject. This platform does
            not copy or host the full text.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {traditionLabel && (
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              {traditionLabel}
            </span>
          )}
          {liturgical.summary !== "Ordinary day" && (
            <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
              {liturgical.summary}
            </span>
          )}
        </div>
      </header>

      {/* Category tabs */}
      <nav
        aria-label="Reading categories"
        className="mt-6 flex flex-wrap gap-2 border-b border-stone-800 pb-3"
      >
        {READING_CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                active
                  ? "bg-amber-500 text-black"
                  : "border border-stone-700 text-stone-300 hover:border-amber-500/50 hover:text-amber-200"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </nav>

      {/* Reading cards */}
      <div
        role="list"
        className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3"
      >
        {categoryReadings.map((reading) => {
          const isSelected = reading.id === selected.id;
          const isMarked = bookmarks.includes(reading.id);
          return (
            <button
              key={reading.id}
              type="button"
              onClick={() => setSelected(reading)}
              aria-pressed={isSelected}
              className={`relative rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? "border-amber-400 bg-amber-500/10"
                  : "border-stone-800 bg-black/20 hover:border-amber-500/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-amber-100">
                  {reading.label}
                </div>
                {isMarked && (
                  <span
                    aria-label="Bookmarked"
                    className="text-xs text-amber-400"
                  >
                    ★
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs leading-5 text-stone-400">
                {reading.description}
              </div>
              {reading.ethiopianNote && (
                <div className="mt-2 border-l-2 border-violet-500/40 pl-2 text-[11px] leading-4 text-violet-300">
                  {reading.ethiopianNote}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty state — theoretically unreachable, but safe */}
      {categoryReadings.length === 0 && (
        <p className="mt-5 text-center text-sm text-stone-500">
          No readings in this category yet. More are being added.
        </p>
      )}

      {/* Selected reading detail */}
      <div className="mt-6 rounded-2xl border border-stone-800 bg-black/30 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-500">
              Now selected
            </p>
            <h3 className="mt-1 text-lg font-bold text-amber-100">
              {selected.label}{" "}
              <span className="ml-2 text-sm font-normal text-stone-400">
                {selected.labelAm}
              </span>
            </h3>
            <p className="mt-1 text-sm text-stone-400">
              {selected.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleBookmark}
              aria-pressed={isBookmarked}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                isBookmarked
                  ? "border-amber-400 bg-amber-500/10 text-amber-200"
                  : "border-stone-700 text-stone-300 hover:border-amber-500/50 hover:text-amber-200"
              }`}
            >
              {isBookmarked ? "★ Bookmarked" : "☆ Bookmark"}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-lg border border-stone-700 px-3 py-2 text-xs font-semibold text-stone-300 transition hover:border-amber-500/50 hover:text-amber-200"
            >
              {justCopied ? "Copied ✓" : "Share / Copy link"}
            </button>
          </div>
        </div>
      </div>

      {/* Short attributed quotation */}
      <blockquote className="mt-5 rounded-2xl border-l-4 border-amber-400 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-stone-200">
        “በመጀመሪያው ቃል ነበረ፥ ቃልም በእግዚአብሔር ዘንድ ነበረ።”
        <footer className="mt-2 text-xs text-stone-400">
          Short quotation · John 1:1 · Source: International Biblical
          Association / WordProject
        </footer>
      </blockquote>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
        >
          Open {selected.label} in WordProject ↗
        </a>
        <a
          href={WORDPROJECT_INDEX_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-stone-700 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:border-amber-400 hover:text-amber-200"
        >
          Browse Amharic Bible index ↗
        </a>
      </div>

      {/* Attribution */}
      <p className="mt-4 text-[11px] leading-5 text-stone-500">
        Source and copyright notice: WordProject / International Biblical
        Association. This link opens the original external passage; Ethiopian
        Wisdom Atlas provides only navigation and a brief attributed excerpt.
      </p>
    </section>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading Christian reading path"
      className="mt-8 animate-pulse rounded-3xl border border-amber-500/20 bg-stone-950/70 p-6"
    >
      <div className="h-3 w-48 rounded bg-stone-800" />
      <div className="mt-3 h-6 w-72 rounded bg-stone-800" />
      <div className="mt-3 h-4 w-full max-w-xl rounded bg-stone-800/60" />
      <div className="mt-6 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-7 w-20 rounded-full bg-stone-800" />
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-stone-800/40" />
        ))}
      </div>
    </section>
  );
}

function traditionLabelFor(tradition: string): string | null {
  switch (tradition) {
    case "orthodox":
      return "Ethiopian Orthodox Tewahedo";
    case "protestant":
      return "Protestant / P'ent'ay";
    case "catholic":
      return "Catholic";
    case "unspecified":
      return null;
    default:
      return null;
  }
}