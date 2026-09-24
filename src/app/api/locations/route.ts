import { NextRequest, NextResponse } from "next/server";
import { getEthiopianLocationDataset, getEthiopianLocationById } from "@/lib/location/ethiopiaLocations";

export async function GET(request: NextRequest) {
  try {
    const region = request.nextUrl.searchParams.get("region")?.trim();
    const id = request.nextUrl.searchParams.get("id")?.trim();

    const dataset = getEthiopianLocationDataset();
    const filtered = region
      ? dataset.filter((location) => location.region.toLowerCase() === region.toLowerCase())
      : id
        ? dataset.filter((location) => location.id === id || location.name.toLowerCase() === id.toLowerCase())
        : dataset;

    const selected = id ? getEthiopianLocationById(id) : undefined;

    return NextResponse.json({
      success: true,
      count: filtered.length,
      totalLocations: dataset.length,
      requestedId: id ?? null,
      requestedRegion: region ?? null,
      selectedLocation: selected ?? null,
      data: filtered,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Location dataset is temporarily unavailable.",
    }, { status: 503 });
  }
}
