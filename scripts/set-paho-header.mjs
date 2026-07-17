/**
 * Configures the "PAHO Regional Supply Hub" initiative detail-page header to
 * use the Type 2 layout (split title — "PAHO Regional" on top, subtitle and
 * button under it, "Supply Hub" hung to the bottom right of the column, beside
 * a square image), with the approved hero copy. Real, editable CMS data —
 * everything here can be changed in Studio → Initiative → Detail page header.
 *
 * No headerImage is set, so the header falls back to the cover image, then the
 * Home building photo — an editor can upload the real team photo in Studio.
 *
 * Run:   node --env-file=.env.local scripts/set-paho-header.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-paho-header.mjs",
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

const SLUG = "paho-regional-supply-hub";

const HEADER = {
  headerType: "type2",
  headerTitle: str("PAHO Regional"),
  headerTitleTail: str("Supply Hub"),
  headerSubtitle: text(
    "Positioning Barbados as the Caribbean and Latin America’s regional distribution anchor for essential medicines.",
  ),
  headerPrimaryCta: {
    _type: "cta",
    label: str("Partner With BPI"),
    href: "/contact",
  },
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
    `Applying Type 2 header to ${ids.length} PAHO doc(s) in ${projectId}/${dataset}…`,
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
