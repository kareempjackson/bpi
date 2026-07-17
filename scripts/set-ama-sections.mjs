/**
 * Populates + enables the two toggleable initiative sections on the AMA project:
 *   - "What This Is" + Key Metrics (white band)
 *   - "Key Developments" (light-blue band: image + bullet list + button)
 *
 * Both are gated by their `show*` toggle, so this also flips them on. Editable
 * in Studio → Initiative → the two sections.
 *
 * Run:   node --env-file=.env.local scripts/set-ama-sections.mjs
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

const SLUG =
  "the-ama-project-the-first-africa-caribbean-pharmaceutical-trade-corridor";

const WHAT_BODY = [
  "A joint venture between BPI and AMA Medical Manufacturing, a Nigerian biopharmaceutical firm operating a state-of-the-art IV fluids production facility in Kaduna. Together we are developing a full-scale pharmaceutical manufacturing facility in Barbados, aiming to produce 12 million bags of IV fluids annually for domestic needs and export across CARICOM and the Global South.",
  "An MOU for the joint venture has been drafted and is pending signature, with a cabinet paper progressing through formal government review. Groundbreaking for the Barbados facility is scheduled for August 2026.",
].join("\n\n");

const METRICS = [
  { value: "$31.3m", label: "Strategic Partnerships" },
  { value: "25% share", note: "(30:70 equity/debt ratio)", label: "Projected Government of Barbados equity" },
  { value: "$29 million", label: "Projected foreign direct investment" },
  { value: "$127.8 million", label: "Projected joint revenue over 15 years:" },
  { value: "200+", label: "jobs created, scalable over time" },
];

const DEVELOPMENTS = [
  "Business case presented and endorsed by the Prime Minister",
  "Five-year concessions granted by the Ministry of Finance",
  "Afreximbank has expressed interest in financing the project",
  "AMA Barbados incorporated, planning process underway",
  "A landmark shipment of more than 47,000 bags of IV fluids arrived in Barbados from Lagos on April 2, 2026 — the first phase of AMA's Caribbean market entry",
  "A portion of that shipment was donated to the Queen Elizabeth Hospital in Barbados and to healthcare institutions in Jamaica — the first tangible delivery of the joint venture and the first AU–Caribbean pharmaceutical trade route shipment",
  "Distribution supported by The Aventa Group, the leading pharmaceutical distributor across the English- and Dutch-speaking Caribbean, operating in 23 territories",
  "Preliminary discussions underway with the Agostini Group of Trinidad and Tobago on a potential strategic investment",
].join("\n");

const PATCH = {
  showWhatThisIs: true,
  whatThisIsHeading: str("What This Is"),
  whatThisIsBody: text(WHAT_BODY),
  metricsHeading: str("Key Metrics"),
  keyMetrics: METRICS.map((m, i) => ({
    _type: "keyMetric",
    _key: `metric-${i}`,
    value: str(m.value),
    ...(m.note ? { note: str(m.note) } : {}),
    label: str(m.label),
  })),
  showDevelopments: true,
  developmentsHeading: str("Key Developments"),
  developmentsBody: text(DEVELOPMENTS),
  developmentsCta: { _type: "cta", label: str("Partner With BPI"), href: "/contact" },
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
    `Setting What-This-Is + Key Developments on ${ids.length} AMA doc(s) in ${projectId}/${dataset}…`,
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
