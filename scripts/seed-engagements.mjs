/**
 * Seeds the engagement grid on /events — external events BPI attends (no
 * Eventbrite, no tickets), authored as `engagement` documents.
 *   • Past-dated entries land under "Where we've been" (the wireframe recap:
 *     WHA79, Nigeria Mission, …).
 *   • Future-dated entries land under "Events we're attending next" and carry a
 *     one-line `purpose` ("why we're there").
 * The page files each entry by date automatically.
 *
 * Deterministic _ids → re-running updates in place rather than duplicating.
 * IDs are dot-free on purpose: Sanity only serves documents whose _id contains
 * a "." to authenticated requests, so a dotted id (engagement.wha79) is
 * invisible to the site's public, token-less reads. Hyphens keep them public.
 *
 * Run:   node --env-file=.env.local scripts/seed-engagements.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/seed-engagements.mjs",
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

/** Wrap a plain English string as an internationalizedArrayString value. */
const str = (value) => [
  {
    _key: "en",
    _type: "internationalizedArrayStringValue",
    language: "en",
    value,
  },
];

/** Wrap a plain English string as a single-paragraph WYSIWYG (portable text). */
const pt = (value) => [
  {
    _key: "en",
    _type: "internationalizedArrayPortableTextValue",
    language: "en",
    value: [
      {
        _type: "block",
        _key: "b0",
        style: "normal",
        markDefs: [],
        children: [{ _type: "span", _key: "b0s0", text: value, marks: [] }],
      },
    ],
  },
];

/**
 * Past engagements → "Where we've been" (matches the wireframe recap grid).
 * No purpose line.
 */
const PAST = [
  { id: "wha79", name: "WHA79", location: "Geneva", date: "2026-05-18" },
  { id: "nigeria-mission", name: "Nigeria Mission", location: "Abuja", date: "2026-03-10" },
  {
    id: "biosimilar-medicines",
    name: "BioSimilar Medicines Conference",
    location: "Amsterdam",
    date: "2026-04-15",
  },
  { id: "medicines-for-europe", name: "Medicines for Europe", location: "Athens", date: "2025-06-12" },
  { id: "regulatory-workshop", name: "Regulatory Workshop", location: "Guyana", date: "2025-11-05" },
  {
    id: "study-tour-vaxthera",
    name: "Study Tour",
    location: "VaxThera, Colombia",
    date: "2026-02-20",
  },
];

/**
 * Future engagements → "Events we're attending next". Each carries a one-line
 * purpose. Dates are a few months out; they self-file into the recap once past.
 */
const UPCOMING = [
  {
    id: "world-health-summit",
    name: "World Health Summit",
    location: "Berlin",
    date: "2026-10-12",
    purpose: "Advancing Caribbean access to essential, affordable medicines.",
  },
  {
    id: "cphi-worldwide",
    name: "CPHI Worldwide",
    location: "Frankfurt",
    date: "2026-11-03",
    purpose: "Meeting API suppliers and manufacturing partners.",
  },
  {
    id: "africa-pharma-week",
    name: "Africa Pharma Week",
    location: "Cape Town",
    date: "2026-09-22",
    purpose: "Building South–South pharmaceutical supply partnerships.",
  },
];

const docs = [
  ...PAST.map((e) => ({
    _id: `engagement-${e.id}`,
    _type: "engagement",
    name: str(e.name),
    location: str(e.location),
    date: e.date,
  })),
  ...UPCOMING.map((e) => ({
    _id: `engagement-${e.id}`,
    _type: "engagement",
    name: str(e.name),
    location: str(e.location),
    date: e.date,
    purpose: pt(e.purpose),
  })),
];

async function run() {
  const tx = docs.reduce((t, doc) => t.createOrReplace(doc), client.transaction());
  await tx.commit();
  console.log(
    `Seeded ${docs.length} engagements into "${dataset}":\n` +
      docs.map((d) => `  • ${d.name[0].value} — ${d.location[0].value}`).join("\n"),
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
