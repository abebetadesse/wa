"use client";

import { AstrologicalProfile, IntegratedPersonalProfile, TransitForecastItem } from "@/lib/profiling/types";
import { PersonalDayAlignment, PersonalDayYearData } from "@/lib/profiling/extendedTypes";
import { toEthiopianDate } from "@/lib/profiling/astrology/ethiopianTraditions";

const NATURE_STYLE: Record<string, { label: string; chip: string }> = {
  harmonious: { label: "Supportive", chip: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10" },
  challenging: { label: "Testing", chip: "text-rose-300 border-rose-500/40 bg-rose-500/10" },
  dynamic: { label: "Concentrated", chip: "text-violet-300 border-violet-500/40 bg-violet-500/10" },
};

/** Says plainly what the chart was cast for, including when a default had to be used. */
export function castDescription(astrology: AstrologicalProfile, birthDate: string, birthTime: string): string {
  const place = astrology.castFor;
  const where = place
    ? place.matched
      ? `${place.city} (${astrology.coordinates.latitude.toFixed(2)}°N, ${astrology.coordinates.longitude.toFixed(2)}°E${place.altitudeMeters ? `, ${place.altitudeMeters} m` : ""})`
      : `Addis Ababa, because “${place.query || "no place"}” was not recognised — choose a town from the list for an exact Ascendant`
    : astrology.birthLocation;
  const when = astrology.birthTimeAssumed
    ? `${birthDate} at 12:00 (no birth time on file, so noon is assumed: signs are reliable, but the Ascendant, houses and exact Moon degree are approximate)`
    : `${birthDate} at ${birthTime} local time`;
  return `Cast for ${when}, ${where}.`;
}

export function TransitList({ transits, title, intro }: { transits: TransitForecastItem[]; title: string; intro?: string }) {
  return (
    <div className="glass-panel p-6 border border-sky-500/20 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🔭</span> {title}
        </h3>
        {intro && <p className="text-xs text-slate-400 mt-1">{intro}</p>}
      </div>
      {transits.length === 0 ? (
        <p className="text-sm text-slate-300">
          No planet is within orb of an aspect to your chart today. This is a quiet stretch: your own routines set the tone.
        </p>
      ) : (
        <ul className="space-y-3">
          {transits.map((transit) => {
            const style = NATURE_STYLE[transit.nature || "dynamic"];
            return (
              <li key={`${transit.transitingPlanet}-${transit.aspect}-${transit.targetPlanetOrPoint}`} className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">
                    {transit.transitingPlanet} {transit.aspect} your {transit.targetPlanetOrPoint}
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                    <span className={`px-2 py-0.5 rounded-full border ${style.chip}`}>{style.label}</span>
                    {typeof transit.orb === "number" && (
                      <span className="px-2 py-0.5 rounded-full border border-white/15 text-slate-300">
                        orb {transit.orb.toFixed(1)}° • {transit.isApplying ? "building" : "easing"}
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{transit.wellbeingForecast}</p>
                <p className="text-xs text-amber-200/90 leading-relaxed">{transit.balancingAdvice}</p>
                <p className="text-[11px] text-slate-500">In orb: {transit.durationWindow}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function TodayForYou({
  firstName,
  alignment,
  cycles,
  transits,
}: {
  firstName: string;
  alignment: PersonalDayAlignment | null;
  cycles?: PersonalDayYearData | null;
  transits: TransitForecastItem[];
}) {
  if (!alignment) return null;
  const gregorian = new Date(`${alignment.date}T00:00:00Z`);
  const ethiopian = toEthiopianDate(gregorian);
  const lead = transits[0];

  return (
    <div className="glass-panel p-6 border border-amber-500/30 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🌅</span> Today for {firstName}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {gregorian.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })} • {ethiopian.formatted} ({ethiopian.monthName} {ethiopian.day})
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full border text-xs font-bold ${alignment.taraBala.favourable ? "text-emerald-300 border-emerald-500/40 bg-emerald-500/10" : "text-amber-300 border-amber-500/40 bg-amber-500/10"}`}>
          {alignment.taraBala.name} Tara • mind {alignment.chandraBala.strength}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-sky-300">The Moon and your chart</div>
          <p className="text-slate-200 leading-relaxed">
            The {alignment.phase.name.toLowerCase()} Moon ({alignment.phase.illumination}% lit) is in {alignment.moonToday.tropicalSign}, passing through your {alignment.moonToday.natalHouse}
            {["th", "st", "nd", "rd"][alignment.moonToday.natalHouse] || "th"} house: attention goes to {alignment.moonToday.houseTheme}.
          </p>
          <p className="text-slate-400 leading-relaxed">
            It is in the star {alignment.moonToday.nakshatra} ({alignment.moonToday.nakshatraGeez}).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-300">
            Your birth star: {alignment.birthStar.name} <span className="normal-case font-normal text-slate-400">({alignment.birthStar.geezName})</span>
          </div>
          <p className="text-slate-200 leading-relaxed">{alignment.taraBala.meaning}</p>
          <p className="text-slate-400 leading-relaxed">{alignment.chandraBala.meaning}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-1.5">
          {cycles ? (
            <>
              <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: cycles.houseColor }}>
                Personal day {cycles.personalDay} • month {cycles.personalMonth} • year {cycles.personalYear}
              </div>
              <p className="text-slate-200 leading-relaxed">Pace: {cycles.suggestedPacing}. {cycles.dailyAffirmation}</p>
              <p className="text-slate-400 leading-relaxed">Reflect: {cycles.journalPrompt}</p>
            </>
          ) : (
            <p className="text-slate-400">Numerology cycles are not available for this profile.</p>
          )}
        </div>
      </div>

      {lead && (
        <div className="p-4 rounded-xl bg-black/30 border border-sky-500/20 text-xs space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-sky-300">Strongest influence on your chart now</div>
          <p className="text-slate-200 leading-relaxed">{lead.wellbeingForecast}</p>
          <p className="text-amber-200/90 leading-relaxed">{lead.balancingAdvice}</p>
        </div>
      )}
    </div>
  );
}

const ELEMENT_ROWS: { key: "fire" | "earth" | "air" | "water"; label: string; bar: string }[] = [
  { key: "fire", label: "Esat (fire)", bar: "bg-amber-400" },
  { key: "earth", label: "Afere (earth)", bar: "bg-emerald-400" },
  { key: "air", label: "Nifas (air)", bar: "bg-sky-400" },
  { key: "water", label: "May (water)", bar: "bg-teal-400" },
];

export function ChartCalibration({ profile }: { profile: IntegratedPersonalProfile }) {
  const { astrology, synthesis } = profile;
  const current = synthesis.seasonalPatterns.find((pattern) => pattern.isCurrent);
  const emphasised = [...astrology.houses].filter((house) => house.activePlanets.length >= 2).sort((a, b) => b.activePlanets.length - a.activePlanets.length);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-panel p-6 border border-white/10 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>⚖️</span> Your elemental balance
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Weighted towards your Sun, Moon and Ascendant; the slow outer planets, shared by everyone born in your years, count least.
          </p>
        </div>
        <div className="space-y-2.5">
          {ELEMENT_ROWS.map((row) => (
            <div key={row.key}>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>{row.label}</span>
                <span className="font-mono">{astrology.elementalBalance[row.key]}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden" role="img" aria-label={`${row.label} ${astrology.elementalBalance[row.key]} percent`}>
                <div className={`h-full ${row.bar}`} style={{ width: `${astrology.elementalBalance[row.key]}%` }} />
              </div>
            </div>
          ))}
        </div>
        {!astrology.birthTimeAssumed && emphasised.length > 0 && (
          <p className="text-xs text-slate-300 leading-relaxed">
            Most populated part of your chart:{" "}
            {emphasised.slice(0, 2).map((house, index) => (
              <span key={house.houseNumber}>
                {index > 0 && "; "}
                house {house.houseNumber} in {house.signOnCusp} ({house.activePlanets.join(", ")})
              </span>
            ))}
            .
          </p>
        )}
      </div>

      {current && (
        <div className="glass-panel p-6 border border-emerald-500/20 space-y-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🍃</span> This season for you: {current.season}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{current.ethiopianMonths}</p>
          </div>
          {current.personalNote && <p className="text-xs text-amber-200/90 leading-relaxed">{current.personalNote}</p>}
          <ul className="space-y-1.5 text-xs text-slate-300">
            {[...current.potentialVulnerabilities, ...current.dietaryAdjustments].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-400 leading-relaxed">Daily pacing: {current.dailyPacing}</p>
        </div>
      )}
    </div>
  );
}

export function LifestyleAndTradition({ profile }: { profile: IntegratedPersonalProfile }) {
  const { mindBodyLifestyle, culturalTraditionsIntegration } = profile.synthesis.recommendations;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { title: "Daily rhythm", icon: "🧘", items: mindBodyLifestyle, tone: "text-sky-400" },
        { title: "Cultural practice", icon: "📜", items: culturalTraditionsIntegration, tone: "text-amber-400" },
      ].map((block) => (
        <div key={block.title} className="glass-panel p-6 border border-white/10 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>{block.icon}</span> {block.title}
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {block.items.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className={block.tone}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
