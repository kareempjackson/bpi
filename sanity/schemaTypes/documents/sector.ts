import { defineArrayMember, defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

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
    { name: "practice", title: "In practice" },
    { name: "operational", title: "Operational now" },
    { name: "beingBuilt", title: "Being built" },
    { name: "highlight", title: "Highlight" },
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
      name: "headerLayout",
      title: "Header layout",
      description:
        "How the title, subtitle, buttons and hero image are arranged. Split = title left / copy right with a full-bleed photo below. Centered = everything centred. Side by side = text beside a contained image. Overlay = copy set over the photo. Showcase = full-height hero with the copy anchored bottom-left beside a tall image on the right. Spotlight = tall image on the left with the title top-right and a portrait pin + copy anchored bottom-right. Masthead = the title's first word sits above a tall left image and the rest flows to its right, with a portrait pin + copy bottom-right.",
      type: "string",
      group: "header",
      options: {
        list: [
          { title: "Split (title left, copy right)", value: "split" },
          { title: "Centered", value: "centered" },
          { title: "Side by side", value: "sideBySide" },
          { title: "Overlay (copy over image)", value: "overlay" },
          { title: "Showcase (copy bottom-left, tall image right)", value: "showcase" },
          { title: "Spotlight (tall image left, pin + copy bottom-right)", value: "spotlight" },
          { title: "Masthead (split title around a tall image, pin + copy)", value: "masthead" },
        ],
        layout: "radio",
      },
      initialValue: "split",
    }),
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
      name: "heroHeadingColor",
      title: "Heading / accent color",
      description:
        "Accent for the header title and the primary button. Leave empty to use the default mint accent.",
      type: "hexColor",
      group: "header",
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
    defineField({
      name: "heroPrimaryCta",
      title: "Header primary button",
      description:
        "Filled pill in the header, beside the subtitle (e.g. “Partner With BPI”).",
      type: "cta",
      group: "header",
    }),
    defineField({
      name: "heroSecondaryCta",
      title: "Header secondary button",
      description:
        "Outlined pill next to the primary button (e.g. “Explore Our Impact”).",
      type: "cta",
      group: "header",
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
      type: "internationalizedArrayPortableText",
      group: "overview",
      hidden: ({ parent }) => parent?.showOverview === false,
    }),

    // ─────────────────────────────────────────────────────── In practice ──
    defineField({
      name: "showPractice",
      title: "Show “in practice” section",
      type: "boolean",
      group: "practice",
      initialValue: false,
    }),
    defineField({
      name: "practiceHeading",
      title: "Heading",
      description: "e.g. “What This Looks Like In Practice”.",
      type: "internationalizedArrayString",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practiceLead",
      title: "Lead paragraph",
      description: "Larger, emphasized paragraph shown first in the right column.",
      type: "internationalizedArrayPortableText",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practiceBody",
      title: "Body",
      description:
        "Supporting paragraphs. Separate paragraphs with a blank line — each becomes its own block.",
      type: "internationalizedArrayPortableText",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practiceListHeading",
      title: "List heading",
      description: "Subheading above the bullet list (e.g. “Programs Underway”).",
      type: "internationalizedArrayString",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practiceList",
      title: "List items",
      description: "Bulleted items, each a bold term followed by a description.",
      type: "array",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
      of: [
        defineArrayMember({
          type: "object",
          name: "practiceListItem",
          fields: [
            defineField({
              name: "term",
              title: "Term (bold)",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "body",
              title: "Description",
              type: "internationalizedArrayText",
            }),
          ],
          preview: {
            select: { title: "term", subtitle: "body" },
            prepare: ({ title, subtitle }) => ({
              title: i18nValue(title),
              subtitle: i18nValue(subtitle),
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "practiceCreatesLabel",
      title: "Closing eyebrow",
      description: "Small label above the closing statement (e.g. “What This Creates”).",
      type: "internationalizedArrayString",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practiceCreatesStatement",
      title: "Closing statement",
      description: "Large statement shown full-width below the columns.",
      type: "internationalizedArrayText",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practicePrimaryCta",
      title: "Primary button",
      description: "Filled button (e.g. “Partner With BPI”).",
      type: "cta",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practiceSecondaryCta",
      title: "Secondary button",
      description: "Outlined button beside the primary (e.g. “Contact us”).",
      type: "cta",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practiceImage",
      title: "Image",
      description:
        "Full-width image below the text. Falls back to a Home/sector photo when empty (suppressed when Cards are set).",
      type: "imageWithAlt",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practiceCards",
      title: "Cards",
      description:
        "Up to three colour-toned cards shown in a row below the buttons (e.g. Milestones / International Partnerships / What’s Next). When present they replace the fallback image.",
      type: "array",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
      validation: (Rule) => Rule.max(3),
      of: [
        defineArrayMember({
          type: "object",
          name: "practiceCard",
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
            defineField({
              name: "tone",
              title: "Tone",
              type: "string",
              options: {
                list: [
                  { title: "White", value: "default" },
                  { title: "Blue", value: "blue" },
                  { title: "Green", value: "green" },
                ],
                layout: "radio",
              },
              initialValue: "default",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "body" },
            prepare: ({ title, subtitle }) => ({
              title: i18nValue(title),
              subtitle: i18nValue(subtitle),
            }),
          },
        }),
      ],
    }),

    // ─────────────────────────────────────────────────────── Operational ──
    // A second "practice"-style block (heading left; a bulleted list of live
    // programs + a button on the right; full-width image below), rendered with
    // the same SectorPracticeSection component.
    defineField({
      name: "showOperational",
      title: "Show “operational now” section",
      type: "boolean",
      group: "operational",
      initialValue: false,
    }),
    defineField({
      name: "operationalHeading",
      title: "Heading",
      description: "e.g. “Operational Now”.",
      type: "internationalizedArrayString",
      group: "operational",
      hidden: ({ parent }) => !parent?.showOperational,
    }),
    defineField({
      name: "operationalListHeading",
      title: "List heading",
      description: "Optional subheading above the bullet list.",
      type: "internationalizedArrayString",
      group: "operational",
      hidden: ({ parent }) => !parent?.showOperational,
    }),
    defineField({
      name: "operationalList",
      title: "List items",
      description: "Bulleted items, each a bold term followed by a description.",
      type: "array",
      group: "operational",
      hidden: ({ parent }) => !parent?.showOperational,
      of: [
        defineArrayMember({
          type: "object",
          name: "operationalListItem",
          fields: [
            defineField({
              name: "term",
              title: "Term (bold)",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "body",
              title: "Description",
              type: "internationalizedArrayText",
            }),
          ],
          preview: {
            select: { title: "term", subtitle: "body" },
            prepare: ({ title, subtitle }) => ({
              title: i18nValue(title),
              subtitle: i18nValue(subtitle),
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "operationalPrimaryCta",
      title: "Primary button",
      description: "Filled button (e.g. “Partner With BPI”).",
      type: "cta",
      group: "operational",
      hidden: ({ parent }) => !parent?.showOperational,
    }),
    defineField({
      name: "operationalSecondaryCta",
      title: "Secondary button",
      description: "Outlined button beside the primary (e.g. “Contact us”).",
      type: "cta",
      group: "operational",
      hidden: ({ parent }) => !parent?.showOperational,
    }),
    defineField({
      name: "operationalImage",
      title: "Image",
      description: "Full-width image below the text.",
      type: "imageWithAlt",
      group: "operational",
      hidden: ({ parent }) => !parent?.showOperational,
    }),

    // ─────────────────────────────────────────────────────── Being built ──
    // An editorial pipeline block: an eyebrow, a feature item (heading +
    // caption), then an image beside the remaining items + CTAs. Rendered with
    // SectorBeingBuiltSection.
    defineField({
      name: "showBeingBuilt",
      title: "Show “being built” section",
      type: "boolean",
      group: "beingBuilt",
      initialValue: false,
    }),
    defineField({
      name: "beingBuiltEyebrow",
      title: "Eyebrow",
      description: "Small label above the section (e.g. “Being Built”).",
      type: "internationalizedArrayString",
      group: "beingBuilt",
      hidden: ({ parent }) => !parent?.showBeingBuilt,
    }),
    defineField({
      name: "beingBuiltItems",
      title: "Items",
      description:
        "Each item can carry a heading, a light subtitle, and/or a rule-accented caption. The first item is featured at the top; the rest sit in the right column beside the image.",
      type: "array",
      group: "beingBuilt",
      hidden: ({ parent }) => !parent?.showBeingBuilt,
      of: [
        defineArrayMember({
          type: "object",
          name: "beingBuiltItem",
          fields: [
            defineField({
              name: "heading",
              title: "Heading",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "subtitle",
              title: "Subtitle (light)",
              type: "internationalizedArrayText",
            }),
            defineField({
              name: "body",
              title: "Caption (rule-accented)",
              type: "internationalizedArrayText",
            }),
          ],
          preview: {
            select: { title: "heading", subtitle: "body" },
            prepare: ({ title, subtitle }) => ({
              title: i18nValue(title),
              subtitle: i18nValue(subtitle),
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "beingBuiltImage",
      title: "Image",
      description: "Photo shown beside the right-hand items.",
      type: "imageWithAlt",
      group: "beingBuilt",
      hidden: ({ parent }) => !parent?.showBeingBuilt,
    }),
    defineField({
      name: "beingBuiltPrimaryCta",
      title: "Primary button",
      description: "Filled button (e.g. “Partner With BPI”).",
      type: "cta",
      group: "beingBuilt",
      hidden: ({ parent }) => !parent?.showBeingBuilt,
    }),
    defineField({
      name: "beingBuiltSecondaryCta",
      title: "Secondary button",
      description: "Outlined button beside the primary (e.g. “Contact us”).",
      type: "cta",
      group: "beingBuilt",
      hidden: ({ parent }) => !parent?.showBeingBuilt,
    }),

    // ────────────────────────────────────────────────────────── Highlight ──
    defineField({
      name: "showHighlight",
      title: "Show highlight section",
      type: "boolean",
      group: "highlight",
      initialValue: false,
    }),
    defineField({
      name: "highlightHeading",
      title: "Heading",
      description: "e.g. “What This Looks Like In Practice”.",
      type: "internationalizedArrayString",
      group: "highlight",
      hidden: ({ parent }) => !parent?.showHighlight,
    }),
    defineField({
      name: "highlightBody",
      title: "Body",
      description:
        "Supporting paragraph(s), shown first at regular weight. Separate paragraphs with a blank line.",
      type: "internationalizedArrayPortableText",
      group: "highlight",
      hidden: ({ parent }) => !parent?.showHighlight,
    }),
    defineField({
      name: "highlightStatement",
      title: "Emphasized statement",
      description:
        "The single takeaway line, rendered bold + italic below the body.",
      type: "internationalizedArrayText",
      group: "highlight",
      hidden: ({ parent }) => !parent?.showHighlight,
    }),
    defineField({
      name: "highlightImage",
      title: "Image",
      description:
        "Wide image below the text. Falls back to a Home/sector photo when empty.",
      type: "imageWithAlt",
      group: "highlight",
      hidden: ({ parent }) => !parent?.showHighlight,
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
            select: { title: "title", subtitle: "body" },
            prepare: ({ title, subtitle }) => ({
              title: i18nValue(title),
              subtitle: i18nValue(subtitle),
            }),
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
      type: "internationalizedArrayPortableText",
      group: "quote",
      hidden: ({ parent }) => !parent?.showQuote,
    }),
    defineField({
      name: "quoteCta",
      title: "Button",
      description: "Optional button below the lead (e.g. “Partner With BPI”).",
      type: "cta",
      group: "quote",
      hidden: ({ parent }) => !parent?.showQuote,
    }),
    defineField({
      name: "quoteText",
      title: "Quote",
      type: "internationalizedArrayPortableText",
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
            defineField({
              name: "initiative",
              title: "Initiative",
              description:
                "Link this row to its initiative. The initiative's cover image (or header image) is shown in the right column while the row is active. When unset, the section media / convergence graphic is shown.",
              type: "reference",
              to: [{ type: "initiative" }],
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "body",
              media: "initiative.coverImage",
            },
            prepare: ({ title, subtitle, media }) => ({
              title: i18nValue(title),
              subtitle: i18nValue(subtitle),
              media,
            }),
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
    select: { title: "title", subtitle: "subtitle" },
    prepare: ({ title, subtitle }) => ({
      title: i18nValue(title) || "(untitled sector)",
      subtitle: i18nValue(subtitle),
    }),
  },
});
