import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { BodyReadingNavTabs } from "./BodyReadingNavTabs";

export const metadata: Metadata = {
  title: "Body-Sign Readings | Hexacore Practitioner Tools",
  description:
    "Tongue, palm and face readings offered as reflective cultural knowledge. Not a medical diagnosis. Ethiopian Wisdom Platform.",
};

export default function BodyReadingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* ── Disclaimer Banner ─────────────────────────────────────── */}
      <div className="border-b border-amber-900/40 bg-amber-950/30 px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-[11px] text-amber-300/80">
          <AlertTriangle className="size-3.5 shrink-0 text-amber-500" aria-hidden="true" />
          <span>
            Body-sign readings are reflective and educational tools rooted in Ethiopian cultural tradition.
            They are <strong>not</strong> a medical diagnosis, substitute for urgent care, or forensic assessment.
          </span>
        </div>
      </div>

      {/* ── Tab Navigation ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md px-4">
        <BodyReadingNavTabs />
      </nav>

      <main>{children}</main>
    </div>
  );
}
