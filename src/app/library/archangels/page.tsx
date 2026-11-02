import Link from "next/link";
import { ArrowLeft, BookOpenText } from "lucide-react";
import ArchangelTextLibrary from "./ArchangelTextLibrary";

export const metadata = {
  title: "ድርሳነ ሊቃነ መላእክት | Archangel Text Library",
  description:
    "Search public catalogs and online editions of Ethiopian Orthodox Dirsan texts for the Archangels.",
};

export default function ArchangelLibraryPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 pb-16">
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground transition-colors hover:text-gold"
      >
        <ArrowLeft size={14} />
        Back to Library
      </Link>

      <header className="rounded-[28px] border border-gold/20 bg-gradient-to-br from-card via-background to-gold-soft p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] md:p-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-strong">
          <BookOpenText size={13} />
          Ethiopian Orthodox devotional texts
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          ድርሳነ ሊቃነ መላእክት
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-soft md:text-base">
          A searchable guide to finding Dirsan texts associated with the Archangels. Search each saint or the
          collective seven-archangels title, then open an edition at its source to read or download where the
          publisher permits it.
        </p>
        <Link
          href="/library/books"
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold-strong transition hover:bg-gold/20"
        >
          Browse all six supplied books
        </Link>
      </header>

      <ArchangelTextLibrary />
    </main>
  );
}
