"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  ShieldCheck,
  BookOpen,
  Scroll,
  ChevronDown,
  ChevronUp,
  Star,
  Flame,
  Wind,
  Droplets,
  AlertTriangle,
  ArrowRight,
  Globe,
} from "lucide-react";
import {
  HATETA_MENAFSEST,
  AWDE_NEGEST_CHAPTERS,
  SpiritCommentaryEntry,
  SpiritClass,
  searchSpiritCommentary,
  getAwdeChapter,
} from "@/lib/cultural/hatataMenafsest";

// ─── Spirit Class Config ───────────────────────────────────────────────────
const SPIRIT_CLASSES: {
  id: SpiritClass | "all";
  labelAm: string;
  labelEn: string;
  icon: string;
  color: string;
}[] = [
  { id: "all", labelAm: "ሁሉም", labelEn: "All Spirits", icon: "✦", color: "amber" },
  { id: "melaek_tsadag", labelAm: "ቅዱሳን ሊቃነ መላእክት", labelEn: "Holy Archangels", icon: "⚡", color: "yellow" },
  { id: "melaek_gana", labelAm: "አጋንንት", labelEn: "Adversarial Spirits", icon: "🔴", color: "red" },
  { id: "buda_ayne", labelAm: "ቡዳ / ዓይነ ጥላ", labelEn: "Evil Eye", icon: "👁️", color: "purple" },
  { id: "melaek_seray", labelAm: "ሥራይ ወ ዕዳ", labelEn: "Binding Curses", icon: "⛓️", color: "orange" },
  { id: "zar_ayana", labelAm: "ዘር / አያና", labelEn: "Ancestral Spirits", icon: "🌿", color: "green" },
  { id: "melaek_netseha", labelAm: "መናፍስት ንጽሐ", labelEn: "Spirits of Purity", icon: "🌟", color: "blue" },
  { id: "melaek_shetan", labelAm: "ሰይጣናት", labelEn: "Fallen Spirits", icon: "⚫", color: "gray" },
];

const CLASS_BADGE: Record<SpiritClass, string> = {
  melaek_tsadag: "bg-yellow-500/15 border-yellow-500/30 text-yellow-300",
  melaek_gana: "bg-red-500/15 border-red-500/30 text-red-300",
  buda_ayne: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  melaek_seray: "bg-orange-500/15 border-orange-500/30 text-orange-300",
  zar_ayana: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  melaek_netseha: "bg-sky-500/15 border-sky-500/30 text-sky-300",
  melaek_shetan: "bg-stone-500/15 border-stone-500/30 text-stone-400",
};

type ViewMode = "spirit" | "awde";

export function HatataMenafsestViewer() {
  const [viewMode, setViewMode] = useState<ViewMode>("spirit");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<SpiritClass | "all">("all");
  const [selectedSpirit, setSelectedSpirit] = useState<SpiritCommentaryEntry>(HATETA_MENAFSEST[0]);
  const [selectedCircle, setSelectedCircle] = useState(1);
  const [langMode, setLangMode] = useState<"am" | "en" | "ge">("am");
  const [expandedSection, setExpandedSection] = useState<"definition" | "prayer" | "signs" | "measures" | null>("definition");

  const filteredSpirits = useMemo(() => {
    const base =
      selectedClass === "all"
        ? HATETA_MENAFSEST
        : HATETA_MENAFSEST.filter((s) => s.spiritClass === selectedClass);
    if (!searchQuery.trim()) return base;
    return searchSpiritCommentary(searchQuery).filter((s) =>
      selectedClass === "all" ? true : s.spiritClass === selectedClass
    );
  }, [searchQuery, selectedClass]);

  const awdeChapter = getAwdeChapter(selectedCircle);

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center gap-3 rounded-2xl border border-stone-800 bg-stone-900/80 p-1.5">
        <button
          onClick={() => setViewMode("spirit")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            viewMode === "spirit"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "text-stone-300 hover:text-amber-200"
          }`}
        >
          <Eye size={16} />
          ሃተታ መናፍስት (Spirit Commentary)
        </button>
        <button
          onClick={() => setViewMode("awde")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            viewMode === "awde"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "text-stone-300 hover:text-amber-200"
          }`}
        >
          <Scroll size={16} />
          አውደ ነገሥት ምዕራፍ (Awde Chapters)
        </button>
      </div>

      {/* ─── SPIRIT COMMENTARY MODE ─────────────────────────────────────── */}
      {viewMode === "spirit" && (
        <div className="space-y-5">
          {/* Search + Language Toggle */}
          <div className="rounded-3xl border border-amber-500/20 bg-stone-900/80 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search spirits (e.g. ሚካኤል, Buda, Shamshemo, evil eye, healing)..."
                  className="w-full rounded-2xl border border-stone-700 bg-stone-950 pl-10 pr-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-400 focus:outline-none transition"
                />
              </div>
              {/* Language Toggle */}
              <div className="flex items-center rounded-xl bg-stone-950 border border-stone-800 p-0.5 shrink-0">
                {(["am", "en", "ge"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLangMode(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      langMode === lang
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {lang === "am" ? "አምኃ" : lang === "en" ? "EN" : "ግዕዝ"}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {SPIRIT_CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id as SpiritClass | "all")}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedClass === cls.id
                      ? "bg-amber-500 text-black font-bold"
                      : "bg-stone-950/70 border border-stone-800 text-stone-300 hover:border-amber-500/30"
                  }`}
                >
                  <span>{cls.icon}</span>
                  <span>{cls.labelAm}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Split: List + Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Spirit List */}
            <div className="lg:col-span-5 space-y-2">
              {filteredSpirits.length === 0 && (
                <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-8 text-center text-stone-400 text-sm">
                  No matching spirit entries.
                </div>
              )}
              {filteredSpirits.map((spirit) => (
                <div
                  key={spirit.id}
                  onClick={() => setSelectedSpirit(spirit)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all group ${
                    selectedSpirit.id === spirit.id
                      ? "bg-gradient-to-br from-amber-950/40 via-stone-900 to-black border-amber-400 shadow-xl shadow-amber-500/10 -translate-y-0.5"
                      : "bg-stone-900/60 border-stone-800 hover:border-amber-500/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Class Icon */}
                    <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-700 flex items-center justify-center text-xl shrink-0">
                      {SPIRIT_CLASSES.find((c) => c.id === spirit.spiritClass)?.icon ?? "✦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border mb-1 ${
                          CLASS_BADGE[spirit.spiritClass]
                        }`}
                      >
                        {spirit.spiritClassLabelEn}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate font-serif group-hover:text-amber-200">
                        {spirit.nameAm}
                      </h4>
                      <p className="text-[11px] text-stone-400 truncate">{spirit.nameEn}</p>
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono shrink-0">
                      ዙር {spirit.awdeCircleMatch}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Spirit Detail Panel */}
            <div className="lg:col-span-7 sticky top-20 space-y-4">
              <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/20 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest border ${CLASS_BADGE[selectedSpirit.spiritClass]}`}>
                        {selectedSpirit.spiritClassLabelAm}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">ዙር {selectedSpirit.awdeCircleMatch}</span>
                    </div>
                    <h3 className="text-2xl font-bold font-serif text-amber-100 mt-2">
                      {selectedSpirit.nameAm}
                    </h3>
                    <p className="text-xs text-amber-300 font-serif italic mt-0.5">{selectedSpirit.nameGe}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{selectedSpirit.nameEn}</p>
                  </div>
                  <div className="text-4xl shrink-0">
                    {SPIRIT_CLASSES.find((c) => c.id === selectedSpirit.spiritClass)?.icon ?? "✦"}
                  </div>
                </div>

                {/* Accordion Sections */}
                {/* 1. Definition / ሃተታ */}
                <AccordionSection
                  title="ሃተታ (Classical Definition)"
                  icon={<BookOpen size={14} />}
                  open={expandedSection === "definition"}
                  onToggle={() => setExpandedSection(expandedSection === "definition" ? null : "definition")}
                >
                  <div className="space-y-3">
                    {langMode !== "en" && (
                      <div className="p-3 rounded-xl bg-stone-950/80 border border-amber-500/20">
                        <span className="text-[10px] uppercase font-mono text-amber-400 block mb-1.5">
                          {langMode === "ge" ? "ግዕዝ ምንጭ" : "አማርኛ ትርጉም"}
                        </span>
                        <p className="text-sm text-amber-100 font-serif leading-relaxed">
                          {langMode === "ge"
                            ? selectedSpirit.hatatDefinitionGe
                            : selectedSpirit.hatatDefinitionAm}
                        </p>
                      </div>
                    )}
                    {langMode !== "ge" && (
                      <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1.5">English</span>
                        <p className="text-sm text-stone-300 leading-relaxed">{selectedSpirit.hatatDefinitionEn}</p>
                      </div>
                    )}
                    {langMode === "ge" && (
                      <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1.5">English</span>
                        <p className="text-sm text-stone-300 leading-relaxed">{selectedSpirit.hatatDefinitionEn}</p>
                      </div>
                    )}
                  </div>
                </AccordionSection>

                {/* 2. Protective Prayer */}
                <AccordionSection
                  title="የጥበቃ ጸሎት (Protective Formula)"
                  icon={<ShieldCheck size={14} />}
                  open={expandedSection === "prayer"}
                  onToggle={() => setExpandedSection(expandedSection === "prayer" ? null : "prayer")}
                >
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-stone-950/90 border border-amber-500/20 text-amber-200 font-serif leading-loose text-sm">
                      {selectedSpirit.protectiveFormulaGe}
                    </div>
                    <p className="text-xs text-stone-400 italic px-1">
                      &ldquo;{selectedSpirit.protectiveFormulaEn}&rdquo;
                    </p>
                  </div>
                </AccordionSection>

                {/* 3. Signs of Manifestation */}
                <AccordionSection
                  title="ምልክቶች (Signs of Manifestation)"
                  icon={<Eye size={14} />}
                  open={expandedSection === "signs"}
                  onToggle={() => setExpandedSection(expandedSection === "signs" ? null : "signs")}
                >
                  <ul className="space-y-2">
                    {selectedSpirit.signsOfManifestationAm.map((sign, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-stone-300">
                        <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionSection>

                {/* 4. Counter Measures */}
                <AccordionSection
                  title="መፍትሔ ወ መከላከያ (Counter Measures)"
                  icon={<Flame size={14} />}
                  open={expandedSection === "measures"}
                  onToggle={() => setExpandedSection(expandedSection === "measures" ? null : "measures")}
                >
                  <div className="flex flex-wrap gap-2">
                    {selectedSpirit.counterMeasures.map((cm, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-[11px]"
                      >
                        ✦ {cm}
                      </span>
                    ))}
                  </div>
                </AccordionSection>

                {/* Source + Disclaimer */}
                <div className="mt-4 rounded-xl bg-stone-950/50 border border-stone-800 p-3 text-[10px] text-stone-500 space-y-1">
                  <p><span className="text-stone-400 font-bold">ምንጭ: </span>{selectedSpirit.sourceManuscript}</p>
                  <p className="text-amber-700/80">{selectedSpirit.culturalDisclaimer}</p>
                </div>

                {/* Link to Telsem */}
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
                  <div>
                    <p className="font-bold text-amber-200">View Associated Telsem Seal</p>
                    <p className="text-stone-500">See the protective talisman for this spirit class</p>
                  </div>
                  <Link
                    href="/library/telsem"
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shrink-0 transition flex items-center gap-1"
                  >
                    ጠልሰም <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── AWDE NEGEST CHAPTER MODE ──────────────────────────────────────── */}
      {viewMode === "awde" && (
        <div className="space-y-5">
          {/* Circle Selector */}
          <div className="rounded-3xl border border-amber-500/20 bg-stone-900/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Globe size={14} />
              Select Awde Negest Circle (አውደ ነገሥት ምዕራፍ)
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {AWDE_NEGEST_CHAPTERS.map((ch) => (
                <button
                  key={ch.circleNumber}
                  onClick={() => setSelectedCircle(ch.circleNumber)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    selectedCircle === ch.circleNumber
                      ? "bg-amber-500 text-black font-bold"
                      : "bg-stone-950 border border-stone-800 text-stone-300 hover:border-amber-500/40"
                  }`}
                >
                  <span className="block font-mono">{ch.circleNumber}</span>
                  <span className="block text-[10px] truncate max-w-[80px]">{ch.circleNameAm}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Detail */}
          {awdeChapter ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Chapter Text trilingual */}
              <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/20 p-6 shadow-2xl space-y-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 block">
                    Circle {awdeChapter.circleNumber} of 16
                  </span>
                  <h3 className="text-2xl font-black font-serif text-amber-100 mt-1">
                    {awdeChapter.circleNameAm}
                  </h3>
                  <p className="text-xs text-amber-300/80 italic mt-0.5">{awdeChapter.circleNameGe}</p>
                  <p className="text-xs text-stone-400">{awdeChapter.circleNameEn}</p>
                </div>

                <div className="rounded-xl bg-stone-950/80 border border-amber-500/20 p-4 space-y-3">
                  <div className="text-[10px] uppercase font-mono text-amber-400">
                    ጠባቂ መልአክ (Guardian Angel)
                  </div>
                  <p className="font-serif font-bold text-amber-200 text-sm">{awdeChapter.guardianAngel}</p>
                  <p className="text-xs text-stone-300">{awdeChapter.guardianAngelAm}</p>
                </div>

                {/* Chapter Text */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-stone-950/90 border border-amber-500/15 text-amber-100/90 font-serif leading-loose text-sm">
                    <span className="text-[10px] uppercase font-mono text-amber-400 block mb-2">ግዕዝ ምዕራፍ</span>
                    {awdeChapter.chapterTextGe}
                  </div>
                  <div className="p-4 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-sm leading-relaxed">
                    <span className="text-[10px] uppercase font-mono text-stone-400 block mb-2">አማርኛ ትርጉም</span>
                    {awdeChapter.chapterTextAm}
                  </div>
                  <div className="p-4 rounded-xl bg-stone-950/50 border border-stone-800 text-stone-300 text-xs leading-relaxed italic">
                    <span className="text-[10px] uppercase font-mono text-stone-500 block mb-1 not-italic">English</span>
                    {awdeChapter.chapterTextEn}
                  </div>
                </div>

                {/* Seasonal + Day/Night */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                    <span className="block text-[10px] uppercase font-mono text-amber-400 mb-1">ዕለተ (Day Ruling)</span>
                    <p className="text-stone-300 leading-relaxed">{awdeChapter.dayRulingAm}</p>
                  </div>
                  <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3">
                    <span className="block text-[10px] uppercase font-mono text-indigo-300 mb-1">ሌሊት (Night Ruling)</span>
                    <p className="text-stone-300 leading-relaxed">{awdeChapter.nightRulingAm}</p>
                  </div>
                </div>

                {/* Proverb */}
                <div className="rounded-xl bg-stone-900/60 border border-stone-800 p-4 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-amber-400">ምሳሌ (Traditional Proverb)</span>
                  <p className="font-serif text-amber-200 text-sm">&laquo;{awdeChapter.amharicProverb}&raquo;</p>
                  <p className="text-xs text-stone-400 italic">{awdeChapter.amharicProverbEn}</p>
                </div>
              </div>

              {/* Right: Prophecy Table + Seasonal */}
              <div className="space-y-5">
                {/* Seasonal Affinity */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <Wind size={14} />
                    ወቅት ስምምነት (Seasonal Affinity)
                  </div>
                  <p className="text-sm text-stone-300">{awdeChapter.seasonalAffinityAm}</p>
                  <p className="text-xs text-stone-500 italic">{awdeChapter.seasonalAffinityEn}</p>
                </div>

                {/* Category Prophecies */}
                <div className="rounded-2xl border border-amber-500/20 bg-stone-900/80 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Star size={14} />
                    ትንቢት በዘርፍ (Prophecy by Category)
                  </div>
                  {awdeChapter.prophesyForCategories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-stone-800 bg-stone-950/60 p-3 space-y-2"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          {cat.categoryAm}
                        </span>
                        <span className="text-[10px] text-stone-500">({cat.categoryEn})</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-stone-300 font-serif leading-relaxed">{cat.outcomeAm}</p>
                        <p className="text-[11px] text-stone-500 italic">{cat.outcomeEn}</p>
                        <p className="text-[10px] text-amber-500/70 font-mono">{cat.outcomeGe}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cultural Disclaimer */}
                <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-3 text-[10px] text-stone-500 flex items-start gap-2">
                  <AlertTriangle size={12} className="shrink-0 text-amber-700/80 mt-0.5" />
                  <span>
                    ሃተታ አውደ ነገሥት: Historical Ethiopian cultural manuscript. Educational use only.
                    Never replaces licensed medical, psychological, or legal services.
                  </span>
                </div>

                {/* Link back to Telsem */}
                <Link
                  href="/library/telsem"
                  className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 p-4 transition group"
                >
                  <div>
                    <p className="font-bold text-amber-200 text-sm">ጠልሰም ማኅደር (Telsem Archive)</p>
                    <p className="text-xs text-stone-400 mt-0.5">View the sacred talisman seals linked to this circle</p>
                  </div>
                  <ArrowRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-stone-800 bg-stone-900/50 p-12 text-center text-stone-400">
              <Scroll size={32} className="mx-auto mb-3 opacity-30" />
              <p>Select a circle above to view its chapter text and prophecies.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Accordion Section Helper ───────────────────────────────────────────────
function AccordionSection({
  title,
  icon,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-stone-800/60 pt-3 mt-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-xs font-bold text-amber-300 uppercase tracking-wider pb-2 hover:text-amber-200 transition"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="mt-2 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}
