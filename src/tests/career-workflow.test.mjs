import { test } from "node:test";
import assert from "node:assert/strict";

import { evaluateCareerSafetyScreen } from "../lib/case-workflow/careerSafetyScreen.ts";
import { buildCareerProfile, getCareerQuestions } from "../lib/case-workflow/careerQuestionEngine.ts";
import {
  analyzeCareerCase,
  bookCareerConsult,
  evaluateAndStartCareerCase,
  purchaseCareerReport,
  startCareerCase,
} from "../lib/case-workflow/careerWorkflow.ts";

test("case 3 safety screen routes self-harm triggers immediately", () => {
  const result = evaluateCareerSafetyScreen({
    basic_needs: "yes_comfortable",
    self_harm: "occasionally",
    financial_pressure: "no",
  });

  assert.equal(result.action, "crisis_route");
  assert.ok(result.crisisContent?.hotlines.length > 0);
});

test("case 3 workflow builds the end-to-end career flow", () => {
  const session = evaluateAndStartCareerCase({
    safetyAnswers: {
      basic_needs: "yes_comfortable",
      self_harm: "no",
      financial_pressure: "yes",
    },
    answers: {
      career_geez_name: "ሰሎሞን",
      career_mother_geez_name: "አለም",
      career_stage: "transitioning",
      career_sector: "technology",
      career_business_type: "sole_trader",
      career_top_goal: "Find a stable role in data work",
      neg_type: "salary",
      trans_bridge: "yes_tight",
    },
  });

  assert.equal(session.stage, "foundation");
  assert.ok(session.questions.some((question) => question.id === "career_stage"));

  const updated = analyzeCareerCase(session.id, session.userId);
  assert.ok(updated?.timingAnalysis?.numerology);
  assert.ok(updated?.expertAssignment || updated?.stage === "visible_to_user");

  const purchased = purchaseCareerReport(session.id, session.userId);
  assert.equal(purchased?.paymentConfirmed, true);
  assert.equal(purchased?.stage, "full_report_released");

  const booked = bookCareerConsult(session.id, "video", session.userId);
  assert.equal(booked?.consultation?.booked, true);
  assert.equal(booked?.stage, "consultation_booked");
});

test("case 3 profile builder and question generator are consistent", () => {
  const profile = buildCareerProfile({
    career_geez_name: "ማርያም",
    career_mother_geez_name: "ተስፋ",
    career_stage: "starting_business",
    career_sector: "agriculture",
    career_business_type: "cooperative",
    career_top_goal: "Expand a local cooperative",
  });

  assert.equal(profile.careerStage, "starting_business");
  assert.equal(profile.sector, "agriculture");
  assert.ok(getCareerQuestions("starting_business").length > 0);
});
