/** Browser-side helper for the `{ success, data | error }` API envelope. */

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiFetch<T>(url: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      credentials: "same-origin",
    });
  } catch {
    throw new ApiClientError(0, "You appear to be offline. Check your connection and try again.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    const message = payload?.error ?? (response.status === 401 ? "Please sign in to continue." : `Request failed (${response.status}).`);
    throw new ApiClientError(response.status, message, payload?.details ?? payload?.fields);
  }
  return payload.data as T;
}

export const errorMessage = (error: unknown) => (error instanceof Error ? error.message : "Something went wrong.");
