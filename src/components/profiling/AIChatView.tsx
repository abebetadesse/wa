"use client";

import { useEffect, useState } from "react";
import { AIChatMessage, AIChatSessionData, PLATFORM_DISCLAIMERS } from "@/lib/profiling/extendedTypes";

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
        const response = await fetch("/api/chat/start", {
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
      const response = await fetch(`/api/chat/${encodeURIComponent(session.sessionId)}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText.trim(),
          systemPrompt: `You are a concise, safety-aware Ethiopian wellness and cultural advisor. Answer the user's question first. Use the supplied profile only as context, keep reflective cultural material separate from Welbeing guidance, and do not diagnose or prescribe. Profile: ${JSON.stringify(profileContext)}`,
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
      const response = await fetch("/api/chat/reading", {
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
    return <div className="p-4 text-sm text-slate-400">Loading your profile context...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Top Context Grounding Badge */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <div>
              <span className="font-bold text-slate-100 block">Context-Aware AI Astrologer & Cultural Advisor</span>
              <span className="text-slate-400">
                Grounded in {ctx.fullName}'s exact calculations (not generic sun-sign forecasts)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-medium">
              {ctx.sunSign} Sun • {ctx.moonSign} Moon
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-medium">
              Life Path {ctx.danMillmanLifePath}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 font-medium">
              Awude Circle #{ctx.awudeCircleNumber}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-300 font-medium">
              Personal Day {ctx.personalDay}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Dialogue Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col h-[560px]">
        {/* Chat Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {isStarting && <div className="text-center text-xs text-slate-400">Preparing your profile-aware assistant...</div>}

          {messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-lg ${msg.role === "user"
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-br-none"
                    : "bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none"
                  }`}
              >
                {msg.role === "assistant" && msg.contextBadges && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {msg.contextBadges.map((badge, bIdx) => (
                      <span key={bIdx} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 border border-slate-700 text-slate-400">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
                <div className="whitespace-pre-line font-normal">{msg.content}</div>
                <div className={`text-[10px] ${msg.role === "user" ? "text-emerald-200" : "text-slate-500"} text-right`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-bl-none p-3.5 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Consulting your natal geometry and AwudeNegest circles...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Query Chips */}
        <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Quick Queries:</span>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask anything about your natal chart, life purpose, AwudeNegest, or transits..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/60 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 transition-all"
          >
            Send
          </button>
        </div>
      </div>

      {/* Generate Personalized In-Depth Reading (Co-Star Hybrid Style) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-slate-100">Generate In-Depth Reading (Co-Star Hybrid Style)</h4>
            <p className="text-xs text-slate-400">Synthesizes NASA coordinates, Dan Millman paths, and Ethiopian heritage</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerateReading("annual")}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
            >
              Annual Overview
            </button>
            <button
              onClick={() => handleGenerateReading("somatic")}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
            >
              Somatic Vitality
            </button>
            <button
              onClick={() => handleGenerateReading("spiritual")}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
            >
              Spiritual Lineage
            </button>
          </div>
        </div>

        {personalizedReading && (
          <div className="p-5 bg-slate-950/80 rounded-xl border border-emerald-500/30 space-y-3 text-xs leading-relaxed animate-in fade-in">
            <div className="border-b border-slate-800 pb-2">
              <h5 className="text-sm font-bold text-emerald-400">{personalizedReading.title}</h5>
              <p className="text-[11px] text-slate-400">{personalizedReading.subtitle}</p>
            </div>
            <p className="text-slate-200 whitespace-pre-line">{personalizedReading.content}</p>
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <span className="font-bold text-amber-300 block">Core Synthesis Takeaways:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                {personalizedReading.keyInsights.map((insight: string, idx: number) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Disclaimer Footer */}
      <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-500 leading-relaxed">
        <strong>Compliance Notice:</strong> {PLATFORM_DISCLAIMERS.aiChat} {PLATFORM_DISCLAIMERS.Welbeing}
      </div>
    </div>
  );
}
