"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { generateDynamicQuestions, DynamicQuestion } from "@/lib/case-workflow/spiritualQuestionEngine";
import { useDynamicFollowUps } from "@/hooks/useDynamicFollowUps";
import { CrisisAlertBanner } from "@/components/cultural/CrisisAlertBanner";
import { CrisisScreenResult, evaluateSpiritualCrisis } from "@/lib/case-workflow/spiritualQuestionEngine";

function SpiritualStep2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId") || "";

  const [category, setCategory] = useState("life_direction");
  const [answers, setAnswers] = useState<Record<string, any>>({
    question_category: "life_direction",
  });
  const [activeFreeText, setActiveFreeText] = useState("");
  const [activeQuestionId, setActiveQuestionId] = useState("");
  const [gematriaData, setGematriaData] = useState<any>(null);
  const [isLoadingCase, setIsLoadingCase] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [crisisState, setCrisisState] = useState<CrisisScreenResult | undefined>(undefined);

  // 1. Fetch case divination data
  useEffect(() => {
    if (!caseId) {
      setIsLoadingCase(false);
      return;
    }

    fetch(`/api/case/spiritual/${caseId}/divination`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success && payload.data) {
          setGematriaData(payload.data.gematria);
          if (payload.data.category) {
            setCategory(payload.data.category);
            setAnswers((prev) => ({ ...prev, question_category: payload.data.category }));
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingCase(false));
  }, [caseId]);

  // 2. Stable gematria context
  const safeGematria = useMemo(() => gematriaData || {}, [gematriaData]);

  // 3. Generate dynamic questions
  const dynamicQuestions = useMemo(() => {
    return generateDynamicQuestions(safeGematria, category, answers);
  }, [safeGematria, category, answers]);

  // 4. AI Follow-ups hook
  const { followUps, isLoading: isAILoading, crisisFlag } = useDynamicFollowUps(
    activeQuestionId,
    activeFreeText,
    safeGematria,
    answers
  );

  // 4. Live keystroke crisis detection
  const handleTextChange = (fieldId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
    setActiveQuestionId(fieldId);
    setActiveFreeText(val);

    const liveCheck = evaluateSpiritualCrisis(val, { ...answers, [fieldId]: val });
    if (liveCheck.isCrisis) {
      setCrisisState(liveCheck);
    } else if (crisisState?.isCrisis) {
      setCrisisState(undefined);
    }
  };

  const handleSelectChange = (fieldId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
    if (fieldId === "question_category") {
      setCategory(val);
    }
    const liveCheck = evaluateSpiritualCrisis(activeFreeText, { ...answers, [fieldId]: val });
    if (liveCheck.isCrisis) {
      setCrisisState(liveCheck);
    }
  };

  // 5. Submit answers and proceed to Stage 3
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/case/spiritual/${caseId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const payload = await res.json();
      if (payload.success) {
        if (payload.urgencyLevel === "crisis") {
          setCrisisState({
            isCrisis: true,
            urgencyLevel: "crisis",
            crisisContent: payload.crisisContent,
          });
          setIsSubmitting(false);
          return;
        }

        router.push(`/case/spiritual/${caseId}/divination`);
      } else {
        throw new Error(payload.error || "Submission failed");
      }
    } catch (err) {
      alert("Error submitting answers: " + (err instanceof Error ? err.message : "Unknown error"));
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#110f0c] text-stone-100">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-[-10%] top-[-12%] h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="absolute right-[-8%] top-[12%] h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between border-b border-amber-500/20 pb-6">
            <Link href="/case" className="flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-amber-100">
              <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_#fbbf24]" />
              CASE / SPIRITUAL
            </Link>
            <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.2em] text-stone-400">
              <span>Step 02</span>
              <span className="text-amber-400">✧</span>
              <span>Adaptive Inquiry</span>
            </div>
          </nav>

          <section className="grid lg:grid-cols-[minmax(620px,1.8fr)_minmax(380px,1fr)] gap-8 mt-8">
            <section className="rounded-[2rem] border border-amber-500/30 bg-stone-950/60 p-8 shadow-2xl shadow-amber-950/20 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4 border-b border-stone-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-amber-300">
                    <span>🌿</span>
                    <span>Step 2 of 4 — Adaptive Inquiry</span>
                  </div>
                  <h1 className="mt-4 font-serif text-4xl md:text-5xl font-black text-amber-50">
                    Tell Us What Is on Your Heart
                  </h1>
                </div>
                <span className="hidden md:inline-flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/60 bg-emerald-500/5 text-emerald-200 text-2xl">
                  ✎
                </span>
              </div>

              <p className="mt-4 text-sm text-stone-300 leading-7">
                {gematriaData?.nameGeez ? (
                  <>
                    Reading for <span className="text-amber-300 font-bold">{gematriaData.nameGeez}</span> · Constellation:{" "}
                    <span className="text-amber-300 font-medium">{gematriaData.zodiac?.name}</span> ({gematriaData.zodiac?.nameAmharic}) · Circle{" "}
                    <span className="text-amber-300 font-medium">{gematriaData.awdeCircle?.number}</span> ({gematriaData.awdeCircle?.nameAmharic})
                  </>
                ) : (
                  "Every question adapts in real time to your numerical resonance and life situation."
                )}
              </p>

              <div className="mt-6">
                <CrisisAlertBanner crisis={crisisState} />
              </div>

              <div className="mt-6 p-6 sm:p-8 rounded-3xl bg-stone-900/50 border border-amber-500/20 shadow-2xl space-y-6">
                {dynamicQuestions.map((q: DynamicQuestion) => (
                  <div key={q.id} className="space-y-2.5 pb-4 border-b border-stone-800 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <label className="text-sm font-bold text-amber-200 block">
                        {q.text} {q.required && <span className="text-amber-500">*</span>}
                      </label>
                      {q.branchingReason && (
                        <span className="text-[10px] text-stone-500 font-mono italic">
                          {q.branchingReason}
                        </span>
                      )}
                    </div>
                    {q.textAmharic && (
                      <p className="text-xs text-stone-400 font-serif">{q.textAmharic}</p>
                    )}

                    {q.type === "select" && (
                      <select
                        value={answers[q.id] || ""}
                        onChange={(e) => handleSelectChange(q.id, e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-stone-700 text-stone-100 focus:border-amber-400 outline-none text-sm transition-all"
                      >
                        <option value="" disabled>Select an option...</option>
                        {q.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label} {opt.labelAmharic ? `(${opt.labelAmharic})` : ""}
                          </option>
                        ))}
                      </select>
                    )}

                    {q.type === "radio" && (
                      <div className="space-y-2">
                        {q.options?.map((opt) => (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              answers[q.id] === opt.value
                                ? "bg-amber-950/40 border-amber-500 text-white"
                                : "bg-black/40 border-stone-800 text-stone-300 hover:border-stone-700"
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt.value}
                              checked={answers[q.id] === opt.value}
                              onChange={(e) => handleSelectChange(q.id, e.target.value)}
                              className="text-amber-500 focus:ring-amber-400"
                            />
                            <span className="text-sm font-medium">{opt.label}</span>
                            {opt.labelAmharic && (
                              <span className="text-xs text-stone-400 font-serif">({opt.labelAmharic})</span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}

                    {q.type === "scale" && (
                      <div className="grid grid-cols-5 gap-2 pt-1">
                        {q.options?.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectChange(q.id, opt.value)}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              answers[q.id] === opt.value
                                ? "bg-amber-500 border-amber-400 text-black font-bold"
                                : "bg-black/40 border-stone-800 text-stone-300 hover:border-stone-700 text-xs"
                            }`}
                          >
                            <div className="text-lg font-bold">{opt.value}</div>
                            <div className="text-[10px] truncate">{opt.label}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {q.type === "textarea" && (
                      <div className="space-y-1">
                        <textarea
                          rows={3}
                          value={answers[q.id] || ""}
                          onChange={(e) => handleTextChange(q.id, e.target.value)}
                          placeholder="Write freely in English or Amharic..."
                          className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-stone-700 focus:border-amber-400 text-stone-100 text-sm outline-none transition-all placeholder-stone-600"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {isAILoading && (
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2 animate-pulse">
                    <span>✨</span>
                    <span>Our spiritual intake assistant is tuning clarifying questions to your response...</span>
                  </div>
                )}

                {followUps.length > 0 && (
                  <div className="p-5 rounded-2xl bg-stone-900 border border-emerald-500/40 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      <span>✨ Personalized Clarifying Reflection</span>
                    </div>
                    {followUps.map((fu) => (
                      <div key={fu.id} className="space-y-2">
                        <label className="text-xs font-semibold text-stone-200 block">
                          {fu.text}
                        </label>
                        {fu.textAmharic && <p className="text-xs text-stone-400">{fu.textAmharic}</p>}
                        <textarea
                          rows={2}
                          value={answers[fu.id] || ""}
                          onChange={(e) => handleTextChange(fu.id, e.target.value)}
                          placeholder="Add deeper reflection..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-stone-700 text-xs text-stone-200 focus:border-emerald-400 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-7">
                <Link
                  href="/case/spiritual/intake/step-1"
                  className="px-6 py-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 text-sm font-medium hover:bg-stone-800 transition-colors"
                >
                  ← Back
                </Link>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-base shadow-xl shadow-amber-500/20 transition-all"
                >
                  {isSubmitting ? "Submitting to Debtera..." : "Review Divination Reveal →"}
                </button>
              </div>
            </section>

            <aside className="rounded-[2rem] border border-stone-800 bg-stone-900/60 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-300">Reading Stream</div>
                  <div className="mt-2 text-xs text-stone-500">Intake Circuit // 02</div>
                </div>
                <span className="rounded-full border border-emerald-500/50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
                  Active
                </span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">Branch Quality</span>
                    <span className="text-emerald-300 text-xs font-bold">
                      {isAILoading ? "Synced" : "Ready"}
                    </span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-stone-800">
                    <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-amber-300 to-emerald-400" />
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Case Context</div>
                  <div className="mt-2 font-serif text-2xl font-black text-amber-100">
                    {gematriaData?.nameGeez || "Oracle Signal"}
                  </div>
                  <div className="mt-2 text-[11px] text-stone-400">
                    {gematriaData?.zodiac?.name || "Constellation"} / {gematriaData?.awdeCircle?.nameAmharic || "Awde"}
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Inquiry Focus</div>
                  <div className="mt-2 text-sm font-bold text-stone-100">
                    {category === "life_direction" ? "Life Direction" : category.replace(/_/g, " ")}
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-black/20 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Clarifying Signals</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-amber-500/40 px-3 py-1 text-[10px] font-bold text-amber-100">{followUps.length || 0} active</span>
                    <span className="rounded-full border border-emerald-500/40 px-3 py-1 text-[10px] font-bold text-emerald-100">
                      {crisisState?.isCrisis ? "Care watch" : "Stable"}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}

export default function SpiritualStep2Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950 text-amber-200 flex items-center justify-center">Loading inquiry...</div>}>
      <SpiritualStep2Content />
    </Suspense>
  );
}
