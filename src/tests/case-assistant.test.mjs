/**
 * Case questions are answered only from the case: safety first, citations checked, passages quoted
 * when no trustworthy model answer is available.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { answerCaseQuestion, checkModelAnswer, ownerSources, rankSources, reviewerSources } from "../server/cases/assistant.ts";
import { migrationStatements } from "../../scripts/table-prefix.mjs";

const report = {
  summary: "Your tiredness most likely relates to low iron intake during long fasting periods.",
  sections: [
    { title: "Nutrition", body: "Iron-rich foods such as lentils (ምስር) and teff help during fasting.", items: ["Add lentils to two meals a day"], locked: false, evidence: { citations: [{ id: "nutritional:iron", title: "Iron in Ethiopian diets", source: "EFCT 2025" }] } },
    { title: "Sleep", body: "Keep a regular bedtime and avoid coffee after noon.", locked: false },
    { title: "Full plan", locked: true },
  ],
  recommendations: [{ title: "See a clinic", description: "Ask for a blood test for anaemia.", rationale: "Low iron can be confirmed simply." }],
};

test("the person can ask only about released, unlocked report content", () => {
  const sources = ownerSources(report);
  assert.deepEqual(sources.map((source) => source.title), ["Report summary", "Nutrition", "Sleep", "Recommendation: See a clinic"]);
  assert.equal(sources[1].citation.id, "nutritional:iron");
  assert.deepEqual(ownerSources(null), []);
});

test("reviewers ask about the answers, the draft and the analysis", () => {
  const sources = reviewerSources({
    answers: { sleep: "I wake at 3am", empty: "" },
    questions: [{ id: "sleep", text: "How do you sleep?" }],
    draft: { summary: "Draft summary", sections: [{ title: "Nutrition", body: "Iron" }] },
    analysis: {
      causes: [{ title: "Low iron", explanation: "Fasting reduces iron.", because: ["I fast 200 days"] }],
      strands: [{ findings: [{ name: "Iron deficiency", summary: "Common in fasting.", steps: ["Lentils"], citation: { id: "x", title: "X", source: "Y" } }] }],
      reflections: [],
    },
  });
  assert.deepEqual(sources.map((source) => source.title), ["The person's answers", "Draft summary", "Draft: Nutrition", "Possible cause: Low iron", "Analysis: Iron deficiency"]);
  assert.match(sources[0].text, /How do you sleep\?: I wake at 3am/);
});

test("sources are ranked by the words they share with the question", () => {
  const ranked = rankSources("What foods give me iron while fasting?", ownerSources(report));
  assert.equal(ranked[0].title, "Nutrition");
  assert.deepEqual(rankSources("the and of", ownerSources(report)), []);
});

test("a crisis question gets emergency guidance and never reaches the model", async () => {
  let asked = false;
  const model = async () => ((asked = true), { answer: "x [1]", sources: [1] });
  for (const question of ["I want to kill myself tonight", "ራሴን ማጥፋት እፈልጋለሁ"]) {
    const answer = await answerCaseQuestion({ asker: "owner", question, sources: ownerSources(report) }, { model });
    assert.equal(answer.mode, "safety", question);
    assert.match(answer.text, /emergency services|health facility/);
    assert.deepEqual(answer.sources, []);
  }
  assert.equal(asked, false);
});

test("a model answer is kept only when it cites given sources, renumbered in order", async () => {
  const model = async (request) => {
    const iron = request.sources.find((source) => source.title === "Nutrition").n;
    return { answer: `Lentils and teff help [${iron}].`, sources: [iron] };
  };
  const answer = await answerCaseQuestion({ asker: "owner", question: "Which foods help my iron during fasting?", sources: ownerSources(report) }, { model });
  assert.equal(answer.mode, "model");
  assert.equal(answer.text, "Lentils and teff help [1].");
  assert.deepEqual(answer.sources.map((source) => source.title), ["Nutrition"]);
  assert.equal(answer.sources[0].citation.title, "Iron in Ethiopian diets");
});

test("uncited, out-of-range or link-citing model answers fall back to quoting the report", async () => {
  for (const reply of [{ answer: "Eat more meat." }, { answer: "See [9].", sources: [9] }, { answer: "See https://example.com [1]", sources: [1] }, null]) {
    const answer = await answerCaseQuestion({ asker: "owner", question: "Which foods help my iron?", sources: ownerSources(report) }, { model: async () => reply });
    assert.equal(answer.mode, "passages", JSON.stringify(reply));
    assert.match(answer.text, /\[1\]/);
  }
  const broken = await answerCaseQuestion({ asker: "owner", question: "Which foods help my iron?", sources: ownerSources(report) }, { model: async () => { throw new Error("model down"); } });
  assert.equal(broken.mode, "passages");
  assert.equal(checkModelAnswer({ answer: "Fine [1]", sources: [1, 7] }, 2).used.join(), "1");
});

test("a question the case does not cover says so instead of guessing", async () => {
  const answer = await answerCaseQuestion({ asker: "owner", question: "What will the exchange rate be next year?", sources: ownerSources(report) });
  assert.equal(answer.mode, "none");
  assert.match(answer.text, /does not cover this/);
});

test("asking about a case requires sign-in", async () => {
  const { POST } = await import("../app/api/case-workflows/cases/[caseId]/assistant/route.ts");
  const res = await POST(
    new NextRequest("http://localhost/api/case-workflows/cases/2f0f6f2e-0000-4000-8000-000000000000/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: "What is this?" }) }),
    { params: Promise.resolve({ caseId: "2f0f6f2e-0000-4000-8000-000000000000" }) },
  );
  assert.equal(res.status, 401);
});

test("the assistant migration is accepted by the table-prefix rewriter", () => {
  const source = fs.readFileSync(path.resolve(import.meta.dirname, "../../drizzle-mysql/0009_case_assistant.sql"), "utf8");
  const [statement] = migrationStatements(source, "wa_");
  assert.match(statement, /CREATE TABLE IF NOT EXISTS `wa_case_assistant_turns`/);
  assert.match(statement, /REFERENCES `wa_workflow_cases`/);
});
