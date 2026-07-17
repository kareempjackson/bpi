import type { SanityClient } from "sanity";

import { projectId } from "../env";

/**
 * Reads the logged-in editor's Sanity auth token so a Studio component can
 * authenticate a request to our own backend (e.g. the R2 presign routes).
 *
 * The Studio uses cookie/dual auth, so `client.config().token` is usually
 * empty in the browser — the real session token lives in localStorage under
 * `__studio_auth_token_<projectId>` (value shape `{ token?: string }`). We try
 * the client config first, then fall back to that key.
 */
export function getStudioToken(client: SanityClient): string | null {
  const fromConfig = client.config().token;
  if (fromConfig) return fromConfig;

  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`__studio_auth_token_${projectId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string } | null;
    return parsed?.token || null;
  } catch {
    return null;
  }
}
