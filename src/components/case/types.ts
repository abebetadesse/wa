/**
 * Shared types for the case intake wizard and its sub-components.
 */

export type Phase =
  | "domain"
  | "challenge"
  | "specific"
  | "report"
  | "causes"
  | "solutions"
  | "complete";

export type Answers = Record<string, string | number | Record<string, unknown>>;

export type VoiceRecognition = {
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};
