/**
 * Criteria-based auto-responses, response drafts and each business's own manuscript texts (Fewus, Asmat).
 *
 * When a booking arrives, active rules for the business (and service) are matched against the
 * intake: dropdown choice, keywords, the Ge'ez name's digital root, the Awde Negest humour and an
 * urgency score. Plain acknowledgements may go straight to the client; anything with remedies or
 * manuscript text, and anything for an urgent intake, becomes a draft the healer approves in one click.
 */
import { and, asc, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { autoResponseRules, bookings, businesses, conversations, fewusTexts, messages, remedies, responseDrafts, services, users } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import type { AuthenticatedUser } from "@/lib/auth";
import { requireCapability, roleCan, type MemberRole } from "@/server/marketplace/access";
import { businessMembers } from "@/lib/db/schema";
import { notify } from "@/server/marketplace/notifications";
import { businessChannel, publish, userChannel } from "@/server/realtime";
import { calculateHealerProfile, formatHealerProfile, type HealerProfile } from "@/lib/cultural/healerProfileCalculator";
import { composeManuscriptBlock, manuscriptCatalogue, manuscriptSelectionFor, sourceForHeadingKey, type ManuscriptSource } from "./manuscripts";
import { assessUrgency } from "@/lib/evaluation/urgencyTriage";
import { renderTemplate, ruleMatches, sendDecision, type IntakeSignals } from "./rules";
import type { StoredIntake } from "./settings";

type Executor = Pick<typeof db, "insert" | "select" | "update">;

// ── Rules ────────────────────────────────────────────────────────────────────

const HUMORS = ["esat", "may", "nifas", "afere"] as const;

export const ruleInput = z
  .object({
    name: z.string().trim().min(2).max(160),
    serviceId: z.string().uuid().nullable().default(null),
    isActive: z.boolean().default(true),
    triggerCriteria: z
      .object({
        dropdownValues: z.array(z.string().trim().min(1).max(80)).max(60).optional(),
        keywords: z.array(z.string().trim().min(1).max(80)).max(40).optional(),
        digitalRoots: z.array(z.number().int().min(1).max(9)).max(9).optional(),
        humors: z.array(z.enum(HUMORS)).max(4).optional(),
        minUrgency: z.number().int().min(0).max(100).optional(),
        maxUrgency: z.number().int().min(0).max(100).optional(),
      })
      .default({}),
    responseMode: z.enum(["instant_auto_send", "draft_for_review"]),
    templateTitle: z.string().trim().min(2).max(200),
    templateBody: z.string().trim().min(2).max(6000),
    attachedRemedies: z.array(z.object({ remedyId: z.string().uuid().optional(), name: z.string().trim().min(1).max(160), note: z.string().trim().max(300).optional() })).max(10).default([]),
    includeFewusText: z.boolean().default(false),
    includeProfile: z.boolean().default(false),
    priority: z.number().int().min(0).max(1000).default(100),
  })
  .refine((v) => v.responseMode === "draft_for_review" || (!v.attachedRemedies.length && !v.includeFewusText), {
    message: "Responses with remedies or manuscript texts must be reviewed before sending: choose “Draft for review”.",
    path: ["responseMode"],
  });

async function assertRuleRefs(businessId: string, input: z.infer<typeof ruleInput>) {
  if (input.serviceId) {
    const [service] = await db.select({ id: services.id }).from(services).where(and(eq(services.id, input.serviceId), eq(services.businessId, businessId))).limit(1);
    if (!service) throw ApiError.badRequest("That service does not belong to this business.");
  }
  const ids = input.attachedRemedies.map((r) => r.remedyId).filter((id): id is string => Boolean(id));
  if (ids.length) {
    const found = await db.select({ id: remedies.id }).from(remedies).where(and(inArray(remedies.id, ids), eq(remedies.businessId, businessId)));
    if (found.length !== new Set(ids).size) throw ApiError.badRequest("Some remedies are not in this business's stock list.");
  }
}

export async function listRules(user: AuthenticatedUser, businessId: string) {
  await requireCapability(user, businessId, "manageServices");
  return db.select().from(autoResponseRules).where(eq(autoResponseRules.businessId, businessId)).orderBy(asc(autoResponseRules.priority), asc(autoResponseRules.name));
}

export async function createRule(user: AuthenticatedUser, businessId: string, input: z.infer<typeof ruleInput>) {
  await requireCapability(user, businessId, "manageServices");
  await assertRuleRefs(businessId, input);
  const [row] = await db.insert(autoResponseRules).values({ ...input, businessId, createdBy: user.id }).returning();
  return row;
}

export async function updateRule(user: AuthenticatedUser, businessId: string, ruleId: string, input: z.infer<typeof ruleInput>) {
  await requireCapability(user, businessId, "manageServices");
  await assertRuleRefs(businessId, input);
  const [row] = await db.update(autoResponseRules).set({ ...input, updatedAt: new Date() }).where(and(eq(autoResponseRules.id, ruleId), eq(autoResponseRules.businessId, businessId))).returning();
  if (!row) throw ApiError.notFound("Rule");
  return row;
}

export async function deleteRule(user: AuthenticatedUser, businessId: string, ruleId: string) {
  await requireCapability(user, businessId, "manageServices");
  const [row] = await db.delete(autoResponseRules).where(and(eq(autoResponseRules.id, ruleId), eq(autoResponseRules.businessId, businessId))).returning({ id: autoResponseRules.id });
  if (!row) throw ApiError.notFound("Rule");
  return { deleted: true };
}

// ── Running rules on a new booking ───────────────────────────────────────────

async function ensureConversation(executor: Executor, businessId: string, clientUserId: string, bookingId: string) {
  const [row] = await executor
    .insert(conversations)
    .values({ businessId, clientUserId, bookingId })
    .onConflictDoUpdate({ target: [conversations.businessId, conversations.clientUserId], set: { bookingId, updatedAt: new Date() } })
    .returning({ id: conversations.id });
  return row.id;
}

/** Inserts a business-side message (senderId null for automatic ones) and announces it. */
async function postMessage(executor: Executor, conversationId: string, businessId: string, clientUserId: string, body: string, senderId: string | null) {
  const [message] = await executor.insert(messages).values({ conversationId, senderId, senderSide: "business", body }).returning();
  await executor.update(conversations).set({ lastMessageAt: message.createdAt, updatedAt: new Date() }).where(eq(conversations.id, conversationId));
  await publish([businessChannel(businessId), userChannel(clientUserId)], "message.created", { conversationId, message }, executor as typeof db);
  return message;
}

async function reviewers(businessId: string) {
  const rows = await db.select({ userId: businessMembers.userId, role: businessMembers.role }).from(businessMembers).where(eq(businessMembers.businessId, businessId));
  return rows.filter((row) => roleCan(row.role as MemberRole, "viewClientNotes")).map((row) => row.userId);
}

function safeProfile(intake: StoredIntake | null): HealerProfile | null {
  if (!intake?.nameGeez) return null;
  try {
    return calculateHealerProfile({ nameGeez: intake.nameGeez, motherNameGeez: intake.motherNameGeez, category: intake.dropdownType === "awde_negest" ? intake.dropdownValue ?? undefined : undefined });
  } catch {
    return null;
  }
}

/** The business's own text for a manuscript heading (Fewus or Asmat keys share one table). */
async function manuscriptTextFor(businessId: string, headingKey: string | null) {
  if (!headingKey) return null;
  const [row] = await db.select().from(fewusTexts).where(and(eq(fewusTexts.businessId, businessId), eq(fewusTexts.headingKey, headingKey))).limit(1);
  return row ?? null;
}

export async function runAutoResponses(bookingId: string) {
  const [row] = await db
    .select({ booking: bookings, serviceName: services.name, businessName: businesses.name, timezone: businesses.timezone, clientName: users.name })
    .from(bookings)
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .innerJoin(businesses, eq(businesses.id, bookings.businessId))
    .leftJoin(users, eq(users.id, bookings.bookedByUserId))
    .where(eq(bookings.id, bookingId))
    .limit(1);
  if (!row?.booking.bookedByUserId) return { sent: 0, drafted: 0, urgency: null };
  const { booking } = row;
  const clientUserId = booking.bookedByUserId!;
  const intake = (booking.intake as StoredIntake | null) ?? null;
  const safety = (booking.safety as { answers?: { pregnantOrBreastfeeding?: string; conditions?: string } } | null)?.answers;

  const text = [intake?.dropdownLabel, intake?.text, booking.clientNote, safety?.conditions].filter(Boolean).join("\n");
  const urgency = assessUrgency(text, { pregnant: safety?.pregnantOrBreastfeeding === "yes" });
  const profile = safeProfile(intake);
  const signals: IntakeSignals = { dropdownValue: intake?.dropdownValue ?? null, text, digitalRoot: profile?.gematria.digitalRoot ?? null, humor: profile?.humor.key ?? null, urgencyScore: urgency.score };

  const rules = await db
    .select()
    .from(autoResponseRules)
    .where(and(eq(autoResponseRules.businessId, booking.businessId), eq(autoResponseRules.isActive, true), or(isNull(autoResponseRules.serviceId), eq(autoResponseRules.serviceId, booking.serviceId))))
    .orderBy(asc(autoResponseRules.priority));
  const matched = rules.filter((rule) => ruleMatches(rule.triggerCriteria, signals));

  const variables = {
    client_name: row.clientName ?? "",
    service_name: row.serviceName,
    business_name: row.businessName,
    booking_reference: booking.reference,
    booking_time: new Intl.DateTimeFormat("en-GB", { timeZone: row.timezone, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(booking.startsAt),
    selection: intake?.dropdownLabel ?? "",
    digital_root: profile ? String(profile.gematria.digitalRoot) : "",
    circle: profile ? `${profile.awdeNegest.circleGeez} (${profile.awdeNegest.circleName})` : "",
    humor: profile ? `${profile.humor.am} / ${profile.humor.en}` : "",
  };
  const selection = manuscriptSelectionFor(intake);
  const manuscriptText = selection && matched.some((r) => r.includeFewusText) ? await manuscriptTextFor(booking.businessId, selection.heading.key) : null;

  let sent = 0;
  let drafted = 0;
  await db.transaction(async (tx) => {
    const conversationId = await ensureConversation(tx, booking.businessId, clientUserId, booking.id);
    for (const rule of matched) {
      const extras = [rule.includeFewusText && selection ? composeManuscriptBlock(selection, manuscriptText, { essentialCautionsOnly: true }) : "", rule.includeProfile && profile ? formatHealerProfile(profile) : ""].filter(Boolean);
      const body = [renderTemplate(rule.templateBody, variables), ...extras].filter(Boolean).join("\n\n");
      const title = renderTemplate(rule.templateTitle, variables);
      const decision = sendDecision(rule, urgency.score);
      if (decision.send) {
        const message = await postMessage(tx, conversationId, booking.businessId, clientUserId, body, null);
        await tx.insert(responseDrafts).values({ businessId: booking.businessId, bookingId: booking.id, ruleId: rule.id, source: "rule", title, body, remedies: rule.attachedRemedies, status: "sent", messageId: message.id, sentAt: new Date() });
        sent++;
      } else {
        await tx.insert(responseDrafts).values({ businessId: booking.businessId, bookingId: booking.id, ruleId: rule.id, source: "rule", title, body, remedies: rule.attachedRemedies, status: "draft", heldReason: decision.heldReason });
        drafted++;
      }
    }
    // Danger signs: the client is pointed to care straight away, whatever the rules say.
    if (urgency.level === "emergency" || urgency.level === "urgent") {
      const body = `Automatic safety message from ${row.businessName}: what you wrote mentions ${urgency.signs.map((s) => s.label.toLowerCase()).join(", ")}. ${urgency.advice} We will still contact you about your booking ${booking.reference}.`;
      const message = await postMessage(tx, conversationId, booking.businessId, clientUserId, body, null);
      await tx.insert(responseDrafts).values({ businessId: booking.businessId, bookingId: booking.id, source: "system", title: "Automatic safety message", body, status: "sent", messageId: message.id, sentAt: new Date() });
    }
    await publish(businessChannel(booking.businessId), "intake.responses", { bookingId: booking.id, sent, drafted, urgency: urgency.level }, tx);
  });

  if (drafted || urgency.level === "emergency" || urgency.level === "urgent") {
    const title = urgency.level === "emergency" ? "Urgent intake: danger signs described" : drafted ? `${drafted} response${drafted === 1 ? "" : "s"} ready to review` : "Intake needs a prompt reply";
    for (const id of await reviewers(booking.businessId)) {
      await notify(id, { type: "intake.review", title, body: `${row.serviceName} · ${booking.reference}`, href: `/business/${booking.businessId}/bookings/${booking.id}` }).catch(() => null);
    }
  }
  return { sent, drafted, urgency: urgency.level };
}

// ── Drafts ───────────────────────────────────────────────────────────────────

async function bookingOf(businessId: string, bookingId: string) {
  const [row] = await db.select().from(bookings).where(and(eq(bookings.id, bookingId), eq(bookings.businessId, businessId))).limit(1);
  if (!row) throw ApiError.notFound("Booking");
  return row;
}

export const draftInput = z.object({
  title: z.string().trim().min(2).max(200),
  body: z.string().trim().min(2).max(8000),
  remedies: z.array(z.object({ remedyId: z.string().uuid().optional(), name: z.string().trim().min(1).max(160), note: z.string().trim().max(300).optional() })).max(10).default([]),
});

export async function listDrafts(user: AuthenticatedUser, businessId: string, bookingId: string) {
  await requireCapability(user, businessId, "viewClientNotes");
  await bookingOf(businessId, bookingId);
  return db.select().from(responseDrafts).where(and(eq(responseDrafts.businessId, businessId), eq(responseDrafts.bookingId, bookingId))).orderBy(desc(responseDrafts.createdAt));
}

export async function createDraft(user: AuthenticatedUser, businessId: string, bookingId: string, input: z.infer<typeof draftInput>) {
  await requireCapability(user, businessId, "viewClientNotes");
  await bookingOf(businessId, bookingId);
  const [row] = await db.insert(responseDrafts).values({ businessId, bookingId, source: "manual", ...input, createdBy: user.id }).returning();
  await publish(businessChannel(businessId), "intake.responses", { bookingId });
  return row;
}

export async function updateDraft(user: AuthenticatedUser, businessId: string, draftId: string, input: z.infer<typeof draftInput>) {
  await requireCapability(user, businessId, "viewClientNotes");
  const [row] = await db
    .update(responseDrafts)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(responseDrafts.id, draftId), eq(responseDrafts.businessId, businessId), eq(responseDrafts.status, "draft")))
    .returning();
  if (!row) throw ApiError.conflict("This draft was already sent or dismissed.");
  return row;
}

export async function sendDraft(user: AuthenticatedUser, businessId: string, draftId: string) {
  await requireCapability(user, businessId, "viewClientNotes");
  await requireCapability(user, businessId, "message");
  return db.transaction(async (tx) => {
    const [draft] = await tx.select().from(responseDrafts).where(and(eq(responseDrafts.id, draftId), eq(responseDrafts.businessId, businessId))).limit(1);
    if (!draft || draft.status !== "draft") throw ApiError.conflict("This draft was already sent or dismissed.");
    const booking = await bookingOf(businessId, draft.bookingId);
    if (!booking.bookedByUserId) throw ApiError.badRequest("This client has no account to message; contact them directly.");
    const conversationId = await ensureConversation(tx, businessId, booking.bookedByUserId, booking.id);
    const remedyLines = draft.remedies.length ? `\n\n${draft.remedies.map((r) => `• ${r.name}${r.note ? `: ${r.note}` : ""}`).join("\n")}` : "";
    const message = await postMessage(tx, conversationId, businessId, booking.bookedByUserId, `${draft.body}${remedyLines}`, user.id);
    const [updated] = await tx.update(responseDrafts).set({ status: "sent", messageId: message.id, sentBy: user.id, sentAt: new Date(), updatedAt: new Date() }).where(eq(responseDrafts.id, draftId)).returning();
    await publish(businessChannel(businessId), "intake.responses", { bookingId: booking.id }, tx);
    return updated;
  });
}

export async function dismissDraft(user: AuthenticatedUser, businessId: string, draftId: string) {
  await requireCapability(user, businessId, "viewClientNotes");
  const [row] = await db.update(responseDrafts).set({ status: "dismissed", updatedAt: new Date() }).where(and(eq(responseDrafts.id, draftId), eq(responseDrafts.businessId, businessId), eq(responseDrafts.status, "draft"))).returning();
  if (!row) throw ApiError.conflict("This draft was already sent or dismissed.");
  return row;
}

/** "Auto-communicate to client": the healer sends a prepared block straight away. */
export async function sendNow(user: AuthenticatedUser, businessId: string, bookingId: string, input: { title: string; body: string }) {
  const draft = await createDraft(user, businessId, bookingId, { ...input, remedies: [] });
  return sendDraft(user, businessId, draft.id);
}

// ── Manuscript texts (each business's own, per heading) ──────────────────────

export const manuscriptTextInput = z.object({
  geezText: z.string().trim().max(8000).optional(),
  amharicText: z.string().trim().max(8000).optional(),
  guidance: z.string().trim().max(4000).optional(),
});
/** Kept for the original Fewus routes. */
export const fewusTextInput = manuscriptTextInput;

export async function listManuscriptLibrary(user: AuthenticatedUser, businessId: string, source: ManuscriptSource) {
  await requireCapability(user, businessId, "view");
  const texts = await db.select().from(fewusTexts).where(eq(fewusTexts.businessId, businessId));
  const catalogue = manuscriptCatalogue(source);
  return { ...catalogue, headings: catalogue.headings.map((heading) => ({ ...heading, text: texts.find((t) => t.headingKey === heading.heading.key) ?? null })) };
}

export const listFewusLibrary = (user: AuthenticatedUser, businessId: string) => listManuscriptLibrary(user, businessId, "metsehafe_fewus");

export async function saveManuscriptText(user: AuthenticatedUser, businessId: string, headingKey: string, input: z.infer<typeof manuscriptTextInput>) {
  await requireCapability(user, businessId, "viewClientNotes");
  if (!sourceForHeadingKey(headingKey)) throw ApiError.notFound("Heading");
  const values = { geezText: input.geezText || null, amharicText: input.amharicText || null, guidance: input.guidance || null, updatedBy: user.id, updatedAt: new Date() };
  const [row] = await db.insert(fewusTexts).values({ businessId, headingKey, ...values }).onConflictDoUpdate({ target: [fewusTexts.businessId, fewusTexts.headingKey], set: values }).returning();
  await publish(businessChannel(businessId), "intake.library", { headingKey });
  return row;
}

export const saveFewusText = saveManuscriptText;

export { manuscriptTextFor, safeProfile };
