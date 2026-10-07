"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Download, ExternalLink, Search, ShieldCheck } from "lucide-react";

const SUPPLIED_EDITION_URL =
  "https://myorthodoxbooks.org/wp-content/uploads/2020/07/85.e18bb5e188ade188b3e18a90-e1889ae18aabe18aa4e1888d-e18bb5e188ade188b3e18a90-e188a9e18d8be18aa4e1888d-geezamharic.pdf";

const ARCHANGELS = [
  { id: "mikael", nameAm: "ሚካኤል", nameEn: "Michael", aliases: "Mikael Mikha'el", suppliedEdition: true },
  { id: "gabriel", nameAm: "ገብርኤል", nameEn: "Gabriel", aliases: "Gabriel Gabra'el", suppliedEdition: false },
  { id: "rufael", nameAm: "ሩፋኤል", nameEn: "Raphael", aliases: "Rufael Raphael Rafa'el", suppliedEdition: true },
  { id: "uriel", nameAm: "ዑራኤል", nameEn: "Uriel", aliases: "Urael Uriel Ouriel", suppliedEdition: false },
  { id: "raguel", nameAm: "ራጉኤል", nameEn: "Raguel", aliases: "Raguel Raguel", suppliedEdition: false },
  { id: "phanuel", nameAm: "ፋኑኤል", nameEn: "Phanuel", aliases: "Phanuel Fanuel", suppliedEdition: false },
  { id: "sariel", nameAm: "ሰራቂኤል", nameEn: "Saraqael", aliases: "Saraqael Sariel Saraqiel", suppliedEdition: false },
] as const;

function searchUrl(query: string, site?: string) {
  const scopedQuery = site ? `site:${site} ${query}` : query;
  return `https://www.google.com/search?q=${encodeURIComponent(scopedQuery)}`;
}

export default function ArchangelTextLibrary() {
  const [query, setQuery] = useState("");
  const [showFullText, setShowFullText] = useState(false);
  const filteredArchangels = useMemo(() => {
    const searchTerms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    if (searchTerms.length === 0) return ARCHANGELS;
    return ARCHANGELS.filter((angel) =>
      searchTerms.every((term) =>
        `${angel.nameAm} ${angel.nameEn} ${angel.aliases} ድርሳነ ሊቃነ መላእክት ድርሳነ ፯ቱ Ethiopian Orthodox`
          .toLocaleLowerCase()
          .includes(term),
      ),
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-relaxed text-stone-300">
        <div className="mb-2 flex items-center gap-2 font-semibold text-amber-200">
          <ShieldCheck size={16} />
          Rights-aware reading room
        </div>
        The supplied source is a complete 179-page Ge&apos;ez/Amharic scan whose filename identifies the Dirsan of
        Michael and Raphael. It is hosted by My Orthodox Books; this library links to that host and does not mirror
        the file. The scan has no searchable text layer. Other entries link to source searches because a complete
        edition was not provided here. Language, spelling, contents, and the list of honored Archangels vary by
        tradition.
      </section>

      <section className="rounded-2xl border border-amber-500/30 bg-stone-900/70 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Supplied complete edition · 179 pages
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">ድርሳነ ሚካኤል ወ ድርሳነ ሩፋኤል</h2>
            <p className="mt-1 text-sm text-stone-400">Ge’ez and Amharic scan · hosted by My Orthodox Books</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowFullText((isVisible) => !isVisible)}
              aria-expanded={showFullText}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/20"
            >
              <BookOpen size={14} />
              {showFullText ? "Close reader" : "Read full text"}
            </button>
            <a
              href={SUPPLIED_EDITION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs font-semibold text-stone-200 hover:border-amber-500/40"
            >
              <Download size={14} />
              Open / download PDF
            </a>
          </div>
        </div>
        {showFullText && (
          <iframe
            title="Ge’ez and Amharic Dirsan of Michael and Raphael — complete PDF"
            src={`${SUPPLIED_EDITION_URL}#view=FitH`}
            className="mt-5 h-[min(80vh,900px)] w-full rounded-xl border border-stone-700 bg-stone-950"
            loading="lazy"
          />
        )}
      </section>

      <label className="relative block">
        <Search
          size={17}
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
        />
        <span className="sr-only">Search archangels</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search e.g. ዑራኤል, Uriel, Dirsan Raphael"
          className="w-full rounded-2xl border border-stone-700 bg-stone-950 py-3 pl-11 pr-4 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredArchangels.map((angel) => {
          const title = `ድርሳነ ${angel.nameAm} ${angel.nameEn}`;
          const catalogSearch = searchUrl(`"${title}" OR "Dersane ${angel.nameEn}"`, "archive.org");
          const webSearch = searchUrl(
            `"${angel.nameAm}" "${angel.nameEn}" (ድርሳነ OR Dirsan) Ethiopian Orthodox`,
          );
          return (
            <article
              key={angel.id}
              className="rounded-2xl border border-stone-800 bg-stone-900/70 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                ድርሳን • Dirsan
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                ድርሳነ {angel.nameAm}
              </h2>
              <p className="mt-1 text-sm text-stone-400">Saint {angel.nameEn} · Search for editions</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {angel.suppliedEdition && (
                  <a
                    href={SUPPLIED_EDITION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/20"
                  >
                    <Download size={14} />
                    Open source PDF
                  </a>
                )}
                <a
                  href={webSearch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/20"
                >
                  <Search size={14} />
                  Search web for this text
                </a>
                <a
                  href={catalogSearch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs font-semibold text-stone-200 hover:border-amber-500/40"
                >
                  <ExternalLink size={14} />
                  Search Internet Archive
                </a>
                <a
                  href={searchUrl(`site:myorthodoxbooks.org "${angel.nameAm}" "${angel.nameEn}" ድርሳነ filetype:pdf`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs font-semibold text-stone-200 hover:border-amber-500/40"
                >
                  <Search size={14} />
                  Search My Orthodox Books
                </a>
                <a
                  href={searchUrl(`"${title}" OR "Dersane ${angel.nameEn}"`, "books.google.com")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs font-semibold text-stone-200 hover:border-amber-500/40"
                >
                  <BookOpen size={14} />
                  Search Google Books
                </a>
                <Link
                  href="/library/hatata"
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs font-semibold text-stone-200 hover:border-amber-500/40"
                >
                  <ExternalLink size={14} />
                  In-app commentary
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {filteredArchangels.length === 0 && (
        <p role="status" className="rounded-2xl border border-stone-800 bg-stone-900/70 p-6 text-center text-sm text-stone-400">
          No archangel matches that search.
        </p>
      )}

      <section className="rounded-2xl border border-stone-800 bg-stone-950/70 p-5">
        <h2 className="text-lg font-semibold text-white">The seven archangels collection</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          Search the collective title as well. Some catalogs list one multi-archangel volume rather than separate
          books for each saint; search results may include different languages and editions.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={searchUrl('"ድርሳነ ፯ቱ ሊቃነ መላእክት"', "archive.org")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/20"
          >
            <Search size={14} />
            Search collective title
          </a>
          <a
            href={searchUrl('"ድርሳነ ፯ቱ ሊቃነ መላእክት"', "books.google.com")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-200 hover:border-amber-500/40"
          >
            <ExternalLink size={14} />
            Check catalog for full text
          </a>
          <a
            href={searchUrl('"ድርሳነ ፯ቱ ሊቃነ መላእክት" (Tigrinya OR Amharic)')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-200 hover:border-amber-500/40"
          >
            <Download size={14} />
            Search online PDF editions
          </a>
        </div>
      </section>
    </div>
  );
}
