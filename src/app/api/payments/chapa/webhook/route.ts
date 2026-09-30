/**
 * Chapa webhook (set this URL in the Chapa dashboard). The signature is checked when
 * CHAPA_WEBHOOK_SECRET is set, and the transaction is always re-verified with Chapa's API.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyOnlinePayment } from "@/server/payments";
import { webhookSignatureValid } from "@/server/payments/chapa";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!webhookSignatureValid(raw, req.headers)) return NextResponse.json({ received: false }, { status: 401 });
  let body: { tx_ref?: string; trx_ref?: string } = {};
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }
  const txRef = body.tx_ref ?? body.trx_ref;
  if (!txRef || txRef.length > 64) return NextResponse.json({ received: true });
  try {
    await verifyOnlinePayment(txRef);
  } catch (error) {
    // Unknown references (e.g. another integration on the same Chapa account) are acknowledged.
    if (!(error instanceof Error && /not found/i.test(error.message))) {
      console.error("[payments] webhook verification failed", txRef, error);
      return NextResponse.json({ received: false }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}
