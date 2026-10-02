import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Hexacore Arcana: 14-Layer Ethiopian Wisdom | Natal Dossier & Botanical Readings",
  description:
    "Unlock your complete 14-layer Hexacore natal dossier — 6-based numerology, 2,016 frequencies, personal solfeggio tone, and certified Ethiopian botanical formulations. Bilingual (English & Amharic). 450 ETB / $14.99 USD.",
  openGraph: {
    title: "Hexacore Arcana — Complete Ethiopian Traditional Wisdom Reading",
    description: "14-layer natal arcana dossier, Debtera sessions, and certified botanical prescriptions.",
    type: "website",
  },
};

export default function HexacoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
