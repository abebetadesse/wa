"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, ClipboardList, ShieldCheck } from "lucide-react";
import { withBasePath } from '@/lib/base-path';

interface WorkspaceData {
  provider: { name: string | null; role: string; verified: boolean; language: string; region: string | null };
  queue: { urgent: number; awaitingReview: number; awaitingClient: number; bookedToday: number };
  quality: { responseTimeTarget: string; approvalRequiredBeforeRelease: boolean; auditTrailEnabled: boolean };
  capabilities: Array<{ id: string; title: string; value: string; status: string }>;
}

export default function ProviderExperience() {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(withBasePath("/api/provider/workspace"))
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error || "Unable to load provider workspace.");
        setData(payload.data);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load provider workspace."));
  }, []);

  if (error) return <main className="mx-auto max-w-6xl p-6 text-danger-strong">{error}</main>;
  if (!data) return <main className="mx-auto max-w-6xl p-6 text-soft">Loading provider workspace...</main>;

  const queueCards = [
    ["Urgent", data.queue.urgent, AlertTriangle, "text-danger"],
    ["Awaiting review", data.queue.awaitingReview, ClipboardList, "text-gold"],
    ["Awaiting client", data.queue.awaitingClient, Clock3, "text-info"],
    ["Booked today", data.queue.bookedToday, CheckCircle2, "text-brand"],
  ] as const;

  return <main className="mx-auto max-w-6xl space-y-8 p-6 text-foreground">
    <header className="rounded-3xl border border-info/20 bg-background/80 p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-info">Provider workspace</p><h1 className="text-3xl font-bold">Help more people with a safer, clearer queue</h1><p className="mt-3 text-sm text-soft">Welcome{data.provider.name ? `, ${data.provider.name}` : ""}. Review structured cases, approve AI-assisted work, and keep human judgment in control.</p></div>
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs"><ShieldCheck className="mr-2 inline text-brand" size={16} />{data.provider.verified ? "Verified provider" : "Verification pending"}</div>
      </div>
    </header>
    <section className="grid gap-4 md:grid-cols-4">{queueCards.map(([label, count, Icon, color]) => <div key={label} className="rounded-2xl border border-border bg-card/80 p-5"><Icon className={color} size={22} /><p className="mt-4 text-3xl font-bold">{count}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}</section>
    <section className="grid gap-5 md:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card/70 p-6 md:col-span-2"><h2 className="text-lg font-semibold">Provider operating standard</h2><ul className="mt-4 space-y-3 text-sm text-soft"><li><CheckCircle2 className="mr-2 inline text-brand" size={16} />{data.quality.responseTimeTarget}</li><li><CheckCircle2 className="mr-2 inline text-brand" size={16} />Human approval is required before a reviewed report is released: {data.quality.approvalRequiredBeforeRelease ? "yes" : "no"}</li><li><CheckCircle2 className="mr-2 inline text-brand" size={16} />Audit trail enabled: {data.quality.auditTrailEnabled ? "yes" : "no"}</li></ul><Link href="/admin/analytics" className="mt-6 inline-block text-sm font-semibold text-info">View platform quality analytics →</Link></div>
      <div className="rounded-2xl border border-border bg-card/70 p-6"><h2 className="text-lg font-semibold">Connected capabilities</h2><ul className="mt-4 space-y-3 text-xs text-muted-foreground">{data.capabilities.slice(0, 8).map((capability) => <li key={capability.id}><span className="mr-2 text-brand">●</span>{capability.title}</li>)}</ul></div>
    </section>
  </main>;
}
