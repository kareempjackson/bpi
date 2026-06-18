import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";

import {
  PORTAL_USER_BY_ID_QUERY,
} from "@/sanity/lib/queries";
import type { PortalRole, PortalUser } from "@/sanity/lib/types";

import {
  DEV_BYPASS_USER,
  DEV_BYPASS_USER_ID,
  isDevBypassEnabled,
} from "./devBypass";
import { getPortalClient } from "./sanity";
import { getSessionPayload } from "./session";

/**
 * Data Access Layer — the REAL authorization gate (the edge proxy is only an
 * optimistic redirect). Every protected page/route resolves the user through
 * here. `cache()` dedupes the Sanity read across one request.
 *
 * Crucially this re-loads the user from Sanity (uncached client) and requires
 * `status === "active"`, so disabling a user in Studio locks them out on their
 * very next request even though their signed cookie is still valid.
 */
export const getCurrentUser = cache(async (): Promise<PortalUser | null> => {
  const session = await getSessionPayload();
  if (!session) return null;

  // Preview/dev bypass — short-circuit the Sanity lookup entirely.
  if (isDevBypassEnabled() && session.userId === DEV_BYPASS_USER_ID) {
    return DEV_BYPASS_USER;
  }

  const user = await getPortalClient().fetch<PortalUser | null>(
    PORTAL_USER_BY_ID_QUERY,
    { id: session.userId },
  );

  if (!user || user.status !== "active") return null;
  return user;
});

/** Require an authenticated, active user or redirect to the login page. */
export async function requireUser(lang: string): Promise<PortalUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/portal/login`);
  return user;
}

/** Visibility rule: the viewer can see content if their roles intersect the
 *  content's audiences. */
export function canAccess(
  userRoles: PortalRole[] | undefined,
  audiences: PortalRole[] | undefined,
): boolean {
  if (!userRoles?.length || !audiences?.length) return false;
  return audiences.some((a) => userRoles.includes(a));
}
