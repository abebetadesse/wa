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

const LAST_KEY = "ewa.christian.lastReading.v1";
const BOOKMARKS_KEY = "ewa.christian.bookmarks.v1";

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function traditionLabel(tradition: string) {
  return tradition === "orthodox"
    ? "Ethiopian Orthodox Tewahedo"
    : tradition === "protestant"
      ? "Protestant / P'ent'ay"
      : tradition === "catholic" ? "Catholic" : null;
}

export default function ChristianBibleReading() {
  const { loading, error, isChristian, tradition } = useProfileReligion();
  const [category, setCategory] = useState<ReadingCategory>("daily");
  const [selected, setSelected] = useState<ReadingOption>(READING_LIBRARY[0]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const liturgical = useMemo(() => getLiturgicalContext(), []);

  useEffect(() => {
    setBookmarks(readStorage(BOOKMARKS_KEY, []));
    const last = readStorage<string | null>(LAST_KEY, null);
    const found = last ? READING_LIBRARY.find((reading) => reading.id === last) : undefined;
    if (found) {
      setSelected(found);
      setCategory(found.category);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(LAST_KEY, JSON.stringify(selected.id));
  }, [selected.id]);

  const readings = readingsByCategory(category);
  const bookmarked = bookmarks.includes(selected.id);
  const toggleBookmark = useCallback(() => {
    setBookmarks((current) => {
      const next = current.includes(selected.id)
        ? current.filter((id) => id !== selected.id)
        : [...current, selected.id];
      if (typeof window !== "undefined") window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
      return next;
    });
  }, [selected.id]);

  const share = useCallback(async () => {
    const url = wordProjectChapterUrl(selected.book, selected.chapter);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: `${selected.label} — Amharic Bible`, text: selected.description, url });
      } else {
        await window.navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancellation is not an application error.
    }
  }, [selected]);

  if (loading) {
    return <section aria-busy="true" className="mt-8 animate-pulse rounded-3xl border border-amber-500/20 bg-stone-950/70 p-6"><div className="h-6 w-72 rounded bg-stone-800" /><div className="mt-4 h-4 max-w-xl rounded bg-stone-800/60" /><div className="mt-6 h-24 rounded-2xl bg-stone-800/40" /></section>;
  }
  if (error || !isChristian) return null;

  return (
    <section aria-labelledby="christian-reading-heading" className="mt-8 rounded-3xl border border-amber-500/30 bg-stone-950/70 p-6 shadow-xl shadow-amber-950/10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">Christian reading path · Amharic Bible</p>
          <h2 id="christian-reading-heading" className="mt-2 text-2xl font-bold text-white">Read a chapter in Amharic</h2>
          <p className="mt-2 text-sm leading-6 text-stone-300">Open a selected chapter from WordProject. This platform provides navigation and short attributed context; it does not copy or host the full text.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {traditionLabel(tradition) && <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">{traditionLabel(tradition)}</span>}
          {liturgical.summary !== "Ordinary day" && <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">{liturgical.summary}</span>}
        </div>
      </header>

      <nav aria-label="Reading categories" className="mt-6 flex flex-wrap gap-2 border-b border-stone-800 pb-3">
        {READING_CATEGORIES.map((item) => (
          <button key={item.id} type="button" aria-current={category === item.id ? "page" : undefined} onClick={() => setCategory(item.id)} className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${category === item.id ? "bg-amber-500 text-black" : "border border-stone-700 text-stone-300 hover:border-amber-500/50"}`}>
            {item.label}
          </button>
        ))}
      </nav>

      <div role="list" className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {readings.map((reading) => (
          <button key={reading.id} type="button" aria-pressed={selected.id === reading.id} onClick={() => setSelected(reading)} className={`rounded-2xl border p-4 text-left ${selected.id === reading.id ? "border-amber-400 bg-amber-500/10" : "border-stone-800 bg-black/20 hover:border-amber-500/50"}`}>
            <div className="flex justify-between gap-2 font-semibold text-amber-100">{reading.label}{bookmarks.includes(reading.id) && <span aria-label="Bookmarked">★</span>}</div>
            <div className="mt-1 text-xs leading-5 text-stone-400">{reading.description}</div>
            {reading.ethiopianNote && <div className="mt-2 border-l-2 border-violet-500/50 pl-2 text-[11px] text-violet-300">{reading.ethiopianNote}</div>}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-stone-800 bg-black/30 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-500">Now selected</p><h3 className="mt-1 text-lg font-bold text-amber-100">{selected.label} <span className="ml-2 text-sm font-normal text-stone-400">{selected.labelAm}</span></h3><p className="mt-1 text-sm text-stone-400">{selected.description}</p></div>
          <div className="flex gap-2">
            <button type="button" onClick={toggleBookmark} aria-pressed={bookmarked} className="rounded-lg border border-stone-700 px-3 py-2 text-xs font-semibold text-stone-300 hover:border-amber-500/50">{bookmarked ? "★ Bookmarked" : "☆ Bookmark"}</button>
            <button type="button" onClick={share} className="rounded-lg border border-stone-700 px-3 py-2 text-xs font-semibold text-stone-300 hover:border-amber-500/50">{copied ? "Copied ✓" : "Share / Copy link"}</button>
          </div>
        </div>
      </div>

      <blockquote className="mt-5 rounded-2xl border-l-4 border-amber-400 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-stone-200">“በመጀመሪያው ቃል ነበረ፥ ቃልም በእግዚአብሔር ዘንድ ነበረ።”<footer className="mt-2 text-xs text-stone-400">Short quotation · John 1:1 · Source: International Biblical Association / WordProject</footer></blockquote>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={wordProjectChapterUrl(selected.book, selected.chapter)} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black hover:bg-amber-400">Open {selected.label} in WordProject ↗</a>
        <a href={WORDPROJECT_INDEX_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-stone-700 px-5 py-3 text-sm font-semibold text-stone-200 hover:border-amber-400">Browse Amharic Bible index ↗</a>
      </div>
      <p className="mt-4 text-[11px] leading-5 text-stone-500">Source and copyright notice: WordProject / International Biblical Association. Ethiopian Wisdom Atlas stores only navigation state locally and does not reproduce the external text.</p>
    </section>
  );
}
