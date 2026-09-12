"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, ShieldCheck } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  amharicName: string;
  city: string;
  domain: string;
  rating: number;
  quote: string;
  role: string;
  avatarBg: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Tigist Mulugeta",
    amharicName: "ትዕግሥት ሙሉጌታ",
    city: "Addis Ababa",
    domain: "Spiritual & Life Direction",
    rating: 5,
    quote:
      "The Awde Negest 16 circles and baptismal patron reading gave our family profound clarity during our major transition. Grounded, authentic, and reverent.",
    role: "Family Enterprise Founder",
    avatarBg: "from-amber-600 to-yellow-500",
  },
  {
    id: "2",
    name: "Dr. Elias Girma",
    amharicName: "ዶ/ር ኤልያስ ግርማ",
    city: "Gondar",
    domain: "Clinical health & Nutrition",
    rating: 5,
    quote:
      "The Herb-Drug interaction gate is a masterclass in safety. As a physician, having altitude-calibrated iron targets and traditional medicine contraindications in one screen is extraordinary.",
    role: "Integrative health Practitioner",
    avatarBg: "from-cyan-600 to-blue-500",
  },
  {
    id: "3",
    name: "Chaltu Tolessa",
    amharicName: "ጫልቱ ቶለሳ",
    city: "Jimma",
    domain: "Career & Business Timing",
    rating: 5,
    quote:
      "We timed our coffee exporter licensing around the auspicious astrological and Ge'ez numeric window. The guidance was specific, actionable, and culturally rooted.",
    role: "Specialty Agritech Co-op Lead",
    avatarBg: "from-emerald-600 to-teal-500",
  },
  {
    id: "4",
    name: "Yohannes Tesfaye",
    amharicName: "ዮሐንስ ተስፋዬ",
    city: "Hawassa",
    domain: "Elder Shimglina & Mediation",
    rating: 5,
    quote:
      "The elder council mediation workflow bridged ancient Shimglina consensus protocols with modern legal structure, restoring peace to our family estate.",
    role: "Community Elder & Arbiter",
    avatarBg: "from-purple-600 to-indigo-500",
  },
  {
    id: "5",
    name: "Bethlehem Assefa",
    amharicName: "ቤተልሔም አሰፋ",
    city: "Dire Dawa",
    domain: "Relationships & Compatibility",
    rating: 5,
    quote:
      "The multi-system compatibility matrix went far deeper than standard horoscopes. It uncovered our complementary humoral elements and communication rhythms.",
    role: "Educator & Counselor",
    avatarBg: "from-pink-600 to-rose-500",
  },
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    if (!isPaused) {
      timeoutRef.current = setTimeout(nextSlide, 6000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, isPaused]);

  const current = TESTIMONIALS[currentIndex];

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-stone-900/60 via-stone-950/80 to-black p-8 md:p-12 backdrop-blur-xl shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Verified Community Testimonials"
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono font-medium text-amber-300">
            <ShieldCheck size={14} className="text-emerald-400" />
            VERIFIED EXPERT &amp; CLIENT EXPERIENCES
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Trusted Across 48 Ethiopian Districts
          </h2>
          <p className="text-sm text-stone-400">
            Real feedback from individuals, physicians, elders, and entrepreneurs guided by the platform.
          </p>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-stone-300 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            {TESTIMONIALS.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? "w-6 bg-amber-400" : "w-2 bg-stone-700 hover:bg-stone-500"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-stone-300 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Testimonial Active Slide */}
      <div className="relative min-h-[220px] rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md transition-all duration-300">
        <Quote size={40} className="absolute right-6 top-6 text-white/5 pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Avatar / Monogram */}
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${current.avatarBg} text-xl font-black text-white shadow-lg`}
          >
            {current.name.charAt(0)}
          </div>

          <div className="flex-1 space-y-3">
            {/* Rating & Domain */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex text-amber-400">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-stone-300">
                {current.domain}
              </span>
              <span className="text-xs text-stone-500 font-mono">📍 {current.city}</span>
            </div>

            {/* Quote */}
            <blockquote className="text-base md:text-lg font-medium text-stone-100 leading-relaxed italic">
              &ldquo;{current.quote}&rdquo;
            </blockquote>

            {/* Author details */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div>
                <strong className="text-sm font-bold text-white">{current.name}</strong>
                <span className="text-xs text-amber-400/80 font-mono ml-2">({current.amharicName})</span>
              </div>
              <div className="text-xs text-stone-400">{current.role}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
