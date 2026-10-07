"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/features/session/SessionProvider";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { AnalysisPanel, cleanDraft, Conversation, DraftEditor, type DraftState } from "@/features/cases/review/ReviewPanels";
import type { CaseAnalysis, CaseMessage, ReportSection } from "@/server/cases/types";

interface ReviewItem {
  id: string;
  domain: string;
  label: string;
  stage: string;
  assignedRole: string | null;
  createdAt: string;
  updatedAt: string;
  consent: { dataUsage: boolean };
  safety: { action: string; priority: string; reason?: string };
  answers: Record<string, unknown>;
  draft: DraftState | null;
  review: { expertId: string; notes?: string } | null;
  checklist: Array<{ id: string; label: string }>;
  questions: Array<{ id: string; text: string; options: Array<{ value: string; label: string }> }>;
  messages: CaseMessage[];
  analysis: CaseAnalysis | null;
}

const POLL_MS = 30_000;

function answerText(question: ReviewItem["questions"][number], value: unknown) {
  const values = Array.isArray(value) ? value : [value];
  const text = values
    .map((entry) => question.options.find((option) => option.value === entry)?.label ?? String(entry ?? ""))
    .filter(Boolean)
    .join(", ");
  return text || "—";
}

export default function CaseReviewItemPage() {
  const params = useParams<{ caseId: string }>();
  const { user } = useSession();
  const [item, setItem] = useState<ReviewItem | null>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [dirty, setDirty] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const base = `/api/expert/cases/${params.caseId}`;

  /** `keepEdits`: a background refresh must not overwrite a report the reviewer is editing. */
  const apply = useCallback((result: ReviewItem, keepEdits = false) => {
    setItem(result);
    if (!keepEdits) {
      setDraft(result.draft);
      setDirty(false);
    }
  }, []);

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await apiFetch<ReviewItem>(base);
      apply(result);
      setNotes(result.review?.notes ?? "");
      setChecked(Object.fromEntries(result.checklist.map((entry) => [entry.id, false])));
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }, [apply, base]);

  useEffect(() => { void load(); }, [load]);

  // While the case is open, pick up the person's replies (and the refreshed analysis) without a reload.
  const stage = item?.stage;
  useEffect(() => {
    if (stage !== "awaiting_expert" && stage !== "in_review") return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      apiFetch<ReviewItem>(base).then((result) => apply(result, true)).catch(() => null);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [apply, base, stage]);

  async function run(action: () => Promise<ReviewItem | void>, done?: string, keepEdits = false) {
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const result = await action();
      if (result) apply(result, keepEdits);
      if (done) setStatus(done);
      return true;
    } catch (cause) {
      setError(errorMessage(cause));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const claim = () =>
    run(async () => {
      const result = await apiFetch<ReviewItem>(`${base}/claim`, { method: "POST" });
      setChecked(Object.fromEntries(result.checklist.map((entry) => [entry.id, false])));
      return result;
    }, "Request claimed. The person has been told a reviewer has started.");

  const saveDraft = () => (draft ? run(() => apiFetch<ReviewItem>(base, { method: "PATCH", json: { draft: cleanDraft(draft) } }), "Draft saved.") : Promise.resolve(false));

  async function send(kind: CaseMessage["kind"], body = message) {
    const sent = await run(() => apiFetch<ReviewItem>(`${base}/messages`, { method: "POST", json: { body, kind } }), kind === "question" ? "Question sent. You will be notified when the person replies." : "Message sent.", true);
    if (sent && body === message) setMessage("");
  }

  const reanalyse = () => run(() => apiFetch<ReviewItem>(`${base}/analysis`, { method: "POST" }), "Analysis updated.", true);

  const approve = () =>
    run(async () => {
      await apiFetch(`${base}/approve`, { method: "POST", json: { checklist: checked, notes: notes.trim() || undefined, draft: draft ? cleanDraft(draft) : undefined } });
      await load();
    });

  function addSection(section: ReportSection) {
    if (!draft) return;
    setDraft({ ...draft, sections: [...draft.sections, section] });
    setDirty(true);
    setStatus(`“${section.title}” was added to the end of the report. Edit it there before approving.`);
  }

  function addSections(sections: ReportSection[]) {
    if (!draft || !sections.length) return;
    const generatedIds = new Set(sections.map((section) => section.id));
    setDraft({ ...draft, sections: [...draft.sections.filter((section) => !generatedIds.has(section.id)), ...sections] });
    setDirty(true);
    setStatus("Detailed report sections added or refreshed from the latest analysis. Review and edit them before approving.");
  }

  const mayAct = Boolean(user && item?.review?.expertId === user.id && item.stage === "in_review");
  const allChecked = Boolean(item?.checklist.length && item.checklist.every((entry) => checked[entry.id]));
  const reportValid = Boolean(draft && draft.title.trim() && draft.summary.trim());

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <Link href="/case-review" className="text-sm text-emerald-300 hover:underline">← Back to requests</Link>
      {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-200">{error}</p>}
      {status && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-sm text-emerald-200">{status}</p>}
      {!item && !error && <p className="text-sm text-slate-400">Loading request…</p>}
      {item && (
        <>
          <header>
            <p className="text-xs uppercase tracking-wide text-slate-400">{item.label} · {item.safety.priority} priority · Assigned role: {item.assignedRole ?? "expert pool"}</p>
            <h1 className="mt-2 text-2xl font-bold text-white">Review case request</h1>
            <p className="mt-2 text-xs text-slate-400">
              Received {new Date(item.createdAt).toLocaleString()} · last activity {new Date(item.updatedAt).toLocaleString()} · stage: {item.stage.replace(/_/g, " ")}
              {" · "}{item.messages.length} message{item.messages.length === 1 ? "" : "s"}
              {" · "}profile use {item.consent.dataUsage ? "consented" : "not consented"}
              {item.draft && <> · report draft: {item.draft.sections.length} sections</>}
            </p>
          </header>
          {item.safety.reason && <aside className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-100">Safety note: {item.safety.reason}</aside>}
          {item.stage === "awaiting_expert" && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <p className="min-w-0 flex-1 text-sm text-emerald-100">Claim this request to edit the report and write to the person.</p>
              <button disabled={busy} onClick={() => void claim()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "Claiming…" : "Claim request"}
              </button>
            </div>
          )}
          {item.stage === "in_review" && !mayAct && <p className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-100">This request is claimed by another reviewer. You can read it but not change it.</p>}

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-semibold text-white">What the person told us</h2>
            <dl className="mt-4 grid gap-3">
              {item.questions.filter((question) => item.answers[question.id] !== undefined && question.id !== "mediaId" && question.id !== "mediaKind").map((question) => (
                <div key={question.id}>
                  <dt className="text-xs text-slate-400">{question.text}</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-200">{answerText(question, item.answers[question.id])}</dd>
                </div>
              ))}
              {item.domain === "biological" && typeof item.answers.mediaId === "string" && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-200">Client audio/video attachment</p>
                  {item.answers.mediaKind === "video"
                    ? <video controls src={`/api/case-workflows/media/${encodeURIComponent(item.answers.mediaId)}`} className="mt-2 max-h-72 w-full rounded-xl" />
                    : <audio controls src={`/api/case-workflows/media/${encodeURIComponent(item.answers.mediaId)}`} className="mt-2 w-full" />}
                </div>
              )}
            </dl>
          </section>

          {item.analysis ? (
            <AnalysisPanel analysis={item.analysis} canAct={mayAct} busy={busy} onAddSection={addSection} onAddSections={addSections} profileConsented={item.consent.dataUsage} onAsk={(question) => void send("question", question)} onReanalyse={() => void reanalyse()} />
          ) : (
            (item.stage === "awaiting_expert" || item.stage === "in_review") && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="min-w-0 flex-1 text-sm text-slate-300">No analysis is stored for this request yet.</p>
                <button type="button" disabled={busy} onClick={() => void reanalyse()} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-50">Run analysis</button>
              </div>
            )
          )}

          <Conversation messages={item.messages} canAct={mayAct} busy={busy} discreet={item.safety.action !== "proceed"} value={message} onChange={setMessage} onSend={(kind) => void send(kind)} />

          {draft && mayAct && (
            <DraftEditor draft={draft} onChange={(next) => { setDraft(next); setDirty(true); }} dirty={dirty} busy={busy} onSave={() => void saveDraft()} />
          )}
          {draft && !mayAct && (
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-lg font-semibold text-white">{draft.title}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-200">{draft.summary}</p>
              <div className="mt-5 grid gap-4">
                {draft.sections.map((section) => (
                  <article key={section.id} className="border-t border-white/10 pt-4">
                    <h3 className="font-medium text-white">{section.title}</h3>
                    {section.body && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{section.body}</p>}
                    {section.items?.length ? <ul className="mt-2 list-disc pl-5 text-sm text-slate-300">{section.items.map((entry, index) => <li key={`${section.id}-${index}`}>{entry}</li>)}</ul> : null}
                  </article>
                ))}
              </div>
              <p className="mt-5 text-xs text-slate-400">{draft.disclaimer}</p>
            </section>
          )}

          {mayAct && (
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="font-semibold text-white">Approve and send</h2>
              <div className="mt-3 grid gap-3">
                {item.checklist.map((entry) => (
                  <label key={entry.id} className="flex items-start gap-3 text-sm text-slate-200">
                    <input type="checkbox" checked={checked[entry.id] ?? false} onChange={(event) => setChecked((current) => ({ ...current, [entry.id]: event.target.checked }))} className="mt-0.5 accent-emerald-500" />
                    {entry.label}
                  </label>
                ))}
              </div>
              <label className="mt-5 grid gap-2 text-sm font-medium text-slate-200">
                Your message to the person
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={4000} rows={4} className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm" placeholder="Sent with the notification that the report is ready, in the app and on their Telegram or WhatsApp." />
              </label>
              {!reportValid && <p className="mt-3 text-xs text-amber-200">The report needs a title and a summary.</p>}
              <button disabled={busy || !allChecked || !reportValid} onClick={() => void approve()} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Sending response…" : "Approve and send response"}</button>
            </section>
          )}
          {["visible_to_user", "full_report_released", "consultation_requested"].includes(item.stage) && <p className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-200">Response approved. The person has been notified in the app and on the chat apps they connected.</p>}
        </>
      )}
    </main>
  );
}
