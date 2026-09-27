import { NextRequest, NextResponse } from "next/server";
import { getOwnedSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    let user = null;
    try {
      user = await requireAuthenticatedUser();
    } catch {
      user = null;
    }
    const session = getOwnedSpiritualCase(caseId, user?.id);

    if (!session) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        caseId,
        previewUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        isWatermarked: true,
        title: `Healing Parchment Scroll for ${session.nameGeez}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch scroll preview" },
      { status: 500 }
    );
  }
}
