import { defineArrayMember, defineField, defineType } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "hero", title: "Hero", default: true },
    { name: "vision", title: "Vision" },
    { name: "difference", title: "Difference We Make" },
    { name: "mission", title: "Mission" },
    { name: "stats", title: "By the Numbers" },
    { name: "banner", title: "Banner" },
    { name: "initiatives", title: "Initiatives" },
    { name: "leadership", title: "Leadership" },
  ],
  fields: [
    // ──────────────────────────────────────────────────────────────── SEO ──
    defineField({
      name: "seoTitle",
      title: "Page title (browser tab & SEO)",
      type: "string",
      group: "seo",
      initialValue: "About BPI | Barbados Pharmaceutical Inc.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      group: "seo",
      initialValue:
        "BPI is the institution advancing pharmaceutical manufacturing, investment, and essential medicines access across the Caribbean and beyond.",
      validation: (Rule) => Rule.required(),
    }),

    // ─────────────────────────────────────────────────────────────── Hero ──
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "imageWithAlt",
      group: "hero",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroHeadline",
      title: "Headline",
      type: "text",
      rows: 2,
      group: "hero",
      description: "Line breaks are preserved.",
      initialValue:
        "We're not a traditional agency.\nWe're a market creator.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroSubheading",
      title: "Subheading",
      type: "text",
      rows: 2,
      group: "hero",
      initialValue:
        "Established to bring access to essential medicines to Bajans, Caribbean people and beyond.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroCta",
      title: "Hero CTA",
      type: "cta",
      group: "hero",
      initialValue: { label: "Partner with BPI", href: "/contact" },
    }),

    // ───────────────────────────────────────────────────────────── Vision ──
    defineField({
      name: "visionHeading",
      title: "Heading",
      type: "string",
      group: "vision",
      initialValue: "Our Vision",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "visionDescription",
      title: "Description",
      type: "text",
      rows: 3,
      group: "vision",
      initialValue:
        "To transform Barbados into the trusted pharmaceutical manufacturing gateway for the Caribbean and the Global South.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "visionPrimaryCta",
      title: "Primary CTA",
      type: "cta",
      group: "vision",
      initialValue: { label: "Partner With BPI", href: "/contact" },
    }),
    defineField({
      name: "visionSecondaryCta",
      title: "Secondary CTA",
      type: "cta",
      group: "vision",
      initialValue: { label: "Explore Our Impact", href: "/#initiative" },
    }),
    defineField({
      name: "visionBg",
      title: "Section background color",
      type: "hexColor",
      group: "vision",
      initialValue: "#CAF1FF",
    }),
    defineField({
      name: "pillars",
      title: "Pillars",
      type: "array",
      group: "vision",
      of: [defineArrayMember({ type: "pillar" })],
      initialValue: [
        {
          _type: "pillar",
          _key: "pillar-manufacture",
          eyebrow: "Manufacture",
          description:
            "Local production of essential medicines, starting with IV fluids, scaling to ARVs, diagnostics, and NCDs.",
          bg: "#ffffff",
          highlight: false,
        },
        {
          _type: "pillar",
          _key: "pillar-distribute",
          eyebrow: "Distribute",
          description:
            "A regional logistics\nmodel that puts medicines where they are needed, reliably and at lower cost.",
          bg: "#83ffc1",
          highlight: true,
        },
        {
          _type: "pillar",
          _key: "pillar-build",
          eyebrow: "Build",
          description:
            "The regulatory, workforce, and institutional foundations that sustain a pharmaceutical sector for generations.",
          bg: "#ffffff",
          highlight: false,
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),

    // ───────────────────────────────────────────── Difference We Make ──
    defineField({
      name: "differenceLeftImage",
      title: "Left image (rendered inside the notched AboutShape)",
      type: "imageWithAlt",
      group: "difference",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "differenceRightImage",
      title: "Right image (rendered as a square)",
      type: "imageWithAlt",
      group: "difference",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "differenceHeading",
      title: "Heading",
      type: "string",
      group: "difference",
      initialValue: "The Difference We Make",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "differenceBody",
      title: "Body",
      type: "text",
      rows: 8,
      group: "difference",
      initialValue:
        "97% of Caribbean medicines are imported. Behind that number is a nurse buying her own gloves, a 62-year-old woman receiving her IV in a bag designed for a newborn, a mother bringing her own sheets to a public ward. BPI exists to change that. We celebrate diversity and are dedicated to providing fair employment opportunities to all qualified applicants regardless of background, identity, or personal circumstances. At BPI, we believe innovation thrives when different perspectives, experiences, and ideas come together to shape the future of healthcare.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "differencePrimaryCta",
      title: "Primary CTA",
      type: "cta",
      group: "difference",
      initialValue: { label: "Partner With BPI", href: "/contact" },
    }),
    defineField({
      name: "differenceSecondaryCta",
      title: "Secondary CTA",
      type: "cta",
      group: "difference",
      initialValue: { label: "Our Ecosystem", href: "/#ecosystem" },
    }),
    defineField({
      name: "differenceOuterBg",
      title: "Outer card background colour (hex)",
      type: "string",
      group: "difference",
      initialValue: "#CAF1FF",
    }),
    defineField({
      name: "differenceInnerBg",
      title: "Inner statement card background colour (hex)",
      type: "string",
      group: "difference",
      initialValue: "#E5FFF2",
    }),

    // ──────────────────────────────────────────────────────────── Mission ──
    defineField({
      name: "missionHeading",
      title: "Heading",
      type: "string",
      group: "mission",
      initialValue: "Our Mission",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "missionDescription",
      title: "Description",
      type: "text",
      rows: 4,
      group: "mission",
      initialValue:
        "To accelerate access to high-quality, affordable medicines across the Caribbean by building a resilient pharmaceutical industry, attracting global investment, and positioning Barbados as the gateway to the region and beyond.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "missionCards",
      title: "Mission cards",
      type: "array",
      group: "mission",
      of: [defineArrayMember({ type: "missionCard" })],
      initialValue: [
        {
          _type: "missionCard",
          _key: "mc-market-access",
          title: "Market Access & Trade Development",
          description:
            "Opening pharmaceutical trade routes across CARICOM, Latin America, Africa, and the Global South.",
          href: "/missions/market-access",
          bg: "#CAF1FF",
        },
        {
          _type: "missionCard",
          _key: "mc-workforce",
          title: "Workforce & Talent Development",
          description:
            "Building the skilled workforce Caribbean pharmaceutical production depends on.",
          href: "/missions/workforce",
          bg: "#9bffcd",
        },
        {
          _type: "missionCard",
          _key: "mc-rd",
          title: "Research & Development",
          description:
            "Establishing Barbados as a credible site for pharmaceutical research and technology transfer.",
          href: "/missions/research-development",
          bg: "#CAF1FF",
        },
        {
          _type: "missionCard",
          _key: "mc-innovation",
          title: "Innovation & Technology",
          description:
            "Creating the conditions for pharmaceutical innovation to take root and scale.",
          href: "/missions/innovation-technology",
          bg: "#9bffcd",
        },
        {
          _type: "missionCard",
          _key: "mc-regulatory",
          title: "Regulatory Development & Policy",
          description:
            "Building the regulatory framework that gives investors and manufacturers confidence to commit.",
          href: "/missions/regulatory-policy",
          bg: "#CAF1FF",
        },
        {
          _type: "missionCard",
          _key: "mc-investment",
          title: "Investment & Financing",
          description:
            "Connecting viable projects to the right capital at the right stage.",
          href: "/missions/investment-financing",
          bg: "#9bffcd",
        },
      ],
    }),

    // ──────────────────────────────────────────── Stats / By the Numbers ──
    defineField({
      name: "statsHeading",
      title: "Heading",
      type: "string",
      group: "stats",
      initialValue: "By the Numbers",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "statsDescription",
      title: "Description",
      type: "text",
      rows: 4,
      group: "stats",
      initialValue:
        "In three years, BPI has gone from a founding mandate to five bankable projects and the first pharmaceutical trade corridor between Africa and the Caribbean.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      group: "stats",
      of: [defineArrayMember({ type: "stat" })],
      initialValue: [
        {
          _type: "stat",
          _key: "stat-1",
          value: "$31.3M",
          description:
            "Total investment in the AMA IV fluids manufacturing facility at Grantley Adams Industrial Estate.",
        },
        {
          _type: "stat",
          _key: "stat-2",
          value: "12M",
          description:
            "Bags of IV fluids to be produced annually, the first of their kind manufactured in the Caribbean.",
        },
        {
          _type: "stat",
          _key: "stat-3",
          value: "180M",
          description:
            "Lives touched by the PAHO revolving fund that BPI's regional supply hub will support.",
        },
        {
          _type: "stat",
          _key: "stat-4",
          value: "€3M",
          description:
            "EU PharmaNext investment mobilized to build a transatlantic pharmaceutical investment bridge.",
        },
      ],
    }),

    // ───────────────────────────────────────────────────────────── Banner ──
    defineField({
      name: "bannerImage",
      title: "Mid-page banner image",
      type: "imageWithAlt",
      group: "banner",
    }),

    // ──────────────────────────────────────────────────────── Initiatives ──
    defineField({
      name: "initiativesEyebrow",
      title: "Eyebrow",
      type: "string",
      group: "initiatives",
      initialValue: "Where Investment Meets Execution",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "initiativesHeading",
      title: "Heading",
      type: "string",
      group: "initiatives",
      initialValue: "Initiatives",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "initiativesShowCount",
      title: "Number of initiatives to show",
      type: "number",
      group: "initiatives",
      description:
        "Edit individual initiatives in the Initiatives list. The latest N (featured first) are shown here.",
      initialValue: 4,
      validation: (Rule) => Rule.min(0).max(12).integer(),
    }),

    // ───────────────────────────────────────────────────────── Leadership ──
    defineField({
      name: "leadershipHeading",
      title: "Heading",
      type: "string",
      group: "leadership",
      initialValue: "Leadership",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leadershipDescription",
      title: "Description",
      type: "text",
      rows: 3,
      group: "leadership",
      initialValue:
        "BPI is led by a team of global health strategists, investment specialists, and pharmaceutical sector experts united by a single mandate.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leadershipBg",
      title: "Section background color",
      type: "hexColor",
      group: "leadership",
      initialValue: "#CAF1FF",
    }),
    defineField({
      name: "leaders",
      title: "Leaders",
      type: "array",
      group: "leadership",
      of: [defineArrayMember({ type: "leader" })],
      initialValue: Array.from({ length: 8 }, (_, i) => ({
        _type: "leader",
        _key: `leader-${i + 1}`,
        name: "Name here",
        role: "Short text here title/something",
      })),
    }),
    defineField({
      name: "leadershipContactHeading",
      title: "Contact card heading",
      type: "string",
      group: "leadership",
      initialValue: "Contact Us",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leadershipContactDescription",
      title: "Contact card description",
      type: "text",
      rows: 3,
      group: "leadership",
      initialValue:
        "The journey to health resilience and regional health security will require partnerships, not solo action.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leadershipContactPrimaryCta",
      title: "Contact card primary CTA",
      type: "cta",
      group: "leadership",
      initialValue: { label: "Contact Us", href: "/contact" },
    }),
    defineField({
      name: "leadershipContactSecondaryCta",
      title: "Contact card secondary CTA",
      type: "cta",
      group: "leadership",
      initialValue: { label: "Our initiatives", href: "/#initiative" },
    }),
  ],
  preview: {
    prepare: () => ({ title: "About page" }),
  },
});
