"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { notifyAuthStateChanged } from "@/lib/auth/clientEvents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Unable to sign in.");
      notifyAuthStateChanged();
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/profile/onboarding");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md border-border/70 bg-card/90 p-1 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-2">
        <CardHeader className="space-y-3">
        <Link href="/" className="text-sm font-semibold text-emerald-300">← Ethiopian Wisdom</Link>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Private workspace</p>
        <CardTitle className="text-3xl font-black">Welcome back</CardTitle>
        <CardDescription>Sign in to continue to your profile and case workspace.</CardDescription>
        </CardHeader>
        <CardContent>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-2"><Label htmlFor="login-email">Email</Label><Input id="login-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="login-password">Password</Label><Input id="login-password" required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <label className="flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />Remember this device</label>
          {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing in..." : "Sign in"}</Button>
        </form>
        <div className="mt-6 flex justify-between text-sm"><Link href="/auth?mode=forgot" className="text-slate-400 hover:text-white">Forgot password?</Link><Link href="/auth?mode=register" className="font-semibold text-emerald-300">Create account</Link></div>
        </CardContent>
      </Card>
    </main>
  );
}
