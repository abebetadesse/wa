"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Download, ExternalLink, FileText, Search, ShieldCheck } from "lucide-react";
import { SUPPLIED_BOOKS } from "@/lib/cultural/suppliedBookCatalog";
import { assetUrl } from "@/lib/base-path";

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function SuppliedBooksLibrary() {
  const [query, setQuery] = useState("");
  const [openBookId, setOpenBookId] = useState<string | null>(null);
  const books = useMemo(() => {
    const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return SUPPLIED_BOOKS;
    return SUPPLIED_BOOKS.filter((book) => {
      const searchable = [
        book.title,
        book.titleAm,
        book.description,
        book.sourceFileName,
        book.metadataTitle,
        book.author,
        book.edition,
        book.isbn,
        ...(book.pdfMetadata ?? []),
        ...book.languages,
        ...book.subjects,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return terms.every((term) => searchable.includes(term));
    });
  }, [query]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm leading-relaxed text-soft">
        <div className="mb-2 flex items-center gap-2 font-semibold text-gold-strong">
          <ShieldCheck size={16} />
          Supplied collection · rights authorized by the uploader
        </div>
        Files are served from this app and can be read or downloaded. Scanned PDFs may not support text search;
        bibliographic details are transcribed from the supplied filenames, visible covers, and PDF metadata.
        Unverified title or author details are explicitly marked.
      </section>

      <label className="relative block">
        <Search
          size={17}
          aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <span className="sr-only">Search supplied books</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles, Ge’ez, Amharic, author, ISBN, or subject"
          className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-subtle focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </label>

      <div className="grid gap-4 xl:grid-cols-2">
        {books.map((book) => {
          const isOpen = openBookId === book.id;
          const pdfUrl = `/books/${book.fileName}`;
          return (
            <article
              key={book.id}
              className="overflow-hidden rounded-2xl border border-border bg-card/70"
            >
              <div className="p-5">
                <div className="mb-5 flex h-48 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
                  <Image
                    src={book.coverImage}
                    alt={`${book.title} cover`}
                    width={700}
                    height={900}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      {book.format} · {book.pages} pages
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-foreground">{book.titleAm}</h2>
                    <p className="mt-1 text-sm text-soft">{book.title}</p>
                  </div>
                  <FileText size={20} aria-hidden="true" className="shrink-0 text-gold" />
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{book.description}</p>

                <dl className="mt-4 grid gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-subtle">Languages</dt>
                    <dd className="mt-0.5 text-soft">{book.languages.join(" · ")}</dd>
                  </div>
                  <div>
                    <dt className="text-subtle">File size</dt>
                    <dd className="mt-0.5 text-soft">{formatBytes(book.sizeBytes)}</dd>
                  </div>
                  {book.author && (
                    <div>
                      <dt className="text-subtle">Author / metadata</dt>
                      <dd className="mt-0.5 text-soft">{book.author}</dd>
                    </div>
                  )}
                  {book.edition && (
                    <div>
                      <dt className="text-subtle">Edition</dt>
                      <dd className="mt-0.5 text-soft">{book.edition}</dd>
                    </div>
                  )}
                  {book.isbn && (
                    <div>
                      <dt className="text-subtle">ISBN</dt>
                      <dd className="mt-0.5 text-soft">{book.isbn}</dd>
                    </div>
                  )}
                  {book.metadataTitle && (
                    <div>
                      <dt className="text-subtle">PDF metadata title</dt>
                      <dd className="mt-0.5 text-soft">{book.metadataTitle}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {book.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full border border-border px-2.5 py-1 text-[10px] text-soft"
                    >
                      {subject}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-xs text-subtle">
                  {book.textStatus}
                </p>
                <p className="mt-1 break-all text-[10px] text-subtle">
                  Source file: {book.sourceFileName}
                </p>
                <details className="mt-3 text-[10px] text-subtle">
                  <summary className="cursor-pointer hover:text-soft">Source & file-integrity details</summary>
                  <dl className="mt-2 space-y-1 rounded-lg border border-border bg-background/70 p-3">
                    <div>
                      <dt className="inline">Exact file size: </dt>
                      <dd className="inline text-muted-foreground">{book.sizeBytes.toLocaleString()} bytes</dd>
                    </div>
                    <div>
                      <dt className="block">SHA-256</dt>
                      <dd className="break-all font-mono text-muted-foreground">{book.sha256}</dd>
                    </div>
                    {book.pdfMetadata?.map((detail) => (
                      <div key={detail}>
                        <dt className="sr-only">PDF metadata</dt>
                        <dd className="text-muted-foreground">{detail}</dd>
                      </div>
                    ))}
                  </dl>
                </details>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenBookId(isOpen ? null : book.id)}
                    aria-expanded={isOpen}
                    className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold-strong hover:bg-gold/20"
                  >
                    <BookOpen size={14} />
                    {isOpen ? "Close reader" : "Read full book"}
                  </button>
                  <a
                    href={assetUrl(pdfUrl)}
                    download={book.fileName}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-soft hover:border-gold/40"
                  >
                    <Download size={14} />
                    Download PDF
                  </a>
                  {book.sourceUrl && (
                    <a
                      href={assetUrl(book.sourceUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-soft hover:border-gold/40"
                    >
                      <ExternalLink size={14} />
                      Publisher / source
                    </a>
                  )}
                </div>
              </div>

              {isOpen && (
                <iframe
                  title={`${book.title} — full PDF`}
                  src={assetUrl(`${pdfUrl}#view=FitH`)}
                  className="h-[min(75vh,800px)] w-full border-t border-border bg-background"
                  loading="lazy"
                />
              )}
            </article>
          );
        })}
      </div>

      {books.length === 0 && (
        <p role="status" className="rounded-2xl border border-border bg-card/70 p-6 text-center text-sm text-muted-foreground">
          No books match that search.
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-border pt-5 text-sm">
        <Link href="/library/archangels" className="text-gold hover:text-gold-strong">
          Archangels Dirsan collection →
        </Link>
        <Link href="/library" className="text-muted-foreground hover:text-foreground">
          All library collections
        </Link>
      </div>
    </div>
  );
}
