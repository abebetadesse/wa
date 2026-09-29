"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthenticatedUser } from "@/lib/auth";
import { AUTH_STATE_CHANGED } from "@/lib/auth/clientEvents";
import { getClientUser, invalidateClientUser } from "@/lib/auth/clientState";

interface SessionValue {
  user: AuthenticatedUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

/** The signed-in user, shared by the whole app and refreshed on auth changes and tab focus. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await getClientUser());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onAuthChange = () => {
      invalidateClientUser();
      void refresh();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener(AUTH_STATE_CHANGED, onAuthChange);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener(AUTH_STATE_CHANGED, onAuthChange);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => null);
    invalidateClientUser();
    setUser(null);
    window.dispatchEvent(new Event(AUTH_STATE_CHANGED));
  }, []);

  const value = useMemo(() => ({ user, loading, refresh, signOut }), [user, loading, refresh, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
}
