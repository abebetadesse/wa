import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { knowledgeItems } from "@/lib/db/schema";
import { requireKnowledgeRole, parseJsonObject } from "@/lib/adminKnowledge";

export async function POST(request: NextRequest) {
  const auth = await requireKnowledgeRole(["admin", "super_admin"]);
  if (auth.error) return auth.error;
  let body: unknown;
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "A JSON file is required." }, { status: 400 });
    }
    try {
      body = JSON.parse(await file.text());
    } catch {
      return NextResponse.json({ success: false, error: "The uploaded file is not valid JSON." }, { status: 400 });
    }
  } else {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Request body must contain valid JSON." }, { status: 400 });
    }
  }
  const candidateItems: unknown = Array.isArray(body)
    ? body
    : body && typeof body === "object" && "items" in body
      ? body.items
      : null;
  const items = Array.isArray(candidateItems) ? candidateItems : null;
  if (!items || items.some((item) => !item || typeof item !== "object" || !("categoryId" in item) || !("data" in item))) {
    return NextResponse.json({ success: false, error: "JSON must contain items with categoryId and data." }, { status: 400 });
  }
  const created = await db.insert(knowledgeItems).values(items.map((rawItem) => {
    const item = rawItem as { categoryId: unknown; data: unknown; status?: unknown };
    return {
    categoryId: String(item.categoryId),
    data: parseJsonObject(item.data, "data"),
    status: typeof item.status === "string" && ["draft", "review", "published", "archived"].includes(item.status) ? item.status : "draft",
    createdBy: auth.user.id,
    updatedBy: auth.user.id,
    };
  })).returning();
  return NextResponse.json({ success: true, data: { imported: created.length, items: created } }, { status: 201 });
}
