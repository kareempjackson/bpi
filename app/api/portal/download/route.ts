import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type NextRequest, NextResponse } from "next/server";

import { canAccess, getCurrentUser } from "@/app/lib/portal/dal";
import { getPrivateR2, r2Client } from "@/app/lib/portal/r2";
import { getPortalClient } from "@/app/lib/portal/sanity";
import { PORTAL_RESOURCE_BY_ID_QUERY } from "@/sanity/lib/queries";
import type { PortalResource } from "@/sanity/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIGNED_TTL = 120; // seconds the download URL stays valid

/**
 * Serves a gated portal file. Checks the logged-in user's session AND that
 * their tier may see this resource, then 307-redirects to a short-lived
 * presigned GET on the private bucket. The object is never publicly reachable
 * and the signed URL expires in two minutes.
 *
 *   GET /api/portal/download?id=<portalResource _id>
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const env = getPrivateR2();
  if (!env) {
    return NextResponse.json(
      { error: "Private storage is not configured." },
      { status: 500 },
    );
  }

  const resource = await getPortalClient().fetch<PortalResource | null>(
    PORTAL_RESOURCE_BY_ID_QUERY,
    { id },
  );
  if (!resource?.file?.key) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!canAccess(user.roles, resource.audiences)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Videos play inline; everything else downloads.
  const disposition =
    resource.kind === "video"
      ? "inline"
      : `attachment; filename="${(resource.file.originalFilename ?? "download").replace(/"/g, "")}"`;

  const signedUrl = await getSignedUrl(
    r2Client(env),
    new GetObjectCommand({
      Bucket: env.bucket,
      Key: resource.file.key,
      ResponseContentDisposition: disposition,
      ...(resource.file.contentType
        ? { ResponseContentType: resource.file.contentType }
        : {}),
    }),
    { expiresIn: SIGNED_TTL },
  );

  return NextResponse.redirect(signedUrl);
}
