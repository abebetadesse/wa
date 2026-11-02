import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger";

const tones: Record<Tone, { classes: string; icon: typeof Info }> = {
  info: { classes: "border-info/30 bg-info-soft text-foreground", icon: Info },
  success: { classes: "border-success/30 bg-success-soft text-foreground", icon: CheckCircle2 },
  warning: { classes: "border-warning/35 bg-warning-soft text-foreground", icon: AlertTriangle },
  danger: { classes: "border-danger/35 bg-danger-soft text-foreground", icon: ShieldAlert },
};

export function Alert({ tone = "info", title, children, className }: { tone?: Tone; title?: ReactNode; children?: ReactNode; className?: string }) {
  const { classes, icon: Icon } = tones[tone];
  return (
    <div role={tone === "danger" || tone === "warning" ? "alert" : "status"} className={cn("flex gap-3 rounded-2xl border p-4", classes, className)}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-info")} aria-hidden="true" />
      <div className="flex flex-col gap-1 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-soft">{children}</div>}
      </div>
    </div>
  );
}
