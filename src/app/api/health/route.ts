import { NextResponse } from "next/server";
import { dbClient } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Liveness and database check for uptime monitors and the host's health probe.
 * 200 when the application can reach its database, 503 otherwise. No details are disclosed.
 */
export async function GET() {
  try {
    await dbClient`SELECT 1`;
    return NextResponse.json({ status: "ok", time: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "unavailable", time: new Date().toISOString() }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
