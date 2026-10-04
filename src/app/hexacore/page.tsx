"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import Image from "next/image";
import HexacoreOrrery from "@/components/cultural/HexacoreOrrery";
import { PathwayPractitioners } from "@/features/cases/PathwayPractitioners";
import HexacoreCheckoutModal from "@/features/hexacore/HexacoreCheckoutModal";
import HexacoreCameraScanner from "@/features/hexacore/HexacoreCameraScanner";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Eye,
  Shield,
  Lock,
  Sparkles,
  Leaf,
  RefreshCw,
  Star,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { HEXACORE_DEFAULT_PRODUCTS } from "@/lib/db/schema/hexacore";
import type { HexacoreDossierReport } from "@/lib/hexacore/HexacoreDossierService";

const CORE_REMEDY_PREVIEWS = [
  { core: "Power", coreAm: "ኃይል", herb: "Damakesse", herbAm: "ደማከሴ", hz: 741, color: "#FF6347" },
  { core: "Humanity", coreAm: "ሰውነት", herb: "Tena Adam", herbAm: "ጤና አዳም", hz: 396, color: "#4169E1" },
  { core: "Creation", coreAm: "ፍጥረት", herb: "Korarima", herbAm: "ቆራሪማ", hz: 528, color: "#32CD32" },
  { core: "Peace", coreAm: "ዕርቅ", herb: "Tosign", herbAm: "ቶሲኝ", hz: 432, color: "#DAA520" },
  { core: "Spirit", coreAm: "መንፈስ", herb: "Itan", herbAm: "ጤና ሸዊ", hz: 963, color: "#9370DB" },
  { core: "Order", coreAm: "ሥርዓት", herb: "Kosso", herbAm: "ቆሶ", hz: 852, color: "#00CED1" },
];
const KNOWLEDGE_DIRECTORIES = [
  {
    strand: "Cultural memory",
    image: "/images/evidence/strand-cultural.svg",
    alt: "Illustration representing Ethiopian cultural and coffee ceremony traditions",
    description: "Community context, living heritage, ritual memory, and the traditions in which symbolic readings are interpreted.",
    directories: [
      { label: "Heritage atlas", href: "/heritage" },
      { label: "Cultural knowledge", href: "/cultural" },
      { label: "Sacred library", href: "/library" },
    ],
  },
  {
    strand: "Calendar & cycles",
    image: "/images/evidence/strand-astrological.svg",
    alt: "Illustration representing a traditional star chart",
    description: "Calendar systems, seasonal cycles, and astrological traditions presented as cultural frameworks for reflection.",
    directories: [
      { label: "Awde Negast", href: "/awde-negast" },
      { label: "Fasting & lunar rhythm", href: "/fasting" },
    ],
  },
  {
    strand: "Reflective psychology",
    image: "/images/evidence/strand-psychological.svg",
    alt: "Illustration representing reflection and emotional wellbeing",
    description: "Self-inquiry, personal meaning, and emotional context; not a psychological assessment or mental-health diagnosis.",
    directories: [
      { label: "Spiritual reflection pathway", href: "/case/workflows/new/spiritual" },
      { label: "Somatic awareness", href: "/somatics" },
    ],
  },
  {
    strand: "Body symbolism",
    image: "/images/evidence/strand-biological.svg",
    alt: "Illustration representing human biology and body systems",
    description: "Observable body features are separated from symbolic interpretation; these references do not assess health or diagnose conditions.",
    directories: [
      { label: "Tongue reading", href: "/body-reading/tongue" },
      { label: "Palm reading", href: "/body-reading/palm" },
      { label: "Face reading", href: "/body-reading/face" },
    ],
  },
  {
    strand: "Ecology & herbal heritage",
    image: "/images/evidence/strand-ecological.svg",
    alt: "Illustration representing Ethiopian highland ecology",
    description: "Plant habitats and ethnobotanical records as cultural and historical references, distinct from treatment advice.",
    directories: [
      { label: "Ecology & plant habitats", href: "/ecology" },
      { label: "Medicinal plant atlas", href: "/library/medicinal-plants" },
      { label: "Herb & medicine safety", href: "/safety" },
    ],
  },
] as const;

export default function HexacorePage() {
  const [checkoutProduct, setCheckoutProduct] = useState<(typeof HEXACORE_DEFAULT_PRODUCTS)[0] | null>(null);
  const [unlockedDossier, setUnlockedDossier] = useState<HexacoreDossierReport | null>(null);
  const [purchaseRef, setPurchaseRef] = useState<string | null>(null);

  const products = HEXACORE_DEFAULT_PRODUCTS;

  return (
    <main className="app-container py-10 space-y-12">
      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-300">
            Domain B · Traditional Wisdom & Arcana
          </span>
          <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-[11px] font-medium text-amber-200">
            Enhanced Edition · 14 Layers
          </span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[11px] font-medium text-emerald-200">
            Commercial Apothecary ✓
          </span>
        </div>

        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          The Hexacore Arcana
        </h1>
        <p className="max-w-3xl text-sm md:text-base leading-relaxed text-slate-300">
          A deeply nested, fractal traditional wisdom framework integrating 14 layers, 2,016 frequencies, 12,096 correspondences,
          6-based numerology, subtle anatomy, Ethiopian herbal botany, and creation-day relational cycles.
        </p>

        {/* System Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { value: "14", label: "Nested Layers", color: "text-amber-300" },
            { value: "2,016", label: "Frequencies", color: "text-indigo-300" },
            { value: "12,096", label: "Correspondences", color: "text-emerald-300" },
            { value: "46,656", label: "Unique States", color: "text-purple-300" },
          ].map(({ value, label, color }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <span className={`text-2xl md:text-3xl font-black ${color} block`}>{value}</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{label}</span>
            </div>
          ))}
        </div>

        {/* Domain B Safety Notice */}
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-4 text-xs md:text-sm leading-relaxed text-amber-100/90 flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-amber-200">Ethical & Reflective Boundary:</strong> This experience is dedicated exclusively to cultural reflection, self-inquiry, and traditional heritage exploration. Body sign reflections are observational symbols, not medical diagnoses. Solfeggio tones and herbal correspondences are botanical/historical references, not medical treatments. Divination and herbal modules are age-gated (18+).
          </div>
        </div>
      </header>

      {/* ── Grand Orrery (Free Preview Layers 1-3) ───────────────────────── */}
      <section id="hexacore-orrery" aria-label="Interactive Hexacore Arcana">
        <HexacoreOrrery />
      </section>

      {/* ── Somatic Vision Scanner (Live Camera Tongue & Palm Analysis) ────── */}
      <section id="somatic-scanner" aria-labelledby="somatic-heading" className="space-y-6">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
            <Sparkles className="h-4 w-4" />
            <span>Awde Negast Somatic Reading · የሰውነት ምልክት ቅኝት</span>
          </div>
          <h2 id="somatic-heading" className="text-3xl font-black text-white sm:text-4xl">
            Live Camera Tongue & Palm Biometric Scanner
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Directly use your device camera or upload a photo to inspect your tongue or palm. Our augmented vision engine computes chromatic balances, draws vector lines & anatomical zones directly on your image, and provides detailed Ethiopian herbal calibrations.
          </p>
        </header>

        <HexacoreCameraScanner />
      </section>

      {/* ── Commercial Pricing Grid ──────────────────────────────────────── */}
      <section id="hexacore-pricing" aria-labelledby="pricing-heading">
        <header className="mb-8 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
            Choose Your Reading
          </span>
          <h2 id="pricing-heading" className="mt-2 text-3xl font-black text-white">
            Unlock the Full 14-Layer Arcana
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Begin with the free celestial preview or purchase your complete Natal Dossier — a personalized, printable Ethiopian wisdom blueprint.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => {
            const isFree = product.tier === "free";
            const isPopular = product.badgeEn === "Most Popular";
            const priceEtb = parseFloat(String(product.priceEtb));
            const priceUsd = parseFloat(String(product.priceUsd));

            return (
              <div
                key={product.code}
                id={`hexacore-product-${product.code}`}
                className="relative rounded-3xl border flex flex-col transition-all duration-300 hover:scale-[1.02]"
                style={{
                  borderColor: isPopular ? "rgba(212,175,55,0.6)" : "rgba(255,255,255,0.1)",
                  background: isPopular
                    ? "radial-gradient(circle at top, rgba(212,175,55,0.1), transparent 60%), rgba(13,19,34,0.95)"
                    : "rgba(255,255,255,0.02)",
                  boxShadow: isPopular ? "0 0 40px rgba(212,175,55,0.15)" : "none",
                }}
              >
                {/* Badge */}
                {product.badgeEn && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border"
                      style={
                        isPopular
                          ? { background: "#D4AF37", color: "#000", borderColor: "#D4AF37" }
                          : { background: "rgba(255,255,255,0.05)", color: "#94A3B8", borderColor: "rgba(255,255,255,0.15)" }
                      }
                    >
                      {product.badgeEn}
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="font-black text-white text-base leading-tight">{product.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">{product.nameAm}</p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{product.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    {isFree ? (
                      <span className="text-3xl font-black text-emerald-400">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-black text-amber-300">{priceEtb.toFixed(0)} ETB</span>
                        <span className="text-sm text-slate-500 ml-2">(${priceUsd.toFixed(2)})</span>
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 flex-1 mb-6">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2
                          className="h-3.5 w-3.5 shrink-0 mt-0.5"
                          style={{ color: f.highlight ? "#D4AF37" : "#10B981" }}
                        />
                        <span
                          className="text-xs leading-relaxed"
                          style={{ color: f.highlight ? "#FFFFFF" : "#94A3B8", fontWeight: f.highlight ? 600 : 400 }}
                        >
                          {f.textEn}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    id={`hx-cta-${product.code}`}
                    onClick={() => setCheckoutProduct(product)}
                    className="w-full rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2"
                    style={
                      isPopular
                        ? { background: "linear-gradient(135deg, #D4AF37, #10B981)", color: "#000" }
                        : isFree
                        ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#FFFFFF" }
                        : { background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.35)", color: "#D4AF37" }
                    }
                  >
                    {isFree ? (
                      <><Zap className="h-4 w-4" /> Explore Free</>
                    ) : product.tier === "subscription" ? (
                      <><RefreshCw className="h-4 w-4" /> Start Membership</>
                    ) : product.tier === "session" ? (
                      <><BookOpen className="h-4 w-4" /> Book Session</>
                    ) : (
                      <><Lock className="h-4 w-4" /> Unlock Dossier</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Paywall Teaser: Layers 4-14 ──────────────────────────────────── */}
      <section
        id="hexacore-deep-layers"
        className="rounded-3xl border border-white/10 overflow-hidden relative"
        style={{
          background: "radial-gradient(circle at 30% 50%, rgba(147,112,219,0.08), transparent 60%), rgba(13,19,34,0.8)",
        }}
      >
        {/* Blurred Teaser Content */}
        <div style={{ filter: "blur(3px)", pointerEvents: "none", userSelect: "none" }} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {["Layer 4: Archetypes", "Layer 7: Correspondences", "Layer 11: Initiation Gates", "Layer 12: Cosmology", "Layer 13: Creation Day Cycles", "Layer 14: Cross-System Traditions"].map((l) => (
              <div key={l} className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3">
                <span className="text-xs font-semibold text-amber-300">{l}</span>
                <div className="h-2 bg-white/10 rounded mt-2" />
                <div className="h-2 bg-white/10 rounded mt-1 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Paywall Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(13,19,34,0.92) 30%)" }}>
          <Lock className="h-10 w-10 text-amber-400 mb-3" />
          <h3 className="text-xl font-black text-white mb-2">Layers 4–14 Are Locked</h3>
          <p className="text-sm text-slate-400 max-w-sm mb-5">
            Archetypes, Initiation Trials, Cosmological Realms, Cross-System Wisdom Bridges (TCM, Ayurveda, Unani), and your personal botanical formulations are included in the Full Natal Dossier.
          </p>
          <button
            id="hx-paywall-unlock"
            onClick={() => setCheckoutProduct(products[1])}
            className="rounded-2xl px-6 py-3 text-sm font-black text-black flex items-center gap-2 transition hover:scale-105"
            style={{ background: "linear-gradient(135deg, #D4AF37, #10B981)" }}
          >
            <Sparkles className="h-4 w-4" />
            Unlock Complete 14-Layer Dossier — 450 ETB
          </button>
        </div>
      </section>

      {/* ── Botanical Apothecary Cross-Sell ──────────────────────────────── */}
      <section id="hexacore-apothecary" aria-labelledby="apothecary-heading">
        <header className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-400">
            Certified Botanical Apothecary
          </span>
          <h2 id="apothecary-heading" className="mt-1 text-2xl font-black text-white">
            6-Core Herbal Correspondences
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Each Hexacore reading includes certified botanical formulation recommendations from verified Ethiopian traditional healers.
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {CORE_REMEDY_PREVIEWS.map((r) => (
            <div
              key={r.core}
              className="rounded-2xl border p-4 transition hover:scale-[1.02]"
              style={{
                borderColor: `${r.color}30`,
                background: `${r.color}08`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-4 w-4" style={{ color: r.color }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: r.color }}>
                  {r.core}
                </span>
              </div>
              <div className="text-sm font-bold text-white">{r.herb}</div>
              <div className="text-xs text-slate-500 font-medium">{r.herbAm}</div>
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500" />
                {r.hz} Hz Solfeggio Pair
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-500 text-center">
          Full botanical formulations, dosages, safety notes, and certified vendors are unlocked with your Natal Dossier.
        </p>
      </section>

      {/* ── Practitioner Toolkit ─────────────────────────────────────────── */}
      <section aria-labelledby="hexacore-strands" className="space-y-5">
        <header className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-300">Knowledge directories</p>
          <h2 id="hexacore-strands" className="mt-2 text-2xl font-bold text-white">Explore the connected strands</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Open the source directories behind the Hexacore’s cultural, cyclical, reflective, body-symbolic, and ecological lenses. Images are illustrative; symbolic traditions are not scientific or clinical evidence.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {KNOWLEDGE_DIRECTORIES.map((entry) => (
            <article key={entry.strand} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
              <div className="relative aspect-[16/7] border-b border-white/10 bg-slate-900">
                <Image
                  src={entry.image}
                  alt={entry.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white">{entry.strand}</h3>
                <p className="mt-2 min-h-16 text-sm leading-relaxed text-slate-300">{entry.description}</p>
                <nav aria-label={`${entry.strand} directories`} className="mt-4 flex flex-wrap gap-2">
                  {entry.directories.map((directory) => (
                    <Link
                      key={directory.href}
                      href={directory.href}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                    >
                      {directory.label}
                      <ArrowRight className="size-3" aria-hidden="true" />
                    </Link>
                  ))}
                </nav>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="hexacore-practitioner" className="space-y-4">
        <header className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-violet-300">Practitioner Toolkit</p>
          <h2 id="hexacore-practitioner" className="mt-2 text-2xl font-bold text-white">
            A reflective reading, from map to meaning
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Explore the six cores, use body-sign guides as cultural reflection, or take a question into a structured spiritual pathway.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="#hexacore-orrery"
            className="group rounded-3xl border border-indigo-400/20 bg-indigo-500/[0.06] p-5 transition hover:border-indigo-300/40 hover:bg-indigo-500/[0.1]"
          >
            <Compass className="size-6 text-indigo-300" />
            <h3 className="mt-4 font-bold text-white">Map the six cores</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Explore the interactive orrery, archetypes, correspondences, and profile reflections.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-200">
              Explore the orrery <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/body-reading/tongue"
            className="group rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.06] p-5 transition hover:border-emerald-300/40 hover:bg-emerald-500/[0.1]"
          >
            <Eye className="size-6 text-emerald-300" />
            <h3 className="mt-4 font-bold text-white">Explore body-sign guides</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Browse tongue, palm, and face references as cultural and educational reflection, not diagnosis.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
              Open the reading guides <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/case/workflows/new/spiritual"
            className="group rounded-3xl border border-amber-400/20 bg-amber-500/[0.06] p-5 transition hover:border-amber-300/40 hover:bg-amber-500/[0.1]"
          >
            <BookOpen className="size-6 text-amber-300" />
            <h3 className="mt-4 font-bold text-white">Follow a guided reflection</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Bring a question to the Spiritual & Life Direction pathway and shape next steps around your context.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-200">
              Start the pathway <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {/* ── Practitioner Booking ─────────────────────────────────────────── */}
      <section aria-labelledby="hexacore-practice" className="grid gap-4 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 id="hexacore-practice" className="text-xl font-bold text-white">Reflect on it with a debtera</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            The arcana is a map for reflection. Explore your name and season in depth with the Spiritual & Life Direction pathway, or book a debtera who offers personal readings.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/case/workflows/new/spiritual" className="btn-pill-primary">Start the reading pathway</Link>
            <Link href="/safety" className="btn-pill-secondary">Check plants against medicines</Link>
          </div>
        </div>
        <Suspense fallback={<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 animate-pulse h-40" />}>
          <PathwayPractitioners domain="spiritual" />
        </Suspense>
      </section>

      {/* ── Checkout Modal ───────────────────────────────────────────────── */}
      {checkoutProduct && (
        <HexacoreCheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
          onUnlocked={(dossier, ref) => {
            setUnlockedDossier(dossier);
            setPurchaseRef(ref);
            setCheckoutProduct(null);
          }}
        />
      )}

      {/* ── Success Banner (post-unlock) ─────────────────────────────────── */}
      {unlockedDossier && purchaseRef && (
        <div
          id="hexacore-unlock-success"
          className="fixed bottom-6 right-6 z-40 rounded-2xl border p-4 shadow-2xl max-w-xs"
          style={{
            background: "rgba(13,19,34,0.98)",
            borderColor: "rgba(212,175,55,0.5)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">Dossier Unlocked!</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {unlockedDossier.dominantCore} Core · #{unlockedDossier.coreNumber}
              </div>
              <div className="mt-2 flex gap-2">
                <a
                  href={`/api/hexacore/commercial/export-pdf/${purchaseRef}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-amber-300 hover:underline"
                >
                  Open Dossier →
                </a>
                <button
                  onClick={() => { setUnlockedDossier(null); setPurchaseRef(null); }}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
