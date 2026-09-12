"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SpiritualPreviewPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const router = useRouter();
  const { caseId } = use(params);

  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/case/spiritual/${caseId}/preview`)
      .then((r) => r.json())
      .then((payload) => {
        if (payload.success && payload.data) {
          setPreviewData(payload.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-amber-300 gap-3">
        <span className="text-4xl animate-pulse">📜</span>
        <p className="text-sm font-mono">Preparing preview...</p>
      </div>
    );
  }

  const expertName = previewData?.expert?.name || "Selamawit Tadesse";
  const expertCred = previewData?.expert?.credential || "Verified Debtera";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-4">
          <Link href={`/case/spiritual/${caseId}/status`} className="hover:text-amber-400 transition-colors">
            ← Status Timeline
          </Link>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-mono">
            STAGE 5: PREVIEW & SCROLL TEASE
          </span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 font-mono uppercase tracking-widest">
            <span>✓ Verified Signoff Complete</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-amber-100">
            Your Personalized Reading is Ready
          </h1>
          <p className="text-sm text-stone-300">
            Reviewed and approved by <span className="text-amber-300 font-bold">{expertName}</span>, {expertCred}.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="p-6 rounded-3xl bg-stone-900/90 border border-amber-500/30 shadow-2xl space-y-4">
          <div className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
            📖 What&apos;s Inside Your Personalized Reading
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200">
              <span className="flex items-center gap-2 font-medium">
                <span>1.</span> <span>Divination Summary & Fidel Computation</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                ✓ FREE PREVIEW
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-stone-800 text-stone-400">
              <span className="flex items-center gap-2">
                <span>2.</span> <span>Cultural Interpretation & Manuscript Citations</span>
              </span>
              <span className="text-xs font-mono text-amber-400/80">🔒 Locked</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-stone-800 text-stone-400">
              <span className="flex items-center gap-2">
                <span>3.</span> <span>Actionable Non-Promissory Guidance Steps</span>
              </span>
              <span className="text-xs font-mono text-amber-400/80">🔒 Locked</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-stone-800 text-stone-400">
              <span className="flex items-center gap-2">
                <span>4.</span> <span>Recommended Thursday Incense Ritual</span>
              </span>
              <span className="text-xs font-mono text-amber-400/80">🔒 Locked</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-stone-800 text-stone-400">
              <span className="flex items-center gap-2">
                <span>5.</span> <span>Personalized Ge&apos;ez Healing Scroll (PDF)</span>
              </span>
              <span className="text-xs font-mono text-amber-400/80">🔒 Locked</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-stone-800 text-stone-400">
              <span className="flex items-center gap-2">
                <span>6.</span> <span>Direct Practitioner Video Consultation Access</span>
              </span>
              <span className="text-xs font-mono text-amber-400/80">🔒 Locked</span>
            </div>
          </div>
        </div>

        {/* Free Preview Content */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-black border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <span className="text-xs uppercase tracking-wider text-amber-300 font-mono font-bold">
              FREE PREVIEW: Divination Summary
            </span>
            <span className="text-xs text-stone-400">Excerpt</span>
          </div>

          <p className="text-sm text-stone-200 leading-relaxed font-serif">
            {previewData?.freeSummary ||
              "Your name carries the vibration of 10, associated with the constellation of Nisr (Eagle). The Awde Negest reveals you are currently within the Circle of Transformation (ቅድስት), suggesting..."}
          </p>

          <blockquote className="p-4 rounded-2xl bg-black/50 border border-amber-500/20 text-xs text-amber-200/90 italic font-serif">
            {previewData?.debteraNote ||
              `"When I read your name, I immediately felt the tension between your deep inner desire for clarity and the ambition pushing you forward. This is a season of..." — ${expertName}`}
          </blockquote>

          <div className="text-[11px] text-stone-400 italic">
            [Content continues in full released report...]
          </div>
        </div>

        {/* Healing Scroll Tease */}
        <div className="relative p-6 rounded-3xl bg-stone-900 border border-amber-500/30 overflow-hidden shadow-2xl text-center space-y-4">
          <div className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
            📜 Your Personalized Healing Scroll
          </div>

          {/* Blurred preview container */}
          <div className="relative h-48 rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-md opacity-40 scale-105"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80')",
              }}
            />
            <div className="relative z-10 space-y-2 p-4">
              <span className="text-4xl block">🔒</span>
              <h4 className="text-base font-bold text-white">Your Custom Parchment Healing Scroll</h4>
              <p className="text-xs text-stone-300">
                Unlock to download your high-resolution printable PDF with sacred Ge&apos;ez prayers & talismanic script
              </p>
            </div>
          </div>
        </div>

        {/* Unlock Full Reading CTA Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/60 border-2 border-amber-500/60 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-800 pb-5">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
                💰 Unlock Full Reading
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Complete Report + Healing Scroll PDF + Debtera Access
              </h3>
              <p className="text-xs text-stone-300 mt-0.5">
                Instant lifetime access · Verified Debtera guidance
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black font-mono text-amber-400">500 ETB</span>
              <span className="text-[10px] text-stone-400 block">One-time payment</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => router.push(`/case/spiritual/${caseId}/payment?method=telebirr`)}
              className="p-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all text-center shadow-lg shadow-amber-500/20"
            >
              Pay with Telebirr
            </button>
            <button
              type="button"
              onClick={() => router.push(`/case/spiritual/${caseId}/payment?method=cbe_birr`)}
              className="p-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-700 font-bold text-sm transition-all text-center"
            >
              Pay with CBE Birr
            </button>
            <button
              type="button"
              onClick={() => router.push(`/case/spiritual/${caseId}/payment?method=chapa`)}
              className="p-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-sm transition-all text-center"
            >
              Pay with Chapa / Card
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-stone-400 pt-1">
            <span>🔒 Secure payment · Instant access · Full refund if review SLA missed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
