"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, BookOpen, ChevronDown, ChevronUp, Info, Sparkles } from "lucide-react";
import Link from "next/link";

// ── Data ─────────────────────────────────────────────────────────────────────

const PALM_LINES = [
  {
    id: "heart",
    name: "Heart Line",
    am: "የልብ መስመር",
    symbol: "❤️",
    color: "rose",
    position: "Upper palm — runs horizontally below the fingers",
    description:
      "In Ethiopian hand-reading tradition and comparative palmistry alike, the heart line is associated with emotional nature, relational patterns, and vitality. Its depth, length, curve, and breaks each carry distinct reflective meaning.",
    readings: [
      { feature: "Long, clear, curved upward", meaning: "Open emotional expression; strong relational warmth", am: "ስሜቶችን ማሳየት; ሙቅ ግንኙነት" },
      { feature: "Straight, short", meaning: "Practical emotional style; values logic in relationships", am: "ተግባራዊ ስሜት; ጥቅም ያለው ፍቅር" },
      { feature: "Broken or chained", meaning: "Periods of emotional turbulence or heartbreak patterns", am: "የስሜት ውጣ ውረዶች" },
      { feature: "Very deep and red", meaning: "Intense emotional energy; strong passions", am: "ጠንካራ ስሜቶች" },
      { feature: "Faint or barely visible", meaning: "Emotional reserve or guardedness", am: "ስሜትን መደበቅ" },
    ],
  },
  {
    id: "head",
    name: "Head Line",
    am: "የአዕምሮ መስመር",
    symbol: "🧠",
    color: "sky",
    position: "Middle palm — runs horizontally across the palm",
    description:
      "The head line is read as a map of mental patterns, learning style, and decision-making approach. In Ethiopian hand-reading, its interaction with the life line at the start tells of the individual's relationship with tradition and family.",
    readings: [
      { feature: "Long, reaching far across palm", meaning: "Broad thinking; multi-subject curiosity", am: "ሰፊ አስተሳሰብ; ብዙ ዓላማ" },
      { feature: "Short, ends below middle finger", meaning: "Practical, focused thinker", am: "ተግባራዊ አስተሳሰብ" },
      { feature: "Curves downward toward wrist", meaning: "Creative, imaginative, intuitive mind", am: "ፈጠራዊ አዕምሮ" },
      { feature: "Wavy or chained", meaning: "Scattered focus; periods of mental flux", am: "ልዩ ልዩ ሃሳቦች" },
      { feature: "Deeply forked (Writers' Fork)", meaning: "Ability to see multiple perspectives simultaneously", am: "ብዙ ጎን ማየት" },
    ],
  },
  {
    id: "life",
    name: "Life Line",
    am: "የሕይወት መስመር",
    symbol: "🌿",
    color: "emerald",
    position: "Curves around the thumb base from between thumb and index finger",
    description:
      "Contrary to popular belief, the life line is not read as lifespan length in Ethiopian tradition — it reflects vitality, resilience, and life transitions. Breaks and branches are read as periods of major change, not as ominous signs.",
    readings: [
      { feature: "Deep and long", meaning: "Strong physical vitality and resilience patterns", am: "ጠንካራ ጉልበት" },
      { feature: "Faint or thin", meaning: "Sensitive constitution; emotional sensitivity pattern", am: "ስሜታዊ ተፈጥሮ" },
      { feature: "Break in line", meaning: "Significant life change or transition", am: "ዋና የሕይወት ለውጥ" },
      { feature: "Branches reaching up", meaning: "Periods of growth, ambition, or achievement", am: "እድገት ወቅቶች" },
      { feature: "Branches reaching down", meaning: "Periods of depletion or withdrawal", am: "ድካም ወቅቶች" },
    ],
  },
  {
    id: "fate",
    name: "Fate Line",
    am: "የዕጣ መስመር",
    symbol: "⭐",
    color: "amber",
    position: "Runs vertically up the centre of the palm toward the middle finger",
    description:
      "The fate line is associated with life direction, purpose, and the degree of external influence on one's path. In Ethiopian hand-reading, a strong fate line is seen as alignment with one's calling (ጥሪ). Its absence or weakness is not negative — it may indicate a self-directed path.",
    readings: [
      { feature: "Deep and clear from wrist", meaning: "Strong sense of direction; purpose-driven life", am: "ዋና ዓላማ ያለው ሕይወት" },
      { feature: "Starts from life line", meaning: "Family tradition shapes life direction", am: "ቤተሰብ ባህል ዓላማ ይወስናል" },
      { feature: "Starts from middle of palm", meaning: "Direction clarified in mid-life", am: "ዕጣ በሕይወት ጉዞ ይታወቃል" },
      { feature: "Multiple fate lines", meaning: "Multiple vocations or parallel life paths", am: "ብዙ ተሰጥኦዎች" },
      { feature: "Absent", meaning: "Self-directed, non-conventional path", am: "ራስ-ቅዱስ ሕይወት" },
    ],
  },
  {
    id: "sun",
    name: "Sun Line (Apollo)",
    am: "የፀሐይ መስመር",
    symbol: "☀️",
    color: "yellow",
    position: "Vertical line rising toward the ring finger",
    description:
      "The sun line is associated with recognition, creativity, and the capacity to be seen and celebrated. In Ethiopian tradition, its presence is linked to social standing, artistic gifts, and communal respect.",
    readings: [
      { feature: "Clear and deep", meaning: "Strong creative talent; public recognition", am: "ፈጠራ ጸጋ; ታዋቂነት" },
      { feature: "Short near ring finger", meaning: "Late-blooming recognition or talent", am: "ዘግይቶ ሊገኝ የሚችል ተሰጥኦ" },
      { feature: "Multiple sun lines", meaning: "Versatile gifts across domains", am: "ብዙ ዘርፍ ተሰጥኦ" },
      { feature: "Absent", meaning: "Fulfillment through private rather than public achievement", am: "ግላዊ ስኬት" },
    ],
  },
];

const MOUNTS = [
  { id: "jupiter", name: "Mount of Jupiter", am: "ጁፒተር ተራራ", finger: "Index finger base", meaning: "Ambition, leadership, confidence", color: "bg-sky-500/10 border-sky-500/30 text-sky-200" },
  { id: "saturn",  name: "Mount of Saturn",  am: "ሳተርን ተራራ",  finger: "Middle finger base", meaning: "Discipline, wisdom, solitude", color: "bg-stone-500/10 border-stone-500/30 text-stone-200" },
  { id: "apollo",  name: "Mount of Apollo",  am: "አፖሎ ተራራ",  finger: "Ring finger base",   meaning: "Creativity, beauty, expression", color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-200" },
  { id: "mercury", name: "Mount of Mercury", am: "ሜርኩሪ ተራራ", finger: "Pinky finger base",  meaning: "Communication, wit, commerce", color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200" },
  { id: "venus",   name: "Mount of Venus",   am: "ቬኑስ ተራራ",   finger: "Thumb base",        meaning: "Love, sensuality, family bond", color: "bg-rose-500/10 border-rose-500/30 text-rose-200" },
  { id: "moon",    name: "Mount of Moon",    am: "ጨረቃ ተራራ",    finger: "Lower outer palm",  meaning: "Intuition, dreams, imagination", color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-200" },
];

const HAND_SHAPES = [
  { id: "earth", shape: "Earth Hand", am: "የምድር እጅ", desc: "Square palm, short fingers. Grounded, practical, stable. Values tradition, hard work, and community.", color: "bg-amber-800/20 border-amber-700/30 text-amber-200" },
  { id: "air",   shape: "Air Hand",   am: "የአየር እጅ",  desc: "Square palm, long fingers. Intellectual, communicative, curious. Needs mental stimulation.", color: "bg-sky-800/20 border-sky-700/30 text-sky-200" },
  { id: "fire",  shape: "Fire Hand",  am: "የእሳት እጅ", desc: "Rectangular palm, short fingers. Energetic, confident, impulsive. Natural leader.", color: "bg-red-800/20 border-red-700/30 text-red-200" },
  { id: "water", shape: "Water Hand", am: "የውሃ እጅ",   desc: "Rectangular palm, long fingers. Sensitive, empathic, intuitive. Deep emotional world.", color: "bg-indigo-800/20 border-indigo-700/30 text-indigo-200" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function PalmReadingPage() {
  const [activeLine, setActiveLine] = useState(PALM_LINES[0].id);
  const [expandedReading, setExpandedReading] = useState<string | null>(null);

  const line = PALM_LINES.find((l) => l.id === activeLine) ?? PALM_LINES[0];

  const colorMap: Record<string, { border: string; bg: string; text: string; pill: string }> = {
    rose:    { border: "border-rose-500/40",    bg: "bg-rose-500/10",    text: "text-rose-200",    pill: "bg-rose-500 text-black" },
    sky:     { border: "border-sky-500/40",     bg: "bg-sky-500/10",     text: "text-sky-200",     pill: "bg-sky-500 text-black" },
    emerald: { border: "border-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-200", pill: "bg-emerald-500 text-black" },
    amber:   { border: "border-amber-500/40",   bg: "bg-amber-500/10",   text: "text-amber-200",   pill: "bg-amber-500 text-black" },
    yellow:  { border: "border-yellow-500/40",  bg: "bg-yellow-500/10",  text: "text-yellow-200",  pill: "bg-yellow-400 text-black" },
  };
  const c = colorMap[line.color] ?? colorMap.amber;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-10">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <header>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span>Body-Sign Reading · Palm</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Palm Reading{" "}
          <span lang="am" className="block text-2xl font-semibold text-amber-300 sm:inline sm:text-3xl">
            የእጅ ንባብ
          </span>
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-stone-400 leading-relaxed">
          Ethiopian hand-reading (እጅ ንባብ) is a centuries-old reflective practice woven into the Hexacore wisdom
          system. Lines, mounts, and hand shape are read together to offer a cultural portrait — a mirror,
          not a map of fixed fate. Offered here as educational and reflective content only.
        </p>
      </header>

      {/* ── Palm Diagram + Line Detail ─────────────────────────────── */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">

        {/* Palm SVG */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-52 h-80">
            <svg viewBox="0 0 160 240" className="w-full h-full" aria-label="Palm reading diagram">
              {/* Palm body */}
              <rect x="20" y="80" width="120" height="130" rx="20" fill="#1c1917" stroke="#57534e" strokeWidth="1.5" />
              {/* Fingers */}
              {[28, 52, 76, 100, 124].map((x, i) => (
                <rect key={i} x={x} y={20} width={22} height={74} rx={11} fill="#1c1917" stroke="#57534e" strokeWidth="1.5" />
              ))}
              {/* Heart line */}
              <path
                d="M 25 110 Q 80 100 135 110"
                stroke={activeLine === "heart" ? "#f44336" : "#3f3f46"}
                strokeWidth={activeLine === "heart" ? "2.5" : "1.5"}
                fill="none"
                className="cursor-pointer transition-all"
                onClick={() => setActiveLine("heart")}
                aria-label="Heart line"
              />
              {/* Head line */}
              <path
                d="M 25 140 Q 80 145 130 135"
                stroke={activeLine === "head" ? "#0ea5e9" : "#3f3f46"}
                strokeWidth={activeLine === "head" ? "2.5" : "1.5"}
                fill="none"
                className="cursor-pointer transition-all"
                onClick={() => setActiveLine("head")}
                aria-label="Head line"
              />
              {/* Life line */}
              <path
                d="M 60 80 Q 40 140 45 200"
                stroke={activeLine === "life" ? "#10b981" : "#3f3f46"}
                strokeWidth={activeLine === "life" ? "2.5" : "1.5"}
                fill="none"
                className="cursor-pointer transition-all"
                onClick={() => setActiveLine("life")}
                aria-label="Life line"
              />
              {/* Fate line */}
              <path
                d="M 80 200 L 80 120"
                stroke={activeLine === "fate" ? "#f59e0b" : "#3f3f46"}
                strokeWidth={activeLine === "fate" ? "2.5" : "1.5"}
                strokeDasharray={activeLine === "fate" ? "none" : "4 3"}
                fill="none"
                className="cursor-pointer transition-all"
                onClick={() => setActiveLine("fate")}
                aria-label="Fate line"
              />
              {/* Sun line */}
              <path
                d="M 105 185 L 102 120"
                stroke={activeLine === "sun" ? "#facc15" : "#3f3f46"}
                strokeWidth={activeLine === "sun" ? "2.5" : "1.5"}
                strokeDasharray={activeLine === "sun" ? "none" : "4 3"}
                fill="none"
                className="cursor-pointer transition-all"
                onClick={() => setActiveLine("sun")}
                aria-label="Sun line"
              />
            </svg>
          </div>
          <p className="text-[11px] text-stone-500 text-center max-w-[14rem]">
            Click any line on the palm to explore its reflective meaning.
          </p>
        </div>

        {/* Line Detail Panel */}
        <div className={`rounded-3xl border ${c.border} ${c.bg} p-6 space-y-5`}>
          <div>
            <span className={`text-[10px] font-mono uppercase tracking-widest ${c.text}`}>Line</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              {line.symbol} {line.name}
            </h2>
            <p lang="am" className={`text-sm font-semibold ${c.text} mb-1`}>{line.am}</p>
            <p className="text-xs text-stone-500 italic">{line.position}</p>
          </div>

          <p className="text-sm text-stone-300 leading-relaxed">{line.description}</p>

          <div className="space-y-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>Feature Readings</h3>
            {line.readings.map((r, i) => {
              const key = `${line.id}-${i}`;
              const open = expandedReading === key;
              return (
                <div key={key} className="rounded-2xl border border-stone-800 bg-stone-950/60">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => setExpandedReading(open ? null : key)}
                  >
                    <span className="text-sm font-semibold text-stone-200">{r.feature}</span>
                    {open ? <ChevronUp className="size-4 text-stone-400 shrink-0" /> : <ChevronDown className="size-4 text-stone-400 shrink-0" />}
                  </button>
                  {open && (
                    <div className="px-4 pb-4 space-y-1">
                      <p className="text-sm text-amber-200">{r.meaning}</p>
                      <p lang="am" className="text-xs text-stone-500">{r.am}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Line Selector Pills ───────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {PALM_LINES.map((l) => {
          const lc = colorMap[l.color] ?? colorMap.amber;
          return (
            <button
              key={l.id}
              onClick={() => setActiveLine(l.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border transition-all ${
                activeLine === l.id
                  ? `${lc.bg} ${lc.border} ${lc.text}`
                  : "border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-600"
              }`}
            >
              {l.symbol} {l.name}
            </button>
          );
        })}
      </div>

      {/* ── Mounts Reference ─────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
          <BookOpen className="size-5 text-amber-400" />
          Mounts of the Hand
          <span lang="am" className="text-base font-semibold text-amber-300">— ተራሮች</span>
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MOUNTS.map((m) => (
            <div key={m.id} className={`rounded-2xl border p-4 ${m.color}`}>
              <p className="font-bold text-sm">{m.name}</p>
              <p lang="am" className="text-[11px] opacity-60 mb-1">{m.am}</p>
              <p className="text-[11px] text-stone-400 mb-2">Below: {m.finger}</p>
              <p className="text-xs leading-relaxed opacity-80">{m.meaning}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Hand Shape Reference ──────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
          <Info className="size-5 text-amber-400" />
          Hand Shape Types
          <span lang="am" className="text-base font-semibold text-amber-300">— የእጅ ቅርፅ</span>
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HAND_SHAPES.map((hs) => (
            <div key={hs.id} className={`rounded-2xl border p-4 ${hs.color}`}>
              <p className="font-bold text-sm">{hs.shape}</p>
              <p lang="am" className="text-[11px] opacity-60 mb-2">{hs.am}</p>
              <p className="text-xs leading-relaxed opacity-80">{hs.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="flex flex-col gap-4 border-t border-stone-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-[11px] text-stone-500 max-w-xl">
          <AlertTriangle className="size-3.5 shrink-0 text-amber-700 mt-0.5" />
          Palm reading is a reflective cultural tool. It does not predict the future, diagnose illness, or constitute professional advice.
        </p>
        <Link
          href="/body-reading/face"
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 transition-colors shrink-0"
        >
          Face Reading & Biometrics <ArrowRight className="size-4" />
        </Link>
      </footer>
    </div>
  );
}
