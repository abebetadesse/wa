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
    badge: "bg-plum/20 text-plum-strong border-plum/50",
    text: "text-plum",
    bg: "from-plum-soft to-card",
    border: "border-plum/40",
  },
  extraordinary: {
    badge: "bg-brand/20 text-brand-strong border-brand/50",
    text: "text-brand",
    bg: "from-brand-soft to-card",
    border: "border-brand/40",
  },
  powerful: {
    badge: "bg-gold/20 text-gold-strong border-gold/50",
    text: "text-gold",
    bg: "from-gold-soft to-card",
    border: "border-gold/40",
  },
  meaningful: {
    badge: "bg-info/20 text-info-strong border-info/50",
    text: "text-info",
    bg: "from-info-soft to-card",
    border: "border-info/40",
  },
  complex: {
    badge: "bg-info/20 text-info-strong border-info/50",
    text: "text-info",
    bg: "from-info-soft to-card",
    border: "border-info/40",
  },
  growth: {
    badge: "bg-danger/20 text-danger-strong border-danger/50",
    text: "text-danger",
    bg: "from-danger-soft to-card",
    border: "border-danger/40",
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
      <div className="bg-card/90 border border-border rounded-2xl p-6 shadow-panel ">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">Multi-Dimensional Compatibility Analyzer</h3>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-brand/10 text-brand-strong border border-brand/30 rounded-full">
                The Pattern 6 Bonds + CUE Mode
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Evaluates Astrological Synastry, Dan Millman Life Purpose, and Ethiopian AwudeNegest Circle resonance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBrandMode(!isBrandMode)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isBrandMode
                  ? "bg-gold-fill text-gold-foreground border-gold shadow-md"
                  : "bg-muted text-soft border-border hover:bg-sunken"
              }`}
            >
              {isBrandMode ? "✦ CUE Brand/Company Mode Active" : "Switch to Brand / Company Mode"}
            </button>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <span className="text-[11px] font-semibold text-muted-foreground">Quick Presets:</span>
          {PRESET_PARTNERS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleSelectPreset(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                partnerName === p.name
                  ? "bg-brand text-brand-foreground border-brand"
                  : "bg-background text-soft border-border hover:bg-muted"
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
        <div className="lg:col-span-4 bg-card/90 border border-border rounded-2xl p-5 shadow-panel  space-y-4">
          <h4 className="text-sm font-bold text-soft">
            {isBrandMode ? "Company / Founding Date Details" : "Compare With Profile"}
          </h4>

          <div>
            <label className="block text-xs font-semibold text-soft mb-1">
              {isBrandMode ? "Entity / Brand Name" : "Partner / Companion Name"}
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-2 text-xs text-soft focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-soft mb-1">
              {isBrandMode ? "Founding Date / Incorporation" : "Birth Date"}
            </label>
            <input
              type="date"
              value={partnerDate}
              onChange={(e) => setPartnerDate(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-2 text-xs text-soft focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-soft mb-1">Location / Headquarters</label>
            <input
              type="text"
              value={partnerCity}
              onChange={(e) => setPartnerCity(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-2 text-xs text-soft focus:outline-none focus:border-brand"
            />
          </div>

          <button
            onClick={handleCustomAnalyze}
            className="w-full py-2.5 bg-gradient-to-r from-brand to-brand text-brand-foreground text-xs font-bold rounded-xl shadow-panel hover:from-brand hover:to-brand transition-all"
          >
            Calculate Multi-System Bond
          </button>
        </div>

        {/* Right Bond Results Hero Card */}
        <div className={`lg:col-span-8 bg-gradient-to-br ${bondStyle.bg} border ${bondStyle.border} rounded-2xl p-6 shadow-raised  space-y-5`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${bondStyle.badge}`}>
                  Bond: {report.bondCategory}
                </span>
                <span className="text-xs text-soft font-mono">Overall Resonance: {report.scores.overall}%</span>
              </div>
              <h4 className="text-xl font-extrabold text-foreground mt-2">
                {report.profile1.name} ✕ {report.profile2.name}
              </h4>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-background/80 border border-border-strong flex flex-col items-center justify-center shadow-panel">
              <span className={`text-2xl font-bold ${bondStyle.text}`}>{report.scores.overall}</span>
              <span className="text-[9px] text-muted-foreground font-medium">SCORE</span>
            </div>
          </div>

          <p className="text-xs text-soft leading-relaxed font-medium bg-background/60 p-4 rounded-xl border border-border">
            {report.bondDescription}
          </p>

          {/* 3 Component Score Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-background/80 rounded-xl border border-border space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Astrological</span>
                <span className="font-bold text-info">{report.scores.astrological}%</span>
              </div>
              <div className="w-full h-1.5 bg-card rounded-full overflow-hidden">
                <div className="h-full bg-info rounded-full" style={{ width: `${report.scores.astrological}%` }} />
              </div>
              <span className="text-[10px] text-subtle block">
                {report.profile1.sunSign} ↔ {report.profile2.sunSign}
              </span>
            </div>

            <div className="p-3 bg-background/80 rounded-xl border border-border space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Numerological</span>
                <span className="font-bold text-brand">{report.scores.numerological}%</span>
              </div>
              <div className="w-full h-1.5 bg-card rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: `${report.scores.numerological}%` }} />
              </div>
              <span className="text-[10px] text-subtle block">
                Path {report.profile1.lifePath} ↔ {report.profile2.lifePath}
              </span>
            </div>

            <div className="p-3 bg-background/80 rounded-xl border border-border space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">AwudeNegest</span>
                <span className="font-bold text-gold">{report.scores.awudeNegest}%</span>
              </div>
              <div className="w-full h-1.5 bg-card rounded-full overflow-hidden">
                <div className="h-full bg-gold-fill rounded-full" style={{ width: `${report.scores.awudeNegest}%` }} />
              </div>
              <span className="text-[10px] text-subtle block">
                Circle #{report.profile1.awudeCircle} ↔ #{report.profile2.awudeCircle}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Synastry Highlights & Harmonizing Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Synastry Highlights */}
        <div className="bg-card/90 border border-border rounded-2xl p-6 shadow-panel  space-y-3">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>✦</span> Synastry & Vibrational Highlights
          </h4>
          <div className="space-y-2.5">
            {report.synastryHighlights.map((hl, idx) => (
              <div key={idx} className="p-3 bg-background/70 rounded-xl border border-border space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-soft">{hl.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded capitalize font-semibold ${
                    hl.type === "strength"
                      ? "bg-brand-soft text-brand-strong border border-brand/30"
                      : hl.type === "karmic"
                      ? "bg-plum-soft text-plum-strong border border-plum/30"
                      : "bg-gold-soft text-gold-strong border border-gold/30"
                  }`}>
                    {hl.type}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">{hl.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Harmonizing Guidance */}
        <div className="bg-card/90 border border-border rounded-2xl p-6 shadow-panel  space-y-3">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>⚖️</span> Harmonizing Advice & Best Practices
          </h4>
          <div className="p-4 bg-background/70 rounded-xl border border-border space-y-2 text-xs">
            <span className="font-semibold text-brand block">Relationship Pacing Guidance:</span>
            <ul className="space-y-1.5 text-soft">
              {report.recommendations.map((rec, rIdx) => (
                <li key={rIdx} className="flex items-start gap-2">
                  <span className="text-brand">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-3 bg-gold-soft rounded-xl border border-gold/20 text-xs text-gold-strong">
            <strong>Cultural Synergy Note:</strong> {report.awudeCircleResonance}
          </div>
        </div>
      </div>
    </div>
  );
}
