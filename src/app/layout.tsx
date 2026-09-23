import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "../components/shell/Navbar";
import Footer from "../components/shell/Footer";
import ClientProviders from "../components/shell/ClientProviders";
import PwaRegister from "../components/shell/PwaRegister";
import AuthGate from "../components/shell/AuthGate";
import GlobalLayers from "../components/layout/GlobalLayers";
import "../styles/globals.css";
import "../styles/hud-effects.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ethio-wellness.example"),
  title: {
    default: "Ethiopian Wisdom Atlas | Heritage, ritual memory, and evidence-aware care",
    template: "%s | Ethiopian Wisdom Atlas",
  },
  description:
    "A heritage-led Ethiopian wellbeing platform for traditional healers, astrologers, numerologists, and care professionals—blending food wisdom, ritual memory, ecological context, and rigorous evidence for everyday life.",
  applicationName: "Ethiopian Wisdom Atlas",
  manifest: "/manifest.webmanifest",
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
    url: "https://www.ethio-wellness.example",
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
          <Navbar />
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
