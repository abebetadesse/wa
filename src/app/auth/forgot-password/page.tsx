"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Request failed");
      setSuccess(data.message || "Reset token generated.");
      if (data.demoResetToken) setToken(data.demoResetToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl">
        <Link href="/auth" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white mb-6">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
        <p className="text-sm text-slate-400 mb-6">
          Enter your account email. We will generate a secure one-hour password reset token.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl flex items-center gap-2.5 text-rose-300 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-emerald-300 text-sm">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.et"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {token && (
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-300 text-xs">
              <strong>Password Reset Token:</strong>
              <div className="font-mono text-[11px] bg-black/50 p-2 rounded mt-1 break-all text-emerald-400">
                {token}
              </div>
              <Link
                href={`/auth/reset-password?token=${token}`}
                className="mt-2 inline-block text-xs font-semibold text-amber-300 underline"
              >
                Proceed to Reset Password Page →
              </Link>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl font-semibold">
            {loading ? "Sending..." : "Request Password Reset"}
          </button>
        </form>
      </div>
    </main>
  );
}
