import fs from "node:fs";
import { Readable } from "node:stream";
import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { readAttachment } from "@/server/intake/attachments";

export const runtime = "nodejs";

/** Streams an intake file to the uploader or the business team, with Range support for audio and video. */
export const GET = defineRoute({
  access: "user",
  params: z.object({ id: z.string().uuid() }),
  handler: async ({ req, user, params }) => {
    const { row, filePath, size } = await readAttachment(user, params.id);
    const headers: Record<string, string> = {
      "Content-Type": row.mimeType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes",
    };
    const range = req.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
    if (range && (range[1] || range[2])) {
      const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
      const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      if (start >= size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      const stream = Readable.toWeb(fs.createReadStream(filePath, { start, end })) as ReadableStream;
      return new Response(stream, { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) } });
    }
    const stream = Readable.toWeb(fs.createReadStream(filePath)) as ReadableStream;
    return new Response(stream, { headers: { ...headers, "Content-Length": String(size) } });
  },
});
