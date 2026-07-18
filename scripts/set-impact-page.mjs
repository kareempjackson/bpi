/**
 * Seeds the impactPage singleton with the launch copy for /impact, as real
 * (editable) CMS data. Photography is left empty so the page falls back to the
 * Home page's editor-managed photos until specific shots are uploaded in
 * Studio → Impact page.
 *
 * Idempotent — creates the singleton if missing, then patches its fields.
 *
 * Run:   node --env-file=.env.local scripts/set-impact-page.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-impact-page.mjs",
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

const block = (key, { heading, body, highlight }) => ({
  _key: key,
  _type: "trajectoryBlock",
  heading: str(heading),
  body: text(body),
  highlight: !!highlight,
});

const FIELDS = {
  seoTitle: str("Impact — BPI"),
  seoDescription: text(
    "Behind every prescription filled in the Caribbean is a supply chain that starts an ocean away. BPI is building the infrastructure of care to change that.",
  ),

  heroHeading: str("Impact"),
  heroBody: text(
    "There is a woman at a polyclinic pharmacy right now, waiting for the metformin that keeps her diabetes manageable and the amlodipine that keeps her blood pressure from killing her. She does not know that every tablet was made thousands of miles away, shipped across an ocean, and could be stopped at any border, at any time.",
  ),
  heroCta: { _type: "cta", label: str("Partner With BPI"), href: "/contact" },

  whyEyebrow: str("What We Are Building"),
  whyHeadingLead: str("Why This"),
  whyHeadingTrail: str("Matters"),
  whyBody: text(
    "Hypertension and diabetes are the largest share of the Barbados Drug Service's prescription mix. She is not a statistic. She is the entire point of what BPI is building.\n\n97% of Caribbean medicines are imported. One conflict. One shipping disruption. One policy shift, and patients go without.",
  ),
  whyQuote: text(
    "We know what it was to have put in orders and paid, and then to be told that the equipment and the ventilators would no longer be delivered because there were export prohibitions under the laws of other countries…",
  ),
  whyAttributionName: str("Prime Minister Mia Mottley"),
  whyAttributionDate: str("November 2023"),

  trajectoryBlocks: [
    block("dependency", {
      heading: "What Dependency Looks Like in Practice",
      body: "Today, no facility with this capacity exists in Barbados, and local manufacturers must send products overseas for testing, a gap in the region's pharmaceutical infrastructure that adds cost, time, and risk to every product that reaches a patient.",
      highlight: false,
    }),
    block("changing", {
      heading: "What's Already Changing",
      body: "On April 16, 2026, Queen Elizabeth Hospital received a donation of 2,553 cartons of IV fluids, manufactured in Nigeria by AMA Medical Manufacturing. It was BPI's first tangible delivery, and the first shipment along the AU–Caribbean pharmaceutical trade route. The long-term goal: a facility in Barbados producing 12 million IV bags a year, for domestic supply and export across CARICOM and the Global South.",
      highlight: true,
    }),
    block("forward", {
      heading: "The Path Forward",
      body: "By 2035, Barbados will be the trusted pharmaceutical manufacturing gateway for the Caribbean and the Global South: producing medicines here, distributing them regionally, and building the institutions that make it permanent, fostering deeper South–South cooperation and increasing access to essential medicines at affordable prices.",
      highlight: false,
    }),
  ],
};

async function run() {
  console.log(`Seeding impactPage singleton in ${projectId}/${dataset}…`);
  // Ensure the singleton exists, then set the fields (idempotent).
  await client.createIfNotExists({ _id: "impactPage", _type: "impactPage" });
  await client
    .patch("impactPage")
    .set(FIELDS)
    .commit({ visibility: "async" });
  console.log("  ✓ impactPage");
  console.log("Done. /impact now reads its copy from Sanity.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
