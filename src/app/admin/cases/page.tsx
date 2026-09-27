"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CaseStatus } from "@/lib/pipeline/types";
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  FileText,
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  Sparkles,
} from "lucide-react";

export default function AdminQueuePage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cases", {
        headers: {
          "x-actor-id": "admin-board",
          "x-actor-role": "ADMIN",
        },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCases(json.data);
      }
    } catch (err) {
      console.error("Failed to load admin queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sliders className="w-3.5 h-3.5" />
              Platform Administration & Publication Gate
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Governance & Clinical Publication Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Final publication control, knowledge package versioning, and immutable audit verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCases}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/pipeline"
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-medium text-emerald-300 transition-colors"
            >
              Patient Portal
            </Link>
          </div>
        </div>

        {/* Knowledge Package & Pillar Version Panel (§15) */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Active Knowledge Pillar Packages & Rule Registries
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Pipeline v1.0.0</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
            {[
              { domain: "Cultural", pkg: "ethiopia.highlands", v: "1.0.0" },
              { domain: "Spiritual", pkg: "orthodox.tewahedo", v: "1.0.0" },
              { domain: "Ecological", pkg: "agroEcologicalZones", v: "1.0.0" },
              { domain: "Nutritional", pkg: "foodSystems", v: "1.0.0" },
              { domain: "Biomedical", pkg: "stage5SafetyGate", v: "authoritative" },
              { domain: "Clinical", pkg: "redFlags", v: "1.0.0" },
            ].map((p, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] text-purple-300 font-bold uppercase block">{p.domain}</span>
                <span className="text-slate-200 font-semibold block truncate">{p.pkg}</span>
                <span className="text-slate-500 text-[10px] font-mono">v{p.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Case Queue */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Publication Review Queue ({cases.length})
          </h2>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-400" />
              Loading publication queue...
            </div>
          ) : cases.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm text-slate-300 font-medium">No cases currently in the pipeline</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.map((c) => {
                const isBlocked = c.status === CaseStatus.BLOCKED_BY_SAFETY_GATE;
                const isReadyForPub = c.status === CaseStatus.PENDING_ADMIN || c.status === CaseStatus.APPROVED;
                const isPub = c.status === CaseStatus.PUBLISHED;

                return (
                  <div
                    key={c.id}
                    className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">{c.id}</span>
                        {isBlocked ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            Safety Gate Blocked
                          </span>
                        ) : isPub ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Published to Patient
                          </span>
                        ) : isReadyForPub ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                            Ready for Publication Signoff
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {c.status}
                          </span>
                        )}

                        {c.overrideJustification && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Override Documented
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-white line-clamp-1">{c.narrative}</p>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Submitted: {new Date(c.submittedAt).toLocaleDateString()}</span>
                        <span>User: {c.userId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={`/admin/cases/${c.id}`}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-950/40 transition-all flex items-center gap-2"
                      >
                        Inspect & Audit
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
