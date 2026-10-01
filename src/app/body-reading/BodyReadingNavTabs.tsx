"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/hexacore", label: "Hexacore Arcana", am: "ሄክሳኮር አርካና", emoji: "✦" },
  { href: "/body-reading/tongue", label: "Tongue Reading", am: "የምላስ ንባብ", emoji: "👅" },
  { href: "/body-reading/palm", label: "Palm Reading", am: "የእጅ ንባብ", emoji: "✋" },
  { href: "/body-reading/face", label: "Face Reading & Biometrics", am: "የፊት ንባብ", emoji: "🔬" },
];

export function BodyReadingNavTabs() {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex shrink-0 items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all ${
              isActive
                ? "border-b-2 border-amber-400 text-amber-200 bg-amber-500/10 font-bold"
                : "text-stone-400 hover:text-amber-200 hover:bg-stone-900/40"
            }`}
          >
            <span>{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span lang="am" className="text-xs text-stone-400 sm:hidden">
              {tab.am}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
