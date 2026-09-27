"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CaseStatus } from "@/lib/pipeline/types";
import { StatusTimeline } from "@/components/pipeline/StatusTimeline";
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  FileText,
  Save,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Pill,
} from "lucide-react";

export default function ProfessionalCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = (params?.id as string) || (params?.caseId as string);

  const [caseRecord, setCaseRecord] = useState<any>(null);
  const [proReport, setProReport] = useState<any>(null);
  const [projectedUserReport, setProjectedUserReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Editable fields in Professional Report
  const [illnessModel, setIllnessModel] = useState("");
  const [separationAdvice, setSeparationAdvice] = useState("");
  const [monitoringPlan, setMonitoringPlan] = useState("");

  // Modals state
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideJustification, setOverrideJustification] = useState("");
  const [overrideConfirmed, setOverrideConfirmed] = useState(false);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnNote, setReturnNote] = useState("");

  const loadData = async () => {
    if (!caseId) return;
    setLoading(true);
    setActionError(null);

    try {
      // 1. Load case details
      const caseRes = await fetch(`/api/cases/${caseId}`, {
        headers: { "x-actor-id": "pro-dr-girma", "x-actor-role": "PROFESSIONAL" },
      });
      const caseJson = await caseRes.json();
      if (!caseJson.success) throw new Error(caseJson.error || "Failed to load case");
      setCaseRecord(caseJson.data);

      // 2. Load professional report
      const proRes = await fetch(`/api/cases/${caseId}/report/pro`, {
        headers: { "x-actor-id": "pro-dr-girma", "x-actor-role": "PROFESSIONAL" },
      });
      const proJson = await proRes.json();
      if (!proJson.success) throw new Error(proJson.error || "Failed to load pro report");
      setProReport(proJson.data);

      setIllnessModel(proJson.data.culturalAnalysis?.illnessModel || "");
      setSeparationAdvice(proJson.data.pharmacology?.separationAdvice || "");
      setMonitoringPlan(proJson.data.pharmacology?.monitoringPlan?.join("\n") || "");

      // 3. Load user report preview
      const userRes = await fetch(`/api/cases/${caseId}/report/user`, {
        headers: { "x-actor-id": "pro-dr-girma", "x-actor-role": "PROFESSIONAL" },
      });
      const userJson = await userRes.json();
      if (userJson.success) {
        setProjectedUserReport(userJson.data);
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  // Handle Save & Re-project
  const handleSaveAndReproject = async () => {
    setSaving(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const updatedCultural = {
        ...proReport.culturalAnalysis,
        illnessModel,
      };
      const updatedPharmacology = {
        ...proReport.pharmacology,
        separationAdvice,
        monitoringPlan: monitoringPlan.split("\n").filter(Boolean),
      };

      const res = await fetch(`/api/cases/${caseId}/report/pro`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": "pro-dr-girma",
          "x-actor-role": "PROFESSIONAL",
        },
        body: JSON.stringify({
          culturalAnalysis: updatedCultural,
          pharmacology: updatedPharmacology,
          editNote: "Professional updated illness model and pharmacological separation instructions.",
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save edits");

      setProReport(json.data.professionalReport);
      setProjectedUserReport(json.data.projectedUserReport);
      setActionSuccess("Professional report updated & User Report re-projected successfully!");
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle Approve
  const handleApprove = async () => {
    setActionError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": "pro-dr-girma",
          "x-actor-role": "PROFESSIONAL",
        },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Approval failed");

      setActionSuccess("Case approved! Transitioned to PENDING_ADMIN.");
      loadData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Handle Safety Gate Override
  const handleOverrideGate = async () => {
    setActionError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/override-gate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": "pro-dr-girma",
          "x-actor-role": "PROFESSIONAL",
        },
        body: JSON.stringify({
          justification: overrideJustification,
          confirmationCheckbox: overrideConfirmed,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Override failed");

      setShowOverrideModal(false);
      setActionSuccess("Safety gate override recorded in immutable audit log.");
      loadData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Handle Return
  const handleReturn = async () => {
    setActionError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": "pro-dr-girma",
          "x-actor-role": "PROFESSIONAL",
        },
        body: JSON.stringify({ note: returnNote }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Return failed");

      setShowReturnModal(false);
      setActionSuccess("Case returned to patient for additional intake information.");
      loadData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-12 text-center text-sm">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-400" />
        Loading clinical case and dual-track reports...
      </div>
    );
  }

  const isBlocked = caseRecord?.status === CaseStatus.BLOCKED_BY_SAFETY_GATE;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            href="/professional/cases"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Queue
          </Link>

          <div className="flex items-center gap-3">
            {isBlocked && (
              <button
                onClick={() => setShowOverrideModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-bold text-rose-300 transition-all flex items-center gap-2 animate-pulse"
              >
                <ShieldAlert className="w-4 h-4" />
                Override Safety Gate
              </button>
            )}

            <button
              onClick={() => setShowReturnModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Return for Info
            </button>

            <button
              onClick={handleApprove}
              disabled={isBlocked && !caseRecord.overrideJustification}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              Approve Case
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {actionError && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Action Blocked</p>
              <p>{actionError}</p>
            </div>
          </div>
        )}

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm flex items-start gap-3">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-semibold">Success</p>
              <p>{actionSuccess}</p>
            </div>
          </div>
        )}

        {/* Status Timeline */}
        {caseRecord && (
          <StatusTimeline
            currentStatus={caseRecord.status}
            hasOverride={Boolean(caseRecord.overrideJustification)}
          />
        )}

        {/* Case Context Header */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Case #{caseRecord.id}
            </h2>
            <div className="text-xs text-slate-400">
              Submitted: {new Date(caseRecord.submittedAt).toLocaleString()}
            </div>
          </div>
          <p className="text-sm text-slate-200">
            <strong>Narrative:</strong> {caseRecord.narrative}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
            <span><strong>Duration:</strong> {caseRecord.duration}</span>
            <span><strong>Reported Symptoms:</strong> {caseRecord.symptoms?.join(", ")}</span>
            <span><strong>Self Treatments:</strong> {caseRecord.selfTreatments?.join(", ")}</span>
          </div>
        </div>

        {/* SIDE-BY-SIDE DUAL REPORT WORKSPACE (§11) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: EDITABLE PROFESSIONAL REPORT */}
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Restricted Clinical Superset
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Professional Clinical Report (Editable)
                </h3>
              </div>
              <button
                onClick={handleSaveAndReproject}
                disabled={saving}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Projecting..." : "Save & Re-project"}
              </button>
            </div>

            {/* Safety Gate Raw Internals */}
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Safety Gate Status: {proReport?.safetyGate?.status}
              </h4>
              <p className="text-xs text-slate-300">{proReport?.safetyGate?.summary}</p>
              {proReport?.matchedRules?.length > 0 && (
                <div className="space-y-2 mt-2">
                  <span className="text-[11px] font-semibold text-slate-400 block">Matched Rules:</span>
                  {proReport.matchedRules.map((r: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-black/40 border border-rose-500/20 text-xs">
                      <div className="flex justify-between font-bold text-rose-300">
                        <span>{r.herbName} + {r.medicationName}</span>
                        <span className="uppercase">{r.severity}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-1">{r.clinicalEffect}</p>
                      <p className="text-slate-500 text-[10px] font-mono mt-0.5">Mechanism: {r.mechanism}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Differential Considerations */}
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2 text-xs">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Differential Considerations & Endemic Matching
              </h4>
              <div className="space-y-2">
                {proReport?.differentialConsiderations?.map((d: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-white/5 border border-white/5">
                    <strong className="text-cyan-200">{d.condition}</strong> (Prevalence: {d.localPrevalence})
                    <p className="text-slate-400 text-[11px]">Supporting: {d.supporting.join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Editable Illness Model */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-amber-300 uppercase tracking-wider">
                Cultural Illness Model (Editing updates plain language projection)
              </label>
              <textarea
                rows={3}
                value={illnessModel}
                onChange={(e) => setIllnessModel(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Editable Pharmacology Advice */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-amber-300 uppercase tracking-wider">
                Pharmacology Separation Advice
              </label>
              <input
                type="text"
                value={separationAdvice}
                onChange={(e) => setSeparationAdvice(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* CYP Pathways */}
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-xs space-y-1">
              <h4 className="font-bold text-purple-400 uppercase tracking-wider">CYP Pathways Analyzed</h4>
              <p className="text-slate-300">{proReport?.pharmacology?.cypPathways?.join(", ") || "None flagged"}</p>
            </div>
          </div>

          {/* RIGHT: READ-ONLY LIVE PROJECTED USER REPORT PREVIEW */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Read-Only Preview
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Projected User Report (Live Preview)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {projectedUserReport?.approvedBy?.name ? `Signed: ${projectedUserReport.approvedBy.name}` : "Draft"}
              </span>
            </div>

            {projectedUserReport ? (
              <div className="space-y-4 text-xs">
                {projectedUserReport.urgentDirective && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{projectedUserReport.urgentDirective}</span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <h4 className="font-bold text-emerald-300 text-sm">{projectedUserReport.headline}</h4>
                  <p className="text-slate-300 leading-relaxed">
                    {projectedUserReport.yourSituation?.culturalFraming}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <h4 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
                    Plain-Language Explanation
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    {projectedUserReport.whatMayBeHappening?.plainLanguage}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <h4 className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                    Traditional Remedies Evaluation
                  </h4>
                  {projectedUserReport.traditionalRemedies?.map((r: any, idx: number) => (
                    <div key={idx} className="p-2 rounded bg-slate-900 border border-white/10 flex justify-between">
                      <div>
                        <span className="font-bold text-white">{r.name} ({r.amharic})</span>
                        <p className="text-slate-300 text-[11px]">{r.reason}</p>
                      </div>
                      <span className="font-bold uppercase text-[10px] text-amber-400">{r.status}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-[10px] text-slate-400">
                  <em>No rule matched ≠ safe. Disclaimers verified. Mechanism strings strictly hidden.</em>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Generating live preview projection...</p>
            )}
          </div>
        </div>

        {/* OVERRIDE MODAL */}
        {showOverrideModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-2xl border border-rose-500/50 max-w-lg w-full space-y-4">
              <h3 className="text-lg font-bold text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                Override Authoritative Herb-Drug Safety Gate
              </h3>
              <p className="text-xs text-slate-300">
                You are overriding a high-severity interaction flag. In accordance with Section 1 of the Work Order, your justification will be stored as an immutable audit event and appended to the patient disclaimer.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Substantive Clinical Justification (min 15 characters) *
                </label>
                <textarea
                  rows={3}
                  value={overrideJustification}
                  onChange={(e) => setOverrideJustification(e.target.value)}
                  placeholder="e.g. Patient instructed on 4-hour temporal separation and close glycemic self-monitoring under clinic supervision..."
                  className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrideConfirmed}
                  onChange={(e) => setOverrideConfirmed(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-900 border-white/20 text-rose-500 focus:ring-rose-500"
                />
                <span className="text-xs text-slate-300">
                  I accept clinical responsibility for overriding this botanical-pharmaceutical interaction warning.
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOverrideGate}
                  disabled={overrideJustification.trim().length < 15 || !overrideConfirmed}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  Confirm Clinical Override
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RETURN MODAL */}
        {showReturnModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-2xl border border-white/20 max-w-lg w-full space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-400" />
                Return Case for Additional Patient Information
              </h3>
              <p className="text-xs text-slate-300">
                Specify what additional information, symptoms, or dosages are required from the user.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Explanation Note (min 5 characters) *
                </label>
                <textarea
                  rows={3}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="e.g. Please clarify exact dosage of metformin and how many hours after eating Kosso was consumed."
                  className="w-full bg-slate-900 border border-white/15 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
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
                  onClick={handleReturn}
                  disabled={returnNote.trim().length < 5}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold disabled:opacity-50"
                >
                  Return Case
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
