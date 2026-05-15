export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
);

// Server-only — only needed for draft mode / live preview reads. Never expose
// this to the browser. Optional: pages still render the published perspective
// without it.
export const readToken = process.env.SANITY_API_READ_TOKEN;

// Server-only — required for writing documents (e.g. contact form
// submissions). Create a token with "Editor" or "Write" permissions in
// sanity.io/manage and set it in .env.local.
export const writeToken = process.env.SANITY_API_WRITE_TOKEN;

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined || v === "") {
    throw new Error(errorMessage);
  }
  return v;
}
