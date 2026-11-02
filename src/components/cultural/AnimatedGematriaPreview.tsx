"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LiveGematriaState } from "@/hooks/useLiveGematria";
import { getTelsemForArchetype } from "@/lib/cultural/telsemData";

function AnimatedCounter({ value, className = "" }: { value: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevRef = React.useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    prevRef.current = value;
    if (start === end) return;

    const duration = 400;
    const startTime = performance.now();
    let rafId: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(start + (end - start) * progress);
      setDisplayValue(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(update);
      }
    };

    rafId = requestAnimationFrame(update);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value]);

  return <span className={className}>{displayValue}</span>;
}

export function AnimatedGematriaPreview({ state }: { state: LiveGematriaState }) {
  if (!state.nameGeez.trim()) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-gold/20 bg-gold-soft/70 text-center">
        <span className="text-3xl block mb-2">🔮</span>
        <p className="text-gold-strong text-sm font-medium">
          Type your name in Ge&apos;ez script above to awaken live numerical vibration and Awde Negest alignment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 transition-all duration-300">
      {/* Letter breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gold font-mono">
          <span>RECOGNIZED FIDEL LETTERS ({state.letters.length})</span>
          {state.isCalculating && <span className="animate-pulse text-gold">Harmonizing...</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          {state.letters.map((l, idx) => (
            <div
              key={`${l.letter}-${idx}`}
              className="px-3 py-2 rounded-xl bg-gradient-to-b from-card to-background border border-gold/40 shadow-sm flex flex-col items-center min-w-[50px] transition-transform hover:scale-105"
            >
              <span className="text-xl font-bold text-gold-strong">{l.letter}</span>
              <span className="text-[11px] text-gold font-mono font-semibold">{l.value}</span>
              <span className="text-[9px] text-muted-foreground font-sans">{l.transliteration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mother's letters if provided */}
      {state.motherLetters.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-gold/10">
          <div className="text-xs text-gold font-mono">
            <span>MOTHER&apos;S LINEAGE LETTERS ({state.motherLetters.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.motherLetters.map((l, idx) => (
              <div
                key={`mother-${l.letter}-${idx}`}
                className="px-3 py-2 rounded-xl bg-gradient-to-b from-card/90 to-background border border-gold/30 flex flex-col items-center min-w-[48px]"
              >
                <span className="text-lg font-bold text-soft">{l.letter}</span>
                <span className="text-[10px] text-gold font-mono">{l.value}</span>
                <span className="text-[9px] text-muted-foreground font-sans">{l.transliteration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Arithmetic calculation card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-gold-soft via-card to-card border border-gold/30 shadow-panel space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-soft font-medium">Fidel Gematria Sum (የፊደል ድምር)</span>
          <AnimatedCounter value={state.totalSum} className="text-2xl font-bold font-mono text-gold" />
        </div>

        <div className="flex justify-between items-center text-sm border-t border-border pt-2">
          <span className="text-muted-foreground text-xs">÷ 12 Cycle Quotient</span>
          <AnimatedCounter value={state.dividedBy12} className="text-base font-semibold font-mono text-soft" />
        </div>

        <div className="flex justify-between items-center text-sm border-t border-gold/20 pt-2">
          <span className="text-gold font-medium text-xs tracking-wider uppercase">
            Final Spiritual Vibration (ቁጥር)
          </span>
          <AnimatedCounter value={state.finalNumber} className="text-3xl font-bold font-mono text-brand" />
        </div>
      </div>

      {/* Reveal cards */}
      {state.zodiac && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Zodiac card */}
          <div className="p-4 rounded-xl bg-card/80 border border-gold/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Zodiac Sign</span>
              <span className="text-2xl">{state.zodiac.symbol}</span>
            </div>
            <div>
              <div className="text-lg font-bold text-gold-strong">{state.zodiac.name}</div>
              <div className="text-xs text-gold">{state.zodiac.nameAmharic} · {state.zodiac.element} Element</div>
            </div>
          </div>

          {/* Awde Circle card */}
          <div className="p-4 rounded-xl bg-card/80 border border-gold/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Awde Negest Circle</span>
              <span className="text-xl">⛰️</span>
            </div>
            <div>
              <div className="text-lg font-bold text-gold-strong">
                Circle {state.awdeCircle?.number}: {state.awdeCircle?.name}
              </div>
              <div className="text-xs text-gold">
                {state.awdeCircle?.nameAmharic} · {state.awdeCircle?.lakeName}
              </div>
            </div>
          </div>

          {/* Talismanic & Telsem card */}
          {(() => {
            const activeTelsem = state.talismanic
              ? getTelsemForArchetype(state.talismanic.number)
              : null;
            return (
              <div className="p-4 rounded-xl bg-card/80 border border-gold/30 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Talismanic Lineage</span>
                  <Link
                    href="/library/telsem"
                    target="_blank"
                    className="text-[10px] text-gold underline hover:text-gold"
                  >
                    ጠልሰም (Archive) ↗
                  </Link>
                </div>
                <div>
                  <div className="text-lg font-bold text-gold-strong">{state.talismanic?.name}</div>
                  <div className="text-xs text-gold">
                    {state.talismanic?.rulingPlanet} · {state.talismanic?.dayOfWeek}
                  </div>
                  {activeTelsem && (
                    <div className="mt-2 pt-2 border-t border-border text-[11px] text-soft flex items-center justify-between">
                      <span className="text-gold font-serif">{activeTelsem.nameAm}</span>
                      <span className="text-[10px] text-subtle font-mono">Seal #{state.talismanic?.number}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
