import { type NextRequest, NextResponse } from "next/server";

import { signLoginToken } from "@/app/lib/portal/magic-link";
import { sendMagicLink } from "@/app/lib/portal/mailer";
import { getPortalClient } from "@/app/lib/portal/sanity";
import { verifyStudioToken } from "@/app/lib/portal/studioAuth";
import { PORTAL_USER_BY_ID_QUERY } from "@/sanity/lib/queries";
import type { PortalUser } from "@/sanity/lib/types";
import { getWriteClient } from "@/sanity/lib/writeClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only endpoint behind the Studio "Approve & email sign-in link" action.
 * Verifies the editor's Sanity token, marks the portal user active, and emails
 * them a magic sign-in link. Refuses if no access tier is set yet.
 *
 *   POST /api/portal/send-link  { id: "<portalUser _id>" }
 */
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!(await verifyStudioToken(token))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  const id = body?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing user id." }, { status: 400 });
  }

  const user = await getPortalClient().fetch<PortalUser | null>(
    PORTAL_USER_BY_ID_QUERY,
    { id },
  );
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (!user.roles?.length) {
    return NextResponse.json(
      { error: "Set at least one access tier before approving." },
      { status: 400 },
    );
  }

  try {
    await getWriteClient()
      .patch(id)
      .set({ status: "active" })
      .commit({ visibility: "async" });

    const email = user.email.toLowerCase();
    const loginToken = await signLoginToken(email);
    const base = (
      process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin
    ).replace(/\/+$/, "");
    const url = `${base}/en/portal/verify?token=${encodeURIComponent(loginToken)}`;
    await sendMagicLink(email, url);
  } catch (err) {
    console.error("[portal] send-link failed:", err);
    return NextResponse.json(
      { error: "Could not approve and send the link. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
