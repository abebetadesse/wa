"use client";

import { useEffect, useState } from "react";
import { BookOpenText, ChevronLeft, ChevronRight, FileText, Layers3 } from "lucide-react";
import { AWUDE_CIRCLES } from "@/lib/cultural/awudeNegestEngine";

interface ManuscriptReaderProps {
  selectedCircleId: number;
  onPageChange?: (page: number) => void;
}

const EMBED_URL = "https://archive.org/embed/awede-negest?view=theater";

export default function ManuscriptReader({ selectedCircleId, onPageChange }: ManuscriptReaderProps) {
  const [view, setView] = useState<"original" | "structured">("original");
  const [page, setPage] = useState(1 + (selectedCircleId - 1) * 4);

  useEffect(() => {
    const nextPage = 1 + (selectedCircleId - 1) * 4;
    setPage(nextPage);
    onPageChange?.(nextPage);
  }, [selectedCircleId, onPageChange]);

  const clampPage = (value: number) => Math.min(Math.max(value, 1), 48);

  const changePage = (next: number) => {
    const safe = clampPage(next);
    setPage(safe);
    onPageChange?.(safe);
  };

  const selectedCircle = AWUDE_CIRCLES.find((circle) => circle.id === selectedCircleId) ?? AWUDE_CIRCLES[0];

  return (
    <div className="rounded-[26px] border border-stone-800 bg-stone-900/80 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <div className="mb-4 flex flex-col gap-3 border-b border-stone-800 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">Reader</p>
          <h3 className="mt-1 text-xl font-bold text-white">{selectedCircle.geezTitle}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setView("original")}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
              view === "original"
                ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
                : "border-stone-700 bg-stone-950/40 text-stone-300"
            }`}
          >
            <BookOpenText size={14} />
            Original manuscript
          </button>

          <button
            type="button"
            onClick={() => setView("structured")}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
              view === "structured"
                ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
                : "border-stone-700 bg-stone-950/40 text-stone-300"
            }`}
          >
            <Layers3 size={14} />
            Structured content
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-800 bg-stone-950/60 p-3">
        <div className="flex items-center gap-2 text-sm text-stone-300">
          <FileText size={16} className="text-amber-300" />
          <span>Page {page}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changePage(page - 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-200"
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <button
            type="button"
            onClick={() => changePage(page + 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-200"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-stone-800 bg-stone-950 shadow-inner shadow-black/30">
        {view === "original" ? (
          <iframe
            key={`frame-${selectedCircleId}-${page}`}
            title="Awde Negest manuscript viewer"
            src={`${EMBED_URL}&page=${page}`}
            className="h-[720px] w-full bg-stone-950"
            loading="lazy"
          />
        ) : (
          <div className="space-y-4 p-6 text-stone-200">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">Circle summary</p>
              <h4 className="mt-2 text-2xl font-bold text-white">{selectedCircle.name}</h4>
              <p className="mt-2 text-sm text-stone-300">{selectedCircle.generalProphecy}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Guardian Angel</p>
                <p className="mt-2 text-lg font-semibold text-white">{selectedCircle.guardianAngel}</p>
              </div>
              <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Element</p>
                <p className="mt-2 text-lg font-semibold text-white">{selectedCircle.elementalAffinity}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Temperament</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-200">{selectedCircle.temperament}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
