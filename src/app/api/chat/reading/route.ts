import { NextResponse } from "next/server";
import { generatePersonalizedReading, getOrCreateChatSession } from "@/lib/profiling/chat/aiChatEngine";
import { PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId = "default_user", type = "annual" } = body;

    const session = getOrCreateChatSession(userId, body.userProfile);
    const reading = generatePersonalizedReading(session.userContext, type);

    return NextResponse.json({
      success: true,
      reading,
      disclaimer: PLATFORM_DISCLAIMERS.aiChat,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate reading" }, { status: 500 });
  }
}
