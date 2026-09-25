"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
} from "lucide-react";
import {
  ETHIOPIAN_TELSEM_COLLECTION,
  TelsemSeal,
  TelsemCategory,
} from "@/lib/cultural/telsemData";
import { TelsemSacredSeal } from "./TelsemSacredSeal";

export function TelsemLibraryViewer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeal, setSelectedSeal] = useState<TelsemSeal>(
    ETHIOPIAN_TELSEM_COLLECTION[0]
  );
  const [showFullManuscriptPage, setShowFullManuscriptPage] = useState(false);

  const categories: { id: string; labelAm: string; labelEn: string; icon: string }[] = [
    { id: "all", labelAm: "ሁሉም", labelEn: "All Seals", icon: "❖" },
    { id: "protection", labelAm: "ጥበቃ ወማዕሠር", labelEn: "Protection", icon: "🛡️" },
    { id: "healing", labelAm: "ፈውስ ወመፍትሔ", labelEn: "Healing", icon: "🌿" },
    { id: "archangels", labelAm: "ድርሳነ ሊቃነ መላእክት", labelEn: "Archangels", icon: "⚔️" },
    { id: "abundance", labelAm: "ሀብት ወገበያ", labelEn: "Abundance", icon: "🌾" },
    { id: "wisdom", labelAm: "ትምህርት ወጥበብ", labelEn: "Wisdom", icon: "📜" },
    { id: "harmony", labelAm: "መስተፋቅር ወሰላም", labelEn: "Harmony", icon: "🕊️" },
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
        seal.spiritualMeaning.toLowerCase().includes(q) ||
        seal.sacredGeometryDescription.toLowerCase().includes(q) ||
        seal.categoryLabelAm.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Search and Category Filter Bar */}
      <div className="rounded-3xl border border-amber-500/20 bg-stone-900/80 p-4 sm:p-6 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search every Telsem by name (e.g. መድፌ ወጊ, ሚካኤል, ሳዶር, ሰሎሞን, protection)..."
              className="w-full rounded-2xl border border-stone-700 bg-stone-950/80 pl-10 pr-4 py-3 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-stone-400 shrink-0 self-end sm:self-center">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
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
                  ? "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20"
                  : "bg-stone-950/70 border border-stone-800 text-stone-300 hover:border-amber-500/30 hover:text-amber-200"
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
                <div
                  key={seal.id}
                  onClick={() => {
                    setSelectedSeal(seal);
                    setShowFullManuscriptPage(false);
                  }}
                  className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 relative border group ${
                    isSelected
                      ? "bg-gradient-to-br from-amber-950/40 via-stone-900 to-black border-amber-400 shadow-xl shadow-amber-500/10 -translate-y-1"
                      : "bg-stone-900/60 border-stone-800 hover:border-amber-500/40 hover:bg-stone-900"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl border border-stone-700 bg-stone-950 overflow-hidden flex items-center justify-center shrink-0 p-1">
                      {seal.sourceImage ? (
                        <img
                          src={seal.sourceImage}
                          alt={seal.nameAm}
                          className="w-full h-full object-contain filter sepia-[0.3]"
                        />
                      ) : (
                        <span className="text-2xl">❖</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                          {seal.categoryLabelAm}
                        </span>
                        {seal.sourcePage && (
                          <span className="text-[10px] text-stone-500 font-mono">
                            ገጽ {seal.sourcePage}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white truncate font-serif group-hover:text-amber-200">
                        {seal.nameAm}
                      </h4>
                      <p className="text-[11px] text-stone-400 truncate">
                        {seal.nameEn}
                      </p>
                      <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">
                        {seal.spiritualMeaning}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSeals.length === 0 && (
            <div className="rounded-3xl border border-stone-800 bg-stone-900/50 p-12 text-center space-y-3">
              <span className="text-3xl">🔍</span>
              <p className="text-base text-stone-300 font-medium">
                No matching Telsem seals found for &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Deep Inspector for Selected Telsem (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 space-y-6">
          <div className="space-y-4">
            <TelsemSacredSeal seal={selectedSeal} size="lg" />

            {/* If Manuscript Scan Page is available, provide full parchment page view */}
            {selectedSeal.manuscriptPageImage && (
              <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <BookOpen size={14} />
                    <span>Original Manuscript Page Scan (ገጽ {selectedSeal.sourcePage})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFullManuscriptPage(!showFullManuscriptPage)}
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-mono underline"
                  >
                    {showFullManuscriptPage ? "Hide Page" : "View Entire Page"}
                  </button>
                </div>

                {showFullManuscriptPage && (
                  <div className="rounded-xl overflow-hidden border border-stone-700 bg-stone-950 p-2 animate-fadeIn">
                    <img
                      src={selectedSeal.manuscriptPageImage}
                      alt={`Mets'hafe Asmat Page ${selectedSeal.sourcePage}`}
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                    <p className="text-[10px] text-stone-400 font-mono mt-2 text-center">
                      Source: Mets&apos;hafe Asmat (መጽሐፈ አስማት), Page {selectedSeal.sourcePage}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Test in Divination Callout */}
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-amber-200">
                  Calculate Your Personal Telsem
                </h5>
                <p className="text-[11px] text-stone-400">
                  Align your Ge&apos;ez name gematria to its matching debtera talisman.
                </p>
              </div>
              <Link
                href="/case/spiritual/intake/step-1"
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0 transition"
              >
                Start Divination →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
