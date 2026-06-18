import { randomUUID } from "node:crypto";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type NextRequest, NextResponse } from "next/server";

import { getPrivateR2, r2Client } from "@/app/lib/portal/r2";
import { verifyStudioToken } from "@/app/lib/portal/studioAuth";

// aws-sdk needs the Node runtime (not edge).
export const runtime = "nodejs";

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB
const PRESIGN_TTL = 120; // seconds

/**
 * Issues a short-lived presigned PUT URL so the Studio can upload a proprietary
 * portal file straight to the PRIVATE R2 bucket. Editor-only (verified Sanity
 * token), and unlike the public video presign it accepts any content type.
 */
export async function POST(req: NextRequest) {
  const env = getPrivateR2();
  if (!env) {
    return NextResponse.json(
      { error: "Private storage (R2_PRIVATE_BUCKET) is not configured." },
      { status: 500 },
    );
  }

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!(await verifyStudioToken(token))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    filename?: string;
    contentType?: string;
    size?: number;
  } | null;

  if (typeof body?.size === "number" && body.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File exceeds the 500 MB limit." },
      { status: 413 },
    );
  }

  const contentType = body?.contentType || "application/octet-stream";
  const ext = body?.filename?.match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase() ?? "";
  // Random key under a `portal/` prefix — opaque and collision-free.
  const key = `portal/${randomUUID()}${ext}`;

  const uploadUrl = await getSignedUrl(
    r2Client(env),
    new PutObjectCommand({
      Bucket: env.bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: PRESIGN_TTL },
  );

  return NextResponse.json({ uploadUrl, key });
}
