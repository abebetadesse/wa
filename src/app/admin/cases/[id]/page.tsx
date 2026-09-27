"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CaseStatus } from "@/lib/pipeline/types";
import { StatusTimeline } from "@/components/pipeline/StatusTimeline";
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  FileText,
  History,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Send,
  Eye,
} from "lucide-react";

export default function AdminCaseDetailPage() {
  const params = useParams();
  const caseId = (params?.id as string) || (params?.caseId as string);

  const [caseRecord, setCaseRecord] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [proReport, setProReport] = useState<any>(null);
  const [userReport, setUserReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnNote, setReturnNote] = useState("");

  const loadData = async () => {
    if (!caseId) return;
    setLoading(true);
    setActionError(null);

    try {
      // 1. Load case details
      const caseRes = await fetch(`/api/cases/${caseId}`, {
        headers: { "x-actor-id": "admin-board", "x-actor-role": "ADMIN" },
      });
      const caseJson = await caseRes.json();
      if (!caseJson.success) throw new Error(caseJson.error || "Failed to load case");
      setCaseRecord(caseJson.data);

      // 2. Load audit events
      const eventsRes = await fetch(`/api/cases/${caseId}/events`, {
        headers: { "x-actor-id": "admin-board", "x-actor-role": "ADMIN" },
      });
      const eventsJson = await eventsRes.json();
      if (eventsJson.success) {
        setEvents(eventsJson.data);
      }

      // 3. Load professional report
      const proRes = await fetch(`/api/cases/${caseId}/report/pro`, {
        headers: { "x-actor-id": "admin-board", "x-actor-role": "ADMIN" },
      });
      const proJson = await proRes.json();
      if (proJson.success) setProReport(proJson.data);

      // 4. Load user report
      const userRes = await fetch(`/api/cases/${caseId}/report/user`, {
        headers: { "x-actor-id": "admin-board", "x-actor-role": "ADMIN" },
      });
      const userJson = await userRes.json();
      if (userJson.success) setUserReport(userJson.data);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  // Handle Publish
  const handlePublish = async () => {
    setActionError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": "admin-board",
          "x-actor-role": "ADMIN",
        },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Publication failed");

      setActionSuccess("Case officially published to patient! User Report is now visible.");
      loadData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Handle Return to Professional
  const handleReturnToPro = async () => {
    setActionError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": "admin-board",
          "x-actor-role": "ADMIN",
        },
        body: JSON.stringify({ note: returnNote }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Return failed");

      setShowReturnModal(false);
      setActionSuccess("Case returned to professional for revision.");
      loadData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-12 text-center text-sm">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-400" />
        Loading administrative inspection console...
      </div>
    );
  }

  const isPublished = caseRecord?.status === CaseStatus.PUBLISHED;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            href="/admin/cases"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Queue
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReturnModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Return to Professional
            </button>

            {!isPublished ? (
              <button
                onClick={handlePublish}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-950/40 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Approve & Publish to Patient
              </button>
            ) : (
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Published
              </span>
            )}
          </div>
        </div>

        {/* Action Feedback */}
        {actionError && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Publication Failed</p>
              <p>{actionError}</p>
            </div>
          </div>
        )}

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm flex items-start gap-3">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-semibold">Action Successful</p>
              <p>{actionSuccess}</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        {caseRecord && (
          <StatusTimeline
            currentStatus={caseRecord.status}
            hasOverride={Boolean(caseRecord.overrideJustification)}
          />
        )}

        {/* AUDIT TRAIL VIEWER (§11, §15) */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <History className="w-4 h-4" />
              Immutable Case Lifecycle Audit Trail ({events.length} Events)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Append-Only Event Store</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-2">
            {events.map((evt, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-purple-400 font-bold uppercase">{evt.type}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300 font-semibold">Actor: {evt.actorId} ({evt.actorRole})</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{evt.note || "No custom note provided."}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(evt.at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dual Report Preview Inspection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Professional View */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              Professional Report Payload
            </h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-2 text-slate-300">
              <p><strong>Illness Model:</strong> {proReport?.culturalAnalysis?.illnessModel}</p>
              <p><strong>Differential:</strong> {proReport?.differentialConsiderations?.map((d: any) => d.condition).join(", ")}</p>
              <p><strong>CYP Pathways:</strong> {proReport?.pharmacology?.cypPathways?.join(", ") || "None"}</p>
              <p><strong>Separation:</strong> {proReport?.pharmacology?.separationAdvice}</p>
            </div>
          </div>

          {/* User Report View */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h4 className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              User-Facing Report Payload (Published or Pending)
            </h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-2 text-slate-300">
              <p><strong>Headline:</strong> {userReport?.headline}</p>
              <p><strong>Plain Language:</strong> {userReport?.whatMayBeHappening?.plainLanguage}</p>
              <p><strong>Emphasized Foods:</strong> {userReport?.foodAndNutrition?.localFoodsToEmphasize?.join(", ")}</p>
              <p><strong>Remedies Checked:</strong> {userReport?.traditionalRemedies?.map((r: any) => `${r.name}: ${r.status}`).join("; ")}</p>
            </div>
          </div>
        </div>

        {/* RETURN MODAL */}
        {showReturnModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-2xl border border-white/20 max-w-lg w-full space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-400" />
                Return Case to Professional for Revision
              </h3>
              <p className="text-xs text-slate-300">
                Specify what changes, clarifications, or risk reassessments are required before publication can be approved.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Revision Directive (min 5 characters) *
                </label>
                <textarea
                  rows={3}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="e.g. Please clarify if the dietary recommendations account for local fasting seasonality..."
                  className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturnToPro}
                  disabled={returnNote.trim().length < 5}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  Confirm Return
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
