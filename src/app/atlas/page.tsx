import type { Metadata } from "next";
import { getAtlasRegions } from "@/lib/location/atlas";
import { getEthiopianAdministrativeHierarchy } from "@/lib/location/ethiopianAdministrativePlaces";
import AtlasClient from "./AtlasClient";

export const metadata: Metadata = {
  title: "Ethiopian Wellbeing Nutrition Atlas | Regional Health Statistics",
  description:
    "Interactive map of nutritional status, deficiency rates, and traditional medicine usage across all Ethiopian regions, based on EPHI DHS 2019 data.",
};

export default function AtlasPage() {
  const regions = getAtlasRegions();
  const administrativeRegions = getEthiopianAdministrativeHierarchy();
  return <AtlasClient regions={regions} administrativeRegions={administrativeRegions} />;
}
