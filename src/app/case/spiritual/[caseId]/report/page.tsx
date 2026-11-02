"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AwdeCircleVisualizer } from "@/components/cultural/AwdeCircleVisualizer";
import { TelsemSacredSeal } from "@/components/cultural/TelsemSacredSeal";
import { TelsemScrollCanvas } from "@/components/cultural/TelsemScrollCanvas";
import { getTelsemForArchetype } from "@/lib/cultural/telsemData";
import { getAwdeChapter, getAllSpiritCommentary } from "@/lib/cultural/hatataMenafsest";
import { withBasePath } from '@/lib/base-path';

export default function SpiritualReportPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const router = useRouter();
  const { caseId } = use(params);

  const [activeTab, setActiveTab] = useState<"report" | "scroll" | "context" | "hatata">("report");
  const [isPrintView, setIsPrintView] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draftReport, setDraftReport] = useState<any>(null);

  useEffect(() => {
    if (!isPrintView) return;

    const handleAfterPrint = () => setIsPrintView(false);
    window.addEventListener("afterprint", handleAfterPrint);
    const timeout = window.setTimeout(() => window.print(), 250);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [isPrintView]);

  useEffect(() => {
    let active = true;
    fetch(withBasePath(`/api/case/spiritual/${caseId}/report`), { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        if (response.status === 402) {
          router.replace(`/case/spiritual/${caseId}/preview`);
          return null;
        }
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error || "The full report is unavailable.");
        return payload.data;
      })
      .then((data) => {
        if (active && data) {
          setReportData(data);
          setDraftReport(data.report ?? null);
        }
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "The full report is unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [caseId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-gold gap-3">
        <span className="text-4xl animate-spin">📜</span>
        <p className="text-sm font-mono">Unsealing Your Sacred Reading...</p>
      </div>
    );
  }

  if (error || !reportData?.report) {
    return (
      <main className="min-h-screen bg-background px-4 py-12 text-foreground">
        <div className="mx-auto max-w-2xl rounded-3xl border border-gold/30 bg-card p-6">
          <h1 className="text-xl font-bold text-gold-strong">Report unavailable</h1>
          <p role="alert" className="mt-3 text-sm text-soft">{error || "The released report could not be loaded."}</p>
          <Link href={`/case/spiritual/${caseId}/preview`} className="mt-5 inline-flex rounded-xl bg-gold-fill px-4 py-3 text-sm font-bold text-gold-foreground">
            Return to reading preview
          </Link>
        </div>
      </main>
    );
  }

  const report = reportData?.report;
  const gematria = reportData?.gematria;
  const canDownloadPdf = reportData?.canDownloadPdf === true;
  const canEdit = reportData?.canEdit === true;
  const expert = reportData?.assignedExpert || report?.expert;
  const selectedService = report?.serviceChoice;

  const handleSaveReport = async () => {
    if (!draftReport || !canEdit) return;
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(withBasePath(`/api/case/spiritual/${caseId}/report`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerId: reportData?.reviewerId ?? null,
          report: draftReport,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "The report could not be saved.");
      }

      setReportData((previous: any) => ({
        ...previous,
        report: payload.data.report,
        reviewerId: payload.data.reviewerId ?? previous?.reviewerId ?? null,
        canEdit: payload.data.canEdit ?? previous?.canEdit,
      }));
      setDraftReport(payload.data.report ?? draftReport);
      setIsEditing(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The report could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="spiritual-report-page min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-wider">
              <span>✓ Released reading</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-gold-strong mt-1">
              Spiritual & Life Direction Reading
            </h1>
            <p className="text-xs text-soft mt-0.5">
              {expert
                ? <>Reviewed by <span className="text-gold font-bold">{expert.name}</span>, {expert.credential}</>
                : "Cultural reflection generated from the answers you provided."}
            </p>
          </div>

          <div className="flex items-center gap-2 print-hidden">
            {canDownloadPdf && (
              <button
                type="button"
                onClick={() => setIsPrintView(true)}
                className="px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted text-xs font-medium text-soft transition-colors flex items-center gap-1.5"
                title="Choose Save as PDF in the print dialog"
              >
                <span>⬇️</span> <span>Download PDF</span>
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    setDraftReport(report);
                    setIsEditing(false);
                    return;
                  }
                  setIsEditing(true);
                }}
                className="px-4 py-2 rounded-xl bg-gold-fill hover:bg-gold-fill text-gold-foreground text-xs font-bold transition-all shadow-md"
              >
                {isEditing ? "Cancel edit" : "Edit report"}
              </button>
            )}
            <Link
              href={`/case/spiritual/${caseId}/consult`}
              className="px-4 py-2 rounded-xl bg-gold-fill hover:bg-gold-fill text-gold-foreground text-xs font-bold transition-all shadow-md"
            >
              Book Consultation →
            </Link>
          </div>
        </div>

        {isEditing && canEdit && (
          <div className="rounded-3xl border border-gold/30 bg-card p-6 space-y-5 print-hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold">Editor mode</div>
                <h2 className="mt-2 text-xl font-bold text-gold-strong">Update report content</h2>
              </div>
              <button
                type="button"
                onClick={handleSaveReport}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-brand hover:bg-brand text-brand-foreground text-xs font-bold transition-all shadow-md disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                Divination summary narrative
                <textarea
                  value={draftReport?.divinationSummary?.narrative ?? ""}
                  onChange={(event) => setDraftReport((previous: any) => ({
                    ...previous,
                    divinationSummary: {
                      ...previous?.divinationSummary,
                      narrative: event.target.value,
                    },
                  }))}
                  className="mt-2 min-h-[120px] w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground"
                />
              </label>

              <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                Cultural interpretation
                <textarea
                  value={draftReport?.culturalInterpretation?.narrative ?? ""}
                  onChange={(event) => setDraftReport((previous: any) => ({
                    ...previous,
                    culturalInterpretation: {
                      ...previous?.culturalInterpretation,
                      narrative: event.target.value,
                    },
                  }))}
                  className="mt-2 min-h-[160px] w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground"
                />
              </label>

              <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                Expert notes
                <textarea
                  value={draftReport?.practicalGuidance?.expertNotes ?? ""}
                  onChange={(event) => setDraftReport((previous: any) => ({
                    ...previous,
                    practicalGuidance: {
                      ...previous?.practicalGuidance,
                      expertNotes: event.target.value,
                    },
                  }))}
                  className="mt-2 min-h-[120px] w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground"
                />
              </label>

              <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                Ritual title
                <input
                  value={draftReport?.recommendedRitual?.title ?? ""}
                  onChange={(event) => setDraftReport((previous: any) => ({
                    ...previous,
                    recommendedRitual: {
                      ...previous?.recommendedRitual,
                      title: event.target.value,
                    },
                  }))}
                  className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground"
                />
              </label>

              <label className="text-xs uppercase tracking-wider text-muted-foreground block">
                Ritual description
                <textarea
                  value={draftReport?.recommendedRitual?.description ?? ""}
                  onChange={(event) => setDraftReport((previous: any) => ({
                    ...previous,
                    recommendedRitual: {
                      ...previous?.recommendedRitual,
                      description: event.target.value,
                    },
                  }))}
                  className="mt-2 min-h-[120px] w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground"
                />
              </label>
            </div>
          </div>
        )}

        {selectedService && (
          <div className="print-section rounded-3xl border border-gold/30 bg-gradient-to-r from-gold/10 via-card to-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold">Selected service</div>
                <h2 className="mt-2 text-2xl font-bold text-gold-strong">{selectedService.title}</h2>
              </div>
              <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-strong">
                {selectedService.label}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-soft">“{selectedService.prayer}”</p>
            {selectedService.prayerGe && <p className="mt-3 text-sm italic text-brand-strong">{selectedService.prayerGe}</p>}
            {selectedService.telsemName && (
              <div className="mt-4 rounded-2xl border border-brand/30 bg-brand/5 p-3 text-sm text-brand-strong">
                Linked Telsem: {selectedService.telsemName}
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="print-hidden flex border-b border-border gap-2 text-sm font-medium overflow-x-auto pb-1">
          {[
            { id: "report", label: "Full Report (ሙሉ ሪፖርት)", icon: "📖" },
            { id: "scroll", label: "Personalized Healing Scroll (ክታብ)", icon: "📜" },
            { id: "context", label: "Divination Context (አውደ ነገሥት)", icon: "🔮" },
            { id: "hatata", label: "Spirit Commentary (ሃተታ መናፍስት)", icon: "⚡" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-gold text-gold font-bold"
                  : "border-transparent text-muted-foreground hover:text-soft"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: FULL REPORT */}
        {(isPrintView || activeTab === "report") && (
          <div className="print-section space-y-6">
            {/* Section 1: Divination Summary */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card/90 border border-gold/30 shadow-raised space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs uppercase tracking-wider text-gold font-bold">
                  1. Divination Summary & Numerical Lineage
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  Total Sum: {report?.divinationSummary?.totalSum ?? "—"} · Final: {report?.divinationSummary?.finalNumber ?? "—"}
                </span>
              </div>

              <p className="text-sm text-soft leading-relaxed font-serif">
                {report?.divinationSummary?.narrative ||
                  `Your name carries the numerical vibration of 10, connecting you with the constellation of Nisr (Eagle). In the Halehame and Awde Negest computus, you currently dwell in Circle 8 (ቅድስት — Transformation), Segment 1. This marks a profound conclusion of outworn struggles and the opening of new creative horizons.`}
              </p>
            </div>

            {/* Section 2: Cultural Interpretation */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card/90 border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs uppercase tracking-wider text-gold font-bold">
                  2. Deep Cultural Interpretation (የሊቃውንት ትርጓሜ)
                </span>
                <span className="text-xs text-muted-foreground">Parchment Wisdom</span>
              </div>

              <p className="text-sm text-soft leading-relaxed font-serif">
                {report?.culturalInterpretation?.narrative}
              </p>

              {report?.culturalInterpretation?.references && (
                <div className="pt-3 border-t border-border space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">
                    Manuscript Citations & Archives:
                  </span>
                  <ul className="text-xs text-gold-strong font-mono space-y-0.5 list-disc pl-4">
                    {report.culturalInterpretation.references.map((ref: string, i: number) => (
                      <li key={i}>{ref}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 text-right">
                <span className="text-xs text-muted-foreground italic">
                  Signed & Authenticated: {report?.culturalInterpretation?.expertSignature}
                </span>
              </div>
            </div>

            {/* Section 3: Practical Guidance */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card/90 border border-border space-y-4">
              <div className="text-xs uppercase tracking-wider text-gold font-bold">
                3. Actionable Non-Promissory Guidance Steps
              </div>

              <div className="space-y-3">
                {report?.practicalGuidance?.steps?.map((step: any) => (
                  <div key={step.order} className="p-4 rounded-2xl bg-sunken/80 border border-border flex items-start gap-4">
                    <span className="w-7 h-7 rounded-xl bg-gold/20 text-gold-strong font-mono font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      {step.order}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">{step.title}</h4>
                      <p className="text-xs text-soft leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {report?.practicalGuidance?.expertNotes && (
                <p className="text-xs text-gold-strong italic pt-2">
                  &ldquo;{report.practicalGuidance.expertNotes}&rdquo;
                </p>
              )}
            </div>

            {/* Section 4: Recommended Ritual */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-gold-soft via-card to-background border border-gold/40 space-y-4">
              <div className="text-xs uppercase tracking-wider text-gold font-bold">
                4. Recommended Thursday Blessing Ritual (የሐሙስ ቡራኬ)
              </div>

              <div>
                <h4 className="text-base font-bold text-gold-strong">{report?.recommendedRitual?.title}</h4>
                <p className="text-xs text-soft mt-1">{report?.recommendedRitual?.description}</p>
                <div className="mt-2 text-xs text-gold font-mono">
                  ⏱️ Timing: {report?.recommendedRitual?.timing}
                </div>
              </div>

              {report?.recommendedRitual?.materials && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block font-semibold">Traditional Materials Needed:</span>
                  <div className="flex flex-wrap gap-2">
                    {report.recommendedRitual.materials.map((mat: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-muted border border-border text-xs text-soft"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PERSONALIZED HEALING SCROLL */}
        {(isPrintView || activeTab === "scroll") && (
          <div className="print-section space-y-6">
            <div className="theme-dark p-8 sm:p-12 rounded-3xl bg-[#1c1813] border-4 border-[#8c6d3b] text-[#f2e6cf] shadow-raised space-y-8 font-serif">
              {/* Scroll Banner */}
              <div className="text-center space-y-2 border-b-2 border-[#8c6d3b]/40 pb-6">
                <span className="text-3xl block">⚔️ 🕊️ ⚔️</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#f7e0b5] tracking-wide">
                  {report?.healingScroll?.title || "Reflective reading"}
                </h2>
                <p className="text-xs uppercase tracking-wider text-[#d1b078]">
                  Optional cultural symbolism · no spiritual guardian is inferred
                </p>
              </div>

              {/* Words of Power */}
              <div className="space-y-2 text-center">
                <span className="text-xs uppercase tracking-wider text-[#b8955a] block">
                  Words of Protection & Divine Names (አስማተ ኃይል)
                </span>
                <div className="flex flex-wrap justify-center gap-2 text-sm font-bold text-[#f5d799]">
                  {report?.healingScroll?.wordsOfPower?.map((w: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-sunken/50 border border-[#8c6d3b]/50">
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prayers */}
              <div className="space-y-4 text-center max-w-xl mx-auto">
                <span className="text-xs uppercase tracking-wider text-[#b8955a] block">
                  Sacred Verses of Blessing
                </span>
                {report?.healingScroll?.prayers?.map((p: string, i: number) => (
                  <p key={i} className="text-sm leading-relaxed italic text-[#f7e0b5]">
                    &ldquo;{p}&rdquo;
                  </p>
                ))}
              </div>

              {/* Consecrated Telsem Seal & Sacred Art */}
              {(() => {
                const activeTelsem =
                  gematria?.telsem ||
                  (typeof gematria?.finalNumber === "number" ? getTelsemForArchetype(gematria.finalNumber) : null);
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#8c6d3b]/40 pb-2">
                      <span className="font-bold text-[#d1b078] text-sm block">
                        Consecrated Telsem (የተቀደሰ ጠልሰም): {activeTelsem.nameAm}
                      </span>
                      <Link
                        href="/library/telsem"
                        target="_blank"
                        className="text-xs text-[#d1b078] underline hover:text-[#f7e0b5]"
                      >
                        Explore 22 Manuscript Seals ↗
                      </Link>
                    </div>
                    <TelsemSacredSeal
                      seal={activeTelsem}
                      size="md"
                      interactive={!isPrintView}
                      showDetails={!isPrintView}
                      defaultView="plate"
                      className="seal-print"
                    />
                  </div>
                );
              })()}

              {/* Celestial Imagery Description */}
              <div className="p-4 rounded-2xl bg-sunken/80 border border-[#8c6d3b]/40 text-xs space-y-2">
                <span className="font-bold text-[#d1b078] block">Inscribed Talismanic Imagery:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#e3cfab]">
                  {report?.healingScroll?.imagery?.map((img: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span>✨</span>
                      <span>{img}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: DIVINATION CONTEXT */}
        {(isPrintView || activeTab === "context") && (
          <div className="print-section space-y-6">
            <AwdeCircleVisualizer circle={gematria?.awdeCircle} segment={gematria?.awdeSegment} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
                <h4 className="text-sm font-bold text-gold-strong">Zodiac Constellation</h4>
                <div className="text-lg font-bold text-foreground">
                  {gematria?.zodiac?.name} {gematria?.zodiac?.symbol}
                </div>
                <p className="text-xs text-muted-foreground">
                  Element: {gematria?.zodiac?.element} · Ruling Planet: {gematria?.zodiac?.rulingPlanet}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {gematria?.zodiac?.traits?.map((t: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-soft">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gold-strong">Talismanic Character & Telsem</h4>
                  <Link href="/library/telsem" className="text-[10px] text-gold underline">
                    Archive ↗
                  </Link>
                </div>
                <div className="text-lg font-bold text-foreground">{gematria?.talismanic?.name}</div>
                <p className="text-xs text-muted-foreground">
                  Ruling Day: {gematria?.talismanic?.dayOfWeek} · Planet: {gematria?.talismanic?.rulingPlanet}
                </p>
                <div className="text-xs text-soft pt-1">
                  Gemstones: {gematria?.talismanic?.gemstones?.join(", ")}
                </div>
                {(() => {
                  const activeTelsem =
                    gematria?.telsem ||
                    (typeof gematria?.finalNumber === "number" ? getTelsemForArchetype(gematria.finalNumber) : null);
                  return (
                    <div className="mt-3 p-3 rounded-xl bg-sunken/80 border border-gold/20 text-xs">
                      <span className="text-[10px] uppercase text-gold font-bold block">
                        Aligned Telsem Seal (የተመደበ ጠልሰም)
                      </span>
                      <span className="font-serif font-bold text-foreground block mt-0.5">
                        {activeTelsem.nameAm}
                      </span>
                      <span className="text-[11px] text-muted-foreground italic block">
                        {activeTelsem.nameEn}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SPIRIT COMMENTARY & AWDE NEGEST CHAPTER GUIDANCE */}
        {(isPrintView || activeTab === "hatata") && (() => {
          const circleNumber = gematria?.awdeCircle || 1;
          const chapter = getAwdeChapter(circleNumber) || getAwdeChapter(1);
          const allSpirits = getAllSpiritCommentary();
          const holyArchangel = allSpirits.find((s) => s.spiritClass === "melaek_tsadag");
          const adversaryNote = allSpirits.find((s) => s.spiritClass === "melaek_gana");
          const eyeShield = allSpirits.find((s) => s.spiritClass === "buda_ayne");

          return (
            <div className="print-section space-y-6">
              {/* Awde Negest Chapter Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-card/90 border border-gold/30 shadow-raised space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-gold/10 border border-gold/30 text-gold-strong">
                        ምዕራፍ {chapter?.circleNumber} • Circle Chapter
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        ጠባቂ መልአክ: {chapter?.guardianAngelAm} ({chapter?.guardianAngel})
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold font-serif text-foreground mt-1">
                      {chapter?.circleNameAm}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono italic">
                      {chapter?.circleNameGe} • {chapter?.circleNameEn}
                    </p>
                  </div>

                  <Link
                    href="/library/hatata"
                    className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/30 text-xs font-mono text-gold-strong hover:bg-gold/20 transition-colors"
                  >
                    View in Full Library ↗
                  </Link>
                </div>

                {/* Trilingual Exegesis Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-sunken/80 border border-border space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-gold block">
                      የአውደ ነገሥት ምዕራፍ ትርጓሜ (Amharic Exegesis)
                    </span>
                    <p className="text-sm text-soft leading-relaxed font-serif">
                      {chapter?.chapterTextAm}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-sunken/80 border border-border space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                      English Interpretation & Wisdom
                    </span>
                    <p className="text-xs text-soft leading-relaxed font-sans">
                      {chapter?.chapterTextEn}
                    </p>
                  </div>
                </div>

                {/* Classical Ge'ez Scripture */}
                <div className="p-4 rounded-2xl bg-gold-soft border border-gold/30 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-gold block">
                    የጥንቱ ግዕዝ ንባብ (Classical Ge&apos;ez Inscription)
                  </span>
                  <p className="text-sm font-serif text-gold-strong leading-relaxed">
                    « {chapter?.chapterTextGe} »
                  </p>
                </div>

                {/* Prophecy Categories Table */}
                {chapter?.prophesyForCategories && chapter.prophesyForCategories.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gold block">
                      ክፍለ ትንቢት (Divination Outcomes by Life Domain)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {chapter.prophesyForCategories.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-background/70 border border-border space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gold-strong">{p.categoryAm}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{p.categoryEn}</span>
                          </div>
                          <p className="text-xs text-soft font-serif">{p.outcomeAm}</p>
                          <p className="text-[11px] text-muted-foreground italic">{p.outcomeEn}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timings and Ruling Affinity */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border text-xs font-mono">
                  <span className="px-3 py-1 rounded-full bg-background border border-border text-soft">
                    ወገን: {chapter?.seasonalAffinityAm} ({chapter?.seasonalAffinityEn})
                  </span>
                  <span className="px-3 py-1 rounded-full bg-background border border-border text-gold">
                    የቀን ገዥ: {chapter?.dayRulingAm}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-background border border-border text-info">
                    የሌሊት ገዥ: {chapter?.nightRulingAm}
                  </span>
                </div>
              </div>

              {/* Spirit Commentary & Traditional Protection Protocols */}
              <div className="p-6 sm:p-8 rounded-3xl bg-card/90 border border-border shadow-raised space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gold font-bold block">
                      ሃተታ መናፍስት (Traditional Spirit Exegesis & Countermeasures)
                    </span>
                    <h4 className="text-lg font-bold text-foreground font-serif mt-0.5">
                      Spiritual Guardian & Shielding Guidance
                    </h4>
                  </div>
                  <Link
                    href="/library/telsem"
                    className="text-xs font-mono text-gold underline hover:text-gold-strong"
                  >
                    22 Talisman Seals ↗
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Guardian Archangel */}
                  {holyArchangel && (
                    <div className="p-4 rounded-2xl bg-gold-soft/70 border border-gold/30 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-gold">
                        <span>⚡</span>
                        <span>{holyArchangel.nameAm} ({holyArchangel.nameEn})</span>
                      </div>
                      <p className="text-xs text-soft leading-relaxed font-serif">
                        {holyArchangel.hatatDefinitionAm}
                      </p>
                      <div className="p-2.5 rounded-lg bg-sunken/80 border border-gold/20 text-[11px] text-gold-strong font-serif">
                        « {holyArchangel.protectiveFormulaGe} »
                      </div>
                    </div>
                  )}

                  {/* Adversarial Neutralization */}
                  {(adversaryNote || eyeShield) && (() => {
                    const adv = adversaryNote || eyeShield!;
                    return (
                      <div className="p-4 rounded-2xl bg-danger-soft/70 border border-danger/30 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-danger">
                          <span>👁️</span>
                          <span>{adv.nameAm} ({adv.nameEn})</span>
                        </div>
                        <p className="text-xs text-soft leading-relaxed font-serif">
                          {adv.hatatDefinitionAm}
                        </p>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-danger block">
                            ባህላዊ መከላከያዎች (Traditional Countermeasures):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {adv.counterMeasures.map((cm, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-card border border-danger/20 text-[10px] text-soft"
                              >
                                {cm}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="p-4 rounded-2xl bg-sunken/80 border border-border text-xs text-muted-foreground flex items-center justify-between gap-4">
                  <p>
                    Heritage Note: Traditional debtera commentaries provide ethical reflection and liturgical prayer formulas. They are preserved for cultural study.
                  </p>
                  <Link
                    href="/library/hatata"
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-card border border-border text-gold hover:border-gold text-xs font-mono transition-colors"
                  >
                    Open Full Exegesis →
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Book Consultation Banner */}
        <div className="print-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card via-card to-gold-soft border border-gold/40 shadow-raised flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-gold font-bold">
              👤 Deepen Your Reading with Personal Dialogue
            </span>
            <h3 className="text-xl font-bold text-foreground">
              {expert ? `Book a 30-Minute Video Consultation with ${expert.name}` : "Practitioner consultation"}
            </h3>
            <p className="text-xs text-soft">
              Fee: 1000 ETB · Video call, voice, or private chat with your verified debtera
            </p>
          </div>

          <Link
            href={`/case/spiritual/${caseId}/consult`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gold-fill hover:bg-gold-fill text-gold-foreground font-bold text-sm text-center shadow-panel transition-all flex-shrink-0"
          >
            Book Now →
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-[11px] text-subtle space-y-1">
          <p>
            ⚠️ Disclaimer: This reading is a reflective cultural heritage tradition. It offers ethical and spiritual contemplation and does not replace medical, legal, or financial professional counsel.
          </p>
        </div>
      </div>
    </div>
  );
}
