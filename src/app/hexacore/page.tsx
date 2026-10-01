import Link from "next/link";
import HexacoreOrrery from "@/components/cultural/HexacoreOrrery";
import { PathwayPractitioners } from "@/features/cases/PathwayPractitioners";
import { ArrowRight, BookOpen, Compass, Eye, Shield } from "lucide-react";

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
      <section id="hexacore-orrery" aria-label="Interactive Hexacore Arcana">
        <HexacoreOrrery />
      </section>

      <section aria-labelledby="hexacore-practitioner" className="space-y-4">
        <header className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-violet-300">Practitioner toolkit</p>
          <h2 id="hexacore-practitioner" className="mt-2 text-2xl font-bold text-white">A reflective reading, from map to meaning</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Explore the six cores, use body-sign guides as cultural reflection, or take a question into a structured spiritual pathway.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="#hexacore-orrery"
            className="group rounded-3xl border border-indigo-400/20 bg-indigo-500/[0.06] p-5 transition hover:border-indigo-300/40 hover:bg-indigo-500/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            <Compass className="size-6 text-indigo-300" aria-hidden="true" />
            <h3 className="mt-4 font-bold text-white">Map the six cores</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Explore the interactive orrery, archetypes, correspondences, and profile reflections.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-200">
              Explore the orrery <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>

          <Link
            href="/body-reading/tongue"
            className="group rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.06] p-5 transition hover:border-emerald-300/40 hover:bg-emerald-500/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          >
            <Eye className="size-6 text-emerald-300" aria-hidden="true" />
            <h3 className="mt-4 font-bold text-white">Explore body-sign guides</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Browse tongue, palm, and face references as cultural and educational reflection, not diagnosis.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
              Open the reading guides <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>

          <Link
            href="/case/workflows/new/spiritual"
            className="group rounded-3xl border border-amber-400/20 bg-amber-500/[0.06] p-5 transition hover:border-amber-300/40 hover:bg-amber-500/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          >
            <BookOpen className="size-6 text-amber-300" aria-hidden="true" />
            <h3 className="mt-4 font-bold text-white">Follow a guided reflection</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Bring a question to the Spiritual &amp; Life Direction pathway and shape the next steps around your context.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-200">
              Start the pathway <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>

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
