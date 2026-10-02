import { NextResponse } from "next/server";
import { verifyAndUnlockPurchase } from "@/lib/hexacore/hexacoreCommercialStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reference = body.reference || body.purchaseId;

    if (!reference || typeof reference !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid purchase reference or ID is required to verify payment." },
        { status: 400 }
      );
    }

    const completedPurchase = await verifyAndUnlockPurchase({
      referenceOrId: reference.trim(),
      paymentReference: body.paymentReference?.trim(),
      proofUrl: body.proofUrl?.trim(),
      demoInstant: Boolean(body.demoInstant),
    });

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified. 14-Layer Dossier unlocked!",
      data: {
        purchaseId: completedPurchase.id,
        reference: completedPurchase.reference,
        status: completedPurchase.status,
        completedAt: completedPurchase.completedAt,
        unlockedPayload: completedPurchase.unlockedPayload,
      },
    });
  } catch (error: any) {
    console.error("Hexacore payment verification failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify payment." },
      { status: 400 }
    );
  }
}
