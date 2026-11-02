import Link from "next/link";
import { BookOpenText, ArrowRight, Sparkles } from "lucide-react";
import { ETHIOPIAN_MANUSCRIPT_SOURCES } from "@/lib/cultural/manuscriptSources";
import { ETHIOPIAN_MANUSCRIPT_INDEX } from "@/lib/cultural/manuscriptIndex";
import { assetUrl } from "@/lib/base-path";

export default function LibraryPage() {
  return (
    <main className="space-y-8 pb-16">
      <header className="rounded-[28px] border border-gold/20 bg-gradient-to-br from-card via-background to-gold-soft p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] md:p-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-strong">
          <Sparkles size={12} />
          Manuscript collection
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Sacred manuscript library
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-soft md:text-base">
          Read the original Awde Negest manuscript alongside the platform&apos;s structured circle system,
          divination categories, and live cultural intelligence tools.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/library/books" className="group block overflow-hidden rounded-[28px] border border-gold/30 bg-gradient-to-br from-gold-soft via-card to-background shadow-[0_15px_60px_rgba(217,119,6,0.15)] transition hover:-translate-y-1 hover:border-gold">
          <div className="flex h-full flex-col gap-6 p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">Supplied collection</p>
                <h2 className="mt-3 text-2xl font-bold text-foreground">Ethiopian Orthodox books</h2>
                <p className="mt-1 text-xs text-muted-foreground">ድርሳን · ግጻዌ · ግእዝ</p>
              </div>
              <div className="rounded-2xl border border-gold/30 bg-gold/10 p-3 text-gold-strong">
                <BookOpenText size={28} />
              </div>
            </div>
            <p className="text-sm leading-relaxed text-soft">
              Search and read six supplied PDFs: devotional Dirsan, the Book of Hours, Gitsaw, and a Ge’ez handwriting workbook.
            </p>
            <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-gold">
              Browse six full texts
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        <Link href="/library/archangels" className="group block overflow-hidden rounded-[28px] border border-gold/30 bg-gradient-to-br from-gold-soft via-card to-background shadow-[0_15px_60px_rgba(217,119,6,0.15)] transition hover:-translate-y-1 hover:border-gold">
          <div className="flex h-full flex-col gap-6 p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">Devotional texts</p>
                <h2 className="mt-3 text-2xl font-bold text-foreground font-serif">ድርሳነ ሊቃነ መላእክት</h2>
                <p className="mt-1 text-xs text-muted-foreground">Archangels Dirsan reader & search</p>
              </div>
              <div className="rounded-2xl border border-gold/30 bg-gold/10 p-3 text-gold-strong">
                <BookOpenText size={28} />
              </div>
            </div>
            <p className="text-sm leading-relaxed text-soft">
              Search by saint or collective title, explore public catalogs, and follow authorized full-text and PDF editions.
            </p>
            <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-gold">
              Open archangel text library
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        <Link href="/library/awde-negast" className="group block overflow-hidden rounded-[28px] border border-gold/20 bg-card/80 shadow-[0_15px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-gold/40">
          <div className="flex flex-col gap-6 p-6 md:p-8 h-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">Primary text</p>
                <h2 className="mt-3 text-2xl font-bold text-foreground">Awde Negest</h2>
              </div>
              <div className="rounded-2xl border border-gold/20 bg-gold/10 p-3 text-gold-strong">
                <BookOpenText size={28} />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-background/80 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://archive.org/services/img/awede-negest"
                alt="Awde Negest manuscript cover"
                className="h-52 w-full rounded-xl object-cover object-center"
              />
            </div>

            <div className="space-y-3 text-sm text-soft">
              <p>
                Ethiopian Orthodox manuscript tradition preserved through the Archive.org digital edition,
                connected to the app&apos;s 16-circle divination engine and cultural reading system.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-1">16 circles</span>
                <span className="rounded-full border border-border px-2 py-1">60 categories</span>
                <span className="rounded-full border border-border px-2 py-1">Original pages</span>
              </div>
            </div>

            <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-gold">
              Open manuscript reader
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        <Link href="/library/telsem" className="group block overflow-hidden rounded-[28px] border border-gold/30 bg-gradient-to-br from-gold-soft via-card to-background shadow-[0_15px_60px_rgba(217,119,6,0.15)] transition hover:-translate-y-1 hover:border-gold">
          <div className="flex flex-col gap-6 p-6 md:p-8 h-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">Parchment scrolls</p>
                <h2 className="mt-3 text-2xl font-bold text-foreground">Sacred Telsem (ጠልሰም)</h2>
              </div>
              <div className="rounded-2xl border border-gold/30 bg-gold/10 p-3 text-gold-strong">
                <Sparkles size={28} />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gold/30 bg-background/90 p-3 relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assetUrl("/telsem/telsem_p13_1.png")}
                alt="Ethiopian Telsem Talisman"
                className="h-52 w-full rounded-xl object-contain filter sepia-[0.3] contrast-125"
              />
              <span className="absolute top-5 right-5 px-2.5 py-1 rounded-full bg-black/80 border border-gold-fill/50 text-[10px] font-semibold text-gold-fill">
                መጽሐፈ አስማት
              </span>
            </div>

            <div className="space-y-3 text-sm text-soft">
              <p>
                Authentic talismanic seals (ጠልሰም), geometric eye shields, and protective prayers extracted directly
                from Mets&apos;hafe Asmat, Awde Negest, and debtera parchment scrolls.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-1 text-gold">22 seals</span>
                <span className="rounded-full border border-border px-2 py-1">High-res plates</span>
                <span className="rounded-full border border-border px-2 py-1">Interactive vector</span>
              </div>
            </div>

            <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-gold">
              Explore Telsem archive
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Card 3: ሃተታ መናፍስት ወ አውደ ነገስት ከነትርጉሙ */}
        <Link href="/library/hatata" className="group block overflow-hidden rounded-[28px] border border-gold/30 bg-gradient-to-br from-gold-soft via-card to-background shadow-[0_15px_60px_rgba(234,179,8,0.12)] transition hover:-translate-y-1 hover:border-gold">
          <div className="flex flex-col gap-6 p-6 md:p-8 h-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">Trilingual commentary</p>
                <h2 className="mt-3 text-2xl font-bold text-foreground font-serif">ሃተታ መናፍስት</h2>
                <p className="text-xs text-muted-foreground mt-0.5">ወ አውደ ነገስት ከነትርጉሙ</p>
              </div>
              <div className="rounded-2xl border border-gold/30 bg-gold/10 p-3 text-gold-strong">
                <Sparkles size={28} />
              </div>
            </div>

            <div className="rounded-2xl border border-gold/20 bg-background/90 p-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gold">
                <span>Entity Classification</span>
                <span>Ge&apos;ez • Amharic</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-soft">
                <div className="rounded-lg bg-card border border-border px-2.5 py-1.5 text-[11px] text-gold-strong">⚡ ሊቃነ መላእክት</div>
                <div className="rounded-lg bg-card border border-border px-2.5 py-1.5 text-[11px] text-danger">🔴 አጋንንት ዘመሸምሸሞ</div>
                <div className="rounded-lg bg-card border border-border px-2.5 py-1.5 text-[11px] text-plum">👁️ ዓይነ ጥላ ወ ቡዳ</div>
                <div className="rounded-lg bg-card border border-border px-2.5 py-1.5 text-[11px] text-brand">🌿 ዘር ወ አያና</div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-soft">
              <p>
                Exegesis and traditional taxonomy of spiritual entities, angels, adversarial forces, and Awde Negest circle
                translations complete with protective prayers and outcome prophecies.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-1 text-gold">9 Entities</span>
                <span className="rounded-full border border-border px-2 py-1">6 Chapters</span>
                <span className="rounded-full border border-border px-2 py-1">Trilingual</span>
              </div>
            </div>

            <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-gold">
              Read Spirit Commentary
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        <Link href="/library/medicinal-plants" className="group block overflow-hidden rounded-[28px] border border-brand/30 bg-gradient-to-br from-brand-soft via-card to-background shadow-[0_15px_60px_rgba(16,185,129,0.15)] transition hover:-translate-y-1 hover:border-brand">
          <div className="flex flex-col gap-6 p-6 md:p-8 h-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand">Materia medica & Fewus</p>
                <h2 className="mt-3 text-2xl font-bold text-foreground font-serif">መጽሐፈ ፈውስ</h2>
                <p className="text-xs text-brand mt-0.5">Traditional Medicine & Herbalism</p>
              </div>
              <div className="rounded-2xl border border-brand/30 bg-brand/10 p-3 text-brand-strong">
                <BookOpenText size={28} />
              </div>
            </div>

            <div className="rounded-2xl border border-brand/20 bg-background/90 p-4 space-y-2">
              <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-brand">
                <span>መጽሐፈ ፈውስ • 38 Chapters</span>
                <span>ገቢር (Preparation)</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-soft">
                <div className="rounded-lg bg-card border border-border px-2.5 py-1.5 text-[11px] text-brand-strong">🌿 ኮሶና ጤና አዳም (ሆድ)</div>
                <div className="rounded-lg bg-card border border-border px-2.5 py-1.5 text-[11px] text-gold-strong">🍵 ዳማከሴና አሪቲ (ምች)</div>
                <div className="rounded-lg bg-card border border-border px-2.5 py-1.5 text-[11px] text-info-strong">🦴 እንሰትና ፌጦ (ስብራት)</div>
                <div className="rounded-lg bg-card border border-border px-2.5 py-1.5 text-[11px] text-plum-strong">🕯️ ቀበሪቾና ከርቤ (ጭንቀት)</div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-soft">
              <p>
                Synthesizing classical manuscript chapters of Metsehafe Fewus (መጽሐፈ ፈውስ), authentic traditional
                preparations (ገቢሮች), and clinical safety monographs across 10 therapeutic categories.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-1 text-brand">60+ Remedies</span>
                <span className="rounded-full border border-border px-2 py-1">Herb-Drug Safety</span>
                <span className="rounded-full border border-border px-2 py-1">Dosage Traditions</span>
              </div>
            </div>

            <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand">
              Explore Traditional Pharmacopeia
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        <div className="rounded-[28px] border border-border bg-card/70 p-6 md:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Collection notes</p>
          <h3 className="mt-3 text-2xl font-bold text-foreground">Reading room access</h3>
          <ul className="mt-5 space-y-4 text-sm text-soft">
            <li className="rounded-2xl border border-border bg-background/60 p-4">
              Original manuscript pages remain linked to the Archive.org viewer for full-page reading.
            </li>
            <li className="rounded-2xl border border-border bg-background/60 p-4">
              Structured circle data is synchronized to the app&apos;s live Awde Negest engine.
            </li>
            <li className="rounded-2xl border border-border bg-background/60 p-4">
              Each circle opens a divination CTA and a contextual reading for spiritual intake.
            </li>
          </ul>
        </div>
      </section>

      <section className="rounded-[28px] border border-plum/20 bg-plum-soft/70 p-6 md:p-8">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-plum">
          <BookOpenText size={13} />
          User-supplied manuscript sources
        </div>
        <h2 className="mt-3 text-2xl font-bold text-foreground">Healing, liturgical, and esoteric heritage references</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-soft">
          These sources are incorporated as provenance-tracked Domain B cultural references. They are kept separate from
          clinical evidence and are not used to generate diagnoses, medication advice, or unsafe ritual instructions.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {ETHIOPIAN_MANUSCRIPT_SOURCES.map((source) => (
            <article key={source.id} className="rounded-2xl border border-plum/20 bg-background/60 p-4">
              <p className="text-lg font-semibold text-foreground">{source.titleAmharic}</p>
              <p className="mt-1 text-xs text-plum">{source.title}</p>
              <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                <p>{source.pageCount ? `${source.pageCount} pages` : "DOCX source; page count not verified"}</p>
                <p>{source.extractionStatus === "text_extracted" ? "Text extracted for review" : source.extractionStatus === "ocr_completed_needs_review" ? "OCR completed; review required" : "Scanned images; OCR required"}</p>
                <p>{source.reviewStatus.replaceAll("_", " ")}</p>
                {source.mediaStatus === "no_embedded_images_found" && <p className="text-subtle">No embedded images found</p>}
                {source.componentCount && <p>{source.componentCount} indexed components</p>}
                {source.detectedTitleFromOcr && <p className="text-gold">OCR title: {source.detectedTitleFromOcr}</p>}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {source.themes.slice(0, 2).map((theme) => (
                  <span key={theme} className="rounded-full border border-border px-2 py-1 text-[10px] text-soft">{theme}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 text-[11px] leading-relaxed text-subtle">
          Source files are tracked by filename, page count, and SHA-256 fingerprint. Full-page publication requires
          permission from the rights holder and review by appropriate cultural custodians.
        </p>
      </section>

      <section className="rounded-[28px] border border-border bg-card/70 p-6 md:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">OCR navigation index</p>
        <h2 className="mt-3 text-2xl font-bold text-foreground">Reviewed themes and page references</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-soft">
          OCR-derived summaries help reviewers locate themes without reproducing the books&apos; full text. Every entry remains
          marked for cultural review and is separated from scientific recommendations.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {ETHIOPIAN_MANUSCRIPT_INDEX.map((entry) => {
            const source = ETHIOPIAN_MANUSCRIPT_SOURCES.find((candidate) => candidate.id === entry.sourceId);
            return (
              <article key={entry.id} className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{entry.title}</p>
                    {entry.titleAmharic && <p className="mt-1 text-sm text-gold">{entry.titleAmharic}</p>}
                  </div>
                  <span className="shrink-0 rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    pp. {entry.pageStart}{entry.pageEnd ? `–${entry.pageEnd}` : ""}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-soft">{entry.summary}</p>
                <p className="mt-3 text-[11px] leading-relaxed text-brand">{entry.safeUse}</p>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="rounded-full border border-info/20 bg-info/5 px-2 py-1 text-info-strong">
                    Evidence: {(entry.evidenceLevel || "source_summary").replaceAll("_", " ")}
                  </span>
                  <span className="rounded-full border border-border px-2 py-1 text-muted-foreground">
                    Media: {(entry.mediaEvaluation || "image_requires_review").replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-3 text-[10px] text-subtle">{source?.titleAmharic} · {entry.reviewStatus.replaceAll("_", " ")}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
