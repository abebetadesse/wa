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

// Kept here for existing importers; client code should import it from ./regions (no place data).
export { estimateAgroEcology } from "./regions";
