"use client";

import React, { useState } from "react";
import { Sparkles, Scroll, ShieldCheck, Copy, Check, Printer } from "lucide-react";
import type { TelsemSeal } from "@/lib/cultural/telsemData";
import { TelsemSacredSeal } from "./TelsemSacredSeal";

interface TelsemScrollCanvasProps {
  seekerNameGeez?: string;
  motherNameGeez?: string;
  seal: TelsemSeal;
  zodiacName?: string;
  circleName?: string;
  className?: string;
  studyCopy?: boolean;
}

export function TelsemScrollCanvas({
  seekerNameGeez = "ተጠቃሚ",
  motherNameGeez,
  seal,
  zodiacName,
  circleName,
  className = "",
  studyCopy = false,
}: TelsemScrollCanvasProps) {
  const [isUnrolled, setIsUnrolled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const handleCopyBlessing = async () => {
    const text = studyCopy
      ? `${seal.nameGe}\n${seal.nameAm}\n\n${seal.traditionalFormulaGe}\n\n${seal.traditionalFormulaEn}\n\n${seal.sourceManuscript}${seal.sourcePage ? `, page ${seal.sourcePage}` : ""}`
      : `በስመ አብ ወወልድ ወመንፈስ ቅዱስ ፩ አምላክ\nጸሎት ወጠልሰም በእንተ ${seal.nameGe} ለ${seekerNameGeez}።\n\n${seal.traditionalFormulaGe}\n\nምሥጢር፡ ${seal.spiritualMeaning}\nምንጭ፡ ${seal.sourceManuscript}`;
    setCopyError("");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError("Clipboard access is unavailable. Select and copy the prayer text manually.");
    }
  };

  return (
    <div className={`telsem-print-root space-y-4 ${className}`}>
      {/* Scroll Actions Bar */}
      <div className="telsem-no-print flex flex-wrap items-center justify-between gap-3 bg-stone-900/80 p-3 px-4 rounded-2xl border border-stone-800 text-xs">
        <div className="flex items-center gap-2">
          <Scroll size={16} className="text-amber-400" />
          <span className="font-serif font-bold text-amber-200">
            {studyCopy ? "Tsifet · Telsem prayer study copy" : "የብራና ክታብ (Parchment Protective Scroll)"}
          </span>
          <span className="hidden sm:inline-block text-stone-500">•</span>
          <span className="hidden sm:inline-block text-stone-400">
            Dedicated for <span className="text-amber-300 font-bold">{seekerNameGeez}</span>
            {motherNameGeez ? ` ወለተ ${motherNameGeez}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsUnrolled(!isUnrolled)}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition-all"
          >
            {isUnrolled ? "ጠቀልል (Roll Up)" : "ዘርጋ (Unroll Scroll)"}
          </button>
          <button
            type="button"
            onClick={handleCopyBlessing}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium transition-all flex items-center gap-1.5"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "ተቀድቷል (Copied)" : "ቅዳ (Copy Text)"}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-200 transition-all hover:bg-emerald-500/20"
          >
            <Printer size={14} />
            Print Tsifet
          </button>
        </div>
      </div>
      {copyError && <p role="alert" className="telsem-no-print text-xs text-rose-300">{copyError}</p>}

      {/* Parchment Scroll Body */}
      <div
        className={`telsem-scroll-content transition-all duration-700 overflow-hidden ${
          isUnrolled ? "max-h-[3000px] opacity-100" : "max-h-24 opacity-75"
        }`}
      >
        <article className="telsem-paper relative mx-auto max-w-2xl rounded-3xl border-4 border-[#85582b] bg-[#fbf5e6] text-[#2b1f17] shadow-2xl p-6 sm:p-10 font-serif">
          {/* Leather Stitching Visuals along borders */}
          <div className="absolute top-0 inset-x-0 h-4 bg-[#6b4226] rounded-t-[20px] flex items-center justify-around px-4">
            {[...Array(12)].map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#3d2314] shadow-inner" />
            ))}
          </div>
          <div className="absolute bottom-0 inset-x-0 h-4 bg-[#6b4226] rounded-b-[20px] flex items-center justify-around px-4">
            {[...Array(12)].map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#3d2314] shadow-inner" />
            ))}
          </div>

          {/* Aged parchment texture background styling */}
          <div className="pt-2 pb-2 space-y-6 text-center">
            <div className="space-y-1 border-b-2 border-[#b91c1c]/40 pb-4">
              <h2 className="text-lg font-bold text-[#7c2d12]">{studyCopy ? "Tsifet · Telsem prayer study copy" : "የብራና ክታብ (Parchment Protective Scroll)"}</h2>
              <p className="text-sm font-bold text-[#b91c1c]">{seal.nameAm}</p>
              <p className="text-xs text-[#573d2b] font-sans">{seal.nameEn}</p>
              {studyCopy && seekerNameGeez && seekerNameGeez !== "ተጠቃሚ" && (
                <p className="text-xs text-[#573d2b] font-sans">Prepared for: {seekerNameGeez}{motherNameGeez ? ` · ${motherNameGeez}` : ""}</p>
              )}
              {!studyCopy && (
                <p className="text-xs text-[#573d2b] font-sans">
                  ጸሎተ ዕቀባ ወፈውስ በእንተ {seal.nameGe} ለገብርከ/ለዓመትከ {seekerNameGeez}
                  {motherNameGeez ? ` ወለተ ${motherNameGeez}` : ""}።
                </p>
              )}
            </div>

            {/* Hareg Ornamental Lattice Band */}
            <div className="py-2 text-center text-[#b91c1c] text-xs font-mono tracking-widest select-none">
              ❖═══════════❖ ፠ ❖═══════════❖
            </div>

            {/* Centered Telsem Seal Art */}
            <div className="flex justify-center my-6">
              <div className="w-full max-w-sm rounded-2xl border-2 border-[#92400e] bg-[#f5ecda] p-4 shadow-inner">
                {seal.sourceImage ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={seal.sourceImage}
                      alt={seal.nameAm}
                      className="w-full max-h-72 object-contain mx-auto filter sepia-[0.4] contrast-125 rounded-lg border border-[#d97706]/40"
                    />
                    <p className="text-[11px] font-mono text-[#78350f] italic">
                      Original Plate: {seal.sourceManuscript} {seal.sourcePage ? `• ገጽ ${seal.sourcePage}` : ""}
                    </p>
                  </div>
                ) : (
                  <TelsemSacredSeal seal={seal} showDetails={false} size="md" />
                )}
              </div>
            </div>

            {/* Sacred Ge'ez Formula in Traditional Black & Red Ink */}
            <div className="space-y-3 text-left bg-[#f2e7cd] p-5 rounded-2xl border border-[#d97706]/30 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-[#b91c1c] uppercase tracking-wider font-mono">
                <Sparkles size={14} />
                <span>የጸሎት ጽሑፍ · Prayer text (as catalogued)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#2b1f17] leading-relaxed font-serif text-justify">
                {seal.traditionalFormulaGe}
              </p>
              <div className="border-t border-[#d6c49e] pt-3">
                <h3 className="text-xs font-bold text-[#78350f]">English rendering</h3>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#2b1f17]">{seal.traditionalFormulaEn}</p>
              </div>
              {(seal.traditionalFormulaGe.includes("...") || seal.traditionalFormulaEn.includes("...")) && (
                <p className="rounded-lg border border-amber-700/30 bg-amber-100/70 p-2 text-xs text-[#78350f]">
                  This catalog transcription contains an ellipsis and may be abbreviated. Consult the manuscript page scan for the complete source text where available.
                </p>
              )}
            </div>

            {studyCopy && (
              <div className="space-y-2 text-left font-sans text-xs">
                <div>
                  <h3 className="font-bold text-[#78350f]">Archive description</h3>
                  <p className="mt-1">{seal.spiritualMeaning}</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#78350f]">Materials recorded in the archive</h3>
                  <ul className="mt-1 list-inside list-disc">{seal.ritualMaterials.map((material) => <li key={material}>{material}</li>)}</ul>
                  <p className="mt-1 font-semibold text-[#991b1b]">Reference metadata only: this printout is not a preparation or use instruction. Do not ingest or handle unknown, toxic, or combustible substances.</p>
                </div>
                <div className="border-t border-[#d6c49e] pt-2">
                  <h3 className="font-bold text-[#78350f]">Source</h3>
                  <p>{seal.sourceManuscript}{seal.sourcePage ? ` · Page ${seal.sourcePage}` : ""}</p>
                </div>
                <p className="border-t border-[#d6c49e] pt-2">{seal.culturalDisclaimer}</p>
                <p className="text-[10px] text-[#573d2b]">Educational and cultural study copy. It does not promise protection, healing, or other outcomes, and is not medical or mental-health advice.</p>
              </div>
            )}

            {/* Astrological & Awde Alignment Note */}
            {(zodiacName || circleName) && (
              <div className="grid grid-cols-2 gap-2 text-xs text-[#573d2b] font-sans pt-2">
                {zodiacName && (
                  <div className="p-2 rounded-xl bg-[#eee1c3] border border-[#d6c49e]">
                    <span className="block text-[10px] uppercase text-[#78350f] font-bold">የኮከብ ስምምነት</span>
                    <span className="font-serif font-bold text-[#2b1f17]">{zodiacName}</span>
                  </div>
                )}
                {circleName && (
                  <div className="p-2 rounded-xl bg-[#eee1c3] border border-[#d6c49e]">
                    <span className="block text-[10px] uppercase text-[#78350f] font-bold">የአውደ ነገሥት ዙር</span>
                    <span className="font-serif font-bold text-[#2b1f17]">{circleName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Hareg Motif */}
            <div className="pt-2 text-center text-[#b91c1c] text-xs font-mono tracking-widest select-none">
              ❖═══════════❖ ፠ ❖═══════════❖
            </div>

            {!studyCopy && (
              <p className="text-xs text-[#78350f] italic pt-1 font-serif">
                ፈውስ ወሰላም ለሥጋ ወለመንፈስ፤ በረከተ ቅዱሳን ሊቃነ መላእክት ከ{seekerNameGeez} ጋር ይሁን። አሜን።
              </p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
