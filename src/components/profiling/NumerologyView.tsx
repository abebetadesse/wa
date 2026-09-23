"use client";

import { ExtendedNumerologyProfile } from "@/lib/profiling/extendedTypes";

interface NumerologyViewProps {
  profile: ExtendedNumerologyProfile;
  birthDate: string;
}

export default function NumerologyView({ profile, birthDate }: NumerologyViewProps) {
  const { pythagorean, chaldean, danMillman, personalCycles, geezGematria } = profile;

  return (
    <div className="space-y-8">
      {/* Dan Millman 45-Path Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full">
                Dan Millman's 45-Path System
              </span>
              <span className="text-xs text-slate-400">"The Life You Were Born to Live" Unreduced Method</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-100 mt-2">
              Life Purpose Path <span className="text-indigo-400">{danMillman.unreducedNumber}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Digit Summation:</span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {danMillman.constituentDigits.join(" + ")} = {danMillman.unreducedNumber.split("/")[0]}
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-900/60 border border-indigo-400/50 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-950/60">
              {danMillman.primaryNumber}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed font-medium bg-slate-950/60 p-4 rounded-xl border border-indigo-500/20 mb-6">
          {danMillman.corePurpose}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              ✦ Innate Gifts
            </span>
            <ul className="text-xs text-slate-300 space-y-1">
              {danMillman.innateGifts.map((gift, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500">•</span>
                  <span>{gift}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              ⚠ Recurring Hurdles
            </span>
            <ul className="text-xs text-slate-300 space-y-1">
              {danMillman.recurringChallenges.map((chal, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500">•</span>
                  <span>{chal}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
              ⚕ Somatic Vitality
            </span>
            <p className="text-[11px] text-slate-400">{danMillman.physicalwellbeingTendencies.vulnerabilities[0]}</p>
            <div className="pt-1 text-xs text-sky-300 font-medium">
              Daily practice: {danMillman.physicalwellbeingTendencies.vitalityPractices[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Vibrations & Numi Affirmations Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100">Daily Vibrational Patterns (Numi Style)</h3>
              <span
                className="px-2.5 py-0.5 text-xs font-semibold rounded-full border"
                style={{
                  backgroundColor: `${personalCycles.houseColor}20`,
                  color: personalCycles.houseColor,
                  borderColor: `${personalCycles.houseColor}50`,
                }}
              >
                Personal Day {personalCycles.personalDay} • House {personalCycles.astrologicalHouseResonance}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Personal Year: <strong className="text-slate-200">{personalCycles.personalYear}</strong> • Pacing:{" "}
              <strong className="text-emerald-400">{personalCycles.suggestedPacing}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Astrological House Color:</span>
            <div
              className="w-6 h-6 rounded-full shadow-inner border border-white/20"
              style={{ backgroundColor: personalCycles.houseColor }}
              title={`House ${personalCycles.astrologicalHouseResonance} Resonance`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Today's Daily Affirmation</span>
            <p className="text-sm font-medium text-slate-200 italic">"{personalCycles.dailyAffirmation}"</p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Reflective Journal Prompt</span>
            <p className="text-sm font-medium text-slate-200">"{personalCycles.journalPrompt}"</p>
          </div>
        </div>
      </div>

      {/* Pythagorean & Chaldean Multi-System Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pythagorean Core Numbers */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100">Pythagorean Core Blueprint</h3>
            <span className="text-xs text-slate-400 font-mono">Western Tradition</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block text-[11px]">Life Path</span>
              <span className="text-2xl font-black text-emerald-400 block my-1">{pythagorean.lifePath}</span>
              <span className="text-[10px] text-slate-500">Birthdate Root</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block text-[11px]">Destiny (Expression)</span>
              <span className="text-2xl font-black text-sky-400 block my-1">{pythagorean.destinyNumber}</span>
              <span className="text-[10px] text-slate-500">Full Name</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block text-[11px]">Soul Urge</span>
              <span className="text-2xl font-black text-amber-400 block my-1">{pythagorean.soulUrge}</span>
              <span className="text-[10px] text-slate-500">Vowel Vibration</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block text-[11px]">Personality</span>
              <span className="text-2xl font-black text-violet-400 block my-1">{pythagorean.personalityNumber}</span>
              <span className="text-[10px] text-slate-500">Consonant Root</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block text-[11px]">Birthday Number</span>
              <span className="text-2xl font-black text-rose-400 block my-1">{pythagorean.birthDayNumber}</span>
              <span className="text-[10px] text-slate-500">Day of Month</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block text-[11px]">Ge'ez Root</span>
              <span className="text-2xl font-black text-teal-400 block my-1">{geezGematria.digitalRoot}</span>
              <span className="text-[10px] text-slate-500">Fidel Gematria</span>
            </div>
          </div>
        </div>

        {/* Chaldean Numerology */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Chaldean Numerology System</h3>
              <p className="text-xs text-slate-400">Ancient Babylon 1-8 Vibrational Tone</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
              Vibration #{chaldean.nameVibrationNumber}
            </span>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
            <span className="text-slate-400 block text-[11px]">Compound Vibration Meaning:</span>
            <p className="text-slate-200 leading-relaxed font-medium">{chaldean.compoundNumberMeaning}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Auspicious Days</span>
              <span className="text-emerald-400 font-semibold">{chaldean.luckyDays.join(", ")}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Harmonious Gems</span>
              <span className="text-amber-400 font-semibold">{chaldean.harmoniousGems.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
