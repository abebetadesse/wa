"use client";

import { useEffect, useState } from "react";
import { AIChatMessage, AIChatSessionData, PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";
import { withBasePath } from '@/lib/base-path';

interface AIChatViewProps {
  userId?: string;
  userContext?: {
    fullName: string;
    birthDate: string;
    birthTime: string;
    city: string;
    sunSign: string;
    moonSign: string;
    risingSign: string;
    danMillmanLifePath: string;
    pythagoreanLifePath: number;
    destinyNumber: number;
    awudeCircleNumber: number;
    personalDay: number;
    personalYear: number;
  };
}

const SUGGESTED_QUESTIONS = [
  "Explain my Dan Millman Life Path gifts and challenges",
  "How do today's transits and Personal Day affect my energy?",
  "What does AwudeNegest predict for my career and business?",
  "What are my relationship dynamics and communication style?",
  "What traditional Ethiopian herbs support my constitutional vitality?",
];

export default function AIChatView({ userId = "user_default", userContext }: AIChatViewProps) {
  const [session, setSession] = useState<AIChatSessionData | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personalizedReading, setPersonalizedReading] = useState<any | null>(null);

  const ctx = session?.userContext || userContext;

  useEffect(() => {
    let cancelled = false;

    async function startSession() {
      setIsStarting(true);
      setError(null);

      try {
        const response = await fetch(withBasePath("/api/chat/start"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, userProfile: userContext }),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to start the AI chat session.");
        }

        if (!cancelled) {
          setSession({
            sessionId: data.sessionId,
            userId,
            userContext: data.userContext,
            messages: data.initialMessages,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to start the AI chat session.");
      } finally {
        if (!cancelled) setIsStarting(false);
      }
    }

    void startSession();
    return () => {
      cancelled = true;
    };
  }, [userId, userContext]);

  const messages = session?.messages || [];

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputValue;
    const profileContext = ctx;
    if (!messageText.trim() || isLoading || isStarting || !session || !profileContext) return;

    setInputValue("");
    setIsLoading(true);
    setError(null);

    const userMessage: AIChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    };
    setSession((current) => (current ? { ...current, messages: [...current.messages, userMessage] } : current));

    try {
      const response = await fetch(withBasePath(`/api/chat/${encodeURIComponent(session.sessionId)}/message`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText.trim(),
          systemPrompt: `You are a concise, safety-aware Ethiopian wellness and cultural advisor. Answer the user's question first. Use the supplied profile only as context, keep reflective cultural material separate from wellbeing guidance, and do not diagnose or prescribe. Profile: ${JSON.stringify(profileContext)}`,
          history: [
            ...session.messages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
            { role: "user", content: messageText.trim() },
          ].slice(-12),
        }),
      });

      if (response.headers.get("content-type")?.includes("text/event-stream") && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const assistantId = `msg_ast_${Date.now()}`;
        let responseText = "";

        const addOrUpdateAssistant = (content: string) => {
          setSession((current) => {
            if (!current) return current;
            const existing = current.messages.findIndex((message) => message.id === assistantId);
            const assistantMessage: AIChatMessage = {
              id: assistantId,
              role: "assistant",
              content,
              timestamp: new Date().toISOString(),
              contextBadges: ["Powered by Bionic GPT", `Grounded in ${profileContext.sunSign} Sun`, `Life Path ${profileContext.danMillmanLifePath}`],
            };
            if (existing === -1) {
              return { ...current, messages: [...current.messages, assistantMessage] };
            }
            const messages = [...current.messages];
            messages[existing] = assistantMessage;
            return { ...current, messages, updatedAt: new Date().toISOString() };
          });
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          responseText += decoder.decode(value, { stream: true });
          addOrUpdateAssistant(responseText);
        }
        responseText += decoder.decode();
        addOrUpdateAssistant(responseText);
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "The AI assistant could not answer.");
      }

      setSession((current) =>
        current
          ? {
            ...current,
            userContext: data.userContext || current.userContext,
            messages: [...current.messages, data.message],
            updatedAt: new Date().toISOString(),
          }
          : current
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "The AI assistant could not answer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReading = async (type: "annual" | "spiritual" | "somatic") => {
    if (!session || !ctx) return;

    setError(null);
    try {
      const response = await fetch(withBasePath("/api/chat/reading"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type, userProfile: ctx }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Unable to generate the reading.");
      setPersonalizedReading(data.reading);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate the reading.");
    }
  };

  if (!ctx) {
    return <div className="p-4 text-sm text-muted-foreground">Loading your profile context...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft p-3 text-xs text-danger-strong">
          {error}
        </div>
      )}

      {/* Top Context Grounding Badge */}
      <div className="bg-card/90 border border-border rounded-2xl p-4 shadow-panel ">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <div>
              <span className="font-bold text-foreground block">Context-Aware AI Astrologer & Cultural Advisor</span>
              <span className="text-muted-foreground">
                Grounded in {ctx.fullName}'s exact calculations (not generic sun-sign forecasts)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-brand-soft border border-brand/30 text-brand-strong font-medium">
              {ctx.sunSign} Sun • {ctx.moonSign} Moon
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-info-soft border border-info/30 text-info-strong font-medium">
              Life Path {ctx.danMillmanLifePath}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-gold-soft border border-gold/30 text-gold-strong font-medium">
              Awude Circle #{ctx.awudeCircleNumber}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-info-soft border border-info/30 text-info-strong font-medium">
              Personal Day {ctx.personalDay}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Dialogue Container */}
      <div className="bg-card/90 border border-border rounded-2xl shadow-raised  overflow-hidden flex flex-col h-[560px]">
        {/* Chat Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {isStarting && <div className="text-center text-xs text-muted-foreground">Preparing your profile-aware assistant...</div>}

          {messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-panel ${msg.role === "user"
                    ? "bg-gradient-to-r from-brand to-brand text-brand-foreground rounded-br-none"
                    : "bg-background/80 border border-border text-soft rounded-bl-none"
                  }`}
              >
                {msg.role === "assistant" && msg.contextBadges && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {msg.contextBadges.map((badge, bIdx) => (
                      <span key={bIdx} className="px-1.5 py-0.5 rounded text-[9px] bg-card border border-border text-muted-foreground">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
                <div className="whitespace-pre-line font-normal">{msg.content}</div>
                <div className={`text-[10px] ${msg.role === "user" ? "text-brand-strong" : "text-subtle"} text-right`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-background/80 border border-border rounded-2xl rounded-bl-none p-3.5 text-xs text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                <span>Consulting your natal geometry and AwudeNegest circles...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Query Chips */}
        <div className="p-3 bg-background/40 border-t border-border overflow-x-auto">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-muted-foreground shrink-0">Quick Queries:</span>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted border border-border text-soft text-[11px] whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-background/80 border-t border-border flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask anything about your natal chart, life purpose, AwudeNegest, or transits..."
            className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-soft focus:outline-none focus:border-brand"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-brand to-brand text-brand-foreground text-xs font-bold rounded-xl shadow-panel hover:from-brand hover:to-brand disabled:opacity-50 transition-all"
          >
            Send
          </button>
        </div>
      </div>

      {/* Generate Personalized In-Depth Reading (Co-Star Hybrid Style) */}
      <div className="bg-card/90 border border-border rounded-2xl p-6 shadow-panel  space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-foreground">Generate In-Depth Reading (Co-Star Hybrid Style)</h4>
            <p className="text-xs text-muted-foreground">Synthesizes NASA coordinates, Dan Millman paths, and Ethiopian heritage</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerateReading("annual")}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-muted text-soft border border-border hover:bg-sunken"
            >
              Annual Overview
            </button>
            <button
              onClick={() => handleGenerateReading("somatic")}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-muted text-soft border border-border hover:bg-sunken"
            >
              Somatic Vitality
            </button>
            <button
              onClick={() => handleGenerateReading("spiritual")}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-muted text-soft border border-border hover:bg-sunken"
            >
              Spiritual Lineage
            </button>
          </div>
        </div>

        {personalizedReading && (
          <div className="p-5 bg-background/80 rounded-xl border border-brand/30 space-y-3 text-xs leading-relaxed animate-in fade-in">
            <div className="border-b border-border pb-2">
              <h5 className="text-sm font-bold text-brand">{personalizedReading.title}</h5>
              <p className="text-[11px] text-muted-foreground">{personalizedReading.subtitle}</p>
            </div>
            <p className="text-soft whitespace-pre-line">{personalizedReading.content}</p>
            <div className="pt-2 border-t border-border space-y-1">
              <span className="font-bold text-gold block">Core Synthesis Takeaways:</span>
              <ul className="list-disc list-inside text-soft space-y-0.5">
                {personalizedReading.keyInsights.map((insight: string, idx: number) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Disclaimer Footer */}
      <div className="p-3.5 bg-background/60 rounded-xl border border-border text-[11px] text-subtle leading-relaxed">
        <strong>Compliance Notice:</strong> {PLATFORM_DISCLAIMERS.aiChat} {PLATFORM_DISCLAIMERS.wellbeing}
      </div>
    </div>
  );
}
