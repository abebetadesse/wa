"use client";

import { useState } from "react";
import { KNOWN_HERB_DRUG_RULES, checkHerbDrugSafety } from "@/lib/evaluation/stage5SafetyGate";

const HERB_OPTIONS = [
  { name: "Tena Adam", sci: "Ruta chalepensis", amh: "ጤና አዳም", desc: "Traditional digestive tea and Bunna additive rich in furanocoumarins and rutin." },
  { name: "Kosso", sci: "Hagenia abyssinica", amh: "ኮሶ", desc: "Potent traditional antihelmintic flowers containing kosotoxins." },
  { name: "Tikur Azmud", sci: "Nigella sativa", amh: "ጥቁር አዝሙድ", desc: "Black seed rich in thymoquinone; anti-inflammatory and insulin-sensitizing." },
  { name: "Damakesse", sci: "Ocimum lamiifolium", amh: "ዳማከሴ", desc: "Traditional fever, headache, and cold remedy rich in rosmarinic acid." },
  { name: "Feto", sci: "Lepidium sativum", amh: "ፌጦ", desc: "Garden cress seeds used for stomach cramps and postpartum vigor." },
  { name: "Tosign", sci: "Thymus serrulatus", amh: "ጦስኝ", desc: "Highland thyme rich in thymol and carvacrol; pulmonary and digestive tea." },
];

const MED_OPTIONS = [
  { name: "Warfarin", drugClass: "Anticoagulants / Antiplatelets" },
  { name: "Aspirin", drugClass: "Anticoagulants / Antiplatelets" },
  { name: "Metformin", drugClass: "Hypoglycemics" },
  { name: "Lisinopril", drugClass: "Antihypertensives" },
  { name: "Furosemide (Lasix)", drugClass: "Diuretics" },
  { name: "None (Welbeingy individual)", drugClass: "None" },
];

export default function SafetyExperience() {
  const [selectedHerb, setSelectedHerb] = useState(HERB_OPTIONS[0]);
  const [selectedMed, setSelectedMed] = useState(MED_OPTIONS[0]);

  const medsToPass = selectedMed.drugClass === "None" ? [] : [selectedMed];
  const safetyResult = checkHerbDrugSafety(selectedHerb.name, medsToPass);

  return (
    <div className="py-10">
      <div className="app-container">
        <div className="max-w-3xl mb-10">
          <div className="badge badge-flagged mb-3">ETM-DB Safety Matrix</div>
          <h1 className="text-3xl font-extrabold text-white mb-3">
            Traditional Ethiopian Herb-Drug Safety Explorer
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            The safety gate is a non-negotiable architectural guardrail. Traditional Ethiopian medicinal remedies contain active phytochemicals that can dangerously amplify or counteract modern pharmaceuticals. Test combinations below to observe the deterministic safety gate in action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          <div className="md:col-span-4 glass-panel p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
              1. Select Traditional Herb
            </h3>
            <div className="space-y-3">
              {HERB_OPTIONS.map((h) => (
                <div
                  key={h.name}
                  onClick={() => setSelectedHerb(h)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${selectedHerb.name === h.name
                    ? "bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-950/30"
                    : "bg-black/30 border-white/5 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{h.name}</span>
                    <span className="text-xs text-amber-400 font-medium">{h.amh}</span>
                  </div>
                  <div className="text-xs italic text-slate-400 mb-1">{h.sci}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 glass-panel p-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
              2. Select Active Pharmaceutical
            </h3>
            <div className="space-y-3">
              {MED_OPTIONS.map((m) => (
                <div
                  key={m.name}
                  onClick={() => setSelectedMed(m)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${selectedMed.name === m.name
                    ? "bg-rose-950/40 border-rose-500/50 shadow-md shadow-rose-950/30"
                    : "bg-black/30 border-white/5 hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{m.name}</span>
                    <span className="badge badge-high text-[10px]">{m.drugClass}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col">
            <div
              className={`glass-panel p-6 flex-grow flex flex-col justify-between border-2 ${safetyResult.status === "flagged"
                ? "border-rose-500/60 bg-rose-950/15"
                : "border-emerald-500/60 bg-emerald-950/15"
                }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Safety Gate Decision
                  </span>
                  <span
                    className={`badge ${safetyResult.status === "flagged" ? "badge-flagged" : "badge-safe"
                      }`}
                  >
                    {safetyResult.status === "flagged" ? "BLOCKED / CULLED" : "PASSED SAFETY GATE"}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white mb-2">
                  {safetyResult.status === "flagged"
                    ? "⛔ Strict Contraindication Detected"
                    : "✅ Zero Interacting Conflict"}
                </h3>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  {safetyResult.status === "flagged"
                    ? `The algorithm flags ${selectedHerb.name} due to adverse pharmacological interaction with ${selectedMed.name} (${selectedMed.drugClass}). This remedy is NEVER shown to the client.`
                    : `No documented high-severity Debral contraindication exists between ${selectedHerb.name} and ${selectedMed.name}. The remedy is safe to surface.`}
                </p>

                {safetyResult.status === "flagged" && (
                  <div className="space-y-3 pt-3 border-t border-rose-500/20 text-xs">
                    <div>
                      <span className="text-rose-400 font-semibold block mb-0.5">Biochemical Mechanism:</span>
                      <p className="text-slate-300">{safetyResult.mechanism}</p>
                    </div>

                    <div>
                      <span className="text-rose-400 font-semibold block mb-0.5">Debral Adverse Effect:</span>
                      <p className="text-slate-300">{safetyResult.DebralEffect}</p>
                    </div>

                    <div className="pt-2 border-t border-rose-500/20 text-[10px] font-mono text-slate-400">
                      Lineage Evidence: {safetyResult.sourceRef}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-400">
                <strong>Safety Gate Rule:</strong> High-severity flagged interactions are treated as release-blocking canaries in automated CI/CD suites.
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Full ETM-DB Safety Interaction Matrix</h2>
              <p className="text-xs text-slate-400">
                Official reference dataset maintained and signed off by the Medical Advisory Board
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 uppercase font-mono text-[10px] text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-3">Traditional Herb</th>
                  <th className="p-3">Scientific Name</th>
                  <th className="p-3">Target Drug Class</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Biochemical Mechanism</th>
                  <th className="p-3">Source Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {KNOWN_HERB_DRUG_RULES.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-white">{rule.herbName}</td>
                    <td className="p-3 italic text-slate-400">{rule.scientificName}</td>
                    <td className="p-3 text-rose-300 font-medium">{rule.targetDrugClass}</td>
                    <td className="p-3">
                      <span className={`badge ${rule.interactionSeverity === "high" ? "badge-high" : "badge-moderate"}`}>
                        {rule.interactionSeverity}
                      </span>
                    </td>
                    <td className="p-3 max-w-md leading-relaxed">{rule.mechanism}</td>
                    <td className="p-3 font-mono text-[10px] text-emerald-400">{rule.sourceRef}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
