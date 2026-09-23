"use client";

import { useState } from "react";
import {
  HolisticConstitutionProfile,
  PersonalizedCarePlan,
} from "@/lib/wellbeing/wellbeingTypes";
import {
  CONSTITUTION_QUESTIONS,
  ConstitutionQuestion,
  buildConstitutionProfile,
} from "@/lib/wellbeing/constitutionEngine";
import { generateCarePlan } from "@/lib/wellbeing/carePlanEngine";

type ViewMode = "quiz" | "constitution" | "careplan";

const DOSHA_COLORS: Record<string, { gradient: string; accent: string; text: string }> = {
  Vata: { gradient: "from-violet-900/60 to-indigo-900/40", accent: "border-violet-500", text: "text-violet-300" },
  Pitta: { gradient: "from-red-900/60 to-amber-900/40", accent: "border-red-500", text: "text-red-300" },
  Kapha: { gradient: "from-emerald-900/60 to-teal-900/40", accent: "border-emerald-500", text: "text-emerald-300" },
  "Vata-Pitta": { gradient: "from-violet-900/40 to-amber-900/40", accent: "border-violet-400", text: "text-violet-300" },
  "Pitta-Kapha": { gradient: "from-red-900/40 to-emerald-900/40", accent: "border-red-400", text: "text-red-300" },
  "Vata-Kapha": { gradient: "from-violet-900/40 to-teal-900/40", accent: "border-violet-400", text: "text-violet-300" },
  Tridosha: { gradient: "from-amber-900/40 to-emerald-900/40", accent: "border-amber-500", text: "text-amber-300" },
};

const HUMOR_LABELS: Record<string, { name: string; geez: string; element: string; color: string }> = {
  esat: { name: "Esat (Fire)", geez: "እሳት", element: "🔥", color: "text-red-400" },
  afere: { name: "Afere (Earth)", geez: "አፈር", element: "🌍", color: "text-amber-400" },
  nifas: { name: "Nifas (Air)", geez: "ንፋስ", element: "💨", color: "text-sky-400" },
  may: { name: "May (Water)", geez: "ማይ", element: "💧", color: "text-blue-400" },
};

const PHASE_COLORS = {
  foundation: "text-amber-400 border-amber-500/40 bg-amber-950/20",
  restore: "text-emerald-400 border-emerald-500/40 bg-emerald-950/20",
  optimize: "text-violet-400 border-violet-500/40 bg-violet-950/20",
  maintain: "text-sky-400 border-sky-500/40 bg-sky-950/20",
};

export default function ConstitutionCarePlanView() {
  const [viewMode, setViewMode] = useState<ViewMode>("quiz");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [constitution, setConstitution] = useState<HolisticConstitutionProfile | null>(null);
  const [carePlan, setCarePlan] = useState<PersonalizedCarePlan | null>(null);
  const [clientName, setClientName] = useState("Guest");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<PersonalizedCarePlan["duration"]>("8-weeks");
  const [activeCarePlanTab, setActiveCarePlanTab] = useState<"overview" | "week" | "herbs">("overview");
  const [selectedWeek, setSelectedWeek] = useState(1);

  const q: ConstitutionQuestion = CONSTITUTION_QUESTIONS[currentQuestion];
  const totalQuestions = CONSTITUTION_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleAnswer = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
    if (currentQuestion < totalQuestions - 1) {
      setTimeout(() => setCurrentQuestion((c) => c + 1), 300);
    }
  };

  const computeConstitution = () => {
    const quizAnswers = CONSTITUTION_QUESTIONS.map((question) => {
      const selectedIndex = answers[question.id] ?? 0;
      const option = question.options[selectedIndex];
      const s = option.scores;
      return {
        questionId: question.id,
        category: question.category,
        selectedOption: option.label,
        vataScore: s.vata,
        pittaScore: s.pitta,
        kaphaScore: s.kapha,
        esatScore: s.esat,
        afereScore: s.afere,
        nifasScore: s.nifas,
        mayScore: s.may,
      };
    });
    const profile = buildConstitutionProfile(quizAnswers);
    setConstitution(profile);
    setViewMode("constitution");
  };

  const generatePlan = () => {
    if (!constitution) return;
    const goals = selectedGoals.length > 0 ? selectedGoals : ["Improve energy and vitality", "Optimize digestion", "Reduce stress"];
    const plan = generateCarePlan(constitution, selectedDuration, goals, clientName);
    setCarePlan(plan);
    setViewMode("careplan");
  };

  const doshaColors = constitution
    ? DOSHA_COLORS[constitution.dosha.primaryDosha] || DOSHA_COLORS.Tridosha
    : DOSHA_COLORS.Tridosha;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="badge badge-safe mb-2">AyurAI · NaraCare.AI Integration</div>
          <h2 className="text-xl font-bold text-white">Constitution & Personalized Care Plan</h2>
          <p className="text-xs text-slate-400 mt-1">Dosha × Ethiopian Humoral × TCM — Integrated constitutional analysis with personalized wellness journey.</p>
        </div>
        <div className="flex gap-2">
          {(["quiz", "constitution", "careplan"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => { if (mode === "careplan" && !carePlan) return; if (mode === "constitution" && !constitution) return; setViewMode(mode); }}
              disabled={mode === "constitution" && !constitution || mode === "careplan" && !carePlan}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize
                ${viewMode === mode ? "bg-emerald-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}
                ${(mode === "constitution" && !constitution) || (mode === "careplan" && !carePlan) ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              {mode === "quiz" ? "📋 Quiz" : mode === "constitution" ? "🔮 Profile" : "🗓️ Care Plan"}
            </button>
          ))}
        </div>
      </div>

      {/* ======== QUIZ VIEW ======== */}
      {viewMode === "quiz" && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress */}
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Constitutional Assessment Progress</span>
              <span className="text-xs font-bold text-emerald-400">{answeredCount}/{totalQuestions}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Question navigator */}
          <div className="flex gap-1.5 flex-wrap">
            {CONSTITUTION_QUESTIONS.map((question, i) => (
              <button
                key={question.id}
                onClick={() => setCurrentQuestion(i)}
                className={`w-7 h-7 rounded text-[10px] font-bold transition-all
                  ${i === currentQuestion ? "bg-emerald-600 text-white" :
                    answers[question.id] !== undefined ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30" :
                      "bg-white/5 text-slate-500"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Current Question */}
          <div className="glass-panel p-8">
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">
              Question {currentQuestion + 1} of {totalQuestions} · {q.category}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{q.text}</h3>
            {q.amharicText && <p className="text-sm text-amber-300/70 mb-6">{q.amharicText}</p>}

            <div className="space-y-3">
              {q.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className={`w-full p-4 rounded-xl text-left transition-all border text-sm
                    ${answers[q.id] === i
                      ? "border-emerald-500 bg-emerald-950/30 text-white"
                      : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-950/10"}`}
                >
                  <span className="w-6 h-6 rounded-full border border-current inline-flex items-center justify-center text-xs font-bold mr-3">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentQuestion((c) => Math.max(0, c - 1))}
                disabled={currentQuestion === 0}
                className="btn-secondary text-xs py-2 px-4 disabled:opacity-30"
              >
                ← Previous
              </button>
              <button
                onClick={() => currentQuestion < totalQuestions - 1 ? setCurrentQuestion((c) => c + 1) : computeConstitution()}
                className="btn-primary text-xs py-2 px-4"
              >
                {currentQuestion < totalQuestions - 1 ? "Next →" : "🔮 Compute My Constitution"}
              </button>
            </div>
          </div>

          {answeredCount >= totalQuestions * 0.6 && (
            <button onClick={computeConstitution} className="w-full btn-primary py-3 font-bold">
              🔮 Compute Constitution Now ({answeredCount}/{totalQuestions} answered)
            </button>
          )}
        </div>
      )}

      {/* ======== CONSTITUTION VIEW ======== */}
      {viewMode === "constitution" && constitution && (
        <div className="space-y-6">
          {/* Hero Card */}
          <div className={`glass-panel p-8 bg-gradient-to-br ${doshaColors.gradient} border-l-4 ${doshaColors.accent}`}>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Constitutional Type</div>
                <h3 className={`text-3xl font-black ${doshaColors.text} mb-1`}>{constitution.dosha.primaryDosha}</h3>
                <div className={`text-lg font-semibold ${HUMOR_LABELS[constitution.humor.dominantHumor]?.color}`}>
                  {HUMOR_LABELS[constitution.humor.dominantHumor]?.element}{" "}
                  {HUMOR_LABELS[constitution.humor.dominantHumor]?.name}
                  {constitution.humor.secondaryHumor && (
                    <span className="text-slate-400 text-sm ml-2">
                      + {HUMOR_LABELS[constitution.humor.secondaryHumor]?.name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mt-4">{constitution.overallConstitutionNarrative}</p>
              </div>

              {/* Dosha wheel */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {(() => {
                      const { vata, pitta, kapha } = constitution.dosha;
                      const total = vata + pitta + kapha;
                      const vataAngle = (vata / total) * 100;
                      const pittaAngle = (pitta / total) * 100;
                      const kaphaAngle = (kapha / total) * 100;
                      return (
                        <>
                          <circle cx="18" cy="18" r="12" fill="none" stroke="rgba(139,92,246,0.6)" strokeWidth="4" strokeDasharray={`${vataAngle} ${100 - vataAngle}`} strokeDashoffset="0" />
                          <circle cx="18" cy="18" r="12" fill="none" stroke="rgba(239,68,68,0.6)" strokeWidth="4" strokeDasharray={`${pittaAngle} ${100 - pittaAngle}`} strokeDashoffset={`-${vataAngle}`} />
                          <circle cx="18" cy="18" r="12" fill="none" stroke="rgba(34,197,94,0.6)" strokeWidth="4" strokeDasharray={`${kaphaAngle} ${100 - kaphaAngle}`} strokeDashoffset={`-${vataAngle + pittaAngle}`} />
                        </>
                      );
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white text-center leading-tight">
                      {constitution.dosha.primaryDosha}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 text-[10px]">
                  <span className="text-violet-400">V: {constitution.dosha.vata}%</span>
                  <span className="text-red-400">P: {constitution.dosha.pitta}%</span>
                  <span className="text-emerald-400">K: {constitution.dosha.kapha}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Vulnerabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-5">
              <h4 className="font-bold text-emerald-400 mb-3">✓ Strengths</h4>
              <ul className="space-y-1.5">
                {[...constitution.strengthsAndVulnerabilities.physicalStrengths, ...constitution.strengthsAndVulnerabilities.mentalStrengths].map((s) => (
                  <li key={s} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0">→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-panel p-5">
              <h4 className="font-bold text-amber-400 mb-3">⚠ Watch Points</h4>
              <ul className="space-y-1.5">
                {[...constitution.strengthsAndVulnerabilities.physicalVulnerabilities, ...constitution.strengthsAndVulnerabilities.mentalVulnerabilities].map((v) => (
                  <li key={v} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-amber-500 shrink-0">!</span>{v}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dietary Protocol */}
          <div className="glass-panel p-5">
            <h4 className="font-bold text-white mb-4">Dietary Protocol for Your Constitution</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">✓ Favored Foods</div>
                <ul className="space-y-1">{constitution.dietaryProtocol.favored.map((f) => <li key={f} className="text-xs text-slate-300">• {f}</li>)}</ul>
              </div>
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">~ Reduce</div>
                <ul className="space-y-1">{constitution.dietaryProtocol.reduce.map((f) => <li key={f} className="text-xs text-slate-300">• {f}</li>)}</ul>
              </div>
              <div>
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">✗ Avoid</div>
                <ul className="space-y-1">{constitution.dietaryProtocol.avoid.map((f) => <li key={f} className="text-xs text-slate-300">• {f}</li>)}</ul>
              </div>
            </div>
          </div>

          {/* Generate Care Plan */}
          <div className="glass-panel p-6 border border-emerald-500/20 bg-emerald-950/10">
            <h4 className="font-bold text-white mb-4">Generate Your Personalized Care Plan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">Your Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">Plan Duration</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value as PersonalizedCarePlan["duration"])}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-emerald-500"
                >
                  <option value="4-weeks">4 Weeks — Foundation</option>
                  <option value="8-weeks">8 Weeks — Restore</option>
                  <option value="12-weeks">12 Weeks — Optimize</option>
                  <option value="6-months">6 Months — Transformation</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">wellbeing Goals (select up to 3)</label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Improve energy and vitality", "Optimize digestion", "Reduce stress and anxiety",
                  "Better sleep quality", "Weight management", "Strengthen immunity",
                  "Reduce inflammation", "Hormonal balance", "Mental clarity",
                ].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setSelectedGoals((prev) =>
                      prev.includes(goal) ? prev.filter((g) => g !== goal) :
                        prev.length < 3 ? [...prev, goal] : prev
                    )}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedGoals.includes(goal) ? "bg-emerald-600/30 border-emerald-500 text-white" : "border-white/10 text-slate-400 hover:border-emerald-500/30"}`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generatePlan} className="btn-primary py-3 px-6 font-bold text-sm">
              🗓️ Generate {selectedDuration} Care Plan
            </button>
          </div>
        </div>
      )}

      {/* ======== CARE PLAN VIEW ======== */}
      {viewMode === "careplan" && carePlan && (
        <div className="space-y-5">
          {/* Care Plan Header */}
          <div className="glass-panel p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Personalized Care Plan</div>
                <h3 className="text-2xl font-bold text-white">{carePlan.clientName}&apos;s {carePlan.duration} Journey</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {carePlan.constitution.dosha.primaryDosha} constitution ·{" "}
                  {HUMOR_LABELS[carePlan.constitution.humor.dominantHumor]?.name}
                </p>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">Progress</div>
                <div className="text-4xl font-black text-emerald-400">{carePlan.overallProgress}%</div>
                <div className="text-xs text-slate-500">Week {carePlan.currentWeek}</div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <div className="text-xs font-bold text-emerald-400 mb-1">AI Insight</div>
              <p className="text-sm text-slate-300 leading-relaxed">{carePlan.aiInsight}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-black/30 rounded-xl border border-white/5 w-fit">
            {(["overview", "week", "herbs"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveCarePlanTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeCarePlanTab === tab ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}>
                {tab === "overview" ? "📊 Overview" : tab === "week" ? "📅 Weekly Plan" : "🌿 Herbs & Supplements"}
              </button>
            ))}
          </div>

          {activeCarePlanTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carePlan.weeklyPlans.slice(0, 4).map((week) => (
                <div key={week.weekNumber} className={`glass-panel p-4 border ${PHASE_COLORS[week.phase]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Week {week.weekNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PHASE_COLORS[week.phase]}`}>{week.phase}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-2">{week.focus}</h4>
                  <ul className="space-y-1">
                    {week.goals.slice(0, 2).map((goal) => (
                      <li key={goal} className="text-xs text-slate-400 flex items-start gap-1.5">
                        <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>{goal}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeCarePlanTab === "week" && (
            <div className="space-y-4">
              {/* Week selector */}
              <div className="flex gap-2 flex-wrap">
                {carePlan.weeklyPlans.map((w) => (
                  <button key={w.weekNumber} onClick={() => setSelectedWeek(w.weekNumber)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                      ${selectedWeek === w.weekNumber ? "border-emerald-500 bg-emerald-950/30 text-white" : "border-white/10 text-slate-400 hover:border-emerald-500/30"}`}>
                    W{w.weekNumber}
                  </button>
                ))}
              </div>

              {(() => {
                const week = carePlan.weeklyPlans.find((w) => w.weekNumber === selectedWeek);
                if (!week) return null;
                return (
                  <div className="space-y-4">
                    <div className={`glass-panel p-4 border ${PHASE_COLORS[week.phase]}`}>
                      <div className="text-xs uppercase tracking-wider font-bold mb-1 opacity-70">Week {week.weekNumber} · {week.phase}</div>
                      <h4 className="font-bold text-white text-lg">{week.focus}</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(["morning", "afternoon", "evening", "night"] as const).map((period) => {
                        const periodIcons = { morning: "🌅", afternoon: "☀️", evening: "🌙", night: "💤" };
                        return (
                          <div key={period} className="glass-panel p-4">
                            <h5 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                              <span>{periodIcons[period]}</span>
                              <span className="capitalize">{period}</span>
                            </h5>
                            <ul className="space-y-2">
                              {week.dailySchedule[period].map((item, i) => (
                                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                  <span className="text-emerald-500 shrink-0 mt-0.5">→</span>{item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>

                    {/* Check-in prompts */}
                    <div className="glass-panel p-4 border border-violet-500/20 bg-violet-950/10">
                      <h5 className="text-sm font-bold text-violet-400 mb-3">📝 Weekly Check-In Prompts</h5>
                      <ul className="space-y-2">
                        {week.checkInPrompts.map((prompt, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-violet-500 shrink-0 font-bold">{i + 1}.</span>{prompt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeCarePlanTab === "herbs" && (
            <div className="space-y-3">
              {carePlan.constitution.ayurvedicHerbsForBalance.map((herb, i) => (
                <div key={i} className="glass-panel p-5 border-l-4 border-l-emerald-500/40">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h5 className="font-bold text-white">{herb.herb}</h5>
                      <p className="text-xs text-slate-400 italic">{herb.sanskritName}</p>
                      {herb.ethiopianEquivalent && (
                        <span className="text-xs text-amber-400 mt-0.5 block">≈ Ethiopian: {herb.ethiopianEquivalent}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">{herb.dosage}</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">{herb.purpose}</p>
                  <div className="p-2 rounded bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/70">
                    ⚠ {herb.caution}
                  </div>
                </div>
              ))}
              <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                <p className="text-xs text-slate-400 leading-relaxed">{carePlan.disclaimer}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
