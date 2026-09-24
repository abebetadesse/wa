import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger";

const tones: Record<Tone, { classes: string; icon: typeof Info }> = {
  info: { classes: "border-brand/30 bg-brand/10 text-foreground", icon: Info },
  success: { classes: "border-success/30 bg-success/10 text-foreground", icon: CheckCircle2 },
  warning: { classes: "border-warning/40 bg-warning/10 text-foreground", icon: AlertTriangle },
  danger: { classes: "border-danger/40 bg-danger/10 text-foreground", icon: ShieldAlert },
};

export function Alert({ tone = "info", title, children, className }: { tone?: Tone; title?: ReactNode; children?: ReactNode; className?: string }) {
  const { classes, icon: Icon } = tones[tone];
  return (
    <div role={tone === "danger" || tone === "warning" ? "alert" : "status"} className={cn("flex gap-3 rounded-2xl border p-4", classes, className)}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-brand")} aria-hidden="true" />
      <div className="flex flex-col gap-1 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-muted-foreground">{children}</div>}
      </div>
    </div>
  );
}
