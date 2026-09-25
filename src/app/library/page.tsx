import Link from "next/link";
import { BookOpenText, ArrowRight, Sparkles } from "lucide-react";
import { ETHIOPIAN_MANUSCRIPT_SOURCES } from "@/lib/cultural/manuscriptSources";
import { ETHIOPIAN_MANUSCRIPT_INDEX } from "@/lib/cultural/manuscriptIndex";

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

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/library/awde-negast" className="group block overflow-hidden rounded-[28px] border border-amber-500/20 bg-stone-900/80 shadow-[0_15px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-amber-400/40">
          <div className="flex flex-col gap-6 p-6 md:p-8 h-full">
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
                className="h-52 w-full rounded-xl object-cover object-center"
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

        <Link href="/library/telsem" className="group block overflow-hidden rounded-[28px] border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-stone-900 to-black shadow-[0_15px_60px_rgba(217,119,6,0.15)] transition hover:-translate-y-1 hover:border-amber-400">
          <div className="flex flex-col gap-6 p-6 md:p-8 h-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">Parchment scrolls</p>
                <h2 className="mt-3 text-2xl font-bold text-white">Sacred Telsem (ጠልሰም)</h2>
              </div>
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-300">
                <Sparkles size={28} />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-amber-500/30 bg-stone-950/90 p-3 relative flex items-center justify-center">
              <img
                src="/telsem/telsem_p13_1.png"
                alt="Ethiopian Telsem Talisman"
                className="h-52 w-full rounded-xl object-contain filter sepia-[0.3] contrast-125"
              />
              <span className="absolute top-5 right-5 px-2.5 py-1 rounded-full bg-black/80 border border-amber-500/40 text-[10px] text-amber-300 font-mono">
                መጽሐፈ አስማት
              </span>
            </div>

            <div className="space-y-3 text-sm text-stone-300">
              <p>
                Authentic talismanic seals (ጠልሰም), geometric eye shields, and protective prayers extracted directly
                from Mets&apos;hafe Asmat, Awde Negest, and debtera parchment scrolls.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-stone-400">
                <span className="rounded-full border border-stone-700 px-2 py-1 text-amber-300">22 seals</span>
                <span className="rounded-full border border-stone-700 px-2 py-1">High-res plates</span>
                <span className="rounded-full border border-stone-700 px-2 py-1">Interactive vector</span>
              </div>
            </div>

            <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
              Explore Telsem archive
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Card 3: ሃተታ መናፍስት ወ አውደ ነገስት ከነትርጉሙ */}
        <Link href="/library/hatata" className="group block overflow-hidden rounded-[28px] border border-yellow-500/30 bg-gradient-to-br from-yellow-950/25 via-stone-900 to-black shadow-[0_15px_60px_rgba(234,179,8,0.12)] transition hover:-translate-y-1 hover:border-yellow-400">
          <div className="flex flex-col gap-6 p-6 md:p-8 h-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-yellow-400">Trilingual commentary</p>
                <h2 className="mt-3 text-2xl font-bold text-white font-serif">ሃተታ መናፍስት</h2>
                <p className="text-xs text-stone-400 mt-0.5">ወ አውደ ነገስት ከነትርጉሙ</p>
              </div>
              <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-yellow-300">
                <Sparkles size={28} />
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-500/20 bg-stone-950/90 p-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-yellow-400/80 font-mono">
                <span>Entity Classification</span>
                <span>Ge&apos;ez • Amharic</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-stone-200">
                <div className="rounded-lg bg-stone-900 border border-stone-800 px-2.5 py-1.5 text-[11px] text-yellow-200">⚡ ሊቃነ መላእክት</div>
                <div className="rounded-lg bg-stone-900 border border-stone-800 px-2.5 py-1.5 text-[11px] text-red-300">🔴 አጋንንት ዘመሸምሸሞ</div>
                <div className="rounded-lg bg-stone-900 border border-stone-800 px-2.5 py-1.5 text-[11px] text-purple-300">👁️ ዓይነ ጥላ ወ ቡዳ</div>
                <div className="rounded-lg bg-stone-900 border border-stone-800 px-2.5 py-1.5 text-[11px] text-emerald-300">🌿 ዘር ወ አያና</div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-stone-300">
              <p>
                Exegesis and traditional taxonomy of spiritual entities, angels, adversarial forces, and Awde Negest circle
                translations complete with protective prayers and outcome prophecies.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-stone-400">
                <span className="rounded-full border border-stone-700 px-2 py-1 text-yellow-300">9 Entities</span>
                <span className="rounded-full border border-stone-700 px-2 py-1">6 Chapters</span>
                <span className="rounded-full border border-stone-700 px-2 py-1">Trilingual</span>
              </div>
            </div>

            <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-yellow-300">
              Read Spirit Commentary
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        <Link href="/library/medicinal-plants" className="group block overflow-hidden rounded-[28px] border border-emerald-500/20 bg-stone-900/80 shadow-[0_15px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-emerald-400/40">
          <div className="flex flex-col gap-6 p-6 md:p-8 h-full">
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

      <section className="rounded-[28px] border border-violet-500/20 bg-violet-950/10 p-6 md:p-8">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300">
          <BookOpenText size={13} />
          User-supplied manuscript sources
        </div>
        <h2 className="mt-3 text-2xl font-bold text-white">Healing, liturgical, and esoteric heritage references</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-300">
          These sources are incorporated as provenance-tracked Domain B cultural references. They are kept separate from
          clinical evidence and are not used to generate diagnoses, medication advice, or unsafe ritual instructions.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {ETHIOPIAN_MANUSCRIPT_SOURCES.map((source) => (
            <article key={source.id} className="rounded-2xl border border-violet-500/20 bg-stone-950/60 p-4">
              <p className="text-lg font-semibold text-white">{source.titleAmharic}</p>
              <p className="mt-1 text-xs text-violet-300">{source.title}</p>
              <div className="mt-3 space-y-1 text-[11px] text-stone-400">
                <p>{source.pageCount} pages</p>
                <p>{source.extractionStatus === "text_extracted" ? "Text extracted for review" : source.extractionStatus === "ocr_completed_needs_review" ? "OCR completed; review required" : "Scanned images; OCR required"}</p>
                <p>{source.reviewStatus.replaceAll("_", " ")}</p>
                {source.detectedTitleFromOcr && <p className="text-amber-300">OCR title: {source.detectedTitleFromOcr}</p>}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {source.themes.slice(0, 2).map((theme) => (
                  <span key={theme} className="rounded-full border border-stone-700 px-2 py-1 text-[10px] text-stone-300">{theme}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 text-[11px] leading-relaxed text-stone-500">
          Source files are tracked by filename, page count, and SHA-256 fingerprint. Full-page publication requires
          permission from the rights holder and review by appropriate cultural custodians.
        </p>
      </section>

      <section className="rounded-[28px] border border-stone-800 bg-stone-900/70 p-6 md:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">OCR navigation index</p>
        <h2 className="mt-3 text-2xl font-bold text-white">Reviewed themes and page references</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-300">
          OCR-derived summaries help reviewers locate themes without reproducing the books&apos; full text. Every entry remains
          marked for cultural review and is separated from scientific recommendations.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {ETHIOPIAN_MANUSCRIPT_INDEX.map((entry) => {
            const source = ETHIOPIAN_MANUSCRIPT_SOURCES.find((candidate) => candidate.id === entry.sourceId);
            return (
              <article key={entry.id} className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{entry.title}</p>
                    {entry.titleAmharic && <p className="mt-1 text-sm text-amber-300">{entry.titleAmharic}</p>}
                  </div>
                  <span className="shrink-0 rounded-full border border-stone-700 px-2 py-1 text-[10px] uppercase tracking-wider text-stone-400">
                    pp. {entry.pageStart}{entry.pageEnd ? `–${entry.pageEnd}` : ""}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-stone-300">{entry.summary}</p>
                <p className="mt-3 text-[11px] leading-relaxed text-emerald-300">{entry.safeUse}</p>
                <p className="mt-3 text-[10px] text-stone-500">{source?.titleAmharic} · {entry.reviewStatus.replaceAll("_", " ")}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
