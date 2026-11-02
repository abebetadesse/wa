"use client";

import { useEffect, useState } from "react";
import { BarChart3, Globe, HeartPulse, Shield, Users, Activity, CheckCircle2, AlertTriangle, PieChart } from "lucide-react";
import { withBasePath } from '@/lib/base-path';

interface OutcomeGroup {
  name: string;
  answered: number;
  helpedRate: number | null;
}

function OutcomeList({ title, rows }: { title: string; rows: OutcomeGroup[] }) {
  return (
    <div className="p-4 rounded-xl bg-sunken/80 border border-border">
      <span className="text-muted-foreground block mb-2">{title}</span>
      {rows.length === 0 ? (
        <p className="text-[11px] text-subtle">No answers yet</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.slice(0, 8).map((row) => (
            <li key={row.name} className="flex justify-between gap-2">
              <span className="text-soft truncate">{row.name}</span>
              <span className="font-mono text-brand shrink-0">{row.helpedRate ?? "—"}% · {row.answered}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(withBasePath("/api/admin/analytics"))
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
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Platform Analytics & Demographic Intelligence</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          System telemetry, Ethiopian regional coverage, language engagement, and security wellbeing.
        </p>
      </div>
      {error && <div className="rounded-xl border border-danger/40 bg-danger-soft p-4 text-sm text-danger-strong">{error}</div>}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-border">
          <span className="text-xs text-muted-foreground">Total Patient Accounts</span>
          <div className="text-2xl font-extrabold text-foreground mt-2">{data?.users?.total ?? "—"}</div>
          <span className="text-[11px] text-brand font-mono mt-1 block">
            {data?.users?.active ?? "—"} Active ({data?.users?.suspended ?? "—"} Suspended)
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border">
          <span className="text-xs text-muted-foreground">Authentication wellbeing</span>
          <div className="text-2xl font-extrabold text-brand mt-2">{data?.security?.successRate ?? "—"}%</div>
          <span className="text-[11px] text-muted-foreground font-mono mt-1 block">
            {data?.security?.successLogins ?? "—"} Successes / {data?.security?.failedLogins ?? "—"} Flags
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border">
          <span className="text-xs text-muted-foreground">Active Concurrent Sessions</span>
          <div className="text-2xl font-extrabold text-gold mt-2">{data?.operations?.activeSessions ?? "—"}</div>
          <span className="text-[11px] text-muted-foreground font-mono mt-1 block">Valid Refresh Tokens</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border">
          <span className="text-xs text-muted-foreground">Scientific Cases Evaluated</span>
          <div className="text-2xl font-extrabold text-info mt-2">{data?.operations?.totalCases ?? "—"}</div>
          <span className="text-[11px] text-muted-foreground font-mono mt-1 block">EFCT 2025 Multi-Strand Checks</span>
        </div>
      </div>

      {/* Two Columns: Language and Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preferred Language Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-border">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
            <Globe size={16} className="text-brand" />
            <span>Preferred Ethiopian Language Distribution</span>
          </h2>
          <p className="text-[11px] text-muted-foreground mb-5">Interface language chosen during patient registration</p>

          <div className="space-y-3.5">
            {(data?.languageDistribution || []).map((lang: any) => {
              const total = data?.users?.total || 1;
              const pct = Math.round((lang.count / total) * 100);
              return (
                <div key={lang.code} className="text-xs">
                  <div className="flex justify-between text-soft mb-1">
                    <span className="font-medium">{lang.label}</span>
                    <span className="font-mono text-muted-foreground">{lang.count} users ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-foreground/10 overflow-hidden">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-border">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
            <BarChart3 size={16} className="text-gold" />
            <span>Regional Demographics (Ethiopia)</span>
          </h2>
          <p className="text-[11px] text-muted-foreground mb-5">Altitude-specific patient origin mapping</p>

          <div className="grid grid-cols-2 gap-2.5">
            {(data?.regionalDistribution || []).map((reg: any) => (
              <div key={reg.region} className="p-3 rounded-xl bg-sunken/80 border border-border flex items-center justify-between text-xs">
                <span className="text-soft">{reg.region}</span>
                <span className="font-mono text-brand font-bold">{reg.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Outcomes reported in the 3/14/30-day check-ins */}
      <div className="glass-panel p-6 rounded-2xl border border-border">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
          <HeartPulse size={16} className="text-brand" />
          <span>Outcomes after reports and sessions</span>
        </h2>
        <p className="text-[11px] text-muted-foreground mb-4">
          Answers to the check-ins sent 3, 14 and 30 days later. Helped rate counts "partly" as half.
        </p>
        {data?.outcomes ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-4">
              <div className="p-4 rounded-xl bg-sunken/80 border border-border">
                <span className="text-muted-foreground block mb-1">Check-ins sent</span>
                <span className="text-lg font-bold text-foreground font-mono">{data.outcomes.sent}</span>
              </div>
              <div className="p-4 rounded-xl bg-sunken/80 border border-border">
                <span className="text-muted-foreground block mb-1">Answered</span>
                <span className="text-lg font-bold text-foreground font-mono">{data.outcomes.answered}</span>
              </div>
              <div className="p-4 rounded-xl bg-sunken/80 border border-border">
                <span className="text-muted-foreground block mb-1">Need attention</span>
                <span className="text-lg font-bold text-gold font-mono">{data.outcomes.needsAttention}</span>
                <p className="text-[11px] text-subtle mt-1">Side effects reported or did not help</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              <OutcomeList title="By care pathway" rows={data.outcomes.byDomain} />
              <OutcomeList title="By reviewer" rows={data.outcomes.byReviewer} />
              <OutcomeList title="By business" rows={data.outcomes.byBusiness} />
            </div>
          </>
        ) : (
          <p className="text-xs text-subtle">Outcome data is not available yet.</p>
        )}
      </div>

      {/* Security wellbeing & Lockout Diagnostics */}
      <div className="glass-panel p-6 rounded-2xl border border-border">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
          <Shield size={16} className="text-brand" />
          <span>Security & Lockout Compliance</span>
        </h2>
        <p className="text-[11px] text-muted-foreground mb-4">Real-time attack mitigation and account defense stats</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-sunken/80 border border-border">
            <span className="text-muted-foreground block mb-1">Max Failed Attempts</span>
            <span className="text-lg font-bold text-foreground font-mono">5 Attempts</span>
            <p className="text-[11px] text-subtle mt-1">Automatic 15-minute temporary freeze</p>
          </div>
          <div className="p-4 rounded-xl bg-sunken/80 border border-border">
            <span className="text-muted-foreground block mb-1">Session Inactivity Timeout</span>
            <span className="text-lg font-bold text-foreground font-mono">15 Minutes</span>
            <p className="text-[11px] text-subtle mt-1">Extended to 30 days for Remember Me</p>
          </div>
          <div className="p-4 rounded-xl bg-sunken/80 border border-border">
            <span className="text-muted-foreground block mb-1">Scrypt Salt & Hash</span>
            <span className="text-lg font-bold text-brand font-mono">N=16384, r=8, p=1</span>
            <p className="text-[11px] text-subtle mt-1">Hardware-brute resistant cryptography</p>
          </div>
        </div>
      </div>
    </div>
  );
}
