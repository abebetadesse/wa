"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ClipboardList,
  User,
  ShieldCheck,
  Utensils,
  FileText,
  Sparkles,
  X,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
} from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <div className="h-[210px] animate-pulse rounded-lg bg-white/5" />,
});

const metricCards = [
  {
    value: "92%",
    label: "signal integrity",
    accent: "cyan",
    sparkline: "M0,20 Q15,5 30,12 T60,2",
    color: "#00f0ff",
  },
  {
    value: "8.4s",
    label: "case readiness",
    accent: "amber",
    sparkline: "M0,4 Q20,18 35,8 T60,16",
    color: "#ffb000",
  },
  {
    value: "24/7",
    label: "advisory loop",
    accent: "purple",
    sparkline: "M0,14 Q15,2 30,14 T60,4",
    color: "#a855f7",
  },
  {
    value: "3.2k",
    label: "records processed",
    accent: "green",
    sparkline: "M0,22 Q20,15 35,6 T60,1",
    color: "#10b981",
  },
];

const quickActions = [
  {
    title: "Launch Case",
    amharic: "ጉዳይ ይጀምሩ",
    description: "Multi-domain Debral & cultural evaluation",
    href: "/case",
    icon: <ClipboardList size={20} className="text-cyan-400" />,
    accent: "border-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/15",
  },
  {
    title: "Personal Profile",
    amharic: "የግል መገለጫ",
    description: "Natal chart, gematria & baptismal patron",
    href: "/profile",
    icon: <User size={20} className="text-amber-400" />,
    accent: "border-amber-500/30 hover:border-amber-400 hover:shadow-amber-500/15",
  },
  {
    title: "Safety Matrix",
    amharic: "የመድኃኒት ደኅንነት",
    description: "ETM-DB Herb-Drug interaction checks",
    href: "/safety",
    icon: <ShieldCheck size={20} className="text-emerald-400" />,
    accent: "border-emerald-500/30 hover:border-emerald-400 hover:shadow-emerald-500/15",
  },
  {
    title: "Food Composition",
    amharic: "የምግብ ማውጫ (EFCT)",
    description: "726 Ethiopian foods & biochemical gaps",
    href: "/foods",
    icon: <Utensils size={20} className="text-purple-400" />,
    accent: "border-purple-500/30 hover:border-purple-400 hover:shadow-purple-500/15",
  },
  {
    title: "Audit Ledger",
    amharic: "የምርመራ መዝገብ",
    description: "Immutable compliance & event logs",
    href: "/audit",
    icon: <FileText size={20} className="text-rose-400" />,
    accent: "border-rose-500/30 hover:border-rose-400 hover:shadow-rose-500/15",
  },
];

const overlayList = [
  { label: "Nutrient model (EFCT)", value: "726 Foods Loaded" },
  { label: "Debral safety gate", value: "Stage 5 Locked" },
  { label: "Regional altitude calibration", value: "2,400m (Addis)" },
  { label: "Awde Negest engine", value: "16 Circles Active" },
  { label: "Forecast horizon", value: "+12h Planetary" },
];

const recentActivities = [
  {
    id: "1",
    action: "Debral Intake completed",
    detail: "Highland iron target calibrated (+15%) for Addis Ababa",
    time: "2m ago",
    status: "success",
  },
  {
    id: "2",
    action: "Herb-Drug Gate Verified",
    detail: "Tena Adam contraindication with Warfarin successfully blocked",
    time: "14m ago",
    status: "warning",
  },
  {
    id: "3",
    action: "Awde Negest Circle 15",
    detail: "Harvest & abundance prediction parchment generated",
    time: "1h ago",
    status: "success",
  },
  {
    id: "4",
    action: "Baptismal Patron Synced",
    detail: "Patron Saint Mikael (Feast Day 12) recorded in vault",
    time: "3h ago",
    status: "info",
  },
  {
    id: "5",
    action: "Injera Fermentation Analysis",
    detail: "48h fermentation phytate reduction factor (+40% iron bioavailability)",
    time: "5h ago",
    status: "success",
  },
];

const ancestralSignals = [
  "Lineage memory",
  "Climate resonance",
  "Herbal safety",
  "Family harmony",
];

const lineOption = {
  backgroundColor: "transparent",
  grid: { left: 16, right: 16, top: 24, bottom: 28, containLabel: true },
  tooltip: { trigger: "axis", backgroundColor: "rgba(8, 17, 28, 0.9)", borderColor: "#00f0ff" },
  xAxis: {
    type: "category",
    boundaryGap: false,
    axisLine: { lineStyle: { color: "rgba(0,240,255,0.22)" } },
    axisLabel: { color: "#7fb3d0", fontFamily: "Share Tech Mono" },
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  yAxis: {
    type: "value",
    axisLine: { lineStyle: { color: "rgba(0,240,255,0.22)" } },
    splitLine: { lineStyle: { color: "rgba(0,240,255,0.08)" } },
    axisLabel: { color: "#7fb3d0", fontFamily: "Share Tech Mono" },
  },
  series: [
    {
      name: "Signal strength",
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      itemStyle: { color: "#00f0ff" },
      lineStyle: { width: 3, color: "#00f0ff" },
      areaStyle: { color: "rgba(0, 240, 255, 0.14)" },
      data: [58, 74, 70, 84, 88, 90, 93],
    },
  ],
};

const barOption = {
  backgroundColor: "transparent",
  tooltip: { trigger: "axis", backgroundColor: "rgba(8, 17, 28, 0.9)", borderColor: "#ffb000" },
  grid: { left: 16, right: 16, top: 24, bottom: 20, containLabel: true },
  xAxis: {
    type: "category",
    axisLine: { lineStyle: { color: "rgba(255,176,0,0.2)" } },
    axisLabel: { color: "#d9eaf7", fontFamily: "Share Tech Mono" },
    data: ["Iron", "Vit C", "Folate", "Calcium", "Omega"],
  },
  yAxis: {
    type: "value",
    splitLine: { lineStyle: { color: "rgba(255,176,0,0.08)" } },
    axisLabel: { color: "#d9eaf7", fontFamily: "Share Tech Mono" },
  },
  series: [
    {
      type: "bar",
      barWidth: 26,
      itemStyle: {
        color: "#ffb000",
      },
      data: [72, 81, 58, 94, 76],
    },
  ],
};

const radarOption = {
  backgroundColor: "transparent",
  tooltip: {},
  radar: {
    indicator: [
      { name: "Nutrition", max: 100 },
      { name: "Safety", max: 100 },
      { name: "Culture", max: 100 },
      { name: "Access", max: 100 },
      { name: "Recovery", max: 100 },
    ],
    splitLine: { lineStyle: { color: "rgba(0,240,255,0.18)" } },
    axisLine: { lineStyle: { color: "rgba(0,240,255,0.32)" } },
    shape: "circle",
    radius: "68%",
  },
  series: [
    {
      type: "radar",
      areaStyle: { opacity: 0.25 },
      lineStyle: { width: 2 },
      data: [
        {
          value: [86, 72, 91, 68, 88],
          name: "Performance",
          itemStyle: { color: "#00f0ff" },
          areaStyle: { color: "rgba(0, 240, 255, 0.25)" },
        },
      ],
    },
  ],
};

const trendSummaryOption = {
  backgroundColor: "transparent",
  tooltip: { trigger: "axis", backgroundColor: "rgba(8, 17, 28, 0.9)", borderColor: "#00f0ff" },
  grid: { left: 12, right: 8, top: 18, bottom: 24, containLabel: true },
  xAxis: {
    type: "category",
    boundaryGap: false,
    axisLabel: { color: "#8bb3d0", fontFamily: "Share Tech Mono", fontSize: 10 },
    data: ["W1", "W2", "W3", "W4", "W5", "W6"],
  },
  yAxis: {
    type: "value",
    axisLabel: { color: "#8bb3d0", fontFamily: "Share Tech Mono", fontSize: 10 },
    splitLine: { lineStyle: { color: "rgba(0,240,255,0.08)" } },
  },
  series: [
    {
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 5,
      itemStyle: { color: "#7dd3fc" },
      lineStyle: { width: 2.5, color: "#7dd3fc" },
      areaStyle: { color: "rgba(125, 211, 252, 0.12)" },
      data: [52, 66, 74, 78, 88, 94],
    },
  ],
};

const caseDepthOption = {
  backgroundColor: "transparent",
  tooltip: { trigger: "item", backgroundColor: "rgba(8, 17, 28, 0.9)", borderColor: "#ffb000" },
  legend: { bottom: 0, textStyle: { color: "#b7d9eb", fontFamily: "Share Tech Mono", fontSize: 10 } },
  series: [
    {
      type: "pie",
      radius: [32, 72],
      center: ["50%", "48%"],
      color: ["#00f0ff", "#ffb000", "#8b5cf6", "#34d399"],
      label: { color: "#dff7ff", fontFamily: "Share Tech Mono", fontSize: 10 },
      data: [
        { value: 42, name: "Debral" },
        { value: 28, name: "Culture" },
        { value: 18, name: "Lifestyle" },
        { value: 12, name: "Safety" },
      ],
    },
  ],
};

export default function HudDashboard() {
  const [activeSignalTab, setActiveSignalTab] = useState<"telemetry" | "analysis" | "archive">("telemetry");
  const [showNotice, setShowNotice] = useState(true);

  const particles = Array.from({ length: 18 }, (_, index) => ({
    id: index,
    left: `${8 + (index * 7) % 80}%`,
    top: `${12 + (index * 11) % 72}%`,
    delay: `${index * 0.35}s`,
    duration: `${7 + (index % 5)}s`,
    dx: `${(index % 2 === 0 ? 1 : -1) * (36 + (index % 4) * 18)}px`,
    dy: `${-28 - (index % 6) * 12}px`,
  }));

  const glyphs = ["✦", "መ", "ፍ", "ግ", "☼", "✧", "⟡", "ᛉ"];
  const runeNodes = ["✦", "ᚠ", "✧", "ᛉ", "✦"];

  return (
    <div className="app-container py-8 md:py-12 dashboard-shell oracle-temple divination-chamber">
      <div className="particle-field" aria-hidden="true" />
      <div className="oracle-particle-trail" aria-hidden="true">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="oracle-particle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              ["--dx" as string]: particle.dx,
              ["--dy" as string]: particle.dy,
            }}
          />
        ))}
      </div>
      <div className="oracle-glyphs" aria-hidden="true">
        {glyphs.map((glyph, index) => (
          <span key={`${glyph}-${index}`} className="oracle-glyph" style={{ animationDelay: `${index * 0.5}s` }}>
            {glyph}
          </span>
        ))}
      </div>

      {/* Dismissible Notice Banner */}
      {showNotice && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200 backdrop-blur-md shadow-lg"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} className="text-amber-400 shrink-0" />
            <span>
              <strong>Ancestral Resonance Active:</strong> Ethiopian highland altitude baseline calibrated at 2,400m. 726 EFCT foods and Stage 5 Herb-Drug safety filters operational.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowNotice(false)}
            className="text-amber-400/70 hover:text-amber-300 p-1 rounded transition"
            title="Dismiss notice"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* Command View Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="sci-fi-panel p-6 md:p-8 mb-8 hud-header ancestral-shell"
      >
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
          <div className="max-w-3xl">
            <div className="status-pill mb-4 ancestral-pill">
              <span className="status-dot" />
              Ancestral intelligence core
            </div>
            <h1 className="dashboard-title ancestral-title">Ethiopian Welbeing Intelligence</h1>
            <p className="dashboard-subtitle">
              Precision nutrition, safety-aware traditional medicine guidance, and cultural context fused into a living command view for care decisions.
            </p>

            <div className="ancestral-signal-row mt-6">
              {ancestralSignals.map((signal, index) => (
                <motion.span
                  key={signal}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.1, duration: 0.45 }}
                  className="ancestral-signal"
                >
                  {signal}
                </motion.span>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="cinematic-orbit ancestral-orbit"
            aria-label="System status"
          >
            <div className="orbital-ring ring-one" />
            <div className="orbital-ring ring-two" />
            <div className="globe-core ancestral-globe" />
          </motion.div>
        </div>
      </motion.div>

      {/* 5 Quick Action Tiles */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
          <Layers size={14} className="text-amber-400" />
          QUICK ACCESS TILES • ፈጣን መዳረሻ
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {quickActions.map((action, idx) => (
            <Link key={action.title} href={action.href}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`flex flex-col justify-between rounded-xl border bg-stone-900/80 p-4 transition-all backdrop-blur-md hover:shadow-lg ${action.accent}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="rounded-lg bg-white/5 p-2">{action.icon}</div>
                    <ArrowRight size={14} className="text-stone-500 opacity-60" />
                  </div>
                  <div className="text-sm font-bold text-white">{action.title}</div>
                  <div className="text-[11px] font-mono text-amber-400/80">{action.amharic}</div>
                </div>
                <div className="mt-3 text-[11px] text-stone-400 leading-tight">
                  {action.description}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Signal Metrics Grid with Sparklines */}
      <div className="signal-grid mb-8 ancestral-grid">
        {metricCards.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 + index * 0.08 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className={`metric-card metric-card--${metric.accent} relative overflow-hidden`}
          >
            <div className="flex items-end justify-between">
              <div>
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
              </div>
              <svg className="h-7 w-16 opacity-70 mb-2" viewBox="0 0 60 24" fill="none">
                <path
                  d={metric.sparkline}
                  stroke={metric.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Panel with Functional Signal Tabs */}
      <div className="dashboard-grid rune-rail">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="sci-fi-panel p-5 dashboard-panel"
        >
          {/* Functional Tabs */}
          <div className="signal-tabs">
            <button
              type="button"
              className={`signal-tab ${activeSignalTab === "telemetry" ? "is-active" : ""}`}
              onClick={() => setActiveSignalTab("telemetry")}
            >
              Telemetry
            </button>
            <button
              type="button"
              className={`signal-tab ${activeSignalTab === "analysis" ? "is-active" : ""}`}
              onClick={() => setActiveSignalTab("analysis")}
            >
              Deep Analysis
            </button>
            <button
              type="button"
              className={`signal-tab ${activeSignalTab === "archive" ? "is-active" : ""}`}
              onClick={() => setActiveSignalTab("archive")}
            >
              Case Archive
            </button>
          </div>

          {/* Tab 1: Live Telemetry */}
          {activeSignalTab === "telemetry" && (
            <div>
              <div className="terminal-screen" aria-live="polite">
                {[
                  "> SCANNING SECTOR 7G ...",
                  "> DIAGNOSTIC MATRIX LOADED",
                  "> 726 FOOD ITEMS INDEXED",
                  "> CULTURAL SAFETY GATES ENABLED (STAGE 5 ACTIVE)",
                  "> RISK SCENARIO MONITORING ACTIVE (ALTITUDE 2400M)",
                ].join("\n")}
              </div>

              <div className="chart-grid mt-6">
                <div className="mini-chart-panel">
                  <div className="chart-header">
                    <span>Case signal</span>
                    <span className="chart-tag">Live</span>
                  </div>
                  <ReactECharts option={lineOption} style={{ height: 210 }} notMerge lazyUpdate />
                </div>
                <div className="mini-chart-panel">
                  <div className="chart-header">
                    <span>Micronutrient index</span>
                    <span className="chart-tag chart-tag--amber">Focus</span>
                  </div>
                  <ReactECharts option={barOption} style={{ height: 210 }} notMerge lazyUpdate />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Deep Analysis */}
          {activeSignalTab === "analysis" && (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Activity size={16} className="text-cyan-400" />
                  11 Knowledge Strands Calibration Matrix
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400">EFCT Food Composition:</span>
                    <div className="mt-1 h-2 w-full rounded-full bg-stone-800 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: "98%" }} />
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-400">ETM-DB Herb-Drug Matrix:</span>
                    <div className="mt-1 h-2 w-full rounded-full bg-stone-800 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: "94%" }} />
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-400">Highland Altitude Calibration (2400m):</span>
                    <div className="mt-1 h-2 w-full rounded-full bg-stone-800 overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-400">Awde Negest Divination Rules:</span>
                    <div className="mt-1 h-2 w-full rounded-full bg-stone-800 overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: "96%" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs">
                  <strong className="text-amber-300 font-semibold block mb-1">
                    Altitude Physiology Target:
                  </strong>
                  WHO highland baseline adjustment elevates adult hemoglobin target (+1.5 g/dL) and iron intake (+15%) to maintain cellular oxygenation in Addis Ababa.
                </div>
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs">
                  <strong className="text-cyan-300 font-semibold block mb-1">
                    Fermentation Bioavailability:
                  </strong>
                  Traditional 48-72h teff batter fermentation degrades phytate complexes, boosting iron and zinc bioavailability by up to 40%.
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Case Archive */}
          {activeSignalTab === "archive" && (
            <div className="space-y-3 pt-2">
              <div className="text-xs text-stone-400 mb-2">
                Recent certified readings and evaluation logs:
              </div>
              {[
                {
                  id: "ET-9412",
                  title: "Awde Negest & Baptismal Alignment",
                  date: "Sep 11, 2026",
                  domain: "Spiritual",
                  badge: "Certified",
                  color: "border-amber-500/30 text-amber-300",
                },
                {
                  id: "ET-9390",
                  title: "Highland Anemia & Herb Safety Check",
                  date: "Sep 09, 2026",
                  domain: "Debral",
                  badge: "Gate Passed",
                  color: "border-emerald-500/30 text-emerald-300",
                },
                {
                  id: "ET-9351",
                  title: "Auspicious Enterprise Launch Timing",
                  date: "Sep 04, 2026",
                  domain: "Career",
                  badge: "Archived",
                  color: "border-cyan-500/30 text-cyan-300",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/10 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">{item.id}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono border ${item.color}`}>
                        {item.badge}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-stone-200 mt-0.5">{item.title}</div>
                    <div className="text-[11px] text-stone-500 font-mono">{item.domain} • {item.date}</div>
                  </div>
                  <Link
                    href={`/case`}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:bg-white/10 hover:text-white"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Aside: Live State + Radar + Activity Feed */}
        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.38 }}
          className="sci-fi-panel p-5 dashboard-panel space-y-6"
        >
          <div>
            <div className="dashboard-side-header">Live state</div>
            <ul className="data-list">
              {overlayList.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="radar-panel">
            <div className="chart-header">
              <span>System readiness</span>
              <span className="chart-tag chart-tag--blue">Stable</span>
            </div>
            <ReactECharts option={radarOption} style={{ height: 220 }} notMerge lazyUpdate />
          </div>

          {/* Activity Feed */}
          <div className="border-t border-white/10 pt-4">
            <div className="text-xs font-mono uppercase tracking-wider text-stone-400 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-amber-400" />
                RECENT ACTIVITY
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">● Live</span>
            </div>
            <div className="space-y-2.5">
              {recentActivities.map((act) => (
                <div key={act.id} className="rounded-lg border border-white/5 bg-white/5 p-2.5 text-xs">
                  <div className="flex items-center justify-between text-stone-300 font-semibold mb-0.5">
                    <span className="flex items-center gap-1.5">
                      {act.status === "success" && <CheckCircle2 size={12} className="text-emerald-400" />}
                      {act.status === "warning" && <AlertTriangle size={12} className="text-amber-400" />}
                      {act.status === "info" && <Sparkles size={12} className="text-cyan-400" />}
                      {act.action}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">{act.time}</span>
                  </div>
                  <div className="text-[11px] text-stone-400 leading-tight">{act.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>

      <div className="oracle-rune-thread" aria-hidden="true">
        <span className="rune-line" />
        {runeNodes.map((node, index) => (
          <span key={`${node}-${index}`} className="rune-node">
            {node}
          </span>
        ))}
      </div>

      <div className="analytics-grid mt-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.45 }}
          className="sci-fi-panel p-5 dashboard-panel"
        >
          <div className="chart-header">
            <span>Trend summary</span>
            <span className="chart-tag chart-tag--blue">7-day</span>
          </div>
          <ReactECharts option={trendSummaryOption} style={{ height: 220 }} notMerge lazyUpdate />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.52 }}
          className="sci-fi-panel p-5 dashboard-panel"
        >
          <div className="chart-header">
            <span>Case depth</span>
            <span className="chart-tag chart-tag--amber">Composite</span>
          </div>
          <ReactECharts option={caseDepthOption} style={{ height: 220 }} notMerge lazyUpdate />
        </motion.div>
      </div>
    </div>
  );
}
