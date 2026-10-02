import { NextResponse } from "next/server";
import { getCommercialProducts } from "@/lib/hexacore/hexacoreCommercialStore";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tier = url.searchParams.get("tier");
    const products = await getCommercialProducts();

    let filtered = products;
    if (tier) {
      filtered = products.filter((p) => p.tier === tier);
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load Hexacore products." },
      { status: 500 }
    );
  }
}
