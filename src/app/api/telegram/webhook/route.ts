import { NextResponse } from "next/server";
import { z } from "zod";
import { sendTelegramMessage } from "@/server/auth/telegram";
import { verifyTelegramWebhookSecret } from "@/server/auth/telegramBot";
import { receiveChatMessage } from "@/server/messaging/bot";
import { createDeduper } from "@/server/messaging/inbound";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  update_id: z.number().int().optional(),
  message: z.object({
    chat: z.object({ id: z.number().int(), type: z.string().optional() }),
    from: z.object({ id: z.number().int(), username: z.string().max(64).optional() }).optional(),
    text: z.string().max(4096).optional(),
  }).optional(),
}).passthrough();

const alreadyHandled = createDeduper();

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() ?? "";
  if (!secret) return NextResponse.json({ error: "Telegram webhook is not configured." }, { status: 503 });
  if (!verifyTelegramWebhookSecret(secret, request.headers.get("x-telegram-bot-api-secret-token"))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid Telegram update." }, { status: 400 });

  const { message, update_id: updateId } = parsed.data;
  // Accounts are linked to a person's private chat only; group messages are ignored.
  if (message?.text && (message.chat.type ?? "private") === "private" && !alreadyHandled(String(updateId ?? ""))) {
    try {
      const reply = await receiveChatMessage("telegram", String(message.chat.id), message.text, { username: message.from?.username });
      if (reply) await sendTelegramMessage(String(message.chat.id), reply.text, reply.link);
    } catch (error) {
      // Answer 200 regardless: Telegram retries failed deliveries, which would repeat the message.
      console.error("[telegram] webhook handling failed:", error instanceof Error ? error.message : error);
    }
  }
  return NextResponse.json({ ok: true });
}
