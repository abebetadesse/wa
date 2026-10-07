"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { SpiritualIntakeProgress } from "@/components/case/SpiritualIntakeProgress";

type PreviewData = {
  status: string;
  freeSummary: string;
  draftNotice: string;
  serviceChoice?: {
    id: string;
    title: string;
    label: string;
    prayer: string;
    prayerGe?: string;
    telsemName?: string | null;
  };
  aiAnalysis?: {
    situationSummary: string;
    strengths: string[];
    challenges: string[];
    strategicRecommendations: Array<{ title: string; description: string; priority: string }>;
    networkingSuggestions: string[];
    sectorInsights: string;
  };
  culturalInterpretation?: { narrative: string; references: string[] };
  practicalGuidance?: { steps: Array<{ order: number; title: string; description: string }>; expertNotes: string };
  recommendedRitual?: { title: string; description: string; timing: string; materials: string[]; expertNotes: string };
};

export default function SpiritualPreviewPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/case/spiritual/${caseId}/preview`, { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error || "The reading preview is unavailable.");
        return payload.data as PreviewData;
      })
      .then((data) => {
        if (active) setPreview(data);
      })
      .catch((caught) => {
        const message = caught instanceof Error ? caught.message : "The reading preview is unavailable.";
        if (active) setError(message === "AUTH_REQUIRED" ? "Sign in with the account that started this reading." : message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [caseId]);

  return (
    <main className="min-h-screen bg-stone-950 px-4 py-12 text-stone-100 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 text-xs text-stone-400">
          <Link href={`/case/spiritual/${caseId}/status`} className="hover:text-amber-400">← Processing status</Link>
          <span className="rounded-full bg-amber-500/10 px-3 py-1 font-mono text-amber-300">STEP 5 OF 5: READING PREVIEW</span>
        </div>
        <SpiritualIntakeProgress current={5} />

        <header className="space-y-3">
          <h1 className="font-serif text-3xl font-black text-amber-100 sm:text-4xl">Your spiritual reflection draft</h1>
          <p className="text-sm leading-6 text-stone-300">
            This draft reflects the name calculation and answers you chose to submit. Review it for accuracy; it is not
            a prediction, professional assessment, or substitute for qualified support.
          </p>
        </header>

        {loading && <p role="status" className="rounded-2xl border border-stone-800 bg-stone-900 p-5 text-sm">Loading your saved draft…</p>}
        {error && (
          <div role="alert" className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-5 text-sm text-rose-200">
            {error} {error.startsWith("Sign in") ? <Link href="/auth" className="font-bold underline underline-offset-2">Sign in</Link> : null}
          </div>
        )}
        {preview && (
          <>
            <div role="status" className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-100">
              {preview.draftNotice}
            </div>

            {preview.serviceChoice && (
              <section className="rounded-3xl border border-amber-500/30 bg-stone-900/80 p-6">
                <div className="flex items-center justify-between gap-3 border-b border-stone-800 pb-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Selected prayer focus</div>
                    <h2 className="mt-2 text-2xl font-bold text-amber-50">{preview.serviceChoice.title}</h2>
                  </div>
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                    {preview.serviceChoice.label}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-stone-200">“{preview.serviceChoice.prayer}”</p>
                {preview.serviceChoice.prayerGe && (
                  <p className="mt-3 text-sm italic text-emerald-200">{preview.serviceChoice.prayerGe}</p>
                )}
                {preview.serviceChoice.telsemName && (
                  <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-100">
                    Telsem match: {preview.serviceChoice.telsemName}
                  </div>
                )}
              </section>
            )}

            <section className="space-y-3 rounded-3xl border border-amber-500/30 bg-stone-900/80 p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-300">Name calculation · cultural reflection</h2>
              <p className="text-sm leading-7 text-stone-200">{preview.freeSummary}</p>
            </section>

            {preview.aiAnalysis && (
              <section className="space-y-5 rounded-3xl border border-stone-800 bg-stone-900/70 p-6">
                <h2 className="text-xl font-bold text-white">Your submitted focus</h2>
                <p className="text-sm leading-7 text-stone-200">{preview.aiAnalysis.situationSummary}</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-200">What you identified</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-300">
                      {preview.aiAnalysis.strengths.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-200">Limits and open questions</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-300">
                      {preview.aiAnalysis.challenges.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
                    </ul>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-200">Possible next steps</h3>
                  <ul className="mt-3 space-y-3">
                    {preview.aiAnalysis.strategicRecommendations.map((item, index) => (
                      <li key={`${index}-${item.title}`} className="rounded-xl border border-stone-800 bg-black/20 p-4">
                        <div className="font-semibold text-white">{item.title}</div>
                        <p className="mt-1 text-sm text-stone-300">{item.description}</p>
                        <span className="mt-2 inline-block text-[10px] uppercase tracking-wide text-stone-500">{item.priority.replaceAll("_", " ")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {preview.culturalInterpretation && (
              <section className="space-y-3 rounded-3xl border border-stone-800 bg-stone-900/70 p-6">
                <h2 className="text-lg font-bold text-amber-200">Optional cultural reflection</h2>
                <p className="text-sm leading-7 text-stone-300">{preview.culturalInterpretation.narrative}</p>
                {preview.culturalInterpretation.references.map((reference) => (
                  <p key={reference} className="text-xs text-stone-500">{reference}</p>
                ))}
              </section>
            )}

            {preview.practicalGuidance && (
              <section className="space-y-4 rounded-3xl border border-stone-800 bg-stone-900/70 p-6">
                <h2 className="text-lg font-bold text-white">Practical reflection prompts</h2>
                <ol className="space-y-3">
                  {preview.practicalGuidance.steps.map((step) => (
                    <li key={step.order} className="rounded-xl border border-stone-800 bg-black/20 p-4">
                      <h3 className="font-semibold text-amber-200">{step.order}. {step.title}</h3>
                      <p className="mt-1 text-sm text-stone-300">{step.description}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {preview.recommendedRitual && (
              <section className="space-y-2 rounded-3xl border border-stone-800 bg-stone-900/70 p-6">
                <h2 className="text-lg font-bold text-amber-200">{preview.recommendedRitual.title}</h2>
                <p className="text-sm text-stone-300">{preview.recommendedRitual.description}</p>
                <p className="text-xs text-stone-500">{preview.recommendedRitual.timing} · {preview.recommendedRitual.materials.join(", ")}</p>
              </section>
            )}

            <p className="text-xs leading-5 text-stone-500">
              This is an AI-assisted cultural reflection draft. No human practitioner review, verified manuscript citation,
              health guidance, or promised outcome is represented here.
            </p>
            <Link href="/case/spiritual/intake/step-1" className="inline-flex rounded-xl border border-stone-700 px-5 py-3 text-sm text-stone-200 hover:border-amber-400">
              Start a new reading
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
