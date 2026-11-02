"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { withBasePath } from '@/lib/base-path';

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
  const [emergencyAcknowledged, setEmergencyAcknowledged] = useState(false);
  const [publicationChecks, setPublicationChecks] = useState({
    safetyReviewed: false,
    consentReviewed: false,
    languageReviewed: false,
    evidenceReviewed: false,
  });
  const [notificationMethod, setNotificationMethod] = useState<"in-app" | "email" | "sms" | "phone">("in-app");
  const [resourcesShared, setResourcesShared] = useState("Local emergency services");
  const [userNotifiedAt, setUserNotifiedAt] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  });

  const loadData = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setActionError(null);

    try {
      // 1. Load case details
      const caseRes = await fetch(withBasePath(`/api/cases/${caseId}`), {
      });
      const caseJson = await caseRes.json();
      if (!caseJson.success) throw new Error(caseJson.error || "Failed to load case");
      setCaseRecord(caseJson.data);

      // 2. Load audit events
      const eventsRes = await fetch(withBasePath(`/api/cases/${caseId}/events`), {
      });
      const eventsJson = await eventsRes.json();
      if (eventsJson.success) {
        setEvents(eventsJson.data);
      }

      // 3. Load professional report
      const proRes = await fetch(withBasePath(`/api/cases/${caseId}/report/pro`), {
      });
      const proJson = await proRes.json();
      if (proJson.success) setProReport(proJson.data);

      // 4. Load user report
      const userRes = await fetch(withBasePath(`/api/cases/${caseId}/report/user`), {
      });
      const userJson = await userRes.json();
      if (userJson.success) setUserReport(userJson.data);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Publish
  const handlePublish = async () => {
    setActionError(null);
    try {
      const res = await fetch(withBasePath(`/api/cases/${caseId}/publish`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qualityChecklist: publicationChecks }),
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
      const res = await fetch(withBasePath(`/api/cases/${caseId}/return`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: returnNote,
          ...(caseRecord?.emergencyDetected ? {
            emergencyAck: {
              userNotifiedAt: new Date(userNotifiedAt).toISOString(),
              notificationMethod,
              resourcesShared: resourcesShared.split(",").map((resource: string) => resource.trim()).filter(Boolean),
            },
          } : {}),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Return failed");

      setShowReturnModal(false);
      setEmergencyAcknowledged(false);
      setActionSuccess("Case returned to professional for revision.");
      loadData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-12 text-center text-sm">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-plum" />
        Loading administrative inspection console...
      </div>
    );
  }

  const isPublished = caseRecord?.status === CaseStatus.PUBLISHED;
  const publicationChecksComplete = Object.values(publicationChecks).every(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Link
            href="/admin/cases"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Queue
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReturnModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border text-xs font-medium text-soft transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Return to Professional
            </button>

            {!isPublished ? (
              <button
                onClick={handlePublish}
                disabled={!publicationChecksComplete}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-plum to-info hover:from-plum hover:to-info text-plum-foreground text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Approve & Publish to Patient
              </button>
            ) : (
              <span className="px-3.5 py-1.5 rounded-xl bg-brand/20 text-brand-strong border border-brand/40 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Published
              </span>
            )}
          </div>
        </div>

        {/* Action Feedback */}
        {actionError && (
          <div className="p-4 rounded-xl bg-danger/15 border border-danger/40 text-danger-strong text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-danger mt-0.5" />
            <div>
              <p className="font-semibold">Publication Failed</p>
              <p>{actionError}</p>
            </div>
          </div>
        )}

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-brand/15 border border-brand/40 text-brand-strong text-sm flex items-start gap-3">
            <CheckCircle className="w-5 h-5 shrink-0 text-brand mt-0.5" />
            <div>
              <p className="font-semibold">Action Successful</p>
              <p>{actionSuccess}</p>
            </div>
          </div>
        )}

        {!isPublished && (
          <section className="glass-panel rounded-2xl border border-gold/30 p-5" aria-labelledby="publication-quality-heading">
            <h3 id="publication-quality-heading" className="text-sm font-bold text-gold-strong">Report quality checklist</h3>
            <p className="mt-1 text-xs text-muted-foreground">Confirm each item before publishing. These acknowledgements are recorded in the case audit trail.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([
                ["safetyReviewed", "I reviewed the safety gate, urgent guidance, and avoid/caution items."],
                ["consentReviewed", "I verified the case consent and any opt-in cultural or spiritual content."],
                ["languageReviewed", "I checked that the report is clear, respectful, and in a language the user can understand."],
                ["evidenceReviewed", "I reviewed the supporting sources and noted any evidence limitations."],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-start gap-2 rounded-lg border border-border bg-card/60 p-3 text-sm text-soft">
                  <input
                    type="checkbox"
                    checked={publicationChecks[key]}
                    onChange={(event) => setPublicationChecks((checks) => ({ ...checks, [key]: event.target.checked }))}
                    className="mt-0.5 size-4 accent-gold"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Timeline */}
        {caseRecord && (
          <StatusTimeline
            currentStatus={caseRecord.status}
            hasOverride={Boolean(caseRecord.overrideJustification)}
          />
        )}

        {/* AUDIT TRAIL VIEWER (§11, §15) */}
        <div className="glass-panel p-6 rounded-2xl border border-plum/30 space-y-4 shadow-panel">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-plum flex items-center gap-2">
              <History className="w-4 h-4" />
              Immutable Case Lifecycle Audit Trail ({events.length} Events)
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">Append-Only Event Store</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-2">
            {events.map((evt, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-card border border-border text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-plum font-bold uppercase">{evt.type}</span>
                    <span className="text-subtle">•</span>
                    <span className="text-soft font-semibold">Actor: {evt.actorId} ({evt.actorRole})</span>
                  </div>
                  <p className="text-soft text-[11px]">{evt.note || "No custom note provided."}</p>
                </div>
                <span className="text-[10px] text-subtle font-mono shrink-0">
                  {new Date(evt.at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dual Report Preview Inspection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Professional View */}
          <div className="glass-panel p-5 rounded-2xl border border-border space-y-3">
            <h4 className="font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              Professional Report Payload
            </h4>
            <div className="p-3 rounded-xl bg-card border border-border space-y-2 text-soft">
              <p><strong>Illness Model:</strong> {proReport?.culturalAnalysis?.illnessModel}</p>
              <p><strong>Differential:</strong> {proReport?.differentialConsiderations?.map((d: any) => d.condition).join(", ")}</p>
              <p><strong>CYP Pathways:</strong> {proReport?.pharmacology?.cypPathways?.join(", ") || "None"}</p>
              <p><strong>Separation:</strong> {proReport?.pharmacology?.separationAdvice}</p>
            </div>
          </div>

          {/* User Report View */}
          <div className="glass-panel p-5 rounded-2xl border border-border space-y-3">
            <h4 className="font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              User-Facing Report Payload (Published or Pending)
            </h4>
            <div className="p-3 rounded-xl bg-card border border-border space-y-2 text-soft">
              <p><strong>Headline:</strong> {userReport?.headline}</p>
              <p><strong>Plain Language:</strong> {userReport?.whatMayBeHappening?.plainLanguage}</p>
              <p><strong>Emphasized Foods:</strong> {userReport?.foodAndNutrition?.localFoodsToEmphasize?.join(", ")}</p>
              <p><strong>Remedies Checked:</strong> {userReport?.traditionalRemedies?.map((r: any) => `${r.name}: ${r.status}`).join("; ")}</p>
            </div>
          </div>
        </div>

        {/* RETURN MODAL */}
        {showReturnModal && (
          <div className="fixed inset-0 z-50 bg-overlay flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-2xl border border-border-strong max-w-lg w-full space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-plum" />
                Return Case to Professional for Revision
              </h3>
              <p className="text-xs text-soft">
                Specify what changes, clarifications, or risk reassessments are required before publication can be approved.
              </p>

              {caseRecord?.emergencyDetected && (
                <section className="space-y-3 rounded-lg border border-danger/40 bg-danger-soft p-4" aria-labelledby="emergency-return-heading">
                  <h4 id="emergency-return-heading" className="text-sm font-semibold text-danger-strong">Emergency follow-up required</h4>
                  <p className="text-xs leading-relaxed text-danger-strong">
                    Signals recorded: {(caseRecord.emergencySignals || []).join(", ") || "Emergency signal"}. Record how the user was notified and the emergency resources shared before returning this case.
                  </p>
                  <label className="block space-y-1 text-xs text-soft">
                    User notified at
                    <input type="datetime-local" value={userNotifiedAt} onChange={(event) => setUserNotifiedAt(event.target.value)} className="input-warm w-full" />
                  </label>
                  <label className="block space-y-1 text-xs text-soft">
                    Notification method
                    <select value={notificationMethod} onChange={(event) => setNotificationMethod(event.target.value as typeof notificationMethod)} className="input-warm w-full">
                      <option value="in-app">In-app</option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="phone">Phone</option>
                    </select>
                  </label>
                  <label className="block space-y-1 text-xs text-soft">
                    Emergency resources shared (comma-separated)
                    <input value={resourcesShared} onChange={(event) => setResourcesShared(event.target.value)} className="input-warm w-full" />
                  </label>
                  <label className="flex items-start gap-2 text-xs text-danger-strong">
                    <input type="checkbox" checked={emergencyAcknowledged} onChange={(event) => setEmergencyAcknowledged(event.target.checked)} className="mt-0.5" />
                    I confirm the user was notified and the resources above were shared.
                  </label>
                </section>
              )}

              <div>
                <label className="block text-xs font-semibold text-soft mb-1">
                  Revision Directive (min 5 characters) *
                </label>
                <textarea
                  rows={3}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="e.g. Please clarify if the dietary recommendations account for local fasting seasonality..."
                  className="w-full bg-card border border-border rounded-xl p-3 text-xs text-soft focus:outline-none focus:border-plum"
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
                  onClick={handleReturnToPro}
                  disabled={returnNote.trim().length < 5 || (Boolean(caseRecord?.emergencyDetected) && (!emergencyAcknowledged || !resourcesShared.trim()))}
                  className="px-4 py-2 rounded-xl bg-plum hover:bg-plum text-plum-foreground text-xs font-bold disabled:opacity-50"
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
