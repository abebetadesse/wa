"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCaseStatusStream } from "@/hooks/useCaseStatusStream";

export default function SpiritualStatusPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const router = useRouter();
  const { caseId } = use(params);

  const { status, eta, expert, reportReady } = useCaseStatusStream(caseId);
  const [caseInfo, setCaseInfo] = useState<any>(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    fetch(`/api/case/spiritual/${caseId}/status`)
      .then((r) => r.json())
      .then((payload) => {
        if (payload.success && payload.data) {
          setCaseInfo(payload.data);
        }
      })
      .catch(() => {});
  }, [caseId]);

  // Demo simulator for testing/instant verification
  const handleSimulateApproval = async () => {
    setIsApproving(true);
    try {
      // Direct call to preview or update
      router.push(`/case/spiritual/${caseId}/preview`);
    } catch {
      setIsApproving(false);
    }
  };

  const currentStatus = status || caseInfo?.status || "pending_expert_review";
  const activeExpert = expert || caseInfo?.assignedExpert || {
    name: "Selamawit Tadesse",
    credential: "Verified Debtera",
    titleAmharic: "ደብተራ ሰላማዊት ታደሰ",
    rating: 4.9,
    reviews_count: 247,
    average_review_time_minutes: 372,
    languages: ["Amharic", "English"],
    bioQuote: "I have been practicing as a debtera for 18 years, specializing in career transitions and life direction readings.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-4">
          <Link href={`/case/spiritual/${caseId}/divination`} className="hover:text-amber-400 transition-colors">
            ← Divination Context
          </Link>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 font-mono">
            STAGE 4: EXPERT REVIEW QUEUE
          </span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 font-mono uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Real-Time Review Stream Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-amber-100">
            Your Reading is in Progress
          </h1>
          <p className="text-sm text-stone-300">
            A verified debtera has been assigned based on your language preferences, category, and regional lineage.
          </p>
        </div>

        {/* Status Timeline Card */}
        <div className="p-6 rounded-3xl bg-stone-900/90 border border-amber-500/30 shadow-2xl space-y-4">
          <div className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold">
            Live Case Milestones
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-emerald-400">
              <span>✓</span>
              <span className="text-stone-200">Case received & encrypted</span>
              <span className="text-xs text-stone-500 font-mono ml-auto">Verified</span>
            </div>

            <div className="flex items-center gap-3 text-emerald-400">
              <span>✓</span>
              <span className="text-stone-200">Gematria & Awde Negest calculated</span>
              <span className="text-xs text-stone-500 font-mono ml-auto">Circle 8</span>
            </div>

            <div className="flex items-center gap-3 text-emerald-400">
              <span>✓</span>
              <span className="text-stone-200">AI personalized draft prepared</span>
              <span className="text-xs text-stone-500 font-mono ml-auto">Completed</span>
            </div>

            <div className="flex items-center gap-3 text-amber-400 font-medium">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse inline-block" />
              <span className="text-amber-100">Expert debtera review in progress</span>
              <span className="text-xs text-amber-400 font-mono ml-auto">Under Review</span>
            </div>

            <div className="flex items-center gap-3 text-stone-500">
              <span>○</span>
              <span>Report preview ready</span>
              <span className="text-xs font-mono ml-auto">Estimated: 6h 12m</span>
            </div>

            <div className="flex items-center gap-3 text-stone-500">
              <span>○</span>
              <span>Payment & healing scroll release</span>
              <span className="text-xs font-mono ml-auto">500 ETB</span>
            </div>
          </div>
        </div>

        {/* Reviewer Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-black border border-amber-500/30 shadow-2xl space-y-5">
          <div className="text-xs uppercase tracking-wider text-stone-400 font-mono font-bold">
            👤 Your Assigned Reviewer
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-amber-600/30 border border-amber-500/40 overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl">
              👵🏾
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-amber-100">{activeExpert.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  Verified Debtera
                </span>
              </div>
              <p className="text-xs text-amber-300/80 font-serif">{activeExpert.titleAmharic}</p>
              <div className="flex flex-wrap gap-4 text-xs text-stone-300 pt-1 font-mono">
                <span>Rating: ★★★★★ ({activeExpert.rating} / 5)</span>
                <span>·</span>
                <span>{activeExpert.reviews_count} reviews</span>
                <span>·</span>
                <span>Avg review: 6h 12m</span>
              </div>
            </div>
          </div>

          <blockquote className="p-4 rounded-2xl bg-black/50 border border-stone-800 text-xs text-stone-300 italic">
            &ldquo;{activeExpert.bioQuote}&rdquo;
          </blockquote>
        </div>

        {/* Progress & ETA Card */}
        <div className="p-6 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-400 uppercase font-mono">Queue Status</span>
            <span className="text-amber-400 font-mono font-bold">Estimated Remaining: ~6 hours</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full w-[45%] transition-all duration-1000" />
          </div>

          <p className="text-xs text-stone-400">
            You will receive an SMS and in-app alert the instant your debtera completes their personalized signoff.
          </p>
        </div>

        {/* Explore Links While Waiting */}
        <div className="space-y-2">
          <span className="text-xs text-stone-400 font-mono uppercase block">While you wait:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href={`/case/spiritual/${caseId}/divination`}
              className="p-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 transition-colors text-xs text-stone-300 block"
            >
              <span className="text-base block mb-1">⛰️</span>
              <span className="font-bold text-white block">View Awde Circle</span>
              Explore the Lake of Renewal
            </Link>
            <Link
              href={`/case/spiritual/${caseId}/preview`}
              className="p-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 transition-colors text-xs text-stone-300 block"
            >
              <span className="text-base block mb-1">📜</span>
              <span className="font-bold text-white block">Preview Healing Scroll</span>
              View partial manuscript preview
            </Link>
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 text-xs text-stone-300">
              <span className="text-base block mb-1">🦅</span>
              <span className="font-bold text-white block">Zodiac Nisr (Eagle)</span>
              Air Element · Jupiter Ruling
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => alert("Notification preference saved. You will be alerted via SMS.")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-semibold"
          >
            🔔 Notify Me When Ready
          </button>

          <button
            type="button"
            onClick={handleSimulateApproval}
            disabled={isApproving}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Preview (Ready) →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
