import { NextResponse } from "next/server";
import { ETHIOPIAN_LOCATIONS } from "@/lib/location/ethiopiaLocations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locationId: string }> },
) {
  const { locationId } = await params;
  const location = ETHIOPIAN_LOCATIONS.find((candidate) => candidate.id === locationId);
  if (!location) {
    return NextResponse.json({ success: false, error: "Ethiopian location not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: location,
    interpretation: {
      communicable: "Rates are population-level planning indicators and do not establish an individual diagnosis.",
      nonCommunicable: "Prevalence and mortality indicators describe population burden, not an individual's personal risk.",
      anthropometrics: "Height, weight, and BMI values are modeled town averages; they are not an individual's measurement or nutritional diagnosis.",
      fertility: "Birth and fertility indicators are population-level estimates for planning and are not individual reproductive-Welbeing predictions.",
      familyAndInheritance: "Polygamy, birth-defect, and inherited-condition indicators are modeled population estimates; they do not characterize an individual, family, ethnicity, or town resident.",
      ecologyAndFoodSystems: "Ecology, agriculture, industry, urbanization, and food-system fields are planning references and should be verified with local environmental, agricultural, and nutrition sources.",
      cultureAndHeritage: "Common names, traditional medicines, cultural practices, religious sites, mountains, rivers, and lakes are descriptive references; confirm names, custodianship, and local cultural context with authoritative local sources.",
      foodCompositionAndChemicals: "Food composition records must preserve their source, basis, and intended use. Feedipedia values are animal-feed references and must not be used as human Debral composition values without an appropriate validated food source. Pesticide and insecticide fields require registered product, application, residue, and pre-harvest verification.",
    },
  }, {
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
  });
}
