import type { RenderedBlock } from "@/app/components/sections/registry";

/**
 * Sample block data for the styleguide (and thumbnail screenshots). Returns a
 * plausible, already-resolved block of the given type/variant — the same
 * shape the GROQ page-builder projection produces at render time.
 *
 * Extend `OVERRIDES` as each block becomes available so its styleguide entry
 * and generated thumbnail show representative content. Anything not overridden
 * falls back to a generic content stub.
 */

const LOREM_HEADING = "Building the future of health in Barbados";
const LOREM_BODY = "A resilient, sovereign pharmaceutical base — manufacturing, research, and market access built for the region and beyond.";

/** Minimal Portable Text paragraph block for rich-text samples. */
function ptParagraph(text: string, key: string) {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${key}s`, text, marks: [] }],
  };
}

const SAMPLE_STATS = [
  { value: "$31.3M", description: "Committed to Phase 1 manufacturing build-out." },
  { value: "180M", description: "Regional population served by the CARICOM market." },
  { value: "6", description: "Priority therapeutic sectors in active development." },
  { value: "2027", description: "Target year for first sovereign production line." },
];

const SAMPLE_CARDS = [
  {
    title: "A stable, sovereign base",
    body: "Barbados offers political stability, rule of law, and a government aligned behind health sovereignty.",
    bg: "#FFFFFF",
    watermark: false,
  },
  {
    title: "Market access, built in",
    body: "Regulatory pathways into CARICOM and beyond, designed alongside the manufacturing base.",
    bg: "#CAF1FF",
    watermark: false,
  },
  {
    title: "Talent and partners",
    body: "A growing pipeline of scientists, operators, and institutional partners across the region.",
    bg: "#06FE83",
    watermark: true,
  },
];

const OVERRIDES: Record<string, (variant: string) => Record<string, unknown>> = {
  headerBlock: (layout) => ({
    layout: layout || "split",
    title: "Sovereign health, built in Barbados",
    subtitle:
      "Manufacturing, research, and market access for the region and beyond.",
    primaryCta: { label: "Explore our work", href: "/initiatives" },
    secondaryCta: { label: "Partner with BPI", href: "/contact" },
    pageColor: "#01190D",
    media: null,
  }),
  ctaSection: (tone) => ({
    heading: LOREM_HEADING,
    body: LOREM_BODY,
    tone: tone || "green",
    primaryCta: { label: "Partner with BPI", href: "/contact" },
    secondaryCta: { label: "Explore our impact", href: "/impact" },
  }),
  careersSection: (tone) => ({
    eyebrow: "Careers",
    heading: "Build what matters, here",
    lead: "Join a team building sovereign health capacity for the region.",
    body: LOREM_BODY,
    tone: tone || "mint",
    primaryCta: { label: "See open roles", href: "/careers" },
  }),
  richTextBlock: () => ({
    heading: "Why sovereign manufacturing matters",
    body: [
      ptParagraph(
        "The pandemic exposed how fragile global supply chains are for the medicines a region depends on. When borders closed, access to essential treatments narrowed to whoever held the manufacturing.",
        "p1",
      ),
      ptParagraph(
        "Barbados is building the base to change that — a resilient, sovereign pharmaceutical capacity serving the Caribbean and beyond, with research, manufacturing, and market access designed together.",
        "p2",
      ),
    ],
  }),
  statsBlock: (variant) => ({
    variant: variant || "filledCards",
    heading: "The opportunity, in numbers",
    lead: "A generational build, backed by committed capital and a clear regional mandate.",
    stats: SAMPLE_STATS,
  }),
  cardGridBlock: () => ({
    heading: "Why Barbados, why now",
    intro:
      "The conditions for a sovereign pharmaceutical base rarely align. Here, they do.",
    columns: 3,
    cards: SAMPLE_CARDS,
  }),
  quoteBlock: () => ({
    eyebrow: "From our leadership",
    quote:
      "We are not waiting for the next crisis to decide whether the region can make its own medicine. We are building the answer now.",
    attributionName: "Dr. Amanda Greaves",
    attributionTitle: "Chief Executive, Barbados Pharma Inc.",
    bg: "#13362A",
    portrait: null,
  }),
  mediaBlock: (variant) => ({
    variant: variant || "fullBleedImage",
    caption: "The Phase 1 manufacturing site, Bridgetown.",
    media: null,
  }),
  statementSplitBlock: () => ({
    eyebrow: "Our approach",
    heading: "What sovereign manufacturing looks like in practice",
    body: [
      ptParagraph(
        "We build the whole chain together — research, production, and the regulatory pathways that carry medicine to the people who need it. Each part is designed around the others, not bolted on after.",
        "p1",
      ),
    ],
    statement:
      "The region should never again have to wait at the back of the queue for its own medicine.",
    primaryCta: { label: "Read our strategy", href: "/priorities" },
  }),
  listBlock: (variant) => ({
    variant: variant || "ruledRows",
    heading: "How BPI works",
    intro:
      "Four roles, one integrated base — from capital through to market access.",
    items: [
      {
        label: "Manufacturer",
        description:
          "We build and operate the sovereign production lines at the core of the base.",
      },
      {
        label: "Convenor",
        description:
          "We align government, capital, and clinical partners behind a shared mandate.",
      },
      {
        label: "Market builder",
        description:
          "We open regulatory pathways into CARICOM and beyond, designed alongside supply.",
      },
    ],
  }),
  teamBlock: () => ({
    heading: "The people building it",
    members: [
      {
        name: "Dr. Amanda Greaves",
        role: "Chief Executive",
        image: null,
        bio: [
          ptParagraph(
            "Two decades leading pharmaceutical operations across the region and beyond.",
            "b1",
          ),
        ],
      },
      {
        name: "Marcus Belle",
        role: "Head of Manufacturing",
        image: null,
        bio: [
          ptParagraph(
            "Built and scaled sterile production lines on three continents.",
            "b2",
          ),
        ],
      },
      {
        name: "Dr. Nadia Forde",
        role: "Head of Research",
        image: null,
        bio: [
          ptParagraph(
            "Leads the R&D agenda linking clinical need to production priority.",
            "b3",
          ),
        ],
      },
    ],
  }),
  timelineBlock: () => ({
    heading: "From commitment to first production",
    steps: [
      {
        label: "Secure the mandate",
        description:
          "Align government, regulators, and capital behind a single sovereign-health mandate.",
      },
      {
        label: "Build the base",
        description:
          "Break ground on the Phase 1 manufacturing site and stand up the core production lines.",
      },
      {
        label: "Open the pathways",
        description:
          "Design the regulatory routes into CARICOM and beyond, in step with supply.",
      },
      {
        label: "Reach the region",
        description:
          "Deliver the first sovereign-made medicines to patients across the Caribbean.",
      },
    ],
  }),
  tabsBlock: () => ({
    heading: "How the base fits together",
    tabs: [
      {
        title: "Manufacturing",
        body: [
          ptParagraph(
            "Sterile, GMP-grade production lines sit at the core of the base — built to serve regional demand first, with headroom to export.",
            "t1",
          ),
        ],
      },
      {
        title: "Research",
        body: [
          ptParagraph(
            "An R&D agenda that links clinical need directly to what we choose to produce, so the pipeline always tracks the region's health priorities.",
            "t2",
          ),
        ],
      },
      {
        title: "Market access",
        body: [
          ptParagraph(
            "Regulatory pathways designed alongside supply, so approval and availability move together rather than in sequence.",
            "t3",
          ),
        ],
      },
    ],
  }),
  carouselBlock: () => ({
    heading: "Inside the build",
    intro:
      "A look at the sites, teams, and partnerships taking shape across the base.",
    slides: [
      {
        title: "Phase 1 site, Bridgetown",
        body: "The first sovereign manufacturing footprint, now under construction.",
        image: null,
      },
      {
        title: "The research bench",
        body: "Linking clinical need to production priority from day one.",
        image: null,
      },
      {
        title: "Regional partners",
        body: "Government, capital, and clinical institutions aligned behind one mandate.",
        image: null,
      },
      {
        title: "The talent pipeline",
        body: "A growing base of scientists and operators across the region.",
        image: null,
      },
    ],
  }),
  contactRowsBlock: () => ({
    heading: "Get in touch",
    rows: [
      {
        label: "Partner with us",
        value: "partnerships@barbadospharmainc.org",
        copyValue: null,
      },
      {
        label: "Investor relations",
        value: "investors@barbadospharmainc.org",
        copyValue: null,
      },
      {
        label: "Find us",
        value: "Bridgetown, Barbados",
        copyValue: null,
      },
    ],
  }),
};

export function sampleBlock(type: string, variant = ""): RenderedBlock {
  const extra = OVERRIDES[type]?.(variant) ?? {
    heading: LOREM_HEADING,
    body: LOREM_BODY,
  };
  const variantField =
    variant && !("variant" in extra) && !("layout" in extra) && !("tone" in extra)
      ? { variant }
      : {};
  return {
    _type: type,
    _key: `sample-${type}-${variant || "default"}`,
    enabled: true,
    ...variantField,
    ...extra,
  } as RenderedBlock;
}
