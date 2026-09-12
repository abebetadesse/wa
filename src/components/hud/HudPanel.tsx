import type { ReactNode } from "react";

export type HudPanelProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  corner?: boolean;
  status?: "online" | "warning" | "critical" | "idle";
  className?: string;
};

export default function HudPanel({
  title,
  subtitle,
  children,
  corner = true,
  status,
  className = "",
}: HudPanelProps) {
  return (
    <section className={`hud-panel ${corner ? "hud-corner" : ""} ${className}`.trim()}>
      {(title || subtitle || status) && (
        <div className="hud-panel__header">
          <div>
            {title ? <h3 className="hud-panel__title">{title}</h3> : null}
            {subtitle ? <div className="hud-panel__subtitle">{subtitle}</div> : null}
          </div>
          {status ? <div className={`hud-status hud-status--${status}`}>{status.toUpperCase()}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
