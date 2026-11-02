"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Sparkles, LockKeyhole, BookOpenCheck, Users } from "lucide-react";
import type { TrustSnapshot } from "@/lib/platform/enhancementCatalog";
import { withBasePath } from '@/lib/base-path';

export default function TrustExperience() {
  const [snapshot, setSnapshot] = useState<TrustSnapshot | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(withBasePath("/api/platform/trust"))
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error || "Unable to load trust information.");
        setSnapshot(payload.data);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load trust information."));
  }, []);

  if (error) return <main className="mx-auto max-w-5xl p-6 text-danger-strong">{error}</main>;
  if (!snapshot) return <main className="mx-auto max-w-5xl p-6 text-soft">Loading trust and safety information...</main>;

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6 text-foreground">
      <header className="rounded-3xl border border-brand/20 bg-background/80 p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-brand">Trust & Care Center</p>
            <h1 className="text-3xl font-bold">Safe, explainable, culturally aware support</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-soft">
              Get fast guidance that explains its sources, protects your safety, and connects you to a verified professional when human expertise is needed.
            </p>
          </div>
          <Link href="/case" className="rounded-xl bg-brand px-4 py-3 text-sm font-bold text-brand-foreground">Start a guided case</Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          [ShieldCheck, "Safety first", "Triage runs before advice."],
          [BookOpenCheck, "Evidence visible", "Sources and explanations stay attached."],
          [LockKeyhole, "Privacy aware", "Sensitive profile fields are protected."],
          [Users, "Human escalation", "Verified providers remain in control."],
        ].map(([Icon, title, description]) => {
          const Component = Icon as typeof ShieldCheck;
          return <div key={title as string} className="rounded-2xl border border-border bg-card/80 p-5"><Component className="mb-3 text-brand" size={22} /><h2 className="font-semibold">{title as string}</h2><p className="mt-2 text-xs text-muted-foreground">{description as string}</p></div>;
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/70 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Sparkles size={18} className="text-gold" /> AI reliability</h2>
          <ul className="space-y-3 text-sm text-soft">
            <li><CheckCircle2 className="mr-2 inline text-brand" size={16} />Mode: {snapshot.ai.mode === "bionic_gpt" ? "Bionic GPT with fallback" : "Deterministic safety-aware fallback"}</li>
            <li><CheckCircle2 className="mr-2 inline text-brand" size={16} />Recent context retained: {snapshot.ai.contextWindowMessages} messages</li>
            <li><CheckCircle2 className="mr-2 inline text-brand" size={16} />Scientific and cultural reasoning are firewalled</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-6">
          <h2 className="mb-4 text-lg font-semibold">What you can inspect</h2>
          <p className="text-sm leading-6 text-soft">{snapshot.evidence.sourceTypes.join(" • ")}</p>
          <p className="mt-4 text-xs text-muted-foreground">{snapshot.evidence.freshnessLabel}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/70 p-6">
        <h2 className="mb-4 text-lg font-semibold">20 connected trust and care capabilities</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {snapshot.capabilities.map((capability) => <div key={capability.id} className="rounded-xl border border-border bg-background/60 p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{capability.title}</h3><span className="text-[10px] uppercase text-brand">{capability.status}</span></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{capability.value}</p></div>)}
        </div>
      </section>
    </main>
  );
}
