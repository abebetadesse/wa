import { NextRequest, NextResponse } from "next/server";
import { getEthiopianLocationDataset, type EthiopianLocationDatasetEntry } from "@/lib/location/ethiopiaLocations";

export async function GET(request: NextRequest) {
  try {
    const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
    const regionParam = request.nextUrl.searchParams.get("region") ?? "";

    const dataset = getEthiopianLocationDataset();
    const locations = idsParam
      ? idsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
          .map((id) => dataset.find((loc) => loc.id === id))
          .filter((location): location is EthiopianLocationDatasetEntry => Boolean(location))
      : regionParam
        ? dataset.filter((location) => location.region.toLowerCase() === regionParam.trim().toLowerCase())
        : dataset;

    const fields = [
      "id",
      "region",
      "name",
      "nameAmharic",
      "altitudeMeters",
      "agroZone",
      "population",
      "urbanPopulationPct",
      "totalFertilityRate",
      "stapleFoods",
      "traditionalMedicines",
    ];

    const csvRows = [
      fields.join(","),
      ...locations.map((location) => [
        location.id,
        location.region,
        location.name,
        location.nameAmharic,
        location.altitudeMeters,
        location.agroZone,
        location.population,
        location.urbanPopulationPct,
        location.totalFertilityRate,
        location.stapleFoods.join(" | "),
        location.traditionalMedicines.join(" | "),
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")),
    ];

    return new NextResponse(csvRows.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ethiopia-locations-${idsParam ? "selected" : regionParam || "all"}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Location CSV export is temporarily unavailable.",
    }, { status: 503 });
  }
}
