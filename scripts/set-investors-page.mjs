/**
 * Seeds the Investors page: the hero, "The Opportunity", and "Why Barbados,
 * Why Now". Real, editable CMS data — everything here can be changed in
 * Studio → Investors page.
 *
 * No images are set. Both the hero and the "Why Barbados" closing image render
 * only once an editor uploads one in Studio. The hero image bleeds off the
 * right edge of the page, so pick a wide shot with the subject left of centre.
 *
 * Re-running resets these fields to the copy below — it does not merge.
 *
 * Run:   node --env-file=.env.local scripts/set-investors-page.mjs
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-12";

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN.\n" +
      "Run with: node --env-file=.env.local scripts/set-investors-header.mjs",
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

/** Wrap a plain English string as an internationalizedArrayText value. */
const text = (value) => [
  {
    _key: "en",
    _type: "internationalizedArrayTextValue",
    language: "en",
    value,
  },
];

/** A "Why Barbados" card. `bg` drives the white / mint-blue / green rhythm. */
const card = (key, title, body, bg, watermark = false) => ({
  _key: key,
  _type: "investorCard",
  title: str(title),
  body: text(body),
  bg,
  watermark,
});

const stat = (key, value, description) => ({
  _key: key,
  _type: "stat",
  value: str(value),
  description: text(description),
});

/** A "How BPI Works" / Traction / Timeline row. */
const role = (key, label, description) => ({
  _key: key,
  _type: "investorRole",
  label: str(label),
  description: str(description),
});

/** An Investment Incentives paragraph. */
const note = (key, body) => ({
  _key: key,
  _type: "investorNote",
  body: text(body),
});

/** A "Voices from the Ground" quote (no portrait — editors upload one). */
const quote = (key, q, bg) => ({
  _key: key,
  _type: "investorQuote",
  quote: text(q),
  name: str("Name of person here"),
  title: str("Title of person"),
  bg,
});

const FIELDS = {
  heroTitle: str("Investors"),
  heroTagline: text("Let's put Barbados on your supply-chain map"),
  heroCta: {
    _type: "cta",
    label: str("Partner With BPI"),
    href: "/contact",
  },

  opportunityEyebrow: str("The Opportunity"),
  opportunityHeading: str("Global medicine supply chain are broken"),
  // `**…**` marks the bold run — see InvestorsOpportunity's renderEmphasis.
  opportunityBody: text(
    "COVID-19 exposed a hard truth: the Global South sits at the end of a fragile, concentrated supply chain. **The Caribbean imports more than 97% of its medicines, leaving 40+ million people exposed to shocks, price volatility, and stock-outs.**",
  ),
  opportunityCardLead: text(
    "Pharma is diversifying away from single-source manufacturing. The capital is moving. The question is where it lands.",
  ),
  opportunityStats: [
    stat("s1", "97%", "Caribbean medicines are imported"),
    stat("s2", "40m +", "People across the Caribbean region"),
    stat("s3", "$85m +", "Annual regional IV-fluids demand alone"),
    stat("s4", "650m", "people across CARICOM and the wider LAC region"),
  ],
  opportunityCardBg: "#06FE83",

  whyHeading: str("Why Barbados, Why Now"),
  whyIntro: text(
    "Barbados combines a globally respected legal and tax framework with privileged market access, a rare combination for pharmaceutical investment.",
  ),
  whyCards: [
    card(
      "c1",
      "Strategic Gateway",
      "A platform into CARICOM (16M), LAC (650M), and emerging AfCFTA/ECOWAS corridors, through bilateral agreements and preferential trade access",
      "#FFFFFF",
    ),
    card(
      "c2",
      "Trusted Jurisdiction",
      "English common law, OECD Pillar-2 aligned, 40+ double taxation treaties, 9 bilateral investment treaties, removed from the EU AML/CFT list in August 2025",
      "#CAF1FF",
    ),
    card(
      "c3",
      "State-Backed Partner",
      "BPI operates as an equity partner and single point of contact, de-risking land, regulatory pathways, financing, and market entry",
      "#06FE83",
      true,
    ),
  ],
  whyClosing: text(
    "CARICOM alone represents an estimated USD $1.5–2.0 billion pharmaceutical market, with 85–90% of medicines currently imported. Rising demand driven by non communicable diseases, which account for roughly 80% of deaths in the Caribbean, only strengthens the case for local production.",
  ),

  howHeading: str("How BPI Works"),
  howIntro: text(
    "BPI's role is not to manufacture. It's to create the conditions where manufacturers choose to invest and succeed in Barbados.",
  ),
  howRoles: [
    role("r1", "Coordinator", "Aligns ministries, regulators, and industry"),
    role("r2", "Facilitator", "Streamlines land, permits, and incentives"),
    role("r3", "Equity Partner", "Takes minority stakes to de-risk projects"),
    role("r4", "Connector", "Opens regional and Global South markets"),
  ],
  howBody: text(
    "The private sector invests capital and operational expertise, the public sector provides infrastructure, regulatory clarity, and fiscal incentives. BPI is the bridge between them, identifying and qualifying manufacturing partners, clarifying regulatory pathways, building shared research and workforce infrastructure, and helping manufacturers connect to government procurement and export opportunities as they scale.",
  ),
  howBg: "#13362A",

  sitesHeading: str("Available Manufacturing Sites"),
  sitesBody: text(
    "The Barbados Investment and Development Corporation (BIDC) manages 13 designated industrial locations across the island, more than 1.5 million square feet of managed building space and roughly 160 acres of developed industrial land.",
  ),
  sitesList: [
    "Grantley Adams Industrial Estate (Christ Church)",
    "Newton Industrial Estate (Christ Church)",
    "Harbour Industrial Estate (St. Michael)",
  ],
  sitesNote: text(
    "Secondary sites available at Pine, Wildey, and Six Roads Industrial Estates. Beyond the BIDC portfolio, BPI can also facilitate introductions to private property owners with pharmaceutical-grade or convertible manufacturing space. All BIDC estates include electricity, water, road, telecommunications, and waste management infrastructure; lease and purchase terms are negotiated case by case.",
  ),

  incentivesHeading: str("Investment Incentives"),
  incentivesLead: text(
    "Barbados' 2024 tax reform created one of the most attractive environments globally for life sciences investment.",
  ),
  incentivesItems: [
    note(
      "i1",
      "4.5% Patent Box on qualifying IP income, including medicinal products, formulations, and processes developed or owned in Barbados",
    ),
    note(
      "i2",
      "50% R&D Tax Credit, refundable, applying directly to formulation development, stability testing, and bioequivalence studies conducted locally",
    ),
    note(
      "i3",
      "25% Innovation Credit on expenditure creating new manufacturing processes, stackable with the R&D credit",
    ),
    note(
      "i4",
      "150% deductions on staff training, marketing, and product development",
    ),
    note("i5", "0% withholding on dividends, interest, and royalties to non-residents"),
    note("i6", "Duty and VAT exemptions on qualifying manufacturing inputs and equipment"),
  ],

  bridgeEyebrow: str("What We Are Building"),
  bridgeTitle: str("A Bridge"),
  bridgeTitleTail: str("to European Capital"),
  bridgeBody: text(
    "Barbados occupies a rare position: an OECD-aligned jurisdiction inside the OACPS framework with a privileged relationship to EU development finance and trade channels. For European manufacturers, this means a compliant base that opens rather than complicates access to both capital and markets, through the CARIFORUM-EU Economic Partnership Agreement, Global Gateway and EIB project-finance eligibility, 40+ double taxation treaties including key EU markets, and 9 bilateral investment treaties protecting EU capital.",
  ),
  bridgeCta: { _type: "cta", label: str("Partner With BPI"), href: "/contact" },
  bridgeBg: "#13362A",

  marketHeading: str("Market Access"),
  marketLead: text("Manufacture once. Serve CARICOM, LAC, and the Global South."),
  marketStats: [
    stat("m1", "CARICOM (16M+)", "15 member states, free movement of goods under the CSME"),
    stat("m2", "LAC region (650M)", "$80B+ regional pharma market, a near-shoring priority"),
    stat(
      "m3",
      "AfCFTA corridor (1.4B)",
      "reachable via the November 2025 MOU with Nigeria and the PVAC partnership",
    ),
  ],
  marketClosing: text("Daily direct flights to London, Toronto, Miami, and New York"),

  tractionEyebrow: str("Traction"),
  tractionHeading: text(
    "BPI's platform approach is already producing concrete, financeable projects.",
  ),
  tractionItems: [
    role(
      "t1",
      "AMA Barbados (Flagship)",
      "A public-private partnership establishing an AU–Caribbean pharmaceutical trade corridor, starting with a Barbados-based IV fluids facility",
    ),
    role(
      "t2",
      "PVAC MOU — Nigeria (Nov 2025)",
      "A framework linking CARICOM, LATAM, ECOWAS, and AfCFTA, with a regulatory reliance pathway to NAFDAC underway",
    ),
    role(
      "t3",
      "Regional Health Supplies Hub (Pipeline)",
      "Powered by PAHO's pooled procurement, creating a centralized distribution hub reaching 42 countries",
    ),
    role(
      "t4",
      "BMPA (Regulatory)",
      "Barbados' Medical Products Regulatory Authority, in formation, built on reliance pathways with experienced international authorities",
    ),
  ],

  whyNowHeading: str("Why Now"),
  whyNowBody: text(
    "Capital is rotating out of single-source manufacturing as global pharma actively diversifies away from East Asian concentration. The Caribbean is on the map for the first time in a generation. Barbados' national industrial strategy is backing the sector directly, anchoring a US$1B+ GDP contribution across four industrial zones, including life sciences at SouthStar. The pipeline already extends well beyond IV fluids into essential medicines, biotech formulation, medicinal cannabis R&D, clinical trials, and nutraceuticals. And unlike many investment-promotion jurisdictions, Barbados shows up as an equity partner, not just a host.",
  ),
  whyNowPrimaryCta: { _type: "cta", label: str("Partner With BPI"), href: "/contact" },
  whyNowSecondaryCta: { _type: "cta", label: str("Our Ecosystem"), href: "/#ecosystem" },
  whyNowBg: "#06FE83",

  climateHeading: str("Barbados Investment Climate"),
  climateCards: [
    card(
      "cl1",
      "Innovation",
      "Ranks 77th of 133 economies on the 2024 Global Innovation Index (9th in Latin America and the Caribbean), having returned to the index in 2024 after an 8-year absence",
      "#FFFFFF",
    ),
    card(
      "cl2",
      "Workforce",
      "99%+ literacy rate, 68–74% gross tertiary enrollment across three public institutions (UWI Cave Hill, Barbados Community College, Erdiston Teachers Training College), with government investment in STEM and pharmaceutical manufacturing workforce training including the EMPOWER Digital Manufacturing Academy",
      "#FFFFFF",
    ),
    card(
      "cl3",
      "Political stability",
      "a Political Stability Index score of 1.19 (scale -2.5 to 2.5, world average -0.06), placing Barbados in the top 7% of 194 countries globally; a stable parliamentary democracy with strong governance and enhanced financial transparency, removed from FATF enhanced monitoring since February 2024",
      "#FFFFFF",
    ),
  ],

  voicesEyebrow: str("On the Record"),
  voicesHeading: str("Voices from"),
  voicesHeadingTail: str("the Ground"),
  voicesQuotes: [
    quote(
      "v1",
      "Perhaps the biggest game changer since we have come to office is addressing the issue of pharmaceutical equity and creating a platform for jobs, investment and earnings for a pharmaceutical industry in Barbados for the first time.",
      "#9BFFCD",
    ),
    quote(
      "v2",
      "This has been a major, major, major achievement for a small state like Barbados, to be able to locate itself at the centre of the Americas as a location for the development of a pharmaceutical industry.",
      "#FFFFFF",
    ),
    quote(
      "v3",
      "“We will create the regulatory framework for these things to happen. What is at stake is potentially at least 4,000 to 5,000 jobs in the next four to five years in Barbados. This is serious work in action.”",
      "#CAF1FF",
    ),
  ],

  deeperHeading: str("Go Deeper"),
  deeperBody: text(
    "This page covers the opportunity, the incentives, and the traction. The portal goes further: audited financials and projections, the detailed regulatory roadmap, and our capacity build-out plan, matched to your specific interest as an investor or partner.",
  ),
  timelineHeading: str("Timeline"),
  timelineItems: [
    role(
      "tl1",
      "Preliminary Assessment",
      "meet with BPI to understand manufacturing scope, timeline, and operational requirements",
    ),
    role(
      "tl2",
      "Site Visit & Infrastructure Review",
      "tour available estates and meet with BPI, strategic partners, and government representatives",
    ),
    role(
      "tl3",
      "Regulatory Pathway Clarity",
      "engage with advisors on BMPA timeline and GMP alignment requirements",
    ),
    role(
      "tl4",
      "Investment Framework Negotiation",
      "structure land lease or purchase, fiscal incentives, and operational support with BPI",
    ),
    role(
      "tl5",
      "Workforce & Logistics Planning",
      "identify training and supply-chain requirements, coordinated with government partners",
    ),
  ],
  deeperPrimaryCta: { _type: "cta", label: str("Request Portal Access"), href: "/portal/request" },
  deeperSecondaryCta: { _type: "cta", label: str("Talk to Us Directly"), href: "/contact" },

  seoTitle: str("Investors & Partners — BPI"),
  seoDescription: text(
    "Back the Caribbean's pharmaceutical gateway. Barbados Pharmaceutical Inc. is building the manufacturing capacity, supply chain, and regulatory infrastructure the region depends on — and we're inviting aligned investors and partners to build it with us.",
  ),
};

// `createIfNotExists` makes the singleton on first run; the patch then applies
// the copy above on every run, including to a doc that already exists (which
// `createIfNotExists` alone would silently skip). Uploaded images live in
// fields this never touches, so they survive a re-run.
await client.createIfNotExists({ _id: "investorsPage", _type: "investorsPage" });
const result = await client.patch("investorsPage").set(FIELDS).commit();
console.log(`✓ ${dataset}: wrote ${result._id}`);
