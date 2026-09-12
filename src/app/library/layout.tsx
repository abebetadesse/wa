import Link from "next/link";
import type { ReactNode } from "react";

export default function LibraryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="app-container py-6 md:py-8">
        <nav aria-label="Library breadcrumb" className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-400">
          <Link href="/" className="transition hover:text-amber-300">
            Home
          </Link>
          <span>/</span>
          <span className="text-amber-300">Library</span>
        </nav>
        {children}
      </div>
    </div>
  );
}
