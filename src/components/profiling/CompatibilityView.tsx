"use client";

import { useState } from "react";
import { CompatibilityReport, ThePatternBondCategory } from "@/lib/profiling/extendedTypes";
import { analyzeCompatibility } from "@/lib/profiling/compatibility/compatibilityEngine";

interface CompatibilityViewProps {
  currentUser: {
    name: string;
    birthDate: string;
    city?: string;
  };
}

const PRESET_PARTNERS = [
  { name: "Dawit Haile", birthDate: "1992-10-24", city: "Gondar", label: "Friend / Colleague (Gondar)" },
  { name: "Chaltu Tolessa", birthDate: "1996-03-21", city: "Jimma", label: "Creative Partner (Jimma)" },
  { name: "Abebe Kebede", birthDate: "1988-01-08", city: "Lalibela", label: "Business Associate (Lalibela)" },
  { name: "Senait Berhane", birthDate: "1994-07-18", city: "Mekelle", label: "Kin / Traditionalist (Mekelle)" },
  { name: "Ethiopian Airlines", birthDate: "1945-12-21", city: "Addis Ababa", isBrand: true, label: "Brand: Ethiopian Airlines (1945)" },
  { name: "Addis Ababa University", birthDate: "1950-03-20", city: "Addis Ababa", isBrand: true, label: "Institution: AAU (1950)" },
];

const BOND_BADGE_STYLES: Record<ThePatternBondCategory, { badge: string; text: string; bg: string; border: string }> = {
  soulmate: {
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/50",
    text: "text-purple-400",
    bg: "from-purple-950/40 to-slate-900",
    border: "border-purple-500/40",
  },
  extraordinary: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
    text: "text-emerald-400",
    bg: "from-emerald-950/40 to-slate-900",
    border: "border-emerald-500/40",
  },
  powerful: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/50",
    text: "text-amber-400",
    bg: "from-amber-950/40 to-slate-900",
    border: "border-amber-500/40",
  },
  meaningful: {
    badge: "bg-sky-500/20 text-sky-300 border-sky-500/50",
    text: "text-sky-400",
    bg: "from-sky-950/40 to-slate-900",
    border: "border-sky-500/40",
  },
  complex: {
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/50",
    text: "text-indigo-400",
    bg: "from-indigo-950/40 to-slate-900",
    border: "border-indigo-500/40",
  },
  growth: {
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/50",
    text: "text-rose-400",
    bg: "from-rose-950/40 to-slate-900",
    border: "border-rose-500/40",
  },
};

export default function CompatibilityView({ currentUser }: CompatibilityViewProps) {
  const [partnerName, setPartnerName] = useState(PRESET_PARTNERS[0].name);
  const [partnerDate, setPartnerDate] = useState(PRESET_PARTNERS[0].birthDate);
  const [partnerCity, setPartnerCity] = useState(PRESET_PARTNERS[0].city);
  const [isBrandMode, setIsBrandMode] = useState(false);

  const [report, setReport] = useState<CompatibilityReport>(() =>
    analyzeCompatibility(
      { name: currentUser.name, birthDate: currentUser.birthDate, city: currentUser.city },
      { name: PRESET_PARTNERS[0].name, birthDate: PRESET_PARTNERS[0].birthDate, city: PRESET_PARTNERS[0].city }
    )
  );

  const handleSelectPreset = (preset: typeof PRESET_PARTNERS[0]) => {
    setPartnerName(preset.name);
    setPartnerDate(preset.birthDate);
    setPartnerCity(preset.city);
    setIsBrandMode(!!preset.isBrand);

    const calculated = analyzeCompatibility(
      { name: currentUser.name, birthDate: currentUser.birthDate, city: currentUser.city },
      { name: preset.name, birthDate: preset.birthDate, city: preset.city, isBrandOrCompany: !!preset.isBrand }
    );
    setReport(calculated);
  };

  const handleCustomAnalyze = () => {
    if (!partnerName.trim() || !partnerDate) return;
    const calculated = analyzeCompatibility(
      { name: currentUser.name, birthDate: currentUser.birthDate, city: currentUser.city },
      { name: partnerName, birthDate: partnerDate, city: partnerCity, isBrandOrCompany: isBrandMode }
    );
    setReport(calculated);
  };

  const bondStyle = BOND_BADGE_STYLES[report.bondCategory] || BOND_BADGE_STYLES.meaningful;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-100">Multi-Dimensional Compatibility Analyzer</h3>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                The Pattern 6 Bonds + CUE Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evaluates Astrological Synastry, Dan Millman Life Purpose, and Ethiopian AwudeNegest Circle resonance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBrandMode(!isBrandMode)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isBrandMode
                  ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/40"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              {isBrandMode ? "✦ CUE Brand/Company Mode Active" : "Switch to Brand / Company Mode"}
            </button>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Quick Presets:</span>
          {PRESET_PARTNERS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleSelectPreset(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                partnerName === p.name
                  ? "bg-emerald-600 text-white border-emerald-400"
                  : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Profile Comparison Inputs & Result Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Card */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
          <h4 className="text-sm font-bold text-slate-200">
            {isBrandMode ? "Company / Founding Date Details" : "Compare With Profile"}
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isBrandMode ? "Entity / Brand Name" : "Partner / Companion Name"}
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isBrandMode ? "Founding Date / Incorporation" : "Birth Date"}
            </label>
            <input
              type="date"
              value={partnerDate}
              onChange={(e) => setPartnerDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Headquarters</label>
            <input
              type="text"
              value={partnerCity}
              onChange={(e) => setPartnerCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleCustomAnalyze}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/60 hover:from-emerald-500 hover:to-emerald-400 transition-all"
          >
            Calculate Multi-System Bond
          </button>
        </div>

        {/* Right Bond Results Hero Card */}
        <div className={`lg:col-span-8 bg-gradient-to-br ${bondStyle.bg} border ${bondStyle.border} rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-5`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full border ${bondStyle.badge}`}>
                  Bond: {report.bondCategory}
                </span>
                <span className="text-xs text-slate-300 font-mono">Overall Resonance: {report.scores.overall}%</span>
              </div>
              <h4 className="text-xl font-extrabold text-slate-100 mt-2">
                {report.profile1.name} ✕ {report.profile2.name}
              </h4>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-slate-950/80 border border-white/20 flex flex-col items-center justify-center shadow-lg">
              <span className={`text-2xl font-black ${bondStyle.text}`}>{report.scores.overall}</span>
              <span className="text-[9px] text-slate-400 font-medium">SCORE</span>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-950/60 p-4 rounded-xl border border-white/10">
            {report.bondDescription}
          </p>

          {/* 3 Component Score Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Astrological</span>
                <span className="font-bold text-sky-400">{report.scores.astrological}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: `${report.scores.astrological}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block">
                {report.profile1.sunSign} ↔ {report.profile2.sunSign}
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Numerological</span>
                <span className="font-bold text-emerald-400">{report.scores.numerological}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${report.scores.numerological}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block">
                Path {report.profile1.lifePath} ↔ {report.profile2.lifePath}
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">AwudeNegest</span>
                <span className="font-bold text-amber-400">{report.scores.awudeNegest}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${report.scores.awudeNegest}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block">
                Circle #{report.profile1.awudeCircle} ↔ #{report.profile2.awudeCircle}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Synastry Highlights & Harmonizing Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Synastry Highlights */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-3">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>✦</span> Synastry & Vibrational Highlights
          </h4>
          <div className="space-y-2.5">
            {report.synastryHighlights.map((hl, idx) => (
              <div key={idx} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{hl.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded capitalize font-semibold ${
                    hl.type === "strength"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : hl.type === "karmic"
                      ? "bg-purple-950 text-purple-300 border border-purple-800"
                      : "bg-amber-950 text-amber-300 border border-amber-800"
                  }`}>
                    {hl.type}
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">{hl.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Harmonizing Guidance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-3">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>⚖️</span> Harmonizing Advice & Best Practices
          </h4>
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="font-semibold text-emerald-400 block">Relationship Pacing Guidance:</span>
            <ul className="space-y-1.5 text-slate-300">
              {report.recommendations.map((rec, rIdx) => (
                <li key={rIdx} className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/20 text-xs text-amber-300">
            <strong>Cultural Synergy Note:</strong> {report.awudeCircleResonance}
          </div>
        </div>
      </div>
    </div>
  );
}
