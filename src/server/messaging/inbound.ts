/**
 * What the Telegram and WhatsApp bots do with a message from a person.
 *
 *   connect code   links the chat to the account that created the code
 *   status         lists the person's recent requests
 *   stop           turns update forwarding off for this chat app
 *   help, privacy  explain the bot
 *   anything else  is treated as a reply to the reviewer and added to the open request
 *
 * The same commands work on both apps (Telegram also accepts them with a leading slash).
 * Dependencies are injected so the behaviour is tested without a database or network.
 */
import { readLinkCode, verifyLinkCode, type LinkChannel } from "./linkCodes";

export interface BotReply {
  text: string;
  link?: { url: string; label: string };
}

export type BotCommand =
  | { type: "link"; code: string }
  | { type: "start" | "help" | "privacy" | "status" | "stop" }
  | { type: "text"; text: string };

const WORDS: Record<string, "start" | "help" | "privacy" | "status" | "stop"> = {
  start: "start",
  help: "help",
  "እርዳታ": "help",
  privacy: "privacy",
  status: "status",
  "ሁኔታ": "status",
  stop: "stop",
  "አቁም": "stop",
};

const CODE = /^[A-Za-z0-9_-]{40}$/;

export function parseBotCommand(text: string): BotCommand {
  const trimmed = text.trim();
  const [first = "", second = "", ...rest] = trimmed.split(/\s+/);
  const word = first.replace(/^\//, "").split("@", 1)[0].toLowerCase();
  if ((word === "start" || word === "connect") && CODE.test(second) && !rest.length) return { type: "link", code: second };
  if (CODE.test(trimmed)) return { type: "link", code: trimmed };
  // A command is one word; "stop him shouting" is a message, not the stop command.
  if (!second && WORDS[word]) return { type: WORDS[word] };
  return { type: "text", text: trimmed };
}

export const BOT_STAGE_LABELS: Record<string, string> = {
  intake: "not submitted yet",
  referred: "referral advised",
  crisis_routed: "support contacts shared",
  awaiting_expert: "waiting for a reviewer",
  in_review: "being reviewed",
  visible_to_user: "report ready",
  full_report_released: "full report available",
  consultation_requested: "consultation requested",
};

export interface InboundDeps {
  appUrl: string;
  findUser(channel: LinkChannel, sender: string): Promise<{ id: string } | null>;
  currentLink(channel: LinkChannel, userId: string): Promise<string | null | undefined>;
  link(channel: LinkChannel, userId: string, sender: string, username?: string): Promise<boolean>;
  setNotify(channel: LinkChannel, userId: string, enabled: boolean): Promise<void>;
  /** Called for every message from a linked WhatsApp number (opens the 24-hour reply window). */
  touch?(channel: LinkChannel, userId: string): Promise<void>;
  cases: {
    replyFromChannel(userId: string, body: string, via: LinkChannel): Promise<{ caseId: string; label: string } | null>;
    statusFor(userId: string): Promise<Array<{ id: string; label: string; stage: string; waitingForReply: boolean }>>;
  };
}

const NAME = { telegram: "Telegram", whatsapp: "WhatsApp" } as const;

export async function handleInbound(channel: LinkChannel, sender: string, text: string, deps: InboundDeps, meta: { username?: string } = {}): Promise<BotReply | null> {
  const base = deps.appUrl.replace(/\/$/, "");
  const page = (path: string, label: string) => (/^https:\/\//.test(base) ? { url: `${base}${path}`, label } : undefined);
  const command = parseBotCommand(text);

  if (command.type === "link") {
    const expired = { text: "This connect link has expired or was already used. Open your account page and tap Connect again.", link: page("/account", "Open your account") };
    const userId = readLinkCode(command.code);
    if (!userId) return expired;
    const linked = await deps.currentLink(channel, userId);
    if (linked === undefined || !verifyLinkCode(channel, command.code, linked)) return expired;
    if (!(await deps.link(channel, userId, sender, meta.username))) {
      return { text: `This ${NAME[channel]} account is already connected to another account. Disconnect it there first.` };
    }
    return {
      text: `Your ${NAME[channel]} is now connected. Updates about your requests, bookings and payments will arrive here, and you can answer your reviewer by replying in this chat. Send STATUS to see your requests or STOP to turn updates off.`,
      link: page("/case/workflows", "Open your requests"),
    };
  }

  if (command.type === "privacy") {
    return { text: `${NAME[channel]} is used only for the updates you switched on and for replies you send to your reviewer. Updates about sensitive requests never include their content. Disconnect or turn forwarding off from your account page, or send STOP here.` };
  }

  const user = await deps.findUser(channel, sender);
  if (!user) {
    return {
      text: `Welcome to Ethiopian Wisdom Atlas. To receive your updates here and reply to your reviewer, sign in on the website, open your account page and tap Connect ${NAME[channel]}.`,
      link: page("/account", "Open your account"),
    };
  }
  await deps.touch?.(channel, user.id);

  if (command.type === "start" || command.type === "help") {
    return {
      text: "You are connected. Updates about your requests arrive here. Reply in this chat to answer your reviewer, send STATUS to see your requests, or STOP to turn updates off.",
      link: page("/case/workflows", "Open your requests"),
    };
  }
  if (command.type === "stop") {
    await deps.setNotify(channel, user.id, false);
    return { text: `Updates on ${NAME[channel]} are now off. You can turn them on again from your account page.`, link: page("/account", "Open your account") };
  }
  if (command.type === "status") {
    const cases = await deps.cases.statusFor(user.id);
    if (!cases.length) return { text: "You have no requests yet. Open the app to start one.", link: page("/case/workflows", "Start a request") };
    const lines = cases.map((item) => `• ${item.label}: ${BOT_STAGE_LABELS[item.stage] ?? item.stage}${item.waitingForReply ? " — your reviewer is waiting for your reply" : ""}`);
    return { text: `Your requests:\n${lines.join("\n")}`, link: page("/case/workflows", "Open your requests") };
  }

  if (command.type !== "text") return null;
  try {
    const target = await deps.cases.replyFromChannel(user.id, command.text, channel);
    if (!target) return { text: "You have no request under review at the moment, so this message was not sent to anyone. Open the app to start a request or read your reports.", link: page("/case/workflows", "Open your requests") };
    return { text: `Thank you. Your reply was added to your ${target.label} request and your reviewer has been told.`, link: page(`/case/workflows/${target.caseId}`, "Open the request") };
  } catch (error) {
    console.error(`[${channel}] could not record a reply:`, error instanceof Error ? error.message : error);
    return { text: "Your message could not be added to your request. Please reply from the app instead.", link: page("/case/workflows", "Open your requests") };
  }
}

/** Remembers recently handled delivery ids so a webhook retry does not add the same reply twice. */
export function createDeduper(max = 2000) {
  const seen = new Set<string>();
  return (id: string) => {
    if (!id) return false;
    if (seen.has(id)) return true;
    seen.add(id);
    if (seen.size > max) seen.delete(seen.values().next().value!);
    return false;
  };
}
