"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  Sparkles,
  BookOpen,
  Eye,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Scroll,
  Info,
  Layers,
  Printer,
} from "lucide-react";
import {
  ETHIOPIAN_TELSEM_COLLECTION,
  TelsemSeal,
  TelsemCategory,
} from "@/lib/cultural/telsemData";
import { TelsemSacredSeal } from "./TelsemSacredSeal";
import { TelsemScrollCanvas } from "./TelsemScrollCanvas";
import { RELATED_MANUSCRIPTS } from "@/lib/cultural/relatedManuscripts";
import { assetUrl } from "@/lib/base-path";

export function TelsemLibraryViewer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeal, setSelectedSeal] = useState<TelsemSeal>(
    ETHIOPIAN_TELSEM_COLLECTION[0]
  );
  const [showFullManuscriptPage, setShowFullManuscriptPage] = useState(false);
  const [seekerName, setSeekerName] = useState("");
  const [motherName, setMotherName] = useState("");

  const categories: { id: string; labelAm: string; labelEn: string; icon: string }[] = [
    { id: "all", labelAm: "ሁሉም", labelEn: "All Seals", icon: "❖" },
    { id: "protection", labelAm: "ጥበቃ ወማዕሠር", labelEn: "Protection", icon: "��️" },
    { id: "healing", labelAm: "ፈውስ ወመፍትሔ", labelEn: "Healing", icon: "��" },
    { id: "archangels", labelAm: "ድርሳነ ሊቃነ መላእክት", labelEn: "Archangels", icon: "⚔️" },
    { id: "abundance", labelAm: "ሀብት ወገበያ", labelEn: "Abundance", icon: "��" },
    { id: "wisdom", labelAm: "ትምህርት ወጥበብ", labelEn: "Wisdom", icon: "��" },
    { id: "harmony", labelAm: "መስተፋቅር ወሰላም", labelEn: "Harmony", icon: "��️" },
  ];

  const filteredSeals = useMemo(() => {
    return ETHIOPIAN_TELSEM_COLLECTION.filter((seal) => {
      const matchesCategory =
        selectedCategory === "all" || seal.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        seal.nameAm.toLowerCase().includes(q) ||
        seal.nameGe.toLowerCase().includes(q) ||
        seal.nameEn.toLowerCase().includes(q) ||
        seal.traditionalFormulaGe.toLowerCase().includes(q) ||
        seal.traditionalFormulaEn.toLowerCase().includes(q) ||
        seal.spiritualMeaning.toLowerCase().includes(q) ||
        seal.sacredGeometryDescription.toLowerCase().includes(q) ||
        seal.categoryLabelAm.toLowerCase().includes(q) ||
        seal.categoryLabelEn.toLowerCase().includes(q) ||
        seal.ritualMaterials.some((material) => material.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (filteredSeals.length && !filteredSeals.some((seal) => seal.id === selectedSeal.id)) {
      setSelectedSeal(filteredSeals[0]);
      setShowFullManuscriptPage(false);
    }
  }, [filteredSeals, selectedSeal.id]);

  function selectSeal(seal: TelsemSeal) {
    setSelectedSeal(seal);
    setShowFullManuscriptPage(false);
  }

  return (
    <div className="space-y-8">
      {/* Search and Category Filter Bar */}
      <div className="rounded-3xl border border-gold/20 bg-card/80 p-4 sm:p-6  shadow-panel space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search every Telsem by name (e.g. መድፌ ወጊ, ሚካኤል, ሳዶር, ሰሎሞን, protection)..."
              className="w-full rounded-2xl border border-border bg-background/80 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground shrink-0 self-end sm:self-center">
            <span className="px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/20 text-gold-strong font-bold">
              {filteredSeals.length} of {ETHIOPIAN_TELSEM_COLLECTION.length} Talismans Found
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-gold-fill text-gold-foreground font-bold shadow-panel"
                  : "bg-background/70 border border-border text-soft hover:border-gold/30 hover:text-gold-strong"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.labelAm}</span>
              <span className="opacity-70 text-[11px]">({cat.labelEn})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: Catalog Grid + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Grid of Talismans (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredSeals.map((seal) => {
              const isSelected = selectedSeal.id === seal.id;
              return (
                <button
                  key={seal.id}
                  type="button"
                  onClick={() => selectSeal(seal)}
                  aria-pressed={isSelected}
                  className={`w-full text-left cursor-pointer rounded-2xl p-4 transition-all duration-300 relative border group ${
                    isSelected
                      ? "bg-gradient-to-br from-gold-soft via-card to-background border-gold shadow-panel -translate-y-1"
                      : "bg-card/60 border-border hover:border-gold/40 hover:bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl border border-border bg-background overflow-hidden flex items-center justify-center shrink-0 p-1">
                      {seal.sourceImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={assetUrl(seal.sourceImage)}
                          alt={seal.nameAm}
                          className="w-full h-full object-contain filter sepia-[0.3]"
                        />
                      ) : (
                        <span className="text-2xl">❖</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-gold">
                          {seal.categoryLabelAm}
                        </span>
                        {seal.sourcePage && (
                          <span className="text-[10px] text-subtle font-mono">
                            ገጽ {seal.sourcePage}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-foreground truncate font-serif group-hover:text-gold-strong">
                        {seal.nameAm}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {seal.nameEn}
                      </p>
                      <p className="text-[10px] text-subtle line-clamp-2 leading-relaxed">
                        {seal.spiritualMeaning}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredSeals.length === 0 && (
            <div className="rounded-3xl border border-border bg-card/50 p-12 text-center space-y-3">
              <span className="text-3xl">��</span>
              <p className="text-base text-soft font-medium">
                No matching Telsem seals found for &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="px-4 py-2 rounded-xl bg-gold/20 text-gold-strong text-xs font-bold"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Deep Inspector for Selected Telsem (5 cols) */}
        <div className={`lg:col-span-5 sticky top-20 space-y-6 ${filteredSeals.length ? "" : "hidden"}`}>
          <div className="space-y-4">
            <TelsemSacredSeal seal={selectedSeal} size="lg" />

            <section id="tsifet-builder" className="scroll-mt-24 rounded-2xl border border-gold/25 bg-card/70 p-4">
              <div className="mb-3">
                <h4 className="font-bold text-gold-strong">Prepare a printable Tsifet</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Creates a study copy of the selected archive entry. The prayer is printed as catalogued; no missing words or additional ritual instructions are invented.
                </p>
              </div>
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-soft">
                  <span className="mb-1 block">Name for the study copy (optional)</span>
                  <input value={seekerName} onChange={(event) => setSeekerName(event.target.value.slice(0, 60))} maxLength={60} autoComplete="off" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none" />
                </label>
                <label className="text-xs text-soft">
                  <span className="mb-1 block">Mother&apos;s name (optional)</span>
                  <input value={motherName} onChange={(event) => setMotherName(event.target.value.slice(0, 60))} maxLength={60} autoComplete="off" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none" />
                </label>
              </div>
              <TelsemScrollCanvas
                seal={selectedSeal}
                seekerNameGeez={seekerName.trim() || "ተጠቃሚ"}
                motherNameGeez={motherName.trim() || undefined}
                studyCopy
              />
            </section>

            {/* If Manuscript Scan Page is available, provide full parchment page view */}
            {selectedSeal.manuscriptPageImage && (
              <div className="rounded-2xl border border-border bg-card/70 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-gold">
                    <BookOpen size={14} />
                    <span>Original Manuscript Page Scan (ገጽ {selectedSeal.sourcePage})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFullManuscriptPage(!showFullManuscriptPage)}
                    className="text-gold hover:text-gold text-[11px] font-mono underline"
                  >
                    {showFullManuscriptPage ? "Hide Page" : "View Entire Page"}
                  </button>
                </div>

                {showFullManuscriptPage && (
                  <div className="rounded-xl overflow-hidden border border-border bg-background p-2 animate-fadeIn">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={assetUrl(selectedSeal.manuscriptPageImage)}
                      alt={`Mets'hafe Asmat Page ${selectedSeal.sourcePage}`}
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                    <p className="text-[10px] text-muted-foreground font-mono mt-2 text-center">
                      Source: Mets&apos;hafe Asmat (መጽሐፈ አስማት), Page {selectedSeal.sourcePage}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Test in Divination Callout */}
            <div className="rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-gold-strong">
                  Calculate Your Personal Telsem
                </h5>
                <p className="text-[11px] text-muted-foreground">
                  Align your Ge&apos;ez name gematria to its matching debtera talisman.
                </p>
              </div>
              <Link
                href="/case/workflows/new/spiritual"
                className="px-3.5 py-2 rounded-xl bg-gold-fill hover:bg-gold-fill text-gold-foreground font-bold text-xs shrink-0 transition"
              >
                Start Divination →
              </Link>
            </div>
          </div>
          </div>
          <section className="space-y-4" aria-labelledby="telsem-prayers-heading">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gold/20 pb-3">
              <div>
                <h3 id="telsem-prayers-heading" className="text-xl font-bold text-gold-strong">Prayer texts · ጸሎት</h3>
                <p className="mt-1 text-sm text-muted-foreground">Ge&apos;ez catalog text, English rendering, archive source, and manuscript scan where available for each matching seal.</p>
              </div>
              <span className="text-xs text-muted-foreground">{filteredSeals.length} prayer entr{filteredSeals.length === 1 ? "y" : "ies"}</span>
            </div>
            {filteredSeals.map((seal) => {
              const abbreviated = seal.traditionalFormulaGe.includes("...") || seal.traditionalFormulaEn.includes("...");
              return (
                <details key={seal.id} className="group rounded-2xl border border-border bg-card/70">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
                    <span>
                      <span className="block font-serif font-bold text-gold-strong">{seal.nameAm}</span>
                      <span className="block text-xs text-muted-foreground">{seal.nameEn} · {seal.categoryLabelEn}</span>
                    </span>
                    <span className="text-xs text-gold group-open:hidden">Read prayer and source ▾</span>
                    <span className="hidden text-xs text-gold group-open:inline">Close prayer ▴</span>
                  </summary>
                  <div className="space-y-4 border-t border-border p-4">
                    <div>
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gold">Ge&apos;ez catalog transcription</h4>
                      <p lang="gez" className="whitespace-pre-wrap text-base leading-loose text-foreground">{seal.traditionalFormulaGe}</p>
                    </div>
                    <div>
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gold">English rendering</h4>
                      <p className="text-sm leading-relaxed text-soft">{seal.traditionalFormulaEn}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Source: {seal.sourceManuscript}{seal.sourcePage ? ` · page ${seal.sourcePage}` : ""}.</p>
                    {abbreviated && (
                      <p className="rounded-xl border border-gold/20 bg-gold-soft p-3 text-xs text-gold-strong">
                        The available catalog transcription includes an ellipsis and is abbreviated. Refer to the manuscript page scan for the full source wording; this app does not fill in missing text.
                      </p>
                    )}
                    {seal.manuscriptPageImage && (
                      <details className="rounded-xl border border-border bg-sunken/50 p-3">
                        <summary className="cursor-pointer text-xs font-semibold text-gold-strong">View manuscript page scan</summary>
                        <Image src={seal.manuscriptPageImage} alt={`Manuscript scan for ${seal.nameEn}`} width={1200} height={1600} loading="lazy" className="mx-auto mt-3 max-h-[70vh] w-full object-contain" />
                        <a href={assetUrl(seal.manuscriptPageImage)} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-gold underline">Open scan in a new tab</a>
                      </details>
                    )}
                    <button type="button" onClick={() => { selectSeal(seal); document.getElementById("tsifet-builder")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="inline-flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold-strong hover:bg-gold/20">
                      <Printer size={14} /> Prepare this Tsifet
                    </button>
                  </div>
                </details>
              );
            })}
            <p className="rounded-xl border border-border bg-sunken/50 p-3 text-xs leading-relaxed text-muted-foreground">
              Archive wording and translations are provided for cultural and educational study. Some entries are explicitly abbreviated. Printed material is not a medical treatment, guarantee of outcome, or instruction to prepare or use listed substances.
            </p>
          </section>
      </div>
      <section className="space-y-4" aria-labelledby="related-manuscripts-heading">
        <div className="border-b border-gold/20 pb-3">
          <h3 id="related-manuscripts-heading" className="text-xl font-bold text-gold-strong">Related Ethiopian scroll records · Not Telsem entries</h3>
          <p className="mt-1 text-sm text-muted-foreground">Public collection records with a related manuscript subject. These are separate from the 22 catalogued Telsem entries above.</p>
        </div>
        {RELATED_MANUSCRIPTS.map((record) => (
          <article key={record.id} className="rounded-2xl border border-border bg-card/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">{record.institution} · Related scroll record</p>
            <h4 className="mt-2 text-base font-bold leading-relaxed text-foreground">{record.title}</h4>
            <p className="mt-3 text-sm leading-relaxed text-soft">{record.relationshipNote}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Image credit: {record.institution}, {record.licenseLabel}.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <a href={assetUrl(record.catalogueUrl)} target="_blank" rel="noreferrer" className="text-gold underline underline-offset-2 hover:text-gold-strong">View catalogue record</a>
              <a href={assetUrl(record.imageUrl)} target="_blank" rel="noreferrer" className="text-gold underline underline-offset-2 hover:text-gold-strong">View digitized image</a>
              <a href={assetUrl(record.apiUrl)} target="_blank" rel="noreferrer" className="text-gold underline underline-offset-2 hover:text-gold-strong">View catalogue metadata</a>
              <a href={assetUrl(record.licenseUrl)} target="_blank" rel="noreferrer" className="text-gold underline underline-offset-2 hover:text-gold-strong">Read license</a>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
