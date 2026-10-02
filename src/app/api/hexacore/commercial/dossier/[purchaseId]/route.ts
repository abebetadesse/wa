import { NextResponse } from "next/server";
import { getPurchase } from "@/lib/hexacore/hexacoreCommercialStore";

export async function GET(
  _request: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const { purchaseId } = params;

    if (!purchaseId) {
      return NextResponse.json(
        { success: false, error: "Purchase ID or reference is required." },
        { status: 400 }
      );
    }

    const purchase = await getPurchase(purchaseId);

    if (!purchase) {
      return NextResponse.json(
        { success: false, error: "Dossier not found. The purchase reference may be invalid or expired." },
        { status: 404 }
      );
    }

    if (purchase.status !== "completed") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment not yet verified. Please complete payment and verify your transaction reference.",
          status: purchase.status,
          reference: purchase.reference,
          paymentMethod: purchase.paymentMethod,
        },
        { status: 402 }
      );
    }

    if (!purchase.unlockedPayload) {
      return NextResponse.json(
        { success: false, error: "Dossier generation is in progress. Please try again in a moment." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        purchaseId: purchase.id,
        reference: purchase.reference,
        productCode: purchase.productCode,
        productName: purchase.productName,
        productNameAm: purchase.productNameAm,
        completedAt: purchase.completedAt,
        dossier: purchase.unlockedPayload,
      },
    });
  } catch (error: any) {
    console.error("Dossier retrieval failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve dossier." },
      { status: 500 }
    );
  }
}
