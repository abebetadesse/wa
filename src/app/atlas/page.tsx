import type { Metadata } from "next";
import type { RegionData } from "@/app/api/atlas/route";
import { getEthiopianAdministrativeHierarchy } from "@/lib/location/ethiopianAdministrativePlaces";
import AtlasClient from "./AtlasClient";

export const metadata: Metadata = {
  title: "Ethiopian Wellbeing Nutrition Atlas | Regional health Statistics",
  description:
    "Interactive map of nutritional status, deficiency rates, and traditional medicine usage across all Ethiopian regions, based on EPHI DHS 2019 data.",
};

async function getAtlasData(): Promise<{ regions: RegionData[] }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:5500"}/api/atlas`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    throw new Error(`Atlas data request failed with status ${res.status}`);
  }
  return res.json();
}

export default async function AtlasPage() {
  const { regions } = await getAtlasData();
  const administrativeRegions = getEthiopianAdministrativeHierarchy();
  return <AtlasClient regions={regions} administrativeRegions={administrativeRegions} />;
}
