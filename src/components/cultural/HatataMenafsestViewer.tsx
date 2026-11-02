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
  melaek_tsadag: "bg-gold/15 border-gold/30 text-gold-strong",
  melaek_gana: "bg-danger/15 border-danger/30 text-danger-strong",
  buda_ayne: "bg-plum/15 border-plum/30 text-plum-strong",
  melaek_seray: "bg-warning/15 border-warning/30 text-warning-strong",
  zar_ayana: "bg-brand/15 border-brand/30 text-brand-strong",
  melaek_netseha: "bg-info/15 border-info/30 text-info-strong",
  melaek_shetan: "bg-border-strong/15 border-border-strong text-muted-foreground",
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
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-1.5">
        <button
          onClick={() => setViewMode("spirit")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            viewMode === "spirit"
              ? "bg-gold-fill text-gold-foreground shadow-panel"
              : "text-soft hover:text-gold-strong"
          }`}
        >
          <Eye size={16} />
          ሃተታ መናፍስት (Spirit Commentary)
        </button>
        <button
          onClick={() => setViewMode("awde")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            viewMode === "awde"
              ? "bg-gold-fill text-gold-foreground shadow-panel"
              : "text-soft hover:text-gold-strong"
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
          <div className="rounded-3xl border border-gold/20 bg-card/80 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search spirits (e.g. ሚካኤል, Buda, Shamshemo, evil eye, healing)..."
                  className="w-full rounded-2xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-gold focus:outline-none transition"
                />
              </div>
              {/* Language Toggle */}
              <div className="flex items-center rounded-xl bg-background border border-border p-0.5 shrink-0">
                {(["am", "en", "ge"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLangMode(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      langMode === lang
                        ? "bg-gold/20 text-gold-strong border border-gold/30"
                        : "text-muted-foreground hover:text-soft"
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
                      ? "bg-gold-fill text-gold-foreground font-bold"
                      : "bg-background/70 border border-border text-soft hover:border-gold/30"
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
                <div className="rounded-2xl border border-border bg-card/50 p-8 text-center text-muted-foreground text-sm">
                  No matching spirit entries.
                </div>
              )}
              {filteredSpirits.map((spirit) => (
                <div
                  key={spirit.id}
                  onClick={() => setSelectedSpirit(spirit)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all group ${
                    selectedSpirit.id === spirit.id
                      ? "bg-gradient-to-br from-gold-soft via-card to-background border-gold shadow-panel -translate-y-0.5"
                      : "bg-card/60 border-border hover:border-gold/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Class Icon */}
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-xl shrink-0">
                      {SPIRIT_CLASSES.find((c) => c.id === spirit.spiritClass)?.icon ?? "✦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border mb-1 ${
                          CLASS_BADGE[spirit.spiritClass]
                        }`}
                      >
                        {spirit.spiritClassLabelEn}
                      </span>
                      <h4 className="text-sm font-bold text-foreground truncate font-serif group-hover:text-gold-strong">
                        {spirit.nameAm}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">{spirit.nameEn}</p>
                    </div>
                    <div className="text-[10px] text-subtle font-mono shrink-0">
                      ዙር {spirit.awdeCircleMatch}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Spirit Detail Panel */}
            <div className="lg:col-span-7 sticky top-20 space-y-4">
              <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-background via-card to-gold-soft p-6 shadow-raised">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${CLASS_BADGE[selectedSpirit.spiritClass]}`}>
                        {selectedSpirit.spiritClassLabelAm}
                      </span>
                      <span className="text-[10px] text-subtle font-mono">ዙር {selectedSpirit.awdeCircleMatch}</span>
                    </div>
                    <h3 className="text-2xl font-bold font-serif text-gold-strong mt-2">
                      {selectedSpirit.nameAm}
                    </h3>
                    <p className="text-xs text-gold font-serif italic mt-0.5">{selectedSpirit.nameGe}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedSpirit.nameEn}</p>
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
                      <div className="p-3 rounded-xl bg-background/80 border border-gold/20">
                        <span className="text-[10px] uppercase text-gold block mb-1.5">
                          {langMode === "ge" ? "ግዕዝ ምንጭ" : "አማርኛ ትርጉም"}
                        </span>
                        <p className="text-sm text-gold-strong font-serif leading-relaxed">
                          {langMode === "ge"
                            ? selectedSpirit.hatatDefinitionGe
                            : selectedSpirit.hatatDefinitionAm}
                        </p>
                      </div>
                    )}
                    {langMode !== "ge" && (
                      <div className="p-3 rounded-xl bg-card border border-border">
                        <span className="text-[10px] uppercase text-muted-foreground block mb-1.5">English</span>
                        <p className="text-sm text-soft leading-relaxed">{selectedSpirit.hatatDefinitionEn}</p>
                      </div>
                    )}
                    {langMode === "ge" && (
                      <div className="p-3 rounded-xl bg-card border border-border">
                        <span className="text-[10px] uppercase text-muted-foreground block mb-1.5">English</span>
                        <p className="text-sm text-soft leading-relaxed">{selectedSpirit.hatatDefinitionEn}</p>
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
                    <div className="p-4 rounded-xl bg-background/90 border border-gold/20 text-gold-strong font-serif leading-loose text-sm">
                      {selectedSpirit.protectiveFormulaGe}
                    </div>
                    <p className="text-xs text-muted-foreground italic px-1">
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
                      <li key={i} className="flex items-start gap-2 text-xs text-soft">
                        <span className="text-gold font-bold shrink-0 mt-0.5">•</span>
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
                        className="px-2.5 py-1.5 rounded-xl bg-card border border-border text-soft text-[11px]"
                      >
                        ✦ {cm}
                      </span>
                    ))}
                  </div>
                </AccordionSection>

                {/* Source + Disclaimer */}
                <div className="mt-4 rounded-xl bg-background/50 border border-border p-3 text-[10px] text-subtle space-y-1">
                  <p><span className="text-muted-foreground font-bold">ምንጭ: </span>{selectedSpirit.sourceManuscript}</p>
                  <p className="text-gold-strong">{selectedSpirit.culturalDisclaimer}</p>
                </div>

                {/* Link to Telsem */}
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-gold/30 bg-gold/5 p-3 text-xs">
                  <div>
                    <p className="font-bold text-gold-strong">View Associated Telsem Seal</p>
                    <p className="text-subtle">See the protective talisman for this spirit class</p>
                  </div>
                  <Link
                    href="/library/telsem"
                    className="px-3 py-1.5 rounded-xl bg-gold-fill hover:bg-gold-fill text-gold-foreground font-bold shrink-0 transition flex items-center gap-1"
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
          <div className="rounded-3xl border border-gold/20 bg-card/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-wider">
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
                      ? "bg-gold-fill text-gold-foreground font-bold"
                      : "bg-background border border-border text-soft hover:border-gold/40"
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
              <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-background via-card to-gold-soft p-6 shadow-raised space-y-5">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gold block">
                    Circle {awdeChapter.circleNumber} of 16
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-gold-strong mt-1">
                    {awdeChapter.circleNameAm}
                  </h3>
                  <p className="text-xs text-gold italic mt-0.5">{awdeChapter.circleNameGe}</p>
                  <p className="text-xs text-muted-foreground">{awdeChapter.circleNameEn}</p>
                </div>

                <div className="rounded-xl bg-background/80 border border-gold/20 p-4 space-y-3">
                  <div className="text-[10px] uppercase text-gold">
                    ጠባቂ መልአክ (Guardian Angel)
                  </div>
                  <p className="font-serif font-bold text-gold-strong text-sm">{awdeChapter.guardianAngel}</p>
                  <p className="text-xs text-soft">{awdeChapter.guardianAngelAm}</p>
                </div>

                {/* Chapter Text */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-background/90 border border-gold/15 text-gold-strong font-serif leading-loose text-sm">
                    <span className="text-[10px] uppercase text-gold block mb-2">ግዕዝ ምዕራፍ</span>
                    {awdeChapter.chapterTextGe}
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border text-soft text-sm leading-relaxed">
                    <span className="text-[10px] uppercase text-muted-foreground block mb-2">አማርኛ ትርጉም</span>
                    {awdeChapter.chapterTextAm}
                  </div>
                  <div className="p-4 rounded-xl bg-background/50 border border-border text-soft text-xs leading-relaxed italic">
                    <span className="text-[10px] uppercase text-subtle block mb-1 not-italic">English</span>
                    {awdeChapter.chapterTextEn}
                  </div>
                </div>

                {/* Seasonal + Day/Night */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-gold/10 border border-gold/20 p-3">
                    <span className="block text-[10px] uppercase text-gold mb-1">ዕለተ (Day Ruling)</span>
                    <p className="text-soft leading-relaxed">{awdeChapter.dayRulingAm}</p>
                  </div>
                  <div className="rounded-xl bg-info/10 border border-info/20 p-3">
                    <span className="block text-[10px] uppercase text-info mb-1">ሌሊት (Night Ruling)</span>
                    <p className="text-soft leading-relaxed">{awdeChapter.nightRulingAm}</p>
                  </div>
                </div>

                {/* Proverb */}
                <div className="rounded-xl bg-card/60 border border-border p-4 space-y-1">
                  <span className="text-[10px] uppercase text-gold">ምሳሌ (Traditional Proverb)</span>
                  <p className="font-serif text-gold-strong text-sm">&laquo;{awdeChapter.amharicProverb}&raquo;</p>
                  <p className="text-xs text-muted-foreground italic">{awdeChapter.amharicProverbEn}</p>
                </div>
              </div>

              {/* Right: Prophecy Table + Seasonal */}
              <div className="space-y-5">
                {/* Seasonal Affinity */}
                <div className="rounded-2xl border border-brand/20 bg-brand-soft p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand">
                    <Wind size={14} />
                    ወቅት ስምምነት (Seasonal Affinity)
                  </div>
                  <p className="text-sm text-soft">{awdeChapter.seasonalAffinityAm}</p>
                  <p className="text-xs text-subtle italic">{awdeChapter.seasonalAffinityEn}</p>
                </div>

                {/* Category Prophecies */}
                <div className="rounded-2xl border border-gold/20 bg-card/80 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gold">
                    <Star size={14} />
                    ትንቢት በዘርፍ (Prophecy by Category)
                  </div>
                  {awdeChapter.prophesyForCategories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-background/60 p-3 space-y-2"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider text-gold-strong bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">
                          {cat.categoryAm}
                        </span>
                        <span className="text-[10px] text-subtle">({cat.categoryEn})</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-soft font-serif leading-relaxed">{cat.outcomeAm}</p>
                        <p className="text-[11px] text-subtle italic">{cat.outcomeEn}</p>
                        <p className="text-[10px] text-gold font-mono">{cat.outcomeGe}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cultural Disclaimer */}
                <div className="rounded-xl border border-border bg-background/60 p-3 text-[10px] text-subtle flex items-start gap-2">
                  <AlertTriangle size={12} className="shrink-0 text-gold-strong mt-0.5" />
                  <span>
                    ሃተታ አውደ ነገሥት: Historical Ethiopian cultural manuscript. Educational use only.
                    Never replaces licensed medical, psychological, or legal services.
                  </span>
                </div>

                {/* Link back to Telsem */}
                <Link
                  href="/library/telsem"
                  className="flex items-center justify-between rounded-2xl border border-gold/30 bg-gold/5 hover:bg-gold/10 p-4 transition group"
                >
                  <div>
                    <p className="font-bold text-gold-strong text-sm">ጠልሰም ማኅደር (Telsem Archive)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">View the sacred talisman seals linked to this circle</p>
                  </div>
                  <ArrowRight size={16} className="text-gold group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card/50 p-12 text-center text-muted-foreground">
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
    <div className="border-t border-border pt-3 mt-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-xs font-bold text-gold uppercase tracking-wider pb-2 hover:text-gold-strong transition"
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
