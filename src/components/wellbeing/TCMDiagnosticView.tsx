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
} from "@/lib/wellbeing/wellbeingTypes";
import { analyzeTongue, analyzePulse } from "@/lib/wellbeing/tcmDiagnosisEngine";

type DiagMode = "tongue" | "pulse";

const URGENCY_STYLES = {
  normal: { border: "border-brand/40", bg: "bg-brand-soft", badge: "bg-brand text-brand-foreground", icon: "✓" },
  monitor: { border: "border-gold/40", bg: "bg-gold-soft", badge: "bg-gold-fill text-gold-foreground font-bold", icon: "◉" },
  consult: { border: "border-danger/60", bg: "bg-danger-soft", badge: "bg-danger text-danger-foreground animate-pulse", icon: "⚕" },
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
          <h2 className="text-xl font-bold text-foreground">AI-Guided TCM & Ethiopian Humoral Assessment</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Self-reported tongue and pulse analysis cross-mapped with Ethiopian humoral medicine. Not a scientific diagnosis.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("tongue")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${mode === "tongue" ? "bg-gold-fill text-gold-foreground" : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"}`}
          >
            👅 Tongue
          </button>
          <button
            onClick={() => setMode("pulse")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${mode === "pulse" ? "bg-plum text-plum-foreground" : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"}`}
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
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <span className="text-2xl">👅</span> Tongue Observation
              </h3>

              {/* Visual tongue guide */}
              <div className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-b from-danger-soft to-danger-soft border border-danger/20 flex items-center justify-center">
                <div
                  className="w-24 h-16 rounded-full transition-all duration-500 shadow-panel"
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
                <p className="absolute bottom-2 text-[10px] text-danger font-mono">Live preview</p>
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
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">{field.label}</label>
                  <select
                    value={field.value}
                    onChange={(e) => (field.onChange as (v: string) => void)(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:border-gold"
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
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <span className="text-2xl">💓</span> Pulse Self-Assessment
              </h3>

              <div className="p-4 rounded-xl bg-plum-soft border border-plum/20 text-xs text-soft leading-relaxed">
                <strong className="text-plum block mb-1">How to assess your pulse:</strong>
                Place 3 fingers lightly on your opposite wrist, just below the thumb. Feel the rhythm and quality.
                Count beats for 15 seconds × 4 to get heart rate.
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  min={40} max={120}
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm outline-none focus:border-plum"
                />
                <div className="flex items-center mt-2 gap-2">
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-info via-brand to-danger transition-all"
                    style={{ width: `${Math.min(100, (heartRate / 120) * 100)}%`, maxWidth: "100%" }}
                  />
                  <span className="text-[10px] text-subtle">
                    {heartRate < 60 ? "Bradycardic" : heartRate < 100 ? "Normal range" : "Tachycardic"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
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
                      className={`p-2 rounded-lg text-xs text-center transition-all border ${pulseQuality === opt.value ? "border-plum bg-plum-soft text-foreground" : "border-border text-muted-foreground hover:border-plum/40"}`}
                    >
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-[10px] text-subtle mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={runPulseAnalysis}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-plum to-plum text-plum-foreground hover:from-plum hover:to-plum transition-all"
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
                    <h3 className="text-lg font-bold text-foreground">{tongueResult.tcmPattern}</h3>
                    <p className="text-sm text-gold mt-1">{tongueResult.ethiopianHumoralCorrelation}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {tongueResult.organSystems.map((organ) => (
                    <span key={organ} className="px-2 py-1 rounded-md bg-foreground/5 text-soft text-xs border border-border">
                      {organ}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-soft leading-relaxed">{tongueResult.scientificSignificance}</p>
              </div>

              <div className="glass-panel p-5">
                <h4 className="text-sm font-bold text-brand mb-3">🌿 Dietary Recommendations</h4>
                <ul className="space-y-2">
                  {tongueResult.dietaryRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-soft">
                      <span className="text-brand mt-0.5 shrink-0">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-panel p-5">
                <h4 className="text-sm font-bold text-gold mb-3">🌱 Herbal Support</h4>
                <div className="space-y-3">
                  {tongueResult.herbalRecommendations.map((herb, i) => (
                    <div key={i} className="p-3 rounded-lg bg-sunken/50 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground">{herb.herb}</span>
                        <span className="text-xs text-gold font-mono">{herb.ethiopianName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{herb.action}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gold/20 bg-gold-soft/70">
                <p className="text-xs text-gold-strong leading-relaxed">
                  ⚠️ {tongueResult.disclaimer}
                </p>
              </div>
            </>
          ) : mode === "pulse" && pulseResult ? (
            <>
              <div className="glass-panel p-6 border-l-4 border-plum/40 bg-plum-soft/70">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-plum to-plum-soft flex items-center justify-center text-2xl font-bold text-plum-foreground shadow-panel">
                    {pulseResult.overallHrEstimate}
                  </div>
                  <div>
                    <div className="text-xs text-plum font-semibold uppercase tracking-wider">Heart Rate BPM</div>
                    <h3 className="text-lg font-bold text-foreground mt-1">{pulseResult.tcmConstitution}</h3>
                    <p className="text-sm text-plum">{pulseResult.ethiopianHumoralBalance}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-foreground/5 text-sm text-soft leading-relaxed">
                  <strong className="text-plum">Dominant Imbalance:</strong> {pulseResult.dominantImbalance}
                </div>
                <div className="mt-3 p-3 rounded-lg bg-brand-soft border border-brand/20 text-sm text-soft">
                  <strong className="text-brand">Therapeutic Principle:</strong> {pulseResult.therapeuticPrinciple}
                </div>
              </div>

              <div className="glass-panel p-5">
                <h4 className="text-sm font-bold text-plum mb-3">Pulse Position Map (3-Position Method)</h4>
                <div className="grid grid-cols-2 gap-4">
                  {(["leftWrist", "rightWrist"] as const).map((wrist) => (
                    <div key={wrist}>
                      <div className="text-xs font-bold text-muted-foreground uppercase mb-2">
                        {wrist === "leftWrist" ? "Left Wrist" : "Right Wrist"}
                      </div>
                      <div className="space-y-2">
                        {(["cun", "guan", "chi"] as const).map((pos) => {
                          const reading = pulseResult[wrist][pos];
                          return (
                            <div key={pos} className="p-2 rounded-lg bg-sunken/50 border border-border">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold text-plum uppercase">{pos.toUpperCase()}</span>
                                <span className="text-[10px] text-subtle font-mono">{reading.depth}</span>
                              </div>
                              <div className="text-xs text-foreground font-semibold">{reading.associatedOrgan}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{reading.ethiopianEquivalent}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-plum/20 bg-plum-soft/70">
                <p className="text-xs text-plum-strong leading-relaxed">⚠️ {pulseResult.disclaimer}</p>
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="text-6xl mb-6">{mode === "tongue" ? "👅" : "💓"}</div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {mode === "tongue" ? "Tongue Pattern Analysis" : "Pulse Quality Assessment"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
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
