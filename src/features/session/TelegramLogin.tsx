"use client";

import { useEffect, useId, useRef } from "react";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Telegram's official Login Widget. Telegram shows its own confirmation and returns signed user
 * data, which the server verifies with the bot token. `request-access=write` lets the bot send
 * booking updates and password-reset links to the person.
 */
export function TelegramLogin({ bot, onAuth, size = "large" }: { bot: string; onAuth: (user: TelegramUser) => void; size?: "large" | "medium" | "small" }) {
  const container = useRef<HTMLDivElement>(null);
  const callbackName = `__telegramAuth_${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const handler = useRef(onAuth);
  handler.current = onAuth;

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    (window as unknown as Record<string, unknown>)[callbackName] = (user: TelegramUser) => handler.current(user);
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", bot);
    script.setAttribute("data-size", size);
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-onauth", `${callbackName}(user)`);
    host.replaceChildren(script);
    return () => {
      host.replaceChildren();
      delete (window as unknown as Record<string, unknown>)[callbackName];
    };
  }, [bot, size, callbackName]);

  return <div ref={container} className="flex min-h-10 justify-center" />;
}
