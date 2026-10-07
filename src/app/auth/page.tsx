"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, LogIn, Send, UserPlus } from "lucide-react";
import { apiFetch, errorMessage } from "@/lib/api/client";
import { notifyAuthStateChanged } from "@/lib/auth/clientEvents";
import { Alert, Button, Card, CardContent, Field, Input, LoadingState, Select } from "@/components/ui";
import { TelegramLogin, type TelegramUser } from "@/features/session/TelegramLogin";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

interface PublicSettings {
  registration: { open: boolean; telegram: "off" | "optional" | "required_for_business"; telegramBot: string | null };
}

const LANGUAGES = [
  { value: "am", label: "አማርኛ (Amharic)" },
  { value: "om", label: "Afaan Oromoo" },
  { value: "ti", label: "ትግርኛ (Tigrinya)" },
  { value: "so", label: "Soomaali" },
  { value: "en", label: "English" },
];

const ADMIN_ROLES = ["super_admin", "admin", "editor", "reviewer", "analyst"];

/** Only same-site paths may be used as a post-sign-in destination. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

export default function AuthPage() {
  return (
    <Suspense fallback={<LoadingState className="min-h-[70vh]" />}>
      <AuthScreen />
    </Suspense>
  );
}

function AuthScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const mode: Mode = params.get("mode") === "register" ? "register" : "login";
  const next = safeNext(params.get("next"));
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    apiFetch<PublicSettings>("/api/platform/settings").then(setSettings).catch(() => setSettings({ registration: { open: true, telegram: "off", telegramBot: null } }));
  }, []);

  function switchMode(target: Mode) {
    const query = new URLSearchParams({ mode: target });
    if (next) query.set("next", next);
    router.replace(`/auth?${query}`, { scroll: false });
  }

  function finish(role: string, isNew: boolean) {
    notifyAuthStateChanged();
    router.push(next ?? "/profile?finalize=1");
    router.refresh();
  }

  const telegramBot = settings?.registration.telegram !== "off" ? settings?.registration.telegramBot ?? null : null;

  return (
    <div className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-10 sm:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_20%_-10%,color-mix(in_oklab,var(--brand-accent)_18%,transparent),transparent),radial-gradient(40rem_24rem_at_100%_0%,color-mix(in_oklab,var(--gold)_16%,transparent),transparent)]" />
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1fr_28rem]">
        <section className="hidden lg:block">
          <p className="font-geez text-5xl font-bold text-gold">እንኳን ደህና መጡ</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-foreground">Traditional healers and cultural makers, in one trusted place.</h1>
          <ul className="mt-8 flex flex-col gap-4 text-muted-foreground">
            <li className="flex gap-3"><span className="mt-1 size-2 shrink-0 rounded-full bg-brand" />Book verified healers, readers and cultural services near you or online.</li>
            <li className="flex gap-3"><span className="mt-1 size-2 shrink-0 rounded-full bg-gold" />Run your practice: bookings, clients, remedies, payments and your team.</li>
            <li className="flex gap-3"><span className="mt-1 size-2 shrink-0 rounded-full bg-success" />Pay with telebirr, bank transfer or Chapa, and get updates on Telegram.</li>
          </ul>
        </section>

        <Card className="shadow-xl shadow-black/5">
          <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
            <div role="tablist" aria-label="Sign in or create an account" className="grid grid-cols-2 rounded-2xl bg-muted p-1">
              {(["login", "register"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={mode === tab}
                  onClick={() => switchMode(tab)}
                  className={cn("rounded-xl py-2.5 text-sm font-semibold transition-all", mode === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                >
                  {tab === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            {!settings ? (
              <LoadingState />
            ) : mode === "login" ? (
              <LoginForm onDone={(role) => finish(role, false)} />
            ) : settings.registration.open ? (
              <RegisterForm onDone={(role) => finish(role, true)} />
            ) : (
              <Alert tone="info" title="Sign-ups are paused">New accounts can&apos;t be created right now. Please check back soon.</Alert>
            )}

            {settings && telegramBot && mode === "login" && <TelegramSignIn bot={telegramBot} onDone={(role) => finish(role, false)} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-11" />
      <button type="button" onClick={() => setVisible((v) => !v)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground" aria-label={visible ? "Hide password" : "Show password"}>
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
}

function LoginForm({ onDone }: { onDone: (role: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await apiFetch<{ role: string }>("/api/auth/login", { method: "POST", json: { email, password, rememberMe } });
      onDone(user.role);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <Field label="Email" required>{(control) => <Input {...control} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
      <Field label="Password" required>{(control) => <PasswordInput {...control} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}</Field>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="size-4 accent-[var(--brand-accent)]" />
          Keep me signed in
        </label>
        <Link href="/auth/forgot-password" className="font-semibold text-brand hover:underline">Forgot password?</Link>
      </div>
      {error && <Alert tone="danger">{error}</Alert>}
      <Button type="submit" size="lg" disabled={busy || !email || !password}>
        <LogIn className="size-4" aria-hidden="true" /> {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

const CHECKS = [
  { test: (p: string) => p.length >= 8, label: "8+ characters" },
  { test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p), label: "upper & lower case" },
  { test: (p: string) => /\d/.test(p), label: "a number" },
  // Same symbol set the server accepts (validatePasswordStrength in src/lib/auth.ts).
  { test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p), label: "a symbol such as ! @ # ?" },
];

function RegisterForm({ onDone }: { onDone: (role: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("am");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const passed = CHECKS.filter((check) => check.test(password)).length;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (passed < CHECKS.length) return setError("Choose a stronger password.");
    if (!accepted) return setError("Please accept the terms to continue.");
    setBusy(true);
    setError(null);
    try {
      const user = await apiFetch<{ role: string }>("/api/auth/register", {
        method: "POST",
        json: { fullName: name, email, password, confirmPassword: password, preferredLanguage: language, acceptTerms: true, acceptPrivacy: true },
      });
      onDone(user.role);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <Field label="Full name" required>{(control) => <Input {...control} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />}</Field>
      <Field label="Email" required hint="You'll sign in with this. No verification email needed.">
        {(control) => <Input {...control} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
      </Field>
      <Field label="Password" required>
        {(control) => (
          <div className="flex flex-col gap-2">
            <PasswordInput {...control} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="flex gap-1" aria-hidden="true">
              {CHECKS.map((_, index) => (
                <span key={index} className={cn("h-1.5 flex-1 rounded-full transition-colors", index < passed ? (passed === CHECKS.length ? "bg-success" : "bg-warning") : "bg-muted")} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {CHECKS.map((check, index) => (
                <span key={check.label} className={cn(check.test(password) && "text-success")}>{index ? " · " : ""}{check.label}</span>
              ))}
            </p>
          </div>
        )}
      </Field>
      <Field label="Preferred language">
        {(control) => (
          <Select {...control} value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
        )}
      </Field>
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 size-4 accent-[var(--brand-accent)]" />
        <span>I agree to the <Link href="/trust" className="font-semibold text-brand hover:underline">terms and privacy policy</Link>.</span>
      </label>
      {error && <Alert tone="danger">{error}</Alert>}
      <Button type="submit" size="lg" disabled={busy || !name.trim() || !email || !password}>
        <UserPlus className="size-4" aria-hidden="true" /> {busy ? "Creating your account…" : "Create account"}
      </Button>
    </form>
  );
}

function TelegramSignIn({ bot, onDone }: { bot: string; onDone: (role: string) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onAuth(user: TelegramUser) {
    setBusy(true);
    setError(null);
    try {
      const account = await apiFetch<{ role: string }>("/api/auth/telegram", { method: "POST", json: user });
      onDone(account.role);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      {busy ? (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Send className="size-4" aria-hidden="true" /> Signing in with Telegram…</p>
      ) : (
        <TelegramLogin bot={bot} onAuth={onAuth} />
      )}
      <p className="text-center text-xs text-muted-foreground">Works once you&apos;ve connected Telegram from your account page.</p>
      {error && <Alert tone="warning">{error}</Alert>}
    </div>
  );
}
