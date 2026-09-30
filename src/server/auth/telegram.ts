/**
 * Telegram account linking via the Telegram Login Widget (https://core.telegram.org/widgets/login).
 *
 * The widget returns the Telegram user's id, name and a hash. The hash is an HMAC-SHA256 of the
 * sorted fields keyed with SHA-256(bot token), so only Telegram can produce it. A verified link
 * marks the account verified, enables "Sign in with Telegram", password-reset links over Telegram
 * and notification forwarding (the widget asks the user to allow messages from the bot).
 *
 * Setup: create a bot with @BotFather, set TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_USERNAME, and link
 * the site's domain with /setdomain (the widget does not work on localhost).
 */
import crypto from "node:crypto";
import { and, eq, isNotNull, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ApiError } from "@/lib/api/route";
import { establishAuth, type AuthenticatedUser } from "@/lib/auth";
import { logAuditEvent, logLoginAttempt, logUserActivity } from "@/lib/audit";

const MAX_AGE_SECONDS = 24 * 60 * 60;

const token = () => process.env.TELEGRAM_BOT_TOKEN?.trim() || "";

export function telegramStatus() {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "") || null;
  return { configured: Boolean(token() && botUsername), botUsername };
}

export const telegramAuthData = z
  .object({
    id: z.coerce.number().int().positive(),
    first_name: z.string().max(256).optional(),
    last_name: z.string().max(256).optional(),
    username: z.string().max(64).optional(),
    photo_url: z.string().max(1024).optional(),
    auth_date: z.coerce.number().int().positive(),
    hash: z.string().regex(/^[0-9a-f]{64}$/),
  })
  .passthrough();
export type TelegramAuthData = z.infer<typeof telegramAuthData>;

/** Pure check of a Login Widget payload. */
export function verifyTelegramLogin(data: Record<string, unknown>, botToken: string, nowSeconds = Math.floor(Date.now() / 1000)): boolean {
  if (!botToken || typeof data.hash !== "string") return false;
  const checkString = Object.keys(data)
    .filter((key) => key !== "hash" && data[key] !== undefined && data[key] !== null)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");
  const secret = crypto.createHash("sha256").update(botToken).digest();
  const expected = crypto.createHmac("sha256", secret).update(checkString).digest("hex");
  if (expected.length !== data.hash.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(data.hash))) return false;
  const authDate = Number(data.auth_date);
  return Number.isFinite(authDate) && nowSeconds - authDate <= MAX_AGE_SECONDS && authDate - nowSeconds < 300;
}

function assertValid(raw: TelegramAuthData) {
  if (!telegramStatus().configured) throw new ApiError(503, "Telegram is not set up on this site yet.");
  // Verify against the exact fields Telegram sent (strings), not coerced values.
  const fields = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, String(value)]));
  if (!verifyTelegramLogin(fields, token())) throw ApiError.badRequest("Telegram could not confirm this sign-in. Please try again.");
}

export async function linkTelegram(user: AuthenticatedUser, data: TelegramAuthData) {
  assertValid(data);
  const telegramId = String(data.id);
  const [other] = await db.select({ id: users.id }).from(users).where(and(eq(users.telegramId, telegramId), ne(users.id, user.id))).limit(1);
  if (other) throw ApiError.conflict("This Telegram account is already connected to another account.");
  await db
    .update(users)
    .set({ telegramId, telegramUsername: data.username ?? null, telegramVerifiedAt: new Date(), isVerified: true, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  await logUserActivity({ userId: user.id, activityType: "security", description: "Connected Telegram account" });
  void sendTelegramMessage(telegramId, "Your Telegram is now connected. You'll get booking updates and messages here. You can turn this off from your account page.");
  return telegramSummary(user.id);
}

export async function unlinkTelegram(user: AuthenticatedUser) {
  await db.update(users).set({ telegramId: null, telegramUsername: null, telegramVerifiedAt: null, updatedAt: new Date() }).where(eq(users.id, user.id));
  await logUserActivity({ userId: user.id, activityType: "security", description: "Disconnected Telegram account" });
  return telegramSummary(user.id);
}

export async function setTelegramNotify(user: AuthenticatedUser, enabled: boolean) {
  await db.update(users).set({ telegramNotify: enabled, updatedAt: new Date() }).where(eq(users.id, user.id));
  return telegramSummary(user.id);
}

export async function telegramSummary(userId: string) {
  const [row] = await db
    .select({ telegramId: users.telegramId, username: users.telegramUsername, verifiedAt: users.telegramVerifiedAt, notify: users.telegramNotify })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const status = telegramStatus();
  return {
    available: status.configured,
    botUsername: status.botUsername,
    connected: Boolean(row?.telegramId),
    username: row?.username ?? null,
    verifiedAt: row?.verifiedAt ?? null,
    notify: row?.notify ?? true,
  };
}

/** "Sign in with Telegram" for accounts that already connected Telegram. */
export async function loginWithTelegram(data: TelegramAuthData, meta: { request: Request; ip: string; userAgent: string }) {
  assertValid(data);
  const [user] = await db.select().from(users).where(eq(users.telegramId, String(data.id))).limit(1);
  if (!user) throw new ApiError(404, "No account is connected to this Telegram yet. Sign in with your email first, then connect Telegram from your account page.");
  if (user.isSuspended) throw ApiError.forbidden(`This account has been suspended. ${user.suspensionReason || "Please contact platform support."}`);
  if (!user.isActive) throw ApiError.forbidden("This account is inactive. Please contact support.");
  await db.update(users).set({ lastLoginAt: new Date(), loginCount: (user.loginCount || 0) + 1, failedLoginAttempts: 0, lockoutUntil: null, updatedAt: new Date() }).where(eq(users.id, user.id));
  await logLoginAttempt({ email: user.email, userId: user.id, ipAddress: meta.ip, userAgent: meta.userAgent, status: "success" });
  const session = await establishAuth({ id: user.id, role: user.role }, { request: meta.request, rememberMe: true, deviceInfo: { userAgent: meta.userAgent, ip: meta.ip, via: "telegram" } });
  await logAuditEvent({ userId: user.id, action: "user_login", resourceType: "user", resourceId: user.id, details: { via: "telegram" }, ipAddress: meta.ip, sessionId: session.sessionId });
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

// ── Messages ─────────────────────────────────────────────────────────────────

/** Best effort: failures are logged, never thrown (Telegram must not break the main action). */
export async function sendTelegramMessage(chatId: string, text: string, link?: { url: string; label: string }) {
  if (!token()) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token()}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(0, 4000),
        disable_web_page_preview: true,
        ...(link && /^https:\/\//.test(link.url) ? { reply_markup: { inline_keyboard: [[{ text: link.label, url: link.url }]] } } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.warn(`[telegram] sendMessage failed: ${res.status}`);
    return res.ok;
  } catch (error) {
    console.warn("[telegram] sendMessage error", error instanceof Error ? error.message : error);
    return false;
  }
}

/** Forwards an in-app notification when the user connected Telegram and kept forwarding on. */
export async function forwardNotification(userId: string, input: { title: string; body?: string; href?: string }) {
  if (!token()) return;
  const [row] = await db
    .select({ telegramId: users.telegramId })
    .from(users)
    .where(and(eq(users.id, userId), isNotNull(users.telegramId), eq(users.telegramNotify, true)))
    .limit(1);
  if (!row?.telegramId) return;
  const origin = process.env.APP_URL?.replace(/\/$/, "");
  const link = origin && input.href ? { url: `${origin}${input.href}`, label: "Open" } : undefined;
  await sendTelegramMessage(row.telegramId, input.body ? `${input.title}\n${input.body}` : input.title, link);
}
