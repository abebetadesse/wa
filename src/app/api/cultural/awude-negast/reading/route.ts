import { NextResponse } from "next/server";
import { calculateAwudeNegestReading } from "@/lib/cultural/awudeNegestEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, motherName, category = "marriage", place, month } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const reading = calculateAwudeNegestReading({ name, motherName, category, place, month });

    return NextResponse.json({
      success: true,
      data: reading,
      disclaimer: PLATFORM_DISCLAIMERS.awudeNegest,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate AwudeNegest reading" }, { status: 500 });
  }
}
