/**
 * Chapa calls callback_url (GET ?trx_ref=…&ref_id=…&status=…) after a checkout. The query is not
 * trusted: it only tells us which transaction to verify with Chapa's API.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyOnlinePayment } from "@/server/payments";

export const dynamic = "force-dynamic";

async function handle(txRef: string | null) {
  if (!txRef || txRef.length > 64) return NextResponse.json({ received: false }, { status: 400 });
  try {
    const payment = await verifyOnlinePayment(txRef);
    return NextResponse.json({ received: true, status: payment.status });
  } catch (error) {
    console.error("[payments] callback verification failed", txRef, error);
    return NextResponse.json({ received: false }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handle(req.nextUrl.searchParams.get("trx_ref") ?? req.nextUrl.searchParams.get("tx_ref"));
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { trx_ref?: string; tx_ref?: string };
  return handle(body.trx_ref ?? body.tx_ref ?? req.nextUrl.searchParams.get("trx_ref"));
}
