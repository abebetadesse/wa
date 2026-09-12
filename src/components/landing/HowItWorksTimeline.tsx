"use client";

import { Compass, Sparkles, ShieldCheck, ScrollText } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Select Guidance Pathway",
    amharic: "የመምረጫ መንገድ",
    description:
      "Choose from Spiritual Life Direction, Relationship Harmony, Career Timing, Elder Dispute Mediation, or Precision health.",
    icon: <Compass size={22} className="text-amber-400" />,
    badge: "5 Pathways",
  },
  {
    step: "02",
    title: "Enter Sacred Coordinates",
    amharic: "ስምና የተወለዱበት መረጃ",
    description:
      "Input your name in Latin or Ge'ez Fidel alongside your birth date, time, and ancestral city to lock exact astrological and gematric coordinates.",
    icon: <Sparkles size={22} className="text-cyan-400" />,
    badge: "Real-time Gematria",
  },
  {
    step: "03",
    title: "Dual-Domain Synthesis",
    amharic: "ባለ ሁለት ዘርፍ ትንተና",
    description:
      "Domain A processes clinical nutritional baselines (EFCT) & herb safety gates, while Domain B computes the 16 Awde Negest circles.",
    icon: <ShieldCheck size={22} className="text-emerald-400" />,
    badge: "Strictly Firewalled",
  },
  {
    step: "04",
    title: "Receive Certified Report",
    amharic: "የተረጋገጠ የጥበብ ውጤት",
    description:
      "Access your comprehensive digital parchment report, complete with talismanic symbols, auspicious windows, and remedial wisdom.",
    icon: <ScrollText size={22} className="text-purple-400" />,
    badge: "Expert Verified",
  },
];

export default function HowItWorksTimeline() {
  return (
    <section className="relative my-12" aria-label="How the platform works">
      <div className="section-header text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-mono font-medium text-cyan-300 mb-3">
          <Sparkles size={12} className="text-cyan-400" />
          SYSTEM OPERATIONAL FLOW
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          How Ancestral Intelligence Operates
        </h2>
        <p className="mt-2 text-sm text-stone-400 max-w-xl mx-auto">
          Four disciplined stages combining centuries of Ethiopian scholastic tradition with modern algorithmic precision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative">
        {STEPS.map((item, index) => (
          <div
            key={item.step}
            className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-stone-900/60 to-stone-950/80 p-6 backdrop-blur-md transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
          >
            {/* Step Number & Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-2xl font-black text-white/20 group-hover:text-amber-400/40 transition-colors">
                {item.step}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                {item.badge}
              </span>
            </div>

            {/* Icon */}
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-transform group-hover:scale-110">
              {item.icon}
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              {item.title}
            </h3>
            <div className="text-xs font-mono text-amber-400/80 mb-2">{item.amharic}</div>

            {/* Description */}
            <p className="text-xs text-stone-400 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
