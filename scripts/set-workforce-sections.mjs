/**
 * Adds the Quote spotlight, In Motion, and Careers + Call-to-action page
 * sections to the Workforce & Talent Development sector document, as real
 * (editable) CMS data. Page order: In Practice → Quote → In Motion → Careers → CTA.
 *
 * - Quote: "Investment Incentives" / Jerome Walcott (portrait falls back to the
 *   Home leader photo).
 * - In Motion: light tone, the three workforce initiatives.
 * - Careers + CTA: standard closing blocks on the "blue" tone.
 *
 * Patches every doc matching slug `workforce` (published + any draft).
 *
 * Run:   node --env-file=.env.local scripts/set-workforce-sections.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-workforce-sections.mjs",
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
const cta = (label, href) => ({ _type: "cta", label: str(label), href });

// ── Quote spotlight ──────────────────────────────────────────────────────────
const QUOTE_BODY =
  "Barbados subsequently adopted a strategic approach to developing its pharmaceutical industry. The establishment of Barbados Pharmaceutical Inc. was another key step in preparing the country for eventual manufacturing activity.";

// ── In Motion ────────────────────────────────────────────────────────────────
const MOTION_ITEMS = [
  {
    title: "Institutional Development Plan",
    body: "A workforce and competency plan built using WHO frameworks to structure training across the emerging sector.",
  },
  {
    title: "Regional education partnerships",
    body: "Curriculum and credentialing pathways developed with universities and TVET institutions across CARICOM.",
  },
  {
    title: "GMP training programs",
    body: "Specialist Good Manufacturing Practice training tied to the first manufacturing facilities coming online.",
  },
];

// ── Closing blocks (blue tone) ───────────────────────────────────────────────
const CAREERS = {
  _type: "careersSection",
  _key: "careers-1",
  enabled: true,
  eyebrow: str("Join the team"),
  heading: str("Help build the architecture of care"),
  lead: text(
    "We are assembling the people who will make Caribbean pharmaceutical sovereignty real.",
  ),
  body: text(
    "From manufacturing and quality control to regulatory affairs and partnerships, BPI is hiring across the disciplines that turn dependence into capacity.",
  ),
  primaryCta: cta("See open roles", "/careers"),
  secondaryCta: cta("Contact BPI", "/contact"),
  tone: "blue",
};

const CALL_TO_ACTION = {
  _type: "ctaSection",
  _key: "cta-1",
  enabled: true,
  heading: str("Ready to build with us?"),
  body: text(
    "Whether you are an investor, manufacturer, or partner, BPI can open a direct route into the Caribbean pharmaceutical market. Let's talk about where you fit.",
  ),
  primaryCta: cta("Become an Investor", "/investors"),
  secondaryCta: cta("Contact BPI", "/contact"),
  tone: "blue",
};

const PATCH = {
  // Quote
  showQuote: true,
  quoteEyebrow: str("What We Are Building"),
  quoteHeading: str("Investment Incentives"),
  quoteLead: text(QUOTE_BODY),
  quoteText: text(QUOTE_BODY),
  quoteAttribution: str("Jerome Walcott"),
  quoteRole: str("Senior Minister"),
  // In Motion
  showMotion: true,
  motionHeading: str("In Motion"),
  motionTone: "light",
  motionItems: MOTION_ITEMS.map((it, i) => ({
    _type: "motionItem",
    _key: `motion-${i}`,
    title: str(it.title),
    body: text(it.body),
  })),
  // Closing page sections
  pageSections: [CAREERS, CALL_TO_ACTION],
};

async function run() {
  const ids = await client.fetch(
    `*[_type == "sector" && slug.current == "workforce"]._id`,
  );

  if (!ids.length) {
    console.error("No sector with slug 'workforce' found.");
    process.exit(1);
  }

  console.log(
    `Adding Quote + In Motion + Careers + CTA to ${ids.length} workforce doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) {
    tx.patch(id, (p) => p.set(PATCH).unset(["motionCta", "motionImage"]));
  }
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
