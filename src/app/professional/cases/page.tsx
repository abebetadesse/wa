"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CaseStatus } from "@/lib/pipeline/types";
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  FileText,
  Filter,
  ArrowRight,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import { withBasePath } from '@/lib/base-path';

export default function ProfessionalQueuePage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch(withBasePath("/api/cases"));
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCases(json.data);
      }
    } catch (err) {
      console.error("Failed to load queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filtered = cases.filter((c) => {
    if (filterStatus === "ALL") return true;
    return c.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-strong text-xs font-semibold uppercase tracking-wider mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              Clinical Professional Review Desk
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">
              Clinical Case Triage & Dual-Report Queue
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Authoritative clinical review, safety gate override supervision, and cultural translation inspection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCases}
              className="px-3.5 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border text-xs font-medium text-soft transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Queue
            </button>
            <Link
              href="/pipeline"
              className="px-3.5 py-2 rounded-xl bg-brand/20 hover:bg-brand/30 border border-brand/40 text-xs font-medium text-brand-strong transition-colors"
            >
              User Intake Portal
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0 mr-1" />
          {[
            { id: "ALL", label: "All Cases" },
            { id: CaseStatus.BLOCKED_BY_SAFETY_GATE, label: "Blocked by Safety Gate", badge: "rose" },
            { id: CaseStatus.PENDING_PROFESSIONAL, label: "Pending Pro Review", badge: "amber" },
            { id: CaseStatus.PENDING_ADMIN, label: "Pending Admin", badge: "purple" },
            { id: CaseStatus.PUBLISHED, label: "Published", badge: "emerald" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                filterStatus === tab.id
                  ? "bg-gold-fill text-gold-foreground font-bold"
                  : "bg-foreground/5 text-soft hover:bg-foreground/10 border border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Queue Grid */}
        {loading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-gold" />
            Loading triage queue...
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-border text-center space-y-3">
            <FileText className="w-10 h-10 text-subtle mx-auto" />
            <h3 className="text-base font-bold text-foreground">No cases match the selected filter</h3>
            <p className="text-xs text-muted-foreground">
              Submit a case in the user portal to see it populate the triage queue.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const isBlocked = item.status === CaseStatus.BLOCKED_BY_SAFETY_GATE;
              const isPublished = item.status === CaseStatus.PUBLISHED;

              return (
                <div
                  key={item.id}
                  className={`glass-panel p-5 rounded-2xl border transition-all hover:border-gold/50 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isBlocked
                      ? "border-danger/30 bg-danger-soft/70"
                      : "border-border"
                  }`}
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{item.id}</span>
                      {isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-danger/20 text-danger-strong border border-danger/40">
                          <ShieldAlert className="w-3 h-3 text-danger" />
                          Safety Gate Blocked
                        </span>
                      ) : isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand/20 text-brand-strong border border-brand/40">
                          <CheckCircle className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gold/20 text-gold-strong border border-gold/40">
                          <Clock className="w-3 h-3" />
                          {item.status}
                        </span>
                      )}
                      {item.overrideJustification && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand/20 text-brand-strong border border-brand/30">
                          Override Active
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-foreground line-clamp-1">
                      {item.narrative}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span><strong>Duration:</strong> {item.duration}</span>
                      <span>•</span>
                      <span><strong>Symptoms:</strong> {item.symptoms?.join(", ")}</span>
                      <span>•</span>
                      <span><strong>Treatments:</strong> {item.selfTreatments?.join(", ")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/professional/cases/${item.id}`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-fill to-gold-fill hover:from-gold-fill hover:to-gold-fill text-gold-foreground text-xs font-bold shadow-md transition-all flex items-center gap-2"
                    >
                      Inspect Dual Reports
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
  );
}
