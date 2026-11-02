import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "gold";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground shadow-soft hover:bg-brand-strong dark:hover:bg-brand-strong dark:hover:text-brand-foreground",
  secondary: "border border-border bg-secondary text-secondary-foreground hover:bg-sunken",
  outline: "border border-input bg-card text-foreground hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  destructive: "bg-danger text-danger-foreground hover:bg-danger-strong dark:hover:bg-danger-strong",
  gold: "bg-gold-fill text-gold-foreground shadow-soft hover:bg-gold-fill/85",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "size-11",
};

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

type Variants = { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ className, variant, size, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & Variants) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

/** A link styled as a button. Uses next/link for internal paths. */
export function ButtonLink({ className, variant, size, href, ...props }: ComponentProps<typeof Link> & AnchorHTMLAttributes<HTMLAnchorElement> & Variants) {
  return <Link href={href} className={buttonClasses({ variant, size, className })} {...props} />;
}
