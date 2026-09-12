"use client";

import { LanguageProvider } from "@/lib/i18n/context";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
}
