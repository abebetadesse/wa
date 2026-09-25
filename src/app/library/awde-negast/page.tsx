"use client";

import { useState } from "react";
import Link from "next/link";
import ManuscriptReader from "@/components/library/ManuscriptReader";
import CircleNavigator from "@/components/library/CircleNavigator";
import CircleDetailPanel from "@/components/library/CircleDetailPanel";
import { AWUDE_CIRCLES } from "@/lib/cultural/awudeNegestEngine";
import { HatataMenafsestViewer } from "@/components/cultural/HatataMenafsestViewer";

export default function AwdeNegastLibraryPage() {
  const [selectedCircleId, setSelectedCircleId] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [activeView, setActiveView] = useState<"reader" | "commentary">("reader");

  const selectedCircle = AWUDE_CIRCLES.find((circle) => circle.id === selectedCircleId) ?? AWUDE_CIRCLES[0];

  return (
    <main className="space-y-6 pb-16">
      <header className="rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950/20 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">
            Original text • Digital archive
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/library/hatata"
              className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              ሃተታ መናፍስት (Full Reader) ↗
            </Link>
            <Link
              href="/library/telsem"
              className="text-xs font-mono px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:border-amber-500/40 hover:text-amber-200 transition-colors"
            >
              ጠልሰም (22 Seals) ↗
            </Link>
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">Awde Negest manuscript library</h1>
        <p className="mt-3 max-w-3xl text-sm text-stone-300 md:text-base">
          Reconstruct the ancient manuscript experience using the Archive.org reader, while keeping the structured
          circle system, trilingual spirit commentary (ሃተታ መናፍስት), and divination intake flow available in the app.
        </p>

        {/* View Switcher Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-stone-800 pt-4">
          <button
            type="button"
            onClick={() => setActiveView("reader")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
              activeView === "reader"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200"
            }`}
          >
            📜 Archive.org Manuscript Reader
          </button>
          <button
            type="button"
            onClick={() => setActiveView("commentary")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
              activeView === "commentary"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200"
            }`}
          >
            ✦ ሃተታ መናፍስት ወ አውደ ነገስት ከነትርጉሙ (Commentary & Chapters)
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-stone-300">
          <span className="rounded-full border border-stone-700 px-2 py-1">Page {page}</span>
          <span className="rounded-full border border-stone-700 px-2 py-1">{selectedCircle.geezTitle}</span>
          <span className="rounded-full border border-stone-700 px-2 py-1">Archive.org embed</span>
        </div>
      </header>

      {/* View Mode: Archive.org Manuscript Reader */}
      {activeView === "reader" ? (
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <CircleNavigator selectedCircleId={selectedCircleId} onSelect={setSelectedCircleId} />
          <ManuscriptReader selectedCircleId={selectedCircleId} onPageChange={setPage} />
          <CircleDetailPanel circle={selectedCircle} />
        </div>
      ) : (
        <section className="space-y-4">
          <HatataMenafsestViewer />
        </section>
      )}
    </main>
  );
}
