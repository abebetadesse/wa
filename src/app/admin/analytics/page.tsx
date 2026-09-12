"use client";

import { useEffect, useState } from "react";
import { BarChart3, Globe, Shield, Users, Activity, CheckCircle2, AlertTriangle, PieChart } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((res) => {
        if (!res.success || !res.data) throw new Error(res.error || "Unable to load analytics.");
        setData(res.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Analytics & Demographic Intelligence</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          System telemetry, Ethiopian regional coverage, language engagement, and security health.
        </p>
      </div>
      {error && <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-sm text-rose-200">{error}</div>}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400">Total Patient Accounts</span>
          <div className="text-2xl font-extrabold text-white mt-2">{data?.users?.total ?? "—"}</div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
            {data?.users?.active ?? "—"} Active ({data?.users?.suspended ?? "—"} Suspended)
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400">Authentication health</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">{data?.security?.successRate ?? "—"}%</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            {data?.security?.successLogins ?? "—"} Successes / {data?.security?.failedLogins ?? "—"} Flags
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400">Active Concurrent Sessions</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-2">{data?.operations?.activeSessions ?? "—"}</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">Valid Refresh Tokens</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400">Clinical Cases Evaluated</span>
          <div className="text-2xl font-extrabold text-sky-400 mt-2">{data?.operations?.totalCases ?? "—"}</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">EFCT 2025 Multi-Strand Checks</span>
        </div>
      </div>

      {/* Two Columns: Language and Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preferred Language Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
            <Globe size={16} className="text-emerald-400" />
            <span>Preferred Ethiopian Language Distribution</span>
          </h2>
          <p className="text-[11px] text-slate-400 mb-5">Interface language chosen during patient registration</p>

          <div className="space-y-3.5">
            {(data?.languageDistribution || []).map((lang: any) => {
              const total = data?.users?.total || 1;
              const pct = Math.round((lang.count / total) * 100);
              return (
                <div key={lang.code} className="text-xs">
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="font-medium">{lang.label}</span>
                    <span className="font-mono text-slate-400">{lang.count} users ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
            <BarChart3 size={16} className="text-amber-400" />
            <span>Regional Demographics (Ethiopia)</span>
          </h2>
          <p className="text-[11px] text-slate-400 mb-5">Altitude-specific patient origin mapping</p>

          <div className="grid grid-cols-2 gap-2.5">
            {(data?.regionalDistribution || []).map((reg: any) => (
              <div key={reg.region} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-200">{reg.region}</span>
                <span className="font-mono text-emerald-400 font-bold">{reg.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security health & Lockout Diagnostics */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <Shield size={16} className="text-emerald-400" />
          <span>Security & Lockout Compliance</span>
        </h2>
        <p className="text-[11px] text-slate-400 mb-4">Real-time attack mitigation and account defense stats</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-black/40 border border-white/5">
            <span className="text-slate-400 block mb-1">Max Failed Attempts</span>
            <span className="text-lg font-bold text-white font-mono">5 Attempts</span>
            <p className="text-[11px] text-slate-500 mt-1">Automatic 15-minute temporary freeze</p>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/5">
            <span className="text-slate-400 block mb-1">Session Inactivity Timeout</span>
            <span className="text-lg font-bold text-white font-mono">15 Minutes</span>
            <p className="text-[11px] text-slate-500 mt-1">Extended to 30 days for Remember Me</p>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/5">
            <span className="text-slate-400 block mb-1">Scrypt Salt & Hash</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">N=16384, r=8, p=1</span>
            <p className="text-[11px] text-slate-500 mt-1">Hardware-brute resistant cryptography</p>
          </div>
        </div>
      </div>
    </div>
  );
}
