"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  assessConstitution,
  ConstitutionAnswerKey,
  ConstitutionAnswers,
  ConstitutionAssessment,
} from "@/lib/cultural/constitutionAssessment";

interface Question {
  key: ConstitutionAnswerKey;
  title: string;
  prompt: string;
  description: string;
}

const QUESTIONS: Question[] = [
  { key: "energy", title: "Energy recovery", prompt: "How often does your energy drop before the day is over?", description: "Reflect on stamina and recovery." },
  { key: "digestion", title: "Digestive rhythm", prompt: "How often do meals leave you feeling heavy or uncomfortable?", description: "Reflect on your usual digestive experience." },
  { key: "stress", title: "Stress load", prompt: "How often does stress make it difficult to settle or stay present?", description: "Reflect on nervous-system regulation." },
  { key: "sleep", title: "Sleep recovery", prompt: "How often is your sleep interrupted or unrefreshing?", description: "Reflect on rest and daily recovery." },
  { key: "temperature", title: "Temperature comfort", prompt: "How strongly do you notice discomfort from cold or heat?", description: "Reflect on your everyday temperature comfort." },
  { key: "activity", title: "Movement consistency", prompt: "How often do long periods of sitting affect how you feel?", description: "Reflect on movement and circulation." },
];

const OPTIONS = [
  { value: 0, label: "Rarely" },
  { value: 1, label: "Sometimes" },
  { value: 2, label: "Often" },
  { value: 3, label: "Very often" },
];

const INITIAL_ANSWERS: ConstitutionAnswers = {
  energy: 1,
  digestion: 1,
  stress: 1,
  sleep: 1,
  temperature: 1,
  activity: 1,
};

function downloadAssessment(assessment: ConstitutionAssessment) {
  const blob = new Blob([JSON.stringify(assessment, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ninimed-constitution-assessment.json";
  link.click();
  URL.revokeObjectURL(url);
}

export default function ConstitutionExperience() {
  const [answers, setAnswers] = useState<ConstitutionAnswers>(INITIAL_ANSWERS);
  const [assessment, setAssessment] = useState<ConstitutionAssessment>(() => assessConstitution(INITIAL_ANSWERS));
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState<ConstitutionAssessment[]>([]);
  const [status, setStatus] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  const question = QUESTIONS[step];
  const completion = useMemo(() => Math.round(((step + 1) / QUESTIONS.length) * 100), [step]);

  useEffect(() => {
    let active = true;
    setLoadingHistory(true);
    fetch("/api/profile/constitution-history")
      .then(async (response) => (response.ok ? response.json() : []))
      .then((data: unknown) => {
        if (!active) return;
        const entries = Array.isArray(data)
          ? data
          : data && typeof data === "object" && Array.isArray((data as { history?: unknown }).history)
            ? (data as { history: unknown[] }).history
            : [];
        setHistory(entries.filter((entry): entry is ConstitutionAssessment => Boolean(entry && typeof entry === "object")));
      })
      .catch(() => {
        if (active) setHistory([]);
      })
      .finally(() => {
        if (active) setLoadingHistory(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function choose(value: number) {
    const nextAnswers = { ...answers, [question.key]: value };
    setAnswers(nextAnswers);
    setAssessment(assessConstitution(nextAnswers));
  }

  async function saveAssessment() {
    setStatus("Saving...");
    try {
      const response = await fetch("/api/profile/constitution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...assessment, answers }),
      });
      if (!response.ok) throw new Error("Unable to save assessment");
      setHistory((current) => [assessment, ...current]);
      setStatus("Assessment saved.");
    } catch {
      setStatus("Sign in to save your assessment.");
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-sky-700">Ethiopian Wisdom self-reflection</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">Constitution assessment</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Explore patterns across energy, digestion, stress, sleep, temperature, and movement.
          </p>
        </div>
        <Link className="btn-pill-secondary" href="/diagnostic">Open diagnostic portal</Link>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card-warm space-y-6 p-6">
          <div className="flex items-center justify-between text-sm">
            <span>Question {step + 1} of {QUESTIONS.length}</span>
            <span>{completion}% complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-sky-100">
            <div className="h-full rounded-full bg-sky-600 transition-all" style={{ width: `${completion}%` }} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{question.title}</h2>
            <p className="mt-2 text-slate-700 dark:text-slate-300">{question.prompt}</p>
            <p className="mt-1 text-sm text-slate-500">{question.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => choose(option.value)}
                className={`rounded-xl border p-4 text-left transition ${
                  answers[question.key] === option.value
                    ? "border-sky-600 bg-sky-50 ring-2 ring-sky-200 dark:bg-sky-950/40"
                    : "border-slate-200 hover:border-sky-400 dark:border-slate-700"
                }`}
              >
                <span className="font-medium">{option.label}</span>
                <span className="mt-1 block text-xs text-slate-500">Score {option.value} of 3</span>
              </button>
            ))}
          </div>
          <div className="flex justify-between gap-3">
            <button className="btn-pill-secondary" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>Previous</button>
            <button className="btn-pill-primary" disabled={step === QUESTIONS.length - 1} onClick={() => setStep((current) => current + 1)}>Next</button>
          </div>
        </div>

        <aside className="card-forest space-y-5 p-6 text-white">
          <div>
            <p className="text-sm text-sky-200">Current reflection</p>
            <h2 className="mt-1 text-2xl font-semibold">{assessment.tcmLabel}</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-sky-200">Dosha tendency</dt><dd>{assessment.doshaLabel}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-sky-200">Humoral focus</dt><dd>{assessment.humoralLabel}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-sky-200">Five-element focus</dt><dd>{assessment.fiveElementFocus}</dd></div>
          </dl>
          <div>
            <h3 className="font-semibold">Reflective guidance</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-sky-100">
              {assessment.reflectiveGuidance.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <p className="border-t border-white/20 pt-4 text-xs text-sky-200">{assessment.disclaimer}</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-pill-primary bg-white text-sky-800 hover:bg-sky-50" onClick={saveAssessment}>Save</button>
            <button className="btn-pill-secondary border-white/40 bg-transparent text-white hover:bg-white/10" onClick={() => downloadAssessment(assessment)}>Export JSON</button>
          </div>
          {status && <p className="text-sm text-sky-100" role="status">{status}</p>}
        </aside>
      </section>

      <section className="card-warm p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Saved reflections</h2>
          {loadingHistory && <span className="text-sm text-slate-500">Loading...</span>}
        </div>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No saved reflections yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {history.slice(0, 6).map((entry, index) => (
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700" key={`${entry.tcmType}-${index}`}>
                <p className="font-medium">{entry.tcmLabel}</p>
                <p className="mt-1 text-sm text-slate-500">{entry.doshaLabel} · {entry.humoralLabel}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
