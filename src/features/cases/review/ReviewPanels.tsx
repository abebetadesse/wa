"use client";

import { useState } from "react";
import type { AnalysisConfidence, CaseAnalysis, CaseMessage, CasePersonContext, GroundedFinding, ReportSection } from "@/server/cases/types";
import { FACTOR_GUIDANCE } from "@/server/cases/analysisGuidance";
import { FACTORS } from "@/server/cases/analysisLexicon";
import { buildEnhancedReportSections, reportStatistics } from "@/server/cases/reportEnhancer";

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
const HORIZON_ORDER = ["now", "this_week", "ongoing"] as const;
const VIA = { app: "", telegram: " · via Telegram", whatsapp: " · via WhatsApp" } as const;
const FOLLOW_UP = new Map(FACTORS.map((factor) => [factor.id, factor.followUp]));
const URGENCY: Record<string, string> = {
  critical: "border-rose-500/50 bg-rose-950/40 text-rose-100",
  high: "border-amber-500/50 bg-amber-950/40 text-amber-100",
};

let sequence = 0;
const sectionId = (prefix: string) => `reviewer-${prefix}-${Date.now().toString(36)}-${++sequence}`;

// ── Analysis ─────────────────────────────────────────────────────────────────

interface AnalysisPanelProps {
  analysis: CaseAnalysis;
  /** The signed-in reviewer holds the claim and may edit, ask and re-run. */
  canAct: boolean;
  busy: boolean;
  onAddSection: (section: ReportSection) => void;
  onAddSections: (sections: ReportSection[]) => void;
  profileConsented: boolean;
  onAsk: (question: string) => void;
  onReanalyse: () => void;
}

export function AnalysisPanel({ analysis, canAct, busy, onAddSection, onAddSections, profileConsented, onAsk, onReanalyse }: AnalysisPanelProps) {
  const reflectionOnly = analysis.publishScope === "reflection_only";
  // Reflection-only case types publish Domain B only, so evidence findings cannot be inserted with one click.
  const mayInsert = (layer: "A" | "B") => canAct && (layer === "B" || !reflectionOnly);
  const kept = analysis.strands.reduce((sum, strand) => sum + strand.kept, 0);
  const considered = analysis.strands.reduce((sum, strand) => sum + strand.considered, 0);
  const quality = analysis.dataQuality.score;
  const person = profileConsented ? analysis.person : undefined;
  // What "Build detailed report" would produce right now, so the reviewer sees its size before using it.
  const detailed = buildEnhancedReportSections(analysis, profileConsented);
  const detailedSize = reportStatistics({ summary: "", sections: detailed });
  const heaviest = Math.max(1, ...analysis.factors.map((factor) => factor.weight));
  const askable = new Set(analysis.dataQuality.followUps);

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

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-950/15 p-3">
        <p className="min-w-0 flex-1 text-sm text-slate-200">
          Build or refresh editable report sections from the latest grounded analysis
          {profileConsented ? ", using profile context only where relevant and consented" : ", using case answers only"}.
          Review every section before saving or sending.
          <span className="mt-1 block text-xs text-slate-400">
            Would add {detailedSize.sections} sections, about {detailedSize.words.toLocaleString()} words ({detailedSize.minutes} min read): {detailed.map((entry) => entry.title).join(" · ")}.
          </span>
        </p>
        <button
          type="button"
          disabled={!canAct || busy || analysis.safety.warnings.length > 0}
          onClick={() => onAddSections(detailed)}
          className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          Build detailed report
        </button>
        {!canAct && <span className="text-xs text-slate-400">Claim this request to edit its report.</span>}
        {canAct && analysis.safety.warnings.length > 0 && <span className="text-xs text-amber-200">Resolve the safety review before generating report text.</span>}
      </div>

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

      <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        {[
          ["Urgency", `${analysis.urgency.level} · ${analysis.urgency.score}/100`, URGENCY[analysis.urgency.level]],
          ["Their own words", `${analysis.narrative.words} words`, undefined],
          ["Themes found", String(analysis.factors.length), undefined],
          ["Publishes", reflectionOnly ? "reflection only" : "full report", undefined],
        ].map(([label, value, tone]) => (
          <div key={label} className={`rounded-lg border px-3 py-2 ${tone ?? "border-white/10 text-slate-200"}`}>
            <dt className="text-[11px] uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className="mt-0.5 font-semibold capitalize">{value}</dd>
          </div>
        ))}
      </dl>

      {analysis.factors.length > 0 && (
        <div>
          <h3 className="font-semibold text-white">Themes in the person&apos;s words <span className="text-xs font-normal text-slate-400">(heaviest first)</span></h3>
          <ul className="mt-3 grid gap-2">
            {analysis.factors.map((factor) => (
              <li key={factor.id} className="rounded-lg border border-white/10 p-3">
                <div className="flex items-center gap-3">
                  <p className="w-40 shrink-0 text-sm font-semibold text-white">{factor.label}</p>
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10" role="img" aria-label={`Weight ${factor.weight}`}>
                    <div className="h-full rounded-full bg-emerald-500/80" style={{ width: `${Math.round((factor.weight / heaviest) * 100)}%` }} />
                  </div>
                  <span className="text-[11px] tabular-nums text-slate-400">{factor.weight}</span>
                </div>
                <p className="mt-1.5 text-xs italic text-slate-300">{factor.quotes.map((quote) => `“${quote}”`).join(" · ")}</p>
                {FACTOR_GUIDANCE[factor.id] && <p className="mt-1.5 text-xs text-slate-400">{FACTOR_GUIDANCE[factor.id].insight}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {person && <PersonPanel person={person} mayInsertContext={mayInsert("A")} mayInsertReflection={mayInsert("B")} onAdd={add} />}
      {!person && (
        <p className="rounded-lg border border-white/10 p-3 text-xs text-slate-400">
          {profileConsented
            ? "No profile context is stored with this analysis. Run the analysis again to align it with the person's profile."
            : "The person did not consent to profile use for this case, so the analysis and report rest on the case answers only."}
        </p>
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
                {[...new Set(cause.factors.map((id) => FOLLOW_UP.get(id)).filter((question): question is string => Boolean(question)))].slice(0, 2).map((question) => (
                  <div key={question} className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                    <span className="min-w-0 flex-1"><span className="font-semibold text-slate-200">To confirm:</span> {question}</span>
                    {askable.has(question) && <button type="button" disabled={!canAct || busy} onClick={() => onAsk(question)} className={smallButton}>Ask</button>}
                  </div>
                ))}
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
            {HORIZON_ORDER.flatMap((horizon) => analysis.solutions.filter((solution) => solution.horizon === horizon)).map((solution) => (
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
                  <button type="button" disabled={!mayInsert("A")} onClick={() => add(solution.title.replace(/^Plan for: /, "Suggested steps: "), undefined, solution.steps)} className={smallButton}>Add to report</button>
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

interface PersonPanelProps {
  person: CasePersonContext;
  mayInsertContext: boolean;
  mayInsertReflection: boolean;
  onAdd: (title: string, body: string | undefined, items: string[], cultural?: boolean) => void;
}

/** Who the report is for: life stage, place and season, cautions, and the reading from their birth details. */
function PersonPanel({ person, mayInsertContext, mayInsertReflection, onAdd }: PersonPanelProps) {
  const { lifeStage, place, reading } = person;
  return (
    <div>
      <h3 className="font-semibold text-white">Who this report is for <span className="text-xs font-normal text-slate-400">(from the consented profile; bands and cautions, not raw values)</span></h3>
      <div className="mt-3 grid gap-3">
        {person.care.length > 0 && (
          <ul className="grid gap-1 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-sm text-amber-100">
            {person.care.map((entry) => <li key={entry.id}>{entry.reviewer}</li>)}
          </ul>
        )}
        {lifeStage && (
          <div className="rounded-lg border border-white/10 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-semibold text-white">Life stage: {lifeStage.label} <span className="font-normal text-slate-400">({lifeStage.band})</span></p>
              <button type="button" disabled={!mayInsertContext} onClick={() => onAdd(`At your stage of life (${lifeStage.band})`, undefined, lifeStage.considerations)} className={smallButton}>Add to report</button>
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-300">{lifeStage.considerations.map((line) => <li key={line}>{line}</li>)}</ul>
          </div>
        )}
        {place && (
          <div className="rounded-lg border border-white/10 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-semibold text-white">Place and season: {place.region}{place.zone ? ` · ${place.zone}` : ""} · {place.season}</p>
              <button type="button" disabled={!mayInsertContext} onClick={() => onAdd("Where you live and the season you are in", undefined, place.notes)} className={smallButton}>Add to report</button>
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-300">{place.notes.map((line) => <li key={line}>{line}</li>)}</ul>
          </div>
        )}
        {person.language && <p className="text-xs text-slate-400">Preferred language on the profile: <span className="font-semibold uppercase text-slate-200">{person.language}</span></p>}
        {reading && (
          <div className="rounded-lg border border-violet-500/30 bg-violet-950/20 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="min-w-0 flex-1 text-sm font-semibold text-white">Personal reading <span className="font-normal text-violet-200">(cultural reflection)</span></p>
              <button
                type="button"
                disabled={!mayInsertReflection}
                onClick={() => onAdd("Timing and temperament from your personal profile", `${reading.signature}.\n\n${reading.basis}`, [...(reading.matter ? [reading.matter.note] : []), ...reading.temperament, ...reading.timing], true)}
                className={smallButton}
              >
                Add as reflection
              </button>
            </div>
            <p className="mt-1 text-sm text-violet-100">{reading.signature}</p>
            <p className="mt-1 text-xs text-slate-400">{reading.basis}</p>
            {reading.matter && <p className="mt-2 text-sm text-slate-200">{reading.matter.note}</p>}
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-semibold text-slate-200">Temperament, timing and constitution ({reading.temperament.length + reading.timing.length + reading.constitution.length} points)</summary>
              <ul className="mt-2 list-disc pl-5 text-xs text-slate-300">
                {[...reading.temperament, ...reading.timing, ...reading.constitution].map((line) => <li key={line} className="mt-1">{line}</li>)}
              </ul>
            </details>
          </div>
        )}
      </div>
    </div>
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

/** What "AI" on a section returns: the developed section, where it came from and a note for the reviewer. */
export interface SectionEnhancement {
  section: ReportSection;
  source: "model" | "case_data" | "unchanged";
  note: string;
}

interface DraftEditorProps {
  draft: DraftState;
  onChange: (draft: DraftState) => void;
  dirty: boolean;
  busy: boolean;
  onSave: () => void;
  /** Develops one section further on the server. Absent: the AI control is not shown. */
  onEnhance?: (section: ReportSection, options: { instruction?: string; christianName?: string }) => Promise<SectionEnhancement>;
  /** The Christian (baptismal) name given with the case, offered for the seal and the scroll. */
  christianName?: string;
}

// Sections that are addressed to the person by their Christian name.
const NAMED_SECTIONS = new Set(["divination_summary", "sacred_telsem", "healing_scroll"]);
const ENHANCEMENT_SOURCE: Record<SectionEnhancement["source"], string> = {
  model: "Language model",
  case_data: "Case data",
  unchanged: "No change",
};

export function DraftEditor({ draft, onChange, dirty, busy, onSave, onEnhance, christianName = "" }: DraftEditorProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  // "AI" on a section: which panel is open, what was asked, and the version to return to.
  const [aiId, setAiId] = useState<string | null>(null);
  const [aiBusyId, setAiBusyId] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [baptismalName, setBaptismalName] = useState(christianName);
  const [aiResult, setAiResult] = useState<Record<string, { source: SectionEnhancement["source"]; note: string; error?: boolean }>>({});
  const [previous, setPrevious] = useState<Record<string, ReportSection>>({});

  async function enhance(section: ReportSection) {
    if (!onEnhance) return;
    setAiBusyId(section.id);
    try {
      const result = await onEnhance(cleanSection(section), { instruction: instruction.trim() || undefined, christianName: NAMED_SECTIONS.has(section.id) ? baptismalName.trim() || undefined : undefined });
      if (result.source !== "unchanged") {
        setPrevious((current) => ({ ...current, [section.id]: section }));
        onChange({ ...draft, sections: draft.sections.map((entry) => (entry.id === section.id ? { ...result.section, id: section.id } : entry)) });
        setOpenId(section.id);
      }
      setAiResult((current) => ({ ...current, [section.id]: { source: result.source, note: result.note } }));
    } catch (cause) {
      setAiResult((current) => ({ ...current, [section.id]: { source: "unchanged", note: cause instanceof Error ? cause.message : "The section could not be developed.", error: true } }));
    } finally {
      setAiBusyId(null);
    }
  }

  function undoEnhancement(id: string) {
    const before = previous[id];
    if (!before) return;
    onChange({ ...draft, sections: draft.sections.map((entry) => (entry.id === id ? before : entry)) });
    setPrevious(({ [id]: _restored, ...rest }) => rest);
    setAiResult(({ [id]: _cleared, ...rest }) => rest);
  }

  const stats = reportStatistics(draft);
  const locked = draft.sections.filter((section) => section.locked).length;
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
          <p className="mt-1 text-xs text-slate-400">
            Edit freely. Nothing is visible to the person until you approve. {stats.sections} sections · {stats.words.toLocaleString()} words · about {stats.minutes} min to read
            {locked > 0 && ` · ${locked} in the full (paid) report only`}.
          </p>
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
                  <span className="ml-2 text-[11px] font-normal text-slate-500">{reportStatistics({ summary: "", sections: [section] }).words} words{section.items?.length ? ` · ${section.items.length} point${section.items.length === 1 ? "" : "s"}` : ""}</span>
                </button>
                {section.cultural && <span className="rounded-full border border-violet-500/40 px-2 py-0.5 text-[11px] text-violet-200">Reflection</span>}
                {onEnhance && (
                  <button
                    type="button"
                    disabled={aiBusyId !== null}
                    onClick={() => setAiId(aiId === section.id ? null : section.id)}
                    aria-expanded={aiId === section.id}
                    aria-label={`Develop “${section.title}” further with AI`}
                    title="Develop this section further"
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold disabled:opacity-40 ${aiId === section.id ? "border-sky-400 bg-sky-500/20 text-sky-100" : "border-sky-500/40 text-sky-200 hover:bg-sky-500/10"}`}
                  >
                    {aiBusyId === section.id ? "AI…" : "✦ AI"}
                  </button>
                )}
                {section.locked && <span className="rounded-full border border-amber-500/40 px-2 py-0.5 text-[11px] text-amber-200">Full report only</span>}
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className={smallButton} aria-label={`Move ${section.title} up`}>↑</button>
                <button type="button" disabled={index === draft.sections.length - 1} onClick={() => move(index, 1)} className={smallButton} aria-label={`Move ${section.title} down`}>↓</button>
                <button type="button" onClick={() => onChange({ ...draft, sections: draft.sections.filter((item) => item.id !== section.id) })} className={`${smallButton} text-rose-200`}>Remove</button>
              </div>
              {aiId === section.id && onEnhance && (
                <div className="mt-3 grid gap-3 rounded-lg border border-sky-500/30 bg-sky-950/20 p-3">
                  <p className="text-xs text-slate-300">
                    Develops this section in full from the case: the person&apos;s own words, their reading and their profile. The result replaces the section here, unsaved, for you to check and edit.
                  </p>
                  {NAMED_SECTIONS.has(section.id) && (
                    <label className="grid gap-1.5 text-xs font-medium text-slate-300">
                      Christian (baptismal) name — የክርስትና ስም
                      <input value={baptismalName} onChange={(event) => setBaptismalName(event.target.value)} maxLength={80} lang="am" placeholder="ለምሳሌ ወለተ ማርያም ፣ ገብረ ሚካኤል" className={`${input} font-geez`} />
                      <span className="font-normal text-slate-500">The seal and the scroll are addressed to this name. Leave empty to use the name given with the case.</span>
                    </label>
                  )}
                  <label className="grid gap-1.5 text-xs font-medium text-slate-300">
                    What should be developed? (optional)
                    <textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} maxLength={600} rows={2} className={input} placeholder="For example: explain each line of the prayer, or say more about what this means for their work." />
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" disabled={aiBusyId !== null} onClick={() => void enhance(section)} className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                      {aiBusyId === section.id ? "Developing…" : "Develop this section"}
                    </button>
                    {previous[section.id] && <button type="button" disabled={aiBusyId !== null} onClick={() => undoEnhancement(section.id)} className={smallButton}>Undo</button>}
                    {aiResult[section.id] && (
                      <span role="status" className={`basis-full text-xs ${aiResult[section.id].error ? "text-rose-200" : "text-slate-300"}`}>
                        {!aiResult[section.id].error && <span className="mr-1.5 rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-slate-200">{ENHANCEMENT_SOURCE[aiResult[section.id].source]}</span>}
                        {aiResult[section.id].note}
                      </span>
                    )}
                  </div>
                </div>
              )}
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

function cleanSection(section: ReportSection): ReportSection {
  const items = section.items?.map((item) => item.trim()).filter(Boolean);
  return { ...section, title: section.title.trim() || "Untitled section", body: section.body?.trim() || undefined, items: items?.length ? items : undefined };
}

/** Blank lines typed while editing points are dropped before the draft is saved. */
export function cleanDraft(draft: DraftState): DraftState {
  return { ...draft, title: draft.title.trim(), summary: draft.summary.trim(), sections: draft.sections.map(cleanSection) };
}
