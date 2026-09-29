"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSession } from "@/features/session/SessionProvider";

export interface RealtimeEvent {
  id: number;
  channel: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

type Listener = (event: RealtimeEvent) => void;
export type ConnectionState = "offline" | "connecting" | "live";

interface RealtimeValue {
  state: ConnectionState;
  subscribe: (listener: Listener) => () => void;
}

const RealtimeContext = createContext<RealtimeValue | null>(null);

/**
 * One EventSource per tab while signed in. EventSource reconnects on its own and sends
 * Last-Event-ID, so the server replays anything missed while offline.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const listeners = useRef(new Set<Listener>());
  const [state, setState] = useState<ConnectionState>("offline");

  useEffect(() => {
    if (!user || typeof EventSource === "undefined") {
      setState("offline");
      return;
    }
    setState("connecting");
    const source = new EventSource("/api/realtime", { withCredentials: true });
    source.onopen = () => setState("live");
    source.onerror = () => setState(source.readyState === EventSource.CLOSED ? "offline" : "connecting");
    source.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as RealtimeEvent;
        for (const listener of listeners.current) listener(event);
      } catch {
        // ignore malformed frames
      }
    };
    return () => {
      source.close();
      setState("offline");
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<RealtimeValue>(
    () => ({
      state,
      subscribe(listener) {
        listeners.current.add(listener);
        return () => listeners.current.delete(listener);
      },
    }),
    [state],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeState() {
  return useContext(RealtimeContext)?.state ?? "offline";
}

/**
 * Calls `handler` for realtime events whose type matches (exact, or prefix ending in ".").
 * Example: useRealtime(["booking.", "payment."], () => reload()).
 */
export function useRealtime(types: string[] | null, handler: (event: RealtimeEvent) => void) {
  const context = useContext(RealtimeContext);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const key = types?.join("|") ?? "*";

  useEffect(() => {
    if (!context) return;
    const matchers = types;
    return context.subscribe((event) => {
      if (!matchers || matchers.some((type) => (type.endsWith(".") ? event.type.startsWith(type) : event.type === type))) handlerRef.current(event);
    });
  }, [context, key]); // eslint-disable-line react-hooks/exhaustive-deps
}
