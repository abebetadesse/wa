import { test } from "node:test";
import assert from "node:assert/strict";

import { evaluateSocialSafetyScreen } from "../lib/case-workflow/socialSafetyScreen.ts";
import { getSocialQuestions } from "../lib/case-workflow/socialQuestionEngine.ts";
import {
  analyzeSocialWorkflowSession,
  bookSocialWorkflowConsult,
  completeSocialWorkflowPurchase,
  evaluateAndStartSocialWorkflow,
} from "../lib/case-workflow/socialWorkflow.ts";

test("case 5 safety screen routes crisis situations immediately", () => {
  const result = evaluateSocialSafetyScreen({
    loneliness: "high",
    self_harm: "occasionally",
    immediateRisk: "no",
    supportAvailable: "limited",
  });

  assert.equal(result.action, "crisis_route");
  assert.ok(result.crisisContent?.hotlines.length > 0);
});

test("case 5 workflow reaches review and purchase flow", () => {
  const session = evaluateAndStartSocialWorkflow({
    safetyAnswers: {
      loneliness: "moderate",
      self_harm: "no",
      immediateRisk: "no",
      supportAvailable: "yes",
    },
    answers: {
      belonging_need: "community_support",
      social_issue: "I want more connection in my neighborhood and at work.",
      social_safety: "yes",
      social_pattern: "isolated",
      support_network: "My aunt and a church group help sometimes.",
    },
  });

  assert.equal(session.stage, "pattern");
  assert.ok(session.questions.some((question) => question.id === "social_pattern"));

  const analyzed = analyzeSocialWorkflowSession(session.id, session.userId);
  assert.equal(analyzed?.stage, "expert_review_pending");

  const purchased = completeSocialWorkflowPurchase(session.id, session.userId);
  assert.equal(purchased?.paymentConfirmed, true);
  assert.equal(purchased?.stage, "full_report_released");

  const consulted = bookSocialWorkflowConsult(session.id, "video", session.userId);
  assert.equal(consulted?.consultation?.booked, true);
  assert.equal(consulted?.stage, "consultation_booked");
});

test("case 5 question engine is consistent", () => {
  const questions = getSocialQuestions("intake");
  assert.ok(questions.some((question) => question.id === "belonging_need"));
  assert.ok(getSocialQuestions("pattern").length >= 2);
});
