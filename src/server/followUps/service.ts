/**
 * Outcome check-ins: 3, 14 and 30 days after a report is delivered or a booking is completed, the
 * person is asked whether it helped and whether they noticed side effects. Answers come from the
 * app or as a one-word chat reply (1/2/3, yes/partly/no, አዎ/በከፊል/አይ). A reported side effect or
 * "did not help" flags the check-in and tells the reviewer, so a person who got worse is seen.
 *
 * Requests whose safety screen did not simply "proceed" (crisis, referral, concern) get no
 * automatic check-ins: their follow-up belongs to a person, not a timer.
 *
 * The rules live here with an injected store and notifier so they are tested without a database.
 */
import type { WorkflowCase } from "@/server/cases/types";

export const FOLLOW_UP_DAYS = [3, 14, 30] as const;
export const HELPED = ["yes", "partly", "no"] as const;
export type Helped = (typeof HELPED)[number];
export type AnswerChannel = "app" | "telegram" | "whatsapp";

/** How long after a check-in is sent a bare chat reply such as "1" still counts as its answer. */
export const CHAT_REPLY_WINDOW_DAYS = 7;

export interface FollowUpRow {
  id: string;
  userId: string;
  caseId: string | null;
  bookingId: string | null;
  domain: string | null;
  label: string;
  dayOffset: number;
  dueAt: Date;
  sentAt: Date | null;
  answeredAt: Date | null;
  answeredVia: string | null;
  helped: Helped | null;
  sideEffects: string | null;
  comment: string | null;
  needsAttention: boolean;
  reviewerId: string | null;
  businessId: string | null;
}

export type NewFollowUp = Pick<FollowUpRow, "userId" | "caseId" | "bookingId" | "domain" | "label" | "dayOffset" | "dueAt" | "reviewerId" | "businessId">;

export interface FollowUpAnswer {
  helped: Helped;
  sideEffects?: string | null;
  comment?: string | null;
}

export interface FollowUpStore {
  /** Inserts the rows that do not exist yet (one per subject and day). */
  insertMissing(rows: NewFollowUp[]): Promise<void>;
  /** Unsent, unanswered check-ins due by `now`, oldest first. */
  due(now: Date, limit: number): Promise<FollowUpRow[]>;
  /** Marks a check-in sent; false when another process already did. */
  markSent(id: string, at: Date): Promise<boolean>;
  get(id: string): Promise<FollowUpRow | null>;
  /** The person's most recent check-in sent since `since` and not answered yet. */
  latestAwaitingReply(userId: string, since: Date): Promise<FollowUpRow | null>;
  saveAnswer(id: string, answer: Required<FollowUpAnswer> & { answeredAt: Date; via: AnswerChannel; needsAttention: boolean }): Promise<FollowUpRow>;
  /** Check-ins sent to this person and not answered yet. */
  openForUser(userId: string): Promise<FollowUpRow[]>;
}

export interface Notice {
  type: string;
  title: string;
  body: string;
  href: string;
}

export interface FollowUpDeps {
  store: FollowUpStore;
  /** Delivers to the person: in-app bell, plus Telegram/WhatsApp when connected. */
  notify(userId: string, notice: Notice): Promise<void>;
  /** Tells the reviewer (or administrators when nobody reviewed it) that a check-in needs attention. */
  alert(row: FollowUpRow): Promise<void>;
  now?: () => Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const clean = (value: string | null | undefined, max = 1000) => {
  const text = value?.trim();
  return text ? text.slice(0, max) : null;
};

const REPLIES: Record<string, Helped> = {
  "1": "yes",
  yes: "yes",
  y: "yes",
  "አዎ": "yes",
  "አዎን": "yes",
  "ረድቶኛል": "yes",
  "2": "partly",
  partly: "partly",
  "በከፊል": "partly",
  "3": "no",
  no: "no",
  n: "no",
  "አይ": "no",
  "አይደለም": "no",
  "አልረዳኝም": "no",
};

/** A one-word answer to a check-in, or null when the message is something else. */
export function parseFollowUpReply(text: string): Helped | null {
  const word = text.trim().toLowerCase().replace(/^[\s"'(]+|[\s"'.!?)።]+$/gu, "");
  return REPLIES[word] ?? null;
}

export function followUpPlan(subject: Omit<NewFollowUp, "dayOffset" | "dueAt">, deliveredAt: Date): NewFollowUp[] {
  return FOLLOW_UP_DAYS.map((days) => ({ ...subject, dayOffset: days, dueAt: new Date(deliveredAt.getTime() + days * DAY_MS) }));
}

export function followUpHref(row: Pick<FollowUpRow, "id" | "caseId" | "bookingId">) {
  if (row.caseId) return `/case/workflows/${row.caseId}?followUp=${row.id}`;
  if (row.bookingId) return `/account/bookings/${row.bookingId}?followUp=${row.id}`;
  return "/account";
}

/** The check-in message. It names only the kind of service, never what the request was about. */
export function followUpNotice(row: FollowUpRow): Notice {
  const what = row.bookingId && !row.caseId ? `${row.label} session` : `${row.label} report`;
  return {
    type: "follow_up",
    title: "How are things going?",
    body: `It has been ${row.dayOffset} days since your ${what}. Did it help? Reply 1 for yes, 2 for partly or 3 for no. If you noticed any side effects or feel worse, open the link and tell us.`,
    href: followUpHref(row),
  };
}

export function needsAttention(answer: FollowUpAnswer) {
  return Boolean(clean(answer.sideEffects)) || answer.helped === "no";
}

export function createFollowUpService(deps: FollowUpDeps) {
  const now = () => deps.now?.() ?? new Date();

  async function record(row: FollowUpRow, answer: FollowUpAnswer, via: AnswerChannel) {
    const flagged = needsAttention(answer);
    const alreadyFlagged = row.needsAttention;
    const saved = await deps.store.saveAnswer(row.id, {
      helped: answer.helped,
      sideEffects: clean(answer.sideEffects),
      comment: clean(answer.comment),
      answeredAt: now(),
      via,
      needsAttention: flagged,
    });
    // Only the first time it becomes a concern; editing an answer does not alert again.
    if (flagged && !alreadyFlagged) await deps.alert(saved);
    return saved;
  }

  return {
    /** Check-ins for a workflow case whose report the person can now read. */
    async scheduleForCase(record: Pick<WorkflowCase, "id" | "userId" | "domain" | "stage" | "safety" | "review" | "businessId">, label: string) {
      if (record.safety.action !== "proceed") return 0;
      if (record.stage !== "full_report_released" && record.stage !== "visible_to_user") return 0;
      const rows = followUpPlan(
        { userId: record.userId, caseId: record.id, bookingId: null, domain: record.domain, label, reviewerId: record.review?.expertId ?? null, businessId: record.businessId ?? null },
        now(),
      );
      await deps.store.insertMissing(rows);
      return rows.length;
    },

    /** Check-ins for a completed booking that has no workflow case of its own. */
    async scheduleForBooking(booking: { bookingId: string; userId: string; businessId: string; label: string; caseId?: string | null }) {
      if (booking.caseId) return 0;
      const rows = followUpPlan(
        { userId: booking.userId, caseId: null, bookingId: booking.bookingId, domain: null, label: booking.label, reviewerId: null, businessId: booking.businessId },
        now(),
      );
      await deps.store.insertMissing(rows);
      return rows.length;
    },

    /**
     * Sends the check-ins that are due. When several for the same request are due at once (the
     * task did not run for a while) only the latest is sent and the earlier ones are skipped.
     */
    async sendDue(limit = 50) {
      const due = await deps.store.due(now(), limit);
      const latest = new Map<string, FollowUpRow>();
      for (const row of due) {
        const key = row.caseId ?? row.bookingId ?? row.id;
        const current = latest.get(key);
        if (!current || row.dayOffset > current.dayOffset) latest.set(key, row);
      }
      let sent = 0;
      for (const row of due) {
        const send = latest.get(row.caseId ?? row.bookingId ?? row.id) === row;
        if (!(await deps.store.markSent(row.id, now()))) continue;
        if (!send) continue;
        await deps.notify(row.userId, followUpNotice(row));
        sent += 1;
      }
      return sent;
    },

    /** The person's open check-ins (sent, not answered), newest first. */
    async open(userId: string) {
      return deps.store.openForUser(userId);
    },

    async answer(userId: string, id: string, answer: FollowUpAnswer, via: AnswerChannel = "app") {
      const row = await deps.store.get(id);
      if (!row || row.userId !== userId || !row.sentAt) return null;
      return record(row, answer, via);
    },

    /** Records a one-word chat reply as the answer to the person's latest open check-in. */
    async answerFromChat(userId: string, text: string, via: Exclude<AnswerChannel, "app">) {
      const helped = parseFollowUpReply(text);
      if (!helped) return null;
      const row = await deps.store.latestAwaitingReply(userId, new Date(now().getTime() - CHAT_REPLY_WINDOW_DAYS * DAY_MS));
      if (!row) return null;
      const saved = await record(row, { helped }, via);
      return { helped, label: saved.label, href: followUpHref(saved) };
    },
  };
}

export type FollowUpService = ReturnType<typeof createFollowUpService>;

/** In-memory store with the same rules, for tests. */
export function createMemoryFollowUpStore(): FollowUpStore & { rows: FollowUpRow[] } {
  const rows: FollowUpRow[] = [];
  const key = (row: Pick<FollowUpRow, "caseId" | "bookingId" | "dayOffset">) => `${row.caseId ?? ""}|${row.bookingId ?? ""}|${row.dayOffset}`;
  return {
    rows,
    async insertMissing(newRows) {
      const existing = new Set(rows.map(key));
      for (const row of newRows) {
        if (existing.has(key(row))) continue;
        rows.push({ ...row, id: `fu-${rows.length + 1}`, sentAt: null, answeredAt: null, answeredVia: null, helped: null, sideEffects: null, comment: null, needsAttention: false });
      }
    },
    async due(now, limit) {
      return rows.filter((row) => !row.sentAt && !row.answeredAt && row.dueAt <= now).sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime()).slice(0, limit);
    },
    async markSent(id, at) {
      const row = rows.find((item) => item.id === id);
      if (!row || row.sentAt) return false;
      row.sentAt = at;
      return true;
    },
    async get(id) {
      return rows.find((row) => row.id === id) ?? null;
    },
    async latestAwaitingReply(userId, since) {
      return rows.filter((row) => row.userId === userId && row.sentAt && row.sentAt >= since && !row.answeredAt).sort((a, b) => b.sentAt!.getTime() - a.sentAt!.getTime())[0] ?? null;
    },
    async saveAnswer(id, answer) {
      const row = rows.find((item) => item.id === id)!;
      Object.assign(row, { helped: answer.helped, sideEffects: answer.sideEffects, comment: answer.comment, answeredAt: answer.answeredAt, answeredVia: answer.via, needsAttention: answer.needsAttention });
      return row;
    },
    async openForUser(userId) {
      return rows.filter((row) => row.userId === userId && row.sentAt && !row.answeredAt).sort((a, b) => b.sentAt!.getTime() - a.sentAt!.getTime());
    },
  };
}
