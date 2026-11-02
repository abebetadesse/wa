"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { withBasePath } from '@/lib/base-path';

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
  const [reviewedRedFlags, setReviewedRedFlags] = useState<Set<string>>(new Set());

  // Modals state
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideJustification, setOverrideJustification] = useState("");
  const [overrideConfirmed, setOverrideConfirmed] = useState(false);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnNote, setReturnNote] = useState("");

  const loadData = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setActionError(null);
    setReviewedRedFlags(new Set());

    try {
      // 1. Load case details
      const caseRes = await fetch(withBasePath(`/api/cases/${caseId}`), {
      });
      const caseJson = await caseRes.json();
      if (!caseJson.success) throw new Error(caseJson.error || "Failed to load case");
      setCaseRecord(caseJson.data);

      // 2. Load professional report
      const proRes = await fetch(withBasePath(`/api/cases/${caseId}/report/pro`), {
      });
      const proJson = await proRes.json();
      if (!proJson.success) throw new Error(proJson.error || "Failed to load pro report");
      setProReport(proJson.data);

      setIllnessModel(proJson.data.culturalAnalysis?.illnessModel || "");
      setSeparationAdvice(proJson.data.pharmacology?.separationAdvice || "");
      setMonitoringPlan(proJson.data.pharmacology?.monitoringPlan?.join("\n") || "");

      // 3. Load user report preview
      const userRes = await fetch(withBasePath(`/api/cases/${caseId}/report/user`), {
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
  }, [caseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

      const res = await fetch(withBasePath(`/api/cases/${caseId}/report/pro`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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
      const res = await fetch(withBasePath(`/api/cases/${caseId}/approve`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      const res = await fetch(withBasePath(`/api/cases/${caseId}/override-gate`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      const res = await fetch(withBasePath(`/api/cases/${caseId}/return`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      <div className="min-h-screen bg-background text-foreground p-12 text-center text-sm">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-gold" />
        Loading clinical case and dual-track reports...
      </div>
    );
  }

  const isBlocked = caseRecord?.status === CaseStatus.BLOCKED_BY_SAFETY_GATE;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Link
            href="/professional/cases"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Queue
          </Link>

          <div className="flex items-center gap-3">
            {isBlocked && (
              <button
                onClick={() => setShowOverrideModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-danger/20 hover:bg-danger/30 border border-danger/40 text-xs font-bold text-danger-strong transition-all flex items-center gap-2 animate-pulse"
              >
                <ShieldAlert className="w-4 h-4" />
                Override Safety Gate
              </button>
            )}

            <button
              onClick={() => setShowReturnModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border text-xs font-medium text-soft transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Return for Info
            </button>

            <button
              onClick={handleApprove}
              disabled={isBlocked && !caseRecord.overrideJustification}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-brand to-brand hover:from-brand hover:to-brand text-brand-foreground text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              Approve Case
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {actionError && (
          <div className="p-4 rounded-xl bg-danger/15 border border-danger/40 text-danger-strong text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-danger mt-0.5" />
            <div>
              <p className="font-semibold">Action Blocked</p>
              <p>{actionError}</p>
            </div>
          </div>
        )}

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-brand/15 border border-brand/40 text-brand-strong text-sm flex items-start gap-3">
            <CheckCircle className="w-5 h-5 shrink-0 text-brand mt-0.5" />
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
        <div className="glass-panel p-5 rounded-2xl border border-border space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" />
              Case #{caseRecord.id}
            </h2>
            <div className="text-xs text-muted-foreground">
              Submitted: {new Date(caseRecord.submittedAt).toLocaleString()}
            </div>
          </div>
          <p className="text-sm text-soft">
            <strong>Narrative:</strong> {caseRecord.narrative}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-soft pt-1">
            <span><strong>Duration:</strong> {caseRecord.duration}</span>
            <span><strong>Reported Symptoms:</strong> {caseRecord.symptoms?.join(", ")}</span>
            <span><strong>Self Treatments:</strong> {caseRecord.selfTreatments?.join(", ")}</span>
          </div>
        </div>

        {/* SIDE-BY-SIDE DUAL REPORT WORKSPACE (§11) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: EDITABLE PROFESSIONAL REPORT */}
          <div className="glass-panel p-6 rounded-2xl border border-gold/30 space-y-6 shadow-panel">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-strong bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
                  Restricted Clinical Superset
                </span>
                <h3 className="text-xl font-bold text-foreground mt-1">
                  Professional Clinical Report (Editable)
                </h3>
              </div>
              <button
                onClick={handleSaveAndReproject}
                disabled={saving}
                className="px-3.5 py-1.5 rounded-xl bg-gold-fill hover:bg-gold-fill text-gold-foreground font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Projecting..." : "Save & Re-project"}
              </button>
            </div>

            <section className="grid gap-3 sm:grid-cols-3" aria-label="Professional report summary">
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Overall confidence</p>
                <p className="mt-1 font-bold capitalize text-foreground">{proReport?.confidence || "Not available"}</p>
                <p className="mt-1 text-[10px] text-subtle">Report-level confidence; not a separate confidence score for each recommendation.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk profile</p>
                <p className="mt-1 font-bold text-foreground">{proReport?.redFlags?.length || 0} red flag(s)</p>
                <p className="mt-1 text-[10px] text-subtle">Safety gate: {proReport?.safetyGate?.status || "Not available"}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Care plan</p>
                <p className="mt-1 font-bold text-foreground">{proReport?.recommendedActions?.forUser?.length || 0} user actions</p>
                <p className="mt-1 text-[10px] text-subtle">{proReport?.recommendedActions?.referrals?.length || 0} referral(s)</p>
              </div>
            </section>

            <section className="rounded-xl border border-danger/30 bg-danger-soft p-4" aria-labelledby="red-flags-heading">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 id="red-flags-heading" className="font-bold text-danger-strong">Red-flag review checklist</h4>
                <span className="text-xs text-muted-foreground" aria-live="polite">{reviewedRedFlags.size} / {proReport?.redFlags?.length || 0} reviewed</span>
              </div>
              {proReport?.redFlags?.length ? (
                <ul className="mt-3 space-y-2">
                  {proReport.redFlags.map((flag: any, index: number) => {
                    const key = `${flag.flag}-${index}`;
                    return (
                      <li key={key} className="flex items-start gap-2 rounded-lg border border-danger/20 bg-sunken/50 p-3 text-xs">
                        <input
                          type="checkbox"
                          checked={reviewedRedFlags.has(key)}
                          onChange={() => setReviewedRedFlags((previous) => {
                            const next = new Set(previous);
                            if (next.has(key)) next.delete(key);
                            else next.add(key);
                            return next;
                          })}
                          aria-label={`Mark red flag reviewed: ${flag.flag}`}
                          className="mt-0.5 size-4 accent-danger"
                        />
                        <span className="flex-1 text-soft"><strong>{flag.flag}</strong> · {flag.rationale}</span>
                        <span className="shrink-0 font-bold uppercase text-danger-strong">{flag.urgency}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : <p className="mt-2 text-xs text-muted-foreground">No red flags are recorded in this report.</p>}
            </section>

            <section className="rounded-xl border border-info/20 bg-card/80 p-4">
              <h4 className="font-bold text-info-strong">Clinical summary</h4>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-soft">{proReport?.narrative || "No clinical narrative is available."}</p>
            </section>

            {/* Safety Gate Raw Internals */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <h4 className="text-xs font-bold text-danger uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Safety Gate Status: {proReport?.safetyGate?.status}
              </h4>
              <p className="text-xs text-soft">{proReport?.safetyGate?.summary}</p>
              {proReport?.matchedRules?.length > 0 && (
                <div className="space-y-2 mt-2">
                  <span className="text-[11px] font-semibold text-muted-foreground block">Matched Rules:</span>
                  {proReport.matchedRules.map((r: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-sunken/80 border border-danger/20 text-xs">
                      <div className="flex justify-between font-bold text-danger">
                        <span>{r.herbName} + {r.medicationName}</span>
                        <span className="uppercase">{r.severity}</span>
                      </div>
                      <p className="text-soft text-[11px] mt-1">{r.clinicalEffect}</p>
                      <p className="text-subtle text-[10px] font-mono mt-0.5">Mechanism: {r.mechanism}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Differential Considerations */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-2 text-xs">
              <h4 className="text-xs font-bold text-info uppercase tracking-wider">
                Differential Considerations & Endemic Matching
              </h4>
              <div className="space-y-2">
                {proReport?.differentialConsiderations?.map((d: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-foreground/5 border border-border">
                    <strong className="text-info-strong">{d.condition}</strong> (Prevalence: {d.localPrevalence})
                    <p className="text-muted-foreground text-[11px]">Supporting: {d.supporting.join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Editable Illness Model */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-gold uppercase tracking-wider">
                Cultural Illness Model (Editing updates plain language projection)
              </label>
              <textarea
                rows={3}
                value={illnessModel}
                onChange={(e) => setIllnessModel(e.target.value)}
                className="w-full bg-card border border-border rounded-xl p-3 text-xs text-soft focus:outline-none focus:border-gold"
              />
            </div>

            {/* Editable Pharmacology Advice */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-gold uppercase tracking-wider">
                Pharmacology Separation Advice
              </label>
              <input
                type="text"
                value={separationAdvice}
                onChange={(e) => setSeparationAdvice(e.target.value)}
                className="w-full bg-card border border-border rounded-xl p-2.5 text-xs text-soft focus:outline-none focus:border-gold"
              />
            </div>

            {/* CYP Pathways */}
            <div className="p-4 rounded-xl bg-card border border-border text-xs space-y-1">
              <h4 className="font-bold text-plum uppercase tracking-wider">CYP Pathways Analyzed</h4>
              <p className="text-soft">{proReport?.pharmacology?.cypPathways?.join(", ") || "None flagged"}</p>
            </div>

            <section className="rounded-xl border border-brand/20 bg-card p-4" aria-labelledby="care-plan-heading">
              <h4 id="care-plan-heading" className="font-bold text-brand-strong">Care plan</h4>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <h5 className="text-xs font-semibold uppercase text-muted-foreground">For the user</h5>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-soft">{(proReport?.recommendedActions?.forUser || []).map((action: string, index: number) => <li key={`${action}-${index}`}>{action}</li>)}</ul>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase text-muted-foreground">Clinical follow-up and referrals</h5>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-soft">{[...(proReport?.recommendedActions?.forClinician || []), ...(proReport?.recommendedActions?.referrals || [])].map((action: string, index: number) => <li key={`${action}-${index}`}>{action}</li>)}</ul>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-info/20 bg-card p-4" aria-labelledby="pro-sources-heading">
              <h4 id="pro-sources-heading" className="font-bold text-info-strong">Report sources and provenance</h4>
              {proReport?.provenance?.length ? (
                <ul className="mt-2 space-y-2">
                  {proReport.provenance.map((source: any, index: number) => (
                    <li key={`${source.id || source.citation}-${index}`} className="rounded-lg border border-border p-2 text-xs">
                      <span className="font-semibold text-foreground">{source.title}</span>
                      <p className="mt-1 text-soft">{source.citation}{source.year ? ` · ${source.year}` : ""}</p>
                      <span className="text-[10px] uppercase text-subtle">{source.type}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-2 text-xs text-muted-foreground">No structured sources are recorded.</p>}
            </section>
          </div>

          {/* RIGHT: READ-ONLY LIVE PROJECTED USER REPORT PREVIEW */}
          <div className="glass-panel p-6 rounded-2xl border border-brand/30 space-y-6 shadow-panel">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-strong bg-brand/10 px-2 py-0.5 rounded-full border border-brand/20">
                  Read-Only Preview
                </span>
                <h3 className="text-xl font-bold text-foreground mt-1">
                  Projected User Report (Live Preview)
                </h3>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {projectedUserReport?.approvedBy?.name ? `Signed: ${projectedUserReport.approvedBy.name}` : "Draft"}
              </span>
            </div>

            {projectedUserReport ? (
              <div className="space-y-4 text-xs">
                {projectedUserReport.urgentDirective && (
                  <div className="p-3 rounded-xl bg-danger/20 border border-danger/50 text-danger-strong text-xs font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-danger shrink-0" />
                    <span>{projectedUserReport.urgentDirective}</span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-foreground/5 border border-border space-y-1.5">
                  <h4 className="font-bold text-brand text-sm">{projectedUserReport.headline}</h4>
                  <p className="text-soft leading-relaxed">
                    {projectedUserReport.yourSituation?.culturalFraming}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-foreground/5 border border-border space-y-1.5">
                  <h4 className="font-bold text-info uppercase tracking-wider text-[11px]">
                    Plain-Language Explanation
                  </h4>
                  <p className="text-soft leading-relaxed">
                    {projectedUserReport.whatMayBeHappening?.plainLanguage}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-foreground/5 border border-border space-y-2">
                  <h4 className="font-bold text-gold uppercase tracking-wider text-[11px]">
                    Traditional Remedies Evaluation
                  </h4>
                  {projectedUserReport.traditionalRemedies?.map((r: any, idx: number) => (
                    <div key={idx} className="p-2 rounded bg-card border border-border flex justify-between">
                      <div>
                        <span className="font-bold text-foreground">{r.name} ({r.amharic})</span>
                        <p className="text-soft text-[11px]">{r.reason}</p>
                      </div>
                      <span className="font-bold uppercase text-[10px] text-gold">{r.status}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-sunken/80 border border-border text-[10px] text-muted-foreground">
                  <em>No rule matched ≠ safe. Disclaimers verified. Mechanism strings strictly hidden.</em>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Generating live preview projection...</p>
            )}
          </div>
        </div>

        {/* OVERRIDE MODAL */}
        {showOverrideModal && (
          <div className="fixed inset-0 z-50 bg-overlay flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-2xl border border-danger/50 max-w-lg w-full space-y-4">
              <h3 className="text-lg font-bold text-danger flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-danger" />
                Override Authoritative Herb-Drug Safety Gate
              </h3>
              <p className="text-xs text-soft">
                You are overriding a high-severity interaction flag. In accordance with Section 1 of the Work Order, your justification will be stored as an immutable audit event and appended to the patient disclaimer.
              </p>

              <div>
                <label className="block text-xs font-semibold text-soft mb-1">
                  Substantive Clinical Justification (min 15 characters) *
                </label>
                <textarea
                  rows={3}
                  value={overrideJustification}
                  onChange={(e) => setOverrideJustification(e.target.value)}
                  placeholder="e.g. Patient instructed on 4-hour temporal separation and close glycemic self-monitoring under clinic supervision..."
                  className="w-full bg-card border border-border rounded-xl p-3 text-xs text-soft focus:outline-none focus:border-danger"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrideConfirmed}
                  onChange={(e) => setOverrideConfirmed(e.target.checked)}
                  className="mt-0.5 rounded bg-card border-border-strong text-danger focus:ring-danger"
                />
                <span className="text-xs text-soft">
                  I accept clinical responsibility for overriding this botanical-pharmaceutical interaction warning.
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-medium text-soft"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOverrideGate}
                  disabled={overrideJustification.trim().length < 15 || !overrideConfirmed}
                  className="px-4 py-2 rounded-xl bg-danger hover:bg-danger text-danger-foreground text-xs font-bold disabled:opacity-50"
                >
                  Confirm Clinical Override
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RETURN MODAL */}
        {showReturnModal && (
          <div className="fixed inset-0 z-50 bg-overlay flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-2xl border border-border-strong max-w-lg w-full space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-gold" />
                Return Case for Additional Patient Information
              </h3>
              <p className="text-xs text-soft">
                Specify what additional information, symptoms, or dosages are required from the user.
              </p>

              <div>
                <label className="block text-xs font-semibold text-soft mb-1">
                  Explanation Note (min 5 characters) *
                </label>
                <textarea
                  rows={3}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="e.g. Please clarify exact dosage of metformin and how many hours after eating Kosso was consumed."
                  className="w-full bg-card border border-border rounded-xl p-3 text-xs text-soft focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-medium text-soft"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturn}
                  disabled={returnNote.trim().length < 5}
                  className="px-4 py-2 rounded-xl bg-gold-fill hover:bg-gold-fill text-gold-foreground text-xs font-bold disabled:opacity-50"
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
