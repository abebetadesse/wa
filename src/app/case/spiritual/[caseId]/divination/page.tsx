"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AwdeCircleVisualizer } from "@/components/cultural/AwdeCircleVisualizer";
import { TelsemSacredSeal } from "@/components/cultural/TelsemSacredSeal";
import { TelsemScrollCanvas } from "@/components/cultural/TelsemScrollCanvas";
import { getTelsemForArchetype } from "@/lib/cultural/telsemData";
import { SpiritualIntakeProgress } from "@/components/case/SpiritualIntakeProgress";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const selectedService = data?.serviceChoice;

  const continueToProcessing = async () => {
    setIsProcessing(true);
    setError("");
    try {
      const response = await fetch(`/api/case/spiritual/${caseId}/process`, {
        method: "POST",
        credentials: "include",
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Unable to prepare your reading.");
      router.push(`/case/spiritual/${caseId}/status`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to prepare your reading.";
      setError(message === "AUTH_REQUIRED" ? "Sign in with the account that started this reading." : message);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetch(`/api/case/spiritual/${caseId}/divination`, { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok || !payload.success) throw new Error(payload.error || "Unable to load the cultural reading.");
        return payload;
      })
      .then((payload) => {
        if (payload.data) setData(payload.data);
      })
      .catch((caught) => {
        const message = caught instanceof Error ? caught.message : "Unable to load the cultural reading.";
        setError(message === "AUTH_REQUIRED" ? "Sign in with the account that started this reading." : message);
      })
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
        {error.startsWith("Sign in") && <Link href="/auth" className="rounded-xl border border-stone-700 px-5 py-3 text-stone-200">Sign in</Link>}
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
            STEP 3 OF 5: CULTURAL READING
          </span>
        </div>
        <SpiritualIntakeProgress current={3} />

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

        {selectedService && (
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-stone-900 to-emerald-500/10 p-5 shadow-lg">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Chosen spiritual service</div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-amber-50">{selectedService.title}</h2>
                <p className="text-sm text-stone-300">{selectedService.label}</p>
              </div>
              {selectedService.telsemName && (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Telsem: {selectedService.telsemName}
                </span>
              )}
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-200">“{selectedService.prayer}”</p>
          </div>
        )}

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
            This symbolic calculation is optional cultural reflection. It does not predict events, establish personal
            traits, or replace medical, legal, financial, or licensed mental health support. No practitioner has reviewed
            this reading at this stage.
          </p>
        </div>

        {/* Action Button */}
        {error && (
          <p role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-200">
            {error} {error.startsWith("Sign in") && <Link href="/auth" className="font-bold underline underline-offset-2">Sign in</Link>}
          </p>
        )}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={continueToProcessing}
            disabled={isProcessing}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{isProcessing ? "Preparing your draft..." : "Continue to Step 4: Process my answers →"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
