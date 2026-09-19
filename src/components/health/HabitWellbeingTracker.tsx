"use client";

import { useState, useEffect } from "react";
import {
  HabitDefinition,
  HabitEntry,
  HabitStreak,
  MoodEntry,
} from "@/lib/health/healthTypes";

const DEFAULT_HABITS: HabitDefinition[] = [
  { id: "h1", name: "Morning Oil Massage", nameAmharic: "ጠዋት ዘይት መቀባት", category: "meditation", description: "Ayurvedic abhyanga — 10 min warm oil self-massage", targetFrequency: "daily", targetCount: 1, icon: "🫙", color: "amber", reminderTime: "07:00", relatedConstitutionTypes: ["Vata", "Vata-Pitta"], relatedHumors: ["nifas"] },
  { id: "h2", name: "Drink Fermented Injera", nameAmharic: "ኢንጀራ መብላት", category: "nutrition", description: "Have at least one meal with fermented teff injera", targetFrequency: "daily", targetCount: 1, icon: "🫓", color: "emerald", relatedConstitutionTypes: ["Kapha", "Vata"], relatedHumors: ["afere"] },
  { id: "h3", name: "Morning Walk / Movement", nameAmharic: "ጠዋት እግር ጉዞ", category: "movement", description: "20–30 minute brisk walk or yoga flow", targetFrequency: "daily", targetCount: 1, icon: "🚶", color: "sky", reminderTime: "08:00", relatedConstitutionTypes: ["Kapha", "Pitta-Kapha"], relatedHumors: ["afere"] },
  { id: "h4", name: "Herbal Tea Ritual", nameAmharic: "የዕፅ ሻይ", category: "herbal_medicine", description: "Drink a cup of constitution-aligned herbal tea", targetFrequency: "daily", targetCount: 1, icon: "🍵", color: "green", relatedConstitutionTypes: ["Vata", "Pitta"], relatedHumors: ["esat", "nifas"] },
  { id: "h5", name: "Gratitude Journal", nameAmharic: "የምስጋና ማስታወሻ", category: "gratitude", description: "Write 3 things you are grateful for today", targetFrequency: "daily", targetCount: 1, icon: "📓", color: "violet", relatedConstitutionTypes: ["Vata", "Pitta"], relatedHumors: ["esat"] },
  { id: "h6", name: "Hydration Check", nameAmharic: "ውሃ መጠጣት", category: "hydration", description: "Drink 8 glasses (2L) of warm-to-room temperature water", targetFrequency: "daily", targetCount: 8, icon: "💧", color: "blue", relatedConstitutionTypes: ["Vata", "Pitta"], relatedHumors: ["esat", "nifas"] },
  { id: "h7", name: "Sleep Before 10:30 PM", nameAmharic: "ቀደም ብሎ ማደር", category: "sleep", description: "Be in bed before 10:30 PM to align with solar rhythms", targetFrequency: "daily", targetCount: 1, icon: "🌙", color: "indigo", reminderTime: "22:00", relatedConstitutionTypes: ["Vata", "Kapha"], relatedHumors: ["may"] },
  { id: "h8", name: "Coffee Ceremony (Buna)", nameAmharic: "የቡና ሥነ-ሥርዓት", category: "social", description: "Participate in or mindfully prepare Ethiopian coffee ceremony", targetFrequency: "x_per_week", targetCount: 3, icon: "☕", color: "amber", relatedConstitutionTypes: ["Kapha", "Pitta-Kapha"], relatedHumors: ["afere"] },
];

const MOOD_LABELS = ["😢", "😕", "😐", "🙂", "😊", "😄", "😁", "🤩", "🌟", "✨"];
const EMOTION_OPTIONS = ["Calm", "Anxious", "Happy", "Sad", "Energized", "Fatigued", "Focused", "Scattered", "Content", "Irritable", "Grateful", "Overwhelmed"];
const SYMPTOM_OPTIONS = ["Headache", "Bloating", "Back pain", "Fatigue", "Nausea", "Joint stiffness", "Skin irritation", "Restlessness"];
const CONTEXT_OPTIONS = ["Fasting day", "After coffee ceremony", "After exercise", "Work stress", "Family gathering", "Holiday", "Poor sleep", "Excellent sleep"];

const COLOR_MAP: Record<string, string> = {
  amber: "border-amber-500/40 text-amber-400 bg-amber-950/20",
  emerald: "border-emerald-500/40 text-emerald-400 bg-emerald-950/20",
  sky: "border-sky-500/40 text-sky-400 bg-sky-950/20",
  green: "border-green-500/40 text-green-400 bg-green-950/20",
  violet: "border-violet-500/40 text-violet-400 bg-violet-950/20",
  blue: "border-blue-500/40 text-blue-400 bg-blue-950/20",
  indigo: "border-indigo-500/40 text-indigo-400 bg-indigo-950/20",
};

function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) return null;
  const fire = streak >= 21 ? "🔥🔥🔥" : streak >= 7 ? "🔥🔥" : streak >= 3 ? "🔥" : "⚡";
  return (
    <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5">
      {fire} {streak}d
    </span>
  );
}

function getStableStreak(habitId: string, index: number): HabitStreak {
  const seed = habitId.split("").reduce((total, character) => total + character.charCodeAt(0), index * 17);
  return {
    habitId,
    currentStreak: seed % 14,
    longestStreak: (seed * 3) % 30 + 7,
    totalCompletions: (seed * 11) % 100 + 10,
    weeklyConsistency: (seed * 7) % 40 + 60,
  };
}

export default function HabitWellbeingTracker() {
  const [activeTab, setActiveTab] = useState<"habits" | "mood" | "insights">("habits");
  const [habits] = useState<HabitDefinition[]>(DEFAULT_HABITS);
  const [todayEntries, setTodayEntries] = useState<Record<string, boolean>>({});
  const [streaks] = useState<Record<string, HabitStreak>>(() =>
    Object.fromEntries(habits.map((habit, index) => [habit.id, getStableStreak(habit.id, index)]))
  );
  const [moodLogs, setMoodLogs] = useState<MoodEntry[]>([]);
  const [moodDraft, setMoodDraft] = useState({
    overallMood: 5,
    energy: 5,
    anxiety: 3,
    digestion: 5,
    sleepQuality: 6,
    emotions: [] as string[],
    symptoms: [] as string[],
    contexts: [] as string[],
    notes: "",
  });

  const toggleHabit = (habitId: string) => {
    setTodayEntries((prev) => ({ ...prev, [habitId]: !prev[habitId] }));
  };

  const toggleMultiSelect = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const logMood = () => {
    const entry: MoodEntry = {
      id: `mood-${Date.now()}`,
      timestamp: new Date().toISOString(),
      overallMood: moodDraft.overallMood,
      energy: moodDraft.energy,
      anxiety: moodDraft.anxiety,
      digestion: moodDraft.digestion,
      sleepQuality: moodDraft.sleepQuality,
      emotions: moodDraft.emotions,
      physicalSymptoms: moodDraft.symptoms,
      notes: moodDraft.notes,
      contextTags: moodDraft.contexts,
    };
    setMoodLogs((prev) => [entry, ...prev]);
    setMoodDraft({ overallMood: 5, energy: 5, anxiety: 3, digestion: 5, sleepQuality: 6, emotions: [], symptoms: [], contexts: [], notes: "" });
  };

  const completedToday = Object.values(todayEntries).filter(Boolean).length;
  const totalHabits = habits.length;
  const completionRate = Math.round((completedToday / totalHabits) * 100);

  const avgStreak = Math.round(
    Object.values(streaks).reduce((sum, s) => sum + s.currentStreak, 0) / Object.values(streaks).length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="badge badge-safe mb-2">Thryval · Habit & Wellbeing Tracker</div>
        <h2 className="text-xl font-bold text-white">Daily Habits & Wellbeing Journal</h2>
        <p className="text-xs text-slate-400 mt-1">Track habits aligned with your constitutional type, log your daily mood, and receive weekly wellness insights.</p>
      </div>

      {/* Quick stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-black text-emerald-400">{completedToday}/{totalHabits}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Today&apos;s Habits</div>
          <div className="h-1 rounded-full bg-white/5 mt-2 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-black text-amber-400">🔥 {avgStreak}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Avg Streak (days)</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-black text-violet-400">{moodLogs.length > 0 ? MOOD_LABELS[Math.min(9, moodLogs[0].overallMood - 1)] : "—"}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Last Mood Log</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-black/30 rounded-xl border border-white/5 w-fit">
        {(["habits", "mood", "insights"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}>
            {tab === "habits" ? "✓ Habits" : tab === "mood" ? "💭 Mood Log" : "📊 Insights"}
          </button>
        ))}
      </div>

      {/* ======= HABITS TAB ======= */}
      {activeTab === "habits" && (
        <div className="space-y-3">
          {habits.map((habit) => {
            const done = todayEntries[habit.id] || false;
            const streak = streaks[habit.id];
            const colorClass = COLOR_MAP[habit.color] || COLOR_MAP.emerald;

            return (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`glass-panel p-4 cursor-pointer transition-all border ${done ? "border-emerald-500/50 bg-emerald-950/10" : ""} hover:border-white/20`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${done ? "border-emerald-500 bg-emerald-600" : "border-white/20"}`}>
                    {done && <span className="text-white text-sm">✓</span>}
                  </div>

                  <div className="text-2xl">{habit.icon}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className={`font-semibold text-sm ${done ? "text-white" : "text-slate-300"}`}>{habit.name}</span>
                      {habit.nameAmharic && <span className="text-xs text-amber-400/70">{habit.nameAmharic}</span>}
                    </div>
                    <p className="text-xs text-slate-500">{habit.description}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StreakBadge streak={streak?.currentStreak || 0} />
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
                      {habit.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {completedToday === totalHabits && (
            <div className="glass-panel p-6 text-center border border-emerald-500/40 bg-emerald-950/20">
              <div className="text-4xl mb-3">🌟</div>
              <h3 className="font-bold text-white text-lg">Perfect Day!</h3>
              <p className="text-sm text-emerald-300 mt-1">All {totalHabits} habits completed today. Exceptional alignment!</p>
            </div>
          )}
        </div>
      )}

      {/* ======= MOOD TAB ======= */}
      {activeTab === "mood" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Log Form */}
          <div className="glass-panel p-6 space-y-5">
            <h3 className="font-bold text-white">How are you feeling right now?</h3>

            {[
              { key: "overallMood", label: "Overall Mood", emoji: MOOD_LABELS },
              { key: "energy", label: "Energy Level", emoji: null },
              { key: "digestion", label: "Digestive Comfort", emoji: null },
              { key: "sleepQuality", label: "Sleep Last Night", emoji: null },
              { key: "anxiety", label: "Anxiety Level (lower = better)", emoji: null },
            ].map((field) => (
              <div key={field.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{field.label}</label>
                  <span className="text-lg">
                    {field.emoji ? field.emoji[Math.min(9, moodDraft[field.key as keyof typeof moodDraft] as number - 1)] : `${moodDraft[field.key as keyof typeof moodDraft]}/10`}
                  </span>
                </div>
                <input
                  type="range" min={1} max={10}
                  value={moodDraft[field.key as keyof typeof moodDraft] as number}
                  onChange={(e) => setMoodDraft((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))}
                  className="w-full accent-emerald-500"
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Emotions Today</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOTION_OPTIONS.map((em) => (
                  <button key={em} onClick={() => setMoodDraft((p) => ({ ...p, emotions: toggleMultiSelect(p.emotions, em) }))}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-all border ${moodDraft.emotions.includes(em) ? "border-violet-500 bg-violet-950/30 text-white" : "border-white/10 text-slate-400 hover:border-violet-500/30"}`}>
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Physical Symptoms</label>
              <div className="flex flex-wrap gap-1.5">
                {SYMPTOM_OPTIONS.map((sym) => (
                  <button key={sym} onClick={() => setMoodDraft((p) => ({ ...p, symptoms: toggleMultiSelect(p.symptoms, sym) }))}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-all border ${moodDraft.symptoms.includes(sym) ? "border-rose-500 bg-rose-950/30 text-white" : "border-white/10 text-slate-400 hover:border-rose-500/30"}`}>
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Context Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {CONTEXT_OPTIONS.map((ctx) => (
                  <button key={ctx} onClick={() => setMoodDraft((p) => ({ ...p, contexts: toggleMultiSelect(p.contexts, ctx) }))}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-all border ${moodDraft.contexts.includes(ctx) ? "border-amber-500 bg-amber-950/30 text-white" : "border-white/10 text-slate-400 hover:border-amber-500/30"}`}>
                    {ctx}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={moodDraft.notes}
              onChange={(e) => setMoodDraft((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Any additional notes for today..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-emerald-500 resize-none"
            />

            <button onClick={logMood} className="w-full btn-primary py-3 font-bold text-sm">
              💭 Save Today&apos;s Mood Entry
            </button>
          </div>

          {/* Mood History */}
          <div className="space-y-3">
            <h3 className="font-bold text-white">Recent Mood History</h3>
            {moodLogs.length === 0 ? (
              <div className="glass-panel p-10 text-center">
                <div className="text-4xl mb-3">💭</div>
                <p className="text-slate-400 text-sm">No mood entries yet. Log your first check-in.</p>
              </div>
            ) : (
              moodLogs.slice(0, 7).map((entry) => (
                <div key={entry.id} className="glass-panel p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{MOOD_LABELS[Math.min(9, entry.overallMood - 1)]}</span>
                      <div>
                        <div className="text-xs font-bold text-white">Mood {entry.overallMood}/10 · Energy {entry.energy}/10</div>
                        <div className="text-[10px] text-slate-500">{new Date(entry.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                    {entry.contextTags.length > 0 && (
                      <div className="flex gap-1 flex-wrap justify-end">
                        {entry.contextTags.map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/30 text-amber-400 border border-amber-500/20">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {entry.emotions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.emotions.map((em) => (
                        <span key={em} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-950/30 text-violet-400">{em}</span>
                      ))}
                    </div>
                  )}
                  {entry.notes && <p className="text-xs text-slate-400 mt-2 italic">{entry.notes}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======= INSIGHTS TAB ======= */}
      {activeTab === "insights" && (
        <div className="space-y-4">
          {/* Habit completion heatmap */}
          <div className="glass-panel p-5">
            <h4 className="font-bold text-white mb-4">Habit Consistency Overview</h4>
            <div className="space-y-3">
              {habits.map((habit) => {
                const streak = streaks[habit.id];
                const weeklyPct = streak?.weeklyConsistency || 0;
                return (
                  <div key={habit.id} className="flex items-center gap-4">
                    <span className="text-lg w-8 text-center">{habit.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-300 truncate">{habit.name}</span>
                        <span className="text-xs font-bold text-slate-400 shrink-0 ml-2">{weeklyPct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${weeklyPct}%`,
                            backgroundColor: weeklyPct >= 80 ? "#22c55e" : weeklyPct >= 60 ? "#f59e0b" : "#ef4444",
                          }}
                        />
                      </div>
                    </div>
                    <StreakBadge streak={streak?.currentStreak || 0} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI-style weekly insight */}
          <div className="glass-panel p-6 border border-violet-500/20 bg-violet-950/10">
            <div className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-3">🤖 Weekly Wellness Insight</div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Your habit consistency is strongest in morning routines and nutrition practices. To improve, focus on the evening habits — particularly earlier sleep timing — which have the greatest downstream effect on morning energy and digestive fire regulation.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <div className="text-xs text-emerald-400 font-bold mb-1">Top Pattern 🌟</div>
                <p className="text-xs text-slate-300">Morning nutrition rituals — 85% weekly consistency. Outstanding!</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                <div className="text-xs text-amber-400 font-bold mb-1">Improve Next 📈</div>
                <p className="text-xs text-slate-300">Sleep timing — aim for 3 consecutive nights before 10:30 PM this week.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
