"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Eye, BookOpen, ShieldCheck, Maximize2, Scroll } from "lucide-react";
import type { TelsemSeal } from "@/lib/cultural/telsemData";

interface TelsemSacredSealProps {
  seal: TelsemSeal;
  showDetails?: boolean;
  interactive?: boolean;
  className?: string;
  defaultView?: "plate" | "vector";
  size?: "sm" | "md" | "lg" | "xl";
}

export function TelsemSacredSeal({
  seal,
  showDetails = true,
  interactive = true,
  className = "",
  defaultView,
  size = "md",
}: TelsemSacredSealProps) {
  const [viewMode, setViewMode] = useState<"plate" | "vector">(
    defaultView || (seal.sourceImage ? "plate" : "vector")
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<"meaning" | "prayer" | "materials">("meaning");

  const sizeClasses = {
    sm: "w-48 h-48",
    md: "w-64 h-64 sm:w-72 sm:h-72",
    lg: "w-80 h-80 sm:w-96 sm:h-96",
    xl: "w-full max-w-lg aspect-square",
  }[size];

  return (
    <div
      className={`rounded-3xl border border-amber-500/30 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/20 p-5 shadow-2xl relative overflow-hidden backdrop-blur-md ${className}`}
    >
      {/* Decorative Traditional Ethiopian Corner Hareg Motif */}
      <div className="absolute top-2 left-2 text-amber-500/20 text-xs font-mono select-none pointer-events-none">
        ❖ ═══
      </div>
      <div className="absolute top-2 right-2 text-amber-500/20 text-xs font-mono select-none pointer-events-none">
        ═══ ❖
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-300">
              {seal.categoryLabelAm} • {seal.categoryLabelEn}
            </span>
            {seal.sourcePage && (
              <span className="text-[10px] text-stone-400 font-mono">
                ገጽ {seal.sourcePage}
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-100 mt-1">
            {seal.nameAm}
          </h3>
          <p className="text-xs text-stone-400 italic">{seal.nameEn}</p>
        </div>

        {/* View Toggle */}
        {interactive && seal.sourceImage && (
          <div className="flex items-center rounded-xl bg-stone-950 border border-stone-800 p-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("plate")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === "plate"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              ብራና (Plate)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("vector")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === "vector"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              ኅልቆት (Vector)
            </button>
          </div>
        )}
      </div>

      {/* Seal Artwork Container */}
      <div className="flex flex-col items-center justify-center my-4">
        <div
          className={`relative ${sizeClasses} rounded-2xl border border-amber-500/40 bg-stone-950/90 shadow-[inset_0_0_40px_rgba(217,119,6,0.15)] flex items-center justify-center overflow-hidden p-4 group`}
        >
          {/* Subtle parchment grain simulation overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/40 pointer-events-none z-10" />

          {viewMode === "plate" && seal.sourceImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={seal.sourceImage}
                alt={seal.nameAm}
                className="max-w-full max-h-full object-contain filter contrast-125 sepia-[0.35] brightness-90 transition-transform duration-500 group-hover:scale-105"
              />
              {interactive && (
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 border border-stone-700 text-stone-300 hover:text-amber-300 opacity-80 group-hover:opacity-100 transition-opacity z-20"
                  title="View full plate"
                >
                  <Maximize2 size={16} />
                </button>
              )}
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <VectorTelsemGeometry type={seal.vectorGeometryType} />
            </div>
          )}
        </div>
      </div>

      {/* Interactive Tabs */}
      {showDetails && interactive && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-1 border-b border-stone-800 pb-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("meaning")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === "meaning"
                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              ምሥጢር (Symbolism)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("prayer")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === "prayer"
                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              የጸሎት ቃል (Formula)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("materials")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === "materials"
                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              ገቢር (Practice)
            </button>
          </div>

          {activeTab === "meaning" && (
            <div className="space-y-2 text-xs text-stone-300 animate-fadeIn">
              <p className="leading-relaxed">{seal.spiritualMeaning}</p>
              <div className="p-2.5 rounded-xl bg-black/40 border border-stone-800 text-[11px] text-amber-200/90 font-mono">
                <span className="font-bold text-amber-400 block mb-1">ቅርጸ ጠልሰም (Sacred Geometry):</span>
                {seal.sacredGeometryDescription}
              </div>
            </div>
          )}

          {activeTab === "prayer" && (
            <div className="space-y-2 text-xs animate-fadeIn">
              <div className="p-3 rounded-xl bg-stone-950/80 border border-amber-500/20 text-amber-200 font-serif leading-loose">
                {seal.traditionalFormulaGe}
              </div>
              <p className="text-[11px] text-stone-400 italic">
                Translation: &ldquo;{seal.traditionalFormulaEn}&rdquo;
              </p>
            </div>
          )}

          {activeTab === "materials" && (
            <div className="space-y-2 text-xs animate-fadeIn">
              <span className="text-stone-400 font-bold block">ባህላዊ ቁሳቁሶች (Traditional Inks & Botanical Elements):</span>
              <div className="flex flex-wrap gap-1.5">
                {seal.ritualMaterials.map((mat, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 text-[11px]"
                  >
                    ✦ {mat}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-stone-500 mt-2">
                ምንጭ: {seal.sourceManuscript}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {isZoomed && seal.sourceImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-auto rounded-2xl border border-amber-500/40 p-2 bg-stone-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={seal.sourceImage}
              alt={seal.nameAm}
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
          <div className="mt-4 text-center">
            <h4 className="text-lg font-bold text-amber-200 font-serif">{seal.nameAm}</h4>
            <p className="text-xs text-stone-400 font-mono">
              {seal.sourceManuscript} {seal.sourcePage ? `• ገጽ ${seal.sourcePage}` : ""} • Click anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Animated SVG Sacred Geometry Generator for all Telsem Types
 */
function VectorTelsemGeometry({
  type,
}: {
  type: TelsemSeal["vectorGeometryType"];
}) {
  const primaryRed = "#dc2626";
  const sacredGold = "#f59e0b";
  const carbonBlack = "#1c1917";

  switch (type) {
    case "all_seeing_diamond_eyes":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <defs>
            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="10" y="10" width="220" height="220" rx="20" fill="#0c0a09" stroke={sacredGold} strokeWidth="2" />
          <rect x="20" y="20" width="200" height="200" rx="14" fill="none" stroke={primaryRed} strokeWidth="1.5" strokeDasharray="4 2" />
          
          {/* Top Hareg Border */}
          <path d="M 30 35 Q 60 25, 90 35 T 150 35 T 210 35" fill="none" stroke={sacredGold} strokeWidth="2" />
          <path d="M 30 205 Q 60 215, 90 205 T 150 205 T 210 205" fill="none" stroke={sacredGold} strokeWidth="2" />

          {/* Left Eye */}
          <g transform="translate(68, 120)">
            <ellipse cx="0" cy="0" rx="42" ry="24" fill="#1c1917" stroke={sacredGold} strokeWidth="2.5" />
            <ellipse cx="0" cy="0" rx="42" ry="24" fill="url(#eyeGlow)" />
            <circle cx="0" cy="0" r="16" fill={primaryRed} />
            <circle cx="0" cy="0" r="10" fill="#000000" stroke={sacredGold} strokeWidth="1.5" />
            <circle cx="-3" cy="-3" r="3.5" fill="#ffffff" />
            {/* Eyelashes/Rays */}
            <path d="M -30 -20 L -38 -28 M 0 -24 L 0 -34 M 30 -20 L 38 -28" stroke={primaryRed} strokeWidth="2" />
            <path d="M -30 20 L -38 28 M 0 24 L 0 34 M 30 20 L 38 28" stroke={primaryRed} strokeWidth="2" />
          </g>

          {/* Right Eye */}
          <g transform="translate(172, 120)">
            <ellipse cx="0" cy="0" rx="42" ry="24" fill="#1c1917" stroke={sacredGold} strokeWidth="2.5" />
            <ellipse cx="0" cy="0" rx="42" ry="24" fill="url(#eyeGlow)" />
            <circle cx="0" cy="0" r="16" fill={primaryRed} />
            <circle cx="0" cy="0" r="10" fill="#000000" stroke={sacredGold} strokeWidth="1.5" />
            <circle cx="-3" cy="-3" r="3.5" fill="#ffffff" />
            {/* Eyelashes/Rays */}
            <path d="M -30 -20 L -38 -28 M 0 -24 L 0 -34 M 30 -20 L 38 -28" stroke={primaryRed} strokeWidth="2" />
            <path d="M -30 20 L -38 28 M 0 24 L 0 34 M 30 20 L 38 28" stroke={primaryRed} strokeWidth="2" />
          </g>

          {/* Central Nose/Cruciform Pillar */}
          <path d="M 120 70 L 120 170 M 110 90 L 130 90 M 112 150 L 128 150" stroke={sacredGold} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="120" cy="120" r="6" fill={primaryRed} />
        </svg>
      );

    case "solomon_octagram":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="16" fill="#09090b" stroke="#713f12" strokeWidth="2" />
          <circle cx="120" cy="120" r="95" fill="none" stroke={sacredGold} strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* Square 1 */}
          <rect x="55" y="55" width="130" height="130" fill="none" stroke={sacredGold} strokeWidth="2.5" />
          {/* Square 2 (Rotated 45 deg) */}
          <rect
            x="55"
            y="55"
            width="130"
            height="130"
            fill="none"
            stroke={primaryRed}
            strokeWidth="2.5"
            transform="rotate(45 120 120)"
          />

          {/* Central Solar Core */}
          <circle cx="120" cy="120" r="28" fill="#1c1917" stroke={sacredGold} strokeWidth="2" />
          <circle cx="120" cy="120" r="14" fill={primaryRed} />
          <circle cx="120" cy="120" r="5" fill="#fef08a" />

          {/* 8 Cardinal Eyes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <circle
              key={i}
              cx={120 + 82 * Math.cos((angle * Math.PI) / 180)}
              cy={120 + 82 * Math.sin((angle * Math.PI) / 180)}
              r="4.5"
              fill={i % 2 === 0 ? sacredGold : primaryRed}
            />
          ))}
        </svg>
      );

    case "protective_cross_shield":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="12" y="12" width="216" height="216" rx="24" fill="#09090b" stroke={sacredGold} strokeWidth="2" />
          {/* Outer Shield Knot */}
          <path
            d="M 120 30 L 200 70 L 200 160 L 120 210 L 40 160 L 40 70 Z"
            fill="none"
            stroke={primaryRed}
            strokeWidth="2"
          />
          {/* Cross Core */}
          <path
            d="M 120 45 L 120 195 M 55 110 L 185 110"
            stroke={sacredGold}
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Flared Cross Ends */}
          <path d="M 110 45 L 130 45 M 110 195 L 130 195 M 55 100 L 55 120 M 185 100 L 185 120" stroke={sacredGold} strokeWidth="3" />
          <circle cx="120" cy="110" r="12" fill={primaryRed} stroke={sacredGold} strokeWidth="2" />
          {/* Four Shield Eyes */}
          <circle cx="85" cy="80" r="8" fill="#1c1917" stroke={sacredGold} strokeWidth="1.5" />
          <circle cx="85" cy="80" r="3" fill="#ffffff" />
          <circle cx="155" cy="80" r="8" fill="#1c1917" stroke={sacredGold} strokeWidth="1.5" />
          <circle cx="155" cy="80" r="3" fill="#ffffff" />
          <circle cx="85" cy="140" r="8" fill="#1c1917" stroke={sacredGold} strokeWidth="1.5" />
          <circle cx="85" cy="140" r="3" fill="#ffffff" />
          <circle cx="155" cy="140" r="8" fill="#1c1917" stroke={sacredGold} strokeWidth="1.5" />
          <circle cx="155" cy="140" r="3" fill="#ffffff" />
        </svg>
      );

    case "dual_binding_grid":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="20" y="20" width="200" height="200" rx="12" fill="#0a0a0a" stroke={sacredGold} strokeWidth="2" />
          {/* Dual 3x3 Binding Grids */}
          <line x1="20" y1="86" x2="220" y2="86" stroke={primaryRed} strokeWidth="1.5" />
          <line x1="20" y1="154" x2="220" y2="154" stroke={primaryRed} strokeWidth="1.5" />
          <line x1="86" y1="20" x2="86" y2="220" stroke={primaryRed} strokeWidth="1.5" />
          <line x1="154" y1="20" x2="154" y2="220" stroke={primaryRed} strokeWidth="1.5" />
          {/* Inner Diagonal Bindings */}
          <line x1="20" y1="20" x2="220" y2="220" stroke={sacredGold} strokeWidth="1" strokeDasharray="3 3" />
          <line x1="220" y1="20" x2="20" y2="220" stroke={sacredGold} strokeWidth="1" strokeDasharray="3 3" />
          {/* Binding Seal Nodes */}
          {[
            [53, 53], [120, 53], [187, 53],
            [53, 120], [120, 120], [187, 120],
            [53, 187], [120, 187], [187, 187]
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i === 4 ? 12 : 7}
              fill={i === 4 ? primaryRed : "#1c1917"}
              stroke={sacredGold}
              strokeWidth="2"
            />
          ))}
        </svg>
      );

    case "panoramic_crown_eyes":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="10" y="30" width="220" height="180" rx="16" fill="#09090b" stroke={sacredGold} strokeWidth="2" />
          {/* Upper Crown Arch */}
          <path d="M 20 60 Q 120 35, 220 60" fill="none" stroke={primaryRed} strokeWidth="2" />
          <path d="M 20 180 Q 120 205, 220 180" fill="none" stroke={primaryRed} strokeWidth="2" />
          {/* 5 Crown Guardian Eyes */}
          {[38, 79, 120, 161, 202].map((cx, i) => (
            <g key={i} transform={`translate(${cx}, 120)`}>
              <ellipse cx="0" cy="0" rx="18" ry="28" fill="#1c1917" stroke={sacredGold} strokeWidth="2" />
              <circle cx="0" cy="0" r="10" fill={i === 2 ? primaryRed : sacredGold} />
              <circle cx="0" cy="0" r="4" fill="#000000" />
              <circle cx="-1.5" cy="-2" r="1.5" fill="#ffffff" />
            </g>
          ))}
          {/* Interconnecting Harmony Lines */}
          <line x1="20" y1="120" x2="220" y2="120" stroke={primaryRed} strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );

    case "michael_solar_blade":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="12" y="12" width="216" height="216" rx="20" fill="#090807" stroke={sacredGold} strokeWidth="2" />
          {/* Solar Halo */}
          <circle cx="120" cy="110" r="75" fill="none" stroke={sacredGold} strokeWidth="1.5" strokeDasharray="4 2" />
          <circle cx="120" cy="110" r="50" fill="#1c1917" stroke={primaryRed} strokeWidth="1.5" />
          
          {/* Solar Rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1={120 + 52 * Math.cos((deg * Math.PI) / 180)}
              y1={110 + 52 * Math.sin((deg * Math.PI) / 180)}
              x2={120 + 72 * Math.cos((deg * Math.PI) / 180)}
              y2={110 + 72 * Math.sin((deg * Math.PI) / 180)}
              stroke={sacredGold}
              strokeWidth="1.5"
            />
          ))}

          {/* Central Flaming Blade */}
          <path d="M 115 32 L 120 20 L 125 32 L 123 160 L 117 160 Z" fill={primaryRed} stroke={sacredGold} strokeWidth="1.5" />
          <line x1="120" y1="25" x2="120" y2="160" stroke="#fef08a" strokeWidth="2" />

          {/* Cross Guard */}
          <rect x="90" y="160" width="60" height="10" rx="3" fill="#1c1917" stroke={sacredGold} strokeWidth="2" />
          <circle cx="95" cy="165" r="3" fill={primaryRed} />
          <circle cx="145" cy="165" r="3" fill={primaryRed} />

          {/* Hilt and Pommel */}
          <rect x="116" y="170" width="8" height="24" rx="2" fill="#713f12" stroke={sacredGold} strokeWidth="1" />
          <circle cx="120" cy="200" r="8" fill={primaryRed} stroke={sacredGold} strokeWidth="2" />
          <circle cx="120" cy="200" r="3" fill="#ffffff" />

          {/* Four Archangel Guardian Eyes */}
          <g transform="translate(60, 60)"><ellipse cx="0" cy="0" rx="14" ry="9" fill="#1c1917" stroke={sacredGold} strokeWidth="1.5" /><circle cx="0" cy="0" r="4" fill={primaryRed} /><circle cx="-1" cy="-1" r="1.5" fill="#fff" /></g>
          <g transform="translate(180, 60)"><ellipse cx="0" cy="0" rx="14" ry="9" fill="#1c1917" stroke={sacredGold} strokeWidth="1.5" /><circle cx="0" cy="0" r="4" fill={primaryRed} /><circle cx="-1" cy="-1" r="1.5" fill="#fff" /></g>
          <g transform="translate(60, 160)"><ellipse cx="0" cy="0" rx="14" ry="9" fill="#1c1917" stroke={sacredGold} strokeWidth="1.5" /><circle cx="0" cy="0" r="4" fill={primaryRed} /><circle cx="-1" cy="-1" r="1.5" fill="#fff" /></g>
          <g transform="translate(180, 160)"><ellipse cx="0" cy="0" rx="14" ry="9" fill="#1c1917" stroke={sacredGold} strokeWidth="1.5" /><circle cx="0" cy="0" r="4" fill={primaryRed} /><circle cx="-1" cy="-1" r="1.5" fill="#fff" /></g>
        </svg>
      );

    case "gabriel_annunciation_squares":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="16" fill="#090a0f" stroke={sacredGold} strokeWidth="2" />
          {/* Inner Outer Diamonds */}
          <polygon points="120,25 215,120 120,215 25,120" fill="none" stroke={sacredGold} strokeWidth="2" />
          <polygon points="120,45 195,120 120,195 45,120" fill="#171822" stroke={primaryRed} strokeWidth="2" />

          {/* Central Lily / 4-Point Star */}
          <path
            d="M 120 65 Q 135 105, 175 120 Q 135 135, 120 175 Q 105 135, 65 120 Q 105 105, 120 65 Z"
            fill="#0f172a"
            stroke={sacredGold}
            strokeWidth="2.5"
          />
          <circle cx="120" cy="120" r="14" fill={primaryRed} stroke={sacredGold} strokeWidth="2" />
          <circle cx="120" cy="120" r="5" fill="#fef08a" />

          {/* Annunciation Wing Petals */}
          <circle cx="120" cy="45" r="7" fill={primaryRed} stroke={sacredGold} strokeWidth="1.5" />
          <circle cx="195" cy="120" r="7" fill={primaryRed} stroke={sacredGold} strokeWidth="1.5" />
          <circle cx="120" cy="195" r="7" fill={primaryRed} stroke={sacredGold} strokeWidth="1.5" />
          <circle cx="45" cy="120" r="7" fill={primaryRed} stroke={sacredGold} strokeWidth="1.5" />
        </svg>
      );

    case "raphael_healing_star":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="20" fill="#06120e" stroke="#10b981" strokeWidth="2" />
          {/* Concentric Healing Rings */}
          <circle cx="120" cy="120" r="90" fill="none" stroke="#059669" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="120" cy="120" r="70" fill="#042f2e" stroke={sacredGold} strokeWidth="2" />

          {/* Hexagram / Solomon Healing Star */}
          <polygon points="120,40 180,145 60,145" fill="none" stroke={sacredGold} strokeWidth="2.5" />
          <polygon points="120,200 180,95 60,95" fill="none" stroke={primaryRed} strokeWidth="2.5" />

          {/* Central Eye of Healing */}
          <ellipse cx="120" cy="120" rx="26" ry="16" fill="#022c22" stroke={sacredGold} strokeWidth="2" />
          <circle cx="120" cy="120" r="9" fill="#10b981" />
          <circle cx="120" cy="120" r="4" fill="#000000" />
          <circle cx="118" cy="118" r="1.5" fill="#ffffff" />

          {/* Six Droplets of Medicinal Balsam */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <circle
              key={deg}
              cx={120 + 80 * Math.cos((deg * Math.PI) / 180)}
              cy={120 + 80 * Math.sin((deg * Math.PI) / 180)}
              r="6"
              fill={deg % 120 === 0 ? "#10b981" : sacredGold}
              stroke="#042f2e"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      );

    case "master_exorcism_matrix":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="14" fill="#0b0a09" stroke={sacredGold} strokeWidth="2.5" />
          {/* Grid Intersections */}
          {[65, 120, 175].map((pos) => (
            <React.Fragment key={pos}>
              <line x1="25" y1={pos} x2="215" y2={pos} stroke={primaryRed} strokeWidth="1.5" />
              <line x1={pos} y1="25" x2={pos} y2="215" stroke={primaryRed} strokeWidth="1.5" />
            </React.Fragment>
          ))}
          {/* Diagonal Exorcism Bindings */}
          <line x1="25" y1="25" x2="215" y2="215" stroke={sacredGold} strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="215" y1="25" x2="25" y2="215" stroke={sacredGold} strokeWidth="1.5" strokeDasharray="4 2" />

          {/* Central Eye & 8 Surrounding Binding Runes */}
          <circle cx="120" cy="120" r="22" fill="#1c1917" stroke={sacredGold} strokeWidth="2.5" />
          <circle cx="120" cy="120" r="12" fill={primaryRed} />
          <circle cx="120" cy="120" r="5" fill="#fef08a" />

          {/* 4 Corner Binding Eyes */}
          {[[45, 45], [195, 45], [45, 195], [195, 195]].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx}, ${cy})`}>
              <ellipse cx="0" cy="0" rx="14" ry="9" fill="#1c1917" stroke={sacredGold} strokeWidth="1.5" />
              <circle cx="0" cy="0" r="4" fill={primaryRed} />
            </g>
          ))}
        </svg>
      );

    case "radiating_banishment_mahteb":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="20" fill="#09090b" stroke={sacredGold} strokeWidth="2" />
          {/* Braided Cord Ring (ማዕተብ) */}
          <circle cx="120" cy="120" r="82" fill="none" stroke={sacredGold} strokeWidth="4" />
          <circle cx="120" cy="120" r="76" fill="none" stroke={primaryRed} strokeWidth="2" strokeDasharray="6 3" />
          <circle cx="120" cy="120" r="50" fill="#18181b" stroke={sacredGold} strokeWidth="2" />

          {/* 16 Radiating Spear Rays */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 22.5 * Math.PI) / 180;
            const x1 = 120 + 52 * Math.cos(angle);
            const y1 = 120 + 52 * Math.sin(angle);
            const x2 = 120 + 92 * Math.cos(angle);
            const y2 = 120 + 92 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 2 === 0 ? primaryRed : sacredGold}
                strokeWidth={i % 2 === 0 ? "2.5" : "1.5"}
              />
            );
          })}

          {/* Center Cross Shield */}
          <path d="M 120 95 L 120 145 M 95 120 L 145 120" stroke={sacredGold} strokeWidth="4" strokeLinecap="round" />
          <circle cx="120" cy="120" r="8" fill={primaryRed} stroke={sacredGold} strokeWidth="1.5" />
        </svg>
      );

    case "sador_cross_eye_shield":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="20" fill="#0c0a09" stroke={sacredGold} strokeWidth="2" />
          {/* Braided Border Pattern */}
          <rect x="25" y="25" width="190" height="190" rx="14" fill="none" stroke={primaryRed} strokeWidth="2" strokeDasharray="5 3" />

          {/* Central Sador Cruciform */}
          <path
            d="M 100 40 H 140 V 85 H 185 V 125 H 140 V 185 H 100 V 125 H 55 V 85 H 100 Z"
            fill="#1c1917"
            stroke={sacredGold}
            strokeWidth="2.5"
          />

          {/* 5 Sacred Nail Eyes: Sador, Alador, Danat, Adera, Rodas */}
          {[
            { cx: 120, cy: 105, label: "ሳዶር" },
            { cx: 120, cy: 62, label: "አላዶር" },
            { cx: 120, cy: 155, label: "ዳናት" },
            { cx: 78, cy: 105, label: "አዴራ" },
            { cx: 162, cy: 105, label: "ሮዳስ" },
          ].map((nail, idx) => (
            <g key={idx} transform={`translate(${nail.cx}, ${nail.cy})`}>
              <ellipse cx="0" cy="0" rx="14" ry="9" fill="#090807" stroke={sacredGold} strokeWidth="1.5" />
              <circle cx="0" cy="0" r="4.5" fill={primaryRed} />
              <circle cx="-1" cy="-1" r="1.5" fill="#ffffff" />
            </g>
          ))}
        </svg>
      );

    case "meskel_endless_knot":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="20" fill="#0a0a0a" stroke={sacredGold} strokeWidth="2" />
          {/* Outer Knot Frame */}
          <path
            d="M 90 30 L 150 30 L 150 90 L 210 90 L 210 150 L 150 150 L 150 210 L 90 210 L 90 150 L 30 150 L 30 90 L 90 90 Z"
            fill="#1c1917"
            stroke={sacredGold}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Inner Interlaced Ribbon */}
          <path
            d="M 105 45 L 135 45 L 135 105 L 195 105 L 195 135 L 135 135 L 135 195 L 105 195 L 105 135 L 45 135 L 45 105 L 105 105 Z"
            fill="none"
            stroke={primaryRed}
            strokeWidth="2.5"
          />
          {/* Core Diamond and Eye */}
          <polygon points="120,95 145,120 120,145 95,120" fill="#09090b" stroke={sacredGold} strokeWidth="2" />
          <circle cx="120" cy="120" r="8" fill={primaryRed} />
          <circle cx="120" cy="120" r="3" fill="#fef08a" />
        </svg>
      );

    case "uriel_flaming_chalice":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="20" fill="#140702" stroke="#ea580c" strokeWidth="2" />
          {/* Aura Halo */}
          <circle cx="120" cy="90" r="60" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Leaping Divine Flame */}
          <path
            d="M 120 40 Q 145 75, 135 110 Q 120 120, 105 110 Q 95 75, 120 40 Z"
            fill="#ea580c"
            stroke={sacredGold}
            strokeWidth="2"
          />
          <path
            d="M 120 60 Q 135 85, 128 105 Q 120 112, 112 105 Q 105 85, 120 60 Z"
            fill="#facc15"
          />
          <circle cx="120" cy="95" r="4" fill="#ffffff" />

          {/* Sacred Chalice */}
          <path
            d="M 90 120 Q 90 160, 120 165 Q 150 160, 150 120 Z"
            fill="#1c1917"
            stroke={sacredGold}
            strokeWidth="2.5"
          />
          <rect x="115" y="165" width="10" height="25" fill="#713f12" stroke={sacredGold} strokeWidth="1.5" />
          <ellipse cx="120" cy="195" rx="35" ry="12" fill="#1c1917" stroke={sacredGold} strokeWidth="2" />

          {/* Chalice Inscription Eye */}
          <ellipse cx="120" cy="140" rx="12" ry="7" fill="#000000" stroke={sacredGold} strokeWidth="1.5" />
          <circle cx="120" cy="140" r="3.5" fill={primaryRed} />
        </svg>
      );

    case "phanuel_fiery_wheel":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="20" fill="#0c0702" stroke="#ea580c" strokeWidth="2" />
          {/* Outer Fiery Wheel Rim (ኦፋኒም) */}
          <circle cx="120" cy="120" r="88" fill="none" stroke={sacredGold} strokeWidth="3" />
          <circle cx="120" cy="120" r="76" fill="#1c0f05" stroke={primaryRed} strokeWidth="2" strokeDasharray="6 3" />
          <circle cx="120" cy="120" r="48" fill="#090502" stroke={sacredGold} strokeWidth="2" />

          {/* 8 Fiery Spokes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={120 + 48 * Math.cos(rad)}
                y1={120 + 48 * Math.sin(rad)}
                x2={120 + 86 * Math.cos(rad)}
                y2={120 + 86 * Math.sin(rad)}
                stroke={deg % 90 === 0 ? primaryRed : sacredGold}
                strokeWidth="2"
              />
            );
          })}

          {/* 12 Eyes Around Fiery Rim */}
          {Array.from({ length: 12 }).map((_, i) => {
            const ang = (i * 30 * Math.PI) / 180;
            const cx = 120 + 82 * Math.cos(ang);
            const cy = 120 + 82 * Math.sin(ang);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="3.5"
                fill={i % 2 === 0 ? primaryRed : sacredGold}
                stroke="#000"
                strokeWidth="1"
              />
            );
          })}

          {/* Solar Core */}
          <circle cx="120" cy="120" r="16" fill={primaryRed} stroke={sacredGold} strokeWidth="2" />
          <circle cx="120" cy="120" r="6" fill="#fef08a" />
        </svg>
      );

    case "raguel_solar_fortress":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="16" fill="#09080b" stroke={sacredGold} strokeWidth="2" />
          {/* Octagonal Fortress Wall */}
          <polygon
            points="70,30 170,30 210,70 210,170 170,210 70,210 30,170 30,70"
            fill="#15121e"
            stroke={sacredGold}
            strokeWidth="3"
          />
          <polygon
            points="80,45 160,45 195,80 195,160 160,195 80,195 45,160 45,80"
            fill="none"
            stroke={primaryRed}
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* 8 Watchtower Turrets */}
          {[
            [70, 30], [170, 30], [210, 70], [210, 170],
            [170, 210], [70, 210], [30, 170], [30, 70]
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6" fill={sacredGold} stroke="#000" strokeWidth="1.5" />
          ))}

          {/* Central Scales of Justice & Solar Heart */}
          <circle cx="120" cy="120" r="28" fill="#0c0a14" stroke={sacredGold} strokeWidth="2" />
          <line x1="95" y1="120" x2="145" y2="120" stroke={sacredGold} strokeWidth="2.5" />
          <line x1="120" y1="95" x2="120" y2="145" stroke={sacredGold} strokeWidth="2.5" />
          <circle cx="120" cy="120" r="8" fill={primaryRed} />
          <circle cx="102" cy="120" r="4" fill={sacredGold} />
          <circle cx="138" cy="120" r="4" fill={sacredGold} />
        </svg>
      );

    case "solomon_net_lattice":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="16" fill="#070a0d" stroke={sacredGold} strokeWidth="2" />
          {/* Net Grid (መርበበ ሰሎሞን) */}
          {[-60, -30, 0, 30, 60].map((offset) => (
            <React.Fragment key={offset}>
              <line x1={30 + offset} y1="30" x2={210 + offset} y2="210" stroke={primaryRed} strokeWidth="1.5" />
              <line x1={210 - offset} y1="30" x2={30 - offset} y2="210" stroke={primaryRed} strokeWidth="1.5" />
            </React.Fragment>
          ))}

          {/* 16 Binding Knots */}
          {[
            [75, 75], [120, 75], [165, 75],
            [75, 120], [120, 120], [165, 120],
            [75, 165], [120, 165], [165, 165],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={i === 4 ? 14 : 6}
              fill={i === 4 ? primaryRed : "#0a192f"}
              stroke={sacredGold}
              strokeWidth="2"
            />
          ))}

          {/* Central Seal Star */}
          <polygon points="120,108 124,116 132,120 124,124 120,132 116,124 108,120 116,116" fill="#fef08a" />
        </svg>
      );

    case "winged_cherub":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="20" fill="#0a0808" stroke={sacredGold} strokeWidth="2" />
          {/* Upper Wings */}
          <path d="M 120 100 Q 80 30, 40 45 Q 70 85, 110 110 Z" fill="#1f1313" stroke={primaryRed} strokeWidth="2" />
          <path d="M 120 100 Q 160 30, 200 45 Q 170 85, 130 110 Z" fill="#1f1313" stroke={primaryRed} strokeWidth="2" />

          {/* Lower Wings */}
          <path d="M 120 130 Q 75 195, 45 180 Q 75 150, 110 125 Z" fill="#1f1313" stroke={sacredGold} strokeWidth="2" />
          <path d="M 120 130 Q 165 195, 195 180 Q 165 150, 130 125 Z" fill="#1f1313" stroke={sacredGold} strokeWidth="2" />

          {/* Wing Eyes (አዕይንት በክንፍ) */}
          <circle cx="65" cy="55" r="4.5" fill="#1c1917" stroke={sacredGold} strokeWidth="1" />
          <circle cx="65" cy="55" r="1.5" fill="#fff" />
          <circle cx="175" cy="55" r="4.5" fill="#1c1917" stroke={sacredGold} strokeWidth="1" />
          <circle cx="175" cy="55" r="1.5" fill="#fff" />
          <circle cx="65" cy="170" r="4.5" fill="#1c1917" stroke={sacredGold} strokeWidth="1" />
          <circle cx="65" cy="170" r="1.5" fill="#fff" />
          <circle cx="175" cy="170" r="4.5" fill="#1c1917" stroke={sacredGold} strokeWidth="1" />
          <circle cx="175" cy="170" r="1.5" fill="#fff" />

          {/* Central Cherubic Face & Halo */}
          <circle cx="120" cy="115" r="30" fill="#17110e" stroke={sacredGold} strokeWidth="2.5" />
          <circle cx="120" cy="115" r="16" fill={primaryRed} />
          {/* Eyes */}
          <circle cx="113" cy="112" r="3.5" fill="#fff" />
          <circle cx="113" cy="112" r="1.5" fill="#000" />
          <circle cx="127" cy="112" r="3.5" fill="#fff" />
          <circle cx="127" cy="112" r="1.5" fill="#000" />
          {/* Small Cross Crown */}
          <path d="M 120 78 L 120 92 M 114 84 L 126 84" stroke={sacredGold} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "four_living_creatures":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="20" fill="#090807" stroke={sacredGold} strokeWidth="2" />
          {/* Central Throne Circle */}
          <circle cx="120" cy="120" r="38" fill="#18130f" stroke={sacredGold} strokeWidth="2.5" />
          <circle cx="120" cy="120" r="18" fill={primaryRed} stroke={sacredGold} strokeWidth="1.5" />
          <polygon points="120,110 123,118 131,120 123,122 120,130 117,122 109,120 117,118" fill="#fef08a" />

          {/* Cardinal Connecting Bars */}
          <line x1="120" y1="25" x2="120" y2="82" stroke={primaryRed} strokeWidth="3" />
          <line x1="120" y1="158" x2="120" y2="215" stroke={primaryRed} strokeWidth="3" />
          <line x1="25" y1="120" x2="82" y2="120" stroke={primaryRed} strokeWidth="3" />
          <line x1="158" y1="120" x2="215" y2="120" stroke={primaryRed} strokeWidth="3" />

          {/* Top: Man (ሰብእ) */}
          <g transform="translate(120, 48)">
            <circle cx="0" cy="0" r="16" fill="#1c1917" stroke={sacredGold} strokeWidth="2" />
            <circle cx="-5" cy="-2" r="2.5" fill="#fff" /><circle cx="5" cy="-2" r="2.5" fill="#fff" />
          </g>

          {/* Right: Lion (አንበሳ) */}
          <g transform="translate(192, 120)">
            <circle cx="0" cy="0" r="16" fill="#1c1917" stroke={sacredGold} strokeWidth="2" />
            <circle cx="0" cy="0" r="8" fill={primaryRed} />
            <path d="M -8 -8 L 0 -13 L 8 -8" stroke={sacredGold} strokeWidth="1.5" fill="none" />
          </g>

          {/* Bottom: Ox (ላም) */}
          <g transform="translate(120, 192)">
            <circle cx="0" cy="0" r="16" fill="#1c1917" stroke={sacredGold} strokeWidth="2" />
            <path d="M -12 -6 Q -6 -14, 0 -6 Q 6 -14, 12 -6" stroke={sacredGold} strokeWidth="2" fill="none" />
          </g>

          {/* Left: Eagle (ንስር) */}
          <g transform="translate(48, 120)">
            <circle cx="0" cy="0" r="16" fill="#1c1917" stroke={sacredGold} strokeWidth="2" />
            <polygon points="-8,-4 0,-12 8,-4" fill={primaryRed} stroke={sacredGold} strokeWidth="1" />
          </g>
        </svg>
      );

    case "scholars_illuminated_scroll":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="16" fill="#0c0906" stroke={sacredGold} strokeWidth="2" />
          {/* Parchment Body */}
          <rect x="45" y="30" width="150" height="180" rx="8" fill="#1f1812" stroke="#854d0e" strokeWidth="2" />
          {/* Top Roller */}
          <rect x="35" y="24" width="170" height="12" rx="6" fill="#713f12" stroke={sacredGold} strokeWidth="1.5" />
          {/* Bottom Roller */}
          <rect x="35" y="204" width="170" height="12" rx="6" fill="#713f12" stroke={sacredGold} strokeWidth="1.5" />

          {/* Top Harag Motif (ሐረግ) */}
          <path
            d="M 55 45 Q 75 38, 95 45 T 135 45 T 175 45 T 185 45"
            fill="none"
            stroke={primaryRed}
            strokeWidth="2.5"
          />

          {/* Manuscript Text Lines (Ge'ez Red/Black Alternation) */}
          {[65, 80, 95, 110, 125, 140, 155, 170, 185].map((y, i) => (
            <line
              key={y}
              x1="60"
              y1={y}
              x2="180"
              y2={y}
              stroke={i % 3 === 0 ? primaryRed : sacredGold}
              strokeWidth="2"
              strokeDasharray={i % 2 === 0 ? "8 3 14 3" : "12 4 6 4"}
            />
          ))}

          {/* Central Eye of Illumination */}
          <ellipse cx="120" cy="120" rx="22" ry="14" fill="#0c0906" stroke={sacredGold} strokeWidth="2" />
          <circle cx="120" cy="120" r="7" fill={primaryRed} />
          <circle cx="118" cy="118" r="2" fill="#fff" />
        </svg>
      );

    case "concentric_harmony_rings":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="20" fill="#090a0f" stroke={sacredGold} strokeWidth="2" />
          {/* 6 Concentric Harmony Rings */}
          {[25, 42, 58, 72, 85, 96].map((r, i) => (
            <circle
              key={r}
              cx="120"
              cy="120"
              r={r}
              fill="none"
              stroke={i % 2 === 0 ? sacredGold : primaryRed}
              strokeWidth={i === 5 ? 2.5 : 1.5}
              strokeDasharray={i % 3 === 1 ? "4 3" : undefined}
            />
          ))}

          {/* 8 Radial Harmony Rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1={120 + 25 * Math.cos((deg * Math.PI) / 180)}
              y1={120 + 25 * Math.sin((deg * Math.PI) / 180)}
              x2={120 + 96 * Math.cos((deg * Math.PI) / 180)}
              y2={120 + 96 * Math.sin((deg * Math.PI) / 180)}
              stroke={sacredGold}
              strokeWidth="1"
              opacity="0.7"
            />
          ))}

          {/* Center Harmony Core */}
          <circle cx="120" cy="120" r="14" fill={primaryRed} stroke={sacredGold} strokeWidth="2" />
          <circle cx="120" cy="120" r="5" fill="#fef08a" />
        </svg>
      );

    case "cornucopia_vessel":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="20" fill="#0a0805" stroke={sacredGold} strokeWidth="2" />
          {/* Abundance Halo */}
          <circle cx="120" cy="80" r="55" fill="none" stroke={sacredGold} strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Harvest Grain Spikes (ጤፍ ወ ስንዴ) */}
          {[-30, -15, 0, 15, 30].map((deg) => (
            <path
              key={deg}
              d={`M 120 100 Q ${120 + deg * 2} 50, ${120 + deg * 2.5} 35`}
              fill="none"
              stroke={sacredGold}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
          {[-25, -10, 5, 20].map((deg) => (
            <circle key={deg} cx={120 + deg * 2} cy="42" r="3" fill={primaryRed} />
          ))}

          {/* Traditional Ethiopian Clay Vessel (እንስራ) */}
          <path
            d="M 95 105 Q 80 135, 75 160 Q 75 195, 120 200 Q 165 195, 165 160 Q 160 135, 145 105 Z"
            fill="#1c120c"
            stroke={sacredGold}
            strokeWidth="3"
          />
          <ellipse cx="120" cy="105" rx="25" ry="7" fill={primaryRed} stroke={sacredGold} strokeWidth="2" />

          {/* Vessel Inscription / Abundance Knot */}
          <circle cx="120" cy="160" r="14" fill="#0f0906" stroke={sacredGold} strokeWidth="2" />
          <circle cx="120" cy="160" r="6" fill={primaryRed} />
          <circle cx="120" cy="160" r="2" fill="#fff" />
        </svg>
      );

    case "uncoiling_release_spiral":
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="20" fill="#080709" stroke={sacredGold} strokeWidth="2" />
          {/* Archimedean Release Spiral (መፍትሔ ሥራይ) */}
          <path
            d="M 120 120 
               A 10 10 0 0 1 120 130 
               A 20 20 0 0 1 110 110 
               A 35 35 0 0 1 145 120 
               A 50 50 0 0 1 95 145 
               A 68 68 0 0 1 165 95 
               A 85 85 0 0 1 70 170"
            fill="none"
            stroke={primaryRed}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Second Intertwined Golden Spiral */}
          <path
            d="M 120 120 
               A 12 12 0 0 0 120 108 
               A 24 24 0 0 0 132 132 
               A 40 40 0 0 0 92 108 
               A 58 58 0 0 0 150 156 
               A 78 78 0 0 0 65 90"
            fill="none"
            stroke={sacredGold}
            strokeWidth="2.5"
            strokeDasharray="5 3"
            strokeLinecap="round"
          />

          {/* 7 Unknotted Release Sparks */}
          {[
            [120, 130], [110, 110], [145, 120], [95, 145], [165, 95], [70, 170], [65, 90]
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4.5" fill={i % 2 === 0 ? sacredGold : primaryRed} stroke="#fff" strokeWidth="1" />
          ))}

          {/* Central Release Eye */}
          <circle cx="120" cy="120" r="8" fill="#000" stroke={sacredGold} strokeWidth="2" />
          <circle cx="120" cy="120" r="3" fill="#fef08a" />
        </svg>
      );

    default:
      // Meskel Knot / Archangel Universal Geometric Telsem
      return (
        <svg viewBox="0 0 240 240" className="w-full h-full p-2">
          <rect x="15" y="15" width="210" height="210" rx="20" fill="#0a0a0a" stroke={sacredGold} strokeWidth="2" />
          {/* Cross Arms */}
          <path
            d="M 120 30 L 120 210 M 30 120 L 210 120"
            stroke={primaryRed}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Diamond Center */}
          <polygon points="120,70 170,120 120,170 70,120" fill="#1c1917" stroke={sacredGold} strokeWidth="3" />
          <circle cx="120" cy="120" r="18" fill={primaryRed} stroke={sacredGold} strokeWidth="2" />
          <circle cx="120" cy="120" r="6" fill="#fef08a" />
          {/* Four Wing Guardians */}
          <circle cx="75" cy="75" r="9" fill="#1c1917" stroke={sacredGold} strokeWidth="1.5" />
          <circle cx="165" cy="75" r="9" fill="#1c1917" stroke={sacredGold} strokeWidth="1.5" />
          <circle cx="75" cy="165" r="9" fill="#1c1917" stroke={sacredGold} strokeWidth="1.5" />
          <circle cx="165" cy="165" r="9" fill="#1c1917" stroke={sacredGold} strokeWidth="1.5" />
        </svg>
      );
  }
}
