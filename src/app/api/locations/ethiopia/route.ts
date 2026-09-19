import { NextResponse } from "next/server";
import { getEthiopianLocationOptions } from "@/lib/location/ethiopiaLocations";

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  return NextResponse.json({
    success: true,
    country: "Ethiopia",
    dataLabel: "indicative_planning_estimate",
    note: "Location disease, demographic, anthropometric, birth-defect, polygamy, inherited-condition, ecological, agricultural, industrial, urbanization, food-system, traditional-medicine, heritage, cultural, pesticide, insecticide, and composition indicators are population-level or descriptive planning references and should not be used as individual diagnosis, nutritional assessment, genetic screening, residue compliance, or official surveillance reporting.",
    locations: getEthiopianLocationOptions(),
  }, {
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
  });
}
