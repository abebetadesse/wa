"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker?.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(async (registration) => {
          console.log("[PWA] Service worker registered:", registration.scope);

          // Request background sync for knowledge base on first load
          if ("sync" in registration) {
            try {
              await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register("sync-knowledge");
              console.log("[PWA] Background sync registered: sync-knowledge");
            } catch {
              console.warn("[PWA] Background sync not supported");
            }
          }
        })
        .catch((error) => {
          console.error("[PWA] Service worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
