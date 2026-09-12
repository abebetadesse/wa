"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AwdeCircleVisualizer } from "@/components/cultural/AwdeCircleVisualizer";

export default function SpiritualReportPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const router = useRouter();
  const { caseId } = use(params);

  const [activeTab, setActiveTab] = useState<"report" | "scroll" | "context">("report");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/case/spiritual/${caseId}/report`)
      .then((r) => r.json())
      .then((payload) => {
        if (payload.success && payload.data) {
          setReportData(payload.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-amber-300 gap-3">
        <span className="text-4xl animate-spin">📜</span>
        <p className="text-sm font-mono">Unsealing Your Sacred Reading...</p>
      </div>
    );
  }

  const report = reportData?.report;
  const gematria = reportData?.gematria;
  const expert = reportData?.assignedExpert || report?.expert;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 font-mono uppercase tracking-widest">
              <span>✓ Verified & Unlocked Reading</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-serif text-amber-100 mt-1">
              Spiritual & Life Direction Reading
            </h1>
            <p className="text-xs text-stone-300 mt-0.5">
              Prepared and approved by <span className="text-amber-300 font-bold">{expert?.name || "Selamawit Tadesse"}</span>, {expert?.credential || "Verified Debtera"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-stone-900 border border-stone-700 hover:bg-stone-800 text-xs font-medium text-stone-200 transition-colors flex items-center gap-1.5"
            >
              <span>🖨️</span> <span>Print Reading</span>
            </button>
            <Link
              href={`/case/spiritual/${caseId}/consult`}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            >
              Book Consultation →
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 gap-2 text-sm font-medium">
          {[
            { id: "report", label: "Full Report (ሙሉ ሪፖርት)", icon: "📖" },
            { id: "scroll", label: "Personalized Healing Scroll (ክታብ)", icon: "📜" },
            { id: "context", label: "Divination Context (አውደ ነገሥት)", icon: "🔮" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 flex items-center gap-2 transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-amber-400 text-amber-300 font-bold"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: FULL REPORT */}
        {activeTab === "report" && (
          <div className="space-y-6">
            {/* Section 1: Divination Summary */}
            <div className="p-6 sm:p-8 rounded-3xl bg-stone-900/90 border border-amber-500/30 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
                  1. Divination Summary & Numerical Lineage
                </span>
                <span className="text-xs font-mono text-stone-400">
                  Total Sum: {report?.divinationSummary?.totalSum || 840} · Final: {report?.divinationSummary?.finalNumber || 10}
                </span>
              </div>

              <p className="text-sm text-stone-200 leading-relaxed font-serif">
                {report?.divinationSummary?.narrative ||
                  `Your name carries the numerical vibration of 10, connecting you with the constellation of Nisr (Eagle). In the Halehame and Awde Negest computus, you currently dwell in Circle 8 (ቅድስት — Transformation), Segment 1. This marks a profound conclusion of outworn struggles and the opening of new creative horizons.`}
              </p>
            </div>

            {/* Section 2: Cultural Interpretation */}
            <div className="p-6 sm:p-8 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="text-xs uppercase tracking-wider text-amber-300 font-mono font-bold">
                  2. Deep Cultural Interpretation (የሊቃውንት ትርጓሜ)
                </span>
                <span className="text-xs text-stone-400">Parchment Wisdom</span>
              </div>

              <p className="text-sm text-stone-200 leading-relaxed font-serif">
                {report?.culturalInterpretation?.narrative}
              </p>

              {report?.culturalInterpretation?.references && (
                <div className="pt-3 border-t border-stone-800 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-mono block">
                    Manuscript Citations & Archives:
                  </span>
                  <ul className="text-xs text-amber-200/70 font-mono space-y-0.5 list-disc pl-4">
                    {report.culturalInterpretation.references.map((ref: string, i: number) => (
                      <li key={i}>{ref}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 text-right">
                <span className="text-xs text-stone-400 italic">
                  Signed & Authenticated: {report?.culturalInterpretation?.expertSignature}
                </span>
              </div>
            </div>

            {/* Section 3: Practical Guidance */}
            <div className="p-6 sm:p-8 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
              <div className="text-xs uppercase tracking-wider text-amber-300 font-mono font-bold">
                3. Actionable Non-Promissory Guidance Steps
              </div>

              <div className="space-y-3">
                {report?.practicalGuidance?.steps?.map((step: any) => (
                  <div key={step.order} className="p-4 rounded-2xl bg-black/40 border border-stone-800 flex items-start gap-4">
                    <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      {step.order}
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{step.title}</h4>
                      <p className="text-xs text-stone-300 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {report?.practicalGuidance?.expertNotes && (
                <p className="text-xs text-amber-200/90 italic pt-2">
                  &ldquo;{report.practicalGuidance.expertNotes}&rdquo;
                </p>
              )}
            </div>

            {/* Section 4: Recommended Ritual */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/30 via-stone-900 to-black border border-amber-500/40 space-y-4">
              <div className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
                4. Recommended Thursday Blessing Ritual (የሐሙስ ቡራኬ)
              </div>

              <div>
                <h4 className="text-base font-bold text-amber-100">{report?.recommendedRitual?.title}</h4>
                <p className="text-xs text-stone-300 mt-1">{report?.recommendedRitual?.description}</p>
                <div className="mt-2 text-xs text-amber-300 font-mono">
                  ⏱️ Timing: {report?.recommendedRitual?.timing}
                </div>
              </div>

              {report?.recommendedRitual?.materials && (
                <div className="space-y-1">
                  <span className="text-xs text-stone-400 block font-semibold">Traditional Materials Needed:</span>
                  <div className="flex flex-wrap gap-2">
                    {report.recommendedRitual.materials.map((mat: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-xs text-stone-200"
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
        {activeTab === "scroll" && (
          <div className="space-y-6">
            <div className="p-8 sm:p-12 rounded-3xl bg-[#1c1813] border-4 border-[#8c6d3b] text-[#f2e6cf] shadow-2xl space-y-8 font-serif">
              {/* Scroll Banner */}
              <div className="text-center space-y-2 border-b-2 border-[#8c6d3b]/40 pb-6">
                <span className="text-3xl block">⚔️ 🕊️ ⚔️</span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#f7e0b5] tracking-wide">
                  {report?.healingScroll?.title || "የፈውስና የዕድል ክታብ"}
                </h2>
                <p className="text-xs uppercase tracking-widest text-[#d1b078] font-mono">
                  Prepared under the guardianship of {report?.healingScroll?.patronAngel || "ቅዱስ ሚካኤል"}
                </p>
              </div>

              {/* Words of Power */}
              <div className="space-y-2 text-center">
                <span className="text-xs uppercase tracking-wider text-[#b8955a] font-mono block">
                  Words of Protection & Divine Names (አስማተ ኃይል)
                </span>
                <div className="flex flex-wrap justify-center gap-2 text-sm font-bold text-[#f5d799]">
                  {report?.healingScroll?.wordsOfPower?.map((w: string, i: number) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-black/30 border border-[#8c6d3b]/50">
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prayers */}
              <div className="space-y-4 text-center max-w-xl mx-auto">
                <span className="text-xs uppercase tracking-wider text-[#b8955a] font-mono block">
                  Sacred Verses of Blessing
                </span>
                {report?.healingScroll?.prayers?.map((p: string, i: number) => (
                  <p key={i} className="text-sm leading-relaxed italic text-[#f7e0b5]">
                    &ldquo;{p}&rdquo;
                  </p>
                ))}
              </div>

              {/* Celestial Imagery Description */}
              <div className="p-4 rounded-2xl bg-black/40 border border-[#8c6d3b]/40 text-xs space-y-2">
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

              {/* Download / Print */}
              <div className="flex justify-center gap-3 pt-4 border-t-2 border-[#8c6d3b]/40">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-6 py-3 rounded-2xl bg-[#8c6d3b] hover:bg-[#a68249] text-black font-bold text-xs transition-colors"
                >
                  Download PDF / Print Scroll
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DIVINATION CONTEXT */}
        {activeTab === "context" && (
          <div className="space-y-6">
            <AwdeCircleVisualizer circle={gematria?.awdeCircle} segment={gematria?.awdeSegment} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                <h4 className="text-sm font-bold text-amber-200">Zodiac Constellation</h4>
                <div className="text-lg font-bold text-white">
                  {gematria?.zodiac?.name} {gematria?.zodiac?.symbol}
                </div>
                <p className="text-xs text-stone-400">
                  Element: {gematria?.zodiac?.element} · Ruling Planet: {gematria?.zodiac?.rulingPlanet}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {gematria?.zodiac?.traits?.map((t: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-stone-800 text-[10px] text-stone-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                <h4 className="text-sm font-bold text-amber-200">Talismanic Character</h4>
                <div className="text-lg font-bold text-white">{gematria?.talismanic?.name}</div>
                <p className="text-xs text-stone-400">
                  Ruling Day: {gematria?.talismanic?.dayOfWeek} · Planet: {gematria?.talismanic?.rulingPlanet}
                </p>
                <div className="text-xs text-stone-300 pt-1">
                  Gemstones: {gematria?.talismanic?.gemstones?.join(", ")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Book Consultation Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/60 border border-amber-500/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
              👤 Deepen Your Reading with Personal Dialogue
            </span>
            <h3 className="text-xl font-bold text-white">
              Book a 30-Minute Video Consultation with {expert?.name || "Selamawit Tadesse"}
            </h3>
            <p className="text-xs text-stone-300">
              Fee: 1000 ETB · Video call, voice, or private chat with your verified debtera
            </p>
          </div>

          <Link
            href={`/case/spiritual/${caseId}/consult`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm text-center shadow-lg shadow-amber-500/20 transition-all flex-shrink-0"
          >
            Book Now →
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-[11px] text-stone-500 space-y-1">
          <p>
            ⚠️ Disclaimer: This reading is a reflective cultural heritage tradition. It offers ethical and spiritual contemplation and does not replace medical, legal, or financial professional counsel.
          </p>
        </div>
      </div>
    </div>
  );
}
