"use client";

import { AWUDE_CIRCLES } from "@/lib/cultural/awudeNegestEngine";

interface CircleNavigatorProps {
  selectedCircleId: number;
  onSelect: (circleId: number) => void;
}

export default function CircleNavigator({ selectedCircleId, onSelect }: CircleNavigatorProps) {
  return (
    <aside className="rounded-[26px] border border-stone-800 bg-stone-900/80 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-stone-800 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">Navigator</p>
          <h3 className="mt-1 text-lg font-bold text-white">16 circles</h3>
        </div>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-300">
          {AWUDE_CIRCLES.length}
        </span>
      </div>

      <div className="space-y-2">
        {AWUDE_CIRCLES.map((circle) => {
          const isSelected = circle.id === selectedCircleId;

          return (
            <button
              key={circle.id}
              type="button"
              onClick={() => onSelect(circle.id)}
              className={`w-full rounded-2xl border p-3 text-left transition ${
                isSelected
                  ? "border-amber-400/60 bg-amber-500/10 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]"
                  : "border-stone-800 bg-stone-950/40 hover:border-stone-700 hover:bg-stone-900"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/25 bg-stone-950 text-lg">
                  {circle.symbol}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-400">
                      Circle {circle.id}
                    </span>
                    <span className="text-[10px] text-amber-300">{circle.elementalAffinity}</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-white">{circle.name}</p>
                  <p className="text-xs text-stone-400">{circle.geezTitle}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
