import {
  ETHIOPIAN_LOCATIONS,
  ETHIOPIAN_REGION_REFERENCE,
  resolveEthiopianLocation,
  getAdministrativePlacesByRegion,
  getZonesForRegion,
  getWoredasForZone,
  getAdministrativeRegionProfile,
  getLocationByAdministrativePlace,
  normalizeRegionName,
} from "../src/lib/location/ethiopiaLocations";

console.log("Total locations:", ETHIOPIAN_LOCATIONS.length);
console.log("Region reference entries:", ETHIOPIAN_REGION_REFERENCE.length);

const testQueries = [
  { query: "Sida Awash", expectedRegion: "Sheger" },
  { query: "Wereda 01", expectedRegion: "Addis Ababa" },
  { query: "Kibet Ketema Astedader", expectedRegion: "Central Ethiopia" },
  { query: "Dawro", expectedRegion: "Southwest Ethiopia Peoples" },
  { query: "07 Woreda Astedadar", expectedRegion: "Dire Dawa" },
  { query: "Aysaita KetemaAstedader", expectedRegion: "Afar" },
  { query: "Mekane Selam", expectedRegion: "Amhara" },
];

for (const t of testQueries) {
  const resolved = resolveEthiopianLocation(t.query);
  const matched = normalizeRegionName(resolved.region) === normalizeRegionName(t.expectedRegion);
  console.log(`Query "${t.query}" -> ${resolved.name} (${resolved.region}) [${matched ? "PASS" : "FAIL"}]`);
  if (!matched) {
    throw new Error(`Expected ${t.expectedRegion} for "${t.query}", got ${resolved.region}`);
  }
}

console.log("All query resolutions passed!");
