import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { publish, userChannel } from "@/server/realtime";

type Executor = Pick<typeof db, "insert">;

export interface NotificationInput {
  type: string;
  title: string;
  body?: string;
  href?: string;
}

/** Stores an in-app notification and pushes it to the user's realtime channel. */
export async function notify(userId: string, input: NotificationInput, executor: Executor = db) {
  const [row] = await executor.insert(notifications).values({ userId, ...input }).returning({ id: notifications.id, createdAt: notifications.createdAt });
  await publish(userChannel(userId), "notification", { id: row.id, ...input, createdAt: row.createdAt }, executor);
}

export async function listNotifications(userId: string, limit = 30) {
  const [items, [{ unread }]] = await Promise.all([
    db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit),
    db.select({ unread: sql<number>`count(*)::int` }).from(notifications).where(and(eq(notifications.userId, userId), isNull(notifications.readAt))),
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
