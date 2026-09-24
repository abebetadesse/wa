import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

/**
 * Label, hint and error around a single control. The render prop receives the ids to wire up
 * aria-describedby / aria-invalid on the control.
 */
export function Field({
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: (control: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean; required?: boolean }) => ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-danger" aria-hidden="true">*</span>}
      </Label>
      {hint && <p id={hintId} className="text-xs text-muted-foreground">{hint}</p>}
      {children({ id, "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined, "aria-invalid": error ? true : undefined, required })}
      {error && <p id={errorId} role="alert" className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
