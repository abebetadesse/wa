"use client";

import { useState } from "react";
import { AstrologicalAspect, CelestialBody, PlanetaryPosition, ZodiacSignName } from "@/lib/profiling/types";

interface NatalChartWheelProps {
  planets: PlanetaryPosition[];
  aspects: AstrologicalAspect[];
  ascendant: { sign: ZodiacSignName; degree: number };
  midheaven: { sign: ZodiacSignName; degree: number };
}

const ZODIAC_DATA: { name: ZodiacSignName; symbol: string; color: string; geez: string }[] = [
  { name: "Aries", symbol: "♈", color: "#f87171", geez: "ሐመል" },
  { name: "Taurus", symbol: "♉", color: "#34d399", geez: "ሰውር" },
  { name: "Gemini", symbol: "♊", color: "#38bdf8", geez: "ጀውዛ" },
  { name: "Cancer", symbol: "♋", color: "#2dd4bf", geez: "ሰርጣን" },
  { name: "Leo", symbol: "♌", color: "#fbbf24", geez: "አሰድ" },
  { name: "Virgo", symbol: "♍", color: "#10b981", geez: "ሰንቡላ" },
  { name: "Libra", symbol: "♎", color: "#60a5fa", geez: "ሚዛን" },
  { name: "Scorpio", symbol: "♏", color: "#a78bfa", geez: "አቅራብ" },
  { name: "Sagittarius", symbol: "♐", color: "#f97316", geez: "ቀውስ" },
  { name: "Capricorn", symbol: "♑", color: "#6ee7b7", geez: "ጃዲ" },
  { name: "Aquarius", symbol: "♒", color: "#818cf8", geez: "ደለው" },
  { name: "Pisces", symbol: "♓", color: "#22d3ee", geez: "ሁት" },
];

const PLANET_GLYPHS: Record<CelestialBody, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
  Ascendant: "AC",
  Midheaven: "MC",
};

export default function NatalChartWheel({ planets, aspects, ascendant, midheaven }: NatalChartWheelProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetaryPosition | null>(planets[0] || null);
  const [showAspectGrid, setShowAspectGrid] = useState(false);

  // SVG dimensions
  const size = 520;
  const center = size / 2;
  const radius = center - 20;
  const innerRadius = radius - 55;
  const aspectInnerRadius = innerRadius - 40;

  // Convert longitude (0-360) to radians for SVG positioning
  // Adjust so 0° (Aries) is at 9 o'clock or aligned with Ascendant
  const ascDegree = ascendant.degree || 0;
  const getAngle = (deg: number) => {
    // Standard astrological orientation: Ascendant on left (180 deg in standard polar, or counter-clockwise from east)
    const angleDeg = (deg - ascDegree + 180) % 360;
    return (angleDeg * Math.PI) / 180;
  };

  const getCoordinates = (deg: number, r: number) => {
    const angle = getAngle(deg);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-100">Interactive Natal Chart Wheel</h3>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
              Time Passages Precision
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ascendant: <strong className="text-slate-200">{ascendant.sign} {ascendant.degree.toFixed(1)}°</strong> •
            Midheaven: <strong className="text-slate-200">{midheaven.sign} {midheaven.degree.toFixed(1)}°</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAspectGrid(!showAspectGrid)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              showAspectGrid
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            {showAspectGrid ? "Show Chart Wheel" : "View Aspect Grid"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Wheel View */}
        <div className="lg:col-span-7 flex justify-center">
          {!showAspectGrid ? (
            <div className="relative">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto select-none">
                <defs>
                  <radialGradient id="wheelCenterGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="70%" stopColor="#020617" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </radialGradient>
                </defs>

                {/* Outer Background Circle */}
                <circle cx={center} cy={center} r={radius} fill="#030712" stroke="#334155" strokeWidth="2" />
                <circle cx={center} cy={center} r={innerRadius} fill="url(#wheelCenterGrad)" stroke="#1e293b" strokeWidth="1.5" />
                <circle cx={center} cy={center} r={aspectInnerRadius} fill="#020617" stroke="#1e293b" strokeDasharray="3 3" />

                {/* 12 Zodiac Sign Wedges */}
                {ZODIAC_DATA.map((sign, i) => {
                  const startAngle = ((i * 30 - ascDegree + 180) * Math.PI) / 180;
                  const endAngle = (((i + 1) * 30 - ascDegree + 180) * Math.PI) / 180;
                  const midAngle = (startAngle + endAngle) / 2;

                  const x1 = center + radius * Math.cos(startAngle);
                  const y1 = center + radius * Math.sin(startAngle);
                  const x2 = center + radius * Math.cos(endAngle);
                  const y2 = center + radius * Math.sin(endAngle);
                  const x3 = center + innerRadius * Math.cos(endAngle);
                  const y3 = center + innerRadius * Math.sin(endAngle);
                  const x4 = center + innerRadius * Math.cos(startAngle);
                  const y4 = center + innerRadius * Math.sin(startAngle);

                  const symbolX = center + (radius - 26) * Math.cos(midAngle);
                  const symbolY = center + (radius - 26) * Math.sin(midAngle);

                  return (
                    <g key={sign.name}>
                      <path
                        d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`}
                        fill={i % 2 === 0 ? "rgba(15, 23, 42, 0.6)" : "rgba(30, 41, 59, 0.4)"}
                        stroke="#334155"
                        strokeWidth="0.8"
                      />
                      <text
                        x={symbolX}
                        y={symbolY}
                        fill={sign.color}
                        fontSize="15"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {sign.symbol}
                      </text>
                    </g>
                  );
                })}

                {/* 12 House Dividing Spoke Lines */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = ((i * 30 + 180) * Math.PI) / 180;
                  const x1 = center + innerRadius * Math.cos(angle);
                  const y1 = center + innerRadius * Math.sin(angle);
                  const x2 = center + 25 * Math.cos(angle);
                  const y2 = center + 25 * Math.sin(angle);

                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="0.8" strokeDasharray={i % 3 === 0 ? "none" : "2 2"} />;
                })}

                {/* Aspect Chords in Inner Circle */}
                {aspects.map((asp, i) => {
                  const p1 = planets.find((p) => p.planet === asp.planet1);
                  const p2 = planets.find((p) => p.planet === asp.planet2);
                  if (!p1 || !p2) return null;

                  const pt1 = getCoordinates(p1.totalLongitude, aspectInnerRadius);
                  const pt2 = getCoordinates(p2.totalLongitude, aspectInnerRadius);

                  let strokeColor = "#38bdf8"; // trine (harmonious)
                  if (asp.aspectType === "square") strokeColor = "#f43f5e";
                  else if (asp.aspectType === "opposition") strokeColor = "#f59e0b";
                  else if (asp.aspectType === "sextile") strokeColor = "#10b981";
                  else if (asp.aspectType === "conjunction") strokeColor = "#a855f7";

                  return (
                    <line
                      key={`aspect_${i}`}
                      x1={pt1.x}
                      y1={pt1.y}
                      x2={pt2.x}
                      y2={pt2.y}
                      stroke={strokeColor}
                      strokeWidth={asp.orb < 2 ? "1.8" : "1"}
                      opacity={asp.orb < 2 ? "0.85" : "0.5"}
                    />
                  );
                })}

                {/* Planetary Glyphs */}
                {planets.map((p) => {
                  const coords = getCoordinates(p.totalLongitude, innerRadius - 20);
                  const isSelected = selectedPlanet?.planet === p.planet;

                  return (
                    <g
                      key={p.planet}
                      onClick={() => setSelectedPlanet(p)}
                      className="cursor-pointer transition-transform hover:scale-125"
                    >
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r={isSelected ? "14" : "10"}
                        fill={isSelected ? "#10b981" : "#1e293b"}
                        stroke={isSelected ? "#ecfdf5" : "#64748b"}
                        strokeWidth="1.5"
                      />
                      <text
                        x={coords.x}
                        y={coords.y}
                        fill="#ffffff"
                        fontSize={isSelected ? "13" : "10"}
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {PLANET_GLYPHS[p.planet] || "•"}
                      </text>
                    </g>
                  );
                })}

                {/* Center Core Circle */}
                <circle cx={center} cy={center} r="24" fill="#0f172a" stroke="#emerald-500" strokeWidth="1.5" />
                <text x={center} y={center} fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                  ጥበብ
                </text>
              </svg>

              <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /> Trine (120°)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Sextile (60°)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Square (90°)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Opposition (180°)</span>
              </div>
            </div>
          ) : (
            /* Aspect Grid Matrix View */
            <div className="w-full overflow-x-auto bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="p-2">Planets</th>
                    <th className="p-2">Aspect</th>
                    <th className="p-2">Orb</th>
                    <th className="p-2">Nature</th>
                    <th className="p-2">health / Somatic Influence</th>
                  </tr>
                </thead>
                <tbody>
                  {aspects.map((asp, idx) => (
                    <tr key={idx} className="border-b border-slate-900/80 hover:bg-slate-800/40">
                      <td className="p-2 font-medium text-slate-200">
                        {asp.planet1} {PLANET_GLYPHS[asp.planet1]} ↔ {asp.planet2} {PLANET_GLYPHS[asp.planet2]}
                      </td>
                      <td className="p-2 capitalize text-sky-400 font-semibold">{asp.aspectType}</td>
                      <td className="p-2 text-slate-400">{asp.orb.toFixed(1)}°</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          asp.nature === "harmonious" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-rose-950 text-rose-300 border border-rose-800"
                        }`}>
                          {asp.nature}
                        </span>
                      </td>
                      <td className="p-2 text-slate-300">{asp.healthImpact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Planet Details Panel */}
        <div className="lg:col-span-5 space-y-4">
          {selectedPlanet ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-xl font-bold text-emerald-300">
                    {PLANET_GLYPHS[selectedPlanet.planet]}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-100">{selectedPlanet.planet}</h4>
                    <p className="text-xs text-slate-400 font-medium">
                      {selectedPlanet.sign} • House {selectedPlanet.house} • {selectedPlanet.degree.toFixed(2)}°
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
                  {selectedPlanet.ethiopianName}
                </span>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <p className="font-semibold text-emerald-400 mb-1">Ethiopian Traditional Sphere:</p>
                {selectedPlanet.ethiopianInterpretation}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Physiological & Somatic Correlates</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Governed Organs:</span>
                    <span className="text-slate-200 font-medium">{selectedPlanet.healthAssociations.organs.join(", ")}</span>
                  </div>
                  <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Vitality Strength:</span>
                    <span className="text-emerald-400 font-medium">{selectedPlanet.healthAssociations.vitalityStrengths[0] || "Resilient stamina"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total Longitude: {selectedPlanet.totalLongitude.toFixed(2)}°</span>
                <span>Element: <strong className="text-slate-300 capitalize">{selectedPlanet.element}</strong></span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              Click any planet on the wheel to view coordinates and interpretations.
            </div>
          )}

          {/* Quick Planets Pill List */}
          <div className="flex flex-wrap gap-1.5">
            {planets.map((p) => (
              <button
                key={p.planet}
                onClick={() => setSelectedPlanet(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  selectedPlanet?.planet === p.planet
                    ? "bg-emerald-600 text-white border-emerald-400"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {PLANET_GLYPHS[p.planet]} {p.planet}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
