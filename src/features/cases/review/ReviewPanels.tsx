"use client";

import { useState } from "react";
import type { AnalysisConfidence, CaseAnalysis, CaseMessage, GroundedFinding, ReportSection } from "@/server/cases/types";

export interface DraftState {
  title: string;
  summary: string;
  disclaimer: string;
  generatedAt: string;
  aiAssisted: boolean;
  sections: ReportSection[];
}

const panel = "rounded-xl border border-white/10 bg-white/[0.03] p-5";
const input = "w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500";
const smallButton = "rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-40";

const CONFIDENCE: Record<AnalysisConfidence, string> = {
  strong: "border-emerald-500/40 bg-emerald-950/40 text-emerald-200",
  moderate: "border-amber-500/40 bg-amber-950/40 text-amber-200",
  tentative: "border-slate-500/40 bg-slate-800/60 text-slate-300",
};
const HORIZON = { now: "Now", this_week: "This week", ongoing: "Ongoing" } as const;
const VIA = { app: "", telegram: " · via Telegram", whatsapp: " · via WhatsApp" } as const;

let sequence = 0;
const sectionId = (prefix: string) => `reviewer-${prefix}-${Date.now().toString(36)}-${++sequence}`;

// ── Analysis ─────────────────────────────────────────────────────────────────

interface AnalysisPanelProps {
  analysis: CaseAnalysis;
  /** The signed-in reviewer holds the claim and may edit, ask and re-run. */
  canAct: boolean;
  busy: boolean;
  onAddSection: (section: ReportSection) => void;
  onAsk: (question: string) => void;
  onReanalyse: () => void;
}

export function AnalysisPanel({ analysis, canAct, busy, onAddSection, onAsk, onReanalyse }: AnalysisPanelProps) {
  const reflectionOnly = analysis.publishScope === "reflection_only";
  // Reflection-only case types publish Domain B only, so evidence findings cannot be inserted with one click.
  const mayInsert = (layer: "A" | "B") => canAct && (layer === "B" || !reflectionOnly);
  const kept = analysis.strands.reduce((sum, strand) => sum + strand.kept, 0);
  const considered = analysis.strands.reduce((sum, strand) => sum + strand.considered, 0);
  const quality = analysis.dataQuality.score;

  const add = (title: string, body: string | undefined, items: string[], cultural = false) =>
    onAddSection({ id: sectionId(cultural ? "reflection" : "analysis"), title, body, items: items.length ? items : undefined, locked: false, ...(cultural ? { cultural: true } : {}) });

  return (
    <section className={`${panel} flex flex-col gap-5`} aria-label="Analysis for the reviewer">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Analysis for the reviewer</h2>
          <p className="mt-1 text-xs text-slate-400">
            Not shown to the person. {analysis.strands.length} knowledge strands were searched; {kept} of {considered} findings are supported by what the person said. Generated {new Date(analysis.generatedAt).toLocaleString()}.
          </p>
        </div>
        <button type="button" disabled={busy} onClick={onReanalyse} className={smallButton}>Run analysis again</button>
      </header>

      {reflectionOnly && (
        <p className="rounded-lg border border-violet-500/30 bg-violet-950/30 p-3 text-sm text-violet-100">
          This case type publishes cultural and spiritual reflection only. Evidence-based findings below are background for your judgement; only reflections can be added to the report from here.
        </p>
      )}
      {analysis.safety.warnings.length > 0 && (
        <div role="alert" className="rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-sm text-rose-100">
          <p className="font-semibold">Address first</p>
          <ul className="mt-1 list-disc pl-5">{analysis.safety.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
          {analysis.safety.domainBSuppressed && <p className="mt-2 text-xs text-rose-200">Cultural and spiritual reflections are withheld while a safety signal is active.</p>}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold">How much the analysis had to work with</span>
          <span className="tabular-nums">{quality} / 100</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={quality} aria-valuemin={0} aria-valuemax={100} aria-label="Data quality">
          <div className={`h-full rounded-full ${quality >= 60 ? "bg-emerald-500" : quality >= 35 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${quality}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-400">Used: {analysis.dataQuality.used.join(" · ")}</p>
        {analysis.dataQuality.gaps.length > 0 && <p className="mt-1 text-xs text-amber-200">Missing: {analysis.dataQuality.gaps.join(" · ")}</p>}
        {analysis.dataQuality.followUps.length > 0 && (
          <ul className="mt-3 grid gap-2">
            {analysis.dataQuality.followUps.map((question) => (
              <li key={question} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200">
                <span className="min-w-0 flex-1">{question}</span>
                <button type="button" disabled={!canAct || busy} onClick={() => onAsk(question)} className={smallButton}>Ask the person</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-white">Likely causes <span className="text-xs font-normal text-slate-400">(hypotheses to confirm, most weight first)</span></h3>
        {analysis.causes.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">The answers do not point to a cause yet. Ask a follow-up question above.</p>
        ) : (
          <ol className="mt-3 grid gap-3">
            {analysis.causes.map((cause, index) => (
              <li key={cause.id} className="rounded-lg border border-white/10 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 text-sm font-semibold text-white">{index + 1}. {cause.title}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${CONFIDENCE[cause.confidence]}`}>{cause.confidence}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{cause.explanation}</p>
                <ul className="mt-2 grid gap-1 border-l-2 border-white/15 pl-3 text-xs italic text-slate-300">
                  {cause.because.map((quote) => <li key={quote}>“{quote}”</li>)}
                </ul>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">{cause.strands.length ? `Supported by: ${cause.strands.join(", ")}` : "No supporting knowledge finding"}</span>
                  <button type="button" disabled={!mayInsert("A")} onClick={() => add(cause.title, cause.explanation, [])} className={smallButton}>Add to report</button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {analysis.solutions.length > 0 && (
        <div>
          <h3 className="font-semibold text-white">Proposed steps</h3>
          <ul className="mt-3 grid gap-3">
            {analysis.solutions.map((solution) => (
              <li key={solution.id} className="rounded-lg border border-white/10 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 text-sm font-semibold text-white">{solution.title}</p>
                  <span className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-slate-300">{HORIZON[solution.horizon]}</span>
                </div>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-300">{solution.steps.map((step) => <li key={step}>{step}</li>)}</ul>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    {solution.source}
                    {solution.needsProfessional && <span className="ml-2 text-amber-200">Needs a qualified professional&apos;s confirmation</span>}
                  </span>
                  <button type="button" disabled={!mayInsert("A")} onClick={() => add(solution.title.replace(/^Plan for: /, ""), undefined, solution.steps)} className={smallButton}>Add to report</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.reflections.length > 0 && (
        <div>
          <h3 className="font-semibold text-white">Cultural and spiritual reflections <span className="text-xs font-normal text-slate-400">(kept apart from causes)</span></h3>
          <ul className="mt-3 grid gap-3">
            {analysis.reflections.map((finding) => (
              <Finding key={`${finding.strand}-${finding.name}`} finding={finding} action={<button type="button" disabled={!mayInsert("B")} onClick={() => add(finding.name, finding.summary, finding.steps, true)} className={smallButton}>Add as reflection</button>} />
            ))}
          </ul>
        </div>
      )}

      <details className="rounded-lg border border-white/10 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-white">Knowledge by strand ({kept} supported findings)</summary>
        <div className="mt-3 grid gap-4">
          {analysis.strands.map((strand) => (
            <div key={strand.strand}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {strand.strand} · Domain {strand.layer} · {strand.kept} of {strand.considered} kept
              </p>
              {strand.findings.length > 0 && (
                <ul className="mt-2 grid gap-2">
                  {strand.layer === "A" && strand.findings.map((finding) => (
                    <Finding key={finding.name} finding={finding} action={<button type="button" disabled={!mayInsert("A")} onClick={() => add(finding.name, finding.summary, finding.steps)} className={smallButton}>Add to report</button>} />
                  ))}
                  {strand.layer === "B" && <li className="text-xs text-slate-500">Listed under reflections above.</li>}
                </ul>
              )}
            </div>
          ))}
        </div>
      </details>

      {(analysis.intersections.length > 0 || analysis.engines.length > 0 || analysis.safety.interactions.length > 0) && (
        <details className="rounded-lg border border-white/10 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-white">Engines and cross-strand links</summary>
          <ul className="mt-3 grid gap-3 text-sm text-slate-300">
            <li><span className="font-semibold text-slate-100">Urgency detector:</span> {analysis.urgency.level} ({analysis.urgency.score}/100){analysis.urgency.signals.length ? ` — ${analysis.urgency.signals.join(", ")}` : ""}</li>
            {analysis.safety.interactions.map((interaction) => <li key={interaction}><span className="font-semibold text-amber-200">Herb–medicine interaction:</span> {interaction}</li>)}
            {analysis.intersections.map((link) => (
              <li key={link.title}><span className="font-semibold capitalize text-slate-100">{link.title}:</span> {link.description} <span className="text-slate-400">{link.recommendation}</span></li>
            ))}
            {analysis.engines.map((engine) => (
              <li key={engine.id}>
                <span className="font-semibold text-slate-100">{engine.title}:</span> {engine.summary}
                {engine.items.length > 0 && <ul className="mt-1 list-disc pl-5 text-xs text-slate-400">{engine.items.map((item) => <li key={item}>{item}</li>)}</ul>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function Finding({ finding, action }: { finding: GroundedFinding; action: React.ReactNode }) {
  return (
    <li className="rounded-lg border border-white/10 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-sm font-semibold text-white">{finding.name}</p>
        <span className="text-[11px] tabular-nums text-slate-400">{finding.strand} · {Math.round(finding.relevance * 100)}%</span>
      </div>
      {finding.summary && <p className="mt-1 text-sm text-slate-300">{finding.summary}</p>}
      <p className="mt-2 text-xs text-slate-400">Kept because — {finding.matchedOn.join("; ")}</p>
      {finding.steps.length > 0 && <ul className="mt-2 list-disc pl-5 text-xs text-slate-300">{finding.steps.map((step) => <li key={step}>{step}</li>)}</ul>}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-500">{finding.source ?? "Reference knowledge, not a diagnosis"}</span>
        {action}
      </div>
    </li>
  );
}

// ── Conversation ─────────────────────────────────────────────────────────────

interface ConversationProps {
  messages: CaseMessage[];
  canAct: boolean;
  busy: boolean;
  /** Updates about this case are sent without their text (see notices.ts). */
  discreet: boolean;
  value: string;
  onChange: (value: string) => void;
  onSend: (kind: CaseMessage["kind"]) => void;
}

export function Conversation({ messages, canAct, busy, discreet, value, onChange, onSend }: ConversationProps) {
  const ready = value.trim().length >= 2;
  return (
    <section className={panel} aria-label="Conversation with the person">
      <h2 className="font-semibold text-white">Conversation with the person</h2>
      <p className="mt-1 text-xs text-slate-400">
        Messages appear in their case and are sent to the Telegram or WhatsApp they connected. They can answer from the chat; a reply is added to the analysis.
        {discreet && " Because a safety concern was flagged, chat apps only say that there is a new message: the text stays in the app."}
      </p>
      {messages.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">No messages yet.</p>
      ) : (
        <ol className="mt-4 grid gap-2">
          {messages.map((message) => (
            <li key={message.id} className={`max-w-[85%] rounded-xl border px-3 py-2 text-sm ${message.from === "reviewer" ? "justify-self-end border-emerald-500/30 bg-emerald-950/30 text-emerald-50" : "justify-self-start border-white/10 bg-white/5 text-slate-100"}`}>
              <p className="whitespace-pre-wrap">{message.body}</p>
              <p className="mt-1 text-[11px] text-slate-400">
                {message.from === "reviewer" ? (message.kind === "question" ? "Reviewer · question" : "Reviewer") : "Person"}
                {VIA[message.via]} · {new Date(message.at).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      )}
      {canAct ? (
        <div className="mt-4 grid gap-2">
          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Write to the person
            <textarea value={value} onChange={(event) => onChange(event.target.value)} maxLength={2000} rows={3} className={input} placeholder="Ask for missing information, or tell them what happens next." />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy || !ready} onClick={() => onSend("question")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Ask and wait for a reply</button>
            <button type="button" disabled={busy || !ready} onClick={() => onSend("message")} className={smallButton}>Send as a message</button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-500">Claim the request to write to the person.</p>
      )}
    </section>
  );
}

// ── Report editor ────────────────────────────────────────────────────────────

interface DraftEditorProps {
  draft: DraftState;
  onChange: (draft: DraftState) => void;
  dirty: boolean;
  busy: boolean;
  onSave: () => void;
}

export function DraftEditor({ draft, onChange, dirty, busy, onSave }: DraftEditorProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const setSection = (id: string, patch: Partial<ReportSection>) => onChange({ ...draft, sections: draft.sections.map((section) => (section.id === id ? { ...section, ...patch } : section)) });
  const move = (index: number, by: number) => {
    const sections = [...draft.sections];
    const [section] = sections.splice(index, 1);
    sections.splice(index + by, 0, section);
    onChange({ ...draft, sections });
  };

  return (
    <section className={`${panel} flex flex-col gap-4`} aria-label="Report for the person">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Report for the person</h2>
          <p className="mt-1 text-xs text-slate-400">Edit freely. Nothing is visible to the person until you approve.</p>
        </div>
        <button type="button" disabled={busy || !dirty} onClick={onSave} className={smallButton}>{dirty ? "Save draft" : "Draft saved"}</button>
      </header>
      <label className="grid gap-1.5 text-sm font-medium text-slate-200">
        Title
        <input value={draft.title} onChange={(event) => onChange({ ...draft, title: event.target.value })} maxLength={200} className={input} />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-slate-200">
        Summary
        <textarea value={draft.summary} onChange={(event) => onChange({ ...draft, summary: event.target.value })} maxLength={4000} rows={3} className={input} />
      </label>

      <ol className="grid gap-3">
        {draft.sections.map((section, index) => {
          const open = openId === section.id;
          return (
            <li key={section.id} className="rounded-lg border border-white/10 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setOpenId(open ? null : section.id)} aria-expanded={open} className="min-w-0 flex-1 text-left text-sm font-semibold text-white hover:underline">
                  {index + 1}. {section.title || "Untitled section"}
                </button>
                {section.cultural && <span className="rounded-full border border-violet-500/40 px-2 py-0.5 text-[11px] text-violet-200">Reflection</span>}
                {section.locked && <span className="rounded-full border border-amber-500/40 px-2 py-0.5 text-[11px] text-amber-200">Full report only</span>}
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className={smallButton} aria-label={`Move ${section.title} up`}>↑</button>
                <button type="button" disabled={index === draft.sections.length - 1} onClick={() => move(index, 1)} className={smallButton} aria-label={`Move ${section.title} down`}>↓</button>
                <button type="button" onClick={() => onChange({ ...draft, sections: draft.sections.filter((item) => item.id !== section.id) })} className={`${smallButton} text-rose-200`}>Remove</button>
              </div>
              {open && (
                <div className="mt-3 grid gap-3">
                  <label className="grid gap-1.5 text-xs font-medium text-slate-300">
                    Section title
                    <input value={section.title} onChange={(event) => setSection(section.id, { title: event.target.value })} maxLength={200} className={input} />
                  </label>
                  <label className="grid gap-1.5 text-xs font-medium text-slate-300">
                    Text
                    <textarea value={section.body ?? ""} onChange={(event) => setSection(section.id, { body: event.target.value || undefined })} maxLength={8000} rows={4} className={input} />
                  </label>
                  <label className="grid gap-1.5 text-xs font-medium text-slate-300">
                    Points (one per line)
                    <textarea
                      value={(section.items ?? []).join("\n")}
                      onChange={(event) => setSection(section.id, { items: event.target.value ? event.target.value.split("\n") : undefined })}
                      rows={Math.min(8, Math.max(3, (section.items?.length ?? 0) + 1))}
                      className={input}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input type="checkbox" checked={section.locked} onChange={(event) => setSection(section.id, { locked: event.target.checked })} className="accent-amber-500" />
                    Show only in the full (paid) report
                  </label>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        onClick={() => {
          const id = sectionId("section");
          onChange({ ...draft, sections: [...draft.sections, { id, title: "New section", locked: false }] });
          setOpenId(id);
        }}
        className={`${smallButton} self-start`}
      >
        Add a section
      </button>
      <p className="text-xs text-slate-500">{draft.disclaimer}</p>
    </section>
  );
}

/** Blank lines typed while editing points are dropped before the draft is saved. */
export function cleanDraft(draft: DraftState): DraftState {
  return {
    ...draft,
    title: draft.title.trim(),
    summary: draft.summary.trim(),
    sections: draft.sections.map((section) => {
      const items = section.items?.map((item) => item.trim()).filter(Boolean);
      return { ...section, title: section.title.trim() || "Untitled section", body: section.body?.trim() || undefined, items: items?.length ? items : undefined };
    }),
  };
}
