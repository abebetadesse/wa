import { NextResponse } from "next/server";
import { calculateGeezGematria } from "@/lib/cultural/geezFidelGematria";
import { calculateAwudeNegestReading } from "@/lib/cultural/awudeNegestEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const gematria = calculateGeezGematria(name);
    const awude = calculateAwudeNegestReading({ name, category: "career" });

    return NextResponse.json({
      success: true,
      name,
      gematria,
      awudeNegestCircle: awude.circle,
      characterTraits: awude.characterTraits,
      recommendations: awude.recommendations,
      disclaimer: PLATFORM_DISCLAIMERS.awudeNegest,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to analyze name meaning" }, { status: 500 });
  }
}
