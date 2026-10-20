/** Production wiring for chat intake (rules in ./chatIntake.ts): progress in chat_intakes, cases via the case service. */
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chatIntakes, users } from "@/lib/db/schema";
import { getUserPermissions, type AuthenticatedUser } from "@/lib/auth";
import { ApiError } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";
import { createChatIntake, type CaseSnapshot, type ChatIntakeState } from "./chatIntake";

/** The linked account as the case service expects it; chat messages act as that person. */
async function chatUser(userId: string): Promise<AuthenticatedUser> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      roleId: users.roleId,
      phone: users.phone,
      preferredLanguage: users.preferredLanguage,
      gender: users.gender,
      region: users.region,
      city: users.city,
      isVerified: users.isVerified,
      isActive: users.isActive,
    })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.isActive, true), eq(users.isSuspended, false)))
    .limit(1);
  if (!user) throw ApiError.unauthorized();
  return { ...user, permissions: await getUserPermissions(user.id, user.role) };
}

const snapshot = (view: { id: string; stage: CaseSnapshot["stage"]; safety: CaseSnapshot["safety"] }): CaseSnapshot => ({ id: view.id, stage: view.stage, safety: view.safety });

export const chatIntake = createChatIntake({
  store: {
    async get(userId) {
      const [row] = await db.select({ state: chatIntakes.state }).from(chatIntakes).where(eq(chatIntakes.userId, userId)).limit(1);
      return (row?.state as ChatIntakeState | undefined) ?? null;
    },
    async save(userId, state) {
      await db.insert(chatIntakes).values({ userId, state, updatedAt: new Date() }).onDuplicateKeyUpdate({ set: { state, updatedAt: new Date() } });
    },
    async clear(userId) {
      await db.delete(chatIntakes).where(eq(chatIntakes.userId, userId));
    },
  },
  cases: {
    start: async (userId, domain, input) => snapshot(await caseService.start(await chatUser(userId), domain, input)),
    answer: async (userId, caseId, answers) => snapshot(await caseService.answer(await chatUser(userId), caseId, answers)),
    submit: async (userId, caseId) => snapshot(await caseService.submit(await chatUser(userId), caseId)),
  },
});
