"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { assetUrl } from "@/lib/base-path";

const PREPARATION_ICONS: Record<string, string> = {
  decoction: "��",
  infusion: "��",
  powder: "��",
  steam_inhalation: "♨️",
  fumigation: "��",
  poultice: "��",
  oil_ointment: "��",
  electuary: "��",
  mastication: "��",
  fresh_juice: "��",
};

function PlantPhoto({
  item,
  imageClassName,
}: {
  item: TraditionalMedicineItem;
  imageClassName: string;
}) {
  return (
    <figure className="mt-3 overflow-hidden rounded-2xl border border-border bg-background/80">
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.imageAlt ?? `${item.vernacularName} (${item.scientificName}) plant photograph`}
          width={800}
          height={550}
          className={imageClassName}
          unoptimized
          loading="lazy"
        />
      ) : (
        <div
          className={`${imageClassName} flex flex-col items-center justify-center gap-1 text-subtle`}
          role="img"
          aria-label={`No photograph available for ${item.vernacularName}`}
        >
          <Leaf size={20} aria-hidden="true" />
          <span className="text-[10px]">Photo unavailable</span>
        </div>
      )}
      {(item.imageAttribution || item.imageLicenseUrl) && (
        <figcaption className="flex flex-wrap items-center gap-x-1 px-2.5 py-1.5 text-[9px] leading-tight text-muted-foreground">
          {item.imageAttribution && (
            <a href={assetUrl(item.imageSourceUrl)} target="_blank" rel="noreferrer" className="hover:text-soft">
              {item.imageAttribution}
            </a>
          )}
          {item.imageLicenseUrl && (
            <a href={assetUrl(item.imageLicenseUrl)} target="_blank" rel="noreferrer" className="underline hover:text-soft">
              License
            </a>
          )}
        </figcaption>
      )}
    </figure>
  );
}

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
      <header className="rounded-[28px] border border-brand/20 bg-gradient-to-br from-brand-soft via-background to-gold-soft p-8 shadow-[0_25px_80px_rgba(0,0,0,0.5)] md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-strong">
            <Leaf size={14} />
            Materia Medica & Manuscript Herbal
          </div>
          <Link
            href="/safety"
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium text-gold-strong transition hover:bg-gold/20"
          >
            <ShieldCheck size={14} />
            Check Herb-Drug Safety Matrix
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="mt-5 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl font-serif">
            የኢትዮጵያ ባህላዊ መድኃኒቶች እና ዕፅዋት መዝገብ
          </h1>
          <p className="mt-2 text-xl font-bold tracking-tight text-brand">
            Ethiopian Traditional Medicine & Pharmacopeia Atlas
          </p>
          <p className="mt-4 text-sm leading-relaxed text-soft md:text-base">
            An intensive knowledge repository synthesizing historical manuscript remedies from{" "}
            <span className="font-semibold text-gold">መጽሐፈ ፈውስ (Metsehafe Fewus)</span>, authentic
            preparation methods (<span className="font-semibold text-brand">ገቢሮች</span>), and verified modern
            ethnopharmacology monographs from the Ethiopian Public Health Institute (EPHI) and Addis Ababa University.
          </p>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Documented Remedies</div>
            <div className="mt-1 text-2xl font-bold text-foreground font-mono">{INTENSIVE_TRADITIONAL_MEDICINES.length}</div>
            <div className="text-[11px] text-brand">Highland & lowland flora</div>
          </div>
          <div className="rounded-2xl border border-border bg-card/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">መጽሐፈ ፈውስ Citations</div>
            <div className="mt-1 text-2xl font-bold text-gold font-mono">{manuscriptCount}</div>
            <div className="text-[11px] text-gold">Cross-referenced chapters</div>
          </div>
          <div className="rounded-2xl border border-border bg-card/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Therapeutic Categories</div>
            <div className="mt-1 text-2xl font-bold text-foreground font-mono">
              {Object.keys(TRADITIONAL_MEDICINE_CATEGORIES).length}
            </div>
            <div className="text-[11px] text-muted-foreground">From colic to bone-setting</div>
          </div>
          <div className="rounded-2xl border border-border bg-card/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Culinary Safe Tonics</div>
            <div className="mt-1 text-2xl font-bold text-brand font-mono">{safeCount}</div>
            <div className="text-[11px] text-brand">Everyday teas & nutrition</div>
          </div>
        </div>
      </header>

      {/* Filter & Search Bar */}
      <section className="space-y-4 rounded-[28px] border border-border bg-card/80 p-5 shadow-panel">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_auto]">
          {/* Text Search */}
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-soft focus-within:border-brand">
            <Search size={18} className="text-brand shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Amharic name (ኮሶ, ጤና አዳም), English, Latin, or disease (ወፍ በሽታ, ሳል)..."
              className="w-full bg-transparent text-foreground placeholder:text-subtle focus:outline-none"
            />
          </label>

          {/* Safety Filter */}
          <select
            value={selectedSafety}
            onChange={(e) => setSelectedSafety(e.target.value)}
            className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-soft focus:outline-none focus:border-brand"
            aria-label="Filter by safety profile"
          >
            <option value="all">��️ All Safety Classifications</option>
            <option value="safe_culinary">�� Safe Culinary (ምግብነት ያለው)</option>
            <option value="caution_moderate">�� Moderate Caution (ጥንቃቄ የሚሻ)</option>
            <option value="high_risk_potent">�� High Potency Purgative (ኃይለኛ)</option>
            <option value="toxic_internal_external_only">�� External / Topical Only (ውጫዊ ብቻ)</option>
            <option value="strictly_poisonous">⛔ Poisonous / Restricted (መርዛማ)</option>
          </select>

          {/* Manuscript Only Toggle */}
          <button
            type="button"
            onClick={() => setManuscriptOnly((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              manuscriptOnly
                ? "border-gold bg-gold/20 text-gold-strong"
                : "border-border bg-background/70 text-muted-foreground hover:text-soft"
            }`}
          >
            <BookOpen size={16} className={manuscriptOnly ? "text-gold" : "text-subtle"} />
            መጽሐፈ ፈውስ Citations Only
          </button>
        </div>

        {/* Traditional Therapeutic Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              selectedCategory === "all"
                ? "bg-brand text-brand-foreground font-bold shadow-md"
                : "border border-border bg-background/50 text-muted-foreground hover:text-soft hover:border-border"
            }`}
          >
            �� All Categories ({INTENSIVE_TRADITIONAL_MEDICINES.length})
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
                    ? "bg-brand text-brand-foreground font-bold shadow-md"
                    : "border border-border bg-background/40 text-muted-foreground hover:text-soft hover:border-border"
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
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Showing <span className="font-bold text-foreground">{filteredMedicines.length}</span> of{" "}
              {INTENSIVE_TRADITIONAL_MEDICINES.length} remedies
            </span>
            {selectedCategory !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="text-brand hover:underline"
              >
                Clear category filter
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filteredMedicines.map((item) => {
              const isSelected = item.id === selectedPlantId;
              const prepIcon = PREPARATION_ICONS[item.traditionalPreparation.method] ?? "��";

              return (
                <article
                  key={item.id}
                  onClick={() => setSelectedPlantId(item.id)}
                  className={`group relative cursor-pointer rounded-[24px] border p-5 transition duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "border-brand bg-gradient-to-br from-brand-soft to-card/90 shadow-[0_15px_40px_rgba(16,185,129,0.15)] ring-1 ring-brand/40"
                      : "border-border bg-card/60 hover:border-brand/50 hover:bg-card/90"
                  }`}
                >
                  <div>
                    {/* Top Meta Badges */}
                    <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider">
                      <span className="rounded-full border border-border bg-background/60 px-2.5 py-0.5 text-muted-foreground">
                        {item.growthForm} • {item.botanicalFamily}
                      </span>
                      {item.safetyClassification === "safe_culinary" && (
                        <span className="rounded-full bg-brand/10 border border-brand/30 px-2 py-0.5 text-brand-strong font-semibold flex items-center gap-1">
                          <CheckCircle2 size={10} /> Safe Culinary
                        </span>
                      )}
                      {item.safetyClassification === "caution_moderate" && (
                        <span className="rounded-full bg-gold/10 border border-gold/30 px-2 py-0.5 text-gold-strong font-semibold flex items-center gap-1">
                          <AlertTriangle size={10} /> Caution
                        </span>
                      )}
                      {(item.safetyClassification === "high_risk_potent" ||
                        item.safetyClassification === "toxic_internal_external_only" ||
                        item.safetyClassification === "strictly_poisonous") && (
                        <span className="rounded-full bg-danger/10 border border-danger/30 px-2 py-0.5 text-danger-strong font-semibold flex items-center gap-1">
                          <ShieldAlert size={10} /> Potent / External
                        </span>
                      )}
                    </div>

                    <PlantPhoto item={item} imageClassName="h-28 w-full object-cover" />

                    {/* Plant Titles */}
                    <div className="mt-3">
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-bold text-foreground font-serif tracking-tight">
                          {item.amharicName}
                        </h2>
                        {item.geezName && (
                          <span className="text-xs text-gold font-serif italic">
                            ({item.geezName})
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-brand">
                        {item.vernacularName}
                      </div>
                      <div className="text-xs italic text-muted-foreground mt-0.5">
                        {item.scientificName}
                      </div>
                    </div>

                    {/* Traditional Category & Preparation Mode */}
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-background border border-border px-2.5 py-1 text-brand">
                        <span>{prepIcon}</span>
                        <span>{item.traditionalPreparation.methodAmharic}</span>
                      </span>
                      <span className="rounded-lg bg-background border border-border px-2.5 py-1 text-soft">
                        {item.categoryAmharic}
                      </span>
                    </div>

                    {/* Traditional Indication Preview */}
                    <p className="mt-3 text-xs leading-relaxed text-soft line-clamp-2">
                      {item.traditionalUse}
                    </p>
                  </div>

                  {/* Bottom Footer Info */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                    {item.manuscriptReference ? (
                      <span className="inline-flex items-center gap-1 text-gold font-medium font-serif">
                        <BookOpen size={12} />
                        መጽሐፈ ፈውስ (ገጽ {item.manuscriptReference.pageNumber})
                      </span>
                    ) : (
                      <span className="text-subtle text-[10px]">EPHI / Ethnobotanical Flora</span>
                    )}

                    <span className="text-brand group-hover:translate-x-0.5 transition font-semibold inline-flex items-center gap-0.5">
                      Monograph <ChevronRight size={12} />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredMedicines.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-border bg-card/40 p-12 text-center text-soft">
              <Leaf size={32} className="mx-auto text-subtle mb-3" />
              <p className="text-base font-semibold text-foreground">No traditional medicines found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try changing your search terms, safety filter, or category pills.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Deep Monograph Drawer / Panel */}
        <aside className="sticky top-6 rounded-[28px] border border-brand/30 bg-gradient-to-b from-card via-background to-background p-6 shadow-raised space-y-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
          {/* Monograph Top Identity */}
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-brand">
              <span className="flex items-center gap-1.5 font-bold">
                <Leaf size={14} />
                Monograph #{selectedItem.id.slice(0, 14)}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-soft font-mono">
                {selectedItem.growthForm}
              </span>
            </div>

            <PlantPhoto item={selectedItem} imageClassName="h-40 w-full object-cover" />

            <div className="mt-3">
              <h2 className="text-3xl font-bold text-foreground font-serif tracking-tight">
                {selectedItem.amharicName}
              </h2>
              {selectedItem.geezName && (
                <div className="text-xs text-gold font-serif mt-0.5">
                  ግእዝ፡ {selectedItem.geezName}
                </div>
              )}
              <div className="text-base font-bold text-brand mt-1">
                {selectedItem.vernacularName} ({selectedItem.englishName})
              </div>
              <div className="text-xs italic text-muted-foreground font-mono mt-0.5">
                {selectedItem.scientificName} • {selectedItem.botanicalFamily}
              </div>
            </div>
          </div>

          {/* Quick Habitat & Distribution */}
          <div className="rounded-2xl border border-border bg-background/70 p-3.5 space-y-1.5 text-xs text-soft">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              <MapPin size={12} className="text-brand" /> Habitat & Ethiopian Distribution
            </div>
            <p className="text-soft">{selectedItem.habitat}</p>
            <p className="text-[11px] text-muted-foreground">
              <span className="text-subtle">Regions:</span> {selectedItem.location}
            </p>
            <div className="pt-1 flex flex-wrap gap-1">
              {selectedItem.plantParts.map((p) => (
                <span
                  key={p}
                  className="rounded-md border border-border bg-card px-2 py-0.5 text-[10px] text-brand"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Traditional Preparation & Geber (አዘገጃጀትና ገቢር) */}
          <div className="rounded-2xl border border-brand/25 bg-brand-soft p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-brand font-bold">
              <span className="flex items-center gap-1.5">
                <FlaskConical size={14} />
                ባህላዊ አዘገጃጀት እና ገቢር (Preparation & Geber)
              </span>
              <span className="text-soft text-xs">
                {PREPARATION_ICONS[selectedItem.traditionalPreparation.method] ?? "��"}
              </span>
            </div>
            <div className="text-xs font-semibold text-brand-strong font-serif">
              ዘዴ፡ {selectedItem.traditionalPreparation.methodAmharic}
            </div>
            <p className="text-xs text-soft leading-relaxed font-serif bg-background/60 p-2.5 rounded-xl border border-brand/15">
              {selectedItem.traditionalPreparation.instructionsAmharic}
            </p>
            <p className="text-[11px] text-soft leading-relaxed italic">
              {selectedItem.traditionalPreparation.instructionsEnglish}
            </p>
            <div className="text-[11px] text-gold pt-1">
              <span className="font-semibold text-muted-foreground">ባህላዊ መጠን (Dosage):</span>{" "}
              {selectedItem.traditionalPreparation.dosageTradition}
            </div>
          </div>

          {/* Manuscript Citation (መጽሐፈ ፈውስ) */}
          {selectedItem.manuscriptReference && (
            <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold-soft to-background p-4 space-y-2">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-gold font-bold">
                <BookOpen size={14} />
                የመጽሐፍ ማጣቀሻ (Manuscript Citation)
              </div>
              <div className="text-xs font-bold text-foreground font-serif">
                {selectedItem.manuscriptReference.bookTitle}
              </div>
              <div className="text-xs text-gold font-serif">
                {selectedItem.manuscriptReference.chapterOrSection}
              </div>
              {selectedItem.manuscriptReference.notesAmharic && (
                <p className="text-xs text-soft font-serif leading-relaxed italic bg-sunken/80 p-2.5 rounded-xl border border-gold/20">
                  «{selectedItem.manuscriptReference.notesAmharic}»
                </p>
              )}
            </div>
          )}

          {/* Diseases & Indications */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Stethoscope size={12} className="text-brand" />
              የሚፈውሳቸው ህመሞች (Documented Indications)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedItem.diseasesTreated.map((disease) => (
                <span
                  key={disease}
                  className="rounded-lg border border-brand/20 bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand-strong"
                >
                  {disease}
                </span>
              ))}
            </div>
          </div>

          {/* Modern Biochemical & Active Ingredients */}
          <div className="rounded-2xl border border-border bg-background/70 p-4 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Sparkles size={12} className="text-gold" />
              Active Constituents & Mechanisms
            </div>
            <div className="text-xs text-soft">
              <span className="text-muted-foreground font-semibold">Active:</span>{" "}
              {selectedItem.activeIngredients.join(", ")}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="text-subtle">Phytochemical profile:</span>{" "}
              {selectedItem.biochemicalComposition.join(", ")}
            </p>
            <div className="pt-1.5 border-t border-border text-[11px] text-brand">
              <span className="font-semibold text-muted-foreground">Actions:</span>{" "}
              {selectedItem.pharmacologicalActions.join(" • ")}
            </div>
          </div>

          {/* Safety Classification & Contraindications */}
          <div
            className={`rounded-2xl border p-4 space-y-2 ${
              selectedItem.safetyClassification === "safe_culinary"
                ? "border-brand/30 bg-brand-soft"
                : selectedItem.safetyClassification === "caution_moderate"
                ? "border-gold/30 bg-gold-soft"
                : "border-danger/30 bg-danger-soft"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-bold">
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Safety & Contraindications
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sunken/80 font-mono">
                {selectedItem.safetyClassification}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-soft">{selectedItem.safetyNotes}</p>

            {selectedItem.contraindications.length > 0 && (
              <div className="pt-2 text-xs">
                <div className="text-[10px] uppercase tracking-wider text-danger font-bold mb-1">
                  Contraindicated in:
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-danger-strong text-[11px]">
                  {selectedItem.contraindications.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedItem.herbDrugInteractions.length > 0 && (
              <div className="pt-2 border-t border-border text-xs">
                <div className="text-[10px] uppercase tracking-wider text-gold font-bold mb-1">
                  Key Drug Interactions:
                </div>
                {selectedItem.herbDrugInteractions.map((inter) => (
                  <div key={inter.drugClass} className="text-[11px] text-soft py-1">
                    <span className="font-bold text-gold">{inter.drugClass}:</span> {inter.effect}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Link to Safety Matrix */}
          <div className="pt-2">
            <Link
              href={`/safety`}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand hover:bg-brand py-3 text-xs font-bold text-brand-foreground transition shadow-panel"
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
