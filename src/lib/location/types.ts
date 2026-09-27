export interface LocationContext {
  raw: { lat: number; lng: number; source: "gps" | "manual" | "admin" };
  admin: { region: string; zone: string; woreda: string; kebele?: string };
  agroEcological: "highland" | "midland" | "lowland" | "rift-valley" | "desert";
  altitudeBand: "<1500" | "1500-2300" | "2300-3200" | ">3200";
  ecosystem: string;          // e.g. "Afromontane forest", "Acacia savanna"
  watershed?: string;
  marketAccess: "urban" | "peri-urban" | "rural-market" | "remote";
  endemicDiseases: string[];  // malaria, podoconiosis, leishmaniasis, etc.
  foodAvailability: {
    staples: string[];
    seasonalGaps: string[];   // lean months
  };
  climate: { zone: string; rainySeasons: string[] };
  confidence?: "high" | "moderate" | "reduced";
}

export interface LocationInput {
  lat?: number;
  lng?: number;
  region?: string;
  zone?: string;
  woreda?: string;
  kebele?: string;
  source?: "gps" | "manual" | "admin";
}
