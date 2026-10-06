import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { publish, userChannel } from "@/server/realtime";
import { deliverToUser } from "@/server/messaging/accounts";
import { insertReturning } from "@/lib/db/write";

type Executor = Pick<typeof db, "select" | "insert">;

export interface NotificationInput {
  type: string;
  title: string;
  body?: string;
  href?: string;
}

/** Stores an in-app notification, pushes it to the user's realtime channel and to the chat apps (Telegram, WhatsApp) they connected. */
export async function notify(userId: string, input: NotificationInput, executor: Executor = db) {
  const [row] = await insertReturning(executor, notifications, { userId, ...input }, { fields: { id: notifications.id, createdAt: notifications.createdAt } });
  await publish(userChannel(userId), "notification", { id: row.id, ...input, createdAt: row.createdAt }, executor);
  // Best effort and off the request path; a chat app outage never fails the action.
  setTimeout(() => void deliverToUser(userId, input).catch(() => null), 250);
}

/** Notifies every active platform administrator (payments to confirm, businesses to verify …). */
export async function notifyAdmins(input: NotificationInput) {
  const admins = await db.select({ id: users.id }).from(users).where(and(inArray(users.role, ["admin", "super_admin"]), eq(users.isActive, true)));
  await Promise.all(admins.map((admin) => notify(admin.id, input).catch(() => null)));
}

export async function listNotifications(userId: string, limit = 30) {
  const [items, [{ unread }]] = await Promise.all([
    db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit),
    db.select({ unread: sql<number>`count(*)` }).from(notifications).where(and(eq(notifications.userId, userId), isNull(notifications.readAt))),
  ]);
  return { items, unread };
}

export async function markNotificationsRead(userId: string, id?: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt), id ? eq(notifications.id, id) : undefined));
  return listNotifications(userId);
}
