import { LocationContext } from "@/lib/location/types";
import { Pillar, PillarResult, SourceRef } from "../types";

export interface SeasonalAvailabilityOutput {
  currentSeason: string;
  isLeanMonth: boolean;
  seasonalGaps: Array<{ month: string; gap: string }>;
  abundantHarvestFoods: string[];
  copingStrategies: string[];
}

const provenance: SourceRef[] = [
  {
    id: "ETH-NUTR-SEASON-01",
    title: "Seasonal Variations in Dietary Intake and Micronutrient Status in Rural Ethiopia",
    type: "paper",
    citation: "Abegaz, K. et al. (2018). Seasonal food security and nutritional adequacy among Ethiopian households. Food Security.",
    year: 2018,
  },
  {
    id: "ETH-NUTR-FEWS-02",
    title: "FEWS NET Ethiopia Food Security Outlook and Seasonal Calendar",
    type: "dataset",
    citation: "USAID / FEWS NET Ethiopia Seasonal Livelihood Profiles, Addis Ababa.",
    year: 2023,
  },
];

export const seasonalAvailabilityPillar: Pillar<unknown, SeasonalAvailabilityOutput> = {
  id: "nutritional.seasonalAvailability",
  version: "1.0.0",
  domain: "nutritional",
  audience: "both",
  requires: ["location.foodAvailability"],
  async query(_input: unknown, ctx: LocationContext): Promise<PillarResult<SeasonalAvailabilityOutput>> {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonthIndex = new Date().getMonth();
    const currentMonth = monthNames[currentMonthIndex];

    const rawGaps = ctx.foodAvailability?.seasonalGaps || ["July", "August"];
    const isLeanMonth = rawGaps.some((g) => g.toLowerCase() === currentMonth.toLowerCase());

    const seasonalGaps = rawGaps.map((month) => ({
      month,
      gap: "Pre-harvest grain reserves deplete ('Wag' lean season); green vegetables and legumes become price-inflated",
    }));

    const abundantHarvestFoods = [
      "Freshly harvested teff, barley, and wheat (Meher harvest: Nov-Jan)",
      "Pumpkins (duba) and root tubers (dinich) available in early dry season",
      "High yield of leafy greens during Belg rains (April-May)",
    ];

    const copingStrategies = [
      "Preserve roasted barley (kolo / besso) as high-energy, nutrient-dense dry rations during lean intervals",
      "Diversify with drought-tolerant legumes like grass pea (guaya) and chickpeas, ensuring thorough soaking and boiling",
      "Utilize fermented enset (kocho) reserves which withstand grain shortfall without storage losses",
    ];

    return {
      pillarId: "nutritional.seasonalAvailability",
      version: "1.0.0",
      domain: "nutritional",
      audience: "both",
      confidence: "high",
      data: {
        currentSeason: `Current Calendar: ${currentMonth} (Rainy Season Context: ${ctx.climate?.rainySeasons?.join(", ") || "Kiremt"})`,
        isLeanMonth,
        seasonalGaps,
        abundantHarvestFoods,
        copingStrategies,
      },
      provenance,
    };
  },
  provenance,
};
