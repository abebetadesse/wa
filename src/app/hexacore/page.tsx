import Link from "next/link";
import HexacoreOrrery from "@/components/cultural/HexacoreOrrery";
import { PathwayPractitioners } from "@/features/cases/PathwayPractitioners";
import { Sparkles, Shield, Compass, Calendar, BookOpen, Layers } from "lucide-react";

export const metadata = {
  title: "The Hexacore Arcana: Enhanced Edition | Ethiopian Wisdom & Wellness Platform",
  description:
    "A 14-Layer, 2,016-Frequency, 12,096-Correspondence Traditional Wisdom System with 6-based numerology, 30-day reflection journal, body signs reading, and cultural cross-system bridges.",
};

export default function HexacorePage() {
  return (
    <main className="app-container py-10 space-y-8">
      {/* Hero Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-300">
            Domain B · Traditional Wisdom & Arcana
          </span>
          <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-[11px] font-medium text-amber-200">
            Enhanced Edition · 14 Layers
          </span>
        </div>

        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          The Hexacore Arcana
        </h1>
        <p className="max-w-3xl text-sm md:text-base leading-relaxed text-slate-300">
          A deeply nested, fractal traditional wisdom framework integrating 14 layers, 2,016 frequencies, 12,096 correspondences, 6-based numerology, subtle anatomy, Ethiopian herbal botany, and creation-day relational cycles.
        </p>

        {/* System Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <span className="text-2xl md:text-3xl font-black text-amber-300 block">14</span>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Nested Layers</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <span className="text-2xl md:text-3xl font-black text-indigo-300 block">2,016</span>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Frequencies</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <span className="text-2xl md:text-3xl font-black text-emerald-300 block">12,096</span>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Correspondences</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <span className="text-2xl md:text-3xl font-black text-purple-300 block">46,656</span>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Unique States</span>
          </div>
        </div>

        {/* Domain B Ethical Guardrails & Safety Notice */}
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-4 text-xs md:text-sm leading-relaxed text-amber-100/90 flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-amber-200">Ethical & Reflective Boundary:</strong> This experience is dedicated exclusively to cultural reflection, self-inquiry, and traditional heritage exploration. Body sign reflections are observational symbols, not medical diagnoses. Solfeggio sound tones and herbal correspondences are botanical/historical references, not medical treatments. Divination and herbal modules are age-gated (18+). You may hide or opt-out of this layer at any time.
          </div>
        </div>
      </header>

      {/* Grand Orrery & Multi-Layer System */}
      <HexacoreOrrery />

      {/* Connects the reflection to real practice: debteras who offer readings, and the reading pathway. */}
      <section aria-labelledby="hexacore-practice" className="grid gap-4 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 id="hexacore-practice" className="text-xl font-bold text-white">Reflect on it with a debtera</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            The arcana is a map for reflection. To explore your own name and season in depth, start the Spiritual &amp; Life Direction pathway, or book a debtera who offers readings and will review it with you.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/case/workflows/new/spiritual" className="btn-pill-primary">Start the reading pathway</Link>
            <Link href="/safety" className="btn-pill-secondary">Check plants against medicines</Link>
          </div>
        </div>
        <PathwayPractitioners domain="spiritual" />
      </section>
    </main>
  );
}
