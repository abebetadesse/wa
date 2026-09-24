"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, CalendarClock, CreditCard, Save } from "lucide-react";
import type { OwnerView } from "@/server/cases/views";
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
import { isApplicable, QuestionField, ReportView, ReviewStatus, StageProgress, SupportPanel } from "@/features/cases/components";
import { STAGE_LABELS } from "../WorkflowHub";

const POLL_MS = 30_000;
const PAYMENT_METHODS = [
  { value: "telebirr", label: "Telebirr" },
  { value: "cbe_birr", label: "CBE Birr" },
  { value: "chapa", label: "Chapa (card / bank)" },
];
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
      <StageProgress stage={view.stage} />
      <SupportPanel safety={view.safety} />

      {(view.stage === "intake" || view.stage === "referred") && <IntakeForm view={view} onChange={setView} />}
      {view.review && <ReviewStatus review={view.review} />}
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
      {view.stage === "visible_to_user" && <PurchasePanel view={view} />}
      {view.stage === "full_report_released" && <ConsultationForm view={view} onChange={setView} />}
      {view.stage === "consultation_requested" && view.consultation && (
        <Alert tone="success" title="Consultation requested">
          {FORMAT_LABELS[view.consultation.format]} · {view.consultation.feeEtb} ETB. Your practitioner will confirm a time from your suggestions:{" "}
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

// ── Purchase ─────────────────────────────────────────────────────────────────

function PurchasePanel({ view }: { view: OwnerView }) {
  const router = useRouter();
  const [method, setMethod] = useState("telebirr");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onPurchase() {
    setBusy(true);
    setError(null);
    try {
      const { checkoutUrl } = await apiFetch<{ checkoutUrl: string }>(`/api/case-workflows/cases/${view.id}/purchase`, { method: "POST", json: { method } });
      router.push(checkoutUrl);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unlock the full report</CardTitle>
        <CardDescription>
          {view.pricing.reportEtb} ETB, one time. Includes every section above and the option to book a follow-up consultation.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ChoiceGroup name="payment-method" legend="Payment method" options={PAYMENT_METHODS} value={method} onChange={setMethod} />
        {error && <Alert tone="danger">{error}</Alert>}
        <Button onClick={onPurchase} disabled={busy} className="self-end">
          <CreditCard className="size-4" aria-hidden="true" /> {busy ? "Opening checkout…" : `Pay ${view.pricing.reportEtb} ETB`}
        </Button>
      </CardContent>
    </Card>
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
        <CardDescription>{view.pricing.consultationEtb} ETB. Your practitioner confirms the time with you.</CardDescription>
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
