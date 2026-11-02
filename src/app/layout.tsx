import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "../components/shell/Navbar";
import Footer from "../components/shell/Footer";
import ClientProviders from "../components/shell/ClientProviders";
import PwaRegister from "../components/shell/PwaRegister";
import AuthGate from "../components/shell/AuthGate";
import { ToolUsageTracker } from "@/features/toolkit/ToolUsageTracker";
import "../styles/globals.css";
import { withBasePath } from "@/lib/base-path";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.wisdomcourse.com.et"),
  title: {
    default: "Ethiopian Wisdom Atlas | Heritage, ritual memory, and evidence-aware care",
    template: "%s | Ethiopian Wisdom Atlas",
  },
  description:
    "A heritage-led Ethiopian wellbeing platform for traditional healers, astrologers, numerologists, and care professionals—blending food wisdom, ritual memory, ecological context, and rigorous evidence for everyday life.",
  applicationName: "Ethiopian Wisdom Atlas",
  manifest: withBasePath("/manifest.webmanifest"),
  icons: {
    icon: [
      { url: withBasePath("/app-icons/icon-192.png"), sizes: "192x192", type: "image/png" },
      { url: withBasePath("/app-icons/icon-512.png"), sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: withBasePath("/app-icons/apple-touch-icon.png"), sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: "Ethiopian Wellness", statusBarStyle: "default" },
  keywords: [
    "Ethiopian wisdom",
    "wellness platform",
    "traditional medicine",
    "cultural care",
    "food knowledge",
    "heritage wellbeing",
    "Ethiopian nutrition",
  ],
  authors: [{ name: "Ethiopian Wisdom Atlas" }],
  openGraph: {
    title: "Ethiopian Wisdom Atlas",
    description: "Living cultural and traditional knowledge for wellbeing, safety, and context-aware guidance.",
    url: "https://app.wisdomcourse.com.et",
    siteName: "Ethiopian Wisdom Atlas",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethiopian Wisdom Atlas",
    description: "Cultural knowledge, practical care, and grounded wellbeing guidance.",
  },
  alternates: {
    canonical: "/",
  },
};

/** Mirrors ThemeContext: the stored choice, else the system preference. */
const THEME_SCRIPT = `try{var t=localStorage.getItem("Debtera-theme"),c=localStorage.getItem("Debtera-contrast")==="true",d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches,e=document.documentElement;e.classList.toggle("dark",d);e.classList.toggle("contrast-mode",c)}catch(_){}`;

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7ef" },
    { media: "(prefers-color-scheme: dark)", color: "#16110c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before first paint, so a dark or high-contrast page never flashes light. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body
        className="antialiased min-h-screen flex flex-col justify-between"
        translate="yes"
        suppressHydrationWarning
      >
        <ClientProviders>
          <PwaRegister />
          <Navbar />
          <ToolUsageTracker />
          <main className="flex-grow relative z-10">
            <Suspense
              fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-brand" />
                </div>
              }
            >
              <AuthGate>{children}</AuthGate>
            </Suspense>
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
