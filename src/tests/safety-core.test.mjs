import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { screenText } from "../server/safety/urgency.ts";
import { assessUrgency } from "../lib/evaluation/urgencyTriage.ts";
import { detectEmergency, parseCaseNarrative } from "../lib/case-workflow/caseSummaryEngine.ts";
import { UrgencyDetector } from "../lib/knowledge/parsing/urgencyDetector.ts";
import { evaluateSpiritualCrisis } from "../lib/case-workflow/spiritualQuestionEngine.ts";
import { parsewellbeingInquiry } from "../lib/inquiry/parser.ts";
import { redFlagsPillar } from "../lib/knowledge/pillars/clinical/redFlags.v1.ts";
import { screenFreeText } from "../server/cases/support.ts";
import { createCase, recordAnswers } from "../server/cases/machine.ts";
import { DOMAIN_CONFIGS } from "../server/cases/domains/index.ts";
import {
  EMERGENCY_GUIDANCE,
  VERIFIED_EMERGENCY_CONTACTS,
  emergencyStep,
  setConfiguredEmergencyContacts,
  verifiedEmergencyContacts,
} from "../lib/safety/emergencyContacts.ts";

// [text, expected level, expected crisis]
const PHRASES = [
  // Self-harm, English and Amharic
  ["I want to kill myself", "emergency", "self_harm"],
  ["I keep thinking about suicide", "emergency", "self_harm"],
  ["Some days I want to end my life", "emergency", "self_harm"],
  ["Sometimes I want to die", "emergency", "self_harm"],
  ["I have been hurting myself", "emergency", "self_harm"],
  ["I feel there is no reason to live", "emergency", "self_harm"],
  ["ራሴን ማጥፋት እፈልጋለሁ", "emergency", "self_harm"],
  ["ራሴን ልገድል ነው", "emergency", "self_harm"],
  ["ራሴን ላጠፋ አስቤአለሁ", "emergency", "self_harm"],
  ["ሕይወቴን ማጥፋት እፈልጋለሁ", "emergency", "self_harm"],
  ["ህይወቴን ማጥፋት አስባለሁ", "emergency", "self_harm"],
  ["መሞት እፈልጋለሁ", "emergency", "self_harm"],
  ["ብሞት ይሻለኛል", "emergency", "self_harm"],
  ["ራሴን ልጎዳ ነው", "emergency", "self_harm"],
  // Violence
  ["My husband beats me every night", "emergency", "violence"],
  ["He threatened to kill me", "emergency", "violence"],
  ["I was raped last week", "emergency", "violence"],
  ["There is domestic violence at home", "emergency", "violence"],
  ["ባሌ ይደበድበኛል", "emergency", "violence"],
  ["ሊገድለኝ ዛተብኝ", "emergency", "violence"],
  ["የጾታ ጥቃት ደርሶብኛል", "emergency", "violence"],
  // Medical emergencies
  ["I have crushing chest pain", "emergency", "medical"],
  ["I can't breathe", "emergency", "medical"],
  ["He collapsed and is unresponsive", "emergency", "medical"],
  ["She had a seizure this morning", "emergency", "medical"],
  ["His face is drooping and his speech is slurred", "emergency", "medical"],
  ["I am vomiting blood", "emergency", "medical"],
  ["My child swallowed bleach", "emergency", "medical"],
  ["I was bitten by a snake", "emergency", "medical"],
  ["I am pregnant and bleeding", "emergency", "medical"],
  ["This is the worst headache of my life", "emergency", "medical"],
  ["የደረት ህመም አለብኝ", "emergency", "medical"],
  ["መተንፈስ አልችልም", "emergency", "medical"],
  ["ደም አስመለሰኝ", "emergency", "medical"],
  ["ትናንት ራሴን ሳትኩ", "emergency", "medical"],
  ["እባብ ነደፈኝ", "emergency", "medical"],
  ["ፊቴ ተጣመመ", "emergency", "medical"],
  ["ነፍሰ ጡር ነኝ ደም ይፈሰኛል", "emergency", "medical"],
  // Urgent and soon (no crisis)
  ["High fever and shivering for 3 days", "urgent", null],
  ["My eyes have turned yellow", "urgent", null],
  ["Shortness of breath when walking uphill", "urgent", null],
  ["There is blood in my stool", "urgent", null],
  ["ከፍተኛ ትኩሳት አለኝ", "urgent", null],
  ["ዓይኔ ቢጫ ሆኗል", "urgent", null],
  ["My stomach pain is getting worse", "soon", null],
  ["A cough for 3 weeks", "soon", null],
  ["ለሳምንታት ታምሜአለሁ", "soon", null],
  // Negatives: headache uses of ራሴን, negation, everyday words
  ["ራሴን አመመኝ", "routine", null],
  ["ራሴን ያመኛል ትናንት ጀምሮ", "routine", null],
  ["ራስ ምታት አለኝ", "routine", null],
  ["ራሴን መንከባከብ እፈልጋለሁ", "routine", null],
  ["ራሴን ማሻሻል እፈልጋለሁ", "routine", null],
  ["ልቤ ያመኛል", "routine", null],
  ["የመሬት መንቀጥቀጥ ነበር", "routine", null],
  ["I have a mild headache", "routine", null],
  ["I have no chest pain", "routine", null],
  ["I don't have any fever", "routine", null],
  ["The new job fits my schedule", "routine", null],
  ["My business collapsed last year", "routine", null],
  ["Analysis paralysis at work", "routine", null],
  ["I received a lump sum payment", "routine", null],
  ["I'm confused about my career", "routine", null],
  ["Mild bloating after meals", "routine", null],
  ["How to bake teff injera", "routine", null],
];

test("screenText: English and Amharic phrases get the expected level and crisis", () => {
  assert.ok(PHRASES.length >= 60);
  for (const [text, level, crisis] of PHRASES) {
    const result = screenText(text);
    assert.equal(result.level, level, `${text} → ${result.level} (${result.signs.map((s) => s.id)})`);
    assert.equal(result.crisis, crisis, `${text} crisis`);
  }
});

test("screenText: a bare ራሴን never triggers self-harm (it also means 'my head')", () => {
  for (const text of ["ራሴን", "ራሴን አመመኝ", "ራሴን ሲያመኝ ሐኪም ዘንድ ሄድኩ"]) assert.notEqual(screenText(text).crisis, "self_harm", text);
});

test("screenText: crisis is set exactly when the level is emergency; context raises the score", () => {
  for (const [text] of PHRASES) {
    const result = screenText(text);
    assert.equal(result.crisis !== null, result.level === "emergency", text);
  }
  assert.equal(screenText("my baby has a fever").level, "urgent");
  assert.equal(screenText("my baby has a fever", { age: 1 }).level, "emergency");
  assert.ok(screenText("fever and shivering", { pregnant: true }).score > screenText("fever and shivering").score);
  assert.deepEqual(screenText(""), { level: "routine", score: 0, signs: [], crisis: null });
});

const DETECTOR_LEVEL = { emergency: "critical", urgent: "high", soon: "medium", routine: "low" };
const SUMMARY_FLAG = { emergency: "emergency", urgent: "urgent", soon: "watch", routine: "none" };

test("every adapter agrees with screenText on the shared phrases", async () => {
  const detector = new UrgencyDetector();
  for (const [text] of PHRASES) {
    const core = screenText(text);
    const emergency = core.level === "emergency";
    assert.equal(assessUrgency(text).level, core.level, `assessUrgency: ${text}`);
    assert.equal(detectEmergency(text).detected, emergency, `detectEmergency: ${text}`);
    assert.equal(parseCaseNarrative(text).urgencyFlag, SUMMARY_FLAG[core.level], `parseCaseNarrative: ${text}`);
    assert.equal(detector.detect(text, []).level, DETECTOR_LEVEL[core.level], `UrgencyDetector: ${text}`);
    assert.equal(parsewellbeingInquiry(text).urgency.level, DETECTOR_LEVEL[core.level], `inquiry: ${text}`);
    assert.equal(evaluateSpiritualCrisis(text, {}).isCrisis, emergency, `spiritual: ${text}`);
    const pillar = await redFlagsPillar.query({ narrative: text }, {});
    assert.equal(pillar.data.emergencyActionRequired, emergency, `redFlags: ${text}`);
    assert.equal(screenFreeText({ answer: text })?.action === "crisis_route", emergency, `screenFreeText: ${text}`);
  }
});

const safeAnswers = {
  social: { loneliness: "low", self_harm: "no", immediateRisk: "no", supportAvailable: "yes" },
  biological: { urgentSymptoms: "no" },
};

test("workflow: a medical emergency in free text routes the case to crisis support", () => {
  for (const domain of ["social", "biological"]) {
    const config = DOMAIN_CONFIGS[domain];
    const record = createCase({ id: `case-${domain}`, userId: "user-1", config, safetyAnswers: safeAnswers[domain], answers: {} });
    assert.notEqual(record.stage, "crisis_routed");
    const updated = recordAnswers(record, { caseNarrative: "Since this morning I have chest pain and I cannot breathe" }, config);
    assert.equal(updated.stage, "crisis_routed", domain);
    assert.equal(updated.safety.action, "crisis_route");
    assert.equal(updated.safety.support.title, "Get medical help now");
    assert.ok(updated.safety.support.steps.includes(EMERGENCY_GUIDANCE));
  }
  // A headache described with ራሴን does not.
  const config = DOMAIN_CONFIGS.social;
  const record = createCase({ id: "case-head", userId: "user-1", config, safetyAnswers: safeAnswers.social, answers: {} });
  assert.notEqual(recordAnswers(record, { caseNarrative: "ራሴን አመመኝ" }, config).stage, "crisis_routed");
  // Choice codes are not free text.
  assert.equal(screenFreeText({ red_flag_symptoms_screen: "fainting_dizziness" }), null);
});

test("emergency contacts: none until verified; an administrator's verified list is shown", () => {
  assert.deepEqual(VERIFIED_EMERGENCY_CONTACTS, []);
  assert.deepEqual(verifiedEmergencyContacts(), []);
  assert.equal(emergencyStep(), EMERGENCY_GUIDANCE);
  assert.deepEqual(screenFreeText({ a: "I want to kill myself" }).support.hotlines, []);
  try {
    setConfiguredEmergencyContacts([{ name: "Test service", number: "1234", verifiedOn: "2026-10-01" }, { name: "", number: "5" }]);
    assert.deepEqual(verifiedEmergencyContacts().map((c) => c.number), ["1234"]);
    assert.match(emergencyStep(), /Test service 1234/);
    assert.deepEqual(screenFreeText({ a: "I want to kill myself" }).support.hotlines, [{ name: "Test service", number: "1234" }]);
  } finally {
    setConfiguredEmergencyContacts([]);
  }
});

test("no source file outside emergencyContacts.ts hard-codes an emergency number", () => {
  const root = path.resolve(import.meta.dirname, "..");
  const allowed = new Set(["lib/safety/emergencyContacts.ts", "tests/safety-core.test.mjs"]);
  // A standalone 9xx (or 8335) on a line about calling or emergencies, or any 0800- number.
  const SHORT = /(?<![\w.#+/:,-]|weight:\s?)(?:9\d\d|8335)(?![\w%.,-]|\s?\d)/;
  const CONTEXT = /call|dial|hotline|emergenc|police|ambulance|tel:|number|crisis|helpline|support line|ፖሊስ|አምቡላንስ|ይደውሉ|ስልክ|አደጋ/i;
  const LONG = /\b0800[- ]?\d/;
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx|mjs|js|json)$/.test(entry.name)) {
        const rel = path.relative(root, full).split(path.sep).join("/");
        if (allowed.has(rel)) continue;
        fs.readFileSync(full, "utf8").split(/\r?\n/).forEach((line, index) => {
          if (LONG.test(line) || (SHORT.test(line) && CONTEXT.test(line))) found.push(`src/${rel}:${index + 1}: ${line.trim().slice(0, 120)}`);
        });
      }
    }
  };
  walk(root);
  assert.deepEqual(found, [], "render numbers only from src/lib/safety/emergencyContacts.ts");
});
