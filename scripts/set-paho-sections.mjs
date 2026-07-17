/**
 * Populates + enables the toggleable initiative sections on the PAHO Regional
 * Supply Hub project:
 *   - "Project Aim" (white band — the What This Is section, retitled)
 *   - "Key Developments" (light-blue band, "heading beside bullets, image
 *     below" layout: heading left, bullets + button right, wide image under)
 *   - "Next Steps" (navy card docked under the Key Developments image)
 *   - "Latest from BPI" (the showBlog bento, above the Careers closer)
 *
 * All are gated by their `show*` toggle, so this also flips them on. No key
 * metrics — the cost envelope reads inside the Project Aim copy instead.
 *
 * No developmentsImage is set, so the wide image falls back to the Home
 * building photo — an editor can upload the real one in Studio.
 *
 * Run:   node --env-file=.env.local scripts/set-paho-sections.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-paho-sections.mjs",
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

const AIM_BODY =
  "To position Barbados as a distribution hub for more than 40 countries across the Caribbean and Latin America, supplying essential medicines and medical devices procured through the PAHO Revolving Fund. Project cost envelope: USD $7–7.5 million.";

const DEVELOPMENTS = [
  "A PAHO mission assessed Barbados' suitability to host a Regional Supplies Hub (July 2025), aiming to reduce member states' logistics costs and lead times, with the hub's first focus on vaccine stockpiling",
  "A full technical assessment was completed and presented to the Ministry of Health and Wellness (December 2025), finding Barbados has the political will and geographic/infrastructure advantages needed",
  "Environmental projections: 83–89% reduction in emissions through shipment consolidation (from 221 shipments annually down to 19–38)",
  "The Newton Life Sciences Hub site, with construction targeted for completion in Q1 2026, is the leading candidate location",
].join("\n");

const NEXT_STEPS = [
  "Cabinet endorsement of the hub concept, financing, and location",
  "Securing financing for a proposed 100 m² warehouse with cold/ultra-cold storage, digital stock systems, and bonded/free trade zone status — exploring funding from PAHO, the Barbados government, and the Inter-American Development Bank",
  "A project management team spanning PAHO, BPI, and the Barbados government is already examining governance, liability, procurement cycles, and harmonized regulation",
].join("\n");

const PATCH = {
  showWhatThisIs: true,
  whatThisIsHeading: str("Project Aim"),
  whatThisIsBody: text(AIM_BODY),
  keyMetrics: [],
  showDevelopments: true,
  developmentsLayout: "imageBelow",
  developmentsHeading: str("Key Developments"),
  developmentsBody: text(DEVELOPMENTS),
  developmentsCta: { _type: "cta", label: str("Partner With BPI"), href: "/contact" },
  showNextSteps: true,
  nextStepsHeading: str("Next Steps"),
  nextStepsBody: text(NEXT_STEPS),
  nextStepsCta: { _type: "cta", label: str("Partner With BPI"), href: "/contact" },
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
    `Setting Project Aim + Key Developments + Next Steps + blog on ${ids.length} PAHO doc(s) in ${projectId}/${dataset}…`,
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
