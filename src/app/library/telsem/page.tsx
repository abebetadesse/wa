import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Scroll, ShieldCheck, BookOpenText } from "lucide-react";
import { TelsemLibraryViewer } from "@/components/cultural/TelsemLibraryViewer";

export const metadata = {
  title: "Sacred Ethiopian Telsem Archive (የጠልሰም ማኅደር) | Ethio-Wellness",
  description:
    "Comprehensive digital archive of authentic Ethiopian talismanic art (ጠልሰም), parchment seals, geometric diagrams, and prayers from Mets'hafe Asmat and classical scroll traditions.",
};

export default function TelsemLibraryPage() {
  return (
    <main className="space-y-8 pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 border-b border-stone-800 pb-4">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Manuscript Library</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/library/hatata"
            className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-300 font-mono text-[10px] uppercase tracking-wider border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
          >
            ሃተታ መናፍስት (Commentary) ↗
          </Link>
          <Link
            href="/library/awde-negast"
            className="px-3 py-1 rounded-full bg-stone-900 text-stone-300 font-mono text-[10px] uppercase tracking-wider border border-stone-800 hover:border-amber-500/40 hover:text-amber-200 transition-colors"
          >
            አውደ ነገሥት (Manuscripts) ↗
          </Link>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 font-mono text-[10px] uppercase tracking-widest border border-amber-500/20">
            DOMAIN B
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <header className="rounded-[32px] border border-amber-500/20 bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950/30 p-8 md:p-12 shadow-[0_20px_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none select-none text-9xl font-serif text-amber-400">
          ❖
        </div>

        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-300">
            <Sparkles size={13} />
            የብራና ክታብና የአስማት ጥበብ
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight text-white">
            Sacred Ethiopian Telsem Archive <br />
            <span className="text-amber-300 font-serif font-normal">
              (የኢትዮጵያ ጥንታዊ የጠልሰም ማኅደር)
            </span>
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-stone-300">
            Explore the complete collection of classical Ethiopian talismanic seals (ጠልሰም),
            parchment geometry, and sacred Ge&apos;ez invocations. Faithfully extracted from
            historical manuscripts including <strong className="text-amber-200">Mets&apos;hafe Asmat (መጽሐፈ አስማት)</strong>,
            Awde Negest (አውደ ነገሥት), and the debtera healing scroll tradition of Gondar and Lake Tana.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 text-[11px] uppercase tracking-[0.18em] text-stone-400 font-mono">
            <span className="rounded-full border border-stone-800 bg-stone-950/60 px-3 py-1 text-amber-300/90">
              22 Classical Seals
            </span>
            <span className="rounded-full border border-stone-800 bg-stone-950/60 px-3 py-1">
              High-Res Manuscript Plates
            </span>
            <span className="rounded-full border border-stone-800 bg-stone-950/60 px-3 py-1">
              Interactive Sacred Geometry
            </span>
            <span className="rounded-full border border-stone-800 bg-stone-950/60 px-3 py-1">
              Ge&apos;ez Prayer Formulas
            </span>
          </div>
        </div>
      </header>

      {/* Cultural Heritage & Debtera Context Note */}
      <section className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 text-xs text-stone-400 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <BookOpenText size={16} />
          <span>The Esoteric Debtera & Parchment Healing Scroll Tradition</span>
        </div>
        <p className="leading-relaxed text-stone-300">
          In Ethiopian cultural tradition, a <em>Telsem</em> (ጠልሰም) is not mere decoration: it is an active sacred graphic
          technology created by ecclesiastical scholars (<em>debteras</em>). Written on vellum prepared from goat-hide,
          each talisman combines symbolic geometry, all-seeing eyes (ዓይነት), interlaced cruciforms, and Ge&apos;ez
          scriptural verses. The talisman was personalized to the bearer&apos;s baptismal name and astrological hour to
          serve as a protective shield against malevolent glances (ዓይነ ጥላ), spiritual disquiet, and illness.
        </p>
      </section>

      {/* Main Interactive Explorer */}
      <TelsemLibraryViewer />
    </main>
  );
}
