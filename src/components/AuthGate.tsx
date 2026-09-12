"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";

const PUBLIC_PATHS = [
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

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // "skip" is used when the path is public — avoids fetch entirely
  const [state, setState] = useState<"checking" | "authenticated" | "guest" | "skip">(
    isPublicPath(pathname) ? "skip" : "checking"
  );

  // ── Auth check — skipped for public paths ────────────────────────────────
  useEffect(() => {
    if (isPublicPath(pathname)) {
      setState("skip");
      return;
    }

    const controller = new AbortController();
    setState("checking");

    fetch("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success || !payload.data) {
          setState("guest");
          return;
        }
        setState("authenticated");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState("guest");
      });

    return () => controller.abort();
  }, [pathname]);

  // ── Redirect unauthenticated users ───────────────────────────────────────
  useEffect(() => {
    if (state === "guest" && !isPublicPath(pathname)) {
      const next = `${pathname}${window.location.search}`;
      router.replace(`/auth?next=${encodeURIComponent(next)}`);
    }
  }, [pathname, router, state]);

  // ── ALL hooks called above — conditional rendering below ──────────────────

  if (state === "skip" || state === "authenticated") {
    return <>{children}</>;
  }

  if (state === "checking") {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-6">
        <section className="glass-panel max-w-md p-8 text-center" aria-live="polite">
          <LockKeyhole className="mx-auto mb-4 text-sky-400" size={30} />
          <h1 className="text-xl font-semibold text-slate-100">Checking your account</h1>
          <p className="mt-2 text-sm text-slate-400">Securely restoring your session before opening this service.</p>
        </section>
      </main>
    );
  }

  // state === "guest"
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <section className="glass-panel max-w-md p-8 text-center">
        <LockKeyhole className="mx-auto mb-4 text-amber-400" size={30} />
        <h1 className="text-xl font-semibold text-slate-100">Sign in required</h1>
        <p className="mt-2 text-sm text-slate-400">
          Register or sign in to use NiniMed services and keep your health workflows private.
        </p>
        <Link
          href={`/auth?next=${encodeURIComponent(`${pathname}${typeof window !== "undefined" ? window.location.search : ""}`)}`}
          className="btn-pill-primary inline-flex mt-6 px-5 py-2.5"
        >
          Continue to sign in
        </Link>
      </section>
    </main>
  );
}
