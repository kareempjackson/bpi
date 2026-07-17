/**
 * Configures the "BPI x Nigeria (PVAC)" initiative detail-page header to use the
 * Type 1 layout (big "PVAC" title top-left, subtitle and button dropped to the
 * bottom of the column, beside a tall image on the right), with the approved
 * hero copy. Real, editable CMS data — everything here can be changed in
 * Studio → Initiative → Detail page header.
 *
 * No headerImage is set, so the header falls back to the initiative's cover
 * image (the portrait PVAC photo) — an editor can upload a different hero shot
 * in Studio if the cover isn't the one they want.
 *
 * Run:   node --env-file=.env.local scripts/set-pvac-header.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-pvac-header.mjs",
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

const SLUG = "bpi-x-nigeria-pvac";

const HEADER = {
  headerType: "type1",
  headerTitle: str("PVAC"),
  headerSubtitle: text(
    "A South–South partnership building a pharmaceutical trade and skills corridor between Barbados and Nigeria.",
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
    `Applying Type 1 header to ${ids.length} PVAC doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  // The doc carries an empty headerSecondaryCta shell from Studio; unset it so
  // the hero renders the single primary button in the mockup.
  for (const id of ids) tx.patch(id, (p) => p.set(HEADER).unset(["headerSecondaryCta"]));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
