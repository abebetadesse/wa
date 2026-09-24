import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageShell({ className, children, width = "default" }: { className?: string; children: ReactNode; width?: "narrow" | "default" | "wide" }) {
  const max = width === "narrow" ? "max-w-3xl" : width === "wide" ? "max-w-7xl" : "max-w-5xl";
  return <div className={cn("mx-auto w-full px-4 py-8 sm:px-6 sm:py-12", max, className)}>{children}</div>;
}

export function PageHeader({ eyebrow, title, description, actions, className }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <header className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex flex-col gap-2">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-base text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
