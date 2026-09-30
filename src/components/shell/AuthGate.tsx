"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { getClientUser } from "@/lib/auth/clientState";
import { isPublicPath } from "@/lib/auth/paths";

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

    setState("checking");

    getClientUser()
      .then((user) => {
        if (!user) {
          setState("guest");
          return;
        }
        setState("authenticated");
      })
      .catch(() => {
        setState("guest");
      });

    return undefined;
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
      <main className="flex min-h-[60vh] items-center justify-center px-6" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <span className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" aria-hidden="true" />
          Checking your account…
        </div>
      </main>
    );
  }

  // state === "guest"
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6">
      <section className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <LockKeyhole className="mx-auto mb-4 size-8 text-gold" aria-hidden="true" />
        <h1 className="font-display text-xl font-extrabold text-foreground">Sign in to continue</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create a free account in under a minute, or sign in, to open this page.</p>
        <Link
          href={`/auth?next=${encodeURIComponent(`${pathname}${typeof window !== "undefined" ? window.location.search : ""}`)}`}
          className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-brand-strong"
        >
          Sign in or create an account
        </Link>
      </section>
    </main>
  );
}
