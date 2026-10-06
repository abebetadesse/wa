"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BadgeCheck, BookOpen, Briefcase, CalendarCheck, ExternalLink, MessageCircle, Phone, Search, Send, Wallet } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { Alert, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, LoadingState, PageHeader, PageShell } from "@/components/ui";
import { useSession } from "@/features/session/SessionProvider";
import { TelegramLogin, type TelegramUser } from "@/features/session/TelegramLogin";
import { useApi } from "@/features/workspace/useApi";
import { useToast } from "@/features/feedback/Toaster";
import { PAYMENT_STATUS, payMethodLabel } from "@/features/payments/labels";

interface TelegramState {
  available: boolean;
  botUsername: string | null;
  connected: boolean;
  username: string | null;
  verifiedAt: string | null;
  notify: boolean;
}

interface WhatsAppState {
  available: boolean;
  connected: boolean;
  phone: string | null;
  verifiedAt: string | null;
  notify: boolean;
}

interface ChatLink {
  url: string;
  expiresInMinutes: number;
}

interface MyPayment {
  id: string;
  txRef: string;
  description: string | null;
  amountEtb: string;
  method: string;
  status: string;
  providerReference: string | null;
  reviewNote: string | null;
  createdAt: string;
  href: string;
}

export default function AccountPage() {
  return (
    <Suspense fallback={<LoadingState className="min-h-[60vh]" />}>
      <Account />
    </Suspense>
  );
}

function Account() {
  const { user, loading } = useSession();
  const welcome = useSearchParams().get("welcome") === "1";
  if (loading) return <LoadingState className="min-h-[60vh]" />;
  if (!user) return null;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Your account"
        title={user.name ?? user.email}
        description={user.email}
        actions={user.isVerified ? <Badge tone="success"><BadgeCheck className="size-3.5" aria-hidden="true" /> Verified</Badge> : <Badge tone="neutral">Not verified yet</Badge>}
      />
      <div className="flex flex-col gap-6">
        {welcome && <WelcomeCard />}
        <TelegramCard />
        <WhatsAppCard />
        <QuickLinks />
        <PaymentsCard />
      </div>
    </PageShell>
  );
}

function WelcomeCard() {
  const steps = [
    { href: "/marketplace", icon: Search, title: "Find a healer or cultural service", body: "Browse verified businesses and book a time that suits you." },
    { href: "/business", icon: Briefcase, title: "List your business", body: "Healers, readers, artisans and ceremony services run their practice here." },
    { href: "/case/workflows", icon: BookOpen, title: "Start an expert-reviewed case", body: "A practitioner reviews your situation and writes you a report." },
  ];
  return (
    <Card className="overflow-hidden border-brand/30">
      <div className="bg-gradient-to-br from-brand/15 via-transparent to-gold/15 p-6">
        <h2 className="font-display text-xl font-extrabold text-foreground">Welcome! Your account is ready.</h2>
        <p className="mt-1 text-sm text-muted-foreground">Connect Telegram below to verify your account and get updates instantly. Then pick where to start:</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {steps.map((step) => (
            <Link key={step.href} href={step.href} className="group rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand/40">
              <step.icon className="size-5 text-brand" aria-hidden="true" />
              <p className="mt-2 font-semibold text-foreground group-hover:text-brand">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}

function TelegramCard() {
  const toast = useToast();
  const { refresh } = useSession();
  const { data, setData, error, reload } = useApi<TelegramState>("/api/account/telegram");
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<TelegramState>, success?: string) {
    setBusy(true);
    try {
      setData(await action());
      if (success) toast({ tone: "success", title: success });
      void refresh();
    } catch (err) {
      toast({ tone: "error", title: "Telegram", body: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  const connect = (user: TelegramUser) => run(() => apiFetch<TelegramState>("/api/account/telegram", { method: "POST", json: user }), "Telegram connected");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Send className="size-5 text-[#229ED9]" aria-hidden="true" /> Telegram</CardTitle>
        <CardDescription>Verify your account, sign in with one tap, and get case updates, your reviewer&apos;s messages, bookings and password-reset links on Telegram. You can answer your reviewer by replying in the chat.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && <Alert tone="danger">{error} <button type="button" className="font-semibold underline" onClick={reload}>Retry</button></Alert>}
        {!data ? (
          !error && <LoadingState />
        ) : data.connected ? (
          <>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-4">
              <BadgeCheck className="size-6 text-success" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Connected{data.username ? ` as @${data.username}` : ""}</p>
                {data.verifiedAt && <p className="text-xs text-muted-foreground">Verified {new Date(data.verifiedAt).toLocaleDateString()}</p>}
              </div>
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => run(() => apiFetch<TelegramState>("/api/account/telegram", { method: "DELETE" }), "Telegram disconnected")}>Disconnect</Button>
            </div>
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
              <span>
                <span className="block font-semibold text-foreground">Send my notifications to Telegram</span>
                <span className="text-sm text-muted-foreground">Case updates, your reviewer&apos;s messages, bookings and payments.</span>
              </span>
              <input type="checkbox" className="size-5 accent-[var(--brand-accent)]" checked={data.notify} disabled={busy} onChange={(e) => run(() => apiFetch<TelegramState>("/api/account/telegram", { method: "PATCH", json: { notify: e.target.checked } }))} />
            </label>
          </>
        ) : data.available && data.botUsername ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">Tap the button and confirm in Telegram. We only receive your Telegram name and id.</p>
            {busy ? <p className="text-sm text-muted-foreground">Connecting…</p> : <TelegramLogin bot={data.botUsername} onAuth={connect} />}
            <ChatConnect app="Telegram" endpoint="/api/account/telegram/link" action="press Start" intro="Or connect by opening our bot:" onRefresh={reload} />
          </div>
        ) : (
          <Alert tone="info">Telegram isn&apos;t set up on this site yet.</Alert>
        )}
      </CardContent>
    </Card>
  );
}

/** Opens the chat with a one-time connect code filled in; the bot links the account when it arrives. */
function ChatConnect({ app, endpoint, action, intro, onRefresh }: { app: string; endpoint: string; action: string; intro?: string; onRefresh: () => void }) {
  const toast = useToast();
  const [link, setLink] = useState<ChatLink | null>(null);
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      setLink(await apiFetch<ChatLink>(endpoint, { method: "POST" }));
    } catch (err) {
      toast({ tone: "error", title: app, body: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  if (!link) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {intro && <p className="text-sm text-muted-foreground">{intro}</p>}
        <Button variant="outline" size="sm" disabled={busy} onClick={create}>{busy ? "Preparing…" : `Connect ${app}`}</Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-border p-4">
      <p className="text-sm text-foreground">
        1. Open {app} with the button below and {action}. 2. Come back here and tap “I&apos;ve done it”. The link works once, for {link.expiresInMinutes} minutes.
      </p>
      <div className="flex flex-wrap gap-3">
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          <ExternalLink className="size-4" aria-hidden="true" /> Open {app}
        </a>
        <Button variant="outline" size="sm" onClick={() => { setLink(null); onRefresh(); }}>I&apos;ve done it</Button>
      </div>
    </div>
  );
}

function WhatsAppCard() {
  const toast = useToast();
  const { data, setData, error, reload } = useApi<WhatsAppState>("/api/account/whatsapp");
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<WhatsAppState>, success?: string) {
    setBusy(true);
    try {
      setData(await action());
      if (success) toast({ tone: "success", title: success });
    } catch (err) {
      toast({ tone: "error", title: "WhatsApp", body: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Phone className="size-5 text-[#25D366]" aria-hidden="true" /> WhatsApp</CardTitle>
        <CardDescription>Get case updates and your reviewer&apos;s messages on WhatsApp, and answer by replying in the chat. Updates about sensitive requests never include their content.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && <Alert tone="danger">{error} <button type="button" className="font-semibold underline" onClick={reload}>Retry</button></Alert>}
        {!data ? (
          !error && <LoadingState />
        ) : data.connected ? (
          <>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-4">
              <BadgeCheck className="size-6 text-success" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Connected{data.phone ? ` · ${data.phone}` : ""}</p>
                {data.verifiedAt && <p className="text-xs text-muted-foreground">Connected {new Date(data.verifiedAt).toLocaleDateString()}</p>}
              </div>
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => run(() => apiFetch<WhatsAppState>("/api/account/whatsapp", { method: "DELETE" }), "WhatsApp disconnected")}>Disconnect</Button>
            </div>
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
              <span>
                <span className="block font-semibold text-foreground">Send my notifications to WhatsApp</span>
                <span className="text-sm text-muted-foreground">Case updates, your reviewer&apos;s messages, bookings and payments.</span>
              </span>
              <input type="checkbox" className="size-5 accent-[var(--brand-accent)]" checked={data.notify} disabled={busy} onChange={(e) => run(() => apiFetch<WhatsAppState>("/api/account/whatsapp", { method: "PATCH", json: { notify: e.target.checked } }))} />
            </label>
          </>
        ) : data.available ? (
          <ChatConnect app="WhatsApp" endpoint="/api/account/whatsapp" action="send the message that is already typed in" onRefresh={reload} />
        ) : (
          <Alert tone="info">WhatsApp isn&apos;t set up on this site yet.</Alert>
        )}
      </CardContent>
    </Card>
  );
}

function QuickLinks() {
  const links = [
    { href: "/account/bookings", icon: CalendarCheck, label: "My bookings" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/case/workflows", icon: BookOpen, label: "My cases" },
    { href: "/business", icon: Briefcase, label: "My business" },
  ];
  return (
    <nav aria-label="Account shortcuts" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand">
          <link.icon className="size-5" aria-hidden="true" /> {link.label}
        </Link>
      ))}
    </nav>
  );
}

function PaymentsCard() {
  const { data, error } = useApi<MyPayment[]>("/api/account/payments", { liveTypes: ["payment.", "notification"] });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Wallet className="size-5 text-gold" aria-hidden="true" /> Payments to the platform</CardTitle>
        <CardDescription>Reports and other things you paid the platform for. Payments to a business appear on each booking.</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert tone="danger">{error}</Alert>
        ) : !data ? (
          <LoadingState />
        ) : data.length === 0 ? (
          <EmptyState title="No payments yet" />
        ) : (
          <ul className="divide-y divide-border">
            {data.map((payment) => {
              const status = PAYMENT_STATUS[payment.status] ?? { label: payment.status, tone: "neutral" as const };
              return (
                <li key={payment.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <Link href={payment.href} className="font-semibold text-foreground hover:text-brand">{payment.description ?? "Payment"}</Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleString()} · {payMethodLabel(payment.method)}
                      {payment.providerReference ? ` · ${payment.providerReference}` : ""}
                    </p>
                    {payment.reviewNote && payment.status === "rejected" && <p className="mt-1 text-xs text-danger">{payment.reviewNote}</p>}
                  </div>
                  <span className="font-semibold tabular-nums text-foreground">{Number(payment.amountEtb).toLocaleString()} ETB</span>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
