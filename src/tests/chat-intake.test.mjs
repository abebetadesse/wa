/**
 * Starting a request in Telegram/WhatsApp: the conversation runs the real case workflow (in memory),
 * one question per message, with the same safety screen and crisis routing as the app.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createChatIntake, createMemoryIntakeStore, isIntakeStart, parseAnswer, renderQuestion, INTAKE_EXPIRY_MS } from "../server/messaging/chatIntake.ts";
import { handleInbound } from "../server/messaging/inbound.ts";
import { translatorFrom } from "../server/i18n/serverText.ts";
import { createCaseService } from "../server/cases/service.ts";
import { createMemoryCaseStore } from "../server/cases/store.ts";
import { DOMAIN_CONFIGS } from "../server/cases/domains/index.ts";
import { WORKFLOW_DOMAINS } from "../server/cases/types.ts";
import { migrationStatements } from "../../scripts/table-prefix.mjs";

const tr = translatorFrom(null);
const person = (id) => ({ id, role: "user", permissions: [] });

function setup(start = Date.UTC(2026, 0, 1)) {
  let now = start;
  const svc = createCaseService({
    store: createMemoryCaseStore(),
    billing: {
      pricing: async (_domain, defaults) => defaults,
      checkout: async () => ({ purchaseId: "p", checkoutUrl: "/pay" }),
      submitManual: async () => ({ purchaseId: "m" }),
      verify: async () => ({ paid: false }),
      latest: async () => null,
    },
    loadExpert: async (id) => ({ id, role: "user" }),
    expertSummaries: async () => new Map(),
  });
  const store = createMemoryIntakeStore();
  const intake = createChatIntake({
    store,
    now: () => new Date(now),
    cases: {
      start: (userId, domain, input) => svc.start(person(userId), domain, input),
      answer: (userId, caseId, answers) => svc.answer(person(userId), caseId, answers),
      submit: (userId, caseId) => svc.submit(person(userId), caseId),
    },
  });
  const say = (text, userId = "user-1") => intake.handle(userId, text, tr, "en");
  return { svc, store, intake, say, advanceHours: (hours) => (now += hours * 3600_000) };
}

const SAFE = {
  career: { basic_needs: "yes_comfortable", self_harm: "no", financial_pressure: "no" },
};

/** Answers whatever the bot is asking: safe values for the safety screen, the first option or a note otherwise. */
function answerFor(store, userId = "user-1") {
  const state = store.states.get(userId);
  const config = DOMAIN_CONFIGS[state.domain];
  const question = [...config.safetyQuestions, ...(config.startQuestions ?? []), ...config.questions(state.answers)].find((item) => item.id === state.asking);
  if (state.phase === "safety" && SAFE[state.domain]?.[question.id]) return SAFE[state.domain][question.id];
  if (question.options?.length) return "1";
  return "ሰላማዊት: I have been feeling stuck in my work for months and want reflection.";
}

test("a whole request can be started and sent for review from the chat", async () => {
  const { svc, store, say } = setup();
  const menu = await say("NEW");
  WORKFLOW_DOMAINS.forEach((domain, index) => assert.match(menu.text, new RegExp(`${index + 1}\\. ${DOMAIN_CONFIGS[domain].label.replace(/[&]/g, "\\$&")}`)));

  let reply = await say(String(WORKFLOW_DOMAINS.indexOf("career") + 1));
  assert.match(reply.text, /a few safety questions first/);
  for (let turn = 0; turn < 60 && store.states.get("user-1")?.phase !== "confirm"; turn++) {
    reply = await say(answerFor(store));
    assert.ok(!/Please reply with/.test(reply.text), reply.text);
  }
  assert.match(reply.text, /Reply 1 to send your .* request to a reviewer/);
  const caseId = store.states.get("user-1").caseId;
  assert.ok(caseId);

  const sent = await say("1");
  assert.match(sent.text, /sent to a reviewer/);
  assert.equal(sent.path, `/case/workflows/${caseId}`);
  assert.equal(store.states.has("user-1"), false);
  const view = await svc.get(person("user-1"), caseId);
  assert.equal(view.stage, "awaiting_expert");
});

test("an unsafe answer in the safety screen routes to support at once", async () => {
  const { svc, store, say } = setup();
  await say("new");
  await say(String(WORKFLOW_DOMAINS.indexOf("career") + 1));
  let reply;
  for (let turn = 0; turn < 10 && store.states.has("user-1"); turn++) {
    const state = store.states.get("user-1");
    reply = await say(state.asking === "self_harm" ? "frequently" : SAFE.career[state.asking] ?? "1");
  }
  assert.equal(store.states.has("user-1"), false, "the conversation ends");
  assert.match(reply.path, /^\/case\/workflows\//);
  const view = await svc.get(person("user-1"), reply.path.split("/").pop());
  assert.equal(view.stage, "crisis_routed");
  assert.ok(reply.text.length > 20);
});

test("a reply that is not one of the choices is explained and the question asked again", async () => {
  const { say } = setup();
  await say("NEW");
  const wrongDomain = await say("9");
  assert.match(wrongDomain.text, /number from 1 to 6/);
  await say(String(WORKFLOW_DOMAINS.indexOf("career") + 1));
  const wrong = await say("42");
  assert.match(wrong.text, /Please reply with a number from 1 to \d/);
  assert.match(wrong.text, /Reply with the number of your answer/);
});

test("cancel stops the conversation; a created request stays as a draft", async () => {
  const { store, say } = setup();
  await say("NEW");
  assert.match((await say("cancel")).text, /Send NEW whenever/);
  await say("ጀምር");
  await say(String(WORKFLOW_DOMAINS.indexOf("career") + 1));
  for (let turn = 0; turn < 10 && !store.states.get("user-1").caseId; turn++) await say(answerFor(store));
  const caseId = store.states.get("user-1").caseId;
  const stopped = await say("ሰርዝ");
  assert.match(stopped.text, /saved as a draft/);
  assert.equal(stopped.path, `/case/workflows/${caseId}`);
});

test("messages outside an intake, and intakes left for two days, are not taken over", async () => {
  const { say, advanceHours } = setup();
  assert.equal(await say("hello"), null);
  await say("NEW");
  advanceHours(INTAKE_EXPIRY_MS / 3600_000 + 1);
  assert.equal(await say("1"), null);
});

test("answers are read from numbers, option names or text, and optional questions can be skipped", () => {
  const choice = { id: "c", text: "Pick", type: "radio", required: true, options: [{ value: "a", label: "Apple", labelAmharic: "ፖም" }, { value: "b", label: "Banana" }] };
  assert.deepEqual(parseAnswer(choice, "2", tr), { value: "b" });
  assert.deepEqual(parseAnswer(choice, "apple", tr), { value: "a" });
  assert.deepEqual(parseAnswer(choice, "ፖም", tr), { value: "a" });
  assert.ok("error" in parseAnswer(choice, "3", tr));
  assert.deepEqual(parseAnswer({ id: "n", text: "How many", type: "number", required: false }, "0", tr), { skip: true });
  assert.deepEqual(parseAnswer({ id: "n", text: "How many", type: "scale", required: true }, "7", tr), { value: 7 });
  assert.ok("error" in parseAnswer({ id: "d", text: "When", type: "date", required: true }, "yesterday", tr));
  assert.deepEqual(parseAnswer({ id: "t", text: "Tell us", type: "textarea", required: true }, "  It began in May.  ", tr), { value: "It began in May." });
  assert.match(renderQuestion({ id: "q", text: "Feeling?", textAmharic: "ስሜት?", type: "radio", required: false, options: [{ value: "ok", label: "OK" }] }, tr, "am"), /^ስሜት\?\n1\. OK\n.*\nSend 0 to skip/);
  assert.ok(isIntakeStart("New.") && isIntakeStart("ጉዳይ") && !isIntakeStart("new job ideas"));
});

test("the bot hands intake messages to the intake before check-ins and reviewer replies", async () => {
  const replies = [];
  const deps = {
    appUrl: "https://app.example.et",
    findUser: async () => ({ id: "user-1", preferredLanguage: "en" }),
    currentLink: async () => null,
    link: async () => true,
    setNotify: async () => undefined,
    text: async () => tr,
    cases: { replyFromChannel: async (_u, body) => (replies.push(body), { caseId: "c", label: "Career" }), statusFor: async () => [] },
    followUps: { answerFromChat: async () => { throw new Error("should not be asked"); } },
    intake: { handle: async (_u, text) => (text === "1" ? { text: "Next question", path: "/case/workflows/c" } : null) },
  };
  const reply = await handleInbound("telegram", "chat", "1", deps);
  assert.equal(reply.text, "Next question");
  assert.equal(reply.link.url, "https://app.example.et/case/workflows/c");
  deps.followUps = { answerFromChat: async () => null };
  await handleInbound("telegram", "chat", "my reply", deps);
  assert.deepEqual(replies, ["my reply"]);
});

test("the chat intake migration is accepted by the table-prefix rewriter", () => {
  const source = fs.readFileSync(path.resolve(import.meta.dirname, "../../drizzle-mysql/0008_chat_intakes.sql"), "utf8");
  const [statement] = migrationStatements(source, "wa_");
  assert.match(statement, /CREATE TABLE IF NOT EXISTS `wa_chat_intakes`/);
  assert.match(statement, /REFERENCES `wa_users`/);
});
