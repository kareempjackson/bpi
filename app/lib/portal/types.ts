// Shared portal types. Kept free of `server-only` and of next/headers so they
// can be imported from anywhere (edge proxy, server components, client forms).

/** The two access tiers. Content is tagged with one or both; a user holds one
 *  or both. Visibility = non-empty intersection of the two. */
export const PORTAL_ROLES = ["investor", "partner"] as const;
export type PortalRole = (typeof PORTAL_ROLES)[number];

export type PortalStatus = "pending" | "active" | "disabled";

/** What we put inside the signed session cookie. */
export type SessionPayload = {
  userId: string;
  roles: PortalRole[];
};
