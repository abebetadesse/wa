export const AUTH_STATE_CHANGED = "Debtera:auth-state-changed";

export function notifyAuthStateChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGED));
  }
}
