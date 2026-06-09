import { randomUUID } from "node:crypto";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { type NextRequest, NextResponse } from "next/server";

import { apiVersion, projectId } from "../../../../sanity/env";

// aws-sdk needs the Node runtime (not edge).
export const runtime = "nodejs";

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB ceiling
const PRESIGN_TTL = 120; // seconds the upload URL stays valid

/**
 * Issues a short-lived presigned PUT URL so the Studio can upload a video
 * straight to Cloudflare R2 (browser → R2, bytes never touch this server).
 *
 * Auth: the caller must pass the logged-in Studio user's Sanity token as
 * `Authorization: Bearer <token>`. We verify it against Sanity's `/users/me`,
 * so only authenticated project users can mint upload URLs.
 *
 * Required env (server-only): R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
 * R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL.
 */
export async function POST(req: NextRequest) {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_BASE_URL,
  } = process.env;

  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET ||
    !R2_PUBLIC_BASE_URL
  ) {
    return NextResponse.json(
      { error: "R2 storage is not configured on the server." },
      { status: 500 },
    );
  }

  // ── Auth: confirm the bearer token belongs to a real Sanity user ──────────
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const meRes = await fetch(
      `https://${projectId}.api.sanity.io/v${apiVersion}/users/me`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );
    const me = meRes.ok ? await meRes.json() : null;
    if (!me?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
  } catch {
    return NextResponse.json(
      { error: "Could not verify Sanity session" },
      { status: 401 },
    );
  }

  // ── Validate the requested upload ─────────────────────────────────────────
  const body = (await req.json().catch(() => null)) as {
    filename?: string;
    contentType?: string;
    size?: number;
  } | null;

  const contentType = body?.contentType ?? "";
  if (!contentType.startsWith("video/")) {
    return NextResponse.json(
      { error: "Only video files can be uploaded here." },
      { status: 400 },
    );
  }
  if (typeof body?.size === "number" && body.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File exceeds the 500 MB limit." },
      { status: 413 },
    );
  }

  // Content-addressed key: a random id keeps uploads from colliding and makes
  // the public URL effectively immutable (safe to cache forever).
  const ext = extensionFor(body?.filename, contentType);
  const key = `videos/${randomUUID()}${ext}`;

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: PRESIGN_TTL },
  );

  const publicUrl = `${R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${key}`;

  return NextResponse.json({ uploadUrl, publicUrl, key });
}

function extensionFor(filename: string | undefined, contentType: string): string {
  const fromName = filename?.match(/\.[a-z0-9]+$/i)?.[0];
  if (fromName) return fromName.toLowerCase();
  if (contentType.includes("webm")) return ".webm";
  if (contentType.includes("quicktime")) return ".mov";
  return ".mp4";
}
