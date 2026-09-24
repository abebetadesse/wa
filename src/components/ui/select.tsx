import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { controlClasses } from "./input";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClasses, "h-11", className)} {...props} />;
}
