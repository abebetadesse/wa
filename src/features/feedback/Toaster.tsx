"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "error";
interface Toast {
  id: number;
  tone: Tone;
  title: string;
  body?: string;
  href?: string;
}

const ToastContext = createContext<((toast: Omit<Toast, "id">) => void) | null>(null);
const DURATION = 6000;

export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const push = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current.slice(-3), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss],
  );
  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[10000] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = toast.tone === "success" ? CheckCircle2 : toast.tone === "error" ? XCircle : Bell;
            const content = (
              <>
                <Icon className={cn("mt-0.5 size-5 shrink-0", toast.tone === "success" ? "text-success" : toast.tone === "error" ? "text-danger" : "text-brand")} aria-hidden="true" />
                <span className="flex min-w-0 flex-col">
                  <span className="font-semibold text-foreground">{toast.title}</span>
                  {toast.body && <span className="truncate text-muted-foreground">{toast.body}</span>}
                </span>
              </>
            );
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40 }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm shadow-xl backdrop-blur-xl"
              >
                {toast.href ? (
                  <Link href={toast.href} className="flex min-w-0 flex-1 items-start gap-3" onClick={() => dismiss(toast.id)}>
                    {content}
                  </Link>
                ) : (
                  <div className="flex min-w-0 flex-1 items-start gap-3">{content}</div>
                )}
                <button type="button" onClick={() => dismiss(toast.id)} className="rounded-full p-1 text-muted-foreground hover:text-foreground" aria-label="Dismiss">
                  <X className="size-4" aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const push = useContext(ToastContext);
  if (!push) throw new Error("useToast must be used inside Toaster");
  return push;
}
