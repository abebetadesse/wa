"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaRegister() {
  const { t } = useLanguage();
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const dismissed = sessionStorage.getItem("pwa-install-dismissed") === "1";
    if (!standalone && !dismissed) {
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      setShowIosHelp(ios);
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstallPrompt(null);
      setShowIosHelp(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    if (process.env.NODE_ENV !== "production") {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
      if (typeof window !== "undefined" && "caches" in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
      return () => {
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("appinstalled", onInstalled);
      };
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
        .catch((error) => console.warn("[pwa] service worker registration failed:", error));

      const idleApi = (window as any).requestIdleCallback;
      if (typeof idleApi === "function") {
        const idleId = idleApi(register, { timeout: 3000 });
        return () => {
          const cancelIdle = (window as any).cancelIdleCallback;
          if (typeof cancelIdle === "function") {
            cancelIdle(idleId);
          }
          window.removeEventListener("beforeinstallprompt", onBeforeInstall);
          window.removeEventListener("appinstalled", onInstalled);
        };
      }

      const timeoutId = window.setTimeout(register, 1500);
      return () => {
        window.clearTimeout(timeoutId);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("appinstalled", onInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (choice.outcome === "dismissed") sessionStorage.setItem("pwa-install-dismissed", "1");
  }

  if (!installPrompt && !showIosHelp) return null;
  return (
    <aside className="fixed inset-x-3 bottom-3 z-[100] mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{t.pwa.installTitle}</p>
        {showIosHelp && !installPrompt ? (
          <p className="mt-1 text-sm text-muted-foreground">{t.pwa.iosHelp}</p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">{t.pwa.installHelp}</p>
        )}
      </div>
      {installPrompt && (
        <button type="button" onClick={() => void install()} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
          {t.pwa.install}
        </button>
      )}
      <button
        type="button"
        aria-label="Dismiss install instructions"
        onClick={() => {
          setInstallPrompt(null);
          setShowIosHelp(false);
          sessionStorage.setItem("pwa-install-dismissed", "1");
        }}
        className="rounded-lg px-2 py-1 text-muted-foreground hover:bg-muted"
      >
        ×
      </button>
    </aside>
  );
}
