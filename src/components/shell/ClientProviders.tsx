"use client";

import { LanguageProvider } from "@/lib/i18n/context";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import { SessionProvider } from "@/features/session/SessionProvider";
import { RealtimeProvider } from "@/features/realtime/RealtimeProvider";
import { Toaster } from "@/features/feedback/Toaster";
import GoogleTranslate from "./GoogleTranslate";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <>
          <GoogleTranslate />
          <SessionProvider>
            <RealtimeProvider>
              <Toaster>{children}</Toaster>
            </RealtimeProvider>
          </SessionProvider>
        </>
      </LanguageProvider>
    </ThemeProvider>
  );
}
