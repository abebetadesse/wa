import { NextRequest, NextResponse } from "next/server";
import {
  INTENSIVE_TRADITIONAL_MEDICINES,
  TRADITIONAL_MEDICINE_CATEGORIES,
  filterTraditionalMedicines,
  type TraditionalTherapeuticCategory,
} from "@/lib/knowledge/traditionalMedicineDatabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "all";
  const safety = searchParams.get("safety") ?? "all";
  const manuscriptOnly = searchParams.get("manuscriptOnly") === "true" || searchParams.get("fewusOnly") === "true";
  const slug = searchParams.get("slug");

  // Single item lookup by slug or id
  if (slug) {
    const single = INTENSIVE_TRADITIONAL_MEDICINES.find(
      (item) => item.slug === slug || item.id === slug
    );
    if (!single) {
      return NextResponse.json(
        { success: false, error: `Traditional medicine '${slug}' not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: single });
  }

  const filtered = filterTraditionalMedicines({
    query,
    category,
    safety,
    manuscriptOnly,
  });

  return NextResponse.json({
    success: true,
    count: filtered.length,
    total: INTENSIVE_TRADITIONAL_MEDICINES.length,
    categories: Object.values(TRADITIONAL_MEDICINE_CATEGORIES),
    data: filtered,
    metadata: {
      manuscriptCitedCount: INTENSIVE_TRADITIONAL_MEDICINES.filter((m) => !!m.manuscriptReference).length,
      provenance: "Ethiopian Traditional Medicine Database (EPHI, AAU Pharmacognosy, መጽሐፈ ፈውስ)",
    },
  });
}
