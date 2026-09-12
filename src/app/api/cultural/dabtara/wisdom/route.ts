import { NextResponse } from "next/server";
import { getDabtaraWisdom } from "@/lib/cultural/awudeNegestEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { category = "health" } = body;

    const wisdom = getDabtaraWisdom(category);

    return NextResponse.json({
      success: true,
      data: wisdom,
      disclaimer: PLATFORM_DISCLAIMERS.awudeNegest,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve Däbtära wisdom" }, { status: 500 });
  }
}
