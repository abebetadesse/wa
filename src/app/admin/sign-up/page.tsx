"use client";

import { useEffect, useState } from "react";
import { Send, UserPlus } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, ChoiceGroup, ErrorState, LoadingState, PageHeader, PageShell } from "@/components/ui";
import { useApi } from "@/features/workspace/useApi";
import { useToast } from "@/features/feedback/Toaster";
import type { RegistrationSettings } from "@/server/settings";

interface Response {
  value: RegistrationSettings;
  status: { configured: boolean; botUsername: string | null };
}

export default function SignUpSettingsPage() {
  const toast = useToast();
  const { data, error, reload, setData } = useApi<Response>("/api/admin/settings/registration");
  const [draft, setDraft] = useState<RegistrationSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && !draft) setDraft(data.value);
  }, [data, draft]);

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      const result = await apiFetch<Response>("/api/admin/settings/registration", { method: "PUT", json: { value: draft } });
      setData(result);
      setDraft(result.value);
      toast({ tone: "success", title: "Sign-up settings saved" });
    } catch (err) {
      toast({ tone: "error", title: "Could not save", body: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Administration" title="Sign-up & Telegram" description="People register with email and a password and can use the app straight away. Telegram adds a verified badge, one-tap sign-in, notifications and password resets." />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || !draft ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserPlus className="size-5 text-brand" aria-hidden="true" /> New accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
                <span>
                  <span className="block font-semibold text-foreground">Anyone can create an account</span>
                  <span className="text-sm text-muted-foreground">Turn off to pause sign-ups. Existing accounts and team invitations keep working.</span>
                </span>
                <input type="checkbox" className="size-5 accent-[var(--brand-accent)]" checked={draft.open} onChange={(e) => setDraft({ ...draft, open: e.target.checked })} />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="size-5 text-[#229ED9]" aria-hidden="true" /> Telegram verification
                {data.status.configured ? <Badge tone="success">@{data.status.botUsername}</Badge> : <Badge tone="danger">Bot not connected</Badge>}
              </CardTitle>
              <CardDescription>People connect Telegram from their account page with Telegram&apos;s official login button. No codes or SMS needed.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {!data.status.configured && (
                <Alert tone="warning" title="Connect a Telegram bot">
                  <ol className="mt-1 list-decimal pl-5 text-sm">
                    <li>In Telegram, open @BotFather, send /newbot and follow the steps.</li>
                    <li>Send /setdomain to @BotFather and enter your site&apos;s domain (Telegram does not allow localhost).</li>
                    <li>Set TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_USERNAME in the server environment and restart.</li>
                  </ol>
                </Alert>
              )}
              <ChoiceGroup
                name="telegram-mode"
                legend="How Telegram is used"
                columns={1}
                value={draft.telegram}
                onChange={(value) => setDraft({ ...draft, telegram: value as RegistrationSettings["telegram"] })}
                options={[
                  { value: "off", label: "Off", hint: "Hide Telegram everywhere." },
                  { value: "optional", label: "Optional (recommended)", hint: "Anyone can connect Telegram for a verified badge, sign-in, notifications and password resets." },
                  { value: "required_for_business", label: "Required for business owners", hint: "Owners must connect Telegram before their business can be submitted for listing. Clients stay optional." },
                ]}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
