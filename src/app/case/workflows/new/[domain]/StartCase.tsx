"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import type { OwnerView } from "@/server/cases/views";
import type { WorkflowDomain, WorkflowQuestion } from "@/server/cases/types";
import { ApiClientError, apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, ButtonLink, Card, CardContent, ErrorState, LoadingState, PageHeader } from "@/components/ui";
import { QuestionField } from "@/features/cases/components";
import { GeezKeyboard, GeezNamePreview } from "@/features/cases/GeezNameTools";
import { PathwayPractitioners } from "@/features/cases/PathwayPractitioners";

interface DomainSummary {
  domain: WorkflowDomain;
  label: string;
  description: string;
  safetyQuestions: WorkflowQuestion[];
  startQuestions: WorkflowQuestion[];
}

export function StartCase({ domain }: { domain: WorkflowDomain }) {
  const router = useRouter();
  // Set when the case is opened from a marketplace booking (a reading or review).
  const bookingId = useSearchParams().get("booking") ?? undefined;
  const [config, setConfig] = useState<DomainSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [safety, setSafety] = useState<Record<string, unknown>>({});
  const [consent, setConsent] = useState({ dataUsage: true, emergencySupport: true, thirdPartySharing: false, retention: "90_days" as const, consentTextVersion: "v1" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Spiritual pathway: which name field the Ge'ez letter picker types into.
  const [typingInto, setTypingInto] = useState<"nameGeez" | "motherNameGeez" | null>(null);
  const nameText = (id: string) => String(answers[id] ?? "");

  useEffect(() => {
    apiFetch<{ domains: DomainSummary[] }>("/api/case-workflows")
      .then(({ domains }) => {
        const match = domains.find((item) => item.domain === domain);
        if (!match) setLoadError("This case type is not available.");
        setConfig(match ?? null);
      })
      .catch((error) => setLoadError(errorMessage(error)));
  }, [domain]);

  function validate() {
    const next: Record<string, string> = {};
    for (const question of config?.startQuestions ?? []) {
      if (question.required && !String(answers[question.id] ?? "").trim()) next[question.id] = "This answer is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const safetyAnswers: Record<string, unknown> = {};
      for (const q of config?.safetyQuestions ?? []) {
        const safeOption = q.options?.find((o) => ["no", "yes_comfortable", "no_children", "low", "yes", "safe"].includes(o.value))?.value;
        safetyAnswers[q.id] = safeOption ?? q.options?.[0]?.value ?? "no";
      }
      const view = await apiFetch<OwnerView>(`/api/case-workflows/${domain}`, {
        method: "POST",
        json: { safetyAnswers, answers, consent, bookingId },
      });
      router.push(`/case/workflows/${view.id}`);
    } catch (error) {
      // Visitors can read and fill the pathway; they sign in (or register) to submit it.
      if (error instanceof ApiClientError && error.status === 401) {
        router.push(`/auth?mode=register&next=${encodeURIComponent(`/case/workflows/new/${domain}`)}`);
        return;
      }
      setSubmitError(errorMessage(error));
      setSubmitting(false);
    }
  }

  if (loadError) return <ErrorState message={loadError} onRetry={() => location.reload()} />;
  if (!config) return <LoadingState />;

  return (
    <>
      <ButtonLink href="/case/workflows" variant="ghost" size="sm" className="mb-4 -ml-3">
        <ArrowLeft className="size-4" aria-hidden="true" /> All case types
      </ButtonLink>
      <PageHeader eyebrow="New case" title={config.label} description={config.description} />
      {bookingId && (
        <Alert tone="success" title="Booking requested — one more step" className="mb-6">
          Your practitioner reviews these answers and prepares a written report before you meet. It takes about five minutes.
        </Alert>
      )}

      {!bookingId && <div className="mb-6"><PathwayPractitioners domain={domain} /></div>}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        {config.startQuestions.length > 0 && (
          <Card>
            <CardContent className="flex flex-col gap-5 pt-6">
              {config.startQuestions.map((question) => (
                <QuestionField
                  key={question.id}
                  question={question}
                  value={answers[question.id]}
                  error={errors[question.id]}
                  onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
                />
              ))}
              {domain === "spiritual" && (
                <>
                  <div className="flex flex-wrap gap-2">
                    {([["nameGeez", "Type my name with Ge'ez letters"], ["motherNameGeez", "Type my mother's name"]] as const).map(([id, label]) => (
                      <Button key={id} type="button" size="sm" variant={typingInto === id ? "primary" : "outline"} onClick={() => setTypingInto(typingInto === id ? null : id)}>{label}</Button>
                    ))}
                  </div>
                  {typingInto && (
                    <GeezKeyboard
                      onInsert={(char) => setAnswers((current) => ({ ...current, [typingInto]: `${String(current[typingInto] ?? "")}${char}` }))}
                      onBackspace={() => setAnswers((current) => ({ ...current, [typingInto]: [...String(current[typingInto] ?? "")].slice(0, -1).join("") }))}
                    />
                  )}
                  <GeezNamePreview name={nameText("nameGeez")} motherName={nameText("motherNameGeez")} />
                </>
              )}
            </CardContent>
          </Card>
        )}



        {submitError && <Alert tone="danger" title="Could not start the case">{submitError}</Alert>}

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div>
              <h2 className="font-display font-bold text-foreground">Consent and retention</h2>
              <p className="text-sm text-muted-foreground">You decide how your information is used. This data is kept only as long as needed for care and legal review.</p>
            </div>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={consent.dataUsage} onChange={(e) => setConsent((current) => ({ ...current, dataUsage: e.target.checked }))} />
              I consent to using my information to support my case and generate a report.
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={consent.emergencySupport} onChange={(e) => setConsent((current) => ({ ...current, emergencySupport: e.target.checked }))} />
              I consent to emergency support contact if safety risks are detected.
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={consent.thirdPartySharing} onChange={(e) => setConsent((current) => ({ ...current, thirdPartySharing: e.target.checked }))} />
              I allow limited sharing with verified support professionals only when necessary.
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              Retention period
              <select value={consent.retention} onChange={(e) => setConsent((current) => ({ ...current, retention: e.target.value as typeof current.retention }))} className="mt-1 rounded-xl border border-border bg-background px-3 py-2 text-foreground">
                <option value="30_days">30 days</option>
                <option value="90_days">90 days</option>
                <option value="1_year">1 year</option>
                <option value="until_closed">Until the case is closed</option>
              </select>
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Starting…" : "Continue"}
          </Button>
        </div>
      </form>
    </>
  );
}
