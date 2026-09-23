import Link from "next/link";
import { convertToHabeshaTime } from "@/lib/engines/chrononutritionEngine";
import { resolveAgroEcologicalZone } from "@/lib/engines/agroEcologicalEngine";
import { evaluateFastingStatus } from "@/lib/engines/fastingMetabolismEngine";

function getDailyAlignmentScore(date: Date, fasting: ReturnType<typeof evaluateFastingStatus>) {
  const dayScore = ((date.getDate() * 7 + date.getMonth() * 11) % 21) - 10;
  const fastingAdjustment = fasting.isStrictVeganDay ? 4 : 0;
  return Math.max(0, Math.min(100, 78 + dayScore + fastingAdjustment));
}

export default function WellnessPage() {
  const now = new Date();
  const rhythm = convertToHabeshaTime(now.getHours(), now.getMinutes());
  const fasting = evaluateFastingStatus(now);
  const ecology = resolveAgroEcologicalZone(2400);
  const alignmentScore = getDailyAlignmentScore(now, fasting);

  return (
    <div className="py-10">
      <div className="app-container max-w-6xl">
        <section className="glass-panel p-8 mb-8 border-l-4 border-l-amber-400">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="badge badge-safe mb-3">Today&apos;s Wellness Rhythm</div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                A practical plan for the day ahead
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                This baseline view combines Ethiopian timekeeping, seasonal fasting guidance, and agro-ecological context. Complete the intake to replace the baseline with a profile-specific evaluation.
              </p>
            </div>
            <div className="text-left lg:text-right">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Daily alignment</div>
              <div className="text-5xl font-black text-amber-300">{alignmentScore}</div>
              <div className="text-xs text-slate-400">of 100 · reflective planning score</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="glass-panel p-5">
            <div className="text-xs uppercase tracking-wider text-emerald-400 mb-2">Habesha clock</div>
            <h2 className="text-xl font-bold text-white">{rhythm.ethiopianHour} ሰዓት</h2>
            <p className="text-sm text-slate-300 mt-1">{rhythm.ethiopianPeriodAmharic}</p>
            <p className="text-xs text-slate-400 mt-3">{rhythm.macronutrientPartitioningPriority.recommendedMealType}</p>
          </div>
          <div className="glass-panel p-5">
            <div className="text-xs uppercase tracking-wider text-amber-400 mb-2">Fasting rhythm</div>
            <h2 className="text-xl font-bold text-white">{fasting.isStrictVeganDay ? "Fasting day" : "Regular day"}</h2>
            <p className="text-sm text-slate-300 mt-1">{fasting.seasonNameAmharic}</p>
            <p className="text-xs text-slate-400 mt-3">Prioritize protein pairing, zinc availability, and steady hydration.</p>
          </div>
          <div className="glass-panel p-5">
            <div className="text-xs uppercase tracking-wider text-rose-300 mb-2">Ecology baseline</div>
            <h2 className="text-xl font-bold text-white">{ecology.zone.toUpperCase()} · 2,400m</h2>
            <p className="text-sm text-slate-300 mt-1">{ecology.nameAmharic}</p>
            <p className="text-xs text-slate-400 mt-3">{ecology.predominantSoilType}</p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <div className="badge badge-moderate mb-2">Five-pillar plan</div>
            <h2 className="text-2xl font-bold text-white">Small actions, grounded in context</h2>
          </div>
          <Link href="/intake" className="btn-primary text-xs py-2.5 px-4">Personalize this plan</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="glass-panel p-5 border-t-2 border-t-emerald-400">
            <div className="text-2xl mb-3">🌾</div>
            <h3 className="font-bold text-white mb-2">Food therapy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Choose fermented teff, lentils, and greens. Pair plant iron with lemon or another vitamin C source.</p>
          </div>
          <div className="glass-panel p-5 border-t-2 border-t-amber-400">
            <div className="text-2xl mb-3">☕</div>
            <h3 className="font-bold text-white mb-2">Tea &amp; timing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Keep coffee and strong tea away from iron-focused meals when possible. Check herbs against medications first.</p>
          </div>
          <div className="glass-panel p-5 border-t-2 border-t-sky-400">
            <div className="text-2xl mb-3">🚶</div>
            <h3 className="font-bold text-white mb-2">Movement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Use a short walk after the largest meal, then keep evening movement gentle as metabolic clearance begins.</p>
          </div>
          <div className="glass-panel p-5 border-t-2 border-t-rose-400">
            <div className="text-2xl mb-3">◉</div>
            <h3 className="font-bold text-white mb-2">Pressure points</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Use the dedicated somatics and fasting tools for guided practices rather than improvising treatment.</p>
          </div>
          <div className="glass-panel p-5 border-t-2 border-t-violet-400">
            <div className="text-2xl mb-3">◌</div>
            <h3 className="font-bold text-white mb-2">Emotional reset</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Take five quiet minutes before the next meal to notice hunger, stress, and energy without judgment.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <section className="glass-panel p-6">
            <h2 className="text-lg font-bold text-white mb-4">Right now</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">{rhythm.macronutrientPartitioningPriority.metabolicNote}</p>
            <div className="flex flex-wrap gap-2">
              {rhythm.macronutrientPartitioningPriority.optimalFoods.slice(0, 4).map((food) => (
                <span key={food} className="badge badge-safe normal-case tracking-normal">{food}</span>
              ))}
            </div>
          </section>
          <section className="glass-panel p-6">
            <h2 className="text-lg font-bold text-white mb-4">Continue into the toolkit</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/fasting" className="btn-secondary text-xs py-3 text-center">Fasting &amp; refeeding</Link>
              <Link href="/somatics" className="btn-secondary text-xs py-3 text-center">Somatic rhythm</Link>
              <Link href="/safety" className="btn-secondary text-xs py-3 text-center">Safety checker</Link>
            </div>
          </section>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed border-t border-white/10 pt-5">
          Educational planning only. This page is not a diagnosis or treatment plan. Medication changes, supplements, fasting, and herbal products should be reviewed with a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
}
