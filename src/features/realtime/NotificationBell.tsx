"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/features/feedback/Toaster";
import { useRealtime, useRealtimeState } from "./RealtimeProvider";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

const relative = (iso: string) => {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString();
};

export function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const live = useRealtimeState();

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ items: Notification[]; unread: number }>("/api/notifications");
      setItems(data.items);
      setUnread(data.unread);
    } catch {
      // Signed out or offline: the bell simply stays empty.
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtime(["notification"], (event) => {
    const payload = event.payload as unknown as Notification;
    setItems((current) => [{ ...payload, readAt: null, body: payload.body ?? null, href: payload.href ?? null }, ...current.filter((item) => item.id !== payload.id)].slice(0, 30));
    setUnread((count) => count + 1);
    toast({ tone: "info", title: payload.title, body: payload.body ?? undefined, href: payload.href ?? undefined });
  });

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function markAllRead() {
    const data = await apiFetch<{ items: Notification[]; unread: number }>("/api/notifications", { method: "POST", json: {} });
    setItems(data.items);
    setUnread(data.unread);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
      >
        <Bell className="size-5" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-4 text-inverse-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
        <span
          className={cn("absolute bottom-1.5 right-1.5 size-2 rounded-full ring-2 ring-background", live === "live" ? "bg-success" : live === "connecting" ? "bg-warning" : "bg-muted-foreground/40")}
          title={live === "live" ? "Live updates on" : live === "connecting" ? "Reconnecting…" : "Live updates off"}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-display font-bold text-foreground">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                <CheckCheck className="size-3.5" aria-hidden="true" /> Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-10 text-center text-sm text-muted-foreground">You&apos;re all caught up.</li>}
            {items.map((item) => {
              const content = (
                <span className="flex gap-3">
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", item.readAt ? "bg-transparent" : "bg-brand")} aria-hidden="true" />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold text-foreground">{item.title}</span>
                    {item.body && <span className="line-clamp-2 text-xs text-muted-foreground">{item.body}</span>}
                    <span className="mt-0.5 text-[11px] text-muted-foreground">{relative(item.createdAt)}</span>
                  </span>
                </span>
              );
              return (
                <li key={item.id} className="border-b border-border/60 last:border-0">
                  {item.href ? (
                    <Link href={item.href} onClick={() => setOpen(false)} className="block px-4 py-3 hover:bg-accent">
                      {content}
                    </Link>
                  ) : (
                    <div className="px-4 py-3">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
