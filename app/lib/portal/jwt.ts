import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * Low-level token signing/verifying for the portal. Uses `jose` (Web Crypto)
 * so the SAME code runs in the Edge proxy (`proxy.ts`) and in Node server
 * actions / route handlers. Imports nothing from `next/headers`, so it's safe
 * to pull into the edge runtime.
 *
 * Both the session cookie and the one-time magic-link tokens are HS256 JWTs
 * signed with `PORTAL_SESSION_SECRET`.
 */

/** Name of the session cookie. Shared with `proxy.ts` and `session.ts`. */
export const SESSION_COOKIE = "bpi_portal_session";

function key(): Uint8Array {
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "Missing PORTAL_SESSION_SECRET — required for the investor/partner portal.",
    );
  }
  return new TextEncoder().encode(secret);
}

/** Sign a payload. `expiresIn` accepts jose's time syntax ("15m", "7d") or a
 *  number of seconds from now. */
export async function signToken(
  payload: JWTPayload,
  expiresIn: string | number,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key());
}

/** Verify + decode. Returns `null` on any failure (bad signature, expired,
 *  tampered, missing). Never throws for an invalid token. */
export async function verifyToken<T = JWTPayload>(
  token: string | undefined | null,
): Promise<(T & JWTPayload) | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload as T & JWTPayload;
  } catch {
    return null;
  }
}
