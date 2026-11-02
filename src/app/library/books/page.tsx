import Link from "next/link";
import { ArrowLeft, BookOpenText } from "lucide-react";
import SuppliedBooksLibrary from "./SuppliedBooksLibrary";

export const metadata = {
  title: "Supplied Books | Sacred Manuscript Library",
  description:
    "Search, read, and download the supplied collection of Ethiopian Orthodox books, Dirsan texts, and Ge’ez learning resources.",
};

export default function SuppliedBooksPage() {
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
          Six supplied PDFs · 1,539 pages
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Ethiopian Orthodox books & Ge’ez resources
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-soft md:text-base">
          Search bibliographic details, read each complete PDF in the library, or download the source file.
          Text-search availability and uncertain source metadata are disclosed on each record.
        </p>
      </header>

      <SuppliedBooksLibrary />
    </main>
  );
}
