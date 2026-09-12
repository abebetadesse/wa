"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { AWUDE_NEGEST_60_CATEGORIES } from "@/lib/cultural/awudeNegestEngine";
import type { AwudeNegestCircle } from "@/lib/profiling/extendedTypes";

interface CircleDetailPanelProps {
  circle: AwudeNegestCircle;
}

export default function CircleDetailPanel({ circle }: CircleDetailPanelProps) {
  const relevantCategories = AWUDE_NEGEST_60_CATEGORIES.slice(0, 12);

  return (
    <aside className="rounded-[26px] border border-amber-500/20 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.32)]">
      <div className="flex items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">Selected circle</p>
          <h3 className="mt-1 text-xl font-bold text-white">{circle.name}</h3>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-2xl text-amber-300">
          {circle.symbol}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Ge&apos;ez</div>
            <div className="mt-2 font-semibold text-amber-200">{circle.geezTitle}</div>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Guardian</div>
            <div className="mt-2 font-semibold text-amber-200">{circle.guardianAngel}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
            <Sparkles size={12} className="text-amber-300" />
            Elemental affinity
          </div>
          <p className="text-base font-semibold text-white">{circle.elementalAffinity}</p>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">General prophecy</div>
          <p className="text-sm leading-relaxed text-stone-200">{circle.generalProphecy}</p>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Relevant categories</div>
          <div className="flex flex-wrap gap-2">
            {relevantCategories.map((category) => (
              <span
                key={category.id}
                className="rounded-full border border-amber-500/25 bg-amber-500/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-amber-100"
              >
                {category.en}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Link
        href="/case/spiritual/intake"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:brightness-110"
      >
        Begin Divination Reading
        <ArrowRight size={16} />
      </Link>
    </aside>
  );
}
