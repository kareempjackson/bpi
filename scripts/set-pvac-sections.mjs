/**
 * Populates the three PVAC detail-page sections under the Type 1 header, per
 * the design mock:
 *
 *   1. Partnership Overview  — "What This Is" retitled, `beside` layout (heading
 *                              left, italic lead right), no Key Metrics row.
 *   2. Key Actions Under the MOU
 *                            — "Key Developments" retitled, `noImage` layout
 *                              (heading left, bullets + button right).
 *   3. Timeline              — "Next Steps" retitled, bullets only (no button).
 *   4. Next Steps            — the Roadmap band (eyebrow + heading left; italic
 *                              statement, rule, navy button and a wide image
 *                              right), then "Latest from BPI" (showBlog).
 *
 * Real, editable CMS data — every heading, bullet and toggle here can be changed
 * in Studio → Initiative. Bullets are one per line; paragraphs are separated by
 * a blank line.
 *
 * Run:   node --env-file=.env.local scripts/set-pvac-sections.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-pvac-sections.mjs",
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

const SECTIONS = {
  // ── 1. Partnership Overview (white band) ──
  showWhatThisIs: true,
  whatThisIsLayout: "beside",
  whatThisIsHeading: str("Partnership Overview"),
  whatThisIsBody: text(
    "Since April 2025, BPI has been engaging with its Nigerian counterpart, the Presidential Initiative for Unlocking the Healthcare Value Chain (PVAC), established in 2023 with a broad mandate to accelerate local manufacturing and increase Nigeria's self-reliance. The partnership, formalized through an MOU signed in Abuja in November 2025, spans manufacturing, clinical trials, market access, and human capital.",
  ),

  // ── 2. Key Actions Under the MOU (pale-blue band) ──
  showDevelopments: true,
  developmentsLayout: "noImage",
  developmentsHeading: str("Key Actions Under the MOU"),
  developmentsBody: text(
    [
      "Developing a Barbados–Nigeria pharmaceutical skills pathway covering GMP, quality control, sterile manufacturing, and regulatory training",
      "Reciprocal market entry — CARICOM and LATAM access for Nigerian producers, ECOWAS and AfCFTA access for Barbados-based manufacturers",
      "Linking Barbados' clinical networks with Nigeria's National Clinical Trials Consortium",
      "Establishing a regulatory reliance agreement between NAFDAC and Barbados' medical products authority",
      "Joint financing on select projects with development finance institutions including Afreximbank, AfDB, and EIB",
    ].join("\n"),
  ),
  developmentsCta: {
    _type: "cta",
    label: str("Partner With BPI"),
    href: "/contact",
  },

  // ── 3. Timeline (navy card on the same pale-blue band) ──
  showNextSteps: true,
  showNextStepsCta: false,
  nextStepsHeading: str("Timeline"),
  nextStepsBody: text(
    [
      "July 2025 — BPI Deputy CEO meets PVAC's National Coordinator to set intention to collaborate",
      "August 2025 — PVAC presents to Senior Minister of Health and Wellness Jerome Walcott",
      "September 2025 — bilateral meeting between Barbados' Senior Minister and Nigeria's Coordinating Minister of Health, Muhammad Pate, on the sidelines of UNGA",
      "November 2025 — MOU signed in Abuja, led by Minister Walcott and hosted by Nigeria's Coordinating Minister of Health — covered as a landmark South–South partnership in media in both countries",
      "November 2025 — regulatory collaboration initiated between Barbados' interim medical products authority and NAFDAC (WHO Maturity Level 3)",
    ].join("\n"),
  ),

  // ── 4. Next Steps (the mid-blue Roadmap band) ──
  showRoadmap: true,
  roadmapEyebrow: str("What We Are Building"),
  roadmapHeading: str("Next Steps"),
  roadmapStatement: text(
    "A steering committee is finalising the implementation roadmap, with launch targeted for March 2026",
  ),
  roadmapCta: {
    _type: "cta",
    label: str("Partner With BPI"),
    href: "/contact",
  },

  // ── 5. Latest from BPI (shared blog bento) ──
  showBlog: true,
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
    `Applying PVAC sections to ${ids.length} doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  // No Key Metrics in the mock — clear any that were authored so the row can't
  // appear under the Partnership Overview lead.
  for (const id of ids) tx.patch(id, (p) => p.set(SECTIONS).unset(["keyMetrics"]));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
