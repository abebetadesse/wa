/**
 * Bionic GPT Client (Enterprise Edition)
 * ─────────────────────────────────────────────────────────────────────────────
 * Advanced OpenAI-compatible client for Bionic GPT.
 * 
 * Features: Automatic retries, exponential backoff, JSON parsing, Tool Calling,
 * Telemetry lifecycle hooks, AbortSignal support, and parsed SSE streaming.
 */

export interface BionicMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }>;
  name?: string;
  tool_calls?: Array<BionicToolCall>;
  tool_call_id?: string;
}

export interface BionicTool {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters: Record<string, any>; // JSON Schema object
  };
}

export interface BionicToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface BionicChatOptions {
  messages: BionicMessage[];
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;

  /** Force model to output valid JSON. If true, response.parsedJson will be available. */
  jsonMode?: boolean;

  /** Array of tools/functions the model can call */
  tools?: BionicTool[];
  /** "auto", "none", or a specific tool object to force */
  toolChoice?: "auto" | "none" | { type: "function"; function: { name: string } };

  /** Number of times to retry on 429/5xx errors (default: 0) */
  retries?: number;
  /** Signal to abort the request dynamically */
  signal?: AbortSignal;

  /** Dynamic overrides */
  modelOverride?: string;
  baseUrlOverride?: string;
  apiKeyOverride?: string;
  headers?: Record<string, string>;

  /** Lifecycle hooks for APM/Telemetry (Datadog, Sentry, etc.) */
  onStart?: (req: { model: string; messages: BionicMessage[] }) => void;
  onSuccess?: (res: { latencyMs: number; usage: any; model: string }) => void;
  onError?: (err: Error, attempt: number) => void;
}

export interface BionicChatResponse<T = any> {
  content: string;
  /** Automatically parsed object if jsonMode was true */
  parsedJson?: T;
  model: string;
  toolCalls?: BionicToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: "stop" | "length" | "tool_calls" | "content_filter" | string;
}

export interface BionicConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  fallbackEnabled: boolean;
}

const BIONIC_REQUEST_TIMEOUT_MS = 60_000;

// ─── Utilities ───────────────────────────────────────────────────────────────

function extractMessageContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part) {
        return typeof part.text === "string" ? part.text : "";
      }
      return "";
    })
    .join("");
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseJsonBody<T>(response: Response, fallbackText?: string): T {
  const contentType = response.headers.get("content-type") || "";
  const rawText = fallbackText ?? "";

  if (rawText.trim().startsWith("<!DOCTYPE") || rawText.trim().startsWith("<html")) {
    throw new BionicGPTError(
      `API returned HTML instead of JSON. Check BIONIC_GPT_BASE_URL and API configuration. Response content-type: ${contentType || "unknown"}`,
      "API_ERROR",
      response.status
    );
  }

  try {
    return JSON.parse(rawText || "{}") as T;
  } catch {
    const snippet = rawText.slice(0, 200).replace(/\s+/g, " ");
    throw new BionicGPTError(
      `API returned invalid JSON. Expected OpenAI-compatible payload but got: ${snippet || "empty response"}`,
      "API_ERROR",
      response.status
    );
  }
}

export function getConfig(options?: Partial<BionicChatOptions>): BionicConfig {
  const apiKey = options?.apiKeyOverride || process.env.BIONIC_GPT_API_KEY || "";
  const baseUrl = (options?.baseUrlOverride || process.env.BIONIC_GPT_BASE_URL || "https://app.bionic-gpt.com").replace(/\/$/, "");
  const model = options?.modelOverride || process.env.BIONIC_GPT_MODEL || "llama3";
  const fallbackEnabled = process.env.BIONIC_GPT_FALLBACK_ENABLED !== "false";

  return { apiKey, baseUrl, model, fallbackEnabled };
}

export function isBionicConfigured(): boolean {
  return !!getConfig().apiKey;
}

export function buildBionicMessages(
  systemPrompt: string,
  history: Array<{ role: "system" | "user" | "assistant" | "tool"; content: string | Array<{ text?: string; type?: string }> }> = [],
): BionicMessage[] {
  const messages: BionicMessage[] = [];

  if (systemPrompt && systemPrompt.trim()) {
    messages.push({ role: "system", content: systemPrompt.trim() });
  }

  for (const entry of history) {
    const normalizedRole = entry.role === "tool" ? "tool" : entry.role;
    const normalizedContent = typeof entry.content === "string"
      ? entry.content
      : Array.isArray(entry.content)
        ? entry.content.map((part) => typeof part?.text === "string" ? part.text : "").join("")
        : "";

    if (!normalizedContent.trim()) continue;
    messages.push({
      role: normalizedRole,
      content: normalizedContent,
    });
  }

  return messages;
}

export function getBionicConfigStatus() {
  const config = getConfig();
  const missingVars: string[] = [];

  if (!config.apiKey) missingVars.push("BIONIC_GPT_API_KEY");
  if (!config.baseUrl) missingVars.push("BIONIC_GPT_BASE_URL");
  if (!config.model) missingVars.push("BIONIC_GPT_MODEL");

  return {
    configured: config.apiKey.length > 0,
    baseUrl: config.baseUrl,
    model: config.model,
    fallbackEnabled: config.fallbackEnabled,
    missingVars,
  };
}

export async function testBionicConnection() {
  const config = getConfig();

  if (!config.apiKey) {
    return {
      ok: false,
      configured: false,
      error: "BIONIC_GPT_API_KEY is missing.",
      baseUrl: config.baseUrl,
      model: config.model,
    };
  }

  try {
    const response = await fetch(`${config.baseUrl}/v1/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return {
        ok: false,
        configured: true,
        error: `Request failed (${response.status}): ${text}`,
        baseUrl: config.baseUrl,
        model: config.model,
      };
    }

    const payloadText = await response.text();
    const payload = parseJsonBody<any>(response, payloadText);
    const firstModel = payload?.data?.[0]?.id || config.model;

    return {
      ok: true,
      configured: true,
      baseUrl: config.baseUrl,
      model: firstModel,
    };
  } catch (error: any) {
    return {
      ok: false,
      configured: true,
      error: error?.message || "Connection failed.",
      baseUrl: config.baseUrl,
      model: config.model,
    };
  }
}

// ─── Core Chat Completion ────────────────────────────────────────────────────

/**
 * Send a chat completion request to Bionic GPT.
 * Supports tool calling, auto-JSON parsing, retries, and telemetry hooks.
 */
export async function bionicChat<T = any>(options: BionicChatOptions): Promise<BionicChatResponse<T>> {
  const config = getConfig(options);
  if (!isBionicConfigured()) throw new BionicGPTError("BIONIC_GPT_API_KEY missing.", "NOT_CONFIGURED");

  const endpoint = `${config.baseUrl}/v1/chat/completions`;
  const maxRetries = Math.max(0, options.retries ?? 0);

  // Construct OpenAI-compatible body
  const body: Record<string, any> = {
    model: config.model,
    messages: options.messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1024,
    top_p: options.topP ?? 1.0,
    frequency_penalty: options.frequencyPenalty ?? 0,
    presence_penalty: options.presencePenalty ?? 0,
    stream: false,
  };

  if (options.jsonMode) body.response_format = { type: "json_object" };
  if (options.tools?.length) body.tools = options.tools;
  if (options.toolChoice) body.tool_choice = options.toolChoice;

  const startMs = Date.now();
  if (options.onStart) options.onStart({ model: config.model, messages: options.messages });

  let attempt = 0;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BIONIC_REQUEST_TIMEOUT_MS);
    const abortHandler = () => controller.abort();
    if (options.signal) options.signal.addEventListener("abort", abortHandler, { once: true });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
          ...options.headers, // Inject custom headers (e.g., tracing IDs)
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await sleep(delay);
          attempt++;
          continue;
        }
        const errorText = await response.text().catch(() => "");
        throw new BionicGPTError(`API Error (${response.status}): ${errorText}`, "API_ERROR", response.status);
      }

      const rawText = await response.text();
      const data = parseJsonBody<any>(response, rawText);
      const choice = data.choices?.[0];
      if (!choice) throw new BionicGPTError("Empty response payload.", "EMPTY_RESPONSE");

      const usage = data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined;

      const content = extractMessageContent(choice.message?.content);

      // Auto-parse JSON if requested
      let parsedJson: T | undefined = undefined;
      if (options.jsonMode && content) {
        try {
          parsedJson = JSON.parse(content) as T;
        } catch (e) {
          console.warn("bionicChat: Failed to parse JSON response:", e);
        }
      }

      // Fire Success Hook
      if (options.onSuccess) {
        options.onSuccess({ latencyMs: Date.now() - startMs, usage, model: data.model || config.model });
      }

      return {
        content,
        parsedJson,
        model: data.model || config.model,
        toolCalls: choice.message?.tool_calls,
        usage,
        finishReason: choice.finish_reason,
      };

    } catch (error: any) {
      if (options.onError) options.onError(error, attempt);

      if (error.name === "AbortError" && options.signal?.aborted) {
        throw new BionicGPTError("Request aborted by user.", "USER_ABORTED");
      }

      if (attempt < maxRetries && error.name !== "AbortError") {
        await sleep(Math.pow(2, attempt) * 1000);
        attempt++;
        continue;
      }

      throw new BionicGPTError(
        `Network error: ${error.name === "AbortError" ? 'Timeout' : error.message}`,
        error.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR"
      );
    } finally {
      clearTimeout(timeoutId);
      if (options.signal) options.signal.removeEventListener("abort", abortHandler);
    }
  }

  throw new BionicGPTError("Max retries exceeded", "NETWORK_ERROR");
}

// ─── Parsed Streaming Chat ───────────────────────────────────────────────────

/**
 * Streams a chat response from Bionic GPT and parses the SSE events.
 * Yields raw text chunks. 
 */
export async function bionicChatStream(options: BionicChatOptions): Promise<ReadableStream<Uint8Array>> {
  const config = getConfig(options);
  if (!isBionicConfigured()) throw new BionicGPTError("BIONIC_GPT_API_KEY missing.", "NOT_CONFIGURED");

  const endpoint = `${config.baseUrl}/v1/chat/completions`;
  const controller = new AbortController();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      ...options.headers,
    },
    body: JSON.stringify({
      model: config.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      top_p: options.topP ?? 1.0,
      stream: true,
    }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new BionicGPTError(`Stream error ${response.status}: ${errorText}`, "API_ERROR", response.status);
  }

  if (!response.body) throw new BionicGPTError("No response body for stream.", "EMPTY_RESPONSE");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          const text = chunk
            .split("\n")
            .filter((line) => line.startsWith("data: "))
            .map((line) => line.replace(/^data:\s*/, ""))
            .filter((line) => line && line !== "[DONE]")
            .join("");

          if (text) {
            try {
              const parsed = JSON.parse(text);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            } catch {
              controller.enqueue(new TextEncoder().encode(chunk));
            }
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

export async function* bionicChatStreamParsed(options: BionicChatOptions): AsyncGenerator<string, void, unknown> {
  const config = getConfig(options);
  if (!isBionicConfigured()) throw new BionicGPTError("BIONIC_GPT_API_KEY missing.", "NOT_CONFIGURED");

  const endpoint = `${config.baseUrl}/v1/chat/completions`;
  const controller = new AbortController();
  const abortHandler = () => controller.abort();
  if (options.signal) options.signal.addEventListener("abort", abortHandler, { once: true });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      ...options.headers,
    },
    body: JSON.stringify({
      model: config.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      stream: true,
    }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new BionicGPTError(`Stream error ${response.status}: ${errorText}`, "API_ERROR", response.status);
  }

  if (!response.body) throw new BionicGPTError("No response body for stream.", "EMPTY_RESPONSE");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // keep partial line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const dataStr = trimmed.slice(6);
        if (dataStr === "[DONE]") return;

        try {
          const parsed = JSON.parse(dataStr);
          const chunk = parsed.choices?.[0]?.delta?.content;
          if (chunk) yield chunk;
        } catch (e) {
          // Ignore parse errors on partial SSE chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
    if (options.signal) options.signal.removeEventListener("abort", abortHandler);
  }
}

// ─── Case analysis + reporting enrichment ─────────────────────────────────────

export interface CaseReportAiAnalysis {
  situationSummary: string;
  strengths: string[];
  challenges: string[];
  strategicRecommendations: {
    title: string;
    description: string;
    priority: "immediate" | "short_term" | "long_term";
    timingNote?: string;
  }[];
  networkingSuggestions: string[];
  sectorInsights: string;
}

function fallbackCaseAiAnalysis(caseType: "career" | "spiritual", input: Record<string, any>): CaseReportAiAnalysis {
  const base: CaseReportAiAnalysis = {
    situationSummary: `The ${caseType} case has entered an analysis and reporting workflow with a structured evidence trail and a review gate.`,
    strengths: ["Values-based orientation", "Culturally grounded assessment", "Safety-aware reporting"],
    challenges: ["Needs a stronger expert narrative", "Requires more context from the case record"],
    strategicRecommendations: [
      {
        title: "Clarify the current decision focus",
        description: "Define the next practical action in one concrete sentence before designing the work plan.",
        priority: "immediate",
        timingNote: "Today",
      },
    ],
    networkingSuggestions: ["Consult a trusted community mentor or advisor for the next decision step."],
    sectorInsights: "The workflow prioritizes safety, cultural alignment, and practical next-action clarity.",
  };

  if (caseType === "career" && input?.profile) {
    base.situationSummary = `Career analysis for ${input.profile.name || "the submitted profile"} is ready for expert review and narrative synthesis.`;
    base.strengths = [
      "Professional profile has been normalized",
      "Timing and advisor assignment are available",
      "Cultural numerology context is included",
    ];
    base.challenges = ["Needs expert review before final release"];
    base.sectorInsights = `${input.profile.sector || "career"} sector context is being interpreted with cultural timing and advisor matching.`;
  }

  if (caseType === "spiritual" && input?.answers) {
    base.situationSummary = "Spiritual case insights were prepared with a divination, expert assignment, and report narrative structure.";
    base.strengths = [
      "Healing scroll and symbolic guidance are prepared",
      "Expert pathway has been selected",
      "Cultural and spiritual context is preserved",
    ];
    base.challenges = ["Expert review must approve the final release"];
  }

  return base;
}

export async function synthesizeCaseReportAnalysis(
  caseType: "career" | "spiritual",
  input: Record<string, any>
): Promise<CaseReportAiAnalysis> {
  const fallback = fallbackCaseAiAnalysis(caseType, input);
  if (!isBionicConfigured()) return fallback;

  try {
    const systemPrompt = `You are a cautious report synthesis assistant for an Ethiopian wellness, case-analysis, and Debral-reporting platform. Return valid JSON only with fields: situationSummary, strengths, challenges, strategicRecommendations, networkingSuggestions, sectorInsights. Keep every recommendation ethical, non-diagnostic, culturally grounded, and concise.`;
    const messages = buildBionicMessages(systemPrompt, [
      {
        role: "user",
        content: JSON.stringify({ caseType, input }, null, 2),
      },
    ]);

    const response = await bionicChat({
      messages,
      temperature: 0.35,
      maxTokens: 700,
      jsonMode: true,
    });

    const parsed = response.parsedJson as any;
    if (parsed && typeof parsed === "object") {
      const normalized: CaseReportAiAnalysis = {
        situationSummary: typeof parsed.situationSummary === "string" ? parsed.situationSummary : fallback.situationSummary,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter((x: unknown) => typeof x === "string") : fallback.strengths,
        challenges: Array.isArray(parsed.challenges) ? parsed.challenges.filter((x: unknown) => typeof x === "string") : fallback.challenges,
        strategicRecommendations: Array.isArray(parsed.strategicRecommendations)
          ? parsed.strategicRecommendations.map((item: any) => ({
            title: typeof item?.title === "string" ? item.title : "Recommended next action",
            description: typeof item?.description === "string" ? item.description : "Proceed with care and context-aware review.",
            priority: item?.priority === "short_term" ? "short_term" : item?.priority === "long_term" ? "long_term" : "immediate",
            timingNote: typeof item?.timingNote === "string" ? item.timingNote : undefined,
          }))
          : fallback.strategicRecommendations,
        networkingSuggestions: Array.isArray(parsed.networkingSuggestions)
          ? parsed.networkingSuggestions.filter((x: unknown) => typeof x === "string")
          : fallback.networkingSuggestions,
        sectorInsights: typeof parsed.sectorInsights === "string" ? parsed.sectorInsights : fallback.sectorInsights,
      };

      return normalized;
    }
  } catch (error: any) {
    console.warn(`[BionicGPT] Case report synthesis failed; using fallback analysis. ${error?.message || String(error)}`);
  }

  return fallback;
}

// ─── Error Class ─────────────────────────────────────────────────────────────

export class BionicGPTError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_CONFIGURED" | "NETWORK_ERROR" | "TIMEOUT" | "API_ERROR" | "EMPTY_RESPONSE" | "USER_ABORTED",
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "BionicGPTError";
  }
}