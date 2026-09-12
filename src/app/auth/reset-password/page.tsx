"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [tokenFromUrl]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Reset failed");
      setSuccess("Your password has been updated successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/auth");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed.");
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
        <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
        <p className="text-sm text-slate-400 mb-6">
          Enter your recovery token and define a new secure password.
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
            <label className="block text-xs font-medium text-slate-300 mb-1">Reset Token</label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste 64-character token"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase, number, symbol"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl font-semibold mt-2">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500" /></div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
