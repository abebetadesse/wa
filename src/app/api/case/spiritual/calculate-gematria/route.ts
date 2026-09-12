import { NextRequest, NextResponse } from "next/server";
import { calculateFullDivination } from "@/lib/cultural/spiritualDivinationEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nameGeez = body.nameGeez || "";
    const motherNameGeez = body.motherNameGeez || "";

    const result = calculateFullDivination(nameGeez, motherNameGeez);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate gematria" },
      { status: 400 }
    );
  }
}
