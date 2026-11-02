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
      <div className="relative overflow-hidden bg-gradient-to-br from-card via-info-soft to-card border border-info/30 rounded-2xl p-6 shadow-raised ">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold bg-info/20 text-info-strong border border-info/40 rounded-full">
                Dan Millman's 45-Path System
              </span>
              <span className="text-xs text-muted-foreground">"The Life You Were Born to Live" Unreduced Method</span>
            </div>
            <h3 className="text-2xl font-extrabold text-foreground mt-2">
              Life Purpose Path <span className="text-info">{danMillman.unreducedNumber}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[11px] text-muted-foreground block">Digit Summation:</span>
              <span className="text-xs font-mono font-bold text-soft">
                {danMillman.constituentDigits.join(" + ")} = {danMillman.unreducedNumber.split("/")[0]}
              </span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-info-soft border border-info/50 flex items-center justify-center text-xl font-bold text-foreground shadow-panel">
              {danMillman.primaryNumber}
            </div>
          </div>
        </div>

        <p className="text-sm text-soft leading-relaxed font-medium bg-background/60 p-4 rounded-xl border border-info/20 mb-6">
          {danMillman.corePurpose}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-background/70 rounded-xl border border-border space-y-2">
            <span className="text-xs font-bold text-brand flex items-center gap-1.5 uppercase tracking-wider">
              ✦ Innate Gifts
            </span>
            <ul className="text-xs text-soft space-y-1">
              {danMillman.innateGifts.map((gift, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-brand">•</span>
                  <span>{gift}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-background/70 rounded-xl border border-border space-y-2">
            <span className="text-xs font-bold text-gold flex items-center gap-1.5 uppercase tracking-wider">
              ⚠ Recurring Hurdles
            </span>
            <ul className="text-xs text-soft space-y-1">
              {danMillman.recurringChallenges.map((chal, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-gold">•</span>
                  <span>{chal}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-background/70 rounded-xl border border-border space-y-2">
            <span className="text-xs font-bold text-info flex items-center gap-1.5 uppercase tracking-wider">
              ⚕ Somatic Vitality
            </span>
            <p className="text-[11px] text-muted-foreground">{danMillman.physicalwellbeingTendencies.vulnerabilities[0]}</p>
            <div className="pt-1 text-xs text-info font-medium">
              Daily practice: {danMillman.physicalwellbeingTendencies.vitalityPractices[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Vibrations & Numi Affirmations Card */}
      <div className="bg-card/90 border border-border rounded-2xl p-6 shadow-panel ">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">Daily Vibrational Patterns (Numi Style)</h3>
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
            <p className="text-xs text-muted-foreground mt-1">
              Personal Year: <strong className="text-soft">{personalCycles.personalYear}</strong> • Pacing:{" "}
              <strong className="text-brand">{personalCycles.suggestedPacing}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Astrological House Color:</span>
            <div
              className="w-6 h-6 rounded-full shadow-inner border border-border-strong"
              style={{ backgroundColor: personalCycles.houseColor }}
              title={`House ${personalCycles.astrologicalHouseResonance} Resonance`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-background/60 rounded-xl border border-border space-y-2">
            <span className="text-[11px] font-bold text-gold uppercase tracking-wider">Today's Daily Affirmation</span>
            <p className="text-sm font-medium text-soft italic">"{personalCycles.dailyAffirmation}"</p>
          </div>

          <div className="p-4 bg-background/60 rounded-xl border border-border space-y-2">
            <span className="text-[11px] font-bold text-info uppercase tracking-wider">Reflective Journal Prompt</span>
            <p className="text-sm font-medium text-soft">"{personalCycles.journalPrompt}"</p>
          </div>
        </div>
      </div>

      {/* Pythagorean & Chaldean Multi-System Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pythagorean Core Numbers */}
        <div className="bg-card/90 border border-border rounded-2xl p-6 shadow-panel  space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Pythagorean Core Blueprint</h3>
            <span className="text-xs text-muted-foreground font-mono">Western Tradition</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-background/60 rounded-xl border border-border text-center">
              <span className="text-muted-foreground block text-[11px]">Life Path</span>
              <span className="text-2xl font-bold text-brand block my-1">{pythagorean.lifePath}</span>
              <span className="text-[10px] text-subtle">Birthdate Root</span>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border text-center">
              <span className="text-muted-foreground block text-[11px]">Destiny (Expression)</span>
              <span className="text-2xl font-bold text-info block my-1">{pythagorean.destinyNumber}</span>
              <span className="text-[10px] text-subtle">Full Name</span>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border text-center">
              <span className="text-muted-foreground block text-[11px]">Soul Urge</span>
              <span className="text-2xl font-bold text-gold block my-1">{pythagorean.soulUrge}</span>
              <span className="text-[10px] text-subtle">Vowel Vibration</span>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border text-center">
              <span className="text-muted-foreground block text-[11px]">Personality</span>
              <span className="text-2xl font-bold text-plum block my-1">{pythagorean.personalityNumber}</span>
              <span className="text-[10px] text-subtle">Consonant Root</span>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border text-center">
              <span className="text-muted-foreground block text-[11px]">Birthday Number</span>
              <span className="text-2xl font-bold text-danger block my-1">{pythagorean.birthDayNumber}</span>
              <span className="text-[10px] text-subtle">Day of Month</span>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border text-center">
              <span className="text-muted-foreground block text-[11px]">Ge'ez Root</span>
              <span className="text-2xl font-bold text-brand block my-1">{geezGematria.digitalRoot}</span>
              <span className="text-[10px] text-subtle">Fidel Gematria</span>
            </div>
          </div>
        </div>

        {/* Chaldean Numerology */}
        <div className="bg-card/90 border border-border rounded-2xl p-6 shadow-panel  space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Chaldean Numerology System</h3>
              <p className="text-xs text-muted-foreground">Ancient Babylon 1-8 Vibrational Tone</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold bg-gold/10 text-gold-strong border border-gold/30 rounded-lg">
              Vibration #{chaldean.nameVibrationNumber}
            </span>
          </div>

          <div className="p-4 bg-background/60 rounded-xl border border-border space-y-2 text-xs">
            <span className="text-muted-foreground block text-[11px]">Compound Vibration Meaning:</span>
            <p className="text-soft leading-relaxed font-medium">{chaldean.compoundNumberMeaning}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-background/60 rounded-xl border border-border">
              <span className="text-muted-foreground block text-[10px]">Auspicious Days</span>
              <span className="text-brand font-semibold">{chaldean.luckyDays.join(", ")}</span>
            </div>
            <div className="p-3 bg-background/60 rounded-xl border border-border">
              <span className="text-muted-foreground block text-[10px]">Harmonious Gems</span>
              <span className="text-gold font-semibold">{chaldean.harmoniousGems.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
