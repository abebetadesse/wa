export type Core = "P" | "H" | "C" | "E" | "S" | "O";
export type EthiopianSeason = "kiremt" | "tseday" | "bega" | "belg";

export type HexacoreUserContext = {
  dateOfBirth?: Date | string | null;
  frequencies?: Partial<Record<Core, number>>;
};

export type HexacoreJournalContext = {
  entryDate: Date | string;
  selectedCore?: Core | null;
  practiceCompleted?: string[] | null;
};

export type HexacoreBiometricContext = {
  createdAt: Date | string;
  traditionalReading?: { element?: string; status?: "balanced" | "depleted" | "excess" } | null;
  referralRequired?: boolean;
};

export type AlignmentReading = {
  activeCores: { primary: Core; secondary: Core; tertiary: Core };
  frequencies: Record<Core, number>;
  temporal: {
    season: EthiopianSeason;
    seasonGuidance: string;
    dayOfWeek: string;
    dayOfWeekCore: Core;
    lifeStage: string;
    lifeStageCore: Core;
  };
  todaysPractices: Array<{ practiceId: string; name: string; type: string; durationMin: number; soundHz?: number; instruction: string }>;
  journalPrompt: { core: Core; aspect: string; prompt: string; affirmation: string };
  soundHz: number;
  notices: { referralRequired: boolean; referralMessage: string | null };
};

const CORES: Core[] = ["P", "H", "C", "E", "S", "O"];
const DAY_TO_CORE: Record<string, Core> = { Sunday: "S", Monday: "O", Tuesday: "C", Wednesday: "P", Thursday: "H", Friday: "E", Saturday: "E" };
const SEASON_GUIDANCE: Record<EthiopianSeason, string> = {
  kiremt: "The heavy rains invite inward tending, rest, and connection.",
  tseday: "The blooming season invites creation, planting, and beginnings.",
  bega: "The dry season invites structure, clear decisions, and steady rhythm.",
  belg: "The small rains invite preparation, gathering, and renewal.",
};
const SEASON_SHIFT: Record<EthiopianSeason, Partial<Record<Core, number>>> = {
  kiremt: { H: 4, E: 3, S: 2 },
  tseday: { C: 5, H: 3 },
  bega: { O: 4, P: 3 },
  belg: { P: 5, C: 3 },
};
const PROMPTS: Record<Core, AlignmentReading["journalPrompt"]> = {
  P: { core: "P", aspect: "P1", prompt: "Where did you feel your own strength today?", affirmation: "I am the spark." },
  H: { core: "H", aspect: "H1", prompt: "Who did you truly connect with today?", affirmation: "I am a bridge between hearts." },
  C: { core: "C", aspect: "C1", prompt: "What did you bring into being today?", affirmation: "I am creation." },
  E: { core: "E", aspect: "E1", prompt: "Where did you find peace today?", affirmation: "I am the still pool." },
  S: { core: "S", aspect: "S1", prompt: "What did you notice beyond your own thoughts?", affirmation: "I breathe with the world." },
  O: { core: "O", aspect: "O1", prompt: "What structure held you today?", affirmation: "I am the rhythm." },
};
const PRACTICES: Record<Core, AlignmentReading["todaysPractices"]> = {
  P: [{ practiceId: "p-ground", name: "Morning grounding", type: "movement", durationMin: 10, soundHz: 741, instruction: "Stand comfortably and notice your connection to the earth." }],
  H: [{ practiceId: "h-bridge", name: "Bridge breath", type: "breath", durationMin: 8, soundHz: 396, instruction: "Breathe slowly and make room for a supportive connection." }],
  C: [{ practiceId: "c-make", name: "Make something", type: "creation", durationMin: 20, instruction: "Use your hands to cook, plant, draw, or build." }],
  E: [{ practiceId: "e-still", name: "Stillness", type: "meditation", durationMin: 15, soundHz: 432, instruction: "Sit without fixing anything and notice your rhythm." }],
  S: [{ practiceId: "s-source", name: "Source breath", type: "breath", durationMin: 12, soundHz: 963, instruction: "Breathe as if receiving and offering with each cycle." }],
  O: [{ practiceId: "o-routine", name: "Routine setting", type: "ritual", durationMin: 10, soundHz: 852, instruction: "Choose three gentle anchors for the day." }],
};

function season(now: Date): EthiopianSeason {
  const month = now.getMonth() + 1;
  if (month >= 6 && month <= 9) return "kiremt";
  if (month >= 10 && month <= 11) return "tseday";
  if (month === 12 || month === 1) return "bega";
  return "belg";
}

function lifeStage(dateOfBirth: Date | string | null | undefined, now: Date): { stage: string; core: Core } {
  if (!dateOfBirth) return { stage: "unknown", core: "E" };
  const birth = new Date(dateOfBirth);
  const years = Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  if (years < 13) return { stage: "Spark", core: "P" };
  if (years < 25) return { stage: "Bridge", core: "H" };
  if (years < 37) return { stage: "Seed", core: "C" };
  if (years < 49) return { stage: "Root", core: "E" };
  if (years < 61) return { stage: "Law", core: "O" };
  return { stage: "Wind", core: "S" };
}

function recent(date: Date | string, now: Date, days: number): boolean {
  return (now.getTime() - new Date(date).getTime()) / 86400000 <= days;
}

export class HexacoreEngine {
  static compute(input: {
    user: HexacoreUserContext;
    recentBiometrics?: HexacoreBiometricContext[];
    recentJournal?: HexacoreJournalContext[];
    now?: Date;
  }): AlignmentReading {
    const now = input.now ?? new Date();
    const currentSeason = season(now);
    const baseline = input.user.frequencies ?? {};
    const frequencies = Object.fromEntries(CORES.map((core) => [core, Math.max(0, Math.min(100, baseline[core] ?? 50))])) as Record<Core, number>;
    for (const [core, delta] of Object.entries(SEASON_SHIFT[currentSeason])) frequencies[core as Core] += delta ?? 0;
    for (const entry of input.recentJournal ?? []) {
      if (entry.selectedCore && recent(entry.entryDate, now, 30)) frequencies[entry.selectedCore] += entry.practiceCompleted?.length ? 5 : 2;
    }
    for (const entry of input.recentBiometrics ?? []) {
      if (!recent(entry.createdAt, now, 14) || !entry.traditionalReading?.element) continue;
      const mapped: Record<string, Core> = { Fire: "P", Water: "H", Earth: "C", Aether: "E", Air: "S", Metal: "O" };
      const core = mapped[entry.traditionalReading.element];
      if (core) frequencies[core] += entry.traditionalReading.status === "depleted" ? 8 : 2;
    }
    for (const core of CORES) frequencies[core] = Math.max(0, Math.min(100, Math.round(frequencies[core])));
    const ranked = [...CORES].sort((a, b) => frequencies[b] - frequencies[a]);
    const stage = lifeStage(input.user.dateOfBirth, now);
    const referralRequired = (input.recentBiometrics ?? []).some((entry) => entry.referralRequired);
    return {
      activeCores: { primary: ranked[0], secondary: ranked[1], tertiary: ranked[2] },
      frequencies,
      temporal: { season: currentSeason, seasonGuidance: SEASON_GUIDANCE[currentSeason], dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }), dayOfWeekCore: DAY_TO_CORE[now.toLocaleDateString("en-US", { weekday: "long" })], lifeStage: stage.stage, lifeStageCore: stage.core },
      todaysPractices: PRACTICES[ranked[0]],
      journalPrompt: PROMPTS[ranked[0]],
      soundHz: PRACTICES[ranked[0]][0]?.soundHz ?? 432,
      notices: { referralRequired, referralMessage: referralRequired ? "A previous reading included a referral notice. Please seek qualified support rather than relying on reflection alone." : null },
    };
  }
}
