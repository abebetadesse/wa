"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { HerbSafetyBadge } from "@/features/safety/HerbSafetyBadge";
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
  Compass,
  Radio,
  Orbit,
  Maximize2,
  Minimize2,
  Zap,
  Sun,
  Moon,
  Waves,
  Feather,
  Atom,
  Gem,
  ArrowRight,
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

interface CoreVisualMeta {
  orbit: string;
  glow: string;
  detail: string;
  texture: string;
  glyph: string;
  emojis: string[];
  elementIcon: string;
  element: string;
  themeTitle: string;
  amharicPronounce: string;
  runeSigil: string;
  platonicSymbol: string;
  archetypeTitle: string;
  accentRgb: string;
  badgeBg: string;
  cardGradient: string;
  botanicalPreview: { name: string; localName: string; prep: string; safety: string };
}

const CORE_METADATA: Record<string, CoreVisualMeta> = {
  spirit: {
    orbit: "#8b5cf6",
    glow: "rgba(168, 85, 247, 0.45)",
    detail: "Spiritual resonance & Divine Mind",
    texture: "radial-gradient(circle at 25% 25%, rgba(196,181,253,0.95), rgba(91,33,182,0.45) 24%, rgba(15,23,42,0.96) 60%)",
    glyph: "✦",
    emojis: ["✦", "🌌", "👑", "🪷", "👁️"],
    elementIcon: "🌌",
    element: "Cosmic Ether & Starlight",
    themeTitle: "Transcendence, Unity & The Divine Singularity",
    amharicPronounce: "Menfes (መንፈስ)",
    runeSigil: "፯",
    platonicSymbol: "✨ Star Tetrahedron / Merkaba",
    archetypeTitle: "The Transcendent Sovereign",
    accentRgb: "147, 112, 219",
    badgeBg: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    cardGradient: "linear-gradient(135deg, rgba(88,28,135,0.4) 0%, rgba(15,23,42,0.85) 100%)",
    botanicalPreview: { name: "Frankincense / Lubanj", localName: "ዕጣን (Itan)", prep: "Aromatic Resin Fumigation", safety: "Safe" },
  },
  power: {
    orbit: "#fb7185",
    glow: "rgba(251, 113, 133, 0.45)",
    detail: "Vital force & Sovereign Will",
    texture: "radial-gradient(circle at 30% 30%, rgba(254,205,211,0.95), rgba(190,24,93,0.45) 26%, rgba(17,24,39,0.96) 62%)",
    glyph: "⚡",
    emojis: ["⚡", "🦁", "🌋", "🔥", "🛡️"],
    elementIcon: "🔥",
    element: "Primordial Fire & Dynamic Will",
    themeTitle: "Courage, Sovereignty & Directing Force",
    amharicPronounce: "Hayil (ኃይል)",
    runeSigil: "፩",
    platonicSymbol: "🔺 Sacred Tetrahedron",
    archetypeTitle: "The Sovereign Lion of Judah",
    accentRgb: "255, 99, 71",
    badgeBg: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    cardGradient: "linear-gradient(135deg, rgba(159,18,57,0.4) 0%, rgba(15,23,42,0.85) 100%)",
    botanicalPreview: { name: "Kosso / Hagenia", localName: "ኮሶ (Kosso)", prep: "Traditional Infusion (Reflective)", safety: "Caution" },
  },
  humanity: {
    orbit: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.45)",
    detail: "Relational field & Empathic Web",
    texture: "radial-gradient(circle at 30% 35%, rgba(191,219,254,0.95), rgba(37,99,235,0.45) 29%, rgba(15,23,42,0.96) 64%)",
    glyph: "◎",
    emojis: ["◎", "🌊", "🤝", "🌿", "🌍"],
    elementIcon: "🌊",
    element: "Living Waters & Relational Kinship",
    themeTitle: "Compassion, Empathic Resonance & Community",
    amharicPronounce: "Seb'awinet (ሰብዓዊነት)",
    runeSigil: "፪",
    platonicSymbol: "💧 Icosahedron of Flow",
    archetypeTitle: "The Compassionate Guardian",
    accentRgb: "65, 105, 225",
    badgeBg: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    cardGradient: "linear-gradient(135deg, rgba(30,58,138,0.4) 0%, rgba(15,23,42,0.85) 100%)",
    botanicalPreview: { name: "Tenadam / Rue", localName: "ጤና አዳም (Tena Adam)", prep: "Fresh Leaf with Coffee / Tea", safety: "Safe" },
  },
  peace: {
    orbit: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.45)",
    detail: "Harmonic balance & Golden Rest",
    texture: "radial-gradient(circle at 38% 30%, rgba(254,240,138,0.95), rgba(217,119,6,0.45) 24%, rgba(12,18,31,0.96) 62%)",
    glyph: "☼",
    emojis: ["☼", "🕊️", "⚖️", "🌾", "✨"],
    elementIcon: "🕊️",
    element: "Radiant Light & Golden Equinox",
    themeTitle: "Harmonic Silence, Rest & Serenity",
    amharicPronounce: "Selam (ሰላም)",
    runeSigil: "፬",
    platonicSymbol: "⚖️ Octahedron of Equilibrium",
    archetypeTitle: "The Serene Peacemaker",
    accentRgb: "218, 165, 32",
    badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    cardGradient: "linear-gradient(135deg, rgba(146,64,14,0.4) 0%, rgba(15,23,42,0.85) 100%)",
    botanicalPreview: { name: "Myrrh / Karbe", localName: "ከርቤ (Karbe)", prep: "Purifying Tincture & Inhalation", safety: "Safe" },
  },
  creation: {
    orbit: "#4ade80",
    glow: "rgba(74, 222, 128, 0.45)",
    detail: "Generative flow & Genesis",
    texture: "radial-gradient(circle at 35% 28%, rgba(187,247,208,0.95), rgba(34,197,94,0.43) 25%, rgba(15,23,42,0.96) 66%)",
    glyph: "✧",
    emojis: ["✧", "🌱", "🌀", "🧬", "🍯"],
    elementIcon: "🌱",
    element: "Generative Earth & Living Sprout",
    themeTitle: "Boundless Flow, Artistry & Genesis",
    amharicPronounce: "Fitret (ፍጥረት)",
    runeSigil: "፫",
    platonicSymbol: "🌀 Dodecahedron of Life",
    archetypeTitle: "The Generative Weaver",
    accentRgb: "50, 205, 50",
    badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    cardGradient: "linear-gradient(135deg, rgba(6,95,70,0.4) 0%, rgba(15,23,42,0.85) 100%)",
    botanicalPreview: { name: "Damakese / Ocimum", localName: "ደማከሴ (Damakese)", prep: "Crushed Foliage Inhalation", safety: "Safe" },
  },
  order: {
    orbit: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.45)",
    detail: "Structure, timing & Precision",
    texture: "radial-gradient(circle at 35% 30%, rgba(165,243,252,0.95), rgba(6,182,212,0.45) 24%, rgba(15,23,42,0.96) 64%)",
    glyph: "◈",
    emojis: ["◈", "🏛️", "📐", "💎", "⚖️"],
    elementIcon: "📐",
    element: "Sacred Matrix & Crystal Rhythm",
    themeTitle: "Architecture, Right Timing & Truth",
    amharicPronounce: "Sir'at (ሥርዓት)",
    runeSigil: "፮",
    platonicSymbol: "🧊 Crystalline Cube of Truth",
    archetypeTitle: "The Cosmic Architect",
    accentRgb: "0, 206, 209",
    badgeBg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    cardGradient: "linear-gradient(135deg, rgba(21,94,117,0.4) 0%, rgba(15,23,42,0.85) 100%)",
    botanicalPreview: { name: "Gesho / Rhamnus", localName: "ጌሾ (Gesho)", prep: "Fermentation Catalyst & Decoction", safety: "Safe" },
  },
};

const COSMIC_PARTICLES = [
  { x: 12, y: 18, size: 2, delay: "0s", duration: "4s", color: "#a855f7" },
  { x: 28, y: 82, size: 3, delay: "1.2s", duration: "5.5s", color: "#38bdf8" },
  { x: 45, y: 12, size: 2.5, delay: "0.7s", duration: "6s", color: "#fbbf24" },
  { x: 68, y: 22, size: 1.5, delay: "2.1s", duration: "4.5s", color: "#4ade80" },
  { x: 88, y: 40, size: 2, delay: "1.5s", duration: "7s", color: "#fb7185" },
  { x: 82, y: 78, size: 3, delay: "0.3s", duration: "5s", color: "#818cf8" },
  { x: 15, y: 65, size: 2, delay: "2.5s", duration: "6.2s", color: "#22d3ee" },
  { x: 55, y: 90, size: 2.5, delay: "1.8s", duration: "4.8s", color: "#facc15" },
  { x: 38, y: 48, size: 1.5, delay: "3.1s", duration: "5.8s", color: "#c084fc" },
  { x: 74, y: 60, size: 2, delay: "0.9s", duration: "6.5s", color: "#f43f5e" },
  { x: 92, y: 15, size: 1.5, delay: "2.8s", duration: "5.2s", color: "#34d399" },
  { x: 8, y: 38, size: 2.5, delay: "1.1s", duration: "6.7s", color: "#60a5fa" },
  { x: 48, y: 72, size: 2, delay: "2.3s", duration: "4.2s", color: "#e879f9" },
  { x: 62, y: 35, size: 1.5, delay: "0.5s", duration: "5.5s", color: "#fde047" },
  { x: 22, y: 28, size: 2, delay: "1.9s", duration: "7.2s", color: "#a78bfa" },
  { x: 78, y: 92, size: 2.5, delay: "2.7s", duration: "6.1s", color: "#38bdf8" },
  { x: 32, y: 62, size: 1.5, delay: "0.8s", duration: "5.9s", color: "#4ade80" },
  { x: 85, y: 55, size: 2, delay: "1.4s", duration: "4.6s", color: "#fb7185" },
  { x: 5, y: 88, size: 2, delay: "2.0s", duration: "6.8s", color: "#fbbf24" },
  { x: 50, y: 25, size: 2.5, delay: "0.2s", duration: "5.1s", color: "#818cf8" },
];

const VIBRATIONAL_OCTAVES = [
  { state: "Dormant", emoji: "💤", title: "Latent Seed", desc: "Unmanifest potential resting in the subconscious root.", octaveHzMult: 0.5 },
  { state: "Awakening", emoji: "🌱", title: "Stirring Dawn", desc: "First movement of awareness breaking through inertia.", octaveHzMult: 0.75 },
  { state: "Active", emoji: "⚡", title: "Kinetic Pulse", desc: "Direct energetic manifestation in conscious action.", octaveHzMult: 1.0 },
  { state: "Radiant", emoji: "🌟", title: "Luminous Emission", desc: "Effortless illumination bathing surrounding fields.", octaveHzMult: 1.25 },
  { state: "Transcendent", emoji: "🌌", title: "Meta-Conscious", desc: "Integration beyond dualistic subject-object bounds.", octaveHzMult: 1.5 },
  { state: "Eternal", emoji: "♾️", title: "Singularity", desc: "Timeless resonance merged in the Still Point of origin.", octaveHzMult: 2.0 },
] as const;

const SACRED_HEXAGRAM_LINES: Array<[string, string]> = [
  ["spirit", "humanity"],
  ["humanity", "creation"],
  ["creation", "spirit"],
  ["power", "peace"],
  ["peace", "order"],
  ["order", "power"],
  ["spirit", "peace"],
  ["power", "creation"],
  ["humanity", "order"],
];

function coreById(id: string) {
  return HEXACORE_CORES.find((core) => core.id === id) ?? HEXACORE_CORES[0];
}

// Celestial Harmonic Web Audio Solfeggio Synthesizer
class SolfeggioSynth {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private oscHarmonic: OscillatorNode | null = null;
  private gain: GainNode | null = null;

  play(freq: number) {
    this.stop();
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.osc = this.ctx.createOscillator();
      this.oscHarmonic = this.ctx.createOscillator();
      this.gain = this.ctx.createGain();

      this.osc.type = "sine";
      this.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      this.oscHarmonic.type = "sine";
      this.oscHarmonic.frequency.setValueAtTime(freq * 1.5, this.ctx.currentTime);

      const harmonicGain = this.ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.gain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 0.4);

      this.osc.connect(this.gain);
      this.oscHarmonic.connect(harmonicGain);
      harmonicGain.connect(this.gain);
      this.gain.connect(this.ctx.destination);

      this.osc.start();
      this.oscHarmonic.start();
    } catch {
      // Audio policy or not supported
    }
  }

  stop() {
    if (this.gain && this.ctx) {
      try {
        this.gain.gain.setValueAtTime(this.gain.gain.value, this.ctx.currentTime);
        this.gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);
        setTimeout(() => {
          this.osc?.stop();
          this.oscHarmonic?.stop();
          this.osc?.disconnect();
          this.oscHarmonic?.disconnect();
          this.ctx?.close();
          this.osc = null;
          this.oscHarmonic = null;
          this.gain = null;
          this.ctx = null;
        }, 300);
      } catch {
        this.osc = null;
        this.oscHarmonic = null;
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
  const [orreryViewMode, setOrreryViewMode] = useState<"system" | "theatrical">("system");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeOctave, setActiveOctave] = useState<string>("Active");
  const [activeLayer, setActiveLayer] = useState<number>(1);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [bodySignTab, setBodySignTab] = useState<"tongue" | "palm" | "face">("tongue");
  const [playingFreq, setPlayingFreq] = useState<number | null>(null);

  // Profile Calculator State
  const [calcName, setCalcName] = useState("");
  const [calcDate, setCalcDate] = useState("");
  const [calcConsent, setCalcConsent] = useState(false);
  const [calcAge, setCalcAge] = useState(false);
  const [calculatedProfile, setCalculatedProfile] = useState<HexacoreProfile | null>(null);
  const [calculatedNumerology, setCalculatedNumerology] = useState<HexacoreNumerology | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Journal Entry persistence
  const [journalText, setJournalText] = useState("");
  const [savedEntries, setSavedEntries] = useState<Record<number, string>>({});
  const [journalStatus, setJournalStatus] = useState<"idle" | "loading" | "saving" | "saved" | "local" | "error">("idle");

  useEffect(() => {
    let cancelled = false;

    try {
      const saved = localStorage.getItem("hexacore_journal_entries");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedEntries(parsed);
        if (parsed[activeDay]) setJournalText(parsed[activeDay]);
      }
    } catch {
      setJournalStatus("local");
    }

    const loadJournal = async () => {
      setJournalStatus("loading");
      try {
        const response = await fetch("/api/hexacore/journal");
        if (!response.ok) {
          if (response.status === 401) {
            setJournalStatus("local");
            return;
          }
          throw new Error("Unable to load saved reflections.");
        }
        const payload = await response.json() as {
          success?: boolean;
          data?: Array<{ response?: string | null; selectedCore?: string | null; selectedAspect?: string | null }>;
        };
        if (!payload.success || !Array.isArray(payload.data)) throw new Error("Invalid journal response.");

        const serverEntries: Record<number, string> = {};
        for (const entry of payload.data) {
          if (!entry.response || !entry.selectedCore || !entry.selectedAspect) continue;
          for (let day = 1; day <= 30; day += 1) {
            const prompt = getJournalPromptForDay(day);
            const core = HEXACORE_CORES.find(
              (candidate) => candidate.id.slice(0, 1).toUpperCase() === entry.selectedCore,
            )?.name;
            const aspect = HEXACORE_ASPECTS.find(
              (candidate) => candidate.coreName === prompt.core && candidate.name === prompt.aspect,
            );
            const aspectMatches =
              entry.selectedAspect === aspect?.id ||
              entry.selectedAspect === prompt.aspect;
            if (prompt.core === core && aspectMatches) {
              serverEntries[day] = entry.response;
              break;
            }
          }
        }
        if (cancelled) return;
        setSavedEntries((current) => ({ ...current, ...serverEntries }));
        if (serverEntries[activeDay]) setJournalText(serverEntries[activeDay]);
        setJournalStatus("saved");
      } catch (error) {
        if (cancelled) return;
        console.error("Hexacore journal load failed:", error);
        setJournalStatus("local");
      }
    };

    void loadJournal();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (savedEntries[activeDay] !== undefined) setJournalText(savedEntries[activeDay]);
  }, [activeDay, savedEntries]);

  useEffect(() => {
    if (!isFocusMode) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFocusMode(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFocusMode]);

  const handleSaveJournal = async () => {
    const response = journalText.trim();
    if (response.length < 3) {
      setJournalStatus("error");
      return;
    }
    const updated = { ...savedEntries, [activeDay]: journalText };
    setSavedEntries(updated);
    try {
      localStorage.setItem("hexacore_journal_entries", JSON.stringify(updated));
    } catch {
      setJournalStatus("local");
    }

    setJournalStatus("saving");
    const prompt = getJournalPromptForDay(activeDay);
    const selectedCore = HEXACORE_CORES.find((core) => core.name === prompt.core);
    const selectedAspect = HEXACORE_ASPECTS.find(
      (aspect) => aspect.coreName === prompt.core && aspect.name === prompt.aspect,
    );

    try {
      const serverResponse = await fetch("/api/hexacore/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedCore: selectedCore?.id.slice(0, 1).toUpperCase(),
          selectedAspect: selectedAspect?.id,
          prompt: prompt.middayReflection,
          response,
          practiceCompleted: [],
        }),
      });
      if (!serverResponse.ok) {
        if (serverResponse.status === 401) {
          setJournalStatus("local");
          return;
        }
        throw new Error("Unable to save reflection.");
      }
      setJournalStatus("saved");
    } catch (error) {
      console.error("Hexacore journal save failed:", error);
      setJournalStatus("local");
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

  const calculateProfile = useCallback((name: string, date: string, consent: boolean, ageVerified: boolean) => {
    try {
      if (!date) throw new Error("Enter a date of birth to calculate a profile.");
      if (!consent) throw new Error("Consent is required for reflective cultural content.");
      if (!ageVerified) throw new Error("Confirm that you are 18 or older to continue.");
      const parsedDate = new Date(`${date}T00:00:00Z`);
      const today = new Date();
      let age = today.getUTCFullYear() - parsedDate.getUTCFullYear();
      const birthdayHasPassed =
        today.getUTCMonth() > parsedDate.getUTCMonth() ||
        (today.getUTCMonth() === parsedDate.getUTCMonth() && today.getUTCDate() >= parsedDate.getUTCDate());
      if (!birthdayHasPassed) age -= 1;
      if (age < 18) throw new Error("Hexacore profile calculations are available to adults aged 18 or older.");

      const profile = buildHexacoreProfile(date, consent, ageVerified, name.trim() || "Seeker");
      const numerology = calculate6BasedNumerology(date, name.trim() || "Seeker");
      setCalculatedProfile(profile);
      setCalculatedNumerology(numerology);
      setCalcError(null);
    } catch (error) {
      setCalculatedProfile(null);
      setCalculatedNumerology(null);
      setCalcError(error instanceof Error ? error.message : "Profile calculation failed.");
    }
  }, []);

  const handleCalculateProfile = () => calculateProfile(calcName, calcDate, calcConsent, calcAge);

  const selectedCore = coreById(selectedCoreId);
  const selectedMeta = CORE_METADATA[selectedCoreId];
  const selectedAspects = useMemo(
    () => HEXACORE_ASPECTS.filter((aspect) => aspect.coreId === selectedCoreId),
    [selectedCoreId]
  );
  const selectedAspectIds = useMemo(() => new Set(selectedAspects.map((aspect) => aspect.id)), [selectedAspects]);
  const selectedFrequencies = HEXACORE_FREQUENCIES.filter((frequency) => selectedAspectIds.has(frequency.aspectId));
  const selectedArchetypes = HEXACORE_ARCHETYPES.filter((archetype) => archetype.coreName === selectedCore.name);
  const selectedCorrespondences = HEXACORE_CORRESPONDENCES.filter((correspondence) =>
    [...selectedAspectIds].some((aspectId) => correspondence.archetypeId.startsWith(`${aspectId}.`))
  );
  const currentJournalPrompt = useMemo(() => getJournalPromptForDay(activeDay), [activeDay]);
  const dayMapping = CREATION_DAY_MAPPINGS.find((m) => m.day === selectedCore.creationDay);
  const pairs = HEXACORE_PAIRS.filter((p) => p.left === selectedCore.name || p.right === selectedCore.name);
  const currentBotanical = ETHIOPIAN_HERBAL_INTEGRATION.find((h) => h.core === selectedCore.name);

  const selectedOctaveMeta = VIBRATIONAL_OCTAVES.find((o) => o.state === activeOctave) ?? VIBRATIONAL_OCTAVES[2];
  const calculatedOctaveHz = Math.round(selectedCore.soundHz * selectedOctaveMeta.octaveHzMult);
  const selectedRealm = COSMOLOGICAL_REALMS.find((realm) => realm.core === selectedCore.name);
  const selectedArchetype = selectedArchetypes[0];
  const cinematicMetrics = [
    { icon: selectedMeta.glyph, label: "Resonance", value: `${calculatedOctaveHz} Hz · ${activeOctave}`, hint: selectedOctaveMeta.title },
    { icon: "🌌", label: "Realm", value: selectedRealm?.realm ?? "No mapped realm", hint: selectedRealm?.gateway ?? selectedCore.direction },
    { icon: "✦", label: "Virtue", value: selectedCore.virtue, hint: `Gift: ${selectedCore.gift}` },
    { icon: "◎", label: "Archetype", value: selectedArchetype?.name ?? selectedMeta.archetypeTitle, hint: selectedArchetype?.role ?? selectedMeta.detail },
  ];

  useEffect(() => {
    if (!calcConsent || !calcAge || !calcDate) {
      setCalculatedProfile(null);
      setCalculatedNumerology(null);
      setCalcError(null);
      return;
    }
    calculateProfile(calcName, calcDate, calcConsent, calcAge);
  }, [calcName, calcDate, calcConsent, calcAge, calculateProfile]);

  return (
    <div className="relative space-y-8">
      {/* Scoped Keyframes for Cosmic Dashboard Motions */}
      <style jsx>{`
        @keyframes cosmicSpinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes cosmicSpinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50% { transform: translateY(-12px) translateX(8px); opacity: 0.85; }
        }
        @keyframes soundwaveAnim {
          0%, 100% { height: 6px; }
          50% { height: 26px; }
        }
        @keyframes pulseGlowRing {
          0% { transform: scale(0.96); opacity: 0.4; }
          50% { transform: scale(1.04); opacity: 0.85; }
          100% { transform: scale(0.96); opacity: 0.4; }
        }
        @keyframes rippleSvg {
          0% { r: 42; opacity: 0.9; stroke-width: 2.5; }
          100% { r: 76; opacity: 0; stroke-width: 0.5; }
        }
        @keyframes spotlightBreathe {
          0%, 100% { transform: scale(0.96); opacity: 0.45; }
          50% { transform: scale(1.04); opacity: 0.9; }
        }
        @keyframes orbitSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes telemetryRise {
          from { transform: translateY(8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

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
                  ? "bg-gradient-to-r from-indigo-500/25 to-purple-500/25 text-indigo-200 border border-indigo-500/40 shadow-lg shadow-indigo-950/40 scale-[1.02]"
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
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px] items-start">
          <div className="space-y-6">
            {/* Main Interactive Cosmic Arena */}
            <div
              className={`relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-[#060614] p-4 md:p-6 shadow-2xl shadow-indigo-950/40 transition-all duration-700 ${
                isFocusMode
                  ? "fixed inset-3 z-[60] overflow-y-auto md:inset-6 lg:inset-10"
                  : ""
              }`}
            >
              {isFocusMode && (
                <div
                  className="pointer-events-none fixed inset-0 -z-10 bg-slate-950/80 backdrop-blur-md"
                  aria-hidden="true"
                />
              )}
              {/* Background Ambient Cosmic Particle Constellation */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {COSMIC_PARTICLES.map((p, idx) => (
                  <span
                    key={idx}
                    className="absolute rounded-full"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      backgroundColor: p.color,
                      boxShadow: `0 0 10px ${p.color}`,
                      animation: `particleFloat ${p.duration} ease-in-out infinite`,
                      animationDelay: p.delay,
                    }}
                  />
                ))}
                <div
                  className="absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl transition-all duration-1000"
                  style={{ background: CORE_COLORS[selectedCoreId] }}
                />
                <div
                  className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl transition-all duration-1000"
                  style={{ background: selectedMeta.orbit }}
                />
              </div>

              {/* Header Bar with View Mode Toggle & Audio Trigger */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-2 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-indigo-300/90">
                      14-Layer Cosmic Orrery
                    </span>
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[9px] font-mono text-indigo-200">
                      {selectedMeta.runeSigil} · Core {selectedCore.number}
                    </span>
                  </div>
                  <h2 className="mt-0.5 text-xl md:text-2xl font-black text-white tracking-tight">
                    {selectedCore.name} · {selectedMeta.amharicPronounce}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Switcher */}
                  <div className="flex rounded-xl border border-white/10 bg-black/40 p-1">
                    <button
                      type="button"
                      onClick={() => setOrreryViewMode("system")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        orreryViewMode === "system"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/40"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Orbit className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Orrery System</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrreryViewMode("theatrical")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        orreryViewMode === "theatrical"
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/40"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Theatrical Focus</span>
                    </button>
                  </div>

                  {playingFreq ? (
                    <button
                      onClick={() => handlePlaySound(playingFreq)}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-xs text-rose-200 animate-pulse transition-all shadow-lg shadow-rose-950/30"
                    >
                      <VolumeX className="h-3.5 w-3.5" />
                      <span>Stop {playingFreq} Hz</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlaySound(selectedCore.soundHz)}
                      className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300 hover:bg-indigo-500/20 transition-all"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>{selectedCore.soundHz} Hz</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsFocusMode((current) => !current)}
                    aria-pressed={isFocusMode}
                    aria-label={isFocusMode ? "Exit Hexacore focus mode" : "Enter Hexacore focus mode"}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                      isFocusMode
                        ? "border-amber-300/50 bg-amber-300/15 text-amber-100 shadow-lg shadow-amber-950/30"
                        : "border-white/10 bg-black/30 text-slate-300 hover:border-indigo-400/40 hover:text-white"
                    }`}
                  >
                    {isFocusMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{isFocusMode ? "Exit focus" : "Focus mode"}</span>
                  </button>
                </div>
              </div>

              {/* VIEW 1: GRAND ORRERY SYSTEM WHEEL */}
              {orreryViewMode === "system" && (
                <div className="relative z-10 pt-4">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_center,#1a1538_0%,#090918_45%,#020208_100%)] shadow-inner">
                    <svg viewBox="0 0 600 600" role="img" aria-labelledby="hexacore-title hexacore-desc" className="h-full w-full">
                      <title id="hexacore-title">The Hexacore Grand Orrery</title>
                      <desc id="hexacore-desc">Interactive 14-layer wheel with 6 fundamental cores radiating around the Still Point.</desc>
                      <defs>
                        <radialGradient id="hexacore-glow">
                          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                          <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                        </radialGradient>
                        <filter id="core-glow-filter" x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="8" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Concentric Alignment Orbit Rings */}
                      {[270, 245, 220, 195, 170, 145, 120, 95, 70].map((radius, index) => (
                        <circle
                          key={radius}
                          cx="300"
                          cy="300"
                          r={radius}
                          fill="none"
                          stroke={index % 2 === 0 ? "#6366f1" : "#312e81"}
                          strokeOpacity={index === 0 ? 0.35 : 0.18}
                          strokeWidth={index === 0 ? 1.5 : 1}
                          strokeDasharray={index % 2 ? "4 8" : undefined}
                          style={
                            index === 0
                              ? { animation: "cosmicSpinSlow 90s linear infinite", transformOrigin: "300px 300px" }
                              : index === 2
                              ? { animation: "cosmicSpinReverse 60s linear infinite", transformOrigin: "300px 300px" }
                              : undefined
                          }
                        />
                      ))}

                      {/* Sacred Hexagram Geometric Chord Mesh */}
                      {SACRED_HEXAGRAM_LINES.map(([fromId, toId], idx) => {
                        const [x1, y1] = CORE_POSITIONS[fromId];
                        const [x2, y2] = CORE_POSITIONS[toId];
                        const isConnectedToSelected = fromId === selectedCoreId || toId === selectedCoreId;
                        return (
                          <line
                            key={`chord-${idx}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={isConnectedToSelected ? CORE_COLORS[selectedCoreId] : "#475569"}
                            strokeOpacity={isConnectedToSelected ? 0.7 : 0.14}
                            strokeWidth={isConnectedToSelected ? 1.8 : 0.8}
                            strokeDasharray={isConnectedToSelected ? undefined : "3 6"}
                          />
                        );
                      })}

                      {/* Central Still Point Spokes */}
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
                            strokeOpacity={isSelected ? 0.95 : 0.25}
                            strokeWidth={isSelected ? 2.5 : 1}
                            strokeDasharray={isSelected ? undefined : "2 5"}
                          />
                        );
                      })}

                      {/* The Central Still Point (0 Hz Singularity) */}
                      <circle cx="300" cy="300" r="62" fill="url(#hexacore-glow)" />
                      <circle
                        cx="300"
                        cy="300"
                        r="76"
                        fill="none"
                        stroke="#facc15"
                        strokeOpacity="0.3"
                        strokeWidth="1"
                        strokeDasharray="4 6"
                        style={{ animation: "cosmicSpinReverse 40s linear infinite", transformOrigin: "300px 300px" }}
                      />
                      <circle cx="300" cy="300" r="10" fill="#fef08a" filter="url(#core-glow-filter)" />
                      <text x="300" y="326" fill="#fde68a" fontSize="10.5" fontWeight="800" textAnchor="middle" letterSpacing="1.2">
                        STILL POINT
                      </text>
                      <text x="300" y="339" fill="#fde68a" fillOpacity="0.8" fontSize="8" textAnchor="middle">
                        0 Hz · Singularity
                      </text>

                      {/* 36 Aspects Outer Constellation Points */}
                      {HEXACORE_ASPECTS.map((aspect, index) => {
                        const angle = (index / 36) * Math.PI * 2 - Math.PI / 2;
                        const x = 300 + Math.cos(angle) * 230;
                        const y = 300 + Math.sin(angle) * 230;
                        const isSelectedCoreAspect = aspect.coreId === selectedCoreId;
                        return (
                          <g key={aspect.id}>
                            <circle
                              cx={x}
                              cy={y}
                              r={isSelectedCoreAspect ? 4.5 : 2.5}
                              fill={isSelectedCoreAspect ? CORE_COLORS[selectedCoreId] : "#64748b"}
                              fillOpacity={isSelectedCoreAspect ? 1 : 0.55}
                              filter={isSelectedCoreAspect ? "url(#core-glow-filter)" : undefined}
                            />
                          </g>
                        );
                      })}

                      {/* Active Core Expanding Pulse Waves */}
                      {(() => {
                        const [selX, selY] = CORE_POSITIONS[selectedCoreId];
                        return (
                          <g>
                            <circle
                              cx={selX}
                              cy={selY}
                              r="56"
                              fill="none"
                              stroke={CORE_COLORS[selectedCoreId]}
                              strokeWidth="1.5"
                              strokeOpacity="0.4"
                              strokeDasharray="4 4"
                              style={{ animation: "cosmicSpinSlow 16s linear infinite", transformOrigin: `${selX}px ${selY}px` }}
                            />
                            <circle
                              cx={selX}
                              cy={selY}
                              r="64"
                              fill="none"
                              stroke={CORE_COLORS[selectedCoreId]}
                              strokeWidth="1"
                              strokeOpacity="0.25"
                            />
                          </g>
                        );
                      })()}

                      {/* The Six Fundamental Cores */}
                      {HEXACORE_CORES.map((core) => {
                        const [x, y] = CORE_POSITIONS[core.id];
                        const color = CORE_COLORS[core.id];
                        const selected = selectedCoreId === core.id;
                        const meta = CORE_METADATA[core.id];
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
                            className="cursor-pointer transition-transform duration-300 hover:scale-110"
                          >
                            <circle
                              cx={x}
                              cy={y}
                              r={selected ? 48 : 39}
                              fill={color}
                              fillOpacity={selected ? 0.95 : 0.6}
                              stroke={selected ? "#ffffff" : color}
                              strokeWidth={selected ? 3 : 1.5}
                              filter={selected ? "url(#core-glow-filter)" : undefined}
                            />
                            <text x={x} y={y - 9} fill="#fff" fontSize="12" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
                              {core.name.toUpperCase()}
                            </text>
                            <text x={x} y={y + 6} fill="#f8fafc" fillOpacity="0.95" fontSize="10" fontWeight="700" textAnchor="middle">
                              {core.soundHz} Hz
                            </text>
                            <text x={x} y={y + 20} fill="#fde047" fillOpacity="0.95" fontSize="8.5" fontWeight="700" textAnchor="middle">
                              {core.amharic}
                            </text>
                            {/* Glyph Icon */}
                            <text x={x + (selected ? 30 : 25)} y={y - (selected ? 28 : 22)} fontSize="14" fill="#ffffff">
                              {meta.glyph}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}

              {/* VIEW 2: THEATRICAL FOCUS CHAMBER (DEEP DIVE PORTAL) */}
              {orreryViewMode === "theatrical" && (
                <div className="relative z-10 pt-4 space-y-6 animate-fade-in">
                  <div
                    className="relative overflow-hidden rounded-2xl border border-white/10 p-6 md:p-8"
                    style={{ background: selectedMeta.texture }}
                  >
                    {/* Rotating Astrolabe Rings & Central Cosmic Sigil */}
                    <div className="relative flex flex-col items-center justify-center py-6 text-center">
                      <div className="relative flex h-64 w-64 md:h-72 md:w-72 items-center justify-center">
                        {/* Outer Celestial Astrolabe Ring */}
                        <div
                          className="absolute inset-0 rounded-full border-2 border-dashed"
                          style={{
                            borderColor: `${CORE_COLORS[selectedCoreId]}77`,
                            animation: "cosmicSpinSlow 45s linear infinite",
                          }}
                        />
                        {/* Middle Counter-Rotating Astrolabe Ring */}
                        <div
                          className="absolute inset-4 rounded-full border border-dotted"
                          style={{
                            borderColor: `${CORE_COLORS[selectedCoreId]}99`,
                            animation: "cosmicSpinReverse 35s linear infinite",
                          }}
                        />
                        {/* Inner Halo Ring */}
                        <div
                          className="absolute inset-8 rounded-full border border-white/20"
                          style={{
                            boxShadow: `0 0 45px ${selectedMeta.glow}`,
                          }}
                        />

                        {/* Central Luminous Core Orb */}
                        <div
                          className="relative flex h-36 w-36 md:h-40 md:w-40 flex-col items-center justify-center rounded-full border-2 border-white/90 shadow-2xl transition-all duration-700"
                          style={{
                            background: `radial-gradient(circle at 30% 30%, ${CORE_COLORS[selectedCoreId]}, #050510)`,
                            boxShadow: `0 0 50px ${selectedMeta.glow}`,
                          }}
                        >
                          <span className="text-3xl md:text-4xl drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">
                            {selectedMeta.emojis[0]}
                          </span>
                          <span className="mt-1 text-base font-black tracking-widest text-white">
                            {selectedCore.name.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-amber-200">
                            {selectedCore.amharic}
                          </span>
                          <span className="mt-0.5 font-mono text-[10px] text-white/80">
                            {selectedCore.soundHz} Hz
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 max-w-lg">
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                          {selectedMeta.archetypeTitle}
                        </span>
                        <h3 className="mt-2 text-2xl font-black text-white">
                          {selectedMeta.themeTitle}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-slate-200">
                          {selectedCore.essence}
                        </p>
                      </div>

                      {/* Live Harmonic Soundwave Visualizer */}
                      <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-6 py-3.5 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Radio className="h-4 w-4 text-indigo-400" />
                          <span className="font-semibold">Harmonic Oscillation Analyzer:</span>
                          <span className="font-mono text-amber-300">{selectedCore.soundHz} Hz</span>
                        </div>
                        <div className="flex items-end gap-1.5 h-8 px-2">
                          {Array.from({ length: 18 }).map((_, barIdx) => (
                            <div
                              key={barIdx}
                              className="w-1.5 rounded-full transition-all duration-300"
                              style={{
                                height: playingFreq ? `${10 + Math.sin(barIdx * 0.7) * 16}px` : "6px",
                                backgroundColor: CORE_COLORS[selectedCoreId],
                                opacity: playingFreq ? 0.9 : 0.35,
                                animation: playingFreq ? `soundwaveAnim 0.7s ease-in-out infinite alternate` : undefined,
                                animationDelay: `${barIdx * 45}ms`,
                              }}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => handlePlaySound(selectedCore.soundHz)}
                          className="mt-1 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-all"
                        >
                          {playingFreq === selectedCore.soundHz ? (
                            <>
                              <VolumeX className="h-3.5 w-3.5 text-rose-300" /> Stop Soundwave
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3.5 w-3.5 text-emerald-300" /> Resonate {selectedCore.soundHz} Hz Solfeggio
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quad-Pillar Alchemical Cards */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                          <span>{selectedMeta.elementIcon}</span>
                          <span>Elemental Realm</span>
                        </div>
                        <p className="mt-1.5 font-bold text-white text-sm">{selectedMeta.element}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{selectedCore.direction} · {selectedCore.season}</p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                          <span>🌿</span>
                          <span>Botanical Ally</span>
                        </div>
                        <p className="mt-1.5 font-bold text-amber-200 text-sm">{selectedMeta.botanicalPreview.name}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{selectedMeta.botanicalPreview.localName}</p>
                        <HerbSafetyBadge label={`${selectedMeta.botanicalPreview.name} / ${selectedMeta.botanicalPreview.localName}`} className="mt-2" />
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                          <span>📐</span>
                          <span>Sacred Geometry</span>
                        </div>
                        <p className="mt-1.5 font-bold text-cyan-200 text-sm">{selectedCore.geometry}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{selectedCore.platonicSolid}</p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                          <span>☀️</span>
                          <span>Creation Day</span>
                        </div>
                        <p className="mt-1.5 font-bold text-emerald-200 text-sm">{selectedCore.creationDay}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{selectedCore.planet} · {selectedCore.metal}</p>
                      </div>
                    </div>

                    {/* Virtue ↔ Shadow Transmutation Bridge */}
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur-md">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        <span>Alchemical Transmutation Path</span>
                        <span className="text-amber-300">Ge'ez Core {selectedMeta.runeSigil}</span>
                      </div>
                      <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-rose-300">
                          <span className="text-base">🔴</span>
                          <div>
                            <span className="block text-[9px] uppercase tracking-wider text-rose-400/80">Wounded Shadow</span>
                            <span className="font-bold">{selectedCore.shadow}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                          <ArrowRight className="h-4 w-4 text-amber-400" />
                          <span>Spiritual Transmutation</span>
                          <ArrowRight className="h-4 w-4 text-amber-400" />
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-emerald-300">
                          <span className="text-base">🟢</span>
                          <div>
                            <span className="block text-[9px] uppercase tracking-wider text-emerald-400/80">Empowered Gift</span>
                            <span className="font-bold">{selectedCore.gift}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick-Switch Orbital Dock */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 text-center">
                        Select Core Focus Chamber
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {HEXACORE_CORES.map((core) => {
                          const isCur = core.id === selectedCoreId;
                          const m = CORE_METADATA[core.id];
                          return (
                            <button
                              key={core.id}
                              type="button"
                              onClick={() => setSelectedCoreId(core.id)}
                              className={`flex flex-col items-center justify-center rounded-xl p-2.5 transition-all ${
                                isCur
                                  ? "border-2 border-white bg-white/15 shadow-lg scale-105"
                                  : "border border-white/5 bg-black/40 hover:bg-white/5 hover:border-white/20"
                              }`}
                              style={{
                                borderColor: isCur ? CORE_COLORS[core.id] : undefined,
                                boxShadow: isCur ? `0 0 16px ${m.glow}` : undefined,
                              }}
                            >
                              <span className="text-xl">{m.emojis[0]}</span>
                              <span className="mt-1 text-xs font-bold text-white">{core.name}</span>
                              <span className="text-[10px] text-slate-400">{core.soundHz} Hz</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ILLUSTRATION PANELS & COSMIC STATE MATRIX */}
            <div className="space-y-6">
              {/* Dynamic 4-Metric Zoom Cascade */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-indigo-300 font-bold">
                      Harmonic Resonance Cascade
                    </p>
                    <h3 className="mt-0.5 text-lg font-bold text-white">
                      {selectedCore.name} · Multidimensional Signals
                    </h3>
                  </div>
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-indigo-200">
                    {selectedMeta.runeSigil} Active Field
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {cinematicMetrics.map((item) => (
                    <div
                      key={item.label}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-3.5 shadow-lg shadow-indigo-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-2xl drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]">
                          {item.icon}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-slate-300">
                          {item.label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-white">{item.value}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{item.hint}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: HEXACORE ARCHETYPAL PANTHEON (6 LARGE ILLUSTRATIVE PANELS) */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-amber-300">
                      Iconographic Pantheon
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      The Six Fundamental Cores of Creation
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Click any archetype card to activate its cosmic field
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {HEXACORE_CORES.map((core) => {
                    const meta = CORE_METADATA[core.id];
                    const isSelected = core.id === selectedCoreId;
                    return (
                      <div
                        key={core.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedCoreId(core.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setSelectedCoreId(core.id);
                        }}
                        className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "border-white/40 bg-white/[0.08] shadow-2xl scale-[1.02]"
                            : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.04]"
                        }`}
                        style={{
                          boxShadow: isSelected ? `0 0 30px ${meta.glow}` : undefined,
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30"
                          style={{ background: meta.cardGradient }}
                        />

                        <div className="relative z-10 flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-mono font-bold text-white">
                                {meta.runeSigil}
                              </span>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                Core {core.number}
                              </span>
                            </div>
                            <h4 className="text-lg font-black text-white mt-1">{core.name}</h4>
                            <p className="text-xs font-semibold text-amber-300">{core.amharic}</p>
                          </div>

                          {/* Large Emoji Crest */}
                          <div className="flex flex-col items-end">
                            <span className="text-3xl transition-transform duration-300 group-hover:scale-125 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                              {meta.emojis[0]}
                            </span>
                            <span className="mt-1 text-[10px] font-mono text-indigo-300">
                              {core.soundHz} Hz
                            </span>
                          </div>
                        </div>

                        <p className="relative z-10 mt-3 text-xs leading-relaxed text-slate-300 line-clamp-2">
                          {core.essence}
                        </p>

                        <div className="relative z-10 mt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-semibold text-emerald-300">
                            Gift: {core.gift}
                          </span>
                          <span className="rounded bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 font-semibold text-rose-300">
                            Shadow: {core.shadow}
                          </span>
                        </div>

                        <div className="relative z-10 mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <span>🌿</span> {meta.botanicalPreview.name.split("/")[0].trim()}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlaySound(core.soundHz);
                            }}
                            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] text-white hover:bg-white/20 transition-colors"
                          >
                            <Volume2 className="h-3 w-3 text-amber-300" />
                            <span>{core.soundHz}Hz</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: VIBRATIONAL OCTAVE LADDER */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-cyan-300">
                      Energetic Frequency Ladder
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      Six Stages of Vibrational Manifestation
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Active Core: <strong className="text-white">{selectedCore.name}</strong> ({selectedCore.soundHz} Hz)
                  </span>
                </div>

                {/* Octave Stage Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {VIBRATIONAL_OCTAVES.map((oct) => {
                    const isCur = oct.state === activeOctave;
                    return (
                      <button
                        key={oct.state}
                        type="button"
                        onClick={() => setActiveOctave(oct.state)}
                        className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all ${
                          isCur
                            ? "border-2 border-indigo-400 bg-indigo-600/30 text-white shadow-lg shadow-indigo-950/40 scale-105"
                            : "border border-white/10 bg-black/40 text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="text-2xl">{oct.emoji}</span>
                        <span className="mt-1 text-xs font-bold">{oct.state}</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400">
                          {oct.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Octave Details & Instant Audition */}
                <div className="mt-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedOctaveMeta.emoji}</span>
                      <h4 className="text-sm font-bold text-white">
                        {selectedOctaveMeta.state} Octave: {selectedOctaveMeta.title}
                      </h4>
                      <span className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                        {calculatedOctaveHz} Hz
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300 max-w-xl">
                      {selectedOctaveMeta.desc} In {selectedCore.name}, this represents the transition from{" "}
                      <span className="text-rose-300">{selectedCore.shadow}</span> to{" "}
                      <span className="text-emerald-300">{selectedCore.gift}</span>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlaySound(calculatedOctaveHz)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-indigo-500 hover:to-purple-500 transition-all"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Audition {calculatedOctaveHz} Hz</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Core Deep-Dive Panel (Aside) */}
          <aside className="space-y-4">
            <div
              className="relative isolate overflow-hidden rounded-3xl border p-5 shadow-2xl backdrop-blur-xl transition-all duration-700"
              style={{
                borderColor: `${selectedMeta.orbit}66`,
                background: `linear-gradient(145deg, rgba(${selectedMeta.accentRgb}, 0.22), rgba(2, 6, 23, 0.92) 68%)`,
                boxShadow: `0 0 42px ${selectedMeta.glow}`,
              }}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-2xl"
                style={{
                  background: selectedMeta.orbit,
                  opacity: 0.3,
                  animation: "spotlightBreathe 4s ease-in-out infinite",
                }}
              />
              <div
                className="pointer-events-none absolute -bottom-24 -left-12 h-40 w-40 rounded-full border opacity-30"
                style={{
                  borderColor: selectedMeta.orbit,
                  animation: "spotlightBreathe 5s ease-in-out infinite reverse",
                }}
              />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/50">Core spotlight</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span
                      className="flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl shadow-lg"
                      style={{
                        color: selectedMeta.orbit,
                        borderColor: `${selectedMeta.orbit}88`,
                        background: `${selectedMeta.orbit}22`,
                        boxShadow: `0 0 24px ${selectedMeta.glow}`,
                      }}
                    >
                      {selectedMeta.glyph}
                    </span>
                    <div>
                      <p className="text-2xl font-black text-white">{selectedCore.name}</p>
                      <p className="text-xs text-white/60">{selectedMeta.themeTitle}</p>
                    </div>
                  </div>
                </div>
                <span className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-white/60">
                  Focused
                </span>
              </div>

              <div className="relative mt-5 grid grid-cols-3 gap-2">
                {[
                  { label: "Resonance", value: `${selectedCore.soundHz} Hz` },
                  { label: "Octave", value: selectedOctaveMeta.state },
                  { label: "Signal", value: selectedMeta.elementIcon },
                ].map((metric, index) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-white/10 bg-black/20 p-2.5"
                    style={{ animation: `telemetryRise 500ms ease-out ${index * 90}ms both` }}
                  >
                    <p className="text-[9px] uppercase tracking-[0.18em] text-white/45">{metric.label}</p>
                    <p className="mt-1 truncate text-sm font-bold text-white">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="relative mt-4">
                <div className="mb-1 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-white/45">
                  <span>Signal coherence</span>
                  <span>{Math.round(selectedOctaveMeta.octaveHzMult * 50)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.round(selectedOctaveMeta.octaveHzMult * 50)}%`,
                      background: `linear-gradient(90deg, ${selectedMeta.orbit}, #fef08a)`,
                      boxShadow: `0 0 14px ${selectedMeta.glow}`,
                    }}
                  />
                </div>
              </div>

              <div className="relative mt-4 flex items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <span
                  className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm"
                  style={{ borderColor: `${selectedMeta.orbit}88`, color: selectedMeta.orbit }}
                >
                  {selectedMeta.emojis[1]}
                  <span
                    className="absolute inset-[-5px] rounded-full border border-dashed opacity-50"
                    style={{ borderColor: selectedMeta.orbit, animation: "orbitSweep 5s linear infinite" }}
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[9px] uppercase tracking-[0.2em] text-white/45">Current transmission</p>
                  <p className="truncate text-xs font-semibold text-white">{selectedMeta.detail}</p>
                </div>
                <span className="ml-auto flex gap-0.5" aria-label="Signal activity">
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <span
                      key={bar}
                      className="w-1 rounded-full bg-white/60"
                      style={{
                        height: `${8 + ((bar + selectedCore.number) % 4) * 4}px`,
                        animation: `soundwaveAnim ${900 + bar * 120}ms ease-in-out infinite`,
                        animationDelay: `${bar * 80}ms`,
                      }}
                    />
                  ))}
                </span>
              </div>
            </div>

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

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Explore every layer by core</p>
            <div className="flex flex-wrap gap-2">
              {HEXACORE_CORES.map((core) => (
                <button
                  key={core.id}
                  type="button"
                  onClick={() => setSelectedCoreId(core.id)}
                  aria-pressed={selectedCoreId === core.id}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    selectedCoreId === core.id
                      ? "border-indigo-400/60 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-black/20 text-slate-400 hover:text-white"
                  }`}
                >
                  {core.name}
                </button>
              ))}
            </div>
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
                {selectedAspects.map((a) => (
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
              <h3 className="text-xl font-bold text-white">Layer 3: {selectedCore.name} Frequencies</h3>
              <p className="text-sm text-slate-300">
                Every aspect spans 6 vibrational stages: <strong>Dormant → Awakening → Active → Radiant → Transcendent → Eternal</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {selectedFrequencies.map((f) => (
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
              <p className="text-xs text-slate-500 text-center pt-2">Showing all {selectedFrequencies.length} frequency states for {selectedCore.name}.</p>
            </div>
          )}

          {/* Layer 4: Archetypes */}
          {activeLayer === 4 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Layer 4: {selectedCore.name} Archetypes</h3>
              <p className="text-sm text-slate-300">Personified energetic patterns acting through personal and collective psyches.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {selectedArchetypes.map((arch) => (
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
              <h3 className="text-xl font-bold text-white">Layer 7: {selectedCore.name} Correspondences ({selectedCorrespondences.length})</h3>
              <p className="text-sm text-slate-300">
                Cross-domain multidimensional mapping tying each archetype to a Planet, Herb, Sound Frequency, Sacred Geometry, Body Sign, and Creation Day.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {selectedCorrespondences.map((c) => (
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
                {TEMPORAL_CYCLES.filter((cycle) => cycle.core === selectedCore.name).map((tc, idx) => (
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
                {ENERGETIC_BODIES.filter((body) => body.core === selectedCore.name).map((eb) => (
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
                {INITIATION_GATES.filter((gate) => gate.core === selectedCore.name).map((gate) => (
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
                {CREATION_DAY_MAPPINGS.filter((day) => day.primaryCore === selectedCore.name || day.secondaryCore === selectedCore.name).map((cd) => (
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
                      {[selectedCore.name].map((core) => {
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
                  <h4 className="font-bold text-base">Ethiopian Herbal Integration & Scientific Safety Profile</h4>
                </div>
                <p className="text-xs text-amber-200/80">
                  Traditional botanical correspondences are documented for cultural inquiry only. Each plant&apos;s status comes live from the medicine &amp; remedy safety matrix; select it to check against medicines.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {ETHIOPIAN_HERBAL_INTEGRATION.filter((herb) => herb.core === selectedCore.name).map((herb) => (
                    <div key={herb.scientificName} className="rounded-2xl border border-white/10 bg-[#0c0c1a] p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{herb.herb}</span>
                        {/* Live status from the safety matrix instead of a fixed rating. */}
                        <HerbSafetyBadge label={`${herb.herb} / ${herb.scientificName}`} />
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

          {activeLayer === 5 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Layer 5: {selectedCore.name} Shadows</h3>
              <p className="text-sm text-slate-300">Explore the shadow and reflective balancing practice for every archetype in this core.</p>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {selectedArchetypes.map((archetype) => (
                  <article key={archetype.id} className="rounded-2xl border border-rose-400/15 bg-rose-500/[0.03] p-4">
                    <p className="text-[10px] font-mono text-slate-500">{archetype.id} · {archetype.aspectName}</p>
                    <h4 className="mt-1 font-bold text-white">{archetype.name}</h4>
                    <p className="mt-3 text-xs text-rose-200"><strong>Shadow:</strong> {archetype.shadow}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300"><strong className="text-emerald-300">Reflective practice:</strong> {archetype.remedy}</p>
                    <p className="mt-2 text-[11px] text-slate-400">Body-sign symbolism: {archetype.bodySign}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeLayer === 6 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Layer 6: {selectedCore.name} Gifts</h3>
              <p className="text-sm text-slate-300">See how the strengths of each archetype may be expressed in everyday life.</p>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {selectedArchetypes.map((archetype) => (
                  <article key={archetype.id} className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.03] p-4">
                    <p className="text-[10px] font-mono text-slate-500">{archetype.id} · {archetype.aspectName}</p>
                    <h4 className="mt-1 font-bold text-white">{archetype.name}</h4>
                    <p className="mt-3 text-sm text-emerald-200">{archetype.gift}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">{archetype.role}</p>
                    <p className="mt-2 text-[11px] text-slate-400">Balanced expression: {archetype.remedy}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeLayer === 10 && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-xl font-bold text-white">Layer 10: Collective Fields · {selectedCore.name}</h3>
                <p className="mt-2 text-sm text-slate-300">Group roles, relationship pairs, and collective patterns connected to the selected core.</p>
                <h4 className="mt-5 text-sm font-bold text-indigo-200">Group sizes and dynamics</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {COLLECTIVE_DYNAMICS.groupSizes.filter((item) => item.core === selectedCore.name).map((item) => (
                    <article key={item.size} className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs">
                      <h5 className="font-bold text-white">Group of {item.size} · {item.dynamic}</h5>
                      <p className="mt-2 text-slate-400">{item.example}</p>
                      <p className="mt-2 text-emerald-300">Practice: {item.practice}</p>
                    </article>
                  ))}
                </div>
                <h4 className="mt-6 text-sm font-bold text-indigo-200">Core pairings</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {pairs.map((pair) => (
                    <article key={pair.id} className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs">
                      <h5 className="font-bold text-white">{pair.name} · {pair.left} + {pair.right}</h5>
                      <p className="mt-2 text-slate-300">{pair.dynamic}</p>
                      <p className="mt-2 text-rose-300">Tension: {pair.shadow}</p>
                      <p className="mt-1 text-emerald-300">Gift: {pair.gift}</p>
                    </article>
                  ))}
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-bold text-rose-200">Collective shadows</h4>
                    <div className="mt-2 space-y-2">
                      {COLLECTIVE_DYNAMICS.collectiveShadows.filter((item) => item.core === selectedCore.name).map((item) => (
                        <p key={item.shadow} className="rounded-lg bg-rose-500/[0.06] p-3 text-xs text-slate-300">
                          <strong className="text-rose-200">{item.shadow}:</strong> {item.expression} · Balance through {item.remedy}.
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-200">Collective gifts</h4>
                    <div className="mt-2 space-y-2">
                      {COLLECTIVE_DYNAMICS.collectiveGifts.filter((item) => item.core === selectedCore.name).map((item) => (
                        <p key={item.gift} className="rounded-lg bg-emerald-500/[0.06] p-3 text-xs text-slate-300">
                          <strong className="text-emerald-200">{item.gift}:</strong> {item.expression} · Practice: {item.practice}.
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeLayer === 12 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Layer 12: Cosmological Realms · {selectedCore.name}</h3>
              <p className="text-sm text-slate-300">Explore the selected core's symbolic realm and all of its sub-realms.</p>
              {COSMOLOGICAL_REALMS.filter((realm) => realm.core === selectedCore.name).map((realm) => (
                <article key={realm.realm} className="rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.04] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-white">{realm.realm}</h4>
                      <p className="mt-1 text-sm text-slate-300">{realm.description}</p>
                    </div>
                    <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">Ruler: {realm.ruler}</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">Gateway: {realm.gateway}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {realm.subRealms.map((subRealm) => (
                      <div key={subRealm.name} className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <h5 className="text-sm font-semibold text-amber-200">{subRealm.name}</h5>
                        <p className="mt-1 text-xs text-slate-400">{subRealm.meaning}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-300">Personal Journal Reflection</label>
                <span className={`text-[11px] ${
                  journalStatus === "error"
                    ? "text-rose-300"
                    : journalStatus === "local"
                      ? "text-amber-300"
                      : journalStatus === "saving" || journalStatus === "loading"
                        ? "text-slate-400"
                        : "text-emerald-300"
                }`}>
                  {journalStatus === "loading" && "Loading saved entries…"}
                  {journalStatus === "saving" && "Saving securely…"}
                  {journalStatus === "saved" && "Synced to your account"}
                  {journalStatus === "local" && "Saved on this device only"}
                  {journalStatus === "error" && "Write at least 3 characters to save"}
                  {journalStatus === "idle" && "Private reflection"}
                </span>
              </div>
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
                  disabled={journalStatus === "saving"}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {journalStatus === "saving" ? "Saving…" : `Save Day ${activeDay} Entry`}
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
                <label htmlFor="hexacore-profile-name" className="text-xs text-slate-400 block mb-1">Full Name (optional)</label>
                <input
                  id="hexacore-profile-name"
                  type="text"
                  value={calcName}
                  onChange={(e) => setCalcName(e.target.value)}
                  autoComplete="name"
                  maxLength={120}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="hexacore-profile-birth-date" className="text-xs text-slate-400 block mb-1">Date of Birth</label>
                <input
                  id="hexacore-profile-birth-date"
                  type="date"
                  value={calcDate}
                  onChange={(e) => setCalcDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  required
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
                  const sample = { name: "Sample User", date: "1990-12-25" };
                  setCalcName(sample.name);
                  setCalcDate(sample.date);
                  setCalcConsent(true);
                  setCalcAge(true);
                  calculateProfile(sample.name, sample.date, true, true);
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                Load Sample Profile
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
