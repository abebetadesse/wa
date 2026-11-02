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
import { assetUrl } from "@/lib/base-path";

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
    return <section aria-busy="true" className="mt-8 animate-pulse rounded-3xl border border-gold/20 bg-background/70 p-6"><div className="h-6 w-72 rounded bg-muted" /><div className="mt-4 h-4 max-w-xl rounded bg-muted/60" /><div className="mt-6 h-24 rounded-2xl bg-muted/40" /></section>;
  }
  if (error || !isChristian) return null;

  return (
    <section aria-labelledby="christian-reading-heading" className="mt-8 rounded-3xl border border-gold/30 bg-background/70 p-6 shadow-panel">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">Christian reading path · Amharic Bible</p>
          <h2 id="christian-reading-heading" className="mt-2 text-2xl font-bold text-foreground">Read a chapter in Amharic</h2>
          <p className="mt-2 text-sm leading-6 text-soft">Open a selected chapter from WordProject. This platform provides navigation and short attributed context; it does not copy or host the full text.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {traditionLabel(tradition) && <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-strong">{traditionLabel(tradition)}</span>}
          {liturgical.summary !== "Ordinary day" && <span className="rounded-full border border-plum/40 bg-plum/10 px-3 py-1 text-xs font-semibold text-plum-strong">{liturgical.summary}</span>}
        </div>
      </header>

      <nav aria-label="Reading categories" className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {READING_CATEGORIES.map((item) => (
          <button key={item.id} type="button" aria-current={category === item.id ? "page" : undefined} onClick={() => setCategory(item.id)} className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${category === item.id ? "bg-gold-fill text-gold-foreground" : "border border-border text-soft hover:border-gold/50"}`}>
            {item.label}
          </button>
        ))}
      </nav>

      <div role="list" className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {readings.map((reading) => (
          <button key={reading.id} type="button" aria-pressed={selected.id === reading.id} onClick={() => setSelected(reading)} className={`rounded-2xl border p-4 text-left ${selected.id === reading.id ? "border-gold bg-gold/10" : "border-border bg-sunken/50 hover:border-gold/50"}`}>
            <div className="flex justify-between gap-2 font-semibold text-gold-strong">{reading.label}{bookmarks.includes(reading.id) && <span aria-label="Bookmarked">★</span>}</div>
            <div className="mt-1 text-xs leading-5 text-muted-foreground">{reading.description}</div>
            {reading.ethiopianNote && <div className="mt-2 border-l-2 border-plum/50 pl-2 text-[11px] text-plum">{reading.ethiopianNote}</div>}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-sunken/50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-subtle">Now selected</p><h3 className="mt-1 text-lg font-bold text-gold-strong">{selected.label} <span className="ml-2 text-sm font-normal text-muted-foreground">{selected.labelAm}</span></h3><p className="mt-1 text-sm text-muted-foreground">{selected.description}</p></div>
          <div className="flex gap-2">
            <button type="button" onClick={toggleBookmark} aria-pressed={bookmarked} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-soft hover:border-gold/50">{bookmarked ? "★ Bookmarked" : "☆ Bookmark"}</button>
            <button type="button" onClick={share} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-soft hover:border-gold/50">{copied ? "Copied ✓" : "Share / Copy link"}</button>
          </div>
        </div>
      </div>

      <blockquote className="mt-5 rounded-2xl border-l-4 border-gold bg-gold/5 px-4 py-3 text-sm leading-6 text-soft">“በመጀመሪያው ቃል ነበረ፥ ቃልም በእግዚአብሔር ዘንድ ነበረ።”<footer className="mt-2 text-xs text-muted-foreground">Short quotation · John 1:1 · Source: International Biblical Association / WordProject</footer></blockquote>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={assetUrl(wordProjectChapterUrl(selected.book, selected.chapter))} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-gold-fill px-5 py-3 text-sm font-bold text-gold-foreground hover:bg-gold-fill">Open {selected.label} in WordProject ↗</a>
        <a href={assetUrl(WORDPROJECT_INDEX_URL)} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-soft hover:border-gold">Browse Amharic Bible index ↗</a>
      </div>
      <p className="mt-4 text-[11px] leading-5 text-subtle">Source and copyright notice: WordProject / International Biblical Association. Ethiopian Wisdom Atlas stores only navigation state locally and does not reproduce the external text.</p>
    </section>
  );
}
