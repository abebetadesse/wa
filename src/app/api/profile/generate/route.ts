import { NextRequest, NextResponse } from "next/server";
import { buildPersonalProfile } from "@/lib/profiling/synthesis/profileBuilder";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, birthDate, birthTime, birthPlace, preferredLanguage } = body;

    if (!birthDate) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: birthDate (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const profile = buildPersonalProfile({
      fullName: fullName || "Tigist Mulugeta",
      birthDate,
      birthTime: birthTime || "12:00",
      birthPlace: birthPlace || "Addis Ababa",
      preferredLanguage: preferredLanguage || "en",
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Profile generate API error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
