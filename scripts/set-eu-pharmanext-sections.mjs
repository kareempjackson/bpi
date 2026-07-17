/**
 * Populates the "EU PharmaNext" initiative detail page below the header:
 *   1. "Why Barbados" + Ecosystem Approach — a pale-blue band with a heading
 *      and bullets, then a wide image sitting flush on a navy panel.
 *   2. "Current Status" + the closing "Next Steps" note, and the "Latest from
 *      BPI" blog closer under it.
 *
 * Real, editable CMS data — everything here can be changed in Studio →
 * Initiative.
 *
 * No section images are set, so both fall back to the cover image — an editor
 * can upload the real photos in Studio.
 *
 * Run:   node --env-file=.env.local scripts/set-eu-pharmanext-sections.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-eu-pharmanext-sections.mjs",
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

const SLUG = "eu-pharmanext";

const BULLETS = [
  "Geographic position: a central location serving CARICOM, Latin America, and transatlantic routes to Europe and North America",
  "Infrastructure foundation: the Port of Bridgetown is among the region’s leading container ports; Grantley Adams International Airport offers a long runway for cargo operations and direct routes to major hubs",
  "Trade framework: CARICOM integration and EU trade agreements provide duty-free and preferential market access",
  "Regulatory pathway: development of the Barbados Medical Products Authority (BMPA) with WHO/PAHO support, with EMA alignment pathways being explored",
  "Regional health coordination: PAHO’s regional public health hub for the Eastern Caribbean is based in Barbados",
];

const SECTION = {
  showWhyBarbados: true,
  whyBarbadosHeading: str("Why Barbados"),
  whyBarbadosBody: text(BULLETS.join("\n")),
  whyBarbadosCta: {
    _type: "cta",
    label: str("Partner With BPI"),
    href: "/contact",
  },
  ecosystemHeading: str("The Ecosystem Approach"),
  ecosystemBody: text(
    "Successful pharmaceutical ecosystems are typically built in phases, starting with foundational logistics (port, airport, warehousing, cold chain), moving into regional distribution, then higher-value activity like packaging and manufacturing, and eventually R&D and clinical trials. Infrastructure first, trust second, complexity last.",
  ),
  ecosystemCta: {
    _type: "cta",
    label: str("Partner With BPI"),
    href: "/contact",
  },

  // "Current Status" + the closing "Next Steps" note. `outlook*` is the large
  // italic note — NOT the `nextSteps*` bullets card PAHO/PVAC use.
  showCurrentStatus: true,
  currentStatusHeading: str("Current Status"),
  currentStatusLead: text(
    "As of June 2026, the IPBDO has established a presence in Brussels and initiated dialogue with European networks, identifying a pipeline of potential partners.",
  ),
  currentStatusBody: text(
    "Early engagement suggests mid-tier generics and API manufacturers are actively exploring emerging-market partnerships, regulatory environments are lowering entry barriers for new-geography manufacturers, and a phased infrastructure-first approach resonates with industry practitioners.",
  ),
  currentStatusPrimaryCta: {
    _type: "cta",
    label: str("Partner with us"),
    href: "/contact",
  },
  currentStatusSecondaryCta: {
    _type: "cta",
    label: str("Contact us"),
    href: "/contact",
  },
  outlookHeading: str("Next Steps"),
  outlookBody: text(
    "Qualify early partnerships, continue European engagement through conferences and institutional outreach, and work with government partners to strengthen port, airport, and regulatory infrastructure alongside institutional capacity building.",
  ),

  // "Latest from BPI" closes the page, under Current Status.
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
    `Applying the “Why Barbados” section to ${ids.length} EU PharmaNext doc(s) in ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set(SECTION));
  await tx.commit({ visibility: "async" });

  for (const id of ids) console.log(`  ✓ ${id}`);
  console.log("Done.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
