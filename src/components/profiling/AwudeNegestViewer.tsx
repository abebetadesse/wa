"use client";

import { useState } from "react";
import {
  AWUDE_CIRCLES,
  AWUDE_NEGEST_60_CATEGORIES,
  calculateAwudeNegestReading,
  getDabtaraWisdom,
} from "@/lib/cultural/awudeNegestEngine";
import { calculateGeezGematria } from "@/lib/cultural/geezFidelGematria";
import { AWDE_NEGEST_SIGNS } from "@/lib/cultural/awdeNegestZodiac";
import { AwudeNegestReadingResult } from "@/lib/profiling/extendedTypes";

const AWDE_NEGEST_VISUALS = [
  {
    title: "Royal enclosure",
    caption: "Fasil Ghebbi, Gondar",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/ET_Gondar_asv2018-02_img19_Fasil_Ghebbi.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:ET_Gondar_asv2018-02_img19_Fasil_Ghebbi.jpg",
  },
  {
    title: "Castle geometry",
    caption: "Fasilides Palace",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Fasilides%27_palace%2C_Gonder%2C_Ethiopia_03.jpg?width=600",
    source: "https://commons.wikimedia.org/wiki/File:Fasilides%27_palace,_Gonder,_Ethiopia_03.jpg",
  },
  {
    title: "Highland context",
    caption: "Simien National Park",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Simien_National_Park-139420.jpg?width=800",
    source: "https://commons.wikimedia.org/wiki/File:Simien_National_Park-139420.jpg",
  },
] as const;

const ETHIOPIA_MAP_IMAGE = "https://commons.wikimedia.org/wiki/Special:FilePath/Ethiopia_Base_Map.png?width=900";
const ETHIOPIA_MAP_SOURCE = "https://commons.wikimedia.org/wiki/File:Ethiopia_Base_Map.png";

interface AwudeNegestViewerProps {
  initialName?: string;
  initialGeEzName?: string;
}

export default function AwudeNegestViewer({ initialName = "Tigist Mulugeta", initialGeEzName = "ትዕግሥት ሙሉጌታ" }: AwudeNegestViewerProps) {
  const [fidelInput, setFidelInput] = useState(initialGeEzName || initialName);
  const [motherName, setMotherName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("marriage");
  const [selectedCircleId, setSelectedCircleId] = useState<number>(1);
  const [activeSubTab, setActiveSubTab] = useState<"circles" | "calculator" | "scrolls" | "zodiac">("circles");

  // Live calculation
  const reading: AwudeNegestReadingResult = calculateAwudeNegestReading({
    name: fidelInput,
    motherName: motherName || undefined,
    category: selectedCategory,
  });

  const gematria = calculateGeezGematria(fidelInput);
  const dabtara = getDabtaraWisdom(selectedCategory);
  const activeCircle = AWUDE_CIRCLES.find((c) => c.id === selectedCircleId) || AWUDE_CIRCLES[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                አውደ ነገሥት • Circle of the King
              </span>
              <span className="text-xs text-slate-400">15th–17th Century Classical Parchment Traditions</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-100 mt-2 flex items-center gap-2">
              <span>{reading.circle.symbol}</span>
              <span>{reading.circle.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700 text-amber-300">
                Circle #{reading.circle.number}
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total Fidel Weight:</span>
            <span className="px-3 py-1.5 bg-slate-950 border border-amber-500/50 rounded-xl font-mono text-base font-bold text-amber-300">
              {reading.calculatedValues.total}
            </span>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-500/20">
          <button
            onClick={() => setActiveSubTab("circles")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === "circles"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-950/60"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            16 Circular Tables
          </button>
          <button
            onClick={() => setActiveSubTab("calculator")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === "calculator"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-950/60"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            60 Category Divination
          </button>
          <button
            onClick={() => setActiveSubTab("scrolls")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === "scrolls"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-950/60"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            Däbtära Healing Scrolls
          </button>
          <button
            onClick={() => setActiveSubTab("zodiac")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === "zodiac"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-950/60"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            Ethiopian 13-Month Zodiac
          </button>
        </div>
      </div>

      <section className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-5" aria-labelledby="awde-visual-atlas">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">Heritage field atlas</span>
            <h3 id="awde-visual-atlas" className="text-xl font-bold text-slate-100 mt-1">Place, parchment, and the circle structure</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">A visual reference layer for the Gondar manuscript tradition. These images are cultural context, not evidence for a prediction.</p>
          </div>
          <a href="https://commons.wikimedia.org/wiki/Category:Fasil_Ghebbi" target="_blank" rel="noreferrer" className="text-xs text-amber-300 hover:text-amber-200">Browse Commons collection ↗</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {AWDE_NEGEST_VISUALS.map((visual) => (
              <a key={visual.title} href={visual.source} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80">
                <div className="aspect-[4/3] overflow-hidden bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={visual.image} alt={`${visual.title}, ${visual.caption}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-3">
                  <div className="text-xs font-bold text-slate-200">{visual.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{visual.caption} · Wikimedia Commons ↗</div>
                </div>
              </a>
            ))}
          </div>

          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
            <a href={ETHIOPIA_MAP_SOURCE} target="_blank" rel="noreferrer" className="block aspect-[16/10] bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ETHIOPIA_MAP_IMAGE} alt="Map of Ethiopia showing the highland geography around Gondar" loading="lazy" className="h-full w-full object-cover opacity-90 hover:opacity-100" />
            </a>
            <div className="p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-200">Geographic anchor</span>
                <span className="text-[10px] text-emerald-300">Gondar · Amhara Highlands</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">The visual tradition is situated in northern Ethiopia, with Gondar as the historical reference point for the royal enclosure.</p>
              <a href="https://www.openstreetmap.org/?mlat=12.6089&mlon=37.4695#map=12/12.6089/37.4695" target="_blank" rel="noreferrer" className="inline-block text-[10px] text-amber-300 mt-2 hover:text-amber-200">Open Gondar map coordinates ↗</a>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <div className="text-xs font-bold text-slate-200">16-circle structure</div>
              <div className="text-[10px] text-slate-400">Selected: {activeCircle.geezTitle} · click a node to inspect its table</div>
            </div>
            <span className="text-[10px] text-amber-300 border border-amber-500/30 rounded px-2 py-1">8 day / 8 night sections</span>
          </div>
          <div className="relative mx-auto aspect-square max-w-[360px] rounded-full border border-amber-500/20 bg-[radial-gradient(circle,_rgba(245,158,11,0.14),_rgba(15,23,42,0.92)_58%)] p-6">
            <div className="absolute inset-[22%] rounded-full border border-dashed border-indigo-400/30" />
            <div className="absolute inset-[38%] rounded-full border border-amber-400/30 bg-slate-950/80 flex items-center justify-center text-center px-3">
              <div><div className="text-2xl">{activeCircle.symbol}</div><div className="text-[10px] font-bold text-amber-300">Circle {activeCircle.id}</div></div>
            </div>
            {AWUDE_CIRCLES.map((circle, index) => {
              const angle = (index / AWUDE_CIRCLES.length) * Math.PI * 2 - Math.PI / 2;
              const left = 50 + Math.cos(angle) * 43;
              const top = 50 + Math.sin(angle) * 43;
              return <button key={circle.id} type="button" aria-label={`Select ${circle.name}`} onClick={() => setSelectedCircleId(circle.id)} className={`absolute -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full border text-xs font-bold transition-all ${selectedCircleId === circle.id ? "bg-amber-500 border-amber-200 text-slate-950 scale-125 shadow-lg shadow-amber-500/30" : "bg-slate-950 border-slate-700 text-slate-300 hover:border-amber-400 hover:text-amber-300"}`} style={{ left: `${left}%`, top: `${top}%` }}>{circle.id}</button>;
            })}
          </div>
        </div>
      </section>

      {/* Subtab 1: 16 Circular Tables Visualizer */}
      {activeSubTab === "circles" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 16 Circle Selector Grid */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-3">
            <h4 className="text-sm font-bold text-slate-200">Select Magic Circle (1 - 16)</h4>
            <div className="grid grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1">
              {AWUDE_CIRCLES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCircleId(c.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedCircleId === c.id
                      ? "bg-amber-950/60 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span>{c.symbol}</span>
                    <span className="text-xs font-bold truncate">#{c.id} {c.geezTitle}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">{c.guardianAngel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Circle Day/Night 16 Sections Detail */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>{activeCircle.symbol}</span>
                  <span>{activeCircle.name}</span>
                </h4>
                <p className="text-xs text-amber-400 mt-0.5">Regent: {activeCircle.guardianAngel} • Element: {activeCircle.elementalAffinity.toUpperCase()}</p>
              </div>
              <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                16 Sections (Day & Night)
              </span>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-amber-300 block mb-1">General Prophecy:</span>
              {activeCircle.generalProphecy}
            </div>

            {/* 16 Sections Grid */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Diurnal & Nocturnal Hours (መዓልትና ሌሊት)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto">
                {activeCircle.sections.map((sec) => (
                  <div key={sec.sectionIndex} className="p-2 bg-slate-950/70 rounded-lg border border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">Sec {sec.sectionIndex}</span>
                      <span className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                        sec.timeOfDay.includes("Day") ? "bg-amber-950 text-amber-300 border border-amber-800" : "bg-indigo-950 text-indigo-300 border border-indigo-800"
                      }`}>
                        {sec.timeOfDay.includes("Day") ? "Day" : "Night"}
                      </span>
                    </div>
                    <p className="text-slate-400 line-clamp-2 text-[10px]">{sec.guidanceText}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Ge'ez Fidel & 60 Category Calculator */}
      {activeSubTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <h4 className="text-sm font-bold text-slate-200">Input Ge'ez / Amharic Name & Select Category</h4>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Name (Ge'ez or Latin)</label>
              <input
                type="text"
                value={fidelInput}
                onChange={(e) => setFidelInput(e.target.value)}
                placeholder="e.g., ትዕግሥት or Tigist"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mother&apos;s Name (optional)</label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="e.g., ማርያም"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Used as an additional cultural reflection input.</p>
            </div>

            {/* Recognized Fidel Letters Breakdown */}
            {gematria.recognizedFidelLetters.length > 0 && (
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 block">Recognized Ge'ez Letters:</span>
                <div className="flex flex-wrap gap-1.5">
                  {gematria.recognizedFidelLetters.map((item, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-amber-500/30 text-xs text-amber-300 font-mono">
                      {item.letter} = {item.value}
                    </span>
                  ))}
                </div>
                <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Sum: <strong className="text-slate-200">{gematria.totalNumericalSum}</strong></span>
                  <span>Digital Root: <strong className="text-emerald-400">{gematria.reducedDigitValue}</strong></span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800 text-slate-400">
                Mother&apos;s value <strong className="text-amber-300">{reading.calculatedValues.motherValue}</strong>
              </div>
              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800 text-slate-400">
                Segment <strong className="text-emerald-300">{reading.calculatedValues.segment} / 16</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prediction Category ({AWUDE_NEGEST_60_CATEGORIES.length} Traditional Fields)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 max-h-40"
              >
                {AWUDE_NEGEST_60_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.en} • {cat.am}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prophecy Output Card */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">AwudeNegest Reading</span>
                <h4 className="text-lg font-bold text-slate-100">{reading.prediction.category}</h4>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                reading.prediction.favorable
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-600"
                  : "bg-amber-950/80 text-amber-300 border-amber-600"
              }`}>
                {reading.prediction.favorable ? "✓ Favorable" : "⚠ Cautious Pacing"}
              </span>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
              <p>{reading.prediction.prophecy}</p>
              <p className="text-amber-400 font-medium italic pt-2 border-t border-slate-800/80">
                {reading.prediction.traditionalProverb}
              </p>
            </div>

            <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/20 text-xs space-y-1">
              <span className="font-bold text-emerald-300 block">Traditional Botanical Remedy:</span>
              <p className="text-slate-300">{reading.prediction.traditionalRemedy}</p>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Däbtära Healing Scrolls */}
      {activeSubTab === "scrolls" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                መጽሐፈ ፈውስ • Gondarine Healing Scrolls
              </span>
              <h4 className="text-xl font-bold text-slate-100 mt-1">{dabtara.title}</h4>
              <p className="text-xs text-slate-400">{dabtara.historicalPeriod} • {dabtara.scriptureRef}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                Parchment Seal & Talismanic Geometry
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                "{dabtara.parchmentSealDescription}"
              </p>
              <div className="pt-2 border-t border-amber-500/20 text-xs space-y-1">
                <span className="font-bold text-slate-200">Auspicious Celestial Hour:</span>
                <p className="text-amber-400">{dabtara.healingScrollPrescription.celestialHour}</p>
              </div>
            </div>

            <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Sacred Ge'ez Inscription & Translation
              </span>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs font-mono text-amber-300">
                {dabtara.healingScrollPrescription.protectivePrayerGeez}
              </div>
              <p className="text-xs text-slate-300 font-serif leading-relaxed">
                "{dabtara.healingScrollPrescription.protectivePrayerEnglish}"
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">Herbal Allies:</span>
              <span className="text-emerald-400 font-medium">
                {dabtara.healingScrollPrescription.herbalAllies.join(" • ")}
              </span>
            </div>
            <div className="text-slate-400">
              Seasonal Infusion: <strong className="text-slate-300">{dabtara.seasonalPacing.botanicalInfusion}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Ethiopian 13-Month Calendar Zodiac */}
      {activeSubTab === "zodiac" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-lg font-bold text-slate-100">Ethiopian 13-Month Calendar Zodiac (ዓውደ ከዋክብት)</h4>
              <p className="text-xs text-slate-400">12 Classical Months of 30 Days + 13th Month of Pagume (ጳጉሜን)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {AWDE_NEGEST_SIGNS.map((sign) => (
              <div key={sign.id} className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{sign.symbol}</span>
                    <span className="font-bold text-slate-200 text-xs">{sign.geezName}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 capitalize">
                    {sign.element}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{sign.englishName} • {sign.dateRange}</p>
                <p className="text-[11px] text-slate-300 leading-snug">{sign.traditionalTemperament}</p>
                <div className="pt-1 text-[10px] text-emerald-400 border-t border-slate-800/60">
                  Botanical: {sign.traditionalBotanicalAffinity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
