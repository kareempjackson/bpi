/**
 * The /sectors page ends with an editor-managed `careersSection` block whose
 * copy is authored but whose media slot was left empty — so the CareersSection
 * band rendered with a blank left panel, unlike the Home page's careers CTA
 * (which shows the careers image). This copies the Home document's `careersImage`
 * into the Sectors careersSection block's `media` field so the two match.
 *
 * Idempotent: re-running just re-sets the same media.
 *
 * Run:   node --env-file=.env.local scripts/set-sectors-careers-media.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-sectors-careers-media.mjs",
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const home = await client.fetch(`*[_type=="homePage"][0]{ careersImage }`);
if (!home?.careersImage) {
  console.error("Home page has no careersImage to copy. Aborting.");
  process.exit(1);
}

const sectors = await client.fetch(
  `*[_type=="sectorsPage"][0]{ _id, pageSections[_type=="careersSection"][0]{ _key } }`,
);
const key = sectors?.pageSections?._key;
if (!sectors?._id || !key) {
  console.error("No careersSection block found on the Sectors page. Aborting.");
  process.exit(1);
}

await client
  .patch(sectors._id)
  .set({ [`pageSections[_key=="${key}"].media`]: home.careersImage })
  .commit();

console.log(
  `✓ Set media on Sectors careersSection block "${key}" (dataset: ${dataset}) to Home's careersImage.`,
);
