import { NextRequest, NextResponse } from "next/server";
import { getOwnedSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
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

    const body = await req.json();
    const paymentMethod = body.paymentMethod || "telebirr";
    const purchaseId = `purch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return NextResponse.json({
      success: true,
      data: {
        purchaseId,
        caseId,
        amount: 500,
        currency: "ETB",
        paymentMethod,
        checkoutUrl: `/case/spiritual/${caseId}/payment?purchaseId=${purchaseId}`,
        status: "pending",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initiate purchase" },
      { status: 500 }
    );
  }
}
