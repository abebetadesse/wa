/** The bots' production wiring: chat accounts in the database, replies into the case workflow. */
import { caseService } from "@/server/cases/service";
import { appOrigin, currentChatLink, findChatUser, linkChat, setChatNotify, touchWhatsApp } from "./accounts";
import { handleInbound, type InboundDeps } from "./inbound";
import type { LinkChannel } from "./linkCodes";

const deps = (): InboundDeps => ({
  appUrl: appOrigin(),
  findUser: findChatUser,
  currentLink: currentChatLink,
  link: linkChat,
  setNotify: setChatNotify,
  touch: async (channel, userId) => {
    if (channel === "whatsapp") await touchWhatsApp(userId);
  },
  cases: caseService,
});

export function receiveChatMessage(channel: LinkChannel, sender: string, text: string, meta: { username?: string } = {}) {
  return handleInbound(channel, sender, text, deps(), meta);
}
