import type { Metadata } from "next";
import type { RegionData } from "@/app/api/atlas/route";
import AtlasClient from "./AtlasClient";

export const metadata: Metadata = {
  title: "Ethiopian health Nutrition Atlas | Regional health Statistics",
  description:
    "Interactive map of nutritional status, deficiency rates, and traditional medicine usage across all Ethiopian regions, based on EPHI DHS 2019 data.",
};

export const dynamic = "force-static";
export const revalidate = 86400;

async function getAtlasData(): Promise<{ regions: RegionData[] }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:5500"}/api/atlas`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) return res.json();
  } catch {
    // Fallback handled in client
  }
  return { regions: [] };
}

export default async function AtlasPage() {
  const { regions } = await getAtlasData();
  return <AtlasClient regions={regions} />;
}
