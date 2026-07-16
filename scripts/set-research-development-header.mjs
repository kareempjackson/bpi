/**
 * Applies the "blue" colour profile + Split header + hero buttons to the
 * Research & Development sector document, matching the approved mockup. Real,
 * editable CMS data (Studio → Sector → Header / Content).
 *
 * Same profile as market-access / workforce so the sectors read as one system;
 * the subtitle is updated to the mockup copy.
 *
 * Patches every doc matching slug `research-development` (published + any draft).
 *
 * Run:   node --env-file=.env.local scripts/set-research-development-header.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-research-development-header.mjs",
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
const text = (value) => [
  { _key: "en", _type: "internationalizedArrayTextValue", language: "en", value },
];

// Same blue profile as market-access / workforce.
const PROFILE = {
  headerLayout: "split",
  pageColor: "#0F3B75",
  heroHeadingColor: "#BBDAF7",
  sectionBgColor: "#E7F9FF",
  subtitle: text(
    "Establishing Barbados as a credible site for pharmaceutical R&D and technology transfer.",
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
    `*[_type == "sector" && slug.current == "research-development"]._id`,
  );

  if (!ids.length) {
    console.error(
      "No sector with slug 'research-development' found. Seed it first: node --env-file=.env.local scripts/seed-sectors.mjs",
    );
    process.exit(1);
  }

  console.log(
    `Applying blue profile to ${ids.length} research-development doc(s) in ${projectId}/${dataset}…`,
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
