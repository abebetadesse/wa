import { NextRequest, NextResponse } from "next/server";
import {
  ETHIOPIAN_LOCATIONS,
  ETHIOPIAN_REGION_REFERENCE,
  getEthiopianLocationDataset,
  getEthiopianLocationById,
  resolveEthiopianLocation,
} from "@/lib/location/ethiopiaLocations";
import { searchEthiopianPlaces } from "@/lib/location/ethiopianPlacesSearch";
import {
  ETHIOPIAN_ADMINISTRATIVE_PLACES,
  searchEthiopianAdministrativePlaces,
} from "@/lib/location/ethiopianAdministrativePlaces";

/**
 * Place suggestions for the location field (fields=places): a few matches with an altitude
 * estimate, without the full dataset this route otherwise returns. Public reference data, cached.
 */
function placeSuggestions(query: string, limitParam: string | null) {
  const limit = Math.min(Math.max(Number(limitParam) || 8, 1), 25);
  const data = searchEthiopianPlaces(query, limit).map((place) => {
    const known = ETHIOPIAN_LOCATIONS.find((entry) => entry.name.toLocaleLowerCase() === place.town.toLocaleLowerCase());
    return {
      id: place.id,
      town: place.town,
      zone: place.zone,
      region: place.region,
      altitudeMeters: known?.altitudeMeters ?? resolveEthiopianLocation(place.region).altitudeMeters ?? null,
    };
  });
  return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "public, max-age=86400" } });
}

export async function GET(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.get("fields") === "places") {
      return placeSuggestions(request.nextUrl.searchParams.get("q")?.trim() ?? "", request.nextUrl.searchParams.get("limit"));
    }
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
