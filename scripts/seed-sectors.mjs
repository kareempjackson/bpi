/**
 * Seeds the six Sector documents so /sectors links to real detail pages
 * (/sectors/[slug]) and editors have a starting point to customize.
 *
 * - Slugs match the Home page molecule's slot ids (nodeId) so the diagram's
 *   `/sectors/{nodeId}` links resolve straight to these detail pages.
 * - No image uploads: cardImage / heroImage are left empty so the listing card
 *   and detail hero fall back to the Home document's photography.
 * - Localized fields are written in the internationalized-array shape the
 *   `sanity-plugin-internationalized-array` plugin stores (see
 *   scripts/migrate-i18n.mjs), so they work on the already-migrated dataset.
 *
 * Idempotent: fixed _ids + createOrReplace, so re-runs update in place.
 *
 * Run:   node --env-file=.env.local scripts/seed-sectors.mjs
 * Clean: node --env-file=.env.local scripts/seed-sectors.mjs --clean
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/seed-sectors.mjs",
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
// Slugs match the Home molecule nodeIds (see sanity/schemaTypes/objects/sectorNode.ts).
const SECTION_BG = "#E9F7EE";

const SECTORS = [
  {
    slug: "market-access",
    order: 1,
    pageColor: "#01190d",
    title: "Market Access & Trade Development",
    subtitle:
      "Building the trade corridors and distribution infrastructure that move essential medicines across the region reliably and on time.",
    overviewHeading: "Medicine has to travel before it can heal",
    overviewBody:
      "The Caribbean imports 85–90% of its medicines, along long, fragile supply lines that add cost, lead time, and cold-chain risk. BPI is compressing that distance — pooling regional demand, anchoring distribution closer to home, and opening bi-directional trade routes that give Caribbean manufacturers a way out to the world.\n\nBy positioning Barbados as a distribution anchor and negotiating reciprocal market entry with partners across Africa and the EU, BPI turns market access from a bottleneck into a strategic advantage.",
    capabilitiesHeading: "What we build here",
    capabilities: [
      {
        title: "Regional distribution hub",
        body: "A PAHO-linked supply hub positioning Barbados as a distribution anchor for essential medicines and medical devices to 40+ countries across the Caribbean and Latin America.",
      },
      {
        title: "South–South trade corridors",
        body: "Reciprocal pharmaceutical trade routes — including a Barbados–Nigeria corridor — that open CARICOM/LATAM access for partner producers and ECOWAS/AfCFTA access for Barbados-based manufacturers.",
      },
      {
        title: "Pooled procurement",
        body: "Aggregating regional demand through mechanisms like the PAHO Revolving Fund to lower logistics costs, shorten lead times, and improve distribution efficiency for member states.",
      },
    ],
    stats: [
      { value: "40+", description: "countries in the distribution footprint" },
      { value: "85–90%", description: "of medicines currently imported" },
      { value: "$1.5–2B", description: "CARICOM pharmaceutical market" },
    ],
    motion: {
      heading: "In Motion",
      tone: "dark",
      cta: { label: "Partner With BPI", href: "/contact" },
      items: [
        {
          title: "PAHO Regional Supply Hub",
          body: "Positioning Barbados as a distribution anchor for essential medicines and medical devices to more than 40 countries across the Caribbean and Latin America.",
        },
        {
          title: "Barbados–Nigeria Trade Corridor",
          body: "A pharmaceutical trade route opening reciprocal market entry between CARICOM/LATAM and ECOWAS/AfCFTA.",
        },
        {
          title: "Lenstec – Nigeria Market Entry",
          body: "A proof point for the South–South trade corridor strategy, carrying a Barbados-made product into a new market.",
        },
      ],
    },
  },
  {
    slug: "workforce",
    order: 2,
    pageColor: "#0B2F64",
    title: "Workforce & Talent Development",
    subtitle:
      "Building the talent pipeline a sovereign pharmaceutical sector runs on — from manufacturing technicians to regulatory specialists.",
    overviewHeading: "A sector is only as strong as the people who run it",
    overviewBody:
      "Sovereign capacity is more than factories and regulations; it is people. BPI is building the talent pipeline the industry depends on, aligning training and credentialing to the roles the sector is actively creating so new capacity is staffed by Caribbean professionals rather than imported expertise.\n\nWorking with regional universities, technical and vocational institutions, and international partners, BPI ties apprenticeships and specialist training directly to live projects.",
    capabilitiesHeading: "What we build here",
    capabilities: [
      {
        title: "Industry-aligned curriculum",
        body: "Training and credentialing built with regional education partners, mapped to the manufacturing, quality, and regulatory roles the sector is creating.",
      },
      {
        title: "Apprenticeship pathways",
        body: "On-the-job training tied to live projects, so trainees learn on the same lines and in the same labs the sector is standing up.",
      },
      {
        title: "Specialist training",
        body: "Quality assurance, regulatory affairs, and Good Manufacturing Practice credentials that meet international standards.",
      },
    ],
    motion: {
      heading: "In Motion",
      items: [
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
      ],
    },
  },
  {
    slug: "research-development",
    order: 3,
    pageColor: "#042D2B",
    title: "Research & Development",
    subtitle:
      "Seeding the laboratories, data, and partnerships that let the region test, adapt, and eventually originate its own medicines.",
    overviewHeading: "Durable capacity is built on research, not just production",
    overviewBody:
      "A region that can only assemble what others design stays dependent. BPI is seeding the applied R&D — the quality-control laboratories, the data, and the research partnerships — that let the Caribbean test, adapt, and in time originate the medicines it depends on.\n\nBy connecting local institutions to South–South and international research networks, BPI turns Barbados into a node for applied pharmaceutical R&D rather than a downstream importer.",
    capabilitiesHeading: "What we build here",
    capabilities: [
      {
        title: "Quality-control laboratories",
        body: "Testing and QC lab capacity built with international partners so products can be verified in-region instead of shipped abroad.",
      },
      {
        title: "Research linkages",
        body: "South–South and EU research and innovation partnerships that plug local institutions into global R&D networks.",
      },
      {
        title: "Applied R&D",
        body: "Research tied to the region's actual disease burden and manufacturing priorities — from NCDs to diagnostics.",
      },
    ],
    quote: {
      eyebrow: "Why This Matters",
      heading: "Research anchors sovereignty",
      lead: "Non-communicable diseases account for roughly 80% of deaths in the Caribbean. Building research capacity around that burden is how the region moves from importing answers to producing them.",
      quote:
        "The establishment of Barbados Pharmaceutical Inc. was a key step in preparing the country for eventual manufacturing and research activity.",
      name: "Jerome Walcott",
      role: "Senior Minister",
    },
    motion: {
      heading: "In Motion",
      items: [
        {
          title: "Neopharm QC Laboratory",
          body: "In active discussion with Neopharm Labs, a 30-year Canadian industry leader, to establish a pharmaceutical quality-control testing laboratory in Barbados.",
        },
        {
          title: "EU PharmaNext",
          body: "An Investment Promotion and Business Development Office in BioPark Charleroi, Belgium, connecting European research and innovation networks to Barbados.",
        },
        {
          title: "Applied R&D program",
          body: "Research tied to regional disease burden — oncology, NCDs, and diagnostics — and to manufacturing priorities.",
        },
      ],
    },
  },
  {
    slug: "innovation-technology",
    order: 4,
    pageColor: "#10233F",
    title: "Innovation & Technology",
    subtitle:
      "Moving pharmaceutical projects from concept to bankability to execution — with the technology and financing models to match.",
    overviewHeading: "Turning opportunity into something that ships",
    overviewBody:
      "Ideas are cheap; execution is where sovereignty is won. BPI operates a catalytic project incubator that moves pharmaceutical opportunities from initial interest through bankability to tangible capacity on the ground — de-risking land, financing, technology, and market entry at every stage.\n\nBacked by a catalytic funding model that blends government equity, donor co-funding, and development finance, BPI brings modern manufacturing technology to categories the region has always had to import.",
    capabilitiesHeading: "What we build here",
    capabilities: [
      {
        title: "Project incubation",
        body: "A catalytic incubator that carries pharmaceutical projects from concept through bankability to execution across Build, Connect, and Architecture tracks.",
      },
      {
        title: "Modern manufacturing tech",
        body: "Sterile manufacturing, diagnostics, and priority production lines built with current technology and quality systems from day one.",
      },
      {
        title: "Catalytic financing models",
        body: "Blended structures — government equity, donor co-funding, and DFI capital — that make first-of-a-kind projects investable.",
      },
    ],
    motion: {
      heading: "In Motion",
      tone: "dark",
      cta: { label: "Become an Investor", href: "/investors" },
      items: [
        {
          title: "Sterile IV Fluids Facility",
          body: "A domestic sterile-manufacturing plant targeting 12 million IV bags a year for local supply and export across CARICOM and the Global South.",
        },
        {
          title: "Catalytic project incubator",
          body: "Moving opportunities from investment interest to on-the-ground impact across manufacturing, partnerships, and enabling policy.",
        },
        {
          title: "Priority production lines",
          body: "Technology and process capacity across IV fluids, ARVs, diagnostics, and oncology and NCD medicines.",
        },
      ],
    },
  },
  {
    slug: "regulatory-policy",
    order: 5,
    pageColor: "#1A1036",
    title: "Regulatory Development & Policy",
    subtitle:
      "Standing up a modern medicines regulatory system so products can be tested, registered, and released without depending on overseas authorities.",
    overviewHeading: "Sovereignty needs a regulator of its own",
    overviewBody:
      "You cannot make medicines you are not allowed to release. The passage of the Barbados Medical Products Authority (BMPA) Act lays the legislative foundation for a modern pharmaceutical regulatory system, and BPI supports its implementation while working alongside WHO, PAHO, CARPHA, and international partners to strengthen regulatory capacity.\n\nThis reform sits inside a broader effort to streamline more than 40 pieces of legislation, positioning Barbados as a credible regional leader in regulatory science.",
    capabilitiesHeading: "What we build here",
    capabilities: [
      {
        title: "A regional medicines regulator",
        body: "Implementation of the BMPA Act to stand up a first-of-its-kind authority that tests, registers, and releases products in-region.",
      },
      {
        title: "Regulatory maturity",
        body: "Assisted self-benchmarking against the WHO Global Benchmarking Tool, targeting GBT Maturity Level 3 by 2028.",
      },
      {
        title: "International alignment",
        body: "Work with WHO, PAHO, and CARPHA to align local regulation with global best practice and unlock mutual recognition.",
      },
    ],
    stats: [
      { value: "40+", description: "pieces of legislation being streamlined" },
      { value: "Level 3", description: "GBT maturity target by 2028" },
      { value: "3", description: "assisted self-benchmarking sessions completed" },
    ],
    motion: {
      heading: "In Motion",
      tone: "dark",
      cta: { label: "Partner With BPI", href: "/contact" },
      items: [
        {
          title: "Medicines Regulatory Authority",
          body: "Standing up a first-of-its-kind regional medicines regulator so products can be tested, registered, and released without depending on overseas authorities.",
        },
        {
          title: "WHO/PAHO ecosystem assessment",
          body: "A joint assessment mission feeding directly into BPI's Pharmaceutical Sector Strategic Plan.",
        },
        {
          title: "BMPA Act implementation",
          body: "Legislation submitted to the Chief Parliamentary Council, moving the modern regulatory framework toward Parliament.",
        },
      ],
    },
  },
  {
    slug: "investment-financing",
    order: 6,
    pageColor: "#14261A",
    title: "Investment & Financing",
    subtitle:
      "Giving global capital a clear, de-risked pathway into the Caribbean pharmaceutical market.",
    overviewHeading: "A clear pathway for capital",
    overviewBody:
      "Capital moves where risk is understood and managed. BPI acts as a state-backed partner and equity co-investor, de-risking land, regulatory pathways, financing, and market entry so international investors can move into a fast-diversifying regional pharmaceutical industry with confidence.\n\nAs the connective layer between global capital and the government and regulatory processes that make a foothold real, BPI moves opportunities from investment interest to tangible impact on the ground.",
    capabilitiesHeading: "What we build here",
    capabilities: [
      {
        title: "State-backed co-investment",
        body: "BPI acts as an equity co-investor and government-backed partner, structuring the land, financing, and market-access arrangements that let investors commit.",
      },
      {
        title: "De-risked market entry",
        body: "Coordinated regulatory approval, government engagement, and regional market access so pharmaceutical investment has a direct route into Barbados and the wider Caribbean.",
      },
      {
        title: "Investment promotion",
        body: "A structured investment promotion and industrial coordination function accelerating partnership development and financing.",
      },
    ],
    quote: {
      eyebrow: "What We Are Building",
      heading: "Investment Incentives",
      lead: "Barbados adopted a strategic approach to developing its pharmaceutical industry. Establishing Barbados Pharmaceutical Inc. was a key step in preparing the country for eventual manufacturing activity.",
      quote:
        "Barbados subsequently adopted a strategic approach to developing its pharmaceutical industry. The establishment of Barbados Pharmaceutical Inc. was another key step in preparing the country for eventual manufacturing activity.",
      name: "Jerome Walcott",
      role: "Senior Minister",
    },
    motion: {
      heading: "In Motion",
      cta: { label: "Become an Investor", href: "/investors" },
      items: [
        {
          title: "Neopharm QC Laboratory",
          body: "In active discussion with Neopharm Labs, a 30-year Canadian industry leader, to establish a pharmaceutical quality control testing laboratory in Barbados.",
        },
        {
          title: "EU PharmaNext",
          body: "Establishing an Investment Promotion and Business Development Office in BioPark Charleroi, Belgium, to connect European trade and investment networks to Barbados.",
        },
        {
          title: "PAHO Regional Supply Hub",
          body: "Positioning Barbados as a distribution anchor for essential medicines to more than 40 countries across the Caribbean and Latin America.",
        },
      ],
    },
  },
];

// Every sector closes with the same Careers + CTA blocks so the detail pages
// never end abruptly. Editors add/remove/reorder these in Studio.
const CAREERS = {
  eyebrow: "Join the team",
  heading: "Help build the architecture of care",
  lead: "We are assembling the people who will make Caribbean pharmaceutical sovereignty real.",
  body: "From manufacturing and quality control to regulatory affairs and partnerships, BPI is hiring across the disciplines that turn dependence into capacity.",
  primaryCta: { label: "See open roles", href: "/careers" },
  secondaryCta: { label: "Contact BPI", href: "/contact" },
};

const CTA = {
  heading: "Ready to build with us?",
  body: "Whether you are an investor, manufacturer, or partner, BPI can open a direct route into the Caribbean pharmaceutical market. Let's talk about where you fit.",
  primaryCta: { label: "Become an Investor", href: "/investors" },
  secondaryCta: { label: "Contact BPI", href: "/contact" },
};

// The /sectors landing page singleton — frames the six sector cards.
const HERO_BODY =
  "Medicine doesn't reach a patient through one decision. It takes six systems working together: trade routes, a trained workforce, research infrastructure, innovation, regulation, and capital. This is where BPI builds each one.";
const SIX_INTRO =
  "BPI works across six sectors to build the systems, routes, and infrastructure that determine whether essential medicines reach the Caribbean reliably and on time.";

const sectorsPageDoc = () => ({
  _id: "sectorsPage",
  _type: "sectorsPage",
  seoTitle: str("Sectors — BPI"),
  seoDescription: text(
    "The six sectors BPI is building across — each a structural component of the Caribbean's pharmaceutical future.",
  ),
  heroHeading: str("How Health Gets Here"),
  heroBody: text(HERO_BODY),
  heroCta: { _type: "cta", label: str("Explore Sectors"), href: "#sectors" },
  sixHeading: str("The Six"),
  sixIntro: text(SIX_INTRO),
  latestHeading: str("Latest from BPI"),
  pageSections: [
    {
      _type: "careersSection",
      _key: "careers-1",
      enabled: true,
      eyebrow: str(CAREERS.eyebrow),
      heading: str(CAREERS.heading),
      lead: text(CAREERS.lead),
      body: text(CAREERS.body),
      primaryCta: {
        _type: "cta",
        label: str(CAREERS.primaryCta.label),
        href: CAREERS.primaryCta.href,
      },
      secondaryCta: {
        _type: "cta",
        label: str(CAREERS.secondaryCta.label),
        href: CAREERS.secondaryCta.href,
      },
      tone: "mint",
    },
    {
      _type: "ctaSection",
      _key: "cta-1",
      enabled: true,
      heading: str(CTA.heading),
      body: text(CTA.body),
      primaryCta: {
        _type: "cta",
        label: str(CTA.primaryCta.label),
        href: CTA.primaryCta.href,
      },
      secondaryCta: {
        _type: "cta",
        label: str(CTA.secondaryCta.label),
        href: CTA.secondaryCta.href,
      },
      tone: "green",
    },
  ],
});

const sectorDoc = (s) => ({
  _id: `seedSector-${s.slug}`,
  _type: "sector",
  title: str(s.title),
  slug: { _type: "slug", current: s.slug },
  subtitle: text(s.subtitle),
  order: s.order,
  pageColor: s.pageColor,
  sectionBgColor: SECTION_BG,
  // Overview — on for every sector.
  showOverview: true,
  overviewHeading: str(s.overviewHeading),
  overviewBody: text(s.overviewBody),
  // Capabilities — on when the sector supplies them.
  ...(s.capabilities
    ? {
        showCapabilities: true,
        capabilitiesHeading: str(s.capabilitiesHeading),
        capabilities: s.capabilities.map((c, i) => ({
          _type: "capability",
          _key: `cap-${i}`,
          title: str(c.title),
          body: text(c.body),
        })),
      }
    : { showCapabilities: false }),
  // Stats — only sectors that supply them.
  ...(s.stats
    ? {
        showStats: true,
        stats: s.stats.map((st, i) => ({
          _type: "stat",
          _key: `stat-${i}`,
          value: str(st.value),
          description: text(st.description),
        })),
      }
    : { showStats: false }),
  // Quote spotlight — only sectors that supply quote copy.
  ...(s.quote
    ? {
        showQuote: true,
        quoteEyebrow: str(s.quote.eyebrow),
        quoteHeading: str(s.quote.heading),
        quoteLead: text(s.quote.lead),
        quoteText: text(s.quote.quote),
        quoteAttribution: str(s.quote.name),
        quoteRole: str(s.quote.role),
      }
    : { showQuote: false }),
  // In motion — every sector ships with a cycling initiatives list.
  ...(s.motion
    ? {
        showMotion: true,
        motionHeading: str(s.motion.heading),
        ...(s.motion.tone ? { motionTone: s.motion.tone } : {}),
        ...(s.motion.cta
          ? {
              motionCta: {
                _type: "cta",
                label: str(s.motion.cta.label),
                href: s.motion.cta.href,
              },
            }
          : {}),
        motionItems: s.motion.items.map((it, i) => ({
          _type: "motionItem",
          _key: `motion-${i}`,
          title: str(it.title),
          body: text(it.body),
        })),
      }
    : { showMotion: false }),
  // Modular Careers + Call-to-action blocks at the foot of each page.
  pageSections: [
    {
      _type: "careersSection",
      _key: "careers-1",
      enabled: true,
      eyebrow: str(CAREERS.eyebrow),
      heading: str(CAREERS.heading),
      lead: text(CAREERS.lead),
      body: text(CAREERS.body),
      primaryCta: {
        _type: "cta",
        label: str(CAREERS.primaryCta.label),
        href: CAREERS.primaryCta.href,
      },
      secondaryCta: {
        _type: "cta",
        label: str(CAREERS.secondaryCta.label),
        href: CAREERS.secondaryCta.href,
      },
      tone: "mint",
    },
    {
      _type: "ctaSection",
      _key: "cta-1",
      enabled: true,
      heading: str(CTA.heading),
      body: text(CTA.body),
      primaryCta: {
        _type: "cta",
        label: str(CTA.primaryCta.label),
        href: CTA.primaryCta.href,
      },
      secondaryCta: {
        _type: "cta",
        label: str(CTA.secondaryCta.label),
        href: CTA.secondaryCta.href,
      },
      tone: "green",
    },
  ],
});

// ── run ────────────────────────────────────────────────────────────────────────
const CLEAN = process.argv.includes("--clean");

async function run() {
  const ids = SECTORS.map((s) => `seedSector-${s.slug}`);

  if (CLEAN) {
    console.log(`Deleting ${ids.length} seeded sectors + the Sectors page…`);
    const tx = client.transaction();
    for (const id of ids) tx.delete(id);
    tx.delete("sectorsPage");
    await tx.commit({ visibility: "async" });
    console.log("Done.");
    return;
  }

  console.log(`Seeding ${SECTORS.length} sectors into ${projectId}/${dataset}…`);
  const tx = client.transaction();
  tx.createOrReplace(sectorsPageDoc());
  for (const s of SECTORS) tx.createOrReplace(sectorDoc(s));
  await tx.commit({ visibility: "async" });
  console.log("  ✓ Sectors page (singleton)");
  for (const s of SECTORS) console.log(`  ✓ ${s.title}  (/${s.slug})`);
  console.log(
    "Done. Publish is immediate (createOrReplace writes published docs).",
  );
}

run().catch((err) => {
  console.error("\n✗ Seed failed:");
  console.error(err);
  process.exit(1);
});
