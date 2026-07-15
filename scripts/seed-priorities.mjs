/**
 * Seeds the four Strategic Priority documents so /priorities links to real
 * detail pages (/priorities/[slug]) and editors have a starting point to
 * customize.
 *
 * - No image uploads: heroImage is left empty so each detail hero falls back to
 *   the Home document's narrative (team) image.
 * - Localized fields are written in the internationalized-array shape the
 *   `sanity-plugin-internationalized-array` plugin stores (see
 *   scripts/migrate-i18n.mjs), so they work on the already-migrated dataset.
 *
 * Idempotent: fixed _ids + createOrReplace, so re-runs update in place.
 *
 * Run:   node --env-file=.env.local scripts/seed-priorities.mjs
 * Clean: node --env-file=.env.local scripts/seed-priorities.mjs --clean
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/seed-priorities.mjs",
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

// ── i18n wrappers (English) ───────────────────────────────────────────────────
const i18n = (kind, value) => [
  {
    _key: "en",
    _type: `internationalizedArray${kind}Value`,
    language: "en",
    value,
  },
];
const str = (value) => i18n("String", value);
const text = (value) => i18n("Text", value);

// ── content ────────────────────────────────────────────────────────────────────
const PAGE_COLOR = "#0B2F64";

const PRIORITIES = [
  {
    slug: "attract-facilitate-investment",
    order: 1,
    title: "Attract & Facilitate Investment",
    subtitle:
      "Giving global capital a clear pathway into the Caribbean pharmaceutical market.",
    // Overview is turned off here — the "in practice" statement carries this
    // page's narrative instead.
    showOverview: false,
    overviewHeading: "A clear pathway for capital",
    overviewBody:
      "BPI acts as a state-backed partner and equity co-investor, de-risking land, regulatory pathways, financing, and market entry so international investors can move into a fast-diversifying regional pharmaceutical industry with confidence.",
    quote: {
      eyebrow: "What We Are Building",
      heading: "Investment Incentives",
      lead: "Barbados subsequently adopted a strategic approach to developing its pharmaceutical industry. The establishment of Barbados Pharmaceutical Inc. was another key step in preparing the country for eventual manufacturing activity.",
      quote:
        "Barbados subsequently adopted a strategic approach to developing its pharmaceutical industry. The establishment of Barbados Pharmaceutical Inc. was another key step in preparing the country for eventual manufacturing activity.",
      name: "Jerome Walcott",
      role: "Senior Minister",
    },
    practice: {
      eyebrow: "What This Looks Like In Practice",
      statementLead:
        "BPI facilitates land access, coordinates regulatory approval, opens regional market entry, and manages government engagement so that",
      statementHighlight:
        "pharmaceutical investment has a direct route into Barbados",
      statementTrail: "and the wider Caribbean.",
      body: "BPI acts as the connective layer between global capital looking for a foothold in the Caribbean pharmaceutical sector and the government and regulatory processes that make that foothold real. Through a catalytic project incubator model, BPI moves opportunities from initial investment interest to tangible impact on the ground, working alongside investors, manufacturers, and partners at every stage.",
      primaryCta: { label: "Become an Investor", href: "/investors" },
      secondaryCta: { label: "Research and publication", href: "/reports" },
    },
    // Optional modular blocks shown under the quote (editors add/remove/reorder
    // these in the "Page sections" tab).
    cta: {
      heading: "Ready to build with us?",
      body: "Whether you are an investor, manufacturer, or partner, BPI can open a direct route into the Caribbean pharmaceutical market. Let's talk about where you fit.",
      primaryCta: { label: "Become an Investor", href: "/investors" },
      secondaryCta: { label: "Contact BPI", href: "/contact" },
    },
    careers: {
      eyebrow: "Join the team",
      heading: "Help build the architecture of care",
      lead: "We are assembling the people who will make Caribbean pharmaceutical sovereignty real.",
      body: "From manufacturing and quality control to regulatory affairs and partnerships, BPI is hiring across the disciplines that turn dependence into capacity.",
      primaryCta: { label: "See open roles", href: "/careers" },
      secondaryCta: { label: "Contact BPI", href: "/contact" },
    },
    motion: {
      heading: "In Motion",
      items: [
        {
          title: "PAHO Regional Supply Hub",
          body: "positioning Barbados as a distribution anchor for essential medicines and medical devices to more than 40 countries across the Caribbean and Latin America",
        },
        {
          title: "Neopharm QC Laboratory",
          body: "in active discussion with Neopharm Labs, a 30-year Canadian industry leader, to establish a pharmaceutical quality control testing laboratory in Barbados",
        },
        {
          title: "EU PharmaNext",
          body: "establishing an Investment Promotion and Business Development Office in BioPark Charleroi, Belgium, to connect European research, trade, and investment networks to Barbados",
        },
      ],
    },
  },
  {
    slug: "build-incubate-capacity",
    order: 2,
    title: "Build & Incubate Capacity",
    subtitle:
      "Standing up the manufacturing, testing, and regulatory capabilities the region has always had to import.",
    // Feature-statement hero (header style 2): title as eyebrow, big italic-
    // accented statement, full-bleed image (falls back to a Home photo).
    hero: {
      layout: "feature",
      headlineLead: "Taking pharmaceutical",
      headlineEmphasis: "projects from concept",
      headlineTrail: "to bankability to execution.",
    },
    // Overview is off here — the "practice detail" section carries the narrative.
    showOverview: false,
    overviewHeading: "Capabilities built at home",
    overviewBody:
      "From sterile manufacturing to quality-control laboratories and a first-of-its-kind medicines regulatory authority, BPI is building — and incubating for local operators — the hard capabilities that turn dependence into sovereign capacity.",
    practiceDetail: {
      heading: "What This Looks Like In Practice",
      body: "BPI operates across three execution tracks that convert into discrete, fundable projects: Build, covering manufacturing and infrastructure projects; Connect, covering strategic partnerships across Africa, the EU, and CARICOM; and Architecture, covering the financing mechanisms, commercial strategy, and enabling policies that hold a project together.\n\nThis work is backed by a catalytic funding model that blends government equity, donor co-funding, and development finance institution capital, aimed at building manufacturing capacity across categories like IV fluids, ARVs, diagnostics, and oncology and NCD medicines, alongside the regulatory ecosystem and regional distribution infrastructure needed to support them.\n\nBPI has also been expanding its core team, moving from a start-up entity toward a structured investment promotion and industrial coordination agency able to accelerate partnership development, financing, and sector-building work at the pace this priority requires.",
      cta: { label: "Partner With BPI", href: "/contact" },
    },
    motion: {
      heading: "In Motion",
      items: [
        {
          title: "Sterile IV Fluids Facility",
          body: "developing a domestic sterile-manufacturing plant targeting 12 million IV bags a year for local supply and export across CARICOM and the Global South",
        },
        {
          title: "Neopharm QC Laboratory",
          body: "in active discussion with Neopharm Labs, a 30-year Canadian industry leader, to establish a pharmaceutical quality-control testing laboratory in Barbados",
        },
        {
          title: "Medicines Regulatory Authority",
          body: "standing up a first-of-its-kind regional medicines regulator so products can be tested, registered, and released without depending on overseas authorities",
        },
      ],
    },
    careers: {
      eyebrow: "Join the team",
      heading: "Help build the architecture of care",
      lead: "We are assembling the people who will make Caribbean pharmaceutical sovereignty real.",
      body: "From manufacturing and quality control to regulatory affairs and partnerships, BPI is hiring across the disciplines that turn dependence into capacity.",
      primaryCta: { label: "See open roles", href: "/careers" },
      secondaryCta: { label: "Contact BPI", href: "/contact" },
    },
    cta: {
      heading: "Ready to build with us?",
      body: "Whether you are an investor, manufacturer, or partner, BPI can open a direct route into the Caribbean pharmaceutical market. Let's talk about where you fit.",
      primaryCta: { label: "Become an Investor", href: "/investors" },
      secondaryCta: { label: "Contact BPI", href: "/contact" },
    },
  },
  {
    slug: "strengthen-regional-supply-chains",
    order: 3,
    title: "Strengthen Regional Supply Chains",
    subtitle:
      "Building the trade corridors and distribution infrastructure the Caribbean needs to move essential medicines reliably.",
    // Feature-split hero (header style 4): italic-accented headline + subtitle
    // bottom-left, a contained rounded image on the right.
    hero: {
      layout: "featureSplit",
      headlineLead: "Strengthen",
      headlineEmphasis: "Regional Supply",
      headlineTrail: "Chains",
    },
    // Overview is off here.
    showOverview: false,
    overviewHeading: "Supply chains you can see",
    overviewBody:
      "By pooling regional demand and anchoring production closer to home, BPI compresses the lead times, cold-chain risk, and inventory cost of long-distance supply — so essential medicines reach the Caribbean reliably and on time.",
    practiceTabs: {
      heading: "What This Looks Like In Practice",
      lead: "BPI is working to position Barbados as a distribution anchor for essential medicines and medical devices across more than 40 countries in the Caribbean and Latin America, procured through the PAHO Revolving Fund. The goal is to reduce member states' logistics costs and lead times while increasing distribution efficiency, with the hub's first focus on vaccine stockpiling.",
      statement:
        "Barbados brings real advantages to this role, including political will, geographic position, and existing infrastructure, and BPI is also building bi-directional trade corridors that run",
      trail:
        "further than the Caribbean alone, including a pharmaceutical trade route between Barbados and Nigeria that opens reciprocal market entry: CARICOM and LATAM access for Nigerian producers, and ECOWAS/AfCFTA access for Barbados-based manufacturers.",
    },
    motion: {
      heading: "In Motion",
      tone: "dark",
      cta: { label: "Partner With BPI", href: "/contact" },
      items: [
        {
          title: "PAHO Regional Supply Hub",
          body: "Positioning Barbados as a distribution anchor for essential medicines and medical devices to more than 40 countries across the Caribbean and Latin America",
        },
        {
          title: "AMA Barbados IV Fluids",
          body: "The manufacturing base the Barbados–Nigeria corridor builds outward from",
        },
        {
          title: "Lenstec – Nigeria Market Entry",
          body: "A further proof point for the same South–South trade corridor strategy",
        },
      ],
    },
    careers: {
      eyebrow: "Join the team",
      heading: "Help build the architecture of care",
      lead: "We are assembling the people who will make Caribbean pharmaceutical sovereignty real.",
      body: "From manufacturing and quality control to regulatory affairs and partnerships, BPI is hiring across the disciplines that turn dependence into capacity.",
      primaryCta: { label: "See open roles", href: "/careers" },
      secondaryCta: { label: "Contact BPI", href: "/contact" },
    },
    cta: {
      heading: "Ready to build with us?",
      body: "Whether you are an investor, manufacturer, or partner, BPI can open a direct route into the Caribbean pharmaceutical market. Let's talk about where you fit.",
      primaryCta: { label: "Become an Investor", href: "/investors" },
      secondaryCta: { label: "Contact BPI", href: "/contact" },
    },
  },
  {
    slug: "build-the-ecosystem-foundations",
    order: 4,
    title: "Build the Ecosystem Foundations",
    subtitle:
      "Building the regulatory, workforce, and research foundations a Caribbean pharmaceutical sector needs to stand on its own.",
    // Cover hero (header style 3): title left, subtitle beside it, full-bleed
    // image flush to the bottom.
    hero: { layout: "cover" },
    // Overview is off here.
    showOverview: false,
    overviewHeading: "Foundations that endure",
    overviewBody:
      "Sovereignty is more than a factory. BPI is building the regulatory institutions, the trained workforce, and the South–South partnerships that let the region make, regulate, and distribute its own medicines for generations to come.",
    practiceTabs: {
      heading: "What This Looks Like In Practice",
      lead: "Barbados has a real opportunity to become a regional hub for pharmaceutical manufacturing, innovation, and investment. BPI exists to turn that opportunity into something durable, through a coordinated strategy across industry development, workforce training, regulatory strengthening, research infrastructure, and international partnerships.",
      statement:
        "The market opportunity behind this work is significant. CARICOM represents an estimated $1.5-2.0 billion pharmaceutical market, with 85-90% of medicines currently imported. Rising demand driven by non-communicable diseases, which account for roughly 80% of deaths in the Caribbean, only widens the case for building local and regional manufacturing capacity.",
      tabs: [
        {
          label: "Regulatory Development",
          body: "The passage of the Barbados Medical Products Authority (BMPA) Act lays the legislative foundation for a modern pharmaceutical regulatory system. BPI supports its implementation while working alongside WHO, PAHO, CARPHA, and international partners to strengthen regulatory capacity and align with global best practices.\n\nThis reform sits inside a broader effort, the Government's streamlining of more than 40 pieces of legislation, and positions Barbados as a credible regional leader in regulatory science. Progress so far includes:",
          bullets:
            "Three assisted self-benchmarking sessions completed (October 2024, July 2025, November 2025), targeting GBT Maturity Level 3 by 2028\nAn Institutional Development Plan built using WHO competency frameworks (2025)\nLegislation submitted to the Chief Parliamentary Council for presentation to Parliament (October 2025)\nA joint WHO/PAHO ecosystem assessment mission completed (December 2025), feeding directly into BPI's Pharmaceutical Sector Strategic Plan",
        },
        {
          label: "Workforce Development",
          body: "A sovereign pharmaceutical sector needs people to run it. BPI is building the talent pipeline the industry depends on — from manufacturing technicians and quality-control analysts to regulatory specialists and research scientists.\n\nWorking with regional universities, technical and vocational institutions, and international partners, BPI aligns training and credentialing to the roles the sector is actively creating, so new capacity is staffed by Caribbean professionals rather than imported expertise.",
          bullets:
            "Curriculum and credentialing aligned to industry roles with regional education partners\nApprenticeship and on-the-job training pathways tied to live projects\nSpecialist training in quality assurance, regulatory affairs, and Good Manufacturing Practice",
        },
        {
          label: "Manufacturing and Investment",
          body: "BPI de-risks and co-develops the region's first modern manufacturing capacity, moving projects from concept through bankability to execution. Priority categories include IV fluids, ARVs, diagnostics, and oncology and NCD medicines.\n\nActing as a state-backed partner and equity co-investor, BPI structures the land, financing, and market-access arrangements that let international manufacturers commit with confidence.",
          bullets:
            "State-backed co-investment and project structuring for anchor facilities\nPriority production lines across IV fluids, ARVs, diagnostics, and NCD medicines\nMarket-access and offtake arrangements that pool regional CARICOM demand",
        },
        {
          label: "Research, Development, and Innovation",
          body: "Durable capacity is built on research as well as production. BPI is seeding the laboratories, data, and partnerships that let the region test, adapt, and eventually originate the medicines it depends on.\n\nBy connecting local institutions to South–South and international research networks, BPI turns Barbados into a node for applied pharmaceutical R&D rather than a downstream importer.",
          bullets:
            "Quality-control and testing laboratory capacity built with international partners\nSouth–South and EU research and innovation linkages\nApplied R&D tied to regional disease burden and manufacturing priorities",
        },
      ],
    },
    motion: {
      heading: "In Motion",
      tone: "dark",
      cta: { label: "Partner With BPI", href: "/contact" },
      items: [
        {
          title: "PAHO Regional Supply Hub",
          body: "Positioning Barbados as a distribution anchor for essential medicines and medical devices to more than 40 countries across the Caribbean and Latin America",
        },
        {
          title: "AMA Barbados IV Fluids",
          body: "The manufacturing base the Barbados–Nigeria corridor builds outward from",
        },
        {
          title: "Lenstec – Nigeria Market Entry",
          body: "A further proof point for the same South–South trade corridor strategy",
        },
      ],
    },
    careers: {
      eyebrow: "Join the team",
      heading: "Help build the architecture of care",
      lead: "We are assembling the people who will make Caribbean pharmaceutical sovereignty real.",
      body: "From manufacturing and quality control to regulatory affairs and partnerships, BPI is hiring across the disciplines that turn dependence into capacity.",
      primaryCta: { label: "See open roles", href: "/careers" },
      secondaryCta: { label: "Contact BPI", href: "/contact" },
    },
    cta: {
      heading: "Ready to build with us?",
      body: "Whether you are an investor, manufacturer, or partner, BPI can open a direct route into the Caribbean pharmaceutical market. Let's talk about where you fit.",
      primaryCta: { label: "Become an Investor", href: "/investors" },
      secondaryCta: { label: "Contact BPI", href: "/contact" },
    },
  },
];

const priorityDoc = (p) => ({
  _id: `seedPriority-${p.slug}`,
  _type: "priority",
  title: str(p.title),
  slug: { _type: "slug", current: p.slug },
  subtitle: text(p.subtitle),
  order: p.order,
  pageColor: PAGE_COLOR,
  sectionBgColor: "#E7F9FF",
  // Hero layout — defaults to the image+title card; a priority can opt into the
  // feature-statement header (style 2) via `hero`.
  ...(p.hero
    ? {
        heroLayout: p.hero.layout,
        // Feature-statement headline fields only; the cover layout uses the
        // title + subtitle and needs none.
        ...(p.hero.headlineLead
          ? {
              heroHeadlineLead: text(p.hero.headlineLead),
              heroHeadlineEmphasis: str(p.hero.headlineEmphasis),
              heroHeadlineTrail: text(p.hero.headlineTrail),
            }
          : {}),
      }
    : {}),
  showOverview: p.showOverview !== false,
  overviewHeading: str(p.overviewHeading),
  overviewBody: text(p.overviewBody),
  // Other sections (points / pageSections) start off; editors enable and fill
  // them per priority.
  showPoints: false,
  showStats: false,
  // Quote spotlight — only priorities that supply `quote` copy turn it on.
  ...(p.quote
    ? {
        showQuote: true,
        quoteEyebrow: str(p.quote.eyebrow),
        quoteHeading: str(p.quote.heading),
        quoteLead: text(p.quote.lead),
        quoteText: text(p.quote.quote),
        quoteAttribution: str(p.quote.name),
        quoteRole: str(p.quote.role),
      }
    : { showQuote: false }),
  // "In practice" — only the priorities that supply `practice` copy turn it on.
  ...(p.practice
    ? {
        showPractice: true,
        practiceEyebrow: str(p.practice.eyebrow),
        practiceStatementLead: text(p.practice.statementLead),
        practiceStatementHighlight: str(p.practice.statementHighlight),
        practiceStatementTrail: text(p.practice.statementTrail),
        practiceBody: text(p.practice.body),
        practicePrimaryCta: {
          _type: "cta",
          label: str(p.practice.primaryCta.label),
          href: p.practice.primaryCta.href,
        },
        practiceSecondaryCta: {
          _type: "cta",
          label: str(p.practice.secondaryCta.label),
          href: p.practice.secondaryCta.href,
        },
      }
    : { showPractice: false }),
  // "Practice detail" — only priorities that supply `practiceDetail` copy.
  ...(p.practiceDetail
    ? {
        showPracticeDetail: true,
        practiceDetailHeading: str(p.practiceDetail.heading),
        practiceDetailBody: text(p.practiceDetail.body),
        practiceDetailCta: {
          _type: "cta",
          label: str(p.practiceDetail.cta.label),
          href: p.practiceDetail.cta.href,
        },
      }
    : { showPracticeDetail: false }),
  // "Practice tabs" — only priorities that supply `practiceTabs` copy.
  ...(p.practiceTabs
    ? {
        showPracticeTabs: true,
        practiceTabsHeading: str(p.practiceTabs.heading),
        practiceTabsLead: text(p.practiceTabs.lead),
        practiceTabsStatement: text(p.practiceTabs.statement),
        ...(p.practiceTabs.trail
          ? { practiceTabsTrail: text(p.practiceTabs.trail) }
          : {}),
        practiceTabsItems: (p.practiceTabs.tabs ?? []).map((t, i) => ({
          _type: "practiceTab",
          _key: `tab-${i}`,
          label: str(t.label),
          body: text(t.body),
          bullets: text(t.bullets),
        })),
      }
    : { showPracticeTabs: false }),
  // "In motion" — only priorities that supply `motion` copy turn it on.
  ...(p.motion
    ? {
        showMotion: true,
        motionHeading: str(p.motion.heading),
        ...(p.motion.tone ? { motionTone: p.motion.tone } : {}),
        ...(p.motion.cta
          ? {
              motionCta: {
                _type: "cta",
                label: str(p.motion.cta.label),
                href: p.motion.cta.href,
              },
            }
          : {}),
        motionItems: p.motion.items.map((it, i) => ({
          _type: "motionItem",
          _key: `motion-${i}`,
          title: str(it.title),
          body: text(it.body),
        })),
      }
    : { showMotion: false }),
  // Optional modular blocks (Careers, then Call-to-action) rendered under the
  // quote. Editors add/remove/reorder these in Studio.
  ...(p.careers || p.cta
    ? {
        pageSections: [
          ...(p.careers
            ? [
                {
                  _type: "careersSection",
                  _key: "careers-1",
                  enabled: true,
                  eyebrow: str(p.careers.eyebrow),
                  heading: str(p.careers.heading),
                  lead: text(p.careers.lead),
                  body: text(p.careers.body),
                  primaryCta: {
                    _type: "cta",
                    label: str(p.careers.primaryCta.label),
                    href: p.careers.primaryCta.href,
                  },
                  secondaryCta: {
                    _type: "cta",
                    label: str(p.careers.secondaryCta.label),
                    href: p.careers.secondaryCta.href,
                  },
                  tone: "blue",
                },
              ]
            : []),
          ...(p.cta
            ? [
                {
                  _type: "ctaSection",
                  _key: "cta-1",
                  enabled: true,
                  heading: str(p.cta.heading),
                  body: text(p.cta.body),
                  primaryCta: {
                    _type: "cta",
                    label: str(p.cta.primaryCta.label),
                    href: p.cta.primaryCta.href,
                  },
                  secondaryCta: {
                    _type: "cta",
                    label: str(p.cta.secondaryCta.label),
                    href: p.cta.secondaryCta.href,
                  },
                  tone: "blue",
                },
              ]
            : []),
        ],
      }
    : {}),
});

// ── run ────────────────────────────────────────────────────────────────────────
const CLEAN = process.argv.includes("--clean");

async function run() {
  const ids = PRIORITIES.map((p) => `seedPriority-${p.slug}`);

  if (CLEAN) {
    console.log(`Deleting ${ids.length} seeded priorities…`);
    const tx = client.transaction();
    for (const id of ids) tx.delete(id);
    await tx.commit({ visibility: "async" });
    console.log("Done.");
    return;
  }

  console.log(
    `Seeding ${PRIORITIES.length} priorities into ${projectId}/${dataset}…`,
  );
  const tx = client.transaction();
  for (const p of PRIORITIES) tx.createOrReplace(priorityDoc(p));
  await tx.commit({ visibility: "async" });
  for (const p of PRIORITIES) console.log(`  ✓ ${p.title}  (/${p.slug})`);
  console.log("Done. Publish is immediate (createOrReplace writes published docs).");
}

run().catch((err) => {
  console.error("\n✗ Seed failed:");
  console.error(err);
  process.exit(1);
});
