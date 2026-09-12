"use client";

import { useEffect, useMemo, useState } from "react";

type ProfilePayload = {
  data?: Record<string, unknown>;
};

const CHRISTIAN_TERMS = [
  "christian",
  "christianity",
  "orthodox",
  "ethiopian orthodox",
  "catholic",
  "protestant",
  "evangelical",
  "ይሁዳዊ",
  "ክርስቲያን",
];

const READING_OPTIONS = [
  { label: "John 1", book: "43", chapter: "1", description: "The Word, light, and life." },
  { label: "Matthew 1", book: "40", chapter: "1", description: "The genealogy and birth of Jesus." },
  { label: "Psalm 23", book: "19", chapter: "23", description: "A familiar prayer of guidance and comfort." },
];

function isChristianReligion(value: unknown) {
  const normalized = String(value || "").trim().toLowerCase();
  return CHRISTIAN_TERMS.some((term) => normalized.includes(term));
}

export default function ChristianBibleReading() {
  const [religion, setReligion] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedReading, setSelectedReading] = useState(READING_OPTIONS[0]);

  useEffect(() => {
    let active = true;
    fetch("/api/profile", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<ProfilePayload>;
      })
      .then((payload) => {
        if (!active || !payload?.data) return;
        const values = payload.data;
        const religionValue =
          values.religion ||
          values.Religion ||
          values["Religious affiliation"] ||
          values["Faith tradition"] ||
          values["faith"] ||
          "";
        setReligion(String(religionValue));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => isChristianReligion(religion), [religion]);
  if (loading || !visible) return null;

  const sourceUrl = `https://www.wordproject.org/bibles/am/${selectedReading.book}/${selectedReading.chapter}.htm`;

  return (
    <section className="mt-8 rounded-3xl border border-amber-500/30 bg-stone-950/70 p-6 shadow-xl shadow-amber-950/10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
            Christian reading path · Amharic Bible
          </div>
          <h2 className="mt-2 text-2xl font-bold text-white">Read a chapter in Amharic</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300">
            Because your profile identifies a Christian tradition, you can open an Amharic chapter
            directly from WordProject. NiniMed does not copy or host the full text.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          Profile matched: {religion}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {READING_OPTIONS.map((reading) => (
          <button
            key={reading.label}
            type="button"
            onClick={() => setSelectedReading(reading)}
            className={`rounded-2xl border p-4 text-left transition ${
              selectedReading.label === reading.label
                ? "border-amber-400 bg-amber-500/10"
                : "border-stone-800 bg-black/20 hover:border-amber-500/50"
            }`}
          >
            <div className="font-semibold text-amber-100">{reading.label}</div>
            <div className="mt-1 text-xs leading-5 text-stone-400">{reading.description}</div>
          </button>
        ))}
      </div>

      <blockquote className="mt-5 rounded-2xl border-l-4 border-amber-400 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-stone-200">
        “በመጀመሪያው ቃል ነበረ፥ ቃልም በእግዚአብሔር ዘንድ ነበረ።”
        <footer className="mt-2 text-xs text-stone-400">
          Short quotation · John 1:1 · Source: International Biblical Association / WordProject
        </footer>
      </blockquote>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
        >
          Open {selectedReading.label} in WordProject ↗
        </a>
        <a
          href="https://www.wordproject.org/bibles/am/index.htm"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-stone-700 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:border-amber-400 hover:text-amber-200"
        >
          Browse Amharic Bible index ↗
        </a>
      </div>
      <p className="mt-4 text-[11px] leading-5 text-stone-500">
        Source and copyright notice: WordProject / International Biblical Association. This link opens
        the original external passage; NiniMed provides only navigation and a brief attributed excerpt.
      </p>
    </section>
  );
}
