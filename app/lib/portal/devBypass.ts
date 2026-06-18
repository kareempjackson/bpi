import "server-only";

import type { PortalUser } from "@/sanity/lib/types";

/**
 * Developer/preview bypass — lets you into the portal WITHOUT a magic link,
 * email, or a Sanity portalUser record, so the UI can be reviewed before the
 * auth backend is provisioned.
 *
 * ⚠️ Gated entirely on the `PORTAL_DEV_BYPASS=1` env var. NEVER set this in
 * production — it grants full investor+partner access to anyone who hits
 * `/portal/dev-login`. Leave it unset everywhere except local/preview.
 */
export const DEV_BYPASS_USER_ID = "__portal_dev_preview__";

export function isDevBypassEnabled(): boolean {
  return process.env.PORTAL_DEV_BYPASS === "1";
}

/** The synthetic user returned for a bypass session (both tiers, so all gated
 *  content is visible while previewing). */
export const DEV_BYPASS_USER: PortalUser = {
  _id: DEV_BYPASS_USER_ID,
  name: "Preview User",
  email: "preview@bpi.local",
  organization: "BPI (preview)",
  roles: ["investor", "partner"],
  status: "active",
};
