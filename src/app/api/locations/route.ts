import { NextRequest, NextResponse } from "next/server";
import {
  ETHIOPIAN_REGION_REFERENCE,
  getEthiopianLocationDataset,
  getEthiopianLocationById,
} from "@/lib/location/ethiopiaLocations";
import {
  ETHIOPIAN_ADMINISTRATIVE_PLACES,
  searchEthiopianAdministrativePlaces,
} from "@/lib/location/ethiopianAdministrativePlaces";

export async function GET(request: NextRequest) {
  try {
    const region = request.nextUrl.searchParams.get("region")?.trim();
    const id = request.nextUrl.searchParams.get("id")?.trim();
    const zone = request.nextUrl.searchParams.get("zone")?.trim();
    const town = request.nextUrl.searchParams.get("town")?.trim();
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? town ?? "";

    const dataset = getEthiopianLocationDataset();
    const filtered = region
      ? dataset.filter((location) => location.region.toLowerCase() === region.toLowerCase())
      : id
        ? dataset.filter((location) => location.id === id || location.name.toLowerCase() === id.toLowerCase())
        : dataset;

    const selected = id
      ? getEthiopianLocationById(id) || dataset.find((location) =>
        [location.name, ...location.aliases].some((value) => value.toLowerCase() === id.toLowerCase()),
      )
      : undefined;
    const administrativePlaces = searchEthiopianAdministrativePlaces(query, region, zone);
    const selectedAdministrativePlace = id
      ? ETHIOPIAN_ADMINISTRATIVE_PLACES.find((place) =>
        place.id.toLowerCase() === id.toLowerCase() ||
        [place.town, `${place.zone}, ${place.town}`].some((value) => value.toLowerCase() === id.toLowerCase()),
      ) ?? null
      : administrativePlaces.length === 1 ? administrativePlaces[0] : null;
    const requestedRegionReference = region ?? selected?.region ?? id;
    const norm = (s: string) => s.toLowerCase().replace(/[\s\-_]/g, "");
    const regionReference = requestedRegionReference
      ? ETHIOPIAN_REGION_REFERENCE.find((entry) =>
        [entry.name, entry.code].some((value) => {
          const l1 = value.toLowerCase();
          const l2 = requestedRegionReference.toLowerCase();
          return l1 === l2 || norm(l1) === norm(l2) || l1.includes(l2) || l2.includes(l1);
        }),
      ) ?? null
      : null;

    return NextResponse.json({
      success: true,
      count: filtered.length,
      totalLocations: dataset.length,
      requestedId: id ?? null,
      requestedRegion: region ?? null,
      requestedZone: zone ?? null,
      requestedTown: town ?? null,
      selectedLocation: selected ?? null,
      selectedAdministrativePlace,
      administrativePlaces,
      totalAdministrativePlaces: ETHIOPIAN_ADMINISTRATIVE_PLACES.length,
      regionReference,
      regionReferences: ETHIOPIAN_REGION_REFERENCE,
      data: filtered,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Location dataset is temporarily unavailable.",
    }, { status: 503 });
  }
}
