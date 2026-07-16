/**
 * Applies the "blue" colour profile + Showcase header to the Innovation &
 * Technology sector document, as real (editable) CMS data — matching the
 * approved mockup (light-blue title anchored bottom-left, tall image on the
 * right, navy canvas).
 *
 * These are the same fields any editor can now change in Studio → Sector →
 * Header. This script just seeds innovation-technology so it matches the mockup
 * out of the box. Re-runnable (idempotent set()).
 *
 * Leaves no header CTAs (the mockup shows none). Patches every document matching
 * slug `innovation-technology` (published + any draft) so the change shows
 * whether or not the doc is currently being edited.
 *
 * Run:   node --env-file=.env.local scripts/set-innovation-technology-header.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-innovation-technology-header.mjs",
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

// ── The blue colour profile + Showcase layout ────────────────────────────────
const PROFILE = {
  headerLayout: "showcase",
  pageColor: "#0F3B75", // navy header / footer background
  heroHeadingColor: "#BBDAF7", // light-blue title accent
  sectionBgColor: "#E7F9FF", // light-blue canvas — matches the blue-tone blocks
};

// The mockup shows no header buttons; clear any seeded ones.
const UNSET = ["heroPrimaryCta", "heroSecondaryCta"];

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
    `Applying blue Showcase profile to ${ids.length} innovation-technology doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set(PROFILE).unset(UNSET));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
