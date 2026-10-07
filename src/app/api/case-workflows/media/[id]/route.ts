import fs from "node:fs";
import { Readable } from "node:stream";
import { z } from "zod";
import { defineRoute, ApiError } from "@/lib/api/route";
import { caseService } from "@/server/cases/service";
import { readWorkflowMedia } from "@/server/cases/media";

export const runtime = "nodejs";

export const GET = defineRoute({
  access: "user",
  params: z.object({ id: z.string().uuid() }),
  handler: async ({ user, params }) => {
    const { media, filePath, size } = await readWorkflowMedia(params.id);
    if (media.userId !== user.id) {
      if (!media.caseId) throw ApiError.notFound("File");
      await caseService.getForExpert(user, media.caseId);
    }
    const stream = Readable.toWeb(fs.createReadStream(filePath)) as ReadableStream;
    return new Response(stream, {
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": String(size),
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
});
