import type { ReactNode } from "react";
import { Loader2, RefreshCw, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function LoadingState({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex min-h-40 flex-col items-center justify-center gap-3 text-muted-foreground", className)}>
      <Loader2 className="size-6 animate-spin text-brand" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ title, description, action, className }: { title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center", className)}>
      <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="font-display font-bold text-foreground">{title}</p>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-8 text-center", className)}>
      <p className="font-semibold text-foreground">Something went wrong</p>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" /> Try again
        </Button>
      )}
    </div>
  );
}
