import "server-only";

import { signToken, verifyToken } from "./jwt";

/**
 * One-time, passwordless sign-in tokens. A short-lived signed JWT carrying the
 * user's email — stateless, so no database row is needed. The `purpose` claim
 * stops a session cookie (or any other token) from being replayed here.
 */

const LOGIN_TTL = "15m";
const LOGIN_PURPOSE = "portal-login" as const;

type LoginClaims = { email: string; purpose: typeof LOGIN_PURPOSE };

/** Sign a magic-link token for `email` (already lowercased by the caller). */
export async function signLoginToken(email: string): Promise<string> {
  return signToken({ email, purpose: LOGIN_PURPOSE }, LOGIN_TTL);
}

/** Verify a magic-link token. Returns the (lowercased) email, or `null` if the
 *  token is missing, expired, tampered, or not a login token. */
export async function verifyLoginToken(
  token: string | undefined | null,
): Promise<string | null> {
  const payload = await verifyToken<LoginClaims>(token);
  if (
    !payload ||
    payload.purpose !== LOGIN_PURPOSE ||
    typeof payload.email !== "string"
  ) {
    return null;
  }
  return payload.email.toLowerCase();
}
