import { ApiError } from "./route";

/** Reads JSON from a multipart `file` field or from the request body. */
export async function readJsonUpload(req: Request): Promise<unknown> {
  const type = req.headers.get("content-type") || "";
  if (type.includes("multipart/form-data")) {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) throw ApiError.badRequest("A JSON file is required.");
    try {
      return JSON.parse(await file.text());
    } catch {
      throw ApiError.badRequest("The uploaded file is not valid JSON.");
    }
  }
  try {
    return await req.json();
  } catch {
    throw ApiError.badRequest("Request body must contain valid JSON.");
  }
}

/** A downloadable file response. The filename is sanitised for the Content-Disposition header. */
export function fileResponse(body: string, { type, filename }: { type: string; filename: string }) {
  const safeName = filename.replace(/[^\w.\-]+/g, "_");
  return new Response(body, {
    headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="${safeName}"` },
  });
}
