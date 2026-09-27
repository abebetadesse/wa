"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { SpiritualIntakeProgress } from "@/components/case/SpiritualIntakeProgress";

type ProcessingStatus = {
  status: string;
  hasReport: boolean;
  nameGeez: string;
  category: string;
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
    fetch(`/api/case/spiritual/${caseId}/status`, { credentials: "include", cache: "no-store" })
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
    <main className="min-h-screen bg-stone-950 px-4 py-12 text-stone-100 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 text-xs text-stone-400">
          <Link href={`/case/spiritual/${caseId}/divination`} className="hover:text-amber-400">← Cultural reading</Link>
          <span className="rounded-full bg-amber-500/10 px-3 py-1 font-mono text-amber-300">STEP 4 OF 5: DRAFT PROCESSING</span>
        </div>
        <SpiritualIntakeProgress current={4} />

        <header className="space-y-3">
          <h1 className="font-serif text-3xl font-black text-amber-100 sm:text-4xl">Your answers have been processed</h1>
          <p className="text-sm leading-6 text-stone-300">
            This step prepares an AI-assisted reflection from the name calculation and the answers you submitted.
            It is not a clinical assessment, prediction, or human practitioner review.
          </p>
        </header>

        {loading && <p role="status" className="rounded-2xl border border-stone-800 bg-stone-900 p-5 text-sm text-stone-300">Checking the saved case status…</p>}
        {error && (
          <div role="alert" className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-5 text-sm text-rose-200">
            {error} {error.startsWith("Sign in") ? <Link href="/auth" className="font-bold underline underline-offset-2">Sign in</Link> : null}
          </div>
        )}
        {caseInfo && (
          <section className="space-y-4 rounded-3xl border border-amber-500/30 bg-stone-900/80 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white">Processing record</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${draftReady ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-200"}`}>
                {draftReady ? "Draft ready" : caseInfo.status.replaceAll("_", " ")}
              </span>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-stone-500">Name entered</dt><dd className="mt-1 text-stone-200">{caseInfo.nameGeez}</dd></div>
              <div><dt className="text-xs text-stone-500">Selected focus</dt><dd className="mt-1 text-stone-200">{caseInfo.category.replaceAll("_", " ")}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-stone-500">Last updated</dt><dd className="mt-1 text-stone-300">{new Date(caseInfo.lastUpdated).toLocaleString()}</dd></div>
            </dl>
            {!draftReady && <p className="text-sm text-amber-200">The report draft is not available yet. Return to the cultural reading and submit processing again.</p>}
            {draftReady && (
              <Link href={`/case/spiritual/${caseId}/preview`} className="inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black hover:bg-amber-400">
                Continue to Step 5: Review draft →
              </Link>
            )}
          </section>
        )}

        <p className="text-xs leading-5 text-stone-500">
          If you need urgent help or feel unsafe, contact local emergency services or a trusted person now. This reflective workflow is not crisis support.
        </p>
      </section>
    </main>
  );
}
