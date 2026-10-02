"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, BookOpen, ChevronDown, ChevronUp, Info, Sparkles } from "lucide-react";
import Link from "next/link";
import HexacoreCameraScanner from "@/features/hexacore/HexacoreCameraScanner";

// ── Data ─────────────────────────────────────────────────────────────────────

const TONGUE_ZONES = [
  {
    id: "tip",
    zone: "Tip",
    am: "ጫፍ",
    organ: "Traditional symbolic association",
    organAm: "ባህላዊ ምሳሌያዊ ግንኙነት",
    color: "rose",
    emoji: "❤️",
    description: "Some traditional body-sign charts associate this zone with heart and mind symbolism. This is cultural interpretation only; tongue appearance cannot establish emotional state or heart health.",
    signs: [
      { sign: "Bright red tip", reading: "Some traditional readings describe this as a symbolic 'heat' image; it is not evidence of agitation or a heart condition.", am: "በአንዳንድ ባህላዊ ንባቦች ምሳሌያዊ ሙቀት እንደሆነ ይገለጻል" },
      { sign: "Pale tip", reading: "Some traditional readings use this as a prompt about change or restoration; it cannot establish sadness, anaemia, or another condition.", am: "ባህላዊ ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
      { sign: "Small red dots (prickles)", reading: "This appearance has many possible explanations; traditional symbolism is not a clinical interpretation.", am: "ባህላዊ ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
    ],
  },
  {
    id: "front-sides",
    zone: "Front Sides",
    am: "የፊት ጠርዝ",
    organ: "Traditional symbolic association",
    organAm: "ባህላዊ ምሳሌያዊ ግንኙነት",
    color: "sky",
    emoji: "🫁",
    description: "Some traditional charts symbolically associate the front edges with breath and air. Tongue colour or shape does not measure lung function or explain breathing symptoms.",
    signs: [
      { sign: "Redness at front edges", reading: "A traditional visual motif only; it cannot show lung heat, inflammation, or respiratory function.", am: "ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
      { sign: "Pale or white patches", reading: "A visual description, not evidence of a lung condition. Ask a clinician about persistent or concerning changes.", am: "ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
      { sign: "Scalloped edges", reading: "This shape has multiple possible causes; it does not establish fluid retention or fatigue.", am: "ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
    ],
  },
  {
    id: "center",
    zone: "Centre",
    am: "መሃል",
    organ: "Traditional symbolic association",
    organAm: "ባህላዊ ምሳሌያዊ ግንኙነት",
    color: "amber",
    emoji: "🟡",
    description: "Some traditional body-sign charts associate the centre with digestion symbolism. Coating, cracks, and colour vary for many reasons and cannot assess digestive health.",
    signs: [
      { sign: "Thick yellow coat", reading: "A traditional visual motif, not a finding of digestive heat, infection, or food stagnation.", am: "ባህላዊ ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
      { sign: "Thin white coat", reading: "A common visual description, not a test of digestive health or a definition of normality.", am: "ባህላዊ ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
      { sign: "Deep midline crack", reading: "A visible feature with varied possible explanations; it cannot establish chronic dryness or a digestive condition.", am: "ባህላዊ ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
      { sign: "No visible coat", reading: "This observation cannot establish depletion or chronic fatigue.", am: "ባህላዊ ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
    ],
  },
  {
    id: "rear-sides",
    zone: "Rear Sides",
    am: "የኋላ ጠርዝ",
    organ: "Traditional symbolic association",
    organAm: "ባህላዊ ምሳሌያዊ ግንኙነት",
    color: "emerald",
    emoji: "💚",
    description: "Some charts associate the rear sides with liver symbolism. The tongue cannot show liver or gallbladder function, or diagnose a problem in either organ.",
    signs: [
      { sign: "Red or purple tinge", reading: "A traditional symbolic description only; it cannot identify liver heat, stagnation, or disease.", am: "ባህላዊ ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
      { sign: "Pale sides", reading: "A visual observation, not evidence of liver depletion or another condition.", am: "ባህላዊ ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
      { sign: "Raised bumps (sides)", reading: "Bumps have many possible causes and cannot establish stress or liver function.", am: "ባህላዊ ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
    ],
  },
  {
    id: "root",
    zone: "Root (Back)",
    am: "ሥር",
    organ: "Traditional symbolic association",
    organAm: "ባህላዊ ምሳሌያዊ ግንኙነት",
    color: "indigo",
    emoji: "💧",
    description: "Some traditional charts assign symbolic meaning to the rear of the tongue. Appearance in this area cannot assess kidney, bladder, or water balance.",
    signs: [
      { sign: "Thick coat at root", reading: "A traditional visual motif, not a measure of water metabolism or kidney function.", am: "ባህላዊ ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
      { sign: "No coat at root", reading: "This appearance cannot establish kidney health, depletion, or fatigue.", am: "ባህላዊ ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
      { sign: "Deep red root", reading: "A visual description only; it cannot establish a deficiency or other condition.", am: "ባህላዊ ምሳሌያዊ ነጸብራቅ ብቻ ነው" },
    ],
  },
];

const COAT_TYPES = [
  { id: "thin-white", label: "Thin White", am: "ቀጭን ነጭ", note: "A visual description found in some traditional references; not a health baseline or diagnostic result.", color: "bg-stone-100/10 border-stone-400/40 text-stone-200" },
  { id: "thick-white", label: "Thick White", am: "ወፍራም ነጭ", note: "Some traditions attach symbolism to this appearance. It cannot establish a digestive or other condition.", color: "bg-stone-300/10 border-stone-300/40 text-stone-200" },
  { id: "yellow", label: "Yellow Coat", am: "ቢጫ ሽፋን", note: "A colour description only; it cannot show inflammation, infection, or organ function.", color: "bg-yellow-500/10 border-yellow-500/40 text-yellow-200" },
  { id: "grey-black", label: "Grey / Black", am: "ግራጫ / ጥቁር", note: "A visible change with many possible causes. Seek a qualified clinician for persistent or concerning changes.", color: "bg-stone-700/30 border-stone-500/40 text-stone-300" },
  { id: "none", label: "No Visible Coat", am: "ሽፋን የለም", note: "A visual description only; it cannot establish deficiency, dehydration, or chronic fatigue.", color: "bg-rose-500/5 border-rose-500/30 text-rose-200" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function TongueReadingPage() {
  const [activeZone, setActiveZone] = useState(TONGUE_ZONES[0].id);
  const [expandedSign, setExpandedSign] = useState<string | null>(null);

  const zone = TONGUE_ZONES.find((z) => z.id === activeZone) ?? TONGUE_ZONES[0];

  const colorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
    rose:    { border: "border-rose-500/40",    bg: "bg-rose-500/10",    text: "text-rose-200",    badge: "bg-rose-500/20 border-rose-400/40 text-rose-200" },
    sky:     { border: "border-sky-500/40",     bg: "bg-sky-500/10",     text: "text-sky-200",     badge: "bg-sky-500/20 border-sky-400/40 text-sky-200" },
    amber:   { border: "border-amber-500/40",   bg: "bg-amber-500/10",   text: "text-amber-200",   badge: "bg-amber-500/20 border-amber-400/40 text-amber-200" },
    emerald: { border: "border-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-200", badge: "bg-emerald-500/20 border-emerald-400/40 text-emerald-200" },
    indigo:  { border: "border-indigo-500/40",  bg: "bg-indigo-500/10",  text: "text-indigo-200",  badge: "bg-indigo-500/20 border-indigo-400/40 text-indigo-200" },
  };
  const c = colorMap[zone.color] ?? colorMap.amber;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-10">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <header>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span>Body-Sign Reading · Tongue</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Tongue Reading{" "}
          <span lang="am" className="block text-2xl font-semibold text-amber-300 sm:inline sm:text-3xl">
            የምላስ ንባብ
          </span>
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-stone-400 leading-relaxed">
          This educational guide documents symbolic associations found in traditional body-sign systems.
          Tongue appearance does not reveal organ function, diagnose illness, or establish emotional traits.
          A practitioner may discuss an optional photo as cultural material only; no automated image analysis is performed.
        </p>
      </header>

      <div role="note" className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/[0.08] p-4 text-sm leading-relaxed text-amber-100">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-300" aria-hidden="true" />
        <p><strong>Important:</strong> Zone-to-organ maps and sign meanings below are traditional symbolic claims, not scientifically validated health indicators. Photos are optional, private to a booked practitioner team, and never processed by an automated diagnostic model.</p>
      </div>

      {/* ── Live Camera Tongue Scanner ─────────────────────────── */}
      <section aria-labelledby="live-camera-scanner" className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-400" />
          <h2 id="live-camera-scanner" className="text-xl font-bold text-white">
            Interactive Camera Tongue Biometric Scanner
          </h2>
        </div>
        <HexacoreCameraScanner initialType="tongue" />
      </section>

      {/* ── Tongue Diagram (SVG zones) + Zone Selector ─────────── */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">

        {/* Diagram */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-56 h-72 sm:w-64 sm:h-80">
            <svg viewBox="0 0 200 260" className="w-full h-full" aria-label="Tongue zone diagram">
              {/* Base tongue shape */}
              <ellipse cx="100" cy="130" rx="75" ry="105" fill="#1c1917" stroke="#57534e" strokeWidth="1.5" />
              {/* Root zone */}
              <ellipse
                cx="100" cy="215" rx="70" ry="35"
                fill={activeZone === "root" ? "#4f46e510" : "#09090b"}
                stroke={activeZone === "root" ? "#6366f1" : "#3f3f46"}
                strokeWidth="1.5"
                className="cursor-pointer transition-all"
                onClick={() => setActiveZone("root")}
                aria-label="Root zone"
              />
              {/* Rear sides */}
              <ellipse
                cx="42" cy="175" rx="28" ry="40"
                fill={activeZone === "rear-sides" ? "#10b98110" : "#09090b"}
                stroke={activeZone === "rear-sides" ? "#10b981" : "#3f3f46"}
                strokeWidth="1.5"
                className="cursor-pointer transition-all"
                onClick={() => setActiveZone("rear-sides")}
                aria-label="Rear left side"
              />
              <ellipse
                cx="158" cy="175" rx="28" ry="40"
                fill={activeZone === "rear-sides" ? "#10b98110" : "#09090b"}
                stroke={activeZone === "rear-sides" ? "#10b981" : "#3f3f46"}
                strokeWidth="1.5"
                className="cursor-pointer transition-all"
                onClick={() => setActiveZone("rear-sides")}
                aria-label="Rear right side"
              />
              {/* Center */}
              <ellipse
                cx="100" cy="140" rx="42" ry="55"
                fill={activeZone === "center" ? "#f59e0b10" : "#09090b"}
                stroke={activeZone === "center" ? "#f59e0b" : "#3f3f46"}
                strokeWidth="1.5"
                className="cursor-pointer transition-all"
                onClick={() => setActiveZone("center")}
                aria-label="Centre zone"
              />
              {/* Front sides */}
              <ellipse
                cx="52" cy="105" rx="24" ry="32"
                fill={activeZone === "front-sides" ? "#0ea5e910" : "#09090b"}
                stroke={activeZone === "front-sides" ? "#0ea5e9" : "#3f3f46"}
                strokeWidth="1.5"
                className="cursor-pointer transition-all"
                onClick={() => setActiveZone("front-sides")}
                aria-label="Front left side"
              />
              <ellipse
                cx="148" cy="105" rx="24" ry="32"
                fill={activeZone === "front-sides" ? "#0ea5e910" : "#09090b"}
                stroke={activeZone === "front-sides" ? "#0ea5e9" : "#3f3f46"}
                strokeWidth="1.5"
                className="cursor-pointer transition-all"
                onClick={() => setActiveZone("front-sides")}
                aria-label="Front right side"
              />
              {/* Tip */}
              <ellipse
                cx="100" cy="52" rx="34" ry="28"
                fill={activeZone === "tip" ? "#f4435610" : "#09090b"}
                stroke={activeZone === "tip" ? "#f44336" : "#3f3f46"}
                strokeWidth="1.5"
                className="cursor-pointer transition-all"
                onClick={() => setActiveZone("tip")}
                aria-label="Tip zone"
              />
              {/* Labels */}
              <text x="100" y="55" textAnchor="middle" fontSize="9" fill="#fca5a5" className="pointer-events-none select-none">Tip</text>
              <text x="100" y="140" textAnchor="middle" fontSize="9" fill="#fcd34d" className="pointer-events-none select-none">Centre</text>
              <text x="100" y="218" textAnchor="middle" fontSize="9" fill="#a5b4fc" className="pointer-events-none select-none">Root</text>
            </svg>
          </div>
          <p className="text-[11px] text-stone-500 text-center max-w-[14rem]">
            Tap or click any zone to explore its traditional body-sign significance.
          </p>
        </div>

        {/* Zone Detail */}
        <div className={`rounded-3xl border ${c.border} ${c.bg} p-6 space-y-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className={`text-[10px] font-mono uppercase tracking-widest ${c.text}`}>Zone</span>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {zone.emoji} {zone.zone}
              </h2>
              <p lang="am" className={`text-sm font-semibold ${c.text}`}>{zone.am}</p>
            </div>
            <div className={`shrink-0 rounded-2xl border px-3 py-1.5 text-xs font-bold ${c.badge}`}>
              {zone.organ}
              <span lang="am" className="block text-[10px] font-normal opacity-70">{zone.organAm}</span>
            </div>
          </div>

          <p className="text-sm text-stone-300 leading-relaxed">{zone.description}</p>

          <div className="space-y-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>Common Signs & Reflections</h3>
            {zone.signs.map((s, i) => {
              const key = `${zone.id}-${i}`;
              const open = expandedSign === key;
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-stone-800 bg-stone-950/60"
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => setExpandedSign(open ? null : key)}
                  >
                    <span className="text-sm font-semibold text-stone-200">{s.sign}</span>
                    {open ? <ChevronUp className="size-4 text-stone-400 shrink-0" /> : <ChevronDown className="size-4 text-stone-400 shrink-0" />}
                  </button>
                  {open && (
                    <div className="px-4 pb-4 space-y-1">
                      <p className="text-sm text-amber-200">{s.reading}</p>
                      <p lang="am" className="text-xs text-stone-500">{s.am}</p>
                      <p className="text-[11px] text-stone-600 italic mt-2">
                        This reading is reflective only. Consult a qualified practitioner for clinical assessment.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Zone Pill Selector ────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {TONGUE_ZONES.map((z) => {
          const zc = colorMap[z.color] ?? colorMap.amber;
          return (
            <button
              key={z.id}
              onClick={() => setActiveZone(z.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
                activeZone === z.id
                  ? `${zc.bg} ${zc.border} ${zc.text}`
                  : "border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-600"
              }`}
            >
              <span>{z.emoji}</span>
              <span>{z.zone}</span>
              <span lang="am" className="text-[11px] opacity-60">{z.am}</span>
            </button>
          );
        })}
      </div>

      {/* ── Coat Reference ────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
          <BookOpen className="size-5 text-amber-400" aria-hidden="true" />
          Tongue Coat Reference
          <span lang="am" className="text-base font-semibold text-amber-300">— የምላስ ሽፋን ምልክቶች</span>
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COAT_TYPES.map((ct) => (
            <div key={ct.id} className={`rounded-2xl border p-4 ${ct.color}`}>
              <p className="font-bold text-sm">{ct.label}</p>
              <p lang="am" className="text-[11px] opacity-60 mb-2">{ct.am}</p>
              <p className="text-xs leading-relaxed opacity-80">{ct.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Practitioner Note ─────────────────────────────────────── */}
      <section className="rounded-3xl border border-stone-800 bg-stone-900/50 p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
          <Info className="size-4" aria-hidden="true" />
          Practitioner Notes
        </div>
        <ul className="space-y-2 text-sm text-stone-300 list-none">
          {[
            "When discussing an optional image, use neutral light to describe what is visible; colour is not a health measurement.",
            "Ask permission before viewing or discussing an image, and let the client decline or stop at any time.",
            "Food, drink, oral care, lighting, and many other factors can change appearance.",
            "Discuss the history and limits of symbolic interpretations; do not combine features into a health or personality assessment.",
            "Encourage the client to consult a qualified health professional about persistent, painful, or concerning changes.",
          ].map((note, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-amber-400 font-bold shrink-0">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Disclaimer + Navigation ───────────────────────────────── */}
      <footer className="flex flex-col gap-4 border-t border-stone-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-[11px] text-stone-500 max-w-xl">
          <AlertTriangle className="size-3.5 shrink-0 text-amber-700 mt-0.5" aria-hidden="true" />
          Tongue reading is a reflective cultural tool. It does not constitute a diagnosis, prognosis, or prescription.
          Always direct urgent or safety-critical concerns to qualified medical professionals.
        </p>
        <Link
          href="/body-reading/palm"
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 transition-colors shrink-0"
        >
          Palm Reading <ArrowRight className="size-4" />
        </Link>
      </footer>
    </div>
  );
}
