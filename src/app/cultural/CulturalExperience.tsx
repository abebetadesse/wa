"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  AWDE_NEGEST_SIGNS,
  HUMORAL_ELEMENTS,
  HumoralElement,
  getAwdeNegestSign,
} from "@/lib/cultural/awdeNegestZodiac";
import {
  calculateGeezGematria,
  resolveBaptismalLineage,
} from "@/lib/cultural/geezFidelGematria";
import {
  getLunarForagingGuidance,
  getPagumeStatus,
  getMineralSpringsDirectory,
} from "@/lib/cultural/seasonalTraditionsEngine";
import { toEthiopianDate } from "@/lib/profiling/astrology/ethiopianTraditions";
import ChristianBibleReading from "@/components/cultural/ChristianBibleReading";

interface EthiopianCalendarInfo {
  year: string;
  month: string;
  day: number;
  gregorianDate: string;
  holiday: string | null;
  fastingPeriod: string | null;
}

interface CoffeeCeremonyStage {
  name: string;
  description: string;
  wellbeingEffect: string;
  timing: string;
}

const FASTING_PERIODS = [
  { name: "Abiy Tsom (Lent)", duration: "55 days", season: "Feb-Apr", wellbeingNote: "Vegan, requires B12 & iron monitoring" },
  { name: "Filseta (Assumption)", duration: "16 days", season: "Aug", wellbeingNote: "Vegan, ensure adequate hydration" },
  { name: "Weekly Wednesdays", duration: "Every week", season: "Year-round", wellbeingNote: "Vegan, moderate nutrient intake" },
  { name: "Weekly Fridays", duration: "Every week", season: "Year-round", wellbeingNote: "Vegan, ensure protein variety" },
  { name: "Nineveh Fast", duration: "3 days", season: "Feb", wellbeingNote: "Vegan, rest and reflection" },
];

const COFFEE_CEREMONY_STAGES: CoffeeCeremonyStage[] = [
  {
    name: "Abol (አቦል)",
    description: "The first and strongest round, for serious discussion and community decision-making.",
    wellbeingEffect: "Promotes social bonding and mental clarity; antioxidants from fresh roast.",
    timing: "Morning / early afternoon"
  },
  {
    name: "Tona (ቶና)",
    description: "The second round, for deeper reflection and sharing of wisdom.",
    wellbeingEffect: "Sustained alertness; enhances emotional connection and storytelling.",
    timing: "Afternoon"
  },
  {
    name: "Bereka (በረካ)",
    description: "The third and final round, a blessing of peace and gratitude.",
    wellbeingEffect: "Calming and grounding; closes the social ritual with a sense of completion.",
    timing: "Late afternoon / evening"
  }
];

export default function CulturalExperience() {
  const [selectedZodiacId, setSelectedZodiacId] = useState<string>("asad");
  const selectedZodiac = getAwdeNegestSign(selectedZodiacId) || AWDE_NEGEST_SIGNS[4];

  const [selectedHumor, setSelectedHumor] = useState<HumoralElement>("esat");
  const humorProfile = HUMORAL_ELEMENTS[selectedHumor];

  const [inputName, setInputName] = useState<string>("አበበ");
  const gematriaResult = calculateGeezGematria(inputName);

  const [secularNameInput, setSecularNameInput] = useState<string>("Dawit");
  const [baptismalNameInput, setBaptismalNameInput] = useState<string>("Haile Maryam");
  const lineageRecord = resolveBaptismalLineage(secularNameInput, baptismalNameInput);

  const lunarGuidance = getLunarForagingGuidance();
  const pagumeInfo = getPagumeStatus();
  const mineralSprings = getMineralSpringsDirectory();

  const [selectedSpringId, setSelectedSpringId] = useState<string | null>(null);
  const [showSpringDetails, setShowSpringDetails] = useState(false);
  const [calendarView, setCalendarView] = useState<"current" | "fasting" | "holidays">("current");

  const ethiopianCalendar = useMemo((): EthiopianCalendarInfo => {
    const now = new Date();
    const localDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const ethiopianDate = toEthiopianDate(localDate);
    const month = ethiopianDate.monthName;
    const day = ethiopianDate.day;
    let holiday = null;
    if (month === "Meskerem" && day === 1) holiday = "Enkutatash (Ethiopian New Year)";
    if (month === "Tir" && day === 11) holiday = "Timkat (Epiphany)";
    if (month === "Meskerem" && day === 17) holiday = "Meskel (Finding of the True Cross)";
    if (month === "Tahsas" && day === 29) holiday = "Gena (Ethiopian Christmas)";
    let fastingPeriod = null;
    if (now.getDay() === 3) fastingPeriod = "Weekly Wednesday fast";
    if (now.getDay() === 5) fastingPeriod = "Weekly Friday fast";
    return {
      year: String(ethiopianDate.year),
      month,
      day,
      gregorianDate: now.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" }),
      holiday,
      fastingPeriod,
    };
  }, []);

  const toggleSpringDetails = (springId: string) => {
    if (selectedSpringId === springId && showSpringDetails) {
      setShowSpringDetails(false);
      setSelectedSpringId(null);
    } else {
      setSelectedSpringId(springId);
      setShowSpringDetails(true);
    }
  };

  return (
    <div className="space-y-14">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
          <span>Domain B: Sacred Heritage & Parchment Humanities Layer</span>
          <span>•</span>
          <span className="text-emerald-400">Enhancements 13–22</span>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed max-w-3xl">
          <strong>Architectural Firewall Guarantee:</strong> Under the enterprise architecture rules, Domain B is structurally
          firewalled from Domain A (Scientific Evaluation). No astrological constellation, baptismal record, or gematria score ever
          influences biochemical nutrient requirements or drug safety gating.
        </div>
      </div>

      <nav aria-label="Cultural topics" className="flex gap-2 overflow-x-auto pb-1">
        {[
          ["traditions-signs", "Signs"],
          ["ethiopian-calendar", "Calendar"],
          ["cultural-names", "Names"],
          ["coffee-rituals", "Coffee ritual"],
          ["mineral-springs", "Springs"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-400/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            {label}
          </a>
        ))}
      </nav>

      <ChristianBibleReading />

      <div id="traditions-signs" className="glass-panel scroll-mt-24 p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Enhancement 13</span>
            <h2 className="text-2xl font-bold text-white">Awde Negest (አውደ ነገሥት) 12 Ge&apos;ez Celestial Signs</h2>
            <p className="text-xs text-slate-400 mt-1">
              Ethiopian parchment manuscript astrology depicting the 12 celestial houses (መንበር / ኮከብ).
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400 self-start md:self-auto">
            12 Constellations
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {AWDE_NEGEST_SIGNS.map((sign) => {
            const isSelected = selectedZodiacId === sign.id;
            return (
              <button
                key={sign.id}
                onClick={() => setSelectedZodiacId(sign.id)}
                aria-pressed={isSelected}
                className={`p-3 rounded-xl text-center border transition-all ${isSelected
                  ? "bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-950/50"
                  : "bg-black/30 border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <span className="text-xl block mb-1">{sign.symbol}</span>
                <span className="text-xs font-bold block truncate">{sign.geezName.split(" ")[0]}</span>
                <span className="text-[10px] text-slate-500 block truncate">{sign.id.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 rounded-2xl bg-black/40 border border-amber-500/30 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedZodiac.symbol}</span>
              <div>
                <h3 className="text-2xl font-extrabold text-white">{selectedZodiac.geezName}</h3>
                <span className="text-xs text-amber-400 font-medium">{selectedZodiac.englishName}</span>
              </div>
            </div>
            <div className="text-xs space-y-1.5 pt-2 border-t border-white/10">
              <p className="text-slate-300">
                <strong className="text-white">Date Window:</strong> {selectedZodiac.dateRange}
              </p>
              <p className="text-slate-300">
                <strong className="text-white">Ruling Sphere:</strong> {selectedZodiac.rulingSphere}
              </p>
              <p className="text-slate-300">
                <strong className="text-white">Classical Element:</strong> {selectedZodiac.elementAmharic}
              </p>
              <p className="text-slate-300">
                <strong className="text-white">House Number:</strong> {selectedZodiac.houseNumber ?? "Not recorded"}
              </p>
            </div>
          </div>

          <div className="space-y-2 lg:col-span-2 text-xs">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-amber-400 font-bold uppercase tracking-wider block text-[10px]">
                Parchment Temperament & Virtues
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">{selectedZodiac.traditionalTemperament}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Reflective Highlands Theme</span>
                <p className="text-slate-300 text-xs mt-1">{selectedZodiac.culturalReflectiveTheme}</p>
              </div>
              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Traditional Botanical Affinity</span>
                <p className="text-emerald-300 text-xs mt-1 font-medium">{selectedZodiac.traditionalBotanicalAffinity}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Parchment Compatibilities</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {(selectedZodiac.compatibleSigns ?? []).map((comp) => (
                  <span key={comp} className="px-2 py-0.5 rounded bg-white/5 text-emerald-300 text-[10px]">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Enhancement 14</span>
              <h2 className="text-xl font-bold text-white">Four Zemen Humoral Elements (አራቱ ባሕርያት)</h2>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400">
              Humoral Balance
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(["esat", "nifas", "may", "afere"] as HumoralElement[]).map((el) => {
              const p = HUMORAL_ELEMENTS[el];
              const isSelected = selectedHumor === el;
              return (
                <button
                  key={el}
                  onClick={() => setSelectedHumor(el)}
                  aria-pressed={isSelected}
                  className={`p-2.5 rounded-xl text-center border transition-all ${isSelected
                    ? "bg-amber-500/20 border-amber-500 text-white"
                    : "bg-black/30 border-white/5 text-slate-400 hover:text-white"
                    }`}
                >
                  <span className="text-xs font-bold block">{p.nameAmharic.split(" ")[0]}</span>
                  <span className="text-[10px] text-slate-500 block capitalize">{el}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-base">{humorProfile.nameAmharic}</h3>
              <span className="text-amber-400 font-mono font-semibold">{humorProfile.qualities}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">Bodily Humor:</strong> {humorProfile.associatedBodilyHumor}
            </p>
            <p className="text-slate-300 leading-relaxed">{humorProfile.traditionalTemperament}</p>
            <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/20 text-amber-200 leading-relaxed">
              <strong>Harmonization:</strong> {humorProfile.dietaryHarmonizationAdvice}
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Traditional Herbal Teas:</span>
              <div className="flex flex-wrap gap-1.5">
                {humorProfile.traditionalHerbalTeas.map((tea, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-white/5 text-emerald-300 text-[11px]">
                    {tea}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div id="ethiopian-calendar" className="glass-panel scroll-mt-24 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Enhancement 15</span>
              <h2 className="text-xl font-bold text-white">Lunar Botanical Foraging Potency</h2>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              Live Phase
            </span>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-white">{lunarGuidance.phaseNameAmharic}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                {lunarGuidance.phaseName.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Sap & Water Dynamic:</strong> {lunarGuidance.sapDynamic}
            </p>
            <div className="p-2.5 rounded bg-black/30 border border-white/5 text-[11px] text-slate-300 space-y-1">
              <strong className="text-white block">Parchment Ethnobotanical Guidance:</strong>
              <p>{lunarGuidance.traditionalRationale}</p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Recommended Herbs to Harvest Now:</span>
              <div className="flex flex-wrap gap-1.5">
                {lunarGuidance.recommendedHerbs.map((herb, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs">
                    🌿 {herb}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-amber-300 text-sm">{pagumeInfo.significanceAmharic}</span>
              <span className="font-mono text-amber-400 font-bold">
                {pagumeInfo.isCurrentlyPagume ? "ACTIVE NOW" : `${pagumeInfo.daysUntilNextPagume} Days Away`}
              </span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              {pagumeInfo.ritualPractices.map((rit, idx) => (
                <p key={idx}>
                  <strong className="text-amber-200">• {rit.title}:</strong> {rit.description}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Enhancement 20</span>
            <h2 className="text-xl font-bold text-white">Ethiopian Calendar & Fasting Seasons (የኢትዮጵያ ቀን መቁጠርያ)</h2>
            <p className="text-xs text-slate-400 mt-1">Current date, holidays, and fasting periods with wellbeing notes.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCalendarView("current")}
              aria-pressed={calendarView === "current"}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${calendarView === "current" ? "bg-emerald-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
            >
              Today
            </button>
            <button
              onClick={() => setCalendarView("fasting")}
              aria-pressed={calendarView === "fasting"}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${calendarView === "fasting" ? "bg-amber-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
            >
              Fasting
            </button>
            <button
              onClick={() => setCalendarView("holidays")}
              aria-pressed={calendarView === "holidays"}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${calendarView === "holidays" ? "bg-amber-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"
                }`}
            >
              Holidays
            </button>
          </div>
        </div>

        {calendarView === "current" && (
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <span className="text-slate-400 block">Ethiopian Year</span>
              <span className="text-2xl font-bold text-white">{ethiopianCalendar.year}</span>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <span className="text-slate-400 block">Month & Day</span>
              <span className="text-2xl font-bold text-white">{ethiopianCalendar.month} {ethiopianCalendar.day}</span>
              <span className="mt-1 block text-slate-400">Gregorian: {ethiopianCalendar.gregorianDate}</span>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <span className="text-slate-400 block">Feast / Fast</span>
              <span className="text-sm font-bold text-emerald-300">{ethiopianCalendar.holiday || "No fixed feast today"}</span>
              <span className="block text-amber-300 text-[11px]">{ethiopianCalendar.fastingPeriod || "No weekly fast today"}</span>
              <span className="mt-1 block text-slate-400">Major fast dates vary by year.</span>
            </div>
          </div>
        )}

        {calendarView === "fasting" && (
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FASTING_PERIODS.map((fast, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{fast.name}</span>
                    <span className="text-[10px] text-amber-400">{fast.duration}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1">Season: {fast.season}</p>
                  <p className="text-slate-400 text-[11px] mt-1">wellbeing note: {fast.wellbeingNote}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {calendarView === "holidays" && (
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                <span className="block text-amber-300 font-bold">Enkutatash</span>
                <span className="text-slate-300">Meskerem 1 – Ethiopian New Year</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                <span className="block text-amber-300 font-bold">Timkat</span>
                <span className="text-slate-300">Tir 11 – Epiphany</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                <span className="block text-amber-300 font-bold">Meskel</span>
                <span className="text-slate-300">Meskerem 17 – Finding of the True Cross</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                <span className="block text-amber-300 font-bold">Gena (Ethiopian Christmas)</span>
                <span className="text-slate-300">Tahsas 29 – Ethiopian Christmas</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div id="cultural-names" className="grid scroll-mt-24 grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Enhancement 16</span>
              <h2 className="text-xl font-bold text-white">Ge&apos;ez Fidel Gematria (የፊደል ሂሳብ)</h2>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400">
              Abushakir Weights
            </span>
          </div>

          <div>
            <label htmlFor="gematria-name" className="text-xs text-slate-300 block mb-1.5">Enter Name in Ge&apos;ez / Amharic Fidel:</label>
            <input
              id="gematria-name"
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="e.g. አበበ, ሰላም, ዳዊት, አልማዝ"
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-base text-white focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3 text-xs">
            <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
              {gematriaResult.recognizedFidelLetters.map((item, idx) => (
                <div key={idx} className="p-1.5 rounded bg-white/5 text-center min-w-[36px]">
                  <span className="block font-bold text-white text-sm">{item.letter}</span>
                  <span className="block text-[10px] text-amber-400 font-mono">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-white/5">
                <span className="text-slate-400 block text-[10px]">Total Consonant Sum</span>
                <span className="text-2xl font-extrabold font-mono text-amber-400">
                  {gematriaResult.totalNumericalSum}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <span className="text-slate-400 block text-[10px]">Digital Root (1 - 9)</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-400">
                  {gematriaResult.reducedDigitValue}
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <p className="text-white font-semibold">{gematriaResult.philosophicalVirtue}</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">{gematriaResult.biblicalResonance}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Enhancement 17</span>
              <h2 className="text-xl font-bold text-white">Sacred Baptismal Name Vault (የክርስትና ስም)</h2>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400">
              Lineage Record
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label htmlFor="secular-name" className="text-slate-300 block mb-1">Secular Name:</label>
              <input
                id="secular-name"
                type="text"
                value={secularNameInput}
                onChange={(e) => setSecularNameInput(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label htmlFor="baptismal-name" className="text-slate-300 block mb-1">Baptismal Name:</label>
              <input
                id="baptismal-name"
                type="text"
                value={baptismalNameInput}
                onChange={(e) => setBaptismalNameInput(e.target.value)}
                placeholder="e.g. Haile Maryam"
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <strong className="text-white text-sm">{lineageRecord.baptismalName}</strong>
              <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-400 font-mono text-[11px]">
                Feast: {lineageRecord.monthlyFeastDayDateGeez}th of every month
              </span>
            </div>
            <p className="text-slate-300">
              <strong className="text-white">Patron Saint:</strong> {lineageRecord.patronSaintOrAngel}
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">{lineageRecord.significance}</p>
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-200 italic text-[11px]">
              &ldquo;{lineageRecord.ancestralBenediction}&rdquo;
            </div>
          </div>
        </div>
      </div>

      <div id="coffee-rituals" className="glass-panel scroll-mt-24 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Enhancement 21</span>
            <h2 className="text-xl font-bold text-white">Coffee Ceremony Somatics (የቡና ስነ-ስርዓት)</h2>
            <p className="text-xs text-slate-400 mt-1">The three rounds: social therapy, mental clarity, and community blessing.</p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            Three Rounds
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COFFEE_CEREMONY_STAGES.map((stage, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-amber-300">{stage.name}</span>
                <span className="text-[10px] text-slate-500">{stage.timing}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{stage.description}</p>
              <p className="text-slate-400 text-[11px]">🌿 {stage.wellbeingEffect}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Enhancement 22</span>
            <h2 className="text-xl font-bold text-white">Traditional Healing Practices (ባህላዊ ህክምና)</h2>
            <p className="text-xs text-slate-400 mt-1">Indigenous healing modalities recognized in Ethiopian culture.</p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400">
            6 Modalities
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "Debtera (ደብተራ)",
              description: "Religious scholars and healers using healing scrolls, holy water, and herbal remedies.",
              icon: "📜"
            },
            {
              name: "Wogesha (ወገሻ)",
              description: "Indigenous bone-setters and joint manipulators using splints and herbal compresses.",
              icon: "🦴"
            },
            {
              name: "Awalaj (አዋላጅ)",
              description: "Traditional birth attendants providing maternal and neonatal care in rural communities.",
              icon: "👶"
            },
            {
              name: "Zar (ዛር)",
              description: "Spirit possession healing ceremonies integrating music, dance, and community support.",
              icon: "🥁"
            },
            {
              name: "Ato / Emama Medhanit",
              description: "Village herbalists with empirical knowledge of local medicinal roots and leaves.",
              icon: "🌿"
            },
            {
              name: "Tsebel (ጸበል)",
              description: "Holy water healing at churches, believed to cleanse and restore spiritual and physical wellbeing.",
              icon: "💧"
            }
          ].map((practice, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-black/30 border border-white/5 hover:border-amber-500/30 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{practice.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{practice.name}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{practice.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div id="mineral-springs" className="scroll-mt-24 border-b border-white/10 pb-4">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Enhancement 19</span>
          <h2 className="text-2xl font-bold text-white">Sacred Mineral Springs (ፍልውኃና ጸበል) Balneotherapy Directory</h2>
          <p className="text-xs text-slate-400 mt-1">
            Volcanic geothermal sulfur waters and highland cold springs historically frequented for physical and somatic reset.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mineralSprings.map((spring) => {
            const isExpanded = selectedSpringId === spring.id && showSpringDetails;
            return (
              <div key={spring.id} className="glass-panel p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white text-base leading-snug">{spring.nameAmharic}</h3>
                    <span className="font-mono text-amber-400 font-bold text-xs bg-black/40 px-2 py-0.5 rounded">
                      {spring.waterTemperatureC}°C
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{spring.location}</p>

                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Dissolved Minerals</span>
                    <div className="flex flex-wrap gap-1">
                      {spring.prominentMinerals.map((m, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-300">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {spring.traditionalAndBalneotherapeuticIndications}
                  </p>
                </div>

                <button
                  onClick={() => toggleSpringDetails(spring.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`spring-details-${spring.id}`}
                  className="mt-3 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  {isExpanded ? "Hide details" : "View more"}
                </button>

                {isExpanded && (
                  <div id={`spring-details-${spring.id}`} className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs space-y-2">
                    <p><strong className="text-white">Cultural significance:</strong> {spring.culturalSignificance ?? "Documented local significance varies by community."}</p>
                    <p><strong className="text-white">Seasonal access:</strong> {spring.seasonalAccess ?? "Access may vary with weather and local guidance."}</p>
                    <p><strong className="text-white">Associated rituals:</strong> {spring.associatedRituals ?? "Follow local customs and safety guidance."}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-white/10 text-xs">
        <Link href="/zoonotic" className="text-slate-400 hover:text-white transition-colors">
          ← Back to Terroir & Zoonotic Safety
        </Link>
        <Link href="/somatics" className="btn-primary text-xs py-2 px-4">
          Explore Coffee Ceremony Somatics (Enhancement 21) →
        </Link>
      </div>
    </div>
  );
}
