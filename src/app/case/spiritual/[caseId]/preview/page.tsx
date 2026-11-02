"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { SpiritualIntakeProgress } from "@/components/case/SpiritualIntakeProgress";
import { withBasePath } from '@/lib/base-path';

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
    fetch(withBasePath(`/api/case/spiritual/${caseId}/preview`), { credentials: "include", cache: "no-store" })
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
    <main className="min-h-screen bg-background px-4 py-12 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-4 text-xs text-muted-foreground">
          <Link href={`/case/spiritual/${caseId}/status`} className="hover:text-gold">← Processing status</Link>
          <span className="rounded-full bg-gold/10 px-3 py-1 font-mono text-gold-strong">STEP 5 OF 5: READING PREVIEW</span>
        </div>
        <SpiritualIntakeProgress current={5} />

        <header className="space-y-3">
          <h1 className="font-serif text-3xl font-bold text-gold-strong sm:text-4xl">Your spiritual reflection draft</h1>
          <p className="text-sm leading-6 text-soft">
            This draft reflects the name calculation and answers you chose to submit. Review it for accuracy; it is not
            a prediction, professional assessment, or substitute for qualified support.
          </p>
        </header>

        {loading && <p role="status" className="rounded-2xl border border-border bg-card p-5 text-sm">Loading your saved draft…</p>}
        {error && (
          <div role="alert" className="rounded-2xl border border-danger/40 bg-danger-soft p-5 text-sm text-danger-strong">
            {error} {error.startsWith("Sign in") ? <Link href="/auth" className="font-bold underline underline-offset-2">Sign in</Link> : null}
          </div>
        )}
        {preview && (
          <>
            <div role="status" className="rounded-2xl border border-gold/30 bg-gold-soft p-4 text-sm text-gold-strong">
              {preview.draftNotice}
            </div>

            {preview.serviceChoice && (
              <section className="rounded-3xl border border-gold/30 bg-card/80 p-6">
                <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">Selected prayer focus</div>
                    <h2 className="mt-2 text-2xl font-bold text-gold-strong">{preview.serviceChoice.title}</h2>
                  </div>
                  <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold-strong">
                    {preview.serviceChoice.label}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-soft">“{preview.serviceChoice.prayer}”</p>
                {preview.serviceChoice.prayerGe && (
                  <p className="mt-3 text-sm italic text-brand-strong">{preview.serviceChoice.prayerGe}</p>
                )}
                {preview.serviceChoice.telsemName && (
                  <div className="mt-4 rounded-2xl border border-brand/30 bg-brand/5 p-3 text-sm text-brand-strong">
                    Telsem match: {preview.serviceChoice.telsemName}
                  </div>
                )}
              </section>
            )}

            <section className="space-y-3 rounded-3xl border border-gold/30 bg-card/80 p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gold">Name calculation · cultural reflection</h2>
              <p className="text-sm leading-7 text-soft">{preview.freeSummary}</p>
            </section>

            {preview.aiAnalysis && (
              <section className="space-y-5 rounded-3xl border border-border bg-card/70 p-6">
                <h2 className="text-xl font-bold text-foreground">Your submitted focus</h2>
                <p className="text-sm leading-7 text-soft">{preview.aiAnalysis.situationSummary}</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-strong">What you identified</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-soft">
                      {preview.aiAnalysis.strengths.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gold-strong">Limits and open questions</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-soft">
                      {preview.aiAnalysis.challenges.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
                    </ul>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gold-strong">Possible next steps</h3>
                  <ul className="mt-3 space-y-3">
                    {preview.aiAnalysis.strategicRecommendations.map((item, index) => (
                      <li key={`${index}-${item.title}`} className="rounded-xl border border-border bg-sunken/50 p-4">
                        <div className="font-semibold text-foreground">{item.title}</div>
                        <p className="mt-1 text-sm text-soft">{item.description}</p>
                        <span className="mt-2 inline-block text-[10px] uppercase tracking-wide text-subtle">{item.priority.replaceAll("_", " ")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {preview.culturalInterpretation && (
              <section className="space-y-3 rounded-3xl border border-border bg-card/70 p-6">
                <h2 className="text-lg font-bold text-gold-strong">Optional cultural reflection</h2>
                <p className="text-sm leading-7 text-soft">{preview.culturalInterpretation.narrative}</p>
                {preview.culturalInterpretation.references.map((reference) => (
                  <p key={reference} className="text-xs text-subtle">{reference}</p>
                ))}
              </section>
            )}

            {preview.practicalGuidance && (
              <section className="space-y-4 rounded-3xl border border-border bg-card/70 p-6">
                <h2 className="text-lg font-bold text-foreground">Practical reflection prompts</h2>
                <ol className="space-y-3">
                  {preview.practicalGuidance.steps.map((step) => (
                    <li key={step.order} className="rounded-xl border border-border bg-sunken/50 p-4">
                      <h3 className="font-semibold text-gold-strong">{step.order}. {step.title}</h3>
                      <p className="mt-1 text-sm text-soft">{step.description}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {preview.recommendedRitual && (
              <section className="space-y-2 rounded-3xl border border-border bg-card/70 p-6">
                <h2 className="text-lg font-bold text-gold-strong">{preview.recommendedRitual.title}</h2>
                <p className="text-sm text-soft">{preview.recommendedRitual.description}</p>
                <p className="text-xs text-subtle">{preview.recommendedRitual.timing} · {preview.recommendedRitual.materials.join(", ")}</p>
              </section>
            )}

            <p className="text-xs leading-5 text-subtle">
              This is an AI-assisted cultural reflection draft. No human practitioner review, verified manuscript citation,
              health guidance, or promised outcome is represented here.
            </p>
            <Link href="/case/workflows/new/spiritual" className="inline-flex rounded-xl border border-border px-5 py-3 text-sm text-soft hover:border-gold">
              Start a new reading
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
