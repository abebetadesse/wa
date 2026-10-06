import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { createLinkCode, LINK_CODE_TTL_SECONDS, readLinkCode, verifyLinkCode } from "../server/messaging/linkCodes.ts";
import { createDeduper, handleInbound, parseBotCommand } from "../server/messaging/inbound.ts";
import { parseWhatsAppWebhook, verifyWhatsAppSignature, whatsappPayload, whatsappStatus, withinWindow } from "../server/messaging/whatsapp.ts";

const USER = "3f2b8c1e-7a4d-4e9b-9c0a-5d6e7f8a9b0c";
const OTHER = "11111111-2222-4333-8444-555555555555";

test("link codes: bound to the account, the channel and the current link; expire after 15 minutes", () => {
  const now = 1_800_000_000;
  const code = createLinkCode("telegram", USER, null, now);
  assert.match(code, /^[A-Za-z0-9_-]{40}$/, "fits a Telegram deep link and a WhatsApp message");
  assert.equal(readLinkCode(code, now), USER);
  assert.equal(readLinkCode(code, now + LINK_CODE_TTL_SECONDS + 1), null, "expired");
  assert.equal(readLinkCode("short", now), null);

  const fresh = createLinkCode("telegram", USER, null);
  assert.equal(verifyLinkCode("telegram", fresh, null), true);
  assert.equal(verifyLinkCode("whatsapp", fresh, null), false, "a Telegram code does not link WhatsApp");
  assert.equal(verifyLinkCode("telegram", fresh, "987654"), false, "used: the account's link has changed");
  const forged = Buffer.from(fresh, "base64url");
  Buffer.from(OTHER.replace(/-/g, ""), "hex").copy(forged, 0);
  assert.equal(verifyLinkCode("telegram", forged.toString("base64url"), null), false, "the user id cannot be swapped");
});

test("bot commands: the same words work on both apps; sentences are replies, not commands", () => {
  const code = createLinkCode("whatsapp", USER, null);
  assert.deepEqual(parseBotCommand(`/start ${code}`), { type: "link", code });
  assert.deepEqual(parseBotCommand(`CONNECT ${code}`), { type: "link", code });
  assert.deepEqual(parseBotCommand(`  ${code} `), { type: "link", code });
  assert.deepEqual(parseBotCommand("/start@wisdom_bot"), { type: "start" });
  assert.deepEqual(parseBotCommand("STATUS"), { type: "status" });
  assert.deepEqual(parseBotCommand("ሁኔታ"), { type: "status" });
  assert.deepEqual(parseBotCommand("/stop"), { type: "stop" });
  assert.deepEqual(parseBotCommand("Stop him shouting at me"), { type: "text", text: "Stop him shouting at me" });
  assert.deepEqual(parseBotCommand("About two weeks."), { type: "text", text: "About two weeks." });
});

function bot({ linked = {}, cases = [] } = {}) {
  const state = { links: { telegram: { ...linked.telegram }, whatsapp: { ...linked.whatsapp } }, notify: [], replies: [], touched: [] };
  const deps = {
    appUrl: "https://app.example.et/",
    findUser: async (channel, sender) => {
      const id = Object.keys(state.links[channel]).find((userId) => state.links[channel][userId] === sender);
      return id ? { id } : null;
    },
    currentLink: async (channel, userId) => (userId === USER || userId === OTHER ? state.links[channel][userId] ?? null : undefined),
    link: async (channel, userId, sender) => {
      if (Object.entries(state.links[channel]).some(([id, value]) => value === sender && id !== userId)) return false;
      state.links[channel][userId] = sender;
      return true;
    },
    setNotify: async (channel, userId, enabled) => void state.notify.push({ channel, userId, enabled }),
    touch: async (channel, userId) => void state.touched.push(`${channel}:${userId}`),
    cases: {
      replyFromChannel: async (userId, body, via) => {
        if (!cases.length) return null;
        state.replies.push({ userId, body, via });
        return { caseId: cases[0].id, label: cases[0].label };
      },
      statusFor: async () => cases,
    },
  };
  return { state, deps };
}

test("bot: a connect code links the chat once; strangers are pointed to the account page", async () => {
  const { state, deps } = bot();
  const welcome = await handleInbound("whatsapp", "251911000001", "hello", deps);
  assert.match(welcome.text, /tap Connect WhatsApp/);
  assert.deepEqual(welcome.link, { url: "https://app.example.et/account", label: "Open your account" });
  assert.deepEqual(state.replies, [], "an unlinked chat cannot write into anyone's case");

  const code = createLinkCode("whatsapp", USER, null);
  const linked = await handleInbound("whatsapp", "251911000001", `CONNECT ${code}`, deps);
  assert.match(linked.text, /Your WhatsApp is now connected/);
  assert.equal(state.links.whatsapp[USER], "251911000001");

  const replay = await handleInbound("whatsapp", "251922000002", `CONNECT ${code}`, deps);
  assert.match(replay.text, /expired or was already used/);
  assert.equal(state.links.whatsapp[USER], "251911000001", "a used code cannot move the link to another phone");

  const taken = await handleInbound("whatsapp", "251911000001", `CONNECT ${createLinkCode("whatsapp", OTHER, null)}`, deps);
  assert.match(taken.text, /already connected to another account/);
  assert.match((await handleInbound("telegram", "42", "/start AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", deps)).text, /expired or was already used/);
});

test("bot: status, stop and replies for a connected person", async () => {
  const cases = [{ id: "case-1", label: "Relationships & Family", stage: "in_review", waitingForReply: true }];
  const { state, deps } = bot({ linked: { telegram: { [USER]: "42" } }, cases });

  const status = await handleInbound("telegram", "42", "/status", deps);
  assert.equal(status.text, "Your requests:\n• Relationships & Family: being reviewed — your reviewer is waiting for your reply");

  const reply = await handleInbound("telegram", "42", "It started two weeks ago.", deps);
  assert.deepEqual(state.replies, [{ userId: USER, body: "It started two weeks ago.", via: "telegram" }]);
  assert.match(reply.text, /added to your Relationships & Family request/);
  assert.equal(reply.link.url, "https://app.example.et/case/workflows/case-1");

  const stop = await handleInbound("telegram", "42", "STOP", deps);
  assert.deepEqual(state.notify, [{ channel: "telegram", userId: USER, enabled: false }]);
  assert.match(stop.text, /Updates on Telegram are now off/);
  assert.ok(state.touched.length >= 3, "each message from a connected person is noted");

  const idle = bot({ linked: { whatsapp: { [USER]: "251911000001" } } });
  const nothing = await handleInbound("whatsapp", "251911000001", "Are you there?", idle.deps);
  assert.match(nothing.text, /no request under review/);
});

test("bot: a webhook retry is handled once", () => {
  const seen = createDeduper(2);
  assert.equal(seen("a"), false);
  assert.equal(seen("a"), true);
  assert.equal(seen(""), false, "deliveries without an id are never dropped");
  seen("b");
  seen("c");
  assert.equal(seen("a"), false, "old ids are forgotten");
});

test("WhatsApp: webhook signatures, message parsing and the 24-hour window", () => {
  const body = JSON.stringify({ entry: [{ changes: [{ value: { messages: [{ id: "wamid.1", from: "+251 911 000 001", type: "text", text: { body: "STATUS" } }, { id: "wamid.2", from: "251911000001", type: "image" }], statuses: [{ id: "x" }] } }] }] });
  const signature = `sha256=${crypto.createHmac("sha256", "app-secret").update(body).digest("hex")}`;
  assert.equal(verifyWhatsAppSignature("app-secret", body, signature), true);
  assert.equal(verifyWhatsAppSignature("app-secret", `${body} `, signature), false, "any change to the body breaks the signature");
  assert.equal(verifyWhatsAppSignature("", body, signature), false);
  assert.equal(verifyWhatsAppSignature("app-secret", body, null), false);
  assert.deepEqual(parseWhatsAppWebhook(JSON.parse(body)), [{ from: "251911000001", text: "STATUS", id: "wamid.1" }]);
  assert.deepEqual(parseWhatsAppWebhook({ object: "page" }), []);

  const now = Date.parse("2026-10-06T12:00:00Z");
  assert.equal(withinWindow("2026-10-05T13:00:00Z", now), true);
  assert.equal(withinWindow("2026-10-05T11:00:00Z", now), false);
  assert.equal(withinWindow(null, now), false);

  const update = { title: "Your report is ready", body: "From your reviewer:\nStart small.", url: "https://app.example.et/case/workflows/1" };
  const text = whatsappPayload("251911000001", update, { windowOpen: true, template: "case_update" });
  assert.equal(text.type, "text");
  assert.equal(text.text.body, "Your report is ready\n\nFrom your reviewer:\nStart small.\n\nhttps://app.example.et/case/workflows/1");
  const template = whatsappPayload("251911000001", update, { windowOpen: false, template: "case_update", language: "am" });
  assert.equal(template.type, "template");
  assert.deepEqual(template.template.language, { code: "am" });
  assert.deepEqual(template.template.components[0].parameters.map((parameter) => parameter.text), ["Your report is ready", "From your reviewer: Start small. https://app.example.et/case/workflows/1"]);
  assert.equal(whatsappPayload("251911000001", update, { windowOpen: false, template: null }).type, "text", "without a template, text is attempted");
});

test("WhatsApp: off until the token and number id are set", () => {
  const names = ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_BUSINESS_NUMBER", "WHATSAPP_APP_SECRET", "WHATSAPP_VERIFY_TOKEN"];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    for (const name of names) delete process.env[name];
    assert.deepEqual(whatsappStatus(), { configured: false, number: null, inbound: false, template: null });
    Object.assign(process.env, { WHATSAPP_ACCESS_TOKEN: "t", WHATSAPP_PHONE_NUMBER_ID: "1", WHATSAPP_BUSINESS_NUMBER: "+251 911 000 000", WHATSAPP_APP_SECRET: "s", WHATSAPP_VERIFY_TOKEN: "v" });
    assert.deepEqual(whatsappStatus(), { configured: true, number: "251911000000", inbound: true, template: null });
  } finally {
    for (const name of names) previous[name] === undefined ? delete process.env[name] : (process.env[name] = previous[name]);
  }
});
