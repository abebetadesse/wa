"use client";

import { AWUDE_CIRCLES } from "@/lib/cultural/awudeNegestEngine";

interface CircleNavigatorProps {
  selectedCircleId: number;
  onSelect: (circleId: number) => void;
}

export default function CircleNavigator({ selectedCircleId, onSelect }: CircleNavigatorProps) {
  return (
    <aside className="rounded-[26px] border border-border bg-card/80 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">Navigator</p>
          <h3 className="mt-1 text-lg font-bold text-foreground">16 circles</h3>
        </div>
        <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gold-strong">
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
                  ? "border-gold/60 bg-gold/10"
                  : "border-border bg-background/40 hover:border-border hover:bg-card"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl border border-gold/25 bg-background text-lg">
                  {circle.symbol}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Circle {circle.id}
                    </span>
                    <span className="text-[10px] text-gold">{circle.elementalAffinity}</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-foreground">{circle.name}</p>
                  <p className="text-xs text-muted-foreground">{circle.geezTitle}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
