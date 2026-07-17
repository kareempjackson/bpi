/**
 * Configures the Lenstec initiative detail-page header to use the Type 4
 * layout: a small eyebrow ("Lenstec") over a large two-tone headline, indented
 * right, with a full-bleed image below and no buttons.
 *
 * The headline renders in the page accent; the phrase wrapped in **double
 * asterisks** flips to white (same convention as the pull-quote section).
 *
 * Lenstec has no coverImage, so the full-bleed image falls back to the Home
 * building photo — upload a `headerImage` in Studio for the boardroom shot.
 *
 * Run:   node --env-file=.env.local scripts/set-lenstec-header.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.",
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const str = (value) => [
  { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value },
];
const text = (value) => [
  { _key: "en", _type: "internationalizedArrayTextValue", language: "en", value },
];

const SLUG = "lenstec";

const HEADER = {
  headerType: "type4",
  headerTitle: str("Lenstec"),
  headerSubtitle: text(
    "Exploring a new life **sciences trade route** between Barbados and Nigeria.",
  ),
};

async function run() {
  const ids = await client.fetch(
    `*[_type == "initiative" && slug.current == $slug]._id`,
    { slug: SLUG },
  );

  if (!ids.length) {
    console.error(`No initiative with slug '${SLUG}' found.`);
    process.exit(1);
  }

  console.log(
    `Applying Type 4 header to ${ids.length} Lenstec doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set(HEADER));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
