import { NextResponse } from "next/server";
import { AWDE_NEGEST_SIGNS } from "@/lib/cultural/awdeNegestZodiac";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function GET() {
  return NextResponse.json({
    success: true,
    totalSigns: AWDE_NEGEST_SIGNS.length,
    calendar: "Ethiopian 13-Month Ge'ez Calendar System (12 x 30 days + Pagume)",
    signs: AWDE_NEGEST_SIGNS,
    disclaimer: PLATFORM_DISCLAIMERS.awudeNegest,
  });
}
