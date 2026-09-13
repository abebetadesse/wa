import { test } from "node:test";
import assert from "node:assert/strict";

import { evaluateLegalSafetyScreen } from "../lib/case-workflow/legalSafetyScreen.ts";
import { getLegalQuestions } from "../lib/case-workflow/legalQuestionEngine.ts";
import {
  analyzeLegalWorkflowSession,
  bookLegalWorkflowConsult,
  completeLegalWorkflowPurchase,
  evaluateAndStartLegalWorkflow,
} from "../lib/case-workflow/legalWorkflow.ts";

test("case 4 safety route blocks dangerous matters first", () => {
  const result = evaluateLegalSafetyScreen({
    immediateHarm: "threats",
    criminalMatter: "yes",
    evictionRisk: "no",
    childWelfare: "no_children",
  });

  assert.equal(result.action, "crisis_route");
  assert.ok(result.crisisContent?.hotlines.length > 0);
});

test("case 4 workflow reaches expert review and purchase flow", () => {
  const session = evaluateAndStartLegalWorkflow({
    safetyAnswers: {
      immediateHarm: "no",
      criminalMatter: "no",
      evictionRisk: "within_30",
      childWelfare: "no_children",
    },
    answers: {
      jurisdiction: "Addis Ababa",
      legal_goal: "urgency",
      safety_context: "yes",
      issue_type: "housing",
      matter_detail: "I received a notice to vacate my apartment in 2 weeks.",
      deadline: "within_30",
    },
  });

  assert.equal(session.stage, "matter");
  assert.ok(session.questions.some((question) => question.id === "issue_type"));

  const analyzed = analyzeLegalWorkflowSession(session.id, session.userId);
  assert.ok(analyzed?.stage === "expert_review_pending" || analyzed?.stage === "legal_aid_route");

  const purchased = completeLegalWorkflowPurchase(session.id, session.userId);
  assert.equal(purchased?.paymentConfirmed, true);
  assert.equal(purchased?.stage, "full_report_released");

  const consulted = bookLegalWorkflowConsult(session.id, "video", session.userId);
  assert.equal(consulted?.consultation?.booked, true);
  assert.equal(consulted?.stage, "consultation_booked");
});

test("case 4 legal question generator is consistent", () => {
  const questions = getLegalQuestions("intake");
  assert.ok(questions.some((question) => question.id === "jurisdiction"));
  assert.ok(getLegalQuestions("matter").length >= 3);
});
