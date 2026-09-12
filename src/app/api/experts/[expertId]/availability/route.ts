import { NextRequest, NextResponse } from "next/server";
import { getExpertAvailability } from "@/lib/case-workflow/spiritualExpertEngine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ expertId: string }> }
) {
  try {
    const { expertId } = await params;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const availability = getExpertAvailability(expertId, date);

    return NextResponse.json({
      success: true,
      data: availability,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
