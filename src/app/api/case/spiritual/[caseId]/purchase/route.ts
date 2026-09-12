import { NextRequest, NextResponse } from "next/server";
import { getSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const session = getSpiritualCase(caseId);

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
