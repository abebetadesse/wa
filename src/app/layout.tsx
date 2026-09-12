import type { Metadata } from "next";
import { Suspense } from "react";
import "../styles/globals.css";
import "../styles/tokens.css";
import "../styles/hud-effects.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ClientProviders from "../components/ClientProviders";
import PwaRegister from "../components/PwaRegister";
import AuthGate from "../components/AuthGate";
import GlobalLayers from "../components/layout/GlobalLayers";
import BootSequence from "../components/layout/BootSequence";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ethio-wellness.example"),
  title: {
    default: "Ethiopian Wisdom & Wellness Platform | Precision Nutrition & Safety",
    template: "%s | Ethiopian Wisdom Platform",
  },
  description:
    "Enterprise-grade health gap evaluation platform combining Ethiopian food composition data (EFCT), traditional medicine safety checks (ETM-DB), and cultural personalization.",
  applicationName: "Ethiopian Wisdom Platform",
  manifest: "/manifest.webmanifest",
  keywords: [
    "Ethiopian health",
    "wellness platform",
    "nutrition safety",
    "traditional medicine",
    "clinical intelligence",
    "AI health analytics",
    "cultural nutrition",
  ],
  authors: [{ name: "Ethiopian Wisdom Platform" }],
  openGraph: {
    title: "Ethiopian Wisdom & Wellness Platform",
    description: "Enterprise-grade health gap evaluation platform for nutrition, safety, and culturally-aware wellness planning.",
    url: "https://www.ethio-wellness.example",
    siteName: "Ethiopian Wisdom Platform",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethiopian Wisdom & Wellness Platform",
    description: "Precision nutrition, safety intelligence, and personalized wellness pathways grounded in evidence and tradition.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col justify-between" suppressHydrationWarning>
        <GlobalLayers />
        <ClientProviders>
          <PwaRegister />
          <BootSequence />
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="flex-grow relative z-10">
            <Suspense
              fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
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

