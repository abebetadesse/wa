import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "brand" | "gold" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  brand: "border-brand/30 bg-brand/10 text-brand-strong",
  gold: "border-gold/35 bg-gold/15 text-gold",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

export function Badge({ className, tone = "brand", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}
      {...props}
    />
  );
}
