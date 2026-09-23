"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronRight,
  Heart,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from "lucide-react";

type HoroscopeSign = {
  id: string;
  name: string;
  symbol: string;
  element: string;
  keywords: string[];
  summary: string;
  theme: string;
  love: string;
  career: string;
  wellness: string;
  outlook: string;
};

const signs: HoroscopeSign[] = [
  {
    id: "aries",
    name: "Aries",
    symbol: "♈",
    element: "Fire",
    keywords: ["initiative", "courage", "momentum"],
    summary:
      "Your pace is magnetic today. The strongest gain comes when you lead with clear intention rather than force. A direct conversation or a decisive next step can unlock a major opening.",
    theme: "Action with precision moves the day forward.",
    love: "Affection grows when you speak plainly and stay emotionally present instead of rushing the moment.",
    career: "Professional momentum is strongest in fast-moving projects that reward initiative and confident follow-through.",
    wellness: "Protect your energy with a calmer midday reset and a nourishing meal before evening commitments.",
    outlook: "Momentum is favorable for launching, repairing, or re-framing what you are ready to lead.",
  },
  {
    id: "taurus",
    name: "Taurus",
    symbol: "♉",
    element: "Earth",
    keywords: ["stability", "comfort", "beauty"],
    summary:
      "Your natural rhythm favors grounding, beauty, and practical refinement. A slower, more deliberate decision may feel better than an impulsive one.",
    theme: "Stability becomes your quiet power.",
    love: "Tender routines and honest reassurance bring emotional ease to close relationships.",
    career: "Your values are strongest when you anchor plans to what feels sustainable, beautiful, and long-lasting.",
    wellness: "Movement, quality sleep, and sensory comfort restore your vitality more than over-optimization.",
    outlook: "Solid progress arrives when you protect your pace and honor what truly feels supportive.",
  },
  {
    id: "gemini",
    name: "Gemini",
    symbol: "♊",
    element: "Air",
    keywords: ["curiosity", "speech", "adaptation"],
    summary:
      "The trick today is choosing depth over noise. Your quick mind is bright and engaging, but the most meaningful shift comes from listening as well as speaking.",
    theme: "A thoughtful word can change the entire tone of the day.",
    love: "Lively exchanges and genuine curiosity help emotional intimacy become more effortless.",
    career: "Communication, review, and making sense of complex information are your strongest assets today.",
    wellness: "Reduce mental clutter through short pauses, hydration, and a quieter late-afternoon reset.",
    outlook: "Ideas are promising, but focus is what turns them into solid progress.",
  },
  {
    id: "cancer",
    name: "Cancer",
    symbol: "♋",
    element: "Water",
    keywords: ["care", "intuition", "home"],
    summary:
      "Emotional intelligence is one of your greatest strengths today. Protect your personal energy while leaning into warmth, trust, and familiar support.",
    theme: "Nurture creates the clearest path forward.",
    love: "What feels most healing is honest tenderness and a willingness to share what has been heavy or private.",
    career: "A supportive team dynamic will feel more productive than constant hustle when the goal is long-term care.",
    wellness: "Rest, nourishment, and soothing rituals help you regulate your energy with grace.",
    outlook: "The strongest opening is the one that keeps you rooted while still allowing love to move freely.",
  },
  {
    id: "leo",
    name: "Leo",
    symbol: "♌",
    element: "Fire",
    keywords: ["expression", "confidence", "warmth"],
    summary:
      "Your confidence is a useful advantage, especially when you channel it into leadership, creativity, and generosity rather than self-importance.",
    theme: "Bold expression opens doors that cautious silence keeps closed.",
    love: "Warmth and playfulness strengthen emotional bonds when you invite authentic affection without performance.",
    career: "Visibility, mentoring, and confident presentation create ideal conditions for recognition.",
    wellness: "Recharge with time outdoors and a rhythm that honors both motion and joy.",
    outlook: "Your creative leadership is in demand; let your generosity be as disciplined as your ambition.",
  },
  {
    id: "virgo",
    name: "Virgo",
    symbol: "♍",
    element: "Earth",
    keywords: ["discipline", "service", "refinement"],
    summary:
      "The healthiest day for you is the one where you use your discernment to simplify rather than over-correct. Ease is part of the process.",
    theme: "Practical clarity is a form of care.",
    love: "Thoughtful gestures and steady communication deepen trust more than dramatic displays.",
    career: "Your best work arrives when you streamline systems, reduce friction, and improve what already matters.",
    wellness: "A lighter routine, better hydration, and fewer unnecessary demands will support your energy.",
    outlook: "Small structural changes can create a noticeably larger sense of relief and momentum.",
  },
  {
    id: "libra",
    name: "Libra",
    symbol: "♎",
    element: "Air",
    keywords: ["balance", "harmony", "beauty"],
    summary:
      "Harmony is your ally today, and your ability to soften tension can bring good outcomes in both personal and practical matters. Be honest about your boundaries while staying diplomatic.",
    theme: "Fairness is transformative when it is paired with clear self-respect.",
    love: "Relationship energy flows best when you create space for both tenderness and truth.",
    career: "Negotiation, collaboration, and aesthetic judgment are especially effective in team-centered work.",
    wellness: "Light movement, balanced meals, and emotional pacing will maintain your center.",
    outlook: "The best results come from staying graceful while refusing to dilute your standards.",
  },
  {
    id: "scorpio",
    name: "Scorpio",
    symbol: "♏",
    element: "Water",
    keywords: ["depth", "focus", "transformation"],
    summary:
      "Trust your instincts. The day rewards honesty, emotional courage, and the willingness to let go of patterns that no longer fit your future.",
    theme: "The deepest truth is your advantage today.",
    love: "Intensity becomes more nourishing when it is paired with vulnerability and emotional safety.",
    career: "Your strategic instincts are particularly powerful in moments that require focus, discretion, or repair.",
    wellness: "Needing more quiet time is not avoidance; it is how your system recalibrates.",
    outlook: "Transformation is successful when it is informed by truth rather than stress.",
  },
  {
    id: "sagittarius",
    name: "Sagittarius",
    symbol: "♐",
    element: "Fire",
    keywords: ["expansion", "freedom", "wisdom"],
    summary:
      "Your horizon is wider than your current routine suggests. A new idea, a stretch of travel, or a different perspective could bring valuable clarity.",
    theme: "Movement opens the next chapter.",
    love: "Shared laughter, freedom, and honest optimism help emotional connection feel inspiring rather than heavy.",
    career: "You are at your strongest when you connect vision to action and communicate the bigger picture clearly.",
    wellness: "Fresh air, open movement, and time away from routine restore your vitality.",
    outlook: "One brave step beyond the familiar path may reveal an opportunity that aligns with your future.",
  },
  {
    id: "capricorn",
    name: "Capricorn",
    symbol: "♑",
    element: "Earth",
    keywords: ["discipline", "authority", "structure"],
    summary:
      "Your steady work ethic is one of your most valuable assets. Today favors methodical progress, careful planning, and trust in long-term effort.",
    theme: "Structure creates room for lasting growth.",
    love: "Reliability and quiet devotion create a strong emotional foundation when sincerity is present.",
    career: "Strategic decisions and practical follow-through are especially effective in professional settings.",
    wellness: "Recovery follows when you honor rest as part of your performance, not as a reward for it.",
    outlook: "Sustainable wins are arriving; your patience is producing genuine leverage.",
  },
  {
    id: "aquarius",
    name: "Aquarius",
    symbol: "♒",
    element: "Air",
    keywords: ["vision", "freedom", "innovation"],
    summary:
      "Your mind is working at a higher frequency. Practical insight comes when you pair originality with a more grounded plan for how it will unfold.",
    theme: "Vision is strongest when it is shaped into action.",
    love: "Connection grows through mutual respect, shared ideals, and the freedom to be fully yourself.",
    career: "Innovation and problem-solving stand out when you bring structure to your best ideas.",
    wellness: "A little less stimulation and a little more calm helps your nervous system settle.",
    outlook: "The future is opening through a balance of independence and real partnership.",
  },
  {
    id: "pisces",
    name: "Pisces",
    symbol: "♓",
    element: "Water",
    keywords: ["intuition", "emotion", "dreams"],
    summary:
      "Your intuition is unusually clear. The day best supports gentleness, emotional honesty, and a focus on what can be healed, softened, or remembered.",
    theme: "Graceful listening reveals the next step.",
    love: "Compassion and sincerity bring connection closer than performance or over-explaining.",
    career: "Creative insight, imagination, and emotional intelligence are your keys to meaningful progress.",
    wellness: "Protect your energy with quiet rituals, gentleness, and enough rest to stay present.",
    outlook: "What feels most meaningful today is not the loudest path but the most aligned one.",
  },
];

const horoscopeCategories = [
  {
    title: "Daily horoscope",
    copy: "A forward-looking reading for the current emotional, relational, and practical rhythm of the day.",
  },
  {
    title: "Personality",
    copy: "A deeper view into character, instincts, and the way your style shows up in the world.",
  },
  {
    title: "Love & relationship",
    copy: "Compatibility signals, patterns of intimacy, and the emotional tone shaping your connections.",
  },
  {
    title: "Forecast",
    copy: "Seasonal themes and life-cycle timing to help you understand what momentum is strongest now.",
  },
];

export default function HoroscopePage() {
  const [selected, setSelected] = useState<HoroscopeSign>(signs[0]);

  return (
    <main className="app-container py-10 md:py-14">
      <header className="mb-8 rounded-[32px] border border-amber-500/20 bg-gradient-to-br from-[#1b1718] via-[#37251a] to-[#1c1f1b] p-6 md:p-8 shadow-[0_24px_90px_rgba(13,10,8,0.42)]">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-200">
          <Sparkles size={12} /> Daily cosmic desk
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
              Horoscope guidance rooted in rhythm, intuition, and lived experience.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-200 md:text-base">
              This horoscope desk draws from the same cosmic language familiar from major horoscope portals—sign archetypes, planetary mood, love tendencies, and practical timing—while keeping it tailored to a wellness-first cultural experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/cultural" className="btn-pill-primary">
              Explore heritage layer <ArrowRight size={15} />
            </Link>
            <Link href="/profile/onboarding" className="btn-pill-secondary">
              Personal profile
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[28px] border border-white/10 bg-stone-900/80 p-4 md:p-5">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {signs.map((sign) => {
              const isActive = selected.id === sign.id;
              return (
                <button
                  key={sign.id}
                  type="button"
                  onClick={() => setSelected(sign)}
                  className={`flex min-w-[126px] items-center gap-2 rounded-full border px-3 py-2 text-left text-sm font-medium transition ${
                    isActive
                      ? "border-amber-400/70 bg-amber-300/12 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.18)]"
                      : "border-white/10 bg-white/2 text-stone-300 hover:border-amber-300/40 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{sign.symbol}</span>
                  {sign.name}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-4xl shadow-inner shadow-amber-400/10">
                  {selected.symbol}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">{selected.element}</p>
                  <h2 className="text-3xl font-black text-white">{selected.name}</h2>
                </div>
              </div>

              <p className="mt-5 text-base leading-relaxed text-stone-200">{selected.summary}</p>

              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-[#231b12] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300">Today&apos;s theme</p>
                <h3 className="mt-2 text-xl font-bold text-white">{selected.theme}</h3>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                  <div className="mb-2 flex items-center gap-2 text-amber-300">
                    <Heart size={15} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Love</span>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-200">{selected.love}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                  <div className="mb-2 flex items-center gap-2 text-amber-300">
                    <BriefcaseBusiness size={15} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Career</span>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-200">{selected.career}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                  <div className="mb-2 flex items-center gap-2 text-amber-300">
                    <SunMedium size={15} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Wellness</span>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-200">{selected.wellness}</p>
                </div>
              </div>
            </div>

            <aside className="rounded-[24px] border border-amber-300/20 bg-[#17140f] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300">Reading overview</p>
              <ul className="mt-4 space-y-3 text-sm text-stone-200">
                {selected.keywords.map((keyword) => (
                  <li key={keyword} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    {keyword}
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/3 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300">Outlook</p>
                <p className="mt-2 text-sm leading-relaxed text-stone-200">{selected.outlook}</p>
              </div>
            </aside>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: "Daily reading", note: "Today" },
            { label: "Weekly rhythm", note: "This week" },
            { label: "Monthly arc", note: "This month" },
          ].map((item) => (
            <div key={item.label} className="rounded-[24px] border border-white/10 bg-stone-900/80 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">{item.note}</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-white">{item.label}</h3>
                <ChevronRight size={16} className="text-stone-400" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">
                {item.label === "Daily reading" && selected.summary}
                {item.label === "Weekly rhythm" && "Your pace is strongest when you use consistency rather than intensity to build momentum and repair what needs attention."}
                {item.label === "Monthly arc" && "A larger turning point favors aligning long-term goals with disciplined action and the relationships that genuinely support your next phase."}
              </p>
            </div>
          ))}

          <div className="rounded-[24px] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-amber-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-300">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Guided lens</span>
            </div>
            <p className="text-sm leading-relaxed text-stone-100">
              Use astrology as reflection and rhythm, not as a substitute for medical advice or urgent care decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {horoscopeCategories.map((item) => (
          <div key={item.title} className="rounded-[24px] border border-white/10 bg-stone-900/70 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300">{item.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">{item.copy}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
