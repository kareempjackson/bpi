import "server-only";

import { apiVersion, projectId } from "@/sanity/env";

/**
 * Verify that a bearer token belongs to a real Sanity Studio user — the same
 * check the R2 video presign route uses. Gates admin-only portal endpoints
 * (file upload, approve-and-send-link) so only authenticated editors can call
 * them.
 */
export async function verifyStudioToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch(
      `https://${projectId}.api.sanity.io/v${apiVersion}/users/me`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );
    const me = res.ok ? await res.json() : null;
    return !!me?.id;
  } catch {
    return false;
  }
}
