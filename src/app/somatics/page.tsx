"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  evaluateCoffeeTiming,
  COFFEE_CEREMONY_ROUNDS,
} from "@/lib/cultural/seasonalTraditionsEngine";

export default function SomaticsPage() {
  // Enhancement 20 State
  const [minutesSinceMeal, setMinutesSinceMeal] = useState<number>(30);
  const timingAssessment = evaluateCoffeeTiming(minutesSinceMeal);

  // Active Ceremony Round
  const [activeRoundIdx, setActiveRoundIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    COFFEE_CEREMONY_ROUNDS[0].suggestedDurationMinutes * 60
  );

  const currentRound = COFFEE_CEREMONY_ROUNDS[activeRoundIdx];

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsPlaying(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, secondsRemaining]);

  const switchRound = (idx: number) => {
    setActiveRoundIdx(idx);
    setIsPlaying(false);
    setSecondsRemaining(COFFEE_CEREMONY_ROUNDS[idx].suggestedDurationMinutes * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="app-container py-10 space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
          <span>Mindful Somatics & Biochemical Timing Companion</span>
          <span>•</span>
          <span className="text-emerald-400">Enhancement 20</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          Mindful Ethiopian Coffee Ceremony (ቡና ማፍላት)
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-3xl mt-2">
          A meditative somatic ritual honoring the ancient birthlands of Coffea Arabica (Keffa), synchronized with an
          automated 60-minute post-prandial buffer to safeguard dietary iron bioavailability from polyphenol chelation.
        </p>
      </div>

      {/* 60-Minute Iron Buffer Safeguard */}
      <div className="glass-panel p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Biochemical Gate</span>
            <h2 className="text-2xl font-bold text-white">60-Minute Post-Meal Iron Chelation Buffer</h2>
            <p className="text-xs text-slate-400 mt-1">
              Polyphenolic tannins and chlorogenic acids in coffee chelate non-heme iron from teff and legumes, reducing absorption by up to 80%.
            </p>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border self-start md:self-auto ${
              timingAssessment.isSafeToBrew
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                : "bg-rose-950/60 border-rose-500/40 text-rose-400"
            }`}
          >
            {timingAssessment.isSafeToBrew ? "✓ SAFE TO BREW" : "⏳ IRON BUFFER ACTIVE"}
          </span>
        </div>

        {/* Meal Timing Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300">Time Elapsed Since Your Last Meal:</span>
            <span className="font-mono text-amber-400 font-bold text-lg">{minutesSinceMeal} Minutes</span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={minutesSinceMeal}
            onChange={(e) => setMinutesSinceMeal(Number(e.target.value))}
            className="w-full h-2.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0m (Just Finished Meal)</span>
            <span>30m (Duodenal Absorption Peak)</span>
            <span>60m (Safe Buffer Threshold)</span>
            <span>90m</span>
            <span>120m</span>
          </div>
        </div>

        {/* Warning or Success Card */}
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed ${
            timingAssessment.isSafeToBrew
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
              : "bg-amber-950/20 border-amber-500/30 text-amber-200"
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-base">{timingAssessment.isSafeToBrew ? "✓" : "⚠️"}</span>
            <div>
              <strong className="block text-sm mb-0.5">
                {timingAssessment.isSafeToBrew
                  ? "Duodenal Absorption Cleared — Safe to Proceed"
                  : `Please wait ${timingAssessment.minutesRemainingToSafeBuffer} more minutes before drinking Abol`}
              </strong>
              <p className="text-slate-300 text-[11px]">{timingAssessment.biochemicalExplanation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Round Interactive Ceremony Somatics */}
      <div className="glass-panel p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Somatic Meditation</span>
            <h2 className="text-2xl font-bold text-white">Three Sacred Extractions (አቦል፣ ቶና፣ በረካ)</h2>
            <p className="text-xs text-slate-400 mt-1">
              Slow down, light the frankincense, waft the aromatic smoke, and enter mindful presence.
            </p>
          </div>
          <div className="flex gap-2">
            {COFFEE_CEREMONY_ROUNDS.map((r, idx) => (
              <button
                key={idx}
                onClick={() => switchRound(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeRoundIdx === idx
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "bg-black/40 text-slate-400 hover:text-white border border-white/10"
                }`}
              >
                {r.roundNameAmharic.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Active Round Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-black/40 border border-amber-500/30 flex flex-col justify-between items-center text-center space-y-4">
            <div>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block mb-1">
                Round {currentRound.extractionOrder} of 3
              </span>
              <h3 className="text-3xl font-extrabold text-white">{currentRound.roundNameAmharic}</h3>
              <p className="text-xs text-slate-400 mt-1">{currentRound.roundNameEnglish}</p>
            </div>

            {/* Timer Display */}
            <div className="font-mono text-5xl font-extrabold text-amber-400 tracking-wider">
              {formatTime(secondsRemaining)}
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  isPlaying
                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {isPlaying ? "Pause Ritual" : "Begin Round"}
              </button>
              <button
                onClick={() => setSecondsRemaining(currentRound.suggestedDurationMinutes * 60)}
                className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/10"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4 flex flex-col justify-center">
            {/* Sensory Prompt */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block">
                Sensory &amp; Olfactory Prompt (የዕጣንና የቡና መዓዛ)
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">{currentRound.roastSensoryPrompt}</p>
            </div>

            {/* Mindfulness Intention */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block">
                Contemplative Somatics &amp; Presence
              </span>
              <p className="text-slate-300 text-sm leading-relaxed">{currentRound.mindfulnessIntention}</p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span>☕ Traditional accompaniment: Fresh Fendisha (Popcorn) &amp; Roasted Kolo</span>
              <span>•</span>
              <span>🌾 Ketema green grass floor spread</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-8 border-t border-white/10 text-xs">
        <Link href="/cultural" className="text-slate-400 hover:text-white transition-colors">
          ← Back to Cultural &amp; Astral Heritage
        </Link>
        <Link href="/governance" className="btn-primary text-xs py-2 px-4">
          View Enterprise Governance &amp; Audit →
        </Link>
      </div>
    </div>
  );
}
