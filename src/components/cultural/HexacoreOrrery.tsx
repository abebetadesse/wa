"use client";

import { useMemo, useState } from "react";
import {
  CREATION_DAY_MAPPINGS,
  HEXACORE_ASPECTS,
  HEXACORE_CORES,
  HEXACORE_FREQUENCIES,
  HEXACORE_PAIRS,
  type HexacoreCore,
} from "@/lib/cultural/hexacoreArcana";

const CORE_COLORS: Record<string, string> = {
  spirit: "#9370DB",
  power: "#FF6347",
  humanity: "#4169E1",
  peace: "#DAA520",
  creation: "#32CD32",
  order: "#00CED1",
};

const CORE_POSITIONS: Record<string, [number, number]> = {
  spirit: [300, 170],
  power: [440, 250],
  humanity: [440, 390],
  peace: [300, 470],
  creation: [160, 390],
  order: [160, 250],
};

function coreById(id: string) {
  return HEXACORE_CORES.find((core) => core.id === id) ?? HEXACORE_CORES[0];
}

export default function HexacoreOrrery() {
  const [selectedCoreId, setSelectedCoreId] = useState<HexacoreCore["id"]>("spirit");
  const selectedCore = coreById(selectedCoreId);
  const selectedAspects = useMemo(() => HEXACORE_ASPECTS.filter((aspect) => aspect.coreId === selectedCoreId), [selectedCoreId]);
  const day = CREATION_DAY_MAPPINGS.find((mapping) => mapping.day === selectedCore.creationDay);
  const pairs = HEXACORE_PAIRS.filter((pair) => pair.left === selectedCore.name || pair.right === selectedCore.name);

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] items-start">
      <div className="rounded-3xl border border-indigo-400/20 bg-[#080817] p-3 md:p-6 shadow-2xl shadow-indigo-950/30">
        <div className="flex items-center justify-between px-2 pb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-300/70">Grand Orrery</p>
            <h2 className="text-lg font-semibold text-white">Six cores · 36 aspects · 216 frequencies</h2>
          </div>
          <span className="hidden sm:inline rounded-full border border-amber-300/20 px-3 py-1 text-[10px] text-amber-200/70">Reflective layer</span>
        </div>
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_center,#252044_0%,#0b0b1e_42%,#05050d_100%)]">
          <svg viewBox="0 0 600 600" role="img" aria-labelledby="hexacore-title hexacore-desc" className="h-full w-full">
            <title id="hexacore-title">Interactive Hexacore Arcana wheel</title>
            <desc id="hexacore-desc">Six selectable cores connected around a still point, with concentric aspect and frequency rings.</desc>
            <defs>
              <radialGradient id="hexacore-glow">
                <stop offset="0%" stopColor="#facc15" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
              </radialGradient>
            </defs>
            {[235, 200, 165, 130, 95].map((radius, index) => (
              <circle key={radius} cx="300" cy="300" r={radius} fill="none" stroke={index < 2 ? "#4a4a6a" : "#2a2a4a"} strokeWidth={index === 2 ? 2 : 1} strokeDasharray={index % 2 ? "3 6" : undefined} />
            ))}
            {HEXACORE_CORES.map((core) => {
              const [x, y] = CORE_POSITIONS[core.id];
              const color = CORE_COLORS[core.id];
              return <line key={`spoke-${core.id}`} x1="300" y1="300" x2={x} y2={y} stroke={color} strokeOpacity={selectedCoreId === core.id ? 0.7 : 0.2} strokeWidth={selectedCoreId === core.id ? 2 : 1} />;
            })}
            <circle cx="300" cy="300" r="48" fill="url(#hexacore-glow)" />
            <circle cx="300" cy="300" r="7" fill="#facc15" />
            <text x="300" y="326" fill="#fde68a" fontSize="12" textAnchor="middle">Still Point</text>
            {HEXACORE_CORES.map((core) => {
              const [x, y] = CORE_POSITIONS[core.id];
              const color = CORE_COLORS[core.id];
              const selected = selectedCoreId === core.id;
              return (
                <g key={core.id} role="button" tabIndex={0} aria-label={`Select ${core.name} core`} onClick={() => setSelectedCoreId(core.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedCoreId(core.id); }} className="cursor-pointer">
                  <circle cx={x} cy={y} r={selected ? 46 : 39} fill={color} fillOpacity={selected ? 0.85 : 0.55} stroke={selected ? "#fff" : color} strokeWidth={selected ? 3 : 1.5} />
                  <text x={x} y={y - 4} fill="#fff" fontSize="12" fontWeight="700" textAnchor="middle">{core.name.toUpperCase()}</text>
                  <text x={x} y={y + 13} fill="#fff" fillOpacity="0.8" fontSize="10" textAnchor="middle">{core.soundHz} Hz</text>
                </g>
              );
            })}
            {selectedAspects.map((aspect, index) => {
              const angle = (index / selectedAspects.length) * Math.PI * 2 - Math.PI / 2;
              const x = 300 + Math.cos(angle) * 205;
              const y = 300 + Math.sin(angle) * 205;
              return <g key={aspect.id}><circle cx={x} cy={y} r="5" fill={CORE_COLORS[selectedCoreId]} /><title>{aspect.id}: {aspect.name}</title></g>;
            })}
          </svg>
        </div>
        <p className="px-2 pt-3 text-xs text-slate-500">Select a core or use Tab and Enter. The wheel is a cultural reflection interface, not a diagnostic or predictive instrument.</p>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-widest" style={{ color: CORE_COLORS[selectedCore.id] }}>{selectedCore.creationDay} · Core {selectedCore.number}</p>
          <h2 className="mt-1 text-2xl font-bold text-white">{selectedCore.name}</h2>
          <p className="mt-2 text-sm text-slate-300">{selectedCore.essence}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div><dt className="text-slate-500">Virtue</dt><dd className="text-emerald-300">{selectedCore.virtue}</dd></div>
            <div><dt className="text-slate-500">Gift</dt><dd className="text-emerald-300">{selectedCore.gift}</dd></div>
            <div><dt className="text-slate-500">Shadow</dt><dd className="text-rose-300">{selectedCore.shadow}</dd></div>
            <div><dt className="text-slate-500">Plant</dt><dd className="text-amber-200">{selectedCore.plant}</dd></div>
          </dl>
        </div>
        {day && <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-5"><p className="text-xs uppercase tracking-widest text-amber-300">Creation-day mapping</p><p className="mt-2 text-sm text-slate-200">{day.relationalMeaning}</p><p className="mt-3 text-xs text-slate-400">Practice: {day.practice} · {day.soundHz} Hz</p></div>}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs uppercase tracking-widest text-slate-400">Aspects</p><div className="mt-3 flex flex-wrap gap-2">{selectedAspects.map((aspect) => <span key={aspect.id} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">{aspect.id} · {aspect.name}</span>)}</div><p className="mt-4 text-xs text-slate-500">{HEXACORE_FREQUENCIES.filter((frequency) => frequency.aspectId === selectedAspects[0]?.id).length} reflective frequency states per aspect.</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs uppercase tracking-widest text-slate-400">Relationships</p><div className="mt-3 space-y-2">{pairs.slice(0, 4).map((pair) => <div key={pair.id} className="text-xs"><span className="text-white">{pair.name}</span><span className="ml-2 text-slate-500">{pair.gift}</span></div>)}</div></div>
      </aside>
    </section>
  );
}
