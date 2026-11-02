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
import { withBasePath } from '@/lib/base-path';

export default function AdminQueuePage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch(withBasePath("/api/cases"));
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
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum/10 border border-plum/30 text-plum-strong text-xs font-semibold uppercase tracking-wider mb-2">
              <Sliders className="w-3.5 h-3.5" />
              Platform Administration & Publication Gate
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Governance & Clinical Publication Console
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Final publication control, knowledge package versioning, and immutable audit verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCases}
              className="px-3.5 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border text-xs font-medium text-soft transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/pipeline"
              className="px-3.5 py-2 rounded-xl bg-brand/20 hover:bg-brand/30 border border-brand/40 text-xs font-medium text-brand-strong transition-colors"
            >
              Patient Portal
            </Link>
          </div>
        </div>

        {/* Knowledge Package & Pillar Version Panel (§15) */}
        <div className="glass-panel p-5 rounded-2xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-plum flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Active Knowledge Pillar Packages & Rule Registries
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">Pipeline v1.0.0</span>
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
              <div key={i} className="p-2.5 rounded-xl bg-foreground/5 border border-border space-y-1">
                <span className="text-[10px] text-plum font-bold uppercase block">{p.domain}</span>
                <span className="text-soft font-semibold block truncate">{p.pkg}</span>
                <span className="text-subtle text-[10px] font-mono">v{p.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Case Queue */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold" />
            Publication Review Queue ({cases.length})
          </h2>

          {loading ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-plum" />
              Loading publication queue...
            </div>
          ) : cases.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border border-border text-center space-y-2">
              <FileText className="w-10 h-10 text-subtle mx-auto" />
              <p className="text-sm text-soft font-medium">No cases currently in the pipeline</p>
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
                    className="glass-panel p-5 rounded-2xl border border-border hover:border-plum/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
                        {isBlocked ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-danger/20 text-danger-strong border border-danger/40">
                            Safety Gate Blocked
                          </span>
                        ) : isPub ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand/20 text-brand-strong border border-brand/40">
                            Published to Patient
                          </span>
                        ) : isReadyForPub ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-plum/20 text-plum-strong border border-plum/40 animate-pulse">
                            Ready for Publication Signoff
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gold/20 text-gold-strong border border-gold/40">
                            {c.status}
                          </span>
                        )}

                        {c.overrideJustification && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-brand/15 text-brand-strong border border-brand/30">
                            Override Documented
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-foreground line-clamp-1">{c.narrative}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Submitted: {new Date(c.submittedAt).toLocaleDateString()}</span>
                        <span>User: {c.userId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href={`/admin/cases/${c.id}`}
                        className="px-4 py-2 rounded-xl bg-plum hover:bg-plum text-plum-foreground text-xs font-bold shadow-md transition-all flex items-center gap-2"
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
