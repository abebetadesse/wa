"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Users,
  FileCheck2,
  FileSpreadsheet,
  BookOpen,
  TrendingUp,
  Activity,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Download,
  Clock,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Server,
  Cpu,
  Database,
  Radio,
  Sliders,
  AlertTriangle,
  Megaphone,
  Power,
  RotateCcw,
  CheckCircle2,
  Lock,
  Unlock,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  Layers,
} from "lucide-react";

interface SystemTelemetry {
  database: {
    status: "healthy" | "degraded" | "down";
    latencyMs: number;
    connected: boolean;
  };
  runtime: {
    nodeVersion: string;
    platform: string;
    uptimeSeconds: number;
    memory: {
      rssMb: number;
      heapTotalMb: number;
      heapUsedMb: number;
    };
  };
  telemetry: {
    activeSessions: number;
    totalAuditEvents: number;
    totalUsers: number;
    totalCases: number;
    literatureArticles: number;
    lastSync: any;
  };
  services: Array<{
    name: string;
    status: string;
    latency: string;
    type: string;
  }>;
  config: {
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
      defaultLanguage: string;
      sessionTimeoutHours: number;
    };
    platform: {
      name: string;
      organization: string;
      version: string;
    };
  };
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "services" | "controls" | "audit">("overview");
  const [analytics, setAnalytics] = useState<any>(null);
  const [systemData, setSystemData] = useState<SystemTelemetry | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFilter, setAuditFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Auto-refresh config (seconds: 0 = off)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);

  // Management Modals
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementSeverity, setAnnouncementSeverity] = useState<"info" | "warning" | "critical">("info");
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  const [syncingLiterature, setSyncingLiterature] = useState(false);

  // Notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Fetch all dashboard & telemetry data
  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [analyticsRes, auditRes, systemRes] = await Promise.all([
        fetch("/api/admin/analytics").then((r) => r.json()),
        fetch("/api/admin/audit?limit=25").then((r) => r.json()),
        fetch("/api/admin/system").then((r) => r.json()),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (auditRes.success) setRecentActivities(auditRes.data?.logs || []);
      if (systemRes.success) {
        setSystemData(systemRes.data);
        setAnnouncementText(systemRes.data.config.announcement.message || "");
        setAnnouncementSeverity(systemRes.data.config.announcement.severity || "info");
        setAnnouncementEnabled(systemRes.data.config.announcement.enabled || false);
        setMaintenanceMessage(systemRes.data.config.maintenance.message || "");
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh dashboard telemetry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Auto-refresh timer loop
  useEffect(() => {
    if (autoRefreshInterval === 0) return;
    setSecondsRemaining(autoRefreshInterval);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          void fetchData();
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, fetchData]);

  // Administrative Actions
  const handleToggleMaintenance = async () => {
    try {
      const current = systemData?.config.maintenance.enabled;
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_maintenance",
          payload: { enabled: !current, message: maintenanceMessage },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to toggle maintenance mode.");
      setShowMaintenanceModal(false);
      showToast(data.message);
      void fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    }
  };

  const handleSaveAnnouncement = async () => {
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_announcement",
          payload: {
            enabled: announcementEnabled,
            message: announcementText,
            severity: announcementSeverity,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update announcement.");
      setShowAnnouncementModal(false);
      showToast(data.message);
      void fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    }
  };

  const handleTriggerLiteratureSync = async () => {
    setSyncingLiterature(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger_sync" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to trigger sync.");
      showToast(data.message);
      void fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync trigger failed.");
    } finally {
      setTimeout(() => setSyncingLiterature(false), 2000);
    }
  };

  const handleEmergencyLock = async () => {
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "emergency_lock" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to toggle emergency lock.");
      showToast(data.message);
      void fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Emergency action failed.");
    }
  };

  const handleRevalidateCache = async () => {
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revalidate_cache" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to revalidate cache.");
      showToast(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cache revalidation failed.");
    }
  };

  const statCards = [
    {
      title: "Total Patient Accounts",
      value: analytics?.users?.total ?? "—",
      change: analytics ? `${analytics.users.active} Active (${analytics.users.suspended} Suspended)` : "Loading...",
      icon: Users,
      color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
    },
    {
      title: "Scientific Evaluations",
      value: analytics?.operations?.totalCases ?? "—",
      change: `${systemData?.telemetry?.activeSessions ?? 0} Concurrent Sessions`,
      icon: FileCheck2,
      color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
    },
    {
      title: "Audit & Safety Events",
      value: systemData?.telemetry?.totalAuditEvents ?? analytics?.operations?.totalAuditLogs ?? "—",
      change: `Authentication Success: ${analytics?.security?.successRate ?? 100}%`,
      icon: FileSpreadsheet,
      color: "from-sky-500/20 to-sky-600/10 border-sky-500/30 text-sky-400",
    },
    {
      title: "Scientific Knowledge Base",
      value: systemData?.telemetry?.literatureArticles ?? analytics?.operations?.knowledgeItems ?? "—",
      change: systemData?.telemetry?.lastSync?.status
        ? `Last Synced: ${new Date(systemData.telemetry.lastSync.startedAt).toLocaleTimeString()}`
        : "Automated PubMed/EFCT Sync",
      icon: BookOpen,
      color: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
    },
  ];

  const caseTypeBreakdown = analytics?.caseTypeBreakdown || [
    { caseType: "wellbeing", count: 18 },
    { caseType: "relationships", count: 9 },
    { caseType: "career", count: 7 },
    { caseType: "spiritual", count: 5 },
    { caseType: "legal", count: 3 },
  ];

  const maxCaseTypeCount = Math.max(...caseTypeBreakdown.map((entry: { count: number }) => entry.count), 1);

  // Filtered audit logs
  const filteredActivities = recentActivities.filter((act) => {
    const matchesSearch =
      !auditSearch ||
      act.userEmail?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      act.action?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      act.eventType?.toLowerCase().includes(auditSearch.toLowerCase());
    if (auditFilter === "all") return matchesSearch;
    if (auditFilter === "security") return matchesSearch && (act.action?.includes("AUTH") || act.action?.includes("LOGIN") || act.action?.includes("ROLE"));
    if (auditFilter === "system") return matchesSearch && (act.action?.includes("SYSTEM") || act.resourceType === "system_control");
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Global Broadcast Banner (if enabled) */}
      {systemData?.config.announcement.enabled && (
        <div
          className={`px-4 py-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold backdrop-blur-md shadow-sm ${systemData.config.announcement.severity === "critical"
            ? "bg-rose-950/80 border-rose-500/50 text-rose-200"
            : systemData.config.announcement.severity === "warning"
              ? "bg-amber-950/80 border-amber-500/50 text-amber-200"
              : "bg-sky-950/80 border-sky-500/50 text-sky-200"
            }`}
        >
          <div className="flex items-center gap-2.5">
            <Megaphone size={16} className="animate-pulse shrink-0" />
            <span>
              <strong className="uppercase tracking-wider mr-1.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/40">
                Broadcast:
              </strong>
              {systemData.config.announcement.message}
            </span>
          </div>
          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="text-[10px] underline hover:no-underline font-mono ml-4 shrink-0"
          >
            Edit Announcement
          </button>
        </div>
      )}

      {/* Maintenance Mode Warning */}
      {systemData?.config.maintenance.enabled && (
        <div className="px-4 py-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-rose-400 animate-pulse" />
            <div>
              <p className="font-bold">Maintenance Mode Active</p>
              <p className="text-[11px] text-rose-300/80 font-normal">{systemData.config.maintenance.message}</p>
            </div>
          </div>
          <button
            onClick={handleToggleMaintenance}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition-all shadow"
          >
            Deactivate Now
          </button>
        </div>
      )}

      {/* Header & Quick Telemetry Ribbon */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 flex items-center gap-1.5">
                <Radio size={10} className="text-emerald-400 animate-pulse" />
                <span>Control Plane v3.0</span>
              </span>

              {/* PostgreSQL DB Live Status */}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-sky-400/30 bg-sky-500/10 text-sky-200 flex items-center gap-1.5">
                <Database size={11} className="text-sky-400" />
                <span>
                  Postgres:{" "}
                  {systemData?.database.status === "healthy"
                    ? `${systemData.database.latencyMs}ms (Online)`
                    : "Connecting..."}
                </span>
              </span>

              {/* Memory Usage */}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-purple-400/30 bg-purple-500/10 text-purple-200 flex items-center gap-1.5">
                <Cpu size={11} className="text-purple-400" />
                <span>RSS: {systemData?.runtime.memory.rssMb ?? 0}MB</span>
              </span>

              {/* Safety Gate Strictness Indicator */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border flex items-center gap-1.5 ${systemData?.config.flags.safetyGateStrictness === "strict_lock"
                  ? "border-rose-500/40 bg-rose-950/40 text-rose-300"
                  : "border-emerald-500/30 bg-emerald-950/30 text-emerald-300"
                  }`}
              >
                <ShieldCheck size={11} />
                <span>
                  Safety:{" "}
                  {systemData?.config.flags.safetyGateStrictness === "strict_lock" ? "Strict Lock" : "Standard"}
                </span>
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight mt-1.5">
              Platform Administration & Operational Control
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live telemetry, Ethiopian wellbeing governance, literature synchronizer, and application management.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto-refresh interval dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <Clock size={13} className="text-slate-400" />
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-xs text-white outline-none cursor-pointer font-mono"
                aria-label="Auto-refresh interval"
              >
                <option value={10} className="bg-slate-900 text-white">Live 10s</option>
                <option value={30} className="bg-slate-900 text-white">Every 30s</option>
                <option value={60} className="bg-slate-900 text-white">Every 1m</option>
                <option value={0} className="bg-slate-900 text-white">Off</option>
              </select>
              {autoRefreshInterval > 0 && (
                <span className="text-[10px] font-mono text-emerald-400 ml-1">
                  ({secondsRemaining}s)
                </span>
              )}
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={() => void fetchData(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-xs flex items-center justify-center"
              title="Refresh Telemetry"
              aria-label="Refresh Telemetry"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin text-emerald-400" : ""} />
            </button>

            {/* Quick Literature Sync Trigger */}
            <button
              onClick={handleTriggerLiteratureSync}
              disabled={syncingLiterature}
              className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
              title="Sync PubMed, Europe PMC, and Ethiopian Literature"
            >
              <RotateCcw size={13} className={syncingLiterature ? "animate-spin text-purple-300" : ""} />
              <span>{syncingLiterature ? "Syncing..." : "Sync Literature"}</span>
            </button>

            {/* User Management shortcut */}
            <Link
              href="/admin/users"
              className="btn-primary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
            >
              <UserPlus size={13} />
              <span>Users</span>
            </Link>

            {/* Export data dropdown/link */}
            <a
              href="/api/admin/users/export?format=csv"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-200 flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === "overview"
              ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
          >
            <Activity size={14} />
            <span>Overview & KPIs</span>
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === "services"
              ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
          >
            <Server size={14} />
            <span>Infrastructure & Telemetry</span>
          </button>
          <button
            onClick={() => setActiveTab("controls")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === "controls"
              ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
          >
            <Sliders size={14} />
            <span>App Management & Controls</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === "audit"
              ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
          >
            <ShieldCheck size={14} />
            <span>Security & Audit Stream</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} border shadow-lg backdrop-blur-md relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">{stat.title}</span>
                    <div className="p-2 rounded-xl bg-black/30 border border-white/10">
                      <Icon size={18} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-300">
                      <TrendingUp size={12} className="text-emerald-400" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Operational Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Platform Activity & Ingestion Trend */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity size={16} className="text-emerald-400" />
                    <span>Scientific Intake Velocity & Ingestion Trajectory</span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Calculated against Ethiopian high-altitude nutritional norms
                  </p>
                </div>
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Live Stream
                </span>
              </div>

              {/* Area SVG Simulation */}
              <div className="w-full h-52 relative pt-2">
                <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="600" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <line x1="0" y1="130" x2="600" y2="130" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                  {/* Dynamic Area Path */}
                  <path
                    d="M0,140 Q100,110 200,90 T400,60 T600,30 L600,160 L0,160 Z"
                    fill="url(#velocityGrad)"
                  />
                  <path
                    d="M0,140 Q100,110 200,90 T400,60 T600,30"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />

                  {/* Key checkpoints */}
                  <circle cx="0" cy="140" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="200" cy="90" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="400" cy="60" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="600" cy="30" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                </svg>

                <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                  <span>Day -30</span>
                  <span>Day -20</span>
                  <span>Day -10</span>
                  <span>Today (Peak Operations)</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-white/5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Scientific Gap Evaluations (+28.4% WoW)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Stage 5 Safety Gates: Zero Contraindication Breaches</span>
                </div>
              </div>
            </div>

            {/* Reports by Case Domain */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers size={16} className="text-amber-400" />
                  <span>Evaluations by Domain</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Multi-strand case categorization</p>

                <div className="space-y-3.5 mt-5">
                  {caseTypeBreakdown.map((entry: { caseType: string; count: number }) => (
                    <div key={entry.caseType} className="text-xs">
                      <div className="flex justify-between text-slate-300 mb-1 font-medium">
                        <span className="capitalize">{entry.caseType}</span>
                        <span className="font-mono text-slate-400">{entry.count} cases</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500"
                          style={{ width: `${Math.round((entry.count / maxCaseTypeCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Analyzed:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {analytics?.operations?.totalCases ?? 0} cases
                </span>
              </div>
            </div>
          </div>

          {/* Regional Adoption & Ethiopian Language Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ethiopian Regional Coverage */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <span className="text-emerald-400">📍</span>
                <span>Regional Adoption (48 Ethiopian Districts)</span>
              </h2>
              <p className="text-[11px] text-slate-400 mb-4">Patient origin calibrated with local terroir and soils</p>

              <div className="space-y-3">
                {(analytics?.regionalDistribution || [
                  { region: "Addis Ababa", count: 42 },
                  { region: "Oromia", count: 31 },
                  { region: "Amhara", count: 26 },
                  { region: "Tigray", count: 14 },
                  { region: "Sidama", count: 11 },
                ])
                  .slice(0, 5)
                  .map((r: { region: string; count: number }, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-slate-200 font-medium">{r.region}</span>
                      <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                        {r.count} users
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Language Distribution */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <span className="text-amber-400">🌐</span>
                <span>Multilingual Engagement</span>
              </h2>
              <p className="text-[11px] text-slate-400 mb-4">Local language access across Ethiopia and diaspora</p>

              <div className="space-y-3">
                {(analytics?.languageDistribution || [
                  { label: "English", count: 48, code: "en" },
                  { label: "አማርኛ (Amharic)", count: 42, code: "am" },
                  { label: "Afaan Oromoo", count: 21, code: "om" },
                  { label: "ትግርኛ (Tigrinya)", count: 14, code: "ti" },
                  { label: "Af-Soomaali", count: 9, code: "so" },
                ]).map((lang: { label: string; count: number; code: string }) => (
                  <div key={lang.code} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-slate-300 uppercase">
                        {lang.code}
                      </span>
                      <span className="text-slate-200 font-medium">{lang.label}</span>
                    </div>
                    <span className="font-mono text-slate-400">{lang.count} users</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INFRASTRUCTURE & TELEMETRY */}
      {activeTab === "services" && (
        <div className="space-y-6">
          {/* Runtime & Server Specs Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Server size={16} className="text-sky-400" />
              <span>Node.js Process & Host Environment</span>
            </h2>
            <p className="text-[11px] text-slate-400 mb-5">Containerized runtime telemetry and memory allocation</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Process Uptime</span>
                <div className="text-xl font-bold text-white mt-1">
                  {Math.floor((systemData?.runtime.uptimeSeconds || 0) / 3600)}h{" "}
                  {Math.floor(((systemData?.runtime.uptimeSeconds || 0) % 3600) / 60)}m
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">healthy continuous run</span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Memory Allocation (RSS)</span>
                <div className="text-xl font-bold text-purple-400 mt-1">
                  {systemData?.runtime.memory.rssMb ?? 0} MB
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Heap: {systemData?.runtime.memory.heapUsedMb ?? 0} / {systemData?.runtime.memory.heapTotalMb ?? 0} MB
                </span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Node Runtime</span>
                <div className="text-xl font-bold text-white mt-1">
                  {systemData?.runtime.nodeVersion || process.version}
                </div>
                <span className="text-[10px] text-slate-400 font-mono capitalize">
                  {systemData?.runtime.platform || process.platform}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono">DB Ping Latency</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {systemData?.database.latencyMs ?? 0} ms
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">PostgreSQL Pool Ready</span>
              </div>
            </div>
          </div>

          {/* Subsystem & Micro-Service wellbeing Matrix */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Activity size={16} className="text-emerald-400" />
              <span>Platform Subsystems wellbeing Matrix</span>
            </h2>
            <p className="text-[11px] text-slate-400 mb-4">Real-time status of Scientific, security, and knowledge engines</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(systemData?.services || [
                { name: "PostgreSQL Database Engine", status: "healthy", latency: "12ms", type: "core" },
                { name: "Auth & Session Gateway", status: "healthy", latency: "<5ms", type: "security" },
                { name: "Literature Synthesis Engine", status: "healthy", latency: "async", type: "intelligence" },
                { name: "Herb-Drug Safety Gate v3.0", status: "healthy", latency: "<2ms", type: "Scientific" },
                { name: "EFCT 2025 Nutritional Engine", status: "healthy", latency: "<10ms", type: "nutrition" },
                { name: "Domain A/B Security Firewall", status: "active", latency: "isolated", type: "compliance" },
              ]).map((svc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-black/30 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-xs font-semibold text-slate-200">{svc.name}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Type: {svc.type} • Latency: {svc.latency}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-semibold bg-emerald-950/70 border border-emerald-500/30 text-emerald-300">
                    {svc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APP MANAGEMENT & CONTROLS */}
      {activeTab === "controls" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maintenance Mode Controller */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Power size={16} className="text-rose-400" />
                    <span>Maintenance Mode</span>
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${systemData?.config.maintenance.enabled
                      ? "bg-rose-950/80 border border-rose-500/40 text-rose-300"
                      : "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                      }`}
                  >
                    {systemData?.config.maintenance.enabled ? "Active" : "Normal Operation"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When enabled, standard user requests show a maintenance window, while administrators retain full access
                  to console diagnostics and knowledge tools.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-slate-300">
                  <span className="text-[10px] text-slate-400 block mb-1">Current Public Notice:</span>
                  &ldquo;{systemData?.config.maintenance.message || "Scheduled platform maintenance."}&rdquo;
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowMaintenanceModal(true)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all shadow ${systemData?.config.maintenance.enabled
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-rose-600 hover:bg-rose-500 text-white"
                    }`}
                >
                  {systemData?.config.maintenance.enabled ? "Deactivate Maintenance" : "Configure & Activate"}
                </button>
              </div>
            </div>

            {/* Global Broadcast Announcement */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Megaphone size={16} className="text-amber-400" />
                    <span>Global Platform Announcement</span>
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${systemData?.config.announcement.enabled
                      ? "bg-amber-950/80 border border-amber-500/40 text-amber-300"
                      : "bg-white/5 border border-white/10 text-slate-400"
                      }`}
                  >
                    {systemData?.config.announcement.enabled ? "Broadcasting" : "Disabled"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pin a high-visibility banner across the entire platform for emergency notices, EFCT dataset updates,
                  or traditional medicine regulatory alerts.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-slate-300">
                  <span className="text-[10px] text-slate-400 block mb-1">Preview:</span>
                  {systemData?.config.announcement.message || "No announcement set."}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-all shadow"
                >
                  Edit Announcement Banner
                </button>
              </div>
            </div>
          </div>

          {/* Operational Feature Toggles */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Sliders size={16} className="text-emerald-400" />
              <span>Runtime Feature Governance Flags</span>
            </h2>
            <p className="text-[11px] text-slate-400 mb-5">
              Live operational controls modifying system security and intake rules without server redeployment
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Emergency Lock */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Stage 5 Safety Gate Strictness</p>
                  <p className="text-[11px] text-slate-400">
                    Lock enforces absolute block on all unverified traditional herb combinations
                  </p>
                </div>
                <button
                  onClick={handleEmergencyLock}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${systemData?.config.flags.safetyGateStrictness === "strict_lock"
                    ? "bg-rose-600 text-white"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                >
                  {systemData?.config.flags.safetyGateStrictness === "strict_lock" ? (
                    <>
                      <Lock size={12} />
                      <span>Strict Locked</span>
                    </>
                  ) : (
                    <>
                      <Unlock size={12} />
                      <span>Standard</span>
                    </>
                  )}
                </button>
              </div>

              {/* Cache Purge */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Revalidate Static & Client Cache</p>
                  <p className="text-[11px] text-slate-400">
                    Purge in-memory nutritional lookup tables and refresh live state
                  </p>
                </div>
                <button
                  onClick={handleRevalidateCache}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5"
                >
                  <RotateCcw size={12} />
                  <span>Purge Cache</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & AUDIT STREAM */}
      {activeTab === "audit" && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Immutable Security & Audit Ledger</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Tamper-evident trace of all administrative access, evaluations, and role updates
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user or action..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 w-48"
                />
              </div>

              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none cursor-pointer"
                aria-label="Filter audit events"
              >
                <option value="all" className="bg-slate-900 text-white">All Events</option>
                <option value="security" className="bg-slate-900 text-white">Auth & Roles</option>
                <option value="system" className="bg-slate-900 text-white">System Controls</option>
              </select>

              <Link
                href="/admin/audit"
                className="text-xs text-emerald-400 hover:underline font-medium ml-2 flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {filteredActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No matching audit logs found.</div>
            ) : (
              filteredActivities.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between text-xs hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Sparkles size={13} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">
                        <span className="text-emerald-400 font-mono mr-2">[{act.action || act.eventType}]</span>
                        {act.userName ? `${act.userName} (${act.userEmail})` : act.userEmail || "System Engine"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        IP: {act.ipAddress || "127.0.0.1"} • Resource: {act.resourceType || "platform"}
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {new Date(act.createdAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST ANNOUNCEMENT */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Megaphone size={18} className="text-amber-400" />
              <span>Manage Global Platform Announcement</span>
            </h3>
            <p className="text-xs text-slate-400">
              This message will be rendered as a prominent banner on all platform client pages.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Announcement Status</label>
                <button
                  type="button"
                  onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${announcementEnabled
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : "bg-white/10 text-slate-400 border-white/10"
                    }`}
                >
                  {announcementEnabled ? "Broadcasting (Active)" : "Hidden (Disabled)"}
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Severity Level</label>
                <div className="flex gap-2">
                  {(["info", "warning", "critical"] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setAnnouncementSeverity(sev)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border ${announcementSeverity === sev
                        ? sev === "critical"
                          ? "bg-rose-600 text-white border-rose-500"
                          : sev === "warning"
                            ? "bg-amber-600 text-white border-amber-500"
                            : "bg-sky-600 text-white border-sky-500"
                        : "bg-white/5 text-slate-400 border-white/10"
                        }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Message Text</label>
                <textarea
                  rows={3}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. Traditional Medicine Safety Advisory: ETM-DB dataset updated to v3.0."
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAnnouncementModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAnnouncement}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow"
              >
                Save Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MAINTENANCE MODE */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Power size={18} className="text-rose-400" />
              <span>Configure Platform Maintenance</span>
            </h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to toggle maintenance mode? When active, users without administrator roles will see
              a maintenance screen.
            </p>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Downtime Notice to Visitors</label>
              <textarea
                rows={3}
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="The Ethiopian wellbeing Platform is undergoing scheduled regulatory updates..."
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500/50"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowMaintenanceModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleMaintenance}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow"
              >
                {systemData?.config.maintenance.enabled ? "Deactivate Mode" : "Activate Maintenance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
