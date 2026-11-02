import Link from "next/link";
import type { ReactNode } from "react";

export default function LibraryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="app-container py-6 md:py-8">
        <nav aria-label="Library breadcrumb" className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link href="/" className="transition hover:text-gold">
            Home
          </Link>
          <span>/</span>
          <span className="text-gold">Library</span>
        </nav>
        {children}
      </div>
    </div>
  );
}
