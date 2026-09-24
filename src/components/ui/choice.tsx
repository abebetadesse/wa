"use client";

import { cn } from "@/lib/utils";

export interface ChoiceOption {
  value: string;
  label: string;
  hint?: string;
}

/** Accessible single-choice group rendered as selectable cards. */
export function ChoiceGroup({
  name,
  legend,
  options,
  value,
  onChange,
  required,
  columns = 2,
}: {
  name: string;
  legend: string;
  options: ChoiceOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  required?: boolean;
  columns?: 1 | 2;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-semibold text-foreground">
        {legend}
        {required && <span className="ml-1 text-danger" aria-hidden="true">*</span>}
      </legend>
      <div className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2")}>
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                checked ? "border-brand bg-brand/10 text-foreground" : "border-border bg-card text-muted-foreground hover:border-input",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                required={required}
                onChange={() => onChange(option.value)}
                className="mt-0.5 size-4 accent-[var(--brand-accent)]"
              />
              <span className="flex flex-col">
                <span className={cn("font-medium", checked && "text-foreground")}>{option.label}</span>
                {option.hint && <span className="text-xs text-muted-foreground">{option.hint}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
