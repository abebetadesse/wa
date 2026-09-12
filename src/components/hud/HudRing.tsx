import type { CSSProperties } from "react";

type HudRingProps = {
  size?: number;
  variant?: "radar" | "progress" | "orbital";
  label?: string;
};

export default function HudRing({ size = 120, variant = "radar", label }: HudRingProps) {
  const style: CSSProperties = { width: size, height: size };

  return (
    <div className={`hud-ring hud-ring--${variant}`} style={style}>
      {label ? <span className="hud-ring__label">{label}</span> : null}
    </div>
  );
}
