/** Request shapes shared by the review desk routes. */
import { z } from "zod";

export const sectionInput = z.object({
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
  sections: z.array(sectionInput).max(30),
  disclaimer: z.string().trim().min(1).max(2000),
  generatedAt: z.string(),
  aiAssisted: z.boolean(),
});

/** One section sent to "AI" for further development, with what the reviewer asked for. */
export const enhanceInput = z.object({
  section: sectionInput,
  instruction: z.string().trim().max(600).optional(),
  christianName: z.string().trim().max(80).optional(),
});

export const messageInput = z.object({
  body: z.string().trim().min(2, "Write a message first.").max(2000),
  kind: z.enum(["message", "question"]).default("message"),
});

export const replyInput = z.object({ body: z.string().trim().min(1, "Write a message first.").max(4000) });
