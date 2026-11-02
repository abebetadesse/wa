"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { SpiritualIntakeProgress } from "@/components/case/SpiritualIntakeProgress";
import { withBasePath } from '@/lib/base-path';

type ProcessingStatus = {
  status: string;
  hasReport: boolean;
  nameGeez: string;
  category: string;
  serviceChoice?: {
    id: string;
    title: string;
    label: string;
    prayer: string;
    prayerGe?: string;
    telsemName?: string | null;
  } | null;
  lastUpdated: string;
};

export default function SpiritualStatusPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);
  const [caseInfo, setCaseInfo] = useState<ProcessingStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(withBasePath(`/api/case/spiritual/${caseId}/status`), { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error || "Unable to load processing status.");
        return payload.data as ProcessingStatus;
      })
      .then((data) => {
        if (active) setCaseInfo(data);
      })
      .catch((caught) => {
        const message = caught instanceof Error ? caught.message : "Unable to load processing status.";
        if (active) setError(message === "AUTH_REQUIRED" ? "Sign in with the account that started this reading." : message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [caseId]);

  const draftReady = caseInfo?.hasReport === true && caseInfo.status === "ai_draft_prepared";

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-4 text-xs text-muted-foreground">
          <Link href={`/case/spiritual/${caseId}/divination`} className="hover:text-gold">← Cultural reading</Link>
          <span className="rounded-full bg-gold/10 px-3 py-1 font-mono text-gold-strong">STEP 4 OF 5: DRAFT PROCESSING</span>
        </div>
        <SpiritualIntakeProgress current={4} />

        <header className="space-y-3">
          <h1 className="font-serif text-3xl font-bold text-gold-strong sm:text-4xl">Your answers have been processed</h1>
          <p className="text-sm leading-6 text-soft">
            This step prepares an AI-assisted reflection from the name calculation and the answers you submitted.
            It is not a clinical assessment, prediction, or human practitioner review.
          </p>
        </header>

        {loading && <p role="status" className="rounded-2xl border border-border bg-card p-5 text-sm text-soft">Checking the saved case status…</p>}
        {error && (
          <div role="alert" className="rounded-2xl border border-danger/40 bg-danger-soft p-5 text-sm text-danger-strong">
            {error} {error.startsWith("Sign in") ? <Link href="/auth" className="font-bold underline underline-offset-2">Sign in</Link> : null}
          </div>
        )}
        {caseInfo && (
          <section className="space-y-4 rounded-3xl border border-gold/30 bg-card/80 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-foreground">Processing record</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${draftReady ? "bg-brand/15 text-brand-strong" : "bg-gold/15 text-gold-strong"}`}>
                {draftReady ? "Draft ready" : caseInfo.status.replaceAll("_", " ")}
              </span>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-subtle">Name entered</dt><dd className="mt-1 text-soft">{caseInfo.nameGeez}</dd></div>
              <div><dt className="text-xs text-subtle">Selected focus</dt><dd className="mt-1 text-soft">{caseInfo.serviceChoice?.title || caseInfo.category.replaceAll("_", " ")}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-subtle">Last updated</dt><dd className="mt-1 text-soft">{new Date(caseInfo.lastUpdated).toLocaleString()}</dd></div>
            </dl>
            {caseInfo.serviceChoice && (
              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">Prayer focus</div>
                <h3 className="mt-2 text-xl font-bold text-gold-strong">{caseInfo.serviceChoice.title}</h3>
                <p className="mt-2 text-sm leading-6 text-soft">“{caseInfo.serviceChoice.prayer}”</p>
                {caseInfo.serviceChoice.telsemName && (
                  <p className="mt-2 text-xs text-brand-strong">Telsem: {caseInfo.serviceChoice.telsemName}</p>
                )}
              </div>
            )}
            {!draftReady && <p className="text-sm text-gold-strong">The report draft is not available yet. Return to the cultural reading and submit processing again.</p>}
            {draftReady && (
              <Link href={`/case/spiritual/${caseId}/preview`} className="inline-flex rounded-xl bg-gold-fill px-5 py-3 text-sm font-bold text-gold-foreground hover:bg-gold-fill">
                Continue to Step 5: Review draft →
              </Link>
            )}
          </section>
        )}

        <p className="text-xs leading-5 text-subtle">
          If you need urgent help or feel unsafe, contact local emergency services or a trusted person now. This reflective workflow is not crisis support.
        </p>
      </section>
    </main>
  );
}
