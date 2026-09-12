import { NextResponse } from "next/server";
import { AWUDE_CIRCLES } from "@/lib/cultural/awudeNegestEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function GET() {
  return NextResponse.json({
    success: true,
    totalCircles: AWUDE_CIRCLES.length,
    circles: AWUDE_CIRCLES,
    disclaimer: PLATFORM_DISCLAIMERS.awudeNegest,
  });
}
