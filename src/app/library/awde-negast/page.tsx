"use client";

import { useState } from "react";
import ManuscriptReader from "@/components/library/ManuscriptReader";
import CircleNavigator from "@/components/library/CircleNavigator";
import CircleDetailPanel from "@/components/library/CircleDetailPanel";
import { AWUDE_CIRCLES } from "@/lib/cultural/awudeNegestEngine";

export default function AwdeNegastLibraryPage() {
  const [selectedCircleId, setSelectedCircleId] = useState<number>(1);
  const [page, setPage] = useState<number>(1);

  const selectedCircle = AWUDE_CIRCLES.find((circle) => circle.id === selectedCircleId) ?? AWUDE_CIRCLES[0];

  return (
    <main className="space-y-6 pb-16">
      <header className="rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950/20 p-6 md:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">
          Original text • Digital archive
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">Awde Negest manuscript library</h1>
        <p className="mt-3 max-w-3xl text-sm text-stone-300 md:text-base">
          Reconstruct the ancient manuscript experience using the Archive.org reader, while keeping the structured
          circle system and divination intake flow available in the app itself.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-stone-300">
          <span className="rounded-full border border-stone-700 px-2 py-1">Page {page}</span>
          <span className="rounded-full border border-stone-700 px-2 py-1">{selectedCircle.geezTitle}</span>
          <span className="rounded-full border border-stone-700 px-2 py-1">Archive.org embed</span>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <CircleNavigator selectedCircleId={selectedCircleId} onSelect={setSelectedCircleId} />
        <ManuscriptReader selectedCircleId={selectedCircleId} onPageChange={setPage} />
        <CircleDetailPanel circle={selectedCircle} />
      </div>
    </main>
  );
}
