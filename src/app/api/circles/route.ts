import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { hexacoreCircles, hexacoreCircleMembers } from "@/lib/db/schema";
import { requireUser } from "@/lib/api/authGuard";
import { badRequest, created, ok, unauthorized, serverError } from "@/lib/api/response";
import { insertReturning } from "@/lib/db/write";

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 110) || `circle-${Date.now()}`;
}

export async function GET() {
  const { user, error } = await requireUser();
  if (error || !user) return unauthorized();
  const circles = await db.select().from(hexacoreCircles).where(eq(hexacoreCircles.isPrivate, false)).orderBy(desc(hexacoreCircles.createdAt)).limit(50);
  return ok({ circles });
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireUser();
  if (error || !user) return unauthorized();
  const body = await request.json().catch(() => null) as { name?: string; coreCode?: string; description?: string; isPrivate?: boolean } | null;
  if (!body?.name || !body.coreCode) return badRequest("name and coreCode are required.");
  if (!["P", "H", "C", "E", "S", "O"].includes(body.coreCode)) return badRequest("Invalid coreCode.", "coreCode");
  try {
    const [circle] = await insertReturning(db, hexacoreCircles, {
      name: body.name.trim(),
      slug: `${slugify(body.name)}-${randomUUID().slice(0, 8)}`,
      coreCode: body.coreCode as "P" | "H" | "C" | "E" | "S" | "O",
      description: body.description?.trim(),
      isPrivate: Boolean(body.isPrivate),
      createdBy: user.id,
    });
    if (!circle) return serverError("Unable to create circle.");
    await db.insert(hexacoreCircleMembers).values({ circleId: circle.id, userId: user.id, role: "steward" });
    return created({ circle });
  } catch (caught) {
    console.error("Circle creation failed:", caught);
    return serverError("Unable to create circle.");
  }
}
