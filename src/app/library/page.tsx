import Link from "next/link";
import { BookOpenText, ArrowRight, Sparkles } from "lucide-react";

export default function LibraryPage() {
  return (
    <main className="space-y-8 pb-16">
      <header className="rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950/20 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] md:p-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">
          <Sparkles size={12} />
          Manuscript collection
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
          Sacred manuscript library
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-stone-300 md:text-base">
          Read the original Awde Negest manuscript alongside the platform&apos;s structured circle system,
          divination categories, and live cultural intelligence tools.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-2">
        <Link href="/library/awde-negast" className="group block overflow-hidden rounded-[28px] border border-amber-500/20 bg-stone-900/80 shadow-[0_15px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-amber-400/40">
          <div className="flex flex-col gap-6 p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">Primary text</p>
                <h2 className="mt-3 text-2xl font-bold text-white">Awde Negest</h2>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-300">
                <BookOpenText size={28} />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-700 bg-stone-950/80 p-3">
              <img
                src="https://archive.org/services/img/awede-negest"
                alt="Awde Negest manuscript cover"
                className="h-60 w-full rounded-xl object-cover object-center"
              />
            </div>

            <div className="space-y-3 text-sm text-stone-300">
              <p>
                Ethiopian Orthodox manuscript tradition preserved through the Archive.org digital edition,
                connected to the app&apos;s 16-circle divination engine and cultural reading system.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-stone-400">
                <span className="rounded-full border border-stone-700 px-2 py-1">16 circles</span>
                <span className="rounded-full border border-stone-700 px-2 py-1">60 categories</span>
                <span className="rounded-full border border-stone-700 px-2 py-1">Original pages</span>
              </div>
            </div>

            <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
              Open manuscript reader
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        <Link href="/library/medicinal-plants" className="group block overflow-hidden rounded-[28px] border border-emerald-500/20 bg-stone-900/80 shadow-[0_15px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-emerald-400/40">
          <div className="flex flex-col gap-6 p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300">Evidence-linked atlas</p>
                <h2 className="mt-3 text-2xl font-bold text-white">Medicinal plants</h2>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
                <BookOpenText size={28} />
              </div>
            </div>

            <div className="rounded-2xl border border-stone-700 bg-gradient-to-br from-emerald-950/40 to-stone-950 p-4">
              <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                <span>Chapter 66996</span>
                <span>80 species</span>
              </div>
              <div className="grid gap-2 text-sm text-stone-200">
                <div className="rounded-xl border border-stone-700 bg-stone-950/60 px-3 py-2">Damakesse • headache, febrile illness</div>
                <div className="rounded-xl border border-stone-700 bg-stone-950/60 px-3 py-2">Kosso • tapeworm</div>
                <div className="rounded-xl border border-stone-700 bg-stone-950/60 px-3 py-2">Tikur Azmud • headache & airway relief</div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-stone-300">
              <p>
                Search by plant name, habitat, disease type, and part used to browse the reviewed Ethiopian traditional
                medicinal species and their documented applications.
              </p>
            </div>

            <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
              Explore medicinal atlas
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        <div className="rounded-[28px] border border-stone-800 bg-stone-900/70 p-6 md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">Collection notes</p>
          <h3 className="mt-3 text-2xl font-bold text-white">Reading room access</h3>
          <ul className="mt-5 space-y-4 text-sm text-stone-300">
            <li className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
              Original manuscript pages remain linked to the Archive.org viewer for full-page reading.
            </li>
            <li className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
              Structured circle data is synchronized to the app&apos;s live Awde Negest engine.
            </li>
            <li className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
              Each circle opens a divination CTA and a contextual reading for spiritual intake.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
