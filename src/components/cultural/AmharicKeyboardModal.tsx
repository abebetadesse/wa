"use client";

import React, { useState } from "react";

const FIDEL_FAMILIES = [
  ["ሀ", "ሁ", "ሂ", "ሃ", "ሄ", "ህ", "ሆ"],
  ["ለ", "ሉ", "ሊ", "ላ", "ሌ", "ል", "ሎ"],
  ["ሐ", "ሑ", "ሒ", "ሓ", "ሔ", "ሕ", "ሖ"],
  ["መ", "ሙ", "ሚ", "ማ", "ሜ", "ም", "ሞ"],
  ["ሠ", "ሡ", "ሢ", "ሣ", "ሤ", "ሥ", "ሦ"],
  ["ረ", "ሩ", "ሪ", "ራ", "ሬ", "ር", "ሮ"],
  ["ሰ", "ሱ", "ሲ", "ሳ", "ሴ", "ስ", "ሶ"],
  ["ሸ", "ሹ", "ሺ", "ሻ", "ሼ", "ሽ", "ሾ"],
  ["ቀ", "ቁ", "ቂ", "ቃ", "ቄ", "ቅ", "ቆ"],
  ["በ", "ቡ", "ቢ", "ባ", "ቤ", "ብ", "ቦ"],
  ["ተ", "ቱ", "ቲ", "ታ", "ቴ", "ት", "ቶ"],
  ["ቸ", "ቹ", "ቺ", "ቻ", "ቼ", "ች", "ቾ"],
  ["ኀ", "ኁ", "ኂ", "ኃ", "ኄ", "ኅ", "ኆ"],
  ["ነ", "ኑ", "ኒ", "ና", "ኔ", "ን", "ኖ"],
  ["ኘ", "ኙ", "ኚ", "ኛ", "ኜ", "ኝ", "ኞ"],
  ["አ", "ኡ", "ኢ", "ኣ", "ኤ", "እ", "ኦ"],
  ["ከ", "ኩ", "ኪ", "ካ", "ኬ", "ክ", "ኮ"],
  ["ወ", "ዉ", "ዊ", "ዋ", "ዌ", "ው", "ዎ"],
  ["ዐ", "ዑ", "ዒ", "ዓ", "ዔ", "ዕ", "ዖ"],
  ["ዘ", "ዙ", "ዚ", "ዛ", "ዜ", "ዝ", "ዞ"],
  ["ዠ", "ዡ", "ዢ", "ዣ", "ዤ", "ዥ", "ዦ"],
  ["የ", "ዩ", "ዪ", "ያ", "ዬ", "ይ", "ዮ"],
  ["ደ", "ዱ", "ዲ", "ዳ", "ዴ", "ድ", "ዶ"],
  ["ጀ", "ጁ", "ጂ", "ጃ", "ጄ", "ጅ", "ጆ"],
  ["ገ", "ጉ", "ጊ", "ጋ", "ጌ", "ግ", "ጎ"],
  ["ጠ", "ጡ", "ጢ", "ጣ", "ጤ", "ጥ", "ጦ"],
  ["ጨ", "ጩ", "ጪ", "ጫ", "ጬ", "ጭ", "ጮ"],
  ["ጰ", "ጱ", "ጲ", "ጳ", "ጴ", "ጵ", "ጶ"],
  ["ጸ", "ጹ", "ጺ", "ጻ", "ጼ", "ጽ", "ጾ"],
  ["ፀ", "ፁ", "ፂ", "ፃ", "ፄ", "ፅ", "ፆ"],
  ["ፈ", "ፉ", "ፊ", "ፋ", "ፌ", "ፍ", "ፎ"],
  ["ፐ", "ፑ", "ፒ", "ፓ", "ፔ", "ፕ", "ፖ"],
];

const PRESETS_GENERAL = ["ሰላማዊት", "ፀሐይ", "አበበ", "ታደሰ", "ተስፋዬ", "አልማዝ", "ዮሐንስ"];
const PRESETS_CAREER = [
  "ሰሎሞን", "ማርያም", "ሄለን", "ዳዊት", "ሰናይት",
  "ሚካኤል", "ሃብታሙ", "ብርቱካን", "አምሃ", "ዘሪቱ",
];

export function AmharicKeyboardModal({
  isOpen,
  onClose,
  onInsert,
  context = "general",
}: {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (char: string) => void;
  context?: "general" | "career";
}) {
  const [activeFamilyIdx, setActiveFamilyIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const PRESETS = context === "career" ? PRESETS_CAREER : PRESETS_GENERAL;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-amber-500/40 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-amber-200">የግዕዝ / አማርኛ ኪቦርድ</h3>
            <p className="text-xs text-stone-400">Click a base letter to open its 7 orders, or use a preset name</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm"
          >
            ✕ Close
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1">
          <span className="text-xs text-stone-400">Quick Canonical Names:</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  onInsert(p);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 text-sm font-medium hover:bg-amber-900/80 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded 7 orders for active family */}
        {activeFamilyIdx !== null && (
          <div className="p-3 rounded-2xl bg-black/60 border border-amber-500/40 space-y-2">
            <span className="text-xs text-amber-400 font-mono">Select order:</span>
            <div className="flex flex-wrap gap-2">
              {FIDEL_FAMILIES[activeFamilyIdx].map((char) => (
                <button
                  key={char}
                  type="button"
                  onClick={() => onInsert(char)}
                  className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-amber-600 text-white font-bold text-base border border-stone-700 transition-colors"
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Base Fidel Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-60 overflow-y-auto p-1">
          {FIDEL_FAMILIES.map((fam, idx) => (
            <button
              key={fam[0]}
              type="button"
              onClick={() => {
                setActiveFamilyIdx(idx);
                onInsert(fam[0]);
              }}
              className={`p-2.5 rounded-xl font-bold text-base border transition-all ${
                activeFamilyIdx === idx
                  ? "bg-amber-600 border-amber-400 text-white"
                  : "bg-stone-800/80 border-stone-700 text-stone-200 hover:bg-stone-700 hover:text-amber-200"
              }`}
            >
              {fam[0]}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-stone-800 text-xs text-stone-400">
          <span>Space and backspace:</span>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => onInsert(" ")}
              className="px-4 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-white"
            >
              Space
            </button>
            <button
              type="button"
              onClick={() => onInsert("__backspace__")}
              className="px-4 py-1 rounded-lg bg-rose-900/60 border border-rose-600/40 hover:bg-rose-800 text-white"
            >
              ⌫ Backspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
