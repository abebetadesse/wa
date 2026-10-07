"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
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

const LANGUAGES: Language[] = ["en", "am", "om", "ti", "so"];
const LANGUAGE_CHANGE_EVENT = "ethio:language-change";

function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && LANGUAGES.some((language) => language === value);
}

function readLanguage(): Language {
  const stored = window.localStorage.getItem("ethio_lang");
  return isLanguage(stored) ? stored : "am";
}

function applyLanguage(language: Language, refresh = false) {
  document.cookie = `googtrans=/en/${language};path=/;max-age=31536000;SameSite=Lax`;
  const selector = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (selector && (refresh || selector.value !== language)) {
    selector.value = language;
    selector.dispatchEvent(new Event("change", { bubbles: true }));
  }
  document.documentElement.lang = language;
}

export default function GoogleTranslate() {
  const pathname = usePathname();
  const initialize = useCallback(() => {
    const TranslateElement = window.google?.translate?.TranslateElement;
    const host = document.getElementById("google_translate_element");
    if (!TranslateElement || !host || host.dataset.initialized === "true") return;

    const language = readLanguage();
    applyLanguage(language);
    new TranslateElement(
      { pageLanguage: "en", includedLanguages: LANGUAGES.join(","), autoDisplay: false },
      "google_translate_element",
    );
    host.dataset.initialized = "true";

    const applyWhenReady = () => {
      if (!host.querySelector(".goog-te-combo")) return false;
      applyLanguage(readLanguage());
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
    const handleLanguageChange = (event: Event) => {
      const language: unknown = (event as CustomEvent<unknown>).detail;
      if (isLanguage(language)) applyLanguage(language);
    };
    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
    return () => window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => applyLanguage(readLanguage(), true), 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      <div id="google_translate_element" aria-hidden="true" />
      <Script
        src="https://translate.google.com/translate_a/element.js"
        strategy="afterInteractive"
        onReady={initialize}
      />
    </>
  );
}
