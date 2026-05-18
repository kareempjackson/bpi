import { defineArrayMember, defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "hero", title: "Hero", default: true },
    { name: "leader", title: "Leader" },
    { name: "architecture", title: "Priorities" },
    { name: "sectors", title: "Sectors" },
    { name: "why", title: "Why BPI" },
    { name: "initiatives", title: "Initiatives" },
    { name: "blog", title: "Blog" },
    { name: "building", title: "Building / Footer CTA" },
  ],
  fields: [
    // ──────────────────────────────────────────────────────────────── SEO ──
    defineField({
      name: "seoTitle",
      title: "Page title (browser tab & SEO)",
      type: "string",
      group: "seo",
      initialValue: "Barbados Pharmaceutical Inc",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      group: "seo",
      initialValue: "Barbados Pharmaceutical Inc",
      validation: (Rule) => Rule.required(),
    }),

    // ─────────────────────────────────────────────────────────────── Hero ──
    defineField({
      name: "heroHeadline",
      title: "Headline",
      type: "string",
      group: "hero",
      initialValue: "Building the Caribbean's pharmaceutical gateway.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroBody",
      title: "Body",
      type: "text",
      rows: 4,
      group: "hero",
      initialValue:
        "97% of Caribbean medicines are imported. BPI is building the manufacturing capacity, supply chain, and regulatory infrastructure to change that.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroCtaHref",
      title: "Hero CTA link",
      type: "string",
      group: "hero",
      description:
        "Destination for the arrow button beside the hero body. Leave blank to keep the button non-clickable.",
    }),
    defineField({
      name: "heroBackground",
      title: "Background (video or image)",
      type: "object",
      group: "hero",
      description:
        "Choose video for the animated hero or image for a still. All assets live on Sanity.",
      fields: [
        defineField({
          name: "kind",
          title: "Type",
          type: "string",
          options: {
            list: [
              { title: "Video", value: "video" },
              { title: "Image", value: "image" },
            ],
            layout: "radio",
          },
          initialValue: "video",
        }),
        defineField({
          name: "video",
          title: "Video upload (MP4 recommended, < 100 MB)",
          type: "file",
          options: { accept: "video/mp4,video/webm" },
          hidden: ({ parent }) => parent?.kind !== "video",
        }),
        defineField({
          name: "image",
          title: "Image",
          type: "imageWithAlt",
          hidden: ({ parent }) => parent?.kind !== "image",
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value: unknown) => {
          const bg = value as
            | {
                kind?: string;
                video?: { asset?: unknown };
                image?: { asset?: unknown };
              }
            | undefined;
          const kind = bg?.kind ?? "video";
          if (kind === "video") {
            if (!bg?.video?.asset) return "Upload a video.";
          } else if (kind === "image") {
            if (!bg?.image?.asset) return "Upload an image.";
          }
          return true;
        }),
    }),

    // ───────────────────────────────────────────────────────────── Leader ──
    defineField({
      name: "leaderQuote",
      title: "Quote",
      type: "text",
      rows: 4,
      group: "leader",
      initialValue:
        "We are building the vehicle that protects our citizens and re-writes what we believe about ourselves.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leaderBody",
      title: "Body",
      type: "text",
      rows: 3,
      group: "leader",
      initialValue:
        "Barbados Pharmaceutical Inc. is building the gateway that connects Caribbean demand with global pharmaceutical expertise.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leaderName",
      title: "Name",
      type: "string",
      group: "leader",
      initialValue: "Dr Cindi A. Lewis",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leaderTitle",
      title: "Title",
      type: "string",
      group: "leader",
      initialValue: "Deputy Chief Executive Officer",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leaderOrg",
      title: "Organisation",
      type: "string",
      group: "leader",
      initialValue: "Barbados Pharmaceutical Inc.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leaderQuoteImage",
      title: "Primary image (left)",
      type: "imageWithAlt",
      group: "leader",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leaderPortraitImage",
      title: "Portrait (right)",
      type: "imageWithAlt",
      group: "leader",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leaderSocials",
      title: "Social links",
      type: "array",
      group: "leader",
      of: [defineArrayMember({ type: "socialLink" })],
      initialValue: [
        { _type: "socialLink", _key: "soc-1", kind: "Website", href: "#", label: "Website" },
        { _type: "socialLink", _key: "soc-2", kind: "LinkedIn", href: "#" },
        { _type: "socialLink", _key: "soc-3", kind: "X", href: "#" },
        { _type: "socialLink", _key: "soc-4", kind: "Instagram", href: "https://www.instagram.com/barbadospharmainc" },
      ],
    }),

    // ─────────────────────────────────────────────── Architecture of Care ──
    defineField({
      name: "architectureHeading",
      title: "Heading",
      type: "string",
      group: "architecture",
      initialValue: "Four Strategic Priorities",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "architectureDescription",
      title: "Description",
      type: "text",
      rows: 3,
      group: "architecture",
      initialValue:
        "Each one a deliberate step toward a Caribbean that manufactures, distributes, and regulates its own medicines.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "architectureItems",
      title: "Priority cards",
      type: "array",
      group: "architecture",
      of: [defineArrayMember({ type: "priorityCard" })],
      initialValue: [
        {
          _type: "priorityCard",
          _key: "pc-investment",
          title: "Attract & Facilitate Investment",
          description:
            "Giving global capital a clear pathway into the Caribbean pharmaceutical market.",
          href: "/priorities/investment",
          color: "#CAF1FF",
        },
        {
          _type: "priorityCard",
          _key: "pc-capacity",
          title: "Build & Incubate Capacity",
          description: "Moving strategic projects from concept to execution.",
          href: "/priorities/capacity",
          color: "#dde885",
        },
        {
          _type: "priorityCard",
          _key: "pc-supply",
          title: "Strengthen Regional Supply Chains",
          description:
            "Building the trade corridors and distribution infrastructure the Caribbean depends on.",
          href: "/priorities/supply-chains",
          color: "#38fe9c",
        },
        {
          _type: "priorityCard",
          _key: "pc-ecosystem",
          title: "Build the Ecosystem Foundations",
          description:
            "Developing the regulatory, workforce, and research foundations for a permanent sector.",
          href: "/priorities/ecosystem",
          color: "#b5d4e6",
        },
      ],
    }),

    // ──────────────────────────────────────────────────────────── Sectors ──
    defineField({
      name: "sectorsHeading",
      title: "Heading",
      type: "string",
      group: "sectors",
      initialValue: "Shifting Trade Prowess in Favour of the Global South",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sectorsBody",
      title: "Body",
      type: "text",
      rows: 3,
      group: "sectors",
      initialValue:
        "BPI is building across six sectors, each one a structural component of the Caribbean's pharmaceutical future.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sectorsNodes",
      title: "Sectors (text + image only; positions are fixed)",
      type: "array",
      group: "sectors",
      of: [defineArrayMember({ type: "sectorNode" })],
      description:
        "Each entry fills a fixed position in the molecule diagram (selected via the Slot dropdown). Up to 6 — only sectors whose Slot matches a position in the diagram will render.",
      initialValue: [
        {
          _type: "sectorNode",
          _key: "sn-01",
          nodeId: "market-access",
          num: "01",
          title: "Market Access & Trade Development",
          description:
            "Opening pharmaceutical trade routes across CARICOM, Latin America, Africa, and the Global South.",
        },
        {
          _type: "sectorNode",
          _key: "sn-02",
          nodeId: "workforce",
          num: "02",
          title: "Workforce & Talent Development",
          description:
            "Building the skilled workforce Caribbean pharmaceutical production depends on.",
        },
        {
          _type: "sectorNode",
          _key: "sn-03",
          nodeId: "research-development",
          num: "03",
          title: "Research & Development",
          description:
            "Establishing Barbados as a credible site for pharmaceutical research and technology transfer.",
        },
        {
          _type: "sectorNode",
          _key: "sn-04",
          nodeId: "innovation-technology",
          num: "04",
          title: "Innovation & Technology",
          description:
            "Creating the conditions for pharmaceutical innovation to take root and scale.",
        },
        {
          _type: "sectorNode",
          _key: "sn-05",
          nodeId: "regulatory-policy",
          num: "05",
          title: "Regulatory Development & Policy",
          description:
            "Building the regulatory framework that gives investors and manufacturers confidence to commit.",
        },
        {
          _type: "sectorNode",
          _key: "sn-06",
          nodeId: "investment-financing",
          num: "06",
          title: "Investment & Financing",
          description:
            "Connecting viable projects to the right capital at the right stage.",
        },
      ],
      validation: (Rule) => Rule.max(6),
    }),

    // ─────────────────────────────────────────────────────────── Why BPI ──
    defineField({
      name: "whyQuote",
      title: "Quote",
      type: "text",
      rows: 4,
      group: "why",
      initialValue:
        '"Perhaps the biggest game changer since we have come to office is addressing the issue of pharmaceutical equity and creating a platform for jobs, investment and earnings for a pharmaceutical industry in Barbados for the first time."',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "whyAttribution",
      title: "Attribution",
      type: "string",
      group: "why",
      initialValue: "Rt. Hon. Mia Amor Mottley, Prime Minister of Barbados",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "whyBody",
      title: "Body",
      type: "text",
      rows: 3,
      group: "why",
      initialValue:
        "BPI is the institution built to deliver on that mandate, reducing pharmaceutical import dependency and building health sovereignty across the Caribbean.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "whyCta",
      title: "CTA",
      type: "cta",
      group: "why",
      initialValue: { label: "Why BPI?", href: "/why-bpi" },
    }),
    defineField({
      name: "whyImage",
      title: "Image",
      type: "imageWithAlt",
      group: "why",
      validation: (Rule) => Rule.required(),
    }),

    // ──────────────────────────────────────────────────────── Initiatives ──
    defineField({
      name: "initiativesEyebrow",
      title: "Eyebrow",
      type: "string",
      group: "initiatives",
      initialValue: "WHAT WE'RE BUILDING",
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
      name: "initiativesViewAllHref",
      title: "View-all link",
      type: "string",
      group: "initiatives",
      initialValue: "/initiatives",
    }),
    defineField({
      name: "initiativesDefaultImage",
      title: "Default image (when no row hovered)",
      type: "imageWithAlt",
      group: "initiatives",
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

    // ─────────────────────────────────────────────────────────────── Blog ──
    defineField({
      name: "blogHeading",
      title: "Section heading",
      type: "string",
      group: "blog",
      initialValue: "Latest from BPI",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "blogShowCount",
      title: "Number of posts to show",
      type: "number",
      group: "blog",
      initialValue: 3,
      validation: (Rule) => Rule.min(0).max(12).integer(),
    }),

    // ───────────────────────────────────────────────────────── Building ──
    defineField({
      name: "buildingHeadlineLine1",
      title: "Headline (line 1)",
      type: "string",
      group: "building",
      initialValue: "The gateway is open.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "buildingHeadlineLine2",
      title: "Headline (line 2)",
      type: "string",
      group: "building",
      initialValue: "Ready to build with us?",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "buildingImage",
      title: "Background image",
      type: "imageWithAlt",
      group: "building",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "buildingPrimaryCta",
      title: "Primary CTA",
      type: "cta",
      group: "building",
      initialValue: { label: "Get in touch", href: "/contact" },
    }),
    defineField({
      name: "buildingSecondaryCta",
      title: "Secondary CTA",
      type: "cta",
      group: "building",
      initialValue: { label: "Our initiatives", href: "/initiatives" },
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home page" }),
  },
});
