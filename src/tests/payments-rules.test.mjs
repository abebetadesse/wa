import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { verifyTelegramLogin } from "../server/auth/telegram.ts";
import { verifyTelegramWebhookSecret } from "../server/auth/telegramBot.ts";
import { webhookSignatureValid } from "../server/payments/chapa.ts";
import { availableOptions } from "../server/payments/index.ts";
import { DEFAULT_SETTINGS, paymentSettings } from "../server/settings/index.ts";

const BOT = "123456:TEST-token";

function signed(fields, token = BOT) {
  const check = Object.keys(fields).sort().map((key) => `${key}=${fields[key]}`).join("\n");
  const secret = crypto.createHash("sha256").update(token).digest();
  return { ...fields, hash: crypto.createHmac("sha256", secret).update(check).digest("hex") };
}

test("Telegram login data is accepted only with Telegram's signature and while fresh", () => {
  const now = 1_800_000_000;
  const data = signed({ id: "42", first_name: "Abebe", username: "abebe", auth_date: String(now - 60) });
  assert.equal(verifyTelegramLogin(data, BOT, now), true);
  assert.equal(verifyTelegramLogin({ ...data, id: "43" }, BOT, now), false, "tampered id");
  assert.equal(verifyTelegramLogin(data, "999:other", now), false, "another bot's token");
  assert.equal(verifyTelegramLogin(data, BOT, now + 2 * 86_400), false, "older than a day");
  assert.equal(verifyTelegramLogin({ ...data, hash: undefined }, BOT, now), false);
  assert.equal(verifyTelegramLogin(data, "", now), false, "not configured");
});

test("Telegram webhook is secret-guarded (bot commands are covered in messaging.test.mjs)", () => {
  assert.equal(verifyTelegramWebhookSecret("secret", "secret"), true);
  assert.equal(verifyTelegramWebhookSecret("secret", "secreT"), false);
  assert.equal(verifyTelegramWebhookSecret("secret", null), false);
  assert.equal(verifyTelegramWebhookSecret("", "secret"), false);
});

test("Chapa webhook signatures are checked when a webhook secret is set", () => {
  const body = JSON.stringify({ tx_ref: "EWP-1", status: "success" });
  const previous = process.env.CHAPA_WEBHOOK_SECRET;
  try {
    delete process.env.CHAPA_WEBHOOK_SECRET;
    assert.equal(webhookSignatureValid(body, new Headers()), true, "no secret: rely on API verification alone");
    process.env.CHAPA_WEBHOOK_SECRET = "whsec";
    const sig = crypto.createHmac("sha256", "whsec").update(body).digest("hex");
    assert.equal(webhookSignatureValid(body, new Headers({ "x-chapa-signature": sig })), true);
    assert.equal(webhookSignatureValid(body, new Headers({ "chapa-signature": crypto.createHmac("sha256", "whsec").update("whsec").digest("hex") })), true);
    assert.equal(webhookSignatureValid(body, new Headers({ "x-chapa-signature": "00".repeat(32) })), false);
    assert.equal(webhookSignatureValid(body, new Headers()), false);
  } finally {
    if (previous === undefined) delete process.env.CHAPA_WEBHOOK_SECRET;
    else process.env.CHAPA_WEBHOOK_SECRET = previous;
  }
});

test("payment options: only enabled and fully configured methods are offered", () => {
  const base = paymentSettings.parse(DEFAULT_SETTINGS.payments);
  assert.deepEqual(availableOptions(base, false), [], "no Chapa key and no accounts: nothing to offer");
  assert.deepEqual(availableOptions(base, true).map((o) => `${o.id}:${o.kind}`), ["telebirr:online", "chapa:online"]);

  const manual = paymentSettings.parse({
    ...base,
    methods: {
      chapa: { enabled: false },
      telebirr: { enabled: true, channel: "manual", accountName: "Platform", phone: "0911000000" },
      bank_transfer: { enabled: true, accounts: [{ bank: "CBE", accountName: "Platform", accountNumber: "1000123456" }] },
    },
  });
  const options = availableOptions(manual, true);
  assert.deepEqual(options.map((o) => `${o.id}:${o.kind}`), ["telebirr:manual", "bank_transfer:manual"]);
  assert.equal(options[0].telebirr.phone, "0911000000");
  assert.equal(options[1].accounts.length, 1);

  const noNumber = paymentSettings.parse({ ...manual, methods: { ...manual.methods, telebirr: { ...manual.methods.telebirr, phone: "" } } });
  assert.ok(!availableOptions(noNumber, true).some((o) => o.id === "telebirr"), "manual telebirr needs a number");
});
