import { NextResponse } from "next/server";

/**
 * GET /api/atlas
 *
 * Returns nutritional health statistics and regional health data for
 * Ethiopia's major regions, sourced from EPHI DHS 2019 / MiNDO survey data.
 * This endpoint is cached by the service worker for offline availability.
 *
 * Domain A — Clinical reference data only. No cultural/astrological fields.
 */

export const dynamic = "force-static";
export const revalidate = 86400; // 24h revalidation

export interface RegionData {
  id: string;
  name: string;
  nameAmharic: string;
  nameOromo: string;
  capital: string;
  altitudeRange: string;
  population: number;
  // Nutritional status (% prevalence from EPHI DHS 2019)
  stuntingPct: number;
  wastingPct: number;
  anemiaChildrenPct: number;
  anemiaWomenPct: number;
  ironDeficiencyPct: number;
  vitaminADeficiencyPct: number;
  // Common dietary patterns
  stapleFoods: string[];
  commonDeficiencies: string[];
  // Traditional medicine prevalence
  traditionalMedicineUsagePct: number;
  // Color for map visualization
  riskLevel: "low" | "moderate" | "high" | "very-high";
  // SVG path id for the map
  svgId: string;
  // Rough centroid for label placement
  labelX: number;
  labelY: number;
}

const REGIONS: RegionData[] = [
  {
    id: "addis-ababa",
    name: "Addis Ababa",
    nameAmharic: "አዲስ አበባ",
    nameOromo: "Finfinnee",
    capital: "Addis Ababa",
    altitudeRange: "2,200–2,600m",
    population: 3600000,
    stuntingPct: 18,
    wastingPct: 5,
    anemiaChildrenPct: 21,
    anemiaWomenPct: 18,
    ironDeficiencyPct: 22,
    vitaminADeficiencyPct: 14,
    stapleFoods: ["Teff Injera", "Doro Wot", "Tibs", "Shiro"],
    commonDeficiencies: ["Iron", "Vitamin D", "B12"],
    traditionalMedicineUsagePct: 35,
    riskLevel: "low",
    svgId: "addis-ababa",
    labelX: 285,
    labelY: 245,
  },
  {
    id: "amhara",
    name: "Amhara",
    nameAmharic: "አማራ",
    nameOromo: "Amaaraa",
    capital: "Bahir Dar",
    altitudeRange: "1,500–4,620m",
    population: 21134000,
    stuntingPct: 46,
    wastingPct: 10,
    anemiaChildrenPct: 58,
    anemiaWomenPct: 32,
    ironDeficiencyPct: 41,
    vitaminADeficiencyPct: 28,
    stapleFoods: ["Teff Injera", "Kocho", "Shiro Wot", "Tej"],
    commonDeficiencies: ["Iron", "Zinc", "Folate", "Iodine"],
    traditionalMedicineUsagePct: 72,
    riskLevel: "very-high",
    svgId: "amhara",
    labelX: 235,
    labelY: 150,
  },
  {
    id: "oromia",
    name: "Oromia",
    nameAmharic: "ኦሮሚያ",
    nameOromo: "Oromiyaa",
    capital: "Addis Ababa",
    altitudeRange: "500–4,377m",
    population: 35467000,
    stuntingPct: 42,
    wastingPct: 11,
    anemiaChildrenPct: 54,
    anemiaWomenPct: 29,
    ironDeficiencyPct: 38,
    vitaminADeficiencyPct: 25,
    stapleFoods: ["Buna (Coffee)", "Enset/Kocho", "Corn", "Sorghum"],
    commonDeficiencies: ["Vitamin A", "Iron", "Calcium", "Zinc"],
    traditionalMedicineUsagePct: 68,
    riskLevel: "high",
    svgId: "oromia",
    labelX: 265,
    labelY: 295,
  },
  {
    id: "tigray",
    name: "Tigray",
    nameAmharic: "ትግራይ",
    nameOromo: "Tigraay",
    capital: "Mekelle",
    altitudeRange: "500–4,231m",
    population: 5247000,
    stuntingPct: 49,
    wastingPct: 14,
    anemiaChildrenPct: 62,
    anemiaWomenPct: 36,
    ironDeficiencyPct: 45,
    vitaminADeficiencyPct: 31,
    stapleFoods: ["Tsebhi", "Injera", "Tihlo", "Bayenet"],
    commonDeficiencies: ["Iron", "Zinc", "Vitamin A", "Folate"],
    traditionalMedicineUsagePct: 78,
    riskLevel: "very-high",
    svgId: "tigray",
    labelX: 255,
    labelY: 82,
  },
  {
    id: "sidama",
    name: "Sidama",
    nameAmharic: "ሲዳማ",
    nameOromo: "Sidaama",
    capital: "Hawassa",
    altitudeRange: "1,500–2,800m",
    population: 3500000,
    stuntingPct: 35,
    wastingPct: 8,
    anemiaChildrenPct: 44,
    anemiaWomenPct: 26,
    ironDeficiencyPct: 33,
    vitaminADeficiencyPct: 20,
    stapleFoods: ["Kocho", "Bulla", "Chuko", "Avocado"],
    commonDeficiencies: ["Vitamin B12", "Iron", "Zinc"],
    traditionalMedicineUsagePct: 65,
    riskLevel: "moderate",
    svgId: "sidama",
    labelX: 260,
    labelY: 320,
  },
  {
    id: "snnp",
    name: "SNNP",
    nameAmharic: "ደቡብ ኢትዮጵያ",
    nameOromo: "Kibbaa",
    capital: "Hawassa",
    altitudeRange: "376–4,207m",
    population: 20231000,
    stuntingPct: 44,
    wastingPct: 12,
    anemiaChildrenPct: 55,
    anemiaWomenPct: 31,
    ironDeficiencyPct: 40,
    vitaminADeficiencyPct: 27,
    stapleFoods: ["Enset", "Kocho", "Corn", "Haricot Beans"],
    commonDeficiencies: ["Iron", "Vitamin A", "Zinc", "Iodine"],
    traditionalMedicineUsagePct: 75,
    riskLevel: "high",
    svgId: "snnp",
    labelX: 235,
    labelY: 350,
  },
  {
    id: "somali",
    name: "Somali Region",
    nameAmharic: "ሶማሌ",
    nameOromo: "Somaalee",
    capital: "Jigjiga",
    altitudeRange: "200–1,600m",
    population: 5765000,
    stuntingPct: 52,
    wastingPct: 18,
    anemiaChildrenPct: 68,
    anemiaWomenPct: 42,
    ironDeficiencyPct: 52,
    vitaminADeficiencyPct: 36,
    stapleFoods: ["Camel Milk", "Sorghum", "Rice", "Canjeero"],
    commonDeficiencies: ["Vitamin A", "Vitamin C", "Zinc", "Folate"],
    traditionalMedicineUsagePct: 82,
    riskLevel: "very-high",
    svgId: "somali",
    labelX: 390,
    labelY: 270,
  },
  {
    id: "afar",
    name: "Afar",
    nameAmharic: "አፋር",
    nameOromo: "Afaar",
    capital: "Semera",
    altitudeRange: "−155–1,500m",
    population: 1813000,
    stuntingPct: 48,
    wastingPct: 16,
    anemiaChildrenPct: 64,
    anemiaWomenPct: 38,
    ironDeficiencyPct: 48,
    vitaminADeficiencyPct: 33,
    stapleFoods: ["Camel Milk", "Goat Meat", "Sorghum", "Dates"],
    commonDeficiencies: ["Vitamin A", "Vitamin C", "Calcium", "Iron"],
    traditionalMedicineUsagePct: 79,
    riskLevel: "very-high",
    svgId: "afar",
    labelX: 325,
    labelY: 178,
  },
  {
    id: "benishangul",
    name: "Benishangul-Gumuz",
    nameAmharic: "ቤኒሻንጉልጉምዝ",
    nameOromo: "Binishaangul-Gumuz",
    capital: "Assosa",
    altitudeRange: "600–2,100m",
    population: 1127000,
    stuntingPct: 50,
    wastingPct: 13,
    anemiaChildrenPct: 61,
    anemiaWomenPct: 35,
    ironDeficiencyPct: 46,
    vitaminADeficiencyPct: 30,
    stapleFoods: ["Sorghum", "Maize", "Cassava", "Wild Yams"],
    commonDeficiencies: ["Iron", "Zinc", "Vitamin A", "B12"],
    traditionalMedicineUsagePct: 80,
    riskLevel: "very-high",
    svgId: "benishangul",
    labelX: 148,
    labelY: 190,
  },
  {
    id: "gambella",
    name: "Gambella",
    nameAmharic: "ጋምቤላ",
    nameOromo: "Gambeellaa",
    capital: "Gambella",
    altitudeRange: "400–2,000m",
    population: 425000,
    stuntingPct: 55,
    wastingPct: 20,
    anemiaChildrenPct: 70,
    anemiaWomenPct: 44,
    ironDeficiencyPct: 55,
    vitaminADeficiencyPct: 38,
    stapleFoods: ["Sorghum", "Cassava", "Fish", "Wild Greens"],
    commonDeficiencies: ["Vitamin A", "Iron", "Zinc", "Folate"],
    traditionalMedicineUsagePct: 85,
    riskLevel: "very-high",
    svgId: "gambella",
    labelX: 148,
    labelY: 310,
  },
  {
    id: "harari",
    name: "Harari",
    nameAmharic: "ሐረሪ",
    nameOromo: "Hararii",
    capital: "Harar",
    altitudeRange: "1,700–2,100m",
    population: 271000,
    stuntingPct: 25,
    wastingPct: 6,
    anemiaChildrenPct: 35,
    anemiaWomenPct: 22,
    ironDeficiencyPct: 28,
    vitaminADeficiencyPct: 18,
    stapleFoods: ["Maraq", "Ful", "Injera", "Spiced Meat"],
    commonDeficiencies: ["Iron", "Vitamin D", "B12"],
    traditionalMedicineUsagePct: 48,
    riskLevel: "moderate",
    svgId: "harari",
    labelX: 358,
    labelY: 242,
  },
  {
    id: "dire-dawa",
    name: "Dire Dawa",
    nameAmharic: "ድሬ ዳዋ",
    nameOromo: "Dirree Dhawaa",
    capital: "Dire Dawa",
    altitudeRange: "1,100–1,700m",
    population: 528000,
    stuntingPct: 22,
    wastingPct: 7,
    anemiaChildrenPct: 30,
    anemiaWomenPct: 20,
    ironDeficiencyPct: 24,
    vitaminADeficiencyPct: 16,
    stapleFoods: ["Beef Tibs", "Injera", "Ful", "Canjeero"],
    commonDeficiencies: ["Iron", "Vitamin D", "Zinc"],
    traditionalMedicineUsagePct: 40,
    riskLevel: "low",
    svgId: "dire-dawa",
    labelX: 363,
    labelY: 225,
  },
];

export async function GET() {
  return NextResponse.json(
    {
      regions: REGIONS,
      dataSource: "EPHI DHS 2019 / MiNDO Survey / WHO SEARO",
      lastUpdated: "2025-01-01",
      disclaimer:
        "Nutritional prevalence data is population-level. Individual assessments require the full 5-stage evaluation pipeline.",
    },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    }
  );
}
