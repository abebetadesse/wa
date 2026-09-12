import { NextRequest, NextResponse } from "next/server";

// ════════════════════════════════════════════════════════════
// POST /api/case/career/consult
// Books a consultation slot with an assigned advisor
// ════════════════════════════════════════════════════════════

interface ConsultBooking {
  id: string;
  caseId: string;
  advisorId: string;
  format: "video" | "voice" | "chat" | "in_person";
  scheduledAt: string;
  durationMinutes: number;
  feeETB: number;
  status: "pending_payment" | "confirmed" | "cancelled";
  createdAt: string;
  meetingLink?: string;
  preparationNotes: string[];
}

const bookings = new Map<string, ConsultBooking>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      caseId: string;
      advisorId: string;
      format: ConsultBooking["format"];
      preferredDate: string; // ISO date string
      feeETB: number;
    };

    const { caseId, advisorId, format, preferredDate, feeETB } = body;

    if (!caseId || !advisorId || !format || !preferredDate) {
      return NextResponse.json(
        { success: false, error: "caseId, advisorId, format, and preferredDate are required" },
        { status: 400 }
      );
    }

    const booking: ConsultBooking = {
      id: crypto.randomUUID(),
      caseId,
      advisorId,
      format,
      scheduledAt: preferredDate,
      durationMinutes: 30,
      feeETB: feeETB ?? 1000,
      status: "pending_payment",
      createdAt: new Date().toISOString(),
      meetingLink: format === "in_person" ? undefined : `https://meet.ninimed.com/c/${crypto.randomUUID().slice(0, 8)}`,
      preparationNotes: [
        "Review your timing window analysis before the session.",
        "Write down your top 3 questions for the advisor.",
        "Have any relevant documents (business plan, job offer, contract) ready to share.",
        "The session will be 30 minutes — come with clarity on your most urgent priority.",
      ],
    };

    bookings.set(booking.id, booking);

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      status: booking.status,
      scheduledAt: booking.scheduledAt,
      format: booking.format,
      durationMinutes: booking.durationMinutes,
      feeETB: booking.feeETB,
      meetingLink: booking.meetingLink,
      preparationNotes: booking.preparationNotes,
      paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      message:
        "Your consultation slot is reserved. Complete payment within 24 hours to confirm. " +
        "You will receive a confirmation and preparation notes once payment is processed.",
    });
  } catch (err) {
    console.error("[career/consult]", err);
    return NextResponse.json(
      { success: false, error: "Failed to book consultation" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get("bookingId");
  if (!bookingId) {
    return NextResponse.json({ success: false, error: "bookingId required" }, { status: 400 });
  }
  const booking = bookings.get(bookingId);
  if (!booking) {
    return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, booking });
}
