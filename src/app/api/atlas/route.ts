import { NextResponse } from "next/server";
import { getAtlasRegions } from "@/lib/location/atlas";


export async function GET() {
  const regions = getAtlasRegions();
  return NextResponse.json(
    {
      regions,
      dataSource: "EPHI DHS 2019 / MiNDO Survey / WHO SEARO",
      lastUpdated: "2025-01-01",
      disclaimer:
        "Nutritional prevalence and location systems data are population-level planning references. Individual assessments require the full 5-stage evaluation pipeline; ecological and food-system fields should be locally verified.",
    },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    }
  );
}
