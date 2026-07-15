import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * A sector — one of the six structural components of the Caribbean's
 * pharmaceutical future. Drives the /sectors listing (title, subtitle, card
 * image) and its own /sectors/[slug] detail page. Modeled on the `priority`
 * document but focused on the sections a sector page needs.
 *
 * The `slug` should match the corresponding molecule `nodeId` on the Home page
 * (e.g. "market-access") so the home diagram's `/sectors/{nodeId}` links
 * resolve to the right detail page.
 */
export const sector = defineType({
  name: "sector",
  title: "Sector",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "header", title: "Header" },
    { name: "overview", title: "Overview" },
    { name: "capabilities", title: "Capabilities" },
    { name: "stats", title: "Stats" },
    { name: "quote", title: "Quote" },
    { name: "motion", title: "In motion" },
    { name: "sections", title: "Page sections" },
  ],
  fields: [
    // ──────────────────────────────────────────────────────────── Content ──
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      group: "content",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "URL path under /sectors. Match the Home page molecule's slot id (e.g. market-access) so the diagram links here.",
      options: { source: "title", maxLength: 96 },
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      description:
        "Short line shown under the title on the listing card and the detail hero.",
      type: "internationalizedArrayText",
      group: "content",
    }),
    defineField({
      name: "order",
      title: "Order",
      description:
        "Controls the display order in the sectors list. Lower numbers first. Leave blank to fall back to title order.",
      type: "number",
      group: "content",
    }),
    defineField({
      name: "cardImage",
      title: "Card image",
      description:
        "Shown in the sector's card in the /sectors listing, and as a fallback for the detail hero.",
      type: "imageWithAlt",
      group: "content",
    }),

    // ───────────────────────────────────────────────────────────── Header ──
    defineField({
      name: "heroImage",
      title: "Hero image",
      description:
        "Full-bleed image on the detail-page header. Falls back to the card image, then a Home page photo, when empty.",
      type: "imageWithAlt",
      group: "header",
    }),
    defineField({
      name: "pageColor",
      title: "Page color (dark)",
      description:
        "Dark background for the detail-page hero. Also tints the footer on this page.",
      type: "hexColor",
      group: "header",
      initialValue: "#01190d",
    }),
    defineField({
      name: "sectionBgColor",
      title: "Section background color (light)",
      description:
        "Light canvas behind the In motion / Quote sections.",
      type: "hexColor",
      group: "header",
      initialValue: "#E9F7EE",
    }),

    // ─────────────────────────────────────────────────────────── Overview ──
    defineField({
      name: "showOverview",
      title: "Show overview section",
      type: "boolean",
      group: "overview",
      initialValue: true,
    }),
    defineField({
      name: "overviewHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "overview",
      hidden: ({ parent }) => parent?.showOverview === false,
    }),
    defineField({
      name: "overviewBody",
      title: "Body",
      description:
        "Separate paragraphs with a blank line — each becomes its own spaced block.",
      type: "internationalizedArrayText",
      group: "overview",
      hidden: ({ parent }) => parent?.showOverview === false,
    }),

    // ─────────────────────────────────────────────────────── Capabilities ──
    defineField({
      name: "showCapabilities",
      title: "Show capabilities section",
      type: "boolean",
      group: "capabilities",
      initialValue: false,
    }),
    defineField({
      name: "capabilitiesHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "capabilities",
      hidden: ({ parent }) => !parent?.showCapabilities,
    }),
    defineField({
      name: "capabilities",
      title: "Capabilities",
      type: "array",
      group: "capabilities",
      hidden: ({ parent }) => !parent?.showCapabilities,
      of: [
        defineArrayMember({
          type: "object",
          name: "capability",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "internationalizedArrayText",
            }),
          ],
          preview: {
            select: { title: "title.0.value", subtitle: "body.0.value" },
          },
        }),
      ],
    }),

    // ────────────────────────────────────────────────────────────── Stats ──
    defineField({
      name: "showStats",
      title: "Show stats section",
      type: "boolean",
      group: "stats",
      initialValue: false,
    }),
    defineField({
      name: "statsHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "stats",
      hidden: ({ parent }) => !parent?.showStats,
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      group: "stats",
      hidden: ({ parent }) => !parent?.showStats,
      of: [defineArrayMember({ type: "stat" })],
      validation: (Rule) => Rule.max(5),
    }),

    // ────────────────────────────────────────────────────────────── Quote ──
    defineField({
      name: "showQuote",
      title: "Show quote section",
      type: "boolean",
      group: "quote",
      initialValue: false,
    }),
    defineField({
      name: "quoteEyebrow",
      title: "Eyebrow",
      type: "internationalizedArrayString",
      group: "quote",
      hidden: ({ parent }) => !parent?.showQuote,
    }),
    defineField({
      name: "quoteHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "quote",
      hidden: ({ parent }) => !parent?.showQuote,
    }),
    defineField({
      name: "quoteLead",
      title: "Lead paragraph",
      description: "Sits above the rule, before the pull-quote.",
      type: "internationalizedArrayText",
      group: "quote",
      hidden: ({ parent }) => !parent?.showQuote,
    }),
    defineField({
      name: "quoteText",
      title: "Quote",
      type: "internationalizedArrayText",
      group: "quote",
      hidden: ({ parent }) => !parent?.showQuote,
    }),
    defineField({
      name: "quoteAttribution",
      title: "Attribution name",
      type: "internationalizedArrayString",
      group: "quote",
      hidden: ({ parent }) => !parent?.showQuote,
    }),
    defineField({
      name: "quoteRole",
      title: "Attribution role",
      type: "internationalizedArrayString",
      group: "quote",
      hidden: ({ parent }) => !parent?.showQuote,
    }),
    defineField({
      name: "quotePortrait",
      title: "Attribution portrait",
      description:
        "Round headshot. Falls back to the Home page's leader portrait when empty.",
      type: "imageWithAlt",
      group: "quote",
      hidden: ({ parent }) => !parent?.showQuote,
    }),

    // ────────────────────────────────────────────────────────── In motion ──
    defineField({
      name: "showMotion",
      title: "Show “in motion” section",
      type: "boolean",
      group: "motion",
      initialValue: false,
    }),
    defineField({
      name: "motionHeading",
      title: "Heading",
      description: "e.g. “In Motion”.",
      type: "internationalizedArrayString",
      group: "motion",
      hidden: ({ parent }) => !parent?.showMotion,
    }),
    defineField({
      name: "motionTone",
      title: "Tone",
      description:
        "Light = navy text on the pale canvas with the convergence graphic; Dark = white text on a navy canvas, better with an image.",
      type: "string",
      group: "motion",
      options: {
        list: [
          { title: "Light", value: "light" },
          { title: "Dark (navy)", value: "dark" },
        ],
        layout: "radio",
      },
      initialValue: "light",
      hidden: ({ parent }) => !parent?.showMotion,
    }),
    defineField({
      name: "motionCta",
      title: "Header button",
      description: "Optional button shown at the top-right of the section.",
      type: "cta",
      group: "motion",
      hidden: ({ parent }) => !parent?.showMotion,
    }),
    defineField({
      name: "motionImage",
      title: "Image",
      description:
        "Optional image for the right column. When empty, the convergence graphic is shown (dark tone falls back to a Home photo).",
      type: "imageWithAlt",
      group: "motion",
      hidden: ({ parent }) => !parent?.showMotion,
    }),
    defineField({
      name: "motionItems",
      title: "Initiatives",
      description: "Live initiatives. The list auto-cycles through them.",
      type: "array",
      group: "motion",
      hidden: ({ parent }) => !parent?.showMotion,
      of: [
        defineArrayMember({
          type: "object",
          name: "motionItem",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "internationalizedArrayText",
            }),
          ],
          preview: {
            select: { title: "title.0.value", subtitle: "body.0.value" },
          },
        }),
      ],
    }),

    // ────────────────────────────────────────────────────── Page sections ──
    defineField({
      name: "pageSections",
      title: "Page sections",
      description:
        "Add and reorder modular sections (Call to Action, Careers) shown at the bottom of the detail page.",
      type: "array",
      group: "sections",
      of: [
        defineArrayMember({ type: "ctaSection" }),
        defineArrayMember({ type: "careersSection" }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title.0.value", subtitle: "subtitle.0.value" },
    prepare: ({ title, subtitle }) => ({
      title: title || "(untitled sector)",
      subtitle,
    }),
  },
});
