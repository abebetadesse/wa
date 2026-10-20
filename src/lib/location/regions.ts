/**
 * Small location facts for the browser, without the 1,200-place administrative list or the
 * location dataset (each a few hundred kilobytes). Searching places goes through
 * GET /api/locations?q=…&fields=places. A test keeps these in step with the full data.
 */

/** Regions and city administrations in the administrative list, alphabetical. */
export const ETHIOPIAN_REGIONS: readonly string[] = [
  "Addis Ababa",
  "Afar",
  "Amhara",
  "Benishangul Gumuz",
  "Central Ethiopia",
  "Dire Dawa Astedadar",
  "Ethiopia Somali",
  "Gambela",
  "Hareri",
  "Oromia",
  "Sheger",
  "Sidama",
  "South Ethiopia",
  "South West Ethiopia People",
  "Tigray",
];

/** Number of profiled locations in src/lib/location/ethiopiaLocations.ts (shown in the footer). */
export const ETHIOPIAN_PROFILED_LOCATION_COUNT = 16;

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
