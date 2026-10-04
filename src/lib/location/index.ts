import { LocationContext, LocationInput } from "./types";
import { ETHIOPIAN_REGION_PROFILES } from "./ethiopianDatasets";

const locationCache = new Map<string, LocationContext>();
const LOCATION_CACHE_LIMIT = 512;

function getCacheKey(input: LocationInput): string {
  if (input.lat !== undefined && input.lng !== undefined && input.source === "gps") {
    return `gps:${input.lat},${input.lng}`;
  }
  return [
    input.source || "manual",
    input.region || "",
    input.zone || "",
    input.woreda || "",
    input.kebele || "",
  ].map((value) => value.trim().toLocaleLowerCase()).join(":");
}

function copyContext(context: LocationContext): LocationContext {
  return {
    ...context,
    raw: { ...context.raw },
    admin: { ...context.admin },
    endemicDiseases: [...context.endemicDiseases],
    foodAvailability: {
      staples: [...context.foodAvailability.staples],
      seasonalGaps: [...context.foodAvailability.seasonalGaps],
    },
    climate: { ...context.climate, rainySeasons: [...context.climate.rainySeasons] },
  };
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
  if (input.source === "gps") {
    if (input.lat === undefined || input.lng === undefined) {
      throw new TypeError("GPS location requires both latitude and longitude.");
    }
    if (!Number.isFinite(input.lat) || input.lat < -90 || input.lat > 90 || !Number.isFinite(input.lng) || input.lng < -180 || input.lng > 180) {
      throw new RangeError("GPS coordinates must be finite latitude/longitude values within valid geographic bounds.");
    }
  }

  const cacheKey = getCacheKey(input);
  const cached = locationCache.get(cacheKey);
  if (cached) return copyContext(cached);

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

  if (
    regionKey === "Oromia" &&
    input.woreda?.trim().toLowerCase() === "adama" &&
    (!input.zone || input.zone.trim().toLowerCase() === "east shewa")
  ) {
    agroEcological = "rift-valley";
  }

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

  if (locationCache.size >= LOCATION_CACHE_LIMIT) {
    const oldestKey = locationCache.keys().next().value;
    if (oldestKey !== undefined) locationCache.delete(oldestKey);
  }
  locationCache.set(cacheKey, copyContext(context));
  return context;
}

export * from "./types";
export * from "./ethiopianDatasets";
