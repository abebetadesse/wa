import { NextRequest, NextResponse } from "next/server";
import { getAuthSecret } from "@/lib/auth/secret";

const PUBLIC_API_PATHS = [
  "/api/auth/",
  "/api/case/",
  "/api/cases",
  "/api/safety-check",
  "/api/diagnostic/assist",
  "/api/ai/bionic/test",
  "/api/nutrition/overview",
];

const PUBLIC_PAGE_PATHS = [
  "/",
  "/auth",
  "/emergency",
  "/safety",
  "/discover",
  "/cultural",
  "/awde-negast",
  "/constitution",
  "/somatics",
  "/ecology",
  "/fasting",
  "/zoonotic",
  "/foods",
  "/atlas",
];

function isPublicPage(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PAGE_PATHS.some((path) => path !== "/" && (pathname === path || pathname.startsWith(`${path}/`)));
}

function isPublicApi(pathname: string) {
  return PUBLIC_API_PATHS.some((path) => pathname === path || pathname.startsWith(path));
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
}

async function hasValidAccessToken(token: string | undefined) {
  if (!token) return false;

  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) return false;

  try {
    const secret = getAuthSecret();
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signature = Uint8Array.from(decodeBase64Url(encodedSignature), (character) => character.charCodeAt(0));
    const validSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(encodedPayload)
    );
    if (!validSignature) return false;

    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as { exp?: number; sub?: string };
    return Boolean(payload.sub && payload.exp && payload.exp > Math.floor(Date.now() / 1000));
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRequest = pathname.startsWith("/api/");

  if (pathname === "/expert-desk" || pathname.startsWith("/expert-desk/") || pathname.startsWith("/api/expert/")) {
    const token = request.cookies.get("ethio_access")?.value;
    if (!(await hasValidAccessToken(token))) {
      if (isApiRequest) return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
      return NextResponse.redirect(new URL("/auth?next=/expert-desk", request.url));
    }

    try {
      const payload = JSON.parse(decodeBase64Url(token!.split(".")[0])) as { role?: string };
      if (!["expert", "admin", "super_admin", "practitioner"].includes(String(payload.role).toLowerCase())) {
        if (isApiRequest) return NextResponse.json({ success: false, error: "Expert access required." }, { status: 403 });
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.json({ success: false, error: "Unable to verify expert access." }, { status: 401 });
    }
  }

  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico" || pathname === "/manifest.webmanifest") {
    return NextResponse.next();
  }

  if (isPublicPage(pathname)) {
    return NextResponse.next();
  }

  if (isApiRequest && isPublicApi(pathname)) {
    return NextResponse.next();
  }

  if (await hasValidAccessToken(request.cookies.get("ethio_access")?.value)) {
    return NextResponse.next();
  }

  if (isApiRequest) {
    return NextResponse.json(
      { success: false, error: "Authentication required. Please sign in or register." },
      { status: 401 }
    );
  }

  const authUrl = new URL("/auth", request.url);
  authUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(authUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/).*)",
  ],
};
