import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const controlClasses =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClasses, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClasses, "min-h-28", className)} {...props} />;
}
