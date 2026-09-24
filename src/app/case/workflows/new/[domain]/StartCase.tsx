"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { OwnerView } from "@/server/cases/views";
import type { WorkflowDomain, WorkflowQuestion } from "@/server/cases/types";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, ButtonLink, Card, CardContent, ErrorState, LoadingState, PageHeader } from "@/components/ui";
import { QuestionField } from "@/features/cases/components";

interface DomainSummary {
  domain: WorkflowDomain;
  label: string;
  description: string;
  safetyQuestions: WorkflowQuestion[];
  startQuestions: WorkflowQuestion[];
}

export function StartCase({ domain }: { domain: WorkflowDomain }) {
  const router = useRouter();
  const [config, setConfig] = useState<DomainSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [safety, setSafety] = useState<Record<string, unknown>>({});
  const [consent, setConsent] = useState({ dataUsage: true, emergencySupport: true, thirdPartySharing: false, retention: "90_days" as const, consentTextVersion: "v1" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    for (const question of config?.safetyQuestions ?? []) {
      if (safety[question.id] === undefined) next[question.id] = "Please choose an answer. “I prefer not to say” is fine.";
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
      const view = await apiFetch<OwnerView>(`/api/case-workflows/${domain}`, {
        method: "POST",
        json: { safetyAnswers: safety, answers, consent },
      });
      router.push(`/case/workflows/${view.id}`);
    } catch (error) {
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
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="flex flex-col gap-6 pt-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <h2 className="font-display font-bold text-foreground">A quick safety check</h2>
                <p className="text-sm text-muted-foreground">
                  These questions make sure you get the right support first. If you need urgent help, support contacts are shown straight away — free, with no review needed.
                </p>
              </div>
            </div>
            {config.safetyQuestions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={safety[question.id]}
                error={errors[question.id]}
                onChange={(value) => setSafety((current) => ({ ...current, [question.id]: value }))}
              />
            ))}
          </CardContent>
        </Card>

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
