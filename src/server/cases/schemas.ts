/** Request shapes shared by the review desk routes. */
import { z } from "zod";

const section = z.object({
  id: z.string().min(1).max(80),
  title: z.string().trim().min(1).max(200),
  body: z.string().max(8000).optional(),
  items: z.array(z.string().max(2000)).max(40).optional(),
  locked: z.boolean(),
  cultural: z.boolean().optional(),
  evidence: z.object({ sources: z.array(z.string()).optional(), confidence: z.number().optional(), note: z.string().optional() }).optional(),
  data: z.record(z.unknown()).optional(),
});

/** The parts of a report a reviewer edits; recommendations and other fields are kept from the stored draft. */
export const draftInput = z.object({
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(4000),
  sections: z.array(section).max(30),
  disclaimer: z.string().trim().min(1).max(2000),
  generatedAt: z.string(),
  aiAssisted: z.boolean(),
});

export const messageInput = z.object({
  body: z.string().trim().min(2, "Write a message first.").max(2000),
  kind: z.enum(["message", "question"]).default("message"),
});

export const replyInput = z.object({ body: z.string().trim().min(1, "Write a message first.").max(4000) });
