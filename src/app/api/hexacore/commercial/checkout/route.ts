import { NextResponse } from "next/server";
import { createPurchaseOrder } from "@/lib/hexacore/hexacoreCommercialStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.clientName || typeof body.clientName !== "string") {
      return NextResponse.json(
        { success: false, error: "Client name is required." },
        { status: 400 }
      );
    }

    if (!body.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.birthDate)) {
      return NextResponse.json(
        { success: false, error: "A valid birth date in YYYY-MM-DD format is required for the natal reading." },
        { status: 400 }
      );
    }

    const paymentMethod = body.paymentMethod || "telebirr";
    const allowedMethods = ["telebirr", "cbe_transfer", "chapa", "card", "demo"];
    if (!allowedMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: `Invalid payment method. Allowed: ${allowedMethods.join(", ")}` },
        { status: 400 }
      );
    }

    const { purchase, paymentInstructions } = await createPurchaseOrder({
      productId: body.productId,
      productCode: body.productCode,
      clientName: body.clientName.trim(),
      clientEmail: body.clientEmail?.trim(),
      clientPhone: body.clientPhone?.trim(),
      motherName: body.motherName?.trim(),
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      birthLocation: body.birthLocation,
      focusQuestion: body.focusQuestion,
      paymentMethod,
      currency: body.currency === "USD" ? "USD" : "ETB",
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      data: {
        purchaseId: purchase.id,
        reference: purchase.reference,
        status: purchase.status,
        productCode: purchase.productCode,
        productName: purchase.productName,
        productNameAm: purchase.productNameAm,
        amountPaidEtb: purchase.amountPaidEtb,
        amountPaidUsd: purchase.amountPaidUsd,
        paymentInstructions,
        unlockedPayload: purchase.unlockedPayload || null,
      },
    });
  } catch (error: any) {
    console.error("Hexacore commercial checkout failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize checkout." },
      { status: 500 }
    );
  }
}
