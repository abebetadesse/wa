import {
  ETHIOPIAN_ADMINISTRATIVE_PLACES,
  EthiopianAdministrativePlace,
} from "./ethiopianAdministrativePlaces";

// Cached unique regions
let cachedRegions: string[] | null = null;

export function getAllRegions(): string[] {
  if (!cachedRegions) {
    const set = new Set<string>();
    for (const p of ETHIOPIAN_ADMINISTRATIVE_PLACES) {
      if (p.region) set.add(p.region);
    }
    cachedRegions = Array.from(set).sort((a, b) => a.localeCompare(b));
  }
  return cachedRegions;
}

export function searchEthiopianPlaces(query: string, limit = 12): EthiopianAdministrativePlace[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/u).filter(Boolean);
  if (!terms.length || terms.some((term) => term.length < 2)) return [];

  const results: EthiopianAdministrativePlace[] = [];
  for (const place of ETHIOPIAN_ADMINISTRATIVE_PLACES) {
    const searchable = `${place.town} ${place.zone} ${place.region}`.toLocaleLowerCase();
    if (terms.every((term) => searchable.includes(term))) {
      results.push(place);
      if (results.length >= limit) break;
    }
  }
  return results;
}

/**
 * Estimates elevation & agro-ecological zone from region/zone name
 */
export function estimateAgroEcology(region: string, zone?: string): {
  zoneName: "Dega (Highlands)" | "Weyna Dega (Midlands)" | "Kolla (Lowlands)" | "Bereha (Desert)";
  altitudeMeters: number;
  climateNote: string;
} {
  const r = (region || "").toLowerCase();
  const z = (zone || "").toLowerCase();

  if (r.includes("afar") || r.includes("somali")) {
    return {
      zoneName: "Bereha (Desert)",
      altitudeMeters: 800,
      climateNote: "Arid to semi-arid climate, high heat, low humidity. High hydration & mineral replenishment advised.",
    };
  }

  if (r.includes("gambela") || r.includes("benishangul") || z.includes("lowland")) {
    return {
      zoneName: "Kolla (Lowlands)",
      altitudeMeters: 1400,
      climateNote: "Warm tropical lowlands. Vigilance for vector-borne risks, hydration, and cooling herbs advised.",
    };
  }

  if (
    r.includes("addis ababa") ||
    z.includes("north shewa") ||
    z.includes("south gondar") ||
    z.includes("north wollo") ||
    z.includes("semen")
  ) {
    return {
      zoneName: "Dega (Highlands)",
      altitudeMeters: 2500,
      climateNote: "Cool afro-alpine highland climate. High altitude oxygen adaptation, respiratory warming herbs (tena adam, zingibil) indicated.",
    };
  }

  return {
    zoneName: "Weyna Dega (Midlands)",
    altitudeMeters: 2000,
    climateNote: "Temperate midland climate. Optimal biodiversity for Ethiopian traditional medicinal plants and balanced constitution.",
  };
}
