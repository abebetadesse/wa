import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profileFieldDefinitions } from "@/lib/db/schema";
import { requireKnowledgeRole } from "@/lib/adminKnowledge";

export async function PUT(request: NextRequest) {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]);
  if (auth.error) return auth.error;
  const body = await request.json();
  if (!Array.isArray(body.ids) || body.ids.some((id: unknown) => typeof id !== "string")) return NextResponse.json({ success: false, error: "ids must be an array of strings." }, { status: 400 });
  await Promise.all(body.ids.map((id: string, index: number) => db.update(profileFieldDefinitions).set({ displayOrder: index, updatedBy: auth.user.id, updatedAt: new Date() }).where(eq(profileFieldDefinitions.id, id))));
  return NextResponse.json({ success: true });
}
