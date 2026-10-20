// Local Oromo, Tigrinya and Somali catalogues: their shape, the safety phrases they must cover,
// the in-page translator switching language, Google Translate kept off private pages, and server
// messages written in the recipient's preferred language.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getDomTranslator } from "../lib/i18n/domTranslator.ts";
import { isPrivatePath, translationEngine } from "../lib/i18n/engine.ts";
import { COMMON_PHRASES, COMPLETE_ROUTES, ROUTE_PHRASES } from "../lib/i18n/phrases/sections.ts";
import { ownerNotice, reviewerNotice } from "../server/cases/notices.ts";
import { serverText, toServerLanguage, translatorFrom } from "../server/i18n/serverText.ts";
import { handleInbound } from "../server/messaging/inbound.ts";

const PHRASE_DIR = path.join(process.cwd(), "src/lib/i18n/phrases");
const DRAFTS = ["om", "ti", "so"];
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const catalogueFiles = (lang) => fs.readdirSync(path.join(PHRASE_DIR, lang)).filter((name) => name.endsWith(".json"));

/** Same rule as placeholdersMatch() in scripts/i18n.mjs. */
function placeholdersMatch(phrase, translated) {
  const holes = (phrase.match(/\{\}/g) || []).length;
  if (/\{\}/.test(translated)) return false;
  return (translated.match(/\{(\d+)\}/g) || []).every((token) => Number(token.slice(1, -1)) < holes);
}

test("draft catalogues: every file is marked as a machine draft and keeps its placeholders", () => {
  for (const lang of DRAFTS) {
    const files = catalogueFiles(lang);
    assert.ok(files.includes("emergency.json") && files.includes("safety.json") && files.includes("common.json"), `${lang} has the safety and shared sections`);
    for (const name of files) {
      const data = readJson(path.join(PHRASE_DIR, lang, name));
      assert.equal(Object.keys(data)[0], "_status", `${lang}/${name} starts with its status`);
      assert.equal(data._status, "machine-draft, needs human review");
      for (const [phrase, translated] of Object.entries(data)) {
        if (phrase === "_status") continue;
        assert.equal(typeof translated, "string", `${lang}/${name}: ${phrase}`);
        assert.ok(translated.trim(), `${lang}/${name}: empty translation for ${phrase}`);
        assert.ok(placeholdersMatch(phrase, translated), `${lang}/${name}: placeholders differ for ${phrase} -> ${translated}`);
        // A phrase with a value keeps at least its first value.
        if (phrase.includes("{}")) assert.match(translated, /\{0\}/, `${lang}/${name}: ${phrase} lost its value`);
      }
    }
  }
});

test("draft catalogues: the emergency and interaction-check phrases are translated in every draft", () => {
  for (const section of ["emergency", "safety"]) {
    const amharic = readJson(path.join(PHRASE_DIR, "am", `${section}.json`));
    for (const lang of DRAFTS) {
      const draft = readJson(path.join(PHRASE_DIR, lang, `${section}.json`));
      // Lines with phone numbers are filled in after the phone-number rewrite.
      const gaps = Object.keys(amharic).filter((phrase) => !/\d{3}/.test(phrase) && !draft[phrase]);
      assert.deepEqual(gaps, [], `${lang}/${section}.json misses safety phrases`);
    }
  }
});

test("draft locales: every emergency label of the interface dictionary is translated", () => {
  const english = readJson(path.join(process.cwd(), "src/lib/i18n/locales/en.json")).emergency;
  for (const lang of DRAFTS) {
    const locale = readJson(path.join(process.cwd(), `src/lib/i18n/locales/${lang}.json`)).emergency;
    assert.deepEqual(Object.keys(english).filter((key) => !locale[key]), [], `${lang}.json emergency keys`);
  }
});

test("loaders: every catalogue language lists its shared phrases and route sections", () => {
  for (const lang of ["am", ...DRAFTS]) {
    assert.ok(COMMON_PHRASES[lang].length >= 1, `${lang} shared phrases`);
    assert.equal(typeof ROUTE_PHRASES[lang].emergency, "function", `${lang} emergency section`);
    assert.ok(COMPLETE_ROUTES[lang].includes("*") || COMPLETE_ROUTES[lang].includes("emergency"), `${lang} translates /emergency locally`);
  }
});

test("translator: switching language drops the previous catalogue", () => {
  const translator = getDomTranslator();
  translator.reset("am");
  translator.addPhrases({ Close: "ዝጋ", _status: "ignored" });
  assert.equal(translator["lookup"]("Close"), "ዝጋ");
  assert.equal(translator["lookup"]("_status"), null, "the status marker is not a phrase");

  translator.reset("om");
  assert.equal(translator.language, "om");
  assert.equal(translator["lookup"]("Close"), null, "Amharic must not leak into Oromo");
  translator.addPhrases({ Close: "Cufi", "Your {} request": "Gaaffii {0} kee" });
  assert.equal(translator["lookup"]("Close"), "Cufi");
  assert.equal(translator["lookup"]("Your 3 request"), "Gaaffii 3 kee");
});

test("translator: Latin-script translations are not reported as missing English", () => {
  const translator = getDomTranslator();
  translator.reset("so");
  translator.addPhrases({ Close: "Xir" });
  assert.equal(translator["translateString"]("Xir"), null);
  assert.equal(translator["translateString"]("Something new"), null);
  assert.deepEqual(translator.missingPhrases(), ["Something new"]);
  translator.reset("ti");
  assert.deepEqual(translator.missingPhrases(), [], "a new language starts with a clean list");
  translator["translateString"]("Close ዝጋ");
  assert.deepEqual(translator.missingPhrases(), [], "Ethiopic text in Tigrinya is translated content");
});

test("engine: Google Translate never runs on case, health or account pages", () => {
  const privatePaths = ["/case/workflows/abc", "/case", "/case-review/1", "/diagnostic", "/intake", "/report/9", "/profile", "/messages/2", "/account/bookings", "/business/b1/cases/c1"];
  for (const pathname of privatePaths) {
    assert.ok(isPrivatePath(pathname), pathname);
    for (const lang of DRAFTS) assert.equal(translationEngine(lang, pathname), "local", `${lang} ${pathname}`);
  }
  for (const pathname of ["/", "/foods", "/marketplace", "/business", "/casebook", "/reports"]) assert.equal(isPrivatePath(pathname), false, pathname);
  for (const lang of DRAFTS) {
    assert.equal(translationEngine(lang, "/emergency"), "local", "the emergency page has a local catalogue");
    assert.equal(translationEngine(lang, "/safety"), "local");
    assert.equal(translationEngine(lang, "/foods"), "google", "uncovered public pages fall back to Google");
  }
  assert.equal(translationEngine("am", "/foods"), "local");
  assert.equal(translationEngine("en", "/case/1"), "none");
});

const record = (overrides = {}) => ({
  id: "case-1",
  userId: "user-1",
  domain: "relationships",
  businessId: null,
  safety: { action: "proceed", priority: "routine" },
  review: undefined,
  ...overrides,
});

test("server text: notices follow the recipient's language, English otherwise", async () => {
  assert.equal(toServerLanguage("om"), "om");
  assert.equal(toServerLanguage("fr"), "en");
  assert.equal(toServerLanguage(null), "en");

  const english = ownerNotice(record(), "Relationships & Family", "received");
  assert.equal(english.title, "We received your request");
  assert.match(english.body, /Your Relationships & Family request is with our review team/);

  const amharic = ownerNotice(record(), "Relationships & Family", "received", undefined, await serverText("am"));
  assert.equal(amharic.title, "ጥያቄዎ ደርሶናል");
  assert.match(amharic.body, /ግንኙነቶች እና ቤተሰብ/, "the domain label is translated too");

  const oromo = ownerNotice(record(), "Relationships & Family", "received", undefined, await serverText("om"));
  assert.equal(oromo.title, "Gaaffiin kee nu ga'eera");
  assert.match(oromo.body, /Hariiroo fi Maatii/);

  const reviewed = ownerNotice(record({ review: { expertId: "e", claimedAt: "", notes: "Rest well." } }), "Relationships & Family", "approved", undefined, await serverText("ti"));
  assert.equal(reviewed.title, "ጸብጻብካ ተዳልዩ ኣሎ");
  assert.equal(reviewed.body.split("\n\n").length, 3, "paragraphs survive translation");
  assert.match(reviewed.body, /Rest well\./, "the reviewer's own words are passed on as written");

  const urgent = reviewerNotice(record({ safety: { action: "proceed", priority: "high" } }), "Relationships & Family", "submitted", await serverText("so"));
  assert.equal(urgent.title, "Codsi Xiriirka iyo Qoyska cusub (mudnaan sare)");

  const fallback = translatorFrom(new Map());
  assert.equal(fallback("Reply on a {} request", "Wellbeing"), "Reply on a Wellbeing request", "untranslated text stays English");
});

test("server text: chat-bot replies use the linked account's preferred language", async () => {
  const deps = {
    appUrl: "https://app.example.et",
    findUser: async () => ({ id: "user-1", preferredLanguage: "so" }),
    currentLink: async () => null,
    link: async () => true,
    setNotify: async () => {},
    cases: { replyFromChannel: async () => null, statusFor: async () => [{ id: "c1", label: "Peace & Harmony", stage: "in_review", waitingForReply: true }] },
  };
  const status = await handleInbound("telegram", "42", "status", deps);
  assert.equal(status.text, "Codsiyadaada:\n• Nabad iyo Wada-noolaansho: dib ayaa loo eegayaa — dib-u-eegahaagu wuxuu sugayaa jawaabtaada");
  assert.equal(status.link.label, "Fur codsiyadaada");

  const stopped = await handleInbound("telegram", "42", "stop", { ...deps, findUser: async () => ({ id: "user-1", preferredLanguage: "en" }) });
  assert.equal(stopped.text, "Updates on Telegram are now off. You can turn them on again from your account page.");

  const stranger = await handleInbound("whatsapp", "7", "hello", { ...deps, findUser: async () => null });
  assert.match(stranger.text, /^Welcome to Ethiopian Wisdom Atlas/, "strangers are answered in English");
});
