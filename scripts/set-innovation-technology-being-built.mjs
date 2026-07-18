/**
 * Seeds the "Being Built" section on the Innovation & Technology sector
 * document, as real (editable) CMS data — an eyebrow, three pipeline items, and
 * the Partner With BPI / Contact us buttons (image falls back to a Home photo
 * until an editor uploads a specific one).
 *
 * These are the same fields any editor can change in Studio → Sector → Being
 * built. Re-runnable (idempotent set()).
 *
 * Patches every document matching slug `innovation-technology` (published + any
 * draft) so the change shows whether or not the doc is currently being edited.
 *
 * Run:   node --env-file=.env.local scripts/set-innovation-technology-being-built.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-innovation-technology-being-built.mjs",
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

// English i18n wrappers — headings/eyebrow/CTAs stored as `string`, subtitle +
// caption as `text` (see sanity/schemaTypes/documents/sector.ts).
const str = (value) => [
  { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value },
];
const text = (value) => [
  { _key: "en", _type: "internationalizedArrayTextValue", language: "en", value },
];

const item = (key, { heading, subtitle, body }) => ({
  _key: key,
  _type: "beingBuiltItem",
  ...(heading ? { heading: str(heading) } : {}),
  ...(subtitle ? { subtitle: text(subtitle) } : {}),
  ...(body ? { body: text(body) } : {}),
});

const BEING_BUILT = {
  showBeingBuilt: true,
  beingBuiltEyebrow: str("Being Built"),
  beingBuiltItems: [
    item("wipo", {
      heading: "WIPO Technology and Innovation Support Centre",
      body: "in development at UWI Cave Hill, providing freedom-to-operate analysis and patent guidance for pharmaceutical developers",
    }),
    item("stability", {
      heading: "Stability Testing Infrastructure",
      subtitle:
        "planned ICH Zone IVb-compliant testing capacity for Caribbean climatic conditions",
    }),
    item("bioequivalence", {
      body: "Regional Bioequivalence Centre — planned, addressing a current gap where no bioequivalence testing exists anywhere in the Caribbean",
    }),
  ],
  beingBuiltPrimaryCta: {
    _type: "cta",
    label: str("Partner With BPI"),
    href: "/contact",
  },
  beingBuiltSecondaryCta: {
    _type: "cta",
    label: str("Contact us"),
    href: "/contact",
  },
};

async function run() {
  const ids = await client.fetch(
    `*[_type == "sector" && slug.current == "innovation-technology"]._id`,
  );

  if (!ids.length) {
    console.error(
      "No sector with slug 'innovation-technology' found. Seed it first: node --env-file=.env.local scripts/seed-sectors.mjs",
    );
    process.exit(1);
  }

  console.log(
    `Seeding "Being Built" on ${ids.length} innovation-technology doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set(BEING_BUILT));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done. The 'Being Built' section now renders on the page.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
