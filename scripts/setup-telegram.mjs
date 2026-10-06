import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env");

function loadEnv() {
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
}

function setWebhookSecret() {
  if (process.env.TELEGRAM_WEBHOOK_SECRET?.trim()) return process.env.TELEGRAM_WEBHOOK_SECRET.trim();
  const secret = crypto.randomBytes(32).toString("base64url");
  const separator = fs.existsSync(envFile) && fs.statSync(envFile).size > 0 ? "\n" : "";
  fs.appendFileSync(envFile, `${separator}TELEGRAM_WEBHOOK_SECRET=${secret}\n`, { mode: 0o600 });
  process.env.TELEGRAM_WEBHOOK_SECRET = secret;
  console.log("Generated TELEGRAM_WEBHOOK_SECRET in .env.");
  return secret;
}

loadEnv();
const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const username = process.env.TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "");
const appUrl = process.env.APP_URL?.trim().replace(/\/$/, "");

if (!token || !username) {
  console.error("Set TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_USERNAME in .env first (create the bot with @BotFather).");
  process.exit(1);
}
if (!appUrl || !/^https:\/\//.test(appUrl)) {
  console.error("Set APP_URL to the public HTTPS site URL before configuring the Telegram webhook.");
  process.exit(1);
}

const api = `https://api.telegram.org/bot${token}`;
async function telegram(method, payload) {
  const response = await fetch(`${api}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(`Telegram ${method} failed (${response.status}): ${result.description ?? "request rejected"}`);
  return result.result;
}

try {
  const bot = await telegram("getMe", {});
  if (bot.username?.toLowerCase() !== username.toLowerCase()) {
    throw new Error(`Configured username does not match the token's bot @${bot.username}. Update TELEGRAM_BOT_USERNAME.`);
  }
  const secret = setWebhookSecret();
  await telegram("setWebhook", {
    url: `${appUrl}/api/telegram/webhook`,
    secret_token: secret,
    allowed_updates: ["message"],
  });
  await telegram("setMyCommands", {
    commands: [
      { command: "start", description: "Connect to Ethiopian Wisdom Atlas" },
      { command: "status", description: "See your requests" },
      { command: "stop", description: "Turn updates off" },
      { command: "help", description: "See what this bot can do" },
      { command: "privacy", description: "How this bot uses your data" },
    ],
  });
  console.log(`Telegram bot @${bot.username} is configured. Webhook: ${appUrl}/api/telegram/webhook`);
  console.log(`Open https://t.me/${bot.username} and send /start to test it.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
