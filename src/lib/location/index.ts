import { LocationContext, LocationInput } from "./types";
import { ETHIOPIAN_REGION_PROFILES } from "./ethiopianDatasets";

const locationCache = new Map<string, LocationContext>();

function getCacheKey(input: LocationInput): string {
  if (input.lat !== undefined && input.lng !== undefined && input.source === "gps") {
    return `gps:${input.lat.toFixed(3)},${input.lng.toFixed(3)}`;
  }
  return `manual:${input.region || ""}:${input.zone || ""}:${input.woreda || ""}`;
}

/**
 * Resolves a raw GPS coordinate or administrative name selection into a comprehensive
 * Ethiopian LocationContext.
 *
 * Requirements:
 * - If GPS is unavailable, manual selection produces "confidence: reduced" flag.
 * - Resolves agro-ecological zones, altitude bands, endemic disease profile, and seasonal lean months.
 */
export async function resolveLocation(input: LocationInput): Promise<LocationContext> {
  const cacheKey = getCacheKey(input);
  const cached = locationCache.get(cacheKey);
  if (cached) return cached;

  let regionKey = input.region || "Addis Ababa";
  // Fuzzy match region if entered differently
  const matchingKey = Object.keys(ETHIOPIAN_REGION_PROFILES).find((k) =>
    k.toLowerCase().includes(regionKey.toLowerCase()) || regionKey.toLowerCase().includes(k.toLowerCase())
  );
  if (matchingKey) regionKey = matchingKey;

  const profile = ETHIOPIAN_REGION_PROFILES[regionKey] || ETHIOPIAN_REGION_PROFILES["Addis Ababa"];

  const isGps = Boolean(input.source === "gps" && typeof input.lat === "number" && typeof input.lng === "number");
  const lat = isGps ? (input.lat as number) : profile.lat;
  const lng = isGps ? (input.lng as number) : profile.lng;

  // Determine altitude band from elevation/lat-lng or agroecological zone
  let altitudeBand = profile.altitudeBand;
  let agroEcological = profile.agroEcological;

  // If GPS coordinates provided, refine zone
  if (isGps) {
    if (lat > 11 && lng > 40) {
      agroEcological = "desert";
      altitudeBand = "<1500";
    } else if (lat < 8 && lng > 41) {
      agroEcological = "lowland";
      altitudeBand = "<1500";
    } else if (lat > 11 && lng < 39) {
      agroEcological = "highland";
      altitudeBand = "2300-3200";
    }
  }

  const confidence = isGps ? "high" : "reduced";

  const context: LocationContext = {
    raw: {
      lat,
      lng,
      source: isGps ? "gps" : (input.source || "manual"),
    },
    admin: {
      region: profile.region,
      zone: input.zone || profile.defaultZone,
      woreda: input.woreda || profile.defaultWoreda,
      kebele: input.kebele,
    },
    agroEcological,
    altitudeBand,
    ecosystem: profile.ecosystem,
    watershed: profile.watershed,
    marketAccess: profile.marketAccess,
    endemicDiseases: profile.endemicDiseases,
    foodAvailability: profile.foodAvailability,
    climate: profile.climate,
    confidence,
  };

  locationCache.set(cacheKey, context);
  return context;
}

export * from "./types";
export * from "./ethiopianDatasets";
