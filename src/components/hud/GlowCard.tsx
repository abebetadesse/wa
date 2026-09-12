import type { ReactNode } from "react";

export type GlowCardProps = {
  hover?: "lift" | "tilt" | "sweep";
  children: ReactNode;
  className?: string;
};

export default function GlowCard({ hover = "lift", children, className = "" }: GlowCardProps) {
  return <div className={`glow-card glow-card--${hover} ${className}`.trim()}>{children}</div>;
}
