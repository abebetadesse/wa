import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "brand" | "gold" | "success" | "warning" | "danger" | "info" | "plum";

const tones: Record<BadgeTone, string> = {
  neutral: "border-border bg-muted text-soft",
  brand: "border-brand/30 bg-brand-soft text-brand-strong",
  gold: "border-gold/35 bg-gold-soft text-gold-strong",
  success: "border-success/30 bg-success-soft text-success-strong",
  warning: "border-warning/30 bg-warning-soft text-warning-strong",
  danger: "border-danger/30 bg-danger-soft text-danger-strong",
  info: "border-info/30 bg-info-soft text-info-strong",
  plum: "border-plum/30 bg-plum-soft text-plum-strong",
};

export function Badge({ className, tone = "brand", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}
      {...props}
    />
  );
}
