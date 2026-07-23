import { defineArrayMember, defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

export const priority = defineType({
  name: "priority",
  title: "Strategic priority",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "header", title: "Header" },
    { name: "overview", title: "Overview" },
    { name: "points", title: "Key points" },
    { name: "stats", title: "Stats" },
    { name: "quote", title: "Quote" },
    { name: "practice", title: "In practice" },
    { name: "practiceDetail", title: "Practice detail" },
    { name: "practiceTabs", title: "Practice tabs" },
    { name: "motion", title: "In motion" },
    { name: "incentives", title: "Investment incentives" },
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
        "URL path under /priorities. Click Generate to derive from the title.",
      options: { source: "title", maxLength: 96 },
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      description:
        "Short line shown under the title on the list card and the detail hero.",
      type: "internationalizedArrayText",
      group: "content",
    }),
    defineField({
      name: "order",
      title: "Order",
      description:
        "Controls the display order in the priorities list. Lower numbers first. Leave blank to fall back to title order.",
      type: "number",
      group: "content",
    }),

    // ───────────────────────────────────────────────────────────── Header ──
    defineField({
      name: "heroLayout",
      title: "Hero type",
      description:
        "How the detail-page header is laid out. 'Image + title card' matches the default design; 'Split' places the title beside the image; 'Title only' drops the image; 'Feature statement' shows the title as an eyebrow above a large statement, with a full-bleed image flush to the bottom.",
      type: "string",
      group: "header",
      options: {
        list: [
          { title: "Image + title card", value: "imageCard" },
          { title: "Split (title beside image)", value: "split" },
          { title: "Title only (no image)", value: "textOnly" },
          { title: "Feature statement (eyebrow + statement + full-bleed image)", value: "feature" },
          { title: "Cover (title + subtitle beside it + full-bleed image)", value: "cover" },
          { title: "Feature split (italic headline + subtitle, image beside)", value: "featureSplit" },
        ],
        layout: "radio",
      },
      initialValue: "imageCard",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      description:
        "Image shown in the detail-page header. Falls back to the Home page's narrative image when empty. Ignored when Hero type is 'Title only'.",
      type: "imageWithAlt",
      group: "header",
      hidden: ({ parent }) => parent?.heroLayout === "textOnly",
    }),

    // Feature-statement hero headline — a large statement with an italic
    // emphasis phrase in the middle (only used when Hero type = Feature).
    defineField({
      name: "heroHeadlineLead",
      title: "Feature headline — lead",
      description:
        "Opening of the large hero statement. Only used when Hero type is 'Feature statement'.",
      type: "internationalizedArrayText",
      group: "header",
      hidden: ({ parent }) =>
        parent?.heroLayout !== "feature" &&
        parent?.heroLayout !== "featureSplit",
    }),
    defineField({
      name: "heroHeadlineEmphasis",
      title: "Feature headline — emphasis (italic)",
      description: "The emphasised phrase, shown in italic within the statement.",
      type: "internationalizedArrayString",
      group: "header",
      hidden: ({ parent }) =>
        parent?.heroLayout !== "feature" &&
        parent?.heroLayout !== "featureSplit",
    }),
    defineField({
      name: "heroHeadlineTrail",
      title: "Feature headline — trailing",
      description: "Text after the emphasised phrase.",
      type: "internationalizedArrayText",
      group: "header",
      hidden: ({ parent }) =>
        parent?.heroLayout !== "feature" &&
        parent?.heroLayout !== "featureSplit",
    }),
    defineField({
      name: "pageColor",
      title: "Page color (dark)",
      description:
        "Dark background for the detail-page hero. Also tints the footer on this page.",
      type: "hexColor",
      group: "header",
      initialValue: "#0B2F64",
    }),
    defineField({
      name: "sectionBgColor",
      title: "Section background color (light)",
      description:
        "Light canvas behind the In practice, In motion, and Quote sections.",
      type: "hexColor",
      group: "header",
      initialValue: "#E7F9FF",
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
      type: "internationalizedArrayPortableText",
      group: "overview",
      hidden: ({ parent }) => parent?.showOverview === false,
    }),

    // ──────────────────────────────────────────────────────── Key points ──
    defineField({
      name: "showPoints",
      title: "Show key-points section",
      type: "boolean",
      group: "points",
      initialValue: false,
    }),
    defineField({
      name: "pointsHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "points",
      hidden: ({ parent }) => !parent?.showPoints,
    }),
    defineField({
      name: "points",
      title: "Points",
      type: "array",
      group: "points",
      hidden: ({ parent }) => !parent?.showPoints,
      of: [
        defineArrayMember({
          type: "object",
          name: "point",
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
    // A spotlight quote on a deep-navy card: eyebrow + heading on the left; a
    // lead paragraph, pull-quote, and attribution (portrait, name, role,
    // socials) on the right. Socials + a portrait fallback come from the Home
    // document's leader fields when not set here.
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
      description: "Small label above the heading, e.g. “What We Are Building”.",
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
      description: "Shown under the name, e.g. “Senior Minister”.",
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

    // ────────────────────────────────────────────────────── In practice ──
    // A statement section: a rich-text statement (with an optional blue
    // "Accent" phrase), a rich-text body below it, two buttons, and a wide
    // image (sourced from the Home page's editor-managed photography).
    defineField({
      name: "showPractice",
      title: "Show “in practice” section",
      type: "boolean",
      group: "practice",
      initialValue: false,
    }),
    defineField({
      name: "practiceEyebrow",
      title: "Eyebrow",
      description:
        "Small label above the statement, e.g. “What This Looks Like In Practice”.",
      type: "internationalizedArrayString",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practiceStatement",
      title: "Statement",
      description:
        "The full statement, as rich text. Use the “Accent (blue)” mark in the toolbar to emphasise a phrase in blue.",
      type: "internationalizedArrayPortableText",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),

    // Legacy statement fields — superseded by the single rich-text "Statement"
    // above. Kept only so pre-migration content still renders; edit the
    // Statement field instead.
    defineField({
      name: "practiceStatementLead",
      title: "Statement — lead (legacy)",
      description:
        "Deprecated — use the rich-text “Statement” field above instead.",
      type: "internationalizedArrayText",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practiceStatementHighlight",
      title: "Statement — highlight (legacy)",
      description:
        "Deprecated — use the rich-text “Statement” field above with the Accent mark.",
      type: "internationalizedArrayString",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practiceStatementTrail",
      title: "Statement — trailing (legacy)",
      description:
        "Deprecated — use the rich-text “Statement” field above instead.",
      type: "internationalizedArrayText",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practiceBody",
      title: "Body",
      description:
        "Rich-text paragraph(s) shown below the statement (in black). Optional.",
      type: "internationalizedArrayPortableText",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practicePrimaryCta",
      title: "Primary button",
      type: "cta",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),
    defineField({
      name: "practiceSecondaryCta",
      title: "Secondary button",
      type: "cta",
      group: "practice",
      hidden: ({ parent }) => !parent?.showPractice,
    }),

    // ─────────────────────────────────────────────────── Practice detail ──
    // "What this looks like in practice" — a heading + square image on the
    // left, body paragraphs (split on blank lines) + a CTA on the right.
    defineField({
      name: "showPracticeDetail",
      title: "Show “practice detail” section",
      type: "boolean",
      group: "practiceDetail",
      initialValue: false,
    }),
    defineField({
      name: "practiceDetailHeading",
      title: "Heading",
      description: "e.g. “What This Looks Like In Practice”.",
      type: "internationalizedArrayString",
      group: "practiceDetail",
      hidden: ({ parent }) => !parent?.showPracticeDetail,
    }),
    defineField({
      name: "practiceDetailBody",
      title: "Body",
      description:
        "Body paragraphs. Separate paragraphs with a blank line — each becomes its own spaced block.",
      type: "internationalizedArrayPortableText",
      group: "practiceDetail",
      hidden: ({ parent }) => !parent?.showPracticeDetail,
    }),
    defineField({
      name: "practiceDetailImage",
      title: "Image",
      description:
        "Square image on the left. Falls back to a Home page photo when empty.",
      type: "imageWithAlt",
      group: "practiceDetail",
      hidden: ({ parent }) => !parent?.showPracticeDetail,
    }),
    defineField({
      name: "practiceDetailCta",
      title: "Button",
      type: "cta",
      group: "practiceDetail",
      hidden: ({ parent }) => !parent?.showPracticeDetail,
    }),

    // ─────────────────────────────────────────────────────── Practice tabs ──
    // A heading + lead + large statement, then an auto-cycling tabbed panel
    // where each tab has body paragraphs and an optional bullet list.
    defineField({
      name: "showPracticeTabs",
      title: "Show “practice tabs” section",
      type: "boolean",
      group: "practiceTabs",
      initialValue: false,
    }),
    defineField({
      name: "practiceTabsHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "practiceTabs",
      hidden: ({ parent }) => !parent?.showPracticeTabs,
    }),
    defineField({
      name: "practiceTabsLead",
      title: "Lead paragraph",
      description: "Small intro paragraph above the statement.",
      type: "internationalizedArrayPortableText",
      group: "practiceTabs",
      hidden: ({ parent }) => !parent?.showPracticeTabs,
    }),
    defineField({
      name: "practiceTabsStatement",
      title: "Statement",
      description: "Large statement shown above the tabs.",
      type: "internationalizedArrayText",
      group: "practiceTabs",
      hidden: ({ parent }) => !parent?.showPracticeTabs,
    }),
    defineField({
      name: "practiceTabsTrail",
      title: "Trailing paragraph",
      description: "Optional small paragraph shown below the statement.",
      type: "internationalizedArrayPortableText",
      group: "practiceTabs",
      hidden: ({ parent }) => !parent?.showPracticeTabs,
    }),
    defineField({
      name: "practiceTabsItems",
      title: "Tabs",
      description: "Each tab auto-cycles. Body paragraphs are split on blank lines; each bullet goes on its own line.",
      type: "array",
      group: "practiceTabs",
      hidden: ({ parent }) => !parent?.showPracticeTabs,
      of: [
        defineArrayMember({
          type: "object",
          name: "practiceTab",
          fields: [
            defineField({
              name: "label",
              title: "Tab label",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "body",
              title: "Body",
              description: "Paragraphs, separated by a blank line.",
              type: "internationalizedArrayText",
            }),
            defineField({
              name: "bullets",
              title: "Bullet list",
              description: "One bullet per line (optional).",
              type: "internationalizedArrayText",
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "body" },
            prepare: ({ title, subtitle }) => ({
              title: i18nValue(title),
              subtitle: i18nValue(subtitle),
            }),
          },
        }),
      ],
    }),

    // ───────────────────────────────────────────────────────── In motion ──
    // A stack of live initiatives that auto-cycle (the active one lifts into a
    // white card with a progress ring), beside an editor-supplied image/video
    // (or the convergence graphic when no media is set).
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
      title: "Right-column media (image or video)",
      description:
        "Media shown in the right column. Flip the “Type” radio to Image or Video — videos should be uploaded via the Cloudflare R2 URL field so they stay off Sanity's bandwidth. When empty, the convergence graphic is shown (dark tone falls back to a Home photo).",
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
            select: { title: "title", subtitle: "body" },
            prepare: ({ title, subtitle }) => ({
              title: i18nValue(title),
              subtitle: i18nValue(subtitle),
            }),
          },
        }),
      ],
    }),

    // ──────────────────────────────────────────── Investment incentives ──
    // A wide image/video, a heading over a grey lead, then a three-across grid
    // of incentive paragraphs. Reuses the same block as the Investors page and
    // can be switched on per priority.
    defineField({
      name: "showIncentives",
      title: "Show “investment incentives” section",
      type: "boolean",
      group: "incentives",
      initialValue: false,
    }),
    defineField({
      name: "incentivesImage",
      title: "Media (image or video, above the heading)",
      description:
        "Wide media shown above the heading. Flip the “Type” radio to Image or Video (upload videos via the Cloudflare R2 URL field).",
      type: "imageWithAlt",
      group: "incentives",
      hidden: ({ parent }) => !parent?.showIncentives,
    }),
    defineField({
      name: "incentivesHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "incentives",
      hidden: ({ parent }) => !parent?.showIncentives,
    }),
    defineField({
      name: "incentivesLead",
      title: "Lead",
      type: "internationalizedArrayPortableText",
      group: "incentives",
      hidden: ({ parent }) => !parent?.showIncentives,
    }),
    defineField({
      name: "incentivesItems",
      title: "Incentives",
      description: "Laid out three across; six reads best.",
      type: "array",
      of: [defineArrayMember({ type: "investorNote" })],
      group: "incentives",
      hidden: ({ parent }) => !parent?.showIncentives,
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
      title: i18nValue(title) || "(untitled priority)",
      subtitle: i18nValue(subtitle),
    }),
  },
});
