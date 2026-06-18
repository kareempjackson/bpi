import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

/**
 * Helpers for the PRIVATE R2 bucket that backs portal downloads. Distinct from
 * the public bucket used for site videos — this one must have NO public domain,
 * so its objects are only ever reachable through a short-lived presigned URL
 * minted behind the portal session check.
 */
export type R2Env = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

/** Read the private-bucket env, or `null` if it isn't fully configured. */
export function getPrivateR2(): R2Env | null {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_PRIVATE_BUCKET,
  } = process.env;
  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_PRIVATE_BUCKET
  ) {
    return null;
  }
  return {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucket: R2_PRIVATE_BUCKET,
  };
}

export function r2Client(env: R2Env): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
  });
}
