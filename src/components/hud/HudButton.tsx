import type { ButtonHTMLAttributes, ReactNode } from "react";
import React from "react";

export type HudButtonVariant = "primary" | "outline" | "danger" | "ghost";
export type HudButtonSize = "sm" | "md" | "lg";

type HudButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: HudButtonVariant;
  size?: HudButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children: ReactNode;
};

export default function HudButton({
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  children,
  className = "",
  ...props
}: HudButtonProps) {
  return (
    <button
      type={props.type ?? "button"}
      className={`hud-button hud-button--${variant} hud-button--${size} hud-button-shine ${className}`.trim()}
      {...props}
    >
      {leadingIcon ? <span className="hud-button__icon">{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? <span className="hud-button__icon">{trailingIcon}</span> : null}
    </button>
  );
}
