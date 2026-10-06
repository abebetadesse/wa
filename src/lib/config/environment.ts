/**
 * What the server needs from its environment. Checked once at start-up (src/instrumentation.ts) so
 * a missing secret stops the application with a clear message instead of surfacing later as a
 * broken sign-in or, worse, as data protected by a development key.
 */

export interface EnvironmentReport {
  errors: string[];
  warnings: string[];
}

const has = (name: string) => Boolean(process.env[name]?.trim());

export function environmentReport(): EnvironmentReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const database = process.env.DATABASE_URL?.trim() ?? "";
  if (!database) errors.push("DATABASE_URL is not set (mysql://user:password@host:3306/database).");
  else if (!/^mysql:\/\//.test(database)) errors.push("DATABASE_URL must be a MySQL address (mysql://…).");

  const tablePrefix = process.env.DB_TABLE_PREFIX?.trim() ?? "";
  if (tablePrefix && !/^[a-z][a-z0-9]{0,10}_$/.test(tablePrefix)) errors.push("DB_TABLE_PREFIX is not valid. Use 1–11 lowercase letters or digits followed by one underscore, for example wa_ (or leave it empty when the application has a database to itself).");

  for (const name of ["AUTH_SECRET", "DATA_ENCRYPTION_KEY"]) {
    const value = process.env[name]?.trim() ?? "";
    if (!value) errors.push(`${name} is not set. Generate one with: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`);
    else if (value.length < 32) errors.push(`${name} is too short; use at least 32 random characters.`);
  }

  const appUrl = process.env.APP_URL?.trim() ?? "";
  if (!appUrl) errors.push("APP_URL is not set (the public address, e.g. https://app.example.et). Links in emails, Telegram and payment returns are built from it.");
  else if (!/^https:\/\//.test(appUrl)) warnings.push("APP_URL does not use https; sign-in cookies and payments need HTTPS in production.");

  if (process.env.AUTH_DEV_CODES === "true") warnings.push("AUTH_DEV_CODES is set; it is ignored in production and should be removed.");
  if (!has("SMTP_HOST") && !has("TELEGRAM_BOT_TOKEN")) warnings.push("Neither SMTP_HOST nor TELEGRAM_BOT_TOKEN is set: people cannot reset a forgotten password by themselves.");
  if (has("SMTP_HOST") && !has("MAIL_FROM") && !has("SMTP_USER")) warnings.push("SMTP_HOST is set without MAIL_FROM or SMTP_USER; email cannot be sent without a sender address.");
  if (has("TELEGRAM_BOT_TOKEN") && !has("TELEGRAM_WEBHOOK_SECRET")) warnings.push("TELEGRAM_BOT_TOKEN is set without TELEGRAM_WEBHOOK_SECRET: the bot can send updates but cannot receive connect codes or replies. Run: npm run telegram:setup");
  const whatsapp = ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_BUSINESS_NUMBER", "WHATSAPP_APP_SECRET", "WHATSAPP_VERIFY_TOKEN"];
  const whatsappMissing = whatsapp.filter((name) => !has(name));
  if (whatsappMissing.length && whatsappMissing.length < whatsapp.length) warnings.push(`WhatsApp is partly configured; still missing: ${whatsappMissing.join(", ")}. People cannot connect WhatsApp until all are set.`);
  else if (!whatsappMissing.length && !has("WHATSAPP_TEMPLATE_NAME")) warnings.push("WHATSAPP_TEMPLATE_NAME is not set: WhatsApp updates only reach people who wrote to the number in the last 24 hours.");
  if (!has("CHAPA_SECRET_KEY")) warnings.push("CHAPA_SECRET_KEY is not set: online payments are off (manually recorded payments still work).");
  else if (/TEST/i.test(process.env.CHAPA_SECRET_KEY!)) warnings.push("CHAPA_SECRET_KEY is a test key: no real money moves.");
  if (!has("UPLOAD_DIR")) warnings.push("UPLOAD_DIR is not set: client photos and voice notes go to ./storage/uploads inside the application folder. Point it at a folder that survives redeploys and is backed up.");
  return { errors, warnings };
}

/** Logs the report; in production a missing requirement stops the server. */
export function checkProductionEnvironment() {
  if (process.env.NODE_ENV !== "production") return;
  const { errors, warnings } = environmentReport();
  for (const warning of warnings) console.warn(`[config] ${warning}`);
  if (errors.length) {
    for (const error of errors) console.error(`[config] ${error}`);
    throw new Error(`The server is not configured: ${errors.length} required setting${errors.length === 1 ? " is" : "s are"} missing. See the [config] lines above.`);
  }
  console.log("[config] environment ok");
}
