"use client";

import React, { useState } from "react";

interface ScientificEncounterProps {
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

export default function ScientificEncounterModal({
  reportId,
  userName,
  userAge,
  userGender,
  userRegion,
  userAltitude,
  gaps,
  modelVersion,
  generatedAt,
}: ScientificEncounterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
        <span>📄</span> Export Scientific Encounter Summary (EHR / MD)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl glass-panel p-8 border border-[var(--border-strong)] my-8">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border print:hidden">
              <span className="badge badge-safe">Scientific Decision Support Encounter</span>
              <div className="flex items-center gap-3">
                <button onClick={handlePrint} className="btn-primary text-xs py-1.5 px-4">
                  🖨️ Print / Save as PDF
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded bg-foreground/5"
                >
                  Close &times;
                </button>
              </div>
            </div>

            {/* Printable Content Document */}
            <div className="text-soft text-xs space-y-6">
              {/* Document Header */}
              <div className="border-b border-border-strong pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">
                      Ethiopian Wisdom Platform — Scientific Referral Summary
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Standardized Encounter Documentation &bull; Version {modelVersion}
                    </p>
                  </div>
                  <div className="text-right text-[10px] font-mono text-muted-foreground">
                    <div>Encounter ID: {reportId.slice(0, 16)}</div>
                    <div>Date: {new Date(generatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Patient Demographics & Physiology */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-foreground/[0.02] border border-border">
                <div>
                  <span className="text-muted-foreground text-[10px] block">PATIENT NAME</span>
                  <span className="font-bold text-foreground text-sm">{userName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">AGE / GENDER</span>
                  <span className="font-bold text-foreground text-sm">
                    {userAge} yo / {userGender}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">RESIDENCE / ALTITUDE</span>
                  <span className="font-bold text-brand text-sm">
                    {userRegion} ({userAltitude}m)
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">PHYSIOLOGY TARGET FACTOR</span>
                  <span className="font-bold text-gold text-sm">
                    {userAltitude >= 2000 ? "+15-25% Highland Iron" : "Sea Level Baseline"}
                  </span>
                </div>
              </div>

              {/* Evaluated Gaps & Scientific Diagnostic Codes */}
              <div>
                <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">
                  1. Biochemical Nutrient Deficit Screening (EFCT 2025)
                </h3>
                <table className="w-full text-left text-xs border border-border">
                  <thead className="bg-foreground/5 font-mono text-[10px] text-muted-foreground">
                    <tr>
                      <th className="p-2 border-b border-border">Nutrient</th>
                      <th className="p-2 border-b border-border">ICD-10 Adjacent Code</th>
                      <th className="p-2 border-b border-border">Est. Daily Intake</th>
                      <th className="p-2 border-b border-border">Altitude Target</th>
                      <th className="p-2 border-b border-border">Severity Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {gaps.map((g, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-semibold text-foreground">{g.nutrientName}</td>
                        <td className="p-2 font-mono text-muted-foreground">
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
              <div className="p-4 rounded-lg bg-brand-soft border border-brand/30">
                <h3 className="font-bold text-brand text-xs uppercase tracking-wider mb-2">
                  2. Physician Laboratory Order Recommendations
                </h3>
                <ul className="list-disc list-inside space-y-1 text-soft">
                  <li><strong>Complete Blood Count (CBC) with Peripheral Smear:</strong> Evaluate MCV, MCH, and RDW.</li>
                  <li><strong>Iron Kinetic Panel:</strong> Serum Ferritin, Serum Iron, Total Iron Binding Capacity (TIBC), and Transferrin Saturation.</li>
                  <li><strong>Cobalamin Biomarkers:</strong> Serum Vitamin B12, Methylmalonic Acid (MMA), and Homocysteine levels (especially indicated under Metformin therapy).</li>
                  <li><strong>Metabolic &amp; Electrolyte Panel:</strong> Serum Calcium, 25-OH Vitamin D, and serum Creatinine/eGFR.</li>
                </ul>
              </div>

              {/* Herb-Drug Interaction Clearance Attestation */}
              <div className="p-4 rounded-lg bg-sunken/80 border border-border">
                <h3 className="font-bold text-gold text-xs uppercase tracking-wider mb-1">
                  3. Traditional Medicine Safety Gate Clearance Attestation
                </h3>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  All traditional Ethiopian remedies recommended to the patient have undergone algorithmic verification against their active prescription pharmaceuticals. Interacting remedies posing bleeding or metabolic risks were culled prior to surfacing.
                </p>
              </div>

              {/* Attestation Signature Box */}
              <div className="pt-4 border-t border-border flex justify-between items-end text-[10px] text-subtle">
                <div>
                  <div>Evaluating System: Engine v3.0 (Deterministic Stage 1-5 + ETM-DB)</div>
                  <div>Traceability Reference: EFCT2025-EVAL-THR &bull; WHO-ALT-2024</div>
                </div>
                <div className="text-right">
                  <div className="w-48 border-b border-border-strong mb-1"></div>
                  <div>Reviewing Practitioner / Registered Dietitian Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
