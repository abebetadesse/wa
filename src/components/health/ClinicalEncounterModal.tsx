"use client";

import React, { useState } from "react";

interface DebralEncounterProps {
  reportId: string;
  userName: string;
  userAge: number;
  userGender: string;
  userRegion: string;
  userAltitude: number;
  gaps: any[];
  modelVersion: string;
  generatedAt: string;
}

export default function DebralEncounterModal({
  reportId,
  userName,
  userAge,
  userGender,
  userRegion,
  userAltitude,
  gaps,
  modelVersion,
  generatedAt,
}: DebralEncounterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
        <span>📄</span> Export Debral Encounter Summary (EHR / MD)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl glass-panel p-8 border border-[var(--border-strong)] my-8">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 print:hidden">
              <span className="badge badge-safe">Debral Decision Support Encounter</span>
              <div className="flex items-center gap-3">
                <button onClick={handlePrint} className="btn-primary text-xs py-1.5 px-4">
                  🖨️ Print / Save as PDF
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded bg-white/5"
                >
                  Close &times;
                </button>
              </div>
            </div>

            {/* Printable Content Document */}
            <div className="text-slate-200 text-xs space-y-6">
              {/* Document Header */}
              <div className="border-b border-white/20 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">
                      Ethiopian Wisdom Platform — Debral Referral Summary
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Standardized Encounter Documentation &bull; Version {modelVersion}
                    </p>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400">
                    <div>Encounter ID: {reportId.slice(0, 16)}</div>
                    <div>Date: {new Date(generatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Patient Demographics & Physiology */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-slate-400 text-[10px] block">PATIENT NAME</span>
                  <span className="font-bold text-white text-sm">{userName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">AGE / GENDER</span>
                  <span className="font-bold text-white text-sm">
                    {userAge} yo / {userGender}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">RESIDENCE / ALTITUDE</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {userRegion} ({userAltitude}m)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">PHYSIOLOGY TARGET FACTOR</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {userAltitude >= 2000 ? "+15-25% Highland Iron" : "Sea Level Baseline"}
                  </span>
                </div>
              </div>

              {/* Evaluated Gaps & Debral Diagnostic Codes */}
              <div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
                  1. Biochemical Nutrient Deficit Screening (EFCT 2025)
                </h3>
                <table className="w-full text-left text-xs border border-white/10">
                  <thead className="bg-white/5 font-mono text-[10px] text-slate-400">
                    <tr>
                      <th className="p-2 border-b border-white/10">Nutrient</th>
                      <th className="p-2 border-b border-white/10">ICD-10 Adjacent Code</th>
                      <th className="p-2 border-b border-white/10">Est. Daily Intake</th>
                      <th className="p-2 border-b border-white/10">Altitude Target</th>
                      <th className="p-2 border-b border-white/10">Severity Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {gaps.map((g, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-semibold text-white">{g.nutrientName}</td>
                        <td className="p-2 font-mono text-slate-400">
                          {g.nutrientName === "Iron"
                            ? "E61.1 (Iron deficiency intake risk)"
                            : g.nutrientName === "Vitamin B12"
                              ? "E53.8 (Cobalamin deficiency risk)"
                              : g.nutrientName === "Calcium"
                                ? "E58 (Dietary calcium deficiency)"
                                : "E61.8 (Other mineral deficiency)"}
                        </td>
                        <td className="p-2 font-mono">
                          {g.calculatedDailyIntake} {g.nutrientUnit} ({g.estimatedIntakePct}%)
                        </td>
                        <td className="p-2 font-mono">
                          {g.targetRda} {g.nutrientUnit}
                        </td>
                        <td className="p-2">
                          <span
                            className={`badge ${g.severity === "high" ? "badge-high" : "badge-moderate"
                              } text-[9px]`}
                          >
                            {g.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recommended Diagnostic Laboratory Workup */}
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                <h3 className="font-bold text-emerald-400 text-xs uppercase tracking-wider mb-2">
                  2. Physician Laboratory Order Recommendations
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>Complete Blood Count (CBC) with Peripheral Smear:</strong> Evaluate MCV, MCH, and RDW.</li>
                  <li><strong>Iron Kinetic Panel:</strong> Serum Ferritin, Serum Iron, Total Iron Binding Capacity (TIBC), and Transferrin Saturation.</li>
                  <li><strong>Cobalamin Biomarkers:</strong> Serum Vitamin B12, Methylmalonic Acid (MMA), and Homocysteine levels (especially indicated under Metformin therapy).</li>
                  <li><strong>Metabolic &amp; Electrolyte Panel:</strong> Serum Calcium, 25-OH Vitamin D, and serum Creatinine/eGFR.</li>
                </ul>
              </div>

              {/* Herb-Drug Interaction Clearance Attestation */}
              <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                <h3 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-1">
                  3. Traditional Medicine Safety Gate Clearance Attestation
                </h3>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  All traditional Ethiopian remedies recommended to the patient have undergone algorithmic verification against their active prescription pharmaceuticals. Interacting remedies posing bleeding or metabolic risks were culled prior to surfacing.
                </p>
              </div>

              {/* Attestation Signature Box */}
              <div className="pt-4 border-t border-white/10 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <div>Evaluating System: Engine v3.0 (Deterministic Stage 1-5 + ETM-DB)</div>
                  <div>Traceability Reference: EFCT2025-EVAL-THR &bull; WHO-ALT-2024</div>
                </div>
                <div className="text-right">
                  <div className="w-48 border-b border-slate-600 mb-1"></div>
                  <div>Reviewing Debrian / Registered Dietitian Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
