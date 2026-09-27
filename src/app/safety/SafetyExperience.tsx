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
  { name: "None (healthy individual)", drugClass: "None" },
];

export default function SafetyExperience() {
  const [selectedHerb, setSelectedHerb] = useState(HERB_OPTIONS[0]);
  const [selectedMed, setSelectedMed] = useState(MED_OPTIONS[0]);

  const medsToPass = selectedMed.drugClass === "None" ? [] : [selectedMed];
  const safetyResult = checkHerbDrugSafety(selectedHerb.name, medsToPass);
  const selectedInteraction = KNOWN_HERB_DRUG_RULES.find(
    (rule) => rule.herbName === selectedHerb.name && rule.targetDrugClass === selectedMed.drugClass,
  );
  const isFlagged = safetyResult.status === "flagged";
  const isCaution = !isFlagged && selectedInteraction !== undefined;
  const herbProfiles = HERB_OPTIONS.map((herb) => ({
    ...herb,
    interactions: KNOWN_HERB_DRUG_RULES.filter((rule) => rule.herbName === herb.name),
  }));

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
              className={`glass-panel p-6 flex-grow flex flex-col justify-between border-2 ${isFlagged
                ? "border-rose-500/60 bg-rose-950/15"
                : isCaution
                  ? "border-amber-500/60 bg-amber-950/15"
                  : "border-white/20 bg-slate-950/15"
                }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Safety Gate Decision
                  </span>
                  <span
                    className={`badge ${isFlagged ? "badge-flagged" : isCaution ? "bg-amber-950/40 text-amber-200 border border-amber-500/30" : "bg-slate-800 text-slate-300 border border-slate-600"
                      }`}
                  >
                    {isFlagged ? "BLOCKED / CULLED" : isCaution ? "CAUTION: REVIEW" : "NO RULE MATCHED"}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white mb-2">
                  {isFlagged
                    ? "⛔ Strict Contraindication Detected"
                    : isCaution
                      ? "A moderate interaction is listed"
                      : "No interaction is listed for this combination"}
                </h3>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  {isFlagged
                    ? `The algorithm flags ${selectedHerb.name} due to adverse pharmacological interaction with ${selectedMed.name} (${selectedMed.drugClass}). This remedy is NEVER shown to the client.`
                    : isCaution
                      ? `The current reference lists a moderate interaction between ${selectedHerb.name} and ${selectedMed.name} (${selectedMed.drugClass}). Discuss this combination with a qualified clinician or pharmacist.`
                      : `The current reference contains no matching rule for ${selectedHerb.name} and ${selectedMed.name}. This limited check cannot establish that the combination is safe.`}
                </p>

                {selectedInteraction && (
                  <div className={`space-y-3 pt-3 border-t text-xs ${isFlagged ? "border-rose-500/20" : "border-amber-500/20"}`}>
                    <div>
                      <span className={`font-semibold block mb-0.5 ${isFlagged ? "text-rose-400" : "text-amber-300"}`}>Biochemical Mechanism:</span>
                      <p className="text-slate-300">{selectedInteraction.mechanism}</p>
                    </div>

                    <div>
                      <span className={`font-semibold block mb-0.5 ${isFlagged ? "text-rose-400" : "text-amber-300"}`}>Potential adverse effect:</span>
                      <p className="text-slate-300">{selectedInteraction.physiologicalEffect}</p>
                    </div>

                    <div className={`pt-2 border-t text-[10px] font-mono text-slate-400 ${isFlagged ? "border-rose-500/20" : "border-amber-500/20"}`}>
                      Reference: {selectedInteraction.sourceRef}
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

        <section className="mb-16" aria-labelledby="herb-profiles-heading">
          <div className="mb-6 max-w-3xl">
            <h2 id="herb-profiles-heading" className="text-xl font-bold text-white">
              Herb-by-herb safety details
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Expand a profile to review its plant identity, traditional context, and every interaction currently recorded in this reference. A profile with no listed interaction has not been proven safe.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {herbProfiles.map((herb) => (
              <details
                key={herb.name}
                open={selectedHerb.name === herb.name}
                className="glass-panel p-5"
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white">{herb.name}</h3>
                      <p className="mt-1 text-xs text-amber-300">{herb.amh}</p>
                      <p className="mt-1 text-xs italic text-slate-400">{herb.sci}</p>
                    </div>
                    <span className="badge border border-slate-600 bg-slate-800 text-[10px] text-slate-300">
                      {herb.interactions.length} listed {herb.interactions.length === 1 ? "interaction" : "interactions"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-300">{herb.desc}</p>
                  <span className="mt-3 inline-block text-[11px] font-semibold text-emerald-300">
                    Expand safety details
                  </span>
                </summary>

                <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                  {herb.interactions.length > 0 ? (
                    herb.interactions.map((rule) => (
                      <article key={rule.sourceRef} className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-white">{rule.targetDrugClass}</h4>
                          <span className={`badge ${rule.interactionSeverity === "high" ? "badge-high" : "badge-moderate"}`}>
                            {rule.interactionSeverity} severity
                          </span>
                        </div>
                        <dl className="mt-3 space-y-3 text-xs leading-relaxed">
                          <div>
                            <dt className="font-semibold text-slate-200">Mechanism recorded</dt>
                            <dd className="mt-1 text-slate-400">{rule.mechanism}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-slate-200">Potential effect recorded</dt>
                            <dd className="mt-1 text-slate-400">{rule.physiologicalEffect}</dd>
                          </div>
                        </dl>
                        <p className="mt-3 font-mono text-[10px] text-emerald-300">
                          Reference: {rule.sourceRef}
                          {rule.contraindicated ? " · Contraindicated by this rule" : ""}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-xs leading-relaxed text-slate-400">
                      No herb-drug interaction is currently recorded for this plant in the displayed reference. This is a data gap, not a safety clearance; consult a qualified clinician or pharmacist before combining traditional remedies with medicines.
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>

        <div className="glass-panel p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Full ETM-DB Safety Interaction Matrix</h2>
              <p className="text-xs text-slate-400">
                Interaction rules currently included in this app reference. Absence of a rule does not establish safety.
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
                  <th className="p-3">Potential Effect</th>
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
                    <td className="p-3 max-w-md leading-relaxed">{rule.physiologicalEffect}</td>
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
