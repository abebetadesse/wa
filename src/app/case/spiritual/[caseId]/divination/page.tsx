"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AwdeCircleVisualizer } from "@/components/cultural/AwdeCircleVisualizer";
import { TelsemSacredSeal } from "@/components/cultural/TelsemSacredSeal";
import { TelsemScrollCanvas } from "@/components/cultural/TelsemScrollCanvas";
import { getTelsemForArchetype } from "@/lib/cultural/telsemData";

export default function SpiritualDivinationPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const router = useRouter();
  const { caseId } = use(params);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revealStep, setRevealStep] = useState(1);

  useEffect(() => {
    fetch(`/api/case/spiritual/${caseId}/divination`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success && payload.data) {
          setData(payload.data);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));

    // Staggered reveal animation
    const t1 = setTimeout(() => setRevealStep(2), 600);
    const t2 = setTimeout(() => setRevealStep(3), 1200);
    const t3 = setTimeout(() => setRevealStep(4), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-amber-300 gap-3">
        <span className="text-4xl animate-spin">🔮</span>
        <p className="text-sm font-mono">Unfolding Sacred Awde Negest Parchment...</p>
      </div>
    );
  }

  const gem = data?.gematria;

  if (!data || !gem) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-200 gap-4 px-6 text-center">
        <p className="text-lg font-semibold">This Case 1 session is no longer available.</p>
        <p className="text-sm text-stone-400">Start a new reading to create a secure session.</p>
        <Link href="/case/spiritual/intake/step-1" className="rounded-xl bg-amber-500 px-5 py-3 font-bold text-black">
          Start a new reading
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-4">
          <Link href={`/case/spiritual/intake/step-2?caseId=${caseId}`} className="hover:text-amber-400 transition-colors">
            ← Back to Questions
          </Link>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 font-mono">
            STAGE 3: LIVE DIVINATION REVEAL
          </span>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 font-mono uppercase tracking-widest">
            <span>✨ Complete Numerical Alignment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-amber-100">
            Your Divination Context — Live Reveal
          </h1>
          <p className="text-sm text-stone-300">
            Based on your name <span className="text-amber-300 font-bold">{gem.nameGeez}</span>
            {gem?.motherNameGeez ? (
              <> and mother&apos;s name <span className="text-amber-300 font-bold">{gem?.motherNameGeez}</span></>
            ) : ""}
          </p>
        </div>

        {/* Step 1: Name Resonance Summary */}
        <div
          className={`p-6 rounded-3xl bg-stone-900/90 border border-amber-500/30 shadow-2xl transition-all duration-700 ${revealStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
              1. Name Lineage & Frequency (የስም ምሥጢር)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
              Final Number: {gem.finalNumber ?? "—"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-black/50 border border-stone-800">
              <span className="text-xs text-stone-400 block">Total Gematria</span>
              <span className="text-2xl font-black font-mono text-amber-300">{gem.totalSum ?? "—"}</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/50 border border-stone-800">
              <span className="text-xs text-stone-400 block">÷ 12 Quotient</span>
              <span className="text-2xl font-black font-mono text-stone-200">{gem.dividedBy12 ?? "—"}</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/50 border border-stone-800">
              <span className="text-xs text-stone-400 block">Zodiac Sign</span>
              <span className="text-lg font-bold text-amber-200">{gem.zodiac?.name || "—"} {gem.zodiac?.symbol || ""}</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/50 border border-stone-800">
              <span className="text-xs text-stone-400 block">Ruling Planet</span>
              <span className="text-lg font-bold text-amber-200">{gem.zodiac?.rulingPlanet || "—"}</span>
            </div>
          </div>
        </div>

        {/* Step 2: Animated Awde Negest Circle */}
        <div
          className={`space-y-4 transition-all duration-700 ${revealStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          <AwdeCircleVisualizer circle={gem?.awdeCircle} segment={gem?.awdeSegment} />
        </div>

        {/* Step 3: Sacred Telsem (ጠልሰም) & Talismanic Lineage Reveal */}
        {(() => {
          const activeTelsem = gem?.telsem || getTelsemForArchetype(gem?.finalNumber || 10);
          return (
            <div
              className={`space-y-6 transition-all duration-700 ${
                revealStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
                    3. Consecrated Talisman & Telsem (የተጠቃሚው ጠልሰም)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                    {activeTelsem.nameAm}
                  </h3>
                </div>
                <Link
                  href="/library/telsem"
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono transition-colors"
                >
                  View Telsem Archive (22 Seals) ↗
                </Link>
              </div>

              {/* Interactive Sacred Seal Component */}
              <TelsemSacredSeal seal={activeTelsem} size="xl" />

              {/* Complete Parchment Healing Scroll */}
              <TelsemScrollCanvas
                seekerNameGeez={gem?.nameGeez || "ተጠቃሚ"}
                motherNameGeez={gem?.motherNameGeez}
                seal={activeTelsem}
                zodiacName={gem?.zodiac?.name}
                circleName={gem?.awdeCircle?.nameAmharic}
              />

              {/* Talismanic Attributes */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/30 via-stone-900 to-black border border-purple-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                  <span className="text-xs uppercase tracking-wider text-purple-300 font-mono font-bold">
                    Talismanic Lineage: {gem?.talismanic?.name || "The Visionary"} ({gem?.talismanic?.nameAmharic || "ራዕይ"})
                  </span>
                  <span className="text-2xl">🌟</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-stone-800 space-y-1">
                    <span className="text-purple-300 font-bold block">Sacred Colors</span>
                    <span className="text-stone-300">{gem?.talismanic?.colors?.join(", ") || "Purple, Gold, Indigo"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-stone-800 space-y-1">
                    <span className="text-purple-300 font-bold block">Gemstones</span>
                    <span className="text-stone-300">{gem?.talismanic?.gemstones?.join(", ") || "Amethyst, Lapis Lazuli"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-stone-800 space-y-1">
                    <span className="text-purple-300 font-bold block">Traditional Herbs</span>
                    <span className="text-stone-300">{gem?.talismanic?.herbs?.join(", ") || "Sage, Frankincense, Star Anise"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-stone-800 space-y-1">
                    <span className="text-purple-300 font-bold block">Ruling Day & Element</span>
                    <span className="text-stone-300">
                      {gem?.talismanic?.dayOfWeek || "Thursday"} · {gem?.talismanic?.element || "Air"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Step 4: Cultural Disclaimer */}
        <div
          className={`p-5 rounded-2xl bg-stone-900/60 border border-stone-800 text-xs text-stone-400 space-y-2 transition-all duration-700 ${revealStep >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <span>⚠️</span>
            <span>Ethical Heritage Reflection & Cultural Heritage Scope</span>
          </div>
          <p className="leading-relaxed">
            This divination is grounded in classical Ethiopian parchment traditions. It provides a mirror for spiritual
            self-reflection and personal clarity. It does NOT predict specific deterministic events, guarantee commercial
            outcomes, or replace medical, legal, or licensed mental health counsel. Your reading is personally verified by
            a certified debtera.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => router.push(`/case/spiritual/${caseId}/status`)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to Submit for Expert Review →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
