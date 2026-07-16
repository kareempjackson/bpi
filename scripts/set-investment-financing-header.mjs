/**
 * Applies the "blue" colour profile + Spotlight header + hero buttons to the
 * Investment & Financing sector document, matching the approved mockup:
 *   - tall image on the left, title top-right, portrait pin + copy bottom-right
 *   - updated subtitle ("Connecting viable pharmaceutical projects…")
 *   - "Partner With BPI" / "Explore Our Impact" pills
 *
 * These are the same fields any editor can change in Studio → Sector → Header.
 * Re-runnable (idempotent set()). Patches every document matching slug
 * `investment-financing` (published + any draft).
 *
 * Run:   node --env-file=.env.local scripts/set-investment-financing-header.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-investment-financing-header.mjs",
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

// English i18n wrappers — CTA labels are stored as `string`, the subtitle as
// `text` (see scripts/seed-sectors.mjs).
const str = (value) => [
  { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value },
];
const text = (value) => [
  { _key: "en", _type: "internationalizedArrayTextValue", language: "en", value },
];

// ── The blue colour profile + Spotlight header ───────────────────────────────
const PROFILE = {
  headerLayout: "spotlight",
  pageColor: "#0F3B75", // navy header / footer background
  heroHeadingColor: "#BBDAF7", // light-blue accent — primary button (title stays white on spotlight)
  sectionBgColor: "#E7F9FF", // light-blue canvas — matches the blue-tone Careers/CTA blocks
  subtitle: text(
    "Connecting viable pharmaceutical projects to the right capital at the right stage.",
  ),
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
    `*[_type == "sector" && slug.current == "investment-financing"]._id`,
  );

  if (!ids.length) {
    console.error(
      "No sector with slug 'investment-financing' found. Seed it first: node --env-file=.env.local scripts/seed-sectors.mjs",
    );
    process.exit(1);
  }

  console.log(
    `Applying blue Spotlight header to ${ids.length} investment-financing doc(s) in ${projectId}/${dataset}…`,
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
