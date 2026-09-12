import { NextRequest, NextResponse } from "next/server";
import { startSpiritualCase } from "@/lib/case-workflow/spiritualExpertEngine";
import { requireAuthenticatedUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json();
    const nameGeez = typeof body.nameGeez === "string" ? body.nameGeez : "";
    const motherNameGeez = typeof body.motherNameGeez === "string" ? body.motherNameGeez : "";

    const session = startSpiritualCase(nameGeez, motherNameGeez, user.id);

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
