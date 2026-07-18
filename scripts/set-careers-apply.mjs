/**
 * Seeds the "How You'll Apply" section on the careersPage singleton, as real
 * (editable) CMS data. Shown above the jobs list.
 *
 * Same fields any editor can change in Studio → Careers page → How you'll apply.
 * Idempotent.
 *
 * Run:   node --env-file=.env.local scripts/set-careers-apply.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-careers-apply.mjs",
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

const FIELDS = {
  applyHeading: str("How You'll Apply"),
  applyBody: text(
    "Every application goes through BPI's HIOFU-powered Skills Passport, which allows candidates to be evaluated on verified skills and demonstrated capabilities rather than on a CV alone. Your completed Skills Passport is used only to evaluate you for the role you've applied to, and stays in our talent network for future opportunities at BPI and within the BPI ecosystem, if you choose to opt in.",
  ),
};

async function run() {
  console.log(`Seeding careers "How You'll Apply" in ${projectId}/${dataset}…`);
  await client.createIfNotExists({ _id: "careersPage", _type: "careersPage" });
  await client.patch("careersPage").set(FIELDS).commit({ visibility: "async" });
  console.log("  ✓ careersPage");
  console.log("Done. The 'How You'll Apply' section now renders above the jobs list.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
