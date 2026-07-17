import { defineArrayMember, defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

export const initiative = defineType({
  name: "initiative",
  title: "Initiative",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "URL path under /initiatives. Click Generate to derive from the title.",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle (shown on the About page list)",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "tag",
      title: "Tag / label",
      type: "internationalizedArrayString",
      description:
        "Short custom label shown as the eyebrow on the initiative card (e.g. \"Initiative\", \"Partnership\", \"Research\").",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt / description",
      type: "internationalizedArrayText",
      description:
        "Short summary shown on the home and about page rows. Keep it under ~240 chars.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      description:
        "Used as the sort tiebreaker when two initiatives have the same Order — newest first.",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description:
        "Controls the display order on the home page and initiatives list. Lower numbers appear first (e.g. 1 first, 10 last). Leave blank to fall back to publish-date order.",
      validation: (Rule) => Rule.integer().min(0),
    }),
    defineField({
      name: "featured",
      title: "Featured (shows the FEATURED badge on the home page)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "hasDetailPage",
      title: "Has detail page",
      type: "boolean",
      description:
        "When ON, the row links to /initiatives/{slug} (or the External link if set). When OFF, the initiative shows in lists but isn't clickable — use for display-only cards that don't have a longer write-up yet.",
      initialValue: true,
    }),
    defineField({
      name: "coverImage",
      title: "Cover image (shown on hover in the section list)",
      type: "imageWithAlt",
    }),

    // ───────────────────────────────────────────── Detail page header ──
    defineField({
      name: "headerType",
      title: "Header type",
      description:
        "Layout of the detail-page hero. Editorial = two-tone title (left) + excerpt/buttons (right) over a full-bleed cover image. Type 1 = big title, subtitle and a button on the left beside a tall image on the right. Type 2 = split title — the first half on top, the subtitle and button under it, and the second half hung to the bottom right of the column, beside a square image. Type 3 = subtitle and button on top left, an oversized title dropped to the bottom, beside a tall image on the right. Type 4 = a small eyebrow (Header title) over a large two-tone headline (Header subtitle), indented right, with a full-bleed image below and no buttons.",
      type: "string",
      options: {
        list: [
          { title: "Editorial (default)", value: "editorial" },
          { title: "Type 1 — title + image", value: "type1" },
          { title: "Type 2 — split title + image", value: "type2" },
          { title: "Type 3 — copy top, big title bottom", value: "type3" },
          { title: "Type 4 — eyebrow + two-tone headline over a full-bleed image", value: "type4" },
        ],
        layout: "radio",
      },
      initialValue: "editorial",
    }),
    defineField({
      name: "headerTitle",
      title: "Header title (override)",
      description:
        "Short title shown in the hero (e.g. \"AMA\"). On Type 2 this is the first line only. Falls back to the Title when empty.",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "headerTitleTail",
      title: "Header title — offset line",
      description:
        "Type 2 only: the rest of the title, dropped below the button and pushed to the right edge of the column (e.g. Header title “PAHO Regional” + offset line “Supply Hub”). Leave empty for a single-line title.",
      type: "internationalizedArrayString",
      hidden: ({ parent }) => parent?.headerType !== "type2",
    }),
    defineField({
      name: "headerSubtitle",
      title: "Header subtitle",
      description:
        "Line shown beside the header title — under it on Type 1 / 2, above it on Type 3. On Type 4 this IS the big headline: it renders in the page accent colour, and any phrase you wrap in **double asterisks** flips to white. Falls back to the Excerpt when empty.",
      type: "internationalizedArrayText",
    }),
    defineField({
      name: "headerImage",
      title: "Header image",
      description:
        "Image beside the title on the Type 1 / 2 / 3 headers. Falls back to the Cover image when empty.",
      type: "imageWithAlt",
    }),
    defineField({
      name: "headerPrimaryCta",
      title: "Header — primary button",
      description: "Filled button (defaults to “Partner With BPI” → /contact).",
      type: "cta",
    }),
    defineField({
      name: "headerSecondaryCta",
      title: "Header — secondary button",
      description: "Optional outlined button beside the primary.",
      type: "cta",
    }),
    defineField({
      name: "showDefaultSections",
      title: "Show standard sections",
      description:
        "The body, quote and “Why It Matters” sections. Turn OFF to skip them and let the custom sections (What This Is / Key Developments) carry the page. The blog / careers / call-to-action closers below have their own toggles.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "showBlog",
      title: "Show “Latest from BPI” blog section",
      description: "The newest posts, shown near the bottom of the page.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "showCareers",
      title: "Show Careers section",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "showCta",
      title: "Show call-to-action section",
      type: "boolean",
      initialValue: true,
    }),

    defineField({
      name: "externalLink",
      title: "External link (optional)",
      type: "url",
      description:
        "If set, the row links here instead of /initiatives/{slug}. Takes precedence over the Has detail page toggle.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayPortableText",
      description:
        "Full detail content shown on the /initiatives/{slug} page. Only used when Has detail page is ON.",
    }),
    defineField({
      name: "pageColor",
      title: "Detail page colour",
      type: "hexColor",
      description:
        "Base colour for the whole detail page (hero, section bands, footer). Lighter shades are derived automatically. Pick a deep colour for best contrast with the white text. Defaults to navy blue.",
      initialValue: "#0B2F64",
    }),

    // ─────────────────────────────────────────────────── Quote section ──
    defineField({
      name: "showQuote",
      title: "Show quote section",
      type: "boolean",
      description:
        "Toggle the pull-quote section (with portrait) on the detail page.",
      initialValue: false,
    }),
    defineField({
      name: "quoteSupporting",
      title: "Quote — supporting paragraph",
      type: "internationalizedArrayText",
      description: "Small intro text shown top-left of the quote section.",
    }),
    defineField({
      name: "quoteText",
      title: "Quote — pull quote",
      type: "internationalizedArrayText",
      description:
        "The large quote. Wrap the phrase you want highlighted white in **double asterisks**, e.g. \"Barbados sees **Nigeria as a strategic partner** in advancing…\".",
    }),
    defineField({
      name: "quoteAttribution",
      title: "Quote — attribution",
      type: "internationalizedArrayString",
      description: 'e.g. "Barbados’ Senior Minister of Health Dr Jerome Walcott".',
    }),
    defineField({
      name: "quoteImage",
      title: "Quote — portrait image",
      type: "imageWithAlt",
    }),

    // ────────────────────────────────────────────────── Why It Matters ──
    defineField({
      name: "whyMattersHeading",
      title: "Why It Matters — heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "whyMattersBody",
      title: "Why It Matters — body",
      type: "internationalizedArrayText",
    }),
    defineField({
      name: "whyMattersImage",
      title: "Why It Matters — image",
      type: "imageWithAlt",
    }),

    // ──────────────────────────────────────────── Further Projected Impact ──
    defineField({
      name: "impactHeading",
      title: "Projected Impact — heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "impactBody",
      title: "Projected Impact — body",
      type: "internationalizedArrayText",
    }),
    defineField({
      name: "impactStats",
      title: "Projected Impact — stat cards",
      type: "array",
      description:
        "Up to ~4 cards. Card colours cycle automatically (white, light blue, green).",
      of: [
        defineArrayMember({
          type: "object",
          name: "impactStat",
          fields: [
            defineField({
              name: "value",
              title: "Value (e.g. \"USD $29 Million\", \"200+\")",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "internationalizedArrayString",
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
            prepare: ({ title, subtitle }) => ({
              title: i18nValue(title),
              subtitle: i18nValue(subtitle),
            }),
          },
        }),
      ],
    }),

    // ─────────────────────────────── "What This Is" + Key Metrics section ──
    defineField({
      name: "showWhatThisIs",
      title: "Show “What This Is” + Key Metrics section",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "whatThisIsLayout",
      title: "What This Is — layout",
      description:
        "Stacked = heading above the body, full width, at body-copy size. Stacked (large lead) = the same, but the body reads as a large statement instead. Heading beside body = heading on the left with the body as a large italic lead on the right. Image beside body = heading across the top, image on the left, body + button on the right (on a deeper blue band). A Key Metrics row, if any, sits under all four.",
      type: "string",
      options: {
        list: [
          { title: "Stacked (default)", value: "stacked" },
          { title: "Stacked (large lead)", value: "stackedLead" },
          { title: "Heading beside body (lead style)", value: "beside" },
          { title: "Image beside body", value: "imageBeside" },
        ],
        layout: "radio",
      },
      initialValue: "stacked",
      hidden: ({ parent }) => !parent?.showWhatThisIs,
    }),
    defineField({
      name: "whatThisIsImage",
      title: "What This Is — image",
      description:
        "Only used by the “Image beside body” layout. Falls back to the Cover image.",
      type: "imageWithAlt",
      hidden: ({ parent }) =>
        !parent?.showWhatThisIs || parent?.whatThisIsLayout !== "imageBeside",
    }),
    defineField({
      name: "whatThisIsCta",
      title: "What This Is — button",
      description:
        "Only used by the “Image beside body” layout. Defaults to “Partner With BPI” → /contact.",
      type: "cta",
      hidden: ({ parent }) =>
        !parent?.showWhatThisIs || parent?.whatThisIsLayout !== "imageBeside",
    }),
    defineField({
      name: "whatThisIsHeading",
      title: "What This Is — heading",
      type: "internationalizedArrayString",
      initialValue: [
        { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value: "What This Is" },
      ],
      hidden: ({ parent }) => !parent?.showWhatThisIs,
    }),
    defineField({
      name: "whatThisIsBody",
      title: "What This Is — body",
      description: "One or more paragraphs, separated by a blank line.",
      type: "internationalizedArrayText",
      hidden: ({ parent }) => !parent?.showWhatThisIs,
    }),
    defineField({
      name: "metricsHeading",
      title: "Key Metrics — heading",
      type: "internationalizedArrayString",
      initialValue: [
        { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value: "Key Metrics" },
      ],
      hidden: ({ parent }) => !parent?.showWhatThisIs,
    }),
    defineField({
      name: "keyMetrics",
      title: "Key Metrics — items",
      description: "A row of figures (value + label), separated by dividers.",
      type: "array",
      hidden: ({ parent }) => !parent?.showWhatThisIs,
      of: [
        defineArrayMember({
          type: "object",
          name: "keyMetric",
          fields: [
            defineField({
              name: "value",
              title: "Value (e.g. \"$31.3m\", \"200+\")",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "note",
              title: "Small note beside the value (optional)",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "internationalizedArrayString",
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
            prepare: ({ title, subtitle }) => ({
              title: i18nValue(title),
              subtitle: i18nValue(subtitle),
            }),
          },
        }),
      ],
    }),

    // ──────────────────── "Why Barbados" + Ecosystem Approach section ──
    defineField({
      name: "showWhyBarbados",
      title: "Show “Why Barbados” + Ecosystem Approach section",
      description:
        "Pale-blue band: heading + bullets, then a wide image sitting flush on a navy panel with a closing heading and paragraph.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "whyBarbadosHeading",
      title: "Why Barbados — heading",
      type: "internationalizedArrayString",
      initialValue: [
        { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value: "Why Barbados" },
      ],
      hidden: ({ parent }) => !parent?.showWhyBarbados,
    }),
    defineField({
      name: "whyBarbadosBody",
      title: "Why Barbados — bullets",
      description: "One bullet per line.",
      type: "internationalizedArrayText",
      hidden: ({ parent }) => !parent?.showWhyBarbados,
    }),
    defineField({
      name: "whyBarbadosCta",
      title: "Why Barbados — button",
      description: "Defaults to “Partner With BPI” → /contact.",
      type: "cta",
      hidden: ({ parent }) => !parent?.showWhyBarbados,
    }),
    defineField({
      name: "whyBarbadosImage",
      title: "Why Barbados — wide image",
      description:
        "Sits between the bullets and the navy panel. Falls back to the Cover image when empty.",
      type: "imageWithAlt",
      hidden: ({ parent }) => !parent?.showWhyBarbados,
    }),
    defineField({
      name: "ecosystemHeading",
      title: "Ecosystem Approach — heading",
      type: "internationalizedArrayString",
      initialValue: [
        { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value: "The Ecosystem Approach" },
      ],
      hidden: ({ parent }) => !parent?.showWhyBarbados,
    }),
    defineField({
      name: "ecosystemBody",
      title: "Ecosystem Approach — body",
      type: "internationalizedArrayText",
      hidden: ({ parent }) => !parent?.showWhyBarbados,
    }),
    defineField({
      name: "ecosystemCta",
      title: "Ecosystem Approach — button",
      description: "Defaults to “Partner With BPI” → /contact.",
      type: "cta",
      hidden: ({ parent }) => !parent?.showWhyBarbados,
    }),

    // ─────────────────── "Current Status" + closing Next Steps note ──
    // Distinct from the `nextSteps*` fields further down — those render the
    // navy bullets card (PAHO / PVAC). This block's closing note is the large
    // italic paragraph from the EU PharmaNext design.
    defineField({
      name: "showCurrentStatus",
      title: "Show “Current Status” section",
      description:
        "Pale-blue band: heading, image left, a large lead + smaller paragraph + two buttons right, then an optional closing note in large italic type.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "currentStatusHeading",
      title: "Current Status — heading",
      type: "internationalizedArrayString",
      initialValue: [
        { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value: "Current Status" },
      ],
      hidden: ({ parent }) => !parent?.showCurrentStatus,
    }),
    defineField({
      name: "currentStatusImage",
      title: "Current Status — image",
      description: "Sits left of the copy. Falls back to the Cover image when empty.",
      type: "imageWithAlt",
      hidden: ({ parent }) => !parent?.showCurrentStatus,
    }),
    defineField({
      name: "currentStatusLead",
      title: "Current Status — lead",
      description: "The large opening statement, e.g. “As of June 2026, …”.",
      type: "internationalizedArrayText",
      hidden: ({ parent }) => !parent?.showCurrentStatus,
    }),
    defineField({
      name: "currentStatusBody",
      title: "Current Status — supporting paragraph",
      description: "Smaller detail under the lead.",
      type: "internationalizedArrayText",
      hidden: ({ parent }) => !parent?.showCurrentStatus,
    }),
    defineField({
      name: "currentStatusPrimaryCta",
      title: "Current Status — primary button",
      description: "Filled button in the page colour (defaults to “Partner with us” → /contact).",
      type: "cta",
      hidden: ({ parent }) => !parent?.showCurrentStatus,
    }),
    defineField({
      name: "currentStatusSecondaryCta",
      title: "Current Status — secondary button",
      description: "Optional outlined button beside the primary (e.g. “Contact us”).",
      type: "cta",
      hidden: ({ parent }) => !parent?.showCurrentStatus,
    }),
    defineField({
      name: "outlookHeading",
      title: "Next Steps (closing note) — heading",
      description:
        "The quiet closing block under Current Status. Separate from the “Next Steps” bullets card further down.",
      type: "internationalizedArrayString",
      initialValue: [
        { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value: "Next Steps" },
      ],
      hidden: ({ parent }) => !parent?.showCurrentStatus,
    }),
    defineField({
      name: "outlookBody",
      title: "Next Steps (closing note) — body",
      description: "One paragraph, shown in large italic type.",
      type: "internationalizedArrayText",
      hidden: ({ parent }) => !parent?.showCurrentStatus,
    }),

    // ──────────────────────────────────────────── Key Developments section ──
    defineField({
      name: "showDevelopments",
      title: "Show “Key Developments” section",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "developmentsLayout",
      title: "Key Developments — layout",
      description:
        "Image beside bullets = heading across the top, tall image on the left, bullets + button on the right. Heading beside bullets = heading on the left with the bullets + button on the right, and a wide image below the pair. No image = the same pair with no image at all.",
      type: "string",
      options: {
        list: [
          { title: "Image beside bullets (default)", value: "imageBeside" },
          { title: "Heading beside bullets, image below", value: "imageBelow" },
          { title: "Heading beside bullets, no image", value: "noImage" },
        ],
        layout: "radio",
      },
      initialValue: "imageBeside",
      hidden: ({ parent }) => !parent?.showDevelopments,
    }),
    defineField({
      name: "developmentsHeading",
      title: "Key Developments — heading",
      type: "internationalizedArrayString",
      initialValue: [
        { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value: "Key Developments" },
      ],
      hidden: ({ parent }) => !parent?.showDevelopments,
    }),
    defineField({
      name: "developmentsImage",
      title: "Key Developments — image",
      type: "imageWithAlt",
      hidden: ({ parent }) => !parent?.showDevelopments,
    }),
    defineField({
      name: "developmentsBody",
      title: "Key Developments — bullets",
      description: "One bullet per line.",
      type: "internationalizedArrayText",
      hidden: ({ parent }) => !parent?.showDevelopments,
    }),
    defineField({
      name: "developmentsCta",
      title: "Key Developments — button",
      description: "Defaults to “Partner With BPI” → /contact.",
      type: "cta",
      hidden: ({ parent }) => !parent?.showDevelopments,
    }),

    // ─────────────────────────────────────────────── Next Steps section ──
    defineField({
      name: "showNextSteps",
      title: "Show “Next Steps” section",
      description:
        "A card in the page colour (heading left, bullets + button right), on the same light-blue band as Key Developments — it docks directly under the Key Developments image when both are on.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "nextStepsHeading",
      title: "Next Steps — heading",
      type: "internationalizedArrayString",
      initialValue: [
        { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value: "Next Steps" },
      ],
      hidden: ({ parent }) => !parent?.showNextSteps,
    }),
    defineField({
      name: "nextStepsBody",
      title: "Next Steps — bullets",
      description: "One bullet per line.",
      type: "internationalizedArrayText",
      hidden: ({ parent }) => !parent?.showNextSteps,
    }),
    defineField({
      name: "showNextStepsCta",
      title: "Next Steps — show button",
      description: "Turn off for a card that is bullets only.",
      type: "boolean",
      initialValue: true,
      hidden: ({ parent }) => !parent?.showNextSteps,
    }),
    defineField({
      name: "nextStepsCta",
      title: "Next Steps — button",
      description: "Defaults to “Partner With BPI” → /contact.",
      type: "cta",
      hidden: ({ parent }) => !parent?.showNextSteps || parent?.showNextStepsCta === false,
    }),

    // ───────────────────────────────────────────────── Roadmap section ──
    // Named for its shape, not its copy: the headings are free text. PVAC uses
    // it as “What We Are Building / Next Steps” — distinct from both the
    // `nextSteps*` bullets card and the `outlook*` note under Current Status.
    defineField({
      name: "showRoadmap",
      title: "Show Roadmap section",
      description:
        "Mid-blue band that closes the story: an eyebrow + heading on the left, and a single italic statement, a button and a wide image on the right.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "roadmapEyebrow",
      title: "Roadmap — eyebrow",
      description: "Small line above the heading.",
      type: "internationalizedArrayString",
      initialValue: [
        { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value: "What We Are Building" },
      ],
      hidden: ({ parent }) => !parent?.showRoadmap,
    }),
    defineField({
      name: "roadmapHeading",
      title: "Roadmap — heading",
      type: "internationalizedArrayString",
      initialValue: [
        { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value: "Next Steps" },
      ],
      hidden: ({ parent }) => !parent?.showRoadmap,
    }),
    defineField({
      name: "roadmapStatement",
      title: "Roadmap — statement",
      description: "The single italic line, set above the rule and the button.",
      type: "internationalizedArrayText",
      hidden: ({ parent }) => !parent?.showRoadmap,
    }),
    defineField({
      name: "roadmapCta",
      title: "Roadmap — button",
      description: "Defaults to “Partner With BPI” → /contact.",
      type: "cta",
      hidden: ({ parent }) => !parent?.showRoadmap,
    }),
    defineField({
      name: "roadmapImage",
      title: "Roadmap — wide image",
      description: "Sits under the button. Falls back to the Cover image when empty.",
      type: "imageWithAlt",
      hidden: ({ parent }) => !parent?.showRoadmap,
    }),

    // ────────────────────────────────── Phased Approach + Strategic Relevance ──
    defineField({
      name: "showPhases",
      title: "Show “Phased Approach” section",
      description:
        "Dark band: heading, a row of phase cards (colours cycle white → light blue → green), a wide image, then a closing statement.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "phasesHeading",
      title: "Phased Approach — heading",
      type: "internationalizedArrayString",
      initialValue: [
        { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value: "Phased Approach" },
      ],
      hidden: ({ parent }) => !parent?.showPhases,
    }),
    defineField({
      name: "phases",
      title: "Phased Approach — cards",
      description:
        "Up to ~3 cards. Card colours cycle automatically (white, light blue, green).",
      type: "array",
      hidden: ({ parent }) => !parent?.showPhases,
      of: [
        defineArrayMember({
          type: "object",
          name: "phaseCard",
          fields: [
            defineField({
              name: "title",
              title: "Title (e.g. “Phase 1”)",
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
    defineField({
      name: "phasesImage",
      title: "Phased Approach — wide image",
      description: "Sits under the cards. Falls back to the Cover image when empty.",
      type: "imageWithAlt",
      hidden: ({ parent }) => !parent?.showPhases,
    }),
    defineField({
      name: "relevanceHeading",
      title: "Strategic Relevance — heading",
      type: "internationalizedArrayString",
      initialValue: [
        { _key: "en", _type: "internationalizedArrayStringValue", language: "en", value: "Strategic Relevance" },
      ],
      hidden: ({ parent }) => !parent?.showPhases,
    }),
    defineField({
      name: "relevanceBody",
      title: "Strategic Relevance — body",
      type: "internationalizedArrayText",
      hidden: ({ parent }) => !parent?.showPhases,
    }),
    defineField({
      name: "relevanceCta",
      title: "Strategic Relevance — button",
      description: "Defaults to “Partner With BPI” → /contact.",
      type: "cta",
      hidden: ({ parent }) => !parent?.showPhases,
    }),
  ],
  orderings: [
    {
      title: "Manual order (low → high)",
      name: "orderAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "publishedAt", direction: "desc" },
      ],
    },
    {
      title: "Published date — newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Featured first, then newest",
      name: "featuredDesc",
      by: [
        { field: "featured", direction: "desc" },
        { field: "publishedAt", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      featured: "featured",
      media: "coverImage.asset",
    },
    prepare: ({ title, subtitle, featured, media }) => ({
      title: featured ? `★ ${i18nValue(title) ?? ""}` : i18nValue(title),
      subtitle: subtitle
        ? new Date(subtitle as string).toISOString().slice(0, 10)
        : undefined,
      media,
    }),
  },
});
