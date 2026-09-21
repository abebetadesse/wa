import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BrainCircuit,
  Compass,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const pillars = [
  {
    title: "Food wisdom & nutrition",
    copy: "Teff, kocho, herbs, fasting patterns, and everyday eating rituals grounded in local biology and seasonal practice.",
    icon: Leaf,
  },
  {
    title: "Heritage & ritual memory",
    copy: "Astral memory, family care, ceremonial meaning, and the living way community wisdom shapes daily wellbeing.",
    icon: BookOpenText,
  },
  {
    title: "Healing practice & ceremony",
    copy: "Herbal knowledge, body work, ceremonial guidance, and culturally rooted remedies interpreted with clear safety boundaries.",
    icon: HeartHandshake,
  },
  {
    title: "Ecology & living context",
    copy: "Altitude, climate, fermented foods, and environmental rhythm as they shape health, resilience, and everyday life.",
    icon: Compass,
  },
  {
    title: "Safety, ethics & evidence",
    copy: "Medication checks, evidence boundaries, and clear guidance when modern clinical care and traditional wisdom need separation.",
    icon: ShieldCheck,
  },
];

const cases = [
  "Care pathway 1: daily health, body rhythm, and resilience",
  "Care pathway 2: food, fasting, and practical nutrition",
  "Care pathway 3: ritual meaning, family life, and cultural context",
  "Care pathway 4: risk screening, safety, and clinical decision support",
  "Care pathway 5: integrated wellbeing and long-term prevention",
];

export default function HomePage() {
  return (
    <main className="ninimed-home">
      <section className="app-container ninimed-hero">
        <div className="ninimed-hero-copy">
          <div className="ninimed-eyebrow">
            <span className="ninimed-pulse" /> Ethiopian wisdom atlas
          </div>
          <h1>Where heritage, healing, and everyday wisdom meet.</h1>
          <p className="ninimed-lede">
            A living map of Ethiopian wellbeing: food wisdom, ritual memory, ecological knowledge, and grounded care designed for everyday life.
          </p>
          <div className="ninimed-actions">
            <Link href="/case" className="btn-pill-primary">
              Explore the five care pathways <ArrowRight size={17} />
            </Link>
            <Link href="/discover" className="btn-pill-secondary">
              Browse the knowledge pillars
            </Link>
          </div>
          <div className="ninimed-trust-row">
            <span><Sparkles size={16} /> Traditional wisdom</span>
            <span><ShieldCheck size={16} /> Safety-aware</span>
            <span><BookOpenText size={16} /> Knowledge-rich</span>
          </div>
        </div>

        <div className="ninimed-hero-panel" aria-label="Ethiopian wisdom overview">
          <div className="ninimed-orbit ninimed-orbit-one" />
          <div className="ninimed-orbit ninimed-orbit-two" />
          <div className="ninimed-hero-panel-inner">
            <div className="ninimed-panel-kicker">Living knowledge</div>
            <div className="ninimed-panel-icon"><BrainCircuit size={28} /></div>
            <h2>One living system for care, culture, and practical wisdom.</h2>
            <p>
              The platform brings together the five care pathways and the core knowledge pillars into one grounded, context-rich experience.
            </p>
            <Link href="/profile/onboarding" className="ninimed-panel-link">
              Begin your personal profile <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section className="app-container ninimed-section" aria-labelledby="pathways-heading">
        <div className="ninimed-section-heading">
          <div>
            <p className="ninimed-kicker">The five care pathways</p>
            <h2 id="pathways-heading">The living pathways of Ethiopian wellbeing</h2>
          </div>
          <p>
            Each pathway connects the person, the place, the practice, and the evidence so the guidance feels rooted in real life.
          </p>
        </div>

        <div className="ninimed-case-grid">
          {cases.map((caseLabel) => (
            <div key={caseLabel} className="ninimed-case-card">
              <span className="ninimed-case-index">Case</span>
              <p>{caseLabel}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="app-container ninimed-section" aria-labelledby="pillars-heading">
        <div className="ninimed-section-heading">
          <div>
            <p className="ninimed-kicker">Knowledge pillars</p>
            <h2 id="pillars-heading">The foundations of living wisdom</h2>
          </div>
          <p>
            These pillars connect heritage, food knowledge, ecology, safety, and lived practice into one coherent understanding of care.
          </p>
        </div>

        <div className="ninimed-knowledge-grid">
          {pillars.map(({ title, copy, icon: Icon }) => (
            <div key={title} className="ninimed-knowledge-card">
              <span className="ninimed-card-icon"><Icon size={21} /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="app-container ninimed-safety-band">
        <div className="ninimed-safety-icon"><ShieldCheck size={24} /></div>
        <div>
          <p className="ninimed-kicker">Culture is honored; evidence stays clear</p>
          <h2>Tradition is respected without losing clinical rigor.</h2>
          <p>
            This experience keeps cultural care in context while maintaining transparent safety checks for medication, risk, and bodily harm.
          </p>
        </div>
        <Link href="/safety" className="ninimed-safety-link">
          See safety framework <ArrowRight size={15} />
        </Link>
      </section>
    </main>
  );
}
