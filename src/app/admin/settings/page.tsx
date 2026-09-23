"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Sliders,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  BookOpen,
  Mail,
  Building,
  Radio,
  FileCheck,
  Server,
  Layers,
} from "lucide-react";

interface SystemConfig {
  maintenance: {
    enabled: boolean;
    message: string;
    startedAt: string | null;
  };
  announcement: {
    enabled: boolean;
    message: string;
    severity: "info" | "warning" | "critical";
    updatedAt: string;
  };
  flags: {
    allowSelfRegistration: boolean;
    requireEmailVerification: boolean;
    domainBEnforced: boolean;
    safetyGateStrictness: "standard" | "elevated" | "strict_lock";
    literatureAutoSync: boolean;
    altitudeCalibrationMeters: number;
    defaultLanguage: "en" | "am" | "om" | "ti" | "so";
    sessionTimeoutHours: number;
    debugTelemetry: boolean;
  };
  platform: {
    name: string;
    organization: string;
    supportEmail: string;
    version: string;
    environment: string;
  };
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<"general" | "safety" | "auth" | "literature">("general");

  // Load current settings from API
  const loadSettings = async () => {
    try {
      const res = await fetch("/api/admin/system");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load platform settings.");
      setConfig(json.data.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const reportSuccess = (msg: string) => {
    setNotice(msg);
    setError("");
    setTimeout(() => setNotice(""), 4000);
  };

  // Save changes to backend
  const handleSavePlatform = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_platform",
          payload: { platform: config.platform },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to save platform metadata.");
      reportSuccess("Platform metadata saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFlags = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_flags",
          payload: { flags: config.flags },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update governance flags.");
      reportSuccess("Governance feature flags updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p>Loading application configuration...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs">
        <p>Unable to load configuration: {error || "Unknown error."}</p>
        <button onClick={loadSettings} className="mt-3 btn-primary text-xs px-3 py-1.5">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="font-medium">{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-purple-400/40 bg-purple-500/10 text-purple-300">
            System Configuration
          </span>
          <span className="text-xs text-slate-400 font-mono">Environment: {config.platform.environment}</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Configuration & Policy Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage regulatory rules, Stage 5 safety gate policies, authentication defaults, and literature automation.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-200 flex items-center gap-2">
          <AlertTriangle size={15} className="text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveSection("general")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeSection === "general"
            ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-sm"
            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
        >
          <Building size={14} />
          <span>General & Branding</span>
        </button>
        <button
          onClick={() => setActiveSection("safety")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeSection === "safety"
            ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-sm"
            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
        >
          <ShieldCheck size={14} />
          <span>Scientific & Safety Gates</span>
        </button>
        <button
          onClick={() => setActiveSection("auth")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeSection === "auth"
            ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-sm"
            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
        >
          <Lock size={14} />
          <span>Access & Security</span>
        </button>
        <button
          onClick={() => setActiveSection("literature")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeSection === "literature"
            ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-sm"
            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
        >
          <BookOpen size={14} />
          <span>Literature Sync Automation</span>
        </button>
      </div>

      {/* SECTION 1: GENERAL & BRANDING */}
      {activeSection === "general" && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building size={16} className="text-emerald-400" />
              <span>Platform Branding & Regional Localization</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Identity headers, institutional ownership, and default altitude calibration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Platform Name</label>
              <input
                type="text"
                value={config.platform.name}
                onChange={(e) =>
                  setConfig({ ...config, platform: { ...config.platform, name: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Governing Organization / Sign-Off</label>
              <input
                type="text"
                value={config.platform.organization}
                onChange={(e) =>
                  setConfig({ ...config, platform: { ...config.platform, organization: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Compliance & Advisory Email</label>
              <input
                type="email"
                value={config.platform.supportEmail}
                onChange={(e) =>
                  setConfig({ ...config, platform: { ...config.platform, supportEmail: e.target.value } })
                }
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Default Platform Language</label>
              <select
                value={config.flags.defaultLanguage}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    flags: { ...config.flags, defaultLanguage: e.target.value as any },
                  })
                }
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none cursor-pointer"
              >
                <option value="en" className="bg-slate-900 text-white">English (en)</option>
                <option value="am" className="bg-slate-900 text-white">አማርኛ - Amharic (am)</option>
                <option value="om" className="bg-slate-900 text-white">Afaan Oromoo (om)</option>
                <option value="ti" className="bg-slate-900 text-white">ትግርኛ - Tigrinya (ti)</option>
                <option value="so" className="bg-slate-900 text-white">Af-Soomaali (so)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Default Altitude Calibration (Meters above sea level)
              </label>
              <input
                type="number"
                value={config.flags.altitudeCalibrationMeters}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    flags: { ...config.flags, altitudeCalibrationMeters: Number(e.target.value) },
                  })
                }
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard: 2,400m (Addis Ababa baseline for WHO iron intake calibration)
              </span>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Release Version Tag</label>
              <input
                type="text"
                disabled
                value={config.platform.version}
                className="w-full p-2.5 rounded-xl bg-black/20 border border-white/5 text-xs text-slate-400 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/5">
            <button
              onClick={handleSavePlatform}
              disabled={saving}
              className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow"
            >
              <Save size={14} />
              <span>{saving ? "Saving..." : "Save Branding Settings"}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: DebrAL & SAFETY GATES */}
      {activeSection === "safety" && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Scientific Herb-Drug Safety & Architectural Firewall</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Stage 5 Safety Gate release-blocking canaries and Domain A/B isolation rules
            </p>
          </div>

          <div className="space-y-4">
            {/* Safety Gate Strictness Selector */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5">
              <label className="text-xs font-semibold text-white block mb-1">
                Stage 5 Safety Gate Strictness Level
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Dictates how potential contraindications (e.g. Tena Adam + Warfarin, Kosso + Metformin) are blocked.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "standard",
                    title: "Standard Strictness",
                    desc: "Blocks verified Tier 1/2 lethal contraindications from ETM-DB",
                  },
                  {
                    id: "elevated",
                    title: "Elevated Caution",
                    desc: "Flags minor pharmacokinetic interactions with medical advisory warnings",
                  },
                  {
                    id: "strict_lock",
                    title: "Emergency Strict Lock",
                    desc: "Blocks all herbal remedies without double-blind peer-reviewed literature",
                  },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        flags: { ...config.flags, safetyGateStrictness: tier.id as any },
                      })
                    }
                    className={`p-3 rounded-xl text-left border transition-all ${config.flags.safetyGateStrictness === tier.id
                      ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-200 shadow-md"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                  >
                    <p className="font-bold text-xs">{tier.title}</p>
                    <p className="text-[10px] mt-1 text-slate-400 leading-normal">{tier.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Domain A/B Firewall Toggle */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Domain A/B Architectural Firewall</p>
                <p className="text-[11px] text-slate-400 max-w-xl">
                  Enforces strict isolation between Domain A (biochemical EFCT evaluation engine) and Domain B
                  (cultural, lunar, astrological layers). Prevents cultural attributions from masquerading as Scientific diagnoses.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    flags: { ...config.flags, domainBEnforced: !config.flags.domainBEnforced },
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${config.flags.domainBEnforced
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-950 text-rose-300 border border-rose-500/40"
                  }`}
              >
                {config.flags.domainBEnforced ? "Firewall Enforced" : "Permissive (Testing)"}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/5">
            <button
              onClick={handleSaveFlags}
              disabled={saving}
              className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow"
            >
              <Save size={14} />
              <span>{saving ? "Saving..." : "Save Safety Policies"}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: ACCESS & SECURITY */}
      {activeSection === "auth" && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock size={16} className="text-sky-400" />
              <span>Authentication, Access & Audit Policies</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Registration availability, session lifetimes, and brute-force defenses
            </p>
          </div>

          <div className="space-y-4">
            {/* Self-Registration Toggle */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Allow Public Self-Registration</p>
                <p className="text-[11px] text-slate-400">
                  When disabled, new accounts can only be created by administrators or health institution leads.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    flags: { ...config.flags, allowSelfRegistration: !config.flags.allowSelfRegistration },
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${config.flags.allowSelfRegistration
                  ? "bg-emerald-600 text-white"
                  : "bg-white/10 text-slate-400"
                  }`}
              >
                {config.flags.allowSelfRegistration ? "Enabled (Public)" : "Disabled (Invite Only)"}
              </button>
            </div>

            {/* Email Verification */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Require Email Verification on Registration</p>
                <p className="text-[11px] text-slate-400">
                  Sends automated OTP token to verify user email address prior to granting case evaluation access.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    flags: {
                      ...config.flags,
                      requireEmailVerification: !config.flags.requireEmailVerification,
                    },
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${config.flags.requireEmailVerification
                  ? "bg-emerald-600 text-white"
                  : "bg-white/10 text-slate-400"
                  }`}
              >
                {config.flags.requireEmailVerification ? "Mandatory" : "Optional"}
              </button>
            </div>

            {/* Session Timeout */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Session Inactivity Expiry</p>
                <p className="text-[11px] text-slate-400">
                  Refresh token duration before requiring explicit re-authentication (Hours)
                </p>
              </div>
              <input
                type="number"
                min={1}
                max={720}
                value={config.flags.sessionTimeoutHours}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    flags: { ...config.flags, sessionTimeoutHours: Number(e.target.value) },
                  })
                }
                className="w-24 p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white text-center font-mono outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/5">
            <button
              onClick={handleSaveFlags}
              disabled={saving}
              className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow"
            >
              <Save size={14} />
              <span>{saving ? "Saving..." : "Save Access Policies"}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: LITERATURE SYNC AUTOMATION */}
      {activeSection === "literature" && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen size={16} className="text-purple-400" />
              <span>Scientific Literature & EFCT Synchronizer</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Automated ingestion pipelines pulling biomedical trials from PubMed, Europe PMC, and Ethiopian herb databases
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Automated Background Literature Sync</p>
                <p className="text-[11px] text-slate-400">
                  Periodically queries PubMed API for new Scientific findings across Ethiopian indigenous botanicals.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    flags: {
                      ...config.flags,
                      literatureAutoSync: !config.flags.literatureAutoSync,
                    },
                  })
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${config.flags.literatureAutoSync
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-slate-400"
                  }`}
              >
                {config.flags.literatureAutoSync ? "Auto-Sync Active" : "Disabled"}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black/30 border border-white/5">
              <p className="text-xs font-semibold text-white mb-2">Connected Evidence Repositories</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                  <p className="font-bold text-slate-200">PubMed / NCBI</p>
                  <p className="text-[11px] text-slate-400">Clinical trials & mesh pharmacology</p>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Status: Connected</span>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                  <p className="font-bold text-slate-200">Europe PMC</p>
                  <p className="text-[11px] text-slate-400">Open-access full texts & preprint mining</p>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Status: Connected</span>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                  <p className="font-bold text-slate-200">ETM-DB & EFCT</p>
                  <p className="text-[11px] text-slate-400">726 foods · 69 nutrients · 48 districts</p>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Status: Synced v3.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/5">
            <button
              onClick={handleSaveFlags}
              disabled={saving}
              className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow"
            >
              <Save size={14} />
              <span>{saving ? "Saving..." : "Save Sync Settings"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}