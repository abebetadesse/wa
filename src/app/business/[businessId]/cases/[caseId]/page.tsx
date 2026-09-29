"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Hand, Lock, ShieldAlert, Undo2 } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, CardHeader, CardTitle, ErrorState, Field, LoadingState, Textarea } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useWorkspace } from "@/features/workspace/WorkspaceContext";
import { useSession } from "@/features/session/SessionProvider";
import { useToast } from "@/features/feedback/Toaster";
import { cn } from "@/lib/utils";

interface ExpertView {
  id: string;
  label: string;
  stage: string;
  createdAt: string;
  safety: { action: string; priority: string; reason?: string; support?: { title: string; message: string } };
  answers: Record<string, unknown>;
  draft: {
    title: string;
    summary: string;
    sections: { id: string; title: string; body?: string; items?: string[]; locked: boolean; cultural?: boolean }[];
    disclaimer: string;
    aiAssisted: boolean;
  } | null;
  review: { expertId: string; claimedAt: string; approvedAt?: string; notes?: string } | null;
  checklist: { id: string; label: string }[];
  questions: { id: string; text: string; options: { value: string; label: string }[] }[];
}

function answerText(question: ExpertView["questions"][number] | undefined, value: unknown) {
  const values = Array.isArray(value) ? value : [value];
  return values
    .map((v) => question?.options.find((option) => option.value === v)?.label ?? String(v ?? ""))
    .filter(Boolean)
    .join(", ");
}

export default function CaseReviewPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { business, base } = useWorkspace();
  const { user } = useSession();
  const toast = useToast();
  const { data, setData, error, reload } = useApi<ExpertView>(`/api/workspace/businesses/${business.id}/cases/${caseId}`, { liveTypes: ["case."] });
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function act(path: string, method: "POST" | "DELETE", body?: unknown, success?: string) {
    setBusy(true);
    try {
      setData(await apiFetch<ExpertView>(`/api/workspace/businesses/${business.id}/cases/${caseId}/${path}`, { method, json: body }));
      if (success) toast({ tone: "success", title: success });
    } catch (err) {
      toast({ tone: "error", title: "Could not update the case", body: errorMessage(err) });
      reload();
    } finally {
      setBusy(false);
    }
  }

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState label="Loading case…" />;

  const mine = data.review?.expertId === user?.id;
  const questionById = new Map(data.questions.map((q) => [q.id, q]));
  const answered = Object.entries(data.answers).filter(([, value]) => value !== undefined && value !== "" && !(Array.isArray(value) && !value.length));
  const allChecked = data.checklist.every((item) => checked[item.id]);

  return (
    <div className="flex flex-col gap-6">
      <Link href={`${base}/cases`} className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Cases
      </Link>

      <header className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">{data.label}</h1>
        <Badge tone={data.stage === "awaiting_expert" ? "warning" : data.stage === "in_review" ? "brand" : "success"}>
          {data.stage === "awaiting_expert" ? "Waiting" : data.stage === "in_review" ? (mine ? "You are reviewing" : "In review") : "Approved"}
        </Badge>
      </header>

      {data.safety.action !== "proceed" && (
        <Alert tone={data.safety.priority === "urgent" ? "danger" : "warning"} title="Safety screen">
          {data.safety.reason ?? "The client's safety answers need attention."} Address this first and refer to professional support where needed.
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle>Client&apos;s answers</CardTitle></CardHeader>
            <CardContent>
              {answered.length === 0 ? (
                <p className="text-sm text-muted-foreground">No answers recorded.</p>
              ) : (
                <dl className="flex flex-col gap-4">
                  {answered.map(([id, value]) => {
                    const question = questionById.get(id);
                    const text = answerText(question, value);
                    return (
                      <div key={id}>
                        <dt className="text-sm text-muted-foreground">{question?.text ?? id}</dt>
                        <dd lang={/[ሀ-፿]/.test(text) ? "am" : undefined} className={cn("mt-0.5 whitespace-pre-wrap font-semibold text-foreground", /[ሀ-፿]/.test(text) && "font-geez")}>{text}</dd>
                      </div>
                    );
                  })}
                </dl>
              )}
            </CardContent>
          </Card>

          {data.draft && (
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>Draft report</CardTitle>
                  {data.draft.aiAssisted && <Badge tone="neutral">AI-assisted — check carefully</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{data.draft.summary}</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {data.draft.sections.map((section) => (
                  <div key={section.id} className={cn("rounded-2xl border p-4", section.cultural ? "border-gold/30" : "border-border")}>
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      {section.title}
                      {section.locked && <Lock className="size-3.5 text-muted-foreground" aria-label="In the full report" />}
                      {section.cultural && <Badge tone="gold">Cultural</Badge>}
                    </p>
                    {section.body && <p className="mt-1 text-sm text-foreground">{section.body}</p>}
                    {section.items && section.items.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                        {section.items.map((item) => <li key={item} className={/[ሀ-፿]/.test(item) ? "font-geez" : undefined}>{item}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">{data.draft.disclaimer}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-24 xl:self-start">
          {data.stage === "awaiting_expert" && (
            <Card>
              <CardContent className="flex flex-col gap-3 pt-6">
                <p className="text-sm text-muted-foreground">Claim this case so the rest of your team knows you&apos;re reviewing it.</p>
                <Button onClick={() => act("claim", "POST", undefined, "Case claimed")} disabled={busy}><Hand className="size-4" aria-hidden="true" /> Claim and review</Button>
              </CardContent>
            </Card>
          )}

          {data.stage === "in_review" && !mine && (
            <Alert tone="info" title="Another team member is reviewing this case">They can release it if you should take over.</Alert>
          )}

          {data.stage === "in_review" && mine && (
            <Card>
              <CardHeader><CardTitle className="text-base">Approve the report</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4">
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1 text-sm font-semibold text-foreground">Review checklist</legend>
                  {data.checklist.map((item) => (
                    <label key={item.id} className="flex items-start gap-2 text-sm text-foreground">
                      <input type="checkbox" checked={Boolean(checked[item.id])} onChange={(e) => setChecked((c) => ({ ...c, [item.id]: e.target.checked }))} className="mt-0.5 size-4 accent-[var(--brand-accent)]" />
                      {item.label}
                    </label>
                  ))}
                </fieldset>
                <Field label="Note to the client (optional)" hint="Shown with the approved report.">
                  {(control) => <Textarea {...control} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />}
                </Field>
                <Button onClick={() => act("approve", "POST", { checklist: checked, notes: notes.trim() || undefined }, "Report approved — the client has been notified")} disabled={busy || !allChecked}>
                  <CheckCircle2 className="size-4" aria-hidden="true" /> Approve and share
                </Button>
                <Button variant="ghost" size="sm" onClick={() => act("claim", "DELETE", undefined, "Case released")} disabled={busy}>
                  <Undo2 className="size-4" aria-hidden="true" /> Release to the team
                </Button>
              </CardContent>
            </Card>
          )}

          {data.review?.approvedAt && (
            <Alert tone="success" title="Approved">
              {new Date(data.review.approvedAt).toLocaleString()}
              {data.review.notes ? ` — “${data.review.notes}”` : ""}
            </Alert>
          )}

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldAlert className="size-3.5" aria-hidden="true" /> Opened {new Date(data.createdAt).toLocaleString()}
          </p>
        </aside>
      </div>
    </div>
  );
}
