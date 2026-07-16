/**
 * Sets a dedicated header hero image on the Research & Development sector so it
 * no longer falls back to the generic Home "building" photo. Uses an on-theme
 * science/lab image already in the media library (landscape, suited to the
 * wide full-bleed hero). Fully editable afterwards in Studio → Sector → Header.
 *
 * Patches every doc matching slug `research-development` (published + any draft).
 *
 * Run:   node --env-file=.env.local scripts/set-research-development-hero-image.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-research-development-hero-image.mjs",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const str = (value) => [
  { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value },
];

// On-theme science/lab photo (landscape) already in the media library.
const ASSET_FILENAME = "cdc-XLhDvfz0sUM-unsplash.jpg";

async function run() {
  const asset = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $f][0]{_id, "w": metadata.dimensions.width, "h": metadata.dimensions.height}`,
    { f: ASSET_FILENAME },
  );
  if (!asset?._id) {
    console.error(`Asset "${ASSET_FILENAME}" not found in ${projectId}/${dataset}.`);
    process.exit(1);
  }

  const heroImage = {
    _type: "imageWithAlt",
    kind: "image",
    asset: {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
    },
    alt: str("Researchers at work in a pharmaceutical laboratory"),
  };

  const ids = await client.fetch(
    `*[_type == "sector" && slug.current == "research-development"]._id`,
  );
  if (!ids.length) {
    console.error("No sector with slug 'research-development' found.");
    process.exit(1);
  }

  console.log(
    `Setting hero image (${asset._id}, ${asset.w}x${asset.h}) on ${ids.length} research-development doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set({ heroImage }));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
