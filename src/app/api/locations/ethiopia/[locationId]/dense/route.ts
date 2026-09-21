import { NextResponse } from "next/server";
import { ETHIOPIAN_LOCATIONS } from "@/lib/location/ethiopiaLocations";
import { LOCATION_INDICATORS, validateDenseLocationData } from "@/lib/location/denseLocationData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> },
) {
  const { locationId } = await params;
  const location = ETHIOPIAN_LOCATIONS.find((candidate) => candidate.id === locationId);
  if (!location) {
    return NextResponse.json({ success: false, error: "Ethiopian location not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  const indicator = url.searchParams.get("indicator");
  const asOf = url.searchParams.get("asOf");
  const currentOnly = url.searchParams.get("current") === "true";
  if (asOf && !Number.isFinite(new Date(asOf).getTime())) {
    return NextResponse.json({ success: false, error: "The asOf parameter must be a valid ISO date." }, { status: 400 });
  }
  const observations = location.denseData.observations.filter((observation) => {
    if (indicator && observation.indicatorCode !== indicator) return false;
    if (currentOnly && observation.transactionTo) return false;
    if (!asOf) return true;
    const transactionFrom = new Date(observation.transactionFrom).getTime();
    const transactionTo = observation.transactionTo ? new Date(observation.transactionTo).getTime() : Number.POSITIVE_INFINITY;
    const requestedTime = new Date(asOf).getTime();
    return Number.isFinite(requestedTime) && transactionFrom <= requestedTime && requestedTime < transactionTo;
  });
  const validationFailures = validateDenseLocationData({ ...location.denseData, observations });

  return NextResponse.json({
    success: true,
    locationId,
    data: { ...location.denseData, observations },
    indicatorDictionary: LOCATION_INDICATORS,
    query: { indicator, asOf, currentOnly },
    validation: {
      bitemporal: true,
      uncertaintyFields: true,
      fieldLevelCitations: true,
      missingValuesAreExplicit: true,
      numericRecordsWithoutCitation: observations.filter((observation) => observation.value !== null && !observation.citationUid).length,
      invariantFailures: validationFailures,
    },
    disclaimer: "Dense location data is versioned planning/reference data. Null and not_verified values represent data gaps and must not be replaced with fabricated estimates.",
  }, {
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
  });
}
