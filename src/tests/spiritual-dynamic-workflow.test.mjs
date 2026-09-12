import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateFullDivination,
  isGeezScript,
  extractGeezLetters,
} from "../lib/cultural/spiritualDivinationEngine.ts";

import {
  generateDynamicQuestions,
  evaluateSpiritualCrisis,
} from "../lib/case-workflow/spiritualQuestionEngine.ts";

import {
  assignExpert,
  startSpiritualCase,
  submitSpiritualCase,
  expertApproveSpiritualCase,
  confirmSpiritualPayment,
  generateHealingScroll,
  getSpiritualCase,
  EXPERTS_REGISTRY,
} from "../lib/case-workflow/spiritualExpertEngine.ts";

const mockGematria = calculateFullDivination("ሰላማዊት", "ፀሐይ");

describe("Spiritual Case Dynamic Workflow", () => {
  // ─── Live Gematria ──────────────────────────────────────────────
  test("calculates gematria live as user types", () => {
    const result = calculateFullDivination("ሰላማዊት", "ፀሐይ");
    assert.equal(result.isValid, true);
    assert.equal(result.nameSubtotal, 147);
    assert.equal(result.motherSubtotal, 693);
    assert.equal(result.totalSum, 840);
    assert.equal(result.dividedBy12, 70);
    assert.equal(result.finalNumber, 10);
  });

  test("updates results when name changes", () => {
    const initial = calculateFullDivination("ሰላማዊት", "ፀሐይ");
    assert.equal(initial.finalNumber, 10);

    const changed = calculateFullDivination("አበበ", "ፀሐይ");
    assert.notEqual(changed.totalSum, initial.totalSum);
    assert.notEqual(changed.finalNumber, initial.finalNumber);
  });

  test("shows zodiac, circle, and talismanic character in live preview", () => {
    const result = calculateFullDivination("ሰላማዊት", "ፀሐይ");
    assert.ok(result.zodiac);
    assert.equal(result.zodiac.name, "Nisr");
    assert.equal(result.zodiac.symbol, "🦅");
    assert.equal(result.zodiac.element, "Air");

    assert.ok(result.awdeCircle);
    assert.equal(result.awdeCircle.number, 8);
    assert.equal(result.awdeCircle.name, "Transformation");
    assert.equal(result.awdeCircle.nameAmharic, "ቅድስት");

    assert.ok(result.talismanic);
    assert.equal(result.talismanic.number, 10);
    assert.equal(result.talismanic.name, "The Visionary");
  });

  // ─── Dynamic Question Branching ─────────────────────────────────
  test("generates career questions when category = career", () => {
    const questions = generateDynamicQuestions(
      mockGematria,
      "career",
      { question_category: "career" }
    );
    assert.ok(questions.find((q) => q.id === "career_stage"));
    assert.ok(questions.find((q) => q.id === "career_blocker"));
  });

  test("adds personalized question when Awde circle = 8", () => {
    const gematria = { ...mockGematria, awdeCircle: { number: 8, name: "Transformation", nameAmharic: "ቅድስት", lakeName: "Lake of Renewal", element: "Water", symbolism: "Transformation" } };
    const questions = generateDynamicQuestions(
      gematria,
      "career",
      { question_category: "career" }
    );
    const transformQ = questions.find((q) => q.id === "transformation_awareness");
    assert.ok(transformQ);
    assert.match(transformQ.text, /transformation/i);
  });

  test("adds DV screening for relationships category", () => {
    const questions = generateDynamicQuestions(
      mockGematria,
      "relationships",
      { question_category: "relationships" }
    );
    const dvQuestion = questions.find((q) => q.id === "safety_screening");
    assert.ok(dvQuestion);
    assert.equal(dvQuestion.required, true);
    assert.equal(dvQuestion.type, "radio");
  });

  // ─── Crisis Detection ──────────────────────────────────────────
  test("detects crisis keyword and shows crisis content immediately", () => {
    const crisisCheck = evaluateSpiritualCrisis("I want to kill myself", {
      free_text: "I want to kill myself",
    });
    assert.equal(crisisCheck.urgencyLevel, "crisis");
    assert.ok(crisisCheck.crisisContent);
    assert.ok(crisisCheck.crisisContent.hotlines.includes("952"));
  });

  test("crisis content is not gated behind paywall", () => {
    const crisisCheck = evaluateSpiritualCrisis("I want to kill myself", {
      free_text: "I want to kill myself",
    });
    assert.ok(crisisCheck.crisisContent);
    assert.equal(crisisCheck.paywall, undefined);
  });

  // ─── Expert Assignment ─────────────────────────────────────────
  test("assigns the best-matching expert based on language and load", async () => {
    const expert = await assignExpert("case-123", "spiritual", ["am", "en"], "addis_ababa");
    assert.equal(expert.credential_verified, true);
    assert.ok(expert.case_types.includes("spiritual"));
    assert.ok(expert.rating >= 4.5);
  });

  test("throws error when no expert is available", async () => {
    await assert.rejects(
      async () => {
        // Query an unsupported case type where no expert exists
        await assignExpert("case-999", "unsupported_type_xyz", ["am"], "addis_ababa");
      },
      (err) => err.message === "NO_EXPERT_AVAILABLE"
    );
  });

  // ─── Expert Review Gate ────────────────────────────────────────
  test("blocks report visibility without expert approval checklist", () => {
    const session = startSpiritualCase("ሰላማዊት", "ፀሐይ");
    session.assignedExpert = EXPERTS_REGISTRY[0];

    assert.throws(() => {
      expertApproveSpiritualCase(session.id, { checklistCompleted: false });
    }, /CHECKLIST_NOT_COMPLETED/);
  });

  test("allows visibility after expert approval + checklist", () => {
    const session = startSpiritualCase("ሰላማዊት", "ፀሐይ");
    session.assignedExpert = EXPERTS_REGISTRY[0];

    const approved = expertApproveSpiritualCase(session.id, { checklistCompleted: true });
    assert.equal(approved.status, "visible_to_user");
  });

  test("blocks approval if expert credential is not verified", () => {
    const session = startSpiritualCase("ሰላማዊት", "ፀሐይ");
    session.assignedExpert = {
      ...EXPERTS_REGISTRY[0],
      credential_verified: false,
    };

    assert.throws(() => {
      expertApproveSpiritualCase(session.id, { checklistCompleted: true });
    }, /EXPERT_CREDENTIAL_NOT_VERIFIED/);
  });

  // ─── Healing Scroll ────────────────────────────────────────────
  test("generates a personalized healing scroll PDF", () => {
    const scroll = generateHealingScroll(mockGematria, "career");
    assert.ok(scroll.pdfUrl);
    assert.ok(scroll.prayers.length > 0);
    assert.ok(scroll.wordsOfPower.length > 0);
    assert.ok(scroll.imagery.length > 0);
  });

  // ─── Payment ───────────────────────────────────────────────────
  test("releases full report after payment", () => {
    const session = startSpiritualCase("ሰላማዊት", "ፀሐይ");
    session.assignedExpert = EXPERTS_REGISTRY[0];
    expertApproveSpiritualCase(session.id, { checklistCompleted: true });

    const released = confirmSpiritualPayment(session.id, { transactionRef: "TXN-123" });
    assert.equal(released.status, "full_report_released");
    assert.equal(released.paymentConfirmed, true);
    assert.equal(released.transactionRef, "TXN-123");
  });
});
