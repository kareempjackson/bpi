/**
 * Populates + enables the "Financing Approach" section on the AMA project:
 * a card in the page colour — heading left; body + button, a rule, an italic
 * quote and an attribution (name, role, social links) on the right.
 *
 * Gated by the `showFinancing` toggle, so this also flips it on. Editable in
 * Studio → Initiative → Financing Approach. The attribution photo
 * (`financingImage`) must be uploaded in Studio — scripts can't attach a local
 * asset — so add Leisel Juman's headshot there.
 *
 * Run:   node --env-file=.env.local scripts/set-ama-financing.mjs
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

const FINANCING_BODY =
  "BPI's blended financing strategy brings together development banks, governments, foundations, and private and domestic investors to mobilize capital at scale while reducing investment risk, combining concessional and commercial funding to improve project bankability.";

const FINANCING_QUOTE =
  "By partnering directly with the Government of Barbados and with support from the European Union, we are applying our global talent-sourcing and incubation model to a real-world public health challenge in an underrepresented population.";

const SOCIALS = [
  { kind: "Website", href: "#", label: "Website" },
  { kind: "LinkedIn", href: "#" },
  { kind: "X", href: "#" },
  { kind: "Instagram", href: "#" },
];

const PATCH = {
  showFinancing: true,
  financingHeading: str("Financing Approach"),
  financingBody: text(FINANCING_BODY),
  showFinancingCta: true,
  financingCta: { _type: "cta", label: str("Partner With BPI"), href: "/contact" },
  financingQuote: text(FINANCING_QUOTE),
  financingName: str("Leisel Juman"),
  financingRole: str("CEO, BioMed X"),
  financingSocials: SOCIALS.map((s, i) => ({
    _type: "socialLink",
    _key: `soc-${i}`,
    kind: s.kind,
    href: s.href,
    ...(s.label ? { label: s.label } : {}),
  })),
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
    `Setting Financing Approach on ${ids.length} AMA doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set(PATCH));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done. Add the attribution photo (financingImage) in Studio.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
