"use client";

import { useState } from "react";
import {
  TongueColor,
  TongueCoating,
  TongueShape,
  TongueMoisture,
  TongueDiagnosisResult,
  PulseQuality,
  PulseDiagnosisResult,
} from "@/lib/Welbeing/WelbeingTypes";
import { analyzeTongue, analyzePulse } from "@/lib/Welbeing/tcmDiagnosisEngine";

type DiagMode = "tongue" | "pulse";

const URGENCY_STYLES = {
  normal: { border: "border-emerald-500/40", bg: "bg-emerald-950/20", badge: "bg-emerald-600 text-white", icon: "✓" },
  monitor: { border: "border-amber-500/40", bg: "bg-amber-950/20", badge: "bg-amber-500 text-black font-bold", icon: "◉" },
  consult: { border: "border-rose-500/60", bg: "bg-rose-950/20", badge: "bg-rose-600 text-white animate-pulse", icon: "⚕" },
};

export default function TCMDiagnosticView() {
  const [mode, setMode] = useState<DiagMode>("tongue");

  // Tongue state
  const [tongueColor, setTongueColor] = useState<TongueColor>("pink");
  const [tongueCoating, setTongueCoating] = useState<TongueCoating>("thin_white");
  const [tongueShape, setTongueShape] = useState<TongueShape>("normal");
  const [tongueMoisture, setTongueMoisture] = useState<TongueMoisture>("moist");
  const [tongueResult, setTongueResult] = useState<TongueDiagnosisResult | null>(null);

  // Pulse state
  const [pulseQuality, setPulseQuality] = useState<PulseQuality>("moderate");
  const [heartRate, setHeartRate] = useState(72);
  const [pulseResult, setPulseResult] = useState<PulseDiagnosisResult | null>(null);

  const runTongueAnalysis = () => {
    setTongueResult(analyzeTongue(tongueColor, tongueCoating, tongueShape, tongueMoisture));
  };

  const runPulseAnalysis = () => {
    setPulseResult(analyzePulse(pulseQuality, heartRate));
  };

  const urgency = tongueResult?.urgencyFlag || "normal";
  const styles = URGENCY_STYLES[urgency];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="badge badge-safe mb-2">Huazhen TCM · Visual Diagnosis</div>
          <h2 className="text-xl font-bold text-white">AI-Guided TCM & Ethiopian Humoral Assessment</h2>
          <p className="text-xs text-slate-400 mt-1">
            Self-reported tongue and pulse analysis cross-mapped with Ethiopian humoral medicine. Not a Debral diagnosis.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("tongue")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${mode === "tongue" ? "bg-amber-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
          >
            👅 Tongue
          </button>
          <button
            onClick={() => setMode("pulse")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${mode === "pulse" ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
          >
            💓 Pulse
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-5">
          {mode === "tongue" ? (
            <>
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="text-2xl">👅</span> Tongue Observation
              </h3>

              {/* Visual tongue guide */}
              <div className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-b from-rose-950/60 to-red-900/40 border border-rose-500/20 flex items-center justify-center">
                <div
                  className="w-24 h-16 rounded-full transition-all duration-500 shadow-lg"
                  style={{
                    backgroundColor:
                      tongueColor === "pale" ? "#f8b4b4" :
                        tongueColor === "pink" ? "#f472b6" :
                          tongueColor === "red" ? "#ef4444" :
                            tongueColor === "deep_red" ? "#991b1b" :
                              tongueColor === "purple" ? "#7c3aed" :
                                "#6b21a8",
                    filter: tongueMoisture === "dry" ? "brightness(0.85)" : "brightness(1)",
                    transform: tongueShape === "swollen" ? "scaleX(1.2) scaleY(1.1)" : tongueShape === "thin_narrow" ? "scaleX(0.8)" : "scale(1)",
                  }}
                >
                  {tongueCoating !== "none" && (
                    <div
                      className="w-full h-full rounded-full opacity-60"
                      style={{
                        backgroundColor:
                          tongueCoating.includes("white") ? "rgba(255,255,255,0.6)" :
                            tongueCoating.includes("yellow") ? "rgba(255,255,100,0.5)" :
                              "rgba(80,80,80,0.5)",
                      }}
                    />
                  )}
                </div>
                <p className="absolute bottom-2 text-[10px] text-rose-300/70 font-mono">Live preview</p>
              </div>

              {[
                {
                  label: "Color", value: tongueColor, onChange: setTongueColor,
                  options: [
                    { value: "pale", label: "Pale" }, { value: "pink", label: "Pink (normal)" },
                    { value: "red", label: "Red" }, { value: "deep_red", label: "Deep Red" },
                    { value: "purple", label: "Purple" }, { value: "bluish_purple", label: "Bluish-Purple" },
                  ],
                },
                {
                  label: "Coating", value: tongueCoating, onChange: setTongueCoating,
                  options: [
                    { value: "none", label: "None (bare)" }, { value: "thin_white", label: "Thin White (normal)" },
                    { value: "thick_white", label: "Thick White" }, { value: "thin_yellow", label: "Thin Yellow" },
                    { value: "thick_yellow", label: "Thick Yellow" }, { value: "gray_black", label: "Gray/Black" },
                    { value: "greasy_white", label: "Greasy White" }, { value: "greasy_yellow", label: "Greasy Yellow" },
                  ],
                },
                {
                  label: "Shape", value: tongueShape, onChange: setTongueShape,
                  options: [
                    { value: "normal", label: "Normal" }, { value: "swollen", label: "Swollen / Puffy" },
                    { value: "thin_narrow", label: "Thin / Narrow" }, { value: "cracked", label: "Cracked" },
                    { value: "scalloped", label: "Scalloped edges" }, { value: "deviated", label: "Deviated to side" },
                  ],
                },
                {
                  label: "Moisture", value: tongueMoisture, onChange: setTongueMoisture,
                  options: [
                    { value: "dry", label: "Dry" }, { value: "moist", label: "Moist (normal)" },
                    { value: "wet", label: "Wet" }, { value: "slippery", label: "Slippery" },
                  ],
                },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">{field.label}</label>
                  <select
                    value={field.value}
                    onChange={(e) => (field.onChange as (v: string) => void)(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-amber-500"
                  >
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}

              <button
                onClick={runTongueAnalysis}
                className="w-full btn-primary py-3 font-bold text-sm"
              >
                🔍 Analyze Tongue Pattern
              </button>
            </>
          ) : (
            <>
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="text-2xl">💓</span> Pulse Self-Assessment
              </h3>

              <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-slate-300 leading-relaxed">
                <strong className="text-violet-300 block mb-1">How to assess your pulse:</strong>
                Place 3 fingers lightly on your opposite wrist, just below the thumb. Feel the rhythm and quality.
                Count beats for 15 seconds × 4 to get heart rate.
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  min={40} max={120}
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-violet-500"
                />
                <div className="flex items-center mt-2 gap-2">
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-rose-500 transition-all"
                    style={{ width: `${Math.min(100, (heartRate / 120) * 100)}%`, maxWidth: "100%" }}
                  />
                  <span className="text-[10px] text-slate-500">
                    {heartRate < 60 ? "Bradycardic" : heartRate < 100 ? "Normal range" : "Tachycardic"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Dominant Pulse Quality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "floating", label: "Floating", desc: "Lifts easily" },
                    { value: "sinking", label: "Sinking", desc: "Deep pressure" },
                    { value: "rapid", label: "Rapid", desc: "Fast beat" },
                    { value: "slow", label: "Slow", desc: "Sluggish" },
                    { value: "slippery", label: "Slippery", desc: "Rolling" },
                    { value: "wiry", label: "Wiry", desc: "Taut, bowstring" },
                    { value: "weak", label: "Weak", desc: "Soft, easy to press" },
                    { value: "strong", label: "Strong", desc: "Full, forceful" },
                    { value: "moderate", label: "Moderate", desc: "Normal" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPulseQuality(opt.value as PulseQuality)}
                      className={`p-2 rounded-lg text-xs text-center transition-all border ${pulseQuality === opt.value ? "border-violet-500 bg-violet-950/40 text-white" : "border-white/10 text-slate-400 hover:border-violet-500/40"}`}
                    >
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={runPulseAnalysis}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-purple-700 text-white hover:from-violet-500 hover:to-purple-600 transition-all"
              >
                💓 Analyze Pulse Pattern
              </button>
            </>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-4">
          {mode === "tongue" && tongueResult ? (
            <>
              <div className={`glass-panel p-6 border-l-4 ${styles.border} ${styles.bg}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 ${styles.badge}`}>
                      {styles.icon} {tongueResult.urgencyFlag === "normal" ? "Balanced" : tongueResult.urgencyFlag === "monitor" ? "Monitor" : "Seek Consultation"}
                    </span>
                    <h3 className="text-lg font-bold text-white">{tongueResult.tcmPattern}</h3>
                    <p className="text-sm text-amber-300 mt-1">{tongueResult.ethiopianHumoralCorrelation}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {tongueResult.organSystems.map((organ) => (
                    <span key={organ} className="px-2 py-1 rounded-md bg-white/5 text-slate-300 text-xs border border-white/10">
                      {organ}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{tongueResult.DebralSignificance}</p>
              </div>

              <div className="glass-panel p-5">
                <h4 className="text-sm font-bold text-emerald-400 mb-3">🌿 Dietary Recommendations</h4>
                <ul className="space-y-2">
                  {tongueResult.dietaryRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-emerald-500 mt-0.5 shrink-0">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-panel p-5">
                <h4 className="text-sm font-bold text-amber-400 mb-3">🌱 Herbal Support</h4>
                <div className="space-y-3">
                  {tongueResult.herbalRecommendations.map((herb, i) => (
                    <div key={i} className="p-3 rounded-lg bg-black/30 border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-white">{herb.herb}</span>
                        <span className="text-xs text-amber-400 font-mono">{herb.ethiopianName}</span>
                      </div>
                      <p className="text-xs text-slate-400">{herb.action}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/10">
                <p className="text-xs text-amber-200/70 leading-relaxed">
                  ⚠️ {tongueResult.disclaimer}
                </p>
              </div>
            </>
          ) : mode === "pulse" && pulseResult ? (
            <>
              <div className="glass-panel p-6 border-l-4 border-violet-500/40 bg-violet-950/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                    {pulseResult.overallHrEstimate}
                  </div>
                  <div>
                    <div className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Heart Rate BPM</div>
                    <h3 className="text-lg font-bold text-white mt-1">{pulseResult.tcmConstitution}</h3>
                    <p className="text-sm text-violet-300">{pulseResult.ethiopianHumoralBalance}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 text-sm text-slate-300 leading-relaxed">
                  <strong className="text-violet-300">Dominant Imbalance:</strong> {pulseResult.dominantImbalance}
                </div>
                <div className="mt-3 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-sm text-slate-300">
                  <strong className="text-emerald-400">Therapeutic Principle:</strong> {pulseResult.therapeuticPrinciple}
                </div>
              </div>

              <div className="glass-panel p-5">
                <h4 className="text-sm font-bold text-violet-400 mb-3">Pulse Position Map (3-Position Method)</h4>
                <div className="grid grid-cols-2 gap-4">
                  {(["leftWrist", "rightWrist"] as const).map((wrist) => (
                    <div key={wrist}>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2">
                        {wrist === "leftWrist" ? "Left Wrist" : "Right Wrist"}
                      </div>
                      <div className="space-y-2">
                        {(["cun", "guan", "chi"] as const).map((pos) => {
                          const reading = pulseResult[wrist][pos];
                          return (
                            <div key={pos} className="p-2 rounded-lg bg-black/30 border border-white/5">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold text-violet-400 uppercase">{pos.toUpperCase()}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{reading.depth}</span>
                              </div>
                              <div className="text-xs text-white font-semibold">{reading.associatedOrgan}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{reading.ethiopianEquivalent}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-950/10">
                <p className="text-xs text-violet-200/70 leading-relaxed">⚠️ {pulseResult.disclaimer}</p>
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="text-6xl mb-6">{mode === "tongue" ? "👅" : "💓"}</div>
              <h3 className="text-lg font-bold text-white mb-2">
                {mode === "tongue" ? "Tongue Pattern Analysis" : "Pulse Quality Assessment"}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                {mode === "tongue"
                  ? "Select your tongue characteristics on the left and click Analyze to receive TCM pattern insights with Ethiopian humoral correlations."
                  : "Enter your heart rate and describe the dominant pulse quality to receive TCM constitutional insights."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
