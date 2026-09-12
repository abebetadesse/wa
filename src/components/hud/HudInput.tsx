import type { InputHTMLAttributes } from "react";

type HudInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: React.ReactNode;
};

export default function HudInput({ label, icon, ...props }: HudInputProps) {
  return (
    <label className="hud-input-shell">
      <span className="hud-input-label">{label}</span>
      <div className="hud-input-wrap">
        {icon ? <span className="hud-input-icon">{icon}</span> : null}
        <input className="hud-input" {...props} />
      </div>
    </label>
  );
}
