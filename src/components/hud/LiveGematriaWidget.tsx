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
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-stone-900/90 via-black/80 to-stone-950/95 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-amber-950/20">
      {/* Background radial accent */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-mono font-medium text-amber-300">
            <Sparkles size={12} className="text-amber-400" />
            የፊደል ሂሳብ • LIVE GE'EZ GEMATRIA
          </div>
          <h3 className="mt-2 text-xl md:text-2xl font-bold tracking-tight text-white">
            Sacred Name Vibration Calculator
          </h3>
          <p className="text-xs md:text-sm text-stone-400">
            Ancient Abushakir letter weights reveal your spiritual digital root and virtue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">PRESETS:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_NAMES.map((item) => (
              <button
                key={item.geez}
                type="button"
                onClick={() => setInputName(item.geez)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  inputName === item.geez
                    ? "bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-500/30"
                    : "bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white border border-white/5"
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
        <label htmlFor="gematria-name-input" className="block text-xs font-mono text-stone-400 mb-2">
          TYPE ANY ETHIOPIAN OR GE'EZ NAME:
        </label>
        <div className="relative">
          <input
            id="gematria-name-input"
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="Type in Ge'ez (e.g. ዳዊት, ሰላም, ፀሐይ)..."
            className="w-full rounded-xl border border-amber-500/40 bg-stone-950/80 px-4 py-3.5 pl-11 text-lg font-semibold text-amber-200 placeholder-stone-600 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
          <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400/60" />
          {inputName && (
            <button
              type="button"
              onClick={() => setInputName("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-stone-500 hover:text-stone-300"
              title="Clear input"
            >
              ✕
            </button>
          )}
        </div>
        {!hasFidel && inputName.trim().length > 0 && (
          <p className="mt-2 text-xs text-amber-400/80 font-mono">
            ℹ For full Abushakir calculation, use Ge'ez Fidel letters (choose from presets above or use Amharic keyboard).
          </p>
        )}
      </div>

      {/* Calculation output breakdown */}
      {hasFidel ? (
        <div className="space-y-4">
          {/* Letters row */}
          <div>
            <span className="text-[11px] font-mono uppercase text-stone-400">LETTER VALUES DECOMPOSITION</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.recognizedFidelLetters.map((item, idx) => (
                <div
                  key={`${item.letter}-${idx}`}
                  className="flex flex-col items-center justify-center rounded-xl border border-amber-500/20 bg-stone-900/80 px-3.5 py-2.5 shadow-inner"
                >
                  <span className="text-xl font-bold text-amber-300">{item.letter}</span>
                  <span className="text-xs font-mono font-medium text-stone-400 mt-1">={item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="text-[11px] font-mono uppercase text-stone-400">TOTAL SUM</span>
              <div className="mt-1 text-2xl font-bold text-white font-mono">{result.totalNumericalSum}</div>
              <span className="text-[11px] text-stone-500 font-mono">Combined Ge'ez weight</span>
            </div>

            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
              <span className="text-[11px] font-mono uppercase text-amber-300">DIGITAL ROOT</span>
              <div className="mt-1 text-3xl font-extrabold text-amber-400 font-mono">
                {result.reducedDigitValue}
              </div>
              <span className="text-[11px] text-amber-300/70 font-mono">Reduced root (1–9)</span>
            </div>

            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
              <span className="text-[11px] font-mono uppercase text-cyan-300">ARCHETYPAL VIRTUE</span>
              <div className="mt-1 text-sm font-semibold text-cyan-200 line-clamp-2">
                {result.philosophicalVirtue}
              </div>
              <span className="text-[11px] text-cyan-400/70 font-mono">Spiritual resonance</span>
            </div>
          </div>

          {/* Philosophical & Biblical Resonance Callout */}
          <div className="rounded-xl border border-amber-500/20 bg-stone-950/60 p-4 text-xs text-stone-300 leading-relaxed">
            <strong className="text-amber-300">Ancestral Insight: </strong>
            {result.biblicalResonance}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-800 p-8 text-center text-stone-500">
          <p className="text-sm">Click one of the presets above to preview the Ge'ez gematria arithmetic.</p>
        </div>
      )}

      {/* Bottom Action */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-5">
        <span className="text-xs text-stone-400">
          Want the complete 16-circle Awde Negest reading and talismanic scroll?
        </span>
        <Link
          href="/case/spiritual/intake"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/25"
        >
          <span>BEGIN FULL READING</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
