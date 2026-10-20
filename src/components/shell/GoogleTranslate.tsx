"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { translationEngine } from "@/lib/i18n/engine";
import type { Language } from "@/lib/i18n/translations";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
          elementId: string,
        ) => unknown;
      };
    };
  }
}

// Amharic comes from the local phrase catalogue (LocalTranslate) and English is the source text.
// Oromo, Tigrinya and Somali use their local catalogues on the routes those cover, and Google
// Translate elsewhere — never on private pages (see translationEngine in src/lib/i18n/engine.ts).
const LANGUAGES: Language[] = ["om", "ti", "so"];
const LANGUAGE_CHANGE_EVENT = "ethio:language-change";

function isGoogleLanguage(value: unknown): value is Language {
  return (
    typeof value === "string" &&
    LANGUAGES.some((language) => language === value) &&
    translationEngine(value, window.location.pathname) === "google"
  );
}

/** Stops Google from translating anything more on this page (it skips "notranslate" content). */
function shieldPage() {
  for (const element of [document.documentElement, document.body]) {
    if (!element) continue;
    element.classList.add("notranslate");
    element.setAttribute("translate", "no");
  }
}

function readLanguage(): Language | null {
  const stored = window.localStorage.getItem("ethio_lang");
  return isGoogleLanguage(stored) ? stored : null;
}

function clearGoogleCookie() {
  const host = window.location.hostname;
  for (const domain of ["", `;domain=${host}`, `;domain=.${host}`]) {
    document.cookie = `googtrans=;path=/;max-age=0${domain}`;
  }
}

function applyLanguage(language: Language | null, refresh = false) {
  if (!language) return;
  document.cookie = `googtrans=/en/${language};path=/;max-age=31536000;SameSite=Lax`;
  const selector = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (selector && (refresh || selector.value !== language)) {
    selector.value = language;
    selector.dispatchEvent(new Event("change", { bubbles: true }));
  }
  document.documentElement.lang = language;
}

function isGoogleTranslateNode(node: Node) {
  if (!(node instanceof Element)) return false;
  return node.matches(
    'font[style*="vertical-align"], .skiptranslate, [class*="goog-te"], [class*="VIpgJd"]',
  );
}

function isApplicationContentMutation(mutation: MutationRecord) {
  const target =
    mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
  if (
    target?.closest(
      '#google_translate_element, .skiptranslate, iframe, script, style, font[style*="vertical-align"]',
    )
  ) {
    return false;
  }

  if (
    mutation.type === "childList" &&
    mutation.addedNodes.length > 0 &&
    Array.from(mutation.addedNodes).every(isGoogleTranslateNode)
  ) {
    return false;
  }

  return true;
}

export default function GoogleTranslate() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const remote = translationEngine(language, pathname) === "google";
  const wasRemote = useRef(false);
  const contentObserver = useRef<MutationObserver | null>(null);
  const refreshTimeout = useRef<number | null>(null);
  const initialize = useCallback(() => {
    const TranslateElement = window.google?.translate?.TranslateElement;
    const host = document.getElementById("google_translate_element");
    if (!TranslateElement || !host || host.dataset.initialized === "true") return;

    applyLanguage(readLanguage());
    new TranslateElement(
      { pageLanguage: "en", includedLanguages: LANGUAGES.join(","), autoDisplay: false },
      "google_translate_element",
    );
    host.dataset.initialized = "true";

    const applyWhenReady = () => {
      if (!host.querySelector(".goog-te-combo")) return false;
      applyLanguage(readLanguage());
      if (!contentObserver.current && document.body) {
        contentObserver.current = new MutationObserver((mutations) => {
          if (!mutations.some(isApplicationContentMutation)) return;
          if (refreshTimeout.current !== null) {
            window.clearTimeout(refreshTimeout.current);
          }
          refreshTimeout.current = window.setTimeout(() => {
            refreshTimeout.current = null;
            applyLanguage(readLanguage(), true);
          }, 200);
        });
        contentObserver.current.observe(document.body, {
          childList: true,
          characterData: true,
          subtree: true,
        });
      }
      return true;
    };
    if (!applyWhenReady()) {
      let timeout: number;
      const observer = new MutationObserver(() => {
        if (applyWhenReady()) {
          observer.disconnect();
          window.clearTimeout(timeout);
        }
      });
      observer.observe(host, { childList: true, subtree: true });
      timeout = window.setTimeout(() => observer.disconnect(), 10_000);
    }
  }, []);

  // A layout effect runs right after React writes the new page and before Google's own observer
  // sees it, so a private page reached from a Google-translated one is shielded before any of its
  // text can be sent.
  useLayoutEffect(() => {
    if (remote) {
      wasRemote.current = true;
      return;
    }
    clearGoogleCookie();
    if (!wasRemote.current) return;
    shieldPage();
    contentObserver.current?.disconnect();
    contentObserver.current = null;
    // Google rewrote the page in place; a reload is the reliable way back to the source text.
    window.location.reload();
  }, [remote]);

  // While Google is active, links to pages it must not translate open with a full page load, so
  // their content is never rendered under Google's translator at all.
  useEffect(() => {
    if (!remote) return;
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || (anchor.target && anchor.target !== "_self")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || translationEngine(language, url.pathname) === "google") return;
      event.preventDefault();
      clearGoogleCookie();
      shieldPage();
      window.location.assign(url.href);
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [remote, language]);

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const next: unknown = (event as CustomEvent<unknown>).detail;
      if (isGoogleLanguage(next)) applyLanguage(next);
    };
    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    return () => window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
  }, []);

  useEffect(
    () => () => {
      contentObserver.current?.disconnect();
      contentObserver.current = null;
      if (refreshTimeout.current !== null) {
        window.clearTimeout(refreshTimeout.current);
        refreshTimeout.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    if (!remote) return;
    const timeout = window.setTimeout(() => applyLanguage(readLanguage(), true), 0);
    return () => window.clearTimeout(timeout);
  }, [pathname, remote]);

  if (!remote) return null;

  return (
    <>
      <div id="google_translate_element" className="notranslate" aria-hidden="true" />
      <Script
        src="https://translate.google.com/translate_a/element.js"
        strategy="afterInteractive"
        onReady={initialize}
        onError={() => {
          // Gracefully ignore script load failure (e.g. adblocker, strict CSP, or offline)
          console.warn("[GoogleTranslate] Script could not be loaded; continuing without auto-translation.");
        }}
      />
    </>
  );
}
