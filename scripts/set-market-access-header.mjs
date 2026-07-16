/**
 * Applies the "blue" colour profile + Split header + hero buttons to the
 * Market Access sector document, as real (editable) CMS data.
 *
 * These are the same fields any editor can now change in Studio → Sector →
 * Header. This script just seeds market-access so it matches the approved
 * mockup out of the box. Re-runnable (idempotent set()).
 *
 * Patches every document matching slug `market-access` (published + any draft)
 * so the change shows whether or not the doc is currently being edited.
 *
 * Run:   node --env-file=.env.local scripts/set-market-access-header.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-market-access-header.mjs",
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

// English i18n wrapper — matches the internationalized-array shape the CTA
// label is stored in (see scripts/seed-sectors.mjs).
const str = (value) => [
  {
    _key: "en",
    _type: "internationalizedArrayStringValue",
    language: "en",
    value,
  },
];

// ── The blue colour profile ──────────────────────────────────────────────────
const PROFILE = {
  headerLayout: "split",
  pageColor: "#0F3B75", // navy header / footer background
  heroHeadingColor: "#BBDAF7", // light-blue title + primary button accent
  sectionBgColor: "#E7F9FF", // light-blue canvas — matches the blue-tone Careers/CTA blocks
  heroPrimaryCta: {
    _type: "cta",
    label: str("Partner With BPI"),
    href: "/contact",
  },
  heroSecondaryCta: {
    _type: "cta",
    label: str("Explore Our Impact"),
    href: "/impact",
  },
};

async function run() {
  const ids = await client.fetch(
    `*[_type == "sector" && slug.current == "market-access"]._id`,
  );

  if (!ids.length) {
    console.error(
      "No sector with slug 'market-access' found. Seed it first: node --env-file=.env.local scripts/seed-sectors.mjs",
    );
    process.exit(1);
  }

  console.log(
    `Applying blue profile to ${ids.length} market-access doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set(PROFILE));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
