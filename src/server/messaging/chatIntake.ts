/**
 * Starting and completing a request entirely in Telegram or WhatsApp, one question per message.
 *
 *   NEW (or ጀምር / ጉዳይ)   choose a care pathway, answer its safety screen, then its intake questions
 *   CANCEL (or ሰርዝ)       stop the conversation (a request already created stays as a draft in the app)
 *
 * The case is created, answered and submitted through the same case service the app uses, so the
 * safety screen, crisis routing and free-text screening behave exactly as on the website. Choices
 * are answered with their number; text questions with the reply itself; optional questions with 0
 * to skip. Progress is kept per person (chat_intakes) and expires after two days without a reply.
 *
 * Dependencies are injected so the conversation is tested without a database or network.
 */
import type { Translate } from "@/server/i18n/serverText";
import { DOMAIN_CONFIGS, getDomainConfig } from "@/server/cases/domains";
import { isApplicable } from "@/server/cases/machine";
import { WORKFLOW_DOMAINS, type DomainConfig, type SafetyOutcome, type WorkflowDomain, type WorkflowQuestion, type WorkflowStage } from "@/server/cases/types";

export interface ChatIntakeState {
  phase: "domain" | "safety" | "start" | "intake" | "confirm";
  domain: WorkflowDomain | null;
  safetyAnswers: Record<string, unknown>;
  /** Every answer given so far (start questions and intake questions). */
  answers: Record<string, unknown>;
  skipped: string[];
  caseId: string | null;
  /** The question the last message asked. */
  asking: string | null;
  updatedAt: string;
}

export interface CaseSnapshot {
  id: string;
  stage: WorkflowStage;
  safety: { action: SafetyOutcome["action"]; support?: SafetyOutcome["support"] | null };
}

export interface ChatIntakeDeps {
  store: {
    get(userId: string): Promise<ChatIntakeState | null>;
    save(userId: string, state: ChatIntakeState): Promise<void>;
    clear(userId: string): Promise<void>;
  };
  cases: {
    start(userId: string, domain: WorkflowDomain, input: { safetyAnswers: Record<string, unknown>; answers: Record<string, unknown> }): Promise<CaseSnapshot>;
    answer(userId: string, caseId: string, answers: Record<string, unknown>): Promise<CaseSnapshot>;
    submit(userId: string, caseId: string): Promise<CaseSnapshot>;
  };
  config?: (domain: WorkflowDomain) => DomainConfig;
  now?: () => Date;
}

export interface IntakeReply {
  text: string;
  /** App path for a "continue in the app" button. */
  path?: string;
}

export const INTAKE_EXPIRY_MS = 48 * 60 * 60 * 1000;
const MAX_TEXT = 2000;
const START_WORDS = new Set(["new", "/new", "case", "new case", "ጀምር", "ጉዳይ", "አዲስ"]);
const CANCEL_WORDS = new Set(["cancel", "/cancel", "ሰርዝ"]);

const word = (text: string) => text.trim().toLowerCase().replace(/[.!?።]+$/u, "");
export const isIntakeStart = (text: string) => START_WORDS.has(word(text));
export const isIntakeCancel = (text: string) => CANCEL_WORDS.has(word(text));

const isEmpty = (value: unknown) => value === undefined || value === null || (typeof value === "string" && !value.trim());

function questionText(question: WorkflowQuestion, language: string | null | undefined) {
  return language === "am" && question.textAmharic ? question.textAmharic : question.text;
}

function optionLabel(option: NonNullable<WorkflowQuestion["options"]>[number], language: string | null | undefined) {
  return language === "am" && option.labelAmharic ? option.labelAmharic : option.label;
}

/** The message that asks one question. */
export function renderQuestion(question: WorkflowQuestion, tr: Translate, language?: string | null): string {
  const lines = [questionText(question, language)];
  if (question.options?.length) {
    question.options.forEach((option, index) => lines.push(`${index + 1}. ${optionLabel(option, language)}`));
    lines.push(tr("Reply with the number of your answer."));
  } else if (question.type === "number" || question.type === "scale" || question.type === "slider") {
    lines.push(tr("Reply with a number."));
  } else if (question.type === "date") {
    lines.push(tr("Reply with a date like 2026-01-31."));
  } else if (question.hint) {
    lines.push(question.hint);
  }
  if (!question.required) lines.push(tr("Send 0 to skip this question."));
  return lines.join("\n");
}

/** Reads a reply as the answer to a question, or explains what is expected. */
export function parseAnswer(question: WorkflowQuestion, text: string, tr: Translate): { value: unknown } | { skip: true } | { error: string } {
  const reply = text.trim();
  if (!question.required && reply === "0") return { skip: true };
  if (question.options?.length) {
    const index = Number(reply);
    if (Number.isInteger(index) && index >= 1 && index <= question.options.length) return { value: question.options[index - 1].value };
    const lower = reply.toLowerCase();
    const match = question.options.find((option) => [option.value, option.label, option.labelAmharic].some((candidate) => candidate && candidate.toLowerCase() === lower));
    if (match) return { value: match.value };
    return { error: tr("Please reply with a number from 1 to {}.", question.options.length) };
  }
  if (question.type === "number" || question.type === "scale" || question.type === "slider") {
    const value = Number(reply.replace(",", "."));
    return Number.isFinite(value) && reply !== "" ? { value } : { error: tr("Please reply with a number.") };
  }
  if (question.type === "date") {
    return /^\d{4}-\d{2}-\d{2}$/.test(reply) && !Number.isNaN(Date.parse(reply)) ? { value: reply } : { error: tr("Please reply with a date like 2026-01-31.") };
  }
  if (!reply) return { error: tr("Please type your answer.") };
  return { value: reply.slice(0, MAX_TEXT) };
}

function domainMenu(tr: Translate) {
  const lines = [tr("What would you like help with? Reply with a number.")];
  WORKFLOW_DOMAINS.forEach((domain, index) => lines.push(`${index + 1}. ${tr(DOMAIN_CONFIGS[domain].label)}`));
  lines.push(tr("Send CANCEL at any time to stop."));
  return lines.join("\n");
}

/** Questions needed before the case can be created: start questions, and a note for the health pathway. */
function startQuestions(config: DomainConfig, state: ChatIntakeState): WorkflowQuestion[] {
  const questions = [...(config.startQuestions ?? [])];
  if (config.domain === "biological" && state.safetyAnswers.urgentSymptoms !== "yes") {
    const note = config.questions({}).find((question) => question.id === "caseNarrative");
    if (note) questions.push({ ...note, required: true });
  }
  return questions;
}

function nextQuestion(config: DomainConfig, state: ChatIntakeState): WorkflowQuestion | null {
  const open = (question: WorkflowQuestion, answers: Record<string, unknown>) =>
    isApplicable(question, answers) && isEmpty(answers[question.id]) && !state.skipped.includes(question.id);
  if (state.phase === "safety") return config.safetyQuestions.find((question) => open(question, state.safetyAnswers)) ?? null;
  if (state.phase === "start") return startQuestions(config, state).find((question) => open(question, state.answers)) ?? null;
  if (state.phase === "intake") return config.questions(state.answers).find((question) => open(question, state.answers)) ?? null;
  return null;
}

function supportMessage(snapshot: CaseSnapshot, tr: Translate) {
  const support = snapshot.safety.support;
  const lines = [support?.title ?? tr("Your safety comes first"), support?.message ?? tr("If you are in immediate danger, contact local emergency services or go to the nearest health facility now.")];
  for (const step of support?.steps ?? []) lines.push(`• ${step}`);
  for (const line of support?.hotlines ?? []) lines.push(`☎ ${line.name}: ${line.number}`);
  return lines.join("\n");
}

export function createChatIntake(deps: ChatIntakeDeps) {
  const configFor = deps.config ?? ((domain: WorkflowDomain) => getDomainConfig(domain));
  const now = () => deps.now?.() ?? new Date();

  async function load(userId: string) {
    const state = await deps.store.get(userId);
    if (state && now().getTime() - Date.parse(state.updatedAt) > INTAKE_EXPIRY_MS) {
      await deps.store.clear(userId);
      return null;
    }
    return state;
  }

  async function save(userId: string, state: ChatIntakeState) {
    await deps.store.save(userId, { ...state, updatedAt: now().toISOString() });
  }

  /** Asks the next question, moving through the phases and creating or submitting the case. */
  async function advance(userId: string, state: ChatIntakeState, tr: Translate, language: string | null | undefined, prefix: string[] = []): Promise<IntakeReply> {
    const config = configFor(state.domain!);
    for (;;) {
      const question = nextQuestion(config, state);
      if (question) {
        await save(userId, { ...state, asking: question.id });
        return { text: [...prefix, renderQuestion(question, tr, language)].join("\n\n") };
      }
      if (state.phase === "safety") {
        state = { ...state, phase: "start" };
        continue;
      }
      if (state.phase === "start") {
        const snapshot = await deps.cases.start(userId, config.domain, { safetyAnswers: state.safetyAnswers, answers: state.answers });
        if (snapshot.stage === "crisis_routed") {
          await deps.store.clear(userId);
          return { text: supportMessage(snapshot, tr), path: `/case/workflows/${snapshot.id}` };
        }
        if (snapshot.safety.action !== "proceed" && snapshot.safety.support) prefix = [...prefix, supportMessage(snapshot, tr)];
        state = { ...state, phase: "intake", caseId: snapshot.id };
        continue;
      }
      // Every question is answered: ask before sending it to a reviewer.
      await save(userId, { ...state, phase: "confirm", asking: null });
      return {
        text: [...prefix, tr("Thank you, that is everything. Reply 1 to send your {} request to a reviewer, or CANCEL to keep it as a draft in the app.", tr(config.label))].join("\n\n"),
        path: state.caseId ? `/case/workflows/${state.caseId}` : undefined,
      };
    }
  }

  return {
    /**
     * Handles a message when it starts, cancels or continues a chat intake. Returns null when the
     * message has nothing to do with one (it is then a reply to a reviewer or a check-in answer).
     */
    async handle(userId: string, text: string, tr: Translate, language?: string | null): Promise<IntakeReply | null> {
      if (isIntakeStart(text)) {
        await save(userId, { phase: "domain", domain: null, safetyAnswers: {}, answers: {}, skipped: [], caseId: null, asking: null, updatedAt: now().toISOString() });
        return { text: domainMenu(tr) };
      }
      const state = await load(userId);
      if (!state) return null;

      if (isIntakeCancel(text)) {
        await deps.store.clear(userId);
        return state.caseId
          ? { text: tr("Stopped. Your answers so far are saved as a draft; you can finish them in the app."), path: `/case/workflows/${state.caseId}` }
          : { text: tr("Stopped. Send NEW whenever you want to start a request.") };
      }

      if (state.phase === "domain") {
        const choice = Number(text.trim());
        const domain = Number.isInteger(choice) ? WORKFLOW_DOMAINS[choice - 1] : undefined;
        if (!domain) return { text: [tr("Please reply with a number from 1 to {}.", WORKFLOW_DOMAINS.length), domainMenu(tr)].join("\n\n") };
        return advance(userId, { ...state, domain, phase: "safety" }, tr, language, [tr("{}: a few safety questions first.", tr(DOMAIN_CONFIGS[domain].label))]);
      }

      if (state.phase === "confirm") {
        if (text.trim() !== "1") return { text: tr("Reply 1 to send your request to a reviewer, or CANCEL to keep it as a draft.") };
        const snapshot = await deps.cases.submit(userId, state.caseId!);
        await deps.store.clear(userId);
        return {
          text: tr("Your request was sent to a reviewer. You will get updates here, and you can reply in this chat to answer them."),
          path: `/case/workflows/${snapshot.id}`,
        };
      }

      const config = configFor(state.domain!);
      const asked = [...config.safetyQuestions, ...startQuestions(config, state), ...config.questions(state.answers)].find((question) => question.id === state.asking);
      if (!asked) return advance(userId, state, tr, language);
      const parsed = parseAnswer(asked, text, tr);
      if ("error" in parsed) return { text: [parsed.error, renderQuestion(asked, tr, language)].join("\n\n") };
      if ("skip" in parsed) return advance(userId, { ...state, skipped: [...state.skipped, asked.id] }, tr, language);

      if (state.phase === "safety") return advance(userId, { ...state, safetyAnswers: { ...state.safetyAnswers, [asked.id]: parsed.value } }, tr, language);
      if (state.phase === "start") return advance(userId, { ...state, answers: { ...state.answers, [asked.id]: parsed.value } }, tr, language);

      const snapshot = await deps.cases.answer(userId, state.caseId!, { [asked.id]: parsed.value });
      if (snapshot.stage === "crisis_routed") {
        await deps.store.clear(userId);
        return { text: supportMessage(snapshot, tr), path: `/case/workflows/${snapshot.id}` };
      }
      return advance(userId, { ...state, answers: { ...state.answers, [asked.id]: parsed.value } }, tr, language);
    },
  };
}

export type ChatIntake = ReturnType<typeof createChatIntake>;

/** In-memory progress store for tests. */
export function createMemoryIntakeStore() {
  const states = new Map<string, ChatIntakeState>();
  return {
    states,
    async get(userId: string) {
      return states.get(userId) ?? null;
    },
    async save(userId: string, state: ChatIntakeState) {
      states.set(userId, structuredClone(state));
    },
    async clear(userId: string) {
      states.delete(userId);
    },
  };
}
