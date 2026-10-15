/**
 * Turns a food or plant photo into candidate names, in memory, for one request.
 *
 * The photo is never written to disk, the database or a log: its bytes are sent to the configured
 * vision model once, the buffer is wiped, and only the names the model returns leave this module.
 * Photos showing a person are refused — the model is told to report a visible person instead of
 * describing anything, and no names are returned for such a photo.
 *
 * Needs BIONIC_GPT_VISION_MODEL (an image-capable model on the Bionic GPT / OpenAI-compatible
 * endpoint). Without it, photo recognition is unavailable and people type the names instead.
 */
import { BionicGPTError, bionicChat, isBionicConfigured } from "@/lib/ai/bionicGPT";
import { INTENSIVE_TRADITIONAL_MEDICINES } from "@/lib/knowledge/traditionalMedicineDatabase";
import { MAX_ITEMS_PER_NOTE } from "./foodHerb";
import type { FoodHerbKind } from "./types";

export const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export function visionModel(): string | null {
  const model = process.env.BIONIC_GPT_VISION_MODEL?.trim();
  return model && isBionicConfigured() ? model : null;
}

export type Recognition =
  | { status: "recognised"; names: string[] }
  | { status: "person" }
  | { status: "unclear" };

export interface RecognitionDeps {
  /** Sends the prompt and the image (as a data URL) to the vision model and returns its JSON reply. */
  ask: (prompt: string, imageUrl: string) => Promise<unknown>;
}

let herbNames: string | null = null;
function prompt(kind: FoodHerbKind): string {
  herbNames ??= INTENSIVE_TRADITIONAL_MEDICINES.map((herb) => `${herb.vernacularName} (${herb.englishName})`).join("; ");
  const subject = kind === "meal"
    ? "Name the Ethiopian dishes, drinks and foods visible on the plate or table, using their common Ethiopian names in Latin letters (for example: injera, shiro wot, misir wot, gomen, kitfo, genfo, kolo, tella)."
    : `Name the herbs, spices, roots, leaves or medicinal plants visible. Prefer these names when one fits: ${herbNames}.`;
  return [
    "You identify food or plants in one photo for an Ethiopian wellbeing service.",
    "If any person, face or body part other than a hand is visible, reply only {\"showsPerson\": true, \"items\": []} and describe nothing.",
    "Never describe people, places, documents or anything other than the food or plants.",
    subject,
    `Reply with JSON only: {"showsPerson": false, "items": [{"name": "…", "confidence": 0.0-1.0}]}, at most ${MAX_ITEMS_PER_NOTE} items, leaving out anything you are not reasonably sure of.`,
  ].join("\n");
}

export const visionDeps: RecognitionDeps = {
  async ask(text, imageUrl) {
    const model = visionModel();
    if (!model) throw new BionicGPTError("BIONIC_GPT_VISION_MODEL is not set.", "NOT_CONFIGURED");
    const response = await bionicChat({
      modelOverride: model,
      jsonMode: true,
      temperature: 0.1,
      maxTokens: 400,
      messages: [{ role: "user", content: [{ type: "text", text }, { type: "image_url", image_url: { url: imageUrl } }] }],
    });
    return response.parsedJson ?? JSON.parse(response.content.replace(/^```(?:json)?|```$/g, "").trim());
  },
};

/** The model's reply, reduced to short plain names. Anything unexpected counts as "unclear". */
export function readRecognition(reply: unknown): Recognition {
  if (!reply || typeof reply !== "object") return { status: "unclear" };
  const { showsPerson, items } = reply as { showsPerson?: unknown; items?: unknown };
  if (showsPerson === true) return { status: "person" };
  if (!Array.isArray(items)) return { status: "unclear" };
  const names = items
    .filter((item) => item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string")
    .filter((item) => {
      const confidence = (item as { confidence?: unknown }).confidence;
      return typeof confidence !== "number" || confidence >= 0.35;
    })
    .map((item) => String((item as { name: string }).name).replace(/[\r\n\t]+/g, " ").trim().slice(0, 60))
    .filter((name) => name.length >= 2);
  const unique = [...new Set(names)].slice(0, MAX_ITEMS_PER_NOTE);
  return unique.length ? { status: "recognised", names: unique } : { status: "unclear" };
}

/**
 * Reads the photo once and forgets it. The caller passes the uploaded File straight from the
 * request; nothing here keeps a reference to its bytes after returning.
 */
export async function recognisePhoto(photo: Blob, kind: FoodHerbKind, deps: RecognitionDeps = visionDeps): Promise<Recognition> {
  const bytes = Buffer.from(await photo.arrayBuffer());
  try {
    const imageUrl = `data:${photo.type};base64,${bytes.toString("base64")}`;
    return readRecognition(await deps.ask(prompt(kind), imageUrl));
  } catch (error) {
    // Only the error kind is logged: provider messages could echo request content.
    console.error("[food-herb] photo recognition failed:", error instanceof BionicGPTError ? error.code : error instanceof Error ? error.name : "unknown");
    throw error;
  } finally {
    bytes.fill(0);
  }
}
