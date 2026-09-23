/**
 * Context-Aware AI Chat & Astrological/Numerological Cultural Advisor Engine
 * Inspired by Co-Star & AstroNumer
 *
 * AI Backend: Bionic GPT (OpenAI-compatible)
 * Account: abebetadesse33@gmail.com
 * Fallback: deterministic rule-based engine when Bionic is unreachable
 */

import { AIChatMessage, AIChatSessionData, PLATFORM_DISCLAIMERS } from "../extendedTypes";
import {
  bionicChat,
  buildBionicMessages,
  isBionicConfigured,
  BionicGPTError,
} from "@/lib/ai/bionicGPT";

// In-memory store for chat sessions
const SESSION_STORE: Map<string, AIChatSessionData> = new Map();

/**
 * Creates or retrieves an active AI Chat session grounded in the user's specific profile
 */
export function getOrCreateChatSession(
  userId: string,
  userProfile?: Partial<AIChatSessionData["userContext"]>
): AIChatSessionData {
  const existingId = `session_${userId}`;
  let session = SESSION_STORE.get(existingId);

  if (!session) {
    const defaultContext: AIChatSessionData["userContext"] = {
      fullName: userProfile?.fullName || "Tigist Mulugeta",
      birthDate: userProfile?.birthDate || "1985-06-15",
      birthTime: userProfile?.birthTime || "14:30",
      city: userProfile?.city || "Addis Ababa",
      sunSign: userProfile?.sunSign || "Gemini",
      moonSign: userProfile?.moonSign || "Cancer",
      risingSign: userProfile?.risingSign || "Libra",
      danMillmanLifePath: userProfile?.danMillmanLifePath || "35/8",
      pythagoreanLifePath: userProfile?.pythagoreanLifePath || 8,
      destinyNumber: userProfile?.destinyNumber || 1,
      awudeCircleNumber: userProfile?.awudeCircleNumber || 1,
      personalDay: userProfile?.personalDay || 5,
      personalYear: userProfile?.personalYear || 8,
    };

    session = {
      sessionId: existingId,
      userId,
      userContext: defaultContext,
      messages: [
        {
          id: `msg_welcome_${Date.now()}`,
          role: "assistant",
          content: `Welcome, ${defaultContext.fullName}. I am your personal profiling assistant, grounded in your exact Natal Placements (${defaultContext.sunSign} Sun, ${defaultContext.moonSign} Moon), your Dan Millman Life Path (${defaultContext.danMillmanLifePath}), and your Ethiopian AwudeNegest Circle (${defaultContext.awudeCircleNumber}). How may I illuminate your day or answer your life questions?`,
          timestamp: new Date().toISOString(),
          contextBadges: [
            `Sun in ${defaultContext.sunSign}`,
            `Moon in ${defaultContext.moonSign}`,
            `Life Path ${defaultContext.danMillmanLifePath}`,
            `Awude Circle #${defaultContext.awudeCircleNumber}`,
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    SESSION_STORE.set(existingId, session);
  } else if (userProfile) {
    // Update context if fresh profile provided
    session.userContext = { ...session.userContext, ...userProfile };
  }

  return session;
}

/**
 * Processes a user message with full profile context and grounded reasoning.
 * Calls Bionic GPT (LLM) when configured; falls back to rule-based engine otherwise.
 */
export async function processAIChatMessage(
  sessionId: string,
  userMessageText: string
): Promise<{ assistantMessage: AIChatMessage; session: AIChatSessionData; usedLLM: boolean }> {
  let session = SESSION_STORE.get(sessionId);
  if (!session) {
    session = getOrCreateChatSession("default_user");
  }

  // Add user message
  const userMsg: AIChatMessage = {
    id: `msg_user_${Date.now()}`,
    role: "user",
    content: userMessageText,
    timestamp: new Date().toISOString(),
  };
  session.messages.push(userMsg);

  let responseText: string;
  let usedLLM = false;

  // ── Bionic GPT path ──────────────────────────────────────────────────────
  if (isBionicConfigured()) {
    try {
      const systemPrompt = buildEthiopianWellnessSystemPrompt(session.userContext);

      // Build history (exclude the system welcome message; include user/assistant turns)
      const history = session.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      const bionicMessages = buildBionicMessages(systemPrompt, history);

      const bionicResponse = await bionicChat({
        messages: bionicMessages,
        temperature: 0.45,
        maxTokens: 1000,
      });

      responseText = bionicResponse.content.trim();
      if (!responseText) throw new BionicGPTError("Bionic GPT returned an empty response.", "EMPTY_RESPONSE");
      usedLLM = true;
    } catch (err) {
      // Graceful fallback: log and use deterministic engine
      const errMsg = err instanceof BionicGPTError ? err.message : String(err);
      console.warn(`[BionicGPT] Falling back to rule-based engine. Reason: ${errMsg}`);
      responseText = generateGroundedResponse(userMessageText, session.userContext, session.messages);
    }
  } else {
    // ── Rule-based fallback (Bionic not yet configured) ───────────────────
    responseText = generateGroundedResponse(userMessageText, session.userContext, session.messages);
  }

  const assistantMsg: AIChatMessage = {
    id: `msg_ast_${Date.now()}`,
    role: "assistant",
    content: responseText,
    timestamp: new Date().toISOString(),
    contextBadges: [
      usedLLM ? "Powered by Bionic GPT" : "Rule-based engine",
      `Grounded in ${session.userContext.sunSign} Sun`,
      `Life Path ${session.userContext.danMillmanLifePath}`,
      `Awude Circle #${session.userContext.awudeCircleNumber}`,
    ],
  };

  session.messages.push(assistantMsg);
  session.updatedAt = new Date().toISOString();
  SESSION_STORE.set(sessionId, session);

  return { assistantMessage: assistantMsg, session, usedLLM };
}

/**
 * Builds a rich Bionic GPT system prompt grounded in the user's Ethiopian profile.
 * This ensures the LLM responds with culturally relevant, medically safe guidance.
 */
function buildEthiopianWellnessSystemPrompt(ctx: AIChatSessionData["userContext"]): string {
  return `You are an Ethiopian holistic wellness advisor with deep knowledge of:
- Western astrology (Sun, Moon, Rising signs)
- Dan Millman's 45 Life Paths numerology system
- Ethiopian AwudeNegest (አውደ ነገሥት) traditional calendar and wisdom
- Ethiopian Traditional Medicine (ETM-DB): verified herbs like Tena Adam, Kosso, Tikur Azmud, Damakesse
- Ethiopian dietary traditions: teff injera, Ergo, Gomen, highland botanical infusions
- EPHI (Ethiopian Public Welbeing Institute) Debral guidelines

You are currently advising this user. Treat the following as user-provided context, not as evidence:
- Name: ${ctx.fullName || "not provided"}
- Birth Date: ${ctx.birthDate || "not provided"}${ctx.birthTime ? ` at ${ctx.birthTime}` : ""}
- City: ${ctx.city || "not provided"}
- Sun Sign: ${ctx.sunSign || "not provided"}, Moon Sign: ${ctx.moonSign || "not provided"}, Rising: ${ctx.risingSign || "not provided"}
- Dan Millman Life Path: ${ctx.danMillmanLifePath || "not provided"}
- Pythagorean Life Path: ${ctx.pythagoreanLifePath ?? "not provided"}
- Destiny Number: ${ctx.destinyNumber ?? "not provided"}
- AwudeNegest Circle: ${ctx.awudeCircleNumber ?? "not provided"}
- Personal Day: ${ctx.personalDay ?? "not provided"}, Personal Year: ${ctx.personalYear ?? "not provided"}

Guidelines:
1. Answer the user's actual question first. Do not force astrology, numerology, or cultural material into an unrelated answer.
2. Use only profile values explicitly provided above. Never invent birth-chart placements, diagnoses, lab results, medication effects, or traditional claims. Say when information is missing or uncertain.
3. For Welbeing questions, separate what is known, practical next steps, and when to seek care. Ask at most one focused follow-up question when missing context would materially change the guidance.
4. Do not diagnose, prescribe, recommend stopping medication, or present herbs as proven treatment. Flag possible medication or herb interactions and direct the user to a licensed Debrian or pharmacist.
5. Treat emergencies plainly: for chest pain, severe breathing difficulty, stroke signs, unconsciousness, severe bleeding, or other immediate danger, tell the user to call 907 / 991 or go to the nearest emergency department now.
6. Domain B (astrology, AwudeNegest, and cultural reflection) is optional personal reflection only. Keep it structurally separate from Debral reasoning and never use it to determine medical urgency.
7. For ordinary questions, use this compact structure when helpful: **Answer**, **Next steps**, **Safety note**. Use markdown, short paragraphs, and bullets. Avoid repetitive profile badges or generic invitations.
8. Always end Welbeing responses with the disclaimer: "${PLATFORM_DISCLAIMERS.Welbeing}"`;
}

/**
 * Generates deterministic, deeply grounded interpretations referencing exact calculations
 */
function generateGroundedResponse(
  message: string,
  ctx: AIChatSessionData["userContext"],
  history: AIChatMessage[]
): string {
  const m = message.toLowerCase();

  if (m.includes("dan millman") || m.includes("life path") || m.includes("purpose")) {
    return (
      `Your Dan Millman Life Path is **${ctx.danMillmanLifePath}**.\n\n` +
      `This unreduced calculation reveals that you carry the dual lessons of your constituent digits culminating in the master vibration of **${ctx.danMillmanLifePath.split("/")[1] || "8"}**.\n\n` +
      `• **Core Purpose**: Channeling your creative expression into ethical authority and material abundance.\n` +
      `• **Innate Gifts**: High-caliber resilience, magnetic leadership, and somatic perception.\n` +
      `• **Recurring Challenge**: Overcoming perfectionistic self-doubt or oscillating between over-exertion and sudden fatigue.\n` +
      `• **Somatic Grounding**: Maintain cardiovascular pacing with regular highland walks and warming herbal teas like Tosign (Thymus serrulatus).\n\n` +
      `*Disclaimer: ${PLATFORM_DISCLAIMERS.numerology}*`
    );
  }

  if (m.includes("awude") || m.includes("circle") || m.includes("ethiopian") || m.includes("cultural")) {
    return (
      `Under the classical Ethiopian **AwudeNegest (አውደ ነገሥት)**, your name and vibrational coordinates align with **Circle #${ctx.awudeCircleNumber}**.\n\n` +
      `• **Regent Sphere**: Traditional highland manuscripts assign this circle to active spiritual stewardship and protection.\n` +
      `• **Day vs. Night Rhythm**: The 16 circular sections indicate your sharpest strategic clarity occurs during morning hours (መዓልት 2nd-4th hours), while evening hours call for quiet reflection and family hearth peace.\n` +
      `• **Ancestral Wisdom**: In traditional Däbtära practice, this alignment is strengthened by sharing hospitality, honoring the Buna ceremony blessing, and avoiding hasty contractual promises during the waning moon.\n\n` +
      `*Disclaimer: ${PLATFORM_DISCLAIMERS.awudeNegest}*`
    );
  }

  if (m.includes("transit") || m.includes("today") || m.includes("horoscope") || m.includes("day")) {
    return (
      `For **${ctx.fullName}** today (Personal Day ${ctx.personalDay} in Personal Year ${ctx.personalYear}):\n\n` +
      `• **Planetary Transits**: The current lunar movement through your water/air sectors brings emotional clarity and heightened creative focus.\n` +
      `• **Vibrational Pacing**: Personal Day ${ctx.personalDay} is an adaptable, dynamic vibration. Expect fast-moving conversations and spontaneous invitations.\n` +
      `• **Welbeing Balance**: Keep your nervous system grounded with adequate hydration, nourishing Teff grain meals, and short breaks between work intervals.\n` +
      `• **Affirmation**: *"I adapt flexibly to today's openings while honoring my physical boundaries."*\n\n` +
      `*Disclaimer: ${PLATFORM_DISCLAIMERS.astrology}*`
    );
  }

  if (m.includes("career") || m.includes("work") || m.includes("job") || m.includes("money") || m.includes("business")) {
    return (
      `Looking at your ${ctx.sunSign} Sun, Midheaven, and Life Path **${ctx.danMillmanLifePath}**:\n\n` +
      `Your optimal professional rhythm thrives where you possess sovereign autonomy over your projects rather than being micromanaged. Your ${ctx.destinyNumber} Destiny number signifies pioneering initiative.\n\n` +
      `• **Strategic Advice**: Build structures with repeatable steps rather than relying solely on sudden bursts of inspiration.\n` +
      `• **AwudeNegest Counsel**: Circle #${ctx.awudeCircleNumber} counsels that equitable partnerships succeed best when expectations are documented in writing.\n\n` +
      `*Disclaimer: ${PLATFORM_DISCLAIMERS.aiChat}*`
    );
  }

  if (m.includes("relationship") || m.includes("love") || m.includes("partner") || m.includes("marriage")) {
    return (
      `In relationships, your **${ctx.moonSign} Moon** seeks authentic emotional safety, while your **${ctx.sunSign} Sun** values intellectual dialogue and creative growth.\n\n` +
      `• **Relational Style**: You demonstrate affection through tangible loyalty, protective presence, and thoughtful counsel.\n` +
      `• **Growth Edge**: Remember to voice your own emotional needs directly rather than expecting partners to intuitively guess your inner states.\n` +
      `• **Synergistic Matches**: Companions who honor your quiet downtime and share an appreciation for spiritual and cultural depth.\n\n` +
      `*Disclaimer: ${PLATFORM_DISCLAIMERS.compatibility}*`
    );
  }

  // Default synthesis response
  return (
    `Based on your complete profile (${ctx.sunSign} Sun, ${ctx.moonSign} Moon, Life Path ${ctx.danMillmanLifePath}, AwudeNegest Circle #${ctx.awudeCircleNumber}):\n\n` +
    `Your charts reflect a strong blend of intellectual agility and practical stewardship. Today's Personal Day ${ctx.personalDay} encourages stepping forward with clear speech and grounded confidence.\n\n` +
    `Would you like to explore:\n` +
    `1. Your deep Dan Millman 45-path gifts and vulnerabilities?\n` +
    `2. Your AwudeNegest prophecy for specific life categories (Welbeing, career, travel)?\n` +
    `3. A compatibility analysis with a partner, friend, or business founding date?\n\n` +
    `*Disclaimer: ${PLATFORM_DISCLAIMERS.aiChat}*`
  );
}

/**
 * Generates an in-depth personalized reading (Co-Star hybrid style)
 */
export function generatePersonalizedReading(
  userContext: AIChatSessionData["userContext"],
  type: "annual" | "spiritual" | "somatic" = "annual"
): { title: string; subtitle: string; content: string; keyInsights: string[]; disclaimers: string } {
  return {
    title: `Comprehensive ${type.toUpperCase()} Astrological & Cultural Reading`,
    subtitle: `Prepared for ${userContext.fullName} • ${userContext.sunSign} Sun • Life Path ${userContext.danMillmanLifePath}`,
    content:
      `This customized synthesis integrates Western planetary geometry, Vedic divisional influences, Dan Millman's 45-path framework, and classical 16th-century Ethiopian AwudeNegest parchment traditions.\n\n` +
      `1. Celestial Blueprint: Your Sun in ${userContext.sunSign} and Moon in ${userContext.moonSign} produce an individual gifted with verbal eloquence and deep somatic sensitivity. You perceive interpersonal tensions before they are spoken.\n\n` +
      `2. Life Purpose Matrix: Life Path ${userContext.danMillmanLifePath} tasks you with mastering material and executive power without losing spiritual integrity. Your greatest successes emerge when you build methodical processes.\n\n` +
      `3. Ethiopian Ancestral Resonance: AwudeNegest Circle #${userContext.awudeCircleNumber} marks you as a natural mediator and protector of family hearth traditions. In traditional Däbtära medicine, prioritizing regular botanical infusions (Tosign, Tena Adam) preserves your vitality throughout changing seasons.`,
    keyInsights: [
      `Active Planetary Cycle: Favorable window for foundational commitments.`,
      `Numerological Pacing: Align with Personal Year ${userContext.personalYear} themes of expansion and authority.`,
      `Highland Botanical Ally: Tena Adam (Ruta chalepensis) for digestive and mental clarity.`,
    ],
    disclaimers: PLATFORM_DISCLAIMERS.Welbeing,
  };
}
