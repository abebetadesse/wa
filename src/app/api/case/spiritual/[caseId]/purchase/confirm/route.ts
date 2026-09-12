import { NextRequest, NextResponse } from "next/server";
import { confirmSpiritualPayment, getSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const body = await req.json().catch(() => ({}));
    const transactionRef = body.transactionRef || `TXN-${Date.now()}`;
    const paymentMethod = body.paymentMethod || "telebirr";

    const session = confirmSpiritualPayment(caseId, {
      transactionRef,
      paymentMethod,
    });

    return NextResponse.json({
      success: true,
      data: {
        caseId: session.id,
        status: session.status,
        paymentConfirmed: true,
        transactionRef,
        reportUrl: `/case/spiritual/${session.id}/report?unlocked=true`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to confirm payment" },
      { status: 400 }
    );
  }
}
