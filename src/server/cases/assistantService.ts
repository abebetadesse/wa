/**
 * Production wiring for case questions (rules in ./assistant.ts): who is asking decides the
 * sources, stored literature adds citable references, answers are kept in case_assistant_turns,
 * and a crisis question from the person alerts their reviewer.
 */
import { asc, and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { caseAssistantTurns } from "@/lib/db/schema";
import type { AuthenticatedUser } from "@/lib/auth";
import { ApiError } from "@/lib/api/route";
import { bionicChat, buildBionicMessages, isBionicConfigured } from "@/lib/ai/bionicGPT";
import { literatureUrl, searchLiterature } from "@/lib/knowledge/search";
import { log } from "@/lib/log";
import { notify, notifyAdmins } from "@/server/marketplace/notifications";
import { ASSISTANT_SYSTEM_PROMPT, answerCaseQuestion, ownerSources, reviewerSources, type AssistantAnswer, type AssistantAsker, type AssistantModelRequest, type AssistantSource } from "./assistant";
import { caseService } from "./service";
import { dbCaseStore } from "./store";

async function bionicAssistant(request: AssistantModelRequest) {
  const response = await bionicChat({
    messages: buildBionicMessages(ASSISTANT_SYSTEM_PROMPT, [{ role: "user", content: JSON.stringify(request, null, 2) }]),
    temperature: 0.2,
    maxTokens: 700,
    jsonMode: true,
  });
  return response.parsedJson && typeof response.parsedJson === "object" ? (response.parsedJson as { answer?: unknown; sources?: unknown }) : null;
}

/** Stored research that matches the question, as citable sources. Missing database: none. */
async function literatureSources(question: string): Promise<AssistantSource[]> {
  try {
    const hits = await searchLiterature(question, { limit: 3 });
    return hits
      .filter((hit) => hit.abstract)
      .map((hit) => ({
        title: hit.title,
        text: hit.abstract!,
        citation: { id: hit.pmid ? `pmid:${hit.pmid}` : `literature:${hit.id}`, title: hit.title, source: hit.journal ?? hit.source, ...(literatureUrl(hit) ? { url: literatureUrl(hit) } : {}), ...(hit.pmid ? { pmid: hit.pmid } : {}) },
      }));
  } catch {
    return [];
  }
}

/** Who is asking, and what they may ask about. Throws 403/404 like the case pages do. */
async function caseFor(user: AuthenticatedUser, caseId: string): Promise<{ asker: AssistantAsker; sources: AssistantSource[]; reviewerId: string | null; label: string }> {
  const record = await dbCaseStore.get(caseId);
  if (!record) throw ApiError.notFound("Case");
  if (record.userId === user.id) {
    const view = await caseService.get(user, caseId);
    if (!view.report) throw ApiError.conflict("You can ask questions once your report is ready.");
    return { asker: "owner", sources: ownerSources(view.report), reviewerId: record.review?.expertId ?? null, label: view.label };
  }
  const view = await caseService.getForExpert(user, caseId);
  return { asker: "reviewer", sources: reviewerSources(view), reviewerId: null, label: view.label };
}

async function alertReviewer(caseId: string, reviewerId: string | null, label: string) {
  const notice = {
    type: "case.assistant_safety",
    title: "Urgent: a client may need help now",
    body: `${label}: a question asked about the report described an emergency or crisis. Please contact the client.`,
    href: `/case-review/${caseId}`,
  };
  try {
    if (reviewerId) await notify(reviewerId, notice);
    else await notifyAdmins(notice);
  } catch (error) {
    log.error("could not alert the reviewer", { source: "case-assistant", caseId, error });
  }
}

export interface AssistantTurn extends AssistantAnswer {
  id: string;
  asker: AssistantAsker;
  question: string;
  createdAt: string;
}

export async function askCase(user: AuthenticatedUser, caseId: string, question: string): Promise<AssistantTurn> {
  const { asker, sources, reviewerId, label } = await caseFor(user, caseId);
  const answer = await answerCaseQuestion(
    { asker, question, sources: [...sources, ...(await literatureSources(question))] },
    { model: isBionicConfigured() ? bionicAssistant : undefined },
  );
  if (answer.mode === "safety" && asker === "owner") await alertReviewer(caseId, reviewerId, label);
  const turn = { id: crypto.randomUUID(), caseId, userId: user.id, asker, question: question.trim(), answer: answer.text, mode: answer.mode, sources: answer.sources, createdAt: new Date() };
  await db.insert(caseAssistantTurns).values(turn);
  return { ...answer, id: turn.id, asker, question: turn.question, createdAt: turn.createdAt.toISOString() };
}

/** Earlier questions: the person sees their own; reviewers see everyone's. */
export async function caseTurns(user: AuthenticatedUser, caseId: string): Promise<AssistantTurn[]> {
  const { asker } = await caseFor(user, caseId);
  const rows = await db
    .select()
    .from(caseAssistantTurns)
    .where(asker === "owner" ? and(eq(caseAssistantTurns.caseId, caseId), eq(caseAssistantTurns.asker, "owner")) : eq(caseAssistantTurns.caseId, caseId))
    .orderBy(asc(caseAssistantTurns.createdAt))
    .limit(50);
  return rows.map((row) => ({
    id: row.id,
    asker: row.asker as AssistantAsker,
    question: row.question,
    text: row.answer,
    mode: row.mode as AssistantAnswer["mode"],
    sources: row.sources as AssistantAnswer["sources"],
    createdAt: row.createdAt.toISOString(),
  }));
}
