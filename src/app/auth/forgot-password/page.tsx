"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Button, Card, CardContent, Field, Input, PageShell } from "@/components/ui";

/**
 * Reset links are sent to the account's connected Telegram. In development with AUTH_DEV_CODES=true
 * the server also returns the token so the flow can be tested without Telegram.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ message: string; demoResetToken?: string } | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setResult(await apiFetch<{ message: string; demoResetToken?: string }>("/api/auth/password/forgot", { method: "POST", json: { email } }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell width="narrow">
      <Link href="/auth" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to sign in
      </Link>
      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:p-8">
          <div>
            <KeyRound className="size-8 text-brand" aria-hidden="true" />
            <h1 className="mt-3 font-display text-2xl font-extrabold text-foreground">Reset your password</h1>
            <p className="mt-1 text-sm text-muted-foreground">If your account has Telegram connected, we&apos;ll send a one-time reset link there. It expires in one hour.</p>
          </div>
          {result ? (
            <>
              <Alert tone="success">{result.message}</Alert>
              {result.demoResetToken && (
                <Alert tone="warning" title="Development only">
                  <Link href={`/auth/reset-password?token=${result.demoResetToken}`} className="font-semibold text-brand underline">Open the reset page</Link>
                </Alert>
              )}
            </>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <Field label="Account email" required>{(control) => <Input {...control} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
              {error && <Alert tone="danger">{error}</Alert>}
              <Button type="submit" size="lg" disabled={busy || !email}>{busy ? "Sending…" : "Send reset link"}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
