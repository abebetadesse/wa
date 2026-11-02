"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, Hash, ArrowRight } from "lucide-react";
import { calculateGeezGematria } from "@/lib/cultural/geezFidelGematria";

const PRESET_NAMES = [
  { label: "ዳዊት (Dawit)", geez: "ዳዊት", latin: "Dawit" },
  { label: "ሰላማዊት (Selamawit)", geez: "ሰላማዊት", latin: "Selamawit" },
  { label: "አበበ (Abebe)", geez: "አበበ", latin: "Abebe" },
  { label: "ፀሐይ (Tsehay)", geez: "ፀሐይ", latin: "Tsehay" },
  { label: "ተስፋዬ (Tesfaye)", geez: "ተስፋዬ", latin: "Tesfaye" },
  { label: "ዮሐንስ (Yohannes)", geez: "ዮሐንስ", latin: "Yohannes" },
];

export default function LiveGematriaWidget() {
  const [inputName, setInputName] = useState("ዳዊት");

  // Calculate Ge'ez gematria
  const result = useMemo(() => {
    return calculateGeezGematria(inputName);
  }, [inputName]);

  const hasFidel = result.recognizedFidelLetters.length > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-gold-soft via-card to-background p-6 md:p-8  shadow-raised">
      {/* Background radial accent */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-info/10 blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-mono font-medium text-gold-strong">
            <Sparkles size={12} className="text-gold" />
            የፊደል ሂሳብ • LIVE GE'EZ GEMATRIA
          </div>
          <h3 className="mt-2 text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Sacred Name Vibration Calculator
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            Ancient Abushakir letter weights reveal your spiritual digital root and virtue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">PRESETS:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_NAMES.map((item) => (
              <button
                key={item.geez}
                type="button"
                onClick={() => setInputName(item.geez)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  inputName === item.geez
                    ? "bg-gold-fill text-gold-foreground font-semibold shadow-md"
                    : "bg-foreground/5 text-soft hover:bg-foreground/10 hover:text-gold-foreground border border-border"
                }`}
              >
                {item.geez}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input box */}
      <div className="mb-6">
        <label htmlFor="gematria-name-input" className="block text-xs font-mono text-muted-foreground mb-2">
          TYPE ANY ETHIOPIAN OR GE'EZ NAME:
        </label>
        <div className="relative">
          <input
            id="gematria-name-input"
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="Type in Ge'ez (e.g. ዳዊት, ሰላም, ፀሐይ)..."
            className="w-full rounded-xl border border-gold/40 bg-background/80 px-4 py-3.5 pl-11 text-lg font-semibold text-gold-strong placeholder:text-subtle outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
          <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" />
          {inputName && (
            <button
              type="button"
              onClick={() => setInputName("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-subtle hover:text-soft"
              title="Clear input"
            >
              ✕
            </button>
          )}
        </div>
        {!hasFidel && inputName.trim().length > 0 && (
          <p className="mt-2 text-xs text-gold font-mono">
            ℹ For full Abushakir calculation, use Ge'ez Fidel letters (choose from presets above or use Amharic keyboard).
          </p>
        )}
      </div>

      {/* Calculation output breakdown */}
      {hasFidel ? (
        <div className="space-y-4">
          {/* Letters row */}
          <div>
            <span className="text-[11px] uppercase text-muted-foreground">LETTER VALUES DECOMPOSITION</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.recognizedFidelLetters.map((item, idx) => (
                <div
                  key={`${item.letter}-${idx}`}
                  className="flex flex-col items-center justify-center rounded-xl border border-gold/20 bg-card/80 px-3.5 py-2.5 shadow-inner"
                >
                  <span className="text-xl font-bold text-gold">{item.letter}</span>
                  <span className="text-xs font-mono font-medium text-muted-foreground mt-1">={item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-border bg-foreground/5 p-4">
              <span className="text-[11px] uppercase text-muted-foreground">TOTAL SUM</span>
              <div className="mt-1 text-2xl font-bold text-foreground font-mono">{result.totalNumericalSum}</div>
              <span className="text-[11px] text-subtle font-mono">Combined Ge'ez weight</span>
            </div>

            <div className="rounded-xl border border-gold/40 bg-gold/10 p-4">
              <span className="text-[11px] uppercase text-gold">DIGITAL ROOT</span>
              <div className="mt-1 text-3xl font-extrabold text-gold font-mono">
                {result.reducedDigitValue}
              </div>
              <span className="text-[11px] text-gold font-mono">Reduced root (1–9)</span>
            </div>

            <div className="rounded-xl border border-info/30 bg-info/10 p-4">
              <span className="text-[11px] uppercase text-info">ARCHETYPAL VIRTUE</span>
              <div className="mt-1 text-sm font-semibold text-info-strong line-clamp-2">
                {result.philosophicalVirtue}
              </div>
              <span className="text-[11px] text-info font-mono">Spiritual resonance</span>
            </div>
          </div>

          {/* Philosophical & Biblical Resonance Callout */}
          <div className="rounded-xl border border-gold/20 bg-background/60 p-4 text-xs text-soft leading-relaxed">
            <strong className="text-gold">Ancestral Insight: </strong>
            {result.biblicalResonance}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-subtle">
          <p className="text-sm">Click one of the presets above to preview the Ge'ez gematria arithmetic.</p>
        </div>
      )}

      {/* Bottom Action */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-5">
        <span className="text-xs text-muted-foreground">
          Want the complete 16-circle Awde Negest reading and talismanic scroll?
        </span>
        <Link
          href="/case/workflows/new/spiritual"
          className="inline-flex items-center gap-2 rounded-xl bg-gold-fill px-4 py-2.5 text-xs font-bold text-gold-foreground transition-all hover:bg-gold-fill hover:shadow-panel"
        >
          <span>BEGIN FULL READING</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
