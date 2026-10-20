"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MessageSquareText, ShieldAlert } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface Turn {
  id: string;
  asker: "owner" | "reviewer";
  question: string;
  text: string;
  mode: "safety" | "model" | "passages" | "none";
  sources: Array<{ title: string; citation?: { title: string; source: string; url?: string } }>;
  createdAt: string;
}

/**
 * Questions about one case, answered only from the case (src/server/cases/assistant.ts). The person
 * asks about their released report; a reviewer about the whole case. `desk` matches the dark review desk.
 */
export function CaseAssistant({ caseId, variant = "owner" }: { caseId: string; variant?: "owner" | "desk" }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const desk = variant === "desk";

  useEffect(() => {
    apiFetch<Turn[]>(`/api/case-workflows/cases/${caseId}/assistant`).then(setTurns).catch(() => undefined);
  }, [caseId]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = question.trim();
    if (text.length < 3) return;
    setBusy(true);
    setError(null);
    try {
      const turn = await apiFetch<Turn>(`/api/case-workflows/cases/${caseId}/assistant`, { method: "POST", json: { question: text } });
      setTurns((current) => [...current, turn]);
      setQuestion("");
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={cn("flex flex-col gap-4 rounded-2xl border p-5", desk ? "border-white/10 bg-white/[0.03] text-slate-200" : "border-border bg-card text-card-foreground shadow-sm")}>
      <div>
        <h2 className={cn("flex items-center gap-2 font-semibold", desk ? "text-sm text-white" : "text-lg text-foreground")}>
          <MessageSquareText className="size-5 text-brand" aria-hidden="true" />
          {desk ? "Ask about this case" : "Ask about your report"}
        </h2>
        <p className={cn("mt-1 text-xs", desk ? "text-slate-400" : "text-muted-foreground")}>
          {desk
            ? "Answers come only from this case's answers, draft and analysis, with numbered sources."
            : "Answers come only from your report, with numbered sources. For anything else, write to your reviewer."}
        </p>
      </div>

      {turns.length > 0 && (
        <ol className="flex flex-col gap-4">
          {turns.map((turn) => (
            <li key={turn.id} className="flex flex-col gap-2">
              <p className={cn("self-end rounded-2xl px-3 py-2 text-sm", desk ? "bg-white/10" : "bg-muted")}>
                {desk && turn.asker === "owner" && <span className="mr-1 text-xs font-semibold text-amber-300">Client:</span>}
                {turn.question}
              </p>
              <div className={cn("rounded-2xl border px-3 py-2 text-sm", turn.mode === "safety" ? "border-danger/50 bg-danger/10" : desk ? "border-white/10" : "border-border")}>
                {turn.mode === "safety" && (
                  <>
                    <ShieldAlert className="mb-1 size-4 text-danger" aria-hidden="true" />
                    <p className="font-semibold">{turn.asker === "owner" ? "What you wrote may need urgent help. Please don't wait for an answer here." : "This question describes an emergency."}</p>
                  </>
                )}
                <p className="whitespace-pre-line">{turn.text}</p>
                {turn.mode === "safety" && turn.asker === "owner" && <p className="mt-1">Your reviewer has been told.</p>}
                {turn.sources.length > 0 && (
                  <ol className={cn("mt-2 flex flex-col gap-0.5 border-t pt-2 text-xs", desk ? "border-white/10 text-slate-400" : "border-border text-muted-foreground")}>
                    {turn.sources.map((source, index) => (
                      <li key={`${turn.id}-${index}`}>
                        [{index + 1}]{" "}
                        {source.citation?.url ? (
                          <a href={source.citation.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">{source.citation.title}</a>
                        ) : (
                          source.title
                        )}
                        {source.citation && !source.citation.url && <span> — {source.citation.source}</span>}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`assistant-${caseId}`}>{desk ? "Ask about this case" : "Ask about your report"}</label>
        <input
          id={`assistant-${caseId}`}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={1000}
          placeholder={desk ? "e.g. What did the person say about sleep?" : "e.g. Why does the report mention iron?"}
          className={cn("min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none", desk ? "border-white/15 bg-black/30 text-white placeholder:text-slate-500" : "border-input bg-background text-foreground")}
        />
        <button type="submit" disabled={busy || question.trim().length < 3} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? "Thinking…" : "Ask"}
        </button>
      </form>
      {error && <p role="alert" className="text-xs font-medium text-danger">{error}</p>}
    </section>
  );
}
