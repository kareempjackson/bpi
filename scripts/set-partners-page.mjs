/**
 * Seeds the partnersPage singleton with the launch header copy for /partners.
 * The centre photo is left empty so the hero falls back to a Home photo until a
 * specific shot is uploaded in Studio → Partners page → Hero → Centre image.
 *
 * Idempotent — creates the singleton if missing, then sets its fields.
 *
 * Run:   node --env-file=.env.local scripts/set-partners-page.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-partners-page.mjs",
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

const card = (key, { title, description, tone }) => ({
  _key: key,
  _type: "partnerCard",
  title: str(title),
  description: text(description),
  tone,
});

const FIELDS = {
  seoTitle: str("Partners — BPI"),
  seoDescription: text(
    "Building the Caribbean's pharmaceutical gateway takes more than one institution. Here's who BPI is building it with.",
  ),
  heroHeading: str("Partners"),
  heroBody: text(
    "Building the Caribbean's pharmaceutical gateway takes more than one institution. Here's who BPI is building it with.",
  ),
  heroCta: { _type: "cta", label: str("Partner With BPI"), href: "/contact" },

  partnerGroups: [
    {
      _key: "industry-manufacturing",
      _type: "partnerGroup",
      layout: "cards",
      eyebrow: str("What We Are Building"),
      headingLead: str("Industry"),
      headingTrail: str("& Manufacturing"),
      cards: [
        card("ama", {
          title: "AMA Medical Manufacturing (Nigeria)",
          description:
            "An established Nigerian manufacturer with GMP-compliant operations and a rapidly expanding product portfolio",
          tone: "white",
        }),
        card("lenstec", {
          title: "Lenstec",
          description: "A Barbados-based manufacturer of ophthalmic lenses",
          tone: "blue",
        }),
        card("neopharm", {
          title: "Neopharm Labs (Quebec, Canada)",
          description: "A Canadian industry leader of more than 30 years",
          tone: "green",
        }),
        card("aventa", {
          title: "The Aventa Group",
          description:
            "The leading pharmaceutical and healthcare distributor across the English- and Dutch-speaking Caribbean, with operations spanning 23 territories",
          tone: "blue",
        }),
      ],
    },
    {
      _key: "government-regulatory",
      _type: "partnerGroup",
      layout: "list",
      headingLead: str("Government"),
      headingTrail: str("& Regulatory"),
      cards: [
        card("pvac", {
          title: "PVAC (Nigeria)",
          description:
            "the Presidential Initiative for Unlocking the Healthcare Value Chain, established in 2023, with a broad mandate that includes accelerating local manufacturing to increase self-reliance",
          tone: "white",
        }),
        {
          _key: "tbc-2",
          _type: "partnerCard",
          title: str("To be confirmed"),
          tone: "white",
        },
        {
          _key: "tbc-3",
          _type: "partnerCard",
          title: str("To be confirmed"),
          tone: "white",
        },
        {
          _key: "tbc-4",
          _type: "partnerCard",
          title: str("To be confirmed"),
          tone: "white",
        },
      ],
      cta: { _type: "cta", label: str("Partner With BPI"), href: "/contact" },
    },
    {
      _key: "multilateral-development",
      _type: "partnerGroup",
      layout: "panel",
      headingLead: str("Multilateral & Development"),
      cta: { _type: "cta", label: str("Partner With BPI"), href: "/contact" },
      secondaryCta: {
        _type: "cta",
        label: str("Explore Our Impact"),
        href: "/impact",
      },
      cards: [
        card("paho", {
          title: "PAHO",
          description:
            "BPI has initiated a Regional Health Supply Hub feasibility pathway with PAHO",
          tone: "green",
        }),
        card("eu-biopark", {
          title: "EU / BioPark Charleroi (Belgium)",
          description:
            "a joint effort between the EU, Guyana, and Barbados to support national and regional investment and research for health resilience",
          tone: "green",
        }),
        card("afreximbank", {
          title: "Afreximbank",
          description:
            "joint financing on select projects, alongside other development finance institutions including AfDB and EIB",
          tone: "green",
        }),
        card("who-carpha-iadb", {
          title: "WHO, CARPHA, IADB",
          description:
            "confirmed as partners across other page drafts, descriptions pending BPI approval",
          tone: "green",
        }),
      ],
    },
    {
      _key: "academic-workforce",
      _type: "partnerGroup",
      layout: "feature",
      eyebrow: str("Barbados Pharmaceuticals Inc."),
      headingLead: str("Academic"),
      headingTrail: str("& Workforce"),
      cards: [
        card("empower-swiss", {
          title: "Empower Swiss SARL / UNITAR",
          description:
            "partnering to build Caribbean pharmaceutical workforce capabilities through digital training and manufacturing academies, using health workforce strengthening tools deployed across 30+ countries",
          tone: "white",
        }),
      ],
    },
    {
      _key: "ecosystem-innovation",
      _type: "partnerGroup",
      layout: "split",
      headingLead: str("Ecosystem & Innovation"),
      cards: [
        card("island-innovators", {
          title: "Island Innovators:",
          description:
            "a purpose-driven regional network committed to strengthening the Caribbean's ecosystem of founders, creators, executives, and professionals",
          tone: "white",
        }),
      ],
      cta: { _type: "cta", label: str("Partner With us"), href: "/contact" },
      secondaryCta: {
        _type: "cta",
        label: str("Contact us"),
        href: "/contact",
      },
    },
  ],
};

async function run() {
  console.log(`Seeding partnersPage singleton in ${projectId}/${dataset}…`);
  await client.createIfNotExists({ _id: "partnersPage", _type: "partnersPage" });
  await client.patch("partnersPage").set(FIELDS).commit({ visibility: "async" });
  console.log("  ✓ partnersPage");
  console.log("Done. /partners now reads its header from Sanity.");
}

run().catch((err) => {
  console.error("\n✗ Failed:");
  console.error(err);
  process.exit(1);
});
