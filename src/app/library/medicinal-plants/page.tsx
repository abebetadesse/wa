"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Leaf,
  ShieldAlert,
  MapPin,
  BookOpen,
  FlaskConical,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Flame,
  HeartPulse,
  Stethoscope,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  INTENSIVE_TRADITIONAL_MEDICINES,
  TRADITIONAL_MEDICINE_CATEGORIES,
  filterTraditionalMedicines,
  type TraditionalMedicineItem,
  type TraditionalTherapeuticCategory,
  type SafetyClassification,
} from "@/lib/knowledge/traditionalMedicineDatabase";

const PREPARATION_ICONS: Record<string, string> = {
  decoction: "🍵",
  infusion: "🫖",
  powder: "🥣",
  steam_inhalation: "♨️",
  fumigation: "💨",
  poultice: "🩹",
  oil_ointment: "🧴",
  electuary: "🍯",
  mastication: "🌿",
  fresh_juice: "🧪",
};

export default function MedicinalPlantsPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSafety, setSelectedSafety] = useState<string>("all");
  const [manuscriptOnly, setManuscriptOnly] = useState<boolean>(false);
  const [selectedPlantId, setSelectedPlantId] = useState<string>(
    INTENSIVE_TRADITIONAL_MEDICINES[0]?.id ?? ""
  );

  const filteredMedicines = useMemo(() => {
    return filterTraditionalMedicines({
      query,
      category: selectedCategory,
      safety: selectedSafety,
      manuscriptOnly,
    });
  }, [query, selectedCategory, selectedSafety, manuscriptOnly]);

  const selectedItem: TraditionalMedicineItem = useMemo(() => {
    return (
      INTENSIVE_TRADITIONAL_MEDICINES.find((p) => p.id === selectedPlantId) ??
      filteredMedicines[0] ??
      INTENSIVE_TRADITIONAL_MEDICINES[0]
    );
  }, [selectedPlantId, filteredMedicines]);

  const manuscriptCount = useMemo(() => {
    return INTENSIVE_TRADITIONAL_MEDICINES.filter((m) => !!m.manuscriptReference).length;
  }, []);

  const safeCount = useMemo(() => {
    return INTENSIVE_TRADITIONAL_MEDICINES.filter((m) => m.safetyClassification === "safe_culinary").length;
  }, []);

  return (
    <main className="space-y-8 pb-16">
      {/* Hero Header */}
      <header className="rounded-[28px] border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-stone-950 to-amber-950/30 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.5)] md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-300">
            <Leaf size={14} />
            Materia Medica & Manuscript Herbal
          </div>
          <Link
            href="/safety"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
          >
            <ShieldCheck size={14} />
            Check Herb-Drug Safety Matrix
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="mt-5 max-w-4xl">
          <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl font-serif">
            የኢትዮጵያ ባህላዊ መድኃኒቶች እና ዕፅዋት መዝገብ
          </h1>
          <p className="mt-2 text-xl font-bold tracking-tight text-emerald-400">
            Ethiopian Traditional Medicine & Pharmacopeia Atlas
          </p>
          <p className="mt-4 text-sm leading-relaxed text-stone-300 md:text-base">
            An intensive knowledge repository synthesizing historical manuscript remedies from{" "}
            <span className="font-semibold text-amber-300">መጽሐፈ ፈውስ (Metsehafe Fewus)</span>, authentic
            preparation methods (<span className="font-semibold text-emerald-300">ገቢሮች</span>), and verified modern
            ethnopharmacology monographs from the Ethiopian Public Health Institute (EPHI) and Addis Ababa University.
          </p>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Documented Remedies</div>
            <div className="mt-1 text-2xl font-black text-white font-mono">{INTENSIVE_TRADITIONAL_MEDICINES.length}</div>
            <div className="text-[11px] text-emerald-400">Highland & lowland flora</div>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400">መጽሐፈ ፈውስ Citations</div>
            <div className="mt-1 text-2xl font-black text-amber-300 font-mono">{manuscriptCount}</div>
            <div className="text-[11px] text-amber-400/80">Cross-referenced chapters</div>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Therapeutic Categories</div>
            <div className="mt-1 text-2xl font-black text-white font-mono">
              {Object.keys(TRADITIONAL_MEDICINE_CATEGORIES).length}
            </div>
            <div className="text-[11px] text-stone-400">From colic to bone-setting</div>
          </div>
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Culinary Safe Tonics</div>
            <div className="mt-1 text-2xl font-black text-emerald-300 font-mono">{safeCount}</div>
            <div className="text-[11px] text-emerald-400/80">Everyday teas & nutrition</div>
          </div>
        </div>
      </header>

      {/* Filter & Search Bar */}
      <section className="space-y-4 rounded-[28px] border border-stone-800 bg-stone-900/80 p-5 shadow-lg">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_auto]">
          {/* Text Search */}
          <label className="flex items-center gap-3 rounded-2xl border border-stone-700 bg-stone-950/70 px-4 py-3 text-sm text-stone-300 focus-within:border-emerald-500">
            <Search size={18} className="text-emerald-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Amharic name (ኮሶ, ጤና አዳም), English, Latin, or disease (ወፍ በሽታ, ሳል)..."
              className="w-full bg-transparent text-white placeholder:text-stone-500 focus:outline-none"
            />
          </label>

          {/* Safety Filter */}
          <select
            value={selectedSafety}
            onChange={(e) => setSelectedSafety(e.target.value)}
            className="rounded-2xl border border-stone-700 bg-stone-950/70 px-4 py-3 text-sm text-stone-200 focus:outline-none focus:border-emerald-500"
            aria-label="Filter by safety profile"
          >
            <option value="all">🛡️ All Safety Classifications</option>
            <option value="safe_culinary">🟢 Safe Culinary (ምግብነት ያለው)</option>
            <option value="caution_moderate">🟡 Moderate Caution (ጥንቃቄ የሚሻ)</option>
            <option value="high_risk_potent">🟠 High Potency Purgative (ኃይለኛ)</option>
            <option value="toxic_internal_external_only">🔴 External / Topical Only (ውጫዊ ብቻ)</option>
            <option value="strictly_poisonous">⛔ Poisonous / Restricted (መርዛማ)</option>
          </select>

          {/* Manuscript Only Toggle */}
          <button
            type="button"
            onClick={() => setManuscriptOnly((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              manuscriptOnly
                ? "border-amber-500 bg-amber-500/20 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "border-stone-700 bg-stone-950/70 text-stone-400 hover:text-stone-200"
            }`}
          >
            <BookOpen size={16} className={manuscriptOnly ? "text-amber-400" : "text-stone-500"} />
            መጽሐፈ ፈውስ Citations Only
          </button>
        </div>

        {/* Traditional Therapeutic Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-800/80">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              selectedCategory === "all"
                ? "bg-emerald-500 text-stone-950 font-bold shadow-md"
                : "border border-stone-800 bg-stone-950/50 text-stone-400 hover:text-stone-200 hover:border-stone-700"
            }`}
          >
            🌿 All Categories ({INTENSIVE_TRADITIONAL_MEDICINES.length})
          </button>
          {Object.values(TRADITIONAL_MEDICINE_CATEGORIES).map((cat) => {
            const count = INTENSIVE_TRADITIONAL_MEDICINES.filter(
              (m) => m.primaryCategory === cat.key || (m.secondaryCategories ?? []).includes(cat.key)
            ).length;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                  isSelected
                    ? "bg-emerald-600 text-white font-bold shadow-md"
                    : "border border-stone-800 bg-stone-950/40 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.titleAm}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Grid: Medicine Cards + Detail Panel */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
        {/* Left Column: Traditional Medicine Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-400 px-1">
            <span>
              Showing <span className="font-bold text-white">{filteredMedicines.length}</span> of{" "}
              {INTENSIVE_TRADITIONAL_MEDICINES.length} remedies
            </span>
            {selectedCategory !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="text-emerald-400 hover:underline"
              >
                Clear category filter
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filteredMedicines.map((item) => {
              const isSelected = item.id === selectedPlantId;
              const prepIcon = PREPARATION_ICONS[item.traditionalPreparation.method] ?? "🌿";

              return (
                <article
                  key={item.id}
                  onClick={() => setSelectedPlantId(item.id)}
                  className={`group relative cursor-pointer rounded-[24px] border p-5 transition duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "border-emerald-500 bg-gradient-to-br from-emerald-950/40 to-stone-900/90 shadow-[0_15px_40px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40"
                      : "border-stone-800 bg-stone-900/60 hover:border-emerald-500/50 hover:bg-stone-900/90"
                  }`}
                >
                  <div>
                    {/* Top Meta Badges */}
                    <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider">
                      <span className="rounded-full border border-stone-700 bg-stone-950/60 px-2.5 py-0.5 text-stone-400">
                        {item.growthForm} • {item.botanicalFamily}
                      </span>
                      {item.safetyClassification === "safe_culinary" && (
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-emerald-300 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={10} /> Safe Culinary
                        </span>
                      )}
                      {item.safetyClassification === "caution_moderate" && (
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-amber-300 font-semibold flex items-center gap-1">
                          <AlertTriangle size={10} /> Caution
                        </span>
                      )}
                      {(item.safetyClassification === "high_risk_potent" ||
                        item.safetyClassification === "toxic_internal_external_only" ||
                        item.safetyClassification === "strictly_poisonous") && (
                        <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-red-300 font-semibold flex items-center gap-1">
                          <ShieldAlert size={10} /> Potent / External
                        </span>
                      )}
                    </div>

                    {/* Plant Titles */}
                    <div className="mt-3">
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-black text-white font-serif tracking-tight">
                          {item.amharicName}
                        </h2>
                        {item.geezName && (
                          <span className="text-xs text-amber-400/90 font-serif italic">
                            ({item.geezName})
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-emerald-400">
                        {item.vernacularName}
                      </div>
                      <div className="text-xs italic text-stone-400 mt-0.5">
                        {item.scientificName}
                      </div>
                    </div>

                    {/* Traditional Category & Preparation Mode */}
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-stone-950 border border-stone-800 px-2.5 py-1 text-emerald-300">
                        <span>{prepIcon}</span>
                        <span>{item.traditionalPreparation.methodAmharic}</span>
                      </span>
                      <span className="rounded-lg bg-stone-950 border border-stone-800 px-2.5 py-1 text-stone-300">
                        {item.categoryAmharic}
                      </span>
                    </div>

                    {/* Traditional Indication Preview */}
                    <p className="mt-3 text-xs leading-relaxed text-stone-300 line-clamp-2">
                      {item.traditionalUse}
                    </p>
                  </div>

                  {/* Bottom Footer Info */}
                  <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                    {item.manuscriptReference ? (
                      <span className="inline-flex items-center gap-1 text-amber-300 font-medium font-serif">
                        <BookOpen size={12} />
                        መጽሐፈ ፈውስ (ገጽ {item.manuscriptReference.pageNumber})
                      </span>
                    ) : (
                      <span className="text-stone-500 text-[10px]">EPHI / Ethnobotanical Flora</span>
                    )}

                    <span className="text-emerald-400 group-hover:translate-x-0.5 transition font-semibold inline-flex items-center gap-0.5">
                      Monograph <ChevronRight size={12} />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredMedicines.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-stone-700 bg-stone-900/40 p-12 text-center text-stone-300">
              <Leaf size={32} className="mx-auto text-stone-600 mb-3" />
              <p className="text-base font-semibold text-white">No traditional medicines found</p>
              <p className="text-xs text-stone-400 mt-1">
                Try changing your search terms, safety filter, or category pills.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Deep Monograph Drawer / Panel */}
        <aside className="sticky top-6 rounded-[28px] border border-emerald-500/30 bg-gradient-to-b from-stone-900 via-stone-950 to-black p-6 shadow-2xl space-y-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
          {/* Monograph Top Identity */}
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-emerald-400">
              <span className="flex items-center gap-1.5 font-bold">
                <Leaf size={14} />
                Monograph #{selectedItem.id.slice(0, 14)}
              </span>
              <span className="rounded-full bg-stone-800 px-2 py-0.5 text-stone-300 font-mono">
                {selectedItem.growthForm}
              </span>
            </div>

            <div className="mt-3">
              <h2 className="text-3xl font-black text-white font-serif tracking-tight">
                {selectedItem.amharicName}
              </h2>
              {selectedItem.geezName && (
                <div className="text-xs text-amber-400 font-serif mt-0.5">
                  ግእዝ፡ {selectedItem.geezName}
                </div>
              )}
              <div className="text-base font-bold text-emerald-300 mt-1">
                {selectedItem.vernacularName} ({selectedItem.englishName})
              </div>
              <div className="text-xs italic text-stone-400 font-mono mt-0.5">
                {selectedItem.scientificName} • {selectedItem.botanicalFamily}
              </div>
            </div>
          </div>

          {/* Quick Habitat & Distribution */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-3.5 space-y-1.5 text-xs text-stone-300">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
              <MapPin size={12} className="text-emerald-400" /> Habitat & Ethiopian Distribution
            </div>
            <p className="text-stone-200">{selectedItem.habitat}</p>
            <p className="text-[11px] text-stone-400">
              <span className="text-stone-500">Regions:</span> {selectedItem.location}
            </p>
            <div className="pt-1 flex flex-wrap gap-1">
              {selectedItem.plantParts.map((p) => (
                <span
                  key={p}
                  className="rounded-md border border-stone-700 bg-stone-900 px-2 py-0.5 text-[10px] text-emerald-300"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Traditional Preparation & Geber (አዘገጃጀትና ገቢር) */}
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <FlaskConical size={14} />
                ባህላዊ አዘገጃጀት እና ገቢር (Preparation & Geber)
              </span>
              <span className="text-stone-300 text-xs">
                {PREPARATION_ICONS[selectedItem.traditionalPreparation.method] ?? "🌿"}
              </span>
            </div>
            <div className="text-xs font-semibold text-emerald-200 font-serif">
              ዘዴ፡ {selectedItem.traditionalPreparation.methodAmharic}
            </div>
            <p className="text-xs text-stone-200 leading-relaxed font-serif bg-stone-950/60 p-2.5 rounded-xl border border-emerald-500/15">
              {selectedItem.traditionalPreparation.instructionsAmharic}
            </p>
            <p className="text-[11px] text-stone-300 leading-relaxed italic">
              {selectedItem.traditionalPreparation.instructionsEnglish}
            </p>
            <div className="text-[11px] text-amber-300/90 pt-1">
              <span className="font-semibold text-stone-400">ባህላዊ መጠን (Dosage):</span>{" "}
              {selectedItem.traditionalPreparation.dosageTradition}
            </div>
          </div>

          {/* Manuscript Citation (መጽሐፈ ፈውስ) */}
          {selectedItem.manuscriptReference && (
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-stone-950 p-4 space-y-2">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                <BookOpen size={14} />
                የመጽሐፍ ማጣቀሻ (Manuscript Citation)
              </div>
              <div className="text-xs font-bold text-white font-serif">
                {selectedItem.manuscriptReference.bookTitle}
              </div>
              <div className="text-xs text-amber-400 font-serif">
                {selectedItem.manuscriptReference.chapterOrSection}
              </div>
              {selectedItem.manuscriptReference.notesAmharic && (
                <p className="text-xs text-stone-200 font-serif leading-relaxed italic bg-black/40 p-2.5 rounded-xl border border-amber-500/20">
                  «{selectedItem.manuscriptReference.notesAmharic}»
                </p>
              )}
            </div>
          )}

          {/* Diseases & Indications */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold flex items-center gap-1.5">
              <Stethoscope size={12} className="text-emerald-400" />
              የሚፈውሳቸው ህመሞች (Documented Indications)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedItem.diseasesTreated.map((disease) => (
                <span
                  key={disease}
                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200"
                >
                  {disease}
                </span>
              ))}
            </div>
          </div>

          {/* Modern Biochemical & Active Ingredients */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400" />
              Active Constituents & Mechanisms
            </div>
            <div className="text-xs text-stone-200">
              <span className="text-stone-400 font-semibold">Active:</span>{" "}
              {selectedItem.activeIngredients.join(", ")}
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              <span className="text-stone-500">Phytochemical profile:</span>{" "}
              {selectedItem.biochemicalComposition.join(", ")}
            </p>
            <div className="pt-1.5 border-t border-stone-800 text-[11px] text-emerald-300">
              <span className="font-semibold text-stone-400">Actions:</span>{" "}
              {selectedItem.pharmacologicalActions.join(" • ")}
            </div>
          </div>

          {/* Safety Classification & Contraindications */}
          <div
            className={`rounded-2xl border p-4 space-y-2 ${
              selectedItem.safetyClassification === "safe_culinary"
                ? "border-emerald-500/30 bg-emerald-950/20"
                : selectedItem.safetyClassification === "caution_moderate"
                ? "border-amber-500/30 bg-amber-950/20"
                : "border-red-500/30 bg-red-950/20"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-bold">
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Safety & Contraindications
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 font-mono">
                {selectedItem.safetyClassification}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-stone-200">{selectedItem.safetyNotes}</p>

            {selectedItem.contraindications.length > 0 && (
              <div className="pt-2 text-xs">
                <div className="text-[10px] uppercase tracking-wider text-red-400 font-bold mb-1">
                  Contraindicated in:
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-red-200/90 text-[11px]">
                  {selectedItem.contraindications.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedItem.herbDrugInteractions.length > 0 && (
              <div className="pt-2 border-t border-stone-800 text-xs">
                <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-1">
                  Key Drug Interactions:
                </div>
                {selectedItem.herbDrugInteractions.map((inter) => (
                  <div key={inter.drugClass} className="text-[11px] text-stone-300 py-1">
                    <span className="font-bold text-amber-300">{inter.drugClass}:</span> {inter.effect}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Link to Safety Matrix */}
          <div className="pt-2">
            <Link
              href={`/safety`}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white transition shadow-lg"
            >
              <ShieldCheck size={16} />
              Cross-Check in Safety Matrix
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
