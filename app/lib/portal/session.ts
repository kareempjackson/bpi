import "server-only";
import { cookies } from "next/headers";

import { SESSION_COOKIE, signToken, verifyToken } from "./jwt";
import type { PortalRole, SessionPayload } from "./types";

// Session lifetime. The cookie and the JWT `exp` are kept in sync.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Issue a session cookie for a logged-in portal user. Call only from a Server
 * Action or Route Handler — `cookies().set()` is not allowed during a Server
 * Component render.
 */
export async function createSession(
  userId: string,
  roles: PortalRole[],
): Promise<void> {
  const token = await signToken({ userId, roles }, `${MAX_AGE_SECONDS}s`);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Read + verify the session cookie. Returns `null` if absent or invalid. This
 *  is an optimistic identity check — authorization (status/role) lives in the
 *  DAL (`getCurrentUser`). */
export async function getSessionPayload(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const payload = await verifyToken<SessionPayload>(token);
  if (!payload?.userId || !Array.isArray(payload.roles)) return null;
  return { userId: payload.userId, roles: payload.roles as PortalRole[] };
}

/** Clear the session cookie (logout). */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
