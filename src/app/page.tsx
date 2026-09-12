// src/app/page.tsx
"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Compass,
  Database,
  Orbit,
  Sparkles,
  ShieldCheck,
  Users,
  Star,
  Hash,
  TrendingUp,
  CircleDot,
  Leaf,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ETHIOPIAN_MEDICINAL_PLANTS } from "@/lib/knowledge/ethiopianMedicinalPlants";
import { useLanguage } from "@/lib/i18n/context";
import HudButton from "@/components/hud/HudButton";
import HudPanel from "@/components/hud/HudPanel";
import StatusPill from "@/components/hud/StatusPill";
import AstroWheel from "@/components/hud/AstroWheel";
import NutritionRadar from "@/components/hud/NutritionRadar";
import DataStream from "@/components/hud/DataStream";
import GlowCard from "@/components/hud/GlowCard";
import ZodiacWheel from "@/components/hud/ZodiacWheel";
import NumerologyGrid from "@/components/hud/NumerologyGrid";
import AwdeNegestRings from "@/components/hud/AwdeNegestRings";
import FinanceFlow from "@/components/hud/FinanceFlow";
import LiveGematriaWidget from "@/components/hud/LiveGematriaWidget";
import TestimonialCarousel from "@/components/landing/TestimonialCarousel";
import HowItWorksTimeline from "@/components/landing/HowItWorksTimeline";

const COUNTER_ITEMS = [
  { label: "Foods", value: 726 },
  { label: "Nutrients", value: 69 },
  { label: "Districts", value: 48 },
  { label: "Experts", value: 190 },
];

const FEATURE_ITEMS = [
  { title: "Regional Matrix", description: "District-scale food and nutrient mapping.", icon: <Database size={26} /> },
  { title: "Nutrient Profiles", description: "High-precision compositions and deficiencies.", icon: <BarChart3 size={26} /> },
  { title: "Recipe Intelligence", description: "Meal compatibility and bioavailability logic.", icon: <Sparkles size={26} /> },
  { title: "Astro-Engine", description: "Ethiopian timing aligned to the heavens.", icon: <Compass size={26} /> },
  { title: "Data Export", description: "Structured reports for researchers and teams.", icon: <Orbit size={26} /> },
  { title: "API Access", description: "Secure programmatic access for integrations.", icon: <ShieldCheck size={26} /> },
];

const DOMAIN_CARDS = [
  {
    id: "spiritual",
    title: "Spiritual & Life Direction",
    subtitle: "🔮 Flagship Service",
    description: "Awde Negest divination, gematria reading, talismanic character, healing scroll",
    icon: <Star size={28} />,
    accent: "#f59e0b",
    href: "/case/spiritual/intake",
    stats: { readings: "12,400+", rating: "4.9", experts: "48" },
  },
  {
    id: "relationships",
    title: "Relationships & Family",
    subtitle: "💑 High Demand",
    description: "Compatibility reading, traditional mediation, reconciliation rituals",
    icon: <Users size={28} />,
    accent: "#ec4899",
    href: "/case/relationships/intake",
    stats: { readings: "8,200+", rating: "4.8", experts: "32" },
  },
  {
    id: "career",
    title: "Career & Business",
    subtitle: "💼 Business Timing",
    description: "Auspicious timing, business blessing, name numerology",
    icon: <TrendingUp size={28} />,
    accent: "#10b981",
    href: "/case/career/intake",
    stats: { readings: "5,800+", rating: "4.7", experts: "28" },
  },
  {
    id: "legal",
    title: "Legal & Dispute",
    subtitle: "⚖️ Elder Mediation",
    description: "Shimglina elder council, dispute resolution, reconciliation guidance",
    icon: <ShieldCheck size={28} />,
    accent: "#8b5cf6",
    href: "/case/legal/intake",
    stats: { readings: "2,100+", rating: "4.9", experts: "18" },
  },
  {
    id: "health",
    title: "health & Wellness",
    subtitle: "🩺 Clinical Anchor",
    description: "Evidence-based clinical analysis with optional traditional healing",
    icon: <CircleDot size={28} />,
    accent: "#06b6d4",
    href: "/case/health/intake",
    stats: { readings: "18,600+", rating: "4.8", experts: "62" },
  },
];

export default function HomePage() {
  const { language, setLanguage } = useLanguage();
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [visualMode, setVisualMode] = useState<"oracle" | "neon">("oracle");
  const [orbOffset, setOrbOffset] = useState(0);

  useEffect(() => {
    const target = [726, 69, 48, 190];
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const ratio = Math.min(elapsed / 1200, 1);
      setCounts(target.map((value) => Math.round(value * ratio)));
      if (ratio < 1) requestAnimationFrame(tick);
    };
    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const savedMode = window.localStorage.getItem("wa-landing-theme");
    if (savedMode === "neon" || savedMode === "oracle") {
      setVisualMode(savedMode);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("wa-landing-theme", visualMode);
  }, [visualMode]);

  useEffect(() => {
    const onScroll = () => setOrbOffset(window.scrollY * 0.12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`landing-shell oracle-temple divination-chamber temple-fullscreen theme-${visualMode}`}>
      <div className="oracle-rune-thread oracle-rune-thread--landing" aria-hidden="true">
        <span className="rune-line" />
        {Array.from({ length: 5 }, (_, index) => (
          <span key={`landing-rune-${index}`} className="rune-node">
            {index % 2 === 0 ? "✦" : "ᛉ"}
          </span>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="hero-shell">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={14} />
            ETHIOPIAN WISDOM • የኢትዮጵያ ጥበብ
          </div>

          <h1 className="hero-title">
            ANCESTRAL<span> INTELLIGENCE</span>
          </h1>

          <p className="hero-subtitle">
            Awde Negest · Gematria · Astrology · Finance · health
          </p>

          <div className="hero-stream">
            <DataStream
              lines={[
                "> INITIALIZING WISDOM CORE v3.0",
                "> LOADING AWDE NEGEST · 16 CIRCLES · 256 SEGMENTS",
                "> COMPUTING GEMATRIA FOR 'ሙሉ' = 60 ÷ 12 = 5",
                "> ASTRO-CALENDRICAL ENGINE ONLINE",
                "> 13-SIGN ZODIAC SYNCHRONIZED",
                "> FINANCE TIMING MODULE ACTIVE",
              ]}
              speed={30}
            />
          </div>

          <div className="hero-actions">
            <Link href="/auth?mode=login" passHref>
              <HudButton variant="primary" size="lg" trailingIcon={<ArrowRight size={16} />}>
                BEGIN YOUR READING
              </HudButton>
            </Link>
            <Link href="/dashboard" passHref>
              <HudButton variant="outline" size="lg">
                EXPLORE DOMAINS
              </HudButton>
            </Link>
          </div>

          <div className="theme-toggle-wrap" aria-label="Landing page visual style selector">
            <span className="theme-toggle-label">VISUAL MODE</span>
            <div className="theme-toggle-group" role="tablist" aria-label="Select landing mode">
              <button
                type="button"
                className={`theme-switch ${visualMode === "oracle" ? "is-active" : ""}`}
                onClick={() => setVisualMode("oracle")}
                aria-pressed={visualMode === "oracle"}
              >
                Oracle Temple
              </button>
              <button
                type="button"
                className={`theme-switch ${visualMode === "neon" ? "is-active" : ""}`}
                onClick={() => setVisualMode("neon")}
                aria-pressed={visualMode === "neon"}
              >
                Neon Grid
              </button>
            </div>
          </div>

          <div className="theme-toggle-wrap mt-2" aria-label="Platform language selector">
            <span className="theme-toggle-label">LANGUAGE / ቋንቋ</span>
            <div className="theme-toggle-group" role="tablist" aria-label="Select language">
              {[
                { code: "en", label: "English", short: "EN" },
                { code: "am", label: "አማርኛ", short: "አማ" },
                { code: "om", label: "Oromoo", short: "OM" },
                { code: "ti", label: "ትግርኛ", short: "TI" },
                { code: "so", label: "Soomaali", short: "SO" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`theme-switch ${language === lang.code ? "is-active" : ""}`}
                  onClick={() => setLanguage(lang.code as any)}
                  title={lang.label}
                >
                  {lang.short}
                </button>
              ))}
            </div>
          </div>

          <div className="counter-row">
            {COUNTER_ITEMS.map((item, index) => (
              <div key={item.label} className="counter-card">
                <div className="counter-value">{counts[index] ?? 0}</div>
                <div className="counter-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div
            className="planet-stage"
            aria-label="Sacred energy orb"
            style={{ transform: `translate3d(0, ${orbOffset}px, 0)` }}
          >
            <div className="orbital-aura orbital-aura--one" />
            <div className="orbital-aura orbital-aura--two" />
            <div className="planet-orbit orbit-one" />
            <div className="planet-orbit orbit-two" />
            <div className="planet-core">
              <span className="planet-core__glyph">✦</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PLATFORM OVERVIEW COLUMNS                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="overview-grid" aria-label="Platform overview modules">
        <article className="overview-panel overview-panel--focus">
          <div className="overview-label">Clinical system</div>
          <h3>Precision care pathways</h3>
          <p>
            High-signal intake logic, verified nutrition evidence, and safety gating all flow into
            a single patient-centered clinical lens.
          </p>
          <ul>
            <li>Nutrition gap detection</li>
            <li>Medication interaction review</li>
            <li>Evidence-led recommendations</li>
          </ul>
          <div className="overview-feature-strip">
            <span>Verified safety</span>
            <span>Clinical-fidelity</span>
            <span>Open intelligence</span>
          </div>
        </article>

        <div className="overview-rail">
          <article className="overview-panel overview-panel--stats">
            <div className="overview-label">System state</div>
            <h3>Operational intelligence</h3>
            <div className="mini-metric-row">
              <div>
                <strong>11</strong>
                <span>Knowledge strands</span>
              </div>
              <div>
                <strong>5</strong>
                <span>Guidance paths</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Decision support</span>
              </div>
            </div>
            <div className="mini-chart" aria-hidden="true">
              <span style={{ height: "46%" }} />
              <span style={{ height: "68%" }} />
              <span style={{ height: "52%" }} />
              <span style={{ height: "82%" }} />
              <span style={{ height: "92%" }} />
              <span style={{ height: "76%" }} />
            </div>
          </article>

          <article className="overview-panel overview-panel--action">
            <div className="overview-label">Next steps</div>
            <h3>Start with a complete reading</h3>
            <p>
              Enter your profile and unlock the full sequence: name analysis, timing, nutrition, and
              wellness recommendations.
            </p>
            <Link href="/auth?mode=login" passHref>
              <HudButton variant="primary" size="md">
                Begin a reading
              </HudButton>
            </Link>
          </article>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DOMAIN DASHBOARD — 5 CASE TYPES                             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="domain-dashboard-shell">
        <div className="section-header">
          <div className="eyebrow eyebrow--amber">
            <Sparkles size={14} />
            FIVE PATHWAYS TO GUIDANCE
          </div>
          <h2 className="section-title">CHOOSE YOUR PATH</h2>
          <p className="section-subtitle">
            Each pathway combines ancient Ethiopian wisdom with modern expert validation.
            Every report is reviewed by a credentialed specialist before delivery.
          </p>
        </div>

        <div className="domain-grid" aria-label="Primary care pathway dashboard columns">
          {DOMAIN_CARDS.map((domain, idx) => (
            <Link key={domain.id} href={domain.href} className="domain-card-link">
              <div
                className="domain-card"
                style={{ "--domain-accent": domain.accent } as React.CSSProperties}
              >
                <div className="domain-card-glow" />
                <div className="domain-module">
                  <div className="domain-summary">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="domain-card-icon">{domain.icon}</div>
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold">
                        <ShieldCheck size={11} /> Verified
                      </span>
                    </div>
                    <div className="domain-card-subtitle">{domain.subtitle}</div>
                    <h3 className="domain-card-title">{domain.title}</h3>
                    <p className="domain-card-description">{domain.description}</p>
                  </div>

                  <div className="domain-visual" aria-hidden="true">
                    <div className="domain-visual-ring">
                      <div className="domain-ring-core" />
                    </div>
                    <div className="domain-mini-bars">
                      {Array.from({ length: 5 }, (_, barIndex) => (
                        <span
                          key={`${domain.id}-bar-${barIndex}`}
                          className="domain-mini-bar"
                          style={{ height: `${32 + ((barIndex + 1) * 16) % 48}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="domain-rail">
                    <div className="domain-rail-metric">
                      <span className="domain-rail-label">Readings</span>
                      <strong>{domain.stats.readings}</strong>
                    </div>
                    <div className="domain-rail-metric">
                      <span className="domain-rail-label">Rating</span>
                      <strong>★ {domain.stats.rating}</strong>
                    </div>
                    <div className="domain-rail-metric">
                      <span className="domain-rail-label">Experts</span>
                      <strong>{domain.stats.experts}</strong>
                    </div>
                    <div className="domain-card-cta">
                      <span>Begin</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS TIMELINE                                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <HowItWorksTimeline />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ASTROLOGY DASHBOARD                                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="dashboard-shell dashboard-shell--astro">
        <div className="dashboard-copy">
          <div className="eyebrow eyebrow--amber">
            <Star size={14} />
            ASTROLOGY ENGINE
          </div>
          <h2 className="dashboard-title">THE HEAVENS REMEMBER EVERY NAME.</h2>
          <p className="dashboard-description">
            Ethiopian 13-sign zodiac aligned with the sacred calendar. Planetary hours,
            elemental harmony, and talismanic resonance — all computed in real time.
          </p>

          <div className="dashboard-stats-row">
            <div className="dash-stat">
              <div className="dash-stat-value">13</div>
              <div className="dash-stat-label">Zodiac Signs</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value">7</div>
              <div className="dash-stat-label">Planets</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value">12</div>
              <div className="dash-stat-label">Houses</div>
            </div>
          </div>

          <div className="astro-detail-panel">
            <div className="sign-symbols" aria-label="Current zodiac symbols">
              <span>🦁</span>
              <span>☀️</span>
              <span>🌧️</span>
              <span>🐆</span>
              <span>💧</span>
              <span>🦅</span>
              <span>🐦</span>
              <span>🔮</span>
              <span>🌱</span>
              <span>🌸</span>
              <span>🌿</span>
              <span>🌻</span>
              <span>🌾</span>
            </div>
            <div className="current-sign-block">
              <span className="current-sign-label">CURRENT SIGN</span>
              <div className="current-sign-name">Anbessa</div>
              <div className="current-sign-amharic">አንበሳ</div>
              <div className="current-sign-tag">FIRE · LION</div>
            </div>
          </div>

          <Link href="/case/spiritual/intake" passHref>
            <HudButton variant="primary" size="lg">
              OPEN ASTRO ENGINE
            </HudButton>
          </Link>
        </div>

        <div className="dashboard-visual">
          <ZodiacWheel activeSign="anbessa" size={380} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* NUMEROLOGY DASHBOARD                                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="dashboard-shell dashboard-shell--numerology">
        <div className="dashboard-visual dashboard-visual--order-first">
          <NumerologyGrid />
        </div>

        <div className="dashboard-copy">
          <div className="eyebrow eyebrow--cyan">
            <Hash size={14} />
            NUMEROLOGY ENGINE
          </div>
          <h2 className="dashboard-title">YOUR NAME HOLDS THE KEY.</h2>
          <p className="dashboard-description">
            Ancient Ge'ez gematria converts each letter into a numerical vibration.
            The Halehame system divides by 12 to reveal your Life Path, Destiny, and
            Soul Urge — the foundation of every reading.
          </p>

          <div className="dashboard-stats-row">
            <div className="dash-stat">
              <div className="dash-stat-value">26</div>
              <div className="dash-stat-label">Ge'ez Letters</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value">12</div>
              <div className="dash-stat-label">Life Paths</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value">2</div>
              <div className="dash-stat-label">Systems</div>
            </div>
          </div>

          <div className="gematria-panel">
            <div className="gematria-header">
              <span className="gematria-title">LIVE GEMATRIA ENGINE</span>
              <span className="gematria-name">Dawit</span>
              <span className="gematria-name-alt">ዳዊት</span>
            </div>
            <div className="gematria-letters">
              <div><span>ዳ</span><strong>= 100</strong></div>
              <div><span>ዊ</span><strong>= 60</strong></div>
              <div><span>ት</span><strong>= 10</strong></div>
            </div>
            <div className="gematria-total-row">
              <span>TOTAL SUM</span>
              <strong>170</strong>
            </div>
            <div className="gematria-total-row gematria-total-row--accent">
              <span>FINAL NUMBER</span>
              <strong>2</strong>
            </div>
            <div className="gematria-paths">
              <span>Life Path <strong>2</strong></span>
              <span>Destiny <strong>6</strong></span>
              <span>Soul Urge <strong>9</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* LIVE INTERACTIVE GEMATRIA CALCULATOR WIDGET                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="my-10" aria-label="Interactive Ge'ez Gematria Calculator">
        <LiveGematriaWidget />
      </section>

      <section className="mb-10" aria-label="Awde Negest manuscript library preview">
        <div className="rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950/20 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.4)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">
                <Sparkles size={12} />
                Manuscript library
              </div>
              <h3 className="text-2xl font-bold text-white md:text-3xl">Read the original Awde Negest manuscript</h3>
              <p className="mt-3 max-w-xl text-sm text-stone-300 md:text-base">
                Explore the Archive.org facsimile alongside the app&apos;s structured circle system, divination categories,
                and live reading workflow.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="overflow-hidden rounded-2xl border border-stone-700 bg-stone-950 p-2">
                <img
                  src="https://archive.org/services/img/awede-negest"
                  alt="Awde Negest manuscript preview"
                  className="h-20 w-20 rounded-xl object-cover"
                />
              </div>
              <Link
                href="/library/awde-negast"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:brightness-110"
              >
                Open library
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* AWDE NEGEST DASHBOARD                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="dashboard-shell dashboard-shell--awde">
        <div className="dashboard-copy">
          <div className="eyebrow eyebrow--amber">
            <CircleDot size={14} />
            AWDE NEGEST ENGINE
          </div>
          <h2 className="dashboard-title">16 CIRCLES. 256 SEGMENTS.</h2>
          <p className="dashboard-description">
            The Royal Circle of the King — Ethiopia's ancient divination manuscript.
            Each name unlocks a path through 16 celestial lakes, revealing personalized
            predictions, cautions, and remedies.
          </p>

          <div className="dashboard-stats-row">
            <div className="dash-stat">
              <div className="dash-stat-value">16</div>
              <div className="dash-stat-label">Circles</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value">256</div>
              <div className="dash-stat-label">Segments</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value">60</div>
              <div className="dash-stat-label">Categories</div>
            </div>
          </div>

          <div className="awde-quickframe">
            <div className="awde-mini-label">Service</div>
            <div className="awde-mini-sequence">123456789101112131415166</div>
            <div className="awde-mini-name">ሰብአ</div>
          </div>

          <Link href="/case/spiritual/intake" passHref>
            <HudButton variant="primary" size="lg">
              OPEN AWDE ENGINE
            </HudButton>
          </Link>
        </div>

        <div className="dashboard-visual">
          <AwdeNegestRings highlightCircle={15} size={380} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FINANCE DASHBOARD                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="dashboard-shell dashboard-shell--finance">
        <div className="dashboard-copy">
          <div className="eyebrow eyebrow--emerald">
            <TrendingUp size={14} />
            BUSINESS TIMING ENGINE
          </div>
          <h2 className="dashboard-title">TIME YOUR MOVE WITH THE STARS.</h2>
          <p className="dashboard-description">
            Auspicious days for launches, negotiations, and expansion — aligned with
            traditional Ethiopian weekday wisdom and your personal business gematria.
            Regional market pulse keeps you informed.
          </p>

          <div className="dashboard-stats-row">
            <div className="dash-stat">
              <div className="dash-stat-value">3</div>
              <div className="dash-stat-label">Key Days</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value">4</div>
              <div className="dash-stat-label">Metrics</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value">5</div>
              <div className="dash-stat-label">Regions</div>
            </div>
          </div>

          <div className="finance-panel">
            <div className="finance-panel-header">AUSPICIOUS BUSINESS DAYS</div>
            <div className="finance-days">
              <div className="finance-day-card">
                <span className="finance-icon">🚀</span>
                <div>
                  <strong>Thu</strong>
                  <small>Jun 19</small>
                  <em>Launch / Sign</em>
                </div>
                <b>94</b>
              </div>
              <div className="finance-day-card">
                <span className="finance-icon">🤝</span>
                <div>
                  <strong>Wed</strong>
                  <small>Jun 25</small>
                  <em>Negotiate</em>
                </div>
                <b>84</b>
              </div>
              <div className="finance-day-card">
                <span className="finance-icon">📈</span>
                <div>
                  <strong>Thu</strong>
                  <small>Jul 3</small>
                  <em>Expand</em>
                </div>
                <b>92</b>
              </div>
            </div>
            <div className="finance-readiness">
              <div><span>Success Potential</span><strong>78%</strong></div>
              <div><span>Elemental Match</span><strong>88%</strong></div>
              <div><span>Timing Alignment</span><strong>82%</strong></div>
              <div><span>Numeric Resonance</span><strong>71%</strong></div>
            </div>
          </div>

          <Link href="/case/career/intake" passHref>
            <HudButton variant="primary" size="lg">
              OPEN FINANCE ENGINE
            </HudButton>
          </Link>
        </div>

        <div className="dashboard-visual">
          <FinanceFlow />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURE GRID                                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="feature-grid-shell">
        {FEATURE_ITEMS.map((feature) => (
          <GlowCard key={feature.title} hover="lift" className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </GlowCard>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* LIVE DATA PREVIEW                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="preview-shell">
        <HudPanel title="LIVE DATA PREVIEW" status="online" className="preview-panel">
          <div className="preview-grid">
            <div className="preview-visual">
              <div className="preview-ring-wrap">
                <div className="hud-ring hud-ring--radar preview-ring" />
              </div>
              <NutritionRadar data={[72, 84, 91, 68, 76, 88]} />
            </div>

            <div className="ticker-stack">
              <div className="ticker-header">
                <StatusPill status="online" label="LIVE" />
                <span>Regional nutrient index</span>
              </div>
              <ul className="ticker-list">
                {[
                  "Iron • Addis Ababa 84%",
                  "Calcium • Oromia 77%",
                  "Vitamin A • Tigray 90%",
                  "Zinc • Amhara 71%",
                  "Folate • SNNP 82%",
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </HudPanel>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BOTANICALS DASHBOARD                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="mb-10 rounded-[28px] border border-emerald-500/20 bg-stone-950/70 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300">
              <Leaf size={12} />
              Ethiopian botanical intelligence
            </div>
            <h3 className="text-2xl font-black text-white md:text-3xl">
              Medicinal plant atlas
            </h3>
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-400">
            <span className="inline-flex items-center gap-2 rounded-full border border-stone-700 px-3 py-1">
              <MapPin size={12} className="text-emerald-300" />
              <span>{ETHIOPIAN_MEDICINAL_PLANTS.length} records</span>
            </span>
            <Link href="/library/medicinal-plants" className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/50 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10">
              Browse atlas
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {ETHIOPIAN_MEDICINAL_PLANTS.slice(0, 4).map((plant) => (
              <div key={plant.id} className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-300">{plant.growthForm}</div>
                    <div className="mt-2 text-sm font-bold text-white">{plant.vernacularName}</div>
                    <div className="text-[11px] italic text-stone-500">{plant.scientificName}</div>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">
                    <Leaf size={14} />
                  </span>
                </div>
                <div className="mt-3 text-[11px] leading-relaxed text-stone-400">
                  {plant.traditionalUse}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[24px] border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-stone-950 p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">Clinical signals</span>
              <span className="rounded-full border border-emerald-500/50 px-2 py-1 text-[10px] text-emerald-200">ETM-DB linked</span>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm text-stone-400">
                  <span>Habitat diversity</span>
                  <span className="font-bold text-emerald-300">{new Set(ETHIOPIAN_MEDICINAL_PLANTS.map((plant) => plant.habitat)).size}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-stone-800">
                  <div className="h-2 w-[88%] rounded-full bg-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-stone-400">
                  <span>Careful therapeutic mapping</span>
                  <span className="font-bold text-amber-300">{ETHIOPIAN_MEDICINAL_PLANTS.length}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-stone-800">
                  <div className="h-2 w-[76%] rounded-full bg-amber-400" />
                </div>
              </div>
              <div className="rounded-2xl border border-stone-700 bg-stone-950/50 p-4">
                <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-stone-400">Priority therapeutic areas</div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(ETHIOPIAN_MEDICINAL_PLANTS.flatMap((plant) => plant.diseasesTreated))).slice(0, 8).map((topic) => (
                    <span key={topic} className="rounded-full border border-stone-700 px-2 py-1 text-[10px] text-stone-300">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* COMMUNITY TESTIMONIALS                                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="my-12" aria-label="Community Testimonials">
        <TestimonialCarousel />
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FINAL CTA                                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="cta-shell">
        <div className="cta-glow" />
        <div className="cta-inner">
          <div className="hud-ring hud-ring--orbital cta-ring" />
          <div className="cta-copy">
            <h2 className="cta-title">YOUR PATH AWAITS.</h2>
            <p className="cta-subtitle">
              Five domains. Eleven knowledge strands. Verified experts.
            </p>
          </div>
          <Link href="/auth?mode=login" passHref>
            <HudButton variant="primary" size="lg">
              ENTER THE CONSOLE
            </HudButton>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TERMINAL FOOTER BAR                                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer className="terminal-footer">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SYSTEM ONLINE · v3.0 · UPTIME 99.98%</span>
        </div>
        <div className="terminal-links flex items-center gap-4">
          <Link href="/discover" className="hover:text-amber-400 transition-colors">&gt; about</Link>
          <Link href="/safety" className="hover:text-amber-400 transition-colors">&gt; safety</Link>
          <Link href="/foods" className="hover:text-amber-400 transition-colors">&gt; foods</Link>
          <Link href="/atlas" className="hover:text-amber-400 transition-colors">&gt; atlas</Link>
          <Link href="/emergency" className="hover:text-rose-400 transition-colors">&gt; emergency</Link>
        </div>
      </footer>
    </div>
  );
}