/**
 * Production wiring for outcome check-ins (rules in ./service.ts): the follow_ups table, delivery
 * through notify() (in-app, Telegram, WhatsApp) and the outcome figures for the admin dashboard.
 */
import { and, count, desc, eq, gte, isNotNull, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { businesses, businessMembers, followUps, users } from "@/lib/db/schema";
import { log } from "@/lib/log";
import { notify, notifyAdmins } from "@/server/marketplace/notifications";
import { roleCan, type MemberRole } from "@/server/marketplace/roles";
import { createFollowUpService, type FollowUpRow, type FollowUpStore, type Helped } from "./service";

export * from "./service";

type Row = typeof followUps.$inferSelect;
const toRow = (row: Row): FollowUpRow => ({ ...row, helped: (row.helped as Helped | null) ?? null });

function affected(result: unknown): number {
  const header = Array.isArray(result) ? result[0] : result;
  return Number((header as { affectedRows?: number } | undefined)?.affectedRows ?? 0);
}

export const dbFollowUpStore: FollowUpStore = {
  async insertMissing(rows) {
    if (!rows.length) return;
    // The unique (case, day) and (booking, day) keys make a repeated delivery a no-op.
    await db.insert(followUps).values(rows).onDuplicateKeyUpdate({ set: { dueAt: sql`${followUps.dueAt}` } });
  },
  async due(now, limit) {
    const rows = await db
      .select()
      .from(followUps)
      .where(and(isNull(followUps.sentAt), isNull(followUps.answeredAt), lte(followUps.dueAt, now)))
      .orderBy(followUps.dueAt)
      .limit(limit);
    return rows.map(toRow);
  },
  async markSent(id, at) {
    return affected(await db.update(followUps).set({ sentAt: at }).where(and(eq(followUps.id, id), isNull(followUps.sentAt)))) === 1;
  },
  async get(id) {
    const [row] = await db.select().from(followUps).where(eq(followUps.id, id)).limit(1);
    return row ? toRow(row) : null;
  },
  async latestAwaitingReply(userId, since) {
    const [row] = await db
      .select()
      .from(followUps)
      .where(and(eq(followUps.userId, userId), isNull(followUps.answeredAt), gte(followUps.sentAt, since)))
      .orderBy(desc(followUps.sentAt))
      .limit(1);
    return row ? toRow(row) : null;
  },
  async saveAnswer(id, answer) {
    await db
      .update(followUps)
      .set({ helped: answer.helped, sideEffects: answer.sideEffects, comment: answer.comment, answeredAt: answer.answeredAt, answeredVia: answer.via, needsAttention: answer.needsAttention })
      .where(eq(followUps.id, id));
    const [row] = await db.select().from(followUps).where(eq(followUps.id, id)).limit(1);
    return toRow(row);
  },
  async openForUser(userId) {
    const rows = await db
      .select()
      .from(followUps)
      .where(and(eq(followUps.userId, userId), isNotNull(followUps.sentAt), isNull(followUps.answeredAt)))
      .orderBy(desc(followUps.sentAt))
      .limit(20);
    return rows.map(toRow);
  },
};

const WHAT_HAPPENED: Record<Helped, string> = { yes: "said it helped", partly: "said it helped partly", no: "said it did not help" };

/** Who hears about a worrying answer: the reviewer, else the business's booking staff, else administrators. */
async function alert(row: FollowUpRow) {
  const notice = {
    type: "follow_up.attention",
    title: "A client may need a check-in",
    body: `${row.label}, day ${row.dayOffset}: the client ${row.helped ? WHAT_HAPPENED[row.helped] : "answered"}${row.sideEffects ? " and reported side effects" : ""}.`,
    href: row.caseId ? `/case-review/${row.caseId}` : row.businessId ? `/business/${row.businessId}/bookings?focus=${row.bookingId}` : "/admin",
  };
  if (row.reviewerId) return notify(row.reviewerId, notice);
  if (row.businessId) {
    const members = await db.select({ userId: businessMembers.userId, role: businessMembers.role }).from(businessMembers).where(eq(businessMembers.businessId, row.businessId));
    const staff = members.filter((member) => roleCan(member.role as MemberRole, "manageBookings"));
    if (staff.length) {
      await Promise.all(staff.map((member) => notify(member.userId, notice)));
      return;
    }
  }
  await notifyAdmins(notice);
}

export const followUpService = createFollowUpService({
  store: dbFollowUpStore,
  notify: async (userId, notice) => {
    await notify(userId, notice);
  },
  alert: async (row) => {
    await alert(row).catch((error) => log.error("follow-up alert failed", { source: "follow-ups", followUpId: row.id, error }));
  },
});

/** Scheduling never blocks the action that triggered it (approval, payment, completed booking). */
export function scheduleSafely(work: () => Promise<unknown>, context: Record<string, unknown>) {
  return work().catch((error) => log.error("could not schedule follow-ups", { source: "follow-ups", ...context, error }));
}

const rate = (helped: number, answered: number) => (answered ? Math.round((helped / answered) * 100) : null);

/** Answered check-ins grouped by domain, reviewer and business, for the admin dashboard. */
export async function outcomeSummary() {
  const helpedWeight = sql<number>`SUM(CASE ${followUps.helped} WHEN 'yes' THEN 1 WHEN 'partly' THEN 0.5 ELSE 0 END)`;
  const answered = isNotNull(followUps.answeredAt);
  const [totals, byDomain, byReviewer, byBusiness, attention] = await Promise.all([
    db.select({ sent: count(followUps.sentAt), answered: count(followUps.answeredAt) }).from(followUps),
    db.select({ key: followUps.domain, answered: count(), helped: helpedWeight }).from(followUps).where(answered).groupBy(followUps.domain),
    db.select({ key: users.name, id: followUps.reviewerId, answered: count(), helped: helpedWeight }).from(followUps).innerJoin(users, eq(users.id, followUps.reviewerId)).where(answered).groupBy(followUps.reviewerId, users.name),
    db.select({ key: businesses.name, id: followUps.businessId, answered: count(), helped: helpedWeight }).from(followUps).innerJoin(businesses, eq(businesses.id, followUps.businessId)).where(answered).groupBy(followUps.businessId, businesses.name),
    db.select({ total: count() }).from(followUps).where(eq(followUps.needsAttention, true)),
  ]);
  const shape = (rows: Array<{ key: string | null; answered: number; helped: number | string | null }>) =>
    rows
      .map((row) => ({ name: row.key ?? "Unassigned", answered: Number(row.answered), helpedRate: rate(Number(row.helped ?? 0), Number(row.answered)) }))
      .sort((a, b) => b.answered - a.answered);
  return {
    sent: Number(totals[0]?.sent ?? 0),
    answered: Number(totals[0]?.answered ?? 0),
    needsAttention: Number(attention[0]?.total ?? 0),
    byDomain: shape(byDomain),
    byReviewer: shape(byReviewer),
    byBusiness: shape(byBusiness),
  };
}
