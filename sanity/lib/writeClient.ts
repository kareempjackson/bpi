import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, writeToken } from "../env";

// Server-only Sanity client for mutations (e.g. contact form submissions).
// Importing this in a client component will throw at runtime because the
// token is undefined in the browser. Keep it on the server.
export function getWriteClient() {
  if (!writeToken) {
    throw new Error(
      "Missing SANITY_API_WRITE_TOKEN — required to write to Sanity.",
    );
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: writeToken,
    perspective: "published",
  });
}
