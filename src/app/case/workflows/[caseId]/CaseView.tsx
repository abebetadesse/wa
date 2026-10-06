"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, CalendarClock, MessageCircle, Save } from "lucide-react";
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

const POLL_MS = 30_000;

type OwnerView = BaseOwnerView & { paymentAttempt?: PaymentAttempt | null };
const FORMAT_LABELS: Record<string, string> = { video: "Video call", voice: "Voice call", chat: "Chat", in_person: "In person" };

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

      {(view.stage === "intake" || view.stage === "referred") && <IntakeForm view={view} onChange={setView} />}
      {view.stage !== "intake" && view.stage !== "referred" && (
        <AnswersSummary
          answers={{ ...(view.safetyAnswers ?? {}), ...view.answers }}
          questions={view.submittedQuestions ?? view.questions}
        />
      )}
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
  const dirty = useRef(false);

  const questions = useMemo(() => view.questions.filter((question) => isApplicable(question, answers)), [view.questions, answers]);
  const requiredQuestions = useMemo(() => questions.filter((q) => q.required), [questions]);
  const answeredCount = useMemo(
    () => requiredQuestions.filter((q) => answers[q.id] !== undefined && String(answers[q.id]).trim() !== "").length,
    [requiredQuestions, answers]
  );
  const completionPercent = requiredQuestions.length > 0 ? Math.round((answeredCount / requiredQuestions.length) * 100) : 100;

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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    const missing = questions.filter((q) => q.required && (answers[q.id] === undefined || String(answers[q.id]).trim() === ""));
    if (missing.length) {
      setErrors(Object.fromEntries(missing.map((q) => [q.id, "This answer is required."])));
      document.getElementById(`question-${missing[0].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
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
                  className="h-full rounded-full bg-brand transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          )}
          {questions.map((question) => (
            <div key={question.id} id={`question-${question.id}`}>
              <QuestionField question={question} value={answers[question.id]} error={errors[question.id]} onChange={(value) => update(question.id, value)} />
            </div>
          ))}
        </CardContent>
      </Card>
      {status && <Alert tone={status.tone}>{status.text}</Alert>}
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={onSave} disabled={busy !== null}>
          <Save className="size-4" aria-hidden="true" /> {busy === "save" ? "Saving…" : "Save and finish later"}
        </Button>
        <Button type="submit" disabled={busy !== null}>{busy === "submit" ? "Submitting…" : "Submit for expert review"}</Button>
      </div>
    </form>
  );
}

// ── Conversation with the reviewer ───────────────────────────────────────────

const VIA_LABELS = { app: "", telegram: " · sent from Telegram", whatsapp: " · sent from WhatsApp" } as const;

function ConversationCard({ view, onChange }: { view: OwnerView; onChange: (view: OwnerView) => void }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) {
      setError("Write a message first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onChange(await apiFetch<OwnerView>(`/api/case-workflows/cases/${view.id}/messages`, { method: "POST", json: { body: text.trim() } }));
      setText("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

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
        {view.messages.length > 0 && (
          <ol className="flex flex-col gap-2">
            {view.messages.map((message) => (
              <li key={message.id} className={`max-w-[85%] rounded-2xl border px-4 py-2.5 text-sm ${message.from === "owner" ? "self-end border-brand/30 bg-brand/10" : "self-start border-border bg-muted/30"}`}>
                <p className="whitespace-pre-wrap text-foreground">{message.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {message.from === "owner" ? "You" : "Your reviewer"}
                  {message.from === "owner" ? VIA_LABELS[message.via] : ""} · {new Date(message.at).toLocaleString()}
                </p>
              </li>
            ))}
          </ol>
        )}
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Field label={view.awaitingReply ? "Your answer" : "Write to your reviewer"} error={error}>
            {(control) => <Textarea {...control} value={text} onChange={(event) => setText(event.target.value)} rows={3} maxLength={4000} />}
          </Field>
          <Button type="submit" disabled={busy} className="self-end">{busy ? "Sending…" : "Send"}</Button>
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

function ConsultationForm({ view, onChange }: { view: OwnerView; onChange: (view: OwnerView) => void }) {
  const [format, setFormat] = useState(view.pricing.consultationFormats[0]);
  const [times, setTimes] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const preferredTimes = times.split(/\n|;/).map((line) => line.trim()).filter(Boolean);
    if (!preferredTimes.length) {
      setError("Suggest at least one time that suits you.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onChange(await apiFetch<OwnerView>(`/api/case-workflows/cases/${view.id}/consultation`, { method: "POST", json: { format, preferredTimes, note: note || undefined } }));
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a follow-up consultation</CardTitle>
        <CardDescription>{view.pricing.consultationEtb > 0 ? `${view.pricing.consultationEtb} ETB` : "Free"}. Your practitioner confirms the time with you.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <ChoiceGroup
            name="format"
            legend="Format"
            options={view.pricing.consultationFormats.map((value) => ({ value, label: FORMAT_LABELS[value] }))}
            value={format}
            onChange={(value) => setFormat(value as typeof format)}
          />
          <Field label="When suits you?" hint="One option per line, e.g. “Tuesday after 6 pm”." required error={error}>
            {(control) => <Textarea {...control} value={times} onChange={(event) => setTimes(event.target.value)} rows={3} />}
          </Field>
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
