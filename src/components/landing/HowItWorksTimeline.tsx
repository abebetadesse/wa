"use client";

import { Compass, Sparkles, ShieldCheck, ScrollText } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Select Guidance Pathway",
    amharic: "የመምረጫ መንገድ",
    description:
      "Choose from Spiritual Life Direction, Relationship Harmony, Career Timing, Elder Dispute Mediation, or Precision wellbeing.",
    icon: <Compass size={22} className="text-gold" />,
    badge: "5 Pathways",
  },
  {
    step: "02",
    title: "Enter Sacred Coordinates",
    amharic: "ስምና የተወለዱበት መረጃ",
    description:
      "Input your name in Latin or Ge'ez Fidel alongside your birth date, time, and ancestral city to lock exact astrological and gematric coordinates.",
    icon: <Sparkles size={22} className="text-info" />,
    badge: "Real-time Gematria",
  },
  {
    step: "03",
    title: "Dual-Domain Synthesis",
    amharic: "ባለ ሁለት ዘርፍ ትንተና",
    description:
      "Domain A processes scientific nutritional baselines (EFCT) & herb safety gates, while Domain B computes the 16 Awde Negest circles.",
    icon: <ShieldCheck size={22} className="text-brand" />,
    badge: "Strictly Firewalled",
  },
  {
    step: "04",
    title: "Receive Certified Report",
    amharic: "የተረጋገጠ የጥበብ ውጤት",
    description:
      "Access your comprehensive digital parchment report, complete with talismanic symbols, auspicious windows, and remedial wisdom.",
    icon: <ScrollText size={22} className="text-plum" />,
    badge: "Expert Verified",
  },
];

export default function HowItWorksTimeline() {
  return (
    <section className="relative my-12" aria-label="How the platform works">
      <div className="section-header text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-info/30 bg-info/10 px-3.5 py-1 text-xs font-mono font-medium text-info-strong mb-3">
          <Sparkles size={12} className="text-info" />
          SYSTEM OPERATIONAL FLOW
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          How Ancestral Intelligence Operates
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
          Four disciplined stages combining centuries of Ethiopian scholastic tradition with modern algorithmic precision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative">
        {STEPS.map((item, index) => (
          <div
            key={item.step}
            className="group relative rounded-2xl border border-border bg-gradient-to-b from-card/60 to-background/80 p-6  transition-all duration-300 hover:border-gold/40 hover:-translate-y-1 hover:shadow-panel"
          >
            {/* Step Number & Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-2xl font-bold text-subtle group-hover:text-gold/40 transition-colors">
                {item.step}
              </span>
              <span className="rounded-full border border-border bg-foreground/5 px-2.5 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                {item.badge}
              </span>
            </div>

            {/* Icon */}
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-foreground/5 transition-transform group-hover:scale-110">
              {item.icon}
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-foreground group-hover:text-gold transition-colors">
              {item.title}
            </h3>
            <div className="text-xs font-mono text-gold mb-2">{item.amharic}</div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
