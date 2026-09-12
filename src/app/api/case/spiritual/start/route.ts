import { NextRequest, NextResponse } from "next/server";
import { startSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nameGeez = body.nameGeez || "";
    const motherNameGeez = body.motherNameGeez || "";

    const session = startSpiritualCase(nameGeez, motherNameGeez);

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to start spiritual case" },
      { status: 400 }
    );
  }
}
