import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/auth", "/api/auth", "/_next", "/favicon.ico", "/manifest.webmanifest", "/sw.js"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.next();
  if (!request.cookies.get("ethio_access") && !request.cookies.get("ethio_refresh")) {
    const login = new URL("/auth", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!.*\\..*).*)"] };
