import { type NextRequest, NextResponse } from "next/server";

import {
  DEV_BYPASS_USER,
  DEV_BYPASS_USER_ID,
  isDevBypassEnabled,
} from "@/app/lib/portal/devBypass";
import { createSession } from "@/app/lib/portal/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Preview bypass entry point. Mints a session for the synthetic preview user so
 * the portal can be viewed without a magic link. No-ops (redirects to login)
 * unless PORTAL_DEV_BYPASS=1. See app/lib/portal/devBypass.ts.
 *
 *   GET /{lang}/portal/dev-login
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang } = await params;

  if (!isDevBypassEnabled()) {
    return NextResponse.redirect(
      new URL(`/${lang}/portal/login`, req.nextUrl.origin),
    );
  }

  await createSession(DEV_BYPASS_USER_ID, DEV_BYPASS_USER.roles);
  return NextResponse.redirect(new URL(`/${lang}/portal`, req.nextUrl.origin));
}
