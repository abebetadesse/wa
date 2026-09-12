"use client";

import { useState } from "react";
import {
  DashaPeriod,
  DivisionalChartPlacement,
  PanchangData,
  PrashnaKundliResult,
  VedicPlanetaryPlacement,
} from "@/lib/profiling/extendedTypes";
import { generatePrashnaKundli } from "@/lib/profiling/astrology/vedicAstrologyEngine";

interface VedicChartViewerProps {
  ayanamsha: number;
  d1Placements: VedicPlanetaryPlacement[];
  d9Placements: DivisionalChartPlacement;
  dashas: DashaPeriod[];
  panchang: PanchangData;
}

export default function VedicChartViewer({
  ayanamsha,
  d1Placements,
  d9Placements,
  dashas,
  panchang,
}: VedicChartViewerProps) {
  const [activeChartTab, setActiveChartTab] = useState<"D1" | "D9">("D1");
  const [prashnaQuestion, setPrashnaQuestion] = useState("");
  const [prashnaCity, setPrashnaCity] = useState("Addis Ababa");
  const [prashnaResult, setPrashnaResult] = useState<PrashnaKundliResult | null>(null);
  const [isPrashnaLoading, setIsPrashnaLoading] = useState(false);

  const handleRunPrashna = () => {
    if (!prashnaQuestion.trim()) return;
    setIsPrashnaLoading(true);
    setTimeout(() => {
      const result = generatePrashnaKundli(prashnaQuestion, prashnaCity);
      setPrashnaResult(result);
      setIsPrashnaLoading(false);
    }, 400);
  };

  const currentDasha = dashas.find((d) => d.isCurrent) || dashas[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-100">Vedic (Jyotish) & Divisional Kundli</h3>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                AstroSage Kundli Integration
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Lahiri Ayanamsha: <strong className="text-slate-200">{ayanamsha.toFixed(4)}°</strong> • Sidereal Nirayana System
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveChartTab("D1")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                activeChartTab === "D1"
                  ? "bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-900/40"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              D1 Rashi (Root Incarnation)
            </button>
            <button
              onClick={() => setActiveChartTab("D9")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                activeChartTab === "D9"
                  ? "bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-900/40"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              D9 Navamsha (Soul & Dharma)
            </button>
          </div>
        </div>

        {/* Traditional Diamond Kundli Graphical Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-[420px] aspect-square bg-slate-950/80 border-2 border-amber-500/40 rounded-xl p-3 shadow-inner">
              {/* Diamond Kundli SVG */}
              <svg viewBox="0 0 300 300" className="w-full h-full select-none">
                {/* Outer frame */}
                <rect x="0" y="0" width="300" height="300" fill="none" stroke="#d97706" strokeWidth="2" />
                {/* Diagonal crosses */}
                <line x1="0" y1="0" x2="300" y2="300" stroke="#b45309" strokeWidth="1.5" />
                <line x1="300" y1="0" x2="0" y2="300" stroke="#b45309" strokeWidth="1.5" />
                {/* Inscribed Diamond */}
                <polygon points="150,0 300,150 150,300 0,150" fill="none" stroke="#d97706" strokeWidth="2" />

                {/* 12 Bhava House labels and planets */}
                {/* House 1 (Top Center Diamond) */}
                <text x="150" y="70" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">
                  1st (Lagna)
                </text>
                <text x="150" y="90" fill="#38bdf8" fontSize="10" textAnchor="middle">
                  {d1Placements.filter((p) => p.house === 1).map((p) => p.planet.slice(0, 2)).join(" ")}
                </text>

                {/* House 2 (Top Left Triangle) */}
                <text x="75" y="45" fill="#fef08a" fontSize="10" textAnchor="middle">2nd</text>
                <text x="75" y="62" fill="#38bdf8" fontSize="9" textAnchor="middle">
                  {d1Placements.filter((p) => p.house === 2).map((p) => p.planet.slice(0, 2)).join(" ")}
                </text>

                {/* House 3 (Left Top Triangle) */}
                <text x="45" y="75" fill="#fef08a" fontSize="10" textAnchor="middle">3rd</text>
                <text x="45" y="92" fill="#38bdf8" fontSize="9" textAnchor="middle">
                  {d1Placements.filter((p) => p.house === 3).map((p) => p.planet.slice(0, 2)).join(" ")}
                </text>

                {/* House 4 (Left Diamond) */}
                <text x="70" y="150" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">4th (Sukha)</text>
                <text x="70" y="170" fill="#38bdf8" fontSize="10" textAnchor="middle">
                  {d1Placements.filter((p) => p.house === 4).map((p) => p.planet.slice(0, 2)).join(" ")}
                </text>

                {/* House 5 (Left Bottom Triangle) */}
                <text x="45" y="225" fill="#fef08a" fontSize="10" textAnchor="middle">5th</text>
                <text x="45" y="242" fill="#38bdf8" fontSize="9" textAnchor="middle">
                  {d1Placements.filter((p) => p.house === 5).map((p) => p.planet.slice(0, 2)).join(" ")}
                </text>

                {/* House 6 (Bottom Left Triangle) */}
                <text x="75" y="255" fill="#fef08a" fontSize="10" textAnchor="middle">6th</text>
                <text x="75" y="272" fill="#38bdf8" fontSize="9" textAnchor="middle">
                  {d1Placements.filter((p) => p.house === 6).map((p) => p.planet.slice(0, 2)).join(" ")}
                </text>

                {/* House 7 (Bottom Center Diamond) */}
                <text x="150" y="230" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">7th (Kalatra)</text>
                <text x="150" y="250" fill="#38bdf8" fontSize="10" textAnchor="middle">
                  {d1Placements.filter((p) => p.house === 7).map((p) => p.planet.slice(0, 2)).join(" ")}
                </text>

                {/* House 8 (Bottom Right Triangle) */}
                <text x="225" y="255" fill="#fef08a" fontSize="10" textAnchor="middle">8th</text>
                <text x="225" y="272" fill="#38bdf8" fontSize="9" textAnchor="middle">
                  {d1Placements.filter((p) => p.house === 8).map((p) => p.planet.slice(0, 2)).join(" ")}
                </text>

                {/* House 9 (Right Bottom Triangle) */}
                <text x="255" y="225" fill="#fef08a" fontSize="10" textAnchor="middle">9th (Dharma)</text>
                <text x="255" y="242" fill="#38bdf8" fontSize="9" textAnchor="middle">
                  {d1Placements.filter((p) => p.house === 9).map((p) => p.planet.slice(0, 2)).join(" ")}
                </text>

                {/* House 10 (Right Diamond) */}
                <text x="230" y="150" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">10th (Karma)</text>
                <text x="230" y="170" fill="#38bdf8" fontSize="10" textAnchor="middle">
                  {d1Placements.filter((p) => p.house === 10).map((p) => p.planet.slice(0, 2)).join(" ")}
                </text>

                {/* House 11 (Right Top Triangle) */}
                <text x="255" y="75" fill="#fef08a" fontSize="10" textAnchor="middle">11th (Labha)</text>
                <text x="255" y="92" fill="#38bdf8" fontSize="9" textAnchor="middle">
                  {d1Placements.filter((p) => p.house === 11).map((p) => p.planet.slice(0, 2)).join(" ")}
                </text>

                {/* House 12 (Top Right Triangle) */}
                <text x="225" y="45" fill="#fef08a" fontSize="10" textAnchor="middle">12th (Moksha)</text>
                <text x="225" y="62" fill="#38bdf8" fontSize="9" textAnchor="middle">
                  {d1Placements.filter((p) => p.house === 12).map((p) => p.planet.slice(0, 2)).join(" ")}
                </text>

                {/* Center Badge */}
                <circle cx="150" cy="150" r="16" fill="#0f172a" stroke="#d97706" strokeWidth="1" />
                <text x="150" y="154" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {activeChartTab}
                </text>
              </svg>
            </div>
          </div>

          {/* Planetary Placements Table */}
          <div className="lg:col-span-5 overflow-x-auto">
            <h4 className="text-sm font-semibold text-slate-200 mb-2">
              {activeChartTab === "D1" ? "D1 Rashi Sidereal Placements" : "D9 Navamsha Placements"}
            </h4>
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-2 max-h-[360px] overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-1.5">Planet</th>
                    <th className="p-1.5">Sidereal Sign</th>
                    <th className="p-1.5">Nakshatra</th>
                    <th className="p-1.5">House</th>
                    <th className="p-1.5">Dignity</th>
                  </tr>
                </thead>
                <tbody>
                  {activeChartTab === "D1"
                    ? d1Placements.map((p) => (
                        <tr key={p.planet} className="border-b border-slate-900/60 hover:bg-slate-800/40">
                          <td className="p-1.5 font-semibold text-slate-200">{p.planet}</td>
                          <td className="p-1.5 text-amber-300">{p.siderealSign} {p.degree.toFixed(1)}°</td>
                          <td className="p-1.5 text-slate-300">
                            <span className="block font-medium">{p.nakshatra.name} (P{p.nakshatra.pada})</span>
                            <span className="text-[10px] text-slate-400">{p.nakshatra.geezName}</span>
                          </td>
                          <td className="p-1.5 text-center font-bold text-slate-100">{p.house}</td>
                          <td className="p-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-emerald-400 border border-slate-700">
                              {p.dignity}
                            </span>
                          </td>
                        </tr>
                      ))
                    : d9Placements.placements.map((p) => (
                        <tr key={p.planet} className="border-b border-slate-900/60 hover:bg-slate-800/40">
                          <td className="p-1.5 font-semibold text-slate-200">{p.planet}</td>
                          <td className="p-1.5 text-amber-300">{p.sign}</td>
                          <td className="p-1.5 text-slate-400">—</td>
                          <td className="p-1.5 text-center font-bold text-slate-100">{p.house}</td>
                          <td className="p-1.5 text-slate-400 text-[10px]">Navamsha Pada</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Vimshottari Dasha System Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Vimshottari Dasha (120-Year Planetary Timeline)</h3>
            <p className="text-xs text-slate-400">Current Mahadasha: <strong className="text-amber-400">{currentDasha.planet}</strong> ({currentDasha.startDate} to {currentDasha.endDate})</p>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
            Active Period
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-9 gap-2">
          {dashas.map((d) => (
            <div
              key={d.planet}
              className={`p-3 rounded-xl border text-center transition-all ${
                d.isCurrent
                  ? "bg-amber-950/60 border-amber-500/60 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/30"
                  : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60"
              }`}
            >
              <span className="text-xs text-slate-400 block">{d.startDate.slice(0, 4)}</span>
              <span className={`text-sm font-bold block my-0.5 ${d.isCurrent ? "text-amber-300" : "text-slate-200"}`}>
                {d.planet}
              </span>
              <span className="text-[10px] text-slate-500 block">{d.endDate.slice(0, 4)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panchang & Prashna Kundli 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panchang Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100">Today's Traditional Panchang</h3>
            <span className="text-xs text-slate-400">{panchang.vaar.ethiopianName}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Tithi (Lunar Phase)</span>
              <span className="text-amber-400 font-semibold">{panchang.tithi.name}</span>
              <p className="text-[10px] text-slate-500 mt-1">{panchang.tithi.meaning}</p>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Nakshatra (Moon Mansion)</span>
              <span className="text-sky-400 font-semibold">{panchang.nakshatra.name} (P{panchang.nakshatra.pada})</span>
              <p className="text-[10px] text-slate-500 mt-1">{panchang.nakshatra.geezName}</p>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Yoga</span>
              <span className="text-emerald-400 font-semibold">{panchang.yoga.name}</span>
              <p className="text-[10px] text-slate-500 mt-1">Quality: {panchang.yoga.auspiciousness}</p>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Karana & Vaar</span>
              <span className="text-violet-400 font-semibold">{panchang.karana.name} • {panchang.vaar.dayOfWeek}</span>
              <p className="text-[10px] text-slate-500 mt-1">Lord: {panchang.vaar.rulingPlanet}</p>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
            <span>{panchang.auspiciousPeriod}</span>
            <span className="text-[11px] text-slate-400">Highland Timing</span>
          </div>
        </div>

        {/* Prashna Kundli (Horary) Query Tool */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Prashna Kundli (Horary Query)</h3>
              <p className="text-xs text-slate-400">Ask a question using real-time astrological GPS coordinates</p>
            </div>
            <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">GPS Mode</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Question</label>
              <input
                type="text"
                value={prashnaQuestion}
                onChange={(e) => setPrashnaQuestion(e.target.value)}
                placeholder="e.g., Will my proposed business partnership succeed this season?"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1">GPS Location Preset</label>
                <select
                  value={prashnaCity}
                  onChange={(e) => setPrashnaCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Addis Ababa">Addis Ababa (9.03° N, 38.74° E)</option>
                  <option value="Gondar">Gondar (12.60° N, 37.46° E)</option>
                  <option value="Lalibela">Lalibela (12.03° N, 39.04° E)</option>
                  <option value="Harar">Harar (9.31° N, 42.13° E)</option>
                  <option value="Mekelle">Mekelle (13.49° N, 39.47° E)</option>
                  <option value="Jimma">Jimma (7.67° N, 36.83° E)</option>
                </select>
              </div>

              <button
                onClick={handleRunPrashna}
                disabled={isPrashnaLoading || !prashnaQuestion.trim()}
                className="mt-5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-amber-950/60 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50"
              >
                {isPrashnaLoading ? "Casting..." : "Cast Prashna"}
              </button>
            </div>

            {prashnaResult && (
              <div className="mt-4 p-4 bg-slate-950/80 rounded-xl border border-amber-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between text-amber-400 font-semibold">
                  <span>Ascendant: {prashnaResult.prashnaAscendant.sign} ({prashnaResult.prashnaAscendant.nakshatra})</span>
                  <span className="text-emerald-400">Confidence: {prashnaResult.confidenceScore}%</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{prashnaResult.outcomePrediction}</p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Favorable: {prashnaResult.favorableDirections.join(", ")}</span>
                  <span>{prashnaResult.auspiciousTimingRecommendation}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
