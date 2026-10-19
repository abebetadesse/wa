"use client";

import { useEffect, useState, type FormEvent } from "react";
import { HeartPulse } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ChoiceGroup, Field, Textarea } from "@/components/ui";

interface OpenFollowUp {
  id: string;
  caseId: string | null;
  bookingId: string | null;
  label: string;
  dayOffset: number;
}

const OPTIONS = [
  { value: "yes", label: "Yes, it helped" },
  { value: "partly", label: "Partly" },
  { value: "no", label: "No, it did not help" },
];

/**
 * The outcome check-in for one request or booking (src/server/followUps), shown only while one has
 * been sent and not answered yet. Renders nothing otherwise.
 */
export function FollowUpPrompt({ caseId, bookingId, className }: { caseId?: string; bookingId?: string; className?: string }) {
  const [followUp, setFollowUp] = useState<OpenFollowUp | null>(null);
  const [helped, setHelped] = useState<string>();
  const [sideEffects, setSideEffects] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | { needsAttention: boolean }>(null);

  useEffect(() => {
    let active = true;
    apiFetch<OpenFollowUp[]>("/api/follow-ups")
      .then((rows) => {
        if (active) setFollowUp(rows.find((row) => (caseId && row.caseId === caseId) || (bookingId && row.bookingId === bookingId)) ?? null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [caseId, bookingId]);

  if (!followUp) return null;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!followUp || !helped) {
      setError("Choose whether it helped.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await apiFetch<{ needsAttention: boolean }>(`/api/follow-ups/${followUp.id}`, {
        method: "POST",
        json: { helped, sideEffects: sideEffects.trim() || undefined, comment: comment.trim() || undefined },
      });
      setDone(result);
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Alert tone="success" className={className}>
        <p>Thank you for telling us.</p>
        {done.needsAttention && <p>Your reviewer has been asked to follow up with you. If you feel much worse, seek medical care now.</p>}
      </Alert>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartPulse className="size-5 text-brand" aria-hidden="true" />
          How are things going?
        </CardTitle>
        <CardDescription>
          <span translate="no">{followUp.label}</span> · {followUp.bookingId && !followUp.caseId ? "Session" : "Report"} · {followUp.dayOffset} days ago. Your answer helps your reviewer and improves advice for others.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <ChoiceGroup name={`follow-up-${followUp.id}`} legend="Did it help?" options={OPTIONS} value={helped} onChange={setHelped} required columns={1} />
          <Field label="Side effects or anything that got worse" hint="Leave empty if none.">
            {(control) => <Textarea {...control} value={sideEffects} onChange={(event) => setSideEffects(event.target.value)} maxLength={1000} className="min-h-20" />}
          </Field>
          <Field label="Anything else you want your reviewer to know">
            {(control) => <Textarea {...control} value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} className="min-h-20" />}
          </Field>
          {error && <Alert tone="danger">{error}</Alert>}
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send answer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
