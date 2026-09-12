import type { AuthenticatedUser } from "@/lib/auth";

let cachedUser: AuthenticatedUser | null | undefined;
let cachedAt = 0;
let request: Promise<AuthenticatedUser | null> | null = null;

const CACHE_TTL_MS = 15_000;

export async function getClientUser(options: { force?: boolean } = {}): Promise<AuthenticatedUser | null> {
  const now = Date.now();
  if (!options.force && cachedUser !== undefined && now - cachedAt < CACHE_TTL_MS) {
    return cachedUser;
  }

  if (!options.force && request) return request;

  request = fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const payload = await response.json();
      return payload.success && payload.data ? (payload.data as AuthenticatedUser) : null;
    })
    .catch(() => null)
    .then((user) => {
      cachedUser = user;
      cachedAt = Date.now();
      return user;
    })
    .finally(() => {
      request = null;
    });

  return request;
}

export function invalidateClientUser() {
  cachedUser = undefined;
  cachedAt = 0;
}
