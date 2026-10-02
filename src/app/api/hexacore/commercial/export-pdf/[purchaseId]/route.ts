import { NextResponse } from "next/server";
import { getPurchase } from "@/lib/hexacore/hexacoreCommercialStore";
import { renderDossierHtml, type HexacoreDossierReport } from "@/lib/hexacore/HexacoreDossierService";

export async function GET(
  request: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const { purchaseId } = params;
    const url = new URL(request.url);
    const lang = (url.searchParams.get("lang") || "en") as "en" | "am";
    const format = url.searchParams.get("format") || "html";

    const purchase = await getPurchase(purchaseId);

    if (!purchase) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;padding:40px;background:#0D1322;color:#E2E8F0;"><h1>Dossier Not Found</h1><p>The purchase reference "${purchaseId}" does not exist.</p></body></html>`,
        { status: 404, headers: { "Content-Type": "text/html" } }
      );
    }

    if (purchase.status !== "completed" || !purchase.unlockedPayload) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;padding:40px;background:#0D1322;color:#E2E8F0;">
          <h1 style="color:#D4AF37;">Payment Pending</h1>
          <p>Your purchase (Reference: <strong>${purchase.reference}</strong>) has not been verified yet.</p>
          <p>After submitting your payment proof, please allow 5–15 minutes for review, then reload this page.</p>
        </body></html>`,
        { status: 402, headers: { "Content-Type": "text/html" } }
      );
    }

    const html = renderDossierHtml(purchase.unlockedPayload as HexacoreDossierReport, { lang });

    const headers: Record<string, string> = {
      "Content-Type": "text/html; charset=utf-8",
    };

    if (format === "pdf") {
      // For true PDF rendering, a headless browser (Puppeteer) or external service would be used.
      // Here we serve the HTML with print-optimized CSS and a Content-Disposition header for "Save as PDF".
      headers["Content-Disposition"] = `attachment; filename="hexacore-dossier-${purchase.reference}.html"`;
    }

    return new NextResponse(html, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Dossier export failed:", error);
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:40px;"><h1>Export Error</h1><p>${error.message}</p></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}
