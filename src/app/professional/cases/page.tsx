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

export default function ProfessionalQueuePage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cases", {
        headers: {
          "x-actor-id": "pro-dr-girma",
          "x-actor-role": "PROFESSIONAL",
        },
      });
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              Clinical Professional Review Desk
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Clinical Case Triage & Dual-Report Queue
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Authoritative clinical review, safety gate override supervision, and cultural translation inspection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCases}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Queue
            </button>
            <Link
              href="/pipeline"
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-medium text-emerald-300 transition-colors"
            >
              User Intake Portal
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
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
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Queue Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-400" />
            Loading triage queue...
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No cases match the selected filter</h3>
            <p className="text-xs text-slate-400">
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
                  className={`glass-panel p-5 rounded-2xl border transition-all hover:border-amber-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isBlocked
                      ? "border-rose-500/30 bg-rose-950/10"
                      : "border-white/10"
                  }`}
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{item.id}</span>
                      {isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          <ShieldAlert className="w-3 h-3 text-rose-400" />
                          Safety Gate Blocked
                        </span>
                      ) : isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <Clock className="w-3 h-3" />
                          {item.status}
                        </span>
                      )}
                      {item.overrideJustification && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Override Active
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-white line-clamp-1">
                      {item.narrative}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
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
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-950/40 transition-all flex items-center gap-2"
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
