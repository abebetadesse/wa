import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, BookOpen, Scroll } from "lucide-react";
import { HatataMenafsestViewer } from "@/components/cultural/HatataMenafsestViewer";

export const metadata = {
  title: "ሃተታ መናፍስት ወ አውደ ነገስት ከነትርጉሙ | Sacred Spirit Commentary & Translations",
  description:
    "Trilingual classical commentary on spiritual entities, archangels, and Awde Negest circle chapters in Ge'ez, Amharic, and English.",
};

export default function HatataLibraryPage() {
  return (
    <main className="space-y-6 pb-20">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-xs font-mono text-stone-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>ወደ ቤተ-መጻሕፍት ተመለስ (Back to Library)</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/library/awde-negast"
            className="text-xs font-mono px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:border-amber-500/40 hover:text-amber-200 transition-colors"
          >
            አውደ ነገሥት (Manuscripts) ↗
          </Link>
          <Link
            href="/library/archangels"
            className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            ድርሳነ ሊቃነ መላእክት ↗
          </Link>
          <Link
            href="/library/telsem"
            className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            ጠልሰም (22 Seals) ↗
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <header className="rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950/20 p-6 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">
          <Sparkles size={12} />
          Domain B Cultural Heritage • Trilingual Commentary
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl font-serif">
          ሃተታ መናፍስት ወ አውደ ነገስት ከነትርጉሙ
        </h1>
        <p className="mt-2 text-base text-amber-200/80 font-serif italic">
          Hateta Menafsest We Awde Negest Kene Tirgumu — Commentary on Spirits and the Circle of Kings
        </p>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-300 md:text-base">
          Classical Ethiopian theological and traditional debtera commentary on the hierarchy of spiritual forces,
          holy archangels, adversarial spirits, ancestral entities (ዛር / አያና), and circle chapters of Awde Negest,
          annotated with protective Ge&apos;ez formulas and trilingual interpretations.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] font-mono uppercase tracking-[0.15em] text-stone-400">
          <span className="rounded-full border border-stone-800 bg-stone-950/60 px-3 py-1 text-amber-300">
            9 Spirit Entities
          </span>
          <span className="rounded-full border border-stone-800 bg-stone-950/60 px-3 py-1 text-emerald-300">
            6 Awde Chapters
          </span>
          <span className="rounded-full border border-stone-800 bg-stone-950/60 px-3 py-1 text-sky-300">
            ግዕዝ • አማርኛ • English
          </span>
          <span className="rounded-full border border-stone-800 bg-stone-950/60 px-3 py-1 text-purple-300">
            Linked to 22 Telsem Seals
          </span>
        </div>
      </header>

      {/* Main Interactive Commentary & Chapter Viewer */}
      <HatataMenafsestViewer />
    </main>
  );
}
