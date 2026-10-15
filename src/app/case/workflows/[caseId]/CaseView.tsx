"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  ArrowLeft, CalendarClock, Check, Copy, MessageCircle, Mic, Phone,
  Save, Video, MessageSquare, Users as UsersIcon, AlertTriangle,
} from "lucide-react";
import type { OwnerView as BaseOwnerView } from "@/server/cases/views";
import type { PaymentAttempt } from "@/server/cases/billing";
import { PayPanel } from "@/features/payments/PayPanel";
import { ApiClientError, apiFetch, errorMessage } from "@/lib/api/client";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChoiceGroup,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
  Textarea,
} from "@/components/ui";
import {
  AnswersSummary,
  CareActionPlan,
  CarePathway,
  isApplicable,
  QuestionField,
  ReportView,
  ReviewStatus,
  SupportPanel,
  WhatHappensNext,
} from "@/features/cases/components";
import { STAGE_LABELS } from "../WorkflowHub";
import { FoodHerbCard } from "./FoodHerbCard";

const POLL_MS = 30_000;

type OwnerView = BaseOwnerView & { paymentAttempt?: PaymentAttempt | null };
const FORMAT_LABELS: Record<string, string> = { video: "Video call", voice: "Voice call", chat: "Chat", in_person: "In person" };
const FORMAT_ICONS: Record<string, React.ElementType> = { video: Video, voice: Phone, chat: MessageSquare, in_person: UsersIcon };

export function CaseView({ caseId }: { caseId: string }) {
  const [view, setView] = useState<OwnerView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setView(await apiFetch<OwnerView>(`/api/case-workflows/cases/${caseId}`));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [caseId]);

  useEffect(() => {
    load();
  }, [load]);

  // While an expert is reviewing, refresh occasionally and whenever the tab regains focus.
  // Unsent text in the reply box is kept: it lives in ConversationCard, not in the refreshed view.
  const waiting = view?.stage === "awaiting_expert" || view?.stage === "in_review";
  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(load, POLL_MS);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [waiting, load]);

  if (error && !view) return <ErrorState message={error} onRetry={load} />;
  if (!view) return <LoadingState label="Loading your case…" />;

  const stage = STAGE_LABELS[view.stage];

  return (
    <div className="flex flex-col gap-6">
      <ButtonLink href="/case/workflows" variant="ghost" size="sm" className="-ml-3 self-start">
        <ArrowLeft className="size-4" aria-hidden="true" /> Your cases
      </ButtonLink>
      <PageHeader eyebrow={view.label} title="Your case" actions={<Badge tone={stage.tone}>{stage.label}</Badge>} className="mb-0" />
      <CarePathway stage={view.stage} />
      <SupportPanel safety={view.safety} />
      <WhatHappensNext stage={view.stage} />
      {view.domain === "biological" && typeof view.answers.mediaId === "string" && (
        <Card>
          <CardHeader><CardTitle>Attached recording</CardTitle></CardHeader>
          <CardContent>
            {view.answers.mediaKind === "video"
              ? <video controls src={`/api/case-workflows/media/${encodeURIComponent(String(view.answers.mediaId))}`} className="max-h-72 w-full rounded-xl" />
              : <audio controls src={`/api/case-workflows/media/${encodeURIComponent(String(view.answers.mediaId))}`} className="w-full" />}
          </CardContent>
        </Card>
      )}

      {(view.stage === "intake" || view.stage === "referred") && <IntakeForm view={view} onChange={setView} />}
      {view.stage !== "intake" && view.stage !== "referred" && (
        <AnswersSummary
          answers={{ ...(view.safetyAnswers ?? {}), ...view.answers }}
          questions={view.submittedQuestions ?? view.questions}
        />
      )}
      {view.foodHerb && <FoodHerbCard view={view} onChange={setView} />}
      {view.review && <ReviewStatus review={view.review} />}
      {view.canMessage && <ConversationCard view={view} onChange={setView} />}
      {view.auditTrail && view.auditTrail.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Case audit trail</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            {view.auditTrail.map((event, index) => (
              <div key={`${event.type}-${event.at}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
                <span className="font-medium text-foreground">{event.type}</span>
                <span>{new Date(event.at).toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {view.report && <ReportView report={view.report} review={view.review} />}
      {(view.stage === "full_report_released" || view.stage === "consultation_requested") && (
        <CareActionPlan domain={view.domain} />
      )}
      {/* Booking-opened cases are covered by the booking and meet the practitioner there. */}
      {view.stage === "visible_to_user" && !view.bookingId && <PurchasePanel view={view} onChange={setView} />}
      {view.stage === "full_report_released" && !view.bookingId && <ConsultationForm view={view} onChange={setView} />}
      {view.bookingId && view.stage === "full_report_released" && (
        <Alert tone="success" title="Included with your booking">
          This report is part of your booked session. <a href={`/account/bookings/${view.bookingId}`} className="font-semibold text-brand underline">View your booking</a>
        </Alert>
      )}
      {view.stage === "consultation_requested" && view.consultation && (
        <Alert tone="success" title="Consultation requested">
          {FORMAT_LABELS[view.consultation.format]} · {view.consultation.feeEtb > 0 ? `${view.consultation.feeEtb} ETB` : "free"}. Your practitioner will confirm a time from your suggestions:{" "}
          {view.consultation.preferredTimes.join(", ")}.
        </Alert>
      )}
    </div>
  );
}

// ── Intake ───────────────────────────────────────────────────────────────────

function IntakeForm({ view, onChange }: { view: OwnerView; onChange: (view: OwnerView) => void }) {
  const [answers, setAnswers] = useState<Record<string, unknown>>(view.answers);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [busy, setBusy] = useState<"save" | "submit" | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const dirty = useRef(false);

  const questions = useMemo(() => view.questions.filter((question) => isApplicable(question, answers)), [view.questions, answers]);
  const requiredQuestions = useMemo(() => questions.filter((q) => q.required), [questions]);
  const answeredCount = useMemo(
    () => requiredQuestions.filter((q) => answers[q.id] !== undefined && String(answers[q.id]).trim() !== "").length,
    [requiredQuestions, answers]
  );
  const completionPercent = requiredQuestions.length > 0 ? Math.round((answeredCount / requiredQuestions.length) * 100) : 100;

  // Update browser tab title with unsaved-changes indicator.
  useEffect(() => {
    const originalTitle = document.title;
    if (dirty.current) document.title = `● ${originalTitle.replace(/^● /, "")}`;
    return () => { document.title = originalTitle.replace(/^● /, ""); };
  }, [dirty.current]); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn before leaving with unsaved answers.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  function update(id: string, value: unknown) {
    dirty.current = true;
    setAnswers((current) => ({ ...current, [id]: value }));
    setErrors((current) => ({ ...current, [id]: "" }));
  }

  async function save() {
    const saved = await apiFetch<OwnerView>(`/api/case-workflows/cases/${view.id}`, { method: "PATCH", json: { answers } });
    dirty.current = false;
    onChange(saved);
    return saved;
  }

  async function onSave() {
    setBusy("save");
    setStatus(null);
    try {
      await save();
      setStatus({ tone: "success", text: "Your answers are saved. You can come back later." });
    } catch (error) {
      setStatus({ tone: "danger", text: errorMessage(error) });
    } finally {
      setBusy(null);
    }
  }

  function validateAndPrompt() {
    setStatus(null);
    const missing = questions.filter((q) => q.required && (answers[q.id] === undefined || String(answers[q.id]).trim() === ""));
    if (missing.length) {
      setErrors(Object.fromEntries(missing.map((q) => [q.id, "This answer is required."])));
      document.getElementById(`question-${missing[0].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    // All required answered — show confirmation dialog before final submit.
    setShowConfirm(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    validateAndPrompt();
  }

  async function doSubmit() {
    setShowConfirm(false);
    setBusy("submit");
    try {
      const saved = await save();
      if (saved.stage === "crisis_routed") return;
      onChange(await apiFetch<OwnerView>(`/api/case-workflows/cases/${view.id}/submit`, { method: "POST" }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error instanceof ApiClientError && error.details && typeof error.details === "object" && "missing" in error.details) {
        const ids = (error.details as { missing: string[] }).missing;
        setErrors(Object.fromEntries(ids.map((id) => [id, "This answer is required."])));
      }
      setStatus({ tone: "danger", text: errorMessage(error) });
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {/* Unsaved-changes sticky banner */}
      {dirty.current && (
        <div className="sticky top-2 z-10 flex items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-2 text-sm text-foreground shadow-sm">
          <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden="true" />
          <span>You have unsaved changes. Save your progress before leaving.</span>
          <Button variant="outline" size="sm" className="ml-auto" onClick={onSave} disabled={busy !== null}>Save now</Button>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tell us about your situation</CardTitle>
            <CardDescription>Answer in your own words. Nothing is shared until you submit, and only your reviewer sees your answers.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {requiredQuestions.length > 0 && (
              <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/20 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Required questions</span>
                  <span className="tabular-nums font-semibold text-foreground">
                    {answeredCount} of {requiredQuestions.length} answered ({completionPercent}%)
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-500"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            )}
            {questions.map((question) => (
              <div key={question.id} id={`question-${question.id}`}>
                <QuestionField
                  question={question}
                  value={answers[question.id]}
                  error={errors[question.id]}
                  onChange={(value) => update(question.id, value)}
                  onKeyDown={question.type === "textarea" ? (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                    // Cmd+Enter / Ctrl+Enter submits.
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); validateAndPrompt(); }
                  } : undefined}
                />
              </div>
            ))}
          </CardContent>
        </Card>
        {status && <Alert tone={status.tone}>{status.text}</Alert>}
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={onSave} disabled={busy !== null}>
            <Save className="size-4" aria-hidden="true" /> {busy === "save" ? "Saving…" : "Save and finish later"}
          </Button>
          <Button type="submit" disabled={busy !== null}>
            {busy === "submit" ? "Submitting…" : "Submit for expert review"}
          </Button>
        </div>
      </form>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-submit-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="mx-4 flex max-w-sm flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
              <div>
                <p id="confirm-submit-title" className="font-semibold text-foreground">Submit for expert review?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Once submitted your answers are locked and sent to a reviewer. You can still add information through the message thread.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button onClick={doSubmit} disabled={busy !== null}>
                {busy === "submit" ? "Submitting…" : "Yes, submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Conversation with the reviewer ───────────────────────────────────────────

const VIA_LABELS = { app: "", telegram: " · sent from Telegram", whatsapp: " · sent from WhatsApp" } as const;
const MAX_MSG = 4000;

interface OptimisticMessage {
  id: string;
  from: "owner";
  authorId: string;
  kind: "message";
  body: string;
  via: "app";
  at: string;
  pending?: true;
}

function ConversationCard({ view, onChange }: { view: OwnerView; onChange: (view: OwnerView) => void }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  // Optimistic list: real messages + any pending optimistic ones.
  const [optimistic, setOptimistic] = useState<OptimisticMessage[]>([]);

  const allMessages = useMemo(() => {
    const real = view.messages as (typeof view.messages[number] & { pending?: never })[];
    // Merge: drop optimistic entries that now exist in real.
    const pendingIds = new Set(real.map((m) => m.id));
    const pending = optimistic.filter((m) => !pendingIds.has(m.id));
    return [...real, ...pending].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }, [view.messages, optimistic]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) { setError("Write a message first."); return; }
    if (trimmed.length > MAX_MSG) { setError(`Messages cannot exceed ${MAX_MSG} characters.`); return; }

    // Optimistic insert.
    const tempId = `optimistic-${Date.now()}`;
    const tempMsg: OptimisticMessage = { id: tempId, from: "owner", authorId: "", kind: "message", body: trimmed, via: "app", at: new Date().toISOString(), pending: true };
    setOptimistic((prev) => [...prev, tempMsg]);
    setText("");
    setBusy(true);
    setError(null);
    setSent(false);

    try {
      const updated = await apiFetch<OwnerView>(`/api/case-workflows/cases/${view.id}/messages`, { method: "POST", json: { body: trimmed } });
      setOptimistic((prev) => prev.filter((m) => m.id !== tempId));
      onChange(updated);
      setSent(true);
    } catch (err) {
      // Roll back optimistic message on failure.
      setOptimistic((prev) => prev.filter((m) => m.id !== tempId));
      setText(trimmed);
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const remaining = MAX_MSG - text.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageCircle className="size-5 text-brand" aria-hidden="true" /> Messages with your reviewer</CardTitle>
        <CardDescription>
          Add anything you forgot, or answer your reviewer&apos;s questions. If you connected Telegram or WhatsApp on your <a href="/account" className="font-semibold text-brand underline">account page</a>, messages also arrive there and you can simply reply in the chat.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {view.awaitingReply && <Alert tone="warning" title="Your reviewer is waiting for your answer">Your reply helps them give you a better response.</Alert>}
        {sent && (
          <div className="flex items-center gap-2 text-xs text-success">
            <Check className="size-3.5" aria-hidden="true" /> Reviewer notified
          </div>
        )}
        {allMessages.length > 0 && (
          <ol className="flex flex-col gap-2">
            {allMessages.map((message) => (
              <li
                key={message.id}
                className={`max-w-[85%] rounded-2xl border px-4 py-2.5 text-sm transition-opacity ${message.from === "owner" ? "self-end border-brand/30 bg-brand/10" : "self-start border-border bg-muted/30"} ${"pending" in message && message.pending ? "opacity-60" : ""}`}
              >
                <p className="whitespace-pre-wrap text-foreground">{message.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {message.from === "owner" ? "You" : "Your reviewer"}
                  {message.from === "owner" ? VIA_LABELS[message.via] : ""}
                  {" · "}
                  {"pending" in message && message.pending ? "Sending…" : new Date(message.at).toLocaleString()}
                </p>
              </li>
            ))}
          </ol>
        )}
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Field label={view.awaitingReply ? "Your answer" : "Write to your reviewer"} error={error}>
            {(control) => (
              <Textarea
                {...control}
                value={text}
                onChange={(event) => { setText(event.target.value); setSent(false); }}
                rows={3}
                maxLength={MAX_MSG}
                onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); onSubmit(e as unknown as FormEvent); }
                }}
              />
            )}
          </Field>
          {/* Character counter */}
          <div className="flex items-center justify-between">
            <span className={`text-xs tabular-nums ${remaining < 200 ? "text-warning" : "text-muted-foreground"}`}>
              {remaining.toLocaleString()} characters remaining
            </span>
            <Button type="submit" disabled={busy} size="sm">
              {busy ? "Sending…" : <><Mic className="size-3.5" aria-hidden="true" /> Send</>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Purchase ─────────────────────────────────────────────────────────────────

function PurchasePanel({ view, onChange }: { view: OwnerView; onChange: (view: OwnerView) => void }) {
  const base = `/api/case-workflows/cases/${view.id}`;
  return (
    <PayPanel<OwnerView>
      title="Unlock the full report"
      description={`${view.pricing.reportEtb} ETB, one time. Includes every section above and the option to book a follow-up consultation.`}
      amountEtb={view.pricing.reportEtb}
      attempt={view.paymentAttempt}
      endpoints={{ view: base, purchase: `${base}/purchase`, confirm: `${base}/purchase/confirm`, manual: `${base}/purchase/manual` }}
      onUpdated={(next) => {
        onChange(next);
        if (next.stage === "full_report_released") window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}

// ── Consultation ─────────────────────────────────────────────────────────────

const TIME_SUGGESTIONS = ["Morning (8–12)", "Afternoon (12–17)", "Evening (17–21)", "Saturday morning", "Sunday afternoon"];

function ConsultationForm({ view, onChange }: { view: OwnerView; onChange: (view: OwnerView) => void }) {
  const [format, setFormat] = useState(view.pricing.consultationFormats[0]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [customSlot, setCustomSlot] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function addSlot(slot: string) {
    const trimmed = slot.trim();
    if (!trimmed || timeSlots.includes(trimmed)) return;
    setTimeSlots((prev) => [...prev, trimmed]);
    setCustomSlot("");
    setError(null);
  }

  function removeSlot(slot: string) {
    setTimeSlots((prev) => prev.filter((s) => s !== slot));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!timeSlots.length) {
      setError("Add at least one time that suits you.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onChange(await apiFetch<OwnerView>(`/api/case-workflows/cases/${view.id}/consultation`, {
        method: "POST",
        json: { format, preferredTimes: timeSlots, note: note || undefined },
      }));
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  const feeEtb = view.pricing.consultationEtb;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a follow-up consultation</CardTitle>
        <CardDescription className="flex items-center gap-2">
          {feeEtb > 0
            ? <Badge tone="gold">{feeEtb} ETB</Badge>
            : <Badge tone="success">Free</Badge>}
          <span>Your practitioner confirms the time with you.</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {/* Format picker with icons */}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold text-foreground">Format</legend>
            <div className="flex flex-wrap gap-2">
              {view.pricing.consultationFormats.map((value) => {
                const FormatIcon = FORMAT_ICONS[value] ?? UsersIcon;
                const selected = format === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormat(value as typeof format)}
                    aria-pressed={selected}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${selected ? "border-brand bg-brand/10 text-brand" : "border-border bg-background text-muted-foreground hover:border-input hover:text-foreground"}`}
                  >
                    <FormatIcon className="size-4" aria-hidden="true" />
                    {FORMAT_LABELS[value]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Time-slot chips */}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-semibold text-foreground">When suits you?</legend>
            <p className="text-xs text-muted-foreground">Pick from suggestions or type your own, then press Enter or Add.</p>
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {TIME_SUGGESTIONS.filter((s) => !timeSlots.includes(s)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSlot(s)}
                  className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  + {s}
                </button>
              ))}
            </div>
            {/* Custom slot input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSlot}
                onChange={(e) => setCustomSlot(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSlot(customSlot); } }}
                placeholder='e.g. "Tuesday after 6 pm"'
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => addSlot(customSlot)}>Add</Button>
            </div>
            {/* Chosen chips */}
            {timeSlots.length > 0 && (
              <div className="flex flex-wrap gap-1.5" role="list" aria-label="Selected time slots">
                {timeSlots.map((slot) => (
                  <span
                    key={slot}
                    role="listitem"
                    className="flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand"
                  >
                    {slot}
                    <button
                      type="button"
                      onClick={() => removeSlot(slot)}
                      aria-label={`Remove ${slot}`}
                      className="ml-0.5 rounded-full hover:text-danger focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {error && <p role="alert" className="text-xs font-medium text-danger">{error}</p>}
          </fieldset>

          <Field label="Anything your practitioner should know? (optional)">
            {(control) => <Textarea {...control} value={note} onChange={(event) => setNote(event.target.value)} rows={3} />}
          </Field>
          <Button type="submit" disabled={busy} className="self-end">
            <CalendarClock className="size-4" aria-hidden="true" /> {busy ? "Sending…" : "Request consultation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
