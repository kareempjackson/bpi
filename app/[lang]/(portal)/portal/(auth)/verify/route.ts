import { type NextRequest, NextResponse } from "next/server";

import { verifyLoginToken } from "@/app/lib/portal/magic-link";
import { getPortalClient } from "@/app/lib/portal/sanity";
import { createSession } from "@/app/lib/portal/session";
import { PORTAL_USER_BY_EMAIL_QUERY } from "@/sanity/lib/queries";
import type { PortalUser } from "@/sanity/lib/types";
import { getWriteClient } from "@/sanity/lib/writeClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Magic-link consumer. Verifies the one-time token, confirms the user is still
 * active, sets the session cookie, and lands them on the dashboard. A route
 * handler (not a page) because it sets a cookie — not allowed during a Server
 * Component render.
 *
 *   GET /{lang}/portal/verify?token=…
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params;
  const token = req.nextUrl.searchParams.get("token");

  const loginUrl = new URL(`/${lang}/portal/login`, req.nextUrl.origin);

  const email = await verifyLoginToken(token);
  if (!email) {
    loginUrl.searchParams.set("error", "link");
    return NextResponse.redirect(loginUrl);
  }

  const user = await getPortalClient().fetch<PortalUser | null>(
    PORTAL_USER_BY_EMAIL_QUERY,
    { email },
  );
  if (!user || user.status !== "active") {
    loginUrl.searchParams.set("error", "link");
    return NextResponse.redirect(loginUrl);
  }

  await createSession(user._id, user.roles ?? []);

  // Best-effort: record the login. Never block sign-in on this.
  try {
    await getWriteClient()
      .patch(user._id)
      .set({ lastLoginAt: new Date().toISOString() })
      .commit({ visibility: "async" });
  } catch (err) {
    console.error("[portal] failed to record lastLoginAt:", err);
  }

  return NextResponse.redirect(new URL(`/${lang}/portal`, req.nextUrl.origin));
}
