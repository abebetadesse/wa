import { and, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hexacoreJournal } from "@/lib/db/schema";
import { requireUser } from "@/lib/api/authGuard";
import { badRequest, created, ok, unauthorized, serverError } from "@/lib/api/response";
import { insertReturning } from "@/lib/db/write";

export async function GET() {
  const { user, error } = await requireUser();
  if (error || !user) return unauthorized();
  const entries = await db.select().from(hexacoreJournal).where(eq(hexacoreJournal.userId, user.id)).orderBy(desc(hexacoreJournal.entryDate)).limit(90);
  return ok(entries);
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireUser();
  if (error || !user) return unauthorized();
  const body = await request.json().catch(() => null) as {
    selectedCore?: string;
    selectedAspect?: string;
    prompt?: string;
    response?: string;
    mood?: number;
    practiceCompleted?: string[];
    frequenciesSnapshot?: Record<string, number>;
  } | null;
  if (!body || typeof body.response !== "string" || body.response.trim().length < 3) return badRequest("A reflection of at least three characters is required.", "response");
  if (body.mood !== undefined && (!Number.isInteger(body.mood) || body.mood < 1 || body.mood > 10)) return badRequest("mood must be an integer from 1 to 10.", "mood");
  if (body.selectedCore && !["P", "H", "C", "E", "S", "O"].includes(body.selectedCore)) return badRequest("Invalid selected core.", "selectedCore");
  try {
    const [entry] = await insertReturning(db, hexacoreJournal, {
      userId: user.id,
      entryDate: new Date(),
      selectedCore: body.selectedCore as "P" | "H" | "C" | "E" | "S" | "O" | undefined,
      selectedAspect: body.selectedAspect,
      prompt: body.prompt,
      response: body.response.trim(),
      mood: body.mood,
      practiceCompleted: body.practiceCompleted ?? [],
      frequenciesSnapshot: body.frequenciesSnapshot,
    });
    return created(entry);
  } catch (caught) {
    console.error("Hexacore journal save failed:", caught);
    return serverError("Unable to save the journal entry.");
  }
}
