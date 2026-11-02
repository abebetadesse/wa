"use client";

import { useState } from "react";
import {
  DashaPeriod,
  DivisionalChartPlacement,
  NakshatraInfo,
  PanchangData,
  PersonalDayAlignment,
  PrashnaKundliResult,
  VedicPlanetaryPlacement,
} from "@/lib/profiling/extendedTypes";
import { ZodiacSignName } from "@/lib/profiling/types";
import { generatePrashnaKundli } from "@/lib/profiling/astrology/vedicAstrologyEngine";
import { BIRTH_PLACE_SUGGESTIONS } from "@/lib/profiling/astrology/places";

interface VedicChartViewerProps {
  ayanamsha: number;
  d1Placements: VedicPlanetaryPlacement[];
  d9Placements: DivisionalChartPlacement;
  dashas: DashaPeriod[];
  panchang: PanchangData;
  lunarNodes?: { name: "Rahu" | "Ketu"; siderealSign: ZodiacSignName; degree: number; nakshatra: NakshatraInfo; house: number }[];
  lagna?: { siderealSign: ZodiacSignName; degree: number; nakshatra: NakshatraInfo; lord: string };
  /** Today's Moon against this person's birth Moon. */
  dayAlignment?: PersonalDayAlignment | null;
  /** Where the person lives; the Prashna chart is cast there unless they choose otherwise. */
  defaultCity?: string;
}

// Where each bhava sits in the North Indian diamond chart.
const KUNDLI_HOUSES: { house: number; x: number; y: number; label: string; emphasised?: boolean }[] = [
  { house: 1, x: 150, y: 70, label: "1st (Lagna)", emphasised: true },
  { house: 2, x: 75, y: 45, label: "2nd" },
  { house: 3, x: 45, y: 75, label: "3rd" },
  { house: 4, x: 70, y: 150, label: "4th (Sukha)", emphasised: true },
  { house: 5, x: 45, y: 225, label: "5th" },
  { house: 6, x: 75, y: 255, label: "6th" },
  { house: 7, x: 150, y: 230, label: "7th (Kalatra)", emphasised: true },
  { house: 8, x: 225, y: 255, label: "8th" },
  { house: 9, x: 255, y: 225, label: "9th (Dharma)" },
  { house: 10, x: 230, y: 150, label: "10th (Karma)", emphasised: true },
  { house: 11, x: 255, y: 75, label: "11th (Labha)" },
  { house: 12, x: 225, y: 45, label: "12th (Moksha)" },
];

const DIGNITY_STYLE: Record<string, string> = {
  Exalted: "text-brand border-brand/40",
  "Own Sign": "text-brand border-brand/30",
  Moolatrikona: "text-brand border-brand/30",
  Friendly: "text-info border-info/30",
  Neutral: "text-soft border-border",
  Enemy: "text-gold border-gold/30",
  Debilitated: "text-danger border-danger/40",
};

const CLASSICAL = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];

function formatDay(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export default function VedicChartViewer({
  ayanamsha,
  d1Placements,
  d9Placements,
  dashas,
  panchang,
  lunarNodes,
  lagna,
  dayAlignment,
  defaultCity,
}: VedicChartViewerProps) {
  const [activeChartTab, setActiveChartTab] = useState<"D1" | "D9">("D1");
  const [prashnaQuestion, setPrashnaQuestion] = useState("");
  const [prashnaCity, setPrashnaCity] = useState(defaultCity || panchang.location?.city || "Addis Ababa");
  const [prashnaResult, setPrashnaResult] = useState<PrashnaKundliResult | null>(null);
  const [isPrashnaLoading, setIsPrashnaLoading] = useState(false);
  const [locationNote, setLocationNote] = useState("");

  const handleRunPrashna = () => {
    if (!prashnaQuestion.trim()) return;
    setIsPrashnaLoading(true);
    setTimeout(() => {
      setPrashnaResult(generatePrashnaKundli(prashnaQuestion, prashnaCity));
      setIsPrashnaLoading(false);
    }, 400);
  };

  // The chart for a question belongs to the place it is asked from.
  const locateMe = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationNote("This device cannot share its location; choose a town instead.");
      return;
    }
    setLocationNote("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPrashnaCity(`${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`);
        setLocationNote("Using your current coordinates.");
      },
      () => setLocationNote("Location was not shared; choose a town instead."),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const currentDasha = dashas.find((d) => d.isCurrent) || dashas[0];
  const currentSub = currentDasha?.subPeriods?.find((sub) => sub.isCurrent);
  const nextDasha = dashas[dashas.indexOf(currentDasha) + 1];

  // Planets by bhava for whichever chart is showing.
  const occupants = (house: number): string => {
    const names =
      activeChartTab === "D1"
        ? [...d1Placements.filter((p) => p.house === house).map((p) => p.planet), ...(lunarNodes ?? []).filter((n) => n.house === house).map((n) => n.name)]
        : d9Placements.placements.filter((p) => p.house === house).map((p) => p.planet);
    return names
      .filter((name) => name !== "Ascendant" && name !== "Midheaven")
      .map((name) => name.slice(0, 2))
      .join(" ");
  };

  const atmakaraka = d1Placements.find((p) => p.karaka.startsWith("Atmakaraka"));
  const vargottama = d9Placements.placements.filter((p) => p.vargottama && CLASSICAL.includes(p.planet));

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-card/90 border border-border rounded-2xl p-6 shadow-panel ">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">Vedic (Jyotish) & Divisional Kundli</h3>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-gold/10 text-gold-strong border border-gold/30 rounded-full">
                Sidereal • Whole-sign houses
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lahiri Ayanamsha: <strong className="text-soft">{ayanamsha.toFixed(4)}°</strong>
              {lagna && (
                <>
                  {" "}• Lagna: <strong className="text-soft">{lagna.siderealSign} {lagna.degree.toFixed(1)}°</strong> in {lagna.nakshatra.name} (P{lagna.nakshatra.pada}), ruled by {lagna.lord}
                </>
              )}
            </p>
            {(atmakaraka || vargottama.length > 0) && (
              <p className="text-xs text-muted-foreground mt-1">
                {atmakaraka && (
                  <>
                    Atmakaraka: <strong className="text-gold">{atmakaraka.planet}</strong> ({atmakaraka.degree.toFixed(1)}° {atmakaraka.siderealSign}, the furthest-advanced planet in its sign)
                  </>
                )}
                {atmakaraka && vargottama.length > 0 && " • "}
                {vargottama.length > 0 && (
                  <>
                    Vargottama: <strong className="text-brand">{vargottama.map((p) => p.planet).join(", ")}</strong> (same sign in D1 and D9)
                  </>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(["D1", "D9"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveChartTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  activeChartTab === tab
                    ? "bg-gold-fill text-gold-foreground border-gold shadow-panel"
                    : "bg-muted text-soft border-border hover:bg-sunken"
                }`}
              >
                {tab === "D1" ? "D1 Rashi (Root Incarnation)" : "D9 Navamsha (Soul & Dharma)"}
              </button>
            ))}
          </div>
        </div>

        {/* Traditional Diamond Kundli Graphical Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[420px] aspect-square bg-background/80 border-2 border-gold/40 rounded-xl p-3 shadow-inner">
              <svg viewBox="0 0 300 300" className="w-full h-full select-none" role="img" aria-label={`${activeChartTab} chart`}>
                <rect x="0" y="0" width="300" height="300" fill="none" stroke="#d97706" strokeWidth="2" />
                <line x1="0" y1="0" x2="300" y2="300" stroke="#b45309" strokeWidth="1.5" />
                <line x1="300" y1="0" x2="0" y2="300" stroke="#b45309" strokeWidth="1.5" />
                <polygon points="150,0 300,150 150,300 0,150" fill="none" stroke="#d97706" strokeWidth="2" />

                {KUNDLI_HOUSES.map((cell) => (
                  <g key={cell.house}>
                    <text x={cell.x} y={cell.y} fill="#fef08a" fontSize={cell.emphasised ? 11 : 10} fontWeight={cell.emphasised ? "bold" : "normal"} textAnchor="middle">
                      {cell.label}
                    </text>
                    <text x={cell.x} y={cell.y + (cell.emphasised ? 20 : 17)} fill="#38bdf8" fontSize={cell.emphasised ? 10 : 9} textAnchor="middle">
                      {occupants(cell.house)}
                    </text>
                  </g>
                ))}

                <circle cx="150" cy="150" r="16" fill="#0f172a" stroke="#d97706" strokeWidth="1" />
                <text x="150" y="154" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {activeChartTab}
                </text>
              </svg>
            </div>
          </div>

          {/* Planetary Placements Table */}
          <div className="lg:col-span-6 overflow-x-auto">
            <h4 className="text-sm font-semibold text-soft mb-2">
              {activeChartTab === "D1" ? "D1 Rashi Sidereal Placements" : "D9 Navamsha Placements"}
            </h4>
            <div className="bg-background/60 rounded-xl border border-border p-2 max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="p-1.5">Planet</th>
                    <th className="p-1.5">{activeChartTab === "D1" ? "Sidereal Sign" : "Navamsha Sign"}</th>
                    <th className="p-1.5">Nakshatra</th>
                    <th className="p-1.5">House</th>
                    <th className="p-1.5">{activeChartTab === "D1" ? "Dignity & Karaka" : "Dignity"}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeChartTab === "D1" ? (
                    <>
                      {d1Placements.map((p) => (
                        <tr key={p.planet} className="border-b border-border hover:bg-muted/40">
                          <td className="p-1.5 font-semibold text-soft">
                            {p.planet}
                            {p.isRetrograde && <span className="ml-1 text-[10px] text-danger" title="Retrograde">℞</span>}
                          </td>
                          <td className="p-1.5 text-gold">{p.siderealSign} {p.degree.toFixed(1)}°</td>
                          <td className="p-1.5 text-soft">
                            <span className="block font-medium">{p.nakshatra.name} (P{p.nakshatra.pada})</span>
                            <span className="text-[10px] text-muted-foreground">{p.nakshatra.geezName}</span>
                          </td>
                          <td className="p-1.5 text-center font-bold text-foreground">{p.house}</td>
                          <td className="p-1.5">
                            {CLASSICAL.includes(p.planet) ? (
                              <>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] bg-muted border ${DIGNITY_STYLE[p.dignity] || DIGNITY_STYLE.Neutral}`}>{p.dignity}</span>
                                <span className="block text-[10px] text-muted-foreground mt-0.5">{p.karaka}</span>
                              </>
                            ) : (
                              <span className="text-subtle">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(lunarNodes ?? []).map((node) => (
                        <tr key={node.name} className="border-b border-border hover:bg-muted/40">
                          <td className="p-1.5 font-semibold text-soft">{node.name}</td>
                          <td className="p-1.5 text-gold">{node.siderealSign} {node.degree.toFixed(1)}°</td>
                          <td className="p-1.5 text-soft">
                            <span className="block font-medium">{node.nakshatra.name} (P{node.nakshatra.pada})</span>
                            <span className="text-[10px] text-muted-foreground">{node.nakshatra.geezName}</span>
                          </td>
                          <td className="p-1.5 text-center font-bold text-foreground">{node.house}</td>
                          <td className="p-1.5 text-[10px] text-muted-foreground">Lunar node (mean)</td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    d9Placements.placements.map((p) => (
                      <tr key={p.planet} className="border-b border-border hover:bg-muted/40">
                        <td className="p-1.5 font-semibold text-soft">{p.planet}</td>
                        <td className="p-1.5 text-gold">
                          {p.sign}
                          {p.vargottama && <span className="ml-1 text-[10px] text-brand">Vargottama</span>}
                        </td>
                        <td className="p-1.5 text-soft">{p.nakshatra ? `${p.nakshatra} (P${p.pada})` : "—"}</td>
                        <td className="p-1.5 text-center font-bold text-foreground">{p.house}</td>
                        <td className="p-1.5">
                          {p.dignity ? (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] bg-muted border ${DIGNITY_STYLE[p.dignity] || DIGNITY_STYLE.Neutral}`}>{p.dignity}</span>
                          ) : (
                            <span className="text-subtle">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Vimshottari Dasha System Card */}
      <div className="bg-card/90 border border-border rounded-2xl p-6 shadow-panel ">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Vimshottari Dasha (120-Year Planetary Timeline)</h3>
            <p className="text-xs text-muted-foreground">
              Current Mahadasha: <strong className="text-gold">{currentDasha.planet}</strong> ({formatDay(currentDasha.startDate)} to {formatDay(currentDasha.endDate)})
              {currentSub && (
                <>
                  {" "}• Antardasha: <strong className="text-info">{currentSub.planet}</strong> until {formatDay(currentSub.endDate)}
                </>
              )}
            </p>
            {nextDasha && (
              <p className="text-[11px] text-subtle mt-0.5">
                Next: {nextDasha.planet} Mahadasha begins {formatDay(nextDasha.startDate)}. Dates follow from your Moon&apos;s position in its nakshatra at birth.
              </p>
            )}
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-brand/10 text-brand-strong border border-brand/30 rounded-lg">
            {currentDasha.planet}{currentSub ? ` – ${currentSub.planet}` : ""}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-9 gap-2">
          {dashas.map((d) => (
            <div
              key={d.planet}
              className={`p-3 rounded-xl border text-center transition-all ${
                d.isCurrent
                  ? "bg-gold-soft border-gold/60 shadow-panel ring-1 ring-gold/30"
                  : "bg-background/40 border-border hover:bg-card/60"
              }`}
            >
              <span className="text-xs text-muted-foreground block">{d.startDate.slice(0, 4)}</span>
              <span className={`text-sm font-bold block my-0.5 ${d.isCurrent ? "text-gold" : "text-soft"}`}>
                {d.planet}
              </span>
              <span className="text-[10px] text-subtle block">{d.endDate.slice(0, 4)}</span>
            </div>
          ))}
        </div>

        {currentDasha.subPeriods && currentDasha.subPeriods.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-soft mb-2">Antardashas within your {currentDasha.planet} Mahadasha</h4>
            <div className="flex flex-wrap gap-2">
              {currentDasha.subPeriods.map((sub) => (
                <div
                  key={`${sub.planet}-${sub.startDate}`}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] ${
                    sub.isCurrent ? "bg-info-soft border-info/50 text-info-strong" : "bg-background/40 border-border text-muted-foreground"
                  }`}
                >
                  <strong className={sub.isCurrent ? "text-info" : "text-soft"}>{sub.planet}</strong>
                  <span className="ml-1.5">{formatDay(sub.startDate)} – {formatDay(sub.endDate)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panchang & Prashna Kundli 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panchang Card */}
        <div className="bg-card/90 border border-border rounded-2xl p-6 shadow-panel  space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-foreground">Today&apos;s Traditional Panchang</h3>
              <p className="text-xs text-muted-foreground">
                {panchang.date ? formatDay(panchang.date) : "Today"}
                {panchang.location && <> • at sunrise in {panchang.location.city}</>}
              </p>
            </div>
            <span className="text-xs text-muted-foreground text-right">{panchang.vaar.ethiopianName}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-background/60 rounded-xl border border-border">
              <span className="text-muted-foreground block text-[11px]">Tithi (Lunar Day {panchang.tithi.number} of 30)</span>
              <span className="text-gold font-semibold">{panchang.tithi.name}</span>
              <p className="text-[10px] text-subtle mt-1">{panchang.tithi.meaning}</p>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border">
              <span className="text-muted-foreground block text-[11px]">Nakshatra (Moon Mansion)</span>
              <span className="text-info font-semibold">{panchang.nakshatra.name} (P{panchang.nakshatra.pada})</span>
              <p className="text-[10px] text-subtle mt-1">{panchang.nakshatra.geezName} • {panchang.nakshatra.temperament}</p>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border">
              <span className="text-muted-foreground block text-[11px]">Yoga</span>
              <span className="text-brand font-semibold">{panchang.yoga.name}</span>
              <p className="text-[10px] text-subtle mt-1">Quality: {panchang.yoga.auspiciousness}</p>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border">
              <span className="text-muted-foreground block text-[11px]">Karana & Vaar</span>
              <span className="text-plum font-semibold">{panchang.karana.name} • {panchang.vaar.dayOfWeek}</span>
              <p className="text-[10px] text-subtle mt-1">Karana deity: {panchang.karana.rulingDeity} • Day lord: {panchang.vaar.rulingPlanet}</p>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border">
              <span className="text-muted-foreground block text-[11px]">Sunrise – Sunset</span>
              <span className="text-gold font-semibold">{panchang.sunrise.replace(" EAT", "")} – {panchang.sunset}</span>
              {panchang.dayLength && <p className="text-[10px] text-subtle mt-1">Day length {panchang.dayLength}</p>}
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border">
              <span className="text-muted-foreground block text-[11px]">Moon</span>
              <span className="text-foreground font-semibold">{panchang.moonPhase ? panchang.moonPhase.name : panchang.tithi.paksha}</span>
              {panchang.moonPhase && <p className="text-[10px] text-subtle mt-1">{panchang.moonPhase.illumination}% illuminated</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-brand-soft rounded-xl border border-brand/20 text-brand-strong">
              <span className="block text-[11px] text-muted-foreground">Favourable window</span>
              {panchang.auspiciousPeriod}
            </div>
            {panchang.rahuKalam && (
              <div className="p-3 bg-danger-soft rounded-xl border border-danger/20 text-danger-strong">
                <span className="block text-[11px] text-muted-foreground">Rahu Kalam (avoid new starts)</span>
                {panchang.rahuKalam}
              </div>
            )}
          </div>

          {dayAlignment && (
            <div className="p-3 bg-background/60 rounded-xl border border-gold/20 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-gold">What today means for your birth star, {dayAlignment.birthStar.name}</span>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${dayAlignment.taraBala.favourable ? "text-brand border-brand/40" : "text-gold border-gold/40"}`}>
                  {dayAlignment.taraBala.name} Tara
                </span>
              </div>
              <p className="text-soft leading-relaxed">{dayAlignment.taraBala.meaning}</p>
              <p className="text-muted-foreground leading-relaxed">{dayAlignment.chandraBala.meaning}</p>
            </div>
          )}
        </div>

        {/* Prashna Kundli (Horary) Query Tool */}
        <div className="bg-card/90 border border-border rounded-2xl p-6 shadow-panel  space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Prashna Kundli (Horary Query)</h3>
            <p className="text-xs text-muted-foreground">A chart cast for the moment you ask and the place you ask from; the answer lists the placements it rests on.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="prashna-question" className="block text-xs font-semibold text-soft mb-1">Your Question</label>
              <input
                id="prashna-question"
                type="text"
                value={prashnaQuestion}
                onChange={(e) => setPrashnaQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRunPrashna()}
                placeholder="e.g., Will my proposed business partnership succeed this season?"
                className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-soft focus:outline-none focus:border-gold"
              />
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[180px]">
                <label htmlFor="prashna-place" className="block text-xs font-semibold text-soft mb-1">Where you are asking from</label>
                <input
                  id="prashna-place"
                  type="text"
                  list="prashna-places"
                  value={prashnaCity}
                  onChange={(e) => setPrashnaCity(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-xs text-soft focus:outline-none focus:border-gold"
                />
                <datalist id="prashna-places">
                  {BIRTH_PLACE_SUGGESTIONS.map((place) => (
                    <option key={place.city} value={place.city}>{place.region}</option>
                  ))}
                </datalist>
              </div>
              <button
                type="button"
                onClick={locateMe}
                className="px-3 py-2 bg-muted border border-border text-soft text-xs font-semibold rounded-lg hover:bg-sunken"
              >
                Use my location
              </button>
              <button
                onClick={handleRunPrashna}
                disabled={isPrashnaLoading || !prashnaQuestion.trim()}
                className="px-4 py-2 bg-gradient-to-r from-gold-fill to-gold-fill text-gold-foreground text-xs font-bold rounded-lg shadow-panel hover:from-gold-fill hover:to-gold-fill disabled:opacity-50"
              >
                {isPrashnaLoading ? "Casting..." : "Cast Prashna"}
              </button>
            </div>
            {locationNote && <p className="text-[11px] text-muted-foreground" role="status">{locationNote}</p>}

            {prashnaResult && (
              <div className="mt-2 p-4 bg-background/80 rounded-xl border border-gold/30 space-y-2.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 text-gold font-semibold">
                  <span>
                    {prashnaResult.prashnaAscendant.sign} {prashnaResult.prashnaAscendant.degree.toFixed(1)}° rising ({prashnaResult.prashnaAscendant.nakshatra})
                  </span>
                  <span className="text-brand">Strength of testimony: {prashnaResult.confidenceScore}%</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Cast {prashnaResult.queryTimestamp} at {prashnaResult.location.city} ({prashnaResult.location.latitude.toFixed(2)}°, {prashnaResult.location.longitude.toFixed(2)}°)
                  {prashnaResult.topic && <> • read from the {prashnaResult.karyaBhava}{["th", "st", "nd", "rd"][prashnaResult.karyaBhava] || "th"} house: {prashnaResult.topic}</>}
                </p>
                <p className="text-soft leading-relaxed">{prashnaResult.outcomePrediction}</p>
                {prashnaResult.reasoning && prashnaResult.reasoning.length > 0 && (
                  <ul className="space-y-1 text-soft">
                    {prashnaResult.reasoning.map((line) => (
                      <li key={line} className="flex gap-2 leading-relaxed">
                        <span className={line.startsWith("+") ? "text-brand" : line.startsWith("−") ? "text-danger" : "text-subtle"}>{line.slice(0, 1)}</span>
                        <span>{line.slice(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="pt-2 border-t border-border space-y-1 text-[11px] text-muted-foreground">
                  <p>Favourable direction: {prashnaResult.favorableDirections.join(", ")}</p>
                  <p>{prashnaResult.auspiciousTimingRecommendation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
