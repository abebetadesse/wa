"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AwdeCircleVisualizer } from "@/components/cultural/AwdeCircleVisualizer";
import { TelsemSacredSeal } from "@/components/cultural/TelsemSacredSeal";
import { TelsemScrollCanvas } from "@/components/cultural/TelsemScrollCanvas";
import { getTelsemForArchetype } from "@/lib/cultural/telsemData";
import { SpiritualIntakeProgress } from "@/components/case/SpiritualIntakeProgress";
import { withBasePath } from '@/lib/base-path';

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
      const response = await fetch(withBasePath(`/api/case/spiritual/${caseId}/process`), {
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
    fetch(withBasePath(`/api/case/spiritual/${caseId}/divination`), { credentials: "include", cache: "no-store" })
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-gold gap-3">
        <span className="text-4xl animate-spin">🔮</span>
        <p className="text-sm font-mono">Unfolding Sacred Awde Negest Parchment...</p>
      </div>
    );
  }

  const gem = data?.gematria;

  if (!data || !gem) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-soft gap-4 px-6 text-center">
        <p className="text-lg font-semibold">This Case 1 session is no longer available.</p>
        <p className="text-sm text-muted-foreground">Start a new reading to create a secure session.</p>
        {error.startsWith("Sign in") && <Link href="/auth" className="rounded-xl border border-border px-5 py-3 text-soft">Sign in</Link>}
        <Link href="/case/workflows/new/spiritual" className="rounded-xl bg-gold-fill px-5 py-3 font-bold text-gold-foreground">
          Start a new reading
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-4">
          <Link href={`/case/spiritual/intake/step-2?caseId=${caseId}`} className="hover:text-gold transition-colors">
            ← Back to Questions
          </Link>
          <span className="px-3 py-1 rounded-full bg-gold/10 text-gold-strong font-mono">
            STEP 3 OF 5: CULTURAL READING
          </span>
        </div>
        <SpiritualIntakeProgress current={3} />

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-wider">
            <span>✨ Complete Numerical Alignment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-gold-strong">
            Your Divination Context — Live Reveal
          </h1>
          <p className="text-sm text-soft">
            Based on your name <span className="text-gold font-bold">{gem.nameGeez}</span>
            {gem?.motherNameGeez ? (
              <> and mother&apos;s name <span className="text-gold font-bold">{gem?.motherNameGeez}</span></>
            ) : ""}
          </p>
        </div>

        {selectedService && (
          <div className="rounded-3xl border border-gold/30 bg-gradient-to-r from-gold/10 via-card to-brand/10 p-5 shadow-panel">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">Chosen spiritual service</div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gold-strong">{selectedService.title}</h2>
                <p className="text-sm text-soft">{selectedService.label}</p>
              </div>
              {selectedService.telsemName && (
                <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-strong">
                  Telsem: {selectedService.telsemName}
                </span>
              )}
            </div>
            <p className="mt-4 text-sm leading-6 text-soft">“{selectedService.prayer}”</p>
          </div>
        )}

        {/* Step 1: Name Resonance Summary */}
        <div
          className={`p-6 rounded-3xl bg-card/90 border border-gold/30 shadow-raised transition-all duration-700 ${revealStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <span className="text-xs uppercase tracking-wider text-gold font-bold">
              1. Name Lineage & Frequency (የስም ምሥጢር)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand/20 text-brand-strong text-xs font-mono font-bold">
              Final Number: {gem.finalNumber ?? "—"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-sunken/80 border border-border">
              <span className="text-xs text-muted-foreground block">Total Gematria</span>
              <span className="text-2xl font-bold font-mono text-gold">{gem.totalSum ?? "—"}</span>
            </div>
            <div className="p-3 rounded-2xl bg-sunken/80 border border-border">
              <span className="text-xs text-muted-foreground block">÷ 12 Quotient</span>
              <span className="text-2xl font-bold font-mono text-soft">{gem.dividedBy12 ?? "—"}</span>
            </div>
            <div className="p-3 rounded-2xl bg-sunken/80 border border-border">
              <span className="text-xs text-muted-foreground block">Zodiac Sign</span>
              <span className="text-lg font-bold text-gold-strong">{gem.zodiac?.name || "—"} {gem.zodiac?.symbol || ""}</span>
            </div>
            <div className="p-3 rounded-2xl bg-sunken/80 border border-border">
              <span className="text-xs text-muted-foreground block">Ruling Planet</span>
              <span className="text-lg font-bold text-gold-strong">{gem.zodiac?.rulingPlanet || "—"}</span>
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
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <span className="text-xs uppercase tracking-wider text-gold font-bold">
                    3. Consecrated Talisman & Telsem (የተጠቃሚው ጠልሰም)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-foreground">
                    {activeTelsem.nameAm}
                  </h3>
                </div>
                <Link
                  href="/library/telsem"
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl border border-gold/30 bg-gold/10 hover:bg-gold/20 text-gold-strong text-xs font-mono transition-colors"
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
              <div className="p-6 rounded-3xl bg-gradient-to-br from-plum-soft via-card to-background border border-plum/30 shadow-panel space-y-4">
                <div className="flex items-center justify-between border-b border-plum/20 pb-3">
                  <span className="text-xs uppercase tracking-wider text-plum font-bold">
                    Talismanic Lineage: {gem?.talismanic?.name || "The Visionary"} ({gem?.talismanic?.nameAmharic || "ራዕይ"})
                  </span>
                  <span className="text-2xl">🌟</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-sunken/80 border border-border space-y-1">
                    <span className="text-plum font-bold block">Sacred Colors</span>
                    <span className="text-soft">{gem?.talismanic?.colors?.join(", ") || "Purple, Gold, Indigo"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-sunken/80 border border-border space-y-1">
                    <span className="text-plum font-bold block">Gemstones</span>
                    <span className="text-soft">{gem?.talismanic?.gemstones?.join(", ") || "Amethyst, Lapis Lazuli"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-sunken/80 border border-border space-y-1">
                    <span className="text-plum font-bold block">Traditional Herbs</span>
                    <span className="text-soft">{gem?.talismanic?.herbs?.join(", ") || "Sage, Frankincense, Star Anise"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-sunken/80 border border-border space-y-1">
                    <span className="text-plum font-bold block">Ruling Day & Element</span>
                    <span className="text-soft">
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
          className={`p-5 rounded-2xl bg-card/60 border border-border text-xs text-muted-foreground space-y-2 transition-all duration-700 ${revealStep >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          <div className="flex items-center gap-2 font-bold text-gold">
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
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger-soft p-4 text-sm text-danger-strong">
            {error} {error.startsWith("Sign in") && <Link href="/auth" className="font-bold underline underline-offset-2">Sign in</Link>}
          </p>
        )}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={continueToProcessing}
            disabled={isProcessing}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-gold-fill to-gold-fill hover:from-gold-fill hover:to-gold-fill text-gold-foreground font-bold text-base shadow-panel transition-all flex items-center justify-center gap-2"
          >
            <span>{isProcessing ? "Preparing your draft..." : "Continue to Step 4: Process my answers →"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
