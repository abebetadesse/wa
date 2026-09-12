import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { diagnosticSessions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

    if (!db) {
      return NextResponse.json({ success: true, data: [] });
    }

    let query = db
      .select({
        id: diagnosticSessions.id,
        query: diagnosticSessions.query,
        mode: diagnosticSessions.mode,
        language: diagnosticSessions.language,
        urgencyLevel: diagnosticSessions.urgencyLevel,
        urgencyScore: diagnosticSessions.urgencyScore,
        intent: diagnosticSessions.intent,
        summary: diagnosticSessions.summary,
        createdAt: diagnosticSessions.createdAt,
      })
      .from(diagnosticSessions)
      .orderBy(desc(diagnosticSessions.createdAt))
      .limit(limit);

    if (userId) {
      // @ts-expect-error drizzle where clause
      query = query.where(eq(diagnosticSessions.userId, userId));
    }

    const sessions = await query;

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Diagnostic history error:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}
