"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/context";
import type { Language } from "@/lib/i18n/translations";
import { isLocalLanguage } from "./LocalTranslate";

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

// Amharic comes from the local phrase catalogue (LocalTranslate) and English is the source text,
// so Google Translate is only loaded for the languages that have no local catalogue yet.
const LANGUAGES: Language[] = ["om", "ti", "so"];
const LANGUAGE_CHANGE_EVENT = "ethio:language-change";

function isGoogleLanguage(value: unknown): value is Language {
  return typeof value === "string" && LANGUAGES.some((language) => language === value) && !isLocalLanguage(value);
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
  const remote = isGoogleLanguage(language);
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

  useEffect(() => {
    if (remote) {
      wasRemote.current = true;
      return;
    }
    clearGoogleCookie();
    // Google rewrote the page in place; a reload is the reliable way back to the source text.
    if (wasRemote.current) window.location.reload();
  }, [remote]);

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
