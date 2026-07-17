/**
 * Populates + enables the Lenstec detail-page sections under the Type 4 header:
 *   - "What This Is"      → whatThisIsLayout "imageBeside" (deeper blue band:
 *                           heading top, image left, body + button right)
 *   - "Current Focus"     → the Key Developments section in "noImage" layout
 *                           (heading left, bullets + button right)
 *   - "Phased Approach"   → dark band: 3 phase cards (white/blue/green), a wide
 *                           image, then the Strategic Relevance statement
 *
 * The standard body/quote/why-matters blocks are switched off so the page runs
 * on these custom sections; the blog/careers/CTA closers stay on.
 *
 * Run:   node --env-file=.env.local scripts/set-lenstec-sections.mjs
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
const cta = (label, href) => ({ _type: "cta", label: str(label), href });

const SLUG = "lenstec";

const WHAT_BODY = [
  "BPI is supporting the early-stage market-entry scoping of Lenstec's ophthalmic lens portfolio in Nigeria, part of its wider mandate to advance Barbados' life sciences export potential and strengthen South-South health and trade cooperation. If successfully advanced, this could serve as an early proof of concept for a broader bi-directional life sciences trade corridor between Barbados, CARICOM, Nigeria, ECOWAS, and wider AfCFTA-linked markets.",
  "Nigeria represents one of Africa's largest healthcare markets, with significant unmet need in eye care. BPI and its partners are assessing how Lenstec's ophthalmic lens portfolio could be introduced through eye-care programmes, hospital groups, clinics, and distribution partners, subject to regulatory review, market validation, and commercial agreements.",
].join("\n\n");

const CURRENT_FOCUS = [
  "Reviewing the Lenstec product catalogue and market fit",
  "Mapping applicable Nigerian regulatory requirements",
  "Assessing distribution and partnership pathways",
  "Understanding clinical, procurement, and patient access channels",
].join("\n");

const PHASES = [
  {
    title: "Phase 1",
    body: "Scoping and market assessment product catalogue review, regulatory mapping, market survey, partner engagement.",
  },
  {
    title: "Phase 2",
    body: "Regulatory and partnership development subject to Phase 1 outcomes, may include product registration preparation and distribution discussions",
  },
  {
    title: "Phase 3",
    body: "Market-entry preparation subject to regulatory approval and commercial agreements, may progress toward launch through selected healthcare channels",
  },
];

const RELEVANCE =
  "If advanced, this initiative could demonstrate South-South trade in health and life sciences in practice, open new export pathways for Barbados-manufactured products, and strengthen cooperation between Caribbean and African health and manufacturing ecosystems.";

const PATCH = {
  // ── What This Is (image beside body) ──
  showWhatThisIs: true,
  whatThisIsLayout: "imageBeside",
  whatThisIsHeading: str("What This Is"),
  whatThisIsBody: text(WHAT_BODY),
  whatThisIsCta: cta("Partner With BPI", "/contact"),

  // ── Current Focus (Key Developments, no image) ──
  showDevelopments: true,
  developmentsLayout: "noImage",
  developmentsHeading: str("Current Focus"),
  developmentsBody: text(CURRENT_FOCUS),
  developmentsCta: cta("Partner With BPI", "/contact"),

  // ── Phased Approach + Strategic Relevance ──
  showPhases: true,
  phasesHeading: str("Phased Approach"),
  phases: PHASES.map((p, i) => ({
    _type: "phaseCard",
    _key: `phase-${i}`,
    title: str(p.title),
    body: text(p.body),
  })),
  relevanceHeading: str("Strategic Relevance"),
  relevanceBody: text(RELEVANCE),
  relevanceCta: cta("Partner With BPI", "/contact"),

  // Custom sections carry the page; keep the blog/careers/CTA closers.
  showDefaultSections: false,
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
    `Setting Lenstec sections on ${ids.length} doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set(PATCH));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
