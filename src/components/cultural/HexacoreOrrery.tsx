"use client";

import { useMemo, useState, useEffect } from "react";
import {
  CREATION_DAY_MAPPINGS,
  HEXACORE_ASPECTS,
  HEXACORE_CORES,
  HEXACORE_FREQUENCIES,
  HEXACORE_PAIRS,
  HEXACORE_ARCHETYPES,
  HEXACORE_CORRESPONDENCES,
  TEMPORAL_CYCLES,
  ENERGETIC_BODIES,
  COLLECTIVE_DYNAMICS,
  INITIATION_GATES,
  COSMOLOGICAL_REALMS,
  CROSS_SYSTEM_TRADITIONS,
  ETHIOPIAN_HERBAL_INTEGRATION,
  BODY_SIGN_ZONES,
  calculate6BasedNumerology,
  getJournalPromptForDay,
  buildHexacoreProfile,
  type HexacoreCore,
  type HexacoreProfile,
  type HexacoreNumerology,
  type JournalPrompt,
} from "@/lib/cultural/hexacoreArcana";
import {
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  Layers,
  Activity,
  UserCheck,
  Calendar,
  Eye,
  Shield,
  Heart,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Play,
  Square,
  RefreshCw,
} from "lucide-react";

const CORE_COLORS: Record<string, string> = {
  spirit: "#9370DB",
  power: "#FF6347",
  humanity: "#4169E1",
  peace: "#DAA520",
  creation: "#32CD32",
  order: "#00CED1",
};

const CORE_POSITIONS: Record<string, [number, number]> = {
  spirit: [300, 150],
  power: [450, 240],
  humanity: [450, 400],
  peace: [300, 490],
  creation: [150, 400],
  order: [150, 240],
};

function coreById(id: string) {
  return HEXACORE_CORES.find((core) => core.id === id) ?? HEXACORE_CORES[0];
}

// Simple Web Audio Solfeggio Synthesizer
class SolfeggioSynth {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;

  play(freq: number) {
    this.stop();
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.osc = this.ctx.createOscillator();
      this.gain = this.ctx.createGain();

      this.osc.type = "sine";
      this.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      this.gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.gain.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + 0.3);

      this.osc.connect(this.gain);
      this.gain.connect(this.ctx.destination);
      this.osc.start();
    } catch {
      // Audio policy or not supported
    }
  }

  stop() {
    if (this.gain && this.ctx) {
      try {
        this.gain.gain.setValueAtTime(this.gain.gain.value, this.ctx.currentTime);
        this.gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
        setTimeout(() => {
          this.osc?.stop();
          this.osc?.disconnect();
          this.ctx?.close();
          this.osc = null;
          this.gain = null;
          this.ctx = null;
        }, 250);
      } catch {
        this.osc = null;
        this.gain = null;
        this.ctx = null;
      }
    }
  }
}

const synth = typeof window !== "undefined" ? new SolfeggioSynth() : null;

export default function HexacoreOrrery() {
  const [activeTab, setActiveTab] = useState<"orrery" | "layers" | "journal" | "bodysigns" | "calculator">("orrery");
  const [selectedCoreId, setSelectedCoreId] = useState<HexacoreCore["id"]>("spirit");
  const [activeLayer, setActiveLayer] = useState<number>(1);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [bodySignTab, setBodySignTab] = useState<"tongue" | "palm" | "face">("tongue");
  const [playingFreq, setPlayingFreq] = useState<number | null>(null);

  // Profile Calculator State
  const [calcName, setCalcName] = useState("Example User");
  const [calcDate, setCalcDate] = useState("1990-12-25");
  const [calcConsent, setCalcConsent] = useState(true);
  const [calcAge, setCalcAge] = useState(true);
  const [calculatedProfile, setCalculatedProfile] = useState<HexacoreProfile | null>(null);
  const [calculatedNumerology, setCalculatedNumerology] = useState<HexacoreNumerology | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Journal Entry persistence
  const [journalText, setJournalText] = useState("");
  const [savedEntries, setSavedEntries] = useState<Record<number, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hexacore_journal_entries");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedEntries(parsed);
        if (parsed[activeDay]) setJournalText(parsed[activeDay]);
      }
    } catch {
      // LocalStorage access may be restricted
    }
  }, [activeDay]);

  const handleSaveJournal = () => {
    const updated = { ...savedEntries, [activeDay]: journalText };
    setSavedEntries(updated);
    try {
      localStorage.setItem("hexacore_journal_entries", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handlePlaySound = (freq: number) => {
    if (playingFreq === freq) {
      synth?.stop();
      setPlayingFreq(null);
    } else {
      synth?.play(freq);
      setPlayingFreq(freq);
    }
  };

  const handleCalculateProfile = () => {
    setCalcError(null);
    try {
      const profile = buildHexacoreProfile(calcDate, calcConsent, calcAge, calcName);
      const numerology = calculate6BasedNumerology(calcDate, calcName);
      setCalculatedProfile(profile);
      setCalculatedNumerology(numerology);
    } catch (err) {
      setCalcError(err instanceof Error ? err.message : "Profile calculation failed.");
    }
  };

  const selectedCore = coreById(selectedCoreId);
  const selectedAspects = useMemo(
    () => HEXACORE_ASPECTS.filter((aspect) => aspect.coreId === selectedCoreId),
    [selectedCoreId]
  );
  const currentJournalPrompt = useMemo(() => getJournalPromptForDay(activeDay), [activeDay]);
  const dayMapping = CREATION_DAY_MAPPINGS.find((m) => m.day === selectedCore.creationDay);
  const pairs = HEXACORE_PAIRS.filter((p) => p.left === selectedCore.name || p.right === selectedCore.name);

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: "orrery", label: "Grand Orrery", icon: Sparkles },
          { id: "layers", label: "14-Layer Matrix", icon: Layers },
          { id: "journal", label: "30-Day Journal", icon: BookOpen },
          { id: "bodysigns", label: "Body Signs", icon: Eye },
          { id: "calculator", label: "Profile & Numerology", icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all ${isActive
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-200 border border-indigo-500/40 shadow-lg shadow-indigo-950/40"
                  : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/5"
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GRAND ORRERY */}
      {activeTab === "orrery" && (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] items-start">
          <div className="rounded-3xl border border-indigo-400/20 bg-[#080817] p-4 md:p-6 shadow-2xl shadow-indigo-950/30">
            <div className="flex items-center justify-between px-2 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-300/80 font-bold">14-Layer Hexacore Wheel</p>
                <h2 className="text-xl font-bold text-white tracking-tight">Six Cores · 36 Aspects · 216 Frequencies</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-amber-300/30 bg-amber-500/10 px-3 py-1 text-[10px] font-medium text-amber-200">
                  46,656 States
                </span>
                {playingFreq && (
                  <button
                    onClick={() => handlePlaySound(playingFreq)}
                    className="flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-[10px] text-rose-300 animate-pulse"
                  >
                    <VolumeX className="h-3 w-3" /> Stop {playingFreq} Hz
                  </button>
                )}
              </div>
            </div>

            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_center,#1d1838_0%,#090918_45%,#030308_100%)]">
              <svg viewBox="0 0 600 600" role="img" aria-labelledby="hexacore-title hexacore-desc" className="h-full w-full">
                <title id="hexacore-title">The Hexacore Grand Orrery</title>
                <desc id="hexacore-desc">Interactive 14-layer wheel with 6 fundamental cores radiating around the Still Point.</desc>
                <defs>
                  <radialGradient id="hexacore-glow">
                    <stop offset="0%" stopColor="#facc15" stopOpacity="0.8" />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                  <filter id="core-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Concentric 14-Layer Orbital Rings */}
                {[260, 240, 220, 200, 180, 160, 140, 120, 100, 80, 60].map((radius, index) => (
                  <circle
                    key={radius}
                    cx="300"
                    cy="300"
                    r={radius}
                    fill="none"
                    stroke={index % 2 === 0 ? "#4338ca" : "#1e1e38"}
                    strokeOpacity={0.25}
                    strokeWidth={index === 0 ? 1.5 : 1}
                    strokeDasharray={index % 2 ? "3 6" : undefined}
                  />
                ))}

                {/* Spokes Connecting Cores to Still Point */}
                {HEXACORE_CORES.map((core) => {
                  const [x, y] = CORE_POSITIONS[core.id];
                  const color = CORE_COLORS[core.id];
                  const isSelected = selectedCoreId === core.id;
                  return (
                    <line
                      key={`spoke-${core.id}`}
                      x1="300"
                      y1="300"
                      x2={x}
                      y2={y}
                      stroke={color}
                      strokeOpacity={isSelected ? 0.9 : 0.25}
                      strokeWidth={isSelected ? 2.5 : 1}
                      strokeDasharray={isSelected ? undefined : "2 4"}
                    />
                  );
                })}

                {/* Center Still Point */}
                <circle cx="300" cy="300" r="54" fill="url(#hexacore-glow)" />
                <circle cx="300" cy="300" r="8" fill="#fef08a" />
                <text x="300" y="325" fill="#fde68a" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="1">
                  STILL POINT
                </text>
                <text x="300" y="338" fill="#fde68a" fillOpacity="0.7" fontSize="8" textAnchor="middle">
                  0 Hz · Singularity
                </text>

                {/* 36 Aspects orbiting around the outer rim */}
                {HEXACORE_ASPECTS.map((aspect, index) => {
                  const angle = (index / 36) * Math.PI * 2 - Math.PI / 2;
                  const x = 300 + Math.cos(angle) * 228;
                  const y = 300 + Math.sin(angle) * 228;
                  const isSelectedCoreAspect = aspect.coreId === selectedCoreId;
                  return (
                    <g key={aspect.id}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelectedCoreAspect ? 4.5 : 2.5}
                        fill={isSelectedCoreAspect ? CORE_COLORS[selectedCoreId] : "#475569"}
                        fillOpacity={isSelectedCoreAspect ? 1 : 0.6}
                      />
                    </g>
                  );
                })}

                {/* The Six Cores */}
                {HEXACORE_CORES.map((core) => {
                  const [x, y] = CORE_POSITIONS[core.id];
                  const color = CORE_COLORS[core.id];
                  const selected = selectedCoreId === core.id;
                  return (
                    <g
                      key={core.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${core.name} core`}
                      onClick={() => setSelectedCoreId(core.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") setSelectedCoreId(core.id);
                      }}
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={selected ? 48 : 40}
                        fill={color}
                        fillOpacity={selected ? 0.9 : 0.55}
                        stroke={selected ? "#ffffff" : color}
                        strokeWidth={selected ? 3 : 1.5}
                        filter={selected ? "url(#core-glow)" : undefined}
                      />
                      <text x={x} y={y - 8} fill="#fff" fontSize="12" fontWeight="800" textAnchor="middle">
                        {core.name.toUpperCase()}
                      </text>
                      <text x={x} y={y + 6} fill="#f1f5f9" fillOpacity="0.9" fontSize="10" fontWeight="600" textAnchor="middle">
                        {core.soundHz} Hz
                      </text>
                      <text x={x} y={y + 19} fill="#cbd5e1" fillOpacity="0.8" fontSize="8.5" textAnchor="middle">
                        {core.amharic}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-slate-400">
              <span>Select any core to reveal its 14-layer correspondences.</span>
              <button
                onClick={() => handlePlaySound(selectedCore.soundHz)}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-indigo-300 hover:bg-indigo-500/20"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>Play {selectedCore.soundHz} Hz Solfeggio</span>
              </button>
            </div>
          </div>

          {/* Core Deep-Dive Panel */}
          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-bold tracking-widest uppercase border"
                  style={{
                    color: CORE_COLORS[selectedCore.id],
                    borderColor: `${CORE_COLORS[selectedCore.id]}44`,
                    backgroundColor: `${CORE_COLORS[selectedCore.id]}15`,
                  }}
                >
                  Core {selectedCore.number} · {selectedCore.creationDay}
                </span>
                <span className="text-xs text-slate-400">{selectedCore.geometry} ({selectedCore.platonicSolid})</span>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-3xl font-black text-white">{selectedCore.name}</h2>
                  <span className="text-lg font-semibold text-amber-300 font-serif">{selectedCore.amharic}</span>
                </div>
                <p className="mt-2 text-xs text-indigo-300/90 font-mono italic">
                  Sanskrit: {selectedCore.sanskrit} · Hebrew: {selectedCore.hebrew} · Arabic: {selectedCore.arabic} · Greek: {selectedCore.greek}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{selectedCore.essence}</p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase">Virtue</span>
                  <span className="text-emerald-300 font-semibold">{selectedCore.virtue}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase">Gift</span>
                  <span className="text-indigo-300 font-semibold">{selectedCore.gift}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase">Shadow</span>
                  <span className="text-rose-300 font-semibold">{selectedCore.shadow}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase">Polarity</span>
                  <span className="text-amber-200 font-semibold">{selectedCore.polarity}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase">Chakra / Center</span>
                  <span className="text-sky-300 font-semibold">{selectedCore.chakra}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase">Meridian</span>
                  <span className="text-sky-300 font-semibold">{selectedCore.meridian}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase">Plant / Herb</span>
                  <span className="text-amber-300 font-semibold">{selectedCore.plant}</span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase">Planet / Metal</span>
                  <span className="text-slate-200 font-semibold">{selectedCore.planet} · {selectedCore.metal}</span>
                </div>
              </div>
            </div>

            {dayMapping && (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.05] p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Creation-Day Relational Meaning</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-200">{dayMapping.relationalMeaning}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-amber-200/80 pt-2 border-t border-amber-500/10">
                  <span>Practice: {dayMapping.practice}</span>
                  <span className="font-mono">{dayMapping.soundHz} Hz</span>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Six Aspects of {selectedCore.name}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {selectedAspects.map((aspect) => (
                  <div key={aspect.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{aspect.name}</span>
                      <span className="text-[10px] font-mono text-indigo-300">{aspect.baseFrequencyHz} Hz</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{aspect.expression}</p>
                    <div className="mt-1 flex items-center gap-1 text-[9px]">
                      <span className="text-rose-400/80">{aspect.shadow}</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-emerald-400/80">{aspect.gift}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dynamic Relationships (15 Pairs)</p>
              <div className="mt-3 space-y-2">
                {pairs.slice(0, 4).map((pair) => (
                  <div key={pair.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{pair.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2">({pair.left} + {pair.right})</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{pair.dynamic}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {pair.gift}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      )}

      {/* TAB 2: 14-LAYER MATRIX */}
      {activeTab === "layers" && (
        <section className="space-y-6">
          <div className="flex flex-wrap gap-2 pb-2">
            {[
              { num: 1, name: "Cores" },
              { num: 2, name: "Aspects" },
              { num: 3, name: "Frequencies" },
              { num: 4, name: "Archetypes" },
              { num: 5, name: "Shadows" },
              { num: 6, name: "Gifts" },
              { num: 7, name: "Correspondences" },
              { num: 8, name: "Temporal Cycles" },
              { num: 9, name: "Energetic Bodies" },
              { num: 10, name: "Collective Fields" },
              { num: 11, name: "Initiation Gates" },
              { num: 12, name: "Cosmological Realms" },
              { num: 13, name: "Creation Days" },
              { num: 14, name: "Cross-System Bridges" },
            ].map((layer) => (
              <button
                key={layer.num}
                onClick={() => setActiveLayer(layer.num)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${activeLayer === layer.num
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                    : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/5"
                  }`}
              >
                L{layer.num}: {layer.name}
              </button>
            ))}
          </div>

          {/* Layer 1: Cores */}
          {activeLayer === 1 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Layer 1: The Six Expanded Cores</h3>
              <p className="text-sm text-slate-300">The 6 primordial archetypal pillars of the universe across ancient traditions.</p>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="p-3">Core</th>
                      <th className="p-3">Ge'ez / Amharic</th>
                      <th className="p-3">Sanskrit</th>
                      <th className="p-3">Hebrew</th>
                      <th className="p-3">Arabic</th>
                      <th className="p-3">Sound</th>
                      <th className="p-3">Geometry</th>
                      <th className="p-3">Virtue</th>
                      <th className="p-3">Shadow → Gift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {HEXACORE_CORES.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-bold text-white">{c.name}</td>
                        <td className="p-3 text-amber-300 font-medium">{c.amharic}</td>
                        <td className="p-3">{c.sanskrit}</td>
                        <td className="p-3">{c.hebrew}</td>
                        <td className="p-3">{c.arabic}</td>
                        <td className="p-3 font-mono text-indigo-300">{c.soundHz} Hz</td>
                        <td className="p-3">{c.geometry}</td>
                        <td className="p-3 text-emerald-300">{c.virtue}</td>
                        <td className="p-3">
                          <span className="text-rose-300">{c.shadow}</span> → <span className="text-indigo-300">{c.gift}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Layer 2: Aspects */}
          {activeLayer === 2 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Layer 2: The 36 Aspects (6 per Core)</h3>
              <p className="text-sm text-slate-300">Each Core branches into 6 distinct psychological and spiritual modes of manifestation.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {HEXACORE_ASPECTS.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{a.id}: {a.name}</span>
                      <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] text-indigo-300 font-mono">
                        {a.baseFrequencyHz} Hz
                      </span>
                    </div>
                    <p className="text-slate-300">{a.expression}</p>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Zone: <strong className="text-slate-200">{a.bodyZone}</strong></span>
                      <div>
                        <span className="text-rose-300">{a.shadow}</span> / <span className="text-emerald-300">{a.gift}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layer 3: Frequencies */}
          {activeLayer === 3 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Layer 3: The 216 Frequencies</h3>
              <p className="text-sm text-slate-300">
                Every aspect spans 6 vibrational stages: <strong>Dormant → Awakening → Active → Radiant → Transcendent → Eternal</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {HEXACORE_FREQUENCIES.slice(0, 36).map((f) => (
                  <div key={f.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{f.name}</span>
                      <span className="text-[10px] text-indigo-300 ml-2">({f.state})</span>
                      <p className="text-[11px] text-slate-400">{f.sign}</p>
                    </div>
                    <button
                      onClick={() => handlePlaySound(f.soundHz)}
                      className="flex items-center gap-1 rounded bg-indigo-500/20 px-2 py-1 text-[10px] text-indigo-200 hover:bg-indigo-500/30"
                    >
                      <Volume2 className="h-3 w-3" /> {f.soundHz} Hz
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 text-center pt-2">Showing 36 sample active frequencies out of 216 total system states.</p>
            </div>
          )}

          {/* Layer 4: Archetypes */}
          {activeLayer === 4 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Layer 4: The 216 Named Archetypes</h3>
              <p className="text-sm text-slate-300">Personified energetic patterns acting through personal and collective psyches.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {HEXACORE_ARCHETYPES.slice(0, 36).map((arch) => (
                  <div key={arch.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{arch.name}</span>
                      <span className="text-[10px] text-slate-400">{arch.coreName}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{arch.role}</p>
                    <div className="flex items-center gap-2 text-[10px] pt-1">
                      <span className="text-rose-300">Shadow: {arch.shadow}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-emerald-300">Gift: {arch.gift}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layer 7: Correspondences */}
          {activeLayer === 7 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Layer 7: The 1,296 Correspondences</h3>
              <p className="text-sm text-slate-300">
                Cross-domain multidimensional mapping tying each archetype to a Planet, Herb, Sound Frequency, Sacred Geometry, Body Sign, and Creation Day.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {HEXACORE_CORRESPONDENCES.slice(0, 12).map((c) => (
                  <div key={c.archetypeId} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs space-y-2">
                    <span className="font-bold text-white text-sm block">{c.archetypeName}</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div><span className="text-slate-500">Planet:</span> {c.planet}</div>
                      <div><span className="text-slate-500">Herb:</span> {c.herb}</div>
                      <div><span className="text-slate-500">Sound:</span> {c.soundHz} Hz</div>
                      <div><span className="text-slate-500">Geometry:</span> {c.geometry}</div>
                      <div><span className="text-slate-500">Body Sign:</span> {c.bodySign}</div>
                      <div><span className="text-slate-500">Creation Day:</span> {c.creationDay}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layer 8: Temporal Cycles */}
          {activeLayer === 8 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Layer 8: Temporal Cycles (6 Scales × 6 Phases)</h3>
              <p className="text-sm text-slate-300">Time mapping from the daily circadian rhythm to cosmic ages and creation days.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {TEMPORAL_CYCLES.slice(0, 18).map((tc, idx) => (
                  <div key={idx} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">{tc.phase}</span>
                      <span className="text-[10px] text-indigo-300 font-mono">{tc.core} · {tc.scale}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{tc.themeOrPractice}</p>
                    <p className="text-slate-500 text-[10px]">{tc.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layer 9: Energetic Bodies */}
          {activeLayer === 9 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Layer 9: Energetic Bodies & Subtle Anatomy</h3>
              <p className="text-sm text-slate-300">The 6 subtle sheaths, chakric centers, and meridian circuits.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {ENERGETIC_BODIES.map((eb) => (
                  <div key={eb.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs space-y-2">
                    <span className="font-bold text-white text-sm block">{eb.name}</span>
                    <p className="text-slate-300 text-[11px]">{eb.function}</p>
                    <div className="pt-2 border-t border-white/5 space-y-1 text-[11px] text-slate-300">
                      <div><span className="text-slate-500">Center:</span> {eb.centerName} ({eb.chakraLocation})</div>
                      <div><span className="text-slate-500">Meridian:</span> {eb.meridian} ({eb.emotion})</div>
                      <div><span className="text-slate-500">Core:</span> {eb.core} · {eb.soundHz} Hz</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layer 11: Initiation Gates */}
          {activeLayer === 11 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Layer 11: Initiation Gates (6 Gates × 6 Trials)</h3>
              <p className="text-sm text-slate-300">Spiritual progression and ethical challenges for personal maturation.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {INITIATION_GATES.map((gate) => (
                  <div key={gate.gate} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 text-sm">{gate.gate}</span>
                      <span className="text-indigo-300 text-[10px]">{gate.core}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">Trial: {gate.trialSummary} → Reward: <strong className="text-emerald-300">{gate.reward}</strong></p>
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Six Trials</span>
                      <ol className="list-decimal list-inside space-y-0.5 text-[10.5px] text-slate-300">
                        {gate.trials.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layer 13: Creation Days */}
          {activeLayer === 13 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Layer 13: The Six Creation Days</h3>
              <p className="text-sm text-slate-300">Temporal-spiritual relational map connecting Sunday through Friday to specific spiritual acts and practices.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {CREATION_DAY_MAPPINGS.map((cd) => (
                  <div key={cd.day} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 text-base">{cd.day}</span>
                      <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-200">
                        {cd.primaryCore} + {cd.secondaryCore}
                      </span>
                    </div>
                    <p className="text-slate-300 font-semibold">{cd.creationAct}</p>
                    <p className="text-[11px] text-slate-400 italic">{cd.relationalMeaning}</p>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-300">
                      <span>Practice: {cd.practice}</span>
                      <span>Herb: {cd.herb} · {cd.soundHz} Hz</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layer 14: Cross-System Bridges & Ethiopian Herbs */}
          {activeLayer === 14 && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                <h3 className="text-xl font-bold text-white">Layer 14: Cross-System Bridges (6 Traditions)</h3>
                <p className="text-sm text-slate-300">Synthesis across TCM, Ayurveda, Unani, Ethiopian (Awde Negest), Latin American, and Western frameworks.</p>
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="p-3">Core</th>
                        <th className="p-3">TCM</th>
                        <th className="p-3">Ayurveda</th>
                        <th className="p-3">Unani</th>
                        <th className="p-3">Ethiopian</th>
                        <th className="p-3">Latin American</th>
                        <th className="p-3">Western</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {(["Power", "Humanity", "Creation", "Peace", "Spirit", "Order"] as const).map((core) => {
                        const tr = CROSS_SYSTEM_TRADITIONS[core];
                        return (
                          <tr key={core} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-bold text-white">{core}</td>
                            <td className="p-3">{tr.tcm}</td>
                            <td className="p-3">{tr.ayurveda}</td>
                            <td className="p-3">{tr.unani}</td>
                            <td className="p-3 text-amber-300 font-semibold">{tr.ethiopian}</td>
                            <td className="p-3">{tr.latinAmerican}</td>
                            <td className="p-3">{tr.western}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-3xl border border-amber-400/20 bg-amber-500/[0.04] p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="h-5 w-5" />
                  <h4 className="font-bold text-base">Ethiopian Herbal Integration & Debral Safety Profile</h4>
                </div>
                <p className="text-xs text-amber-200/80">
                  Traditional botanical correspondences are documented for cultural inquiry only. Certain herbs (such as Kosso / <em>Hagenia abyssinica</em>) pose known toxicological risks (e.g. optic nerve toxicity at high doses).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {ETHIOPIAN_HERBAL_INTEGRATION.map((herb) => (
                    <div key={herb.scientificName} className="rounded-2xl border border-white/10 bg-[#0c0c1a] p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{herb.herb}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${herb.safetyRating === "Caution"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          }`}>
                          {herb.safetyRating || "Reflective"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">{herb.scientificName}</p>
                      <div className="text-[11px] space-y-1 text-slate-300">
                        <div><span className="text-slate-500">Core:</span> {herb.core} ({herb.creationDay})</div>
                        <div><span className="text-slate-500">Preparation:</span> {herb.preparation}</div>
                        <div><span className="text-slate-500">Active:</span> {herb.activeIngredient}</div>
                        <div className="text-rose-300"><span className="text-slate-500">Precaution:</span> {herb.sideEffect}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Remaining Layers (5, 6, 10, 12 fallback) */}
          {![1, 2, 3, 4, 7, 8, 9, 11, 13, 14].includes(activeLayer) && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-xl font-bold text-white">Layer {activeLayer}</h3>
              <p className="mt-2 text-sm text-slate-300">
                {activeLayer === 5 && "Layer 5: The 216 Shadows — Wounded expressions requiring healing and integration."}
                {activeLayer === 6 && "Layer 6: The 216 Gifts — Transmuted empowered expressions serving universal harmony."}
                {activeLayer === 10 && "Layer 10: Collective Fields — Social mapping across 6 group sizes, collective shadows (War, Sterility, Dogma, Tyranny, Chaos, Corruption), and 15 dynamic pairs."}
                {activeLayer === 12 && "Layer 12: Cosmological Realms — The 6 sacred mythic spaces (Hearth, Workshop, Temple, Throne, Garden, Hall) and their sub-realms."}
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {HEXACORE_CORES.map((c) => (
                  <div key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                    <span className="font-bold text-white block">{c.name}</span>
                    <span className="text-slate-400 text-[11px] mt-1 block">
                      {activeLayer === 5 && `Shadow: ${c.shadow}`}
                      {activeLayer === 6 && `Gift: ${c.gift}`}
                      {activeLayer === 10 && `Group Size: ${c.number}`}
                      {activeLayer === 12 && `Realm: ${c.direction}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: 30-DAY JOURNAL */}
      {activeTab === "journal" && (
        <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)] items-start">
          {/* Day Navigation */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">30-Day Arcana Journey</h3>
            <div className="grid grid-cols-5 gap-1.5 max-h-[500px] overflow-y-auto pr-1">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
                const isCurrent = activeDay === d;
                const hasEntry = !!savedEntries[d];
                return (
                  <button
                    key={d}
                    onClick={() => {
                      setActiveDay(d);
                      setJournalText(savedEntries[d] || "");
                    }}
                    className={`h-11 rounded-xl font-mono text-xs font-bold transition-all relative flex flex-col items-center justify-center ${isCurrent
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                        : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]"
                      }`}
                  >
                    <span>D{d}</span>
                    {hasEntry && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-400" />}
                  </button>
                );
              })}
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400 space-y-1">
              <div>W1: Power (Days 1–7)</div>
              <div>W2: Humanity (Days 8–14)</div>
              <div>W3: Creation (Days 15–21)</div>
              <div>W4: Peace (Days 22–28)</div>
              <div>Days 29–30: Spirit & Order</div>
            </div>
          </div>

          {/* Daily Prompt & Reflection Sheet */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">
                  Day {activeDay} · {currentJournalPrompt.core} · {currentJournalPrompt.aspect}
                </span>
                <h2 className="text-2xl font-black text-white mt-1">{currentJournalPrompt.aspect} Activation</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlaySound(currentJournalPrompt.soundHz)}
                  className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300 hover:bg-indigo-500/20"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{currentJournalPrompt.soundHz} Hz</span>
                </button>
                <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
                  {currentJournalPrompt.herb}
                </span>
              </div>
            </div>

            {/* Practices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block">Morning Practice</span>
                <p className="text-slate-300 leading-relaxed">{currentJournalPrompt.morningPractice}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-sky-300 font-bold block">Midday Reflection</span>
                <p className="text-slate-300 leading-relaxed">{currentJournalPrompt.middayReflection}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-purple-300 font-bold block">Evening Practice</span>
                <p className="text-slate-300 leading-relaxed">{currentJournalPrompt.eveningPractice}</p>
              </div>
            </div>

            {/* Affirmation & Shadow Work */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.05] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-300">Daily Affirmation</span>
                <p className="text-sm font-semibold text-white mt-0.5">"{currentJournalPrompt.affirmation}"</p>
              </div>
              <div className="text-xs text-right md:text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400">Shadow Transmutation</span>
                <p className="text-xs mt-0.5">
                  <span className="text-rose-400">{currentJournalPrompt.shadow}</span>
                  <span className="text-slate-500 mx-1">→</span>
                  <span className="text-emerald-400">{currentJournalPrompt.gift}</span>
                </p>
              </div>
            </div>

            {/* Interactive Reflection Note */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Personal Journal Reflection (Saved Locally)</label>
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="Record your observations, emotional currents, and bodily sensations during today's practice..."
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveJournal}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Save Day {activeDay} Entry
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: BODY SIGN READING */}
      {activeTab === "bodysigns" && (
        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Body Sign Reading Layer</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Observational somatic reflection across Tongue zones, Palm lines, and Facial morphology.
                </p>
              </div>
              <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
                {(["tongue", "palm", "face"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setBodySignTab(t)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${bodySignTab === t ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {BODY_SIGN_ZONES[bodySignTab].map((z) => (
                <div key={z.zone} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{z.zone}</span>
                    <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300">
                      {z.core} Core
                    </span>
                  </div>
                  <div className="text-slate-300 space-y-1 text-[11px]">
                    <div><span className="text-slate-500">Sign:</span> <strong className="text-amber-200">{z.sign}</strong></div>
                    <div><span className="text-slate-500">Traditional Meaning:</span> {z.meaning}</div>
                    <div className="pt-2 border-t border-white/5 text-emerald-300">
                      <span className="text-slate-500">Holistic Remedy:</span> {z.remedy}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.05] p-4 text-xs text-amber-200/80 leading-relaxed">
              <strong>Reflective Safety Notice:</strong> Body sign readings are symbolic expressions grounded in traditional holistic systems. They are strictly observational guides for introspection and lifestyle balance, NOT medical diagnoses or pathology assessments.
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: PROFILE & NUMEROLOGY CALCULATOR */}
      {activeTab === "calculator" && (
        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Hexacore 14-Layer Profile & 6-Based Numerology Calculator</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your details to generate your comprehensive 14-layer personal chart and master numbers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={calcName}
                  onChange={(e) => setCalcName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Date of Birth (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={calcDate}
                  onChange={(e) => setCalcDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={calcConsent}
                  onChange={(e) => setCalcConsent(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-indigo-600 focus:ring-0"
                />
                <span>I consent to reflective cultural exploration</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={calcAge}
                  onChange={(e) => setCalcAge(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-indigo-600 focus:ring-0"
                />
                <span>I am 18 years of age or older (Adult age gate)</span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleCalculateProfile}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-900/40 hover:from-indigo-500 hover:to-purple-500 transition-all"
              >
                Calculate Complete 14-Layer Profile
              </button>
              <button
                onClick={() => {
                  setCalcName("Example User");
                  setCalcDate("1990-12-25");
                  setCalcConsent(true);
                  setCalcAge(true);
                  setTimeout(handleCalculateProfile, 50);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                Load Sample User (The Visionary · Core 11)
              </button>
            </div>

            {calcError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                {calcError}
              </div>
            )}

            {/* Generated Profile Display */}
            {calculatedProfile && calculatedNumerology && (
              <div className="space-y-6 pt-6 border-t border-white/10 animate-fade-in">
                {/* Numerology Summary Cards */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-300">6-Based Numerology Analysis</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                      <span className="text-slate-500 text-[10px] block uppercase">Core Number</span>
                      <span className="text-xl font-black text-amber-300">{calculatedNumerology.coreNumber}</span>
                      {calculatedNumerology.isMaster && (
                        <span className="text-[10px] text-purple-300 block font-semibold">{calculatedNumerology.masterTitle}</span>
                      )}
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                      <span className="text-slate-500 text-[10px] block uppercase">Destiny Number</span>
                      <span className="text-xl font-black text-white">{calculatedNumerology.destinyNumber}</span>
                      <span className="text-[10px] text-slate-400 block">Life purpose</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                      <span className="text-slate-500 text-[10px] block uppercase">Soul Number</span>
                      <span className="text-xl font-black text-white">{calculatedNumerology.soulNumber}</span>
                      <span className="text-[10px] text-slate-400 block">Heart desire</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                      <span className="text-slate-500 text-[10px] block uppercase">Personality Number</span>
                      <span className="text-xl font-black text-white">{calculatedNumerology.personalityNumber}</span>
                      <span className="text-[10px] text-slate-400 block">Outer expression</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                      <span className="text-slate-500 text-[10px] block uppercase">Maturity Number</span>
                      <span className="text-xl font-black text-white">{calculatedNumerology.maturityNumber}</span>
                      <span className="text-[10px] text-slate-400 block">Who you become</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                      <span className="text-slate-500 text-[10px] block uppercase">Challenge Number</span>
                      <span className="text-xl font-black text-rose-300">{calculatedNumerology.challengeNumber}</span>
                      <span className="text-[10px] text-slate-400 block">Growth edge</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                      <span className="text-slate-500 text-[10px] block uppercase">Creation Day Number</span>
                      <span className="text-xl font-black text-emerald-300">{calculatedNumerology.creationDayNumber}</span>
                      <span className="text-[10px] text-slate-400 block">Day coordinate</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                      <span className="text-slate-500 text-[10px] block uppercase">Creation Day</span>
                      <span className="text-xl font-black text-indigo-300">{calculatedProfile.creationDay}</span>
                      <span className="text-[10px] text-slate-400 block">Day of power</span>
                    </div>
                  </div>
                </div>

                {/* 14-Layer Profile Breakdown */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-300">14-Layer Chart Architecture</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <div><strong className="text-slate-400">Dominant Core:</strong> <span className="text-amber-300 font-bold">{calculatedProfile.dominantCore}</span></div>
                      <div><strong className="text-slate-400">Secondary Core:</strong> <span className="text-indigo-300 font-bold">{calculatedProfile.secondaryCore}</span></div>
                      <div><strong className="text-slate-400">Tertiary Core:</strong> <span className="text-white">{calculatedProfile.tertiaryCore}</span></div>
                      <div><strong className="text-slate-400">Dormant Core:</strong> <span className="text-slate-400">{calculatedProfile.dormantCore}</span></div>
                      <div><strong className="text-slate-400">Primary Archetype:</strong> <span className="text-emerald-300 font-bold">{calculatedProfile.archetype}</span></div>
                      <div><strong className="text-slate-400">Shadow:</strong> <span className="text-rose-300">{calculatedProfile.shadow}</span></div>
                      <div><strong className="text-slate-400">Gift:</strong> <span className="text-emerald-300">{calculatedProfile.gift}</span></div>
                    </div>
                    <div className="space-y-1.5">
                      <div><strong className="text-slate-400">Creation Day:</strong> {calculatedProfile.creationDay}</div>
                      <div><strong className="text-slate-400">Solfeggio Sound:</strong> {calculatedProfile.correspondences.soundHz} Hz</div>
                      <div><strong className="text-slate-400">Planet / Metal:</strong> {calculatedProfile.correspondences.planet} · {calculatedProfile.correspondences.metal}</div>
                      <div><strong className="text-slate-400">Sacred Geometry:</strong> {calculatedProfile.correspondences.geometry}</div>
                      <div><strong className="text-slate-400">Botanical Ally:</strong> {calculatedProfile.correspondences.plant}</div>
                      <div><strong className="text-slate-400">Cross-System TCM:</strong> {calculatedProfile.layerSummary?.layer14CrossSystem.tcm}</div>
                      <div><strong className="text-slate-400">Cross-System Ethiopian:</strong> {calculatedProfile.layerSummary?.layer14CrossSystem.ethiopian}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 text-[11px] text-slate-300 italic">
                    {calculatedProfile.creationDayMapping.relationalMeaning}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
