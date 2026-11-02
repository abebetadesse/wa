import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Scroll, ShieldCheck, BookOpenText } from "lucide-react";
import { TelsemLibraryViewer } from "@/components/cultural/TelsemLibraryViewer";

export const metadata = {
  title: "Ethiopian Telsem Archive & Prayer Study Guide (የጠልሰም ማኅደር) | Ethio-Wellness",
  description:
    "Explore catalogued Ethiopian Telsem seals, prayer transcriptions, geometric illustrations, and manuscript scans. Some transcriptions may be abbreviated; provided for cultural and educational study.",
};

export default function TelsemLibraryPage() {
  return (
    <main className="space-y-8 pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground border-b border-border pb-4">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Manuscript Library</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/library/hatata"
            className="px-3 py-1 rounded-full bg-gold/10 text-gold-strong text-[10px] uppercase tracking-wider border border-gold/20 hover:bg-gold/20 transition-colors"
          >
            ሃተታ መናፍስት (Commentary) ↗
          </Link>
          <Link
            href="/library/awde-negast"
            className="px-3 py-1 rounded-full bg-card text-soft text-[10px] uppercase tracking-wider border border-border hover:border-gold/40 hover:text-gold-strong transition-colors"
          >
            አውደ ነገሥት (Manuscripts) ↗
          </Link>
          <span className="px-3 py-1 rounded-full bg-gold/10 text-gold-strong text-[10px] uppercase tracking-wider border border-gold/20">
            DOMAIN B
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <header className="rounded-[32px] border border-gold/20 bg-gradient-to-br from-card via-background to-gold-soft p-8 md:p-12 shadow-[0_20px_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none select-none text-9xl font-serif text-gold">
          ❖
        </div>

        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-strong">
            <Sparkles size={13} />
            የብራና ክታብና የአስማት ጥበብ
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-serif tracking-tight text-foreground">
            Sacred Ethiopian Telsem Archive <br />
            <span className="text-gold font-serif font-normal">
              (የኢትዮጵያ ጥንታዊ የጠልሰም ማኅደር)
            </span>
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-soft">
            Browse 22 catalogued Ethiopian Telsem entries (ጠልሰም), geometric illustrations, prayer transcriptions,
            and manuscript scans where available. Entries refer to sources including
            <strong className="text-gold-strong"> Mets&apos;hafe Asmat (መጽሐፈ አስማት)</strong> and Awde Negest
            (አውደ ነገሥት); some catalog text is abbreviated and is not a critical edition.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-gold">
              22 Classical Seals
            </span>
            <span className="rounded-full border border-border bg-background/60 px-3 py-1">
              High-Res Manuscript Plates
            </span>
            <span className="rounded-full border border-border bg-background/60 px-3 py-1">
              Interactive Sacred Geometry
            </span>
            <span className="rounded-full border border-border bg-background/60 px-3 py-1">
              Ge&apos;ez Prayer Transcriptions
            </span>
          </div>
        </div>
      </header>

      {/* Cultural Heritage & Debtera Context Note */}
      <section className="rounded-2xl border border-border bg-card/60 p-5 text-xs text-muted-foreground space-y-2">
        <div className="flex items-center gap-2 font-bold text-gold">
          <BookOpenText size={16} />
          <span>Manuscript, Prayer & Scroll Traditions</span>
        </div>
        <p className="leading-relaxed text-soft">
          Telsem (ጠልሰም) imagery and prayer texts appear in a range of Ethiopian manuscript and devotional traditions.
          Interpretations and practices vary among communities and religious authorities. This archive presents
          catalog descriptions and source images for cultural study; it does not validate claims of healing or
          protection. Printed study copies preserve the available catalog wording and flag abbreviated transcriptions.
        </p>
        <Link
          href="https://app.wisdomcourse.com.et/library/telsem"
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-gold underline underline-offset-2 hover:text-gold-strong"
        >
          Open the linked Telsem guide
        </Link>
      </section>

      {/* Main Interactive Explorer */}
      <TelsemLibraryViewer />
    </main>
  );
}
