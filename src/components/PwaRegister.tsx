"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if ("serviceWorker" in navigator) {
      const register = () => navigator.serviceWorker
        .register("/sw.js")
        .then(async (registration) => {
          if ("sync" in registration) {
            try {
              await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register("sync-knowledge");
            } catch {
              // Background sync is optional.
            }
          }
        })
        .catch(() => undefined);

      const idleApi = (window as any).requestIdleCallback;
      if (typeof idleApi === "function") {
        const idleId = idleApi(register, { timeout: 3000 });
        return () => {
          const cancelIdle = (window as any).cancelIdleCallback;
          if (typeof cancelIdle === "function") {
            cancelIdle(idleId);
          }
        };
      }

      const timeoutId = window.setTimeout(register, 1500);
      return () => window.clearTimeout(timeoutId);
    }
  }, []);

  return null;
}
