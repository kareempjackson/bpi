/**
 * Applies the "blue" colour profile + Split header + hero buttons to the
 * Regulatory Development & Policy sector document, matching the approved
 * mockup — and clears every content section below the header so the page
 * renders the header only. Real, editable CMS data (Studio → Sector).
 *
 * Same profile as market-access / research-development / workforce so the
 * sectors read as one system; the subtitle is the mockup copy.
 *
 * - Header:   split layout, blue profile, subtitle, two hero CTAs.
 * - Content:  every section toggle off + the seeded content unset, incl. the
 *             bottom modular page sections.
 *
 * Patches every doc matching slug `regulatory-policy` (published + any draft).
 * Re-runnable (idempotent set()/unset()).
 *
 * Run:   node --env-file=.env.local scripts/set-regulatory-policy-header.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-regulatory-policy-header.mjs",
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

// ── Header: same blue profile as market-access / research-development ─────────
const PROFILE = {
  headerLayout: "split",
  pageColor: "#0F3B75", // navy header / footer background
  heroHeadingColor: "#BBDAF7", // light-blue title + primary button accent
  sectionBgColor: "#E7F9FF", // light-blue canvas
  subtitle: text(
    "Building the regulatory framework and policy architecture the Caribbean pharmaceutical sector needs.",
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

// ── Content: every section off, header untouched ─────────────────────────────
const TOGGLES_OFF = {
  showOverview: false,
  showPractice: false,
  showHighlight: false,
  showCapabilities: false,
  showStats: false,
  showQuote: false,
  showMotion: false,
};

const UNSET = [
  "overviewHeading",
  "overviewBody",
  "practiceHeading",
  "practiceLead",
  "practiceBody",
  "practiceListHeading",
  "practiceList",
  "practiceCreatesLabel",
  "practiceCreatesStatement",
  "practicePrimaryCta",
  "practiceSecondaryCta",
  "practiceImage",
  "highlightHeading",
  "highlightBody",
  "highlightStatement",
  "highlightImage",
  "capabilitiesHeading",
  "capabilities",
  "statsHeading",
  "stats",
  "quoteEyebrow",
  "quoteHeading",
  "quoteLead",
  "quoteText",
  "quoteAttribution",
  "quoteRole",
  "quotePortrait",
  "motionHeading",
  "motionTone",
  "motionCta",
  "motionImage",
  "motionItems",
  "pageSections",
];

async function run() {
  const ids = await client.fetch(
    `*[_type == "sector" && slug.current == "regulatory-policy"]._id`,
  );

  if (!ids.length) {
    console.error(
      "No sector with slug 'regulatory-policy' found. Seed it first: node --env-file=.env.local scripts/seed-sectors.mjs",
    );
    process.exit(1);
  }

  console.log(
    `Applying blue header + clearing sections on ${ids.length} regulatory-policy doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) {
    tx.patch(id, (p) => p.set({ ...PROFILE, ...TOGGLES_OFF }).unset(UNSET));
  }
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done. Page now renders the header only.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
